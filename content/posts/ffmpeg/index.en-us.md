---
title: FFmpeg Notes
date: 2024-06-07
draft: false
slug: "ffmpeg-1"
summary: Basic knowledge of FFmpeg.
tags: ["useful tools", "image processing", "commend notes", "cheatsheet"]
categories: ["Tools"]
# series_order: 1
---
{{< lead >}}
However only get 60 for vmaf score.
{{< /lead >}}


# FFmpeg Usage

## Basic Knowledge

CRF (Constant Rate Factor): The higher CRF the higher loss. Set high CRF for high resolution videos and vise versa. CRF range is exponential, so increasing the CRF value +6 results in roughly half the bitrate / file size [(Source)](https://trac.ffmpeg.org/wiki/Encode/H.264).

Default CRF value:

- [H.264](https://trac.ffmpeg.org/wiki/Encode/H.264): 23
- [H.265 (x265)](https://trac.ffmpeg.org/wiki/Encode/H.265): 28
- [VP9](https://trac.ffmpeg.org/wiki/Encode/VP9): 31
- [AV1](https://trac.ffmpeg.org/wiki/Encode/AV1): 35

Note that each codec has its own CRF scale. Recommended quality settings can be found [here](https://handbrake.fr/docs/en/1.7.0/workflow/adjust-quality.html).

Myth: CRF 18 is visually lossless. For ultra-high-resolution videos on large screens, how can both CRF 18 and CRF 12 be visually lossless?

[The_Vista_Group@reddit:](https://www.reddit.com/r/ffmpeg/comments/jc88v3/what_crf_is_visual_lossless_for_4k/)  
> Visual lossless quality always depends on the source. That's why there are various encoder parameters to tweak.

## Installation

GUI: [HandBrake](https://handbrake.fr/downloads.php). It uses FFmpeg as its backend.  
CLI: FFmpeg

```sh
brew install ffmpeg
```

HandBrake (v1.8.0) has a rotation issue in my experience!

## HandBrake Usage

1. Select a preset.  
2. Open Source.  
3. Select title and adjust settings individually.  
4. Add this title to the queue.  
5. After adding all files to the queue, start the conversion.

## FFmpeg Usage

### Convert Folder \*.mov to H.265 with CRF

Outputs to ../output folder

```sh
for file in *.mov;
    do ffmpeg -i "$file" -c:v libx265 -tag:v hvc1 -crf 28 "$../output/{file%.mov}.mp4";
done
```

Add the hvc1 tag for compatibility with Apple devices.

### Two-Pass

<details>
	<summary>Two-pass?</summary>

[Source](https://www.pcdvd.com.tw/printthread.php?t=1109930&page=2&pp=10)
>I researched this yesterday and found from forums that multi-pass encoding is primarily for bitrate control rather than enhancing quality.
>
>Simply put, if you use CRF (constant quality) to compress a 1GB video and then use two-pass to compress it to the same size, the quality difference is negligible. Two-pass encoding is better compared to CBR and ABR. If precise bitrate control isn't needed, multi-pass encoding isn't necessary. More passes lead to closer adherence to the target bitrate.

</details>

```sh
for file in *.mov; do
  base="${file%.mov}"
  ffmpeg -y -i "$file" -c:v libx265 -b:v 1500k -x265-params pass=1 -an -f null /dev/null && \
  ffmpeg -i "$file" -c:v libx265 -b:v 1500k -x265-params pass=2 -c:a copy "../output/${base}.mp4"
done
```

### YouTube Default

YouTube 1080p configure [(Source)](https://www.reddit.com/r/ffmpeg/comments/r1qwyy/best_streaming_settings_for_youtube/)

```sh
ffmpeg -i <INPUT> -c:v libx264 -preset slow -crf 18 -vf scale=out_color_matrix=bt709 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -ar 48000 -ac 2 -b:a 320k -profile:v high -level 4.0 -bf 2 -coder 1 -pix_fmt yuv420p -b:v 10M -threads 4 -cpu-used 0 -r 30 -g 15 -movflags +faststart <OUTPUT>
```

### Conversion Score

VMAF is an objective full-reference video quality metric.

```sh
ffmpeg -i "outputFile" -i "sourceFile" -lavfi libvmaf=log_fmt=json:log_path=output.json -f null -
```

Find the VMAF models for macOS with brew install

```sh
brew list libvmaf
find "outputPath" -name "vmaf_v0.6.1.pkl"
ffmpeg -i input.mp4 -i output.mp4 -lavfi libvmaf="model_path=/path/model/vmaf_v0.6.1.pkl" -f null -
```

## Experiment for 11sec 20MB video

| Method                   | File Size |   Harmonic Mean |
|:------------------------|:-----------|----------------:|
| compare itself           | 20MB      |       99.954336 |
| `-x265-params lossless=1`| 240MB     |       63.249678 |
| `CRF=16`                 | 17.5MB    |       62.898537 |
| `CRF=22`                 | 6.5MB     |       62.083465 |
| `CRF=28`                 | 2.6MB     |       60.153667 |
| `two-pass rate=1500`     | 2.1MB     |       58.481517 |
| `handbreak rate=1500`    | 2.3MB     |       59.386817 |
| `handbreak`              | 6.7MB     |       62.118861 |
| `ffmpeg default`         | 2.4MB     |       58.975480 |

<details><summary>Full vmaf report</summary>

`compare itself`:
"vmaf": {  
"min": 97.427842,  
"max": 100.000000,  
"mean": 99.954852,  
"harmonic_mean": 99.954336  
}

Use `-x265-params lossless=1`  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 92.043819,  
"harmonic_mean": 63.249678  
}

Use `crf=16`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 91.293176,  
"harmonic_mean": 62.898537  
}

Use `crf=22`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 89.517049,  
"harmonic_mean": 62.083465  
}

Use `crf=28`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 85.081152,  
"harmonic_mean": 60.153667  
}

Use `two-pass rate=1500`:  
"vmaf": {  
"min": 0.000000,  
"max": 99.919186,  
"mean": 81.759161,  
"harmonic_mean": 58.481517  
}

Use `handbreak rate=1500`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 83.455953,  
"harmonic_mean": 59.386817  
}

Use `handbreak`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 89.575997,  
"harmonic_mean": 62.118861  
}

Use `ffmpeg default`:  
"vmaf": {  
"min": 0.000000,  
"max": 100.000000,  
"mean": 82.775001,  
"harmonic_mean": 58.975480  
}

</details>