import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { theme } from '../theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Article'>

export function ArticleScreen({ route }: Props) {
  const { slug } = route.params

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Article: {slug}</Text>
        <Text style={styles.body}>
          This is a placeholder article screen. In Phase 4, we'll add:{'\n\n'}
          • Fetch article content from Supabase{'\n'}
          • Markdown rendering{'\n'}
          • Table of contents{'\n'}
          • Bookmark functionality{'\n'}
          • Next/previous navigation
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
