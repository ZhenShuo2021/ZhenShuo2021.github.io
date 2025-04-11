const fs = require("node:fs").promises;
const path = require("node:path");

/**
 * @typedef {Object} TargetConfig
 * @property {string} DIR - 掃描的根目錄
 * @property {string[]=} [EXCLUDE] - 要排除的資料夾名稱
 */
class FileCollector {
  constructor(targets) {
    this.targets = targets;
  }

  /**
   * 掃描所有目標並返回符合條件的 .html 檔案清單
   * @returns {Promise<string[]>}
   */
  async getAllHtmlFiles() {
    const result = new Set();

    for (const { DIR, EXCLUDE = [] } of this.targets) {
      await this._scanDirectory(DIR, EXCLUDE, result);
    }

    return Array.from(result);
  }

  async _scanDirectory(rootDir, exclude, resultSet) {
    const queue = [rootDir];

    while (queue.length > 0) {
      const currentDir = queue.shift();

      let entries;
      try {
        entries = await fs.readdir(currentDir, { withFileTypes: true });
      } catch (error) {
        console.error(`Error reading ${currentDir}: ${error.message}`);
        continue;
      }

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const normalized = fullPath + path.sep;

        if (this._shouldExclude(normalized, exclude)) continue;

        if (entry.isDirectory()) {
          queue.push(fullPath);
          continue;
        }

        if (entry.isFile() && entry.name.endsWith(".html")) {
          resultSet.add(fullPath);
        }
      }
    }
  }

  _shouldExclude(filePath, exclude) {
    return exclude.some((folder) => filePath.includes(path.sep + folder + path.sep));
  }
}

module.exports = FileCollector;
