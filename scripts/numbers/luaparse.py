"""A small reader for the Lua table literals in the vanilla loot files, standard library only.

It reads only this subset and stops with an error on anything else:
  - top-level statements of the form   [local] name[.name]* = <value> [;]
  - values: "string", 'string', numbers, true, false, nil, { table }, and (only when allow_refs is
    set) a dotted name such as ClutterTables.TrunkJunk, kept as a Ref
  - tables: positional values, name = value, ["string"] = value, separated by , or ;
  - comments: -- line comments and --[[ block comments ]]
"""
import re


class LuaError(Exception):
    pass


class Ref(object):
    def __init__(self, name, line):
        self.name = name
        self.line = line


class Table(object):
    def __init__(self, line):
        self.line = line
        self.pos = []      # [(value, line)]
        self.keys = []     # [(key, value, line)]
        self.dup = []      # keys that were set twice

    def get(self, key, default=None):
        found = default
        for k, v, _l in self.keys:
            if k == key:
                found = v
        return found

    def get_line(self, key):
        found = None
        for k, _v, l in self.keys:
            if k == key:
                found = l
        return found


TOKEN = re.compile(r'''
    (?P<ws>\s+)
  | (?P<bcomment>--\[(?P<eq>=*)\[.*?\](?P=eq)\])
  | (?P<lcomment>--[^\n]*)
  | (?P<number>-?(?:0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][-+]?\d+)?|\.\d+))
  | (?P<string>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')
  | (?P<name>[A-Za-z_][A-Za-z_0-9]*)
  | (?P<punct>[{}\[\]=,;.])
''', re.X | re.S)


def tokenize(text):
    toks = []
    pos = 0
    line = 1
    n = len(text)
    while pos < n:
        m = TOKEN.match(text, pos)
        if not m:
            raise LuaError('line %d: cannot read %r' % (line, text[pos:pos + 30]))
        kind = m.lastgroup
        if kind == 'eq':
            kind = 'bcomment'
        s = m.group(0)
        if m.group('ws') is None and m.group('bcomment') is None and m.group('lcomment') is None:
            if m.group('number') is not None:
                toks.append(('number', s, line))
            elif m.group('string') is not None:
                toks.append(('string', s, line))
            elif m.group('name') is not None:
                toks.append(('name', s, line))
            else:
                toks.append(('punct', s, line))
        line += s.count('\n')
        pos = m.end()
    return toks


def unquote(s):
    body = s[1:-1]
    if '\\' in body:
        body = re.sub(r'\\(.)', lambda m: {'n': '\n', 't': '\t'}.get(m.group(1), m.group(1)), body)
    return body


class Parser(object):
    def __init__(self, text, allow_refs=False):
        self.t = tokenize(text)
        self.i = 0
        self.allow_refs = allow_refs

    def peek(self):
        return self.t[self.i] if self.i < len(self.t) else ('eof', '', 0)

    def take(self):
        tok = self.peek()
        self.i += 1
        return tok

    def expect(self, s):
        tok = self.take()
        if tok[1] != s or tok[0] not in ('punct',):
            raise LuaError('line %d: expected %r, found %r' % (tok[2], s, tok[1]))

    def value(self):
        kind, s, line = self.peek()
        if kind == 'number':
            self.take()
            return float(int(s, 16)) if s.lower().startswith(('0x', '-0x')) else (float(s) if ('.' in s or 'e' in s.lower()) else int(s))
        if kind == 'string':
            self.take()
            return unquote(s)
        if kind == 'name':
            if s in ('true', 'false'):
                self.take()
                return s == 'true'
            if s == 'nil':
                self.take()
                return None
            if self.allow_refs:
                self.take()
                parts = [s]
                while self.peek()[1] == '.' and self.peek()[0] == 'punct':
                    self.take()
                    parts.append(self.take()[1])
                return Ref('.'.join(parts), line)
            raise LuaError('line %d: unsupported value %r' % (line, s))
        if kind == 'punct' and s == '{':
            return self.table()
        raise LuaError('line %d: unsupported value %r' % (line, s))

    def table(self):
        _k, _s, line = self.take()
        tb = Table(line)
        while True:
            kind, s, l = self.peek()
            if kind == 'punct' and s == '}':
                self.take()
                return tb
            if kind == 'eof':
                raise LuaError('line %d: table not closed' % line)
            # name = value
            if kind == 'name' and self.i + 1 < len(self.t) and self.t[self.i + 1][1] == '=' and self.t[self.i + 1][0] == 'punct':
                self.take()
                self.take()
                v = self.value()
                if any(k == s for k, _v, _l in tb.keys):
                    tb.dup.append(s)
                tb.keys.append((s, v, l))
            elif kind == 'punct' and s == '[':
                self.take()
                k = self.take()
                if k[0] not in ('string', 'number'):
                    raise LuaError('line %d: unsupported key' % k[2])
                self.expect(']')
                self.expect('=')
                v = self.value()
                key = unquote(k[1]) if k[0] == 'string' else k[1]
                if any(kk == key for kk, _v, _l in tb.keys):
                    tb.dup.append(key)
                tb.keys.append((key, v, l))
            else:
                tb.pos.append((self.value(), l))
            kind, s, l = self.peek()
            if kind == 'punct' and s in (',', ';'):
                self.take()
            elif not (kind == 'punct' and s == '}'):
                raise LuaError('line %d: expected , or } but found %r' % (l, s))

    def statements(self):
        """Yield (dotted name, value, line) for every top-level assignment."""
        out = []
        while self.peek()[0] != 'eof':
            kind, s, line = self.take()
            if kind == 'name' and s == 'local':
                kind, s, line = self.take()
            if kind != 'name':
                raise LuaError('line %d: unsupported statement start %r' % (line, s))
            name = [s]
            while self.peek()[1] == '.' and self.peek()[0] == 'punct':
                self.take()
                name.append(self.take()[1])
            nk, ns, nl = self.take()
            if ns != '=' or nk != 'punct':
                raise LuaError('line %d: unsupported statement (%s ...), only assignments are read' % (line, '.'.join(name)))
            v = self.value()
            if isinstance(v, Ref) and self.peek() == ('name', 'or', self.peek()[2]):
                self.take()           # NAME = NAME or { ... }
                v = self.value()
            out.append(('.'.join(name), v, line))
            if self.peek()[1] == ';' and self.peek()[0] == 'punct':
                self.take()
        return out


def parse_file(path, allow_refs=False):
    with open(path, encoding='utf-8-sig', errors='replace', newline='') as f:
        text = f.read().replace('\r\n', '\n').replace('\r', '\n')
    return Parser(text, allow_refs).statements()
