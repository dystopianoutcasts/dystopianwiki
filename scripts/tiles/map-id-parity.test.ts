// T50: the live map matches overlays and data tags by map id, so the app's port of mapId
// (packages/aurora/src/map/mapId.ts) must give exactly the ids this script gives
// (describe-mod-maps.ts, which names the overlays; extract-*.ts tag with it too). Both
// exports are imported and compared on the same inputs. This file lives here, not under
// packages/aurora/src, because the app's typecheck has no Node types for this script.
import { describe, expect, it } from 'vitest'
import { mapId as scriptMapId } from './describe-mod-maps'
import { mapId as appMapId } from '../../packages/aurora/src/map/mapId'
import { VANILLA_MAP_ID } from './extract-streets'

const PINS: [string, string][] = [
  ['Raven Creek B42', 'raven-creek-b42'],
  ['Constown, KY', 'constown-ky'],
  ['RaccoonCity', 'raccooncity'],
  ['HavenFall', 'havenfall'],
  ['AnruisiTown', 'anruisitown'],
  ['New Hartburg, KY', 'new-hartburg-ky'],
]

describe('mapId: the app and the script agree (T50)', () => {
  it.each(PINS)('script: %s -> %s', (name, id) => {
    expect(scriptMapId(name)).toBe(id)
  })

  it.each([...PINS.map(([n]) => n), 'Muldraugh, KY', '  Spaced  Out  ', 'Under_Score', 'a--b', 'Lawnmower', 'Vehicle Spawn Zones'])(
    'app and script give the same id for %j',
    (name) => {
      expect(appMapId(name)).toBe(scriptMapId(name))
    },
  )

  it('the extractors\' untagged id is the app\'s vanilla id', () => {
    expect(VANILLA_MAP_ID).toBe(appMapId('Muldraugh, KY'))
  })

  it('a name with no id: the script refuses, the app gives "" (one odd Map= entry must not break the page)', () => {
    expect(() => scriptMapId(', ,')).toThrow()
    expect(appMapId(', ,')).toBe('')
  })
})
