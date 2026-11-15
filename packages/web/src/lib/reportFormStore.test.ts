/**
 * Behavior tests for the "Report a problem" dialog (reportFormStore.ts): events go in (type,
 * Send, Cancel, Escape), and the state and the focus requests are checked. The network is a fake
 * that answers, never answers, or can be cancelled. node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sendReport, type ReportPage, type RpcCall, type SendOutcome } from './articleReport'
import { createReportFormStore, type FormFocus } from './reportFormStore'

const PAGE: ReportPage = { articleId: 'a1', title: 'Getting started', url: '/pz/build-42/server/setup/getting-started' }
const never = () => new Promise<never>(() => {})
const flush = () => new Promise((r) => setTimeout(r, 0))

function setup(send: (signal: AbortSignal) => Promise<SendOutcome>) {
  const focus: FormFocus[] = []
  let closed = 0
  const store = createReportFormStore({
    send: (_p, _d, signal) => send(signal),
    page: () => PAGE,
    focus: (t) => focus.push(t),
    close: () => closed++,
  })
  store.reset('')
  return { store, focus, closes: () => closed }
}
const fill = (store: ReturnType<typeof setup>['store']) => {
  store.change({ kind: 'wrong_fact', message: 'It says five, it is seven.' })
}

test('Send with nothing filled says what to fix and focuses the first refused field; nothing is sent', async () => {
  let sent = 0
  const { store, focus } = setup(async () => (sent++, { ok: true }))
  await store.submit()
  assert.equal(store.getState().send.phase, 'idle')
  const sendState = store.getState().send
  assert.ok(sendState.phase === 'idle' && sendState.problems.kind)
  assert.deepEqual(focus, ['kind'])
  store.change({ kind: 'unclear' })
  await store.submit()
  assert.deepEqual(focus, ['kind', 'message'])
  assert.equal(sent, 0)
})

test('a good send goes sending -> sent, focus moves to the thanks, and a second Send does nothing', async () => {
  let sent = 0
  const { store, focus } = setup(async () => (sent++, { ok: true }))
  fill(store)
  const p = store.submit()
  assert.equal(store.getState().send.phase, 'sending')
  const again = store.submit()
  await Promise.all([p, again])
  assert.equal(store.getState().send.phase, 'sent')
  assert.deepEqual(focus, ['done'])
  assert.equal(sent, 1)
  await store.submit()
  assert.equal(sent, 1, 'sent stays sent')
})

test('while sending no focus request is made (focus stays on the Send button, which is not disabled)', async () => {
  let release: (o: SendOutcome) => void = () => {}
  const { store, focus } = setup(() => new Promise<SendOutcome>((r) => (release = r)))
  fill(store)
  const p = store.submit()
  await flush()
  assert.equal(store.getState().send.phase, 'sending')
  assert.deepEqual(focus, [], 'nothing stole focus while the request ran')
  release({ ok: true })
  await p
})

test('after each refusal focus goes to the message, the text is kept, and Send works again', async () => {
  for (const reason of ['rate_limited', 'busy', 'not_enabled', 'network', 'invalid'] as const) {
    let calls = 0
    const { store, focus } = setup(async () => (calls++, { ok: false, reason }))
    fill(store)
    await store.submit()
    assert.deepEqual(store.getState().send, { phase: 'refused', reason })
    assert.deepEqual(focus, ['message'], reason)
    assert.equal(store.getState().draft.message, 'It says five, it is seven.', `${reason}: the text is kept`)
    await store.submit()
    assert.equal(calls, 2, `${reason}: a second try is sent`)
  }
})

test('a request that never answers ends as the network refusal at the timeout (15 s in the app)', async () => {
  const focus: FormFocus[] = []
  const call: RpcCall = () => never()
  const store = createReportFormStore({
    send: (p, d, signal) => sendReport(call, p, d, { signal, timeoutMs: 30 }),
    page: () => PAGE,
    focus: (t) => focus.push(t),
    close: () => {},
  })
  store.reset('')
  fill(store)
  await store.submit()
  assert.deepEqual(store.getState().send, { phase: 'refused', reason: 'network' })
  assert.deepEqual(focus, ['message'])
})

test('Cancel while sending aborts the request, closes the dialog, and the late answer changes nothing', async () => {
  let signal: AbortSignal | null = null
  let release: (o: SendOutcome) => void = () => {}
  const { store, focus, closes } = setup((s) => ((signal = s), new Promise<SendOutcome>((r) => (release = r))))
  fill(store)
  const p = store.submit()
  await flush()
  store.cancel()
  assert.equal((signal as AbortSignal | null)?.aborted, true)
  assert.equal(closes(), 1)
  release({ ok: true })
  await p
  assert.notEqual(store.getState().send.phase, 'sent', 'an answer after cancelling is dropped')
  assert.deepEqual(focus, [])
})

test('Escape (the dialog closing itself) while sending aborts the request the same way', async () => {
  let signal: AbortSignal | null = null
  const { store } = setup((s) => ((signal = s), never()))
  fill(store)
  void store.submit()
  await flush()
  store.dialogClosed()
  assert.equal((signal as AbortSignal | null)?.aborted, true)
})

test('opening again starts clean, on the section the reader was in', async () => {
  const { store } = setup(async () => ({ ok: true }))
  fill(store)
  await store.submit()
  assert.equal(store.getState().send.phase, 'sent')
  store.reset('Setup')
  assert.equal(store.getState().send.phase, 'idle')
  assert.equal(store.getState().draft.message, '')
  assert.equal(store.getState().draft.section, 'Setup')
})

test('editing after a refusal clears it; subscribers hear every change', async () => {
  const { store } = setup(async () => ({ ok: false, reason: 'network' }))
  let heard = 0
  const off = store.subscribe(() => heard++)
  fill(store)
  await store.submit()
  store.change({ evidence: 'Build 42.13' })
  assert.equal(store.getState().send.phase, 'idle')
  assert.ok(heard >= 4)
  off()
  const before = heard
  store.change({ evidence: 'x' })
  assert.equal(heard, before)
})
