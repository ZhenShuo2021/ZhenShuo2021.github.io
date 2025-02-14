---
title: 2025 時間軸
date: 2025-02-15T06:10:46+08:00
create_data: 2025-02-15T06:10:46+08:00
draft: false
showSummary: false
tags: [ZSH, autocompletion]
categories: [ZSH, Unix]
series: []
series_order: 
progress_bar: true
---

# 20250215

> 人工智障

ChatGPT 和 Claude 都回答 `autoload -U` 功能是防止函數名稱被別名影響，不知道吃到哪個錯誤資訊的口水，實際用途是這個：

1. -U: 防止函數中的別名被擴展
2. -z: 使用 zsh 的方式載入函數

autoload 選項有這些，順帶提供參考

```sh
~ ❯ autoload -U
-R  -- remember autoload path, error if not found
-T  -- trace execution of this function only
-U  -- suppress alias expansion for functions
-d  -- default absolute path autoload to fpath
-k  -- mark function for ksh-style autoloading
-r  -- remember autoload path
-t  -- turn on execution tracing for functions
-w  -- specify that arguments refer to files compiled with zcompile
-z  -- mark function for zsh-style autoloading
```

AI 真正的用法應該是把這些沒人讀的文檔全部餵給他變成專用 AI，不然網路上查都查不到，問 AI 還被幻覺騙。

- [What is the difference between autoload and autoload -U in Zsh?](https://unix.stackexchange.com/questions/214296/what-is-the-difference-between-autoload-and-autoload-u-in-zsh)
- [zsh completion difference](https://stackoverflow.com/questions/12570749/zsh-completion-difference)
