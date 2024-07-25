---
title: 利用 Cloudflare Tunnel 和 DDNS 無需開放端口實現安全外網訪問
date: "2024-05-08"
draft: false
description: "了解如何利用 Cloudflare Tunnel 提供安全且便宜的方式來上外網，不需開啟本機端口。本文介紹選擇 Cloudflare Tunnel 的原因以及其優缺點。"
summary: 紀錄把一台破電腦裝成 NAS 的過程
tags: ["Cloudflare", "教學", "筆記"]
categories: ["NAS"]
series: ["自架 NAS 紀錄"]
series_order: 1
---

# 1. 思路

沒有思路，只是想找安全上外網的方式[<sup>\[1\]</sup>](https://forum.gamer.com.tw/C.php?bsn=60030&snA=604173#:~:text=21%3A32%20%E7%B7%A8%E8%BC%AF-,%E5%BE%88%E5%A4%9A%E6%96%B9%E6%B3%95,%3E%3E%E4%B8%AD%E8%BD%89%E4%BC%BA%E6%9C%8D%E5%99%A8%E9%A0%BB%E5%AF%AC%E6%9C%89%E9%99%90,-%E6%9C%80%E7%A9%A9%E5%AE%9A%3E%E7%AC%AC)[<sup>\[2\]</sup>](https://www.mobile01.com/topicdetail.php?f=494&t=6381761)，直接使用port fowarding等同裸奔，使用DDNS還是得port foward，[ZeroTier/TailScale](https://www.youtube.com/watch?v=_Qrd7oJMp6w)只能個人使用，用 VPN 路由器太舊，[FRP](https://www.youtube.com/watch?v=ZfeZNbqIWTo)內網穿透需要租VPS做中轉，刪去法後 Cloudflared Tunnel (CT) 是最安全且便宜的方式。

這次使用註冊域名做 DDNS 解析不開 port 保證內網安全，其他需求使用 CNAME 經過 CT 加密傳輸，會有這種奇怪的方法其實是網路上只要用到 CT dashboard 的方法我都連不上[<sup>\[3\]</sup>](https://medium.com/@zetavg/%E4%BD%BF%E7%94%A8-cloudflare-tunnel-%E4%BD%9C%E7%82%BA%E4%BD%8E%E6%88%90%E6%9C%AC%E7%9A%84-ngrok-%E6%9B%BF%E4%BB%A3%E5%93%81-6b0aaef97557)[<sup>\[4\]</sup>](https://www.sakamoto.blog/cloudflare-tunnel/)，可能還是得開 port，東拼西湊就變成這樣了。

關於 DDNS，不要用 Cloudflare API，會用到自己想死。

## 1.1. 優點

- 不用租 VPS 伺服器，最便宜域名 5 usd per year。
- Cloudflared 的 reverse proxy 幫你擋DDoS，傳輸加密，隱藏主機 IP，免開本機 port。
- 如果域名在 Cloudflared 買還可以自動配好憑證，也不用每三個月自動更新。
- 每個 port 的服務使用個別配置的**子域名**進入。

## 1.2. 缺點

- 原始域名拿去更新 DDNS 無法使用，但可以使用 www 當 CNAME 有八成像。
- 若要使用原始域名可以在路由器開啟 port forwarding。
{{< keyword >}}[已解決] 使用 tailscale 作內網穿透可存取包含 http / SMB / docker 等服務。{{< /keyword >}}
- ~~[還沒試過] Cloudflare 只支援80/443 port，SMB等服務無法使用 proxy，只能直接開 port~~

# 2. 開始
這次服務需要用到DDNS以及Cloudflare Tunnel，所以教學也分為兩部分。本次教學需要更改的部分在指令中都會用<>框起，設定如下，請更改為自己的環境，：
```
USER_NAME=leo # DIR name in ubuntu-server
TUNNEL_NAME=ubuntu-server
DomainName=leo-photos.uk
ServerLocalIP=192.168.50.100
PortPhotoprism=2342
PortImmich=2283
```

## 1.1. 設定 DDNS

### I. 網域
1. 購買網域：我是在 Cloudflare Domain Registration 購買的。注意之後需要 CNAME，因此域名盡量簡短，服務名稱可以在 CNAME 內完成。若是在其他網域商買的可以使用 change nameserver 功能，**注意 no-ip 無法轉移**。
2. 新增 DNS：到 Cloudflare 主頁選擇 `購買的網域 > 左側欄位的 DNS > DNS Records > Add record` ，分別填入 `Type A，leo-photos.uk，1.2.3.4` （1.2.3.4 可以隨便填，下一步動態更新 DNS 會自動修正）。
3. （選用）啟用 proxy 會讓該 IP 經過 Cloudflare 伺服器以隱藏原始 IP。

### II. 取得 Cloudflare API Token
1.  到 Cloudflare 主頁點擊 `右上角頭像 > My Profile > API Tokens > Create Token`。
2.  選擇 `Edit zone DNS` ，Zone Resources選擇你的域名，點擊下一步進入Summary，再點擊下一步。
3.  生成的Token很長等一下會用到，下面指令可以測試Token是否可用，運作正常會顯示 `This API Token is valid and active` 。

### III. 設定 DDNS 服務
使用 [DDNS-GO](https://github.com/jeessy2/ddns-go) 自動獲取 IP （[圖文教學](https://zhuanlan.zhihu.com/p/670026839)）
1. 部署 DDNS-GO：
	```sh
	docker run -d --name ddns-go --restart=always -p 9876:9876 -v /opt/ddns-go:/root jeessy/ddns-go
	```
2. 進入 `http://<192.168.50.100>:9876`，選擇Cloudflare，貼上剛剛的Token，Domains填申請的域名，設定帳號密碼後儲存。
        
## 1.2. 設定 Cloudflare Tunnel
依照[官方教學](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel)輸入指令，注意到第四步我們會先跑去設定 `run as service` ，以下為完整步驟。以Linux為例： 

### I. 安裝 Cloudflared
1. 新增 GPG key、新增 Cloudflare apt repo、更新並安裝
     ```sh
    sudo mkdir -p --mode=0755 /usr/share/keyrings
    
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
    
    sudo apt-get update && sudo apt-get install cloudflared
    ```

### II. 設定 Tunnel

1. 登入 Cloudflared，進入顯示的網址登入，此步驟 Cloudflare 會自動新增給 Tunnel 用的 API Token：
	```sh
	cloudflared tunnel login
	```

2. 建立 Tunnel：    
	```sh
	cloudflared tunnel create <ubuntu-server>
	```

3. 列出 Tunnel UUID：   
	```sh
	cloudflared tunnel list
	```

4. 建立 config 檔案
在 `/home/leo` 中使用 `nano` 建立一個 `config.yml` 檔案，以下方式二擇一，若只有一個port可用以下形式：
	```yaml
	url: http://<localhost:2283>
	tunnel: <Tunnel-UUID>
	credentials-file: /home/leo/.cloudflared/<Tunnel-UUID>.json
	```

	多 port 可以用以下[格式](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/configuration-file/)，可指定 port 對應不同 CNAME：
	```yaml
	tunnel: <Tunnel-UUID>
	credentials-file: /home/leo/.cloudflared/<Tunnel-UUID>.json    
	ingress:
		- hostname: <immich.leo-photos.uk>
		  service: http://<localhost:2283>
		- hostname: <photoprism.leo-photos.uk>
		  service: http://<localhost:2342>
		- service: http_status:404
	```

	`/etc/cloudflared`中也要一份一模一樣的檔案，可使用cp指令直接複製一份到目標資料夾：
	```sh
	sudo cp ~/.cloudflared/config.yml /etc/cloudflared/config.yml
	```

5.  設定 [run as service](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/as-a-service/linux/) 在背景中運行 Tunnel
	```sh
	sudo cloudflared service install
	sudo systemctl start cloudflared
	sudo systemctl status cloudflared
	sudo systemctl restart cloudflared
	```

6. 註冊 route dns
    有幾個 CNAME 就要註冊幾個 route dns。**route dns只能到官網刪除**，本地無法刪除
	```sh
	# <Tunnel-Name> / <hostname>
	cloudflared tunnel route dns <ubuntu-server> <immich.leo-photos.uk>
	```
    
7. 大功告成
    
	啟動 Tunnel
	```sh
	# cloudflared tunnel run <ubuntu-server>
	sudo systemctl restart cloudflared
	```
    

# 3. 額外的選項
Cloudflare 免費版也送了很多安全選項
點選購買的網域：
1. Quick Start Guide勾一勾
2. DNS > DNS Settings > DNSSEC
3. SSL/TLS > Overview > encryption Full (strict)
4. SSL/TLS > Edge Certificates 
5. Security: WAF templete: mTLS-enforced authentication
6. Security: WAF Zone lockdown Country not equal Taiwan
8. Security: Bots [但是聽說有問題](https://www.cnblogs.com/louqianzhu/p/17446080.html)
9. Security: DDoS > Block, High
10. Security: Security Level, Browser Integrity Check
11. Speed: Optimization HTTP/2 to Origin off, HTTP/3 (with QUIC)
12. Rules: 上次動了直接連不了
13. Network: WebSockets off, gRPC off, Onion Routing off
14. Zero Trust > Settings > Network > Proxy

# 4. Notes

1.  網路上使用dashboard的方法我都無法成功，所以才用CLI方式建立。
2.  網路上很多"都變成“，複製貼上時請小心。
3.  A record=ipv4, AAAA record=ipv6。
4.  查詢後發現使用no-ip無法轉移nameserver到Cloudflare上。
5.  可使用以下指令管理Cloudflared
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
