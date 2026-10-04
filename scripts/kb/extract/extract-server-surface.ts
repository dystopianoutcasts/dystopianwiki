#!/usr/bin/env tsx
/**
 * Extract what a Project Zomboid server owner can set and use into one JSON data file:
 * every server option (the <server>.ini keys), every sandbox option, the admin commands,
 * the built-in roles and the capabilities they grant, with WHERE the code reads each one.
 *
 * NEEDS A LOCAL ENGINE CAPTURE (the same kind of folder extract-lua-surface.ts reads: a
 * `MANIFEST.yaml`, `src/` decompiled Java, `game_snapshot/media/lua`). It reads the capture and
 * never writes to it. The JSON it writes holds names, types, defaults, ranges, the game's own
 * English text (from media/lua/shared/Translate/EN) and read-site locations (class and method,
 * or Lua file and function, with a line number). No method body, no statement.
 *
 * How each part is read:
 *  - Server options: every `new ServerOptions.<Type>ServerOption(this, "Name", ...)` field in
 *    zombie/network/ServerOptions.java. The settings-screen page of each comes from the
 *    `SettingsTable` in media/lua/client/OptionScreens/ServerSettingsScreen.lua.
 *  - Sandbox options: every `newBooleanOption / newDoubleOption / newEnumOption /
 *    newIntegerOption / newStringOption("Name", ...)` in zombie/SandboxOptions.java, top level
 *    and in its nested groups, with `.setTranslation` / `.setValueTranslation`. The default the
 *    game starts from is the Apocalypse preset (the SandboxOptions constructor loads it and makes
 *    it the default); the Java default is kept too. Presets: media/lua/shared/Sandbox/*.lua.
 *  - Commands: the class list in zombie/commands/CommandBase.java and each class's annotations
 *    (@CommandName, @CommandArgs / @AltCommandArgs, @CommandHelp, @RequiredCapability,
 *    @DisabledCommand).
 *  - Roles: zombie/characters/Roles.java#addStatic. Capabilities: zombie/characters/Capability.java.
 *  - Read sites: see READ_RULES below.
 *
 * Usage (from the repo root):
 *   npx tsx scripts/kb/extract/extract-server-surface.ts --capture <capture dir> [--out <json>]
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { enclosing, javaBlocks, JavaBlock, lineIndex, luaBlocks, luaFunctionAt, splitArgs, stripJava, stripLua } from './java-scan'

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..')

/** Written into the data file so the generator can print how read sites were found. */
export const READ_RULES = [
  'Java, a server option: the option\'s field reached through ServerOptions.instance or ServerOptions.getInstance() (or a local variable holding one of them, inside the same method), the field reached with this. inside ServerOptions itself (its constructor, which only builds the public list, is left out), and a call getOption / getBoolean / getInteger / getFloat / getDouble / getOptionByName / putOption / putSaveOption / changeOption with the option\'s name written as text, on a ServerOptions receiver.',
  'Java, a sandbox option: the option\'s field reached through SandboxOptions.instance or SandboxOptions.getInstance() (for a nested group, through its group field, such as lore or zombieConfig), through a local variable holding SandboxOptions or one of its groups inside the same method, or with this. inside SandboxOptions; and getOptionByName with the option\'s name written as text. A getOptionByName whose name is built at run time ("MultiplierConfig." + a skill) is kept as a computed read for every option the prefix can reach, and so is an option the world generator\'s Lua data names as "Sandbox.Name", which ProbaString looks up by that name.',
  'A write is kept apart from a read: in Java a call to setValue, parse or setValueFromObject on the option, or putOption / putSaveOption / changeOption with its name; in Lua an assignment to SandboxVars.Name. The debug scenarios and the Last Stand challenges set many sandbox values this way.',
  'Lua (vanilla media/lua, all three folders), a server option: getServerOptions():<getter>("Name") or ServerOptions.getInstance():<getter>("Name"). A sandbox option: SandboxVars.Name, SandboxVars.Group.Name, SandboxVars["Name"], and getSandboxOptions():getOptionByName("Name").',
  'Not counted as reads: the declaration itself, the settings screens\' lists of option names, the preset files, the translation files, and the generic loops that load, save, copy or send every option.',
  'An option with no read site is searched once more for its name written as text anywhere else in Java or Lua; a hit there is listed as "named in" (the name appears, but no read of the value was recognised). An option with neither is marked "not read by the 42.21 code".',
  'A capability: Capability.Name in Java or Lua, except the enum itself, the built-in role definitions in Roles#addStatic, and the command annotations (listed with each command instead).',
]

interface Args {
  capture: string
  out?: string
}

function parseArgs(argv: string[]): Args {
  const get = (k: string) => {
    const i = argv.indexOf(k)
    return i >= 0 ? argv[i + 1] : undefined
  }
  const capture = get('--capture')
  if (!capture) {
    console.error('usage: extract-server-surface.ts --capture <dir> [--out <json>]')
    process.exit(2)
  }
  return { capture, out: get('--out') }
}

function manifestValue(manifest: string, key: string): string {
  const m = new RegExp(`^${key}:\\s*"?([^"#\\n]+?)"?\\s*(?:#.*)?$`, 'm').exec(manifest)
  if (!m) throw new Error(`MANIFEST.yaml has no ${key}`)
  return m[1].trim()
}

function walk(dir: string, ext: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, ext, out)
    else if (e.name.endsWith(ext)) out.push(p)
  }
  return out
}

function posix(p: string): string {
  return p.split(path.sep).join('/')
}

// ---------------------------------------------------------------------------------------
// Data shapes (the generator imports these)
// ---------------------------------------------------------------------------------------

export interface Site {
  lang: 'java' | 'lua'
  /** java: binary class name; lua: path under media/lua */
  where: string
  /** java: method name; lua: function name */
  in: string
  line: number
}

export type Literal = boolean | number | string | null

export interface Computed {
  computed: string
}

export type Status = 'read' | 'computed' | 'named' | 'none'

export interface ServerOptionData {
  name: string
  field: string
  type: 'boolean' | 'integer' | 'double' | 'enum' | 'string' | 'text'
  default: Literal | Computed
  min?: number
  max?: number
  maxLength?: number
  choices?: string[]
  tooltip: string | null
  page: string | null
  public: boolean
  declaredLine: number
  reads: Site[]
  writes: Site[]
  named: Site[]
  status: Status
}

export interface SandboxOptionData {
  name: string
  group: string | null
  short: string
  field: string
  type: 'boolean' | 'integer' | 'double' | 'enum' | 'string'
  default: Literal
  javaDefault: Literal
  min?: number
  max?: number
  maxLength?: number
  choices?: string[]
  /** For an option backed by a Java enum: the constants in order and their constructor arguments. */
  enumConstants?: { name: string; args: string }[]
  label: string | null
  labelKey: string
  tooltip: string | null
  page: string | null
  subgroup: string | null
  hiddenUnlessDebug: boolean
  presets: Record<string, Literal>
  declaredLine: number
  reads: Site[]
  writes: Site[]
  computed: Site[]
  named: Site[]
  status: Status
}

export interface CommandArgVariant {
  required: string[]
  optional: string | null
  argName: string | null
  varArgs: boolean
}

export interface CommandData {
  class: string
  names: string[]
  disabled: boolean
  variants: CommandArgVariant[]
  helpKey: string | null
  help: string | null
  capabilities: { capability: string; argName: string | null }[]
  actsIn: Site | null
}

export interface RoleData {
  name: string
  description: string
  color: number[]
  position: number
  allCapabilities: boolean
  removed: string[]
  capabilities: string[]
  defaultFor: string[]
}

export interface CapabilityData {
  name: string
  tooltip: string | null
  roles: string[]
  commands: string[]
  reads: Site[]
}

// ---------------------------------------------------------------------------------------
// Java literals and calls
// ---------------------------------------------------------------------------------------

/** Unescape the inside of a Java string literal. */
export function javaUnescape(s: string): string {
  return s.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_m, c: string) => {
    if (c.length === 5) return String.fromCharCode(parseInt(c.slice(1), 16))
    return ({ n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '0': '\0' } as Record<string, string>)[c] ?? c
  })
}

/** A Java argument expression as a value, or null when it is not a plain literal. */
export function javaLiteral(expr: string): { value: Literal } | null {
  const e = expr.trim()
  if (e === 'true' || e === 'false') return { value: e === 'true' }
  if (e === 'null') return { value: null }
  const str = /^"((?:[^"\\]|\\.)*)"$/.exec(e)
  if (str) return { value: javaUnescape(str[1]) }
  const num = /^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)[fFdDlL]?$/.exec(e)
  if (num) return { value: Number(num[1]) }
  const consts: Record<string, number> = {
    'Integer.MAX_VALUE': 2147483647,
    'Integer.MIN_VALUE': -2147483648,
    '-Integer.MAX_VALUE': -2147483647,
  }
  if (e in consts) return { value: consts[e] }
  return null
}

/** Index of the parenthesis closing the one at `open`, skipping string literals. */
export function closingParen(text: string, open: number): number {
  let depth = 0
  for (let k = open; k < text.length; k++) {
    const c = text[k]
    if (c === '"' || c === "'") {
      k++
      while (k < text.length && text[k] !== c) k += text[k] === '\\' ? 2 : 1
    } else if (c === '(') depth++
    else if (c === ')' && --depth === 0) return k
  }
  return -1
}

/** Top-level arguments of the call whose `(` is at `open`, from the original text. */
export function callArgs(text: string, open: number): { args: string[]; close: number } {
  const close = closingParen(text, open)
  if (close < 0) throw new Error(`unclosed call at ${open}`)
  const inner = text.slice(open + 1, close)
  // split at top-level commas, strings respected
  const args: string[] = []
  let depth = 0
  let start = 0
  for (let k = 0; k < inner.length; k++) {
    const c = inner[k]
    if (c === '"' || c === "'") {
      k++
      while (k < inner.length && inner[k] !== c) k += inner[k] === '\\' ? 2 : 1
    } else if (c === '(' || c === '{' || c === '[') depth++
    else if (c === ')' || c === '}' || c === ']') depth--
    else if (c === ',' && depth === 0) {
      args.push(inner.slice(start, k).trim())
      start = k + 1
    }
  }
  if (inner.trim()) args.push(inner.slice(start).trim())
  return { args, close }
}

function packageOfText(text: string): string {
  const m = /^\s*package\s+([\w.]+)\s*;/m.exec(text)
  return m ? m[1] : ''
}

/** Binary class name and method around `pos`. */
function javaWhere(text: string, blocks: JavaBlock[], pos: number): { where: string; in: string; types: string[] } {
  const enc = enclosing(blocks, pos)
  const types = enc.filter(k => blocks[k].kind === 'type').map(k => blocks[k].name)
  const methodIdx = [...enc].reverse().find(k => blocks[k].kind === 'method')
  const named = types.filter(t => !t.startsWith('anonymous'))
  return {
    where: `${packageOfText(text)}.${named.join('$')}`,
    in: methodIdx === undefined ? '<field initializer>' : blocks[methodIdx].name,
    types,
  }
}

// ---------------------------------------------------------------------------------------
// Lua: comments out, strings kept; and a small table-constructor reader
// ---------------------------------------------------------------------------------------

/** Blank Lua comments only (string literals kept), offsets and newlines preserved. */
export function stripLuaComments(src: string): string {
  const out = src.split('')
  const n = src.length
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
  }
  const longOpen = (at: number) => /^\[(=*)\[/.exec(src.slice(at, at + 64))
  let i = 0
  while (i < n) {
    const c = src[i]
    if (c === '-' && src[i + 1] === '-') {
      const lb = longOpen(i + 2)
      const end = lb
        ? (() => {
            const e = src.indexOf(`]${lb[1]}]`, i + 2 + lb[0].length)
            return e < 0 ? n : e + lb[1].length + 2
          })()
        : (() => {
            const e = src.indexOf('\n', i)
            return e < 0 ? n : e
          })()
      blank(i, end)
      i = end
    } else if (c === '[' && longOpen(i)) {
      const lb = longOpen(i)!
      const e = src.indexOf(`]${lb[1]}]`, i + lb[0].length)
      i = e < 0 ? n : e + lb[1].length + 2
    } else if (c === '"' || c === "'") {
      let k = i + 1
      while (k < n && src[k] !== c && src[k] !== '\n') k += src[k] === '\\' ? 2 : 1
      i = k + 1
    } else i++
  }
  return out.join('')
}

export type LuaValue = Literal | LuaTable | { expr: string }
export interface LuaTable {
  array: LuaValue[]
  hash: Record<string, LuaValue>
  /** offset of the opening brace in the source */
  at: number
}

interface Tok {
  t: 'name' | 'str' | 'num' | 'p'
  v: string
  at: number
}

function luaTokens(src: string, from: number): Tok[] {
  const toks: Tok[] = []
  const re = /\s+|([A-Za-z_]\w*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\.\d+)|(\.\.\.|\.\.|==|~=|<=|>=|[{}()[\]=,;.:+\-*/%^#<>])/y
  re.lastIndex = from
  while (re.lastIndex < src.length) {
    const at = re.lastIndex
    const m = re.exec(src)
    if (!m) throw new Error(`lua tokenizer stuck at ${at}: ${JSON.stringify(src.slice(at, at + 30))}`)
    if (m[1]) toks.push({ t: 'name', v: m[1], at })
    else if (m[2]) toks.push({ t: 'str', v: m[2], at })
    else if (m[3]) toks.push({ t: 'num', v: m[3], at })
    else if (m[4]) toks.push({ t: 'p', v: m[4], at })
  }
  return toks
}

function luaUnquote(s: string): string {
  return s.slice(1, -1).replace(/\\(.)/g, (_m, c: string) => ({ n: '\n', t: '\t' } as Record<string, string>)[c] ?? c)
}

/** Read the table constructor starting at the `{` at `at` (comments already blanked). */
export function readLuaTable(src: string, at: number): LuaTable {
  const toks = luaTokens(src, at)
  let i = 0
  const peek = () => toks[i]
  const isP = (v: string) => toks[i] && toks[i].t === 'p' && toks[i].v === v
  function value(): LuaValue {
    const tk = peek()
    if (tk.t === 'p' && tk.v === '{') return table()
    // a plain literal followed by a separator
    const next = toks[i + 1]
    const sep = !next || (next.t === 'p' && (next.v === ',' || next.v === ';' || next.v === '}'))
    if (sep) {
      if (tk.t === 'str') {
        i++
        return luaUnquote(tk.v)
      }
      if (tk.t === 'num') {
        i++
        return Number(tk.v)
      }
      if (tk.t === 'name' && (tk.v === 'true' || tk.v === 'false')) {
        i++
        return tk.v === 'true'
      }
      if (tk.t === 'name' && tk.v === 'nil') {
        i++
        return null
      }
    }
    if (tk.t === 'p' && tk.v === '-' && next && next.t === 'num') {
      const after = toks[i + 2]
      if (!after || (after.t === 'p' && (after.v === ',' || after.v === ';' || after.v === '}'))) {
        i += 2
        return -Number(next.v)
      }
    }
    // anything else: an expression up to the next separator at depth 0
    const start = tk.at
    let depth = 0
    while (i < toks.length) {
      const t = toks[i]
      if (t.t === 'p' && (t.v === '(' || t.v === '{' || t.v === '[')) depth++
      else if (t.t === 'p' && (t.v === ')' || t.v === '}' || t.v === ']')) {
        if (depth === 0) break
        depth--
      } else if (t.t === 'p' && (t.v === ',' || t.v === ';') && depth === 0) break
      i++
    }
    const end = i < toks.length ? toks[i].at : src.length
    return { expr: src.slice(start, end).replace(/\s+/g, ' ').trim() }
  }
  function table(): LuaTable {
    const t: LuaTable = { array: [], hash: {}, at: peek().at }
    i++ // {
    while (!isP('}')) {
      const tk = peek()
      const next = toks[i + 1]
      if (tk.t === 'name' && next && next.t === 'p' && next.v === '=') {
        i += 2
        t.hash[tk.v] = value()
      } else if (tk.t === 'p' && tk.v === '[') {
        i++
        const key = value()
        if (!isP(']')) throw new Error('expected ]')
        i++
        if (!isP('=')) throw new Error('expected =')
        i++
        t.hash[String(typeof key === 'object' && key !== null && 'expr' in key ? key.expr : key)] = value()
      } else {
        t.array.push(value())
      }
      if (isP(',') || isP(';')) i++
    }
    i++ // }
    return t
  }
  return table()
}

function isTable(v: LuaValue | undefined): v is LuaTable {
  return !!v && typeof v === 'object' && 'array' in v
}

// ---------------------------------------------------------------------------------------
// Server options
// ---------------------------------------------------------------------------------------

interface ServerDecl {
  name: string
  field: string
  type: ServerOptionData['type']
  default: Literal | Computed
  min?: number
  max?: number
  maxLength?: number
  numValues?: number
  line: number
  /** last line of the declaration statement */
  endLine: number
}

function literalOrComputed(expr: string): Literal | Computed {
  const lit = javaLiteral(expr)
  return lit ? lit.value : { computed: expr.replace(/\s+/g, ' ').trim() }
}

function num(expr: string, what: string): number {
  const lit = javaLiteral(expr)
  if (!lit || typeof lit.value !== 'number') throw new Error(`${what}: not a number: ${expr}`)
  return lit.value
}

export function parseServerOptions(text: string): { decls: ServerDecl[]; publicExcluded: string[] } {
  const stripped = stripJava(text)
  const line = lineIndex(stripped)
  const decls: ServerDecl[] = []
  const typeMap: Record<string, ServerOptionData['type']> = {
    Boolean: 'boolean',
    Integer: 'integer',
    Double: 'double',
    Enum: 'enum',
    String: 'string',
    Text: 'text',
  }
  const re = /public\s+ServerOptions\.(\w+)ServerOption\s+(\w+)\s*=\s*new\s+ServerOptions\.(\w+)ServerOption\s*\(/g
  for (const m of stripped.matchAll(re)) {
    const kind = m[3]
    const type = typeMap[kind]
    if (!type) throw new Error(`unknown server option class ${kind}`)
    const open = m.index! + m[0].length - 1
    const { args, close } = callArgs(text, open)
    if (args[0] !== 'this') throw new Error(`server option ${m[2]}: first argument is not this`)
    const nameLit = javaLiteral(args[1])
    if (!nameLit || typeof nameLit.value !== 'string') throw new Error(`server option ${m[2]}: name is not a string literal`)
    const d: ServerDecl = { name: nameLit.value, field: m[2], type, default: null, line: line(m.index!), endLine: line(close) }
    if (type === 'boolean') d.default = literalOrComputed(args[2])
    else if (type === 'integer' || type === 'double') {
      d.min = num(args[2], d.name)
      d.max = num(args[3], d.name)
      d.default = literalOrComputed(args[4])
    } else if (type === 'enum') {
      d.numValues = num(args[2], d.name)
      d.min = 1
      d.max = d.numValues
      d.default = literalOrComputed(args[3])
    } else {
      d.default = literalOrComputed(args[2])
      d.maxLength = num(args[3], d.name)
    }
    decls.push(d)
  }
  // the public list: every option minus the ones the constructor removes
  const ctor = /public\s+ServerOptions\s*\(\s*\)\s*\{/.exec(stripped)
  const publicExcluded: string[] = []
  if (ctor) {
    const end = stripped.indexOf('}', ctor.index)
    const body = text.slice(ctor.index, end)
    for (const r of body.matchAll(/publicOptions\.remove\(\s*(?:"([^"]+)"|this\.(\w+)\.getName\(\))\s*\)/g)) {
      if (r[1]) publicExcluded.push(r[1])
      else {
        const d = decls.find(x => x.field === r[2])
        if (!d) throw new Error(`public list removes unknown field ${r[2]}`)
        publicExcluded.push(d.name)
      }
    }
  }
  return { decls, publicExcluded }
}

// ---------------------------------------------------------------------------------------
// Sandbox options
// ---------------------------------------------------------------------------------------

interface SandboxDecl {
  name: string
  group: string | null
  short: string
  field: string
  holder: string | null
  type: SandboxOptionData['type']
  javaDefault: Literal
  min?: number
  max?: number
  maxLength?: number
  numValues?: number
  enumClass?: string
  translation: string | null
  valueTranslation: string | null
  line: number
  /** last line of the declaration statement */
  endLine: number
  order: number
}

export function parseSandboxOptions(text: string, enumSource: (cls: string) => string): { decls: SandboxDecl[]; holders: Record<string, string> } {
  const stripped = stripJava(text)
  const blocks = javaBlocks(stripped)
  const line = lineIndex(stripped)
  // nested groups: `public final SandboxOptions.ZombieLore lore = new SandboxOptions.ZombieLore();`
  const holders: Record<string, string> = {}
  const holderAt: { cls: string; at: number }[] = []
  for (const h of stripped.matchAll(/public\s+final\s+SandboxOptions\.(\w+)\s+(\w+)\s*=\s*new\s+SandboxOptions\.\1\s*\(\s*\)\s*;/g)) {
    holders[h[1]] = h[2]
    holderAt.push({ cls: h[1], at: h.index! })
  }
  const raw: Omit<SandboxDecl, 'order'>[] = []
  const typeMap: Record<string, SandboxOptionData['type']> = { Boolean: 'boolean', Double: 'double', Enum: 'enum', Integer: 'integer', String: 'string' }
  for (const m of stripped.matchAll(/\bnew(Boolean|Double|Enum|Integer|String)Option\s*\(/g)) {
    const open = m.index! + m[0].length - 1
    const { args, close } = callArgs(text, open)
    const nameLit = javaLiteral(args[0])
    if (!nameLit || typeof nameLit.value !== 'string') continue // the factory methods themselves
    const name = nameLit.value
    // left-hand side: `<field> = this.` or `this.<field> = SandboxOptions.this.`
    const stmtStart = Math.max(stripped.lastIndexOf(';', m.index!), stripped.lastIndexOf('{', m.index!), stripped.lastIndexOf('}', m.index!)) + 1
    const lhs = stripped.slice(stmtStart, m.index!)
    const f = /(?:this\s*\.\s*)?(\w+)\s*=\s*(?:SandboxOptions\s*\.\s*)?this\s*\.\s*$/.exec(lhs.replace(/\s+$/, '').replace(/\s*$/, '')) ??
      /(\w+)\s*=\s*(?:SandboxOptions\s*\.\s*)?this\s*\.\s*$/.exec(lhs)
    if (!f) throw new Error(`sandbox option ${name}: no field on the left-hand side`)
    const enc = enclosing(blocks, m.index!)
    const types = enc.filter(k => blocks[k].kind === 'type').map(k => blocks[k].name)
    const inner = types.length > 1 ? types[types.length - 1] : null
    const holder = inner ? holders[inner] ?? null : null
    if (inner && !holder) throw new Error(`sandbox option ${name}: nested class ${inner} has no holder field`)
    const dot = name.indexOf('.')
    const group = dot >= 0 ? name.slice(0, dot) : null
    const short = dot >= 0 ? name.slice(dot + 1) : name
    const type = typeMap[m[1]]
    const d: Omit<SandboxDecl, 'order'> = {
      name,
      group,
      short,
      field: f[1],
      holder,
      type,
      javaDefault: null,
      translation: null,
      valueTranslation: null,
      line: line(m.index!),
      endLine: line(close),
    }
    if (type === 'boolean') d.javaDefault = javaLiteral(args[1])!.value
    else if (type === 'double' || type === 'integer') {
      d.min = num(args[1], name)
      d.max = num(args[2], name)
      d.javaDefault = num(args[3], name)
    } else if (type === 'string') {
      d.javaDefault = javaLiteral(args[1])!.value
      d.maxLength = num(args[2], name)
    } else if (/\.class$/.test(args[1])) {
      // enum backed by a Java enum: count its constants
      const cls = args[1].replace(/\.class$/, '').trim()
      const constants = enumConstants(enumSource(cls))
      const def = args[2].trim().split('.').pop()!
      const idx = constants.findIndex(c => c.name === def)
      if (idx < 0) throw new Error(`sandbox option ${name}: ${def} is not a constant of ${cls}`)
      d.enumClass = cls
      d.numValues = constants.length
      d.min = 1
      d.max = constants.length
      d.javaDefault = idx + 1
    } else {
      d.numValues = num(args[1], name)
      d.min = 1
      d.max = d.numValues
      d.javaDefault = num(args[2], name)
    }
    // chained setters up to the end of the statement
    const end = stripped.indexOf(';', close)
    const tail = text.slice(close + 1, end)
    const tr = /\.setTranslation\(\s*"([^"]+)"\s*\)/.exec(tail)
    const vt = /\.setValueTranslation\(\s*"([^"]+)"\s*\)/.exec(tail)
    if (tr) d.translation = tr[1]
    if (vt) d.valueTranslation = vt[1]
    raw.push(d)
  }
  // construction order: top-level fields in text order; a group's options where its holder is
  const topLevel = raw.filter(d => !d.holder)
  const ordered: SandboxDecl[] = []
  const events: { at: number; push: () => void }[] = []
  for (const d of topLevel) events.push({ at: d.line, push: () => ordered.push({ ...d, order: ordered.length }) })
  for (const h of holderAt) {
    const hl = line(h.at)
    events.push({ at: hl, push: () => raw.filter(d => d.holder === holders[h.cls]).forEach(d => ordered.push({ ...d, order: ordered.length })) })
  }
  events.sort((a, b) => a.at - b.at).forEach(e => e.push())
  if (ordered.length !== raw.length) throw new Error(`sandbox order lost options: ${ordered.length} of ${raw.length}`)
  return { decls: ordered, holders }
}

export function enumConstants(src: string): { name: string; args: string }[] {
  const stripped = stripJava(src)
  const m = /\benum\s+\w+[^{]*\{/.exec(stripped)
  if (!m) throw new Error('no enum declaration')
  const start = m.index + m[0].length
  const end = stripped.indexOf(';', start)
  const body = src.slice(start, end)
  return splitArgs(body)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const c = /^(\w+)\s*(?:\((.*)\))?/s.exec(s)!
      return { name: c[1], args: (c[2] ?? '').trim() }
    })
}

// ---------------------------------------------------------------------------------------
// Commands, roles, capabilities
// ---------------------------------------------------------------------------------------

/** The annotation blocks before `public class`, as text. */
function annotationText(text: string): string {
  const stripped = stripJava(text)
  const cls = /\bpublic\s+(?:abstract\s+)?class\s+\w+/.exec(stripped)
  if (!cls) throw new Error('no public class')
  return text.slice(0, cls.index)
}

function stringsIn(s: string): string[] {
  return [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => javaUnescape(x[1]))
}

function annotationBodies(ann: string, name: string): string[] {
  const out: string[] = []
  const re = new RegExp(`@${name}\\s*\\(`, 'g')
  for (const m of ann.matchAll(re)) {
    const open = m.index! + m[0].length - 1
    const close = closingParen(ann, open)
    out.push(ann.slice(open + 1, close))
  }
  return out
}

function annotationValue(body: string, key: string): string | null {
  const m = new RegExp(`\\b${key}\\s*=\\s*`).exec(body)
  if (!m) return null
  const rest = body.slice(m.index + m[0].length)
  if (rest.startsWith('{')) {
    let depth = 0
    for (let k = 0; k < rest.length; k++) {
      const c = rest[k]
      if (c === '"') {
        k++
        while (k < rest.length && rest[k] !== '"') k += rest[k] === '\\' ? 2 : 1
      } else if (c === '{') depth++
      else if (c === '}' && --depth === 0) return rest.slice(0, k + 1)
    }
  }
  const str = /^"((?:[^"\\]|\\.)*)"/.exec(rest)
  if (str) return str[0]
  return /^[^,)]+/.exec(rest)![0].trim()
}

export function parseCommandAnnotations(text: string): Omit<CommandData, 'class' | 'help' | 'actsIn'> {
  const ann = annotationText(text)
  const names = annotationBodies(ann, 'CommandName').map(b => stringsIn(annotationValue(b, 'name') ?? '')[0])
  const variants: CommandArgVariant[] = annotationBodies(ann, 'CommandArgs').map(b => {
    const req = annotationValue(b, 'required')
    const opt = annotationValue(b, 'optional')
    const an = annotationValue(b, 'argName')
    const va = annotationValue(b, 'varArgs')
    return {
      required: req ? stringsIn(req) : [],
      optional: opt ? stringsIn(opt)[0] ?? null : null,
      argName: an ? stringsIn(an)[0] ?? null : null,
      varArgs: va === 'true',
    }
  })
  const help = annotationBodies(ann, 'CommandHelp')[0]
  const helpKey = help ? stringsIn(annotationValue(help, 'helpText') ?? '')[0] ?? null : null
  const helpTranslated = help ? annotationValue(help, 'shouldTranslated') !== 'false' : true
  const capabilities = annotationBodies(ann, 'RequiredCapability').map(b => {
    const cap = annotationValue(b, 'requiredCapability')!
    const an = annotationValue(b, 'argName')
    return { capability: cap.replace(/^Capability\./, ''), argName: an ? stringsIn(an)[0] ?? null : null }
  })
  return {
    names,
    disabled: /@DisabledCommand\b/.test(ann),
    variants,
    helpKey: helpKey && !helpTranslated ? null : helpKey,
    capabilities,
    ...(helpKey && !helpTranslated ? { helpUntranslated: helpKey } : {}),
  } as Omit<CommandData, 'class' | 'help' | 'actsIn'>
}

export function parseRoles(text: string, allCapabilities: string[]): RoleData[] {
  const stripped = stripJava(text)
  const m = /public\s+static\s+void\s+addStatic\s*\(\s*\)\s*\{/.exec(stripped)
  if (!m) throw new Error('Roles#addStatic not found')
  const open = m.index + m[0].length - 1
  let depth = 0
  let close = -1
  for (let k = open; k < stripped.length; k++) {
    if (stripped[k] === '{') depth++
    else if (stripped[k] === '}' && --depth === 0) {
      close = k
      break
    }
  }
  const body = text.slice(open, close)
  const vars = new Map<string, RoleData>()
  const order: RoleData[] = []
  for (const st of body.split(/;|\{|\}/)) {
    const s = st.replace(/\s+/g, ' ').trim()
    let r: RegExpExecArray | null
    if ((r = /^Role (\w+) = new Role\("([^"]+)"\)$/.exec(s))) {
      const role: RoleData = { name: r[2], description: '', color: [], position: 0, allCapabilities: false, removed: [], capabilities: [], defaultFor: [] }
      vars.set(r[1], role)
      order.push(role)
    } else if ((r = /^(\w+)\.addCapability\(Capability\.(\w+)\)$/.exec(s))) vars.get(r[1])!.capabilities.push(r[2])
    else if ((r = /^(\w+)\.addCapability\(c\)$/.exec(s))) vars.get(r[1])!.allCapabilities = true
    else if ((r = /^(\w+)\.removeCapability\(Capability\.(\w+)\)$/.exec(s))) vars.get(r[1])!.removed.push(r[2])
    else if ((r = /^(\w+)\.setDescription\("((?:[^"\\]|\\.)*)"\)$/.exec(s))) vars.get(r[1])!.description = javaUnescape(r[2])
    else if ((r = /^(\w+)\.setColor\(new Color\(([^)]*)\)\)$/.exec(s))) vars.get(r[1])!.color = r[2].split(',').map(x => Number(x.trim().replace(/[fF]$/, '')))
    else if ((r = /^(\w+)\.setPosition\((\d+)\)$/.exec(s))) vars.get(r[1])!.position = Number(r[2])
    else if ((r = /^(defaultFor\w+) = (\w+)$/.exec(s))) vars.get(r[2])!.defaultFor.push(r[1])
  }
  for (const role of order) {
    if (role.allCapabilities) role.capabilities = allCapabilities.filter(c => !role.removed.includes(c))
  }
  return order
}

// ---------------------------------------------------------------------------------------
// Read sites
// ---------------------------------------------------------------------------------------

/** Every line a declaration statement covers, from its first line to its last. */
function declLines(decls: { line: number; endLine: number }[]): Set<number> {
  const out = new Set<number>()
  for (const d of decls) for (let k = d.line; k <= d.endLine; k++) out.add(k)
  return out
}

class SiteMap {
  private m = new Map<string, Map<string, Site>>()
  add(key: string, s: Site): void {
    if (!this.m.has(key)) this.m.set(key, new Map())
    this.m.get(key)!.set(`${s.lang}|${s.where}|${s.in}|${s.line}`, s)
  }
  get(key: string): Site[] {
    return [...(this.m.get(key)?.values() ?? [])].sort(siteOrder)
  }
  keys(): string[] {
    return [...this.m.keys()]
  }
}

export function siteOrder(a: Site, b: Site): number {
  return a.lang.localeCompare(b.lang) || a.where.localeCompare(b.where) || a.line - b.line || a.in.localeCompare(b.in)
}

interface Scan {
  serverReads: SiteMap
  serverWrites: SiteMap
  sandboxReads: SiteMap
  sandboxWrites: SiteMap
  sandboxComputed: { prefix: string; site: Site }[]
  /** getOptionByName(<not text>) on a SandboxOptions receiver, outside SandboxOptions itself */
  sandboxByVariable: Site[]
  /** "Sandbox.<Name>" written as text in Lua (worldgen data read by ProbaString) */
  sandboxDataNamed: SiteMap
  capabilityReads: SiteMap
  unknownServerNames: SiteMap
  unknownSandboxNames: SiteMap
}

function statementBefore(stripped: string, at: number): string {
  const s = Math.max(stripped.lastIndexOf(';', at - 1), stripped.lastIndexOf('{', at - 1), stripped.lastIndexOf('}', at - 1)) + 1
  return stripped.slice(s, at)
}

/** Java: the option object reached at `end` is changed, not read (`.setValue(`, `.parse(`, ...). */
const JAVA_SETTERS = /^\s*\.\s*(?:setValue|parse|setValueFromObject|resetToDefault|setDefaultToCurrentValue)\s*\(/
/** Lua: the value reached at `end` is assigned. */
const LUA_ASSIGN = /^\s*=(?!=)/

function scanJava(
  src: string,
  server: ServerDecl[],
  sandbox: SandboxDecl[],
  holders: Record<string, string>,
  capabilities: Set<string>,
  scan: Scan,
): void {
  const serverByField = new Map(server.map(d => [d.field, d]))
  const serverByName = new Map(server.map(d => [d.name, d]))
  const sandboxTop = new Map(sandbox.filter(d => !d.holder).map(d => [d.field, d]))
  const sandboxNested = new Map(sandbox.filter(d => d.holder).map(d => [`${d.holder}.${d.field}`, d]))
  const sandboxByName = new Map(sandbox.map(d => [d.name, d]))
  const holderFields = new Set(Object.values(holders))
  const holderByClass = holders
  const serverDeclLines = declLines(server)
  const sandboxDeclLines = declLines(sandbox)

  for (const file of walk(src, '.java')) {
    const text = fs.readFileSync(file, 'utf-8')
    const hasServer = text.includes('ServerOptions')
    const hasSandbox = text.includes('SandboxOptions') || text.includes('getSandboxOptions')
    const hasCap = text.includes('Capability')
    if (!hasServer && !hasSandbox && !hasCap) continue
    const rel = posix(path.relative(src, file))
    const stripped = stripJava(text)
    const blocks = javaBlocks(stripped)
    const line = lineIndex(stripped)
    const site = (at: number): Site => {
      const w = javaWhere(text, blocks, at)
      return { lang: 'java', where: w.where, in: w.in, line: line(at) }
    }
    const methodOf = (at: number) => [...enclosing(blocks, at)].reverse().find(k => blocks[k].kind === 'method')
    const isServerOptionsFile = rel === 'zombie/network/ServerOptions.java'
    const isSandboxFile = rel === 'zombie/SandboxOptions.java'
    const changedAt = (end: number) => JAVA_SETTERS.test(stripped.slice(end, end + 60))

    if (hasServer) {
      const fieldAt = (field: string, at: number, end: number) => {
        const d = serverByField.get(field)
        if (!d) return
        if (isServerOptionsFile) {
          if (serverDeclLines.has(line(at))) return
          const w = javaWhere(text, blocks, at)
          if (w.in === 'ServerOptions') return // the constructor only builds the public list
        }
        ;(changedAt(end) ? scan.serverWrites : scan.serverReads).add(d.name, site(at))
      }
      for (const m of stripped.matchAll(/\bServerOptions\s*\.\s*(?:instance|getInstance\s*\(\s*\))\s*\.\s*([A-Za-z_]\w*)\b/g)) fieldAt(m[1], m.index!, m.index! + m[0].length)
      if (isServerOptionsFile) {
        for (const m of stripped.matchAll(/(?<![\w.])(?:this|instance|getInstance\s*\(\s*\))\s*\.\s*([A-Za-z_]\w*)\b/g)) fieldAt(m[1], m.index!, m.index! + m[0].length)
      }
      // local variables holding the instance, inside one method
      for (const a of stripped.matchAll(/\bServerOptions\s+(\w+)\s*=\s*ServerOptions\s*\.\s*(?:instance|getInstance\s*\(\s*\))\s*;/g)) {
        const mi = methodOf(a.index!)
        if (mi === undefined) continue
        const b = blocks[mi]
        const body = stripped.slice(a.index!, b.close)
        for (const u of body.matchAll(new RegExp(`(?<![\\w.])${a[1]}\\s*\\.\\s*([A-Za-z_]\\w*)\\b`, 'g'))) fieldAt(u[1], a.index! + u.index!, a.index! + u.index! + u[0].length)
      }
      // a getter (or a setter) with the name written as text, on a ServerOptions receiver
      for (const m of text.matchAll(/\.\s*(getOption|getBoolean|getInteger|getFloat|getDouble|getOptionByName|putOption|putSaveOption|changeOption)\s*\(\s*"([^"\\]+)"/g)) {
        const at = m.index!
        if (stripped[at] !== '.') continue // inside a comment or a string
        const recv = statementBefore(stripped, at)
        if (!/ServerOptions|getServerOptions/.test(recv) && !(isServerOptionsFile && /(?<![\w.])$|this\s*$/.test(recv.trimEnd()))) continue
        const d = serverByName.get(m[2])
        const write = /^(putOption|putSaveOption|changeOption)$/.test(m[1])
        if (d) (write ? scan.serverWrites : scan.serverReads).add(d.name, site(at))
        else if (/ServerOptions|getServerOptions/.test(recv)) scan.unknownServerNames.add(m[2], site(at))
      }
    }

    if (hasSandbox) {
      // m[1] field, m[2] the optional `.sub` tail, m[3] sub
      const topAt = (m: RegExpMatchArray, at: number) => {
        const field = m[1]
        const sub = m[3]
        const end = at + m[0].length
        if (holderFields.has(field)) {
          if (!sub) return
          const d = sandboxNested.get(`${field}.${sub}`)
          if (d) (changedAt(end) ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(at))
          return
        }
        const d = sandboxTop.get(field)
        if (!d) return
        const fieldEnd = end - (m[2]?.length ?? 0)
        ;(changedAt(fieldEnd) ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(at))
      }
      const accessRe = (head: string) => new RegExp(`${head}\\s*\\.\\s*([A-Za-z_]\\w*)(\\s*\\.\\s*([A-Za-z_]\\w*))?`, 'g')
      for (const m of stripped.matchAll(accessRe('\\bSandboxOptions\\s*\\.\\s*(?:instance|getInstance\\s*\\(\\s*\\))'))) topAt(m, m.index!)
      for (const m of stripped.matchAll(accessRe('\\bgetSandboxOptions\\s*\\(\\s*\\)'))) topAt(m, m.index!)
      if (isSandboxFile) {
        // inside the class: this.x, and the static instance without its class name
        for (const m of stripped.matchAll(accessRe('(?<![\\w.])(?:SandboxOptions\\s*\\.\\s*this|this|instance|getInstance\\s*\\(\\s*\\))'))) {
          const at = m.index!
          if (sandboxDeclLines.has(line(at))) continue
          const w = javaWhere(text, blocks, at)
          const inner = w.types.length > 1 ? w.types[w.types.length - 1] : null
          const viaOuter = !/^this\b/.test(m[0])
          if (inner && !viaOuter) {
            // `this.x` inside a nested group class means the group's own field
            const holder = holderByClass[inner]
            const d = holder ? sandboxNested.get(`${holder}.${m[1]}`) : undefined
            const fieldEnd = at + m[0].length - (m[2]?.length ?? 0)
            if (d) (changedAt(fieldEnd) ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(at))
          } else topAt(m, at)
        }
      }
      // local variables holding SandboxOptions or one of its groups, inside one method
      for (const a of stripped.matchAll(/\bSandboxOptions(?:\s*\.\s*(\w+))?\s+(\w+)\s*=\s*(SandboxOptions\s*\.\s*(?:instance|getInstance\s*\(\s*\))|LuaManager\s*\.\s*GlobalObject\s*\.\s*getSandboxOptions\s*\(\s*\))(?:\s*\.\s*(\w+))?\s*;/g)) {
        const groupCls = a[1]
        const groupField = a[4]
        if (groupCls && (!groupField || holderByClass[groupCls] !== groupField)) continue
        if (!groupCls && groupField) continue
        const mi = methodOf(a.index!)
        if (mi === undefined) continue
        const body = stripped.slice(a.index!, blocks[mi].close)
        for (const u of body.matchAll(accessRe(`(?<![\\w.])${a[2]}`))) {
          const at = a.index! + u.index!
          if (groupCls) {
            const d = sandboxNested.get(`${groupField}.${u[1]}`)
            const fieldEnd = at + u[0].length - (u[2]?.length ?? 0)
            if (d) (changedAt(fieldEnd) ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(at))
          } else topAt(u, at)
        }
      }
      if (!isSandboxFile) {
        for (const m of stripped.matchAll(/\bgetOptionByName\s*\(\s*(?!")/g)) {
          const at = m.index!
          if (text[at + m[0].length] === '"') continue
          if (!/SandboxOptions|getSandboxOptions/.test(statementBefore(stripped, at))) continue
          scan.sandboxByVariable.push(site(at))
        }
      }
      for (const m of text.matchAll(/\bgetOptionByName\s*\(\s*"([^"\\]+)"\s*(\+)?/g)) {
        const at = m.index!
        if (stripped[at] !== 'g') continue
        const recv = statementBefore(stripped, at)
        if (!/SandboxOptions|getSandboxOptions/.test(recv) && !(isSandboxFile && /(?<![\w.])$|this\s*\.\s*$/.test(recv.trimEnd()))) continue
        if (m[2]) {
          scan.sandboxComputed.push({ prefix: m[1], site: site(at) })
          continue
        }
        const close = closingParen(stripped, stripped.indexOf('(', at))
        const write = close > 0 && /^\s*\.\s*(?:asConfigOption\s*\(\s*\)\s*\.\s*)?(?:setValue|parse|setValueFromObject)\s*\(/.test(stripped.slice(close + 1, close + 80))
        const d = sandboxByName.get(m[1])
        if (d) (write ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(at))
        else scan.unknownSandboxNames.add(m[1], site(at))
      }
    }

    if (hasCap && rel !== 'zombie/characters/Capability.java') {
      for (const m of stripped.matchAll(/\bCapability\s*\.\s*([A-Za-z_]\w*)\b/g)) {
        if (!capabilities.has(m[1])) continue
        const at = m.index!
        const w = javaWhere(text, blocks, at)
        if (w.types.length === 0) continue // a command annotation, before the class
        if (rel === 'zombie/characters/Roles.java' && w.in === 'addStatic') continue
        scan.capabilityReads.add(m[1], site(at))
      }
    }
  }
}

function scanLua(
  luaRoot: string,
  server: ServerDecl[],
  sandbox: SandboxDecl[],
  capabilities: Set<string>,
  scan: Scan,
): void {
  const serverByName = new Map(server.map(d => [d.name, d]))
  const sandboxByName = new Map(sandbox.map(d => [d.name, d]))
  const groups = new Set(sandbox.filter(d => d.group).map(d => d.group!))
  for (const file of walk(luaRoot, '.lua')) {
    const text = fs.readFileSync(file, 'utf-8')
    const rel = posix(path.relative(luaRoot, file))
    if (/^shared\/Sandbox\//.test(rel)) continue // the preset files
    const hasServer = text.includes('ServerOptions')
    const hasSandbox = text.includes('SandboxVars') || text.includes('getSandboxOptions') || text.includes('Sandbox.')
    const hasCap = text.includes('Capability')
    if (!hasServer && !hasSandbox && !hasCap) continue
    const stripped = stripLua(text)
    const noComments = stripLuaComments(text)
    const blocks = luaBlocks(stripped)
    const line = lineIndex(stripped)
    const site = (at: number): Site => ({ lang: 'lua', where: rel, in: luaFunctionAt(blocks, at), line: line(at) })
    const assignedAt = (end: number) => LUA_ASSIGN.test(stripped.slice(end, end + 8))

    if (hasServer) {
      for (const m of noComments.matchAll(/\b(?:getServerOptions\s*\(\s*\)|ServerOptions\s*[.:]\s*getInstance\s*\(\s*\)|ServerOptions\s*\.\s*instance)\s*:\s*(get\w*|getOptionByName)\s*\(\s*"([^"\\]+)"/g)) {
        const d = serverByName.get(m[2])
        if (d) scan.serverReads.add(d.name, site(m.index!))
        else scan.unknownServerNames.add(m[2], site(m.index!))
      }
    }
    if (hasSandbox) {
      for (const m of stripped.matchAll(/\bSandboxVars\s*\.\s*([A-Za-z_]\w*)(\s*\.\s*([A-Za-z_]\w*))?/g)) {
        const at = m.index!
        const end = at + m[0].length
        if (groups.has(m[1])) {
          if (!m[3]) continue
          const d = sandboxByName.get(`${m[1]}.${m[3]}`)
          if (d) (assignedAt(end) ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(at))
          else scan.unknownSandboxNames.add(`${m[1]}.${m[3]}`, site(at))
        } else {
          const d = sandboxByName.get(m[1])
          const fieldEnd = end - (m[2]?.length ?? 0)
          if (d) (assignedAt(fieldEnd) ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(at))
          else scan.unknownSandboxNames.add(m[1], site(at))
        }
      }
      for (const m of noComments.matchAll(/(["'])Sandbox\.([A-Za-z_]\w*)\1/g)) {
        const d = sandboxByName.get(m[2])
        if (d) scan.sandboxDataNamed.add(d.name, site(m.index!))
      }
      for (const m of noComments.matchAll(/\bSandboxVars\s*\[\s*"([^"\\]+)"\s*\]/g)) {
        const d = sandboxByName.get(m[1])
        const end = m.index! + m[0].length
        if (d) (assignedAt(end) ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(m.index!))
        else scan.unknownSandboxNames.add(m[1], site(m.index!))
      }
      for (const m of noComments.matchAll(/\bgetSandboxOptions\s*\(\s*\)\s*:\s*getOptionByName\s*\(\s*"([^"\\]+)"\s*\)(\s*:\s*(?:setValue|parse|setValueFromObject)\s*\()?/g)) {
        const d = sandboxByName.get(m[1])
        if (d) (m[2] ? scan.sandboxWrites : scan.sandboxReads).add(d.name, site(m.index!))
        else scan.unknownSandboxNames.add(m[1], site(m.index!))
      }
    }
    if (hasCap) {
      for (const m of stripped.matchAll(/\bCapability\s*\.\s*([A-Za-z_]\w*)\b/g)) if (capabilities.has(m[1])) scan.capabilityReads.add(m[1], site(m.index!))
    }
  }
}

/** Where a name appears as a string literal (Java and Lua), outside the excluded places. */
function namedSites(
  src: string,
  luaRoot: string,
  names: Set<string>,
  exclude: { javaLines: Map<string, Set<number>>; luaRanges: Map<string, [number, number][]> },
): SiteMap {
  const out = new SiteMap()
  const re = /"([A-Za-z_][\w.]*)"/g
  for (const file of walk(src, '.java')) {
    const text = fs.readFileSync(file, 'utf-8')
    if (!text.includes('"')) continue
    const rel = posix(path.relative(src, file))
    let stripped: string | null = null
    let blocks: JavaBlock[] | null = null
    let line: ((o: number) => number) | null = null
    for (const m of text.matchAll(re)) {
      if (!names.has(m[1])) continue
      stripped ??= stripJava(text)
      if (stripped[m.index!] !== '"') continue // inside a comment
      blocks ??= javaBlocks(stripped)
      line ??= lineIndex(stripped)
      const ln = line(m.index!)
      if (exclude.javaLines.get(rel)?.has(ln)) continue
      const w = javaWhere(text, blocks, m.index!)
      out.add(m[1], { lang: 'java', where: w.where, in: w.in, line: ln })
    }
  }
  const lre = /(["'])([A-Za-z_][\w.]*)\1/g
  for (const file of walk(luaRoot, '.lua')) {
    const rel = posix(path.relative(luaRoot, file))
    if (/^shared\/Sandbox\//.test(rel)) continue
    const text = fs.readFileSync(file, 'utf-8')
    let noComments: string | null = null
    let blocks: ReturnType<typeof luaBlocks> | null = null
    let line: ((o: number) => number) | null = null
    for (const m of text.matchAll(lre)) {
      if (!names.has(m[2])) continue
      noComments ??= stripLuaComments(text)
      if (noComments[m.index!] !== m[1]) continue
      const ranges = exclude.luaRanges.get(rel)
      if (ranges && ranges.some(([a, b]) => m.index! >= a && m.index! < b)) continue
      const stripped = stripLua(text)
      blocks ??= luaBlocks(stripped)
      line ??= lineIndex(stripped)
      out.add(m[2], { lang: 'lua', where: rel, in: luaFunctionAt(blocks, m.index!), line: line(m.index!) })
    }
  }
  return out
}

// ---------------------------------------------------------------------------------------
// Serialisation: one record per line where records repeat
// ---------------------------------------------------------------------------------------

export function serialize(data: unknown): string {
  const ROW_KEYS = new Set(['reads', 'writes', 'named', 'computed', 'variants', 'sites', 'dynamicReads', 'unknownServerNames', 'unknownSandboxNames'])
  const NL = '\n'
  const write = (v: unknown, indent: string, key: string | null): string => {
    if (Array.isArray(v)) {
      if (v.length === 0) return '[]'
      if (key && ROW_KEYS.has(key)) return '[' + NL + v.map(x => indent + ' ' + JSON.stringify(x)).join(',' + NL) + NL + indent + ']'
      if (v.every(x => typeof x !== 'object' || x === null)) return JSON.stringify(v)
      return '[' + NL + v.map(x => indent + ' ' + write(x, indent + ' ', null)).join(',' + NL) + NL + indent + ']'
    }
    if (v && typeof v === 'object') {
      const entries = Object.entries(v as Record<string, unknown>)
      if (entries.length === 0) return '{}'
      return '{' + NL + entries.map(([k, x]) => `${indent} ${JSON.stringify(k)}: ${write(x, indent + ' ', k)}`).join(',' + NL) + NL + indent + '}'
    }
    return JSON.stringify(v)
  }
  return write(data, '', null) + NL
}

// ---------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------

function readJson(p: string): Record<string, string> {
  return JSON.parse(fs.readFileSync(p, 'utf-8').replace(/^\uFEFF/, ''))
}

/** The game's text as shown: `\n` escapes become spaces, `\"` a quote. */
function shown(s: string | undefined | null): string | null {
  if (s === undefined || s === null) return null
  return s.replace(/\\n/g, ' ').replace(/\\"/g, '"').replace(/\s+/g, ' ').trim()
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const cap = path.resolve(args.capture)
  const src = path.join(cap, 'src')
  const snap = path.join(cap, 'game_snapshot')
  const lua = path.join(snap, 'media', 'lua')
  const manifest = fs.readFileSync(path.join(cap, 'MANIFEST.yaml'), 'utf-8')
  const build = manifestValue(manifest, 'build_label')
  const revision = manifestValue(manifest, 'git_revision')
  const steamBuild = manifestValue(manifest, 'steam_buildid')
  const jarSha = manifestValue(manifest, 'source_sha256')
  const sealed = manifestValue(manifest, 'sealed')
  const jar = path.join(snap, 'projectzomboid.jar')
  const gotSha = crypto.createHash('sha256').update(fs.readFileSync(jar)).digest('hex')
  if (gotSha !== jarSha) {
    console.error(`[ERROR] jar sha256 ${gotSha} does not match the capture manifest ${jarSha}`)
    process.exit(1)
  }
  console.log(`[OK] capture ${path.basename(cap)}: build ${build}, revision ${revision}, jar sha256 matches the manifest`)

  const tr = path.join(lua, 'shared', 'Translate', 'EN')
  const UI = readJson(path.join(tr, 'UI.json'))
  const SB = readJson(path.join(tr, 'Sandbox.json'))
  const IG = readJson(path.join(tr, 'IG_UI.json'))
  const sbText = (k: string) => SB[k] ?? UI[k]

  // server options ------------------------------------------------------------------------
  const soPath = path.join(src, 'zombie', 'network', 'ServerOptions.java')
  const soText = fs.readFileSync(soPath, 'utf-8')
  const { decls: serverDecls, publicExcluded } = parseServerOptions(soText)
  console.log(`[OK] server options: ${serverDecls.length} (public list leaves out ${publicExcluded.length})`)

  // sandbox options -----------------------------------------------------------------------
  const sbPath = path.join(src, 'zombie', 'SandboxOptions.java')
  const sbJava = fs.readFileSync(sbPath, 'utf-8')
  const imports = new Map([...sbJava.matchAll(/^import\s+([\w.]+)\s*;/gm)].map(m => [m[1].split('.').pop()!, m[1]]))
  const enumSource = (cls: string) => {
    const full = imports.get(cls) ?? `zombie.${cls}`
    return fs.readFileSync(path.join(src, ...full.split('.')) + '.java', 'utf-8')
  }
  const { decls: sandboxDecls, holders } = parseSandboxOptions(sbJava, enumSource)
  console.log(`[OK] sandbox options: ${sandboxDecls.length} (${Object.keys(holders).length} nested groups)`)

  // settings screen pages ------------------------------------------------------------------
  const sssRel = 'client/OptionScreens/ServerSettingsScreen.lua'
  const sssText = fs.readFileSync(path.join(lua, ...sssRel.split('/')), 'utf-8')
  const sssClean = stripLuaComments(sssText)
  const stAt = /\bSettingsTable\s*=\s*\{/.exec(sssClean)
  if (!stAt) throw new Error('SettingsTable not found')
  const settings = readLuaTable(sssClean, stAt.index + stAt[0].length - 1)
  const stEnd = closingBrace(sssClean, stAt.index + stAt[0].length - 1)
  const groupsTbl = settings.array.filter(isTable)
  const iniGroup = groupsTbl.find(g => g.hash.name === 'INI')
  const sbGroup = groupsTbl.find(g => g.hash.name === 'Sandbox')
  if (!iniGroup || !sbGroup) throw new Error('SettingsTable has no INI or Sandbox group')
  type Page = { key: string; title: string; settings: { name: string; title: string | null }[]; steamOnly: boolean; customUi: string | null }
  const pagesOf = (g: LuaTable, titleOf: (k: string) => string | null): Page[] =>
    (g.hash.pages as LuaTable).array.filter(isTable).map(p => {
      const key = typeof p.hash.name === 'string' ? p.hash.name : ''
      const settingsList = isTable(p.hash.settings) ? p.hash.settings.array.filter(isTable) : []
      return {
        key,
        title: key ? titleOf(key) ?? key : '',
        settings: settingsList.map(s => ({ name: String(s.hash.name), title: typeof s.hash.title === 'string' ? s.hash.title : null })),
        steamOnly: p.hash.steamOnly === true,
        customUi: p.hash.customui && typeof p.hash.customui === 'object' && 'expr' in p.hash.customui ? (p.hash.customui as { expr: string }).expr : null,
      }
    })
  const serverPages = pagesOf(iniGroup, k => shown(UI[`UI_ServerSettingGroup_${k}`]))
  // the Sandbox group starts with the presets page (a title, no name), which the screens drop
  const sandboxPages = pagesOf(sbGroup, k => shown(sbText(`Sandbox_${k}`))).filter(p => p.key)
  const debugOnlyUi = new Set<string>()
  const sbScreen = fs.readFileSync(path.join(lua, 'client', 'OptionScreens', 'SandboxOptions.lua'), 'utf-8')
  const dbg = /local\s+function\s+isDebugSetting\s*\(\s*setting\s*\)([\s\S]*?)\bend\b/.exec(sbScreen)
  if (dbg) for (const n of dbg[1].matchAll(/setting\.name\s*==\s*"([^"]+)"/g)) debugOnlyUi.add(n[1])

  // presets ------------------------------------------------------------------------------------
  const presetDir = path.join(lua, 'shared', 'Sandbox')
  const presetOrder = [...sbScreen.matchAll(/addPresetToList\(\s*"([^"]+)"\s*,\s*getText\(\s*"([^"]+)"\s*\)\s*,\s*false\s*\)/g)].map(m => ({ file: m[1], titleKey: m[2] }))
  const presetValues = new Map<string, Map<string, Literal>>()
  const presetInfo: { name: string; title: string | null; file: string; keys: number; unknownKeys: string[]; resolved: string[] }[] = []
  const sandboxNames = new Set(sandboxDecls.map(d => d.name))
  // a preset may write `tonumber(Table.Key)`, with Table.Key = "number" set in shared/defines.lua
  const definesText = stripLuaComments(fs.readFileSync(path.join(lua, 'shared', 'defines.lua'), 'utf-8'))
  const defines = new Map([...definesText.matchAll(/^\s*(\w+\.\w+)\s*=\s*"([^"]*)"\s*$/gm)].map(m => [m[1], m[2]]))
  for (const p of presetOrder) {
    const rel = `shared/Sandbox/${p.file}.lua`
    const text = stripLuaComments(fs.readFileSync(path.join(presetDir, `${p.file}.lua`), 'utf-8'))
    const r = /\breturn\s*\{/.exec(text)
    if (!r) throw new Error(`${rel} does not return a table`)
    const t = readLuaTable(text, r.index + r[0].length - 1)
    const flat = new Map<string, Literal>()
    const unknown: string[] = []
    const resolved: string[] = []
    const literal = (name: string, v: LuaValue): Literal => {
      if (isTable(v)) throw new Error(`${rel}: ${name} is a table`)
      if (v !== null && typeof v === 'object') {
        const call = /^tonumber\s*\(\s*(\w+\.\w+)\s*\)$/.exec(v.expr)
        if (call && defines.has(call[1]) && !Number.isNaN(Number(defines.get(call[1])))) {
          resolved.push(`${name} = ${v.expr} = ${defines.get(call[1])}`)
          return Number(defines.get(call[1]))
        }
        throw new Error(`${rel}: ${name} is not a literal: ${v.expr}`)
      }
      return v
    }
    for (const [k, v] of Object.entries(t.hash)) {
      if (k === 'Version' || k === 'VERSION') continue
      if (isTable(v)) {
        for (const [k2, v2] of Object.entries(v.hash)) {
          const name = `${k}.${k2}`
          if (sandboxNames.has(name)) flat.set(name, literal(name, v2))
          else unknown.push(name)
        }
      } else if (sandboxNames.has(k)) flat.set(k, literal(k, v))
      else unknown.push(k)
    }
    presetValues.set(p.file, flat)
    presetInfo.push({ name: p.file, title: shown(UI[p.titleKey]), file: `media/lua/${rel}`, keys: flat.size, unknownKeys: unknown.sort(), resolved })
  }
  const defaultPreset = 'Apocalypse'
  const ctorPreset = /this\.loadGameFile\("([^"]+)"\)\s*;\s*this\.setDefaultsToCurrentValues\(\)/.exec(sbJava)
  if (!ctorPreset || ctorPreset[1] !== defaultPreset) throw new Error(`the SandboxOptions constructor no longer loads ${defaultPreset}`)

  // commands ------------------------------------------------------------------------------------
  const cbText = fs.readFileSync(path.join(src, 'zombie', 'commands', 'CommandBase.java'), 'utf-8')
  const listBody = /childrenClasses\s*=\s*new\s+Class\s*\[\s*\]\s*\{([\s\S]*?)\}\s*;/.exec(cbText)
  if (!listBody) throw new Error('CommandBase.childrenClasses not found')
  const classList = [...listBody[1].matchAll(/(\w+)\.class/g)].map(m => m[1])
  const cmdDir = path.join(src, 'zombie', 'commands', 'serverCommands')
  const cmdFiles = fs.readdirSync(cmdDir).filter(f => f.endsWith('.java')).map(f => f.replace(/\.java$/, '')).sort()
  const commandOf = (cls: string): CommandData => {
    const text = fs.readFileSync(path.join(cmdDir, `${cls}.java`), 'utf-8')
    const a = parseCommandAnnotations(text) as Omit<CommandData, 'class' | 'help' | 'actsIn'> & { helpUntranslated?: string }
    // where it acts: its own Command() method, else the nearest parent's
    let actsIn: Site | null = null
    let cur: string | null = cls
    while (cur && !actsIn) {
      const p = path.join(cmdDir, `${cur}.java`)
      if (!fs.existsSync(p)) break
      const t = fs.readFileSync(p, 'utf-8')
      const s = stripJava(t)
      const m = /\bprotected\s+String\s+Command\s*\(\s*\)/.exec(s)
      if (m) actsIn = { lang: 'java', where: `zombie.commands.serverCommands.${cur}`, in: 'Command', line: lineIndex(s)(m.index) }
      const ext = /\bclass\s+\w+\s+extends\s+(\w+)/.exec(s)
      cur = ext && ext[1] !== 'CommandBase' ? ext[1] : null
    }
    const help = a.helpKey ? shown(UI[a.helpKey]) : a.helpUntranslated ?? null
    return {
      class: cls,
      names: a.names,
      disabled: a.disabled,
      variants: a.variants,
      helpKey: a.helpKey,
      help,
      capabilities: a.capabilities,
      actsIn,
    }
  }
  const commands = classList.map(commandOf)
  const notListed = cmdFiles.filter(f => !classList.includes(f) && /@CommandName/.test(fs.readFileSync(path.join(cmdDir, `${f}.java`), 'utf-8')))
  const argTypes: Record<string, string> = {}
  const atText = fs.readFileSync(path.join(cmdDir, 'ArgType.java'), 'utf-8')
  for (const m of atText.matchAll(/public\s+static\s+final\s+String\s+(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"\s*;/g)) argTypes[m[1]] = javaUnescape(m[2])
  console.log(`[OK] commands: ${commands.length} registered (${commands.filter(c => c.disabled).length} disabled), ${notListed.length} command classes not registered`)

  // player commands: the help list ServerOptions builds for every player
  const playerCommands = [...soText.matchAll(/clientOptionsList\.put\(\s*"([^"]+)"\s*,\s*Translator\.getText\(\s*"([^"]+)"\s*\)\s*\)/g)].map(m => ({
    name: m[1],
    helpKey: m[2],
    help: shown(UI[m[2]]),
  }))

  // roles and capabilities --------------------------------------------------------------------
  const capText = fs.readFileSync(path.join(src, 'zombie', 'characters', 'Capability.java'), 'utf-8')
  const capBody = /\benum\s+Capability\s*\{([\s\S]*?);/.exec(stripJava(capText))
  if (!capBody) throw new Error('Capability enum not found')
  const capNames = capBody[1].split(',').map(s => s.trim()).filter(Boolean)
  const roles = parseRoles(fs.readFileSync(path.join(src, 'zombie', 'characters', 'Roles.java'), 'utf-8'), capNames)

  // read sites -----------------------------------------------------------------------------------
  const scan: Scan = {
    serverReads: new SiteMap(),
    serverWrites: new SiteMap(),
    sandboxReads: new SiteMap(),
    sandboxWrites: new SiteMap(),
    sandboxComputed: [],
    sandboxByVariable: [],
    sandboxDataNamed: new SiteMap(),
    capabilityReads: new SiteMap(),
    unknownServerNames: new SiteMap(),
    unknownSandboxNames: new SiteMap(),
  }
  scanJava(src, serverDecls, sandboxDecls, holders, new Set(capNames), scan)
  scanLua(lua, serverDecls, sandboxDecls, new Set(capNames), scan)
  // worldgen data writes "Sandbox.<Name>"; ProbaString's constructor looks that name up
  const probaPath = path.join(src, 'zombie', 'iso', 'worldgen', 'utils', 'probabilities', 'ProbaString.java')
  const probaText = fs.readFileSync(probaPath, 'utf-8')
  const probaStripped = stripJava(probaText)
  const probaAt = probaStripped.search(/getOptionByName\s*\(\s*this\s*\.\s*field\s*\)/)
  if (probaAt < 0 || !/"Sandbox"\s*\.\s*equals/.test(probaText)) throw new Error('ProbaString no longer reads "Sandbox.<name>" options')
  const probaSite: Site = { lang: 'java', ...(() => { const w = javaWhere(probaText, javaBlocks(probaStripped), probaAt); return { where: w.where, in: w.in } })(), line: lineIndex(probaStripped)(probaAt) }
  const computedFor = (name: string) => {
    const xs = scan.sandboxComputed.filter(c => name.startsWith(c.prefix)).map(c => c.site)
    const data = scan.sandboxDataNamed.get(name)
    if (data.length) xs.push(probaSite, ...data)
    return xs.sort(siteOrder)
  }

  // names written as text, for the options no read was found for
  const unread = new Set<string>([
    ...serverDecls.filter(d => scan.serverReads.get(d.name).length === 0).map(d => d.name),
    ...sandboxDecls.filter(d => scan.sandboxReads.get(d.name).length === 0 && computedFor(d.name).length === 0).flatMap(d => [d.name, d.short]),
  ])
  const javaLines = new Map<string, Set<number>>([
    ['zombie/network/ServerOptions.java', declLines(serverDecls)],
    ['zombie/SandboxOptions.java', declLines(sandboxDecls)],
  ])
  const luaRanges = new Map<string, [number, number][]>([[sssRel, [[stAt.index, stEnd + 1]]]])
  const named = namedSites(src, lua, unread, { javaLines, luaRanges })

  // assemble --------------------------------------------------------------------------------------
  const pageOfServer = new Map<string, string>()
  for (const p of serverPages) for (const s of p.settings) pageOfServer.set(s.name, p.key)
  const serverOptions: ServerOptionData[] = serverDecls.map(d => {
    const reads = scan.serverReads.get(d.name)
    const nm = reads.length ? [] : named.get(d.name)
    const o: ServerOptionData = {
      name: d.name,
      field: d.field,
      type: d.type,
      default: d.default,
      ...(d.min !== undefined ? { min: d.min, max: d.max } : {}),
      ...(d.maxLength !== undefined ? { maxLength: d.maxLength } : {}),
      ...(d.type === 'enum' ? { choices: Array.from({ length: d.numValues! }, (_x, i) => shown(UI[`UI_ServerOption_AntiCheat_option${i + 1}`]) ?? String(i + 1)) } : {}),
      tooltip: shown(UI[`UI_ServerOption_${d.name}_tooltip`]),
      page: pageOfServer.get(d.name) ?? null,
      public: !publicExcluded.includes(d.name),
      declaredLine: d.line,
      reads,
      writes: scan.serverWrites.get(d.name),
      named: nm,
      status: reads.length ? 'read' : nm.length ? 'named' : 'none',
    }
    return o
  })
  for (const p of serverPages) for (const s of p.settings) if (!serverOptions.some(o => o.name === s.name)) throw new Error(`settings page ${p.key} lists unknown server option ${s.name}`)

  const pageOfSandbox = new Map<string, { page: string; subgroup: string | null }>()
  for (const p of sandboxPages) {
    let sub: string | null = null
    for (const s of p.settings) {
      if (s.title) sub = s.title
      pageOfSandbox.set(s.name, { page: p.key, subgroup: sub })
    }
  }
  const apocalypse = presetValues.get(defaultPreset)!
  const sandboxOptions: SandboxOptionData[] = sandboxDecls.map(d => {
    const labelKey = `Sandbox_${d.translation ?? d.short}`
    const valueKey = d.valueTranslation ?? d.translation ?? d.short
    const def = apocalypse.has(d.name) ? apocalypse.get(d.name)! : d.javaDefault
    const presets: Record<string, Literal> = {}
    for (const p of presetOrder) {
      if (p.file === defaultPreset) continue
      const v = presetValues.get(p.file)!.get(d.name)
      if (v !== undefined && v !== def) presets[p.file] = v
    }
    let choices: string[] | undefined
    if (d.type === 'enum') {
      choices = Array.from({ length: d.numValues! }, (_x, i) => {
        if (d.name === 'StartYear') return String(1993 + i)
        if (d.name === 'StartDay') return String(i + 1)
        return shown(sbText(`Sandbox_${valueKey}_option${i + 1}`)) ?? String(i + 1)
      })
    }
    const reads = scan.sandboxReads.get(d.name)
    const computed = reads.length ? [] : computedFor(d.name)
    const nm = reads.length || computed.length ? [] : [...named.get(d.name), ...(d.short !== d.name ? named.get(d.short) : [])].sort(siteOrder)
    const pg = pageOfSandbox.get(d.name)
    const o: SandboxOptionData = {
      name: d.name,
      group: d.group,
      short: d.short,
      field: d.holder ? `${d.holder}.${d.field}` : d.field,
      type: d.type,
      default: def,
      javaDefault: d.javaDefault,
      ...(d.min !== undefined ? { min: d.min, max: d.max } : {}),
      ...(d.maxLength !== undefined ? { maxLength: d.maxLength } : {}),
      ...(choices ? { choices } : {}),
      ...(d.enumClass ? { enumConstants: enumConstants(enumSource(d.enumClass)) } : {}),
      label: shown(sbText(labelKey)),
      labelKey,
      tooltip: shown(sbText(`Sandbox_${d.translation ?? d.short}_tooltip`)),
      page: pg?.page ?? null,
      subgroup: pg?.subgroup ? shown(sbText(`Sandbox_Title_${pg.subgroup}`)) ?? pg.subgroup : null,
      hiddenUnlessDebug: debugOnlyUi.has(d.name),
      presets,
      declaredLine: d.line,
      reads,
      writes: scan.sandboxWrites.get(d.name),
      computed,
      named: nm,
      status: reads.length ? 'read' : computed.length ? 'computed' : nm.length ? 'named' : 'none',
    }
    return o
  })
  for (const p of sandboxPages) for (const s of p.settings) if (!sandboxOptions.some(o => o.name === s.name)) throw new Error(`sandbox page ${p.key} lists unknown option ${s.name}`)

  const capabilities: CapabilityData[] = capNames.map(c => ({
    name: c,
    tooltip: shown(IG[`IGUI_CapabilitiesTooltips_${c}`]),
    roles: roles.filter(r => r.capabilities.includes(c)).map(r => r.name),
    commands: commands.filter(k => k.capabilities.some(x => x.capability === c)).map(k => k.names[0]),
    reads: scan.capabilityReads.get(c),
  }))

  const unknownNames = (m: SiteMap) =>
    m
      .keys()
      .sort()
      .map(k => ({ name: k, sites: m.get(k) }))

  const count = <T>(xs: T[], f: (x: T) => boolean) => xs.filter(f).length
  const data = {
    $comment:
      'Generated by scripts/kb/extract/extract-server-surface.ts from a local engine capture. Names, types, defaults, ranges, the game\'s English text and read-site locations only. Do not edit by hand.',
    build,
    revision,
    steamBuild,
    jarSha256: jarSha,
    capture: path.basename(cap),
    captureSealed: sealed,
    sources: {
      serverOptions: `zombie.network.ServerOptions (ServerOptions.java, ${serverDecls.length} new ...ServerOption fields)`,
      serverOptionText: 'media/lua/shared/Translate/EN/UI.json: UI_ServerOption_<name>_tooltip, UI_ServerOption_AntiCheat_option<n>, UI_ServerSettingGroup_<page>',
      sandboxOptions: 'zombie.SandboxOptions (SandboxOptions.java, newBooleanOption/newDoubleOption/newEnumOption/newIntegerOption/newStringOption)',
      sandboxText: 'media/lua/shared/Translate/EN/Sandbox.json: Sandbox_<name>, Sandbox_<name>_tooltip, Sandbox_<name>_option<n>',
      sandboxDefault: `zombie.SandboxOptions constructor: loadGameFile("${defaultPreset}") then setDefaultsToCurrentValues()`,
      presets: 'media/lua/shared/Sandbox/<preset>.lua; the preset list from media/lua/client/OptionScreens/SandboxOptions.lua (SandboxOptionsScreen:loadPresets)',
      pages: `media/lua/${sssRel} (SettingsTable)`,
      commands: 'zombie.commands.CommandBase (childrenClasses) and the annotations of each class in zombie.commands.serverCommands; help text from UI.json',
      roles: 'zombie.characters.Roles#addStatic',
      capabilities: 'zombie.characters.Capability; text from media/lua/shared/Translate/EN/IG_UI.json IGUI_CapabilitiesTooltips_<name>',
    },
    readRules: READ_RULES,
    defaultPreset,
    counts: {
      serverOptions: serverOptions.length,
      serverOptionsByType: Object.fromEntries(['boolean', 'integer', 'double', 'enum', 'string', 'text'].map(t => [t, count(serverOptions, o => o.type === t)])),
      serverOptionsOnNoPage: count(serverOptions, o => !o.page),
      serverOptionsNotPublic: count(serverOptions, o => !o.public),
      serverOptionsRead: count(serverOptions, o => o.status === 'read'),
      serverOptionsNamedOnly: count(serverOptions, o => o.status === 'named'),
      serverOptionsReadNowhere: count(serverOptions, o => o.status === 'none'),
      serverReadSites: serverOptions.reduce((n, o) => n + o.reads.length, 0),
      serverWriteSites: serverOptions.reduce((n, o) => n + o.writes.length, 0),
      sandboxOptions: sandboxOptions.length,
      sandboxOptionsByType: Object.fromEntries(['boolean', 'integer', 'double', 'enum', 'string'].map(t => [t, count(sandboxOptions, o => o.type === t)])),
      sandboxOptionsOnNoPage: count(sandboxOptions, o => !o.page),
      sandboxOptionsRead: count(sandboxOptions, o => o.status === 'read'),
      sandboxOptionsComputedOnly: count(sandboxOptions, o => o.status === 'computed'),
      sandboxOptionsNamedOnly: count(sandboxOptions, o => o.status === 'named'),
      sandboxOptionsReadNowhere: count(sandboxOptions, o => o.status === 'none'),
      sandboxReadSites: sandboxOptions.reduce((n, o) => n + o.reads.length, 0),
      sandboxWriteSites: sandboxOptions.reduce((n, o) => n + o.writes.length, 0),
      sandboxDefaultDiffersFromJava: count(sandboxOptions, o => o.default !== o.javaDefault),
      presets: presetInfo.length,
      commandsRegistered: commands.length,
      commandsDisabled: count(commands, c => c.disabled),
      commandNames: commands.reduce((n, c) => n + c.names.length, 0),
      commandClassesNotRegistered: notListed.length,
      playerCommands: playerCommands.length,
      roles: roles.length,
      capabilities: capabilities.length,
      capabilitiesInNoBuiltInRoleButAdmin: count(capabilities, c => c.roles.length === 1 && c.roles[0] === 'admin'),
      capabilitiesReadNowhere: count(capabilities, c => c.reads.length === 0 && c.commands.length === 0),
    },
    publicExcluded,
    serverPages: serverPages.map(p => ({ key: p.key, title: p.title, steamOnly: p.steamOnly, customUi: p.customUi, options: p.settings.map(s => s.name) })),
    sandboxPages: sandboxPages.map(p => ({ key: p.key, title: p.title, options: p.settings.map(s => s.name) })),
    presets: presetInfo,
    argTypes,
    commandClassesNotRegistered: notListed,
    serverOptions,
    sandboxOptions,
    dynamicReads: [
      ...scan.sandboxComputed.map(c => ({ prefix: c.prefix, ...c.site })),
      ...scan.sandboxByVariable.map(x => ({ prefix: null, ...x })),
    ].sort((a, b) => siteOrder(a as Site, b as Site)),
    unknownServerNames: unknownNames(scan.unknownServerNames).map(x => ({ name: x.name, sites: x.sites.length, first: x.sites[0] })),
    unknownSandboxNames: unknownNames(scan.unknownSandboxNames).map(x => ({ name: x.name, sites: x.sites.length, first: x.sites[0] })),
    commands,
    playerCommands,
    roles,
    capabilities,
  }
  const out = args.out ?? path.join(REPO_ROOT, 'scripts', 'kb', 'data', `server-surface-${build}.json`)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, serialize(data))
  console.log(`[OK] wrote ${posix(path.relative(REPO_ROOT, out))} (${fs.statSync(out).size} bytes)`)
  console.log(JSON.stringify(data.counts, null, 1))
}

function closingBrace(text: string, open: number): number {
  let depth = 0
  for (let k = open; k < text.length; k++) {
    const c = text[k]
    if (c === '"' || c === "'") {
      k++
      while (k < text.length && text[k] !== c && text[k] !== '\n') k += text[k] === '\\' ? 2 : 1
    } else if (c === '{') depth++
    else if (c === '}' && --depth === 0) return k
  }
  return -1
}

if (require.main === module) main()
