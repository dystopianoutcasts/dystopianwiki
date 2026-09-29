---
id: build-42-b41-vs-b42-mapping-delta
slug: b41-vs-b42-mapping-delta
title: Build 41 vs Build 42 mapping delta
game: pz
version: build-42
section: mapping
category: fundamentals
difficulty: beginner
tags:
  - b41-vs-b42
  - mapping-delta
  - migration
excerpt: Read this if you already know B41 mapping. It is the delta only.
last_updated: '2026-09-29'
---
# Build 41 vs Build 42 mapping delta

> Source: 08-b41-vs-b42.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Read this if you already know B41 mapping. It is the delta only.

---

## Geometry

| | B41 | B42 |
|---|---|---|
| Authoring cell | 300 x 300 | 300 x 300 (Legacy) **or** 256 x 256 (Native) |
| Shipped game cell | 300 x 300 | **256 x 256** |
| Chunk | 10 x 10 | **8 x 8** |
| Lots per cell | 10 x 10 | 8 x 8 |
| Zombie heatmap samples per cell | 30 x 30 (1 px = 10x10 squares) | 30 x 30 legacy / **32 x 32 native** (1 px = 8x8 squares) |

`[VERIFIED -- vanilla map.info: "Chunk size is 8x8, Cell size is 256x256"]`

Consequence: if you author at 300, export splits into 256 files. You get **more
output files than cells**, with numbering that does not match your WorldEd cells.
That is correct, not a bug.

The grid choice is a **project property** set at `File > New World` and cannot be
safely flipped later. `[VERIFIED]`

---

## Coordinates

**Unchanged: use B41 coordinates.** Coordinates read from the B42 online map put
your map in the wrong place. Use https://map.projectzomboid.com/. `[COMMUNITY]`

---

## Base image colors

The `Map.png` / `Map_veg.png` color table **changed**. A B41 palette produces
wrong terrain in B42.

Three tables now exist and are not interchangeable `[COMMUNITY]`:

- B41 colors
- B42 colors for the Unjammer/Crater unofficial tools --
  https://github.com/pzmapping/B42-Colors/blob/main/MAP%20and%20MAP_veg%20Colors.png
- B42 colors for the **official** tools (posted 2026-04-03)

In the current tools the effective palette comes from the **project's
`Rules.txt`**, and unknown colors are reported with RGB + pixel coordinate rather
than silently approximated. `[VERIFIED]`

---

## New systems that did not exist in B41

| System | What it is | Where |
|---|---|---|
| **Biomemap** | Per-256x256-tile PNG. Red channel = biome IDs, green channel = foraging-zone IDs. Replaces `objects.lua` as the carrier for seven zone types. | `media/maps/<Map>/maps/biomemap_X_Y.png` |
| **`streets.xml`** | Named, variable-width street polylines (42.20). WorldEd has a dedicated Street Name Editor. | `media/maps/<Map>/streets.xml` |
| **`WorldGenOverride.lua`** | Static worldgen modules: forced water, forced prefabs (highways, roads), jumbo-tree overrides. | `media/maps/<Map>/WorldGenOverride.lua` |
| **Jumbo trees** | `IsoTreeJumbo` -- main sprite `N` drawn with treetop `N+6`. Biomemap ID 171 = Forced Redbud Jumbo XXL (map override). | Tile data + biomemap + `WorldGenOverride.lua` |
| **Depthmaps** | Per-tile depth information for correct occlusion of custom tiles. | Depth Map Editor |
| **Seating** | `seating.txt` assigns sit positions to tiles. Version 3 format. | `media/seating.txt` |
| **Snow tiles** | `SnowTile` definitions with `roofs_01`..`roofs_05` -> `e_roof_snow_1` fallback. | Tile data; previewable in TileZed |
| **Animals** | Farm animals via `Ranch` zones; wildlife via `Animal` polylines with `Action` / `AnimalType`. | `objects.lua` |
| **Zoom pyramids** | `pyramid.zip`, `forest.pyramid.zip`, `spawnSelectImagePyramid.zip` for the map UI. | `media/maps/<Map>/` |
| **Versioned mod folders** | `42.0/` + `common/` split alongside the flat legacy layout. | Mod root |

`[VERIFIED unless noted]`

---

## The seven zones that moved out of objects.lua

`Vegitation`, `DeepForest`, `Forest`, `TownZone`, `Farm`, `FarmLand`,
`TrailerPark` are now consumed from the **biomemap green channel**. The game's
`metazoneHandler` deliberately ignores them in `objects.lua`. `[VERIFIED]`

Everything else -- vehicle zones, geometries, WorldGen, `WaterZone`, animal
zones, `ZombiesType` metazones -- still exports through `objects.lua`.

If you carried a B41 workflow forward and wonder why your forest zones do
nothing, this is why.

---

## Vegetation on upper levels

New in B42: `vegetation_foliage_01` works above ground level. The B41-era set
(`e_americanholly_01` first 4 trees, `e_canadianhemlock_01` first 4 trees,
`blends_grassoverlays_01`) still works in both. `[COMMUNITY]`

---

## Basements

The `.pzby` / `basements.lua` mechanism is retained from Tim Baker's `basements`
branch, and the current tools preserve basement and negative-level support.
`[VERIFIED]`

In B42 vanilla, the historical B41 procedural basement entries
(`basement_10x10_1story_*`, `basement_7x7_1story_*`, Lemmy's 10x10-chunk
multi-story basement) are all **commented out**. The live random pool is made of
`lot_basement_*` entries; commented ones are unique basements placed as lots in
WorldEd and do not spawn randomly. `[VERIFIED]`

---

## Loot / distributions

Paths in B42 stable `[VERIFIED]`:

```
media/lua/server/Items/Distributions.lua
media/lua/server/Items/ProceduralDistributions.lua
media/lua/server/Items/SuburbsDistributions.lua
media/lua/server/Vehicles/VehicleDistributions.lua
```

Older guides (and the wiki's room lists) point at `media/lua/server/Distributions.lua`
and outdated room names. Read the installed game files instead.

---

## Toolchain

| | B41 era | B42 now |
|---|---|---|
| Install shape | `B42.Mapping.Tools` with `config.exe` and a `TileD` folder | Portable tree: `bin/`, `config/`, `Tiles/`, `settings/`, `lua/`, `themes/` |
| Configuration | Registry / `%APPDATA%` / `config.exe` | `settings/PZTools.ini`, shared by all three editors, first-run wizard |
| BuildingEd | Inside TileZed | **Standalone executable** with its own icon |
| Tileset loading | Lazy / per-map | Full catalog preloaded at startup and kept resident |
| Adding a tile PNG | Restart required | Directory watcher picks it up live |
| Tiles path ending in `/2x` | Broke everything | Normalized to the parent automatically |
| Logs | User profile | `settings/logs` |

`[VERIFIED]`

---

## Things that did NOT change

- The overall pipeline: paint `Map.png` + `Map_veg.png` -> BMP-to-TMX -> edit
  cells in TileZed -> build in BuildingEd -> place lots and zones in WorldEd ->
  generate lots -> package as a mod.
- Coordinates come from the B41 map site.
- `objects.lua`, `spawnpoints.lua`, `regions.lua` formats.
- `mod.info`: no trailing comma on the last item.
- Room internal names drive loot; `ItemPickerJava` resolves room first, then
  container type.
- BuildingEd templates are copied into each building, so editing a template does
  not retroactively change existing buildings.
