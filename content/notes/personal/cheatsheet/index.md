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

# Python
pip 一次刪除所有套件
```sh
pip freeze | xargs pip uninstall -y && rm -rf build
```

從原始碼構建程式，以 [gallery-dl](https://github.com/mikf/gallery-dl) 為例
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


H.264 and H.265 Hardware Decoding  
https://www.pugetsystems.com/labs/articles/What-H-264-and-H-265-Hardware-Decoding-is-Supported-in-Premiere-Pro-2120/

Github markdown highlight
https://github.com/orgs/community/discussions/16925  

[docusaurus](https://github.com/Ouch1978/ouch1978.github.io)