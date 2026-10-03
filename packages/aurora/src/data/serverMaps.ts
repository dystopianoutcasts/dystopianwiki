// T50: the server's Map= list for the live map, and (admins only) whether a new world is
// waiting to be confirmed. Read on load and every SERVER_MAPS_POLL_MS; a missing function
// on a pre-033 database is "unknown" (null), and the map then draws everything as before.
import type { SupabaseClient } from '@supabase/supabase-js'
import { useDataset } from './useDataset'
import { fetchPendingWorld, fetchServerMaps } from './queries'

/** The map list changes when the owner edits the server's ini, which is rare. */
export const SERVER_MAPS_POLL_MS = 30 * 60_000

export interface ServerMaps {
  /** Map= entries in Map= order; null while unknown (not loaded, or no 033). */
  list: string[] | null
  /** The last read failed: the list is the previous one, and admin notices are held back. */
  error: string | null
  /** Admins only: a pending world exists. False on any error, for everyone else. */
  pendingWorld: boolean
}

export function useServerMaps(client: SupabaseClient, serverId: string, isAdmin: boolean): ServerMaps {
  const maps = useDataset(true, async () => [await fetchServerMaps(client, serverId)], SERVER_MAPS_POLL_MS)
  const pending = useDataset(isAdmin, async () => [await fetchPendingWorld(client, serverId)], SERVER_MAPS_POLL_MS)
  return {
    list: maps.data[0] ?? null,
    error: maps.error,
    pendingWorld: isAdmin && pending.error === null && pending.data[0] === true,
  }
}
