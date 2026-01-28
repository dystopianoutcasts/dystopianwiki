/**
 * BentoCard Component
 *
 * Home screen card for game entries (e.g., Project Zomboid, Vintage Story).
 * Features game icon/emoji, title, subtitle, and optional article count.
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  ImageBackground,
} from 'react-native'
import { colors, spacing, radius, elevation, typography, touchTarget } from '../theme'
import { useHaptics } from '../hooks'

interface BentoCardProps {
  title: string
  subtitle?: string
  emoji?: string
  articleCount?: number
  onPress: () => void
  size?: 'small' | 'medium' | 'large'
  backgroundImage?: string
  accessibilityLabel?: string
}

export function BentoCard({
  title,
  subtitle,
  emoji,
  articleCount,
  onPress,
  size = 'medium',
  backgroundImage,
  accessibilityLabel,
}: BentoCardProps) {
  const haptics = useHaptics()

  const handlePress = () => {
    haptics.light()
    onPress()
  }

  const getContainerStyle = ({ pressed }: { pressed: boolean }): ViewStyle[] => {
    const style: ViewStyle[] = [styles.container, styles[`size_${size}`]]

    if (pressed) {
      style.push(styles.pressed)
    }

    return style
  }

  const content = (
    <>
      {emoji && (
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {articleCount !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{articleCount} articles</Text>
        </View>
      )}
    </>
  )

  return (
    <Pressable
      onPress={handlePress}
      style={getContainerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${title}${subtitle ? `, ${subtitle}` : ''}`}
      accessibilityHint={articleCount ? `${articleCount} articles available` : undefined}
    >
      {backgroundImage ? (
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.overlay}>{content}</View>
        </ImageBackground>
      ) : (
        content
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing[4],
    justifyContent: 'space-between',
    overflow: 'hidden',
    minHeight: touchTarget.large,
    ...elevation[2],
  },

  // Size variants
  size_small: {
    minHeight: 100,
    padding: spacing[3],
  },
  size_medium: {
    minHeight: 140,
  },
  size_large: {
    minHeight: 180,
  },

  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  // Background image
  background: {
    flex: 1,
    margin: -spacing[4], // Counteract container padding
  },
  backgroundImage: {
    borderRadius: radius.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.8)', // bg.base overlay
    padding: spacing[4],
    justifyContent: 'space-between',
  },

  // Emoji
  emojiContainer: {
    marginBottom: spacing[3],
  },
  emoji: {
    fontSize: 32,
  },

  // Text
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },

  // Article count badge
  badge: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    backgroundColor: colors.bg.surface2,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.muted,
  },
})

export default BentoCard
