/**
 * W5: `:::flow` step diagrams. node:test, run with `npx tsx --test src/components/wiki/flow.test.ts`
 * from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { lines, render } from './testRender'
import { fieldNotesToPlainMarkdown } from '../../../../shared/field-notes'

const FLOW = lines(
  '::field-notes',
  '',
  ':::flow[How a map becomes a stash]',
  '- Draw the map',
  '- Annotate it',
  '- Read it :cite[(`Map.java:3`)]',
  '- Find the stash',
  ':::',
)

test('a flow is an ordered list, one list item per step, so a screen reader hears "list, 4 items"', () => {
  const html = render(FLOW)
  assert.equal((html.match(/<ol /g) ?? []).length, 1)
  assert.equal((html.match(/<li class="fn-flow__step">/g) ?? []).length, 4)
  assert.equal((html.match(/<div class="fn-flow__box">/g) ?? []).length, 4)
  assert.match(html, /<ol class="fn-flow__steps" aria-labelledby="fn-flow-1">/)
})

test('the label is the list name and a visible caption', () => {
  const html = render(FLOW)
  assert.match(html, /<p class="fn-flow__caption" id="fn-flow-1">How a map becomes a stash<\/p>/)
})

test('arrows are decorative, empty and between steps only (3 for 4 steps)', () => {
  const html = render(FLOW)
  const arrows = html.match(/<span class="fn-flow__arrow" aria-hidden="true"><\/span>/g) ?? []
  assert.equal(arrows.length, 3)
  assert.doesNotMatch(html, /Find the stash<\/div>\s*<span/)
})

test('a flow without a label has no caption and no aria-labelledby', () => {
  const html = render(lines(':::flow', '1. One', '2. Two', ':::'))
  assert.doesNotMatch(html, /fn-flow__caption|aria-labelledby/)
  assert.equal((html.match(/<li /g) ?? []).length, 2)
})

test('two flows in one article get their own caption ids', () => {
  const html = render(lines(':::flow[A]', '- a1', '- a2', ':::', '', ':::flow[B]', '- b1', '- b2', ':::'))
  assert.match(html, /id="fn-flow-1"/)
  assert.match(html, /id="fn-flow-2"/)
})

test('a step keeps its inline markup', () => {
  const html = render(lines(':::flow', '- **Draw** the `map`', '- Next', ':::'))
  assert.match(html, /<div class="fn-flow__box"><strong>Draw<\/strong> the <code>map<\/code><\/div>/)
})

test('mobile plain Markdown keeps the steps as a list under a bold caption', () => {
  const plain = fieldNotesToPlainMarkdown(FLOW)
  assert.match(plain, /\*\*How a map becomes a stash\*\*/)
  assert.match(plain, /- Draw the map/)
  assert.doesNotMatch(plain, /:::flow/)
})
