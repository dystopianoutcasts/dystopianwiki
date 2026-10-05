import { VERSIONS } from '../config/versions.generated'

export interface BreadcrumbItem {
  label: string
  href: string
  isCurrent: boolean
}

// Labels for segments that are not a known version, section or category in their place.
// A Map, so a segment such as `__proto__` or `constructor` cannot read an Object property.
const displayNames = new Map<string, string>([
  ['pz', 'Project Zomboid'],
  ['modding', 'Modding'],
  ['mapping', 'Mapping'],
  ['lua-api', 'Lua API'],
  ['recipes', 'Recipes'],
  ['items', 'Items'],
  ['game-mechanics', 'Game Mechanics'],
  ['weapon-repair', 'Weapon Repair'],
  ['foraging', 'Foraging'],
  ['tools', 'Tools'],
  ['tilezed', 'TileZed'],
  ['worlded', 'WorldEd'],
  ['buildings', 'Buildings'],
  ['terrain', 'Terrain'],
])

function prettify(segment: string): string {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * The trail for a path. On /pz/:version/:section/:category/:slug (and the legacy routes
 * without /pz) the version, section and category are read by position and named from the
 * generated navigation (contract C1): "Running a Server", not the folder id "Server".
 * Position matters because a category id is unique only inside its section
 * (`getting-started` is "Getting Started" in modding and "Start Here" in server).
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const versionAt = segments[0] === 'pz' ? 1 : 0
  const version = VERSIONS.find((v) => v.id === segments[versionAt])
  const section = version?.sections.find((s) => s.id === segments[versionAt + 1])
  const category = section?.categories.find((c) => c.id === segments[versionAt + 2])
  const named = new Map<number, string>()
  if (version) named.set(versionAt, version.name)
  if (section) named.set(versionAt + 1, section.name)
  if (category) named.set(versionAt + 2, category.name)

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/', isCurrent: segments.length === 0 }]
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    breadcrumbs.push({
      label: named.get(index) ?? displayNames.get(segment) ?? prettify(segment),
      href: currentPath,
      isCurrent: index === segments.length - 1,
    })
  })
  return breadcrumbs
}
