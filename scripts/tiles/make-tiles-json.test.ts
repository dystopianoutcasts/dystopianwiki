import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { buildOverlay, checkOverlayGeometry, generateTilesJson, parseServerMapNames, rectsFromCells, type MapInfo } from './make-tiles-json'

// T45 Part PUBLISH: these tests build a small fixture render folder on disk (the shape
// make-tiles-json.ts actually reads: layer0.dzi, map_info.json, sources.json, and
// optionally mod_maps/<id>/base_top/*) rather than mocking node:fs, the same way
// extract-*.test.ts feed real fixture strings to their parsers. Never touches the real,
// multi-gigabyte render output at R:\tmp\pzmap2dzi\out or out-t45.

const DZI = (width: number, height: number) =>
  `<?xml version="1.0"?><Image TileSize="256" Overlap="0" Format="webp"><Size Width="${width}" Height="${height}"/></Image>`

const BASE_MAP_INFO: MapInfo = {
  w: 512, h: 512, cell_size: 256, pz_version: '42.13.0',
  pzmap2dzi_version: '1.1.17', git_commit: '5025122c1a6de655122d79ef84dfcb40a632ea68',
  cell_rects: [[0, 0, 2, 2]], x0: 0, y0: 0, sqr: 1, minlayer: -1, maxlayer: 1,
}

function writeBaseTop(baseTopDir: string, mapInfo: MapInfo, sources: unknown[]) {
  mkdirSync(join(baseTopDir, 'layer0_files', '0'), { recursive: true })
  writeFileSync(join(baseTopDir, 'layer0_files', '0', '0_0.webp'), 'x')
  writeFileSync(join(baseTopDir, 'layer0.dzi'), DZI(mapInfo.w, mapInfo.h))
  writeFileSync(join(baseTopDir, 'map_info.json'), JSON.stringify(mapInfo))
  writeFileSync(join(baseTopDir, 'sources.json'), JSON.stringify(sources))
}

function writeOverlay(modMapsDir: string, id: string, mapInfo: MapInfo) {
  const dir = join(modMapsDir, id, 'base_top')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'map_info.json'), JSON.stringify(mapInfo))
}

/** [[cellX, cellY], [mtime, modSourceNames]] plus the trailing __metadata__ entry. */
const NO_MOD_SOURCES = [[[0, 0], [1234, []]], ['__metadata__', {}]]

let roots: string[] = []
function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'aurora-tiles-'))
  roots.push(root)
  return root
}
afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
  roots = []
})

describe('generateTilesJson: no mod_maps folder (today\'s shape, unchanged)', () => {
  it('omits overlays entirely and renderedWithMapMods is false', () => {
    const root = makeRoot()
    const baseTop = join(root, 'html', 'map_data', 'base_top')
    writeBaseTop(baseTop, BASE_MAP_INFO, NO_MOD_SOURCES)

    const tiles = generateTilesJson(baseTop)

    expect(tiles.overlays).toBeUndefined()
    expect(tiles.renderedWithMapMods).toBe(false)
    expect('overlays' in tiles).toBe(false)
  })

  it('does not require --order when there is nothing to order', () => {
    const root = makeRoot()
    const baseTop = join(root, 'html', 'map_data', 'base_top')
    writeBaseTop(baseTop, BASE_MAP_INFO, NO_MOD_SOURCES)

    expect(() => generateTilesJson(baseTop, {})).not.toThrow()
  })
})

describe('generateTilesJson: one overlay', () => {
  function fixtureWithOneOverlay() {
    const root = makeRoot()
    const baseTop = join(root, 'html', 'map_data', 'base_top')
    const modMaps = join(root, 'html', 'map_data', 'mod_maps')
    writeBaseTop(baseTop, BASE_MAP_INFO, NO_MOD_SOURCES)
    // Overlay shares the base's geometry (Part RENDER's all_mod_maps rule) but has its
    // OWN cell_rects - proves the overlay entry carries its own rects, not the base's.
    writeOverlay(modMaps, 'sd_cc', { ...BASE_MAP_INFO, cell_rects: [[1, 1, 1, 1]] })
    return baseTop
  }

  it('adds one overlay with the id/title/template/cellRects shape the task names', () => {
    const baseTop = fixtureWithOneOverlay()
    const tiles = generateTilesJson(baseTop, { order: ['sd_cc'] })

    expect(tiles.overlays).toEqual([
      {
        id: 'sd_cc',
        title: 'sd_cc',
        tileUrlTemplate: '{baseUrl}/mod_maps/sd_cc/base_top/layer{layer}_files/{z}/{x}_{y}.webp',
        cellRects: [[1, 1, 1, 1]],
      },
    ])
  })

  it('sets renderedWithMapMods true when an overlay exists, even though no base cell names a mod', () => {
    const baseTop = fixtureWithOneOverlay()
    const tiles = generateTilesJson(baseTop, { order: ['sd_cc'] })
    expect(tiles.renderedWithMapMods).toBe(true)
  })

  it('refuses when mod_maps/ exists but no --order is given', () => {
    const baseTop = fixtureWithOneOverlay()
    expect(() => generateTilesJson(baseTop, {})).toThrow(/--order/)
  })
})

describe('generateTilesJson: overlay order (Map= order, first entry drawn on top)', () => {
  it('the overlays array follows --order exactly, not directory-listing order', () => {
    const root = makeRoot()
    const baseTop = join(root, 'html', 'map_data', 'base_top')
    const modMaps = join(root, 'html', 'map_data', 'mod_maps')
    writeBaseTop(baseTop, BASE_MAP_INFO, NO_MOD_SOURCES)
    // Written to disk in an order ('alpha' before 'zulu') that would sort the OPPOSITE
    // way to --order, so a directory-listing fallback would be caught by this assertion.
    writeOverlay(modMaps, 'alpha', BASE_MAP_INFO)
    writeOverlay(modMaps, 'zulu', BASE_MAP_INFO)

    const tiles = generateTilesJson(baseTop, { order: ['zulu', 'alpha'] })

    expect(tiles.overlays?.map((o) => o.id)).toEqual(['zulu', 'alpha'])
  })
})

describe('generateTilesJson: geometry refusal (same rule as Part RENDER step 3)', () => {
  it('throws when an overlay pyramid is a different size than the base', () => {
    const root = makeRoot()
    const baseTop = join(root, 'html', 'map_data', 'base_top')
    const modMaps = join(root, 'html', 'map_data', 'mod_maps')
    writeBaseTop(baseTop, BASE_MAP_INFO, NO_MOD_SOURCES)
    writeOverlay(modMaps, 'sd_cc', { ...BASE_MAP_INFO, w: 768 })

    expect(() => generateTilesJson(baseTop, { order: ['sd_cc'] })).toThrow(/geometry differs/)
  })

  it('throws when an overlay has a different cell origin', () => {
    const root = makeRoot()
    const baseTop = join(root, 'html', 'map_data', 'base_top')
    const modMaps = join(root, 'html', 'map_data', 'mod_maps')
    writeBaseTop(baseTop, BASE_MAP_INFO, NO_MOD_SOURCES)
    writeOverlay(modMaps, 'sd_cc', { ...BASE_MAP_INFO, x0: 5 })

    expect(() => generateTilesJson(baseTop, { order: ['sd_cc'] })).toThrow(/geometry differs/)
  })

  it('throws when an overlay is missing entirely (named in --order but not on disk)', () => {
    const root = makeRoot()
    const baseTop = join(root, 'html', 'map_data', 'base_top')
    const modMaps = join(root, 'html', 'map_data', 'mod_maps')
    writeBaseTop(baseTop, BASE_MAP_INFO, NO_MOD_SOURCES)
    mkdirSync(modMaps, { recursive: true })

    expect(() => generateTilesJson(baseTop, { order: ['ghost'] })).toThrow(/no map_info\.json/)
  })
})

describe('checkOverlayGeometry (unit)', () => {
  it('passes silently when every geometry field matches', () => {
    expect(() => checkOverlayGeometry('sd_cc', BASE_MAP_INFO, { ...BASE_MAP_INFO })).not.toThrow()
  })

  it('lists every mismatch, not just the first', () => {
    const overlay: MapInfo = { ...BASE_MAP_INFO, w: 768, minlayer: -5 }
    expect(() => checkOverlayGeometry('sd_cc', BASE_MAP_INFO, overlay)).toThrowError(
      /size 768x512 != base 512x512.*levels -5\.\.1 != base -1\.\.1/s,
    )
  })
})

describe('rectsFromCells (T45)', () => {
  it('rebuilds the three vanilla rectangles from their 4,065 cells', () => {
    const rects: [number, number, number, number][] = [[0, 18, 45, 45], [45, 3, 13, 60], [58, 0, 20, 63]]
    const cells: [number, number][] = []
    for (const [x0, y0, w, h] of rects) for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) cells.push([x, y])
    expect(cells).toHaveLength(4065)
    expect(rectsFromCells(cells)).toEqual(rects)
  })

  it('covers an irregular shape exactly, cell for cell', () => {
    const cells: [number, number][] = [[5, 5], [5, 6], [6, 5], [7, 5], [7, 6], [7, 7], [9, 1]]
    const rects = rectsFromCells(cells)
    const covered = new Set<string>()
    for (const [x0, y0, w, h] of rects) for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) covered.add(`${x},${y}`)
    expect([...covered].sort()).toEqual(cells.map(([x, y]) => `${x},${y}`).sort())
  })

  it('an overlay with a sources.json uses its own populated cells, not map_info cell_rects', () => {
    const root = makeRoot()
    const modMaps = join(root, 'mod_maps')
    writeOverlay(modMaps, 'shared', { ...BASE_MAP_INFO, cell_rects: [[0, 0, 2, 2]] })
    writeFileSync(join(modMaps, 'shared', 'base_top', 'sources.json'), JSON.stringify([[[1, 0], [1, []]], [[1, 1], [1, []]], ['__metadata__', {}]]))
    expect(buildOverlay('shared', modMaps, BASE_MAP_INFO).cellRects).toEqual([[1, 0, 1, 2]])
  })
})

describe('buildOverlay (unit)', () => {
  it('reads the overlay\'s own cell_rects, not the base\'s', () => {
    const root = makeRoot()
    const modMaps = join(root, 'mod_maps')
    writeOverlay(modMaps, 'sd_cc', { ...BASE_MAP_INFO, cell_rects: [[9, 9, 1, 1]] })
    const entry = buildOverlay('sd_cc', modMaps, BASE_MAP_INFO)
    expect(entry.cellRects).toEqual([[9, 9, 1, 1]])
    expect(entry.id).toBe('sd_cc')
    expect(entry.title).toBe('sd_cc')
  })
})

describe('T50: overlay mapName from server-maps.txt', () => {
  const NAMES_TXT = [
    '# Generated by scripts/tiles/describe-mod-maps.ts. Do not hand-edit.',
    '',
    'raven-creek-b42:',
    "    display_name: 'Raven Creek B42'",
    "    map_name: 'Raven Creek B42'",
    "    map_path: 'R:/x/Raven Creek B42'",
    '',
    'odd-s-map:',
    "    map_name: 'Odd''s Map'",
    '',
  ].join('\r\n')

  it('parseServerMapNames reads each id\'s map_name, unescaping a doubled quote, CRLF or LF', () => {
    const names = parseServerMapNames(NAMES_TXT)
    expect([...names]).toEqual([['raven-creek-b42', 'Raven Creek B42'], ['odd-s-map', "Odd's Map"]])
    expect(parseServerMapNames(NAMES_TXT.replace(/\r\n/g, '\n'))).toEqual(names)
  })

  it('the committed server-maps.txt names the six T45 maps by their folder names', () => {
    const file = fileURLToPath(new URL('./mod-maps/server-maps.txt', import.meta.url))
    const names = parseServerMapNames(readFileSync(file, 'utf8'))
    expect(names.get('raven-creek-b42')).toBe('Raven Creek B42')
    expect(names.get('constown-ky')).toBe('Constown, KY')
    expect(names.get('new-hartburg-ky')).toBe('New Hartburg, KY')
    expect(names.size).toBe(6)
  })

  it('an overlay gets mapName when the names list has its id, and none otherwise (the app then matches by id)', () => {
    const root = makeRoot()
    const baseTop = join(root, 'html', 'map_data', 'base_top')
    const modMaps = join(root, 'html', 'map_data', 'mod_maps')
    writeBaseTop(baseTop, BASE_MAP_INFO, NO_MOD_SOURCES)
    writeOverlay(modMaps, 'raven-creek-b42', BASE_MAP_INFO)
    writeOverlay(modMaps, 'unlisted', BASE_MAP_INFO)
    const tiles = generateTilesJson(baseTop, { order: ['raven-creek-b42', 'unlisted'], names: parseServerMapNames(NAMES_TXT) })
    expect(tiles.overlays![0].mapName).toBe('Raven Creek B42')
    expect('mapName' in tiles.overlays![1]).toBe(false)
    expect('mapName' in generateTilesJson(baseTop, { order: ['raven-creek-b42'] }).overlays![0]).toBe(false)
  })
})
