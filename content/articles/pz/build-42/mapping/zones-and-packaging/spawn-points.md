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
  spawnpoints.lua returns a table keyed by profession id, and a missing
  profession falls back to unemployed.
last_updated: '2026-11-21'
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

`media/maps/<Map>/spawnpoints.lua` is a plain Lua function that returns a table
keyed by **profession id**. Each key holds a list of coordinates. `[VERIFIED -- vanilla Muldraugh]`

```lua
function SpawnPoints()
    local poor_houses = {
        { posX = 10770, posY = 10271, posZ = 0 },
        { posX = 10637, posY = 10267, posZ = 0 },
    }
    local medium_houses = { ... }
    local rich_houses   = { ... }

    return {
        unemployed    = poor_houses,
        doctor        = mergeTable(medium_houses, rich_houses),
        policeofficer = mergeTable(poor_houses, medium_houses),
        ...
    }
end
```

Names like `poor_houses` are only Lua local variables that Muldraugh uses to
share one list between several professions; the game never sees them. What the
game reads is the returned table: it looks up the player's profession id, and if
that key is missing it falls back to `unemployed`. With neither key, character
creation stops with an error, so always include `unemployed`.
:cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:1092-1097`, `media/lua/client/OptionScreens/CoopCharacterCreation.lua:18-20`)]
The spawn screen's map preview also centers on the first `unemployed` point.
:cite[(`media/lua/client/OptionScreens/MapSpawnSelect.lua:727-730`)]
