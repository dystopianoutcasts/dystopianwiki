/**
 * The admin dashboard's calls to the database (migrations 024 and 025). Every answer is
 * validated by adminDashboard.ts. Nothing here throws: failures come back as values.
 *
 * The database is the gate. Each admin function refuses a caller without the right
 * flag, so a page that shows a section to the wrong person still gets no data.
 */
import { api } from './supabase'
import { MASCOT_ENTRIES } from '../data/mascotEntries'
import { parseAdminBallots, parseMembers, type AdminBallot, type Member } from './adminDashboard'
import { classifyRpcError, type ElectionStatus } from './mascotVoteLogic'

export type ApiResult<T> = { ok: true; value: T } | { ok: false; reason: 'login' | 'network' | 'malformed' | 'refused' }

const ENTRY_IDS = MASCOT_ENTRIES.map((e) => e.id)

type RpcError = { code?: unknown; message?: unknown; status?: unknown } | null

/** A refusal the database meant (wrong role, or a move it does not allow), as opposed to a failure. */
function reasonOf(error: RpcError): 'login' | 'network' | 'refused' {
  if (error && (error.code === '55000' || error.code === 'P0002' || error.code === '22004' || error.code === 'P0001')) return 'refused'
  const kind = classifyRpcError(error)
  // A signed-in caller refused for their role also gets 42501; the page shows that as "admins only".
  return kind === 'login' ? 'login' : 'network'
}

async function rpc(name: string, args?: Record<string, unknown>): Promise<{ data: unknown; error: RpcError }> {
  try {
    const { data, error } = await api.getClient().rpc(name, args)
    return { data, error: error as RpcError }
  } catch {
    return { data: null, error: { message: 'network' } }
  }
}

/** Fails closed: anything but an exact `true` is false. */
async function flag(name: 'site_is_admin' | 'site_is_superadmin'): Promise<boolean> {
  const { data, error } = await rpc(name)
  return error === null && data === true
}

export async function fetchRoles(): Promise<{ admin: boolean; superadmin: boolean }> {
  const [admin, superadmin] = await Promise.all([flag('site_is_admin'), flag('site_is_superadmin')])
  return { admin, superadmin: admin && superadmin }
}

export async function fetchMembers(): Promise<ApiResult<Member[]>> {
  const { data, error } = await rpc('site_superadmin_members')
  if (error) return { ok: false, reason: reasonOf(error) }
  const parsed = parseMembers(data)
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
}

export async function setAdmin(userId: string, admin: boolean): Promise<ApiResult<null>> {
  const { error } = await rpc('site_superadmin_set_admin', { p_user: userId, p_admin: admin })
  return error ? { ok: false, reason: reasonOf(error) } : { ok: true, value: null }
}

export async function fetchAdminBallots(): Promise<ApiResult<AdminBallot[]>> {
  const { data, error } = await rpc('mascot_admin_ballots')
  if (error) return { ok: false, reason: reasonOf(error) }
  const parsed = parseAdminBallots(data, ENTRY_IDS)
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
}

export async function setCounted(ballotId: string, counted: boolean): Promise<ApiResult<null>> {
  const { error } = await rpc('mascot_admin_set_counted', { p_ballot: ballotId, p_counted: counted })
  return error ? { ok: false, reason: reasonOf(error) } : { ok: true, value: null }
}

export async function setStatus(status: ElectionStatus): Promise<ApiResult<null>> {
  const { error } = await rpc('mascot_admin_set_status', { p_status: status })
  return error ? { ok: false, reason: reasonOf(error) } : { ok: true, value: null }
}

export async function setClosesAt(iso: string | null): Promise<ApiResult<null>> {
  const { error } = await rpc('mascot_admin_set_closes_at', { p_time: iso })
  return error ? { ok: false, reason: reasonOf(error) } : { ok: true, value: null }
}

export const FAILURE_TEXT: Readonly<Record<'login' | 'network' | 'malformed' | 'refused', string>> = {
  login: 'Your session has ended or this account is not allowed to do that. Log in again with an admin account.',
  network: 'We could not reach the server. Check your connection and try again.',
  malformed: 'The server sent something this page could not read. Please try again later.',
  refused: 'The database refused that change. Reload the dashboard: the vote may have moved on since you opened it.',
}
