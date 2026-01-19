/**
 * SettingsPage - User account settings
 */
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/pages/settings-page.css'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!user) {
    return (
      <div className="settings-page">
        <div className="settings-page__empty">
          <h1>Settings</h1>
          <p>Sign in to access your settings.</p>
        </div>
      </div>
    )
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // TODO: Implement profile update via ApiService
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1>Account Settings</h1>
        <p className="settings-page__subtitle">Manage your account preferences</p>
      </div>

      <div className="settings-page__content">
        {/* Profile Section */}
        <section className="settings-section">
          <h2 className="settings-section__title">Profile</h2>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="settings-form__field">
              <label htmlFor="email" className="settings-form__label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="settings-form__input"
                value={user.email || ''}
                disabled
              />
              <p className="settings-form__hint">Email cannot be changed</p>
            </div>

            <div className="settings-form__field">
              <label htmlFor="displayName" className="settings-form__label">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                className="settings-form__input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
              <p className="settings-form__hint">This is how your name will appear on the site</p>
            </div>

            {message && (
              <div className={`settings-form__message settings-form__message--${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="settings-form__submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Account Actions */}
        <section className="settings-section">
          <h2 className="settings-section__title">Account Actions</h2>

          <div className="settings-actions">
            <button
              onClick={handleSignOut}
              className="settings-action-button settings-action-button--secondary"
            >
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
