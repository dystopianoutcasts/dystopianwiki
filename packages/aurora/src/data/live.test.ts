import { describe, expect, it } from 'vitest'
import { INGEST_INTERVAL_MS, LIVE_POLL_MS } from '../config'
import { mergeByKey, newestT, tickKind } from './live'

interface Pos {
  username: string
  x: number
  t: string | null
}
const key = (p: Pos) => p.username
const tOf = (p: Pos) => p.t

describe('T23 poll intervals', () => {
  it('live datasets poll every 10 s and the full self-heal is a whole multiple of it', () => {
    expect(LIVE_POLL_MS).toBe(10_000)
    expect(INGEST_INTERVAL_MS % LIVE_POLL_MS).toBe(0)
  })
})

describe('newestT', () => {
  it('picks the newest timestamp by time, not by string order', () => {
    const rows: Pos[] = [
      // Lexically '10Z' sorts after '10.5Z' ('Z' > '.'), but 10.5 s is the later time.
      { username: 'a', x: 1, t: '2026-09-29T05:00:10.5Z' },
      { username: 'b', x: 2, t: '2026-09-29T05:00:10Z' },
      { username: 'c', x: 3, t: '2026-09-29T04:59:59.999Z' },
    ]
    expect(newestT(rows, tOf)).toBe('2026-09-29T05:00:10.5Z')
  })

  it('ignores missing and unparseable timestamps, and is null for nothing', () => {
    expect(newestT([{ username: 'a', x: 1, t: null }, { username: 'b', x: 1, t: 'nope' }], tOf)).toBeNull()
    expect(newestT([], tOf)).toBeNull()
  })
})

describe('mergeByKey', () => {
  const held: Pos[] = [
    { username: 'a', x: 1, t: '2026-09-29T05:00:00Z' },
    { username: 'b', x: 2, t: '2026-09-29T05:00:00Z' },
  ]

  it('replaces the held row for a key the delta carries and keeps the others', () => {
    const out = mergeByKey(held, [{ username: 'a', x: 9, t: '2026-09-29T05:00:10Z' }], key)
    expect(out).toEqual([
      { username: 'a', x: 9, t: '2026-09-29T05:00:10Z' },
      { username: 'b', x: 2, t: '2026-09-29T05:00:00Z' },
    ])
  })

  it('appends a key it has not seen', () => {
    const out = mergeByKey(held, [{ username: 'c', x: 3, t: '2026-09-29T05:00:10Z' }], key)
    expect(out.map(key)).toEqual(['a', 'b', 'c'])
  })

  it('returns the same array for an empty delta, so an idle poll re-renders nothing', () => {
    expect(mergeByKey(held, [], key)).toBe(held)
  })
})

describe('tickKind', () => {
  const fullEvery = INGEST_INTERVAL_MS / LIVE_POLL_MS // 6

  it('load and every sixth tick are full fetches, the rest are deltas', () => {
    const kinds = Array.from({ length: 13 }, (_, i) => tickKind(i, fullEvery, '2026-09-29T05:00:00Z'))
    expect(kinds).toEqual([
      'full', 'delta', 'delta', 'delta', 'delta', 'delta',
      'full', 'delta', 'delta', 'delta', 'delta', 'delta',
      'full',
    ])
  })

  it('is a full fetch whenever nothing is held yet', () => {
    expect(tickKind(3, fullEvery, null)).toBe('full')
  })
})

describe('a minute of polling against a moving player', () => {
  it('delta polls ask only for rows after the newest held, and the merge tracks the player', () => {
    // A fake table: the player moves every 5 s; each poll returns rows with t > since.
    const table: Pos[] = []
    const asked: (string | null)[] = []
    let held: Pos[] = []
    for (let tick = 0; tick < 6; tick++) {
      const at = Date.parse('2026-09-29T05:00:00Z') + tick * LIVE_POLL_MS
      table.push({ username: 'admin', x: tick * 2, t: new Date(at - 5_000).toISOString() })
      table.push({ username: 'admin', x: tick * 2 + 1, t: new Date(at).toISOString() })
      const latestPerKey = [...new Map(table.map((r) => [r.username, r])).values()] // what the view returns
      const since = newestT(held, tOf)
      const kind = tickKind(tick, 6, since)
      asked.push(kind === 'delta' ? since : null)
      const rows = kind === 'full' ? latestPerKey : latestPerKey.filter((r) => Date.parse(r.t as string) > Date.parse(since as string))
      held = kind === 'full' ? rows : mergeByKey(held, rows, key)
      expect(held).toEqual([table.at(-1)])
    }
    expect(asked[0]).toBeNull()
    expect(asked.slice(1).every((s) => s !== null)).toBe(true)
  })
})
