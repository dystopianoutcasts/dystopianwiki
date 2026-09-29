---
id: build-42-mapping-overview
slug: mapping-overview
title: Mapping overview
game: pz
version: build-42
section: mapping
category: fundamentals
difficulty: beginner
tags:
  - mapping-overview
  - worlded
  - tilezed
  - getting-started
excerpt: >-
  Compiled: 2026-08-02 Scope: Build 42 STABLE map modding (world, cells,
  buildings, tiles, zones, packaging).
last_updated: '2026-09-29'
---
# Mapping overview

> Source: README.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Compiled: 2026-08-02
Scope: Build 42 STABLE map modding (world, cells, buildings, tiles, zones, packaging).

This is a consolidation of the `#b42-tutorials-and-guides` community channel dump
(April 2025 -- July 2026), cross-checked against:

- The installed game: `R:\Games\Steam\steamapps\common\ProjectZomboid`
  (B42 stable, git rev `a2947723ca`, Steam buildid `24449119`, updated 2026-07-29)
- The sealed engine snapshot at `R:\ZOMBOID\PZ_Engine_Records\B42\`
- The current tool distribution: `Unjammer/PZ_Mapping_Tools`, release
  `42.20STABLE_02c` (build 20260802), plus its shipped `PZToolsGuide.html`,
  `MappingSpawnControl.html` and `README.md`

Every claim carries a marker:

| Marker | Meaning |
|---|---|
| `[VERIFIED]` | Confirmed against the installed game or the official tool docs |
| `[TOOLS]` | Documented behavior of the unofficial PZ Mapping Tools |
| `[COMMUNITY]` | From the Discord guides; plausible and widely used, not independently confirmed |
| `[STALE]` | Was correct at the time it was written, superseded since -- do not follow |

---

## Documents

| File | Covers |
|---|---|
| [01-tools-setup.md](/pz/build-42/mapping/fundamentals/tools-setup) | Installing and configuring the current mapping tools; what changed from the 2025 setup |
| [02-world-and-cells.md](/pz/build-42/mapping/fundamentals/world-and-cells-overview) | Cell geometry (300 vs 256), coordinates, base PNGs, BMP-to-TMX, lot export, biomemap, heatmap, streets |
| [03-buildings.md](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) | BuildingEd, room templates, basements, the pre-release building checklist |
| [04-tiles.md](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) | Tilesets, tiledefs, depthmaps, seating, tile slicing, art style |
| [05-zones-and-spawns.md](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview) | objects.lua zones: vehicles, animals, rooms/loot, spawnpoints, mannequins, what mapping can and cannot control |
| [06-mod-packaging.md](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps) | Mod folder structure, map.info, biomemap placement, custom spawn-select map UI |
| [07-troubleshooting.md](/pz/build-42/mapping/troubleshooting/mapping-troubleshooting) | Known failure modes and their fixes |
| [08-b41-vs-b42.md](/pz/build-42/mapping/fundamentals/b41-vs-b42-mapping-delta) | The complete delta -- what a B41 mapper must unlearn |
| [10-lua-and-modding-practices.md](/pz/build-42/mapping/troubleshooting/lua-and-modding-practices) | Lua load order, the "don't guard globals" rule, zedscript syntax traps, distribution practices |
| [09-sources.md](/pz/build-42/mapping/sources/sources-and-provenance) | Link index and provenance for every item above |

---

## The five-minute version

1. **Get the current tools.** `PZ_Mapping_Tools` releases, latest build. Extract
   outside any Steam folder. Add the separately-downloaded `Tiles` folder next to
   `bin`. Run `bin\PZWorldEd.exe`. It self-configures. `[VERIFIED]`
2. **Pick your grid at project creation.** `File > New World` asks for
   300x300 (Legacy) or 256x256 (Native). This is a per-project property and
   cannot be safely changed later. `[TOOLS]`
3. **Author the world from two PNGs.** `Map.png` (ground) + `Map_veg.png`
   (vegetation), using the B42 color table. Convert with BMP-to-TMX. `[COMMUNITY]`
4. **Place coordinates using B41 numbers.** The B42 online map's coordinates do
   not match what WorldEd expects. Use `map.projectzomboid.com`. `[COMMUNITY]`
5. **Build in BuildingEd**, place buildings as lots in WorldEd, paint zones,
   generate lots, export the mod, drop it in `%USERPROFILE%\Zomboid\mods`.

---

## Note on the source material

The pasted notes are the B42 channel, but several entries were written against
the April 2025 toolchain and are now stale -- specifically the
`B42.Mapping.Tools` / `config.exe` / `TileD` folder setup. The current tools are
a single portable tree (`bin/`, `config/`, `Tiles/`, `settings/`) with no
`config.exe` at all. [01-tools-setup.md](/pz/build-42/mapping/fundamentals/tools-setup) covers the current
procedure and flags the obsolete steps explicitly.

Where the B41 workflow still applies unchanged, [08-b41-vs-b42.md](/pz/build-42/mapping/fundamentals/b41-vs-b42-mapping-delta)
says so rather than repeating it.
