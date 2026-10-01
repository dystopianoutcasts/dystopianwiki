#!/usr/bin/env tsx
/**
 * Sitemap generator
 *
 * Writes packages/web/public/sitemap.xml from the navigation data that
 * scripts/build-nav.ts generates, so the sitemap lists exactly what the site serves.
 * Run `npm run nav` first when content changed.
 *
 * Inputs:
 *   packages/web/public/data/versions.json      versions, sections, categories
 *   packages/web/public/data/search-index.json  every article url
 *
 * Output:
 *   packages/web/public/sitemap.xml  (the web build copies it into dist/, and the
 *                                     deploy copy puts it at the repo root)
 *
 * Listed: the home page, /map/, /vote, each version page, each section page, each
 * category page with at least one article, and every article.
 *
 * Usage:
 *   npx tsx scripts/build-sitemap.ts     (or: npm run sitemap)
 *
 * Run from the repository root.
 */

import fs from 'fs'
import path from 'path'

const SITE_URL = 'https://dystopianoutcasts.online'
const GAME = 'pz'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages', 'web', 'public', 'data')
const OUT = path.join(ROOT, 'packages', 'web', 'public', 'sitemap.xml')

interface Category {
  id: string
  articleCount: number
}
interface Section {
  id: string
  categories: Category[]
}
interface Version {
  id: string
  sections: Section[]
}
interface VersionsFile {
  defaultVersion: string
  versions: Version[]
}
interface SearchEntry {
  url: string
  version: string
}

function readJson<T>(file: string): T {
  if (!fs.existsSync(file)) {
    console.error(`[ERROR] ${path.relative(ROOT, file)} not found; run npm run nav first`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

interface UrlEntry {
  loc: string
  changefreq: 'weekly' | 'monthly'
  priority: string
}

function main(): void {
  const versionsFile = readJson<VersionsFile>(path.join(DATA, 'versions.json'))
  const search = readJson<SearchEntry[]>(path.join(DATA, 'search-index.json'))

  const urls: UrlEntry[] = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/map/', changefreq: 'weekly', priority: '0.8' },
    { loc: '/vote', changefreq: 'weekly', priority: '0.6' },
  ]
  const known = new Set(versionsFile.versions.map(v => v.id))

  for (const v of versionsFile.versions) {
    const current = v.id === versionsFile.defaultVersion
    urls.push({ loc: `/${GAME}/${v.id}`, changefreq: 'weekly', priority: current ? '0.9' : '0.7' })
    for (const s of v.sections) {
      urls.push({ loc: `/${GAME}/${v.id}/${s.id}`, changefreq: 'weekly', priority: current ? '0.8' : '0.6' })
      for (const c of s.categories) {
        if (c.articleCount <= 0) continue
        urls.push({ loc: `/${GAME}/${v.id}/${s.id}/${c.id}`, changefreq: 'weekly', priority: current ? '0.7' : '0.5' })
      }
    }
    const articles = search
      .filter(e => e.version === v.id && typeof e.url === 'string' && e.url.startsWith(`/${GAME}/`))
      .map(e => e.url)
      .sort()
    for (const url of articles) {
      urls.push({ loc: url, changefreq: 'monthly', priority: current ? '0.6' : '0.4' })
    }
  }

  const skipped = search.filter(e => !known.has(e.version)).length
  if (skipped > 0) console.log(`[SKIP] ${skipped} search entries belong to no version in versions.json`)

  const seen = new Set<string>()
  const body = urls
    .filter(u => (seen.has(u.loc) ? false : (seen.add(u.loc), true)))
    .map(
      u =>
        `  <url>\n    <loc>${escapeXml(SITE_URL + u.loc)}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

  fs.writeFileSync(OUT, xml, 'utf-8')
  const perVersion = versionsFile.versions
    .map(v => `${v.id} ${search.filter(e => e.version === v.id).length} articles`)
    .join(', ')
  console.log(`[OK] wrote ${path.relative(ROOT, OUT)}: ${seen.size} urls (${perVersion})`)
}

main()
