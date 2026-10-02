// Incremental polling (T23 addendum): at a 10 s poll, a full response every time
// would multiply egress, the one metered number a faster poll moves. So a live
// dataset asks only for rows newer than the newest `t` it already holds and merges
// them in; a full fetch runs on load and every INGEST_INTERVAL_MS as a self-heal,
// which is also what removes rows the delta cannot see disappear (a vehicle that
// despawned, a player flipped offline by a heartbeat without a new position).
//
// The delta filter is strictly greater-than: a row arriving later with the SAME `t`
// as the newest one held (two players sampled in the same exporter pass, split
// across two ingest reads) is missed until the next full fetch, at most 60 s. `gte`
// would close that gap by resending the newest rows on every poll, which is exactly
// the idle cost this is here to avoid.

/** The newest timestamp among the rows, as the ISO string the database returned, or null. */
export function newestT<T>(rows: readonly T[], tOf: (row: T) => string | null): string | null {
  let best: string | null = null
  let bestMs = -Infinity
  for (const row of rows) {
    const t = tOf(row)
    if (t == null) continue
    const ms = Date.parse(t)
    if (Number.isNaN(ms)) continue
    if (ms > bestMs) {
      bestMs = ms
      best = t
    }
  }
  return best
}

/**
 * Merge a delta into the held rows: a delta row replaces the held row with the same
 * key, a new key is appended. Held rows the delta does not mention are kept.
 * Returns the held array itself when the delta is empty, so an idle poll does not
 * re-render anything.
 */
export function mergeByKey<T>(held: readonly T[], delta: readonly T[], keyOf: (row: T) => string): T[] {
  if (delta.length === 0) return held as T[]
  const byKey = new Map<string, T>()
  for (const row of held) byKey.set(keyOf(row), row)
  for (const row of delta) byKey.set(keyOf(row), row)
  return [...byKey.values()]
}

/**
 * Which request a tick makes. Tick 0 (load) and every `fullEvery`-th tick after it
 * are full fetches; so is any tick while nothing is held yet, because there is no
 * `t` to ask "newer than" about. Everything else is a delta. `fullEvery` null means
 * no periodic self-heal at all: for an append-only dataset (health samples) nothing
 * held can change or vanish, so a full refetch would only resend what is held.
 */
export function tickKind(tick: number, fullEvery: number | null, since: string | null): 'full' | 'delta' {
  if (since === null || tick === 0) return 'full'
  if (fullEvery === null) return 'delta'
  if (fullEvery <= 1 || tick % fullEvery === 0) return 'full'
  return 'delta'
}

/**
 * A vehicle row's identity: `q<sql_id>` (the persistent id) when known, else
 * `i<vehicle_id>`. The prefixes keep the two id spaces apart, so a row without a
 * `sql_id` whose game id equals another car's `sql_id` is not the same car. Shared by the
 * poll merge and the map feature key so they cannot drift.
 */
export function vehicleKey(v: { sql_id?: number | null; vehicle_id: number }): string {
  return v.sql_id != null ? `q${v.sql_id}` : `i${v.vehicle_id}`
}
