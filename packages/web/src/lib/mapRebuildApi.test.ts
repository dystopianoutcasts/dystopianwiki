/** Tests for mapRebuildApi: the reason mapping, the argument names the 033 functions take, and defensive parsing. */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createMapRebuildApi, failureOf, parseMapList, parseRequests } from './mapRebuildApi'
import type { RpcCall, RpcResult } from './homeSummaryRpc'

function fake(answer: RpcResult) {
  const calls: Array<{ fn: string; args: Record<string, unknown> }> = []
  const rpc: RpcCall = async (fn, args) => {
    calls.push({ fn, args })
    return answer
  }
  return { rpc, calls }
}

const ROW = {
  id: 7,
  server_id: 'srv',
  requested_by: null,
  requested_at: '2026-10-02T10:00:00Z',
  maps: ['Raven Creek B42', 'Muldraugh, KY'],
  workshop_items: ['111'],
  note: null,
  status: 'queued',
  claimed_at: null,
  claimed_by: null,
  heartbeat_at: null,
  finished_at: null,
  commit_sha: null,
  log: null,
}

test('a missing function (PGRST202) is the reason missing', () => {
  assert.deepEqual(failureOf({ message: 'Could not find the function', code: 'PGRST202' }), { reason: 'missing' })
})

test('the duplicate-request refusal (P0001) keeps its readable message', () => {
  const r = failureOf({ message: 'A map rebuild is already queued or running for this server.', code: 'P0001' })
  assert.deepEqual(r, { reason: 'refused', detail: 'A map rebuild is already queued or running for this server.' })
})

test('a permission error is login, anything else is network', () => {
  assert.equal(failureOf({ message: 'admins only', code: '42501' }).reason, 'login')
  assert.equal(failureOf({ message: 'boom' }).reason, 'network')
})

test('requests parse newest first, drop rows that are not requests, and fill defaults', () => {
  const rows = parseRequests([
    ROW,
    { ...ROW, id: 9, requested_at: '2026-10-02T12:00:00Z', status: 'running', claimed_by: 'pc', log: 'step 2' },
    { ...ROW, id: 8, status: 'weird' },
    { ...ROW, id: 'x' },
    'nope',
  ])
  assert.ok(rows)
  assert.deepEqual(rows.map((r) => r.id), [9, 7])
  assert.equal(rows[0].log, 'step 2')
  assert.equal(rows[1].note, null)
  assert.deepEqual(rows[1].maps, ['Raven Creek B42', 'Muldraugh, KY'])
  assert.equal(parseRequests({}), null)
})

test('the map list keeps strings only', () => {
  assert.deepEqual(parseMapList(['A', 3, null, 'B']), ['A', 'B'])
  assert.equal(parseMapList('A;B'), null)
})

test('fetchRequests, requestRebuild and cancelRebuild send the argument names the functions take', async () => {
  const f1 = fake({ data: [ROW], error: null })
  const r1 = await createMapRebuildApi(f1.rpc).fetchRequests('srv', 5)
  assert.ok(r1.ok)
  assert.deepEqual(f1.calls, [{ fn: 'map_rebuild_requests_admin', args: { p_server: 'srv', p_limit: 5 } }])

  const f2 = fake({ data: 12, error: null })
  const r2 = await createMapRebuildApi(f2.rpc).requestRebuild('srv', 'why')
  assert.ok(r2.ok)
  assert.equal(r2.value, 12)
  assert.deepEqual(f2.calls, [{ fn: 'request_map_rebuild', args: { p_server: 'srv', p_note: 'why' } }])

  const f3 = fake({ data: true, error: null })
  const r3 = await createMapRebuildApi(f3.rpc).cancelRebuild(12)
  assert.ok(r3.ok)
  assert.equal(r3.value, true)
  assert.deepEqual(f3.calls, [{ fn: 'cancel_map_rebuild', args: { p_id: 12 } }])
})

test('failures come back as values: refusal, missing, thrown network error, malformed answer', async () => {
  const refused = await createMapRebuildApi(fake({ data: null, error: { message: 'already queued', code: 'P0001' } }).rpc).requestRebuild('s', '')
  assert.deepEqual(refused, { ok: false, reason: 'refused', detail: 'already queued' })
  const missing = await createMapRebuildApi(fake({ data: null, error: { message: 'x', code: 'PGRST202' } }).rpc).fetchRequests('s')
  assert.deepEqual(missing, { ok: false, reason: 'missing' })
  const thrown = await createMapRebuildApi(async () => {
    throw new Error('offline')
  }).fetchServerMaps('s')
  assert.deepEqual(thrown, { ok: false, reason: 'network' })
  const bad = await createMapRebuildApi(fake({ data: { not: 'an array' }, error: null }).rpc).fetchRequests('s')
  assert.deepEqual(bad, { ok: false, reason: 'malformed' })
  const badId = await createMapRebuildApi(fake({ data: 'abc', error: null }).rpc).requestRebuild('s', '')
  assert.deepEqual(badId, { ok: false, reason: 'malformed' })
})
