#!/usr/bin/env tsx
/**
 * Tests for the server owner's handbook: the extractor (scripts/kb/extract/extract-server-surface.ts)
 * and the generator (scripts/kb/gen-server-handbook.ts).
 *
 * On the invented generator fixture (surface.json, notes.json in this folder):
 *  - the fixture still has the shape the expectations below were written for;
 *  - the generator's output equals the golden files in expected/, and a second run is identical;
 *  - every option, command and capability is a heading exactly once, on the page it belongs to,
 *    and every directory row and link points at a heading that exists;
 *  - the numbers the pages publish match counts this test makes itself from the records;
 *  - every page carries the generated notice and exactly one proof line of the right shape;
 *  - two command-line runs write byte-identical files (sha256); --check passes on them and fails
 *    on a changed file or a stray file; a note for an unknown option, or tied to a site the option
 *    does not have, is refused.
 * On a tiny invented engine capture written to a temporary folder:
 *  - the extractor's parsers read declarations, presets, pages, commands and roles correctly;
 *  - read sites, writes, computed reads, "named" and "read nowhere" are told apart;
 *  - two extractor runs write the same file (sha256).
 * On the real data (scripts/kb/data/server-surface-42.21.json):
 *  - the counts equal a recount of the 42.21 declarations (from the capture, when it is on this
 *    machine) and the numbers recorded when the data was made;
 *  - the committed pages are exactly what the data and notes give (--check);
 *  - the hand-written first page states the same numbers as the data.
 *
 * Usage:
 *   npx tsx scripts/kb/fixtures/server-handbook/run.ts            (npm run kb:gen-server:test)
 *   npx tsx scripts/kb/fixtures/server-handbook/run.ts --update   rewrite expected/ from the fixture
 */

import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { generate, Notes, publishedCounts, ServerSurface, Slugger } from '../../gen-server-handbook'
import {
  callArgs,
  javaLiteral,
  parseCommandAnnotations,
  parseRoles,
  parseSandboxOptions,
  parseServerOptions,
  readLuaTable,
  stripLuaComments,
} from '../../extract/extract-server-surface'

const HERE = __dirname
const REPO_ROOT = path.resolve(HERE, '..', '..', '..', '..')
const TSX_CLI = path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs')
const GEN = path.join(REPO_ROOT, 'scripts', 'kb', 'gen-server-handbook.ts')
const EXTRACT = path.join(REPO_ROOT, 'scripts', 'kb', 'extract', 'extract-server-surface.ts')
const FIX_DATA = path.join(HERE, 'surface.json')
const FIX_NOTES = path.join(HERE, 'notes.json')
const EXPECTED = path.join(HERE, 'expected')
const REAL_DATA = path.join(REPO_ROOT, 'scripts', 'kb', 'data', 'server-surface-42.21.json')
const REAL_NOTES = path.join(REPO_ROOT, 'scripts', 'kb', 'data', 'server-handbook-notes-42.21.json')
const REAL_OUT = path.join(REPO_ROOT, 'content', 'articles', 'pz', 'build-42', 'server')
const REAL_INDEX = path.join(REAL_OUT, 'getting-started', 'running-a-server.md')
const CAPTURE = 'R:/ZOMBOID/PZ_Engine_Records/B42_4a0e9546ec'

/** The 42.21 numbers recorded when the data was made (KB10, 2026-10-04). */
const REAL = { serverOptions: 144, sandboxOptions: 269, commands: 67, roles: 7, capabilities: 98, serverReadNowhere: 1, sandboxReadNowhere: 4 }

/** What the generator fixture holds; a change to the fixture must change these on purpose. */
const FIXTURE_SHAPE = { server: 5, serverRead: 2, serverNamed: 1, serverNone: 2, sandbox: 6, sandboxRead: 3, sandboxComputed: 1, sandboxNamed: 1, sandboxNone: 1, commands: 4, disabled: 1, roles: 3, capabilities: 4 }

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

function run(script: string, args: string[]): { status: number; out: string } {
  const r = spawnSync(process.execPath, [TSX_CLI, script, ...args], { encoding: 'utf-8', cwd: REPO_ROOT, maxBuffer: 1 << 26 })
  return { status: r.status ?? -1, out: (r.stdout ?? '') + (r.stderr ?? '') }
}

/** Every file under dir, by path relative to it, content with line endings normalised. */
function filesOf(dir: string): Map<string, string> {
  const m = new Map<string, string>()
  const walk = (d: string, rel: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) walk(path.join(d, e.name), r)
      else m.set(r, fs.readFileSync(path.join(d, e.name), 'utf-8').replace(/\r\n/g, '\n'))
    }
  }
  if (fs.existsSync(dir)) walk(dir, '')
  return m
}

function headings(content: string, level: string): string[] {
  return content.split('\n').filter(l => l.startsWith(level + ' ')).map(l => l.slice(level.length + 1))
}

/** The anchors a page's headings get, in order (github-slugger rules, as on the site). */
function anchorsOf(content: string): Set<string> {
  const s = new Slugger()
  return new Set(content.split('\n').filter(l => /^#{1,6} /.test(l)).map(l => s.slug(l.replace(/^#{1,6} /, ''))))
}

// =========================================================================================
// 1. The generator on the invented fixture
// =========================================================================================

function generatorTests(): void {
  const data = read(FIX_DATA) as ServerSurface
  const notes = read(FIX_NOTES) as Notes
  const st = (xs: { status: string }[], s: string) => xs.filter(x => x.status === s).length
  const shape = {
    server: data.serverOptions.length,
    serverRead: st(data.serverOptions, 'read'),
    serverNamed: st(data.serverOptions, 'named'),
    serverNone: st(data.serverOptions, 'none'),
    sandbox: data.sandboxOptions.length,
    sandboxRead: st(data.sandboxOptions, 'read'),
    sandboxComputed: st(data.sandboxOptions, 'computed'),
    sandboxNamed: st(data.sandboxOptions, 'named'),
    sandboxNone: st(data.sandboxOptions, 'none'),
    commands: data.commands.length,
    disabled: data.commands.filter(c => c.disabled).length,
    roles: data.roles.length,
    capabilities: data.capabilities.length,
  }
  check('fixture has the shape the expectations were written for', JSON.stringify(shape) === JSON.stringify(FIXTURE_SHAPE), `got ${JSON.stringify(shape)}`)

  // stable output -------------------------------------------------------------------------
  const out = generate(data, notes)
  if (process.argv.includes('--update')) {
    fs.rmSync(EXPECTED, { recursive: true, force: true })
    for (const [f, c] of out.files) {
      fs.mkdirSync(path.dirname(path.join(EXPECTED, f)), { recursive: true })
      fs.writeFileSync(path.join(EXPECTED, f), c)
    }
    console.log(`[OK] expected/ rewritten (${out.files.size} files)`)
  }
  const golden = filesOf(EXPECTED)
  const goldenSame = golden.size === out.files.size && [...out.files].every(([f, c]) => golden.get(f) === c)
  check('generator output equals the golden files in expected/', goldenSame,
    [...new Set([...out.files.keys(), ...golden.keys()])].filter(f => out.files.get(f) !== golden.get(f)).join(', '))
  check('a second run in the same process gives identical files', JSON.stringify([...generate(data, notes).files]) === JSON.stringify([...out.files]))

  // placement -------------------------------------------------------------------------------
  const pages = out.pages
  const byCat = (c: string) => pages.filter(p => p.category === c)
  const groupPages = (c: string, dir: string) => byCat(c).filter(p => p.slug !== dir)
  const serverHeads = groupPages('server-options', 'server-options-directory').flatMap(p => headings(p.content, '###'))
  check('every server option is a heading exactly once on the server option pages',
    data.serverOptions.every(o => serverHeads.filter(h => h === o.name).length === 1) && serverHeads.length === data.serverOptions.length, serverHeads.join(', '))
  const sbHeads = groupPages('sandbox-options', 'sandbox-options-directory').flatMap(p => headings(p.content, '###'))
  check('every sandbox option is a heading exactly once on the sandbox option pages',
    data.sandboxOptions.every(o => sbHeads.filter(h => h === o.name).length === 1) && sbHeads.length === data.sandboxOptions.length, sbHeads.join(', '))
  const cmdPage = pages.find(p => p.slug === 'admin-commands')!.content
  const cmdHeads = headings(cmdPage, '###')
  check('every command is a heading once on the commands page', data.commands.every(c => cmdHeads.filter(h => h === `/${c.names[0]}`).length === 1) && cmdHeads.length === data.commands.length, cmdHeads.join(', '))
  const capPage = pages.find(p => p.slug === 'where-each-capability-is-checked')!.content
  check('every capability is a heading once on the capability page', data.capabilities.every(c => headings(capPage, '###').filter(h => h === c.name).length === 1))
  const pvpPage = pages.find(p => p.content.includes('### PVP'))!
  check('an option sits on the page of its settings-screen page', pvpPage.slug === 'server-options-pvp-safehouses-and-factions')
  const noPage = pages.find(p => p.slug === 'server-options-only-in-the-ini-file')!.content
  check('options on no settings page go to the ini-only page', noPage.includes('### ResetID') && noPage.includes('### AntiCheatFixture'))
  const serverDir = pages.find(p => p.slug === 'server-options-directory')!.content
  const sbDir = pages.find(p => p.slug === 'sandbox-options-directory')!.content
  check('every server option is one row of its directory', data.serverOptions.every(o => serverDir.split('\n').filter(l => l.startsWith(`| [${o.name}](`)).length === 1))
  check('every sandbox option is one row of its directory', data.sandboxOptions.every(o => sbDir.split('\n').filter(l => l.startsWith(`| [${o.name}](`)).length === 1))

  // every link to a handbook page points at a page and a heading that exist ----------------
  const anchorMap = new Map(pages.map(p => [`/pz/build-42/server/${p.category}/${p.slug}`, anchorsOf(p.content)]))
  const bad: string[] = []
  for (const p of pages) {
    for (const m of p.content.matchAll(/\]\((\/pz\/build-42\/server\/[a-z-]+\/[a-z0-9-]+)(?:#([^)]+))?\)/g)) {
      if (m[1].endsWith('/getting-started/running-a-server')) continue // hand-written
      const a = anchorMap.get(m[1])
      if (!a || (m[2] && !a.has(m[2]))) bad.push(`${p.slug}: ${m[0]}`)
    }
    for (const m of p.content.matchAll(/\]\(#([^)]+)\)/g)) if (!anchorsOf(p.content).has(m[1])) bad.push(`${p.slug}: #${m[1]}`)
  }
  check('every link between handbook pages resolves to an existing heading', bad.length === 0, bad.slice(0, 5).join(' | '))

  // published numbers, counted here from the records ---------------------------------------
  const so = data.serverOptions
  const sb = data.sandboxOptions
  const none = (xs: { status: string; name: string }[]) => xs.filter(x => x.status === 'none').map(x => x.name)
  check('server directory: total', serverDir.includes(`these are all ${so.length} options`))
  check('server directory: read count and read sites', serverDir.includes(`**${so.filter(o => o.status === 'read').length} of ${so.length} options are read**`) &&
    serverDir.includes(`at ${so.reduce((n, o) => n + o.reads.length, 0)} read sites`))
  const nowhereLine = serverDir.split('\n').find(l => l.includes('read nowhere:**')) ?? ''
  check('server directory: read-nowhere count and names', nowhereLine.includes(`**${none(so).length} options are read nowhere`) && none(so).every(n => nowhereLine.includes(`[${n}](`)), nowhereLine)
  check('server directory: options on no page', serverDir.includes(`${so.filter(o => !o.page).length} options are on no page`))
  check('sandbox directory: totals and statuses', sbDir.includes(`has ${sb.length} of them`) &&
    sbDir.includes(`**${sb.filter(o => o.status === 'read').length} options are read directly**`) &&
    sbDir.includes(`**${sb.filter(o => o.status === 'computed').length} are read through`) &&
    sbDir.includes(`**${sb.filter(o => o.status === 'named').length} have no read we could find`) &&
    sbDir.includes(`**${none(sb).length} are read nowhere:**`) &&
    sbDir.includes(`**${sb.reduce((n, o) => n + o.writes.length, 0)} places set a sandbox value`))
  check('sandbox directory: defaults that differ from the Java declaration', sbDir.includes(`So for ${sb.filter(o => o.default !== o.javaDefault).length} options`))
  check('commands page: total and disabled', cmdPage.includes(`these are the ${data.commands.length} commands`) && cmdPage.includes(`**${data.commands.filter(c => c.disabled).length} command is disabled`))
  const rolesPage = pages.find(p => p.slug === 'server-roles-and-capabilities')!.content
  check('roles page: built-in roles and one matrix row per capability', rolesPage.includes(`The game ships ${data.roles.length} built-in roles`) &&
    data.capabilities.every(c => rolesPage.split('\n').filter(l => l.startsWith(`| \`${c.name}\` |`)).length === 1))
  check('capability page: total', capPage.includes(`For each of the ${data.capabilities.length} capabilities`))
  const pc = publishedCounts(data)
  check('publishedCounts agrees with the records', pc.serverOptions === so.length && pc.serverOptionsReadNowhere === none(so).length && pc.sandboxOptionsReadNowhere === none(sb).length && pc.commands === data.commands.length)

  // content details ---------------------------------------------------------------------------
  check('a computed default is shown as computed', noPage.includes('`ResetID=` followed by a value computed when the options are created: `Rand.Next(1000)`'))
  check('a read-nowhere option says so', noPage.includes('**Not read by the 42.21 code.**'))
  check('the game\'s line-break tag becomes a space', pvpPage.content.includes('"Players can hurt other players"'))
  check('sites are grouped by method with their lines', pvpPage.content.includes('`zombie.fixture.Combat#hit` (lines 5, 9)'))
  check('a server note is printed', pvpPage.content.includes('**What the code does with it:** Fixture: players may hurt each other.'))
  const zPage = pages.find(p => p.slug === 'sandbox-options-zombies')!.content
  check('a default from the preset shows the Java value too', zPage.includes('the Apocalypse preset\'s value; the Java declaration says `3` ("Normal")'))
  check('presets that differ are listed', zPage.includes('Other presets: Rising `2` ("High")'))
  check('writes are summarised apart from reads', zPage.includes('**Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (2 files, 2 places)'))
  check('an enum backed by Java constants lists them', zPage.includes('1 "Fast" = `FAST (2.0F)`') && zPage.includes('3 "Slow" = `SLOW`'))
  check('a nested sandbox option shows its table', zPage.includes('`ZombieLore = { Speed = 2 }`'))
  check('a command form with its own capability says so', cmdPage.includes('`/teleport <"name or text"> <"name or text">` (needs `SaveWorld`)'))
  check('a disabled command is marked', cmdPage.includes('- **Disabled in this build:** the server skips it.'))
  check('a command note is printed', cmdPage.includes('**What the code does:** Fixture: moves you.'))
  check('a capability note is printed', capPage.includes('**What the code does with it:** Fixture: saving is allowed.'))
  check('every page carries the generated notice and exactly one proof line', pages.every(p =>
    p.content.includes('> **Generated from the code.**') &&
    (p.content.match(/^> \*\*Proof:\*\* /gm) ?? []).length === 1 &&
    /^> \*\*Proof:\*\* Code\. .+\. Build 9\.99 \(revision 0f0f0f0f0f\)\.$/m.test(p.content)))
  check('every page has frontmatter for its section and folder', pages.every(p => new RegExp(`^---\\nslug: ${p.slug}\\n[\\s\\S]*\\nsection: server\\ncategory: ${p.category}\\n[\\s\\S]*\\n---\\n`).test(p.content)))

  // the command line ----------------------------------------------------------------------------
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-gen-server-'))
  try {
    const a = path.join(tmp, 'a')
    const b = path.join(tmp, 'b')
    const ra = run(GEN, ['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', a])
    const rb = run(GEN, ['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', b])
    check('CLI runs succeed', ra.status === 0 && rb.status === 0, ra.out + rb.out)
    const fa = filesOf(a)
    const fb = filesOf(b)
    const hash = (m: Map<string, string>) => [...m].map(([f, c]) => `${f}:${sha(c)}`).join('\n')
    check('two CLI runs write byte-identical files (sha256)', hash(fa) === hash(fb) && fa.size === out.files.size)
    check('CLI output equals the golden files', fa.size === golden.size && [...fa].every(([f, c]) => golden.get(f) === c))
    const ok = run(GEN, ['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', a, '--check'])
    check('--check passes on fresh output', ok.status === 0, ok.out)
    fs.appendFileSync(path.join(a, 'admin-commands', 'admin-commands.md'), 'tampered\n')
    const bad1 = run(GEN, ['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', a, '--check'])
    check('--check fails once a file is changed', bad1.status === 1 && bad1.out.includes('out of date: admin-commands/admin-commands.md'), bad1.out)
    fs.writeFileSync(path.join(b, 'server-options', 'stray.md'), 'x\n')
    const bad2 = run(GEN, ['--data', FIX_DATA, '--notes', FIX_NOTES, '--out', b, '--check'])
    check('--check fails on a file the data does not give', bad2.status === 1 && bad2.out.includes('not generated by this data: server-options/stray.md'), bad2.out)
    const n1 = path.join(tmp, 'n1.json')
    fs.writeFileSync(n1, JSON.stringify({ ...notes, serverOptions: { NoSuchOption: { effect: 'x', site: 'declaration' } } }))
    const r1 = run(GEN, ['--data', FIX_DATA, '--notes', n1, '--out', path.join(tmp, 'c')])
    check('a note for an option that does not exist is refused', r1.status !== 0 && r1.out.includes('note for unknown server option NoSuchOption'), r1.out)
    const n2 = path.join(tmp, 'n2.json')
    fs.writeFileSync(n2, JSON.stringify({ ...notes, sandboxOptions: { LootRate: { effect: 'x', site: 'zombie.fixture.Elsewhere#nope' } } }))
    const r2 = run(GEN, ['--data', FIX_DATA, '--notes', n2, '--out', path.join(tmp, 'd')])
    check('a note tied to a site the option does not have is refused', r2.status !== 0 && r2.out.includes('site zombie.fixture.Elsewhere#nope is not one of its sites'), r2.out)
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
}

// =========================================================================================
// 2. The extractor's parsers, and the extractor on a tiny invented capture
// =========================================================================================

const J = (lines: string[]) => lines.join('\n')

const FAKE: Record<string, string> = {
  'src/zombie/network/ServerOptions.java': J([
    'package zombie.network;',
    'public class ServerOptions {',
    '   public static final ServerOptions instance = new ServerOptions();',
    '   public ServerOptions.BooleanServerOption pvp = new ServerOptions.BooleanServerOption(this, "PVP", true);',
    '   public ServerOptions.IntegerServerOption maxPlayers = new ServerOptions.IntegerServerOption(this, "MaxPlayers", 1, Integer.MAX_VALUE, 32);',
    '   public ServerOptions.EnumServerOption policy = new ServerOptions.EnumServerOption(this, "Policy", 3, 2);',
    '   public ServerOptions.StringServerOption password = new ServerOptions.StringServerOption(this, "Password", "", -1);',
    '   public ServerOptions.StringServerOption token = new ServerOptions.StringServerOption(this, "Token", "a,b", 16);',
    '   public ServerOptions.IntegerServerOption resetId = new ServerOptions.IntegerServerOption(this, "ResetID", 0, 100, Rand.Next(100));',
    '   public ServerOptions.BooleanServerOption unused = new ServerOptions.BooleanServerOption(this, "Unused", false);',
    '   public ServerOptions() {',
    '      this.publicOptions.remove("Password");',
    '      this.publicOptions.remove(this.token.getName());',
    '   }',
    '   public static void initClientCommandsHelp() {',
    '      clientOptionsList.put("roll", Translator.getText("UI_Roll"));',
    '   }',
    '   public int getMaxPlayers() {',
    '      return Math.min(254, getInstance().maxPlayers.getValue());',
    '   }',
    '}',
  ]),
  'src/zombie/characters/Speedy.java': J(['package zombie.characters;', 'public enum Speedy {', '   SLOW(0.5F),', '   FAST(2.0F);', '   public final float m;', '}']),
  'src/zombie/SandboxOptions.java': J([
    'package zombie;',
    'import zombie.characters.Speedy;',
    'public final class SandboxOptions {',
    '   public static final SandboxOptions instance = new SandboxOptions();',
    '   public final SandboxOptions.EnumSandboxOption zombies = this.newEnumOption("Zombies", 4, 3).setTranslation("ZombieCount");',
    '   public final SandboxOptions.DoubleSandboxOption loot = this.newDoubleOption("Loot", 0.0, 2.0, 0.65F).setValueTranslation("X");',
    '   public final SandboxOptions.StrongEnumSandboxOption<Speedy> speedy = this.newEnumOption(',
    '      "Speedy", Speedy.class, Speedy.FAST',
    '   );',
    '   public final SandboxOptions.BooleanSandboxOption named = this.newBooleanOption("NamedOnly", true);',
    '   public final SandboxOptions.BooleanSandboxOption nothing = this.newBooleanOption("Nothing", true);',
    '   public final SandboxOptions.DoubleSandboxOption clay = this.newDoubleOption("ClayX", 0.0, 1.0, 0.05);',
    '   public final SandboxOptions.ZombieLore lore = new SandboxOptions.ZombieLore();',
    '   public final SandboxOptions.MultiplierConfig multipliersConfig = new SandboxOptions.MultiplierConfig();',
    '   public SandboxOptions() {',
    '      this.loadGameFile("Apocalypse");',
    '      this.setDefaultsToCurrentValues();',
    '   }',
    '   private SandboxOptions.BooleanSandboxOption newBooleanOption(String name, boolean defaultValue) {',
    '      return new SandboxOptions.BooleanSandboxOption(this, name, defaultValue);',
    '   }',
    '   public int getLoot() {',
    '      return (int)instance.loot.getValue();',
    '   }',
    '   public final class ZombieLore {',
    '      public final SandboxOptions.EnumSandboxOption speed;',
    '      public ZombieLore() {',
    '         this.speed = SandboxOptions.this.newEnumOption("ZombieLore.Speed", 3, 2).setTranslation("ZSpeed");',
    '      }',
    '   }',
    '   public final class MultiplierConfig {',
    '      public final SandboxOptions.DoubleSandboxOption axe;',
    '      public MultiplierConfig() {',
    '         this.axe = SandboxOptions.this.newDoubleOption("MultiplierConfig.Axe", 0.0, 1000.0, 1.0);',
    '      }',
    '   }',
    '}',
  ]),
  'src/zombie/fixture/Reader.java': J([
    'package zombie.fixture;',
    'public class Reader {',
    '   public void a() {',
    '      if (ServerOptions.instance.pvp.getValue()) {',
    '         ServerOptions.instance.pvp.setValue(false);',
    '      }',
    '      // ServerOptions.instance.unused.getValue() in a comment is ignored',
    '      int s = SandboxOptions.instance.lore.speed.getValue();',
    '      String v = ServerOptions.getInstance().getOption("Token");',
    '   }',
    '   public void b(String perk) {',
    '      SandboxOptions.instance.getOptionByName("MultiplierConfig." + perk);',
    '      if (role.hasCapability(Capability.Fly)) {',
    '      }',
    '   }',
    '}',
  ]),
  'src/zombie/iso/worldgen/utils/probabilities/ProbaString.java': J([
    'package zombie.iso.worldgen.utils.probabilities;',
    'public class ProbaString {',
    '   public ProbaString(String value) {',
    '      if ("Sandbox".equals(this.clazz)) {',
    '         SandboxOptions.SandboxOption option = SandboxOptions.instance.getOptionByName(this.field);',
    '      }',
    '   }',
    '}',
  ]),
  'src/zombie/commands/CommandBase.java': J([
    'package zombie.commands;',
    'public abstract class CommandBase {',
    '   private static final Class<?>[] childrenClasses = new Class[]{',
    '      SaveCommand.class,',
    '      FlyCommand.class',
    '   };',
    '}',
  ]),
  'src/zombie/commands/serverCommands/ArgType.java': J(['package zombie.commands.serverCommands;', 'public class ArgType {', '   public static final String PlayerName = "(.+)";', '   public static final String Value = "(\\\\d+)";', '}']),
  'src/zombie/commands/serverCommands/SaveCommand.java': J([
    'package zombie.commands.serverCommands;',
    '@CommandName(',
    '   name = "save"',
    ')',
    '@CommandHelp(',
    '   helpText = "UI_Save"',
    ')',
    '@RequiredCapability(',
    '   requiredCapability = Capability.Fly',
    ')',
    'public class SaveCommand extends CommandBase {',
    '   @Override',
    '   protected String Command() {',
    '      return "ok";',
    '   }',
    '}',
  ]),
  'src/zombie/commands/serverCommands/FlyCommand.java': J([
    'package zombie.commands.serverCommands;',
    '@CommandNames({@CommandName(',
    '      name = "fly"',
    '   ), @CommandName(',
    '      name = "f"',
    '   )})',
    '@AltCommandArgs({@CommandArgs(',
    '      required = {"(.+)"},',
    '      argName = "other"',
    '   ), @CommandArgs(',
    '      required = {},',
    '      optional = "(\\\\d+)",',
    '      argName = "me"',
    '   )})',
    '@RequiredCapabilities({@RequiredCapability(',
    '      requiredCapability = Capability.Fly,',
    '      argName = "me"',
    '   ), @RequiredCapability(',
    '      requiredCapability = Capability.Land,',
    '      argName = "other"',
    '   )})',
    '@DisabledCommand',
    'public class FlyCommand extends SaveCommand {',
    '}',
  ]),
  'src/zombie/characters/Capability.java': J(['package zombie.characters;', 'public enum Capability {', '   None,', '   Fly,', '   Land;', '}']),
  'src/zombie/characters/Roles.java': J([
    'package zombie.characters;',
    'public class Roles {',
    '   public static void addStatic() {',
    '      Role user = new Role("user");',
    '      user.addCapability(Capability.Fly);',
    '      user.setColor(new Color(0.9F, 0.9F, 0.9F));',
    '      user.setDescription("Can fly.");',
    '      user.setReadOnly();',
    '      user.setPosition(2000);',
    '      roles.add(user);',
    '      Role admin = new Role("admin");',
    '      for (Capability c : Capability.values()) {',
    '         admin.addCapability(c);',
    '      }',
    '      admin.removeCapability(Capability.Land);',
    '      admin.setDescription("All but landing.");',
    '      admin.setPosition(7000);',
    '      roles.add(admin);',
    '      defaultForUser = user;',
    '      defaultForAdmin = admin;',
    '   }',
    '}',
  ]),
  'game_snapshot/media/lua/shared/Translate/EN/UI.json': JSON.stringify({
    UI_ServerOption_PVP_tooltip: 'Players can hurt each other',
    UI_ServerOption_AntiCheat_option1: 'ban',
    UI_ServerOption_AntiCheat_option2: 'kick',
    UI_ServerOption_AntiCheat_option3: 'log',
    UI_ServerSettingGroup_PVP: 'PVP',
    UI_Save: 'Save the world',
    UI_Roll: 'Roll a die',
    UI_NewGame_Apocalypse: 'Apocalypse',
    UI_NewGame_Rising: 'Rising',
  }),
  'game_snapshot/media/lua/shared/Translate/EN/Sandbox.json': JSON.stringify({
    Sandbox_ZombieCount: 'Zombie Count',
    Sandbox_ZombieCount_option1: 'Insane',
    Sandbox_ZombieCount_option3: 'Normal',
    Sandbox_Zombie: 'Zombie',
    Sandbox_Title_ZombieLore: 'Zombie Lore',
  }),
  'game_snapshot/media/lua/shared/Translate/EN/IG_UI.json': JSON.stringify({ IGUI_CapabilitiesTooltips_Fly: 'May fly.' }),
  'game_snapshot/media/lua/client/OptionScreens/ServerSettingsScreen.lua': J([
    'local x = 1',
    'SettingsTable = {',
    '  {',
    '    name = "INI",',
    '    pages = {',
    '      { name = "PVP", settings = { { name = "PVP" }, { name = "Policy" } } }, -- a comment { with braces',
    '      { name = "Mods", customui = ModsPanel, settings = {} },',
    '    },',
    '  },',
    '  {',
    '    name = "Sandbox",',
    '    pages = {',
    '      { title = getText("UI_Presets"), settings = {}, customui = PresetPanel },',
    '      { name = "Zombie", settings = { { name = "Zombies", advancedCombo = { default = 4, values = { { name = "Sandbox_Insane", text = "2.5" } } } }, { name = "ZombieLore.Speed", title = "ZombieLore" }, { name = "NamedOnly" } } },',
    '    },',
    '  },',
    '}',
    'function Page3:onComboBoxSelected(combo, categoryName, optionName)',
    '  if optionName == "NamedOnly" then end',
    'end',
  ]),
  'game_snapshot/media/lua/client/OptionScreens/SandboxOptions.lua': J([
    'local function isDebugSetting(setting)',
    '    return setting and (setting.name == "Loot")',
    'end',
    'function SandboxOptionsScreen:loadPresets()',
    '    self:addPresetToList("Apocalypse", getText("UI_NewGame_Apocalypse"), false)',
    '    self:addPresetToList("Rising", getText("UI_NewGame_Rising"), false)',
    'end',
  ]),
  'game_snapshot/media/lua/shared/Sandbox/Apocalypse.lua': J(['return {', '    Version = 6,', '    Zombies = 4,', '    Loot = 0.5,', '    ZombieLore = {', '        Speed = 3,', '    },', '}']),
  'game_snapshot/media/lua/shared/Sandbox/Rising.lua': J(['return {', '    Zombies = tonumber(Fix.High),', '    OldName = 1,', '}']),
  'game_snapshot/media/lua/shared/defines.lua': J(['Fix = {}', 'Fix.High = "2"']),
  'game_snapshot/media/lua/client/Reader.lua': J([
    'function Reader.go()',
    '  if SandboxVars.Zombies == 1 then',
    '    SandboxVars.Zombies = 3',
    '  end',
    '  local p = getServerOptions():getBoolean("PVP")',
    '  -- SandboxVars.Nothing in a comment is ignored',
    '  local g = { p = "Sandbox.ClayX" }',
    '  local q = SandboxVars.Gone',
    'end',
  ]),
}

function writeFakeCapture(dir: string): void {
  const jar = Buffer.from('not a real jar\n')
  for (const [rel, content] of Object.entries(FAKE)) {
    const p = path.join(dir, ...rel.split('/'))
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, content + '\n')
  }
  fs.writeFileSync(path.join(dir, 'game_snapshot', 'projectzomboid.jar'), jar)
  fs.writeFileSync(
    path.join(dir, 'MANIFEST.yaml'),
    ['build_label: "9.99"', 'git_revision: "0f0f0f0f0f"', 'steam_buildid: "1"', `source_sha256: "${sha(jar)}"`, 'sealed: 2000-01-01', ''].join('\n'),
  )
}

function extractorTests(): void {
  // parsers on their own ---------------------------------------------------------------------
  check('javaLiteral: numbers, constants, strings, and a call is not a literal',
    javaLiteral('Integer.MAX_VALUE')?.value === 2147483647 && javaLiteral('0.65F')?.value === 0.65 && javaLiteral('"a\\"b"')?.value === 'a"b' &&
    javaLiteral('-1')?.value === -1 && javaLiteral('Rand.Next(5)') === null)
  const ca = callArgs('f(this, "a,b", g(1, 2), 3)', 1)
  check('callArgs: top-level arguments, strings and nested calls kept whole', JSON.stringify(ca.args) === JSON.stringify(['this', '"a,b"', 'g(1, 2)', '3']))
  const lt = readLuaTable(stripLuaComments('{ a = 1, b = "x -- y", c = { d = true }, e = tonumber(X.Y), -2, -- gone\n f = nil }'), 0)
  check('readLuaTable: literals, nested tables, expressions, comments out',
    lt.hash.a === 1 && lt.hash.b === 'x -- y' && (lt.hash.c as { hash: Record<string, unknown> }).hash.d === true &&
    JSON.stringify(lt.hash.e) === JSON.stringify({ expr: 'tonumber(X.Y)' }) && lt.array[0] === -2 && lt.hash.f === null)
  const so = parseServerOptions(FAKE['src/zombie/network/ServerOptions.java'])
  check('parseServerOptions: every declaration, typed, with ranges and a computed default',
    so.decls.map(d => `${d.name}:${d.type}`).join(',') === 'PVP:boolean,MaxPlayers:integer,Policy:enum,Password:string,Token:string,ResetID:integer,Unused:boolean' &&
    so.decls[1].max === 2147483647 && so.decls[2].max === 3 && so.decls[2].default === 2 && so.decls[4].maxLength === 16 &&
    JSON.stringify(so.decls[5].default) === JSON.stringify({ computed: 'Rand.Next(100)' }), JSON.stringify(so.decls))
  check('parseServerOptions: the public list leaves out what the constructor removes', JSON.stringify(so.publicExcluded) === JSON.stringify(['Password', 'Token']))
  const sb = parseSandboxOptions(FAKE['src/zombie/SandboxOptions.java'], cls => FAKE[`src/zombie/characters/${cls}.java`])
  check('parseSandboxOptions: names, fields, groups, construction order',
    sb.decls.map(d => `${d.name}@${d.holder ?? ''}.${d.field}`).join(',') === 'Zombies@.zombies,Loot@.loot,Speedy@.speedy,NamedOnly@.named,Nothing@.nothing,ClayX@.clay,ZombieLore.Speed@lore.speed,MultiplierConfig.Axe@multipliersConfig.axe',
    sb.decls.map(d => `${d.name}@${d.holder ?? ''}.${d.field}`).join(','))
  const sp = sb.decls.find(d => d.name === 'Speedy')!
  check('parseSandboxOptions: translations, float defaults, a Java enum counted', sb.decls[0].translation === 'ZombieCount' && sb.decls[1].valueTranslation === 'X' && sb.decls[1].javaDefault === 0.65 &&
    sp.numValues === 2 && sp.javaDefault === 2 && sp.enumClass === 'Speedy')
  const fly = parseCommandAnnotations(FAKE['src/zombie/commands/serverCommands/FlyCommand.java'])
  check('parseCommandAnnotations: names, forms, per-form capabilities, disabled',
    JSON.stringify(fly.names) === '["fly","f"]' && fly.disabled && fly.variants.length === 2 && fly.variants[1].optional === '(\\d+)' && fly.variants[0].required[0] === '(.+)' &&
    JSON.stringify(fly.capabilities) === JSON.stringify([{ capability: 'Fly', argName: 'me' }, { capability: 'Land', argName: 'other' }]), JSON.stringify(fly))
  const roles = parseRoles(FAKE['src/zombie/characters/Roles.java'], ['None', 'Fly', 'Land'])
  check('parseRoles: explicit capabilities, "all except", descriptions, defaults',
    roles.length === 2 && JSON.stringify(roles[0].capabilities) === '["Fly"]' && roles[0].description === 'Can fly.' && roles[0].color[0] === 0.9 &&
    JSON.stringify(roles[1].capabilities) === '["None","Fly"]' && JSON.stringify(roles[1].removed) === '["Land"]' && JSON.stringify(roles[1].defaultFor) === '["defaultForAdmin"]', JSON.stringify(roles))

  // the whole extractor on the invented capture -------------------------------------------------
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-extract-server-'))
  try {
    const cap = path.join(tmp, 'cap')
    writeFakeCapture(cap)
    const o1 = path.join(tmp, 'one.json')
    const o2 = path.join(tmp, 'two.json')
    const r1 = run(EXTRACT, ['--capture', cap, '--out', o1])
    const r2 = run(EXTRACT, ['--capture', cap, '--out', o2])
    check('extractor runs on the invented capture', r1.status === 0 && r2.status === 0, (r1.out + r2.out).split('\n').slice(-8).join(' | '))
    if (r1.status !== 0) return
    check('two extractor runs write the same file (sha256)', sha(fs.readFileSync(o1)) === sha(fs.readFileSync(o2)))
    const d = read(o1) as ServerSurface
    const sopt = (n: string) => d.serverOptions.find(o => o.name === n)!
    const bopt = (n: string) => d.sandboxOptions.find(o => o.name === n)!
    const pvp = sopt('PVP')
    check('a server option read in Java and Lua, and changed once', pvp.status === 'read' && pvp.reads.length === 2 && pvp.writes.length === 1 &&
      pvp.reads.some(s => s.lang === 'lua' && s.where === 'client/Reader.lua' && s.in === 'Reader.go') && pvp.writes[0].in === 'a', JSON.stringify(pvp))
    check('a getter with the name as text is a read', sopt('Token').reads.length === 1 && sopt('Token').reads[0].where === 'zombie.fixture.Reader')
    check('the class\'s own getter is a read site', sopt('MaxPlayers').reads.some(s => s.where === 'zombie.network.ServerOptions' && s.in === 'getMaxPlayers'))
    check('the constructor\'s public list is not a read', sopt('Token').reads.every(s => s.in !== 'ServerOptions'))
    check('a server option named only in a comment is read nowhere', sopt('Unused').status === 'none')
    check('the public flag follows the constructor', !sopt('Password').public && !sopt('Token').public && pvp.public)
    check('enum choices come from the anti-cheat labels', JSON.stringify(sopt('Policy').choices) === '["ban","kick","log"]')
    check('a server option on a settings page knows it, others do not', pvp.page === 'PVP' && sopt('MaxPlayers').page === null)
    const z = bopt('Zombies')
    check('a sandbox read and an assignment are told apart', z.status === 'read' && z.reads.length === 1 && z.writes.length === 1, JSON.stringify(z))
    check('a nested sandbox option read through its group', bopt('ZombieLore.Speed').status === 'read' && bopt('ZombieLore.Speed').reads[0].where === 'zombie.fixture.Reader')
    check('a read through the static instance inside SandboxOptions', bopt('Loot').reads.some(s => s.in === 'getLoot'))
    check('a name built at run time is a computed read', bopt('MultiplierConfig.Axe').status === 'computed' && bopt('MultiplierConfig.Axe').computed[0].in === 'b')
    check('worldgen data naming "Sandbox.X" is a computed read through ProbaString', bopt('ClayX').status === 'computed' && bopt('ClayX').computed.some(s => s.where.endsWith('ProbaString')))
    check('a name that appears only as text is "named"', bopt('NamedOnly').status === 'named' && bopt('NamedOnly').named.some(s => s.in === 'Page3:onComboBoxSelected'))
    check('the settings list itself is not a "named" site', bopt('NamedOnly').named.every(s => s.line > 17))
    check('a sandbox option in a comment only is read nowhere', bopt('Nothing').status === 'none')
    check('the sandbox screen\'s debug-only list is recorded', bopt('Loot').hiddenUnlessDebug && !bopt('Nothing').hiddenUnlessDebug)
    check('a declaration over several lines is not a "named" site of itself', bopt('Speedy').status === 'none', JSON.stringify(bopt('Speedy').named))
    check('defaults come from the Apocalypse preset, the Java default is kept', z.default === 4 && z.javaDefault === 3 && bopt('ZombieLore.Speed').default === 3 && bopt('Loot').default === 0.5)
    check('a preset value computed through defines.lua, and stray preset keys', z.presets.Rising === 2 && JSON.stringify(d.presets[1].unknownKeys) === '["OldName"]')
    check('a Java-enum option lists its constants', JSON.stringify(bopt('Speedy').enumConstants) === JSON.stringify([{ name: 'SLOW', args: '0.5F' }, { name: 'FAST', args: '2.0F' }]))
    check('labels, choices and subgroups from the translations', z.label === 'Zombie Count' && z.choices![0] === 'Insane' && bopt('ZombieLore.Speed').subgroup === 'Zombie Lore')
    check('an unknown SandboxVars name is listed', d.unknownSandboxNames.some(u => u.name === 'Gone'))
    const cmds = d.commands
    check('commands in the registered order, with help text and where they act',
      cmds.map(c => c.names[0]).join(',') === 'save,fly' && cmds[0].help === 'Save the world' && cmds[1].disabled &&
      cmds[1].actsIn?.where === 'zombie.commands.serverCommands.SaveCommand', JSON.stringify(cmds))
    check('the player help list', JSON.stringify(d.playerCommands) === JSON.stringify([{ name: 'roll', helpKey: 'UI_Roll', help: 'Roll a die' }]))
    const fl = d.capabilities.find(c => c.name === 'Fly')!
    check('capabilities: roles, commands, read sites (annotations and role definitions left out)',
      JSON.stringify(fl.roles) === '["user","admin"]' && JSON.stringify(fl.commands) === '["save","fly"]' && fl.reads.length === 1 && fl.reads[0].where === 'zombie.fixture.Reader' && fl.tooltip === 'May fly.', JSON.stringify(fl))
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
}

// =========================================================================================
// 3. The real data
// =========================================================================================

function realTests(): void {
  if (!fs.existsSync(REAL_DATA)) {
    check('real data file present', false, REAL_DATA)
    return
  }
  const d = read(REAL_DATA) as ServerSurface
  const pc = publishedCounts(d)
  check(`real data: ${REAL.serverOptions} server options, ${REAL.sandboxOptions} sandbox options, ${REAL.commands} commands, ${REAL.roles} roles, ${REAL.capabilities} capabilities`,
    pc.serverOptions === REAL.serverOptions && pc.sandboxOptions === REAL.sandboxOptions && pc.commands === REAL.commands && pc.roles === REAL.roles && pc.capabilities === REAL.capabilities,
    JSON.stringify(pc))
  check(`real data: ${REAL.serverReadNowhere} server option and ${REAL.sandboxReadNowhere} sandbox options read nowhere`,
    pc.serverOptionsReadNowhere === REAL.serverReadNowhere && pc.sandboxOptionsReadNowhere === REAL.sandboxReadNowhere)
  if (fs.existsSync(CAPTURE)) {
    // an independent recount from the capture, with patterns of its own
    const src = (rel: string) => fs.readFileSync(path.join(CAPTURE, 'src', ...rel.split('/')), 'utf-8')
    const nServer = (src('zombie/network/ServerOptions.java').match(/new\s+ServerOptions\.\w+ServerOption\s*\(\s*this\s*,\s*"/g) ?? []).length
    const nSandbox = (src('zombie/SandboxOptions.java').match(/new(?:Boolean|Double|Enum|Integer|String)Option\s*\(\s*"/g) ?? []).length
    const list = /childrenClasses\s*=\s*new\s+Class\s*\[\s*\]\s*\{([^}]*)\}/.exec(src('zombie/commands/CommandBase.java'))![1]
    const nCommands = (list.match(/\.class/g) ?? []).length
    const addStatic = src('zombie/characters/Roles.java').split('public static void addStatic')[1]
    const nRoles = (addStatic.match(/new Role\("/g) ?? []).length
    const capBody = /enum Capability\s*\{([^;]*);/.exec(src('zombie/characters/Capability.java'))![1]
    const nCaps = capBody.split(',').filter(x => x.trim()).length
    check('real data counts equal a recount of the 42.21 capture', nServer === pc.serverOptions && nSandbox === pc.sandboxOptions && nCommands === pc.commands && nRoles === pc.roles && nCaps === pc.capabilities,
      JSON.stringify({ nServer, nSandbox, nCommands, nRoles, nCaps }))
  } else console.log(`[SKIP] the 42.21 capture is not on this machine; recount not run`)
  const cur = run(GEN, ['--data', REAL_DATA, '--notes', REAL_NOTES, '--out', REAL_OUT, '--check'])
  check('committed handbook pages match the data (--check)', cur.status === 0, cur.out.trim().split('\n').slice(-3).join(' | '))
  if (fs.existsSync(REAL_INDEX)) {
    const idx = fs.readFileSync(REAL_INDEX, 'utf-8')
    check('the hand-written first page states the data\'s numbers',
      idx.includes(`all ${pc.serverOptions} options of the server's ini file`) && idx.includes(`all ${pc.sandboxOptions} sandbox options`) &&
      idx.includes(`the ${pc.commands} commands`) && idx.includes(`the ${pc.roles} built-in roles and the ${pc.capabilities} capabilities`) &&
      idx.includes(`For ${pc.sandboxDefaultDiffersFromJava} options`) && idx.includes(`${pc.serverOptionsOnNoPage} server options are not on the settings screen`))
    const named = d.serverOptions.filter(o => o.status === 'none').map(o => o.name).concat(d.sandboxOptions.filter(o => o.status === 'none').map(o => o.name))
    check('the first page names every option read nowhere', named.every(n => idx.includes(`[${n}](`)), named.join(', '))
  } else check('hand-written first page present', false, REAL_INDEX)
}

generatorTests()
extractorTests()
realTests()
console.log(`\n${passes} passed, ${failures} failed`)
process.exit(failures ? 1 : 0)
