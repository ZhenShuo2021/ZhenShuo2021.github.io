---
title: 'git 回到過去'
date: 2024-08-17T00:07:33+08:00
draft: false
summary: 
showSummary: false
tags: ["筆記", "git", "cheatsheet"]
categories: ["git"]
series: []
series_order: 
progress_bar: true
---

# 前言
想加新 feature 時常常會 bug 東一個西一個，沒用 git 的時候就是 `ctrl+z` 大法，有了 branch 就不用再做這種蠢事了。本文介紹從舊 commit 新增 feature 的方式，由於新版 git 把 checkout [拆分](https://dwye.dev/post/git-checkout-switch-restore/)為 restore 和 switch，這裡也與時俱進使用新指令。

- git restore 恢復工作區文件
- git switch 切換或創建新分支

# 回到過去
如果我想回到某個 commit，從該 commit 開始修改：

```sh
git log
git switch -d <hash>
```

這個指令會：
1. 切換到指定的 commit，進入"分離頭指針"（detached HEAD[^1]）模式
2. 用於檢視舊版本代碼或進行臨時測試
3. 在這個狀態下的修改容易被丟棄，不會自動保存
4. 等同於舊版 `git checkout <hash>`

如果不需要回到以前，直接使用 `git switch -c` 創建新分支。

[^1]: 沒有家的 HEAD，如果有記 hash 可以找回，否則會被 git gc 機制一段時間後丟掉。

# 新增 feature
接下來開始修改文件，依照工作量有兩種方式：

- 如果只是小 feature:  
使用cherry-pick: 修改完成 add commit 之後，直接回到 main branch `git switch main`，並且撿回剛剛的 commit `git cherry-pick <new-hash>`

- 如果需要延伸修改:  
新建分支: 用新的 branch 儲存，`git switch -c <new-branch>`，接下來依照[前一篇教學](/posts/git-intro/)的正式工作篇完成合併。



---

接著是修改時可能會用到的指令。

# git stash



尚未 commit 可能會不讓你切換，可以使用 `git stash` 暫存檔案：

```sh
git stash push -m "<msg>"   # 也可不命名
git stash list              # 列出所有暫存檔案
git stash pop stash@{2}     # 還原檔案，沒指定會找最近的pop
git stash drop stash@{2}    # 還原檔案後可選擇刪掉stash
git stash apply stash@{2}   # 還原檔案並刪掉該暫存，等同pop+drop
git stash clear             # 清除所有stash
```

當你改到昏頭可以用 `git diff branch1..branch2` 查看兩個分支的差異。

# git restore

```sh
git restore <file>                  # 回復到最新commit
git restore --source HEAD~2 <file>  # 回復到指定commit
git restore --staged <file>         # 移除暫存區檔案，等同git reset <file>
```
