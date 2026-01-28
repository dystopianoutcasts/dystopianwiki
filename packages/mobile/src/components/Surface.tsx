/**
 * Surface Component
 *
 * A container component with design system backgrounds, borders, and elevation.
 * Use for cards, list items, and elevated content.
 *
 * Levels:
 * - 1: bg.surface1 (navy.800) - Cards, list items
 * - 2: bg.surface2 (navy.700) - Nested cards, hover states
 * - 3: bg.surface3 (navy.600) - Active selections
 */

import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native'
import { colors, spacing, radius, elevation } from '../theme'

export type SurfaceLevel = 1 | 2 | 3

interface SurfaceProps {
  children: ReactNode
  level?: SurfaceLevel
  elevated?: boolean
  bordered?: boolean
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl'
  padding?: keyof typeof spacing | number
  style?: ViewStyle
  onPress?: () => void
  accessibilityLabel?: string
}

export function Surface({
  children,
  level = 1,
  elevated = false,
  bordered = true,
  rounded = 'lg',
  padding = 4,
  style,
  onPress,
  accessibilityLabel,
}: SurfaceProps) {
  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`level${level}`],
  ]

  // Border
  if (bordered) {
    containerStyle.push(styles.bordered)
  }

  // Border radius
  if (rounded === true) {
    containerStyle.push(styles.roundedLg)
  } else if (typeof rounded === 'string') {
    containerStyle.push(styles[`rounded${rounded.charAt(0).toUpperCase() + rounded.slice(1)}` as keyof typeof styles])
  }

  // Elevation (shadow)
  if (elevated) {
    containerStyle.push(styles.elevated)
  }

  // Padding
  const paddingValue = typeof padding === 'number' ? padding : spacing[padding]
  containerStyle.push({ padding: paddingValue })

  // Custom style
  if (style) {
    containerStyle.push(style)
  }

  // Pressable or static
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...containerStyle,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Pressable>
    )
  }

  return <View style={containerStyle}>{children}</View>
}

const styles = StyleSheet.create({
  base: {},

  // Surface levels
  level1: {
    backgroundColor: colors.bg.surface1,
  },
  level2: {
    backgroundColor: colors.bg.surface2,
  },
  level3: {
    backgroundColor: colors.bg.surface3,
  },

  // Border
  bordered: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },

  // Border radius
  roundedSm: {
    borderRadius: radius.sm,
  },
  roundedMd: {
    borderRadius: radius.md,
  },
  roundedLg: {
    borderRadius: radius.lg,
  },
  roundedXl: {
    borderRadius: radius.xl,
  },

  // Elevation
  elevated: {
    ...elevation[2],
  },

  // Pressed state (for interactive surfaces)
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
})

export default Surface
