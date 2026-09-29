---
id: build-42-tiles-and-tiledefs
slug: tiles-and-tiledefs
title: Tiles and tiledefs
game: pz
version: build-42
section: mapping
category: buildings-and-tiles
difficulty: intermediate
tags:
  - tilesets
  - tiledefs
  - depthmaps
  - tile-slicing
excerpt: '[COMMUNITY procedure, still valid; the tool behavior notes are VERIFIED]'
last_updated: '2026-09-29'
---
# Tiles and tiledefs

> Source: 04-tiles.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

## Adding or updating tiles

`[COMMUNITY procedure, still valid; the tool behavior notes are VERIFIED]`

1. **Download and extract** the tiles update anywhere. You will typically get a
   `Tiles` folder (1x sheets) plus a `2x` subfolder, and sometimes a
   `tilesets.txt` you can usually ignore.
2. **Copy** the extracted `Tiles` folder into your tools directory, over the
   existing `Tiles` folder. Replace when prompted.
   - If the update only contains a `2x` folder, copy its contents into
     `Tiles/2x` and replace.
3. **Register in TileZed**: `Tools > Tilesets...` -> *Add Tilesets* (the
   paper-with-a-star icon) -> select the sheets you need or *Check All* -> OK.
4. **Add to your map**: `Tools > Tilesets` -> `+` in the Tilesets panel ->
   confirm. All missing tilesets are added automatically.

### What current builds do for you `[VERIFIED -- 20260729/30 changelogs]`

- WorldEd, TileZed and BuildingEd **watch** the configured Tiles directories.
  A newly copied PNG is discovered and loaded **without restarting**.
- `Tools > Tilesets... > Add Tilesets` can import a browsed external PNG into the
  active Tiles tree, preserving the `1x` / `2x` / `.pack` layout. Name collisions
  are checked by content and never silently overwritten.
- Invalid or undersized sheets are rejected with both the selected and resolved
  paths. Zero-column tilesets no longer crash the `Tilesets.txt` save.
- Valid single-row sheets (e.g. `Giblet_00`) are accepted; an unambiguous `N x 1`
  layout is recovered from the 1x or 2x PNG when the in-memory column count is
  lost.
- New menu: `Edit > Update Tilesets.txt from Tiles PNGs...` -- adds new sheets,
  refreshes changed dimensions, preserves metadata enumerations, keeps a
  `Tilesets.txt.bak`.
- Automatic PNG discovery is **memory-only**. Startup and watcher scans never
  rewrite or inflate `Tilesets.txt`.
- Removing a PNG while an editor is open is handled: the sheet is invalidated,
  open maps get the missing-tile placeholder with correct geometry.
- BuildingEd performs the same discovery across `1x`, `2x` and immediate `.pack`
  subdirectories; TBX references match case-insensitively and resolve on demand
  before the **Missing Tilesets** dialog appears.

### Tileset list status colors `[VERIFIED]`

| Appearance | Meaning | Action |
|---|---|---|
| Green | TMX uses the tileset and its PNG is available | None |
| Orange | Map or catalog references it, PNG cannot be found | Fix Tiles directory, filename or catalog entry |
| Normal theme color | Available but unused by this map | Keep, or remove the map reference |

The leading icon reports `1x`, `2x` or a custom tile size. The tooltip gives
usage, availability, resolution and source path. **A 1x image is not mandatory**
-- a valid 2x or custom-resolution variant is used if it is the only one present.
Orange means *no usable variant found*, not merely "1x is missing".

### Importing a PZ tileset from a raw PNG `[VERIFIED]`

`Import Project Zomboid Tileset PNG...` creates the minimal PZ tileset info from
a PNG without requiring generic Tiled metadata that PZ does not use. The PNG must
still have a valid tile-grid layout and a unique tileset name.

1. Choose the command, select the PNG, confirm tile resolution / grid.
2. Review the generated tileset name and image path.
3. Save the TMX, and update `Tilesets.txt` if the image belongs in the shared
   catalog.

Custom dimensions up to **4096 px** are accepted by creation and pack tools.
Jumbo support removes the old assumption that packed source rectangles fit
historical small-tile bounds. Large images cost texture memory and can hit
game-side limits outside the editor.

Also available: ID reconstruction/reassignment (repairs catalog order after
additions), direct tile-to-PNG export, and a Pack Extractor with exact full-name
search and multiple prefixes.

---

## TileDefs

TileDefs are tile properties consumed by the game. Many exist only in Java or Lua
with no public mapping documentation.

The current tools ship a property catalog **audited against B42 game sources**,
with English descriptions and contextual tooltips. Hover a property to read what
it does and the expected value shape. Where behavior is inferred rather than
explicit, the text says so -- validate in-game. `[VERIFIED]`

Property and value filters answer:

- which tiles already use a definition
- which values occur in the current tileset set
- whether a renamed or removed property is still referenced
- whether IDs and definitions stayed consistent after importing tiles

Tile-definition **loading order** now follows the B42.20 runtime order:
`newtiledefinitions`, erosion definitions, overlay definitions, chunk-caching
definitions, the NoiseWorks patch, and both native Jumbo definition files.
`.patch.tiles` files merge properties into their base definitions. Version-1
limits are validated for legacy 512-tile files and the 1024-tile
`newtiledefinitions` format. `[VERIFIED]`

---

## Shipping custom tiles in a mod: pack, tiledef, and the number that breaks worlds

`[VERIFIED -- PZwiki; the "Adding new tiles" page is flagged as last updated for
41.78.19, so treat the workflow as B41-derived and validate in B42]`

### Tilesheet requirements

| Property | Value |
|---|---|
| Sheet dimensions | **1024x2048** or **1024x4096**. Other sizes break pack creation. |
| Sprites per sheet | 64 at 1024x2048 (8 across, 8 down) |
| Max sprite size | 128x256 |
| Numbering | Starts at 0, top-left, increments right then down -> `lighting_outdoor_01_0` |
| Filename | Fully lowercase, `.png` |

Save two copies: one in `Tiles\2x\` for the editors, and one in a separate folder
containing **only** your new sheets -- that folder is what the texture-pack
creator consumes.

### Optional: default layers

Create `<TileSheetName>.tilelayers.xml` so TileZed auto-picks the right layer per
tile ("Layer Switch Enabled", the blue grid icon at the bottom of the palette):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<tileset columns="16" rows="8">
 <tile id="0" layername="Walls"/>
 <tile id="96" layername="Furniture2"/>
</tileset>
```

### Tile properties and the .tiles file

`Tools > Tile Properties` sets in-game behavior (floor, container, pickable...).
Start from a copy of `media/newtiledefinitions.tiles`, then create your own
`.tiles` file and add your sheets with the blue-plus icon. Multiple tiles can be
selected and edited or copy-pasted between `.tiles` files as a batch.

### Texture pack

Editor sheets carry a lot of empty space. `Tools > .pack files > Create .pack
File` trims each sprite to its bounding box and writes the game format. Leave
output texture size at 1024x1024 and *Scale to 1x* unchecked. Point it at the
folder holding only your sheets.

### mod.info wiring

```
pack=myTiles
tiledef=myTiles 100
```

- `pack=` -- name of your `.pack`
- `tiledef=` -- name of your `.tiles` **plus a unique number**
- `require=myTiles` -- use another mod's tiles without bundling them

### The tiledef number is a global namespace

> Two mods using the same tiledef number **break each other**. A world created
> with conflicting or invalid numbers will not work properly.

| Range | Status |
|---|---|
| 0-99 | **Reserved for the developers.** Do not use. |
| 100-16382 | Available to modders |
| above 8190 | Reportedly "results in negative sprite IDs" -- avoid |

Practical target: **100-8190**.

The engine reports collisions explicitly:
`ERROR: ZomboidFileSystem.loadModTileDefs> tiledef fileNumber 216 used by more
than one mod`

The community maintains a registry of claimed numbers on the PZwiki
**"Tiledefs used by mods"** page -- several hundred entries with known conflicts
flagged. **Check it and claim an unused number before publishing.** Known
collisions there include 216/217, 715, 723, 999, 1122 and 4661.

The page is a work in progress and new mods are added constantly; adding your own
entry is the polite move.

---

## Depthmaps

Depthmaps give custom tiles correct depth information so the renderer occludes
them properly.

**Video tutorial by Crater** (timestamps in the description) `[COMMUNITY]`:
https://www.youtube.com/watch?v=e0hcX1UWMD8

```
00:00  What is a depthmap?
03:00  Project setup
04:20  Into the editor
05:16  Dropdowns
09:00  Tilesets and tile data
13:00  Geometry basics
14:40  Geometry buttons
16:32  Size editors
17:42  Camera views
19:00  Tileset controls
29:00  Creating a basic depthmap
38:10  Copying data to variants
46:08  Properties
54:14  View options
59:55  Advanced depthmap creation
1:24:32 Wrapping up
```

### What you need `[COMMUNITY -- Erika; paths VERIFIED]`

| Item | Location | Required? |
|---|---|---|
| Depthmap PNGs | `<mod>/media/depthmaps/` | Only for **custom** depthmaps |
| `tileDepthTextureAssignments.txt` | `<mod>/media/` | Always |
| `tileGeometry.txt` | `<mod>/media/` | Only if you generated a new depthmap from geometry |

Vanilla equivalents, confirmed in B42 stable:

```
media/depthmaps/                        220 PNGs, named DEPTH_<tilesheet>.png
media/tileDepthTextureAssignments.txt   31,673 lines
media/tileGeometry.txt                  331,376 lines
```

A custom depthmap image must be named after your tile PNG with a `DEPTH_`
prefix -- e.g. tilesheet `furniture_shelving_erika_01` ->
`DEPTH_furniture_shelving_erika_01.png` in `media/depthmaps/`. Use the vanilla
images in `media/depthmaps` as reference.

**You do not need a PNG if you reuse a vanilla depthmap.** Many vanilla tiles
have no depthmap of their own and simply point at another tile's.

### Assignment file format `[VERIFIED]`

`tileDepthTextureAssignments.txt` maps *your tile* to *the depthmap tile it uses*:

```
tileDepthTextureAssignments
{
    VERSION = 1,
    furniture_shelving_erika_01_0  = furniture_shelving_01_40,      -- vanilla depthmap
    furniture_shelving_erika_01_84 = furniture_shelving_erika_01_84, -- own custom depthmap
}
```

Left side is your tile; right side is the depthmap source. Pointing a tile at
itself means "use my custom `DEPTH_` image".

Note: Erika's posted example omits the leading `tileDepthTextureAssignments`
header line that vanilla has. Match vanilla's shape -- header, then `{`.

### Generating it from in-game debug mode `[COMMUNITY -- Erika]`

You can have the game write the file for you.

1. Launch the game and enter debug mode (`Shift + F8`).
2. Change the `Game` dropdown to your tile mod folder.
3. Select **Geometry**.
4. Select the tilesheet, then the tile.
5. **ADD BOX** or **ADD CYLINDER**.
6. Click a coordinate field to edit position; drag the arrow to resize.
7. Right-click the shape name -> **Geometry To Pixels**.
8. **SAVE**. The depthmap image is created.

Walkthrough video by PlentyT: https://youtu.be/YwL8bJUkUeA

### The fast path: reuse vanilla geometry `[COMMUNITY -- Pertominus]`

For retextures and tiles matching vanilla dimensions, do not build geometry from
scratch. In the debug Geometry editor there are two tileset panes:

- **Left** = the sheet you are editing (your tiles)
- **Right** = a reference sheet (a vanilla one)

Right-click menu on the left pane offers: `Swap Tilesets`,
`Clear Assiged Depth Textures` (sic), **`Copy Geometry From Right`**,
`Select In Other List`.

Two workflows:

**A. Reuse the existing vanilla depthmap outright.** Select `Game` in the
dropdown so you are editing vanilla files, put the vanilla sheet (e.g.
`location_community_park_01`) on the right and your sheet on the left, and
assign. On save, the vanilla files are updated to include your tiles -- so then
open `media/tileDepthTextureAssignments.txt`, search for your tilesheet or tag,
and **move those lines out of vanilla into your mod**. Only one file to harvest.

**B. Tiles that do not quite match.** Use `Copy Geometry From Right`, edit the
copied shapes, then generate the depthmap and save. Because you generated a *new*
depthmap rather than reusing one, you must harvest **two** things from vanilla
into your mod:

1. the relevant lines from `media/tileGeometry.txt`, and
2. the generated depthmap image from `media/depthmaps/`.

`tileGeometry.txt` uses `VERSION = 2` and a nested `tileset { name = ... }` /
`tile { xy = 0x0, box { translate/rotate/min/max } }` structure -- note the `x`
separator (`0x0x0`), not spaces. `[VERIFIED]`

**Caution:** workflow A and B both have you editing *vanilla game files* in
place. Harvest your lines out promptly, and expect a game update or file
verification to wipe them.

**Erika's tilepack** is published as a working reference for both depthmaps and
seating: https://steamcommunity.com/sharedfiles/filedetails/?id=3346506593

**Depth Map Editor, current state** `[VERIFIED -- 20260802 changelog]`: reworked
into three resizable panes -- tile catalogue, depth preview, and geometry/pixel
properties. Automated editor validation now checks the realized window layout and
fails if a pane or the canvas collapses.

---

## Seating on custom tiles

To make custom furniture sittable you need a `seating.txt` in your mod's `media`
folder that assigns seating positions to your tiles. `[COMMUNITY -- Erika]`

The vanilla file is `media/seating.txt` -- confirmed present in B42 stable, and
its format is `[VERIFIED]`:

```
seating
{
    VERSION = 3,

    tileset
    {
        name = furniture_seating_indoor_02,

        /* furniture_seating_indoor_02_0 */
        tile
        {
            xy = 0 0,

            position
            ...
        }
    }
}
```

Key points: it is a nested block format (not Lua), declares `VERSION = 3`,
groups by `tileset { name = ... }`, and addresses tiles by their `xy` grid
coordinate within the sheet.

### Full example `[COMMUNITY -- Erika]`

```
{
    VERSION = 3,

    tileset
    {
        name = furniture_seating_indoor_erika_01,

        /* furniture_seating_indoor_erika_01_0 */
        tile
        {
            xy = 0 0,

            position
            {
                id = W,
                translate = -945 2169 439,
            }

            position
            {
                id = N,
                translate = 710 2020 -902,
            }

            position
            {
                id = S,
                translate = 478 1960 926,
            }

            position
            {
                id = E,
                translate = 1762 2010 383,

                properties
                {
                    BlockLeft = true,
                    BlockRight = true,
                }
            }
        }

        /* furniture_seating_indoor_erika_01_1 */
        tile
        {
            xy = 1 0,
            ...
        }
    }
}
```

| Element | Meaning |
|---|---|
| `xy = 0 0` | Tile's grid coordinate in the sheet (space-separated here, unlike `tileGeometry.txt`'s `0x0`) |
| `position { id = N/S/E/W }` | One seating position per approach direction |
| `translate = x y z` | Where the character is placed for that direction |
| `properties { BlockLeft, BlockRight }` | Blocks sitting from the sides -- used on armchair-style tiles |

Note Erika's example opens with a bare `{`, while vanilla `media/seating.txt`
opens with a `seating` header line then `{`. Match vanilla. `[VERIFIED]`

**Generate it instead of hand-writing it.** The in-game debug mode can produce
the seating file the same way it produces depthmaps -- see the depthmap section
above and PlentyT's video: https://youtu.be/YwL8bJUkUeA

Reference tilepack with both seating and depthmaps done:
https://steamcommunity.com/sharedfiles/filedetails/?id=3346506593

---

## Tile slicing (getting art into the isometric grid)

Community tutorials plus Photoshop templates for cutting and moving tiles using
the Masks starter kit: resize the object, skew it, cut along the slice-template
lines, then move each piece onto the correct floor tile. Colored floor-tile
templates make placement visible. `[COMMUNITY -- contributed by melo's_tiles and
others in the mapping channel]`

---

## Art style

**Project Zomboid Art Style Guide (WIP) by Zlobenia** -- identifies and explains
each aspect of PZ's art style and how to replicate it, what to avoid, general
tips, and ways to improve. `[COMMUNITY]`

v1: https://1drv.ms/w/s!AkSJWeul_xXzh2xxuJUsS-oKdOvy?e=OPWjeF

---

## TileZed Lua automation `[VERIFIED]`

TileZed embeds Lua for **editor** automation. It does not run PZ gameplay
scripts. Batch scripts can inspect or modify tiles, BMP data, selections, layers,
Object Groups, zones and RoomDefs. Interactive tools can preview placement and
create one Undo command per gesture.

Current API adds:

- UTF-8 console output, tracebacks, progress reporting, cooperative cancel
- negative levels and WorldEd cell coordinates
- Object Group and RoomDef access, creation, modification, removal
- tile lookup by exact name; layer lookup by `(level, baseName)`
- exact-position and map-wide tile deletion and replacement
- whole-layer removal, named placement with automatic tileset attachment
- Undo integration for map changes
- a restricted `app` interface for documented editor actions

Note the indexing trap: the API is **zero-based**, Lua tables are one-based.

`LuaTools.txt` can come from a separate user catalog; portable installs detect
when the user and application catalog are the same file and load it once.

Reference: `LuaScripting.html` in the tools repo.
