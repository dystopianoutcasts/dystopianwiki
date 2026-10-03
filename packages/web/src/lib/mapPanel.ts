/** Pure helpers for the "Live map tiles" admin panel (T51). Tests: mapPanel.test.ts. */
import { formatDate } from './worldsPanel'
import type { RebuildRequest } from './mapRebuildApi'

export const MAP_MISSING_TEXT = 'Map rebuilds are not set up yet (migration 033)'

/** The vanilla map's Map= entry: the base layer, never an overlay. */
export const VANILLA_MAP_NAME = 'Muldraugh, KY'

/** Map= entries that are not places (helper mods). Same two the home page hides, compared lower-case and trimmed. */
const NOT_REAL_MAPS: ReadonlySet<string> = new Set(['lawnmower', 'vehicle spawn zones'])

export function isHelperMap(name: string): boolean {
  return NOT_REAL_MAPS.has(name.trim().toLowerCase())
}

/** The overlay id of a map: lower case, every run of other characters one hyphen, trimmed (the aurora package's mapId). */
export function mapSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9_]+/g, '-').replace(/^-+|-+$/g, '')
}

export interface TileOverlay {
  id: string
  mapName: string | null
}

export interface TilesInfo {
  overlays: TileOverlay[]
  renderedAt: string | null
}

/** What the panel reads from /map/tiles.json. A file with no `overlays` is a file with none. */
export function parseTilesInfo(raw: unknown): TilesInfo | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const overlays: TileOverlay[] = []
  if (Array.isArray(o.overlays)) {
    for (const v of o.overlays) {
      if (typeof v !== 'object' || v === null) continue
      const r = v as Record<string, unknown>
      if (typeof r.id !== 'string' || r.id === '') continue
      overlays.push({ id: r.id, mapName: typeof r.mapName === 'string' && r.mapName.trim() !== '' ? r.mapName : null })
    }
  }
  const src = typeof o.source === 'object' && o.source !== null ? (o.source as Record<string, unknown>) : null
  const renderedAt = src && typeof src.renderedAt === 'string' && src.renderedAt.trim() !== '' ? src.renderedAt : null
  return { overlays, renderedAt }
}

export type TileState = 'base' | 'present' | 'missing'

export interface MapRow {
  name: string
  state: TileState
}

export interface MapClassification {
  rows: MapRow[]
  /** Overlays the server no longer runs: hidden on the live map, tiles kept. */
  hidden: string[]
}

function overlayMatches(o: TileOverlay, name: string): boolean {
  if (o.mapName !== null && o.mapName.trim().toLowerCase() === name.trim().toLowerCase()) return true
  const slug = mapSlug(name)
  return slug !== '' && o.id === slug
}

/**
 * Each real map the server runs (helpers hidden, vanilla first, the rest in Map= order)
 * with whether tiles exist for it, and the overlays no server map matches. An overlay
 * matches by its `mapName` (case-insensitive) or, failing that, by its id being the
 * map's slug. Vanilla is "base": drawn from the base tiles, never an overlay.
 */
export function classifyMaps(serverMaps: string[], overlays: TileOverlay[]): MapClassification {
  const real = serverMaps.filter((m) => !isHelperMap(m))
  const vanilla = real.filter((m) => m.trim().toLowerCase() === VANILLA_MAP_NAME.toLowerCase())
  const others = real.filter((m) => m.trim().toLowerCase() !== VANILLA_MAP_NAME.toLowerCase())
  const rows: MapRow[] = [
    ...vanilla.map((name): MapRow => ({ name, state: 'base' })),
    ...others.map((name): MapRow => ({ name, state: overlays.some((o) => overlayMatches(o, name)) ? 'present' : 'missing' })),
  ]
  const hidden = overlays
    .filter((o) => !real.some((m) => overlayMatches(o, m)))
    .map((o) => o.mapName ?? o.id)
  return { rows, hidden }
}

export const TILE_STATE_TEXT: Readonly<Record<TileState, string>> = {
  base: 'base',
  present: 'present',
  missing: 'missing',
}

/** A queued request that nobody has claimed for this long means the render PC is not polling. */
export const WAITING_AFTER_MS = 2 * 60 * 1000

/** True for a queued request older than two minutes. A bad date is not "waiting". */
export function waitingForRenderPc(req: Pick<RebuildRequest, 'status' | 'requestedAt'>, now: number): boolean {
  if (req.status !== 'queued') return false
  const t = Date.parse(req.requestedAt)
  return !Number.isNaN(t) && now - t >= WAITING_AFTER_MS
}

/** The panel refreshes itself while a request is open. */
export function isOpen(req: Pick<RebuildRequest, 'status'> | null): boolean {
  return req !== null && (req.status === 'queued' || req.status === 'running')
}

/** "just now", "3 min ago", "2 h ago", "4 d ago"; the date itself for a bad or future value. */
export function ageText(iso: string | null, now: number): string {
  if (!iso) return 'never'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  const ms = now - t
  if (ms < 0) return formatDate(iso)
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 48) return `${h} h ago`
  return `${Math.floor(h / 24)} d ago`
}

export type RequestPhase = 'queued' | 'waiting' | 'running' | 'done' | 'failed' | 'cancelled'

export function requestPhase(req: RebuildRequest, now: number): RequestPhase {
  if (req.status === 'queued') return waitingForRenderPc(req, now) ? 'waiting' : 'queued'
  return req.status
}

/** The one-line summary of the latest request. */
export function requestLine(req: RebuildRequest, now: number): string {
  switch (requestPhase(req, now)) {
    case 'queued':
      return `Rebuild requested ${ageText(req.requestedAt, now)}. Waiting for the render PC to pick it up.`
    case 'waiting':
      return `Waiting for the render PC. The rebuild was requested ${formatDate(req.requestedAt)} and nothing has picked it up yet. It will start when that PC is on and online.`
    case 'running':
      return `Rebuilding now, started ${ageText(req.claimedAt, now)}. Last heartbeat ${ageText(req.heartbeatAt, now)}.`
    case 'done':
      return `Rebuilt and published ${formatDate(req.finishedAt)}${req.commitSha ? `, commit ${req.commitSha.slice(0, 7)}` : ''}.`
    case 'failed':
      return `The last rebuild failed ${formatDate(req.finishedAt)}.`
    case 'cancelled':
      return `The last rebuild request was cancelled ${formatDate(req.finishedAt)}.`
  }
}

/** The "Map tiles rendered" line; the file may not say. */
export function renderedLine(renderedAt: string | null): string {
  return renderedAt ? `Map tiles rendered ${formatDate(renderedAt)}` : 'Map tiles: render date unknown'
}
