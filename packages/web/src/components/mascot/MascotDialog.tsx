/**
 * MascotDialog - a modal built on the native <dialog> element.
 *
 * showModal() makes everything behind the dialog inert, so keyboard focus cannot leave
 * it; Escape closes it; the dialog is named by the element `labelledBy` points at.
 * Focus goes to `initialFocusRef` when given (otherwise the browser picks the first
 * control) and returns to whatever was focused when it opened.
 *
 * The decisions (when to open and close, what Escape and the backdrop do, where focus goes
 * back to) are in dialogBehavior.ts, which the tests drive directly.
 */
import { useEffect, useRef } from 'react'
import { afterClose, onBackdropClick, onCancel, syncOpen } from './dialogBehavior'

interface MascotDialogProps {
  open: boolean
  onClose: () => void
  /** id of the heading that names the dialog */
  labelledBy: string
  initialFocusRef?: React.RefObject<HTMLElement>
  /** Stops Escape and the backdrop from closing it (while a request is running). */
  locked?: boolean
  className?: string
  children: React.ReactNode
}

export function MascotDialog({ open, onClose, labelledBy, initialFocusRef, locked = false, className, children }: MascotDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<unknown>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const opened = syncOpen(dialog, open, document.activeElement, () => initialFocusRef?.current?.focus())
    if (opened) opener.current = opened.opener
    // initialFocusRef is a stable ref object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Fires after the dialog closes by any route: Escape, backdrop, or close().
  const handleClose = () => {
    const target = opener.current
    opener.current = null
    afterClose(target, onClose)
  }

  return (
    <dialog
      ref={ref}
      className={`mascot-dialog${className ? ` ${className}` : ''}`}
      aria-labelledby={labelledBy}
      onClose={handleClose}
      onCancel={(e) => {
        onCancel(locked, e)
      }}
      onClick={(e) => {
        onBackdropClick(locked, e)
      }}
    >
      {open && <div className="mascot-dialog__body">{children}</div>}
    </dialog>
  )
}
