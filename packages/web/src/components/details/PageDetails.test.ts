/**
 * Tests for the main pages' details (PageDetails.tsx, page-details.css): the panel codes, the stamp
 * with pipes, everything hidden from screen readers and taking no clicks, and each on its page.
 * node:test, run with `npx tsx --test src/components/details/PageDetails.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement } from 'react'
import { staticMarkup } from '../landing/staticMarkup'
import { CoffeeRing, FiledStamp, panelCode, StencilCode } from './PageDetails'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const css = read('../../styles/components/page-details.css').replace(/\/\*[\s\S]*?\*\//g, '')

function rule(selector: string): string {
  const at = css.indexOf(`${selector} {`)
  assert.ok(at >= 0, `no ${selector} rule`)
  return css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at))
}

test('panel codes: three letters, the section place, then the category place', () => {
  assert.equal(panelCode('modding', 1), 'MOD-02')
  assert.equal(panelCode('modding', 1, 2), 'MOD-02.3')
  assert.equal(panelCode('how-the-game-works', 9), 'HOW-10')
  assert.equal(panelCode('42', 0), 'SEC-01')
})

test('the stamp reads FILED | season, with a pipe', () => {
  assert.match(staticMarkup(createElement(FiledStamp, { label: 'Fall 2026' })), /FILED \| FALL 2026/)
})

test('every detail is hidden from screen readers and takes no clicks', () => {
  assert.match(staticMarkup(createElement(FiledStamp, { label: 'x' })), /^<span class="filed-stamp" aria-hidden="true">/)
  assert.match(staticMarkup(createElement(CoffeeRing)), /^<svg class="coffee-ring"[^>]*aria-hidden="true"/)
  assert.match(staticMarkup(createElement(StencilCode, { code: 'MOD-02' })), /^<span class="stencil-code" aria-hidden="true">MOD-02<\/span>$/)
  for (const s of ['.filed-stamp', '.coffee-ring', '.stencil-code']) assert.match(rule(s), /pointer-events:\s*none/, s)
})

test('State of the Server and the section pages carry their details', () => {
  const sots = read('../../pages/SotsPage.tsx')
  assert.match(sots, /<FiledStamp label=\{issue\.season\} \/>/)
  assert.match(sots, /<CoffeeRing \/>/)
  assert.equal(sots.match(/<Tape side=/g)?.length, 2)
  const section = read('../../pages/SectionPage.tsx')
  assert.match(section, /<StencilCode code=\{panelCode\(section, sectionIndex\)\} \/>/)
  assert.match(section, /<StencilCode code=\{panelCode\(section, sectionIndex, categoryIndex\)\} small \/>/)
})
