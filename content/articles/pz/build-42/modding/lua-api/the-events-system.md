---
id: build-42-the-events-system
slug: the-events-system
title: The Events system
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
  The event model is unchanged in shape from B41: you attach a function
  reference (an observer) to a named event via the Events object.
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
  - registries-lua-the-new-b42-13-identifier-system
  - key-globals-and-classes
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
# The Events system  [CONFIRMED — pzwiki Lua event, revid 1390441 (v42.13.0); event catalog from demiurgeQuantified PZEventStubs, v42.13.0]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The event model is unchanged in shape from B41: you attach a **function reference** (an observer) to a named event via the `Events` object.

```lua
local function yourFunction(player)   -- params must match the event's output
    -- your code here
end
Events.OnCreatePlayer.Add(yourFunction)    -- register (hook)
Events.OnCreatePlayer.Remove(yourFunction) -- unregister (needs the SAME reference)
```

**Two rules the wiki makes explicit:**
1. `Add`/`Remove` take a **reference** to your function, not a call. `Events.X.Add(fn())` executes `fn` immediately and registers its *return value* — a classic bug. **[CONFIRMED — pzwiki Lua event, revid 1390441]**
2. Your handler's **parameter list must match the event's output.** E.g. `OnCreatePlayer` passes `player`, so the handler signature is `function(player)`. Mismatched arg order is the usual cause of a handler "misbehaving" after a port. **[CONFIRMED — pzwiki Lua event, revid 1390441]**

**Custom events.** The pzwiki `Lua event` page documents the vanilla `Events.X.Add/.Remove` mechanism and, for *adding your own* events, points to community libraries (Events Plus API by Dismellion, Starlit Library by Albion, Doggy's Library) rather than a first-party `AddEvent` call. The raw `LuaEventManager.AddEvent("Name")` + `triggerEvent("Name", ...)` pattern below is the long-standing engine API and still works in B42, but note the pzwiki cache confirms only the hook/remove mechanism, not this pair:
```lua
LuaEventManager.AddEvent("MyCustomEvent")   -- declare (put in shared/)
Events.MyCustomEvent.Add(handler)
triggerEvent("MyCustomEvent", arg1, arg2)   -- fire
```
**[LIKELY — AddEvent/triggerEvent not covered by the pzwiki cache; verify against LuaDocs or vanilla source]**

demiurgeQuantified's B42 event stubs document **400+ events for 42.13.0**. Selected events with B42 signatures (from PZEventStubs `Events.lua` — **[CONFIRMED via demiurge stubs, not the pzwiki cache]**):

### Lifecycle / boot
- `Events.OnGameBoot()` — game startup complete.
- `Events.OnGameStart()` — finished loading, entering the game.
- `Events.OnInitGlobalModData(newGame:boolean)` — sandbox/global ModData load phase; good place to init ModData tables (see [Section 8](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)).
- `Events.OnGameTimeLoaded()` — GameTime ready.
- `Events.OnMainMenuEnter` / `Events.OnFETick()` — main-menu frame loop.

### Time
- `Events.EveryOneMinute()`, `Events.EveryTenMinutes()`, `Events.EveryHours()`, `Events.EveryDays()` — in-game clock ticks.
- `Events.OnTick()`, `Events.OnRenderTick()` — per game tick / per render frame.

### Player / character
- `Events.OnCreatePlayer(playerNum:integer, player:IsoPlayer)` — local player loads into the world.
- `Events.OnNewGame(player, square)` — first-time character creation.
- `Events.OnPlayerUpdate(player)` — per tick, per local player.
- `Events.OnPlayerMove(player)`.
- `Events.OnPlayerDeath(player)` / `Events.OnCharacterDeath(character:IsoGameCharacter)` (latter covers players, zombies, animals).
- `Events.OnCreateLivingCharacter(character:IsoLivingCharacter, desc:SurvivorDesc)`.

### Combat / damage / XP
- `Events.OnHitZombie(zombie:IsoZombie, attacker:IsoGameCharacter, bodyPart:BodyPartType, weapon:HandWeapon)`.
- `Events.OnWeaponSwing`, `Events.OnWeaponSwingHitPoint`, `Events.OnWeaponHitCharacter(attacker, target, weapon, damage)`, `Events.OnWeaponHitTree`, `Events.OnWeaponHitXp`.
- `Events.OnPlayerGetDamage`.
- `Events.AddXP(character:IsoGameCharacter, perk:PerkFactory.Perk, amount:float)`.
- `Events.LevelPerk(character, perk, level:integer, increased:boolean)`.

### Inventory / equipment / context menus
- `Events.OnEquipPrimary(character, item:InventoryItem)` / `Events.OnEquipSecondary(...)`.
- `Events.OnClothingUpdated(character)`.
- `Events.OnFillInventoryObjectContextMenu(playerNum:integer, context:ISContextMenu, items:table)`.
- `Events.OnFillWorldObjectContextMenu(playerNum:integer, context:ISContextMenu, worldobjects:table, test:boolean)`.
- `Events.OnFillInventoryContextMenuNoItems(playerNum, context, isLoot:boolean)`.
- `Events.OnFillContainer(roomType:string, containerType:string, container:ItemContainer)` — loot distribution hook.

### World / objects
- `Events.OnInitWorld()`.
- `Events.LoadGridsquare(square:IsoGridSquare)` — after a square loads (note the name; some docs also list `OnLoadGridsquare`).
- `Events.OnObjectAdded`, `Events.OnObjectAboutToBeRemoved`.
- `Events.OnContainerUpdate(object)` — container added/removed from world.
- `Events.OnDestroyIsoThumpable(object:IsoThumpable)`.
- `Events.OnGridBurnt(square)`, `Events.OnNewFire`.
- `Events.OnWaterAmountChange` — fluid/water level change (relevant to B42 fluids).

### Multiplayer / ModData sync (see [Section 8](/pz/build-42/modding/lua-api/lua-api-and-engine-overview) and [Section 9](/pz/build-42/modding/lua-api/lua-api-and-engine-overview))
- `Events.OnClientCommand(module:string, command:string, player:IsoPlayer, args:table)` — **server-side**, receives client commands. **[CONFIRMED — pzwiki Networking, revid 1436101]**
- `Events.OnServerCommand(module:string, command:string, args:table)` — **client-side**, receives server commands. **[CONFIRMED — pzwiki Networking, revid 1436101]**
- `Events.OnReceiveGlobalModData(key:string, modData:table)` — intercepts a `ModData.transmit(...)` payload. **[CONFIRMED — pzwiki Mod data, revid 1317225]**
- `Events.OnConnected()`, `Events.OnConnectFailed(message:string)`, `Events.OnConnectionStateChanged(...)`, `Events.OnDisconnect()`.
- `Events.OnAddMessage(message:ChatMessage, tabId:short)` — chat.

### Climate / weather (expanded in B42)
- `Events.OnClimateManagerInit(climateManager:ClimateManager)`, `Events.OnClimateTick(climateManager)`.
- `Events.OnWeatherPeriodStart/Stage/Complete`, `Events.OnThunderEvent`.
- `Events.OnInitModdedWeatherStage(...)`, `Events.OnUpdateModdedWeatherStage(...)` — **new B42 modded-weather hooks**.
- `Events.OnInitSeasons(season:ErosionSeason)`.

### Zombies / AI, Foraging, Controller, Crafting
- `Events.OnZombieCreate/Dead/Update`, `Events.OnAIStateChange(character, currentState:State, previousState:State)`.
- `Events.onEnableSearchMode`/`onDisableSearchMode`/`onToggleSearchMode`, `Events.onAddForageDefs`, `Events.preAddForageDefs`, `Events.onFillSearchIconContextMenu` — reworked B42 foraging/search.
- `Events.OnGamepadConnect/Disconnect`, `Events.OnJoypad*` and `Before*` variants; new `OnDoTileBuilding2` (KB/mouse build cursor) vs `OnDoTileBuilding3` (controller build cursor) split.
- `Events.OnDynamicMovableRecipe(sprite:string, recipe:MoveableRecipe, item:Moveable, character:IsoGameCharacter)` — movable scrapping recipe.

> **B42 event caveat:** event **names are largely stable** from B41, but some handler **argument lists changed** and a number of new events were added. If an old handler misbehaves, check the arg signature against PZEventStubs / LuaDocs rather than assuming the B41 order. **[LIKELY]**

---

<a name="7-globals"></a>
