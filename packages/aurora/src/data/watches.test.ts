// T72: the watch list requests (T71 contract), the error mapping and the optimistic add/remove.
import { beforeEach, describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { WATCHES_TABLE, WATCH_LIMIT, WATCH_MESSAGES, WatchError, addWatches, changeWatches, fetchWatches, removeWatches, watchErrorKind } from './watches'
import { VEHICLE_SCRIPTS_VIEW, fetchVehicleScripts, resetNpcProbe } from './queries'

type Result = { data?: unknown; error?: { message: string; code?: string } | null }
interface Call {
  table: string
  ops: [string, ...unknown[]][]
}

/** A stand-in for the supabase client: records each chain of calls and answers with `answer(call)`. */
function fakeDb(answer: (call: Call) => Result | Promise<Result>) {
  const calls: Call[] = []
  const chain = (call: Call): object => {
    const step = (name: string) => (...args: unknown[]) => {
      call.ops.push([name, ...args])
      return chain(call)
    }
    return {
      select: step('select'),
      eq: step('eq'),
      in: step('in'),
      upsert: step('upsert'),
      delete: step('delete'),
      then: (ok: (r: Result) => unknown, bad: (e: unknown) => unknown) => Promise.resolve(answer(call)).then((r) => ({ data: null, error: null, ...r })).then(ok, bad),
    }
  }
  const db = {
    from: (table: string) => {
      const call: Call = { table, ops: [] }
      calls.push(call)
      return chain(call)
    },
  }
  // The fake implements only the calls these functions make; the cast is the test seam.
  return { db: db as unknown as SupabaseClient, calls }
}

describe('T72: requests follow the T71 contract', () => {
  it('read: select script_name for the server', async () => {
    const { db, calls } = fakeDb(() => ({ data: [{ script_name: 'Base.Van' }, { script_name: 'Base.SUV' }] }))
    expect(await fetchWatches(db, 'srv')).toEqual(['Base.Van', 'Base.SUV'])
    expect(calls).toEqual([{ table: WATCHES_TABLE, ops: [['select', 'script_name'], ['eq', 'server_id', 'srv']] }])
  })

  it('add: upsert { server_id, script_name } rows, never user_id, ignoring duplicates', async () => {
    const { db, calls } = fakeDb(() => ({}))
    await addWatches(db, 'srv', ['Base.Van'])
    expect(calls[0].ops).toEqual([['upsert', [{ server_id: 'srv', script_name: 'Base.Van' }], { onConflict: 'user_id,server_id,script_name', ignoreDuplicates: true }]])
    expect(JSON.stringify(calls)).not.toContain('user_id"')
  })

  it('remove: delete by server and script names', async () => {
    const { db, calls } = fakeDb(() => ({}))
    await removeWatches(db, 'srv', ['Base.Van', 'Base.SUV'])
    expect(calls[0].ops).toEqual([['delete'], ['eq', 'server_id', 'srv'], ['in', 'script_name', ['Base.Van', 'Base.SUV']]])
  })
})

describe('T72: error codes', () => {
  it('PGRST205 and 42P01 (038 not applied) are "not switched on yet"', () => {
    expect(watchErrorKind({ code: 'PGRST205', message: "Could not find the table 'aurora.vehicle_watches' in the schema cache" })).toBe('off')
    expect(watchErrorKind({ code: '42P01', message: 'relation "aurora.vehicle_watches" does not exist' })).toBe('off')
  })

  it('23514 / vehicle_watches_limit is the limit', () => {
    expect(watchErrorKind({ code: '23514', message: 'vehicle_watches_limit' })).toBe('limit')
    expect(watchErrorKind({ message: 'new row violates check: vehicle_watches_limit' })).toBe('limit')
    expect(WATCH_MESSAGES.limit).toBe('You can watch up to 100 cars.')
  })

  it('anything else is a generic failure', () => {
    expect(watchErrorKind({ code: '42501', message: 'permission denied' })).toBe('failed')
  })

  it('a missing table on read throws a WatchError of kind "off"', async () => {
    const { db } = fakeDb(() => ({ error: { code: 'PGRST205', message: 'Could not find the table' } }))
    await expect(fetchWatches(db, 'srv')).rejects.toMatchObject({ kind: 'off' })
    await expect(fetchWatches(db, 'srv')).rejects.toBeInstanceOf(WatchError)
  })
})

describe('T72: optimistic add and remove', () => {
  function holder(initial: string[]) {
    let state: ReadonlySet<string> = new Set(initial)
    const seen: string[][] = []
    return {
      get: () => state,
      seen,
      update: (fn: (prev: ReadonlySet<string>) => ReadonlySet<string>) => {
        state = fn(state)
        seen.push([...state].sort())
      },
    }
  }

  it('an add shows at once and stays on success; only new names are sent', async () => {
    const h = holder(['Base.SUV'])
    const { db, calls } = fakeDb(() => ({}))
    expect(await changeWatches(db, 'srv', 'add', ['Base.Van', 'Base.SUV'], h.get(), h.update)).toBeNull()
    expect([...h.get()].sort()).toEqual(['Base.SUV', 'Base.Van'])
    expect(calls[0].ops[0][1]).toEqual([{ server_id: 'srv', script_name: 'Base.Van' }])
  })

  it('a failed add is shown first, then rolled back, and says why', async () => {
    const h = holder(['Base.SUV'])
    const { db } = fakeDb(() => ({ error: { code: '23514', message: 'vehicle_watches_limit' } }))
    expect(await changeWatches(db, 'srv', 'add', ['Base.Van'], h.get(), h.update)).toBe('limit')
    expect(h.seen).toEqual([['Base.SUV', 'Base.Van'], ['Base.SUV']])
  })

  it('a failed remove puts the name back; a change made meanwhile is kept', async () => {
    const h = holder(['Base.SUV', 'Base.Van'])
    let release: (r: Result) => void = () => {}
    const { db } = fakeDb(() => new Promise<Result>((r) => (release = r)))
    const pending = changeWatches(db, 'srv', 'remove', ['Base.Van'], h.get(), h.update)
    expect([...h.get()]).toEqual(['Base.SUV'])
    h.update((prev) => new Set([...prev, 'Base.CarNormal']))
    // The request is sent on a later microtask; let it reach the fake before answering.
    await new Promise((r) => setTimeout(r, 0))
    release({ error: { code: 'XX000', message: 'boom' } })
    expect(await pending).toBe('failed')
    expect([...h.get()].sort()).toEqual(['Base.CarNormal', 'Base.SUV', 'Base.Van'])
  })

  it('a missing table on add rolls back and reports "off"', async () => {
    const h = holder([])
    const { db } = fakeDb(() => ({ error: { code: '42P01', message: 'relation does not exist' } }))
    expect(await changeWatches(db, 'srv', 'add', ['Base.Van'], h.get(), h.update)).toBe('off')
    expect(h.get().size).toBe(0)
  })

  it('over the limit is refused before any request', async () => {
    const full = Array.from({ length: WATCH_LIMIT }, (_, i) => `Base.Car${i}`)
    const h = holder(full)
    const { db, calls } = fakeDb(() => ({}))
    expect(await changeWatches(db, 'srv', 'add', ['Base.Van'], h.get(), h.update)).toBe('limit')
    expect(calls).toEqual([])
    expect(h.get().size).toBe(WATCH_LIMIT)
  })

  it('nothing to change, nothing sent', async () => {
    const h = holder(['Base.Van'])
    const { db, calls } = fakeDb(() => ({}))
    expect(await changeWatches(db, 'srv', 'add', ['Base.Van'], h.get(), h.update)).toBeNull()
    expect(await changeWatches(db, 'srv', 'remove', ['Base.SUV'], h.get(), h.update)).toBeNull()
    expect(calls).toEqual([])
  })
})

describe('T72: the server\'s vehicle scripts (vehicle_scripts_visible)', () => {
  beforeEach(() => resetNpcProbe())

  it('reads script_name for the server', async () => {
    const { db, calls } = fakeDb(() => ({ data: [{ script_name: 'Base.Van' }, { script_name: null }] }))
    expect(await fetchVehicleScripts(db, 'srv')).toEqual(['Base.Van'])
    expect(calls[0]).toEqual({ table: VEHICLE_SCRIPTS_VIEW, ops: [['select', 'script_name'], ['eq', 'server_id', 'srv']] })
  })

  it('missing reads exactly like empty, and is not asked for again on the next poll', async () => {
    const { db, calls } = fakeDb(() => ({ error: { code: 'PGRST205', message: 'Could not find the table' } }))
    const info = console.info
    console.info = () => {}
    try {
      expect(await fetchVehicleScripts(db, 'srv')).toEqual([])
      expect(await fetchVehicleScripts(db, 'srv')).toEqual([])
    } finally {
      console.info = info
    }
    expect(calls).toHaveLength(1)
  })
})
