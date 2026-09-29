/**
 * Platform-agnostic storage interface
 *
 * Implementations:
 * - Web: IndexedDB wrapper
 * - Mobile: AsyncStorage wrapper
 */
export interface IStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
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
export declare class StorageService {
    private static instance;
    private storage;
    private constructor();
    /**
     * Initialize the storage service with a platform-specific implementation
     */
    static initialize(storage: IStorage): StorageService;
    /**
     * Get the singleton instance
     * @throws Error if not initialized
     */
    static getInstance(): StorageService;
    /**
     * Get a value from storage
     */
    get(key: string): Promise<string | null>;
    /**
     * Set a value in storage
     */
    set(key: string, value: string): Promise<void>;
    /**
     * Remove a value from storage
     */
    remove(key: string): Promise<void>;
    /**
     * Clear all values from storage
     */
    clear(): Promise<void>;
}
//# sourceMappingURL=StorageService.d.ts.map