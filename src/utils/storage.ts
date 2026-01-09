/**
 * localStorage wrapper with prefix and JSON serialization
 * Adapted from personal website patterns
 */

const STORAGE_PREFIX = 'pz-wiki-';

/**
 * Get a value from localStorage with automatic JSON parsing
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set a value in localStorage with automatic JSON serialization
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing localStorage key "${key}":`, error);
  }
}

/**
 * Remove a value from localStorage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all wiki-related items from localStorage
 */
export function clearStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
  }
}

/**
 * Storage keys used throughout the app
 */
export const StorageKeys = {
  THEME: 'theme',
  VERSION: 'selected-version',
  RECENT_SEARCHES: 'recent-searches',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  CACHE_TIMESTAMP: 'cache-timestamp',
  LEARNING_PROGRESS: 'learning-progress',
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
