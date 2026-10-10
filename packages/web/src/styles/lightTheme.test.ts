/**
 * Tests for the light theme's colours (KB16).
 *
 * The light theme is the [data-theme="light"] block of variables.css over the :root values,
 * plus the rules that apply only in light: base rules whose colour the dark rules
 * (`:where(:root):not([data-theme="light"]) .x`) override, and `[data-theme="light"] .x` rules.
 * Until KB15 nothing set data-theme, so this palette was never seen, and it was a second dark
 * palette (navy #000d23 with cyan) under base rules written for a light page: the code block
 * label read 1.03:1, the next-step title 2.16:1. It is now a light theme in the brand's blues,
 * and every pair below is checked against WCAG 2.2 AA (4.5:1 text, 3:1 large text and non-text
 * UI) on the light palette, read from variables.css. A guard pins the dark values the new tokens
 * add (KB17 changed three of them on purpose; darkTheme.test.ts checks those).
 *
 * node:test, run with `npx tsx --test src/styles/lightTheme.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const STYLES = fileURLToPath(new URL('./', import.meta.url))
const LIGHT = '[data-theme="light"]'

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

function palette(light: boolean): Map<string, string> {
  const t = new Map<string, string>()
  for (const r of rules) if (r.file === 'variables.css' && r.selector === ':root') for (const [k, v] of r.decls) if (k.startsWith('--')) t.set(k, v)
  if (light) for (const r of rules) if (r.file === 'variables.css' && r.selector === LIGHT) for (const [k, v] of r.decls) if (k.startsWith('--')) t.set(k, v)
  return t
}
const lightTokens = palette(true)
const darkTokens = palette(false)

function resolveWith(tokens: Map<string, string>, value: string): string {
  const m = /^var\((--[\w-]+)(?:,\s*([^)]+))?\)$/.exec(value.trim())
  if (!m) return value.trim() === 'white' ? '#ffffff' : value.trim()
  const v = tokens.get(m[1])
  return v ? resolveWith(tokens, v) : (m[2] ?? '').trim()
}
const resolve = (v: string) => resolveWith(lightTokens, v)
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
const v = (name: string) => `var(--color-${name})`
const GROUNDS = [v('background'), v('surface'), v('surface-elevated')]

test('the light palette is a light theme: dark text on light grounds', () => {
  for (const g of GROUNDS) assert.ok(luminance(resolve(g)) > 0.7, `${g} = ${resolve(g)} is not a light ground`)
  assert.ok(luminance(resolve(v('text-primary'))) < 0.05, 'primary text is not dark')
})

/** [foreground, background, minimum]: the token pairs every light page is made of. */
const PAIRS: [string, string, number][] = [
  ...GROUNDS.flatMap((g): [string, string, number][] => [
    [v('text-primary'), g, 4.5], [v('text-secondary'), g, 4.5], [v('text-muted'), g, 4.5],
    [v('link'), g, 4.5], [v('link-hover'), g, 4.5],
    [v('focus-ring'), g, 3], // a focus indicator is non-text UI
    [v('badge-new'), g, 4.5], [v('badge-advanced'), g, 4.5], [v('badge-beginner'), g, 4.5], [v('badge-intermediate'), g, 4.5],
  ]),
  [v('code-text'), v('code-bg'), 4.5],
  [v('inline-code-text'), v('inline-code-bg'), 4.5],
  [v('text-primary'), v('alert-info-bg'), 4.5],
  [v('text-primary'), v('alert-warning-bg'), 4.5],
  [v('alert-info-border'), v('alert-info-bg'), 3],
  [v('alert-warning-border'), v('alert-warning-bg'), 3],
  [v('code-text'), v('code-bg'), 3], // a focused code block's ring (code-block.css) is drawn in the code colour
  [v('on-accent'), v('accent-400'), 4.5], [v('on-accent'), v('accent-500'), 4.5], [v('on-accent'), v('accent-600'), 4.5], [v('on-accent'), v('accent-700'), 4.5],
]
for (const [fg, bg, min] of PAIRS) {
  test(`light ${fg} on ${bg} meets ${min}:1`, () => {
    const k = contrast(fg, bg)
    assert.ok(k >= min, `${resolve(fg)} on ${resolve(bg)}: ${k.toFixed(2)}:1`)
  })
}

test('links in light are told apart from body text by more than colour', () => {
  // 1.4.1: navy links in navy text differ by colour alone, so article links are underlined in light.
  assert.ok(contrast(v('link'), v('text-primary')) < 3, 'control: the colours alone do not tell links apart')
  const link = rules.find((r) => r.file === 'components/markdown.css' && r.selector === `${LIGHT} .markdown a`)
  assert.ok(link, `${LIGHT} .markdown a rule missing`)
  assert.match(link.decls.get('text-decoration') ?? '', /underline/)
  // Every heading is a link to itself; those anchors stay plain.
  const heading = rules.find((r) => r.file === 'components/markdown.css' && r.selector === `${LIGHT} .markdown :is(h1, h2, h3, h4, h5, h6) a`)
  assert.equal(heading?.decls.get('text-decoration'), 'none', 'heading anchors are underlined in light')
  assert.ok(rules.indexOf(heading!) > rules.indexOf(link), 'the heading rule must come after the link rule')
})

test('a focused code block shows its ring in the code colour, on the code background', () => {
  const rule = rules.find((r) => r.file === 'components/code-block.css' && r.selector === '.code-block__content:focus-visible')
  assert.ok(rule, 'focus rule missing')
  assert.match(rule.decls.get('outline') ?? '', /^2px solid var\(--color-code-text\)$/)
})

type Check = { fg?: string; bg?: string; min: number }
/** Rules that apply in light only (their dark rule overrides the colour), or light rules. */
const LIGHT_RULES: [string, string, Check][] = [
  ['components/code-block.css', '.code-block__header', { fg: v('text-secondary'), min: 4.5 }],
  ['components/code-block.css', '.code-block__copy--copied', { min: 4.5 }],
  ['components/quickstart.css', '.quickstart-card__section--mapping', { min: 4.5 }],
  ['components/related-articles.css', '.related-article__difficulty--beginner', { min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__difficulty--beginner', { min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__next-step-title', { bg: v('background'), min: 4.5 }],
  ['components/cards.css', '.section-card--primary .section-card__link', { bg: v('surface'), min: 4.5 }],
  ['pages/not-found-page.css', '.not-found-page__title', { bg: v('background'), min: 3 }], // 6rem
  ['pages/search-page.css', `${LIGHT} .search-page__result-category`, { bg: v('accent-100'), min: 4.5 }],
  ['components/wiki-article.css', '.wiki-article__complete-btn', { min: 4.5 }],
  ['pages/article-page.css', '.article-page__back-link', { min: 4.5 }],
  ['pages/category-page.css', '.category-page__back-link', { min: 4.5 }],
  ['pages/section-page.css', '.section-page__back-link', { min: 4.5 }],
  ['pages/version-page.css', '.version-page__back-link', { min: 4.5 }],
  ['pages/not-found-page.css', '.not-found-page__button--primary', { min: 4.5 }],
  ['pages/reset-password-page.css', '.reset-password-page__submit', { min: 4.5 }],
  ['components/learning-path.css', '.learning-card__check', { min: 4.5 }],
  ['components/hero.css', '.hero__learn-btn', { min: 4.5 }],
  ['components/hero.css', `${LIGHT} .hero__learn-btn`, { fg: v('on-accent'), min: 4.5 }],
  ['components/hero.css', `${LIGHT} .hero__learn-btn:hover`, { fg: v('on-accent'), min: 4.5 }],
  ['components/hero.css', `${LIGHT} .hero__subtitle em`, { bg: '#f5d4ab', min: 4.5 }], // the hero gradient's darkest stop for copper text
  ['components/hero.css', `${LIGHT} .hero__actions-hint`, { bg: '#f5d4ab', min: 4.5 }],
  ['components/about-section.css', `${LIGHT} .about-section__text strong`, { bg: v('background'), min: 4.5 }],
  ['components/home-sections.css', `${LIGHT} .home-step__number`, { bg: v('surface'), min: 4.5 }],
  ['components/leaderboard.css', `${LIGHT} .lb-medal--gold`, { bg: v('background'), min: 4.5 }],
  ['components/leaderboard.css', `${LIGHT} .lb-medal--silver`, { bg: v('background'), min: 4.5 }],
  ['components/leaderboard.css', `${LIGHT} .lb-medal--bronze`, { bg: v('background'), min: 4.5 }],
  ['components/learning-path.css', `${LIGHT} .learning-card__difficulty--beginner`, { min: 4.5 }],
  ['components/learning-path.css', `${LIGHT} .learning-card__difficulty--intermediate`, { min: 4.5 }],
  ['components/learning-path.css', `${LIGHT} .learning-card__difficulty--advanced`, { min: 4.5 }],
  ['components/support-section.css', `${LIGHT} .support-section__button`, { bg: v('surface'), min: 4.5 }],
  ['pages/privacy-policy-page.css', `${LIGHT} .privacy-policy-page__content a, ${LIGHT} .privacy-policy-page__content a:hover`, { bg: v('surface'), min: 4.5 }],
  ['pages/reset-password-page.css', `${LIGHT} .reset-password-page__error, ${LIGHT} .reset-password-page__field-error`, { bg: '#f3dce0', min: 4.5 }], // its red tint over the card
  ['pages/terms-page.css', `${LIGHT} .terms-page__content h2, ${LIGHT} .terms-page__content ul li::before`, { bg: v('surface'), min: 4.5 }],
  ['pages/bookmarks-page.css', `${LIGHT} .bookmarks-page__cta`, { min: 4.5 }],
  ['components/search-bar.css', `${LIGHT} .search-suggestion__badge`, { min: 4.5 }],
  ['components/search-bar.css', `${LIGHT} .search-suggestion__title mark`, { min: 4.5 }],
  ['base.css', `${LIGHT} ::selection`, { min: 4.5 }],
  ['components/code-block.css', '.code-block__line-numbers', { bg: v('code-bg'), min: 4.5 }],
]

test('the light hero backgrounds are pale enough for the navy hero text at every stop', () => {
  for (const [file, selector] of [['components/hero.css', `${LIGHT} .hero__gradient`], ['components/learning-path.css', `${LIGHT} .learning-path__hero`]]) {
    const rule = rules.find((r) => r.file === file && r.selector === selector)
    assert.ok(rule, `${selector} missing`)
    const stops = [...(rule.decls.get('background') ?? '').matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0])
    assert.ok(stops.length >= 2, `${selector}: no colour stops`)
    for (const s of stops) {
      for (const fg of [v('text-primary'), v('text-secondary')]) assert.ok(contrast(fg, s) >= 4.5, `${selector}: ${resolve(fg)} on stop ${s}: ${contrast(fg, s).toFixed(2)}`)
    }
  }
})

test('form controls in light are outlined at 3:1 on every ground', () => {
  for (const g of GROUNDS) assert.ok(contrast(v('control-border'), g) >= 3, `${resolve(v('control-border'))} on ${resolve(g)}: ${contrast(v('control-border'), g).toFixed(2)}`)
  for (const [file, selector] of [['components/version-select.css', '.version-select__control'], ['components/search-bar.css', '.search-bar__input-wrapper'], ['pages/search-page.css', '.search-page__input'], ['pages/reset-password-page.css', '.reset-password-page__input']]) {
    const rule = rules.find((r) => r.file === file && r.selector === selector)
    assert.ok(rule, `${selector} missing`)
    assert.match(rule.decls.get('border') ?? '', /var\(--color-control-border\)/, selector)
  }
})
for (const [file, selector, check] of LIGHT_RULES) {
  test(`light ${selector} (${file}) meets AA on the light palette`, () => {
    const rule = rules.find((r) => r.file === file && r.selector === selector)
    assert.ok(rule, 'rule missing')
    const fg = check.fg ?? rule.decls.get('color')
    const bg = check.bg ?? rule.decls.get('background-color') ?? rule.decls.get('background')
    assert.ok(fg && bg, `colour pair incomplete: ${fg} on ${bg}`)
    const k = contrast(fg, bg)
    assert.ok(k >= check.min, `${resolve(fg)} on ${resolve(bg)}: ${k.toFixed(2)}:1, needs ${check.min}:1`)
  })
}

test('the tokens KB16 adds have the dark values intended (KB17 changed three, checked in darkTheme.test.ts)', () => {
  const d = (name: string) => resolveWith(darkTokens, v(name))
  assert.equal(d('on-accent'), '#000000', 'KB17: text on orange fills is black in dark too (white read 2.7 to 3.2:1)')
  assert.equal(d('inline-code-bg'), d('code-bg'), 'inline code in dark keeps the code background')
  assert.equal(d('inline-code-text'), d('code-text'), 'inline code in dark keeps the code colour')
  assert.equal(d('control-border'), d('primary-400'), 'KB17: form controls in dark are outlined in primary-400 (the divider colour read 1.6:1)')
  assert.equal(d('code-line-number'), d('text-secondary'), 'KB17: line numbers in dark use the secondary text colour (the muted one read 3.5:1)')
})

test('the dark :root palette is the one darkTheme.test.ts checks (no KB16 value changed it)', () => {
  const pinned: Record<string, string> = {
    '--color-background': 'var(--color-primary-900)', '--color-surface': 'var(--color-primary-800)',
    '--color-surface-elevated': 'var(--color-primary-700)', '--color-text-primary': '#f0f4f8',
    '--color-text-secondary': '#94a3b8', '--color-text-muted': '#64748b', '--color-link': 'var(--color-accent-400)',
    '--color-link-hover': 'var(--color-accent-300)', '--color-focus-ring': 'var(--color-accent-500)',
    '--color-code-bg': 'var(--color-primary-800)', '--color-code-text': 'var(--color-accent-300)',
    '--color-border': 'var(--color-primary-700)', '--color-border-light': 'var(--color-primary-800)',
  }
  for (const [k, val] of Object.entries(pinned)) assert.equal(darkTokens.get(k), val, k)
})

/**
 * Every rule that sets a text colour and applies in light, not only the ones listed above: its
 * colour on the light page and card surface (or on its own background, when it sets one) must
 * meet 4.5:1. A rule with its own light override is checked through the override. Rules whose
 * ground is dark in both themes are listed with the reason.
 */
const ON_DARK_GROUND: [RegExp, string][] = [
  [/^\.code-block \.hljs-|^\.code-block__content code$|^pre code$|^\.code-block__line-numbers$/, 'code text and line numbers sit on the code block, dark navy in both themes'],
  [/^\.sidebar__learning-link--active$/, 'white on its orange-to-purple gradient; the Sidebar component is not rendered (nothing imports it)'],
  [/^\.community-banner/, 'the community banner is a fixed dark gradient in both themes'],
  [/^\.server-now/, 'the server card is a fixed dark panel in both themes'],
  [/^\.lb-medal--(gold|silver|bronze) \.lb-medal__crown$/, 'medal crown fills are graphics beside the rank number, which has its own light rule'],
]
const DARK_SCOPE = /:not\(\[data-theme="light"\]\)/
/** The light rule that restates `selector` (alone or in a group), if any. */
function lightOverride(selector: string): Rule | undefined {
  return rules.find((r) => r.selector.split(',').map((s) => s.trim()).includes(`${LIGHT} ${selector}`))
}
const isHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s)

test('every text colour that applies in light meets 4.5:1 on what it sits on', () => {
  const fails: string[] = []
  for (const r of rules) {
    if (r.file === 'variables.css' || DARK_SCOPE.test(r.selector) || r.selector.startsWith('@')) continue
    if (!r.decls.has('color')) continue
    for (const part of r.selector.split(',').map((s) => s.trim())) {
      if (part.startsWith(LIGHT) || ON_DARK_GROUND.some(([re]) => re.test(part))) continue
      const o = lightOverride(part)
      const fg = resolve(o?.decls.get('color') ?? r.decls.get('color') ?? '')
      if (!isHex(fg)) continue // inherit, currentColor, an unset variable: the colour comes from the parent
      const own = resolve(o?.decls.get('background-color') ?? o?.decls.get('background') ?? r.decls.get('background-color') ?? r.decls.get('background') ?? '')
      const grounds = isHex(own) ? [own] : [resolve(v('background')), resolve(v('surface'))]
      for (const g of grounds) {
        const k = contrast(fg, g)
        if (k < 4.5) fails.push(`${k.toFixed(2)} ${r.file} ${part}: ${fg} on ${g}`)
      }
    }
  }
  assert.deepEqual(fails, [])
})
