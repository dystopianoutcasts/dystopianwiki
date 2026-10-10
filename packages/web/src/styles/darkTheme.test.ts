/**
 * Tests for the dark-only rules (WEBFIX, after KB14).
 *
 * Dark is the default theme: the :root values in variables.css. Until KB15 nothing set a
 * data-theme attribute, so the 31 rules written `[data-theme="dark"] .x` never applied, and
 * the light-theme base colours they were meant to replace showed on the dark page (the next-step title at 2.0:1, the code block header at 1.7:1, the search
 * focus border at 2.4:1). They are now `:where(:root):not([data-theme="light"]) .x`: they match
 * whenever the theme is not light, with the specificity `[data-theme="dark"] .x` would have, so
 * the cascade is the one the rules were written for, and [data-theme="light"] is untouched.
 * Since KB15 the site header's theme control writes data-theme="light" or "dark" (System
 * follows the system setting); the same prefix matches "dark" and a missing attribute alike.
 *
 * Two rules were added: those dark rules outrank .bookmark-button--active, so the bookmarked
 * state restates its fill. The header's own rules moved with the header to the shared
 * packages/shared/site-header (tested there, both themes). KB15 also moved the bookmark card's
 * dark rules off @media (prefers-color-scheme: dark), which ignored the visitor's choice, onto
 * the same prefix. Every rule's colours are checked against
 * WCAG 2.2 AA on the dark palette, read from variables.css.
 *
 * KB17 fixed four dark failures that predated KB15 and KB16: white on the orange buttons (3.22:1,
 * the hero button 2.67:1) is now black via --color-on-accent; article links, told from body
 * text by colour alone (1.9:1), are underlined as in light (heading anchors stay plain); code
 * line numbers went from 3.5 to 6.5:1; form control outlines from about 1.6 to 3.7:1 or more. node:test, run with `npx tsx --test src/styles/darkTheme.test.ts` from
 * packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const STYLES = fileURLToPath(new URL('./', import.meta.url))
const DARK = ':where(:root):not([data-theme="light"])'

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? cssFiles(join(dir, e.name)) : e.name.endsWith('.css') ? [join(dir, e.name)] : [],
  )
}
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')
const sources = new Map(cssFiles(STYLES).map((f) => [relative(STYLES, f).replace(/\\/g, '/'), strip(readFileSync(f, 'utf8'))]))

interface Rule { file: string; selector: string; decls: Map<string, string> }
const rules: Rule[] = []
for (const [file, src] of sources) {
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = new Map<string, string>()
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':')
      if (i > 0) decls.set(d.slice(0, i).trim(), d.slice(i + 1).trim())
    }
    rules.push({ file, selector: m[1].trim().replace(/\s+/g, ' '), decls })
  }
}

// The dark palette: the :root custom properties of variables.css.
const tokens = new Map<string, string>()
for (const r of rules) {
  if (r.file === 'variables.css' && r.selector === ':root') for (const [k, v] of r.decls) if (k.startsWith('--')) tokens.set(k, v)
}
function resolve(value: string): string {
  const m = /^var\((--[\w-]+)(?:,\s*([^)]+))?\)$/.exec(value.trim())
  if (!m) return value.trim()
  const v = tokens.get(m[1])
  return v ? resolve(v) : (m[2] ?? '').trim()
}
function luminance(hex: string): number {
  const h = /^#([0-9a-f]{6})$/i.exec(hex)
  assert.ok(h, `not a 6-digit hex colour: ${hex}`)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h[1].slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(resolve(a)), luminance(resolve(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

type Check =
  | { kind: 'text'; fg?: string; bg?: string; min: number } // fg/bg default to the rule's own colour and background
  | { kind: 'border'; against: string[] } // a focus or hover border, 3:1 against what it sits on
  | { kind: 'decorative' } // a shadow or a scrollbar thumb
  | { kind: 'underline' } // a link told from body text by an underline, not by colour alone
  | { kind: 'plain' } // a link that must not be underlined (a heading anchor)

/** The 30 rules left after the header moved out, the two bookmarked-state rules, the two bookmark-card rules and KB17's three (article links, heading anchors, the unfilled completed button): file, selector after the prefix, what they must meet. */
const DARK_RULES: [string, string, Check][] = [
  ['components/bookmark-button.css', '.bookmark-button', { kind: 'text', fg: 'var(--color-text-primary)', min: 4.5 }],
  ['components/bookmark-button.css', '.bookmark-button:hover:not(:disabled)', { kind: 'text', fg: 'var(--color-text-primary)', min: 4.5 }],
  ['components/bookmark-button.css', '.bookmark-button--active', { kind: 'text', fg: '#ffffff', min: 4.5 }],
  ['components/bookmark-button.css', '.bookmark-button--active:hover:not(:disabled)', { kind: 'text', fg: '#ffffff', min: 4.5 }],
  ['components/cards.css', '.section-card--primary .section-card__link', { kind: 'text', bg: 'var(--color-surface)', min: 4.5 }],
  ['components/cards.css', '.section-card--accent .section-card__link', { kind: 'text', bg: 'var(--color-surface)', min: 4.5 }],
  ['components/code-block.css', '.code-block__header', { kind: 'text', fg: 'var(--color-text-secondary)', min: 4.5 }],
  ['components/code-block.css', '.code-block__copy--copied', { kind: 'text', min: 4.5 }],
  ['components/code-block.css', '.code-block .hljs-keyword', { kind: 'text', bg: 'var(--color-code-bg)', min: 4.5 }],
  ['components/code-block.css', '.code-block .hljs-string', { kind: 'text', bg: 'var(--color-code-bg)', min: 4.5 }],
  ['components/code-block.css', '.code-block .hljs-comment', { kind: 'text', bg: 'var(--color-code-bg)', min: 4.5 }],
  ['components/quickstart.css', '.quickstart-card:hover', { kind: 'border', against: ['var(--color-background)'] }],
  ['components/quickstart.css', '.quickstart-card__section--modding', { kind: 'text', min: 4.5 }],
  ['components/quickstart.css', '.quickstart-card__section--mapping', { kind: 'text', min: 4.5 }],
  ['components/related-articles.css', '.related-article:hover', { kind: 'border', against: ['var(--color-background)'] }],
  ['components/related-articles.css', '.related-article__category', { kind: 'text', min: 4.5 }],
  ['components/related-articles.css', '.related-article__difficulty--beginner', { kind: 'text', min: 4.5 }],
  ['components/related-articles.css', '.related-article__difficulty--intermediate', { kind: 'text', min: 4.5 }],
  ['components/related-articles.css', '.related-article__difficulty--advanced', { kind: 'text', min: 4.5 }],
  ['components/search-bar.css', '.search-bar__input-wrapper:focus-within', { kind: 'border', against: ['var(--color-surface)', 'var(--color-background)'] }],
  ['components/search-bar.css', '.search-bar__clear:hover', { kind: 'text', min: 3 }],
  ['components/search-bar.css', '.search-suggestion__badge', { kind: 'text', min: 4.5 }],
  ['components/sidebar.css', '.sidebar::-webkit-scrollbar-thumb', { kind: 'decorative' }],
  ['components/sidebar.css', '.sidebar__category-link--active', { kind: 'text', min: 4.5 }],
  ['components/table-of-contents.css', '.toc__link--active', { kind: 'text', min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__category', { kind: 'text', min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__difficulty--beginner', { kind: 'text', min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__difficulty--intermediate', { kind: 'text', min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__difficulty--advanced', { kind: 'text', min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__next-step:hover', { kind: 'decorative' }],
  ['components/wiki-article.css', '.wiki-article__next-step-title', { kind: 'text', bg: 'var(--color-background)', min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__complete-btn--completed', { kind: 'text', bg: 'var(--color-surface)', min: 4.5 }], // no fill: white on the article's background-to-surface gradient (the lighter end), not on-accent black
  ['components/markdown.css', '.markdown a', { kind: 'underline' }],
  ['components/markdown.css', '.markdown :is(h1, h2, h3, h4, h5, h6) a', { kind: 'plain' }],
  ['pages/not-found-page.css', '.not-found-page__title', { kind: 'text', bg: 'var(--color-background)', min: 3 }], // 6rem
  ['pages/bookmarks-page.css', '.bookmark-card', { kind: 'text', fg: 'var(--color-text-primary)', min: 4.5 }],
  ['pages/bookmarks-page.css', '.bookmark-card:hover', { kind: 'decorative' }],
]

test('no rule is written for a [data-theme="dark"] attribute: dark is also the page with no attribute at all', () => {
  const left = rules.filter((r) => r.selector.includes('[data-theme="dark"]')).map((r) => `${r.file}: ${r.selector}`)
  assert.deepEqual(left, [])
})

test('the dark rules match whenever the theme is not light', () => {
  assert.equal(DARK_RULES.length, 37)
  const dark = rules.filter((r) => r.selector.startsWith(DARK + ' ')).map((r) => `${r.file} ${r.selector.slice(DARK.length + 1)}`)
  assert.deepEqual(dark.sort(), DARK_RULES.map(([file, selector]) => `${file} ${selector}`).sort())
})

test('the dark prefix keeps the specificity of [data-theme="dark"]: :root sits inside :where()', () => {
  for (const r of rules) {
    if (r.selector.includes(':not([data-theme="light"])')) {
      assert.ok(r.selector.startsWith(DARK + ' '), `${r.file}: ${r.selector}`)
    }
  }
})

/** Index of a rule in its file's order (rules are collected file by file, top to bottom). */
const at = (file: string, selector: string) => rules.findIndex((r) => r.file === file && r.selector === `${DARK} ${selector}`)

test('in dark a bookmarked button still looks bookmarked, resting and hovered', () => {
  const f = 'components/bookmark-button.css'
  const base = rules[at(f, '.bookmark-button')], active = rules[at(f, '.bookmark-button--active')]
  const hover = rules[at(f, '.bookmark-button:hover:not(:disabled)')], activeHover = rules[at(f, '.bookmark-button--active:hover:not(:disabled)')]
  assert.ok(base && active && hover && activeHover, 'a bookmark rule is missing')
  // Same specificity, so the active rules must come later to win.
  assert.ok(at(f, '.bookmark-button--active') > at(f, '.bookmark-button'))
  assert.ok(at(f, '.bookmark-button--active:hover:not(:disabled)') > at(f, '.bookmark-button:hover:not(:disabled)'))
  assert.notEqual(resolve(active.decls.get('background') ?? ''), resolve(base.decls.get('background') ?? ''))
  assert.notEqual(resolve(activeHover.decls.get('background') ?? ''), resolve(hover.decls.get('background') ?? ''))
})

test("no dark rule follows the system setting instead of the visitor's theme choice", () => {
  const left = [...sources].filter(([, src]) => /@media\s*\(prefers-color-scheme/.test(src)).map(([file]) => file)
  assert.deepEqual(left, [])
})

for (const [file, selector, check] of DARK_RULES) {
  test(`dark ${selector} (${file}) meets AA on the dark palette`, () => {
    const rule = rules.find((r) => r.file === file && r.selector === `${DARK} ${selector}`)
    assert.ok(rule, 'rule missing')
    if (check.kind === 'decorative') return
    if (check.kind === 'underline' || check.kind === 'plain') {
      const deco = rule.decls.get('text-decoration') ?? ''
      if (check.kind === 'underline') assert.match(deco, /underline/, `${selector}: text-decoration ${deco}`)
      else assert.equal(deco, 'none', `${selector}: text-decoration ${deco}`)
      return
    }
    if (check.kind === 'border') {
      const border = rule.decls.get('border-color')
      assert.ok(border, 'no border-color')
      for (const bg of check.against) assert.ok(contrast(border, bg) >= 3, `${border} on ${bg}: ${contrast(border, bg).toFixed(2)}`)
      return
    }
    const fg = check.fg ?? rule.decls.get('color')
    const bg = check.bg ?? rule.decls.get('background-color') ?? rule.decls.get('background')
    assert.ok(fg && bg, `colour pair incomplete: ${fg} on ${bg}`)
    const ratio = contrast(fg, bg)
    assert.ok(ratio >= check.min, `${fg} on ${bg}: ${ratio.toFixed(2)}:1, needs ${check.min}:1`)
  })
}

// KB17: the four dark failures KB16 deferred.
const v = (name: string) => `var(--color-${name})`
const ACCENT_FILLS = ['accent-400', 'accent-500', 'accent-600', 'accent-700'] // every fill text on an accent sits on, hover included

test('dark text on an orange fill meets 4.5:1 on every accent fill, hover included', () => {
  for (const f of ACCENT_FILLS) {
    const k = contrast(v('on-accent'), v(f))
    assert.ok(k >= 4.5, `${resolve(v('on-accent'))} on ${f} ${resolve(v(f))}: ${k.toFixed(2)}:1`)
  }
})

test('every dark rule that writes on-accent text sets an accent fill under it', () => {
  const users = rules.filter((r) => r.file !== 'variables.css' && !r.selector.startsWith('[data-theme="light"]') && r.decls.get('color') === v('on-accent'))
  assert.equal(users.length, 11, 'the 11 button and badge rules that use --color-on-accent')
  for (const r of users) {
    const bg = r.decls.get('background-color') ?? r.decls.get('background') ?? ''
    assert.ok(ACCENT_FILLS.map(v).includes(bg), `${r.file} ${r.selector}: on-accent text on ${bg || 'no fill of its own'}`)
  }
  // Their hover, focus and active states may change only the fill, keeping the text: that fill
  // must be an accent fill too.
  const base = (sel: string) => sel.replace(/:(hover|focus-visible|focus|active)/g, '').replace(/:not\(:disabled\)/g, '')
  const owners = new Set(users.map((r) => `${r.file} ${base(r.selector)}`))
  const states = rules.filter((r) => r.selector !== base(r.selector) && owners.has(`${r.file} ${base(r.selector)}`) && (r.decls.has('background') || r.decls.has('background-color')))
  assert.ok(states.length >= 8, `only ${states.length} state rules found`)
  for (const r of states) {
    const bg = r.decls.get('background-color') ?? r.decls.get('background') ?? ''
    assert.ok(ACCENT_FILLS.map(v).includes(bg), `${r.file} ${r.selector}: on-accent text on ${bg}`)
  }
})

test('article links in dark are told apart from body text by more than colour', () => {
  // 1.4.1: the colours alone do not do it (control), so the underline must (rule checks above).
  assert.ok(contrast(v('link'), v('text-primary')) < 3, 'control: the link and text colours alone tell links apart')
  const link = rules.findIndex((r) => r.file === 'components/markdown.css' && r.selector === `${DARK} .markdown a`)
  const heading = rules.findIndex((r) => r.file === 'components/markdown.css' && r.selector === `${DARK} .markdown :is(h1, h2, h3, h4, h5, h6) a`)
  assert.ok(link >= 0 && heading > link, 'the heading-anchor rule must come after the link rule')
})

test('code line numbers in dark meet 4.5:1 on the code background', () => {
  const rule = rules.find((r) => r.file === 'components/code-block.css' && r.selector === '.code-block__line-numbers')
  assert.equal(rule?.decls.get('color'), v('code-line-number'))
  const k = contrast(v('code-line-number'), v('code-bg'))
  assert.ok(k >= 4.5, `${resolve(v('code-line-number'))} on ${resolve(v('code-bg'))}: ${k.toFixed(2)}:1`)
})

test('form control outlines in dark meet 3:1 on the page and on cards', () => {
  for (const g of ['background', 'surface']) {
    const k = contrast(v('control-border'), v(g))
    assert.ok(k >= 3, `${resolve(v('control-border'))} on ${g} ${resolve(v(g))}: ${k.toFixed(2)}:1`)
  }
})
