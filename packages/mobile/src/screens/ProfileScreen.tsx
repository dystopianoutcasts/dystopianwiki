import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { ProfileStackNavProp } from '../navigation/types'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/supabase'
import { useHaptics } from '../hooks/useHaptics'
import type { UserProfile } from '@dystopianwiki/shared'

export function ProfileScreen() {
  const navigation = useNavigation<ProfileStackNavProp>()
  const { user, signOut, isEmailVerified } = useAuth()
  const haptics = useHaptics()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const data = await api.getUserProfile(user.id)
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    haptics.warning() // Warning haptic for destructive action prompt
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true)
            try {
              await signOut()
              haptics.medium() // Medium haptic after sign out completes
              navigation.navigate('HomeTab', { screen: 'Home' })
            } catch (error) {
              console.error('Error signing out:', error)
              haptics.error() // Error haptic on failure
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            } finally {
              setSigningOut(false)
            }
          },
        },
      ]
    )
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>👤</Text>
          <Text style={styles.emptyStateTitle}>Not signed in</Text>
          <Text style={styles.emptyStateText}>
            Sign in to view your profile and track your learning progress.
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
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile?.display_name?.[0]?.toUpperCase() ||
                profile?.username?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                '?'}
            </Text>
          </View>

          <Text style={styles.displayName}>
            {profile?.display_name || profile?.username || 'User'}
          </Text>

          {profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}

          <Text style={styles.email}>{user.email}</Text>

          {!isEmailVerified && (
            <View style={styles.verificationBanner}>
              <Text style={styles.verificationText}>
                Email not verified. Please check your inbox.
              </Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate('SavedTab', { screen: 'Bookmarks' })}
            >
              <Text style={styles.statIcon}>🔖</Text>
              <Text style={styles.statLabel}>Bookmarks</Text>
            </TouchableOpacity>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📚</Text>
              <Text style={styles.statLabel}>Reading Progress</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email verified</Text>
            <Text
              style={[
                styles.infoValue,
                { color: isEmailVerified ? theme.colors.success : theme.colors.warning },
              ]}
            >
              {isEmailVerified ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Dystopian Wiki v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with care by the community</Text>
        </View>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  displayName: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  username: {
    ...theme.typography.body,
    color: theme.colors.accent[400],
    marginBottom: theme.spacing.xs,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  verificationBanner: {
    backgroundColor: theme.colors.warning + '20',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  verificationText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  accountSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  actionsSection: {
    marginBottom: theme.spacing.xl,
  },
  signOutButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  signOutButtonText: {
    ...theme.typography.button,
    color: theme.colors.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  appInfoText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.xs,
  },
})
