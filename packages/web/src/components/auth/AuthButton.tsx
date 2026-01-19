/**
 * AuthButton - Login/Logout button for header
 */
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { LoginModal } from './LoginModal'
import { UserMenu } from './UserMenu'
import '../../styles/components/auth-button.css'

export function AuthButton() {
  const { user, loading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  if (loading) {
    return (
      <div className="auth-button auth-button--loading">
        <div className="auth-button__spinner" />
      </div>
    )
  }

  if (user) {
    return <UserMenu user={user} />
  }

  return (
    <>
      <button
        className="auth-button auth-button--login"
        onClick={() => setShowLoginModal(true)}
      >
        Log In
      </button>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </>
  )
}
