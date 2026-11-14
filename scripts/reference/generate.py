#!/usr/bin/env python3
"""Build 42 Reference generator.

Turns the Project Zomboid engine indexes (api/ of a capture in
GAME/PZ_Engine_Records) into draft wiki pages. Standard library only.
Deterministic: same input, byte-identical output, no timestamps.

  python -I scripts/reference/generate.py --api <api dir> --out content/drafts/pz/build-42/reference
"""
import argparse
import collections
import json
import os
import re
import shutil
import sys

LAST_UPDATED = '2026-11-14'
SECTION = 'reference'
BASE_URL = '/pz/build-42/reference'
MAX_WORDS = 12000          # hard page limit (check.py)
MAX_CLASSES = 60           # hard page limit for Java pages (check.py)
PACK_WORDS = 10500         # generator target, leaves room for headers
PACK_CLASSES = 60
SOURCE_LINE = 'Generated from Project Zomboid 42.22 (capture B42_3d39148846)'

PRIM = {'B': 'byte', 'C': 'char', 'D': 'double', 'F': 'float', 'I': 'int',
        'J': 'long', 'S': 'short', 'Z': 'boolean', 'V': 'void'}

# ---------------------------------------------------------------- helpers


def jl(path):
    out = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def words(text):
    return len(text.split())


def esc(s):
    return str(s).replace('|', '\\|').replace('\r', ' ').replace('\n', ' ')


def code(s, limit=0):
    s = str(s).replace('`', "'").replace('\r', ' ').replace('\n', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    if limit and len(s) > limit:
        s = s[:limit - 3] + '...'
    if s == '':
        return ''
    return '`' + esc(s) + '`'


def cite(src):
    """'B42_x/src/zombie/A.java#L12' -> 'zombie/A.java:12'."""
    if not src:
        return ''
    for marker in ('/src/', '/game_snapshot/media/'):
        i = src.find(marker)
        if i >= 0:
            src = src[i + len(marker):]
            break
    return src.replace('#L', ':')


def cite_cell(src):
    c = cite(src)
    return code(c) if c else '-'


def simple(name):
    name = name.replace('/', '.')
    return name.rsplit('.', 1)[-1].replace('$', '.')


def parse_type(s, i):
    dims = 0
    while s[i] == '[':
        dims += 1
        i += 1
    if s[i] == 'L':
        j = s.index(';', i)
        name = simple(s[i + 1:j])
        i = j + 1
    else:
        name = PRIM[s[i]]
        i += 1
    return name + '[]' * dims, i


def method_sig(name, desc, fl, cls=None):
    """Readable Java signature from a method descriptor."""
    try:
        i = 1
        params = []
        while desc[i] != ')':
            t, i = parse_type(desc, i)
            params.append(t)
        ret, _ = parse_type(desc, i + 1)
    except Exception:
        return name + desc
    if 'varargs' in fl and params and params[-1].endswith('[]'):
        params[-1] = params[-1][:-2] + '...'
    if name == '<init>':
        return '%s(%s)' % (simple(cls) if cls else 'new', ', '.join(params))
    return '%s %s(%s)' % (ret, name, ', '.join(params))


def field_sig(name, desc):
    try:
        t, _ = parse_type(desc, 0)
    except Exception:
        t = desc
    return '%s %s' % (t, name)


def slugify(s):
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s or 'x'


def excerpt(text, limit=190):
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) <= limit:
        return text
    return text[:limit - 3].rstrip() + '...'


def fmt_int(n):
    return '{:,}'.format(n)


# ---------------------------------------------------------------- registry

PAGES = []
SLUGS = set()
CATS = collections.OrderedDict()   # id -> dict(name, description, icon)


def claim(base):
    s = base
    n = 2
    while s in SLUGS:
        s = '%s-%d' % (base, n)
        n += 1
    SLUGS.add(s)
    return s


def link(cat, slug, text):
    return '[%s](%s/%s/%s)' % (text, BASE_URL, cat, slug)


def add_page(cat, slug, title, tags, exc, body, rel=()):
    PAGES.append({'cat': cat, 'slug': slug, 'title': title, 'tags': list(tags),
                  'excerpt': excerpt(exc), 'body': body, 'rel': list(rel)})


def emit_series(cat, base, title, tags, bodies, exc, rel=(), intro=''):
    """One page per body; returns the slugs. Multi-part series link each other."""
    n = len(bodies)
    slugs = [claim(base if n == 1 else '%s-part-%d' % (base, i + 1)) for i in range(n)]
    for i, b in enumerate(bodies):
        nav = ''
        r = list(rel)
        if n > 1:
            others = ', '.join(link(cat, slugs[j], 'part %d' % (j + 1))
                               for j in range(n) if j != i)
            nav = 'Part %d of %d. Other parts: %s.\n\n' % (i + 1, n, others)
            r = [slugs[j] for j in (i - 1, i + 1) if 0 <= j < n] + r
        t = title if n == 1 else '%s, part %d of %d' % (title, i + 1, n)
        add_page(cat, slugs[i], t, tags, exc, (intro + '\n\n' if intro and i == 0 else '') + nav + b, r)
    return slugs


def pack(items, weigh, maxw=PACK_WORDS, maxn=100000):
    pages, cur, w = [], [], 0
    for it in items:
        iw = weigh(it)
        if cur and (w + iw > maxw or len(cur) >= maxn):
            pages.append(cur)
            cur, w = [], 0
        cur.append(it)
        w += iw
    if cur:
        pages.append(cur)
    return pages


def table_bodies(header, rows, lead='', maxw=PACK_WORDS, maxn=100000):
    """Split table rows into page bodies, repeating the header."""
    hw = words(header)
    groups = pack(rows, lambda r: words(r), maxw - hw - words(lead), maxn)
    if not groups:
        groups = [[]]
    return [(lead + '\n\n' if lead else '') + header + '\n' + '\n'.join(g) for g in groups]


# ---------------------------------------------------------------- load


def load(api):
    D = {}
    D['classes'] = jl(os.path.join(api, 'classes.jsonl'))
    D['api'] = jl(os.path.join(api, 'api.jsonl'))
    D['exposed'] = jl(os.path.join(api, 'lua_exposed.jsonl'))
    D['globals'] = jl(os.path.join(api, 'lua_globals.jsonl'))
    D['events'] = jl(os.path.join(api, 'events.jsonl'))
    D['natives'] = jl(os.path.join(api, 'native_boundary.jsonl'))
    D['lua_files'] = jl(os.path.join(api, 'lua_files.jsonl'))
    D['blocks'] = jl(os.path.join(api, 'script_blocks.jsonl'))
    D['fields'] = jl(os.path.join(api, 'script_fields.jsonl'))
    D['sandbox'] = jl(os.path.join(api, 'sandbox_options.jsonl'))
    D['trans'] = jl(os.path.join(api, 'translations.jsonl'))
    calls_dir = os.path.join(api, 'calls')
    D['calls'] = [os.path.join(calls_dir, f) for f in sorted(os.listdir(calls_dir)) if f.endswith('.jsonl')]
    return D


# ---------------------------------------------------------------- java


def java_category(pkg, scope):
    parts = pkg.split('.')
    if scope == 'kahlua':
        return 'java-kahlua'
    if parts[0] == 'zombie':
        return 'java-' + (parts[1].lower() if len(parts) > 1 else 'zombie')
    return 'java-' + parts[0].lower()


def class_top_from_path(src_path):
    p = src_path
    i = p.find('/src/')
    if i >= 0:
        p = p[i + 5:]
    p = p.split('#')[0]
    if p.endswith('.java'):
        p = p[:-5]
    return p.replace('/', '.')


def build_call_maps(D, eng_names):
    nat_keys = {(n['c'], n['m'], n['sig']) for n in D['natives']}
    nat_names = {(n['c'], n['m']) for n in D['natives']}
    callee = collections.defaultdict(collections.Counter)
    caller = collections.defaultdict(collections.Counter)
    nat_called = collections.defaultdict(collections.Counter)
    nat_callers = collections.defaultdict(collections.Counter)
    for path in D['calls']:
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                r = json.loads(line)
                c = r['c']
                for owner, name, desc, _ln, _k in r['calls']:
                    if (owner, name) in nat_names and (owner, name, desc) in nat_keys:
                        nat_called[c][(owner, name)] += 1
                        nat_callers[(owner, name, desc)][c] += 1
                    if owner != c and owner in eng_names:
                        callee[c][owner + '#' + name] += 1
                        caller[owner][c] += 1
    return callee, caller, nat_called, nat_callers


def top(counter, n=10):
    items = sorted(counter.items(), key=lambda kv: (-kv[1], str(kv[0])))
    return items[:n], max(0, len(items) - n)


def render_class(c, members, tier_info, purposes, evmap, callee, caller, nat_called):
    name = c['c']
    fields = [m for m in members if m['k'] == 'field']
    ctors = [m for m in members if m['k'] == 'ctor']
    meths = [m for m in members if m['k'] == 'method']
    clinit = [m for m in members if m['k'] == 'clinit']

    def order(m):
        s = m.get('src') or ''
        ln = 10 ** 9
        if '#L' in s:
            ln = int(s.rsplit('#L', 1)[1])
        return (ln, m['m'], m['sig'])

    fields.sort(key=order)
    ctors.sort(key=order)
    meths.sort(key=order)

    def row(m, is_field):
        if is_field:
            sig = field_sig(m['m'], m['sig'])
            if m.get('cv') is not None:
                sig += ' = ' + str(m['cv'])
            sig = code(sig, 90)
        else:
            sig = code(method_sig(m['m'], m['sig'], m['fl'], name), 140)
        mods = [m['vis']] + [f for f in m['fl'] if f not in ('static', 'public', 'private', 'protected', 'enum', 'synthetic', 'varargs')]
        return '| %s | %s | %s | %s | %s |' % (
            sig, ' '.join(mods), 'yes' if 'static' in m['fl'] else '',
            'yes' if m.get('lua') else '', cite_cell(m.get('src')))

    frows = [row(m, True) for m in fields]
    mrows = [row(m, False) for m in ctors + meths]

    head = ['## `%s`' % name, '']
    kind = c['kind']
    mods = [c['vis']] + [f for f in c['fl'] if f not in ('public', 'private', 'protected', 'interface', 'enum', 'annotation', 'super', 'synthetic')]
    lines = ['- Kind: %s (%s)' % (kind, ' '.join(mods))]
    if c.get('anonymous'):
        lines.append('- Anonymous class declared in `%s`' % c.get('encl'))
    elif c.get('outer'):
        lines.append('- Nested in: `%s`' % c['outer'])
    if c.get('super') and c['super'] != 'java.lang.Object':
        lines.append('- Extends: `%s`' % c['super'])
    if c.get('ifaces'):
        lines.append('- Implements: ' + ', '.join('`%s`' % i for i in c['ifaces']))
    lines.append('- Lua tier: %s' % tier_info)
    s = c.get('src')
    if s:
        ln = c.get('src_line')
        lines.append('- Source: `%s`' % (cite(s) + (':%d' % ln if ln else '')))
    lines.append('- Members: fields %d, methods %d, constructors %d%s' % (
        len(fields), len(meths), len(ctors),
        (', static initializers %d' % len(clinit)) if clinit else ''))
    p = purposes.get(name)
    if p:
        lines.append('- What it is: %s' % p.replace('\n', ' '))
    head += lines + ['']

    tail = []
    ev = evmap.get(name, [])
    if ev:
        ev = sorted(ev, key=lambda t: (t[1], t[0]))
        shown = ', '.join('`%s` (line %d)' % (e, l) for e, l in ev[:10])
        more = ' (+%d more)' % (len(ev) - 10) if len(ev) > 10 else ''
        tail.append('- Events fired: %s%s' % (shown, more))
    nc = nat_called.get(name)
    if nc:
        items, more = top(nc)
        tail.append('- Natives called: %s%s' % (
            ', '.join('`%s#%s`' % (k[0], k[1]) for k, _ in items),
            ' (+%d more)' % more if more else ''))
    cr = caller.get(name)
    if cr:
        items, more = top(cr)
        tail.append('- Top callers: %s%s' % (
            ', '.join('`%s` (%d)' % (k, v) for k, v in items),
            ' (+%d more classes)' % more if more else ''))
    ce = callee.get(name)
    if ce:
        items, more = top(ce)
        tail.append('- Top callees: %s%s' % (
            ', '.join('`%s` (%d)' % (k, v) for k, v in items),
            ' (+%d more)' % more if more else ''))
    return {'name': name, 'head': head, 'frows': frows, 'mrows': mrows, 'tail': tail}


FH = '| Field | Mods | Static | Lua | Source |\n|---|---|---|---|---|'
MH = '| Method | Mods | Static | Lua | Source |\n|---|---|---|---|---|'


def class_text(d, frows=None, mrows=None, with_head=True, with_tail=True):
    frows = d['frows'] if frows is None else frows
    mrows = d['mrows'] if mrows is None else mrows
    out = []
    if with_head:
        out += d['head']
    if frows:
        out += ['**Fields**', '', FH] + frows + ['']
    if mrows:
        out += ['**Constructors and methods**', '', MH] + mrows + ['']
    if with_tail and d['tail']:
        out += d['tail'] + ['']
    return '\n'.join(out).rstrip() + '\n\n'

def giant_bodies(d):
    hw = words('\n'.join(d['head']))
    tw = words('\n'.join(d['tail']))
    budget = PACK_WORDS - hw - tw - 200
    items = [('F', r) for r in d['frows']] + [('M', r) for r in d['mrows']]
    groups = pack(items, lambda it: words(it[1]), budget)
    bodies = []
    for i, g in enumerate(groups):
        fr = [r for k, r in g if k == 'F']
        mr = [r for k, r in g if k == 'M']
        first, last = i == 0, i == len(groups) - 1
        txt = class_text(d, fr, mr, with_head=first, with_tail=last)
        if not first:
            txt = 'Members of `%s`, continued.\n\n' % d['name'] + txt
        bodies.append(txt)
    return bodies


def library_key(pkg):
    p = pkg.split('.')
    if p[0] in ('com', 'org', 'io', 'gnu', 'javax', 'de', 'pl', 'tis') and len(p) > 1:
        return '.'.join(p[:2])
    return p[0]


def gen_java(D, purposes):
    classes = D['classes']
    eng = [c for c in classes if c['scope'] in ('engine', 'kahlua')]
    eng_names = {c['c'] for c in eng}
    members = collections.defaultdict(list)
    for r in D['api']:
        members[r['c']].append(r)
    callee, caller, nat_called, nat_callers = build_call_maps(D, eng_names)

    # events fired per class (file level: the top-level class of the file)
    evmap = collections.defaultdict(list)
    for e in D['events']:
        for t in e.get('java_triggers', []):
            top_cls = class_top_from_path(t)
            ln = int(t.rsplit('#L', 1)[1]) if '#L' in t else 0
            evmap[top_cls].append((e['name'], ln))

    def tier_info(c):
        if c.get('lua_exposed'):
            return 'exposed (L0), members marked Lua are callable from a mod'
        if any(m.get('tier') == 'L1' for m in members.get(c['c'], [])):
            return 'reachable (L1), Lua can hold and pass these objects but cannot call methods on them'
        return 'not exposed (L3), changing it needs a Java patch'

    by_pkg = collections.defaultdict(list)
    for c in eng:
        by_pkg[c['pkg']].append(c)

    pkg_pages = {}   # pkg -> list of (slug, title)
    pkg_cat = {}
    cat_pkgs = collections.defaultdict(list)
    for pkg in sorted(by_pkg):
        scope = by_pkg[pkg][0]['scope']
        cat = java_category(pkg, scope)
        pkg_cat[pkg] = cat
        cat_pkgs[cat].append(pkg)
        CATS.setdefault(cat, None)

    # render
    pkg_slugs_pending = {}
    for pkg in sorted(by_pkg):
        cat = pkg_cat[pkg]
        cl = sorted(by_pkg[pkg], key=lambda c: (c['c'].lower(), c['c']))
        rendered = []
        giants = []
        for c in cl:
            d = render_class(c, members.get(c['c'], []), tier_info(c), purposes, evmap,
                             callee, caller, nat_called)
            txt = class_text(d)
            w = words(txt)
            if w > PACK_WORDS:
                giants.append(d)
            else:
                rendered.append((d, txt, w))
        slug_base = 'ref-java-' + slugify(pkg)
        tags = ['reference', 'java', cat[5:]]
        pages_here = []
        groups = pack(rendered, lambda t: t[2], PACK_WORDS - 600, PACK_CLASSES)
        # giants first so the regular pages can link to them
        giant_links = []
        for d in giants:
            sc = simple(d['name'])
            slugs = emit_series(
                cat, slug_base + '-' + slugify(sc), '%s (%s)' % (d['name'].split('.')[-1].replace('$', '.'), pkg),
                tags + ['large-class'], giant_bodies(d),
                'Fields, methods, callers and callees of the Java class %s.' % d['name'],
                rel=['ref-overview'])
            giant_links.append((d['name'], slugs))
            pages_here += [(s, d['name']) for s in slugs]
        if groups:
            bodies = []
            for g in groups:
                b = ''.join(t for _d, t, _w in g)
                bodies.append(b)
            lead = ''
            if giant_links:
                lead = 'Large classes with their own pages: ' + ', '.join(
                    link(cat, s[0], '`%s`' % n) for n, s in giant_links) + '.\n\n'
            bodies[0] = lead + bodies[0]
            slugs = emit_series(
                cat, slug_base, 'Java package %s' % pkg, tags, bodies,
                'Reference for the %d Java classes in %s: fields, methods, Lua tier, callers and callees.' % (
                    len(cl), pkg),
                rel=['ref-overview'])
            pages_here = [(s, pkg) for s in slugs] + pages_here
        pkg_pages[pkg] = pages_here
    return {'by_pkg': by_pkg, 'pkg_pages': pkg_pages, 'pkg_cat': pkg_cat, 'cat_pkgs': cat_pkgs,
            'nat_callers': nat_callers, 'eng': eng}


def finish_java_cats(cat_pkgs, by_pkg):
    for cat in cat_pkgs:
        pk = cat_pkgs[cat]
        n = sum(len(by_pkg[p]) for p in pk)
        if cat == 'java-kahlua':
            name, desc = 'Java: Kahlua', 'The Kahlua Lua VM classes (se.krka), %d classes.' % n
        elif cat == 'java-fmod':
            name, desc = 'Java: fmod', 'Sound engine wrapper classes in fmod, %d classes.' % n
        elif cat == 'java-astar':
            name, desc = 'Java: astar', 'Path search classes in astar, %d classes.' % n
        elif cat == 'java-n3d':
            name, desc = 'Java: N3D', 'The N3D test class, %d class.' % n
        else:
            lbl = cat[5:]
            name = 'Java: ' + (pk[0].split('.')[1] if '.' in pk[0] else pk[0])
            desc = 'Engine classes in %s and its subpackages, %d classes in %d packages.' % (
                '.'.join(pk[0].split('.')[:2]), n, len(pk))
            if cat == 'java-zombie':
                name, desc = 'Java: zombie', 'Engine classes directly in the zombie package, %d classes.' % n
        CATS[cat] = {'name': name, 'description': desc, 'icon': 'plug'}


# ---------------------------------------------------------------- lua files


def gen_lua(D):
    files = D['lua_files']
    groups = collections.defaultdict(list)
    for f in files:
        p = f['file'].split('/')
        folder = p[2] if len(p) > 3 else '(root)'
        groups[(f['side'], folder)].append(f)
    index_rows = []
    for side in ('client', 'server', 'shared'):
        cat = 'lua-' + side
        CATS[cat] = {'name': 'Lua: ' + side,
                     'description': 'Vanilla Lua files in media/lua/%s, one page per folder.' % side,
                     'icon': 'scroll'}
        for (s, folder) in sorted(groups, key=lambda k: (k[1].lower(), k[1])):
            if s != side:
                continue
            fl = sorted(groups[(s, folder)], key=lambda f: f['file'])
            secs = []
            for f in fl:
                secs.append(lua_section(f))
            bodies = [''.join(g) for g in pack(secs, words, PACK_WORDS - 300, 120)]
            fname = 'root' if folder == '(root)' else folder
            slugs = emit_series(
                cat, 'ref-lua-%s-%s' % (side, slugify(fname)),
                'Lua %s: %s' % (side, 'root files' if folder == '(root)' else folder),
                ['reference', 'lua', side, slugify(fname)], bodies,
                '%d vanilla Lua files in media/lua/%s/%s: requires, tables, functions, events hooked and globals written.' % (
                    len(fl), side, '' if folder == '(root)' else folder),
                rel=['ref-overview', 'ref-lua-index'])
            index_rows.append((side, fname, len(fl), sum(f['lines'] for f in fl), cat, slugs))
    return index_rows


def lua_section(f):
    L = ['## `%s`' % f['file'], '']
    L.append('- Lines: %d' % f['lines'])
    req = []
    for r in f['requires']:
        req.append(r if isinstance(r, str) else str(r.get('mod')))
    L.append('- Requires: ' + (', '.join('`%s`' % r for r in req) if req else 'none'))
    if f['tables']:
        L.append('- Tables: ' + ', '.join('`%s%s` (line %d)' % (
            'local ' if t.get('local') else '', t['name'], t['line']) for t in f['tables']))
    if f['functions']:
        L.append('- Functions: ' + ', '.join('`%s%s` (%d)' % (
            'local ' if x.get('local') else '', x['name'], x['line']) for x in f['functions']))
    if f['hooks']:
        L.append('- Events hooked: ' + ', '.join('`%s.%s` (%d)' % (h['event'], h['op'], h['line'])
                                                  for h in f['hooks']))
    if f['globals_written']:
        L.append('- Globals written: ' + ', '.join('`%s` (%d)' % (g['name'], g['line'])
                                                    for g in f['globals_written']))
    return '\n'.join(L) + '\n\n'


# ---------------------------------------------------------------- scripts


def gen_scripts(D):
    CATS['scripts'] = {'name': 'Script blocks',
                       'description': 'Every script block type with every field: count, example and first site.',
                       'icon': 'wrench'}
    blocks = collections.defaultdict(list)
    for b in D['blocks']:
        blocks[b['type']].append(b)
    fields = collections.defaultdict(list)
    for r in D['fields']:
        fields[r['type']].append(r)
    types = sorted(blocks, key=lambda t: (t.lower(), t))
    rows = []
    slug_of = {}
    for t in types:
        bl = sorted(blocks[t], key=lambda b: (b['file'], b['line']))
        files = {b['file'] for b in bl}
        parents = collections.Counter(b['parent'] or '(top level)' for b in bl)
        fr = sorted(fields.get(t, []), key=lambda r: (-r['count'], r['field']))
        lead = ['## Block type `%s`' % t, '',
                '- Blocks: %s in %d files' % (fmt_int(len(bl)), len(files)),
                '- Parent block types: ' + ', '.join('`%s` (%d)' % kv for kv in sorted(
                    parents.items(), key=lambda kv: (-kv[1], kv[0]))[:12]),
                '- Distinct fields: %d' % len(fr),
                '- Examples: ' + ', '.join('%s (`%s`)' % (code(b['name'], 40), cite(b['file'] + '#L%d' % b['line']))
                                          for b in bl[:5])]
        hdr = '| Field | Count | Example | First site |\n|---|---|---|---|'
        trs = ['| %s | %d | %s | %s |' % (code(r['field'], 50), r['count'], code(r['example'], 60),
                                         cite_cell(r['first'])) for r in fr]
        if trs:
            bodies = table_bodies(hdr, trs, '\n'.join(lead))
        else:
            bodies = ['\n'.join(lead) + '\n\nNo fields were recorded for this block type.']
        slugs = emit_series('scripts', 'ref-scripts-' + slugify(t), 'Script block: %s' % t,
                            ['reference', 'scripts', 'script-block', slugify(t)], bodies,
                            'Script block type %s: %s blocks, %d distinct fields, with example and first site for each.' % (
                                t, fmt_int(len(bl)), len(fr)),
                            rel=['ref-scripts-block-types'])
        slug_of[t] = slugs[0]
        rows.append('| %s | %s | %d | %d | %s |' % (code(t), fmt_int(len(bl)), len(files), len(fr),
                                                    link('scripts', slugs[0], 'page')))
    # fields not attached to a recognized block
    if '?' in fields:
        fr = sorted(fields['?'], key=lambda r: (-r['count'], r['field']))
        hdr = '| Field | Count | Example | First site |\n|---|---|---|---|'
        trs = ['| %s | %d | %s | %s |' % (code(r['field'], 50), r['count'], code(r['example'], 60),
                                         cite_cell(r['first'])) for r in fr]
        lead = ('Lines of the form `field = value` found inside blocks the indexer could not attribute '
                'to a block type (vehicle templates). They are grouped here under the type `?`.')
        emit_series('scripts', 'ref-scripts-unattached-fields', 'Script fields outside a known block',
                    ['reference', 'scripts'], table_bodies(hdr, trs, lead),
                    'Script fields the indexer could not attach to a block type.',
                    rel=['ref-scripts-block-types'])
    idx_hdr = '| Block type | Blocks | Files | Fields | Page |\n|---|---|---|---|---|'
    body = ('Every script block type found in the vanilla scripts, with its block count, '
            'the number of files it appears in and the number of distinct fields.\n\n'
            + '\n'.join(['Types: %d. Blocks: %s.' % (len(types), fmt_int(sum(len(v) for v in blocks.values()))), '',
                         idx_hdr] + rows))
    emit_series('scripts', 'ref-scripts-block-types', 'Script block types', ['reference', 'scripts', 'index'],
                [body], 'All %d script block types in Build 42 with block, file and field counts.' % len(types),
                rel=['ref-overview'])
    return slug_of


# ---------------------------------------------------------------- events


def gen_events(D):
    CATS['events'] = {'name': 'Events',
                      'description': 'Every Lua event and hook: parameters, registration, trigger sites and listeners.',
                      'icon': 'gear'}
    evs = sorted(D['events'], key=lambda e: (e['name'].lower(), e['name']))

    def sec(e):
        L = ['## `%s`' % e['name'], '']
        L.append('- Kind: %s (%s)' % (e['kind'], e['origin']))
        reg = e.get('registered') or []
        L.append('- Registered at: ' + (', '.join(cite_cell(r) for r in reg[:3]) if reg else 'not registered in Java'))
        L.append('- Parameters: ' + (', '.join(code(p, 60) for p in (e.get('params') or [])) or 'none')
                 + ' (argument counts: %s)' % ', '.join(str(a) for a in (e.get('arities') or [])))
        for label, key in (('Java trigger sites', 'java_triggers'), ('Lua trigger sites', 'lua_triggers')):
            lst = e.get(key, [])
            if lst:
                more = ' (+%d more)' % (len(lst) - 5) if len(lst) > 5 else ''
                L.append('- %s (%d): %s%s' % (label, len(lst), ', '.join(cite_cell(x) for x in lst[:5]), more))
            else:
                L.append('- %s: none' % label)
        ls = e.get('lua_listeners', [])
        if ls:
            more = ' (+%d more)' % (len(ls) - 3) if len(ls) > 3 else ''
            L.append('- Lua listeners: %d, for example %s%s' % (len(ls), ', '.join(cite_cell(x) for x in ls[:3]), more))
        else:
            L.append('- Lua listeners: 0')
        return '\n'.join(L) + '\n\n'

    groups = pack(evs, lambda e: words(sec(e)), PACK_WORDS - 300, 45)
    bodies = [''.join(sec(e) for e in g) for g in groups]
    slugs = emit_series('events', 'ref-events', 'Events', ['reference', 'events'], bodies,
                        'Lua events and hooks of Build 42, in alphabetical parts: parameters, trigger sites and listeners.',
                        rel=['ref-events-index'])
    rows = []
    for gi, g in enumerate(groups):
        for e in g:
            rows.append('| %s | %s | %s | %d | %d | %d | %s |' % (
                code(e['name']), e['kind'], e['origin'], e['n_java_triggers'], e['n_lua_triggers'],
                e['n_lua_listeners'], link('events', slugs[gi], 'part %d' % (gi + 1))))
    hdr = '| Event | Kind | Origin | Java triggers | Lua triggers | Lua listeners | Page |\n|---|---|---|---|---|---|---|'
    cnt = collections.Counter(e['origin'] for e in evs)
    lead = ('Events are named signals the engine or a Lua file fires. Mods listen with `Events.Name.Add(fn)`. '
            'Origin `java` means registered in the engine, `lua` means created by a Lua file, `lua-hook-only` '
            'and `java-unregistered` are edge cases. Counts: %s.\n\nParameters come from the trigger sites, as '
            'source text, not types.' % ', '.join('%s %d' % kv for kv in sorted(cnt.items())))
    emit_series('events', 'ref-events-index', 'Events index', ['reference', 'events', 'index'],
                table_bodies(hdr, rows, lead), 'Index of all %d Build 42 Lua events and hooks.' % len(evs),
                rel=['ref-overview'])
    return slugs


# ---------------------------------------------------------------- globals


def gen_globals(D):
    CATS['globals'] = {'name': 'Lua globals',
                       'description': 'The global Lua functions the engine provides, with signatures and source lines.',
                       'icon': 'gear'}
    gl = sorted(D['globals'], key=lambda g: (g['name'].lower(), g['name']))
    rows = []
    for g in gl:
        sigs = []
        srcs = []
        classes = []
        for d in g['defs']:
            sigs.append(method_sig(d['m'], d['sig'], []))
            srcs.append(cite(d.get('src')))
            classes.append(simple(d['c']))
        rows.append((g['name'], '| %s | %s | %s | %s | %s |' % (
            code(g['name']), '; '.join(code(s, 120) for s in sigs), g['scope'],
            ', '.join(code(c) for c in sorted(set(classes))),
            ', '.join(code(s) for s in srcs if s) or '-')))
    hdr = '| Global | Signature | Scope | Class | Source |\n|---|---|---|---|---|'
    groups = pack(rows, lambda r: words(r[1]), PACK_WORDS - 300, 100)
    bodies = []
    for g in groups:
        bodies.append(hdr + '\n' + '\n'.join(r[1] for r in g))
    lead = ('Global functions are callable from any Lua file by bare name. Overloads share one row. '
            'Count: %d names.' % len(gl))
    slugs = emit_series('globals', 'ref-globals', 'Lua globals', ['reference', 'globals', 'lua-api'],
                        bodies, 'All %d global Lua functions of Build 42 with signatures and source lines.' % len(gl),
                        rel=['ref-overview'], intro=lead)
    return slugs


# ---------------------------------------------------------------- sandbox


def gen_sandbox(D):
    CATS['sandbox-options'] = {'name': 'Sandbox options',
                               'description': 'All sandbox options by settings page: type, default, range, key and source.',
                               'icon': 'settings'}
    pages = collections.defaultdict(list)
    for s in D['sandbox']:
        pages[s['page'] or 'Other'].append(s)
    hdr = ('| Option | Type | Default | Min | Max | Translation key | Label | Source |\n'
           '|---|---|---|---|---|---|---|---|')
    out = {}
    for p in sorted(pages, key=lambda x: (x.lower(), x)):
        opts = sorted(pages[p], key=lambda s: (s['page_order'] if s['page_order'] is not None else 10 ** 6, s['name']))
        rows = ['| %s | %s | %s | %s | %s | %s | %s | %s |' % (
            code(s['name']), s['type'], code(s['default']) if s['default'] is not None else '',
            s['min'] if s['min'] is not None else '', s['max'] if s['max'] is not None else '',
            code(s['translation_key']), esc(s.get('label_en') or ''), cite_cell(s.get('src'))) for s in opts]
        lead = ('Sandbox page: %s. %d options.%s' % (
            p, len(opts), ' These options have no page in the sandbox screen script.' if p == 'Other' else ''))
        out[p] = emit_series('sandbox-options', 'ref-sandbox-' + slugify(p), 'Sandbox options: %s' % p,
                             ['reference', 'sandbox', 'sandbox-options'], table_bodies(hdr, rows, lead),
                             '%d sandbox options on the %s page: type, default, range, translation key and source.' % (
                                 len(opts), p), rel=['ref-overview'])
    return out


# ---------------------------------------------------------------- translations


def gen_translations(D):
    CATS['translations'] = {'name': 'Translations',
                            'description': 'Translation file types with key counts per language and key prefixes.',
                            'icon': 'globe'}
    byfile = collections.defaultdict(list)
    for t in D['trans']:
        byfile[t['file']].append(t)
    idx = []
    for fname in sorted(byfile, key=lambda x: (x.lower(), x)):
        rows = sorted(byfile[fname], key=lambda t: t['lang'])
        ref = next((t for t in rows if t['lang'] == 'EN'), rows[0])
        prefs = sorted(ref['prefixes'].items(), key=lambda kv: (-kv[1], kv[0]))
        L = ['- File type: %s (format %s)' % (code(fname), ref['format']),
             '- Languages: %d' % len(rows),
             '- Prefixes shown are from %s.' % ref['lang'], '',
             '| Language | Keys | Duplicate keys | Path |', '|---|---|---|---|']
        L += ['| %s | %d | %d | %s |' % (t['lang'], t['keys'], t['duplicate_keys'], code(t['path'])) for t in rows]
        L += ['', '**Key prefixes**', '', '| Prefix | Keys |', '|---|---|']
        L += ['| %s | %d |' % (code(k), v) for k, v in prefs[:80]]
        if len(prefs) > 80:
            L.append('| (%d more prefixes) | |' % (len(prefs) - 80))
        slugs = emit_series('translations', 'ref-translations-' + slugify(fname), 'Translation file: %s' % fname,
                            ['reference', 'translations', ref['format']], ['\n'.join(L)],
                            'Translation file %s: key counts in %d languages and its key prefixes.' % (fname, len(rows)),
                            rel=['ref-translations-index'])
        idx.append('| %s | %s | %d | %d | %s |' % (code(fname), ref['format'], len(rows), ref['keys'],
                                                  link('translations', slugs[0], 'page')))
    hdr = '| File type | Format | Languages | Keys (EN) | Page |\n|---|---|---|---|---|'
    langs = sorted({t['lang'] for t in D['trans']})
    lead = ('%d translation files in %d languages (%s). Each page lists the key count per language.' % (
        len(D['trans']), len(langs), ', '.join(langs)))
    emit_series('translations', 'ref-translations-index', 'Translation files', ['reference', 'translations', 'index'],
                [lead + '\n\n' + hdr + '\n' + '\n'.join(idx)],
                'Index of the %d Build 42 translation file types.' % len(byfile), rel=['ref-overview'])


# ---------------------------------------------------------------- natives


def gen_natives(D, nat_callers):
    CATS['natives'] = {'name': 'Native libraries',
                       'description': 'Every native method of the engine, by library, with its Java callers.',
                       'icon': 'plug'}
    bylib = collections.defaultdict(list)
    for n in D['natives']:
        libs = n['libs'] or ['(no library found)']
        for lib in libs:
            bylib[lib].append(n)
    out = {}
    hdr = '| Class | Native method | Evidence | Java callers | Source |\n|---|---|---|---|---|'
    for lib in sorted(bylib, key=lambda x: (x.lower(), x)):
        ns = sorted(bylib[lib], key=lambda n: (n['c'], n['m'], n['sig']))
        ev = collections.Counter(n['evidence'] for n in ns)
        rows = []
        for n in ns:
            cs, more = top(nat_callers.get((n['c'], n['m'], n['sig']), {}), 5)
            callers = ', '.join('`%s`' % k for k, _ in cs)
            if more:
                callers += ' (+%d more)' % more
            rows.append('| %s | %s | %s | %s | %s |' % (
                code(n['c']), code(method_sig(n['m'], n['sig'], []), 120), n['evidence'],
                callers or 'none found', cite_cell(n.get('src'))))
        lead = ('Library: `%s`. Native methods: %d in %d classes. Evidence: %s.\n\n'
                'Evidence `jni-export` means the library exports the exact symbol. The library is closed '
                'source: what a native method does cannot be read here.' % (
                    lib, len(ns), len({n['c'] for n in ns}), ', '.join('%s %d' % kv for kv in sorted(ev.items()))))
        stem = re.sub(r'\.dll$', '', lib, flags=re.I)
        out[lib] = emit_series('natives', 'ref-natives-' + slugify(stem), 'Native library: %s' % lib,
                               ['reference', 'natives', slugify(stem)], table_bodies(hdr, rows, lead),
                               'All %d native methods bound to %s with declaring class and Java callers.' % (len(ns), lib),
                               rel=['ref-overview'])
    return out, bylib


# ---------------------------------------------------------------- bundled


def bundled_page(D):
    libs = collections.defaultdict(lambda: [0, collections.Counter()])
    for c in D['classes']:
        if c['scope'] == 'bundled':
            k = library_key(c['pkg'])
            libs[k][0] += 1
            libs[k][1][c['pkg']] += 1
    total = sum(v[0] for v in libs.values())
    rows = []
    for k in sorted(libs, key=lambda x: (-libs[x][0], x)):
        n, pk = libs[k]
        rows.append('| %s | %s | %d | %s |' % (code(k), fmt_int(n), len(pk), code(sorted(pk)[0])))
    body = ('The game jar bundles %s third-party classes (libraries such as lwjgl, bouncycastle and kotlin). '
            'They are counted here per library and not documented class by class.\n\n'
            '| Library | Classes | Packages | First package |\n|---|---|---|---|\n' % fmt_int(total)) + '\n'.join(rows)
    emit_series('overview', 'ref-bundled-libraries', 'Bundled third-party libraries', ['reference', 'libraries'],
                [body], '%s bundled third-party classes in %d libraries, counted per library.' % (fmt_int(total), len(libs)),
                rel=['ref-overview'])
    return total, len(libs)


# ---------------------------------------------------------------- indexes and overview


def gen_indexes_and_overview(D, J, lua_idx, script_slugs, event_slugs, glob_slugs, sb_slugs, nat_out, bundled, ntrans):
    eng = J['eng']
    cat_list = sorted(J['cat_pkgs'])
    # java index
    rows = []
    for cat in cat_list:
        for pkg in J['cat_pkgs'][cat]:
            pl = J['pkg_pages'][pkg]
            links = ', '.join(link(cat, s, simple(n) if n != pkg else 'page') if n != pkg else link(cat, s, 'page')
                              for s, n in pl)
            rows.append('| %s | %s | %d | %s |' % (code(pkg), cat, len(J['by_pkg'][pkg]), links))
    hdr = '| Package | Category | Classes | Pages |\n|---|---|---|---|'
    groups = pack(rows, words, PACK_WORDS - 300)
    emit_series('overview', 'ref-java-index', 'Java packages index', ['reference', 'java', 'index'],
                ['\n'.join([hdr] + g) for g in groups],
                'Every engine and Kahlua Java package in Build 42 with class counts and page links.',
                rel=['ref-overview'])
    # lua index
    rows = []
    for side, folder, nf, nl, cat, slugs in lua_idx:
        rows.append('| %s | %s | %d | %s | %s |' % (side, code(folder), nf, fmt_int(nl),
                                                    ', '.join(link(cat, s, 'part %d' % (i + 1) if len(slugs) > 1 else 'page')
                                                              for i, s in enumerate(slugs))))
    hdr = '| Side | Folder | Files | Lines | Pages |\n|---|---|---|---|---|'
    emit_series('overview', 'ref-lua-index', 'Vanilla Lua folders index', ['reference', 'lua', 'index'],
                [hdr + '\n' + '\n'.join(rows)], 'Every vanilla Lua folder in client, server and shared with file and line counts.',
                rel=['ref-overview'])

    ncl = collections.Counter(c['scope'] for c in D['classes'])
    mem = collections.Counter(m['k'] for m in D['api'])
    libs = collections.Counter()
    for n in D['natives']:
        for lib in (n['libs'] or ['(no library found)']):
            libs[lib] += 1
    nblocks = len(D['blocks'])
    ntypes = len({b['type'] for b in D['blocks']})

    def first(cat, slugs):
        return link(cat, slugs[0], 'start')

    L = []
    L.append('This reference lists what the Build 42 game contains, taken straight from the game files. '
             'It is a lookup, not a tutorial. Every entry carries a source citation.')
    L += ['', '## How it is organized', '',
          '| Category | What it holds | Start |', '|---|---|---|',
          '| `java-*` | Engine Java classes, one category per top package (`java-iso`, `java-characters`, ...), a page per package | %s |' % link('overview', 'ref-java-index', 'Java index'),
          '| `lua-client`, `lua-server`, `lua-shared` | Vanilla Lua files, a page per folder | %s |' % link('overview', 'ref-lua-index', 'Lua index'),
          '| `scripts` | Script block types and every field | %s |' % link('scripts', 'ref-scripts-block-types', 'block types'),
          '| `events` | Lua events and hooks | %s |' % link('events', 'ref-events-index', 'events index'),
          '| `globals` | Global Lua functions | %s |' % first('globals', glob_slugs),
          '| `sandbox-options` | Sandbox options by page | %s |' % first('sandbox-options', next(iter(sb_slugs.values()))),
          '| `translations` | Translation file types | %s |' % link('translations', 'ref-translations-index', 'translation files'),
          '| `natives` | Native methods by library | %s |' % first('natives', next(iter(nat_out.values()))),
          '| Bundled libraries | Third-party classes, counted per library | %s |' % link('overview', 'ref-bundled-libraries', 'libraries')]
    L += ['', '## Counts', '',
          '| Item | Count |', '|---|---|',
          '| Engine classes (zombie, fmod, astar, N3D) | %s |' % fmt_int(ncl['engine']),
          '| Kahlua classes (the Lua VM) | %s |' % fmt_int(ncl['kahlua']),
          '| Bundled third-party classes (counted only) | %s |' % fmt_int(ncl['bundled']),
          '| Fields | %s |' % fmt_int(mem['field']),
          '| Methods | %s |' % fmt_int(mem['method']),
          '| Constructors | %s |' % fmt_int(mem['ctor']),
          '| Lua events and hooks | %d |' % len(D['events']),
          '| Global Lua functions | %d |' % len(D['globals']),
          '| Sandbox options | %d |' % len(D['sandbox']),
          '| Vanilla Lua files | %s |' % fmt_int(len(D['lua_files'])),
          '| Script block types | %d |' % ntypes,
          '| Script blocks | %s |' % fmt_int(nblocks),
          '| Translation files | %s |' % fmt_int(len(D['trans'])),
          '| Native methods | %d |' % len(D['natives'])]
    L += ['', '## What the Lua tiers mean', '',
          'Each class and member has a tier. It answers: can a mod do this?', '',
          '| Tier | Meaning | Verdict |', '|---|---|---|',
          '| L0 | Lua can call it directly today | Possible |',
          '| L1 | Lua can reach the object by walking from an exposed one, up to 3 steps. It can hold and pass it but not call methods on it | Possible |',
          '| L2 | Only through an event hook, no direct setter. Not assigned in these pages | Possible, limited |',
          '| L3 | Needs a Java patch: a loose class file placed ahead of the game jar | Possible, high cost |',
          '| L4 | Hardcoded, native (inside a DLL) or fixed at compile time | Not possible |',
          '', 'In the class tables, the column Lua is `yes` for L0 members. Each class shows its own tier line.']
    L += ['', '## How to read a citation', '',
          'A citation such as `zombie/iso/IsoGridSquare.java:101` names a file and a line. '
          'Java files are the decompiled game source, so lines match the decompiled text, not the original source. '
          'A citation such as `lua/client/ISUI/ISFoo.lua:12` is a vanilla Lua file. Script citations such as '
          '`scripts/generated/items/container.txt:3987` are script files. A dash means the member could not be placed in the source '
          '(bridge methods, lambdas, enum helpers).']
    L += ['', '## Closed native libraries', '',
          'These DLLs ship with the game without source. Their behavior cannot be read in these pages. '
          'Each library page lists its native methods and the Java classes that call them.', '',
          '| Library | Native methods | Page |', '|---|---|---|']
    for lib in sorted(libs, key=lambda x: (-libs[x], x)):
        L.append('| %s | %d | %s |' % (code(lib), libs[lib], link('natives', nat_out[lib][0], 'page')))
    L += ['', '## Known limits', '',
          '- Calls through reflection, Lua and some dynamic dispatch are not in the caller and callee lists.',
          '- Event parameters are source text from trigger sites, not types.',
          '- The events a class fires are matched by source file, so a nested class shares its file\'s list.',
          '- Bundled third-party classes are counted only.']
    L += ['', SOURCE_LINE]
    emit_series('overview', 'ref-overview', 'Build 42 Reference: start here', ['reference', 'overview'],
                ['\n'.join(L)],
                'How the Build 42 reference is organized: Java classes, Lua files, scripts, events, globals, sandbox options, translations and natives.',
                rel=['ref-java-index', 'ref-lua-index', 'ref-bundled-libraries'])
    CATS['overview'] = {'name': 'Overview', 'description': 'Start here: how the reference is organized, counts and indexes.',
                        'icon': 'book'}


# ---------------------------------------------------------------- write


def yq(s):
    return json.dumps(s, ensure_ascii=True)


def write_all(out):
    if os.path.isdir(out):
        if os.path.basename(os.path.normpath(out)) != 'reference':
            sys.exit('refusing to clear %s (not a folder named reference)' % out)
        shutil.rmtree(out)
    os.makedirs(out)
    with open(os.path.join(out, '_section.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'name': 'Build 42 Reference',
                   'description': 'The complete Build 42 reference, generated from the engine: Java classes, Lua files, scripts, events, globals, sandbox options, translations and natives.',
                   'icon': 'book', 'displayOrder': 7}, f, indent=2)
        f.write('\n')
    order = ['overview'] + sorted(c for c in CATS if c.startswith('java-')) + [
        'lua-client', 'lua-server', 'lua-shared', 'scripts', 'events', 'globals', 'sandbox-options',
        'translations', 'natives']
    slugcat = {p['slug']: p['cat'] for p in PAGES}
    for i, cat in enumerate(order):
        info = CATS[cat]
        d = os.path.join(out, cat)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, '_category.json'), 'w', encoding='utf-8', newline='\n') as f:
            json.dump({'name': info['name'], 'description': info['description'], 'icon': info['icon'],
                       'displayOrder': i + 1}, f, indent=2)
            f.write('\n')
    total = 0
    for p in PAGES:
        rel = []
        for s in p['rel']:
            if s in slugcat and s != p['slug'] and s not in rel:
                rel.append(s)
        fm = ['---', 'id: build-42-%s' % p['slug'], 'slug: %s' % p['slug'], 'title: %s' % yq(p['title']),
              'game: pz', 'version: build-42', 'section: %s' % SECTION, 'category: %s' % p['cat'],
              'difficulty: advanced', 'tags:'] + ['  - %s' % t for t in p['tags']] + [
            'excerpt: %s' % yq(p['excerpt']), "last_updated: '%s'" % LAST_UPDATED]
        if rel:
            fm.append('related_articles:')
            fm += ['  - %s' % s for s in rel[:8]]
        fm.append('---')
        text = '\n'.join(fm) + '\n\n' + p['body'].rstrip() + '\n'
        path = os.path.join(out, p['cat'], p['slug'] + '.md')
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        total += len(text.encode('utf-8'))
    return total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--api', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--purposes', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'purposes.jsonl'))
    a = ap.parse_args()
    D = load(a.api)
    purposes = {}
    if os.path.isfile(a.purposes):
        for r in jl(a.purposes):
            # Lines marked low confidence wait for a reading of the source; they are not published.
            if r.get('confidence', 'high') != 'low':
                purposes[r['c']] = r['purpose']
    J = gen_java(D, purposes)
    finish_java_cats(J['cat_pkgs'], J['by_pkg'])
    lua_idx = gen_lua(D)
    script_slugs = gen_scripts(D)
    event_slugs = gen_events(D)
    glob_slugs = gen_globals(D)
    sb = gen_sandbox(D)
    gen_translations(D)
    nat_out, _ = gen_natives(D, J['nat_callers'])
    bundled = bundled_page(D)
    gen_indexes_and_overview(D, J, lua_idx, script_slugs, event_slugs, glob_slugs, sb, nat_out, bundled, 0)
    total = write_all(a.out)
    print('pages: %d, categories: %d, bytes: %d' % (len(PAGES), len(CATS), total))


if __name__ == '__main__':
    main()
