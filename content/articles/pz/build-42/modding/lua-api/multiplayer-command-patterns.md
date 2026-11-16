---
id: build-42-multiplayer-command-patterns
slug: multiplayer-command-patterns
title: Multiplayer command patterns (client/server)
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
  How a Build 42.22 mod sends a request to the server and an answer back with sendClientCommand and sendServerCommand, what the server must check, and the admin and sync calls around them.
last_updated: '2026-11-16'
related_articles:
  - client-and-server-commands
  - who-owns-what
  - the-events-system
  - moddata
  - lua-load-order-and-the-three-lua-folders
  - lua-gameplay-mod
  - key-globals-and-classes
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write Lua for Build 42 and need the patterns in a page. The packet, the table rules, a full example mod and the server log are on [Client and server commands](/pz/build-42/engine/networking-and-packets/client-and-server-commands), and a complete small mod is [Lua gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod).

:::callout[The 1-minute version]{kind=key}
- A command is a module name, a command name and an optional table. A client sends it with `sendClientCommand(player, module, command, args)`, and the server's `OnClientCommand` event gets `module, command, player, args`.
- The server answers with `sendServerCommand(player, module, command, args)`, and the client's `OnServerCommand` event gets `module, command, args`. In single player `sendServerCommand` does nothing, so a mod that answers through it needs its own path there.
- A table keeps only string or number keys, and string, number, boolean, table, item, direction or dead-body values. Anything else, such as an `IsoPlayer`, is skipped. Send an id and look the object up on the other side.
- The server takes the sender from the connection, not from the table. Everything else in the table is whatever the client wrote, and any logged-in client can send any module and command, so the server handler checks each value.
- `isAdmin()` is a client call. A server checks `player:getRole():hasCapability(...)`.
- A server file also loads on a multiplayer client, so it starts with `if isClient() then return end`.
:::

:::facts
- **Send calls** 6: `sendClientCommand` (2 forms), `sendClientCommandV`, `sendServerCommand` (2 forms), `sendServerCommandV`
- **Receive events** 2: `OnClientCommand` and `OnServerCommand`
- **Packet** one `ClientCommand` packet in both directions, sent only by a logged-in player
- **Single player** `OnClientCommand` and `OnServerCommand` both fire, but `sendServerCommand` is a no-op
:::

## 1. The calls

**Each call works on a fixed side, and the player-first client form is the one to use.**

| Call | Works on | Code |
|---|---|---|
| `sendClientCommand(module, command, args)` | A client in game, and single player. On a dedicated server it throws. The server then picks the connection's first player. | :cite[(`zombie/Lua/LuaManager.java:8866-8877`, `zombie/network/GameServer.java:2310-2313`)] |
| `sendClientCommand(player, module, command, args)` | A client, when `player` is a local player. On a server it fires `OnClientCommand` at once with that player. | :cite[(`zombie/Lua/LuaManager.java:8882-8896`)] |
| `sendServerCommand(module, command, args)` | A dedicated server only. Sends to every connection. | :cite[(`zombie/Lua/LuaManager.java:8902-8906`, `zombie/network/GameServer.java:3539-3544`)] |
| `sendServerCommand(player, module, command, args)` | A dedicated server only. Sends to one player's connection. | :cite[(`zombie/Lua/LuaManager.java:8912-8916`, `zombie/network/GameServer.java:3580-3587`)] |
| `sendClientCommandV(...)`, `sendServerCommandV(...)` | The key-and-value forms of the client and the broadcast calls. | :cite[(`zombie/Lua/LuaManager.java:8922-8936`)] |

The 42.21 page said the client form takes three arguments and that "a player-first overload is not part of the documented client API". At 42.22 both forms exist. The player-first form sends the player's slot, so on a split-screen client the server knows which local player sent it, while the three-argument form sends no slot. :cite[(`zombie/network/GameClient.java:1719-1723`, `zombie/network/GameServer.java:2310-2313`)]

On a client or in single player, `sendServerCommand` returns at once, because each form checks that the game is a server. :cite[(`zombie/Lua/LuaManager.java:8902-8916`)]

## 2. A request and an answer

**The client sends a request, the server checks it and mutates state, and the server answers.**

```lua
-- client file (media/lua/client/MyMod/Client.lua)
local function onServerCommand(module, command, args)
    if module ~= "MyMod" then return end
    if command == "thingResult" then
        -- show args.ok to the player
    end
end
Events.OnServerCommand.Add(onServerCommand)

function MyMod_requestThing(player, id)
    sendClientCommand(player, "MyMod", "requestThing", { id = id })
end
```

```lua
-- server file (media/lua/server/MyMod/Server.lua)
if isClient() then return end     -- server/ also loads on a multiplayer client

local function onClientCommand(module, command, player, args)
    if module ~= "MyMod" or command ~= "requestThing" then return end
    if player:isDead() then return end
    if type(args) ~= "table" or type(args.id) ~= "number" then return end
    -- check the id, the distance, the inventory and the rate here, then change state
    if isServer() then
        sendServerCommand(player, "MyMod", "thingResult", { ok = true })
    end
end
Events.OnClientCommand.Add(onClientCommand)
```

The server handler gets the sender as `player`, found from the connection, and `args` is nil when the sender gave no table. :cite[(`zombie/network/GameServer.java:2293-2313`)] A mod that runs in single player too needs its own answer path there, because `sendServerCommand` does nothing outside a server. :cite[(`zombie/Lua/LuaManager.java:8902-8906`)]

The files go in `media/lua/client` and `media/lua/server`. The mod needs a `mod.info` with `name=` and `id=` and a `42/` or `common/` folder; the complete layout, how to turn it on, and the `Mods=` and `WorkshopItems=` lines (separated by `;`) are in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) and the [gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod). The result you should see is whatever your `thingResult` handler shows.

## 3. What a table may hold

**A command table carries plain data, and a Java object is skipped.**

A key must be a string or a number. A value must be a string, a number, a boolean, a table, an inventory item, a compass direction or a dead body. :cite[(`zombie/network/TableNetworkUtils.java:153-177`)] A pair of any other type is skipped, and the sender logs "can't save key,value" for a skipped pair at the top level. :cite[(`zombie/network/GameClient.java:1727-1733`)]

To name a player, send `player:getOnlineID()` and resolve it on the other side with `getPlayerByOnlineID(id)`. :cite[(`zombie/characters/IsoPlayer.java:6503`, `zombie/Lua/LuaManager.java:3963-3971`)] That call looks in the server's or the client's own id map, so it returns nothing in single player. :cite[(`zombie/Lua/LuaManager.java:3965-3970`)] On the server the sender is already the `player` argument, so a client rarely needs to send its own id. Whether an id stays the same across a reconnect was not checked here, so do not store one.

## 4. Admin and permission checks

**`isAdmin()` and `getAccessLevel()` run on a client, and a server asks the player's role what it may do.**

`isAdmin()` is true only on a client whose role is the default admin role, so it is false on a server. :cite[(`zombie/Lua/LuaManager.java:8979-8984`)] The global `getAccessLevel()` reads the client's own connection. :cite[(`zombie/Lua/LuaManager.java:4457-4462`)] On the server, vanilla checks a capability on the sender's role. :cite[(`media/lua/server/ClientCommands.lua:11`)] The older `player:getAccessLevel()` is marked deprecated. :cite[(`zombie/characters/IsoPlayer.java:7577-7579`)]

```lua
-- server: only a role that holds the capability may do this
if not player:getRole():hasCapability(Capability.AddItem) then return end
```

The 42.21 page's helper `isClient() and isAdmin() or isSinglePlayer()` calls a function that does not exist: there is no global `isSinglePlayer()`. Use `not isMultiplayer()` for single player. :cite[(`zombie/Lua/LuaManager.java:4439-4445`)]

## 5. Sync calls

**After a server-side change, a mod pushes the changed state with a sync call.**

`syncPlayerStats(player, syncParams)` sends a player's stats and does nothing unless it runs on a server for a player in the world. :cite[(`zombie/Lua/LuaManager.java:11894-11900`)] How to build the `syncParams` integer was not traced here. The 42.21 page's remark that the server handles most gameplay logic since 42.13.1 could not be checked and is dropped. Mod data syncs with its own calls: [ModData](/pz/build-42/modding/lua-api/moddata).

## 6. LuaNet, the vanilla wrapper

**Vanilla ships a small module wrapper in `LuaNet.lua` that uses the same two commands underneath.**

`LuaNet:getInstance():getModule(name)` gives a module with `addCommandHandler` and `sendPlayer`, and each call becomes a `sendClientCommand` or `sendServerCommand` with the module name. :cite[(`media/lua/shared/Util/LuaNet.lua:96-135`, `media/lua/shared/Util/LuaNet.lua:196-201`)]

> **Warning:** a package sent by a client can name a recipient, and the server then forwards it to that player's client. :cite[(`media/lua/shared/Util/LuaNet.lua:39-53`)] Treat anything that arrives this way as written by another player.

## 7. What the server must check

**The server handler is the only check on a command, so it checks types, range, rate and permission before it changes anything.**

The engine checks little: the sender needs the login capability, and the server drops a command whose sender has no player. :cite[(`zombie/network/PacketTypes.java:519`, `zombie/network/GameServer.java:2310-2321`)] Every listener of `OnClientCommand` sees every command from every logged-in client. :cite[(`zombie/network/GameServer.java:2318-2343`)]

A checked handler tests the module and command, then that `args` is a table with the right value types, that the player is alive, and a per-player rate, and takes the player from the connection and not from the table. [Lua gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod) shows each check with the vanilla line it copies.

> **Warning:** any logged-in client can send any module and command with any table, and a mod's handler is what decides what happens next. Server owners should install only mods whose server code they trust.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game was run.

Corrected from the 42.21 page: the three-argument-only claim for `sendClientCommand`, the `isSinglePlayer()` helper, the `IsoPlayer:getAccessLevel()` advice, and "args can hold plain data"; the table types are now listed from `TableNetworkUtils`.

Dropped as unverified: the 42.13.1 authority change, and that an `onlineID` is not persistent. A search of vanilla's Lua found no file besides `LuaNet.lua` that uses `LuaNet`. Not verified: how a hosted game routes these calls (see [Who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what)).
:::
