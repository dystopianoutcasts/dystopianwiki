/**
 * Button Component
 *
 * Design system button with three variants:
 * - Primary: Accent background, white text (CTAs)
 * - Secondary: Transparent with accent border
 * - Ghost: Text only, subtle hover
 *
 * All buttons meet 48px minimum touch target for accessibility.
 */

import React from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableStateCallbackType,
} from 'react-native'
import { colors, spacing, radius, touchTarget, typography, accent } from '../theme'
import { useHaptics } from '../hooks'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const haptics = useHaptics()

  const handlePress = () => {
    haptics.light()
    onPress()
  }

  const getContainerStyle = ({
    pressed,
  }: PressableStateCallbackType): ViewStyle[] => {
    const base: ViewStyle[] = [styles.base, styles[`size_${size}`]]

    if (fullWidth) {
      base.push(styles.fullWidth)
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        base.push(styles.primaryContainer)
        if (pressed) base.push(styles.primaryPressed)
        break
      case 'secondary':
        base.push(styles.secondaryContainer)
        if (pressed) base.push(styles.secondaryPressed)
        break
      case 'ghost':
        base.push(styles.ghostContainer)
        if (pressed) base.push(styles.ghostPressed)
        break
    }

    if (disabled || loading) {
      base.push(styles.disabled)
    }

    return base
  }

  const getTextStyle = (): TextStyle[] => {
    const base: TextStyle[] = [styles.text, styles[`text_${size}`]]

    switch (variant) {
      case 'primary':
        base.push(styles.primaryText)
        break
      case 'secondary':
        base.push(styles.secondaryText)
        break
      case 'ghost':
        base.push(styles.ghostText)
        break
    }

    if (disabled) {
      base.push(styles.disabledText)
    }

    return base
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={getContainerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#ffffff' : accent[500]}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{children}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    minHeight: touchTarget.comfortable,
  },

  // Size variants
  size_sm: {
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  size_md: {
    minHeight: touchTarget.comfortable,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  size_lg: {
    minHeight: touchTarget.large,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },

  fullWidth: {
    width: '100%',
  },

  // Primary variant
  primaryContainer: {
    backgroundColor: accent[500],
  },
  primaryPressed: {
    backgroundColor: accent[600],
  },
  primaryText: {
    color: '#ffffff',
  },

  // Secondary variant
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: accent[500],
  },
  secondaryPressed: {
    backgroundColor: 'rgba(212, 120, 44, 0.1)', // accent @ 10%
  },
  secondaryText: {
    color: accent[400],
  },

  // Ghost variant
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // 5% white overlay
  },
  ghostText: {
    color: accent[400],
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.muted,
  },

  // Text styles
  text: {
    fontWeight: 'bold',
  },
  text_sm: {
    fontSize: 14,
    lineHeight: 20,
  },
  text_md: {
    fontSize: typography.button.fontSize,
    lineHeight: typography.button.lineHeight,
  },
  text_lg: {
    fontSize: 18,
    lineHeight: 24,
  },
})

export default Button
