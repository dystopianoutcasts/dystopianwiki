// T39: the map's copy of the site header reads the wiki's published navigation.
// sectionsFrom is the shape check; the hook itself only fetches and falls back.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { FALLBACK_SECTIONS, SITE_NAV_URL, sectionsFrom } from './useSiteNav'

// The file the live site serves at /data/versions.json (repo root data/).
const publishedPath = fileURLToPath(new URL('../../../../data/versions.json', import.meta.url))

function nav(sections: unknown[], extra: Record<string, unknown> = {}) {
  return {
    defaultVersion: 'build-42',
    versions: [
      { id: 'build-41', sections: [{ id: 'old', name: 'Old', displayOrder: 1, categories: [{ articleCount: 9 }] }] },
      { id: 'build-42', sections },
    ],
    ...extra,
  }
}

const section = (id: string, name: string, displayOrder: number, counts: number[]) => ({
  id,
  name,
  displayOrder,
  categories: counts.map((articleCount, i) => ({ id: `c${i}`, articleCount })),
})

describe('sectionsFrom: the real published file', () => {
  const json: unknown = JSON.parse(readFileSync(publishedPath, 'utf8'))
  const read = sectionsFrom(json)

  it('reads it', () => {
    expect(read).not.toBeNull()
    expect(read!.length).toBeGreaterThan(0)
  })

  it('links every section under the default version, as absolute wiki paths', () => {
    const defaultVersion = (json as { defaultVersion: string }).defaultVersion
    for (const s of read!) expect(s.href).toBe(`/pz/${defaultVersion}/${s.id}`)
  })

  it('keeps displayOrder and includes Modding first', () => {
    expect(read![0].id).toBe('modding')
    expect(read!.map((s) => s.name)).toContain('Outcast Mods')
  })
})

describe('sectionsFrom: rules', () => {
  it('skips a section with no articles, the same rule as the wiki header', () => {
    const read = sectionsFrom(
      nav([section('modding', 'Modding', 1, [3]), section('empty', 'Empty', 2, [0, 0]), section('vehicles', 'Vehicles', 3, [1])]),
    )
    expect(read?.map((s) => s.id)).toEqual(['modding', 'vehicles'])
  })

  it('orders by displayOrder, not by position in the file', () => {
    const read = sectionsFrom(nav([section('b', 'B', 2, [1]), section('a', 'A', 1, [1])]))
    expect(read?.map((s) => s.id)).toEqual(['a', 'b'])
  })

  it('uses the default version, not the first one in the list', () => {
    const read = sectionsFrom(nav([section('modding', 'Modding', 1, [1])]))
    expect(read).toEqual([{ id: 'modding', name: 'Modding', href: '/pz/build-42/modding' }])
  })

  it('returns null when no section has an article, so the fallback stays', () => {
    expect(sectionsFrom(nav([section('empty', 'Empty', 1, [0])]))).toBeNull()
  })
})

describe('sectionsFrom: garbage in, null out', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a string', 'not json'],
    ['an array', []],
    ['an empty object', {}],
    ['no versions', { defaultVersion: 'build-42' }],
    ['versions not a list', { defaultVersion: 'build-42', versions: 'x' }],
    ['default version missing', { defaultVersion: 'build-99', versions: [] }],
    ['sections not a list', { defaultVersion: 'build-42', versions: [{ id: 'build-42', sections: {} }] }],
  ])('%s', (_label, input) => {
    expect(sectionsFrom(input)).toBeNull()
  })

  it('rejects a section id that is not a plain slug, since it becomes part of a link', () => {
    expect(sectionsFrom(nav([section('../../evil', 'Evil', 1, [1])]))).toBeNull()
    expect(sectionsFrom(nav([section('javascript:alert(1)', 'Evil', 1, [1])]))).toBeNull()
  })

  it('rejects a default version id that is not a plain slug', () => {
    expect(sectionsFrom(nav([section('modding', 'Modding', 1, [1])], { defaultVersion: 'https://x' }))).toBeNull()
  })

  it('rejects a section with no name or no displayOrder', () => {
    expect(sectionsFrom(nav([section('modding', ' ', 1, [1])]))).toBeNull()
    expect(sectionsFrom(nav([{ id: 'modding', name: 'Modding', categories: [{ articleCount: 1 }] }]))).toBeNull()
  })
})

describe('fallback and address', () => {
  it('falls back to the four Build 42 sections the task names', () => {
    expect(FALLBACK_SECTIONS.map((s) => s.name)).toEqual(['Modding', 'Mapping', 'Vehicles', 'Outcast Mods'])
    for (const s of FALLBACK_SECTIONS) expect(s.href).toBe(`/pz/build-42/${s.id}`)
  })

  it('the fallback matches what the published file says today', () => {
    const read = sectionsFrom(JSON.parse(readFileSync(publishedPath, 'utf8')))
    expect(read).toEqual(FALLBACK_SECTIONS)
  })

  it('reads the site-root address, not one under /map/', () => {
    expect(SITE_NAV_URL).toBe('/data/versions.json')
  })
})
