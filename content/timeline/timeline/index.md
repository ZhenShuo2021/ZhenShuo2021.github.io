---
title: 時間軸
date: 2024-08-15T00:49:30+08:00
draft: false
slug: timeline
summary: 
showSummary: false
noArchive: true
tags: []
categories: []
series: []
series_order: 
progress_bar: true
---

<!-- jQuery -->
<script  type="text/javascript"  src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<!-- nanogallery2 -->
<link href="https://unpkg.com/nanogallery2/dist/css/nanogallery2.min.css" rel="stylesheet" type="text/css"></link>
<script  type="text/javascript" src="https://unpkg.com/nanogallery2@3.0.5/dist/jquery.nanogallery2.min.js"></script>


這是一個隱藏頁面，比廢話更廢話的地方。

- 20241204  
扣掉發文那個本來就是來亂的以外，某特定族群敏感度特別高，戰鬥慾望特別強烈，理論特別奇怪。

<link href="https://unpkg.com/nanogallery2/dist/css/nanogallery2.min.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/nanogallery2@3.0.5/dist/jquery.nanogallery2.min.js"></script>
<link rel="stylesheet" href="{{ .Site.BaseURL }}/assets/css/nanogallery.css" />

<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<link href="https://unpkg.com/nanogallery2/dist/css/nanogallery2.min.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="https://unpkg.com/nanogallery2@3.0.5/dist/jquery.nanogallery2.min.js"></script>

<div id="nanogallery"></div>

<script>
    (function () {
        jQuery("#nanogallery").nanogallery2({
            itemsBaseURL: window.baseURL + "posts/timeline/",
            thumbnailWidth: "auto",
            thumbnailHeight: 200,
            galleryDisplayMode: "moreButton",
            galleryDisplayMoreStep: 1,
            viewerGallery: "none",
            imageTransition: "swipe",
            thumbnailLabel: {
                position: "onBottom",
                displayDescription: false,
                displayTitle: false,
                titleMultiLine: true
            },
            viewerToolbar: { display: false, standard: 'minimizeButton, label', minimized: 'minimizeButton, label, fullscreenButton, downloadButton, infoButton' },
            viewerTools: { topLeft: 'infoButton, label', topRight: 'pageCounter, playPauseButton, zoomButton, fullscreenButton, downloadButton, closeButton' },
            thumbnailBaseGridHeight: 50,
            thumbnailAlignment: 'fillWidth',
            thumbnailToolbarAlbum: null,
            icons: { thumbnailDisplay: '<i class="fa fa-long-arrow-right" aria-hidden="true"></i> display' },
            thumbnailDisplayTransition: 'slideDown',
            thumbnailDisplayTransitionDuration: 500,
            thumbnailDisplayInterval: 30,
            thumbnailHoverEffect2: 'label_translateY_0px_-20px|image_scale_1.00_1.10|image_rotateZ_0deg_2deg|image_translateY_0px_-20px|tools_opacity_0_1|tools_translateY_30px_0px',
            touchAnimation: true,
            touchAutoOpenDelay: 800,
            locationHash: false,
            items: [
                { src: "20241204/Screenshot_20241204_193944.webp", srct: "20241204/Screenshot_20241204_193944.webp", description: '1' },
                { src: "20241204/Screenshot_20241204_194000.webp", srct: "20241204/Screenshot_20241204_194000.webp", description: '2' },
                { src: "20241204/Screenshot_20241204_194011.webp", srct: "20241204/Screenshot_20241204_194011.webp", description: '3' },
                { src: "20241204/Screenshot_20241204_194107.webp", srct: "20241204/Screenshot_20241204_194107.webp", description: '4' },
                { src: "20241204/Screenshot_20241204_194121.webp", srct: "20241204/Screenshot_20241204_194121.webp", description: '5' }
            ],
        });
    })();
</script>



- 20241203  
南韓戒嚴的半小時後發現了兩個白癡。  
第一個是三立，馬上發了一篇垃圾新聞，又在抄網路留言下噁心流量標題。第二個是網友，韓國人都不知道發生什麼事情，就他最清楚，連軍方在想什麼都知道，傻子永遠不會知道自己是傻子，不用多聰明至少嘴巴閉上好嗎。這位網友的臉書毫不意外的又是一堆特定傾向政治文章，這個族群傻子比例真的特別高。

- 20241030
看了 [這個事情就是台灣麥當勞的錯！](https://www.youtube.com/watch?v=H-8ix1dSi4g) 做錯事發個口是心非的道歉聲明，最愚蠢的是開小號嗆網友，其實到這裡我都覺得沒差，結果去 [網紅獎典禮發文](https://www.instagram.com/p/DBqng-zyA0Q/?utm_source=ig_web_copy_link) 「保持善良 繼續努力」，之後他的錢肯定還是能繼續賺啦，賣大麻（吸跟賣完全兩回事自己翻刑法）的都能萬人大台了，台灣人是不是又傻又蠢。

- 20241012
連 [yt-dlp](https://github.com/yt-dlp/yt-dlp/issues/1918) 將近 100k stars 都沒有做多執行緒了，我當時想幫我的 P5D 寫多執行緒還真是想太多了啊。

* 20240822  
看了[這個](https://www.facebook.com/groups/honestaudio/posts/3643080962672094)更覺得應該要自託管文章，或者至少做好基礎備份，Github 被盜了至少電腦裡還有一份，如果多處部署還有多個鏡像網站可以用，至少不會像這樣被盜之後整組壞掉。

* 20240815  
這次[更新](/posts/20240728/)順便把主題從 Blowfish 改成 Fire，在本地看正常就推上 Github 了，結果吃個飯回來看主題還沒變，想說是不是 Cloudflare 快取取到了，在 Cloudflare 刪了好幾次都沒用，想說不可能跟網域 DNS 有關吧把 DNS 刪掉換名都沒用，最後才發現本地 Fire 大寫沒差，Github 自己的 Hugo 對大小寫敏感...我明明都指定同一個 Hugo 版本 extend version 也沒裝錯，什麼神奇 bug。