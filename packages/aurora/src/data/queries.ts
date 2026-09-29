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
    .select('server_id,username,display_name,last_seen,online,hours_survived,access_level,is_dead')
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

export function fetchSafehouses(db: SupabaseClient, serverId: string): Promise<Safehouse[]> {
  return rows<Safehouse>(
    db.from('safehouses').select('server_id,id,x,y,w,h,owner,title,players').eq('server_id', serverId),
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
