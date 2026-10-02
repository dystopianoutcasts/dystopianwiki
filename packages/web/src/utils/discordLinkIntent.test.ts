/**
 * Tests for discordLinkIntent: the marks that let "Connect Discord" switch a member to the
 * account that already owns their Discord. The switch must happen only after the member
 * pressed the button, at most once, to a same-site page, and never from a stale or
 * forged mark.
 *
 * node:test, run with `npx tsx --test src/utils/discordLinkIntent.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { hasLinkIntent, rememberLinkIntent, rememberSwitched, takeLinkIntent, takeSwitched } from './discordLinkIntent'

const store = new Map<string, string>()
;(globalThis as { sessionStorage?: unknown }).sessionStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
}

beforeEach(() => store.clear())

test('no button press, no switch', () => {
  assert.equal(takeLinkIntent(), null)
  assert.equal(takeSwitched(), false)
})

test('a button press allows exactly one switch, back to the same page', () => {
  rememberLinkIntent('/vote')
  assert.equal(takeLinkIntent(), '/vote')
  assert.equal(takeLinkIntent(), null)
})

test('the return page must be on this site', () => {
  rememberLinkIntent('//evil.example/x')
  assert.equal(takeLinkIntent(), '/')
  store.set('do.discord.link', JSON.stringify({ path: 'https://evil.example', at: Date.now() }))
  assert.equal(takeLinkIntent(), null)
})

test('a stale, future-dated or malformed mark is ignored, and cleared', () => {
  store.set('do.discord.link', JSON.stringify({ path: '/vote', at: Date.now() - 11 * 60 * 1000 }))
  assert.equal(takeLinkIntent(), null)
  assert.equal(store.has('do.discord.link'), false)
  store.set('do.discord.link', JSON.stringify({ path: '/vote', at: Date.now() + 10 * 60 * 1000 }))
  assert.equal(takeLinkIntent(), null)
  store.set('do.discord.link', 'not json')
  assert.equal(takeLinkIntent(), null)
  store.set('do.discord.link', JSON.stringify({ path: '/vote' }))
  assert.equal(takeLinkIntent(), null)
})

test('checking for an intent does not use it up, and sees only fresh ones', () => {
  assert.equal(hasLinkIntent(), false)
  rememberLinkIntent('/vote')
  assert.equal(hasLinkIntent(), true)
  assert.equal(hasLinkIntent(), true)
  assert.equal(takeLinkIntent(), '/vote')
  assert.equal(hasLinkIntent(), false)
  store.set('do.discord.link', JSON.stringify({ path: '/vote', at: Date.now() - 11 * 60 * 1000 }))
  assert.equal(hasLinkIntent(), false)
  store.set('do.discord.link', JSON.stringify({ path: '/vote', at: Date.now() + 10 * 60 * 1000 }))
  assert.equal(hasLinkIntent(), false)
  store.set('do.discord.link', 'not json')
  assert.equal(hasLinkIntent(), false)
})

test('the switch notice shows once', () => {
  rememberSwitched()
  assert.equal(takeSwitched(), true)
  assert.equal(takeSwitched(), false)
})

test('without storage nothing throws and nothing switches', () => {
  const saved = (globalThis as { sessionStorage?: unknown }).sessionStorage
  ;(globalThis as { sessionStorage?: unknown }).sessionStorage = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
    removeItem: () => {
      throw new Error('blocked')
    },
  }
  try {
    rememberLinkIntent('/vote')
    assert.equal(hasLinkIntent(), false)
    assert.equal(takeLinkIntent(), null)
    rememberSwitched()
    assert.equal(takeSwitched(), false)
  } finally {
    ;(globalThis as { sessionStorage?: unknown }).sessionStorage = saved
  }
})
