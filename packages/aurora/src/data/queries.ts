// Read queries. Visibility is enforced by the database (RLS, column grants and the
// player_positions_visible view); nothing here filters "for privacy". A dataset the caller
// may not read comes back as an error or an empty list, and the UI just shows that.
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  HealthSample,
  LinkCode,
  MapObject,
  PlayerPublic,
  Safehouse,
  VisiblePosition,
  Vehicle,
  Zone,
  ZombieCell,
} from './types'

async function rows<T>(query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>, what: string): Promise<T[]> {
  const { data, error } = await query
  if (error) throw new Error(`${what}: ${error.message}`)
  return data ?? []
}

/** Public visibility setting: how late and how coarse other players' positions are. */
export async function fetchVisibility(db: SupabaseClient): Promise<{ delayMinutes: number; roundToCell: boolean; anonPositions: boolean } | null> {
  const list = await rows<{ key: string; value: Record<string, unknown> }>(
    db.from('settings').select('key,value').eq('key', 'visibility'),
    'visibility',
  )
  const v = list[0]?.value
  if (!v) return null
  return {
    delayMinutes: typeof v.delayMinutes === 'number' ? v.delayMinutes : 30,
    roundToCell: v.roundToCell !== false,
    anonPositions: v.anonPositions === true,
  }
}

// The live datasets (T23) take an optional `since`: with it, only rows strictly newer
// than that timestamp come back, and the caller merges them (live.ts).

/** Every player profile the map may show, online or not. Positions come from the view, which applies delay and rounding. */
export function fetchPlayerProfiles(db: SupabaseClient, serverId: string, since?: string): Promise<PlayerPublic[]> {
  const q = db
    .from('players_public')
    .select('server_id,username,display_name,last_seen,online,hours_survived,is_dead')
    .eq('server_id', serverId)
  return rows<PlayerPublic>(since ? q.gt('last_seen', since) : q, 'players')
}

export function fetchPositions(db: SupabaseClient, serverId: string, since?: string): Promise<VisiblePosition[]> {
  const q = db
    .from('player_positions_visible')
    .select('server_id,username,x,y,z,t,vehicle_id,is_delayed,is_rounded')
    .eq('server_id', serverId)
  return rows<VisiblePosition>(since ? q.gt('t', since) : q, 'positions')
}

export function fetchVehicles(db: SupabaseClient, serverId: string, since?: string): Promise<Vehicle[]> {
  const q = db
    .from('vehicles')
    .select('server_id,vehicle_id,script_name,x,y,z,t,driver_username')
    .eq('server_id', serverId)
  return rows<Vehicle>(since ? q.gt('t', since) : q, 'vehicles')
}

/** Whether `aurora.vehicles_admin` exists (migration 028). Null until the first admin
 * vehicle read decides; then fixed for the session. */
let adminRpc: boolean | null = null

/** Test seam: forget the session's decision about the admin RPC. */
export function resetVehicleAdminProbe(): void {
  adminRpc = null
}

/** A missing function: PostgREST PGRST202, surfaced as a 404 "Could not find the function". */
function isMissingFunction(error: { message: string; code?: string }): boolean {
  return error.code === 'PGRST202' || /could not find the function/i.test(error.message)
}

/**
 * The admin vehicle read: `aurora.vehicles_admin` (migration 028), the same row set as
 * the public view (24 h filter, claims, ledger cars) plus the driver and `claimed_at`.
 * An RPC has no `t > since`, so every call is a full fetch (useAuroraData polls it that
 * way). A non-admin gets zero rows, not an error. Until 028 is live the function does
 * not exist; one such failure falls back to the raw table read for the session.
 */
export async function fetchVehiclesAdmin(db: SupabaseClient, serverId: string): Promise<Vehicle[]> {
  if (adminRpc !== false) {
    const { data, error } = (await db.rpc('vehicles_admin', { p_server: serverId })) as {
      data: Vehicle[] | null
      error: { message: string; code?: string } | null
    }
    if (!error) {
      adminRpc = true
      return (data ?? []).map((v) => ({ ...v, claimed_by: v.claimed_by ?? null, sql_id: v.sql_id ?? null, from_ledger: v.from_ledger === true }))
    }
    if (!isMissingFunction(error)) throw new Error(`vehicles: ${error.message}`)
    adminRpc = false
  }
  return fetchVehicles(db, serverId)
}

const VEHICLE_COLUMNS = 'server_id,vehicle_id,script_name,x,y,z,t'
const VEHICLE_CLAIM_COLUMNS = `${VEHICLE_COLUMNS},claimed_by,sql_id,from_ledger`

/** Whether `aurora.vehicles_visible` has the claim columns (migration 028). Null until
 * the first public vehicle read decides; then fixed for the session, so a database that
 * lacks them costs one failed request, not one per poll. */
let claimColumns: boolean | null = null

/** Test seam: forget the session's decision about the claim columns. */
export function resetVehicleClaimProbe(): void {
  claimColumns = null
}

/** PostgREST fails the whole request when a selected column is missing: Postgres 42703,
 * surfaced as a 400 whose message names the column. */
function isMissingColumn(error: { message: string; code?: string }): boolean {
  return error.code === '42703' || /column .* does not exist/i.test(error.message)
}

/**
 * The public vehicle surface (VISIBILITY.md, T35/022): type and position for everyone,
 * never the driver. Reads `aurora.vehicles_visible`, which carries no driver column at
 * all, so `driver_username: null` here is not a redaction - it is filled in only so the
 * row has the same shape `vehicleFeatures` already expects from the admin query.
 *
 * Migration 028 adds `claimed_by`, `sql_id` and `from_ledger` to the view. Until it is
 * live, asking for them fails the whole request, so one such failure retries with the
 * original seven columns and the claim fields come back null/false.
 */
export async function fetchVehiclesPublic(db: SupabaseClient, serverId: string, since?: string): Promise<Vehicle[]> {
  const read = (columns: string) => {
    const q = db.from('vehicles_visible').select(columns).eq('server_id', serverId)
    return since ? q.gt('t', since) : q
  }
  type Row = Omit<Vehicle, 'driver_username'>
  const fill = (list: Row[]): Vehicle[] =>
    list.map((v) => ({
      ...v,
      claimed_by: v.claimed_by ?? null,
      sql_id: v.sql_id ?? null,
      from_ledger: v.from_ledger === true,
      driver_username: null,
    }))
  if (claimColumns !== false) {
    const { data, error } = (await read(VEHICLE_CLAIM_COLUMNS)) as unknown as { data: Row[] | null; error: { message: string; code?: string } | null }
    if (!error) {
      claimColumns = true
      return fill(data ?? [])
    }
    if (!isMissingColumn(error)) throw new Error(`vehicles: ${error.message}`)
    claimColumns = false
  }
  return fill(await rows<Row>(read(VEHICLE_COLUMNS) as unknown as PromiseLike<{ data: Row[] | null; error: { message: string } | null }>, 'vehicles'))
}

export function fetchSafehouses(db: SupabaseClient, serverId: string): Promise<Safehouse[]> {
  return rows<Safehouse>(
    db.from('safehouses').select('server_id,id,x,y,w,h,owner,title').eq('server_id', serverId),
    'safehouses',
  )
}

export function fetchZones(db: SupabaseClient, serverId: string): Promise<Zone[]> {
  return rows<Zone>(
    db.from('zones').select('server_id,kind,title,x1,y1,x2,y2').eq('server_id', serverId),
    'zones',
  )
}

export function fetchZombieGrid(db: SupabaseClient, serverId: string): Promise<ZombieCell[]> {
  return rows<ZombieCell>(
    db.from('zombie_grid').select('server_id,cell_x,cell_y,count,t').eq('server_id', serverId),
    'zombie grid',
  )
}

export function fetchMapObjects(db: SupabaseClient, serverId: string): Promise<MapObject[]> {
  return rows<MapObject>(
    db.from('map_objects').select('id,server_id,kind,x,y,label').eq('server_id', serverId),
    'map objects',
  )
}

/** Samples from the last `minutes`, oldest first, ready to plot. */
export function fetchHealthSince(db: SupabaseClient, serverId: string, minutes: number): Promise<HealthSample[]> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString()
  return rows<HealthSample>(
    db
      .from('health_samples')
      .select('server_id,t,players,zombies_total,zombies_loaded,zombies_simulated,tick_ms,tick_min_ms,tick_max_ms,memory_used,memory_max')
      .eq('server_id', serverId)
      .gte('t', since)
      .order('t', { ascending: true }),
    'health',
  )
}

/** Samples strictly newer than `since`, oldest first: the health series' delta poll. */
export function fetchHealthAfter(db: SupabaseClient, serverId: string, since: string): Promise<HealthSample[]> {
  return rows<HealthSample>(
    db
      .from('health_samples')
      .select('server_id,t,players,zombies_total,zombies_loaded,zombies_simulated,tick_ms,tick_min_ms,tick_max_ms,memory_used,memory_max')
      .eq('server_id', serverId)
      .gt('t', since)
      .order('t', { ascending: true }),
    'health',
  )
}

/** Newest health sample regardless of age, so the panel can say "last seen N minutes ago". */
export async function fetchLatestHealth(db: SupabaseClient, serverId: string): Promise<HealthSample | null> {
  const list = await rows<HealthSample>(
    db
      .from('health_samples')
      .select('server_id,t,players,zombies_total,zombies_loaded,zombies_simulated,tick_ms,tick_min_ms,tick_max_ms,memory_used,memory_max')
      .eq('server_id', serverId)
      .order('t', { ascending: false })
      .limit(1),
    'latest health',
  )
  return list[0] ?? null
}

export function fetchMyLinkCodes(db: SupabaseClient): Promise<LinkCode[]> {
  return rows<LinkCode>(
    db.from('link_codes').select('code,created_at,consumed_at,username').order('created_at', { ascending: false }).limit(5),
    'link codes',
  )
}

/** Insert a link code row. The database generates the code; only user_id is granted for insert. */
export async function createLinkCode(db: SupabaseClient, userId: string): Promise<LinkCode> {
  const { data, error } = await db
    .from('link_codes')
    .insert({ user_id: userId })
    .select('code,created_at,consumed_at,username')
    .single()
  if (error) throw new Error(`link code: ${error.message}`)
  return data as LinkCode
}
