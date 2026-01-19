/**
 * Article type matching Supabase database schema
 */
export interface Article {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null

  // Hierarchy
  game: string
  version: string
  section: string
  category: string
  subcategory: string | null

  // Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  tags: string[]

  // Relationships
  related_articles: string[]
  table_of_contents: TOCItem[]
  next_steps: NextStep[]

  // Timestamps
  last_updated: string
  created_at: string

  // ETag for cache validation
  etag: string
}

export interface TOCItem {
  id: string
  text: string
  level: number
}

export interface NextStep {
  title: string
  path: string
  description?: string
}

export interface Category {
  id: string
  game: string
  section: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  article_count: number
  created_at: string
}

export interface SearchResult {
  id: string
  slug: string
  title: string
  excerpt: string | null
  game: string
  version: string
  section: string
  category: string
  rank: number
}
