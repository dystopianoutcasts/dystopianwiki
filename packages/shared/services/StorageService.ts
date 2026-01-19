/**
 * Platform-agnostic storage interface
 *
 * Implementations:
 * - Web: IndexedDB wrapper
 * - Mobile: AsyncStorage wrapper
 */
export interface IStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * Platform-agnostic storage service
 *
 * Usage:
 * ```typescript
 * // Initialize with platform-specific implementation
 * const storage = new WebStorageAdapter() // or new AsyncStorageAdapter()
 * StorageService.initialize(storage)
 *
 * // Use anywhere in the app
 * const service = StorageService.getInstance()
 * await service.set('key', 'value')
 * const value = await service.get('key')
 * ```
 */
export class StorageService {
  private static instance: StorageService
  private storage: IStorage

  private constructor(storage: IStorage) {
    this.storage = storage
  }

  /**
   * Initialize the storage service with a platform-specific implementation
   */
  static initialize(storage: IStorage): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(storage)
    }
    return StorageService.instance
  }

  /**
   * Get the singleton instance
   * @throws Error if not initialized
   */
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      throw new Error('StorageService not initialized. Call StorageService.initialize() first.')
    }
    return StorageService.instance
  }

  /**
   * Get a value from storage
   */
  async get(key: string): Promise<string | null> {
    return await this.storage.getItem(key)
  }

  /**
   * Set a value in storage
   */
  async set(key: string, value: string): Promise<void> {
    return await this.storage.setItem(key, value)
  }

  /**
   * Remove a value from storage
   */
  async remove(key: string): Promise<void> {
    return await this.storage.removeItem(key)
  }

  /**
   * Clear all values from storage
   */
  async clear(): Promise<void> {
    return await this.storage.clear()
  }
}
