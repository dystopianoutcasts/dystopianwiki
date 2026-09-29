import type { SearchResult } from '../types';
export interface EnhancedSearchOptions {
    game?: string;
    version?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    limit?: number;
    expandSynonyms?: boolean;
}
export interface PopularQuery {
    id: string;
    query: string;
    normalized_query: string;
    search_count: number;
    result_count: number;
    last_searched: string;
    created_at: string;
}
export declare class SearchService {
    private static instance;
    private constructor();
    static getInstance(): SearchService;
    /**
     * Parse a natural language question into search keywords
     * "How do I mod vehicles in Project Zomboid?" -> "mod vehicles project zomboid"
     */
    parseQuestion(query: string): string;
    /**
     * Expand a query with synonyms
     * "vehicle modding" -> "vehicle vehicles car cars truck modding mod mods"
     */
    expandWithSynonyms(query: string): string;
    /**
     * Normalize a query for storage/comparison
     * Removes punctuation, lowercases, and sorts words alphabetically
     */
    normalizeQuery(query: string): string;
    /**
     * Enhanced search that handles questions and expands synonyms
     */
    search(query: string, options?: EnhancedSearchOptions): Promise<SearchResult[]>;
    /**
     * Get search suggestions based on partial input
     * Returns popular queries that match the input prefix
     */
    getSuggestions(partialQuery: string, limit?: number): Promise<string[]>;
    /**
     * Record a search query for popularity tracking
     * Called after a successful search to build the autocomplete database
     */
    recordQuery(query: string, resultCount: number): Promise<void>;
    /**
     * Get trending/popular queries
     */
    getPopularQueries(limit?: number): Promise<string[]>;
}
export declare const searchService: SearchService;
//# sourceMappingURL=SearchService.d.ts.map