#!/usr/bin/env tsx
/**
 * "Made by Dystopian Outcasts" data generator
 *
 * Reads the Workshop folders of the community's own mods that run on the server and
 * writes the list the home page shows, plus a small poster image per mod.
 *
 * Inputs:
 *   R:/Games/Steam/steamapps/workshop/content/108600/<wsid>/mods/<folder>/
 *     (mod.info and poster*.png/jpg sit at that level or under a 42/ subfolder;
 *      override the Steam path with the WORKSHOP_ROOT environment variable)
 *
 * Outputs:
 *   packages/web/src/data/ourMods.json              one entry per mod:
 *                                                   { id, workshopId, name, group, blurb, poster }
 *   packages/web/public/assets/mods/<id>.webp       poster, 320 px wide at most, quality 80
 *
 * The mod list below is the owner's list (2026-10-02). OutcastAurora, OutcastLib and
 * OutcastStowAll are deliberately not on it. A Workshop id whose folder or mod.info id
 * does not match is reported and skipped, never guessed; the script then exits 1.
 *
 * Names come from mod.info, tidied (lib/ourMods.ts tidyName), with NAME_OVERRIDES for the
 * ones mod.info gets wrong. Blurbs come from mod.info description=, cleaned and cut to
 * one sentence; where that is empty or only repeats the name, the sentence in DERIVED is
 * used, written only from what the mod's files show, and the entry carries
 * "blurbSource": "derived" so it can be reviewed.
 *
 * Posters are resized with sharp when it is installed, else with Python Pillow. A poster
 * is never enlarged; a mod without one gets "poster": null.
 *
 * Re-runnable: it rewrites its outputs from scratch each time, and only when there are no
 * problems (a missing id, a blurb over 140 characters); on any problem it exits 1 and
 * leaves the existing outputs alone.
 *
 * Usage:
 *   npx tsx scripts/build-our-mods.ts     (or: npm run our-mods)
 *
 * Run from the repository root.
 */

import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFileSync } from 'child_process'
import { tidyName, type ModGroup, type OurMod } from '../packages/web/src/lib/ourMods'

const WORKSHOP_ROOT = process.env.WORKSHOP_ROOT || 'R:/Games/Steam/steamapps/workshop/content/108600'
const ROOT = process.cwd()
const WEB = path.join(ROOT, 'packages', 'web')
const OUT_JSON = path.join(WEB, 'src', 'data', 'ourMods.json')
const OUT_POSTERS = path.join(WEB, 'public', 'assets', 'mods')
const POSTER_WIDTH = 320
const POSTER_QUALITY = 80
const MAX_BLURB = 140

const LIST: Array<[ModGroup, string, string]> = [
  ['Outcast', 'OutcastUpright', '3778988335'],
  ['Outcast', 'OutcastProximity', '3778987974'],
  ['Outcast', 'OutcastHusbandry', '3778967781'],
  ['Outcast', 'OutcastHearing', '3778967689'],
  ['Outcast', 'OutcastSawAll', '3777720992'],
  ['Outcast', 'OutcastRipAll', '3777620871'],
  ['Outcast', 'OutcastLightLoad', '3777386409'],
  ['Outcast', 'OutcastLadders', '3777373070'],
  ['Outcast', 'OutcastPunch', '3775742087'],
  ['Outcast', 'OutcastMotors', '3782914142'],
  ['Outcast', 'OutcastMotorsAnimated', '3782914294'],
  ['Outcast', 'OutcastMotorsUI', '3782915479'],
  ['Dystopian', 'DystopianQoL', '3777144094'],
  ['Dystopian', 'DystopianNexus', '3781342201'],
  ['Dystopian', 'DystopianArsenal', '3781355461'],
  ['Dystopian', 'DystopianMusic', '3781343221'],
  ['Dystopian', 'dystopianvehicleclaim', '3783625977'],
  ['Dystopian', 'DystopianVehicleRespawn', '3786016611'],
  ['Dystopian', 'DystopianAutos', '3786624763'],
  ['Dystopian', 'DystopianBioFuel', '3787137446'],
  ['Dystopian', 'DystopianCrossbow', '3787699430'],
  ['Dystopian', 'DystopianGym', '3788852762'],
  ['Dystopian', 'DystopianTraits', '3794104910'],
  ['Dystopian', 'DystopianVehicleBuilder', '3798218860'],
  ['Dystopian', 'DystopianSpearFishing', '3798907324'],
  ['Dystopian', 'DystopianTinkering', '3799704805'],
  ['Dystopian', 'DystopianTransit', '3809923895'],
  ['Dystopian', 'MRAPMC', '3801434536'],
  ['Cosmic', 'CosmicSolar', '3792538685'],
  ['Cosmic', 'CosmicLoadout', '3793798119'],
  ['Squirrelly Industries', 'SquirrellyIndustries', '3797845758'],
]

/** Names mod.info gets wrong, with the reason kept in the output. */
const NAME_OVERRIDES: Record<string, { name: string; note: string }> = {
  CosmicLoadout: { name: 'Cosmic Loadout', note: 'mod.info name is "UIoverhaul"' },
  MRAPMC: { name: 'MRAP Mine Clearer', note: 'mod.info name is "MRAPMC"' },
}

/** Blurbs written from the mod's files, where mod.info says nothing useful. */
const DERIVED: Record<string, string> = {
  DystopianCrossbow: 'Adds a Crossbow skill.',
  // mod.info description, shortened (media/lua/client: DQOL_HealthHud, DQOL_StatPanel, DQOL_PryOpen, DQOL_DismantleVehicle)
  DystopianQoL: 'Adds weapon and health HUD indicators, a player stat panel, crowbar prying and vehicle dismantling.',
  // mod.info description, shortened (media/lua/server: DVR_Sweep.lua, DVR_Spawn.lua)
  DystopianVehicleRespawn: 'Removes vehicles left unseen for too long and replaces them nearby, on the server.',
  // mod.info description, shortened (media/lua: DT_TinkerCore.lua, DT_TinkerContextMenu.lua)
  DystopianTinkering: 'Adds a Tinkering skill for re-working melee weapons with randomized tiered affixes.',
  // mod.info description, reworded (media/lua: DT_ContextMenu.lua, DystopianTransit/)
  DystopianTransit: 'Lets an admin place bus stops that players use to teleport between stops.',
  MRAPMC: 'Adds an MRAP mine clearer vehicle.',
  // mod.info description, shortened
  DystopianVehicleBuilder: 'Lets experienced mechanics build and spawn stripped vehicles from an Automotive Building Kit.',
  // media/scripts: TapeDystopianItems.txt (302 items) and VinylDystopianItems.txt (12 items)
  DystopianMusic: 'Adds more than 300 cassette tapes and 12 vinyl records to play in the game.',
  // media/scripts: Arsenal_Weapons.txt (14 items), Arsenal_Bags.txt (22 items); media/clothing: hats, masks, armour
  DystopianArsenal: 'Adds 14 weapons, 22 bags and a range of clothing, from hats and masks to armour sets.',
  // media/scripts/DystopianTraits_character_traits.txt (58 definitions); UI_EN.txt names
  DystopianTraits: 'Adds 58 character traits to the server, including Survivor, Medic, Butcher and Mortician.',
  // media/lua/client: DO_HelpButton.lua, DO_HelpUI.lua, DO_DeathLogPanel.lua
  DystopianNexus: 'Adds an icon that opens an in-game help window and a death log panel.',
}

function readModInfo(modDir: string): { file: string; fields: Record<string, string> } | null {
  const file = [path.join(modDir, '42', 'mod.info'), path.join(modDir, 'mod.info')].find((p) => fs.existsSync(p))
  if (!file) return null
  const fields: Record<string, string> = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z]+)\s*=(.*)$/)
    if (m && !(m[1].toLowerCase() in fields)) fields[m[1].toLowerCase()] = m[2].trim()
  }
  return { file, fields }
}

/** Plain text from a mod.info description: no tags, BBCode or URLs. */
function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[\/?[a-z*]+(=[^\]]*)?\]/gi, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+--\s+/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The first sentence; the second joins it when the first is very short and the two stay brief. */
function oneSentence(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/)
  let out = sentences[0] ?? ''
  if (out.length < 40 && sentences[1] && out.length + sentences[1].length < 160) out += ' ' + sentences[1]
  return /[.!?]$/.test(out) ? out : out + '.'
}

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Largest poster*.png/jpg at the mod level or under 42/. */
function findPoster(modDir: string): string | null {
  const found: string[] = []
  for (const dir of [modDir, path.join(modDir, '42')]) {
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir)) {
      if (/^poster.*\.(png|jpe?g)$/i.test(f)) found.push(path.join(dir, f))
    }
  }
  found.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)
  return found[0] ?? null
}

const PILLOW = [
  'import sys',
  'from PIL import Image',
  'im = Image.open(sys.argv[1]).convert("RGBA")',
  'w = min(int(sys.argv[3]), im.width)',
  'im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)',
  'im.save(sys.argv[2], "WEBP", quality=int(sys.argv[4]), method=6)',
  'print(im.width, im.height)',
].join('\n')

/** Writes the resized poster and returns its size. */
async function writePoster(src: string, dest: string): Promise<{ width: number; height: number }> {
  let sharp: any
  try {
    sharp = (await import('sharp' as string)).default
  } catch (e) {
    // Only "sharp is not installed" falls back to Pillow; any other error is real.
    const code = (e as NodeJS.ErrnoException).code
    if (code !== 'ERR_MODULE_NOT_FOUND' && code !== 'MODULE_NOT_FOUND') throw e
  }
  if (sharp) {
    const meta = await sharp(src).metadata()
    const info = await sharp(src)
      .resize({ width: Math.min(POSTER_WIDTH, meta.width ?? POSTER_WIDTH) })
      .webp({ quality: POSTER_QUALITY })
      .toFile(dest)
    return { width: info.width, height: info.height }
  }
  const out = execFileSync('python', ['-c', PILLOW, src, dest, String(POSTER_WIDTH), String(POSTER_QUALITY)])
  const [width, height] = out.toString().trim().split(' ').map(Number)
  return { width, height }
}

async function main() {
  // Everything is built in a staging folder first; the real outputs are touched only when
  // there are no problems.
  const STAGE = fs.mkdtempSync(path.join(os.tmpdir(), 'our-mods-'))

  const mods: OurMod[] = []
  const problems: string[] = []
  const renamed: string[] = []
  let posterBytes = 0

  for (const [group, id, workshopId] of LIST) {
    const modsDir = path.join(WORKSHOP_ROOT, workshopId, 'mods')
    const folders = fs.existsSync(modsDir) ? fs.readdirSync(modsDir) : []
    // The folder is whichever one holds a mod.info with this id (its name may differ in case).
    const folder = folders.find((f) => {
      const info = readModInfo(path.join(modsDir, f))
      return info?.fields.id === id
    })
    if (!folder) {
      const seen = folders.map((f) => `${f}=${readModInfo(path.join(modsDir, f))?.fields.id ?? '?'}`).join(', ')
      problems.push(`${id} (${workshopId}): no mod.info with id=${id}; found: ${seen || 'no mods folder'}`)
      continue
    }
    const modDir = path.join(modsDir, folder)
    const info = readModInfo(modDir)!

    const override = NAME_OVERRIDES[id]
    const name = override ? override.name : tidyName(info.fields.name || id)
    if (name !== (info.fields.name ?? '')) renamed.push(`${id}: "${info.fields.name}" -> "${name}"`)

    const description = cleanText(info.fields.description ?? '')
    const derived = DERIVED[id]
    const mod: OurMod = {
      id,
      workshopId,
      name,
      group,
      blurb: derived ?? oneSentence(description),
      poster: null,
    }
    if (derived) mod.blurbSource = 'derived'
    else if (!description || squash(description) === squash(name)) {
      problems.push(`${id}: mod.info description is empty or repeats the name and DERIVED has no sentence for it`)
    }
    if (override) mod.note = override.note
    if (mod.blurb.length > MAX_BLURB) problems.push(`${id}: blurb is ${mod.blurb.length} characters (max ${MAX_BLURB}): ${mod.blurb}`)

    const poster = findPoster(modDir)
    if (poster) {
      const dest = path.join(STAGE, `${id}.webp`)
      const size = await writePoster(poster, dest)
      posterBytes += fs.statSync(dest).size
      mod.poster = `/assets/mods/${id}.webp`
      mod.posterWidth = size.width
      mod.posterHeight = size.height
    }
    mods.push(mod)
  }

  if (problems.length) {
    fs.rmSync(STAGE, { recursive: true, force: true })
    console.error(`PROBLEMS (nothing was written):\n  ${problems.join('\n  ')}`)
    process.exit(1)
  }

  fs.mkdirSync(OUT_POSTERS, { recursive: true })
  for (const f of fs.readdirSync(OUT_POSTERS)) {
    if (f.endsWith('.webp')) fs.unlinkSync(path.join(OUT_POSTERS, f))
  }
  for (const f of fs.readdirSync(STAGE)) fs.copyFileSync(path.join(STAGE, f), path.join(OUT_POSTERS, f))
  fs.rmSync(STAGE, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
  fs.writeFileSync(OUT_JSON, JSON.stringify(mods, null, 2) + '\n')

  console.log(`${mods.length} of ${LIST.length} mods written to ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`${mods.filter((m) => m.poster).length} posters, ${posterBytes} bytes in total`)
  console.log(`No poster: ${mods.filter((m) => !m.poster).map((m) => m.id).join(', ') || 'none'}`)
  console.log(`Renamed:\n  ${renamed.join('\n  ') || 'none'}`)
  console.log(`Derived blurbs:\n  ${mods.filter((m) => m.blurbSource).map((m) => `${m.id}: ${m.blurb}`).join('\n  ')}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
