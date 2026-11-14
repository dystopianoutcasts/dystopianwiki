/**
 * Tests for Boone's details (BooneDetails.tsx, boone-details.css) and the footer radio chatter
 * (layout/RadioChatter.tsx): pictures stay hidden from screen readers and out of the way of
 * clicks, the narrow layouts drop the extra holes, motion stops for reduced motion, and the
 * chatter always picks a real line.
 * node:test, run with `npx tsx --test src/components/landing/BooneDetails.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement } from 'react'
import { staticMarkup } from './staticMarkup'
import { CrackedLens, DOG_TAG_LINES, DogTag, StrafingRun } from './BooneDetails'
import { CHATTER_LINES, chatterLine, RadioChatter } from '../layout/RadioChatter'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const css = read('../../styles/components/boone-details.css').replace(/\/\*[\s\S]*?\*\//g, '')

/** The declarations of the first rule whose selector is exactly `selector`, inside `scope`. */
function rule(scope: string, selector: string): string {
  const at = scope.indexOf(`${selector} {`)
  assert.ok(at >= 0, `no ${selector} rule`)
  return scope.slice(scope.indexOf('{', at) + 1, scope.indexOf('}', at))
}

test('each detail is one svg, hidden from screen readers and from keyboard focus', () => {
  for (const c of [StrafingRun, DogTag, CrackedLens]) {
    const html = staticMarkup(createElement(c))
    assert.match(html, /^<svg [^>]*aria-hidden="true"/, c.name)
    assert.match(html, /^<svg [^>]*focusable="false"/, c.name)
    assert.equal(html.match(/<svg /g)?.length, 1, c.name)
  }
})

test('the strafing run is five holes; three are dropped on narrow screens', () => {
  const html = staticMarkup(createElement(StrafingRun))
  assert.equal(html.match(/<use /g)?.length, 5)
  assert.equal(html.match(/boone-strafe__hole--extra/g)?.length, 3)
  const narrow = css.slice(css.indexOf('@media (max-width: 1024px)'))
  assert.match(rule(narrow, '.boone-strafe__hole--extra'), /display:\s*none/)
})

test('the dog tag carries its four lines, each with an emboss layer', () => {
  const html = staticMarkup(createElement(DogTag))
  for (const line of DOG_TAG_LINES) {
    assert.equal(html.split(`>${line}</text>`).length - 1, 2, line)
  }
})

test('the strafe, the crack and the tag box never take a click or a drag; only the tag plate hovers', () => {
  assert.match(rule(css, '.boone-strafe'), /pointer-events:\s*none/)
  assert.match(rule(css, '.boone-crack'), /pointer-events:\s*none/)
  assert.match(rule(css, '.boone-tag'), /pointer-events:\s*none/)
  assert.match(rule(css, '.boone-tag__plate'), /pointer-events:\s*auto/)
})

test('the tag swing stops for reduced motion', () => {
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
  assert.match(rule(reduced, '.boone-tag:hover .boone-tag__swing'), /animation:\s*none/)
})

test('the crack sits outside the scrolling map, so it stays put while the map moves', () => {
  const src = read('./ServerNow.tsx')
  const frame = src.indexOf('className="server-now__frame"')
  const viewport = src.indexOf('className="server-now__viewport"')
  const crack = src.indexOf('<CrackedLens />')
  assert.ok(frame >= 0 && frame < viewport && viewport < crack, 'frame, then viewport, then crack')
  assert.match(rule(css, '.server-now__frame'), /position:\s*relative/)
})

test('the sections render their detail', () => {
  assert.match(read('./SurvivorsBoard.tsx'), /<StrafingRun \/>/)
  assert.match(read('./AboutSection.tsx'), /<DogTag \/>/)
  assert.match(read('../layout/Footer.tsx'), /<RadioChatter \/>/)
})

test('chatter: every random number picks a real line, and the ends stay in range', () => {
  for (const r of [0, 0.1, 0.5, 0.999999, 1, -0.2]) {
    assert.ok((CHATTER_LINES as readonly string[]).includes(chatterLine(r)), String(r))
  }
  assert.equal(chatterLine(0), CHATTER_LINES[0])
  assert.equal(chatterLine(0.999999), CHATTER_LINES[CHATTER_LINES.length - 1])
  const html = staticMarkup(createElement(RadioChatter, { random: 0 }))
  assert.match(html, /^<p class="footer__radio"><span class="footer__radio-channel">CH 7<\/span> Ringtail, say status/)
})
