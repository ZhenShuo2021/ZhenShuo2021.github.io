---
title: 基礎練習
date: 2024-06-27
draft: true
summary: 簡單程式
description: "C practice"
slug: "C-practice-2"
tags: ["C語言"]
categories: ["筆記"]
series: ["基礎C語言"]
series_order: 2
---

# 1. 矩陣乘法

## 一般方法
<details>

  <summary>static inline</summary>

  **inline只會影響函數在translation unit（可以簡單理解為C源碼文件）內的編譯行為，只要超出了這個範圍inline屬性就沒有任何作用了。**  
  [Source1](https://medium.com/@hauyang/%E6%88%91%E6%9C%89%E6%89%80%E4%B8%8D%E7%9F%A5%E7%9A%84-static-inline-b363892b7450)  
  [Source2](https://read01.com/zh-tw/3APOEG.html#.X75Tay2l1QJ)
</details>

```C
#include <stdio.h>

#define R1 2
#define C1 3
#define R2 3
#define C2 2

static inline void matmul1(int A[R1][C1], int B[R2][C2], int C[R1][C2])
{
    for (int i = 0; i < R1; i++)
    {
        for (int j = 0; j < C2; j++)
        {
            C[i][j] = 0;
            for (int k = 0; k < C1; k++)
            {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

int main()
{
    int A[R1][C1] = {{1, 2, 2}, {3, 3, 4}};
    int B[R2][C2] = {{1, 2}, {2, 3}, {3, 4}};
    int C[R1][C2];

    matmul1(A, B, C);

    for (int i = 0; i < R1; i++)
    {
        for (int j = 0; j < C2; j++)
        {
            printf("%d ", C[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

## 2D malloc
```C
#include <stdio.h>
#include <stdlib.h>

void matmul2(int **A, int **B, int **C, int R1, int C1, int C2)
{
    for (int i = 0; i < R1; i++)
    {
        for (int j = 0; j < C2; j++)
        {
            C[i][j] = 0;
            for (int k = 0; k < C1; k++)
            {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

int main()
{
    int R1 = 2, C1 = 3, R2 = 3, C2 = 2;

    int **A = malloc(R1 * sizeof(int *));
    int **B = malloc(R2 * sizeof(int *));
    int **C = malloc(R1 * sizeof(int *));
    for (int i = 0; i < R1; i++) A[i] = malloc(C1 * sizeof(int));
    for (int i = 0; i < R2; i++) B[i] = malloc(C2 * sizeof(int));
    for (int i = 0; i < R1; i++) C[i] = malloc(C2 * sizeof(int));

    int tempA[2][3] = {{1, 2, 2}, {3, 3, 4}};
    int tempB[3][2] = {{1, 2}, {2, 3}, {3, 4}};
    for (int i = 0; i < R1; i++) for (int j = 0; j < C1; j++) A[i][j] = tempA[i][j];
    for (int i = 0; i < R2; i++) for (int j = 0; j < C2; j++) B[i][j] = tempB[i][j];

    matmul2(A, B, C, R1, C1, C2);

    for (int i = 0; i < R1; i++)
    {
        for (int j = 0; j < C2; j++)
        {
            printf("%d ", C[i][j]);
        }
        printf("\n");
    }

    for (int i = 0; i < R1; i++) free(A[i]);
    for (int i = 0; i < R2; i++) free(B[i]);
    for (int i = 0; i < R1; i++) free(C[i]);
    free(A); free(B); free(C);

    return 0;
}
```
## 1D array 模擬 2D array
```C
#include <stdio.h>
#include <stdlib.h>

void matmul3(int *A, int *B, int *C, int R1, int C1, int C2)
{
    for (int i = 0; i < R1; i++)
    {
        for (int j = 0; j < C2; j++)
        {
            C[i * C2 + j] = 0;
            for (int k = 0; k < C1; k++)
            {
                C[i * C2 + j] += A[i * C1 + k] * B[k * C2 + j];
            }
        }
    }
}

int main()
{
    int R1 = 2, C1 = 3, R2 = 3, C2 = 2;

    int A[] = {1, 2, 2, 3, 3, 4};
    int B[] = {1, 2, 2, 3, 3, 4};
    int C[R1 * C2];

    matmul3(A, B, C, R1, C1, C2);

    for (int i = 0; i < R1; i++)
    {
        for (int j = 0; j < C2; j++)
        {
            printf("%d ", C[i * C2 + j]);
        }
        printf("\n");
    }
    return 0;
}
```
