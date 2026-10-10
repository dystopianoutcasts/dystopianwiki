/**
 * Tests for the article page at phone widths (KB16).
 *
 * At 320 and 390 px every article cut its right side off. The cause, measured in a 390 px
 * frame: below 1280 px the article body stacks (flex-direction: column) but kept
 * align-items: flex-start, so the article column shrank to fit its content instead of the
 * page, and a long code line or a wide table made it 585 to 1781 px wide; html and body hide
 * horizontal overflow, so the rest was simply cut off. The column now stretches to the page,
 * long words wrap, and code blocks and tables scroll inside their own box, which a keyboard
 * can reach while it scrolls. These are the rules that hold that in place.
 *
 * node:test, run with `npx tsx --test src/styles/phoneLayout.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const SRC = fileURLToPath(new URL('../', import.meta.url))
const css = (rel: string) => readFileSync(SRC + 'styles/' + rel, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const code = (rel: string) =>
  readFileSync(SRC + rel, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

/** The declarations of `selector` in `src`, optionally only inside the @media block with `media`. */
function decls(src: string, selector: string, media?: string): Map<string, string> {
  let scope = src
  if (media) {
    const at = src.indexOf(`@media ${media}`)
    assert.ok(at >= 0, `no @media ${media}`)
    let depth = 0, i = src.indexOf('{', at), end = i
    for (; end < src.length; end++) {
      if (src[end] === '{') depth++
      else if (src[end] === '}' && --depth === 0) break
    }
    scope = src.slice(i + 1, end)
  }
  const out = new Map<string, string>()
  for (const m of scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (m[1].trim().replace(/\s+/g, ' ') !== selector) continue
    for (const d of m[2].split(';')) {
      const k = d.indexOf(':')
      if (k > 0) out.set(d.slice(0, k).trim(), d.slice(k + 1).trim())
    }
  }
  return out
}

test('stacked below 1280 px, the article column stretches to the page instead of shrinking to its content', () => {
  const body = decls(css('components/wiki-article.css'), '.wiki-article__body', '(max-width: 1280px)')
  assert.equal(body.get('flex-direction'), 'column')
  assert.equal(body.get('align-items'), 'stretch', 'flex-start lets a wide code line or table set the column width')
  assert.equal(decls(css('components/wiki-article.css'), '.wiki-article__main').get('min-width'), '0')
})

test('long words, URLs and inline code wrap; table cells keep the table its natural width', () => {
  const md = css('components/markdown.css')
  assert.equal(decls(md, '.markdown').get('overflow-wrap'), 'anywhere')
  assert.equal(decls(md, '.markdown th, .markdown td').get('overflow-wrap'), 'break-word')
  assert.equal(decls(md, '.markdown img').get('max-width'), '100%')
  assert.equal(decls(md, '.markdown video, .markdown iframe').get('max-width'), '100%')
})

test('tables and code blocks scroll inside their own box, with a visible focus ring', () => {
  const md = css('components/markdown.css')
  const table = decls(md, '.markdown-table-scroll')
  assert.equal(table.get('overflow-x'), 'auto')
  assert.equal(table.get('max-width'), '100%')
  assert.match(decls(md, '.markdown-table-scroll:focus-visible').get('outline') ?? '', /^2px solid /)
  const cb = css('components/code-block.css')
  const content = decls(cb, '.code-block__content')
  assert.equal(content.get('overflow-x'), 'auto')
  assert.equal(content.get('max-width'), '100%')
  assert.match(decls(cb, '.code-block__content:focus-visible').get('outline') ?? '', /^2px solid /)
  // base.css gives every pre its own scroll; inside a code block the focusable box must scroll instead.
  assert.equal(decls(cb, '.code-block__content pre').get('overflow'), 'visible')
})

test('the markdown tables and the code blocks are wrapped in the scroll box', () => {
  assert.match(code('components/wiki/MarkdownRenderer.tsx'), /<ScrollBox className="markdown-table-scroll" label="Table">\s*<table \{\.\.\.props\}>/)
  assert.doesNotMatch(code('components/wiki/MarkdownRenderer.tsx'), /overflowX: 'auto'/, 'the old unlabelled wrapper is back')
  assert.match(code('components/wiki/CodeBlock.tsx'), /<ScrollBox className="code-block__content" label=\{`Code: \$\{filename \|\| language\}`\}>/)
})

test('the scroll box is a labelled, focusable region only while its content is wider than it', () => {
  const src = code('components/wiki/ScrollBox.tsx')
  assert.match(src, /box\.scrollWidth > box\.clientWidth \+ 1/)
  assert.match(src, /\{\.\.\.\(scrolls \? \{ tabIndex: 0, role: 'region', 'aria-label': label \} : \{\}\)\}/)
  assert.match(src, /new ResizeObserver\(measure\)/)
  assert.match(src, /return \(\) => observer\.disconnect\(\)/)
})
