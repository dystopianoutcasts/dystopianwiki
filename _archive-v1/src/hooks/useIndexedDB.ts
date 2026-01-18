/**
 * useIndexedDB Hook
 * Low-level hook for IndexedDB operations
 */

import { useState, useEffect, useCallback } from 'react';
import { CacheManager } from '../managers/CacheManager';

interface UseIndexedDBResult {
  isReady: boolean;
  error: Error | null;
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  clearExpired: () => Promise<void>;
}

/**
 * Hook for direct IndexedDB cache operations
 */
export function useIndexedDB(): UseIndexedDBResult {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    CacheManager.init()
      .then(() => setIsReady(true))
      .catch((err) => setError(err instanceof Error ? err : new Error('Failed to initialize IndexedDB')));
  }, []);

  const get = useCallback(async <T>(key: string): Promise<T | null> => {
    return CacheManager.get<T>(key);
  }, []);

  const set = useCallback(async <T>(key: string, value: T, ttl?: number): Promise<void> => {
    await CacheManager.set(key, value, ttl);
  }, []);

  const remove = useCallback(async (key: string): Promise<void> => {
    await CacheManager.delete(key);
  }, []);

  const clear = useCallback(async (): Promise<void> => {
    await CacheManager.clear();
  }, []);

  const clearExpired = useCallback(async (): Promise<void> => {
    await CacheManager.clearExpired();
  }, []);

  return {
    isReady,
    error,
    get,
    set,
    remove,
    clear,
    clearExpired,
  };
}

/**
 * Hook to periodically clear expired cache entries
 */
export function useCacheCleanup(intervalMs: number = 5 * 60 * 1000): void {
  useEffect(() => {
    // Initial cleanup
    CacheManager.clearExpired();

    // Periodic cleanup
    const interval = setInterval(() => {
      CacheManager.clearExpired();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}
