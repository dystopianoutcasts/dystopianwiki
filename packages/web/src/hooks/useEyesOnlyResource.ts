/**
 * Loads something from the EYES ONLY area for the signed-in member, for the two EYES ONLY
 * pages. The pages show the ordinary 404 for every refusal (signed out, not an executive,
 * missing document, network failure), so this reports only three states and never why.
 * The database is the gate; this hook only waits for the session before asking.
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { ApiResult } from '../lib/adminApi'

export type EyesOnlyResource<T> = { status: 'loading' } | { status: 'denied' } | { status: 'ready'; value: T }

/** `load` must be stable (a module-level function or a useCallback keyed on its inputs). */
export function useEyesOnlyResource<T>(load: () => Promise<ApiResult<T>>): EyesOnlyResource<T> {
  const { user, loading } = useAuth()
  const userId = user ? user.id : null
  const [state, setState] = useState<EyesOnlyResource<T>>({ status: 'loading' })

  useEffect(() => {
    if (loading) return
    if (userId === null) {
      setState({ status: 'denied' })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    void load().then((result) => {
      if (cancelled) return
      setState(result.ok ? { status: 'ready', value: result.value } : { status: 'denied' })
    })
    return () => {
      cancelled = true
    }
  }, [loading, userId, load])

  return state
}
