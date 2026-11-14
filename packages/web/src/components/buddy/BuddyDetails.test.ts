/**
 * Tests for the Outcast Buddy page's pilot details (BuddyDetails.tsx, buddy-details.css): hidden
 * from screen readers, no clicks taken, the sway still for reduced motion, all three on the page.
 * node:test, run with `npx tsx --test src/components/buddy/BuddyDetails.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement } from 'react'
import { staticMarkup } from '../landing/staticMarkup'
import { ClearedStamp, PreflightTag, RemoveBeforeFlight } from './BuddyDetails'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const css = read('../../styles/components/buddy-details.css').replace(/\/\*[\s\S]*?\*\//g, '')

function rule(scope: string, selector: string): string {
  const at = scope.indexOf(`${selector} {`)
  assert.ok(at >= 0, `no ${selector} rule`)
  return scope.slice(scope.indexOf('{', at) + 1, scope.indexOf('}', at))
}

test('each detail is hidden from screen readers', () => {
  for (const c of [RemoveBeforeFlight, PreflightTag, ClearedStamp]) {
    assert.match(staticMarkup(createElement(c)), /^<span class="[^"]+" aria-hidden="true">/, c.name)
  }
  assert.match(staticMarkup(createElement(RemoveBeforeFlight)), /REMOVE BEFORE FLIGHT/)
  assert.match(staticMarkup(createElement(ClearedStamp)), /CLEARED<br><\/br>FOR TAKEOFF/)
})

test('the streamer and the stamp take no clicks; the sway stops for reduced motion', () => {
  assert.match(rule(css, '.rbf'), /pointer-events:\s*none/)
  assert.match(rule(css, '.cleared-stamp'), /pointer-events:\s*none/)
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
  assert.match(reduced, /animation:\s*none/)
})

test('the Buddy page shows all three, and rivets on the download card', () => {
  const page = read('../../pages/OutcastBuddyPage.tsx')
  for (const tag of ['<RemoveBeforeFlight />', '<PreflightTag />', '<ClearedStamp />']) assert.ok(page.includes(tag), tag)
  assert.match(page, /className="buddy__get boone-rivets"/)
})
