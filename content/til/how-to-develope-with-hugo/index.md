---
title: TIL：設定 Hugo 開發環境，整合 Linter 與程式碼格式化
date: 2025-05-11T16:16:31+08:00
create_data: 2025-05-11T16:16:31+08:00
draft: false
summary: 
showSummary: false
tags:
  - Hugo
  - 網站架設
categories:
  - Hugo
  - 教學
series:
series_order: 
progress_bar: true
---

TIL (today I learned) 是一個新系列，隨手寫今天學到了什麼，今天的內容是設定 Hugo 開發環境。

# 起源

最近在 [Blowfish](https://github.com/nunocoracao/blowfish) 主題發了多個 PR，發現程式碼什麼格式都有：

- indent size 0, 1, 2, 3, 4 格都有
- 有些有 semicolon 有些沒有
- 完全沒有 markdownlint

光是這些問題就很難讀程式碼了，還有 go template 導致 VS Code 無法 syntax highlight 也無法判斷 if-else/with-else 範圍，開發起來極度痛苦，所以搞了一下設定，並且流水帳做記錄。

# 一般用戶

設定 markdown 語法檢查和 editorconfig，editorconfig 用途是告訴編輯器怎麼處理該語言的文件，以 VS Code 為例，要安裝插件

- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)
- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) （可選）

格式化 markdown 時，如果想使用 cli 執行，可以安裝 [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2/)

```sh
pnpm add -D markdownlint-cli2
```

cli2 和原版的差異基本上是功能和設定完全相同，加上一些額外指令和更方便的語法，並且速度更快。安裝完成後也要寫設定檔否則預設規則太嚴格，本部落格的好處就是不廢話，直接給你我調整好的設定檔，在根目錄建立 `.markdownlint-cli2.yaml`：

```yaml
# 規則請見文檔
# https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md
# https://github.com/DavidAnson/markdownlint/tree/main/doc
globs:
  - "**.md"

gitignore: true

ignores:
  - node_modules
  - themes
  - .vscode

config:
  MD002: false  # First header should be a h1 header
  MD003: false  # heading-style Heading style, conflict with mermaid shortcode
  MD013: false  # line length
  MD024:        # multiple headers with the same content
    siblings_only: true
  MD025: false  # multiple top level headers
  MD026: false  # trailing punctuation in header
  MD028: false  # blank line inside blockquote
  MD029: false  # ordered list item prefix
  MD033: false  # inline HTML
  MD034: false  # bare URL used
  MD036: false  # emphasis used instead of a header
  MD041: false  # first line in file should be a top level header
  MD046: false  # Code block style
  MD049:        # emphasis style
    style: asterisk
  MD050:        # strong style
    style: asterisk
```

最後再加上 `.editorconfig` 讓 VS Code 知道如何格式化：

```ini
[*]
charset = utf-8
indent_size = 2
indent_style = space

[*.{sh,js,ts,css,json,yaml,toml,html}]
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

一般用戶的設定比較簡單，三個步驟就完成了，值得注意的是 indent_style 可以設定 `tab` 或是 `space`，我以往都用 space，最近覺得 tab 好像也不錯，不需修改檔案就可以控制顯示的 indent 距離。

# 開發者

開發者就要超多工具，使用以下指令安裝

```sh
pnpm add -D husky lint-staged @biomejs/biome markdownlint-cli2 prettier prettier-plugin-go-template @awmottaz/prettier-plugin-void-html
```

每個工具的任務如下：

- husky 負責 pre-commit hook，在每次提交自動執行任務
- lint-staged 負責設定任務
- biome 負責檢查 js/ts，prettier 負責 format HTML，markdownlint-cli2 負責 markdown 文件
- prettier 以及其餘 prettier 插件

要分成這樣的原因是 prettier 可以使用 override 讓他以 go-template 語法辨識 HTML 文件，否則完全無法格式化，這也是 [Hugo 官方的使用方式](https://github.com/gohugoio/hugo/blob/c745a3e10849198a401c600232ceda5d8cf7381f/docs/.prettierrc)；biome 雖然可以 lint+format 但是我懶的研究怎麼在 biome 裡面做到一樣的事情；不使用 prettier format markdown 的原因是他無法判讀 shortcode 會打亂文件，而且 markdownlint 的規則非常淺顯易懂且貼近實務。

最後還有開發者用的擴充功能：

- [Hugo Shortcode Syntax Highlighting](https://marketplace.visualstudio.com/items?itemName=kaellarkin.hugo-shortcode-syntax)
- [Hugo Language and Syntax Support](https://marketplace.visualstudio.com/items?itemName=budparr.language-hugo-vscode)

## husky

接下來啟動 husky `pnpm husky init`，然後把自動建立的 `.husky/pre-commit` 內容改為 `pnpm exec lint-staged`，再到 `package.json` 設定 lint-staged 的任務：

```json
  "lint-staged": {
    "**/*": [
      "prettier --write --list-different",
      "pnpm biome lint --write --no-errors-on-unmatched"
    ],
    "content/*.md": [
      "markdownlint-cli2 --fix '#node_modules' '#themes'"
    ]
  },
```

請注意這裡不要使用 `.`，這會導致不是 staged 的文件也被 format，要 format 全部文件就在指令最後加上 "." 即可，例如 `prettier --write --list-different .`。

## 其餘工具設定

剩下的工具就沒什麼好說的，不廢話上全套設定

<details>

<summary>.prettierrc</summary>

```json
{
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "trailingComma": "all",
  "proseWrap": "always",
  "plugins": [
    "prettier-plugin-go-template",
    "@awmottaz/prettier-plugin-void-html"
  ],
  "overrides": [
    {
      "files": ["*.html"],
      "options": {
        "useTabs": false,
        "parser": "go-template",
        "goTemplateBracketSpacing": true,
        "printWidth": 112,
        "bracketSameLine": true
      }
    },
    {
      "files": ["*.js", "*.mjs", "*.mts", "*.ts"],
      "options": {
        "semi": true,
        "useTabs": false,
        "printWidth": 112,
        "singleQuote": false
      }
    },
    {
      "files": ["*.yml", "*.yaml"],
      "options": {
        "singleQuote": false
      }
    },
    {
      "files": ["*.json*"],
      "options": {
        "trailingComma": "none"
      }
    }
  ]
}
```

</details>

<details>

<summary>.prettierignore</summary>

```gitignore
# https://github.com/gohugoio/hugo/blob/b39b24962350090122b5f3927456dde710cffb57/docs/.prettierignore
# https://github.com/gohugoio/hugo/blob/b39b24962350090122b5f3927456dde710cffb57/docs/.prettierrc

# IDE
.markdownlint-cli2.yaml


# js
node_modules
package.json
pnpm-lock.yaml
pnpm-workspace.yaml

# Hugo
assets/lib
assets/css/compiled
content
themes
public
static
*.md

# invalid node
layouts/_default/_markup/_render-heading.html
layouts/partials/article-link/card.html
layouts/partials/article-link/simple.html
layouts/partials/custom/tag-and-category.html
layouts/partials/hero/custom-background-hero.html

assets/js/appearance.js
```

</details>

<details>

<summary>biome.json</summary>

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "files": {
    "ignoreUnknown": true,
    "ignore": [
      "assets/lib",
      "assets/js/code.js",
      "themes",
      "public",
      "node_modules/*",
      "static",
      ".vscode",
      "*.svg"
    ]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "ignore": ["themes/*"],
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 112,
    "lineEnding": "lf"
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noForEach": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "arrowParentheses": "always",
      "bracketSameLine": false,
      "bracketSpacing": true,
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "quoteStyle": "double",
      "semicolons": "asNeeded",
      "trailingCommas": "all"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "css": {
    "formatter": {
      "enabled": true
    }
  }
}
```

</details>

# 結語

文章寫起來閱讀時間不用五分鐘，完成正確設定前後耗時一週。
