/**
 * Tests for the drawn icon set (KB16): every icon word the navigation uses has a drawing of its
 * own, an unknown word falls back to a neutral page, the icon is decorative and follows the text
 * colour and size, and the footnote back link draws the return icon instead of U+21A9.
 *
 * node:test, run with `npx tsx --test src/components/icons/icons.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { VERSIONS } from '../../config/versions.generated'
import { ICON_SHAPES, FALLBACK_ICON, iconShape, isIconName } from './iconShapes'
import { Icon, resolveIcon } from './Icon'
import { footnoteBackContent } from '../wiki/footnoteBack'
// react-dom/server cannot load in this workspace's node:test (it resolves another React); see staticMarkup.
import { staticMarkup as renderToStaticMarkup } from '../landing/staticMarkup'

/** An element as react-markdown returns it (from the workspace's React, so not React 18's isValidElement). */
interface El { type: unknown; props: Record<string, unknown> & { children?: unknown } }
const isEl = (n: unknown): n is El => typeof n === 'object' && n !== null && 'type' in n && 'props' in n
/** Every element of a tree, function components called with their props. */
function elements(node: unknown, out: El[] = []): El[] {
  if (Array.isArray(node)) { for (const c of node) elements(c, out); return out }
  if (!isEl(node)) return out
  if (typeof node.type === 'function') return elements((node.type as (p: unknown) => unknown)(node.props), out)
  out.push(node)
  elements(node.props.children, out)
  return out
}
const text = (node: unknown): string => Array.isArray(node) ? node.map(text).join('') : typeof node === 'string' ? node : isEl(node) ? text(node.props.children) : ''

const SRC = fileURLToPath(new URL('../../', import.meta.url))
const code = (rel: string) =>
  readFileSync(SRC + rel, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

test('every section and category icon word in the navigation has a drawing of its own', () => {
  const missing: string[] = []
  for (const v of VERSIONS) {
    for (const s of v.sections) {
      if (!isIconName(s.icon) || s.icon === FALLBACK_ICON) missing.push(`${v.id}/${s.id}: ${s.icon}`)
      for (const c of s.categories) if (!isIconName(c.icon) || c.icon === FALLBACK_ICON) missing.push(`${v.id}/${s.id}/${c.id}: ${c.icon}`)
    }
  }
  assert.deepEqual(missing, [])
})

test('the words the old emoji map knew are all still drawn, so no version regresses to the fallback', () => {
  const words = ['book', 'box', 'cog', 'database', 'file-text', 'hammer', 'layout', 'leaf', 'scroll', 'settings', 'sparkles', 'tool', 'video',
    'wrench', 'zap', 'plug', 'car', 'gear', 'map', 'grid', 'globe', 'building', 'mountain']
  assert.deepEqual(words.filter((w) => !isIconName(w)), [])
})

test('an unknown word falls back to the neutral page, which is not any navigation icon', () => {
  assert.equal(FALLBACK_ICON, 'file')
  assert.deepEqual(iconShape('no-such-icon'), ICON_SHAPES.file)
  assert.deepEqual(iconShape('__proto__'), ICON_SHAPES.file)
  assert.deepEqual(iconShape('constructor'), ICON_SHAPES.file)
  assert.notDeepEqual(ICON_SHAPES.file, ICON_SHAPES.book)
})

test('every drawing is distinct and is path data on the 24 x 24 grid', () => {
  const seen = new Map<string, string>()
  for (const [name, paths] of Object.entries(ICON_SHAPES)) {
    assert.ok(paths.length > 0, `${name} draws nothing`)
    for (const d of paths) {
      assert.match(d, /^M[\d.\s-]/, `${name}: path must start with an absolute move: ${d}`)
      assert.match(d, /^[MmLlHhVvCcSsQqAaZz\d.\s,-]+$/, `${name}: not path data: ${d}`)
      // The absolute moves stay on the grid.
      for (const m of d.matchAll(/M(-?[\d.]+)[\s,](-?[\d.]+)/g)) {
        for (const n of [Number(m[1]), Number(m[2])]) assert.ok(n >= 0 && n <= 24, `${name}: ${n} off the grid`)
      }
    }
    const key = paths.join('|')
    assert.ok(!seen.has(key), `${name} is drawn the same as ${seen.get(key)}`)
    seen.set(key, name)
  }
})

test('an icon is decorative, stroked with the text colour and sized in em', () => {
  const html = renderToStaticMarkup(createElement(Icon, { name: 'gear', className: 'x' }))
  assert.match(html, /^<svg [^>]*class="icon x"/)
  assert.match(html, /aria-hidden="true"/)
  assert.match(html, /focusable="false"/)
  assert.match(html, /stroke="currentColor"/)
  assert.match(html, /fill="none"/)
  assert.match(html, /width="1em"/)
  assert.match(html, /height="1em"/)
  assert.match(html, /viewBox="0 0 24 24"/)
  assert.doesNotMatch(html, /role="img"|aria-label|<title/, 'a decorative icon must not announce itself')
  assert.equal(html.match(/<path /g)?.length, ICON_SHAPES.gear.length)
})

test('resolveIcon draws the word it is given, and the server and gameplay sections are not the fallback', () => {
  const b42 = VERSIONS.find((v) => v.id === 'build-42')
  for (const id of ['server', 'gameplay']) {
    const s = b42?.sections.find((x) => x.id === id)
    assert.ok(s, `no section ${id}`)
    const html = renderToStaticMarkup(resolveIcon(s.icon))
    for (const d of iconShape(s.icon)) assert.ok(html.includes(`d="${d}"`), `${id}: path ${d} not drawn`)
    assert.notEqual(s.icon, FALLBACK_ICON)
  }
})

test('the pages and the sidebar draw icons through the shared set and keep no map of their own', () => {
  for (const f of ['pages/VersionPage.tsx', 'pages/SectionPage.tsx', 'pages/CategoryPage.tsx']) {
    const src = code(f)
    assert.match(src, /import \{ resolveIcon \} from '\.\.\/components\/icons\/Icon'/, f)
  }
  const sidebar = code('components/layout/Sidebar.tsx')
  assert.match(sidebar, /import \{ Icon, resolveIcon \} from '\.\.\/icons\/Icon'/, 'the sidebar draws through the shared set')
  assert.match(sidebar, /<Icon name="path" \/>/, 'the Learning Path link draws the path icon')
  for (const f of ['components/layout/Sidebar.tsx', 'components/landing/SectionBrowser.tsx', 'components/landing/QuickstartGrid.tsx', 'pages/VersionPage.tsx']) {
    assert.doesNotMatch(code(f), /Record<string, string> = \{\s*'?[\w-]+'?\s*:\s*'[^']{1,4}'/, `${f} has an icon map again`)
  }
  for (const f of ['components/landing/SectionBrowser.tsx', 'components/landing/QuickstartGrid.tsx']) {
    assert.match(code(f), /<Icon name=\{(section|card)\.icon\} \/>/, f)
  }
})

test('the icon spans on the version, section and category pages are hidden from screen readers', () => {
  assert.match(code('pages/VersionPage.tsx'), /<span className="version-page__section-icon" aria-hidden="true">\s*\{resolveIcon\(section\.icon\)\}/)
  assert.match(code('pages/SectionPage.tsx'), /<span className="section-page__icon" aria-hidden="true">/)
  assert.match(code('pages/SectionPage.tsx'), /<span className="section-page__category-icon" aria-hidden="true">/)
  assert.match(code('pages/CategoryPage.tsx'), /<span className="category-page__icon" aria-hidden="true">/)
})

test('a footnote back link draws the return icon, keeps its name, and no U+21A9', () => {
  // react-markdown (the renderer the site uses) with and without the option, read as elements.
  const md = ['One claim.[^1] Another.[^1]', '', '[^1]: The note.', ''].join(String.fromCharCode(10))
  const BACK_ARROW = String.fromCodePoint(0x21a9)
  const render = (withOption: boolean) =>
    elements(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], ...(withOption ? { remarkRehypeOptions: { footnoteBackContent } } : {}), children: md }))
  const backLinks = (els: El[]) => els.filter((e) => e.type === 'a' && 'data-footnote-backref' in e.props)
  const ours = backLinks(render(true))
  assert.equal(ours.length, 2, 'two back links (the note is referenced twice)')
  assert.ok(!ours.some((a) => text(a.props.children).includes(BACK_ARROW)), 'the U+21A9 character is still rendered')
  assert.deepEqual(ours.map((a) => a.props['aria-label']), ['Back to reference 1', 'Back to reference 1-2'])
  for (const a of ours) {
    const inner = elements(a.props.children)
    const svg = inner.find((x) => x.type === 'svg')
    assert.ok(svg, 'no svg in the back link')
    assert.equal(svg.props['aria-hidden'], 'true')
    assert.deepEqual(inner.filter((x) => x.type === 'path').map((x) => x.props.d), [...iconShape('return')])
  }
  assert.ok(!elements(ours[0].props.children).some((x) => x.type === 'sup'))
  assert.equal(text(elements(ours[1].props.children).find((x) => x.type === 'sup')), '2', 'the second reference keeps its number')
  // Control: without the option the back link is the U+21A9 character phones draw as an emoji.
  assert.ok(backLinks(render(false)).every((a) => text(a.props.children).includes(BACK_ARROW)))
})

test('the markdown renderer passes the footnote option to the pipeline', () => {
  const src = code('components/wiki/MarkdownRenderer.tsx')
  assert.match(src, /const REMARK_REHYPE_OPTIONS = \{ footnoteBackContent \};/)
  assert.match(src, /remarkRehypeOptions=\{REMARK_REHYPE_OPTIONS\}/)
  assert.equal([footnoteBackContent(0, 1)].flat().length, 1)
  assert.equal([footnoteBackContent(0, 3)].flat().length, 2)
})
