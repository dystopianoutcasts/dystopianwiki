#!/usr/bin/env tsx
/**
 * Article lint: local paths, private details, inside voice, proof-line shape, unproven
 * "verified" claims and emoji in the wiki's markdown articles.
 *
 * Usage:
 *   npm run kb:lint
 *   npx tsx scripts/kb/lint-articles.ts [--drafts] [--root <content dir>] [--allow <file>]
 *
 * Walks <root>/articles/**\/*.md (and <root>/drafts/**\/*.md with --drafts). --root defaults
 * to the repo's content/ folder; --allow defaults to scripts/kb/lint-allow.json.
 *
 * Rules (STYLE.md sections 3 and 6):
 *   ERROR local-path              a drive path (X:\ or X:/), /r/ZOMBOID-style shell paths,
 *                                 a home-directory path. %UserProfile%\Zomboid, ~/Zomboid and
 *                                 game-relative paths (media/lua/...) are allowed.
 *   ERROR private-detail          IPv4 address, key or token shapes, password/secret with a
 *                                 value, e-mail address, session id (UUID), memory-note keys.
 *                                 The matched value is never printed.
 *   WARN  inside-voice            "the owner", "our server's", "my machine", "this session",
 *                                 "the planner".
 *   ERROR proof-shape             a proof line that is not
 *                                 "> **Proof:** <level>. <citation>. Build <build>."
 *   WARN  verified-without-proof  "verified" or "confirmed" in a section with no proof line.
 *   ERROR emoji                   any emoji character.
 *
 * Allowlist: a JSON array of { "file", "rule", "line", "reason" }. "file" is relative to the
 * content root with forward slashes (articles/pz/...), "line" is the exact line text (trailing
 * whitespace ignored), "reason" must not be empty. An allowed hit is counted but does not fail
 * the run; an entry that matches nothing is reported as a warning.
 *
 * Exit code: 0 no ERROR, 1 at least one ERROR, 2 bad arguments or a bad allowlist.
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

const REPO_ROOT = path.resolve(__dirname, '..', '..')

export type Severity = 'ERROR' | 'WARN'
export type RuleId =
  | 'local-path'
  | 'private-detail'
  | 'inside-voice'
  | 'proof-shape'
  | 'verified-without-proof'
  | 'emoji'

export const RULES: Record<RuleId, Severity> = {
  'local-path': 'ERROR',
  'private-detail': 'ERROR',
  'inside-voice': 'WARN',
  'proof-shape': 'ERROR',
  'verified-without-proof': 'WARN',
  emoji: 'ERROR',
}

export interface Finding {
  file: string
  line: number
  rule: RuleId
  severity: Severity
  message: string
  text: string
  allowed?: string
}

export interface AllowEntry {
  file: string
  rule: RuleId
  line: string
  reason: string
}

/* ------------------------------------------------------------------ rule patterns */

const LOCAL_PATH_PATTERNS: { re: RegExp; label: string }[] = [
  // Drive path: C:\ or C:/ not preceded by a letter or digit (so https:// never matches).
  { re: /(?<![A-Za-z0-9])[A-Za-z]:[\\/]+[^\s`'")\]|]*/g, label: 'drive path' },
  // Shell-style drive mounts: /r/ZOMBOID, /c/Users, /mnt/c/...
  { re: /(?<![\w.~/-])\/(?:mnt\/)?[A-Za-z]\/(?:ZOMBOID|Users|Games|Program Files|home)\b[^\s`'")\]|]*/gi, label: 'shell drive path' },
  // Home directories: /home/<name>/, /Users/<name>/
  { re: /(?<![\w.~/-])\/(?:home|Users)\/[A-Za-z0-9._-]+(?:\/[^\s`'")\]|]*)?/g, label: 'home directory' },
  // ~/something, except the generic ~/Zomboid form.
  { re: /(?<![\w/])~\/(?!Zomboid\b)[^\s`'")\]|]+/g, label: 'home directory' },
]

interface PrivatePattern {
  re: RegExp
  label: string
  accept?: (m: RegExpExecArray) => boolean
}

function isIPv4(m: RegExpExecArray): boolean {
  // A four-part game or file version ("Build 42.20.4.1") is not an address.
  if (/(?:\bbuild|\bversion|\bv)\s*$/i.test(m.input.slice(0, m.index))) return false
  const parts = m[0].split('.').map(Number)
  if (parts.some((p) => p > 255)) return false
  // Loopback and the unspecified address are generic, not anyone's server.
  if (parts[0] === 127) return false
  if (parts.every((p) => p === 0)) return false
  return true
}

function looksLikeBase64Token(m: RegExpExecArray): boolean {
  // A path, file name or slug is short words joined by / _ - : a token has one long
  // unbroken run that mixes upper case, lower case and digits.
  return m[0].split(/[+/_-]/).some((piece) => {
    if (piece.length < 24) return false
    const digits = (piece.match(/[0-9]/g) ?? []).length
    return digits >= 3 && /[a-z]/.test(piece) && /[A-Z]/.test(piece)
  })
}

function isRealSecretValue(m: RegExpExecArray): boolean {
  const v = m[1]
  if (!v) return false
  // Placeholders a reader fills in are not values.
  if (/^[<{$%]/.test(v)) return false
  return true
}

const PRIVATE_PATTERNS: PrivatePattern[] = [
  { re: /(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.]*\d)/g, label: 'IPv4 address', accept: isIPv4 },
  { re: /\beyJ[A-Za-z0-9_-]{10,}/g, label: 'JWT-shaped token' },
  { re: /\bsb_[A-Za-z0-9_]{8,}/g, label: 'Supabase-style key' },
  { re: /\b(?:sk|pk|rk)-[A-Za-z0-9_-]{20,}/g, label: 'API key shape' },
  { re: /\bgh[pousr]_[A-Za-z0-9]{20,}/g, label: 'GitHub token shape' },
  { re: /\bAKIA[A-Z0-9]{16}\b/g, label: 'AWS key shape' },
  { re: /(?<![0-9a-fA-F])[0-9a-fA-F]{32,}(?![0-9a-fA-F])/g, label: 'long hex run' },
  { re: /(?<![A-Za-z0-9+/_-])[A-Za-z0-9+/_-]{40,}={0,2}/g, label: 'long base64 run', accept: looksLikeBase64Token },
  // key=value anywhere (spaces after = only before a quote, so "Password= in the file" is
  // prose), and key: value only as a line's key, so "here's the secret: ..." is prose.
  {
    re: /(?:password|passwd|secret)\w*[ \t]*=(?:[ \t]*["'`])?([^\s"'`|<>*]+)/gi,
    label: 'password or secret with a value',
    accept: isRealSecretValue,
  },
  {
    re: /^[\s>*`"'-]*\w*(?:password|passwd|secret)\w*["'`]?[ \t]*:[ \t]*["'`]?([^\s"'`|<>*]+)/gi,
    label: 'password or secret with a value',
    accept: isRealSecretValue,
  },
  { re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, label: 'e-mail address' },
  { re: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, label: 'session id (UUID)' },
  { re: /\boriginSessionId\b|\bnode_type\b/g, label: 'memory-note metadata' },
]

const INSIDE_VOICE_RE = /\b(?:the owner|our server's|my machine|this session|the planner)\b/gi

const PROOF_LEVELS = ['Code', 'Server test', 'Game test', 'Reported', 'Unknown']
// Any line that tries to be a proof line (spacing or bold variants included).
const PROOF_CANDIDATE_RE = /^\s*>\s*\*{0,2}\s*Proof\s*:?\s*\*{0,2}\s*:?/i
const PROOF_EXACT_RE = new RegExp(
  `^> \\*\\*Proof:\\*\\* (?:${PROOF_LEVELS.join('|')})\\. (\\S.*?)\\. Build (\\S.*?)\\.?\\s*$`,
)

const VERIFIED_RE = /\b(?:verified|confirmed)\b/i
const PROVENANCE_RE = /^\s*>\s*Source:/

// Emoji: anything with default emoji presentation, a pictograph forced to emoji style with
// U+FE0F, keycaps, regional indicators, and pictographs above U+24FF (the range below holds
// typographic symbols such as the copyright sign and arrows, which stay allowed).
const EMOJI_RE =
  /\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\u20E3|[\u{1F1E6}-\u{1F1FF}]|(?=\p{Extended_Pictographic})[^\u0000-\u24FF]/gu

/* ------------------------------------------------------------------ helpers */

/** Line-by-line fenced code tracking; returns true for lines inside (or opening/closing) a fence. */
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

function frontmatterEnd(lines: string[]): number {
  if (lines[0]?.trim() !== '---') return 0
  for (let i = 1; i < lines.length; i++) if (lines[i].trim() === '---') return i + 1
  return 0
}

function codePoint(ch: string): string {
  return `U+${(ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`
}

/* ------------------------------------------------------------------ the lint */

/** Lints one file's text. `file` is the name used in findings. */
export function lintText(file: string, text: string): Finding[] {
  const findings: Finding[] = []
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  const fmEnd = frontmatterEnd(lines)
  const fence = new FenceTracker()

  const add = (i: number, rule: RuleId, message: string): void => {
    findings.push({ file, line: i + 1, rule, severity: RULES[rule], message, text: lines[i].trimEnd() })
  }

  // Sections for verified-without-proof: [startLine, endLine) in body lines, outside fences.
  interface Section {
    hasProof: boolean
    hits: number[]
  }
  const sections: Section[] = [{ hasProof: false, hits: [] }]

  lines.forEach((line, i) => {
    const inFrontmatter = i < fmEnd
    const inFence = !inFrontmatter && fence.step(line)

    // Rules that apply everywhere (frontmatter, prose and code).
    for (const p of LOCAL_PATH_PATTERNS) {
      p.re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = p.re.exec(line)) !== null) add(i, 'local-path', `${p.label}: ${m[0]}`)
    }
    for (const p of PRIVATE_PATTERNS) {
      p.re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = p.re.exec(line)) !== null) {
        if (p.accept && !p.accept(m)) continue
        add(i, 'private-detail', `${p.label} at column ${m.index + 1} (value not shown)`)
      }
    }
    EMOJI_RE.lastIndex = 0
    let em: RegExpExecArray | null
    while ((em = EMOJI_RE.exec(line)) !== null) {
      if (em[0] === '') {
        EMOJI_RE.lastIndex++
        continue
      }
      add(i, 'emoji', `emoji ${codePoint(em[0])} at column ${em.index + 1}`)
    }

    // Reader-facing prose (frontmatter title and excerpt included).
    if (!inFence) {
      INSIDE_VOICE_RE.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = INSIDE_VOICE_RE.exec(line)) !== null) add(i, 'inside-voice', `"${m[0]}"`)
    }

    if (inFrontmatter || inFence) return

    if (/^#{1,6}\s/.test(line)) sections.push({ hasProof: false, hits: [] })
    const section = sections[sections.length - 1]

    if (PROOF_CANDIDATE_RE.test(line)) {
      section.hasProof = true
      // A proof line wrapped onto further "> " lines renders as one paragraph: join them.
      let joined = line.trimEnd()
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j]
        if (!/^\s*>\s*\S/.test(next) || PROOF_CANDIDATE_RE.test(next) || /^\s*>\s*(`{3,}|~{3,})/.test(next)) break
        joined += ` ${next.replace(/^\s*>\s*/, '').trimEnd()}`
      }
      if (!PROOF_EXACT_RE.test(joined)) {
        add(i, 'proof-shape', `expected "> **Proof:** <${PROOF_LEVELS.join('|')}>. <citation>. Build <build>."`)
      }
      return
    }
    if (!PROVENANCE_RE.test(line) && VERIFIED_RE.test(line)) section.hits.push(i)
  })

  for (const s of sections) {
    if (s.hasProof) continue
    for (const i of s.hits) {
      const word = VERIFIED_RE.exec(lines[i])?.[0] ?? 'verified'
      add(i, 'verified-without-proof', `"${word}" with no proof line in this section`)
    }
  }

  return findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule))
}

/** Validates and returns the allowlist; throws with every problem listed. */
export function loadAllowlist(file: string): AllowEntry[] {
  if (!fs.existsSync(file)) return []
  let data: unknown
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (e) {
    throw new Error(`allowlist ${file} is not valid JSON: ${(e as Error).message}`)
  }
  if (!Array.isArray(data)) throw new Error(`allowlist ${file} must be a JSON array`)
  const problems: string[] = []
  data.forEach((e, n) => {
    const ok =
      e &&
      typeof e === 'object' &&
      typeof e.file === 'string' &&
      e.file.length > 0 &&
      typeof e.rule === 'string' &&
      e.rule in RULES &&
      typeof e.line === 'string' &&
      e.line.length > 0 &&
      typeof e.reason === 'string' &&
      e.reason.trim().length > 0
    if (!ok) problems.push(`entry ${n}: needs non-empty "file", a known "rule", "line" and "reason"`)
  })
  if (problems.length) throw new Error(`allowlist ${file}:\n  ${problems.join('\n  ')}`)
  return data as AllowEntry[]
}

export function applyAllowlist(findings: Finding[], allow: AllowEntry[]): AllowEntry[] {
  const used = new Set<AllowEntry>()
  for (const f of findings) {
    const hit = allow.find((a) => a.file === f.file && a.rule === f.rule && a.line.trimEnd() === f.text)
    if (hit) {
      f.allowed = hit.reason
      used.add(hit)
    }
  }
  return allow.filter((a) => !used.has(a))
}

interface Options {
  root: string
  allow: string
  drafts: boolean
}

function usage(code: number): never {
  console.log('Usage: npx tsx scripts/kb/lint-articles.ts [--drafts] [--root <content dir>] [--allow <file>]')
  process.exit(code)
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    root: path.join(REPO_ROOT, 'content'),
    allow: path.join(__dirname, 'lint-allow.json'),
    drafts: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--drafts') opts.drafts = true
    else if (a === '--root' || a === '--allow') {
      const v = argv[++i]
      if (!v) {
        console.error(`[ERROR] ${a} needs a path`)
        process.exit(2)
      }
      if (a === '--root') opts.root = path.resolve(v)
      else opts.allow = path.resolve(v)
    } else if (a === '--help' || a === '-h') usage(0)
    else {
      console.error(`[ERROR] Unknown argument: ${a}`)
      usage(2)
    }
  }
  return opts
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2))
  if (!fs.existsSync(path.join(opts.root, 'articles'))) {
    console.error(`[ERROR] no articles folder under ${opts.root}`)
    process.exit(2)
  }
  let allow: AllowEntry[]
  try {
    allow = loadAllowlist(opts.allow)
  } catch (e) {
    console.error(`[ERROR] ${(e as Error).message}`)
    process.exit(2)
  }

  const patterns = ['articles/**/*.md']
  if (opts.drafts) patterns.push('drafts/**/*.md')
  const files = (await glob(patterns, { cwd: opts.root, posix: true, nodir: true })).sort()

  const findings: Finding[] = []
  for (const rel of files) {
    findings.push(...lintText(rel, fs.readFileSync(path.join(opts.root, rel), 'utf-8')))
  }
  const unused = applyAllowlist(findings, allow)

  for (const f of findings) {
    const tag = f.allowed ? `ALLOWED (${f.allowed})` : f.severity
    console.log(`${f.file}:${f.line}  ${tag}  ${f.rule}  ${f.message}`)
  }
  for (const a of unused) {
    console.log(`${opts.allow}  WARN  allowlist  entry matches nothing: ${a.file} ${a.rule}`)
  }

  const active = findings.filter((f) => !f.allowed)
  const errors = active.filter((f) => f.severity === 'ERROR').length
  const warns = active.length - errors + unused.length
  console.log('')
  console.log(`Files: ${files.length}${opts.drafts ? ' (articles and drafts)' : ' (articles)'}`)
  for (const rule of Object.keys(RULES) as RuleId[]) {
    const n = active.filter((f) => f.rule === rule).length
    const allowed = findings.filter((f) => f.rule === rule && f.allowed).length
    console.log(`  ${RULES[rule].padEnd(5)} ${rule.padEnd(23)} ${n}${allowed ? ` (+${allowed} allowed)` : ''}`)
  }
  console.log(`${errors} error(s), ${warns} warning(s)`)
  process.exit(errors > 0 ? 1 : 0)
}

if (require.main === module) {
  main().catch((e) => {
    console.error(`[ERROR] ${(e as Error).stack ?? e}`)
    process.exit(2)
  })
}
