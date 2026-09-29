// Leaflet layer builders. Each takes plain features (see transform.ts) and returns a layer
// the map component adds and removes. No data access happens here.
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.heat'
import type { ObjectFeature, PlayerFeature, RectFeature, StreetFeature, VehicleFeature, ZoneFeature } from './transform'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Players, clustered. A live position is a filled dot; a delayed, cell-rounded one is a
 * hollow dot with a dashed outline. The tooltip and the marker's accessible name also say
 * "approximate position, delayed", so the state never rests on colour or shape alone.
 * Characters linked to the signed-in account get a ring.
 */
export function buildPlayers(features: PlayerFeature[], own: ReadonlySet<string>): L.Layer {
  const group = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 40 })
  for (const f of features) {
    const cls = ['aurora-dot', f.delayed ? 'is-delayed' : 'is-live', own.has(f.username) ? 'is-own' : ''].join(' ').trim()
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({ className: 'aurora-marker', html: `<span class="${cls}"></span>`, iconSize: [18, 18] }),
      title: f.label,
      alt: f.label,
      keyboard: true,
    })
    marker.bindTooltip(escapeHtml(f.label), { direction: 'top', offset: [0, -8] })
    group.addLayer(marker)
  }
  return group
}

export function buildVehicles(features: VehicleFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const marker = L.marker(f.latlng, {
      icon: L.divIcon({ className: 'aurora-marker', html: '<span class="aurora-vehicle"></span>', iconSize: [14, 14] }),
      title: f.label,
      alt: f.label,
      keyboard: true,
    })
    marker.bindTooltip(escapeHtml(f.label), { direction: 'top', offset: [0, -6] })
    group.addLayer(marker)
  }
  return group
}

export function buildSafehouses(features: RectFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    L.rectangle(f.bounds, { color: '#e0a030', weight: 2, fillOpacity: 0.15, dashArray: '4 3' })
      .bindTooltip(escapeHtml(f.label), { sticky: true })
      .addTo(group)
  }
  return group
}

export function buildZones(features: ZoneFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const shape = f.point
      ? L.circleMarker(f.bounds[0], { radius: 5, color: '#5aa0ff', weight: 2, fillOpacity: 0.3 })
      : L.rectangle(f.bounds, { color: '#5aa0ff', weight: 1, fillOpacity: 0.1 })
    shape.bindTooltip(escapeHtml(f.label), { sticky: true }).addTo(group)
  }
  return group
}

export function buildHeat(points: [number, number, number][]): L.Layer {
  return L.heatLayer(points, { radius: 45, blur: 35, max: 1, minOpacity: 0.25 })
}

const STREET_STYLE = { color: '#9aa0a8', weight: 1, opacity: 0.55 }
const STREET_HOVER_STYLE = { color: '#ffffff', weight: 3, opacity: 1 }

/** Thin, low-contrast lines that brighten and go to front on hover; the tooltip carries the name. */
export function buildStreets(features: StreetFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    const line = L.polyline(f.latlngs, STREET_STYLE)
    line.bindTooltip(escapeHtml(f.name), { sticky: true })
    line.on('mouseover', () => {
      line.setStyle(STREET_HOVER_STYLE)
      line.bringToFront()
    })
    line.on('mouseout', () => line.setStyle(STREET_STYLE))
    group.addLayer(line)
  }
  return group
}

export function buildObjects(features: ObjectFeature[]): L.Layer {
  const group = L.layerGroup()
  for (const f of features) {
    L.circleMarker(f.latlng, { radius: 4, color: '#b070e0', weight: 2, fillOpacity: 0.6 })
      .bindTooltip(escapeHtml(`${f.label} (${f.kind})`), { sticky: true })
      .addTo(group)
  }
  return group
}
