---
title: "Site Setup Log: No Static IP + Cloudflare Tunnel + DDNS-GO"
date: 2024-05-08
draft: false
description: 
summary: My log of setting old PC as NAS.
tags:
  - Site Setup Log
  - Cloudflare
  - Notes
categories:
  - NAS
series:
  - Deployment Records
series_order: 1
---

# Site Setup Log (No Static IP, Cloudflare Tunnel + DDNS-GO)

## Concept

No specific concept, just looking for a secure way to access the external network. Directly using port forwarding is equivalent to running unprotected. Using DDNS still requires port forwarding. [ZeroTier/TailScale](https://www.youtube.com/watch?v=_Qrd7oJMp6w) is for personal use only, VPN routers are outdated, [FRP](https://www.youtube.com/watch?v=ZfeZNbqIWTo) requires renting a VPS for relay. After eliminating other options, Cloudflared Tunnel (CT) is the safest and cheapest method.

This setup uses a registered domain for DDNS resolution without opening ports to ensure internal network security. Other requirements use CNAME with encrypted transmission via CT. This strange method is due to the inability to connect using CT dashboard methods found online. It may still require opening ports, resulting in this cobbled-together solution.

Regarding DDNS, do not use the Cloudflare API, it will be frustrating.

**Advantages**

- No need to rent a VPS server, the cheapest domain costs $5/year.
- Cloudflared's reverse proxy protects against DDoS, encrypts transmission, hides host IP, and requires no open local ports.
- If the domain is purchased through Cloudflared, certificates are automatically configured, no need for auto-renewal every three months.
- Each service port uses individually configured CNAMEs.

**Disadvantages**

- The original domain used for updating DDNS cannot be used, but www can be used as CNAME with 80% similarity.
- To use the original domain, port forwarding on the router is required.
- [Not yet tested] Cloudflare only supports ports 80/443, other services like SMB cannot use the proxy and must open ports directly.

## Getting Started

This setup requires DDNS and Cloudflare Tunnel, so the tutorial is divided into two parts. Changes needed in the instructions will be framed with <>. Configuration is as follows, please adjust for your environment:

```txt
USER_NAME=leo # DIR name in ubuntu-server
TUNNEL_NAME=ubuntu-server
DomainName=leo-photos.uk
ServerLocalIP=192.168.50.100
PortPhotoprism=2342
PortImmich=2283
```

## Configuring DDNS

### I. Domain

1. Purchase a domain: I purchased mine from Cloudflare Domain Registration. Ensure the domain is short, as CNAME entries will be used. If purchased from another registrar, use the change nameserver function, note that no-ip cannot be transferred.
2. Manage DNS for the purchased domain: Go to the Cloudflare homepage, select the domain, go to the DNS section, and add a record with **Type A, leo-photos.uk, 1.2.3.4**.
3. 1.2.3.4 can be any IP, it will be automatically corrected during dynamic DNS updates.
4. Using a proxy will route the domain through Cloudflare servers to hide the IP; without a proxy, it is exposed.

### II. Obtain Cloudflare API Token

1. Go to the Cloudflare homepage, click the profile icon in the upper right, then My Profile > API Tokens > Create Token.
2. Select `Edit zone DNS`, choose your domain in Zone Resources, and proceed to Summary, then next step.
3. The generated token will be long and used later. The following command can test if the token is valid and active:

    ```sh
    curl -X GET "https://api.cloudflare.com/client/v4/zones?name=leo-photos.uk" \
    -H "Authorization: Bearer <your-token>" \
    -H "Content-Type: application/json"
    ```

### III. Configuring DDNS Service

Use [DDNS-GO](https://github.com/jeessy2/ddns-go) for automatic IP retrieval ([Guide](https://zhuanlan.zhihu.com/p/670026839))

1. Deploy DDNS-GO using Docker:

    ```sh
    docker run -d --name ddns-go --restart=always -p 9876:9876 -v /opt/ddns-go:/root jeessy/ddns-go
    ```

2. Access `http://<192.168.50.100>:9876`, choose Cloudflare, paste the token, enter the domain, set the username and password, then save.

## Configuring Cloudflare Tunnel

Follow the [official tutorial](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/#5-start-routing-traffic) for commands. Note that after step four, we will configure `run as service`. Below are the complete steps for Linux:

### I. Install Cloudflared

1. Add GPG key, Cloudflare apt repo, update, and install:

    ```sh
    sudo mkdir -p --mode=0755 /usr/share/keyrings

    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

    sudo apt-get update && sudo apt-get install cloudflared
    ```

### II. [Configure Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel)

1. Login to Cloudflared, visit the displayed URL to log in, Cloudflare will automatically add an API Token for the Tunnel:

    ```sh
    cloudflared tunnel login
    ```

2. Create the Tunnel:

    ```sh
    cloudflared tunnel create <ubuntu-server>
    ```

3. List Tunnel UUID:

    ```sh
    cloudflared tunnel list
    ```

4. Create a configuration file
In `/home/leo`, create a `config.yml` file using `nano`. If only one port is in use, use the following format:

    ```yaml
    url: http://<localhost:2283>
    tunnel: <Tunnel-UUID>
    credentials-file: /home/leo/.cloudflared/<Tunnel-UUID>.json
    ```

For multiple ports, use the following [format](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/configuration-file/), specifying different CNAMEs for each port:
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

A copy of this file should also be placed in `/etc/cloudflared`. Use the `cp` command to copy the file:
    ```sh
    sudo cp ~/.cloudflared/config.yml /etc/cloudflared/config.yml
    ```

5. Configure [run as service](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/as-a-service/linux/) to run the tunnel in the background

    ```sh
    sudo cloudflared service install
    sudo systemctl start cloudflared
    sudo systemctl status cloudflared
    sudo systemctl restart cloudflared
    ```

6. Register route DNS
    Register one route DNS for each CNAME. **Route DNS can only be deleted on the official website**, not locally.

    ```sh
    # <Tunnel-Name> / <hostname>
    cloudflared tunnel route dns <ubuntu-server> <immich.leo-photos.uk>
    ```

7. Done

    Start the tunnel

    ```sh
    # cloudflared tunnel run <ubuntu-server>
    sudo systemctl restart cloudflared
    ```

# Additional Options

The free version on the Cloudflare website also offers many security options. Select the purchased domain:

1. Quick Start Guide, check the necessary options
2. DNS > DNS Settings > DNSSEC
3. SSL/TLS > Overview > Encryption Mode: Full (strict)
4. SSL/TLS > Edge Certificates
5. Security: WAF Template: mTLS-enforced authentication
6. Security: WAF Zone lockdown: Country not equal to Taiwan
7. Security: Bots [but reportedly has issues](https://www.cnblogs.com/louqianzhu/p/17446080.html)
8. Security: DDoS > Block, High
9. Security: Security Level, Browser Integrity Check
10. Speed: Optimization HTTP/2 to Origin off, HTTP/3 (with QUIC)
11. Rules: Last time modifying this resulted in connectivity issues
12. Network: WebSockets off, gRPC off, Onion Routing off
13. Zero Trust > Settings > Network > Proxy

## Notes

1. The dashboard methods found online did not work for me, so I used the CLI method.
2. There are many "changes" online; be careful when copying and pasting.
3. A record = IPv4, AAAA record = IPv6.
4. It turns out that using no-ip cannot transfer nameservers to Cloudflare.
5. You can manage Cloudflared with the following commands:

    ```sh
    sudo systemctl status cloudflared
    sudo systemctl start cloudflared
    sudo systemctl restart cloudflared
    sudo systemctl enable cloudflared
    ```

6. **Remove Cloudflared**

    ```sh
    # Sequentially remove service, auto start, config, cloudflared
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
