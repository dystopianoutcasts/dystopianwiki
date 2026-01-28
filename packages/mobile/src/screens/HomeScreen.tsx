import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import type { HomeStackNavProp } from '../navigation/types'
import { theme, colors, navy, accent, spacing, radius } from '../theme'
import { api } from '../lib/supabase'
import { useHaptics } from '../hooks/useHaptics'
import type { Category as SharedCategory } from '@dystopianwiki/shared'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Game card data (matching web)
const GAMES = [
  {
    id: 'project-zomboid',
    name: 'Project Zomboid',
    shortName: 'PZ',
    description: 'Modding guides, Lua API reference, and vanilla documentation.',
    color: '#22c55e', // Zombie green
    available: true,
  },
  {
    id: 'vintage-story',
    name: 'Vintage Story',
    shortName: 'VS',
    description: 'Coming soon: modding documentation and server guides.',
    color: '#f59e0b', // Amber/gold
    available: false,
  },
]

// Stats (matching web)
const STATS = [
  { icon: '📝', value: '100+', label: 'Articles' },
  { icon: '🎮', value: '2', label: 'Games' },
  { icon: '🤝', value: 'Open', label: 'Source' },
]

export function HomeScreen() {
  const navigation = useNavigation<HomeStackNavProp>()
  const haptics = useHaptics()
  const [categories, setCategories] = useState<SharedCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const cats = await api.getCategories('pz', 'modding')
      setCategories(cats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleDiscordPress = () => {
    haptics.medium()
    Linking.openURL('https://discord.gg/KgNBWyfcvZ')
  }

  const handleGameCardPress = (game: typeof GAMES[0]) => {
    if (!game.available) {
      haptics.warning()
      return
    }
    haptics.light()
    navigation.navigate('Categories')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accent[500]} />
        <Text style={styles.loadingText}>Loading...</Text>
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
          tintColor={accent[500]}
        />
      }
    >
      {/* Hero Section with Gradient */}
      <LinearGradient
        colors={[navy[900], navy[800], accent[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Banner Logo - Links to Discord */}
        <TouchableOpacity
          onPress={handleDiscordPress}
          activeOpacity={0.8}
          style={styles.bannerTouchable}
        >
          <Image
            source={require('../../assets/banners/dystopian-outcasts-banner-512.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.heroTitle}>DYSTOPIAN OUTCASTS WIKI</Text>

        {/* Subtitle */}
        <Text style={styles.heroSubtitle}>
          Modding guides, server docs, and community resources for{' '}
          <Text style={styles.heroAccent}>survival games</Text>
        </Text>

        {/* Search CTA */}
        <TouchableOpacity
          style={styles.searchCTA}
          onPress={() => {
            haptics.light()
            navigation.navigate('SearchTab', { screen: 'Search' })
          }}
        >
          <Text style={styles.searchCTAIcon}>🔍</Text>
          <Text style={styles.searchCTAText}>Search all documentation...</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Game Cards Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CHOOSE YOUR GAME</Text>
        <Text style={styles.sectionSubtitle}>
          Select a game to access documentation, guides, and resources
        </Text>

        <View style={styles.gameCardsContainer}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameCard,
                !game.available && styles.gameCardDisabled,
              ]}
              onPress={() => handleGameCardPress(game)}
              activeOpacity={game.available ? 0.7 : 1}
            >
              {/* Colored top accent */}
              <View style={[styles.gameCardAccent, { backgroundColor: game.color }]} />

              {/* Game icon/shortname */}
              <View style={[styles.gameIconWrapper, { borderColor: game.color + '40' }]}>
                <Text style={[styles.gameIconText, { color: game.color }]}>
                  {game.shortName}
                </Text>
              </View>

              {/* Game info */}
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>

              {/* Badge or Arrow */}
              {game.available ? (
                <View style={styles.gameArrow}>
                  <Text style={[styles.gameArrowText, { color: game.color }]}>→</Text>
                </View>
              ) : (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>COMING SOON</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>ABOUT DYSTOPIAN OUTCASTS</Text>
        <Text style={styles.aboutText}>
          <Text style={styles.aboutHighlight}>Dystopian Outcasts</Text> is a community
          of modders, server operators, and survival game enthusiasts. We create mods,
          host servers, and share knowledge to help others get the most out of their
          favorite games.
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {STATS.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Community Discord Banner */}
      <View style={styles.communityBanner}>
        <View style={styles.communityContent}>
          <Text style={styles.communityIcon}>💬</Text>
          <View style={styles.communityTextContainer}>
            <Text style={styles.communityTitle}>Join the Outcasts Community</Text>
            <Text style={styles.communityDescription}>
              Whether you're just starting out or you're a seasoned modder, our Discord
              is the place to be. New and experienced modders alike are welcome!
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.discordButton}
          onPress={handleDiscordPress}
          activeOpacity={0.8}
        >
          <Text style={styles.discordButtonText}>Become an Outcast</Text>
          <Text style={styles.discordArrow}>↗</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Browse Categories (Collapsed) */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PZ MODDING CATEGORIES</Text>
            <TouchableOpacity
              onPress={() => {
                haptics.light()
                navigation.navigate('Categories')
              }}
            >
              <Text style={styles.seeAllLink}>See All →</Text>
            </TouchableOpacity>
          </View>

          {categories.slice(0, 3).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => {
                haptics.light()
                navigation.navigate('CategoryArticles', {
                  category: category.name.toLowerCase().replace(/\s+/g, '-'),
                  categoryName: category.name,
                })
              }}
            >
              <Text style={styles.categoryIcon}>{category.icon || '📄'}</Text>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>
                  {category.article_count || 0} articles
                </Text>
              </View>
              <Text style={styles.categoryArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Footer spacing */}
      <View style={{ height: spacing.xxl * 2 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.base,
  },
  loadingText: {
    ...theme.typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  // Hero Section
  hero: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  bannerTouchable: {
    marginBottom: spacing.md,
  },
  bannerImage: {
    width: SCREEN_WIDTH * 0.75,
    height: (SCREEN_WIDTH * 0.75) * 0.3, // Approximate banner aspect ratio
    maxWidth: 300,
  },
  heroTitle: {
    ...theme.typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: spacing.lg,
  },
  heroAccent: {
    color: accent[400],
    fontWeight: '500',
  },
  searchCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    width: '100%',
    maxWidth: 340,
  },
  searchCTAIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchCTAText: {
    ...theme.typography.body,
    color: colors.text.muted,
  },

  // Section
  section: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    ...theme.typography.bodySmall,
    color: colors.text.secondary,
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  seeAllLink: {
    ...theme.typography.bodySmall,
    color: accent[400],
  },

  // Game Cards
  gameCardsContainer: {
    gap: spacing.md,
  },
  gameCard: {
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    overflow: 'hidden',
  },
  gameCardDisabled: {
    opacity: 0.85,
  },
  gameCardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  gameIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  gameIconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameName: {
    ...theme.typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  gameDescription: {
    ...theme.typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  gameArrow: {
    marginTop: spacing.xs,
  },
  gameArrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  comingSoonBadge: {
    backgroundColor: colors.bg.surface2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  comingSoonText: {
    ...theme.typography.caption,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },

  // About Section
  aboutSection: {
    backgroundColor: colors.bg.surface1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.subtle,
  },
  aboutTitle: {
    ...theme.typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  aboutText: {
    ...theme.typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  aboutHighlight: {
    color: accent[400],
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...theme.typography.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...theme.typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Community Banner
  communityBanner: {
    margin: spacing.lg,
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  communityContent: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  communityIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  communityTextContainer: {
    flex: 1,
  },
  communityTitle: {
    ...theme.typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  communityDescription: {
    ...theme.typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  discordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accent[500],
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  discordButtonText: {
    ...theme.typography.button,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  discordArrow: {
    fontSize: 16,
    color: colors.text.primary,
  },

  // Category Cards
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...theme.typography.h4,
    color: accent[400],
  },
  categoryCount: {
    ...theme.typography.caption,
    color: colors.text.muted,
  },
  categoryArrow: {
    fontSize: 24,
    color: colors.text.muted,
  },
})
