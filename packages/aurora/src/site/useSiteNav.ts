// The website's section links, for the map's copy of the site header (T39).
//
// The wiki and the map are two separate apps with two bundles, so the map cannot
// import the wiki's generated navigation module. Instead it reads the file the wiki
// publishes for itself, /data/versions.json, once per page load. That keeps the two
// menus identical without shared code. The shape check is the pure function
// sectionsFrom, so it can be tested without a browser.
import { useEffect, useState } from 'react'

export interface SiteSection {
  id: string
  name: string
  /** An absolute path on the same site: a plain page load into the wiki, never a map route. */
  href: string
}

/** Where the wiki publishes its navigation. An absolute path: the map lives at /map/. */
export const SITE_NAV_URL = '/data/versions.json'

/**
 * Shown while the navigation loads, and whenever it cannot be read: always in
 * `npm run aurora` (the dev server has no /data/ folder), and on the live site if the
 * file is missing or has changed shape. The Build 42 sections as of 2026-10-04 (KB14
 * added How the Game Works and Running a Server).
 */
export const FALLBACK_SECTIONS: readonly SiteSection[] = [
  { id: 'modding', name: 'Modding', href: '/pz/build-42/modding' },
  { id: 'mapping', name: 'Mapping', href: '/pz/build-42/mapping' },
  { id: 'vehicles', name: 'Vehicles', href: '/pz/build-42/vehicles' },
  { id: 'outcast-mods', name: 'Outcast Mods', href: '/pz/build-42/outcast-mods' },
  { id: 'gameplay', name: 'How the Game Works', href: '/pz/build-42/gameplay' },
  { id: 'server', name: 'Running a Server', href: '/pz/build-42/server' },
]

// Version and section ids become part of a link, so only plain slugs are accepted.
const SLUG = /^[a-z0-9][a-z0-9-]*$/

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * The sections of the default version, in displayOrder, skipping any section with no
 * articles (the same rule as the wiki's own header). Returns null when the input is not
 * the shape the wiki publishes, or when no section has an article, so the caller keeps
 * the fallback instead of drawing an empty menu.
 */
export function sectionsFrom(json: unknown): SiteSection[] | null {
  if (!isRecord(json)) return null
  const { defaultVersion, versions } = json
  if (typeof defaultVersion !== 'string' || !SLUG.test(defaultVersion) || !Array.isArray(versions)) return null

  const version = versions.find((v) => isRecord(v) && v.id === defaultVersion)
  if (!isRecord(version) || !Array.isArray(version.sections)) return null

  const found: Array<{ section: SiteSection; order: number }> = []
  for (const s of version.sections) {
    if (!isRecord(s)) return null
    const { id, name, displayOrder, categories } = s
    if (typeof id !== 'string' || !SLUG.test(id)) return null
    if (typeof name !== 'string' || name.trim() === '') return null
    if (typeof displayOrder !== 'number' || !Array.isArray(categories)) return null

    const hasArticles = categories.some((c) => isRecord(c) && typeof c.articleCount === 'number' && c.articleCount > 0)
    if (!hasArticles) continue

    found.push({ section: { id, name, href: `/pz/${defaultVersion}/${id}` }, order: displayOrder })
  }

  if (found.length === 0) return null
  return found.sort((a, b) => a.order - b.order).map((f) => f.section)
}

/** The section links for the header: the fallback at first, the published list once read. */
export function useSiteNav(): readonly SiteSection[] {
  const [sections, setSections] = useState<readonly SiteSection[]>(FALLBACK_SECTIONS)

  useEffect(() => {
    let cancelled = false
    fetch(SITE_NAV_URL)
      .then((r) => (r.ok ? (r.json() as Promise<unknown>) : null))
      .then((json) => {
        const read = sectionsFrom(json)
        if (!cancelled && read) setSections(read)
      })
      .catch(() => {
        // Not JSON (the dev server answers with its own page) or offline: keep the fallback.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return sections
}
