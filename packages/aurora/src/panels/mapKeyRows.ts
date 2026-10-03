// What the map key (T67) lists: one entry per layer, each with the symbols that layer
// draws and what they mean. Pure, no React and no Leaflet, so it is tested directly.
//
// Every swatch comes from layers/symbols.ts, the same code the layer builders draw with,
// so the key cannot drift from the map. Every label is worded from the code that decides
// the variant (layers/transform.ts, layers/build.ts, map/MapView.tsx), never from a picture.
//
// Visibility (VISIBILITY.md): a row is tagged with who may see that symbol. An admin-only
// symbol is never described to anyone else.
import type { LayerKey, LayerPrefs } from '../state/layerPrefs'
import { LAYER_KEYS } from '../state/layerPrefs'
import type { PathStyle } from '../layers/symbols'
import {
  DENSITY_GRADIENT,
  DENSITY_LAYER_OPACITY,
  HEAT_GRADIENT,
  OBJECT_STYLE,
  ROAD_STYLE,
  SAFEHOUSE_STYLE,
  STREET_COLOR,
  STREET_OPACITY,
  WORLD_FILL,
  ZONE_AREA_STYLE,
  ZONE_POINT_STYLE,
  deathIconHtml,
  npcGroupIconHtml,
  outpostStyle,
  playerIconHtml,
  vehicleIconHtml,
  watchedVehicleIconHtml,
} from '../layers/symbols'

export type KeySwatch =
  /** Marker HTML exactly as the layer builder puts in its divIcon. */
  | { kind: 'marker'; html: string }
  /** A Leaflet path style drawn as an area, a dot or a line. */
  | { kind: 'area'; style: PathStyle }
  | { kind: 'dot'; style: PathStyle & { radius: number } }
  | { kind: 'line'; style: PathStyle }
  | { kind: 'fill'; fillColor: string; fillOpacity: number }
  /** A colour ramp, low to high, at the layer's own opacity. */
  | { kind: 'ramp'; stops: readonly [number, string][]; opacity: number }
  /** Text drawn the way an area label is (aurora.css .aurora-area-label). */
  | { kind: 'label'; variant: 'town' | 'landmark' }

/** Who may see a symbol: everyone, only a viewer with a linked character, or only an admin. */
export type KeyAudience = 'all' | 'linked' | 'admin'

export interface KeyRow {
  id: string
  label: string
  swatch: KeySwatch
  audience: KeyAudience
}

export interface KeyEntry {
  layer: LayerKey
  rows: KeyRow[]
}

const row = (id: string, label: string, swatch: KeySwatch, audience: KeyAudience = 'all'): KeyRow => ({ id, label, swatch, audience })

/** One entry per layer. Typed as a full Record, and tested against LAYER_KEYS, so a new
 * layer without a key entry fails. */
export const MAP_KEY: Record<LayerKey, KeyRow[]> = {
  // buildStreets: a grey line, drawn from STREETS_MIN_ZOOM up; the tooltip is the street's name.
  streets: [row('street', 'Street (shown when zoomed in; hover or tap for its name)', { kind: 'line', style: { color: STREET_COLOR, weight: 3, opacity: STREET_OPACITY } })],
  // buildWorldMap: forest, water and buildings are fills; roads by type (extract-worldmap.ts RoadType).
  worldMap: [
    row('forest', 'Forest', { kind: 'fill', ...WORLD_FILL.forest }),
    row('water', 'Water', { kind: 'fill', ...WORLD_FILL.water }),
    row('building', 'Building', { kind: 'fill', ...WORLD_FILL.buildings }),
    row('road-primary', 'Main road', { kind: 'line', style: ROAD_STYLE.primary }),
    row('road-secondary', 'Secondary road', { kind: 'line', style: ROAD_STYLE.secondary }),
    row('road-tertiary', 'Minor road', { kind: 'line', style: ROAD_STYLE.tertiary }),
    row('road-trail', 'Trail', { kind: 'line', style: ROAD_STYLE.trail }),
    row('road-railway', 'Railway', { kind: 'line', style: ROAD_STYLE.railway }),
  ],
  // buildAreas: towns always; landmarks only from landmarkMinZoom (STREETS_MIN_ZOOM) up.
  areas: [
    row('town', 'Town name', { kind: 'label', variant: 'town' }),
    row('landmark', 'Landmark name (shown when zoomed in)', { kind: 'label', variant: 'landmark' }),
  ],
  // buildPlayers + playerFeatures: online, living characters only; the name sits beside the dot.
  // is_delayed adds "approximate position, delayed"; `own` (a linked character) adds the ring.
  players: [
    row('player-live', 'Player online, live position (name beside it)', { kind: 'marker', html: playerIconHtml({ delayed: false, own: false }) }),
    row('player-delayed', 'Player online, approximate position, delayed (hollow, dashed)', { kind: 'marker', html: playerIconHtml({ delayed: true, own: false }) }),
    row('player-own', 'Your own linked character (ringed)', { kind: 'marker', html: playerIconHtml({ delayed: false, own: true }) }, 'linked'),
  ],
  // buildVehicles + vehicleFeatures: label is the car's name; claimed adds "claimed by <owner>";
  // from_ledger adds "last seen here" (not loaded now, at the claim ledger's position).
  vehicles: [
    row('vehicle', 'Vehicle (hover or tap for its type)', { kind: 'marker', html: vehicleIconHtml({ claimed: false, ledger: false }) }),
    row('vehicle-claimed', "Claimed vehicle (ring and lock; hover or tap for the owner)", { kind: 'marker', html: vehicleIconHtml({ claimed: true, ledger: false }) }),
    row('vehicle-ledger', 'Claimed vehicle not loaded now, at its last-seen spot (dashed ring, dimmed)', { kind: 'marker', html: vehicleIconHtml({ claimed: true, ledger: true }) }),
  ],
  // buildSafehouses + safehouseFeatures: the title (or "Safehouse") and "owner <name>".
  safehouses: [row('safehouse', 'Safehouse (dashed outline; hover or tap for its name and owner)', { kind: 'area', style: SAFEHOUSE_STYLE })],
  // buildNpcGroups + npcGroupFeatures: "<faction> - <n> members - <stance>"; inactive adds
  // "not near any player"; a sensitive row (admin RPC only) adds "admin only".
  npcGroups: [
    row('npc', 'NPC group (number = members; hover or tap for faction and stance)', { kind: 'marker', html: npcGroupIconHtml({ size: 4, stance: 'neutral', active: true, adminOnly: false }) }),
    row('npc-hostile', 'Hostile NPC group (! badge, heavier outline)', { kind: 'marker', html: npcGroupIconHtml({ size: 4, stance: 'hostile', active: true, adminOnly: false }) }),
    row('npc-dormant', 'NPC group not near any player (muted, dashed)', { kind: 'marker', html: npcGroupIconHtml({ size: 4, stance: 'neutral', active: false, adminOnly: false }) }),
    row('npc-admin', 'NPC group hidden from the public map (dotted ring; admins only)', { kind: 'marker', html: npcGroupIconHtml({ size: 4, stance: 'neutral', active: true, adminOnly: true }) }, 'admin'),
  ],
  // buildNpcOutposts + npcOutpostFeatures: "<faction> outpost", "hostile to players".
  npcOutposts: [
    row('outpost', 'NPC outpost, the area a faction holds (hover or tap for the faction)', { kind: 'area', style: outpostStyle(false) }),
    row('outpost-hostile', 'NPC outpost hostile to players (heavier, longer dashes)', { kind: 'area', style: outpostStyle(true) }),
  ],
  // buildDeaths + deathFeatures/latestDeaths: one cross per player at their latest death, "<name> died here".
  deaths: [row('death', 'Where a player last died (one per player; hover or tap for who and when)', { kind: 'marker', html: deathIconHtml() })],
  // buildZones + zoneFeatures: "<title> (<kind>)"; a zone with no second corner is a point.
  zones: [
    row('zone', 'Zone (hover or tap for its name and kind)', { kind: 'area', style: ZONE_AREA_STYLE }),
    row('zone-point', 'Zone that is a single point', { kind: 'dot', style: ZONE_POINT_STYLE }),
  ],
  // buildHeat + heatPoints: per-cell live counts from the last 3 minutes, scaled by the busiest cell.
  zombieHeat: [row('heat', 'Zombies now, last 3 minutes: blue fewer, red most (compared with the busiest cell)', { kind: 'ramp', stops: HEAT_GRADIENT, opacity: 1 })],
  // buildZombieDensityLayer: pre-rendered spawn-density tiles (pzmap2dzi get_color).
  zombieDensity: [row('density', 'Zombie spawn density from the map files, not live: blue low, green medium, red high', { kind: 'ramp', stops: DENSITY_GRADIENT, opacity: DENSITY_LAYER_OPACITY })],
  // buildObjects + objectFeatures: "<label> (<kind>)".
  mapObjects: [row('object', 'Map object (hover or tap for its name and kind)', { kind: 'dot', style: OBJECT_STYLE })],
}

/**
 * T72: the watched-car symbol (buildWatchedVehicles). Not in MAP_KEY: the watched layer is not a
 * LayerKey (it has no toggle; it exists while a signed-in account watches at least one car), so it
 * is listed on its own, only to that viewer (KeyViewer.watching).
 */
export const WATCHED_KEY_ROW: KeyRow = row('vehicle-watched', 'Car you are watching for (magenta, pulsing ring)', { kind: 'marker', html: watchedVehicleIconHtml() })

export interface KeyViewer {
  isAdmin: boolean
  /** True when the signed-in viewer has a linked character (the `own` set is not empty). */
  hasLinked: boolean
  /** T72: true when the signed-in viewer watches at least one car. */
  watching?: boolean
}

function canSee(audience: KeyAudience, viewer: KeyViewer): boolean {
  if (audience === 'admin') return viewer.isAdmin
  if (audience === 'linked') return viewer.hasLinked
  return true
}

/** The key as this viewer sees it: layers that are ON, in the toggle order, each with only
 * the rows the viewer may see. Layers that are off are not listed. */
export function visibleKey(prefs: LayerPrefs, viewer: KeyViewer, key: Record<LayerKey, KeyRow[]> = MAP_KEY): KeyEntry[] {
  const out: KeyEntry[] = []
  for (const layer of LAYER_KEYS) {
    if (!prefs[layer]) continue
    const rows = (key[layer] ?? []).filter((r) => canSee(r.audience, viewer))
    if (rows.length > 0) out.push({ layer, rows })
  }
  return out
}
