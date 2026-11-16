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
excerpt: >-
  What breaks a Build 41 Lua mod in 42.22, in order of blast radius: the folder layout, crafting, registries, renamed methods, a replaced water system, removed events, and a timed-action rule.
last_updated: '2026-11-16'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b41-b42-porting-what-breaks-a-concrete-checklist
  - tl-dr-what-a-b41-modder-must-change-first
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
  - the-events-system
  - timed-actions
  - debugging-lua-in-b42
  - hooks-for-new-b42-systems
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a modder with a Build 41 Lua mod who wants the list of what the 42.22 code changed, with the proof. The overview of the Lua runtime is [the Lua API overview](/pz/build-42/modding/lua-api/lua-api-and-engine-overview), the full port in ten steps is [the porting checklist](/pz/build-42/modding/foundations/b41-b42-porting-what-breaks-a-concrete-checklist), and the short version is [the TL;DR](/pz/build-42/modding/lua-api/tl-dr-the-5-things-that-will-break-your-b41-mod).

Outcast, this page is the part to act on. It is ordered by how much a change breaks, and every change here was checked against the 42.22 code, and where it is a rename or a removal, against the Build 41 code as well.

:::callout[The 1-minute version]{kind=key}
- A mod with `mod.info` at its top folder and no `common/` or version folder is not listed by 42.22. Put `mod.info` and `media/` in `42/`, or in `common/`.
- Vanilla 42.22 has 965 `craftRecipe` blocks and no `recipe` block. Whether a Build 41 `recipe` block still works was not tested.
- Some Build 41 method names are gone. Tile flags are `has`, `set` and `unset`, and a world object's water is now `getFluidAmount`, `getFluidCapacity` and `useFluid`.
- Two Build 41 events no longer exist: `OnGetDBSchema` and `OnGetTableResult`. A line `Events.OnGetDBSchema.Add(f)` now fails.
- The server finds a timed action by its global name, so the class has to be a global table.
- Do not spend time on `OnDoTileBuilding2`, `OnDoTileBuilding3` or the foraging events as "new in 42": they exist in Build 41 too.
:::

:::facts
- **Lowest version folder** `42` (42.0)
- **Vanilla `craftRecipe` blocks** 965, `recipe` blocks 0
- **Events** 222 registered in Build 41, 263 in 42.22: 43 added, 2 removed
- **Tile-flag calls renamed** `Is`, `Set`, `UnSet` to `has`, `set`, `unset`
:::

## 1. Mod packaging: the folder layout and the server list

**A mod is listed only when `mod.info` is in `common/` or in a version folder at least 42.0, so a flat Build 41 mod is not listed.**

The game picks the highest version folder that is at least 42.0 and not above the game, and lists the mod when `mod.info` is in `common/` or in that folder. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/ZomboidFileSystem.java:493-498`, `zombie/gameStates/ChooseGameInfo.java:45`)] The 42.21 page said the old flat layout is "still tolerated". It is not: a flat mod fails that test and is skipped without a message. The folder rules are on [the Lua folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model).

On a server, each `Mods=` entry has to equal a mod's `id=` exactly, with the same case. The server splits the line on `;` and looks each id up in a map keyed by the `id` of each mod. :cite[(`zombie/network/GameServer.java:667-675`, `zombie/gameStates/ChooseGameInfo.java:134-148`, `zombie/ZomboidFileSystem.java:643-645`)] An id that no listed mod has is logged as `required mod "<id>" not found`, and a dedicated server drops it from its list. :cite[(`zombie/ZomboidFileSystem.java:826-842`)]

## 2. Crafting: `craftRecipe`

**Build 42 vanilla writes every recipe as a `craftRecipe` block, and the old `recipe` block is not used at all.**

Vanilla's scripts hold 965 `craftRecipe` blocks and no `recipe` block, although the engine still has the `recipe` script type. :cite[(`zombie/scripting/ScriptType.java:23`, `zombie/scripting/ScriptType.java:45`)] So write new recipes in the new block. The old page said an old recipe "commonly fails silently or throws"; that was not tested, and it is dropped. The block is on [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block), and the hooks it takes are on [Hooks for new B42 systems](/pz/build-42/modding/lua-api/hooks-for-new-b42-systems).

## 3. Identifiers: `media/registries.lua`

**A mod that adds its own identifiers registers them in `media/registries.lua`, which the game runs before it loads the scripts.**

The loader runs the file for each available mod, from the version folder or else from `common`. :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`)] Start-up calls it before the script manager loads. :cite[(`zombie/GameWindow.java:208-210`)] The file's rules are on [media/registries.lua](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file). The old page named 42.13 as the version that added it, and that number is not verified here.

## 4. Renamed methods: tile flags and world water

**Build 41 method names that the 42.22 code no longer has fail with "tried to call nil", so these are the first to search your mod for.**

:::chips[Renamed in 42.22]
PropertyContainer Is
PropertyContainer Set
PropertyContainer UnSet
IsoGridSquare Is
IsoObject getWaterAmount
IsoObject getWaterMax
IsoObject useWater
:::

| Object | Build 41 | Build 42.22 | Code |
|---|---|---|---|
| `PropertyContainer`, what `sprite:getProperties()` gives you | `Is(flag)`, `Set(...)`, `UnSet(...)` | `has(flag)`, `set(...)`, `unset(...)`; only `CreateKeySet` keeps its capital | `zombie/core/properties/PropertyContainer.java:46`, `zombie/core/properties/PropertyContainer.java:88-97`, `zombie/core/properties/PropertyContainer.java:147-155` |
| `IsoGridSquare` | `Is(flag)` | `has(flag)`, and the square gained `set(key)` and `unset(key)` | `zombie/iso/IsoGridSquare.java:2443-2463`, `zombie/iso/IsoGridSquare.java:2467-2473` |
| `IsoObject` water | `getWaterAmount()`, `getWaterMax()`, `useWater(int)`, `setWaterAmount(int)`, `setTaintedWater(...)` | `getFluidAmount()`, `getFluidCapacity()` and `useFluid(float)` return decimals, and there is no setter; `addFluid` and `emptyFluid` change the amount | `zombie/iso/IsoObject.java:2747`, `zombie/iso/IsoObject.java:2797`, `zombie/iso/IsoObject.java:2824`, `zombie/iso/IsoObject.java:2776-2792`, `zombie/iso/IsoObject.java:2868` |
| `IsoObject` water, unchanged | `hasWater()`, `isTaintedWater()` | the same names | `zombie/iso/IsoObject.java:3141`, `zombie/iso/IsoObject.java:3182` |

The tile-flag rename is read in the 42.22 code against the Build 41 decompile, where `PropertyContainer` has `Is`, `Set` and `UnSet` and `IsoGridSquare` has `Is`; there is no alias for the old names in the 42.22 index of Lua-callable members. The water methods likewise: Build 41's `IsoObject` has the five water methods named in the water row of that table, and 42.22's has none of them. The new water model, with `FluidContainer`, is on [The fluid system](/pz/build-42/modding/fluids/the-fluid-system).

A search for other renames, from the 42.21 page's "about 42.17" list, found nothing it could pin down: the code gives no table of renames, and the old page itself said there is no canonical one. To find the rest in your own mod, run it in debug mode and read each failing name (see [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42)), then look up the current name in the vanilla Lua under `media/lua`.

## 5. Removed events and globals

**A Build 41 event that no longer exists makes `Events.Name.Add(...)` fail, so a removed event stops the file that listens to it.**

The event list is built in `AddEvents`, and the `Events` table holds one entry per registered name. :cite[(`zombie/Lua/LuaEventManager.java:598-860`, `zombie/Lua/LuaEventManager.java:866-870`)] Build 41 registers 222 events and 42.22 registers 263, from a count of the `AddEvent("` lines of each. Two Build 41 names are not in 42.22: `OnGetDBSchema` and `OnGetTableResult`, and no 42.22 code triggers them. A name with no entry is `nil` in the `Events` table, so `Events.OnGetDBSchema.Add(f)` raises "attempted index: Add of non-table: null" and the rest of that file does not run. :cite[(`zombie/Lua/LuaEventManager.java:579-595`, `se/krka/kahlua/vm/KahluaThread.java:1114-1141`)]

43 events are new since Build 41, and the full list for 42.22 is on [The events system](/pz/build-42/modding/lua-api/the-events-system). The age of each is not the point; what matters is that every name you listen to exists. The global functions changed too, between 42.21 and 42.22 alone: five were removed (`createStory`, `deletePlayerSave`, `getAllSavedPlayers`, `getLastStandPlayerFileNames`, `getLastStandPlayersDirectory`) and two were added (`isPlayerProfileReceived`, `rejectMedicalCheck`). :cite[(`api/lua_globals.jsonl`)]

## 6. Timed actions must be globals

**The server rebuilds a timed action from the name of its class, so the class has to be a global table that the server's Lua has loaded.**

When the server receives a timed action, it looks the class up by the type string and calls its `new`. :cite[(`zombie/core/NetTimedAction.java:156-157`)] A file-local class that worked in single player is not found. The class, its `complete` function and the folder it belongs in are on [Timed actions](/pz/build-42/modding/lua-api/timed-actions).

The `server` Lua folder also loads on a multiplayer client, so a server file that must run only on the server starts with `if isClient() then return end`. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)] This is not a change from Build 41: Build 41 loaded the `server` folder the same way, with no client test, at `GAME/PZ_Engine_Records/B41/src/gameStates/GameLoadingState.java` lines 101-102. The `syncPlayerStats` function sends its packet only when the game is a server, so calling it from a client does nothing. :cite[(`zombie/Lua/LuaManager.java:11894-11900`)] What the server decides in multiplayer, and what it checks, is on [Who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what) and [Anti-cheat and mods](/pz/build-42/engine/anti-cheat/anti-cheat-and-mods).

## 7. Not new in 42: three things the old page listed

**`OnDoTileBuilding2`, `OnDoTileBuilding3`, the foraging events and `OnWaterAmountChange` all exist in Build 41, so they are not porting work.**

The old page listed the build-cursor split, the foraging events and `OnWaterAmountChange` as changes.

The events table of the Build 41 decompile already registers `OnDoTileBuilding2`, `OnDoTileBuilding3`, `preAddForageDefs`, `onAddForageDefs`, `onFillSearchIconContextMenu` and `OnWaterAmountChange`. In 42.22 the cursor events are split by input: `OnDoTileBuilding2` fires for a player with no gamepad bound, `OnDoTileBuilding3` fires when a gamepad is bound. :cite[(`zombie/iso/IsoCell.java:2598-2619`, `zombie/iso/IsoCell.java:2621-2631`)] Cover both if your building cursor must work for both. The events' arguments are on the [hooks page](/pz/build-42/modding/lua-api/hooks-for-new-b42-systems).

## 8. Dropped: world, save and sandbox claims

**The old page made three claims that could not be verified, so this page does not state them. Not stated here, because not verified:**

- The map is bigger, with multi-level basements and a reworked chunk and erosion system, so re-check coordinate logic.
- The sandbox settings, especially loot multipliers, were redesigned, so do not copy a Build 41 sandbox config.
- The server became authoritative for player damage and item stats in 42.13.1.

None of the three is read from the code here. For saves, [the status page](/pz/build-42/modding/foundations/b42-status-versioning-and-the-compatibility-model) is the place to look.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java, the Kahlua classes from a local decompile, and the vanilla Lua and scripts. The Build 41 side is the decompile in `GAME/PZ_Engine_Records/B41` (labelled 41.78.16, a reconstructed label), compared by method name for the renames and by the `AddEvent("` lines for the events: 222 against 263, with 43 names added and 2 removed. The vanilla block counts are across `media/scripts`. No game was run.

Corrected from the 42.21 page: a flat Build 41 layout is not listed, where the page said it is tolerated; the build-cursor, foraging and water events are not new; and the water methods changed, which the page only hinted at. Dropped: "42.13", "42.13.1", "42.17" and "42.13.0" as the versions of changes; the claim that old recipes commonly fail silently; the "32 calls" of a Build 41 ladder mod that we studied, which cannot be re-checked here; the claim about basements, the map, the save format and sandbox options; and the pzwiki confidence tags.

Not verified: that Steam installs a Build 41 mod onto a Build 42 game, and whether a Build 41 `recipe` block still loads. Whether anything else was renamed between the builds was not searched class by class.
:::
