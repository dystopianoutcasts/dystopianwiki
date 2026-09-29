// The account control that replaces the old header's sign-in/sign-out block (T34): it
// now lives at the top of the side panel instead of a top bar. Signed out it is a single
// "Admin sign in" button that opens SignInDialog; signed in, the email and "Sign out",
// same as the header used to show. Loading renders nothing, same as before.
import { useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { SignInDialog } from './SignInDialog'

export function AccountControl() {
  const { user, loading, signOut } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  if (loading) return null

  if (user) {
    return (
      <div className="account">
        <span className="who">{user.email ?? 'Signed in'}</span>
        <button type="button" onClick={() => void signOut()}>Sign out</button>
      </div>
    )
  }

  const closeDialog = () => {
    setDialogOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="account">
      <button type="button" ref={triggerRef} onClick={() => setDialogOpen(true)}>Admin sign in</button>
      <SignInDialog open={dialogOpen} onClose={closeDialog} />
    </div>
  )
}
