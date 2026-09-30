import { describe, expect, it } from 'vitest'
import { LABEL_GAP, placeLabels, type LabelBox } from './labelPlacement'

const box = (key: string, x: number, y: number, w: number, mod: boolean, areaSquares = 1): LabelBox => ({
  key, x, y, w, h: 20, mod, areaSquares,
})

function rectsOverlap(a: LabelBox, pa: { dx: number; dy: number }, b: LabelBox, pb: { dx: number; dy: number }): boolean {
  const ax = a.x + pa.dx, ay = a.y + pa.dy, bx = b.x + pb.dx, by = b.y + pb.dy
  return Math.abs(ax - bx) < (a.w + b.w) / 2 && Math.abs(ay - by) < (a.h + b.h) / 2
}

describe('placeLabels (T45: vanilla names first, mod names step aside)', () => {
  it('never moves a vanilla label, even when two vanilla labels overlap', () => {
    const out = placeLabels([box('Muldraugh', 100, 100, 80, false), box('Nearby', 110, 100, 60, false)])
    expect(out.get('Muldraugh')).toEqual({ dx: 0, dy: 0 })
    expect(out.get('Nearby')).toEqual({ dx: 0, dy: 0 })
  })

  it('leaves a mod label alone when nothing is in the way', () => {
    const out = placeLabels([box('Muldraugh', 100, 100, 80, false), box('Raven Creek', 500, 500, 90, true)])
    expect(out.get('Raven Creek')).toEqual({ dx: 0, dy: 0 })
  })

  it('moves a mod label that would cover a vanilla one to its LEFT first (the owner\'s Raccoon City case)', () => {
    const muldraugh = box('Muldraugh', 1000, 500, 80, false)
    const raccoon = box('Raccoon City', 990, 500, 100, true)
    const p = placeLabels([muldraugh, raccoon]).get('Raccoon City')
    // Right edge of the moved label sits LABEL_GAP left of Muldraugh's left edge.
    expect(p).toEqual({ dx: Math.round(1000 - 40 - LABEL_GAP - 50 - 990), dy: 0 })
    expect(p!.dx).toBeLessThan(0)
  })

  it('goes to the right when the left is taken', () => {
    const labels = [box('Muldraugh', 1000, 500, 80, false), box('West', 900, 500, 80, false), box('Mod', 1000, 500, 60, true)]
    const p = placeLabels(labels).get('Mod')
    expect(p!.dx).toBeGreaterThan(0)
    expect(p!.dy).toBe(0)
  })

  it('leaves a mod label out when left, right, above and below are all taken', () => {
    const labels = [
      box('C', 1000, 500, 80, false), box('W', 916, 500, 80, false), box('E', 1084, 500, 80, false),
      box('N', 1000, 476, 80, false), box('S', 1000, 524, 80, false), box('Mod', 1000, 500, 80, true),
    ]
    expect(placeLabels(labels).get('Mod')).toBeNull()
  })

  it('places the bigger of two overlapping mod towns first; the smaller steps aside', () => {
    const out = placeLabels([box('Constown', 500, 300, 80, true, 1_179_648), box('New Hartburg', 530, 300, 100, true, 1_114_112)])
    expect(out.get('Constown')).toEqual({ dx: 0, dy: 0 })
    expect(out.get('New Hartburg')).not.toEqual({ dx: 0, dy: 0 })
  })

  it('no placed mod label overlaps any other placed label', () => {
    const labels = [
      box('Muldraugh', 1000, 500, 90, false), box('Raccoon City', 985, 500, 110, true, 786_432),
      box('Constown', 560, 440, 80, true, 1_179_648), box('New Hartburg', 600, 444, 110, true, 1_114_112),
      box('Rosewood', 820, 450, 80, false), box('HavenFall', 450, 350, 80, true, 1_048_576),
    ]
    const out = placeLabels(labels)
    const shown = labels.filter((l) => out.get(l.key))
    for (const a of shown) {
      if (!a.mod) continue
      for (const b of shown) {
        if (a === b) continue
        expect(rectsOverlap(a, out.get(a.key)!, b, out.get(b.key)!)).toBe(false)
      }
    }
  })
})
