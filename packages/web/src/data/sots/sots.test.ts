/**
 * The State of the Server issue data: every page has its image on disk, a title and readable
 * text. node:test, run with `npx tsx --test src/data/sots/sots.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { CURRENT_SOTS, sotsContents } from './index'

const PUBLIC = fileURLToPath(new URL('../../../public', import.meta.url))

test('every page image and the cover exist under public/', () => {
  for (const src of [CURRENT_SOTS.cover, ...CURRENT_SOTS.pages.map((p) => p.src)]) {
    assert.ok(existsSync(PUBLIC + src), `missing ${src}`)
  }
})

test('pages are numbered 1..N in order, each with a title, a size and text', () => {
  CURRENT_SOTS.pages.forEach((page, i) => {
    assert.equal(page.n, i + 1)
    assert.ok(page.title.length > 0)
    assert.ok(page.width > 0 && page.height > 0)
    assert.ok(page.lines.length > 0, `page ${page.n} has no text`)
  })
})

test('the text holds no broken characters from the PDF', () => {
  for (const page of CURRENT_SOTS.pages) {
    for (const line of page.lines) assert.ok(!line.includes('�'), `page ${page.n}: ${line}`)
  }
})

test('contents lists one entry per section, starting at the cover', () => {
  const contents = sotsContents(CURRENT_SOTS)
  assert.equal(contents[0].n, 1)
  assert.ok(contents.every((p) => !p.title.endsWith('(continued)')))
})
