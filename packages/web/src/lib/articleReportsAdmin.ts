/**
 * The admin dashboard's Reports section (migration 048): pure logic. Parses what
 * article_reports_admin returns, names the statuses and filters, and words the empty states,
 * the tab label and the delete question. Nothing here touches the network or React.
 */

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
      !strOrNull(r.reviewed_by_name) || !strOrNull(r.reviewed_at) || !isReportStatus(r.status)
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
    })
  }
  return { ok: true, value: out }
}

/** The answer of article_reports_new_count: a whole number, else null. */
export function parseCount(data: unknown): number | null {
  return typeof data === 'number' && Number.isInteger(data) && data >= 0 ? data : null
}

/** The heading and tab label: "Reports (3 new)", or plain "Reports" while the count is unknown. */
export function sectionLabel(newCount: number | null): string {
  return newCount === null ? 'Reports' : `Reports (${newCount} new)`
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

/** What the database answered to an update or a delete. */
export type MutationAnswer = 'ok' | 'denied' | 'invalid' | 'not_found' | 'unknown'

export function parseMutationAnswer(data: unknown): MutationAnswer {
  return data === 'ok' || data === 'denied' || data === 'invalid' || data === 'not_found' ? data : 'unknown'
}

/** Why a change was not saved, in words. `missing` is the migration not being applied. */
export type ReportsFailure = 'login' | 'network' | 'malformed' | 'denied' | 'invalid' | 'not_found' | 'missing'

export const REPORTS_FAILURE_TEXT: Readonly<Record<ReportsFailure, string>> = {
  login: 'Your session has ended. Log in again with an admin account.',
  network: 'We could not reach the server. Check your connection and try again.',
  malformed: 'The server sent something this page could not read. Please try again later.',
  denied: 'This account is not allowed to change reports.',
  invalid: 'The database refused that change. Check the note is 2,000 characters or fewer.',
  not_found: 'That report no longer exists. Reload the list.',
  missing: 'Reports are not switched on yet. Apply migration 048.',
}

export function failureFor(answer: MutationAnswer): ReportsFailure {
  return answer === 'denied' ? 'denied' : answer === 'invalid' ? 'invalid' : answer === 'not_found' ? 'not_found' : 'malformed'
}

// ---------------------------------------------------------------------------
// The calls, over any rpc function (the page binds the real one; the tests bind a fake)
// ---------------------------------------------------------------------------

export type ReportsResult<T> = { ok: true; value: T } | { ok: false; reason: ReportsFailure }

type RpcError = { code?: unknown; message?: unknown; status?: unknown } | null | undefined
export type ReportsRpc = (name: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: RpcError }>

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

export function createReportsApi(call: ReportsRpc) {
  const run = async (name: string, args?: Record<string, unknown>) => {
    try {
      return await call(name, args)
    } catch {
      return { data: null, error: { message: 'network' } as RpcError }
    }
  }
  const mutation = async (name: string, args: Record<string, unknown>): Promise<ReportsResult<null>> => {
    const { data, error } = await run(name, args)
    if (error) return { ok: false, reason: failureOf(error) }
    const answer = parseMutationAnswer(data)
    return answer === 'ok' ? { ok: true, value: null } : { ok: false, reason: failureFor(answer) }
  }
  return {
    async fetchReports(filter: ReportFilter): Promise<ReportsResult<AdminReport[]>> {
      const { data, error } = await run('article_reports_admin', { p_status: filter, p_limit: 200 })
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
    updateReport: (id: string, status: ReportStatus, note: string) =>
      mutation('article_report_update', { p_id: id, p_status: status, p_note: note }),
    deleteReport: (id: string) => mutation('article_report_delete', { p_id: id }),
  }
}

export type ReportsApi = ReturnType<typeof createReportsApi>
