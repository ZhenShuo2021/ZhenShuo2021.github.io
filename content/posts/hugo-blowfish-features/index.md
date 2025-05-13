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

在 `assets/css/custom.css` 新增

```css
.article-content a {
  text-decoration: underline;
  text-decoration-skip-ink: none;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  text-decoration-color: rgba(var(--color-primary-900), 0.6);
  color: rgba(var(--color-primary-900), 1);
}
.article-content a:hover {
  text-decoration: underline;
  text-decoration-color: rgba(var(--color-primary-600), 1);
  color: rgba(var(--color-primary-600), 1);
}
.dark .article-content a {
  text-decoration-color: rgba(var(--color-primary-600), 0.6);
  color: rgba(var(--color-primary-600), 1);
}
.dark .article-content a:hover {
  text-decoration: underline;
  text-decoration-color: rgba(var(--color-primary-400), 1);
  color: rgba(var(--color-primary-400), 1);
}
```

# 2. 文章存檔頁面

列出所有文章，無論是哪一種分類，[範例](https://www.zsl0621.cc/archives/)。

在 `layouts/_default/archive.html` 新增以下：

{{< expand archive.html>}}

```html
{{ define "main" }}
  {{ if .Params.showHero | default (.Site.Params.article.showHero | default false) }}
    {{ $style := .Params.heroStyle | default .Site.Params.article.heroStyle | default "basic" }}
    {{ $heroPath := print "hero/" $style ".html" }}
    {{ if templates.Exists (print "partials/" $heroPath) }}
      {{ partial $heroPath . }}
    {{ else }}
      {{ partial "hero/basic.html" . }}
    {{ end }}
  {{ end }}

  {{ $currentLang := $.Site.Language.Lang }}
  {{ $months := index $.Site.Data.months $currentLang }}


  <script>
    document.addEventListener("DOMContentLoaded", function () {
      const postItems = document.querySelectorAll(".post-item")
      postItems.forEach((item) => {
        item.addEventListener("mouseenter", function () {
          this.classList.add("post-item-hover")
        })
        item.addEventListener("mouseleave", function () {
          this.classList.remove("post-item-hover")
        })
      })

      const monthTitles = document.querySelectorAll(".month-title")
      monthTitles.forEach((title) => {
        const [color1, color2, color3] = generateContrastingColors(false)
        const [color4, color5, color6] = generateContrastingColors(true)
        const angle1 = generateRandomAngle()
        const angle2 = generateRandomAngle()
        title.style.setProperty("--gradient-1", `linear-gradient(${angle1}deg, ${color1}, ${color2})`)
        title.style.setProperty("--gradient-2", `linear-gradient(${angle2}deg, ${color4}, ${color5})`)
      })
    })

    function generateContrastingColors(isDarkMode) {
      const baseColor = Math.random() * 360
      const c1 = baseColor
      const c2 = (baseColor + 180 + Math.random() * 60 - 15) % 360
      const c3 = (baseColor + 90 + Math.random() * 60 - 15) % 360
      const c4 = (baseColor + 270 + Math.random() * 60 - 15) % 360

      const adjustColor = (color, isDarkMode) => {
        const lightness = isDarkMode ? 40 : 75
        const saturation = 100
        return `hsl(${color}, ${saturation}%, ${lightness}%)`
      }

      const color1 = adjustColor(c1, isDarkMode)
      const color2 = adjustColor(c2, isDarkMode)
      const color3 = adjustColor(c3, isDarkMode)

      return [color1, color2, color3]
    }

    function generateRandomAngle() {
      const step = 15
      const minAngle = 30
      const maxAngle = 150
      const totalSteps = (maxAngle - minAngle) / step + 1
      const randomStep = Math.floor(Math.random() * totalSteps)
      return minAngle + randomStep * step
    }
  </script>

  <style>
    .timeline {
      max-width: 850px;
      margin: 0 auto;
      padding: 20px;
    }

    .year-container {
      margin-bottom: 40px;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 60px rgba(0, 0, 0, 0.4);
      background-color: rgba(var(--color-neutral-300), 0.56);
    }

    .year {
      background-color: rgba(var(--color-neutral-400), 0.91);
      padding: 10px 20px;
      font-size: 24px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .post-count {
      background-color: #007bff;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 14px;
    }

    .content {
      padding: 20px;
    }

    .month-container {
      margin-bottom: 30px;
    }

    .month-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
      background: var(--gradient-1);
      padding: 0.6rem 1rem;
      border-radius: 40px;
      border: transparent;
      padding-bottom: 5px;
      margin-bottom: 15px;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .post-list {
      list-style-type: none;
      padding: 2px;
    }

    .post-item {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      transition: background-color 0.3s;
      transition:
        transform 0.3s,
        z-index 0.3s,
        box-shadow 0.3s,
        background-color 0.3s;
      background: #ffffff;
    }

    .post-item-hover {
      transform: scale(1.01);
    }

    .post-item-inner {
      display: grid;
      grid-template-areas:
        "date details"
        "date category";
      grid-template-columns: auto 1fr;
      gap: 1px;
      background-color: transparent;
      padding-bottom: 0.4em;
    }

    .post-date {
      font-size: 14px;
      color: rgb(var(--color-neutral-500));
      margin-right: 11px;
      margin-left: 4px;
      white-space: nowrap;
      min-width: 4em;
      grid-area: date;
    }

    .post-details {
      grid-area: details;
    }

    .post-title {
      font-size: 20px;
      color: rgb(var(--color-neutral-800)) !important;
      text-decoration: none;
      font-weight: bold;
    }

    .tag-and-category {
      grid-area: category;
      margin-bottom: -20px;
    }

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
      background: var(--gradient-2);
    }

    .dark .post-item {
      background-color: rgba(var(--color-neutral-800), 1);
    }

    .dark .post-item-hover {
      background-color: rgba(var(--color-neutral-800), 0.8) !important;
    }

    .dark .post-date {
      color: rgb(var(--color-neutral-100));
    }

    .dark .post-title {
      color: rgb(var(--color-neutral-100)) !important;
    }

    @media (max-width: 768px) {
      .timeline {
        max-width: 100%;
        margin: 0 auto;
        padding: 0px;
      }

      .post-list {
        padding: 2px;
      }

      .post-item {
        width: 100%;
        margin-bottom: 12px;
        background-color: rgba(var(--color-neutral-100), 0.95);
        border-radius: 8px;
        overflow: hidden;
      }

      .post-item-inner {
        display: grid;
        grid-template-areas:
          "date"
          "details"
          "category";
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 0;
        padding: 5.5px;
        margin-bottom: 1px;
      }

      .post-date {
        margin-left: 0px;
        grid-area: date;
        margin-top: -1.2em;
        margin-bottom: -0.8em;
        font-size: 0.6em;
        color: rgb(var(--color-neutral-500));
        padding: 0px;
      }

      .post-details {
        grid-area: details;
        margin-bottom: 0.1rem;
        padding: 0px;
      }

      .tag-and-category {
        padding: 0px;
        grid-area: category;
        margin-top: 0px;
      }
    }
  </style>

  <article class="timeline">
    <header id="single_header" class="mt-5 max-w-prose">
      <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">{{ .Title | emojify }}</h1>
    </header>

    <div class="article-content max-w-prose mb-20"><br>{{ .Content }}</div>

    <section class="all-posts mt-8 text-neutral">
      {{ $filteredPages := where .Site.RegularPages "Params.noArchive" "ne" true }}
      {{ range $filteredPages.GroupByDate "2006" }}
        <div class="year-container">
          <div class="year">
            {{ .Key }}
            <span class="post-count">{{ len .Pages }}</span>
          </div>
          <div class="content">
            {{ range .Pages.GroupByDate "January" }}
              <div class="month-container">
                <span class="month-title">{{ index $months .Key }}</span>
                <ul class="post-list">
                  {{ range .Pages }}
                    <li class="post-item">
                      <div class="post-item-inner">
                        <div class="post-date">{{ .Date.Format "1月2日" }}</div>
                        <div class="post-details">
                          {{ if .Params.externalUrl }}
                            <a
                              href="{{ .Params.externalUrl }}"
                              class="post-title font-bold text-xl text-neutral-800 decoration-primary-500 hover:underline hover:underline-offset-2 dark:text-neutral"
                              target="_blank">
                              {{ .Title }}
                              <span
                                class="text-xs align-top cursor-default text-neutral-400 dark:text-neutral-500">
                                <span class="rtl:hidden">&#8599;</span>
                                <span class="ltr:hidden">&#8598;</span>
                              </span>
                            </a>
                          {{ else }}
                            <a
                              href="{{ .Permalink }}"
                              class="post-title font-bold text-xl text-neutral-800 decoration-primary-500 hover:underline hover:underline-offset-2 dark:text-neutral"
                              >{{ .Title }}</a
                            >
                          {{ end }}
                        </div>
                        {{ partial "custom/tag-and-category.html" . }}
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

仿照 Docusaurus 的 [admonitions](https://docusaurus.io/zh-CN/docs/markdown-features/admonitions) 完成。

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

{{< expand custom.css >}}

```css
.admonition {
  padding: 1rem;
  margin: 1.5rem 0;
  border-radius: 0.375rem;
  border-left-width: 5px;
  border-left-style: solid;
  overflow: hidden;
  color: #1f2937;
}
.dark .admonition {
  color: #f3f4f6;
}
.admonition-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.admonition-title {
  font-size: 1.25rem;
  font-weight: 600;
  white-space: nowrap;
}
.admonition-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
.admonition-icon svg {
  fill: currentColor;
  width: 24px;
  height: 24px;
}
.admonition-content {
  line-height: 1.6;
}

.admonition-note {
  background-color: #f3f4f6;
  border-left-color: #6b7280;
}
.admonition-note .admonition-heading {
  color: #4b5563;
}

.admonition-info {
  background-color: #e3f2fd;
  border-left-color: #1e88e5;
}
.admonition-info .admonition-heading {
  color: #1565c0;
}

.admonition-tip {
  background-color: #e8f5e9;
  border-left-color: #43a047;
}
.admonition-tip .admonition-heading {
  color: #2e7d32;
}

.admonition-warning {
  background-color: #fff3e0;
  border-left-color: #ff9800;
}
.admonition-warning .admonition-heading {
  color: #ef6c00;
}

.admonition-danger {
  background-color: #ffebee;
  border-left-color: #e53935;
}
.admonition-danger .admonition-heading {
  color: #c62828;
}

.dark .admonition-note {
  background-color: #404854;
  border-left-color: #b0b7c3;
}
.dark .admonition-note .admonition-heading {
  color: #c4cbd5;
}

.dark .admonition-info {
  background-color: #273c76;
  border-left-color: #76a9e0;
}
.dark .admonition-info .admonition-heading {
  color: #a0c1f7;
}

.dark .admonition-tip {
  background-color: #1d4736;
  border-left-color: #6bcf92;
}
.dark .admonition-tip .admonition-heading {
  color: #a2f0b7;
}

.dark .admonition-warning {
  background-color: #9b4825;
  border-left-color: #f7c68e;
}
.dark .admonition-warning .admonition-heading {
  color: #fed8a4;
}

.dark .admonition-danger {
  background-color: #9f2e2e;
  border-left-color: #f8a3a3;
}
.dark .admonition-danger .admonition-heading {
  color: #f7b3b3;
}
```

{{</expand>}}

新增 `layouts/shortcodes/hint.html` 並貼上

{{< expand hint.html >}}

```html
{{ $type := .Get 0 | default "tip" | lower }}
{{ $title := .Get 1 }}

{{ $admonitionTypes := dict
  "note"    (dict "defaultTitle" "Note"    "icon" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>` "class" "note")
  "tip"     (dict "defaultTitle" "Tip"     "icon" `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>` "class" "tip")
  "info"    (dict "defaultTitle" "Info"    "icon" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>` "class" "info")
  "warning" (dict "defaultTitle" "Warning" "icon" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>` "class" "warning")
  "danger"  (dict "defaultTitle" "Danger"  "icon" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>` "class" "danger")
}}

{{ $config := index $admonitionTypes $type | default (index $admonitionTypes "note") }}

{{ $finalTitle := $title | default $config.defaultTitle }}
{{ $finalIcon := $config.icon | safeHTML }}
{{ $finalClass := $config.class }}


<div class="admonition admonition-{{ $type }}">
  {{ if $finalTitle }}
    <div class="admonition-heading">
      <span class="admonition-icon">{{ $finalIcon }}</span>
      <span class="admonition-title">{{ $finalTitle }}</span>
    </div>
  {{ end }}
  <div class="admonition-content">
    {{ .Inner | markdownify }}
  </div>
</div>
```

{{< /expand >}}

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
