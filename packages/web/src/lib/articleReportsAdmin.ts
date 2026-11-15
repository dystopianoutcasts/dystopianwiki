/**
 * The admin dashboard's Reports section (migration 048): pure logic. Parses what
 * article_reports_admin returns, names the statuses and filters, and words the empty states,
 * the tab label and the delete question. Nothing here touches the network or React.
 */

import { runAbortable } from './abortable'

export const REPORT_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'not_a_problem', label: 'Not a problem' },
] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]['value']
export type ReportFilter = ReportStatus | 'all'

/** The filter buttons, in the order the spec lists them. */
export const REPORT_FILTERS: readonly { value: ReportFilter; label: string }[] = [
  ...REPORT_STATUSES,
  { value: 'all', label: 'All' },
]

export const DEFAULT_FILTER: ReportFilter = 'new'

/** The two boxes: the inbox (not archived) and the archive (put away, never deleted). */
export type ReportBox = 'inbox' | 'archived'

/** What the archive view shows by default: every status, since a put-away report may be in any. */
export const ARCHIVE_FILTER: ReportFilter = 'all'

/** The numbers on the Inbox / Archive switch (unread is the part of inbox not yet read). */
export interface BoxCounts {
  unread: number
  inbox: number
  archived: number
}

export const EMPTY_TEXT: Readonly<Record<ReportFilter, string>> = {
  new: 'No new reports.',
  confirmed: 'No confirmed reports.',
  fixed: 'No reports are marked fixed.',
  not_a_problem: 'No reports are marked not a problem.',
  all: 'No reports have been sent yet.',
}

export const ANONYMOUS = 'anonymous'

export interface AdminReport {
  id: string
  createdAt: string
  articleId: string
  slug: string
  /** The article's last_updated as the reader saw it. */
  version: string | null
  title: string
  /** A site path, always starting with one slash. */
  url: string
  section: string | null
  kind: string
  message: string
  evidence: string
  /** null: the reader was signed out. */
  reporterName: string | null
  status: ReportStatus
  adminNote: string
  reviewedByName: string | null
  reviewedAt: string | null
  /** Who last changed the admin note, and when; null when it was never edited. */
  noteUpdatedByName: string | null
  noteUpdatedAt: string | null
  /** null: not read yet. */
  readAt: string | null
  /** null: in the inbox. */
  archivedAt: string | null
}

export function statusLabel(status: string): string {
  return REPORT_STATUSES.find((s) => s.value === status)?.label ?? status
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return REPORT_STATUSES.some((s) => s.value === value)
}

const str = (v: unknown): v is string => typeof v === 'string'
const strOrNull = (v: unknown): v is string | null => v === null || typeof v === 'string'

/** A path on this site: one leading slash, never a second one, no scheme. */
export function isSitePath(url: string): boolean {
  return /^\/[A-Za-z0-9][A-Za-z0-9/_.-]*$/.test(url)
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false }

/** Validates the rows of article_reports_admin. One bad row refuses the whole answer. */
export function parseReports(data: unknown): ParseResult<AdminReport[]> {
  if (!Array.isArray(data)) return { ok: false }
  const out: AdminReport[] = []
  for (const raw of data) {
    if (typeof raw !== 'object' || raw === null) return { ok: false }
    const r = raw as Record<string, unknown>
    if (
      !str(r.id) || !str(r.created_at) || !str(r.article_id) || !str(r.article_slug) || !str(r.article_title) ||
      !str(r.article_url) || !isSitePath(r.article_url) || !str(r.kind) || !str(r.message) ||
      !strOrNull(r.article_version) || !strOrNull(r.section) || !strOrNull(r.reporter_name) ||
      !strOrNull(r.reviewed_by_name) || !strOrNull(r.reviewed_at) || !isReportStatus(r.status) ||
      !(r.note_updated_by_name === undefined || strOrNull(r.note_updated_by_name)) ||
      !(r.note_updated_at === undefined || strOrNull(r.note_updated_at)) ||
      !strOrNull(r.read_at) || !strOrNull(r.archived_at)
    ) {
      return { ok: false }
    }
    out.push({
      id: r.id,
      createdAt: r.created_at,
      articleId: r.article_id,
      slug: r.article_slug,
      version: r.article_version,
      title: r.article_title,
      url: r.article_url,
      section: r.section,
      kind: r.kind,
      message: r.message,
      evidence: str(r.evidence) ? r.evidence : '',
      reporterName: r.reporter_name,
      status: r.status,
      adminNote: str(r.admin_note) ? r.admin_note : '',
      reviewedByName: r.reviewed_by_name,
      reviewedAt: r.reviewed_at,
      noteUpdatedByName: typeof r.note_updated_by_name === 'string' ? r.note_updated_by_name : null,
      noteUpdatedAt: typeof r.note_updated_at === 'string' ? r.note_updated_at : null,
      readAt: r.read_at,
      archivedAt: r.archived_at,
    })
  }
  return { ok: true, value: out }
}

/** The answer of article_reports_new_count: a whole number, else null. */
export function parseCount(data: unknown): number | null {
  return typeof data === 'number' && Number.isInteger(data) && data >= 0 ? data : null
}

/** The answer of article_reports_box_counts: one row of three whole numbers, else null. */
export function parseBoxCounts(data: unknown): BoxCounts | null {
  const row = Array.isArray(data) && data.length === 1 ? data[0] : null
  if (typeof row !== 'object' || row === null) return null
  const r = row as Record<string, unknown>
  const unread = parseCount(r.unread)
  const inbox = parseCount(r.inbox)
  const archived = parseCount(r.archived)
  return unread === null || inbox === null || archived === null ? null : { unread, inbox, archived }
}

/** The heading and tab label: "Reports (3 unread)", or plain "Reports" while the count is unknown. */
export function sectionLabel(unreadCount: number | null): string {
  return unreadCount === null ? 'Reports' : `Reports (${unreadCount} unread)`
}

/** The Inbox / Archive switch's button words, with the count when it is known. */
export function boxLabel(box: ReportBox, counts: BoxCounts | null): string {
  if (box === 'inbox') return counts ? `Inbox (${counts.inbox}, ${counts.unread} unread)` : 'Inbox'
  return counts ? `Archive (${counts.archived})` : 'Archive'
}

/** How many of these reports are unread (what "Mark all as read" would change). */
export function unreadIn(reports: readonly Pick<AdminReport, 'readAt'>[]): number {
  return reports.filter((r) => r.readAt === null).length
}

/** The words of the "Mark all as read" button: it says how many it will change. */
export function markAllLabel(unread: number): string {
  return `Mark all ${unread} shown as read`
}

/** The start of a message for a table cell, cut at a space when it can be. */
export function snippet(text: string, max = 90): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  const chars = Array.from(flat)
  if (chars.length <= max) return flat
  const cut = chars.slice(0, max).join('')
  const space = cut.lastIndexOf(' ')
  return `${(space > max / 2 ? cut.slice(0, space) : cut).trimEnd()}...`
}

export function reporterText(r: Pick<AdminReport, 'reporterName'>): string {
  return r.reporterName ?? ANONYMOUS
}

/** What a report's state is, in words (never by weight or color alone). */
export function readLabel(r: Pick<AdminReport, 'readAt'>): string {
  return r.readAt === null ? 'Unread' : 'Read'
}

/** The delete question, naming the report: Delete the report about 'Title' from Nov 15, 2026? */
export function deleteQuestion(r: Pick<AdminReport, 'title' | 'createdAt'>, formatDay: (iso: string) => string): string {
  return `Delete the report about '${r.title}' from ${formatDay(r.createdAt)}?`
}

/** A date for display, in the viewer's locale; the text unchanged when it is not a date. */
export function formatDay(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** The day an article was last updated, as the date it carries (UTC, so no time zone moves it). */
export function formatVersion(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** "Not reviewed yet." or "Status last changed by <name> on <date>." */
export function reviewedLine(r: Pick<AdminReport, 'reviewedByName' | 'reviewedAt'>, when: (iso: string) => string): string {
  if (!r.reviewedAt) return 'Not reviewed yet.'
  return `Status last changed by ${r.reviewedByName ?? 'an admin'} on ${when(r.reviewedAt)}.`
}

/** "The note was last edited by <name> on <date>.", or null when the note was never edited. */
export function noteLine(r: Pick<AdminReport, 'noteUpdatedByName' | 'noteUpdatedAt'>, when: (iso: string) => string): string | null {
  if (!r.noteUpdatedAt) return null
  return `Note last edited by ${r.noteUpdatedByName ?? 'an admin'} on ${when(r.noteUpdatedAt)}.`
}

/** What the database answered to an update or a delete. */
export type MutationAnswer = 'ok' | 'denied' | 'invalid' | 'not_found' | 'unknown'

export function parseMutationAnswer(data: unknown): MutationAnswer {
  return data === 'ok' || data === 'denied' || data === 'invalid' || data === 'not_found' ? data : 'unknown'
}

/** Why a change was not saved, in words. `missing` is the migration not being applied. */
export type ReportsFailure = 'login' | 'network' | 'malformed' | 'denied' | 'invalid' | 'not_found' | 'missing' | 'cancelled'

export const REPORTS_FAILURE_TEXT: Readonly<Record<ReportsFailure, string>> = {
  login: 'Your session has ended. Log in again with an admin account.',
  network: 'We could not reach the server. Check your connection and try again.',
  malformed: 'The server sent something this page could not read. Please try again later.',
  denied: 'This account is not allowed to change reports.',
  invalid: 'The database refused that change. If you were saving a note, check it is 2,000 characters or fewer.',
  not_found: 'That report no longer exists. Reload the list.',
  missing: 'Reports are not switched on yet. Apply migrations 048 to 050.',
  cancelled: 'Cancelled.',
}

export function failureFor(answer: MutationAnswer): ReportsFailure {
  return answer === 'denied' ? 'denied' : answer === 'invalid' ? 'invalid' : answer === 'not_found' ? 'not_found' : 'malformed'
}

// ---------------------------------------------------------------------------
// The calls, over any rpc function (the page binds the real one; the tests bind a fake)
// ---------------------------------------------------------------------------

export type ReportsResult<T> = { ok: true; value: T } | { ok: false; reason: ReportsFailure }

type RpcError = { code?: unknown; message?: unknown; status?: unknown } | null | undefined
export type ReportsRpc = (name: string, args?: Record<string, unknown>, signal?: AbortSignal) => Promise<{ data: unknown; error: RpcError }>

/** Maps a failed call to its reason: a missing function is "not switched on", 42501 is a lost session. */
export function failureOf(error: RpcError): ReportsFailure {
  if (isMissing(error)) return 'missing'
  if (error && (error.code === '42501' || error.status === 401 || error.status === 403)) return 'login'
  return 'network'
}

function isMissing(error: RpcError): boolean {
  if (!error) return false
  if (error.code === 'PGRST202' || error.code === '42883' || error.status === 404) return true
  const message = typeof error.message === 'string' ? error.message : ''
  return /could not find the function|schema cache|function .* does not exist/i.test(message)
}

export function createReportsApi(call: ReportsRpc, options: { timeoutMs?: number } = {}) {
  /** One call that gives up after the timeout (a network failure) or when `signal` fires (cancelled). */
  const run = async (
    name: string,
    args?: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<{ data: unknown; error: RpcError; cancelled?: true }> => {
    try {
      const r = await runAbortable((s) => call(name, args, s), signal, options.timeoutMs)
      if (!r.aborted) return r.value
      return r.reason === 'cancelled' ? { data: null, error: null, cancelled: true } : { data: null, error: { message: 'network' } }
    } catch {
      return { data: null, error: { message: 'network' } }
    }
  }
  const mutation = async (name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<ReportsResult<null>> => {
    const { data, error, cancelled } = await run(name, args, signal)
    if (cancelled) return { ok: false, reason: 'cancelled' }
    if (error) return { ok: false, reason: failureOf(error) }
    const answer = parseMutationAnswer(data)
    return answer === 'ok' ? { ok: true, value: null } : { ok: false, reason: failureFor(answer) }
  }
  return {
    async fetchReports(filter: ReportFilter, box: ReportBox = 'inbox'): Promise<ReportsResult<AdminReport[]>> {
      const { data, error } = await run('article_reports_admin', { p_status: filter, p_limit: 200, p_box: box })
      if (error) return { ok: false, reason: failureOf(error) }
      const parsed = parseReports(data)
      return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
    },
    async fetchNewCount(): Promise<ReportsResult<number>> {
      const { data, error } = await run('article_reports_new_count')
      if (error) return { ok: false, reason: failureOf(error) }
      const n = parseCount(data)
      return n === null ? { ok: false, reason: 'malformed' } : { ok: true, value: n }
    },
    async fetchBoxCounts(): Promise<ReportsResult<BoxCounts>> {
      const { data, error } = await run('article_reports_box_counts')
      if (error) return { ok: false, reason: failureOf(error) }
      const c = parseBoxCounts(data)
      return c === null ? { ok: false, reason: 'malformed' } : { ok: true, value: c }
    },
    markRead: (id: string, read: boolean, signal?: AbortSignal) => mutation('article_report_mark_read', { p_id: id, p_read: read }, signal),
    markAllRead: (ids: readonly string[], signal?: AbortSignal) => mutation('article_reports_mark_all_read', { p_ids: [...ids] }, signal),
    archiveReport: (id: string, archived: boolean, signal?: AbortSignal) =>
      mutation('article_report_archive', { p_id: id, p_archived: archived }, signal),
    updateReport: (id: string, status: ReportStatus, note: string, signal?: AbortSignal) =>
      mutation('article_report_update', { p_id: id, p_status: status, p_note: note }, signal),
    deleteReport: (id: string, signal?: AbortSignal) => mutation('article_report_delete', { p_id: id }, signal),
  }
}

export type ReportsApi = ReturnType<typeof createReportsApi>
