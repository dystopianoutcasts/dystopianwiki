/**
 * Tests for the admin dashboard's side tabs (adminTabs.ts) and for where each section sits.
 * node:test, run with `npm test` from packages/web. The page imports React and stylesheets that
 * cannot load here, so its layout is checked from its source.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { ADMIN_TABS, DEFAULT_ADMIN_TAB, adminTabHref, adminTabLabel, tabFromParam, visibleAdminTabs } from './adminTabs'

const page = readFileSync(fileURLToPath(new URL('../pages/AdminDashboardPage.tsx', import.meta.url)), 'utf8')
const css = readFileSync(fileURLToPath(new URL('../styles/pages/admin.css', import.meta.url)), 'utf8')

test('the four tabs, in order, with words on each', () => {
  assert.deepEqual(
    ADMIN_TABS.map((t) => t.label),
    ['Server tools', 'Reports', 'People and documents', 'Mascot vote'],
  )
  assert.equal(DEFAULT_ADMIN_TAB, 'tools')
})

test('every admin sees every tab today; a superadmin-only tab would be hidden from others', () => {
  assert.equal(visibleAdminTabs(false).length, 4)
  assert.equal(visibleAdminTabs(true).length, 4)
})

test('the URL picks the tab; unknown or missing opens Server tools', () => {
  assert.equal(tabFromParam('reports', false), 'reports')
  assert.equal(tabFromParam('vote', true), 'vote')
  assert.equal(tabFromParam(null, false), 'tools')
  assert.equal(tabFromParam('nope', true), 'tools')
  assert.equal(tabFromParam('REPORTS', true), 'tools')
})

test('each tab is a link; the default one is plain /admin', () => {
  assert.equal(adminTabHref('tools'), '/admin')
  assert.equal(adminTabHref('reports'), '/admin?tab=reports')
  assert.equal(adminTabHref('people'), '/admin?tab=people')
  assert.equal(adminTabHref('vote'), '/admin?tab=vote')
  for (const t of ADMIN_TABS) assert.equal(tabFromParam(new URLSearchParams(adminTabHref(t.id).split('?')[1] ?? '').get('tab'), true), t.id)
})

test('the Reports tab carries the count of new reports once it is known', () => {
  const reports = ADMIN_TABS.find((t) => t.id === 'reports')!
  const vote = ADMIN_TABS.find((t) => t.id === 'vote')!
  assert.equal(adminTabLabel(reports, null), 'Reports')
  assert.equal(adminTabLabel(reports, 0), 'Reports (0 unread)')
  assert.equal(adminTabLabel(reports, 3), 'Reports (3 unread)')
  assert.equal(adminTabLabel(vote, 3), 'Mascot vote')
})

test('the page: a labeled side menu of links, the open one marked aria-current', () => {
  assert.match(page, /<nav className="admin__tabs" aria-label="Dashboard sections">/)
  assert.match(page, /to=\{adminTabHref\(t\.id\)\}/)
  assert.match(page, /aria-current=\{t\.id === current\.id \? 'page' : undefined\}/)
})

test('the page: each section sits under its tab, and only one tab renders at a time', () => {
  const block = (id: string) => {
    const start = page.indexOf(`{current.id === '${id}' && `)
    assert.ok(start > 0, `${id} tab block`)
    const next = page.indexOf('{current.id === ', start + 10)
    return page.slice(start, next > 0 ? next : page.indexOf('</div>', start))
  }
  const tools = block('tools')
  for (const s of ['href="/map/"', '<ServerBuddySection />', '<WorldSection />', '<MapSection />']) assert.ok(tools.includes(s), `Server tools has ${s}`)
  assert.match(block('reports'), /<ReportsSection onNewCount=\{setNewReports\} \/>/)
  const people = block('people')
  assert.match(people, /\{superadmin && <MembersSection selfId=\{selfId\} \/>\}/)
  assert.match(people, /<ExecutivesSection selfId=\{selfId\} \/>/)
  assert.match(people, /\{superadmin && <EyesOnlySection \/>\}/)
  assert.match(block('vote'), /<VoteTab \/>/)
  assert.equal(page.match(/<ReportsSection /g)?.length, 1, 'Reports appears once, under its tab')
  assert.equal(page.match(/<VoteControls /g)?.length, 1, 'the vote appears once, under its tab')
})

test('the styles: a side menu from 900 px, a wrapped row below, 44 px targets and a focus ring', () => {
  assert.match(css, /\.admin__tab \{[^}]*min-height: 44px/)
  assert.match(css, /\.admin__tab:focus-visible \{[^}]*outline: 3px solid var\(--color-focus-ring\)/)
  assert.match(css, /\.admin__tab-list \{[^}]*flex-wrap: wrap/)
  assert.match(css, /\.admin__layout \{[^}]*grid-template-columns: minmax\(0, 1fr\)/, 'one column that never runs past a phone screen')
  assert.match(css, /@media \(min-width: 900px\) \{[\s\S]*grid-template-columns: 220px minmax\(0, 1fr\)/)
})
