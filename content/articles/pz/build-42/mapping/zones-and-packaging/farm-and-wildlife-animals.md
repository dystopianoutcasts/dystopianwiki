---
id: build-42-farm-and-wildlife-animals
slug: farm-and-wildlife-animals
title: Farm and wildlife animals
game: pz
version: build-42
section: mapping
category: zones-and-packaging
difficulty: intermediate
tags:
  - zones
  - objects-lua
  - spawn-points
  - loot-distribution
excerpt: >-
  Open the world cell. Select the Ranch object group (you can move objects into
  it later). Add a zone with Create Object (O) (rectangle) or Create Object
  (Polygon). Name the zone one of: chicken...
last_updated: '2026-09-29'
related_articles:
  - what-mapping-can-and-cannot-control
  - objects-lua-the-zone-export
  - zombie-type-outfit-zones
  - vehicle-spawn-zones
  - loot-room-definitions-and-custom-distributions
  - spawn-points
  - mannequins-as-fake-npcs
  - editor-lua-vs-gameplay-lua
---
# Farm and wildlife animals `[COMMUNITY -- BlackshotGER, B42.11]`

> Source: 05-zones-and-spawns.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### Farm animals

1. Open the world cell.
2. Select the **`Ranch`** object group (you can move objects into it later).
3. Add a zone with *Create Object (O)* (rectangle) or *Create Object (Polygon)*.
4. Name the zone one of: `chicken`, `cow`, `pig`, `rabbit`, `sheep`, `turkey`.

No properties needed. Notes:

- Farm animals appear not to spawn if the zone is too close to another Ranch zone.
- Zones work on levels other than ground floor.

### Wild animals

Exact wildlife generation likely depends on biomes, but animals can be spawned
with `Animal` and `Ranch` zones.

1. Select the **`Animal`** object group.
2. Add a path with *Create Object (Polyline)* -- this is the movement route.
3. Give it properties:
   - `Action = follow`
   - `AnimalType = deer` or `rabbit` (`small` spawns rabbits, `large` spawns deer;
     `medium` spawned nothing at the time of writing)
4. **At each intermediate point of the follow polyline (all except start and end)
   you must add another polyline. If you do not, the game crashes.**
5. Add polylines consisting of only a start and end point.
6. Give each of those:
   - `Action = eat` or `sleep`
   - `AnimalType = the same as the follow line`

Object names are optional. At the time of writing only rabbits and deer worked --
raccoons did not.
