---
title: Git 基礎概念與實戰指令
date: 2024-06-02
draft: false
description: 
summary: 只講重點，網路上教學廢話好多好煩
tags: ["git", "指令筆記", "cheatsheet"]
categories: ["筆記"]
twitter: "https://x.com"
---

{{< lead >}}網路上教學廢話好多好煩。

沒人想看你把一堆 commit 版本號打出來，我還要一個一個對你在講哪個 commit，有夠蠢。{{< /lead >}}

# 原理篇
git是一個版本管理工具，實際使用時有三個層面，分別是你的硬碟、儲存庫 (git)、遠端儲存庫 (github/gitlab)。你的硬碟什麼都不知道，儲存庫會儲存所有版本，遠端儲存庫是最後版本。

撰寫程式時，commit 提交新版本，push 到遠端讓大家看。

# 基礎指令篇
### 1. 初始化
```
git init
```
### 2. 索引檔案
```
git add <file-name>
git add . # 新增全部檔案
git reset <file-name> # 移除索引檔案
```
### 3. 提交版本並附註 
```
git commit -m <comments>
```
### 4. 查看狀態 
```
git status
git log
```
### 5. 分支
```
git branch # 查看
git branch <name> # 新建
git checkout <name> # 切換
git branch -D <name> # 刪除
git branch -m <old-name> <new-name> # 改名
git merge "NAME" # 合併
```


## 上傳到 Github
### 1. SSH

1. [產生ssh金鑰](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)
2. (Optional) 隱藏信箱Setting>Email勾選 "Block command line pushes that expose my email"，如要隱藏信箱，請到 `https://api.github.com/users/你的github名稱` 查看下面需要的 ID
3. 設定名稱及信箱，如不需隱藏信箱則直接打自己的信箱
``` git
git config --global user.name "NAME"
git config --global user.email "{ID}+{username}@users.noreply.github.com"
```
4. 上傳 `git push -u origin main`
5. (選用) 新建的 git 連接既有的 github repo
```
git remote add origin git@github.com:your-username/your-repo.git
ssh -T git@github.com
git remote set-url origin git@github.com:ZhenShuo2021/ZhenShuo2021.github.io.git
```

### 2. (Optional) GPG
請直接看 [利用 GPG 簽署 git commit](https://blog.puckwang.com/posts/2019/sign_git_commit_with_gpg/) 的教學。  
如果要隱藏信箱在 GPG 設定時需使用剛剛設定的 noreply 信箱。  
如果已經有 GPG key，可以用以下指令刪除：
```
git config --global --unset-all user.signingkey
```



## 還原工作階段[^2]
```
# 軟重置：只刪 commit
git reset --soft <commit-hash>

# 混合重置：預設方式，刪 commit 和 add
git reset --mixed <commit-hash>

# 硬重置：連你的寫的程式都刪了
git reset --hard <commit-hash>
```

[^2]: 工作目錄 (Working Directory)：硬碟實際編輯的檔案。  
暫存區 (Staging Area)：暫存你的變更，準備提交 (add的位置)。  
儲存庫 (Repository)：保存所有版本歷史的地方 (commit的位置)。

- [進階] 新增部分commit
Git Cherry Pick
```
# Apply 特定 commit 到當前分支
git cherry-pick <commit-hash>

# 可以連續挑選多個 commit 
git cherry-pick <commit-hash1> <commit-hash2> ...
```

# 正式工作篇
By [码农高天](https://www.youtube.com/watch?v=uj8hjLyEBmU)

一開始都一樣
```
git clone xxx.git
git checkout -b <my-feature>
git add <file>
git commit -m <comments>
# git push origin <my-feature>
```

因為遠端更新，所以回到 main branch 同步遠端的新 commit，之後 rebase[^1] main branch，這樣就可以push。

[^1]: rebase: 把此分支的修改放旁邊，加入 main 的修改，再想辦法把剛剛的修改放進來。可能需要處理 rebase conflict。
```
git checkout main
git pull origin main
git checkout <my-featuer>
git rebase main
git push -f origin <my-feature>
# Pull request 請求合併
# Squash and merge 合併並整合為一個commit
# Delete branch 刪除合併完的分支
```

遠端都處理好剛剛的分支後，刪除 branch 再同步 main branch。
```
git checkout main
git branch -D <my-feature>
git pull origin main
```

## 別用 git pull?
By [Philomatics](https://www.youtube.com/watch?v=xN1-2p06Urc)

原理是避免 git pull 產生一堆無用的 merge conflict。其實這和码农高天的用法是一樣的，只是合併成 git pull --rebase。如果沒衝突那很好，有衝突則 git rebase --abort 回復再做一般的 git pull。

## rebase vs cherry-pick
Rebase: 將一個分支的所有變更移到另一個分支的頂端，用於保持線性歷史  
&emsp;&emsp;&emsp;（把此分支的修改放旁邊，加入 main 的修改，再想辦法把剛剛的修改放進來） 

Cherry-pick: 選擇性地將單個 commit 應用到另一個分支，適用於只需要特定更改的情況  
&emsp;&emsp;&emsp;（從別的分支拿功能來用）

選用：  
Rebase 移動整個分支，cherry-pick 只移動單個 commit  
Rebase 重寫歷史，cherry-pick 保留原始歷史  
Rebase 用於整合分支，cherry-pick 用於選擇性地應用更改  