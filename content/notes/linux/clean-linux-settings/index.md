---
title: '清除 Linux 殘存設定'
date: 2024-07-19T07:07:30+08:00
draft: true
slug: 'clean-linux-settings'
summary: 
tags: ["Linux", "指令筆記"]
categories: ["筆記"]
series: []
series_order: 
---

在 ubunutu server 安裝 gallery-dl 時，由於之前有安裝過導致錯誤的設定殘留，在網路上查老半天都找不到要怎麼清除，最後還是請出 GPT 大神，基礎操作類他還是很擅長的。這裡也給其他網路上的資訊 https://ivonblog.com/posts/linux-uninstall-application/。

{{< expand "看 Claude 3.5 sonnet 的回答 " >}}

好的，讓我們徹底清理所有 gallery-dl 的安裝和設定。以下是完整的步驟：

移除 snap 版本：
```shell
sudo snap remove gallery-dl
```

移除 pip 安裝的版本：
```shell
pip uninstall gallery-dl
pip3 uninstall gallery-dl
```
移除用戶級安裝：
```shell
rm -rf ~/.local/lib/python*/site-packages/gallery_dl*
rm -f ~/.local/bin/gallery-dl
```

刪除配置文件：
```shell
rm -rf ~/.config/gallery-dl
rm -f ~/.gallery-dl.conf
```

檢查並刪除任何殘留的 gallery-dl 目錄：
```shell
find ~ -name "*gallery-dl*" -type d
```
如果找到任何目錄，使用 rm -rf 刪除它們。
清理 pip 緩存：
pip cache purge

檢查是否有系統級安裝：
```shell
sudo find /usr/local -name "*gallery-dl*"
```
如果找到，使用 `sudo rm -rf` 刪除。
更新 shell 配置：
編輯 `~/.bashrc、~/.bash_profile` 或 `~/.profile`，移除任何與 `gallery-dl` 相關的 `PATH` 或環境變量設置。
重新加載 shell 配置：
```shell
source ~/.bashrc
```
（或重新登錄你的 shell）
清理任何可能的 sudo 路徑設置：
```shell
sudo visudo
```
檢查並移除任何與 gallery-dl 相關的路徑。

完成這些步驟後，你的系統應該已經完全清除了 gallery-dl 的所有痕跡。之後，你可以重新安裝乾淨的版本，如果需要的話。

{{< /expand >}}