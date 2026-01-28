/**
 * Divider Component
 *
 * A visual separator for list items and sections.
 * Uses the design system divider color (navy.700 @ 50%).
 */

import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing } from '../theme'

interface DividerProps {
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  style?: ViewStyle
}

export function Divider({ spacing: spacingProp = 'md', style }: DividerProps) {
  const containerStyle: ViewStyle[] = [styles.container]

  if (spacingProp !== 'none') {
    containerStyle.push(styles[`spacing_${spacingProp}`])
  }

  if (style) {
    containerStyle.push(style)
  }

  return (
    <View style={containerStyle}>
      <View style={styles.line} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  line: {
    height: 1,
    backgroundColor: colors.divider.default,
  },

  // Spacing variants
  spacing_sm: {
    marginVertical: spacing[2],
  },
  spacing_md: {
    marginVertical: spacing[4],
  },
  spacing_lg: {
    marginVertical: spacing[6],
  },
})

export default Divider
