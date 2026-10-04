/**
 * Tests for links: the donation URL must stay an https link to the host's payment page.
 *
 * node:test, run with `npx tsx --test src/lib/links.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DISCORD_URL, JOIN_PATH, JOIN_SECTION_ID, SUPPORT_URL, WORKSHOP_COLLECTION_ID, WORKSHOP_COLLECTION_STEAM_URL, WORKSHOP_COLLECTION_URL } from './links'

test('SUPPORT_URL is https on payment.indifferentbroccoli.com', () => {
  const url = new URL(SUPPORT_URL)
  assert.equal(url.protocol, 'https:')
  assert.equal(url.hostname, 'payment.indifferentbroccoli.com')
})

test('the Workshop collection: https page and steam:// app link carry the same id', () => {
  assert.equal(WORKSHOP_COLLECTION_ID, '3812193886')
  const url = new URL(WORKSHOP_COLLECTION_URL)
  assert.equal(url.protocol, 'https:')
  assert.equal(url.hostname, 'steamcommunity.com')
  assert.equal(url.searchParams.get('id'), WORKSHOP_COLLECTION_ID)
  assert.equal(WORKSHOP_COLLECTION_STEAM_URL, `steam://url/CommunityFilePage/${WORKSHOP_COLLECTION_ID}`)
})

test('DISCORD_URL is an https discord.gg invite; JOIN_PATH is the home page at #join', () => {
  const url = new URL(DISCORD_URL)
  assert.equal(url.protocol, 'https:')
  assert.equal(url.hostname, 'discord.gg')
  assert.equal(JOIN_SECTION_ID, 'join')
  assert.equal(JOIN_PATH, '/#join')
})
