---
title: 在 Hugo 中使用 Shiki 並且加快執行速度超過百倍
slug:
date: 2025-04-21T21:48:21+08:00
create_data: 2025-04-21T21:48:21+08:00
draft: false
summary: 在 Hugo 靜態網站中整合 Shiki 語法高亮腳本，實現240倍高效的速度提升，實測三種作法效能差異，從191秒壓到1.88秒，開發階段甚至只要0.8秒。
showSummary: false
tags: 
  - Hugo
  - Shiki
  - 效能
  - 教學
categories:
  - Hugo
  - 網站架設
series:
series_order: 
progress_bar: true
---

目標是在 Hugo 中使用 Shiki syntax highlighter 取代內建錯誤百出的 Chroma，並且大幅加快 Shiki 執行速度。本文內容和大部分使用 shiki 的人無關，這篇文章的用途是將**已經 build 完的 HTML 檔案加上 shiki highlight**。

## 前言

原本都想好要針對最多人用的 PaperMod 主題為例寫使用教學的，但是實際使用時發現 PaperMod 修改了 code block 的 CSS，也就是說教學內容不會永遠成立，所以就改成寫效能分析了。

回到內容，~~Hugo~~ Blowfish 內建的 Chroma CSS 語法解析錯誤百出，同樣都是 `指令 --參數` 格式結果上下兩行 highlight 結果不一樣，除此之外主題切換[要這樣用](https://gohugo.io/commands/hugo_gen_chromastyles/)有夠麻煩，後來換成開箱即用的 PrismJS 和 HLJS，但是效能死宅的我不喜歡客戶端渲染，之後看到 eallion 的 [shiki 文章](https://www.eallion.com/hugo-syntax-highlight-shiki/) 二話不說馬上換成 shiki。

換成 Shiki 前請先注意這些功能問題和使用細節：

1. Code block 的語言務必正確標記，否則會完全沒顏色
2. 無法使用 Hugo 內建的 line-highlight 等等的 code block 功能
3. 不同 Hugo 主題 CSS 需要各自處理，本文只有 Blowfish 和 PaperMod 兩個主題作為範例
4. Code copy buttom 也很有可能消失，需要自行解決
5. 開發階段即時預覽的功能不適用於 `hugo server --renderToMemory`

## 不同做法

### Eallion 的做法

[eallion 的文章](https://www.eallion.com/hugo-syntax-highlight-shiki/)以 rehype CLI 方式完成，分成三個步驟

1. 關閉 Hugo 內建的渲染
2. 設定 rehype 和 shiki 的 CLI
3. 以 rehype 的 CLI 幫已經建立好的 HTML 頁面加上 shiki 語法

這個方案有幾個問題，第一是速度非常慢，我的網站不到 60 個 md 文件就要六秒渲染，eallion 的網站有 600 個 md 文件耗時 191 秒；第二個是記憶體用量，這個方式會一次處理目標資料夾裡面的所有全部 HTML 文件，記憶體用量非常大；第三是無法在編輯時預覽，要開啟另外一個終端執行 shiki 指令才可以看到語法上色結果。

> 以 eallion 的網站作為測試，在 M1 MacBook Pro 上執行 rehype shiki CLI，耗時 191 秒。

## Orta Therox 的做法

Orta 是 shiki 的 contributor，不只是 contributor，他的部落格也剛好是用 Hugo 搭建的，所以[他的方式](https://github.com/shikijs/shiki/issues/495#issuecomment-2188134630)應該很有參考性：以腳本執行 shiki，無須 rehype 並且有基本的過濾機制，不過沒有進階的效能優化。

> 以 eallion 的網站作為測試，在 M1 MacBook Pro 上執行 Orta Therox 的 [shikify.ts](https://github.com/puzzmo-com/blog.puzzmo.com/blob/6303077da805847717067cd369be4041f171a389/scripts/shikify.ts) 耗時 5.9 秒。

### 我的做法

[我的做法](https://github.com/ZhenShuo2021/ZhenShuo2021.github.io/tree/8fad76f43ecb73f96ca6922a8e5143fa3e98dda2/scripts/shiki)同樣使用腳本完成，並且有幾個優化

1. 更複雜的過濾方式
   1. 可以指定哪些目錄需要修改
   2. 每個目錄可以指定排除的路徑，例如 Hugo 會自動生成 page 頁面，此路徑的 HTML 全數排除
   3. 對於大型專案，可以設定開發時只監視指定目錄避免不必要的重複處理
   4. 增量處理：根據觀察，由於本地開發時 Hugo 只會重新渲染和這次修改有關的檔案，所以基於 HTML 檔案的修改時間進行快取，避免不必要的重複處理
2. 更高效的處理方式
   1. 使用非同步方式處理檔案 IO，使用多線程執行 shiki
   2. 根據 CPU 核心數、待處理檔案數量設定線程數
   3. 每個線程批量獲取任務避免通訊開銷
   4. 根據觀察，多數 HTML 頁面其實沒有 code block，因此使用 early return 避免 parser 解析壓根沒有 code block 的頁面
   5. 使用高效的 htmlparser2 而不是 jsdom/cheerio

> 以 eallion 的網站作為測試，優化完成後在 M1 MacBook Pro 上執行只需要 1.88 秒，並且開發時預覽修改可以在一秒內完成。

## 效能分析

總結三種方式，CLI 方式最簡單但是耗時最久需要 191 秒，而 Orta 只是換成簡單的腳本就可以把時間縮短到 5.9 秒，有 32 倍的效能提升；我的方式可以把時間再壓縮到 1.88 秒，速度提升高達 101 倍，而且在開發階段受惠於快取機制可避免重複處理，所以在 0.8 秒左右就可以完成 highlighting，速度提升高達 240 倍。

```mermaid
---
config:
    xyChart:
        width: 1000
        height: 600
    themeVariables:
        xyChart:
            plotColorPalette: "#00A2ED"
---
xychart-beta
    title "測試 shiki highlight 速度差距倍率，以 eallion.com 為範例專案"
    x-axis ["My script (cached)", "My script (uncached)", "Orta's script", "Rehype CLI"]
    y-axis "Speedup Multiplier" 0 --> 250
    bar [238.75, 101.6, 32.37, 1]
```

如果你想要在開發階段獲得極致的反應速度，腳本也可以設定 `TARGETS_DEV` 控制開發階段的渲染目標，將其限制為只有正在修改的檔案甚至能 0.25 秒完成渲染，比完整渲染快 764 倍。

和不同方案比較之後這裡再分析自己方案的效能，使用 [CLInic.js](https://github.com/CLInicjs/node-CLInic) 進行效能分析，以 `pnpm clinic flame -- node scripts/shiki/index.js` 測試，完整的火焰圖如下：

![all](https://cdn.zsl0621.cc/2025/blog/use-shiki-in-hugo-0---2025-05-09T11-59-42.webp "包含 V8 引擎開銷的火焰圖")

可以看到 V8 引擎佔據七成時間，這時如果把我們自己的 shiki 關閉，再來對比上下兩張圖，可以看到差距非常小，代表沒有優化空間了：

![no-shiki](https://cdn.zsl0621.cc/2025/blog/use-shiki-in-hugo-1---2025-05-09T11-59-42.webp "只關閉 shiki 的火焰圖")

不過我們還是簡單觀察一下目前的效能瓶頸，把 V8 和依賴的耗時都關掉，結果如下

![only-node-and-shiki](https://cdn.zsl0621.cc/2025/blog/use-shiki-in-hugo-2---2025-05-09T11-59-42.webp "只剩下 node 和 shiki 的火焰圖")

紅框處是我的函式耗時，可以看到有一半的時間花在掃描檔案上，因為 eallion 的構建結果有高達 6000 個資料夾 (`find ./public -mindepth 1 -type d | wc -l` 輸出 6451)，所以耗時長是可以預測的。

唯一一個要改的地方是在 dev 階段應該讓線程和 shiki highlighter instance 持續存活，但是現在是直接呼叫腳本重新執行。

## 使用教學

本文的程式碼位置在這裡：

- [scripts/shiki](https://github.com/ZhenShuo2021/ZhenShuo2021.github.io/tree/8fad76f43ecb73f96ca6922a8e5143fa3e98dda2/scripts/shiki)：執行 highlight
- [dev-example.js](https://github.com/ZhenShuo2021/ZhenShuo2021.github.io/blob/8fad76f43ecb73f96ca6922a8e5143fa3e98dda2/scripts/dev-example.js)：用於開發階段及時預覽

### 設定方式

先關閉 Hugo 的 code fences，找到你的 Hugo 設定檔

```toml
[markup]
  [markup.highlight]
    codeFences = false  # 關閉 code fences
```

接下來安裝依賴套件，以 pnpm 為例

```sh
pnpm add -D chalk dom-serializer html-entities htmlparser2 serve shiki
```

<details>

<summary>套件說明</summary>

1. chalk: 日誌工具
2. dom-serializer html-entities htmlparser2: HTML 解析
3. serve: 即時預覽
4. shiki: 語法上色

</details>

下一步是修改 CSS，以 Blowfish 為例，`custom.css` 只需要依照 shiki [官方文檔](https://shiki.style/guide/dual-themes)修改：

```css
.dark .shiki,
.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
```

但是有些主題會修改 code block 的 CSS 導致文檔方式不適用，例如很多人用的 PaperMod 就有這個問題，所以在 PaperMod 要改成這樣：

```css
/* 在 PaperMod 主題中使用 Shiki */
.post-content .shiki {
  border-radius: var(--radius);
  overflow: hidden;
}

.post-content .shiki code {
  background: transparent !important;
  color: inherit !important;
}

.dark .post-content .shiki {
  background-color: var(--shiki-dark-bg) !important;
  color: var(--shiki-dark) !important;
}

.dark .post-content .shiki span {
  color: var(--shiki-dark) !important;
  background-color: transparent !important;
}
```

設定完 CSS 後就可以開始 highlight 了，複製腳本到指定位置

- [scripts/shiki](https://github.com/ZhenShuo2021/ZhenShuo2021.github.io/tree/8fad76f43ecb73f96ca6922a8e5143fa3e98dda2/scripts/shiki)：執行 highlight
- [scripts/dev-example.js](https://github.com/ZhenShuo2021/ZhenShuo2021.github.io/blob/8fad76f43ecb73f96ca6922a8e5143fa3e98dda2/scripts/dev-example.js)：用於開發階段及時預覽

然後進入 `scripts/shiki/config.js` 修改客製化選項，有幾個重點項目

1. 處理的目標資料夾 `TARGETS`，是 `hugo server` 的輸出目錄
2. 是否啟用雙主題 `ENABLE_DUAL_THEME`
3. 主題選擇 `THEMES`

最後使用 `node scripts/dev-example.js` 啟用開發預覽，以 `node scripts/shiki/index.js` 幫建構完成的 HTML 檔案 highlight。

### 修復 Code Copy

Code copy 不同主題的設定方式不同，這裡以 Blowfish 主題為例。Blowfish 複製按鈕在 `themes/blowfish/assets/js/code.js` 設定，簡單來說就是找到所有的 `highlight` class，這是 Hugo 內建的 code block 標示，然後每個都加上複製按鈕，前面設定關閉 codeFences 後這個 class 也沒了，所以要自己處理。

廢話不多說，修改程式碼，在 `assets/js/code.js` 貼上以下設定就完成了：

{{< codeimporter "https://raw.githubusercontent.com/ZhenShuo2021/ZhenShuo2021.github.io/8fad76f43ecb73f96ca6922a8e5143fa3e98dda2/assets/js/code.js" >}}

### 使用須知

1. 腳本的原理是找到目標 HTML 文件，看看裡面有沒有 `<pre><code` 需要被處理，有的話就定位裡面的 `<code class="language-CODE_LANGUAGE">` 幫指定語言上色
2. 如果你的 HTML 沒有被上色，請檢查 config.js 裡面的 TARGETS 設定，或者如上一個段落說的檢查 CSS
3. 如果你的語言不在預設範圍內，請在 LANGUAGES 新增語言；如果你的語言沒辦法被正確識別，使用 LANGUAGE_ALIAS 做映射
4. `node scripts/shiki/index.js --dev` 可以將目標目錄改為 `TARGETS_DEV` 以便開發時迅速預覽
5. Shiki 直接修改 HTML，所以你的檔案會變大，Hugo minify 也會不那麼 mini，但是經過測試的結果如下，一樣是 eallion.com：

```sh
❯ uv run analysis_filesize.py
+580.0K 108.0K → 688.0K (+537.0%)       public/weasel/index.html
+140.0K 92.0K → 232.0K  (+152.2%)       public/blog-heatmap/index.html
+132.0K 92.0K → 224.0K  (+143.5%)       public/neodb/index.html
+128.0K 92.0K → 220.0K  (+139.1%)       public/cdn-cname-cloudflare/index.html
+116.0K 88.0K → 204.0K  (+131.8%)       public/memos-api/index.html
+56.0K  84.0K → 140.0K  (+66.7%)        public/mastodon-sync-to-memos/index.html
+52.0K  64.0K → 116.0K  (+81.2%)        public/judge-phone-ua/index.html
+40.0K  64.0K → 104.0K  (+62.5%)        public/share-duoshuo-css/index.html
+36.0K  84.0K → 120.0K  (+42.9%)        public/ubuntu1610/index.html
+36.0K  76.0K → 112.0K  (+47.4%)        public/hugo-redirect-landing-page/index.html
```

看似增加很多容量，不過這是 top 10，實際上總容量只多了不到 2MB，增加了 1.3%，分析腳本[在此](https://raw.githubusercontent.com/ZhenShuo2021/ZhenShuo2021.github.io/8fad76f43ecb73f96ca6922a8e5143fa3e98dda2/scripts/shiki/analysis_filesize.py)。
