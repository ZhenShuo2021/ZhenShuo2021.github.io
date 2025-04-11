---
title: 常用Docker指令
date: 2024-05-27
draft: false
slug: "docker"
summary: 常用的 docker 指令小抄
tags: ["Linux", "Docker", "指令筆記", "cheatsheet"]
categories: ["筆記"]
externalUrl: https://docs.zsl0621.cc/docs/Linux/useful-docker-commands
---

# 檢視資訊

```sh
docker compose ls            # 列出 compose 
docker container ls          # 列出容器，等同 docker ps
docker container stop <ID>   # 取得 ID 後可一一暫停
docker system df -v          # 列出硬碟相關的詳細資訊，不過列出的遠遠不只
```

# 進入 Docker 容器內部

```sh
docker ps
docker exec -it dbf85ae17c7c /bin/sh
# 若 sh 不行可改成 bash
```

# 運行控制

```sh
docker compose up -d         # d: detach，獨立持續運行
docker compose stop
docker compose restart

docker compose rm -s -v      # 不常用，s: stop, v: 移除匿名卷
```

# 清理

```sh
docker system prune -a       # 關閉停用的容器、網路、映像、快取
docker image prune -a        # 清理無用映像
```
