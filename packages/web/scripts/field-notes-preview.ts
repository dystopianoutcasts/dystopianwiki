/**
 * Renders one article .md file to a standalone HTML page with the site's article styles, so a
 * field-notes article (or any article) can be checked before `npm run sync` puts it live.
 * The page has a Dark / Light switch for checking both themes.
 *
 *   cd packages/web
 *   npx tsx scripts/field-notes-preview.ts ../../content/articles/.../my-article.md preview.html
 *
 * Code blocks are not syntax-highlighted here, and the site header and sidebars are left out.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { FIELD_NOTES_REMARK_PLUGINS, hasFieldNotesMarker } from '../src/components/wiki/fieldNotes'

const [input, output = 'field-notes-preview.html'] = process.argv.slice(2)
if (!input) {
  console.error('usage: npx tsx scripts/field-notes-preview.ts <article.md> [out.html]')
  process.exit(1)
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// react-markdown builds its elements with the workspace-root React, so this reads any
// { type, props } element rather than relying on react-dom/server.
function toHtml(node: unknown): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return esc(String(node))
  if (Array.isArray(node)) return node.map(toHtml).join('')
  const el = node as { type?: unknown; props?: Record<string, unknown> }
  if (!el.props) return ''
  if (typeof el.type === 'function') return toHtml((el.type as (p: unknown) => unknown)(el.props))
  if (typeof el.type !== 'string') return toHtml(el.props.children)
  const attrs = Object.entries(el.props)
    .filter(([k, v]) => k !== 'children' && v !== undefined && v !== null && typeof v !== 'function')
    .map(([k, v]) => {
      const value = k === 'style' ? Object.entries(v as object).map(([p, x]) => `${p}:${x}`).join(';') : String(v)
      return ` ${k === 'className' ? 'class' : k}="${esc(value)}"`
    })
    .join('')
  return `<${el.type}${attrs}>${toHtml(el.props.children)}</${el.type}>`
}

// Just enough frontmatter for the header: `key: value` and `tags: [a, b]`
const source = readFileSync(input, 'utf8')
const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source)
const meta = new Map<string, string>()
for (const line of (fm?.[1] ?? '').split(/\r?\n/)) {
  const m = /^(\w+):\s*(.*)$/.exec(line)
  if (m) meta.set(m[1], m[2].replace(/^["']|["']$/g, ''))
}
const body = fm ? source.slice(fm[0].length) : source
const tags = (meta.get('tags') ?? '').replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean)
const fieldNotes = hasFieldNotesMarker(body)

const content = toHtml(
  createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm, ...FIELD_NOTES_REMARK_PLUGINS],
    rehypePlugins: [rehypeSlug],
    children: body,
  }),
)
  // the site wraps every table in a scrolling box (ScrollBox in MarkdownRenderer.tsx)
  .replace(/<table>/g, '<div class="markdown-table-scroll"><table>')
  .replace(/<\/table>/g, '</table></div>')

const styles = ['variables.css', 'components/markdown.css', 'components/field-notes.css', 'components/wiki-article.css']
  .map((f) => readFileSync(fileURLToPath(new URL(`../src/styles/${f}`, import.meta.url)), 'utf8'))
  .join('\n')

const header = `
<header class="wiki-article__header">
  <div class="wiki-article__meta">
    <span class="wiki-article__category">${esc(meta.get('category') ?? 'Article')}</span>
    ${meta.get('difficulty') ? `<span class="wiki-article__difficulty wiki-article__difficulty--${esc(meta.get('difficulty')!)}">${esc(meta.get('difficulty')!)}</span>` : ''}
  </div>
  <div class="wiki-article__title-row"><h1 class="wiki-article__title">${esc(meta.get('title') ?? 'Untitled')}</h1></div>
  ${meta.get('excerpt') ? `<p class="wiki-article__excerpt">${esc(meta.get('excerpt')!)}</p>` : ''}
  <div class="wiki-article__tags">${tags.map((t) => `<span class="wiki-article__tag">#${esc(t)}</span>`).join('')}</div>
</header>`

writeFileSync(
  output,
  `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.get('title') ?? 'Preview')} (preview)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Russo+One&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
${styles}
body { margin: 0; background: var(--color-background); color: var(--color-text-primary); font-family: var(--font-family-sans); font-size: 17px; }
h1, h2, h3, h4 { font-family: var(--font-family-display); font-weight: var(--font-weight-normal); }
.preview-bar { display: flex; gap: 8px; justify-content: flex-end; padding: 12px 16px; }
.preview-bar button { font: inherit; font-weight: 700; padding: 6px 14px; min-height: 44px; border-radius: 8px; border: 1px solid var(--color-control-border); background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
.preview-bar button[aria-pressed="true"] { background: var(--color-accent-600); color: var(--color-on-accent); }
.preview-bar button:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
.preview-page { max-width: 860px; margin: 0 auto; padding: 0 16px 64px; }
</style>
</head>
<body>
<div class="preview-bar" role="group" aria-label="Theme">
  <button type="button" data-set="dark" aria-pressed="true">Dark</button>
  <button type="button" data-set="light" aria-pressed="false">Light</button>
</div>
<main class="preview-page">
<article class="wiki-article${fieldNotes ? ' wiki-article--field-notes' : ''}">
${header}
<div class="wiki-article__content"><div class="markdown${fieldNotes ? ' markdown--field-notes' : ''}">${content}</div></div>
</article>
</main>
<script>
for (const b of document.querySelectorAll('[data-set]')) b.addEventListener('click', () => {
  document.documentElement.dataset.theme = b.dataset.set
  for (const o of document.querySelectorAll('[data-set]')) o.setAttribute('aria-pressed', String(o === b))
})
</script>
</body>
</html>
`,
)
console.log(`wrote ${output}${fieldNotes ? ' (field notes)' : ''}`)
