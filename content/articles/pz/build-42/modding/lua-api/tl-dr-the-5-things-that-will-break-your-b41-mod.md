---
id: build-42-tl-dr-the-5-things-that-will-break-your-b41-mod
slug: tl-dr-the-5-things-that-will-break-your-b41-mod
title: 'TL;DR: the 5 things that will break your B41 mod'
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
  Five things in 42.22 that break a Build 41 Lua mod: the folder layout, crafting, renamed methods, removed events, and the by-name timed-action lookup, each checked against the code with what to do.
last_updated: '2026-11-16'
related_articles:
  - b41-b42-breaking-changes
  - tl-dr-what-a-b41-modder-must-change-first
  - b41-b42-porting-what-breaks-a-concrete-checklist
  - practical-b42-readiness-checklist
  - the-b42-mod-folder-model
  - the-events-system
  - timed-actions
  - debugging-lua-in-b42
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a Build 41 modder with a Lua mod who has five minutes. The proof for each point is on [B41 to B42 breaking changes](/pz/build-42/modding/lua-api/b41-b42-breaking-changes), and the overview of the Lua runtime is [the Lua API overview](/pz/build-42/modding/lua-api/lua-api-and-engine-overview). The folder, registry and server-list steps in the foundations pages are [the foundations TL;DR](/pz/build-42/modding/foundations/tl-dr-what-a-b41-modder-must-change-first) and [the porting checklist](/pz/build-42/modding/foundations/b41-b42-porting-what-breaks-a-concrete-checklist).

:::callout[The 1-minute version]{kind=key}
- Put `mod.info` and `media/` in a `42/` folder or in `common/`. A mod with `mod.info` only at its top folder is not listed.
- Write recipes as `craftRecipe`. Vanilla 42.22 has 965 of them and no `recipe` block, and whether the old block still works was not tested.
- Search your mod for the renamed methods: tile flags are `has`, `set` and `unset`, and a world object's water is `getFluidAmount`, `getFluidCapacity` and `useFluid`.
- Check every event name you listen to. `OnGetDBSchema` and `OnGetTableResult` no longer exist, and a line that adds a handler to a missing event stops the file.
- Make your timed action class a global table: the server looks it up by name, which is new in Build 42. Server files loaded on a multiplayer client in Build 41 too, so keep your `if isClient() then return end` guard.
:::

:::facts
- **Lowest version folder** `42` (42.0)
- **Vanilla `craftRecipe` blocks** 965, `recipe` blocks 0
- **Events removed since Build 41** 2, and 43 added
- **Debug flag** `-debug`
:::

## 1. The mod folder layout changed

**A Build 42 mod keeps `mod.info` and `media/` in `42/` or in `common/`, and a flat Build 41 mod is skipped.**

The game lists a mod only when `mod.info` is in `common/` or in the best version folder, which is the highest one at least 42.0 and not above the game. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/ZomboidFileSystem.java:493-498`, `zombie/gameStates/ChooseGameInfo.java:45`)] An unlisted mod is skipped without a message. The old page said the flat layout still loads in many cases; the 42.22 code says it does not. The folders are on [the folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model).

## 2. The crafting system was replaced

**Vanilla 42.22 writes all of its recipes as `craftRecipe` blocks, and the old `recipe` block is not used.**

There are 965 `craftRecipe` blocks and no `recipe` block in vanilla's scripts. :cite[(`zombie/scripting/ScriptType.java:23`, `zombie/scripting/ScriptType.java:45`)] Rewrite your recipes in the new block, which is on [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block). What a Build 41 `recipe` block does now was not tested.

## 3. Some Build 41 methods are gone

**A call to a renamed method fails with "tried to call nil", and tile flags and world water are the renames we proved.**

`PropertyContainer`, which `sprite:getProperties()` returns, now has `has`, `set` and `unset` where Build 41 had `Is`, `Set` and `UnSet`, and `IsoGridSquare` has `has` where it had `Is`. :cite[(`zombie/core/properties/PropertyContainer.java:88-97`, `zombie/core/properties/PropertyContainer.java:147-155`, `zombie/iso/IsoGridSquare.java:2443-2463`)] On a world object, `getWaterAmount`, `getWaterMax` and `useWater` became `getFluidAmount`, `getFluidCapacity` and `useFluid`, which work in decimals. :cite[(`zombie/iso/IsoObject.java:2747`, `zombie/iso/IsoObject.java:2797`, `zombie/iso/IsoObject.java:2824`)] Other renames may exist; run your mod in `-debug`, and see [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42).

## 4. Some events are gone

**The Build 41 events `OnGetDBSchema` and `OnGetTableResult` do not exist in 42.22, and adding a handler to a missing event raises an error at that line.**

Build 41 registers `OnGetDBSchema` and `OnGetTableResult`, and the 42.22 event list has neither. :cite[(`zombie/Lua/LuaEventManager.java:598-860`)] Since the `Events` table holds only registered names, `Events.OnGetDBSchema.Add(f)` fails and the rest of the file does not run. :cite[(`zombie/Lua/LuaEventManager.java:579-595`)] The list of events is on [The events system](/pz/build-42/modding/lua-api/the-events-system).

## 5. Timed actions are found by name

**The server finds a timed action by its global class name, a lookup that is new in Build 42.**

The server looks a timed action's class up by its type string, so a file-local class is not found. :cite[(`zombie/core/NetTimedAction.java:156-157`)] The `server` folder also loads on a multiplayer client at 42.22, so a file that must run only on the server starts with `if isClient() then return end`. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)] That is not a change: Build 41 loaded the `server` folder the same way, with no client test, at `GAME/PZ_Engine_Records/B41/src/gameStates/GameLoadingState.java` lines 101-102. The rules are on [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders) and [Timed actions](/pz/build-42/modding/lua-api/timed-actions).

## Also check

**The registries file and the server `Mods=` list are covered by the foundations pages, and are worth a look before you test.**

If the mod adds its own identifiers, it needs `media/registries.lua`, which is on [media/registries.lua](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file). On a server, the `Mods=` ids must equal each mod's `id=` exactly, which is on [the readiness checklist](/pz/build-42/modding/foundations/practical-b42-readiness-checklist).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java, compared with the Build 41 decompile for the renames and the event names; no game was run. The block counts are across vanilla `media/scripts`.

Corrected from the 42.21 page: the flat layout is not listed at 42.22; the old second point's "silent failure" and the third point's 42.13 version were not verified and are dropped. Dropped: the server-authority point, which named 42.13.1 and could not be checked, and the point that Build 41 saves are incompatible and that Steam installs Build 41 mods without a warning. The foundations TL;DR lists the same two as not verified. Not verified: whether a Build 41 `recipe` block still loads.
:::
