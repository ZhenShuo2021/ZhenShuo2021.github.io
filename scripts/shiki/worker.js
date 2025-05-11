const path = require("node:path");
const { Worker, parentPort } = require("node:worker_threads");
const fs = require("node:fs").promises;
const { collectHtmlFiles } = require("./file-collector");

const MESSAGE_TYPES = {
  READY: "ready",
  PROCESS: "process",
  COMPLETED: "completed",
  EXIT: "exit",
  ERROR: "error",
};

class MainThreadManager {
  constructor(config, workerArgs = []) {
    this.config = config;
    this.workerArgs = workerArgs;
    this.targets = config.DEV ? config.TARGETS_DEV : config.TARGETS;
    this.mainScriptPath = path.resolve(__dirname, "index.js");
    this.processedFiles = new Map();
    this.recordFilePath = path.join(__dirname, ".processed-files.json");
    this.workers = [];
    this.totalProcessed = 0;
    this.activeWorkers = 0;
    this.startTime = Date.now();
  }

  async initialize() {
    await this.loadProcessedRecords();
  }

  async loadProcessedRecords() {
    try {
      const data = await fs.readFile(this.recordFilePath, "utf8");
      const records = JSON.parse(data);

      for (const [file, timestamp] of Object.entries(records)) {
        this.processedFiles.set(file, timestamp);
      }

      if (this.config.DEBUG) {
        console.log(`Loaded records for ${this.processedFiles.size} files`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Failed to load processed files records:", error.stack);
      }
    }
  }

  async saveProcessedRecords() {
    try {
      const records = Object.fromEntries(this.processedFiles);

      await fs.writeFile(this.recordFilePath, JSON.stringify(records, null, 2), "utf8");
      if (this.config.DEBUG) {
        console.log(`Saved records for ${Object.keys(records).length} processed files`);
      }
    } catch (error) {
      console.error("Failed to save processed files records:", error.stack);
    }
  }

  async runMainThread() {
    console.log("Starting HTML syntax highlighting process in:");
    for (const target of this.targets) {
      const excludeInfo = target.EXCLUDE?.length ? ` (excluding: ${target.EXCLUDE.join(", ")})` : "";
      console.log(`- ${target.DIR}${excludeInfo}`);
    }

    const files = await collectHtmlFiles(this.targets);
    if (!files || files.length === 0) {
      console.log("No HTML files found to process.");
      return;
    }

    const filteredFiles = await this._filterFile(files);

    if (filteredFiles.length === 0) {
      console.log("No HTML files need processing.");
      return;
    }

    const workerCount = this._calculateOptimalWorkerCount(filteredFiles.length);
    if (!this.config.QUIET) {
      console.log(`Found ${filteredFiles.length} HTML files. Starting with ${workerCount} workers.`);
    }

    return this._startWorkerProcessing(filteredFiles, workerCount);
  }

  async _filterFile(files) {
    const filteredFiles = [];

    await Promise.all(
      files.map(async (filePath) => {
        try {
          const stats = await fs.stat(filePath);
          const lastModified = stats.mtimeMs;
          if (!this.processedFiles.has(filePath) || this.processedFiles.get(filePath) < lastModified) {
            filteredFiles.push(filePath);
          }
        } catch (error) {
          console.error(`Error checking file status: ${filePath}`, error.stack);
          filteredFiles.push(filePath);
        }
      }),
    );

    return filteredFiles;
  }

  _calculateOptimalWorkerCount(fileCount) {
    const cpuCount = require("node:os").cpus().length;
    const baseWorkerCount = Math.min(this.config.THREAD_COUNT, Math.ceil(fileCount / 10), cpuCount - 1 || 1);
    return Math.max(1, baseWorkerCount);
  }

  _startWorkerProcessing(files, workerCount) {
    const jobQueue = [...files];
    this.activeWorkers = workerCount;

    return new Promise((resolve) => {
      for (let i = 0; i < workerCount; i++) {
        this._createAndSetupWorker(i, jobQueue, resolve);
      }
    });
  }

  _createAndSetupWorker(workerId, jobQueue, resolvePromise) {
    const processedFilesArray = Array.from(this.processedFiles.entries());

    const worker = new Worker(this.mainScriptPath, {
      workerData: {
        workerId,
        isWorker: true,
        workerThreadConfig: this.config,
        cachedProcessedFiles: processedFilesArray,
      },
      argv: this.workerArgs,
    });

    worker.on("message", (message) => {
      this._handleWorkerMessage(message, worker, jobQueue);
      if (message.type === MESSAGE_TYPES.COMPLETED) {
        this.totalProcessed += message.count;
      }
    });

    worker.on("error", (error) => {
      console.error(`[Worker ${workerId}] encountered an error:`, error.stack);
    });

    worker.on("exit", (code) => {
      this._handleWorkerExit(workerId, code, resolvePromise);
    });

    this.workers.push(worker);
  }

  _handleWorkerExit(workerId, code, resolvePromise) {
    if (this.config.DEBUG && code !== 0) {
      console.warn(`[Worker ${workerId}] exited with code ${code}`);
    }

    this.activeWorkers--;

    if (this.activeWorkers === 0) {
      console.log(
        `Process completed. Modified ${this.totalProcessed} files using ${Date.now() - this.startTime} ms`,
      );
      this.saveProcessedRecords().then(resolvePromise);
    }
  }

  _handleWorkerMessage(message, worker, jobQueue) {
    switch (message.type) {
      case MESSAGE_TYPES.COMPLETED:
        this._updateProcessedFiles(message.processedFiles);
        this._assignNextBatch(worker, jobQueue);
        break;
      case MESSAGE_TYPES.READY:
        this._assignNextBatch(worker, jobQueue);
        break;
      case MESSAGE_TYPES.ERROR:
        console.error(`[Worker ${message.workerId}] error:`, message.error);
        break;
    }
  }

  _updateProcessedFiles(processedFiles) {
    if (!processedFiles || !processedFiles.length) return;

    for (const { filePath, timestamp } of processedFiles) {
      if (!this.processedFiles.has(filePath) || timestamp > this.processedFiles.get(filePath)) {
        this.processedFiles.set(filePath, timestamp);
      }
    }
  }

  _assignNextBatch(worker, jobQueue) {
    const nextBatch = jobQueue.splice(0, this.config.BATCH_SIZE);
    if (nextBatch.length > 0) {
      worker.postMessage({ type: MESSAGE_TYPES.PROCESS, files: nextBatch });
    } else {
      worker.postMessage({ type: MESSAGE_TYPES.EXIT });
    }
  }
}

class WorkerThreadManager {
  constructor(config) {
    this.config = config;
    this.processedFiles = new Map();
  }

  async initializeWorker(workerId, highlighter, cachedProcessedFiles) {
    try {
      if (Array.isArray(cachedProcessedFiles)) {
        this.processedFiles = new Map(cachedProcessedFiles);
      }

      await highlighter.initShiki();
      this._setupWorkerMessageHandlers(workerId, highlighter);
      parentPort.postMessage({ type: MESSAGE_TYPES.READY, workerId });
    } catch (error) {
      parentPort.postMessage({
        type: MESSAGE_TYPES.ERROR,
        workerId,
        error: error.stack,
      });
      process.exit(1);
    }
  }

  _setupWorkerMessageHandlers(workerId, highlighter) {
    parentPort.on("message", async (message) => {
      switch (message.type) {
        case MESSAGE_TYPES.PROCESS: {
          try {
            const result = await this._processBatch(highlighter, message.files, workerId);
            parentPort.postMessage({
              type: MESSAGE_TYPES.COMPLETED,
              workerId,
              count: result.count,
              processedFiles: result.processedFiles,
            });
          } catch (error) {
            // Send error to main thread
            parentPort.postMessage({
              type: MESSAGE_TYPES.ERROR,
              workerId,
              error: error.stack,
            });
          }
          break;
        }
        case MESSAGE_TYPES.EXIT:
          if (this.config.DEBUG) {
            console.log(`[Worker ${workerId}] received exit signal`);
          }
          process.exit(0);
      }
    });
  }

  async _processBatch(highlighter, files, workerId) {
    let processedCount = 0;
    const processedFiles = [];

    for (const file of files) {
      // _processFileSafe is CPU bound, do not run it asynchrous
      const result = await this._processFileSafe(highlighter, file, workerId);
      if (!result) continue;

      const { filePath, modifications } = result;
      if (modifications > 0) {
        processedCount++;
        const timestamp = Date.now();
        this.processedFiles.set(filePath, timestamp);
        processedFiles.push({ filePath, timestamp });
      }
    }

    return { count: processedCount, processedFiles };
  }

  async _processFileSafe(highlighter, filePath, workerId) {
    try {
      const modifications = await this._processFile(highlighter, filePath, workerId);
      return { filePath, modifications };
    } catch (error) {
      parentPort.postMessage({
        type: MESSAGE_TYPES.ERROR,
        workerId,
        error: error.stack,
      });
      return null;
    }
  }

  async _processFile(highlighter, filePath, workerId) {
    const modifications = await highlighter.processFile(filePath);
    if (modifications > 0) {
      const timestamp = Date.now();
      this.processedFiles.set(filePath, timestamp);
      if (!this.config.QUIET) {
        console.log(`[Worker ${workerId}] Processed ${modifications} code blocks in: ${filePath}`);
      }
    }

    return modifications;
  }
}

module.exports = {
  MainThreadManager,
  WorkerThreadManager,
  MESSAGE_TYPES,
};
