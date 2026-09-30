// Build pzmap2dzi map description entries for B42 map mods under the local Workshop
// folder, so render.ps1's -ModMaps can hand them to pzmap2dzi as overlay pyramids.
//
//   npx tsx scripts/tiles/describe-mod-maps.ts --steam-id <id> [--steam-id <id> ...]
//     [--map <mapFolderName> ...] [--mod-root <path>] [--out <file>]
//
// B42 loads nothing from a mod's root media/ (that is the B41 layout). A map folder
// only counts here if it sits under mods/<mod>/42/media/maps/<map> (checked first) or
// mods/<mod>/common/media/maps/<map>, and holds at least one .lotheader file. A folder
// under the mod's root media/maps/<map> is recorded separately, only to explain a
// refusal: it exists, but only in the B41 layout, so it cannot be rendered as-is.
//
// --map (repeatable) is optional. Given, it both FILTERS the output to those map
// names, in the order given, and VALIDATES every one of them was found - the task's
// "refuse when a named map is not found, or is found only in the B41 layout" rule.
// Omitted, every B42 map folder found under the given steam ids is emitted.
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

export interface ModMapEntry {
  mapName: string
  modName: string
  steamId: string
  mapPath: string
  texture: boolean
  texturePath?: string
}

/** Thrown for every refusal case: not found, found only in B41, or an ambiguous name. */
export class ModMapError extends Error {}

function toPosix(p: string): string {
  return p.replace(/\\/g, '/')
}

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

function subdirs(p: string): string[] {
  if (!isDir(p)) return []
  return readdirSync(p, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
}

/** A map folder only counts as real map data if it holds at least one .lotheader file
 *  directly inside it - an empty or placeholder folder is not a map. */
function hasLotheader(mapDir: string): boolean {
  if (!isDir(mapDir)) return false
  return readdirSync(mapDir).some((f) => f.toLowerCase().endsWith('.lotheader'))
}

/** Any .pack file directly under a texturepacks folder (pzmap2dzi's own default
 *  texture_files pattern is '.*[.]pack', i.e. every .pack file, unfiltered). */
function hasPackFiles(texturePath: string): boolean {
  if (!isDir(texturePath)) return false
  return readdirSync(texturePath).some((f) => f.toLowerCase().endsWith('.pack'))
}

// Checked in this order: 42/media/maps first, then common/media/maps. Both are valid
// B42 layouts; root media/maps (B41) is handled separately, never emitted.
const B42_LAYOUTS = ['42', 'common'] as const

/** One mod's map folders found under the two valid B42 layouts. */
function findModMapsInMod(modDir: string, modName: string, steamId: string): ModMapEntry[] {
  const entries: ModMapEntry[] = []
  for (const layout of B42_LAYOUTS) {
    const mapsDir = join(modDir, layout, 'media', 'maps')
    for (const mapName of subdirs(mapsDir)) {
      const mapPath = join(mapsDir, mapName)
      if (!hasLotheader(mapPath)) continue
      const texturePath = join(modDir, layout, 'media', 'texturepacks')
      const texture = hasPackFiles(texturePath)
      entries.push({
        mapName,
        modName,
        steamId,
        mapPath: toPosix(mapPath),
        texture,
        texturePath: texture ? toPosix(texturePath) : undefined,
      })
    }
  }
  return entries
}

/** Map folder names that exist ONLY under the mod's root media/maps (B41 layout),
 *  for the refusal message - never emitted as a renderable entry. */
function findB41OnlyMapNames(modDir: string): string[] {
  const mapsDir = join(modDir, 'media', 'maps')
  return subdirs(mapsDir).filter((name) => hasLotheader(join(mapsDir, name)))
}

export interface DescribeOptions {
  modRoot: string
  steamIds: string[]
  /** Map folder names from the owner's Map= line, in Map= order. Filters and validates
   *  when given; every B42 map map found is returned, unfiltered, when omitted. */
  wantedMaps?: string[]
}

export function describeModMaps(opts: DescribeOptions): ModMapEntry[] {
  const { modRoot, steamIds, wantedMaps } = opts
  const found: ModMapEntry[] = []
  const b41OnlyOwner = new Map<string, string>() // map name -> owning mod name

  for (const steamId of steamIds) {
    const modsDir = join(modRoot, steamId, 'mods')
    for (const modName of subdirs(modsDir)) {
      const modDir = join(modsDir, modName)
      found.push(...findModMapsInMod(modDir, modName, steamId))
      for (const b41Name of findB41OnlyMapNames(modDir)) {
        if (!b41OnlyOwner.has(b41Name)) b41OnlyOwner.set(b41Name, modName)
      }
    }
  }

  // pzmap2dzi keys map description entries by map name (the value passed to -ModMaps
  // and to conf.yaml's mod_maps list) - two different mods or steam ids producing the
  // same map name would silently collide in the generated file, so refuse instead.
  const byName = new Map<string, ModMapEntry>()
  for (const entry of found) {
    const existing = byName.get(entry.mapName)
    if (existing && (existing.steamId !== entry.steamId || existing.modName !== entry.modName)) {
      throw new ModMapError(
        `map name '${entry.mapName}' found under more than one mod (steam id ${existing.steamId}/${existing.modName} ` +
          `and ${entry.steamId}/${entry.modName}); pzmap2dzi keys entries by map name and needs a unique one`,
      )
    }
    byName.set(entry.mapName, entry)
  }

  if (!wantedMaps || wantedMaps.length === 0) {
    return [...byName.values()].sort((a, b) => a.mapName.localeCompare(b.mapName))
  }

  const result: ModMapEntry[] = []
  for (const name of wantedMaps) {
    const entry = byName.get(name)
    if (entry) {
      result.push(entry)
      continue
    }
    if (b41OnlyOwner.has(name)) {
      throw new ModMapError(
        `map '${name}' (mod ${b41OnlyOwner.get(name)}) is only in the B41 layout (media/maps); ` +
          `B42 needs mods/*/42/media/maps or mods/*/common/media/maps`,
      )
    }
    throw new ModMapError(`map '${name}' not found under any given steam id in ${modRoot}`)
  }
  return result
}

/**
 * The id a map is known by from here on: its pzmap2dzi description key, the name passed
 * to render.ps1 -ModMaps, its output folder (html/map_data/mod_maps/<id>), the published
 * folder (map/tiles/mod_maps/<id>) and the overlay id in tiles.json. Map folder names
 * carry spaces and commas ("Constown, KY", "Raven Creek B42"), which do not belong in a
 * folder name that becomes part of a web address, so the id is a plain slug: lower case,
 * every run of other characters turned into one hyphen.
 */
export function mapId(mapName: string): string {
  const id = mapName.toLowerCase().replace(/[^a-z0-9_]+/g, '-').replace(/^-+|-+$/g, '')
  if (!id) throw new ModMapError(`map name '${mapName}' has no letters or digits to make an id from`)
  return id
}

/** YAML single-quoted scalar: the only escape is a doubled quote. */
function q(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

/** pzmap2dzi's own map-description text format (see conf/vanilla.txt, conf/default_b42.txt
 *  in the pzmap2dzi clone): one YAML mapping per map, keyed by its id (mapId). Every
 *  string is quoted, since map and mod names may hold spaces, commas and quotes. */
export function formatModMapsFile(entries: ModMapEntry[]): string {
  const lines: string[] = ['# Generated by scripts/tiles/describe-mod-maps.ts. Do not hand-edit.', '']
  const seen = new Map<string, string>()
  for (const e of entries) {
    const id = mapId(e.mapName)
    const clash = seen.get(id)
    if (clash !== undefined) throw new ModMapError(`maps '${clash}' and '${e.mapName}' both make the id '${id}'`)
    seen.set(id, e.mapName)
    lines.push(`${id}:`)
    lines.push(`    display_name: ${q(e.mapName)}`)
    lines.push(`    mod_name: ${q(e.modName)}`)
    lines.push(`    steam_id: ${q(e.steamId)}`)
    lines.push(`    map_name: ${q(e.mapName)}`)
    lines.push(`    map_path: ${q(e.mapPath)}`)
    if (e.texture) {
      lines.push('    texture: true')
      lines.push(`    texture_path: ${q(e.texturePath ?? '')}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function args(name: string): string[] {
  const out: string[] = []
  const argv = process.argv
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === name && i + 1 < argv.length) out.push(argv[i + 1])
  }
  return out
}

function arg(name: string): string | undefined {
  const all = args(name)
  return all.length ? all[all.length - 1] : undefined
}

const DEFAULT_MOD_ROOT = 'R:/Games/Steam/steamapps/workshop/content/108600'

function main() {
  const steamIds = args('--steam-id')
  const wantedMaps = args('--map')
  const modRoot = arg('--mod-root') ?? DEFAULT_MOD_ROOT
  const out = resolve(arg('--out') ?? 'scripts/tiles/mod-maps/server-maps.txt')

  if (steamIds.length === 0) {
    console.error(
      'usage: describe-mod-maps.ts --steam-id <id> [--steam-id <id> ...] [--map <name> ...] [--mod-root <path>] [--out <file>]',
    )
    process.exit(1)
  }

  let entries: ModMapEntry[] = []
  try {
    entries = describeModMaps({ modRoot, steamIds, wantedMaps: wantedMaps.length ? wantedMaps : undefined })
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }

  if (entries.length === 0) {
    console.error(`no B42 map folders found under ${modRoot} for steam ids: ${steamIds.join(', ')}`)
    process.exit(1)
  }

  const text = formatModMapsFile(entries)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, text)
  console.log(`wrote ${out}`)
  for (const e of entries) {
    console.log(`  ${mapId(e.mapName)}  <- '${e.mapName}' (mod ${e.modName}, steam_id ${e.steamId})${e.texture ? ' [texture]' : ''}`)
  }
}

if (process.argv[1] && (process.argv[1].endsWith('describe-mod-maps.ts') || process.argv[1].endsWith('describe-mod-maps.js'))) {
  main()
}
