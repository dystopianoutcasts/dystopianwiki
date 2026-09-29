---
id: build-42-zombie-type-outfit-zones
slug: zombie-type-outfit-zones
title: Zombie type / outfit zones
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
  The engine checks zones in zombie/characters/ZombiesZoneDefinition.java:
  [VERIFIED -- MappingSpawnControl]
last_updated: '2026-09-29'
related_articles:
  - what-mapping-can-and-cannot-control
  - objects-lua-the-zone-export
  - vehicle-spawn-zones
  - farm-and-wildlife-animals
  - loot-room-definitions-and-custom-distributions
  - spawn-points
  - mannequins-as-fake-npcs
  - editor-lua-vs-gameplay-lua
---
# Zombie type / outfit zones

> Source: 05-zones-and-spawns.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The engine checks zones in `zombie/characters/ZombiesZoneDefinition.java`:
`[VERIFIED -- MappingSpawnControl]`

- A zone with `type = "ZombiesType"` uses its **name** as the definition key.
- A zone whose **type** directly matches a `ZombiesZoneDefinition` key is also
  accepted.
- The chosen Lua definition controls `chanceToSpawn`, `toSpawn`, gender chances,
  outfits, mandatory counts and optional room filters.

This constrains what spawns in an area strongly, but the engine still selects at
spawn time. Guaranteeing a concrete zombie at one X/Y/Z requires gameplay Lua.

Authoring order: create the metazone in WorldEd -> export `objects.lua` -> ship a
matching `ZombiesZoneDefinition` in the map mod.
