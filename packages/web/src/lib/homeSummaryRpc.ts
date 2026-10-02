/**
 * How the home page asks the database for its summary. "Today" is the viewer's day, so
 * the call carries the browser's time zone (migration 030). Until 030 is live that form
 * does not exist (PostgREST PGRST202); the one-argument form answers instead, in the
 * server's own day, and the older form is remembered for a while before 030 is tried again.
 *
 * Pure of the Supabase client (the caller passes `rpc`), so the fallback can be tested
 * without a browser (homeSummaryRpc.test.ts).
 */

/** The one-argument function (027), answering in US Eastern days. */
export const HOME_SUMMARY_FN = 'home_summary'

/** The time-zone function (030): aurora.home_summary_tz(p_server, p_tz), a separate name, not an overload. */
export const HOME_SUMMARY_TZ_FN = 'home_summary_tz'

/** How long the one-argument form is used before the time-zone form is tried again. */
export const TZ_RETRY_MS = 5 * 60_000

export interface RpcResult {
  data: unknown
  error: { message: string; code?: string } | null
}
export type RpcCall = (fn: string, args: Record<string, unknown>) => PromiseLike<RpcResult>

/** The browser's IANA time zone, or undefined when it cannot say. */
export function viewerTimeZone(): string | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return typeof tz === 'string' && tz !== '' ? tz : undefined
  } catch {
    return undefined
  }
}

/** A missing function: PostgREST PGRST202, surfaced as a 404 "Could not find the function". */
export function isMissingFunction(error: { message: string; code?: string }): boolean {
  return error.code === 'PGRST202' || /could not find the function/i.test(error.message)
}

/** Epoch ms before which the time-zone form is not asked for again. */
let tzFormClosedUntil = 0

/** Test seam: forget that the time-zone form was found missing. */
export function resetTzProbe(): void {
  tzFormClosedUntil = 0
}

/**
 * The raw summary JSON, or null when the call fails. With a zone and the time-zone form
 * not known to be missing, that form is tried first; a missing function closes it for
 * TZ_RETRY_MS and the one-argument form answers. Any other error is a failure, not a fallback.
 */
export async function callHomeSummary(rpc: RpcCall, serverId: string, tz: string | undefined, now: number = Date.now()): Promise<unknown> {
  if (tz !== undefined && now >= tzFormClosedUntil) {
    const { data, error } = await rpc(HOME_SUMMARY_TZ_FN, { p_server: serverId, p_tz: tz })
    if (!error) return data
    if (!isMissingFunction(error)) return null
    tzFormClosedUntil = now + TZ_RETRY_MS
  }
  const { data, error } = await rpc(HOME_SUMMARY_FN, { p_server: serverId })
  return error ? null : data
}

/** The line under the "today" counters: whose midnight the day starts at. */
export function dayCaption(dayTz: string | null | undefined, viewerTz: string | undefined): string {
  if (dayTz && viewerTz && dayTz === viewerTz) return 'Today means since midnight your time.'
  if (dayTz) return `Today means since midnight in ${dayTz}.`
  return 'Today means since midnight US Eastern.'
}
