---
id: build-42-inside-a-save-folder
slug: inside-a-save-folder
title: 'Inside a save folder'
game: pz
version: build-42
section: engine
category: saves-and-persistence
difficulty: advanced
tags:
  - engine
  - saves
  - persistence
  - multiplayer
  - modding
excerpt: >-
  Every file and folder the game writes into a Build 42.22 save: what writes it, what reads it, and what happens when one is missing, so you know what is safe to touch.
last_updated: '2026-11-15'
related_articles:
  - how-the-world-is-saved
  - players-and-vehicles-databases
  - the-world-dictionary-and-changing-mods
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#the-main-groups) | [server owners](#what-happens-when-a-file-is-missing) | the full list is in [every file and folder](#every-file-and-folder)

:::callout[The 1-minute version]{kind=key}
- A save is one folder. A single-player game uses `Saves/<game mode>/<save name>` in the game's cache folder, and a dedicated server uses `Saves/Multiplayer/<server name>`.
- The world itself is the `map` folder: one file per chunk of 8 by 8 squares, named by chunk coordinates.
- Players and vehicles are in two database files, `players.db` and `vehicles.db`.
- A chunk file that fails to load is copied into `blam` and the chunk is made again.
- A save that is not new and has no `WorldDictionary.bin` does not load.
- Back up the whole save folder before you delete or edit any file in it.
:::

:::facts
- **Where** `Saves/<game mode>/<save name>` in the cache folder; `Saves/Multiplayer/<server name>` for a server's backup copy
- **Folders made at load** `apop`, `chunkdata`, `map`, `zpop`, `metagrid` :cite[(`zombie/savefile/SavefileNaming.java:20-26`)]
- **Debug delete list** 15 choices on the Load Game screen, in debug mode only :cite[(`media/lua/client/OptionScreens/LoadGameScreen.lua:222-247`)]
- **Chunk size** 8 by 8 squares per file :cite[(`zombie/iso/IsoChunk.java:283-289`)]
:::

## Where a save lives

A save is a plain folder, and its name comes from the game mode and the save name.

The folder is the cache folder's `Saves` directory, then the game mode, then the save name :cite[(`zombie/ZomboidFileSystem.java:142-153`, `zombie/ZomboidFileSystem.java:179-183`)]. A server's save is under `Saves/Multiplayer/<server name>`, which is the folder its backups zip up :cite[(`zombie/core/backup/ZipBackup.java:171`)].

At load, the game creates the five subfolders `apop`, `chunkdata`, `map`, `zpop` and `metagrid` when saving is enabled :cite[(`zombie/savefile/SavefileNaming.java:20-26`, `zombie/gameStates/GameLoadingState.java:213-215`)]. Saving is off when the game is started with the `nosave` system property, and then the save methods return early :cite[(`zombie/GameWindow.java:526-530`, `zombie/GameWindow.java:1008`)].

Two files that belong to a save are kept elsewhere. `latestSave.ini` sits in the cache folder and records the last single-player save, and the game writes it only when it is not a client, not a server, not the tutorial and not Multiplayer mode :cite[(`zombie/gameStates/GameLoadingState.java:217-226`)].

## The main groups

The files fall into a few groups by what they hold, and each group is written by different code.

::::cards
:::card[The world]{accent=orange}
`map_ver.bin`, `map_t.bin`, `map_sand.bin`, `map.bin`, the `map` folder of chunks, and `blam` for chunks that failed to load. Read [how the world is saved](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved).
:::
:::card[Map data]{accent=blue}
`map_meta.bin`, `map_zone.bin`, `map_animals.bin`, `metagrid`, `map_basements.bin`, `isoregiondata`, plus the `apop`, `chunkdata` and `zpop` folders.
:::
:::card[People and vehicles]{accent=purple}
`players.db`, `vehicles.db`, `reanimated.bin`, `player_buildings.bin` and `z_outfits.bin`. Read [players and vehicles databases](/pz/build-42/engine/saves-and-persistence/players-and-vehicles-databases).
:::
:::card[Mods and the dictionary]{accent=cream}
`global_mod_data.bin`, `WorldDictionary.bin` with its two Lua text files, and `mods.txt`. Read [the world dictionary](/pz/build-42/engine/saves-and-persistence/the-world-dictionary-and-changing-mods).
:::
::::

Everything else is a small system that keeps its own file: entity data, object ids, map symbols, fishing, statistics, radio and the like. They are in the full table below.

## What happens when a file is missing

Some files are rebuilt when they are missing, and one stops the save from loading.

The cases below are the ones the loading code shows. Each is a statement about code, and none was run in a game.

- **`map_ver.bin`:** the game treats the save as a new game :cite[(`zombie/gameStates/GameLoadingState.java:248-253`)].
- **`WorldDictionary.bin`:** a save that is not new fails with "WorldDictionary data file is missing from world folder." :cite[(`zombie/world/DictionaryData.java:442-448`)]
- **`map_sand.bin`:** the sandbox options fall back to their defaults :cite[(`zombie/SandboxOptions.java:968-996`)].
- **A chunk file:** the game builds a new chunk with `LoadBrandNew`, the same call it uses for a chunk that has no file :cite[(`zombie/iso/IsoChunk.java:2321-2345`)].
- **`global_mod_data.bin`:** nothing is loaded, and no error is raised :cite[(`zombie/world/moddata/GlobalModData.java:281-300`)].
- **`players.db` and `vehicles.db`:** an empty database is created :cite[(`zombie/savefile/PlayerDBHelper.java:35-55`, `zombie/vehicles/VehiclesDB2.java:929-942`)].
- **`z_outfits.bin` on a server:** the server sets its `ResetID` option to a new random number at start :cite[(`zombie/network/GameServer.java:814-817`)].

Missing `players.db` or `vehicles.db` means the characters or vehicles stored in them are gone, because the empty replacement has no rows. For every other file the table says "not verified" where the loading code was not read.

The game has its own list of files it will delete from a save. The Load Game screen's configuration panel shows a "DELETE" button and a list of 15 choices, but only when the game runs in debug mode :cite[(`media/lua/client/OptionScreens/LoadGameScreen.lua:222-247`)]. The button calls the Lua function `manipulateSavefile(folder, action)`, which deletes the files that match the choice, and it rejects a folder name with a relative path :cite[(`zombie/Lua/LuaManager.java:7462-7530`)]. The 15 choices are `apop_x_y.bin`, `chunkdata_x_y.bin`, `entity_data.bin`, `map_x_y.bin`, `map_basements.bin`, `map_meta.bin`, `map_zone.bin`, `map_t.bin`, `players.db`, `player_buildings.bin`, `reanimated.bin`, `vehicles.db`, `z_outfits.bin`, `zpop_virtual.bin` and `zpop_x_y.bin`.

## Every file and folder

The table lists each file or folder with what writes it and what reads it, and every row's evidence is in the Code column.

"Hot save" means the background write of changed chunks and a few other files that [how the world is saved](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved) describes. On a client, most of these files are not written: the full save branch is skipped while `GameClient.clientSave` is set, which happens when the game connects to a server :cite[(`zombie/GameWindow.java:1010-1014`)].

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

## Two sides, one folder

A dedicated server writes some files that a single-player game does not, and the other way round.

On a server, `servermap_symbols.bin` is written by the server's world map code and `HiddenAuthors` is written at each full save :cite[(`zombie/network/ServerMap.java:380-437`)]. A single-player game writes the full branch of `GameWindow.save`, which includes `map_ver.bin`, `map_sand.bin` and the thumbnail :cite[(`zombie/GameWindow.java:1016-1080`)]. The server's own save order is in [how the world is saved](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved).

A connected client has its own local save folder, and when the server's `ResetID` no longer matches, the client deletes that copy and keeps only `map_symbols.bin`, `map_visited.bin` and `recorded_media.bin` :cite[(`zombie/network/GameClient.java:1393-1432`)].

:::callout[How we know]{kind=proof}
- Every file name was found by a search of the game code for `"map_`, `.bin"` and `.db"`, and then each writer and reader was read.
- Not verified: the contents of `chunkdata/` and `zpop/` (written by native code that is not in the capture), any reader of the contents of `map.bin`, any reader of `blam` and the two dictionary Lua files, and what each file's absence does where the table says so.
- "Not run in a game": every missing-file behavior above is read from code. Test it on a copy of a save, never the original.
- The `nosave` switch is a Java system property read at start.
:::
