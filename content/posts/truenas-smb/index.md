---
title: TrueNas SMB 簽名及加密設定
date: 2024-05-06T00:45:10+08:00
lastmod: 2025-03-04T14:40:10+08:00
draft: false
summary: "TrueNAS 預設沒有開啟 SMB 簽名及加密，新版又取消了 auxiliary parameters 欄位，所以不要懷疑自己找不到，搞老半天就這個能用。"
tags: ["NAS", "Linux", "SMB"]
categories: ["NAS"]
series: ["自架 NAS 紀錄"]
series_order: 2
progress_bar: true
externalUrl: https://docs.zsl0621.cc/docs/nas/smb-signing
---

TrueNAS 預設沒有開啟 SMB 簽名及加密，新版又取消了 auxiliary parameters 欄位，所以不要懷疑怎麼找不到，因為真的沒有這個選項。

網路上基礎設定的教學不少，這裡補足安全方面的設定，這陣子 Windows 更新要求 SMB 必須加上簽名所以順便回來更新此文章。

---

# 檢查啟用 SMB 簽名和加密功能

先檢查 TrueNAS 自己的設定，進入 TrueNAS 輸入

```sh
sudo smbstatus
```

此指令用於顯示現在的 SMB連線狀態，印出後檢查 Encryption 和 Signing 欄位是否出現加密演算法而不是 "-" 的空白，partial 代表已經啟用只是不強制客戶端使用。除此之外也可以檢查 smb 設定檔

```sh
sudo testparm -s
```

這會印出 `/etc/smb4.conf` 的內容，檢查 server signing 和 server smb encrypt 的設定，如果都成功設定就不需要看完整篇文章。

# 設定 SMB 加密和簽名

先說預計要改哪些設定

- **server signing = auto**：啟用伺服器簽名功能，使用 required 強制客戶端必須使用才能連線。
- **server smb encrypt = auto**：啟用伺服器端的SMB加密。
- **client smb encrypt = auto**：啟用客戶端的SMB加密。
- **inherit owner = yes**：（可選）設定檔案和目錄繼承父目錄的擁有者。
- **inherit permissions = yes**：（可選）設定檔案和目錄繼承父目錄的權限設置。

不建議把加密和簽名功能設為 required 因為 macOS 使用簽名速度會非常慢。

## 設定簽名和加密功能

使用 TrueNAS CLI 方式設定，這會覆蓋過往設定，包括不在這些選項裡面的也會被清理。

因為沒有 GUI 欄位所以現在要改由 [TrueNAS CLI](https://www.truenas.com/docs/scale/24.04/scaleclireference/) 模式修改，首先在 TrueNAS 管理介面點選左側的 System > Shell，輸入 `cli` 進入 TrueNAS CLI 模式之後貼上

```sh
service smb update smb_options="server signing = auto\nserver smb encrypt = auto\nclient smb encrypt = auto\ninherit owner=yes\ninherit permissions=yes"
```

結束後重啟 smb 服務刷新才能設定。這個指令會設定在 `/etc/smb4.conf`，但是直接修改此文件沒有用，該文件重開機會自動重置。

## 關閉 SMBv1

SMBv1 有安全漏洞不建議使用，在 System > Services 修改 SMB 設定，取消勾選 `Enable SMB1 support`。

## 檢查

檢查前記得重啟服務，除了使用前面的方式在 TrueNAS 檢查之外，也可以用別台電腦使用 nmap 檢查，在 macOS 使用 brew 安裝 nmap:

```sh
brew install nmap
```

安裝完成後使用此指令測試，應該會顯示 "Message signing enabled but not required"

```sh
sudo nmap -sS -sV -Pn -p 445 --script="smb2-security-mode" <IP>
```

也可以使用此指令檢查是否啟用了 SMBv1

```sh
nmap -p 445 --script smb-protocols
```

# 常見問題

## 無法連線

時間必須正確才能成功連線，TrueNAS 不管在哪個時區都有可能慢八小時造成連線失敗，我設定過的時間有以下項目：

- System > General > Localization
- timedatectl
- hwclock

## MacOS 連線非常慢

Mac SMB 使用簽名會慢到不行，使用此指令修正 Mac 本身的 SMB 設定，分成 Mac 本身是伺服器和客戶端兩種情況

### 伺服器

1. 先關閉 SMB 共用功能
2. 關閉簽名功能

    ```sh
    sudo defaults write /Library/Preferences/SystemConfiguration/com.apple.smb.server SigningRequired -bool FALSE
    ```

3. 開啟 SMB 服務

{{< expand "重新啟動 Mac OS X smb 服務" >}}

在這裡不會用到但是順便把指令放上來

https://gist.github.com/TomCan/7182edff81937687432f

```sh
sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.smbd.plist
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.smbd.plist
sudo defaults write /Library/Preferences/SystemConfiguration/com.apple.smb.server.plist EnabledServices -array disk
```

{{< /expand >}}

### 客戶端

1. 輸入 `sudo su` 填入密碼
2. 刪除原有設定檔

    ```sh
    rm -f /private/etc/nsmb.conf
    ```

3. 寫入新設定檔

    ```sh
    sudo tee /etc/nsmb.conf > /dev/null <<EOF
    # macOS SMB configuration file
    # This file controls the behavior of the SMB client

    [default]

    # --- Settings that decrease security ---
    # Disable SMB signing (reduces security)
    signing_required=no

    # Disable negotiation validation (reduces security)
    validate_neg_off=yes

    # --- Neutral or efficiency-impacting settings ---
    # Enable named streams support (neutral)
    streams=yes

    # Disable change notifications (impacts operational efficiency)
    notify_off=yes

    # Enable soft mounts (may impact data availability)
    soft=yes

    # Disable directory caching (impacts performance)
    dir_cache_max_cnt=0
    dir_cache_max=0
    dir_cache_off=yes

    # --- Settings that improve or do not significantly impact security ---
    # Disable NetBIOS and use direct hosting over TCP/IP (improves security)
    port445=no_netbios

    # Set SMB protocol version to SMB 2 or later (improves security)
    protocol_vers_map=4

    # Enable multi-channel support and prefer wired connections (neutral, generally safe)
    mc_on=yes
    mc_prefer_wired=yes
    EOF
    ```

4. 避免在網路儲存裝置寫入 .DS_Store 文件

    ```sh
    sudo defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool TRUE
    ```

# 參考資料

- [SMB 設定](https://www.reddit.com/r/truenas/comments/z9q6g5/enabling_smb_encryption_in_trusnas/)
- [TrueNAS 設定](https://www.truenas.com/community/threads/smb-signing-vulnerability-truenas-scale-22-12-2.110467/)
- [MacOS Slow SMB shares](https://www.reddit.com/r/MacOS/comments/17jgiyw/macos_slow_smb_shares/)
