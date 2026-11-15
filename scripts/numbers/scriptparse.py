"""Reader for Project Zomboid script files (media/scripts/**/*.txt), standard library only.

It follows the engine's own reader step by step:
  - comments: ScriptParser.stripComments (nested /* */ removed); here the removed text is replaced by
    the same number of newlines so line numbers stay true to the file.
  - blocks and values: ScriptParser.readBlock (a value ends at ',', a block starts at '{', a block ends
    at '}'; a last value with no comma before '}' is dropped, exactly as the engine drops it).
  - a module block holds top-level blocks (ScriptManager.CreateFromToken, ScriptModule.CreateFromTokenPP).
"""
import bisect
import os
import re

STRUCT = re.compile(r'[{},}]')


class Block(object):
    __slots__ = ('type', 'id', 'line', 'elements', 'header')

    def __init__(self, type_=None, id_=None, line=0, header=''):
        self.type = type_
        self.id = id_
        self.line = line
        self.header = header
        self.elements = []      # ('v', key, value, line) or ('b', Block)

    def values(self):
        return [e for e in self.elements if e[0] == 'v']

    def children(self, type_=None):
        return [e[1] for e in self.elements if e[0] == 'b' and (type_ is None or e[1].type == type_)]


def strip_comments(text):
    """Remove /* */ comments, nested ones included, keeping newlines."""
    out = []
    depth = 0
    i = 0
    n = len(text)
    while i < n:
        two = text[i:i + 2]
        if two == '/*':
            depth += 1
            i += 2
        elif two == '*/' and depth > 0:
            depth -= 1
            i += 2
        else:
            c = text[i]
            if depth == 0:
                out.append(c)
            elif c == '\n':
                out.append('\n')
            i += 1
    return ''.join(out)


def parse_text(text):
    """Return the list of top-level blocks of a cleaned text (a file holds 'module X { ... }')."""
    nl = [m.start() for m in re.finditer('\n', text)]

    def line_at(pos):
        # 1-based line of the first non-space character at or after pos
        while pos < len(text) and text[pos] in ' \t\r\n':
            pos += 1
        return bisect.bisect_left(nl, pos) + 1

    n = len(text)

    def read_block(start, block, first):
        """Mirror of ScriptParser.readBlock. Returns the index after the closing brace."""
        pos = first
        while True:
            m = STRUCT.search(text, pos)
            if not m:
                return n
            i = m.start()
            c = text[i]
            if c == '{':
                header = text[start:i].strip()
                parts = header.split()
                child = Block(parts[0] if parts else '', parts[1] if len(parts) > 1 else None, line_at(start), header)
                block.elements.append(('b', child))
                end = read_block(i + 1, child, i + 1)
                start = end
                pos = end + 1          # the engine's for-loop skips the character after '}'
            elif c == '}':
                return i + 1
            else:
                s = text[start:i]
                block.elements.append(('v', s, None, line_at(start)))
                start = i + 1
                pos = i + 1

    root = Block()
    read_block(0, root, 0)
    return root


def kv(s):
    p = s.find('=')
    if p == -1:
        return s.strip(), ''
    return s[:p].strip(), s[p + 1:].strip()


def load_file(path):
    with open(path, encoding='utf-8-sig', errors='replace', newline='') as f:
        raw = f.read().replace('\r\n', '\n').replace('\r', '\n')
    return parse_text(strip_comments(raw))


def module_blocks(root):
    """Yield (module_name, [top-level blocks]) for every 'module X { }' block in a parsed file."""
    for e in root.elements:
        if e[0] == 'b' and e[1].type == 'module':
            yield e[1].id, [c for c in e[1].elements if c[0] == 'b']


def block_name(b, tag):
    """The name the engine gives a block: the header with the type word removed, trimmed
    (ScriptBucket.CreateFromTokenPP: name = header.replace(tag, "").trim())."""
    return b.header.replace(tag, '').strip()


def top_blocks(scripts_dir, tags):
    """Return {tag: [(module, name, relpath, block)]} for the top-level blocks whose header starts with a tag.

    tags is a list such as ['item', 'craftRecipe', 'vehicle', 'template vehicle']. Files are read in the engine's order
    (template_ files first, then the lower-cased relative path; ScriptManager.java:1658-1675).
    """
    found = {}
    files = []
    for dp, _dn, fn in os.walk(scripts_dir):
        for f in fn:
            if f.lower().endswith('.txt'):
                files.append(os.path.join(dp, f))
    # ScriptManager.loadScripts: files named template_* first, then the lower-cased relative path
    files.sort(key=lambda p: (not os.path.basename(p).lower().startswith('template_'),
                              os.path.relpath(p, scripts_dir).replace(os.sep, '/').lower()))
    for p in files:
        rel = 'scripts/' + os.path.relpath(p, scripts_dir).replace(os.sep, '/')
        root = load_file(p)
        for mod, blocks in module_blocks(root):
            for _k, b in blocks:
                hw = b.header.split()
                for tag in tags:
                    tw = tag.split()
                    if hw[:len(tw)] == tw and len(hw) > len(tw):
                        found.setdefault(tag, []).append((mod, block_name(b, tag), rel, b))
                        break
    return found
