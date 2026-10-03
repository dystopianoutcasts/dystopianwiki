// The look of every map symbol, in one place and without Leaflet, so the layer builders
// (build.ts) and the map key (panels/MapKey.tsx) draw from the same source and the key
// cannot drift from the map (T67). Marker HTML and path styles only; no data, no Leaflet.

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** A player dot: filled when live, hollow and dashed when delayed and rounded, ringed when
 * the character is linked to the signed-in account. */
export function playerIconHtml(f: { delayed: boolean; own: boolean }): string {
  const cls = ['aurora-dot', f.delayed ? 'is-delayed' : 'is-live', f.own ? 'is-own' : ''].join(' ').trim()
  return `<span class="${cls}"></span>`
}

/** The lock on a claimed car: a shackle over a body, so "claimed" is a shape, not a colour.
 * Decorative (`aria-hidden`); the marker's own `title`/`alt` carries "claimed by ...". */
export const LOCK_SVG =
  '<svg class="car-lock" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false">' +
  '<path d="M3.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
  '<rect x="2" y="5.5" width="8" height="5.5" rx="1" fill="currentColor"/></svg>'

/** The car glyph: a top-down car (hood up; there is no heading data), amber with a dark outline
 * so it reads on any terrain. Decorative (`aria-hidden`); the marker's `title`/`alt` is the name. */
export const CAR_SVG =
  '<svg class="car-glyph" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">' +
  '<g fill="#1b1300"><rect x="1" y="3" width="3" height="4" rx="1"/><rect x="12" y="3" width="3" height="4" rx="1"/><rect x="1" y="10" width="3" height="4" rx="1"/><rect x="12" y="10" width="3" height="4" rx="1"/></g>' +
  '<rect x="3.5" y="0.8" width="9" height="14.4" rx="3.4" fill="#f0b050" stroke="#1b1300" stroke-width="1.3"/>' +
  '<rect x="5" y="4.2" width="6" height="2.8" rx="0.7" fill="#1b1300"/><rect x="5" y="10.2" width="6" height="2" rx="0.6" fill="#1b1300"/></svg>'

/** Every car is the glyph. A claimed car adds a bright ring (one colour for every owner) and the
 * lock badge; a ledger-only claimed car (not loaded, at its last-known spot) has the ring dashed
 * and dimmed, so that state is not opacity alone either. */
export function vehicleIconHtml(f: { claimed: boolean; ledger: boolean }): string {
  const cls = ['aurora-vehicle', f.claimed ? 'is-claimed' : '', f.ledger ? 'is-ledger' : ''].join(' ').trim()
  return `<span class="${cls}">${CAR_SVG}${f.claimed ? LOCK_SVG : ''}</span>`
}

export function vehicleIconSize(claimed: boolean): number {
  return claimed ? 26 : 16
}

/** The death marker: a cross (players are dots, vehicles cars, NPC groups diamonds). A dark halo
 * under a light stroke keeps it readable on any terrain; decorative (`aria-hidden`), the marker's own
 * `title`/`alt` carries the label. */
export const DEATH_SVG =
  '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">' +
  '<path class="death-halo" d="M4 4L16 16M16 4L4 16"/>' +
  '<path class="death-edge" d="M4 4L16 16M16 4L4 16"/></svg>'

export function deathIconHtml(): string {
  return `<span class="aurora-death">${DEATH_SVG}</span>`
}

/** The group marker: a diamond with the size inside. Two stacked outlines, a dark halo under a
 * light line, keep the edge readable on any terrain. Decorative (`aria-hidden`). */
function npcGroupSvg(size: number): string {
  const text = size > 99 ? '99+' : String(size)
  return (
    '<svg viewBox="0 0 30 30" width="30" height="30" aria-hidden="true" focusable="false">' +
    '<polygon class="npc-halo" points="15,2 28,15 15,28 2,15"/>' +
    '<polygon class="npc-edge" points="15,2 28,15 15,28 2,15"/>' +
    `<text class="npc-size" x="15" y="19" text-anchor="middle">${escapeHtml(text)}</text></svg>`
  )
}

/** Hostile: a heavier outline and a "!" badge. Dormant: muted and dashed. Admin-only: a dotted
 * outer ring. None of them rests on colour. */
export function npcGroupIconHtml(f: { size: number; stance: string | null; active: boolean; adminOnly: boolean }): string {
  const cls = ['aurora-npc', f.stance ? `is-${f.stance}` : '', f.active ? '' : 'is-dormant', f.adminOnly ? 'is-admin-only' : ''].filter(Boolean).join(' ')
  const bang = f.stance === 'hostile' ? '<span class="npc-bang" aria-hidden="true">!</span>' : ''
  return `<span class="${cls}">${npcGroupSvg(f.size)}${bang}</span>`
}

/** The subset of Leaflet's PathOptions these layers use, typed here so this file needs no Leaflet. */
export interface PathStyle {
  color: string
  weight: number
  fillOpacity?: number
  dashArray?: string
  opacity?: number
  fill?: boolean
  stroke?: boolean
  fillColor?: string
}

export const SAFEHOUSE_STYLE: PathStyle = { color: '#e0a030', weight: 2, fillOpacity: 0.15, dashArray: '4 3' }

/** Outposts are areas like safehouses: dashed and outlined, heavier when hostile. */
export function outpostStyle(hostile: boolean): PathStyle {
  return { color: '#d94fb0', weight: hostile ? 4 : 2, fillOpacity: 0.1, dashArray: hostile ? '10 5' : '4 6' }
}

export const ZONE_AREA_STYLE: PathStyle = { color: '#5aa0ff', weight: 1, fillOpacity: 0.1 }
export const ZONE_POINT_STYLE: PathStyle & { radius: number } = { radius: 5, color: '#5aa0ff', weight: 2, fillOpacity: 0.3 }
export const OBJECT_STYLE: PathStyle & { radius: number } = { radius: 4, color: '#b070e0', weight: 2, fillOpacity: 0.6 }

export const STREET_COLOR = '#9aa0a8'
export const STREET_OPACITY = 0.55

export type RoadType = 'primary' | 'secondary' | 'tertiary' | 'trail' | 'railway'
export const ROAD_STYLE: Record<RoadType, PathStyle> = {
  primary: { color: '#e8a33d', weight: 3 },
  secondary: { color: '#d9c98a', weight: 2 },
  tertiary: { color: '#c9c9c9', weight: 1.5 },
  trail: { color: '#8b6b4a', weight: 1, dashArray: '3 3' },
  railway: { color: '#333333', weight: 1.5, dashArray: '1 4' },
}

/** The world map's filled shapes (one canvas, no outline). */
export const WORLD_FILL = {
  forest: { fillColor: '#2f4a2f', fillOpacity: 0.55 },
  water: { fillColor: '#2f5d7c', fillOpacity: 0.6 },
  buildings: { fillColor: '#4a4640', fillOpacity: 0.7 },
} as const

/** "Zombies now" uses leaflet.heat's own default gradient (buildHeat passes none):
 * node_modules/leaflet.heat/dist/leaflet-heat.js, defaultGradient {.4 blue, .6 cyan, .7 lime, .8 yellow, 1 red}. */
export const HEAT_GRADIENT: readonly [number, string][] = [
  [0.4, 'blue'],
  [0.6, 'cyan'],
  [0.7, 'lime'],
  [0.8, 'yellow'],
  [1, 'red'],
]

/** The spawn-density tiles are pre-rendered by pzmap2dzi (render_impl/zombie.py get_color):
 * 0 is blue (0,0,255), 128 green (0,255,0), 255 red (254,1,0), drawn at half alpha, and the
 * layer itself at 0.6 opacity (buildZombieDensityLayer). */
export const DENSITY_GRADIENT: readonly [number, string][] = [
  [0, '#0000ff'],
  [0.5, '#00ff00'],
  [1, '#fe0100'],
]
export const DENSITY_LAYER_OPACITY = 0.6
