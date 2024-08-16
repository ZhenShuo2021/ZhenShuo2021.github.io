---
title: C 變數宣告
date: 2024-06-27
draft: true
summary: C 變數宣告
description: "C practice"
slug: "C-practice1"
tags: ["C語言"]
categories: ["筆記"]
series: ["基礎C語言"]
series_order: 1
---

# 1. 基礎宣告
|Syntax | Description|
|---|---|
|int a | a is an integer|
|int *a |a is a pointer to integer|
|int **a |a is a pointer to a pointer to an integer|
|int a[10] |a is an array of 10 integers|
|int *a[10] |a is an array of 10 pointers to integers|
|int (*a)[10] |a is a pointer to an array of 10 integers|
|int (*a)(int) |a is a pointer to a function that takes an integer argument and returns an integer|
|int (*a[10])(int) |a is an array of 10 pointers to functions, each taking an integer argument and returning an integer|
|void (\*(\*papf)[3])(char\*) |papf is a pointer to an array of 3 pointers to functions, each taking a char* argument and returning void|

> Quiz: Rewrite `void(*(*papf)[3])(char*)` with typedef, the new declaration would be `pf (*papf)[3]`  
>
><details>
>
>  <summary>Ans</summary>
>
>  `typedef void(*pf)(char *)`
></details>
<br>

# 2. 複雜宣告

根據自己各種卡的經驗，還是乖乖寫成英文再轉成中文讀最快理解。
步驟：
1. 從最裡面的括弧開始讀
2. 往右讀直到沒有運算子，就往左讀
3. 重複第二步

工具一：[GeeksforGeeks範例](https://www.geeksforgeeks.org/complicated-declarations-in-c/)  
工具二：[語法轉換器](https://cdecl.org/)

# 3. Const宣告
由右向左念
|   | 讀法 | 內容 |
|---|---|---|
|const int* p|pointer to int read-only|改內容x，改指向✓|
|int const* p|pointer to read-only int|改內容x，改指向✓|
|int* const p|read-only pointer to int|改內容✓，改指向x|
|const int * const   p|兩個都唯讀| 兩個都唯讀 |

# 4. static
1. 在函式的變數中，讓變數不會死掉，ex: function counter。
2. 在全域變數/函式中，無法被其他檔案調用(防止extern)。  

[Source](https://shengyu7697.github.io/cpp-static/)

# 5. Volatile
- 可能會被意想不到地改變，編譯器就不會去假設這個變量的值了。
- 精確地說：優化器必須每次都小心地重新讀取這個變量的值，而不是使用保存在寄存器裡的備份。下面是volatile變量的幾個例子：
    1. [中斷處理程式](https://hackmd.io/@JDTyeH_URrKEf6JNBF_sZw/ryoaj1Tk9)中(ISR)可能被修改的全域變數（因ISR不可有參數，透過全域變數與主程式或其他函數分享資料可能會改變）
    ```c
    volatile int flag = 0;

    void ISR() {
        flag = 1;
    }

    int main() {
        while (!flag) {
            // Wait for the interrupt to set flag
        }
    }
    ```
    2. [多線程](https://yuchungchuang.wordpress.com/2018/07/24/c-%E5%A4%9A%E5%9F%B7%E8%A1%8C%E7%B7%923-%E4%BA%92%E6%96%A5%E9%8E%96-mutex/)應用程式中(multi-threaded application) 的全域變數；
    ```c
    volatile int shared_var = 0;

    void* thread_function(void* arg) {
        while (!shared_var) {
            // Busy wait
        }
    }
    ```
    3. [監控某個register](https://newscienceview.blogspot.com/2013/09/c-volatile.html)

## 5.1 考題  
1. 一個參數既可以是const還可以是volatile嗎？解釋為什麼。
2. 一個指針可以是volatile 嗎？解釋為什麼。  
3. 下面的函數有什麼錯誤：
```c
int square(volatile int *ptr)
{return *ptr * *ptr;}
```

Ans:

1. 是的。一個例子是只讀的狀態暫存器。它是volatile因為它可能被意想不到地改變。它是const因為程序不應該試圖去修改它。 或是系統時鐘，易變且唯獨。  
2. 是的。儘管這並不很常見。一個例子是當一個中服務子程序修該一個指向一個buffer的指針時。
3. 由於*ptr指向一個volatile型參數，編譯器將產生類似下面的代碼：

```c
int square(volatile int *ptr){
    int a, b;
    a = *ptr;b = *ptr;
    return a * b;
}
```

由於*ptr的值可能被意想不到地改變，因此a和b可能是不同的。結果，這段代碼可能返不是你所期望的平方值！正確的代碼如下：

```c
long square(volatile int *ptr){
    int a;
    a = *ptr;
    return a * a;
}
```

# 6. Function pointer
用法：
```
int main() {  
int (\*op)(int a, int b); // add, mult are two functions  
op = add;  
printf("op(3,5)=%d\\n", op(3,5)); //8  
op = mult; printf("op(3,5)=%d\\n", op(3,5)); //15}
```

使用情境：具有一樣輸入輸出，有共同的使用時機及規範
舉例：某 BBS 站，決定使用者按鍵的動作就是利用一個 array of FP。例如：
```
KeyFunc keys[MAX_KEYNUM];  // KeyFunc 是一種 FP type
keys['A'] = &keyFuncA;  // 可不寫 &
keys['B'] = &keyFuncB;
```

優點：
1. 靈活性：允許動態選擇和調用不同的函數，增加程式的靈活性。
2. 可讀性和可維護性：可以通過將常見操作抽象化為回調函數，減少重複代碼。
3. 增強的模組化：允許將不同的功能模組化，使代碼更容易維護和擴展。  

缺點：
1. 可讀性：過度使用函數指標可能會使程式碼變得難以理解。
2. 調試困難：因為函數指標在執行時決定要調用的函數，調試時難以追蹤程式的流向。
3. 性能開銷：使用函數指標會引入間接調用的開銷，可能會影響性能。


# 7. Pre-Processor
- #include：在編譯前將指定檔案裡的文字完全複製貼上到 include的地方
- #define：把整份程式碼中的一段特定文字替換
- define example:  
    #define SQR(A) (A)*(A)  
    int a=5;  
    SQR(a++,a++); //30  
    SQR(a+1); //64  
    //即使把變數加上括號還是會有意外錯誤
- #if #elif #else #endif 條件編譯，符合條件才會被編譯  
    -> #if defined(x) 如果x有在macro裡面才會被編譯
- #error: 自訂錯誤訊息，如#ifndef () #error (text) #endif
- #inline：和include一樣複製貼上，但是是把「建議」代入「函式」，編譯器會自行判斷，適用於較小的、頻繁調用的函數，但也可能導致代碼膨脹。過度使用內聯函數可能會導致編譯時間增加。  

|          Define         |        Inline        |     Function     |
|:-----------------------:|:--------------------:|:----------------:|
|       preprocessor      |       compiler       |     compiler     |
|      可能導致檔案大     | 可能導致快取命中率低 | 需要push pop，慢 |
|      No type check      |      Type check      |    Type check    |
| 減少函式呼叫stack的時間 |                      |                  |

# 6. Memory Leak
原因：C沒有garbage collection，導致沒有free掉malloc/calloc的記憶體會持續被佔用。

情境：
1. 單純沒free。
2. *ptr原本指向A，後來指向B卻沒有free A。
3. out of scope (大括弧、迴圈)。

解決：
1. 記得free。 
2. 不修改原始ptr，使用臨時指標存取B
3. 記得free。
4. C++ 11: unique_ptr/shared_ptr/weak_ptr

偵測：使用 Valgrind 等工具偵測。