---
title: 'Git 減少 clone 空間'
date: 2024-08-22T21:03:25+08:00
draft: false
summary: 
showSummary: false
tags: ["git","筆記"]
categories: ["git"]
series: []
series_order: 
progress_bar: true
---

使用 git clone 遠端儲存庫，當儲存庫過大而你不需要全部資料的時候可以使用以下指令。

```sh
--filter=blob:none       # 不要下載大文件 blobs
--depth=1                # 淺克隆，只複製第一層
--shallow-since=[date]   # 淺克隆，限定日期
--no-checkout            # 不會把文件放到工作目錄
--sparse                 # 只取出根目錄檔案
```

也可以設定 `--filter=blob:limit=1m` 限制檔案大小為 1MB

# Sparse Checkout
組合拳就是 `git clone --filter=blob:none --depth=1 --no-checkout --sparse`，這個指令會先不切換到分支，所以工作目錄會是空的。下一步就是取出需要的檔案，使用錐形模式，只取出 `data` `src` 資料夾內容：

```sh
git sparse-checkout init --cone
git sparse-checkout set [data] [src]
```

或者[寫入黑名單](https://ryanagibson.com/posts/shrink-git-repo/#as-a-user)到 sparse-checkout 中：

```sh
printf '/*\n!exampleSite/*\n!images/*\n!assets/img/*\n!*.png' > .git/info/sparse-checkout && git checkout
```

這會下載所有檔案 `/*` 並且忽略 `exampleSite/` `images/` `assets/img`  `*.png`。

如果需要完整儲存庫可以用 `git sparse-checkout disable` 恢復一般 checkout 模式。

> 什麼是 cone 模式？
- 只檢視資料夾目錄，不會一一檢查所有文件，圖片畫起來就像是個圓錐。
- 使用 `sparse-checkout` 時，沒有用 cone 會比較慢，因為他會遍歷所有文件
- cone 模式每次設定都會覆蓋之前的規則，非 cone 模式則是累加規則。

# 同場加映：清理 git 儲存庫
`git clean -f` 刪除未追蹤文件：

```sh
-d             # 目錄也一起刪掉
-n             # 顯示將被清除的檔案，建議先看會刪除什麼
```

`git gc --prune=now --aggressive` 清理快取：
```sh
--prune=now    # 立刻刪除所有無用的物件。
--aggressive   # 更積極優化，花費更多時間。
```

# 待續
使用 [git-filter-repo](https://github.com/newren/git-filter-repo) 套件有更多功能。

# 參考資料
https://docs.gitlab.com/ee/topics/git/clone.html   
https://docs.gitlab.com/ee/user/project/repository/reducing_the_repo_size_using_git.html   
https://ryanagibson.com/posts/shrink-git-repo   
https://blog.miniasp.com/post/2022/05/17/Down-size-your-Monorepo-with-Git-Sparse-checkouts   