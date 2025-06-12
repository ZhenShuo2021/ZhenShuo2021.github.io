---
title: 利用 Cloudflare Tunnel 和 DDNS 無需開放端口實現安全外網訪問
lastmod: 2025-03-04T15:48:36+08:00
date: 2024-05-08
draft: false
description: 
summary: 紀錄把一台破電腦裝成 NAS 的過程
tags:
  - Cloudflare
  - 教學
  - 筆記
categories:
  - NAS
series:
  - 自架 NAS 紀錄
series_order: 1
---

# 1. 前言

需要把 docker 服務讓外網存取，需要設定輕鬆、不花錢、連線安全，取交集就是使用 Cloudflare Tunnel 功能，其他都需要繁複設定或者花錢甚至又花錢設定又麻煩，當然如果不要求安全那設定會變的非常容易。使用 Cloudflare Tunnel 的優點還有一個是可以穿透社區網路。

另外本文是使用 [Locally-managed tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/local-management/) 的教學，功能和使用 Cloudflare Dashboard，也就是在 Web 介面設定的功能完全一樣，只是改用命令行設定，當時這樣設定的原因是 dashboard 設定方式無法連線，但是後來官方修復問題後就可以正常運行了，所以現在兩種方式都可以使用，一般建議使用 dashboard 設定，除非你的服務數量非常多而且還有遷移的需求，否則命令行設定方式沒有優點。

使用 dashboard 設定的教學網路上非常多，只是其中不乏有像我以前一樣還搞不清楚就開始寫的教學其中包含多餘的步驟，上網隨意搜尋了一下可以參考 [無痛本地調試：使用 Cloudflare Tunnel 實現 HTTPS 和自定義主機名](https://blog.logto.io/zh-TW/painless-local-debugging) 是正確的設定方式可以參考，cloudflared 安裝方式從 brew 換成 apt 即可在 ubuntu 運行，當然你安裝 linuxbrew 也沒問題。

如果沒看懂可以參考 ivonblog 的 [Cloudflare Tunnel教學，從外網安全地存取內網的Linux伺服器](https://ivonblog.com/posts/cloudflare-tunnel/)，和本文相同也是使用命令行方式管理。

# 2. 優點

- 不用租 VPS 伺服器，最便宜域名 5 usd per year。
- Cloudflared 的 reverse proxy 幫你擋DDoS，傳輸加密，隱藏主機 IP，免開本機 port。
- 如果域名在 Cloudflared 買還可以自動配好憑證，也不用每三個月自動更新。
- 可以穿透社區網路。
- 每個 port 的服務使用個別配置的**子域名**進入。
- 使用 tailscale 作內網穿透可存取包含 http / SMB / docker 等服務。

# 3. 設定 Cloudflare Tunnel

需要更改的偏好設定如下，請更改為自己的環境：

```ini
TUNNEL_NAME=ubuntu-server
DomainName=zsl0621.cc
ServerLocalIP=192.168.50.100
PortPhotoprism=2342
PortImmich=2283
```

依照[官方教學](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel)輸入指令，注意到第四步我們會先跑去設定 `run as service` 。以 Linux 為例：

## I. 安裝 Cloudflared

1. 新增 GPG key、新增 Cloudflare apt repo、更新並安裝

     ```sh
    sudo mkdir -p --mode=0755 /usr/share/keyrings
    
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
    
    sudo apt-get update && sudo apt-get install cloudflared
    ```

## II. 設定 Tunnel

1. 登入 Cloudflared，進入顯示的網址登入，此步驟 Cloudflare 會自動新增給 Tunnel 用的 API Token：

    ```sh
    cloudflared tunnel login
    ```

2. 建立 Tunnel：

    ```sh
    cloudflared tunnel create <ubuntu-server>
    ```

1. 列出 Tunnel UUID：

    ```sh
    cloudflared tunnel list
    ```

1. 建立 config 檔案  
    在 `/home/leo` 中使用 `nano` 建立一個 `config.yml` 檔案，使用多 port [格式](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/configuration-file/)，可指定不同的 port 對應不同子域名：

    ```yaml
    tunnel: <Tunnel-UUID>
    credentials-file: /home/leo/.cloudflared/<Tunnel-UUID>.json    
    ingress:
      - hostname: <immich.zsl0621.cc>
        service: http://<localhost:2283>
      - hostname: <photoprism.zsl0621.cc>
        service: http://<localhost:2342>
      - service: http_status:404
    ```

    `/etc/cloudflared`中也要一份一模一樣的檔案，可使用cp指令直接複製一份到目標資料夾：

    ```sh
    sudo cp ~/.cloudflared/config.yml /etc/cloudflared/config.yml
    ```

5. 設定 [run as service](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/as-a-service/linux/) 在背景中運行 Tunnel

    ```sh
    sudo cloudflared service install
    sudo systemctl start cloudflared
    sudo systemctl status cloudflared
    sudo systemctl restart cloudflared
    ```

6. 註冊 route dns  

    有幾個子域名就要註冊幾個 route dns。**route dns只能到官網刪除**，本地無法刪除

    ```sh
    # <Tunnel-Name> / <hostname>
    cloudflared tunnel route dns <ubuntu-server> <immich.zsl0621.cc>
    cloudflared tunnel route dns <ubuntu-server> <photoprism.zsl0621.cc>
    ```

7. 大功告成

    啟動 Tunnel

    ```sh
    # cloudflared tunnel run <ubuntu-server>
    sudo systemctl restart cloudflared
    ```

在我設定的 2024/2025 年，這些一設定幾乎一分鐘後就可馬上啟用，所以如果連不上一定是設定出錯而不是 DNS 等還沒上線的問題。

# 4. 設定 Zero Trust Access

Tunnel 設定完成後所有人都可以訪問你的網站，Zero Trust Access 功能就是 Cloudflare 會幫你擋下或是允許特定規則，一般我只使用 email 功能，加上 Cloudflare OIDC 就可以使用 Gmail 帳號直接登入不需密碼，實際設定方式可以參考 [immich 教學](https://github.com/immich-app/immich/discussions/8299) 還有 [Cloudflare 官方教學](https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/google/)，只需要詳讀這兩份就可以成功設定不需要閱讀其他文章。

# 額外的選項

Cloudflare 免費版提供很多安全選項

1. Quick Start Guide勾一勾
2. DNS > DNS Settings > DNSSEC
3. SSL/TLS > Overview > encryption Full (strict)
4. SSL/TLS > Edge Certificates
5. Security: WAF templete: mTLS-enforced authentication
6. Security: WAF Zone lockdown Country not equal Taiwan
7. Security: Bots [但是聽說有問題](https://www.cnblogs.com/louqianzhu/p/17446080.html)
8. Security: DDoS > Block, High
9. Security: Security Level, Browser Integrity Check
10. Speed: Optimization HTTP/2 to Origin off, HTTP/3 (with QUIC)
11. Network: WebSockets off, gRPC off, Onion Routing off
12. Zero Trust > Settings > Network > Proxy

# 4. Notes

1. 網路上使用dashboard的方法我都無法成功，所以才用CLI方式建立。
2. 網路上很多"都變成“，複製貼上時請小心。
3. A record=ipv4, AAAA record=ipv6。
4. 查詢後發現使用no-ip無法轉移nameserver到Cloudflare上。
5. 可使用以下指令管理Cloudflared

    ```sh
    sudo systemctl status cloudflared
    sudo systemctl start cloudflared
    sudo systemctl restart cloudflared
    sudo systemctl enable cloudflared
    ```

6. **移除Cloudflared**

    ```sh
    # 依序移除service, auto start, config, cloudflared
    sudo cloudflared service uninstall
    sudo rm /etc/systemd/system/cloudflared.service
    sudo rm /etc/cloudflared/config.yml
    sudo rm -r ~/.cloudflared
    sudo apt-get remove cloudflared
    ```

7. **Useful commands**

    ```sh
    cloudflared tunnel delete <Tunnel-UUID or NAME>
    ```

# 備份

剛開始用很多都邊設定邊學，有些是錯誤的但還是有參考價值 aka 不忍心直接刪除所以放在這，這些內容是正確的，只是使用 cloudflare tunnel 功能其實不需要設定這些東西。

{{< expand 備份 >}}

# 1. 思路

沒有思路，只是想找安全上外網的方式[[1]](https://forum.gamer.com.tw/Co.php?bsn=60030&sn=2377061), [[2]](https://www.mobile01.com/topicdetail.php?f=494&t=6381761)，直接使用port fowarding等同裸奔，使用DDNS還是得port foward，[ZeroTier/TailScale](https://www.youtube.com/watch?v=_Qrd7oJMp6w)只能個人使用，路由器太舊用他做 VPN 不適合，[FRP](https://www.youtube.com/watch?v=ZfeZNbqIWTo)內網穿透需要花錢租 VPS 做中轉，刪去法後 Cloudflared Tunnel (CT) 是最安全且便宜的方式。

這次使用註冊域名做 DDNS 解析不開 port 保證內網安全，其他需求使用 CNAME 經過 CT 加密傳輸，會有這種奇怪的方法其實是網路上只要用到 CT dashboard 的方法我都連不上[[3]](https://medium.com/@zetavg/%E4%BD%BF%E7%94%A8-cloudflare-tunnel-%E4%BD%9C%E7%82%BA%E4%BD%8E%E6%88%90%E6%9C%AC%E7%9A%84-ngrok-%E6%9B%BF%E4%BB%A3%E5%93%81-6b0aaef97557), [[4]](https://www.sakamoto.blog/cloudflare-tunnel/)，可能還是得開 port，東拼西湊就變成這樣了。

關於 DDNS，不要用 Cloudflare API，會用到自己想死。

## 1.1. 設定 DDNS

### I. 網域

1. 購買網域：我是在 Cloudflare Domain Registration 購買的。注意之後需要 CNAME，因此域名盡量簡短，服務名稱可以在 CNAME 內完成。若是在其他網域商買的可以使用 change nameserver 功能，**注意 no-ip 無法轉移**。
2. 新增 DNS：到 Cloudflare 主頁選擇 `購買的網域 > 左側欄位的 DNS > DNS Records > Add record` ，分別填入 `Type A，zsl0621.cc，1.2.3.4` （1.2.3.4 可以隨便填，下一步動態更新 DNS 會自動修正）。
3. （選用）啟用 proxy 會讓該 IP 經過 Cloudflare 伺服器以隱藏原始 IP。

### II. 取得 Cloudflare API Token

1. 到 Cloudflare 主頁點擊 `右上角頭像 > My Profile > API Tokens > Create Token`。
2. 選擇 `Edit zone DNS` ，Zone Resources選擇你的域名，點擊下一步進入Summary，再點擊下一步。
3. 生成的Token很長等一下會用到，下面指令可以測試Token是否可用，運作正常會顯示 `This API Token is valid and active` 。

### III. 設定 DDNS 服務

使用 [DDNS-GO](https://github.com/jeessy2/ddns-go) 自動獲取 IP （[圖文教學](https://zhuanlan.zhihu.com/p/670026839)）

1. 部署 DDNS-GO：

  ```sh
  docker run -d --name ddns-go --restart=always -p 9876:9876 -v /opt/ddns-go:/root jeessy/ddns-go
  ```

2. 進入 `http://<192.168.50.100>:9876`，選擇Cloudflare，貼上剛剛的Token，Domains填申請的域名，設定帳號密碼後儲存。

{{< /expand >}}
