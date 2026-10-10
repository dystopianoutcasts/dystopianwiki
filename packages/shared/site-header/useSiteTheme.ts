// The theme control's state (KB15). The boot script has already set data-theme before the
// first paint; this keeps it in step when the visitor picks a theme, when the system
// setting changes under System, and when another tab of the site changes the choice.
import { useCallback, useEffect, useState } from 'react'
import {
  LIGHT_QUERY,
  THEME_STORAGE_KEY,
  applyTheme,
  browserStorage,
  parseThemeChoice,
  readThemeChoice,
  resolveTheme,
  systemPrefersLight,
  writeThemeChoice,
} from './theme'
import type { ResolvedTheme, ThemeChoice } from './theme'

export interface SiteTheme {
  choice: ThemeChoice
  resolved: ResolvedTheme
  choose: (choice: ThemeChoice) => void
}

export function useSiteTheme(): SiteTheme {
  const [choice, setChoice] = useState<ThemeChoice>(() => readThemeChoice(browserStorage()))
  const [prefersLight, setPrefersLight] = useState<boolean>(systemPrefersLight)
  const resolved = resolveTheme(choice, prefersLight)

  useEffect(() => {
    applyTheme(document.documentElement, resolved)
  }, [resolved])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    let query: MediaQueryList
    try {
      query = window.matchMedia(LIGHT_QUERY)
    } catch {
      return
    }
    const onChange = (event: MediaQueryListEvent) => setPrefersLight(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) setChoice(parseThemeChoice(event.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const choose = useCallback((next: ThemeChoice) => {
    setChoice(next)
    writeThemeChoice(browserStorage(), next)
  }, [])

  return { choice, resolved, choose }
}
