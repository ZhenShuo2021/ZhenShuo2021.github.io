const { isMainThread, workerData } = require("node:worker_threads");
const CodeHighlighter = require("./highlighter");
const { MainThreadManager, WorkerThreadManager } = require("./worker");

async function main() {
  if (isMainThread) {
    const CONFIG = require("./config");
    CONFIG.DEBUG = process.argv.includes("--debug") || false;
    CONFIG.QUIET = CONFIG.DEBUG ? false : process.argv.includes("--quiet") || false;
    CONFIG.DEV = process.argv.includes("--dev") || false;

    try {
      const mainThreadManager = new MainThreadManager(CONFIG);
      await mainThreadManager.initialize();
      await mainThreadManager.runMainThread();
    } catch (error) {
      throw new Error(`Main thread error: ${error.message}\n${error.stack}`);
    }
  } else {
    const configFromMain = workerData.workerThreadConfig;
    const CONFIG = Object.assign({}, require("./config"), configFromMain);
    const { workerId, cachedProcessedFiles } = workerData;

    try {
      const highlighter = new CodeHighlighter(CONFIG);
      const workerThreadManager = new WorkerThreadManager(CONFIG);
      await workerThreadManager.initializeWorker(workerId, highlighter, cachedProcessedFiles);
    } catch (error) {
      throw new Error(`Worker ${workerId} initialization error: ${error.message}\n${error.stack}`);
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error.stack);
    process.exit(1);
  });
}

module.exports = {
  CodeHighlighter,
  MainThreadManager: isMainThread ? require("./worker").MainThreadManager : null,
  WorkerThreadManager: isMainThread ? require("./worker").WorkerThreadManager : null,
};
