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
  The global functions and Java classes a Build 42.22 Lua mod uses most, what each returns, which side it works on, and three classes older notes list that are no longer exposed.
last_updated: '2026-11-16'
related_articles:
  - the-events-system
  - moddata
  - multiplayer-command-patterns
  - lua-load-order-and-the-three-lua-folders
  - engine-internals-calling-exposed-java-from-lua
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write Lua for Build 42 and want the everyday calls in one table. The map of the section is [Lua API and engine reference](/pz/build-42/modding/lua-api/lua-api-and-engine-overview). How a Java method is called from Lua is on [Engine internals](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua).

:::callout[The 1-minute version]{kind=key}
- The engine adds global functions to Lua, such as `getPlayer()`, `getCell()` and `isClient()`. You call them bare, not as `SomeClass.method`.
- `getPlayer()` returns the local player and can return `nil`, for example at the main menu, so check it. `getSpecificPlayer(n)` takes a 0-based slot, for split screen.
- Some globals work on one side only: `isAdmin()` and the global `getAccessLevel()` are client calls, and `sendServerCommand` and `syncPlayerStats` act only on a server.
- `getGameTime()` and `GameTime.instance` are the same object at 42.22. The accessor for global mod data is `ModData.getOrCreate("key")`; `getGameModData()` does not exist.
- `IsoLivingCharacter`, `InventoryItemFactory` and `Random` are not exposed to Lua at 42.22. Use `instanceItem("Base.Axe")` to make an item.
:::

:::facts
- **Global function names** 725 (757 declarations, counting each overload)
- **Classes in the list below** 21, all exposed
- **`ZombRand(n)`** a whole number from 0 up to `n - 1`
:::

## 1. The globals you will use most

**The engine adds each global function to Lua from one class, and the table lists the common ones with what they return.**

The globals are the methods of `LuaManager.GlobalObject` marked as global, 725 names in all. :cite[(`zombie/Lua/LuaManager.java:3896-3904`)] The count is of distinct names, because 757 declarations include overloads.

| Global | Returns or does | Code |
|---|---|---|
| `getPlayer()` | The current player instance. It is `nil` when none is set, for example at the main menu, so check it. | :cite[(`zombie/Lua/LuaManager.java:3899-3904`, `zombie/characters/IsoPlayer.java:843-845`, `zombie/gameStates/IngameState.java:984`)] |
| `getSpecificPlayer(n)` | The player in local slot `n` (0-based), read straight from the player array. | :cite[(`zombie/Lua/LuaManager.java:4190-4195`)] |
| `getPlayerByOnlineID(id)` | The player with that network id (the `onlineID`) from the server's or the client's own id map, and `nil` in single player. | :cite[(`zombie/Lua/LuaManager.java:3963-3971`)] |
| `getWorld()` | The `IsoWorld`. | :cite[(`zombie/Lua/LuaManager.java:5787-5792`)] |
| `getCell()` | The world's current `IsoCell`. | :cite[(`zombie/Lua/LuaManager.java:5795-5800`)] |
| `getGameTime()` | The `GameTime` instance, the same object as `GameTime.instance`. | :cite[(`zombie/Lua/LuaManager.java:5738-5743`, `zombie/GameTime.java:76`)] |
| `getSandboxOptions()` | The sandbox options object. | :cite[(`zombie/Lua/LuaManager.java:5843-5848`)] |
| `ModData.getOrCreate(key)` | The global mod data table for the key, made empty if missing. `ModData` is the class `zombie.world.moddata.ModData`. See [ModData](/pz/build-42/modding/lua-api/moddata). | :cite[(`zombie/world/moddata/ModData.java:27-29`)] |
| `sendClientCommand(...)`, `sendServerCommand(...)` | The command calls. See [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns). | :cite[(`zombie/Lua/LuaManager.java:8863-8916`)] |
| `ZombRand(n)` | A whole number from 0 up to `n - 1`, and 0 when `n` is 0. `ZombRand(min, max)` takes two bounds. | :cite[(`zombie/Lua/LuaManager.java:7007-7015`, `zombie/Lua/LuaManager.java:7027-7033`, `zombie/core/random/RandAbstract.java:22-31`)] |
| `instanceof(obj, "ClassName")` | True when the object is an instance of that exposed class, and false for `nil`. | :cite[(`zombie/Lua/LuaManager.java:2981-2989`)] |
| `isClient()`, `isServer()`, `isMultiplayer()` | The mode checks. See [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders#6-guards-for-client-server-and-single-player). | :cite[(`zombie/Lua/LuaManager.java:4415-4445`)] |
| `isAdmin()` | True only on a client whose role is the default admin role. It is false on a server. | :cite[(`zombie/Lua/LuaManager.java:8979-8984`)] |
| `instanceItem(type)` | A new inventory item of that type, for example `instanceItem("Base.Axe")`. | :cite[(`zombie/Lua/LuaManager.java:5632-5666`)] |

`getGameTime()` returns `GameTime.instance`, so the two are the same object. The 42.21 page said `GameTime.instance` from Lua is a different object that carries class defaults; the code does not show that. :cite[(`zombie/Lua/LuaManager.java:5738-5743`)]

The 42.21 page also named `getGameModData()` as an older accessor. There is no global with that name at 42.22. :cite[(`api/lua_globals.jsonl`)]

## 2. Which side each call works on

**A global may exist on every side and still do something on only one.**

`getPlayer()` and `getSpecificPlayer(n)` hand back local players, so they are for client and single-player code. :cite[(`zombie/Lua/LuaManager.java:3899-3904`, `zombie/Lua/LuaManager.java:4190-4195`)] `getPlayerByOnlineID` resolves in the id map of whichever side calls it. :cite[(`zombie/Lua/LuaManager.java:3963-3971`)]

`isAdmin()` and the global `getAccessLevel()` read the client's own connection and role, so a server asks `player:getRole():hasCapability(...)` instead. :cite[(`zombie/Lua/LuaManager.java:4457-4462`, `zombie/Lua/LuaManager.java:8979-8984`, `media/lua/server/ClientCommands.lua:11`)] `syncPlayerStats(player, syncParams)` acts only on a server. :cite[(`zombie/Lua/LuaManager.java:11894-11900`)]

## 3. Classes exposed to Lua

**Lua can see only the Java classes the engine exposes, and 21 of the common ones are exposed at 42.22.**

:::chips
- `IsoPlayer`
- `IsoGameCharacter`
- `IsoZombie`
- `IsoAnimal`
- `IsoMovingObject`
- `IsoGridSquare`
- `IsoCell`
- `IsoChunk`
- `IsoBuilding`
- `IsoRoom`
- `IsoDeadBody`
- `IsoLightSource`
- `InventoryItem`
- `ItemContainer`
- `ItemVisual`
- `ItemVisuals`
- `HumanVisual`
- `ClimateManager`
- `CharacterActionAnims`
- `Stats`
- `ArrayList`
:::

The loader marks each class with `setExposed` in one method, and the capture's class index lists every class it exposes. :cite[(`zombie/Lua/LuaManager.java:1700-1713`, `api/lua_exposed.jsonl`)] Three names in the 42.21 list are not exposed at 42.22: `IsoLivingCharacter`, `InventoryItemFactory` and `Random`. A global replaces the factory: `instanceItem` calls it for you. :cite[(`zombie/Lua/LuaManager.java:5632-5666`)]

The classes form chains, and a Lua call on an object finds its parents' public methods too: the exposer walks Java's `getMethods()`, which includes every inherited public method, and skips only static ones and those marked `@HiddenFromLua`. So an `IsoPlayer` still answers the methods it inherits from `IsoLivingCharacter`, although that class is not exposed itself. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:321-328`)] The chain for a zombie is `GameEntity`, `IsoObject`, `IsoMovingObject`, `IsoGameCharacter`, `IsoZombie`. :cite[(`zombie/entity/GameEntity.java:55`, `zombie/iso/IsoObject.java:181`, `zombie/iso/IsoMovingObject.java:97`, `zombie/characters/IsoGameCharacter.java:366-367`, `zombie/characters/IsoZombie.java:190`)] The chain for a player is `IsoLivingCharacter`, then `IsoPlayer`, and an `IsoAnimal` extends `IsoPlayer`. :cite[(`zombie/characters/IsoLivingCharacter.java:22`, `zombie/characters/IsoPlayer.java:278`, `zombie/characters/animals/IsoAnimal.java:131`)]

When you look for a method, check the parent classes as well. An `IsoAnimal` is also an `IsoPlayer`, so a check such as `instanceof(obj, "IsoPlayer")` is true for an animal. :cite[(`zombie/characters/animals/IsoAnimal.java:131`, `zombie/Lua/LuaManager.java:2981-2989`)]

## 4. Finding a method name

**The game's own Lua is the reference that is always right for the build you run.**

Search `media/lua/` for a class you want to use and copy how vanilla calls it. A call from Lua into Java is described on [Engine internals](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game was run.

The 725 is a count of distinct `name` values in `@LuaMethod(... global = true)` annotations in `LuaManager.java`, counted by a script that was run once and deleted.

Dropped from the 42.21 page: the advice to use `ZombRand` instead of `math.random` for determinism, the `World` row, and the third-party doc sites. Corrected from the 42.21 page: `getGameTime()` versus `GameTime.instance`, the three unexposed class names, and the claim that `getPlayer()` is nil when the player is dead (the code shows nil when no instance is set; the dead case was not checked). The parents' methods claim was checked in the Kahlua exposer, decompiled from the same 42.22 jar. Not verified: the third-party JavaDoc and LuaDoc sites the 42.21 page recommended.
:::
