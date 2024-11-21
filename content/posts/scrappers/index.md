---
title: 選擇適合的爬蟲技術
date: 2024-11-21T08:51:43+08:00
draft: false
summary: 
showSummary: false
tags: [程式語言, 爬蟲, Python]
categories: [程式語言, Python]
series: []
series_order: 
progress_bar: true
---

# 選擇適合的爬蟲技術

搜尋爬蟲時大家的學習歷程大概都是從 requests 搭配 BeautifulSoup，再來會出現 AJAX，然後會看到 selenium/puppteer/playwright，但我從沒看過整合文章，都只會簡介兩句就開始程式碼，所以本文又是一個小整理，主要說明有哪幾種頁面以及應該如何選擇爬蟲工具。

筆者爬蟲菜鳥，僅確保九成正確但是不保證100%正確。

# 常見爬蟲類型

1. 靜態網頁爬蟲  
最基本的爬蟲形式。發送 HTTP 請求獲取 HTML 資料後，使用如 BeautifulSoup 的工具進行解析。適用內容完全嵌入 HTML 的網頁。

2. AJAX 技術  
向伺服器發送請求並獲取資料的非同步技術，本質是主動的、由 JavaScript 發起資料要求，目的是提高使用體驗，讓網頁動態更新不需刷新整頁。爬取 AJAX 頁面的核心在於模擬該主動請求，找到資料傳遞的接口並抓取其回應。

3. 懶加載（Lazy Loading）  
懶加載是針對效能優化的設計模式，資源載入的行為是被動的，僅在用戶操作（如滾動）或資源進入可視範圍時觸發。它的本質是延遲載入，並非直接發起請求。爬取時，需重現觸發條件（如模擬滾動）或直接解析網頁的資源載入邏輯。

4. 網頁自動化爬蟲   
使用 selenium、puppeteer 或 playwright 等工具進行的爬蟲，適合處理含大量 JavaScript 的網站，例如懶加載網站或受 Cloudflare 防護的頁面。不管用哪種語言撰寫，只要是同一種工具都是調用相同底層，網路文章討論語言的又在亂講。

5. Cloudflare 保護的網站   
爬取啟用 Cloudflare 防護的網站。如果防護靈敏度足夠嚴格通常就「只能」用自動化工具爬蟲[^cf]。

[^cf]: 問 GPT 會告訴你用 undetected-chromedriver 或是 cloudscraper，在 2024/11 這些都沒更新了，開源軟體要打贏 big tech 還是很困難。這兩個套件還是有提交新的 commit 但內容都是語法而不是架構更新，相對的 Cloudflare 天天在進化所以這些工具大家可以直接跳過不用浪費時間了。比如我用 cloudscrapper 前兩次正常運行回傳還很開心，結果才發第三次請求就被鎖了，而且是直接 ban IP 到現在都還沒解鎖，我還是用自家 IP + 正常的 header 發送請求不是用奇怪的代理欸。

6. API 爬蟲   
用網站自訂的 API 介面爬蟲，例如 [twitter API](https://developer.x.com/en/docs/x-api) 或是 GraphQL 等等，網站會自定好哪些資料可存取，透過這個 API 和他互動。

7. 進階逆向工程   
網站沒有提供 API 且限制嚴格，需要進階的逆向技術。例如透過分析 URL 結構或網路請求規律找到可用的數據介面。困難，例如[這篇文章](https://blog.huli.tw/2019/07/12/medium-crawler/)說明有人使用 `@${username}?format=json`，需要更進階的逆向知識才知道怎麼找到這方法。


# 應該如何選擇爬蟲工具
常見的工具從 requests+bs4 / selenium / scrappy 等等令人有點眼花撩亂，選擇前要先搞清楚自己是被哪種方式擋下，再根據上面選符合自己的。其實只分兩種：會不會遇到 JS 封鎖問題還有該網站有沒有用 API。

- 基本靜態網頁 → requests
- 網站使用 API → requests + API  
- 網站需要 JS 互動 → requests + 自動化工具
- 需要爬取大量網站 → scrappy
- 需要爬取大量網站 + 網站需要 JS 互動 → scrappy + 自動化工具

# 實例
## Cloudflare 封鎖
以筆者親身經歷為例，我想爬蟲的網站由 Cloudflare 保護，既然我是爬蟲新手那當然先去 Github 找，試過了無數方法，從幾個月前更新到前一週才發布更新的方法，來源從一個 Gist 到 Issue 底下的討論到一整個專門處理 Cloudflare 的 repo 都試過全部失敗[^2]，要跟 Cloudflare 鬥我勸大家別想了，在同一種工具下很困難。Cloudflare 專營 CDN，這些工具的指紋早就被他們摸的一清二楚，換一種工具發送請求最快，然而這代表程式碼要全部重寫而且還要祈禱 Cloudflare 不要發現這個工具。

附帶一提，是使用 requests + 自動化工具完成。

[^2]: 使用一個只有 turnstile 其餘什麼都沒有的網站降低一切變數進行測試，試過的所有方法連這種 demo 網站都繞不過，只剩下 pyautogui 還沒認真試過。嘗試的時候有看到一句話說他用 Cloudflare 防護就是要求你別爬了，當時看到覺得這什麼鴕鳥心態，嘗試了一輪以後還覺得真的是這樣。

## 懶加載
和前述相同的目標網站，這個網站的懶加載用於圖片等待捲動才真正載入，所以不會新增元素。他的懶加載只是很簡單的把\<img\>標籤中 data-src 的值，在懶加載完成後直接複製到 src，所以一開始我們就看得到目標網址了，和一般瀑布流載入的懶加載不太一樣。

神奇的問題來了：不等到懶加載完成直接請求該網址就會被 Cloudflare 封鎖，等到加載完成後不管是發送請求，或是瀏覽器開新視窗新分頁直接前往該網址都不會被封鎖，不知道是什麼原理。

原本以為我要爬的網站沒有瀑布流載入只是簡單網頁可以輕鬆搞定，沒想到最後還是需要肥大的網頁自動化工具才能解決。

## 感想
筆者第一次寫爬蟲就遇到 WAF + lazy loading + turnstile，直接給我封鎖全餐是不是在搞= =

有找到一個部落格提供很多[爬蟲實例](https://blog.jiatool.com/series/python%E7%B6%B2%E8%B7%AF%E7%88%AC%E8%9F%B2%E5%AF%A6%E4%BE%8B/)，對新手來說應該滿有用的，但是筆者看完只覺得要我一直做這個我可沒興趣，尤其是每個爬蟲都使用差不多的技術的情況下。

使用更前沿的技術才會讓我感興趣，不然就是架構設計要足夠厲害，例如 [yt-dlp](https://github.com/yt-dlp/yt-dlp)/[gallery-dl](https://github.com/mikf/gallery-dl) 這種只使用基本套件 (requests/urllib3/websockets) 卻可以達到數十數百網站的爬蟲實作，或是 [MediaCrawler](https://github.com/NanmiCoder/MediaCrawler) 使用 playwright 但是可以支援各大網站，不然這樣寫爬蟲對我來說也只是重複的同樣的事情，而且當要維護十個網站的爬蟲時，豈不是要維護十份完全不同的程式。簡單來說，要馬有新技術，要馬架構設計夠厲害，不然我學完之後感覺滿無聊的，當然這是個人感想。

至於大家最害怕的 turnstile/recaptcha/WAF 在用量小於一個月十萬請求的情況下全都是[免費](/posts/cloudflare-tunnel-ddns-guide/#3-額外的選項)的，我主觀認為未來自寫爬蟲的機會會越來越少。

附帶一提，码农高天曾經幫 MediaCrawler 作過 [code review](https://www.youtube.com/watch?v=er9MKp7foEQ)，有興趣的人可以看看。

# End
到底為何整理文章這麼少，每個任務都有多種工具選擇，大部分文章都只會介紹工具不介紹如何選擇，最後就是造成要撞牆後才知道錯了，於是寫了一篇工具選擇的文章。


---


# 附錄：相關套件

## Scrapy
封裝了很多功能的爬蟲工具，但是他本身[不處理 JavaScript](https://medium.com/@amit25173/scrapy-vs-playwright-112e896f7679)，需要和別的工具搭配例如 [scrapy-splash](https://github.com/scrapy-plugins/scrapy-splash/commits/master/) ，然而此工具也停更了。


## HTTP 客戶端套件選擇
教學都用 requests，我偏要特立獨行，這邊放上選項和基本介紹。

- urllib 是內建的低階套件，基本上不會有人用。
- requests 高階的老套件，不支援非同步和 HTTP/2。
- httpx 新套件，兩個都支援，除此之外基本相同，效能比 requests 稍好。
- aiohttp 不支援 HTTP/2，但是效能比 httpx 更好，要會寫非同步語法。
- grequests 基於 Requests 的非同步實現，不如直接用 aiohttp。
- pycurl 基於 C 的 libcurl，要手動處理和本機的 libcurl 路徑解析才能正常安裝，在檔案下載這種 HTTP 請求數量少數據吞吐量大的情況下特別高效。
- Twisted 窩不知道，問了 GPT 才第一次看到。

[參考資料](https://medium.com/@jkishan421/requests-vs-aiohttp-vs-httpx-choosing-the-right-python-http-libraries-8a06373e9744)

## HTML 解析套件選擇
最常用的兩個選手 BeautifulSoup 和 lxml 比較如下 by ChatGPT：

在 HTML 和 XML 文件解析方面，**BeautifulSoup** 和 **lxml** 是 Python 中常用的兩個工具，各有優勢和適用場景。

- **BeautifulSoup**
    1. **特點**：
        - 支援多種解析器（如 `html.parser`、`lxml` 和 `html5lib`），預設選擇最適合的解析器。
        - 使用簡單直觀，特別適合初學者和小型項目。
        - 提供許多方便的方法，如 `find()`、`find_all()` 和 CSS 選擇器來搜索和提取數據。

    2. **優勢**：
        - 對 HTML 格式錯誤的容錯性較高。
        - API 簡單，適合快速上手和處理中小型網頁抓取。

    3. **劣勢**：
        - 相對較慢，特別是在處理大規模數據時。

- **lxml**
    1. **特點**：
        - 基於 C 語言的 `libxml2` 和 `libxslt`，性能優秀。
        - 提供強大的 XPath 和 XSLT 支援，適合複雜數據查詢與轉換。
        - 更適合大規模文件和對性能要求較高的場景。

    2. **優勢**：
        - 速度快，內存效率高。
        - 支援增量解析，適用於處理大型文件。

    3. **劣勢**：
        - 相較之下學習曲線較高。
        - 安裝可能需要額外配置（如 C 編譯器）。

**選擇建議**
- **優先考量性能**：選擇 lxml，特別是當需要處理大規模數據或使用 XPath。
- **易用性與快速開發**：選擇 BeautifulSoup，更適合快速開發和解析小型 HTML 文件。

基本上說的沒錯，除了 lxml 應該改成「用 Python 寫的然後底層調用 C library」這個需要講清楚一點。

接下來是候補選手，問 GPT 的，扣掉前兩項以外都沒用過，我只能確保前兩項的正確性

- 通用解析：BeautifulSoup
- 高性能：lxml
- [更高性能](https://medium.com/@yahyamrafe202/in-depth-comparison-of-web-scraping-parsers-lxml-beautifulsoup-and-selectolax-4f268ddea8df)：[Selectolax](https://github.com/rushter/selectolax)
- [超高性能](https://www.rickyspears.com/scraper/python-html-parsers/)：[html5-parser](https://github.com/kovidgoyal/html5-parser)
- 簡單 XML：xmltodict
- 新聞文章：newspaper3k
- 不規範的複雜 HTML：html5lib
- jQuery 風格：PyQuery

想要有顯著提升並且不會用得很痛苦的話 lxml + httpx 就已經足夠好，語法和常見的美味湯 + requests 基本上沒差太多。再來要更快就要用 aiohttp，已經進入邊際效應不是非常必要，除非本身就很熟非同步語法那寫 aiohttp 當然是更好選擇，最後 Selectolax 和 html5-parser 基本沒人用，搜尋限制繁體中文文章數=0。
