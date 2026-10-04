---
id: build-42-b41-b42-breaking-changes
slug: b41-b42-breaking-changes
title: B41 -> B42 BREAKING CHANGES
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
excerpt: This is the section to act on. Ordered by blast radius.
last_updated: '2026-10-04'
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
  - hooks-for-new-b42-systems
  - debugging-lua-in-b42
  - recommended-tooling
---
# B41 -> B42 BREAKING CHANGES (the porting list)

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

This is the section to act on. Ordered by blast radius.

### 13.1 Mod packaging  [CONFIRMED]
- **Versioned folder layout** (`common/media` + `42/mod.info`). Old flat layout still tolerated for single-build, but adopt the new shape.
- Server `Mods=` entries must match `id` exactly.

### 13.2 Crafting system replaced  [CONFIRMED]
- The B41 `recipe { ... }` block does **not** carry over unchanged. B42 uses **`craftRecipe`** with explicit inputs/outputs, fluid inputs, and workstation/tag requirements. Old recipes commonly fail silently or throw. **Rewrite all recipes.** See [Section 14.1](/pz/build-42/modding/lua-api/lua-api-and-engine-overview).

### 13.3 Identifier + registry overhaul (42.13)  [CONFIRMED it happened]
- New `media/registries.lua` for identifiers, loaded before all Lua. Official migration guide + `testmod_registries.zip` exist. **[exact API UNCERTAIN — see Section 5; not in the pzwiki cache used here]**

### 13.4 Server-authoritative logic (42.13.1)  [CONFIRMED — pzwiki Networking, revid 1436101]
- Server now handles most of the logic for **player damage, item stats, etc.** Set these server-side and call sync functions (`syncPlayerStats`, etc.) to push what changed. B41 mods that mutated stats client-side will find changes don't stick. This is a genuine porting task, not just a rename.

### 13.5 Timed actions must be global in MP (42.13.0)  [CONFIRMED — pzwiki Timed Action (Lua), revid 1322383]
- File-local timed-action tables that worked in B41 MP now need `_G[Action.Type] = Action` (prefixed Type). See [Section 10](/pz/build-42/modding/lua-api/lua-api-and-engine-overview).

### 13.6 Renamed / removed vanilla APIs (~42.17)  [LIKELY]
- Multiple mods hit `attempt to call nil` after 42.17 because vanilla methods were renamed/removed. **There is no single canonical rename table in accessible sources.** Porting approach:
  1. Run the mod with the Lua debugger enabled ([Section 15](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)).
  2. For each `nil` call, find the object's current methods in the B42 JavaDocs/LuaDocs and remap (walk the parent-class chain, [Section 7](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)).
  3. Common suspects: crafting/recipe accessors, fluid/water methods, forage/search API, and old B41 map/basement assumptions.
- **One rename we checked in the code: tile flags.** On `PropertyContainer` (what `sprite:getProperties()` gives you), Build 41's `Is`, `Set` and `UnSet` are now `has`, `set` and `unset`; only `CreateKeySet` kept its capital. On `IsoGridSquare`, Build 41's `Is` is now `has` (and the square gained `set` and `unset`). A Build 41 ladder mod we studied made 32 such calls, and every one is a call to nil on Build 42.

> **Proof:** Code. `zombie.core.properties.PropertyContainer` (`has`, `set`, `unset`, `CreateKeySet`; no `Is`, `Set` or `UnSet`) and `zombie.iso.IsoGridSquare` (`has`, `set`, `unset`; no `Is`) in the 42.21 decompile, against `Is`, `Set` and `UnSet` on `PropertyContainer` and `Is` on `IsoGridSquare` in our Build 41 decompile (41.78.16). Build 42.21.0 (revision 4a0e9546ec).

### 13.7 Water -> fluid system  [LIKELY]
- Water handling moved under the new **FluidContainer** system. Old item water methods may need the fluid-container API. `Events.OnWaterAmountChange` exists for reacting to level changes. **[Section 14.2](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)**

### 13.8 Foraging/search reworked  [CONFIRMED]
- New/renamed events: `onAddForageDefs`, `preAddForageDefs`, `onEnableSearchMode`/`onDisableSearchMode`/`onToggleSearchMode`, `onFillSearchIconContextMenu`.

### 13.9 Build-cursor and controller event split  [CONFIRMED]
- `OnDoTileBuilding2` (keyboard/mouse) vs `OnDoTileBuilding3` (controller). Cover both.

### 13.10 World/save assumptions  [CONFIRMED]
- Bigger map, multi-level basements, reworked chunk/erosion. Re-check any coordinate/z-level/chunk logic.

### 13.11 Sandbox options  [CONFIRMED]
- Sandbox config (esp. loot multipliers) was redesigned; do not copy B41 sandbox config verbatim.

---

<a name="14-new-systems"></a>

*Updated 2026-10-04: added the tile-flag rename (`Is`/`Set`/`UnSet` to `has`/`set`/`unset`), checked in the code.*
