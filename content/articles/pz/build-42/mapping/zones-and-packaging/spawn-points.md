---
id: build-42-spawn-points
slug: spawn-points
title: Spawn points
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
  media/maps//spawnpoints.lua is a plain Lua function returning named groups of
  coordinates. [VERIFIED -- vanilla Muldraugh]
last_updated: '2026-09-29'
related_articles:
  - what-mapping-can-and-cannot-control
  - objects-lua-the-zone-export
  - zombie-type-outfit-zones
  - vehicle-spawn-zones
  - farm-and-wildlife-animals
  - loot-room-definitions-and-custom-distributions
  - mannequins-as-fake-npcs
  - editor-lua-vs-gameplay-lua
---
# Spawn points

> Source: 05-zones-and-spawns.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`media/maps/<Map>/spawnpoints.lua` is a plain Lua function returning named
groups of coordinates. `[VERIFIED -- vanilla Muldraugh]`

```lua
function SpawnPoints()
    local poor_houses = {
        { posX = 10770, posY = 10271, posZ = 0 },
        { posX = 10637, posY = 10267, posZ = 0 },
    }
    local medium_houses = { ... }
    local rich_houses   = { ... }
    local doctor_houses = { ... }
    local police_station = { ... }
    ...
end
```

Group names map to the professions/occupations offered on the spawn screen.
