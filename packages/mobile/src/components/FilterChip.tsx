/**
 * FilterChip Component
 *
 * Filter chips for search and category filtering.
 * Supports single-select and multi-select modes.
 *
 * States:
 * - Default: Navy 800 bg, text.secondary
 * - Selected (single): Accent 500 bg, text.primary
 * - Selected (multi): Accent muted bg, accent border, accent text
 */

import React from 'react'
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { colors, spacing, radius, touchTarget, accent } from '../theme'
import { useHaptics } from '../hooks'

interface FilterChipProps {
  label: string
  selected?: boolean
  onPress: () => void
  multiSelect?: boolean
  disabled?: boolean
  accessibilityLabel?: string
}

export function FilterChip({
  label,
  selected = false,
  onPress,
  multiSelect = false,
  disabled = false,
  accessibilityLabel,
}: FilterChipProps) {
  const haptics = useHaptics()

  const handlePress = () => {
    haptics.light()
    onPress()
  }

  const getContainerStyle = ({ pressed }: { pressed: boolean }): ViewStyle[] => {
    const style: ViewStyle[] = [styles.container]

    if (selected) {
      if (multiSelect) {
        style.push(styles.selectedMulti)
      } else {
        style.push(styles.selectedSingle)
      }
    } else {
      style.push(styles.default)
    }

    if (pressed) {
      style.push(styles.pressed)
    }

    if (disabled) {
      style.push(styles.disabled)
    }

    return style
  }

  const getTextStyle = (): TextStyle[] => {
    const style: TextStyle[] = [styles.text]

    if (selected) {
      if (multiSelect) {
        style.push(styles.textSelectedMulti)
      } else {
        style.push(styles.textSelectedSingle)
      }
    } else {
      style.push(styles.textDefault)
    }

    return style
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={getContainerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected, disabled }}
    >
      <Text style={getTextStyle()}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Default state
  default: {
    backgroundColor: colors.bg.surface1,
  },

  // Selected - Single select mode (filled accent)
  selectedSingle: {
    backgroundColor: accent[500],
  },

  // Selected - Multi select mode (outline style)
  selectedMulti: {
    backgroundColor: 'rgba(212, 120, 44, 0.1)', // accent @ 10%
    borderWidth: 1,
    borderColor: accent[500],
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontSize: 14,
    fontWeight: '500',
  },

  textDefault: {
    color: colors.text.secondary,
  },

  textSelectedSingle: {
    color: colors.text.primary,
  },

  textSelectedMulti: {
    color: accent[400],
  },
})

export default FilterChip
