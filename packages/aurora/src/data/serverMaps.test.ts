import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NPC_RETRY_MS, fetchPendingWorld, fetchServerMaps, resetNpcProbe } from './queries'

type Result = { data: unknown; error: { message: string; code?: string } | null }

function rpcDb(result: Result) {
  const log: string[] = []
  const db = {
    rpc: (fn: string, args: unknown) => {
      log.push(`rpc(${fn},${JSON.stringify(args)})`)
      return Promise.resolve(result)
    },
  } as unknown as SupabaseClient
  return { db, log }
}

const MISSING = { data: null, error: { code: 'PGRST202', message: 'Could not find the function aurora.server_maps(p_server) in the schema cache' } }

describe('server maps reads (migration 033, T50)', () => {
  beforeEach(() => {
    resetNpcProbe()
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns the list in the order the database gives it, strings only', async () => {
    const { db, log } = rpcDb({ data: ['Raven Creek B42', 7, 'Muldraugh, KY'], error: null })
    expect(await fetchServerMaps(db, 's')).toEqual(['Raven Creek B42', 'Muldraugh, KY'])
    expect(log).toEqual(['rpc(server_maps,{"p_server":"s"})'])
  })

  it('a missing function (pre-033 database) is null, "unknown", logged once, then rested NPC_RETRY_MS', async () => {
    vi.useFakeTimers()
    const { db, log } = rpcDb(MISSING)
    expect(await fetchServerMaps(db, 's')).toBeNull()
    expect(await fetchServerMaps(db, 's')).toBeNull()
    expect(log).toHaveLength(1)
    expect(console.info).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(NPC_RETRY_MS)
    expect(await fetchServerMaps(db, 's')).toBeNull()
    expect(log).toHaveLength(2)
    expect(console.info).toHaveBeenCalledTimes(1)
  })

  it('any other error throws (the hook keeps the list it had)', async () => {
    const { db } = rpcDb({ data: null, error: { code: '500', message: 'boom' } })
    await expect(fetchServerMaps(db, 's')).rejects.toThrow('server maps: boom')
  })

  it('pending world: true only for a true answer; a missing function is false and rested', async () => {
    expect(await fetchPendingWorld(rpcDb({ data: true, error: null }).db, 's')).toBe(true)
    expect(await fetchPendingWorld(rpcDb({ data: false, error: null }).db, 's')).toBe(false)
    expect(await fetchPendingWorld(rpcDb({ data: 'true', error: null }).db, 's')).toBe(false)
    const missing = rpcDb({ data: null, error: { code: 'PGRST202', message: 'Could not find the function' } })
    expect(await fetchPendingWorld(missing.db, 's')).toBe(false)
    expect(await fetchPendingWorld(missing.db, 's')).toBe(false)
    expect(missing.log).toEqual(['rpc(pending_world_exists,{"p_server":"s"})'])
    resetNpcProbe()
    await expect(fetchPendingWorld(rpcDb({ data: null, error: { message: 'denied' } }).db, 's')).rejects.toThrow('pending world: denied')
  })
})
