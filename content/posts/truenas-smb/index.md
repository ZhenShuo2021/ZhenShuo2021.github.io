---
title: 'TrueNas SMB 簽名及加密設定'
date: 2024-05-06T00:45:10+08:00
draft: false
summary: "TrueNAS 預設沒有開啟 SMB 簽名及加密，新版又取消了 auxiliary parameters 欄位，所以不要懷疑自己找不到，搞老半天就這個能用。"
tags: ["NAS", "Linux", "SMB"]
categories: ["NAS"]
series: ["自架 NAS 紀錄"]
series_order: 2
progress_bar: true
---

網路上基礎設定的教學不少，這裡補足安全方面的設定。

TrueNAS 預設沒有開啟 SMB 簽名及加密，新版又取消了 auxiliary parameters 欄位，所以不要懷疑自己找不到，搞老半天就這個能用。

# 修改方式
cli 三個字要打出來。
```
cli
service smb update smb_options="server signing = required\nserver smb encrypt = required\nclient smb encrypt = required\ninherit owner=yes\ninherit permissions=yes"
```
inherit owner/permissions 是繼承父資料夾的擁有者/權限。另外，改 `/etc/smb4.conf` 沒用，該文件重開機會自動重置。

修改時可能需要重新設定時間，TrueNAS 不管在哪個時區（看過歐美亞洲都問過一樣問題）都有可能慢八小時，

# SMB 測試指令
使用 nmap 在別台電腦測試 NAS SMB 狀態的指令們。
```shell
# 出現 "Message signing enabled but not required" 則表示沒有啟用簽名
sudo nmap -sS -sV -Pn -p 445 --script="smb-security-mode" <IP>
sudo nmap -sS -sV -Pn -p 445 --script="smb-security-mode" <IP>
sudo testparm -s
sudo smbstatus
```

# 結語
不過 MAC 開加密之後速度變超慢，最後還是關了。

Reference:  
[SMB 設定](https://www.reddit.com/r/truenas/comments/z9q6g5/enabling_smb_encryption_in_trusnas/) [TrueNAS 設定](https://www.truenas.com/community/threads/smb-signing-vulnerability-truenas-scale-22-12-2.110467/)  