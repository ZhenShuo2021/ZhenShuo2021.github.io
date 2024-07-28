---
title: "Hugo Blowfish 的問題修復"
date: 2024-07-01T12:09:01+08:00
lastmod: 2024-07-22
draft: false
summary: 修復 blowfish 相關的功能問題。
description: "本篇文章針對 Hugo Blowfish 主題常見問題提供詳細的修復步驟，幫助你解決頁面目次、對比度和網站標籤名稱等問題，提升網站使用體驗。"
tags: ["Hugo", "筆記"]
categories: ["Hugo"]
series: ["自架 NAS 紀錄"]
series_order: 5
---

此客製化基於 hugo blowfish theme 完成。  
大部分的程式都由 GPT 完成，偉哉 GPT。  

# 1. 標籤與分類分別顯示

這超麻煩不過改完後很滿意。我應該是唯一一個修好他的人。  

1. 把 `partials/badge.html` 改成
```html
<span class="badge badge-tag
border border-primary-600 text-xs font-normal text-primary-700 dark:border-primary-600 dark:text-primary-400">
  {{ . }}
</span>
```

2. 在 `partials/article-meta/basic.html` 中找到 `{{/* Output taxonomies */}}`，整段改成
```html
<div style="height: .25rem;"></div>
{{/* Output taxonomies */}}
{{ if .Params.showTaxonomies | default (.Site.Params.article.showTaxonomies | default false) }}
<div class="basicHtml-div">
  {{/* Output taxonomies */}}
  {{ if .Params.showTaxonomies | default (.Site.Params.article.showTaxonomies | default false) }}
  <div class="basicHtml-div">
    {{ with .Params.categories }}
    <div class="flex flex-wrap items-center mr-4 mb-2">
      <span class="" style="font-size: 1.1rem; position: relative; top: -0.15em; left: -0.0em; margin-right: .5rem;">
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
      <span class="" style="font-size: 1.1rem; position: relative; top: -0.15em; left: -0.0em; margin-right: .5rem;">
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
  {{ end }}
</div>
{{ end }}
```

3. 修改 article-link  
這太多要改直接放[連結](https://github.com/ZhenShuo2021/ZhenShuo2021.github.io/tree/main/layouts/partials/article-link)，其實就是把整個都能按改成只有圖片跟標題能按。

4. `custom.css` 加入
```css
.badge {
  display: inline-block;
  padding: 0.3em .45em;
  color: text-color-neutral;
  background-color: transparent;
  border-radius: 0.725rem;
  margin-right: 0.05rem;
  margin-bottom: 0.05rem;
}

.badge:hover {
  background-color: rgb(var(--color-primary-100));
}

.dark .badge:hover {
  background-color: rgb(var(--color-primary-700));
}

.basicHtml-div {
    margin-bottom: -.6em; /* 調整底部間距 */
    padding: 0;
}
```


# 2. 文章封面

發現 Blowfish 預設無法單獨設定文章縮圖，於是把 Cover 關鍵字拿來當文章縮圖。文章圖片的關鍵字有四個並分為兩種：  
- cover/thumbnail/featured: 縮圖+進入文章後的照片  
- background: 只有進入後的照片  

把 `layouts/partials/hero` 中所有的 `*cover*,` 刪掉即可。



# 3. 改善對比度

在 `assets/css/schemes/blowfish.css` 修改以下三項：
```css
--color-neutral-300: 216, 227, 240;  # 文字顏色 
--color-neutral-500: 88, 102, 122;   # 文章資訊顏色
--color-neutral-700: 25, 33, 43;     # 文字顏色 
--color-primary-800: 25, 33, 43;     # 忘了
```
數字可以自己調。

在 `/blog/themes/blowfish/assets/css/compiled/main.css` 的 `.prose {` 中，把下面第一行改成第二行，第二行的顏色去上面的 schemes css 中修改
```css
--tw-prose-hr:rgba(var(--color-neutral-200), 1);
--tw-prose-hr:rgba(var(--color-neutral-7), 1);
```

# 4. 網站 logo

favicons 應該直接放在 static 資料夾中就可以直接使用，但不知為何要把相同的程式碼再貼成 custom favicon 才可用。順便改放在 /static/image 資料夾中

在 `layouts/partials` 新增 favicons.html ，新增以下：
```html
<link rel="icon" type="image/png" sizes="192x192" href="{{ "android-chrome-192x192.png" | absURL }}">
<link rel="icon" type="image/png" sizes="512x512" href="{{ "android-chrome-512x512.png" | absURL }}">
<link rel="apple-touch-icon" sizes="180x180" href="{{ "apple-touch-icon.png" | absURL }}">
<link rel="icon" type="image/png" sizes="32x32" href="{{ "favicon-32x32.png" | absURL }}">
<link rel="icon" type="image/png" sizes="16x16" href="{{ "favicon-16x16.png" | absURL }}">
<link rel="shortcut icon" href="{{ "favicon.ico" | absURL }}">

<link rel="manifest" href="{{ "site.webmanifest" | absURL }}">
```

# 5. 網頁標籤名稱

把 blowfish 預設的 dot 改為 dash。

找到 `layouts/partials/head.html` 中以下片段：
```html
<title>{{ .Title | emojify }} &middot; {{ .Site.Title | emojify }}</title>
<meta name="title" content="{{ .Title | emojify }} &middot; {{ .Site.Title | emojify }}" />
```
把 `&middot` 改為 `-`。


# 6. 註腳（文章引用）

縮小 footnote 字體以及修改標籤樣式，讓他長得比較像論文格式。  

在 `assets/css/custom.css` 中，新增以下：

```css
/* 縮小 footnote 字體 */
.footnotes {
    font-size: 0.7em;
}

/* footnote 引用樣式 */
.footnote-ref::before {
    content: "[";
}

.footnote-ref::after {
    content: "]";
}

/* 調整 sup 標籤樣式 */
sup {
    font-size: xx-small;
    vertical-align: super;
}

/* 移除原本的編號樣式 */
.footnotes ol {
    list-style-type: none; /* 移除原本的編號 */
    padding-left: 0;
}

/* 修改 footnote 列表項的樣式 */
.footnotes ol li {
    counter-increment: footnote; /* 增加計數器 */
    position: relative;
    margin-left: 2em; /* 調整左邊距，使其與文章內容有適當間隔 */
    line-height: 1.8; /* 調整行高，使超連結可以正確顯示 */
    margin-bottom: -1.2em; /* 調整每個 footnote 間的距離 */
}

.footnotes ol li:before {
    content: "[" counter(footnote) "]"; /* 使用計數器顯示編號 */
    font-weight: normal;
    position: absolute;
    left: -1.5em; /* 將編號設置在列表項的左側 */
}

/* 將原始編號隱藏 */
.footnotes ol li a:first-child {
    display: inline-block; /* 保留超連結的顯示 */
}
```


# 7. 美化選集功能

1. 把選集功能後面的「- 本文屬於一個選集。」刪掉。
2. 修改選集樣式並把本文也加上超連結。

刪掉「- 本文屬於一個選集。」：找到 `layouts/partials/series/series_base.html` ，修改為
```html
{{ if .Params.series }}
    <summary
        class="py-1 text-lg font-semibold cursor-pointer bg-primary-200 text-neutral-800 ltr:-ml-5 ltr:pl-5 rtl:-mr-5 rtl:pr-5 dark:bg-primary-800 dark:text-neutral-100">
        {{ index .Params.series 0 }}
    </summary>
    {{ $seriesName := strings.ToLower (index .Params.series 0) }}
    {{ range $post := sort (index .Site.Taxonomies.series $seriesName) "Params.series_order" }}
    {{ if eq $post.Permalink $.Page.Permalink }}
    <div
        class="py-1 border-dotted border-neutral-300 ltr:-ml-5 ltr:border-l ltr:pl-5 rtl:-mr-5 rtl:border-r rtl:pr-5 dark:border-neutral-600">
        <a href="{{$post.Permalink}}">
            {{ i18n "article.part" }}{{ $post.Params.series_order }} {{ i18n "article.this_article" }} {{ $post.Params.title}} 
        </a>
    </div>
    {{ else }}
    <div
        class="py-1 border-dotted border-neutral-300 ltr:-ml-5 ltr:border-l ltr:pl-5 rtl:-mr-5 rtl:border-r rtl:pr-5 dark:border-neutral-600">
        <a href="{{$post.Permalink}}">
            {{ i18n "article.part" }}{{ $post.Params.series_order }} {{ $post.Params.title}}
        </a>
    </div>
    {{end}}
    {{end}}
{{end}}

```

`$post.Permalink` 裡面就是選集樣式。再去 i18n 中把修改自己語言的檔案，我的改成以下：
```toml
part: "#"
this_article: "[本文]"
```

# 8. 關閉相關文章簡介
主目錄想要有文章簡介，但是相關文章也出現簡介就太亂。

在 `layouts/partials/article-link/card-related.html` 註解掉

```html
{{ if .Params.showSummary | default (.Site.Params.list.showSummary | default false) }}
    <div class="py-1 prose dark:prose-invert">
        {{ .Summary }}
    </div>
{{ end }}
```


# 9. 文章資訊間隔符號

加上編輯時間就後就顯得凌亂，修改樣式。把 `layouts/partials/article-meta/basic.html` 中的
```html
{{ delimit . "<span class=\"px-2 text-primary-500\">&middot;</span>" | safeHTML }}
```

改為
```html
{{ delimit . "<span class=\"px-2 text-neutral-500\">&VerticalLine;</span>" | safeHTML }}
```

# 10. 模糊設定
去主題的 github 搜尋 `backdrop-blur path:*.html` 裡面有所有能調整的頁面，選你想要的調整，內建 .backdrop-blur (8px) .backdrop-blur-sm (4px) .backdrop-blur-2xl (40px)。

相同位置下的 `scroll / 300` 是漸層距離。

# 11. ~~頁面目次 ToC~~

此問題官方已於 blowfish v2.71.0 修正，不過ToC官方目前還沒有很完整。
{{<expand 原文>}}
ToC過長時增加滾輪。

把 `layouts/partials/toc.html` 中 `<details open class>` 整段換成以下：

```html
<details open class="toc-right mt-0 overflow-hidden rounded-lg ltr:-ml-5 ltr:pl-5 rtl:-mr-5 rtl:pr-5 hidden lg:block">
  <summary
    class="block py-1 text-lg font-semibold cursor-pointer bg-neutral-100 text-neutral-800 ltr:-ml-5 ltr:pl-5 rtl:-mr-5 rtl:pr-5 dark:bg-neutral-700 dark:text-neutral-100 lg:hidden">
    {{ i18n "article.table_of_contents" }}
  </summary>
  <div
    class="min-w-[220px] py-2 border-dotted border-neutral-300 ltr:-ml-5 ltr:border-l ltr:pl-5 rtl:-mr-5 rtl:border-r rtl:pr-5 dark:border-neutral-600"
    style="max-height: 450px; overflow-y: auto;">
    {{ .TableOfContents | emojify }}
  </div>
</details>
<details class="toc-inside mt-0 overflow-hidden rounded-lg ltr:-ml-5 ltr:pl-5 rtl:-mr-5 rtl:pr-5 lg:hidden">
  <summary
    class="py-1 text-lg font-semibold cursor-pointer bg-neutral-100 text-neutral-800 ltr:-ml-5 ltr:pl-5 rtl:-mr-5 rtl:pr-5 dark:bg-neutral-700 dark:text-neutral-100 lg:hidden">
    {{ i18n "article.table_of_contents" }}
  </summary>
  <div
    class="py-2 border-dotted border-neutral-300 ltr:-ml-5 ltr:border-l ltr:pl-5 rtl:-mr-5 rtl:border-r rtl:pr-5 dark:border-neutral-600"
    style="max-height: 450px; overflow-y: auto;">
    {{ .TableOfContents | emojify }}
  </div>
</details>
```
{{</expand>}}