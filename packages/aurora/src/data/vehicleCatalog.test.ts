// T72: the "Watch for a car" catalogue, its fuzzy search and the match rule.
import { describe, expect, it } from 'vitest'
import { car } from './watchFixtures'
import { WATCH_INCLUDES_CLAIMED, buildCatalog, isWreck, matchWatched, scriptDetail, searchCatalog, splitWatched, watchingEntries } from './vehicleCatalog'

/** A slice of the live name table (2026-10-03): shared names, wrecks, a police and a taxi variant. */
const NAMES = new Map<string, string>([
  ['Base.CarNormal', 'Chevalier Nyala'],
  ['Base.CarNormalBurnt', 'Wrecked Chevalier Nyala'],
  ['Base.CarLights', 'Chevalier Nyala Police'],
  ['Base.CarTaxi', 'Chevalier Nyala Taxi'],
  ['Base.StepVan', 'Chevalier Step Van'],
  ['Base.StepVan_Glass', 'Chevalier Step Van'],
  ['Base.StepVan_Mail', 'Chevalier Step Van'],
  ['Base.StepVanSmashed', 'Wrecked Chevalier Step Van'],
  ['Base.Van', 'Franklin Valuline'],
  ['Base.VanSeats', 'Franklin Valuline'],
  ['Base.PickUpVan', 'Masterson Horizon'],
  ['Base.SmallCar', 'Chevalier Dart'],
  ['Base.SportsCar', 'Chevalier Cerise'],
  ['Base.CarStationWagon', 'Chevalier Cerise Wagon'],
  ['Base.ModernCar', 'Dash Elite'],
  ['Base.OffRoad', 'Dash Rancher'],
  ['Base.SUV', 'Dash Bulldriver'],
  ['Base.Trailer', 'Trailer'],
])

describe('T72: the catalogue', () => {
  it('uses the server\'s scripts when the view has rows, not the name table', () => {
    const list = buildCatalog(['Base.CarNormal', 'Base.Van'], NAMES, [])
    expect(list.map((e) => e.script)).toEqual(['Base.CarNormal', 'Base.Van'])
  })

  it('falls back to the name table when the scripts view is empty or missing (both read as [])', () => {
    const list = buildCatalog([], NAMES, [])
    expect(list.map((e) => e.script).sort()).toEqual([...NAMES.keys()].sort())
  })

  it('adds every type seen on the map, so a mod car with no name row is listed', () => {
    const seen = [car('Base.93fordF350'), car('Base.MRAPMC'), car('Base.93fordF350'), car(null)]
    const withView = buildCatalog(['Base.CarNormal'], NAMES, seen).map((e) => e.script)
    expect(withView).toEqual(expect.arrayContaining(['Base.CarNormal', 'Base.93fordF350', 'Base.MRAPMC']))
    expect(withView).toHaveLength(3)
    const withoutView = buildCatalog([], NAMES, seen).map((e) => e.script)
    expect(withoutView).toContain('Base.93fordF350')
    expect(withoutView).toHaveLength(NAMES.size + 2)
  })

  it('each entry has the display name, the script id without its module as detail, and the wreck flag', () => {
    const [nyala] = buildCatalog(['Base.CarNormal'], NAMES, [])
    expect(nyala).toEqual({ script: 'Base.CarNormal', label: 'Chevalier Nyala', detail: 'CarNormal', wreck: false, onMap: 0 })
    const [ford] = buildCatalog(['Base.93fordF350'], NAMES, [])
    expect(ford.label).toBe('93 ford F350')
    expect(scriptDetail('Base.StepVan_Glass')).toBe('StepVan_Glass')
    expect(isWreck('Base.CarNormalBurnt')).toBe(true)
    expect(isWreck('Base.StepVanSmashed')).toBe(true)
    expect(isWreck('Base.StepVan_Glass')).toBe(false)
  })

  it('sorts by label, then script', () => {
    const list = buildCatalog(['Base.StepVan_Mail', 'Base.CarNormal', 'Base.StepVan', 'Base.StepVan_Glass'], NAMES, [])
    expect(list.map((e) => e.script)).toEqual(['Base.CarNormal', 'Base.StepVan', 'Base.StepVan_Glass', 'Base.StepVan_Mail'])
  })

  it('onMap counts the unclaimed cars of that script on the map', () => {
    const cars = [car('Base.Van'), car('Base.Van'), car('Base.Van', { claimed_by: 'ann' }), car('Base.CarNormal')]
    const byScript = new Map(buildCatalog([], NAMES, cars).map((e) => [e.script, e.onMap]))
    expect(byScript.get('Base.Van')).toBe(2)
    expect(byScript.get('Base.CarNormal')).toBe(1)
    expect(byScript.get('Base.SUV')).toBe(0)
  })

  it('a watched script that is no longer in the catalogue still appears in the Watching list', () => {
    const catalog = buildCatalog(['Base.CarNormal'], NAMES, [])
    const watching = watchingEntries(new Set(['Base.CarNormal', 'Base.RemovedModCar']), catalog, NAMES, [])
    expect(watching.map((e) => e.script)).toEqual(['Base.CarNormal', 'Base.RemovedModCar'])
    expect(watching[1]).toMatchObject({ label: 'Removed Mod Car', detail: 'RemovedModCar', onMap: 0 })
  })

  it('a watched wreck is listed under Watching (only the checklist hides wrecks)', () => {
    const catalog = buildCatalog([], NAMES, [])
    const watching = watchingEntries(new Set(['Base.CarNormalBurnt']), catalog, NAMES, [])
    expect(watching).toEqual([expect.objectContaining({ script: 'Base.CarNormalBurnt', wreck: true })])
  })
})

describe('T72: fuzzy search', () => {
  const catalog = buildCatalog([...NAMES.keys(), 'Base.93fordF350', 'Base.76chevyK20', 'Base.MRAPMC', 'Base.TrailerMower'], NAMES, [])
  const scripts = (q: string) => searchCatalog(q, catalog).map((e) => e.script)

  it('"nyalla" (a typo) finds Chevalier Nyala, first', () => {
    expect(scripts('nyalla')[0]).toBe('Base.CarNormal')
  })

  it('"chev nyala" finds Chevalier Nyala, first', () => {
    expect(scripts('chev nyala')[0]).toBe('Base.CarNormal')
  })

  it('"f350" finds the 93fordF350 (no name row: matched on its tidied name and script id)', () => {
    expect(scripts('f350')).toEqual(['Base.93fordF350'])
  })

  it('"stepvan glass" finds StepVan_Glass, first', () => {
    expect(scripts('stepvan glass')[0]).toBe('Base.StepVan_Glass')
  })

  it('"zzzz" finds nothing', () => {
    expect(scripts('zzzz')).toEqual([])
  })

  it('a short word allows no typo: "van" finds only names or scripts with "van" in them', () => {
    const found = searchCatalog('van', catalog)
    expect(found.length).toBeGreaterThan(0)
    for (const e of found) expect(`${e.label} ${e.detail}`.toLowerCase()).toContain('van')
  })

  it('an empty or blank query returns the whole list in catalogue order', () => {
    expect(searchCatalog('', catalog)).toEqual(catalog)
    expect(searchCatalog('   ', catalog)).toEqual(catalog)
  })
})

describe('T72: matchWatched', () => {
  const watching = new Set(['Base.Van', 'Base.CarNormal'])

  it('matches unclaimed cars of a watched script', () => {
    const a = car('Base.Van')
    const b = car('Base.CarNormal')
    expect(matchWatched([a, b, car('Base.SUV')], watching)).toEqual([a, b])
  })

  it('a claimed car is taken, not a match; nor is a car drawn from the claim ledger', () => {
    expect(WATCH_INCLUDES_CLAIMED).toBe(false)
    const claimed = car('Base.Van', { claimed_by: 'ann' })
    const ledger = car('Base.Van', { claimed_by: 'bob', from_ledger: true, vehicle_id: -5 })
    const free = car('Base.Van')
    expect(matchWatched([claimed, ledger, free], watching)).toEqual([free])
  })

  it('ignores a row with no script', () => {
    expect(matchWatched([car(null)], new Set(['Base.Van']))).toEqual([])
  })

  it('nothing watched, nothing matched', () => {
    expect(matchWatched([car('Base.Van')], new Set())).toEqual([])
  })

  it('splitWatched draws a match once: in the matches, never also in the ordinary cars', () => {
    const m = car('Base.Van')
    const other = car('Base.SUV')
    const claimed = car('Base.Van', { claimed_by: 'ann' })
    const { ordinary, matches } = splitWatched([m, other, claimed], watching)
    expect(matches).toEqual([m])
    expect(ordinary).toEqual([other, claimed])
  })
})
