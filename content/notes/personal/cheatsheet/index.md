---
title: '各式各樣的小抄'
date: 2024-08-17T11:24:23+08:00
draft: false
summary: "各種指令用的小抄"
showSummary: true
tags: ["cheatsheet"]
categories: ["筆記"]
series: []
series_order: 
progress_bar: true
---

# magick

轉換資料夾到 WebP 加上 crop，crop 參數為 "長x寬+起始寬度+起始高度"
```sh
magick mogrify -format webp -quality 80 -crop 2000x800+300+420 *.png
```
使用範例 [[1]](https://home.gamer.com.tw/creationDetail.php?sn=5897078) [[2]](https://yuliyang.com/imagemagick-bulk-image-processing/)

# Python

## pip 一次刪除所有套件
```sh
pip freeze | xargs pip uninstall -y && rm -rf build
```

## 從原始碼構建程式

以 [gallery-dl](https://github.com/mikf/gallery-dl) 為例
```sh
git clone --depth=1 https://github.com/mikf/gallery-dl.git
cd gallery-dl
python3 -m venv .venv
source .venv/bin/activate

# 使用 setup.py 安裝
pip3 install setuptools
python3 setup.py install

# 或者，使用 pyproject.toml 安裝
pip install .
```

`pip install .` 其實兩種安裝方式都接受，但是 pyproject.toml 優先。可以加上 -e 選項使用開發模式安裝，和正式安裝的差別在於所有改動都會立刻生效，因為正式安裝的程式碼在 python 路經（虛擬環境）中的 site-packages 內。

## Google Style Docstring
養成寫註解的好習慣。Sphinx 風格難以閱讀並且 VSC 常常偵測錯誤直接剔除，[Numpy 風格](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_numpy.html?highlight=google%20style)適合更長且深入的說明文件[1](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/index.html?highlight=NumPy%20style#google-vs-numpy)，反之使用 [Google 風格](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_google.html?highlight=google%20style)

```py
def update_config(self, options: dict[str, Any]) -> None:
    """
    Updates the configuration with the provided options.

    This method updates the `self.config` dictionary based on the given `options` dictionary.

    Example:
        ### Python usage example:
        >>> args.options = {
                "local": "path/to/local",
                "remote": "path/to/remote",
                "categories": "category1, category2, category3",
                "custom_setting": {
                    "Others": {
                        "tags": {
                            "nice_job": "好欸！",
                            "114514": "id_ed25519",
                        }
                    }
                }
            }
        >>> config_loader.load_config()
        >>> config_loader.update_config(args.options)

        ### Command line input examples:

        Overwrite local_path:
        $ python -m p5d -o local=/Users/leo/Pictures/downloads

        Only process specified categories:
        $ python -m p5d -o category="Marin, IdolMaster, Others"

        Overwrite rsync parameters:
        $ python -m p5d -o rsync="--remove-source-files -avzd"

        Specify multiple configs at once:
        $ python3 -m p5d -o local=/Users/leo/Pictures/downloads remote=/Users/leo/Downloads/TestInput category="Marin, IdolMaster, Others" rsync="--remove-source-files -a"

    Args:
        options (dict[str, Any]): A dictionary of configuration options to update.

    Raises:
        ValueError: If the input is not a dictionary, if an invalid key is provided,
            or if a value for `tag_delimiter` or `file_type` is not a string.
        KeyError: If a key in `options` is not valid or is missing from the configuration.
    """
```

# Misc
[H.264 and H.265 硬體解碼支援列表](https://www.pugetsystems.com/labs/articles/What-H-264-and-H-265-Hardware-Decoding-is-Supported-in-Premiere-Pro-2120/)

[Github Alerts highlight](https://github.com/orgs/community/discussions/16925)

VSC 遠端連線[1](https://xenby.com/b/221-%E6%95%99%E5%AD%B8-%E4%BD%BF%E7%94%A8-visual-studio-code-%E9%80%8F%E9%81%8E-ssh-%E9%80%B2%E8%A1%8C%E9%81%A0%E7%AB%AF%E7%A8%8B%E5%BC%8F%E9%96%8B%E7%99%BC)  [2](https://gist.github.com/SHANG-TING/d792af5480492626cf57a50aab4f7776#%e9%83%a8%e5%b1%ac%e5%85%ac%e9%96%8b%e9%87%91%e9%91%b0)

[docusaurus](https://github.com/Ouch1978/ouch1978.github.io)




# 清理書籤


## MacOS 注音輸入法
- [Yahoo! 輸入法](https://github.com/zonble/ykk_installer)：使用時間約一週，停止更新已久，很難用也很醜。
- [小麥注音](https://github.com/openvanilla/McBopomofo)：使用時間約三個月，中規中舉，選字位置在字的前一格所以每次選字都要多按一次左鍵，完全不記憶選字偏好，錯的字永遠錯，單詞量非常少，浪費很多時間在字字修正。
- [鼠鬚管](https://github.com/rime/squirrel)：使用時間約一天，選字框很醜，醜到我忘記他還有什麼特點。
- [威注音](https://github.com/vChewing/vChewing-macOS)：使用時間至今約兩個月，幾乎沒有記憶選字偏好，單詞量較小麥注音多，出現過一次記憶體異常佔用高達 300MB。

## KVM 虛擬機
- [KVM 虛擬機參數](https://cloud.tencent.com/developer/article/1766168)  
- 安裝完後無法偵測到網卡，要安裝[KVM虛擬機驅動程式](https://pve.proxmox.com/wiki/Windows_VirtIO_Drivers)，方式為關機、掛載iso、開機安裝。

## 翻新硬碟
ServerPartDeals 硬碟：官方翻新硬碟，沒什麼問題，但加上運費後不如去南京梵多買。  
https://www.reddit.com/r/DataHoarder/comments/13p1y5d/anyone_have_experiences_with_renewed_seagate/  
https://www.reddit.com/r/DataHoarder/comments/1352drh/whats_the_general_consensus_on_serverpartdeals/  

## Cloudflare Tunnel CLI 設定
使用 CLI 設定，我原本也是用 CLI 但是在後續更新後 GUI 已經可以正常使用
[影片教學](https://www.youtube.com/watch?v=7MDIfHR3GGs)  
[文字教學](https://medium.com/@sam33339999/cloudflared-%E4%BB%8B%E7%B4%B9%E4%BD%BF%E7%94%A8-b76fa4dcd875)  
[官方文檔1](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/#5-start-routing-traffic)  
[官方文檔2](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/as-a-service/linux/)   
[官方文檔3](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/tunnel-useful-commands/)  

## Cloudflare 重導向設定（適用 WAF）
https://www.sakamoto.blog/cloudflare-non-www-to-www/  

## NOIP 設定
https://lins2000.gitbooks.io/raspberry-pi-installation-guide/content/di-yi-ci-qi-dong/noip-an-zhuang-she-ding.html  
注意 NOIP 無法將 DNS 伺服器改為 Cloudflare，所以使用 Github Pages 等服務無法使用他的網域名稱。  

## 在Linux上使用Let’s Encrypt
https://klab.tw/2022/05/get-free-ssl-credentials-with-nginx-with-lets-encrypt-on-linux/  
使用 Cloudflare Tunnel 或者 Tailscale 可更輕鬆簡單的達成公眾訪問 / 私人訪問伺服器。缺點是 Cloudflare Tunnel 單[檔案大小限制](https://www.google.com/search?q=cloudflare+tunnel+file+size+limit&oq=cloudflare+tunnel+file+&gs_lcrp=EgZjaHJvbWUqBwgBEAAYgAQyBggAEEUYOTIHCAEQABiABDIICAIQABgIGB4yCAgDEAAYCBgeMggIBBAAGAgYHjIICAUQABgIGB4yCggGEAAYgAQYogQyCggHEAAYgAQYogQyCggIEAAYgAQYogQyCggJEAAYgAQYogTSAQk1MDMxNGowajGoAgCwAgA&sourceid=chrome&ie=UTF-8)為 100MB，在使用 [stirling pdf](https://github.com/Stirling-Tools/Stirling-PDF) 可能會無法上傳。

## TrueNAS TailScale 設定
等 2024/10 的 TrueNAS 24.10 版本更新後 k3s 將替換成 Docker，到時候再看設定是否改變。
https://www.youtube.com/watch?v=K_0vGr_rvds  

## SAMBA 安全設定
修正漏洞防止中間人攻擊  
https://blog.csdn.net/qq_46106285/article/details/130273351  

## Linux OPNsense 防禦入侵偵測
https://www.sakamoto.blog/opnsense-ids-suricata/  

## GPG 超詳細設定
https://gist.github.com/troyfontaine/18c9146295168ee9ca2b30c00bd1b41e  


