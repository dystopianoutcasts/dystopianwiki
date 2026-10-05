/**
 * Tests for the dark-only rules (WEBFIX, after KB14).
 *
 * Dark is the default theme: the :root values in variables.css, with no data-theme attribute
 * (nothing sets one; useTheme is not used). The 31 rules written `[data-theme="dark"] .x`
 * therefore never applied, and the light-theme base colours they were meant to replace showed
 * on the dark page (the next-step title at 2.0:1, the code block header at 1.7:1, the search
 * focus border at 2.4:1). They are now `:where(:root):not([data-theme="light"]) .x`: they match
 * whenever the theme is not light, with the specificity `[data-theme="dark"] .x` would have, so
 * the cascade is the one the rules were written for, and [data-theme="light"] is untouched.
 *
 * Two rules are added: those dark rules outrank .bookmark-button--active, so the bookmarked
 * state restates its fill; and the current page in the header, whose dark background is the
 * header's own colour, also gets an underline. Every rule's colours are checked against
 * WCAG 2.2 AA on the dark palette, read from variables.css. node:test, run with `npx tsx --test src/styles/darkTheme.test.ts` from
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

/** The 31 rules plus the two bookmarked-state rules: file, selector after the prefix, what they must meet. */
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
  ['components/header.css', '.header__nav-link--active', { kind: 'text', min: 4.5 }],
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
  ['pages/not-found-page.css', '.not-found-page__title', { kind: 'text', bg: 'var(--color-background)', min: 3 }], // 6rem
]

test('no rule is written for a [data-theme="dark"] attribute, which nothing sets', () => {
  const left = rules.filter((r) => r.selector.includes('[data-theme="dark"]')).map((r) => `${r.file}: ${r.selector}`)
  assert.deepEqual(left, [])
})

test('the dark rules match whenever the theme is not light', () => {
  assert.equal(DARK_RULES.length, 33)
  const dark = rules.filter((r) => r.selector.startsWith(DARK + ' ')).map((r) => `${r.file} ${r.selector.slice(DARK.length + 1)}`)
  assert.deepEqual(dark.sort(), DARK_RULES.map(([file, selector]) => `${file} ${selector}`).sort())
})

test('the dark prefix keeps the specificity of [data-theme="dark"]: :root sits inside :where()', () => {
  for (const r of rules) {
    if (r.selector.includes(':not([data-theme="light"])') && !r.selector.includes('mobile-menu__nav-link--active')) {
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

test('in dark the current page in the header is underlined, not only coloured', () => {
  const active = rules[at('components/header.css', '.header__nav-link--active')]
  assert.ok(active, 'rule missing')
  const shadow = /^inset 0 -2px 0 (var\(--[\w-]+\))$/.exec(active.decls.get('box-shadow') ?? '')
  assert.ok(shadow, `no underline: ${active.decls.get('box-shadow')}`)
  // Against the header (surface) and against the link's own background.
  for (const bg of ['var(--color-surface)', active.decls.get('background-color') ?? '']) {
    assert.ok(contrast(shadow[1], bg) >= 3, `${shadow[1]} on ${bg}: ${contrast(shadow[1], bg).toFixed(2)}`)
  }
})

for (const [file, selector, check] of DARK_RULES) {
  test(`dark ${selector} (${file}) meets AA on the dark palette`, () => {
    const rule = rules.find((r) => r.file === file && r.selector === `${DARK} ${selector}`)
    assert.ok(rule, 'rule missing')
    if (check.kind === 'decorative') return
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
