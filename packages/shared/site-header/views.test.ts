// KB15: the shared header's markup, rendered from fixture props (markup.ts, no DOM).
// Covers the account menu in every state, the theme menu, the folding site menu and the
// bar itself. Behaviour that needs a browser (focus moving, outside clicks) is in
// logic.test.ts as pure rules and was checked in headless Edge (STATUS, KB15).
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { fakePopup, markup } from './markup'
import type { SiteSection } from './nav'
import { LIVE_MAP_ID } from './nav'
import { ACCOUNT_MENU_ID, AccountMenuView, SITE_MENU_ID, SiteHeaderView, THEME_MENU_ID, ThemeMenuView, accountOptions } from './views'
import type { AccountView, SiteHeaderViewProps, ThemeView } from './views'

const SECTIONS: SiteSection[] = [
  { id: 'modding', name: 'Modding', href: '/pz/build-42/modding' },
  { id: 'server', name: 'Running a Server', href: '/pz/build-42/server' },
]
const LONG_NAME = 'Abcdefghijklmnopqrstuvwxyz012345' // 32 characters
const none = () => undefined
const theme: ThemeView = { choice: 'system', resolved: 'dark', onChoose: none }

function signedIn(over: Partial<Extract<AccountView, { status: 'signed-in' }>> = {}): AccountView {
  return {
    status: 'signed-in',
    member: { name: LONG_NAME, initial: 'A', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' },
    isSiteAdmin: false,
    avatarFailed: false,
    onAvatarError: none,
    signOutError: false,
    onSignOut: none,
    ...over,
  }
}

function header(over: Partial<SiteHeaderViewProps> = {}): string {
  const props: SiteHeaderViewProps = {
    sections: SECTIONS,
    current: null,
    search: createElement('div', { className: 'app-search' }),
    account: { status: 'signed-out', loginHref: '/login?next=%2Fpz%2Fbuild-42' },
    theme,
    accountPopup: fakePopup(false),
    themePopup: fakePopup(false),
    menuPopup: fakePopup(false),
    ...over,
  }
  return markup(createElement(SiteHeaderView, props))
}

const account = (a: AccountView, open = false) => markup(createElement(AccountMenuView, { account: a, popup: fakePopup(open) }))
/** The opening tag of the first element matching a class or attribute fragment. */
function tag(html: string, fragment: string): string {
  const m = html.match(new RegExp(`<[a-z]+\\b[^>]*${fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>`))
  expect(m, `no element with ${fragment}`).not.toBeNull()
  return m![0]
}
const menuItems = (html: string) => [...html.matchAll(/role="menuitem"[^>]*>([^<]+)</g)].map((m) => m[1])

describe('account menu: signed out', () => {
  const html = account({ status: 'signed-out', loginHref: '/login?next=%2Fmap%2F' })

  it('shows the generic avatar, hidden from screen readers, and a "Log in" link with next', () => {
    expect(tag(html, 'site-header__avatar--generic')).toMatch(/aria-hidden="true"/)
    expect(html).toMatch(/<a href="\/login\?next=%2Fmap%2F" class="site-header__login">Log in<\/a>/)
  })

  it('has no menu button while signed out', () => {
    expect(html).not.toMatch(/aria-haspopup/)
  })
})

describe('account menu: loading', () => {
  it('reserves the space with an empty, hidden placeholder instead of rendering nothing', () => {
    expect(account({ status: 'loading' })).toBe('<div class="site-header__account site-header__account--loading" aria-hidden="true"></div>')
  })
})

describe('account menu: signed in', () => {
  it('the avatar is a real button: haspopup, expanded state, controls the menu, named for the member', () => {
    const button = tag(account(signedIn()), 'site-header__avatar-btn')
    expect(button).toMatch(/^<button type="button"/)
    expect(button).toMatch(/aria-haspopup="menu"/)
    expect(button).toMatch(/aria-expanded="false"/)
    expect(button).toMatch(new RegExp(`aria-controls="${ACCOUNT_MENU_ID}"`))
    expect(button).toMatch(new RegExp(`aria-label="Account menu for ${LONG_NAME}"`))
    expect(tag(account(signedIn(), true), 'site-header__avatar-btn')).toMatch(/aria-expanded="true"/)
  })

  it('shows the https avatar image, decorative, without sending a referrer', () => {
    const img = tag(account(signedIn()), 'class="site-header__avatar"')
    expect(img).toMatch(/^<img /)
    expect(img).toMatch(/src="https:\/\/cdn\.discordapp\.com\/embed\/avatars\/0\.png"/)
    expect(img).toMatch(/alt=""/)
    expect(img).toMatch(/referrerpolicy="no-referrer"/)
  })

  it('a broken avatar falls back to the initial', () => {
    const html = account(signedIn({ avatarFailed: true }))
    expect(html).not.toMatch(/<img/)
    expect(html).toMatch(/<span class="site-header__avatar site-header__avatar--initial" aria-hidden="true">A<\/span>/)
  })

  it('no avatar URL also shows the initial', () => {
    const html = account(signedIn({ member: { name: 'Raxdeg', initial: 'R', avatarUrl: null } }))
    expect(html).not.toMatch(/<img/)
    expect(html).toMatch(/site-header__avatar--initial" aria-hidden="true">R</)
  })

  it('the menu is hidden while closed and shown when open; aria-controls names it', () => {
    expect(tag(account(signedIn()), 'site-header__dropdown')).toMatch(/ hidden>/)
    expect(tag(account(signedIn(), true), 'site-header__dropdown')).not.toMatch(/ hidden/)
    expect(account(signedIn(), true)).toMatch(new RegExp(`<div id="${ACCOUNT_MENU_ID}" role="menu" aria-label="Account">`))
  })

  it('options, in order: Settings, Log out; Admin dashboard between them for a site admin', () => {
    expect(menuItems(account(signedIn(), true))).toEqual(['Settings', 'Log out'])
    expect(menuItems(account(signedIn({ isSiteAdmin: true }), true))).toEqual(['Settings', 'Admin dashboard', 'Log out'])
    expect(accountOptions(true).map((o) => [o.id, o.href ?? null])).toEqual([
      ['settings', '/settings'],
      ['admin', '/admin'],
      ['logout', null],
    ])
  })

  it('Settings and Admin dashboard are plain links (they work from the map as page loads); Log out is a button', () => {
    const html = account(signedIn({ isSiteAdmin: true }), true)
    expect(html).toMatch(/<a href="\/settings" role="menuitem" class="site-header__item">Settings<\/a>/)
    expect(html).toMatch(/<a href="\/admin" role="menuitem" class="site-header__item">Admin dashboard<\/a>/)
    expect(html).toMatch(/<button type="button" role="menuitem" class="site-header__item site-header__item--signout">Log out<\/button>/)
  })

  it('the member\'s name is inside the menu, never in the bar', () => {
    const html = header({ account: signedIn() })
    const dropdownAt = html.indexOf('class="site-header__dropdown"', html.indexOf('site-header__avatar-btn'))
    expect(html.indexOf(`>${LONG_NAME}<`)).toBeGreaterThan(dropdownAt)
    expect(html.split(`>${LONG_NAME}<`)).toHaveLength(2)
    expect(tag(html, 'site-header__member')).toMatch(/aria-hidden="true"/)
  })

  it('a failed sign-out is announced', () => {
    expect(account(signedIn({ signOutError: true }), true)).toMatch(/<p class="site-header__error" role="alert">Could not log out\. Please try again\.<\/p>/)
  })
})

describe('theme menu', () => {
  const html = (t: ThemeView, open = true) => markup(createElement(ThemeMenuView, { theme: t, popup: fakePopup(open) }))

  it('a button with the choice in its name, haspopup, expanded state and controls', () => {
    const button = tag(html(theme, false), 'site-header__icon-btn')
    expect(button).toMatch(/aria-haspopup="menu"/)
    expect(button).toMatch(/aria-expanded="false"/)
    expect(button).toMatch(new RegExp(`aria-controls="${THEME_MENU_ID}"`))
    expect(button).toMatch(/aria-label="Theme: System"/)
    expect(tag(html({ ...theme, choice: 'light' }, false), 'site-header__icon-btn')).toMatch(/aria-label="Theme: Light"/)
  })

  it('three radio items in order, the chosen one checked and marked with a check, not colour alone', () => {
    const out = html({ ...theme, choice: 'dark' })
    const items = [...out.matchAll(/role="menuitemradio" aria-checked="(true|false)"[^>]*>(.*?)<\/button>/g)]
    expect(items.map((m) => m[1])).toEqual(['false', 'false', 'true'])
    expect(items.map((m) => m[2].replace(/<[^>]+>/g, '').replace(/\(.*\)/, ''))).toEqual(['System', 'Light', 'Dark'])
    expect(items[2][2]).toMatch(/site-header__check/)
    expect(items[0][2]).not.toMatch(/site-header__check/)
  })

  it('System says which theme it resolves to', () => {
    expect(html({ choice: 'system', resolved: 'light', onChoose: none })).toMatch(/\(light now\)/)
  })
})

describe('the bar', () => {
  it('every link is a plain <a href>, never a router link', () => {
    const html = header({ current: 'modding' })
    const hrefs = [...html.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1])
    expect(hrefs).toEqual(expect.arrayContaining(['/', '/pz/build-42/modding', '/pz/build-42/server', '/map/']))
    expect(html).not.toMatch(/<a(?![^>]*href)/)
  })

  it('the home link is named with the visible site name', () => {
    expect(tag(header(), 'site-header__brand')).toMatch(/^<a href="\/" class="site-header__brand" aria-label="Dystopian Outcasts, home">/)
  })

  it('section links then Live Map, in the bar and again in the menu, both labelled "Site"', () => {
    const html = header()
    expect(html.match(/<nav[^>]*aria-label="Site"/g)).toHaveLength(2)
    const bar = html.slice(html.indexOf('site-header__nav'), html.indexOf('site-header__search'))
    expect([...bar.matchAll(/class="site-header__link"[^>]*>([^<]+)</g)].map((m) => m[1])).toEqual(['Modding', 'Running a Server', 'Live Map'])
  })

  it('the current page is aria-current="page", in the bar and the menu', () => {
    const html = header({ current: LIVE_MAP_ID })
    expect(html.match(/<a href="\/map\/" class="site-header__(link|menu-link)" aria-current="page">Live Map<\/a>/g)).toHaveLength(2)
    expect(html.match(/aria-current/g)).toHaveLength(2)
    expect(header({ current: null })).not.toMatch(/aria-current/)
  })

  it('the app\'s own search goes in the search slot', () => {
    expect(header()).toMatch(/<div class="site-header__search"><div class="app-search"><\/div><\/div>/)
  })

  it('the theme control is there signed out and signed in', () => {
    expect(header()).toMatch(/aria-label="Theme: System"/)
    expect(header({ account: signedIn() })).toMatch(/aria-label="Theme: System"/)
  })
})

describe('the folding site menu', () => {
  it('a button with expanded state that controls the panel; the panel is hidden while closed', () => {
    const closed = header()
    const button = tag(closed, 'site-header__menu-btn')
    expect(button).toMatch(/aria-expanded="false"/)
    expect(button).toMatch(new RegExp(`aria-controls="${SITE_MENU_ID}"`))
    expect(button).toMatch(/aria-label="Site menu"/)
    expect(tag(closed, `id="${SITE_MENU_ID}"`)).toMatch(/ hidden/)
    const open = header({ menuPopup: fakePopup(true) })
    expect(tag(open, 'site-header__menu-btn')).toMatch(/aria-expanded="true"/)
    expect(tag(open, `id="${SITE_MENU_ID}"`)).not.toMatch(/ hidden/)
  })

  it('lists Home, the sections and Live Map, then the three theme choices as radios, then the app\'s extras', () => {
    const html = header({ menuExtras: createElement('div', { className: 'wiki-extras' }) })
    const panel = html.slice(html.indexOf(`id="${SITE_MENU_ID}"`))
    expect([...panel.matchAll(/class="site-header__menu-link"[^>]*>([^<]+)</g)].map((m) => m[1])).toEqual([
      'Home',
      'Modding',
      'Running a Server',
      'Live Map',
    ])
    expect([...panel.matchAll(/<input type="radio" name="site-theme" value="(\w+)"( checked)?>/g)].map((m) => m[1] + (m[2] ? '*' : ''))).toEqual([
      'system*',
      'light',
      'dark',
    ])
    expect(panel.indexOf('wiki-extras')).toBeGreaterThan(panel.indexOf('site-theme'))
  })
})
