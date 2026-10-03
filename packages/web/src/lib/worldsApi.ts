/**
 * The admin page's calls for the Aurora world record (migration 032, task T47). The six
 * functions live in schema `aurora`; this file is pure of the Supabase client (the caller
 * passes `rpc`), so the reason mapping and the parsing are tested without a browser
 * (worldsApi.test.ts). worldsClient.ts binds it to the real client.
 *
 * Nothing here throws: failures come back as values. Before 032 is live every function
 * answers PGRST202; that is the reason 'missing', and the panel shows one line for it.
 */
import { isMissingFunction, type RpcCall } from './homeSummaryRpc'
import { classifyRpcError } from './mascotVoteLogic'

export type WorldStatus = 'current' | 'ended' | 'pending' | 'void'
export type DetectedBy = 'exporter' | 'admin' | 'migration'

export interface World {
  worldId: string
  seq: number
  /** NULL for a world the migration or an admin created. */
  exporterWorldId: string | null
  status: WorldStatus
  detectedBy: DetectedBy
  startedAt: string
  endedAt: string | null
  worldAgeHoursAtStart: number | null
  note: string | null
}

export interface PendingWorld {
  worldId: string
  startedAt: string | null
  worldAgeHoursAtStart: number | null
}

export interface Leftovers {
  /** Non-zero counts only, in the server's order. */
  counts: Array<{ key: string; count: number }>
  vehicleClaimsStale: number
  pending: PendingWorld | null
}

export type FailureReason = 'login' | 'network' | 'malformed' | 'refused' | 'missing'
export type WorldsResult<T> = { ok: true; value: T } | { ok: false; reason: FailureReason; detail?: string }

type RpcError = { message: string; code?: string; status?: unknown }

/**
 * Why a call failed. PGRST202 is 'missing' (032 not applied); P0001 is a refusal the
 * database meant, and its message is kept in `detail` because the undo refusal is written
 * for the admin; the other refusal codes match adminApi's reasonOf.
 */
export function failureOf(error: RpcError): { reason: FailureReason; detail?: string } {
  if (isMissingFunction(error)) return { reason: 'missing' }
  if (error.code === 'P0001') return { reason: 'refused', detail: error.message.trim() || undefined }
  if (error.code === '55000' || error.code === 'P0002' || error.code === '22004') return { reason: 'refused' }
  return { reason: classifyRpcError(error) }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
function numOrNull(v: unknown): number | null {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}
function strOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v : null
}

const STATUSES: readonly WorldStatus[] = ['current', 'ended', 'pending', 'void']
const DETECTORS: readonly DetectedBy[] = ['exporter', 'admin', 'migration']

/** The rows of worlds_admin, newest first; a row that is not a world is dropped, a non-array is null. */
export function parseWorlds(raw: unknown): World[] | null {
  if (!Array.isArray(raw)) return null
  const out: World[] = []
  for (const r of raw) {
    if (!isRecord(r)) continue
    const seq = numOrNull(r.seq)
    const worldId = strOrNull(r.world_id)
    const startedAt = strOrNull(r.started_at)
    const status = STATUSES.find((s) => s === r.status)
    const detectedBy = DETECTORS.find((d) => d === r.detected_by)
    if (seq === null || worldId === null || startedAt === null || !status || !detectedBy) continue
    out.push({
      worldId,
      seq,
      exporterWorldId: strOrNull(r.exporter_world_id),
      status,
      detectedBy,
      startedAt,
      endedAt: strOrNull(r.ended_at),
      worldAgeHoursAtStart: numOrNull(r.world_age_hours_at_start),
      note: strOrNull(r.note),
    })
  }
  return out.sort((a, b) => b.seq - a.seq)
}

/**
 * world_leftovers: a jsonb of per-table counts of rows from non-current worlds, plus
 * `vehicle_claims_stale` and `pending`. Read by shape rather than by a fixed key list:
 * every other key whose value is a positive number is a count.
 */
export function parseLeftovers(raw: unknown): Leftovers | null {
  if (!isRecord(raw)) return null
  let pending: PendingWorld | null = null
  if (isRecord(raw.pending)) {
    const worldId = strOrNull(raw.pending.world_id)
    if (worldId !== null) {
      pending = {
        worldId,
        startedAt: strOrNull(raw.pending.started_at),
        worldAgeHoursAtStart: numOrNull(raw.pending.world_age_hours_at_start),
      }
    }
  }
  const counts: Array<{ key: string; count: number }> = []
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'pending' || key === 'vehicle_claims_stale') continue
    const n = numOrNull(value)
    if (n !== null && n > 0) counts.push({ key, count: n })
  }
  return { counts, vehicleClaimsStale: Math.max(0, numOrNull(raw.vehicle_claims_stale) ?? 0), pending }
}

export interface WorldsApi {
  fetchWorlds(server: string): Promise<WorldsResult<World[]>>
  fetchLeftovers(server: string): Promise<WorldsResult<Leftovers>>
  startNewWorld(server: string, note: string): Promise<WorldsResult<null>>
  confirmPendingWorld(server: string, worldId: string): Promise<WorldsResult<null>>
  dismissPendingWorld(server: string, worldId: string): Promise<WorldsResult<null>>
  undoNewWorld(server: string): Promise<WorldsResult<null>>
}

export function createWorldsApi(call: RpcCall): WorldsApi {
  async function run(name: string, args: Record<string, unknown>): Promise<WorldsResult<unknown>> {
    try {
      const { data, error } = await call(name, args)
      if (error) return { ok: false, ...failureOf(error) }
      return { ok: true, value: data }
    } catch {
      return { ok: false, reason: 'network' }
    }
  }
  async function write(name: string, args: Record<string, unknown>): Promise<WorldsResult<null>> {
    const r = await run(name, args)
    return r.ok ? { ok: true, value: null } : r
  }
  return {
    async fetchWorlds(server) {
      const r = await run('worlds_admin', { p_server: server })
      if (!r.ok) return r
      const rows = parseWorlds(r.value)
      return rows ? { ok: true, value: rows } : { ok: false, reason: 'malformed' }
    },
    async fetchLeftovers(server) {
      const r = await run('world_leftovers', { p_server: server })
      if (!r.ok) return r
      const v = parseLeftovers(r.value)
      return v ? { ok: true, value: v } : { ok: false, reason: 'malformed' }
    },
    startNewWorld: (server, note) => write('start_new_world', { p_server: server, p_note: note }),
    confirmPendingWorld: (server, worldId) => write('confirm_pending_world', { p_server: server, p_world_id: worldId }),
    dismissPendingWorld: (server, worldId) => write('dismiss_pending_world', { p_server: server, p_world_id: worldId }),
    undoNewWorld: (server) => write('undo_new_world', { p_server: server }),
  }
}
