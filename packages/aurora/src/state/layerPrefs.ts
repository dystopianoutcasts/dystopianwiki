// Which map layers are switched on, remembered in localStorage. Storage can be blocked or
// full, so every access is guarded and the app works with none.

export const LAYER_KEYS = ['streets', 'worldMap', 'players', 'vehicles', 'safehouses', 'zones', 'zombieHeat', 'mapObjects'] as const
export type LayerKey = (typeof LAYER_KEYS)[number]
export type LayerPrefs = Record<LayerKey, boolean>

export const DEFAULT_LAYERS: LayerPrefs = {
  streets: true,
  worldMap: false,
  players: true,
  vehicles: true,
  safehouses: true,
  zones: false,
  zombieHeat: false,
  mapObjects: false,
}

const STORAGE_KEY = 'aurora.layers.v1'

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

/** Saved prefs merged over the defaults; unknown keys and non-boolean values are ignored. */
export function loadLayerPrefs(storage: StorageLike | null = defaultStorage()): LayerPrefs {
  const prefs = { ...DEFAULT_LAYERS }
  if (!storage) return prefs
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return prefs
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return prefs
    for (const key of LAYER_KEYS) {
      const v = (parsed as Record<string, unknown>)[key]
      if (typeof v === 'boolean') prefs[key] = v
    }
  } catch {
    // corrupt or blocked storage: fall back to defaults
  }
  return prefs
}

export function saveLayerPrefs(prefs: LayerPrefs, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // quota exceeded or blocked: the toggle still works for this session
  }
}
