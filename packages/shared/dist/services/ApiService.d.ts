import { SupabaseClient } from '@supabase/supabase-js';
import type { Article, Category, SearchResult, UserProfile, Bookmark, ReadingProgress } from '../types';
/**
 * ApiService - Facade pattern for Supabase operations
 * Provides a simple, consistent interface for all data operations
 */
export declare class ApiService {
    private static instance;
    private supabase;
    private constructor();
    /**
     * Initialize the API service (call once at app startup)
     */
    static initialize(supabaseUrl: string, supabaseKey: string): ApiService;
    /**
     * Get the singleton instance
     */
    static getInstance(): ApiService;
    /**
     * Get the Supabase client (for advanced use cases)
     */
    getClient(): SupabaseClient;
    /**
     * Get a single article by slug.
     * When `version` is given the lookup is scoped to that version (required now that
     * slugs are only unique per (game, version, slug), not globally). Omitting it keeps
     * the one-argument form working for callers that have not been made version-aware yet.
     */
    getArticle(slug: string, version?: string): Promise<Article | null>;
    /**
     * Get articles by category
     */
    getArticlesByCategory(category: string, game?: string, version?: string): Promise<Article[]>;
    /**
     * Get all articles for a game/version
     */
    getAllArticles(game?: string, version?: string): Promise<Article[]>;
    /**
     * Search articles using full-text search
     */
    searchArticles(query: string, game?: string, version?: string, limit?: number): Promise<SearchResult[]>;
    /**
     * Get related articles
     */
    getRelatedArticles(articleId: string, limit?: number): Promise<Article[]>;
    /**
     * Get all categories for a game/section
     */
    getCategories(game?: string, section?: string): Promise<Category[]>;
    /**
     * Get current user session
     */
    getSession(): Promise<{
        data: {
            session: import("@supabase/supabase-js").AuthSession;
        };
        error: null;
    } | {
        data: {
            session: null;
        };
        error: import("@supabase/supabase-js").AuthError;
    } | {
        data: {
            session: null;
        };
        error: null;
    }>;
    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback: (event: string, session: any) => void): {
        data: {
            subscription: import("@supabase/supabase-js").Subscription;
        };
    };
    /**
     * Sign in with email/password
     */
    signIn(email: string, password: string): Promise<import("@supabase/supabase-js").AuthTokenResponsePassword>;
    /**
     * Sign up with email/password
     */
    signUp(email: string, password: string, metadata?: {
        username?: string;
        display_name?: string;
    }, emailRedirectUrl?: string): Promise<import("@supabase/supabase-js").AuthResponse>;
    /**
     * Sign out
     */
    signOut(): Promise<{
        error: import("@supabase/supabase-js").AuthError | null;
    }>;
    /**
     * Send password reset email
     */
    sendPasswordResetEmail(email: string, redirectUrl: string): Promise<{
        data: {};
        error: null;
    } | {
        data: null;
        error: import("@supabase/supabase-js").AuthError;
    }>;
    /**
     * Resend verification email
     */
    resendVerificationEmail(email: string, redirectUrl: string): Promise<import("@supabase/supabase-js").AuthOtpResponse>;
    /**
     * Update password (called from reset page with valid token)
     */
    updatePassword(newPassword: string): Promise<import("@supabase/supabase-js").UserResponse>;
    /**
     * Sign in with OAuth (Discord, Google)
     */
    signInWithOAuth(provider: 'discord' | 'google', redirectTo?: string): Promise<import("@supabase/supabase-js").OAuthResponse>;
    /**
     * Get user profile
     */
    getUserProfile(userId: string): Promise<UserProfile | null>;
    /**
     * Update user profile
     */
    updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
    /**
     * Get user's bookmarks with article details
     */
    getBookmarks(userId: string): Promise<(Bookmark & {
        article: Article;
    })[]>;
    /**
     * Add bookmark
     */
    addBookmark(articleId: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
    /**
     * Remove bookmark
     */
    removeBookmark(articleId: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
    /**
     * Check if article is bookmarked
     */
    isBookmarked(articleId: string): Promise<boolean>;
    /**
     * Get reading progress for article
     */
    getReadingProgress(articleId: string): Promise<ReadingProgress | null>;
    /**
     * Update reading progress
     */
    updateReadingProgress(articleId: string, scrollPosition: number, completed?: boolean): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
}
//# sourceMappingURL=ApiService.d.ts.map