import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import { HOME_SUMMARY_FN, HOME_SUMMARY_TZ_FN, TZ_RETRY_MS, callHomeSummary, dayCaption, isMissingFunction, resetTzProbe, type RpcResult } from './homeSummaryRpc'

const MISSING: RpcResult = { data: null, error: { message: 'Could not find the function aurora.home_summary_tz(p_server, p_tz)', code: 'PGRST202' } }
const TWO = (tz: string): RpcResult => ({ data: { day_tz: tz }, error: null })
const ONE: RpcResult = { data: { day_tz: null }, error: null }

/** An rpc whose answer depends on whether p_tz was sent; records every call. */
function fake(withTz: () => RpcResult) {
  const calls: Array<{ fn: string; args: Record<string, unknown> }> = []
  const rpc = async (fn: string, args: Record<string, unknown>) => {
    calls.push({ fn, args })
    return 'p_tz' in args ? withTz() : ONE
  }
  return { rpc, calls }
}

beforeEach(() => resetTzProbe())

test('the zone is sent with the server, to the one named function', async () => {
  const f = fake(() => TWO('America/Chicago'))
  assert.deepEqual(await callHomeSummary(f.rpc, 'srv', 'America/Chicago'), { day_tz: 'America/Chicago' })
  assert.deepEqual(f.calls, [{ fn: HOME_SUMMARY_TZ_FN, args: { p_server: 'srv', p_tz: 'America/Chicago' } }])
})

test('with no zone the one-argument form is used and p_tz is not sent', async () => {
  const f = fake(() => TWO('x'))
  await callHomeSummary(f.rpc, 'srv', undefined)
  assert.deepEqual(f.calls, [{ fn: HOME_SUMMARY_FN, args: { p_server: 'srv' } }])
})

test('a missing two-argument form falls back, is remembered, and is retried after five minutes', async () => {
  let live = false
  const f = fake(() => (live ? TWO('America/Chicago') : MISSING))
  const t0 = 1_000_000
  assert.deepEqual(await callHomeSummary(f.rpc, 's', 'America/Chicago', t0), { day_tz: null })
  assert.equal(f.calls.length, 2, 'tried the zone form, then the old one')
  await callHomeSummary(f.rpc, 's', 'America/Chicago', t0 + 60_000)
  assert.equal(f.calls.length, 3, 'inside the window only the old form is asked')
  assert.ok(!('p_tz' in f.calls[2].args))
  live = true
  assert.deepEqual(await callHomeSummary(f.rpc, 's', 'America/Chicago', t0 + TZ_RETRY_MS), { day_tz: 'America/Chicago' }, 'works once 030 is applied, no reload')
  assert.equal(f.calls.length, 4)
})

test('any other error is a failure, not a fallback', async () => {
  const f = fake(() => ({ data: null, error: { message: 'boom', code: '500' } }))
  assert.equal(await callHomeSummary(f.rpc, 's', 'UTC'), null)
  assert.equal(f.calls.length, 1)
})

test('missing-function detection', () => {
  assert.ok(isMissingFunction({ message: 'x', code: 'PGRST202' }))
  assert.ok(isMissingFunction({ message: 'Could not find the function aurora.home_summary' }))
  assert.ok(!isMissingFunction({ message: 'permission denied' }))
})

test('the caption names whose midnight it is', () => {
  assert.equal(dayCaption('America/Chicago', 'America/Chicago'), 'Today means since midnight your time.')
  assert.equal(dayCaption(null, 'America/Chicago'), 'Today means since midnight US Eastern.')
  assert.equal(dayCaption('America/New_York', 'America/Chicago'), 'Today means since midnight in America/New_York.')
  assert.equal(dayCaption('America/Chicago', undefined), 'Today means since midnight in America/Chicago.')
})
