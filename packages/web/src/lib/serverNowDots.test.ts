/**
 * Tests for lib/serverNowDots.ts: the join behind useServerNow's dots carries both names (T62).
 *
 * node:test, run with `npx tsx --test src/lib/serverNowDots.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildDots, buildOnlineList } from './serverNowDots'

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

test('an offline player gets no dot even with a position row (T77)', () => {
  const dots = buildDots(
    [{ username: 'gone', display_name: 'G', online: false, is_dead: false }],
    [{ username: 'gone', x: 1, y: 1 }],
  )
  assert.deepEqual(dots, [])
})

test('the online list: every online player, dead or without a position; offline ones left out (T77)', () => {
  const players = [
    { username: 'alive', display_name: 'Al Ive', online: true, is_dead: false },
    { username: 'dead', display_name: 'De Ad', online: true, is_dead: true },
    { username: 'nopos', display_name: '', online: true, is_dead: null },
    { username: 'off', display_name: 'Of F', online: false, is_dead: false },
    { username: 'alive', display_name: 'Al Ive', online: true, is_dead: false },
  ]
  const positions = [
    { username: 'alive', x: 5, y: 6 },
    { username: 'dead', x: 7, y: 8 },
    { username: 'off', x: 9, y: 9 },
  ]
  const dots = buildDots(players, positions)
  const list = buildOnlineList(players, dots)
  assert.deepEqual(
    list.map((p) => [p.username, p.displayName, p.dot ? `${p.dot.x},${p.dot.y}` : null, p.noDot]),
    [
      ['alive', 'Al Ive', '5,6', null],
      ['dead', 'De Ad', null, 'dead'],
      ['nopos', null, null, 'no-position'],
    ],
  )
  // The dead player is listed but has no dot; the offline one is in neither.
  assert.deepEqual(
    dots.map((d) => d.username),
    ['alive'],
  )
})
