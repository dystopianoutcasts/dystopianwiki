---
id: build-42-sources-and-provenance
slug: sources-and-provenance
title: Sources and provenance
game: pz
version: build-42
section: mapping
category: sources
difficulty: intermediate
tags:
  - sources
  - provenance
  - link-index
excerpt: >-
  Installed game -- Build 42
  STABLE, git revision a2947723ca, Steam buildid 24449119, last updated
  2026-07-29. Sealed snapshot and manifest at...
last_updated: '2026-09-29'
---
# Sources and provenance

> Source: 09-sources.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

## Verification basis

**Installed game** -- your Steam library's `ProjectZomboid` folder,
Build 42 STABLE, git revision `a2947723ca`, Steam buildid `24449119`,
last updated 2026-07-29. We keep a sealed snapshot of that build, with a
manifest, for re-checking.

Files read directly for this compilation:

```
media/maps/Muldraugh, KY/map.info
media/maps/Muldraugh, KY/objects.lua            (head)
media/maps/Muldraugh, KY/regions.lua            (head)
media/maps/Muldraugh, KY/spawnpoints.lua        (head)
media/maps/Muldraugh, KY/basements.lua          (head)
media/maps/Muldraugh, KY/streets.xml            (head)
media/maps/Muldraugh, KY/WorldGenOverride.lua   (full)
media/maps/Muldraugh, KY/maps/biomemap_*.png    (4914 files, names only)
media/seating.txt                               (head)
media/lua/shared/VehicleZoneDefinition.lua      (head + parkingstall/trailerpark blocks)
```

Directory-level facts (paths, counts, extensions) taken from the snapshot's
`LIVE_MEDIA_INVENTORY.tsv` and from direct listings.

**Tools** -- `Unjammer/PZ_Mapping_Tools`, release `42.20STABLE_02c`
(build `20260802`, published 2026-08-02), fetched 2026-08-02 via the GitHub API
and raw content:

- `README.md`
- `PZToolsGuide.html` -- the official user guide
- `MappingSpawnControl.html` -- mapping-side zombie/item spawn control
- Release bodies for `42.20STABLE_00` / `_01` / `_01b` / `_02b` / `_02c`

Also present in the repo, referenced but not fully transcribed here:
`Automapper.html`, `LuaScripting.html`, `CHANGELOG-PZTOOLS.md`,
`UPSTREAM-HISTORY.md`.

**Community** -- the `#b42-tutorials-and-guides` channel dump supplied by the
user, April 2025 through July 2026.

---

## Tool downloads

| Item | Link |
|---|---|
| PZ Mapping Tools repo | https://github.com/Unjammer/PZ_Mapping_Tools |
| Releases | https://github.com/Unjammer/PZ_Mapping_Tools/releases |
| Tilesheets 42.20 | `tilesheets_42.20.zip`, attached to release `42.20STABLE_00` (403 MB); Drive mirror linked in every release body |
| Latest at compile time | `42.20STABLE_02c` / `PZ_Mapping_Tools_build20260802.zip` (68.6 MB) |

---

## Reference links from the channel

| Topic | Link |
|---|---|
| B41 coordinate map | https://map.projectzomboid.com/ |
| B41 vanilla map export (incl. `map.png`) | https://github.com/Unjammer/PZ_Vanilla_Map-B41- |
| B42 colors, unofficial tools | https://github.com/pzmapping/B42-Colors/blob/main/MAP%20and%20MAP_veg%20Colors.png |
| Sample mod + project | https://github.com/pzmapping/Sample-Mod-and-Project- |
| Depthmap video tutorial (Crater) | https://www.youtube.com/watch?v=e0hcX1UWMD8 |
| PZ Art Style Guide v1 (Zlobenia) | https://1drv.ms/w/s!AkSJWeul_xXzh2xxuJUsS-oKdOvy?e=OPWjeF |
| Mapping wiki hub | https://pzwiki.net/wiki/Mapping |
| Mod structure | https://pzwiki.net/wiki/Mod_structure |
| Procedural distributions | https://pzwiki.net/wiki/Procedural_distributions |

Additional wiki pages named in the channel: Adding new tiles, `map.info`, room
definitions and item spawns, tiledefs used by mods, vehicle zones, `mod.info`,
game files, scripting, Lua.

Script-file documentation (`Blends.txt`, `MapBaseXML.txt`, `Rules.txt`,
`TMXConfig.txt`) is maintained in the community **PZ Scripts Data** project and
accepts pull requests.

---

## Community tutorial index (channel order)

| ID | Topic | Author / poster | Status here |
|---|---|---|---|
| TUT-01 | Setting up the tools (5 parts) | Mr. Mapper / Pabbiqo | `[STALE]` -- superseded, see [01](/pz/build-42/mapping/fundamentals/tools-setup) |
| TUT-02 | Basements in B42 | Mr. Mapper | [03](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) |
| TUT-03 | Vegetation on upper levels | Simon_MD | [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview) |
| TUT-04 | Depthmap guides 1 & 2 | Crater; Erika | [04](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) |
| TUT-05 | Seating on custom tiles | Erika | [04](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) |
| TUT-06 | Building & map finishing checklist | Erika | [03](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) |
| TUT-07 | PZ art style guide | Zlobenia | [04](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) |
| TUT-08 | Basement system technical workflow | Alree / Unjammer | [03](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) |
| TUT-09 | Mannequins as fake NPCs | Alree / Unjammer | [05](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview) |
| TUT-10 | B42 grid overlay using GIMP | Mr. Mapper | [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview) |
| TUT-11 | Tile slicing tutorial + templates | melo's_tiles and others | [04](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) |
| TUT-12 | World thumbnails in WorldEd | Mr. Mapper | [01](/pz/build-42/mapping/fundamentals/tools-setup) |
| TUT-13 | B42 colors -- map.png / map_veg.png | Mr. Mapper | [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview) |
| TUT-14 | B42 folder structure | Mr. Mapper | [06](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps) |
| TUT-15 | Farm and wildlife animals | BlackshotGER (with Pertominus) | [05](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview) |
| TUT-16 | Surrounding cells in Tiled | Mr. Mapper | [01](/pz/build-42/mapping/fundamentals/tools-setup) |
| TUT-17 | Unknown element `tile_entry` | Mr. Mapper / Pabbiqo | [07](/pz/build-42/mapping/troubleshooting/mapping-troubleshooting) |
| TUT-18 | Using vanilla B42.10 PNGs | Mr. Mapper | [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview) |
| TUT-19 | Placing your map on the vanilla map | Mr. Mapper | [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview) |
| TUT-20 | Adding / updating tiles | Mr. Mapper | [04](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) |
| TUT-21 | Removing a BMP from your world | Mr. Mapper | [07](/pz/build-42/mapping/troubleshooting/mapping-troubleshooting) |
| TUT-22 | Wiki page index | SimKDT | this file |
| TUT-23 | Custom vehicle spawn zones | BlackshotGER | [05](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview) |
| TUT-24 | Script-file documentation | SimKDT | [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview) |
| TUT-25 | BuildingEd room templates | BlackshotGER | [03](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) |
| TUT-26 | Official + Crater tools color tables | Mr. Mapper | [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview), [08](/pz/build-42/mapping/fundamentals/b41-vs-b42-mapping-delta) |
| TUT-27 | Custom distributions (roomdefs) | BlackshotGER | [05](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview) |
| TUT-28 | Custom MapUI (spawn location) | Raely (with Pabbiqo) | [06](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps) |
| TUT-29 | Cell size in B42 | Mapping-Helper | [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview), [08](/pz/build-42/mapping/fundamentals/b41-vs-b42-mapping-delta) |
| (Jul 2026) | Installing the PZ Mapping Tools | Alree / Unjammer | [01](/pz/build-42/mapping/fundamentals/tools-setup) |

---

## PZwiki pages used (with their own staleness banners)

The wiki self-reports which build each page was last revised for. That matters --
several are behind 42.20.0.

| Page | Revised for | Used in |
|---|---|---|
| Mod structure | **42.20.0 (current)** | [06](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps) |
| Mapping | **42.20.0 (current)** | [01](/pz/build-42/mapping/fundamentals/tools-setup), [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview) |
| Room definitions and item spawns | **42.20.0 (current)**, autogenerated | [05](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview) |
| Procedural distributions | **42.20.0 (current)** | [05](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview), [10](/pz/build-42/mapping/troubleshooting/lua-and-modding-practices) |
| Game files | **42.20.0 (current)** | [10](/pz/build-42/mapping/troubleshooting/lua-and-modding-practices) |
| Lua (API) | 42.17.0 | [10](/pz/build-42/mapping/troubleshooting/lua-and-modding-practices) |
| mod.info | 42.17.0 | [06](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps) |
| Scripts | 42.17.0 | [10](/pz/build-42/mapping/troubleshooting/lua-and-modding-practices) |
| map.info | 42.16.0 | [06](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps) |
| Getting started with modding | 42.11.0 | [10](/pz/build-42/mapping/troubleshooting/lua-and-modding-practices) |
| Tiledefs used by mods | 42.9.0 | [04](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) |
| Adding new tiles | **41.78.19** -- B41-era, validate in B42 | [04](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) |
| Vehicle zones | **41.78.19** -- B41-era, but zone names match B42 vanilla | [05](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview) |

Corrected links:

- Sample mod + project has **moved**:
  https://github.com/Unofficial-PZ-Mapping-Discord/Sample-Mod-and-Project-
  (was under `pzmapping/`)
- Coordinate map, as supplied by the user: https://map.projectzomboid.com/?b=1
  The `?b=1` parameter is presumably a build/layer selector. I could not confirm
  what it selects -- the page is a JS app and its markup mentions both 41 and 42.
  The screenshot supplied shows the B42 town set (Coalfield, Ekron, Echo Creek,
  Fallas Lake, Brandenburg), so **`b=1` is not simply "B41"**. Treat the
  "use B41 coordinates" rule as still correct but verify the layer you are
  reading from.

## Corrections applied after first compilation

| What I had | Corrected to | Source |
|---|---|---|
| `table.insert(Distributions, t)` inserts at position 1 | It **appends**; only the 3-arg form inserts at 1. Vanilla claims slot 1; mods append and are merged in | Game source |
| (not stated) | The merge is **purely additive** and can never overwrite an existing scalar, from any position | Game source |
| Mod layout is `42.0/` + `common/` | Version folder naming is flexible with minor-version truncation; `common/` effectively mandatory; develop in `Zomboid/Workshop/`, not `mods/` | PZwiki 42.20.0 |
| `X_Y.lotpack` | `world_X_Y.lotpack` | Installed game |
| Official B42 tools are released | **Not released.** Compilable from GitHub; release promised after 42.20.0 hotfixes | PZwiki 42.20.0 |
| One community toolchain (Alree) | Two: Alree's and Crater's Community Edition, with different color tables | PZwiki 42.20.0 |
| (not stated) | Mod maps sharing adjacent 256x256 cells **clash; one will not load** | PZwiki 42.20.0 |
| (not stated) | Tiledef numbers are a global namespace: 0-99 reserved, 100-16382 valid, >8190 breaks sprite IDs | PZwiki |
| (not stated) | Vehicle zones must be a multiple of 4x3 | PZwiki |

## Known gaps

Gaps **closed** in the second pass: basement technical workflow, Erika's depthmap
guide, Erika's seating guide, vehicle-zone command explanations, mod structure,
tiledef numbering, Lua load order, MapUI overlay script.

Still open:

- **Mannequins as fake NPCs** -- the whole guide is an annotated image; no
  procedure was ever posted as text.
- **Tile slicing templates** -- ZIP files posted in-channel; no public link
  captured.
- **Biomemap authoring workflow** -- the channel itself says there is no guide
  ("everything is scattered around"; search for oppolla's biome map). What is in
  [02](/pz/build-42/mapping/fundamentals/world-and-cells-overview) comes from the tools' own generator documentation,
  not from a community tutorial.
- **Crater's Community Edition tools** -- named and recommended by the wiki, but
  no setup steps or color table captured here. [01](/pz/build-42/mapping/fundamentals/tools-setup) documents
  Alree's fork only.
- **Official B42 tools** -- not released; the compile-from-GitHub path is not
  documented here.
- **`.pzby` export procedure** -- referenced by `basements.lua`'s own header
  comment and by Alree's workflow, but no step-by-step exists in the material.
- **`?b=1` map parameter** -- semantics unconfirmed; see above.
- **Blackshots template file** -- offered for reuse in-channel; not captured.
