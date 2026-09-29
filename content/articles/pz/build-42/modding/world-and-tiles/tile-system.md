---
id: build-42-tile-system
slug: tile-system
title: 'The tile system: tilesheets, tiledefs, tile depth and the .pack pipeline'
game: pz
version: build-42
section: modding
category: world-and-tiles
difficulty: intermediate
tags:
  - tiles
  - multi-z
  - basements
  - map-modding
  - tiledefs
excerpt: >-
  To get a custom tile into the game you still need all three (pzwiki: Adding
  new tiles, revid 1385091 -- note this page carries an {{Outdated}} banner and
  a 41.78.19 version tag, so treat...
last_updated: '2026-09-29'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - the-map-expansion-knox-country-new-towns
  - multi-z-the-vertical-engine-change
  - basements-the-underground-system
  - the-new-lighting-rendering-engine
  - map-modding-toolchain-for-b42
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
---
# The tile system: tilesheets, tiledefs, tile depth and the .pack pipeline

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 5.1 The three-part pipeline (CONFIRMED)
To get a custom tile into the game you still need all three (pzwiki: Adding new
tiles, revid 1385091 -- note this page carries an {{Outdated}} banner and a
41.78.19 version tag, so treat art-workflow specifics as B41-era-but-still-valid):
1. **Sprite packing** -- your tile art packed into the game's `.pack` texture
   format.
2. **Map definition** -- the tile placed in map/building data.
3. **Tile definition (tiledef)** -- properties for the tile, registered so the
   game and editors know what it is.

### 5.2 Tilesheet authoring facts (CONFIRMED -- Adding new tiles)
- Tilesheets are typically **1024x2048 or 1024x4096**. Other dimensions cause
  texture-pack issues.
- 1024x2048 gives **64 sprites (8 across x 8 down)**. Sprites are referenced by
  number, e.g. `lighting_outdoor_01_0`; numbering starts at 0 top-left, increments
  right, then down.
- Max single-sprite size **128x256**. Game has 1x/2x texture sizes; **2x is
  default**.
- Filenames must be **fully lowercase `.png`**, placed in `Tiles\2x\` (the editor
  render folder) and also in a separate folder holding only your new sheets (used
  later for the texture pack). Wrong 2x folder = editor error.
- Per-sheet layer defaults go in `TileSheetName.tilelayers.xml` (a
  `<tileset columns rows>` of `<tile id layername>` entries) so TileZed auto-picks
  the right layer.

### 5.3 tiledef numbering / allocation -- CONFIRMED (the conflict-avoidance rule)
Previously flagged as a gap; now **CONFIRMED** (pzwiki: Tiledefs used by mods,
revid 1394311, v42.9.0; and Adding new tiles, revid 1385091):

- Tiledefs are **uniquely numbered packs** of textures/assets. The number is
  declared in the mod's `mod.info`.
- **Allocation ranges:**
  - **0-99** -- reserved for **developers** (as of build 41.74).
  - **100-16382** -- available to **modders**.
  - **Above 8190** -- allegedly "results in negative sprite IDs," so treat
    **<= 8190** as the safe practical ceiling.
- **Uniqueness is mandatory.** Two mods declaring the **same** number (or an
  invalid number) break: the game logs
  `ERROR: ZomboidFileSystem.loadModTileDefs> tiledef fileNumber <N> used by more
  than one mod`, and the affected mods will not work properly.
- **Conflict avoidance:** consult the community registry (pzwiki: Tiledefs used by
  mods) before choosing a number; entries flagged with `!` are known
  invalid/duplicate. Real collisions in the wild include 216/217 (Oujinjintiles
  vs Chinatown/VaultTec), 723 (Vaccine vs Enhanced Environment), and 999 (Camden
  County vs Vardell Raceway).

**Exact `mod.info` syntax (CONFIRMED -- Adding new tiles):**
```
pack=myTiles
tiledef=myTiles xxx
```
- `pack=` is the name of your `.pack` texturepack (e.g. `media/texturepacks/myTiles.pack`).
- `tiledef=<name> <number>` -- the number `xxx` **must be unique, starting from
  100**. (An older struck-through wiki note said 0-999; the current guidance is
  "unique, from 100," consistent with the 100-16382 range above.)
- Optional: `require=myTiles` to consume another mod's tiles without bundling them.

### 5.4 Editing tiledefinitions (CONFIRMED -- Adding new tiles)
- **Tools > Tile Properties** in TileZed edits `.tiles` files (per-tile behavior:
  floor, container, pickup, etc.). See section 5.6.
- Copy `newtiledefinitions.tiles` from `ProjectZomboid\media\` as your reference,
  create a new `.tiles`, use the blue-plus icon to add your tilesheet(s), set
  properties, save. Ship it as `...\Zomboid\mods\myTiles\media\myTiles.tiles`.
- **Texture pack:** Tools > .pack files > Create .pack File; point it at the
  folder containing only your new sheets; output to
  `media\texturepacks\myTiles.pack`.

### 5.5 Tile depth -- NEW in B42 (CONFIRMED)
Newly confirmed (pzwiki: Tile depth, revid 1438979, v42.19.0). B42 replaced the
old **layer** system with **tile depth**:

- Tile depth gives each tile "an equivalent of a normal map," telling the game how
  to render each pixel and how tiles/objects that collide should render against
  each other.
- Authored via the **tile depth editor tool in debug mode**, by applying
  **geometries** on top of the tile. Three geometry types: **box, cylinder,
  polygon**.
- All tile geometries are stored in the scripts file **`tileGeometry.txt`**.
- Practical modding note: custom tiles for B42 need depth geometry to render
  correctly against neighbours. A community "Depthmap Tutorial B42+" (Crater) is
  linked from the Mapping page.

### 5.6 Tile properties -- partially resolved (colored light STILL UNCERTAIN)
pzwiki: Tile properties, revid 1439313 (v42.19.0). The page is thin and **defers
the full field catalog to an external API doc**
(`pz-wiki-modding.github.io/PZ-API-Docs/mapping/tile_properties.html`). What the
wiki page itself documents:
- **Directions** follow the PZ isometric system (north = top-right, west =
  top-left).
- **Surface**, **ItemHeight**, **IsSurfaceOffset** control where placed items sit.
- Warning: **not all interactions come from tile properties** -- e.g. a car on a
  `blends_street_*` floor tile is treated as on-road; other interactions are only
  discoverable by reading the Java source.

**Colored-light property fields: STILL UNCERTAIN.** The Tile properties page does
not enumerate colored-light / intensity / hue fields; it defers to the external
PZ-API-Docs. The cached "Rendering" wiki page is about **Blender 3D rendering for
mod presentation**, NOT the engine lighting, so it does not help either. Verify
colored-emitter fields against the PZ-API-Docs tile_properties page or B42
JavaDocs before authoring custom light emitters. (See Gaps.)

### 5.7 New-tile ecosystem (CONFIRMED)
Many community tile packs already ship B42 variants (the Mapping page lists ~16
usable tile packs, e.g. Fear's Funky, Erika's/Ivery, Melos, Skizot,
throttlekitty), proving the custom-tile path works end-to-end in B42.

---

<a name="6-lighting"></a>
