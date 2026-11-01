import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { catchUpKind, onPageShown, pageHidden, type VisibilitySource } from './pageVisibility'

/** A document stand-in whose visibility the test flips. */
function fakeDoc(state: string) {
  const listeners = new Set<() => void>()
  const doc: VisibilitySource & { set: (s: string) => void; count: () => number } = {
    visibilityState: state,
    addEventListener: (_type, fn) => void listeners.add(fn),
    removeEventListener: (_type, fn) => void listeners.delete(fn),
    set: (s: string) => {
      doc.visibilityState = s
      for (const fn of [...listeners]) fn()
    },
    count: () => listeners.size,
  }
  return doc
}

describe('pageHidden', () => {
  it('is true only for a hidden tab', () => {
    expect(pageHidden(fakeDoc('hidden'))).toBe(true)
    expect(pageHidden(fakeDoc('visible'))).toBe(false)
    expect(pageHidden(fakeDoc('prerender'))).toBe(false)
  })

  it('counts a missing document as visible, so tests and server rendering still poll', () => {
    expect(pageHidden(undefined)).toBe(false)
    expect(pageHidden({})).toBe(false)
  })
})

describe('onPageShown', () => {
  it('fires when the tab comes back, not when it goes away, and stops after unsubscribe', () => {
    const doc = fakeDoc('visible')
    let shown = 0
    const off = onPageShown(() => shown++, doc)
    doc.set('hidden')
    expect(shown).toBe(0)
    doc.set('visible')
    expect(shown).toBe(1)
    off()
    expect(doc.count()).toBe(0)
    doc.set('hidden')
    doc.set('visible')
    expect(shown).toBe(1)
  })

  it('is a no-op without a document', () => {
    const off = onPageShown(() => {
      throw new Error('never')
    }, undefined)
    off()
  })
})

describe('catchUpKind', () => {
  it('skips a returning tab that polled within one interval', () => {
    expect(catchUpKind(0, 10_000, 60_000)).toBe('none')
    expect(catchUpKind(9_999, 10_000, 60_000)).toBe('none')
  })

  it('polls normally after one interval, and in full after the full interval', () => {
    expect(catchUpKind(10_000, 10_000, 60_000)).toBe('poll')
    expect(catchUpKind(59_999, 10_000, 60_000)).toBe('poll')
    expect(catchUpKind(60_000, 10_000, 60_000)).toBe('full')
    expect(catchUpKind(3_600_000, 10_000, 60_000)).toBe('full')
  })

  it('never asks for a full fetch when the data has no full interval', () => {
    expect(catchUpKind(3_600_000, 10_000, null)).toBe('poll')
  })
})

// The hooks cannot be rendered here (see useAuroraData.test.ts for why), so these check the
// source: each timer tick is gated on pageHidden() and each hook catches up on return.
const read = (f: string) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8')

describe('the polling hooks pause while the tab is hidden', () => {
  for (const file of ['./useDataset.ts', './useLiveDataset.ts']) {
    it(`${file}: the interval body sends nothing when pageHidden()`, () => {
      const src = read(file)
      const timer = src.match(/setInterval\(\(\) => \{[\s\S]*?\}, (intervalMs|liveMs)\)/)?.[0] ?? ''
      expect(timer).toMatch(/if \(!pageHidden\(\)\)/)
    })

    it(`${file}: a returning tab catches up through catchUpKind and the listener is removed on cleanup`, () => {
      const src = read(file)
      expect(src).toMatch(/const off = onPageShown\(/)
      expect(src).toMatch(/catchUpKind\(Date\.now\(\) - lastStart\.current/)
      expect(src).toMatch(/clearInterval\(id\)\s*off\(\)/)
      expect(src).toMatch(/lastStart\.current = Date\.now\(\)/)
    })
  }

  it('useLiveDataset: a long absence restarts the cadence with a full fetch', () => {
    const src = read('./useLiveDataset.ts')
    const shown = src.match(/onPageShown\(\(\) => \{[\s\S]*?\n {4}\}\)/)?.[0] ?? ''
    expect(shown).toMatch(/tick\.current = 0\s*void load\('full'\)/)
  })
})
