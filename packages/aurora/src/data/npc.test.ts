import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NPC_RETRY_MS, fetchNpcGroups, fetchNpcOutposts, resetNpcProbe } from './queries'

type Result = { data: unknown; error: { message: string; code?: string } | null }

/** A db recording every view read and rpc call; each answers from the given results. */
function npcDb(view: Result, rpc: Result = { data: [], error: null }) {
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

const GROUP = { server_id: 's', group_id: 'g1', faction_name: 'Raiders', stance: 'hostile', size: 3, x: 1, y: 2, z: 0, active: true, t: null }
const MISSING_VIEW = { data: null, error: { code: 'PGRST205', message: "Could not find the table 'aurora.npc_groups_visible' in the schema cache" } }

describe('NPC reads (migration 029)', () => {
  beforeEach(() => {
    resetNpcProbe()
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('a visitor reads the public views for the server, never the RPC', async () => {
    const { db, log } = npcDb({ data: [GROUP], error: null })
    expect(await fetchNpcGroups(db, 's', false)).toEqual([GROUP])
    expect(log).toEqual([
      'from(npc_groups_visible)',
      'select(server_id,group_id,faction_name,stance,size,x,y,z,active,t)',
      'eq(server_id,s)',
    ])
    await fetchNpcOutposts(db, 's', false)
    expect(log).toContain('from(npc_outposts_visible)')
    expect(log.some((l) => l.startsWith('rpc('))).toBe(false)
  })

  it('an admin reads the RPCs with the server id', async () => {
    const row = { ...GROUP, encounter: 'ambush', source: 'squad' }
    const { db, log } = npcDb({ data: [], error: null }, { data: [row], error: null })
    expect(await fetchNpcGroups(db, 's', true)).toEqual([row])
    await fetchNpcOutposts(db, 's', true)
    expect(log).toEqual(['rpc(npc_groups_admin,{"p_server":"s"})', 'rpc(npc_outposts_admin,{"p_server":"s"})'])
  })

  for (const [name, error] of [
    ['PGRST205', MISSING_VIEW.error],
    ['42P01', { code: '42P01', message: 'relation "aurora.npc_groups_visible" does not exist' }],
    ['a message with no code', { message: "Could not find the table 'aurora.npc_groups_visible' in the schema cache" }],
  ] as const) {
    it(`a missing view (${name}) is an empty layer, no error, logged once, retried no sooner than 5 minutes`, async () => {
      vi.useFakeTimers()
      const { db, log } = npcDb({ data: null, error })
      expect(await fetchNpcGroups(db, 's', false)).toEqual([])
      expect(await fetchNpcGroups(db, 's', false)).toEqual([])
      expect(log.filter((l) => l.startsWith('from('))).toHaveLength(1)
      vi.advanceTimersByTime(NPC_RETRY_MS - 1)
      await fetchNpcGroups(db, 's', false)
      expect(log.filter((l) => l.startsWith('from('))).toHaveLength(1)
      vi.advanceTimersByTime(1)
      expect(await fetchNpcGroups(db, 's', false)).toEqual([])
      expect(log.filter((l) => l.startsWith('from('))).toHaveLength(2)
      expect(console.info).toHaveBeenCalledTimes(1)
    })
  }

  it('picks the layer up once 029 goes live', async () => {
    vi.useFakeTimers()
    const first = npcDb({ data: null, error: MISSING_VIEW.error })
    await fetchNpcGroups(first.db, 's', false)
    vi.advanceTimersByTime(NPC_RETRY_MS)
    const live = npcDb({ data: [GROUP], error: null })
    expect(await fetchNpcGroups(live.db, 's', false)).toEqual([GROUP])
  })

  it('a missing function (PGRST202) sends an admin to the public view, then rests the RPC for 5 minutes', async () => {
    vi.useFakeTimers()
    const { db, log } = npcDb({ data: [GROUP], error: null }, { data: null, error: { code: 'PGRST202', message: 'Could not find the function aurora.npc_groups_admin' } })
    expect(await fetchNpcGroups(db, 's', true)).toEqual([GROUP])
    await fetchNpcGroups(db, 's', true)
    expect(log.filter((l) => l.startsWith('rpc('))).toHaveLength(1)
    vi.advanceTimersByTime(NPC_RETRY_MS)
    await fetchNpcGroups(db, 's', true)
    expect(log.filter((l) => l.startsWith('rpc('))).toHaveLength(2)
  })

  it('does not swallow other errors, from a view or an RPC', async () => {
    const denied = { data: null, error: { code: '42501', message: 'permission denied' } }
    await expect(fetchNpcOutposts(npcDb(denied).db, 's', false)).rejects.toThrow('npc outposts: permission denied')
    await expect(fetchNpcGroups(npcDb({ data: [], error: null }, denied).db, 's', true)).rejects.toThrow('npc groups: permission denied')
  })

  it('the two layers fail independently', async () => {
    const { db } = npcDb(MISSING_VIEW)
    await fetchNpcGroups(db, 's', false)
    const ok = npcDb({ data: [{ ...GROUP, outpost_id: 'o' }], error: null })
    expect(await fetchNpcOutposts(ok.db, 's', false)).toHaveLength(1)
  })
})
