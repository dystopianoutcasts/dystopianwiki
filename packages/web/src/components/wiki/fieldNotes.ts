/**
 * Field notes for react-markdown: labelled callouts on every article, and the field-notes
 * directives (cards, meters, badges, the EYES ONLY banner) documented in
 * packages/shared/field-notes. Styles: styles/components/field-notes.css.
 *
 * remark-directive reads `:name`, `::name` and `:::name` everywhere, so a sentence like
 * "Note:this" would lose ":this". A directive this file does not know is put back as the text
 * it was written as, and an unknown container keeps its content.
 *
 * Layered articles (the ::field-notes marker) also get: `:cite[...]` code references and "Code"
 * table columns that the reader can hide (class fn-cite / fn-cite-col), a lede class on the
 * paragraph right after each h2, and `:::flow` step diagrams.
 */
import remarkDirective from 'remark-directive'
import type { Blockquote, List, ListItem, Paragraph, Parent, Root, RootContent, Strong, Table, Text } from 'mdast'
import type { ContainerDirective, LeafDirective, TextDirective } from 'mdast-util-directive'
import type { ElementContent } from 'hast'
import {
  DEFAULT_CALLOUT_LABEL,
  MAX_LABEL_LENGTH,
  CITE_COLUMN_HEADER,
  METER_MAX_SEGMENTS,
  badgeKindFor,
  calloutKindForLabel,
  cardAccentFor,
  hasFieldNotesMarker,
  isCalloutKind,
  meterText,
  readGauge,
  type CalloutKind,
} from '../../../../shared/field-notes'

export { hasFieldNotesMarker } from '../../../../shared/field-notes'

type Directive = ContainerDirective | LeafDirective | TextDirective
type Attrs = Record<string, string | null | undefined>

const CONTAINERS = new Set(['callout', 'cards', 'card', 'facts', 'chips', 'flow'])

// State for one render: the article's source, whether it carries the marker, and how many
// flow diagrams were drawn (each caption needs its own id).
interface Context {
  source: string
  fieldNotes: boolean
  flows: number
}

function textOf(node: { children?: unknown[]; value?: unknown }): string {
  if (typeof node.value === 'string') return node.value
  return (node.children ?? []).map((c) => textOf(c as typeof node)).join('')
}

function el(tagName: string, className: string | null, children: ElementContent[], extra: Record<string, string> = {}): ElementContent {
  return { type: 'element', tagName, properties: { ...(className ? { className: [className] } : {}), ...extra }, children }
}

const txt = (value: string): ElementContent => ({ type: 'text', value })

function setElement(node: { data?: object }, hName: string, className: string[], extra: Record<string, unknown> = {}) {
  node.data = { ...node.data, hName, hProperties: { className, ...extra } }
}

// The label paragraph that `:::name[label]` puts first in a container, removed and returned.
function takeLabel(node: ContainerDirective): string | null {
  const first = node.children[0]
  if (first?.type === 'paragraph' && first.data?.directiveLabel) {
    node.children.shift()
    return textOf(first).trim() || null
  }
  return null
}

function labelParagraph(label: string, className: string, labelClass: string): Paragraph {
  const strong: Strong = { type: 'strong', children: [{ type: 'text', value: label }] }
  setElement(strong, 'strong', [labelClass])
  const p: Paragraph = { type: 'paragraph', children: [strong] }
  setElement(p, 'p', [className])
  return p
}

function calloutClasses(kind: CalloutKind): string[] {
  return ['callout', `callout--${kind}`]
}

// `> **Key Takeaway:** text` -> a callout. The label stays in the text, as a styled <strong>.
function labelBlockquote(node: Blockquote) {
  const first = node.children[0]
  if (first?.type !== 'paragraph') return
  const [strong, next] = first.children
  if (strong?.type !== 'strong') return
  let label = textOf(strong).trim()
  if (next?.type === 'text' && next.value.startsWith(':') && !label.endsWith(':')) {
    // `**Note**: text` -> the colon joins the label
    next.value = next.value.slice(1)
    strong.children.push({ type: 'text', value: ':' })
    label += ':'
  }
  if (!label.endsWith(':') || label.length - 1 > MAX_LABEL_LENGTH) return
  setElement(node, 'blockquote', calloutClasses(calloutKindForLabel(label.slice(0, -1))))
  setElement(strong, 'strong', ['callout__label'])
}

function meterElements(label: string | null, attrs: Attrs): ElementContent[] | null {
  const gauge = readGauge(attrs.value, attrs.max, 5)
  if (!gauge || gauge.max > METER_MAX_SEGMENTS || !Number.isInteger(gauge.max) || !Number.isInteger(gauge.value)) return null
  const segments = Array.from({ length: gauge.max }, (_, i) =>
    el('span', i < gauge.value ? 'fn-meter__seg fn-meter__seg--on' : 'fn-meter__seg', []),
  )
  return [
    ...(label ? [el('span', 'fn-meter__name', [txt(label)])] : []),
    el('span', 'fn-meter__track', segments, { 'aria-hidden': 'true' }),
    el('span', 'fn-meter__text', [txt(meterText(gauge, attrs.text))]),
  ]
}

function barElements(label: string | null, attrs: Attrs): ElementContent[] | null {
  const gauge = readGauge(attrs.value, attrs.max, 100)
  if (!gauge) return null
  const percent = Math.max(2, Math.round((gauge.value / gauge.max) * 100))
  return [
    el('span', 'fn-bar__name', [txt(label ?? '')]),
    el('span', 'fn-bar__track', [
      el('span', 'fn-bar__fill', [], { 'aria-hidden': 'true', style: `width: ${percent}%` }),
      el('span', 'fn-bar__text', [txt(attrs.text || meterText(gauge, null))]),
    ]),
  ]
}

function eyesOnlyElements(label: string | null): ElementContent[] {
  const plate = (value: string, hidden: boolean) =>
    el('span', 'fn-eyes-only__plate', [txt(value)], hidden ? { 'aria-hidden': 'true' } : {})
  return [plate('EYES ONLY', false), plate(label || 'Dystopian Outcasts members', false), plate('EYES ONLY', true)]
}

// A step is a box; an arrow (decorative, hidden from screen readers) joins it to the next one.
function arrow(): Strong {
  const node: Strong = { type: 'strong', children: [] }
  setElement(node, 'span', ['fn-flow__arrow'], { 'aria-hidden': 'true' })
  return node
}

function flowStep(item: ListItem, last: boolean) {
  const inline: Strong['children'] = []
  const blocks: ListItem['children'] = []
  for (const child of item.children) {
    if (child.type === 'paragraph') {
      if (inline.length) inline.push({ type: 'text', value: ' ' })
      inline.push(...child.children)
    } else blocks.push(child)
  }
  const box: Strong = { type: 'strong', children: inline }
  setElement(box, 'div', ['fn-flow__box'])
  // Block content (a nested list) goes inside the box after the text
  box.children.push(...(blocks as unknown as Strong['children']))
  item.children = (last ? [box] : [box, arrow()]) as unknown as ListItem['children']
  setElement(item, 'li', ['fn-flow__step'])
}

// `:::flow[caption]` around a list: the list becomes an ordered list of steps named by the caption.
function transformFlow(node: ContainerDirective, label: string | null, ctx: Context) {
  const id = `fn-flow-${++ctx.flows}`
  const lists = node.children.filter((c): c is List => c.type === 'list')
  for (const list of lists) {
    list.children.forEach((item, i) => flowStep(item, i === list.children.length - 1))
    setElement(list, 'ol', ['fn-flow__steps'], label ? { 'aria-labelledby': id } : {})
  }
  if (label) {
    const caption: Paragraph = { type: 'paragraph', children: [{ type: 'text', value: label }] }
    setElement(caption, 'p', ['fn-flow__caption'], { id })
    node.children.unshift(caption)
  }
  setElement(node, 'div', ['fn-flow'])
}

// Returns false when the directive is not one of ours (the caller restores it).
function transformContainer(node: ContainerDirective, attrs: Attrs, ctx: Context): boolean {
  if (!CONTAINERS.has(node.name)) return false
  const label = takeLabel(node) ?? attrs.label ?? null
  switch (node.name) {
    case 'callout': {
      const kind: CalloutKind = isCalloutKind(attrs.kind) ? attrs.kind : 'key'
      node.children.unshift(labelParagraph(label ?? DEFAULT_CALLOUT_LABEL[kind], 'callout__label-row', 'callout__label'))
      setElement(node, 'aside', calloutClasses(kind))
      return true
    }
    case 'card': {
      if (label) node.children.unshift(labelParagraph(label, 'fn-card__label-row', 'fn-card__label'))
      setElement(node, 'div', ['fn-card', `fn-card--${cardAccentFor(attrs.accent)}`])
      return true
    }
    case 'flow':
      transformFlow(node, label, ctx)
      return true
    default:
      setElement(node, 'div', [`fn-${node.name}`])
      return true
  }
}

function transformLeaf(node: LeafDirective, attrs: Attrs): boolean {
  const label = textOf(node).trim() || null
  let children: ElementContent[] | null = null
  let className = ''
  if (node.name === 'meter') [children, className] = [meterElements(label, attrs), 'fn-meter']
  else if (node.name === 'bar') [children, className] = [barElements(label, attrs), `fn-bar fn-bar--${cardAccentFor(attrs.accent)}`]
  else if (node.name === 'eyes-only') [children, className] = [eyesOnlyElements(label), 'fn-eyes-only']
  if (!children) return false
  node.data = { hName: 'div', hProperties: { className: className.split(' ') }, hChildren: children }
  if (node.name === 'eyes-only') Object.assign(node.data.hProperties ?? {}, { role: 'note' })
  return true
}

function transformText(node: TextDirective, attrs: Attrs, ctx: Context): boolean {
  if (node.name === 'cite' && ctx.fieldNotes) {
    setElement(node, 'span', ['fn-cite'])
    return true
  }
  if (node.name !== 'badge') return false
  setElement(node, 'span', ['fn-badge', `fn-badge--${badgeKindFor(textOf(node), attrs.kind)}`])
  return true
}

// A table with a header cell that is exactly "Code": that whole column hides with the citations.
function markCiteColumns(table: Table) {
  const header = table.children[0]
  if (!header) return
  const columns = header.children.flatMap((cell, i) => (textOf(cell).trim() === CITE_COLUMN_HEADER ? [i] : []))
  if (!columns.length) return
  table.children.forEach((row, r) => {
    for (const i of columns) {
      const cell = row.children[i]
      if (cell) setElement(cell, r === 0 ? 'th' : 'td', ['fn-cite-col'])
    }
  })
}

// The first paragraph straight after each h2 is the lede.
function markLedes(root: Root) {
  root.children.forEach((node, i) => {
    const next = root.children[i + 1]
    if (node.type === 'heading' && node.depth === 2 && next?.type === 'paragraph') setElement(next, 'p', ['fn-lede'])
  })
}

function sourceOf(node: Directive, source: string): string {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  return start === undefined || end === undefined ? `:${node.name}` : source.slice(start, end)
}

function walk(parent: Parent, ctx: Context) {
  for (let i = 0; i < parent.children.length; i++) {
    const node = parent.children[i] as RootContent
    if (node.type === 'blockquote') labelBlockquote(node)
    if (node.type === 'table' && ctx.fieldNotes) markCiteColumns(node)
    if (node.type === 'leafDirective' && node.name === 'field-notes') {
      parent.children.splice(i--, 1)
      continue
    }
    if (node.type === 'containerDirective' || node.type === 'leafDirective' || node.type === 'textDirective') {
      const attrs: Attrs = node.attributes ?? {}
      const done =
        node.type === 'containerDirective'
          ? transformContainer(node, attrs, ctx)
          : node.type === 'leafDirective'
            ? transformLeaf(node, attrs)
            : transformText(node, attrs, ctx)
      if (!done) {
        if (node.type === 'containerDirective') {
          // Unknown container: keep what it holds
          parent.children.splice(i, 1, ...(node.children as RootContent[]))
          i--
          continue
        }
        const restored: Text = { type: 'text', value: sourceOf(node, ctx.source) }
        const replacement: RootContent =
          node.type === 'leafDirective' ? ({ type: 'paragraph', children: [restored] } satisfies Paragraph) : restored
        parent.children.splice(i, 1, replacement)
        continue
      }
    }
    if ('children' in node) walk(node as Parent, ctx)
  }
}

export function remarkFieldNotes() {
  return (tree: Root, file: { value?: unknown }) => {
    const source = String(file.value ?? '')
    const ctx: Context = { source, fieldNotes: hasFieldNotesMarker(source), flows: 0 }
    walk(tree, ctx)
    if (ctx.fieldNotes) markLedes(tree)
  }
}

export const FIELD_NOTES_REMARK_PLUGINS = [remarkDirective, remarkFieldNotes]
