/**
 * WikiHeader - the wiki's mount of the ONE site header (KB15), the component the live map
 * mounts too: packages/shared/site-header. Owner, 2026-10-10: "the avatar drop down with the
 * options is the same in all topnavs ... ideally this topnav is just a reusable component."
 *
 * Passes only what is the wiki's own:
 * - the default version's sections from the generated navigation (skipping sections with no
 *   articles, in displayOrder), and which one is current;
 * - the wiki's sign-in state and its site-admin check;
 * - the live-suggestion search box;
 * - the folding menu's extra groups: the game build switch and, on an article, its contents;
 * - onLinkClick, so the header's plain <a href> links to wiki pages route inside this app
 *   without a page load. Links to the map, and modified clicks, are left to the browser.
 */
import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SiteHeader, currentFor, isMapPath, memberDisplay } from '../../../../shared/site-header'
import type { AccountInput, SiteSection } from '../../../../shared/site-header'
import { DEFAULT_VERSION, getVersion } from '../../config/versions.generated'
import { useAuth } from '../../context/AuthContext'
import { useArticleTOC } from '../../context/ArticleContext'
import { api } from '../../lib/supabase'
import { FuzzySearchBar } from '../search/FuzzySearchBar'
import { VersionSelect } from './VersionSelect'

/** The header's section links: a version's sections that have articles, in displayOrder. */
export function siteSections(versionId: string): SiteSection[] {
  return [...(getVersion(versionId)?.sections ?? [])]
    .filter((s) => s.categories.some((c) => c.articleCount > 0))
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((s) => ({ id: s.id, name: s.name, href: `/pz/${versionId}/${s.id}` }))
}

/** public.site_is_admin(). Module level, so its identity is stable across renders. */
const checkSiteAdmin = () => api.getClient().rpc('site_is_admin')

/** The folding menu's wiki-only groups: the build switch, and the open article's headings. */
function WikiMenuExtras({ onClose }: { onClose: () => void }) {
  const tocItems = useArticleTOC()

  const handleTocClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, id: string) => {
      const element = document.getElementById(id)
      if (!element) return
      event.preventDefault()
      const headerOffset = 80
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - headerOffset, behavior: 'smooth' })
      onClose()
    },
    [onClose],
  )

  return (
    <>
      <div className="site-header__group">
        <VersionSelect onChange={onClose} />
      </div>
      {tocItems.length > 0 && (
        <div className="site-header__group">
          <span className="site-header__group-title" id="site-menu-toc-title">
            On This Page
          </span>
          <nav aria-labelledby="site-menu-toc-title">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`site-header__sublink site-header__sublink--level-${item.level}`}
                onClick={(e) => handleTocClick(e, item.id)}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

export function WikiHeader() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const sections = siteSections(DEFAULT_VERSION)

  const onLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (isMapPath(href)) return
      event.preventDefault()
      navigate(href)
    },
    [navigate],
  )

  const menuExtras = useCallback((close: () => void) => <WikiMenuExtras onClose={close} />, [])

  let account: AccountInput
  if (loading) account = { status: 'loading' }
  else if (user) account = { status: 'signed-in', userId: user.id, member: memberDisplay(user), signOut }
  else account = { status: 'signed-out' }

  return (
    <SiteHeader
      sections={sections}
      current={currentFor(location.pathname, sections)}
      currentPath={location.pathname + location.search}
      account={account}
      siteAdminCheck={checkSiteAdmin}
      search={<FuzzySearchBar placeholder="Search docs..." />}
      menuExtras={menuExtras}
      onLinkClick={onLinkClick}
    />
  )
}
