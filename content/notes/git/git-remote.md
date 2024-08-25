---
title: 'Git 遠端指令'
date: 2024-08-25T22:24:42+08:00
draft: false
summary: 
showSummary: false
tags: ["筆記", "git"]
categories: ["git"]
series: []
series_order: 
progress_bar: true
---

這篇介紹遠端工作時常用的指令。  
減小克隆空間請見[這篇文章](/posts/git-reduce-size/)。

# 基本遠端指令
設定遠程倉庫地址，clone 下來後可用
```sh
git clone [remote.git] [dir]                  # 克隆遠端倉庫，dir為可選
git push [remote-name] [local-branch-name]    # 推送到遠端，後兩項可選
git push [remote-name] [local-branch-name]    # 拉取並合併，後兩項可選
git fetch [remote-name]                       # 拉取但不合併
git remote -v                                 # 顯示遠端倉庫
git remote add [remote-name] [remote.git]     # 增加遠端倉庫並指定名稱
git remote remove [name]                      # 刪除遠端倉庫
git remote rename [old-name] [new]            # 重命名遠端倉庫
git remote set-url [name] [url]               # 更改遠端倉庫的 URL
```

> [問題]找不到遠端可以用以下指令
```sh
git remote -v
git remote add
git remote set-url
```

第一次推送分支時使用此命令，將本地 main 分支與遠程 main 分支關聯起來。
```sh
git push --set-upstream origin [branch]
```

預防推錯分支，確保推送到遠端同名分支
```sh
git config --global push.default simple
```

第一次 clone 完後進入 main 以外的分支
```sh
git branch -av                    # 列出所有+遠端
git checkout -b dev origin/dev    # 創建並切換到dev
```



# 子模塊

將P5D新增為 `batch-processing/P5D` 子模塊
```sh
git submodule add https://github.com/ZhenShuo2021/P5D batch-processing/P5D
```

更新
```sh
git submodule update
```

查看所有子模塊
```sh
git submodule status
```

移除
```sh
# 編輯 .gitmodules 移除相關模塊
git config -f .git/config --remove-section submodule.batch-processing/pixiv
git rm --cached batch-processing/pixiv
rm -rf .git/modules/batch-processing/pixiv
rm -rf batch-processing/pixiv
git commit -m "Removed submodule batch-processing/pixiv"
```