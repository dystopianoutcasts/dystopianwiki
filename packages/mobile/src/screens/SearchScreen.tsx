import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { SearchStackNavProp } from '../navigation/types'
import { theme, colors, accent, spacing, radius } from '../theme'
import { api } from '../lib/supabase'
import { useHaptics } from '../hooks/useHaptics'
import { searchService } from '@dystopianwiki/shared'
import type { SearchResult, Article } from '@dystopianwiki/shared'

// Filter options for difficulty
const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]

// Category filters (will be loaded dynamically but start with common ones)
const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Categories' },
  { id: 'lua-api', label: 'Lua API' },
  { id: 'items', label: 'Items' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'weapon-repair', label: 'Weapon Repair' },
  { id: 'tools', label: 'Tools' },
]

export function SearchScreen() {
  const navigation = useNavigation<SearchStackNavProp>()
  const haptics = useHaptics()

  // Search state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Discover state (default view)
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [discoverLoading, setDiscoverLoading] = useState(true)

  // Filter state
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent articles on mount
  useEffect(() => {
    loadRecentArticles()
  }, [])

  const loadRecentArticles = async () => {
    try {
      const articles = await api.getAllArticles('pz', 'build-41')
      // Sort by most recent (assuming they have created_at or just take first 10)
      setRecentArticles(articles.slice(0, 10))
    } catch (error) {
      console.error('Error loading recent articles:', error)
    } finally {
      setDiscoverLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      // Clear search and show discover
      setSearched(false)
      setResults([])
      return
    }

    Keyboard.dismiss()
    setShowSuggestions(false)
    haptics.light()
    setLoading(true)
    setSearched(true)

    try {
      // Use the enhanced SearchService with question parsing and synonym expansion
      const data = await searchService.search(query.trim(), {
        game: 'pz',
        version: 'build-41',
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty as 'beginner' | 'intermediate' | 'advanced' : undefined,
        limit: 30,
        expandSynonyms: true,
      })

      setResults(data)

      // Record successful queries for autocomplete (non-blocking)
      if (data.length > 0) {
        searchService.recordQuery(query.trim(), data.length).catch(() => {
          // Silently fail - this is not critical
        })
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced autocomplete suggestions
  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const results = await searchService.getSuggestions(text, 5)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch (error) {
      // Silently fail
      setSuggestions([])
    }
  }, [])

  const handleQueryChange = (text: string) => {
    setQuery(text)

    // Debounce autocomplete requests
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(text)
    }, 300)
  }

  const handleSuggestionPress = (suggestion: string) => {
    haptics.selection()
    setQuery(suggestion)
    setShowSuggestions(false)
    // Trigger search after setting the query
    setTimeout(() => {
      handleSearch()
    }, 0)
  }

  // Re-search when filters change (if already searched)
  useEffect(() => {
    if (searched && query.trim()) {
      handleSearch()
    }
  }, [selectedDifficulty, selectedCategory])

  const handleFilterPress = (type: 'difficulty' | 'category', value: string) => {
    haptics.selection()
    if (type === 'difficulty') {
      setSelectedDifficulty(value)
    } else {
      setSelectedCategory(value)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearched(false)
    setResults([])
    setSelectedDifficulty('all')
    setSelectedCategory('all')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner':
        return colors.status.success
      case 'intermediate':
        return colors.status.warning
      case 'advanced':
        return colors.status.error
      default:
        return colors.text.muted
    }
  }

  const renderArticleCard = ({ item }: { item: Article | SearchResult }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => {
        haptics.light()
        navigation.navigate('Article', { slug: item.slug })
      }}
      activeOpacity={0.7}
    >
      <View style={styles.articleHeader}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.difficulty && (
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        )}
      </View>
      {item.excerpt && (
        <Text style={styles.articleExcerpt} numberOfLines={2}>
          {item.excerpt}
        </Text>
      )}
      <View style={styles.articleMeta}>
        <Text style={styles.articleCategory}>{item.category}</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  const renderFilterChip = (
    filter: { id: string; label: string },
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={filter.id}
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  )

  const renderDiscoverContent = () => (
    <ScrollView style={styles.discoverContainer} showsVerticalScrollIndicator={false}>
      {/* Search Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Search Tips</Text>
        <Text style={styles.tipsText}>
          Try searching with questions like "How do I create items?" or keywords like "weapon repair lua"
        </Text>
      </View>

      {/* Recent Articles */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>RECENT ARTICLES</Text>
        {discoverLoading ? (
          <ActivityIndicator size="small" color={accent[500]} style={{ marginTop: spacing.lg }} />
        ) : recentArticles.length > 0 ? (
          recentArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => {
                haptics.light()
                navigation.navigate('Article', { slug: article.slug })
              }}
              activeOpacity={0.7}
            >
              <View style={styles.articleHeader}>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                {article.difficulty && (
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(article.difficulty) },
                    ]}
                  >
                    <Text style={styles.difficultyText}>{article.difficulty}</Text>
                  </View>
                )}
              </View>
              {article.excerpt && (
                <Text style={styles.articleExcerpt} numberOfLines={2}>
                  {article.excerpt}
                </Text>
              )}
              <Text style={styles.articleCategory}>{article.category}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No articles found</Text>
        )}
      </View>

      {/* Popular Tags */}
      <View style={styles.tagsSection}>
        <Text style={styles.sectionTitle}>POPULAR TOPICS</Text>
        <View style={styles.popularTagsRow}>
          {['lua', 'items', 'recipes', 'weapons', 'repair', 'crafting', 'foraging'].map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.popularTag}
              onPress={() => {
                setQuery(tag)
                haptics.light()
              }}
            >
              <Text style={styles.popularTagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: spacing.xxl * 2 }} />
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search or ask a question..."
            placeholderTextColor={colors.text.muted}
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={handleSearch}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true)
            }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle */}
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => {
            haptics.light()
            setShowFilters(!showFilters)
          }}
        >
          <Text style={styles.filterToggleText}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionIcon}>🔍</Text>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Filters (collapsible) */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Difficulty Filters */}
          <Text style={styles.filterLabel}>Difficulty</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {DIFFICULTY_FILTERS.map((filter) =>
              renderFilterChip(
                filter,
                selectedDifficulty === filter.id,
                () => handleFilterPress('difficulty', filter.id)
              )
            )}
          </ScrollView>

          {/* Category Filters */}
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {CATEGORY_FILTERS.map((filter) =>
              renderFilterChip(
                filter,
                selectedCategory === filter.id,
                () => handleFilterPress('category', filter.id)
              )
            )}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent[500]} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searched ? (
        <FlatList
          data={results}
          renderItem={renderArticleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                Try different keywords or adjust your filters
              </Text>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearSearch}>
                <Text style={styles.clearFiltersText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultsCount}>
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </Text>
            ) : null
          }
        />
      ) : (
        renderDiscoverContent()
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },

  // Search Header
  searchHeader: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.bg.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    ...theme.typography.body,
    color: colors.text.primary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.text.muted,
  },
  filterToggle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleActive: {
    backgroundColor: accent[500],
    borderColor: accent[500],
  },
  filterToggleText: {
    fontSize: 18,
  },

  // Autocomplete Suggestions
  suggestionsContainer: {
    backgroundColor: colors.bg.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  suggestionIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
    opacity: 0.6,
  },
  suggestionText: {
    ...theme.typography.body,
    color: colors.text.primary,
  },

  // Filters
  filtersContainer: {
    backgroundColor: colors.bg.surface1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  filterLabel: {
    ...theme.typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.bg.surface2,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterChipSelected: {
    backgroundColor: accent[500],
    borderColor: accent[500],
  },
  filterChipText: {
    ...theme.typography.bodySmall,
    color: colors.text.secondary,
  },
  filterChipTextSelected: {
    color: colors.text.primary,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  // Results List
  listContent: {
    padding: spacing.md,
  },
  resultsCount: {
    ...theme.typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },

  // Article Card
  articleCard: {
    backgroundColor: colors.bg.surface1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  articleTitle: {
    ...theme.typography.h4,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  difficultyText: {
    ...theme.typography.caption,
    color: colors.bg.base,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  articleExcerpt: {
    ...theme.typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleCategory: {
    ...theme.typography.caption,
    color: accent[400],
    textTransform: 'uppercase',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.bg.surface2,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: {
    ...theme.typography.caption,
    color: colors.text.muted,
    fontSize: 10,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  clearFiltersButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  clearFiltersText: {
    ...theme.typography.button,
    color: accent[400],
  },

  // Discover Content
  discoverContainer: {
    flex: 1,
  },
  tipsSection: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderLeftWidth: 3,
    borderLeftColor: accent[500],
  },
  tipsTitle: {
    ...theme.typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tipsText: {
    ...theme.typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  recentSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  tagsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  popularTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  popularTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  popularTagText: {
    ...theme.typography.bodySmall,
    color: accent[400],
  },
})
