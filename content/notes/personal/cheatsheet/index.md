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

# Python
pip 一次刪除所有套件
```sh
pip freeze | xargs pip uninstall -y && rm -rf build
```

H.264 and H.265 Hardware Decoding  
https://www.pugetsystems.com/labs/articles/What-H-264-and-H-265-Hardware-Decoding-is-Supported-in-Premiere-Pro-2120/

Github markdown highlight
https://github.com/orgs/community/discussions/16925  

docusaurus