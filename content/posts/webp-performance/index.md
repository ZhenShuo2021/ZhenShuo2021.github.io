---
title: "WebP圖片壓縮與解碼性能"
date: 2024-06-20T21:30:40+08:00
draft: false
description: 
summary: WebP 與 AVIF 的壓縮率比較
tags: ["影像處理", "筆記"]
categories: ["科技新知"]
# series_order: 1
---

# TL;DR

![WebP Performance by Google WebP Project Group](https://cdn.zsl0621.cc/2025/blog/webp-performance---2025-05-09T12-01-03.png)

# 正文

最近用WebP轉存圖片轉得很開心，壓二次元圖隨便都是80%以上壓縮率，現在來關心一下他的解碼性能。

根據 [Google Group 的討論](https://groups.google.com/a/webmproject.org/g/webp-discuss/c/hn3LwO6_bS0)， WebP 的解碼速度是弱於 JPG 的，畢竟 JPG 都已經發展這麼久了軟硬體都已經很成熟。這麼說來 WebP 除了壓縮率以外沒有優勢嗎？並不是， WebP 是為了網路而生，把下載時間也算進來整體載入速度是提高的，如果有增量解碼載入速度提升更多。

至於轉換品質，[這裡](https://www.industrialempathy.com/posts/avif-webp-quality-settings/)有一個懶人包的設定，簡單來說80~85是一個甜蜜點。  
{{< hint info >}}
不過對於此設定我有找到幾個問題

1. 他沒有給單位映射，libavif quality 為0\~63，他把全部都換成1\~100了。  
2. 他使用 DSSIM 而非常見的 SSIM 作為指標。  
3. 根據圖片不同可能轉了之後反而容量更大。  
{{< /hint >}}

# 參考資料

1. [Comparative Analysis on WebP and JPEG Decoding Performance, Google Group, Oct. 2023.](https://groups.google.com/a/webmproject.org/g/webp-discuss/c/hn3LwO6_bS0)
2. [AVIF and WebP encoding quality settings, cramforce@Github, Feb. 2021.](https://www.industrialempathy.com/posts/avif-webp-quality-settings/)
3. [Contemplating Codec Comparisons, JON SNEYERS, Cloudinary, Dec. 2022.](https://cloudinary.com/blog/contemplating-codec-comparisons)
4. [Lossless and Transparency Encoding in WebP, J. Alakuijala and V. Rabaud, Google Inc., Aug. 2017.](https://developers.google.com/speed/webp/docs/webp_lossless_alpha_study)
