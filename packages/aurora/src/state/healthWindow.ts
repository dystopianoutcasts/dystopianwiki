// The health panel's sparkline window (T22 Part D item 5): a fixed 60-minute window
// makes a fresh server look frozen (barely any data in most of the chart), so the
// visitor picks 10 min / 1 h / 6 h and the choice is remembered in localStorage - same
// guarded pattern as layerPrefs.ts, since storage can be blocked or full and the page
// must still work with none.

export const HEALTH_WINDOW_OPTIONS = [10, 60, 360] as const
export type HealthWindowMinutes = (typeof HEALTH_WINDOW_OPTIONS)[number]
export const DEFAULT_HEALTH_WINDOW: HealthWindowMinutes = 60

const STORAGE_KEY = 'aurora.health-window.v1'

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

function isOption(n: number): n is HealthWindowMinutes {
  return (HEALTH_WINDOW_OPTIONS as readonly number[]).includes(n)
}

/** The saved choice, or the default when nothing is saved, storage is blocked, or the
 * saved value isn't one of the three options. */
export function loadHealthWindow(storage: StorageLike | null = defaultStorage()): HealthWindowMinutes {
  if (!storage) return DEFAULT_HEALTH_WINDOW
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw == null) return DEFAULT_HEALTH_WINDOW
    const n = Number(raw)
    return isOption(n) ? n : DEFAULT_HEALTH_WINDOW
  } catch {
    return DEFAULT_HEALTH_WINDOW
  }
}

export function saveHealthWindow(minutes: HealthWindowMinutes, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, String(minutes))
  } catch {
    // quota exceeded or blocked: the choice still works for this session
  }
}
