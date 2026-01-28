/**
 * Skeleton Component
 *
 * Loading placeholder with shimmer animation.
 * Respects reduced motion preference - shows static gray when enabled.
 */

import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, ViewStyle, useWindowDimensions, DimensionValue } from 'react-native'
import { colors, radius, spacing } from '../theme'

type SkeletonVariant = 'text' | 'title' | 'avatar' | 'card' | 'custom'

interface SkeletonProps {
  variant?: SkeletonVariant
  width?: DimensionValue
  height?: number
  borderRadius?: number
  style?: ViewStyle
  // For reduced motion - passed from parent hook
  reducedMotion?: boolean
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  borderRadius,
  style,
  reducedMotion = false,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current
  const { width: screenWidth } = useWindowDimensions()

  // Get variant-specific dimensions
  const getDimensions = (): { width: DimensionValue; height: number; borderRadius: number } => {
    switch (variant) {
      case 'text':
        return { width: width ?? '100%', height: height ?? 16, borderRadius: borderRadius ?? radius.sm }
      case 'title':
        return { width: width ?? '60%', height: height ?? 24, borderRadius: borderRadius ?? radius.sm }
      case 'avatar':
        return { width: width ?? 48, height: height ?? 48, borderRadius: borderRadius ?? radius.full }
      case 'card':
        return { width: width ?? '100%', height: height ?? 120, borderRadius: borderRadius ?? radius.lg }
      case 'custom':
      default:
        return { width: width ?? '100%', height: height ?? 16, borderRadius: borderRadius ?? radius.sm }
    }
  }

  const dimensions = getDimensions()

  // Shimmer animation
  useEffect(() => {
    if (reducedMotion) return

    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    )

    animation.start()

    return () => animation.stop()
  }, [shimmerAnim, reducedMotion])

  const containerStyle: ViewStyle[] = [
    styles.container,
    {
      width: dimensions.width,
      height: dimensions.height,
      borderRadius: dimensions.borderRadius,
    },
  ]

  if (style) {
    containerStyle.push(style)
  }

  // Static skeleton for reduced motion
  if (reducedMotion) {
    return <View style={containerStyle} />
  }

  // Animated shimmer
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  })

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  )
}

// Convenience components for common patterns
export function SkeletonText({ lines = 3, reducedMotion = false }: { lines?: number; reducedMotion?: boolean }) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
          reducedMotion={reducedMotion}
          style={i < lines - 1 ? styles.textLine : undefined}
        />
      ))}
    </View>
  )
}

export function SkeletonCard({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <View style={styles.cardContainer}>
      <Skeleton variant="card" height={80} reducedMotion={reducedMotion} />
      <View style={styles.cardContent}>
        <Skeleton variant="title" reducedMotion={reducedMotion} style={styles.cardTitle} />
        <SkeletonText lines={2} reducedMotion={reducedMotion} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.surface2,
    overflow: 'hidden',
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: '50%',
  },

  // Text skeleton helpers
  textContainer: {
    gap: spacing[2],
  },
  textLine: {
    marginBottom: spacing[2],
  },

  // Card skeleton helpers
  cardContainer: {
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing[4],
  },
  cardTitle: {
    marginBottom: spacing[3],
  },
})

export default Skeleton
