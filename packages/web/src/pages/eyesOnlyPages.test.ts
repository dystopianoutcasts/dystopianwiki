/**
 * Pins the wiring of the EYES ONLY pages (migration 041): the routes sit above the /:version
 * catch-alls, both pages are noindex and fall back to the ordinary 404, the document runs in
 * a sandbox without same-origin, and the area is not in the sitemap or robots.txt. The pages
 * import stylesheets and React components that cannot load in node:test, so the tests read
 * their source. node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url))
/** Source without comments, so a comment cannot satisfy or break a check. */
const code = (p: string) =>
  readFileSync(here(p), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '')

const app = code('../App.tsx')
const index = code('./EyesOnlyPage.tsx')
const viewer = code('./EyesOnlyDocumentPage.tsx')

test('the EYES ONLY routes are declared before every /:version catch-all', () => {
  const eyes = app.indexOf('path="/eyes-only"')
  const eyesDoc = app.indexOf('path="/eyes-only/:slug"')
  const firstCatchAll = app.indexOf('path="/:version"')
  assert.ok(eyes > 0 && eyesDoc > 0, 'both routes exist')
  assert.ok(firstCatchAll > eyes && firstCatchAll > eyesDoc, 'a /:version route comes first')
  assert.match(app, /path="\/eyes-only" element=\{<EyesOnlyPage \/>\}/)
  assert.match(app, /path="\/eyes-only\/:slug" element=\{<EyesOnlyDocumentPage \/>\}/)
})

test('both pages are noindex,nofollow and show the ordinary 404 when refused', () => {
  for (const page of [index, viewer]) {
    assert.match(page, /<meta name="robots" content="noindex, nofollow" \/>/)
    assert.match(page, /if \(\w+\.status === 'denied'\) return <NotFoundPage \/>/)
  }
})

test('the document is rendered as uploaded in a sandbox without same-origin, top navigation or forms', () => {
  assert.match(viewer, /srcDoc=\{html\}/)
  const sandbox = /sandbox="([^"]*)"/.exec(viewer)
  assert.ok(sandbox, 'the iframe has a sandbox attribute')
  assert.deepEqual(sandbox[1].split(' ').sort(), ['allow-popups', 'allow-popups-to-escape-sandbox', 'allow-scripts'])
  assert.match(viewer, /<iframe[^>]*\btitle=\{title\}/)
  assert.doesNotMatch(viewer, /dangerouslySetInnerHTML/)
})

test('the area is not in the sitemap or robots.txt', () => {
  for (const p of ['../../public/sitemap.xml', '../../public/robots.txt']) {
    assert.doesNotMatch(readFileSync(here(p), 'utf8'), /eyes-only/i, p)
  }
})

test('the dashboard shows the Executives section to admins and the documents section to the superadmin only', () => {
  const dashboard = code('./AdminDashboardPage.tsx')
  assert.match(dashboard, /^\s*<ExecutivesSection selfId=\{selfId\} \/>/m)
  assert.match(dashboard, /\{superadmin && <EyesOnlySection \/>\}/)
})
