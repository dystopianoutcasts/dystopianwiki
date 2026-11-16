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
  Where a Lua mod can hook the crafting, fluid, animal, foraging and basement systems in 42.22: the five recipe call points, the events with their arguments and side, and the basement API.
last_updated: '2026-11-16'
related_articles:
  - b41-b42-breaking-changes
  - the-events-system
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - engine-internals-calling-exposed-java-from-lua
  - key-globals-and-classes
  - debugging-lua-in-b42
  - addendum-canonical-craftrecipe-schema
  - new-animal
  - map-building-basement
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who want to react to the newer systems from Lua: recipes, fluids, animals, foraging and basements. The recipe keys are on [the canonical recipe schema](/pz/build-42/modding/crafting/addendum-canonical-craftrecipe-schema), and the event list is on [The events system](/pz/build-42/modding/lua-api/the-events-system).

:::callout[The 1-minute version]{kind=key}
- A recipe names Lua functions for five call points: `OnTest`, `OnStart`, `OnUpdate`, `OnCreate` and `OnFailed`. There is no `OnGiveXP` key; experience comes from `xpAward`.
- The Lua side of fluids is the exposed `FluidContainer` class and its neighbors. The one event is `OnWaterAmountChange(object, previousAmount)`, and it fires from the world-object methods that change the amount, not when you call a `FluidContainer` method yourself.
- Animals are the exposed class `IsoAnimal`. An animal's death fires `OnCharacterDeath`, and two events are about animals: `OnClickedAnimalForContext` and `OnAnimalTracks`.
- Basements have a small Lua API: `Basements.getAPIv1()`, which returns an object with four methods.
- Every event below names its side. A server-side event handler belongs in a file that does not run only on a client.
:::

:::facts
- **Recipe call points** 5, and vanilla uses `OnTest` in 20 recipes and `OnCreate` in 147
- **Exposed fluid classes** 13, with 88 listed members on `FluidContainer`
- **`OnWaterAmountChange` trigger sites in Java** 12, in 3 files
- **Basement API methods** 4, on `BasementsV1`
:::

## 1. Crafting: five call points

**A `craftRecipe` can name a Lua function for each of five call points, and the game looks the name up in the Lua environment when the recipe is used.**

The recipe parser stores `OnTest`, `OnStart`, `OnUpdate`, `OnCreate` and `OnFailed` as function names, and a sixth key, `OnAddToMenu`, as text that the crafting list's Lua reads. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:386-387`, `media/lua/client/Entity/ISUI/CraftRecipe/ISTiledIconPanel.lua:193-194`)] :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:384-395`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1626-1632`)] A name may be dotted, and it resolves to a Lua function or a Java function in the global table. :cite[(`zombie/Lua/LuaManager.java:1416-1460`)] The keys and the vanilla counts are on [the canonical recipe schema](/pz/build-42/modding/crafting/addendum-canonical-craftrecipe-schema). Experience has no hook: the key `xpAward` lists the skills and amounts. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:468-481`)]

| Call point | Lua arguments | When it runs | Code |
|---|---|---|---|
| `OnTest` | the item, the character; returns true or false | for each candidate input item, while the game tests a recipe | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1017-1040`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:789`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:1295` |
| `OnStart` | the recipe data, the character | when a character performs the recipe, after the inputs are taken; and when a workstation starts a craft, with no character | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:440-451`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:497-508`, `zombie/entity/components/crafting/CraftLogicSystem.java:148` |
| `OnUpdate` | the recipe data | each update of a running workstation craft | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:453-460`, `zombie/entity/components/crafting/CraftLogicSystem.java:107` |
| `OnCreate` | the recipe data, the character | after a hand craft adds its outputs, when a build action finishes, and when a workstation finishes, with no character | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:462-473`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:229-238`, `media/lua/server/BuildingObjects/ISBuildIsoEntity.lua:578`, `zombie/entity/components/crafting/CraftLogicSystem.java:170` |
| `OnFailed` | the recipe data | when a workstation craft is cancelled | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:475-482`, `zombie/entity/components/crafting/CraftLogicSystem.java:162-168` |

Two details save time. The recipe data object has a method `luaCallOnTest` that always returns true, so the live test is the per-item `OnTestItem` above. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeData.java:417-419`)] The drying, furnace and mashing workstations call `OnStart` and `OnFailed` from their own logic systems, and drying and furnace call `OnCreate` too. `OnUpdate` is called only from `CraftLogicSystem`. :cite[(`zombie/entity/components/crafting/DryingLogicSystem.java:262-285`, `zombie/entity/components/crafting/FurnaceLogicSystem.java:243-265`, `zombie/entity/components/crafting/MashingLogicSystem.java:140-162`, `zombie/entity/components/crafting/CraftLogicSystem.java:107`)] How the server decides a hand craft is on [Handcraft from Lua: what the server does](/pz/build-42/modding/crafting/handcraft-from-lua-what-the-server-does).

## 2. Fluids: the classes, and one event

**Lua can call 13 fluid classes, and the one fluid event fires from the world-object methods that empty, use, add and transfer fluid.**

The fluid package is exposed, with `FluidContainer`, `Fluid`, `FluidType`, `FluidFilter`, `FluidUtil` and eight more, and `FluidContainer` has 88 listed members. :cite[(`api/lua_exposed.jsonl`)] The 42.21 page said only partial control reaches Lua; the index shows a large surface, though what each call does is on [The fluid system](/pz/build-42/modding/fluids/the-fluid-system) and [Fluids for modders](/pz/build-42/modding/fluids/fluids-for-modders-start-here).

`OnWaterAmountChange(object, previousAmount)` has 12 trigger sites in Java: `emptyFluid`, `useFluid`, `addFluid`, `transferFluidTo` (two places) and `transferFluidFrom` on `IsoObject`, the five matching methods on `IsoWorldInventoryObject`, and one in the mod-data packet. :cite[(`zombie/iso/IsoObject.java:2791`, `zombie/iso/IsoObject.java:2852`, `zombie/iso/IsoObject.java:2886`, `zombie/iso/IsoObject.java:2965`, `zombie/iso/IsoObject.java:3001`, `zombie/iso/IsoObject.java:3048`, `zombie/iso/objects/IsoWorldInventoryObject.java:241`, `zombie/iso/objects/IsoWorldInventoryObject.java:258`, `zombie/iso/objects/IsoWorldInventoryObject.java:277`, `zombie/iso/objects/IsoWorldInventoryObject.java:310`, `zombie/iso/objects/IsoWorldInventoryObject.java:339`, `zombie/network/packets/ObjectModDataPacket.java:75`)] The ten methods run only on the server or in single player, since each tests for that first. On a multiplayer client the event comes from the packet, when the received mod data changes the amount. :cite[(`zombie/iso/IsoObject.java:2785`, `zombie/iso/IsoObject.java:2847`, `zombie/iso/IsoObject.java:2877`, `zombie/iso/IsoObject.java:2947`, `zombie/iso/IsoObject.java:3027`, `zombie/iso/objects/IsoWorldInventoryObject.java:235`, `zombie/iso/objects/IsoWorldInventoryObject.java:253`, `zombie/iso/objects/IsoWorldInventoryObject.java:268`, `zombie/iso/objects/IsoWorldInventoryObject.java:305`, `zombie/iso/objects/IsoWorldInventoryObject.java:332`, `zombie/network/packets/ObjectModDataPacket.java:72-76`)]

None of the 12 trigger sites is in the fluid classes, so a call to `addFluid` on a `FluidContainer` that you hold does not fire the event. :cite[(`api/events.jsonl`)] Vanilla's only listener is the rain barrel system. :cite[(`media/lua/server/RainBarrel/SRainBarrelSystem.lua:77-92`)] The old page's "meta-level containers fill while the player is away" and its list of script keys (`ContainerName`, `Capacity`) are not checked here; see [define a fluid](/pz/build-42/modding/cookbook/new-fluid).

## 3. Animals: a class, a table, events

**Animals are the exposed class `IsoAnimal`, defined from a global Lua table, and they fire two events of their own plus the general death event.**

`IsoAnimal` is exposed with 246 listed members, and the Java class `AnimalDefinitions` is exposed too. :cite[(`api/lua_exposed.jsonl`)] Vanilla's animal files in `media/lua/shared/Definitions/animal/` also fill a global table of the same name, with `stages`, `breeds` and `animals`, and the game reads it after the Lua files have run. :cite[(`media/lua/shared/Definitions/animal/ChickenDefinitions.lua:1-4`, `zombie/characters/animals/AnimalDefinitions.java:154-160`, `zombie/characters/animals/AnimalDefinitions.java:176-190`)] The steps to add one are on [Add an animal](/pz/build-42/modding/cookbook/new-animal).

An animal's death handler fires `OnCharacterDeath` with the animal. :cite[(`zombie/characters/animals/IsoAnimal.java:1143-1145`)] The events page lists who else fires it. The "Animal Essentials" community mod named on the 42.21 page is not checked here.

## 4. Foraging and search: events with a side

**The foraging events are fired from packets and from shared and client Lua, so the side matters more than the name.**

Some of these were in Build 41 as well, as [the breaking-changes page](/pz/build-42/modding/lua-api/b41-b42-breaking-changes) says. The table lists the events fired from the foraging code and its packets, plus the two animal events, as the capture's event index records them.

| Event | Arguments | Fired by | Side | Code |
|---|---|---|---|---|
| `preAddForageDefs` | the forage system | `forageSystem.lua`, before the definitions are added | shared Lua | `media/lua/shared/Foraging/forageSystem.lua:712` |
| `preAddSkillDefs`, `preAddCatDefs`, `preAddZoneDefs`, `preAddItemDefs` | the forage system | the same function, in that order, between the other two | shared Lua | `media/lua/shared/Foraging/forageSystem.lua:715-725` |
| `onAddForageDefs` | the forage system | `forageSystem.lua`, after the definitions are added | shared Lua | `media/lua/shared/Foraging/forageSystem.lua:729` |
| `onEnableSearchMode`, `onDisableSearchMode`, `onToggleSearchMode` | the character, the search-mode flag | the client search manager | client Lua | `media/lua/client/Foraging/ISSearchManager.lua:34-36`, `media/lua/client/Foraging/ISSearchManager.lua:1436-1445` |
| `onFillSearchIconContextMenu` | the context menu, the icon | a search icon's menu | client Lua | `media/lua/client/Foraging/ISBaseIcon.lua:151` |
| `onUpdateIcon` | the zone data, the icon id, the icon | forage code when an icon changes | shared and client Lua | `media/lua/shared/Foraging/forageSystem.lua:1038`, `media/lua/client/Foraging/ISForageIcon.lua:99`, `media/lua/client/Foraging/ISSearchManager.lua:759` |
| `OnItemFound` | the player, the item type, the distance traveled | the global `sendIconFound` on a server or in single player, and the item-found packet on a server | server or single player | `zombie/Lua/LuaManager.java:11786-11792`, `zombie/network/packets/character/ForageItemFoundPacket.java:59-62` |
| `OnForagePool` | the player, the zone id, the icons | the foraging packet when it arrives | client | `zombie/network/packets/foraging/ForagePoolPacket.java:74-77` |
| `OnForageRequestZone` | the player, the focus | the foraging request packet | server | `zombie/network/packets/foraging/ForageRequestZonePacket.java:54-56` |
| `OnForageSpot` | the player, the icon id | the foraging spot packet | server | `zombie/network/packets/foraging/ForageSpotPacket.java:54-56` |
| `OnAnimalTracks` | the player, the tracks | the animal-tracks packet, when there are tracks on a square | client | `zombie/network/packets/character/AnimalTracksPacket.java:131-135` |
| `OnClickedAnimalForContext` | the player, the context menu, the clicked animals, the test flag | building the world context menu, when animals were clicked | client | `zombie/iso/ISWorldObjectContextMenuLogic.java:1106-1113` |
| `OnOverrideSearchManager` | none | no trigger found in the code read | not known | `zombie/Lua/LuaEventManager.java:844` |

The build cursor has two events, `OnDoTileBuilding2` for a player with no gamepad and `OnDoTileBuilding3` for a player with one. :cite[(`zombie/iso/IsoCell.java:2598-2631`)] `OnDynamicMovableRecipe` fires when the game builds the recipe for a moveable whose sprite name matches its type. :cite[(`zombie/inventory/RecipeManager.java:150-155`)]

## 5. Basements: a small Lua API

**There is a basement API in Lua after all: `Basements` exposes 13 members, and `Basements.getAPIv1()` returns an object with four methods that a mod would use.**

The classes `Basements` and `BasementsV1` are exposed. :cite[(`zombie/Lua/LuaManager.java:1795-1796`)] `Basements` also lists `getInstance`, `getPerMap`, `getOrCreatePerMap`, `chunkHasBasement`, `parseBasementDefinitions`, `parseBasementAccessDefinitions`, `onNewChunkLoaded`, `beforeLoadMetaGrid`, `afterLoadMetaGrid`, `beforeOnLoadMapZones` and the constant `SAVEFILE_VERSION`; those look like the game's own plumbing and were not traced. :cite[(`api/lua_exposed.jsonl`)] The accessor gives the API object, and its methods are `addAccessDefinitions`, `addBasementDefinitions`, `addSpawnLocations` and `registerBasementSpawnLocation`. :cite[(`zombie/basements/Basements.java:72-74`, `api/lua_exposed.jsonl`)] The only vanilla Lua caller is the map-zone handler, which registers a spawn location per zone. :cite[(`media/lua/server/metazones/metazoneHandler.lua:8-11`)]

The 42.21 page said no Lua basement API had surfaced and that there are "about 400 procedurally generated basements"; the first is not true, and the second is not checked. How a basement is built into a map is on [Map, building, or basement](/pz/build-42/modding/cookbook/map-building-basement).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game was run. Event arguments, trigger sites and listeners come from the capture's event index and each trigger was opened. Class and member counts come from the exposed-class index. Whether a recipe hook written as a plain Lua function runs was not tried; the lookup code accepts one.

Corrected from the 42.21 page: `OnGiveXP` is not a recipe key (the five are listed above); Lua reaches a large fluid surface, not a partial one; and a Lua basement API exists. Dropped as unverified: "alternative ingredients with a slash", the `keep` flag, workstations that require attached fluid containers and precise fluid mixes (the input rules are on the recipe pages), the "rain collectors fill while away" claim, the basement count, and the pzwiki confidence tags.

Not verified: what `OnOverrideSearchManager` is triggered by, which side runs `OnDynamicMovableRecipe`, and how the animal and fluid systems behave beyond the hooks named here.
:::
