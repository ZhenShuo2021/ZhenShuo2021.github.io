---
title: "別進來💢💢💢，這是測試🥵"
date: 2000-01-01
draft: false
description: "就說這邊放測試，不要亂點🥵"
noArchive: True
slug: "test-hugo"
summary: <kbd>ALT</kbd> + <kbd>F4</kbd>
robots: "noindex"
tags: ["指令筆記","實用工具","影像處理"]
categories: ["筆記"]
---
:hear_no_evil: 😀 😃 😄 😁 😆 🥵 🥶 🥴 😵 😵‍💫 ❤️‍🩹 ❤ 🧡 💢 💥 🫵 👍 👎 ✊ 👊  
Just make sure everything is ok 👊

{{< katex >}}

# Carousel
{{< carousel images="{https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MTYlM0E5fGVufDB8fDB8fHww,gallery/03.jpg,gallery/01.jpg,gallery/02.jpg,gallery/04.jpg}" >}}

Press <kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd> to end the session.  
Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.

# HTML
```html
Press <kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd> to end the session.
Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.
```

# Math
\\(f(a,b,c) = (a^2+b^2+c^2)^3\\)
{{< keyword >}} Super skill {{< /keyword >}}

# Figure
![Alt text](gallery/03.jpg "Image caption")
{{< figure
    src="https://pbs.twimg.com/media/GOTI0skbcAAkAVX.jpg"
    alt="Abstract purple artwork"
    caption="Photo by [Umi](https://x.com/sinonome_umi) on [Big Comic Superior](https://bigcomicbros.net/magazines/83422/)"
    >}}

# Shortcode
{{< youtubeLite id="yzrb4WA2NRQ" label="Blowfish-tools demo" params="start=130&end=10&controls=0" >}}
{{< codeimporter url="https://raw.githubusercontent.com/nunocoracao/blowfish/main/layouts/shortcodes/mdimporter.html" type="go" >}}
{{< github repo="nunocoracao/blowfish" >}}
{{< mdimporter url="https://raw.githubusercontent.com/nunocoracao/nunocoracao/master/README.md" >}}


# Code
```go
![Alt text](img/gallery/03.jpg "Image caption")
{{</* figure
    src="https://pbs.twimg.com/media/GOTI0skbcAAkAVX.jpg"
    alt="Abstract purple artwork"
    caption="Photo by [Umi](https://x.com/sinonome_umi) on [Big Comic Superior](https://bigcomicbros.net/magazines/83422/)"
*/>}}


{{</* youtubeLite id="yzrb4WA2NRQ" label="Blowfish-tools demo" params="start=130&end=10&controls=0" */>}}
```

# Mermaid
<div style="background-color:#eeefff; padding: 20px">
{{< mermaid >}}
gitGraph TB:
  commit id:"v0.1" tag:"v0.1"
  branch hotfix
  checkout hotfix
  commit id:"修復kernel issue"
  checkout main
  branch dev
  checkout dev
  merge hotfix id:"合併 hotfix  "
  commit id:"設置優化模塊"
  branch auth
  checkout auth
  commit type:HIGHLIGHT id:"ssh認證"
  commit id:"完成單元測試 "
  checkout dev
  branch algorithm
  commit id:"增加metric"
  checkout hotfix
  commit type:NORMAL id:"修復kennel issue"
  checkout algorithm
  commit id:"新增PCA-SIFT演算法"
  commit id:"完成單元測試"
  checkout dev
  commit type:REVERSE id:"回滾先前提交"
  checkout auth
  commit id:"優化性能"
  checkout main
  merge hotfix id:"合併 hotfix" tag:"v0.2"
  checkout auth
  commit id:"改進數據處理"
  checkout dev
  
  checkout algorithm
  commit id:"優化PCA-SIFT複雜度"
  checkout dev
  merge hotfix id:"合併 hotfix "
  merge algorithm id:"合併 PCA-SIFT"

  checkout auth
  commit id:"完成驗證功能"
  
  checkout dev
  merge auth
  
  checkout main
  merge dev id:"合併dev" tag:"v1.0"



  checkout auth
  commit id:"新增OTP功能"
  checkout main
  merge auth id:"新增OTP" tag:"v1.1"
  checkout algorithm
  commit id:"新增HOG演算法"
{{< /mermaid >}}
</div>
