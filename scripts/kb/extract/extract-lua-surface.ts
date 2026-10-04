#!/usr/bin/env tsx
/**
 * Extract the Lua-facing surface of a Project Zomboid build into one JSON data file:
 * events (with every call site that fires them and its side), global functions, and the
 * exposed classes with the methods Lua can call.
 *
 * NEEDS A LOCAL ENGINE CAPTURE. This script runs on a machine that holds a capture made by
 * the engine-records toolchain (a folder with `MANIFEST.yaml`, `src/` decompiled Java, and
 * `game_snapshot/` holding the game jar and `media/lua`). It reads the capture and never
 * writes to it. It never copies engine source into the repo: the JSON it writes holds names,
 * types, counts and call-site locations (class and method, or Lua file and function, with a
 * line number), and short summaries of multiplayer guards. No method body, no statement.
 *
 * How each part is read:
 *  - Exposed classes: `setExposed(X.class)` in `LuaManager.Exposer.exposeAll()` and in the
 *    static `setExposed(Exposer)` helpers it calls; `if (Core.debug)` blocks mark debug-only.
 *    The class names are resolved through the imports and then handed to LuaSurfaceReflect
 *    (Java), which asks the JVM `getMethods()`, `getFields()`, `getConstructors()` exactly as
 *    Kahlua's exposer does, minus `@HiddenFromLua`. Parameter names are added from the
 *    decompiled source where one declaration matches by name and parameter types.
 *  - Global functions: `@LuaMethod(global = true)` on `LuaManager$GlobalObject`, by reflection.
 *  - Events: `AddEvent("...")` in `LuaEventManager.AddEvents()`. Call sites: every
 *    `LuaEventManager.triggerEvent*("Name", ...)` in Java and every `triggerEvent("Name", ...)`
 *    in vanilla Lua. Side per call site: from `GameServer.server` / `GameClient.client`
 *    (`isServer()` / `isClient()` in Lua) guards around the call, else from the class or the
 *    Lua folder, else "unknown". See SIDE_RULES below.
 *
 * Usage (from the repo root):
 *   npx tsx scripts/kb/extract/extract-lua-surface.ts --capture <capture dir> --java <java 25+>
 *       [--javac <javac 17+>] [--delta <delta dir> --previous-build <label>] [--out <json>]
 *
 *   --capture  the capture folder (for 42.21: the B42_4a0e9546ec capture)
 *   --java     a Java runtime able to load the game's classes (the game ships one in jre64/)
 *   --javac    a JDK compiler for the small helper (default: javac on PATH)
 *   --delta    the engine-records delta folder whose 01_lua_globals_events.tsv lists what
 *              changed since the previous build (optional); its name ends in
 *              <old revision>_to_<new revision>
 *   --previous-build  the build label of the older capture (required with --delta)
 *   --out      default scripts/kb/data/lua-surface-<build>.json
 */

import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import {
  Flags,
  Side,
  enclosing,
  eraseSimple,
  javaBlocks,
  javaGuards,
  javaMethodDecls,
  JavaMethodDecl,
  lineIndex,
  luaBlocks,
  luaFunctionAt,
  luaGuards,
  parseParams,
  sideFromFlags,
  splitArgs,
  stripJava,
  stripLua,
} from './java-scan'

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..')

/** Written into the data file so the generator can print the rules it was judged by. */
export const SIDE_RULES = [
  'A guard around the call decides first: GameServer.server (Lua: isServer()) true means the multiplayer server only; GameClient.client (Lua: isClient()) true means a multiplayer client only; GameServer.server false means wherever a player is (single player and multiplayer clients); GameClient.client false means the multiplayer server and single player; both false means single player only. Guards read: enclosing if / else-if / else conditions, a brace-less if on the call, and an earlier `if (...) return` in an enclosing block.',
  'With no guard, the class decides: zombie.network.GameServer, zombie.network.server and ServerGUI, and a packet method processServer, mean the multiplayer server; zombie.network.GameClient and a packet method processClient mean a multiplayer client (a packet rule is used only when nothing else in that class calls the method); zombie.spnetwork (the in-process stand-in for the network in single player) means single player only. zombie.ui and zombie.input mean client: that one is inferred from the package, not read from a call path.',
  'With no guard, the Lua folder decides: media/lua/client is never run by the dedicated server (GameServer loads it for its checksum only), so client; media/lua/shared and media/lua/server run on both, so a call there with no guard is unknown.',
  'Everything else is unknown: a call in shared code with no guard can run on either side, and we do not guess which.',
]

interface Args {
  capture: string
  java: string
  javac: string
  delta?: string
  previousBuild?: string
  out?: string
}

function parseArgs(argv: string[]): Args {
  const get = (k: string) => {
    const i = argv.indexOf(k)
    return i >= 0 ? argv[i + 1] : undefined
  }
  const capture = get('--capture')
  const java = get('--java')
  if (!capture || !java) {
    console.error('usage: extract-lua-surface.ts --capture <dir> --java <java 25+> [--javac <javac>] [--delta <dir>] [--out <json>]')
    process.exit(2)
  }
  const delta = get('--delta')
  const previousBuild = get('--previous-build')
  if (delta && !previousBuild) {
    console.error('--delta needs --previous-build <build label of the older capture>')
    process.exit(2)
  }
  return { capture, java, javac: get('--javac') ?? 'javac', delta, previousBuild, out: get('--out') }
}

function manifestValue(manifest: string, key: string): string {
  const m = new RegExp(`^${key}:\\s*"?([^"#\\n]+?)"?\\s*(?:#.*)?$`, 'm').exec(manifest)
  if (!m) throw new Error(`MANIFEST.yaml has no ${key}`)
  return m[1].trim()
}

function sha256File(p: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
}

function walk(dir: string, ext: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
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
// Exposed class list from the source
// ---------------------------------------------------------------------------------------

function methodBody(stripped: string, headerRe: RegExp): { start: number; end: number } {
  const m = headerRe.exec(stripped)
  if (!m) throw new Error(`header not found: ${headerRe}`)
  const open = stripped.indexOf('{', m.index + m[0].length - 1)
  let depth = 0
  for (let k = open; k < stripped.length; k++) {
    if (stripped[k] === '{') depth++
    else if (stripped[k] === '}' && --depth === 0) return { start: open, end: k }
  }
  throw new Error('unbalanced body')
}

function importsOf(text: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const m of text.matchAll(/^import\s+([\w.]+)\.(\w+);/gm)) map.set(m[2], `${m[1]}.${m[2]}`)
  return map
}

function packageOf(text: string): string {
  return /^package\s+([\w.]+);/m.exec(text)?.[1] ?? ''
}

interface ExposedToken {
  token: string
  binaryName: string
  debugOnly: boolean
  via: string
}

function exposedTokens(src: string): { tokens: ExposedToken[]; exposeAllLine: number } {
  const lmPath = path.join(src, 'zombie', 'Lua', 'LuaManager.java')
  const lm = fs.readFileSync(lmPath, 'utf-8')
  const lmS = stripJava(lm)
  const body = methodBody(lmS, /public void exposeAll\(\)\s*\{/)
  const exposeAllLine = lineIndex(lmS)(body.start)
  const tokens: ExposedToken[] = []
  const resolve = (tok: string, text: string, filePath: string): string => {
    const imports = importsOf(text)
    const [head, ...rest] = tok.split('.')
    const nested = rest.length ? '$' + rest.join('$') : ''
    if (imports.has(head)) return imports.get(head)! + nested
    if (/^(zombie|java|se|org)\./.test(tok)) return tok
    const pkg = packageOf(text)
    if (fs.existsSync(path.join(path.dirname(filePath), `${head}.java`))) return `${pkg}.${head}${nested}`
    return `java.lang.${head}${nested}`
  }
  const scan = (stripped: string, text: string, filePath: string, from: number, to: number, via: string) => {
    const seg = stripped.slice(from, to)
    // debug-only: setExposed inside an `if (Core.debug) { ... }` block of this body
    const debugRanges: [number, number][] = []
    for (const m of seg.matchAll(/if\s*\(\s*Core\.debug\s*\)\s*\{/g)) {
      const open = m.index! + m[0].length - 1
      let depth = 0
      for (let k = open; k < seg.length; k++) {
        if (seg[k] === '{') depth++
        else if (seg[k] === '}' && --depth === 0) {
          debugRanges.push([open, k])
          break
        }
      }
    }
    for (const m of seg.matchAll(/setExposed\(\s*([\w.]+)\.class\s*\)/g)) {
      const at = m.index!
      tokens.push({
        token: m[1],
        binaryName: resolve(m[1], text, filePath),
        debugOnly: debugRanges.some(([a, b]) => at > a && at < b),
        via,
      })
    }
  }
  scan(lmS, lm, lmPath, body.start, body.end, 'LuaManager.Exposer#exposeAll')
  const helpers = [...lmS.slice(body.start, body.end).matchAll(/\b(\w+)\.setExposed\(this\)/g)].map(m => m[1])
  const lmImports = importsOf(lm)
  for (const h of helpers) {
    const fq = lmImports.get(h)
    if (!fq) throw new Error(`helper ${h} not imported by LuaManager`)
    const p = path.join(src, ...fq.split('.')) + '.java'
    const t = fs.readFileSync(p, 'utf-8')
    const s = stripJava(t)
    const b = methodBody(s, /static void setExposed\([\w.]+ \w+\)\s*\{/)
    scan(s, t, p, b.start, b.end, `${h}#setExposed`)
  }
  return { tokens, exposeAllLine }
}

// ---------------------------------------------------------------------------------------
// Source declarations, for parameter names
// ---------------------------------------------------------------------------------------

const declCache = new Map<string, JavaMethodDecl[] | null>()

function declsFor(src: string, binaryName: string): JavaMethodDecl[] | null {
  const outer = binaryName.split('$')[0]
  if (declCache.has(outer)) return declCache.get(outer)!
  const p = path.join(src, ...outer.split('.')) + '.java'
  let decls: JavaMethodDecl[] | null = null
  if (fs.existsSync(p)) {
    const s = stripJava(fs.readFileSync(p, 'utf-8'))
    decls = javaMethodDecls(s, javaBlocks(s))
  }
  declCache.set(outer, decls)
  return decls
}

/** Parameter names for a reflected method, when exactly one source declaration matches. */
function paramNames(src: string, declaredBy: string, name: string, types: string[]): string[] | null {
  const decls = declsFor(src, declaredBy)
  if (!decls) return null
  const want = types.map(eraseSimple)
  const hits = decls.filter(d => {
    if (d.name !== name || d.params.length !== types.length) return false
    return d.params.every((p, i) => {
      const got = eraseSimple(p.type)
      // a type variable (T, E, K...) erases to its bound; accept it against anything
      return got === want[i] || /^[A-Z]\d?(\[\])*$/.test(got)
    })
  })
  const uniq = new Map(hits.map(h => [h.params.map(p => p.name).join(','), h]))
  if (uniq.size !== 1) return null
  return [...uniq.values()][0].params.map(p => p.name)
}

// ---------------------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------------------

interface EventArg {
  type: string | null
  name?: string
}

interface EventSite {
  lang: 'java' | 'lua'
  /** java: binary class name; lua: path under media/lua */
  where: string
  /** java: method name; lua: function name */
  in: string
  line: number
  side: Side
  singlePlayer: boolean | null
  /** guard summaries, or the class/folder rule that decided */
  basis: string[]
  args: EventArg[]
}

const SERVER_CLASS = /^zombie\.network\.(GameServer(\$|$)|server\.|ServerGUI(\$|$))/
const CLIENT_CLASS = /^zombie\.(ui|input)\./

/**
 * Side from the class alone, when no guard decides. `fileText` is the stripped source of the
 * class's file: a packet's processClient counts as client only when nothing else in the file
 * calls processClient except processClientLoading (EatFoodPacket.processServer, for one, calls
 * its own processClient), and the same for processServer.
 */
function classSide(binaryName: string, method: string, fileText: string): { side: Side; singlePlayer: boolean; basis: string } | null {
  if (/^zombie\.spnetwork\./.test(binaryName)) return { side: 'single-player', singlePlayer: true, basis: 'class: single-player network stand-in (zombie.spnetwork)' }
  const selfCalled = (m: string) => {
    const blocks = javaBlocks(fileText)
    for (const c of fileText.matchAll(new RegExp(`\\b${m}\\s*\\(`, 'g'))) {
      const enc = enclosing(blocks, c.index!)
      const inM = [...enc].reverse().find(k => blocks[k].kind === 'method')
      if (inM === undefined) continue
      const name = blocks[inM].name
      if (blocks[inM].open > c.index!) continue
      // the declaration itself sits before its own block; calls are inside a method
      if (name !== m && name !== 'processClientLoading') return true
    }
    return false
  }
  if (method === 'processServer' && !selfCalled('processServer')) return { side: 'server', singlePlayer: false, basis: 'class: packet method processServer' }
  if (method === 'processClient' && !selfCalled('processClient')) return { side: 'client', singlePlayer: false, basis: 'class: packet method processClient' }
  if (SERVER_CLASS.test(binaryName)) return { side: 'server', singlePlayer: false, basis: 'class: server-side network class' }
  if (/^zombie\.network\.GameClient(\$|$)/.test(binaryName)) return { side: 'client', singlePlayer: false, basis: 'class: multiplayer client (GameClient)' }
  if (CLIENT_CLASS.test(binaryName)) return { side: 'client', singlePlayer: true, basis: 'class: UI or input package (inferred, see the rules)' }
  return null
}

/** The Java type of a simple argument expression, read from declarations in scope. */
function javaArgType(
  expr: string,
  ctx: { stripped: string; methodOpen: number; pos: number; params: { type: string; name: string }[]; className: string },
): EventArg {
  const e = expr.replace(/\s+/g, ' ').trim()
  if (/^".*"$/.test(e) || /^"\s*"$/.test(e)) return { type: 'String' }
  if (/^(true|false)$/.test(e)) return { type: 'boolean' }
  if (e === 'null') return { type: 'null' }
  if (/^-?\d+[lL]$/.test(e)) return { type: 'long' }
  if (/^-?\d+$/.test(e)) return { type: 'int' }
  if (/^-?[\d.]+([eE]-?\d+)?[fF]$/.test(e)) return { type: 'float' }
  if (/^-?[\d.]+([eE]-?\d+)?[dD]?$/.test(e)) return { type: 'double' }
  if (e === 'this') return { type: ctx.className }
  const cast = /^\(\s*([\w.<>\[\]]+)\s*\)\s*[\w.]+$/.exec(e)
  if (cast) return { type: cast[1] }
  const ctor = /^new\s+([\w.]+)\s*(<[^>]*>)?\s*\(/.exec(e)
  if (ctor) return { type: ctor[1] }
  const box = /^(Integer|Double|Float|Boolean|Long|Short|Byte)\.valueOf\(/.exec(e)
  if (box) return { type: box[1] }
  const bsv = /^BoxedStaticValues\.toDouble\(/.exec(e)
  if (bsv) return { type: 'Double' }
  const field = /^this\.(\w+)$/.exec(e)
  const ident = /^(\w+)$/.exec(e)
  const name = field ? field[1] : ident ? ident[1] : null
  if (!name) return { type: null }
  const out: EventArg = { type: null, name: field ? `this.${name}` : name }
  if (ident) {
    const p = ctx.params.find(q => q.name === name)
    if (p) return { ...out, type: p.type }
    // nearest local declaration before the call in the same method
    const body = ctx.stripped.slice(ctx.methodOpen, ctx.pos)
    const re = new RegExp(`(?:^|[;{}(]|\\s)([A-Z][\\w.]*(?:<[^;{}()=]*?>)?(?:\\[\\])*|int|long|float|double|boolean|short|byte|char|var)\\s+${name}\\s*(?:=|;|:|\\))`, 'g')
    let last: string | null = null
    for (const m of body.matchAll(re)) last = m[1]
    if (last && last !== 'var') return { ...out, type: last }
    // instanceof pattern binding: `x instanceof Type name`
    const inst = new RegExp(`instanceof\\s+([\\w.]+)\\s+${name}\\b`).exec(body)
    if (inst) return { ...out, type: inst[1] }
  }
  // a field of the file: `Type name;` or `Type name =` at any class level
  const fre = new RegExp(`(?:public|protected|private|static|final|\\s)+\\s([A-Z][\\w.]*(?:<[^;{}()=]*?>)?(?:\\[\\])*|int|long|float|double|boolean|short|byte|char)\\s+${name}\\s*(?:=|;)`)
  const fm = fre.exec(ctx.stripped)
  if (fm) return { ...out, type: fm[1] }
  return out
}

function javaEventSites(src: string, known: Set<string>): { sites: Map<string, EventSite[]>; dynamic: { where: string; in: string; line: number }[] } {
  const sites = new Map<string, EventSite[]>()
  const dynamic: { where: string; in: string; line: number }[] = []
  for (const file of walk(src, '.java')) {
    const text = fs.readFileSync(file, 'utf-8')
    if (!text.includes('triggerEvent')) continue
    const rel = posix(path.relative(src, file))
    const isLEM = rel === 'zombie/Lua/LuaEventManager.java'
    const stripped = stripJava(text)
    const blocks = javaBlocks(stripped)
    const line = lineIndex(stripped)
    const re = isLEM ? /\btriggerEvent(?:Garbage|Unique)?\s*\(/g : /\bLuaEventManager\s*\.\s*triggerEvent(?:Garbage|Unique)?\s*\(/g
    for (const m of stripped.matchAll(re)) {
      const at = m.index!
      if (isLEM && /\bvoid\s+$/.test(stripped.slice(Math.max(0, at - 20), at))) continue
      const open = at + m[0].length - 1
      let depth = 0
      let close = -1
      for (let k = open; k < stripped.length; k++) {
        if (stripped[k] === '(') depth++
        else if (stripped[k] === ')' && --depth === 0) {
          close = k
          break
        }
      }
      const argsStripped = splitArgs(stripped.slice(open + 1, close))
      // the event name comes from the original text at the same offsets
      const firstOrig = text.slice(open + 1, close).trim()
      const lit = /^"([^"\\]*)"/.exec(firstOrig)
      const enc = enclosing(blocks, at)
      const methodIdx = [...enc].reverse().find(k => blocks[k].kind === 'method')
      const types = enc.filter(k => blocks[k].kind === 'type').map(k => blocks[k].name)
      const pkg = packageOf(text)
      const binary = `${pkg}.${types.filter(t => !t.startsWith('anonymous')).join('$')}`
      const method = methodIdx === undefined ? '<field initializer>' : blocks[methodIdx].name
      if (!lit) {
        if (!isLEM) dynamic.push({ where: binary, in: method, line: line(at) })
        continue
      }
      const name = lit[1]
      const g = javaGuards(stripped, blocks, at)
      let decided = sideFromFlags(g.flags)
      let basis = g.guards.map(x => `guard: ${x}`)
      if (!decided) {
        const cs = classSide(binary, method, stripped)
        if (cs) {
          decided = { side: cs.side, singlePlayer: cs.singlePlayer }
          basis = [cs.basis]
        }
      }
      const params = methodIdx === undefined ? [] : parseParams(blocks[methodIdx].params ?? '')
      const ctx = {
        stripped,
        methodOpen: methodIdx === undefined ? 0 : blocks[methodIdx].open,
        pos: at,
        params,
        className: types.filter(t => !t.startsWith('anonymous')).pop() ?? '',
      }
      const args = argsStripped.slice(1).map(a => javaArgType(a, ctx))
      const site: EventSite = {
        lang: 'java',
        where: binary,
        in: method,
        line: line(at),
        side: decided ? decided.side : 'unknown',
        singlePlayer: decided ? decided.singlePlayer : null,
        basis,
        args,
      }
      if (!sites.has(name)) sites.set(name, [])
      sites.get(name)!.push(site)
      void known
    }
  }
  return { sites, dynamic }
}

function luaEventSites(luaRoot: string): { sites: Map<string, EventSite[]>; luaAdded: { name: string; where: string; line: number }[] } {
  const sites = new Map<string, EventSite[]>()
  const luaAdded: { name: string; where: string; line: number }[] = []
  for (const file of walk(luaRoot, '.lua')) {
    const text = fs.readFileSync(file, 'utf-8')
    if (!text.includes('triggerEvent') && !text.includes('AddEvent')) continue
    const rel = posix(path.relative(luaRoot, file))
    const folder = rel.split('/')[0]
    const stripped = stripLua(text)
    const line = lineIndex(stripped)
    for (const m of stripped.matchAll(/LuaEventManager\s*\.\s*AddEvent\s*\(\s*"/g)) {
      const q = m.index! + m[0].length - 1
      const nm = /^"([^"]*)"/.exec(text.slice(q))
      if (nm) luaAdded.push({ name: nm[1], where: rel, line: line(m.index!) })
    }
    const blocks = luaBlocks(stripped)
    for (const m of stripped.matchAll(/(^|[^\w.:]|LuaEventManager\s*\.\s*)triggerEvent\s*\(/g)) {
      const at = m.index! + m[1].length
      const open = m.index! + m[0].length - 1
      let depth = 0
      let close = -1
      for (let k = open; k < stripped.length; k++) {
        if (stripped[k] === '(') depth++
        else if (stripped[k] === ')' && --depth === 0) {
          close = k
          break
        }
      }
      if (close < 0) continue
      const lit = /^\s*"([^"\\]*)"/.exec(text.slice(open + 1, close))
      if (!lit) continue
      const argsS = splitArgs(stripped.slice(open + 1, close)).slice(1)
      const g = luaGuards(stripped, blocks, at)
      let decided = sideFromFlags(g.flags)
      let basis = g.guards.map(x => `guard: ${x}`)
      if (!decided && folder === 'client') {
        decided = { side: 'client', singlePlayer: true }
        basis = ['folder: media/lua/client, which the dedicated server loads for its checksum only']
      }
      const args: EventArg[] = argsS.map(a => {
        const e = a.trim()
        if (/^".*"$/.test(e) || /^'.*'$/.test(e)) return { type: 'string' }
        if (/^-?[\d.]+$/.test(e)) return { type: 'number' }
        if (/^(true|false)$/.test(e)) return { type: 'boolean' }
        if (e === 'nil') return { type: 'nil' }
        if (/^[\w.]+$/.test(e)) return { type: null, name: e }
        return { type: null }
      })
      const site: EventSite = {
        lang: 'lua',
        where: rel,
        in: luaFunctionAt(blocks, at),
        line: line(at),
        side: decided ? decided.side : 'unknown',
        singlePlayer: decided ? decided.singlePlayer : null,
        basis,
        args,
      }
      if (!sites.has(lit[1])) sites.set(lit[1], [])
      sites.get(lit[1])!.push(site)
    }
  }
  return { sites, luaAdded }
}

/** One side for an event from its call sites. */
function eventSide(sites: EventSite[]): { side: Side | 'not fired'; partial: boolean } {
  if (sites.length === 0) return { side: 'not fired', partial: false }
  const known = sites.filter(s => s.side !== 'unknown')
  if (known.length === 0) return { side: 'unknown', partial: false }
  const set = new Set(known.map(s => s.side))
  let side: Side
  if (set.size === 1) side = known[0].side
  else if (set.has('both') || (set.has('client') && set.has('server'))) side = 'both'
  else if (set.has('client')) side = 'client'
  else if (set.has('server')) side = 'server'
  else side = 'both'
  return { side, partial: known.length < sites.length }
}

/**
 * JSON with one record per line where records repeat (methods, sites, overloads, fields), so a
 * regenerated file diffs line by line against the previous build and stays small.
 */
export function serialize(data: unknown): string {
  const ROW_KEYS = new Set(['methods', 'sites', 'overloads', 'staticFields', 'constructors', 'dynamicTriggerSites', 'addedByLua'])
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

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const cap = path.resolve(args.capture)
  const src = path.join(cap, 'src')
  const snap = path.join(cap, 'game_snapshot')
  const jar = path.join(snap, 'projectzomboid.jar')
  const manifest = fs.readFileSync(path.join(cap, 'MANIFEST.yaml'), 'utf-8')
  const build = manifestValue(manifest, 'build_label')
  const revision = manifestValue(manifest, 'git_revision')
  const steamBuild = manifestValue(manifest, 'steam_buildid')
  const jarSha = manifestValue(manifest, 'source_sha256')
  const sealed = manifestValue(manifest, 'sealed')
  const gotSha = sha256File(jar)
  if (gotSha !== jarSha) {
    console.error(`[ERROR] jar sha256 ${gotSha} does not match the capture manifest ${jarSha}`)
    process.exit(1)
  }
  console.log(`[OK] capture ${path.basename(cap)}: build ${build}, revision ${revision}, jar sha256 matches the manifest`)

  // exposed classes ---------------------------------------------------------------------
  const { tokens, exposeAllLine } = exposedTokens(src)
  const distinct = new Map<string, ExposedToken>()
  for (const t of tokens) {
    const prev = distinct.get(t.binaryName)
    if (!prev) distinct.set(t.binaryName, { ...t })
    else if (!t.debugOnly) prev.debugOnly = false
  }
  console.log(`[OK] setExposed calls: ${tokens.length}, distinct classes: ${distinct.size}`)

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-lua-surface-'))
  try {
    const javaSrc = path.join(__dirname, 'LuaSurfaceReflect.java')
    const cls = path.join(work, 'cls')
    fs.mkdirSync(cls)
    const jc = spawnSync(args.javac, ['--release', '17', '-d', cls, javaSrc], { encoding: 'utf-8' })
    if (jc.status !== 0) throw new Error(`javac failed: ${jc.stderr}`)
    const list = path.join(work, 'classes.txt')
    fs.writeFileSync(list, [...distinct.keys()].join('\n') + '\n')
    const outJson = path.join(work, 'reflect.json')
    const jr = spawnSync(args.java, ['-cp', cls, 'LuaSurfaceReflect', jar, list, outJson], { encoding: 'utf-8', maxBuffer: 1 << 26 })
    if (jr.status !== 0) throw new Error(`reflection helper failed: ${jr.stderr}`)
    const reflected = JSON.parse(fs.readFileSync(outJson, 'utf-8')) as {
      classes: {
        binaryName: string
        error?: string
        kind: string
        disallowed: boolean
        staticsExposed: boolean
        superclass: string | null
        interfaces: string[]
        superChain: string[]
        methods: { name: string; static: boolean; params: string[]; returns: string; declaredBy: string }[]
        hiddenMethods: number
        bridgeMethods: number
        staticFields: { name: string; type: string; enumConstant: boolean }[]
        constructors: { params: string[] }[]
      }[]
      globals: { name: string; javaName: string; static: boolean; params: string[]; returns: string }[]
    }
    const errors = reflected.classes.filter(c => c.error)
    if (errors.length) {
      for (const e of errors) console.error(`[ERROR] ${e.binaryName}: ${e.error}`)
      process.exit(1)
    }
    const exposedSet = new Set(reflected.classes.filter(c => !c.disallowed).map(c => c.binaryName))

    let namedParams = 0
    let totalParams = 0
    const withNames = (declaredBy: string, name: string, types: string[]) => {
      const names = types.length ? paramNames(src, declaredBy, name, types) : []
      totalParams += types.length
      if (names) namedParams += types.length
      // [type] or [type, name]: parameter name only where one source declaration matched
      return types.map((t, i) => (names ? [t, names[i]] : [t]))
    }

    const classes = reflected.classes
      .slice()
      .sort((a, b) => a.binaryName.localeCompare(b.binaryName))
      .map(c => {
        const tok = distinct.get(c.binaryName)!
        const own = c.methods.filter(m => m.declaredBy !== 'java.lang.Object' && (m.declaredBy === c.binaryName || !exposedSet.has(m.declaredBy)))
        const inherited: Record<string, number> = {}
        let objectMethods = 0
        for (const m of c.methods) {
          if (m.declaredBy === 'java.lang.Object') objectMethods++
          else if (m.declaredBy !== c.binaryName && exposedSet.has(m.declaredBy)) inherited[m.declaredBy] = (inherited[m.declaredBy] ?? 0) + 1
        }
        return {
          name: c.binaryName,
          kind: c.kind,
          debugOnly: tok.debugOnly,
          disallowed: c.disallowed,
          exposedBy: tok.via,
          superclass: c.superclass,
          interfaces: c.interfaces,
          exposedAncestors: [...c.superChain, ...c.interfaces].filter(a => exposedSet.has(a)),
          methodCount: c.methods.length,
          objectMethods,
          hiddenMethods: c.hiddenMethods,
          bridgeMethodsSkipped: c.bridgeMethods,
          inheritedFromExposed: Object.fromEntries(Object.entries(inherited).sort(([a], [b]) => a.localeCompare(b))),
          methods: own.map(m => ({
            name: m.name,
            ...(m.static ? { static: true } : {}),
            params: withNames(m.declaredBy, m.name, m.params),
            returns: m.returns,
            ...(m.declaredBy !== c.binaryName ? { from: m.declaredBy } : {}),
          })),
          staticFields: c.staticFields,
          constructors: c.constructors.map(k => ({ params: withNames(c.binaryName, c.binaryName.split(/[.$]/).pop()!, k.params) })),
        }
      })

    // global functions ---------------------------------------------------------------------
    const byName = new Map<string, { params: string[][]; returns: string; javaName: string }[]>()
    for (const g of reflected.globals) {
      if (!byName.has(g.name)) byName.set(g.name, [])
      byName.get(g.name)!.push({ params: withNames('zombie.Lua.LuaManager$GlobalObject', g.javaName, g.params), returns: g.returns, javaName: g.javaName })
    }
    const globals = [...byName.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, overloads]) => ({ name, overloads }))

    // events -------------------------------------------------------------------------------
    const lemPath = path.join(src, 'zombie', 'Lua', 'LuaEventManager.java')
    const lem = stripJava(fs.readFileSync(lemPath, 'utf-8'))
    const lemOrig = fs.readFileSync(lemPath, 'utf-8')
    const addEvents = methodBody(lem, /private static void AddEvents\(\)\s*\{/)
    const registered = [...lemOrig.slice(addEvents.start, addEvents.end).matchAll(/AddEvent\("([^"]+)"\)/g)].map(m => m[1])
    const regSet = new Set(registered)
    const hookPath = path.join(src, 'zombie', 'Lua', 'LuaHookManager.java')
    const hookOrig = fs.readFileSync(hookPath, 'utf-8')
    const hookBody = methodBody(stripJava(hookOrig), /private static void AddEvents\(\)\s*\{/)
    const hooks = [...hookOrig.slice(hookBody.start, hookBody.end).matchAll(/AddEvent\("([^"]+)"\)/g)].map(m => m[1])

    const j = javaEventSites(src, regSet)
    const l = luaEventSites(path.join(snap, 'media', 'lua'))
    const allNames = new Set<string>([...registered, ...j.sites.keys(), ...l.sites.keys()])
    const sortSites = (a: EventSite, b: EventSite) =>
      a.lang.localeCompare(b.lang) || a.where.localeCompare(b.where) || a.line - b.line
    const events = [...allNames]
      .sort((a, b) => a.localeCompare(b))
      .map(name => {
        const sites = [...(j.sites.get(name) ?? []), ...(l.sites.get(name) ?? [])].sort(sortSites)
        const s = eventSide(sites)
        const luaAddedAt = l.luaAdded.filter(x => x.name === name).map(x => ({ where: x.where, line: x.line }))
        return {
          name,
          registered: regSet.has(name),
          ...(luaAddedAt.length ? { addedByLua: luaAddedAt } : {}),
          side: s.side,
          partial: s.partial,
          sites,
        }
      })

    // changes since the previous build ---------------------------------------------------------
    let changes: Record<string, { added: string[]; removed: string[] }> | undefined
    let previousBuild: { build: string; revision: string } | undefined
    if (args.delta) {
      const m = /_([0-9a-f]+)_to_([0-9a-f]+)$/.exec(path.basename(path.resolve(args.delta)))
      if (!m || m[2] !== revision) throw new Error(`delta folder ${args.delta} does not end in <old>_to_${revision}`)
      previousBuild = { build: args.previousBuild!, revision: m[1] }
      const tsv = fs.readFileSync(path.join(args.delta, '01_lua_globals_events.tsv'), 'utf-8').trim().split(/\r?\n/).slice(1)
      changes = { 'global function': { added: [], removed: [] }, event: { added: [], removed: [] }, 'exposed class': { added: [], removed: [] } }
      for (const row of tsv) {
        const [kind, change, name] = row.split('\t')
        const bucket = changes[kind]
        if (!bucket) throw new Error(`unknown delta kind ${kind}`)
        ;(change === 'added' ? bucket.added : bucket.removed).push(name)
      }
    }

    const normal = classes.filter(c => !c.debugOnly && !c.disallowed)
    const data = {
      $comment:
        'Generated by scripts/kb/extract/extract-lua-surface.ts from a local engine capture. Names, types, counts and call-site locations only. Do not edit by hand.',
      build,
      revision,
      steamBuild,
      jarSha256: jarSha,
      capture: path.basename(cap),
      captureSealed: sealed,
      sources: {
        exposedClasses: `zombie.Lua.LuaManager$Exposer#exposeAll (LuaManager.java:${exposeAllLine}) and the setExposed helpers it calls`,
        exposer: 'se.krka.kahlua.integration.expose.LuaJavaClassExposer (game jar): getMethods() minus @HiddenFromLua; exposeStatics for static methods, public static fields and constructors',
        globals: 'zombie.Lua.LuaManager$GlobalObject, @LuaMethod(global = true)',
        events: 'zombie.Lua.LuaEventManager#AddEvents; call sites LuaEventManager.triggerEvent* (Java) and triggerEvent (vanilla Lua)',
        hooks: 'zombie.Lua.LuaHookManager#AddEvents',
      },
      sideRules: SIDE_RULES,
      counts: {
        setExposedCalls: tokens.length,
        exposedClasses: classes.length,
        exposedClassesNormal: normal.length,
        exposedClassesDebugOnly: classes.filter(c => c.debugOnly).length,
        exposedClassesDisallowed: classes.filter(c => c.disallowed).length,
        exposedMethodsListed: classes.reduce((n, c) => n + c.methods.length, 0),
        exposedMethodsReachable: classes.reduce((n, c) => n + c.methodCount, 0),
        globalFunctions: globals.length,
        globalFunctionOverloads: reflected.globals.length,
        eventsRegistered: registered.length,
        eventsRegisteredDistinct: regSet.size,
        eventsFiredButNotRegistered: events.filter(e => !e.registered).length,
        eventsNeverFired: events.filter(e => e.registered && e.sites.length === 0).length,
        eventSitesJava: [...j.sites.values()].reduce((n, s) => n + s.length, 0),
        eventSitesLua: [...l.sites.values()].reduce((n, s) => n + s.length, 0),
        eventSitesUnknownSide: events.reduce((n, e) => n + e.sites.filter(s => s.side === 'unknown').length, 0),
        eventsSideUnknown: events.filter(e => e.side === 'unknown').length,
        eventsSidePartial: events.filter(e => e.partial).length,
        dynamicTriggerSites: j.dynamic.length,
        hooks: hooks.length,
        parametersNamed: namedParams,
        parametersTotal: totalParams,
      },
      ...(changes ? { changesSincePreviousBuild: changes, previousBuild } : {}),
      hooks,
      dynamicTriggerSites: j.dynamic.sort((a, b) => a.where.localeCompare(b.where) || a.line - b.line),
      events,
      globals,
      classes,
    }
    const out = args.out ?? path.join(REPO_ROOT, 'scripts', 'kb', 'data', `lua-surface-${build}.json`)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, serialize(data))
    console.log(`[OK] wrote ${posix(path.relative(REPO_ROOT, out))} (${fs.statSync(out).size} bytes)`)
    console.log(JSON.stringify(data.counts, null, 1))
  } finally {
    fs.rmSync(work, { recursive: true, force: true })
  }
}

main()
