/**
 * CacheManager - IndexedDB caching for wiki data
 * Provides persistent client-side caching with TTL support
 */

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'pz-wiki-cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  contentHash?: string; // Hash of content for invalidation
}

// Default TTL: 1 hour
const DEFAULT_TTL = 60 * 60 * 1000;

// Cache TTLs for different data types
export const CACHE_TTLS = {
  versions: 24 * 60 * 60 * 1000,      // 24 hours
  sections: 24 * 60 * 60 * 1000,      // 24 hours
  categories: 12 * 60 * 60 * 1000,    // 12 hours
  articles: 6 * 60 * 60 * 1000,       // 6 hours
  searchIndex: 24 * 60 * 60 * 1000,   // 24 hours
} as const;

// Memory cache (module level for fallback)
const memoryCache = new Map<string, CacheEntry>();

class CacheManagerClass {
  private db: IDBPDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initializeDB();
    return this.initPromise;
  }

  private async initializeDB(): Promise<void> {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create cache store if it doesn't exist
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp');
          }
        },
      });
    } catch (error) {
      console.warn('IndexedDB initialization failed, falling back to memory cache:', error);
      // Continue without IndexedDB - will use memory cache only
    }
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    await this.init();

    if (!this.db) {
      return this.getFromMemory<T>(key);
    }

    try {
      const entry = await this.db.get(STORE_NAME, key) as CacheEntry<T> | undefined;

      if (!entry) {
        return null;
      }

      // Check if entry has expired
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        // Entry expired, delete it
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return this.getFromMemory<T>(key);
    }
  }

  /**
   * Set data in cache with TTL and optional content hash
   */
  async set<T>(key: string, data: T, ttl: number = DEFAULT_TTL, contentHash?: string): Promise<void> {
    await this.init();

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
      contentHash,
    };

    // Always store in memory as backup
    this.setInMemory(key, entry);

    if (!this.db) {
      return;
    }

    try {
      await this.db.put(STORE_NAME, entry);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  /**
   * Delete a specific cache entry
   */
  async delete(key: string): Promise<void> {
    this.deleteFromMemory(key);

    if (!this.db) {
      return;
    }

    try {
      await this.db.delete(STORE_NAME, key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.clearMemory();

    if (!this.db) {
      return;
    }

    try {
      await this.db.clear(STORE_NAME);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Get content hash for a cached entry
   */
  async getContentHash(key: string): Promise<string | null> {
    await this.init();

    if (!this.db) {
      const entry = memoryCache.get(key);
      return entry?.contentHash ?? null;
    }

    try {
      const entry = await this.db.get(STORE_NAME, key) as CacheEntry | undefined;
      return entry?.contentHash ?? null;
    } catch (error) {
      console.warn('Cache getContentHash error:', error);
      return null;
    }
  }

  /**
   * Bulk delete multiple cache entries by keys
   */
  async invalidateByKeys(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    // Clear from memory cache
    for (const key of keys) {
      this.deleteFromMemory(key);
    }

    if (!this.db) {
      return;
    }

    try {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      await Promise.all(keys.map(key => store.delete(key)));
      await tx.done;
    } catch (error) {
      console.warn('Cache invalidateByKeys error:', error);
    }
  }

  /**
   * Get all cache keys (for manifest comparison)
   */
  async getAllKeys(): Promise<string[]> {
    await this.init();

    if (!this.db) {
      return Array.from(memoryCache.keys());
    }

    try {
      return await this.db.getAllKeys(STORE_NAME) as string[];
    } catch (error) {
      console.warn('Cache getAllKeys error:', error);
      return Array.from(memoryCache.keys());
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const now = Date.now();

      let cursor = await store.openCursor();
      while (cursor) {
        const entry = cursor.value as CacheEntry;
        if (now - entry.timestamp > entry.ttl) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
    } catch (error) {
      console.warn('Cache clearExpired error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ count: number; oldestTimestamp: number | null }> {
    if (!this.db) {
      return { count: memoryCache.size, oldestTimestamp: null };
    }

    try {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const count = await store.count();

      const index = store.index('timestamp');
      const cursor = await index.openCursor();
      const oldestTimestamp = cursor ? (cursor.value as CacheEntry).timestamp : null;

      return { count, oldestTimestamp };
    } catch (error) {
      console.warn('Cache getStats error:', error);
      return { count: 0, oldestTimestamp: null };
    }
  }

  // Memory cache fallback methods (use module-level memoryCache)
  private getFromMemory<T>(key: string): T | null {
    const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setInMemory<T>(key: string, entry: CacheEntry<T>): void {
    memoryCache.set(key, entry as CacheEntry);
  }

  private deleteFromMemory(key: string): void {
    memoryCache.delete(key);
  }

  private clearMemory(): void {
    memoryCache.clear();
  }
}

// Export singleton instance
export const CacheManager = new CacheManagerClass();

// Helper function to generate cache keys
export function getCacheKey(type: string, ...parts: string[]): string {
  return [type, ...parts].filter(Boolean).join(':');
}
