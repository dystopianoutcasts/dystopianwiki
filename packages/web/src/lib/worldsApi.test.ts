/** Tests for worldsApi: the reason mapping, the argument names the T47 functions take, and defensive parsing. */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWorldsApi, failureOf, parseLeftovers, parseWorlds } from './worldsApi'
import type { RpcCall, RpcResult } from './homeSummaryRpc'

function fake(answer: RpcResult) {
  const calls: Array<{ fn: string; args: Record<string, unknown> }> = []
  const rpc: RpcCall = async (fn, args) => {
    calls.push({ fn, args })
    return answer
  }
  return { rpc, calls }
}

const WORLD = { world_id: 'w1', seq: 2, exporter_world_id: null, status: 'current', detected_by: 'migration', started_at: '2026-10-02T09:00:00Z', ended_at: null, world_age_hours_at_start: 0, note: null }

test('a missing function (PGRST202) is the reason missing', () => {
  assert.deepEqual(failureOf({ message: 'Could not find the function aurora.worlds_admin', code: 'PGRST202' }), { reason: 'missing' })
})

test('P0001 is a refusal and keeps the server message as detail', () => {
  const r = failureOf({ message: 'The new world started more than 24 hours ago', code: 'P0001' })
  assert.deepEqual(r, { reason: 'refused', detail: 'The new world started more than 24 hours ago' })
})

test('a permission error is login, anything else is network', () => {
  assert.equal(failureOf({ message: 'permission denied', code: '42501' }).reason, 'login')
  assert.equal(failureOf({ message: 'boom' }).reason, 'network')
})

test('success returns the parsed rows, newest first', async () => {
  const f = fake({ data: [WORLD, { ...WORLD, world_id: 'w2', seq: 3, status: 'pending', detected_by: 'exporter', exporter_world_id: 'abc' }], error: null })
  const r = await createWorldsApi(f.rpc).fetchWorlds('srv')
  assert.ok(r.ok)
  assert.deepEqual(r.value.map((w) => w.seq), [3, 2])
  assert.equal(r.value[1].exporterWorldId, null)
  assert.deepEqual(f.calls, [{ fn: 'worlds_admin', args: { p_server: 'srv' } }])
})

test('a thrown call is network, a non-array is malformed', async () => {
  const boom = createWorldsApi(async () => {
    throw new Error('x')
  })
  assert.deepEqual(await boom.undoNewWorld('s'), { ok: false, reason: 'network' })
  assert.deepEqual(await createWorldsApi(fake({ data: { a: 1 }, error: null }).rpc).fetchWorlds('s'), { ok: false, reason: 'malformed' })
})

test('each write sends the T47 argument names', async () => {
  const f = fake({ data: null, error: null })
  const api = createWorldsApi(f.rpc)
  await api.startNewWorld('srv', 'wiped')
  await api.confirmPendingWorld('srv', 'w9')
  await api.dismissPendingWorld('srv', 'w9')
  await api.undoNewWorld('srv')
  assert.deepEqual(f.calls, [
    { fn: 'start_new_world', args: { p_server: 'srv', p_note: 'wiped' } },
    { fn: 'confirm_pending_world', args: { p_server: 'srv', p_world_id: 'w9' } },
    { fn: 'dismiss_pending_world', args: { p_server: 'srv', p_world_id: 'w9' } },
    { fn: 'undo_new_world', args: { p_server: 'srv' } },
  ])
})

test('a refused undo carries the message', async () => {
  const f = fake({ data: null, error: { message: 'Too late to undo', code: 'P0001' } })
  assert.deepEqual(await createWorldsApi(f.rpc).undoNewWorld('s'), { ok: false, reason: 'refused', detail: 'Too late to undo' })
})

test('rows that are not worlds are dropped', () => {
  assert.equal(parseWorlds([WORLD, { seq: 1 }, 'x', { ...WORLD, status: 'weird' }])?.length, 1)
})

test('leftovers keep only positive counts and the pending row', () => {
  const l = parseLeftovers({ vehicles: 4, safehouses: 0, vehicle_claims_stale: 2, pending: { world_id: 'p1', started_at: '2026-10-02T09:00:00Z', world_age_hours_at_start: 300 } })
  assert.ok(l)
  assert.deepEqual(l.counts, [{ key: 'vehicles', count: 4 }])
  assert.equal(l.vehicleClaimsStale, 2)
  assert.equal(l.pending?.worldId, 'p1')
  assert.equal(parseLeftovers({ pending: null })?.pending, null)
})
