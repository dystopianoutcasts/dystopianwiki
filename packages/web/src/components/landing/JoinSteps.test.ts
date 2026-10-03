/**
 * Tests for "Join in three steps", step 1 (T61): the Workshop collection links.
 *
 * Renders GetTheModsStep (the step JoinSteps uses) to markup with ./staticMarkup; JoinSteps itself
 * needs the Supabase client, so the test also checks by source that it renders this step.
 * node:test, run with `npx tsx --test src/components/landing/JoinSteps.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createElement } from 'react'
import { staticMarkup } from './staticMarkup'
import { GetTheModsStep } from './GetTheModsStep'

const WEB = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3812193886'
const APP = 'steam://url/CommunityFilePage/3812193886'

function render(workshop: number | null): string {
  return staticMarkup(createElement(GetTheModsStep, { workshop }))
}

/** Every <a ...>text</a> in the markup, in order, as { attrs, text }. */
function links(html: string): { attrs: string; text: string }[] {
  return [...html.matchAll(/<a ([^>]*)>(.*?)<\/a>/g)].map((m) => ({ attrs: m[1], text: m[2] }))
}

test('step 1: the web link is first, opens the https collection page in a new tab', () => {
  const [web] = links(render(null))
  assert.match(web.text, /^Open the collection on Steam$/)
  assert.ok(web.attrs.includes(`href="${WEB.replace(/&/g, '&amp;')}"`), web.attrs)
  assert.ok(web.attrs.includes('target="_blank"'))
  assert.ok(web.attrs.includes('rel="noopener noreferrer"'))
})

test('step 1: the app link opens the steam:// page, no new tab, says it needs Steam on this PC', () => {
  const [, app] = links(render(null))
  assert.match(app.text, /^Open in the Steam app/)
  assert.match(app.text, /needs Steam on this PC/)
  assert.ok(app.attrs.includes(`href="${APP}"`), app.attrs)
  assert.ok(!app.attrs.includes('target='))
})

test('step 1: two links with distinct names', () => {
  const all = links(render(null))
  assert.equal(all.length, 2)
  assert.notEqual(all[0].text, all[1].text)
})

test('step 1: TBD is gone, Subscribe to all is said, the item count shows when known', () => {
  const html = render(171)
  assert.ok(!html.includes('TBD'))
  assert.match(html, /Subscribe to all/)
  assert.match(html, /\(171 Workshop items\)/)
  assert.ok(!render(null).includes('Workshop items)'))
})

test('JoinSteps renders GetTheModsStep as step 1 and no longer reads TBD', () => {
  const src = readFileSync(new URL('./JoinSteps.tsx', import.meta.url), 'utf8')
  assert.match(src, /<GetTheModsStep workshop=\{workshop\} \/>/)
  assert.ok(!/\bTBD\b/.test(src.replace(/^\/\/.*$/gm, '')))
})
