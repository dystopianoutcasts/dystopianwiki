/**
 * Tests for the Outcast invitation at the end of every article, and the /#join target (KB05).
 *
 * OutcastInvitationView is rendered with ../landing/staticMarkup and a stand-in for the in-site
 * link that writes the anchor react-router's Link renders (react-dom, which the router needs,
 * cannot load in node:test here). OutcastInvitation, WikiArticle and JoinSteps use the router,
 * hooks or the Supabase client, so where they are concerned the tests read their source.
 * node:test, run with `npx tsx --test src/components/wiki/OutcastInvitation.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement, type ReactNode } from 'react'
import { staticMarkup } from '../landing/staticMarkup'
import { DISCORD_URL, JOIN_PATH, JOIN_SECTION_ID } from '../../lib/links'
import { INVITATION, INVITATION_TITLE_ID, OutcastInvitationView, type InSiteLinkProps } from './OutcastInvitationView'

const SRC = fileURLToPath(new URL('../../', import.meta.url))
const read = (rel: string) => readFileSync(join(SRC, rel), 'utf8')
/** Source without line comments, so a comment cannot satisfy or break a check. */
const code = (rel: string) => read(rel).replace(/^\s*\/\/.*$/gm, '')

/** Every <a ...>inner</a> in the markup, in order. */
function links(html: string): { attrs: string; inner: string }[] {
  return [...html.matchAll(/<a ([^>]*)>(.*?)<\/a>/g)].map((m) => ({ attrs: m[1], inner: m[2] }))
}

/** Stand-in for react-router's Link: the anchor it renders, href = to, same tab. */
function StubLink({ to, className, children }: InSiteLinkProps): ReactNode {
  return createElement('a', { href: to, className }, children)
}

const html = staticMarkup(createElement(OutcastInvitationView, { LinkComponent: StubLink }))

test('the block has exactly two links: "Mod with us!" then "Zomboid with us!"', () => {
  const all = links(html)
  assert.equal(all.length, 2)
  assert.match(all[0].inner, /^<span class="outcast-invite__text">Mod with us!<\/span>/)
  assert.match(all[1].inner, /^<span class="outcast-invite__text">Zomboid with us!<\/span>/)
})

test('"Mod with us!" goes to the shared Discord URL and opens like the site\'s other external links', () => {
  const [mod] = links(html)
  assert.ok(mod.attrs.includes(`href="${DISCORD_URL}"`), mod.attrs)
  assert.equal(new URL(DISCORD_URL).hostname, 'discord.gg')
  assert.ok(mod.attrs.includes('target="_blank"'))
  assert.ok(mod.attrs.includes('rel="noopener noreferrer"'))
  assert.match(mod.inner, /opens in a new tab/)
})

test('"Zomboid with us!" goes to /#join in the same tab, through the router\'s Link', () => {
  const [, play] = links(html)
  assert.equal(JOIN_PATH, '/#join')
  assert.ok(play.attrs.includes('href="/#join"'), play.attrs)
  assert.ok(!play.attrs.includes('target='))
  const wrapper = code('components/wiki/OutcastInvitation.tsx')
  assert.match(wrapper, /import \{ Link \} from 'react-router-dom'/)
  assert.match(wrapper, /<OutcastInvitationView LinkComponent=\{InSiteLink\} \/>/)
  assert.match(wrapper, /<Link to=\{to\} className=\{className\}>/)
})

test('the block is a labelled aside with an h2, so it does not break the article heading order', () => {
  assert.match(html, new RegExp(`^<aside class="outcast-invite" aria-labelledby="${INVITATION_TITLE_ID}">`))
  assert.match(html, new RegExp(`<h2 class="outcast-invite__title" id="${INVITATION_TITLE_ID}">${INVITATION.title}</h2>`))
  assert.ok(!/<h[13456]/.test(html))
  assert.ok(html.includes(INVITATION.leadIn))
})

test('the Discord URL has one source: no discord.gg literal in src outside lib/links.ts', () => {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) walk(full)
      else if (/\.(tsx?|css)$/.test(name) && !name.endsWith('.test.ts') && readFileSync(full, 'utf8').includes('discord.gg')) {
        found.push(full.slice(SRC.length).replace(/\\/g, '/'))
      }
    }
  }
  walk(SRC)
  assert.deepEqual(found, ['lib/links.ts'])
  assert.match(code('components/wiki/OutcastInvitationView.tsx'), /import \{[^}]*\bDISCORD_URL\b[^}]*\} from '\.\.\/\.\.\/lib\/links'/)
  assert.match(code('components/landing/JoinSteps.tsx'), /href=\{DISCORD_URL\}/)
})

test('every article page shows the block after the body and before any navigation', () => {
  const src = code('components/wiki/WikiArticle.tsx')
  const at = (s: string) => {
    const i = src.indexOf(s)
    assert.ok(i >= 0, `WikiArticle renders ${s}`)
    return i
  }
  const block = at('<OutcastInvitation />')
  assert.equal(src.indexOf('<OutcastInvitation />', block + 1), -1, 'rendered once')
  assert.ok(at('<MarkdownRenderer') < block)
  for (const later of ['wiki-article__next-steps', 'wiki-article__learning-path', '<RelatedArticles', 'wiki-article__footer']) {
    assert.ok(block < at(later), `before ${later}`)
  }
  assert.ok(!src.includes('ArticleCTA'))
  // ArticlePage serves every version through WikiArticle.
  assert.match(code('pages/ArticlePage.tsx'), /<WikiArticle\b/)
})

test('the join section carries id="join", its heading takes focus, and the router scrolls to hashes', () => {
  assert.equal(JOIN_SECTION_ID, 'join')
  const join = code('components/landing/JoinSteps.tsx')
  assert.match(join, /<section\s+id=\{JOIN_SECTION_ID\}/)
  assert.match(join, /className="[^"]*\bhome-section--anchor\b/)
  assert.match(join, /<h2 className="home-section__title" id=\{titleId\} tabIndex=\{-1\}>/)
  assert.match(read('styles/components/home-sections.css'), /\.home-section--anchor \{\s*scroll-margin-top: var\(--header-height\);/)
  const app = code('App.tsx')
  const router = app.indexOf('<BrowserRouter')
  const scroll = app.indexOf('<ScrollToHash />')
  assert.ok(router >= 0 && scroll > router && scroll < app.indexOf('</BrowserRouter>'))
})
