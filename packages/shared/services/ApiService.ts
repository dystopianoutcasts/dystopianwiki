import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Article, Category, SearchResult, UserProfile, Bookmark, ReadingProgress } from '../types'

/**
 * ApiService - Facade pattern for Supabase operations
 * Provides a simple, consistent interface for all data operations
 */
export class ApiService {
  private static instance: ApiService
  private supabase: SupabaseClient

  private constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Initialize the API service (call once at app startup)
   */
  public static initialize(supabaseUrl: string, supabaseKey: string): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(supabaseUrl, supabaseKey)
    }
    return ApiService.instance
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      throw new Error('ApiService not initialized. Call initialize() first.')
    }
    return ApiService.instance
  }

  /**
   * Get the Supabase client (for advanced use cases)
   */
  public getClient(): SupabaseClient {
    return this.supabase
  }

  // ============================================================================
  // ARTICLES
  // ============================================================================

  /**
   * Get a single article by slug
   */
  async getArticle(slug: string): Promise<Article | null> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching article:', error)
      return null
    }

    return data as Article
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(
    category: string,
    game: string = 'pz',
    version: string = 'build-41'
  ): Promise<Article[]> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*')
      .eq('game', game)
      .eq('version', version)
      .eq('category', category)
      .order('title')

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    return data as Article[]
  }

  /**
   * Get all articles for a game/version
   */
  async getAllArticles(game: string = 'pz', version: string = 'build-41'): Promise<Article[]> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*')
      .eq('game', game)
      .eq('version', version)
      .order('category')
      .order('title')

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    return data as Article[]
  }

  /**
   * Search articles using full-text search
   */
  async searchArticles(
    query: string,
    game?: string,
    version?: string,
    limit: number = 20
  ): Promise<SearchResult[]> {
    // Use the PostgreSQL function we created
    const { data, error } = await this.supabase.rpc('search_articles', {
      p_query: query,
      p_game: game || null,
      p_version: version || null,
      p_limit: limit
    })

    if (error) {
      console.error('Error searching articles:', error)
      return []
    }

    return data as SearchResult[]
  }

  /**
   * Get related articles
   */
  async getRelatedArticles(articleId: string, limit: number = 5): Promise<Article[]> {
    const { data, error } = await this.supabase.rpc('get_related_articles', {
      p_article_id: articleId,
      p_limit: limit
    })

    if (error) {
      console.error('Error fetching related articles:', error)
      return []
    }

    return data as Article[]
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  /**
   * Get all categories for a game/section
   */
  async getCategories(game: string = 'pz', section: string = 'modding'): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('game', game)
      .eq('section', section)
      .order('display_order')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data as Category[]
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Get current user session
   */
  async getSession() {
    return await this.supabase.auth.getSession()
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Sign in with email/password
   */
  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password })
  }

  /**
   * Sign up with email/password
   */
  async signUp(email: string, password: string, metadata?: {
    username?: string
    display_name?: string
  }, emailRedirectUrl?: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // Passed to handle_new_user() trigger
        emailRedirectTo: emailRedirectUrl
      }
    })
  }

  /**
   * Sign out
   */
  async signOut() {
    return await this.supabase.auth.signOut()
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, redirectUrl: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string, redirectUrl: string) {
    return await this.supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    })
  }

  /**
   * Update password (called from reset page with valid token)
   */
  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({
      password: newPassword
    })
  }

  /**
   * Sign in with OAuth (Discord, Google)
   */
  async signInWithOAuth(provider: 'discord' | 'google', redirectTo?: string) {
    return await this.supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo }
    })
  }

  // ============================================================================
  // USER PROFILE
  // ============================================================================

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data as UserProfile
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    return await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
  }

  // ============================================================================
  // BOOKMARKS
  // ============================================================================

  /**
   * Get user's bookmarks with article details
   */
  async getBookmarks(userId: string): Promise<(Bookmark & { article: Article })[]> {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select(`
        *,
        article:articles(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
      return []
    }

    return data as (Bookmark & { article: Article })[]
  }

  /**
   * Add bookmark
   */
  async addBookmark(articleId: string) {
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    return await this.supabase
      .from('bookmarks')
      .insert({ article_id: articleId, user_id: session.user.id })
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(articleId: string) {
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    return await this.supabase
      .from('bookmarks')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', session.user.id)
  }

  /**
   * Check if article is bookmarked
   */
  async isBookmarked(articleId: string): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session) return false

    const { data } = await this.supabase
      .from('bookmarks')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', session.user.id)
      .single()

    return !!data
  }

  // ============================================================================
  // READING PROGRESS
  // ============================================================================

  /**
   * Get reading progress for article
   */
  async getReadingProgress(articleId: string): Promise<ReadingProgress | null> {
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session) return null

    const { data, error } = await this.supabase
      .from('reading_progress')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', session.user.id)
      .single()

    if (error) return null
    return data as ReadingProgress
  }

  /**
   * Update reading progress
   */
  async updateReadingProgress(articleId: string, scrollPosition: number, completed: boolean = false) {
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    return await this.supabase
      .from('reading_progress')
      .upsert({
        article_id: articleId,
        user_id: session.user.id,
        scroll_position: scrollPosition,
        completed,
        last_read: new Date().toISOString()
      })
  }
}
