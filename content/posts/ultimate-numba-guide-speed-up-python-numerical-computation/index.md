---
title: Ultimate Numba Guide Speed Up Python Numerical Computation
date: 2024-10-05T07:07:20+08:00
draft: false
summary: 嘔心瀝血超過萬字的終極 Numba 教學指南，絕對是你在中文圈能找到的最好教學。
description: 嘔心瀝血超過萬字的終極 Numba 教學指南，絕對是你在中文圈能找到的最好教學。坑筆者都踩過了只要照做可以得到最好性能，不會漏掉任何優化可能；除此之外本文第一不廢話，第二上手極快，第三介紹如何除錯和優化，第四補充進階使用方式，第五給出「精選有用的延伸閱讀」，不是給沒用文章，第六也是最重要，筆者可以很自信的說本文是中文圈最詳細教學。
showSummary: true
tags: [程式語言, Python, Numba, 教學]
categories: [程式語言]
series: []
series_order: 
externalUrl: https://docs.zsl0621.cc/docs/python/numba-tutorial-accelerate-python-computing
---

Visit https://docs.zsl0621.cc/docs/python/numba-tutorial-accelerate-python-computing for the best reading experience.

<!-- ultimate-numba-guide-speedup-python-numerical-computation -->
# Ultimate Numba Guide Speed-Up Python Numerical 
# Numba 教學：加速 Python 科學計算

> 你能找到最好的中文教學

鑑於繁體中文資源匱乏，最近剛好又重新看了一下文檔，於是整理資訊分享給大家。本篇的目標讀者是沒學過計算機的初階用戶到中高階用戶都可以讀，筆者能非常肯定的說這篇文章絕對是你能找到最好的教學，本教學覆蓋了除了 CUDA 以外的所有使用方式，對於 CUDA，本文直接提供更好的教學連結。

- **為甚麼選擇此教學**  
    >最快、最正確、最完整[^feature]   
    
    筆者各種坑都踩過了，只要照教學做就可以得到最好性能，不會漏掉**任何**優化可能；除此之外本文第一不廢話，第二上手極快，第三介紹如何除錯和優化，第四補充進階使用方式，第五給出精選的延伸閱讀。

[^feature]: 對於初階使用者，本文明確說明需要閱讀的章節以免模乎焦點；對於中高階使用者，本文對平行化或 vectorize 等高級使用技巧也有詳細說明，保證本文內容絕對正確，對網路文章中的**諸多錯誤**做出勘誤和實測。

- **如何閱讀本文**  
    本文根據官方文檔重新編排，邏輯由常用到少用，使用方式簡單到複雜。  

    不用害怕文章看似很長，初學者只需看<u>基礎使用</u>即可掌握絕大多數使用情境；還要更快再看<u>自動平行化與競爭危害</u>以及<u>其他裝飾器</u>；如果你急到不行，看完<u>一分鐘學會 Numba</u> 後直接看<u>小結</u>。


:::info 寫在前面

不要看 [**舊版**，左上角版本號 0.52](https://numba.pydata.org/) 的文檔！內容缺失，偏偏舊版文檔 Google 搜尋在前面，一不小心就點進去了。

:::

## 簡介：Numba 是什麼？
Numba 是一個針對 Python 數值和科學計算優化的即時編譯器 (JIT compiler)，能顯著提升 Python 執行速度，尤其是涉及大量 Numpy 數學運算的程式。

Python 之所以慢的原因是身為動態語言，在運行時需要額外開銷來進行類型檢查，還需要轉譯成字節碼在虛擬機上執行，更有 GIL 進一步限制效能[^python1][^python2]，於是 Numba 就針對這些問題來解決，以下是他的優化原理：

- 靜態類型推斷：Numba 在編譯時分析程式碼推斷變數類型，避免型別檢查拖累速度。
- 即時編譯：將 Python 函數編譯[^interpret]成針對當前 CPU 架構優化的機器碼，並且以 LLVM 優化效能。
- 向量化：LLVM 架構會調用 SIMD，將操作向量化。
- 平行化：Numba 支援平行運算，還支援使用 CUDA 計算。

[^python1]: [[延伸閱讀](https://medium.com/citycoddee/python%E9%80%B2%E9%9A%8E%E6%8A%80%E5%B7%A7-5-python-%E5%88%B0%E5%BA%95%E6%80%8E%E9%BA%BC%E8%A2%AB%E5%9F%B7%E8%A1%8C-%E7%9B%B4%E8%AD%AF-%E7%B7%A8%E8%AD%AF-%E5%AD%97%E7%AF%80%E7%A2%BC-%E8%99%9B%E6%93%AC%E6%A9%9F%E7%9C%8B%E4%B8%8D%E6%87%82-553182101653)] Python 底層執行方式  
  Python 和 C/C++ 編譯成機器碼後執行不同，需要先直譯 (interprete) 成字節碼 (.pyc)，再經由虛擬機作為介面執行每個字節碼的機器碼，再加上動態語言需要的型別檢查導致速度緩慢。
[^python2]: [延伸閱讀] 全域直譯器鎖 GIL  
  用來限制同一時間內只能有一個執行緒執行 Python 字節碼的機制。Python 內建資料結構如字典等並非線程安全，所以需要 GIL 確保了多執行緒程式的安全性，避免競爭危害，然而也導致了多執行緒程式在工作中的效能低落。

[^interpret]: 實際上 Numba 在首次執行時分析會 Python 的字節碼，並進行 JIT 編譯以了解函式的結構，再使用 LLVM 優化，最後轉換成經過 LLVM 最佳化的機器碼。與原生 Python 相比優化了不使用 Python 字節碼/沒有 Python 內建型別檢查/沒有 Python 虛擬機開銷/多了 LLVM 最佳化的機器碼。首次執行前的分析也就是 Numba 需要熱機的原因，只需分析一次之後都很快。

## 我是否該選擇 Numba？

> Q: [哪些程式適合 Numba](https://numba.readthedocs.io/en/stable/user/5minguide.html#will-numba-work-for-my-code)  

大量包含迴圈的 Numpy 數值運算，且不涉及 I/O 操作，例如 pandas。(If your code is numerically orientated (does a lot of math), uses NumPy a lot and/or has a lot of loops, then numba is often a good choice.)

> Q: Numba 有什麼特點？  

1. 簡單：**只要一行裝飾器**就可以加速程式，也支援**自動平行化**，效能還[優於 Python 層級多線程](/docs/python/numba-tutorial-accelerate-python-computing#自動平行化)。
2. 高效：專為科學計算而生，基於 LLVM 執行速度比其他套件更快。
3. 強大：支援 **CUDA** 以顯示卡執行高度平行化的計算。
4. 通用：除了即時編譯也支援提前編譯，讓程式碼在沒有 Numba 或要求首次執行速度的場景應用。
5. 限制：被設計成和 Numpy 深度協同工作，只支援 Numpy 和 Python 中有限的 methods，使用起來會覺得綁手綁腳，如果遇到不支援的 method 需要繞彎或者手刻[^overload]。

[^overload]: 除了手刻，Numba 提供了一個高階方式讓你[替代不支援的函式](https://numba.pydata.org/numba-doc/dev/extending/overloading-guide.html)，官方範例是使用 `@overload(scipy.linalg.norm)` 替代不支援的 `scipy.linalg.norm`，其中演算法實現使用手刻的 `_oneD_norm_2`，由於太過進階所以本文章跳過這部份（語法不難但是要寫到可以完整替代需要很多心力）。

> Q: 和競爭品如何選擇？  

常見的競爭選項有 Cython、pybind11、Pythran 和 CuPy，我們從特點討論到性能，最後做出結論。

- **特點**
    - Cython：需要學會他的獨特語法，該語法只能用在 Cython。
    - pybind：就是寫 C++。
    - Pythran：和 Numba 接近，但是是提前編譯。
    - Numba：只支援 Numpy，並且有些語法不支援，如 [fft](https://numba.discourse.group/t/rocket-fft-a-numba-extension-supporting-numpy-fft-and-scipy-fft/1657) 和[稀疏矩陣](https://numba-scipy.readthedocs.io/en/latest/reference/sparse.html)。
    - CuPy：為了 Numpy+Scipy 而生的 CUDA 計算套件。

- **效能**   
    從 [Python 加速符文](https://stephlin.github.io/posts/Python/Python-speedup.html) 這篇文章中我們可以看到效能[^1]相差不大，除此之外，你能確定文章作者真的會用該套件嗎[^2]？就像我在寫這篇文章前也不知道 Numba 有這個[魔法](/docs/python/numba-tutorial-accelerate-python-computing#guvectorize)，網路上也幾乎沒有文章提到。  

    所以我們應該考量的是套件是否有限制和可維護性，而不是追求最快的效能，不然一開始就寫 C 不就好了。但是套件的限制在使用之前根本不知道，例如 Numba 不支援稀疏矩陣我也是踩過坑才知道，所以考量就剩下維護性了，而 Numba 在可讀性和偵錯都有很好的表現。
    
    另外與 Numba 相似的 Pythran 搜尋結果只有一萬筆資料，筆者將其歸類為 others，不要折磨自己。

- **結論**  
    經過這些討論我們可以總結成以下
    - Numba：**簡單又快**。適用不會太多程式優化技巧，也不太會用到不支援的函式的用戶。除此之外也支援 CUDA 計算。
    - Cython：麻煩又不見得比較快。最大的優點也是唯一的優點是支援更多 Python 語法，以及你希望對程式有更多控制，Numba 因為太方便所以運作起來也像是個黑盒子，有時你會感到不安心。
    - pybind：極限性能要求。
    - CuPy：大量平行計算，需要 CUDA 計算。

[^1]: 這裡解釋有關效能測試的問題。因為 Numba 支援 LLVM 所以他甚至可以[比普通的 C++ 還快](https://stackoverflow.com/questions/70297011/why-is-numba-so-fast)，所以當文章作者程式碼碰巧對 LLVM 友善時（大多數教學的程式碼都是碰運氣的哪管你友不友善）速度就會變快，反之亦然。也就是說單一項的實驗無法作為代表只能參考，尤其是當函式越簡單，Numba 當然越好優化，該文章的代表性就越低，只是網路文章寫那麼複雜誰看得完，所以也不會有人寫複雜函式來測試。

[^2]: 甚至連 geeksforgeeks 的文章 [Numba vs. Cython: A Technical Comparison](https://www.geeksforgeeks.org/numba-vs-cython-a-technical-comparison/) 都犯了一個最基本的錯誤：把 Numba 初次編譯的時間也算進去，該作者甚至都不覺得 Numba 比 Python 還久很奇怪，這麼大一個組織都錯了，我們還能期望網路上的文章多正確嗎？另外幫大家跑了他的程式，在 colab 上實際運行時間運行執行 1000 次取平均，兩者都是 `1.58ms`，因為他的程式碼簡單到即使 Numba 是自動優化的，也可以編譯出和 Cython 一樣速度的機器碼，除了證實註腳二的猜想，也說明該文章毫無參考價值。

## 基礎使用
說是基礎使用，但是已經包含七成的使用情境。

### 一分鐘學會 Numba

比官方的五分鐘教學又快五倍，夠狠吧。這個範例測試對陣列開根號後加總的速度，比較每個四種方法的運算時間，分別是有沒有使用 Numba 和使用陣列或者迴圈。

```py
import numpy as np
import time
from numba import jit, prange


@jit(nopython=True, fastmath=True, parallel=True, nogil=True)
def numba_loop(arr):
    # Numba + Loop
    bias = 2
    total = 0
    for x in prange(len(arr)):   # Numba likes loops
        total += np.sqrt(x)      # Numba likes numpy
    return bias + total          # Numba likes broadcasting


def python_loop(arr):
    # Python + Loop
    bias = 2
    total = 0.0
    for x in arr:
        total += np.sqrt(x)
    return bias + total


@jit(nopython=True, fastmath=True, parallel=True, nogil=True)
def numba_arr(arr):
    # Numba + Vector
    bias = 2
    return bias + np.sum(np.sqrt(arr))


def python_arr(arr):
    # Python + Vector
    bias = 2
    return bias + np.sum(np.sqrt(arr))


n_runs = 1000
n = 10000000
arr = np.arange(n)

# 第一次運行的初始化，第二次以後才是單純的執行時間
result_python_arr = python_arr(arr)
result_numba_arr = numba_arr(arr)
result_numba = numba_loop(arr)

start = time.time()
result_python = python_loop(arr)
end = time.time()
print(f"Python迴圈版本執行時間: {end - start} 秒")

start = time.time()
result_python_arr = python_arr(arr)
end = time.time()
print(f"Python陣列版本執行時間: {end - start} 秒")

start = time.time()
for _ in range(n_runs):
    result_numba = numba_loop(arr)
end = time.time()
print(f"Numba迴圈版本執行時間: {(end - start)/n_runs} 秒")

start = time.time()
for _ in range(n_runs):
    result_numba_arr = numba_arr(arr)
end = time.time()
print(f"Numba陣列版本執行時間: {(end - start)/n_runs} 秒")

print("Are the outputs equal?", np.isclose(result_numba, result_python))
print("Are the outputs equal?", np.isclose(result_numba_arr, result_python_arr))

# Python迴圈版本執行時間: 9.418870210647583 秒
# Python陣列版本執行時間: 0.021904706954956055 秒
# Numba迴圈版本執行時間: 0.0013016948699951171 秒
# Numba陣列版本執行時間: 0.0024524447917938235 秒
# Are the outputs equal? True
# Are the outputs equal? True
```

這個實驗中我們可以看到使用 Numba 後速度還可以額外接近兩倍，但是也可以發現一個有趣的事實：「迴圈版本比陣列版本更快」，這引導我們到第一個重點 **Numba likes loops**，他還喜歡的另外兩個是 **Numpy** 和 **matrix broadcasting**。

兩兩比對函式差異可以看到使用方式很簡單，在要優化的函式前加上 `@jit` 裝飾器，接著在要平行化處理的地方顯式的改為 prange 就完成了。裝飾器的選項[有以下幾個](https://numba.readthedocs.io/en/stable/user/jit.html#compilation-options)：

| 參數      | 說明                                                      |
|----------|-----------------------------------------------------------|
| nopython | 是否嚴格忽略 Python C API。<br/>此參數是整篇文章中影響速度最大的因素，使用 @njit 等價於啟用此參數              |
| fastmath | 是否放寬 IEEE 754 的精度限制以獲得額外性能                     |
| cache    | 是否將編譯結果寫入快取，避免每次呼叫 Python 程式時都需要編譯      |
| parallel | 是否使用平行運算                                             |
| nogil    | 是否關閉全局鎖                                              |

<br/>
<br/>

:::info 安全性提醒

1. fastmath: 測試時使用，離正式生產越近越該關閉。
2. 依筆者個人使用 fastmath/nogil 並沒有快多少，當然這是 case-specific，像文檔的範例就有差。
3. numba 每次編譯後全域變數會變為常數，在程式中修改該變數不會被函式察覺。

:::


:::danger 安全性警告！

**對於暫時不想處理競爭危害的用戶，請先不要使用 `parallel` `nogil` 方法。**
1. parallel/nogil: 小心[競爭危害](https://zh.wikipedia.org/zh-tw/%E7%AB%B6%E7%88%AD%E5%8D%B1%E5%AE%B3) (race condition)。簡單說明競爭危害，就是兩個線程一起處理一個運算 `x += 1`，兩個一起取值，結果分別寫回 x 的值都是 `x+1` 導致最終結果是 `x+1` 而不是預期的 `x+2`。
2. 雖然上面的範例顯示結果一致，但還是一定要 **避免任何可能的多線程問題！**

:::

<br/>

### 進一步優化效能
基礎使用章節已經包含官方文檔中所有效能優化技巧，只是沒有每個選項[各自對比](https://numba.readthedocs.io/en/stable/user/performance-tips.html#intel-svml)，這裡補充其他效能優化方式。

1. 安裝 SVML (short vector math library), threading layers (平行計算, tbb/omp)，安裝後不需設定，Numba 會自行調用[^3]

[^3]: 為甚麼敢說本篇是最正確的教學，對於其他文章我就問一句話， **效能測試時有裝 SVML 嗎？** 這甚至都不用設定就可以帶來極大幅度的效能提升，但是我從來沒看過有人提到過，哪有人做 benchmark 不說明環境的，那肯定是作者自己也不知道就開始蝦寫一通。

```sh
# conda
conda install intel-cmplr-lib-rt
conda install tbb
conda install anaconda::intel-openmp

# pip
pip install intel-cmplr-lib-rt
pip install tbb
pip install intel-openmp

# Troubleshooting: 沒有發現 SVML 的解決方式
# https://github.com/numba/numba/issues/4713#issuecomment-576015588
# numba -s   # 檢查是否偵測到 SVML
# sudo pip3 install icc_rt; sudo ldconfig
```

2. 使用 `@vectorize` 或 `@guvectorize`  
    恭喜你看到這裡，這是隱藏密技中文教學幾乎沒人提到[^vectorize]，vectorize 除了支援 ufunc 以外還可以**大幅提升效能**，使用方式請見[下方說明](/docs/python/numba-tutorial-accelerate-python-computing#guvectorize)。

[^vectorize]: 就算有提到的也亂講一通，拿計算是 if 邏輯判斷說 vectorize 優化程度比 njit 還小，是在搞笑嗎？請記得 Numba 的優化方式：去掉型別檢查，使用 LLVM 優化機器碼，使用 SIMD 加速計算，支援自動優化的平行化計算，拿 if 測試幾乎沒有使用到 Numba 的特性。

3. 使用 Numba 反而變慢
    - 別忘了扣掉首次執行需要消耗的編譯時間。
    - 檢查 I/O 瓶頸，不要放任何需要 I/O 的程式碼在函式中。
    - 總計算量太小。
    - 宣告後就不要修改矩陣維度或型別。
    - 語法越簡單越好，不要使用任何各種包裝，因為你不知道 Numba 是否支援。
    - 記憶體問題 [The wrong way to speed up your code with numba](https://pythonspeed.com/articles/slow-numba/)。

4. [threading layers 設定平行計算方式](https://numba.readthedocs.io/en/stable/user/threading-layer.html)
    - `default` provides no specific safety guarantee and is the default.
    - `safe` is both fork and thread safe, this requires the tbb package (Intel TBB libraries) to be installed.
    - `forksafe` provides a fork safe library.
    - `threadsafe` provides a thread safe library.
    <br/>

    ```py
    # 設定只使用兩個線程執行，此指令等效於 NUMBA_NUM_THREADS=2
    # 在某些情形下應該設定為較低的值，以便 numba 可以與更高層級的平行性一起使用。
    # 但是文檔沒有說是哪些情形
    set_num_threads(2)
    sen: %s" % threading_layer())
    ```

讀到這裡你已經學會基礎的使用方式，能夠簡單的使用 Numba。如果有競爭危害的知識再開啟自動平行化功能，否則請務必關閉以免跑很快但全錯。

### 如何除錯
Numba 官方文檔有如何除錯的詳細教學，使用 `@jit(debug=True)`，詳情請見 [Troubleshooting and tips](https://numba.readthedocs.io/en/stable/user/troubleshoot.html)。

另外一個是筆者的土砲方法，當年在寫 Numba 在出現錯誤時 Numba 的報錯資訊不明確，那時的土砲方法是「找到錯誤行數的方式是二分法直接刪程式碼到 Numba 不報錯」

錯誤通常來自於使用 Numba 不支援的函式，除錯請先看函式是否支援以免當冤大頭，再來就是檢查變數型別錯誤，例如誤用不支援相加的不同的變數型別。

- [Supported Python features](https://numba.readthedocs.io/en/stable/reference/pysupported.html)
- [Supported NumPy features](https://numba.readthedocs.io/en/stable/reference/numpysupported.html)


### 小結
1. Numba likes loops 在心裡默念十次
2. Numba likes NumPy functions
3. Numba likes NumPy broadcasting
4. 不要在函式內修改數據結構
5. 保持順序記憶體讀取
6. 函式中不要包含 I/O 操作
7. 所有優化方式都是 case-specific，不能說 parallel 優化幅度一定很小或者 njit 一定很快，一切取決於被編譯的程式碼如何設計，如果 njit 很慢就試試看開關選項，或者嘗試 guvectorize。
8. ***還是 Numba likes loops***

到這裡就結束基本使用了，建議先不要看進階使用，而是跳到 [See Also](/docs/python/numba-tutorial-accelerate-python-computing#see-also) 看延伸閱讀。

---

## 自動平行化與競爭危害
本章節整理自官方文檔 [Automatic parallelization with @jit](https://numba.readthedocs.io/en/stable/user/parallel.html#)，閱讀本章節前請先確保你對競爭危害有一定程度的理解，否則請跳過本章節，並且**不要開啟 parallel 和 nogil 功能**。

### 自動平行化

> 設定 Numba 自動平行化的官方文檔，由於很精練，知識也很重要，所以翻譯完貼在這裡。  
> 簡單來說，網路上手刻平行化的人連文檔都沒看就開始亂寫文章了。Numba 支援自動平行化，並且快取優化更好，手刻沒有任何好處。

在 `jit()` 函式中設置 `parallel` 選項，可以啟用 Numba 的轉換過程，嘗試自動平行化函式（或部分函式）以執行其他優化。目前此功能僅適用於CPU。

一些在用戶定義的函式中執行的操作（例如對陣列加上純量）已知具有平行語義。用戶的程式碼可能包含很多這種操作，雖然每個操作都可以單獨平行化，但這種方法通常會因為快取行為不佳而導致性能下降。相反地，通過自動平行化，Numba 會嘗試識別用戶程式碼中的這類操作並將相鄰的操作合併到一起，形成一個或多個自動平行執行的 kernels。這個過程是完全自動的，無需修改用戶程式碼，這與 Numba 的 `vectorize()` 或 `guvectorize()` 機制形成對比，後者需要手動創建並行 kernels。


- [**支援的運算符**](https://apachecn.github.io/numba-doc-zh/#/docs/21?id=_1101%e3%80%82%e6%94%af%e6%8c%81%e7%9a%84%e6%93%8d%e4%bd%9c)  
此處列出所有帶有平行化語義的運算符，Numba 會試圖平行化這些運算。

:::note Reduction 翻譯

中文文檔翻譯錯誤，這裡的 reduction 分為兩種情況，一是平行化處理的術語 parallel reduction [^reduction1] [^reduction2]，指的是「將各個執行緒的變數寫回主執行緒」，二是減少，代表該函式降低輸入維度，全部翻譯成減少顯然語意錯誤。

[^reduction1]: [平行程式設計的簡單範例](https://datasciocean.tech/others/parallel-programming-example/)
[^reduction2]: [Avoid Race Condition in Numba](https://stackoverflow.com/questions/61372937/avoid-race-condition-in-numba)
:::

- **顯式的標明平行化的迴圈**  
使用 `prange` 取代 `range` 顯式的標明平行化的迴圈，對於多個巢狀的 `prange` 只會平行化最外層的迴圈，在裝飾器中設定 `parallel=False` 也會導致 `prange` 回退為一般的 `range`。

### 競爭危害
這裡展示競爭危害的範例和解決方式，顯示出競爭危害的存在，請不要錯誤的推斷為 scalar 運算可以避免而 vector 運算不行，**任何時候我們都應該避免競爭危害的可能**。那我們就不能寫 for 迴圈了嗎？其實有其他方法，例如這下面的解決方式和正確使用範例。

<!-- <details>
<summary>競爭危害範例</summary> -->

<Tabs>
  <TabItem value="1" label="發生競爭危害的範例">

```py
from numba import njit, prange
import numpy as np


@njit(parallel=True)
def prange_wrong_result_numba(x):
    n = x.shape[0]
    y = np.zeros(4)
    for i in prange(n):
        # 一般的矩陣相加，會造成競爭危害
        y[:] += x[i]
    return y


@njit(parallel=True)
def prange_wrong_result_mod_numba(x):
    n = x.shape[0]
    y = np.zeros(4)
    for i in prange(n):
        # 優化後的矩陣相加，嘗試利用不同的 i 取餘數避免競爭危害，仍舊失敗
        y[i % 4] += x[i]
    return y


# 沒有加上裝飾器的版本
def prange_wrong_result_python(x):
    n = x.shape[0]
    y = np.zeros(4)
    for i in range(n):
        y[:] += x[i]
    return y


# 沒有加上裝飾器的版本
def prange_wrong_result_mod_python(x):
    n = x.shape[0]
    y = np.zeros(4)
    for i in range(n):
        y[i % 4] += x[i]
    return y


# 提醒：使用浮點數測試時因浮點數特性每次計算結果都會有誤差，所以比較時應該使用整數測試
x = np.random.randint(-10, 100, size=1000000)

result_numba = prange_wrong_result_numba(x)
result_python = prange_wrong_result_python(x)
print("Are the outputs equal?", np.array_equal(result_numba, result_python))

result_numba_mod = prange_wrong_result_mod_numba(x)
result_python_mod = prange_wrong_result_mod_python(x)
print("Are the outputs equal?", np.array_equal(result_numba_mod, result_python_mod))

# 輸出

# Are the outputs equal? False
# Are the outputs equal? False
```
</TabItem>

  <TabItem value="2" label="解決方式">

```py
from numba import njit, prange
import numpy as np


@njit(parallel=True)
def prange_ok_result_whole_arr(x):
    n = x.shape[0]
    y = np.zeros(4)
    for i in prange(n):
        # "whereas performing a whole array reduction is fine" 節錄自官方文檔
        y += x[i]
    return y


@njit(parallel=True)
def prange_ok_result_outer_slice(x):
    n = x.shape[0]
    y = np.zeros(4)
    z = y[:]
    for i in prange(n):
        # "as is creating a slice reference outside of the parallel reduction loop" 節錄自官方文檔
        z += x[i]
    return y


# 沒有加上裝飾器的版本
def prange_ok_result_whole_arr_python(x):
    n = x.shape[0]
    y = np.zeros(4)
    for i in prange(n):
        y += x[i]
    return y


# 沒有加上裝飾器的版本
def prange_ok_result_outer_slice_python(x):
    n = x.shape[0]
    y = np.zeros(4)
    z = y[:]
    for i in prange(n):
        z += x[i]
    return y


# 提醒：使用浮點數測試時因浮點數特性每次計算結果都會有誤差，所以比較時應該使用整數測試
x = np.random.randint(-10, 100, size=(1000000, 4))

result_numba_whole_arr = prange_ok_result_whole_arr(x)
result_python_whole_arr = prange_ok_result_whole_arr_python(x)
print("Are the outputs equal?", np.array_equal(result_numba_whole_arr, result_python_whole_arr))

result_numba_outer_slice = prange_ok_result_outer_slice(x)
result_python_outer_slice = prange_ok_result_outer_slice_python(x)
print("Are the outputs equal?", np.array_equal(result_numba_outer_slice, result_python_outer_slice))

# 輸出

# Are the outputs equal? True
# Are the outputs equal? True
```

</TabItem>


  <TabItem value="3" label="正確使用範例">

```py
from numba import njit, prange
import numpy as np

@njit(parallel=True)
def prange_test(A):
    s = 0
    # Without "parallel=True" in the jit-decorator
    # the prange statement is equivalent to range
    for i in prange(A.shape[0]):
        s += A[i]
    return s

@njit(parallel=True)
def two_d_array_reduction_prod(n):
    shp = (13, 17)
    result1 = 2 * np.ones(shp, np.int_)
    tmp = 2 * np.ones_like(result1)

    for i in prange(n):
        result1 *= tmp

    return result1


n = 100000
A = np.random.randint(-5, 10, size=n)
result_numba_test = prange_test(A)
result_python_test = sum(A)
print("Are the outputs equal?", np.array_equal(result_numba_test, result_python_test))

result_numba_prod = two_d_array_reduction_prod(n)
result_python_prod = np.power(2, n) * np.ones((13, 17), dtype=np.int_)
print("Are the outputs equal?", np.array_equal(result_numba_prod, result_python_prod))

# 輸出

# Are the outputs equal? True
# Are the outputs equal? True
```

</TabItem>


</Tabs>

<!-- </details> -->

:::info 迴圈出口

`prange` 不支援多個出口的迴圈，例如迴圈中間包含 `assert`。

:::

:::warning 迴圈變數隱性轉型

關閉平行化處理時迴圈變數 (induction variable) 沒有問題，和 Python 預設一樣使用有號整數。然而如果開啟平行化且範圍可被識別為嚴格正數，則會被自動轉型為 `uint64`，而 `uint64` 和其他變數計算時**有機會不小心的返回一個浮點數**。

:::



### 平行化的優化技巧

介紹如何撰寫迴圈才可使 Numba 加速最大化的技巧。

1. **迴圈融合 (Loop Fusion)：** 將相同迴圈邊界的迴圈合併成一個大迴圈，提高資料局部性進而提升效能。
2. **迴圈序列化 (Loop Serialization)：** Numba 不支援巢狀平行化，當多個 `prange` 迴圈嵌套時只有最外層的 `prange` 迴圈會被平行化，內層的 `prange` 迴圈會被視為普通的 `range` 執行。
3. **提出不變的程式碼 (Loop Invariant Code Motion)：** 將不影響迴圈結果的語句移到迴圈外。
4. **分配外提 (Allocation Hoisting)**：範例是拆分 `np.zeros` 成 `np.empty` 和 `temp[:] = 0` 避免重複初始化分配。

進一步優化：使用診斷功能，請見 [Diagnostics your parallel optimization](https://numba.readthedocs.io/en/stable/user/parallel.html#diagnostics)。

## 進階使用

```sh
# 這是用來阻止你繼續讀的 placeholder！
 _   _                       _             
| \ | |  _   _   _ __ ___   | |__     __ _ 
|  \| | | | | | | '_ ` _ \  | '_ \   / _` |
| |\  | | |_| | | | | | | | | |_) | | (_| |
|_| \_|  \__,_| |_| |_| |_| |_.__/   \__,_|

```
除非你是進階用戶，否則 **你不應該看進階使用章節！** 看了反而模糊焦點，你應該把握好如何基礎使用，基礎使用已經包含了七成以上的使用情景。

進階使用裡面就只有 [使用字典傳遞參數](/docs/python/numba-tutorial-accelerate-python-computing#numbatypeddict) 和 [vectorize 裝飾器](/docs/python/numba-tutorial-accelerate-python-computing#vectorize) 可以先偷看。

### 使用 CUDA 加速運算
[官方文檔](https://numba.readthedocs.io/en/stable/cuda/overview.html)

優化 CUDA 不像優化 CPU 加上裝飾器那麼簡單，而是要針對 CUDA 特別寫函式，導致程式只能在 GPU 上跑，所以筆者目前還沒寫過，不過基本注意事項一樣是注意 IO、工作量太小的不適合 CUDA。那比較什麼函式適合 CPU 而不是 CUDA 呢？

1. **順序處理而不是平行處理**，影像處理以外的演算法大概都是這類
2. 記憶體超過顯卡記憶體上限（註：不應該寫出這種程式，Numba likes loops）
3. 大量分支處理 (if-else)（註：不應該寫出這種程式，尤其在 Numba 中）
4. 顯卡雙精度浮點運算效能差，深度學習和遊戲都吃單精度，但是科學計算需要雙精度，我們又只能買到遊戲卡
5. 一些 library 只支援 CPU，這要試了才知道

如果你需要使用 CUDA，這裡也有好用的指南連結：

- [28000x speedup with numba.CUDA](https://curiouscoding.nl/posts/numba-cuda-speedup/)：使用 CUDA 加速並且有完整的對比。  
- [用 numba 學 CUDA! 從入門到精通 (上)](https://medium.com/@spacetime0311/%E7%94%A8-numba-%E5%AD%B8-cuda-%E5%BE%9E%E5%85%A5%E9%96%80%E5%88%B0%E7%B2%BE%E9%80%9A-%E4%B8%8A-ede7b381f6c7)
- [用 numba 學 CUDA! 從入門到精通 (下)](https://medium.com/@spacetime0311/%E7%94%A8-numba-%E5%AD%B8-cuda-%E5%BE%9E%E5%85%A5%E9%96%80%E5%88%B0%E7%B2%BE%E9%80%9A-%E4%B8%8B-770c11bffd37)


### 使用字典傳遞參數
[官方文檔](https://numba.readthedocs.io/en/stable/reference/pysupported.html#typed-dict)

作為數值模擬我們一定會遇到參數量超多的問題，numba 其實支援[用字典傳遞參數](https://stackoverflow.com/questions/55078628/using-dictionaries-with-numba-njit-function)。


### Signature
[官方文檔](https://numba.readthedocs.io/en/stable/reference/types.html)

顯式的告訴 numba 型別，用於輸入維度可變，或者使用 AoT 編譯等，有標示對也不會比較快。[可用的 signature 列表](https://numba.readthedocs.io/en/stable/reference/types.html#numbers)。

- [輸入維度可變](https://stackoverflow.com/questions/66205186/python-signature-with-numba)，包含 guvectorize 和 [jitclass](https://numba.readthedocs.io/en/stable/user/jitclass.html)
- [AoT 編譯](https://numba.readthedocs.io/en/stable/user/pycc.html#limitations): 限制需要顯式指定 signature


<details>
<summary>簡單的 Numba signature 範例和效能測試</summary>

這裡的結果很奇怪，我預期速度應該是差不多，結果反而顯式比較慢。測試在 apple M1 和 Google Colab 都一樣。

```py
import numpy as np
import numba as nb
import time


# 使用顯式 signature
@nb.jit("float64[:](float64[:], float64[:])", nopython=True)
def add_and_sqrt(x, y):
    result = np.empty_like(x)
    for i in range(len(x)):
        result[i] = np.sqrt(x[i] + y[i])
    return result


# 不使用顯式 signature
@nb.jit(nopython=True)
def add_and_sqrt_no_sig(x, y):
    result = np.empty_like(x)
    for i in range(len(x)):
        result[i] = np.sqrt(x[i] + y[i])
    return result


# 測試函數
def test_function(func, x, y, num_runs=1000):
    start_time = time.time()
    for _ in range(num_runs):
        _ = func(x, y)
    end_time = time.time()
    return (end_time - start_time) / num_runs


if __name__ == "__main__":
    x = np.random.random(100000)
    y = np.random.random(100000)

    _ = add_and_sqrt(x, y)
    _ = add_and_sqrt_no_sig(x, y)

    time_with_sig = test_function(add_and_sqrt, x, y)
    time_without_sig = test_function(add_and_sqrt_no_sig, x, y)

    print(f"使用顯式 signature 的平均執行時間: {time_with_sig:.6f} 秒")
    print(f"不使用顯式 signature 的平均執行時間: {time_without_sig:.6f} 秒")
    print(f"性能差異: {abs(time_with_sig - time_without_sig) / time_without_sig * 100:.2f}%")

    result_with_sig = add_and_sqrt(x, y)
    result_without_sig = add_and_sqrt_no_sig(x, y)
    print(f"結果是否相同: {np.allclose(result_with_sig, result_without_sig)}")

# 使用顯式 signature 的平均執行時間: 0.000104 秒
# 不使用顯式 signature 的平均執行時間: 0.000052 秒
# 性能差異: 99.58%
# 結果是否相同: True
```

</details>

<details>
<summary>複雜的 Numba signature 範例</summary>

修改自 https://stackoverflow.com/questions/30363253/multiple-output-and-numba-signatures 

```py
import numpy as np
import numba as nb

# 輸入兩個一維浮點數陣列，返回兩個一維浮點數陣列
@nb.jit(nb.types.UniTuple(nb.float64[:], 2)(nb.float64[:], nb.float64[:]), nopython=True)
def homogeneous_output(a, b):
    return np.sqrt(a), np.sqrt(b)

# 字串表示
@nb.jit('UniTuple(float64[:], 2)(float64[:], float64[:])', nopython=True)
def homogeneous_output_str(a, b):
    return np.sqrt(a), np.sqrt(b)

# 異質類型返回值
@nb.jit(nb.types.Tuple((nb.float64[:], nb.float64[:,:]))(nb.float64[:], nb.int64[:,:]), nopython=True)
def heterogeneous_output(a, b):
    return np.sqrt(a), b.astype(np.float64)

# 使用字串表示
@nb.jit('Tuple((float64[:], float64[:,:]))(float64[:], int64[:,:])', nopython=True)
def heterogeneous_output_str(a, b):
    return np.sqrt(a), b.astype(np.float64)

if __name__ == "__main__":
    a = np.array([1., 4., 9., 16.], dtype=np.float64)
    b = np.array([25., 36., 49., 64.], dtype=np.float64)
    c = np.array([[1, 2], [3, 4]], dtype=np.int64)

    # 測試同質類型輸出
    result1, result2 = homogeneous_output(a, b)
    print("同質類型輸出 (使用 nb.types):")
    print("結果 1:", result1)
    print("結果 2:", result2)

    result1, result2 = homogeneous_output_str(a, b)
    print("\n同質類型輸出 (使用字符串):")
    print("結果 1:", result1)
    print("結果 2:", result2)

    # 測試異質類型輸出
    result3, result4 = heterogeneous_output(a, c)
    print("\n異質類型輸出 (使用 nb.types):")
    print("結果 3:", result3)
    print("結果 4:\n", result4)

    result3, result4 = heterogeneous_output_str(a, c)
    print("\n異質類型輸出 (使用字符串):")
    print("結果 3:", result3)
    print("結果 4:\n", result4)
```

</details>


### 其他裝飾器
常見裝飾器有

- vectorize
- guvectorize
- jitclass
- stencil

#### vectorize
[官方文檔](https://numba.readthedocs.io/en/stable/user/vectorize.html#the-vectorize-decorator)

:::tip 恭喜！

看到這裡你已經比 99% 的 Numba 中文用戶更熟悉這個套件了，因為根本沒有中文文章提到這裡。  
（提到但是講錯的不算，你別說，講錯的還不少。）

:::

`vectorize` 允許把 scalar 輸入的函式當作向量 [Numpy ufunc](http://docs.scipy.org/doc/numpy/reference/ufuncs.html) 使用。官方文檔花了很大的篇幅在描述該方法可以簡單的建立 Numpy ufunc 函式，因為[傳統方法](https://numpy.org/devdocs/user/c-info.ufunc-tutorial.html)需要寫 C 語言。對於效能，文檔很帥氣的輕描淡寫了一句話：

> Numba will generate the surrounding loop (or kernel) allowing efficient iteration over the actual inputs.

官網對 `@jit` 的優化專門使用寫了一整篇文章，在這裡只講一句話看起來好像效能不是重點，然而[根據此文章](https://medium.com/@mflova/making-python-extremely-fast-with-numba-advanced-deep-dive-2-3-f809b43f8300)，使用 vectorize 速度比起 `@jit` 又額外快了 20 倍，根據他的解釋 `vectorize` 會告訴額外訊息給 LLVM，於是 LLVM 就可以藉此使用 CPU 的平行運算指令集 SIMD。

此方法的限制是輸入和輸出都只能是 scalar 不能是向量，建議把這個方法單純用作加速使用，拿他當 ufunc 用不好懂，你看著一個函式會想說這方法從哪來的，別人不好理解程式碼，IDE 也會跳警告。

這裡是基礎使用範例，效能測試我們放到下面強化版的 `guvectorize`：
```py
# Edit from: https://github.com/numba/numba/blob/main/numba/tests/doc_examples/test_examples.py
# test_vectorize_multiple_signatures
from numba import vectorize
import numpy as np

@vectorize(["int32(int32, int32)",
            "int64(int64, int64)",
            "float32(float32, float32)",
            "float64(float64, float64)"])
def f(x, y):
    return x + y

a = np.arange(6)
result = f(a, a)
# result == array([ 0,  2,  4,  6,  8, 10])

correct = np.array([0, 2, 4, 6, 8, 10])
np.testing.assert_array_equal(result, correct)

a = np.linspace(0, 1, 6)
result = f(a, a)
# Now, result == array([0. , 0.4, 0.8, 1.2, 1.6, 2. ])

correct = np.array([0., 0.4, 0.8, 1.2, 1.6, 2. ])
np.testing.assert_allclose(result, correct)

a = np.arange(12).reshape(3, 4)
# a == array([[ 0,  1,  2,  3],
#             [ 4,  5,  6,  7],
#             [ 8,  9, 10, 11]])

result1 = f.reduce(a, axis=0)
print(result1)
# result1 == array([12, 15, 18, 21])

result2 = f.reduce(a, axis=1)
print(result2)
# result2 == array([ 6, 22, 38])

result3 = f.accumulate(a)
print(result3)
# result3 == array([[ 0,  1,  2,  3],
#                   [ 4,  6,  8, 10],
#                   [12, 15, 18, 21]])

result4 = f.accumulate(a, axis=1)
print(result4)
```

#### guvectorize
[官方文檔](https://numba.readthedocs.io/en/stable/user/vectorize.html#the-guvectorize-decorator)

generalized universal functions，強化版的 vectorize，允許輸入是任意數量的 ufunc 元素，接受任意形狀輸入輸出的元素。黑魔法又來了，這裡官方仍舊沒有描述效能，然而根據 [Making Python extremely fast with Numba: Advanced Deep Dive (3/3)](https://medium.com/@mflova/making-python-extremely-fast-with-numba-advanced-deep-dive-3-3-695440b62030) 的測試，`guvectorize` 竟然還能比 `vectorize` 再快六倍。

:::note 參數語法

guvectorize 和 vectorize 的 parallel 語法是 `target="option"`，選項有 cpu, parallel 和 cuda 三種。

如果測試數據太小 parallel 和 cuda 性能反而會下降，因為才剛搬東西到記憶體就結束了。官方給出的建議是使用 parallel 數據至少大於 1KB，至於 cuda 那肯定要再大更多。

:::

這裡附上使用範例和效能測試

<Tabs>

  <TabItem value="1" label="命名方式示範">

    ```py
    # 以矩陣相乘示範 guvectorize 的命名語法
    from numba import guvectorize, prange
    import numpy as np
    import time


    # vanilla guvectorize
    # tuple 第一項設定輸入
    # 輸入：在 list 中設定選項，這裡可接受四種類型的輸入，型別設定分別是 "輸入, 輸入, 輸出"
    # 輸入 "C"：guvectorize 不需要 return，而是把回傳值直接寫入輸入矩陣 C
    # 輸出：只需定義維度 (m,n),(n,p)->(m,p)
    @guvectorize(
        [
            "float64[:,:], float64[:,:], float64[:,:]",
            "float64[:,:], float64[:,:], float64[:,:]",
            "int32[:,:], int32[:,:], int32[:,:]",
            "int64[:,:], int64[:,:], int64[:,:]",
        ],
        "(m,n),(n,p)->(m,p)",
    )
    def matrix_multiply(A, B, C):
        m, n = A.shape
        n, p = B.shape
        for i in range(m):
            for j in range(p):
                C[i, j] = 0
                for k in range(n):
                    C[i, j] += A[i, k] * B[k, j]


    # guvectorize with prange
    # 測試 nopython, parallel
    @guvectorize(
        [
            "float64[:,:], float64[:,:], float64[:,:]",
            "float64[:,:], float64[:,:], float64[:,:]",
            "int32[:,:], int32[:,:], int32[:,:]",
            "int64[:,:], int64[:,:], int64[:,:]",
        ],
        "(m,n),(n,p)->(m,p)",
        nopython=True,
        target="parallel",
    )
    def matrix_multiply_prange(A, B, C):
        m, n = A.shape
        n, p = B.shape
        for i in prange(m):
            for j in range(p):
                C[i, j] = 0
                for k in range(n):
                    C[i, j] += A[i, k] * B[k, j]


    def run_benchmark():
        n_runs = 1
        N = 100
        A = np.random.rand(N, N).astype(np.float64)
        B = np.random.rand(N, N).astype(np.float64)
        res_python = A @ B

        start = time.time()
        for _ in range(n_runs):
            C = np.empty((N, N), dtype=np.float64)
            matrix_multiply(A, B, C)
            print("Are the results the same?", np.allclose(C, res_python))
        end = time.time()
        print("Without prange: Total time for {} runs: {:.4f} seconds".format(n_runs, end - start))

        start = time.time()
        for _ in range(n_runs):
            C_prange = np.empty((N, N), dtype=np.float64)
            matrix_multiply_prange(A, B, C_prange)
            print("Are the results the same?", np.allclose(C_prange, res_python))
        end = time.time()
        print("With prange: Total time for {} runs: {:.4f} seconds".format(n_runs, end - start))

    run_benchmark()

    # Are the results the same? True
    # Without prange: Total time for 1 runs: 0.0012 seconds
    # Are the results the same? True
    # With prange: Total time for 1 runs: 0.0012 seconds
    ```

</TabItem>

<TabItem value="2" label="測試矩陣相乘">

程式碼來自於 [Dask + Numba for Efficient In-Memory Model Scoring](https://medium.com/capital-one-tech/dask-numba-for-efficient-in-memory-model-scoring-dfc9b68ba6ce)。

    ```py
    # 測試矩陣相乘的效能
    import numpy as np
    import time
    from numba import njit, guvectorize, prange

    n = 250000
    x = np.random.poisson(lam=5, size=n)
    y, z = np.random.normal(size=(n, 2)).T
    overlay = False
    n_runs = 100
    res = np.zeros((n, 15))


    # 原始Python版本
    def python_func(x, y, z, overlay=False):
        out = np.zeros((x.shape[0], 15))
        adj = 1.5 if overlay else 1.0
        for t in range(15):
            out[:, t] = t * x**2 + y - 2 * z - 2 * t
        return adj * out


    # @njit 優化版本
    @njit
    def jitted_func(x, y, z, overlay=False):
        out = np.zeros((x.shape[0], 15))
        adj = 1.5 if overlay else 1.0
        for t in range(15):
            out[:, t] = t * x**2 + y - 2 * z - 2 * t
        return adj * out


    # @njit + signature 優化版本
    @njit("float64[:,:](int64[:], float64[:], float64[:], boolean)")
    def jitted_func_with_signature(x, y, z, overlay=False):
        out = np.zeros((x.shape[0], 15))
        adj = 1.5 if overlay else 1.0
        for t in range(15):
            out[:, t] = t * x**2 + y - 2 * z - 2 * t
        return adj * out


    # @guvectorize 優化版本
    @guvectorize(
        "i8, f8, f8, b1, f8[:], f8[:]",
        "(), (), (), (), (specifySameDimension) -> (specifySameDimension)",
    )
    def fast_predict_over_time(x, y, z, overlay, _, out):
        adj = 1.5 if overlay else 1.0
        for t in range(len(out)):
            out[t] = adj * (t * x**2 + y - 2 * z - 2 * t)


    # 初始化編譯
    res_python = python_func(x, y, z, overlay)
    res_jitted = jitted_func(x, y, z, overlay)
    res_jitted_signature = jitted_func_with_signature(x, y, z, overlay)
    res_fast_pred = fast_predict_over_time(x, y, z, overlay, res)

    # 1. 測試原始Python版本
    start_time = time.time()
    for _ in range(n_runs):
        _ = python_func(x, y, z, overlay)
    end_time = time.time()
    print(f"Time: {(end_time - start_time) / n_runs:.6f} seconds, pure Python")

    # 2. 測試 @njit 優化版本
    start_time = time.time()
    for _ in range(n_runs):
        _ = jitted_func(x, y, z, overlay)
    end_time = time.time()
    print(f"Time: {(end_time - start_time) / n_runs:.6f} seconds, pure @njit")

    # 3. 測試 @njit + signature 優化版本
    start_time = time.time()
    for _ in range(n_runs):
        _ = jitted_func_with_signature(x, y, z, overlay)
    end_time = time.time()
    print(f"Time: {(end_time - start_time) / n_runs:.6f} seconds, @njit with signature")

    # 4. 測試 @guvectorize 優化版本
    start_time = time.time()
    for _ in range(n_runs):
        _ = fast_predict_over_time(x, y, z, overlay, res)
    end_time = time.time()
    print(f"Time: {(end_time - start_time) / n_runs:.6f} seconds, @guvectorize")

    print("Are the results the same?", np.array_equal(res_python, res_fast_pred))
    print("Are the results the same?", np.array_equal(res_python, res_jitted_signature))

    # Time: 0.039077 seconds, pure Python
    # Time: 0.027496 seconds, pure @njit
    # Time: 0.027633 seconds, @njit with signature
    # Time: 0.005587 seconds, @guvectorize
    # Are the results the same? True
    # Are the results the same? True
    ```
</TabItem>

<TabItem value="3" label="測試邏輯迴歸">

這是[官方文檔的範例](https://numba.readthedocs.io/en/stable/user/parallel.html#examples)，說明不要用 `guvectorize`，會把簡單的程式碼展開到很複雜，讓我意外的是 `guvectorize` 速度比 `njit` 慢。

    ```py
    # 測試邏輯回歸的效能
    import time
    import numpy as np
    from numba import guvectorize, njit, prange


    # Python
    def logistic_regression_py(Y, X, w, iterations):
        for i in range(iterations):
            w -= np.dot(((1.0 / (1.0 + np.exp(-Y * np.dot(X, w))) - 1.0) * Y), X)
        return w


    # njit
    @njit(parallel=True)
    def logistic_regression_njit(Y, X, w, iterations):
        for _ in prange(iterations):
            w -= np.dot(((1.0 / (1.0 + np.exp(-Y * np.dot(X, w))) - 1.0) * Y), X)
        return w


    # guvectorize
    @guvectorize(
        ["void(float64[:], float64[:,:], float64[:], int64, float64[:])"],
        "(n),(n,m),(m),()->(m)",
        nopython=True,
        target="parallel",
    )
    def logistic_regression_guvec(Y, X, w, iterations, result):
        for i in prange(iterations):
            temp = np.zeros_like(w)
            for j in range(X.shape[0]):
                dot_product = np.dot(X[j].copy(), w.copy())
                sigmoid = 1.0 / (1.0 + np.exp(-Y[j] * dot_product))
                temp += (sigmoid - 1.0) * Y[j] * X[j]
            w -= temp / X.shape[0]


    np.random.seed(0)
    Y = np.abs(np.random.randn(4000))
    X = np.abs(np.random.randn(4000, 10))
    w = np.abs(np.random.randn(10))
    iterations = 100
    n_runs = 10

    w_guvec = np.zeros_like(w)
    logistic_regression_njit(Y, X, w.copy(), iterations)
    logistic_regression_guvec(Y, X, w.copy(), iterations, w_guvec)

    start_py = time.time()
    for _ in range(n_runs):
        w_py = logistic_regression_py(Y, X, w.copy(), iterations)
    end_py = time.time()
    print(f"Time: {(end_py - start_py) / n_runs:.6f} seconds, pure Python")

    start_njit = time.time()
    for _ in range(n_runs):
        w_njit = logistic_regression_njit(Y, X, w.copy(), iterations)
    end_njit = time.time()
    print(f"Time: {(end_njit - start_njit) / n_runs:.6f} seconds, @njit+parallel")

    start_guvec = time.time()
    for _ in range(n_runs):
        logistic_regression_guvec(Y, X, w.copy(), iterations, w_guvec)
    end_guvec = time.time()
    print(f"Time: {(end_guvec - start_guvec) / n_runs:.6f} seconds, guvectorize")

    # Time: 0.027217 seconds, pure Python
    # Time: 0.017704 seconds, @njit+parallel
    # Time: 0.100319 seconds, guvectorize
    ```

</TabItem>

<TabItem value="4" label="測試計算弧長">

本範例來自於 [Python 加速符文：高效能平行科學計算](https://stephlin.github.io/posts/Python/Python-speedup.html)，這裡我們就推翻了他的效能測試，因為他沒有使用 `guvectorize` 就下結論了，這裡幫他補上後可以發現效能又快了將近一個數量級，應該比 pybind11 還快了。但是相同的，我們也不知道他的其他套件是否有摸熟，也許他們也能榨出更多性能。

此處也有一個有趣的發現，同樣的優化方式，在 Google Colab 執行 `njit` 反而比較 Python 原生慢，推測是 Xeon 伺服器處理器單核心性能薄弱導致，而 `guvectorize` 可以使用 SIMD 壓榨多核心效能（不過我記得 Xeon 每人分配到也只有兩核心，也有可能是指令集差異造成此問題），但是無論原因為何這裡都再度驗證 Numba 的效能是 case-specific。

    ```py
    # 測試計算弧長的時間
    import time
    import numpy as np
    from numba import guvectorize, njit, prange


    # Python 版本
    def arc_length_py(points: np.ndarray) -> float:
        piecewice_length = np.linalg.norm(np.diff(points, axis=0), axis=1)
        return np.sum(piecewice_length)


    # njit 版本
    @njit(parallel=True)
    def arc_length_njit1(points: np.ndarray) -> float:
        length = 0

        for i in prange(points.shape[0] - 1):
            piecewice_length = np.sqrt(np.sum((points[i + 1] - points[i]) ** 2))
            length += piecewice_length

        return length


    # guvectorize 版本
    @guvectorize(["void(float64[:,:], float64[:])"], "(n,m)->()", nopython=True, target='parallel')
    def arc_length_guvec(points: np.ndarray, result: np.ndarray):
        length = 0

        for i in range(points.shape[0] - 1):
            piecewice_length = 0
            for j in range(points.shape[1]):
                piecewice_length += (points[i + 1, j] - points[i, j]) ** 2
            length += np.sqrt(piecewice_length)

        result[0] = length


    # 初始化
    n_runs = 100
    n_points = 10_000_000
    points = np.random.rand(n_points, 2)
    res = np.zeros(1)
    _ = arc_length_guvec(points, res)
    _ = arc_length_njit1(points)

    start_py = time.time()
    w_py = arc_length_py(points)
    end_py = time.time()
    print(f"Time: {(end_py - start_py):.6f} seconds, pure Python")

    start_njit = time.time()
    for _ in range(n_runs):
        w_njit = arc_length_njit1(points)
    end_njit = time.time()
    print(f"Time: {(end_njit - start_njit) / n_runs:.6f} seconds, njit")

    start_guvec = time.time()
    for _ in range(n_runs):
        w_guvec = arc_length_guvec(points, res)
    end_guvec = time.time()
    print(f"Time: {(end_guvec - start_guvec) / n_runs:.6f} seconds, guvectorize")

    # On M1 Mac
    # Time: 0.326715 seconds, pure Python
    # Time: 0.138515 seconds, njit
    # Time: 0.017213 seconds, guvectorize

    # On Google Colab
    # Time: 0.416567 seconds, pure Python
    # Time: 0.621759 seconds, njit
    # Time: 0.048603 seconds, guvectorize
    ```

</TabItem>

</Tabs>
  
#### jitclass
[官方文檔](https://numba.readthedocs.io/en/stable/user/jitclass.html)  

把 class 中所有 methods 都用 numba 優化，還在早期版本。使用 jit class 一定是 nopython 模式。

個人感覺不好用，因為你要給出 class 類所有成員的資料類型，還不如直接在外面寫好 Numba 裝飾的函式再到 class 中定義 method 呼叫，附上[有使用到 jitclass 的教學](https://curiouscoding.nl/posts/numba-cuda-speedup/)。

#### stencil
[官方文檔](https://numba.readthedocs.io/en/stable/user/stencil.html)

用於簡化固定模式（stencil kernel）進行的操作以提升程式碼可讀性，例如對上下左右取平均，可以寫成如下方形式，可讀性高，效能也和 jit 一樣。

```py
import time
import numpy as np
from numba import stencil, njit

@stencil
def kernel1(a):
    # a 代表套用核心的輸入陣列
    return 0.25 * (a[0, 1] + a[1, 0] + a[0, -1] + a[-1, 0])

@njit
def kernel1_jit(a):
    return kernel1(a)

def kernel1_python(a):
    result = np.zeros_like(a)
    for i in range(1, a.shape[0] - 1):
        for j in range(1, a.shape[1] - 1):
            result[i, j] = 0.25 * (a[i, j + 1] + a[i + 1, j] + a[i, j - 1] + a[i - 1, j])
    return result

@njit
def kernel1_python_jit(a):
    result = np.zeros_like(a)
    for i in range(1, a.shape[0] - 1):
        for j in range(1, a.shape[1] - 1):
            result[i, j] = 0.25 * (a[i, j + 1] + a[i + 1, j] + a[i, j - 1] + a[i - 1, j])
    return result


n_runs = 100
input_array = np.random.rand(5000, 5000)

# 第一次運行的初始化，第二次以後才是單純的執行時間
output_array_stencil = kernel1_jit(input_array)
output_array_python = kernel1_python_jit(input_array)

start = time.time()
for _ in range(n_runs):
    kernel1_jit(input_array)
end = time.time()
print(f"stencil: {(end - start)/n_runs} 秒")

start = time.time()
for _ in range(n_runs):
    kernel1_python_jit(input_array)
end = time.time()
print(f"pure jit: {(end - start)/n_runs} 秒")

# Compare the results
print("Are the outputs equal?", np.array_equal(output_array_stencil, output_array_python))

# 輸出

# stencil: 0.03909627914428711 秒
# pure jit: 0.038599507808685304 秒
# Are the outputs equal? True
```

#### overload
[官方文檔](https://numba.pydata.org/numba-doc/dev/extending/overloading-guide.html)

除了手刻不支援的函式以外，Numba 提供了一個高階方式讓你替代不支援的函式，官方範例是使用 `@overload(scipy.linalg.norm)` 替代不支援的 `scipy.linalg.norm`，其中演算法實現使用手刻的 `_oneD_norm_2`，這是很高階的使用方式，除非必要不建議使用，會大幅增加程式維護難度。

這個裝飾器也可以像他的名字一樣用於重載整個函式，用於修改原本的函式內容。

### 提前編譯
[官方文檔](https://numba.readthedocs.io/en/stable/user/pycc.html)

Numba 主要是使用即時編譯，但也支援像 C 語言一樣提前編譯打包後執行。

- 優點
    - 執行時不需 numba 套件
    - 沒有編譯時間開銷  
- 缺點
    - 不支援 ufuncs
    - 必須明確指定函式簽名 (signatures)
    - 導出的函式不會檢查傳遞的參數類型，調用者需提供正確的類型。
    - AOT 編譯生成針對 CPU 架構系列的通用程式碼（如 "x86-64"），而 JIT 編譯則生成針對特定 CPU 型號的優化程式碼。

### jit_module
[官方文檔](https://numba.readthedocs.io/en/stable/user/jit-module.html)

開發者用，讓整個模組的函式都自動被 jit 裝飾。除了官方文檔，這裡節錄 Github 原始碼中的註解：

> Note that ``jit_module`` should only be called at the end of the module to be jitted. In addition, only functions which are defined in the module ``jit_module`` is called from are considered for automatic jit-wrapping.


## 結合分佈式計算
常見的分佈式有 Ray 和 Dask，比如說我們可以結合 Dask + Numba 打一套[組合拳](/docs/python/numba-tutorial-accelerate-python-computing#see-also)。

## 常見問題
1. 我要學會寫平行運算？  
不用，網路上在亂教，numba 會自動處理平行運算，而且效能比手寫還好。

2. [可不可以把函式當參數給 numba 優化？](https://numba.readthedocs.io/en/stable/user/faq.html#can-i-pass-a-function-as-an-argument-to-a-jitted-function)  
可以，但是會造成額外 call stack 開銷，請考慮工廠模式。

3. 提前編譯執行效率會變高嗎？  
不會。根據文檔，提前編譯會生成最泛用的函式而不是最符合當前 CPU/GPU 的函式。

4. Numba JIT 和 Python JIT 一樣嗎？  
[不確定]根據這個影片說明 [CPython JIT](https://www.youtube.com/watch?v=SNXZPZA8PY8) 的核心理念是 JIT，而筆者在文檔或者 Numba Github repo 中完全搜不到有關熱點分析的關鍵字，應該是不一樣。

5. Numba 可能會產生和 Numpy 不一樣的結果  
根據[浮點陷阱](https://numba.readthedocs.io/en/stable/reference/fpsemantics.html)，我們應該避免對同一矩陣重複使用 numba 運算以免越錯越多。


## See Also
這裡放筆者覺得有用的文章。

- [官方使用範例](https://numba.readthedocs.io/en/stable/user/examples.html)
- 🔥🔥🔥 **非常優質的連續三篇系列文章，你最好把這裡全部看過！**  
[Making Python extremely fast with Numba: Advanced Deep Dive (1/3)](https://medium.com/@mflova/making-python-extremely-fast-with-numba-advanced-deep-dive-1-3-4d303edeede4)  
[Making Python extremely fast with Numba: Advanced Deep Dive (2/3)](https://medium.com/@mflova/making-python-extremely-fast-with-numba-advanced-deep-dive-2-3-f809b43f8300)  
[Making Python extremely fast with Numba: Advanced Deep Dive (3/3)](https://medium.com/@mflova/making-python-extremely-fast-with-numba-advanced-deep-dive-3-3-695440b62030)  
- 對 Numba 程式碼進行效能分析。  
[Profiling your numba code](https://pythonspeed.com/articles/numba-profiling/)
- 🔥 陣列運算降低 Numba 速度的範例。  
[The wrong way to speed up your code with numba](https://pythonspeed.com/articles/slow-numba/)  
- 🔥 CUDA 加速並且有完整的對比，值得一看。  
[28000x speedup with numba.CUDA](https://curiouscoding.nl/posts/numba-cuda-speedup/)   
- 非常長的 CUDA 教學文章。  
[用 numba 學 CUDA! 從入門到精通 (上)](https://medium.com/@spacetime0311/%E7%94%A8-numba-%E5%AD%B8-cuda-%E5%BE%9E%E5%85%A5%E9%96%80%E5%88%B0%E7%B2%BE%E9%80%9A-%E4%B8%8A-ede7b381f6c7) 
- 非常長的 CUDA 教學文章。  
[用 numba 學 CUDA! 從入門到精通 (下)](https://medium.com/@spacetime0311/%E7%94%A8-numba-%E5%AD%B8-cuda-%E5%BE%9E%E5%85%A5%E9%96%80%E5%88%B0%E7%B2%BE%E9%80%9A-%E4%B8%8B-770c11bffd37)
- 🔥 使用 Dask + Numba 的簡單範例，其中包括 guvectoize 的使用，值得一看。  
[Dask + Numba for Efficient In-Memory Model Scoring](https://medium.com/capital-one-tech/dask-numba-for-efficient-in-memory-model-scoring-dfc9b68ba6ce) 
- 使用 Numba CUDA 功能加上 Dask 分散式加速運算並解決顯卡記憶體不足的問題。  
[Accelerated Portfolio Construction with Numba and Dask in Python](https://developer.nvidia.com/blog/accelerated-portfolio-construction-with-numba-and-dask-in-python/)
- 需要有計算機組織的知識才能讀懂得性能優化指南  
[How to Write Fast Numerical Code](https://people.inf.ethz.ch/markusp/teaching/263-2300-ETH-spring14/slides/06-locality-caches.pdf)

- 非官方[中文文檔](https://github.com/apachecn/numba-doc-zh) 只更新到 0.44，按需觀看，舊版缺乏使用警告可能導致意想不到的錯誤。


## 附錄
- AOT  
  Compilation of a function in a separate step before running the program code, producing an on-disk binary object which can be distributed independently. This is the traditional kind of compilation known in languages such as C, C++ or Fortran.

- Python bytecode （字節碼）  
  The original form in which Python functions are executed. Python bytecode describes a stack-machine executing abstract (untyped) operations using operands from both the function stack and the execution environment (e.g. global variables).

- JIT  
  Compilation of a function at execution time, as opposed to ahead-of-time compilation.

- ufunc  
  A NumPy universal function. numba can create new compiled ufuncs with the @vectorize decorator.

- jitted
  經過 JIT 編譯後的程式碼稱做 jitted。

- [延伸嘴砲] 甚至可以找到這樣的一篇論文：Dask & Numba: Simple libraries for optimizing scientific python code，恕我直言，這比熊文案還水。

## 結語
長達一萬字的教學結束了，Markdown 總字數接近三萬，應該來個一鍵三連吧。

目標讀者其實就是在說通訊系，也就是當年的自己。另外看到別篇文章結尾感謝部門其餘四個人，所以總共五個人討論出來才寫出 numba 文章，當時雖然比他晚一年，但筆者當年可是研究生，一個人自己學會用 numba...夭壽實驗室。

開頭的最快、最正確和最完整，其實是自己看網路文章一直以來的不舒服感，完整的太詳細（跟讀文檔沒兩樣），快且正確的文章又不完整，好像永遠沒辦法兼顧。於是本文和我寫的其他教學文章一樣，主要照顧初學者，讓初學者可以快速上手，讀起來又完整，而且內容還正確，當讀者不需要使用平行化時可以在十分鐘之內搞定 Numba，需要平行化或 vectorize 等高級使用技巧時也對網路上許多錯誤做出勘誤和實測結果，感謝能讀完的各位。

>內容基於 numba 文檔，作者：Anaconda, Inc.，授權：BSD 2-Clause。
>
>- GitHub: https://github.com/numba/numba
>- 文檔: https://numba.readthedocs.io/