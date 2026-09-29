#!/usr/bin/env tsx
/**
 * Build 42 import tool.
 *
 * Reads import manifests (contract C4 in the Build 42 content plan), converts the
 * referenced local markdown sources into wiki articles with frontmatter, splits long
 * documents at H2 when asked, and rewrites links between the imported sources to site
 * paths. It only writes files; it never syncs to the database.
 *
 * Usage:
 *   npx tsx scripts/import/import-b42.ts [--manifest <file>]... [--out <dir>] [--dry-run] [--verbose]
 *
 * With no --manifest, every *.json in scripts/import/manifests/ is loaded, except files
 * whose name starts with an underscore. --out overrides the content root (default: the
 * repo's content/ folder). --dry-run prints the planned output paths and link rewrites
 * without writing anything.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, '..', '..')
const DEFAULT_MANIFEST_DIR = path.join(__dirname, 'manifests')
const DEFAULT_CONTENT_ROOT = path.join(REPO_ROOT, 'content')

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SPLITS = ['none', 'h2'] as const
const TARGETS = ['articles', 'drafts'] as const
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const

type Split = (typeof SPLITS)[number]
type Target = (typeof TARGETS)[number]
type Difficulty = (typeof DIFFICULTIES)[number]

const TOP_LEVEL_KEYS = new Set(['sources_root', 'defaults', 'entries', 'link_overrides', 'description'])
const DEFAULT_KEYS = new Set([
  'game', 'version', 'difficulty', 'target', 'provenance', 'section', 'category', 'tags',
])
const ENTRY_KEYS = new Set([
  'source', 'section', 'category', 'slug', 'title', 'split', 'tags', 'difficulty',
  'strip_header_until', 'skip_headings', 'only_headings', 'parts', 'target', 'game',
  'version', 'provenance',
])
const PROVENANCE_KEYS = new Set(['compiled', 'game_version'])
const PART_KEYS = new Set(['slug', 'title'])

/** Keys starting with these characters are treated as comments and ignored. */
function isCommentKey(key: string): boolean {
  return key.startsWith('_') || key.startsWith('$')
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Provenance {
  compiled: string
  game_version: string
}

interface PartOverride {
  slug?: string
  title?: string
}

interface Entry {
  manifestFile: string
  label: string // "manifest.json entry 3 (source.md)" for messages
  source: string // as written in the manifest
  sourceAbs: string
  sourceKey: string
  game: string
  version: string
  section: string
  category: string
  slug: string
  title: string
  split: Split
  tags: string[]
  difficulty: Difficulty
  target: Target
  provenance: Provenance
  stripHeaderUntil: RegExp | null
  skipHeadings: string[] | null
  onlyHeadings: string[] | null
  parts: Map<string, PartOverride> // key: normalized heading
  partKeysRaw: string[]
  articles: Article[]
}

/** A run of source lines that ends up in an article body, with its source line number. */
interface Chunk {
  text: string
  startLine: number // 1-based line number in the source file
}

interface Section {
  heading: string // raw heading text (after "## ", closing hashes removed)
  norm: string // normalized for matching
  headingLine: string // the original "## ..." line
  headingLineNo: number
  bodyLines: string[]
  bodyStartLine: number
}

type ArticleKind = 'single' | 'index' | 'part'

interface Article {
  entry: Entry
  kind: ArticleKind
  slug: string
  title: string // plain text, for frontmatter
  h1: string // text for the H1 line
  chunks: Chunk[]
  partHeading?: Section // for parts
  /** Anchors that point at this article as a whole (the part's own H2). */
  ownAnchors: Set<string>
  /** Anchors of headings inside this article's body. */
  innerAnchors: Set<string>
  outRel: string // path relative to the content root
  sitePath: string
}

interface Rewrite {
  line: number
  from: string
  to: string
  kind: 'rewritten' | 'downgraded' | 'kept'
}

interface RenderedArticle {
  article: Article
  body: string
  frontmatter: Record<string, unknown>
  rewrites: Rewrite[]
}

// ---------------------------------------------------------------------------
// Small text helpers (exported for the fixture runner and link checker)
// ---------------------------------------------------------------------------

/** Removes a leading "N." or "N)" (also "N.N.") numbering from a heading. */
export function stripNumbering(text: string): string {
  return text.replace(/^\s*\d+(?:\.\d+)*[.)]\s+/, '').trim()
}

/**
 * Text a split part derives its default slug and title from: numbering stripped (also a bare
 * leading number followed by a space, as in "1 The inventory"), and any trailing bracketed
 * groups removed ("Events [CONFIRMED - pzwiki, revid 1]" -> "Events"). The article body keeps
 * the full heading.
 */
export function partHeadingText(text: string): string {
  let t = stripNumbering(text)
  t = t.replace(/^\d+\s+(?=\S)/, '')
  let prev = ''
  while (prev !== t) {
    prev = t
    t = t.replace(/\s*(?:\[[^\[\]]*\]|\([^()]*\))\s*$/, '').trim()
  }
  return t === '' ? stripNumbering(text) : t
}

/** Lowercase, non-alphanumerics to hyphens, collapsed, trimmed. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Removes inline markdown so a heading reads as plain text. */
export function inlineToPlain(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/`+/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/(^|[\s(])[*_]([^*_\s][^*_]*?)[*_](?=[\s).,;:!?]|$)/g, '$1$2')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Anchor id the site's renderer (rehype-slug, github-slugger rules) gives a heading. */
export function githubAnchor(headingText: string): string {
  return inlineToPlain(headingText)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
    .replace(/ /g, '-')
}

/** Every anchor form a link might use for a heading. */
function anchorForms(headingText: string): string[] {
  const forms = new Set<string>()
  forms.add(githubAnchor(headingText))
  forms.add(slugify(inlineToPlain(headingText)))
  forms.add(slugify(stripNumbering(inlineToPlain(headingText))))
  forms.delete('')
  return [...forms]
}

/** Normalization used to match manifest heading names against source H2s. */
export function normalizeHeading(text: string): string {
  return stripNumbering(inlineToPlain(text.trim())).toLowerCase().replace(/\s+/g, ' ').trim()
}

function normalizeAnchor(anchor: string): string {
  let a = anchor
  try {
    a = decodeURIComponent(anchor)
  } catch {
    // keep the raw anchor
  }
  return a.toLowerCase()
}

function todayLocal(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}

function pathKey(abs: string): string {
  // Windows paths compare case-insensitively.
  const posix = toPosix(path.resolve(abs))
  return process.platform === 'win32' ? posix.toLowerCase() : posix
}

// ---------------------------------------------------------------------------
// Fence tracking
// ---------------------------------------------------------------------------

/**
 * Tracks fenced code blocks line by line. `step(line)` returns true when the line is
 * part of a fence (the delimiters included), so callers can skip it.
 */
export class FenceTracker {
  private open: { char: string; len: number } | null = null

  get inFence(): boolean {
    return this.open !== null
  }

  step(line: string): boolean {
    // Allow indentation and blockquote markers in front of a fence.
    const m = /^(?:[ \t]*>)*[ \t]*(`{3,}|~{3,})(.*)$/.exec(line)
    if (this.open) {
      if (m && m[1][0] === this.open.char && m[1].length >= this.open.len && m[2].trim() === '') {
        this.open = null
      }
      return true
    }
    if (m) {
      const char = m[1][0]
      // A backtick fence's info string may not contain a backtick.
      if (char === '`' && m[2].includes('`')) return false
      this.open = { char, len: m[1].length }
      return true
    }
    return false
  }
}

const H2_RE = /^##[ \t]+(.*?)[ \t]*(?:#+[ \t]*)?$/
const ATX_RE = /^ {0,3}(#{1,6})[ \t]+(.*?)[ \t]*(?:#+[ \t]*)?$/
const HR_RE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

interface Options {
  manifests: string[]
  out: string
  dryRun: boolean
  verbose: boolean
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { manifests: [], out: DEFAULT_CONTENT_ROOT, dryRun: false, verbose: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--manifest') {
      const v = argv[++i]
      if (!v) fail('--manifest needs a file path')
      opts.manifests.push(path.resolve(v))
    } else if (arg === '--out') {
      const v = argv[++i]
      if (!v) fail('--out needs a directory')
      opts.out = path.resolve(v)
    } else if (arg === '--dry-run') {
      opts.dryRun = true
    } else if (arg === '--verbose') {
      opts.verbose = true
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: npx tsx scripts/import/import-b42.ts [--manifest <file>]... [--out <dir>] [--dry-run] [--verbose]',
      )
      process.exit(0)
    } else {
      fail(`Unknown argument: ${arg}`)
    }
  }
  if (opts.manifests.length === 0) {
    if (!fs.existsSync(DEFAULT_MANIFEST_DIR)) fail(`No manifest directory at ${DEFAULT_MANIFEST_DIR}`)
    opts.manifests = fs
      .readdirSync(DEFAULT_MANIFEST_DIR)
      .filter((f) => f.toLowerCase().endsWith('.json') && !f.startsWith('_'))
      .sort()
      .map((f) => path.join(DEFAULT_MANIFEST_DIR, f))
  }
  return opts
}

function fail(message: string): never {
  console.error(`[ERROR] ${message}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Manifest loading and validation
// ---------------------------------------------------------------------------

interface LoadedManifest {
  file: string
  entries: Entry[]
  overrides: Map<string, string> // pathKey -> site path
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function checkKeys(obj: Record<string, unknown>, allowed: Set<string>, where: string, errors: string[]): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key) && !isCommentKey(key)) errors.push(`${where}: unknown key "${key}"`)
  }
}

function stringList(v: unknown, where: string, errors: string[]): string[] | null {
  if (v === undefined) return null
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || x.trim() === '')) {
    errors.push(`${where}: must be an array of non-empty strings`)
    return null
  }
  return v as string[]
}

function loadManifest(file: string, errors: string[]): LoadedManifest | null {
  const name = path.basename(file)
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (err) {
    errors.push(`${name}: cannot read or parse JSON (${(err as Error).message})`)
    return null
  }
  if (!isPlainObject(raw)) {
    errors.push(`${name}: top level must be an object`)
    return null
  }
  checkKeys(raw, TOP_LEVEL_KEYS, name, errors)

  if (typeof raw.sources_root !== 'string' || raw.sources_root.trim() === '') {
    errors.push(`${name}: "sources_root" is required and must be a string`)
    return null
  }
  const sourcesRoot = path.resolve(path.dirname(file), raw.sources_root)
  if (!fs.existsSync(sourcesRoot) || !fs.statSync(sourcesRoot).isDirectory()) {
    errors.push(`${name}: sources_root does not exist or is not a directory: ${sourcesRoot}`)
  }

  const defaults = raw.defaults ?? {}
  if (!isPlainObject(defaults)) {
    errors.push(`${name}: "defaults" must be an object`)
    return null
  }
  checkKeys(defaults, DEFAULT_KEYS, `${name} defaults`, errors)

  if (!Array.isArray(raw.entries) || raw.entries.length === 0) {
    errors.push(`${name}: "entries" is required and must be a non-empty array`)
    return null
  }

  const overrides = new Map<string, string>()
  if (raw.link_overrides !== undefined) {
    if (!isPlainObject(raw.link_overrides)) {
      errors.push(`${name}: "link_overrides" must be an object of "file.md": "/pz/..." pairs`)
    } else {
      for (const [k, v] of Object.entries(raw.link_overrides)) {
        if (isCommentKey(k)) continue
        if (typeof v !== 'string' || !v.startsWith('/')) {
          errors.push(`${name} link_overrides["${k}"]: value must be a site path starting with "/"`)
          continue
        }
        overrides.set(pathKey(path.resolve(sourcesRoot, k)), v)
      }
    }
  }

  const entries: Entry[] = []
  raw.entries.forEach((rawEntry: unknown, i: number) => {
    const where = `${name} entry ${i + 1}`
    if (!isPlainObject(rawEntry)) {
      errors.push(`${where}: must be an object`)
      return
    }
    const entry = buildEntry(file, sourcesRoot, defaults, rawEntry, where, errors)
    if (entry) entries.push(entry)
  })

  return { file, entries, overrides }
}

function buildEntry(
  manifestFile: string,
  sourcesRoot: string,
  defaults: Record<string, unknown>,
  e: Record<string, unknown>,
  whereBase: string,
  errors: string[],
): Entry | null {
  const where = typeof e.source === 'string' ? `${whereBase} (${e.source})` : whereBase
  checkKeys(e, ENTRY_KEYS, where, errors)
  const before = errors.length

  const pick = (key: string): unknown => (e[key] !== undefined ? e[key] : defaults[key])
  const reqString = (key: string, v: unknown): string => {
    if (typeof v !== 'string' || v.trim() === '') {
      errors.push(`${where}: "${key}" is required and must be a non-empty string`)
      return ''
    }
    return v
  }
  const slugField = (key: string, v: unknown): string => {
    const s = reqString(key, v)
    if (s && !SLUG_RE.test(s)) errors.push(`${where}: "${key}" "${s}" does not match ${SLUG_RE}`)
    return s
  }
  const oneOf = <T extends string>(key: string, v: unknown, allowed: readonly T[]): T => {
    if (typeof v !== 'string' || !(allowed as readonly string[]).includes(v)) {
      errors.push(`${where}: "${key}" must be one of ${allowed.map((a) => `"${a}"`).join(', ')} (got ${JSON.stringify(v)})`)
      return allowed[0]
    }
    return v as T
  }

  const source = reqString('source', e.source)
  const game = slugField('game', pick('game'))
  const version = slugField('version', pick('version'))
  const section = slugField('section', pick('section'))
  const category = slugField('category', pick('category'))
  const slug = slugField('slug', e.slug)
  const title = reqString('title', e.title)
  const split = oneOf('split', e.split, SPLITS)
  const difficulty = oneOf('difficulty', pick('difficulty'), DIFFICULTIES)
  const target = oneOf('target', pick('target') ?? 'articles', TARGETS)

  const defaultTags = stringList(defaults.tags, `${where} defaults.tags`, errors) ?? []
  const entryTags = stringList(e.tags, `${where} tags`, errors) ?? []
  const tags = [...new Set([...defaultTags, ...entryTags])]

  const provDefaults = isPlainObject(defaults.provenance) ? defaults.provenance : {}
  if (defaults.provenance !== undefined && !isPlainObject(defaults.provenance)) {
    errors.push(`${where}: defaults.provenance must be an object`)
  }
  if (e.provenance !== undefined && !isPlainObject(e.provenance)) {
    errors.push(`${where}: provenance must be an object`)
  }
  const provEntry = isPlainObject(e.provenance) ? e.provenance : {}
  checkKeys(provDefaults, PROVENANCE_KEYS, `${where} defaults.provenance`, errors)
  checkKeys(provEntry, PROVENANCE_KEYS, `${where} provenance`, errors)
  const prov = { ...provDefaults, ...provEntry }
  const provenance: Provenance = {
    compiled: reqString('provenance.compiled', prov.compiled),
    game_version: reqString('provenance.game_version', prov.game_version),
  }

  let stripHeaderUntil: RegExp | null = null
  if (e.strip_header_until !== undefined) {
    if (typeof e.strip_header_until !== 'string' || e.strip_header_until === '') {
      errors.push(`${where}: "strip_header_until" must be a regex string`)
    } else {
      try {
        stripHeaderUntil = new RegExp(e.strip_header_until)
      } catch (err) {
        errors.push(`${where}: "strip_header_until" is not a valid regex (${(err as Error).message})`)
      }
    }
  }

  const skipHeadings = stringList(e.skip_headings, `${where} skip_headings`, errors)
  const onlyHeadings = stringList(e.only_headings, `${where} only_headings`, errors)
  if (e.skip_headings !== undefined && e.only_headings !== undefined) {
    errors.push(`${where}: "skip_headings" and "only_headings" cannot both be set on one entry`)
  }

  const parts = new Map<string, PartOverride>()
  const partKeysRaw: string[] = []
  if (e.parts !== undefined) {
    if (!isPlainObject(e.parts)) {
      errors.push(`${where}: "parts" must be an object keyed by H2 heading`)
    } else {
      if (split !== 'h2') errors.push(`${where}: "parts" is only meaningful with split "h2"`)
      for (const [heading, override] of Object.entries(e.parts)) {
        if (!isPlainObject(override)) {
          errors.push(`${where} parts["${heading}"]: must be an object with "slug" and/or "title"`)
          continue
        }
        checkKeys(override, PART_KEYS, `${where} parts["${heading}"]`, errors)
        const po: PartOverride = {}
        if (override.slug !== undefined) {
          if (typeof override.slug !== 'string' || !SLUG_RE.test(override.slug)) {
            errors.push(`${where} parts["${heading}"].slug "${String(override.slug)}" does not match ${SLUG_RE}`)
          } else po.slug = override.slug
        }
        if (override.title !== undefined) {
          if (typeof override.title !== 'string' || override.title.trim() === '') {
            errors.push(`${where} parts["${heading}"].title must be a non-empty string`)
          } else po.title = override.title
        }
        parts.set(normalizeHeading(heading), po)
        partKeysRaw.push(heading)
      }
    }
  }

  const sourceAbs = path.resolve(sourcesRoot, source)
  if (source && (!fs.existsSync(sourceAbs) || !fs.statSync(sourceAbs).isFile())) {
    errors.push(`${where}: source file not found: ${sourceAbs}`)
  }

  if (errors.length > before) return null
  return {
    manifestFile,
    label: where,
    source,
    sourceAbs,
    sourceKey: pathKey(sourceAbs),
    game,
    version,
    section,
    category,
    slug,
    title,
    split,
    tags,
    difficulty,
    target,
    provenance,
    stripHeaderUntil,
    skipHeadings,
    onlyHeadings,
    parts,
    partKeysRaw,
    articles: [],
  }
}

// ---------------------------------------------------------------------------
// Source parsing
// ---------------------------------------------------------------------------

interface ParsedSource {
  introLines: string[]
  introStartLine: number
  sections: Section[]
  /** Lines kept after header stripping, for split "none" without filters. */
  allLines: string[]
  allStartLine: number
}

function parseSource(entry: Entry, errors: string[], warnings: string[]): ParsedSource | null {
  const text = fs.readFileSync(entry.sourceAbs, 'utf-8').replace(/^﻿/, '')
  const lines = text.split(/\r?\n/)
  // A trailing newline produces one empty last element; drop it so joins stay exact.
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()

  let start = 0
  if (entry.stripHeaderUntil) {
    const idx = lines.findIndex((l) => entry.stripHeaderUntil!.test(l))
    if (idx === -1) {
      errors.push(`${entry.label}: strip_header_until ${entry.stripHeaderUntil} matched no line`)
      return null
    }
    start = idx + 1
  } else {
    let first = 0
    while (first < lines.length && lines[first].trim() === '') first++
    const m = first < lines.length ? /^#[ \t]+(.*?)[ \t]*#*[ \t]*$/.exec(lines[first]) : null
    if (m && normalizeHeading(m[1]) === normalizeHeading(entry.title)) {
      start = first + 1
    } else if (m && !entry.onlyHeadings) {
      // An only_headings entry never emits the text before the first H2, so its H1 is moot.
      warnings.push(
        `${entry.label}: the source keeps its own H1 "${m[1]}" (it differs from the title); ` +
          'set strip_header_until to drop it',
      )
    }
  }
  while (start < lines.length && lines[start].trim() === '') start++

  const kept = lines.slice(start)
  const fence = new FenceTracker()
  const sections: Section[] = []
  const introLines: string[] = []
  let current: Section | null = null
  kept.forEach((line, i) => {
    const lineNo = start + i + 1
    const inFence = fence.step(line)
    const h2 = !inFence ? H2_RE.exec(line) : null
    if (h2) {
      current = {
        heading: h2[1],
        norm: normalizeHeading(h2[1]),
        headingLine: line,
        headingLineNo: lineNo,
        bodyLines: [],
        bodyStartLine: lineNo + 1,
      }
      sections.push(current)
    } else if (current) {
      current.bodyLines.push(line)
    } else {
      introLines.push(line)
    }
  })
  if (fence.inFence) warnings.push(`${entry.label}: the source ends inside an unclosed code fence`)

  return { introLines, introStartLine: start + 1, sections, allLines: kept, allStartLine: start + 1 }
}

/** Trims leading and trailing blank lines, and trailing horizontal rules, from a block. */
function trimBlock(lines: string[], startLine: number): Chunk {
  let a = 0
  let b = lines.length
  while (a < b && lines[a].trim() === '') a++
  for (;;) {
    while (b > a && lines[b - 1].trim() === '') b--
    if (b > a && HR_RE.test(lines[b - 1])) {
      b--
      continue
    }
    break
  }
  return { text: lines.slice(a, b).join('\n'), startLine: startLine + a }
}

function headingAnchorsIn(lines: string[]): Set<string> {
  const set = new Set<string>()
  const fence = new FenceTracker()
  for (const line of lines) {
    if (fence.step(line)) continue
    const m = ATX_RE.exec(line)
    if (m) for (const f of anchorForms(m[2])) set.add(f)
  }
  return set
}

function sitePathFor(entry: Entry, slug: string): string {
  return `/${entry.game}/${entry.version}/${entry.section}/${entry.category}/${slug}`
}

function outRelFor(entry: Entry, slug: string): string {
  return `${entry.target}/${entry.game}/${entry.version}/${entry.section}/${entry.category}/${slug}.md`
}

function makeArticle(entry: Entry, kind: ArticleKind, slug: string, title: string, h1: string, chunks: Chunk[]): Article {
  const lines = chunks.flatMap((c) => c.text.split('\n'))
  return {
    entry,
    kind,
    slug,
    title,
    h1,
    chunks,
    ownAnchors: new Set(),
    innerAnchors: headingAnchorsIn(lines),
    outRel: outRelFor(entry, slug),
    sitePath: sitePathFor(entry, slug),
  }
}

function planEntry(entry: Entry, errors: string[], warnings: string[]): void {
  const parsed = parseSource(entry, errors, warnings)
  if (!parsed) return

  const available = new Set(parsed.sections.map((s) => s.norm))
  const checkNames = (names: string[] | null, field: string): Set<string> | null => {
    if (!names) return null
    const set = new Set<string>()
    for (const n of names) {
      const norm = normalizeHeading(n)
      if (!available.has(norm)) errors.push(`${entry.label}: ${field} "${n}" matches no H2 in the source`)
      set.add(norm)
    }
    return set
  }
  const skip = checkNames(entry.skipHeadings, 'skip_headings')
  const only = checkNames(entry.onlyHeadings, 'only_headings')
  for (const raw of entry.partKeysRaw) {
    if (!available.has(normalizeHeading(raw))) errors.push(`${entry.label}: parts key "${raw}" matches no H2 in the source`)
  }
  const dupNorms = parsed.sections.map((s) => s.norm).filter((n, i, all) => all.indexOf(n) !== i)
  if (dupNorms.length > 0 && entry.split === 'h2') {
    warnings.push(`${entry.label}: repeated H2 headings (${[...new Set(dupNorms)].join(', ')}); give them distinct slugs via "parts"`)
  }

  const keptSections = parsed.sections.filter((s) => {
    if (only) return only.has(s.norm)
    if (skip) return !skip.has(s.norm)
    return true
  })

  if (entry.split === 'none') {
    let chunks: Chunk[]
    if (!only && !skip) {
      chunks = [trimBlock(parsed.allLines, parsed.allStartLine)]
    } else if (only && keptSections.length === 1) {
      // One extracted section: its H2 is replaced by the article's H1, like a part.
      const s = keptSections[0]
      const body = trimBlock(s.bodyLines, s.bodyStartLine)
      const art = makeArticle(entry, 'single', entry.slug, entry.title, entry.title, body.text ? [body] : [])
      for (const f of anchorForms(s.heading)) art.ownAnchors.add(f)
      entry.articles.push(art)
      return
    } else {
      chunks = []
      if (!only) chunks.push(trimBlock(parsed.introLines, parsed.introStartLine))
      for (const s of keptSections) {
        chunks.push(trimBlock([s.headingLine, ...s.bodyLines], s.headingLineNo))
      }
      chunks = chunks.filter((c) => c.text !== '')
    }
    entry.articles.push(makeArticle(entry, 'single', entry.slug, entry.title, entry.title, chunks))
    return
  }

  // split h2: an index plus one article per kept H2.
  const introChunk = only ? { text: '', startLine: parsed.introStartLine } : trimBlock(parsed.introLines, parsed.introStartLine)
  const index = makeArticle(entry, 'index', entry.slug, entry.title, entry.title, introChunk.text ? [introChunk] : [])
  entry.articles.push(index)
  if (keptSections.length === 0) {
    errors.push(`${entry.label}: split "h2" but no H2 sections remain to emit`)
  }
  for (const s of keptSections) {
    const override = entry.parts.get(s.norm) ?? {}
    const headingText = stripNumbering(s.heading).replace(/^\d+\s+(?=\S)/, '')
    const derived = partHeadingText(s.heading)
    const slug = override.slug ?? slugify(inlineToPlain(derived))
    if (!slug) {
      errors.push(`${entry.label}: heading "${s.heading}" slugifies to nothing; set a slug in "parts"`)
      continue
    }
    const h1 = override.title ?? headingText
    const title = override.title ?? inlineToPlain(derived)
    const body = trimBlock(s.bodyLines, s.bodyStartLine)
    const part = makeArticle(entry, 'part', slug, title, h1, body.text ? [body] : [])
    part.partHeading = s
    for (const f of anchorForms(s.heading)) part.ownAnchors.add(f)
    entry.articles.push(part)
  }
}

// ---------------------------------------------------------------------------
// Link resolution
// ---------------------------------------------------------------------------

interface LinkContext {
  bySource: Map<string, Entry[]>
  overrides: Map<string, string>
}

interface Resolved {
  article: Article | null // null when the target came from link_overrides
  href: string
}

/** Picks the article (and whether to keep the anchor) that a link into `entries` should use. */
function resolveInto(entries: Entry[], anchor: string | null): Resolved {
  if (anchor) {
    const a = normalizeAnchor(anchor)
    // 1. An article whose own H2 (now its H1) is the anchor: a part, or a one-section extract.
    for (const entry of entries) {
      for (const art of entry.articles) {
        if (art.ownAnchors.has(a)) return { article: art, href: art.sitePath }
      }
    }
    // 2. Any article that contains a heading with that anchor.
    for (const entry of entries) {
      for (const art of entry.articles) {
        if (art.innerAnchors.has(a)) return { article: art, href: `${art.sitePath}#${anchor}` }
      }
    }
  }
  const primary = entries.find((e) => !e.onlyHeadings) ?? entries[0]
  const main = primary.articles.find((a) => a.kind !== 'part') ?? primary.articles[0]
  if (!anchor) return { article: main, href: main.sitePath }
  if (primary.split === 'h2') return { article: main, href: main.sitePath } // anchor not found in any part
  return { article: main, href: `${main.sitePath}#${anchor}` }
}

function hasScheme(target: string): boolean {
  if (/^[a-zA-Z]:[\\/]/.test(target)) return false // Windows drive path
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)
}

type LinkOutcome =
  | { kind: 'untouched' }
  | { kind: 'rewritten'; href: string }
  | { kind: 'downgraded'; filename: string }
  | { kind: 'other-relative' }

function classifyLink(rawTarget: string, from: Article, ctx: LinkContext): LinkOutcome {
  const target = rawTarget.startsWith('<') && rawTarget.endsWith('>') ? rawTarget.slice(1, -1) : rawTarget
  if (target === '' || hasScheme(target) || target.startsWith('//') || target.startsWith('/')) {
    return { kind: 'untouched' }
  }

  const hashAt = target.indexOf('#')
  const pathPart = (hashAt >= 0 ? target.slice(0, hashAt) : target).replace(/\?.*$/, '')
  const anchor = hashAt >= 0 ? target.slice(hashAt + 1) || null : null

  if (pathPart === '') {
    // Same-file anchor. Only meaningful to rewrite when the source was split or mapped twice.
    if (!anchor) return { kind: 'untouched' }
    const entries = ctx.bySource.get(from.entry.sourceKey) ?? [from.entry]
    const res = resolveInto(entries, anchor)
    if (res.article === from) return { kind: 'untouched' }
    if (entries.length === 1 && from.entry.split === 'none') return { kind: 'untouched' }
    return { kind: 'rewritten', href: res.href }
  }

  let decoded = pathPart
  try {
    decoded = decodeURIComponent(pathPart)
  } catch {
    // keep as written
  }
  if (!decoded.toLowerCase().endsWith('.md')) return { kind: 'other-relative' }

  const abs = path.isAbsolute(decoded) ? decoded : path.resolve(path.dirname(from.entry.sourceAbs), decoded)
  const key = pathKey(abs)
  const override = ctx.overrides.get(key)
  if (override) return { kind: 'rewritten', href: anchor ? `${override}#${anchor}` : override }
  const entries = ctx.bySource.get(key)
  if (entries && entries.length > 0) return { kind: 'rewritten', href: resolveInto(entries, anchor).href }
  return { kind: 'downgraded', filename: path.basename(decoded) }
}

/** Replaces inline code spans with same-length filler so link regexes skip them. */
function maskInlineCode(text: string): string {
  const out = text.split('')
  let i = 0
  while (i < text.length) {
    if (text[i] !== '`') {
      i++
      continue
    }
    let j = i
    while (j < text.length && text[j] === '`') j++
    const run = j - i
    // Find the closing run of exactly the same length.
    let k = j
    let close = -1
    while (k < text.length) {
      if (text[k] === '`') {
        let m = k
        while (m < text.length && text[m] === '`') m++
        if (m - k === run) {
          close = k
          break
        }
        k = m
      } else k++
    }
    if (close === -1) {
      i = j
      continue
    }
    for (let p = i; p < close + run; p++) if (out[p] !== '\n') out[p] = '\u0001'
    i = close + run
  }
  return out.join('')
}

const INLINE_LINK_RE = /(!?)\[([^\[\]]*)\]\(\s*(<[^<>\n]*>|[^()\s]*)(\s+(?:"[^"\n]*"|'[^'\n]*'|\([^)\n]*\)))?\s*\)/g
const REF_DEF_RE = /^( {0,3}\[[^\]]+\]:[ \t]*)(<[^>]*>|\S+)(.*)$/

interface RewriteStats {
  rewritten: number
  downgraded: number
  otherRelative: number
  refUnresolved: number
}

function rewriteSegment(text: string, startLine: number, from: Article, ctx: LinkContext, log: Rewrite[], stats: RewriteStats): string {
  const masked = maskInlineCode(text)
  let out = ''
  let last = 0
  INLINE_LINK_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = INLINE_LINK_RE.exec(masked)) !== null) {
    const [whole, bang] = m
    const idx = m.index
    // Skip matches that start inside a code span or are images.
    if (masked[idx] === '\u0001' || bang === '!') continue
    const original = text.slice(idx, idx + whole.length)
    const om = new RegExp(INLINE_LINK_RE.source).exec(original)
    if (!om) continue
    const [, , linkText, rawTarget, titlePart] = om
    const line = startLine + (text.slice(0, idx).match(/\n/g)?.length ?? 0)
    const outcome = classifyLink(rawTarget, from, ctx)
    let replacement: string | null = null
    if (outcome.kind === 'rewritten') {
      replacement = `[${linkText}](${outcome.href}${titlePart ?? ''})`
      stats.rewritten++
      log.push({ line, from: rawTarget, to: outcome.href, kind: 'rewritten' })
    } else if (outcome.kind === 'downgraded') {
      replacement = `${linkText} (local reference: ${outcome.filename})`
      stats.downgraded++
      log.push({ line, from: rawTarget, to: `plain text (local reference: ${outcome.filename})`, kind: 'downgraded' })
    } else if (outcome.kind === 'other-relative') {
      stats.otherRelative++
      log.push({ line, from: rawTarget, to: '(relative non-markdown link, left as written)', kind: 'kept' })
    }
    if (replacement !== null) {
      out += text.slice(last, idx) + replacement
      last = idx + whole.length
    }
  }
  out += text.slice(last)

  // Reference-style definitions: "[label]: target".
  return out
    .split('\n')
    .map((lineText, i) => {
      const d = REF_DEF_RE.exec(lineText)
      if (!d) return lineText
      const outcome = classifyLink(d[2], from, ctx)
      const line = startLine + i
      if (outcome.kind === 'rewritten') {
        stats.rewritten++
        log.push({ line, from: d[2], to: outcome.href, kind: 'rewritten' })
        return `${d[1]}${outcome.href}${d[3]}`
      }
      if (outcome.kind === 'downgraded') {
        stats.refUnresolved++
        log.push({ line, from: d[2], to: '(reference definition to an unmapped file, left as written)', kind: 'kept' })
      }
      return lineText
    })
    .join('\n')
}

/** Rewrites links in a chunk, leaving fenced code blocks untouched. */
function rewriteChunk(chunk: Chunk, from: Article, ctx: LinkContext, log: Rewrite[], stats: RewriteStats): string {
  const lines = chunk.text.split('\n')
  const fence = new FenceTracker()
  const out: string[] = []
  let segment: string[] = []
  let segmentStart = chunk.startLine
  const flush = (): void => {
    if (segment.length > 0) out.push(rewriteSegment(segment.join('\n'), segmentStart, from, ctx, log, stats))
    segment = []
  }
  lines.forEach((line, i) => {
    if (fence.step(line)) {
      flush()
      out.push(line)
    } else {
      if (segment.length === 0) segmentStart = chunk.startLine + i
      segment.push(line)
    }
  })
  flush()
  return out.join('\n')
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function stripMarkdownForExcerpt(text: string): string {
  return text
    .split('\n')
    .map((l) => l.replace(/^(?:[ \t]*>)+[ \t]?/, '').replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ''))
    .join(' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`+/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/(^|[\s(])[*_]([^*_\s][^*_]*?)[*_](?=[\s).,;:!?]|$)/g, '$1$2')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cutExcerpt(text: string, max = 200): string {
  if (text.length <= max) return text
  let cut = text.slice(0, max - 3)
  const space = cut.lastIndexOf(' ')
  if (space > max / 2) cut = cut.slice(0, space)
  return `${cut.replace(/[\s.,;:!?-]+$/, '')}...`
}

/** First prose paragraph of a body (headings, rules, tables, fences and HTML skipped). */
function firstParagraph(body: string): string {
  const fence = new FenceTracker()
  let para: string[] = []
  for (const line of body.split('\n')) {
    if (fence.step(line)) {
      if (para.length) break
      continue
    }
    const t = line.trim()
    const structural = t === '' || ATX_RE.test(line) || HR_RE.test(line) || t.startsWith('|') || t.startsWith('<')
    if (structural) {
      if (para.length) break
      continue
    }
    para.push(line)
  }
  return stripMarkdownForExcerpt(para.join('\n'))
}

function provenanceLine(entry: Entry, today: string): string {
  return (
    `> Source: ${entry.source} (compiled ${entry.provenance.compiled}, verified against Project Zomboid ` +
    `${entry.provenance.game_version}). Imported ${today}. Confidence tags in the text are the original author's.`
  )
}

function renderArticle(article: Article, ctx: LinkContext, today: string, stats: RewriteStats): RenderedArticle {
  const entry = article.entry
  const log: Rewrite[] = []
  const bodyParts = article.chunks.map((c) => rewriteChunk(c, article, ctx, log, stats)).filter((t) => t !== '')
  const parts = entry.articles.filter((a) => a.kind === 'part')

  const excerptSource = bodyParts.join('\n\n')
  if (article.kind === 'index') {
    const list = parts.map((p, i) => `${i + 1}. [${p.title}](${p.sitePath})`).join('\n')
    bodyParts.push(list)
  }

  let excerpt = cutExcerpt(firstParagraph(excerptSource))
  if (!excerpt && article.kind === 'index') {
    excerpt = cutExcerpt(`${article.title}, in ${parts.length} parts: ${parts.map((p) => p.title).join(', ')}.`)
  }
  if (!excerpt) excerpt = article.title

  const body = [`# ${article.h1}`, provenanceLine(entry, today), ...bodyParts].join('\n\n') + '\n'

  const frontmatter: Record<string, unknown> = {
    id: `${entry.version}-${article.slug}`,
    slug: article.slug,
    title: article.title,
    game: entry.game,
    version: entry.version,
    section: entry.section,
    category: entry.category,
    difficulty: entry.difficulty,
    tags: entry.tags,
    excerpt,
    last_updated: today,
  }
  if (entry.split === 'h2') {
    const siblings = parts.filter((p) => p !== article).map((p) => p.slug)
    if (siblings.length > 0) frontmatter.related_articles = siblings
  }
  return { article, body, frontmatter, rewrites: log }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const opts = parseArgs(process.argv.slice(2))
  const errors: string[] = []
  const warnings: string[] = []

  if (opts.manifests.length === 0) fail(`No manifests found in ${DEFAULT_MANIFEST_DIR}`)

  // 1. Load and validate every manifest before doing anything else.
  const manifests = opts.manifests
    .map((f) => {
      if (!fs.existsSync(f)) {
        errors.push(`${f}: manifest file not found`)
        return null
      }
      return loadManifest(f, errors)
    })
    .filter((m): m is LoadedManifest => m !== null)
  const entries = manifests.flatMap((m) => m.entries)

  // 2. A source may appear in several entries only when all but one use only_headings.
  const bySource = new Map<string, Entry[]>()
  for (const e of entries) {
    const list = bySource.get(e.sourceKey) ?? []
    list.push(e)
    bySource.set(e.sourceKey, list)
  }
  for (const list of bySource.values()) {
    const unfiltered = list.filter((e) => !e.onlyHeadings)
    if (unfiltered.length > 1) {
      errors.push(
        `source ${list[0].sourceAbs} is mapped by ${unfiltered.length} entries without only_headings ` +
          `(${unfiltered.map((e) => e.label).join('; ')}); at most one may omit it`,
      )
    }
  }

  // 3. Parse sources and plan every output article.
  for (const e of entries) planEntry(e, errors, warnings)

  // 4. Output paths and ids must be unique across all manifests.
  const byPath = new Map<string, Article>()
  const byId = new Map<string, Article>()
  for (const e of entries) {
    for (const a of e.articles) {
      const prevPath = byPath.get(a.outRel)
      if (prevPath) errors.push(`duplicate output path ${a.outRel}: ${prevPath.entry.label} and ${e.label}`)
      else byPath.set(a.outRel, a)
      const id = `${e.version}-${a.slug}`
      const prevId = byId.get(id)
      if (prevId && prevId.outRel !== a.outRel) {
        errors.push(`duplicate id ${id} (slug "${a.slug}" reused in ${e.version}): ${prevId.outRel} and ${a.outRel}`)
      } else byId.set(id, a)
    }
  }

  if (errors.length > 0) {
    console.error(`[ERROR] ${errors.length} validation error(s); nothing was written.`)
    for (const err of errors) console.error(`  - ${err}`)
    for (const w of warnings) console.error(`  (warning) ${w}`)
    process.exit(1)
  }

  // 5. Render everything (all manifests are known, so cross-manifest links resolve).
  const overrides = new Map<string, string>()
  for (const m of manifests) for (const [k, v] of m.overrides) overrides.set(k, v)
  const ctx: LinkContext = { bySource, overrides }
  const today = todayLocal()
  const stats: RewriteStats = { rewritten: 0, downgraded: 0, otherRelative: 0, refUnresolved: 0 }
  const rendered = entries.flatMap((e) => e.articles.map((a) => renderArticle(a, ctx, today, stats)))

  // 6. Write, or print the plan.
  for (const r of rendered) {
    const outAbs = path.join(opts.out, r.article.outRel)
    const content = matter.stringify(r.body, r.frontmatter)
    const showDetail = opts.dryRun || opts.verbose
    if (showDetail) {
      console.log(`${opts.dryRun ? '[PLAN]' : '[WRITE]'} ${toPosix(path.relative(process.cwd(), outAbs))}  (${r.article.kind}, "${r.article.title}")`)
      for (const rw of r.rewrites) {
        console.log(`    ${r.article.entry.source}:${rw.line}  ${rw.from} -> ${rw.to}`)
      }
    }
    if (!opts.dryRun) {
      fs.mkdirSync(path.dirname(outAbs), { recursive: true })
      fs.writeFileSync(outAbs, content, 'utf-8')
    }
  }

  for (const w of warnings) console.warn(`[WARN] ${w}`)
  if (stats.otherRelative > 0) {
    console.warn(`[WARN] ${stats.otherRelative} relative link(s) to non-markdown files were left as written (run with --verbose to list them)`)
  }
  if (stats.refUnresolved > 0) {
    console.warn(`[WARN] ${stats.refUnresolved} reference definition(s) point at unmapped .md files and were left as written`)
  }

  const verb = opts.dryRun ? 'planned (dry run, nothing written)' : 'written'
  console.log(
    `[COMPLETE] ${manifests.length} manifests, ${entries.length} entries, ${rendered.length} articles ${verb}, ` +
      `${stats.rewritten} links rewritten, ${stats.downgraded} links downgraded to local references. ` +
      `Content root: ${opts.out}`,
  )
}

if (require.main === module) {
  main()
}
