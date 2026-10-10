// KB15: the shared header's stylesheet. Where the links fold into the menu, where the theme
// control moves into it, the no-squeeze rules, the 24 px target floor, and WCAG 2.2 AA for
// every colour pair in BOTH themes, read from the tokens in site-header.css.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(fileURLToPath(new URL('./site-header.css', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Top-level rules (outside any @media), selector -> declarations. */
function topLevel(): Array<{ selector: string; body: string }> {
  const out: Array<{ selector: string; body: string }> = []
  let depth = 0
  let start = 0
  let selStart = 0
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      if (depth === 0) {
        start = i
      }
      depth++
    } else if (css[i] === '}') {
      depth--
      if (depth === 0) {
        const selector = css.slice(selStart, start).trim()
        if (!selector.startsWith('@')) out.push({ selector, body: css.slice(start + 1, i) })
        selStart = i + 1
      }
    }
  }
  return out
}
const RULES = topLevel()
function decls(selector: string): string {
  const hit = RULES.filter((r) => r.selector.split(',').map((s) => s.trim()).includes(selector))
  expect(hit.length, `no top-level rule for ${selector}`).toBeGreaterThan(0)
  return hit.map((r) => r.body).join(';')
}

/** The max-width (px) of every @media block holding `selector { ... decl ... }`. */
function maxWidthsFor(selector: string, decl: RegExp): number[] {
  const found: number[] = []
  const media = /@media\s*\(max-width:\s*(\d+)px\)\s*\{/g
  let m: RegExpExecArray | null
  while ((m = media.exec(css))) {
    let depth = 1
    let i = media.lastIndex
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++
      else if (css[i] === '}') depth--
      i++
    }
    const body = css.slice(media.lastIndex, i - 1)
    const rule = new RegExp(`(?:^|\\})\\s*${escape(selector)}\\s*\\{([^}]*)\\}`, 'g')
    if ([...body.matchAll(rule)].some((r) => decl.test(r[1]))) found.push(Number(m[1]))
  }
  return found
}

describe('where the seven links fold into the menu', () => {
  const navHidden = maxWidthsFor('.site-header__nav', /display:\s*none/)
  const menuShown = maxWidthsFor('.site-header__menu', /display:\s*block/)

  it('the nav hides and the menu shows at one single width, the xl breakpoint 1280 px', () => {
    expect(navHidden).toEqual([1280])
    expect(menuShown).toEqual([1280])
  })

  it('above it the menu is not displayed, so only one "Site" navigation is exposed', () => {
    expect(decls('.site-header__menu')).toMatch(/display:\s*none/)
    expect(decls('.site-header__nav')).toMatch(/display:\s*flex/)
  })

  it('the defaults come before the @media block, so the block wins', () => {
    const block = css.indexOf('@media (max-width: 1280px)')
    expect(css.slice(0, block)).toMatch(/(?:^|\})\s*\.site-header__menu\s*\{[^}]*display:\s*none/)
    expect(css.slice(block)).not.toMatch(/(?:^|\})\s*\.site-header__menu\s*\{[^}]*display:\s*none/)
  })

  it('a closed pop-up stays hidden whatever display a rule gives it', () => {
    expect(decls('.site-header [hidden]')).toMatch(/display:\s*none\s*!important/)
  })
})

describe('the theme control on phones', () => {
  it('the bar\'s theme button hides and the menu\'s theme choices show at the same single width, 640 px', () => {
    expect(maxWidthsFor('.site-header__theme', /display:\s*none/)).toEqual([640])
    expect(maxWidthsFor('.site-header__menu-theme', /display:\s*block/)).toEqual([640])
    expect(decls('.site-header__menu-theme')).toMatch(/display:\s*none/)
  })
})

describe('no squeeze: a long name or a narrow window never pushes the links or the search box', () => {
  it('the links keep one line and their width; the search box is what gives way', () => {
    expect(decls('.site-header__nav')).toMatch(/flex:\s*none/)
    expect(decls('.site-header__link')).toMatch(/white-space:\s*nowrap/)
    expect(decls('.site-header__search')).toMatch(/min-width:\s*0/)
    expect(decls('.site-header__brand')).toMatch(/flex:\s*none/)
  })

  it('the controls at the right keep their width and hold no name (the name is in the menu only)', () => {
    expect(decls('.site-header__actions')).toMatch(/flex:\s*none/)
    expect(css).not.toMatch(/\.site-header__(who|name)\b/)
    // The name's one rule lets it wrap inside the menu instead of widening it past the screen.
    expect(decls('.site-header__member')).toMatch(/overflow-wrap:\s*anywhere/)
    expect(decls('.site-header__dropdown')).toMatch(/max-width:\s*calc\(100vw - 32px\)/)
  })
})

describe('targets', () => {
  it('every control is at least 24 x 24 px (WCAG 2.5.8), most 44 or more', () => {
    const floor: Array<[string, number]> = [
      ['.site-header__icon-btn', 44],
      ['.site-header__avatar-btn', 48],
      ['.site-header__login', 44],
      ['.site-header__item', 44],
      ['.site-header__link', 40],
      ['.site-header__menu-link', 44],
      ['.site-header__radio', 44],
      ['.site-header__sublink', 32],
    ]
    for (const [selector, px] of floor) {
      const min = /min-height:\s*(\d+)px/.exec(decls(selector))
      expect(min, selector).not.toBeNull()
      expect(Number(min![1]), selector).toBeGreaterThanOrEqual(px)
    }
  })
})

// ---- colour ----
function tokens(selector: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const m of decls(selector).matchAll(/(--sh-[a-z0-9-]+)\s*:\s*([^;]+)/g)) map.set(m[1], m[2].trim())
  return map
}
const DARK = tokens('.site-header')
const LIGHT = tokens(':root[data-theme="light"] .site-header')

function luminance(hex: string): number {
  const h = /^#([0-9a-f]{6})$/i.exec(hex)
  expect(h, `not a 6-digit hex colour: ${hex}`).not.toBeNull()
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h![1].slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(palette: Map<string, string>, a: string, b: string): number {
  const [x, y] = [luminance(palette.get(a)!), luminance(palette.get(b)!)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** [foreground, background, minimum]: text 4.5, focus rings, borders and icons 3. */
const PAIRS: Array<[string, string, number]> = [
  ['--sh-text', '--sh-bg', 4.5],
  ['--sh-text', '--sh-sunken', 4.5],
  ['--sh-text', '--sh-raised', 4.5],
  ['--sh-text-2', '--sh-bg', 4.5],
  ['--sh-text-2', '--sh-sunken', 4.5],
  ['--sh-muted', '--sh-sunken', 4.5],
  ['--sh-current-fg', '--sh-current-bg', 4.5],
  ['--sh-current-line', '--sh-bg', 3],
  ['--sh-on-accent', '--sh-accent', 4.5],
  ['--sh-on-accent', '--sh-accent-hover', 4.5],
  ['--sh-signout', '--sh-bg', 4.5],
  ['--sh-signout', '--sh-raised', 4.5],
  ['--sh-error', '--sh-bg', 4.5],
  ['--sh-avatar-fg', '--sh-avatar-bg', 3],
  ['--sh-focus', '--sh-bg', 3],
  ['--sh-focus', '--sh-sunken', 3],
  ['--sh-field-border', '--sh-bg', 3],
  ['--sh-control-border', '--sh-bg', 3],
]

describe('colour: WCAG 2.2 AA in both themes', () => {
  it('the light theme sets every token the dark default sets', () => {
    expect([...LIGHT.keys()].sort()).toEqual([...DARK.keys()].sort())
  })

  for (const [name, palette] of [
    ['dark', DARK],
    ['light', LIGHT],
  ] as const) {
    it.each(PAIRS)(`${name}: %s on %s at least %s:1`, (fg, bg, min) => {
      expect(contrast(palette, fg, bg)).toBeGreaterThanOrEqual(min)
    })
  }

  it('outside the two token blocks, every colour is a token, so both themes cover every rule', () => {
    const others = RULES.filter((r) => r.selector !== '.site-header' && r.selector !== ':root[data-theme="light"] .site-header')
    const media = css.slice(css.indexOf('@media'))
    for (const text of [...others.map((r) => `${r.selector}{${r.body}}`), media]) {
      expect(text).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(text).not.toMatch(/\brgba?\(/)
    }
  })

  it('the page\'s colour-scheme follows data-theme, for native controls and scrollbars', () => {
    expect(decls(':root')).toMatch(/color-scheme:\s*dark/)
    expect(decls(':root[data-theme="light"]')).toMatch(/color-scheme:\s*light/)
  })

  it('the current page is marked by more than colour: an underline in the bar, a bar in the menu', () => {
    expect(decls('.site-header__link[aria-current="page"]')).toMatch(/box-shadow:\s*inset 0 -2px 0 var\(--sh-current-line\)/)
    expect(decls('.site-header__menu-link[aria-current="page"]')).toMatch(/box-shadow:\s*inset 3px 0 0 var\(--sh-current-line\)/)
  })

  it('focus is always visible: a 2 px ring in the focus colour', () => {
    expect(decls('.site-header :focus-visible')).toMatch(/outline:\s*2px solid var\(--sh-focus\)/)
  })
})
