/**
 * The mobile app imports the BUILT shared package (packages/shared/dist, tracked in git), not
 * the source. This checks the built copy carries the field-notes changes, so a forgotten
 * `npm run build --workspace=packages/shared` fails here.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fieldNotesToPlainMarkdown, hasCitations } from '../../../../shared/dist/field-notes/index.js'

test('built shared dist: :cite[x] reads as x for the mobile app', () => {
  const plain = fieldNotesToPlainMarkdown('Reads it :cite[(`A.java:1`)] once.')
  assert.equal(plain, 'Reads it (`A.java:1`) once.')
})

test('built shared dist: flow label and hasCitations are present', () => {
  assert.match(fieldNotesToPlainMarkdown(':::flow[How]\n- a\n- b\n:::'), /\*\*How\*\*/)
  assert.equal(hasCitations('::field-notes\n\nText :cite[(x)].'), true)
})
