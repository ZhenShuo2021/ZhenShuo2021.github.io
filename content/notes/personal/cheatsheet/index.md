---
title: '小抄'
date: 2024-08-17T11:24:23+08:00
draft: false
summary: "各種指令用的小抄"
showSummary: true
tags: []
categories: []
series: []
series_order: 
progress_bar: true
---

# magick

轉換資料夾到 WebP 加上 crop，crop 參數為 "長x寬+起始寬度+起始高度"
```sh
magick mogrify -format webp -quality 80 -crop 2000x800+300+420 *.png
```