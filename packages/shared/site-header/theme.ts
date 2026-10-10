// The site's light and dark themes (KB15), the same in the wiki and the map.
//
// The visitor's choice is System, Light or Dark, kept in localStorage under one key both
// apps read. System follows prefers-color-scheme. The result is written to <html> as
// data-theme="light" or data-theme="dark": the inline boot script (themeBoot.ts) does it
// before the first paint, and the header's theme control keeps it in step afterwards.
// Storage can be missing, blocked or throw: every access is guarded, and a value that is
// not one of the three choices counts as System.

/**
 * The one localStorage key both apps read. Values: "light" or "dark"; absent means System.
 * themeBoot.ts holds the same key for the boot script (it cannot import this file: each
 * app's vite.config.ts imports it, outside the app's own TypeScript project); a test pins
 * the two equal.
 */
export const THEME_STORAGE_KEY = 'do.theme'

export type ThemeChoice = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

/** In the order the theme control lists them. */
export const THEME_CHOICES: readonly ThemeChoice[] = ['system', 'light', 'dark']

export const THEME_LABELS: Readonly<Record<ThemeChoice, string>> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

export function parseThemeChoice(raw: unknown): ThemeChoice {
  return raw === 'light' || raw === 'dark' ? raw : 'system'
}

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'setItem' | 'removeItem'>

/** The stored choice, or System when there is none, it is not a choice, or storage throws. */
export function readThemeChoice(storage: ReadableStorage | null): ThemeChoice {
  if (!storage) return 'system'
  try {
    return parseThemeChoice(storage.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'system'
  }
}

/** Stores the choice (System removes the key). False when storage is missing or throws. */
export function writeThemeChoice(storage: WritableStorage | null, choice: ThemeChoice): boolean {
  if (!storage) return false
  try {
    if (choice === 'system') storage.removeItem(THEME_STORAGE_KEY)
    else storage.setItem(THEME_STORAGE_KEY, choice)
    return true
  } catch {
    return false
  }
}

export function resolveTheme(choice: ThemeChoice, systemPrefersLight: boolean): ResolvedTheme {
  if (choice === 'system') return systemPrefersLight ? 'light' : 'dark'
  return choice
}

export function applyTheme(root: Pick<Element, 'setAttribute'>, theme: ResolvedTheme): void {
  root.setAttribute('data-theme', theme)
}

/** window.localStorage, or null where reading the property itself throws (blocked site data). */
export function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export const LIGHT_QUERY = '(prefers-color-scheme: light)'

export function systemPrefersLight(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(LIGHT_QUERY).matches
  } catch {
    return false
  }
}
