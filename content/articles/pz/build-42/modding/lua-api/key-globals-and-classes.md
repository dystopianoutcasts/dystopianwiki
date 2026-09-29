---
id: build-42-key-globals-and-classes
slug: key-globals-and-classes
title: Key globals and classes
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
  The global functions below are defined by LuaManager.GlobalObject and are
  exposed as bare Lua globals (not as SomeClass.method). The wiki confirms this
  special exposure and shows getPlayer() /...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
  - registries-lua-the-new-b42-13-identifier-system
  - the-events-system
  - moddata
  - multiplayer-command-patterns
  - timed-actions
  - ui
  - engine-internals-calling-exposed-java-from-lua
  - b41-b42-breaking-changes
  - hooks-for-new-b42-systems
  - debugging-lua-in-b42
  - recommended-tooling
---
# Key globals and classes  [Bridge mechanism CONFIRMED — pzwiki Lua (API), revid 1390433; full method signatures remain a gap]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The global functions below are defined by **`LuaManager.GlobalObject`** and are exposed as bare Lua globals (not as `SomeClass.method`). The wiki confirms this special exposure and shows `getPlayer()` / `getCell()` as canonical examples. **[CONFIRMED — pzwiki Lua (API), revid 1390433]**

| Global | Returns / purpose |
|---|---|
| `getPlayer()` | The single local player (SP or the client's own player). **Can return `nil`** (e.g. when the player is dead) — always nil-check. Cache it outside loops. **[CONFIRMED nil-return — pzwiki EmmyLua, revid 1388079]** |
| `getSpecificPlayer(n)` | Player by local index `n` (0-based); used for splitscreen and by many context-menu callbacks. **[CONFIRMED still present]** |
| `getPlayerByOnlineID(id)` | Resolve an `IsoPlayer` from its network `onlineID` (server-side player lookup for commands). **[CONFIRMED — pzwiki Networking, revid 1436101]** |
| `getWorld()` | The `World` singleton (sandbox options, map name, etc.). |
| `getCell()` | The current `IsoCell` (grid squares, objects). |
| `getGameTime()` | The live `GameTime` **instance**. NOTE: `GameTime.instance` (accessed statically from Lua) is **not** the same object and carries the class defaults — use `getGameTime()` for real time/date. **[CONFIRMED — pzwiki Game time, revid 1388773]** |
| `getSandboxOptions()` | Sandbox var access. |
| `ModData.getOrCreate(key)` | Persistent global ModData (see [Section 8](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)). |
| `sendClientCommand(...)` / `sendServerCommand(...)` | MP command RPC (see [Section 9](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)). |
| `ZombRand(n)` | Engine RNG (use instead of `math.random` for determinism/MP). |
| `instanceof(obj, "ClassName")` | Runtime type check for Java objects. |
| `isClient()` / `isServer()` / `isAdmin()` | Environment + admin checks (see [Section 9](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)). **[CONFIRMED — pzwiki Networking, revid 1436101]** |

> **Correction:** earlier notes listed `getGameModData()` as the global-ModData accessor. The pzwiki-canonical accessor is **`ModData.getOrCreate("key")`** (from the `zombie.world.moddata.ModData` class). Use that. `getGameModData()` is not documented on the current pzwiki ModData page. **[CONFIRMED — pzwiki Mod data, revid 1317225]**

**Key Java classes exposed to Lua** (the wiki's `Java object` index lists these as usable from the API — **[CONFIRMED present — pzwiki Java object, revid 1389755]**): `IsoPlayer`, `IsoGameCharacter`, `IsoLivingCharacter`, `IsoZombie`, `IsoAnimal`, `IsoMovingObject`, `IsoGridSquare`, `IsoCell`, `IsoChunk`, `IsoBuilding`, `IsoRoom`, `IsoDeadBody`, `IsoLightSource`, `InventoryItem`, `InventoryItemFactory`, `ItemContainer`, `ItemVisual(s)`, `HumanVisual`, `ClimateManager`, `CharacterActionAnims`, `Stats`, `ArrayList`, `Random`.

**Class hierarchy matters.** Every exposed class is a subclass of another and inherits its parents' public methods/fields. Example chain the wiki gives for `IsoZombie`:
```
java.lang.Object
└── zombie.entity.GameEntity
    └── zombie.iso.IsoObject
        └── zombie.iso.IsoMovingObject
            └── zombie.characters.IsoGameCharacter
                └── zombie.characters.IsoZombie
```
When hunting for a method, walk up the parent chain in the JavaDocs. **[CONFIRMED — pzwiki Lua (API), revid 1390433]**

> **[UNCERTAIN]** No accessible source enumerates the full B42 *method signatures* for these classes. The authoritative references are the **Unofficial JavaDocs (Build 42)**, the alternative `geromet.github.io/PZJavaDocs` (Build 42.15) source viewer, and demiurgeQuantified's LuaDocs. Reading the game's own `media/lua/` for real usage remains the community consensus ("official docs are sparse; read the code").

---

<a name="8-moddata"></a>
