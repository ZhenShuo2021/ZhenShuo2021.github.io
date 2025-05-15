---
title: 好用的免費軟體
date: 2024-09-23T21:51:36+08:00
draft: false
summary: 
showSummary: false
tags:
  - 實用工具
categories:
  - 工具
series:
series_order: 
progress_bar: true
---

記錄一些好用的免費軟體/工具/開源項目，😇代表有 GUI。

# 工具人專屬

## OS

- Ventoy: 多系統開機碟
- Tiny10: 基於 Win10 LTSC 2021 的精簡版系統，但是中文超難裝！中文超難裝！中文超難裝！
- TrueNAS: 最好的開源 NAS 系統，但是硬碟事後添加不方便
- OMV: 開源 NAS 系統，沒用過但是經研究 Bug 算有（NAS 不允許 Bug）
- Unraid: 讀寫性能孱弱的 NAS 系統，收費，優點在社群友善且 Docker 安裝容易
- Proxmox: 虛擬機系統
- [windows](https://github.com/dockur/windows): 在 Docker 中跑 Windows
- [Docker-OSX](https://github.com/sickcodes/Docker-OSX): 在 Docker 中跑 MacOS
- 微PE工具箱: WinPE 修復用系統
- USBOX: 台灣人做的 WinPE
- rgadguard: 微軟 iso 集合網站
- diskgenius: 硬碟用的工具包，[系統遷移範例](https://www.youtube.com/watch?v=hy4IVjbDQuc)

## Windows 設定

- [windows-update-killer](https://github.com/Aetherinox/windows-update-killer): 暫停 Windows 更新，看起來是可以直接在更新頁面手動更新
- [windows-update-disabler](https://github.com/tsgrgo/windows-update-disabler): 停止 Windows 更新，需使用啟用腳本才可更新
- [UAC](https://helpcenter.trendmicro.com/zh-tw/article/tmka-08006/): 用過 Linux 真心覺得 Windows 的 UAC 煩到不行
- [CLI 軟體安裝](https://blog.darkthread.net/blog/chocolatey-scoop-winget/)

## File System

包含所有文件管理和文件伺服器等

- [Files](https://github.com/topics/windows): 開源的 Windows 文件系統，反覆橫跳 Win Mac 後還真覺得 Windows 難用
- SFTPGo: 使用 SFTP （基於SSH）的文件伺服器
- 7-Zip: 無須多言吧，方便免費[開源](https://github.com/mcmilk/7-Zip-zstd)的壓縮工具
- diskgenius: 硬碟用的工具包
- FileZilla-FTP，FTPS和SFTP客户端

## Misc

- [更好的終端機](https://github.com/thechampagne/awesome-windows/blob/main/README-cn.md#%E7%BB%88%E7%AB%AF)
- [PowerShell](https://github.com/PowerShell/PowerShell): 微軟官方的 PowerShell
- [Terminal](https://github.com/microsoft/terminal): 微軟官方的終端機
- [Calculator](https://github.com/microsoft/calculator): 微軟官方的小算盤
- [PowerToys](https://github.com/microsoft/PowerToys): 瑞士刀，請見[教學](https://www.youtube.com/watch?v=EAoIGJjWdbA)

# 軟體工具

## 影像處理

- 😇 [upscayl](https://github.com/upscayl/upscayl): AI 圖片超解析
- 😇 ImageOptim: 壓縮圖片，沒研究但我猜是用開源演算法壓的。
- 😇 HandBrake: 壓縮圖片，沒研究但我也是用開源演算法壓的，比 ImageOptim 功能更多。
- ImageMagick: 最好的圖片轉換，包括轉換格式、壓縮、裁切各種功能
- XnConvert: 圖片轉換，很難用

## 相片處理（攝影）

- 😇 FastStone: 高效 Raw 檔檢視軟體
- 😇 Photopea: 開源的 PhotoShop 替代者
- LightRoom: 替代者候補中[[1]][https://www.techradar.com/best/best-lightroom-alternatives]([2)](https://opensource.com/alternatives/adobe-lightroom)

## Remote Access

- RustDesk: 開源遠端桌面
- TeamViewer: 三者最好
- AnyDesk: 鍵盤跳針跳兩年了永遠修不好= =

## Security

- [nikto](https://github.com/sullo/nikto): 弱點掃描工具，基礎指令
- 😇 [OWASP ZAP](https://www.zaproxy.org/): 網頁滲透測試
