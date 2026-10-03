/**
 * Tests for lib/serverNowDots.ts: the join behind useServerNow's dots carries both names (T62).
 *
 * node:test, run with `npx tsx --test src/lib/serverNowDots.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildDots } from './serverNowDots'

test('each dot carries the username, the survivor name and the survivor-name label', () => {
  const dots = buildDots(
    [
      { username: 'rax', display_name: 'fisher man', online: true, is_dead: false },
      { username: 'skye', display_name: 'fisher man', online: true, is_dead: null },
      { username: 'nobody', display_name: null, online: true, is_dead: false },
    ],
    [
      { username: 'rax', x: 10, y: 20 },
      { username: 'skye', x: 11, y: 21 },
      { username: 'nobody', x: 12, y: 22 },
    ],
  )
  assert.deepEqual(dots, [
    { id: 'rax', username: 'rax', displayName: 'fisher man', name: 'fisher man', x: 10, y: 20 },
    { id: 'skye', username: 'skye', displayName: 'fisher man', name: 'fisher man', x: 11, y: 21 },
    { id: 'nobody', username: 'nobody', displayName: null, name: 'nobody', x: 12, y: 22 },
  ])
})

test('dead players, players without a player row and non-finite positions get no dot', () => {
  const dots = buildDots(
    [
      { username: 'dead', display_name: 'D', online: true, is_dead: true },
      { username: 'ok', display_name: '', online: true, is_dead: false },
      { username: 'nan', display_name: 'N', online: true, is_dead: false },
    ],
    [
      { username: 'dead', x: 1, y: 1 },
      { username: 'ghost', x: 2, y: 2 },
      { username: 'nan', x: Number.NaN, y: 3 },
      { username: 'ok', x: 4, y: 4 },
    ],
  )
  assert.deepEqual(dots, [{ id: 'ok', username: 'ok', displayName: null, name: 'ok', x: 4, y: 4 }])
})
