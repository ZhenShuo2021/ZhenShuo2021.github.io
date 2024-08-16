---
title: "Hugo Cheatsheets"
date: 2024-07-19T01:00:00+08:00
draft: false
description: "Hugo cheatsheet"
slug: "Hugo-cheatsheet"
summary: <kbd>Hugo cheatsheets ❤️‍🩹</kbd>
tags: ["Hugo", "Notes", "cheatsheet"]
categories: ["Hugo"]
---

Too hard to remember, so I made a cheat sheet.

# 1. Text emphasis
```md
# Buildin
{{</* keyword >}} keyword {{< /keyword */>}}

{{</* alert cardColor="#e63946" iconColor="#1d3557" textColor="#000000" >}}
**Alert!** text here
{{< /alert */>}}

<kbd>ALT</kbd>+<kbd>F4</kbd>
```

{{< keyword >}} keyword {{< /keyword >}}<br>
{{< alert icon="twitter">}}
**Alert!** text here
{{< /alert >}}  


{{< alert  cardColor="#FF4136" iconColor="#1a1b1d" textColor="#FFFFFF" >}}
Text here
{{< /alert >}}  
<kbd>ALT</kbd> + <kbd>F4</kbd>

```md
# Custom
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
{{< hint info >}}  
**⚠️ info**<br>
Text
{{< /hint >}}
{{< hint warning >}}  
**⚠️ warning**<br>
Text
{{< /hint >}}
{{< hint danger >}}  
**⚠️ danger**<br>
Text
{{< /hint >}}




<br>

# 2. Figure
```go
![Alt text](gallery/03.jpg "Image caption")
{{</* figure
    src="https://pbs.twimg.com/media/GOTI0skbcAAkAVX.jpg"
    alt="Abstract purple artwork"
    caption="Photo by [Umi](https://x.com/sinonome_umi) on [Big Comic Superior](https://bigcomicbros.net/magazines/83422/)"
    */>}}
{{</* carousel images="{https://cdn.pixabay.com/photo/2016/12/11/12/02/mountains-1899264_960_720.jpg, gallery/03.jpg, gallery/01.jpg, gallery/02.jpg, gallery/04.jpg}" */>}}
```
{{< carousel images="{https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MTYlM0E5fGVufDB8fDB8fHww,https://cdn.pixabay.com/photo/2016/12/11/12/02/mountains-1899264_960_720.jpg}" >}}

<br>

# 3. Math
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

{{< katex >}}
\\(f(a,b,c) = (a^2+b^2+c^2)^3\\)
$$
\footnotesize
\begin{aligned}
&h_{\text{LOS}} &&= e^{(j2\pi\mathcal{N}(1,1))} \newline
&h_{\text{NLOS}} &&= \mathcal{CN}(0, \sigma^2) \newline
&h &&= h_{\text{LOS}}\sqrt{\dfrac{K}{K + 1}} + h_{\text{NLOS}}\sqrt{\frac{1}{K + 1}}
\end{aligned}
$$



# 4. Load external URL
```go
{{</* mdimporter url="https://raw.githubusercontent.com/nunocoracao/nunocoracao/master/README.md" */>}}
{{</* codeimporter url="https://raw.githubusercontent.com/nunocoracao/blowfish/main/layouts/shortcodes/mdimporter.html" type="go" */>}}
{{</* github repo="nunocoracao/blowfish" */>}}
{{</* youtubeLite id="yzrb4WA2NRQ" label="Blowfish-tools demo" params="start=130&end=10&controls=0" */>}}
```
{{< youtubeLite id="yzrb4WA2NRQ" label="Blowfish-tools demo" params="start=130&end=10&controls=0" >}}
{{< github repo="nunocoracao/blowfish" >}}

