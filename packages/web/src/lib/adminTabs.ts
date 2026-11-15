/**
 * The admin dashboard's side tabs: which sections sit under which tab, which tabs an admin sees,
 * and which tab a URL asks for. Pure, so the tests can run it without React.
 *
 * Every tab is a link (/admin?tab=reports), so a refresh or a shared link opens the same tab, and
 * the browser's Back button steps through the tabs an admin opened.
 */

export type AdminTabId = 'tools' | 'reports' | 'people' | 'vote'

export interface AdminTab {
  id: AdminTabId
  label: string
  /** Only the superadmin sees this tab. */
  superadminOnly?: boolean
}

// Each section under a tab opens with its own heading and a line on what it is for.
export const ADMIN_TABS: readonly AdminTab[] = [
  { id: 'tools', label: 'Server tools' },
  { id: 'reports', label: 'Reports' },
  { id: 'people', label: 'People and documents' },
  { id: 'vote', label: 'Mascot vote' },
]

export const DEFAULT_ADMIN_TAB: AdminTabId = 'tools'

/** The search parameter that names the tab. */
export const ADMIN_TAB_PARAM = 'tab'

/** The tabs this admin sees, in order. */
export function visibleAdminTabs(superadmin: boolean): readonly AdminTab[] {
  return ADMIN_TABS.filter((t) => superadmin || !t.superadminOnly)
}

/** The tab a URL's ?tab= asks for; an unknown, missing or hidden one opens the default tab. */
export function tabFromParam(value: string | null, superadmin: boolean): AdminTabId {
  const found = visibleAdminTabs(superadmin).find((t) => t.id === value)
  return found ? found.id : DEFAULT_ADMIN_TAB
}

/** The link to a tab. The default tab is plain /admin, so the old link still opens it. */
export function adminTabHref(id: AdminTabId): string {
  return id === DEFAULT_ADMIN_TAB ? '/admin' : `/admin?${ADMIN_TAB_PARAM}=${id}`
}

/** A tab's words in the side menu: the Reports tab carries its count of new reports once known. */
export function adminTabLabel(tab: AdminTab, newReports: number | null): string {
  if (tab.id === 'reports' && newReports !== null) return `${tab.label} (${newReports} new)`
  return tab.label
}
