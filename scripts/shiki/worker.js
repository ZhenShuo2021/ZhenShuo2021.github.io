const path = require("node:path");
const { Worker, parentPort } = require("node:worker_threads");
const fs = require("node:fs").promises;
const FileCollector = require("./file-collector");

const MESSAGE_TYPES = {
  READY: "ready",
  PROCESS: "process",
  COMPLETED: "completed",
  EXIT: "exit",
};

class MainThreadManager {
  constructor(config, workerArgs = []) {
    this.config = config;
    this.workerArgs = workerArgs;
    this.fileCollector = new FileCollector(config.TARGETS);
    this.mainScriptPath = path.resolve(__dirname, "index.js");
    this.processedFiles = new Map();
    this.recordFilePath = path.join(__dirname, ".processed-files.json");
    this.workers = [];
    this.totalProcessed = 0;
    this.activeWorkers = 0;
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
        console.error("Failed to load processed files records:", error.message);
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
      console.error("Failed to save processed files records:", error.message);
    }
  }

  async runMainThread() {
    console.log(`Starting HTML syntax highlighting process in ${this.config.TARGET_DIR}`);

    const files = await this.fileCollector.getAllHtmlFiles(this.config.TARGET_DIR);
    if (!files || files.length === 0) {
      console.log("No HTML files found to process.");
      return;
    }

    const workerCount = this._calculateOptimalWorkerCount(files.length);
    console.log(
      `Found ${files.length} HTML files. Starting processing with ${workerCount} workers.`,
    );

    return this._startWorkerProcessing(files, workerCount);
  }

  _calculateOptimalWorkerCount(fileCount) {
    const cpuCount = require("node:os").cpus().length;
    const baseWorkerCount = Math.min(
      this.config.THREAD_COUNT,
      Math.ceil(fileCount / 10),
      cpuCount - 1 || 1,
    );
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
      console.error(`[Worker ${workerId}] encountered an error: ${error.message}`);
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
      console.log(`Process completed. Modified ${this.totalProcessed} files.`);
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
    this.cheerio = require("cheerio");
  }

  async initializeWorker(workerId, highlighter, cachedProcessedFiles) {
    try {
      if (Array.isArray(cachedProcessedFiles)) {
        this.processedFiles = new Map(cachedProcessedFiles);
      }

      this._setupWorkerMessageHandlers(workerId, highlighter);
      parentPort.postMessage({ type: MESSAGE_TYPES.READY, workerId });
    } catch (error) {
      console.error(`[Worker ${workerId}] initialization error: ${error.message}`);
      process.exit(1);
    }
  }

  _setupWorkerMessageHandlers(workerId, highlighter) {
    parentPort.on("message", async (message) => {
      switch (message.type) {
        case MESSAGE_TYPES.PROCESS: {
          const result = await this._processBatch(highlighter, message.files, workerId);
          parentPort.postMessage({
            type: MESSAGE_TYPES.COMPLETED,
            workerId,
            count: result.count,
            processedFiles: result.processedFiles,
          });
          break;
        }
        case MESSAGE_TYPES.EXIT:
          if (this.config.DEBUG) {
            console.log(`[Worker ${workerId}] received exit signal`);
          }
          process.exit(0);
          break;
      }
    });
  }

  async _processBatch(highlighter, files, workerId) {
    let processedCount = 0;
    const processedFiles = [];

    const results = await Promise.all(
      files.map((file) => this._processFileSafe(highlighter, file, workerId)),
    );

    for (const result of results) {
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
      console.error(`[Worker ${workerId}] failed to process ${filePath}: ${error.message}`);
      return null;
    }
  }

  async _processFile(highlighter, filePath, workerId) {
    if (!(await this._shouldProcessFile(filePath))) return 0;

    const htmlContent = await fs.readFile(filePath, "utf8");

    if (!htmlContent.includes("<pre><code") || htmlContent.includes('<pre class="shiki')) {
      return 0;
    }

    const $ = this.cheerio.load(htmlContent, { decodeEntities: false });
    const codeBlocks = $("pre > code");

    if (codeBlocks.length === 0) return 0;

    let modificationsCount = 0;
    for (let i = 0; i < codeBlocks.length; i++) {
      const modified = await highlighter.processCodeBlock($, codeBlocks.eq(i));
      if (modified) modificationsCount++;
    }

    if (modificationsCount > 0) {
      await fs.writeFile(filePath, $.html(), "utf8");
      console.log(
        `[Worker ${workerId}] Processed ${modificationsCount} code blocks in: ${filePath}`,
      );
    }

    return modificationsCount;
  }

  async _shouldProcessFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const lastModified = stats.mtimeMs;
      return !this.processedFiles.has(filePath) || this.processedFiles.get(filePath) < lastModified;
    } catch (error) {
      console.error(`Error checking file status: ${filePath}`, error.code);
      return true;
    }
  }
}

module.exports = {
  MainThreadManager,
  WorkerThreadManager,
  MESSAGE_TYPES,
};
