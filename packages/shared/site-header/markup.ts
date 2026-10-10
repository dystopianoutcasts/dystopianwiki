// Test helper (KB15): renders a tree of hook-free components to an HTML-like string without
// react-dom (this workspace resolves react-dom against the root's React 19, while both apps
// run React 18). Function components are called with their props, so only the pure views
// can be rendered. Attributes follow React's DOM rules where the tests depend on them:
// event handlers are left out, `className` is written `class`, `htmlFor` is `for`, a false
// non-aria boolean (hidden, checked) is omitted and a true one is written bare, while aria-*
// booleans are written "true"/"false". Text and attribute values are escaped.
import { isValidElement } from 'react'
import type { ReactNode } from 'react'
import type { Popup } from './usePopup'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const NAMES: Record<string, string> = { className: 'class', htmlFor: 'for', referrerPolicy: 'referrerpolicy' }

export function markup(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return esc(String(node))
  if (Array.isArray(node)) return node.map(markup).join('')
  if (!isValidElement(node)) return ''
  const props = (node.props ?? {}) as Record<string, unknown>
  if (typeof node.type === 'function') return markup((node.type as (p: unknown) => ReactNode)(props))
  if (typeof node.type !== 'string') return markup(props.children as ReactNode)
  const attrs = Object.entries(props)
    .filter(([k, v]) => k !== 'children' && typeof v !== 'function' && v !== undefined && v !== null && typeof v !== 'object')
    .filter(([k, v]) => !(v === false && !k.startsWith('aria-')))
    .map(([k, v]) => {
      const name = NAMES[k] ?? k
      return v === true && !k.startsWith('aria-') ? ` ${name}` : ` ${name}="${esc(String(v))}"`
    })
    .join('')
  return `<${node.type}${attrs}>${markup(props.children as ReactNode)}</${node.type}>`
}

/** A Popup with no behaviour, open or closed, for rendering the views. */
export function fakePopup(isOpen: boolean): Popup {
  const none = () => undefined
  return {
    isOpen,
    rootRef: { current: null },
    triggerRef: { current: null },
    panelRef: { current: null },
    toggle: none,
    close: none,
    onTriggerKeyDown: none,
    onPanelKeyDown: none,
    onRootBlur: none,
  }
}
