---
id: build-42-editor-lua-vs-gameplay-lua
slug: editor-lua-vs-gameplay-lua
title: Editor Lua vs gameplay Lua
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
  TileZed Lua can inspect, place, delete and replace tiles by exact name and
  coordinate, and create/edit object-layer rectangles and properties. BuildingEd
  Lua can do those tile operations on...
last_updated: '2026-09-29'
related_articles:
  - what-mapping-can-and-cannot-control
  - objects-lua-the-zone-export
  - zombie-type-outfit-zones
  - vehicle-spawn-zones
  - farm-and-wildlife-animals
  - loot-room-definitions-and-custom-distributions
  - spawn-points
  - mannequins-as-fake-npcs
---
# Editor Lua vs gameplay Lua `[VERIFIED]`

> Source: 05-zones-and-spawns.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

TileZed Lua can inspect, place, delete and replace tiles by exact name and
coordinate, and create/edit object-layer rectangles and properties. BuildingEd
Lua can do those tile operations on user/grime layers and edit room assignments.

**Neither executes the Project Zomboid gameplay Lua VM.** They author the map
context that the gameplay VM later reads.
