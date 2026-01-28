import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { HomeStackNavProp } from '../navigation/types'
import { theme } from '../theme'
import { api } from '../lib/supabase'
import type { Category } from '@dystopianwiki/shared'

export function CategoriesScreen() {
  const navigation = useNavigation<HomeStackNavProp>()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories('pz', 'modding')
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        navigation.navigate('CategoryArticles', {
          category: item.name.toLowerCase().replace(/\s+/g, '-'),
          categoryName: item.name,
        })
      }
    >
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>{item.icon || '📄'}</Text>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryCount}>
            {item.article_count || 0} articles
          </Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.categoryDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent[500]} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories found</Text>
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
  categoryCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...theme.typography.h3,
    color: theme.colors.accent[400],
  },
  categoryCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  categoryDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
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
