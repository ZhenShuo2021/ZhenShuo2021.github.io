---
title: "Hugo Blowfish 的基礎設定"
date: 2024-07-01T12:01:01+08:00
lastmod: 2024-07-22
draft: false
summary: Hugo Blowfish 的基礎設定教學（或者說紀錄）。
description: "介紹如何對 Hugo Blowfish Theme 進行基礎設定與配置，包括修改 permalink、frontmatter 及如何避免網頁被 Google 搜尋。"
tags: ["Hugo", "筆記"]
categories: ["Hugo"]
series: ["自架 NAS 紀錄"]
series_order: 2
---

Blowfish 是高度客製化的主題，一進去 config 也是多到眼花撩亂，這邊稍微紀錄一下本站的設定。

# 1. 基本知識
Hugo 對於渲染設定都放在 assets 以及 layouts 資料夾中，如果主資料夾有檔案就會使用主資料夾的檔案進行渲染，反之用 theme 資料夾的對應檔案夾進行渲染。

Public 是完整的網站，不用動他，但是要部屬網站時可以清掉 .git 以外的檔案清除調試時生成的檔案。

Static 中的檔案會原封不動放到 public 中，而 assets 中的檔案會被 Hugo 處理。以 blowfish 而言，static 放 robots.txt 等設定文件，圖片/custom.css/js 都放在 assets。

# 2. 設定 permalink
從一開始就做好檔案管理，詳情請見 [調整Hugo的permalinks，讓不同目錄下的頁面產生同一個網址](https://ivonblog.com/posts/same-url-for-hugo-pages-from-different-sections/)

# 3. 修改預設 frontmatter
把 `archetypes/default.md` 改成

```
---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: {{ .Date }}
draft: true
summary: 
tags: []
categories: []
series: []
series_order: 
progress_bar: true
---
```

# 4. 設定網頁不被 Google 搜尋
noindex 為不被搜尋索引，nofollow 為不被索引頁面連結，[來源](https://www.yesharris.com/seo-basic/meta-robots-and-robots-txt/)。  

在 front matter 中加入 `robots: "noindex, nofollow"`。  

# 5. ToDo
1. ~~超連結~~
2. ~~增加 ToC 寬度~~
3. 修改 ToC 字體大小
4. ~~邊界線對比度過低~~
5. ~~文字對比度過低~~
6. ~~閱讀進度~~
7. ~~深色模式中超連結的顏色~~
8. ~~深色模式中所有文章的日期顏色~~