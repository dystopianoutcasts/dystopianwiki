// Which map layers are switched on, remembered in localStorage. Storage can be blocked or
// full, so every access is guarded and the app works with none.

export const LAYER_KEYS = ['streets', 'worldMap', 'areas', 'players', 'vehicles', 'safehouses', 'npcGroups', 'npcOutposts', 'deaths', 'zones', 'zombieHeat', 'zombieDensity', 'mapObjects'] as const
export type LayerKey = (typeof LAYER_KEYS)[number]

/**
 * T68: every toggle in the layer list. The map layers above, plus "Map key", which is not a
 * map layer (it draws nothing on the map and has no key entry of its own) but is switched
 * and remembered the same way. Listed first so a first-time visitor sees it at the top.
 */
export const TOGGLE_KEYS = ['mapKey', ...LAYER_KEYS] as const
export type ToggleKey = (typeof TOGGLE_KEYS)[number]
export type LayerPrefs = Record<ToggleKey, boolean>

export const DEFAULT_LAYERS: LayerPrefs = {
  // T68 (owner, 2026-10-03): "No one is going to know that there's a map key at the bottom."
  // On for first-time visitors so it is found; a visitor who switches it off stays off.
  mapKey: true,
  streets: true,
  worldMap: false,
  areas: false,
  players: true,
  vehicles: true,
  safehouses: true,
  npcGroups: true,
  npcOutposts: true,
  deaths: true,
  zones: false,
  zombieHeat: false,
  zombieDensity: false,
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
    for (const key of TOGGLE_KEYS) {
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
