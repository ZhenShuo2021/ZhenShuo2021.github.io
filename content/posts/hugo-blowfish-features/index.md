---
title: "Hugo Blowfish 的進階客製化"
date: 2024-07-01T12:45:01+08:00
lastmod: 2024-07-25
draft: false
summary: 補足各種功能，例如文章存檔頁面、閱讀進度、文章編輯時間。
description: 
tags: ["Hugo", "筆記"]
categories: ["Hugo"]
series: ["自架 NAS 紀錄"]
series_order: 6
---

此客製化基於 hugo blowfish theme 完成。  
大部分的程式都由 GPT 完成，偉哉 GPT。  


# 1. 超連結

游標移動到連結時變色+底線。[範例](https://example.com/)

在assets/css/custom.css新增以下：
```css
.article-content a {
    color: rgb(65, 105, 225); /* 使用淡藍色 */
}

/* 懸停時底線改為粗線並增加距離 */
.article-content a:hover, .article-content a:focus {
    color: rgb(0, 0, 139); /* 設定連結懸停和聚焦狀態下的顏色 */
    text-decoration: underline; /* 添加連結懸停時的底線 */
    text-decoration-thickness: 2px; /* 設定底線的粗線 */
    text-decoration-skip-ink: none; /* 避免底線與文字重疊 */
    text-underline-offset: 4.5px; /* 增加底線與文字的距離*/
}
```

{{< expand "無聊叫 GPT 生的版本" >}}
```css
.article-content a {
  color: rgb(var(--color-primary-600));
  text-decoration: none;
  background-image: linear-gradient(90deg, 
    rgba(var(--color-primary-700), 0) 0%, 
    rgba(var(--color-primary-700), 0) 50%, 
    rgba(var(--color-primary-700), 1) 50%, 
    rgba(var(--color-primary-700), 1) 100%
  );
  background-size: 200% 2px;
  background-position: 100% 100%;
  background-repeat: no-repeat;
  transition: color 0.3s ease, background-position 0.5s ease-out;
}

.article-content a:hover,
.article-content a:focus {
  color: rgb(var(--color-primary-700));
  background-position: 0% 100%;
  animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
}

@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}
```
{{< /expand >}}

# 2. 文章存檔頁面

列出所有文章，無論是哪一種分類，[範例](https://www.zsl0621.cc/archives/)。

在 `layouts/_default/archive.html` 新增以下：

{{< expand 新版>}}
```html
{{ define "main" }}

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const postItems = document.querySelectorAll('.post-item');
        postItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.classList.add('post-item-hover');
            });
            item.addEventListener('mouseleave', function() {
                this.classList.remove('post-item-hover');
            });
        });
    
        // 為每個月份標題設置隨機漸變背景
        const monthTitles = document.querySelectorAll('.month-title');
        monthTitles.forEach(title => {
            const [color1, color2, color3] = generateContrastingColors(false);
            const [color4, color5, color6] = generateContrastingColors(true);
            const angle1 = generateRandomAngle();
            const angle2 = generateRandomAngle();
            // 為每個月份標題設置兩組不同的漸變效果
            title.style.setProperty('--gradient-1', `linear-gradient(${angle1}deg, ${color1}, ${color2})`);
            title.style.setProperty('--gradient-2', `linear-gradient(${angle2}deg, ${color4}, ${color5})`);
        });
    });
    
    function generateContrastingColors(isDarkMode) {
        // 隨機選擇一個基礎色相
        const baseColor = Math.random() * 360;
    
        // 在基礎色相的基礎上較大幅度偏移，以產生更顯著不同的顏色
        const c1 = baseColor;
        const c2 = (baseColor + 180 + Math.random() * 60 - 15) % 360; // 使第二個顏色與第一個顏色有較大的差異
        const c3 = (baseColor + 90 + Math.random() * 60 - 15) % 360; // 增加第三個顏色的偏移
        const c4 = (baseColor + 270 + Math.random() * 60 - 15) % 360; // 增加第四個顏色的偏移
    
        // 將顏色的亮度和飽和度調整為暗色系或亮色系
        const adjustColor = (color, isDarkMode) => {
            const lightness = isDarkMode ? 40 : 75; // 暗色模式較暗，亮色模式較亮
            const saturation = 100; // 暗色模式和亮色模式的飽和度
            return `hsl(${color}, ${saturation}%, ${lightness}%)`;
        };
    
        // 生成暗色系或亮色系的顏色
        const color1 = adjustColor(c1, isDarkMode);
        const color2 = adjustColor(c2, isDarkMode);
        const color3 = adjustColor(c3, isDarkMode);
    
        // 返回顏色字符串
        return [color1, color2, color3];
    }
    
    function generateRandomAngle() {
        const step = 15; // 每個選項的角度步長
        const minAngle = 30; // 最小角度
        const maxAngle = 150; // 最大角度
        const totalSteps = (maxAngle - minAngle) / step + 1; // 計算在此範圍內總共多少個步驟
        const randomStep = Math.floor(Math.random() * totalSteps); // 隨機選擇一個步驟
        const randomAngle = minAngle + randomStep * step; // 計算隨機角度
        return randomAngle;
    }
</script>




<style>
/* 默認樣式 */
/* 全部寬度 */
.timeline {
    max-width: 850px;
    margin: 0 auto;
    padding: 20px;
}

/* 年份 */
.year-container {
    margin-bottom: 40px ;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 60px rgba(0, 0, 0, 0.4);
    background-color: rgba(var(--color-neutral-300), 0.5);
}

/* 年份文字與背景 */
.year {
    background-color: #d9d4d4 !important;
    padding: 10px 20px;
    font-size: 24px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center; 
}

/* 年文章數 */
.post-count {
    background-color: #007bff;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 14px;
}

/* 月份 */
.month-container {
    margin-bottom: 30px;
}

.month-title {
    font-size: 1.2rem;
    font-weight: 700;
    background: var(--gradient-1);
    padding: 0.6rem 1rem;
    border-radius: 40px;
    border: transparent;
    text-transform: uppercase;
    
    /* 使用 Flexbox 來居中文本 */
    display: inline-flex;
    align-items: center;
    justify-content: center;

    /* 設定行高，使文字垂直居中 */
    line-height: 1;
    
}



.dark .month-title {
    background: var(--gradient-2);
}

/* 該月文章 */
.post-list {
    list-style-type: none;
    padding: 2px;
}

/* 個別文章背景 */
.post-item {
    transition: transform 0.3s, z-index 0.3s, box-shadow 0.3s, background-color 0.3s;
    background: rgba(var(--color-neutral-100), 0.95);
}

/* 個別文章懸浮 */
.post-item-hover {
    transform: scale(1.01);
    background: rgba(var(--color-neutral-100), 0.95) !important;
}

.post-item-inner {
    display: flex;
    align-items: flex-start;
    background-color: transparent;
}

/* 文章日期文字 */
.post-date {
    font-size: 14px;
    color: rgb(var(--color-neutral-500));
    margin-right: 11px;
    margin-left: 4px;
    white-space: nowrap; /* 防止日期文字換行 */
}

/* 文章標題文字 */
.post-title {
    font-size: 20px;
    color: rgb(var(--color-neutral-800)) !important;
    text-decoration: none;
    font-weight: bold;
} 

/* 深色模式樣式 */
.dark .year {
    background-color: rgba(var(--color-neutral-900), 0.95) !important;
    color: rgb(var(--color-neutral-100));
}

.dark .year-container {
    border: 1px solid rgb(var(--color-neutral-900));
    background-color: rgba(var(--color-neutral-800), 0.3);
}

.dark .month-title {
    color: rgb(var(--color-neutral-100));
}

.dark .post-item {
    background-color: rgba(var(--color-neutral-800), 0.4);
}

.dark .post-item-hover {
    background-color: rgba(var(--color-neutral-800),0.8) !important;
}

.dark .post-date {
    color: rgb(var(--color-neutral-100));
}

.dark .post-title {
    color: rgb(var(--color-neutral-100)) !important;
}

</style>


{{ if .Params.showHero | default (.Site.Params.article.showHero | default false) }}
{{ $heroStyle := .Params.heroStyle }}
{{ if not $heroStyle }}{{ $heroStyle = .Site.Params.article.heroStyle }}{{ end }}
{{ $heroStyle := print "partials/hero/" $heroStyle ".html" }}
{{ if templates.Exists $heroStyle }}
{{ partial $heroStyle . }}
{{ else }}
{{ partial "partials/hero/basic.html" . }}
{{ end }}
{{ end }}

{{ $currentLang := $.Site.Language.Lang }}
{{ $months := index $.Site.Data.months $currentLang }}

<article class="timeline">

<header id="single_header" class="mt-5 max-w-prose">
    <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">
        {{ .Title | emojify }}
    </h1>
</header>


<div class="article-content max-w-prose mb-20">          
    <br>
    {{ .Content }}
</div>

<section class="all-posts mt-8 text-neutral">
{{ range .Site.RegularPages.GroupByDate "2006" }}
    <div class="year-container">

    <div class="year">
        {{ .Key }}
        <span class="post-count">{{ len .Pages }}</span>
    </div>

    <div class="content">
    {{ range .Pages.GroupByDate "January" }}
    <div class="month-container">
        <span class="month-title">
            {{ index $months .Key }}
        </span>

        <ul class="post-list">
            {{ range where .Pages "Params.exclude" "ne" true }}
            <li class="post-item">
            <div class="post-item-inner">
                <span class="post-date">{{ .Date.Format "1月2日" }}</span>
                <div class="post-details">
                    <a href="{{ .Permalink }}" class="post-title">{{ .Title }}</a>

                    <div class="">
                    <div class="basicHtml-div">
                        {{ with .Params.categories }}
                        <div class="flex flex-wrap items-center mr-4 mb-2">
                        <span class="text-sm text-neutral-500 dark:text-neutral-400" style="font-size: 1rem; position: relative; top: -0.10em; left: -0.0em; margin-right: .5rem;">
                        {{ partial "icon.html" "list" }}
                        </span>
                        {{ range . }}
                        <span class="mr-1 mb-1">
                        <a href="{{ printf "/categories/%s" (urlize . | lower) }}" class="inline-block relative">
                        {{ partial "badge.html" . }}
                        </a>
                        </span>
                        {{ end }}
                        </div>
                        {{ end }}
                    </div>
                    <div class="basicHtml-div">
                        {{ with .Params.tags }}
                        <div class="flex flex-wrap items-center mr-4 mb-2">
                        <span class="text-sm text-neutral-500 dark:text-neutral-400" style="font-size: 1rem; position: relative; top: -0.1em; left: -0.0em; margin-right: .5rem;">
                        {{ partial "icon.html" "tag" }}
                        </span>
                        {{ range . }}
                        <span class="mr-1 mb-1">
                        <a href="{{ printf "/tags/%s" (urlize . | lower) }}" class="inline-block relative">
                        {{ partial "badge.html" . }}
                        </a>
                        </span>
                        {{ end }}
                        </div>
                        {{ end }}
                    </div>

                    </div>
                </div>
            </div>
            </li>
            {{ end }}
        </ul>

    </div>
    {{ end }}
    </div>
    </div>
{{ end }}
</section>

</article>

    
<!-- <script src="{{ "js/archives.js" | relURL }}"></script> -->

{{ end }}
```
{{< /expand >}}

{{< expand 舊版>}}
```html
{{ define "main" }}
{{ .Scratch.Set "scope" "single" }}

<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        color: #333;
    }

    .timeline {
        max-width: 800px;
        margin: 0 auto;
    }

    .container {
        padding: 10px 0;
        background-color: inherit;
        width: 100%;
        margin-bottom: 20px;
    }

    .date {
        padding: 15px;
        color: #000000;
        font-weight: bold;
        font-size: 1.8em;
        text-align: left;
        border-radius: 6px;
    }

    .content {
        padding: 20px 30px;
        background-color: white;
        border-radius: 6px;
    }

    .content h2 {
        margin-top: 0;
    }

    .content p {
        margin: 10px 0;
    }

    .post-date {
        color: #6e6e6e;
        margin-right: 10px;
    }

    /* 深色模式样式 */
    .dark body {
        background-color: #1a1a1a;
        color: #e0e0e0;
    }

    .dark .container {
        background-color: inherit;
    }

    .dark .date {
        color: #ffffff;
    }

    .dark .content {
        background-color: #2a2a2a;
    }

    .dark .content h2 {
        color: #f0f0f0;
    }

    .dark .post-date {
        color: #bbbbbb;
    }
</style>

<article class="timeline">
    {{ if .Params.showHero | default (.Site.Params.article.showHero | default false) }}
    {{ $heroStyle := .Params.heroStyle }}
    {{ if not $heroStyle }}{{ $heroStyle = .Site.Params.article.heroStyle }}{{ end }}
    {{ $heroStyle := print "partials/hero/" $heroStyle ".html" }}
    {{ if templates.Exists $heroStyle }}
    {{ partial $heroStyle . }}
    {{ else }}
    {{ partial "partials/hero/basic.html" . }}
    {{ end }}
    {{ end }}

    <header id="single_header" class="mt-5 max-w-prose">
        {{ if .Params.showBreadcrumbs | default (.Site.Params.article.showBreadcrumbs | default false) }}
        {{ partial "breadcrumbs.html" . }}
        {{ end }}
        <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">
            {{ .Title | emojify }}
        </h1>
    </header>

    <section class="all-posts mt-8 article-content">
        {{ range .Site.RegularPages.GroupByDate "2006" }}
        <div class="container">
            <div class="date">{{ .Key }}</div>
            <div class="content">
                {{ range .Pages.GroupByDate "January" }}
                <h3 class="text-xl font-semibold mt-6 mb-3">
                    {{ index $.Site.Data.month (printf "%d" .Key) }}
                </h3>
                <ul class="list-none" style="padding-left: 1.2em;">
                    {{ range .Pages }}
                    <li class="mb-3 flex items-start">
                        <span class="post-date">{{ .Date.Format "01-02" }}</span>
                        <a href="{{ .Permalink }}" class="text-primary-600 dark:text-primary-400 hover:underline">{{ .Title }}</a>
                    </li>
                    {{ end }}
                </ul>
                {{ end }}
            </div>
        </div>
        {{ end }}
    </section>
    
    <footer class="pt-8 max-w-prose print:hidden">
        {{ partial "article-pagination.html" . }}
        {{ if .Params.showComments | default (.Site.Params.article.showComments | default false) }}
        {{ if templates.Exists "partials/comments.html" }}
        <div class="pt-3">
            <hr class="border-dotted border-neutral-300 dark:border-neutral-600" />
            <div class="pt-3">
                {{ partial "comments.html" . }}
            </div>
        </div>
        {{ else }}
        {{ warnf "[BLOWFISH] Comments are enabled for %s but no comments partial exists." .File.Path }}
        {{ end }}
        {{ end }}
    </footer>
</article>

{{ end }}
```

{{< /expand >}}

在 `content/archives` 新增 _index.md：
```yaml
---
title: "所有文章"
layout: "archive"
description: "所有文章列表"
---
```

最後，在menus.zh-tw.toml新增：
```toml
[[footer]]
  name = "所有文章"
  pageRef = "archives"
  weight = 40
```

# 3. 閱讀進度

加上文章閱讀進度比例。

1. 在 `static/js/progress-bar.js` 貼上
```js
document.addEventListener('scroll', function () {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

    document.getElementById('progress-bar').style.width = scrollPercent + '%';
});
```

2. 在 `layouts/_default/single.html` 找到 `<header> <header>` ，在他的前後分別貼上
```html
<div id="progress-bar"></div>
<script src="{{ "js/progress-bar.js" | relURL }}"></script>
```

3. 在 `assets/css/custom.css` 貼上
```css
#progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background-color: #dc3434; /* You can change this color */
    z-index: 50; /* 99999 */
  }
```


# 4. 簡碼 - hint

移植 [alex-shpak/hugo-book](https://github.com/alex-shpak/hugo-book) 的 [hint shortcode](https://hugo-book-demo.netlify.app/docs/shortcodes/hints/)。
{{< hint info >}}
**Markdown content**  
Lorem markdownum insigne. Olympo signis Delphis! Retexi Nereius nova develat stringit, frustra Saturnius uteroque inter! Oculis non ritibus Telethusa
{{< /hint >}}

{{< hint warning >}}
**Markdown content**  
Lorem markdownum insigne. Olympo signis Delphis! Retexi Nereius nova develat stringit, frustra Saturnius uteroque inter! Oculis non ritibus Telethusa
{{< /hint >}}

{{< hint danger >}}
**Markdown content**  

Lorem markdownum insigne. Olympo signis Delphis! Retexi Nereius nova develat stringit, frustra Saturnius uteroque inter! Oculis non ritibus Telethusa
{{< /hint >}}

在 `assets/css/custom.css` 加入
```css
.book-hint {
    padding: 0.5em 1em;
    margin: 1em 0;
    border-left: 6px solid;
    border-radius: 4px;
    font-style: normal; /* 確保文字不斜體 */
    font-weight: normal; /* 確保文字不粗體 */
}

.book-hint .hint-content {
    margin: 0;
    font-style: normal; /* 確保文字不斜體 */
    font-weight: normal; /* 確保文字不粗體 */
}

.book-hint .hint-content > p:first-child {
    margin-top: 0;
    font-style: normal; /* 確保文字不斜體 */
    font-weight: normal; /* 確保文字不粗體 */
}

.book-hint .hint-content > p:last-child {
    margin-bottom: 0;
    font-style: normal; /* 確保文字不斜體 */
    font-weight: normal; /* 確保文字不粗體 */
}


/* Info hint */
.book-hint.info {
    border-color: #2196f3;
    background-color: rgba(33, 150, 243, 0.1);
}

/* Warning hint */
.book-hint.warning {
    border-color: #ffeb3b;
    background-color: rgba(255, 235, 59, 0.1);
}

/* Danger hint */
.book-hint.danger {
    border-color: #f44336;
    background-color: rgba(244, 67, 54, 0.1);
}

.book-hint .expand-wrapper {
    margin-top: 1em;
    /* 為所有在 hint 內的 expand 添加上邊距 */
}

.book-hint>p:first-child+.expand-wrapper,
.book-hint>.expand-wrapper:first-child {
    margin-top: 0;
    /* 如果 expand 是 hint 中的第一個元素或緊跟在第一個段落後面，則移除頂部邊距 */
}

.book-hint .hint-content > h1,
.book-hint .hint-content > h2,
.book-hint .hint-content > h3,
.book-hint .hint-content > h4,
.book-hint .hint-content > h5,
.book-hint .hint-content > h6 {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}


```

新增 `layouts/shortcodes/hint.html` 並貼上
```html
<blockquote class="book-hint {{ .Get 0 }}">
  <div class="hint-content">
    {{ .Inner | .Page.RenderString }}
  </div>
</blockquote>
```


# 5. 簡碼 - expand

比較美觀的 expand UI，一樣從 [alex-shpak/hugo-book](https://hugo-book-demo.netlify.app/docs/shortcodes/expand/) 拿來的，範例如下：
{{< expand "Example"  >}}
可用 Markdown 語法
```c
int x = 1;
```
1. list 1
1. **list 2 (bold)**
- 5

{{< hint info >}}
<h2> Title </h2>

支援內部渲染 hint shortcode
```c
int x = 1;
```
1. list 1
1. **list 2 (bold)**
- 5
{{< /hint >}}
{{< /expand >}}

新增 `layouts/shortcodes/expand.html`
```html
<div class="expand-wrapper prose dark:prose-invert max-w-prose zen-mode-content">
  <input id="{{ .Get "id" | default (printf "expand-%d" (.Ordinal)) }}" class="expand-toggle" type="checkbox" {{ if or (.Get "open") (in .Params "open") }}checked{{ end }}>
  <label for="{{ .Get "id" | default (printf "expand-%d" (.Ordinal)) }}" class="expand-title">
    <span class="expand-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </span>
    {{- $summary := cond .IsNamedParams (.Get "title") (.Get 0) -}}
    {{ $summary | .Page.RenderString }}
  </label>
  <div class="expand-content">
    <div class="expand-inner">
      {{ .Inner | .Page.RenderString }}
    </div>
  </div>
</div>
```

新增 `assets/css/custom.css`
```css
.expand-wrapper {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    background-color: #fff;
    /* 預設背景顏色 */
    width: 100%;
    transition: max-width 0.3s ease-in-out;
}

body.zen-mode-enable .zen-mode-content {
  max-width: 100% !important;
}

.expand-toggle {
    display: none;
}

.expand-title {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    /* 調整上下邊距 */
    background-color: #f7f7f7;
    /* 預設背景顏色 */
    color: #333;
    /* 預設文字顏色 */
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
    font-weight: normal;
    /* 取消粗體樣式 */
}

.expand-title:hover {
    background-color: #e0e0e0;
}

.expand-title .expand-icon {
    margin-right: 0.5rem;
    /* 調整圖標與文字之間的距離 */
}

.expand-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
    background-color: #fff;
    padding: 0 1.8rem;
}

.expand-toggle:checked~.expand-content {
    max-height: 8000px;
    /* 可以根據需要調整 */
    transition: max-height 0.8s ease-in-out;

}

.expand-inner {
    margin: -0.5rem 0;
    /* 使用負邊距縮短內容區域與邊框的距離 */
    padding: 0.5rem 0;
    /* 可根據需要調整 */
    color: #333;
    /* 預設文字顏色 */
}

/* 暗色模式樣式 */
.dark .expand-wrapper {
    border-color: #444;
    /* 暗色模式下的邊框顏色 */
    background-color: #222;
    /* 暗色模式下的背景顏色 */
}

.dark .expand-title {
    background-color: #333;
    /* 暗色模式下的標題背景顏色 */
    color: #e0e0e0;
    /* 暗色模式下的標題文字顏色 */
}

.dark .expand-title:hover {
    background-color: #444;
    /* 暗色模式下的標題懸停背景顏色 */
}

.dark .expand-content {
    background-color: #2c2c2c;
    /* 暗色模式下的內容背景顏色 */
}

.dark .expand-inner {
    color: #e0e0e0;
    /* 暗色模式下的內容文字顏色 */
}
```


# 6. 自動加上編輯時間

在文章末放上編輯日期提醒。

在 `layouts/_default/single.html` 找到 `{{ .Content }}` ，在他下面貼上：

```html
<br><br><br>
<div class="max-w-fit">
  {{ if ne (.Lastmod.Format "2006-01-02") (.Date.Format "2006-01-02") }}
  <div class="lead text-neutral-500 dark:text-neutral-400 !mb-9 text-xl">
    {{- $lastmodContent := partial "meta/date-updated.html" .Lastmod -}}
    {{ (printf "{{/%% hint info /%%}}文章更新：%s{{/%% /hint /%%}}" $lastmodContent) | markdownify }}
    </div>
  {{ end }}
</div>
```

記得要把 %% 前面的 / 刪掉。

# 7. ~~修改 metadata~~
Google 以不再用 keywords 為 SEO 關鍵字所以沒必要改這個。
{{<expand 原文>}}
Google SEO 會參考 meta name，而 Blowfish 的 tags 優先於 keywords 關鍵字。想要有 SEO 同時不想要 tags 打一堆次要標籤的修改如下：  
找到 `layouts/partials/head.html` 中的
```html
{{ with  .Params.Tags | default .Site.Params.keywords -}}
  <meta name="keywords" content="{{ range . }}{{ . }}, {{ end -}}" />
  {{- end }}
```


整段換成
```html
  {{- $mytags := .Params.Tags | default slice -}}
  {{- $mykeywords := .Params.Keywords | default .Site.Params.keywords -}}
  {{- $allKeywords := $mytags | append $mykeywords | uniq -}}
  {{ if $allKeywords }}
  <meta name="keywords" content="{{ delimit $allKeywords ", " }}" />
  {{ end }}  
```
{{</expand >}}

