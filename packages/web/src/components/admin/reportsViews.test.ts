/**
 * Render tests for the admin Reports section's views (ReportsViews.tsx), through the hook-free
 * staticMarkup helper: the list and its stacked-table cells, the filters, the detail with its
 * visible Delete button, the confirmation by name, and the saved and not-saved notes. The
 * container (ReportsSection.tsx) uses hooks and the Supabase client, so where it is concerned the
 * tests read its source. node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement } from 'react'
import { staticMarkup } from '../landing/staticMarkup'
import type { AdminReport } from '../../lib/articleReportsAdmin'
import { MarkAllView, ReportBoxView, ReportDetailView, ReportFiltersView, ReportsTable, type ReportDetailProps, type ReportsTableProps } from './ReportsViews'

const SRC = fileURLToPath(new URL('../../', import.meta.url))
const code = (rel: string) => readFileSync(join(SRC, rel), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const report: AdminReport = {
  id: 'r1',
  createdAt: '2026-11-15T15:00:00Z',
  articleId: 'a1',
  slug: 'getting-started',
  version: '2026-11-01T00:00:00Z',
  title: 'Getting started',
  url: '/pz/build-42/server/setup/getting-started',
  section: 'Setup',
  kind: 'wrong_fact',
  message: 'It says five.\nIt is seven.',
  evidence: 'Build 42.13',
  reporterName: null,
  status: 'new',
  adminNote: '',
  reviewedByName: null,
  reviewedAt: null,
  noteUpdatedByName: null,
  noteUpdatedAt: null,
  readAt: null,
  archivedAt: null,
}

const table = (reports: AdminReport[], patch: Partial<ReportsTableProps> = {}): string =>
  staticMarkup(
    createElement(ReportsTable, {
      reports,
      box: 'inbox',
      acting: false,
      onOpen: () => {},
      onRead: () => {},
      onArchive: () => {},
      onMoveBack: () => {},
      labelledBy: 'h',
      ...patch,
    }),
  )

const detail = (patch: Partial<ReportDetailProps> = {}): string =>
  staticMarkup(
    createElement(ReportDetailView, {
      report,
      ids: { title: 't', status: 's', note: 'n', keep: 'k', deleteButton: 'd' },
      status: 'new',
      note: '',
      saving: false,
      saveNote: null,
      confirming: false,
      deleting: false,
      deleteError: null,
      acting: false,
      actionError: null,
      onToggleRead: () => {},
      onArchive: () => {},
      onMoveBack: () => {},
      onStatus: () => {},
      onNote: () => {},
      onSave: () => {},
      onClose: () => {},
      onAskDelete: () => {},
      onKeep: () => {},
      onDelete: () => {},
      ...patch,
    }),
  )

test('the filters are five buttons; the picked one says so with aria-pressed', () => {
  const html = staticMarkup(createElement(ReportFiltersView, { value: 'new', onPick: () => {}, labelId: 'l' }))
  for (const label of ['New', 'Confirmed', 'Fixed', 'Not a problem', 'All']) assert.match(html, new RegExp(`>${label}</button>`))
  assert.equal(html.match(/aria-pressed="true"/g)?.length, 1)
  assert.match(html, /aria-pressed="true"[^>]*>New</)
})

test('the list shows status, what is wrong, the page link, the part, the message start, the date and the sender', () => {
  const html = table([report])
  for (const header of ['Read', 'Status', 'What is wrong', 'Page', 'Part', 'Message', 'Sent', 'From', 'Actions']) assert.match(html, new RegExp(`>${header}</th>`))
  assert.match(html, /<span class="admin__cell-value">New<\/span>/)
  assert.match(html, /A fact is wrong/)
  assert.match(html, /Setup/)
  assert.match(html, /Nov 15, 2026/)
  assert.match(html, /anonymous/)
  assert.match(html, /It says five\. It is seven\./)
  assert.match(html, /<a href="\/pz\/build-42\/server\/setup\/getting-started" target="_blank" rel="noopener noreferrer">Getting started/)
  assert.match(html, /\(opens in a new tab\)/)
  assert.match(html, />Open<span class="sr-only"> the report about Getting started<\/span><\/button>/)
})

test('a reader\'s text is escaped, never markup', () => {
  const evil: AdminReport = { ...report, message: '<img src=x onerror=alert(1)> **bold** [x](javascript:alert(1))', title: '<b>T</b>', evidence: '<script>alert(1)</script>' }
  const list = table([evil])
  const open = detail({ report: evil })
  for (const html of [list, open]) {
    assert.doesNotMatch(html, /<img|<script|<b>/)
    assert.match(html, /&lt;/)
  }
  assert.match(open, /\*\*bold\*\*/, 'Markdown is not rendered')
})

test('the open report shows the full text, the evidence, the version seen, the page and who sent it', () => {
  const html = detail()
  assert.match(html, /Report: A fact is wrong/)
  assert.match(html, /It says five\.\nIt is seven\./, 'line breaks are kept in the text')
  assert.match(html, /Build 42\.13/)
  assert.match(html, /Article version the reader saw/)
  assert.match(html, /Nov 1, 2026/)
  assert.match(html, /<code>\/pz\/build-42\/server\/setup\/getting-started<\/code>/)
  assert.match(html, /by anonymous/)
  assert.match(html, /Not reviewed yet\./)
})

test('J3: a Status select, an Admin note box and a Save button; "Saved" and "Not saved: reason" are said', () => {
  const html = detail()
  assert.match(html, /<label htmlFor="s">Status<\/label>/)
  for (const s of ['New', 'Confirmed', 'Fixed', 'Not a problem']) assert.match(html, new RegExp(`<option value="[a-z_]+"[^>]*>${s}</option>`))
  assert.match(html, /<label htmlFor="n">Admin note/)
  assert.match(html, />Save<\/button>/)
  assert.doesNotMatch(html, />Saved</)
  assert.match(detail({ saveNote: { kind: 'saved' } }), /<p class="mascot-vote__hint">Saved<\/p>/)
  const failed = detail({ saveNote: { kind: 'error', text: 'We could not reach the server.' } })
  assert.match(failed, /role="alert">Not saved: We could not reach the server\./)
  assert.match(detail({ saving: true }), /aria-disabled="true">Saving\.\.\./, 'Save stays focusable while saving')
  assert.match(detail({ saving: true }), />Cancel saving<\/button>/, 'and Close becomes Cancel saving, still enabled')
  assert.match(detail({ report: { ...report, noteUpdatedByName: 'rp_admin', noteUpdatedAt: '2026-11-15T12:00:00Z' } }), /Note last edited by rp_admin on /)
  assert.doesNotMatch(detail(), /Note last edited/)
  assert.match(detail({ report: { ...report, status: 'fixed', reviewedByName: 'rp_admin', reviewedAt: '2026-11-15T12:00:00Z' } }), /Status last changed by rp_admin on /)
})

test('J4: Delete report is a visible button beside Save; it asks by name with Delete and Keep', () => {
  assert.match(detail(), />Delete report<\/button>/)
  const ask = detail({ confirming: true })
  assert.match(ask, /Delete the report about &#39;Getting started&#39; from Nov 15, 2026\?|Delete the report about 'Getting started' from Nov 15, 2026\?/)
  assert.match(ask, />Keep<\/button>/)
  assert.match(ask, />Delete<\/button>/)
  assert.doesNotMatch(ask, />Delete report<\/button>/)
  assert.match(detail({ confirming: true, deleting: true }), /aria-disabled="true">Deleting\.\.\./)
  assert.match(ask, /<button id="k" type="button"[^>]*>Keep<\/button>/, 'Keep has the id the focus goes to')
  assert.match(detail(), /<button id="d" type="button"[^>]*>Delete report<\/button>/, 'Delete report has the id focus returns to')
  assert.match(detail({ confirming: true, deleteError: 'That report no longer exists.' }), /role="alert">That report no longer exists\./)
})

test('the dashboard mounts the Reports section (under its own tab, which shows the new count)', () => {
  assert.match(code('pages/AdminDashboardPage.tsx'), /<ReportsSection onNewCount=\{setNewReports\} \/>/)
  assert.match(code('pages/AdminDashboardPage.tsx'), /import \{ ReportsSection \} from '\.\.\/components\/admin\/ReportsSection'/)
})

test('an unread report says so in words and in bold; a read one says Read in plain text', () => {
  const unread = table([report])
  assert.match(unread, /<strong>Unread<\/strong>/)
  assert.match(unread, /<strong>It says five\. It is seven\.<\/strong>/, 'the message is bold too')
  const read = table([{ ...report, readAt: '2026-11-15T16:00:00Z' }])
  assert.doesNotMatch(read, /<strong>/)
  assert.match(read, />Read</)
  assert.doesNotMatch(read, />Unread</)
})

test('each row has Mark as read (Mark as unread once read) and Archive, as words, never opening on their own', () => {
  assert.match(table([report]), />Mark as read<span class="sr-only"> the report about Getting started<\/span><\/button>/)
  assert.match(table([report]), />Archive<span class="sr-only"> the report about Getting started<\/span><\/button>/)
  assert.match(table([{ ...report, readAt: '2026-11-15T16:00:00Z' }]), />Mark as unread</)
  assert.match(table([report], { acting: true }), /disabled="true"[^>]*>Mark as read/)
})

test('in the archive each row says Move back to inbox, and there is no Archive button', () => {
  const html = table([{ ...report, archivedAt: '2026-11-15T17:00:00Z' }], { box: 'archived' })
  assert.match(html, />Move back to inbox</)
  assert.doesNotMatch(html, />Archive</)
})

test('the Inbox / Archive switch is two buttons with words and counts, one pressed', () => {
  const html = staticMarkup(createElement(ReportBoxView, { value: 'inbox', counts: { unread: 2, inbox: 5, archived: 1 }, onPick: () => {}, labelId: 'l' }))
  assert.match(html, /aria-pressed="true"[^>]*>Inbox \(5, 2 unread\)</)
  assert.match(html, /aria-pressed="false"[^>]*>Archive \(1\)</)
  assert.match(staticMarkup(createElement(ReportBoxView, { value: 'archived', counts: null, onPick: () => {}, labelId: 'l' })), /aria-pressed="true"[^>]*>Archive</)
})

test('Mark all says how many it will change, counts only unread, and is absent when none are unread', () => {
  const read = { ...report, id: 'r2', readAt: '2026-11-15T16:00:00Z' }
  const mk = (reports: AdminReport[]) => staticMarkup(createElement(MarkAllView, { reports, acting: false, onMarkAll: () => {} }))
  assert.match(mk([report, { ...report, id: 'r3' }, read]), />Mark all 2 shown as read</)
  assert.equal(mk([read]), '')
})

test('the open report has Mark as read and Archive buttons, shows its state, and Archive becomes Move back to inbox', () => {
  const open = detail()
  assert.match(open, />Mark as read<\/button>/)
  assert.match(open, />Archive<\/button>/)
  assert.match(open, /<dt>Read<\/dt><dd aria-live="polite">Unread<\/dd>/)
  assert.match(open, /In the inbox/)
  const archived = detail({ report: { ...report, readAt: '2026-11-15T16:00:00Z', archivedAt: '2026-11-15T17:00:00Z' } })
  assert.match(archived, />Mark as unread<\/button>/)
  assert.match(archived, />Move back to inbox<\/button>/)
  assert.doesNotMatch(archived, />Archive<\/button>/)
  assert.match(archived, /In the archive/)
  assert.match(detail({ actionError: 'That report no longer exists. Reload the list.' }), /role="alert">That report no longer exists/)
})

test('the delete question says it cannot be undone and points to Archive as the way to put it away', () => {
  assert.match(detail({ confirming: true }), /cannot be undone\. To put a report away without losing it, choose Keep, then Archive/)
})

test('the section shows the Undo line after archiving, and never marks a report read just by opening it', () => {
  const section = code('components/admin/ReportsSection.tsx')
  assert.match(section, /Archived\. It is in Archive, not deleted\./)
  assert.match(section, />\s*Undo\s*</)
  const store = code('lib/reportsStore.ts')
  const open = store.slice(store.indexOf('openReport('), store.indexOf('setStatus('))
  assert.doesNotMatch(open, /markRead|api\./, 'opening a report must not mark it read')
})
