/**
 * The behavior of MascotDialog (a modal on the native <dialog>), as plain functions over
 * dialog-like objects, so the tests can drive it with fakes: opening, closing, Escape, the
 * backdrop, and focus returning to the opener.
 *
 * A real <dialog>.showModal() makes everything behind it inert, so keyboard focus cannot leave
 * it, and Escape fires a `cancel` event and then closes it. Those are the browser's; what the
 * site decides is here.
 */

export interface DialogLike {
  open: boolean
  showModal(): void
  close(): void
}

export interface FocusableLike {
  isConnected: boolean
  focus(): void
}

/** What the effect does when `open` changes. Returns the element to give focus back to, if it just opened. */
export function syncOpen(
  dialog: DialogLike,
  open: boolean,
  activeElement: unknown,
  focusFirst?: () => void,
): { opener: unknown } | null {
  if (open && !dialog.open) {
    dialog.showModal()
    focusFirst?.()
    return { opener: activeElement }
  }
  if (!open && dialog.open) dialog.close()
  return null
}

/** The `cancel` event (Escape): refused only while locked. Returns whether the event was prevented. */
export function onCancel(locked: boolean, event: { preventDefault(): void }): boolean {
  if (locked) {
    event.preventDefault()
    return true
  }
  return false
}

/** A click on the backdrop lands on the dialog itself, not on its content. Closes unless locked. */
export function onBackdropClick(locked: boolean, event: { target: unknown; currentTarget: DialogLike }): boolean {
  if (!locked && event.target === event.currentTarget) {
    event.currentTarget.close()
    return true
  }
  return false
}

function isFocusable(x: unknown): x is FocusableLike {
  return typeof x === 'object' && x !== null && 'focus' in x && typeof (x as FocusableLike).focus === 'function' && (x as FocusableLike).isConnected === true
}

/** The dialog closed by any route (Escape, backdrop, close()): focus goes back to the opener, then the owner is told. */
export function afterClose(opener: unknown, onClose: () => void): void {
  if (isFocusable(opener)) opener.focus()
  onClose()
}
