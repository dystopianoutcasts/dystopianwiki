---
id: build-42-buildings-and-buildinged
slug: buildings-and-buildinged
title: Buildings and BuildingEd
game: pz
version: build-42
section: mapping
category: buildings-and-tiles
difficulty: intermediate
tags:
  - buildinged
  - room-templates
  - basements
  - building-checklist
excerpt: >-
  BuildingEd is now a standalone executable in bin/, with its own red B icon,
  sharing the TileZed libraries, tilesets and Building catalogs. [VERIFIED]
last_updated: '2026-09-29'
---
# Buildings and BuildingEd

> Source: 03-buildings.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

BuildingEd is now a **standalone executable** in `bin/`, with its own red `B`
icon, sharing the TileZed libraries, tilesets and Building catalogs. `[VERIFIED]`

At startup and after a Tiles-directory change it loads all available tilesets
plus `BuildingFurniture.txt`, `BuildingTemplates.txt`, `BuildingTiles.txt` and
`TMXConfig.txt`. The progress display is proof of work, not a hang; the log
records loaded and missing files. A varying tileset count usually means the
PNG/catalog set changed or a file failed to load -- read the log rather than the
total. `[VERIFIED]`

Validation switch: `BuildingEd.exe --validate-building-categories` checks the
complete tileset catalog, all 26 templates, Tile mode, 175 Furniture groups, and
both Ortho and Iso category panels. `[VERIFIED]`

---

## Room templates -- the biggest time-saver for multi-building mods

When you create a new building you pick a template. A template defines two
things: `[COMMUNITY -- BlackshotGER, 2026-04-03]`

1. The **appearance** of each room (floors, walls, wallpaper, etc.)
2. The **room definition** -- the internal name that drives loot spawn

### Creating a custom template

1. `Building > Templates...`
2. `+` to create a new template (or copy an existing one and modify it).
3. Name it, then `Edit rooms...`

### Creating rooms inside a template

1. `+` to add a room.
2. Give it a readable **name** so you can find it.
3. Give it an **Internal Name** -- this is the loot-spawn room definition.
4. Configure walls, floors, etc.

Rooms can be copied, modified and reordered. Save periodically by clicking OK
(which closes the window).

### Where valid internal names come from

`[VERIFIED path correction]` The community guide says
`media/lua/server/Distributions.lua`. In B42 stable the actual file is:

```
media/lua/server/Items/Distributions.lua
media/lua/server/Items/ProceduralDistributions.lua
media/lua/server/Items/SuburbsDistributions.lua
```

Your own custom distributions are also valid internal names -- see
[05-zones-and-spawns.md](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview).

**Do not use the room lists in the wiki -- they are outdated.** Read the game
files. `[COMMUNITY, and consistent with the path correction above]`

The tools ship a B42.20 room-name catalogue synchronized against the game
scripts, along with the `connectX` / `connectY` tile properties. `[VERIFIED --
20260730 changelog]`

### BuildingEd UI paths `[VERIFIED -- screenshots, build 20250402]`

`Building` menu: Crop To Minimum, Crop To Selection, Resize Building..., Flip
Horizontal, Flip Vertical, Rotate Right, Rotate Left, Properties..., KeyValues...,
Grime... (`G`), Rooms..., **Templates...**, Tiles..., Basement Access (submenu),
**Template From Building...**

**Templates dialog** -- left: template list. Right: `Name` field, the per-template
element list (Exterior wall, Trim - Exterior wall, Door, Door frame, Window,
Curtains, Shutters, Stairs, Roof Cap, Roof Slope, Roof Top, Grime - Walls) with a
`Choose...` button, and a `Rooms > Edit rooms...` button.
Bottom toolbar: add, duplicate, delete, move up, move down, **import**, export.

Stock templates shipped: Old Suburban, Suburban 1, Suburban 2, Wooden Shack,
Spiffo's, Seahorse, Trailer, Residential.

**Rooms dialog** (`Edit rooms...`) -- left: room list with color swatches.
Right: `Name`, **`Internal name`** (the loot-spawn roomdef), `Color`, and the
element list (Interior Walls, Trim - Interior Walls, Floors, Grime - Floors,
Grime - Walls, Ceilings) with `Choose...`.

### Importing a template `[COMMUNITY -- BlackshotGER, 2026-04-03]`

Templates can be imported from other modders via the import icon in the Templates
dialog toolbar. BlackshotGER publishes his default template
("Blackshots Building B42.16") for open use.

What to know before importing someone else's template:

- **Sorting is the author's own**, not strictly alphabetical. Rearrange freely.
- His scheme interleaves numbered variants -- `Living Room1..13` /
  `Bedroom1..13`, `Kitchen1-1..3-4`, `Bathroom1-1..3-7`, `Closet1a/1b` -- so that
  apartment complexes with many units get quick visual variety. To change a
  wallpaper across a set, edit all rooms sharing the same number.
- Icon colors usually match the wall color, with exceptions: rooms in the
  `Service` category, garages and storage rooms are always black.
- **Rooms suffixed `(custom)` use custom room definitions you do not have.** They
  will spawn with different or no loot. Either delete them, change their Internal
  name, or ship a custom distributions file that defines them -- under your own
  filename, never the vanilla one.
- The list is adapted to B42.16 and does **not** contain all vanilla room
  definitions.
- **File-size cost is minor.** Measured by the author: ~1000 KB for a building
  carrying only necessary rooms vs ~1050 KB for the complete list -- about 5%.

Worth doing yourself: a compact template holding several differently designed
living rooms, bedrooms, kitchens and bathrooms plus common areas (hall, garage,
attic, basement) is much shorter than a full catalogue and saves the most time
when designing houses repeatedly.

### Room definitions change between game versions -- and it breaks your loot

`[COMMUNITY report, renames VERIFIED against B42 stable]`

Vanilla removes, merges and renames room definitions in updates. When that
happens, buildings using the old Internal name no longer spawn the loot you
intended. **The building keeps working -- it is a silent loot bug, not a crash.**

Confirmed in the installed B42 stable build: every one of these old names is
**gone** from `Distributions.lua`, and every replacement **exists**.

| Old Internal name | Changed in | Replacement | Vanilla alias covers it? |
|---|---|---|---|
| `burgerkitchenstorage` | 42.15 | `burgerkitchen` | No |
| `optometrist` | 42.15 | `glassesstore` | No |
| `pileocrepe` | 42.15 | `kitchen_crepe` | No |
| `potter` | 42.16 | `potteryworkshop` | No |
| `sewingfactory` | 42.16 | `tailoringworkshop` | No |
| `sewingstorage` | 42.16 | `tailoringworkshop` | **Yes** -- alias to `tailoringworkshop` |
| `sewingstore` | 42.16 | `tailoringstore` (per the report) | **Yes**, but the vanilla alias points to `tailoringworkshop`, not `tailoringstore` |

So `sewingstore` and `sewingstorage` do not go dark -- vanilla aliases them. But
`sewingstore` resolves to **`tailoringworkshop`**, which is a different room than
the recommended `tailoringstore`. If you want store loot rather than workshop
loot, set the Internal name explicitly.

**Two vanilla aliases are broken in B42 stable** `[VERIFIED -- new finding]`.
`SuburbsDistributions.lua` still contains:

```lua
SuburbsDistributions.burgerstorage = SuburbsDistributions.burgerkitchenstorage  -- line 153
SuburbsDistributions.opthroom      = SuburbsDistributions.optometrist           -- line 182
```

Both right-hand sides were deleted from `Distributions.lua`, so both aliases
evaluate to `nil`. **Any building whose room Internal name is `burgerstorage` or
`opthroom` gets no room distribution at all in vanilla B42 stable.** If you have
either, change the Internal name or define the roomdef yourself.

#### What you can do about renames

1. **Ignore it.** Not a critical bug; the mod still works. Loot is just wrong.
2. **Fix the buildings.** Go through the `.tbx` files and correct the Internal
   names. Bulk find-and-replace in a text editor should work, but no one has
   published a verified procedure or tool for it yet.
3. **Re-declare the dead roomdefs in your own distributions file** (never using
   the vanilla filename). Create the old name and paste the replacement's body
   into it. This is the lowest-effort fix and covers every building at once.

The pattern BlackshotGER uses -- a clearly marked block at the top of a custom
distributions file:

```lua
-- ***********************************
--       * DELETED VANILLA DIST *
-- ***********************************
-- These distributions were deleted or renamed in a version update.

    burgerkitchenstorage = {  -- 42.15 changed to burgerkitchen
        ...
    },
    optometrist = {           -- 42.15 changed to glassesstore
        ...
    },
    sewingstore = {           -- 42.16 changed to tailoringstore
        cardboardbox = {
            procedural = true,
            procList = {
                {name="CrateFabric_Cotton",     min=1, max=99, weightChance=60},
                {name="CrateFabric_DenimBlack", min=0, max=99, weightChance=...},
                {name="CrateFabric_DenimBlue",  min=0, max=99, weightChance=4...},
                {name="CrateFabric_DenimDarkBlue", min=0, max=99, weightChance=...},
            }
        },
        clothingrack = { ... },
    },
```

Each entry keeps the **old** roomdef name and carries the **new** roomdef's body,
with a comment recording the version and the rename. Because the merge is purely
additive and these names no longer exist in vanilla, they are added cleanly --
see the merge mechanics in [05-zones-and-spawns.md](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview).

Check this list against the game whenever you target a new patch; the seven above
are confirmed for the current build but the churn continues.

### Template lifetime -- read this before you "fix" a template

Templates you use are **copied into the building itself**. Modifying or deleting
a template in the editor does **not** affect buildings already constructed; each
building carries its own copy. `[COMMUNITY]`

Adjustments you make while building (adding a room that isn't in the template,
duplicating a room with different wallpaper) are saved in the building only. To
promote them into a reusable template, use `Building > Template from Building...`,
which creates a new template; then delete the outdated one.

---

## Basements

Two approaches: `[COMMUNITY -- April 2025 guide]`

- **A) Built into the house** -- same `.tbx`
- **B) Standalone `.tbx`** -- modular, reusable, swappable, randomizable

### Option B, step by step

**1. Create the basement `.tbx`**

- In BuildingEd, create a new `.tbx` and build the basement **on level 0**
  (adjust for depth). The topmost floor of that file becomes the first floor
  in-game, because you descend into it.
- Enclose it completely -- walls, no windows.
- Place a staircase where the player should enter.
- Save.

**2. Cut the entrance in the parent cell**

- Open TileZed, go to where the basement entrance should be.
- Select the BMP eraser and delete **at least 3 floor tiles** for the stair entry.
- Save.

**3. Place it in WorldEd**

- Place the basement like any other building lot.
- **Place it on the correct level.** Buildings normally sit on level 0; a
  one-floor basement goes on level **-1**.
- Align it with the 3 erased floor tiles.

### Option A (built-in basement)

No extra setup -- just build it on the right level inside the same `.tbx`. But
remember the whole building shifts: a house with a 1-floor built-in basement is
placed on level **-1**, not 0.

### Why modular is worth it

- Assign basement A to house A deterministically, or
- Let house A randomly spawn basement B, C or D.

Keep the basement `.tbx` files clean and consistent.

### How the game actually resolves basements `[VERIFIED]`

`media/maps/<Map>/basements.lua` is generated by TileZed when exporting `.pzby`
files. The vanilla Muldraugh file confirms the format and the semantics:

```lua
local procedural_basements = {
    -- This text is created by TileZed when exporting the .pzby files.
    -- The commented-out ones are unique basements placed as lots in WorldEd;
    -- they won't spawn randomly.
    lot_basement_bar_01_wooden = { width=13, height=13, stairx=1, stairy=0, stairDir="W" },
--  lot_basement_bank_02       = { width=11, height=14, stairx=5, stairy=12, stairDir="W" },
}
```

Reading that carefully gives you the rule the guides only imply:

- Each entry declares footprint (`width`, `height`), stair cell (`stairx`,
  `stairy`) and stair direction (`stairDir`).
- **Uncommented entries are the random pool.** Commented entries are unique
  basements placed explicitly as lots in WorldEd and will not spawn randomly.
- The historical B41 names in the file header (`basement_10x10_1story_NEstairsN`,
  `basement_7x7_1story_SWstairsN`, and Lemmy's 10x10-chunk multi-story basement)
  are all commented out in B42 vanilla.

### The full basement pipeline `[COMMUNITY -- Alree / Unjammer]`

**1. Access points are `Basement` zones in `objects.lua`**, injected via
`addSpawnLocations()`. A valid zone:

```lua
{ name = "", type = "Basement", x = 13605, y = 4786, z = 0, width = 8, height = 12,
  properties = {
    StairDirection = "N",
    StairX = 7,
    StairY = 2,
    Access = "ba_house_medium_42"
  },
}
```

| Field | Meaning |
|---|---|
| `x`, `y`, `z` | Basement spawn coordinates |
| `width`, `height` (`w`, `h`) | Area available for placement |
| `StairX`, `StairY`, `StairDirection` | Staircase location and orientation |
| `Access` | Name of the visual entry basement, e.g. a trapdoor `.pzby` |
| `specificBasement` (optional) | Restricts the pool to named basements |

**2. Initial load (`beforeLoadMetaGrid`)** parses definitions:

- Basement `.pzby` files -> `BasementDefinition`
- Access `ba_*.pzby` files -> `AccessDefinition`
- Each `.pzby` is parsed for header, dimensions and metadata

**3. `calculateBasementPlacements()` computes viable placements**, filtering out
incompatible definitions by:

- matching orientation (north / west)
- enough available space (`w`, `h`)
- proper stair alignment
- no overlap with other basements (`BasementOverlap`)

One `BasementDefinition` is then chosen at random per spawn point -- but the
randomness is **seeded and deterministic**:

```java
RandSeeded rand = new RandSeeded(WGParams.instance.getSeed());
```

So the same world seed produces the same basement choices, repeatable across new
games on the same map and seed. **This is the main cause of basement
repetitiveness across playthroughs** -- worth knowing before you conclude your
random pool is broken.

**4. Placements are registered** (`BasementPlacement`) with final `x`, `y`, `z`,
size `w`, `h`, and the selected `.pzby` name, then persisted to
`map_basements.bin`. They stay fixed for a given save, so behavior is consistent
on reload.

**5. Runtime instantiation.** During chunk loading, `onNewChunkLoaded()` checks
whether a `BasementPlacement` overlaps the chunk; if so it calls
`NewMapBinaryFile.SpawnBasementInChunk(...)`. The basement only becomes
physically present at that point.

BuildingEd retains basements, negative floors, grime, RoomTone, Attribute mode,
unlit-room inspection, autosave and binary/TMX export. `[VERIFIED]`

---

## Erika's building and map finishing checklist `[COMMUNITY]`

Run this after finishing a building or a map.

### BuildingEd

- [ ] Empty outside room definition added (if needed)
- [ ] Light switches installed in all rooms
- [ ] Outdoor lighting added
- [ ] Stair railings added
- [ ] Mailbox and trashcan added (residential)
- [ ] Wall removed behind all garage / double doors
- [ ] Door check: hide doors, verify none are blocked by walls or trims
- [ ] Building grime added
- [ ] Street curbs, grime and traffic lines added
- [ ] Roof constructed
- [ ] Roof details added (antenna, chimney, ventilation)
- [ ] Yard details added (seating, barbecue, garden)
- [ ] Unwanted-object check: hide all walls and look for misplaced objects

### WorldEd

- [ ] Vehicle zones added
- [ ] Object zones added
- [ ] In-game map updated
- [ ] Spawnpoints added
- [ ] Zombie spawns added

### In-game testing

- [ ] Mod description and poster image
- [ ] Spawn description and thumbnail
- [ ] Spawnpoints work
- [ ] All buildings: doors, windows, light switches
- [ ] Loot tables in commercial buildings
- [ ] Zombie population
- [ ] In-game world map
- [ ] Parking and vehicle spawns
- [ ] Traffic lines and curbs
- [ ] Electricity pylons all connected
- [ ] Outdoor lighting (street lights) at night

---

## BuildingEd Lua automation `[VERIFIED]`

BuildingEd supports transactional Lua 5.2 editor scripts: building inspection,
room fill, tile placement/removal/replacement on user and grime layers, room
assignment edits, Undo, and restricted save/export actions.

These author map *context*. They do **not** execute the Project Zomboid gameplay
Lua VM. Reference: `LuaScripting.html` in the tools repo.
