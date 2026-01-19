/**
 * UserMenu - Dropdown menu for authenticated users
 */
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { User } from '@supabase/supabase-js'
import '../../styles/components/user-menu.css'

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const { signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Get user display name (email or metadata)
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="user-menu__avatar"
          />
        ) : (
          <div className="user-menu__avatar user-menu__avatar--placeholder">
            {displayName[0].toUpperCase()}
          </div>
        )}
        <span className="user-menu__name">{displayName}</span>
        <svg
          className={`user-menu__chevron ${isOpen ? 'user-menu__chevron--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown">
          <div className="user-menu__header">
            <div className="user-menu__user-info">
              <div className="user-menu__user-name">{displayName}</div>
              <div className="user-menu__user-email">{user.email}</div>
            </div>
          </div>

          <nav className="user-menu__nav">
            <Link
              to="/bookmarks"
              className="user-menu__item"
              onClick={() => setIsOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="user-menu__item-icon">
                <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Bookmarks
            </Link>

            <Link
              to="/settings"
              className="user-menu__item"
              onClick={() => setIsOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="user-menu__item-icon">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m9.66-9-5.2 3m-5.2 3-5.2 3m15.54 0-5.2-3m-5.2-3-5.2-3" />
              </svg>
              Settings
            </Link>
          </nav>

          <div className="user-menu__footer">
            <button
              className="user-menu__item user-menu__item--signout"
              onClick={handleSignOut}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="user-menu__item-icon">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
