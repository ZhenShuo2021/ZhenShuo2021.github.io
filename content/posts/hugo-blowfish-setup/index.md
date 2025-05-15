---
title: Hugo Blowfish 的基礎設定
date: 2024-07-01T12:01:01+08:00
lastmod: 2024-07-28
draft: false
summary: Hugo Blowfish 的基礎設定教學（或者說紀錄）。
description: 
tags:
  - Hugo
  - 筆記
categories:
  - Hugo
series:
  - 自架 NAS 紀錄
series_order: 4
---

Blowfish 是高度客製化的主題，一進去 config 也是多到眼花撩亂，這邊稍微紀錄一下本站的設定。

# 0. 安裝

如果要安裝舊版會發現用 homebrew 會想罵髒話，這裡放上安裝指定版本的[方法](https://gohugo.io/installation/linux/#build-from-source)，其中 @latest 改成 @v0.129.0。

# 1. 基本知識

一個 Hugo 專案的資料夾結構應該是這樣：

```sh
├── assets               # Hugo 可以存取此目錄的檔案
├── archetypes           # hugo new content 的模板
│   └── default.md
├── config               # 設定檔路徑，有些主題會直接放在專案根目錄
│   └── _default
├── content              # markdown 文件位置
├── data                 # Hugo 渲染時可以讀取的額外數據
│   └── months.toml
├── i18n                 # 國際化設定
│   ├── en-us.yaml
│   └── zh-TW.yaml
├── layouts              # 最重要的資料夾，每個主題的樣式設定
│   ├── _default         # _default 目錄中的樣式套用在絕大多數的頁面
│   ├── partials         # partials 目錄的檔案可以被其他 layouts 檔案插入，插入方式很簡單，就是一字不動
│   └── shortcodes       # 在 markdown 裡面使用的短碼，這樣就可以在 md 文件中使用各種不同功能
├── public               # 構建出的 HTML 網站目錄
├── static               # 此目錄會被 "原封不動" 的複製到 public 資料夾，也就是你的網站
└── themes               # 使用的主題
    └── blowfish
```

1. Hugo 對於渲染設定都放在 assets 以及 layouts 資料夾中，如果**根目錄的資料夾有檔案，就會使用該檔案進行渲染**，反之用 theme 資料夾的對應檔案夾進行渲染。
2. Public 是完整的網站，不用動他，但是要部屬網站時可以清掉 .git 以外的檔案清除調試時生成的檔案。
3. Static 中的檔案會原封不動放到 public 中，而 assets 中的檔案會被 Hugo 處理。static 放 robots.txt 等設定文件，圖片/custom.css/js 都放在 assets。
4. 圖片到底要放在 static 還是 assets？**沒有肯定答案，試過才知道**。像是 blowfish 主題其實就沒有嚴謹的說應該放在哪，查看原始碼有些可以 static 有些不行。

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
