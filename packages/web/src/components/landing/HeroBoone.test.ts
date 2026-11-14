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
import { BooneFiles, BooneSeal, CockpitHud, LENS_CRACKS, SEAL_RING, SERVICE_RECORD } from './HeroBoone'

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

test('the service record carries its lines and the SURVIVED stamp, without the seal', () => {
  const html = staticMarkup(createElement(BooneFiles))
  for (const [label, value] of SERVICE_RECORD) {
    if (label) assert.ok(html.includes(`<dt>${label}</dt>`), label)
    assert.ok(html.includes(`<dd>${value}</dd>`), value)
  }
  assert.match(html, /SURVIVED<\/span>/)
  assert.match(html, /201 FILE \| BOONE/)
  assert.ok(!html.includes('boone-seal'), 'the seal stays in the hero')
})

test('the pictures take no clicks, and the tape and ring hold still for reduced motion', () => {
  assert.match(rule(css, '.cockpit'), /pointer-events:\s*none/)
  assert.match(rule(css, '.boone-files'), /pointer-events:\s*none/)
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
  assert.match(reduced, /\.cockpit__tape-strip,\s*\.boone-seal__turn,\s*\.boone-seal__glint,/)
  assert.match(reduced, /focus-visible\) \.boone-seal__glint \{ animation: none; \}/)
})

test('the hero shows the seal only; the files sit by About, the cockpit over the live map', () => {
  const hero = read('./HeroSection.tsx')
  assert.match(hero, /<BooneSeal cracks=\{cracks\} \/>/)
  assert.ok(!hero.includes('<BooneFiles') && !hero.includes('<CockpitHud'), 'the hero has neither')
  assert.ok(!hero.includes('hero__logo'), 'the banner image is gone')
  assert.ok(!/CALLSIGN/i.test(hero), 'no callsign line in the introduction')
  assert.match(read('./AboutSection.tsx'), /<BooneFiles \/>/)
  const map = read('./ServerNow.tsx')
  assert.ok(map.indexOf('<CockpitHud />') > map.indexOf('className="server-now__viewport"'), 'cockpit after the scrolling map')
  assert.ok(map.indexOf('<CockpitHud />') < map.indexOf('<CrackedLens />'), 'and under the crack')
  assert.match(read('../../pages/HomePage.tsx'), /hero-cockpit\.css/)
})

test('each tap on the goggle adds one set of cracks, three at most, and replays the glint', () => {
  const runs = (cracks: number) => (staticMarkup(createElement(BooneSeal, { cracks })).match(/class="boone-seal__crack"/g) ?? []).length
  assert.equal(runs(0), 0)
  assert.equal(runs(1), LENS_CRACKS[0].length)
  assert.equal(runs(2), LENS_CRACKS[0].length + LENS_CRACKS[1].length)
  assert.equal(runs(3), LENS_CRACKS.flat().length)
  assert.equal(runs(9), LENS_CRACKS.flat().length)
  assert.match(staticMarkup(createElement(BooneSeal)), /<span class="boone-seal__glint"><\/span>/)
  const hero = read('./HeroSection.tsx')
  assert.match(hero, /<button[^>]*className="hero__goggle"[^>]*aria-label="Tap Boone's cracked goggle"/s)
  assert.match(hero, /<BooneSeal cracks=\{cracks\} \/>/)
  assert.match(rule(css, '.hero__goggle'), /width: max\(14%, 44px\)/)
})
