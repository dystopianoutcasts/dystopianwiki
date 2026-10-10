/**
 * No emoji in what the web app renders (KB16).
 *
 * The site drew its section, category and menu icons as emoji (a book, a game controller, a
 * file cabinet ...), against the project's no-emoji rule; they are now drawn SVG icons
 * (components/icons). This test reads every source file of the app (TypeScript, TSX, CSS) and
 * the data files it fetches and shows (public/data), turns escapes into the characters they stand for
 * (\u{1F4D6}, surrogate pairs, &#128218;, &#x1F4DA;, CSS '\2699'), and fails on any emoji.
 *
 * "Emoji" here is Unicode's Extended_Pictographic property, which covers every emoji code point
 * including those a phone draws as emoji only sometimes (U+21A9, U+2699), plus the emoji
 * presentation selector U+FE0F and the keycap mark U+20E3. The copyright, registered and trade
 * mark signs are Extended_Pictographic too, but are ordinary text marks: they are allowed.
 * Typographic arrows such as U+2192 are not emoji and are not flagged.
 *
 * Test files are skipped (they may name a code point to test for it). node:test, run with
 * `npx tsx --test src/noEmoji.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const WEB = fileURLToPath(new URL('../', import.meta.url))
const BS = String.fromCharCode(92)

function walk(dir: string, keep: (name: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name), keep) : keep(e.name) ? [join(dir, e.name)] : [],
  )
}

/** The text with JS, HTML and CSS escapes turned into the characters they stand for. */
export function decodeEscapes(text: string): string {
  const fromCode = (hex: string) => {
    const n = parseInt(hex, 16)
    return Number.isFinite(n) && n <= 0x10ffff ? String.fromCodePoint(n) : ''
  }
  return text
    .replace(new RegExp(`${BS}${BS}u\\{([0-9a-fA-F]{1,6})\\}`, 'g'), (_, h: string) => fromCode(h))
    .replace(new RegExp(`${BS}${BS}u([0-9a-fA-F]{4})`, 'g'), (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#x([0-9a-fA-F]{1,6});/g, (_, h: string) => fromCode(h))
    .replace(/&#([0-9]{1,7});/g, (_, d: string) => fromCode(Number(d).toString(16)))
    .replace(new RegExp(`${BS}${BS}([0-9a-fA-F]{4,6}) ?`, 'g'), (_, h: string) => fromCode(h))
}

const ALLOWED = new Set(['\u00a9', '\u00ae', '\u2122'])
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/gu

/** Every emoji in a text, as "U+XXXX at line N". */
export function findEmoji(text: string): string[] {
  const out: string[] = []
  decodeEscapes(text).split('\n').forEach((line, i) => {
    for (const m of line.matchAll(EMOJI)) {
      if (ALLOWED.has(m[0])) continue
      out.push(`U+${m[0].codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')} at line ${i + 1}`)
    }
  })
  return out
}

const sources = walk(join(WEB, 'src'), (n) => /\.(tsx?|css)$/.test(n) && !/\.test\.ts$/.test(n))

// The data files the app fetches and renders (search, learning path), found in the sources, plus
// versions.json, which the live map's header reads. The legacy per-article JSON and sections.json
// under public/data are read by nothing (useWikiData is unused; articles come from the database).
const fetched = new Set<string>(['versions.json'])
for (const f of sources) {
  for (const m of readFileSync(f, 'utf8').matchAll(/fetch\(\s*['"`]\/data\/([\w./-]+\.json)['"`]/g)) fetched.add(m[1])
}
const data = [...fetched].map((rel) => join(WEB, 'public', 'data', rel))

test('the scan sees the app: sources, the icon set and the shipped navigation', () => {
  const rel = sources.map((f) => relative(WEB, f).replace(/\\/g, '/'))
  for (const f of ['src/components/icons/iconShapes.ts', 'src/components/layout/Sidebar.tsx', 'src/pages/VersionPage.tsx', 'src/config/versions.generated.ts', 'src/styles/variables.css']) {
    assert.ok(rel.includes(f), `${f} not scanned`)
  }
  assert.ok(sources.length > 100, `only ${sources.length} source files`)
  assert.deepEqual([...fetched].sort(), ['build-41/learning-path/index.json', 'search-index.json', 'versions.json'])
})

test('the decoder sees through every escape form the sources could use', () => {
  const forms = [
    "book: '\u{1F4D6}'",
    `book: '${BS}u{1F4D6}'`,
    `book: '${BS}uD83D${BS}uDCD6'`,
    '<span>&#128218;</span>',
    '<span>&#x1F4DA;</span>',
    `content: '${BS}2699 ';`,
    "gear: '\u2699\ufe0f'",
  ]
  for (const f of forms) assert.ok(findEmoji(f).length > 0, `not caught: ${f}`)
  for (const ok of ['\u00a9 2026 Dystopian Outcasts', 'Next \u2192', `content: '${BS}2713 ';`, '<kbd>\u2191\u2193</kbd>']) {
    assert.deepEqual(findEmoji(ok), [], `flagged a text mark: ${ok}`)
  }
})

test('no web source file renders an emoji', () => {
  const hits: string[] = []
  for (const f of sources) for (const h of findEmoji(readFileSync(f, 'utf8'))) hits.push(`${relative(WEB, f)}: ${h}`)
  assert.deepEqual(hits, [])
})

test('the data the app fetches and shows (navigation, search, learning path) has no emoji', () => {
  const hits: string[] = []
  for (const f of data) for (const h of findEmoji(readFileSync(f, 'utf8'))) hits.push(`${relative(WEB, f)}: ${h}`)
  assert.deepEqual(hits, [])
})
