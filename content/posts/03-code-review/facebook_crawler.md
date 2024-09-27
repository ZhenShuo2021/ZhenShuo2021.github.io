---
title: "Code Review: facebook_crawler"
date: 2024-09-28T00:13:29+08:00
draft: false
summary: 前段時間認真寫了自己的第一個小專案，關注的重點在於可讀性高、可維護性高和可擴展性高的程式碼，版本從研究所時期的等級（能動就好）到最終版我個人還是覺得算不錯了，就想幫自己寫一個 code review 記錄過程，但是一直因為怠惰沒有動筆，直到看到這篇文章
showSummary: false
tags: [程式語言, code-review, Python]
categories: [程式語言]
series: []
series_order: 
progress_bar: true
---

# 前
前段時間認真寫了自己的第一個小專案，關注的重點在於可讀性高、可維護性高和可擴展性高的程式碼，版本從研究所時期的等級（能動就好）到最終版我個人還是覺得算不錯了，就想幫自己寫一個 code review 記錄過程，但是一直因為怠惰沒有動筆，直到看到這篇文章 [開源套件的經營指南 Facebook-Crawler 套件的理念、策略與收穫](https://speakerdeck.com/tlyu0419/kai-yuan-tao-jian-de-jing-ying-zhi-nan-facebook-crawler-tao-jian-de-li-nian-ce-lue-yu-shou-huo-4589e02d-c74e-43fe-a8d8-323accd61a72) 讓我起了動筆的慾望並且插隊成為第一篇 review：

> - 經營開源專案往往會需要開發者投入相當多的時間與心力，而如何從經營的過程中持續性的獲得正向回饋即是決定開發者能否長期投入的關鍵因素。在這次的分享中我將以 facebook-crawler 為例，從專案管理的角度與大家分享 facebook-crawler 的理念、策略與收穫。不論你想要為開源專案貢獻一份心力，或者已經是開源專案的貢獻者，相信你/妳都能從這次的分享中更深入的了解經營開源專案會遇到大大小小的事情。並且希望透過這次的幫助大家設計與打造正向的回饋機制!
> - facebook-crawler 是一項開源的 Python 套件，可以協助使用者用簡潔的語法快速收集 Facebook 上的公開粉絲專頁、社團的貼文資料，開源至今已經累積超過 2 萬次的下載量，在學術、商業、風險偵測、教育等等方面都有許多應用。

看起來是個在開源界深耕多年的大佬心得，專案位置是 [facebook_crawler](https://github.com/tlyu0419/facebook_crawler)。

# 中
先看主程式 main.py import 部分: 

```py
from paser import _parse_category, _parse_pagename, _parse_creation_time, _parse_pagetype, _parse_likes, _parse_docid, _parse_pageurl
from paser import _parse_entryPoint, _parse_identifier, _parse_docid, _parse_composite_nojs, _parse_composite_graphql, _parse_relatedpages, _parse_pageinfo
from requester import _get_homepage, _get_posts, _get_headers
from utils import _init_request_vars
from bs4 import BeautifulSoup
import os
import re

import json
import time
import tqdm

import pandas as pd
import pickle

import datetime
import warnings
```

- 沒有照 PEP8 排序
- 全部函式都設定 private 沒有意義

## 主函式
我們選其中一個主函式 `Crawl_PagePosts` 來看。


```py
# 主函式之一
def Crawl_PagePosts(pageurl, until_date='2018-01-01', cursor=''):
    # initial request variables
    df, cursor, max_date, break_times = _init_request_vars(cursor)

    # get headers
    headers = _get_headers(pageurl)

    # Get pageid, postid and entryPoint from homepage_response
    homepage_response = _get_homepage(pageurl, headers)
    entryPoint = _parse_entryPoint(homepage_response)
    identifier = _parse_identifier(entryPoint, homepage_response)
    docid = _parse_docid(entryPoint, homepage_response)

    # Keep crawling post until reach the until_date
    while max_date >= until_date:
        try:
            # Get posts by identifier, docid and entryPoint
            resp = _get_posts(headers, identifier, entryPoint, docid, cursor)
            if entryPoint == 'nojs':
                ndf, max_date, cursor = _parse_composite_nojs(resp)
                df.append(ndf)
            else:
                ndf, max_date, cursor = _parse_composite_graphql(resp)
                df.append(ndf)
            break_times = 0
        except:
            # print(resp.json()[:3000])
            try:
                if resp.json()['data']['node']['timeline_feed_units']['page_info']['has_next_page'] == False:
                    print('The posts of the page has run over!')
                    break
            except:
                pass
            # print(xxx, skip logging messages for simplicity)
            break_times += 1

            time.sleep(20)
            # Get new headers
            headers = _get_headers(pageurl)

    # Concat all dataframes
    df = pd.concat(df, ignore_index=True)
    df['UPDATETIME'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return df
```

- **命名規範**
    1. 沒有照 PEP8 命名
    2. 沒有 type hint
    3. 命名問題：
    - `break_times` => `retry_times`
    - `max_date` => `latest_date`
    - `until_date` => `end_date`
    - `ndf` => `df_new`
    4. 命名問題：`_get_homepage` 回傳 homepage_response，而 `_get_posts` 回傳 resp，兩個都是 `request.get` 的回傳值但是命名規範不同
    

- **結構**
    1. 功能太多，違反單一職責原則
    2. resp = _get_posts() 被抱怨 reportPossiblyUnboundVariable，該行應該寫在 try 外面，因為函式一定會回傳 resp
    3. try-except 範圍太大，無法定位問題

- **性能**
    1. ~~沒研究 pandas，但根據經驗這些高階套件往往開銷都很大，如果屬實則 `df.append` 應該改成存在 list 最後才全部一起寫入 dataframe~~
    2. _init_request_vars 不標清楚反而讓我誤解上面的 append，df 變數應該命名 df_list 不然誰看都覺得這是 dataframe 變數。初始化如果共用寫 class init，不共用寫 function _crawl_page_posts_init
    3. 考慮巨量數據，可以每暫存 20 筆就寫入 dataframe
    4. 用 dict get method 就可以避免 json 取值的兩層嵌套，而且 try-except 有 overhead

- **其他**
    1. 應該用 logger 而不是一堆 print
    2. magic number `3000` 應該用大寫存成常數， `20` `15` `nojs` 也是
    3. except 最後的 _get_headers 第一眼會覺得一樣的 pageurl 為何要 get 兩次，需要註釋

另外兩個就不貼上，這裡主要問題是 
- `Crawl_RelatedPages` 
    1. 嵌套太多層了，可以用工具函式解決
    2. 看不出來不同 rounds 哪裡有變化
    3. `crawled_list` `pageurls` 保持 set 操作不需特別轉回 list
    4. 前面知道要用 list 一次寫入 pd，這裡卻直接在迴圈中使用 pd.concat
- `Crawl_PageInfo` 
    1. 沒看懂為何使用 global 變數，直接回傳就可以了。
    2. 直接用 json 儲存就好 pickle 有安全隱患
    3. 總結這些函式，沒有註釋完全不知道為何分別要這樣寫，只能猜或重跑

## 工具函式
然後觀察被調用的工具函式 `_parse_identifier` `_get_headers` `_parse_docid` `_get_homepage` 

```py
# 工具函式
def _get_homepage(pageurl, headers):
    pageurl = re.sub('/$', '', pageurl)
    timeout_cnt = 0
    while True:
        try:
            homepage_response = requests.get(pageurl, headers=headers, timeout=3)
            return homepage_response
        except:
            time.sleep(5)
            timeout_cnt = timeout_cnt + 1
            if timeout_cnt > 20:
                class homepage_response():
                    text = 'Sorry, something went wrong.'
                return homepage_response

def _parse_entryPoint(homepage_response):
    try:
        entryPoint = re.findall(
            '"entryPoint":{"__dr":"(.*?)"}}', homepage_response.text)[0]
    except:
        entryPoint = 'nojs'
    return entryPoint


def _parse_identifier(entryPoint, homepage_response):
    if entryPoint in ['ProfilePlusCometLoggedOutRouteRoot.entrypoint', 'CometGroupDiscussionRoot.entrypoint']:
        # pattern 1
        if len(re.findall('"identifier":"{0,1}([0-9]{5,})"{0,1},', homepage_response.text)) >= 1:
            identifier = re.findall(
                '"identifier":"{0,1}([0-9]{5,})"{0,1},', homepage_response.text)[0]

        # pattern 2
        elif len(re.findall('fb://profile/(.*?)"', homepage_response.text)) >= 1:
            identifier = re.findall(
                'fb://profile/(.*?)"', homepage_response.text)[0]

        # pattern 3
        elif len(re.findall('content="fb://group/([0-9]{1,})" />', homepage_response.text)) >= 1:
            identifier = re.findall(
                'content="fb://group/([0-9]{1,})" />', homepage_response.text)[0]

    elif entryPoint in ['CometSinglePageHomeRoot.entrypoint', 'nojs']:
        # pattern 1
        if len(re.findall('"pageID":"{0,1}([0-9]{5,})"{0,1},', homepage_response.text)) >= 1:
            identifier = re.findall(
                '"pageID":"{0,1}([0-9]{5,})"{0,1},', homepage_response.text)[0]

    return identifier


def _parse_docid(entryPoint, homepage_response):
    soup = BeautifulSoup(homepage_response.text, 'lxml')
    if entryPoint == 'nojs':
        docid = 'NoDocid'
    else:
        for link in soup.findAll('link', {'rel': 'preload'}):
            resp = requests.get(link['href'])
            for line in resp.text.split('\n', -1):
                if 'ProfileCometTimelineFeedRefetchQuery_' in line:
                    docid = re.findall('e.exports="([0-9]{1,})"', line)[0]
                    break

                if 'CometModernPageFeedPaginationQuery_' in line:
                    docid = re.findall('e.exports="([0-9]{1,})"', line)[0]
                    break

                if 'CometUFICommentsProviderQuery_' in line:
                    docid = re.findall('e.exports="([0-9]{1,})"', line)[0]
                    break

                if 'GroupsCometFeedRegularStoriesPaginationQuery' in line:
                    docid = re.findall('e.exports="([0-9]{1,})"', line)[0]
                    break
            if 'docid' in locals():
                break
    return docid
```

這邊就不講變數命名了，不然講不完。
- `_get_homepage`
    1. 建立 `class homepage_response()` 沒意義，有錯直接在最近的地方解決，而不是讓所有使用 `_get_homepage` 的函式都要錯誤檢查，避免忘了檢查會有一段白白運行但是無用的程式碼，還導致最後排查困難。
- `_parse_docid` 和 `_parse_identifier`: 
    1. 如果所有 pattern 都不符合會回傳 none，直到 `_get_posts` 才會報錯，應該加上型別檢查讓錯誤離發生處越近越好
    2. 請用專用套件解析 html，雖然[比較慢](https://stackoverflow.com/questions/16929149/finding-links-fast-regex-vs-lxml)，但你可以看[這個人有多氣](https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags)
    3. 應將 pattern 寫在函式最前面並且遍歷 list，我們以 `_parse_docid` 為例，可以把他修改成以下，可以看到行數差不多，但是可讀性和可維護性更高，還多加上網路操作一定要的 `try-except`，同時解決濫用 `locals` 語法問題
    ```py
    # 優化後的 _parse_docid
    def parse_docid(entry_point, homepage_response):
        if entry_point == 'nojs':
            return 'NoDocid'
        
        soup = BeautifulSoup(homepage_response.text, 'lxml')
        queries = {
            'ProfileCometTimelineFeedRefetchQuery_': r'e.exports="(\d+)"',
            'CometModernPageFeedPaginationQuery_': r'e.exports="(\d+)"',
            'CometUFICommentsProviderQuery_': r'e.exports="(\d+)"',
            'GroupsCometFeedRegularStoriesPaginationQuery': r'e.exports="(\d+)"'
        }

        for link in soup.find_all('link', {'rel': 'preload'}):
            doc_id = fetch_doc_id(link['href'], queries)
            if doc_id:
                break

        return doc_id

    def fetch_doc_id(href, queries):
        try:
            resp = requests.get(href)
            resp.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {href}: {e}")
            return 'RequestError'
        
        for line in resp.text.splitlines():
            for query, pattern in queries.items():
                if query in line and (match := re.search(pattern, line)):
                    return match.group(1)
            
            # 原版只要有任何 docid 變數就直接 return，所以這裡要多做一次檢查
            if any(query in line for query in queries):
                break

        return 'NoDocidFound'
    ```

## 取鍵值函式
parser.py 中的取鍵值函式，太長了也沒觀賞性就不貼過來，但是一看就知道我在說什麼

1. magic number `requires[3][2]` 沒有注釋
2. 重複的 key 可以提前取好可避免複製貼上
3. 超長的 dict 取 key，可以使用 pydantic 方便管理，人工輸入絕對會錯

## 修改架構 By GPT
上面都是細節實現問題，這裡講架構問題，抽出共用變數並且定義通用接口提升可讀性。 BaseCrawler 懶的自己寫叫 GPT 寫的：

```py
class BaseCrawler:
    def __init__(self, max_retries: int = 15, sleep_time: int = 20):
        self.max_retries = max_retries
        self.sleep_time = sleep_time
        self.headers: Dict[str, str] = {}
        self.pageurl = None
        self.crawled_data = []

    def get_headers(self, page_url: str) -> Dict[str, str]:
        self.headers = _get_headers(page_url)
        return self.headers
    
    def get_homepage_response(self, page_url: str) -> Any:
        # 直接在這裡實現 _get_homepage
        pass

    def execute_with_retry(self, func: callable, *args, **kwargs) -> Any:
        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logging.error(f"Error on attempt {attempt + 1}: {str(e)}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(self.sleep_time)
                self.get_headers(kwargs.get('page_url', args[0] if args else None))

    def crawl(self, page_url: str) -> Any:
        """爬取主要邏輯，需要在子類中實現"""
        raise NotImplementedError("Subclasses must implement the crawl method")
```

## 問題總結

1. 沒註釋
2. 變數命名不統一
3. 命名規範參考 PEP8
4. 魔法數字改用常數管理
5. 深層嵌套
7. 函數職責過多
8. 錯誤處理範圍太廣，沒有顯示 exception message，濫用 try 以及不統一的 try 位置，有些在主函式有些在副函式，有些主函式 request 忘了 try，應該全部在子函式管理
9. 字典 key 使用 pydantic 管理
10. 應使用專用 HTML 解析和 `logger`
11. 不必要的 `global()` `locals()`

# 後
會用 linter 和 formatter 應該可以解決一半問題。