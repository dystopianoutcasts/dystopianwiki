/**
 * Small, dependency-free scanners for decompiled Java and vanilla Lua source, used by
 * extract-lua-surface.ts. They read structure (blocks, method headers, guards, argument
 * shapes); nothing they return carries a statement or a method body, only names, types,
 * line numbers and short condition summaries.
 */

// ---------------------------------------------------------------------------------------
// Shared: side judgement from multiplayer flags
// ---------------------------------------------------------------------------------------

/** What a guard says about the process: S = GameServer.server / isServer(), C = GameClient.client / isClient(). */
export interface Flags {
  server?: boolean
  client?: boolean
}

export type Side = 'client' | 'server' | 'both' | 'single-player' | 'unknown'

/**
 * A guard described by the flags it sets, not by its source text: `GameServer.server`,
 * `!GameClient.client`, `isServer()`, `not isClient()`, joined with "and".
 */
export function flagText(f: Flags, lang: 'java' | 'lua'): string {
  const parts: string[] = []
  const s = lang === 'java' ? 'GameServer.server' : 'isServer()'
  const c = lang === 'java' ? 'GameClient.client' : 'isClient()'
  const not = lang === 'java' ? '!' : 'not '
  if (f.server !== undefined) parts.push(f.server ? s : not + s)
  if (f.client !== undefined) parts.push(f.client ? c : not + c)
  return parts.join(' and ')
}

/** Merge constraints; a contradiction (true and false for one flag) leaves that flag unknown. */
export function mergeFlags(a: Flags, b: Flags): Flags {
  const out: Flags = { ...a }
  for (const k of ['server', 'client'] as const) {
    if (b[k] === undefined) continue
    if (out[k] === undefined) out[k] = b[k]
    else if (out[k] !== b[k]) delete out[k]
  }
  return out
}

/**
 * From the flags at a call site to a side. `singlePlayer` says whether the call also runs in
 * single player (where neither flag is set). Returns null when the flags say nothing.
 */
export function sideFromFlags(f: Flags): { side: Side; singlePlayer: boolean } | null {
  if (f.server === true && f.client === true) return null
  if (f.server === true) return { side: 'server', singlePlayer: false }
  if (f.client === true) return { side: 'client', singlePlayer: false }
  if (f.server === false && f.client === false) return { side: 'single-player', singlePlayer: true }
  if (f.server === false) return { side: 'client', singlePlayer: true }
  if (f.client === false) return { side: 'server', singlePlayer: true }
  return null
}

// ---------------------------------------------------------------------------------------
// Java
// ---------------------------------------------------------------------------------------

/**
 * Blank comments, string and char literals (contents replaced by spaces, newlines kept) so
 * offsets and line numbers stay identical to the original text.
 */
export function stripJava(src: string): string {
  const out = src.split('')
  let i = 0
  const n = src.length
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
  }
  while (i < n) {
    const c = src[i]
    const d = src[i + 1]
    if (c === '/' && d === '/') {
      const e = src.indexOf('\n', i)
      const end = e < 0 ? n : e
      blank(i, end)
      i = end
    } else if (c === '/' && d === '*') {
      const e = src.indexOf('*/', i + 2)
      const end = e < 0 ? n : e + 2
      blank(i, end)
      i = end
    } else if (c === '"' && src.startsWith('"""', i)) {
      const e = src.indexOf('"""', i + 3)
      const end = e < 0 ? n : e + 3
      blank(i + 3, end - 3)
      i = end
    } else if (c === '"' || c === "'") {
      let k = i + 1
      while (k < n && src[k] !== c && src[k] !== '\n') k += src[k] === '\\' ? 2 : 1
      blank(i + 1, k)
      i = k + 1
    } else i++
  }
  return out.join('')
}

export function lineAt(text: string, offset: number): number {
  let line = 1
  for (let k = 0; k < offset && k < text.length; k++) if (text.charCodeAt(k) === 10) line++
  return line
}

/** Precomputed line starts for fast offset -> line. */
export function lineIndex(text: string): (offset: number) => number {
  const starts: number[] = [0]
  for (let k = 0; k < text.length; k++) if (text.charCodeAt(k) === 10) starts.push(k + 1)
  return (offset: number) => {
    let lo = 0
    let hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] <= offset) lo = mid
      else hi = mid - 1
    }
    return lo + 1
  }
}

const NOT_METHOD = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'synchronized', 'try', 'else', 'do', 'return', 'new', 'throw',
  'case', 'default', 'finally', 'assert', 'yield',
])

export type BlockKind = 'type' | 'method' | 'if' | 'else' | 'elseif' | 'other'

export interface JavaBlock {
  open: number
  close: number
  depth: number
  kind: BlockKind
  /** Type or method name; for an if/else-if, the condition text (stripped). */
  name: string
  cond?: string
  /** Method header: parameter list text. */
  params?: string
  parent: number
  /** For if / else-if / else: the conditions of the earlier branches of the same chain. */
  chainBefore?: string[]
  chain?: string[]
}

/** Every `{...}` block with what opened it. Blocks are in opening order. */
export function javaBlocks(stripped: string): JavaBlock[] {
  const blocks: JavaBlock[] = []
  const stack: number[] = []
  /** Last closed block per depth, to pair `else` with its `if`. */
  const lastClosed = new Map<number, number>()
  let stmtStart = 0
  for (let i = 0; i < stripped.length; i++) {
    const c = stripped[i]
    if (c === '{') {
      const header = stripped.slice(stmtStart, i).trim()
      const depth = stack.length
      const b: JavaBlock = {
        open: i,
        close: -1,
        depth,
        kind: 'other',
        name: '',
        parent: stack.length ? stack[stack.length - 1] : -1,
      }
      classifyHeader(header, b)
      if (b.kind === 'else' || b.kind === 'elseif') {
        const prevIdx = lastClosed.get(depth)
        const prev = prevIdx === undefined ? undefined : blocks[prevIdx]
        b.chainBefore = prev && prev.chain ? prev.chain.slice() : []
        b.chain = b.kind === 'elseif' ? [...b.chainBefore, b.cond ?? ''] : b.chainBefore.slice()
      } else if (b.kind === 'if') {
        b.chainBefore = []
        b.chain = [b.cond ?? '']
      }
      blocks.push(b)
      stack.push(blocks.length - 1)
      stmtStart = i + 1
    } else if (c === '}') {
      const idx = stack.pop()
      if (idx !== undefined) {
        blocks[idx].close = i
        lastClosed.set(blocks[idx].depth, idx)
      }
      stmtStart = i + 1
    } else if (c === ';') {
      stmtStart = i + 1
      // a statement at this depth ends any if/else chain
      lastClosed.delete(stack.length)
    }
  }
  return blocks
}

function classifyHeader(header: string, b: JavaBlock): void {
  const h = header.replace(/\s+/g, ' ')
  const ty = /(?:^|\s)(class|interface|enum|record|@interface)\s+(\w+)/.exec(h)
  if (ty && !/\bnew\b/.test(h.slice(0, ty.index))) {
    b.kind = 'type'
    b.name = ty[2]
    return
  }
  const elif = /^else if\s*\((.*)\)$/.exec(h)
  if (elif) {
    b.kind = 'elseif'
    b.cond = elif[1].trim()
    return
  }
  if (/^else$/.test(h)) {
    b.kind = 'else'
    return
  }
  const iff = /^if\s*\((.*)\)$/.exec(h)
  if (iff) {
    b.kind = 'if'
    b.cond = iff[1].trim()
    return
  }
  const anon = /\bnew\s+([\w.<>, ?]+?)\s*\(.*\)$/.exec(h)
  if (anon && !/->\s*$/.test(h)) {
    b.kind = 'type'
    b.name = `anonymous ${anon[1].replace(/<.*>/, '')}`
    return
  }
  const m = /(\w+)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*(?:throws\s+[\w.,\s]+)?$/.exec(h)
  if (m && !NOT_METHOD.has(m[1]) && !/->/.test(h)) {
    const before = h.slice(0, m.index).trim()
    // a method or constructor header has something before the name (modifiers or a type),
    // or is a bare constructor name; a call followed by a block does not exist in Java
    if (before.length > 0 || /^[A-Z]/.test(m[1])) {
      if (!/[=(,]$/.test(before) && !/\breturn$/.test(before)) {
        b.kind = 'method'
        b.name = m[1]
        b.params = m[2]
        return
      }
    }
  }
  if (/^static$/.test(h)) {
    b.kind = 'method'
    b.name = '<static initializer>'
    b.params = ''
  }
}

/** Indexes of the blocks enclosing `pos`, outermost first. */
export function enclosing(blocks: JavaBlock[], pos: number): number[] {
  const out: number[] = []
  for (let k = 0; k < blocks.length; k++) {
    const b = blocks[k]
    if (b.open > pos) break
    if (b.open < pos && (b.close < 0 || b.close > pos)) out.push(k)
  }
  return out
}

/** Constraint from one Java condition; undefined fields when the condition says nothing usable. */
export function javaCondFlags(cond: string, negate = false): Flags {
  const c = stripParens(cond.trim())
  if (/\|\|/.test(topLevel(c))) {
    // a disjunction: only its negation is a conjunction we can read
    if (!negate) return {}
    let out: Flags = {}
    for (const part of splitTop(c, '||')) out = mergeFlags(out, javaAtom(part, true))
    return out
  }
  const parts = splitTop(c, '&&')
  if (negate) {
    // not (a and b) is only readable when there is one part
    return parts.length === 1 ? javaAtom(parts[0], true) : {}
  }
  let out: Flags = {}
  for (const part of parts) out = mergeFlags(out, javaAtom(part, false))
  return out
}

function javaAtom(atom: string, negate: boolean): Flags {
  let a = stripParens(atom.trim())
  let neg = negate
  while (a.startsWith('!')) {
    neg = !neg
    a = stripParens(a.slice(1).trim())
  }
  if (a === 'GameServer.server') return { server: !neg }
  if (a === 'GameClient.client') return { client: !neg }
  return {}
}

function stripParens(s: string): string {
  let t = s
  while (t.startsWith('(') && t.endsWith(')') && matchingParen(t, 0) === t.length - 1) t = t.slice(1, -1).trim()
  return t
}

function matchingParen(s: string, open: number): number {
  let depth = 0
  for (let k = open; k < s.length; k++) {
    if (s[k] === '(') depth++
    else if (s[k] === ')') {
      depth--
      if (depth === 0) return k
    }
  }
  return -1
}

/** The string with every parenthesised group blanked, to look for top-level operators. */
function topLevel(s: string): string {
  let depth = 0
  let out = ''
  for (const ch of s) {
    if (ch === '(') depth++
    out += depth > 0 ? ' ' : ch
    if (ch === ')') depth--
  }
  return out
}

export function splitTop(s: string, op: string): string[] {
  const parts: string[] = []
  let depth = 0
  let last = 0
  for (let k = 0; k < s.length; k++) {
    const ch = s[k]
    if (ch === '(' || ch === '[' || ch === '{') depth++
    else if (ch === ')' || ch === ']' || ch === '}') depth--
    else if (depth === 0 && s.startsWith(op, k)) {
      parts.push(s.slice(last, k))
      last = k + op.length
      k += op.length - 1
    }
  }
  parts.push(s.slice(last))
  return parts.map(p => p.trim()).filter(p => p.length > 0)
}

/** Split an argument list at top-level commas (angle brackets of generics are not tracked). */
export function splitArgs(s: string): string[] {
  return splitTop(s, ',')
}

/**
 * The flags in force at `pos`: enclosing if / else-if / else conditions, a brace-less
 * `if (...)` on the statement itself, and early `if (...) { return; }` guards earlier in each
 * enclosing block. Returns the flags and a short summary of the guards that produced them.
 */
export function javaGuards(stripped: string, blocks: JavaBlock[], pos: number): { flags: Flags; guards: string[] } {
  let flags: Flags = {}
  const guards: string[] = []
  const enc = enclosing(blocks, pos)
  const methodAt = [...enc].reverse().find(k => blocks[k].kind === 'method' || blocks[k].kind === 'type')
  const fromIdx = methodAt === undefined ? 0 : enc.indexOf(methodAt)
  for (let e = fromIdx; e < enc.length; e++) {
    const b = blocks[enc[e]]
    if (b.kind === 'if' || b.kind === 'elseif') {
      const f = javaCondFlags(b.cond ?? '')
      if (f.server !== undefined || f.client !== undefined) guards.push(`inside an if on ${flagText(f, 'java')}`)
      flags = mergeFlags(flags, f)
    }
    if ((b.kind === 'else' || b.kind === 'elseif') && b.chainBefore) {
      for (const c of b.chainBefore) {
        const f = javaCondFlags(c, true)
        if (f.server !== undefined || f.client !== undefined) guards.push(`in the else branch, so ${flagText(f, 'java')}`)
        flags = mergeFlags(flags, f)
      }
    }
    // early returns: direct children of this enclosing block that end before pos
    const child = e + 1 < enc.length ? blocks[enc[e + 1]].open : pos
    for (let k = enc[e] + 1; k < blocks.length; k++) {
      const c = blocks[k]
      if (c.open >= child) break
      if (c.parent !== enc[e] || c.kind !== 'if' || c.close < 0 || c.close > pos) continue
      const body = stripped.slice(c.open + 1, c.close).trim()
      if (!/^(return\b[^;{}]*|throw\b[^;{}]*);$/.test(body)) continue
      const f = javaCondFlags(c.cond ?? '', true)
      if (f.server !== undefined || f.client !== undefined) guards.push(`after an early return, so ${flagText(f, 'java')}`)
      flags = mergeFlags(flags, f)
    }
  }
  // brace-less if on the statement itself
  let s = pos
  while (s > 0 && !';{}'.includes(stripped[s - 1])) s--
  const stmt = stripped.slice(s, pos).replace(/\s+/g, ' ').trim()
  const bl = /^(?:else )?if\s*\((.*)\)$/.exec(stmt)
  if (bl) {
    const f = javaCondFlags(bl[1])
    if (f.server !== undefined || f.client !== undefined) guards.push(`inside an if on ${flagText(f, 'java')}`)
    flags = mergeFlags(flags, f)
  }
  return { flags, guards }
}

export interface JavaParam {
  type: string
  name: string
}

/** Parse a parameter list text into types and names (annotations and `final` dropped). */
export function parseParams(text: string): JavaParam[] {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return []
  const out: JavaParam[] = []
  // split at commas outside <>
  const parts: string[] = []
  let depth = 0
  let last = 0
  for (let k = 0; k < t.length; k++) {
    const ch = t[k]
    if (ch === '<' || ch === '(') depth++
    else if (ch === '>' || ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      parts.push(t.slice(last, k))
      last = k + 1
    }
  }
  parts.push(t.slice(last))
  for (const raw of parts) {
    const p = raw.replace(/@[\w.]+(\([^)]*\))?\s*/g, '').replace(/\bfinal\s+/g, '').trim()
    const m = /^(.*?)\s*(\w+)$/.exec(p)
    if (!m) continue
    out.push({ type: m[1].trim(), name: m[2] })
  }
  return out
}

export interface JavaMethodDecl {
  name: string
  params: JavaParam[]
  line: number
}

/** Every method or constructor header in a file (from the block list). */
export function javaMethodDecls(stripped: string, blocks: JavaBlock[]): JavaMethodDecl[] {
  const line = lineIndex(stripped)
  const out: JavaMethodDecl[] = []
  for (const b of blocks) {
    if (b.kind === 'method' && b.params !== undefined) out.push({ name: b.name, params: parseParams(b.params), line: line(b.open) })
  }
  // abstract and interface methods end with `;`, not a block
  const re = /(?:^|[;{}])\s*((?:@[\w.]+(?:\([^)]*\))?\s*)*(?:(?:public|protected|private|static|final|abstract|synchronized|native|default|strictfp)\s+)*(?:<[^;{}()]*>\s+)?[\w.$<>\[\], ?]+?\s+(\w+)\s*\(([^;{}()]*)\))\s*(?:throws\s+[\w.,\s]+)?;/g
  for (let m = re.exec(stripped); m; m = re.exec(stripped)) {
    const name = m[2]
    if (NOT_METHOD.has(name)) continue
    const head = m[1]
    const typePart = head.slice(0, head.lastIndexOf(name)).trim().split(/\s+/).pop() ?? ''
    if (NOT_METHOD.has(typePart) || /[=]/.test(head)) continue
    out.push({ name, params: parseParams(m[3]), line: line(m.index + m[0].indexOf(m[1])) })
  }
  return out
}

/** Erase generics and package: `java.util.List<String>` -> `List`, `Foo...` -> `Foo[]`. */
export function eraseSimple(type: string): string {
  let t = type.replace(/\s+/g, '')
  let prev = ''
  while (prev !== t) {
    prev = t
    t = t.replace(/<[^<>]*>/g, '')
  }
  t = t.replace(/\.\.\.$/, '[]')
  const dims = (t.match(/\[\]/g) ?? []).length
  t = t.replace(/\[\]/g, '')
  t = t.split('.').pop() ?? t
  t = t.split('$').pop() ?? t
  return t + '[]'.repeat(dims)
}

// ---------------------------------------------------------------------------------------
// Lua
// ---------------------------------------------------------------------------------------

/** Blank Lua comments and string contents (quotes kept), offsets and newlines preserved. */
export function stripLua(src: string): string {
  const out = src.split('')
  const n = src.length
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
  }
  const longClose = (at: number): { open: number; close: string } | null => {
    const m = /^\[(=*)\[/.exec(src.slice(at, at + 64))
    return m ? { open: m[0].length, close: `]${m[1]}]` } : null
  }
  let i = 0
  while (i < n) {
    const c = src[i]
    if (c === '-' && src[i + 1] === '-') {
      const lb = longClose(i + 2)
      if (lb) {
        const e = src.indexOf(lb.close, i + 2 + lb.open)
        const end = e < 0 ? n : e + lb.close.length
        blank(i, end)
        i = end
      } else {
        const e = src.indexOf('\n', i)
        const end = e < 0 ? n : e
        blank(i, end)
        i = end
      }
    } else if (c === '[' && longClose(i)) {
      const lb = longClose(i)!
      const e = src.indexOf(lb.close, i + lb.open)
      const end = e < 0 ? n : e + lb.close.length
      blank(i + lb.open, end - lb.close.length)
      i = end
    } else if (c === '"' || c === "'") {
      let k = i + 1
      while (k < n && src[k] !== c && src[k] !== '\n') k += src[k] === '\\' ? 2 : 1
      blank(i + 1, k)
      i = k + 1
    } else i++
  }
  return out.join('')
}

export interface LuaBlock {
  open: number
  close: number
  kind: 'function' | 'if' | 'loop' | 'chunk'
  name: string
  parent: number
  /** if: the branch conditions with their start offsets (`else` has cond null). */
  branches?: { start: number; cond: string | null }[]
}

/** Lua blocks: functions, if chains, loops (do / repeat). Index 0 is the whole chunk. */
export function luaBlocks(stripped: string): LuaBlock[] {
  const blocks: LuaBlock[] = [{ open: 0, close: stripped.length, kind: 'chunk', name: '<file>', parent: -1 }]
  const stack: number[] = [0]
  const re = /\b(function|if|then|elseif|else|do|while|for|repeat|until|end)\b/g
  let pendingLoop = false
  let pendingIf: { start: number; condStart: number; kind: 'if' | 'elseif' } | null = null
  for (let m = re.exec(stripped); m; m = re.exec(stripped)) {
    // a keyword used as a field name (t.end, t:do) is not a keyword
    const before = stripped[m.index - 1]
    if (before === '.' || before === ':') continue
    const kw = m[1]
    const top = stack[stack.length - 1]
    if (kw === 'function') {
      blocks.push({ open: m.index, close: -1, kind: 'function', name: luaFunctionName(stripped, m.index), parent: top })
      stack.push(blocks.length - 1)
    } else if (kw === 'if') {
      pendingIf = { start: m.index, condStart: m.index + 2, kind: 'if' }
    } else if (kw === 'elseif') {
      pendingIf = { start: m.index, condStart: m.index + 6, kind: 'elseif' }
    } else if (kw === 'then' && pendingIf) {
      const cond = stripped.slice(pendingIf.condStart, m.index).replace(/\s+/g, ' ').trim()
      if (pendingIf.kind === 'if') {
        blocks.push({ open: pendingIf.start, close: -1, kind: 'if', name: 'if', parent: top, branches: [{ start: m.index, cond }] })
        stack.push(blocks.length - 1)
      } else {
        blocks[top].branches?.push({ start: m.index, cond })
      }
      pendingIf = null
    } else if (kw === 'else') {
      blocks[top].branches?.push({ start: m.index, cond: null })
    } else if (kw === 'while' || kw === 'for') {
      pendingLoop = true
    } else if (kw === 'do') {
      blocks.push({ open: m.index, close: -1, kind: 'loop', name: pendingLoop ? 'loop' : 'do', parent: top })
      stack.push(blocks.length - 1)
      pendingLoop = false
    } else if (kw === 'repeat') {
      blocks.push({ open: m.index, close: -1, kind: 'loop', name: 'repeat', parent: top })
      stack.push(blocks.length - 1)
    } else if (kw === 'end' || kw === 'until') {
      if (stack.length > 1) {
        const idx = stack.pop()!
        blocks[idx].close = m.index + kw.length
      }
    }
  }
  return blocks
}

function luaFunctionName(s: string, at: number): string {
  const after = /^function\s+([\w.:]+)\s*\(/.exec(s.slice(at, at + 200))
  if (after) return after[1]
  const head = s.slice(Math.max(0, at - 200), at)
  const assign = /([\w.:[\]]+)\s*=\s*$/.exec(head)
  if (assign) return assign[1]
  return ''
}

function luaAtom(atom: string, negate: boolean): Flags {
  let a = atom.trim()
  let neg = negate
  while (a.startsWith('(') && a.endsWith(')') && matchingParen(a, 0) === a.length - 1) a = a.slice(1, -1).trim()
  while (/^not\s+/.test(a)) {
    neg = !neg
    a = a.replace(/^not\s+/, '').trim()
  }
  if (/^isServer\(\s*\)$/.test(a)) return { server: !neg }
  if (/^isClient\(\s*\)$/.test(a)) return { client: !neg }
  return {}
}

export function luaCondFlags(cond: string, negate = false): Flags {
  const c = cond.trim()
  if (/\bor\b/.test(topLevel(c))) {
    if (!negate) return {}
    let out: Flags = {}
    for (const p of splitWord(c, 'or')) out = mergeFlags(out, luaAtom(p, true))
    return out
  }
  const parts = splitWord(c, 'and')
  if (negate) return parts.length === 1 ? luaAtom(parts[0], true) : {}
  let out: Flags = {}
  for (const p of parts) out = mergeFlags(out, luaAtom(p, false))
  return out
}

function splitWord(s: string, word: string): string[] {
  const top = topLevel(s)
  const parts: string[] = []
  const re = new RegExp(`\\b${word}\\b`, 'g')
  let last = 0
  for (let m = re.exec(top); m; m = re.exec(top)) {
    parts.push(s.slice(last, m.index))
    last = m.index + word.length
  }
  parts.push(s.slice(last))
  return parts.map(p => p.trim()).filter(Boolean)
}

/** Enclosing Lua blocks of `pos`, outermost first (index 0, the chunk, always included). */
export function luaEnclosing(blocks: LuaBlock[], pos: number): number[] {
  const out: number[] = []
  for (let k = 0; k < blocks.length; k++) {
    const b = blocks[k]
    if (b.open > pos) break
    if (b.open <= pos && (b.close < 0 || b.close > pos)) out.push(k)
  }
  return out
}

export function luaGuards(stripped: string, blocks: LuaBlock[], pos: number): { flags: Flags; guards: string[] } {
  let flags: Flags = {}
  const guards: string[] = []
  const enc = luaEnclosing(blocks, pos)
  for (let e = 0; e < enc.length; e++) {
    const b = blocks[enc[e]]
    if (b.kind === 'if' && b.branches) {
      // the branch holding pos, and every branch before it
      let at = -1
      for (let k = 0; k < b.branches.length; k++) if (b.branches[k].start <= pos) at = k
      for (let k = 0; k <= at; k++) {
        const br = b.branches[k]
        if (br.cond === null) continue
        const f = k === at ? luaCondFlags(br.cond) : luaCondFlags(br.cond, true)
        if (f.server !== undefined || f.client !== undefined)
          guards.push(k === at ? `inside an if on ${flagText(f, 'lua')}` : `in a later branch, so ${flagText(f, 'lua')}`)
        flags = mergeFlags(flags, f)
      }
    }
    // early returns among the direct children of this block, before pos
    const child = e + 1 < enc.length ? blocks[enc[e + 1]].open : pos
    for (let k = enc[e] + 1; k < blocks.length; k++) {
      const c = blocks[k]
      if (c.open >= child) break
      if (c.parent !== enc[e] || c.kind !== 'if' || c.close < 0 || c.close > pos || !c.branches || c.branches.length !== 1) continue
      const br = c.branches[0]
      const body = stripped.slice(br.start + 4, c.close - 3).trim()
      if (!/^return\b[^\n]*$/.test(body)) continue
      const f = luaCondFlags(br.cond ?? '', true)
      if (f.server !== undefined || f.client !== undefined) guards.push(`after an early return, so ${flagText(f, 'lua')}`)
      flags = mergeFlags(flags, f)
    }
  }
  return { flags, guards }
}

/** Name of the innermost named function around pos, or `<file>` at chunk level. */
export function luaFunctionAt(blocks: LuaBlock[], pos: number): string {
  const enc = luaEnclosing(blocks, pos)
  let anon = false
  for (let k = enc.length - 1; k >= 0; k--) {
    const b = blocks[enc[k]]
    if (b.kind !== 'function') continue
    if (b.name) return anon ? `anonymous function in ${b.name}` : b.name
    anon = true
  }
  return anon ? 'anonymous function' : '<file>'
}
