#!/usr/bin/env tsx
/**
 * Generate the Build 42 Lua reference articles from the extracted surface data.
 *
 * Reads  scripts/kb/data/lua-surface-<build>.json        (written by scripts/kb/extract/extract-lua-surface.ts)
 *        scripts/kb/data/lua-reference-notes-<build>.json (hand-written notes, each tied to a call site)
 * Writes content/articles/pz/build-42/modding/reference/*.md and its _category.json.
 *
 * Output is a pure function of the two inputs: no dates, no randomness, sorted everywhere,
 * so a re-run writes byte-identical files.
 *
 * Usage (from the repo root):
 *   npm run kb:gen-ref                       # write the articles
 *   npm run kb:gen-ref -- --check            # exit 1 if the articles on disk are not what the data gives
 *   npx tsx scripts/kb/gen-lua-reference.ts --data <json> --notes <json> --out <folder>
 */

import fs from 'fs'
import path from 'path'

const REPO_ROOT = path.resolve(__dirname, '..', '..')
const DEFAULT_BUILD = '42.21'
const SITE_BASE = '/pz/build-42/modding/reference'

/** Largest rendered class page, in bytes, before an area is split into parts. */
export const CLASS_PAGE_CAP = 150_000

// ---------------------------------------------------------------------------------------
// Data shapes
// ---------------------------------------------------------------------------------------

type Side = 'client' | 'server' | 'both' | 'single-player' | 'unknown'

interface EventArg {
  type: string | null
  name?: string
}

interface EventSite {
  lang: 'java' | 'lua'
  where: string
  in: string
  line: number
  side: Side
  singlePlayer: boolean | null
  basis: string[]
  args: EventArg[]
}

interface EventData {
  name: string
  registered: boolean
  addedByLua?: { where: string; line: number }[]
  side: Side | 'not fired'
  partial: boolean
  sites: EventSite[]
}

/** [type] or [type, name] */
type Param = [string] | [string, string]

interface MethodData {
  name: string
  static?: boolean
  params: Param[]
  returns: string
  from?: string
}

interface ClassData {
  name: string
  kind: string
  debugOnly: boolean
  disallowed: boolean
  exposedBy: string
  superclass: string | null
  interfaces: string[]
  exposedAncestors: string[]
  methodCount: number
  objectMethods: number
  hiddenMethods: number
  bridgeMethodsSkipped: number
  inheritedFromExposed: Record<string, number>
  methods: MethodData[]
  staticFields: { name: string; type: string; enumConstant: boolean }[]
  constructors: { params: Param[] }[]
}

interface GlobalData {
  name: string
  overloads: { params: Param[]; returns: string; javaName: string }[]
}

export interface SurfaceData {
  build: string
  revision: string
  steamBuild: string
  capture: string
  captureSealed: string
  sources: Record<string, string>
  sideRules: string[]
  counts: Record<string, number>
  changesSincePreviousBuild?: Record<string, { added: string[]; removed: string[] }>
  previousBuild?: { build: string; revision: string }
  hooks: string[]
  dynamicTriggerSites: { where: string; in: string; line: number }[]
  events: EventData[]
  globals: GlobalData[]
  classes: ClassData[]
}

export interface Notes {
  events: Record<string, { when: string; source: string }>
  globals: Record<string, { note: string; source: string }>
  /** Build-specific prose for the index, written for this build only. */
  index: {
    /** Extra bullets for "What changed", after the generated added/removed lists. */
    changes: string[]
    /** Where the reflection ban comes from, as far as our captures show. */
    reflectionHistory: string
  }
}

// ---------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------

/** `java.util.ArrayList<zombie.characters.IsoPlayer>` -> `ArrayList<IsoPlayer>`; nested `$` -> `.` */
export function shortType(t: string): string {
  return t.replace(/(?:[A-Za-z_][\w]*\.)+([A-Za-z_][\w$]*)/g, (_m, last: string) => last).replace(/\$/g, '.')
}

/** Simple name of a binary class name, nested classes joined with dots. */
export function simpleName(binary: string): string {
  return binary.split('.').pop()!.replace(/\$/g, '.')
}

export function packageOf(binary: string): string {
  const parts = binary.split('$')[0].split('.')
  return parts.slice(0, -1).join('.')
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

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${fmt(n)} ${n === 1 ? one : many}`
}

function code(s: string): string {
  return s.includes('`') ? `\`\` ${s} \`\`` : `\`${s}\``
}

function paramText(p: Param): string {
  return p.length === 2 ? `${shortType(p[0])} ${p[1]}` : shortType(p[0])
}

function signature(name: string, params: Param[], returns?: string): string {
  const sig = `${name}(${params.map(paramText).join(', ')})`
  return returns === undefined ? sig : `${sig}: ${shortType(returns)}`
}

function yamlString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

interface Front {
  slug: string
  title: string
  excerpt: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  related: string[]
}

function frontmatter(f: Front, data: SurfaceData): string {
  return [
    '---',
    `slug: ${f.slug}`,
    `title: ${yamlString(f.title)}`,
    'game: pz',
    'version: build-42',
    'section: modding',
    'category: reference',
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

function generatedNotice(data: SurfaceData, isIndex = false): string {
  const where = isIndex ? 'at the end of this page' : `on [the reference index](${SITE_BASE}/lua-reference)`
  return [
    `> **Generated from the code.** This page is generated from Build ${data.build} (revision ${data.revision}) by \`npm run kb:gen-ref\`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are ${where}.`,
    '',
  ].join('\n')
}

function proofLine(citation: string, data: SurfaceData): string {
  return `> **Proof:** Code. ${citation}. Build ${data.build} (revision ${data.revision}).`
}

// ---------------------------------------------------------------------------------------
// Areas
// ---------------------------------------------------------------------------------------

interface Area {
  slug: string
  title: string
  prefixes: string[]
  intro: string
}

/** Class areas, first match wins (longest prefixes are listed in the most specific area). */
export const CLASS_AREAS: Area[] = [
  {
    slug: 'characters',
    title: 'Characters, players, zombies and animals',
    prefixes: ['zombie.characters'],
    intro: 'Everything that walks: players, zombies, animals, their bodies, stats, skills, moodles and traits. If your mod touches a character, the class you want is probably here.',
  },
  {
    slug: 'world',
    title: 'The world: squares, objects, map and weather',
    prefixes: [
      'zombie.iso', 'zombie.erosion', 'zombie.worldMap', 'zombie.world', 'zombie.basements', 'zombie.randomizedWorld',
      'zombie.buildingRooms', 'zombie.tileDepth', 'zombie.seams', 'zombie.seating', 'zombie.spriteModel', 'zombie.MapGroups',
      'zombie.popman', 'zombie.pathfind', 'zombie.globalObjects',
    ],
    intro: 'The map and what sits on it: grid squares, tile objects, buildings and rooms, the world map, erosion, weather and the randomized stories.',
  },
  {
    slug: 'items',
    title: 'Items and inventory',
    prefixes: ['zombie.inventory'],
    intro: 'Inventory items, their types (food, weapons, clothing, literature and the rest) and the containers that hold them.',
  },
  {
    slug: 'entities',
    title: 'Entities, components and crafting',
    prefixes: ['zombie.entity'],
    intro: 'The Build 42 entity system: components, crafting, building, fluids and energy as the code models them.',
  },
  {
    slug: 'scripts',
    title: 'Script objects',
    prefixes: ['zombie.scripting'],
    intro: 'The objects the script parser builds from the files in media/scripts: item scripts, recipes, vehicle scripts and the script manager that holds them.',
  },
  {
    slug: 'vehicles',
    title: 'Vehicles',
    prefixes: ['zombie.vehicles'],
    intro: 'Cars and their parts, from the vehicle itself to the part and the scripts that describe it.',
  },
  {
    slug: 'ai-and-combat',
    title: 'AI states and combat',
    prefixes: ['zombie.ai', 'zombie.combat'],
    intro: 'The state machine that drives characters (each state a class) and the combat helpers.',
  },
  {
    slug: 'ui-and-input',
    title: 'UI and input',
    prefixes: ['zombie.ui', 'zombie.input', 'zombie.text', 'zombie.gizmo'],
    intro: 'The Java side of the user interface (the elements vanilla Lua builds its windows from), fonts and text, keyboard, mouse and controllers.',
  },
  {
    slug: 'sound-and-radio',
    title: 'Sound and radio',
    prefixes: [
      'zombie.audio', 'zombie.radio', 'zombie.SoundManager', 'zombie.DummySoundManager', 'zombie.AmbientStreamManager',
      'zombie.BaseAmbientStreamManager', 'zombie.GameSounds', 'zombie.WorldSoundManager', 'fmod',
    ],
    intro: 'Sounds, the sounds zombies hear, music, and the radio and television broadcasts.',
  },
  {
    slug: 'network',
    title: 'Multiplayer, network and chat',
    prefixes: ['zombie.network', 'zombie.chat', 'zombie.spnetwork'],
    intro: 'The multiplayer side: server options, packets the Lua side can see, factions, safehouses as the network knows them, and chat.',
  },
  {
    slug: 'game-and-core',
    title: 'Game, core and utilities',
    prefixes: ['zombie'],
    intro: 'The game itself: Core, the game time, sandbox options, game states, the Lua manager, debug options and the utility classes.',
  },
  {
    slug: 'java-and-libraries',
    title: 'Java and library classes',
    prefixes: ['java', 'org', 'se'],
    intro: 'Standard Java classes (lists, maps, numbers, files) and library classes (JOML vectors, the Kahlua runtime) that the game hands to Lua.',
  },
]

function startsWithPrefix(binary: string, prefix: string): boolean {
  return binary === prefix || binary.startsWith(prefix + '.') || binary.startsWith(prefix + '$')
}

export function areaOf(binary: string): Area {
  let best: Area | null = null
  let bestLen = -1
  for (const a of CLASS_AREAS) {
    for (const p of a.prefixes) {
      if (startsWithPrefix(binary, p) && p.length > bestLen) {
        best = a
        bestLen = p.length
      }
    }
  }
  if (!best) throw new Error(`no class area for ${binary}`)
  return best
}

interface EventArea {
  key: string
  title: string
  intro: string
  match: (e: EventData) => boolean
}

/** The Java call site that places an event in an area: the first one outside the Lua glue (zombie.Lua), else the first. */
function firstJavaSite(e: EventData): EventSite | undefined {
  const java = e.sites.filter(s => s.lang === 'java')
  return java.find(s => !startsWithPrefix(s.where, 'zombie.Lua')) ?? java[0]
}

const javaPkg = (prefixes: string[]) => (e: EventData) => {
  const s = firstJavaSite(e)
  return !!s && prefixes.some(p => startsWithPrefix(s.where, p))
}

export const EVENT_AREAS: EventArea[] = [
  {
    key: 'lifecycle',
    title: 'Game start, loading, saving and time',
    intro: 'Events from the game states, the game window and the clock: boot, start, load, save, and the every-minute, every-hour and every-day ticks.',
    match: javaPkg(['zombie.gameStates', 'zombie.GameWindow', 'zombie.GameTime', 'zombie.core', 'zombie.SandboxOptions', 'zombie.world', 'zombie.modding']),
  },
  {
    key: 'characters',
    title: 'Characters, players and zombies',
    intro: 'Events fired from the character classes: updates, damage, death, skills and XP, clothing and equipment.',
    match: javaPkg(['zombie.characters', 'zombie.ai', 'zombie.combat', 'zombie.util.AddCoopPlayer']),
  },
  {
    key: 'world',
    title: 'The world, objects and weather',
    intro: 'Events fired from the map code: squares, tile objects, containers in the world, buildings, the world map, weather and fire.',
    match: javaPkg(['zombie.iso', 'zombie.erosion', 'zombie.worldMap', 'zombie.randomizedWorld', 'zombie.basements', 'zombie.globalObjects', 'zombie.buildingRooms', 'zombie.popman', 'zombie.pathfind']),
  },
  {
    key: 'items',
    title: 'Items, inventory, crafting and vehicles',
    intro: 'Events fired from the inventory, entity, crafting, script and vehicle code.',
    match: javaPkg(['zombie.inventory', 'zombie.entity', 'zombie.scripting', 'zombie.vehicles']),
  },
  {
    key: 'network',
    title: 'Multiplayer and network',
    intro: 'Events fired from the network code: packets arriving, commands between client and server, connection, factions, safehouses and trading.',
    match: javaPkg(['zombie.network', 'zombie.spnetwork', 'zombie.chat']),
  },
  {
    key: 'ui',
    title: 'UI, input, sound and radio',
    intro: 'Events fired from the UI manager, the keyboard and controllers, sound, and the radio.',
    match: javaPkg(['zombie.ui', 'zombie.input', 'zombie.radio', 'zombie.audio']),
  },
  {
    key: 'other',
    title: 'Other engine code',
    intro: 'Events fired from the rest of the engine, including the Lua glue itself (the global functions in LuaManager).',
    match: javaPkg(['zombie', 'se', 'java', 'org']),
  },
  {
    key: 'lua',
    title: 'Fired only from vanilla Lua',
    intro: 'Events that no Java code fires: the vanilla Lua scripts fire them with `triggerEvent`, mostly from the UI and timed actions. Mods can fire them the same way.',
    match: e => e.sites.length > 0 && !firstJavaSite(e),
  },
  {
    key: 'never',
    title: 'Registered but never fired',
    intro: 'The game registers these names at start-up, so `Events.Name.Add` works, but in this build neither the Java code nor the vanilla Lua fires them. A handler added to one of them runs only if a mod fires the event itself.',
    match: e => e.sites.length === 0,
  },
]

export function eventAreaOf(e: EventData): EventArea {
  const a = EVENT_AREAS.find(x => x.match(e))
  if (!a) throw new Error(`no event area for ${e.name}`)
  return a
}

// ---------------------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------------------

export interface Page {
  file: string
  slug: string
  title: string
  content: string
}

const SIDE_WORDS: Record<Side, string> = {
  client: 'client',
  server: 'server',
  both: 'client and server',
  'single-player': 'single player only',
  unknown: 'unknown',
}

function siteSideText(s: EventSite): string {
  if (s.side === 'unknown') return 'side unknown (no guard at the call, and the class does not decide it)'
  let t = SIDE_WORDS[s.side]
  if (s.side === 'client' || s.side === 'server') t += s.singlePlayer ? ', and in single player' : ', multiplayer only'
  return `${t}; ${s.basis.join('; ')}`
}

/** One-line side summary of an event, counting its call sites. */
export function eventSideSummary(e: EventData): string {
  if (e.sites.length === 0) return 'not fired in this build'
  const counts = new Map<string, number>()
  for (const s of e.sites) {
    let k = SIDE_WORDS[s.side]
    if ((s.side === 'client' || s.side === 'server') && s.singlePlayer) k += ' (and single player)'
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const parts = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (parts.length === 1) return `${parts[0][0]} (${plural(e.sites.length, 'call site')})`
  return parts.map(([k, n]) => `${k} at ${plural(n, 'call site')}`).join(', ')
}

function argText(a: EventArg): string {
  const t = a.type === null ? '?' : shortType(a.type)
  return a.name ? `${t} ${a.name}` : t
}

function siteWhere(s: EventSite): string {
  if (s.lang === 'java') return `${code(`${simpleName(s.where)}#${s.in}`)} (Java, ${code(packageOf(s.where))}, line ${s.line})`
  return `${code(s.in)} in ${code(`media/lua/${s.where}`)} (Lua, line ${s.line})`
}

function renderEvent(e: EventData, notes: Notes): string {
  const out: string[] = [`### ${e.name}`, '']
  const facts: string[] = []
  facts.push(`**Side:** ${eventSideSummary(e)}.`)
  if (!e.registered) {
    facts.push(
      e.addedByLua
        ? `**Registered by vanilla Lua,** not at start-up: ${e.addedByLua.map(a => code(`media/lua/${a.where}`)).join(', ')} calls \`LuaEventManager.AddEvent\`.`
        : '**Not registered at start-up.** The game creates the event the first time something fires it, so a handler added before that is attached by name only once it exists.',
    )
  }
  const argSets = new Set(e.sites.map(s => s.args.length))
  if (e.sites.length > 0 && argSets.size === 1) {
    const n = e.sites[0].args.length
    // same count everywhere: show the first site whose types are all known, else the first
    const best = e.sites.find(s => s.args.every(a => a.type !== null)) ?? e.sites[0]
    facts.push(n === 0 ? '**Arguments:** none.' : `**Arguments (${n}):** ${best.args.map(a => code(argText(a))).join(', ')}.`)
  } else if (e.sites.length > 0) {
    facts.push('**Arguments:** differ between call sites; see each site below.')
  }
  const note = notes.events[e.name]
  if (note) facts.push(`**When:** ${note.when}`)
  out.push(facts.join(' '), '')
  if (e.sites.length > 0) {
    const showArgs = argSets.size > 1
    for (const s of e.sites) {
      const args = showArgs ? ` Arguments: ${s.args.length ? s.args.map(a => code(argText(a))).join(', ') : 'none'}.` : ''
      out.push(`- ${siteWhere(s)}: ${siteSideText(s)}.${args}`)
    }
    out.push('')
  }
  return out.join('\n')
}

function eventsPage(data: SurfaceData, notes: Notes, related: string[]): Page {
  const slug = 'lua-events'
  const c = publishedCounts(data)
  const body: string[] = []
  body.push(`# Lua events in Build ${data.build}`, '')
  body.push(generatedNotice(data))
  body.push(
    `Outcast, events are how your mod hears about the game: you hand a function to \`Events.OnSomething.Add(fn)\` and the game calls it when it fires that event. This page lists every event Build ${data.build} registers (${fmt(c.eventsRegistered)}) and every other event name that the Java code or the vanilla Lua fires (${fmt(c.eventsFiredNotRegistered)} more), with each place that fires it.`,
    '',
    'For each event you get:',
    '',
    '- **Side:** where the call that fires it runs, counted per call site. "client" means wherever a player is playing; "server" means the multiplayer server; "single player only" means both multiplayer flags are off. "unknown" means the call has no multiplayer guard and its class does not settle it, so it may run on either side: we do not guess. The full rules are on [the reference index](' +
      `${SITE_BASE}/lua-reference#which-side-fires-an-event).`,
    '- **Arguments:** the Java types at the call, and the variable name where the call passes a plain variable. A `?` is an expression whose type the extractor could not read from the declarations around the call.',
    '- **When:** only where we read the call site and it makes the timing clear. Everywhere else the page says only where the event is fired from, and the method name is your best clue.',
    '- **Fired from:** the class and method (Java) or the file and function (vanilla Lua), with the line in that build.',
    '',
    `Of the ${fmt(c.eventSites)} call sites, ${fmt(c.eventSitesUnknown)} have an unknown side; ${fmt(c.eventsAllUnknown)} events have no call site with a known side.`,
    '',
    proofLine(`zombie.Lua.LuaEventManager#AddEvents, every LuaEventManager.triggerEvent call in the Java code, every triggerEvent call in media/lua`, data),
    '',
  )
  for (const area of EVENT_AREAS) {
    const evs = data.events.filter(e => eventAreaOf(e) === area)
    if (evs.length === 0) continue
    body.push(`## ${area.title}`, '', `${area.intro} (${plural(evs.length, 'event')})`, '')
    for (const e of evs) body.push(renderEvent(e, notes))
  }
  if (data.dynamicTriggerSites.length) {
    body.push(
      '## Fired with a name chosen at run time',
      '',
      `${plural(data.dynamicTriggerSites.length, 'call site')} fire an event whose name is not written in the code, so they cannot be tied to one event. They are the global \`triggerEvent\` functions that vanilla Lua and mods call:`,
      '',
    )
    for (const s of data.dynamicTriggerSites) body.push(`- ${code(`${simpleName(s.where)}#${s.in}`)} (line ${s.line})`)
    body.push('')
  }
  if (data.hooks.length) {
    body.push(
      '## Hooks are not events',
      '',
      `The game also keeps ${plural(data.hooks.length, 'hook')} in \`LuaHookManager\`: ${data.hooks.map(h => code(h)).join(', ')}. A hook gives an answer back: \`LuaHookManager.TriggerHook\` returns true or false from the Lua handlers, and the Java code that called it branches on that answer. An event returns nothing. They are listed here so you can tell the two apart; they are not in the event list.`,
      '',
      proofLine('zombie.Lua.LuaHookManager#AddEvents and #TriggerHook', data),
      '',
    )
  }
  const content =
    frontmatter(
      {
        slug,
        title: `Lua Events (Build ${data.build})`,
        excerpt: `Every Lua event in Build ${data.build}, generated from the code: where each one is fired, on which side, and with which arguments.`,
        tags: ['lua-api', 'events', 'reference', 'generated'],
        difficulty: 'intermediate',
        related,
      },
      data,
    ) + body.join('\n')
  return { file: `${slug}.md`, slug, title: `Lua Events (Build ${data.build})`, content: content.replace(/\n+$/, '\n') }
}

function globalsPage(data: SurfaceData, notes: Notes, related: string[]): Page {
  const slug = 'lua-global-functions'
  const body: string[] = []
  body.push(`# Lua global functions in Build ${data.build}`, '')
  body.push(generatedNotice(data))
  body.push(
    `These ${fmt(data.globals.length)} functions are in the Lua global table from the moment the game starts: call them by name, no \`require\`, no object. They all live in one Java class, \`LuaManager.GlobalObject\`, where each carries \`@LuaMethod(global = true)\`. ${fmt(publishedCounts(data).globalOverloads)} Java methods stand behind the ${fmt(data.globals.length)} names, because some names have more than one form (overloads): the game picks the one whose parameters match what you pass.`,
    '',
    'Types are the Java types: a `String` is a Lua string, `int`, `float`, `double` and their boxed forms are Lua numbers, `boolean` is a Lua boolean, `KahluaTable` is a Lua table, and every other type is a Java object you call methods on. Parameter names come from the decompiled source; a parameter shown with a type only had no single matching declaration to take a name from.',
    '',
    'A note follows a function only where the name does not say enough and we read what the code does.',
    '',
    proofLine('zombie.Lua.LuaManager$GlobalObject, the methods with @LuaMethod(global = true), as LuaJavaClassExposer#exposeGlobalFunctions reads them', data),
    '',
  )
  let letter = ''
  for (const g of data.globals) {
    const l = g.name[0].toUpperCase()
    if (l !== letter) {
      letter = l
      body.push('', `## ${/[A-Z]/.test(l) ? l : 'Other'}`, '')
    }
    const note = notes.globals[g.name]
    const sigs = g.overloads.map(o => code(signature(g.name, o.params, o.returns)))
    body.push(`- ${sigs.join(' or ')}${note ? ` - ${note.note}` : ''}`)
  }
  body.push('')
  const content =
    frontmatter(
      {
        slug,
        title: `Lua Global Functions (Build ${data.build})`,
        excerpt: `All ${fmt(data.globals.length)} global Lua functions of Build ${data.build}, with their parameter and return types, generated from the code.`,
        tags: ['lua-api', 'reference', 'generated'],
        difficulty: 'intermediate',
        related,
      },
      data,
    ) + body.join('\n')
  return { file: `${slug}.md`, slug, title: `Lua Global Functions (Build ${data.build})`, content: content.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n') }
}

/** Where each class is published: page slug and anchor. Filled while class pages are planned. */
type ClassIndex = Map<string, { slug: string; anchor: string; page: string }>

function renderClass(c: ClassData, index: ClassIndex, area: Area, pageSlug: string): string {
  const name = simpleName(c.name)
  const out: string[] = [`### ${name}`, '']
  const link = (binary: string) => {
    const at = index.get(binary)
    if (!at) return code(simpleName(binary))
    return at.slug === pageSlug ? `[${simpleName(binary)}](#${at.anchor})` : `[${simpleName(binary)}](${SITE_BASE}/${at.slug}#${at.anchor})`
  }
  const head: string[] = [`${code(c.name.replace(/\$/g, '.'))}, ${c.kind}.`]
  if (c.superclass && c.superclass !== 'java.lang.Object' && c.superclass !== 'java.lang.Enum' && c.superclass !== 'java.lang.Record')
    head.push(`Extends ${index.has(c.superclass) ? link(c.superclass) : code(shortType(c.superclass))}.`)
  if (c.debugOnly) head.push('**Exposed only when the game runs in debug mode.**')
  const inherited = Object.entries(c.inheritedFromExposed)
  if (inherited.length) head.push(`Also has the methods of ${inherited.map(([b, n]) => `${link(b)} (${fmt(n)})`).join(', ')}, listed on their own entries.`)
  out.push(head.join(' '), '')
  const inst = c.methods.filter(m => !m.static)
  const stat = c.methods.filter(m => m.static)
  if (inst.length) {
    out.push(`Methods, called as \`obj:name(...)\`:`, '')
    for (const m of inst) out.push(`- ${code(signature(m.name, m.params, m.returns))}${m.from ? ` from ${code(simpleName(m.from))}` : ''}`)
    out.push('')
  }
  if (stat.length) {
    out.push(`Static functions, called as \`${name}.name(...)\`:`, '')
    for (const m of stat) out.push(`- ${code(signature(m.name, m.params, m.returns))}${m.from ? ` from ${code(simpleName(m.from))}` : ''}`)
    out.push('')
  }
  if (c.constructors.length) {
    out.push(`Constructors: ${c.constructors.map(k => code(signature(`${name}.new`, k.params))).join(', ')}.`, '')
  }
  const enums = c.staticFields.filter(f => f.enumConstant)
  const fields = c.staticFields.filter(f => !f.enumConstant)
  if (enums.length) out.push(`Enum values (read as \`${name}.VALUE\`): ${enums.map(f => code(f.name)).join(', ')}.`, '')
  if (fields.length)
    out.push(`Static fields (a copy of the value taken when the class is exposed): ${fields.map(f => code(`${f.name}: ${shortType(f.type)}`)).join(', ')}.`, '')
  if (!inst.length && !stat.length && !c.constructors.length && !c.staticFields.length && !inherited.length)
    out.push('No methods of its own beyond those every Java object has.', '')
  void area
  return out.join('\n')
}

interface ClassPagePlan {
  area: Area
  part: number
  parts: number
  slug: string
  title: string
  classes: ClassData[]
}

function classPageSlug(area: Area, part: number, parts: number): string {
  return parts === 1 ? `lua-classes-${area.slug}` : `lua-classes-${area.slug}-${part}`
}

function classPageTitle(area: Area, part: number, parts: number, build: string): string {
  return `Lua Classes: ${area.title}${parts > 1 ? `, part ${part} of ${parts}` : ''} (Build ${build})`
}

/** Plan class pages: per area, in binary-name order, split at class boundaries under the cap. */
export function planClassPages(data: SurfaceData): ClassPagePlan[] {
  const plans: ClassPagePlan[] = []
  // size with links as long as any real one will be, so a planned page never ends up over the cap
  const sizingIndex: ClassIndex = new Map()
  const longest = Math.max(...CLASS_AREAS.map(a => `lua-classes-${a.slug}-99`.length))
  for (const c of data.classes) sizingIndex.set(c.name, { slug: 'x'.repeat(longest), anchor: simpleName(c.name).toLowerCase().replace(/[^a-z0-9_-]/g, '') + '-9', page: '' })
  for (const area of CLASS_AREAS) {
    const cls = data.classes.filter(c => areaOf(c.name) === area)
    if (cls.length === 0) continue
    const groups: ClassData[][] = [[]]
    let size = 0
    for (const c of cls) {
      const n = Buffer.byteLength(renderClass(c, sizingIndex, area, ''), 'utf-8')
      if (size > 0 && size + n > CLASS_PAGE_CAP) {
        groups.push([])
        size = 0
      }
      groups[groups.length - 1].push(c)
      size += n
    }
    groups.forEach((g, i) =>
      plans.push({
        area,
        part: i + 1,
        parts: groups.length,
        slug: classPageSlug(area, i + 1, groups.length),
        title: classPageTitle(area, i + 1, groups.length, data.build),
        classes: g,
      }),
    )
  }
  return plans
}

function classIndexOf(plans: ClassPagePlan[]): ClassIndex {
  const index: ClassIndex = new Map()
  for (const p of plans) {
    const slugger = new Slugger()
    // the page's own headings come first; reserve them so class anchors get the right counter
    for (const h of pageFixedHeadings()) slugger.slug(h)
    for (const c of p.classes) index.set(c.name, { slug: p.slug, anchor: slugger.slug(simpleName(c.name)), page: p.title })
  }
  return index
}

/** Headings every class page carries before its classes (they take anchors first). */
function pageFixedHeadings(): string[] {
  return ['How to read this page', 'Classes']
}

function classPage(plan: ClassPagePlan, index: ClassIndex, data: SurfaceData, related: string[]): Page {
  const pkgs = [...new Set(plan.classes.map(c => packageOf(c.name)))].sort()
  const methods = plan.classes.reduce((n, c) => n + c.methods.length, 0)
  const body: string[] = []
  body.push(`# ${plan.title.replace(/ \(Build [^)]*\)$/, '')}`, '')
  body.push(generatedNotice(data))
  body.push(
    plan.area.intro,
    '',
    `This page holds ${plural(plan.classes.length, 'class', 'classes')} and ${plural(methods, 'method')}${plan.parts > 1 ? `, part ${plan.part} of ${plan.parts} of this area (from ${code(simpleName(plan.classes[0].name))} to ${code(simpleName(plan.classes[plan.classes.length - 1].name))})` : ''}, from ${pkgs.length === 1 ? 'the package' : 'the packages'} ${pkgs.map(code).join(', ')}.`,
    '',
    proofLine(`zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them`, data),
    '',
    '## How to read this page',
    '',
    '- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.',
    '- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.',
    '- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.',
    '- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.',
    '- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.',
    '- Types are shortened to the class name; the full name of each exposed class is under its heading.',
    '',
    '## Classes',
    '',
  )
  for (const c of plan.classes) body.push(renderClass(c, index, plan.area, plan.slug))
  const content =
    frontmatter(
      {
        slug: plan.slug,
        title: plan.title,
        excerpt: `The exposed ${plan.area.title.toLowerCase()} classes of Build ${data.build}${plan.parts > 1 ? ` (part ${plan.part} of ${plan.parts})` : ''}: every method Lua can call, with parameter and return types, generated from the code.`,
        tags: ['lua-api', 'reference', 'generated', 'classes'],
        difficulty: 'advanced',
        related,
      },
      data,
    ) + body.join('\n')
  return { file: `${plan.slug}.md`, slug: plan.slug, title: plan.title, content: content.replace(/\n+$/, '\n') }
}

function directoryPage(plans: ClassPagePlan[], index: ClassIndex, data: SurfaceData, related: string[]): Page {
  const slug = 'lua-class-directory'
  const body: string[] = []
  body.push(`# Lua class directory, A to Z`, '')
  body.push(generatedNotice(data))
  body.push(
    `Every class Build ${data.build} exposes to Lua, in alphabetical order, with the page it is on. Use your browser's find (Ctrl+F) for a class name.`,
    '',
    proofLine('zombie.Lua.LuaManager$Exposer#exposeAll and the setExposed helpers it calls', data),
    '',
  )
  const sorted = [...data.classes].sort((a, b) => simpleName(a.name).localeCompare(simpleName(b.name)) || a.name.localeCompare(b.name))
  let letter = ''
  for (const c of sorted) {
    const l = simpleName(c.name)[0].toUpperCase()
    if (l !== letter) {
      letter = l
      body.push('', `## ${l}`, '')
    }
    const at = index.get(c.name)!
    body.push(`- [${simpleName(c.name)}](${SITE_BASE}/${at.slug}#${at.anchor}) ${code(packageOf(c.name))}${c.debugOnly ? ' (debug mode only)' : ''}`)
  }
  body.push('')
  void plans
  const content =
    frontmatter(
      {
        slug,
        title: `Lua Class Directory (Build ${data.build})`,
        excerpt: `All ${fmt(data.classes.length)} classes Build ${data.build} exposes to Lua, A to Z, each linked to its entry.`,
        tags: ['lua-api', 'reference', 'generated', 'classes'],
        difficulty: 'intermediate',
        related,
      },
      data,
    ) + body.join('\n')
  return { file: `${slug}.md`, slug, title: `Lua Class Directory (Build ${data.build})`, content: content.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n') }
}

/** The numbers the index publishes, computed from the data (the tests compare them). */
export function publishedCounts(data: SurfaceData) {
  return {
    exposedClasses: data.classes.length,
    exposedClassesDebugOnly: data.classes.filter(x => x.debugOnly).length,
    methodsListed: data.classes.reduce((n, x) => n + x.methods.length, 0),
    globalFunctions: data.globals.length,
    globalOverloads: data.globals.reduce((n, g) => n + g.overloads.length, 0),
    eventsRegistered: data.events.filter(e => e.registered).length,
    eventsFiredNotRegistered: data.events.filter(e => !e.registered).length,
    eventsNeverFired: data.events.filter(e => e.registered && e.sites.length === 0).length,
    eventSites: data.events.reduce((n, e) => n + e.sites.length, 0),
    eventSitesUnknown: data.events.reduce((n, e) => n + e.sites.filter(s => s.side === 'unknown').length, 0),
    eventsAllUnknown: data.events.filter(e => e.sites.length > 0 && e.sites.every(s => s.side === 'unknown')).length,
    hooks: data.hooks.length,
  }
}

function indexPage(data: SurfaceData, notes: Notes, plans: ClassPagePlan[], related: string[]): Page {
  const slug = 'lua-reference'
  const p = publishedCounts(data)
  const ch = data.changesSincePreviousBuild
  const prev = (kind: string, now: number) => (ch?.[kind] ? now - ch[kind].added.length + ch[kind].removed.length : null)
  const prevClasses = prev('exposed class', p.exposedClasses)
  const prevGlobals = prev('global function', p.globalFunctions)
  const prevEvents = prev('event', p.eventsRegistered)
  const pb = data.previousBuild
  const prevLabel = pb ? `Build ${pb.build}` : 'previous build'
  const body: string[] = []
  body.push(`# The Build ${data.build} Lua reference`, '')
  body.push(generatedNotice(data, true))
  body.push(
    `Outcast, everything your mod does goes through what the engine hands to Lua. In Build ${data.build} that is ${fmt(p.exposedClasses)} Java classes, ${fmt(p.globalFunctions)} global functions and ${fmt(p.eventsRegistered)} events. We generate the whole surface from the code, so it is complete by construction and regenerated after every update. These pages are the result. They hold names, types and where things are called from. They never quote the game's code.`,
    '',
    '## The pages',
    '',
    `- [Lua events](${SITE_BASE}/lua-events): all ${fmt(p.eventsRegistered + p.eventsFiredNotRegistered)} events with where each is fired, on which side, and its arguments.`,
    `- [Lua global functions](${SITE_BASE}/lua-global-functions): all ${fmt(p.globalFunctions)} with their signatures.`,
    `- [Lua class directory](${SITE_BASE}/lua-class-directory): every exposed class, A to Z, linked to its entry.`,
    '- The exposed classes, by area:',
  )
  for (const pl of plans) body.push(`  - [${pl.area.title}${pl.parts > 1 ? `, part ${pl.part} of ${pl.parts}` : ''}](${SITE_BASE}/${pl.slug}) (${plural(pl.classes.length, 'class', 'classes')})`)
  body.push(
    '',
    '## How Lua reaches Java',
    '',
    'The game runs your Lua in Kahlua, a Lua interpreter written in Java. Lua cannot see a Java class until the game hands it over. That happens once, at start-up, in `LuaManager.Exposer.exposeAll()`: it puts a fixed list of classes into a set with `setExposed(SomeClass.class)`, then walks the set and builds a Lua table for each class. A class that is not in the set does not exist for Lua, even when you hold an object of that class: you get the object, but none of its methods.',
    '',
    'For each class in the set, Kahlua does four things:',
    '',
    '- **Instance methods.** It asks Java for the class\'s public methods (`Class.getMethods()`), which includes every public method inherited from parent classes and interfaces, interface default methods included. Each one becomes callable as `obj:method(...)`.',
    '- **Static methods.** The public static methods go into a table named after the class, so you call `ClassName.method(...)`.',
    '- **Static fields.** Public static fields are copied into the same table as values, once. Enum values arrive this way: `BodyPartType.Foot_L` is a static field of the enum.',
    '- **Constructors.** Public constructors become `ClassName.new(...)`.',
    '',
    'Global functions are separate: Kahlua scans the methods of one object, `LuaManager.GlobalObject`, and every method marked `@LuaMethod(global = true)` becomes a global Lua function under the annotation\'s name.',
    '',
    proofLine('zombie.Lua.LuaManager$Exposer#exposeAll; se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeLikeJava, #exposeMethods, #exposeStatics, #exposeGlobalFunctions (read from the game jar)', data),
    '',
    '## Why Lua sees methods and not fields',
    '',
    'Look at that list again: instance methods, static methods, static fields, constructors. Instance fields are not on it. Kahlua never exposes a field of an object, public or not. So `player.someField` reads `nil` with no error, even when the Java field is public, and a mod built on it silently does nothing. Use the getter: `player:getSomething()`. If there is no getter, Lua cannot read the value.',
    '',
    'Static fields are copied once, when the class is exposed. If the game changes a static field later, Lua still holds the old value. Again, use a getter when there is one.',
    '',
    proofLine('se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods (Class.getMethods, instance methods only) and #exposeStatics (Class.getFields, static only, value read once with Field.get)', data),
    '',
    '## What "exposed" means here',
    '',
    `- **In the set.** A class is exposed when \`exposeAll\` (or one of the two helpers it calls, \`BuildingRoomsEditor.setExposed\` and \`UIWorldMap.setExposed\`) puts it in the set. That gives ${fmt(p.exposedClasses)} classes.`,
    `- **Debug only.** ${fmt(p.exposedClassesDebugOnly)} of them (\`Field\`, \`Method\`, \`Coroutine\`) are added only when the game runs in debug mode, so a normal game exposes ${fmt(p.exposedClasses - p.exposedClassesDebugOnly)}. They are listed, and marked.`,
    '- **@HiddenFromLua.** A method, field or constructor carrying this annotation is skipped, and a class carrying it is never exposed. The `@UsedFromLua` annotation you see in the code marks intent only: the exposer never reads it.',
    '- **Inherited.** Because the exposer uses `getMethods()`, a method declared in a parent class or interface that is not exposed itself still works on the exposed class. Our class pages list those in full, marked with where they come from.',
    '- **Refused.** Classes in `java.lang.reflect`, `java.lang.invoke` and class loaders are refused even if something adds them (in debug mode `Field` and `Method` are let through).',
    '',
    proofLine('se.krka.kahlua.integration.expose.LuaJavaClassExposer#isDisallowed and #exposeMethods; zombie.Lua.LuaManager$Exposer#exposeAll', data),
    '',
    '## The reflection ban',
    '',
    'Some older mods reach private Java fields through reflection. In the current code the seven global functions that do it (`getNumClassFunctions`, `getClassFunction`, `getNumClassFields`, `getClassField`, `getClassFieldVal`, `getMethodParameter`, `getMethodParameterCount`) call `LuaManager.validateReflectionAccess` first, which throws "Not in debug" unless the game runs in debug mode, and refuses `Class`, `ClassLoader` and method-handle lookups even then. On a normal game, and on every server not in debug mode, reflection from Lua is off. ' + notes.index.reflectionHistory,
    '',
    proofLine('zombie.Lua.LuaManager#validateReflectionAccess and its 7 call sites in zombie.Lua.LuaManager$GlobalObject', data),
    '',
    '## The numbers',
    '',
    `| | Build ${data.build} | ${prevLabel} |`,
    '|---|---|---|',
    `| Exposed classes | ${fmt(p.exposedClasses)} (${fmt(p.exposedClassesDebugOnly)} in debug mode only) | ${prevClasses === null ? '-' : fmt(prevClasses)} |`,
    `| Methods listed on the class pages | ${fmt(p.methodsListed)} | - |`,
    `| Global functions | ${fmt(p.globalFunctions)} (${fmt(p.globalOverloads)} Java methods) | ${prevGlobals === null ? '-' : fmt(prevGlobals)} |`,
    `| Events registered at start-up | ${fmt(p.eventsRegistered)} | ${prevEvents === null ? '-' : fmt(prevEvents)} |`,
    `| Other event names fired by Java or vanilla Lua | ${fmt(p.eventsFiredNotRegistered)} | - |`,
    `| Registered events nothing fires | ${fmt(p.eventsNeverFired)} | - |`,
    `| Event call sites | ${fmt(p.eventSites)} (${fmt(p.eventSitesUnknown)} with an unknown side) | - |`,
    `| Hooks | ${fmt(p.hooks)} | - |`,
    '',
    'The methods listed are each class\'s own methods plus those it inherits from parents that are not exposed; methods inherited from an exposed parent are counted once, on the parent.' + (pb ? ` Build ${pb.build} (revision ${pb.revision}) is counted the same way, by our engine diff between the two builds.` : ''),
    '',
  )
  if (ch) {
    body.push(`## What changed since ${pb ? pb.build : 'the previous build'}`, '')
    const names = (xs: string[]) => (xs.length ? xs.map(code).join(', ') : 'none')
    body.push(
      `- **Classes added:** ${names(ch['exposed class'].added)}. Removed: ${names(ch['exposed class'].removed)}.`,
      `- **Global functions added:** ${names(ch['global function'].added)}. Removed: ${names(ch['global function'].removed)}. A mod still calling a removed function now stops with an error when it calls it.`,
      `- **Events added:** ${names(ch.event.added)}. Removed: ${names(ch.event.removed)}.`,
      ...notes.index.changes.map(c => `- ${c}`),
      '',
      proofLine('zombie.Lua.LuaManager$Exposer#exposeAll, zombie.Lua.LuaEventManager#AddEvents and the @LuaMethod(global = true) methods, counted in both builds and compared', data),
      '',
    )
  }
  body.push(
    '## Which side fires an event',
    '',
    'In multiplayer, the server and each client run their own copy of the game, and an event fires only in the process whose code reached the call. For each call site the extractor decides the side by these rules, in this order:',
    '',
    ...data.sideRules.map((r, i) => `${i + 1}. ${r}`),
    '',
    `Rule 2's last sentence is the only inference. Everything else is read from the code. With these rules, ${fmt(p.eventSitesUnknown)} of the ${fmt(p.eventSites)} call sites, and ${fmt(p.eventsAllUnknown)} events (all of their call sites), stay "unknown". That is honest, not a gap we filled: an unguarded call in shared code can run wherever its caller runs, and following every caller is a bigger job than one page. When the side matters to your mod, test on a dedicated server and read the server's log.`,
    '',
    proofLine('zombie.network.GameServer (loads media/lua/client with the checksum-only flag, so the dedicated server never runs it), zombie.gameStates.GameLoadingState (loads media/lua/server on clients), and the guards at each call site', data),
    '',
    '## How the pages are split',
    '',
    `- Events and global functions are one page each.`,
    `- Classes are grouped by area, by Java package (for example \`zombie.characters\` is "Characters", \`zombie.iso\` and the other map packages are "The world"). An area whose class entries would pass ${fmt(CLASS_PAGE_CAP / 1000)} kB is cut into parts at class boundaries, in package order, so a page stays quick to load and every class is whole on one page. A single class bigger than that gets a part of its own.`,
    '- The directory lists every class A to Z with a link to its entry.',
    '',
    '## How this is made, and how to regenerate it',
    '',
    'Two scripts in the wiki repository do it, and you can read them:',
    '',
    '1. `scripts/kb/extract/extract-lua-surface.ts` runs against a local copy of the game\'s decompiled code. It reads the class list from `exposeAll`, then asks Java itself (reflection on the game jar, the same calls Kahlua makes) for the methods, fields and constructors of each class. It finds every place an event is fired, in the Java code and in the vanilla Lua, and judges the side as above. It writes one data file, `scripts/kb/data/lua-surface-' + data.build + '.json`, with names, types, counts and locations only.',
    '2. `scripts/kb/gen-lua-reference.ts` turns that data file into these pages: `npm run kb:gen-ref`. A short hand-written notes file next to the data adds the "when" notes, each tied to the call site we read.',
    '',
    'After a game update: re-capture the engine, run the extractor against the new capture, run `npm run kb:gen-ref`, and the pages describe the new build.',
    '',
  )
  const content =
    frontmatter(
      {
        slug,
        title: `The Build ${data.build} Lua Reference`,
        excerpt: `How Lua reaches the Java engine in Build ${data.build}, and the complete generated reference: ${fmt(p.exposedClasses)} classes, ${fmt(p.globalFunctions)} global functions, ${fmt(p.eventsRegistered)} events.`,
        tags: ['lua-api', 'reference', 'events', 'generated'],
        difficulty: 'intermediate',
        related,
      },
      data,
    ) + body.join('\n')
  return { file: `${slug}.md`, slug, title: `The Build ${data.build} Lua Reference`, content: content.replace(/\n+$/, '\n') }
}

export interface Output {
  pages: Page[]
  category: string
}

export function generate(data: SurfaceData, notes: Notes): Output {
  const plans = planClassPages(data)
  const index = classIndexOf(plans)
  const allSlugs = ['lua-reference', 'lua-events', 'lua-global-functions', 'lua-class-directory', ...plans.map(p => p.slug)]
  const rel = (self: string, extra: string[] = []) => [...allSlugs.filter(s => s !== self).slice(0, 4), ...extra].filter((s, i, a) => s !== self && a.indexOf(s) === i)
  const pages: Page[] = [
    indexPage(data, notes, plans, rel('lua-reference', ['the-events-system', 'engine-internals-calling-exposed-java-from-lua'])),
    eventsPage(data, notes, rel('lua-events', ['the-events-system'])),
    globalsPage(data, notes, rel('lua-global-functions')),
    directoryPage(plans, index, data, rel('lua-class-directory')),
    ...plans.map(p => classPage(p, index, data, rel(p.slug))),
  ]
  const category =
    JSON.stringify(
      {
        name: 'Lua Reference',
        description: `Generated from the Build ${data.build} code: every Lua event, global function and exposed class, with types and call sites.`,
        icon: 'book',
        displayOrder: 15,
      },
      null,
      2,
    ) + '\n'
  return { pages, category }
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
  const dataPath = get('--data') ?? path.join(REPO_ROOT, 'scripts', 'kb', 'data', `lua-surface-${DEFAULT_BUILD}.json`)
  const notesPath = get('--notes') ?? path.join(REPO_ROOT, 'scripts', 'kb', 'data', `lua-reference-notes-${DEFAULT_BUILD}.json`)
  const outDir = get('--out') ?? path.join(REPO_ROOT, 'content', 'articles', 'pz', 'build-42', 'modding', 'reference')
  const check = argv.includes('--check')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as SurfaceData
  const notes = JSON.parse(fs.readFileSync(notesPath, 'utf-8')) as Notes
  for (const k of Object.keys(notes.events)) if (!data.events.some(e => e.name === k)) throw new Error(`note for unknown event ${k}`)
  for (const k of Object.keys(notes.globals)) if (!data.globals.some(g => g.name === k)) throw new Error(`note for unknown global ${k}`)
  const out = generate(data, notes)
  const files = new Map<string, string>(out.pages.map(p => [p.file, p.content]))
  files.set('_category.json', out.category)
  if (check) {
    let bad = 0
    for (const [f, content] of files) {
      const p = path.join(outDir, f)
      if (!fs.existsSync(p) || fs.readFileSync(p, 'utf-8') !== content) {
        console.log(`[ERROR] out of date: ${f}`)
        bad++
      }
    }
    if (fs.existsSync(outDir))
      for (const f of fs.readdirSync(outDir)) if (!files.has(f)) {
        console.log(`[ERROR] not generated by this data: ${f}`)
        bad++
      }
    console.log(bad ? `[ERROR] ${bad} file(s) differ` : `[COMPLETE] ${files.size} files match the data`)
    process.exit(bad ? 1 : 0)
  }
  fs.mkdirSync(outDir, { recursive: true })
  for (const [f, content] of files) fs.writeFileSync(path.join(outDir, f), content)
  for (const f of fs.readdirSync(outDir)) if (!files.has(f)) console.log(`[WARN] ${f} is in the folder but not generated by this data`)
  for (const p of out.pages) console.log(`[OK] ${p.file} (${Buffer.byteLength(p.content, 'utf-8')} bytes)`)
  console.log(`[COMPLETE] ${out.pages.length} articles and _category.json written to ${path.relative(REPO_ROOT, outDir).split(path.sep).join('/')}`)
}

if (require.main === module) main()
