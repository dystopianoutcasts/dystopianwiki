---
id: build-42-when-lua-reloads-leaving-a-game-and-resets
slug: when-lua-reloads-leaving-a-game-and-resets
title: 'When your Lua reloads: leaving a game, resets, and the missing exit event'
game: pz
version: build-42
section: modding
category: lua-api
difficulty: intermediate
tags:
  - lua
  - events
  - lifecycle
  - logging
excerpt: >-
  In Build 42.22, leaving a game wipes and reloads every Lua file and fires OnGameBoot, not OnResetLua. There is no game-ending event, so flush on OnPostSave and close files often.
last_updated: '2026-11-16'
related_articles:
  - lua-load-order-and-the-three-lua-folders
  - the-events-system
  - moddata
  - debugging-lua-in-b42
  - kahlua-what-project-zomboid-lua-does-not-have
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who want to do one last thing when a game ends, such as write a log, save some numbers or close a file. For when your files load in the first place, see [Lua load order and the three Lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

Outcast, a lot of mods want a last word when the game ends. There is no event that gives it to you, and the reason also explains a few strange things about module state. Here is what really happens between "Quit to main menu" and the main menu.

:::callout[The 1-minute version]{kind=key}
- Leaving a game (single player, or a multiplayer client leaving a server) saves first, so `OnSave` and `OnPostSave` fire. Then it removes every event handler, rebuilds the whole Lua environment and loads the `shared` and `client` files again, so every global your mod made is gone.
- The game then fires `OnGameBoot`. It does not fire `OnResetLua` on this path.
- `OnResetLua(reason)` fires only after the game's "reset Lua" routine: when a client connects to a server, when mod options are applied from the main menu, and a few other menu actions, including the debug Reset Lua button.
- There is no `OnGameEnd`, `OnGameStop` or `OnGameExit` event. To flush on any full save use `OnSave`, and for a last thing on leaving use `OnPostSave`, which fires only then. To notice a lost server on a multiplayer client, use `OnDisconnect`.
- A `LuaFileWriter` has no `flush()`. Only `close()` is sure to put your bytes on disk, so open, write and close on a schedule.
:::

:::facts
- **Exit path events, in order** `OnSave`, `OnPostSave`, then (after the reload) `OnGameBoot`
- **Reset path events, in order** `OnGameBoot`, `OnMainMenuEnter`, `OnResetLua`
- **Missing events** `OnGameEnd`, `OnGameStop`, `OnGameExit` (none are registered)
- **Writer methods** 3: `write`, `writeln`, `close`
:::

## 1. Leaving a game wipes your Lua and loads it again

**When a player leaves a game, the game saves, removes every handler, rebuilds the Lua environment and loads it again for the main menu.**

:::flow[Leaving a game, single player or multiplayer client]
- A multiplayer client disconnects
- The game saves, fires `OnSave`, then `OnPostSave`
- The state exits and removes every event handler
- A new Lua environment is built, with the default mod list
- `shared` and `client` load again
- `OnGameBoot` fires
:::

A multiplayer client first disconnects, then the game saves, and `OnPostSave` fires. :cite[(`zombie/gameStates/IngameState.java:1367-1371`, `zombie/gameStates/IngameState.java:1380-1388`)] Then the state's exit method removes every Lua event handler, resets many systems and creates the Lua environment again. :cite[(`zombie/gameStates/IngameState.java:978`, `zombie/gameStates/IngameState.java:1009`)] The new environment has no globals and no loaded-file list. :cite[(`zombie/Lua/LuaManager.java:1087-1119`)]

The exit then loads the default mod list, runs the scripts, loads `shared` and `client` again and fires `OnGameBoot`. :cite[(`zombie/gameStates/IngameState.java:1044`, `zombie/gameStates/IngameState.java:1078`, `zombie/gameStates/IngameState.java:1085`)] The `server` files are not loaded again until the next world loads. :cite[(`zombie/Lua/LuaManager.java:1253-1257`)]

So module state does not survive a trip to the main menu, and a "load once" latch in a global is reset too. That is usually what you want. Only what you wrote to a file, or to mod data in a save, survives.

## 2. When `OnResetLua` fires

**`OnResetLua(reason)` fires only from the game's own reset routine, after it has reloaded everything.**

The routine rebuilds the Lua environment, loads the mod list it was given, loads `shared` and `client`, and then fires `OnGameBoot`, `OnMainMenuEnter` and `OnResetLua` in that order. :cite[(`zombie/core/Core.java:3470-3562`)] It is called from these places in the vanilla files.

- **Connecting to a server** with the reason `ConnectedToServer`, loading the server's mod list. :cite[(`zombie/gameStates/ConnectToServerState.java:133`, `zombie/ZomboidFileSystem.java:759-763`)]
- **Applying options** from the main menu, for example a mod list change, with the reasons `optionsChangedApplied` or `optionsChangedAccepted`. The options screen delays the reset until the main screen next updates. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3399`, `zombie/core/Core.java:3565-3578`, `zombie/gameStates/MainScreenState.java:696`)]
- **Starting or continuing a game** with a different mod list than the one loaded, with the reasons `modsChanged`, `continueSave` and `startTutorial`. The mod selector adds `NewGameMods` and `modsChanged`, and the server settings screen adds `ServerSettingsReturnToDefault`. :cite[(`media/lua/client/OptionScreens/ModSelector/ModSelectorModel.lua:291-299`, `media/lua/client/OptionScreens/ServerSettingsScreen.lua:2935`, `media/lua/client/OptionScreens/ServerSettingsScreen.lua:2949`)] These are the callers in the vanilla Lua, and a mod can call the routine too. :cite[(`media/lua/client/OptionScreens/MainScreen.lua:1150-1155`, `media/lua/client/OptionScreens/MainScreen.lua:1219-1223`, `media/lua/client/OptionScreens/MainScreen.lua:994-996`, `zombie/modding/ActiveMods.java:82-85`)]
- **The gamepad style changing**, with the reason `gamepadStyleChange`, and **backing out of joining a server**, with the reason `exitJoinServer`. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:1011`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:577`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:616`)]
- **The Reset Lua button** on the main menu, with the reason `Force`. It shows only in debug mode. :cite[(`media/lua/client/OptionScreens/MainScreen.lua:410-411`)]

The leaving-a-game path in section 1 is a different routine, which is why `OnResetLua` does not fire there. If your mod detects "Lua was reloaded" with `OnResetLua`, it misses the most common reload of all. Hook `OnGameBoot` too.

## 3. Reloading one file, and the server commands

**A debug or admin reload runs a single file again without removing the handlers already added.**

The global `reloadLuaFile(path)` takes the file off the loaded list and runs it again. :cite[(`zombie/Lua/LuaManager.java:4066-4077`)] While a file is reloaded this way, `Events.X.Add` and `Events.X.Remove` do nothing. :cite[(`zombie/Lua/LuaManager.java:1372`, `zombie/Lua/Event.java:102-104`, `zombie/Lua/Event.java:124-126`)] So a reloaded file does not add its handlers a second time, and a handler registered by a new line in the file is not registered until the next full load.

The engine has a function that swaps a handler for a new closure when the file and function name match. :cite[(`zombie/Lua/LuaEventManager.java:872-883`)] What calls it is in the Kahlua jar, which was not read, so how a changed handler body takes effect is not verified.

On a dedicated server, the admin commands `reloadlua <file>` and `reloadalllua` do the same for a file or every loaded file, for a role with the capability `ReloadLuaFiles`. :cite[(`zombie/commands/serverCommands/ReloadLuaCommand.java:20-45`, `zombie/commands/serverCommands/ReloadAllLuaCommand.java:19-48`)]

## 4. There is no "game is ending" event

**No `OnGameEnd`, `OnGameStop` or `OnGameExit` event exists in Build 42.22, and a handler of yours would be removed before it could run.**

The events the game registers include none with those names. :cite[(`zombie/Lua/LuaEventManager.java:597-859`)] The exit method clears every handler partway through its resets, so none of yours runs for the steps after it. :cite[(`zombie/gameStates/IngameState.java:978`)] The saving that comes before it fires `OnSave` and `OnPostSave` while your handlers still exist. :cite[(`zombie/GameWindow.java:1014`, `zombie/GameWindow.java:1041`, `zombie/gameStates/IngameState.java:1380-1388`)]

Where to hook instead:

| You want to | Use | Code |
|---|---|---|
| Flush on any full save, mid-game or on quit | `Events.OnSave` (single player and client), which fires before the data is written | :cite[(`zombie/GameWindow.java:1014`, `zombie/GameWindow.java:1041`, `zombie/Lua/LuaManager.java:3718`)] |
| Do a last thing when leaving the game | `Events.OnPostSave`, which fires only when leaving (normal exit, crash path, window close) | :cite[(`zombie/gameStates/IngameState.java:1388`, `zombie/gameStates/IngameState.java:1613`, `zombie/GameWindow.java:793`, `zombie/GameWindow.java:801`)] |
| Notice that a multiplayer client lost its server | `Events.OnDisconnect`, which a client fires when its connection reports a disconnect | :cite[(`zombie/network/GameClient.java:355`)] |
| Know the game finished starting | `OnGameStart` on a client or in single player, `OnServerStarted` on a dedicated server | :cite[(`zombie/gameStates/IngameState.java:775`, `zombie/network/GameServer.java:1581`)] |

Mid-game full saves fire `OnSave` only: sleeping (in single player, when all players are asleep), the Lua `save()` global and one dialog. :cite[(`zombie/ai/sadisticAIDirector/SleepingEvent.java:485-490`, `zombie/ai/sadisticAIDirector/SleepingEvent.java:500`, `zombie/Lua/LuaManager.java:3718`, `zombie/ui/ModalDialog.java:107`)] On a multiplayer client, the world is saved by the server, so the client's `OnSave` and `OnPostSave` cover only the client's own files. :cite[(`zombie/GameWindow.java:1010-1014`)]

A dedicated server's own save fires neither `OnSave` nor `OnPostSave`, because the only trigger of `OnSave` is in `GameWindow.save`, which the server's save path does not call. So server code should write as it goes. :cite[(`zombie/GameWindow.java:1014`, `zombie/GameWindow.java:1041`, `zombie/network/ServerMap.java:380-437`)]

## 5. If you write a file, close it often

**A `LuaFileWriter` has no `flush()`, so a file you keep open until "the end" may never be written.**

The writer that `getFileWriter` returns has three methods, `write`, `writeln` and `close`, and wraps a `PrintWriter`. :cite[(`zombie/Lua/LuaManager.java:12822-12841`, `zombie/Lua/LuaManager.java:6697-6727`)] Buffer lines in a table, and open, write and close on a schedule, for example every 25 lines, every in-game minute and on `OnPostSave`. A crash then loses at most the last batch.

`getTimestampMs()` is the Java wall clock in milliseconds, and there is no finer timer, so something that takes under a millisecond measures as 0. Time a thousand calls and divide. :cite[(`zombie/Lua/LuaManager.java:9238-9243`)]

## Where to go next

- [The events system](/pz/build-42/modding/lua-api/the-events-system)
- [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42)
- [What Project Zomboid Lua does not have](/pz/build-42/modding/lua-api/kahlua-what-project-zomboid-lua-does-not-have), which covers the missing `debug` library

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game was run.

Corrected from the 42.21 page: it said handlers are removed before anything else on the exit path; the code saves first, so `OnSave` and `OnPostSave` do fire while your handlers exist. It also listed three `OnResetLua` callers; the code has more (the table in section 2). It said a multiplayer client cannot count on `OnPostSave`; the client does fire it.

The 42.21 page's section on the missing Kahlua `debug` library moved to the Kahlua page and was not re-checked here, because the Kahlua classes are not in the decompiled source. Dropped: the 42.21 claim that `OnDisconnect` fires before the reset, because the code shows only where it is fired, not when relative to the exit. The server's save path runs through `ServerMap`, and `OnSave` is triggered only inside `GameWindow.save`. Not verified: how the exit path differs after a lost server connection.
:::
