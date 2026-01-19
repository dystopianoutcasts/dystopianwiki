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

/**
 * Format Supabase authentication error messages into user-friendly text
 */
export function formatAuthError(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message

  // Map common Supabase error messages to user-friendly versions
  const errorMappings: Record<string, string> = {
    'Invalid login credentials': 'Incorrect email or password. Please try again.',
    'Email not confirmed': 'Please verify your email address before signing in.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 6 characters': 'Password must be at least 8 characters long.',
    'Unable to validate email address: invalid format': 'Please enter a valid email address.',
    'Email rate limit exceeded': 'Too many attempts. Please try again in a few minutes.',
    'Signup requires a valid password': 'Please enter a valid password.',
    'Token has expired or is invalid': 'This reset link has expired. Please request a new one.',
    'User not found': 'No account found with this email address.',
    'For security purposes, you can only request this once every 60 seconds': 'Please wait a moment before trying again.'
  }

  // Check for exact matches
  for (const [key, value] of Object.entries(errorMappings)) {
    if (message.includes(key)) {
      return value
    }
  }

  // Check for specific patterns
  if (message.toLowerCase().includes('rate limit')) {
    return 'Too many attempts. Please try again in a few minutes.'
  }

  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return 'Connection error. Please check your internet and try again.'
  }

  if (message.toLowerCase().includes('timeout')) {
    return 'Request timed out. Please try again.'
  }

  // Return original message if no mapping found
  return message
}
