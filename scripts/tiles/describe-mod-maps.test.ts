import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { describeModMaps, formatModMapsFile, mapId, ModMapError } from './describe-mod-maps'

function posix(p: string): string {
  return p.replace(/\\/g, '/')
}

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'describe-mod-maps-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Create a mod's map folder under one of the three layouts, with a .lotheader file
 *  so it counts as real map data (an empty folder never does). */
function makeMap(modDir: string, layout: '42' | 'common' | 'root', mapName: string) {
  const mapsDir = layout === 'root' ? join(modDir, 'media', 'maps') : join(modDir, layout, 'media', 'maps')
  const mapDir = join(mapsDir, mapName)
  mkdirSync(mapDir, { recursive: true })
  writeFileSync(join(mapDir, '0_0.lotheader'), '')
}

function makeTexture(modDir: string, layout: '42' | 'common', fileName = 'Tiles2x.pack') {
  const texDir = join(modDir, layout, 'media', 'texturepacks')
  mkdirSync(texDir, { recursive: true })
  writeFileSync(join(texDir, fileName), '')
}

describe('describeModMaps', () => {
  it('finds a map under 42/media/maps and reports an absolute, forward-slash map_path', () => {
    const modDir = join(root, '3774052732', 'mods', 'SD_CC_TEST')
    makeMap(modDir, '42', 'sd_cc')

    const [entry] = describeModMaps({ modRoot: root, steamIds: ['3774052732'] })

    expect(entry).toMatchObject({ mapName: 'sd_cc', modName: 'SD_CC_TEST', steamId: '3774052732', texture: false })
    expect(entry.mapPath).toBe(posix(join(modDir, '42', 'media', 'maps', 'sd_cc')))
  })

  it('falls back to common/media/maps when there is no 42 layout', () => {
    const modDir = join(root, '3774052732', 'mods', 'SD_CC_TEST')
    makeMap(modDir, 'common', 'sd_cc')

    const [entry] = describeModMaps({ modRoot: root, steamIds: ['3774052732'] })

    expect(entry.mapName).toBe('sd_cc')
    expect(entry.mapPath).toBe(posix(join(modDir, 'common', 'media', 'maps', 'sd_cc')))
  })

  it('sets texture and texture_path only when the same-layout texturepacks folder has a .pack file', () => {
    const modDir = join(root, '111', 'mods', 'TexturedMod')
    makeMap(modDir, 'common', 'grapeseed2')
    makeTexture(modDir, 'common', 'CustomTiles.pack')

    const [entry] = describeModMaps({ modRoot: root, steamIds: ['111'] })

    expect(entry.texture).toBe(true)
    expect(entry.texturePath).toBe(posix(join(modDir, 'common', 'media', 'texturepacks')))
  })

  it('never sets texture when the texturepacks folder exists but holds no .pack file', () => {
    const modDir = join(root, '111', 'mods', 'NoPack')
    makeMap(modDir, '42', 'onemap')
    mkdirSync(join(modDir, '42', 'media', 'texturepacks'), { recursive: true })
    writeFileSync(join(modDir, '42', 'media', 'texturepacks', 'readme.txt'), '')

    const [entry] = describeModMaps({ modRoot: root, steamIds: ['111'] })

    expect(entry.texture).toBe(false)
    expect(entry.texturePath).toBeUndefined()
  })

  it('ignores a map folder with no .lotheader file (not real map data)', () => {
    const modDir = join(root, '111', 'mods', 'Decoy')
    mkdirSync(join(modDir, '42', 'media', 'maps', 'empty'), { recursive: true })

    const entries = describeModMaps({ modRoot: root, steamIds: ['111'] })

    expect(entries).toHaveLength(0)
  })

  it('ignores a map that exists ONLY under the mod root media/maps (B41 layout) when unfiltered', () => {
    const modDir = join(root, '111', 'mods', 'OldMod')
    makeMap(modDir, 'root', 'oldmap')

    const entries = describeModMaps({ modRoot: root, steamIds: ['111'] })

    expect(entries).toHaveLength(0)
  })

  it('returns every B42 map sorted by name when wantedMaps is omitted', () => {
    const mod1 = join(root, '111', 'mods', 'ModB')
    const mod2 = join(root, '111', 'mods', 'ModA')
    makeMap(mod1, '42', 'zzz')
    makeMap(mod2, 'common', 'aaa')

    const entries = describeModMaps({ modRoot: root, steamIds: ['111'] })

    expect(entries.map((e) => e.mapName)).toEqual(['aaa', 'zzz'])
  })

  it('filters to wantedMaps, in the order given, when provided', () => {
    const modDir = join(root, '111', 'mods', 'MultiMap')
    makeMap(modDir, '42', 'first')
    makeMap(modDir, '42', 'second')
    makeMap(modDir, '42', 'third')

    const entries = describeModMaps({ modRoot: root, steamIds: ['111'], wantedMaps: ['third', 'first'] })

    expect(entries.map((e) => e.mapName)).toEqual(['third', 'first'])
  })

  it('refuses when a wanted map is not found anywhere', () => {
    const modDir = join(root, '111', 'mods', 'SomeMod')
    makeMap(modDir, '42', 'realmap')

    expect(() => describeModMaps({ modRoot: root, steamIds: ['111'], wantedMaps: ['nosuchmap'] })).toThrow(ModMapError)
    expect(() => describeModMaps({ modRoot: root, steamIds: ['111'], wantedMaps: ['nosuchmap'] })).toThrow(/not found/)
  })

  it('refuses when a wanted map exists only in the B41 layout, naming the B41 cause', () => {
    const modDir = join(root, '111', 'mods', 'OldMod')
    makeMap(modDir, 'root', 'oldmap')

    expect(() => describeModMaps({ modRoot: root, steamIds: ['111'], wantedMaps: ['oldmap'] })).toThrow(ModMapError)
    expect(() => describeModMaps({ modRoot: root, steamIds: ['111'], wantedMaps: ['oldmap'] })).toThrow(/B41/)
  })

  it('refuses when the same map name is produced by two different mods', () => {
    const mod1 = join(root, '111', 'mods', 'ModOne')
    const mod2 = join(root, '222', 'mods', 'ModTwo')
    makeMap(mod1, '42', 'clash')
    makeMap(mod2, '42', 'clash')

    expect(() => describeModMaps({ modRoot: root, steamIds: ['111', '222'] })).toThrow(ModMapError)
    expect(() => describeModMaps({ modRoot: root, steamIds: ['111', '222'] })).toThrow(/more than one mod/)
  })
})

describe('mapId', () => {
  it('turns a map folder name into a web-safe slug', () => {
    expect(mapId('Constown, KY')).toBe('constown-ky')
    expect(mapId('Raven Creek B42')).toBe('raven-creek-b42')
    expect(mapId('New Hartburg, KY')).toBe('new-hartburg-ky')
    expect(mapId('sd_cc')).toBe('sd_cc')
    expect(mapId('HavenFall')).toBe('havenfall')
  })

  it('refuses a name with nothing to make an id from', () => {
    expect(() => mapId(', ,')).toThrow(ModMapError)
  })
})

describe('formatModMapsFile ids and quoting', () => {
  it('keys each entry by its id and quotes the real names', () => {
    const text = formatModMapsFile([
      { mapName: 'Constown, KY', modName: 'Constown', steamId: '3480990544', mapPath: "/abs/it's here", texture: false },
    ])
    expect(text).toContain('\nconstown-ky:\n')
    expect(text).toContain("    display_name: 'Constown, KY'")
    expect(text).toContain("    map_name: 'Constown, KY'")
    expect(text).toContain("    map_path: '/abs/it''s here'")
  })

  it('refuses two maps that make the same id', () => {
    expect(() =>
      formatModMapsFile([
        { mapName: 'Lake Ivy', modName: 'a', steamId: '1', mapPath: '/a', texture: false },
        { mapName: 'lake-ivy', modName: 'b', steamId: '2', mapPath: '/b', texture: false },
      ]),
    ).toThrow(ModMapError)
  })
})

describe('formatModMapsFile', () => {
  it('writes one YAML-style mapping per entry, keyed by map name', () => {
    const text = formatModMapsFile([
      { mapName: 'sd_cc', modName: 'SD_CC_TEST', steamId: '3774052732', mapPath: '/abs/sd_cc', texture: false },
    ])

    expect(text).toContain('\nsd_cc:\n')
    expect(text).toContain("    display_name: 'sd_cc'")
    expect(text).toContain("    mod_name: 'SD_CC_TEST'")
    expect(text).toContain("    steam_id: '3774052732'")
    expect(text).toContain("    map_name: 'sd_cc'")
    expect(text).toContain("    map_path: '/abs/sd_cc'")
    expect(text).not.toContain('texture:')
  })

  it('adds texture: true and texture_path only when the entry has texture set', () => {
    const text = formatModMapsFile([
      {
        mapName: 'grapeseed2',
        modName: 'TexturedMod',
        steamId: '111',
        mapPath: '/abs/grapeseed2',
        texture: true,
        texturePath: '/abs/texturepacks',
      },
    ])

    expect(text).toContain('    texture: true')
    expect(text).toContain("    texture_path: '/abs/texturepacks'")
  })
})
