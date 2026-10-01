/**
 * MascotDialog - a modal built on the native <dialog> element.
 *
 * showModal() makes everything behind the dialog inert, so keyboard focus cannot leave
 * it; Escape closes it; the dialog is named by the element `labelledBy` points at.
 * Focus goes to `initialFocusRef` when given (otherwise the browser picks the first
 * control) and returns to whatever was focused when it opened.
 */
import { useEffect, useRef } from 'react'

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
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      opener.current = document.activeElement
      dialog.showModal()
      initialFocusRef?.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
    // initialFocusRef is a stable ref object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Fires after the dialog closes by any route: Escape, backdrop, or close().
  const handleClose = () => {
    const target = opener.current
    opener.current = null
    if (target instanceof HTMLElement && target.isConnected) target.focus()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      className={`mascot-dialog${className ? ` ${className}` : ''}`}
      aria-labelledby={labelledBy}
      onClose={handleClose}
      onCancel={(e) => {
        if (locked) e.preventDefault()
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> itself, not on its content.
        if (!locked && e.target === e.currentTarget) e.currentTarget.close()
      }}
    >
      {open && <div className="mascot-dialog__body">{children}</div>}
    </dialog>
  )
}
