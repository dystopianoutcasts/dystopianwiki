/** Tests for the "Live map tiles" panel's pure rules: present/missing/hidden, the helper exclusion, the slug fallback, and when the render PC counts as unreachable. */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ageText,
  classifyMaps,
  isOpen,
  mapSlug,
  parseTilesInfo,
  renderedLine,
  requestLine,
  requestPhase,
  waitingForRenderPc,
} from './mapPanel'
import type { RebuildRequest } from './mapRebuildApi'

const NOW = Date.parse('2026-10-02T12:00:00Z')
const MIN = 60 * 1000

function req(over: Partial<RebuildRequest>): RebuildRequest {
  return {
    id: 1,
    serverId: 's',
    requestedAt: new Date(NOW - 1 * MIN).toISOString(),
    maps: [],
    note: null,
    status: 'queued',
    claimedAt: null,
    claimedBy: null,
    heartbeatAt: null,
    finishedAt: null,
    commitSha: null,
    log: null,
    ...over,
  }
}

test('slug: lower case, other runs to one hyphen, trimmed', () => {
  assert.equal(mapSlug('Raven Creek B42'), 'raven-creek-b42')
  assert.equal(mapSlug('Constown, KY'), 'constown-ky')
  assert.equal(mapSlug('  --Odd__Name!! '), 'odd__name')
  assert.equal(mapSlug('!!!'), '')
})

test('vanilla is base and first; a map with an overlay is present; one without is missing', () => {
  const c = classifyMaps(
    ['Raven Creek B42', 'RaccoonCity', 'Muldraugh, KY'],
    [{ id: 'raven-creek-b42', mapName: 'Raven Creek B42' }],
  )
  assert.deepEqual(c.rows, [
    { name: 'Muldraugh, KY', state: 'base' },
    { name: 'Raven Creek B42', state: 'present' },
    { name: 'RaccoonCity', state: 'missing' },
  ])
  assert.deepEqual(c.hidden, [])
})

test('the two helper entries are not places: never a row, never missing', () => {
  const c = classifyMaps(['Lawnmower', 'Vehicle Spawn Zones', ' lawnmower ', 'Muldraugh, KY'], [])
  assert.deepEqual(c.rows, [{ name: 'Muldraugh, KY', state: 'base' }])
})

test('an overlay with no mapName matches by the map slug', () => {
  const c = classifyMaps(['Constown, KY'], [{ id: 'constown-ky', mapName: null }])
  assert.deepEqual(c.rows, [{ name: 'Constown, KY', state: 'present' }])
  assert.deepEqual(c.hidden, [])
})

test('mapName matching ignores case; a different mapName with a different id does not match', () => {
  const hit = classifyMaps(['Raven Creek B42'], [{ id: 'rc', mapName: 'raven creek b42' }])
  assert.equal(hit.rows[0].state, 'present')
  const miss = classifyMaps(['Raven Creek B42'], [{ id: 'rc', mapName: 'Raven Creek' }])
  assert.equal(miss.rows[0].state, 'missing')
  assert.deepEqual(miss.hidden, ['Raven Creek'])
})

test('overlays the server no longer runs are hidden (tiles kept), labelled by mapName or id', () => {
  const c = classifyMaps(
    ['Muldraugh, KY'],
    [
      { id: 'raven-creek-b42', mapName: 'Raven Creek B42' },
      { id: 'old-town', mapName: null },
    ],
  )
  assert.deepEqual(c.hidden, ['Raven Creek B42', 'old-town'])
})

test('a helper entry never keeps an overlay alive', () => {
  const c = classifyMaps(['Lawnmower'], [{ id: 'lawnmower', mapName: 'Lawnmower' }])
  assert.deepEqual(c.hidden, ['Lawnmower'])
})

test('tiles.json: overlays and renderedAt are read, a file with no overlays has none, junk is null', () => {
  assert.deepEqual(parseTilesInfo({ source: { renderedAt: '2026-09-30' } }), { overlays: [], renderedAt: '2026-09-30' })
  assert.deepEqual(
    parseTilesInfo({ overlays: [{ id: 'a', mapName: 'A' }, { id: '' }, 5, { id: 'b' }], source: {} }),
    { overlays: [{ id: 'a', mapName: 'A' }, { id: 'b', mapName: null }], renderedAt: null },
  )
  assert.equal(parseTilesInfo([]), null)
  assert.equal(parseTilesInfo('x'), null)
})

test('waiting for the render PC: queued for two minutes or more, and only queued', () => {
  assert.equal(waitingForRenderPc(req({ requestedAt: new Date(NOW - 119 * 1000).toISOString() }), NOW), false)
  assert.equal(waitingForRenderPc(req({ requestedAt: new Date(NOW - 2 * MIN).toISOString() }), NOW), true)
  assert.equal(waitingForRenderPc(req({ requestedAt: new Date(NOW - 3 * MIN).toISOString() }), NOW), true)
  assert.equal(waitingForRenderPc(req({ requestedAt: new Date(NOW - 30 * MIN).toISOString(), status: 'running' }), NOW), false)
  assert.equal(waitingForRenderPc(req({ requestedAt: 'not a date' }), NOW), false)
})

test('the phase and the line tell queued, waiting, running, done, failed and cancelled apart', () => {
  assert.equal(requestPhase(req({}), NOW), 'queued')
  assert.equal(requestPhase(req({ requestedAt: new Date(NOW - 3 * MIN).toISOString() }), NOW), 'waiting')
  assert.match(requestLine(req({ requestedAt: new Date(NOW - 3 * MIN).toISOString() }), NOW), /Waiting for the render PC/)
  assert.doesNotMatch(requestLine(req({}), NOW), /^Waiting for the render PC\./)
  const running = req({ status: 'running', claimedAt: new Date(NOW - 10 * MIN).toISOString(), heartbeatAt: new Date(NOW - 1 * MIN).toISOString() })
  assert.match(requestLine(running, NOW), /Rebuilding now, started 10 min ago\. Last heartbeat 1 min ago/)
  assert.match(requestLine(req({ status: 'done', finishedAt: '2026-10-02T11:00:00Z', commitSha: 'abcdef1234567' }), NOW), /commit abcdef1\./)
  assert.match(requestLine(req({ status: 'failed', finishedAt: '2026-10-02T11:00:00Z' }), NOW), /failed/)
  assert.match(requestLine(req({ status: 'cancelled', finishedAt: '2026-10-02T11:00:00Z' }), NOW), /cancelled/)
})

test('auto refresh while a request is open', () => {
  assert.equal(isOpen(req({ status: 'queued' })), true)
  assert.equal(isOpen(req({ status: 'running' })), true)
  assert.equal(isOpen(req({ status: 'done' })), false)
  assert.equal(isOpen(req({ status: 'failed' })), false)
  assert.equal(isOpen(null), false)
})

test('age text and the rendered line', () => {
  assert.equal(ageText(new Date(NOW - 20 * 1000).toISOString(), NOW), 'just now')
  assert.equal(ageText(new Date(NOW - 5 * MIN).toISOString(), NOW), '5 min ago')
  assert.equal(ageText(new Date(NOW - 3 * 60 * MIN).toISOString(), NOW), '3 h ago')
  assert.equal(ageText(null, NOW), 'never')
  assert.match(renderedLine('2026-09-30'), /^Map tiles rendered /)
  assert.match(renderedLine(null), /unknown/)
})
