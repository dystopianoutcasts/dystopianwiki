import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { HomeStackNavProp, CategoryArticlesRouteProp } from '../navigation/types'
import { theme } from '../theme'
import { api } from '../lib/supabase'
import type { Article } from '@dystopianwiki/shared'

export function CategoryArticlesScreen() {
  const navigation = useNavigation<HomeStackNavProp>()
  const route = useRoute<CategoryArticlesRouteProp>()
  const { category, categoryName } = route.params!

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigation.setOptions({ title: categoryName })
    fetchArticles()
  }, [category, categoryName])

  const fetchArticles = async () => {
    try {
      const data = await api.getArticlesByCategory(category, 'pz', 'build-41')
      setArticles(data)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
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

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => navigation.navigate('Article', { slug: item.slug })}
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
        <Text style={styles.articleExcerpt} numberOfLines={3}>
          {item.excerpt}
        </Text>
      )}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent[500]} />
        <Text style={styles.loadingText}>Loading articles...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No articles found in this category</Text>
          </View>
        }
      />
    </View>
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
  listContent: {
    padding: theme.spacing.md,
  },
  articleCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  articleTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    textTransform: 'capitalize',
  },
  articleExcerpt: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.colors.surfaceHover,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  tagText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
})
