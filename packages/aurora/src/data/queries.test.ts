import { beforeEach, describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchHealthAfter, fetchPlayerProfiles, fetchPositions, fetchSafehouses, fetchVehicles, fetchVehiclesPublic, resetVehicleAdminProbe, resetVehicleClaimProbe, fetchVehiclesAdmin } from './queries'

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

describe('claimed-car columns (migration 028) and the fallback while it is not live', () => {
  beforeEach(() => resetVehicleClaimProbe())

  /** A db whose vehicles_visible lacks the claim columns: any select naming them fails like PostgREST. */
  function dbWithout028(extra: { code?: string } = { code: '42703' }) {
    const selects: string[] = []
    const db = {
      from: () => {
        const b: Record<string, unknown> = {}
        b.select = (cols: string) => {
          selects.push(cols)
          return b
        }
        b.eq = () => b
        b.gt = () => b
        b.then = (resolve: (v: unknown) => void) =>
          resolve(
            selects[selects.length - 1].includes('claimed_by')
              ? { data: null, error: { message: 'column vehicles_visible.claimed_by does not exist', ...extra } }
              : { data: [{ server_id: 's', vehicle_id: 1, script_name: 'Base.CarTaxi', x: 1, y: 2, z: 0, t: null }], error: null },
          )
        return b
      },
    } as unknown as SupabaseClient
    return { db, selects }
  }

  it('asks for the three claim columns first', async () => {
    const { db, calls } = fakeDb()
    await fetchVehiclesPublic(db, 's')
    expect(calls.find((c) => c.startsWith('select('))).toMatch(/claimed_by,sql_id,from_ledger/)
  })

  it('retries once with the seven old columns on 42703 and defaults the new fields', async () => {
    const { db, selects } = dbWithout028()
    const [v] = await fetchVehiclesPublic(db, 's')
    expect(selects).toHaveLength(2)
    expect(selects[1]).toBe('server_id,vehicle_id,script_name,x,y,z,t')
    expect(v.claimed_by).toBeNull()
    expect(v.sql_id).toBeNull()
    expect(v.from_ledger).toBe(false)
  })

  it('recognises a missing column by its message when there is no code, and remembers the decision', async () => {
    const { db, selects } = dbWithout028({})
    await fetchVehiclesPublic(db, 's')
    await fetchVehiclesPublic(db, 's')
    // First call: extended then old. Second call: old only.
    expect(selects).toHaveLength(3)
    expect(selects[2]).not.toMatch(/claimed_by/)
  })

  it('does not swallow other errors', async () => {
    const db = {
      from: () => {
        const b: Record<string, unknown> = { select: () => b, eq: () => b, gt: () => b }
        b.then = (resolve: (v: unknown) => void) => resolve({ data: null, error: { message: 'permission denied', code: '42501' } })
        return b
      },
    } as unknown as SupabaseClient
    await expect(fetchVehiclesPublic(db, 's')).rejects.toThrow('permission denied')
  })
})

describe('admin vehicles come from the vehicles_admin RPC (migration 028)', () => {
  beforeEach(() => resetVehicleAdminProbe())

  /** rpc answers per `rpcResult`; the table read (the fallback) is recorded and returns one raw row. */
  function adminDb(rpcResult: unknown) {
    const log: string[] = []
    const db = {
      rpc: (fn: string, args: unknown) => {
        log.push(`rpc(${fn},${JSON.stringify(args)})`)
        return Promise.resolve(rpcResult)
      },
      from: (table: string) => {
        log.push(`from(${table})`)
        const b: Record<string, unknown> = { select: () => b, eq: () => b, gt: () => b }
        b.then = (resolve: (v: unknown) => void) =>
          resolve({ data: [{ server_id: 's', vehicle_id: 1, script_name: 'Base.CarTaxi', x: 1, y: 2, z: 0, t: null, driver_username: 'alice' }], error: null })
        return b
      },
    } as unknown as SupabaseClient
    return { db, log }
  }

  it('uses the RPC with the server id and keeps driver_username', async () => {
    const row = { server_id: 's', vehicle_id: 1, script_name: 'Base.CarTaxi', x: 1, y: 2, z: 0, t: null, driver_username: 'alice', claimed_by: 'bob', sql_id: 9, from_ledger: false }
    const { db, log } = adminDb({ data: [row], error: null })
    const [v] = await fetchVehiclesAdmin(db, 's')
    expect(log).toEqual(['rpc(vehicles_admin,{"p_server":"s"})'])
    expect(v.driver_username).toBe('alice')
    expect(v.claimed_by).toBe('bob')
  })

  it('falls back to the table read on PGRST202 and remembers it', async () => {
    const { db, log } = adminDb({ data: null, error: { code: 'PGRST202', message: 'Could not find the function aurora.vehicles_admin' } })
    const [v] = await fetchVehiclesAdmin(db, 's')
    expect(v.driver_username).toBe('alice')
    await fetchVehiclesAdmin(db, 's')
    expect(log).toEqual(['rpc(vehicles_admin,{"p_server":"s"})', 'from(vehicles)', 'from(vehicles)'])
  })

  it('does not swallow other RPC errors', async () => {
    const { db } = adminDb({ data: null, error: { code: '42501', message: 'permission denied' } })
    await expect(fetchVehiclesAdmin(db, 's')).rejects.toThrow('permission denied')
  })
})
