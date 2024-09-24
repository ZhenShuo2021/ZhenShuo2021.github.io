---
title: {{ replace .File.ContentBaseName "-" " " | title }}
date: {{ .Date }}
draft: true
summary: 
showSummary: false
tags: []
categories: []
series: []
series_order: 
progress_bar: true
---
# slug: '{{ .File.ContentBaseName }}'