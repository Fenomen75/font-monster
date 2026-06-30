#!/usr/bin/env python3
"""
fonts-data.json -> fonts-data-0.json ... fonts-data-9.json

Hər kateqoriyanı populyarlığa görə (yüksəkdən aşağıya) sıralayır, sonra
bütün kateqoriyalar arasında round-robin (1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, ...)
şəkildə qarışdırır ki, nəticədə alınan tək siyahı başdan sona bütün
kateqoriyalardan mütənasib təmsil olunsun. Bu siyahı sonra 10 ardıcıl
hissəyə bölünür — beləliklə YALNIZ chunk-0 yüklənmiş olsa belə, istənilən
kateqoriyada azı bir neçə (və ən populyar) font dərhal görünür.

İşlətmə:
  python3 build-font-chunks.py fonts-data.json public/
"""
import json
import sys
import os
from collections import defaultdict

def main():
    src = sys.argv[1] if len(sys.argv) > 1 else 'fonts-data.json'
    outdir = sys.argv[2] if len(sys.argv) > 2 else '.'
    chunk_count = 10

    with open(src, 'r', encoding='utf-8') as f:
        fonts = json.load(f)

    by_cat = defaultdict(list)
    for f in fonts:
        by_cat[f.get('cat', 'other')].append(f)

    # Hər kateqoriya daxilində populyarlığa görə sırala (ən populyar əvvəl)
    for cat in by_cat:
        by_cat[cat].sort(key=lambda x: -(x.get('popular') or 0))

    # Round-robin interleave: hər kateqoriyadan növbə ilə bir font götür
    cats = list(by_cat.keys())
    interleaved = []
    idx = 0
    remaining = sum(len(v) for v in by_cat.values())
    cursors = {c: 0 for c in cats}
    while remaining > 0:
        cat = cats[idx % len(cats)]
        idx += 1
        c = cursors[cat]
        if c < len(by_cat[cat]):
            interleaved.append(by_cat[cat][c])
            cursors[cat] += 1
            remaining -= 1

    total = len(interleaved)
    base_size = total // chunk_count
    extra = total % chunk_count

    os.makedirs(outdir, exist_ok=True)
    pos = 0
    for i in range(chunk_count):
        size = base_size + (1 if i < extra else 0)
        chunk = interleaved[pos:pos+size]
        pos += size
        outpath = os.path.join(outdir, f'fonts-data-{i}.json')
        with open(outpath, 'w', encoding='utf-8') as out:
            json.dump(chunk, out, ensure_ascii=False, separators=(',', ':'))
        print(f'{outpath}: {len(chunk)} fonts')

    assert pos == total
    print(f'Total: {total} fonts -> {chunk_count} chunks')

if __name__ == '__main__':
    main()
