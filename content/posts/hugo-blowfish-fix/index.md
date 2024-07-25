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
series_order: 3
---

此客製化基於 hugo blowfish theme 完成。  
大部分的程式都由 GPT 完成，偉哉 GPT。  

# 1. 標籤與分類分別顯示

這超麻煩不過改完後很滿意。我應該是唯一一個修好他的人。  
`card.html` 因為沒用到所以暫時沒改，如果要修正請照著邏輯：「不要整塊都是連結，只有圖片跟 title 是連結。」

{{< expand "實在是太長了，放在摺疊欄位裡" >}}
1. 把 `partials/badge.html` 改成
```html
<span class="badge badge-tag
border border-primary-600 text-xs font-normal text-primary-700 dark:border-primary-600 dark:text-primary-400">
  {{ .name }}
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
            {{ partial "badge.html" (dict "name" . "taxonomy" "categories") }}
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
            {{ partial "badge.html" (dict "name" . "taxonomy" "tags") }}
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

3. **整個** `article-link/card-related.html` 改成
```html
{{ $disableImageOptimization := .Page.Site.Params.disableImageOptimization | default false }}
<!-- {{ with .Params.externalUrl }}
<a href="{{ . }}" target="_blank" rel="external" class="min-w-full">
  {{ else }}
  <a href="{{ .RelPermalink }}" class="min-w-full">
    {{ end }} -->
    <div
      class="min-h-full border border-neutral-200 dark:border-neutral-700 border-2 rounded overflow-hidden shadow-2xl relative">

      {{ $link := .RelPermalink }}
      {{ if .Params.externalUrl }}
        {{ $link = .Params.externalUrl }}
      {{ end }}




      {{- with $.Params.images -}}
      {{- range first 6 . }}
      <meta property="og:image" content="{{ . | absURL }}" />{{ end -}}
      {{- else -}}
      {{- $images := $.Resources.ByType "image" -}}
      {{- $featured := $images.GetMatch "*feature*" -}}
      {{- if not $featured }}{{ $featured = $images.GetMatch "{*cover*,*thumbnail*}" }}{{ end -}}
      {{ if and .Params.featureimage (not $featured) }}
      {{- $url:= .Params.featureimage -}}
      {{ $featured = resources.GetRemote $url }}
      {{ end }}
      {{- if not $featured }}{{ with .Site.Params.defaultFeaturedImage }}{{ $featured = resources.Get . }}{{ end }}{{
      end -}}
      {{- with $featured -}}
      {{ if or $disableImageOptimization (strings.HasSuffix $featured ".svg")}}
      {{ with . }}
      <a href="{{ $link }}" class="block">
      <div class="w-full thumbnail_card_related nozoom" style="background-image:url({{ .RelPermalink }});"></div>
      </a>
      {{ end }}
      {{ else }}
      {{ with .Resize "600x" }}
      <a href="{{ $link }}" class="block">
      <div class="w-full thumbnail_card_related nozoom" style="background-image:url({{ .RelPermalink }});"></div>
      </a>
      {{ end }}
      {{ end }}
      {{- else -}}
      {{- with $.Site.Params.images }}
      <meta property="og:image" content="{{ index . 0 | absURL }}" />{{ end -}}
      {{- end -}}
      {{- end -}}


      {{ if and .Draft .Site.Params.article.showDraftLabel }}
      <span class="absolute top-0 right-0 m-2">
        {{ partial "badge.html" (i18n "article.draft" | emojify) }}
      </span>
      {{ end }}

      <div class="px-6 py-4">

        {{ with .Params.externalUrl }}
        <div>
          <div
            class="font-bold text-xl text-neutral-800 decoration-primary-500 hover:underline hover:underline-offset-2 dark:text-neutral">
            {{ $.Title | emojify }}
            <span class="text-xs align-top cursor-default text-neutral-400 dark:text-neutral-500">
              <span class="rtl:hidden">&#8599;</span>
              <span class="ltr:hidden">&#8598;</span>
            </span>
          </div>
        </div>
        {{ else }}
        <a href="{{ $link }}" class="block">
        <div
          class="font-bold text-xl text-neutral-800 decoration-primary-500 hover:underline hover:underline-offset-2 dark:text-neutral"
          href="{{ .RelPermalink }}">{{ .Title | emojify }}</div>
        </a>
        {{ end }}

        <div class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ partial "article-meta/basic.html" . }}
        </div>

      </div>
      <div class="px-6 pt-4 pb-2">

      </div>
    </div>
```

4. `article-link/simple.html` 找到 `{{ with .Params.externalUrl }}`，整段改成
```html

{{ $link := .RelPermalink }}
{{ if .Params.externalUrl }}
  {{ $link = .Params.externalUrl }}
{{ end }} 
{{ with .Params.externalUrl }}
  <div class="{{ $articleClasses }}" data-href="{{ . }}" data-target="_blank" data-rel="external">
{{ else }}
  <div class="{{ $articleClasses }}" data-href="{{ .RelPermalink }}">
{{ end }}
    {{- with $.Params.images -}}
    {{- range first 6 . }}
    <meta property="og:image" content="{{ . | absURL }}" />{{ end -}}
    {{- else -}}
    {{- $images := $.Resources.ByType "image" -}}
    {{- $featured := $images.GetMatch "feature" -}}
    {{- if not $featured }}{{ $featured = $images.GetMatch "{cover,thumbnail}" }}{{ end -}}
    {{ if and .Params.featureimage (not $featured) }}
    {{- $url:= .Params.featureimage -}}
    {{ $featured = resources.GetRemote $url }}
    {{ end }}
    <a href="{{ $link }}" class="block w-full md:w-auto">
    {{- if not $featured }}{{ with .Site.Params.defaultFeaturedImage }}{{ $featured = resources.Get . }}{{ end }}{{ end -}}
    {{ if .Params.hideFeatureImage }}{{ $featured = false }}{{ end }}
    {{- with $featured -}}
    {{ if or $disableImageOptimization (strings.HasSuffix $featured ".svg")}}
        {{ with . }}
        <div class="{{ $articleImageClasses }}" style="background-image:url({{ .RelPermalink }});"></div>
        {{ end }}
      {{ else }}
        {{ with .Resize "600x"  }}
        <div class="{{ $articleImageClasses }}" style="background-image:url({{ .RelPermalink }});"></div>
        {{ end }}
      {{ end }}
    {{- else -}}
    {{- with $.Site.Params.images }}
    <meta property="og:image" content="{{ index . 0 | absURL }}" />{{ end -}}
    {{- end -}}
    {{- end -}}
  </a>

    <div class="{{ $articleInnerClasses }}">
    <a href="{{ $link }}" class="block w-full md:w-auto">
      <div class="items-center text-left text-xl font-semibold">
        {{ with .Params.externalUrl }}
        <div>
          <div
            class="font-bold text-xl text-neutral-800 decoration-primary-500 hover:underline hover:underline-offset-2 dark:text-neutral">
            {{ $.Title | emojify }}
            <span class="text-xs align-top cursor-default text-neutral-400 dark:text-neutral-500">
              <span class="rtl:hidden">&#8599;</span>
              <span class="ltr:hidden">&#8598;</span>
            </span>
          </div>
        </div>
        {{ else }}
        <div class="font-bold text-xl text-neutral-800 decoration-primary-500 hover:underline hover:underline-offset-2 dark:text-neutral"
          href="{{ .RelPermalink }}">{{ .Title | emojify }}</div>
        {{ end }}
        {{ if and .Draft .Site.Params.article.showDraftLabel }}
        <div class=" ltr:ml-2 rtl:mr-2">
          {{ partial "badge.html" (i18n "article.draft" | emojify) }}
        </div>
        {{ end }}
        {{ if templates.Exists "partials/extend-article-link.html" }}
        {{ partial "extend-article-link.html" . }}
        {{ end }}
      </div>
    </a>
      <div class="text-sm text-neutral-500 dark:text-neutral-400">
        {{ partial "article-meta/basic.html" . }}
      </div>
      {{ if .Params.showSummary | default (.Site.Params.list.showSummary | default false) }}
      <div class="py-1 max-w-fit prose dark:prose-invert">
        {{ .Params.summary | .RenderString }}
      </div>
      {{ end }}
    </div>
  </div>
```

5. `custom.css` 加入
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
{{< /expand >}}




# 2. 改善對比度

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

# 3. 網站 logo

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

# 4. 網頁標籤名稱

把 blowfish 預設的 dot 改為 dash。

找到 `layouts/partials/head.html` 中以下片段：
```html
<title>{{ .Title | emojify }} &middot; {{ .Site.Title | emojify }}</title>
<meta name="title" content="{{ .Title | emojify }} &middot; {{ .Site.Title | emojify }}" />
```
把 `&middot` 改為 `-`。


# 5. 註腳（文章引用）

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


# 6. 美化選集功能

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

# 7. 關閉相關文章簡介
主目錄想要有文章簡介，但是相關文章也出現簡介就太亂。

在 `layouts/partials/article-link/card-related.html` 註解掉

```html
{{ if .Params.showSummary | default (.Site.Params.list.showSummary | default false) }}
    <div class="py-1 prose dark:prose-invert">
        {{ .Summary }}
    </div>
{{ end }}
```



# 8. 文章資訊間隔符號

加上編輯時間就後就顯得凌亂，修改樣式。把 `layouts/partials/article-meta/basic.html` 中的
```html
{{ delimit . "<span class=\"px-2 text-primary-500\">&middot;</span>" | safeHTML }}
```

改為
```html
{{ delimit . "<span class=\"px-2 text-neutral-500\">&VerticalLine;</span>" | safeHTML }}
```

# 9. ~~頁面目次 ToC~~

此問題官方已於 blowfish v2.71.0 修正，不過ToC官方目前還沒有很完整。
{{<expand 原文>}}
ToC過長時增加滾輪。

把 `layouts/partials/toc.html` 中 `\<details open class\>` 整段換成以下：

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