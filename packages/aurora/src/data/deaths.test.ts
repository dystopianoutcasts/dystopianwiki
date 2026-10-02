import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NPC_RETRY_MS, fetchDeaths, resetNpcProbe } from './queries'

type Result = { data: unknown; error: { message: string; code?: string } | null }

function deathsDb(view: Result, rpc: Result = { data: [], error: null }) {
  const log: string[] = []
  const db = {
    rpc: (fn: string, args: unknown) => {
      log.push(`rpc(${fn},${JSON.stringify(args)})`)
      return Promise.resolve(rpc)
    },
    from: (table: string) => {
      log.push(`from(${table})`)
      const b: Record<string, unknown> = {}
      b.select = (cols: string) => {
        log.push(`select(${cols})`)
        return b
      }
      b.eq = (c: string, v: string) => {
        log.push(`eq(${c},${v})`)
        return b
      }
      b.then = (resolve: (v: unknown) => void) => resolve(view)
      return b
    },
  } as unknown as SupabaseClient
  return { db, log }
}

const ROW = { server_id: 's', username: 'ann', x: 1, y: 2, z: 0, t: '2026-10-01T00:00:00Z', hours_survived: 5 }
const MISSING_VIEW = { code: 'PGRST205', message: "Could not find the table 'aurora.deaths_visible' in the schema cache" }

describe('death reads (migration 030)', () => {
  beforeEach(() => {
    resetNpcProbe()
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('a visitor reads deaths_visible for the server, never the RPC', async () => {
    const { db, log } = deathsDb({ data: [ROW], error: null })
    expect(await fetchDeaths(db, 's', false)).toEqual([ROW])
    expect(log).toEqual(['from(deaths_visible)', 'select(server_id,username,x,y,z,t,hours_survived)', 'eq(server_id,s)'])
  })

  it('an admin reads deaths_admin with the server id', async () => {
    const { db, log } = deathsDb({ data: [], error: null }, { data: [ROW], error: null })
    expect(await fetchDeaths(db, 's', true)).toEqual([ROW])
    expect(log).toEqual(['rpc(deaths_admin,{"p_server":"s"})'])
  })

  it('a missing view is an empty layer, no error, logged once, retried no sooner than 5 minutes', async () => {
    vi.useFakeTimers()
    const { db, log } = deathsDb({ data: null, error: MISSING_VIEW })
    expect(await fetchDeaths(db, 's', false)).toEqual([])
    expect(await fetchDeaths(db, 's', false)).toEqual([])
    expect(log.filter((l) => l.startsWith('from('))).toHaveLength(1)
    vi.advanceTimersByTime(NPC_RETRY_MS)
    await fetchDeaths(db, 's', false)
    expect(log.filter((l) => l.startsWith('from('))).toHaveLength(2)
    expect(console.info).toHaveBeenCalledTimes(1)
  })

  it('a missing RPC sends an admin to the view; any other error is thrown', async () => {
    const missingFn = { data: null, error: { code: 'PGRST202', message: 'Could not find the function aurora.deaths_admin' } }
    const { db, log } = deathsDb({ data: [ROW], error: null }, missingFn)
    expect(await fetchDeaths(db, 's', true)).toEqual([ROW])
    expect(log).toContain('from(deaths_visible)')
    const denied = { data: null, error: { code: '42501', message: 'permission denied' } }
    await expect(fetchDeaths(deathsDb(denied).db, 's', false)).rejects.toThrow('deaths: permission denied')
  })
})
