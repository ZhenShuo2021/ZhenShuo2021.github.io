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
    從 [Python 加速符文](https://stephlin.github.io/posts/Python/Python-speedup.html) 這篇文章中我們可以看到效能相差不大，除此之外，你能確定文章作者真的會用該套件嗎？就像我在寫這篇文章前也不知道 Numba 有這個[魔法](/docs/python/numba-tutorial-accelerate-python-computing#guvectorize)，網路上也幾乎沒有文章提到。  

    所以我們應該考量的是套件是否有限制和可維護性，而不是追求最快的效能，不然一開始就寫 C 不就好了。但是套件的限制在使用之前根本不知道，例如 Numba 不支援稀疏矩陣我也是踩過坑才知道，所以考量就剩下維護性了，而 Numba 在可讀性和偵錯都有很好的表現。

    另外與 Numba 相似的 Pythran 搜尋結果只有一萬筆資料，筆者將其歸類為 others，不要折磨自己。

- **結論**  
    經過這些討論我們可以總結成以下
  - Numba：**簡單又快**。適用不會太多程式優化技巧，也不太會用到不支援的函式的用戶。除此之外也支援 CUDA 計算。
  - Cython：麻煩又不見得比較快。最大的優點也是唯一的優點是支援更多 Python 語法，以及你希望對程式有更多控制，Numba 因為太方便所以運作起來也像是個黑盒子，有時你會感到不安心。
  - pybind：極限性能要求。
  - CuPy：大量平行計算，需要 CUDA 計算。
