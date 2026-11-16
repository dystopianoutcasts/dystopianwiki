---
id: build-42-how-the-world-is-saved
slug: how-the-world-is-saved
title: 'How the world is saved'
game: pz
version: build-42
section: engine
category: saves-and-persistence
difficulty: advanced
tags:
  - engine
  - saves
  - chunks
  - events
  - multiplayer
  - modding
excerpt: >-
  One chunk's life from load to save, the order of a full save, when OnSave and OnPostSave fire, how world versions work, and how a dedicated server saves differently from single player.
last_updated: '2026-11-15'
related_articles:
  - inside-a-save-folder
  - players-and-vehicles-databases
  - the-world-dictionary-and-changing-mods
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#one-chunks-life) | [server owners](#a-dedicated-server-saves-differently) | the event order is in [when OnSave and OnPostSave fire](#when-onsave-and-onpostsave-fire)

:::callout[The 1-minute version]{kind=key}
- In single player, a chunk file is read when the chunk loads, and written when the last view of it lets go. A background worker writes the queued chunks.
- Single player also writes changed chunks in the background about once a second, and writes a few other files when that queue is empty (the "hot save").
- A full save (`GameWindow.save`) writes the world files in a fixed order, and `OnSave` fires partway through it, before the chunk files and before global mod data are written. A full save also runs once during loading, when the save is new or from an older world version and the game is not a server, before `OnGameStart` fires.
- `OnPostSave` fires after a save only on the quit and exit paths, and on the crash path only when the game is a client. The code read here does not fire it after a sleep save or a Lua `save()` call.
- A dedicated server does not run `GameWindow.save`. It saves through `ServerMap`, and neither `OnSave` nor `OnPostSave` is fired there, unless a mod calls the global Lua `save()` or `saveGame()`, which call `GameWindow.save`.
- World version 251 is written into `map_ver.bin`, every chunk header and a few other files. Every step on this page is read from code and was not run in a game.
:::

:::facts
- **World version** 251
- **Hot save check** every 1000 ms, with at most 10 chunks waiting :cite[(`zombie/iso/IsoChunkMap.java:85`, `zombie/iso/IsoChunkMap.java:243-253`)]
- **Single-player player autosave** every 10000 ms :cite[(`zombie/savefile/PlayerDB.java:50`, `zombie/savefile/PlayerDB.java:134-140`)]
- **Server `map_t.bin`** every 600 seconds :cite[(`zombie/network/ServerMap.java:69`, `zombie/network/ServerMap.java:553-556`, `zombie/network/ServerChunkLoader.java:618-628`)]
- **Server `SaveWorldEveryMinutes`** default 0 :cite[(`zombie/network/ServerOptions.java:87-88`)]
- **Clients paused** when a server save takes more than 600 ms :cite[(`zombie/network/ServerMap.java:372-378`)]
:::

## One chunk's life

A chunk in single player goes from a file, to the world, to a queue, and back to its file.

The file is `map/<x>/<y>.bin` in the save folder :cite[(`zombie/ChunkMapFilenames.java:56-59`)]. When a chunk loads, `LoadOrCreate` takes the chunk from a server buffer if one is given, otherwise from the file if it exists and the chunk is not marked "blam", and otherwise builds a new chunk :cite[(`zombie/iso/IsoChunk.java:2321-2345`)].

:::flow[One chunk in single player]
- Chunk comes into view: read from its file, or built new
- Something in it changes and is flagged
- The last view lets go: it leaves the world and is queued
- A worker writes the file
:::

The chunk is queued when nobody is looking at it any more. The chunk map removes the chunk from the world and hands it to `ChunkSaveWorker.Add` once its list of viewers is empty :cite[(`zombie/iso/IsoChunkMap.java:730-737`, `zombie/iso/IsoChunkMap.java:1220-1227`)].

The worker runs on the world streamer thread, writes one queued chunk per call, and takes the chunk that is about to be loaded first, so the file is up to date before it is read again :cite[(`zombie/iso/ChunkSaveWorker.java:44-69`)]. It does nothing on a dedicated server :cite[(`zombie/iso/ChunkSaveWorker.java:44-45`)].

`IsoChunk.Save` writes nothing when saving is off or the game is a client :cite[(`zombie/iso/IsoChunk.java:4271-4275`)]. In single player it always writes, and `SafeWrite` truncates the file before writing it :cite[(`zombie/iso/IsoChunk.java:4284-4286`, `zombie/iso/IsoChunk.java:4315-4335`)].

## What a chunk file holds first

Every chunk file starts with a small header, and the header carries the world version.

The header is one byte for a debug flag, then the world version as an integer (251), then a length and a checksum :cite[(`zombie/iso/IsoChunk.java:4399-4408`)]. On load the game reads them in that order and stops with an "unknown world version" error if the version is higher than 251 :cite[(`zombie/iso/IsoChunk.java:3466-3500`)]. The body after the header changes with the version number, because the loader reads newer fields only when the version is at least a given number :cite[(`zombie/iso/IsoChunk.java:3500-3530`)].

After a load, the game checks that the squares at (0,0,0) and (7,7,0) are not both empty. If they are, it raises a "black chunk" error :cite[(`zombie/iso/IsoChunk.java:3447-3462`)].

## When a chunk will not load

A chunk file that throws while loading is kept as evidence and the chunk is built again.

On the exception, `BackupBlam` copies the file to `blam/<x>/<y>.bin` in the save folder and writes the error to `blam/<x>/<y>_error.txt`. `Blam` then clears the chunk's squares, and `LoadBrandNew` builds a fresh chunk :cite[(`zombie/iso/IsoChunk.java:2321-2345`, `zombie/iso/IsoChunk.java:4607-4660`)]. A server also writes the error to its `map` log :cite[(`zombie/iso/IsoChunk.java:2336-2337`)].

By the code, the next save of that chunk writes the new chunk over the bad file. Not run in a game. Back up the save before you touch a `blam` folder.

## Hot saves

A hot save writes a changed chunk in the background without waiting for a full save, and only single player does it.

Code that changes a chunk's contents calls `flagForHotSave`, which sets a flag unless hot saving is prevented for that chunk :cite[(`zombie/iso/IsoChunk.java:259-263`)]. Item containers do this when their contents change :cite[(`zombie/inventory/ItemContainer.java:557`)]. Once per 1000 ms, if the game is neither a client nor a server, the chunk map queues each flagged chunk, as long as fewer than 10 saves are already waiting :cite[(`zombie/iso/IsoChunkMap.java:243-253`)].

`AddHotSave` builds the chunk's bytes at the time it is queued, and the worker writes them later. The write is skipped when the checksum equals the one already stored for that chunk :cite[(`zombie/iso/ChunkSaveWorker.java:112-130`, `zombie/iso/ChunkSaveWorker.java:177-195`)].

When the queue becomes empty in single player, the worker also writes a set of other files in one pass: the meta grid, animal population, game time, map symbols, the visited map, entity data and the players. It collects them through a `SaveBufferMap`, a map from file name to a pooled buffer that is then written out file by file :cite[(`zombie/iso/ChunkSaveWorker.java:74-95`, `zombie/iso/SaveBufferMap.java:18-45`)].

## A full save in single player

A full save writes every loaded chunk and the world files in one fixed order, on the game thread.

`GameWindow.save` returns at once when saving is off, when there is no current cell, or in the tutorial :cite[(`zombie/GameWindow.java:1008-1009`)]. On a client, where `GameClient.clientSave` was set when it connected, it takes a short branch that writes only the world map symbols and the visited map and fires `OnSave` :cite[(`zombie/GameWindow.java:1010-1014`)]. Otherwise it runs the full branch below.

The same method also runs once during loading when `map_ver.bin` is missing (a new world) or the saved world version is not 251 (a converted world), and the game is not a server :cite[(`zombie/gameStates/GameLoadingState.java:335-345`)]. That save runs before `OnGameStart` :cite[(`zombie/gameStates/IngameState.java:775-776`)].

:::flow[The full branch of GameWindow.save]
- map_ver.bin and map_sand.bin
- World gen parameters, instance tracker, meta tracker, statistics
- OnSave fires
- Thumbnail, then map.bin through IsoCell.save: every loaded chunk, map_t.bin, meta grid, players, reanimated players
- Animals, collision data, global objects, radio
- Global mod data, map symbols, visited map, fish, entities, virtual vehicles
:::

The order is in the code. `map_ver.bin` and `map_sand.bin` come first, then four small trackers, then `OnSave` :cite[(`zombie/GameWindow.java:1016-1041`)]. Next come the thumbnail (only on the game thread) and `map.bin` :cite[(`zombie/GameWindow.java:1045-1058`)], and then animals, collision data, global objects (unless the game loaded as a client), radio, global mod data, map symbols, the visited map, fish, entities and virtual vehicles :cite[(`zombie/GameWindow.java:1062-1080`)].

`IsoCell.save` is what `map.bin` runs. It waits for the chunk worker to finish, saves each chunk map (every loaded chunk, written at once), writes the cell size, writes `map_t.bin`, saves the meta grid unless the game is a client, and saves the players and reanimated players :cite[(`zombie/iso/IsoCell.java:4247-4277`, `zombie/iso/IsoChunkMap.java:1026-1041`)].

## When OnSave and OnPostSave fire

`OnSave` fires inside every full save and `OnPostSave` fires only on a few exit paths, so the two are not a pair.

`OnSave` has two trigger sites in the game's Java, both in `GameWindow.save`, and no argument :cite[(`zombie/GameWindow.java:1014`, `zombie/GameWindow.java:1041`, `api/events.jsonl`)]. Its second site is the full branch above, after the trackers and before the chunk files and global mod data :cite[(`zombie/GameWindow.java:1041`, `zombie/GameWindow.java:1074`)].

So a handler that changes a global mod data table during `OnSave` has the change written in that same save. The [mod data article](/pz/build-42/modding/lua-api/moddata) says a change made in `OnSave` leaks into the next session, and this order does not show that. That claim is not verified here.

`OnPostSave` has four trigger sites: two in `GameWindow.exit`, one in the `IngameState` quit path and one in its crash path :cite[(`zombie/GameWindow.java:793`, `zombie/GameWindow.java:801`, `zombie/gameStates/IngameState.java:1388`, `zombie/gameStates/IngameState.java:1613`)]. The two in `exit` are identical blocks one after the other, so the event can fire twice on that path :cite[(`zombie/GameWindow.java:757-803`)].

The crash path fires it only when the game is a client :cite[(`zombie/gameStates/IngameState.java:1611-1615`)].

`GameWindow.save` is also called by the Lua functions `save(true)` and `saveGame()`, by the vanilla sleep dialog when all players are asleep, by `SleepingEvent` on wake-up, and when a new or converted world finishes loading :cite[(`zombie/Lua/LuaManager.java:3711-3727`, `media/lua/client/ISUI/ISSleepDialog.lua:83`, `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:1109`, `zombie/ai/sadisticAIDirector/SleepingEvent.java:484-500`, `zombie/gameStates/GameLoadingState.java:337-347`)]. None of those calls fires `OnPostSave`. If you need to run code after every save, do not rely on that event.

A search of the game's Java found no timer-based full save in single player. The ways a full save starts are the callers above. Not verified: that nothing else in the Lua files calls `save` on a timer.

## Quit, exit and crash

The quit, exit and crash paths each save once, and the crash path saves to a copy.

On quit, `IngameState` saves the players, runs `GameWindow.save(true)`, fires `OnPostSave` and closes the client player database :cite[(`zombie/gameStates/IngameState.java:1363-1395`)]. On exit, `GameWindow.exit` does the same only if `okToSaveOnExit` is true, which the game sets at the end of loading :cite[(`zombie/GameWindow.java:769-803`, `zombie/gameStates/GameLoadingState.java:482`)].

On a crash in the update loop, when the game is not a server, the game creates a world named `<save name>_crash`, copies the old save folder into it, and then saves into that copy :cite[(`zombie/gameStates/IngameState.java:1591-1618`, `zombie/gameStates/IngameState.java:469-491`, `zombie/gameStates/IngameState.java:538-551`)]. The original folder is left as it was. If you find a `_crash` folder next to a save, it holds the state at the crash. Not run in a game.

## A dedicated server saves differently

A dedicated server saves through `ServerMap` on its own schedule and never runs `GameWindow.save`.

A server save starts in one of three ways. The `SaveWorldEveryMinutes` option is a whole number from 0 up, and 0 is the default :cite[(`zombie/network/ServerOptions.java:87-88`)]. When it is above 0, the server queues a save once that many minutes have passed since the last one :cite[(`zombie/network/ServerMap.java:534-541`)].

The `save` command, which needs the `SaveWorld` capability, queues a save and answers "World saved" at once, before the save runs :cite[(`zombie/commands/serverCommands/SaveCommand.java:20-37`)]. And on shutdown the save runs from the shutdown hook :cite[(`zombie/network/GameServer.java:310-322`, `zombie/network/ServerMap.java:339-343`)].

:::flow[ServerMap.QueuedSaveAll, in order]
- Every loaded cell, then the meta grid
- Players, visited map, game time
- Reanimated players, animals, collision data, global objects, world gen, trackers
- Radio, global mod data, entities, server map symbols, hidden authors
:::

That order is `SaveAll`, `ServerPlayerDB.save`, the visited map, `saveLater` for `map_t.bin`, reanimated players, animals, collision data, global objects, world gen parameters, the two trackers, radio, global mod data, entities, `WorldMapServer.writeSavefile` and `HiddenAuthors.write` :cite[(`zombie/network/ServerMap.java:380-437`)]. On quit, the server then waits for the player queue to empty :cite[(`zombie/network/ServerMap.java:429-431`)].

`SaveAll` saves the loaded cells on four worker threads when at least 10 cells are loaded, and in a plain loop otherwise :cite[(`zombie/network/ServerMap.java:101-153`)]. If the save runs longer than 600 ms and the server is not quitting, it sends every client a pause message and sends a resume message when it ends :cite[(`zombie/network/ServerMap.java:372-378`, `zombie/network/ServerMap.java:432-436`)].

Because the server code never calls `GameWindow.save`, none of the server's own save code fires `OnSave` or `OnPostSave`. Vanilla Lua has no such call, but a mod's server Lua could call the global `save()` or `saveGame()`, which run `GameWindow.save` :cite[(`zombie/Lua/LuaManager.java:3711-3729`)] :cite[(`zombie/GameWindow.java:1014`, `zombie/GameWindow.java:1041`)]. The events named here are not fired on a server. Between full saves, the server writes `map_t.bin` every 600 seconds, entity data at most once per 1000 ms when it needs saving, each player every 180000 ms and again on disconnect :cite[(`zombie/network/ServerMap.java:553-561`, `zombie/network/ServerChunkLoader.java:618-628`, `zombie/core/raknet/UdpConnection.java:95`, `zombie/network/NetworkPlayerManager.java:25-35`, `zombie/network/GameServer.java:3070`)].

The server reads its world version from `map_t.bin`, while single player and clients read `map_ver.bin`. The server returns an error message when the saved version is newer than 251 or very old :cite[(`zombie/iso/IsoWorld.java:2485-2521`, `zombie/network/GameServer.java:4122-4147`)].

## The load order, briefly

The same `IsoWorld.init` loads a single-player game and a server, and it reads the files in a fixed order.

`OnPreMapLoad` fires first, and the game decides the save is new when `map_ver.bin` is missing :cite[(`zombie/gameStates/GameLoadingState.java:241`, `zombie/gameStates/GameLoadingState.java:248-253`)]. `IsoWorld.init` then reads the world version and the map name, then `id_manager_data.bin` and `important_area_data.bin` on any game that is not a client :cite[(`zombie/iso/IsoWorld.java:1833-1880`)].

After that it loads game time, then global mod data (which fires `OnInitGlobalModData`), then the trackers, and only after those the world dictionary :cite[(`zombie/iso/IsoWorld.java:2018-2048`, `zombie/world/moddata/GlobalModData.java:57-62`)]. The meta grid is read later, followed by `OnLoadedMapZones`, on any game that is not a client :cite[(`zombie/iso/IsoWorld.java:2063-2085`)]. `OnGameTimeLoaded` fires after `init` returns, on single player, on the server and on a client :cite[(`zombie/gameStates/GameLoadingState.java:322`, `zombie/network/GameServer.java:825`, `zombie/network/packets/connection/ConnectedPacket.java:93`)]. `OnLoad` fires from `IngameState` after `OnGameStart` :cite[(`zombie/gameStates/IngameState.java:775-776`)].

Two events named for saving are never triggered. `OnIsoThumpableSave` and `OnIsoThumpableLoad` are registered, and a search of the game's Java and vanilla Lua found no place that fires them :cite[(`zombie/Lua/LuaEventManager.java:704-705`)].

:::callout[How we know]{kind=proof}
- Every order, interval and condition on this page is read from the cited code. None was run in a game, so a step that depends on timing (hot saves, the server pause) is not verified at run time.
- The claim that no code fires `OnPostSave` after a sleep save comes from a search of every `triggerEvent("OnPostSave"` call in the game's Java. A mod's own Lua could fire it, and the vanilla Lua does not.
- Not verified: the "next session" claim in the mod data article, and whether anything in the Lua files calls `save` on a timer.
- `OnPostMapLoad` is fired per cell by `CellLoader` and is not a save event :cite[(`zombie/iso/CellLoader.java:458`)].
:::
