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
  Leaving a game wipes and reloads every Lua file and fires OnGameBoot, not
  OnResetLua. Your event handlers are removed before that happens, so there
  is no "game is ending" event to flush a file on. What actually fires, and
  where to save your state instead. Read from the 42.21 code.
last_updated: '2026-10-04'
---
# When your Lua reloads: leaving a game, resets, and the missing exit event

Outcast, a lot of mods want to do one last thing when the game ends: write a log, save some numbers, close a file. We spent a while looking for the event that lets you. It does not exist, and the reason why also explains a few other strange things about module state. Here is what really happens between "Quit to main menu" and the main menu.

For when your files load in the first place, see [Lua load order and the three Lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

## Leaving a game wipes your Lua and loads it again

When a player leaves a game, the game, in this order:

1. clears every Lua event handler (`LuaEventManager.Reset()`);
2. resets dozens of systems and then re-creates the whole Lua environment (`LuaManager.init()`), so every global your mod made is gone;
3. loads every Lua file again, for the main menu;
4. fires `OnGameBoot`.

So module state does not survive a trip to the main menu, and a "load once" latch in a global is reset too. That is usually what you want. What surprises people is that **`OnResetLua` does not fire on this path.** If your mod detects "Lua was reloaded" with `OnResetLua`, it misses the most common reload of all.

> **Proof:** Code. `zombie.gameStates.IngameState#exit`: `LuaEventManager.Reset()`, then the system resets, then `LuaManager.init()`, and later `LuaEventManager.triggerEvent("OnGameBoot")`; no `OnResetLua` on this path. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When `OnResetLua` does fire

`OnResetLua(reason)` fires only from the game's own "reset Lua" routine, after it has reloaded everything and fired `OnGameBoot` and `OnMainMenuEnter`. That routine runs when:

- the client connects to a server (reason `ConnectedToServer`);
- options are changed and applied from the main menu, for example a mod list change (`optionsChangedApplied`, `optionsChangedAccepted`);
- the gamepad style changes, or a player backs out of joining a server.

> **Proof:** Code. `zombie.core.Core#ResetLua` (reloads, then `OnGameBoot`, `OnMainMenuEnter`, `OnResetLua` with the reason); callers `zombie.gameStates.ConnectToServerState` (`ResetLua("client", "ConnectedToServer")`), `media/lua/client/OptionScreens/MainOptions.lua` (`DelayResetLua`), `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## There is no "game is ending" event

There is no `OnGameEnd`, `OnGameStop` or `OnGameExit` event in Build 42. And even if you invented one, step 1 above removes every handler before anything else is torn down, so nothing of yours runs on the way out.

Where to hook instead:

| You want to | Use |
|---|---|
| Save or flush when a single-player game is saved (including the save on quit) | `Events.OnPostSave` |
| Notice that a multiplayer client lost its server | `Events.OnDisconnect` (it fires in the live game, before the reset) |
| Know the game finished starting | `OnGameStart` on a client or single player; `OnServerStarted` on a dedicated server |

In multiplayer the world is saved by the server, so client-side code should not count on `OnPostSave` to flush its data. Use `OnDisconnect`, or write as you go.

> **Proof:** Code. Searched the decompiled Java for the event names `OnGameEnd`, `OnGameStop` and `OnGameExit` (no `AddEvent`, no trigger); `zombie.Lua.LuaEventManager` registers `OnDisconnect` and `OnResetLua`; `zombie.network.GameClient` triggers `OnDisconnect`; `IngameState` and `zombie.GameWindow` trigger `OnPostSave`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## If you write a file, close it often

A `LuaFileWriter` has no `flush()`: only `close()` is sure to put your bytes on disk. With no exit event, a file you keep open until "the end" is never written. Buffer lines in a table and open, write and close on a schedule (we do every 25 lines, every in-game minute, and on `OnPostSave`). A crash then loses at most the last batch.

> **Proof:** Code. `zombie.Lua.LuaManager`, the nested `LuaFileWriter` class returned by `getFileWriter`: its public methods are `write`, `writeln` and `close`, wrapping a `PrintWriter`, with no `flush`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Two more things the runtime does not have

- **No `debug` library.** The game's Lua (Kahlua) ships base, coroutine, OS, random, string, table and math libraries, and no debug library: no `debug.getinfo`, no `debug.sethook`, no `debug.traceback`. You cannot measure which mod's code is slow from inside Lua.
- **Milliseconds only.** `getTimestampMs()` is the Java wall clock in milliseconds, and there is no finer timer. Anything that takes under a millisecond measures as 0, so time a thousand calls and divide.

> **Proof:** Code. Listed the Kahlua library classes in the installed `projectzomboid.jar` (`BaseLib`, `CoroutineLib`, `OsLib`, `RandomLib`, `StringLib`, `TableLib`, `MathLib`; no debug library); `zombie.Lua.LuaManager`, the global `getTimestampMs` returns `System.currentTimeMillis()`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [The events system](/pz/build-42/modding/lua-api/the-events-system)
- [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42)
