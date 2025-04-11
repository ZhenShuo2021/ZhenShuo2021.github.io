const { isMainThread, workerData } = require("node:worker_threads");
const CONFIG = require("./config");
const CodeHighlighter = require("./highlighter");
const { MainThreadManager, WorkerThreadManager } = require("./worker");

CONFIG.DEBUG = process.argv.includes("--debug") || false;
CONFIG.DEV = process.argv.includes("--dev") || false;

async function main() {
  if (isMainThread) {
    const mainThreadManager = new MainThreadManager(CONFIG);
    await mainThreadManager.initialize();
    await mainThreadManager.runMainThread();
  } else {
    const { workerId, cachedProcessedFiles } = workerData;
    const highlighter = new CodeHighlighter(CONFIG);
    const workerThreadManager = new WorkerThreadManager(CONFIG);
    await workerThreadManager.initializeWorker(workerId, highlighter, cachedProcessedFiles);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  CodeHighlighter,
  MainThreadManager: isMainThread ? require("./worker").MainThreadManager : null,
  WorkerThreadManager: isMainThread ? require("./worker").WorkerThreadManager : null,
};
