---
title: Hugo 小抄
date: 2024-07-19T01:00:00+08:00
draft: false
description: Hugo Blowfish cheatsheet，包含文字強調，shortcode，圖片，數學渲染，還有外站載入程式和MarkDown。
summary: <kbd>Hugo cheatsheets ❤️‍🩹</kbd>
tags: 
  - Hugo
categories:
  - 筆記
katex: true
---

很難記所以寫了一份小抄

# 清理資料夾

`hugo --cleanDestinationDir`

# 錨點

```md
# xxx {#id}
中間要空格
...
[goto](/posts/url#id/)
```

# 2. 圖片

```go
![Alt text](gallery/03.jpg "Image caption")
{{</* figure
    src="https://pbs.twimg.com/media/GOTI0skbcAAkAVX.jpg"
    alt="Abstract purple artwork"
    caption="Photo by [Umi](https://x.com/sinonome_umi) on [Big Comic Superior](https://bigcomicbros.net/magazines/83422/)"
    */>}}
{{</* carousel images="{https://cdn.pixabay.com/photo/2016/12/11/12/02/mountains-1899264_960_720.jpg, gallery/03.jpg, gallery/01.jpg, gallery/02.jpg, gallery/04.jpg}" */>}}
```

<br>

# 3. 數學

```c
{{</* katex */>}}
\\(f(a,b,c) = (a^2+b^2+c^2)^3\\)

$$
\footnotesize
\begin{aligned}
&h_{\text{LOS}} &&= e^{(j2\pi\mathcal{N}(1,1))} \newline
&h_{\text{NLOS}} &&= \mathcal{CN}(0, \sigma^2) \newline
&h &&= h_{\text{LOS}}\sqrt{\dfrac{K}{K + 1}} + h_{\text{NLOS}}\sqrt{\frac{1}{K + 1}}
\end{aligned}
$$
```

\\(f(a,b,c) = (a^2+b^2+c^2)^3\\)
$$
\footnotesize
\begin{aligned}
&h_{\text{LOS}} &&= e^{(j2\pi\mathcal{N}(1,1))} \newline
&h_{\text{NLOS}} &&= \mathcal{CN}(0, \sigma^2) \newline
&h &&= h_{\text{LOS}}\sqrt{\dfrac{K}{K + 1}} + h_{\text{NLOS}}\sqrt{\frac{1}{K + 1}}
\end{aligned}
$$

# 4. 外站載入

```go
{{</* mdimporter url="https://raw.githubusercontent.com/nunocoracao/nunocoracao/master/README.md" */>}}
{{</* codeimporter url="https://raw.githubusercontent.com/nunocoracao/blowfish/main/layouts/shortcodes/mdimporter.html" type="go" */>}}
{{</* github repo="nunocoracao/blowfish" */>}}
{{</* youtubeLite id="yzrb4WA2NRQ" label="Blowfish-tools demo" params="start=130&end=10&controls=0" */>}}
```

# 5. 文字強調

```md
# 內建
{{</* keyword >}} keyword {{< /keyword */>}}

{{</* alert cardColor="#e63946" iconColor="#1d3557" textColor="#000000" >}}
**Alert!** text here
{{< /alert */>}}

<kbd>ALT</kbd>+<kbd>F4</kbd>
```

```md
# 新增
{{</* expand "expand"  >}}
expand
{{< /expand */>}}

{{</* hint info >}}
**info/warning/danger**<br>
Text
{{< /hint */>}}
```

{{< expand "expand"  >}}  
expand
{{< /expand >}}
{{< hint note >}}  
Text
{{< /hint >}}
{{< hint tip >}}  
Text
{{< /hint >}}
{{< hint info >}}  
Text
{{< /hint >}}
{{< hint warning >}}  
Text
{{< /hint >}}
{{< hint danger >}}  
Text
{{< /hint >}}

# 6. 部落格參考

[Code and Me](https://blog.kyomind.tw/)  
[伊果的沒人看筆記本](https://igouist.github.io/)  
[大大的小蜗牛](https://www.eallion.com/)  
[拆解整合的旅人 by Ernest Chiang](https://www.ernestchiang.com/zh/)  
[CRE0809's Blog](https://blog.cre0809.com/)  
[老苏的blog 聚沙成塔，集腋成裘](https://laosu.tech/)  
[咕咕 learn or earn](https://blog.laoda.de/)  
[Sulv's Blog](https://www.sulvblog.cn/)  
[Hexo stellar theme](https://xaoxuu.com/)
