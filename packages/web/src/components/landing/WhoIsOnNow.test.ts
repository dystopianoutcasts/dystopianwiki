/**
 * Tests for "Who is on now" (T62): the Survivor name / Username switch and the chips.
 *
 * WhoIsOnNow has no hooks, so it renders with ./staticMarkup; the switch's handler is
 * found in the element tree and called, as a click would. ServerNow passes
 * chooseNameMode (lib/nameMode.ts) as that handler; the source check below holds it to that.
 * node:test, run with `npx tsx --test src/components/landing/WhoIsOnNow.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { chooseNameMode, loadNameMode, type NameMode, type StorageLike } from '../../lib/nameMode'
import { buildDots, buildOnlineList, type MapDot, type OnlinePlayer, type PlayerRow } from '../../lib/serverNowDots'
import { staticMarkup } from './staticMarkup'
import { WhoIsOnNow } from './WhoIsOnNow'

// Invented players. The list sorts by the shown name: "anon" before "fisher man" in
// survivor mode, "anon" < "rax" < "skye" in username mode.
function online(username: string, displayName: string | null, x: number, y: number): OnlinePlayer {
  const dot: MapDot = { id: username, username, displayName, name: displayName || username, x, y }
  return { id: username, username, displayName, dot, noDot: null }
}

const DOTS: OnlinePlayer[] = [online('rax', 'fisher man', 1, 2), online('skye', 'fisher man', 3, 4), online('anon', null, 5, 6)]

function element(
  mode: NameMode,
  onModeChange: (m: NameMode) => void = () => {},
  players: OnlinePlayer[] = DOTS,
  onShow: (d: MapDot) => void = () => {},
) {
  return createElement(WhoIsOnNow, { players, mode, onModeChange, onShow, emptyText: 'Nobody is on right now.' })
}

/** Every listed entry in order, button or plain text, with its secondary text, tags stripped. */
function entries(html: string): string[] {
  return [...html.matchAll(/<li class="home-onnow__item">(.*?)<\/li>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''))
}

function chips(html: string): string[] {
  return [...html.matchAll(/<button [^>]*class="home-onnow__name"[^>]*>(.*?)<\/button>/g)].map((m) => m[1])
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

function radio(node: ReactNode, value: NameMode): { checked: boolean; onChange: () => void } {
  const el = elements(node).find((e) => e.type === 'input' && (e.props as { value?: string }).value === value)
  assert.ok(el, `no radio for ${value}`)
  return el.props as { checked: boolean; onChange: () => void }
}

function memory(): StorageLike {
  const data = new Map<string, string>()
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) }
}

test('survivor name mode: chips show survivor names, a missing one falls back to the username', () => {
  assert.deepEqual(chips(staticMarkup(element('character'))), ['anon', 'fisher man', 'fisher man'])
})

test('username mode: the two "fisher man" chips become two different usernames', () => {
  const html = staticMarkup(element('account'))
  assert.deepEqual(chips(html), ['anon', 'rax', 'skye'])
  assert.match(html, /aria-label="Show rax on the map"/)
})

test('the switch sits in the heading row: a labelled radio pair with the owner\'s words', () => {
  const html = staticMarkup(element('character'))
  assert.match(
    html,
    /<div class="home-onnow__head"><h3 class="home-onnow__title">Who is on now \(3\)<\/h3><fieldset class="home-namemode"><legend class="sr-only">Show names as<\/legend>/,
  )
  const labels = [...html.matchAll(/<span class="home-namemode__text">(.*?)<\/span>/g)].map((m) => m[1])
  assert.deepEqual(labels, ['Survivor name', 'Username'])
  assert.equal(radio(element('character'), 'character').checked, true)
  assert.equal(radio(element('character'), 'account').checked, false)
  assert.equal(radio(element('account'), 'account').checked, true)
  assert.equal((html.match(/type="radio"/g) ?? []).length, 2)
  assert.equal((html.match(/name="home-name-mode"/g) ?? []).length, 2)
})

test('clicking Username saves it: a reload (loadNameMode on the same storage) comes back as Username', () => {
  const storage = memory()
  let mode: NameMode = loadNameMode(storage)
  assert.equal(mode, 'character')
  radio(element(mode, (m) => chooseNameMode(m, (next) => (mode = next), storage)), 'account').onChange()
  assert.equal(mode, 'account')
  assert.deepEqual(chips(staticMarkup(element(mode))), ['anon', 'rax', 'skye'])
  assert.equal(loadNameMode(storage), 'account')
})

test('with storage blocked the default still renders, and a click still flips the chips', () => {
  const blocked: StorageLike = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }
  let mode: NameMode = loadNameMode(blocked)
  assert.deepEqual(chips(staticMarkup(element(mode))), ['anon', 'fisher man', 'fisher man'])
  radio(element(mode, (m) => chooseNameMode(m, (next) => (mode = next), blocked)), 'account').onChange()
  assert.deepEqual(chips(staticMarkup(element(mode))), ['anon', 'rax', 'skye'])
})

test('nobody online: the switch still shows, with the empty text', () => {
  const html = staticMarkup(element('character', () => {}, []))
  assert.match(html, /Nobody is on right now\./)
  assert.match(html, /home-namemode/)
  assert.deepEqual(chips(html), [])
})

test('ServerNow wires the switch to chooseNameMode and labels the map dots by mode', () => {
  const src = readFileSync(new URL('./ServerNow.tsx', import.meta.url), 'utf8')
  assert.match(src, /useState<NameMode>\(\(\) => loadNameMode\(\)\)/)
  assert.match(src, /chooseNameMode\(mode, setNameMode\)/)
  assert.match(src, /onModeChange=\{changeNameMode\}/)
  assert.match(src, /truncateName\(shownName\(dot, nameMode\)\)/)
  // T77: the list is fed every online player, the map markers only the dots.
  assert.match(src, /const \{ dots, online \} = useServerNow\(\)/)
  assert.match(src, /players=\{online\}/)
  assert.match(src, /\{dots\.map\(\(dot\) =>/)
})

// T77: the list is every online player, so its count agrees with the counter and the
// map's "Online now". Invented players, built through the same functions the hook uses.
const ROWS: PlayerRow[] = [
  { username: 'birch', display_name: 'Ada Birch', online: true, is_dead: false },
  { username: 'cole', display_name: 'Ben Cole', online: true, is_dead: true },
  { username: 'dunn', display_name: null, online: true, is_dead: false },
  { username: 'east', display_name: 'Cy East', online: false, is_dead: false },
]
const POSITIONS = [
  { username: 'birch', x: 10, y: 20 },
  { username: 'cole', x: 11, y: 21 },
  { username: 'east', x: 12, y: 22 },
]

function fromRows(mode: NameMode, onShow: (d: MapDot) => void = () => {}) {
  return element(mode, () => {}, buildOnlineList(ROWS, buildDots(ROWS, POSITIONS)), onShow)
}

test('a dead online player and one without a position are listed as plain text with the reason; an offline one is not', () => {
  const html = staticMarkup(fromRows('character'))
  assert.deepEqual(entries(html), ['Ada Birch', 'Ben Cole (between characters)', 'dunn (no map position)'])
  assert.deepEqual(chips(html), ['Ada Birch'])
  assert.equal((html.match(/<button /g) ?? []).length, 1)
  assert.doesNotMatch(html, /Cy East|east/)
})

test('the heading counts every listed player, with or without a dot', () => {
  assert.match(staticMarkup(fromRows('character')), /<h3 class="home-onnow__title">Who is on now \(3\)<\/h3>/)
  assert.match(staticMarkup(element('character', () => {}, [])), /<h3 class="home-onnow__title">Who is on now \(0\)<\/h3>/)
})

test('username mode re-sorts the whole list and keeps the reasons', () => {
  assert.deepEqual(entries(staticMarkup(fromRows('account'))), ['birch', 'cole (between characters)', 'dunn (no map position)'])
})

test('only a player with a dot gets a button, and it shows that dot', () => {
  const shown: MapDot[] = []
  const buttons = elements(fromRows('character', (d) => shown.push(d))).filter((e) => e.type === 'button')
  assert.equal(buttons.length, 1)
  ;(buttons[0].props as { onClick: () => void }).onClick()
  assert.deepEqual(
    shown.map((d) => [d.username, d.x, d.y]),
    [['birch', 10, 20]],
  )
})
