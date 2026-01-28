/**
 * Haptic Feedback Hook
 *
 * Provides a consistent API for haptic feedback across the app.
 * Respects system settings and handles platform availability.
 *
 * Usage:
 * - Light: Tab switches, filter chip selection, toggles
 * - Medium: Bookmark add/remove, copy code, download complete
 * - Heavy: ONLY after confirmed destructive action completes (not on dialog)
 */

import { useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

// Check if haptics are available (iOS and some Android devices)
const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android'

export function useHaptics() {
  /**
   * Light haptic - subtle feedback
   * Use for: tab switches, filter chips, toggle switches
   */
  const light = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  /**
   * Medium haptic - noticeable feedback
   * Use for: bookmark add/remove, copy code button, download complete
   */
  const medium = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  /**
   * Heavy haptic - strong feedback
   * Use ONLY for: confirmed destructive action completion
   * NOT for confirmation dialogs (that would be jarring)
   */
  const heavy = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  /**
   * Selection feedback - for selection changes
   * Use for: picker selection, list item selection
   */
  const selection = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.selectionAsync()
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  /**
   * Success notification - for positive confirmations
   * Use for: form submission success, save complete
   */
  const success = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  /**
   * Warning notification - for caution states
   * Use for: invalid input, approaching limit
   */
  const warning = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  /**
   * Error notification - for error states
   * Use for: form validation error, action failed
   */
  const error = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  return {
    light,
    medium,
    heavy,
    selection,
    success,
    warning,
    error,
    isAvailable: isHapticsAvailable,
  }
}

export default useHaptics
