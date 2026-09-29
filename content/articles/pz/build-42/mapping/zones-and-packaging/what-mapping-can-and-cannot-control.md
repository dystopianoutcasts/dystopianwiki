---
id: build-42-what-mapping-can-and-cannot-control
slug: what-mapping-can-and-cannot-control
title: What mapping can and cannot control
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
  This table is the single most useful thing to internalize before you start
  painting zones. [VERIFIED -- MappingSpawnControl.html, checked against the
  mapping-tool sources and the game engine/Lua...
last_updated: '2026-09-29'
related_articles:
  - objects-lua-the-zone-export
  - zombie-type-outfit-zones
  - vehicle-spawn-zones
  - farm-and-wildlife-animals
  - loot-room-definitions-and-custom-distributions
  - spawn-points
  - mannequins-as-fake-npcs
  - editor-lua-vs-gameplay-lua
---
# What mapping can and cannot control

> Source: 05-zones-and-spawns.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

This table is the single most useful thing to internalize before you start
painting zones. `[VERIFIED -- MappingSpawnControl.html, checked against the
mapping-tool sources and the game engine/Lua sources]`

| Goal | Achievable from the map alone? | What actually controls it |
|---|---|---|
| Zombie population density | **Yes** | WorldEd Zombie Heatmap writes an intensity byte per output chunk. Sandbox population, redistribution and runtime rules still apply on top. |
| Zombie outfit / type in an area | **Yes**, with Lua definitions | A WorldEd metazone selects a `ZombiesZoneDefinition`. Chance, gender, outfit and room filters come from Lua. |
| A specific zombie at a specific square | **No** | Requires a runtime Lua event/mod. Room and heatmap data are population inputs, not fixed entities. |
| Container loot family | **Yes** | BuildingEd room internal names, container sprite/type, tiles and WorldEd zones select or force distributions. |
| A guaranteed specific item instance | **No** | Requires a deliberately constrained custom distribution, or runtime Lua (`OnFillContainer`, `AddWorldInventoryItem`). The map does not serialize a ready-made inventory item at a coordinate. |
