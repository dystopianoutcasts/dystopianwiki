/**
 * Tests for hashTargetId: which element id a location hash names (KB05, /#join).
 *
 * node:test, run with `npx tsx --test src/lib/hashTarget.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hashTargetId } from './hashTarget'

test('a hash names the id after the #', () => {
  assert.equal(hashTargetId('#join'), 'join')
  assert.equal(hashTargetId('#how-it-works'), 'how-it-works')
})

test('no hash, a bare # or blank names nothing', () => {
  assert.equal(hashTargetId(''), null)
  assert.equal(hashTargetId('#'), null)
  assert.equal(hashTargetId('#%20'), null)
})

test('escapes are decoded; a broken escape names nothing instead of throwing', () => {
  assert.equal(hashTargetId('#caf%C3%A9'), 'café')
  assert.equal(hashTargetId('#%E0%A4%A'), null)
})
