// The site header's markup (KB15): pure components with no hooks, so the tests can render
// them from fixture props without a DOM. SiteHeader.tsx owns the state and passes it in.
//
// Every link is a plain <a href>: the wiki and the map are two separate single-page apps,
// and a router Link would route inside the wrong one (the map runs a HashRouter, where "/"
// becomes "#/"). The wiki may pass onLinkClick to route its own paths without a reload.
import type { MouseEvent, ReactNode } from 'react'
import { HOME_HREF, LIVE_MAP_HREF, LIVE_MAP_ID } from './nav'
import type { SiteSection } from './nav'
import type { MemberDisplay } from './profile'
import { THEME_CHOICES, THEME_LABELS } from './theme'
import type { ResolvedTheme, ThemeChoice } from './theme'
import type { Popup } from './usePopup'

export const SITE_NAME = 'Dystopian Outcasts'
export const LOGO_SRC = '/assets/branding/mascot-placeholder/placeholder-512.png'

/** The ids aria-controls points at. Prefixed so an article heading's generated id cannot collide. */
export const ACCOUNT_MENU_ID = 'site-account-menu'
export const THEME_MENU_ID = 'site-theme-menu'
export const SITE_MENU_ID = 'site-menu-panel'

export type LinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => void

export interface AccountOption {
  id: 'settings' | 'admin' | 'logout'
  label: string
  /** A page of the wiki (a full page load from the map). None for Log out, which is a button. */
  href?: string
}

/** The account menu's options, in order: the same list in both apps. */
export function accountOptions(isSiteAdmin: boolean): AccountOption[] {
  return [
    { id: 'settings', label: 'Settings', href: '/settings' },
    ...(isSiteAdmin ? [{ id: 'admin' as const, label: 'Admin dashboard', href: '/admin' }] : []),
    { id: 'logout', label: 'Log out' },
  ]
}

export type AccountView =
  | { status: 'loading' }
  | { status: 'signed-out'; loginHref: string }
  | {
      status: 'signed-in'
      member: MemberDisplay
      isSiteAdmin: boolean
      avatarFailed: boolean
      onAvatarError: () => void
      signOutError: boolean
      onSignOut: () => void
    }

export interface ThemeView {
  choice: ThemeChoice
  resolved: ResolvedTheme
  onChoose: (choice: ThemeChoice) => void
}

export interface SiteHeaderViewProps {
  sections: readonly SiteSection[]
  /** A section id, LIVE_MAP_ID, or null when no header link is the current page. */
  current: string | null
  search: ReactNode
  account: AccountView
  theme: ThemeView
  accountPopup: Popup
  themePopup: Popup
  menuPopup: Popup
  /** Extra groups at the end of the folding menu (the wiki: the build switch and the article's contents). */
  menuExtras?: ReactNode
  onLinkClick?: LinkClick
}

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

function MenuIcon() {
  return (
    <svg {...svgProps}>
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg {...svgProps} className="site-header__chevron">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg {...svgProps} className="site-header__check">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/** The theme button's picture: the visitor's choice, not the theme it resolves to. */
export function ThemeIcon({ choice }: { choice: ThemeChoice }) {
  if (choice === 'light') {
    return (
      <svg {...svgProps} data-icon="sun">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }
  if (choice === 'dark') {
    return (
      <svg {...svgProps} data-icon="moon">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }
  return (
    <svg {...svgProps} data-icon="monitor">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}

function GenericAvatar() {
  return (
    <span className="site-header__avatar site-header__avatar--generic" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
      </svg>
    </span>
  )
}

function linkHandler(onLinkClick: LinkClick | undefined, href: string, then?: () => void) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    onLinkClick?.(event, href)
    then?.()
  }
}

/** The section links, then Live Map; `aria-current="page"` marks the current one. */
export function SiteLinks({
  sections,
  current,
  className,
  onLinkClick,
  onNavigate,
}: {
  sections: readonly SiteSection[]
  current: string | null
  className: string
  onLinkClick?: LinkClick
  onNavigate?: () => void
}) {
  return (
    <>
      {sections.map((s) => (
        <a
          key={s.id}
          href={s.href}
          className={className}
          aria-current={current === s.id ? 'page' : undefined}
          onClick={linkHandler(onLinkClick, s.href, onNavigate)}
        >
          {s.name}
        </a>
      ))}
      <a
        href={LIVE_MAP_HREF}
        className={className}
        aria-current={current === LIVE_MAP_ID ? 'page' : undefined}
        onClick={linkHandler(onLinkClick, LIVE_MAP_HREF, onNavigate)}
      >
        Live Map
      </a>
    </>
  )
}

/** The search box when an app has no search of its own: a GET form to the wiki's search page. */
export function PlainSearchForm() {
  return (
    <form className="site-header__search-form" action="/search" method="get" role="search">
      <label htmlFor="site-search-q" className="site-header__visually-hidden">
        Search the wiki
      </label>
      <span className="site-header__search-icon">
        <SearchIcon />
      </span>
      <input
        id="site-search-q"
        className="site-header__search-input"
        type="search"
        name="q"
        placeholder="Search docs..."
        autoComplete="off"
      />
    </form>
  )
}

export function ThemeMenuView({ theme, popup }: { theme: ThemeView; popup: Popup }) {
  return (
    <div className="site-header__popup site-header__theme" ref={popup.rootRef} onBlur={popup.onRootBlur}>
      <button
        type="button"
        ref={popup.triggerRef}
        className="site-header__icon-btn"
        aria-haspopup="menu"
        aria-expanded={popup.isOpen}
        aria-controls={THEME_MENU_ID}
        aria-label={`Theme: ${THEME_LABELS[theme.choice]}`}
        onClick={popup.toggle}
        onKeyDown={popup.onTriggerKeyDown}
      >
        <ThemeIcon choice={theme.choice} />
      </button>
      <div className="site-header__dropdown site-header__dropdown--narrow" hidden={!popup.isOpen}>
        <div id={THEME_MENU_ID} role="menu" aria-label="Theme" ref={popup.panelRef} onKeyDown={popup.onPanelKeyDown}>
          {THEME_CHOICES.map((c) => (
            <button
              key={c}
              type="button"
              role="menuitemradio"
              aria-checked={theme.choice === c}
              className="site-header__item"
              onClick={() => {
                theme.onChoose(c)
                popup.close(true)
              }}
            >
              <span className="site-header__item-mark">{theme.choice === c ? <CheckIcon /> : null}</span>
              {THEME_LABELS[c]}
              {c === 'system' ? <span className="site-header__item-note">{`(${theme.resolved} now)`}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AccountMenuView({
  account,
  popup,
  onLinkClick,
}: {
  account: AccountView
  popup: Popup
  onLinkClick?: LinkClick
}) {
  if (account.status === 'loading') {
    // Holds the signed-out footprint so the bar does not jump when the session resolves.
    return <div className="site-header__account site-header__account--loading" aria-hidden="true" />
  }

  if (account.status === 'signed-out') {
    return (
      <div className="site-header__account">
        <GenericAvatar />
        <a href={account.loginHref} className="site-header__login" onClick={linkHandler(onLinkClick, account.loginHref)}>
          Log in
        </a>
      </div>
    )
  }

  const { member } = account
  const showImage = member.avatarUrl !== null && !account.avatarFailed
  return (
    <div className="site-header__popup site-header__account" ref={popup.rootRef} onBlur={popup.onRootBlur}>
      <button
        type="button"
        ref={popup.triggerRef}
        className="site-header__avatar-btn"
        aria-haspopup="menu"
        aria-expanded={popup.isOpen}
        aria-controls={ACCOUNT_MENU_ID}
        aria-label={`Account menu for ${member.name}`}
        onClick={popup.toggle}
        onKeyDown={popup.onTriggerKeyDown}
      >
        {showImage ? (
          <img
            src={member.avatarUrl ?? undefined}
            alt=""
            width={32}
            height={32}
            className="site-header__avatar"
            referrerPolicy="no-referrer"
            onError={account.onAvatarError}
          />
        ) : (
          <span className="site-header__avatar site-header__avatar--initial" aria-hidden="true">
            {member.initial}
          </span>
        )}
        <ChevronIcon />
      </button>
      <div className="site-header__dropdown" hidden={!popup.isOpen}>
        {/* The name is in the button's label already; shown here, hidden from screen readers. */}
        <div className="site-header__member" aria-hidden="true">
          {member.name}
        </div>
        <div id={ACCOUNT_MENU_ID} role="menu" aria-label="Account" ref={popup.panelRef} onKeyDown={popup.onPanelKeyDown}>
          {accountOptions(account.isSiteAdmin).map((o) =>
            o.href ? (
              <a
                key={o.id}
                href={o.href}
                role="menuitem"
                className="site-header__item"
                onClick={linkHandler(onLinkClick, o.href, () => popup.close(false))}
              >
                {o.label}
              </a>
            ) : (
              <button
                key={o.id}
                type="button"
                role="menuitem"
                className="site-header__item site-header__item--signout"
                onClick={account.onSignOut}
              >
                {o.label}
              </button>
            ),
          )}
        </div>
        {account.signOutError ? (
          <p className="site-header__error" role="alert">
            Could not log out. Please try again.
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function SiteMenuView({
  sections,
  current,
  theme,
  popup,
  extras,
  onLinkClick,
}: {
  sections: readonly SiteSection[]
  current: string | null
  theme: ThemeView
  popup: Popup
  extras?: ReactNode
  onLinkClick?: LinkClick
}) {
  const closeMenu = () => popup.close(false)
  return (
    <div className="site-header__popup site-header__menu" ref={popup.rootRef} onBlur={popup.onRootBlur}>
      <button
        type="button"
        ref={popup.triggerRef}
        className="site-header__icon-btn site-header__menu-btn"
        aria-expanded={popup.isOpen}
        aria-controls={SITE_MENU_ID}
        aria-label="Site menu"
        onClick={popup.toggle}
        onKeyDown={popup.onTriggerKeyDown}
      >
        <MenuIcon />
      </button>
      <div
        id={SITE_MENU_ID}
        className="site-header__dropdown site-header__menu-panel"
        hidden={!popup.isOpen}
        ref={popup.panelRef}
        onKeyDown={popup.onPanelKeyDown}
      >
        <nav aria-label="Site" className="site-header__menu-links">
          <a href={HOME_HREF} className="site-header__menu-link" onClick={linkHandler(onLinkClick, HOME_HREF, closeMenu)}>
            Home
          </a>
          <SiteLinks
            sections={sections}
            current={current}
            className="site-header__menu-link"
            onLinkClick={onLinkClick}
            onNavigate={closeMenu}
          />
        </nav>
        {/* Phones only (the bar's theme button is hidden there): the same three choices. */}
        <div className="site-header__group site-header__menu-theme">
          <fieldset className="site-header__radios">
            <legend className="site-header__group-title">Theme</legend>
            <div className="site-header__radio-row">
              {THEME_CHOICES.map((c) => (
                <label key={c} className="site-header__radio">
                  <input
                    type="radio"
                    name="site-theme"
                    value={c}
                    checked={theme.choice === c}
                    onChange={() => theme.onChoose(c)}
                  />
                  <span>{THEME_LABELS[c]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {extras}
      </div>
    </div>
  )
}

export function SiteHeaderView(props: SiteHeaderViewProps) {
  const { sections, current, search, account, theme, accountPopup, themePopup, menuPopup, menuExtras, onLinkClick } = props
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <a
          href={HOME_HREF}
          className="site-header__brand"
          aria-label={`${SITE_NAME}, home`}
          onClick={linkHandler(onLinkClick, HOME_HREF)}
        >
          <img src={LOGO_SRC} alt="" width={40} height={40} className="site-header__brand-image" />
          <span className="site-header__brand-text">{SITE_NAME}</span>
        </a>

        {/* Wider than 1280 px. At and below it the site menu carries these links. */}
        <nav className="site-header__nav" aria-label="Site">
          <SiteLinks sections={sections} current={current} className="site-header__link" onLinkClick={onLinkClick} />
        </nav>

        <div className="site-header__search">{search}</div>

        <div className="site-header__actions">
          <ThemeMenuView theme={theme} popup={themePopup} />
          <AccountMenuView account={account} popup={accountPopup} onLinkClick={onLinkClick} />
          <SiteMenuView
            sections={sections}
            current={current}
            theme={theme}
            popup={menuPopup}
            extras={menuExtras}
            onLinkClick={onLinkClick}
          />
        </div>
      </div>
    </header>
  )
}
