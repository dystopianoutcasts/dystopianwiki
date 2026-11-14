#!/usr/bin/env python3
"""Check the generated Build 42 Reference drafts. Standard library only.

  python -I scripts/reference/check.py --api <api dir> --out content/drafts/pz/build-42/reference \
      --articles content/articles/pz/build-42

Exit code 0 only when every check passes.
"""
import argparse
import collections
import json
import os
import re
import sys

MAX_WORDS = 12000
MAX_CLASSES = 60
MAX_EXCERPT = 200
REQUIRED = ('id', 'slug', 'title', 'game', 'version', 'section', 'category', 'difficulty',
            'tags', 'excerpt', 'last_updated')
LINK_RE = re.compile(r'\]\((/pz/build-42/[^)\s]+)\)')
CLASS_H = re.compile(r'^## `([^`]+)`$')
BLOCK_H = re.compile(r'^## Block type `([^`]+)`$')
ROW_NAME = re.compile(r'^\| `([^`]+)` \|')

errors = []


def err(msg):
    errors.append(msg)


def jl(path):
    with open(path, encoding='utf-8') as f:
        return [json.loads(x) for x in f if x.strip()]


def parse_page(path):
    with open(path, encoding='utf-8') as f:
        text = f.read()
    if not text.startswith('---\n'):
        err('%s: no frontmatter' % path)
        return {}, text
    end = text.index('\n---\n', 4)
    fm = {}
    key = None
    for line in text[4:end].split('\n'):
        m = re.match(r'^([a-z_]+):\s*(.*)$', line)
        if m:
            key = m.group(1)
            v = m.group(2)
            if v == '':
                fm[key] = []
            else:
                fm[key] = json.loads(v) if v.startswith('"') else v.strip("'")
        elif line.startswith('  - ') and key:
            fm[key].append(line[4:])
    return fm, text[end + 5:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--api', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--articles', default=None, help='content/articles/pz/build-42 (existing slugs)')
    a = ap.parse_args()

    pages = {}   # (cat, slug) -> dict
    slugs = collections.Counter()
    ids = collections.Counter()
    cats = collections.defaultdict(list)
    for cat in sorted(os.listdir(a.out)):
        d = os.path.join(a.out, cat)
        if not os.path.isdir(d):
            continue
        if not os.path.isfile(os.path.join(d, '_category.json')):
            err('%s: missing _category.json' % cat)
        for fn in sorted(os.listdir(d)):
            if not fn.endswith('.md'):
                continue
            fm, body = parse_page(os.path.join(d, fn))
            for k in REQUIRED:
                if k not in fm or fm[k] in ('', []):
                    err('%s/%s: missing frontmatter %s' % (cat, fn, k))
            if fm.get('slug') != fn[:-3]:
                err('%s/%s: slug differs from file name' % (cat, fn))
            if fm.get('category') != cat:
                err('%s/%s: category differs from folder' % (cat, fn))
            if fm.get('section') != 'reference' or fm.get('game') != 'pz' or fm.get('version') != 'build-42':
                err('%s/%s: wrong game/version/section' % (cat, fn))
            if not str(fm.get('slug', '')).startswith('ref-'):
                err('%s/%s: slug does not start with ref-' % (cat, fn))
            if fm.get('id') != 'build-42-%s' % fm.get('slug'):
                err('%s/%s: id mismatch' % (cat, fn))
            if len(fm.get('excerpt', '')) > MAX_EXCERPT:
                err('%s/%s: excerpt over %d' % (cat, fn, MAX_EXCERPT))
            slugs[fm.get('slug')] += 1
            ids[fm.get('id')] += 1
            w = len(body.split())
            pages[(cat, fm.get('slug'))] = {'fm': fm, 'body': body, 'words': w, 'file': '%s/%s' % (cat, fn)}
            cats[cat].append(pages[(cat, fm.get('slug'))])
    if not os.path.isfile(os.path.join(a.out, '_section.json')):
        err('missing _section.json')

    # unique slugs and ids
    for s, n in slugs.items():
        if n > 1:
            err('slug repeats: %s (%d)' % (s, n))
    for s, n in ids.items():
        if n > 1:
            err('id repeats: %s (%d)' % (s, n))
    slugset = set(slugs)

    # collisions with existing published slugs
    existing = 0
    if a.articles:
        for d, _dirs, files in os.walk(a.articles):
            for fn in files:
                if fn.endswith('.md'):
                    with open(os.path.join(d, fn), encoding='utf-8') as f:
                        head = f.read(4000)
                    m = re.search(r'^slug:\s*[\'"]?([^\'"\n]+)[\'"]?\s*$', head, re.M)
                    existing += 1
                    if m and m.group(1).strip() in slugset:
                        err('slug collides with existing article %s: %s' % (os.path.join(d, fn), m.group(1)))
    # links and related
    nlinks = 0
    for (cat, slug), p in sorted(pages.items()):
        for m in LINK_RE.finditer(p['body']):
            nlinks += 1
            parts = m.group(1).split('/')
            # /pz/build-42/reference/<cat>/<slug>
            if len(parts) != 6 or parts[3] != 'reference' or (parts[4], parts[5]) not in pages:
                err('%s: link does not resolve: %s' % (p['file'], m.group(1)))
        for r in p['fm'].get('related_articles', []):
            if r not in slugset:
                err('%s: related article not found: %s' % (p['file'], r))
        if p['words'] > MAX_WORDS:
            err('%s: %d words, over %d' % (p['file'], p['words'], MAX_WORDS))
        if cat.startswith('java-'):
            n = sum(1 for line in p['body'].split('\n') if CLASS_H.match(line))
            if n > MAX_CLASSES:
                err('%s: %d classes, over %d' % (p['file'], n, MAX_CLASSES))

    def heads(cat_filter, regex):
        c = collections.Counter()
        for (cat, _s), p in pages.items():
            if cat_filter(cat):
                for line in p['body'].split('\n'):
                    m = regex.match(line)
                    if m:
                        c[m.group(1)] += 1
        return c

    def compare(label, expected, got):
        exp = set(expected)
        missing = sorted(exp - set(got))
        extra = sorted(set(got) - exp)
        dup = sorted(k for k, v in got.items() if v > 1)
        for k in missing[:10]:
            err('%s missing: %s' % (label, k))
        for k in extra[:10]:
            err('%s unexpected: %s' % (label, k))
        for k in dup[:10]:
            err('%s appears more than once: %s' % (label, k))
        if len(missing) > 10 or len(extra) > 10 or len(dup) > 10:
            err('%s: more problems not shown (missing %d, extra %d, dup %d)' % (
                label, len(missing), len(extra), len(dup)))
        return len(exp)

    counts = collections.OrderedDict()
    classes = jl(os.path.join(a.api, 'classes.jsonl'))
    eng = [c['c'] for c in classes if c['scope'] in ('engine', 'kahlua')]
    counts['engine+kahlua classes'] = compare('class', eng, heads(lambda c: c.startswith('java-'), CLASS_H))
    lf = [f['file'] for f in jl(os.path.join(a.api, 'lua_files.jsonl'))]
    counts['Lua files'] = compare('lua file', lf, heads(lambda c: c.startswith('lua-'), CLASS_H))
    bt = {b['type'] for b in jl(os.path.join(a.api, 'script_blocks.jsonl'))}
    counts['script block types'] = compare('block type', bt, heads(lambda c: c == 'scripts', BLOCK_H))
    ev = [e['name'] for e in jl(os.path.join(a.api, 'events.jsonl'))]
    counts['events'] = compare('event', ev, heads(lambda c: c == 'events' , CLASS_H))
    gl = [g['name'] for g in jl(os.path.join(a.api, 'lua_globals.jsonl'))]
    counts['globals'] = compare('global', gl, heads(lambda c: c == 'globals', ROW_NAME))
    sb = [s['name'] for s in jl(os.path.join(a.api, 'sandbox_options.jsonl'))]
    counts['sandbox options'] = compare('sandbox option', sb, heads(lambda c: c == 'sandbox-options', ROW_NAME))
    nat = jl(os.path.join(a.api, 'native_boundary.jsonl'))
    nat_rows = 0
    for (cat, _s), p in pages.items():
        if cat == 'natives':
            nat_rows += sum(1 for line in p['body'].split('\n') if line.startswith('| `') and ' | jni-export |' in line
                            or line.startswith('| `') and re.search(r'\| (loadLibrary-site|package-heuristic|none) \|', line))
    exp_rows = sum(max(1, len(n['libs'])) for n in nat)
    if nat_rows != exp_rows:
        err('native rows: expected %d, found %d' % (exp_rows, nat_rows))
    counts['native methods (library rows)'] = exp_rows

    # report
    total_bytes = 0
    for dp, _d, files in os.walk(a.out):
        for fn in files:
            total_bytes += os.path.getsize(os.path.join(dp, fn))
    print('pages: %d in %d categories; internal links checked: %d; existing articles scanned: %d' % (
        len(pages), len(cats), nlinks, existing))
    for k, v in counts.items():
        print('  %-30s %s' % (k, v))
    largest = max(pages.values(), key=lambda p: p['words'])
    print('largest page: %s (%d words, limit %d)' % (largest['file'], largest['words'], MAX_WORDS))
    print('total draft size: %.1f MB' % (total_bytes / 1048576.0))
    print('pages per category:')
    for cat in sorted(cats):
        print('  %-22s %4d pages %8d words' % (cat, len(cats[cat]), sum(p['words'] for p in cats[cat])))
    if errors:
        print('FAIL: %d problems' % len(errors))
        for e in errors[:60]:
            print('  [ERROR] ' + e)
        if len(errors) > 60:
            print('  ... %d more' % (len(errors) - 60))
        sys.exit(1)
    print('PASS')


if __name__ == '__main__':
    main()
