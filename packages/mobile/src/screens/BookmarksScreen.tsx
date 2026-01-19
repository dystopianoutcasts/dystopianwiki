import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'

export function BookmarksScreen() {
  const { user } = useAuth()

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Sign in to view bookmarks</Text>
          <Text style={styles.emptyStateText}>
            Create an account to save your favorite articles and access them
            anytime.
          </Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Bookmarks</Text>
        <Text style={styles.body}>
          This is a placeholder bookmarks screen. In Phase 4, we'll add:{'\n\n'}
          • Fetch user bookmarks from Supabase{'\n'}
          • Display bookmarked articles{'\n'}
          • Remove bookmark functionality{'\n'}
          • Empty state when no bookmarks{'\n'}
          • Tap to open article
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
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
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
})
