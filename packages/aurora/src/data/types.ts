// Row shapes as the aurora schema serves them (supabase/migrations/008..010).
// Columns that clients are not granted (linked_user_id, last_saved_x/y) are absent on purpose.

export interface PlayerPublic {
  server_id: string
  username: string
  display_name: string | null
  last_seen: string | null
  online: boolean
  hours_survived: number | null
  access_level: string | null
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
  players: string[] | null
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
  avg_update_period_ms: number | null
  memory_used: number | null
  memory_max: number | null
}

export interface LinkCode {
  code: string
  created_at: string
  consumed_at: string | null
  username: string | null
}
