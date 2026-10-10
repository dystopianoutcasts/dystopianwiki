// The one site header (KB15), mounted by the wiki (packages/web, components/layout/WikiHeader.tsx)
// and by the live map (packages/aurora, src/site/MapHeader.tsx). Each app passes only what
// differs: its section list and current link, its sign-in state, how it asks whether the
// member is a site admin, its search box, and (the wiki) extra groups for the folding menu.
//
// This file owns the state; views.tsx draws it. The account menu is the wiki's: avatar
// button (initial when there is no https avatar or it fails to load), the member's name
// inside the menu and never in the bar, then Settings, Admin dashboard for site admins, and
// Log out. Signed out: the generic avatar and "Log in" to /login?next=<this page>.
import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { loginHrefFor } from './nav'
import type { SiteSection } from './nav'
import type { MemberDisplay } from './profile'
import { usePopup } from './usePopup'
import { useSiteAdmin } from './useSiteAdmin'
import type { SiteAdminCheck } from './useSiteAdmin'
import { useSiteTheme } from './useSiteTheme'
import { PlainSearchForm, SiteHeaderView } from './views'
import type { AccountView, LinkClick } from './views'
import './site-header.css'

export type AccountInput =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; userId: string; member: MemberDisplay; signOut: () => Promise<void> }

export interface SiteHeaderProps {
  sections: readonly SiteSection[]
  /** A section id, LIVE_MAP_ID, or null. */
  current: string | null
  /** This page's path (with query and hash as wanted), for "Log in"'s next. */
  currentPath: string
  account: AccountInput
  siteAdminCheck: SiteAdminCheck
  /** The app's search box; the plain GET form to /search when left out. */
  search?: ReactNode
  /** Extra groups for the end of the folding menu; `close` closes the menu. */
  menuExtras?: (close: () => void) => ReactNode
  /** Lets an app route its own paths without a page load. Leave out for plain page loads. */
  onLinkClick?: LinkClick
}

const MENU_ITEMS = '[role="menuitem"], [role="menuitemradio"]'
const SITE_MENU_ITEMS = 'a[href]'

export function SiteHeader({
  sections,
  current,
  currentPath,
  account,
  siteAdminCheck,
  search,
  menuExtras,
  onLinkClick,
}: SiteHeaderProps) {
  const accountPopup = usePopup(MENU_ITEMS, true)
  const themePopup = usePopup(MENU_ITEMS, true)
  const menuPopup = usePopup(SITE_MENU_ITEMS, false)
  const theme = useSiteTheme()
  const signedIn = account.status === 'signed-in' ? account : null
  const isSiteAdmin = useSiteAdmin(siteAdminCheck, signedIn ? signedIn.userId : null)
  // The URL that failed to load, so a new avatar URL gets its own chance.
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null)
  const [signOutError, setSignOutError] = useState(false)

  const avatarUrl = signedIn ? signedIn.member.avatarUrl : null
  const onAvatarError = useCallback(() => setFailedAvatar(avatarUrl), [avatarUrl])

  const signOut = signedIn ? signedIn.signOut : null
  const closeAccount = accountPopup.close
  const onSignOut = useCallback(() => {
    if (!signOut) return
    setSignOutError(false)
    signOut().then(
      () => closeAccount(false),
      () => setSignOutError(true),
    )
  }, [signOut, closeAccount])

  let accountView: AccountView
  if (account.status === 'signed-in') {
    accountView = {
      status: 'signed-in',
      member: account.member,
      isSiteAdmin,
      avatarFailed: avatarUrl !== null && failedAvatar === avatarUrl,
      onAvatarError,
      signOutError,
      onSignOut,
    }
  } else if (account.status === 'signed-out') {
    accountView = { status: 'signed-out', loginHref: loginHrefFor(currentPath) }
  } else {
    accountView = { status: 'loading' }
  }

  const closeSiteMenu = menuPopup.close
  const closeMenu = useCallback(() => closeSiteMenu(false), [closeSiteMenu])

  return (
    <SiteHeaderView
      sections={sections}
      current={current}
      search={search ?? <PlainSearchForm />}
      account={accountView}
      theme={{ choice: theme.choice, resolved: theme.resolved, onChoose: theme.choose }}
      accountPopup={accountPopup}
      themePopup={themePopup}
      menuPopup={menuPopup}
      menuExtras={menuExtras ? menuExtras(closeMenu) : undefined}
      onLinkClick={onLinkClick}
    />
  )
}
