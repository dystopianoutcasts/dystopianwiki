---
id: build-42-saves-reference
slug: saves-reference
title: 'Saves reference'
game: pz
version: build-42
section: engine
category: saves-and-persistence
difficulty: advanced
tags:
  - engine
  - saves
  - reference
  - events
  - modding
excerpt: >-
  Look-up tables for saves: every file a save holds, the save events, the save and backup server options, and the mod data calls Lua can use.
last_updated: '2026-11-15'
related_articles:
  - inside-a-save-folder
  - how-the-world-is-saved
  - players-and-vehicles-databases
  - mod-data-that-survives-a-save
  - the-world-dictionary-and-changing-mods
  - how-saves-work
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#save-events) | [server owners](#server-options-for-saves-and-backups) | [everyone](#every-file-in-a-save)

:::callout[The 1-minute version]{kind=key}
- The files table has 46 rows: the 45 rows of the [inside a save folder](/pz/build-42/engine/saves-and-persistence/inside-a-save-folder) page, plus one row for the old character files. Each row has its writer, its reader and where to read the code.
- The events table lists 10 save and load events. The server code fires neither `OnSave` nor `OnPostSave` (a server mod could still call `save()` or `saveGame()`), and two events are registered but never fired.
- The options table lists 6 server options that change when a save or a backup happens. `SaveWorldEveryMinutes` and `BackupsPeriod` both default to 0, which turns the timer off.
- Lua can call all 10 members of `ModData`. The index marks no method of `GlobalModData`, `PlayerDB` or `WorldDictionary` as callable from Lua.
- Some rows say "not verified" where no reader or writer was found. Nothing here was run in a game.
:::

:::facts
- **World version written** 251 :cite[(`zombie/GameWindow.java:1018`)]
- **Rows in the files table** 46
- **Save events listed** 10
- **Save and backup options listed** 6
- **`ModData` members callable from Lua** 10
:::

## Every file in a save

This table lists each file or folder that the game writes into a save folder, with what writes it and what reads it.

A script counted the rows of the table on [inside a save folder](/pz/build-42/engine/saves-and-persistence/inside-a-save-folder), and then searched `zombie/` for every string that ends in `.bin`, `.db`, `.tmp` or `.bak`. The names that the search found and the table does not hold are listed after it. Open the cited lines before you rely on a row, and treat a row that says "not verified" as a place where no reader or writer was found.

| File or folder | What it holds | Written by | Read by | Code |
|---|---|---|---|---|
| `map_ver.bin` | World version 251 and the map name | `GameWindow.save` on a full save | World load; a missing file marks a new game | `zombie/GameWindow.java:1016-1023`, `zombie/iso/IsoWorld.java:1840-1850`, `zombie/gameStates/GameLoadingState.java:249-252` |
| `map_t.bin` | Game time | `GameTime.save`, hot save, `IsoCell.save`; on a server `ServerChunkLoader` | `GameTime.load`; a server reads the world version from its header | `zombie/GameTime.java:1066-1075`, `zombie/GameTime.java:1217-1234`, `zombie/iso/IsoWorld.java:2485-2506`, `zombie/network/ServerChunkLoader.java:618-628` |
| `map_sand.bin` | The sandbox options of this save | `GameWindow.save`, `SandboxOptions` | `SandboxOptions.load` | `zombie/GameWindow.java:1026-1033`, `zombie/SandboxOptions.java:725-740`, `zombie/SandboxOptions.java:968-996` |
| `map.bin` | The output of `IsoCell.save` | `GameWindow.save` | No read of its contents was found. Its existence is tested: on a client connect the game checks each Multiplayer save folder for it and deletes old `map_N_N.bin` files there | `zombie/GameWindow.java:1053-1058`, `zombie/ZomboidFileSystem.java:1365-1385`, `zombie/network/ConnectionManager.java:204-206` |
| `map/<x>/<y>.bin` | One chunk of 8 by 8 squares | `IsoChunk.Save` and `SafeWrite`, through `ChunkSaveWorker` | `IsoChunk` load | `zombie/ChunkMapFilenames.java:56-59`, `zombie/iso/IsoChunk.java:4271-4335`, `zombie/iso/IsoChunk.java:3466-3470` |
| `blam/<x>/<y>.bin`, `<y>_error.txt` | A copy of a chunk that failed to load, and the error | `IsoChunk.BackupBlam` | Not verified: nothing in the game was found that reads it | `zombie/iso/IsoChunk.java:4619-4660` |
| `map_meta.bin` | Room and building meta data | `IsoMetaGrid.save` (not on a client), hot save | `IsoMetaGrid`, at world load | `zombie/iso/IsoMetaGrid.java:1664-1667`, `zombie/iso/IsoMetaGrid.java:1126` |
| `map_zone.bin` | Zones | `IsoMetaGrid.save`, hot save | `IsoWorld.init` | `zombie/iso/IsoMetaGrid.java:1665`, `zombie/iso/IsoWorld.java:2076` |
| `map_animals.bin` | Animal zones | `IsoMetaGrid.save`, hot save | `IsoWorld.init` | `zombie/iso/IsoMetaGrid.java:1666`, `zombie/iso/IsoWorld.java:2078` |
| `metagrid/metacell_<x>_<y>.bin` | Meta data of one cell | `IsoMetaGrid.save`, hot save | `IsoWorld.init` | `zombie/iso/IsoMetaGrid.java:1667`, `zombie/iso/IsoWorld.java:2077` |
| `map_basements.bin` | Basement data | `Basements` | `Basements` | `zombie/basements/Basements.java:162`, `zombie/basements/Basements.java:240` |
| `isoregiondata/datachunk_<x>_<y>.bin`, `RegionHeader.bin` | Region data for the iso regions | `IsoRegions` | `IsoRegions` | `zombie/iso/areas/isoregion/IsoRegions.java:102`, `zombie/iso/areas/isoregion/IsoRegions.java:154` |
| `apop/apop_<x>_<y>.bin` | One cell of animal population | `AnimalCell` | `AnimalCell` | `zombie/characters/animals/AnimalCell.java:58-61`, `zombie/characters/animals/AnimalCell.java:133-157` |
| `chunkdata/` | Not verified: written by native code that `MapCollisionData.save` calls | `MapCollisionData` (native) | Not verified | `zombie/savefile/SavefileNaming.java:20-26`, `zombie/MapCollisionData.java:75` |
| `zpop/` | Not verified: written by native code that the zombie population manager calls | `ZombiePopulationManager` (native) | Not verified | `zombie/savefile/SavefileNaming.java:20-26`, `zombie/popman/ZombiePopulationManager.java:128` |
| `players.db` | Characters: tables `localPlayers` and `networkPlayers` | `PlayerDB` (single player), `ServerPlayerDB` (server) | Same classes | `zombie/savefile/PlayerDBHelper.java:44-50`, `zombie/savefile/PlayerDB.java:261-282` |
| `vehicles.db` | Vehicles: table `vehicles` | `VehiclesDB2` | `VehiclesDB2` | `zombie/vehicles/VehiclesDB2.java:939-942`, `zombie/vehicles/VehiclesDB2.java:725-742` |
| `reanimated.bin` | Reanimated players | `ReanimatedPlayers.saveReanimatedPlayers` | `loadReanimatedPlayers` | `zombie/ReanimatedPlayers.java:137-158`, `zombie/ReanimatedPlayers.java:170-176` |
| `player_buildings.bin` | Player building room data | `PlayerRoomsFile.save` | `PlayerRoomsFile.load` | `zombie/buildingRooms/PlayerRoomsFile.java:36-42`, `zombie/buildingRooms/PlayerRoomsFile.java:104-109` |
| `z_outfits.bin` | Persistent zombie outfits | `PersistentOutfits.save` | `PersistentOutfits.load` | `zombie/PersistentOutfits.java:205-210`, `zombie/PersistentOutfits.java:235-239` |
| `global_mod_data.bin` | Global mod data tables | `GlobalModData.save` | `GlobalModData.load` | `zombie/world/moddata/GlobalModData.java:225-279`, `zombie/world/moddata/GlobalModData.java:281-300` |
| `WorldDictionary.bin` | Item, entity, sprite, object and string ids | `DictionaryData.save` | `DictionaryData.load` | `zombie/world/DictionaryData.java:527-560`, `zombie/world/DictionaryData.java:442-460` |
| `WorldDictionaryReadable.lua` | A text copy of the dictionary | `DictionaryData.saveAsText` | Not verified: written for people to read | `zombie/world/WorldDictionary.java:14`, `zombie/world/DictionaryData.java:609-625` |
| `WorldDictionaryLog.lua` | A log of dictionary changes | `WorldDictionaryLogger.saveLog` | Not verified | `zombie/world/WorldDictionary.java:15`, `zombie/world/WorldDictionary.java:313` |
| `mods.txt` | The mods the save was made with | Load end (unless a client); Lua `manipulateSavefile` | The Load Game list | `zombie/gameStates/GameLoadingState.java:463-468`, `zombie/Lua/LuaManager.java:7521-7523`, `zombie/Lua/LuaManager.java:8089-8094` |
| `erosion.ini` | Erosion settings | `ErosionMain` | `ErosionMain` | `zombie/erosion/ErosionMain.java:300-310` |
| `zombies.ini` | An old format of zombie sandbox options | Not verified: no writer found | Read once; the game deletes it and saves `map_sand.bin` | `zombie/SandboxOptions.java:742-770` |
| `entity_data.bin` | Entity data | `GameEntityManager.Save`, hot save | `GameEntityManager` load | `zombie/entity/GameEntityManager.java:377-400`, `zombie/entity/GameEntityManager.java:446-470` |
| `id_manager_data.bin` | Object ids | `ObjectIDManager.checkForSaveDataFile` (not on a client) | `IsoWorld.init` | `zombie/network/id/ObjectIDManager.java:77-90`, `zombie/iso/IsoWorld.java:1856-1862` |
| `important_area_data.bin` | Important areas | `ImportantAreaManager.saveDataFile` | `IsoWorld.init` | `zombie/core/ImportantAreaManager.java:54-70`, `zombie/iso/IsoWorld.java:1869-1880` |
| `map_symbols.bin` | World map symbols | `MapItem.SaveWorldMap`, hot save | `MapItem.LoadWorldMap` | `zombie/inventory/types/MapItem.java:53-66`, `zombie/inventory/types/MapItem.java:94-100` |
| `map_visited.bin` | Which parts of the map were visited | `WorldMapVisited`, hot save | `WorldMapVisited.load` | `zombie/worldMap/WorldMapVisited.java:464-470`, `zombie/worldMap/WorldMapVisited.java:559-564` |
| `servermap_symbols.bin` | The server's map symbols | `WorldMapServer.writeSavefile` | `readSavefile` | `zombie/worldMap/network/WorldMapServer.java:258-270`, `zombie/worldMap/network/WorldMapServer.java:292-297` |
| `gos_<name>.bin` | One global object system | `SGlobalObjectSystem.save` | `SGlobalObjectSystem.load` | `zombie/globalObjects/SGlobalObjectSystem.java:158`, `zombie/globalObjects/SGlobalObjectSystem.java:247-251` |
| `fishingData.bin` | Fish schools | `FishSchoolManager.save` | `FishSchoolManager.load` | `zombie/iso/FishSchoolManager.java:517-522`, `zombie/iso/FishSchoolManager.java:491-495` |
| `iTrack.bin` | Instance tracker | `InstanceTracker.save` | `InstanceTracker.load` | `zombie/iso/InstanceTracker.java:138-171`, `zombie/iso/InstanceTracker.java:184-190` |
| `metadata.bin` | Meta tracker | `MetaTracker.save` | `MetaTracker.load` | `zombie/iso/MetaTracker.java:25-34`, `zombie/iso/MetaTracker.java:45-50` |
| `statistics.bin` | Statistics | `StatisticsManager.save` | `StatisticsManager.load` | `zombie/statistics/StatisticsManager.java:94-111`, `zombie/statistics/StatisticsManager.java:65-72` |
| `map_worldgen.bin` | World generation parameters | `WorldGenParams.save` | `WorldGenParams.load` | `zombie/iso/worldgen/WorldGenParams.java:99-114`, `zombie/iso/worldgen/WorldGenParams.java:125-134` |
| `recorded_media.bin` | Recorded media | `RecordedMedia.save` | `RecordedMedia.load` | `zombie/radio/media/RecordedMedia.java:305-332`, `zombie/radio/media/RecordedMedia.java:253-268` |
| `radio/data/RADIO_SAVE.txt` | Radio state, in a text file | `ZomboidRadio.Save` (server and single player modes) | `ZomboidRadio` | `zombie/radio/ZomboidRadio.java:315-322`, `zombie/radio/ZomboidRadio.java:373` |
| `thumb.png` | The save's thumbnail | `SavefileThumbnail.create`, on the game thread | The Load Game screen; not verified in detail | `zombie/GameWindow.java:1045-1048`, `zombie/core/Core.java:825-830` |
| `WorldDictionary.tmp`, `global_mod_data.tmp` | A temporary copy written first, then copied over the real file | `DictionaryData.save`, `GlobalModData.save` | Not read | `zombie/world/DictionaryData.java:540-546`, `zombie/world/moddata/GlobalModData.java:265-272` |
| `WorldDictionary_<time>.bak` | A backup made before each dictionary check, deleted after it succeeds | `DictionaryData.backupCurrentDataSet` | Not read | `zombie/world/DictionaryData.java:370-382` |
| `WD_ERROR_<time>/` | Copies of the dictionary files, made when the dictionary check fails | `DictionaryData.createErrorBackups` | Not verified | `zombie/world/DictionaryData.java:394-440` |
| `map_p.bin`, `map_p1.bin` to `map_p99.bin` | The old single-player character files; they are read, put into `players.db`, and deleted | Not written by this version | `IsoCell.LoadPlayer`, `PlayerDB.uploadLocalPlayers2DB` | `zombie/iso/IsoCell.java:4280-4326`, `zombie/savefile/PlayerDB.java:198-240` |

The search also found four names that only the save-conversion code uses: `map_c.bin`, `map_mov.bin`, `map_cm.bin` and `pc.bin`. They appear only in the lists of names that the converter leaves alone or skips, so they are old formats :cite[(`zombie/iso/WorldConverter.java:142-148`, `zombie/iso/WorldConverter.java:181-187`)]. The dictionary's error folder also holds a copy named `WorldDictionary_backup.bin` :cite[(`zombie/world/DictionaryData.java:413`)].

Two limits of the world dictionary, that the ids in a save depend upon. A new item or entity type is refused once the next id reaches 32767, so the largest is 32766, and object names run from 0 to 126 :cite[(`zombie/world/DictionaryData.java:264`, `zombie/world/DictionaryData.java:355`)]. [The world dictionary page](/pz/build-42/engine/saves-and-persistence/the-world-dictionary-and-changing-mods) explains what they mean.

## Save events

Each save and load event has its own arguments and its own side that fires it, and this table gives them.

All 10 events are registered in `LuaEventManager`. The "Fired by" column is read from the Java trigger lines, and an event with no trigger on a side is said to have none there.

| Event | Arguments | Fired by | Code |
|---|---|---|---|
| `OnSave` | none | A connected client, in a branch that writes only the world map files and is taken when `GameClient.clientSave` is set; the single-player and host full save, before the chunk files and before global mod data, including the save made while a new or converted world loads. The server code does not fire it, but a mod that calls the Lua `save()` or `saveGame()` on a server could. | `zombie/GameWindow.java:1010-1014`, `zombie/GameWindow.java:1041`, `zombie/GameWindow.java:1074`, `zombie/network/ConnectionManager.java:204`, `zombie/gameStates/GameLoadingState.java:335-345`, `zombie/Lua/LuaManager.java:3711-3729` |
| `OnPostSave` | none | The quit path and the exit path (twice in a row), and the crash path only when the game is a client. Not fired after a sleep save or a Lua `save()` call, and not fired by a dedicated server. | `zombie/gameStates/IngameState.java:1388`, `zombie/gameStates/IngameState.java:1608-1614`, `zombie/GameWindow.java:793`, `zombie/GameWindow.java:801` |
| `OnLoad` | none | `IngameState`, right after `OnGameStart`. No trigger in the server's own code. | `zombie/gameStates/IngameState.java:775-776` |
| `OnGameTimeLoaded` | none | The single-player and host loading state, the dedicated server's start, and a client when it receives the connected packet. | `zombie/gameStates/GameLoadingState.java:322`, `zombie/network/GameServer.java:825`, `zombie/network/packets/connection/ConnectedPacket.java:93` |
| `OnInitGlobalModData` | `isNewGame` (true for a new world) | `GlobalModData.init`, called by `IsoWorld.init`, which runs for single player, a client, and a dedicated server. | `zombie/world/moddata/GlobalModData.java:58-62`, `zombie/iso/IsoWorld.java:2029`, `zombie/network/GameServer.java:806` |
| `OnReceiveGlobalModData` | `tag`, and the table or `false` | Whoever receives a global mod data packet: a server for a client's `transmit`, a client for a server's `transmit` or the answer to its `request`. | `zombie/network/packets/service/GlobalModDataPacket.java:52-66` |
| `OnIsoThumpableSave` | none found | Registered only. The capture has no Java trigger, no Lua trigger and no listener for it. | `zombie/Lua/LuaEventManager.java:704-705` |
| `OnIsoThumpableLoad` | none found | Registered only. The capture has no Java trigger, no Lua trigger and no listener for it. | `zombie/Lua/LuaEventManager.java:704-705` |
| `OnPreMapLoad` | none | `GameLoadingState`, before the map loads. No trigger in the server's own code. | `zombie/gameStates/GameLoadingState.java:241` |
| `OnPostMapLoad` | `cell`, `wx`, `wy` | `CellLoader`, after a cell is loaded. The side is not narrowed here. | `zombie/iso/CellLoader.java:458` |

The two thumpable events have no Java trigger, no Lua trigger and no listener in the capture's event index :cite[(`api/events.jsonl`)]. [How the world is saved](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved) explains the order of the events in a full save.

## Server options for saves and backups

These server settings decide when a full save or a backup happens, and the table gives their values and defaults.

The server reads them from its settings file. Back up that file before you edit it, then restart the server.

| Option | Values | Default | What it does | Code |
|---|---|---|---|---|
| `SaveWorldEveryMinutes` | whole number, 0 to 2147483647 | 0 | When above 0, the server queues a full save after that many minutes. 0 means no timer. | `zombie/network/ServerOptions.java:87-89`, `zombie/network/ServerMap.java:534-541` |
| `BackupsCount` | whole number, 1 to 300 | 5 | How many backup files to keep, for each kind of backup. | `zombie/network/ServerOptions.java:192`, `zombie/core/backup/ZipBackup.java:242-244` |
| `BackupsOnStart` | true or false | true | Make a backup when the server starts. | `zombie/network/ServerOptions.java:193`, `zombie/core/backup/ZipBackup.java:56-60` |
| `BackupsOnVersionChange` | true or false | true | Make a backup when the game version differs from the one in `last_server_version.txt`. | `zombie/network/ServerOptions.java:194`, `zombie/core/backup/ZipBackup.java:62-72` |
| `BackupsPeriod` | whole number, 0 to 1500 | 0 | Minutes between timed backups. 0 means none. | `zombie/network/ServerOptions.java:195`, `zombie/core/backup/ZipBackup.java:74-100` |
| `ResetID` | whole number, 0 to 2147483647 | a random number | Set to a new random number at server start when `z_outfits.bin` is missing from the save. A client whose stored value differs keeps only a few files of its local save. | `zombie/network/ServerOptions.java:72`, `zombie/network/GameServer.java:814-817`, `zombie/network/GameClient.java:1393-1432` |

## Mod data calls Lua can use

Lua can call 10 members of `ModData`, and the index marks no method of the other three classes as callable from Lua.

| Member | What it does | Code |
|---|---|---|
| `ModData.add(tag, table)` | Stores a table under a tag, replacing any table there. | `zombie/world/moddata/ModData.java:47-49`, `zombie/world/moddata/GlobalModData.java:115-117` |
| `ModData.create()` | Makes an empty table under a random UUID and returns the tag. | `zombie/world/moddata/ModData.java:35-37`, `zombie/world/moddata/GlobalModData.java:94-98` |
| `ModData.create(tag)` | Returns a new empty table, or nothing if the tag exists. | `zombie/world/moddata/ModData.java:39-41`, `zombie/world/moddata/GlobalModData.java:100-109` |
| `ModData.exists(tag)` | True if the tag is there. | `zombie/world/moddata/ModData.java:23-25`, `zombie/world/moddata/GlobalModData.java:77-79` |
| `ModData.get(tag)` | Returns the table or nothing. | `zombie/world/moddata/ModData.java:31-33`, `zombie/world/moddata/GlobalModData.java:90-92` |
| `ModData.getOrCreate(tag)` | Returns the table, making an empty one if there is none. | `zombie/world/moddata/ModData.java:27-29`, `zombie/world/moddata/GlobalModData.java:81-88` |
| `ModData.getTableNames()` | Returns one shared list of the tags. | `zombie/world/moddata/ModData.java:16-21`, `zombie/world/moddata/GlobalModData.java:69-75` |
| `ModData.remove(tag)` | Removes the table and returns it. | `zombie/world/moddata/ModData.java:43-45`, `zombie/world/moddata/GlobalModData.java:111-113` |
| `ModData.request(tag)` | On a client, asks the server for the table. Elsewhere it logs a line and does nothing. | `zombie/world/moddata/ModData.java:55-57`, `zombie/world/moddata/GlobalModData.java:160-176` |
| `ModData.transmit(tag)` | On a client, sends the table to the server. On a server, sends it to every connection. | `zombie/world/moddata/ModData.java:51-53`, `zombie/world/moddata/GlobalModData.java:119-158` |

The index of the capture marks every method of `GlobalModData` (17), `PlayerDB` (25) and `WorldDictionary` (44) as not callable from Lua, and marks `PlayerDB` and `WorldDictionary` as not exposed to Lua :cite[(`api/api.jsonl`, `api/classes.jsonl`)]. `ModData` forwards to `GlobalModData`, so a mod reaches the global tables through the `ModData` calls above. [Mod data that survives a save](/pz/build-42/engine/saves-and-persistence/mod-data-that-survives-a-save) explains how to use them.

:::callout[How we know]{kind=proof}
- The row, event, option and member counts on this page were made by scripts that read the table text and the capture's index files, and the numbers in the text come from those counts.
- The files table is the table from the inside-a-save-folder page. Its rows marked "not verified" were not verified there either, and its other rows were not re-opened line by line here.
- "Not callable from Lua" is the index's flag for each method. A mod can still reach a Java class through an object that Lua is given. That was not searched.
- Nothing on this page was run in a game.
:::
