// T72: the signed-in viewer's watch list (useWatches) and the "Spotted" notice's state (useSightings).
// The rules live in watches.ts and sightings.ts, which are pure and tested; these hooks only hold state.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Vehicle } from './types'
import { WATCH_MESSAGES, WatchError, changeWatches, fetchWatches } from './watches'
import type { WatchUpdate } from './watches'
import { forgetScripts, stepSeen } from './sightings'
import { loadSeen, saveSeen } from '../state/watchSeen'

export type WatchStatus = 'signed-out' | 'loading' | 'ready' | 'off' | 'error'

const EMPTY: ReadonlySet<string> = new Set()

/** Set once the table is found missing (038 not applied): not asked again this session. */
let offThisSession = false

export interface Watches {
  watching: ReadonlySet<string>
  status: WatchStatus
  /** The last add/remove failure, worded for the viewer (role="alert"); null when there is none. */
  message: string | null
  add: (names: readonly string[]) => void
  remove: (names: readonly string[]) => void
  retry: () => void
}

/**
 * Loaded on sign-in and whenever the account changes, cleared on sign-out. Signed out, no request is
 * ever made. Add and remove are optimistic and roll back with a message (watches.ts changeWatches).
 */
export function useWatches(client: SupabaseClient, serverId: string, userId: string | null, authLoading: boolean): Watches {
  const [watching, setWatching] = useState<ReadonlySet<string>>(EMPTY)
  const [status, setStatus] = useState<WatchStatus>('signed-out')
  const [message, setMessage] = useState<string | null>(null)
  // The list as last set, so two quick clicks never compute from a list one render old.
  const current = useRef<ReadonlySet<string>>(EMPTY)
  // Bumped on every account change: a response or rollback for an earlier account is dropped.
  const seq = useRef(0)

  const put = useCallback((next: ReadonlySet<string>) => {
    current.current = next
    setWatching(next)
  }, [])

  const load = useCallback(async () => {
    const mine = ++seq.current
    setStatus('loading')
    try {
      const list = await fetchWatches(client, serverId)
      if (mine !== seq.current) return
      put(new Set(list))
      setStatus('ready')
    } catch (e) {
      if (mine !== seq.current) return
      if (e instanceof WatchError && e.kind === 'off') {
        offThisSession = true
        setStatus('off')
      } else {
        setStatus('error')
      }
    }
  }, [client, serverId, put])

  useEffect(() => {
    setMessage(null)
    if (authLoading) {
      seq.current++
      setStatus('loading')
      return
    }
    if (!userId) {
      seq.current++
      put(EMPTY)
      setStatus('signed-out')
      return
    }
    put(EMPTY)
    if (offThisSession) {
      seq.current++
      setStatus('off')
      return
    }
    void load()
  }, [userId, authLoading, load, put])

  const change = useCallback(
    async (op: 'add' | 'remove', names: readonly string[]) => {
      if (status !== 'ready') return
      setMessage(null)
      const mine = seq.current
      const update: WatchUpdate = (fn) => {
        if (seq.current === mine) put(fn(current.current))
      }
      const kind = await changeWatches(client, serverId, op, names, current.current, update)
      if (kind === null || seq.current !== mine) return
      if (kind === 'off') {
        offThisSession = true
        setStatus('off')
      }
      setMessage(WATCH_MESSAGES[kind])
    },
    [client, serverId, status, put],
  )

  const add = useCallback((names: readonly string[]) => void change('add', names), [change])
  const remove = useCallback((names: readonly string[]) => void change('remove', names), [change])
  const retry = useCallback(() => {
    if (userId && !offThisSession) void load()
  }, [userId, load])

  return { watching, status, message, add, remove, retry }
}

export interface Sightings {
  /** Announced cars (vehicle keys) not yet dismissed. */
  pending: string[]
  dismiss: () => void
}

/**
 * The "Spotted" notice: a watched car raises it once per browser (the announced keys are kept per
 * account in localStorage, state/watchSeen.ts). Unchecking a script forgets its cars. The announced
 * set is pruned only after a FULL vehicle fetch (`fullSeq` moved), never after a delta.
 */
export function useSightings(userId: string | null, vehicles: readonly Vehicle[], fullSeq: number, matches: readonly Vehicle[], watching: ReadonlySet<string>): Sightings {
  const [pending, setPending] = useState<string[]>([])
  const seen = useRef<Set<string>>(new Set())
  const lastFull = useRef(fullSeq)
  const lastWatching = useRef<{ user: string | null; set: ReadonlySet<string> }>({ user: userId, set: watching })
  const vehiclesRef = useRef(vehicles)
  vehiclesRef.current = vehicles

  // The account's announced set; nothing carries over from another account.
  useEffect(() => {
    seen.current = userId ? loadSeen(userId) : new Set()
    lastFull.current = fullSeq
    setPending([])
    // Only the account matters here; fullSeq is read as the baseline, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Declared before the sighting step, so an uncheck is forgotten before the next step runs.
  useEffect(() => {
    const prev = lastWatching.current
    lastWatching.current = { user: userId, set: watching }
    if (!userId || prev.user !== userId) return
    const removed = new Set([...prev.set].filter((s) => !watching.has(s)))
    if (removed.size === 0) return
    seen.current = forgetScripts(seen.current, vehiclesRef.current, removed)
    saveSeen(userId, seen.current)
  }, [userId, watching])

  useEffect(() => {
    if (!userId) return
    const full = fullSeq !== lastFull.current
    lastFull.current = fullSeq
    const step = stepSeen(seen.current, matches, vehiclesRef.current, full)
    if (!step.changed) return
    seen.current = step.seen
    saveSeen(userId, step.seen)
    if (step.fresh.length > 0) setPending((p) => [...p, ...step.fresh.filter((k) => !p.includes(k))])
  }, [userId, matches, fullSeq])

  const dismiss = useCallback(() => setPending([]), [])
  return { pending, dismiss }
}
