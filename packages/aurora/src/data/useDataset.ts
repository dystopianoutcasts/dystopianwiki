import { useCallback, useEffect, useRef, useState } from 'react'
import { catchUpKind, onPageShown, pageHidden } from './pageVisibility'

export interface Dataset<T> {
  data: T[]
  error: string | null
  loading: boolean
  refresh: () => void
}

/**
 * Load a list, optionally on a timer, and expose a manual refresh (e.g. on sign-in/out).
 * `enabled = false` skips the request (used for layers that are switched off). A stale
 * response from an earlier request never overwrites a newer one. The timer skips its
 * request while the tab is hidden, and a returning tab catches up at once if a poll is due.
 */
export function useDataset<T>(enabled: boolean, fetcher: () => Promise<T[]>, intervalMs: number | null): Dataset<T> {
  const [data, setData] = useState<T[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const seq = useRef(0)
  const lastStart = useRef(0)

  const load = useCallback(async () => {
    const mine = ++seq.current
    lastStart.current = Date.now()
    setLoading(true)
    try {
      const rows = await fetcherRef.current()
      if (mine !== seq.current) return
      setData(rows)
      setError(null)
    } catch (e) {
      if (mine !== seq.current) return
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (mine === seq.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void load()
    if (intervalMs === null) return
    const id = setInterval(() => {
      if (!pageHidden()) void load()
    }, intervalMs)
    const off = onPageShown(() => {
      if (catchUpKind(Date.now() - lastStart.current, intervalMs, null) !== 'none') void load()
    })
    return () => {
      clearInterval(id)
      off()
    }
  }, [enabled, intervalMs, load])

  const refresh = useCallback(() => void load(), [load])
  return { data, error, loading, refresh }
}
