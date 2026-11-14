/**
 * W1: code references you can hide. `:cite[...]` and "Code" table columns in a layered
 * (::field-notes) article, the Show/Hide button, the remembered choice, and the mobile text.
 * node:test, run with `npx tsx --test src/components/wiki/cite.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CodeReferencesButton } from './CodeReferencesButton'
import {
  CODE_REFERENCES_KEY,
  HIDE_CODE_REFERENCES_CLASS,
  buttonLabel,
  readHidden,
  writeHidden,
  type RefStorage,
} from './codeReferences'
import { NL, lines, render, toHtml } from './testRender'
import { fieldNotesToPlainMarkdown, hasCitations } from '../../../../shared/field-notes'

const CITED = lines(
  '::field-notes',
  '',
  '## How it works',
  '',
  'The game reads it :cite[(`StashSystem.java:120`)] once.',
)
const CODE_TABLE = lines(
  '::field-notes',
  '',
  '| Name | Code | Notes |',
  '|---|---|---|',
  '| load | `Stash.java:9` | first |',
  '| save | `Stash.java:40` | last |',
)

function memory(): RefStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) }
}
const throwing: RefStorage = {
  getItem: () => {
    throw new Error('storage blocked')
  },
  setItem: () => {
    throw new Error('storage blocked')
  },
}

// Step 1 and 5: the markup the CSS hides, only in a layered article

test(':cite renders as an fn-cite span, its markdown kept', () => {
  assert.match(render(CITED), /<span class="fn-cite">\(<code>StashSystem\.java:120<\/code>\)<\/span>/)
})

test('a "Code" column marks every th and td in it, and no other column', () => {
  const html = render(CODE_TABLE)
  assert.match(html, /<th class="fn-cite-col">Code<\/th>/)
  assert.equal((html.match(/<td class="fn-cite-col">/g) ?? []).length, 2)
  assert.match(html, /<th>Name<\/th>/)
  assert.match(html, /<th>Notes<\/th>/)
  assert.match(html, /<td>first<\/td>/)
})

test('only a header cell that is exactly "Code" counts', () => {
  const html = render(lines('::field-notes', '', '| Source code | Codes |', '|---|---|', '| a | b |'))
  assert.doesNotMatch(html, /fn-cite-col/)
})

test('an article without ::field-notes is left as it was: :cite stays text, no column class', () => {
  const noMarker = lines('## Head', '', 'Text :cite[(x)] here.', '', '| Code |', '|---|', '| y |')
  const html = render(noMarker)
  assert.doesNotMatch(html, /fn-cite/)
  assert.match(html, /:cite\[\(x\)\]/)
})

test('a citation in a code block is not a citation', () => {
  const md = lines('::field-notes', '', '```', ':cite[(x)]', '```')
  assert.equal(hasCitations(md), false)
  assert.doesNotMatch(render(md), /fn-cite/)
})

test('hasCitations: true for a :cite or a Code column, false for neither or no marker', () => {
  assert.equal(hasCitations(CITED), true)
  assert.equal(hasCitations(CODE_TABLE), true)
  assert.equal(hasCitations(lines('::field-notes', '', '## Plain', '', 'No references.')), false)
  assert.equal(hasCitations(lines('## Head', '', 'Text :cite[(x)] here.')), false)
  assert.equal(hasCitations(lines('::field-notes', '', '| Source code | Notes |', '|---|---|', '| a | b |')), false)
})

// Steps 2 to 4: the button, in sync with one state

test('the button names the action, controls the article body, and has no aria-pressed', () => {
  const hidden = toHtml(CodeReferencesButton({ hidden: true, onToggle: () => {} }))
  assert.match(hidden, /<button type="button" class="code-refs-button" aria-controls="article-content"[^>]*>Show code references<\/button>/)
  const shown = toHtml(CodeReferencesButton({ hidden: false, onToggle: () => {} }))
  assert.match(shown, />Hide code references<\/button>/)
  assert.doesNotMatch(hidden + shown, /aria-pressed/)
  assert.equal(buttonLabel(true), 'Show code references')
  assert.equal(buttonLabel(false), 'Hide code references')
})

test('two buttons given the same state read the same (header and contents list stay in sync)', () => {
  for (const hidden of [true, false]) {
    const a = toHtml(CodeReferencesButton({ hidden, onToggle: () => {} }))
    const b = toHtml(CodeReferencesButton({ hidden, onToggle: () => {} }))
    assert.equal(a, b)
  }
})

test('the button is a real button with visible text (no icon-only control)', () => {
  const html = toHtml(CodeReferencesButton({ hidden: true, onToggle: () => {} }))
  assert.match(html, /^<button /)
  assert.doesNotMatch(html, /<svg|<img/)
})

test('the hide class is the one the stylesheet uses', () => {
  assert.equal(HIDE_CODE_REFERENCES_CLASS, 'wiki-article--hide-cites')
})

// Step 3: remembered, and safe without storage

test('default is hidden; the choice is remembered', () => {
  const store = memory()
  assert.equal(readHidden(store), true)
  assert.equal(writeHidden(store, false), true)
  assert.equal(store.data.get(CODE_REFERENCES_KEY), 'shown')
  assert.equal(readHidden(store), false)
  writeHidden(store, true)
  assert.equal(readHidden(store), true)
})

test('blocked storage: no error, default hidden, writing reports false', () => {
  assert.equal(readHidden(throwing), true)
  assert.equal(writeHidden(throwing, false), false)
  assert.equal(readHidden(null), true)
  assert.equal(writeHidden(null, false), false)
})

test('an unknown stored value reads as hidden', () => {
  const store = memory()
  store.data.set(CODE_REFERENCES_KEY, 'banana')
  assert.equal(readHidden(store), true)
})

// Mobile

test('mobile plain Markdown: :cite[x] reads as its inline text x', () => {
  const plain = fieldNotesToPlainMarkdown(CITED)
  assert.match(plain, /The game reads it \(`StashSystem\.java:120`\) once\./)
  assert.doesNotMatch(plain, /:cite/)
})

test('mobile: :cite with attributes, two on a line, and code blocks untouched', () => {
  const md = lines('A :cite[(one)]{x=1} and :cite[(two)].', '```', ':cite[(keep)]', '```')
  const plain = fieldNotesToPlainMarkdown(md).split(NL)
  assert.equal(plain[0], 'A (one) and (two).')
  assert.equal(plain[2], ':cite[(keep)]')
})

test('an aligned Code column keeps its alignment', () => {
  const html = render(lines('::field-notes', '', '| Name | Code |', '|:--|--:|', '| a | `X.java:1` |'))
  assert.match(html, /<th style="textAlign:left">Name<\/th>/)
  assert.match(html, /<th class="fn-cite-col" style="textAlign:right">Code<\/th>/)
  assert.match(html, /<td class="fn-cite-col" style="textAlign:right">/)
})

test('hasCitations ignores :cite shown as code, and reads **Code** like the renderer', () => {
  assert.equal(hasCitations(lines('::field-notes', '', 'Write `:cite[(x)]` to cite.')), false)
  assert.equal(hasCitations(lines('::field-notes', '', 'Write ``:cite[(x)]`` to cite.')), false)
  assert.equal(hasCitations(lines('::field-notes', '', 'Real :cite[(`A.java:1`)] and `code`.')), true)
  const bold = lines('::field-notes', '', '| Name | **Code** |', '|---|---|', '| a | `X.java:1` |')
  assert.equal(hasCitations(bold), true)
  assert.match(render(bold), /<th class="fn-cite-col"><strong>Code<\/strong><\/th>/)
})
