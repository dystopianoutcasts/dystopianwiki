/**
 * Field notes: labelled callouts on every article, the field-notes directives, the plain
 * Markdown the mobile app reads, and the --fn-* colours in both themes. node:test, run with
 * `npx tsx --test src/components/wiki/fieldNotes.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FIELD_NOTES_REMARK_PLUGINS, hasFieldNotesMarker } from './fieldNotes'
import { fieldNotesToPlainMarkdown } from '../../../../shared/field-notes'

const NL = String.fromCharCode(10)
const lines = (...l: string[]) => l.join(NL)
// react-markdown is hoisted to the workspace root and builds its elements with the root React
// (19), so React 18's isValidElement (and staticMarkup) does not see them. This serializer
// reads any { type, props } element.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
function toHtml(node: unknown): string {
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
const render = (md: string, withFieldNotes = true) =>
  toHtml(
    createElement(ReactMarkdown, {
      remarkPlugins: withFieldNotes ? [remarkGfm, ...FIELD_NOTES_REMARK_PLUGINS] : [remarkGfm],
      children: md,
    }),
  )

// ─── Labelled callouts (every article) ───────────────────────────────────────

test('a blockquote that opens with a bold label is a callout, its label kept in the text', () => {
  assert.equal(
    render('> **Key Takeaway:** Cache lookups outside loops.'),
    '<blockquote class="callout callout--key">' + NL +
      '<p><strong class="callout__label">Key Takeaway:</strong> Cache lookups outside loops.</p>' + NL +
      '</blockquote>',
  )
})

test('the label picks the colour: warnings, design ideas and proofs', () => {
  assert.match(render('> **Warning:** Back up your save.'), /class="callout callout--warn"/)
  assert.match(render('> **Read this first:** x'), /class="callout callout--warn"/)
  assert.match(render('> **Mod design idea:** x'), /class="callout callout--design"/)
  assert.match(render('> **Proof:** x'), /class="callout callout--proof"/)
  assert.match(render('> **Note:** x'), /class="callout callout--key"/)
})

test('a colon after the bold label joins the label', () => {
  assert.match(render('> **Note**: keep it short.'), /<strong class="callout__label">Note:<\/strong> keep it short\./)
})

test('a quote without a bold label, or with a bold sentence, stays a plain quote', () => {
  assert.equal(render('> Just a quote.'), '<blockquote>' + NL + '<p>Just a quote.</p>' + NL + '</blockquote>')
  assert.doesNotMatch(render('> **Bold** opening without a colon.'), /callout/)
  assert.doesNotMatch(render(`> **${'A very long bold sentence that keeps going and going'}:** x`), /callout/)
})

// ─── Directives ──────────────────────────────────────────────────────────────

test('a callout directive draws an aside with its label, a default label, and a kind', () => {
  const html = render(lines(':::callout[Read this first]{kind=warn}', 'No real build steps here.', ':::'))
  assert.equal(
    html,
    '<aside class="callout callout--warn"><p class="callout__label-row"><strong class="callout__label">Read this first</strong></p>' +
      '<p>No real build steps here.</p></aside>',
  )
  assert.match(render(lines(':::callout{kind=design}', 'x', ':::')), /<strong class="callout__label">Design idea<\/strong>/)
  assert.match(render(lines(':::callout{kind=nonsense}', 'x', ':::')), /class="callout callout--key"/)
})

test('cards: a grid of cards with labels and accents', () => {
  const html = render(lines('::::cards', ':::card[How common?]{accent=purple}', '**Rare.**', ':::', ':::card', 'Plain', ':::', '::::'))
  assert.match(html, /^<div class="fn-cards"><div class="fn-card fn-card--purple"><p class="fn-card__label-row"><strong class="fn-card__label">How common\?<\/strong><\/p>/)
  assert.match(html, /<div class="fn-card fn-card--orange"><p>Plain<\/p><\/div><\/div>$/)
})

test('facts and chips wrap their list', () => {
  assert.match(render(lines(':::facts', '- **Legal status** Legal since 1934.', ':::')), /^<div class="fn-facts"><ul>/)
  assert.match(render(lines(':::chips', '- Gun shop', ':::')), /^<div class="fn-chips"><ul>/)
})

test('badges: Yes and No need no kind, other words default to maybe, kinds override', () => {
  assert.equal(render(':badge[Yes]'), '<p><span class="fn-badge fn-badge--yes">Yes</span></p>')
  assert.equal(render(':badge[No]'), '<p><span class="fn-badge fn-badge--no">No</span></p>')
  assert.equal(render(':badge[If it fits]'), '<p><span class="fn-badge fn-badge--maybe">If it fits</span></p>')
  assert.equal(render(':badge[T2 Crafted]{kind=t2}'), '<p><span class="fn-badge fn-badge--t2">T2 Crafted</span></p>')
})

test('a meter shows its value in words; the segments are hidden from screen readers', () => {
  const html = render('::meter[Suppressed 9mm, subsonic]{value=2 max=5 text="Quiet"}')
  assert.match(html, /^<div class="fn-meter"><span class="fn-meter__name">Suppressed 9mm, subsonic<\/span><span class="fn-meter__track" aria-hidden="true">/)
  assert.equal(html.match(/fn-meter__seg--on/g)?.length, 2)
  assert.equal(html.match(/class="fn-meter__seg/g)?.length, 5)
  assert.match(html, /<span class="fn-meter__text">Quiet: 2 of 5<\/span><\/div>$/)
})

test('a bar is as wide as its share, with its words beside it', () => {
  const html = render('::bar[1993]{value=10 max=100 text="Est. tens of thousands" accent=purple}')
  assert.match(html, /^<div class="fn-bar fn-bar--purple"><span class="fn-bar__name">1993<\/span>/)
  assert.match(html, /<span class="fn-bar__fill" aria-hidden="true" style="width:10%"><\/span><span class="fn-bar__text">Est. tens of thousands<\/span>/)
})

test('a meter or bar with numbers that make no sense is shown as written', () => {
  assert.equal(render('::meter{value=7 max=5}'), '<p>::meter{value=7 max=5}</p>')
  assert.equal(render('::meter{value=2 max=50}'), '<p>::meter{value=2 max=50}</p>')
  assert.equal(render('::bar[x]{value=abc}'), '<p>::bar[x]{value=abc}</p>')
})

test('the EYES ONLY banner is a note, and its repeated plate is not read twice', () => {
  assert.equal(
    render('::eyes-only'),
    '<div class="fn-eyes-only" role="note"><span class="fn-eyes-only__plate">EYES ONLY</span>' +
      '<span class="fn-eyes-only__plate">Dystopian Outcasts members</span>' +
      '<span class="fn-eyes-only__plate" aria-hidden="true">EYES ONLY</span></div>',
  )
  assert.match(render('::eyes-only[Members only]'), /<span class="fn-eyes-only__plate">Members only<\/span>/)
})

test('the field-notes marker renders nothing, and only counts outside code blocks', () => {
  assert.equal(render(lines('::field-notes', '', 'Body.')), '<p>Body.</p>')
  assert.ok(hasFieldNotesMarker(lines('---', 'x', '---', '::field-notes', '# T')))
  assert.ok(hasFieldNotesMarker('::field-notes{}'))
  assert.ok(!hasFieldNotesMarker(lines('```markdown', '::field-notes', '```')))
  assert.ok(!hasFieldNotesMarker('Write ::field-notes at the top.'))
})

// ─── Text that only looks like a directive ───────────────────────────────────

test('text that remark-directive reads as a directive, but is not ours, is put back as written', () => {
  const prose = 'Note:this, 10:30, a :foo[bar]{x=1} and key:value pairs.'
  assert.equal(render(prose), render(prose, false))
  assert.equal(render('::unknown{a=1}'), '<p>::unknown{a=1}</p>')
  assert.equal(render(lines(':::mystery', 'Kept text.', ':::')), '<p>Kept text.</p>')
})

test('directives inside code are code', () => {
  const md = lines('```markdown', ':::callout{kind=warn}', ':badge[Yes]', ':::', '```', '', 'Inline `:badge[No]` too.')
  assert.equal(render(md), render(md, false))
})

test('every published article renders as before, apart from its labelled callouts', () => {
  const root = fileURLToPath(new URL('../../../../../content/articles/', import.meta.url))
  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : [],
    )
  const articles = files(root)
  assert.ok(articles.length > 400, `found only ${articles.length} articles`)
  // `**Label**: text` moves its colon into the label; compare with the colon outside on both sides
  const colonOut = (html: string) => html.replace(/:<\/strong>/g, '</strong>:')
  const unstyle = (html: string) =>
    colonOut(html.replace(/<blockquote class="callout callout--\w+">/g, '<blockquote>').replace(/<strong class="callout__label">/g, '<strong>'))
  let callouts = 0
  for (const file of articles) {
    const body = readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    const ours = render(body)
    callouts += (ours.match(/class="callout /g) ?? []).length
    assert.equal(unstyle(ours), colonOut(render(body, false)), file)
  }
  assert.ok(callouts > 500, `only ${callouts} labelled callouts found`)
})

// ─── The mobile app's plain Markdown ─────────────────────────────────────────

test('mobile: a callout becomes a quote that opens with its label', () => {
  assert.equal(
    fieldNotesToPlainMarkdown(lines(':::callout[Read this first]{kind=warn}', 'Line one.', '', 'Line two.', ':::')),
    lines('', '> **Read this first:**', '>', '> Line one.', '>', '> Line two.', ''),
  )
  assert.match(fieldNotesToPlainMarkdown(lines(':::callout{kind=design}', 'x', ':::')), /> \*\*Design idea:\*\*/)
})

test('mobile: cards keep their labels, markers and wrappers disappear, nesting closes right', () => {
  const md = lines('::field-notes', '::::cards', ':::card[How common?]', 'Rare.', ':::', '::::', 'After.')
  assert.equal(fieldNotesToPlainMarkdown(md), lines('', '**How common?**', '', 'Rare.', '', '', 'After.'))
})

test('mobile: meters, bars, badges and the banner read as words', () => {
  assert.equal(fieldNotesToPlainMarkdown('::meter[Suppressed .22]{value=1 max=5 text="Quietest"}'), '**Suppressed .22:** Quietest: 1 of 5')
  assert.equal(fieldNotesToPlainMarkdown('::bar[1993]{value=10 text="Est. tens of thousands"}'), '**1993:** Est. tens of thousands')
  assert.equal(fieldNotesToPlainMarkdown('| :badge[Yes] | :badge[If it fits]{kind=maybe} |'), '| **Yes** | **If it fits** |')
  assert.equal(fieldNotesToPlainMarkdown('::eyes-only'), '**EYES ONLY: Dystopian Outcasts members**')
})

test('mobile: code blocks, ordinary text and unknown lines are left alone', () => {
  const md = lines('```markdown', ':::callout', ':badge[Yes]', '```', 'Note:this at 10:30.', '::unknown{a=1}', '::meter{value=9 max=5}')
  assert.equal(fieldNotesToPlainMarkdown(md), md)
  const plain = '# Title' + NL + NL + '> **Key Takeaway:** x'
  assert.equal(fieldNotesToPlainMarkdown(plain), plain)
})

// ─── Colours: every --fn-* pair meets WCAG 2.2 AA in both themes ─────────────

const css = readFileSync(fileURLToPath(new URL('../../styles/variables.css', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
function block(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`)
  assert.ok(start >= 0, `no ${selector} block`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  return new Map([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}
const dark = block(':root')
const light = new Map([...dark, ...block('[data-theme="light"]')])
function hex(theme: Map<string, string>, token: string): string {
  let v = theme.get(token)
  for (let ref = /^var\((--[\w-]+)\)$/.exec(v ?? ''); ref; ref = /^var\((--[\w-]+)\)$/.exec(v ?? '')) v = theme.get(ref[1])
  assert.ok(v && /^#[0-9a-f]{6}$/i.test(v), `${token} is not a hex colour: ${v}`)
  return v
}
function luminance(h: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const PAIRS: [string, string, number][] = [
  ['--fn-heading', '--color-background', 4.5],
  ['--fn-number-text', '--fn-number-bg', 4.5],
  ['--color-text-primary', '--fn-panel-bg', 4.5],
  ['--fn-card-label', '--fn-panel-bg', 4.5],
  ['--fn-kicker', '--fn-panel-bg', 4.5],
  ...(['key', 'warn', 'design', 'proof'] as const).flatMap((k): [string, string, number][] => [
    ['--fn-callout-text', `--fn-${k}-bg`, 4.5],
    [`--fn-${k}-label-text`, `--fn-${k}-label-bg`, 4.5],
    [`--fn-${k}-link`, `--fn-${k}-bg`, 4.5],
    [`--fn-${k}-bar`, '--color-background', 3], // the bar is the callout's edge against the page
  ]),
  ...['yes', 'no', 'maybe', 't1', 't2', 't3', 'rare'].map((k): [string, string, number] => ['--fn-badge-text', `--fn-badge-${k}`, 4.5]),
  ['--fn-table-head-text', '--fn-table-head-bg', 4.5],
  ['--fn-chip-text', '--fn-chip-bg', 4.5],
  ['--fn-plate-text', '--fn-plate-bg', 4.5],
  ['--color-text-secondary', '--color-background', 4.5],
  ['--fn-meter-on', '--color-background', 3],
  ['--fn-meter-off-border', '--color-background', 3],
  ['--fn-bar-1', '--color-background', 3],
  ['--fn-bar-2', '--color-background', 3],
  ['--fn-bar-3', '--color-background', 3],
]

for (const [name, theme] of [['dark', dark], ['light', light]] as const) {
  test(`field-notes colours meet AA in the ${name} theme`, () => {
    const failures = PAIRS.map(([fg, bg, min]) => ({ fg, bg, min, r: ratio(hex(theme, fg), hex(theme, bg)) })).filter((p) => p.r < p.min)
    assert.deepEqual(failures.map((f) => `${f.fg} on ${f.bg}: ${f.r.toFixed(2)} < ${f.min}`), [])
  })
}

test('every --fn-* token field-notes.css uses is defined for both themes', () => {
  const sheet = readFileSync(fileURLToPath(new URL('../../styles/components/field-notes.css', import.meta.url)), 'utf8')
  const used = new Set([...sheet.matchAll(/var\((--fn-[\w-]+)\)/g)].map((m) => m[1]))
  const lightOwn = block('[data-theme="light"]')
  assert.deepEqual([...used].filter((t) => !dark.has(t)), [], 'missing in :root')
  assert.deepEqual([...used].filter((t) => !lightOwn.has(t)), [], 'missing in the light theme')
})

test('the markdown renderer runs the field-notes plugins and marks a field-notes article', () => {
  const src = readFileSync(fileURLToPath(new URL('./MarkdownRenderer.tsx', import.meta.url)), 'utf8')
  assert.match(src, /const REMARK_PLUGINS = \[remarkGfm, \.\.\.FIELD_NOTES_REMARK_PLUGINS\];/)
  assert.match(src, /remarkPlugins=\{REMARK_PLUGINS\}/)
  assert.match(src, /markdown--field-notes/)
  assert.match(src, /import '..\/..\/styles\/components\/field-notes.css';/)
})
