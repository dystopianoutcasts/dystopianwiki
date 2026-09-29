import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchHealthAfter, fetchPlayerProfiles, fetchPositions, fetchSafehouses, fetchVehicles, fetchVehiclesPublic } from './queries'

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

describe('T34: the map asks only for the columns it draws', () => {
  it('fetchSafehouses no longer selects the member list', () => {
    const { db, calls } = fakeDb()
    void fetchSafehouses(db, 's')
    const select = calls.find((c) => c.startsWith('select('))
    expect(select).toBeDefined()
    expect(select).not.toMatch(/players/)
  })

  it('fetchPlayerProfiles no longer selects access_level', () => {
    const { db, calls } = fakeDb()
    void fetchPlayerProfiles(db, 's')
    const select = calls.find((c) => c.startsWith('select('))
    expect(select).toBeDefined()
    expect(select).not.toMatch(/access_level/)
  })

  it('fetchVehiclesPublic reads vehicles_visible and selects no driver column', async () => {
    const { db, calls } = fakeDb()
    await fetchVehiclesPublic(db, 's')
    expect(calls).toContain('from("vehicles_visible")')
    const select = calls.find((c) => c.startsWith('select('))
    expect(select).toBeDefined()
    expect(select).not.toMatch(/driver_username/)
  })

  it('fetchVehiclesPublic fills driver_username with null so the row shape matches fetchVehicles', async () => {
    const builder: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'gt']) {
      builder[m] = () => builder
    }
    builder.then = (resolve: (v: unknown) => void) =>
      resolve({ data: [{ server_id: 's', vehicle_id: 1, script_name: 'Base.CarTaxi', x: 1, y: 2, z: 0, t: null }], error: null })
    const db = { from: () => builder } as unknown as SupabaseClient
    const [v] = await fetchVehiclesPublic(db, 's')
    expect(v.driver_username).toBeNull()
  })
})
