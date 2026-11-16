---
id: build-42-client-and-server-commands
slug: client-and-server-commands
title: 'Client and server commands'
game: pz
version: build-42
section: engine
category: networking-and-packets
difficulty: intermediate
tags:
  - engine
  - multiplayer
  - networking
  - lua
  - modding
excerpt: >-
  How a Build 42.22 mod sends a request from a client to the server and an answer back: the four calls, the two events, what a table may hold, and a complete example mod with the server's checks.
last_updated: '2026-11-15'
related_articles:
  - the-packet-system
  - who-owns-what
  - timed-actions-and-items-over-the-network
  - networking-reference
  - multiplayer-command-patterns
  - what-runs-on-the-server-in-build-42-multiplayer
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#a-complete-mod-from-an-empty-folder) | [server owners](#what-the-server-must-check) | the packet behind every command is explained in [The packet system](/pz/build-42/engine/networking-and-packets/the-packet-system)

:::callout[The 1-minute version]{kind=key}
- A command is one Lua call that crosses the network as a single `ClientCommand` packet, named by a module and a command and carrying an optional table. The same packet type is used in both directions.
- A client calls `sendClientCommand`, and the server's `OnClientCommand` event fires with the module, the command, the sender's player and the table. A server calls `sendServerCommand`, and each receiving client's `OnServerCommand` event fires with the module, the command and the table.
- A table keeps only string or number keys, and only strings, numbers, booleans, nested tables, items, directions and dead bodies as values. Anything else is skipped.
- The server decides who the sender is from the connection, not from the table. Every other value in the table is whatever the client wrote, so the server handler has to check each one.
- In single player `sendServerCommand` does nothing, so a mod that answers through it needs its own path for single player.
- Nothing on this page was run in a game. Each step that rests on reading the code says "not run in a game".
:::

:::facts
- **Packet** `ClientCommand`, id 198, one entry used both ways
- **Settings** priority 1 (high), reliability 2 (reliable), channel 0
- **Capability to send** `LoginOnServer` (any logged-in player)
- **Table keys** string or number only
- **Vanilla handlers** 81 in `ClientCommands.lua`, 33 in `VehicleCommands.lua`
- **Default `ClientCommandFilter`** hides `vehicle` commands except four named ones
:::

## What a command is

A command is a Lua call that the engine turns into one network packet and, on arrival, into one Lua event.

The packet is the `ClientCommand` entry of the packet list, written inline with priority 1, reliability 2, the capability `LoginOnServer`, and one handler for each side. :cite[(`PacketTypes.java:519`)] Both `GameClient` and `GameServer` write the same packet type: the client writes its player slot, the module, the command and the table, and the server writes the module, the command and the table. :cite[(`GameClient.java:1719-1742`, `GameServer.java:3515-3537`)]

The module and the command are plain strings that you choose. The engine does not register them anywhere. Every listener of the event sees every command, so a handler starts by checking that the module is its own, and ignores everything else.

## The calls and the two events

The Lua calls that send commands come in six forms, and each form works on a fixed side.

| Call | Works on | What it does | Code |
|---|---|---|---|
| `sendClientCommand(module, command, args)` | A multiplayer client in game, and single player | Sends with no player, so the server picks the connection's first player. On a dedicated server it throws "can't call this function on the server" | :cite[(`Lua/LuaManager.java:8866-8877`)] |
| `sendClientCommand(player, module, command, args)` | A client, only when `player` is a local player | Sends with that player's slot. Called on a server, it fires `OnClientCommand` there at once, with the player you gave it | :cite[(`Lua/LuaManager.java:8882-8897`)] |
| `sendClientCommandV(player, module, command, key, value, ...)` | A client | Builds the table from key and value pairs. An odd number of values logs an error and sends nothing. It does nothing in single player, because it acts only when the game is a multiplayer client | :cite[(`Lua/LuaManager.java:8932-8936`, `GameClient.java:1744-1766`)] |
| `sendServerCommand(module, command, args)` | A server only | Sends to every connection | :cite[(`Lua/LuaManager.java:8902-8906`, `GameServer.java:3539-3544`)] |
| `sendServerCommand(player, module, command, args)` | A server only | Sends to the connection of that one player, or to nobody if the player has no connection | :cite[(`Lua/LuaManager.java:8912-8916`, `GameServer.java:3580-3587`)] |
| `sendServerCommandV(module, command, key, value, ...)` | A server only | The pair form of the broadcast. An odd number of values logs an error and sends nothing | :cite[(`Lua/LuaManager.java:8922-8926`, `GameServer.java:3555-3577`)] |

On a client or in single player, `sendServerCommand` returns without doing anything, because each version starts with a check that the code is running on a server. :cite[(`Lua/LuaManager.java:8902-8916`)]

Vanilla's own Lua has 74 calls to `sendClientCommand`. In the Lua files under `media/lua`, 72 of them pass a player first, and the two in `LuaNet` use the module-first form. :cite[(`media/lua/shared/Util/LuaNet.lua:123`, `media/lua/shared/Util/LuaNet.lua:126`, `media/lua/client/Context/Inventory/InvContextMedia.lua:36`)] The player-first form matters on a split-screen client, because a command without a player is attributed to the connection's first player. :cite[(`GameServer.java:2293-2321`)]

The two events are the receiving ends.

| Event | Fires on | Arguments | Code |
|---|---|---|---|
| `OnClientCommand` | The server, and single player | `module`, `command`, `player`, `args` | :cite[(`GameServer.java:2343`, `spnetwork/SinglePlayerServer.java:204`)] |
| `OnServerCommand` | A multiplayer client, and single player | `module`, `command`, `args` | :cite[(`GameClient.java:1000`, `spnetwork/SinglePlayerClient.java:149`)] |

`args` is nil when the sender gave no table or an empty one, so a handler checks for that before it reads a field. :cite[(`GameClient.java:1722`, `GameServer.java:2293-2310`)]

## What a table may hold

A command's table is written by `TableNetworkUtils`, which keeps string and number keys and a short list of value types.

A key must be a string or a number. A value must be a string, a number, a boolean, a table, an inventory item, a compass direction (`IsoDirections`) or a dead body. :cite[(`TableNetworkUtils.java:153-177`)] A pair whose key or value is another type is skipped, and the sender logs "can't save key,value" for a skipped pair at the top level of the table. :cite[(`GameClient.java:1727-1733`, `TableNetworkUtils.java:37-52`)] Inside a nested table the same skipping happens without a log line. :cite[(`TableNetworkUtils.java:37-62`)]

Lua numbers arrive as numbers, and the receiver builds a fresh table from the bytes, so the two sides never share a table. :cite[(`TableNetworkUtils.java:108-151`)] A Java object such as an `IsoPlayer` or a container is not in the list. To name a player, send its online id and resolve it on the other side with `getPlayerByOnlineID`. :cite[(`Lua/LuaManager.java:3966-3972`)]

Single player uses the same writer and reader, so a value that a server would drop is dropped there too. :cite[(`spnetwork/SinglePlayerClient.java:107-128`, `spnetwork/SinglePlayerServer.java:179-205`)] Timed actions use a richer table, which is covered in [Timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network).

## Who receives a server command

A broadcast goes to every connection the server has, and a one-player send goes to one connection.

The broadcast loops over all connections and does not check that a connection has finished joining. :cite[(`GameServer.java:3539-3544`)] A client that is still loading cannot handle a `ClientCommand` at once, so the engine parks the packet and handles it after the client has sent its player connect. :cite[(`PacketTypes.java:519`, `GameClient.java:370-377`, `GameClient.java:384-392`)]

The Java side has `sendServerCommandToRelevant`, which sends only to connections near a point, but no Lua function calls it. :cite[(`GameServer.java:3546-3553`)] To reach only nearby players from Lua, loop over `getOnlinePlayers()` and send one command to each player you choose. :cite[(`Lua/LuaManager.java:4483-4491`)]

## Where the files go

A mod sits in a folder with a `mod.info`, and its Lua goes in `shared`, `client` or `server` under `media/lua`.

The game looks for mods in three places, in this order: the staged Workshop folders, the installed Workshop items, and the `mods` folder inside the game's cache folder (`Zomboid` in the user's home folder by default). :cite[(`ZomboidFileSystem.java:448-464`, `ZomboidFileSystem.java:530-556`, `ZomboidFileSystem.java:204-215`)] A folder counts as a mod when it holds `common/mod.info`, or a `mod.info` in the version folder. The version folder is the highest-numbered folder whose number is not above the game's version and is at least 42, so a folder named `42` is picked in 42.22. :cite[(`ZomboidFileSystem.java:466-482`, `ZomboidFileSystem.java:486-500`, `gameStates/ChooseGameInfo.java:45`)]

The three Lua folders load at different times.

- **`shared` and `client`** load when the game starts. :cite[(`Lua/LuaManager.java:1253-1257`)]
- **`server`** loads when a world is loading, on a multiplayer client and in single player as well as on a dedicated server, and the call does not test which side runs it. :cite[(`gameStates/GameLoadingState.java:156`, `network/GameServer.java:1517-1519`)]
- **A dedicated server** reads `client` only to add its files to the checksum, and does not run them. :cite[(`network/GameServer.java:1518`, `Lua/LuaManager.java:1143-1226`)]
- **Order inside a folder:** the game's own files first, then each enabled mod in the order of the mod list, with each mod's files sorted by path without regard to case. :cite[(`Lua/LuaManager.java:1156-1198`)]

So a file in `server` makes itself server-only with a first line that returns on a client. Vanilla does it with `if isClient() then return end` in `ClientCommands.lua`, and its client handlers do the reverse with `if not isClient() then return end`. :cite[(`media/lua/server/ClientCommands.lua:1`, `media/lua/client/ServerCommands.lua:1`)] Do not use `isServer()` for that line, because `isServer()` is false in single player. :cite[(`Lua/LuaManager.java:4419-4421`)]

## A complete mod from an empty folder

This mod adds two right-click options that roll a die on the server and shows the answer to the player who asked.

It is a teaching example. Every step below is **not run in a game**; the Lua is written from vanilla's own patterns and the calls above.

**Step 1. Make the folder and `mod.info`.** In the game's cache folder (`Zomboid` in the user's home folder by default), make `mods/DiceRoll/42/` and put a `mod.info` in it. :cite[(`ZomboidFileSystem.java:204-215`, `ZomboidFileSystem.java:548-552`)]

```
name=Dice Roll
id=DiceRoll
description=Rolls a die on the server and shows the result.
```

The `id=` line is the mod id. It is the word you later put in the server's `Mods=` line. :cite[(`gameStates/ChooseGameInfo.java:243-247`)]

**Step 2. The shared file.** Make `mods/DiceRoll/42/media/lua/shared/DiceRollShared.lua`. It holds the names and limits that both sides must agree on, so the client menu and the server check cannot drift apart.

```lua
DiceRoll = DiceRoll or {}
DiceRoll.MODULE = "DiceRoll"
DiceRoll.ALLOWED = { [4] = true, [6] = true, [8] = true, [10] = true, [12] = true, [20] = true }
DiceRoll.MIN_GAP_MS = 1000
```

**Step 3. The server file.** Make `mods/DiceRoll/42/media/lua/server/DiceRollServer.lua`. It checks every value the client sent, logs each refusal with its reason, and answers either way.

```lua
if isClient() then return end

local lastRoll = {}  -- username -> time of the last accepted roll, in milliseconds

-- On a server the answer travels as a command. In single player
-- sendServerCommand does nothing, so the client function is called directly.
local function reply(player, args)
    if isServer() then
        sendServerCommand(player, DiceRoll.MODULE, "result", args)
    elseif DiceRoll.onResult then
        DiceRoll.onResult(args)
    end
end

local function refuse(player, reason, sides)
    print("[DiceRoll] refused " .. tostring(player:getUsername())
        .. " sides=" .. tostring(sides) .. ": " .. reason)
    reply(player, { ok = false, reason = reason })
end

local function onClientCommand(module, command, player, args)
    if module ~= DiceRoll.MODULE or command ~= "roll" then return end

    if type(args) ~= "table" then return refuse(player, "no arguments", nil) end
    local sides = args.sides
    if type(sides) ~= "number" or not DiceRoll.ALLOWED[sides] then
        return refuse(player, "that die is not allowed", sides)
    end

    local name = player:getUsername()
    local now = getTimestampMs()
    if lastRoll[name] and now - lastRoll[name] < DiceRoll.MIN_GAP_MS then
        return refuse(player, "rolling too fast", sides)
    end
    lastRoll[name] = now

    local result = ZombRand(sides) + 1
    print("[DiceRoll] " .. tostring(name) .. " rolled d" .. tostring(sides) .. " = " .. tostring(result))
    reply(player, { ok = true, sides = sides, result = result })
end

Events.OnClientCommand.Add(onClientCommand)
```

The server handler uses only things the engine supplied itself or that it checked. The `player` is the sender's own player object, found from the connection. :cite[(`GameServer.java:2312-2321`)] `type(args)` guards the nil case, and `sides` is tested against the shared list before use. `ZombRand(sides)` returns a whole number from 0 up to `sides - 1`, so adding 1 gives 1 to `sides`. :cite[(`Lua/LuaManager.java:7010-7018`, `core/random/RandAbstract.java:22-31`)] The time comes from `getTimestampMs`. :cite[(`Lua/LuaManager.java:9241-9243`)]

**Step 4. The client file.** Make `mods/DiceRoll/42/media/lua/client/DiceRollClient.lua`. It adds the menu entries, sends the request, and shows the answer.

```lua
function DiceRoll.requestRoll(player, sides)
    sendClientCommand(player, DiceRoll.MODULE, "roll", { sides = sides })
end

function DiceRoll.onResult(args)
    local player = getPlayer()
    if not player or type(args) ~= "table" then return end
    if args.ok then
        player:Say("d" .. tostring(args.sides) .. ": " .. tostring(args.result))
    else
        player:Say("The server refused the roll: " .. tostring(args.reason))
    end
end

local function onServerCommand(module, command, args)
    if module == DiceRoll.MODULE and command == "result" then
        DiceRoll.onResult(args)
    end
end
Events.OnServerCommand.Add(onServerCommand)

local function onFillMenu(playerNum, context, worldObjects, test)
    if test then return ISWorldObjectContextMenu.setTest() end
    local player = getSpecificPlayer(playerNum)
    context:addOption("Roll a 6-sided die", player, DiceRoll.requestRoll, 6)
    context:addOption("Roll a 20-sided die", player, DiceRoll.requestRoll, 20)
    context:addOption("Roll a 100-sided die (the server refuses this)", player, DiceRoll.requestRoll, 100)
end
Events.OnFillWorldObjectContextMenu.Add(onFillMenu)
```

The event gives the player's index, the menu, the clicked objects and a `test` flag. A handler that adds options returns early when `test` is true, after calling `setTest`, a helper that controller users need. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:122-128`, `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:213-216`)] The menu call passes the extra argument on to the function after the target, which is the pattern vanilla's own admin menu uses. :cite[(`media/lua/client/DebugUIs/AdminContextMenu.lua:20-47`)] `player:Say` shows a speech bubble for the local player. What other players see of it is not verified.

**Step 5. Enable the mod and test it.**

1. **Single player.** Start the game, open the Mods screen, tick `Dice Roll` and start or load a world. Right-click the ground. The three "Roll" entries appear, and the first two show a result over the player's head. The third shows "The server refused the roll: that die is not allowed". Single player runs the same handler through the single-player path, and the answer reaches the screen only because the example calls `DiceRoll.onResult` itself. Not run in a game.
2. **Dedicated server.** Copy the whole `DiceRoll` folder into the server's own `Zomboid/mods/` folder, and put the mod id in the server's `Mods=` line in `Zomboid/Server/<servername>.ini`. The line is a list of ids separated by semicolons, for example `Mods=DiceRoll`. :cite[(`GameServer.java:667-676`, `ServerOptions.java:73`, `ServerOptions.java:264-269`)] The file is created with default values the first time a server with that name starts, so start the server once, stop it, then edit the file. :cite[(`ServerOptions.java:262-282`)] For a Workshop item the item's number also goes in `WorkshopItems=`, again separated by semicolons. :cite[(`GameServer.java:693-703`, `ServerOptions.java:134`)] Not run in a game.
3. **Each player.** Every client needs the same folder in its own `Zomboid/mods/` folder, because the client loads the mod list the server sends and refuses to join if a mod is missing. :cite[(`ZomboidFileSystem.java:757-764`, `gameStates/ConnectToServerState.java:380-412`)] The Lua checksum is on by default, so the client's files must also match the server's. :cite[(`ServerOptions.java:75`)] The page [Connecting and logging in](/pz/build-42/engine/networking-and-packets/connecting-and-logging-in) lists the refusal messages. Not run in a game.
4. **Read the server log.** Each roll prints a `[DiceRoll]` line on the server, and each refusal prints one with its reason. The engine also writes the command itself to the `cmd` log, which is one of the files in the `Logs` folder of the cache folder. :cite[(`GameServer.java:2323-2336`, `core/logger/LoggerManager.java:73-96`)] Expected result: a player who right-clicks and picks a roll gets a speech bubble such as `d6: 4`, or the refusal text for the 100-sided die, and the server log shows `[DiceRoll] <name> rolled d6 = 4` or `[DiceRoll] refused <name> sides=100: that die is not allowed`. Where `print` output lands on a server is not verified, and none of this was run in a game.

## What the server must check

The server handler is the only check on a command, so it checks the type, the range and the rate of every value, and answers when it refuses.

The engine checks little before your handler runs.

It needs the sender to hold the capability `LoginOnServer`, which every logged-in player does. :cite[(`PacketTypes.java:519`)] It finds the player from the sender's own connection and drops the command, with a log line, if there is none. :cite[(`GameServer.java:2312-2317`)] It drops a command whose table cannot be read. :cite[(`GameServer.java:2299-2306`)] And it has one built-in rule: a `vehicle.remove` command reaches the event only in debug mode, for a role with `GeneralCheats`, or when the player's `isDismantleAllowed` is true. :cite[(`GameServer.java:2338-2344`)]

Everything else is the handler's job. Vanilla's handlers show both styles. In `ClientCommands.lua`, 47 of the 81 handlers contain a capability or admin test, and the others rely on checks of their own or of the objects they touch. :cite[(`media/lua/server/ClientCommands.lua:10-17`, `media/lua/server/ClientCommands.lua:1346-1357`)] The example mod's checks, in the order the handler runs them:

1. The module and command are the mod's own.
2. `args` is a table.
3. `sides` is a number and is on the shared allowed list.
4. The same player has not rolled in the last second.
5. The result is computed on the server, never read from the client.

A refusal that only returns leaves the player with no answer, because a refused command produces no reply on its own. :cite[(`PacketTypes.java:766-770`)] The example prints the reason and sends it back, so the player sees why.

> **Warning:** Any logged-in client can send any module and command, and a mod's handler is the only thing that decides what happens next. Server owners should install only mods whose server code they trust, and should look at the `cmd` log when a mod's behavior seems wrong.

## What the server logs by default

The server writes each command to the `cmd` log unless the `ClientCommandFilter` option leaves it out.

The line holds the connection, the player's name, `module.command` and the player's position. :cite[(`GameServer.java:2323-2336`)] The option is a list of rules separated by semicolons, each `+module.command` to log it or `-module.command` to hide it, where `command` can be `*` for all of a module. :cite[(`GameServer.java:2271-2290`, `GameServer.java:4394-4410`)] The default hides all `vehicle` commands except `damageWindow`, `fixPart`, `installPart` and `uninstallPart`, so a command from your own module is logged unless you add a `-` rule for it. :cite[(`ServerOptions.java:165-167`)]

The filter only decides what is written to the log. The event fires either way. :cite[(`GameServer.java:2323-2344`)]

## Single player and hosted games

Single player has no server connection, so a server's answer has to be delivered by your own code, and a hosted game behaves like a dedicated server.

In single player, `sendClientCommand` runs through `SinglePlayerClient` and the handler receives it through `SinglePlayerServer`. :cite[(`spnetwork/SinglePlayerClient.java:107-128`, `spnetwork/SinglePlayerServer.java:179-205`)] Nothing in `SinglePlayerServer` sends a `ClientCommand` back, and `sendServerCommand` is skipped outside a server, so the example's `reply` calls the client function itself. :cite[(`Lua/LuaManager.java:8902-8906`)] A mod that wants single player and multiplayer to look the same needs that branch.

A hosted game starts a separate server process and joins it as a client, so its commands travel the same way as on a dedicated server. :cite[(`CoopMaster.java:72-129`, `GameClient.java:265-272`)] Both `isClient()` and `isServer()` are false only in single player. :cite[(`Lua/LuaManager.java:4419-4445`)]

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and the vanilla Lua in the capture: `LuaManager`, `GameClient`, `GameServer`, `TableNetworkUtils`, `SinglePlayerClient`, `SinglePlayerServer`, `ZomboidFileSystem` and vanilla's `ClientCommands.lua`, `ServerCommands.lua` and `LuaNet.lua`. The counts of handlers and calls come from a script over the Lua files, run once and deleted. No game or server was run, so the example mod is untested, and the following are not verified: where `print` output is written on a server, what other players see when `Say` is called on a client, and whether a mod folder in a server's `Zomboid/mods/` is found when the server runs with a different cache folder.
:::
