#!/usr/bin/env tsx
/**
 * Fixture test for the Lua reference generator (scripts/kb/gen-lua-reference.ts).
 *
 * On the invented fixture (surface.json, notes.json in this folder):
 *  - the generator's output equals the golden files in expected/ (stable output);
 *  - the fixture still has the shape the expectations below were written for;
 *  - every event, global function and class appears exactly where it should;
 *  - the numbers the index publishes match counts this test makes itself from the data;
 *  - two command-line runs into two temporary folders write byte-identical files, and
 *    --check passes on that output and fails once one file is changed;
 *  - a note naming an event that does not exist is refused.
 * On the real data (scripts/kb/data/lua-surface-42.21.json):
 *  - the published counts equal the KB04 engine-diff counts, or the difference is the one
 *    explained in the index;
 *  - the committed articles are exactly what the data and notes give (--check).
 *
 * Usage:
 *   npx tsx scripts/kb/fixtures/lua-reference/run.ts            (npm run kb:gen-ref:test)
 *   npx tsx scripts/kb/fixtures/lua-reference/run.ts --update   rewrite expected/ from the fixture
 */

import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { generate, Notes, SurfaceData } from '../../gen-lua-reference'
import { enclosing, javaBlocks, javaGuards, luaBlocks, luaFunctionAt, luaGuards, sideFromFlags, stripJava, stripLua } from '../../extract/java-scan'

const HERE = __dirname
const REPO_ROOT = path.resolve(HERE, '..', '..', '..', '..')
const TSX_CLI = path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs')
const GEN = path.join(REPO_ROOT, 'scripts', 'kb', 'gen-lua-reference.ts')
const FIX_DATA = path.join(HERE, 'surface.json')
const FIX_NOTES = path.join(HERE, 'notes.json')
const EXPECTED = path.join(HERE, 'expected')
const REAL_DATA = path.join(REPO_ROOT, 'scripts', 'kb', 'data', 'lua-surface-42.21.json')
const REAL_NOTES = path.join(REPO_ROOT, 'scripts', 'kb', 'data', 'lua-reference-notes-42.21.json')
const REAL_OUT = path.join(REPO_ROOT, 'content', 'articles', 'pz', 'build-42', 'modding', 'reference')

/** KB04's counts for Build 42.21 (PZ_Engine_Records delta B42_a2947723ca_to_4a0e9546ec, 01_lua_exposed_surface.md). */
const KB04 = { events: 262, globals: 728, classes: 1017 }

/** What the fixture holds; a change to the fixture must change these on purpose. */
const FIXTURE_SHAPE = { events: 3, registered: 2, sites: 3, unknownSites: 1, globals: 3, overloads: 4, classes: 5, debugOnly: 1 }

let failures = 0
let passes = 0
function check(name: string, ok: boolean, detail = ''): void {
  if (ok) {
    passes++
    console.log(`[COMPLETE] ${name}`)
  } else {
    failures++
    console.log(`[ERROR] ${name}${detail ? `\n          ${detail}` : ''}`)
  }
}

const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf-8'))
const sha = (s: string | Buffer) => crypto.createHash('sha256').update(s).digest('hex')

function runGen(args: string[]): { status: number; out: string } {
  const r = spawnSync(process.execPath, [TSX_CLI, GEN, ...args], { encoding: 'utf-8', cwd: REPO_ROOT })
  return { status: r.status ?? -1, out: (r.stdout ?? '') + (r.stderr ?? '') }
}

function filesOf(dir: string): Map<string, string> {
  const m = new Map<string, string>()
  // golden files may be checked out with CRLF on Windows; compare content, not line endings
  for (const f of fs.readdirSync(dir).sort()) m.set(f, fs.readFileSync(path.join(dir, f), 'utf-8').replace(/\r\n/g, '\n'))
  return m
}

/** The value in the index's numbers table for a row label, as a number. */
function tableValue(index: string, label: string): number | null {
  const row = index.split('\n').find(l => l.startsWith(`| ${label} |`))
  if (!row) return null
  const cell = row.split('|')[2].trim()
  const m = /^([\d,]+)/.exec(cell)
  return m ? Number(m[1].replace(/,/g, '')) : null
}

function headings(content: string, level: string): string[] {
  return content.split('\n').filter(l => l.startsWith(level + ' ')).map(l => l.slice(level.length + 1))
}

function main(): void {
  const update = process.argv.includes('--update')
  const data = read(FIX_DATA) as SurfaceData
  const notes = read(FIX_NOTES) as Notes

  // 1. fixture shape -----------------------------------------------------------------------
  const shape = {
    events: data.events.length,
    registered: data.events.filter(e => e.registered).length,
    sites: data.events.reduce((n, e) => n + e.sites.length, 0),
    unknownSites: data.events.reduce((n, e) => n + e.sites.filter(s => s.side === 'unknown').length, 0),
    globals: data.globals.length,
    overloads: data.globals.reduce((n, g) => n + g.overloads.length, 0),
    classes: data.classes.length,
    debugOnly: data.classes.filter(c => c.debugOnly).length,
  }
  check('fixture has the shape the expectations were written for', JSON.stringify(shape) === JSON.stringify(FIXTURE_SHAPE), `got ${JSON.stringify(shape)}`)

  // 2. stable output: golden files, and a second in-process run -----------------------------
  const out = generate(data, notes)
  const files = new Map<string, string>(out.pages.map(p => [p.file, p.content]))
  files.set('_category.json', out.category)
  if (update) {
    fs.rmSync(EXPECTED, { recursive: true, force: true })
    fs.mkdirSync(EXPECTED, { recursive: true })
    for (const [f, c] of files) fs.writeFileSync(path.join(EXPECTED, f), c)
    console.log(`[OK] expected/ rewritten (${files.size} files)`)
  }
  const golden = fs.existsSync(EXPECTED) ? filesOf(EXPECTED) : new Map<string, string>()
  const goldenSame = golden.size === files.size && [...files].every(([f, c]) => golden.get(f) === c)
  check('generator output equals the golden files in expected/', goldenSame,
    [...new Set([...files.keys(), ...golden.keys()])].filter(f => files.get(f) !== golden.get(f)).join(', '))
  const again = generate(data, notes)
  check('a second run in the same process gives identical pages', JSON.stringify(again) === JSON.stringify(out))

  // 3. everything appears where it should --------------------------------------------------
  const page = (slug: string) => out.pages.find(p => p.slug === slug)?.content ?? ''
  const events = page('lua-events')
  const evHeads = headings(events, '###')
  check('every event is a heading on the events page, once', data.events.every(e => evHeads.filter(h => h === e.name).length === 1) && evHeads.length === data.events.length,
    `headings: ${evHeads.join(', ')}`)
  const globals = page('lua-global-functions')
  check('every global function is on the globals page', data.globals.every(g => globals.includes(`- \`${g.name}(`)))
  check('an overloaded global lists every form', (globals.match(/`getFixture\(/g) ?? []).length === 2)
  const classPages = out.pages.filter(p => p.slug.startsWith('lua-classes-'))
  const classHeads = classPages.flatMap(p => headings(p.content, '###'))
  const simple = (b: string) => b.split('.').pop()!.replace(/\$/g, '.')
  check('every class is a heading on exactly one class page', data.classes.every(c => classHeads.filter(h => h === simple(c.name)).length === 1) && classHeads.length === data.classes.length,
    `headings: ${classHeads.join(', ')}`)
  const dir = page('lua-class-directory')
  check('every class is in the directory', data.classes.every(c => dir.includes(`[${simple(c.name)}](`)))
  check('the debug-only class is marked', classPages.some(p => p.content.includes('### Coroutine') && p.content.includes('Exposed only when the game runs in debug mode')))
  check('a method from an unexposed interface says where it comes from', classPages.some(p => p.content.includes('`getVisual(): FixtureVisual` from `IFixtureVisual`')))
  check('an exposed parent is linked, not repeated', classPages.some(p => /Also has the methods of \[FixtureObject\]\([^)]*#fixtureobject\) \(1\)/.test(p.content)))
  check('the event note is printed', events.includes('**When:** Fired every fixture tick.'))
  check('the global note is printed', globals.includes('- True for fixture objects.'))
  check('every page carries the generated notice and one proof line or more', out.pages.every(p => p.content.includes('> **Generated from the code.**') && /^> \*\*Proof:\*\* Code\. .+\. Build 9\.99 \(revision 0f0f0f0f0f\)\.$/m.test(p.content)))
  check('every page has frontmatter in the reference category', out.pages.every(p => /^---\nslug: [a-z0-9-]+\n[\s\S]*\ncategory: reference\n[\s\S]*\n---\n/.test(p.content)))

  // 4. counts in the index match the data (counted here, not by the generator) ----------------
  const index = page('lua-reference')
  const mine = {
    'Exposed classes': data.classes.length,
    'Methods listed on the class pages': data.classes.reduce((n, c) => n + c.methods.length, 0),
    'Global functions': data.globals.length,
    'Events registered at start-up': data.events.filter(e => e.registered).length,
    'Other event names fired by Java or vanilla Lua': data.events.filter(e => !e.registered).length,
    'Registered events nothing fires': data.events.filter(e => e.registered && e.sites.length === 0).length,
    'Event call sites': data.events.reduce((n, e) => n + e.sites.length, 0),
    Hooks: data.hooks.length,
  }
  for (const [label, n] of Object.entries(mine)) check(`index table: ${label} = ${n}`, tableValue(index, label) === n, `index says ${tableValue(index, label)}`)
  check('index: unknown call sites counted', index.includes(`(${mine['Event call sites'] - data.events.reduce((n, e) => n + e.sites.filter(s => s.side !== 'unknown').length, 0)} with an unknown side)`))
  check('index: previous build column', /\| Exposed classes \| 5 .*\| 4 \|/.test(index) && index.includes('| | Build 9.99 | Build 9.98 |'))

  // 5. the command line: two runs, byte-identical; --check -----------------------------------
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-gen-ref-'))
  try {
    const a = path.join(tmp, 'a')
    const b = path.join(tmp, 'b')
    const ra = runGen(['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', a])
    const rb = runGen(['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', b])
    check('CLI runs succeed', ra.status === 0 && rb.status === 0, ra.out + rb.out)
    const fa = filesOf(a)
    const fb = filesOf(b)
    const hashA = [...fa].map(([f, c]) => `${f}:${sha(c)}`).join('\n')
    const hashB = [...fb].map(([f, c]) => `${f}:${sha(c)}`).join('\n')
    check('two CLI runs write byte-identical files (sha256)', hashA === hashB && fa.size === files.size)
    check('CLI output equals the golden files', [...fa].every(([f, c]) => golden.get(f) === c) && fa.size === golden.size)
    const ok = runGen(['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', a, '--check'])
    check('--check passes on fresh output', ok.status === 0, ok.out)
    fs.appendFileSync(path.join(a, 'lua-events.md'), 'tampered\n')
    const bad = runGen(['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', a, '--check'])
    check('--check fails once a file is changed', bad.status === 1 && bad.out.includes('out of date: lua-events.md'), bad.out)
    const badNotes = path.join(tmp, 'notes.json')
    fs.writeFileSync(badNotes, JSON.stringify({ ...notes, events: { OnNoSuchEvent: { when: 'x', source: 'y' } } }))
    const refused = runGen(['--data', FIX_DATA, '--notes', badNotes, '--out', path.join(tmp, 'c')])
    check('a note for an event that does not exist is refused', refused.status !== 0 && refused.out.includes('note for unknown event OnNoSuchEvent'), refused.out)
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }

  // 6. the real data: KB04 counts, and the committed articles are current --------------------
  if (fs.existsSync(REAL_DATA)) {
    const real = read(REAL_DATA) as SurfaceData
    const registered = real.events.filter(e => e.registered).length
    check(`real data: ${KB04.events} registered events (KB04)`, registered === KB04.events, `got ${registered}`)
    check(`real data: ${KB04.globals} global functions (KB04)`, real.globals.length === KB04.globals, `got ${real.globals.length}`)
    check(`real data: ${KB04.classes} exposed classes (KB04), 3 of them debug only`, real.classes.length === KB04.classes && real.classes.filter(c => c.debugOnly).length === 3,
      `got ${real.classes.length}`)
    const idx = fs.readFileSync(path.join(REAL_OUT, 'lua-reference.md'), 'utf-8')
    check('real index publishes the KB04 numbers', tableValue(idx, 'Exposed classes') === KB04.classes && tableValue(idx, 'Global functions') === KB04.globals && tableValue(idx, 'Events registered at start-up') === KB04.events)
    check('real index explains the events beyond KB04 (fired but not registered)', tableValue(idx, 'Other event names fired by Java or vanilla Lua') === real.events.length - KB04.events)
    const cur = runGen(['--data', REAL_DATA, '--notes', REAL_NOTES, '--out', REAL_OUT, '--check'])
    check('committed reference articles match the data (--check)', cur.status === 0, cur.out.trim().split('\n').slice(-3).join(' | '))
  } else {
    check('real data file present', false, REAL_DATA)
  }

  // 7. the extractor's side reading, on invented Java and Lua ---------------------------------
  const java = [
    'package zombie.fixture;',
    'public class Fix {',
    '   public void a() {',
    '      if (GameServer.server) {',
    '         LuaEventManager.triggerEvent("A1");',
    '      } else {',
    '         LuaEventManager.triggerEvent("A2");',
    '      }',
    '   }',
    '   public void b() {',
    '      if (GameClient.client) {',
    '         return;',
    '      }',
    '      LuaEventManager.triggerEvent("B1"); // "GameServer.server" in a comment is ignored',
    '   }',
    '   public void c() {',
    '      if (!GameClient.client && !GameServer.server) {',
    '         LuaEventManager.triggerEvent("C1");',
    '      }',
    '      LuaEventManager.triggerEvent("C2");',
    '   }',
    '}',
  ].join('\n')
  const js = stripJava(java)
  const jb = javaBlocks(js)
  const jside = (ev: string) => {
    const at = js.indexOf('triggerEvent', java.indexOf(`"${ev}"`) - 40)
    const g = javaGuards(js, jb, at)
    const sd = sideFromFlags(g.flags)
    const m = [...enclosing(jb, at)].reverse().find(k => jb[k].kind === 'method')
    return `${sd ? `${sd.side}/${sd.singlePlayer}` : 'unknown'}@${m === undefined ? '-' : jb[m].name}`
  }
  const jgot = ['A1', 'A2', 'B1', 'C1', 'C2'].map(e => `${e}=${jside(e)}`).join(' ')
  check('Java guards: if, else, early return, both flags off, no guard', jgot === 'A1=server/false@a A2=client/true@a B1=server/true@b C1=single-player/true@c C2=unknown@c', jgot)
  const lua = [
    'if isClient() then return end',
    'function Fix.go()',
    '  if not isServer() then',
    '    triggerEvent("L1") -- isServer() in a comment is ignored',
    '  else',
    '    triggerEvent("L2")',
    '  end',
    'end',
    'local s = "isClient()"',
    'triggerEvent("L3")',
  ].join('\n')
  const ls = stripLua(lua)
  const lb = luaBlocks(ls)
  const lside = (ev: string) => {
    const at = ls.indexOf('triggerEvent', lua.indexOf(`"${ev}"`) - 20)
    const sd = sideFromFlags(luaGuards(ls, lb, at).flags)
    return `${sd ? `${sd.side}/${sd.singlePlayer}` : 'unknown'}@${luaFunctionAt(lb, at)}`
  }
  const lgot = ['L1', 'L2', 'L3'].map(e => `${e}=${lside(e)}`).join(' ')
  check('Lua guards: file-level early return, if not, else branch', lgot === 'L1=single-player/true@Fix.go L2=server/false@Fix.go L3=server/true@<file>', lgot)

  console.log(`\n${passes} passed, ${failures} failed`)
  process.exit(failures ? 1 : 0)
}

main()
