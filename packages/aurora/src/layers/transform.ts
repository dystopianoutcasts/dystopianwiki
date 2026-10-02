// Pure conversions from database rows to what the map draws. No Leaflet, no React, so they
// are tested directly. Everything is in world squares; latlng is [y, x] (see map/coords.ts).
import type { TilesConfig } from '../map/tiles'
import { cellCentre } from '../map/coords'
import type { HealthSample, MapObject, NpcGroup, NpcOutpost, PlayerPublic, Safehouse, Vehicle, VisiblePosition, Zone, ZombieCell } from '../data/types'
import { vehicleKey } from '../data/live'
import type { NameMode } from '../state/nameMode'

/** T44: usernames are intentionally public (owner decision, reversing T27); every
 * visitor may switch what is shown. `account` always shows the username; `character`
 * shows the display name and falls back to the username only when there is none - the
 * one fallback is not a third mode, it applies inside `character` regardless of storage. */
function pickName(mode: NameMode, displayName: string | null | undefined, username: string): string {
  return mode === 'account' ? username : displayName || username
}

export interface PlayerFeature {
  key: string
  username: string
  /** Name only, no hours-survived or delayed note - T41's permanent on-map label. */
  name: string
  /** Name plus hours survived plus the delayed note, joined by " - " - today's hover text. */
  label: string
  latlng: [number, number]
  /** True for a delayed, cell-rounded position: drawn hollow with a dashed outline and labelled. */
  delayed: boolean
}

/** Positions joined to profiles. Only online, living characters are drawn: an admin also
 * receives last-known rows for everyone offline (aurora.player_positions keeps them), and a position
 * with no matching profile cannot be shown to be online. Same online test as the roster. */
export function playerFeatures(positions: VisiblePosition[], profiles: PlayerPublic[], mode: NameMode): PlayerFeature[] {
  const byName = new Map(profiles.map((p) => [p.username, p]))
  const out: PlayerFeature[] = []
  for (const pos of positions) {
    const profile = byName.get(pos.username)
    if (!profile || !profile.online || profile.is_dead) continue
    const name = pickName(mode, profile.display_name, pos.username)
    const parts = [name]
    if (profile.hours_survived != null) parts.push(`${Math.floor(profile.hours_survived)} h survived`)
    if (pos.is_delayed) parts.push('approximate position, delayed')
    out.push({
      key: `${pos.server_id}/${pos.username}`,
      username: pos.username,
      name,
      label: parts.join(' - '),
      latlng: [pos.y, pos.x],
      delayed: pos.is_delayed,
    })
  }
  return out
}

export interface FindablePlayer {
  /** Opaque identifier for the control's own bookkeeping - never rendered. The username
   * (stable, unique per (server_id, username), unaffected by `mode`). */
  key: string
  name: string
  x: number
  y: number
}

/**
 * T38: the list `panels/FindPlayer.tsx` offers. Built from exactly the same two
 * datasets `playerFeatures` already has (`profiles.data`, `positions.data`) - no new
 * query. A player can be online with no position row (VISIBILITY.md: a position is only
 * ever written for a live, tracked character); such a player cannot be found on the map
 * and is not offered here, same as `playerFeatures` never draws one. Two characters can
 * share a display name, so a duplicate gets " (2)", " (3)" appended - assigned in a
 * stable order by `key` (not raw input order, which is not guaranteed stable) so the
 * numbering does not flap between refreshes while both stay online. Usernames are unique
 * per profile, so in `account` mode (T44) this grouping never finds a collision and no
 * ordinal ever appears - the same code path handles both, nothing is special-cased.
 */
export function findablePlayers(positions: VisiblePosition[], profiles: PlayerPublic[], mode: NameMode): FindablePlayer[] {
  const posByUsername = new Map(positions.map((p) => [p.username, p]))
  type Candidate = { key: string; baseName: string; x: number; y: number }
  const candidates: Candidate[] = []
  for (const profile of profiles) {
    if (!profile.online || profile.is_dead) continue
    const pos = posByUsername.get(profile.username)
    if (!pos) continue
    candidates.push({ key: profile.username, baseName: pickName(mode, profile.display_name, profile.username), x: pos.x, y: pos.y })
  }

  const byName = new Map<string, Candidate[]>()
  for (const c of candidates) {
    if (!byName.has(c.baseName)) byName.set(c.baseName, [])
    byName.get(c.baseName)!.push(c)
  }

  const out: FindablePlayer[] = []
  for (const group of byName.values()) {
    group.sort((a, b) => a.key.localeCompare(b.key))
    group.forEach((c, i) => {
      out.push({ key: c.key, name: i === 0 ? c.baseName : `${c.baseName} (${i + 1})`, x: c.x, y: c.y })
    })
  }

  out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  return out
}

/** Month and day in the viewer's locale, or null for an unparseable timestamp. */
export function shortDate(iso: string): string | null {
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? null : new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export interface VehicleFeature {
  key: string
  label: string
  latlng: [number, number]
  /** Claimed by a player (migration 028): drawn with a lock badge, never by colour alone. */
  claimed: boolean
  /** Not loaded now; drawn at the claim ledger's last-known position, dimmed. */
  ledger: boolean
}

/** `driver_username` is already `null` for a public (signed-out) caller
 * (`data/queries.ts` `fetchVehiclesPublic`) - that admin-only gate is unrelated to T44
 * and unchanged here; `mode` only changes how an already-visible driver name reads.
 *
 * A claim's owner (`claimed_by`) is shown to everyone, like a safehouse owner (owner
 * decision), and reads through `pickName` the same way. The key prefers `sql_id`, the
 * car's persistent id, so a marker does not jump when a restart renumbers `vehicle_id`
 * (which is also negative for a ledger-only car, so it is never a game id). */
export function vehicleFeatures(vehicles: Vehicle[], profiles: PlayerPublic[], mode: NameMode): VehicleFeature[] {
  const byUsername = new Map(profiles.map((p) => [p.username, p]))
  return vehicles.map((v) => {
    const driver = v.driver_username ? pickName(mode, byUsername.get(v.driver_username)?.display_name, v.driver_username) : null
    const owner = v.claimed_by ? pickName(mode, byUsername.get(v.claimed_by)?.display_name, v.claimed_by) : null
    const ledger = v.from_ledger === true
    // Admin rows only (the RPC): the public view carries no claim date.
    const since = owner && v.claimed_at ? shortDate(v.claimed_at) : null
    return {
      key: `${v.server_id}/${vehicleKey(v)}`,
      label: [
        v.script_name ?? 'Vehicle',
        owner ? `claimed by ${owner}${since ? ` since ${since}` : ''}` : null,
        driver ? `driver ${driver}` : null,
        ledger ? 'last seen here' : null,
      ]
        .filter(Boolean)
        .join(' - '),
      latlng: [v.y, v.x],
      claimed: owner !== null,
      ledger,
    }
  })
}

export interface RectFeature {
  key: string
  label: string
  /** [top-left, bottom-right] as [y, x] pairs. */
  bounds: [[number, number], [number, number]]
}

/** `owner` is a login username (the ingest fills it directly); `mode` picks how it reads,
 * same choice as a player's own name. No matching profile falls back to the raw username
 * in either mode - that is what "no display name" already means inside `pickName`, not a
 * third mode. */
export function safehouseFeatures(list: Safehouse[], profiles: PlayerPublic[], mode: NameMode): RectFeature[] {
  const byUsername = new Map(profiles.map((p) => [p.username, p]))
  return list.map((s) => {
    const owner = s.owner ? pickName(mode, byUsername.get(s.owner)?.display_name, s.owner) : null
    return {
      key: `${s.server_id}/${s.id}`,
      label: [s.title || 'Safehouse', owner ? `owner ${owner}` : null].filter(Boolean).join(' - '),
      bounds: [
        [s.y, s.x],
        [s.y + s.h, s.x + s.w],
      ],
    }
  })
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

/**
 * T22 addendum (2026-09-29): the live zombie grid can go stale (a teleport, a latched
 * write) while the upsert-only row stays in place, so this layer ignores anything older
 * than 3 minutes itself rather than trusting T25's ingest-side fix to have landed yet.
 * A row with no timestamp (older data, or a test fixture) is kept: absence of `t` is not
 * evidence of staleness.
 */
const ZOMBIE_STALE_MS = 3 * 60_000

/** [lat, lng, intensity] at each cell centre, intensity scaled to 0..1 by the busiest cell. */
export function heatPoints(cells: ZombieCell[], cfg: TilesConfig, now: number = Date.now()): [number, number, number][] {
  const counted = cells.filter((c) => (c.count ?? 0) > 0 && (c.t == null || now - Date.parse(c.t) <= ZOMBIE_STALE_MS))
  if (counted.length === 0) return []
  const max = Math.max(...counted.map((c) => c.count as number))
  return counted.map((c) => {
    const centre = cellCentre(cfg, c.cell_x, c.cell_y)
    return [centre.y, centre.x, (c.count as number) / max]
  })
}

/** Shape of one entry in map/data/streets.json (scripts/tiles/extract-streets.ts, T42):
 * one road, already merged from any touching same-named pieces and disambiguated from
 * any other road that happens to share its name. */
export interface StreetRaw {
  id: string
  name: string
  label: string
  area: string | null
  width: number
  lines: [number, number][][]
  center: [number, number]
}

export interface StreetFeature {
  key: string
  name: string
  /** What search and the hover tooltip show - unique across the file. */
  label: string
  width: number
  /** A point on the road, in [x, y] world squares - what a search result flies to. */
  center: [number, number]
  /** One Leaflet polyline per source piece, so a road built from several touching
   * segments still draws (and hovers) as a single connected shape. */
  latlngs: [number, number][][]
}

/**
 * The visible street line's weight at a given zoom (T22 Part D item 6, owner request:
 * the single thin line was too hard to hover): 2 px at `minZoom` ramping up to 5 px by
 * `maxZoom - 1`, then flat through `maxZoom` - the "deepest two levels" both read the
 * max weight - scaled a little by the street's own width from streets.json where one is
 * present (a highway reads a bit heavier than an alley at the same zoom; 6 squares is
 * the real file's median width, and the scale is bounded so a very wide or narrow
 * street never swings outside a legible range). Pure so it can be tested directly;
 * build.ts draws a second, invisible, constant-weight line on top of it for hovering
 * and never varies that one by zoom - only what the visitor SEES should change.
 */
export function streetWeight(zoom: number, minZoom: number, maxZoom: number, width?: number): number {
  const plateauZoom = Math.max(minZoom, maxZoom - 1)
  const span = Math.max(1, plateauZoom - minZoom)
  const t = Math.max(0, Math.min(1, (zoom - minZoom) / span))
  const base = 2 + t * 3
  if (!width || width <= 0) return base
  const scale = Math.max(0.85, Math.min(1.3, width / 6))
  return Math.max(1.5, base * scale)
}

/** `id` from extract-streets.ts is already a stable, unique key (a slug of `label`). */
export function streetFeatures(streets: StreetRaw[]): StreetFeature[] {
  return streets.map((s) => ({
    key: s.id,
    name: s.name,
    label: s.label,
    width: s.width,
    center: s.center,
    latlngs: s.lines.map((line) => line.map(([x, y]) => [y, x] as [number, number])),
  }))
}

/** Shape of map/data/worldmap.json (scripts/tiles/extract-worldmap.ts). */
export interface WorldMapRaw {
  roads: { type: string; closed: boolean; points: [number, number][] }[]
  buildings: { type: string; points: [number, number][] }[]
  water: { points: [number, number][] }[]
  forest: { points: [number, number][] }[]
}

export interface WorldMapFeatures {
  roads: { type: string; closed: boolean; latlngs: [number, number][] }[]
  buildings: { latlngs: [number, number][] }[]
  water: { latlngs: [number, number][] }[]
  forest: { latlngs: [number, number][] }[]
}

/** x,y to latlng (y,x) across every feature. Nothing else changes: no per-feature `key` is
 * needed, since this layer is built imperatively (build.ts), never mapped over in JSX. */
export function worldMapFeatures(raw: WorldMapRaw): WorldMapFeatures {
  const toLatLngs = (points: [number, number][]): [number, number][] => points.map(([x, y]) => [y, x])
  return {
    roads: raw.roads.map((r) => ({ type: r.type, closed: r.closed, latlngs: toLatLngs(r.points) })),
    buildings: raw.buildings.map((b) => ({ latlngs: toLatLngs(b.points) })),
    water: raw.water.map((w) => ({ latlngs: toLatLngs(w.points) })),
    forest: raw.forest.map((f) => ({ latlngs: toLatLngs(f.points) })),
  }
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

/** Shape of one entry in map/data/areas.json (scripts/tiles/extract-objects.ts). */
export interface AreaRaw {
  name: string
  kind: 'town' | 'landmark'
  x: number
  y: number
  areaSquares: number
  count: number
  /** A map-mod town (T45); absent for every vanilla area. */
  mod?: boolean
}

export interface AreaFeature {
  key: string
  name: string
  kind: 'town' | 'landmark'
  latlng: [number, number]
  /** Vanilla labels are drawn first and never move; a mod label steps aside (T45). */
  mod: boolean
  areaSquares: number
}

export function areaFeatures(list: AreaRaw[]): AreaFeature[] {
  return list.map((a) => ({
    key: `${a.kind}/${a.name}`,
    name: a.name,
    kind: a.kind,
    latlng: [a.y, a.x],
    mod: a.mod === true,
    areaSquares: a.areaSquares,
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

/**
 * A bare duration with no "ago" suffix, for sentences that already say what it is a
 * duration of ("No report for 5 min."): "under a minute", "5 min", "3 h", "2 d".
 */
export function describeDuration(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - Date.parse(iso))
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'under a minute'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 48) return `${h} h`
  return `${Math.floor(h / 24)} d`
}

export type NpcStance = 'hostile' | 'careful' | 'neutral' | 'friendly' | 'allied'
const NPC_STANCES: readonly string[] = ['hostile', 'careful', 'neutral', 'friendly', 'allied']

/** A stance the database sent that this build does not know reads as no stance, not as a guess. */
function npcStance(raw: string | null | undefined): NpcStance | null {
  return raw && NPC_STANCES.includes(raw) ? (raw as NpcStance) : null
}

export interface NpcGroupFeature {
  key: string
  /** "<faction> - <n> members - <stance>", plus the dormant and admin notes; the one text the tooltip and the marker's name use. */
  label: string
  latlng: [number, number]
  size: number
  stance: NpcStance | null
  /** False: not near any player; drawn dimmed and dashed, and the label says so. */
  active: boolean
  /** Admin RPC row the public view would not show: the label says "admin only". */
  adminOnly: boolean
}

/** The database already filters spoilers and stale groups, so every row given is drawn.
 * `encounter` and `source` exist only on an admin row (the RPC), so they show only there. */
export function npcGroupFeatures(list: NpcGroup[]): NpcGroupFeature[] {
  return list.map((g) => {
    const stance = npcStance(g.stance)
    const active = g.active !== false
    const adminOnly = g.sensitive === true
    return {
      key: `npc/${g.server_id}/${g.group_id}`,
      label: [
        g.faction_name || 'Unknown faction',
        `${g.size} ${g.size === 1 ? 'member' : 'members'}`,
        stance ?? 'stance unknown',
        active ? null : 'not near any player',
        g.encounter ? `encounter ${g.encounter}` : null,
        g.source ? `source ${g.source}` : null,
        adminOnly ? 'admin only - hidden from the public map' : null,
      ]
        .filter(Boolean)
        .join(' - '),
      latlng: [g.y, g.x],
      size: g.size,
      stance,
      active,
      adminOnly,
    }
  })
}

export interface NpcOutpostFeature extends RectFeature {
  hostile: boolean
}

/** Corners are INCLUSIVE world squares in either order (the director's inside test is x <= x2), so the rectangle
 * runs from the min corner to the max corner plus one square, the way a safehouse is x + w. */
export function npcOutpostFeatures(list: NpcOutpost[]): NpcOutpostFeature[] {
  return list.map((o) => {
    const hostile = o.hostile === true
    return {
      key: `npco/${o.server_id}/${o.outpost_id}`,
      label: [
        `${o.faction_name || 'Unknown faction'} outpost`,
        hostile ? 'hostile to players' : null,
        o.state ? `state ${o.state}` : null,
        o.hidden ? 'admin only - hidden from the public map' : null,
      ]
        .filter(Boolean)
        .join(' - '),
      hostile,
      bounds: [
        [Math.min(o.y1, o.y2), Math.min(o.x1, o.x2)],
        [Math.max(o.y1, o.y2) + 1, Math.max(o.x1, o.x2) + 1],
      ],
    }
  })
}
