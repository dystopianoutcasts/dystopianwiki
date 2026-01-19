import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  validatePassword,
  validatePasswordMatch,
  calculatePasswordStrength,
  formatAuthError,
  type PasswordStrength
} from '../utils/validation'
import '../styles/pages/reset-password-page.css'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Very Weak',
    color: '#ff4444'
  })

  // Validate token on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) {
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
  }, [])

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    const result = validatePassword(value)
    setPasswordError(result.error || '')

    const strength = calculatePasswordStrength(value)
    setPasswordStrength(strength)
  }

  const handleConfirmPasswordBlur = () => {
    const result = validatePasswordMatch(password, confirmPassword)
    setConfirmPasswordError(result.error || '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate passwords
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error!)
        setLoading(false)
        return
      }

      const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)
      if (!passwordMatchValidation.isValid) {
        setError(passwordMatchValidation.error!)
        setLoading(false)
        return
      }

      await updatePassword(password)
      setSuccess(true)

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      setError(formatAuthError(err instanceof Error ? err : 'Failed to reset password. The link may have expired.'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-page__container">
          <div className="reset-password-page__success-card">
            <div className="reset-password-page__success-icon">✓</div>
            <h1 className="reset-password-page__success-title">Password Reset Successfully!</h1>
            <p className="reset-password-page__success-message">
              Your password has been updated. Redirecting you to the home page...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-page__container">
        <div className="reset-password-page__card">
          <header className="reset-password-page__header">
            <h1 className="reset-password-page__title">Reset Your Password</h1>
            <p className="reset-password-page__subtitle">
              Enter your new password below
            </p>
          </header>

          {error && (
            <div className="reset-password-page__error">
              {error}
            </div>
          )}

          <form className="reset-password-page__form" onSubmit={handleSubmit}>
            {/* Password */}
            <div className="reset-password-page__field">
              <label htmlFor="password" className="reset-password-page__label">
                New Password
              </label>
              <input
                id="password"
                type="password"
                className="reset-password-page__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
              {password && (
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
              <p className="reset-password-page__hint">
                At least 8 characters with uppercase, lowercase, and number
              </p>
              {passwordError && (
                <div className="reset-password-page__field-error">{passwordError}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="reset-password-page__field">
              <label htmlFor="confirmPassword" className="reset-password-page__label">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="reset-password-page__input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={handleConfirmPasswordBlur}
                required
                disabled={loading}
                minLength={8}
              />
              {confirmPasswordError && (
                <div className="reset-password-page__field-error">{confirmPasswordError}</div>
              )}
            </div>

            <button
              type="submit"
              className="reset-password-page__submit"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="reset-password-page__back">
            <button
              type="button"
              className="reset-password-page__back-button"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
