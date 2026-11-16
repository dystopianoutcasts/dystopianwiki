---
id: build-42-mod-data-that-survives-a-save
slug: mod-data-that-survives-a-save
title: 'Mod data that survives a save'
game: pz
version: build-42
section: engine
category: saves-and-persistence
difficulty: intermediate
tags:
  - engine
  - saves
  - moddata
  - lua
  - multiplayer
  - modding
excerpt: >-
  How a mod keeps its own numbers across a save and a restart: object mod data, global mod data, when each is written, how it reaches clients, and a complete example mod.
last_updated: '2026-11-15'
related_articles:
  - how-the-world-is-saved
  - inside-a-save-folder
  - players-and-vehicles-databases
  - the-world-dictionary-and-changing-mods
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#two-kinds-of-mod-data) | [server owners and mod authors, trust](#warnings-for-mod-authors-and-server-owners) | [a complete example](#a-complete-example-mod)

:::callout[The 1-minute version]{kind=key}
- Mod data lives in two places. Object mod data (`getModData()`) is saved with the object that carries it. Global mod data (`ModData`) is one table per tag, saved in `global_mod_data.bin` in the save folder.
- Global mod data is written only by a full save: in single player on the quit, sleep, Lua `save()`, crash and new-world or converted-world load paths, and on a dedicated server by its save and quit. The background "hot save" does not write it.
- `OnSave` fires before global mod data is written in single player, so a change made in `OnSave` is written in that same save. The game's own server code never fires `OnSave`, unless a mod calls `save()` or `saveGame()`. A connected client fires it without saving global mod data.
- `ModData.transmit` on a client sends the table to the server. On a server it sends the table to every connection. The receiver gets only the event `OnReceiveGlobalModData`, and the game stores nothing for it.
- Any logged-in client can send a table to the server's `OnReceiveGlobalModData` handlers and ask for any table by tag. Check the tag and the content in the handler, and keep secrets out of global mod data.
- Which value types survive is not verified here. Every step on this page is read from code and was not run in a game.
:::

:::facts
- **Global mod data file** `global_mod_data.bin` :cite[(`zombie/world/moddata/GlobalModData.java:225-279`)]
- **Written by** `GameWindow.save` in single player, `ServerMap.QueuedSaveAll` on a server :cite[(`zombie/GameWindow.java:1074`, `zombie/network/ServerMap.java:418`)]
- **Event order, single player** `OnSave`, then the global mod data write :cite[(`zombie/GameWindow.java:1041`, `zombie/GameWindow.java:1074`)]
- **Load event** `OnInitGlobalModData(isNewGame)` :cite[(`zombie/world/moddata/GlobalModData.java:58-62`)]
:::

## Two kinds of mod data

A mod can keep data on an object, or in a table of its own that belongs to no object.

Object mod data is the table you get from `getModData()` on a tile object, an item, a player, a zombie or a vehicle. It is saved inside the record of that object. Global mod data is the `ModData` class: a table found by a text tag, kept by the game for the whole save.

The first kind is for facts about one thing, such as a flag on one item. The second is for facts about the whole world, such as a counter or a list of places the mod has made. Pick by asking whose fact it is.

## How object mod data is saved

An object's mod data is written with the object, and only when the table is not empty.

A tile object writes its table in its own `save` method, and loads it back in `load` :cite[(`zombie/iso/IsoObject.java:1560-1563`, `zombie/iso/IsoObject.java:1340-1345`)]. Those objects are part of a chunk, so their mod data is in the chunk file; see [how the world is saved](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved).

An inventory item does the same :cite[(`zombie/inventory/InventoryItem.java:1707-1711`, `zombie/inventory/InventoryItem.java:2036-2042`)]. Moving objects (players, zombies and vehicles) write the table in the moving-object `save`, which the character and vehicle classes call through `super.save` :cite[(`zombie/iso/IsoMovingObject.java:707-722`, `zombie/characters/IsoGameCharacter.java:5366`, `zombie/vehicles/BaseVehicle.java:2641`)]. A player's record goes to `players.db` and a vehicle's to `vehicles.db`; see [players and vehicles databases](/pz/build-42/engine/saves-and-persistence/players-and-vehicles-databases).

An empty table is skipped: the item, the tile object and the moving object each write the table only when it is not null and not empty. So a table with no entries leaves no trace in the file.

## How global mod data is saved

Global mod data is one table per tag, and the whole set is written to one file in one step.

`GlobalModData` keeps the tables in a map from tag to table. `save` writes the world version, the number of tables, and then each table with its tag, first to `global_mod_data.tmp` and then copied over `global_mod_data.bin` :cite[(`zombie/world/moddata/GlobalModData.java:225-279`)]. Nothing is written when saving is turned off :cite[(`zombie/world/moddata/GlobalModData.java:226`)]. If the file is missing at load, nothing is loaded and no error is raised :cite[(`zombie/world/moddata/GlobalModData.java:281-300`)].

The save is called from two places in all of `zombie/`: the full save in `GameWindow` and the server's `QueuedSaveAll` :cite[(`zombie/GameWindow.java:1074`, `zombie/network/ServerMap.java:418`)]. A grep of the whole source for calls to `GlobalModData.instance.save` found only those two. The background hot save writes a different list of systems and does not include it :cite[(`zombie/iso/ChunkSaveWorker.java:74-95`)].

So in single player, global mod data reaches the disk when a full save runs: on quit, on a Lua `save()` call, when all players fall asleep or wake up, on the crash path that saves a copy, and once while a new or converted world loads :cite[(`zombie/gameStates/GameLoadingState.java:335-345`)]. [How the world is saved](/pz/build-42/engine/saves-and-persistence/how-the-world-is-saved) lists those paths. On a dedicated server it is written with each server save and at quit.

## When the data is loaded

The tables are read once at world start, and the event `OnInitGlobalModData` tells your mod that they are ready.

`GlobalModData.init` clears the map, loads the file, and then fires `OnInitGlobalModData` with one argument, `true` when the world is new :cite[(`zombie/world/moddata/GlobalModData.java:58-62`)]. `IsoWorld.init` calls it for single player and for a dedicated server alike :cite[(`zombie/iso/IsoWorld.java:2029`, `zombie/network/GameServer.java:806`)].

Get your table inside that event, as vanilla's foraging code does :cite[(`media/lua/client/Foraging/forageClient.lua:6-9`)]. Before it fires, the tables of a loaded save are not there yet, because `init` clears the map and loads the file just before the event :cite[(`zombie/world/moddata/GlobalModData.java:58-62`)]. A table fetched with `getOrCreate` is the object held in the map until it is removed or replaced with `add`, so a mod can keep the reference :cite[(`zombie/world/moddata/GlobalModData.java:81-117`)]. Whether the game replaces a table by itself later was not searched.

## The ModData calls

The Lua class `ModData` has ten members, and they all forward to `GlobalModData`.

:::chips
- ModData.getOrCreate(tag)
- ModData.get(tag)
- ModData.exists(tag)
- ModData.create(tag)
- ModData.create()
- ModData.remove(tag)
- ModData.add(tag, table)
- ModData.getTableNames()
- ModData.transmit(tag)
- ModData.request(tag)
:::

`getOrCreate` returns the table, making an empty one if there is none. `get` returns the table or nothing, and `exists` says whether the tag is there :cite[(`zombie/world/moddata/GlobalModData.java:77-92`)]. `create(tag)` returns nothing and writes a log line if the tag already exists, and `create()` with no tag makes a table under a random UUID and returns that tag :cite[(`zombie/world/moddata/GlobalModData.java:94-109`)].

`remove` takes the table out and returns it, and `add` stores a table under a tag, replacing any table already there :cite[(`zombie/world/moddata/GlobalModData.java:111-117`)]. `getTableNames` fills one list that is reused on every call, so copy the names if you keep them :cite[(`zombie/world/moddata/ModData.java:16-21`, `zombie/world/moddata/GlobalModData.java:69-75`)].

## Which value types survive

Plain strings, numbers, booleans and nested tables are the safe choice, and the list of other types that survive is not verified here.

The save and load code for an ordinary Lua table lives in the Kahlua library that the game ships as a jar, and that code is not in the decompiled source read for this page. The published [ModData page](/pz/build-42/modding/lua-api/moddata) also advises plain data only. A different table class, used for network messages, has its own list of types that it can write, but it is a different class and is not shown to be the one that holds mod data :cite[(`zombie/network/PZNetKahluaTableImpl.java:793-837`)].

Do not store a Java object, a function or a reference you expect to find again after a restart. Keep an id, a coordinate or a script name, and look the thing up again at load.

## OnSave and OnPostSave

In single player, a change made in `OnSave` is written in the same save, and the game's own server code never fires `OnSave`.

The full save fires `OnSave` first and writes global mod data later in the same method :cite[(`zombie/GameWindow.java:1041`, `zombie/GameWindow.java:1074`)]. A handler that changes a table in `OnSave` therefore has that change in `global_mod_data.bin` from that save. The published [ModData page](/pz/build-42/modding/lua-api/moddata) says such a change touches the next session instead; the order in the code does not show that, and this was not run in a game.

A connected client fires `OnSave` in a short branch, taken when the flag `GameClient.clientSave` is set, which happens on connect :cite[(`zombie/GameWindow.java:1010-1014`, `zombie/network/ConnectionManager.java:204`)].

That branch writes only the world map files, so a change made there is not saved as global mod data. The server code does not call `GameWindow.save`, so it does not fire `OnSave` itself, but the Lua calls `save()` and `saveGame()` call it, so a server mod that calls them could fire it; vanilla has no such call :cite[(`zombie/Lua/LuaManager.java:3711-3729`)]. Server tables are written live at the next server save :cite[(`zombie/network/ServerMap.java:380-437`)]. The `OnPostSave` event is not fired by the server code either :cite[(`zombie/gameStates/IngameState.java:1388`, `zombie/GameWindow.java:793`)].

## Sending mod data to other machines

Global mod data is not synced by itself; `transmit` and `request` are the two ways to move a table, and the receiver decides what to do with it.

`transmit` on a client builds a packet with the tag and the table and sends it to the server. On a server it sends the packet to every connection in the connection list :cite[(`zombie/world/moddata/GlobalModData.java:119-158`)]. The published [ModData page](/pz/build-42/modding/lua-api/moddata) says `transmit` goes "from client to server or server to client"; on a server the code is a broadcast, not a send to one player.

`request` works on a client only; on anything else it writes a log line and does nothing :cite[(`zombie/world/moddata/GlobalModData.java:160-176`)]. The server answers only the connection that asked, with the tag, a flag for whether the table exists, and the table :cite[(`zombie/world/moddata/GlobalModData.java:178-212`)].

On arrival, the packet fires `OnReceiveGlobalModData(tag, table)`, or `(tag, false)` when the server had no such table. The game does not put the table into the receiver's `ModData`; a handler that wants to keep it calls `ModData.add` itself :cite[(`zombie/network/packets/service/GlobalModDataPacket.java:52-66`)]. Vanilla's own Lua has no `OnReceiveGlobalModData` listener, so this path is only used by mods :cite[(`api/events.jsonl`)].

Sending the whole table every time is costly for a large table. For a small change, a client command carrying only the change is the lighter tool.

## Warnings for mod authors and server owners

A server trusts what logged-in clients send through this path, and a mod must not assume otherwise.

- **Any logged-in client can fire your server handler.** The packet needs only the login capability, so the server's parse fires `OnReceiveGlobalModData` with the tag and table the client chose :cite[(`zombie/network/packets/service/GlobalModDataPacket.java:23-29`, `zombie/network/packets/service/GlobalModDataPacket.java:52-66`)]. The handler gets the tag and the table and no sender, so it cannot tell who sent it :cite[(`zombie/network/packets/service/GlobalModDataPacket.java:52-66`)]. In a server handler, accept only the tags you expect, check every value in the table, and never store the table as it arrived.
- **Any logged-in client can ask for any tag.** The request packet has the same capability, and the server answers if a table of that name exists :cite[(`zombie/network/packets/service/GlobalModDataRequestPacket.java:18-40`, `zombie/world/moddata/GlobalModData.java:178-212`)]. Keep anything that only the server may know, such as a secret, a hidden location or a price, out of global mod data.
- **`transmit` on a server reaches everyone.** Every connection gets the table, so do not transmit a table that holds data meant for one player :cite[(`zombie/world/moddata/GlobalModData.java:119-150`)].
- **A client's saved global mod data is not shared.** A connected client does not save global mod data, so anything that must outlive a reconnect belongs on the server :cite[(`zombie/GameWindow.java:1010-1014`)].

Server owners cannot fix these from settings. If a mod on your server uses `OnReceiveGlobalModData`, read its handler first, and ask its author to check the tag and the values.

## A complete example mod

This mod counts how many times a world has been loaded, and how many full saves were made, and says both when you enter the game.

It uses all three layers on this page: a global table for the numbers, `OnSave` to count saves, and (in single player) the player's own mod data. On a dedicated server, the client asks the server for the table with `ModData.request`. Nothing here was run in a game.

**Step 1. Make the folders.** Put a folder named `SaveCounterDemo` in the `mods` folder inside the game's cache folder. On Windows the cache folder is normally `C:\Users\<your name>\Zomboid`, so the path is `C:\Users\<your name>\Zomboid\mods\SaveCounterDemo` (the game builds the path from its cache folder plus `mods` :cite[(`zombie/ZomboidFileSystem.java:548-555`)]). Inside it, make a folder `common` (leave it empty) and a folder `42`. The game lists a mod folder when `common` or the folder of the game version holds a `mod.info`, and it picks the version folder with the highest number that is not above the running game, which a folder named `42` satisfies for 42.22 :cite[(`zombie/ZomboidFileSystem.java:470-485`, `zombie/ZomboidFileSystem.java:496-498`)]. The published [layout page](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders) explains the layout.

**Step 2. Add `42/mod.info`.** The game reads `name=` and `id=` from `mod.info`, from the version folder first and from `common` if it is not there :cite[(`zombie/gameStates/ChooseGameInfo.java:187-214`, `zombie/gameStates/ChooseGameInfo.java:243-248`)]. Write these lines, with no empty lines needed and no comma at the end:

```
name=Save Counter Demo
id=SaveCounterDemo
description=Counts loads and saves with global mod data.
```

**Step 3. Add the server-side file** `42/media/lua/server/SaveCounterDemo_Server.lua`. It runs where the world is kept: single player, a host, and a dedicated server.

```lua
local TAG = "SaveCounterDemo"

local function onInit(isNewGame)
    if isClient() then return end
    local data = ModData.getOrCreate(TAG)
    data.sessions = (data.sessions or 0) + 1
    print("[SaveCounterDemo] sessions=" .. data.sessions
        .. " saves=" .. (data.saves or 0))
end
Events.OnInitGlobalModData.Add(onInit)

local function onSave()
    if isClient() then return end
    local data = ModData.getOrCreate(TAG)
    data.saves = (data.saves or 0) + 1
end
Events.OnSave.Add(onSave)
```

The `isClient()` check is there because the game loads the `server` folder on a connected client too, as far as the loading code shows :cite[(`zombie/gameStates/GameLoadingState.java:154-157`)]. On a dedicated server `OnSave` never fires, so `saves` stays at zero there, and only `sessions` counts.

**Step 4. Add the client-side file** `42/media/lua/client/SaveCounterDemo_Client.lua`. A dedicated server checks the files of this folder but does not run them :cite[(`zombie/Lua/LuaManager.java:1214`, `zombie/network/GameServer.java:1517-1519`)].

```lua
local TAG = "SaveCounterDemo"

local function show(data)
    local player = getPlayer()
    if not player or not data then return end
    local text = "Loads: " .. tostring(data.sessions)
        .. ", saves: " .. tostring(data.saves or 0)
    if not isClient() then
        local mine = player:getModData()
        mine.SaveCounterDemoVisits = (mine.SaveCounterDemoVisits or 0) + 1
        text = text .. ", character visits: " .. mine.SaveCounterDemoVisits
    end
    player:Say(text)
end

local function onReceive(tag, data)
    if tag ~= TAG then return end
    show(data)          -- data is false when the server has no such table
end
Events.OnReceiveGlobalModData.Add(onReceive)

local function onGameStart()
    if isClient() then
        ModData.request(TAG)
    else
        show(ModData.get(TAG))
    end
end
Events.OnGameStart.Add(onGameStart)
```

The character-visits counter is only kept in single player or on a host. In multiplayer the record that the server saves is made from the server's own player object, so a value set only on a client reaches `players.db` only if some code sends it there :cite[(`zombie/savefile/ServerPlayerDB.java:362-400`)]. That path was not read in full here.

**Step 5. Enable the mod and start.** In single player, open the Mods screen from the main menu and tick the mod named "Save Counter Demo" (the `name=` line of `mod.info`), then start a new save or load one. The Load Game screen also has a Choose Mods button under MORE... for an existing save :cite[(`media/lua/client/OptionScreens/LoadGameScreen.lua:178-184`)]. The Mods screen steps were not run in a game. Hosting a game from the main menu was not checked, so this page does not claim the example works there. The mods list for a save is written into `mods.txt` in the save folder :cite[(`zombie/gameStates/GameLoadingState.java:463-468`)].

**Step 6. Check the result.** A new world is saved once while it loads. The `OnSave` event of that save fires ahead of `OnGameStart` :cite[(`zombie/gameStates/GameLoadingState.java:335-345`, `zombie/gameStates/IngameState.java:775`)]. So on a brand new save, your character should say "Loads: 1, saves: 1, character visits: 1". Quit to the main menu from the pause screen, which makes a full save, and load the save again. It should now say "Loads: 2, saves: 2, character visits: 2". If the number of saves does not go up after a quit, the `OnSave` handler did not run. The `print` line is written to the game's console log; that file is normally called `console.txt` in the cache folder, which was not checked in the code read here. Not run in a game.

**Step 7. On a dedicated server.** Put the same `SaveCounterDemo` folder in the `mods` folder of the server's own cache folder, and add the mod id to the `Mods=` line of the server's settings file, which is `<cache folder>/Server/<server name>.ini` :cite[(`zombie/network/ServerOptions.java:491`)], with a semicolon between ids :cite[(`zombie/network/GameServer.java:667-676`)]. `WorkshopItems=` takes Steam Workshop item numbers, also with semicolons, and is read only when the server runs in Steam mode :cite[(`zombie/network/GameServer.java:693-702`)]. A mod you copied by hand has no Workshop number, so leave the `WorkshopItems=` line as it is. Keep that file private. If you publish the mod, add its Workshop number there too. Back up the settings file before you edit it, then restart the server.

Every player also needs the mod folder on their own computer, because the client file runs there. The game checksums the Lua files between the server and the client, and what it does on a mismatch was not read here :cite[(`zombie/iso/IsoWorld.java:1937-1956`, `zombie/network/NetChecksum.java:109`)]. 
Players connect, and the client file asks the server with `ModData.request` and says "Loads: N, saves: 0", because the server never fires `OnSave` on its own.

That a request sent at `OnGameStart` is safe on a client was not verified; if it says nothing, move the request to a later event and test it. The server count goes up each time the server starts :cite[(`zombie/world/moddata/GlobalModData.java:58-62`)]. The file `global_mod_data.bin` in the server's save folder holds the table once a server save has run :cite[(`zombie/network/ServerMap.java:418`, `zombie/world/moddata/GlobalModData.java:265-272`)]. Not run in a game.

:::callout[How we know]{kind=proof}
- Every claim above is read from the 42.22 capture, and none was run in a game, including the example mod.
- The grep for callers of `GlobalModData.instance.save` covered all of `src/zombie` and found only the full save in `GameWindow` and `QueuedSaveAll` in `ServerMap`.
- The types that survive are not verified, because the code that writes an ordinary Lua table is in a library jar that is not part of the decompiled source.
- The server's player record is made from the server's own player object; whether a client's player mod data reaches the server by another path was not searched.
- That `OnSave` changes land in the same save follows from the order of two calls in one method. Whether the data of a handler that raises an error is still saved was not checked.
:::
