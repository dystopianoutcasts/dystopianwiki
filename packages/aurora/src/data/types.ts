// Row shapes as the aurora schema serves them (supabase/migrations/008..010).
// Columns that clients are not granted (linked_user_id, last_saved_x/y) are absent on purpose.

export interface PlayerPublic {
  server_id: string
  username: string
  display_name: string | null
  last_seen: string | null
  online: boolean
  hours_survived: number | null
  is_dead: boolean | null
}

/** Row of the player_positions_visible view: live for own/safehouse/admin, delayed and rounded otherwise. */
export interface VisiblePosition {
  server_id: string
  username: string
  x: number
  y: number
  z: number
  t: string | null
  vehicle_id: number | null
  is_delayed: boolean
  is_rounded: boolean
}

export interface Vehicle {
  server_id: string
  vehicle_id: number
  script_name: string | null
  x: number
  y: number
  z: number
  t: string | null
  driver_username: string | null
  /** Migration 028 (public view and admin RPC; absent on the admin fallback table read): the owner's name when claimed. */
  claimed_by?: string | null
  /** The car's persistent id; stable across restarts, unlike `vehicle_id`. */
  sql_id?: number | null
  /** Not loaded now: drawn at the claim ledger's last-known position. `vehicle_id` is negative for these. */
  from_ledger?: boolean
  /** Admin RPC only: when the claim was made. */
  claimed_at?: string | null
}

export interface Safehouse {
  server_id: string
  id: string
  x: number
  y: number
  w: number
  h: number
  owner: string | null
  title: string | null
}

export interface Zone {
  server_id: string
  kind: string
  title: string
  x1: number
  y1: number
  x2: number | null
  y2: number | null
}

export interface ZombieCell {
  server_id: string
  cell_x: number
  cell_y: number
  count: number | null
  t: string | null
}

export interface MapObject {
  id: string
  server_id: string
  kind: string | null
  x: number
  y: number
  label: string | null
}

export interface HealthSample {
  server_id: string
  t: string
  players: number | null
  zombies_total: number | null
  zombies_loaded: number | null
  zombies_simulated: number | null
  /** Main-loop cycle duration in ms (the engine counter named `fps`, a duration despite its name). */
  tick_ms: number | null
  /** Shortest and longest cycle over the last one-second window; a stall shows up here first. */
  tick_min_ms: number | null
  tick_max_ms: number | null
  memory_used: number | null
  memory_max: number | null
}

export interface LinkCode {
  code: string
  created_at: string
  consumed_at: string | null
  username: string | null
}

/** Row of `aurora.npc_groups_visible` (migration 029). The database already withholds spoilers and
 * groups not seen in the last 3 minutes; the admin RPC adds the fields marked below. */
export interface NpcGroup {
  server_id: string
  group_id: string
  faction_name: string | null
  /** hostile | careful | neutral | friendly | allied; null when the faction has no stance. */
  stance: string | null
  size: number
  x: number
  y: number
  z: number
  /** False: not near any player right now (dormant). */
  active: boolean
  t: string | null
  /** Admin RPC only. */
  faction_id?: string | null
  source?: 'actor' | 'squad' | null
  encounter?: string | null
  /** A group the public view would not show; the RPC returns it for admins only. */
  sensitive?: boolean
}

/** Row of `aurora.deaths_visible` (migration 030): one per player, their most recent death, with no age
 * limit. The admin RPC `deaths_admin` returns every death instead, plus `src`. */
export interface Death {
  server_id: string
  username: string
  x: number
  y: number
  z: number
  t: string
  hours_survived: number | null
  /** Admin RPC only. */
  src?: string | null
}

/** Row of `aurora.npc_outposts_visible` (migration 029); corners are world squares. */
export interface NpcOutpost {
  server_id: string
  outpost_id: string
  faction_name: string | null
  stance: string | null
  hostile: boolean
  x1: number
  y1: number
  x2: number
  y2: number
  t: string | null
  /** Admin RPC only. */
  faction_id?: string | null
  state?: string | null
  hidden?: boolean
}
