#!/usr/bin/env tsx
/**
 * Markdown to Supabase Sync Script
 *
 * Syncs markdown articles from content/articles/ to Supabase database.
 * Reads YAML frontmatter and article content, then upserts to the articles table.
 *
 * Articles are keyed by (game, version, slug): Build 41 and Build 42 share many
 * slugs, so a slug alone no longer identifies an article (migration 017). When
 * frontmatter has no `id`, the id is derived as `${version}-${slug}`; an explicit
 * id is always kept, because bookmarks and reading_progress reference it.
 *
 * Before anything is written, every article under content/articles/ is loaded and
 * checked for collisions. Two files resolving to the same (game, version, slug) or
 * the same id make the script exit 1 without upserting anything.
 *
 * content/drafts/ is outside the glob and never synced. _section.json and
 * _category.json files are navigation metadata for scripts/build-nav.ts; the glob
 * only matches *.md, so they are never read here.
 *
 * Usage:
 *   npm run sync              # Sync all articles
 *   npm run sync -- --dry-run # Preview changes without syncing (no credentials needed)
 *   npm run sync -- --file content/articles/pz/build-41/modding/items/my-article.md
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import matter from 'gray-matter'
import { glob } from 'glob'

interface ArticleFrontmatter {
  id: string
  slug: string
  title: string
  excerpt: string
  game: string
  version: string
  section: string
  category: string
  subcategory?: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  related_articles?: string[]
  table_of_contents?: Array<{ text: string; link: string }>
  next_steps?: Array<{ title: string; path: string }>
  last_updated: string
}

interface ParsedArticle extends ArticleFrontmatter {
  content: string
  file_path: string
}

const DRY_RUN = process.argv.includes('--dry-run')
const SPECIFIC_FILE = process.argv.includes('--file')
  ? process.argv[process.argv.indexOf('--file') + 1]
  : null

const CONTENT_DIR = path.join(process.cwd(), 'content', 'articles')
const DRAFTS_DIR = path.join(process.cwd(), 'content', 'drafts')

const GLOB_IGNORE = [
  '**/node_modules/**',
  '**/README.md',
  '**/index.md',
  '**/_section.json',
  '**/_category.json',
]

// Only frontmatter fields the sync cannot derive. `id` is derived when missing.
const REQUIRED_FIELDS = ['slug', 'title', 'game', 'version', 'section', 'category'] as const

/**
 * The Supabase client is created only when something is actually written, so a
 * dry run needs no credentials.
 */
let client: SupabaseClient | null = null
function getClient(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[ERROR] Missing environment variables:')
    console.error('   SUPABASE_URL (or VITE_SUPABASE_URL)')
    console.error('   SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY)')
    console.error('\nSet them in the environment or in the project root env file.')
    process.exit(1)
  }

  client = createClient(url, key)
  return client
}

function relative(filePath: string): string {
  return path.relative(process.cwd(), filePath).split(path.sep).join('/')
}

/**
 * Parse a markdown file and extract frontmatter + content
 */
function parseMarkdownFile(filePath: string): ParsedArticle | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    const missing = REQUIRED_FIELDS.filter(field => !data[field])
    if (missing.length > 0) {
      console.warn(`[SKIP] ${relative(filePath)}: missing required fields: ${missing.join(', ')}`)
      return null
    }

    // Derive the id when frontmatter omits it. Explicit ids are kept as-is.
    if (!data.id) {
      data.id = `${data.version}-${data.slug}`
    }

    // Auto-generate excerpt if missing
    if (!data.excerpt) {
      const firstParagraph = content
        .split('\n\n')
        .find(p => p.trim() && !p.startsWith('#') && !p.startsWith('```'))
      data.excerpt = firstParagraph
        ? firstParagraph.substring(0, 200).trim() + '...'
        : 'No description available.'
    }

    return {
      ...(data as ArticleFrontmatter),
      content: content.trim(),
      file_path: filePath,
    }
  } catch (error) {
    console.error(`[ERROR] Could not parse ${relative(filePath)}:`, error)
    return null
  }
}

/**
 * Group articles by a key and return only the keys held by more than one file.
 */
function findDuplicates(
  articles: ParsedArticle[],
  keyOf: (a: ParsedArticle) => string,
): Map<string, ParsedArticle[]> {
  const byKey = new Map<string, ParsedArticle[]>()
  for (const article of articles) {
    const key = keyOf(article)
    const group = byKey.get(key)
    if (group) group.push(article)
    else byKey.set(key, [article])
  }
  return new Map([...byKey].filter(([, group]) => group.length > 1))
}

/**
 * Refuse to run when two files resolve to the same (game, version, slug) or id.
 * Returns true when the set is clean.
 */
function checkCollisions(articles: ParsedArticle[]): boolean {
  const slugDupes = findDuplicates(articles, a => `${a.game}/${a.version}/${a.slug}`)
  const idDupes = findDuplicates(articles, a => a.id)

  if (slugDupes.size === 0 && idDupes.size === 0) {
    console.log(`[OK] No collisions among ${articles.length} articles (game, version, slug) and id\n`)
    return true
  }

  console.error('[ERROR] Collisions found. Nothing was synced.\n')
  for (const [key, group] of slugDupes) {
    console.error(`   Same (game, version, slug) ${key}:`)
    for (const a of group) console.error(`      ${relative(a.file_path)}`)
  }
  for (const [key, group] of idDupes) {
    console.error(`   Same id ${key}:`)
    for (const a of group) console.error(`      ${relative(a.file_path)}`)
  }
  console.error('\nGive each file a distinct slug (within its version) and a distinct id.')
  return false
}

/**
 * Sync a single article to Supabase
 */
async function syncArticle(article: ParsedArticle): Promise<boolean> {
  try {
    const payload = {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      game: article.game,
      version: article.version,
      section: article.section,
      category: article.category,
      subcategory: article.subcategory || null,
      difficulty: article.difficulty || 'beginner',
      tags: article.tags || [],
      related_articles: article.related_articles || [],
      table_of_contents: article.table_of_contents || [],
      next_steps: article.next_steps || [],
      last_updated: article.last_updated || new Date().toISOString().split('T')[0],
    }

    const label = `${payload.version}/${payload.slug} (id ${payload.id})`

    if (DRY_RUN) {
      console.log(`   [DRY RUN] Would upsert: ${label}`)
      return true
    }

    const { error } = await getClient()
      .from('articles')
      .upsert(payload, { onConflict: 'game,version,slug' })

    if (error) {
      console.error(`   [ERROR] Failed: ${label}: ${error.message}`)
      return false
    }

    console.log(`   [OK] Synced: ${label}`)
    return true
  } catch (error) {
    console.error(`   [ERROR] Error syncing article:`, error)
    return false
  }
}

/**
 * Main sync function
 */
async function main() {
  console.log('Markdown -> Supabase Sync\n')

  if (DRY_RUN) {
    console.log('[DRY RUN] No changes will be made\n')
  }

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`[ERROR] Content directory not found: ${CONTENT_DIR}`)
    process.exit(1)
  }

  // Every article in the tree, always: the collision check covers the whole set
  // even when only one file is being synced.
  const treeFiles = await glob('**/*.md', {
    cwd: CONTENT_DIR,
    absolute: true,
    ignore: GLOB_IGNORE,
  })

  let filesToSync: string[] = treeFiles

  if (SPECIFIC_FILE) {
    const resolved = path.resolve(SPECIFIC_FILE)
    if (!fs.existsSync(resolved)) {
      console.error(`[ERROR] File not found: ${SPECIFIC_FILE}`)
      process.exit(1)
    }
    if (resolved.startsWith(DRAFTS_DIR + path.sep)) {
      console.error(`[ERROR] ${SPECIFIC_FILE} is a draft. Move it under content/articles/ to publish it.`)
      process.exit(1)
    }
    filesToSync = [resolved]
    console.log(`Syncing single file: ${SPECIFIC_FILE}\n`)
  } else {
    console.log(`Found ${treeFiles.length} markdown files\n`)
  }

  if (filesToSync.length === 0) {
    console.log('No articles to sync. Create articles in content/articles/')
    console.log('   Example: content/articles/pz/build-41/modding/items/my-article.md\n')
    process.exit(0)
  }

  // Parse the whole tree (plus the single file if it lives outside it).
  const allFiles = new Set(treeFiles.map(f => path.resolve(f)))
  for (const f of filesToSync) allFiles.add(path.resolve(f))

  const parsed = new Map<string, ParsedArticle | null>()
  for (const file of allFiles) {
    parsed.set(file, parseMarkdownFile(file))
  }

  const valid = [...parsed.values()].filter((a): a is ParsedArticle => a !== null)
  if (!checkCollisions(valid)) {
    process.exit(1)
  }

  let successCount = 0
  let failCount = 0
  let skipCount = 0

  for (const file of filesToSync) {
    const article = parsed.get(path.resolve(file)) ?? null

    if (!article) {
      skipCount++
      continue
    }

    const success = await syncArticle(article)

    if (success) {
      successCount++
    } else {
      failCount++
    }
  }

  console.log('\nSummary:')
  console.log(`   [OK] ${DRY_RUN ? 'Would sync' : 'Synced'}: ${successCount}`)
  console.log(`   ${failCount > 0 ? '[ERROR]' : '[OK]'} Failed: ${failCount}`)
  console.log(`   [SKIP] Skipped: ${skipCount}`)
  console.log(`   Total: ${filesToSync.length}`)

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Run without --dry-run to actually sync to Supabase')
  }

  process.exit(failCount > 0 ? 1 : 0)
}

main()
