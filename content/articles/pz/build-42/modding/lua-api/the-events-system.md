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
  How a Build 42.22 mod hooks a named event with Events.X.Add, the arguments of the common events and the side that fires them, and how to make an event of your own.
last_updated: '2026-11-16'
related_articles:
  - key-globals-and-classes
  - lua-load-order-and-the-three-lua-folders
  - multiplayer-command-patterns
  - moddata
  - when-lua-reloads-leaving-a-game-and-resets
  - lua-gameplay-mod
  - hooks-for-new-b42-systems
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write Lua for Build 42. A complete mod that makes its own event is [Lua gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod).

:::callout[The 1-minute version]{kind=key}
- Hook an event with `Events.OnSomething.Add(handlerFunction)`. Pass the function itself, never the result of calling it.
- Your handler gets the event's arguments in order, so its parameter list has to match the table below. Handlers run in the order they were added, and an error in one is logged and the next still runs.
- `Add` and `Remove` take only a Lua function. `Add(fn())` registers nothing when `fn()` returns nothing, and it raises no error.
- Some events fire on one side only. `OnGameStart` does not fire on a dedicated server, which has `OnServerStarted`; `OnClientCommand` fires on the server and in single player.
- To make your own event, call `LuaEventManager.AddEvent("Name")` in a shared file, hook it with `Events.Name.Add`, and fire it with `triggerEvent("Name", a, b)`.
:::

:::facts
- **Events registered in Java** 263
- **Hooks** 8, on the separate `Hook` table
- **`triggerEvent` arguments from Lua** up to 4 after the name
- **Reload effect** a Lua reset clears every handler
:::

## 1. Hooking an event

**An event is a table with `Add` and `Remove`, and both take a Lua function.**

```lua
local function onCreatePlayer(playerNum, player)   -- parameters match the event's arguments
    print("player " .. tostring(playerNum) .. " loaded")
end
Events.OnCreatePlayer.Add(onCreatePlayer)      -- register
Events.OnCreatePlayer.Remove(onCreatePlayer)   -- unregister: needs the same function
```

`Add` stores the function only when the argument is a Lua function, and otherwise does nothing. :cite[(`zombie/Lua/Event.java:105-107`)] So `Events.OnTick.Add(onTick())` runs `onTick` at once and registers its return value if that is a function, or nothing at all if it returns nothing. `Remove` looks the function up by identity, so an anonymous function cannot be removed later. :cite[(`zombie/Lua/Event.java:127-129`)] Adding the same function twice stores it twice, because `Add` does not look for a duplicate. :cite[(`zombie/Lua/Event.java:105-107`)]

When the event fires, the engine calls the handlers in the order they were added, and an error in one is logged and the loop goes on to the next. :cite[(`zombie/Lua/Event.java:59-70`)] A handler may remove itself while the event runs. :cite[(`zombie/Lua/Event.java:68-70`)]

An event triggered from a thread other than the main Lua thread is queued and runs later on the main thread. :cite[(`zombie/Lua/LuaEventManager.java:244-256`)]

## 2. The events you will use most

**Each row gives the arguments in order and the line that fires the event.**

| Event | Arguments | Fires when | Code |
|---|---|---|---|
| `OnGameBoot` | none | The game starts, after a Lua reset, after leaving a game, and when a dedicated server starts | :cite[(`zombie/GameWindow.java:666`, `zombie/core/Core.java:3560`, `zombie/gameStates/IngameState.java:1085`, `zombie/network/GameServer.java:1544`)] |
| `OnGameStart`, `OnLoad` | none | A world has loaded, in single player and on a multiplayer client | :cite[(`zombie/gameStates/IngameState.java:775-776`)] |
| `OnServerStarted` | none | A dedicated server has started | :cite[(`zombie/network/GameServer.java:1581`)] |
| `OnInitGlobalModData` | `isNewGame` | Global mod data has loaded | :cite[(`zombie/world/moddata/GlobalModData.java:61`)] |
| `OnCreatePlayer` | `playerNum`, `player` | A local player is created; also fires from a Lua global and when a split-screen player joins | :cite[(`zombie/gameStates/GameLoadingState.java:441`, `zombie/Lua/LuaManager.java:3980`, `zombie/util/AddCoopPlayer.java:169`)] |
| `OnNewGame` | `player`, `square` | A new character starts. It fires from four places, and the server's one, for a player who joins, passes a nil square | :cite[(`zombie/iso/IsoWorld.java:2305`, `zombie/iso/IsoWorld.java:2416`, `zombie/Lua/LuaManager.java:6485`, `zombie/network/packets/character/CreatePlayerPacket.java:308`)] |
| `OnTick` | update count | Each game update, on the server too unless it is paused | :cite[(`zombie/gameStates/IngameState.java:1525-1527`, `zombie/gameStates/IngameState.java:1571`, `zombie/network/GameServer.java:1068`)] |
| `OnRenderTick` | none | Each rendered frame | :cite[(`zombie/GameWindow.java:758`)] |
| `EveryOneMinute`, `EveryTenMinutes`, `EveryHours`, `EveryDays` | none | Each in-game minute, ten minutes, hour or day | :cite[(`zombie/GameTime.java:643`, `zombie/GameTime.java:637`, `zombie/GameTime.java:611`, `zombie/GameTime.java:665`)] |
| `OnPlayerUpdate` | `player` | A player updates | :cite[(`zombie/characters/IsoPlayer.java:2298`)] |
| `OnPlayerDeath` | `player` | A local player dies | :cite[(`zombie/characters/IsoPlayer.java:6581-6583`)] |
| `OnCharacterDeath` | `character` | A character's death handler runs, for players, zombies and animals | :cite[(`zombie/characters/IsoGameCharacter.java:4915-4917`, `zombie/characters/animals/IsoAnimal.java:1143-1145`)] |
| `OnZombieDead` | `zombie` | A zombie dies; it also fires from two other places in the character class | :cite[(`zombie/characters/IsoZombie.java:5394`, `zombie/characters/IsoGameCharacter.java:5992`, `zombie/characters/IsoGameCharacter.java:6504`)] |
| `OnHitZombie` | `zombie`, `attacker`, `bodyPart`, `weapon` | A zombie is hit | :cite[(`zombie/characters/IsoZombie.java:1364`)] |
| `OnWeaponHitCharacter` | `attacker`, `target`, `weapon`, `damage` | A weapon hits a character | :cite[(`zombie/characters/IsoGameCharacter.java:6127`)] |
| `AddXP` | `character`, `perk`, `amount` | A character gains experience | :cite[(`zombie/characters/IsoGameCharacter.java:17944`)] |
| `LevelPerk` | `character`, `perk`, `level`, `increased` | A skill level changes. `increased` is `false` on the paths that reset or load a level and `true` on the level-up paths | :cite[(`zombie/characters/IsoGameCharacter.java:4831`, `zombie/characters/IsoGameCharacter.java:4836`, `zombie/characters/IsoGameCharacter.java:4862`, `zombie/characters/IsoGameCharacter.java:4875`)] |
| `LoadGridsquare` | `square` | A square loads | :cite[(`zombie/iso/IsoChunk.java:3841`)] |
| `OnFillWorldObjectContextMenu` | `player`, `context`, `worldobjects`, `test` | The world right-click menu is built; `player` is the player index | :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:213`)] |
| `OnFillInventoryObjectContextMenu` | `player`, `context`, `items` | An inventory item menu is built | :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:935`)] |
| `OnClientCommand` | `module`, `command`, `player`, `args` | A client command reaches the server, and in single player; the player-first `sendClientCommand` also fires it directly when called on a server | :cite[(`zombie/network/GameServer.java:2343`, `zombie/spnetwork/SinglePlayerServer.java:204`, `zombie/Lua/LuaManager.java:8884`)] |
| `OnServerCommand` | `module`, `command`, `args` | A server command reaches a multiplayer client, and in single player | :cite[(`zombie/network/GameClient.java:1000`, `zombie/spnetwork/SinglePlayerClient.java:149`)] |
| `OnReceiveGlobalModData` | `tag`, `table` or `false` | A mod data packet arrives | :cite[(`zombie/network/packets/service/GlobalModDataPacket.java:56`, `zombie/network/packets/service/GlobalModDataPacket.java:62`)] |
| `OnConnected`, `OnDisconnect` | none | A client has connected, or has lost its server | :cite[(`zombie/gameStates/ConnectToServerState.java:173`, `zombie/network/GameClient.java:355`)] |
| `OnSave` | none | Every full save on a client or in single player: leaving, sleep (single player only), the Lua `save()` global and one dialog. A dedicated server's own save fires neither this nor `OnPostSave` | :cite[(`zombie/GameWindow.java:1014`, `zombie/GameWindow.java:1041`, `zombie/ai/sadisticAIDirector/SleepingEvent.java:485-490`, `zombie/ai/sadisticAIDirector/SleepingEvent.java:500`, `zombie/Lua/LuaManager.java:3718`, `zombie/ui/ModalDialog.java:107`)] |
| `OnPostSave` | none | Only when leaving the game, after the save: the normal exit, the crash path and the window close. A mid-game save fires `OnSave` only | :cite[(`zombie/gameStates/IngameState.java:1388`, `zombie/gameStates/IngameState.java:1613`, `zombie/GameWindow.java:793`, `zombie/GameWindow.java:801`)] |
| `OnResetLua` | `reason` | After a Lua reset | :cite[(`zombie/core/Core.java:3562`)] |

Every event on this page exists at 42.22. `OnClientCommand` is covered on [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns), mod data events on [ModData](/pz/build-42/modding/lua-api/moddata), and the save and reset events on [When your Lua reloads](/pz/build-42/modding/lua-api/when-lua-reloads-leaving-a-game-and-resets).

The Java registers 263 events, one call each in the method that sets them up. :cite[(`zombie/Lua/LuaEventManager.java:598-860`)] Lua files can add more, and vanilla does: its search and foraging code registers `onToggleSearchMode`, `onEnableSearchMode` and `onDisableSearchMode`. :cite[(`media/lua/client/Foraging/ISSearchManager.lua:34-36`)]

### More events

These exist at 42.22 too, with the arguments shown.

| Event | Arguments | Code |
|---|---|---|
| `OnGameTimeLoaded`, `OnMainMenuEnter` | none | :cite[(`zombie/gameStates/GameLoadingState.java:322`, `zombie/core/Core.java:3561`)] |
| `OnPlayerMove` | `player` | :cite[(`zombie/characters/IsoPlayer.java:2242`)] |
| `OnEquipPrimary`, `OnEquipSecondary` | `character`, `item` | :cite[(`zombie/characters/IsoGameCharacter.java:3413`, `zombie/characters/IsoGameCharacter.java:3771`)] |
| `OnClimateManagerInit`, `OnClimateTick` | `climateManager` | :cite[(`zombie/iso/weather/ClimateManager.java:251`, `zombie/iso/weather/ClimateManager.java:870`)] |
| `OnFillContainer` | `roomName`, `containerType`, `container` | :cite[(`zombie/inventory/ItemPickerJava.java:598`)] |
| `OnDynamicMovableRecipe` | `sprite`, `recipe`, `item`, `character` | :cite[(`zombie/inventory/RecipeManager.java:154`)] |
| `OnGamepadConnect` | controller id | :cite[(`zombie/core/input/Input.java:188`)] |

The other events (weather stages, foraging, joypad, chat, trading and more) are in the capture's event index, `api/events.jsonl`, which is generated from the engine and not published on the wiki; the 42.21 page's long catalog was dropped for that reason.

## 3. Which side fires what

**The same game start fires different events on a dedicated server than in single player or on a client.**

`OnGameStart` and `OnLoad` come from the state a world loads into, and the dedicated server runs that state's update but never enters it, so they do not fire there. :cite[(`zombie/gameStates/IngameState.java:775-776`, `zombie/network/GameServer.java:1068`)] The server has `OnServerStarted` and `OnGameBoot` instead. :cite[(`zombie/network/GameServer.java:1544`, `zombie/network/GameServer.java:1581`)]

`OnPlayerDeath` fires only for a local player. :cite[(`zombie/characters/IsoPlayer.java:6581-6583`)] `OnCharacterDeath` fires from the death handler that `DoDeath` calls, and a player's `onKilled` has a server-only branch before it calls `DoDeath`, so it is the event to try for a death on a server; that it fires there for a remote player was read from those callers and not run. :cite[(`zombie/characters/IsoGameCharacter.java:2071-2072`, `zombie/characters/IsoPlayer.java:6567-6568`, `zombie/characters/IsoPlayer.java:8393-8412`)] The two command events are one per side. :cite[(`zombie/network/GameServer.java:2343`, `zombie/network/GameClient.java:1000`)]

Whether `OnPlayerUpdate` and the combat events fire on a client, the server or both was not traced here, so a mod that must run on one side checks `isClient()` or `isServer()` itself. See [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders#6-guards-for-client-server-and-single-player).

## 4. Your own event

**Call `LuaEventManager.AddEvent` once to create the event, then fire it with the global `triggerEvent`.**

```lua
-- in a shared file, so both sides have the event
LuaEventManager.AddEvent("MyModThingHappened")

Events.MyModThingHappened.Add(function(thing, amount)
    print("thing happened: " .. tostring(thing) .. " " .. tostring(amount))
end)

triggerEvent("MyModThingHappened", "door", 3)
```

`AddEvent` makes the event and its `Events.<name>` table, and returns the existing event when the name is taken. :cite[(`zombie/Lua/LuaEventManager.java:579-593`)] Vanilla's Lua uses it the same way. :cite[(`media/lua/client/Foraging/forageClient.lua:47`)] The global `triggerEvent` takes the name and up to four arguments. :cite[(`zombie/Lua/LuaManager.java:5278-5316`)]

Firing an event nobody hooked runs nothing, and firing a name that was never added creates that event and logs a line. :cite[(`zombie/Lua/LuaEventManager.java:234-242`)] Run `AddEvent` at file scope so it is made again after every Lua reset, because a reset clears all events. :cite[(`zombie/Lua/LuaEventManager.java:885-892`)]

## 5. Hooks are a second table

**Eight names live on a separate `Hook` table, with the same `Add` and `Remove`.**

The hook manager registers each of them with one call, in one method. :cite[(`zombie/Lua/LuaHookManager.java:128-136`)]

:::chips
- `AutoDrink`
- `UseItem`
- `Attack`
- `CalculateStats`
- `ContextualAction`
- `WeaponHitCharacter`
- `WeaponSwing`
- `WeaponSwingHitPoint`
:::

Vanilla hooks one with `Hook.Attack.Add(...)`. :cite[(`media/lua/shared/TimedActions/ISReloadWeaponAction.lua:544`)] The new-system hooks are on [Hooks for new B42 systems](/pz/build-42/modding/lua-api/hooks-for-new-b42-systems).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game was run. The 263 comes from counting the `AddEvent("...")` calls in `AddEvents`.

Corrected from the 42.21 page: it quoted "400+ events" from a third-party stub list for 42.13, which 42.22 does not match, and it listed `OnLoadGridsquare` as an alternative name; no such event exists at 42.22, only `LoadGridsquare`.

Dropped as unverifiable: the claim that handler argument lists changed from Build 41. Not verified: which side fires `OnPlayerUpdate` and the combat events, and whether the 8 hooks pass the arguments their names suggest.
:::
