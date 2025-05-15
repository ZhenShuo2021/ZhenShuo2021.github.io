---
title: "Rician Fading"
description: 
date: 2024-06-14T02:45:40+08:00
draft: false
slug:
  - rician-fading
summary: Methods of Rician fading generation founds on the internet.
tags:
  - Theoretical Knowledge
  - Cheatsheet
categories:
  - Wireless Communication
# series_order: 1
---
{{< katex >}}

Translated by ChatGPT GPT4o-mini.

{{< lead >}}
Summarize the methods for generating Rician fading.
{{< /lead >}}

To summarize:

1. Method 1 is the most reliable as per Emil Björnson's response.
2. Methods 2/3 lack the LOS path random phase mentioned by Emil, and the difference between methods 2/3 is the \\(\sigma\\) of NLOS paths and the denominator of \\(2k+1\\).
3. Methods 4/5 are likely different formatting approaches.

# Method 1: Emil Björnson

[https://www.researchgate.net/post/How_to_compute_Rician_fading_in_matlab](https://www.researchgate.net/post/How_to_compute_Rician_fading_in_matlab)

Emil Björnson's response is the most reliable. He also wrote an [article](https://ma-mimo.ellintech.se/2020/03/02/rician-fading-a-channel-model-often-misunderstood/) explaining that many people misunderstand Rician fading. This method is consistent with the generation methods in [MATLAB](https://www.mathworks.com/help/comm/ug/fading-channels.html) and [this source](https://web.xidian.edu.cn/bmbai/files/20150129_145929.pdf).
$$
\footnotesize
\begin{aligned}
&h_{\text{LOS}} &&= e^{(j2\pi\mathcal{N}(1,1))} \newline
&h_{\text{NLOS}} &&= \mathcal{CN}(0, \sigma^2) \newline
&h &&= h_{\text{LOS}}\sqrt{\dfrac{K}{K + 1}} + h_{\text{NLOS}}\sqrt{\frac{1}{K + 1}}
\end{aligned}
$$

# Method 2

[https://zhuanlan.zhihu.com/p/378334372](https://zhuanlan.zhihu.com/p/378334372)

$$
\footnotesize
\begin{align}
&h_\text{rayleigh} &&= \sqrt{\frac{\sigma^2}{2}} *(\mathcal{N}(1,1) + j\mathcal{N}(1,1)) \newline
&h_\text{rician} &&= \sqrt{\frac{k}{k+1}} + h_\text{rayleigh}\sqrt{\frac{1}{k+1}}
\end{align}
$$

# Method 3

[https://dsp.stackexchange.com/questions/84493/how-to-code-rician-fading-channel-gains-from-k-factor](https://dsp.stackexchange.com/questions/84493/how-to-code-rician-fading-channel-gains-from-k-factor)

$$
\footnotesize
\begin{align}
&h_{\text{NLOS}} &&= (\mathcal{N}(1,N)+j\mathcal{N}(1,N)) \newline
&h &&= \left|\sqrt{\dfrac{K}{K+1}}+h_{\text{NLOS}}\sqrt{\dfrac{1}{2(K+1)}}\right|
\end{align}
$$

# Method 4

[https://github.com/SnehalChitnavis/encryption_on_Rician_channel/blob/master/Performance_Rician_fading.m](https://github.com/SnehalChitnavis/encryption_on_Rician_channel/blob/master/Performance_Rician_fading.m)

$$
\footnotesize
\begin{align}
&s &&= \sqrt{\dfrac{1}{2(K+1)}}, \mu = \sqrt{\dfrac{K}{2(K+1)}} \newline
&h &&= ( s\mathcal{N}(1,1) + \mu ) + j( s\mathcal{N}(1,1) + \mu )
\end{align}
$$

# Method 5

[https://github.com/gokhanntosun/multipath-channel-models/blob/main/Rician_Fading.m](https://github.com/gokhanntosun/multipath-channel-models/blob/main/Rician_Fading.m)

{{< alert >}}
**Test if the Nakagami fading in this method is correct!!**
{{< /alert >}}

```matlab
% LOS components
a = sqrt(K/2);  b = a;
% in-phase component
i = a + randn([1 size]);
% quadrature component
q = b + randn([1 size]);
% build fading component
s = (i + 1j*q);
```

# Method 6

[https://github.com/Deeshant2234/QAM-Simulation-MATLAB/blob/main/QAM_BER.m](https://github.com/Deeshant2234/QAM-Simulation-MATLAB/blob/main/QAM_BER.m)

{{< alert cardColor="#e63946" iconColor="#1d3557" textColor="#000000" >}}
Theoretical values differ from simulation results in this method. Need to check why!
{{< /alert >}}

```matlab
mean = sqrt(k1/(k1+1));  % mean
sigma = sqrt(1/(2*(k1+1)));  %variance
Nr2 = randn(N, 1)*sigma+mean;
Ni2 = randn(N, 1)*sigma;
% To generate the Rician Random Variable
h_rac = sqrt(Nr2.^2+Ni2.^2);  %Rician fading coefficient
```

TODO:

1. For Methods 2/3: Check the original texts to confirm if the denominator is \\(k+1\\) or \\(2k+1\\).
2. For Methods 2/3: Check the original texts for the explanation of Rayleigh fading parameter \\(\sigma\\).
3. Verify if the Nakagami fading simulation in Method 4 is correct.
4. Determine what is wrong with Method 5.
