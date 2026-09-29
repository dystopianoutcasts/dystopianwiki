// Whether the signed-in visitor is an Aurora admin (VISIBILITY.md: the only role split
// the map cares about). `aurora.is_aurora_admin()` takes no arguments, returns BOOLEAN,
// and EXECUTE is granted to anon/authenticated/service_role - an anonymous caller gets
// false back rather than an error, but this hook skips the request entirely while
// signed out, since there is nothing to ask about.
import { useEffect, useState } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * True only for exactly `{ data: true, error: null }`. Any error, any other value
 * (including `false`, `null`, or a non-boolean), reads as not-admin - a broken or
 * denied RPC must never fail open.
 */
export function adminFromRpc(result: { data: unknown; error: unknown }): boolean {
  return result.error === null && result.data === true
}

/**
 * False while `user` is null, without a request. Re-checks once whenever the signed-in
 * user's id changes, resetting to false first so a stale `true` from a previous account
 * can never leak across a sign-out/sign-in or an account switch.
 */
export function useIsAdmin(client: SupabaseClient, user: User | null): boolean {
  const [isAdmin, setIsAdmin] = useState(false)
  const uid = user?.id ?? null

  useEffect(() => {
    setIsAdmin(false)
    if (uid === null) return
    let cancelled = false
    void (async () => {
      try {
        const result = await client.rpc('is_aurora_admin')
        if (!cancelled) setIsAdmin(adminFromRpc(result))
      } catch {
        if (!cancelled) setIsAdmin(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  return isAdmin
}
