const { spawn, execSync } = require("node:child_process");

const SHIKI_COMMAND = "node scripts/shiki/index.js --dev --quiet";
const HUGO_COMMAND = ["server", "--disableKinds", "RSS", "-p", "1313"];
const SASS_INIT = "pnpm css";
const SASS_WATCH = "pnpm css:watch";

const HUGO_OK_FLAG = "Web Server is available"; // 監聽 hugo html 建立完成
const HUGO_DEBOUNCE_MS = 300; // 避免短時間重複執行 shiki
const CLEANUP_RETRY_MS = 500; // spawn process 清除失敗的重試等待時間

const EXIT_SIGNALS = [
  "SIGTERM",
  "SIGHUP",
  "SIGQUIT",
  "SIGABRT",
  "uncaughtException",
  "unhandledRejection",
];

let debounceTimer;
let isShikiRunning = false;
let hugoProcess;
let sassWatchProcess;
const childProcesses = [];

function cleanup() {
  for (const proc of childProcesses) {
    if (proc?.pid && !proc.killed) {
      try {
        proc.kill("SIGTERM");

        setTimeout(() => {
          try {
            if (proc?.pid && !proc.killed) {
              proc.kill("SIGKILL");

              if (process.platform === "win32") {
                execSync(`taskkill /F /PID ${proc.pid}`, { stdio: "ignore" });
              } else {
                execSync(`kill -9 ${proc.pid}`, { stdio: "ignore" });
              }
            }
          } catch (e) {}
        }, CLEANUP_RETRY_MS).unref();
      } catch (e) {}
    }
  }
}

process.on("exit", cleanup);
process.on("SIGINT", cleanup);

for (const signal of EXIT_SIGNALS) {
  process.on(signal, (error) => {
    if (signal !== "SIGINT" && error) console.error(`Error: ${signal}`, error);
    cleanup();
    setTimeout(() => {
      process.exit(signal === "uncaughtException" || signal === "unhandledRejection" ? 1 : 0);
    }, CLEANUP_RETRY_MS).unref();
  });
}

try {
  execSync(SASS_INIT, { stdio: "inherit" });

  sassWatchProcess = spawn("sh", ["-c", SASS_WATCH], { detached: false });
  childProcesses.push(sassWatchProcess);

  hugoProcess = spawn("hugo", HUGO_COMMAND, { detached: false });
  childProcesses.push(hugoProcess);

  hugoProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(output);

    if (output.includes(HUGO_OK_FLAG)) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!isShikiRunning) {
          isShikiRunning = true;
          try {
            execSync(SHIKI_COMMAND, { stdio: "inherit" });
          } finally {
            isShikiRunning = false;
          }
        } else {
          console.log("Shiki is already running, skipping trigger.");
        }
      }, HUGO_DEBOUNCE_MS);
    }
  });

  hugoProcess.stderr.on("data", (data) => {
    console.error(`Hugo: ${data.toString().trim()}`);
  });

  sassWatchProcess.stdout.on("data", (data) => {
    console.log(`SASS: ${data.toString().trim()}`);
  });

  sassWatchProcess.stderr.on("data", (data) => {
    console.error(`SASS: ${data.toString().trim()}`);
  });

  hugoProcess.on("close", (code) => {
    console.log(`Hugo process exited with code ${code}`);
    cleanup();
    process.exit(code || 0);
  });

  sassWatchProcess.on("close", (code) => {
    console.log(`SASS process exited with code ${code}`);
    if (hugoProcess && !hugoProcess.killed) {
      cleanup();
      process.exit(code || 0);
    }
  });
} catch (error) {
  console.error(error);
  cleanup();
  process.exit(1);
}
