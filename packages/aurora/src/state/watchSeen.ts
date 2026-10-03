// T72: which watched cars have already raised the "Spotted" notice, per account, in this browser.
// localStorage `aurora.watch.seen.v1` = { [userId]: vehicleKey[] }. Storage can be blocked, full or
// corrupt, so every access is guarded (as state/layerPrefs.ts) and the notice works without it
// (it then simply announces again after a reload).

export const SEEN_STORAGE_KEY = 'aurora.watch.seen.v1'
/** Per account. The newest keys are kept when the list is longer. */
export const SEEN_CAP = 2000

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function defaultStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function readAll(storage: StorageLike): Record<string, string[]> {
  try {
    const raw = storage.getItem(SEEN_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    const out: Record<string, string[]> = {}
    for (const [user, keys] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(keys)) out[user] = keys.filter((k): k is string => typeof k === 'string')
    }
    return out
  } catch {
    return {}
  }
}

/** The announced keys for `userId`; empty when storage is missing, blocked or corrupt. */
export function loadSeen(userId: string, storage: StorageLike | null = defaultStorage()): Set<string> {
  if (!storage) return new Set()
  return new Set(readAll(storage)[userId] ?? [])
}

/** Save `userId`'s keys (the newest SEEN_CAP of them, in insertion order), keeping other accounts'. */
export function saveSeen(userId: string, seen: ReadonlySet<string>, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return
  try {
    const all = readAll(storage)
    const keys = [...seen]
    all[userId] = keys.length > SEEN_CAP ? keys.slice(keys.length - SEEN_CAP) : keys
    storage.setItem(SEEN_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // quota exceeded or blocked: the notice still works for this session
  }
}
