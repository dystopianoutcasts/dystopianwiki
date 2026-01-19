#!/usr/bin/env tsx
/**
 * Markdown to Supabase Sync Script
 *
 * Syncs markdown articles from content/articles/ to Supabase database.
 * Reads YAML frontmatter and article content, then upserts to the articles table.
 *
 * Usage:
 *   npm run sync              # Sync all articles
 *   npm run sync -- --dry-run # Preview changes without syncing
 *   npm run sync -- --file content/articles/pz/build-41/modding/items/my-article.md
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import matter from 'gray-matter'
import { glob } from 'glob'

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   SUPABASE_URL (or VITE_SUPABASE_URL)')
  console.error('   SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY)')
  console.error('\nCreate a .env file in the project root with these values.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
  markdown_content: string
  file_path: string
}

const DRY_RUN = process.argv.includes('--dry-run')
const SPECIFIC_FILE = process.argv.includes('--file')
  ? process.argv[process.argv.indexOf('--file') + 1]
  : null

/**
 * Parse a markdown file and extract frontmatter + content
 */
function parseMarkdownFile(filePath: string): ParsedArticle | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    // Validate required fields
    const required = ['id', 'slug', 'title', 'game', 'version', 'section', 'category']
    const missing = required.filter(field => !data[field])

    if (missing.length > 0) {
      console.warn(`⚠️  Skipping ${filePath}: Missing required fields: ${missing.join(', ')}`)
      return null
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
      markdown_content: content.trim(),
      file_path: filePath,
    }
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}:`, error)
    return null
  }
}

/**
 * Sync a single article to Supabase
 */
async function syncArticle(article: ParsedArticle): Promise<boolean> {
  try {
    const { file_path, markdown_content, ...dbData } = article

    const payload = {
      id: dbData.id,
      slug: dbData.slug,
      title: dbData.title,
      excerpt: dbData.excerpt,
      content: dbData.content,
      markdown_content: markdown_content,
      game: dbData.game,
      version: dbData.version,
      section: dbData.section,
      category: dbData.category,
      subcategory: dbData.subcategory || null,
      difficulty: dbData.difficulty || 'beginner',
      tags: dbData.tags || [],
      related_articles: dbData.related_articles || [],
      table_of_contents: dbData.table_of_contents || [],
      next_steps: dbData.next_steps || [],
      last_updated: dbData.last_updated || new Date().toISOString().split('T')[0],
    }

    if (DRY_RUN) {
      console.log(`   [DRY RUN] Would upsert: ${payload.slug}`)
      return true
    }

    const { error } = await supabase
      .from('articles')
      .upsert(payload, { onConflict: 'slug' })

    if (error) {
      console.error(`   ❌ Failed: ${error.message}`)
      return false
    }

    console.log(`   ✅ Synced: ${payload.slug}`)
    return true
  } catch (error) {
    console.error(`   ❌ Error syncing article:`, error)
    return false
  }
}

/**
 * Main sync function
 */
async function main() {
  console.log('🚀 Markdown → Supabase Sync\n')

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n')
  }

  let filesToSync: string[] = []

  if (SPECIFIC_FILE) {
    if (!fs.existsSync(SPECIFIC_FILE)) {
      console.error(`❌ File not found: ${SPECIFIC_FILE}`)
      process.exit(1)
    }
    filesToSync = [SPECIFIC_FILE]
    console.log(`📄 Syncing single file: ${SPECIFIC_FILE}\n`)
  } else {
    // Find all markdown files in content/articles/
    const contentDir = path.join(process.cwd(), 'content', 'articles')

    if (!fs.existsSync(contentDir)) {
      console.error(`❌ Content directory not found: ${contentDir}`)
      process.exit(1)
    }

    filesToSync = await glob('**/*.md', {
      cwd: contentDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/README.md', '**/index.md'],
    })

    console.log(`📂 Found ${filesToSync.length} markdown files\n`)
  }

  if (filesToSync.length === 0) {
    console.log('ℹ️  No articles to sync. Create articles in content/articles/')
    console.log('   Example: content/articles/pz/build-41/modding/items/my-article.md\n')
    process.exit(0)
  }

  let successCount = 0
  let failCount = 0
  let skipCount = 0

  for (const file of filesToSync) {
    const article = parseMarkdownFile(file)

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

  console.log('\n📊 Summary:')
  console.log(`   ✅ Synced: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   ⏭️  Skipped: ${skipCount}`)
  console.log(`   📝 Total: ${filesToSync.length}`)

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to actually sync to Supabase')
  }

  process.exit(failCount > 0 ? 1 : 0)
}

main()
