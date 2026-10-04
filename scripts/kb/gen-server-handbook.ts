#!/usr/bin/env tsx
/**
 * Generate the server owner's handbook reference pages from the extracted server surface.
 *
 * Reads  scripts/kb/data/server-surface-<build>.json         (written by scripts/kb/extract/extract-server-surface.ts)
 *        scripts/kb/data/server-handbook-notes-<build>.json  (hand-written notes, each tied to a read site)
 * Writes content/articles/pz/build-42/server/_section.json and four generated categories:
 *        server-options/, sandbox-options/, admin-commands/, roles-and-access/
 *        (each folder holds only generated files and its _category.json). The hand-written
 *        getting-started/ folder is never touched.
 *
 * Output is a pure function of the two inputs: no dates, no randomness, sorted or in the
 * game's own order everywhere, so a re-run writes byte-identical files.
 *
 * Usage (from the repo root):
 *   npm run kb:gen-server                       # write the pages
 *   npm run kb:gen-server -- --check            # exit 1 if the pages on disk are not what the data gives
 *   npx tsx scripts/kb/gen-server-handbook.ts --data <json> --notes <json> --out <section folder>
 */

import fs from 'fs'
import path from 'path'

const REPO_ROOT = path.resolve(__dirname, '..', '..')
const DEFAULT_BUILD = '42.21'
const SECTION = 'server'
const SITE_BASE = `/pz/build-42/${SECTION}`
const REGEN = 'npm run kb:gen-server'

// ---------------------------------------------------------------------------------------
// Data shapes (as written by the extractor)
// ---------------------------------------------------------------------------------------

export interface Site {
  lang: 'java' | 'lua'
  where: string
  in: string
  line: number
}

type Literal = boolean | number | string | null
type Status = 'read' | 'computed' | 'named' | 'none'

export interface ServerOption {
  name: string
  field: string
  type: 'boolean' | 'integer' | 'double' | 'enum' | 'string' | 'text'
  default: Literal | { computed: string }
  min?: number
  max?: number
  maxLength?: number
  choices?: string[]
  tooltip: string | null
  page: string | null
  public: boolean
  declaredLine: number
  reads: Site[]
  writes: Site[]
  named: Site[]
  status: Status
}

export interface SandboxOption {
  name: string
  group: string | null
  short: string
  field: string
  type: 'boolean' | 'integer' | 'double' | 'enum' | 'string'
  default: Literal
  javaDefault: Literal
  min?: number
  max?: number
  maxLength?: number
  choices?: string[]
  enumConstants?: { name: string; args: string }[]
  label: string | null
  labelKey: string
  tooltip: string | null
  page: string | null
  subgroup: string | null
  hiddenUnlessDebug: boolean
  presets: Record<string, Literal>
  declaredLine: number
  reads: Site[]
  writes: Site[]
  computed: Site[]
  named: Site[]
  status: Status
}

export interface Command {
  class: string
  names: string[]
  disabled: boolean
  variants: { required: string[]; optional: string | null; argName: string | null; varArgs: boolean }[]
  helpKey: string | null
  help: string | null
  capabilities: { capability: string; argName: string | null }[]
  actsIn: Site | null
}

export interface Role {
  name: string
  description: string
  color: number[]
  position: number
  allCapabilities: boolean
  removed: string[]
  capabilities: string[]
  defaultFor: string[]
}

export interface Capability {
  name: string
  tooltip: string | null
  roles: string[]
  commands: string[]
  reads: Site[]
}

export interface ServerSurface {
  build: string
  revision: string
  steamBuild: string
  capture: string
  captureSealed: string
  sources: Record<string, string>
  readRules: string[]
  defaultPreset: string
  counts: Record<string, number | Record<string, number>>
  publicExcluded: string[]
  serverPages: { key: string; title: string; steamOnly: boolean; customUi: string | null; options: string[] }[]
  sandboxPages: { key: string; title: string; options: string[] }[]
  presets: { name: string; title: string | null; file: string; keys: number; unknownKeys: string[]; resolved: string[] }[]
  argTypes: Record<string, string>
  commandClassesNotRegistered: string[]
  serverOptions: ServerOption[]
  sandboxOptions: SandboxOption[]
  dynamicReads: (Site & { prefix: string | null })[]
  unknownServerNames: { name: string; sites: number; first: Site }[]
  unknownSandboxNames: { name: string; sites: number; first: Site }[]
  commands: Command[]
  playerCommands: { name: string; helpKey: string; help: string | null }[]
  roles: Role[]
  capabilities: Capability[]
}

/** A hand-written note: one line on what the code does, tied to a site we read. */
export interface Note {
  effect: string
  /** `<class or Lua file>#<method or function>` of one of the item's sites, or `declaration` */
  site: string
}

export interface Notes {
  serverOptions: Record<string, Note>
  sandboxOptions: Record<string, Note>
  commands: Record<string, Note>
  capabilities: Record<string, Note>
}

// ---------------------------------------------------------------------------------------
// Page plan: the settings screen's pages, grouped into articles
// ---------------------------------------------------------------------------------------

interface Group {
  slug: string
  title: string
  /** settings-screen page keys; null = options on no page */
  pages: (string | null)[]
  intro: string
}

export const SERVER_GROUPS: Group[] = [
  {
    slug: 'server-options-details-steam-and-backups',
    title: 'Server options: details, Steam and backups',
    pages: ['Details', 'Steam', 'Backups', 'SteamWorkshop', 'Mods', 'Map', 'SpawnRegions'],
    intro: 'The options on the first pages of the server settings screen: the server\'s name and port, the password, Steam, and the automatic backups.',
  },
  {
    slug: 'server-options-players-and-admins',
    title: 'Server options: players and admins',
    pages: ['Players', 'Admin'],
    intro: 'Who can join, how many, what players see of each other, sleeping, respawning, and what admins are shown.',
  },
  {
    slug: 'server-options-pvp-safehouses-and-factions',
    title: 'Server options: PVP, safehouses, factions, fire and loot',
    pages: ['Fire', 'PVP', 'Loot', 'War', 'Faction', 'Safehouse'],
    intro: 'Everything that decides how players treat each other: PVP and its damage, safehouses, factions, the war system, fire and loot respawn in safehouses.',
  },
  {
    slug: 'server-options-chat-voice-and-connections',
    title: 'Server options: chat, voice, RCON, Discord and the rest',
    pages: ['Chat', 'RCON', 'Discord', 'UPnP', 'Other', 'Vehicles', 'Voice'],
    intro: 'Chat, voice, remote control (RCON), the Discord bridge, UPnP, vehicles and the settings screen\'s "Other" page.',
  },
  {
    slug: 'server-options-only-in-the-ini-file',
    title: 'Server options only in the ini file',
    pages: [null],
    intro: 'These options are in the server\'s ini file but on no page of the settings screen: anti-cheat, the bad-word filter, spawn points, towing and more. You change them by editing the file, or with `/changeoption`.',
  },
]

export const SANDBOX_GROUPS: Group[] = [
  {
    slug: 'sandbox-options-time-and-world',
    title: 'Sandbox options: time and world',
    pages: ['TimeOptions', 'WorldOptions'],
    intro: 'When the world starts, how long a day lasts, when the water and power go off, alarms, locked houses, the weather and the look of the world.',
  },
  {
    slug: 'sandbox-options-zombies',
    title: 'Sandbox options: zombies',
    pages: ['Zombie'],
    intro: 'How many zombies, how they spread and respawn, and the Zombie Lore: speed, strength, infection, senses and behaviour.',
  },
  {
    slug: 'sandbox-options-loot',
    title: 'Sandbox options: loot',
    pages: ['Loot'],
    intro: 'How much loot there is, of each kind, how it respawns and how already-looted the world looks as time passes.',
  },
  {
    slug: 'sandbox-options-nature-and-livestock',
    title: 'Sandbox options: nature and livestock',
    pages: ['NatureOptions', 'Animal'],
    intro: 'Farming, foraging, fishing, erosion and the animals.',
  },
  {
    slug: 'sandbox-options-meta-events',
    title: 'Sandbox options: meta events and stories',
    pages: ['Meta'],
    intro: 'The helicopter, distant gunshots and other meta events, generators, annotated maps and the randomised stories in houses, on roads and in zones.',
  },
  {
    slug: 'sandbox-options-character',
    title: 'Sandbox options: character and XP',
    pages: ['Character'],
    intro: 'Character creation points, injuries, needs, reading, weapons and the XP multipliers for every skill.',
  },
  {
    slug: 'sandbox-options-vehicles',
    title: 'Sandbox options: vehicles',
    pages: ['Vehicle'],
    intro: 'How many cars there are, their fuel, condition, locks and alarms, and what a crash does.',
  },
  {
    slug: 'sandbox-options-not-on-the-settings-screen',
    title: 'Sandbox options not on the settings screen',
    pages: [null],
    intro: 'These sandbox options exist in the code and in the SandboxVars file but on no page of the settings screen, or only in debug mode.',
  },
]

const CATEGORIES = {
  'server-options': { name: 'Server Options', icon: 'settings', displayOrder: 2 },
  'sandbox-options': { name: 'Sandbox Options', icon: 'globe', displayOrder: 3 },
  'admin-commands': { name: 'Admin Commands', icon: 'wrench', displayOrder: 4 },
  'roles-and-access': { name: 'Roles and Access', icon: 'scroll', displayOrder: 5 },
} as const
type CategoryId = keyof typeof CATEGORIES

const INDEX_SLUG = 'running-a-server'
const INDEX_URL = `${SITE_BASE}/getting-started/${INDEX_SLUG}`

// ---------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${fmt(n)} ${n === 1 ? one : many}`
}

function code(s: string): string {
  if (s === '') return '(empty)'
  const ticks = s.includes('`') ? '``' : '`'
  const pad = s.startsWith('`') || s.endsWith('`') ? ' ' : ''
  return `${ticks}${pad}${s}${pad}${ticks}`
}

function yamlString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

/** Java's String.valueOf(double): integers keep one decimal. */
export function javaDouble(n: number): string {
  return Number.isInteger(n) ? n.toFixed(1) : String(n)
}

function quoteText(s: string): string {
  // the game's text, shown as it ships: its line-break tags become spaces, markdown-significant
  // characters are escaped
  const t = s.replace(/\s*<\s*(?:br\s*\/?|LINE)\s*>\s*/gi, ' ').trim()
  return `"${t.replace(/([\\`*_[\]<>|])/g, '\\$1')}"`
}

/** The anchor rehype-slug (github-slugger) gives a heading, with its duplicate counter. */
export class Slugger {
  private seen = new Map<string, number>()
  slug(text: string): string {
    const base = text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
      .replace(/ /g, '-')
    let s = base
    let n = this.seen.get(base) ?? 0
    while (this.seen.has(s)) s = `${base}-${++n}`
    this.seen.set(base, n)
    this.seen.set(s, 0)
    return s
  }
}

function siteKey(s: Site): string {
  return `${s.where}#${s.in}`
}

/** Sites grouped by class and method (or file and function), lines listed once each. */
export function siteList(sites: Site[]): string {
  const groups = new Map<string, { s: Site; lines: number[] }>()
  for (const s of sites) {
    const k = `${s.lang}|${siteKey(s)}`
    if (!groups.has(k)) groups.set(k, { s, lines: [] })
    const g = groups.get(k)!
    if (!g.lines.includes(s.line)) g.lines.push(s.line)
  }
  return [...groups.values()]
    .map(({ s, lines }) => {
      const ls = lines.sort((a, b) => a - b)
      const lineText = `${ls.length === 1 ? 'line' : 'lines'} ${ls.join(', ')}`
      return s.lang === 'java' ? `${code(`${s.where}#${s.in}`)} (${lineText})` : `${code(`media/lua/${s.where}`)} in ${code(s.in)} (${lineText})`
    })
    .join('; ')
}

/** Writes summarised by folder (Lua) or class (Java), with counts. */
export function writeSummary(sites: Site[]): string {
  const by = new Map<string, Set<string>>()
  const count = new Map<string, number>()
  for (const s of sites) {
    const k = s.lang === 'java' ? code(s.where) : code(`media/lua/${s.where.split('/').slice(0, -1).join('/')}/`)
    if (!by.has(k)) by.set(k, new Set())
    by.get(k)!.add(s.where)
    count.set(k, (count.get(k) ?? 0) + 1)
  }
  return [...by.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, files]) => (k.endsWith('/`') ? `${k} (${plural(files.size, 'file')}, ${plural(count.get(k)!, 'place')})` : `${k} (${plural(count.get(k)!, 'place')})`))
    .join('; ')
}

interface Front {
  slug: string
  title: string
  category: CategoryId
  excerpt: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  related: string[]
}

function frontmatter(f: Front, data: ServerSurface): string {
  return [
    '---',
    `slug: ${f.slug}`,
    `title: ${yamlString(f.title)}`,
    'game: pz',
    'version: build-42',
    `section: ${SECTION}`,
    `category: ${f.category}`,
    `difficulty: ${f.difficulty}`,
    'tags:',
    ...f.tags.map(t => `  - ${t}`),
    `excerpt: ${yamlString(f.excerpt)}`,
    `last_updated: '${data.captureSealed}'`,
    'related_articles:',
    ...f.related.map(r => `  - ${r}`),
    '---',
    '',
  ].join('\n')
}

function generatedNotice(data: ServerSurface): string {
  return `> **Generated from the code.** This page is generated from Build ${data.build} (revision ${data.revision}) by \`${REGEN}\`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](${INDEX_URL}#how-these-pages-are-made).\n`
}

function proofLine(citation: string, data: ServerSurface): string {
  return `> **Proof:** Code. ${citation}. Build ${data.build} (revision ${data.revision}).`
}

/** The read-site rules the extractor recorded, as a section of a page. */
function readRulesSection(data: ServerSurface): string[] {
  return [
    '## How a read site is found',
    '',
    `Every "Read in" line on these pages comes from a search of the Build ${data.build} Java and the vanilla Lua, by these rules:`,
    '',
    ...data.readRules.map((r, i) => `${i + 1}. ${r}`),
    '',
    'A read site says where the code uses the value. When the code there makes the effect plain, the entry adds a line on what it does, written by hand from that site. When it does not, the entry only says where the value is read: we do not guess.',
    '',
  ]
}

export interface Page {
  category: CategoryId
  file: string
  slug: string
  title: string
  content: string
}

function page(f: Front, body: string[], data: ServerSurface): Page {
  const content = frontmatter(f, data) + body.join('\n')
  return { category: f.category, file: `${f.slug}.md`, slug: f.slug, title: f.title, content: content.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n') }
}

function noteFor(notes: Record<string, Note>, key: string): Note | undefined {
  return Object.prototype.hasOwnProperty.call(notes, key) ? notes[key] : undefined
}

// ---------------------------------------------------------------------------------------
// Server options
// ---------------------------------------------------------------------------------------

function serverValue(o: ServerOption): string {
  const d = o.default
  if (d !== null && typeof d === 'object') return `computed when the options are created: ${code(d.computed)}`
  if (o.type === 'double') return code(javaDouble(d as number))
  if (o.type === 'string' || o.type === 'text') return code(String(d ?? ''))
  return code(String(d))
}

function serverIniLine(o: ServerOption): string {
  const d = o.default
  if (d !== null && typeof d === 'object') return code(`${o.name}=`)
  const v = o.type === 'double' ? javaDouble(d as number) : String(d ?? '')
  return code(`${o.name}=${v}`)
}

function serverKind(o: ServerOption): string {
  switch (o.type) {
    case 'boolean':
      return 'true or false'
    case 'integer':
      return `a whole number from ${o.min} to ${o.max}`
    case 'double':
      return `a number from ${javaDouble(o.min!)} to ${javaDouble(o.max!)}`
    case 'enum':
      return `a choice from 1 to ${o.max}: ${o.choices!.map((c, i) => `${i + 1} ${c}`).join(', ')}`
    case 'string':
    case 'text':
      return o.maxLength! > 0 ? `text, up to ${o.maxLength} characters` : 'text'
  }
}

function statusLines(status: Status, named: Site[], computed: Site[]): string[] {
  if (status === 'none') return ['- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.']
  if (status === 'named') return [`- **No read found.** We found no read of the value. The name appears as text in: ${siteList(named)}.`]
  if (status === 'computed') return [`- **Read through a name built elsewhere:** ${siteList(computed)}.`]
  return []
}

function renderServerOption(o: ServerOption, data: ServerSurface, notes: Notes): string {
  const lines: string[] = [`### ${o.name}`, '']
  const pageTitle = o.page ? data.serverPages.find(p => p.key === o.page)?.title ?? o.page : null
  const def = o.default !== null && typeof o.default === 'object' ? `${serverIniLine(o)} followed by a value ${serverValue(o)}` : `${serverIniLine(o)} is the default`
  lines.push(`- **In the file:** ${def}. Takes ${serverKind(o)}.`)
  lines.push(`- **Settings screen:** ${pageTitle ? `the ${quoteText(pageTitle)} page` : 'not on any page'}. **Sent to joining players:** ${o.public ? 'yes' : 'no'}.`)
  if (o.tooltip) lines.push(`- **The game's description:** ${quoteText(o.tooltip)}`)
  if (o.reads.length) lines.push(`- **Read in:** ${siteList(o.reads)}.`)
  if (o.writes.length) lines.push(`- **Changed in:** ${siteList(o.writes)}.`)
  lines.push(...statusLines(o.status, o.named, []))
  const n = noteFor(notes.serverOptions, o.name)
  if (n) lines.push(`- **What the code does with it:** ${n.effect}`)
  lines.push('')
  return lines.join('\n')
}

function serverGroupOf(o: ServerOption): Group {
  return SERVER_GROUPS.find(g => g.pages.includes(o.page)) ?? SERVER_GROUPS[SERVER_GROUPS.length - 1]
}

function serverGroupPage(g: Group, data: ServerSurface, notes: Notes, related: string[]): Page {
  const body: string[] = [`# ${g.title}`, '', generatedNotice(data), g.intro, '']
  // options in the settings screen's order, page by page; options on no page A to Z
  const known = data.serverPages.filter(p => g.pages.includes(p.key))
  for (const p of known) {
    const opts = p.options.map(n => data.serverOptions.find(o => o.name === n)!)
    if (opts.length === 0) {
      body.push(`## ${p.title}`, '', `This page of the settings screen has no options of its own: it is a custom panel (${code(p.customUi ?? 'custom')}).${p.steamOnly ? ' It is shown only on Steam servers.' : ''}`, '')
      continue
    }
    body.push(`## ${p.title}`, '')
    if (p.steamOnly) body.push('The settings screen shows this page only on Steam servers.', '')
    for (const o of opts) body.push(renderServerOption(o, data, notes))
  }
  if (g.pages.includes(null)) {
    const pageKeys = new Set(SERVER_GROUPS.flatMap(x => x.pages).filter((x): x is string => x !== null))
    const opts = data.serverOptions
      .filter(o => o.page === null || !pageKeys.has(o.page))
      .sort((a, b) => a.name.localeCompare(b.name))
    for (const o of opts) body.push(renderServerOption(o, data, notes))
  }
  body.push(
    proofLine('zombie.network.ServerOptions (each option\'s declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option', data),
    '',
  )
  return page(
    {
      slug: g.slug,
      title: g.title,
      category: 'server-options',
      excerpt: `${g.intro} Every option with its default, range and where Build ${data.build} reads it.`,
      tags: ['server', 'server-options', 'multiplayer', 'generated'],
      difficulty: 'beginner',
      related,
    },
    body,
    data,
  )
}

function serverDirectoryPage(data: ServerSurface, related: string[]): Page {
  const slug = 'server-options-directory'
  // anchors must follow each page's heading order, so walk pages as they are rendered
  const anchors = new Map<string, string>()
  for (const g of SERVER_GROUPS) {
    const s = new Slugger()
    s.slug(g.title)
    const known = data.serverPages.filter(p => g.pages.includes(p.key))
    for (const p of known) {
      s.slug(p.title)
      for (const n of p.options) anchors.set(n, `${g.slug}#${s.slug(n)}`)
    }
    if (g.pages.includes(null)) {
      const pageKeys = new Set(SERVER_GROUPS.flatMap(x => x.pages).filter((x): x is string => x !== null))
      for (const o of data.serverOptions.filter(o => o.page === null || !pageKeys.has(o.page)).sort((a, b) => a.name.localeCompare(b.name))) anchors.set(o.name, `${g.slug}#${s.slug(o.name)}`)
    }
  }
  const c = publishedCounts(data)
  const body: string[] = [
    '# Server options A to Z',
    '',
    generatedNotice(data),
    `Outcast, these are all ${fmt(data.serverOptions.length)} options of the server's ini file in Build ${data.build}, A to Z. Click a name for its full entry: what the game says about it, where the code reads it, and what we found it does.`,
    '',
    '## The file and how the game reads it',
    '',
    '- **Where it lives.** The server reads and writes `Server/<servername>.ini` in your Zomboid folder (`%UserProfile%\\Zomboid\\Server` on Windows, `~/Zomboid/Server` on Linux). The first start writes the file with every option at its default.',
    '- **What each line is.** One `Name=value` line per option, with the game\'s description written above it as a `#` comment.',
    '- **A value out of range is refused.** A number below the minimum or above the maximum is not clamped: the game logs an error and keeps the value it had (the default, on a fresh start). A true/false option accepts `true`, `false`, `1` and `0`, in any case; anything else is logged as an error and ignored.',
    `- **What players can see.** All options except ${data.publicExcluded.map(code).join(', ')} are on the public list. The server writes the public list, names and values, into the data a player\'s game downloads when it joins.`,
    `- **Not on the settings screen.** ${fmt(c.serverOptionsOnNoPage)} options are on no page of the game\'s server settings screen. They are only in the file (and \`/changeoption\` can change them).`,
    '',
    proofLine('zombie.network.ServerOptions#init, #loadServerTextFile, #saveServerTextFile and its constructor (the public list); zombie.config.ConfigFile#write (one line per option, the description as a comment); zombie.config.IntegerConfigOption#setValue and zombie.config.DoubleConfigOption#setValue (out-of-range values refused); zombie.config.BooleanConfigOption#parse; zombie.network.ConnectionDetails#writeServerOptions (the public list sent to a joining player); zombie.network.ServerSettingsManager#getSettingsFolder', data),
    '',
    '## What we found',
    '',
    `- **${fmt(c.serverOptionsRead)} of ${fmt(data.serverOptions.length)} options are read** somewhere in the Java or the vanilla Lua, at ${fmt(c.serverReadSites)} read sites.`,
    `- **${plural(c.serverOptionsReadNowhere, 'option is', 'options are')} read nowhere:** ${data.serverOptions.filter(o => o.status === 'none').map(o => `[${o.name}](${SITE_BASE}/server-options/${anchors.get(o.name)})`).join(', ') || 'none'}.`,
    ...(data.unknownServerNames.length ? [`- **Names the code asks for that are not options:** ${data.unknownServerNames.map(u => `${code(u.name)} (${siteList([u.first])})`).join(', ')}.`] : []),
    '',
    ...readRulesSection(data),
    '## All options',
    '',
    '| Option | Type | Default | Settings page |',
    '|---|---|---|---|',
  ]
  for (const o of [...data.serverOptions].sort((a, b) => a.name.localeCompare(b.name))) {
    const pageTitle = o.page ? data.serverPages.find(p => p.key === o.page)?.title ?? o.page : '-'
    const def = o.default !== null && typeof o.default === 'object' ? 'computed' : serverValue(o)
    body.push(`| [${o.name}](${SITE_BASE}/server-options/${anchors.get(o.name)}) | ${o.type} | ${def.replace(/\|/g, '\\|')} | ${pageTitle} |`)
  }
  body.push('')
  return page(
    {
      slug,
      title: `Server options A to Z (Build ${data.build})`,
      category: 'server-options',
      excerpt: `All ${fmt(data.serverOptions.length)} options of the Build ${data.build} server ini file, A to Z, with type, default and settings page, and how the game reads the file.`,
      tags: ['server', 'server-options', 'reference', 'generated'],
      difficulty: 'beginner',
      related,
    },
    body,
    data,
  )
}

// ---------------------------------------------------------------------------------------
// Sandbox options
// ---------------------------------------------------------------------------------------

function sbValue(o: SandboxOption, v: Literal): string {
  if (o.type === 'double') return code(javaDouble(v as number))
  if (o.type === 'enum' && o.choices && typeof v === 'number') return `${code(String(v))} (${quoteText(o.choices[v - 1] ?? '?')})`
  if (o.type === 'string') return code(String(v ?? ''))
  return code(String(v))
}

function sbLuaPath(o: SandboxOption): string {
  return o.group ? `SandboxVars.${o.group}.${o.short}` : `SandboxVars.${o.short}`
}

function sbKind(o: SandboxOption): string {
  switch (o.type) {
    case 'boolean':
      return 'true or false'
    case 'integer':
      return `a whole number from ${o.min} to ${o.max}`
    case 'double':
      return `a number from ${javaDouble(o.min!)} to ${javaDouble(o.max!)}`
    case 'enum':
      return `a choice from 1 to ${o.max}`
    case 'string':
      return o.maxLength! > 0 ? `text, up to ${o.maxLength} characters` : 'text'
  }
}

function renderSandboxOption(o: SandboxOption, data: ServerSurface, notes: Notes): string {
  const lines: string[] = [`### ${o.name}`, '']
  lines.push(`- **On the settings screen:** ${o.label ? quoteText(o.label) : code(o.labelKey)}${o.subgroup ? `, in the ${quoteText(o.subgroup)} group` : ''}.${o.hiddenUnlessDebug ? ' The sandbox screen shows it only in debug mode.' : ''}`)
  lines.push(`- **In the file:** ${code(`${o.group ? `${o.group} = { ${o.short}` : o.short} = ${o.type === 'double' ? javaDouble(o.default as number) : String(o.default)}${o.group ? ' }' : ''}`)}, read by Lua as ${code(sbLuaPath(o))}. Takes ${sbKind(o)}.`)
  if (o.type === 'enum' && o.choices) {
    const consts = o.enumConstants ? o.enumConstants.map(e => `${e.name}${e.args ? ` (${e.args})` : ''}`) : null
    lines.push(`- **Choices:** ${o.choices.map((c, i) => `${i + 1} ${quoteText(c)}${consts ? ` = ${code(consts[i])}` : ''}`).join(', ')}.`)
  }
  const presetBits = Object.entries(o.presets).map(([p, v]) => `${data.presets.find(x => x.name === p)?.title ?? p} ${sbValue(o, v)}`)
  lines.push(`- **Default:** ${sbValue(o, o.default)}${o.default !== o.javaDefault ? ` (the ${data.defaultPreset} preset's value; the Java declaration says ${sbValue(o, o.javaDefault)})` : ''}. ${presetBits.length ? `Other presets: ${presetBits.join(', ')}.` : 'Every preset keeps the default.'}`)
  if (o.tooltip) lines.push(`- **The game's description:** ${quoteText(o.tooltip)}`)
  if (o.reads.length) lines.push(`- **Read in:** ${siteList(o.reads)}.`)
  lines.push(...statusLines(o.status, o.named, o.computed))
  if (o.writes.length) lines.push(`- **Set (not read) in:** ${writeSummary(o.writes)}.`)
  const n = noteFor(notes.sandboxOptions, o.name)
  if (n) lines.push(`- **What the code does with it:** ${n.effect}`)
  lines.push('')
  return lines.join('\n')
}

function sandboxGroupPage(g: Group, data: ServerSurface, notes: Notes, related: string[]): Page {
  const body: string[] = [`# ${g.title}`, '', generatedNotice(data), g.intro, '']
  const known = data.sandboxPages.filter(p => g.pages.includes(p.key))
  for (const p of known) {
    body.push(`## ${p.title}`, '')
    for (const n of p.options) body.push(renderSandboxOption(data.sandboxOptions.find(o => o.name === n)!, data, notes))
  }
  if (g.pages.includes(null)) {
    const pageKeys = new Set(SANDBOX_GROUPS.flatMap(x => x.pages).filter((x): x is string => x !== null))
    const opts = data.sandboxOptions.filter(o => o.page === null || !pageKeys.has(o.page)).sort((a, b) => a.name.localeCompare(b.name))
    for (const o of opts) body.push(renderSandboxOption(o, data, notes))
  }
  body.push(
    proofLine(`zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the ${data.defaultPreset} values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option`, data),
    '',
  )
  return page(
    {
      slug: g.slug,
      title: g.title,
      category: 'sandbox-options',
      excerpt: `${g.intro} Every option with its default, the presets that change it, and where Build ${data.build} reads it.`,
      tags: ['server', 'sandbox-options', 'sandbox', 'generated'],
      difficulty: 'beginner',
      related,
    },
    body,
    data,
  )
}

function sandboxDirectoryPage(data: ServerSurface, related: string[]): Page {
  const slug = 'sandbox-options-directory'
  const anchors = new Map<string, string>()
  const pageKeys = new Set(SANDBOX_GROUPS.flatMap(x => x.pages).filter((x): x is string => x !== null))
  for (const g of SANDBOX_GROUPS) {
    const s = new Slugger()
    s.slug(g.title)
    for (const p of data.sandboxPages.filter(p => g.pages.includes(p.key))) {
      s.slug(p.title)
      for (const n of p.options) anchors.set(n, `${g.slug}#${s.slug(n)}`)
    }
    if (g.pages.includes(null)) for (const o of data.sandboxOptions.filter(o => o.page === null || !pageKeys.has(o.page)).sort((a, b) => a.name.localeCompare(b.name))) anchors.set(o.name, `${g.slug}#${s.slug(o.name)}`)
  }
  const c = publishedCounts(data)
  const link = (o: SandboxOption) => `[${o.name}](${SITE_BASE}/sandbox-options/${anchors.get(o.name)})`
  const body: string[] = [
    '# Sandbox options A to Z',
    '',
    generatedNotice(data),
    `Outcast, the sandbox options are the flavour of your world: how many zombies, how fast, how much loot, how long the power stays on. Build ${data.build} has ${fmt(data.sandboxOptions.length)} of them. Here they are A to Z; click a name for the full entry.`,
    '',
    '## The file and the presets',
    '',
    '- **Where they live.** A dedicated server keeps its sandbox options in `Server/<servername>_SandboxVars.lua` in your Zomboid folder. Each option is a line `Name = value,`; the options of a group (ZombieLore, ZombieConfig, Basement, Map, MultiplierConfig) sit inside a table named after the group. The game writes each option\'s description above it as a `--` comment, and for a choice it lists every value.',
    `- **The defaults are the ${data.defaultPreset} preset.** The game builds its sandbox options, then loads \`media/lua/shared/Sandbox/${data.defaultPreset}.lua\` and makes those values the defaults. So for ${fmt(c.sandboxDefaultDiffersFromJava)} options the default the game uses is not the number written in the Java declaration. Each entry shows both when they differ.`,
    `- **The presets.** The sandbox screen offers ${data.presets.map(p => quoteText(p.title ?? p.name)).join(', ')}. Choosing one starts from the ${data.defaultPreset} values and applies the preset file on top, so an option a preset file does not mention keeps the ${data.defaultPreset} value. Each entry lists the presets that set a different value.`,
    '- **A value out of range is refused,** exactly as for the server options: the game logs an error and keeps the value it had.',
    '',
    proofLine(`zombie.SandboxOptions constructor (loadGameFile("${data.defaultPreset}") then setDefaultsToCurrentValues), #loadServerLuaFile, #saveServerLuaFile and #writeLuaFile (the file, the groups, the comments); media/lua/client/OptionScreens/SandboxOptions.lua SandboxOptionsScreen:loadPresets and addPresetToList (each preset is a fresh SandboxOptions with the preset file loaded on top); zombie.config.IntegerConfigOption#setValue and zombie.config.DoubleConfigOption#setValue`, data),
    '',
    '## What we found',
    '',
    `- **${fmt(c.sandboxOptionsRead)} options are read directly** by the Java or the vanilla Lua (${fmt(c.sandboxReadSites)} read sites).`,
    `- **${fmt(c.sandboxOptionsComputedOnly)} are read through a name built elsewhere:** the XP multipliers (the code builds "MultiplierConfig." plus the skill name) and the options the world generator names in its data.`,
    `- **${fmt(c.sandboxOptionsNamedOnly)} have no read we could find, but their name appears as text:** ${data.sandboxOptions.filter(o => o.status === 'named').map(link).join(', ')}. Each entry says where.`,
    `- **${fmt(c.sandboxOptionsReadNowhere)} are read nowhere:** ${data.sandboxOptions.filter(o => o.status === 'none').map(link).join(', ') || 'none'}.`,
    `- **${fmt(c.sandboxWriteSites)} places set a sandbox value instead of reading it,** nearly all in the debug scenarios and the Last Stand challenges. Each entry lists them apart from the reads.`,
    ...(data.unknownSandboxNames.length ? [`- **Names the code uses that are not options in ${data.build}:** ${data.unknownSandboxNames.map(u => `${code(u.name)} (${plural(u.sites, 'place')}, first ${siteList([u.first])})`).join('; ')}.`] : []),
    ...data.presets.filter(p => p.unknownKeys.length).map(p => `- **The ${p.title ?? p.name} preset sets names that are not options:** ${p.unknownKeys.map(code).join(', ')}. The game ignores them.`),
    ...data.presets.filter(p => p.resolved.length).map(p => `- **The ${p.title ?? p.name} preset computes some values:** ${p.resolved.map(r => code(r)).join('; ')} (the tables are set in \`media/lua/shared/defines.lua\`).`),
    '',
    ...readRulesSection(data),
    '## All options',
    '',
    '| Option | Type | Default | Settings page |',
    '|---|---|---|---|',
  ]
  for (const o of [...data.sandboxOptions].sort((a, b) => a.name.localeCompare(b.name))) {
    const pageTitle = o.page ? data.sandboxPages.find(p => p.key === o.page)?.title ?? o.page : '-'
    body.push(`| ${link(o)} | ${o.type} | ${sbValue(o, o.default).replace(/\|/g, '\\|')} | ${pageTitle} |`)
  }
  body.push('')
  return page(
    {
      slug,
      title: `Sandbox options A to Z (Build ${data.build})`,
      category: 'sandbox-options',
      excerpt: `All ${fmt(data.sandboxOptions.length)} Build ${data.build} sandbox options A to Z, how the SandboxVars file and the presets work, and which options the code never reads.`,
      tags: ['server', 'sandbox-options', 'sandbox', 'reference', 'generated'],
      difficulty: 'beginner',
      related,
    },
    body,
    data,
  )
}

// ---------------------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------------------

/** A command argument pattern in words. */
export function argWords(re: string, argTypes: Record<string, string>): string {
  const named: Record<string, string> = {
    PlayerName: '"name or text"',
    AnyText: '"name or text"',
    Script: 'Module.Name',
    ItemName: 'Module.Name',
    Coordinates: 'x,y,z',
    IP: 'IP address',
    TrueFalse: '-true or -false',
    Value: 'number',
  }
  for (const [k, v] of Object.entries(argTypes)) if (v === re && named[k]) return named[k]
  if (re === '(\\w+)') return 'word'
  if (re === '(\\S+)') return 'word without spaces'
  if (re === '(.*)') return '"value"'
  if (/^-?[a-z]+$/i.test(re)) return re
  return `text matching ${re}`
}

function commandForms(c: Command, argTypes: Record<string, string>): string[] {
  const name = c.names[0]
  if (c.variants.length === 0) return [code(`/${name}`)]
  return c.variants.map(v => {
    if (v.varArgs) return `${code(`/${name} ...`)} (any arguments; the command reads them itself)`
    const parts = v.required.map(r => (/^-[a-z]+$/i.test(r) ? r : `<${argWords(r, argTypes)}>`))
    if (v.optional) parts.push(`[${/^-[a-z]+$/i.test(v.optional) ? v.optional : `<${argWords(v.optional, argTypes)}>`}]`)
    const cap = c.capabilities.find(x => x.argName && x.argName === v.argName)
    return `${code(`/${[name, ...parts].join(' ')}`)}${cap ? ` (needs ${code(cap.capability)})` : ''}`
  })
}

function rolesWith(cap: string, data: ServerSurface): string[] {
  return data.roles.filter(r => r.capabilities.includes(cap)).map(r => r.name)
}

function commandsPage(data: ServerSurface, notes: Notes, related: string[]): Page {
  const slug = 'admin-commands'
  const body: string[] = [
    '# Admin commands',
    '',
    generatedNotice(data),
    `Outcast, these are the ${fmt(data.commands.length)} commands the Build ${data.build} server knows, in the order the server tries them. You type them in chat with a \`/\` in front, or in the server console without it. Each form of a command needs one capability; the built-in roles that hold it are listed with it, and [Roles and access](${SITE_BASE}/roles-and-access/server-roles-and-capabilities) says what each role holds.`,
    '',
    '## How the server reads a command',
    '',
    '- **Matching.** The server walks its command list in order and takes the first command whose name starts the line, ignoring case and stopping at a word boundary. A disabled command is skipped.',
    '- **Arguments.** The line is split at spaces; text in double quotes stays one argument (the quotes are removed). Each form of a command lists the arguments it takes; the first form that fits is used. When none fits, the server answers with the command\'s help text.',
    '- **Who may run it.** After the arguments fit, the server checks the capability that form needs against your role. Without it you get "no right to execute" and nothing happens.',
    `- **${plural(data.commands.filter(c => c.disabled).length, 'command is', 'commands are')} disabled in ${data.build}:** ${data.commands.filter(c => c.disabled).map(c => code(`/${c.names[0]}`)).join(', ') || 'none'}. They are in the list, but the server skips them.`,
    '',
    '## Quick list',
    '',
    '| Command | Needs | Built-in roles that have it |',
    '|---|---|---|',
  ]
  const anchorOf = new Map<string, string>()
  const sl2 = new Slugger()
  sl2.slug('Admin commands')
  for (const h of ['How the server reads a command', 'Quick list']) sl2.slug(h)
  for (const c of data.commands) anchorOf.set(c.class, sl2.slug(`/${c.names[0]}`))
  for (const c of data.commands) {
    const caps = [...new Set(c.capabilities.map(x => x.capability))]
    body.push(`| [/${c.names[0]}](#${anchorOf.get(c.class)})${c.disabled ? ' (disabled)' : ''} | ${caps.map(code).join(', ')} | ${[...new Set(caps.flatMap(x => rolesWith(x, data)))].join(', ')} |`)
  }
  body.push('')
  for (const c of data.commands) {
    body.push(`### /${c.names[0]}`, '')
    if (c.names.length > 1) body.push(`- **Also typed as:** ${c.names.slice(1).map(n => code(`/${n}`)).join(', ')}`)
    if (c.disabled) body.push('- **Disabled in this build:** the server skips it.')
    body.push(`- **Forms:** ${commandForms(c, data.argTypes).join('; ')}`)
    const caps = [...new Set(c.capabilities.map(x => x.capability))]
    body.push(`- **Needs:** ${caps.map(x => `${code(x)} (${rolesWith(x, data).join(', ') || 'no built-in role'})`).join('; ')}`)
    body.push(`- **The game's help text:** ${c.help ? quoteText(c.help) : 'none (the command has no help text)'}`)
    if (c.actsIn) body.push(`- **Runs in:** ${siteList([c.actsIn])}`)
    const n = noteFor(notes.commands, c.names[0])
    if (n) body.push(`- **What the code does:** ${n.effect}`)
    body.push('')
  }
  body.push(
    '## Commands every player has',
    '',
    'The server also keeps a short help list for players, shown by `/help` to someone without admin capabilities. These are the entries, with the game\'s own text:',
    '',
    ...data.playerCommands.map(p => `- ${code(`/${p.name}`)}: ${p.help ? quoteText(p.help) : '(no text)'}`),
    '',
    proofLine('zombie.commands.CommandBase#findCommandCls (the order, case-insensitive match, disabled commands skipped), the CommandBase constructor (splitting the line), #parseCommand (the forms), #canBeExecuted and #PlayerSatisfyRequiredRights (the capability check), the annotations of each class in zombie.commands.serverCommands, zombie.network.ServerOptions#initClientCommandsHelp (the player help list), and the help strings in media/lua/shared/Translate/EN/UI.json', data),
    '',
  )
  return page(
    {
      slug,
      title: `Admin commands (Build ${data.build})`,
      category: 'admin-commands',
      excerpt: `All ${fmt(data.commands.length)} Build ${data.build} server commands: their forms, the capability each needs, the roles that have it, and the game's help text.`,
      tags: ['server', 'admin', 'commands', 'generated'],
      difficulty: 'beginner',
      related,
    },
    body,
    data,
  )
}

// ---------------------------------------------------------------------------------------
// Roles and capabilities
// ---------------------------------------------------------------------------------------

function rolesPage(data: ServerSurface, related: string[]): Page {
  const slug = 'server-roles-and-capabilities'
  const roles = [...data.roles].sort((a, b) => a.position - b.position)
  const body: string[] = [
    '# Roles and capabilities',
    '',
    generatedNotice(data),
    `Outcast, in Build ${data.build} what a player may do on your server is a list of capabilities, and a role is a named set of them. The game ships ${fmt(roles.length)} built-in roles. You give a player a role with \`/setaccesslevel\`, and admins can add their own roles in the game\'s Roles window.`,
    '',
    '## How roles work',
    '',
    '- **The built-in roles cannot be edited.** Each is marked read-only once it is built, and adding or removing a capability on a read-only role does nothing. A role you add yourself starts with one capability, `LoginOnServer`, and you choose the rest.',
    '- **Where they are kept.** The roles live in the server\'s database. At start-up the server builds the built-in roles, then loads the roles you added.',
    `- **Default roles.** The server keeps a default role for each kind of account. Out of the box: ${roles.flatMap(r => r.defaultFor.map(d => `${code(d)} is ${code(r.name)}`)).join(', ')}.`,
    '- **Single player in debug mode** grants every capability; a dedicated server never does that.',
    '',
    proofLine('zombie.characters.Roles#addStatic (the built-in roles, their capabilities, descriptions and defaults), #init (built-in roles first, then the database), #addRole (a new role gets LoginOnServer); zombie.characters.Role#addCapability (does nothing on a read-only role), #hasCapability and #isUsingDebugMode', data),
    '',
    '## The built-in roles',
    '',
    '| Role | The game\'s description | Capabilities | Default for |',
    '|---|---|---|---|',
  ]
  for (const r of roles) {
    const capText = r.allCapabilities ? (r.removed.length ? `all except ${r.removed.map(code).join(', ')}` : 'all') : fmt(r.capabilities.length)
    body.push(`| ${code(r.name)} | ${quoteText(r.description)} | ${capText} | ${r.defaultFor.map(code).join(', ') || '-'} |`)
  }
  body.push('')
  const setAccess = data.commands.find(c => c.names.includes('setaccesslevel'))
  if (setAccess?.help && /overseer/i.test(setAccess.help) && !roles.some(r => r.name === 'overseer')) {
    body.push(`The help text of \`/setaccesslevel\` still names an "Overseer" level, but no built-in role is called that in ${data.build}: the default for overseers (${code('defaultForOverseer')}) is ${code(roles.find(r => r.defaultFor.includes('defaultForOverseer'))?.name ?? '?')}.`, '')
  }
  body.push(
    '## Which role has which capability',
    '',
    `Every capability in ${data.build}, the game\'s description of it, the built-in roles that hold it (Y), and the commands that need it. [Where each capability is checked](${SITE_BASE}/roles-and-access/where-each-capability-is-checked) lists the code that reads each one.`,
    '',
    `| Capability | ${roles.map(r => r.name).join(' | ')} | Commands | The game\'s description |`,
    `|---|${roles.map(() => '---').join('|')}|---|---|`,
  )
  for (const c of data.capabilities) {
    body.push(`| ${code(c.name)} | ${roles.map(r => (r.capabilities.includes(c.name) ? 'Y' : '')).join(' | ')} | ${c.commands.map(n => code(`/${n}`)).join(', ')} | ${c.tooltip ? quoteText(c.tooltip) : ''} |`)
  }
  body.push('')
  return page(
    {
      slug,
      title: `Roles and capabilities (Build ${data.build})`,
      category: 'roles-and-access',
      excerpt: `The ${fmt(roles.length)} built-in roles of Build ${data.build}, what each may do, and all ${fmt(data.capabilities.length)} capabilities with the commands that need them.`,
      tags: ['server', 'admin', 'roles', 'generated'],
      difficulty: 'beginner',
      related,
    },
    body,
    data,
  )
}

function capabilityChecksPage(data: ServerSurface, notes: Notes, related: string[]): Page {
  const slug = 'where-each-capability-is-checked'
  const body: string[] = [
    '# Where each capability is checked',
    '',
    generatedNotice(data),
    `For each of the ${fmt(data.capabilities.length)} capabilities, the places in the Java and the vanilla Lua that check it. Commands are listed with the command instead (their capability is part of the command\'s declaration). A capability with no check here and no command does nothing by itself in ${data.build}.`,
    '',
  ]
  for (const c of data.capabilities) {
    body.push(`### ${c.name}`, '')
    if (c.tooltip) body.push(`- **The game's description:** ${quoteText(c.tooltip)}`)
    body.push(`- **Built-in roles:** ${c.roles.map(code).join(', ') || 'none'}`)
    if (c.commands.length) body.push(`- **Commands that need it:** ${c.commands.map(n => code(`/${n}`)).join(', ')}`)
    body.push(c.reads.length ? `- **Checked in:** ${siteList(c.reads)}.` : '- **Checked in:** no other place.')
    const n = noteFor(notes.capabilities, c.name)
    if (n) body.push(`- **What the code does with it:** ${n.effect}`)
    body.push('')
  }
  body.push(proofLine('zombie.characters.Capability (the list), media/lua/shared/Translate/EN/IG_UI.json (IGUI_CapabilitiesTooltips_<name>), and the Capability.<name> references named under each entry', data), '')
  return page(
    {
      slug,
      title: `Where each capability is checked (Build ${data.build})`,
      category: 'roles-and-access',
      excerpt: `Every Build ${data.build} capability with the Java and Lua code that checks it.`,
      tags: ['server', 'admin', 'roles', 'reference', 'generated'],
      difficulty: 'advanced',
      related,
    },
    body,
    data,
  )
}

// ---------------------------------------------------------------------------------------
// The whole output
// ---------------------------------------------------------------------------------------

/** The numbers the pages publish (the tests recount them independently). */
export function publishedCounts(data: ServerSurface) {
  const so = data.serverOptions
  const sb = data.sandboxOptions
  const n = <T>(xs: T[], f: (x: T) => boolean) => xs.filter(f).length
  return {
    serverOptions: so.length,
    serverOptionsOnNoPage: n(so, o => !o.page),
    serverOptionsRead: n(so, o => o.status === 'read'),
    serverOptionsReadNowhere: n(so, o => o.status === 'none'),
    serverReadSites: so.reduce((k, o) => k + o.reads.length, 0),
    sandboxOptions: sb.length,
    sandboxOptionsRead: n(sb, o => o.status === 'read'),
    sandboxOptionsComputedOnly: n(sb, o => o.status === 'computed'),
    sandboxOptionsNamedOnly: n(sb, o => o.status === 'named'),
    sandboxOptionsReadNowhere: n(sb, o => o.status === 'none'),
    sandboxReadSites: sb.reduce((k, o) => k + o.reads.length, 0),
    sandboxWriteSites: sb.reduce((k, o) => k + o.writes.length, 0),
    sandboxDefaultDiffersFromJava: n(sb, o => o.default !== o.javaDefault),
    commands: data.commands.length,
    commandsDisabled: n(data.commands, c => c.disabled),
    roles: data.roles.length,
    capabilities: data.capabilities.length,
  }
}

export interface Output {
  pages: Page[]
  /** extra files: path relative to the section folder -> content */
  files: Map<string, string>
}

export function validateNotes(data: ServerSurface, notes: Notes): void {
  const check = (kind: string, key: string, n: Note, sites: Site[], allowDeclaration: boolean) => {
    if (!n.effect || !n.effect.trim()) throw new Error(`${kind} note ${key}: empty effect`)
    if (n.site === 'declaration' && allowDeclaration) return
    if (!sites.some(s => siteKey(s) === n.site)) throw new Error(`${kind} note ${key}: site ${n.site} is not one of its sites`)
  }
  for (const [k, n] of Object.entries(notes.serverOptions)) {
    const o = data.serverOptions.find(x => x.name === k)
    if (!o) throw new Error(`note for unknown server option ${k}`)
    check('server option', k, n, [...o.reads, ...o.writes, ...o.named], true)
  }
  for (const [k, n] of Object.entries(notes.sandboxOptions)) {
    const o = data.sandboxOptions.find(x => x.name === k)
    if (!o) throw new Error(`note for unknown sandbox option ${k}`)
    check('sandbox option', k, n, [...o.reads, ...o.writes, ...o.computed, ...o.named], true)
  }
  for (const [k, n] of Object.entries(notes.commands)) {
    const c = data.commands.find(x => x.names[0] === k)
    if (!c) throw new Error(`note for unknown command ${k}`)
    check('command', k, n, c.actsIn ? [c.actsIn] : [], false)
  }
  for (const [k, n] of Object.entries(notes.capabilities)) {
    const c = data.capabilities.find(x => x.name === k)
    if (!c) throw new Error(`note for unknown capability ${k}`)
    check('capability', k, n, c.reads, false)
  }
}

export function generate(data: ServerSurface, notes: Notes): Output {
  validateNotes(data, notes)
  const serverSlugs = ['server-options-directory', ...SERVER_GROUPS.map(g => g.slug)]
  const sandboxSlugs = ['sandbox-options-directory', ...SANDBOX_GROUPS.map(g => g.slug)]
  const rel = (self: string, own: string[], extra: string[]) => [INDEX_SLUG, ...own.filter(s => s !== self).slice(0, 3), ...extra].filter((s, i, a) => s !== self && a.indexOf(s) === i)
  const pages: Page[] = [
    serverDirectoryPage(data, rel('server-options-directory', serverSlugs, ['sandbox-options-directory'])),
    ...SERVER_GROUPS.map(g => serverGroupPage(g, data, notes, rel(g.slug, serverSlugs, ['server-options-directory']))),
    sandboxDirectoryPage(data, rel('sandbox-options-directory', sandboxSlugs, ['server-options-directory'])),
    ...SANDBOX_GROUPS.map(g => sandboxGroupPage(g, data, notes, rel(g.slug, sandboxSlugs, ['sandbox-options-directory']))),
    commandsPage(data, notes, rel('admin-commands', [], ['server-roles-and-capabilities', 'server-options-directory'])),
    rolesPage(data, rel('server-roles-and-capabilities', [], ['where-each-capability-is-checked', 'admin-commands'])),
    capabilityChecksPage(data, notes, rel('where-each-capability-is-checked', [], ['server-roles-and-capabilities', 'admin-commands'])),
  ]
  const files = new Map<string, string>()
  files.set(
    '_section.json',
    JSON.stringify(
      {
        name: 'Running a Server',
        description: `For server owners: every server option, sandbox option, admin command and role in Build ${data.build.split('.')[0]}, generated from the code, with where the game reads each one.`,
        icon: 'database',
        displayOrder: 6,
      },
      null,
      2,
    ) + '\n',
  )
  const descriptions: Record<CategoryId, string> = {
    'server-options': `Generated from the Build ${data.build} code: all ${fmt(data.serverOptions.length)} server ini options with default, range and where the game reads each.`,
    'sandbox-options': `Generated from the Build ${data.build} code: all ${fmt(data.sandboxOptions.length)} sandbox options with defaults, presets and where the game reads each.`,
    'admin-commands': `Generated from the Build ${data.build} code: every server command, its forms and the capability it needs.`,
    'roles-and-access': `Generated from the Build ${data.build} code: the built-in roles and every capability, with where each is checked.`,
  }
  for (const [id, c] of Object.entries(CATEGORIES) as [CategoryId, (typeof CATEGORIES)[CategoryId]][]) {
    files.set(`${id}/_category.json`, JSON.stringify({ name: c.name, description: descriptions[id], icon: c.icon, displayOrder: c.displayOrder }, null, 2) + '\n')
  }
  for (const p of pages) files.set(`${p.category}/${p.file}`, p.content)
  return { pages, files }
}

// ---------------------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------------------

function main(): void {
  const argv = process.argv.slice(2)
  const get = (k: string) => {
    const i = argv.indexOf(k)
    return i >= 0 ? argv[i + 1] : undefined
  }
  const dataPath = get('--data') ?? path.join(REPO_ROOT, 'scripts', 'kb', 'data', `server-surface-${DEFAULT_BUILD}.json`)
  const notesPath = get('--notes') ?? path.join(REPO_ROOT, 'scripts', 'kb', 'data', `server-handbook-notes-${DEFAULT_BUILD}.json`)
  const outDir = get('--out') ?? path.join(REPO_ROOT, 'content', 'articles', 'pz', 'build-42', SECTION)
  const check = argv.includes('--check')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as ServerSurface
  const notes = JSON.parse(fs.readFileSync(notesPath, 'utf-8')) as Notes
  const out = generate(data, notes)
  const managed = Object.keys(CATEGORIES)
  if (check) {
    let bad = 0
    for (const [f, content] of out.files) {
      const p = path.join(outDir, ...f.split('/'))
      // line endings are not content: a Windows checkout may hold the committed files as CRLF
      if (!fs.existsSync(p) || fs.readFileSync(p, 'utf-8').replace(/\r\n/g, '\n') !== content) {
        console.log(`[ERROR] out of date: ${f}`)
        bad++
      }
    }
    for (const dir of managed) {
      const d = path.join(outDir, dir)
      if (!fs.existsSync(d)) continue
      for (const f of fs.readdirSync(d)) if (!out.files.has(`${dir}/${f}`)) {
        console.log(`[ERROR] not generated by this data: ${dir}/${f}`)
        bad++
      }
    }
    console.log(bad ? `[ERROR] ${bad} file(s) differ` : `[COMPLETE] ${out.files.size} files match the data`)
    process.exit(bad ? 1 : 0)
  }
  for (const [f, content] of out.files) {
    const p = path.join(outDir, ...f.split('/'))
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, content)
  }
  for (const dir of managed) {
    const d = path.join(outDir, dir)
    for (const f of fs.readdirSync(d)) if (!out.files.has(`${dir}/${f}`)) console.log(`[WARN] ${dir}/${f} is in the folder but not generated by this data`)
  }
  for (const p of out.pages) console.log(`[OK] ${p.category}/${p.file} (${Buffer.byteLength(p.content, 'utf-8')} bytes)`)
  console.log(`[COMPLETE] ${out.pages.length} articles, _section.json and ${managed.length} _category.json written to ${path.relative(REPO_ROOT, outDir).split(path.sep).join('/')}`)
}

if (require.main === module) main()
