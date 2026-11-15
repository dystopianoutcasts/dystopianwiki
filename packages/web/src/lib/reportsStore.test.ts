/**
 * Behavior tests for the admin Reports section (reportsStore.ts): events go in (pick a filter,
 * open a report, Save, Delete report, Keep, Close), and the state and the focus requests are
 * checked, against an in-memory fake of the database functions. node:test, run with `npm test`
 * from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createReportsApi, type AdminReport, type ReportsRpc } from './articleReportsAdmin'
import { createReportsStore, type AdminFocus } from './reportsStore'

const mk = (id: string, patch: Partial<Record<string, unknown>> = {}) => ({
  id,
  created_at: '2026-11-15T15:00:00Z',
  article_id: 'a1',
  article_slug: 'getting-started',
  article_version: '2026-11-01T00:00:00Z',
  article_title: 'Getting started',
  article_url: '/pz/build-42/server/setup/getting-started',
  section: 'Setup',
  kind: 'wrong_fact',
  message: 'It says five.',
  evidence: '',
  reporter_name: null,
  status: 'new',
  admin_note: '',
  reviewed_by_name: null,
  reviewed_at: null,
  note_updated_by_name: null,
  note_updated_at: null,
  ...patch,
})

function fake(opts: { hang?: Set<string>; timeoutMs?: number } = {}) {
  let rows = [mk('r1'), mk('r2', { status: 'fixed' })]
  const calls: string[] = []
  const rpc: ReportsRpc = (name, args) => {
    calls.push(name)
    if (opts.hang?.has(name)) return new Promise(() => {})
    if (name === 'article_reports_admin') {
      const s = args?.p_status
      return Promise.resolve({ data: rows.filter((r) => s === 'all' || r.status === s), error: null })
    }
    if (name === 'article_reports_new_count') return Promise.resolve({ data: rows.filter((r) => r.status === 'new').length, error: null })
    if (name === 'article_report_update') {
      rows = rows.map((r) => (r.id === args?.p_id ? { ...r, status: args?.p_status as string, admin_note: String(args?.p_note) } : r))
      return Promise.resolve({ data: 'ok', error: null })
    }
    if (name === 'article_report_delete') {
      rows = rows.filter((r) => r.id !== args?.p_id)
      return Promise.resolve({ data: 'ok', error: null })
    }
    return Promise.resolve({ data: null, error: { message: 'x' } })
  }
  const focus: AdminFocus[] = []
  const store = createReportsStore(createReportsApi(rpc, { timeoutMs: opts.timeoutMs }), (t) => focus.push(t), () => '2026-11-15T20:00:00Z')
  return { store, focus, calls }
}
const firstReport = (s: ReturnType<typeof fake>['store']): AdminReport => {
  const l = s.getState().load
  assert.equal(l.state, 'ready')
  return (l as { reports: AdminReport[] }).reports[0]
}

test('the list loads New by default, with the count of new reports; each filter reloads', async () => {
  const { store } = fake()
  await store.reload()
  const s = store.getState()
  assert.equal(s.filter, 'new')
  assert.equal(s.load.state === 'ready' && s.load.reports.length, 1)
  assert.equal(s.newCount, 1)
  await store.setFilter('fixed')
  assert.equal(store.getState().filter, 'fixed')
  assert.equal(firstReport(store).id, 'r2')
  await store.setFilter('confirmed')
  const l = store.getState().load
  assert.equal(l.state === 'ready' && l.reports.length, 0, 'an empty filter is an empty list, which the view words')
})

test('before migration 048 the list is an error, not an empty list', async () => {
  const api = createReportsApi(async () => ({ data: null, error: { code: 'PGRST202', message: 'Could not find the function' } }))
  const store = createReportsStore(api, () => {})
  await store.reload()
  assert.deepEqual(store.getState().load, { state: 'error', reason: 'missing' })
})

test('open, change the status and note, Save: it says saved, records who and when, and refreshes the list', async () => {
  const { store, calls } = fake()
  await store.reload()
  store.openReport(firstReport(store))
  store.setStatus('confirmed')
  store.setNote('  Checked.  ')
  await store.save()
  const s = store.getState()
  assert.deepEqual(s.saveNote, { kind: 'saved' })
  assert.equal(s.saving, false)
  assert.equal(s.open?.status, 'confirmed')
  assert.equal(s.open?.adminNote, 'Checked.')
  assert.equal(s.open?.reviewedByName, 'you')
  assert.equal(s.open?.noteUpdatedByName, 'you', 'a note edit leaves a trace')
  assert.ok(calls.filter((c) => c === 'article_reports_admin').length >= 2, 'the list was reloaded')
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(store.getState().newCount, 0)
})

test('a note-only save does not claim a status change; a failed save says not saved and keeps the text', async () => {
  const { store } = fake()
  await store.reload()
  store.openReport(firstReport(store))
  store.setNote('Only a note')
  await store.save()
  assert.equal(store.getState().open?.reviewedAt, null)
  assert.equal(store.getState().open?.noteUpdatedAt, '2026-11-15T20:00:00Z')

  const api = createReportsApi(async (name) => (name === 'article_report_update' ? { data: 'denied', error: null } : { data: [mk('r1')], error: null }))
  const s2 = createReportsStore(api, () => {})
  await s2.reload()
  s2.openReport(firstReport(s2))
  s2.setNote('keep this text')
  await s2.save()
  assert.deepEqual(s2.getState().saveNote, { kind: 'error', reason: 'denied' })
  assert.equal(s2.getState().note, 'keep this text')
})

test('Delete report opens the question with focus on Keep; Keep goes back with focus on Delete report', async () => {
  const { store, focus } = fake()
  await store.reload()
  store.openReport(firstReport(store))
  store.askDelete()
  assert.equal(store.getState().confirming, true)
  assert.deepEqual(focus, ['keep'])
  store.keep()
  assert.equal(store.getState().confirming, false)
  assert.deepEqual(focus, ['keep', 'deleteButton'])
})

test('confirming the delete removes the report, says "Report deleted.", and focuses that line after the list refreshed', async () => {
  const { store, focus } = fake()
  await store.reload()
  const target = firstReport(store)
  store.openReport(target)
  store.askDelete()
  await store.remove()
  const s = store.getState()
  assert.equal(s.open, null)
  assert.equal(s.flash, 'Report deleted.')
  assert.equal(s.load.state === 'ready' && s.load.reports.some((r) => r.id === target.id), false)
  assert.deepEqual(focus, ['keep', 'flash'])
})

test('a save that never answers fails as a network error at the timeout and the dialog is usable again', async () => {
  const { store } = fake({ hang: new Set(['article_report_update']), timeoutMs: 30 })
  await store.reload()
  store.openReport(firstReport(store))
  store.setStatus('fixed')
  await store.save()
  const s = store.getState()
  assert.equal(s.saving, false)
  assert.deepEqual(s.saveNote, { kind: 'error', reason: 'network' })
  assert.notEqual(s.open, null)
})

test('a delete that never answers fails as a network error at the timeout, with the question still open', async () => {
  const { store } = fake({ hang: new Set(['article_report_delete']), timeoutMs: 30 })
  await store.reload()
  store.openReport(firstReport(store))
  store.askDelete()
  await store.remove()
  const s = store.getState()
  assert.equal(s.deleting, false)
  assert.equal(s.deleteError, 'network')
  assert.equal(s.confirming, true)
})

test('Close (or Escape) during a save cancels it and a late answer changes nothing', async () => {
  const { store } = fake({ hang: new Set(['article_report_update']), timeoutMs: 5000 })
  await store.reload()
  store.openReport(firstReport(store))
  store.setStatus('fixed')
  const p = store.save()
  assert.equal(store.getState().saving, true)
  store.close()
  await p
  const s = store.getState()
  assert.equal(s.open, null)
  assert.equal(s.saving, false)
  assert.equal(s.saveNote, null)
})

test('Keep during a delete cancels the delete and returns to the report', async () => {
  const { store, focus } = fake({ hang: new Set(['article_report_delete']), timeoutMs: 5000 })
  await store.reload()
  store.openReport(firstReport(store))
  store.askDelete()
  const p = store.remove()
  assert.equal(store.getState().deleting, true)
  store.keep()
  await p
  const s = store.getState()
  assert.equal(s.deleting, false)
  assert.equal(s.confirming, false)
  assert.notEqual(s.open, null)
  assert.equal(s.flash, null)
  assert.deepEqual(focus, ['keep', 'deleteButton'])
})
