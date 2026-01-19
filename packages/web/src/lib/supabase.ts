/**
 * Supabase client initialization for web app
 */
import { ApiService } from '@dystopianwiki/shared'

// Initialize ApiService with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

// Initialize the singleton instance
export const api = ApiService.initialize(supabaseUrl, supabaseAnonKey)

// Export for convenience
export { ApiService }
