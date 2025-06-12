# ZSL's Blog

我的個人部落格，採用 Hugo 生成靜態網站，使用 [MemE](https://github.com/reuixiy/hugo-theme-meme) 主題。

## 使用

```sh
git clone --recurse-submodules https://github.com/ZhenShuo2021/ZhenShuo2021.github.io blog
cd blog
hugo server
```

## 演化

本部落格過去使用 [Blowfish](https://github.com/nunocoracao/blowfish) 主題並進行大量客製化，在深度使用，甚至自己都成為 Blowfish 的最大貢獻者後，我發現使用 Tailwind + Hugo 的架構存在根本性問題，任何基於此組合的主題都會讓下游用戶的專案難以維護，並且客製化程度越高，維護複雜度越高。由於此問題是框架帶來的邏輯衝突不可能被解決，於是最後決定遷移到 MemE ── 低調卻不無趣、基於 SASS 的 Hugo 主題。

我的[部落格文章](https://blog.zsl0621.cc/posts/tailwind-in-hugo-is-a-scam/)對此問題有詳細說明，舊版部落格原始碼放在 blowfish 分支。

## Shortcode

Shortcode 是使用 go 模板把複雜內容或功能嵌入到 html 頁面的功能，本專案有以下自製的 shortcode。

### Mermaid

根據一番市場調查，我是為數不多幾個按照 Hugo 官方文檔實作 mermaid 的 Hugo 部落格，不再需要 shortcode 和 frontmatter，直接使用和 Github 上一樣的語法即可：

`````txt
```mermaid
graph LR;
A[Lemons]-->B[Lemonade];
B-->C[Profit]
```
`````

### Hint

完全重現 [Docusaurus Admonitions](https://docusaurus.io/zh-CN/docs/markdown-features/admonitions) 的 shortcode。

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

### Slide

啟發自 Blowfish carousel 但是完全重寫的滑動式畫廊，從使用到展示效果都大幅度優化，使用 embla 完成，使用方式是

```text
{{< slide >}}
width=90%
src=https://external-image.webp
src=gallery/01.jpg
src=img/logo.png
caption="External image"
caption="Image from content directory"
caption="Image from assets directory"
{{< /slide >}}
```

或者直接載入資料夾

```text
{{< slide >}}
width=90%
dir=gallery
{{< /slide >}}
```

### YoutubeLite

從 Blowfish 原封不動搬過來的，使用方式是

{{< youtubeLite id="XifmeRdJCjo" label="爆弾魔 Bomber (Re-Recording)" params="start=130" >}}

### codeimporter

從外部來源載入程式碼，但是比 Blowfish 內建的 codeimporter 還更好用，並且支援 syntax highlighting。

Example usage:

```go
// 載入完整檔案
{{< codeimporter "https://raw.githubusercontent.com/nunocoracao/blowfish/refs/heads/main/netlify.toml" >}}

// 載入完整檔案，設定語言 toml，只顯示前四行
{{< codeimporter "https://raw.githubusercontent.com/nunocoracao/blowfish/refs/heads/main/netlify.toml" "toml" "-4" >}}

// 除了 positional arguments 也支援 named arguments
{{< codeimporter url="https://raw.githubusercontent.com/nunocoracao/blowfish/refs/heads/main/netlify.toml" line="5-7" >}}
```

### Expand

展開功能

```md

{{< expand "See the details" >}}

{{< codeimporter "https://raw.githubusercontent.com/nunocoracao/blowfish/refs/heads/main/netlify.toml" >}}

{{< /expand >}}
```
