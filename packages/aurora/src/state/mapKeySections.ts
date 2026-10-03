// T68: which map key sections (one per layer) the visitor has collapsed, remembered in
// localStorage. Every section starts expanded. Storage can be blocked or full, so every
// access is guarded and the key works with none, as state/layerPrefs.ts does.
import { LAYER_KEYS } from './layerPrefs'
import type { LayerKey } from './layerPrefs'

export const COLLAPSED_STORAGE_KEY = 'aurora.mapKey.collapsed.v1'

export interface StorageLike {
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

/** The collapsed sections. Nothing saved, corrupt or blocked: none (all expanded). Names that
 * are not a layer are dropped. */
export function loadCollapsed(storage: StorageLike | null = defaultStorage()): ReadonlySet<LayerKey> {
  const out = new Set<LayerKey>()
  if (!storage) return out
  try {
    const raw = storage.getItem(COLLAPSED_STORAGE_KEY)
    if (!raw) return out
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return out
    for (const v of parsed) {
      if ((LAYER_KEYS as readonly unknown[]).includes(v)) out.add(v as LayerKey)
    }
  } catch {
    // corrupt or blocked storage: everything expanded
  }
  return out
}

export function saveCollapsed(collapsed: ReadonlySet<LayerKey>, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return
  try {
    storage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(LAYER_KEYS.filter((k) => collapsed.has(k))))
  } catch {
    // quota exceeded or blocked: the sections still open and close for this visit
  }
}

/** The set with `layer` flipped, saved. Returns the new set (the old one is not changed). */
export function toggleCollapsed(collapsed: ReadonlySet<LayerKey>, layer: LayerKey, storage: StorageLike | null = defaultStorage()): ReadonlySet<LayerKey> {
  const next = new Set(collapsed)
  if (next.has(layer)) next.delete(layer)
  else next.add(layer)
  saveCollapsed(next, storage)
  return next
}
