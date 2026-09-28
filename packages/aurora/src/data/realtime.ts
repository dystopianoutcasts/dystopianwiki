// Live updates over Supabase Realtime.
//
// Views are not published to Realtime, so player positions cannot be subscribed to
// directly. Instead the map listens for changes to aurora.player_positions and re-queries
// the player_positions_visible view, which applies the delay, rounding and per-caller
// visibility rules. Realtime only says "something moved"; the database decides what the
// caller may see.
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { trailingDebounce } from '../lib/debounce'
import type { HealthSample } from './types'

export type RealtimeState = 'connecting' | 'live' | 'closed' | 'error'

export interface RealtimeHandlers {
  /** Called (debounced) after any change to player_positions: re-query the view. */
  onPositionsChanged: () => void
  /** Called (debounced) after any change to vehicles: re-query. */
  onVehiclesChanged: () => void
  /** Called for every new health sample. */
  onHealthSample: (row: HealthSample) => void
  onState?: (state: RealtimeState) => void
}

/** Milliseconds to wait for a burst of position events to settle before re-querying. */
export const REFRESH_DEBOUNCE_MS = 400

export function subscribeAurora(db: SupabaseClient, serverId: string, h: RealtimeHandlers): () => void {
  const filter = `server_id=eq.${serverId}`
  const positions = trailingDebounce(h.onPositionsChanged, REFRESH_DEBOUNCE_MS)
  const vehicles = trailingDebounce(h.onVehiclesChanged, REFRESH_DEBOUNCE_MS)

  h.onState?.('connecting')
  const channel: RealtimeChannel = db
    .channel(`aurora-${serverId}`)
    .on('postgres_changes', { event: '*', schema: 'aurora', table: 'player_positions', filter }, () => positions())
    .on('postgres_changes', { event: '*', schema: 'aurora', table: 'vehicles', filter }, () => vehicles())
    .on('postgres_changes', { event: 'INSERT', schema: 'aurora', table: 'health_samples', filter }, (payload) =>
      h.onHealthSample(payload.new as HealthSample),
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') h.onState?.('live')
      else if (status === 'CLOSED') h.onState?.('closed')
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') h.onState?.('error')
    })

  return () => {
    positions.cancel()
    vehicles.cancel()
    void db.removeChannel(channel)
  }
}
