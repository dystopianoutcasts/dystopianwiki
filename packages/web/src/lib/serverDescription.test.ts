/**
 * Tests for the server description's line breaks (lib/serverDescription.ts and
 * components/landing/ServerDescription.tsx).
 *
 * node:test, run with `npx tsx --test src/lib/serverDescription.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { ServerDescription } from '../components/landing/ServerDescription'
import { staticMarkup } from '../components/landing/staticMarkup'
import { descriptionLines } from './serverDescription'

function lines(text: string): string[] {
  const html = staticMarkup(createElement(ServerDescription, { text }))
  return [...html.matchAll(/<span class="hero__subtitle-line">(.*?)<\/span>/g)].map((m) => m[1])
}

test('a literal backslash-n (as PZ writes it) renders as separate lines, no backslash left', () => {
  const html = staticMarkup(createElement(ServerDescription, { text: 'a\\nb\\nc' }))
  assert.deepEqual(lines('a\\nb\\nc'), ['a', 'b', 'c'])
  assert.ok(!html.includes('\\'))
})

test('the live description splits into its three lines', () => {
  const live = '16 slots\\nOpt-in PVP, safehouses and factions. No password, just join!\\nWiki and more: dystopianoutcasts.online'
  assert.deepEqual(lines(live), [
    '16 slots',
    'Opt-in PVP, safehouses and factions. No password, just join!',
    'Wiki and more: dystopianoutcasts.online',
  ])
})

test('real line breaks split too, and empty trailing or leading lines are dropped', () => {
  assert.deepEqual(descriptionLines('a\nb\r\nc'), ['a', 'b', 'c'])
  assert.deepEqual(descriptionLines('a\\r\\nb'), ['a', 'b'])
  assert.deepEqual(descriptionLines('\\na\\nb\\n\\n'), ['a', 'b'])
  assert.deepEqual(descriptionLines('one line'), ['one line'])
})

test('text stays text: markup in the description is escaped, not rendered', () => {
  const html = staticMarkup(createElement(ServerDescription, { text: '<b>hi</b>\\nok' }))
  assert.ok(html.includes('&lt;b&gt;hi&lt;/b&gt;'))
  assert.ok(!html.includes('<b>'))
})
