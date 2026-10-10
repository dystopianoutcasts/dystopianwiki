// Whether the signed-in member is a site admin (KB15), for the account menu's
// "Admin dashboard" option. Each app passes its own call of public.site_is_admin(): the
// wiki's client is on the public schema, the map's on aurora, so the map names the schema.
import { useEffect, useState } from 'react'

export type SiteAdminCheck = () => PromiseLike<{ data: unknown; error: unknown }>

/** Fails closed: only an exact `true` with no error counts. */
export function siteAdminFrom(result: { data: unknown; error: unknown }): boolean {
  return result.error === null && result.data === true
}

/**
 * False while signed out (no request), and reset to false whenever the member changes so a
 * previous account's answer never shows. `check` must be a stable function (module level).
 */
export function useSiteAdmin(check: SiteAdminCheck, userId: string | null): boolean {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(false)
    if (userId === null) return
    let cancelled = false
    void (async () => {
      try {
        const result = await check()
        if (!cancelled) setIsAdmin(siteAdminFrom(result))
      } catch {
        if (!cancelled) setIsAdmin(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [check, userId])

  return isAdmin
}
