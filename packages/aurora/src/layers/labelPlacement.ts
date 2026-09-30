// Where each area label is drawn (T45). Owner, 2026-09-30: "Let's prioritize vanilla
// names. If we can offset the overlap to the side like moving Raccoon City label to the
// left that would be awesome."
//
// Vanilla labels are placed first, exactly at their point, and never move: the map reads
// the way it always has. A map-mod town label (areas.json `mod: true`) that would cover a
// label already placed moves beside it: to its left first, then right, above, below. A
// label with no free spot of those four is left out rather than drawn over another. Mod
// labels are placed biggest town first, so the bigger of two neighbouring mods keeps its
// spot. Pure: all sizes and positions are passed in, so it runs without a browser.

export interface LabelBox {
  key: string
  /** Label centre in map pixels at the current zoom. */
  x: number
  y: number
  /** Rendered width and height in pixels. */
  w: number
  h: number
  /** From a map mod (scripts/tiles/mod-maps/server-towns.json), not the vanilla game. */
  mod: boolean
  /** Bigger places are placed first among mod labels. */
  areaSquares: number
}

/** Pixel offset from the label's own point; null means the label is left out. */
export type Placement = { dx: number; dy: number } | null

/** Clear space kept between a moved label and the one it steps around. */
export const LABEL_GAP = 4

interface Rect {
  l: number
  t: number
  r: number
  b: number
}

function rectAt(x: number, y: number, w: number, h: number): Rect {
  return { l: x - w / 2, t: y - h / 2, r: x + w / 2, b: y + h / 2 }
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
}

export function placeLabels(labels: LabelBox[]): Map<string, Placement> {
  const out = new Map<string, Placement>()
  const placed: Rect[] = []

  for (const label of labels) {
    if (label.mod) continue
    out.set(label.key, { dx: 0, dy: 0 })
    placed.push(rectAt(label.x, label.y, label.w, label.h))
  }

  const mods = labels
    .filter((label) => label.mod)
    .sort((a, b) => b.areaSquares - a.areaSquares || a.key.localeCompare(b.key))

  for (const label of mods) {
    const here = rectAt(label.x, label.y, label.w, label.h)
    const blockers = placed.filter((p) => overlaps(here, p))
    if (blockers.length === 0) {
      out.set(label.key, { dx: 0, dy: 0 })
      placed.push(here)
      continue
    }

    let chosen: Placement = null
    for (const blocker of blockers) {
      const candidates: [number, number][] = [
        [blocker.l - LABEL_GAP - label.w / 2, label.y],
        [blocker.r + LABEL_GAP + label.w / 2, label.y],
        [label.x, blocker.t - LABEL_GAP - label.h / 2],
        [label.x, blocker.b + LABEL_GAP + label.h / 2],
      ]
      for (const [cx, cy] of candidates) {
        const spot = rectAt(cx, cy, label.w, label.h)
        if (placed.some((p) => overlaps(spot, p))) continue
        chosen = { dx: Math.round(cx - label.x), dy: Math.round(cy - label.y) }
        placed.push(spot)
        break
      }
      if (chosen) break
    }
    out.set(label.key, chosen)
  }

  return out
}
