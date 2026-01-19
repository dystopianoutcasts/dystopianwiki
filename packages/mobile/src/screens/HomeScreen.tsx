import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { user } = useAuth()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Dystopian Wiki</Text>
        <Text style={styles.subtitle}>
          Your comprehensive guide to game modding
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {!user && (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardDescription}>
              Access bookmarks and track your progress
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Bookmarks')}
        >
          <Text style={styles.cardTitle}>Bookmarks</Text>
          <Text style={styles.cardDescription}>
            View your saved articles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('Article', { slug: 'example-article' })
          }
        >
          <Text style={styles.cardTitle}>Browse Articles</Text>
          <Text style={styles.cardDescription}>
            Explore modding tutorials and guides
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <Text style={styles.comingSoon}>Coming soon...</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.accent[400],
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  comingSoon: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
})
