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
 * `t` to ask "newer than" about. Everything else is a delta.
 */
export function tickKind(tick: number, fullEvery: number, since: string | null): 'full' | 'delta' {
  if (since === null) return 'full'
  if (fullEvery <= 1 || tick % fullEvery === 0) return 'full'
  return 'delta'
}
