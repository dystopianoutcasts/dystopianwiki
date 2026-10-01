// The website's top bar, on the map (T39, owner 2026-09-29: "We want the top nav again
// in the map. This is going to be the top nav that's on the whole website.").
//
// A look-alike of packages/web/src/components/layout/Header.tsx, not a shared
// component: the wiki and the map are separate apps with separate bundles. Every link
// here is a plain <a href> page load into the wiki. Never a react-router Link: the map
// runs a HashRouter, and a Link would turn "/" into "#/" and stay on the map.
//
// Differences from the wiki header, on purpose:
// - "Map" is marked as the current page.
// - The search box is a plain form that lands on the wiki's search page, not the
//   wiki's live-suggestion search, which needs the wiki's search index and code.
// - No version selector: the map is Build 42's server, and the menu follows the
//   wiki's default version.
// - At the right, the same "Log in" button and avatar as the wiki (the login session is
//   shared, sign-in happens on the wiki's /login page), plus "Sign out" when signed in.
// - On a phone the section links fold into a native <details> menu.
import { AccountControl } from '../auth/AccountControl'
import { useSiteNav } from './useSiteNav'
import type { SiteSection } from './useSiteNav'

const SITE_NAME = 'Dystopian Outcasts'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function SiteLinks({ sections }: { sections: readonly SiteSection[] }) {
  return (
    <>
      {sections.map((s) => (
        <a key={s.id} href={s.href} className="site-header__nav-link">
          {s.name}
        </a>
      ))}
      <a href="/map/" className="site-header__nav-link site-header__nav-link--active" aria-current="page">
        Map
      </a>
    </>
  )
}

export function SiteHeader() {
  const sections = useSiteNav()

  return (
    <header className="site-header">
      <div className="site-header__container">
        <a href="/" className="site-header__logo" aria-label={`${SITE_NAME}, home`}>
          <img
            src="/assets/branding/mascot-placeholder/placeholder-512.png"
            alt=""
            width={40}
            height={40}
            className="site-header__logo-image"
          />
          <span className="site-header__logo-text">{SITE_NAME}</span>
        </a>

        {/* Wide screens. Hidden on a phone, where the menu below takes over. */}
        <nav className="site-header__nav" aria-label="Site">
          <SiteLinks sections={sections} />
        </nav>

        <form className="site-header__search" action="/search" method="get" role="search">
          <label htmlFor="site-search-q" className="visually-hidden">
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

        <div className="site-header__actions">
          <AccountControl />
          {/* Phones only. Hidden (display: none) on wide screens, so only one
              "Site" navigation is ever exposed at a time. */}
          <details className="site-header__menu">
            <summary className="site-header__menu-btn">
              <MenuIcon />
              <span className="visually-hidden">Site menu</span>
            </summary>
            <nav className="site-header__menu-panel" aria-label="Site">
              <SiteLinks sections={sections} />
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}
