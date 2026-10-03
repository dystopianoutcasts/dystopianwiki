// T50: the live map follows the server's Map= list. Pure functions only (no Leaflet, no
// React), so they are tested directly; MapPage and MapView wire them up.
//
// The server list comes from aurora.server_maps (migration 033), in Map= order. `null`
// means "unknown" (the function is missing on a pre-033 database, or the server has no
// config yet): then nothing is filtered and the map behaves exactly as before T50.
import type { TileOverlay } from './tiles'
import { isHelperMap, mapId, VANILLA_MAP_ID } from './mapId'

/** The map ids the server runs, plus vanilla (always drawn), or null when unknown. An
 *  empty list is treated as unknown too: a running server always lists at least one map,
 *  so an empty list means the config has not been read, not "draw nothing". */
export function allowedMapIds(list: readonly string[] | null): Set<string> | null {
  if (list === null || list.length === 0) return null
  const out = new Set<string>([VANILLA_MAP_ID])
  for (const name of list) {
    const id = mapId(name)
    if (id) out.add(id)
  }
  return out
}

/** The id an overlay is matched by: its map folder name when tiles.json carries one (T50),
 *  else its own id (an older tiles.json, whose ids are already the slug). */
export function overlayMapId(overlay: TileOverlay): string {
  return mapId(overlay.mapName ?? overlay.id)
}

/** The overlays to draw, in tiles.json order (which is Map= order, first on top). */
export function overlaysToDraw(overlays: readonly TileOverlay[], allowed: Set<string> | null): TileOverlay[] {
  if (allowed === null) return [...overlays]
  return overlays.filter((o) => allowed.has(overlayMapId(o)))
}

/** Any feature of the merged data files: `m` is the slug of the map that owns it,
 *  absent for vanilla (scripts/tiles/extract-*.ts). */
export interface MapTagged {
  m?: string
}

function keep<T extends MapTagged>(list: readonly T[], allowed: Set<string>): T[] {
  return list.filter((f) => f.m === undefined || allowed.has(f.m))
}

/**
 * Drop every street, area and world-map shape whose map the server does not run, before
 * any layer is built (so a dropped street is not searchable either). Untagged features are
 * vanilla and always kept. With the list unknown (null) nothing is dropped. Fields other
 * than the four world-map lists are passed through untouched.
 */
export function filterByServerMaps<
  S extends MapTagged,
  A extends MapTagged,
  W extends { roads: MapTagged[]; buildings: MapTagged[]; water: MapTagged[]; forest: MapTagged[] },
>(data: { streets: S[]; areas: A[]; worldMap: W }, allowed: Set<string> | null): { streets: S[]; areas: A[]; worldMap: W } {
  if (allowed === null) return data
  const w = data.worldMap
  return {
    streets: keep(data.streets, allowed),
    areas: keep(data.areas, allowed),
    worldMap: {
      ...w,
      roads: keep(w.roads, allowed),
      buildings: keep(w.buildings, allowed),
      water: keep(w.water, allowed),
      forest: keep(w.forest, allowed),
    },
  }
}

/**
 * The `Map=` entries the live map has no tiles for: not vanilla (the base layer), not a
 * helper (Lawnmower, Vehicle Spawn Zones), and no overlay whose map id matches. In Map=
 * order, each name once, exactly as the server lists it. Unknown list: none.
 */
export function mapsWithoutTiles(list: readonly string[] | null, overlays: readonly TileOverlay[]): string[] {
  if (list === null) return []
  const have = new Set(overlays.map(overlayMapId))
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of list) {
    const name = raw.trim()
    const id = mapId(name)
    if (!id || id === VANILLA_MAP_ID || isHelperMap(name) || have.has(id) || seen.has(id)) continue
    seen.add(id)
    out.push(name)
  }
  return out
}

/**
 * How to go from the overlay layers on the map to the ones that should be there, keeping
 * the first in Map= order on top. Overlays share one tile pane, where a later-added layer
 * paints over an earlier one, so layers are added bottom first: the LAST Map= entry first.
 * `current` and `next` are overlay ids in Map= order. Returns the ids to remove, and the
 * ids to add in the order to add them. A layer that stays is left alone when nothing has
 * to go beneath it; otherwise it is removed and re-added so the order stays right.
 */
export function reconcileOverlays(current: readonly string[], next: readonly string[]): { remove: string[]; add: string[] } {
  const nextSet = new Set(next)
  const kept = current.filter((id) => nextSet.has(id))
  // Bottom-to-top order of what is kept and of what is wanted.
  const keptUp = [...kept].reverse()
  const nextUp = [...next].reverse()
  // Layers already on the map at the bottom, in the right order, can stay where they are;
  // everything above the first difference is taken off and put back in order.
  let stay = 0
  while (stay < keptUp.length && keptUp[stay] === nextUp[stay]) stay++
  const staying = new Set(keptUp.slice(0, stay))
  const remove = current.filter((id) => !staying.has(id))
  const add = nextUp.filter((id) => !staying.has(id))
  return { remove, add }
}
