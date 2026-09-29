---
id: build-42-zones-vehicle-parking-zones-foraging
slug: zones-vehicle-parking-zones-foraging
title: 'Zones: vehicle/parking zones + foraging'
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
  For vehicles to spawn, add object zones that are multiples of 4x3 (8x6, 4x6,
  12x3, ...), of type ParkingStall, named one of:
last_updated: '2026-09-29'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - the-map-expansion-knox-country-new-towns
  - multi-z-the-vertical-engine-change
  - basements-the-underground-system
  - tile-system
  - the-new-lighting-rendering-engine
  - map-modding-toolchain-for-b42
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
---
# Zones: vehicle/parking zones + foraging

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 10.1 Vehicle / parking zones (CONFIRMED -- pzwiki: Vehicle zones, revid 1394717)
For vehicles to spawn, add **object zones** that are **multiples of 4x3** (8x6,
4x6, 12x3, ...), of type **`ParkingStall`**, named one of:

`parkingstall` (common, random cars) - `trailerpark` (burnt/piled junk cars) -
`bad` (poor areas) - `medium` (suburbs) - `good` (nice houses) - `sport` (sports
cars) - `junkyard` (damaged/burnt, fewer keys, also random crashes) -
`trafficjamw` / `trafficjame` / `trafficjams` (directional jams, burnt/damaged) -
`police` - `fire` - `ranger` - `mccoy` (McCoy Lumber) - `postal` - `spiffo` -
`ambulance` - `radio` - `fossoil` - `normalburnt` / `specialburnt` (burnt-vehicle
pools: 20% special, 80% normal).

`ParkingStall` is the one map-zone type explicitly confirmed by the cache.

### 10.2 Foraging + biome zones -- STILL UNCERTAIN (cache silent)
**Honest status:** none of the cached PZwiki pages document the B42 foraging-zone
Lua/file schema, nor a "biomes are auto-generated" statement. (The auto-generation
and biomemap-generator claims in the earlier draft were community/tool sourced,
not wiki-confirmed.) The Room definitions reference (revid 1392885) covers only
Room -> Container mappings, not outdoor forage zones.

- **Confirmed:** `ParkingStall` object zones exist (10.1).
- **Unconfirmed by cache:** the Nav / DeepForest / Forest / TownZone / Ranch /
  Vegetation taxonomy and the exact foraging-zone definition format. Keep these
  UNCERTAIN and verify against the (not-yet-cached) B42 foraging/zone wiki page or
  the running build. (See Gaps.)

---

<a name="11-mp"></a>
