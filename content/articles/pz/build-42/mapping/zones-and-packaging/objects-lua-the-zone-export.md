---
id: build-42-objects-lua-the-zone-export
slug: objects-lua-the-zone-export
title: objects.lua -- the zone export
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
  WorldEd objects are written to objects.lua with name, type, geometry, level
  and properties. The game's metazone loader registers them with the meta grid.
  [VERIFIED]
last_updated: '2026-09-29'
related_articles:
  - what-mapping-can-and-cannot-control
  - zombie-type-outfit-zones
  - vehicle-spawn-zones
  - farm-and-wildlife-animals
  - loot-room-definitions-and-custom-distributions
  - spawn-points
  - mannequins-as-fake-npcs
  - editor-lua-vs-gameplay-lua
---
# objects.lua -- the zone export

> Source: 05-zones-and-spawns.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

WorldEd objects are written to `objects.lua` with `name`, `type`, geometry,
level and properties. The game's metazone loader registers them with the meta
grid. `[VERIFIED]`

Vanilla format, confirmed in the installed game:

```lua
objects = {
  { name = "", type = "Nav",       x = 12592, y = 966,  z = 0, width = 8,  height = 234 },
  { name = "", type = "TownZone",  x = 12541, y = 1090, z = 0, width = 32, height = 58 },
  { name = "", type = "Vegitation",x = 12325, y = 1188, z = 0, width = 15, height = 12 },
}
```

Note `Vegitation` is spelled that way in the engine. Do not "fix" it.

**Remember the biomemap split:** seven zone types (`Vegitation`, `DeepForest`,
`Forest`, `TownZone`, `Farm`, `FarmLand`, `TrailerPark`) are consumed from the
biomemap green channel and deliberately ignored in `objects.lua` by the game's
`metazoneHandler`. Every other vector zone/object type -- vehicle zones,
geometries, WorldGen, `WaterZone`, animal zones -- still ships through
`objects.lua`. `[VERIFIED]`

A sibling file, `regions.lua`, carries named `Region` rectangles:

```lua
regions = {
  { name = "Jefferson", type = "Region", x = 12400, y = 4500, z = 0, width = 600, height = 600, },
}
```
`[VERIFIED -- vanilla Muldraugh]`
