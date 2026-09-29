---
id: build-42-map-files-map-info-spawnpoints-lua-folder-structure
slug: map-files-map-info-spawnpoints-lua-folder-structure
title: 'Map files: map.info, spawnpoints.lua, folder structure'
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
  File roles (CONFIRMED where stated; some are wiki stubs): .lotheader --
  defines the location/cell of your map. chunkdata_X_Y.bin -- chunk data (wiki
  stub). map.info -- map metadata (see 9.2)...
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
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
---
# Map files: map.info, spawnpoints.lua, folder structure

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 9.1 Map folder structure (CONFIRMED -- pzwiki: Mapping, revid 1443363)
```
media/
  maps/
    MyMap/
      maps/                (subfolder)
      X_Y.lotheader
      chunkdata_X_Y.bin
      map.info
      objects.lua
      spawnpoints.lua
      thumb.png
      worldmap-forest.xml
      worldmap.xml
      world_X_Y.lotpack
```
File roles (CONFIRMED where stated; some are wiki stubs):
- `.lotheader` -- defines the location/cell of your map.
- `chunkdata_X_Y.bin` -- chunk data (wiki stub).
- `map.info` -- map metadata (see 9.2).
- `objects.lua` -- **defines car spawns and navigation meshes** (corrects the
  earlier "generic map objects" description).
- `spawnpoints.lua` -- occupation spawn coordinates (see 9.3).
- `thumb.png` -- thumbnail for the map's spawn selection.
- `worldmap.xml`, `worldmap-forest.xml`, `world_X_Y.lotpack` -- wiki stubs.

### 9.2 map.info fields (CONFIRMED -- pzwiki: Map.info, revid 1390621, v42.16.0)
| Field | Meaning |
|-------|---------|
| `title` | Map title (can also come from a translation file). |
| `description` | Map description (translation-file capable). |
| `lots` | World map the map loads into. For inside vanilla: `lots=Muldraugh, KY`. |
| `fixed2x` | Boolean fixing rendering issues; leave `true` if unsure. |
| `zoomX` / `zoomY` | Camera position on the world map at spawn selection. |
| `zoomS` | Camera zoom at spawn selection. |
| `demoVideo` | Video shown when selecting the map. |

### 9.3 spawnpoints.lua (CONFIRMED exact schema -- pzwiki: spawnpoints.lua, revid 1316065, v42.13.1)
A `SpawnPoints()` function returns a dictionary of **occupation -> array of spawn
points**. B42 preferred form uses **absolute world coordinates**:
```lua
function SpawnPoints()
  return {
    chef = {
      { posX = 10606, posY = 9474, posZ = 0 },
      { posX = 10624, posY = 10533, posZ = 0 },
    },
    unemployed = {
      { posX = 10916, posY = 10133, posZ = 0 },
    },
  }
end
```
- `posX`, `posY` -- absolute world map coordinates.
- `posZ` -- Z level (`0` = ground; positive = up, negative = underground).

**B41 backwards-compatible form** (still supported): supply `worldX`/`worldY` as
**cell** coords, with `posX`/`posY` as **0-299 within the cell**. The game
computes absolute position as (verbatim from `iso/SpawnPoints.java`, v42.13.2):
```java
this.tempLocation.x = worldX.intValue() * 300 + posX.intValue();
this.tempLocation.y = worldY.intValue() * 300 + posY.intValue();
this.tempLocation.z = posZ == null ? 0 : posZ.intValue();
```
Note the **`*300`** -- spawnpoint cell math still uses the 300 grid even in B42.

---

<a name="10-zones"></a>
