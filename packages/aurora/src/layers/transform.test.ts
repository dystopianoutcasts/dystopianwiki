import { describe, expect, it } from 'vitest'
import tilesJson from '../../public/tiles.json'
import type { TilesConfig } from '../map/tiles'
import type { PlayerPublic, VisiblePosition } from '../data/types'
import {
  buildSparkline,
  describeAge,
  heatPoints,
  playerFeatures,
  safehouseFeatures,
  toSparkPoints,
  vehicleFeatures,
  zoneFeatures,
} from './transform'

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
    hours_survived: 12.9, access_level: null, is_dead: false, ...over,
  }
}

describe('player features', () => {
  it('puts y first in latlng and labels with display name and whole hours survived', () => {
    const [f] = playerFeatures([pos()], [prof()])
    expect(f.latlng).toEqual([200, 100])
    expect(f.label).toBe('Alice W - 12 h survived')
    expect(f.delayed).toBe(false)
  })

  it('marks delayed positions and says so in words, not only in style', () => {
    const [f] = playerFeatures([pos({ is_delayed: true, is_rounded: true })], [prof()])
    expect(f.delayed).toBe(true)
    expect(f.label).toContain('approximate position, delayed')
  })

  it('does not draw dead characters and falls back to the username without a profile', () => {
    expect(playerFeatures([pos()], [prof({ is_dead: true })])).toEqual([])
    const [f] = playerFeatures([pos({ username: 'bob' })], [])
    expect(f.label).toBe('bob')
  })

  it('an anonymous caller who is shown no rows gets no markers', () => {
    expect(playerFeatures([], [prof()])).toEqual([])
  })
})

describe('vehicles, safehouses, zones', () => {
  it('vehicle label includes the driver when there is one', () => {
    const [a, b] = vehicleFeatures([
      { server_id: 's', vehicle_id: 1, script_name: 'Base.CarTaxi', x: 5, y: 6, z: 0, t: null, driver_username: 'alice' },
      { server_id: 's', vehicle_id: 2, script_name: null, x: 7, y: 8, z: 0, t: null, driver_username: null },
    ])
    expect(a.label).toBe('Base.CarTaxi - driver alice')
    expect(a.latlng).toEqual([6, 5])
    expect(b.label).toBe('Vehicle')
  })

  it('safehouse rectangle runs from (x,y) to (x+w,y+h) as [y,x] pairs', () => {
    const [s] = safehouseFeatures([{ server_id: 's', id: 'a', x: 10, y: 20, w: 5, h: 7, owner: 'bob', title: null, players: [] }])
    expect(s.bounds).toEqual([[20, 10], [27, 15]])
    expect(s.label).toBe('Safehouse - owner bob')
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
