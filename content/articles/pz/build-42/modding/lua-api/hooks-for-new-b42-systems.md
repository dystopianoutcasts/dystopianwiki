---
id: build-42-hooks-for-new-b42-systems
slug: hooks-for-new-b42-systems
title: Hooks for new B42 systems
game: pz
version: build-42
section: modding
category: lua-api
difficulty: intermediate
tags:
  - lua-api
  - events
  - moddata
  - timed-actions
  - multiplayer
excerpt: >-
  New craftRecipe script block replaces B41 recipe. Supports item inputs, fluid
  inputs, alternative ingredients (/ OR-separator), keep for tools,
  OnTest/OnCreate Lua hooks, Category, and OnGiveXP...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
  - registries-lua-the-new-b42-13-identifier-system
  - the-events-system
  - key-globals-and-classes
  - moddata
  - multiplayer-command-patterns
  - timed-actions
  - ui
  - engine-internals-calling-exposed-java-from-lua
  - b41-b42-breaking-changes
  - debugging-lua-in-b42
  - recommended-tooling
---
# Hooks for new B42 systems

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 14.1 Crafting (craftRecipe)  [CONFIRMED direction / schema details UNCERTAIN — not in pzwiki cache]
- New `craftRecipe` script block replaces B41 `recipe`. Supports item inputs, **fluid inputs**, alternative ingredients (`/` OR-separator), `keep` for tools, `OnTest`/`OnCreate` Lua hooks, `Category`, and `OnGiveXP`.
- Workstations/benches can require **attached fluid containers** plus item inputs; recipes can demand precise fluid mixes.
- **Action item:** get the current `craftRecipe` schema from the game's own `media/scripts/` — the vanilla recipes are the authoritative spec.

### 14.2 Fluids  [LIKELY]
- New **FluidContainer** meta-entity system (items declare a FluidContainer component with `ContainerName`, `Capacity`, `Fluids`). Meta-level containers (rain collectors) fill while the player is away.
- Lua access is **limited** — vanilla exposes only partial FluidContainer control to Lua. React to level changes with `Events.OnWaterAmountChange`.

### 14.3 Animals / husbandry  [CONFIRMED existence / API partly UNCERTAIN]
- Persistent animal entities (`IsoAnimal`, an exposed Java class per pzwiki Java object index) with genetics; husbandry works in MP.
- **`AnimalDefinitions`** global Lua table holds animal definitions — primary modding entry point.
- Animals are characters; they fire generic character events (`OnCharacterDeath`, etc.). Community "Animal Essentials" [B42.14+] exists as a building block.

### 14.4 Basements / underground  [CONFIRMED existence / Lua API UNCERTAIN]
- ~400 procedurally generated basements; multi-level below-ground is first-class. No dedicated Lua "basement API" surfaced — treat basements as regular multi-Z cells/chunks and verify coordinate/z logic.

---

<a name="15-debugging"></a>
