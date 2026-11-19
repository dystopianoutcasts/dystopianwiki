// The site header's links (KB15). Both apps pass their section list in: the wiki from its
// generated navigation module, the map from the /data/versions.json file the wiki publishes.

export interface SiteSection {
  id: string
  name: string
  /** An absolute path on the same site, opened as a plain <a href>. */
  href: string
}

/** The map is a separate app at /map/: every link to it is a full page load. */
export const LIVE_MAP_HREF = '/map/'
/** The `current` value that marks "Live Map" as the page being shown. */
export const LIVE_MAP_ID = 'live-map'
export const HOME_HREF = '/'
/** Outcast Buddy's download page, a page of the wiki. */
export const BUDDY_HREF = '/buddy'
/** The `current` value that marks "Buddy" as the page being shown. */
export const BUDDY_ID = 'buddy'

/** Outcast Metrics, a page of the wiki. */
export const METRICS_HREF = '/metrics'
/** The `current` value that marks "Metrics" as the page being shown. */
export const METRICS_ID = 'metrics'

/**
 * One "Wiki" link stands for every wiki section (owner, 2026-11-19: "The topbar is crowded.
 * Can we condense all the wiki links to just Wiki?"). It opens the wiki's front page, whose
 * "Browse Documentation" grid lists every section.
 */
export const WIKI_ID = 'wiki'
/** The Build 42 front page, used when an app passes no sections. */
export const WIKI_FALLBACK_HREF = '/pz/build-42'

/** The wiki's front page for the sections an app passes in: /pz/<version>, from the first section's link. */
export function wikiHrefFor(sections: readonly SiteSection[]): string {
  const match = sections[0]?.href.match(/^(\/pz\/[a-z0-9][a-z0-9-]*)\//)
  return match ? match[1] : WIKI_FALLBACK_HREF
}

/** True for the map's own paths, which must never be routed inside the wiki. */
export function isMapPath(path: string): boolean {
  return path === '/map' || path.startsWith('/map/') || path.startsWith('/map?') || path.startsWith('/map#')
}

/**
 * Which header link is the current page for a pathname: Wiki anywhere under /pz (every build,
 * section and article) or on a section's page, Live Map for the map, Metrics for /metrics,
 * Buddy for /buddy, otherwise none.
 */
export function currentFor(pathname: string, sections: readonly SiteSection[]): string | null {
  if (isMapPath(pathname)) return LIVE_MAP_ID
  if (pathname === METRICS_HREF || pathname.startsWith(`${METRICS_HREF}/`)) return METRICS_ID
  if (pathname === BUDDY_HREF || pathname.startsWith(`${BUDDY_HREF}/`)) return BUDDY_ID
  if (pathname === '/pz' || pathname.startsWith('/pz/')) return WIKI_ID
  const hit = sections.some((s) => pathname === s.href || pathname.startsWith(`${s.href}/`))
  return hit ? WIKI_ID : null
}

/**
 * The login page with the current page as `next`. The login page re-validates `next`
 * before it sends anyone there; this only refuses what is plainly not a same-site path,
 * and gives no `next` for the login and register pages themselves.
 */
export function loginHrefFor(currentPath: string): string {
  if (!currentPath.startsWith('/') || currentPath.startsWith('//') || currentPath.includes('\\')) return '/login'
  if (/^\/(login|register)([/?#]|$)/.test(currentPath)) return '/login'
  return `/login?next=${encodeURIComponent(currentPath)}`
}
