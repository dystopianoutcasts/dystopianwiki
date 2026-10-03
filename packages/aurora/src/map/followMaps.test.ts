import { describe, expect, it } from 'vitest'
import type { TileOverlay } from './tiles'
import { allowedMapIds, filterByServerMaps, mapsWithoutTiles, overlaysToDraw, reconcileOverlays } from './followMaps'

function overlay(id: string, mapName?: string): TileOverlay {
  return {
    id,
    title: id,
    tileUrlTemplate: `{baseUrl}/mod_maps/${id}/base_top/layer{layer}_files/{z}/{x}_{y}.webp`,
    cellRects: [[1, 1, 1, 1]],
    ...(mapName !== undefined ? { mapName } : {}),
  }
}

// Two overlays as tiles.json lists them (Map= order): Raven Creek with its folder name
// (T50 tiles.json), Raccoon City without one (an older tiles.json: matched by id).
const RAVEN = overlay('raven-creek-b42', 'Raven Creek B42')
const RACCOON = overlay('raccooncity')
const OVERLAYS = [RAVEN, RACCOON]

type Street = { id: string; name: string; m?: string }
type Area = { name: string; m?: string }
const VANILLA_STREET: Street = { id: 'main-st', name: 'Main St' }
const RAVEN_STREET: Street = { id: 'ludwin-bridge-st', name: 'Ludwin Bridge St', m: 'raven-creek-b42' }
const RACCOON_STREET: Street = { id: 'raccoon-st', name: 'Raccoon St', m: 'raccooncity' }
const VANILLA_AREA: Area = { name: 'Rosewood' }
const RAVEN_AREA: Area = { name: 'Raven Creek', m: 'raven-creek-b42' }
const DATA: {
  streets: Street[]
  areas: Area[]
  worldMap: { roads: { type?: string; m?: string }[]; buildings: { type?: string; m?: string }[]; water: { m?: string }[]; forest: { m?: string }[] }
} = {
  streets: [VANILLA_STREET, RAVEN_STREET, RACCOON_STREET],
  areas: [VANILLA_AREA, RAVEN_AREA],
  worldMap: {
    roads: [{ type: 'primary', m: 'raven-creek-b42' }, { type: 'secondary' }],
    buildings: [{ type: 'house' }, { type: 'house', m: 'raccooncity' }],
    water: [{ m: 'raven-creek-b42' }],
    forest: [{}, { m: 'raccooncity' }],
  },
}

describe('allowedMapIds', () => {
  it('is the server maps as ids, plus vanilla', () => {
    expect([...allowedMapIds(['Raven Creek B42', 'Muldraugh, KY'])!].sort()).toEqual(['muldraugh-ky', 'raven-creek-b42'])
  })

  it('MUTATION - vanilla dropped: vanilla is allowed even when the list does not name it', () => {
    expect(allowedMapIds(['Raven Creek B42'])!.has('muldraugh-ky')).toBe(true)
  })

  it('an unknown (null) or empty list is unknown: null, nothing filtered', () => {
    expect(allowedMapIds(null)).toBeNull()
    expect(allowedMapIds([])).toBeNull()
  })
})

describe('overlaysToDraw', () => {
  it('keeps an overlay whose map the server runs, drops one it does not, keeps Map= order', () => {
    const allowed = allowedMapIds(['Raven Creek B42', 'Muldraugh, KY'])
    expect(overlaysToDraw(OVERLAYS, allowed).map((o) => o.id)).toEqual(['raven-creek-b42'])
  })

  it('matches an overlay with no mapName by its id (older tiles.json)', () => {
    const allowed = allowedMapIds(['RaccoonCity', 'Muldraugh, KY'])
    expect(overlaysToDraw(OVERLAYS, allowed).map((o) => o.id)).toEqual(['raccooncity'])
  })

  it('matches by mapName when the folder name and the id differ', () => {
    const odd = overlay('custom-id', 'Some Map')
    expect(overlaysToDraw([odd], allowedMapIds(['Some Map']))).toEqual([odd])
    expect(overlaysToDraw([odd], allowedMapIds(['Custom Id']))).toEqual([])
  })

  it('a vanilla-only list draws no overlay', () => {
    expect(overlaysToDraw(OVERLAYS, allowedMapIds(['Muldraugh, KY']))).toEqual([])
  })

  it('MUTATION - unknown list filters everything: an unknown list draws every overlay, in order', () => {
    expect(overlaysToDraw(OVERLAYS, null)).toEqual(OVERLAYS)
  })
})

describe('filterByServerMaps', () => {
  const allowed = allowedMapIds(['Raven Creek B42', 'Lawnmower', 'Muldraugh, KY'])

  it('drops a street whose map is not run, keeps the vanilla street and the run map\'s street', () => {
    expect(filterByServerMaps(DATA, allowed).streets).toEqual([VANILLA_STREET, RAVEN_STREET])
  })

  it('filters areas and every world-map list the same way', () => {
    const out = filterByServerMaps(DATA, allowed)
    expect(out.areas).toEqual([VANILLA_AREA, RAVEN_AREA])
    expect(out.worldMap.roads).toEqual(DATA.worldMap.roads)
    expect(out.worldMap.buildings).toEqual([{ type: 'house' }])
    expect(out.worldMap.water).toEqual(DATA.worldMap.water)
    expect(out.worldMap.forest).toEqual([{}])
  })

  it('MUTATION - vanilla dropped: a vanilla-only list keeps every untagged feature and nothing tagged', () => {
    const out = filterByServerMaps(DATA, allowedMapIds(['Muldraugh, KY']))
    expect(out.streets).toEqual([VANILLA_STREET])
    expect(out.areas).toEqual([VANILLA_AREA])
    expect(out.worldMap.roads).toEqual([{ type: 'secondary' }])
    expect(out.worldMap.water).toEqual([])
  })

  it('MUTATION - unknown list filters everything: an unknown list keeps all', () => {
    expect(filterByServerMaps(DATA, null)).toBe(DATA)
  })
})

describe('mapsWithoutTiles (the admin notice list)', () => {
  const LIST = ['Raven Creek B42', 'HavenFall', 'Lawnmower', ' Vehicle Spawn Zones ', 'RaccoonCity', 'Muldraugh, KY']

  it('reports a listed map with no overlay, in Map= order, as the server spells it', () => {
    expect(mapsWithoutTiles(LIST, OVERLAYS)).toEqual(['HavenFall'])
    expect(mapsWithoutTiles(LIST, [])).toEqual(['Raven Creek B42', 'HavenFall', 'RaccoonCity'])
  })

  it('MUTATION - helpers reported: Lawnmower and Vehicle Spawn Zones never are', () => {
    expect(mapsWithoutTiles(['Lawnmower', 'Vehicle Spawn Zones', 'lawnmower'], [])).toEqual([])
  })

  it('vanilla is the base layer, never reported', () => {
    expect(mapsWithoutTiles(['Muldraugh, KY'], [])).toEqual([])
  })

  it('an unknown list reports nothing; a name listed twice is reported once', () => {
    expect(mapsWithoutTiles(null, [])).toEqual([])
    expect(mapsWithoutTiles(['HavenFall', 'HavenFall'], [])).toEqual(['HavenFall'])
  })
})

/** Apply a reconcile plan to a fake tile pane: removing takes a layer out, adding puts it
 *  on top. The pane lists layers bottom to top, so its reverse must be Map= order. */
function apply(pane: string[], plan: { remove: string[]; add: string[] }): string[] {
  const next = pane.filter((id) => !plan.remove.includes(id))
  next.push(...plan.add)
  return next
}

function paneFor(list: string[]): string[] {
  return apply([], reconcileOverlays([], list))
}

describe('reconcileOverlays (overlay add and remove when the list changes)', () => {
  it('on load adds the last Map= entry first, so the first ends on top', () => {
    expect(reconcileOverlays([], ['a', 'b', 'c'])).toEqual({ remove: [], add: ['c', 'b', 'a'] })
  })

  it('removing a map takes only that layer off', () => {
    expect(reconcileOverlays(['a', 'b', 'c'], ['a', 'c'])).toEqual({ remove: ['b'], add: [] })
  })

  it('no change is no work', () => {
    expect(reconcileOverlays(['a', 'b'], ['a', 'b'])).toEqual({ remove: [], add: [] })
  })

  it('a map added first in Map= order goes on top without touching the others', () => {
    expect(reconcileOverlays(['b'], ['a', 'b'])).toEqual({ remove: [], add: ['a'] })
  })

  it('MUTATION - order reversed on re-add: a map added below others re-adds those above it, bottom first', () => {
    const plan = reconcileOverlays(['a', 'b'], ['a', 'b', 'c'])
    expect(plan).toEqual({ remove: ['a', 'b'], add: ['c', 'b', 'a'] })
    expect(apply(paneFor(['a', 'b']), plan).reverse()).toEqual(['a', 'b', 'c'])
  })

  it.each([
    [['a', 'b', 'c'], ['c', 'a']],
    [['a'], ['b', 'a', 'c']],
    [['a', 'b', 'c'], []],
    [[], ['x', 'y']],
    [['a', 'b', 'c', 'd'], ['a', 'x', 'c', 'y']],
  ])('from %j to %j the pane ends in Map= order, first on top', (from, to) => {
    expect(apply(paneFor(from), reconcileOverlays(from, to)).reverse()).toEqual(to)
  })
})
