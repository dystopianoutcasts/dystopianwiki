/**
 * Validation utilities for user input
 * Provides real-time validation with clear error messages
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface PasswordStrength {
  score: number // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong'
  color: string
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

/**
 * Validate username format and length
 * Requirements:
 * - 3-20 characters
 * - Start with a letter
 * - Alphanumeric + underscore only
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Username is required' }
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' }
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be 20 characters or less' }
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
    return {
      isValid: false,
      error: 'Username must start with a letter and contain only letters, numbers, and underscores'
    }
  }

  return { isValid: true }
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }

  return { isValid: true }
}

/**
 * Validate password confirmation matches
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' }
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' }
  }

  return { isValid: true }
}

/**
 * Calculate password strength score and visual indicator
 * Returns score (0-4) with label and color for UI display
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0

  // Length scoring
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // Character variety scoring
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++ // Special characters

  // Cap at 4
  score = Math.min(score, 4)

  const labels: PasswordStrength['label'][] = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#ff4444', '#ff8800', '#ffbb00', '#88cc00', '#00cc66']

  return {
    score,
    label: labels[score] || 'Very Weak',
    color: colors[score] || colors[0]
  }
}
