/**
 * UserMenu - the signed-in member's account menu.
 *
 * A real button with aria-expanded / aria-haspopup. Enter or Space opens it and focuses
 * the first item; Arrow keys, Home and End move between items; Escape closes it and
 * returns focus to the button; Tab or a click elsewhere closes it.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { api } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getAvatarUrl, getDisplayName, getInitial } from '../../utils/memberProfile'
import '../../styles/components/user-menu.css'

/** Fails closed: only an exact `true` with no error counts. Never throws. */
function useIsSiteAdmin(userId: string): boolean {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsAdmin(false)
    void (async () => {
      try {
        const { data, error } = await api.getClient().rpc('site_is_admin')
        if (!cancelled) setIsAdmin(error === null && data === true)
      } catch {
        if (!cancelled) setIsAdmin(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  return isAdmin
}

export function UserMenu({ user }: { user: User }) {
  const { signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [signOutError, setSignOutError] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const isAdmin = useIsSiteAdmin(user.id)

  const name = getDisplayName(user)
  const avatarUrl = getAvatarUrl(user)

  const items = useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
    [],
  )

  const close = useCallback((returnFocus: boolean) => {
    setIsOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  // Focus the first item when the menu opens.
  useEffect(() => {
    if (isOpen) items()[0]?.focus()
  }, [isOpen, items])

  // Close on a click or touch outside the control.
  useEffect(() => {
    if (!isOpen) return
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [isOpen, close])

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = items()
    const index = list.indexOf(document.activeElement as HTMLElement)
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close(true)
        break
      case 'ArrowDown':
        event.preventDefault()
        list[(index + 1) % list.length]?.focus()
        break
      case 'ArrowUp':
        event.preventDefault()
        list[(index - 1 + list.length) % list.length]?.focus()
        break
      case 'Home':
        event.preventDefault()
        list[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        list[list.length - 1]?.focus()
        break
      case 'Tab':
        close(false)
        break
    }
  }

  const handleSignOut = async () => {
    setSignOutError(false)
    try {
      await signOut()
      close(false)
    } catch {
      setSignOutError(true)
    }
  }

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="user-menu__trigger"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="account-menu"
        aria-label={`Account menu for ${name}`}
      >
        {avatarUrl && !avatarFailed ? (
          <img
            src={avatarUrl}
            alt=""
            className="user-menu__avatar"
            referrerPolicy="no-referrer"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span className="user-menu__avatar user-menu__avatar--placeholder" aria-hidden="true">
            {getInitial(user)}
          </span>
        )}
        <svg
          className={`user-menu__chevron ${isOpen ? 'user-menu__chevron--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="account-menu"
          className="user-menu__dropdown"
          role="menu"
          aria-label="Account"
          ref={menuRef}
          onKeyDown={handleMenuKeyDown}
        >
          <div className="user-menu__header" role="presentation">
            <div className="user-menu__user-name">{name}</div>
          </div>

          <Link to="/settings" role="menuitem" className="user-menu__item" onClick={() => close(false)}>
            Settings
          </Link>

          {isAdmin && (
            <Link to="/admin" role="menuitem" className="user-menu__item" onClick={() => close(false)}>
              Admin dashboard
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            className="user-menu__item user-menu__item--signout"
            onClick={handleSignOut}
          >
            Log out
          </button>

          {signOutError && (
            <p className="user-menu__error" role="alert">
              Could not log out. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
