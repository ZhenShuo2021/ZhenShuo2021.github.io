import chalk from "chalk";

function patchConsole(prefix, color = "green") {
  const colorPrefix = chalk[color](prefix);
  for (const key of ["log", "warn", "error", "info", "debug"]) {
    const original = console[key].bind(console);
    console[key] = (...args) => original(colorPrefix, ...args);
  }
}

export { patchConsole };
