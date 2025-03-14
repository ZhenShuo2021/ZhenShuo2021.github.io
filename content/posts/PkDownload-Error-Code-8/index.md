---
title: macOS 是我看過最糟糕的系統安裝方式
date: 2025-03-14T04:33:24+08:00
create_data: 2025-03-14T04:33:24+08:00
draft: false
summary: 
showSummary: false
tags: [macOS, 碎唸]
categories: [macOS, 碎唸]
series: []
series_order: 
progress_bar: true
---

筆者系統裝了將近百次，Windows 從 Win2000 開始到 XP, Vista, Win7, Win8, Win10, Win11，從實體機到虛擬機，一路到 TrueNAS 和 OMV，到沒有圖形介面的 Ubuntu Server，到試著玩玩看的 Zorin OS 都裝過從沒遇到什麼大問題，唯獨 macOS 差點把我難倒...

<!-- truncate -->

本文是日記，只想看解決方式請找原文 [记一次安装 macOS 时 PKDownloadError 8 的解决方案](https://naiv.fun/Ops/109.html)。

---

由於沒重灌過 mac 所以第一步當然是先上網找資料，很幸運的找到 [osslab 的文章](https://www.osslab.com.tw/reinstall-macos/)，以前就看過他們介紹 ZFS 的文章所以對他們的文章內容還是很有信心的，裡面說 Apple Silicon 之後就不能透過官網下載開機 USB 只能透過網路安裝，流程如下：

1. 一樣是清除磁碟，如果要完全清除設定還要多一個**登出 iCloud** 的步驟
2. **進入復原模式**，這時你才看的到**隱藏的掛載點**，裡面是復原系統
3. 復原系統會去 swcdn.apple.com **下載 InstallAssistant.pkg**
4. 自動完成安裝

請注意我是第一次安裝根本不知道這個流程，跟網路上的新手一樣沒有任何知識，粗體字代表和一般系統安裝方式不一樣。mac 完全不需要自備 iso 檔看起來很棒，但是安裝如標題所述失敗了，而且這個錯誤很噁心，他會在 InstallAssistant.pkg 完整下載之後才報錯，你知道每次下載都要將近半小時嗎！噁心也不是我第一個說的，網路上也有[其他人講過一樣的問題](https://www.bilibili.com/opus/595066361655121753)，而且第一次裝根本不知道哪裡出問題也不知道可以看 Log，想說網路上教學都很簡單放著讓他自己跑就好，結果連出問題都後知後覺。

接下來找到日誌開始除錯，這時候離開始安裝已經經過一個多小時了，又要重跑一次才定位的到錯誤日誌，pkg 檔高達 13GB 每重跑一次就是三十分鐘起跳，而且復原系統裡面的日誌字體超小，每個字不到 0.2 cm<sup>2</sup> 是在搞人嗎，系統裝不起來就已經很火大了還要忍受網路和超小字體，接下來就是各種嘗試，試過的解決方式有

1. 搜尋錯誤代碼 0x600002bcd590，一個搜尋結果都沒有，從沒遇過網路上找不到錯誤代碼，一般就算是沒用資訊至少都還是查的到一兩個搜尋結果
2. 換 DNS  
直接到路由器系統修改 DNS，依序設定過以下幾個 DNS
   - 1.1.1.1
   - 8.8.8.8
   - 8.8.4.4
   - 208.67.222.222 (OpenDNS)
   - 208.67.222.220 (OpenDNS)
   - 自動
1. 關路由器防火牆
2. 直接連接主路由，不經過 AP 連線
3. 修正時間，開啟終端設定 `date -u 0123040525` 代表改成一月二十三號，早上四點零五分，2025年
4. 全部一起測試

這些東西測試完就花了三四個小時了全都沒用，Grok Claude ChatGPT 全問過了無用，覺得山窮水盡差點要花錢給人修的時候才找到救星 [记一次安装 macOS 时 PKDownloadError 8 的解决方案](https://naiv.fun/Ops/109.html)，這篇文章的大意是在其他裝置手動完成步驟三的下載，如此一來就不用透過 mac 復原系統下載，這時候問題又來了

1. M1 Mac 只有 Type-C，我沒有 Type-C USB
2. 沒關係，我有 USB-C to A 的 Hub

於是做了這輩子第一次的蠢事：拿著超大的 Hub 接著 USB 插在手機上，下載一個 13GB 的電腦安裝檔，又經過半小時下載完成，結果在復原系統裡讀不到 Hub！我真的會吐血，這不是我忘記掛載 USB 的問題，是他壓根就讀不到 Hub，超級傻眼，已經在想該不會要衝 Nova 買 USB-C 隨身碟了吧，那如果他連 USB-C 直接接上都讀不到那不就又白花錢了嗎？

這時靈光一閃，還記得開頭講到的 TrueNAS 嗎？我終於想到他了，我是不是可以用 NAS 下載，然後在復原模式裡面掛載 SMB 讀取？說試就試，進入復原系統開啟終端機測試是否能掛載：

```sh
cd '/Volumes/Macintosh HD'
mkdir private/tmp/zsl0621
mount_smbfs //username:password@192.168.50.97/zsl0621 private/tmp/zsl0621
```

還真的可以，那接下來就好辦了，手機打開 Termius SSH 連線進入 NAS 系統，使用 `wget` 下載剛剛抄下來的網址

```sh
wget -O /path/to/InstallAssistant.pkg https://swcdn.apple.com/content/downloads/32/49/072-84039-A_JPGNVJRH1M/cazcuskjdk6y6yrviytxanoevr5ihmz9lb/InstallAssistant.pkg
```

> 盯著每個都不到 0.2cm<sup>2</sup> 的字把這些抄下來有夠痛苦，注意 URL 可能會改變，請在[這個網站](https://mrmacintosh.com/macos-sonoma-full-installer-database-download-directly-from-apple/)搜尋，建議從安裝日誌裡面手抄 URL 才是最正確的。

等待半小時下載完成，最後一樣按照 Nativus' Space 裡面的教學完成，只須稍微修改路徑，步驟如下

> 将内置的安装器复制到刚刚创建的临时文件夹中。
>
> 为什么一定要复制？因为 / 目录大小有限，可以 df -h 看看。
>
> ```sh
> cp -R '/Install macOS Ventura.app' private/tmp
> ```
>
> 将下载好的安装文件复制到指定目录下。
>
> ```sh
> cd 'private/tmp/Install macOS Ventura.app'
> mkdir -p Contents/SharedSupport
> cp '/Volumes/你U盘的名字/InstallAssistant.pkg' Contents/SharedSupport/SharedSupport.dmg
> ```
>
> 这里把 In­stal­lAs­sis­tant.pkg 已经重命名为了 Shared­Sup­port.dmg。原因是 ma­cOS 安装过程要在这个位置找到包含安装数据的 dmg 文件 (磁盘映像)。
>
> 最后运行我们修改过的安装器
>
> ```sh
> ./Contents/MacOS/InstallAssistant_springboard
> ```

終於完成 macOS 安裝，這是我用過最愚蠢的作業系統安裝方式。

裝過接近百次的作業系統遇過手殘眼殘腦殘的都是自己的問題，第一次遇到安裝系統本身就就已經殘的，最愚蠢的莫過於在同一個網路環境下，安卓手機可以下載，自組的 TrueNAS 可以下載，結果堂堂的 mac 竟然沒辦法下載自己家的東西，還我六個小時。
