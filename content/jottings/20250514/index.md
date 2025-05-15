---
title: 記錄一次失敗的提問經驗
date: 2025-05-14T13:28:28+08:00
create_data: 2025-05-14T13:28:28+08:00
draft: false
summary: 
showSummary: false
tags: [Hugo, 隨筆]
categories: [Hugo, 隨筆]
series: []
series_order: 
progress_bar: true
---

Hugo 雖然有顯著的缺點，比如說我在 [SSG 比較](/posts/ssg-tools-comparison) 這篇文章就說過 Hugo 文檔很糟糕，但是開發者[非常熱心的回應，甚至看原始碼找問題](https://github.com/gohugoio/hugo/issues/13711#issuecomment-2878704165)是我沒有想到的，然而本文的起因還是來自文檔。

# 背景

維護 Blowfish 主題時由於頁面超過 1400 頁，所以我希望能開發時透過環境變數排除語言和指定資料夾以加快速度。我的想法是：

1. 使用 HUGO_DISABLELANGUAGES 排除不需要的語言
2. 使用某種方式排除指定資料夾（如 /users/）

# 文檔的問題

先說文檔有哪些問題，有了這些認知之後，接下來再看前因後果會比較能體會為什麼簡單的問題可以搞成這樣。

文檔 header nav [點進去](https://gohugo.io/documentation/) 會看到 card 風格的文檔頁面，這裡的 card 排序是**依照字母**，再點進不同的文檔內容，**有些是依照字母排序，有些依照重要程度排序，有些不規則**，要不是為了寫這篇文章我也不會發現這件事，誰沒事會去研究文檔的**順序**是怎麼排的，對於文檔這個問題很大，因為讀者沒辦法有邏輯的閱讀，也造成維護者很大的負擔，例如要回答我的[笨問題](https://github.com/gohugoio/hugo/issues/13711)。沒錯，我搞懂後馬上就覺得自己的問題很愚蠢，但是我還是認為這是文檔造成的問題，下一個人來也會遇到一樣的事情。

除了排序問題以外，右邊 ToC 一次顯示 `In this section` 和 `On this page`，兩個樣式完全一樣，要馬點擊連結之前還要腦袋清醒看清楚是哪種清單，要馬點進去看會不會切換頁面。

# 前因後果

前面說完文檔難以閱讀的前提後，這裡說明整件事的經過。

1. 我發現 Hugo 可以透過[環境變數](https://gohugo.io/configuration/introduction/#environment-variables)在開發時修改設定，對於需要頻繁切換開發配置的場景非常有用。
2. 我發現 disableLanguages 可以關閉指定語言，使用 `HUGO_DISABLELANGUAGES=it ja zh-cn` 設定，這樣就少掉 3/4 頁面，剩下 350 頁要渲染。
3. blowfish 主題有 100 多頁都在 users 目錄中，於是我繼續在[設定頁面](https://gohugo.io/configuration/all/)尋找 `disable` `ignore` `no` 之類的排除關鍵字。
4. 裡面唯一相似的只有 `ignoreFiles`，然而以環境變數輸入時，使用空隔作為路徑的 delimiter 顯然不可能，我又嘗試了幾種不同設定，確認 Hugo 的確不支援在 ignoreFiles 的環境變數分割多個字串。
5. 剛好前兩天我也發了 [類似的 bug report](https://github.com/gohugoio/hugo/issues/13707)，於是就趁機提 proposal `Use colon as separator for environment variables` 說明優點，我即使到現在也覺得這個提案不錯，因為符合 POSIX 傳統，也能在 Windows 上使用，而誤會也從這裡開始展開。

我的目的其實很簡單，只是要避免指定目錄被處理，但是前面的經歷讓我的思維被導向成「讓環境變數使用 delimiter 以支援輸入列表」，這和我的原始目的不符合，導致我發了一個看似相關但是會讓人困惑的 issue。

我沒有要推卸責任，錯的確在我，但是因為文檔沒辦法讓人照順序讀，例如開發者回應我應該要用 `segment` 完成而不是 `ignoreFiles`，那麼以下是整個 config section 的目錄，大家可以找找看 segments 在哪：

- Introduction  <--- 介紹放在最前面，看起來是按照重要程度排序？
- All settings  <--- 我現在在這裡
- Build <--- 順序又變成字母排序了
- Caches
- Cascade
- Content types
- Deployment
- Front matter
- HTTP cache
- Imaging
- Languages
- Markup
- Media types
- Menus
- Minify
- Modules
- Output formats
- Outputs
- Page
- Pagination
- Params
- Permalinks
- Privacy
- Related content
- Security
- Segments  <--- segments 在這裡
- Server
- Services
- Sitemap
- Taxonomies
- Ugly URLs

我都已經找到 ignoreFiles 了哪有可能把整個 configuration section 看完，而且他還在最後面，要注意 [文檔是 card UI](https://gohugo.io/configuration/) 而不是一目了然的 list，甚至這還只是其中一個 section，文檔裡面有 20 個 section，正常人不可能把文檔翻個遍吧，我已經算是文檔看的比較詳細的人了，我在發 PR 的時候連主題開發者用的 Hugo 語法都能找出一堆錯的，更不要說其他懶人了。

# 更笨的發問

總之開發者回應說可以用 segments 後我就著手修改，看 segments 文檔第一句話又是模糊的

> The **segments** configuration applies only to segmented rendering. While it controls when content is rendered, it doesn’t restrict access to Hugo’s complete object graph (sites and pages), which remains fully available.

能懂在某些情況下還是會處理這些資源，但是就是用猜的，不過不懂就算了先跳過能動再說，先去看範例，接下來一半時間測試設定檔，另一半時間在想文檔裡面提到的 `Filter` `Matcher` 到底是什麼，沒錯，文檔直接定義了兩個新名詞但是沒說他對應到哪個參數，在設定檔裡面我們寫的是 `segment_name` `include` `exclude`，又要開始猜文檔，這雖然不難猜，但是文章也就沒超過 30 行，怎麼不直接說 Matcher 就是 include，Filter 就是 exclude。

結果 HTML 頁面被排除但是圖片還是會被渲染，所以我提了一個更笨的問題問他為何圖片還是被渲染，原因是被我跳過的 object graph，事情到此結束，issue 也被關閉，浪費他這麼多時間我感到很抱歉，但是這個鍋有一半要給文檔背。

再次強調 Hugo 的開發者人很好，但是這個設計很怪，我就只是要簡單的排除目錄，結果 ignoreFiles 可以直接忽略但是不能動態設定，segments 可以動態設定但是 object graph 無法直接忽略檔案處理，還有更複雜的 mount 設定也可以完成類似任務，這麼直觀的需求有三套方案結果都不方便...

# 失敗的提問經驗

1. 我沒有找出我的核心問題，我要的是在命令行中隨時修改忽略的內容，而不該提案 colon。
2. 我應該說明我要的很單純，能在命令行直接忽略多個指定目錄，因為 segments 設計和我的需求不同，這樣開發者可能還有耐心回應。
3. 就算文檔很難讀還是該丟給 AI 整理，這樣可以省下大家時間。
4. 再次感謝開發者，完全沒有想到會這麼熱心的回應，甚至讀原始碼跟我說哪裡有問題，這裡多次強調我只有抱怨文檔和檔案忽略功能，其餘我都是讚賞的。
