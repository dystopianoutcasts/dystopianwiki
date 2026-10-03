/**
 * Tests for the home page leaderboard (T66): tabs, rows, the name mode, the crowns' text
 * alternatives, the source line and the fallback before 036 exists.
 *
 * LeaderboardView has no hooks, so it renders with ./staticMarkup; handlers are found in the
 * element tree and called, as a click or a key press would. Leaderboard.tsx (the hook owner)
 * is held to subscribeNameMode by a source check, and the subscription itself is exercised.
 * node:test, run with `npx tsx --test src/components/landing/Leaderboard.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { LOADING_LINE, parseLeaderboard, UNAVAILABLE_LINE, type Leaderboard, type TabId } from '../../lib/leaderboard'
import { BOARD_21, CONTRACT } from '../../lib/leaderboard.fixture'
import { chooseNameMode, subscribeNameMode, type NameMode, type StorageLike } from '../../lib/nameMode'
import { LeaderboardView } from './LeaderboardView'
import { staticMarkup } from './staticMarkup'

const NOW = new Date('2026-10-03T12:05:30Z')
const DATA = parseLeaderboard(CONTRACT)

function view(
  opts: {
    tab?: TabId
    mode?: NameMode
    data?: Leaderboard | null
    unavailable?: boolean
    onSelect?: (t: TabId, k: boolean) => void
    expanded?: Partial<Record<TabId, boolean>>
    onToggle?: (t: TabId) => void
  } = {},
) {
  return createElement(LeaderboardView, {
    titleId: 'lb-title',
    prefix: 'lb',
    data: opts.data === undefined ? DATA : opts.data,
    unavailable: opts.unavailable ?? false,
    mode: opts.mode ?? 'character',
    tab: opts.tab ?? 'kills',
    onSelect: opts.onSelect ?? (() => {}),
    expanded: opts.expanded,
    onToggle: opts.onToggle,
    now: NOW,
  })
}

/** Expands function components and collects every plain element, like a DOM walk. */
function elements(node: ReactNode, out: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(node)) node.forEach((n) => elements(n, out))
  else if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode }
    if (typeof node.type === 'function') elements((node.type as (p: unknown) => ReactNode)(node.props), out)
    else {
      out.push(node)
      elements(props.children, out)
    }
  }
  return out
}

type Props = Record<string, unknown>
const propsOf = (e: ReactElement) => e.props as Props

function tabs(node: ReactNode) {
  return elements(node).filter((e) => propsOf(e).role === 'tab')
}

function panel(node: ReactNode, tab: TabId) {
  const p = elements(node).find((e) => propsOf(e).id === `lb-panel-${tab}`)
  assert.ok(p, `no panel for ${tab}`)
  return p
}

/** The visible panel's rows as [rank cell text, name, value]. */
function rowsOf(html: string, tab: TabId): string[][] {
  const m = html.match(new RegExp(`<div class="lb-panel" role="tabpanel" id="lb-panel-${tab}"[^>]*>(.*?)</div>`))
  assert.ok(m, `no panel html for ${tab}`)
  return [...m[1].matchAll(/<tr><td class="lb-rank">(.*?)<\/td><td class="lb-name">(.*?)<\/td><td class="lb-value">(.*?)<\/td><\/tr>/g)].map((r) => [
    r[1].replace(/<[^>]+>/g, ''),
    r[2],
    r[3],
  ])
}

test('title is the season; four tabs in a tablist, Kills selected by default', () => {
  const node = view()
  const html = staticMarkup(node)
  assert.match(html, /<h2 class="home-section__title" id="lb-title">Season 1 leaderboard<\/h2>/)
  assert.match(html, /<div class="lb-tabs" role="tablist" aria-labelledby="lb-title">/)
  const t = tabs(node).map(propsOf)
  assert.deepEqual(t.map((p) => p.children), ['Kills', 'All-Time Kills', 'Deaths', 'Survival'])
  assert.deepEqual(t.map((p) => p['aria-selected']), [true, false, false, false])
  assert.deepEqual(t.map((p) => p.tabIndex), [0, -1, -1, -1])
  assert.deepEqual(t.map((p) => p['aria-controls']), ['lb-panel-kills', 'lb-panel-alltime', 'lb-panel-deaths', 'lb-panel-survival'])
  assert.deepEqual(t.map((p) => p.id), ['lb-tab-kills', 'lb-tab-alltime', 'lb-tab-deaths', 'lb-tab-survival'])
  assert.equal(propsOf(panel(node, 'kills')).hidden, false)
  assert.equal(propsOf(panel(node, 'deaths')).hidden, true)
  assert.equal(propsOf(panel(node, 'kills'))['aria-labelledby'], 'lb-tab-kills')
})

test('Kills rows: current character only, one number each, ranked by it; a dead player\'s 0 stays', () => {
  assert.deepEqual(rowsOf(staticMarkup(view()), 'kills'), [
    ['1', 'Pete Tard', '181'],
    ['2', 'Hokalt', '12'],
    ['3', 'fisher man', '3'],
    ['4', 'skye', '0'],
  ])
})

const BIG = parseLeaderboard(BOARD_21)

/** The "Show all N" / "Show fewer" button of a tab, or undefined when there is none. */
function moreButton(node: ReactNode, tab: TabId) {
  return elements(panel(node, tab)).find((e) => e.type === 'button')
}

test('a long tab (T70): 10 rows, then all 21 after "Show all 21"; "Show fewer" folds them back', () => {
  const folded = view({ data: BIG, tab: 'alltime' })
  const rows = rowsOf(staticMarkup(folded), 'alltime')
  assert.equal(rows.length, 10)
  assert.deepEqual(rows.slice(-1)[0], ['10', 'Wren', '22'])
  const html = staticMarkup(folded)
  assert.ok(
    html.includes('<button type="button" class="lb-more" aria-expanded="false" aria-controls="lb-table-alltime">Show all 21</button>'),
  )
  assert.match(html, /<table class="lb-table" id="lb-table-alltime">/)
  const toggled: TabId[] = []
  ;(propsOf(moreButton(view({ data: BIG, tab: 'alltime', onToggle: (t) => toggled.push(t) }), 'alltime')!).onClick as () => void)()
  assert.deepEqual(toggled, ['alltime'])

  const open = staticMarkup(view({ data: BIG, tab: 'alltime', expanded: { alltime: true } }))
  const all = rowsOf(open, 'alltime')
  assert.equal(all.length, 21)
  assert.deepEqual(all.map((r) => r[0]), Array.from({ length: 21 }, (_, i) => String(i + 1)))
  assert.deepEqual(all.slice(-1)[0], ['21', 'Payo', '0'])
  assert.ok(open.includes('<button type="button" class="lb-more" aria-expanded="true" aria-controls="lb-table-alltime">Show fewer</button>'))
  // Each tab folds on its own: Deaths is still at 10 with its own button.
  assert.equal(rowsOf(open, 'deaths').length, 10)
  assert.ok(open.includes('aria-controls="lb-table-deaths">Show all 21</button>'))
})

test('no button (T70) for a tab of 10 rows or fewer, and every row is drawn', () => {
  assert.equal(moreButton(view(), 'alltime'), undefined)
  assert.doesNotMatch(staticMarkup(view()), /lb-more/)
  const ten = parseLeaderboard({ ...BOARD_21, kills: BOARD_21.kills.slice(0, 10) })
  const node = view({ data: ten, tab: 'alltime' })
  assert.equal(moreButton(node, 'alltime'), undefined)
  assert.equal(moreButton(node, 'kills'), undefined)
  assert.equal(rowsOf(staticMarkup(node), 'alltime').length, 10)
  const eleven = parseLeaderboard({ ...BOARD_21, kills: BOARD_21.kills.slice(0, 11) })
  assert.ok(staticMarkup(view({ data: eleven, tab: 'alltime' })).includes('>Show all 11</button>'))
})

test('zero rows (T70) render "0", and a dead player\'s Survival "0h", never hidden or blank', () => {
  const open = staticMarkup(view({ data: BIG, expanded: { kills: true, alltime: true, deaths: true, survival: true } }))
  assert.deepEqual(rowsOf(open, 'alltime').slice(-1)[0], ['21', 'Payo', '0'])
  assert.deepEqual(rowsOf(open, 'kills').slice(-2), [
    ['20', 'Crusty', '0'],
    ['21', 'Payo', '0'],
  ])
  assert.equal(rowsOf(open, 'deaths').filter((r) => r[2] === '0').length, 20)
  assert.deepEqual(rowsOf(open, 'survival').slice(-1)[0], ['21', 'Crusty', '0h'])
  assert.doesNotMatch(open, /<td class="lb-value"><\/td>/)
})

test('All-Time Kills rows: every character this season, in the game\'s order', () => {
  assert.deepEqual(rowsOf(staticMarkup(view({ tab: 'alltime' })), 'alltime'), [
    ['1', 'Pete Tard', '181'],
    ['2', 'fisher man', '214'],
    ['2', 'skye', '214'],
    ['4', 'Hokalt', '12'],
  ])
})

test('each kills tab explains itself in visible text under the tabs', () => {
  const html = staticMarkup(view()).replace(/&#x27;/g, "'")
  assert.ok(
    html.includes(
      `<p class="lb-help" id="lb-help-kills">Zombie kills by each player's current character. Kills from characters that have died count only toward All-Time Kills.</p>`,
    ),
  )
  assert.ok(
    html.includes(
      `<p class="lb-help" id="lb-help-alltime">Zombie kills across every character a player has had this season, including ones that died. If a player hasn't died, this matches their Kills. Ties are listed by name.</p>`,
    ),
  )
  assert.equal(propsOf(panel(view(), 'kills'))['aria-describedby'], 'lb-help-kills')
  assert.equal(propsOf(panel(view(), 'alltime'))['aria-describedby'], 'lb-help-alltime')
})

test('crowns for ranks 1-3 have the rank in words as their text alternative; ties share', () => {
  const html = staticMarkup(view())
  const medals = [...html.matchAll(/<span class="lb-medal lb-medal--(\w+)" role="img" aria-label="(\w+)">/g)].map((m) => [m[1], m[2]])
  assert.deepEqual(medals, [
    ['gold', '1st'],
    ['silver', '2nd'],
    ['bronze', '3rd'],
    ['gold', '1st'],
    ['silver', '2nd'],
    ['silver', '2nd'],
    ['gold', '1st'],
    ['silver', '2nd'],
    ['gold', '1st'],
    ['silver', '2nd'],
    ['bronze', '3rd'],
  ])
  assert.match(html, /<svg class="lb-medal__crown"[^>]*aria-hidden="true"/)
  assert.match(html, /<td class="lb-rank">4<\/td>/)
})

test('switching tabs: a click selects without moving focus; arrows select and move focus', () => {
  const picks: [TabId, boolean][] = []
  const node = view({ onSelect: (t, k) => picks.push([t, k]) })
  ;(propsOf(tabs(node)[3]).onClick as () => void)()
  const list = elements(node).find((e) => propsOf(e).role === 'tablist')
  assert.ok(list)
  const key = (k: string) => {
    let prevented = false
    ;(propsOf(list).onKeyDown as (e: unknown) => void)({ key: k, preventDefault: () => (prevented = true) })
    return prevented
  }
  assert.equal(key('ArrowRight'), true)
  assert.equal(key('ArrowLeft'), true)
  assert.equal(key('End'), true)
  assert.equal(key('Tab'), false)
  assert.deepEqual(picks, [
    ['survival', false],
    ['alltime', true],
    ['survival', true],
    ['survival', true],
  ])
})

test('the selected tab shows its own rows and value format', () => {
  const deaths = view({ tab: 'deaths' })
  assert.equal(propsOf(panel(deaths, 'deaths')).hidden, false)
  assert.equal(propsOf(panel(deaths, 'kills')).hidden, true)
  assert.deepEqual(tabs(deaths).map((e) => propsOf(e)['aria-selected']), [false, false, true, false])
  assert.deepEqual(rowsOf(staticMarkup(deaths), 'deaths'), [
    ['1', 'skye', '4'],
    ['2', 'fisher man', '1'],
  ])
  assert.deepEqual(rowsOf(staticMarkup(view({ tab: 'survival' })), 'survival'), [
    ['1', 'Pete Tard', '7d 8h'],
    ['2', 'Hokalt', '24h'],
    ['3', 'fisher man', '5h'],
  ])
  assert.match(staticMarkup(view({ tab: 'survival' })), /<th scope="col" class="lb-value">Survived<\/th>/)
})

test('the name mode flips names: survivor name (username when none) or username', () => {
  assert.deepEqual(rowsOf(staticMarkup(view({ mode: 'character' })), 'kills').map((r) => r[1]), ['Pete Tard', 'Hokalt', 'fisher man', 'skye'])
  assert.deepEqual(rowsOf(staticMarkup(view({ mode: 'account' })), 'kills').map((r) => r[1]), ['Pootard', 'hok', 'rax', 'skye'])
  assert.deepEqual(rowsOf(staticMarkup(view({ mode: 'account' })), 'alltime').map((r) => r[1]), ['Pootard', 'rax', 'skye', 'hok'])
})

test('the source line under the table', () => {
  assert.match(staticMarkup(view()), /<p class="home-section__note lb-source">As shown in game, updated 5 minutes ago\.<\/p>/)
  const aurora = view({ data: parseLeaderboard({ ...CONTRACT, source: 'aurora' }) })
  assert.match(staticMarkup(aurora), /<p class="home-section__note lb-source">Counted by Aurora; the in-game board may differ by a few kills\.<\/p>/)
})

test('before 036 exists: title, lead and the one fallback line, no tabs', () => {
  const html = staticMarkup(view({ data: null, unavailable: true }))
  assert.match(html, /<h2 class="home-section__title" id="lb-title">Leaderboard<\/h2>/)
  assert.ok(html.includes(`<p class="home-section__note" role="status">${UNAVAILABLE_LINE}</p>`))
  assert.doesNotMatch(html, /role="tablist"/)
  assert.doesNotMatch(html, /lb-source/)
})

test('while the first answer is on its way: one loading line, no tab says "no kills" yet', () => {
  const node = createElement(LeaderboardView, {
    titleId: 'lb-title', prefix: 'lb', data: null, unavailable: false, loading: true, mode: 'character', tab: 'kills', onSelect: () => {}, now: NOW,
  })
  const html = staticMarkup(node)
  assert.ok(html.includes(`<p class="home-section__note" role="status">${LOADING_LINE}</p>`))
  assert.doesNotMatch(html, /role="tablist"|No kills/)
})

test('no rows: each tab says so, and no table is drawn', () => {
  const empty = parseLeaderboard({ source: 'aurora', world_seq: 2, seen_at: null, kills: [], deaths: [], survival: [] })
  const html = staticMarkup(view({ data: empty }))
  assert.match(html, /Season 2 leaderboard/)
  assert.ok(html.includes('<p class="home-section__empty">No kills by a current character yet this season.</p>'))
  assert.ok(html.includes('<p class="home-section__empty">No kills recorded yet this season.</p>'))
  assert.ok(html.includes('<p class="home-section__empty">No deaths recorded yet this season.</p>'))
  assert.doesNotMatch(html, /<table/)
  assert.doesNotMatch(staticMarkup(view({ data: null })), /<table/)
})

test('the switch in Who is on now reaches the leaderboard on the same page', () => {
  const memory: StorageLike = { getItem: () => null, setItem: () => {} }
  const seen: NameMode[] = []
  const stop = subscribeNameMode((m) => seen.push(m))
  chooseNameMode('account', () => {}, memory)
  chooseNameMode('character', () => {}, memory)
  stop()
  chooseNameMode('account', () => {}, memory)
  assert.deepEqual(seen, ['account', 'character'])
  const src = readFileSync(new URL('./Leaderboard.tsx', import.meta.url), 'utf8')
  assert.match(src, /useEffect\(\(\) => subscribeNameMode\(setMode\), \[\]\)/)
  assert.match(src, /<LeaderboardView/)
  const home = readFileSync(new URL('../../pages/HomePage.tsx', import.meta.url), 'utf8')
  assert.match(home, /<Leaderboard \/>/)
  assert.doesNotMatch(home, /KillLeaderboard/)
})
