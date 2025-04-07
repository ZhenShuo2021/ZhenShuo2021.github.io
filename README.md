# 簡介

使用 Hugo Blowfish 主題打造的部落格並且加上一些改進和個人化。

## 特色

- PageSpeed Insights 四項滿分
- 使用 shiki 完成正確且快速的 Syntax Highlighting
- 標籤和分類使用標籤雲
- Full responsive 的文章列表
- 不使用 submodule 安裝主題，更輕量快速
- 支援 SCSS 管理外觀
- 整合和優化多項外觀和功能，例如增加 shortcode，閱讀進度條、優化標籤和分類外觀等等...

![PageSpeed](assets/PageSpeed.jpg)

## 說明

初次使用

```sh
git clone -q --depth=1 https://github.com/ZhenShuo2021/ZhenShuo2021.github.io blog
cd blog
pnpm install
pnpm serve
```

其餘指令如下

- `pnpm serve`: 同 `hugo server`，啟動本地開發伺服器
- `pnpm build`: 同 `hugo build`，構建網頁
- `pnpm view-build`: 構建完成後預覽部署版本
- `pnpm scss:watch`: 單獨監視 SCSS 檔案變化並編譯
- `pnpm scss:build`: 編譯 SCSS
- `pnpm shiki`: 進行程式碼 highlight

### 程式碼 highlight

語法上色採用 [shiki](https://github.com/shikijs/shiki) 的好處是正確且快速，內建的 Chroma 錯誤百出，highlightjs 和 prismjs 太慢，不過也因此 pnpm server 預覽時沒有顏色，如果想要在預覽時確認顏色，請開啟另一個終端執行 `pnpm shiki`。

### 版本更新

Blowfish 大小高達 0.6GB 所以我沒有使用 submodule 安裝主題，改用腳本更新主題容量縮減到只有 10MB，`pnpm update-blowfish:py` `pnpm update-blowfish:sh` 都可以用功能相同。

## Shortcode

除了 Hugo 和 Blowfish 內建的 shortcode，本專案也有自製的 shortcode。

> shortcode 是使用 go 模板把內容嵌入到 html 頁面的功能。

### codeimporter

從[這裡](https://discourse.gohugo.io/t/is-there-a-way-to-embed-raw-github-url-in-hugo/39957/14)改來的，改完才發現 blowfish 內建就有了，不過我的更好用而且改為兼容 shiki。

Example usage:

```go
// 載入完整檔案
{{< codeimporter "https://raw.githubusercontent.com/nunocoracao/blowfish/refs/heads/main/netlify.toml" >}}

// 載入完整檔案，設定語言 toml，只顯示前四行
{{< codeimporter "https://raw.githubusercontent.com/nunocoracao/blowfish/refs/heads/main/netlify.toml" "toml" "-4" >}}

// 除了 positional arguments 也支援 named arguments
{{< codeimporter url="https://raw.githubusercontent.com/nunocoracao/blowfish/refs/heads/main/netlify.toml" line="5-7" >}}
```

### expand

展開功能

```md

{{< expand "See the details" >}}

{{< codeimporter "https://raw.githubusercontent.com/nunocoracao/blowfish/refs/heads/main/netlify.toml" >}}

{{< /expand >}}
```

### hint

仿照 [Docusaurus Admonitions](https://docusaurus.io/zh-CN/docs/markdown-features/admonitions) 的 shortcode。

```md

{{< hint "note" "(Optional) Title Here" >}}
Text Here
{{< /hint >}}

{{< hint "tip" >}}
Text Here
{{< /hint >}}

{{< hint "info" >}}
Text Here
{{< /hint >}}

{{< hint "warning" >}}
Text Here
{{< /hint >}}

{{< hint "danger" >}}
Text Here
{{< /hint >}}
```
