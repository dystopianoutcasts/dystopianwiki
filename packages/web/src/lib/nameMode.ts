/**
 * Survivor name or username for the home page's "Who is on now" (T62), remembered in
 * localStorage under the SAME key, values and default as the live map's
 * packages/aurora/src/state/nameMode.ts. The map is served from /map/ on this origin,
 * so one saved choice applies to both. Usernames are public by owner decision
 * (2026-09-29, T44).
 *
 * Duplicated, not imported: packages/web does not depend on packages/aurora.
 * nameMode.test.ts reads the map's file as text and fails if the key or the mode
 * names drift apart. Storage can be blocked or full, so every access is guarded and
 * the page works with none, same shape as the map's module.
 */

export type NameMode = 'character' | 'account'

export const DEFAULT_NAME_MODE: NameMode = 'character'

/** Must equal STORAGE_KEY in packages/aurora/src/state/nameMode.ts. */
export const NAME_MODE_STORAGE_KEY = 'aurora.nameMode.v1'

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

function isNameMode(v: unknown): v is NameMode {
  return v === 'character' || v === 'account'
}

/** The saved choice, or the default when nothing is saved, storage is unavailable, or the
 * saved value is not a recognised mode. */
export function loadNameMode(storage: StorageLike | null = defaultStorage()): NameMode {
  if (!storage) return DEFAULT_NAME_MODE
  try {
    const raw = storage.getItem(NAME_MODE_STORAGE_KEY)
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
    storage.setItem(NAME_MODE_STORAGE_KEY, JSON.stringify(mode))
  } catch {
    // quota exceeded or blocked: the toggle still works for this page view
  }
}

/** Other sections of this page that follow the switch (the leaderboard, T66). A 'storage'
 * event only reaches OTHER tabs, so a change made on this page is passed on here. */
const listeners = new Set<(mode: NameMode) => void>()

/** Follow the switch on this page; returns the unsubscribe. */
export function subscribeNameMode(listener: (mode: NameMode) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** What the toggle does on a click: save the choice, show it, and tell the page's other sections. */
export function chooseNameMode(
  mode: NameMode,
  apply: (mode: NameMode) => void,
  storage: StorageLike | null = defaultStorage(),
): void {
  saveNameMode(mode, storage)
  apply(mode)
  for (const l of [...listeners]) l(mode)
}

/** The name to show for a player: the survivor's name (falling back to the username when
 * the survivor has none) or the username. */
export function shownName(player: { username: string; displayName: string | null }, mode: NameMode): string {
  return mode === 'account' ? player.username : player.displayName || player.username
}
