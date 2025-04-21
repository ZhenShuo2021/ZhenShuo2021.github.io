---
title: 非前端專業的 SSG 使用心得 | Hexo | Hugo | Docusaurus | VitePress | MkDocs
date: 2025-04-21T16:19:36+08:00
create_data: 2025-04-21T16:19:36+08:00
draft: false
summary: 本文從非前端專業角度，分享作者使用 Hexo, Hugo, Docusaurus, VitePress, MkDocs 等 SSG 的心得與比較，涵蓋優缺點、速度、客製化難度、主題等面向，提供選擇參考。
showSummary: false
tags: ["網站架設", "靜態網站生成器", "Hugo"]
categories: ["網站架設", "工具", "Hugo"]
series: []
series_order: 
progress_bar: true
---

開始架網站後靜態網站生成器 (SSG) 換了好幾個，由於我不是學前端的所以這是一個非前端專業角度的使用心得，本文包含以下幾個 SSG 工具：

1. Hexo
2. Hugo
3. Docusaurus
4. MkDocs
5. Vitepress

依照使用時間排序，電腦是 M1 MacBook Pro。

# Hexo

使用約一週，基本上沒改什麼東西就跳到 Hugo 了，心得如下。

**優點**

1. 完整詳細的中文文檔，新手超級友善
2. 背景語言是用 js 寫的，適合本來就會 js 的人，也適合剛開始學 js 的
3. 沒有預設其他框架，不用學 React/Go 等等語言
4. 有很多適合中文生態的插件，例如宅宅 L2D

**缺點**

1. 主題我都不喜歡，最好看的還是 Next 但是已經爛大街
2. 慢，才沒寫幾篇文章就已經感覺到開發階段的畫面更新有延遲
3. 慢，這幾個 SSG 就只有他的網頁瀏覽起來有不流暢的感覺

**樣式範例**

- [NexT](https://theme-next.js.org/archives/)
- [async](https://github.com/MaLuns/hexo-theme-async)

# Hugo

到現在都還在用也自定義最多，所以本段內容最豐富。

**優點**

1. 主題多，數量爆打其他 SSG
2. 主題好看，Hexo 很多主題我都覺得醜
3. 優秀的圖片渲染管道
4. SEO 很好，全靜態內容
5. 只有簡單語法不會碰到語言的框架問題
6. 可以隨便在 md 裡面寫 HTML 和 JS，Docusaurus 和 Vitepress 有些語法要轉換
7. 速度很快，七十個 md 文件渲染速度如下：

   - 冷啟動 9 秒，使用 `hugo server --disableFastRender --ignoreCache`
   - 冷啟動 1.5 秒，使用 `hugo server --ignoreCache`
   - 熱啟動 0.2 秒，使用 `hugo server`

   我也測試過 [eallion.com](https://github.com/eallion/eallion.com) 有 600 個 MD 文件，冷啟動速度約兩分鐘，熱啟動 7 秒左右，已經非常快了。

   > 還有比 Hugo 更快的 [Zola](https://github.com/getzola/zola)，快一個數量級（約十倍），所以 Hugo 不是官網上宣稱的地表最快，不過也夠快了。

8. Github 超多部落格的開源程式碼可以參考

**缺點**

1. 客製化**非常困難**
   - html/js 學到一半要跑去看 go 語言，進階使用還要理解 Hugo 自身的渲染流程，可以說是最難客製化的 SSG
   - 如上述，很難找到完美的主題，因為開發者需要精通全部語言外加 SEO 以及瀏覽器相關的知識，還要喜歡 Hugo 到願意做一個主題
   - 應該沒辦法拿 js 生成頁面，至少我沒看過有人這樣做過
   - 基於客製化困難，頁面效果沒辦法太複雜
2. **除錯非常愚蠢：由於 Go 模板導致我們要在 themes/layouts 和自己的 layouts 之間來回比較才能除錯。除此之外，因為 partials 是插入功能，所以 trace code 變成使用編輯器的全局搜索功能才能順利找到問題**
3. 官方文檔內容陳述方式很爛，Go 模板功能很多人搞錯有一半原因是文檔講的不清不楚，現在改版了不知道寫的如何
4. 內建的 Chroma syntax highlight 很爛，語法大錯特錯
5. 沒有插件這種東西，想要新功能就是自己寫一個，還好 Github 有很多開源範例可參考
6. 沒有內建 broken link 檢查
7. 仍舊不是穩定版本

**樣式範例**

- [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
- [Blowfish](https://blowfish.page/)
- [reveal-hugo](https://themes.gohugo.io/themes/reveal-hugo/)
- [Toha](https://hugo-toha.github.io/)

# Docusaurus

**優點**

1. 文檔功能強大，部落格功能也很強大，適合撰寫文檔
2. 幾乎開箱即用，並且有很多[範例](https://docusaurus.io/showcase)可以找到原始碼開始修改
3. 完善的生態系統，甚至給你[配色版](https://docusaurus.io/docs/styling-layout#styling-your-site-with-infima)，社群插件也很多
4. 超級多的可調選項，背後有臉書就是厲害
5. 可使用 React 建立自訂頁面，例如[朝八晚八](https://from8to8.com/)整個部落格幾乎沒用內建的文檔頁面，以及 Docsaid 的[遊樂場](https://docsaid.org/playground/intro)頁面
6. SEO 功能完善
7. 內建 broken link 檢查
8. 使用 JS 撰寫設定檔，超級彈性

**缺點**

1. 醜不拉基
   - 最大問題是文檔頁面的排版，沒有要給讀者任何喘息空間，文字直接塞滿整個頁面給你滿滿的文字 creampie
   - 部落格右側的 ToC 超窄，文檔頁面的 ToC 寬度明明就正常
   - 畢竟我不是學前端的，自己改 layout 改 A 錯 B 最後放棄
   - 內建的 PrismJS syntax highlight 比 Hugo 更爛，語法大錯特錯，錯的比 Hugo Chroma 更誇張，尤其是 shell 語言
   - PrismJS 比 Hugo 更難修改，因為有些插件的功能是基於內建 code block，除非直接不用那些插件
   - PrismJS 改 HLJS 看起來遙遙無期，並非開發團隊的首要事項
2. 客觀事實上[不慢](https://docusaurus.io/blog/releases/3.6#docusaurus-faster)，但是每次刷新頁面就看到刷新條在那邊跑，心理上會覺得慢

**樣式範例**

- [zsl0621](https://zsl0621.cc/)
- [kuizuo](https://github.com/kuizuo/blog)
- [yeecord](https://yeecord.com/)
- [朝八晚八](https://from8to8.com/)
- [Docsaid](https://docsaid.org/)

# MkDocs

MkDocs 本身就是 Python 生態系出來的，我的心得也是把他拿來建立 Python 文檔就好，不適用於其他地方，有還算豐富的社群插件，略顯老態的 UI，緩慢的構建，幾乎是零的客製化空間。

**樣式範例**

- [uv](https://docs.astral.sh/uv/)
- [Pixi](https://pixi.sh/latest/)

# VitePress

因為 Docusaurus 的 syntax highlight 和排版實在太醜，又發現基於 shiki 的 VitePress 於是決定把我的 [Git 零到一百](https://zsl0621.cc/gitroad101/) 搬移到 VitePress。

**優點**

1. 非常好看，就算是文檔風格也是最好看的
2. 內建超強 syntax highlighting，基於 Shiki 和 TwoSlash 且無須任何設定開箱即用
3. hot update 開發時更新速度超快
4. 使用 markdown-it 可以輕鬆的擴充功能
5. 邏輯清晰的文檔，而且還有中文版
6. 支援關閉 SPA 改用 MPA 模式
7. 就算有一些內建樣式有點醜，也有完整的[社群教學](https://github.com/Yiov/vitepress-doc)教你優化且不難
8. 使用 TS 撰寫設定檔，超級彈性

**缺點**

1. 只適合寫文檔，不想寫文檔的話所有功能就要從零寫起
2. SEO 不佳，有些內容不是靜態的要靠 JS 渲染，例如 code block 內容
3. MPA 模式粗暴的關閉所有 JS，連切換亮暗模式都不能
4. 小問題是頁面路由還要自己寫程式，連移除 prefix 都沒有內建支援；大問題是不支援讀取 frontmatter slug
5. 使用自訂的 markdown-it 而不是一般的 markdown-it，導致客製化時需要額外除錯
6. 資源非常少
7. **按下內頁 anchor 後再回到上一頁，應該要回到剛才瀏覽的位置，但錯誤的回到 URL 位置而不是先前的瀏覽進度**

**樣式範例**

- [Git 零到一百](https://zsl0621.cc/gitroad101/)
- [vitepress-theme-trigger](https://github.com/laplacetw/vitepress-theme-trigger)
- [Shiki](https://shiki.style/)

# 同場加映

## Zola

同場加映 Zola，沒用過，作者是說因為 Hugo 的 Go 模板太愚蠢所以才自己寫 Zola，模板問題就是在 [Hugo](#hugo) 段落說明的那些。

以下是整理資料，基於 Rust 所以速度超快，大概 build 速度是 Hugo 10 倍，但是我沒那麼多文章，而且 Zola 的主題又少又醜，大部分主題也都停止更新，而且很多主題的 HTML 頁面設計不佳，瀏覽起來有卡頓感，所以沒有要遷移的打算。如果只是需要一個簡易的文字記錄網頁那 Zola 倒是很適合你，找一個 minimum design 的主體，寫再多 markdown 速度都很快。

## Eleventy, Astro, Gatsby, Next.js

沒用過，需要用戶是一個專職寫 JS 的才用的好這些工具。

# 總結

直接放棄 hexo，因為開發過程修改應用的速度慢，瀏覽體感也慢。Hugo 雖然有諸多缺點，但是每個語言都沒有太多額外框架要學所以倒沒那麼複雜，反而是 VitePress 要學整個 Vue 有點麻煩，因為 Vue 資源比起 Docusaurus 的 React 少太多了。總而言之

1. 依照語言選擇
   - Hugo: HTML + JS + 基礎 Go
   - Docusaurus: JS/TS + React
   - VitePress: TS + Vue
2. 如果需要進階客製化，需求的語言能力是 VitePress > Docusaurus > Hugo，VitePress 放在最難的原因是 Vue 資源少，而 Hugo 雖然需要很多語言，但是每個語言都是基礎用法
3. 對於進階客製化的擴展能力是 VitePress = Docusaurus > Hugo，如果再考慮除錯能力就是遠大於 Hugo
4. 依照外觀選擇，在沒有大量客製化的前提下我會選擇  VitePress > Docusaurus，和 Hugo 的選擇差別在於要不要寫文檔
5. 依照穩定性選擇，Hugo 仍然在測試階段，其餘兩個都是穩定階段
6. 依照金主爸爸選擇，Docusaurus 有臉書，其他都沒有
7. 整篇好像講了 Hugo 很多缺點，但是這個 [thread](https://discourse.gohugo.io/t/hugo-vs-astro-vs-nextjs-which-one-is-better-for-content-focused-website/42858) 很好的說明了為何我還留在 Hugo 的原因

請注意整篇都是非前端專業的心得，並且最重要的是文章內容而不是網站多好看，就算是這種[毫無裝飾](https://programmingisterrible.com/post/173883533613/code-to-debug)的網站文章還是超多人看。
