import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, StorageKeys } from '../utils/storage';
import type { Theme } from '../types/wiki';

/**
 * Hook for managing theme state
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check stored preference first
    const stored = getStorageItem<Theme>(StorageKeys.THEME, 'system');
    if (stored !== 'system') return stored;

    // Fall back to system preference, default to dark
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Apply theme to document
  // Default (no attribute) = dark theme, [data-theme="light"] = light theme
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const storedTheme = getStorageItem<Theme>(StorageKeys.THEME, 'system');
    if (storedTheme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeState(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setStorageItem(StorageKeys.THEME, newTheme);

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    } else {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
