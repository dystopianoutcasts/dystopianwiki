/**
 * LoginModal - Modal for email/password and OAuth login with complete signup flow
 */
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch,
  calculatePasswordStrength,
  formatAuthError,
  type PasswordStrength
} from '../../utils/validation'
import '../../styles/components/login-modal.css'

interface LoginModalProps {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { signIn, signUp, signInWithOAuth, sendPasswordResetEmail } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  // Form fields
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  // Field errors (for real-time validation)
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Very Weak',
    color: '#ff4444'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'login') {
        // Validate login fields
        const emailValidation = validateEmail(email)
        if (!emailValidation.isValid) {
          setError(emailValidation.error!)
          setLoading(false)
          return
        }

        await signIn(email, password)
        onClose()
      } else {
        // Validate all signup fields
        const emailValidation = validateEmail(email)
        const usernameValidation = validateUsername(username)
        const passwordValidation = validatePassword(password)
        const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)

        if (!emailValidation.isValid) {
          setError(emailValidation.error!)
          setLoading(false)
          return
        }

        if (!usernameValidation.isValid) {
          setError(usernameValidation.error!)
          setLoading(false)
          return
        }

        if (!passwordValidation.isValid) {
          setError(passwordValidation.error!)
          setLoading(false)
          return
        }

        if (!passwordMatchValidation.isValid) {
          setError(passwordMatchValidation.error!)
          setLoading(false)
          return
        }

        if (!acceptedTerms) {
          setError('You must accept the Terms of Service to continue')
          setLoading(false)
          return
        }

        // Temporarily disabled username parameter
        await signUp(email, password)
        onClose()
      }
    } catch (err) {
      setError(formatAuthError(err instanceof Error ? err : 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'discord' | 'google') => {
    setLoading(true)
    setError(null)

    try {
      await signInWithOAuth(provider)
      // OAuth redirects, so we don't close the modal here
    } catch (err) {
      setError(formatAuthError(err instanceof Error ? err : 'An error occurred'))
      setLoading(false)
    }
  }

  // Real-time validation handlers
  const handleEmailBlur = () => {
    const result = validateEmail(email)
    setEmailError(result.error || '')
  }

  const handleUsernameBlur = () => {
    const result = validateUsername(username)
    setUsernameError(result.error || '')
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    const result = validatePassword(value)
    setPasswordError(result.error || '')

    // Calculate strength for signup mode
    if (mode === 'signup') {
      const strength = calculatePasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  const handleConfirmPasswordBlur = () => {
    const result = validatePasswordMatch(password, confirmPassword)
    setConfirmPasswordError(result.error || '')
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        setError(emailValidation.error!)
        setLoading(false)
        return
      }

      await sendPasswordResetEmail(email)
      setSuccess('Password reset email sent! Check your inbox.')
      setEmail('')
    } catch (err) {
      setError(formatAuthError(err instanceof Error ? err : 'Failed to send reset email'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <header className="login-modal__header">
          <h2 className="login-modal__title">
            {showPasswordReset ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="login-modal__subtitle">
            {showPasswordReset
              ? 'Enter your email to receive a password reset link'
              : mode === 'login'
              ? 'Sign in to save bookmarks and track progress'
              : 'Join the Dystopian Outcasts community'}
          </p>
        </header>

        {error && (
          <div className="login-modal__error">
            {error}
          </div>
        )}

        {success && (
          <div className="login-modal__success">
            {success}
          </div>
        )}

        {/* Password Reset Form */}
        {showPasswordReset ? (
          <form className="login-modal__form" onSubmit={handlePasswordReset}>
            <div className="login-modal__field">
              <label htmlFor="reset-email" className="login-modal__label">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                className="login-modal__input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-modal__submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              className="login-modal__toggle-button"
              onClick={() => {
                setShowPasswordReset(false)
                setError(null)
                setSuccess(null)
              }}
              style={{ marginTop: '1rem', textAlign: 'center', width: '100%' }}
            >
              ← Back to Sign In
            </button>
          </form>
        ) : (
          <>
            {/* OAuth buttons - only show in LOGIN mode */}
            {mode === 'login' && (
              <>
                <div className="login-modal__oauth">
              <button
                className="login-modal__oauth-button login-modal__oauth-button--discord"
                onClick={() => handleOAuth('discord')}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="login-modal__oauth-icon">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Continue with Discord
              </button>
              <button
                className="login-modal__oauth-button login-modal__oauth-button--google"
                onClick={() => handleOAuth('google')}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="login-modal__oauth-icon">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="login-modal__divider">
              <span>or</span>
            </div>
          </>
        )}

        <form className="login-modal__form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="login-modal__field">
            <label htmlFor="email" className="login-modal__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="login-modal__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              required
              disabled={loading}
            />
            {emailError && (
              <div className="login-modal__field-error">{emailError}</div>
            )}
          </div>

          {/* Username - only in signup mode */}
          {mode === 'signup' && (
            <div className="login-modal__field">
              <label htmlFor="username" className="login-modal__label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="login-modal__input"
                placeholder="CoolGamer123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleUsernameBlur}
                required
                disabled={loading}
                minLength={3}
                maxLength={20}
              />
              <p className="login-modal__hint">
                3-20 characters, letters and numbers only. Choose carefully - cannot be changed.
              </p>
              {usernameError && (
                <div className="login-modal__field-error">{usernameError}</div>
              )}
            </div>
          )}

          {/* Password */}
          <div className="login-modal__field">
            <label htmlFor="password" className="login-modal__label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="login-modal__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              disabled={loading}
              minLength={mode === 'signup' ? 8 : 6}
            />
            {mode === 'signup' && password && (
              <div className="password-strength">
                <div className="password-strength__bar">
                  <div
                    className="password-strength__fill"
                    style={{
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                <span className="password-strength__label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            {mode === 'signup' && (
              <p className="login-modal__hint">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            )}
            {passwordError && mode === 'signup' && (
              <div className="login-modal__field-error">{passwordError}</div>
            )}
          </div>

          {/* Confirm Password - only in signup mode */}
          {mode === 'signup' && (
            <div className="login-modal__field">
              <label htmlFor="confirmPassword" className="login-modal__label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="login-modal__input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={handleConfirmPasswordBlur}
                required
                disabled={loading}
                minLength={8}
              />
              {confirmPasswordError && (
                <div className="login-modal__field-error">{confirmPasswordError}</div>
              )}
            </div>
          )}

          {/* Terms of Service - only in signup mode */}
          {mode === 'signup' && (
            <div className="login-modal__field">
              <label className="login-modal__checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                  disabled={loading}
                />
                <span>
                  I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="login-modal__submit"
            disabled={loading}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
          </>
        )}

        <div className="login-modal__toggle">
          {mode === 'login' ? (
            <>
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="login-modal__toggle-button"
                  onClick={() => setMode('signup')}
                >
                  Sign up
                </button>
              </span>
              <button
                type="button"
                className="login-modal__forgot-password"
                onClick={() => setShowPasswordReset(true)}
              >
                Forgot Password?
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="login-modal__toggle-button"
                onClick={() => setMode('login')}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
