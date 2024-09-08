---
title: 'Git 修改已提交的內容'
date: 2024-09-07T14:10:12+08:00
draft: false
summary: 
showSummary: false
tags: ["git", "筆記"]
categories: ["git"]
series: []
series_order: 
progress_bar: true
---

前言  
- `hash^` 的那個 `^` 代表該 hash 的前一個 hash。
- `--amend` 可以加上 `--no-edit` 表示不修改 commit 訊息。
- rebase 如果是需要跳到以前進行修改的，git 都會自動幫你 checkout ，這時候查看 `git status` 會顯示你在互動式 rebase 中，`git branch` 則是跳到該 commit 由 rebase 建立並且控制的分支 `(no branch, rebasing main)`。

# 情況一：修改 commit message

1. 修改前一個 commit：`git commit --amend`

2. 修改更早的 commit：
   - `git rebase -i hash^`
   - 把想修改 message 的 commit 前面的 `pick` 改成 `r`
   - 跳出 commit message 視窗，直接修改
   - 附帶一提修改順序是從舊到新


# 情況二：修改前一個 commit

完成一個 feature 之後很開心的 commit，伸個懶腰馬上發現有 typo 要怎麼修改呢？

1. 修正 typo
2. `git add .`
3. `git commit --amend`
4. 結束，就這麼簡單

或者，放棄前一個 commit：`git reset --soft HEAD^`

話說這天天在發生...甚至在寫這篇的當下也發現 typo，然後又忘記 command 回來看自己的文章

# 情況三：單獨修改更早的 commit

接連修復了幾個 bug 並且分開 commit，結果發現舊 commit 有地方沒修好，要怎麼單獨修改那個 commit？

1. `git rebase -i hash^`
2. 該 hash 前面改成 edit 或者縮寫 e
3. 修改文件後加入追蹤 `git add <file name>`
4. 提交 `git commit --amend`
5. 完成 rebase `git rebase --continue`

# 情況四：合併 commit

覺得 commit 太瑣碎了想要合併：

1. `git rebase -i hash^`
2. 想要 **被合併** 的 commit `pick` 改 `s`，他會合併到前一個 commit
3. 完成 rebase `git rebase --continue`

# 情況五：修改 commit 的順序

完成多項功能開發，突然發現提交順序錯誤，關係順序很怪：

1. `git rebase -i hash^`
2. 直接調整 commit 順序並儲存
3. 完成 rebase `git rebase --continue`

# 情況六：刪除 commit

1. `git rebase -i hash^`
2. 把該 commit `pick` 改成 `drop`
3. 完成 rebase `git rebase --continue`

# 情況七：不影響當前分支，修改一個特定的 commit

請看[另一篇文章](/posts/git-goback/)

# 結語：
每個情境了不起就五句話，某賣課網站可以把每個情境都寫成一篇文章，還被 Google SEO 洗到很前面，佩服佩服= =