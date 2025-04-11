const fs = require("node:fs").promises;
const path = require("node:path");

/**
 * @typedef {Object} TargetConfig
 * @property {string} DIR - 掃描的根目錄
 * @property {string[]=} [EXCLUDE] - 要排除的資料夾名稱
 */

/**
 * 掃描目標目錄並收集所有 .html 檔案
 * @param {TargetConfig[]} targets - 目標目錄配置陣列
 * @returns {Promise<string[]>} - 所有符合條件的 HTML 檔案路徑
 */
async function collectHtmlFiles(targets) {
  const result = new Set();

  for (const { DIR, EXCLUDE = [] } of targets) {
    await scanDirectory(DIR, EXCLUDE, result);
  }

  return Array.from(result);
}

/**
 * 掃描單一目錄並收集 HTML 檔案
 * @param {string} rootDir - 要掃描的根目錄
 * @param {string[]} exclude - 要排除的資料夾名稱
 * @param {Set<string>} resultSet - 儲存結果的集合
 */
async function scanDirectory(rootDir, exclude, resultSet) {
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

      if (shouldExclude(normalized, exclude)) continue;

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

/**
 * 檢查是否應排除特定路徑
 * @param {string} filePath - 要檢查的檔案路徑
 * @param {string[]} exclude - 要排除的資料夾名稱
 * @returns {boolean} - 是否應排除
 */
function shouldExclude(filePath, exclude) {
  return exclude.some((folder) => filePath.includes(path.sep + folder + path.sep));
}

module.exports = { collectHtmlFiles };
