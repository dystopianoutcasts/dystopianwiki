// One pop-up's open state and keyboard and pointer handling (KB15), used three times by the
// site header: the account menu, the theme menu and the folding site menu. The rules are
// the pure functions in menuKeys.ts.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, RefObject } from 'react'
import { panelKeyAction, triggerKeyAction } from './menuKeys'
import type { OpenFocus } from './menuKeys'

export interface Popup {
  isOpen: boolean
  rootRef: RefObject<HTMLDivElement>
  triggerRef: RefObject<HTMLButtonElement>
  panelRef: RefObject<HTMLDivElement>
  /** The button's click (Enter and Space arrive as clicks too). */
  toggle: () => void
  close: (returnFocus: boolean) => void
  onTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  onPanelKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  /** Focus leaving the button and pop-up together (Tab past the last option) closes it. */
  onRootBlur: (event: FocusEvent<HTMLDivElement>) => void
}

/**
 * @param itemSelector the pop-up's options, in order, inside the panel
 * @param focusOnOpen  move focus to the first option when the button opens it (menus do;
 *                     the site menu, a disclosure, leaves focus on its button)
 */
export function usePopup(itemSelector: string, focusOnOpen: boolean): Popup {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<OpenFocus | null>(null)

  const items = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(itemSelector) ?? []),
    [itemSelector],
  )

  const close = useCallback((returnFocus: boolean) => {
    pendingFocus.current = null
    setIsOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  const openWith = useCallback((focus: OpenFocus | null) => {
    pendingFocus.current = focus
    setIsOpen(true)
  }, [])

  const toggle = useCallback(() => {
    if (isOpen) close(false)
    else openWith(focusOnOpen ? 'first' : null)
  }, [isOpen, close, openWith, focusOnOpen])

  // Once open, put focus where the opening key asked for it.
  useEffect(() => {
    if (!isOpen || pendingFocus.current === null) return
    const list = items()
    const target = pendingFocus.current === 'first' ? list[0] : list[list.length - 1]
    pendingFocus.current = null
    target?.focus()
  }, [isOpen, items])

  // A press anywhere outside the button and the pop-up closes it, without moving focus.
  useEffect(() => {
    if (!isOpen) return
    const onPointer = (event: PointerEvent) => {
      const root = rootRef.current
      if (root && event.target instanceof Node && !root.contains(event.target)) close(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [isOpen, close])

  const onTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        close(true)
        return
      }
      const focus = triggerKeyAction(event.key, isOpen)
      if (focus) {
        event.preventDefault()
        openWith(focus)
      }
    },
    [isOpen, close, openWith],
  )

  const onPanelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      // Radio buttons and the wiki's build select use the arrow keys themselves; only
      // Escape is taken from them.
      if (event.key !== 'Escape' && event.target instanceof HTMLElement && event.target.matches('input, select, textarea')) return
      const list = items()
      const active = document.activeElement
      const index = active instanceof HTMLElement ? list.indexOf(active) : -1
      const action = panelKeyAction(event.key, index, list.length)
      if (action.kind === 'none') return
      event.preventDefault()
      if (action.kind === 'close') close(true)
      else list[action.index]?.focus()
    },
    [items, close],
  )

  const onRootBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget
      if (isOpen && next instanceof Node && !event.currentTarget.contains(next)) close(false)
    },
    [isOpen, close],
  )

  return { isOpen, rootRef, triggerRef, panelRef, toggle, close, onTriggerKeyDown, onPanelKeyDown, onRootBlur }
}
