---
title: "使用ExifTool根據文件夾名稱自動更新照片EXIF資訊"
description: "使用腳本根據文件夾名稱批量修改照片日期資訊，適合整理從網路下載的相簿，保障照片日期的準確性與一致性，並提供其他EXIF命令以便更好管理照片。"
date: 2024-03-19
draft: false
summary: 修改 EXIF 資訊的腳本，主要用於網路下載的相簿。
tags: ["指令筆記", "實用工具", "Exiftool", "照片", "筆記", "cheatsheet"]
categories: ["工具"]
# series_order: 1
---

{{< button href="https://github.com/ZhenShuo2021/blog-script/tree/main/exiftool" target="_self" >}}
腳本鏈接 (GitHub)
{{< /button >}}

這個腳本根據文件夾名稱修改照片的日期資訊，適用於從網路下載的相簿。只想看 Exiftool 指令教學請到 [4.](#s4)

# 1. 需求
[ExifTool](http://www.sno.phy.queensu.ca/~phil/exiftool/)  
Windows用戶可能需要安裝WSL或Git Bash來運行這個bash腳本。此腳本尚未在Windows上測試。

# 2. 使用方法 
1. 創建一個基礎文件夾，並按“YYYYMMDD 標題”的格式命名子文件夾。
2. 授予權限並執行：
```shell
chmod 755 /path/to/script.sh
/path/to/script.sh "/base/folder/name"
```

享受組織良好的EXIF日期吧！（這句翻譯成中文也太怪！）

注意事項： 
1. 修改是基於EXIF中的DateTimeOriginal。如果缺失，則使用CreateDate。
2. 確保為您的照片備份。您可以刪除"-overwrite_original"以保留原始照片。
3. 不支持嵌套子文件夾。

# 3. 將照片按時間順序排列  
當文件具有相同的時間時，按修改時間排序可能會導致順序錯亂。[來源](https://photo.stackexchange.com/questions/60342/how-can-i-incrementally-date-photos)

```shell
# 將所有照片設置為相同日期。
exiftool -overwrite_original -datetimeoriginal='2022:06:14 14:10:00' -filemodifydate='2022:06:14 14:10:00' DIR
# 按文件名順序每個文件增加10秒。
exiftool -overwrite_original '-datetimeoriginal+<0:0:${filesequence}0' '-filemodifydate+<0:0:${filesequence}0' -fileorder filename DIR
```


# 4. 其他EXIF命令 {#s4}

## 4.1 基本用法
按文件名每20秒遞增
```shell
exiftool -overwrite_original '-FileModifyDate+<0:0:${FileSequence; $_*=20}' -FileOrder Filename
```

鬆散顯示
```shell
exiftool -s1 FILE/DIR
```

只顯示指定資訊
```shell
exiftool -DateTimeOriginal FILE/DIR
```

將DateTimeOriginal分配給其他所有日期
```shell
exiftool -r -if '$DateTimeOriginal' -P "-AllDates<DateTimeOriginal" "-FileModifyDate<DateTimeOriginal" FILE
```


## 4.2 複製EXIF資訊
從[另一文件](https://exiftool.org/forum/index.php?topic=11385.0)複製EXIF資訊
```shell
exiftool -tagsFromFile source.mpeg -FileModifyDate destination.mp4
```


**比較兩個文件的元數據**
[來源](https://exiftool.org/forum/index.php?topic=3276.0)
```shell
exiftool a.jpg b.jpg -a -G1 -w txt
diff a.txt b.txt
```


**從另一文件複製所有標籤**
[來源](https://exiftool.org/exiftool_pod.html#COPYING-EXAMPLES)
```shell
exiftool -tagsfromfile A.jpg -all
B.jpg
```


從具有[相同名稱](https://exiftool.org/forum/index.php?topic=10322.0)的另一文件夾複製EXIF資訊
```shell
exiftool -TagsFromFile ./exiftool/mpg%f.mpg -FileCreateDate -FileModifyDate ./exiftool/mp4
```

[官方網站](https://exiftool.org/exiftool_pod.html#COPYING-EXAMPLES) 有更多複製範例。

## 4.3 其他命令
**按日期重命名文件**：良好的命名規則可永遠避免EXIF遺失
```shell
exiftool -d %Y%m%d_%H%M%%-c'-DEVICE_MODEL'.%%e "-filename<DateTimeOriginal" -fileorder DateTimeOriginal FILE
```


[按設備型號分類](https://exiftool.org/forum/index.php?topic=12361.0)：對管理來自不同手機的照片非常有用。
```shell
exiftool "-directory<%d/${model;}" -r .
```
