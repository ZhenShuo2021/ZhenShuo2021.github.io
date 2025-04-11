---
title: "Hugo Blowfish 的基礎設定"
date: 2024-07-01T12:01:01+08:00
lastmod: 2024-07-28
draft: false
summary: Hugo Blowfish 的基礎設定教學（或者說紀錄）。
description: 
tags: ["Hugo", "筆記"]
categories: ["Hugo"]
series: ["自架 NAS 紀錄"]
series_order: 4
---

Blowfish 是高度客製化的主題，一進去 config 也是多到眼花撩亂，這邊稍微紀錄一下本站的設定。

# 0. 安裝

如果要安裝舊版會發現用 homebrew 會想罵髒話，這裡放上安裝指定版本的[方法](https://gohugo.io/installation/linux/#build-from-source)，其中 @latest 改成 @v0.129.0。

# 1. 基本知識

Hugo 對於渲染設定都放在 assets 以及 layouts 資料夾中，如果主資料夾有檔案就會使用主資料夾的檔案進行渲染，反之用 theme 資料夾的對應檔案夾進行渲染。

Public 是完整的網站，不用動他，但是要部屬網站時可以清掉 .git 以外的檔案清除調試時生成的檔案。

Static 中的檔案會原封不動放到 public 中，而 assets 中的檔案會被 Hugo 處理。以 blowfish 而言，static 放 robots.txt 等設定文件，圖片/custom.css/js 都放在 assets。

# 2. 設定 permalink

從一開始就做好檔案管理，詳情請見 [調整Hugo的permalinks，讓不同目錄下的頁面產生同一個網址](https://ivonblog.com/posts/same-url-for-hugo-pages-from-different-sections/)

# 3. 修改預設 frontmatter

把 `archetypes/default.md` 改成

```md
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

# 5. 修改內容預覽

接下來兩篇的修改內容包含：  
問題修復

1. 標籤與分類分別顯示
2. 文章封面
3. 改善對比度
4. 網站 logo
5. 網頁標籤名稱
6. 註腳（文章引用）
7. 美化選集功能
8. 關閉相關文章簡介
9. 文章資訊間隔符號
10. 模糊設定

進階客製化

1. 超連結
2. 文章存檔頁面
3. 閱讀進度
4. 簡碼 - hint
5. 簡碼 - expand
6. 自動加上編輯時間
