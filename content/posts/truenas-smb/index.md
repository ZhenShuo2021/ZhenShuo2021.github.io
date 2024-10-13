---
title: 'TrueNas SMB 簽名及加密設定'
date: 2024-05-06T00:45:10+08:00
lastmod: 2024-10-14T07:05:10+08:00
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
cli 三個字也要打，不能省略。
```
cli
service smb update smb_options="server signing = required\nserver smb encrypt = required\nclient smb encrypt = required\ninherit owner=yes\ninherit permissions=yes"
```
inherit owner 和 inherit permissions 是繼承父資料夾的擁有者/權限。另外，直接對 `/etc/smb4.conf` 進行修改沒有用，該文件重開機會自動重置。

修改時可能需要重新設定時間，TrueNAS 不管在哪個時區（看過歐美亞洲都問過一樣問題）都有可能慢八小時。

# 檢查是否成功啟用
在 TrueNAS 中使用這兩個指令都可以檢查：
```sh
sudo testparm -s
sudo smbstatus
```

如果成功設定， testparm 會顯示 `server signing = required`，smbstatus 中 Encryption 和 Signing 會顯示加密演算法。

或者可以在別台電腦用 nmap 測試：
```shell
# 出現 "Message signing enabled but not required" 則表示沒有啟用簽名
sudo nmap -sS -sV -Pn -p 445 --script="smb-security-mode" <IP>
sudo nmap -sS -sV -Pn -p 445 --script="smb2-security-mode" <IP>
```

如果成功設定， nmap 會顯示 `Message signing enabled and required`。

# 關閉 SMBv1
SMBv1 有安全性問題，沒有特殊需求請關閉。

# 參考資料
[SMB 設定](https://www.reddit.com/r/truenas/comments/z9q6g5/enabling_smb_encryption_in_trusnas/)  
[TrueNAS 設定](https://www.truenas.com/community/threads/smb-signing-vulnerability-truenas-scale-22-12-2.110467/)  