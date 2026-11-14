/**
 * Tests for the hero's pictures (HeroBoone.tsx, hero-cockpit.css): the seal ring reads with pipes
 * and fills exactly one turn, every picture is hidden from screen readers and takes no clicks,
 * and the motion stops for reduced motion.
 * node:test, run with `npx tsx --test src/components/landing/HeroBoone.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement } from 'react'
import { staticMarkup } from './staticMarkup'
import { BooneFiles, BooneSeal, CockpitHud, SEAL_RING, SERVICE_RECORD } from './HeroBoone'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const css = read('../../styles/components/hero-cockpit.css').replace(/\/\*[\s\S]*?\*\//g, '')

function rule(scope: string, selector: string): string {
  const at = scope.indexOf(`${selector} {`)
  assert.ok(at >= 0, `no ${selector} rule`)
  return scope.slice(scope.indexOf('{', at) + 1, scope.indexOf('}', at))
}

test('the seal ring reads with pipes, never slashes, and is stretched to one full turn', () => {
  assert.equal(SEAL_RING, 'DYSTOPIAN OUTCASTS | ALONE | LIVING | SURVIVING | ')
  assert.ok(!SEAL_RING.includes('/'))
  const html = staticMarkup(createElement(BooneSeal))
  assert.match(html, /textLength="993"/)
  assert.match(html, /lengthAdjust="spacing"/)
})

test('the files and the cockpit are hidden from screen readers; the seal ring is too', () => {
  assert.match(staticMarkup(createElement(BooneFiles)), /^<div class="boone-files" aria-hidden="true">/)
  assert.match(staticMarkup(createElement(CockpitHud)), /^<div class="cockpit" aria-hidden="true">/)
  assert.match(staticMarkup(createElement(BooneSeal)), /<svg class="boone-seal__ring"[^>]*aria-hidden="true"/)
})

test('the service record carries its lines and the SURVIVED stamp', () => {
  const html = staticMarkup(createElement(BooneFiles))
  for (const [label, value] of SERVICE_RECORD) {
    if (label) assert.ok(html.includes(`<dt>${label}</dt>`), label)
    assert.ok(html.includes(`<dd>${value}</dd>`), value)
  }
  assert.match(html, /SURVIVED<\/span>/)
  assert.match(html, /201 FILE \| BOONE/)
})

test('the pictures take no clicks, and the tape and ring hold still for reduced motion', () => {
  assert.match(rule(css, '.cockpit'), /pointer-events:\s*none/)
  assert.match(rule(css, '.boone-files'), /pointer-events:\s*none/)
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
  assert.match(reduced, /\.cockpit__tape-strip,\s*\.boone-seal__turn \{ animation: none; \}/)
})

test('the hero renders the cockpit and the files, and drops the old banner and callsign line', () => {
  const src = read('./HeroSection.tsx')
  assert.match(src, /<CockpitHud \/>/)
  assert.match(src, /<BooneFiles \/>/)
  assert.ok(!src.includes('hero__logo'), 'the banner image is gone')
  assert.ok(!/CALLSIGN/i.test(src), 'no callsign line in the introduction')
})
