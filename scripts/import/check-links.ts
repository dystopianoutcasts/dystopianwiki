#!/usr/bin/env tsx
/**
 * Build 42 internal link checker.
 *
 * Walks content/articles/pz/build-42/**\/*.md and content/drafts/**\/*.md, extracts every
 * internal link (a markdown link whose target starts with /pz/), and checks that the
 * target exists in the content tree. Also checks that no two article files under the same
 * version share a slug.
 *
 * Usage:
 *   npx tsx scripts/import/check-links.ts [--root <content dir>] [--version <id>]
 *
 * --root defaults to the repo's content/ folder; --version defaults to build-42 and
 * selects which articles tree is walked (drafts are always walked). Exit code 1 when any
 * dead link or duplicate slug is found, and when a published article links to a target that
 * exists only in drafts (dead on the site). Draft-to-draft links are listed separately as
 * "draft target" and do not fail the run.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { glob } from 'glob'

const REPO_ROOT = path.resolve(__dirname, '..', '..')

interface Options {
  root: string
  version: string
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { root: path.join(REPO_ROOT, 'content'), version: 'build-42' }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--root') {
      const v = argv[++i]
      if (!v) fail('--root needs a directory')
      opts.root = path.resolve(v)
    } else if (arg === '--version') {
      const v = argv[++i]
      if (!v) fail('--version needs a version id')
      opts.version = v
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: npx tsx scripts/import/check-links.ts [--root <content dir>] [--version <id>]')
      process.exit(0)
    } else {
      fail(`Unknown argument: ${arg}`)
    }
  }
  return opts
}

function fail(message: string): never {
  console.error(`[ERROR] ${message}`)
  process.exit(1)
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}

/** Line-by-line fenced code tracking; returns true for lines inside a fence. */
class FenceTracker {
  private open: { char: string; len: number } | null = null
  step(line: string): boolean {
    const m = /^(?:[ \t]*>)*[ \t]*(`{3,}|~{3,})(.*)$/.exec(line)
    if (this.open) {
      if (m && m[1][0] === this.open.char && m[1].length >= this.open.len && m[2].trim() === '') this.open = null
      return true
    }
    if (m) {
      if (m[1][0] === '`' && m[2].includes('`')) return false
      this.open = { char: m[1][0], len: m[1].length }
      return true
    }
    return false
  }
}

/** Blanks inline code spans (newlines kept) so links inside them are not extracted. */
function maskInlineCode(text: string): string {
  return text.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (whole) => whole.replace(/[^\n]/g, ' '))
}

interface Link {
  file: string
  line: number
  target: string
}

const INLINE_LINK_RE = /(!?)\[[^\[\]]*\]\(\s*<?(\/pz\/[^()\s>]*)>?(?:\s+(?:"[^"\n]*"|'[^'\n]*'|\([^)\n]*\)))?\s*\)/g
const REF_DEF_RE = /^ {0,3}\[[^\]]+\]:[ \t]*<?(\/pz\/[^\s>]*)>?/

function extractLinks(file: string, body: string, bodyStartLine: number): Link[] {
  const links: Link[] = []
  const lines = body.split(/\r?\n/)
  const fence = new FenceTracker()
  let segment: string[] = []
  let segmentStart = 0
  const flush = (): void => {
    if (segment.length === 0) return
    const text = maskInlineCode(segment.join('\n'))
    INLINE_LINK_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = INLINE_LINK_RE.exec(text)) !== null) {
      if (m[1] === '!') continue
      const line = segmentStart + (text.slice(0, m.index).match(/\n/g)?.length ?? 0)
      links.push({ file, line: bodyStartLine + line, target: m[2] })
    }
    text.split('\n').forEach((l, i) => {
      const d = REF_DEF_RE.exec(l)
      if (d) links.push({ file, line: bodyStartLine + segmentStart + i, target: d[1] })
    })
    segment = []
  }
  lines.forEach((line, i) => {
    if (fence.step(line)) {
      flush()
      return
    }
    if (segment.length === 0) segmentStart = i
    segment.push(line)
  })
  flush()
  return links
}

type Verdict = 'ok' | 'draft' | 'dead'

function checkTarget(root: string, target: string): Verdict {
  const clean = target.replace(/[#?].*$/, '').replace(/\/+$/, '')
  let decoded = clean
  try {
    decoded = decodeURIComponent(clean)
  } catch {
    return 'dead'
  }
  const segs = decoded.split('/').filter(Boolean) // ['pz', version, section, category, slug]
  if (segs.length < 2 || segs.length > 5 || segs.some((s) => s === '.' || s === '..')) return 'dead'
  const rest = segs.slice(1)
  if (segs.length < 5) {
    // Version, section and category pages: the folder must exist.
    const dir = path.join(root, 'articles', 'pz', ...rest)
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return 'ok'
    const draftDir = path.join(root, 'drafts', 'pz', ...rest)
    return fs.existsSync(draftDir) && fs.statSync(draftDir).isDirectory() ? 'draft' : 'dead'
  }
  const rel = [...rest.slice(0, 3), `${rest[3]}.md`]
  if (fs.existsSync(path.join(root, 'articles', 'pz', ...rel))) return 'ok'
  if (fs.existsSync(path.join(root, 'drafts', 'pz', ...rel))) return 'draft'
  return 'dead'
}

interface Parsed {
  file: string
  slug: string
  links: Link[]
}

function parseFile(root: string, abs: string, problems: string[]): Parsed | null {
  const rel = toPosix(path.relative(root, abs))
  const raw = fs.readFileSync(abs, 'utf-8')
  let data: Record<string, unknown>
  let content: string
  try {
    const parsed = matter(raw)
    data = parsed.data
    content = parsed.content
  } catch (err) {
    problems.push(`${rel}: frontmatter does not parse (${(err as Error).message})`)
    return null
  }
  // Line number of the first body line, so reported lines match the file.
  const bodyIndex = raw.indexOf(content)
  const bodyStartLine = bodyIndex > 0 ? raw.slice(0, bodyIndex).split(/\r?\n/).length : 1
  const slug = typeof data.slug === 'string' && data.slug ? data.slug : path.basename(abs, '.md')
  return { file: rel, slug, links: extractLinks(rel, content, bodyStartLine) }
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2))
  const root = opts.root
  if (!fs.existsSync(root)) fail(`Content root not found: ${root}`)

  const posixRoot = toPosix(root)
  const articleFiles = await glob(`${posixRoot}/articles/pz/${opts.version}/**/*.md`, { absolute: true })
  const draftFiles = await glob(`${posixRoot}/drafts/**/*.md`, { absolute: true })
  const problems: string[] = []

  const dead: string[] = []
  const draftTargets: string[] = []
  const publishedToDraft: string[] = []
  let linkCount = 0
  const walked = [...articleFiles.sort(), ...draftFiles.sort()]
  const parsedFiles: Parsed[] = []
  for (const abs of walked) {
    const p = parseFile(root, abs, problems)
    if (!p) continue
    parsedFiles.push(p)
    for (const link of p.links) {
      linkCount++
      const verdict = checkTarget(root, link.target)
      if (verdict === 'dead') dead.push(`${link.file}:${link.line} -> ${link.target}`)
      else if (verdict === 'draft') {
        const line = `${link.file}:${link.line} -> ${link.target}`
        if (link.file.startsWith('articles/')) publishedToDraft.push(line)
        else draftTargets.push(line)
      }
    }
  }

  // Duplicate slugs: every version under articles/pz, plus drafts against articles.
  const duplicates: string[] = []
  const draftClashes: string[] = []
  const versionDirs = fs.existsSync(path.join(root, 'articles', 'pz'))
    ? fs.readdirSync(path.join(root, 'articles', 'pz'), { withFileTypes: true }).filter((d) => d.isDirectory())
    : []
  const slugsByVersion = new Map<string, Map<string, string[]>>()
  for (const dir of versionDirs) {
    const files = await glob(`${posixRoot}/articles/pz/${dir.name}/**/*.md`, { absolute: true })
    const bySlug = new Map<string, string[]>()
    for (const abs of files.sort()) {
      const p = parsedFiles.find((x) => x.file === toPosix(path.relative(root, abs))) ?? parseFile(root, abs, problems)
      if (!p) continue
      const list = bySlug.get(p.slug) ?? []
      list.push(p.file)
      bySlug.set(p.slug, list)
    }
    slugsByVersion.set(dir.name, bySlug)
    for (const [slug, list] of bySlug) {
      if (list.length > 1) duplicates.push(`${dir.name}: slug "${slug}" is used by ${list.join(', ')}`)
    }
  }
  for (const abs of draftFiles) {
    const rel = toPosix(path.relative(root, abs))
    const p = parsedFiles.find((x) => x.file === rel)
    if (!p) continue
    const version = rel.split('/')[2] // drafts/pz/{version}/...
    const clash = slugsByVersion.get(version)?.get(p.slug)
    if (clash) draftClashes.push(`${rel}: slug "${p.slug}" is already used by ${clash.join(', ')}`)
  }

  console.log(
    `Checked ${articleFiles.length} article file(s) under articles/pz/${opts.version} and ` +
      `${draftFiles.length} draft file(s); ${linkCount} internal link(s).`,
  )
  if (draftTargets.length > 0) {
    console.log(`\nDraft target (${draftTargets.length}): the link resolves only to a file in drafts/`)
    for (const d of draftTargets) console.log(`  ${d}`)
  }
  if (draftClashes.length > 0) {
    console.log(`\n[WARN] Draft slug clashes (${draftClashes.length}): publishing these drafts would collide`)
    for (const d of draftClashes) console.log(`  ${d}`)
  }
  for (const p of problems) console.error(`[ERROR] ${p}`)
  if (dead.length > 0) {
    console.error(`\n[ERROR] Dead links (${dead.length}):`)
    for (const d of dead) console.error(`  ${d}`)
  }
  if (publishedToDraft.length > 0) {
    console.error(`\n[ERROR] Published articles linking to drafts (${publishedToDraft.length}): dead on the site until the draft is published`)
    for (const d of publishedToDraft) console.error(`  ${d}`)
  }
  if (duplicates.length > 0) {
    console.error(`\n[ERROR] Duplicate slugs (${duplicates.length}):`)
    for (const d of duplicates) console.error(`  ${d}`)
  }
  if (dead.length > 0 || publishedToDraft.length > 0 || duplicates.length > 0 || problems.length > 0) process.exit(1)
  console.log('\n[COMPLETE] No dead links, no published links to drafts and no duplicate slugs.')
}

main().catch((err) => {
  console.error(`[ERROR] ${(err as Error).stack ?? err}`)
  process.exit(1)
})
