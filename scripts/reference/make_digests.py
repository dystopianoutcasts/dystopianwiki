"""Compact per-class digests for writing one-line purposes (P1b).

For every Lua-exposed class: kind, super, interfaces, decompiled path and size,
member names (methods first, then fields), events it fires, and a few string
constants. Written as batch files of plain text, one block per class, so a
reader can name what each class is for without opening source files.

usage: python -I make_digests.py <api dir> <out dir> [--batches N]
"""
import json, os, sys, collections
API, OUT = sys.argv[1], sys.argv[2]
N = int(sys.argv[sys.argv.index('--batches') + 1]) if '--batches' in sys.argv else 3

def jl(p):
    with open(p, encoding='utf-8') as f:
        for line in f:
            if line.strip():
                yield json.loads(line)

exposed = sorted({r['class'] for r in jl(os.path.join(API, 'lua_exposed.jsonl')) if r.get('in_jar', True)})
want = set(exposed)
cls = {r['c']: r for r in jl(os.path.join(API, 'classes.jsonl')) if r['c'] in want}
members = collections.defaultdict(lambda: {'method': [], 'field': []})
for r in jl(os.path.join(API, 'api.jsonl')):
    if r['c'] in want and r.get('k') in ('method', 'field') and r.get('vis') in ('public', 'protected'):
        lst = members[r['c']][r['k']]
        if r['m'] not in lst and not r['m'].startswith('lambda$'):
            lst.append(r['m'])
strings = collections.defaultdict(list)
for fn in sorted(os.listdir(os.path.join(API, 'strings'))):
    for r in jl(os.path.join(API, 'strings', fn)):
        if r['c'] in want and r.get('k') == 'str':
            for s, _ in r.get('s', []):
                if 4 <= len(s) <= 60 and len(strings[r['c']]) < 6 and s not in strings[r['c']]:
                    strings[r['c']].append(s)
fires = collections.defaultdict(set)
for r in jl(os.path.join(API, 'events.jsonl')):
    for site in r.get('java_triggers', []):
        path = site.split('/src/', 1)[-1].split('#')[0][:-5].replace('/', '.')
        fires[path].add(r['name'])

os.makedirs(OUT, exist_ok=True)
blocks = []
for c in exposed:
    k = cls.get(c, {})
    m = members[c]
    lines = [f'CLASS {c}',
             f'  kind={k.get("kind", "?")} super={k.get("super")} ifaces={",".join(k.get("ifaces") or []) or "-"} src={k.get("src")} lines={k.get("src_lines", "?")}',
             f'  methods({len(m["method"])}): {", ".join(m["method"][:40])}',
             f'  fields({len(m["field"])}): {", ".join(m["field"][:20])}']
    if fires.get(c):
        lines.append(f'  fires events: {", ".join(sorted(fires[c]))}')
    if strings.get(c):
        lines.append(f'  strings: {" | ".join(strings[c])}')
    blocks.append('\n'.join(lines))
per = -(-len(blocks) // N)
for i in range(N):
    part = blocks[i * per:(i + 1) * per]
    with open(os.path.join(OUT, f'digest-{i + 1}.txt'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n\n'.join(part) + '\n')
    print(f'digest-{i + 1}.txt: {len(part)} classes')
