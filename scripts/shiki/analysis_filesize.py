# 測試 shiki 前後的檔案大小差異
# 使用這個指令印出檔案大小後執行此腳本分析
# find public -type f -name "*.html" -exec du -h {} + | sort -rh | tail -n 999999 > before-shiki.txt
# find public -type f -name "*.html" -exec du -h {} + | sort -rh | tail -n 999999 > after-shiki.txt

def parse_file(filename):
    data = {}
    with open(filename, 'r') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) != 2:
                continue
            size_str, path = parts
            if size_str.endswith('K'):
                size = float(size_str[:-1])
            elif size_str.endswith('M'):
                size = float(size_str[:-1]) * 1024
            else:
                continue
            data[path] = size
    return data

before = parse_file('before-shiki.txt')
after = parse_file('after-shiki.txt')

all_paths = set(before.keys()).union(after.keys())
diffs = []
total_before = 0
total_after = 0

for path in all_paths:
    before_size = before.get(path, 0)
    after_size = after.get(path, 0)
    delta = after_size - before_size
    ratio = (delta / before_size * 100) if before_size != 0 else float('inf')
    diffs.append((delta, before_size, after_size, ratio, path))
    total_before += before_size
    total_after += after_size

diffs.sort(key=lambda x: -abs(x[0]))

top_diffs = diffs[:10]

for delta, before_size, after_size, ratio, path in top_diffs:
    sign = '+' if delta >= 0 else '-'
    ratio_str = f"{sign}{abs(ratio):.1f}%" if before_size != 0 else "N/A"
    print(f"{sign}{abs(delta):.1f}K\t{before_size:.1f}K → {after_size:.1f}K\t({ratio_str})\t{path}")

total_delta = total_after - total_before
total_ratio = (total_delta / total_before * 100) if total_before != 0 else float('inf')
total_sign = '+' if total_delta >= 0 else '-'
print(f"\n總變化：{total_sign}{abs(total_delta):.1f}K\t{total_before:.1f}K → {total_after:.1f}K\t({total_sign}{abs(total_ratio):.1f}%)")
