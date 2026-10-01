/**
 * Tests for safeNext (the post-login redirect check) and the two helpers in
 * loginNext.ts that build on it. An open redirect here would send a member who
 * just logged in to any site an attacker names, so every refusal is pinned.
 *
 * node:test, run with `npx tsx --test src/utils/safeNext.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isMapPath, safeNext } from './safeNext'
import { loginUrlFor } from './loginNext'

test('same-site paths are returned unchanged', () => {
  for (const path of ['/', '/vote', '/map/', '/map', '/search?q=a%20b', '/pz/build-42/modding?x=1', '/settings#connected']) {
    assert.equal(safeNext(path), path, path)
  }
})

test('another site, in any spelling, is refused', () => {
  const refused = [
    '//evil.com',
    '///evil.com',
    '/\\evil.com',
    '/a\\b',
    'https://evil.com',
    'http://x',
    'HTTPS://evil.com',
    'javascript:alert(1)',
    'data:text/html,x',
    '/%2F/evil.com',
    '/%2f%2fevil.com',
    '/%5Cevil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    '/ x',
    '/%0d%0aSet-Cookie:x',
    ' /vote',
  ]
  for (const raw of refused) assert.equal(safeNext(raw), null, JSON.stringify(raw))
})

test('missing, empty, relative, malformed or over-long input is refused', () => {
  assert.equal(safeNext(null), null)
  assert.equal(safeNext(undefined), null)
  assert.equal(safeNext(''), null)
  assert.equal(safeNext('vote'), null)
  assert.equal(safeNext('/%E0%A4%A'), null)
  assert.equal(safeNext('/' + 'a'.repeat(2048)), null)
  assert.equal(safeNext('/' + 'a'.repeat(2046)), '/' + 'a'.repeat(2046))
})

test('isMapPath: the map app, not wiki pages that start with "map"', () => {
  assert.equal(isMapPath('/map'), true)
  assert.equal(isMapPath('/map/'), true)
  assert.equal(isMapPath('/map/#/'), true)
  assert.equal(isMapPath('/map?x=1'), true)
  assert.equal(isMapPath('/mapping'), false)
  assert.equal(isMapPath('/vote'), false)
})

test('loginUrlFor: carries a safe path, never a login page or another site', () => {
  assert.equal(loginUrlFor('/vote'), '/login?next=%2Fvote')
  assert.equal(loginUrlFor('/search?q=a b'.replace(' ', '%20')), '/login?next=%2Fsearch%3Fq%3Da%2520b')
  assert.equal(loginUrlFor('/login'), '/login')
  assert.equal(loginUrlFor('/login?next=%2Fvote'), '/login')
  assert.equal(loginUrlFor('/register'), '/login')
  assert.equal(loginUrlFor('//evil.com'), '/login')
  assert.equal(loginUrlFor('/loginhelp'), '/login?next=%2Floginhelp')
})
