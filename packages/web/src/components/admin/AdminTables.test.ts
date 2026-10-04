/**
 * Tests for the admin dashboard's tables (T78): every table fits its panel by wrapping and,
 * on a narrow panel, stacking into "label: value" lines. What node can check is the markup
 * the CSS relies on: every body cell carries its column header as data-label, the table
 * parts carry their roles (the stacked layout changes display), and nothing is a focusable
 * scroll region any more. The widths themselves are measured in a browser (T78 harness).
 *
 * Fixture values are invented. node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createElement } from 'react'
import type { AdminBallot, Member } from '../../lib/adminDashboard'
import { countRankedChoice, type CountResult } from '../../lib/rankedChoice'
import type { World } from '../../lib/worldsApi'
import { staticMarkup } from '../landing/staticMarkup'
import { RoundTable } from '../mascot/RoundTable'
import { BallotsTable, MembersTable, TilesTable, WorldsTable } from './AdminTables'

const MEMBERS: Member[] = [
  {
    userId: 'u-self',
    email: 'first.invented.person@example.com',
    providers: ['discord'],
    discordUsername: 'invented_owner',
    discordId: '100',
    joinedAt: '2026-01-02T03:04:05Z',
    lastSignInAt: null,
    isAdmin: true,
    isSuperadmin: true,
  },
  {
    userId: 'u-admin',
    email: 'longest.possible.address.for.testing@example.com',
    providers: ['discord', 'email', 'google'],
    discordUsername: 'an_invented_discord_name_of_32ch',
    discordId: '200',
    joinedAt: '2026-02-03T04:05:06Z',
    lastSignInAt: '2026-10-01T12:00:00Z',
    isAdmin: true,
    isSuperadmin: false,
  },
  {
    userId: 'u-member',
    email: null,
    providers: [],
    discordUsername: null,
    discordId: null,
    joinedAt: '2026-03-04T05:06:07Z',
    lastSignInAt: null,
    isAdmin: false,
    isSuperadmin: false,
  },
]

const WORLDS: World[] = [
  {
    worldId: 'w1',
    seq: 1,
    exporterWorldId: null,
    status: 'ended',
    detectedBy: 'migration',
    startedAt: '2026-08-01T10:00:00Z',
    endedAt: '2026-09-01T10:00:00Z',
    worldAgeHoursAtStart: null,
    note: 'An invented note that is long enough to wrap onto a second line',
  },
  {
    worldId: 'w2',
    seq: 2,
    exporterWorldId: 'x',
    status: 'current',
    detectedBy: 'exporter',
    startedAt: '2026-09-01T10:00:00Z',
    endedAt: null,
    worldAgeHoursAtStart: 0,
    note: null,
  },
]

const BALLOTS: AdminBallot[] = [
  { ballotId: 'b1', discordUsername: 'invented_voter', discordId: '300', rankings: ['art_001', 'art_002'], createdAt: '2026-10-01T09:00:00Z', counted: true },
  { ballotId: 'b2', discordUsername: null, discordId: '400', rankings: ['art_003'], createdAt: '2026-10-02T09:00:00Z', counted: false },
]

const IDS = ['art_001', 'art_002', 'art_003', 'art_004', 'art_005', 'art_006']
const RESULT: CountResult = countRankedChoice({
  entries: IDS,
  ballots: [['art_001'], ['art_001'], ['art_002', 'art_001'], ['art_003', 'art_002'], ['art_004'], ['art_005', 'art_001'], ['art_006', 'art_002']],
  drawOrder: IDS,
})

function tables() {
  return {
    worlds: staticMarkup(createElement(WorldsTable, { worlds: WORLDS, labelledBy: 'ad-world' })),
    tiles: staticMarkup(
      createElement(TilesTable, {
        rows: [
          { name: 'Muldraugh, KY', state: 'base' },
          { name: 'an_invented_map_folder_name_without_spaces', state: 'missing' },
        ],
        tilesKnown: true,
        labelledBy: 'ad-tiles',
      }),
    ),
    members: staticMarkup(createElement(MembersTable, { members: MEMBERS, selfId: 'u-self', onAsk: () => {}, labelledBy: 'ad-members' })),
    ballots: staticMarkup(createElement(BallotsTable, { ballots: BALLOTS, frozen: false, pending: null, onToggle: () => {}, labelledBy: 'ad-ballots' })),
    rounds: staticMarkup(createElement(RoundTable, { result: RESULT, labelledBy: 'ad-rounds', nameOf: (id: string) => id, fit: true })),
  }
}

function headers(html: string): string[] {
  const head = html.slice(html.indexOf('<thead'), html.indexOf('</thead>'))
  return [...head.matchAll(/<th scope="col"[^>]*>(.*?)<\/th>/g)].map((m) => m[1])
}

/** For each body row, the data-label of each cell in order (row header first). */
function bodyLabels(html: string): string[][] {
  const body = html.slice(html.indexOf('<tbody'), html.indexOf('</tbody>'))
  return body
    .split('<tr ')
    .slice(1)
    .map((row) => [...row.matchAll(/<(?:th scope="row"|td)[^>]*?data-label="([^"]*)"/g)].map((m) => m[1]))
}

function cellCount(html: string): number {
  const body = html.slice(html.indexOf('<tbody'), html.indexOf('</tbody>'))
  return (body.match(/<th scope="row"|<td[ >]/g) ?? []).length
}

test('every admin table cell carries its column header as data-label, in column order', () => {
  for (const [name, html] of Object.entries(tables())) {
    const cols = headers(html)
    assert.ok(cols.length >= 2, `${name}: has column headers`)
    const rows = bodyLabels(html)
    assert.ok(rows.length >= 2, `${name}: has body rows`)
    for (const labels of rows) assert.deepEqual(labels, cols, `${name}: labels follow the headers`)
    assert.equal(cellCount(html), rows.length * cols.length, `${name}: no cell without a label`)
  }
})

test('the table parts carry their roles, so the stacked layout stays a table to assistive technology', () => {
  for (const [name, html] of Object.entries(tables())) {
    assert.match(html, /<table [^>]*role="table"/, `${name}: table`)
    assert.equal((html.match(/<thead role="rowgroup"/g) ?? []).length, 1, `${name}: thead`)
    assert.equal((html.match(/<tbody role="rowgroup"/g) ?? []).length, 1, `${name}: tbody`)
    const trs = (html.match(/<tr[ >]/g) ?? []).length
    assert.equal((html.match(/<tr role="row"/g) ?? []).length, trs, `${name}: every row`)
    assert.equal((html.match(/<th scope="col" role="columnheader"/g) ?? []).length, headers(html).length, `${name}: column headers`)
    const rows = bodyLabels(html).length
    assert.equal((html.match(/<th scope="row" role="rowheader"/g) ?? []).length, rows, `${name}: row headers`)
    assert.equal((html.match(/<td role="cell"/g) ?? []).length, rows * (headers(html).length - 1), `${name}: cells`)
  }
})

test('no admin table is a focusable scroll region; the heading names the table itself', () => {
  for (const [name, html] of Object.entries(tables())) {
    assert.doesNotMatch(html, /tabIndex|tabindex/, `${name}: no tab stop`)
    assert.doesNotMatch(html, /role="region"/, `${name}: no region`)
    assert.match(html, /<table [^>]*aria-labelledby="ad-[a-z]+"/, `${name}: named by its heading`)
    assert.match(html, /class="mascot-vote__table-wrap admin__table-wrap"/, `${name}: the admin wrap`)
  }
})

test('each table stacks at the width chosen for its columns', () => {
  const t = tables()
  assert.match(t.members, /admin__table--stack-wide/)
  assert.match(t.worlds, /admin__table--stack-wide/)
  assert.match(t.ballots, /admin__table--stack-narrow/)
  assert.match(t.rounds, /admin__table--stack-narrow/)
  assert.match(t.tiles, /admin__table--stack-never/)
})

test('members: the action column holds the button with the member named for screen readers, none on the own row', () => {
  const html = tables().members
  assert.equal((html.match(/admin__row-btn/g) ?? []).length, 2)
  assert.match(html, /Remove admin<span class="sr-only"> \(an_invented_discord_name_of_32ch\)<\/span>/)
  assert.match(html, /Make admin<span class="sr-only"> \(this account\)<\/span>/)
  assert.match(html, /<td role="cell" class="admin__col admin__col--break" data-label="Email"><span class="admin__cell-value">longest\.possible/)
})

test('the public round table is unchanged: still a scroll region with its sticky-column markup, no admin classes', () => {
  const html = staticMarkup(createElement(RoundTable, { result: RESULT, labelledBy: 'mv-rounds', nameOf: (id: string) => id }))
  assert.match(html, /<div class="mascot-vote__table-wrap" role="region" aria-labelledby="mv-rounds" tabIndex="0"><table class="mascot-vote__table"><caption/)
  assert.doesNotMatch(html, /admin__|data-label|role="cell"/)
})

test('the dashboard draws no table of its own: every table goes through FitTable', () => {
  const page = readFileSync(new URL('../../pages/AdminDashboardPage.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(page, /<table/)
  assert.doesNotMatch(page, /role="region"/)
  assert.match(page, /<RoundTable[^/]*\sfit\s/)
})
