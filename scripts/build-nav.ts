#!/usr/bin/env tsx
/**
 * Navigation generator
 *
 * Builds the wiki's navigation data from the content tree, so the version list,
 * sections, categories and search index are never hand-maintained again.
 *
 * Inputs:
 *   content/versions.config.json                       version list and defaultVersion
 *   content/articles/pz/{version}/{section}/_section.json
 *   content/articles/pz/{version}/{section}/{category}/_category.json
 *   content/articles/pz/{version}/{section}/{category}/*.md   (frontmatter)
 *
 * Outputs (the only files this script writes):
 *   packages/web/public/data/versions.json
 *   packages/web/public/data/{version}/{section}/categories.json
 *   packages/web/public/data/{version}/{section}/section-info.json
 *   packages/web/public/data/search-index.json
 *   packages/web/src/config/versions.generated.ts
 *
 * Every other file under packages/web/public/data/ (the build-41 article JSON the
 * learning path reads, learning-path/, version-info.json, sections.json) is left
 * untouched.
 *
 * Version folders not listed in versions.config.json (content/articles/pz/meta/)
 * are skipped with a notice. Missing _section.json / _category.json fall back to
 * a title-cased id, an empty description, icon "book" and displayOrder 999.
 * Sections and categories are sorted by displayOrder, then id.
 *
 * Usage:
 *   npx tsx scripts/build-nav.ts        # write files only, no network
 *   npx tsx scripts/build-nav.ts --db   # also upsert public.categories
 *
 * Run from the repository root.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// ---------------------------------------------------------------------------
// Types (the same shapes as packages/web/src/config/versions.generated.ts)
// ---------------------------------------------------------------------------

type VersionStatus = 'current' | 'legacy' | 'upcoming'

interface CategoryInfo {
  id: string
  name: string
  description: string
  icon: string
  articleCount: number
  displayOrder: number
}

interface SectionInfo {
  id: string
  name: string
  description: string
  icon: string
  displayOrder: number
  categories: CategoryInfo[]
}

interface VersionInfo {
  id: string
  name: string
  releaseDate: string
  status: VersionStatus
  description: string
  sections: SectionInfo[]
}

interface VersionsConfig {
  game: string
  defaultVersion: string
  versions: Array<Omit<VersionInfo, 'sections'>>
}

interface MetaFile {
  name: string
  description: string
  icon: string
  displayOrder: number
}

interface SearchEntry {
  id: string
  title: string
  slug: string
  url: string
  version: string
  section: string
  category: string
  tags: string[]
  excerpt: string
  difficulty: string
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = process.cwd()
const CONFIG_PATH = path.join(ROOT, 'content', 'versions.config.json')
const DATA_DIR = path.join(ROOT, 'packages', 'web', 'public', 'data')
const GENERATED_TS = path.join(ROOT, 'packages', 'web', 'src', 'config', 'versions.generated.ts')

const WITH_DB = process.argv.includes('--db')

// Same exclusions as scripts/sync-articles.ts, so counts match what gets synced.
const IGNORED_MD = new Set(['README.md', 'index.md'])
const STATUSES: VersionStatus[] = ['current', 'legacy', 'upcoming']

let warnings = 0
function warn(message: string): void {
  warnings++
  console.warn(`[WARN] ${message}`)
}

function fail(message: string): never {
  console.error(`[ERROR] ${message}`)
  process.exit(1)
}

function rel(p: string): string {
  return path.relative(ROOT, p).split(path.sep).join('/')
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

function readJson<T>(file: string): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
  } catch (error) {
    fail(`Could not read ${rel(file)}: ${(error as Error).message}`)
  }
}

function loadConfig(): VersionsConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    fail(`${rel(CONFIG_PATH)} not found. Run this script from the repository root.`)
  }
  const config = readJson<VersionsConfig>(CONFIG_PATH)

  if (!config.game || typeof config.game !== 'string') fail('versions.config.json: "game" is missing')
  if (!Array.isArray(config.versions) || config.versions.length === 0) {
    fail('versions.config.json: "versions" must be a non-empty array')
  }
  const ids = new Set<string>()
  for (const v of config.versions) {
    for (const key of ['id', 'name', 'releaseDate', 'status', 'description'] as const) {
      if (typeof v[key] !== 'string') fail(`versions.config.json: version ${v.id ?? '?'} has no string "${key}"`)
    }
    if (!STATUSES.includes(v.status)) fail(`versions.config.json: version ${v.id} has unknown status "${v.status}"`)
    if (ids.has(v.id)) fail(`versions.config.json: version ${v.id} is listed twice`)
    ids.add(v.id)
  }
  if (!ids.has(config.defaultVersion)) {
    fail(`versions.config.json: defaultVersion "${config.defaultVersion}" is not in the versions list`)
  }
  return config
}

function titleCase(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Read _section.json / _category.json, applying the contract C2 defaults. */
function readMeta(file: string, id: string): MetaFile {
  const defaults: MetaFile = { name: titleCase(id), description: '', icon: 'book', displayOrder: 999 }
  if (!fs.existsSync(file)) return defaults

  const raw = readJson<Partial<MetaFile>>(file)
  const meta: MetaFile = {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : defaults.name,
    description: typeof raw.description === 'string' ? raw.description : defaults.description,
    icon: typeof raw.icon === 'string' && raw.icon.trim() ? raw.icon : defaults.icon,
    displayOrder: typeof raw.displayOrder === 'number' && Number.isFinite(raw.displayOrder)
      ? raw.displayOrder
      : defaults.displayOrder,
  }
  // Icons are short words (plug, map, book, wrench, car, gear); never emoji.
  if (/[^\x20-\x7E]/.test(meta.icon)) {
    warn(`${rel(file)}: icon "${meta.icon}" is not a plain word; using "book"`)
    meta.icon = 'book'
  }
  return meta
}

function subdirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map(d => d.name)
}

function markdownFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.md') && !IGNORED_MD.has(d.name))
    .map(d => path.join(dir, d.name))
    .sort()
}

/** Same derivation as scripts/sync-articles.ts, so search and the DB agree. */
function deriveExcerpt(content: string): string {
  const firstParagraph = content
    .split('\n\n')
    .find(p => p.trim() && !p.startsWith('#') && !p.startsWith('```'))
  return firstParagraph ? firstParagraph.substring(0, 200).trim() + '...' : 'No description available.'
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function toSearchEntry(
  file: string,
  game: string,
  version: string,
  section: string,
  category: string,
): SearchEntry | null {
  let data: Record<string, unknown>
  let content: string
  try {
    const parsed = matter(fs.readFileSync(file, 'utf-8'))
    data = parsed.data
    content = parsed.content
  } catch (error) {
    warn(`${rel(file)}: frontmatter could not be parsed (${(error as Error).message}); left out of the search index`)
    return null
  }

  // The folder decides where an article appears in navigation; frontmatter is
  // what the sync writes to the database and so what the router resolves. Flag
  // any disagreement so the two never drift silently.
  for (const [key, expected] of [['game', game], ['version', version], ['section', section], ['category', category]] as const) {
    const actual = asString(data[key])
    if (actual !== undefined && actual !== expected) {
      warn(`${rel(file)}: frontmatter ${key} "${actual}" does not match its folder "${expected}"`)
    }
  }

  const slug = asString(data.slug) ?? path.basename(file, '.md')
  const title = asString(data.title) ?? titleCase(slug)
  const tags = Array.isArray(data.tags) ? data.tags.filter((t): t is string => typeof t === 'string') : []

  return {
    id: asString(data.id) ?? `${version}-${slug}`,
    title,
    slug,
    url: `/${game}/${version}/${section}/${category}/${slug}`,
    version,
    section,
    category,
    tags,
    excerpt: (asString(data.excerpt) ?? deriveExcerpt(content)).trim(),
    difficulty: asString(data.difficulty) ?? 'beginner',
  }
}

function byOrderThenId<T extends { displayOrder: number; id: string }>(a: T, b: T): number {
  return a.displayOrder - b.displayOrder || a.id.localeCompare(b.id)
}

// ---------------------------------------------------------------------------
// Building
// ---------------------------------------------------------------------------

interface BuildResult {
  versions: VersionInfo[]
  search: SearchEntry[]
}

function build(config: VersionsConfig): BuildResult {
  const gameDir = path.join(ROOT, 'content', 'articles', config.game)
  const listed = new Set(config.versions.map(v => v.id))

  for (const folder of subdirs(gameDir)) {
    if (!listed.has(folder)) {
      console.log(`[SKIP] content/articles/${config.game}/${folder}/ is not a version in versions.config.json`)
    }
  }

  const search: SearchEntry[] = []
  const versions: VersionInfo[] = config.versions.map(v => {
    const versionDir = path.join(gameDir, v.id)
    const sections: SectionInfo[] = subdirs(versionDir).map(sectionId => {
      const sectionDir = path.join(versionDir, sectionId)
      const sectionMeta = readMeta(path.join(sectionDir, '_section.json'), sectionId)

      for (const stray of markdownFiles(sectionDir)) {
        warn(`${rel(stray)} sits directly in a section folder, not in a category; it is not counted`)
      }

      const categories: CategoryInfo[] = subdirs(sectionDir).map(categoryId => {
        const categoryDir = path.join(sectionDir, categoryId)
        const categoryMeta = readMeta(path.join(categoryDir, '_category.json'), categoryId)
        const files = markdownFiles(categoryDir)

        for (const nested of subdirs(categoryDir)) {
          warn(`${rel(path.join(categoryDir, nested))}/ is nested below a category; its articles are not counted`)
        }

        for (const file of files) {
          const entry = toSearchEntry(file, config.game, v.id, sectionId, categoryId)
          if (entry) search.push(entry)
        }

        return { id: categoryId, ...categoryMeta, articleCount: files.length }
      })
      categories.sort(byOrderThenId)

      return {
        id: sectionId,
        name: sectionMeta.name,
        description: sectionMeta.description,
        icon: sectionMeta.icon,
        displayOrder: sectionMeta.displayOrder,
        categories,
      }
    })
    sections.sort(byOrderThenId)

    return {
      id: v.id,
      name: v.name,
      releaseDate: v.releaseDate,
      status: v.status,
      description: v.description,
      sections,
    }
  })

  search.sort((a, b) => a.url.localeCompare(b.url))

  const seen = new Map<string, string>()
  for (const entry of search) {
    const prior = seen.get(entry.id)
    if (prior) warn(`id "${entry.id}" is used by both ${prior} and ${entry.url}; scripts/sync-articles.ts will refuse to run`)
    else seen.set(entry.id, entry.url)
  }

  return { versions, search }
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

let written = 0
let unchanged = 0

/** Write only when the content differs, so re-runs do not touch mtimes. */
function writeIfChanged(file: string, content: string): void {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf-8') === content) {
    unchanged++
    return
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content, 'utf-8')
  written++
  console.log(`   [OK] wrote ${rel(file)}`)
}

function json(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n'
}

function sectionArticleCount(section: SectionInfo): number {
  return section.categories.reduce((sum, c) => sum + c.articleCount, 0)
}

function writeData(config: VersionsConfig, result: BuildResult): void {
  writeIfChanged(
    path.join(DATA_DIR, 'versions.json'),
    json({ defaultVersion: config.defaultVersion, versions: result.versions }),
  )

  for (const version of result.versions) {
    for (const section of version.sections) {
      const dir = path.join(DATA_DIR, version.id, section.id)
      writeIfChanged(
        path.join(dir, 'categories.json'),
        json({
          categories: section.categories.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            icon: c.icon,
            articleCount: c.articleCount,
            displayOrder: c.displayOrder,
          })),
        }),
      )
      writeIfChanged(
        path.join(dir, 'section-info.json'),
        json({
          id: section.id,
          name: section.name,
          description: section.description,
          icon: section.icon,
          articleCount: sectionArticleCount(section),
        }),
      )
    }
  }

  writeIfChanged(path.join(DATA_DIR, 'search-index.json'), json(result.search))
}

/** TypeScript literal for a JSON-compatible value: single quotes, 2-space indent, trailing commas. */
function tsLiteral(value: unknown, indent = ''): string {
  const next = indent + '  '
  if (value === null) return 'null'
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n')}'`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return `[\n${value.map(v => `${next}${tsLiteral(v, next)},`).join('\n')}\n${indent}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : tsLiteral(k))
    return `{\n${entries.map(([k, v]) => `${next}${key(k)}: ${tsLiteral(v, next)},`).join('\n')}\n${indent}}`
  }
  throw new Error(`Cannot serialize ${typeof value}`)
}

function generatedModule(config: VersionsConfig, versions: VersionInfo[]): string {
  return `// GENERATED by scripts/build-nav.ts from content/versions.config.json and the
// content/articles tree. Do not edit by hand; edit the config or the content and
// re-run \`npx tsx scripts/build-nav.ts\`.

export type VersionStatus = 'current' | 'legacy' | 'upcoming'

export interface CategoryInfo {
  id: string
  name: string
  description: string
  icon: string
  articleCount: number
  displayOrder: number
}

export interface SectionInfo {
  id: string
  name: string
  description: string
  icon: string
  displayOrder: number
  categories: CategoryInfo[]
}

export interface VersionInfo {
  id: string
  name: string
  releaseDate: string
  status: VersionStatus
  description: string
  sections: SectionInfo[]
}

export const GAME = ${tsLiteral(config.game)}

export const DEFAULT_VERSION = ${tsLiteral(config.defaultVersion)}

export const VERSIONS: VersionInfo[] = ${tsLiteral(versions)}

export function getVersion(id: string | undefined): VersionInfo | undefined {
  return VERSIONS.find((v) => v.id === id)
}

export function getSection(versionId: string | undefined, sectionId: string | undefined): SectionInfo | undefined {
  return getVersion(versionId)?.sections.find((s) => s.id === sectionId)
}
`
}

// ---------------------------------------------------------------------------
// Database (--db only)
// ---------------------------------------------------------------------------

async function upsertCategories(config: VersionsConfig, versions: VersionInfo[]): Promise<void> {
  // Same resolution as scripts/sync-articles.ts. Loaded only here so a plain run
  // never reads the environment file or opens a connection.
  await import('dotenv/config')
  const { createClient } = await import('@supabase/supabase-js')

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    fail('--db needs SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY)')
  }

  // article_count is included (beyond the columns contract C3 names) because the
  // count trigger only fires on article writes: a category row created after its
  // articles were synced would otherwise read 0 until the next article change.
  const rows = versions.flatMap(v =>
    v.sections.flatMap(s =>
      s.categories.map(c => ({
        id: c.id,
        game: config.game,
        version: v.id,
        section: s.id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        display_order: c.displayOrder,
        article_count: c.articleCount,
      })),
    ),
  )

  if (rows.length === 0) {
    console.log('[OK] --db: no categories to upsert')
    return
  }

  const supabase = createClient(url, key)
  const { error } = await supabase.from('categories').upsert(rows, { onConflict: 'game,version,section,id' })
  if (error) {
    fail(`--db: categories upsert failed: ${error.message} (has migration 017 been applied?)`)
  }
  console.log(`[OK] --db: upserted ${rows.length} categories`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Navigation generator\n')

  const config = loadConfig()
  const result = build(config)

  writeData(config, result)
  writeIfChanged(GENERATED_TS, generatedModule(config, result.versions))

  console.log('\nSummary:')
  for (const v of result.versions) {
    const articles = v.sections.reduce((sum, s) => sum + sectionArticleCount(s), 0)
    const marker = v.id === config.defaultVersion ? ' (default)' : ''
    console.log(`   ${v.id}${marker}: ${v.sections.length} sections, ${articles} articles`)
    for (const s of v.sections) {
      console.log(`      ${s.id}: ${s.categories.length} categories, ${sectionArticleCount(s)} articles`)
    }
  }
  console.log(`   search index: ${result.search.length} entries`)
  console.log(`   files: ${written} written, ${unchanged} unchanged`)
  if (warnings > 0) console.log(`   [WARN] ${warnings} warnings (see above)`)

  if (WITH_DB) {
    await upsertCategories(config, result.versions)
  }
}

main().catch(error => {
  console.error('[ERROR]', error)
  process.exit(1)
})
