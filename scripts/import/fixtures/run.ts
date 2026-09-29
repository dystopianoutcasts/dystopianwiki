#!/usr/bin/env tsx
/**
 * Fixture test for the Build 42 import tool and link checker.
 *
 * Imports scripts/import/fixtures/manifest.json into a temporary --out folder, asserts
 * the output, runs the link checker against it, checks that an invalid manifest is
 * rejected without writing, then removes every temporary folder.
 *
 * Usage:
 *   npx tsx scripts/import/fixtures/run.ts
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import matter from 'gray-matter'

const FIXTURES = __dirname
const IMPORT_DIR = path.resolve(FIXTURES, '..')
const REPO_ROOT = path.resolve(IMPORT_DIR, '..', '..')
const TSX_CLI = path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs')
const IMPORTER = path.join(IMPORT_DIR, 'import-b42.ts')
const CHECKER = path.join(IMPORT_DIR, 'check-links.ts')
const MANIFEST = path.join(FIXTURES, 'manifest.json')
const BAD_MANIFEST = path.join(FIXTURES, 'bad-manifest.json')

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

function run(script: string, args: string[]): { code: number; out: string } {
  const r = spawnSync(process.execPath, [TSX_CLI, script, ...args], { encoding: 'utf-8', cwd: REPO_ROOT })
  return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  const walk = (d: string): void => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else out.push(path.relative(dir, p).split(path.sep).join('/'))
    }
  }
  walk(dir)
  return out.sort()
}

function read(root: string, rel: string): { data: Record<string, unknown>; content: string; raw: string } {
  const raw = fs.readFileSync(path.join(root, rel), 'utf-8')
  const { data, content } = matter(raw)
  return { data, content, raw }
}

const temps: string[] = []
function tempDir(label: string): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), `b42-import-${label}-`))
  temps.push(d)
  return d
}

const P = 'articles/pz/build-42/mapping/fixtures'
const EXPECTED = [
  `${P}/bracketed-part.md`,
  `${P}/first-part.md`,
  `${P}/links-article.md`,
  `${P}/plain-article.md`,
  `${P}/second.md`,
  `${P}/split-guide.md`,
  'drafts/pz/build-42/modding/fixture-extras/special-topic.md',
]

try {
  // 1. Import into a temporary content root.
  const out = tempDir('out')
  const first = run(IMPORTER, ['--manifest', MANIFEST, '--out', out])
  console.log(first.out.trim().split('\n').map((l) => `  | ${l}`).join('\n'))
  check('import exits 0', first.code === 0, `exit ${first.code}`)
  check(
    'summary line counts manifests, entries, articles and links',
    /1 manifests, 4 entries, 7 articles written, 10 links rewritten, 1 links downgraded/.test(first.out),
  )

  const files = listFiles(out)
  check('exactly the expected output paths are written', JSON.stringify(files) === JSON.stringify(EXPECTED), `got ${JSON.stringify(files)}`)

  // 2. The fenced "## " line did not split, skip_headings dropped the TOC.
  const firstPart = read(out, `${P}/first-part.md`)
  check('no article was created for the fenced "## This is not a heading"', !files.some((f) => f.includes('not-a-heading')))
  check('the fenced heading stays inside the first part', firstPart.content.includes('```markdown\n## This is not a heading\n[not a link](plain.md)\n```'))
  check('skip_headings dropped "Table of Contents"', !files.some((f) => f.includes('table-of-contents')))

  // 3. Split structure, parts override, frontmatter.
  const index = read(out, `${P}/split-guide.md`)
  check(
    'index lists the parts in source order by site path',
    index.content.includes('1. [First part](/pz/build-42/mapping/fixtures/first-part)\n2. [The second part](/pz/build-42/mapping/fixtures/second)'),
  )
  check('index body starts with the H1 then the provenance line', /^# Split guide\n\n> Source: split\.md \(compiled 2026-08-02, verified against Project Zomboid 42\.20\)\. Imported \d{4}-\d{2}-\d{2}\. Confidence tags in the text are the original author's\.\n/.test(index.content))
  check('index does not contain the only_headings section', !index.content.includes('Special topic text'))
  check('part H2 became the H1 with numbering stripped', firstPart.content.startsWith('# First part\n'))
  check('H3 inside a part stays H3', firstPart.content.includes('\n### Deep sub\n'))
  const second = read(out, `${P}/second.md`)
  check('parts override sets slug and title', second.data.slug === 'second' && second.data.title === 'The second part' && second.content.startsWith('# The second part\n'))
  const bracketed = read(out, `${P}/bracketed-part.md`)
  check('trailing bracketed groups are dropped from a default part slug and title', bracketed.data.slug === 'bracketed-part' && bracketed.data.title === 'Bracketed part')
  check('a bare leading number is dropped from a default part slug and title', !String(bracketed.data.slug).startsWith('3') && !String(bracketed.data.title).startsWith('3'))
  check('the article body keeps the full heading text', bracketed.content.startsWith('# Bracketed part [CONFIRMED — pzwiki Lua (API), revid 1390433] (see note)\n'))
  check('tables survive byte-for-byte', second.content.includes('| a | b |\n|---|---|\n| 1 | 2 |'))
  check('frontmatter id is build-42-{slug}', firstPart.data.id === 'build-42-first-part')
  check('related_articles lists sibling parts', JSON.stringify(firstPart.data.related_articles) === '["second","bracketed-part"]' && JSON.stringify(index.data.related_articles) === '["first-part","second","bracketed-part"]')
  check('excerpt is the first paragraph without markdown', read(out, `${P}/plain-article.md`).data.excerpt === 'This is the plain fixture. It has bold, inline code and a link to the split guide in its first paragraph, which becomes the excerpt.')
  check('same-file anchor to another part is rewritten', firstPart.content.includes('[the second part](/pz/build-42/mapping/fixtures/second)'))
  check('same-file anchor inside the same part is kept', firstPart.content.includes('[a deep anchor](#deep-sub)'))

  // 4. only_headings: same source, second entry, drafts target.
  const special = read(out, 'drafts/pz/build-42/modding/fixture-extras/special-topic.md')
  check('only_headings entry emits only its section', special.content.includes('Special topic text') && !special.content.includes('First part text'))
  check('only_headings entry uses its own provenance override', special.content.includes('(compiled 2026-08-03, verified against Project Zomboid 42.20)'))
  check('a heading anchor resolves to the entry that emits it', firstPart.content.includes('[the special topic](/pz/build-42/modding/fixture-extras/special-topic)'))

  // 5. Cross links, downgrade, untouched links.
  const links = read(out, `${P}/links-article.md`).content
  check('cross link to the plain file is rewritten', links.includes('[plain](/pz/build-42/mapping/fixtures/plain-article)'))
  check('anchor on a non-split target is preserved', links.includes('[plain with anchor](/pz/build-42/mapping/fixtures/plain-article#plain-fixture)'))
  check('bare link to a twice-mapped source goes to the entry without only_headings', links.includes('[split index](/pz/build-42/mapping/fixtures/split-guide)'))
  check('anchor matching a part heading points at the part', links.includes('[split second part](/pz/build-42/mapping/fixtures/second)'))
  check('anchor matching a sub-heading points into its part', links.includes('[split deep anchor](/pz/build-42/mapping/fixtures/first-part#deep-sub)'))
  check('unknown .md link is downgraded to a local reference', links.includes('- unknown doc (local reference: missing-doc.md)'))
  check('line-wrapped link with a title is rewritten', links.includes('[a line-wrapped\n  link](/pz/build-42/mapping/fixtures/plain-article "with a title")'))
  check(
    'external, mailto, image and non-markdown links are untouched',
    links.includes('[external](https://example.com/page.md)') && links.includes('[mail](mailto:someone@example.com)') && links.includes('![an image](pic.png)') && links.includes('[a script](tool.lua)'),
  )
  check('links in code spans and fences are untouched', links.includes('`[code span](plain.md)`') && links.includes('```\n[fenced](plain.md)\n```'))

  // 6. Idempotent: a second run writes the same bytes and the same set of files.
  const snapshot = new Map(files.map((f) => [f, fs.readFileSync(path.join(out, f), 'utf-8')]))
  const again = run(IMPORTER, ['--manifest', MANIFEST, '--out', out])
  const same = again.code === 0 && listFiles(out).length === files.length && files.every((f) => fs.readFileSync(path.join(out, f), 'utf-8') === snapshot.get(f))
  check('a second run is idempotent (same files, same bytes)', same)

  // 7. The link checker passes on the output and reports the draft targets separately.
  const cl = run(CHECKER, ['--root', out])
  console.log(cl.out.trim().split('\n').map((l) => `  | ${l}`).join('\n'))
  check('check-links exits 0 on the fixture output', cl.code === 0, `exit ${cl.code}`)
  check('check-links reports the draft targets separately', /Draft target \(2\)/.test(cl.out))

  // 8. The link checker fails on a dead link and a duplicate slug.
  fs.writeFileSync(
    path.join(out, P, 'broken.md'),
    '---\nslug: second\ntitle: Broken\n---\n# Broken\n\nSee [nowhere](/pz/build-42/mapping/fixtures/nowhere).\n',
  )
  const bad = run(CHECKER, ['--root', out])
  check('check-links exits 1 on a dead link', bad.code === 1, `exit ${bad.code}`)
  check('dead link is reported as file:line -> target', bad.out.includes('articles/pz/build-42/mapping/fixtures/broken.md:7 -> /pz/build-42/mapping/fixtures/nowhere'))
  check('duplicate slug is reported', /slug "second" is used by/.test(bad.out))

  // 9. --dry-run writes nothing.
  const dry = tempDir('dry')
  const dr = run(IMPORTER, ['--manifest', MANIFEST, '--out', dry, '--dry-run'])
  check('--dry-run exits 0, prints the plan and writes nothing', dr.code === 0 && dr.out.includes('[PLAN]') && listFiles(dry).length === 0)

  // 10. An invalid manifest is rejected with every error and nothing written.
  const badOut = tempDir('bad')
  const bm = run(IMPORTER, ['--manifest', BAD_MANIFEST, '--out', badOut])
  check('invalid manifest exits 1 and writes nothing', bm.code === 1 && listFiles(badOut).length === 0, `exit ${bm.code}`)
  const expectedErrors = [
    '"slug" "Bad_Slug" does not match',
    '"skip_headings" and "only_headings" cannot both be set',
    '"split" must be one of',
    'unknown key "skip_heading"',
    'source file not found',
    'only_headings "No such heading" matches no H2',
    'duplicate output path',
  ]
  const missing = expectedErrors.filter((e) => !bm.out.includes(e))
  check('invalid manifest lists every error', missing.length === 0, `missing: ${missing.join(' | ')}`)
} finally {
  for (const d of temps) fs.rmSync(d, { recursive: true, force: true })
  const left = temps.filter((d) => fs.existsSync(d))
  console.log(left.length === 0 ? `Temporary folders removed (${temps.length}).` : `[ERROR] could not remove: ${left.join(', ')}`)
}

console.log(`\n${passes} passed, ${failures} failed`)
process.exit(failures === 0 ? 0 : 1)
