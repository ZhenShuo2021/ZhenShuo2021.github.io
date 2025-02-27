---
title: 'TrueNAS Docker'
date: 2024-07-28T22:52:57+08:00
draft: false
summary: "列出幾個常見的 docker-compose.yml 以便一鍵部屬。"
tags: ["NAS", "Docker", "cheatsheet"]
categories: ["NAS"]
series: ["自架 NAS 紀錄"]
series_order: 3
progress_bar: true
---

# 前言
弄完基礎的檔案分享設定之後就是玩 docker，本文列出幾個常見的 docker-compose.yml 以便一鍵部屬。

還有個好消息，TrueNAS 在 2024/10 月版本將要放棄 k3s 改用 docker，這裡先放上幾個 docker-compose.yml，對相簿選擇障礙的可以看[這裡](https://github.com/meichthys/foss_photo_libraries)。

# Immich
版本：v1.108.0   
這是最推薦的自架相簿，有些人可能會擔心他會破壞資料夾結構，尤其是攝影師，不過使用[外部庫](https://immich.app/docs/guides/external-library/)掛載就沒有這個問題。  
由於現在還在非常積極發展的階段，建議掛載後加上`:ro`唯獨以免誤刪。

docker-compose.yml: 改掛載路徑就可用
{{< codeimporter url="https://github.com/ZhenShuo2021/blog-script/raw/main/docker-compose/immich%20docker-compose.yml" type="yaml" >}}
.env: 改掛載路徑就可用
{{< codeimporter url="https://github.com/ZhenShuo2021/blog-script/raw/main/docker-compose/immich.env" type="yaml" >}}

# PhotoPrism
版本：240531-60b3a4628  
比起相簿他更像是畫廊，有各種圖片檢視方式，而 immich 是以時間軸為核心的瀏覽方式。最大的差別是免費版沒有帳號控制，一個 PhotoPrism 實例就是一個帳號。  

docker-compose.yml: 改掛載路徑/帳號密碼就可用，那堆環境設定基本上用不到。  
{{< codeimporter url="https://github.com/ZhenShuo2021/blog-script/raw/main/docker-compose/photoprism%20docker-compose.yml" type="yaml" >}}

# LibrePhoto
版本：不重要（2024/07）  
如果你很喜歡他的 UI 就用吧，問題有點多，對我來說最有用的功能是圖片排序選項有隨機。  

.env: 改掛載路徑/帳號密碼就可用，docker-compose「不能動」
{{< codeimporter url="https://github.com/ZhenShuo2021/blog-script/raw/main/docker-compose/librephoto.env" type="yaml" >}}

# Plex
版本：1.40.4.8679-424562606  
這個是網路上抄來的，不曉得為何很難找（跑得動的）。進去之後記得要把不安全網路打勾，因為一般來說內網連線沒有 https，不打勾連伺服器 (NAS) 都看不到  

docker-compose.yml: 改掛載路徑/PLEX_CLAIM/ADVERTISE_IP就可用  
{{< codeimporter url="https://github.com/ZhenShuo2021/blog-script/raw/main/docker-compose/plex%20docker-compose.yml" type="yaml" >}}

# Stash
版本：0.26.2  

docker-compose.yml: 改/data路徑就可用，其他元資料改不改都可以
{{< codeimporter url="https://github.com/ZhenShuo2021/blog-script/raw/main/docker-compose/stash%20docker-compose.yml" type="yaml" >}}

# Lanraragi
版本：0.9.10  

docker-compose.yml: 改掛載路徑就可用，注意修改密碼要重啟才會生效
{{< codeimporter url="https://github.com/ZhenShuo2021/blog-script/raw/main/docker-compose/lanraragi%20docker-compose.yml" type="yaml" >}}

# Stirling PDF
版本：0.26.0  

docker-compose.yml: 改掛載路徑就可用
{{< codeimporter url="https://github.com/ZhenShuo2021/blog-script/raw/main/docker-compose/stirling-pdf%20docker-compose.yml" type="yaml" >}}
