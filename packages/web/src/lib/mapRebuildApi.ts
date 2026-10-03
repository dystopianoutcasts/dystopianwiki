/**
 * The admin page's calls for map rebuild requests (migration 033, task T51). The functions
 * live in schema `aurora`; this file is pure of the Supabase client (the caller passes
 * `rpc`), so the reason mapping and the parsing are tested without a browser
 * (mapRebuildApi.test.ts). mapRebuildClient.ts binds it to the real client.
 *
 * Nothing here throws: failures come back as values. Before 033's rebuild section is live
 * every admin function answers PGRST202; that is the reason 'missing' and the panel shows
 * one quiet line for it. The reason mapping is the worlds one (a refusal the database
 * meant is P0001 and keeps its readable message).
 */
import type { RpcCall } from './homeSummaryRpc'
import { failureOf, type FailureReason, type WorldsResult } from './worldsApi'

export type { FailureReason }
export type MapRebuildResult<T> = WorldsResult<T>
export { failureOf }

export type RebuildStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled'

export interface RebuildRequest {
  id: number
  serverId: string
  requestedAt: string
  maps: string[]
  note: string | null
  status: RebuildStatus
  claimedAt: string | null
  claimedBy: string | null
  heartbeatAt: string | null
  finishedAt: string | null
  commitSha: string | null
  /** Already cut to its last 4,000 characters by the database. */
  log: string | null
}

const STATUSES: readonly RebuildStatus[] = ['queued', 'running', 'done', 'failed', 'cancelled']

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
function strOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v : null
}
function numOrNull(v: unknown): number | null {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

/** server_maps: a text[]; anything that is not a string is dropped, a non-array is null. */
export function parseMapList(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null
  return raw.filter((m): m is string => typeof m === 'string')
}

/** The rows of map_rebuild_requests_admin, newest first; a row that is not a request is dropped, a non-array is null. */
export function parseRequests(raw: unknown): RebuildRequest[] | null {
  if (!Array.isArray(raw)) return null
  const out: RebuildRequest[] = []
  for (const r of raw) {
    if (!isRecord(r)) continue
    const id = numOrNull(r.id)
    const serverId = strOrNull(r.server_id)
    const requestedAt = strOrNull(r.requested_at)
    const status = STATUSES.find((s) => s === r.status)
    if (id === null || serverId === null || requestedAt === null || !status) continue
    out.push({
      id,
      serverId,
      requestedAt,
      maps: parseMapList(r.maps) ?? [],
      note: strOrNull(r.note),
      status,
      claimedAt: strOrNull(r.claimed_at),
      claimedBy: strOrNull(r.claimed_by),
      heartbeatAt: strOrNull(r.heartbeat_at),
      finishedAt: strOrNull(r.finished_at),
      commitSha: strOrNull(r.commit_sha),
      log: typeof r.log === 'string' && r.log !== '' ? r.log : null,
    })
  }
  return out.sort((a, b) => Date.parse(b.requestedAt) - Date.parse(a.requestedAt) || b.id - a.id)
}

export interface MapRebuildApi {
  /** The server's Map= list (public function), in Map= order, helpers included as written. */
  fetchServerMaps(server: string): Promise<MapRebuildResult<string[]>>
  fetchRequests(server: string, limit?: number): Promise<MapRebuildResult<RebuildRequest[]>>
  requestRebuild(server: string, note: string): Promise<MapRebuildResult<number>>
  cancelRebuild(id: number): Promise<MapRebuildResult<boolean>>
}

export function createMapRebuildApi(call: RpcCall): MapRebuildApi {
  async function run(name: string, args: Record<string, unknown>): Promise<MapRebuildResult<unknown>> {
    try {
      const { data, error } = await call(name, args)
      if (error) return { ok: false, ...failureOf(error) }
      return { ok: true, value: data }
    } catch {
      return { ok: false, reason: 'network' }
    }
  }
  return {
    async fetchServerMaps(server) {
      const r = await run('server_maps', { p_server: server })
      if (!r.ok) return r
      const list = parseMapList(r.value)
      return list ? { ok: true, value: list } : { ok: false, reason: 'malformed' }
    },
    async fetchRequests(server, limit = 20) {
      const r = await run('map_rebuild_requests_admin', { p_server: server, p_limit: limit })
      if (!r.ok) return r
      const rows = parseRequests(r.value)
      return rows ? { ok: true, value: rows } : { ok: false, reason: 'malformed' }
    },
    async requestRebuild(server, note) {
      const r = await run('request_map_rebuild', { p_server: server, p_note: note })
      if (!r.ok) return r
      const id = numOrNull(r.value)
      return id !== null ? { ok: true, value: id } : { ok: false, reason: 'malformed' }
    },
    async cancelRebuild(id) {
      const r = await run('cancel_map_rebuild', { p_id: id })
      if (!r.ok) return r
      return typeof r.value === 'boolean' ? { ok: true, value: r.value } : { ok: false, reason: 'malformed' }
    },
  }
}
