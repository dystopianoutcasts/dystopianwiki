// The website's top bar on the map (T39, owner 2026-09-29: "This is going to be the top nav
// that's on the whole website."). Since KB15 (owner 2026-10-10: "the avatar drop down with
// the options is the same in all topnavs ... ideally this topnav is just a reusable
// component") it is the ONE shared header, packages/shared/site-header, the same component
// the wiki mounts. This file passes only what is the map's own:
// - the section links, read from the wiki's published /data/versions.json (useSiteNav);
// - "Live Map" as the current page;
// - the map's sign-in state (the wiki and the map share one session: same origin, same
//   Supabase project, same storage key);
// - the site-admin question asked on the public schema (this app's client is on aurora);
// - "Log in" returning to this page of the map.
// No search prop: the shared header's plain search form lands on the wiki's search page.
import { useLocation } from 'react-router-dom'
import { LIVE_MAP_ID, SiteHeader, memberDisplay } from '../../../shared/site-header'
import type { AccountInput } from '../../../shared/site-header'
import { useAuth } from '../auth/AuthContext'
import { getAurora } from '../lib/supabase'
import { mapPagePath } from './mapPagePath'
import { useSiteNav } from './useSiteNav'

/** public.site_is_admin(), the wiki's admin check. Module level, so its identity is stable. */
const checkSiteAdmin = () => getAurora().client.schema('public').rpc('site_is_admin')

export function MapHeader() {
  const sections = useSiteNav()
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  let account: AccountInput
  if (loading) account = { status: 'loading' }
  else if (user) account = { status: 'signed-in', userId: user.id, member: memberDisplay(user), signOut }
  else account = { status: 'signed-out' }

  return (
    <SiteHeader
      sections={sections}
      current={LIVE_MAP_ID}
      currentPath={mapPagePath(location.pathname)}
      account={account}
      siteAdminCheck={checkSiteAdmin}
    />
  )
}
