import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dataset } from './useDataset'
import { mergeByKey, newestT, tickKind } from './live'

export interface LiveDatasetOptions<T> {
  enabled: boolean
  fetchFull: () => Promise<T[]>
  /** Rows with `t` strictly after `since`. */
  fetchSince: (since: string) => Promise<T[]>
  keyOf: (row: T) => string
  tOf: (row: T) => string | null
  /** Delta poll interval (LIVE_POLL_MS). */
  liveMs: number
  /** Full self-heal interval (INGEST_INTERVAL_MS), a whole multiple of liveMs; null for append-only data. */
  fullMs: number | null
}

/** T72: useDataset's shape plus `fullSeq`, which counts successful FULL fetches. A delta cannot see
 * a row disappear, so anything that concludes "gone" must wait for `fullSeq` to move. */
export interface LiveDataset<T> extends Dataset<T> {
  fullSeq: number
}

/**
 * useDataset's contract with an incremental poll underneath (T23 addendum; the rules
 * are in live.ts). One timer, one request per tick: every (fullMs / liveMs)-th tick
 * is the full fetch instead of a delta, so the two never race each other. As in
 * useDataset, a response from an older request never overwrites a newer one, and
 * `refresh` (sign-in or out) is always a full fetch.
 */
export function useLiveDataset<T>(opts: LiveDatasetOptions<T>): LiveDataset<T> {
  const [data, setData] = useState<T[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fullSeq, setFullSeq] = useState(0)
  const optsRef = useRef(opts)
  optsRef.current = opts
  const held = useRef<T[]>([])
  const seq = useRef(0)
  const tick = useRef(0)

  const load = useCallback(async (kind: 'full' | 'delta') => {
    const { fetchFull, fetchSince, keyOf, tOf } = optsRef.current
    const since = newestT(held.current, tOf)
    const mode = kind === 'full' || since === null ? 'full' : 'delta'
    const mine = ++seq.current
    setLoading(true)
    try {
      const rows = mode === 'full' ? await fetchFull() : await fetchSince(since as string)
      if (mine !== seq.current) return
      const next = mode === 'full' ? rows : mergeByKey(held.current, rows, keyOf)
      if (next !== held.current) {
        held.current = next
        setData(next)
      }
      if (mode === 'full') setFullSeq((n) => n + 1)
      setError(null)
    } catch (e) {
      if (mine !== seq.current) return
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (mine === seq.current) setLoading(false)
    }
  }, [])

  const { enabled, liveMs, fullMs } = opts
  useEffect(() => {
    if (!enabled) return
    const fullEvery = fullMs === null ? null : Math.max(1, Math.round(fullMs / liveMs))
    tick.current = 0
    void load('full')
    const id = setInterval(() => {
      tick.current++
      void load(tickKind(tick.current, fullEvery, newestT(held.current, optsRef.current.tOf)))
    }, liveMs)
    return () => clearInterval(id)
  }, [enabled, liveMs, fullMs, load])

  // A disabled dataset stays silent even when asked to refresh (sign-in or out).
  const refresh = useCallback(() => {
    if (optsRef.current.enabled) void load('full')
  }, [load])
  return { data, error, loading, refresh, fullSeq }
}
