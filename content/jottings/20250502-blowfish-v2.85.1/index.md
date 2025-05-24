---
title: 20250502 Blowfish v2.85.1
date: 2025-05-02T20:28:43+08:00
create_data: 2025-05-02T20:28:43+08:00
draft: false
summary: 
showSummary: false
tags: 
  - Hugo
  - 隨筆
categories: 
  - 隨筆
series:
series_order: 
progress_bar: true
---

紀念一下在 Blowfish 連發三個 PR，結果 [v2.85.1 這個 release](https://github.com/nunocoracao/blowfish/releases/tag/v2.85.1) 就只有我一個 contributor 了，ㄎㄎㄎ。

有些問題解決方式是很簡單，但是找出問題在哪很花時間阿，還要翻 Hugo 文檔，研究後還要再想想看這方法好不好，有沒有奇怪併發問題等等，雖然沒幾行但三個 PR 還是花了四五個小時。

Hugo 是適合創作者而不是開發者的工具，debug 跟傻子一樣，如果單純要用 Hugo 來寫文章非常好，構建反應都很快，但是要開發那就痛苦了，模板功能超難除錯，Hugo 上游又三不五時改語法，拜託誰吃飽太閒每天看你 release note，感受到的就只有乾又要改，而且還要搞懂他的渲染管道還有變數傳遞才能寫，除此之外因為模板的關係明明是寫前端卻要寫 go，就算很熟 go 好了，Hugo 還有些 go 語法不支援有夠搞人，真要開發這個會寫前端的幹嘛不直接寫 JS 就好了，不過速度是真的很快主題也多，重點是我 JS 不行，所以還是用下去吧。
