---
title: '20240826'
date: 2024-08-26T02:42:43+08:00
draft: false
summary: 
showSummary: false
tags: ["廢文", "Python"]
categories: ["程式語言"]
series: []
series_order: 
progress_bar: true
---

> Python dis

[码农高天](https://www.youtube.com/@minkoder) 常常會用 dis 函數來解釋底層語法，看了但從來沒用過，紀念一下第一次用。

```python
import dis
def example():
    with open('file.txt', 'r') as file:
        content = file.read()

dis.dis(example)
```

輸出：
```sh
(.venv) leo@MBP P5D % python3 t.py                  
  2           0 RESUME                   0

  3           2 LOAD_GLOBAL              1 (NULL + open)
             12 LOAD_CONST               1 ('file.txt')
             14 LOAD_CONST               2 ('r')
             16 CALL                     2
             24 BEFORE_WITH
             26 STORE_FAST               0 (file)

  4          28 LOAD_FAST                0 (file)
             30 LOAD_ATTR                3 (NULL|self + read)
             50 CALL                     0
             58 STORE_FAST               1 (content)

  3          60 LOAD_CONST               0 (None)
             62 LOAD_CONST               0 (None)
             64 LOAD_CONST               0 (None)
             66 CALL                     2
             74 POP_TOP
             76 RETURN_CONST             0 (None)
        >>   78 PUSH_EXC_INFO
             80 WITH_EXCEPT_START
             82 POP_JUMP_IF_TRUE         1 (to 86)
             84 RERAISE                  2
        >>   86 POP_TOP
             88 POP_EXCEPT
             90 POP_TOP
             92 POP_TOP
             94 RETURN_CONST             0 (None)
        >>   96 COPY                     3
             98 POP_EXCEPT
            100 RERAISE                  1
ExceptionTable:
  26 to 58 -> 78 [1] lasti
  78 to 86 -> 96 [3] lasti
```


簡單解讀：  
- 數字 2, 3, 4, 3: 對應 Python 程式碼行數   
- `CALL 2`: stack 要 pop 的參數數量，pop (NULL + open), ('file.txt'), ('r') 給 `__enter__()`   
- BEFORE_WITH: 載入 with 關鍵字用的 `__exit__()` 和 `__enter__()`  
- STORE_FAST: 儲存 `STACK.pop()` 的變數   
- LOAD_ATTR: 載入方法 method   
- RETURN_CONST: 回傳程式結束碼   

名詞：
- [lasti](https://docs.python.org/3/library/dis.html): last instruction  
- [ExceptionTable](https://stackoverflow.com/questions/77542619/what-is-the-exceptiontable-in-the-output-of-dis): 決定 raised exception 後要跳去哪 ，感覺和 interrupt vector 滿像的
\>\>: 跳轉位置

