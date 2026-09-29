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
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Initialize the storage service with a platform-specific implementation
     */
    static initialize(storage) {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService(storage);
        }
        return StorageService.instance;
    }
    /**
     * Get the singleton instance
     * @throws Error if not initialized
     */
    static getInstance() {
        if (!StorageService.instance) {
            throw new Error('StorageService not initialized. Call StorageService.initialize() first.');
        }
        return StorageService.instance;
    }
    /**
     * Get a value from storage
     */
    async get(key) {
        return await this.storage.getItem(key);
    }
    /**
     * Set a value in storage
     */
    async set(key, value) {
        return await this.storage.setItem(key, value);
    }
    /**
     * Remove a value from storage
     */
    async remove(key) {
        return await this.storage.removeItem(key);
    }
    /**
     * Clear all values from storage
     */
    async clear() {
        return await this.storage.clear();
    }
}
