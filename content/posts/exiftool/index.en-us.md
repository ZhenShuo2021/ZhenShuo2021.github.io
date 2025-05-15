---
Title: Automatically Update Photo EXIF Information Based on Folder Names Using ExifTool
Description: 
Date: 2024-03-19
Draft: true
Summary: A script to modify EXIF information, mainly for photo albums downloaded from the internet.
Tags:
  - Command Notes
  - Utility Tools
  - Exiftool
  - Photos
  - Notes
  - Cheatsheet
Categories:
  - Tools
# series_order: 1
---

<br>
{{< button href="https://github.com/ZhenShuo2021/blog-script/tree/main/exiftool" target="_self" >}}
Scripts Link (GitHub)
{{< /button >}}

This script modifies date info by the folder name. Use this for albums downloaded from network.

# 1. Requirements

[ExifTool](http://www.sno.phy.queensu.ca/~phil/exiftool/)  
For Windows users, you might need to install WSL or Git Bash to run the bash script. This script has not been tested on Windows.

# 2. Usage

1. Create a base folder and name your subfolder in the format "YYYYMMDD title".
2. Grant permission and run the script:

   ```sh
   chmod 755 /path/to/script.sh
   /path/to/script.sh "/base/folder/name"
   ```

Enjoy the organized EXIF dates!

Notes:

1. Modifications are based on the DateTimeOriginal in EXIF. If absent, we use CreateDate instead.
2. Ensure there is a backup for your pictures. You can delete the "-overwrite_original" to reserve original photo.
3. Nested subfolders are not supported.

# 3. Convert Photos to Ascending Time  

When file has exact same time, sort by modify time might out of order.  
[source]((https://photo.stackexchange.com/questions/60342/how-can-i-incrementally-date-photos))

```sh
# Set all photos to same date.
exiftool -overwrite_original -datetimeoriginal='2022:06:14 14:10:00' -filemodifydate='2022:06:14 14:10:00' DIR
# Increase time for each file by 10s ordered by file name.
exiftool -overwrite_original '-datetimeoriginal+<0:0:${filesequence}0' '-filemodifydate+<0:0:${filesequence}0' -fileorder filename DIR
```

# 4. Other EXIF Commands

## 4.1 Basic Usage

Increment 20 seconds by filename

```sh
exiftool -overwrite_original '-FileModifyDate+<0:0:${FileSequence; $_*=20}' -FileOrder Filename
```

Loose display

```sh
exiftool -s1 FILE/DIR
```

Only display specified info

```sh
exiftool -DateTimeOriginal FILE/DIR
```

Assign DateTimeOriginal to other AllDates

```sh
exiftool -r -if '$DateTimeOriginal' -P "-AllDates<DateTimeOriginal"  "-FileModifyDate<DateTimeOriginal" FILE
```

## 4.2 Copying EXIF

Copy exif info from [another file](https://exiftool.org/forum/index.php?topic=11385.0)

```sh
exiftool -tagsFromFile source.mpeg -FileModifyDate destination.mp4
```

**Compare the Metadata of two Files**
[Source](https://exiftool.org/forum/index.php?topic=3276.0)

```sh
exiftool a.jpg b.jpg -a -G1 -w txt
diff a.txt b.txt
```

**Copy all tags from another file**
[Source](https://exiftool.org/forum/index.php?topic=12962.msg)

```sh
exiftool -tagsfromfile A.jpg -all:all B.jpg
```

Copy exif info from another folder with [same name](https://exiftool.org/forum/index.php?topic=10322.0)

```sh
exiftool -TagsFromFile c:\exiftool\mpg\%f.mpg -FileCreateDate -FileModifyDate c:\exiftool\mp4
```

Other copying example from [official website](https://exiftool.org/exiftool_pod.html#COPYING-EXAMPLES).

## 4.3 Other Commands

**Rename file by dates**

```sh
# Good naming policy avoids EXIF missing forever
exiftool -d %Y%m%d_%H%M%%-c'-DEVICE_MODEL'.%%e "-filename<DateTimeOriginal" -fileorder DateTimeOriginal FILE
```

[Categorize by device model](https://exiftool.org/forum/index.php?topic=12361.0)  
Surprisingly useful for managing photos from different phones.

```sh
exiftool "-directory<%d/${model;}" -r .
```
