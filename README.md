# 簡介

使用 Hugo Blowfish 主題打造的部落格並且加上一些改進和個人化。

## 特色

- PageSpeed Insights 四項滿分
- 使用 shiki 完成正確且快速的 Syntax Highlighting
- 標籤和分類使用標籤雲
- Full responsive 的文章列表
- 不使用 submodule 安裝主題，更輕量快速
- 整合和優化多項外觀和功能，例如增加 shortcode hint, expand，閱讀進度條、優化標籤和分類外觀等等...

![PageSpeed](assets/PageSpeed.jpg)

## 使用

初次使用

```sh
git clone -q --depth=1 https://github.com/ZhenShuo2021/ZhenShuo2021.github.io blog
cd blog
hugo server
```

由於語法上色採用 [shiki](https://github.com/shikijs/shiki) 而不是內建的 Chroma，所以在 hugo server 時是沒有顏色的。如果想要在編輯時確認顏色，請開啟另一個終端執行

```sh
npx rehype-cli public -o
```

使用 shiki 的好處是快速且正確。Chroma 錯誤百出，highlightjs 和 prismjs 太慢。

使用此腳本可以更新 blowfish 主題，Blowfish 大小高達 0.6GB 用 submodule 你會懷疑人生，用我的腳本安裝只有不到 10MB

```sh
chmod +x ./update-blowfish.sh
./update-blowfish.sh
```
