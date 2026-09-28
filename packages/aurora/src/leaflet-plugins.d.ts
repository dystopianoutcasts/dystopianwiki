// leaflet.heat ships no types. It adds L.heatLayer at import time.
declare module 'leaflet.heat'

import 'leaflet'

declare module 'leaflet' {
  interface HeatLayerOptions {
    minOpacity?: number
    maxZoom?: number
    max?: number
    radius?: number
    blur?: number
    gradient?: Record<number, string>
  }
  function heatLayer(latlngs: Array<[number, number, number?]>, options?: HeatLayerOptions): Layer
}
