---
title: 'AMD 產品命名'
date: 2024-07-30T11:18:52+08:00
draft: false
summary: 備份一下，我真的也沒搞懂過 AMD 命名，這搞人式的命名方式讓我從來不組 AMD。  
showSummary: false
tags: ["備份"]
categories: ["隨筆"]
series: []
series_order: 
progress_bar: true
---

備份一下，我真的也沒搞懂過 AMD 命名，這搞人式的命名方式讓我從來不組 AMD。  
[原文](https://www.ptt.cc/bbs/PC_Shopping/M.1722274491.A.150.html)

# 表格

| 型號                    | 架構              | 型號                    | 架構              |
|:-------------------------|:-----------------------:|:-------------------------|:-----------------------:|
| Ryzen 1000系列          | ZEN架構               | Ryzen 7 5700            | ZEN3架構（APU版本）  |
| Ryzen 2000系列          | ZEN+架構              | Ryzen 5 5600X           | ZEN3架構              |
| 2000G系列APU            | ZEN架構               | Ryzen 5 5600            | ZEN3架構              |
| Ryzen 3000系列          | ZEN2架構              | Ryzen 5 5500            | ZEN3架構（砍內顯）   |
| 3000G系列APU            | ZEN+架構              | Ryzen 7000系列          | ZEN4架構              |
| Ryzen 4000系列          | ZEN2架構 <br>（APU專屬）   | Ryzen 8000系列          | ZEN4架構（APU）      |
| Ryzen 5000系列          | ZEN3架構              | 7500F                   | ZEN4架構              |
| 5000G系列               | ZEN3架構              | 8500F                   | 2x ZEN4核心 <br> 4x ZEN4c核心 |
| Ryzen 7 5700X           | ZEN3架構              |  |  |

# 原文

---

{{< hint info >}}
作者：AreLies (AreL1e5)

看板：PC_Shopping

標題：Re: [閒聊] AMD 的行銷命名很妙

時間：Tue Jul 30 01:34:49 2024

---

講到這個我就氣

- Ryzen 1000系列 ZEN架構
- Ryzen 2000系列 ZEN+架構
  - 但是2000G系列APU核心維持ZEN架構
- Ryzen 3000系列 ZEN2架構
  - 但是3000G系列APU核心維持ZEN+架構
- Ryzen 4000系列 ZEN3架構？？？？
  - 不是，這是ZEN2架構的APU專屬，有無內顯系列的
  - 但是4100比3100弱，因為不是完整快取
- Ryzen 5000系列 ZEN3架構
  - 恭喜，5000G系列終於用一樣ZEN3架構，超棒的啦
  - AMD說，不行，推出5000G無內顯系列，猜猜叫什麼？一樣Ryzen 5000
    - Ryzen 7 5700X 完整ZEN3架構
    - Ryzen 7 5700 APU版本ZEN3架構
    - Ryzen 5 5600X 完整ZEN3架構
    - Ryzen 5 5600 APU版本ZEN3架構？？？
    - 錯，5600X 完整ZEN3架構，純降頻版改叫5600
    - Ryzen 5 5500才是5600G砍內顯的版本
- Ryzen 7000系列 ZEN4架構
  - 抱歉，沒有7000G，事實上ZEN4架構的APU叫Ryzen 8000系列
  - 然後我們打算推出Ryzen 8000系列無內顯版本，叫做Ryzen 8000F系列
  - 剛好Ryzen 7000系列也有7500F
    - 所以8500G砍內顯，當然叫8500F
    - 7500F 6x ZEN4核心 32M快取
    - 8500F 2x ZEN4核心 4x ZEN4c核心 16M快取

相信消費者一定能搞清楚，不會看到數字大的就買

什麼，Intel移動端改Core Ultra而且出到200系列了？全新Ryzen AI 300數字比較大，但老實講AI 300系列數字大，也確實有比較強，尤其是功耗比跟溫度表現都很優秀，但不是這篇的重點

然後是顯卡：

全新GCN架構：

- HD7000
  - HD7730 >> GCN1
  - HD7750 >> GCN1
  - HD7770 GHZ >> GCN1
  - HD7790 >> GCN2
  - HD7850 >> GCN1
  - HD7870 XT.GHZ.Boost >> GCN1
  - HD7970 GHZ >> GCN1

下一代：

- HD8000???
  - 不是，HD7000給OEM的版本叫HD8000
  - GCN 的下一代版本叫什麼？HD9000？錯，叫R9 200 / R7 200 / R5 200
    - R5 240/250 >> GCN1
    - R5 260/260X >> GCN2
    - R5 265/270/270X/280/280X >> GCN1
    - R9 285/285X >> GCN3
    - R9 290/290X/295x2 >> GCN2

GCN 下下一代叫什麼？當然是R9 300/R7 300/R5 300，但有一部份是Ref，一部分是Ref再Ref

- R7 360 >> GCN2
- R7 370/370X >> GCN1
- R9 380/380X >> GCN3
- R9 390/390X >> GCN2
- R9 Fury/FuryX/NANO >> GCN3
- RADEON PRO DUO >> GCN3 定位雙核旗艦卡

註：GCN1.2.3都是28nm，基本上HD7000到R9 300都是差不多的東西，差別最大就是核心規模不同，然後Fury首次導入HBM

下一代R9 400? 抱歉，統一叫RX 400系列，因為X是羅馬數字10，之前是R9，現在是RX(R10)，有Get得到嗎

- RX 460/470/480 >> GCN4
- 然後我們推出D版，RX470D 基本上就是核心少一點的RX470
- 新版RADEON PRO DUO定位變成專業繪圖卡

全新RX 500系列登場：

- 啊抱歉這是RX 400系列Ref版本
  - RX 550/560/570/580 >> GCN4
  - 部份入門卡核心規模有變更，但一樣不重要
  - 然後我們又再推出全新系列 RX 580 2048SP版本，你知道那一張卡剛好也是2048SP嗎？RX470/570就是2048 SP，正常規格的RX 480/580是2304 SP，但也不用擔心，RX590登場，你答對了，RX580 超頻版本，沒有任何意義

我們在RX 500系列週期推出全新的旗艦卡，就叫RX VEGA，因為核心代號叫VEGA 10

- RX VEGA 56/64 >> GCN5，首度在零售遊戲卡導入HBM2

下一代理所當然是RX 600系列，只有RX 640，而且OEM only

註：GCN4.5都是14nm，真正的下一代，我們還做不出來，但是我們拿工作站MI50運算卡給你，就叫Radeon VII，核心代號VEGA 20，不過這是第一張7nm顯卡所以叫VII，懂嗎？Radeon VII >> GCN5, BUT 7nm

全新RDNA架構登場，當然是叫RX5000系列啊，不然勒

- RX5300/5500 核心代號 Navi 14
- RX5600/5700 核心代號 Navi 10
  - 但是Radeon Pro 5600M 核心代號 Navi12，而且是全5000系列唯一上HBM2的卡，蘋果跟虛擬化市場 only

RDNA2叫RX6000
RDNA3叫RX7000

嗯

---

Sent from my Nothing A065
{{< /hint >}}
