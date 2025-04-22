const CONFIG = {
  // 要掃描的目標目錄設定，EXCLUDE 設定`精確`的排除資料夾
  // 例如設定 page 就只會排除 "path/page/*" 不會排除 "path/*page*/*"
  TARGETS: [
    {
      DIR: "public/posts",
    },
    {
      DIR: "public/series",
      EXCLUDE: ["folderNameToExclude", "anotherName"],
    },
  ],

  // 大型專案在開發時可以縮小範圍
  TARGETS_DEV: [
    {
      DIR: "public/posts",
      EXCLUDE: ["page"],
    },
  ],

  // 允許亮暗模式雙主題
  // https://shiki.style/guide/dual-themes
  ENABLE_DUAL_THEME: true,

  // 色彩主題，如果單主題則只須設定 LIGHT
  // https://shiki.style/themes
  // THEMES: { LIGHT: "min-light", DARK: "andromeeda" },
  // THEMES: { LIGHT: "Catppuccin Latte", DARK: "Ayu Dark" },
  THEMES: { LIGHT: "github-light", DARK: "github-dark" },

  // 支援的語言
  // https://shiki.style/languages
  LANGUAGES: [
    "javascript",
    "typescript",
    "html",
    "css",
    "json",
    "py",
    "yaml",
    "dotenv",
    "sh",
    "md",
    "go",
    "c",
    "ini",
    "toml",
    "matlab",
    "tex",
    "php",
    "nginx",
    "docker"
  ],

  // codeimporter 根據副檔名設定 language，使用字典映射 shiki 接受的副檔名
  // 例如 FileName.env 會以 dotenv 渲染
  LANGUAGE_ALIAS: {
    env: "dotenv",
    node: "js",
  },

  // 設定線程數
  THREAD_COUNT: 4,

  // 每個線程每次能取得的檔案數量
  BATCH_SIZE: 4,
};

module.exports = CONFIG;
