---
id: build-42-players-and-vehicles-databases
slug: players-and-vehicles-databases
title: 'Players and vehicles databases'
game: pz
version: build-42
section: engine
category: saves-and-persistence
difficulty: advanced
tags:
  - engine
  - saves
  - players
  - vehicles
  - multiplayer
  - modding
excerpt: >-
  The two database files in a Build 42.22 save: the tables and columns of players.db and vehicles.db, what writes them and when, and how single player, a server and a client each handle a player record.
last_updated: '2026-11-15'
related_articles:
  - inside-a-save-folder
  - how-the-world-is-saved
  - the-world-dictionary-and-changing-mods
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#players-db) | [server owners](#how-a-server-saves-a-player) | the tables are in [vehicles.db](#vehicles-db)

:::callout[The 1-minute version]{kind=key}
- `players.db` holds characters in two tables: `localPlayers` for single player and `networkPlayers` for a server. `vehicles.db` holds vehicles in one table.
- Each row keeps a few readable columns (name, position, dead or not) and one `data` column with the whole character or vehicle as bytes.
- In single player the game writes the player every 10 seconds in the background, and the vehicle a player is driving with its engine running, and that vehicle's trailer, with it. A dedicated server writes each connected player every 180 seconds and when that player disconnects.
- A client has no player database file. It receives its character from the server when it connects.
- If a dedicated server cannot read a saved character, it deletes that character's row. Back up the save before you remove a mod.
- Not run in a game: every step below is read from code.
:::

:::facts
- **Player autosave, single player** every 10000 ms :cite[(`zombie/savefile/PlayerDB.java:50`, `zombie/savefile/PlayerDB.java:134-140`)]
- **Player autosave, server** every 180000 ms for each connection :cite[(`zombie/core/raknet/UdpConnection.java:95`)]
- **Player slots on a server** 0 to 3 :cite[(`zombie/savefile/ServerPlayerDB.java:228-232`)]
- **Largest record** 2097152 bytes (2 MiB) for a single-player character or a vehicle, and 1048576 bytes (1 MiB) for a character on a server :cite[(`zombie/savefile/PlayerDB.java:383-396`, `zombie/vehicles/VehiclesDB2.java:1108-1121`, `zombie/savefile/ServerPlayerDB.java:371-392`)]
- **Client wait for its character** up to 200 tries of 50 ms :cite[(`zombie/savefile/ClientPlayerDB.java:111-121`)]
:::

## Players db

`players.db` is a database file in the save folder, and its two tables are created when the file is missing.

The helper creates the file if it does not exist and then runs the table definitions :cite[(`zombie/savefile/PlayerDBHelper.java:35-55`)]. A later start adds a `splitUsername` column to `networkPlayers` if it is missing, and the server adds a `steamid` column in the same way :cite[(`zombie/savefile/PlayerDBHelper.java:73-82`, `zombie/savefile/ServerPlayerDB.java:74-82`)].

| Table | Columns | Used by |
|---|---|---|
| `localPlayers` | `id` (key), `name`, `wx`, `wy`, `x`, `y`, `z`, `worldversion`, `data` (bytes), `isDead` | `PlayerDB`, in single player |
| `networkPlayers` | `id` (key), `world`, `username`, `playerIndex`, `name`, `steamid`, `x`, `y`, `z`, `worldversion`, `data` (bytes), `isDead`, `splitUsername` | `ServerPlayerDB`, on a server |

The column list is the table definition, and `networkPlayers` also has an index on its username column :cite[(`zombie/savefile/PlayerDBHelper.java:44-50`)].

## What a player record holds

A record has a few readable columns and one `data` column that holds the whole character.

The readable columns for a single-player record are the id, the name (the forename and surname joined by a space), the position, the world version the record was written with, and whether the character is dead :cite[(`zombie/savefile/PlayerDB.java:370-382`)]. `wx` and `wy` are the position divided by 8 :cite[(`zombie/savefile/PlayerDB.java:566-575`)].

The `data` column is what `IsoPlayer.save` writes.

From the part of that method that this page read, it includes chat settings, the name tag, the vehicle position and seat if the player is in one, the items in use for mechanics, fitness, the books already read, and the craft history :cite[(`zombie/characters/IsoPlayer.java:1446-1500`)]. The books are stored as item ids from the [world dictionary](/pz/build-42/engine/saves-and-persistence/the-world-dictionary-and-changing-mods) :cite[(`zombie/characters/IsoPlayer.java:1500-1503`)]. The parent class writes the rest of the character. Not verified: which parts, because that method was not read here.

When the bytes do not fit in the working buffer, the single-player code grows the buffer 32768 bytes at a time up to 2097152 bytes (2 MiB), and above that it logs "the player ... cannot be saved" and gives up :cite[(`zombie/savefile/PlayerDB.java:383-396`)]. The server's copy of that loop stops at 1048576 bytes (1 MiB) and logs the error :cite[(`zombie/savefile/ServerPlayerDB.java:371-392`)].

## How single player saves a player

In single player a player is written in the background every 10 seconds and again on every full save, quit and exit.

`updateMain` runs the autosave when saving players is allowed and the 10-second timer has passed, and it also asks the vehicle database to save the driven vehicle, if its engine is running, and any trailer it tows :cite[(`zombie/savefile/PlayerDB.java:134-140`, `zombie/vehicles/VehiclesDB2.java:271-283`)]. The save is queued, and the world streamer thread writes it to the database :cite[(`zombie/savefile/PlayerDB.java:142-153`)]. A new player gets the lowest unused id, counting from 1, and id 1 is reserved at start :cite[(`zombie/savefile/PlayerDB.java:104-118`, `zombie/savefile/PlayerDB.java:76-82`)].

A full save calls `savePlayers` inside `IsoCell.save`, and the quit and exit paths call `saveLocalPlayersForce` first :cite[(`zombie/iso/IsoCell.java:4270-4277`, `zombie/gameStates/IngameState.java:1363-1380`, `zombie/GameWindow.java:769-786`)]. A hot save of the chunk queue also writes players when the queue becomes empty :cite[(`zombie/iso/ChunkSaveWorker.java:74-95`)].

Loading reads the row, calls `IsoPlayer.load` with the stored world version, and sets the health to zero if the row says the character is dead :cite[(`zombie/savefile/PlayerDB.java:243-262`)].

## How a server saves a player

A dedicated server writes each connected player into `networkPlayers`, keyed by name, save and slot.

The key is the username, the save name (`Core.gameSaveWorld`) and the slot number 0 to 3. On a coop server with Steam it is the Steam id instead of the username :cite[(`zombie/savefile/ServerPlayerDB.java:128-145`, `zombie/savefile/ServerPlayerDB.java:228-246`)]. A save is queued and then written by `process`, which `ServerPlayersVehicles` and the character-creation packet call :cite[(`zombie/savefile/ServerPlayerDB.java:90-100`, `zombie/network/ServerPlayersVehicles.java:56`, `zombie/network/packets/character/CreatePlayerPacket.java:309-310`)].

The server writes a player at these times: when the character is created, once per 180000 ms for each connection, when the player disconnects, during a full server save, and when a trade finishes :cite[(`zombie/network/packets/character/CreatePlayerPacket.java:309`, `zombie/network/NetworkPlayerManager.java:25-35`, `zombie/network/GameServer.java:3070`, `zombie/network/ServerMap.java:388`, `zombie/core/TradingManager.java:184-185`)]. The bytes come from the server's own player object, not from bytes sent by the client :cite[(`zombie/savefile/ServerPlayerDB.java:362-400`)].

On a failed load the server removes the character. When `IsoPlayer.load` throws, the server logs "The server cannot load player data.", deletes that row for the same key, and returns nothing :cite[(`zombie/savefile/ServerPlayerDB.java:255-277`)].

The next login for that key then has no stored character. This is a risk when a change to the mod list breaks character loading. Back up `players.db` before you change mods on a server, and restore it if characters are lost.

## What a client does

A client has no player database file and asks the server for its character when it connects.

`ClientPlayerDB` holds a profile that the server sends: the character bytes, the usernames, world versions, positions and dead flags :cite[(`zombie/savefile/ClientPlayerDB.java:229-250`)]. The client sends a profile request and waits up to 200 times 50 ms for the answer :cite[(`zombie/savefile/ClientPlayerDB.java:96-126`)]. It then builds each extra player from the stored bytes, and gives a player with no name the name "Player" followed by the slot number :cite[(`zombie/savefile/ClientPlayerDB.java:52-86`)].

## Old player formats

Older saves kept players in other places, and the game moves them into `players.db` on load.

If `map_p.bin` is missing, the game imports the players from the old `localPlayers` table in `vehicles.db` and loads player 1 :cite[(`zombie/iso/IsoCell.java:4280-4290`, `zombie/savefile/PlayerDB.java:198-218`)]. If `map_p.bin` exists, the game reads it, saves the player to the database and deletes the file, and then reads `map_p1.bin` up to `map_p99.bin` the same way :cite[(`zombie/iso/IsoCell.java:4325-4329`, `zombie/savefile/PlayerDB.java:220-240`)].

## Vehicles db

`vehicles.db` has one table, `vehicles`, and it stores each vehicle with its chunk so a chunk can ask for its vehicles.

| Column | Holds |
|---|---|
| `id` | The vehicle's database id (key) |
| `wx`, `wy` | The chunk the vehicle is in: its position divided by 8 |
| `x`, `y` | The position |
| `inMeta` | Whether the vehicle is kept as an unloaded "meta" vehicle; added later by an `ALTER` if missing |
| `worldversion` | The world version the row was written with |
| `data` | The vehicle as bytes |

Two indexes cover `wx` and `wy` :cite[(`zombie/vehicles/VehiclesDB2.java:939-942`, `zombie/vehicles/VehiclesDB2.java:980-982`)]. The row is filled from the vehicle at the time it is queued, and `inMeta` comes from `shouldUpdateInMeta` :cite[(`zombie/vehicles/VehiclesDB2.java:1083-1121`)]. When a chunk loads, the store selects the rows where `wx` and `wy` match that chunk :cite[(`zombie/vehicles/VehiclesDB2.java:725-742`)].

The main thread queues each add, update and remove, and the world streamer thread runs them against the database :cite[(`zombie/vehicles/VehiclesDB2.java:242-335`, `zombie/vehicles/VehiclesDB2.java:1182-1263`)].

## When vehicles are written

Vehicles are written when a chunk unloads, when the player autosave runs, and when a server saves its cells.

In single player, the chunk save writes the chunk's vehicles when the chunk is not a hot save, the game is not a server (or a soft reset), and the game is not a client :cite[(`zombie/iso/IsoChunk.java:4503-4505`, `zombie/vehicles/VehiclesDB2.java:1241-1260`)]. A vehicle that should be kept as a meta vehicle leaves the chunk, is written, and goes to the virtual vehicle manager :cite[(`zombie/iso/IsoChunk.java:3241-3245`)]. Each player autosave also writes the vehicle the player is driving, if its engine is running, and any trailer it tows :cite[(`zombie/vehicles/VehiclesDB2.java:271-283`)].

On a dedicated server, a cell that unloads writes its vehicles and then queues its chunks for saving, and a loop over loaded chunks writes the vehicles too :cite[(`zombie/network/ServerMap.java:1010-1020`, `zombie/network/ServerMap.java:1058-1066`)]. A full server save writes the vehicles of every loaded cell :cite[(`zombie/network/ServerMap.java:101-153`)]. The global Lua functions `addVehicle` and `addVehicleDebug` add the vehicle they spawn to this database :cite[(`zombie/Lua/LuaManager.java:10832`, `zombie/Lua/LuaManager.java:10883`)].

If `vehicles.db` is missing the game creates an empty one, so every stored vehicle is gone :cite[(`zombie/vehicles/VehiclesDB2.java:929-942`)]. Back up the save before you delete or edit either database.

:::callout[How we know]{kind=proof}
- Every table and column is the `CREATE TABLE` text in `PlayerDBHelper` and `VehiclesDB2`, and every timing is a constant in the cited line. None was run in a game.
- Not verified: the full list of fields inside the `data` column of a player or a vehicle. Only the part of `IsoPlayer.save` named above was read.
- `ServerPlayerDB.serverUpdateNetworkCharacter(ByteBuffer, UdpConnection)` is marked deprecated and no caller was found in the game's Java, so the server saves from its own player objects.
:::
