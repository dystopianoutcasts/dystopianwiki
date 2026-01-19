/**
 * User types matching Supabase auth and user_profiles schema
 */
export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  preferred_game: string
  theme: 'light' | 'dark'
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: number
  user_id: string
  article_id: string
  created_at: string
}

export interface ReadingProgress {
  id: number
  user_id: string
  article_id: string
  scroll_position: number
  completed: boolean
  last_read: string
}
