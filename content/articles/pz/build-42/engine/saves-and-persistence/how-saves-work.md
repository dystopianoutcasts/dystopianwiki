---
id: build-42-how-saves-work
slug: how-saves-work
title: 'How saves work'
game: pz
version: build-42
section: engine
category: saves-and-persistence
difficulty: beginner
tags:
  - engine
  - saves
  - backups
  - multiplayer
  - server
excerpt: >-
  Where your saves live, when the game saves, what a crash does, how to back up and move a save, and what removing a mod does, for single players and server owners.
last_updated: '2026-11-15'
related_articles:
  - inside-a-save-folder
  - how-the-world-is-saved
  - the-world-dictionary-and-changing-mods
  - players-and-vehicles-databases
  - mod-data-that-survives-a-save
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [players](#where-your-saves-are) | [server owners](#when-a-server-saves) | [modders](#for-modders)

:::callout[The 1-minute version]{kind=key}
- A single-player save is the folder `Saves/<game mode>/<save name>` in the game's cache folder. Open it from Load Game, MORE..., Open File Location :cite[(`zombie/ZomboidFileSystem.java:142-153`, `media/lua/client/OptionScreens/LoadGameScreen.lua:200-208`)].
- Back up the whole save folder before you delete, edit, move or share a save, and before you remove a mod or open the save in an older game version.
- In single player, the game saves the whole world when you quit, when all players fall asleep or wake up, once while a new or converted world loads, and when a mod or the game calls save. A grep of `zombie/` for the calls to `GameWindow.save(` found no timer among them.
- If the game crashes in single player, it saves a copy named after your save with `_crash` on the end (spaces in the name become underscores), and leaves your original folder as it was.
- A dedicated server has backups, kept in the cache folder in `backups`. By the settings' defaults, it makes one at start and one when the game version changes, and none on a timer. Treat the backup zip as private, because it holds the server settings folder.
- Single player has no backup feature in the code read here. The one exception is the copy the game makes before it converts a save from an older world version.
- Removing a mod can delete that mod's items from the save. By the code read, it happens in any chunk the game loads and saves again. Not run in a game.
:::

:::facts
- **Single-player player autosave** every 10000 ms (10 seconds) :cite[(`zombie/savefile/PlayerDB.java:50`, `zombie/savefile/PlayerDB.java:134-141`)]
- **`SaveWorldEveryMinutes`** default 0, from 0 up :cite[(`zombie/network/ServerOptions.java:87-88`)]
- **`BackupsCount`** default 5, from 1 to 300 :cite[(`zombie/network/ServerOptions.java:192`)]
- **`BackupsOnStart`**, **`BackupsOnVersionChange`** default true :cite[(`zombie/network/ServerOptions.java:193-194`)]
- **`BackupsPeriod`** default 0, in minutes, 0 to 1500 :cite[(`zombie/network/ServerOptions.java:195`)]
:::

## Where your saves are

Every save is one folder, inside the `Saves` folder of the game's cache folder.

A single-player save is in `Saves/<game mode>/<save name>`, and a dedicated server's save is in `Saves/Multiplayer/<server name>` :cite[(`zombie/ZomboidFileSystem.java:142-153`, `zombie/ZomboidFileSystem.java:179-183`, `zombie/core/backup/ZipBackup.java:171`)]. On Windows the cache folder is normally `C:\Users\<your name>\Zomboid`; that location is not checked in the code read here.

The easiest way to find a folder is the Load Game screen. Pick a save, press the button labeled MORE..., and press Open File Location, which shows the folder on your desktop :cite[(`media/lua/client/OptionScreens/LoadGameScreen.lua:200-208`, `media/lua/client/OptionScreens/LoadGameScreen.lua:410-414`)]. That button is drawn only when the system supports opening a folder.

The same panel has Choose Mods and a box to rename the save folder :cite[(`media/lua/client/OptionScreens/LoadGameScreen.lua:178-184`, `media/lua/client/OptionScreens/LoadGameScreen.lua:211-219`)]. For what is inside the folder, read [inside a save folder](/pz/build-42/engine/saves-and-persistence/inside-a-save-folder).

## When the game saves in single player

The whole world is saved at several moments, and a few smaller things are saved in the background in between.

The full save runs when you quit to the menu or exit, when a Lua `save` call runs, and on the crash path described below :cite[(`zombie/gameStates/IngameState.java:1363-1395`, `zombie/GameWindow.java:769-803`, `zombie/Lua/LuaManager.java:3711-3727`)]. It also runs once while a new world loads, or a world converted from an older version, before you start playing :cite[(`zombie/gameStates/GameLoadingState.java:335-345`)].

Sleep saves twice. The vanilla sleep dialog and the bed menu call `save(true)` when all players fall asleep, and the game saves again when the last sleeping player wakes up :cite[(`media/lua/client/ISUI/ISSleepDialog.lua:83`, `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:1109`, `zombie/ai/sadisticAIDirector/SleepingEvent.java:484-500`)]. The wake-up save is skipped on a connected client, so it applies to single player and to a host. A tutorial dialog also saves after it puts the player to sleep :cite[(`zombie/ui/ModalDialog.java:99-107`)].

No timer starts a full save in single player. A grep of all of `zombie/` for calls to `GameWindow.save(` found only the paths named here.

Between full saves, the game writes the player and the vehicle it drives every 10 seconds, and writes changed chunks in the background :cite[(`zombie/savefile/PlayerDB.java:134-141`, `zombie/iso/IsoChunkMap.java:243-253`)]. [How the world is saved](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved) lists what a full save adds. Files that only a full save writes keep the state of the last full save, so a power cut can lose changes in them. Not run in a game.

## What a crash does

When the game crashes in the update loop, single player saves into a copy, not into your save.

The game makes a new save named `<save name>_crash`, with spaces in the name changed to underscores :cite[(`zombie/gameStates/IngameState.java:538-540`, `zombie/gameStates/IngameState.java:1591-1618`)], copies your old folder into it, and then saves into the copy :cite[(`zombie/gameStates/IngameState.java:1591-1618`, `zombie/gameStates/IngameState.java:469-491`, `zombie/gameStates/IngameState.java:538-551`)]. If you find a `_crash` folder beside a save, it holds the state at the crash, and your original is unchanged. This does not apply on a dedicated server. Not run in a game.

## Back up a save before you touch it

Copy the whole folder while the game is closed, and keep the copy somewhere else.

1. Quit to the desktop, so the game has made its full save.
2. Open the folder as described above, go up one level, and copy the folder named after your save to a place outside `Zomboid`.
3. To go back, close the game, delete or rename the damaged folder, and copy your backup into the same place.

The folder holds more than the world: it holds the players, the vehicles and the list of mods. A partial copy can leave the pieces out of step.

The game itself keeps no single-player backup that you can restore. A grep of the source for backup code found only the server's backup class and the copy made when a save from an older world version is converted :cite[(`zombie/core/backup/ZipBackup.java:53-100`, `zombie/iso/WorldConverter.java:90-96`)]. That conversion copy is named `<save name>_backup`, with spaces changed to underscores, and the game makes it only when the saved world version is below the current one :cite[(`zombie/iso/WorldConverter.java:60-80`)].

The Load Game screen has a DELETE button. It asks "Are you sure you want to delete that save ?" and then removes the folder and everything in it, so a deleted save is not in a recycle bin :cite[(`media/lua/client/OptionScreens/LoadGameScreen.lua:708-717`, `media/lua/client/OptionScreens/LoadGameScreen.lua:753-758`, `zombie/Lua/LuaManager.java:4626-4643`)].

## Copy or move a save

A save folder can be copied to another computer, but it needs the same mods and a game that is not older than the one that wrote it.

Copy the whole folder into the same game mode folder under `Saves` on the other machine, with the game closed. The save's own list of mods is in `mods.txt` in the folder, and the Load Game screen shows it :cite[(`zombie/gameStates/GameLoadingState.java:463-468`, `media/lua/client/OptionScreens/LoadGameScreen.lua:60-75`)]. Install the same mods first. A save refers to its items by a number from its own dictionary, so missing mods lose items; see [the world dictionary](/pz/build-42/engine/saves-and-persistence/the-world-dictionary-and-changing-mods).

Do not open a save in an older game version than the one that wrote it. A chunk file written by a newer version fails to load with "unknown world version", and by the code read, a chunk that fails to load is copied into a `blam` folder in the save and made again from scratch :cite[(`zombie/iso/IsoChunk.java:3493-3495`, `zombie/iso/IsoChunk.java:2310-2345`)]. A dedicated server refuses to load a server save from a newer version and says so :cite[(`zombie/network/GameServer.java:4133-4137`)]. Not run in a game.

## When removing a mod loses items

Take a backup first, because a mod that is gone can take its items out of the save.

By the code read, the game keeps a list of every item type in the save, and a saved item whose type no loaded mod defines is skipped when its chunk loads. When that chunk is saved again, the item is gone. If you put the mod back before a chunk was loaded and saved without it, those items load again. [The world dictionary](/pz/build-42/engine/saves-and-persistence/the-world-dictionary-and-changing-mods) has the cases one by one. On a server, a character that cannot be read is deleted from the player database, so back up `players.db` too; see [players and vehicles databases](/pz/build-42/engine/saves-and-persistence/players-and-vehicles-databases).

The Choose Mods button on the Load Game screen warns that changing a save's mods "may break your game", and that adding or removing maps is not supported :cite[(`media/lua/shared/Translate/EN/UI.json:244`)].

## When a server saves

A dedicated server saves when you tell it to, when it quits, and on a timer only if you set one.

The server's full save runs from three places in all of `zombie/`: the `save` command, the `SaveWorldEveryMinutes` timer, and the quit :cite[(`zombie/commands/serverCommands/SaveCommand.java:20-37`, `zombie/network/ServerMap.java:534-541`, `zombie/network/ServerMap.java:339-343`)]. A grep of the whole source for the calls that queue it found only those. With `SaveWorldEveryMinutes` at its default of 0, there is no timer, so the full save runs on the command and at quit.

The `save` command needs the `SaveWorld` capability. It answers "World saved" at once, before the save has run, because it only queues the save :cite[(`zombie/commands/serverCommands/SaveCommand.java:20-37`)]. If a server save takes more than 600 ms, the server tells clients to pause, and tells them to resume when it ends :cite[(`zombie/network/ServerMap.java:372-378`)]. The server also writes each connected player every 180 seconds and when they disconnect :cite[(`zombie/network/GameServer.java:3070`, `zombie/network/NetworkPlayerManager.java:25-35`)]. [How the world is saved](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved) has the order of a server save.

The server code has no sleep save and no crash copy :cite[(`zombie/ai/sadisticAIDirector/SleepingEvent.java:488`)]. The quit save also runs from a shutdown hook, so a normal termination signal should save as well; a hard kill that skips the hook skips the save :cite[(`zombie/network/GameServer.java:310-322`)]. The `quit` command is the plain way to stop it.

A queued save waits while a backup is running :cite[(`zombie/network/ServerMap.java:543`)]. Not run in a game.

## Server backups

A dedicated server zips its save into the `backups` folder of its cache folder, at start, when the game version changes, and on a timer if you set one.

Four options control it, in the server settings file. `BackupsOnStart` and `BackupsOnVersionChange` default to true, and `BackupsPeriod` is the number of minutes between backups, with 0 meaning none :cite[(`zombie/network/ServerOptions.java:192-195`, `zombie/core/backup/ZipBackup.java:56-100`)]. `BackupsCount` is how many backup files to keep, and it applies to each kind separately :cite[(`zombie/core/backup/ZipBackup.java:242-244`, `zombie/core/backup/ZipBackup.java:326-362`)].

Each kind has its own folder, `backups/startup`, `backups/version` or `backups/period`, and the newest file is `backup_1.zip`. When a new one is made, the older ones are renamed up one number, and the one past the count is deleted :cite[(`zombie/core/backup/ZipBackup.java:242-244`, `zombie/core/backup/ZipBackup.java:326-362`)]. The version backup is made when the game version differs from the one recorded in `last_server_version.txt` in the `backups` folder :cite[(`zombie/core/backup/ZipBackup.java:61-71`)].

A backup holds the server's save folder, minus any folder named `blam`, together with the cache folder's `mods`, `Lua`, `db` and `Server` folders and a few settings files such as `options.ini` :cite[(`zombie/core/backup/ZipBackup.java:168-218`)].

It also holds a `readme.txt` that gives the backup time, the server version, and the world version in the backup :cite[(`zombie/core/backup/ZipBackup.java:378-422`)]. The files are stored without compression, so a backup is as big as the save :cite[(`zombie/core/backup/ZipBackup.java:55`)]. The zip holds the `Server` folder, which is where the server's settings files are, so keep backups private :cite[(`zombie/core/backup/ZipBackup.java:190-199`)]. Keep a copy of the newest zip on another disk, because the folder is on the same drive as the save.

## Restore a server backup

The game has no command to restore a backup, so you restore one by hand, with the server stopped.

A grep of `zombie/` for "restore" found only graphics and thumbnail code, so there is no restore code for backups. A manual restore, as read from how the zip is written and not run in a game, goes like this:

1. Stop the server with the `quit` command, and wait for it to exit.
2. Copy the current `Saves/Multiplayer/<server name>` folder somewhere safe. This is your way back if the backup is wrong.
3. Open the backup zip and take out its `Saves/Multiplayer/<server name>` folder. The zip is written from that path, so the entries should be named from it :cite[(`zombie/core/backup/ZipBackup.java:168-218`)].
4. Replace the folder in the cache folder with the one from the zip, and start the server.

Check the `readme.txt` in the zip first. If "World version in this backup" is above the world version the server's game uses, the server will refuse to load it :cite[(`zombie/core/backup/ZipBackup.java:378-422`, `zombie/network/GameServer.java:4133-4137`)].

## For modders

Mods can add their own data to a save, and they can run code when the game saves.

Global mod data is written with the full save, and `OnSave` runs before it in single player; [mod data that survives a save](/pz/build-42/engine/saves-and-persistence/mod-data-that-survives-a-save) has the details and a complete example. The folder tour is [inside a save folder](/pz/build-42/engine/saves-and-persistence/inside-a-save-folder).

:::callout[How we know]{kind=proof}
- Every claim above is read from the 42.22 capture, and none was run in a game. Each step marked "Not run in a game" is a reading of the code.
- The "no timer" claims for single player and server rest on greps of all of `zombie/` for the callers of the full-save methods, named in the text.
- That the Windows cache folder is `C:\Users\<your name>\Zomboid` is not checked in code.
- Whether the sleep save also covers a host with remote players was not checked beyond the `GameClient.client` test.
- That a newer chunk is replaced by a new chunk follows from the load code catching the error; the later write of the new chunk was not traced.
- Single-player backups outside the engine, such as Steam Cloud, were not looked at.
:::
