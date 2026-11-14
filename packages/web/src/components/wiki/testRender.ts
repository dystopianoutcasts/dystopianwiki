/**
 * Test helper (not a test): renders Markdown through react-markdown with the field-notes
 * plugins and serializes the elements to an HTML string. See fieldNotes.test.ts for why it is
 * hand-written (react-markdown builds its elements with the root React 19).
 */
import { createElement } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FIELD_NOTES_REMARK_PLUGINS } from './fieldNotes'

export const NL = String.fromCharCode(10)
export const lines = (...l: string[]) => l.join(NL)
// react-markdown is hoisted to the workspace root and builds its elements with the root React
// (19), so React 18's isValidElement (and staticMarkup) does not see them. This serializer
// reads any { type, props } element.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export function toHtml(node: unknown): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return esc(String(node))
  if (Array.isArray(node)) return node.map(toHtml).join('')
  const el = node as { type?: unknown; props?: Record<string, unknown> }
  if (!el.props) return ''
  if (typeof el.type === 'function') return toHtml((el.type as (p: unknown) => unknown)(el.props))
  if (typeof el.type !== 'string') return toHtml(el.props.children)
  const attrs = Object.entries(el.props)
    .filter(([k, v]) => k !== 'children' && v !== undefined && v !== null)
    .map(([k, v]) => {
      const value = k === 'style' ? Object.entries(v as object).map(([p, x]) => `${p}:${x}`).join(';') : String(v)
      return ` ${k === 'className' ? 'class' : k}="${esc(value)}"`
    })
    .join('')
  return `<${el.type}${attrs}>${toHtml(el.props.children)}</${el.type}>`
}
export const render = (md: string, withFieldNotes = true) =>
  toHtml(
    createElement(ReactMarkdown, {
      remarkPlugins: withFieldNotes ? [remarkGfm, ...FIELD_NOTES_REMARK_PLUGINS] : [remarkGfm],
      children: md,
    }),
  )

