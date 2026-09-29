import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchHealthAfter, fetchPlayerProfiles, fetchPositions, fetchVehicles } from './queries'

/** Records every builder call; resolves to an empty result like PostgREST would. */
function fakeDb() {
  const calls: string[] = []
  const builder: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'gt', 'gte', 'order', 'limit']) {
    builder[m] = (...args: unknown[]) => {
      calls.push(`${m}(${args.map((a) => JSON.stringify(a)).join(',')})`)
      return builder
    }
  }
  builder.then = (resolve: (v: unknown) => void) => resolve({ data: [], error: null })
  const db = {
    from: (table: string) => {
      calls.push(`from(${JSON.stringify(table)})`)
      return builder
    },
  } as unknown as SupabaseClient
  return { db, calls }
}

const SINCE = '2026-09-29T05:00:10.123+00:00'

describe('T23 delta queries ask only for rows strictly newer than since', () => {
  it('positions filter on t', async () => {
    const { db, calls } = fakeDb()
    await fetchPositions(db, 's', SINCE)
    expect(calls).toContain(`gt("t","${SINCE}")`)
  })

  it('vehicles filter on t', async () => {
    const { db, calls } = fakeDb()
    await fetchVehicles(db, 's', SINCE)
    expect(calls).toContain(`gt("t","${SINCE}")`)
  })

  it('the roster filters on last_seen', async () => {
    const { db, calls } = fakeDb()
    await fetchPlayerProfiles(db, 's', SINCE)
    expect(calls).toContain(`gt("last_seen","${SINCE}")`)
  })

  it('health appends after the newest sample, oldest first', async () => {
    const { db, calls } = fakeDb()
    await fetchHealthAfter(db, 's', SINCE)
    expect(calls).toContain(`gt("t","${SINCE}")`)
    expect(calls).toContain('order("t",{"ascending":true})')
  })

  it('without since, the full fetch carries no time filter at all', async () => {
    for (const f of [fetchPositions, fetchVehicles, fetchPlayerProfiles]) {
      const { db, calls } = fakeDb()
      await f(db, 's')
      expect(calls.some((c) => c.startsWith('gt(') || c.startsWith('gte('))).toBe(false)
    }
  })
})
