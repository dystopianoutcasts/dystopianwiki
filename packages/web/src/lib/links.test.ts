/**
 * Tests for links: the donation URL must stay an https link to the host's payment page.
 *
 * node:test, run with `npx tsx --test src/lib/links.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SUPPORT_URL } from './links'

test('SUPPORT_URL is https on payment.indifferentbroccoli.com', () => {
  const url = new URL(SUPPORT_URL)
  assert.equal(url.protocol, 'https:')
  assert.equal(url.hostname, 'payment.indifferentbroccoli.com')
})
