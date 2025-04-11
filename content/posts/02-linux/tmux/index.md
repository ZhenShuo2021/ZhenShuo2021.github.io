---
title: 'tmux 使用教學'
date: 2024-07-21T07:12:50+08:00
draft: false
author: "ZSL"
slug: 'tmux'
summary: "使用 tmux 管理多視窗，讓程序在 SSH 斷線後繼續運行。介紹 tmux 的安裝、基本使用方法以及整理常用的指令。"
tags: ["Linux", "tmux", "教學", "cheatsheet"]
categories: ["筆記"]
series: []
series_order: 
progress_bar: true
externalUrl: https://docs.zsl0621.cc/docs/Linux/tmux
---

{{<lead>}}
tmux cheatsheet
{{</lead>}}

# tmux 使用教學

使用 tmux 能讓你

- 管理多個任務：將一個終端分割成多個視窗或面板
- 保持會話持久性：即使斷線，會話依然可重連繼續工作

最有用就是不佔用終端視窗，也不怕斷線。

# 第一次嘗試 tmux

安裝

```shell
sudo apt install tmux   # Linux
brew install tmux       # MacOS
```

最小實現指令

```shell
tmux                    # 進入會話
ctrl+b d                # 離開會話
ctrl+b x                # 刪除會話
ctrl+b [                # 在會話中捲動
tmux a                  # 連接最新的會話
```

tmux 有多種管理模式，會話包含多個視窗，視窗內又可分成多個窗格，彼此獨立運作。

下方狀態欄顯示 [會話名稱] ID:[視窗名稱]*，星號代表當前所在視窗。

指令整理章節整理會話視窗窗格的管理指令。

# 指令整理

tmux 指令都是 `prefix + "操作"`，預設 prefix 是 `ctrl+b`。

## 會話管理

```shell
創建：tmux new -s [會話名稱]
列出：tmux ls
進入：tmux attach -t [會話名稱]
離開：ctrl+b d
重新命名：ctrl+b $
```

## 視窗管理

```shell
創建：ctrl+b c
重新命名：ctrl+b ,
關閉：ctrl+b &
# 切換視窗
上：ctrl+b p
下：ctrl+b n
指定編號：ctrl+b [0-9]
```

## 窗格管理

```shell
創建垂直窗格：ctrl+b %
創建水平窗格：ctrl+b "
關閉窗格：ctrl+b x
移動：ctrl+b [方向鍵]
切換佈局：ctrl+b [空格鍵]
縮放窗格：ctrl+b z
```

## 彩蛋

顯示時鐘

```shell
ctrl+b t
```

# 抱怨

網路資訊廢話一堆。Google 搜尋 tmux 的第二篇文章寫一堆有的沒的花了 1/4 的篇幅才講到如何安裝，然後結尾才寫為什麼要用這項工具。
