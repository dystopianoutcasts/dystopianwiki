---
id: build-42-moddata
slug: moddata
title: ModData
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
  How a Build 42.22 mod keeps data in object mod data and global mod data, which side saves it, and how it reaches other machines. Nothing syncs by itself.
last_updated: '2026-11-16'
related_articles:
  - mod-data-that-survives-a-save
  - the-events-system
  - multiplayer-command-patterns
  - key-globals-and-classes
  - lua-gameplay-mod
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write Lua for Build 42. The engine side, the save files and a complete example mod are on [Mod data that survives a save](/pz/build-42/engine/saves-and-persistence/mod-data-that-survives-a-save); this page is the short Lua view.

:::callout[The 1-minute version]{kind=key}
- Mod data is a plain Lua table that the game saves for you. Object mod data comes from `obj:getModData()`. Global mod data comes from `ModData.getOrCreate("MyModDataID")`.
- Store plain data: strings, numbers, booleans and nested tables. Which other types survive a save is not verified.
- Nothing syncs by itself. `ModData.transmit(tag)` sends a table: a client sends it to the server, a server sends it to every connection, and single player does nothing. The receiver gets the `OnReceiveGlobalModData` event and the game stores nothing for it.
- A multiplayer client does not save global mod data, so a client's tables start empty each session. Keep anything that must outlive a reconnect on the server.
- Get your global table inside `OnInitGlobalModData`, and get it again there on every world load.
- Any logged-in client can send a table to a server handler and ask for any tag, so a server handler checks everything it receives.
:::

:::facts
- **Global file** `global_mod_data.bin` in the save folder
- **`ModData` calls** 9 names: `getOrCreate`, `get`, `exists`, `create`, `remove`, `add`, `getTableNames`, `transmit`, `request`
- **Load event** `OnInitGlobalModData(isNewGame)`
- **Receive event** `OnReceiveGlobalModData(tag, table)`, or `(tag, false)` when the server has no such table
:::

## 1. Object mod data

**Any tile object, moving object or inventory item has a `getModData()` table that is saved with it.**

```lua
local player = getPlayer()
local modData = player:getModData()   -- a table you read and write
modData.myString = "Hello World"
modData.myNumber = 42
modData.myTable  = {1, 2, 3}
modData.myBoolean = true
```

`getModData()` makes an empty table the first time you ask. :cite[(`zombie/iso/IsoObject.java:1090-1096`, `zombie/inventory/InventoryItem.java:444-450`)] A tile object and an item write the table only when it is not empty, and read it back when they load. :cite[(`zombie/iso/IsoObject.java:1560-1563`, `zombie/inventory/InventoryItem.java:1707-1711`)] An inventory item is not an `IsoObject`; it has its own `getModData()`.

## 2. Global mod data

**Global mod data is one table per tag, kept by the game for the whole save.**

The code below is a part of a mod, not a whole one. A complete mod to put it in, with its `mod.info` (`name=` and `id=`), its folders and how to enable it, is the [Lua gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod); on a dedicated server list its id in `Mods=`, separated from others by `;`. Hit a zombie with a weapon and then print `ModData.getOrCreate("MyModDataID").lastUsedWeapon` to see the saved value.

```lua
local modData

Events.OnInitGlobalModData.Add(function(isNewGame)
    modData = ModData.getOrCreate("MyModDataID")   -- get the table here, every world load
    modData.counter = modData.counter or 0
end)

Events.OnWeaponHitCharacter.Add(function(attacker, target, weapon, damage)
    if modData then modData.lastUsedWeapon = weapon:getFullType() end
end)
```

`getOrCreate` returns the table for the tag, and makes an empty one when there is none. :cite[(`zombie/world/moddata/GlobalModData.java:81-88`)] The game clears every table and loads the file again each time a world loads, and then fires `OnInitGlobalModData`, so the reference you cached is the one to use only for that world. :cite[(`zombie/world/moddata/GlobalModData.java:58-67`)]

The table you hold stays in the game's map until `remove` or `add` replaces it, so you may keep the reference. :cite[(`zombie/world/moddata/GlobalModData.java:111-117`)] The other calls are described on [the engine page](/pz/build-42/engine/saves-and-persistence/mod-data-that-survives-a-save#the-moddata-calls).

## 3. Which side saves it

**Single player and a dedicated server write global mod data, and a multiplayer client does not.**

The full save writes `global_mod_data.bin`, after it has fired `OnSave`. :cite[(`zombie/world/moddata/GlobalModData.java:225-279`, `zombie/GameWindow.java:1041`, `zombie/GameWindow.java:1074`)] On a dedicated server the server's own save writes it, and that save fires neither `OnSave` nor `OnPostSave`, because `OnSave` is triggered only inside `GameWindow.save`. :cite[(`zombie/network/ServerMap.java:418`, `zombie/GameWindow.java:1014`, `zombie/GameWindow.java:1041`)]

A connected client saves through a shorter branch that does not write global mod data. :cite[(`zombie/GameWindow.java:1010-1014`, `zombie/network/ConnectionManager.java:204`)] So a client's global tables are lost when it leaves, and the server's copy is the one that persists.

Because `OnSave` fires before the file is written in single player, a change made inside `OnSave` is written in that save. The 42.21 page said the opposite (that it lands in the next session); the order in the code does not show that, and this was not run in a game.

## 4. Getting data to other machines

**Neither kind of mod data syncs by itself, and each has its own call to send it.**

`ModData.transmit(tag)` on a client sends the table to the server. On a server it sends the table to every connection. :cite[(`zombie/world/moddata/GlobalModData.java:119-158`)] In single player it does nothing, because neither branch runs. :cite[(`zombie/world/moddata/GlobalModData.java:122-134`)] `ModData.request(tag)` works on a client only, and the server answers the one connection that asked. :cite[(`zombie/world/moddata/GlobalModData.java:160-212`)]

The receiver gets the `OnReceiveGlobalModData` event, and the game does not store the table. A handler that wants to keep it calls `ModData.add(tag, table)` itself. :cite[(`zombie/network/packets/service/GlobalModDataPacket.java:52-66`)] Vanilla's own Lua has no listener for this event. :cite[(`api/events.jsonl`)]

```lua
-- sender (client or server)
ModData.transmit("MyModDataID")

-- receiver
Events.OnReceiveGlobalModData.Add(function(tag, table)
    if tag == "MyModDataID" and table then
        -- check every value in table, then ModData.add(tag, table) if you keep it
    end
end)
```

The whole table is sent each time, so `transmit` suits small tables. For a small change, send a command that carries only the change: [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns).

For object mod data, `obj:transmitModData()` sends a tile object's table: a client sends it to the server, and a server sends it to clients near the object. The call does nothing when the object is not on a square. :cite[(`zombie/iso/IsoObject.java:4894-4904`, `zombie/network/GameServer.java:2960-2963`)] For an inventory item, the server calls `syncItemModData(player, item)`, which sends it to clients near that player. :cite[(`zombie/Lua/LuaManager.java:12322-12330`)]

## 5. Warnings for mod authors and server owners

**A server handler for these events trusts nothing the sender wrote.**

- The `GlobalModData` packet needs only the login capability, so any logged-in client can fire a server's `OnReceiveGlobalModData` handlers with a tag and table it chose, and the handler is not told who sent it. :cite[(`zombie/network/packets/service/GlobalModDataPacket.java:23-29`, `zombie/network/packets/service/GlobalModDataPacket.java:52-66`)]
- Any logged-in client can ask for any tag, and the server answers if the table exists, so keep secrets out of global mod data. :cite[(`zombie/network/packets/service/GlobalModDataRequestPacket.java:18-40`, `zombie/world/moddata/GlobalModData.java:178-212`)]
- A client's object mod data packet is loaded into the server's object and relayed to nearby clients. Whether the server checks that the sender may change that object was not read here. :cite[(`zombie/network/packets/ObjectModDataPacket.java:31-32`, `zombie/network/packets/ObjectModDataPacket.java:68`, `zombie/network/packets/ObjectModDataPacket.java:101-102`)]

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java; no game was run. Corrected from the 42.21 page: a mod data table is not a property of every `IsoObject` (an item has its own); `transmit` on a server goes to all connections, not to one player; `OnReceiveGlobalModData` may get `false` instead of a table; and the `OnSave` trap is not shown by the code order. Not verified: which value types survive a save (the table save code is in the Kahlua library, which is not in the decompiled source), and whether the 42.21 page's remark that large tables were costly holds at 42.22.
:::
