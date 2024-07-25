---
title: 'tmux 使用教學'
date: 2024-07-21T07:12:50+08:00
draft: false
author: "ZSL"
slug: 'tmux'
summary: "使用 tmux 管理多視窗，讓程序在 SSH 斷線後繼續運行。本文介紹 tmux 的安裝、基本使用方法以及整理常用的指令。"
tags: ["Linux", "tmux", "教學", "cheatsheet"]
categories: ["筆記"]
series: []
series_order: 
progress_bar: true
---

{{<lead>}}
tmux cheatsheet
{{</lead>}}

# 使用情境
1. **保存會話**：SSH 斷開後程序繼續運行  
例如使用 SSH 遠端控制執行耗時指令，使用 tmux 就可以使連線結束後指令繼續執行。
2. **多視窗管理**：單一終端內切換多個工作區  
同時執行多個指令可分離工作區。
3. [網路上抄的] **共享會話**：會議和教學  
允許多個用戶連接到同一個 tmux 會話，便於協作和教學。

# 基礎篇
安裝
```shell
sudo apt install tmux
```

啟用 tmux，執行耗時指令，離開 tmux 以及 SSH，指令分別為
```shell
tmux new -s [會話名稱]
# run your commands
ctrl+b d   # 離開會話
tmux attach -t [會話名稱]
```

使用時下方狀態欄為 `[會話名稱] ID:[視窗名稱]*`，星號是所在視窗。你可以創建會話中包含多個視窗，又包含多個窗格，所有東西都是獨立的。

# 指令整理
tmux 指令都是 `prefix + "操作"`，預設 prefix 是 <kbd>ctrl+b</kbd>。

## 1. 會話管理
```shell
創建：tmux new -s [會話名稱]
列出：tmux ls
進入：tmux attach -t [會話名稱]
離開：ctrl+b d
重新命名：ctrl+b $
```

## 2. 視窗管理
```shell
創建：ctrl+b c
重新命名：ctrl+b ,
關閉：ctrl+b &
# 切換視窗
上：ctrl+b p
下：ctrl+b n
指定編號：ctrl+b [0-9]
```

## 3. 窗格管理
```shell
創建垂直窗格：ctrl+b %
創建水平窗格：ctrl+b "
關閉窗格：ctrl+b x
移動：ctrl+b [方向鍵]
切換佈局：ctrl+b [空格鍵]
縮放窗格：ctrl+b z
```

## 4. 複製模式
進這個模式才可以上下移動。
```shell
進入：ctrl+b [
離開：q
```


## 5.命令模式
```ctrl+b :``` 進入命令模式，在命令模式中，可以輸入各種 tmux 命令，如 new-window、split-window 等

## 6. 不知道可以幹嘛
顯示時鐘：```ctrl+b t```


# 抱怨
剛寫完[部落格的誕生](https://www.zsl0621.cc/posts/20240723/)，邊寫邊查這篇馬上就遇到一樣的問題：網路資訊廢話一堆。有篇文章在當下是 Google 直接搜尋 tmux **第二個結果**，SEO 這麼高的文章寫一堆有的沒的花了 1/4 的篇幅才講到如何安裝，然後結尾才寫為什麼要用這項工具，這個人是從來沒有寫過文章嗎？但錯的不是他，是 [Google SEO](https://www.hantis-style.com/seo-article-atleast-600/) 的問題。
