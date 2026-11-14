/**
 * W2 (ledes and reading layout) and W3 (category names). node:test, run with
 * `npx tsx --test src/components/wiki/layout.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { categoryLabel } from './categoryLabel'
import { lines, render } from './testRender'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const CSS = readFileSync(join(HERE, '../../styles/components/field-notes.css'), 'utf-8')

const ARTICLE = lines(
  '::field-notes',
  '',
  'Intro before any heading.',
  '',
  '## First',
  '',
  'This is the lede.',
  '',
  'Second paragraph.',
  '',
  '## Second',
  '',
  '- a list straight after the heading',
  '',
  '## Third',
  '',
  'Another lede.',
)

test('the first paragraph directly after each h2 is a lede; no other paragraph is', () => {
  const html = render(ARTICLE)
  assert.equal((html.match(/class="fn-lede"/g) ?? []).length, 2)
  assert.match(html, /<h2>First<\/h2>\s*<p class="fn-lede">This is the lede\.<\/p>\s*<p>Second paragraph\.<\/p>/)
  assert.match(html, /<h2>Third<\/h2>\s*<p class="fn-lede">Another lede\.<\/p>/)
  assert.match(html, /<p>Intro before any heading\.<\/p>/)
})

test('a list right after an h2 is not a lede', () => {
  assert.doesNotMatch(render(ARTICLE), /<ul class="fn-lede"|<li class="fn-lede"/)
})

test('an article without the marker renders exactly as before: no lede', () => {
  const noMarker = ARTICLE.replace('::field-notes', '')
  assert.doesNotMatch(render(noMarker), /fn-lede/)
})

test('the stylesheet caps prose near 46rem, sets 17px text, and does not cap tables, cards or code', () => {
  assert.match(CSS, /\.markdown--field-notes\s*\{[^}]*font-size:\s*17px/)
  const cap = /\.markdown--field-notes > :is\(([^)]*)\)\s*\{[^}]*max-width:\s*46rem/.exec(CSS)
  assert.ok(cap, 'the prose cap rule exists')
  const tags = cap[1].split(',').map((s) => s.trim())
  for (const tag of ['p', 'ul', 'ol', 'blockquote']) assert.ok(tags.includes(tag), tag)
  for (const tag of ['table', 'pre', 'div']) assert.ok(!tags.includes(tag), tag)
  assert.match(CSS, /\.markdown--field-notes \.fn-lede\s*\{[^}]*font-weight:\s*var\(--font-weight-bold\)/)
})

test('the stylesheet hides citations with display: none (screen readers skip them) and stacks flows on a phone', () => {
  assert.match(CSS, /\.wiki-article--hide-cites \.fn-cite,\s*\.wiki-article--hide-cites \.fn-cite-col\s*\{\s*display:\s*none;/)
  assert.match(CSS, /\.fn-flow__steps\s*\{[^}]*flex-direction:\s*column/)
  assert.match(CSS, /@media \(min-width: 48rem\)\s*\{[^@]*\.fn-flow__steps\s*\{[^}]*flex-direction:\s*row/)
})

// W3

test('the category name comes from the generated navigation data', () => {
  assert.equal(categoryLabel('build-42', 'server', 'getting-started'), 'Start Here')
  assert.equal(categoryLabel('build-42', 'modding', 'lua-api'), 'Lua API')
})

test('with no data for the category: the hand-written list, then the id with spaces', () => {
  assert.equal(categoryLabel('build-42', 'nowhere', 'lua-api'), 'Lua API')
  assert.equal(categoryLabel('build-42', 'nowhere', 'weather-and-climate'), 'weather and climate')
  assert.equal(categoryLabel('no-version', 'modding', 'weather-and-climate'), 'weather and climate')
})
