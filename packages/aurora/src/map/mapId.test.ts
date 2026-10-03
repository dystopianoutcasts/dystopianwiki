// T50: the app's mapId must give the same ids as the script that names the tile overlays
// and tags the data files (scripts/tiles/describe-mod-maps.ts). The comparison with the
// script's own export lives in scripts/tiles/map-id-parity.test.ts: importing a Node
// script from here would pull it into the app's typecheck, which has no Node types.
import { describe, expect, it } from 'vitest'
import { isHelperMap, mapId, VANILLA_MAP_ID } from './mapId'

const PINS: [string, string][] = [
  ['Raven Creek B42', 'raven-creek-b42'],
  ['Constown, KY', 'constown-ky'],
  ['RaccoonCity', 'raccooncity'],
  ['HavenFall', 'havenfall'],
  ['AnruisiTown', 'anruisitown'],
  ['New Hartburg, KY', 'new-hartburg-ky'],
]

describe('mapId (T50)', () => {
  it.each(PINS)('%s -> %s', (name, id) => {
    expect(mapId(name)).toBe(id)
  })

  it('vanilla is muldraugh-ky', () => {
    expect(VANILLA_MAP_ID).toBe('muldraugh-ky')
  })

  it('never throws: a name with no letters or digits is "" (the script refuses it instead)', () => {
    expect(mapId(', ,')).toBe('')
  })

  it('helpers are matched lower case after trimming, like the home page', () => {
    expect(isHelperMap('Lawnmower')).toBe(true)
    expect(isHelperMap('  vehicle spawn zones ')).toBe(true)
    expect(isHelperMap('Raven Creek B42')).toBe(false)
  })
})
