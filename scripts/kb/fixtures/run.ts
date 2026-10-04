#!/usr/bin/env tsx
/**
 * Fixture test for the article lint (scripts/kb/lint-articles.ts).
 *
 * For every rule: a fixture that must be flagged and one that must pass, checked through
 * lintText(). Then the command line in temporary content folders: exit codes, --drafts,
 * the allowlist (a matching entry, a stale entry, a malformed file). Every temporary folder
 * is removed at the end.
 *
 * All fixture values are invented: example paths, documentation addresses (192.0.2.x),
 * example.com mail, obviously fake tokens.
 *
 * Usage:
 *   npx tsx scripts/kb/fixtures/run.ts
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { lintText, RuleId } from '../lint-articles'

const KB_DIR = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(KB_DIR, '..', '..')
const TSX_CLI = path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs')
const LINT = path.join(KB_DIR, 'lint-articles.ts')

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

const FM = ['---', 'title: Fixture', 'slug: fixture', '---', '', '# Fixture', ''].join('\n')

/** Rule fixtures: `bad` lines must each be flagged by the rule, `good` must not be. */
const CASES: { rule: RuleId; bad: string[]; good: string[] }[] = [
  {
    rule: 'local-path',
    bad: [
      'Open R:\\Example\\file.lua in an editor.',
      'The log is at C:\\Users\\someone\\Zomboid\\console.txt here.',
      'Forward slashes too: D:/Example/folder/file.txt',
      'From Git Bash: /r/ZOMBOID/Example/file.lua',
      'Or /c/Users/someone/Zomboid/mods',
      'A home folder: /home/someone/Zomboid/server.ini',
      'A Mac home: /Users/someone/Zomboid/mods',
      'A tilde path: ~/projects/example-mod/file.lua',
    ],
    good: [
      'The file is media/lua/client/ISUI/ISExample.lua in the game.',
      'Scripts live in media/scripts/items_example.txt.',
      'Your mods folder is %UserProfile%\\Zomboid\\mods on Windows.',
      'On Linux it is ~/Zomboid/mods.',
      'See https://example.com/c/Users/page for nothing at all.',
      'Call self:getModData() and then obj:update().',
    ],
  },
  {
    rule: 'private-detail',
    bad: [
      'Connect to 192.0.2.10 on port 16261.',
      'The key is eyJhbGciOiJGQUtFIn0.ZmFrZS1wYXlsb2Fk here.',
      'A key like sb_example_not_a_real_key_000 must not appear.',
      'A hash-like token deadbeefdeadbeefdeadbeefdeadbeef00 here.',
      'A blob QmFzZTY0IGZha2UgdG9rZW4gZm9yIGEgdGVzdCBmaXh0dXJlIDEyMw== here.',
      'Password=not-a-real-one',
      'RCONPassword = "not-real-either"',
      'secret: fake-secret-value',
      'Mail someone@example.com for access.',
      'Session 00000000-0000-4000-8000-000000000000 ran it.',
      'originSessionId: fixture',
      'node_type: memory',
    ],
    good: [
      'Build 42.13.0 changed it; Build 42.20.4.1 and version 1.2.3.4 are not addresses.',
      'Bind to 127.0.0.1 or 0.0.0.0 for local tests.',
      'Set Password= in servertest.ini to your own value.',
      'Password=<your password>',
      'The revision a2b3c4d5e6 is short enough to be a citation.',
      'ISVehicleMechanicsExampleWindowWithAVeryLongName is a class name.',
      'media/lua/client/Vehicles/ISUI/ISVehicleMechanicsExample.lua is a path.',
      'The @Override annotation is Java.',
      'But here is the secret: the basic pattern is five lines.',
      '**The Beautiful Secret:**',
      'self.passwordInput:setMasked(true)',
      'local password = getExamplePassword()',
      'media/models_X/vehicles/Vehicles_Example123_BodyPart999.fbx is a model.',
      'See notes/01-example-project-summer-anatomy-of-a-thing.md:122 for it.',
    ],
  },
  {
    rule: 'inside-voice',
    bad: [
      'The owner asked for this change.',
      'Our server\'s config sets it to 3.',
      'It worked on my machine.',
      'We found it in this session.',
      'The planner wrote the brief.',
    ],
    good: ['A server owner sets this option.', 'Each session of the game starts fresh.', 'We planned the change.'],
  },
  {
    rule: 'proof-shape',
    bad: [
      '> **Proof:** Code. zombie.example.Example#update.',
      '> **Proof:** Tested. zombie.example.Example#update. Build 42.20.4.',
      '> **Proof:** Code. Build 42.20.4.',
      '> **Proof:**',
      '> Proof: Code. zombie.example.Example#update. Build 42.20.4.',
      '>**Proof:** Code. zombie.example.Example#update. Build 42.20.4.',
    ],
    good: [
      '> **Proof:** Code. zombie.example.Example#update. Build 42.20.4.',
      '> **Proof:** Server test. Seen in the server log on a test server. Build 42.20.4.',
      '> **Proof:** Game test. Seen in single player. Build a2b3c4d5e6.',
      '> **Proof:** Reported. From the Example Mod by Example Author. Build 42.13.0.',
      '> **Proof:** Unknown. We read media/lua/client/ISUI/ISExample.lua and found no caller. Build 42.20.4.',
    ],
  },
  {
    rule: 'emoji',
    bad: [
      'Done \u{2705} here.',
      'Fire \u{1F525} here.',
      'Check \u{2714}\u{FE0F} here.',
      'Heavy check \u{2714} here.',
      'Flag \u{1F1FA}\u{1F1F8} here.',
      'Keycap 1\u{FE0F}\u{20E3} here.',
    ],
    good: [
      'Copyright \u{00A9} and trademark \u{2122} are typography.',
      'Arrows \u{2192} and \u{2194} are allowed.',
      'Plain ASCII -> and [COMPLETE].',
      'Box drawing \u{2500}\u{2502} is fine.',
    ],
  },
]

for (const c of CASES) {
  c.bad.forEach((line, n) => {
    const f = lintText('fixture.md', `${FM}${line}\n`)
    const hit = f.filter((x) => x.rule === c.rule)
    check(`${c.rule}: flags bad fixture ${n + 1}`, hit.length > 0 && hit[0].line === 7, JSON.stringify(f))
  })
  c.good.forEach((line, n) => {
    const f = lintText('fixture.md', `${FM}${line}\n`)
    const hit = f.filter((x) => x.rule === c.rule)
    check(`${c.rule}: passes good fixture ${n + 1}`, hit.length === 0, JSON.stringify(hit))
  })
}

// private-detail never prints the value it found.
{
  const f = lintText('fixture.md', `${FM}Mail someone@example.com now.\n`)
  check('private-detail: value is not in the message', f.length > 0 && !f[0].message.includes('example.com'))
}

// proof-shape: a proof wrapped onto further quote lines is judged as one paragraph.
{
  const good = `${FM}> **Proof:** Code. \`zombie.example.Example#run\`,\n> \`zombie.example.Other#call\`. Build 42.20.4.\n`
  check(
    'proof-shape: passes a well-formed proof wrapped over two lines',
    lintText('fixture.md', good).filter((x) => x.rule === 'proof-shape').length === 0,
  )
  const bad = `${FM}> **Proof:** Code. \`zombie.example.Example#run\`,\n> \`zombie.example.Other#call\`.\n`
  const f = lintText('fixture.md', bad).filter((x) => x.rule === 'proof-shape')
  check('proof-shape: flags a wrapped proof with no build', f.length === 1 && f[0].line === 7, JSON.stringify(f))
}

// verified-without-proof: section-scoped, provenance and fences ignored.
{
  const bad = `${FM}## A section\n\nThis was verified in game.\n\n## Next\n\n> **Proof:** Code. zombie.example.Example#run. Build 42.20.4.\n`
  const f = lintText('fixture.md', bad).filter((x) => x.rule === 'verified-without-proof')
  check('verified-without-proof: flags a section with no proof', f.length === 1 && f[0].line === 9, JSON.stringify(f))

  const good = `${FM}## A section\n\nThis was confirmed in the code.\n\n> **Proof:** Code. zombie.example.Example#run. Build 42.20.4.\n`
  check(
    'verified-without-proof: passes a section with a proof line',
    lintText('fixture.md', good).filter((x) => x.rule === 'verified-without-proof').length === 0,
  )

  const prov = `${FM}> Source: example.md (compiled 2026-01-01, verified against Project Zomboid 42.0). Imported 2026-01-02.\n\n\`\`\`lua\n-- verified here in code\n\`\`\`\nThis is unverified.\n`
  check(
    'verified-without-proof: ignores provenance, code fences and "unverified"',
    lintText('fixture.md', prov).filter((x) => x.rule === 'verified-without-proof').length === 0,
  )
}

// Fences: inside-voice and proof-shape skip code; local-path still applies inside code.
{
  const t = `${FM}\`\`\`\nthe owner\n> **Proof:** wrong\nR:\\Example\\file.lua\n\`\`\`\n`
  const f = lintText('fixture.md', t)
  check('fences: inside-voice and proof-shape skip code', !f.some((x) => x.rule === 'inside-voice' || x.rule === 'proof-shape'))
  check('fences: local-path applies inside code', f.some((x) => x.rule === 'local-path' && x.line === 10), JSON.stringify(f))
}

// Frontmatter is checked for paths and voice.
{
  const t = `---\ntitle: Fixture\nexcerpt: Kept at R:\\Example\\notes, says the owner.\n---\n\n# Fixture\n`
  const f = lintText('fixture.md', t)
  check('frontmatter: local-path and inside-voice found', f.some((x) => x.rule === 'local-path' && x.line === 3) && f.some((x) => x.rule === 'inside-voice' && x.line === 3))
}

/* ------------------------------------------------------------------ command line */

const temps: string[] = []
function tempRoot(files: Record<string, string>): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-lint-'))
  temps.push(d)
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true })
    fs.writeFileSync(path.join(d, rel), text)
  }
  return d
}

function run(args: string[]): { code: number; out: string } {
  const r = spawnSync(process.execPath, [TSX_CLI, LINT, ...args], { encoding: 'utf-8', cwd: REPO_ROOT })
  return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

const CLEAN = `${FM}Plain text about media/lua/client/ISUI/ISExample.lua.\n`
const PATH_LINE = 'Open R:\\Example\\file.lua in an editor.'
const DIRTY = `${FM}${PATH_LINE}\n`
const WARN_ONLY = `${FM}The owner asked for it.\n`

try {
  {
    const root = tempRoot({ 'articles/pz/a.md': CLEAN })
    const r = run(['--root', root, '--allow', path.join(root, 'none.json')])
    check('cli: clean tree exits 0', r.code === 0, r.out)
  }
  {
    const root = tempRoot({ 'articles/pz/a.md': DIRTY })
    const r = run(['--root', root, '--allow', path.join(root, 'none.json')])
    check('cli: an ERROR exits 1', r.code === 1, r.out)
    check('cli: reports file, line and rule', r.out.includes('articles/pz/a.md:7  ERROR  local-path'), r.out)
  }
  {
    const root = tempRoot({ 'articles/pz/a.md': WARN_ONLY })
    const r = run(['--root', root, '--allow', path.join(root, 'none.json')])
    check('cli: WARN only exits 0', r.code === 0 && r.out.includes('WARN  inside-voice'), r.out)
  }
  {
    const root = tempRoot({ 'articles/pz/a.md': CLEAN, 'drafts/pz/b.md': DIRTY })
    const without = run(['--root', root, '--allow', path.join(root, 'none.json')])
    const withDrafts = run(['--drafts', '--root', root, '--allow', path.join(root, 'none.json')])
    check('cli: drafts skipped by default', without.code === 0, without.out)
    check('cli: --drafts lints drafts', withDrafts.code === 1 && withDrafts.out.includes('drafts/pz/b.md:7'), withDrafts.out)
  }
  {
    const root = tempRoot({ 'articles/pz/a.md': DIRTY })
    const allow = path.join(root, 'allow.json')
    fs.writeFileSync(allow, JSON.stringify([{ file: 'articles/pz/a.md', rule: 'local-path', line: PATH_LINE, reason: 'fixture' }]))
    const r = run(['--root', root, '--allow', allow])
    check('allowlist: an exact entry turns the ERROR into ALLOWED, exit 0', r.code === 0 && r.out.includes('ALLOWED (fixture)'), r.out)
  }
  {
    const root = tempRoot({ 'articles/pz/a.md': DIRTY })
    const allow = path.join(root, 'allow.json')
    fs.writeFileSync(allow, JSON.stringify([{ file: 'articles/pz/a.md', rule: 'local-path', line: 'some other line', reason: 'fixture' }]))
    const r = run(['--root', root, '--allow', allow])
    check('allowlist: a different line text does not allow, exit 1', r.code === 1, r.out)
    check('allowlist: an entry that matches nothing is reported', r.out.includes('entry matches nothing'), r.out)
  }
  {
    const root = tempRoot({ 'articles/pz/a.md': DIRTY })
    const allow = path.join(root, 'allow.json')
    fs.writeFileSync(allow, JSON.stringify([{ file: 'articles/pz/a.md', rule: 'local-path', line: PATH_LINE, reason: 'fixture' }]))
    const r = run(['--root', root, '--allow', allow])
    const other = tempRoot({ 'articles/pz/a.md': `${FM}${PATH_LINE}\nSecond R:\\Example\\other.lua\n` })
    const r2 = run(['--root', other, '--allow', allow])
    check('allowlist: only the exact line is allowed', r.code === 0 && r2.code === 1 && r2.out.includes('a.md:8  ERROR  local-path'), r2.out)
  }
  {
    const root = tempRoot({ 'articles/pz/a.md': CLEAN })
    const allow = path.join(root, 'allow.json')
    fs.writeFileSync(allow, JSON.stringify([{ file: 'articles/pz/a.md', rule: 'local-path', line: PATH_LINE, reason: '' }]))
    const r = run(['--root', root, '--allow', allow])
    check('allowlist: an entry without a reason exits 2', r.code === 2, r.out)
    fs.writeFileSync(allow, '{ not json')
    const r2 = run(['--root', root, '--allow', allow])
    check('allowlist: malformed JSON exits 2', r2.code === 2, r2.out)
  }
  {
    const r = run(['--no-such-flag'])
    check('cli: unknown argument exits 2', r.code === 2, r.out)
  }
  {
    const r = run(['--allow', path.join(os.tmpdir(), 'kb-lint-no-such-allow.json'), '--root', path.join(os.tmpdir(), 'kb-lint-no-such-root')])
    check('cli: a root without articles exits 2', r.code === 2, r.out)
  }
  {
    const repoAllow = path.join(KB_DIR, 'lint-allow.json')
    let ok = true
    try {
      const data = JSON.parse(fs.readFileSync(repoAllow, 'utf-8'))
      ok = Array.isArray(data)
    } catch {
      ok = false
    }
    check('repo allowlist parses as an array', ok)
  }
} finally {
  for (const d of temps) fs.rmSync(d, { recursive: true, force: true })
}

console.log('')
console.log(`${passes} passed, ${failures} failed`)
process.exit(failures > 0 ? 1 : 0)
