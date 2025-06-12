---
title: 常用Linux指令
date: 2024-05-30
lastmod: 2024-07-21T07:12:50+08:00
draft: false
description: 常用 Linux 指令小抄，包含硬碟監視，記憶體佔用查詢，開機自動執行以及SMB掛載。
summary: 常用的 Linux 指令小抄
tags:
  - Linux
  - 指令筆記
  - cheatsheet
categories:
  - 筆記
externalUrl: https://zsl0621.cc/memo/linux/useful-linux-commands
---

# 文件移動

```sh
mv source/ dest/        # 搬移整個資料夾
cp -rfp source/ dest/   # 複製並保留文件屬性
# r: 包含子目錄
# f: 強制複製
# p: 保留原始文件屬性
cp source/* dest        # 只搬資料夾內檔案
```

# 縮寫指令✨

如我要把 `hugo new content` 縮寫成 `hnc`，則

```sh
echo "alias hnc='hugo new content'" >> ~/.bashrc && source ~/.bashrc
```

macOS 則是改為 zshrc。

# 檢視硬碟容量

```sh
du /home -h | sort -nr | tail
df -h
sudo ncdu -x /path                 # ncdu 好用「非常多」
```

# 檢視記憶體佔用

列出前十大記憶體使用

```sh
ps aux --sort=-%mem | head -n 10
```

# 開機自動執行

這裡用docker-compose示範，五步驟分別是建立.service檔、reload .service、啟用、開始、查看狀態。參考資料[^1]。

```sh
sudo nano /etc/systemd/system/stirling-pdf.service
# 建立完成再執行以下指令
sudo systemctl daemon-reload
sudo systemctl enable stirling-pdf.service
sudo systemctl start stirling-pdf.service
sudo systemctl status stirling-pdf.service
```

其中.service指令為：

```sh
[Unit]
Description=Docker Compose app
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=3
StartLimitInterval=1200
StartLimitBurst=10
TimeoutStartSec=1200
WorkingDirectory=/home/yourname/yourapp
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

開機自動化也可以使用以下方式：

```sh
# nano /etc/rc.local
mount /path/mount
exit 0
```

設定開機自動掛載smb。

# SMB 掛載

在 `etc/fstab` 最下方新增：

```sh
# 格式
<IP>/<遠端資料夾> <掛載本地資料夾> cifs credentials=<證書路徑>,_netdev,x-systemd.automount,file_mode=0777,dir_mode=0777 0 0
# 範例
//192.168.50.98/immich/external-lib /home/leo/photo cifs credentials=/home/leo/.cifs,_netdev 0 0
# _netdev: 強制系統辨識成網路硬碟
# x-systemd.automount: 自動掛載
# file_mode/dir_mode: 文件權限
# 0 0: dump備份和fsck檢查
```

逗號後面可選但[兩個零](https://rain.tips/2024/02/06/%E5%AF%A6%E6%88%B0%E6%95%99%E5%AD%B8%EF%BC%9A%E5%AF%A6%E7%8F%BEubuntu%E7%92%B0%E5%A2%83%E4%B8%AD%E9%AB%98%E6%95%88%E7%9A%84%E7%A1%AC%E7%A2%9F%E5%85%B1%E4%BA%AB/)還是要保留。證書格式為：

```sh
username=遠端SMB帳戶
password=密碼
```

# 列出時間

```shell
date
timedatectl
hwclock
cal -H
uptime
who -b
```
