import { ApiService } from '@dystopianwiki/shared'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { IStorage } from '@dystopianwiki/shared'

// AsyncStorage adapter for shared StorageService
export class AsyncStorageAdapter implements IStorage {
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear()
  }
}

// Initialize Supabase with environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please check your .env file.'
  )
}

// Initialize ApiService
export const api = ApiService.initialize(supabaseUrl, supabaseAnonKey)

// Create storage adapter instance
export const storage = new AsyncStorageAdapter()
