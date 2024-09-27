---
title: "Code Review: facebook_crawler"
date: 2024-09-28T00:13:29+08:00
draft: false
summary: 
showSummary: false
tags: [程式語言, code-review, Python]
categories: [程式語言]
series: []
series_order: 
progress_bar: true
---

# 前
前段時間認真寫了自己的第一個小專案，關注的重點在於可讀性高、可維護性高、可擴展性高和執行效率高的程式碼，版本從研究所時期的等級（能動就好）到最終版我個人還是覺得算不錯了，就想幫自己寫一個 code review 記錄過程，但是一直因為怠惰沒有動筆，直到看到這篇文章 [開源套件的經營指南 Facebook-Crawler 套件的理念、策略與收穫](https://speakerdeck.com/tlyu0419/kai-yuan-tao-jian-de-jing-ying-zhi-nan-facebook-crawler-tao-jian-de-li-nian-ce-lue-yu-shou-huo-4589e02d-c74e-43fe-a8d8-323accd61a72) 讓我起了動筆的慾望並且插隊成為第一篇 review：

> - 經營開源專案往往會需要開發者投入相當多的時間與心力，而如何從經營的過程中持續性的獲得正向回饋即是決定開發者能否長期投入的關鍵因素。在這次的分享中我將以 facebook-crawler 為例，從專案管理的角度與大家分享 facebook-crawler 的理念、策略與收穫。不論你想要為開源專案貢獻一份心力，或者已經是開源專案的貢獻者，相信你/妳都能從這次的分享中更深入的了解經營開源專案會遇到大大小小的事情。並且希望透過這次的幫助大家設計與打造正向的回饋機制!
> - facebook-crawler 是一項開源的 Python 套件，可以協助使用者用簡潔的語法快速收集 Facebook 上的公開粉絲專頁、社團的貼文資料，開源至今已經累積超過 2 萬次的下載量，在學術、商業、風險偵測、教育等等方面都有許多應用。

看起來是個在開源界深耕多年的大佬心得，專案位置是 [facebook_crawler](https://github.com/tlyu0419/facebook_crawler)。

# 中
先看主程式 main.py: 
- 沒有照 PEP8 排序
- 全部函式都設定 private 沒有意義
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

## 主函式
接下來看第一個主函式。

- **可讀性**
    1. 注釋！注釋！注釋！沒有注釋！
    1. 沒有照 PEP8 命名
    2. 沒有 type hint
    2. break_times 改成 retry_times
    3. `max_date` `until_date` 換命名，英文問題
    4. `_get_homepage` 回傳 homepage_response，但是 `_get_posts` 回傳 resp，兩個都是 `request.get` 的回傳值但是命名規範不同
    5. magic number `3000` 應該用大寫 const 存， `20` `15` 也是
    6. `_get_headers` 第一眼要反應一下，可以定義 `DEFAULT_HEADERS = {key: val}`，`headers = {**DEFAULT_HEADERS}`

- **優化**
    1. 功能太多，違反單一職責原則
    2. 沒研究 pandas，但根據經驗這些高階套件開銷都很大，如果屬實 `df.append` 應該改成存在 list 最後才全部一起寫入 `df`
    3. resp = _get_posts() 應該寫在 try 外面，因為他無論如何都會回傳 resp (reportPossiblyUnboundVariable)
    4. 用 get method 就可以 try+if 避免兩層嵌套，而且 try-except 有 overhead （性能開銷）

```py
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
            # Test
            # print(ndf.shape[0])
            break_times = 0
        except:
            # print(resp.json()[:3000])
            try:
                if resp.json()['data']['node']['timeline_feed_units']['page_info']['has_next_page'] == False:
                    print('The posts of the page has run over!')
                    break
            except:
                pass
            print('Break Times {}: Something went wrong with this request. Sleep 20 seconds and send request again.'.format(
                break_times))
            print('REQUEST LOG >>  pageid: {}, docid: {}, cursor: {}'.format(
                identifier, docid, cursor))
            print('RESPONSE LOG: ', resp.text[:3000])
            print('================================================')
            break_times += 1

            if break_times > 15:
                print('Please check your target page/group has up to date.')
                print('If so, you can ignore this break time message, if not, please change your Internet IP and run this crawler again.')
                break

            time.sleep(20)
            # Get new headers
            headers = _get_headers(pageurl)

    # Concat all dataframes
    df = pd.concat(df, ignore_index=True)
    df['UPDATETIME'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return df
```

另外兩個就不全部貼上， `Crawl_RelatedPages` 嵌套太多層了，可以加上工具函式解決，`Crawl_PageInfo` 沒看懂為啥要 global 變數，直接回傳就可以了。

## 工具函式
然後觀察被調用的工具函式


- **可維護性**
    1. `_parse_identifier` 如果所有 pattern 都不符合會回傳 none，直到 `_get_posts` 才會報錯，應該加上型別檢查讓錯誤離發生處越近越好
    2. `_parse_docid` 和 `_parse_identifier` 把 pattern 寫在函式最前面並且遍歷 list
    3. print 請改用 logging
- **優化**
    1. `['data']['node']['timeline_feed_units']` 被使用多次，應該統一管理並寫一個 get_nested_dict 函式取用
    2. 請用專用套件解析 html，雖然[比較慢](https://stackoverflow.com/questions/16929149/finding-links-fast-regex-vs-lxml)，但你可以看[這個人有多氣](https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags)

```
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

def _parse_identifier(entryPoint, homepage_response):
    if entryPoint in ['ProfilePlusCometLoggedOutRouteRoot.entrypoint', 'CometGroupDiscussionRoot.entrypoint']:
        # pattern 1
        if len(re.findall('"identifier":"{0,1}([0-9]{5,})"{0,1},', homepage_response.text)) >= 1:
            identifier = re.findall(
                '"identifier":"{0,1}([0-9]{5,})"{0,1},', homepage_response.text)[0]

        # pattern 2
        elif len(re.findall('fb://profile/(.*?)"', homepage_response.text)) >= 1:
            identifier = re.findall('fb://profile/(.*?)"', homepage_response.text)[0]

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

def _get_headers(pageurl):
    '''
    Send a request to get cookieid as headers.
    '''
    pageurl = re.sub('www', 'm', pageurl)
    resp = requests.get(pageurl)
    headers = {'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
               'accept-language': 'en'}
    headers['cookie'] = '; '.join(['{}={}'.format(cookieid, resp.cookies.get_dict()[
                                  cookieid]) for cookieid in resp.cookies.get_dict()])
    # headers['cookie'] = headers['cookie'] + '; locale=en_US'
    return headers
```

## 取值函式
1. magic number `requires[3][2]` 沒有注釋
2. 重複的 key 可以提前取好可避免複製貼上
3. 超長的 dict 取 key，太長了也沒觀賞性就不貼過來，但是你點進去一看就知道我在說什麼，可以寫工具函式：
```py
def _safe_get(dictionary, keys, default=None):
    for key in keys:
        dictionary = dictionary.get(key, {})
    return dictionary if dictionary else default
```

然後程式碼就可以漂亮的用 list 取鍵值，也不需要 try-except。

```py
name = Parser._safe_get(comet_sections, ['context_layout', 'story', 'comet_sections', 'actor_photo', 'story', 'actors', 0, 'name'], '')
```


## 修改架構
上面都是細節問題，這裡講架構問題，提出 crawler 共用的變數並且定義共用接口提升可讀性。  
懶的自己寫叫 GPT 寫的，增加一個基礎類別實現

```py
class BaseCrawler:
    def __init__(self, max_retries: int = 15, sleep_time: int = 20):
        self.max_retries = max_retries
        self.sleep_time = sleep_time
        self.headers: Dict[str, str] = {}
        self.pageurl = None
        self.crawled_data = []

    def get_headers(self, page_url: str) -> Dict[str, str]:
        """獲取請求頭"""
        self.headers = _get_headers(page_url)
        return self.headers
    
    def get_homepage_response(self, page_url: str) -> Any:
        """獲取主頁響應"""
        return _get_homepage(page_url, self.headers)

    def execute_with_retry(self, func: callable, *args, **kwargs) -> Any:
        """執行帶有重試機制的函數"""
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

# 後
想不到什麼好寫，會用 Pylance/Ruff 應該可以解決一半問題。