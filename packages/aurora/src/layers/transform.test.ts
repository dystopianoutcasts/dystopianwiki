import { describe, expect, it } from 'vitest'
import tilesJson from '../../public/tiles.json'
import type { TilesConfig } from '../map/tiles'
import type { PlayerPublic, VisiblePosition } from '../data/types'
import { mergeByKey, vehicleKey } from '../data/live'
import {
  areaFeatures,
  buildSparkline,
  describeAge,
  describeDuration,
  findablePlayers,
  heatPoints,
  playerFeatures,
  safehouseFeatures,
  streetFeatures,
  streetWeight,
  toSparkPoints,
  vehicleFeatures,
  zoneFeatures,
} from './transform'
import type { StreetRaw } from './transform'

const cfg = tilesJson as unknown as TilesConfig

function pos(over: Partial<VisiblePosition> = {}): VisiblePosition {
  return {
    server_id: 's', username: 'alice', x: 100, y: 200, z: 0, t: null, vehicle_id: null,
    is_delayed: false, is_rounded: false, ...over,
  }
}
function prof(over: Partial<PlayerPublic> = {}): PlayerPublic {
  return {
    server_id: 's', username: 'alice', display_name: 'Alice W', last_seen: null, online: true,
    hours_survived: 12.9, is_dead: false, ...over,
  }
}

describe('player features', () => {
  it('puts y first in latlng and labels with display name and whole hours survived', () => {
    const [f] = playerFeatures([pos()], [prof()], 'character')
    expect(f.latlng).toEqual([200, 100])
    expect(f.label).toBe('Alice W - 12 h survived')
    expect(f.delayed).toBe(false)
  })

  it('T41: name is the name alone, with no hours-survived or delayed note even when label has both', () => {
    const [f] = playerFeatures([pos({ is_delayed: true })], [prof()], 'character')
    expect(f.name).toBe('Alice W')
    expect(f.label).toContain('h survived')
    expect(f.label).toContain('delayed')
    expect(f.name).not.toContain('h survived')
    expect(f.name).not.toContain('delayed')
  })

  it('marks delayed positions and says so in words, not only in style', () => {
    const [f] = playerFeatures([pos({ is_delayed: true, is_rounded: true })], [prof()], 'character')
    expect(f.delayed).toBe(true)
    expect(f.label).toContain('approximate position, delayed')
  })

  it('does not draw dead characters', () => {
    expect(playerFeatures([pos()], [prof({ is_dead: true })], 'character')).toEqual([])
  })

  it('does not draw an offline player even with a position row (an admin receives last-known rows)', () => {
    expect(playerFeatures([pos()], [prof({ online: false })], 'character')).toEqual([])
  })

  it('draws an online player and skips the offline one beside them', () => {
    const out = playerFeatures(
      [pos(), pos({ username: 'bob' })],
      [prof(), prof({ username: 'bob', online: false })],
      'character',
    )
    expect(out.map((f) => f.username)).toEqual(['alice'])
  })

  it('does not draw a position with no matching profile', () => {
    expect(playerFeatures([pos({ username: 'bob' })], [], 'character')).toEqual([])
    expect(playerFeatures([pos({ username: 'bob' })], [prof()], 'character')).toEqual([])
  })

  it('an anonymous caller who is shown no rows gets no markers', () => {
    expect(playerFeatures([], [prof()], 'character')).toEqual([])
  })

  it('T44: account mode always shows the username, even with a display name set', () => {
    const [f] = playerFeatures([pos()], [prof()], 'account')
    expect(f.name).toBe('alice')
    expect(f.label).toBe('alice - 12 h survived')
  })
})

describe('findablePlayers (T38)', () => {
  it('excludes an offline player even with a position row', () => {
    const out = findablePlayers([pos()], [prof({ online: false })], 'character')
    expect(out).toEqual([])
  })

  it('excludes a dead player', () => {
    const out = findablePlayers([pos()], [prof({ is_dead: true })], 'character')
    expect(out).toEqual([])
  })

  it('excludes an online player with no position row', () => {
    const out = findablePlayers([], [prof()], 'character')
    expect(out).toEqual([])
  })

  it('uses display_name, falling back to username only when there is none', () => {
    const [withName] = findablePlayers([pos()], [prof()], 'character')
    expect(withName.name).toBe('Alice W')
    const [withoutName] = findablePlayers([pos({ username: 'bob' })], [prof({ username: 'bob', display_name: null })], 'character')
    expect(withoutName.name).toBe('bob')
  })

  it('sorts by name, case-insensitive', () => {
    const out = findablePlayers(
      [pos({ username: 'bob' }), pos({ username: 'alice' })],
      [prof({ username: 'bob', display_name: 'zed' }), prof({ username: 'alice', display_name: 'Amy' })],
      'character',
    )
    expect(out.map((p) => p.name)).toEqual(['Amy', 'zed'])
  })

  it('numbers duplicate names, in a stable order by key', () => {
    const out = findablePlayers(
      [pos({ username: 'zed' }), pos({ username: 'amy' })],
      [prof({ username: 'zed', display_name: 'Same Name' }), prof({ username: 'amy', display_name: 'Same Name' })],
      'character',
    )
    // 'amy' sorts before 'zed' by key, so amy keeps the bare name and zed gets " (2)",
    // regardless of the order the two rows were passed in.
    expect(out.find((p) => p.key === 'amy')?.name).toBe('Same Name')
    expect(out.find((p) => p.key === 'zed')?.name).toBe('Same Name (2)')
  })

  it('key never equals the displayed name unless there is no display name', () => {
    const [f] = findablePlayers([pos()], [prof()], 'character')
    expect(f.key).toBe('alice')
    expect(f.key).not.toBe(f.name)
    const [g] = findablePlayers([pos({ username: 'bob' })], [prof({ username: 'bob', display_name: null })], 'character')
    expect(g.key).toBe(g.name)
  })

  it('T44: account mode shows the username and never adds an ordinal, even with a shared display name', () => {
    const out = findablePlayers(
      [pos({ username: 'zed' }), pos({ username: 'amy' })],
      [prof({ username: 'zed', display_name: 'Same Name' }), prof({ username: 'amy', display_name: 'Same Name' })],
      'account',
    )
    expect(out.find((p) => p.key === 'amy')?.name).toBe('amy')
    expect(out.find((p) => p.key === 'zed')?.name).toBe('zed')
  })
})

describe('vehicles, safehouses, zones', () => {
  it('vehicle label includes the driver when there is one', () => {
    const [a, b] = vehicleFeatures(
      [
        { server_id: 's', vehicle_id: 1, script_name: 'Base.CarTaxi', x: 5, y: 6, z: 0, t: null, driver_username: 'alice' },
        { server_id: 's', vehicle_id: 2, script_name: null, x: 7, y: 8, z: 0, t: null, driver_username: null },
      ],
      [],
      'character',
    )
    expect(a.label).toBe('Car Taxi - driver alice')
    expect(a.latlng).toEqual([6, 5])
    expect(b.label).toBe('Vehicle')
  })

  it('T34: the public surface has driver_username null and never prints a driver', () => {
    const [v] = vehicleFeatures(
      [{ server_id: 's', vehicle_id: 3, script_name: 'Base.PickUpVan', x: 1, y: 2, z: 0, t: null, driver_username: null }],
      [],
      'character',
    )
    expect(v.label).toBe('Pick Up Van')
    expect(v.label).not.toContain('driver')
  })

  it('T44: the driver line resolves through profiles the same way a player name does', () => {
    const vehicles = [{ server_id: 's', vehicle_id: 1, script_name: 'Base.CarTaxi', x: 5, y: 6, z: 0, t: null, driver_username: 'alice' }]
    const [character] = vehicleFeatures(vehicles, [prof()], 'character')
    expect(character.label).toBe('Car Taxi - driver Alice W')
    const [account] = vehicleFeatures(vehicles, [prof()], 'account')
    expect(account.label).toBe('Car Taxi - driver alice')
    // No matching profile: falls back to the raw username in either mode.
    const [noProfile] = vehicleFeatures(vehicles, [], 'character')
    expect(noProfile.label).toBe('Car Taxi - driver alice')
  })

  describe('claimed cars (migration 028)', () => {
    const car = { server_id: 's', vehicle_id: 7, script_name: 'Base.CarTaxi', x: 5, y: 6, z: 0, t: null, driver_username: null }

    it('a claimed car reads "<car> - claimed by <owner>" and is marked claimed', () => {
      const [v] = vehicleFeatures([{ ...car, claimed_by: 'alice' }], [], 'character')
      expect(v.label).toBe('Car Taxi - claimed by alice')
      expect(v.claimed).toBe(true)
    })

    it('the owner follows the name mode like a safehouse owner', () => {
      const claimed = [{ ...car, claimed_by: 'alice' }]
      expect(vehicleFeatures(claimed, [prof()], 'character')[0].label).toBe('Car Taxi - claimed by Alice W')
      expect(vehicleFeatures(claimed, [prof()], 'account')[0].label).toBe('Car Taxi - claimed by alice')
    })

    it('the key prefers sql_id and falls back to vehicle_id', () => {
      const [a, b] = vehicleFeatures([{ ...car, sql_id: 4242 }, { ...car, vehicle_id: 8 }], [], 'character')
      expect(a.key).toBe('s/q4242')
      expect(b.key).toBe('s/i8')
    })

    it('a vehicle_id equal to another car\'s sql_id does not collide: both are drawn and both survive the merge', () => {
      const cars = [{ ...car, vehicle_id: 5, sql_id: 77 }, { ...car, vehicle_id: 77, sql_id: null, x: 9 }]
      const features = vehicleFeatures(cars, [], 'character')
      expect(new Set(features.map((f) => f.key)).size).toBe(2)
      expect(mergeByKey(cars.slice(0, 1), cars.slice(1), vehicleKey)).toHaveLength(2)
    })

    it('a from_ledger car is marked and says "last seen here"', () => {
      const [v] = vehicleFeatures([{ ...car, vehicle_id: -3, claimed_by: 'alice', from_ledger: true }], [], 'character')
      expect(v.ledger).toBe(true)
      expect(v.label).toBe('Car Taxi - claimed by alice - last seen here')
    })

    it('an admin row with claimed_at adds the date to the claim, and the driver still shows', () => {
      const iso = '2026-09-20T10:00:00Z'
      const [v] = vehicleFeatures([{ ...car, claimed_by: 'alice', claimed_at: iso, driver_username: 'bob' }], [], 'account')
      const date = new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
      expect(v.label).toBe(`Car Taxi - claimed by alice since ${date} - driver bob`)
    })

    it('an unclaimed car has no claimed text and is not marked', () => {
      const [v] = vehicleFeatures([{ ...car, claimed_by: null, sql_id: null, from_ledger: false }], [], 'character')
      expect(v.label).toBe('Car Taxi')
      expect(v.label).not.toContain('claimed')
      expect(v.claimed).toBe(false)
      expect(v.ledger).toBe(false)
    })
  })

  it('safehouse rectangle runs from (x,y) to (x+w,y+h) as [y,x] pairs', () => {
    const [s] = safehouseFeatures([{ server_id: 's', id: 'a', x: 10, y: 20, w: 5, h: 7, owner: 'bob', title: null }], [], 'character')
    expect(s.bounds).toEqual([[20, 10], [27, 15]])
    expect(s.label).toBe('Safehouse - owner bob')
  })

  it('T44: the safehouse owner line resolves through profiles the same way a player name does', () => {
    const houses = [{ server_id: 's', id: 'a', x: 10, y: 20, w: 5, h: 7, owner: 'alice', title: null }]
    const [character] = safehouseFeatures(houses, [prof()], 'character')
    expect(character.label).toBe('Safehouse - owner Alice W')
    const [account] = safehouseFeatures(houses, [prof()], 'account')
    expect(account.label).toBe('Safehouse - owner alice')
    // No matching profile: falls back to the raw username in either mode.
    const [noProfile] = safehouseFeatures(houses, [], 'account')
    expect(noProfile.label).toBe('Safehouse - owner alice')
  })

  it('zone corners are ordered, and a zone without a second corner is a point', () => {
    const [r, p] = zoneFeatures([
      { server_id: 's', kind: 'NonPvp', title: 'Spawn', x1: 30, y1: 40, x2: 10, y2: 20 },
      { server_id: 's', kind: 'Story', title: 'Camp', x1: 5, y1: 6, x2: null, y2: null },
    ])
    expect(r.bounds).toEqual([[20, 10], [40, 30]])
    expect(r.point).toBe(false)
    expect(p.point).toBe(true)
    expect(p.bounds).toEqual([[6, 5], [6, 5]])
  })
})

describe('zombie heat', () => {
  it('places heat at the cell centre and scales to the busiest cell', () => {
    const pts = heatPoints(
      [
        { server_id: 's', cell_x: 42, cell_y: 40, count: 200, t: null },
        { server_id: 's', cell_x: 43, cell_y: 40, count: 50, t: null },
        { server_id: 's', cell_x: 1, cell_y: 1, count: 0, t: null },
        { server_id: 's', cell_x: 2, cell_y: 2, count: null, t: null },
      ],
      cfg,
    )
    expect(pts).toEqual([
      [40 * 256 + 128, 42 * 256 + 128, 1],
      [40 * 256 + 128, 43 * 256 + 128, 0.25],
    ])
  })

  it('is empty when nothing is counted', () => {
    expect(heatPoints([], cfg)).toEqual([])
  })

  it('ignores a row older than 3 minutes but keeps one with no timestamp (T22 addendum)', () => {
    const now = Date.parse('2026-09-29T00:10:00Z')
    const fresh = new Date(now - 179_000).toISOString()
    const stale = new Date(now - 181_000).toISOString()
    const pts = heatPoints(
      [
        { server_id: 's', cell_x: 42, cell_y: 40, count: 10, t: fresh },
        { server_id: 's', cell_x: 43, cell_y: 40, count: 10, t: stale },
        { server_id: 's', cell_x: 44, cell_y: 40, count: 10, t: null },
      ],
      cfg,
      now,
    )
    expect(pts).toEqual([
      [40 * 256 + 128, 42 * 256 + 128, 1],
      [40 * 256 + 128, 44 * 256 + 128, 1],
    ])
  })
})

describe('sparkline', () => {
  const t0 = Date.parse('2026-09-28T10:00:00Z')
  const min = 60_000

  it('spreads points across the window by time and puts the highest value on top', () => {
    const s = buildSparkline(
      [{ t: t0, v: 0 }, { t: t0 + 30 * min, v: 10 }, { t: t0 + 60 * min, v: 5 }],
      100, 20, t0, t0 + 60 * min,
    )
    expect(s.path).toBe('M0.0 20.0 L50.0 0.0 L100.0 10.0')
    expect([s.min, s.max, s.count]).toEqual([0, 10, 3])
  })

  it('leaves a time gap as a gap in width', () => {
    const s = buildSparkline([{ t: t0, v: 1 }, { t: t0 + 60 * min, v: 2 }], 100, 20, t0, t0 + 60 * min)
    expect(s.path).toBe('M0.0 20.0 L100.0 0.0')
  })

  it('draws a constant series flat in the middle and handles empty input', () => {
    expect(buildSparkline([{ t: t0, v: 7 }, { t: t0 + min, v: 7 }], 100, 20, t0, t0 + 10 * min).path).toBe('M0.0 10.0 L10.0 10.0')
    expect(buildSparkline([], 100, 20, t0, t0 + min).path).toBe('')
  })

  it('drops samples outside the window and non-finite values', () => {
    const s = buildSparkline(
      [{ t: t0 - min, v: 99 }, { t: t0, v: NaN }, { t: t0 + min, v: 3 }],
      100, 20, t0, t0 + 10 * min,
    )
    expect(s.count).toBe(1)
  })

  it('skips null readings when picking a column', () => {
    const pts = toSparkPoints(
      [
        { server_id: 's', t: '2026-09-28T10:00:00Z', players: 2, zombies_total: null, zombies_loaded: null, zombies_simulated: null, tick_ms: null, tick_min_ms: null, tick_max_ms: null, memory_used: null, memory_max: null },
        { server_id: 's', t: '2026-09-28T10:01:00Z', players: null, zombies_total: null, zombies_loaded: null, zombies_simulated: null, tick_ms: null, tick_min_ms: null, tick_max_ms: null, memory_used: null, memory_max: null },
      ],
      (s) => s.players,
    )
    expect(pts).toEqual([{ t: t0, v: 2 }])
  })
})

describe('describeAge', () => {
  const now = Date.parse('2026-09-28T12:00:00Z')
  it('reads naturally', () => {
    expect(describeAge('2026-09-28T11:59:40Z', now)).toBe('just now')
    expect(describeAge('2026-09-28T11:55:00Z', now)).toBe('5 min ago')
    expect(describeAge('2026-09-28T09:00:00Z', now)).toBe('3 h ago')
    expect(describeAge('2026-09-25T12:00:00Z', now)).toBe('3 d ago')
    expect(describeAge('2026-09-28T12:05:00Z', now)).toBe('just now')
  })
})

describe('describeDuration (T22 Part D item 3: "No report for N.")', () => {
  const now = Date.parse('2026-09-28T12:00:00Z')
  it('reads as a bare duration, no "ago"', () => {
    expect(describeDuration('2026-09-28T11:59:40Z', now)).toBe('under a minute')
    expect(describeDuration('2026-09-28T11:55:00Z', now)).toBe('5 min')
    expect(describeDuration('2026-09-28T09:00:00Z', now)).toBe('3 h')
    expect(describeDuration('2026-09-25T12:00:00Z', now)).toBe('3 d')
  })

  it('stays in hours up to 47 h, not switching to days until 48 h', () => {
    expect(describeDuration('2026-09-27T06:00:00Z', now)).toBe('30 h')
  })

  it('a future timestamp reads as under a minute, never negative', () => {
    expect(describeDuration('2026-09-28T12:05:00Z', now)).toBe('under a minute')
  })
})

describe('areaFeatures (T22 Part D item 2)', () => {
  it('puts y first in latlng, same as every other feature', () => {
    const [f] = areaFeatures([{ name: 'Muldraugh', kind: 'town', x: 10500, y: 10250, areaSquares: 21_000_000, count: 31 }])
    expect(f.latlng).toEqual([10250, 10500])
    expect(f.name).toBe('Muldraugh')
    expect(f.kind).toBe('town')
  })

  it('keys towns and landmarks separately so a same-named pair never collides', () => {
    const list = areaFeatures([
      { name: 'X', kind: 'town', x: 0, y: 0, areaSquares: 1, count: 1 },
      { name: 'X', kind: 'landmark', x: 0, y: 0, areaSquares: 1, count: 1 },
    ])
    expect(new Set(list.map((f) => f.key)).size).toBe(2)
  })
})

describe('streetWeight (T22 Part D item 6: weight follows zoom)', () => {
  it('is 2 px at the minimum zoom and 5 px at the deepest level', () => {
    expect(streetWeight(5, 5, 15, undefined)).toBe(2)
    expect(streetWeight(15, 5, 15, undefined)).toBe(5)
  })

  it('the deepest two levels both plateau at 5 px', () => {
    expect(streetWeight(14, 5, 15, undefined)).toBe(5)
  })

  it('ramps linearly between the min and the plateau', () => {
    // minZoom 5, plateau at maxZoom-1=14: span 9, so zoom 9.5 is halfway -> base 3.5
    expect(streetWeight(9.5, 5, 15, undefined)).toBeCloseTo(3.5, 5)
  })

  it('clamps outside the zoom range rather than going negative or past the plateau', () => {
    expect(streetWeight(0, 5, 15, undefined)).toBe(2)
    expect(streetWeight(30, 5, 15, undefined)).toBe(5)
  })

  it('scales up for a wider street at the same zoom', () => {
    const narrow = streetWeight(10, 5, 15, 3)
    const median = streetWeight(10, 5, 15, 6)
    const wide = streetWeight(10, 5, 15, 17)
    expect(wide).toBeGreaterThan(median)
    expect(median).toBeGreaterThan(narrow)
  })

  it('treats a missing or zero width the same as no width at all', () => {
    const base = streetWeight(10, 5, 15, undefined)
    expect(streetWeight(10, 5, 15, 0)).toBe(base)
  })

  it('never drops below 1.5 px even for a very narrow street at the lowest zoom', () => {
    expect(streetWeight(5, 5, 15, 1)).toBeGreaterThanOrEqual(1.5)
  })
})

describe('streetFeatures (T42: one road, possibly several pieces, already merged and labelled)', () => {
  function raw(over: Partial<StreetRaw> = {}): StreetRaw {
    return {
      id: 'tioga-road', name: 'Tioga Road', label: 'Tioga Road', area: null, width: 8,
      lines: [[[100, 200], [110, 210]]], center: [105, 205], ...over,
    }
  }

  it('carries the id straight through as the feature key (already unique by construction)', () => {
    const [f] = streetFeatures([raw({ id: 'main-st-rosewood' })])
    expect(f.key).toBe('main-st-rosewood')
  })

  it('carries label, width and center through unchanged', () => {
    const [f] = streetFeatures([raw({ label: 'Main St, Rosewood', width: 12, center: [8350, 11750] })])
    expect(f.label).toBe('Main St, Rosewood')
    expect(f.width).toBe(12)
    expect(f.center).toEqual([8350, 11750])
  })

  it('converts every piece from x,y to latlng (y,x), keeping one array per piece', () => {
    const [f] = streetFeatures([raw({ lines: [[[100, 200], [110, 210]], [[300, 400]]] })])
    expect(f.latlngs).toEqual([[[200, 100], [210, 110]], [[400, 300]]])
  })
})
