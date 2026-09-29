// Whether names on the map are shown as the character's display name or the player's
// account username, remembered in localStorage. Owner decision 2026-09-29: usernames are
// intentionally public and every visitor may choose which name they see (T44; this
// reverses T27, which would have hidden usernames instead - see that file's own note).
// Storage can be blocked or full, so every access is guarded and the app works with none,
// same shape as state/layerPrefs.ts.

export type NameMode = 'character' | 'account'

export const DEFAULT_NAME_MODE: NameMode = 'character'

const STORAGE_KEY = 'aurora.nameMode.v1'

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

function isNameMode(v: unknown): v is NameMode {
  return v === 'character' || v === 'account'
}

/** The saved choice, or the default when nothing is saved, storage is unavailable, or the
 * saved value is not a recognised mode. */
export function loadNameMode(storage: StorageLike | null = defaultStorage()): NameMode {
  if (!storage) return DEFAULT_NAME_MODE
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_NAME_MODE
    const parsed: unknown = JSON.parse(raw)
    return isNameMode(parsed) ? parsed : DEFAULT_NAME_MODE
  } catch {
    // corrupt or blocked storage: fall back to the default
    return DEFAULT_NAME_MODE
  }
}

export function saveNameMode(mode: NameMode, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(mode))
  } catch {
    // quota exceeded or blocked: the toggle still works for this session
  }
}
