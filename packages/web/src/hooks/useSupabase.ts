/**
 * Custom React hooks for Supabase operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/supabase'
// @ts-ignore - Types are used in return types
import type { Article, Category } from '@dystopianwiki/shared'

// ============================================================================
// ARTICLES
// ============================================================================

/**
 * Fetch a single article by slug
 */
export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.getArticle(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!slug
  })
}

/**
 * Fetch articles by category
 */
export function useArticlesByCategory(
  category: string,
  game: string = 'pz',
  version: string = 'build-41'
) {
  return useQuery({
    queryKey: ['articles', 'category', game, version, category],
    queryFn: () => api.getArticlesByCategory(category, game, version),
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Fetch all articles for a game/version
 */
export function useAllArticles(game: string = 'pz', version: string = 'build-41') {
  return useQuery({
    queryKey: ['articles', 'all', game, version],
    queryFn: () => api.getAllArticles(game, version),
    staleTime: 10 * 60 * 1000 // 10 minutes for all articles
  })
}

/**
 * Search articles
 */
export function useSearchArticles(
  query: string,
  game?: string,
  version?: string
) {
  return useQuery({
    queryKey: ['articles', 'search', query, game, version],
    queryFn: () => api.searchArticles(query, game, version),
    enabled: query.length >= 2, // Only search if query is at least 2 chars
    staleTime: 2 * 60 * 1000 // 2 minutes for search results
  })
}

/**
 * Get related articles
 */
export function useRelatedArticles(articleId: string, limit: number = 5) {
  return useQuery({
    queryKey: ['articles', 'related', articleId, limit],
    queryFn: () => api.getRelatedArticles(articleId, limit),
    enabled: !!articleId,
    staleTime: 10 * 60 * 1000
  })
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Fetch categories for a game/section
 */
export function useCategories(game: string = 'pz', section: string = 'modding') {
  return useQuery({
    queryKey: ['categories', game, section],
    queryFn: () => api.getCategories(game, section),
    staleTime: 30 * 60 * 1000 // 30 minutes - categories rarely change
  })
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Get current session
 */
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => api.getSession(),
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    }
  })
}

/**
 * Sign out mutation
 */
export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] })
    }
  })
}

// ============================================================================
// BOOKMARKS
// ============================================================================

/**
 * Get user's bookmarks
 */
export function useBookmarks(userId?: string) {
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => api.getBookmarks(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000
  })
}

/**
 * Add bookmark mutation
 */
export function useAddBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => api.addBookmark(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    }
  })
}

/**
 * Remove bookmark mutation
 */
export function useRemoveBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => api.removeBookmark(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    }
  })
}

/**
 * Check if article is bookmarked
 */
export function useIsBookmarked(articleId: string) {
  return useQuery({
    queryKey: ['bookmark', 'check', articleId],
    queryFn: () => api.isBookmarked(articleId),
    enabled: !!articleId,
    staleTime: 1 * 60 * 1000
  })
}

// ============================================================================
// READING PROGRESS
// ============================================================================

/**
 * Get reading progress for an article
 */
export function useReadingProgress(articleId: string) {
  return useQuery({
    queryKey: ['reading-progress', articleId],
    queryFn: () => api.getReadingProgress(articleId),
    enabled: !!articleId,
    staleTime: 1 * 60 * 1000
  })
}

/**
 * Update reading progress mutation
 */
export function useUpdateReadingProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      articleId,
      scrollPosition,
      completed
    }: {
      articleId: string
      scrollPosition: number
      completed?: boolean
    }) => api.updateReadingProgress(articleId, scrollPosition, completed),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reading-progress', variables.articleId]
      })
    }
  })
}
