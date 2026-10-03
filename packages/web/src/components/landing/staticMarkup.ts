/**
 * Test helper: turns a tree of React elements from hook-free components into an
 * HTML-like string, without react-dom (this workspace resolves react-dom against a
 * different React than packages/web, so react-dom/server cannot load in node:test).
 *
 * Plain elements become `<tag attr="value">children</tag>`; function components are
 * called with their props, so only components without hooks can be rendered. Event
 * handlers are left out; `className` is written as `class`. Text is escaped.
 */
import { isValidElement, type ReactNode } from 'react'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function staticMarkup(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return esc(String(node))
  if (Array.isArray(node)) return node.map(staticMarkup).join('')
  if (!isValidElement(node)) return ''
  const props = (node.props ?? {}) as Record<string, unknown>
  if (typeof node.type === 'function') {
    return staticMarkup((node.type as (p: unknown) => ReactNode)(props))
  }
  if (typeof node.type !== 'string') return staticMarkup(props.children as ReactNode)
  const attrs = Object.entries(props)
    .filter(([k, v]) => k !== 'children' && typeof v !== 'function' && v !== undefined && v !== null)
    .map(([k, v]) => ` ${k === 'className' ? 'class' : k}="${esc(String(v))}"`)
    .join('')
  return `<${node.type}${attrs}>${staticMarkup(props.children as ReactNode)}</${node.type}>`
}
