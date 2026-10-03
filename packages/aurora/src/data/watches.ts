// T72 "Watch for a car": the signed-in viewer's watch list (T71 contract, migration 038).
// `aurora.vehicle_watches` holds one row per (user, server, script); row level security limits every
// read and write to the caller's own rows and the database fills `user_id`, so it is never sent.
// Until 038 is applied the table does not exist: that is "not switched on yet", asked once per session.
import type { SupabaseClient } from '@supabase/supabase-js'

export const WATCHES_TABLE = 'vehicle_watches'
/** The database's own limit (038); checked here too so a doomed request is never sent. */
export const WATCH_LIMIT = 100

export type WatchErrorKind = 'off' | 'limit' | 'failed'

export const WATCH_MESSAGES: Record<WatchErrorKind, string> = {
  limit: `You can watch up to ${WATCH_LIMIT} cars.`,
  off: 'Watching for cars is not switched on yet.',
  failed: 'Could not save your watch list. Please try again.',
}

type DbError = { message: string; code?: string } | null

/** Thrown by the requests below, carrying what the panel should say. */
export class WatchError extends Error {
  readonly kind: WatchErrorKind
  constructor(kind: WatchErrorKind, detail: string) {
    super(detail)
    this.kind = kind
  }
}

/** PGRST205 / 42P01: the table is missing (038 not applied). 23514 or the named check: over the limit. */
export function watchErrorKind(error: { message: string; code?: string }): WatchErrorKind {
  if (error.code === 'PGRST205' || error.code === '42P01' || /could not find the table|relation .* does not exist/i.test(error.message)) return 'off'
  if (error.code === '23514' || /vehicle_watches_limit/.test(error.message)) return 'limit'
  return 'failed'
}

function fail(error: { message: string; code?: string }): never {
  throw new WatchError(watchErrorKind(error), `vehicle watches: ${error.message}`)
}

/** The script names this account watches on this server. */
export async function fetchWatches(db: SupabaseClient, serverId: string): Promise<string[]> {
  const { data, error } = (await db.from(WATCHES_TABLE).select('script_name').eq('server_id', serverId)) as unknown as {
    data: { script_name: string }[] | null
    error: DbError
  }
  if (error) fail(error)
  return (data ?? []).map((r) => r.script_name).filter((s): s is string => typeof s === 'string' && s !== '')
}

export async function addWatches(db: SupabaseClient, serverId: string, names: readonly string[]): Promise<void> {
  if (names.length === 0) return
  const rows = names.map((script_name) => ({ server_id: serverId, script_name }))
  const { error } = (await db.from(WATCHES_TABLE).upsert(rows, { onConflict: 'user_id,server_id,script_name', ignoreDuplicates: true })) as unknown as { error: DbError }
  if (error) fail(error)
}

export async function removeWatches(db: SupabaseClient, serverId: string, names: readonly string[]): Promise<void> {
  if (names.length === 0) return
  const { error } = (await db.from(WATCHES_TABLE).delete().eq('server_id', serverId).in('script_name', [...names])) as unknown as { error: DbError }
  if (error) fail(error)
}

export type WatchUpdate = (fn: (prev: ReadonlySet<string>) => ReadonlySet<string>) => void

/**
 * An optimistic add or remove. `current` is the list as the viewer sees it now; only the names that
 * actually change are sent. The change is shown at once through `update`; on failure exactly those
 * names are put back (other changes made meanwhile are kept) and the reason is returned. Returns
 * null on success or when nothing changes.
 */
export async function changeWatches(
  db: SupabaseClient,
  serverId: string,
  op: 'add' | 'remove',
  names: readonly string[],
  current: ReadonlySet<string>,
  update: WatchUpdate,
): Promise<WatchErrorKind | null> {
  const changed = [...new Set(names)].filter((n) => (op === 'add' ? !current.has(n) : current.has(n)))
  if (changed.length === 0) return null
  if (op === 'add' && current.size + changed.length > WATCH_LIMIT) return 'limit'
  const apply = (prev: ReadonlySet<string>, adding: boolean): ReadonlySet<string> => {
    const next = new Set(prev)
    for (const n of changed) {
      if (adding) next.add(n)
      else next.delete(n)
    }
    return next
  }
  update((prev) => apply(prev, op === 'add'))
  try {
    if (op === 'add') await addWatches(db, serverId, changed)
    else await removeWatches(db, serverId, changed)
    return null
  } catch (e) {
    update((prev) => apply(prev, op !== 'add'))
    return e instanceof WatchError ? e.kind : 'failed'
  }
}
