---
title: Git 基礎概念與實戰指令
date: 2024-06-02
draft: false
description: 
summary: 只講重點，網路上教學廢話好多好煩
tags:
  - Git
  - 筆記
  - Cheatsheet
categories: 
  - Git
externalUrl: https://zsl0621.cc/git/basic-knowledge
---

剛開始學 git 的時候東一篇西一篇就是不知道完整的流程，每個步驟都要上網查，光這篇文章的資訊可能就分散在四五個不同頁面很浪費時間，一開始只想先能動，之後遇到問題再說，所以這篇以能動起來為原則，並且給出多個基礎指令，至少出現問題知道怎麼查。

# 原理篇

Git 是一個版本管理工具，實際使用時有三個層面，分別是你的硬碟、本地儲存庫 (git)、遠端儲存庫 (github/gitlab)。你的硬碟什麼版本都不知道只放檔案當前狀態，儲存庫儲存所有版本，遠端儲存庫是最後同步共享的地方。

撰寫程式時，commit 提交到本地儲存庫，push 到遠端讓大家看。

## 檔案狀態（可先跳過）

> 以下修改自[官方說明](https://git-scm.com/book/zh-tw/v2/%E9%96%8B%E5%A7%8B-Git-%E5%9F%BA%E7%A4%8E%E8%A6%81%E9%BB%9E)：三種狀態

Git 會把你的檔案標記為三種主要的狀態：已修改modified、已預存staged、已提交committed。

1. 己修改 => 檔案被修改但尚未預存（處於工作目錄 working directory 中）。
2. 已預存 => 檔案將會被存到預存區，準備被提交（git add 後放在預存區 staging area）。
3. 已提交 => 檔案己安全地存在你的本地儲存庫（commit 後的狀態）。

<div style="background-color:#eeefff; padding: 20px">

</div>

# 版本狀態（可先跳過）

Git 可以看作一顆樹，每次 commit 都有獨一無二的 hash，並且指向上次的 commit 以紀錄每次版本變更，可新建分支功能，作為功能開發/修復緊急 bug 使用。

# 基礎指令篇

## 1. 初始化

```sh
git init
```

## 2. 索引檔案

```sh
git add [file-name]
git add .                   # 索引全部檔案
git reset [file-name]       # 移除索引檔案
git reset                   # 移除全部索引
```

## 3. 提交版本並附註

到這步就可以跑起基本的 git 了。

```sh
git commit -m [comments]
```

## 4. 查看狀態

```sh
git status                  # 檔案狀態（新增A、修改M、刪除D、未追蹤U）
git log                     # 提交歷史
```

## 5. 還原（重要）[^2]

這是使用度非常高的指令

```sh
# 軟重置：只刪 commit，其他不動
git reset --soft [hash]

# 混合重置：預設方式，刪 commit 和 add
git reset --mixed [hash]

# 硬重置：除了 commit 和 add 以外，連你的寫的程式都刪了，謹慎使用！
git reset --hard [hash]
```

[^2]: 工作目錄 (Working Directory)：硬碟實際編輯的檔案。  
預存區 (Staging Area)：預存你的變更，準備提交 (add的位置)。  
儲存庫 (Repository)：保存所有版本歷史的地方 (commit的位置)。
暫存區 (Stash)：(先不用看) 還不想 commit 卻要跑到其他地方操作的暫存區域。

## 6. 分支（可先跳過）

當你工作變複雜一條分支不夠用就會用到這些。

```sh
git branch                  # 查看
git branch [name]           # 新建
git checkout [name]         # 切換
git branch -D [name]        # 刪除
git branch -m [old] [new]   # 改名
git merge "NAME"            # 合併
```

# 上傳到遠端儲存庫

最常見的遠端儲存庫就是 Github 了，這裡以 Github 為例。

## 1. SSH

Github 已不支援帳號密碼登入，只能用 SSH 認證。  

1. [產生ssh金鑰](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)，官網教學寫的非常詳細。
2. (選用) 隱藏信箱Setting>Email勾選 "Block command line pushes that expose my email"，如要隱藏信箱，請到 `https://api.github.com/users/你的github名稱` 查看下面需要的 ID。
3. 設定名稱及信箱，如不需隱藏信箱則直接打自己的信箱

```sh
git config --global user.name "NAME"
git config --global user.email "{ID}+{username}@users.noreply.github.com"
```

4. 上傳 `git push -u origin main`
5. (選用) 新建的 git 連接既有的 github repo

```sh
git remote add origin git@github.com:your-username/your-repo.git
ssh -T git@github.com
git remote set-url origin git@github.com:ZhenShuo2021/ZhenShuo2021.github.io.git
```

## 2. GPG

(選用) 請直接看 [利用 GPG 簽署 git commit](https://blog.puckwang.com/posts/2019/sign_git_commit_with_gpg/) 的教學。  
如果要隱藏信箱在 GPG 設定時需使用剛剛設定的 noreply 信箱。  
如果已經有 GPG key，可以用以下指令刪除：

```sh
git config --global --unset-all user.signingkey
```

## 3. 遠端常用指令

```sh
git clone [remote.git] [dir]         # 克隆遠端倉庫，dir為可選
git push [origin] [branch]           # 推送到遠端，後兩項可選
git pull [origin] [branch]           # 拉取並合併，後兩項可選
git fetch [remote]                   # 拉取但不合併
git remote -v                        # 顯示遠端倉庫
git remote add [name] [remote.git]   # 增加遠端倉庫並指定名稱
```

<!-- - [進階] 新增部分 commit  
Git Cherry Pick
```sh
# 挑選特定 commit 到當前分支
git cherry-pick <commit-hash>

# 可以連續挑選多個 commit 
git cherry-pick <commit-hash1> <commit-hash2> ...
``` -->

# 正式工作篇 {#s1}

By [码农高天](https://www.youtube.com/watch?v=uj8hjLyEBmU)

一開始都一樣

```sh
git clone xxx.git                # 拉取遠端儲存庫
git checkout -b [my-feature]     # 新建分支進行工作
git add <file>
git commit -m [comments]
# git push origin [my-feature]
```

因為遠端更新，所以回到 main branch 同步遠端的新 commit，之後 rebase[^1] main branch，這樣就可以push。

[^1]: rebase: 讓兩個分支合而為一。把**目前分支**的修改放旁邊，加入**你輸入的分支**的修改，再想辦法把**目前分支**修改放進來。可能需要處理 rebase conflict。

```sh
git checkout main                # 回到main分支
git pull origin main             # 從遠端倉庫更新到main分支到本地
git checkout [my-feature]        # 回到feature分支
git rebase main                  # 把"feature"的更新接到main之後
git push -f origin [my-feature]  # 推送到遠端
```

接下來可以:

- Pull request 請求合併
- Squash and merge 合併並整合為一個commit
- Delete branch 刪除合併完的分支

遠端都處理好剛剛的分支後，刪除 branch 再同步 main branch。

```sh
git checkout main                 # 回到main分支
git pull origin main              # 推送main
git branch -D [my-feature]        # 刪除完成的my-feature
```

完整版的架構圖：

<div style="background-color:#eeefff; padding: 20px">

</div>

## 別用 git pull?

By [Philomatics](https://www.youtube.com/watch?v=xN1-2p06Urc)

原理是避免 git pull 產生一堆無用的 merge conflict。其實這和码农高天的用法是一樣的，只是合併成 git pull --rebase。如果沒衝突那很好，有衝突則 git rebase --abort 回復再做一般的 git pull。

<!-- ## rebase vs cherry-pick
Rebase: 將一個分支的**所有變更**移到另一個分支的頂端，用於保持線性歷史  
Cherry-pick: 提取單個 commit 到另一個分支，用於只需要特定更改的情況  

選用：  
Rebase 移動整個分支，cherry-pick 只移動單個 commit  
Rebase 用於整合分支，cherry-pick 用於選擇性地應用更改   -->