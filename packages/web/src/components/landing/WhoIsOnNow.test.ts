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
import type { MapDot } from '../../lib/serverNowDots'
import { staticMarkup } from './staticMarkup'
import { WhoIsOnNow } from './WhoIsOnNow'

const DOTS: MapDot[] = [
  { id: 'rax', username: 'rax', displayName: 'fisher man', name: 'fisher man', x: 1, y: 2 },
  { id: 'skye', username: 'skye', displayName: 'fisher man', name: 'fisher man', x: 3, y: 4 },
  { id: 'anon', username: 'anon', displayName: null, name: 'anon', x: 5, y: 6 },
]

function element(mode: NameMode, onModeChange: (m: NameMode) => void = () => {}, dots = DOTS) {
  return createElement(WhoIsOnNow, { dots, mode, onModeChange, onShow: () => {}, emptyText: 'Nobody is on right now.' })
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
  assert.deepEqual(chips(staticMarkup(element('character'))), ['fisher man', 'fisher man', 'anon'])
})

test('username mode: the two "fisher man" chips become two different usernames', () => {
  const html = staticMarkup(element('account'))
  assert.deepEqual(chips(html), ['rax', 'skye', 'anon'])
  assert.match(html, /aria-label="Show rax on the map"/)
})

test('the switch sits in the heading row: a labelled radio pair with the owner\'s words', () => {
  const html = staticMarkup(element('character'))
  assert.match(
    html,
    /<div class="home-onnow__head"><h3 class="home-onnow__title">Who is on now<\/h3><fieldset class="home-namemode"><legend class="sr-only">Show names as<\/legend>/,
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
  assert.deepEqual(chips(staticMarkup(element(mode))), ['rax', 'skye', 'anon'])
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
  assert.deepEqual(chips(staticMarkup(element(mode))), ['fisher man', 'fisher man', 'anon'])
  radio(element(mode, (m) => chooseNameMode(m, (next) => (mode = next), blocked)), 'account').onChange()
  assert.deepEqual(chips(staticMarkup(element(mode))), ['rax', 'skye', 'anon'])
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
})
