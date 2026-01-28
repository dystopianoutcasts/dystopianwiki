import type { SearchResult, Article } from '../types'
import { ApiService } from './ApiService'

/**
 * SearchService - Enhanced search with question parsing and synonym expansion
 * Provides "semantic-like" search without AI/embeddings
 */

// Common question words to strip from queries
const QUESTION_WORDS = [
  'how', 'what', 'where', 'when', 'why', 'which', 'who', 'whom',
  'can', 'could', 'would', 'should', 'do', 'does', 'did', 'is', 'are', 'was', 'were',
  'i', 'me', 'my', 'we', 'our', 'you', 'your',
  'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'at', 'with', 'by',
  'get', 'make', 'create', 'find', 'use', 'need', 'want', 'help',
  'please', 'thanks', 'thank', 'im', "i'm", 'stuck'
]

// Synonym mappings for Project Zomboid modding terminology
const SYNONYM_MAP: Record<string, string[]> = {
  // Items and objects
  'item': ['items', 'object', 'objects', 'thing', 'things', 'gear', 'equipment'],
  'weapon': ['weapons', 'gun', 'guns', 'melee', 'firearm', 'firearms', 'axe', 'knife', 'bat'],
  'tool': ['tools', 'equipment', 'utility', 'utilities'],
  'vehicle': ['vehicles', 'car', 'cars', 'truck', 'trucks', 'van', 'vans', 'driving'],
  'clothing': ['clothes', 'outfit', 'outfits', 'armor', 'armour', 'wearable', 'wearables'],

  // Crafting and recipes
  'recipe': ['recipes', 'crafting', 'craft', 'create', 'make', 'build', 'construction'],
  'crafting': ['craft', 'recipes', 'recipe', 'make', 'making', 'build', 'building'],

  // UI and visuals
  'ui': ['interface', 'gui', 'menu', 'menus', 'hud', 'screen', 'window', 'panel'],
  'style': ['styling', 'css', 'design', 'look', 'appearance', 'visual', 'visuals', 'theme'],
  'texture': ['textures', 'sprite', 'sprites', 'image', 'images', 'icon', 'icons', 'graphic'],

  // Code and scripting
  'lua': ['script', 'scripts', 'scripting', 'code', 'coding', 'programming'],
  'function': ['functions', 'method', 'methods', 'func', 'funcs', 'callback'],
  'event': ['events', 'hook', 'hooks', 'trigger', 'triggers', 'listener', 'listeners'],
  'api': ['apis', 'interface', 'reference', 'documentation', 'docs'],

  // Game mechanics
  'zombie': ['zombies', 'zed', 'zeds', 'infected', 'undead', 'walker', 'walkers'],
  'survivor': ['survivors', 'player', 'players', 'character', 'characters', 'npc', 'npcs'],
  'skill': ['skills', 'perk', 'perks', 'trait', 'traits', 'ability', 'abilities'],
  'map': ['maps', 'world', 'terrain', 'location', 'locations', 'area', 'areas', 'zone'],

  // Modding specific
  'mod': ['mods', 'modding', 'modification', 'modifications', 'addon', 'addons'],
  'install': ['installation', 'installing', 'setup', 'configure', 'configuration'],
  'fix': ['fixing', 'repair', 'repairing', 'solve', 'solving', 'debug', 'debugging', 'error'],
  'error': ['errors', 'bug', 'bugs', 'issue', 'issues', 'problem', 'problems', 'crash'],

  // Actions
  'add': ['adding', 'create', 'creating', 'new', 'insert', 'inserting'],
  'remove': ['removing', 'delete', 'deleting', 'clear', 'clearing'],
  'change': ['changing', 'modify', 'modifying', 'edit', 'editing', 'update', 'updating'],

  // Difficulty related
  'beginner': ['beginners', 'start', 'starting', 'basic', 'basics', 'intro', 'introduction', 'easy', 'simple', 'newbie'],
  'advanced': ['expert', 'complex', 'complicated', 'difficult', 'hard', 'pro'],
}

// Build reverse lookup for faster synonym resolution
const REVERSE_SYNONYM_MAP: Record<string, string> = {}
for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
  for (const synonym of synonyms) {
    REVERSE_SYNONYM_MAP[synonym.toLowerCase()] = canonical
  }
}

export interface EnhancedSearchOptions {
  game?: string
  version?: string
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  limit?: number
  expandSynonyms?: boolean
}

export interface PopularQuery {
  id: string
  query: string
  normalized_query: string
  search_count: number
  result_count: number
  last_searched: string
  created_at: string
}

export class SearchService {
  private static instance: SearchService

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  /**
   * Parse a natural language question into search keywords
   * "How do I mod vehicles in Project Zomboid?" -> "mod vehicles project zomboid"
   */
  parseQuestion(query: string): string {
    // Lowercase and clean up
    let cleaned = query.toLowerCase().trim()

    // Remove punctuation except hyphens in compound words
    cleaned = cleaned.replace(/[^\w\s-]/g, ' ')

    // Split into words
    const words = cleaned.split(/\s+/).filter(word => word.length > 0)

    // Remove question words and common filler words
    const meaningful = words.filter(word =>
      !QUESTION_WORDS.includes(word) && word.length > 1
    )

    return meaningful.join(' ')
  }

  /**
   * Expand a query with synonyms
   * "vehicle modding" -> "vehicle vehicles car cars truck modding mod mods"
   */
  expandWithSynonyms(query: string): string {
    const words = query.toLowerCase().split(/\s+/)
    const expanded = new Set<string>(words)

    for (const word of words) {
      // Check if word is a canonical term with synonyms
      if (SYNONYM_MAP[word]) {
        for (const synonym of SYNONYM_MAP[word]) {
          expanded.add(synonym)
        }
      }

      // Check if word is a synonym that maps to a canonical term
      if (REVERSE_SYNONYM_MAP[word]) {
        const canonical = REVERSE_SYNONYM_MAP[word]
        expanded.add(canonical)
        // Also add all synonyms of that canonical term
        if (SYNONYM_MAP[canonical]) {
          for (const synonym of SYNONYM_MAP[canonical]) {
            expanded.add(synonym)
          }
        }
      }
    }

    return Array.from(expanded).join(' ')
  }

  /**
   * Normalize a query for storage/comparison
   * Removes punctuation, lowercases, and sorts words alphabetically
   */
  normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0)
      .sort()
      .join(' ')
  }

  /**
   * Enhanced search that handles questions and expands synonyms
   */
  async search(
    query: string,
    options: EnhancedSearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      game = 'pz',
      version = 'build-41',
      category,
      difficulty,
      limit = 20,
      expandSynonyms = true
    } = options

    // Parse question into keywords
    let searchQuery = this.parseQuestion(query)

    // If nothing meaningful remains, use original (trimmed)
    if (searchQuery.length === 0) {
      searchQuery = query.trim()
    }

    // Expand with synonyms if enabled
    if (expandSynonyms && searchQuery.length > 0) {
      searchQuery = this.expandWithSynonyms(searchQuery)
    }

    // Get API service and perform search
    const api = ApiService.getInstance()
    let results = await api.searchArticles(searchQuery, game, version, limit * 2)

    // Apply additional filters
    if (category && category !== 'all') {
      results = results.filter(r => r.category === category)
    }

    if (difficulty && difficulty !== 'all' as any) {
      results = results.filter(r => r.difficulty === difficulty)
    }

    // Return limited results
    return results.slice(0, limit)
  }

  /**
   * Get search suggestions based on partial input
   * Returns popular queries that match the input prefix
   */
  async getSuggestions(
    partialQuery: string,
    limit: number = 5
  ): Promise<string[]> {
    if (partialQuery.length < 2) {
      return []
    }

    const api = ApiService.getInstance()
    const client = api.getClient()

    // Search popular_queries table for matching queries
    const { data, error } = await client
      .from('popular_queries')
      .select('query')
      .ilike('query', `${partialQuery}%`)
      .gt('result_count', 0) // Only suggest queries that produced results
      .order('search_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching suggestions:', error)
      return []
    }

    return data?.map(d => d.query) || []
  }

  /**
   * Record a search query for popularity tracking
   * Called after a successful search to build the autocomplete database
   */
  async recordQuery(query: string, resultCount: number): Promise<void> {
    // Don't record empty or very short queries
    if (query.trim().length < 3) {
      return
    }

    // Don't record queries with no results
    if (resultCount === 0) {
      return
    }

    const normalized = this.normalizeQuery(query)

    const api = ApiService.getInstance()
    const client = api.getClient()

    // Upsert into popular_queries table
    const { error } = await client
      .from('popular_queries')
      .upsert({
        query: query.trim().toLowerCase(),
        normalized_query: normalized,
        result_count: resultCount,
        last_searched: new Date().toISOString()
      }, {
        onConflict: 'normalized_query',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      // Log but don't throw - this is a non-critical operation
      console.error('Error recording query:', error)
    }

    // Increment search count via RPC if available
    try {
      await client.rpc('increment_query_count', {
        p_normalized_query: normalized
      })
    } catch {
      // RPC might not exist yet, that's okay
    }
  }

  /**
   * Get trending/popular queries
   */
  async getPopularQueries(limit: number = 10): Promise<string[]> {
    const api = ApiService.getInstance()
    const client = api.getClient()

    const { data, error } = await client
      .from('popular_queries')
      .select('query')
      .gt('result_count', 0)
      .order('search_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular queries:', error)
      return []
    }

    return data?.map(d => d.query) || []
  }
}

// Export singleton getter for convenience
export const searchService = SearchService.getInstance()
