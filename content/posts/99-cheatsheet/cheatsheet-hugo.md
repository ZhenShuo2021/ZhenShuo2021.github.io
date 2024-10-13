---
title: "Hugo 小抄"
date: 2024-07-19T01:00:00+08:00
draft: false
description: "Hugo Blowfish cheatsheet，包含文字強調，shortcode，圖片，數學渲染，還有外站載入程式和MarkDown。"
summary: <kbd>Hugo cheatsheets ❤️‍🩹</kbd>
tags: ["Hugo"]
categories: ["筆記"]
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


# 1. Icon



| Icon name                       | Preview                           | Icon name            | Preview                           |
| :------------------------------ | :------------------------------: | :-------------------- | :------------------------------:  |
| <span class="bg-color">triangle-exclamation</span> | {{< icon triangle-exclamation >}} | <span class="bg-color">circle-info</span> | {{< icon circle-info >}} |
| <span class="bg-color">check</span> | {{< icon check >}} | <span class="bg-color">xmark</span> | {{< icon xmark >}} |
| <span class="bg-color">lightbulb</span> | {{< icon lightbulb >}} | <span class="bg-color">fire</span> | {{< icon fire >}} |
| <span class="bg-color">search</span> | {{< icon search >}} | <span class="bg-color">globe</span> | {{< icon globe >}} |
| <span class="bg-color">location-dot</span> | {{< icon location-dot >}} | <span class="bg-color">lock</span> | {{< icon lock >}} |
| <span class="bg-color">code</span> | {{< icon code >}} | <span class="bg-color">link</span> | {{< icon link >}}                |
| list                            | {{< icon list >}}                 | bars                 | {{< icon bars >}}                 |
| heart                           | {{< icon heart >}}                | heart-empty          | {{< icon heart-empty >}}          |
| bomb                            | {{< icon bomb >}}                 | bug                  | {{< icon bug >}}                  |
| download                        | {{< icon download >}}             | comment              | {{< icon comment >}}              |
| email                           | {{< icon email >}}                | edit                 | {{< icon edit >}}                 |
| expand                          | {{< icon expand >}}               | eye                  | {{< icon eye >}}                  |
| ghost                           | {{< icon ghost >}}                | fork                 | {{< icon fork >}}                 |
| graduation-cap                  | {{< icon graduation-cap >}}       | language             | {{< icon language >}}             |
| image                           | {{< icon image >}}                | shield               | {{< icon shield >}}               |
| mug-hot                         | {{< icon mug-hot >}}              | music                | {{< icon music >}}                |
| pencil                          | {{< icon pencil >}}               | pgpkey               | {{< icon pgpkey >}}               |
| phone                           | {{< icon phone >}}                | poo                  | {{< icon poo >}}                  |
| rss                             | {{< icon rss >}}                  | rss-square           | {{< icon rss-square >}}           |
| scale-balanced                  | {{< icon scale-balanced >}}       | skull-crossbones     | {{< icon skull-crossbones >}}     |
| moon                            | {{< icon moon >}}                 | sun                  | {{< icon sun >}}                  |
| star                            | {{< icon star >}}                 | wand-magic-sparkles  | {{< icon wand-magic-sparkles >}}  |


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
{{< carousel images="{https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MTYlM0E5fGVufDB8fDB8fHww,https://cdn.pixabay.com/photo/2016/12/11/12/02/mountains-1899264_960_720.jpg}" >}}

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



# 4. 外站載入
```go
{{</* mdimporter url="https://raw.githubusercontent.com/nunocoracao/nunocoracao/master/README.md" */>}}
{{</* codeimporter url="https://raw.githubusercontent.com/nunocoracao/blowfish/main/layouts/shortcodes/mdimporter.html" type="go" */>}}
{{</* github repo="nunocoracao/blowfish" */>}}
{{</* youtubeLite id="yzrb4WA2NRQ" label="Blowfish-tools demo" params="start=130&end=10&controls=0" */>}}
```
{{< youtubeLite id="yzrb4WA2NRQ" label="Blowfish-tools demo" params="start=130&end=10&controls=0" >}}
{{< github repo="nunocoracao/blowfish" >}}


# 5. 文字強調
```md
# 內建
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