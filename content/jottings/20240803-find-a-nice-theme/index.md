---
title: 20240803 好用的主題也不好找
date: 2024-08-03T15:45:04+08:00
draft: false
summary: 
showSummary: false
tags: 
  - Hugo
categories: 
  - 隨筆
series:
series_order: 
progress_bar: true
---

# 開頭

[上一篇](/posts/20240730/)寫完那個表格之後感到一股火，對比度實在太低了寫到很不爽，又深深感到 blowfish 配色真的是要大改，有夠不清楚，從[問題修復](/posts/hugo-blowfish-fix)到[進階客製化](/posts/hugo-blowfish-features)已經改夠多東西了，連基礎的語法渲染都改成 highlight.js，現在還有表格，之後不知道還會發現多少東西要改，才想到我幹嘛不直接找一個配色正常的模版來用，改 code 就算了調整配色我完全不會啊。除此之外也發現對於知識網站來說 blowfish 沒有左側 list 可以方便查詢。

照慣例要先有需求才有目標，網路上很多文章都沒提到這點。作為個人知識庫來說，我的需求是：

- 主要是找 docs 類的主題
- 右側 ToC 有目前位置 highlight 顯示
- 左側列表折疊功能而不是進入新網頁
- 需要解決對比度問題
- 有基礎設計感，不然我直接寫 latex 不就好了
- 最好能整合部落格進去，不強求

# 主題比較

於是找了 [awesome-hugo-themes](https://github.com/QIN2DIM/awesome-hugo-themes)（github上好像滿多 awesome-xxx 的表格可以看的，例如 awesome cloudflare, awesome self-hosted），沒想到這麼多主題沒半個可以，這邊回顧一下這些主題

1. [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 沒有左側列表
2. [Stack](https://github.com/CaiJimmy/hugo-theme-stack) 沒有左側列表
3. [Book](https://github.com/alex-shpak/hugo-book) 醜，ToC 沒有目前位置
4. [Coder](https://github.com/luizdepra/hugo-coder) 醜，沒有左側列表
5. [Docsy](https://github.com/google/docsy) 醜，ToC 沒有目前位置，左側列表會開啟新網頁
6. ✨ [Doks](https://github.com/gethyas/doks) 好看，和 [Thulite](https://thulite.io/) 同一套系統，feature by Full speed/Max secure
7. [Toha](https://github.com/hugo-toha/toha) 好看，主要功能感覺是自我介紹的作品集網站，但是 doc 和 blog 功能也做出來了

## Doks

看到又快又安全還能不心動嗎，於是選擇了 Doks，然後就遇到各種問題：h1 只能放標題，ToC 只顯示到 h3，npm run dev？我的 hugo server 呢，為甚麼 layouts 裡幾乎啥都沒有？稍微研究才知道 npm 這個套件管理器，但是連基礎 layouts 都放在套件包裡面，然後總共用了**256個套件...**太扯了吧，然後好不容易找到我要改的套件，改老半天發現 Doks 的表格一樣對比度低，front matter **不用他限定的直接停機**，deploy 問題很多[^1]，youtube embed 是用 hugo 內建的 iframe[^3] 而不是 npm youtube lite （都標榜很快套件也 256 個了不捨得用這個==?雖然很好改），甚至連渲染都會有 render hook 的問題[^2]，照他的解法還不是絕對成功，katex 語法也跟其他人不太一樣（讀不到\footnotesize語法），雖然都能解決但就很麻煩，我是來找現成的不是繼續幫自己搞事的，然後最後一根稻草是井字開頭如果幫他加上數字比如 `# 1. xxx` ToC highlight 功能直些失效...

[^1]: https://github.com/gethyas/doks/discussions/696
[^2]: https://github.com/gethyas/doks/discussions/1261
[^3]: https://github.com/gethyas/doks/discussions/631

# 其他主題

一開始沒找其他 Docs 主題的原因是上千星星的主題問題都一堆了，找那些名不見經傳的更可怕，不過寫這篇的同時看了一下，例如 [hugo-theme-bootstrap](https://github.com/razonyang/hugo-theme-bootstrap) 還算符合需求就是花了點，[hextra](https://github.com/imfing/hextra) 和 [docura](https://github.com/docura/docura) 感覺也還不錯，果然寫作還是能帶來一些好處，不然根本放棄了不會去看這些幾百星星的主題，不過有空再看看吧，暫時懶得改了。

# 心得

使用主題的 shortcode 時，盡量只用幾個常見的例如 expand (details), alert (info) 之類，嘗試遷移到 Doks 浪費很多時間在刪這些。之後 blowfish 應該是當作這種碎碎念部落格，資訊類的乖乖放在 docs 類的就好了。
