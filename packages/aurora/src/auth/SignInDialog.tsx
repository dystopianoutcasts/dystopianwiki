// Native <dialog>, opened with showModal(): focus is trapped inside it, Escape closes
// it, and the page behind becomes inert automatically - no manual focus-trap code needed.
// `open` only tells this component when to call showModal()/close(); the dialog's own
// `close` event (fired by Escape, the Cancel button and a backdrop click alike) is the
// single path back to the caller's onClose, so every way of leaving the dialog behaves
// the same way (AccountControl returns focus to "Admin sign in" from that one callback).
import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { SignInButtons } from './SignInButtons'

export function SignInDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) ref.current?.close()
  }

  return (
    <dialog ref={ref} className="signin-dialog" aria-labelledby="signin-h" onClose={onClose} onClick={handleBackdropClick}>
      <h2 id="signin-h">Admin sign in</h2>
      <p className="note">Accounts are invite-only.</p>
      <SignInButtons />
      <button type="button" className="signin-cancel" onClick={() => ref.current?.close()}>Cancel</button>
    </dialog>
  )
}
