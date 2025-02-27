---
title: FFmpeg筆記
date: 2024-06-07
lastmod: 2024-07-25
draft: false
description: 
summary: 介紹FFmpeg基本指令，以及轉檔實驗。
tags: ["指令筆記","實用工具","影像處理", "cheatsheet"]
categories: ["工具"]
# series_order: 1
---


{{< lead >}}
結果轉完分數只有60。
{{< /lead >}}


# 基本知識
CRF 越高壓縮率越高，畫質越低。而 CRF 值越低，畫質越高，但文件大小也越大。CRF 範圍是指數級的，因此增加 CRF 值 +6 會導致位元率/文件大小大約減半 [(來源)](https://trac.ffmpeg.org/wiki/Encode/H.264)。

預設 CRF 值：

- [H.264](https://trac.ffmpeg.org/wiki/Encode/H.264): 23
- [H.265 (x265)](https://trac.ffmpeg.org/wiki/Encode/H.265): 28
- [VP9](https://trac.ffmpeg.org/wiki/Encode/VP9): 31
- [AV1](https://trac.ffmpeg.org/wiki/Encode/AV1): 35

每個編解碼器的 CRF 是獨立的。推薦的 CRF 設置也可以在 [這裡](https://handbrake.fr/docs/en/1.7.0/workflow/adjust-quality.html) 找到。

迷思：CRF 18 為視覺無損。考慮CRF 12 才能使高解析度的影片在超大屏幕上恰好視覺無損，那 CRF 18 如何能視覺無損？

[The_Vista_Group@reddit:](https://www.reddit.com/r/ffmpeg/comments/jc88v3/what_crf_is_visual_lossless_for_4k/)  
> Visual lossless quality always depends on the source. That's why there are various encoder parameters to tweak.

# 安裝
{{< alert "egg">}}
目前使用HandBrake (v1.8.0) 有異常旋轉問題！
{{< /alert >}}

GUI: [HandBrake](https://handbrake.fr/downloads.php). It uses FFmpeg as its backend.  
CLI: FFmpeg

```
brew install ffmpeg
```

# 使用方法
## HandBrake

    1. 選擇一個 `Preset`
    2. 點擊 `Open Source`
    3. 選擇 `title` 並單獨調整
    4. 將此標題添加到隊列
    5. 添加所有文件到隊列後，開始轉換。

## FFmpeg 使用方法

### 轉換整個資料夾

將文件夾中的 `\*.mov` 轉換為 h.265 並輸出到 `../output` 文件夾


```
for file in *.mov;
    do ffmpeg -i "$file" -c:v libx265 -tag:v hvc1 -crf 28 "$../output/{file%.mov}.mp4";
done
```

加上 hvc1 標籤以支援蘋果設備讀取。

### Two-Pass Conversion

<details>
	<summary>What is two-pass?</summary>

[Source](https://www.pcdvd.com.tw/printthread.php?t=1109930&page=2&pp=10)
>我昨天研究了一下，根據國外論壇的討論，發現 multi-pass 並非是用來增強畫質，而是用來控制流量而已。
>
>簡單地說，如果用 CRF（恒定質量）壓出一個 1GB 的影片，再用 2-pass 壓出同樣大小的影片，兩者畫質是幾乎沒有分別的。2-pass 畫質比較好是指和 CBR、ABR 的比較。如果沒有需要精確的流量控制，事實上並不需要用 multi-pass。而 pass 越多次，會越接近設定的流量。

</details>

```
for file in *.mov; do
  base="${file%.mov}"
  ffmpeg -y -i "$file" -c:v libx265 -b:v 1500k -x265-params pass=1 -an -f null /dev/null && \
  ffmpeg -i "$file" -c:v libx265 -b:v 1500k -x265-params pass=2 -c:a copy "../output/${base}.mp4"
done
```

### YouTube 影片

YouTube 1080p 影片的畫質設定 [(Source)](https://www.reddit.com/r/ffmpeg/comments/r1qwyy/best_streaming_settings_for_youtube/)

```
ffmpeg -i <INPUT> -c:v libx264 -preset slow -crf 18 -vf scale=out_color_matrix=bt709 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -ar 48000 -ac 2 -b:a 320k -profile:v high -level 4.0 -bf 2 -coder 1 -pix_fmt yuv420p -b:v 10M -threads 4 -cpu-used 0 -r 30 -g 15 -movflags +faststart <OUTPUT>
```

### 轉碼評分  

VMAF 是 Netflix 開發的客觀全參考視訊品質指標。

```
ffmpeg -i "outputFile" -i "sourceFile" -lavfi libvmaf=log_fmt=json:log_path=output.json -f null -
```

Find your vmaf models for macOS brew install

```
brew list libvmaf
# find "outputPath" -name "vmaf_v0.6.1.pkl"
find "/opt/homebrew/Cellar/libvmaf/3.0.0" -name "vmaf_v*.pkl"
ffmpeg -i input.mp4 -i output.mp4 -lavfi libvmaf="model_path=/path/model/vmaf_v0.6.1.pkl" -f null -
```

ffmpeg -i bug.mov -i bug.mov \ 
    -lavfi "libvmaf=model_path=/opt/homebrew/Cellar/libvmaf/model/vmaf_v0.6.1.json" \
    -f null -

# 實驗

使用 11秒 20MB 的影片實驗，不同長度和解析度的影片可能也會導致結果不同。


| 使用方式                  | File Size |   Harmonic Mean |
|:------------------------|:-----------|----------------:|
| compare itself           | 20MB      |       99.954336 |
| `-x265-params lossless=1`| 240MB     |       63.249678 |
| `CRF=16`                 | 17.5MB    |       62.898537 |
| `CRF=22`                 | 6.5MB     |       62.083465 |
| `CRF=28`                 | 2.6MB     |       60.153667 |
| `two-pass rate=1500`     | 2.1MB     |       58.481517 |
| `handbreak rate=1500`    | 2.3MB     |       59.386817 |
| `handbreak`              | 6.7MB     |       62.118861 |
| `ffmpeg預設`              | 2.4MB     |       58.975480 |




{{< expand "Full vmaf report" >}}

compare itself  
"vmaf": {  
"min": 97.427842,  
"max": 100.000000,  
"mean": 99.954852,  
"harmonic_mean": 99.954336  
}

使用 `-x265-params lossless=1`  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 92.043819,  
"harmonic_mean": 63.249678  
}

使用 `crf=16`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 91.293176,  
"harmonic_mean": 62.898537  
}

使用 `crf=22`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 89.517049,  
"harmonic_mean": 62.083465  
}

使用 `crf=28`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 85.081152,  
"harmonic_mean": 60.153667  
}

使用 `two-pass rate=1500`:  
"vmaf": {  
"min": 0.000000,  
"max": 99.919186,  
"mean": 81.759161,  
"harmonic_mean": 58.481517  
}

使用 `handbreak rate=1500`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 83.455953,  
"harmonic_mean": 59.386817  
}

使用 `handbreak`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 89.575997,  
"harmonic_mean": 62.118861  
}

使用 `ffmpeg預設`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 82.775001,  
"harmonic_mean": 58.975480  
}
{{< /expand >}}

{{< hint "info" >}}
<h3>2024/7/25 更新</h3>

看到網路上有人手動設定 thread 就研究了一下這參數的設定，[預設](https://obsproject.com/forum/threads/can-you-please-explain-x264-option-threads.76917/)是
```C
h->param.i_threads = x264_cpu_num_processors() * (h->param.b_sliced_threads?2:3)/2;
```
也就是沒有 sliced 用 1 倍 CPU 核心數的線程數，反之 1.5 倍，而 sliced 指的是把每幀切成小圖片處理。根據自己隨手亂做的實驗，預設就很好了不用自己手動調整。
{{< /hint >}}  
{{< hint "info" >}}
<h3>2024/7/16 更新</h3>

寫這篇的時候其實是覺得 H.265 跟 AV1 好酷，結果發現還有更新的 AV2 已經在理論階段，以及 H.266/VVC 硬體解碼已經[實裝](https://www.techpowerup.com/review/intel-lunar-lake-technical-deep-dive/5.html)，甚至 MPEG-5 已經在 PhotoPrism [支援](https://github.com/photoprism/photoprism/issues/4314)。然而 H.266 似乎會重蹈 H.265 的覆轍死在複雜的專利權上（[出自 VLC 創辦人](https://www.youtube.com/watch?v=6xUhpZXPbBM)）。

最後，令人意外的是字結跳動 / 夏普 / 聯發科在 H.266 [專利數](https://www.chttl.com.tw/_news/n_tech07.html)上竟然貢獻這麼高。
{{< /hint >}}  