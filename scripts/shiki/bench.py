#!/usr/bin/env python3
#
# Benchmark script for Shiki highlighter. Run in Python to avoid Node.js cache.
import subprocess
import time

ROUND = 10
SLEEP_INTERVAL = 0.00001  # Avoid cache


def profile(round: int) -> float:
    total = 0
    for i in range(1, round + 1):
        run_process(["hugo", "--gc", "--minify"])

        start = time.time()
        run_process(["node", "scripts/shiki/index.js"])
        end = time.time()

        duration = (end - start) * 1000
        print(f"Shiki 耗時 {duration:.0f} ms, 休息 {SLEEP_INTERVAL} 秒...")
        total += duration

        if i < round - 1:
            time.sleep(SLEEP_INTERVAL)

    return total / round


def run_process(args):
    subprocess.run(args=args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


if __name__ == "__main__":
    avg = profile(ROUND)
    print(f"\nShiki 平均耗時 {avg:.2f} ms")
