---
title: 撰寫 ZSH 自定義函式以及補全函式
date: 2025-02-15T02:46:46+08:00
create_data: 2025-02-15T02:46:46+08:00
draft: false
description: 使用 _path_files 函式完成自動補全，舉例來說，將 `hugo new content` 簡寫為 `hnc` 並且支援補全，第一步先建立一個檔案名稱為 hnc 的腳本放在 FPATH 裡面，不能用 alias，alias 不給補全，腳本如下：...
showSummary: false
tags:
  - ZSH
  - autocompletion
categories:
  - ZSH
  - Unix
series:
series_order: 
progress_bar: true
externalUrl: https://docs.zsl0621.cc/memo/linux/custom-zsh-completion
---

> 此文章已經新在我的[文檔庫](https://docs.zsl0621.cc/docs/linux/customize-zsh-function-and-comletion)中。

# 教學

舉例來說，將 `hugo new content` 簡寫為 `hnc` 並且支援補全，第一步先建立一個檔案名稱為 hnc 的腳本放在 FPATH 裡面，不能用 alias，alias 不給補全，腳本如下：

```sh
#!/bin/zsh
# 
# use hnc as shortcut for `hugo new content` with auto-completions
hugo new content $@
```

接下來一樣在 FPATH 路徑中新增一個 `_hnc` 文件用於設定補全，並且支援排除指定目錄

```sh
#compdef hnc
# 
# https://unix.stackexchange.com/questions/14434/path-files-and-compadd-ignore-files-parameter

_hnc() {
  local -a ignored
  # 已經 2025 了所以我想過濾掉所有 2024 的自動補全
  ignored=('about' 'archives' 'tags' 'categories' '2024*' '**/2024*')
  _path_files -/ -W "$PWD/content" -F ignored
}

_hnc
```

如果你的 zshrc 沒設定過補全記得加上這幾行以啟用

```sh
# 把路徑加入 fpath
fpath=(/dir/to/fpath $fpath)

# 載入該函式和補全系統
autoload -U /dir/to/fpath/*(:t)
autoload -U compinit

# 啟動補全系統
compinit
```

這樣就完成惹，並且支援目錄排除。

# 加速載入

補全系統載入速度很慢會讓你的終端第一次啟動時卡住約 0.3 秒，這是系統的問題不是我的腳本問題，建議使用 [zsh-defer](https://github.com/romkatv/zsh-defer) 延遲載入他，這樣你既有補全系統，又有速度幾乎完全一樣的終端機。

順便推銷，如果你的終端機很慢可以用[我的 dotfiles 設定檔](https://github.com/ZhenShuo2021/dotfiles)，不會有任何設定檔的載入速度能比我的快。

# 苦難

俗話說的好，授人以漁不如直接給他魚，為了這個簡單的自動補全從頭到尾花了兩週，實際耗時超過四小時，我不希望有人受到一樣的折磨...腳本不難難在找不到資訊，搜尋有關 `zsh completion ignore` 完全找不到相關文章，大部分搜尋結果都是 ZSH 插件的使用而不是自己寫一個補全腳本，最後是偶然發現除了 `_path` 函式以外還有類似的 `_path_files` 函式，怕自己用錯所以上網查 `zsh _path_files _files` 才跳出來[這篇文章](https://unix.stackexchange.com/questions/14434/path-files-and-compadd-ignore-files-parameter)在講 filter，哭啊我的兩個禮拜。

我又是繁體中文第一個寫有關於 ZSH 自動補全的人了，如果你搜尋 `zsh _files` 然後限制所有中文網頁會得到精美的 101 項搜尋結果，扣掉無關的、AI 生成的，搜尋結果數量會掉到更精美的個位數，繁體中文不用講搜尋結果=0。

# 參考

- [zshcompsys(1) - Linux man page](https://linux.die.net/man/1/zshcompsys)
- [_path_files and compadd ignore-files parameter](https://unix.stackexchange.com/questions/14434/path-files-and-compadd-ignore-files-parameter)
