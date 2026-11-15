/**
 * Tests for runAbortable (abortable.ts): a request that gives up after a timeout, can be
 * cancelled, and drops a late answer. node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { REQUEST_TIMEOUT_MS, runAbortable } from './abortable'

const never = () => new Promise<never>(() => {})

test('the timeout is about 15 seconds', () => {
  assert.equal(REQUEST_TIMEOUT_MS, 15000)
})

test('an answer comes back as a value', async () => {
  assert.deepEqual(await runAbortable(async () => 7), { aborted: false, value: 7 })
})

test('a request that never answers gives up at the timeout, even if it ignores the signal', async () => {
  const started = Date.now()
  const r = await runAbortable(never, undefined, 30)
  assert.deepEqual(r, { aborted: true, reason: 'timeout' })
  assert.ok(Date.now() - started < 1000)
})

test('the signal handed to the request fires at the timeout, so fetch stops', async () => {
  let seen: AbortSignal | null = null
  await runAbortable((s) => ((seen = s), never()), undefined, 20)
  assert.equal((seen as AbortSignal | null)?.aborted, true)
})

test('cancelling stops it at once and says cancelled, not timeout', async () => {
  const c = new AbortController()
  const pending = runAbortable(never, c.signal, 5000)
  c.abort()
  assert.deepEqual(await pending, { aborted: true, reason: 'cancelled' })
  assert.deepEqual(await runAbortable(async () => 1, c.signal), { aborted: true, reason: 'cancelled' }, 'an already cancelled signal starts nothing')
})

test('a fetch that rejects with an abort error is a give-up; any other failure still throws', async () => {
  const r = await runAbortable(
    (signal) =>
      new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
      }),
    undefined,
    20,
  )
  assert.deepEqual(r, { aborted: true, reason: 'timeout' })
  await assert.rejects(runAbortable(async () => {
    throw new TypeError('boom')
  }), /boom/)
})
