/**
 * Tests for the admin Reports section's logic (articleReportsAdmin.ts): parsing, the filters and
 * their empty states, the tab label, the delete question, and the calls over a fake rpc.
 * node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  DEFAULT_FILTER,
  EMPTY_TEXT,
  REPORT_FILTERS,
  REPORTS_FAILURE_TEXT,
  createReportsApi,
  deleteQuestion,
  failureOf,
  isSitePath,
  parseCount,
  parseReports,
  reporterText,
  reviewedLine,
  sectionLabel,
  snippet,
  type ReportsRpc,
} from './articleReportsAdmin'

const row = {
  id: 'r1',
  created_at: '2026-11-15T10:00:00Z',
  article_id: 'a1',
  article_slug: 'getting-started',
  article_version: '2026-11-01T00:00:00Z',
  article_title: 'Getting started',
  article_url: '/pz/build-42/server/setup/getting-started',
  section: 'Setup',
  kind: 'wrong_fact',
  message: 'The page says five.',
  evidence: 'Build 42.13',
  reporter_name: 'rp_reader',
  status: 'new',
  admin_note: '',
  reviewed_by_name: null,
  reviewed_at: null,
}

test('the filters are New, Confirmed, Fixed, Not a problem, All; New is the default; each has an empty state', () => {
  assert.deepEqual(REPORT_FILTERS.map((f) => f.label), ['New', 'Confirmed', 'Fixed', 'Not a problem', 'All'])
  assert.equal(DEFAULT_FILTER, 'new')
  assert.equal(EMPTY_TEXT.new, 'No new reports.')
  for (const f of REPORT_FILTERS) assert.ok(EMPTY_TEXT[f.value].length > 5, f.value)
})

test('the tab label carries the count of new reports', () => {
  assert.equal(sectionLabel(3), 'Reports (3 new)')
  assert.equal(sectionLabel(0), 'Reports (0 new)')
  assert.equal(sectionLabel(null), 'Reports')
  assert.equal(parseCount(3), 3)
  assert.equal(parseCount('3'), null)
  assert.equal(parseCount(-1), null)
  assert.equal(parseCount(1.5), null)
})

test('parseReports reads rows and refuses anything malformed, including a URL that leaves the site', () => {
  const ok = parseReports([row])
  assert.equal(ok.ok, true)
  assert.deepEqual(ok.ok && ok.value[0].url, '/pz/build-42/server/setup/getting-started')
  assert.equal(ok.ok && ok.value[0].reporterName, 'rp_reader')
  assert.deepEqual(parseReports([]), { ok: true, value: [] })
  assert.equal(parseReports(null).ok, false)
  assert.equal(parseReports([{ ...row, status: 'weird' }]).ok, false)
  assert.equal(parseReports([{ ...row, message: 5 }]).ok, false)
  assert.equal(parseReports([{ ...row, article_url: 'https://evil.example/x' }]).ok, false)
  assert.equal(parseReports([{ ...row, article_url: '//evil.example/x' }]).ok, false)
  assert.equal(parseReports([{ ...row, article_url: 'javascript:alert(1)' }]).ok, false)
  assert.equal(parseReports([row, { ...row, id: 5 }]).ok, false, 'one bad row refuses the answer')
  assert.equal(isSitePath('/a/b-c_d.e'), true)
  assert.equal(isSitePath('/'), false)
})

test('a signed-out reporter shows as anonymous', () => {
  assert.equal(reporterText({ reporterName: null }), 'anonymous')
  assert.equal(reporterText({ reporterName: 'rp_reader' }), 'rp_reader')
})

test('a long message is cut at a word with an ellipsis; a short one is untouched', () => {
  assert.equal(snippet('Short one.'), 'Short one.')
  const long = 'word '.repeat(60)
  const cut = snippet(long, 40)
  assert.ok(cut.endsWith('...') && cut.length <= 43, cut)
  assert.equal(snippet('a\n\nb   c'), 'a b c', 'line breaks collapse in a table cell')
})

test('the delete question names the report by page and date', () => {
  assert.equal(
    deleteQuestion({ title: 'Getting started', createdAt: '2026-11-15T10:00:00Z' }, () => 'Nov 15, 2026'),
    "Delete the report about 'Getting started' from Nov 15, 2026?",
  )
})

test('the reviewed line says who and when, or that nobody has reviewed it', () => {
  assert.equal(reviewedLine({ reviewedByName: null, reviewedAt: null }, () => 'x'), 'Not reviewed yet.')
  assert.equal(reviewedLine({ reviewedByName: 'rp_admin', reviewedAt: '2026-11-15T10:00:00Z' }, () => 'Nov 15'), 'Status last changed by rp_admin on Nov 15.')
})

test('failureOf: a missing function is "missing", a lost session is "login", the rest "network"', () => {
  assert.equal(failureOf({ code: 'PGRST202', message: 'Could not find the function' }), 'missing')
  assert.equal(failureOf({ status: 404 }), 'missing')
  assert.equal(failureOf({ code: '42501' }), 'login')
  assert.equal(failureOf({ status: 401 }), 'login')
  assert.equal(failureOf({ message: 'Failed to fetch' }), 'network')
  assert.match(REPORTS_FAILURE_TEXT.missing, /not switched on/)
})

function fake(handler: (name: string, args?: Record<string, unknown>) => { data?: unknown; error?: { code?: string; message?: string; status?: number } | null }) {
  const calls: { name: string; args?: Record<string, unknown> }[] = []
  const rpc: ReportsRpc = async (name, args) => {
    calls.push({ name, args })
    const r = handler(name, args)
    return { data: r.data ?? null, error: r.error ?? null }
  }
  return { api: createReportsApi(rpc), calls }
}

test('fetchReports asks for the filter and returns parsed rows; the count has its own call', async () => {
  const { api, calls } = fake((name) => (name === 'article_reports_new_count' ? { data: 4 } : { data: [row] }))
  const r = await api.fetchReports('confirmed')
  assert.equal(r.ok && r.value.length, 1)
  assert.deepEqual(calls[0], { name: 'article_reports_admin', args: { p_status: 'confirmed', p_limit: 200 } })
  const c = await api.fetchNewCount()
  assert.deepEqual(c, { ok: true, value: 4 })
})

test('before migration 048 the reads say "missing", never an empty list', async () => {
  const { api } = fake(() => ({ error: { code: 'PGRST202', message: 'Could not find the function public.article_reports_admin' } }))
  assert.deepEqual(await api.fetchReports('new'), { ok: false, reason: 'missing' })
  assert.deepEqual(await api.fetchNewCount(), { ok: false, reason: 'missing' })
})

test('updateReport and deleteReport pass the right arguments and turn each answer into a result', async () => {
  const answers: Record<string, string> = { article_report_update: 'ok', article_report_delete: 'ok' }
  const { api, calls } = fake((name) => ({ data: answers[name] }))
  assert.deepEqual(await api.updateReport('r1', 'fixed', 'Done.'), { ok: true, value: null })
  assert.deepEqual(calls[0], { name: 'article_report_update', args: { p_id: 'r1', p_status: 'fixed', p_note: 'Done.' } })
  assert.deepEqual(await api.deleteReport('r1'), { ok: true, value: null })
  assert.deepEqual(calls[1], { name: 'article_report_delete', args: { p_id: 'r1' } })

  answers.article_report_update = 'denied'
  assert.deepEqual(await api.updateReport('r1', 'fixed', ''), { ok: false, reason: 'denied' })
  answers.article_report_update = 'invalid'
  assert.deepEqual(await api.updateReport('r1', 'fixed', ''), { ok: false, reason: 'invalid' })
  answers.article_report_delete = 'not_found'
  assert.deepEqual(await api.deleteReport('r1'), { ok: false, reason: 'not_found' })
  answers.article_report_delete = 'surprise'
  assert.deepEqual(await api.deleteReport('r1'), { ok: false, reason: 'malformed' })
})

test('a call that throws is a network failure, not a crash', async () => {
  const api = createReportsApi(async () => {
    throw new TypeError('Failed to fetch')
  })
  assert.deepEqual(await api.fetchReports('new'), { ok: false, reason: 'network' })
  assert.deepEqual(await api.deleteReport('r1'), { ok: false, reason: 'network' })
})
