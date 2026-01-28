import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Markdown from 'react-native-markdown-display'
import type { HomeStackNavProp, ArticleRouteProp } from '../navigation/types'
import { theme } from '../theme'
import { api } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useHaptics } from '../hooks/useHaptics'
import type { Article } from '@dystopianwiki/shared'

export function ArticleScreen() {
  const navigation = useNavigation<HomeStackNavProp>()
  const route = useRoute<ArticleRouteProp>()
  const { slug } = route.params!
  const { user } = useAuth()
  const haptics = useHaptics()

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    fetchArticle()
  }, [slug])

  // Check bookmark status once article is loaded and user is authenticated
  useEffect(() => {
    if (user && article) {
      checkBookmark(article.id)
    }
  }, [user, article])

  const fetchArticle = async () => {
    try {
      const data = await api.getArticle(slug)
      setArticle(data)
      if (data) {
        navigation.setOptions({ title: data.title })
      }
    } catch (error) {
      console.error('Error fetching article:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkBookmark = async (articleId: string) => {
    try {
      const bookmarked = await api.isBookmarked(articleId)
      setIsBookmarked(bookmarked)
    } catch (error) {
      console.error('Error checking bookmark:', error)
    }
  }

  const toggleBookmark = async () => {
    if (!user || !article) return

    setBookmarkLoading(true)
    try {
      if (isBookmarked) {
        await api.removeBookmark(article.id)
        setIsBookmarked(false)
        haptics.medium() // Medium haptic for bookmark removal
      } else {
        await api.addBookmark(article.id)
        setIsBookmarked(true)
        haptics.success() // Success haptic for bookmark added
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      haptics.error() // Error haptic on failure
    } finally {
      setBookmarkLoading(false)
    }
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

  // Markdown styles
  const markdownStyles = {
    body: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: theme.colors.accent[400],
      fontSize: 28,
      fontWeight: 'bold' as const,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    heading2: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: 'bold' as const,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    heading3: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: 'bold' as const,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    paragraph: {
      marginBottom: theme.spacing.md,
    },
    code_inline: {
      backgroundColor: theme.colors.surfaceHover,
      color: theme.colors.accent[400],
      paddingHorizontal: 4,
      borderRadius: 4,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    fence: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    blockquote: {
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.accent[500],
      paddingLeft: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginVertical: theme.spacing.md,
    },
    list_item: {
      marginBottom: theme.spacing.xs,
    },
    bullet_list: {
      marginBottom: theme.spacing.md,
    },
    ordered_list: {
      marginBottom: theme.spacing.md,
    },
    link: {
      color: theme.colors.accent[400],
    },
    strong: {
      fontWeight: 'bold' as const,
      color: theme.colors.textPrimary,
    },
    em: {
      fontStyle: 'italic' as const,
    },
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent[500]} />
        <Text style={styles.loadingText}>Loading article...</Text>
      </View>
    )
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Article not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Article Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{article.title}</Text>

        <View style={styles.metaRow}>
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
          <Text style={styles.category}>{article.category}</Text>
        </View>

        {article.tags && article.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {article.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {user && (
          <TouchableOpacity
            style={[
              styles.bookmarkButton,
              isBookmarked && styles.bookmarkButtonActive,
            ]}
            onPress={toggleBookmark}
            disabled={bookmarkLoading}
          >
            <Text style={styles.bookmarkIcon}>
              {isBookmarked ? '🔖' : '📑'}
            </Text>
            <Text style={styles.bookmarkText}>
              {bookmarkLoading
                ? 'Loading...'
                : isBookmarked
                ? 'Bookmarked'
                : 'Add Bookmark'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Article Content */}
      <View style={styles.content}>
        <Markdown style={markdownStyles}>{article.content}</Markdown>
      </View>

      {/* Related Articles */}
      {article.related_articles && article.related_articles.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Articles</Text>
          {article.related_articles.map((relatedSlug, index) => (
            <TouchableOpacity
              key={index}
              style={styles.relatedLink}
              onPress={() => navigation.push('Article', { slug: relatedSlug })}
            >
              <Text style={styles.relatedLinkText}>{relatedSlug}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.accent[500],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  difficultyText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
  category: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent[400],
    textTransform: 'uppercase',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.surfaceHover,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'flex-start',
  },
  bookmarkButtonActive: {
    backgroundColor: theme.colors.accent[500] + '20',
    borderColor: theme.colors.accent[500],
  },
  bookmarkIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  bookmarkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  relatedSection: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  relatedTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  relatedLink: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  relatedLinkText: {
    ...theme.typography.body,
    color: theme.colors.accent[400],
  },
})
