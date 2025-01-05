---
title: 菜鳥重構紀錄和閱讀心得
date: 2025-01-06T05:10:10+08:00
draft: false
summary: 
showSummary: false
tags: [程式語言, 閱讀心得]
categories: [程式語言, 閱讀心得]
series: []
series_order: 
progress_bar: true
---

{{< katex >}}

退伍後完成了三個 Python 小專案，從能動就好進化到掌握各個程式碼品質工具已經進步很多，最近看到[黑暗執行緒](https://blog.darkthread.net/)關於程式碼品質的相關文章很感興趣，存了一陣子終於有機會搬出來稍微整理一下。本文不會有真正的討論，只是個人紀錄和閱讀心得而已。

總共有以下幾篇文章：

- [閒聊 - 「好程式」跟你想的不一樣! 初讀「重構」有感](https://blog.darkthread.net/blog/refactoring-and-performance/)
- [重構筆記 - 壞味道 (Bad Smell)](https://blog.darkthread.net/blog/refactoring-notes-2-bad-smell/)
- [重構筆記 - .NET 壞味道補充包](https://blog.darkthread.net/blog/refactoring-notes-3/)
- [能抓耗子的就是好貓？閒談程式碼 Anti-Pattern](https://blog.darkthread.net/blog/anti-pattern/)

以及這兩篇相關文章：

- [重構-改善既有的程式的設計-第二版 練習與筆記](https://bryanyu.github.io/2018/01/07/RefactorPactice)
- [Write code that’s easy to delete, and easy to debug too.](https://programmingisterrible.com/post/173883533613/code-to-debug)

## 重構

對於重構這件事我**非常**有感，因為剛開始寫基本上從零開始，研究所是把 Numpy/Numba 摸的很熟沒錯，估計全台灣也不會有幾個人[比我還熟](https://docs.zsl0621.cc/docs/python/numba-tutorial-accelerate-python-computing)，但是在數值計算以外的方面就是完全的門外漢。三個小專案分別進行以下任務

1. [PostProcessor](https://github.com/ZhenShuo2021/PostProcess-of-Powerful-Pixiv-Downloader): 檔案分類、整理、爬蟲搜尋遺失檔案、可視化
2. [V2PH-Downloader](https://github.com/ZhenShuo2021/V2PH-Downloader): 就是個爬蟲專案，不過搞了多線程、抽象模式、策略模式、工廠模式、密碼學套件應用等等程式實作
3. [baha-blacklist](https://github.com/ZhenShuo2021/baha-blacklist): 網頁自動化專案

第一項沒什麼重構可言，因為各項任務間不相關程式難度降低很多；第二項就複雜了，也是重構最多次的，中間甚至有一段時間寫到覺得自己整天在重構沒有實質的功能優化。

### V2PH-Downloader

前言的第五篇文章把重構的各項要點條列式列出了，確實是命中了我寫 V2PH-Downloader 時的狀況。例如剛開始寫的程式耦合度高到令人很不舒服，主要體現在「**違反 SRP 的函式設計、沒有經過設計的變數傳遞、不知該如何下手的錯誤處理**」三項，造就第一次重構 (V2PH v0.0.4)。第一次重構是摸著石頭過河，這次重構主要是把輸入用 dataclass 傳遞，雖然方便很多，但因為傳入 RuntimeConfig 反而造成未來的修改困難，因為要嘛一次傳整個大 Config，要嘛把靜態 Config 和 RuntimeConfig 分開傳，前者會因為動態設定比靜態設定晚生成造成初始化困難，後者都是設定卻要分開，兩種方法都不太爽。

v0.0.4 的第一次重構還用了從很多語言模型學來的程式碼，例如 `getattr` `__enter__` `__exit__` 等等，不是說這些方法沒用，而是對於一個簡單的專案和技術能力不夠的人用這些簡直是幫倒忙，用不到看到又要懷疑一下自己。我記得那時候寫完叫語言模型幫我 code review 的時候永遠都跟我說違反 SRP（因為 Prompt 裡面有 SOLID 原則），那時滿好笑的是每天都在反駁他傻逼根本沒問題。這時候稍微抓到 SRP 的感覺，也知道要在 spaghetti code 和 ravioli code 之間找到平衡。

接下來又經歷了數次重構，重構了整個入口函式（劃分職責）、重構下載器（封裝成類別）、再度重構下載器（新增非同步方式）、重構但幾乎是重寫整個密碼加密、重構整個專案資料夾架構。現在回頭檢討這些問題的原因除了無可避免新手問題和早期專案會有的大量改變以外，另外就是「**不知道自己要作什麼**」，導致東西加上之後遇到問題才發現這樣寫有問題，還有最大的問題「**感覺程式好像怪怪的，但是問題在哪裡？**」沒有搞清楚問題本質而盲目修改反而造成更多的冤枉路，當然這是我個人練習才會出現的問題，有團隊 Code Review 應該不會發生冤枉路的問題吧。

到目前為止的重構經驗我知道要平衡 SRP、要清楚告訴自己問題出在哪才開始作業、把設計模式當作唯一準則會搞自己，例如在把程式碼丟給語言模型之後他八成會叫你用抽象方法修改擴充，一看就知道過度設計。函式命名也是增加可讀性很重要的一部分，有時候會覺得函式很難命名可能有兩個原因，第一個是可能自己都沒設定好命名規範當然亂糟糟，第二個是過多的職責所以取什麼名字都怪。

### baha-blacklist

經過前一個專案的磨練之後，寫這個我基本上已經知道架構要怎麼設計了，使用前一套的架構是

1. 最外層控制初始化和捕捉錯誤
2. 因為是簡單腳本所以不需要中間控制層
3. 真正被調用的類別做出外部接口方便調用

這個專案完成速度應該有前一個的十倍以上。

### 效能

先說我只是掃過「重構」的電子檔，自己也沒寫過 JS，只是一個小觀點。

看到黑暗執行緒說成這樣我也很感興趣，但是網路找的電子檔實在太難讀了又沒碰過 JS 根本看不下去，看他部落格的說明如果是我寫八成也會想辦法合併迴圈，這裡就要提醒「編譯器比自己還聰明」。就像 duff's device 這種神奇的方式[現代編譯器](https://www.youtube.com/watch?v=-WFtkrhzTtg)開 -O3就沒了，沒必要搞這些，最後效能提升可能都 negligible。

原因就像我自己寫的[效能測試](https://docs.zsl0621.cc/docs/python/false-sharing-in-python)一樣，想優化效能之前，搞清楚自己正在優化平台、語言等，比如說 Python 搞科學運算那想都不用想不是改用 Numba 就是 pybind11 其他都是徒勞，以及對現代硬體和編譯器有正確認知，例如 [unconditional writes](https://pythonspeed.com/articles/speeding-up-numba/) 這種略為 tricky 的方式就是很好的實現，這裡也順便推廣[自己的文章](https://docs.zsl0621.cc/docs/python/numba-tutorial-accelerate-python-computing#see-also)，包含各種正確調用硬體的加速方式。

總結就是搞清楚自己的程式語言、硬體平台和編譯器。

### 重構：摘要和我的粗淺看法

除了我用親自撞牆一輪的心得以外，重構這本書也列出了以下幾點（我沒讀，叫語言模型摘要的）：

1. **提升可讀性與可理解性**  
不良的程式碼結構會使新成員無法迅速理解系統邏輯，甚至讓經驗豐富的開發者無法有效修改。

1. **減少技術債**  
隨著專案演進，程式碼往往會積累不必要的複雜性或重複邏輯，這些技術債將大幅增加維護成本。

1. **改善軟體穩定性與性能**  
壞程式碼結構可能導致更多的 Bug，甚至在修改時引入新的問題，進而損害產品的穩定性。

1. **促進擴展性**  
良好的程式碼結構能夠輕鬆應對新功能的引入，而壞的結構則可能造成系統崩潰或功能衝突。

除了這幾點以外，在重構的過程我也感受到**應該先預估**重構的結果和未來的擴展，這是我目前能力還做不到的。待業仔其實還滿好奇在公司運作時是怎麼分配程式設計的，每人一塊即使有 code review 能保證整個專案不會變得花枝招展嗎。

除此之外，我不認同 [bryanyu](https://bryanyu.github.io/2018/01/07/RefactorPactice/) 這篇文章所說的「改進軟體設計：一個主要的方向就是消除重複的程式碼」，試想如果把一堆物件在父類用抽象方法包住使用，當你要使用該物件的某個父類還沒定義的方法，那父類要改所有子類也要改，文章後半段會更詳細說明。經歷過三個簡易專案，在最近幾次重構我會考慮

1. 我現在遇到什麼問題？
2. 可讀性
3. 可維護性
4. 可擴展性
5. 效能

核心是搞清楚自己的問題後，針對「可讀、可維護、可擴展性」進行修改，只不過後兩者我能力不足還沒辦法看到未來，也想過可能是因為我自己寫爽的想加啥都是臨時想到根本沒有計畫，沒計畫哪知道未來長怎樣。

## 可讀性

提升可讀性聽起來簡單但實際上也是有的搞，抽象還是不抽象重複程式碼、Keep It Simple, Stupid (KISS)、職責劃分 SRP、上下文相關性、命名藝術（真的是藝術）、專案生命週期...都有得考量。

這裡回頭來說前言提到的文章「能抓耗子的就是好貓？閒談程式碼 Anti-Pattern」，由於沒寫過 JS 所以請出 GPT:

> **簡而言之，作者反對以下兩種寫法：**
>
> 1. **不當使用 `jQuery.map()` 取代 `jQuery.each()` 迭代：** `map()` 的目的是產生 *新陣列*，而非單純迭代。即使 `map()` 可用於迭代，但這 *違反其原意*，造成誤解。僅需迭代時應使用 `each()` 或原生迴圈。
> 2. **不當使用 `Select(o => ...).Count()` 驗證或修改資料：** `Select()` 的目的是產生 *新序列*，`Count()` 是 *計數*。使用它們驗證或在 `Select()` 內 *修改原始資料* 皆 *不當*，嚴重違反其原意，導致後續維護困難。驗證或修改資料應使用 `ForEach()` 或 `foreach()`。

第一眼看到文章以為是在講類似海象運算符這種比較少見的符號，結果是奇妙用法。這種奇妙用法就算自己沒用過也明確不贊成，除非有明顯的效能優勢或者明確註解，不然省了行數看起來很爽，結果別人讀要多花一分鐘，然後出 bug 還不知道到底要不要改這裡。

關於可讀性的另一點是「顯式優於隱式」「語法約束優於邏輯約束」，這兩句話從码农高天偷來的，簡單的範例大概是顯式的寫出 else 比起每次看到還要判斷懷疑一下會不會進入下一行更好。這兩部影片比較推薦觀看，新手中手都適合：

- [【Code Review】十行循环变两行？argparse注意事项？不易察觉的异常处理？](https://www.youtube.com/watch?v=7EQsUOT3NKY)
- [【Code Review】传参的时候有这么多细节要考虑？冗余循环变量你也写过么？](https://www.youtube.com/watch?v=er9MKp7foEQ)

## Do Repeat yourself

抽象在幹嘛？以 Python 為例，最直觀的抽象是 `abstractmethod`，就是定義一個模板，子類按規範實作，讓外部只看外觀不用管內部實作。甚至只把重複邏輯包成函式也屬於抽象，總之就是外部只需知道輸入與回傳值。

抽象除了簡化概念，也可以避免程式設計準則中的 don't repeat yourself (DRY)。那為何標題是 Do repeat 呢？因為錯誤的抽象比重複還難改。現代 IDE 都能很快定位到程式碼位置，然而如果寫了一個糟糕、不實際的抽象，或者是沒考慮到未來、對未來支援差、太久以前寫的抽象，要改就不是確認有沒有完整的複製貼上而已。關於這裡因為我還很菜所以各位就請看大老們的文章吧，只簡單摘要 `The Wrong Abstraction` 裡面提到的情境：

> 1. 程式設計師 A 觀察到程式碼中存在重複。
> 2. 程式設計師 A 將這些重複提取出來並賦予它一個名稱，形成新的抽象化，這可能是一個方法，也可能是一個類別。
> 3. 程式設計師 A 將重複的程式碼替換為新的抽象化，感覺程式碼變得完美無缺後心滿意足地離開。
>
> 時間過去……
>
> 4. 新的需求出現，現有的抽象化幾乎能滿足，但仍需進行少許改動。
> 5. 程式設計師 B 被指派來實現這項需求，他們希望能保留現有的抽象化，於是通過增加參數和條件邏輯來適應新的需求。
>
> 這樣一來，曾經的通用抽象化開始因應不同情況而表現出不同行為。
>
> 隨著更多需求的出現，這個過程持續重複：
>
> 6. 又來一個程式設計師 X。
> 7. 又增加一個參數。
> 8. 又新增一個條件判斷。
>
> 最終，程式碼變得難以理解且錯誤頻出。而此時，你正好加入了這個項目，並開始陷入混亂。

- [Goodbye, Clean Code](https://overreacted.io/goodbye-clean-code/)
- [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
- [Repeat yourself, do more than one thing, and rewrite everything](https://programmingisterrible.com/post/176657481103/repeat-yourself-do-more-than-one-thing-and)
- [程式碼中的抽象](https://op8867555.github.io/posts/2021-11-19-abstraction.html)
- [淺談「錯誤的抽象」](https://rickbsr.medium.com/%E6%B7%BA%E8%AB%87-%E9%8C%AF%E8%AA%A4%E7%9A%84%E6%8A%BD%E8%B1%A1-28c0adbf792e)

在 `Goodbye, Clean Code` 裡面提到的「即使程式碼看起來很亂，但是要在裡面加東西比抽象方法簡單多了，正好呼應了 `Write code that’s easy to delete, and easy to debug too.` 裡面的「有時，程式碼本身非常混亂，任何企圖“清理”它的行為反而會帶來更大的問題。在未理解其行為前試圖撰寫乾淨程式碼，結果可能適得其反，無異於召喚出一個難以維護的系統。」

## 流失率 Code Churn Rate

流失率表示**事後回來修改現有程式的比率**，沒看到正式的定義，只有看到簡單的定義是

> Code Churn Rate = (新增或修改的程式碼行數 + 刪除的程式碼行數) / 總程式碼行數

這是用程式檢查工具才看到的名詞，不知為何幾乎沒什麼人談論到他。根據 [Code Churn Rate: Challenges, Solutions, and Tools for Calculation](https://medium.com/binmile/code-churn-rate-challenges-solutions-and-tools-for-calculation-62f3e8b31fd7) 的說明，一般來說流失率 25% 以下算正常，15% 就屬於高效的運作了。

該文章中舉出幾個會出現流失的情況，包含原型設計階段、完美主義、遇到難題、模糊的要求、優柔寡斷的利害關係人合作，五個我中了四個，那流失率高果然也是跑不掉，不過在最後一個專案流失率問題就好很多了。

## 程式碼檢測工具

在黑暗執行緒的壞味道文章中提到的問題，使用現代檢查工具可以輕易的避免，目前我主要使用的有幾個：

1. ruff linter: 程式碼品質檢查、確保一致性、可讀性、自動修復、支援 pep8/flake8/Pylint/Pyflakes 等多種規則設定，還會告訴你新語法跟 why better
2. ruff-format: 格式化程式碼，支援 black 格式、內嵌 isort
3. mypy: 靜態型別檢查，確認參數是否符合 type hint，可以減少很多 typo 問題，也可以檢查到某些位置的 code never reach
4. bandit: 安全漏洞檢查
5. pyupgrade: 檢查有沒有用新版 Python 語法
6. pytest/pytest-cov: 單元測試和覆蓋率
7. pre-commit: 預提交自動執行上述指令
8. viztracer: 我老大码农高天開發的 profiler，好用
9. codeclimate: 吃飽太閒的時候會上去看自己的 Issues/Churn/Maintainability 等，流失率就是在這裡學到的，裡面也同樣用 smells 表示有問題的程式碼

## 其他

不在本文標題中，心得也沒有多到可以寫成文章的地步，流水帳描述目前的暫時狀況

1. 版本管理：心情好就打標籤，沒規律
2. 錯誤處理：外層攔截特定例外，底層攔截固定例外，其餘沒想法
3. 一致性：包含日誌和錯誤訊息，要怎麼處理一致性還沒想法，想過用裝飾器但感覺不是最佳解
4. 測試策略：沒策略，感覺重要的就單元測試，主功能有整合測試，但是有感受到 CLI 專案整合測試比起單元測試更重要，尤其是我菜鳥階段視野不夠廣的情況下，整合測試能保證至少錯完還是可以動，而單元測試無法保證
5. CI/CD：白嫖 Github 免費流量
6. scope creep（範圍蔓延）：與現在的我無關但我就想放在這
7. 敏捷開發：與現在的我無關但我就想放在這

## 結尾

本篇就是流水帳紀錄過程和看到的文章，大致上的心得可以用一句話概括：「房間稍微有點亂至少行動方便，乾乾淨淨但是反而會造成作什麼都麻煩」，或者再加上「避免過早抽象」。在文章最後把連結在結尾重新列出一次方便尋找。

## Reference

- [閒聊 - 「好程式」跟你想的不一樣! 初讀「重構」有感](https://blog.darkthread.net/blog/refactoring-and-performance/)
- [重構筆記 - 壞味道 (Bad Smell)](https://blog.darkthread.net/blog/refactoring-notes-2-bad-smell/)
- [重構筆記 - .NET 壞味道補充包](https://blog.darkthread.net/blog/refactoring-notes-3/)
- [能抓耗子的就是好貓？閒談程式碼 Anti-Pattern](https://blog.darkthread.net/blog/anti-pattern/)
- [重構-改善既有的程式的設計-第二版 練習與筆記](https://bryanyu.github.io/2018/01/07/RefactorPactice)
- [Write code that’s easy to delete, and easy to debug too.](https://programmingisterrible.com/post/173883533613/code-to-debug)
- [Goodbye, Clean Code](https://overreacted.io/goodbye-clean-code/)
- [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
- [Repeat yourself, do more than one thing, and rewrite everything](https://programmingisterrible.com/post/176657481103/repeat-yourself-do-more-than-one-thing-and)
- [程式碼中的抽象](https://op8867555.github.io/posts/2021-11-19-abstraction.html)
- [淺談「錯誤的抽象」](https://rickbsr.medium.com/%E6%B7%BA%E8%AB%87-%E9%8C%AF%E8%AA%A4%E7%9A%84%E6%8A%BD%E8%B1%A1-28c0adbf792e)
- [淺談「重覆程式碼」](https://rickbsr.medium.com/%E6%B7%BA%E8%AB%87-%E9%87%8D%E8%A6%86%E7%A8%8B%E5%BC%8F%E7%A2%BC-fdc45d4990fc)
- [【Code Review】十行循环变两行？argparse注意事项？不易察觉的异常处理？](https://www.youtube.com/watch?v=7EQsUOT3NKY)
- [【Code Review】传参的时候有这么多细节要考虑？冗余循环变量你也写过么？](https://www.youtube.com/watch?v=er9MKp7foEQ)