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

# 前言

搜尋爬蟲時大家的學習歷程大概都是從 requests 搭配 BeautifulSoup，再來會出現 AJAX，然後會看到 selenium/puppteer/playwright，但我從沒看過整合文章，都只會簡介兩句就開始程式碼，所以本文又是一個小整理，主要說明有哪幾種頁面以及應該如何選擇爬蟲工具。

文章前半部分是介紹，後半部分是自己撰寫爬蟲程式的心得，附錄有整理好的爬蟲工具清單一定要看，可能都比文章本身有用，要換一個工具的痛跟重頭寫程式有的比，建議先選好再下手。

# 常見爬蟲類型

## A. 靜態內容
適用於網頁資料直接嵌入 HTML 無需執行 JavaScript，是最基本的爬蟲形式。  
- 靜態網頁爬取：直接解析 HTML 獲取資料
- Sitemap 爬取：透過網站提供的 XML Sitemap 獲取 URL

**特徵**：  
- 資料就在 HTML 文本中，並且網站不需要處理 JavaScript。  


## B. 結構化資料  
網站提供 API 介面提供資料存取方式

**特徵**：  
- 官方提供 API 接口回傳 JSON 或 XML 等。  
- 資料結構化，從 `F12 -> Network -> 放大鏡` 中搜尋自己要的資料是透過什麼方式要求的，嘗試模擬該要求取得資料。  


## C. 動態內容  
網頁需要 JavaScript 或進行特定操作後才能獲取資料。  
- 動態網頁爬取：使用瀏覽器自動化工具爬蟲，模擬瀏覽器執行 JavaScript 獲取資料

**特徵**：  
- 內容透過 JavaScript 動態生成後載入。  
- 需要模擬使用者行為或網頁操作。
- 例如懶加載網站或受 Cloudflare 防護的頁面  

## D. 大規模/高效  
大規模爬蟲時需要特別注重效率。
- 非同步：使用非同步套件爬蟲提高效率
- 分散式：多機器協作處理大規模爬蟲

## E. 進階逆向工程   
網站沒有提供 API 且限制嚴格，需要進階的逆向技術。例如透過分析 URL 結構或網路請求規律找到可用的數據介面。困難，例如[這篇文章](https://blog.huli.tw/2019/07/12/medium-crawler/)說明有人使用 `@${username}?format=json`，需要更進階的逆向知識才知道怎麼找到這方法。
 

# 怎麼知道網頁是哪種類型？

1. **靜態內容**：網頁打開就可以直接看到內容。  
2. **結構化資料**：網站提供 API 互動，例如需要發 POST 請求。  
3. **動態內容**：需要執行 JavaScript 或操作表單才能顯示完整內容。  
4. **大規模/高效**：抓取大量頁面。  
5. **逆向工程**：發現怎麼找都找不到資料來源時就要自己逆向。

為啥沒 AJAX，因為他在 API 或 JS 分類裡面，初學者其實只要知道網站有沒有用 JS 封鎖，例如使用 Cloudflare，有的話極高機率要使用自動化工具爬蟲[^cf]。結論是前兩種都使用 HTTP 客戶端就可以，例如 `requests` `httpx` `aiohttp` 等等，使用 JS 互動就需要使用自動化工具模擬瀏覽器行為，例如 `selenium` `playwright` `puppteer` 等等。


[^cf]: 問 GPT 會告訴你用 undetected-chromedriver 或是 cloudscraper，在 2024/11 這些都沒更新了，開源軟體要打贏 big tech 還是很困難。這兩個套件還是有提交新的 commit 但內容都是語法而不是架構更新，相對的 Cloudflare 天天在進化所以這些工具大家可以直接跳過不用浪費時間了。比如我用 cloudscrapper 前兩次正常運行回傳還很開心，結果才發第三次請求就被鎖 24 小時而且是直接 ban IP，我還是用自家 IP + 正常的 header 發送請求不是用奇怪的代理欸。

- 靜態網頁 → HTTP 客戶端發送 GET 請求
- 網站使用 API → HTTP 客戶端發送 POST 請求
- 網站需要 JS 互動 → HTTP 客戶端 + 自動化工具
- 需要爬取大量網站 → scrappy
- 需要爬取大量網站 + 網站需要 JS 互動 → scrappy + 自動化工具

# 實例
這個段落是筆者親身經歷，描述撰寫 [V2PH-Downloader](https://github.com/ZhenShuo2021/V2PH-Downloader) 這個爬蟲工具時遇到的問題。

## Cloudflare 封鎖
以 V2PH 為例，爬蟲第一關發送 requests 請求就失敗，才發現他被 Cloudflare 保護，所以應該要選擇網頁自動化工具。

選擇的部分結束了，但事情絕對沒這麼單純，Cloudflare 專營 CDN，這些瀏覽器自動化工具的指紋早就被他們摸的一清二楚，即使使用自動化工具還是被封鎖，想說既然我是爬蟲新手那當然先去 Github 找，試過了無數方法，從幾個月前更新到前一週才發布更新的方法，來源從一個 Gist 到 Issue 底下的討論到一整個專門處理 Cloudflare 的 repo 都試過全部失敗[^2]，要跟 Cloudflare 鬥我勸大家別想了，在同一種工具下很困難，建議**換一種工具發送請求最快**，例如 [camoufox](https://github.com/daijro/camoufox) 這種很少人知道的工具就是個好選擇，

然而這代表程式碼要全部重寫而且還要祈禱 Cloudflare 不要發現這個工具。

[^2]: 測試使用只有 turnstile 其餘什麼都沒有的頁面進行測試以降低變數，試過的全部方法連這種 demo 網站都繞不過，只剩下 pyautogui 還沒認真試過。找資料的時候有看到有人說網站用 Cloudflare 防護就是要求你別爬了，當時看到覺得這什麼鴕鳥心態，嘗試了一輪以後還覺得真的是這樣。

## 懶加載
懶加載是 JS 的一種方式，用於不馬上載入資源，等待頁面捲動到對應位置才載入以提高整體使用體驗。

V2PH 的圖片也使用懶加載，他的懶加載只是很簡單的把\<img\>標籤中 data-src 的值，在懶加載完成後直接複製到 src，所以一開始我們就看得到目標網址了，不會新增元素，和一般瀑布流載入的懶加載不太一樣。

神奇的問題來了：不等到懶加載完成直接請求該網址就會被 Cloudflare 封鎖，等到加載完成後不管是發送請求，或是瀏覽器開新視窗新分頁直接前往該網址都不會被封鎖，不知道是什麼原理，而且這個封鎖的等級是 WAF 封鎖，連 JavaScript 挑戰(也就是 captcha/turnstile 等等）都不會回傳，直接 403。

## 解決方式
最後解決方式是使用少人用的自動化工具避免 Cloudflare 檢測，網站只有在幾個入口處的檢測設定特別嚴格，在 CDN 圖片的限制只有上面講的懶加載，所以使用自動化工具捲動完成後進行下載就完成任務。

原本以為我要爬的網站沒有瀑布流載入只是簡單網頁可以輕鬆搞定，沒想到最後還是需要肥大的網頁自動化工具才能解決。

## 感想
筆者第一次寫爬蟲就遇到 WAF + lazy loading + turnstile，直接給我封鎖全餐是不是在搞= =

有找到一個部落格提供很多[爬蟲實例](https://blog.jiatool.com/series/python%E7%B6%B2%E8%B7%AF%E7%88%AC%E8%9F%B2%E5%AF%A6%E4%BE%8B/)，對新手來說應該滿有用的，但是筆者看完只覺得要我一直做這個我可沒興趣，尤其是每個爬蟲都使用差不多的技術的情況下。

使用更前沿的技術才會讓我感興趣，不然就是架構設計要足夠厲害，例如 [yt-dlp](https://github.com/yt-dlp/yt-dlp)/[gallery-dl](https://github.com/mikf/gallery-dl) 這種只使用基本套件 (requests/urllib3/websockets) 卻可以達到數十數百網站的爬蟲實作，或是 [MediaCrawler](https://github.com/NanmiCoder/MediaCrawler) 使用 playwright 但是可以支援各大網站，不然這樣寫爬蟲對我來說也只是重複的同樣的事情，而且當要維護十個網站的爬蟲時，豈不是要維護十份完全不同的程式。簡單來說，要馬有新技術，要馬架構設計夠厲害，不然我學完之後感覺滿無聊的，當然這是個人感想。

至於大家最害怕的 turnstile/recaptcha/WAF 在用量小於一個月十萬請求的情況下全都是[免費](/posts/cloudflare-tunnel-ddns-guide/#3-額外的選項)的，這真的是一個貓抓老鼠的遊戲，Cloudflare 是整個專門團隊並且使用自己的超大資料庫抓爬蟲，而我們免費仔用的開源爬蟲工具他們也都可以直接看到原始碼，而且本文只說了爬蟲工具，還沒說網站可以怎樣反爬蟲，除了最簡單的 IP 封鎖、速率限制和各種 captcha 人機檢查以外，光是使用指紋檢查就可以打死一大票爬蟲工具，指紋檢查誇張到連使用的字體、網頁用的擴充功能都可以列入指紋計算之中，除此之外還有 honeypot/Referer/GeoIP/加密混淆數據/CSRF 保護/使用 WebSocket/深度學習檢查，這些單獨解決都還好，難在搭配使用時就很難突破，我主觀認為未來自寫爬蟲的機會會越來越少。

# End
到底為何整理文章這麼少，每個任務都有多種工具選擇，大部分文章都只會介紹工具不介紹如何選擇，最後就是造成要撞牆後才知道錯了，於是寫了一篇工具選擇的文章。


---


# 附錄：相關套件

## Scrapy
封裝了很多功能的爬蟲工具，但是他本身[不處理 JavaScript](https://medium.com/@amit25173/scrapy-vs-playwright-112e896f7679)，需要和別的工具搭配例如 [scrapy-splash](https://github.com/scrapy-plugins/scrapy-splash/commits/master/) ，然而此工具也停更了。


## HTTP 客戶端套件
教學都用 requests，我偏要特立獨行，這邊放上選項和基本介紹。

- urllib 是內建的低階套件，基本上不會有人用。
- requests 高階的老套件，不支援非同步和 HTTP/2。
- httpx 新套件，兩個都支援，除此之外基本相同，效能比 requests 稍好。
- aiohttp 不支援 HTTP/2，但是效能比 httpx 更好，要會寫非同步語法。
- grequests 基於 Requests 的非同步實現，不如直接用 aiohttp。
- pycurl 基於 C 的 libcurl，要手動處理和本機的 libcurl 路徑解析才能正常安裝，在檔案下載這種 HTTP 請求數量少數據吞吐量大的情況下特別高效。
- curl_cffi 是使用 cffi 綁定的 curl-impersonate 實踐，可以模擬瀏覽器和 ja3 指紋。
- [primp](https://github.com/deedy5/primp) 使用 rust 寫的客戶端，還很早期，一樣可以模擬瀏覽器和指紋。  
- Twisted 窩不知道，問了 GPT 才第一次看到。

## 瀏覽器自動化工具
- selenium 老牌工具語法繁瑣，但還是能用，有隱身插件可以用
- playwright 微軟開發的，很肥大，而且一用就被 Cloudflare 封鎖，有隱身插件可以用
- puppteer 沒用過，因為 Python 版本的官網已經不更新並且推薦改用 playwright
- drissionpage 中國人開發的，目前使用一切安好，可突破 Cloudflare 但是星星數量太多了有點危險，說是使用自研核心不知道是什麼
- [camoufox](https://github.com/daijro/camoufox) 使用火狐的隱身瀏覽器，需要搭配 playwright 使用

並且附上下面這些問 GPT 的，全部沒聽過，請自行驗證是否可用

1. Appium：主要用於自動化移動瀏覽器，但也支持桌面瀏覽器。  
2. Cypress：支援現代瀏覽器的端對端自動化測試，內建瀏覽器控制。  
3. WebDriverIO：基於 WebDriver 協議的強大工具，支持多種瀏覽器和無頭模式。  
4. TestCafe：現代無插件的自動化測試工具，直接操控瀏覽器。  
5. PhantomJS（儘管不再維護，但依然可用）：一種無頭瀏覽器，適合模擬和抓取。  
6. Splash：專為抓取和模擬瀏覽器渲染而設計，支持 JavaScript 渲染。  
7. Headless Browsers（如 Puppeteer、Playwright 提供的內建 headless 模式）。  
8. Nightwatch.js：基於 Node.js，支援多瀏覽器和多種測試類型（例如單元測試和整合測試），可與 Selenium 或獨立使用。
9. Testim：利用 AI 輔助進行測試，自動維護測試腳本，適合需要高度擴展性的大型專案。
10. Keploy：專注於 API 測試的開源工具，可自動將用戶流量轉換為測試案例，對自動化腳本的依賴較低。

## HTML 解析套件
最常用的兩個選手 BeautifulSoup 和 lxml，兩者差異是 BeautifulSoup 比較寬容，但是在我實際使用 BeautifulSoup 則是帶給我很大的災難。首先我是搭配[靜態檢查工具](https://docs.zsl0621.cc/memo/python/first-attempt-python-workflow-automation)進行開發，BeautifulSoup 每次輸出都有可能是多種型別，使用檢查工具的結果就是**只要有用到 BeautifulSoup 的地方就會滿江紅根本解決不完**，所以最後還是改用 lxml 了，而且我比較欣賞 lxml 這種簡單的工具，看起來沒幾項功能，但是全都遵循既有 xml 解析語法，可以專注在寫程式而不是浪費時間學語法，BeautifulSoup 每遇到一種新問題就要翻文檔找用法，然後又要處理型別問題，很麻煩。

除此之外，lxml 是用 Python 寫的然後底層調用 C library，所以速度還更快。

接下來是候補選手，問 GPT 的，扣掉前兩項以外都沒用過，我只能確保前兩項的正確性

- 通用解析：BeautifulSoup
- 高性能：lxml
- [更高性能](https://medium.com/@yahyamrafe202/in-depth-comparison-of-web-scraping-parsers-lxml-beautifulsoup-and-selectolax-4f268ddea8df)：[Selectolax](https://github.com/rushter/selectolax)
- [超高性能](https://www.rickyspears.com/scraper/python-html-parsers/)：[html5-parser](https://github.com/kovidgoyal/html5-parser)
- 簡單 XML：xmltodict
- 新聞文章：newspaper3k
- 不規範的複雜 HTML：html5lib
- jQuery 風格：PyQuery

想要有顯著提升並且不會用得很痛苦的話 lxml + httpx 就已經足夠好，語法和常見的美味湯 + requests 基本上沒差太多。再來要更快建議直接跳過 aiohttp 直接使用 curl_cffi，Selectolax 和 html5-parser 基本沒人用，Google 搜尋限制繁體中文文章數=0。
