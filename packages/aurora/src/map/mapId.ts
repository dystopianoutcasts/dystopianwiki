/**
 * T50: the id a map is known by on the live map, from its folder name (the exact text of
 * a `Map=` entry). A port of scripts/tiles/describe-mod-maps.ts `mapId`, which names the
 * tile overlays (tiles.json `overlays[].id`) and tags the data files (`m`): lower case,
 * every run of other characters one hyphen, no leading or trailing hyphen.
 * "Raven Creek B42" -> "raven-creek-b42", "Constown, KY" -> "constown-ky".
 *
 * Unlike the script's, this never throws: a `Map=` entry with no letters or digits gives
 * "" (it can match nothing), because one odd server setting must not break the page.
 * mapId.test.ts holds the two to the same answers.
 */
export function mapId(mapName: string): string {
  return mapName.toLowerCase().replace(/[^a-z0-9_]+/g, '-').replace(/^-+|-+$/g, '')
}

/** The vanilla map's `Map=` entry. Always drawn: it is the base layer, not an overlay. */
export const VANILLA_MAP_NAME = 'Muldraugh, KY'
export const VANILLA_MAP_ID = mapId(VANILLA_MAP_NAME)

/**
 * `Map=` entries that are not places: helper mods that ride on the map list. The home
 * page hides the same two (packages/web/src/lib/homeSummary.ts NOT_REAL_MAPS), compared
 * lower-case after trimming. They never get tiles, so they never earn a "no tiles" notice.
 */
export const NOT_REAL_MAPS: ReadonlySet<string> = new Set(['lawnmower', 'vehicle spawn zones'])

export function isHelperMap(name: string): boolean {
  return NOT_REAL_MAPS.has(name.trim().toLowerCase())
}
