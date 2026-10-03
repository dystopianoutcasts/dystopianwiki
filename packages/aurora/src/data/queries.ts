// Read queries. Visibility is enforced by the database (RLS, column grants and the
// player_positions_visible view); nothing here filters "for privacy". A dataset the caller
// may not read comes back as an error or an empty list, and the UI just shows that.
import { VEHICLE_NAMES_VIEW, VEHICLE_NAME_COLUMNS } from './vehicleNames'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Death,
  HealthSample,
  LinkCode,
  MapObject,
  NpcGroup,
  NpcOutpost,
  PlayerPublic,
  Safehouse,
  VisiblePosition,
  Vehicle,
  VehicleName,
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

// ---- A-Life NPCs (migration 029) ----------------------------------------------------
// Public views for everyone, admin RPCs for the extra fields. Until 029 is live none of
// them exist; that is "layer unavailable" (empty, no error banner), not a failure.

/** How long a missing view or function is left alone before the next attempt. */
export const NPC_RETRY_MS = 5 * 60_000

interface Gate {
  /** Epoch ms before which the thing is not asked for again. */
  until: number
  logged: boolean
}

const npcGates = {
  groupsView: { until: 0, logged: false },
  groupsRpc: { until: 0, logged: false },
  outpostsView: { until: 0, logged: false },
  outpostsRpc: { until: 0, logged: false },
  deathsView: { until: 0, logged: false },
  deathsRpc: { until: 0, logged: false },
  vehicleNamesView: { until: 0, logged: false },
  serverMapsRpc: { until: 0, logged: false },
  pendingWorldRpc: { until: 0, logged: false },
} satisfies Record<string, Gate>

/** Test seam: forget which NPC views and functions were found missing. */
export function resetNpcProbe(): void {
  for (const g of Object.values(npcGates)) {
    g.until = 0
    g.logged = false
  }
}

/** A missing view: PostgREST PGRST205 (not in the schema cache) or Postgres 42P01 (undefined table). */
function isMissingRelation(error: { message: string; code?: string }): boolean {
  return error.code === 'PGRST205' || error.code === '42P01' || /could not find the table|relation .* does not exist/i.test(error.message)
}

function closeGate(g: Gate, what: string): void {
  g.until = Date.now() + NPC_RETRY_MS
  if (!g.logged) {
    g.logged = true
    console.info(`aurora: ${what} not available yet; retrying every ${NPC_RETRY_MS / 60_000} minutes`)
  }
}

type NpcError = { message: string; code?: string } | null

/**
 * One NPC dataset. An admin asks the RPC first; a missing function (or the view, for
 * everyone) closes that gate for NPC_RETRY_MS, logs once, and the dataset is empty with
 * no error. Any other error is real and thrown. The RPC has no `t > since`, so every
 * call is a full fetch, which suits these small sets.
 */
async function readNpc<T>(
  gates: { view: Gate; rpc: Gate },
  names: { view: string; rpc: string; what: string },
  db: SupabaseClient,
  serverId: string,
  columns: string,
  isAdmin: boolean,
): Promise<T[]> {
  if (isAdmin && Date.now() >= gates.rpc.until) {
    const { data, error } = (await db.rpc(names.rpc, { p_server: serverId })) as { data: T[] | null; error: NpcError }
    if (!error) return data ?? []
    if (!isMissingFunction(error)) throw new Error(`${names.what}: ${error.message}`)
    closeGate(gates.rpc, `aurora.${names.rpc}`)
  }
  if (Date.now() < gates.view.until) return []
  const { data, error } = (await db.from(names.view).select(columns).eq('server_id', serverId)) as unknown as { data: T[] | null; error: NpcError }
  if (!error) return data ?? []
  if (!isMissingRelation(error)) throw new Error(`${names.what}: ${error.message}`)
  closeGate(gates.view, `aurora.${names.view}`)
  return []
}

const NPC_GROUP_COLUMNS = 'server_id,group_id,faction_name,stance,size,x,y,z,active,t'
const NPC_OUTPOST_COLUMNS = 'server_id,outpost_id,faction_name,stance,hostile,x1,y1,x2,y2,t'

export function fetchNpcGroups(db: SupabaseClient, serverId: string, isAdmin: boolean): Promise<NpcGroup[]> {
  return readNpc<NpcGroup>(
    { view: npcGates.groupsView, rpc: npcGates.groupsRpc },
    { view: 'npc_groups_visible', rpc: 'npc_groups_admin', what: 'npc groups' },
    db,
    serverId,
    NPC_GROUP_COLUMNS,
    isAdmin,
  )
}

export function fetchNpcOutposts(db: SupabaseClient, serverId: string, isAdmin: boolean): Promise<NpcOutpost[]> {
  return readNpc<NpcOutpost>(
    { view: npcGates.outpostsView, rpc: npcGates.outpostsRpc },
    { view: 'npc_outposts_visible', rpc: 'npc_outposts_admin', what: 'npc outposts' },
    db,
    serverId,
    NPC_OUTPOST_COLUMNS,
    isAdmin,
  )
}

/** The vehicle name catalogue (migration 031). Missing before 031: empty, no error, retried no sooner than NPC_RETRY_MS. */
export async function fetchVehicleNames(db: SupabaseClient): Promise<VehicleName[]> {
  if (Date.now() < npcGates.vehicleNamesView.until) return []
  const { data, error } = (await db.from(VEHICLE_NAMES_VIEW).select(VEHICLE_NAME_COLUMNS)) as unknown as { data: VehicleName[] | null; error: NpcError }
  if (!error) return data ?? []
  if (!isMissingRelation(error)) throw new Error(`vehicle names: ${error.message}`)
  closeGate(npcGates.vehicleNamesView, `aurora.${VEHICLE_NAMES_VIEW}`)
  return []
}

/**
 * The server's `Map=` entries in Map= order (migration 033, T50), or null when unknown.
 * Before 033 the function is missing: null (the map draws everything, as before), the
 * gate rests NPC_RETRY_MS and logs once, the same as the NPC sets. Any other error throws;
 * the caller keeps what it had.
 */
export async function fetchServerMaps(db: SupabaseClient, serverId: string): Promise<string[] | null> {
  if (Date.now() < npcGates.serverMapsRpc.until) return null
  const { data, error } = (await db.rpc('server_maps', { p_server: serverId })) as { data: unknown; error: NpcError }
  if (!error) return Array.isArray(data) ? data.filter((s): s is string => typeof s === 'string') : null
  if (!isMissingFunction(error)) throw new Error(`server maps: ${error.message}`)
  closeGate(npcGates.serverMapsRpc, 'aurora.server_maps')
  return null
}

/**
 * Whether a new world is waiting for an admin to confirm it (migration 033 over 032).
 * FALSE for a non-admin (the database's gate), and FALSE while the function is missing
 * (gated like the rest). Any other error throws; the caller shows no notice.
 */
export async function fetchPendingWorld(db: SupabaseClient, serverId: string): Promise<boolean> {
  if (Date.now() < npcGates.pendingWorldRpc.until) return false
  const { data, error } = (await db.rpc('pending_world_exists', { p_server: serverId })) as { data: unknown; error: NpcError }
  if (!error) return data === true
  if (!isMissingFunction(error)) throw new Error(`pending world: ${error.message}`)
  closeGate(npcGates.pendingWorldRpc, 'aurora.pending_world_exists')
  return false
}

const DEATH_COLUMNS ='server_id,username,x,y,z,t,hours_survived'

/** Death markers (migration 030), read like the NPC sets: until 030 is live the layer is empty with no
 * error. The public view holds each player's latest death; the admin RPC returns all of them (and `src`),
 * which the transform reduces to the latest per player. */
export function fetchDeaths(db: SupabaseClient, serverId: string, isAdmin: boolean): Promise<Death[]> {
  return readNpc<Death>(
    { view: npcGates.deathsView, rpc: npcGates.deathsRpc },
    { view: 'deaths_visible', rpc: 'deaths_admin', what: 'deaths' },
    db,
    serverId,
    DEATH_COLUMNS,
    isAdmin,
  )
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
