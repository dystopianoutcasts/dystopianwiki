// Pure conversions from database rows to what the map draws. No Leaflet, no React, so they
// are tested directly. Everything is in world squares; latlng is [y, x] (see map/coords.ts).
import type { TilesConfig } from '../map/tiles'
import { cellCentre } from '../map/coords'
import type { HealthSample, MapObject, PlayerPublic, Safehouse, Vehicle, VisiblePosition, Zone, ZombieCell } from '../data/types'

export interface PlayerFeature {
  key: string
  username: string
  label: string
  latlng: [number, number]
  /** True for a delayed, cell-rounded position: drawn hollow with a dashed outline and labelled. */
  delayed: boolean
}

/** Positions joined to profiles. Dead characters are not drawn; unknown profiles fall back to the username. */
export function playerFeatures(positions: VisiblePosition[], profiles: PlayerPublic[]): PlayerFeature[] {
  const byName = new Map(profiles.map((p) => [p.username, p]))
  const out: PlayerFeature[] = []
  for (const pos of positions) {
    const profile = byName.get(pos.username)
    if (profile?.is_dead) continue
    const name = profile?.display_name || pos.username
    const parts = [name]
    if (profile?.hours_survived != null) parts.push(`${Math.floor(profile.hours_survived)} h survived`)
    if (pos.is_delayed) parts.push('approximate position, delayed')
    out.push({
      key: `${pos.server_id}/${pos.username}`,
      username: pos.username,
      label: parts.join(' - '),
      latlng: [pos.y, pos.x],
      delayed: pos.is_delayed,
    })
  }
  return out
}

export interface VehicleFeature {
  key: string
  label: string
  latlng: [number, number]
}

export function vehicleFeatures(vehicles: Vehicle[]): VehicleFeature[] {
  return vehicles.map((v) => ({
    key: `${v.server_id}/${v.vehicle_id}`,
    label: [v.script_name ?? 'Vehicle', v.driver_username ? `driver ${v.driver_username}` : null].filter(Boolean).join(' - '),
    latlng: [v.y, v.x],
  }))
}

export interface RectFeature {
  key: string
  label: string
  /** [top-left, bottom-right] as [y, x] pairs. */
  bounds: [[number, number], [number, number]]
}

export function safehouseFeatures(list: Safehouse[]): RectFeature[] {
  return list.map((s) => ({
    key: `${s.server_id}/${s.id}`,
    label: [s.title || 'Safehouse', s.owner ? `owner ${s.owner}` : null].filter(Boolean).join(' - '),
    bounds: [
      [s.y, s.x],
      [s.y + s.h, s.x + s.w],
    ],
  }))
}

export interface ZoneFeature extends RectFeature {
  kind: string
  /** A zone with no second corner is a single point. */
  point: boolean
}

export function zoneFeatures(list: Zone[]): ZoneFeature[] {
  return list.map((z) => {
    const point = z.x2 == null || z.y2 == null
    return {
      key: `${z.server_id}/${z.kind}/${z.title}/${z.x1}/${z.y1}`,
      label: `${z.title} (${z.kind})`,
      kind: z.kind,
      point,
      bounds: [
        [Math.min(z.y1, z.y2 ?? z.y1), Math.min(z.x1, z.x2 ?? z.x1)],
        [Math.max(z.y1, z.y2 ?? z.y1), Math.max(z.x1, z.x2 ?? z.x1)],
      ],
    }
  })
}

/** [lat, lng, intensity] at each cell centre, intensity scaled to 0..1 by the busiest cell. */
export function heatPoints(cells: ZombieCell[], cfg: TilesConfig): [number, number, number][] {
  const counted = cells.filter((c) => (c.count ?? 0) > 0)
  if (counted.length === 0) return []
  const max = Math.max(...counted.map((c) => c.count as number))
  return counted.map((c) => {
    const centre = cellCentre(cfg, c.cell_x, c.cell_y)
    return [centre.y, centre.x, (c.count as number) / max]
  })
}

export interface ObjectFeature {
  key: string
  label: string
  kind: string
  latlng: [number, number]
}

export function objectFeatures(list: MapObject[]): ObjectFeature[] {
  return list.map((o) => ({
    key: o.id,
    label: o.label || o.kind || 'Map object',
    kind: o.kind ?? 'object',
    latlng: [o.y, o.x],
  }))
}

// ---- health panel -------------------------------------------------------------------

export interface SparkPoint {
  t: number
  v: number
}

export interface Sparkline {
  /** SVG path data, or an empty string when there is nothing to draw. */
  path: string
  min: number
  max: number
  count: number
}

/**
 * Build a polyline path over a fixed time window so a gap in the data shows as a gap in
 * width, not as squeezed points. A constant series is drawn flat in the middle.
 */
export function buildSparkline(points: SparkPoint[], width: number, height: number, tStart: number, tEnd: number): Sparkline {
  const valid = points.filter((p) => Number.isFinite(p.v) && p.t >= tStart && p.t <= tEnd).sort((a, b) => a.t - b.t)
  if (valid.length === 0) return { path: '', min: 0, max: 0, count: 0 }
  const min = Math.min(...valid.map((p) => p.v))
  const max = Math.max(...valid.map((p) => p.v))
  const span = tEnd - tStart || 1
  const range = max - min
  const cmd = valid.map((p, i) => {
    const x = ((p.t - tStart) / span) * width
    const y = range === 0 ? height / 2 : height - ((p.v - min) / range) * height
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  })
  return { path: cmd.join(' '), min, max, count: valid.length }
}

export function toSparkPoints(samples: HealthSample[], pick: (s: HealthSample) => number | null): SparkPoint[] {
  const out: SparkPoint[] = []
  for (const s of samples) {
    const v = pick(s)
    if (v == null) continue
    out.push({ t: Date.parse(s.t), v })
  }
  return out
}

/** "just now", "5 min ago", "3 h ago", "2 d ago". Future times read as "just now". */
export function describeAge(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - Date.parse(iso))
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 48) return `${h} h ago`
  return `${Math.floor(h / 24)} d ago`
}
