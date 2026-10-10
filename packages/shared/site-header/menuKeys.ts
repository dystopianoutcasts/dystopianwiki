// Keyboard rules for the header's pop-ups (KB15): the account menu, the theme menu and the
// folding site menu. Pure, so they are tested without a browser; usePopup.ts applies them.
//
// On the button: Enter and Space open (the browser turns both into a click) and focus the
// first option; ArrowDown opens on the first option, ArrowUp on the last.
// In the open pop-up: ArrowDown / ArrowUp move with wrap-around, Home / End jump, Escape
// closes and returns focus to the button. Tab is left to the browser, so it moves through
// the options in order; leaving the pop-up closes it (usePopup's focusout).

export type OpenFocus = 'first' | 'last'

export type PanelKeyAction =
  | { kind: 'focus'; index: number }
  | { kind: 'close'; returnFocus: true }
  | { kind: 'none' }

/** What a key pressed on the closed button does: open with focus on an option, or nothing. */
export function triggerKeyAction(key: string, isOpen: boolean): OpenFocus | null {
  if (isOpen) return null
  if (key === 'ArrowDown') return 'first'
  if (key === 'ArrowUp') return 'last'
  return null
}

/**
 * What a key pressed inside the open pop-up does. `index` is the focused option's position
 * (-1 when focus is on none of them), `count` the number of options.
 */
export function panelKeyAction(key: string, index: number, count: number): PanelKeyAction {
  if (key === 'Escape') return { kind: 'close', returnFocus: true }
  if (count <= 0) return { kind: 'none' }
  switch (key) {
    case 'ArrowDown':
      return { kind: 'focus', index: index < 0 ? 0 : (index + 1) % count }
    case 'ArrowUp':
      return { kind: 'focus', index: index < 0 ? count - 1 : (index - 1 + count) % count }
    case 'Home':
      return { kind: 'focus', index: 0 }
    case 'End':
      return { kind: 'focus', index: count - 1 }
    default:
      return { kind: 'none' }
  }
}
