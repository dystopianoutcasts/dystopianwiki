import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import type { SavedStackNavProp } from '../navigation/types'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/supabase'
import { useHaptics } from '../hooks/useHaptics'
import type { Article, Bookmark } from '@dystopianwiki/shared'

type BookmarkWithArticle = Bookmark & { article: Article }

export function BookmarksScreen() {
  const navigation = useNavigation<SavedStackNavProp>()
  const { user } = useAuth()
  const haptics = useHaptics()
  const [bookmarks, setBookmarks] = useState<BookmarkWithArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchBookmarks = useCallback(async () => {
    if (!user) return

    try {
      const data = await api.getBookmarks(user.id)
      setBookmarks(data)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  // Fetch bookmarks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchBookmarks()
      }
    }, [user, fetchBookmarks])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchBookmarks()
  }, [fetchBookmarks])

  const handleRemoveBookmark = async (articleId: string, articleTitle: string) => {
    haptics.light() // Light haptic when opening alert
    Alert.alert(
      'Remove Bookmark',
      `Remove "${articleTitle}" from your bookmarks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(articleId)
            try {
              await api.removeBookmark(articleId)
              setBookmarks((prev) =>
                prev.filter((b) => b.article_id !== articleId)
              )
              haptics.success() // Success haptic after removal
            } catch (error) {
              console.error('Error removing bookmark:', error)
              haptics.error() // Error haptic on failure
              Alert.alert('Error', 'Failed to remove bookmark. Please try again.')
            } finally {
              setRemovingId(null)
            }
          },
        },
      ]
    )
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner':
        return theme.colors.success
      case 'intermediate':
        return theme.colors.warning
      case 'advanced':
        return theme.colors.error
      default:
        return theme.colors.textTertiary
    }
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔖</Text>
          <Text style={styles.emptyStateTitle}>Sign in to view bookmarks</Text>
          <Text style={styles.emptyStateText}>
            Create an account to save your favorite articles and access them
            anytime.
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent[500]} />
        <Text style={styles.loadingText}>Loading bookmarks...</Text>
      </View>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📚</Text>
          <Text style={styles.emptyStateTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyStateText}>
            Save articles you want to read later by tapping the bookmark icon.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}
          >
            <Text style={styles.browseButtonText}>Browse Articles</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.accent[500]}
          colors={[theme.colors.accent[500]]}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.header}>
          {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
        </Text>

        {bookmarks.map((bookmark) => (
          <TouchableOpacity
            key={bookmark.id}
            style={styles.bookmarkCard}
            onPress={() =>
              navigation.navigate('Article', { slug: bookmark.article.slug })
            }
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                {bookmark.article.difficulty && (
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor: getDifficultyColor(
                          bookmark.article.difficulty
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {bookmark.article.difficulty}
                    </Text>
                  </View>
                )}
                <Text style={styles.category}>{bookmark.article.category}</Text>
              </View>

              <Text style={styles.articleTitle}>{bookmark.article.title}</Text>

              {bookmark.article.excerpt && (
                <Text style={styles.excerpt} numberOfLines={2}>
                  {bookmark.article.excerpt}
                </Text>
              )}

              {bookmark.article.tags && bookmark.article.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {bookmark.article.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {bookmark.article.tags.length > 3 && (
                    <Text style={styles.moreTags}>
                      +{bookmark.article.tags.length - 3}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() =>
                handleRemoveBookmark(
                  bookmark.article_id,
                  bookmark.article.title
                )
              }
              disabled={removingId === bookmark.article_id}
            >
              {removingId === bookmark.article_id ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <Text style={styles.removeIcon}>✕</Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer spacing */}
      <View style={{ height: theme.spacing.xxl }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  signInButton: {
    backgroundColor: theme.colors.accent[500],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  signInButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  browseButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  browseButtonText: {
    ...theme.typography.button,
    color: theme.colors.accent[400],
  },
  bookmarkCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  difficultyText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    textTransform: 'capitalize',
    fontWeight: 'bold',
    fontSize: 10,
  },
  category: {
    ...theme.typography.caption,
    color: theme.colors.accent[400],
    textTransform: 'uppercase',
  },
  articleTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    fontSize: 16,
  },
  excerpt: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: theme.colors.surfaceHover,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
  },
  tagText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 10,
  },
  moreTags: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 10,
  },
  removeButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  removeIcon: {
    fontSize: 16,
    color: theme.colors.textTertiary,
  },
})
