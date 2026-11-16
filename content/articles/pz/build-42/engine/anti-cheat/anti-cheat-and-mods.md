---
id: build-42-anti-cheat-and-mods
slug: anti-cheat-and-mods
title: 'Anti-cheat and mods'
game: pz
version: build-42
section: engine
category: anti-cheat
difficulty: advanced
tags:
  - engine
  - multiplayer
  - anti-cheat
  - modding
  - lua
excerpt: >-
  How a Build 42.22 mod can trip the server's anti-cheat by doing ordinary things, how to do them the way the server expects, and why a mod's own commands need their own checks.
last_updated: '2026-11-15'
related_articles:
  - how-anti-cheat-works
  - the-anti-cheat-checks
  - what-anti-cheat-does-not-cover
  - anti-cheat-reference
  - client-and-server-commands
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#things-a-mod-does-that-a-check-can-see) | [server owners](#testing-a-mod-against-the-checks) | the full mod with a client file is on [Client and server commands](/pz/build-42/engine/networking-and-packets/client-and-server-commands)

:::callout[The 1-minute version]{kind=key}
- The anti-cheat runs only on a server. It judges the packet types that list a check, and it runs three timers.
- An honest mod can trip a check when the server's picture of a player, weapon or vehicle differs from what the client sent. The causes this page reads from the code are weapon and vehicle values in scripts, XP granted on the server, and files that differ between client and server.
- On a server, grant XP through the vanilla `addXp` global, and test with the check on Log.
- The `checkPermissions` global tests a sender's role on a server. It returns true on a client, in single player, and when the player has no connection.
- While you test, set the option for the check to 3 (Log). A rejected packet is still dropped under Log, so your mod's request can fail even though nobody is kicked.
- Every step here that rests on reading the code is marked "not run in a game".
:::

:::facts
- **Where the checks run** the server only
- **XP check sample** about every 60 seconds per player
- **Vehicle speed option** `SpeedLimit`, 10.0 to 150.0, default 70.0
- **Option value for testing** 3 (Log)
:::

## How a mod meets the anti-cheat

A mod meets the anti-cheat in two ways: its changes show up in packets that a check judges, and its own commands travel in a packet that no check judges.

The checks run only in server code. :cite[(`AntiCheat.java:82-83`)] A packet type lists its checks in its settings class, and the server runs each enabled check after it has parsed the packet and before the handler. :cite[(`PacketTypes.java:706-724`, `PacketTypes.java:773-783`)] [How the anti-cheat works](/pz/build-42/engine/anti-cheat/how-anti-cheat-works) explains what happens after a check objects.

Your own commands get no anti-cheat, so your handler does the checking. The list of checks is filled in only from a packet class's settings, and the `ClientCommand` entry that carries mod commands is written inline without them. :cite[(`PacketTypes.java:519`, `PacketTypes.java:630`, `PacketTypes.java:706-724`)]

## Things a mod does that a check can see

Each of these is an ordinary thing for a mod to do, and each puts data in front of a check that compares it with what the server holds.

| The mod does this | Check that may judge it | Why an honest mod can trip it | Code |
|---|---|---|---|
| Adds a weapon with its own script values | `HitWeapon`, `HitLongDistance` | The weapon check reads the weapon's range, hit count, projectile count and fire mode from the weapon the server holds, and compares them with the hit the client reported. A script value that does not match how the weapon plays can make an honest hit look wrong. | `AntiCheatHitWeapon.java:26-80`, `AntiCheatHitLongDistance.java:18-27` |
| Lets a weapon fire without ammo, or changes how fast it attacks | `HitWeapon` | The check rejects an aimed firearm with no ammo (unless the player has unlimited ammo) and an attack rate it does not expect. | `AntiCheatHitWeapon.java:40-43`, `AntiCheatHitWeapon.java:58-72` |
| Adds or tunes a vehicle | `Speed`, `VehicleEnter`, `HitVehicle` | Vehicle speed is judged against the `SpeedLimit` option. Entering is judged from where the vehicle script puts the seat's outside position, or its door area. | `AntiCheatSpeed.java:21-46`, `ServerOptions.java:142`, `VehicleEnterPacket.java:97-124` |
| Moves its own player by a client script | `NoClip`, if its option is not Disabled | The server compares each reported position with the last one it accepted, and sends the player back after a move it judges blocked. | `AntiCheatNoClip.java:43-54`, `AntiCheatNoClip.java:56-160` |
| Grants XP | `XPUpdate` | The check compares the XP the server holds for each perk now with what it held at the last sample. | `AntiCheatXPUpdate.java:66-87`, `NetworkCharacterAI.java:297-299` |
| Ships files that differ from the server's | `ChecksumUpdate` | The server compares totals of the client's Lua, script and animation files with its own. | `ChecksumPacket.java:230-250`, `AntiCheatChecksumUpdate.java:12-34` |
| Changes who may hit whom | `Safety` | The server decides from its own options, zones and players' safety state, so a client script that changes its own copy does not change the decision. | `AntiCheatSafety.java:23-64` |

Weapons are the most common case. The weapon check reads `getMaxRange`, the projectile count times the maximum hit count, and the fire mode from the weapon the server loaded. :cite[(`AntiCheatHitWeapon.java:53-72`)] Give a mod weapon honest values in its item script, and make sure the server runs the same script, because the server compares script totals as well. :cite[(`ChecksumPacket.java:230-250`)]

Vehicles need the seat data. The enter check measures from the seat's `outside` and `outside2` positions in the vehicle script; if the script has neither, it measures from the door area, and failing that from the vehicle's center. :cite[(`VehicleEnterPacket.java:97-124`)] A vehicle script with those positions in the wrong place can make an honest entry look distant.

Moving a player is the awkward case. The server's own teleport routine tells the `NoClip` check about the move, so a move the server ordered is not judged as a jump. :cite[(`GameServer.java:1395-1403`, `AntiCheatNoClip.java:38-40`)]

The teleport packets need a teleport capability on the sender's role. :cite[(`TeleportPacket.java:29`, `TeleportUserActionPacket.java:25`, `TeleportToHimUserActionPacket.java:25`)]

So a mod that moves its own player with `teleportTo` on a client is judged like any other movement. Not run in a game.

## Doing those things the way the server expects

The way to stay in step with the checks is to make each change where the server can see it made, using the engine's own calls.

For XP, call the vanilla `addXp` global from a server script, and test with `AntiCheatXP` on Log. :cite[(`LuaManager.java:11856-11867`, `GameServer.java:1892-1901`)] Vanilla server scripts do this for building, farming and trapping. :cite[(`media/lua/server/BuildingObjects/ISBuildUtil.lua:107`, `media/lua/server/Farming/SFarmingSystem.lua:551`, `media/lua/server/Traps/STrapGlobalObject.lua:220`)]

Not run in a game.

For item scripts, vehicle scripts and sandbox values, put the same files on the server and on every client through the mod list. A client whose Lua, script or animation totals differ is marked as different. :cite[(`ChecksumPacket.java:230-250`)]

The server then acts on that difference only when the `DoLuaChecksum` option is enabled, the role lacks `BypassLuaChecksum` and `AntiCheatChecksum` is not Disabled. :cite[(`LoginPacket.java:173-175`, `AntiCheatChecksumUpdate.java:12-34`)]

For roles, ask the server. The `checkPermissions` global returns the role's answer for a player on a server, and returns true when the code is not on a server or the player has no connection. :cite[(`LuaManager.java:3081-3092`)] So call it only from files that run on the server. Vanilla's server file does, for example before it accepts an item edit. :cite[(`media/lua/server/ClientCommands.lua:148`)]

A role's capability list is also readable as `player:getRole():hasCapability(Capability.X)`. :cite[(`Role.java:192-194`, `media/lua/server/ClientCommands.lua:1274`)] In a single-player debug game every capability test returns true, so a mod tested only there never sees a refusal. :cite[(`Role.java:196-198`)]

## Testing a mod against the checks

A server owner who adds a modded weapon, vehicle or skill system should run the checks on Log for a while and read what they write.

Set the options for the affected checks to 3 (Log), play the mod's features with a normal player role, and read the lines. :cite[(`ServerOptions.java:203-212`)] [The log reading page](/pz/build-42/engine/anti-cheat/reading-anti-cheat-logs-and-bans) shows each field. A line that names a mod's packet and a reason such as a range or an attack rate means the mod's data and the server's disagree.

Log is not the same as a free pass for the packet: a rejected packet is dropped under Log as well, so the mod's feature can fail while you test. :cite[(`AntiCheat.java:82-98`)] Also test with a role that holds no teleport or fast-move capability, because a role that holds one skips the speed check. :cite[(`AntiCheatSpeed.java:21-46`)] An admin who tests alone sees nothing, and a player later sees a kick. [The options page](/pz/build-42/engine/anti-cheat/anti-cheat-server-options) says how to pick a policy once the logs are quiet.

In debug mode the server writes the lines but never kicks or bans, so a debug test run shows less than a real server does. :cite[(`AntiCheat.java:139-150`)] Not run in a game.

## A mod's own commands get no check

A mod's own client commands get no anti-cheat at all, so the mod's server handler has to be the check.

The packet is the same `ClientCommand` that vanilla uses. The server resolves the sender's player from the connection, writes a line to its `cmd` log if the `ClientCommandFilter` option lets that command through, and fires `OnClientCommand`. :cite[(`GameServer.java:2293-2344`, `ServerOptions.java:165-167`)] The module, the command and every value in the table are whatever the client wrote. :cite[(`GameServer.java:2293-2310`)]

So a handler works in a fixed order, and refuses at the first step that fails.

1. **Is this my command?** Return at once if the module or command is not yours, because every listener sees every command. :cite[(`GameServer.java:2343`)]
2. **Who sent it?** Use the `player` argument and never a name or id from the table. :cite[(`GameServer.java:2308-2321`)]
3. **Is the table what you expect?** Test that it exists and that each value has the right type, a sane length and a sane range. A table can hold strings, numbers, booleans, tables, items, directions and dead bodies, and a Lua number can be any value, including not-a-number. :cite[(`TableNetworkUtils.java:153-177`)]
4. **Does the sender have the right to do this, here?** For a target in the world, measure from the server's own record of the sender's position. For an item, look it up in the sender's own inventory. For a privileged action, call `checkPermissions`. :cite[(`LuaManager.java:3081-3092`)]
5. **Is the sender too fast?** Keep the time of the last accepted request per player and refuse a repeat that comes too soon.
6. **Log the refusal with its reason, and answer.** The reason, the player's name and the values go to a log you can read later, and the player gets an answer so the client does not wait.

The engine's own `cmd` log line says only who sent which command and where the player stood. It does not record why a mod refused. :cite[(`GameServer.java:2318-2336`)] The `writeLog` global writes a line to a log file named for the logger, so a mod can keep its own. :cite[(`LuaManager.java:9142-9146`, `LoggerManager.java:85-97`)] A Lua error in a handler is caught and written to the log, and it does not reach the packet-exception check. :cite[(`Event.java:43-49`, `Event.java:63-65`, `GameServer.java:1634-1642`)]

## A server handler from a cold start

This handler lets a player place a named marker near their own position, and it refuses and logs everything else.

It is a teaching example, and every step is **not run in a game**.

The mod needs a folder and a `mod.info`, and it must be enabled on the server before its files load. The folder goes in the `mods` folder inside the game's cache folder (`Zomboid` in the user's home folder by default), as `mods/GuardedMarker/42/mod.info`, with the id `GuardedMarker`. :cite[(`ZomboidFileSystem.java:204-215`, `ZomboidFileSystem.java:548-552`)]

The same mod must be installed and enabled on every client, because the server compares the clients' file totals with its own. :cite[(`ChecksumPacket.java:230-250`)] On a dedicated server, add `GuardedMarker` to the `Mods=` line, and add the item's id to `WorkshopItems=` for a Workshop item, separating entries with `;`. The client file, the menu and the mod's `shared` file are built in [Client and server commands](/pz/build-42/engine/networking-and-packets/client-and-server-commands), and this page does not repeat them.

The Lua goes in `mods/GuardedMarker/42/media/lua/server/GuardedMarkerServer.lua`.

```lua
if isClient() then return end

local MODULE = "GuardedMarker"
local MAX_NAME = 30
local MAX_DISTANCE = 10      -- tiles from the player, as the server sees them
local MIN_GAP_MS = 2000
local markers = {}
local lastUse = {}           -- username -> time of the last accepted request

local function isNumber(v)
    return type(v) == "number" and v == v   -- v == v is false for not-a-number
end

local function refuse(player, reason)
    writeLog("GuardedMarker", tostring(player:getUsername()) .. " refused: " .. reason)
    if isServer() then
        sendServerCommand(player, MODULE, "refused", { reason = reason })
    end
end

local function onClientCommand(module, command, player, args)
    if module ~= MODULE then return end

    if command == "place" then
        if type(args) ~= "table" then return refuse(player, "no table") end
        local name, x, y, z = args.name, args.x, args.y, args.z
        if type(name) ~= "string" or #name == 0 or #name > MAX_NAME then
            return refuse(player, "bad name")
        end
        if not (isNumber(x) and isNumber(y) and isNumber(z)) then
            return refuse(player, "bad position")
        end
        local dx, dy = x - player:getX(), y - player:getY()
        if math.sqrt(dx * dx + dy * dy) > MAX_DISTANCE or math.abs(z - player:getZ()) > 1 then
            return refuse(player, "too far from the sender")
        end
        local user = player:getUsername()
        local now = getTimestampMs()
        if lastUse[user] and now - lastUse[user] < MIN_GAP_MS then
            return refuse(player, "too soon")
        end
        lastUse[user] = now
        markers[#markers + 1] = { owner = user, name = name, x = x, y = y, z = z }
        writeLog("GuardedMarker", user .. " placed " .. name)
        if isServer() then
            sendServerCommand(player, MODULE, "placed", { name = name })
        end

    elseif command == "clear" then
        if not checkPermissions(player, Capability.EditMapSymbols) then
            return refuse(player, "no capability")
        end
        markers = {}
        writeLog("GuardedMarker", tostring(player:getUsername()) .. " cleared the markers")
    end
end

Events.OnClientCommand.Add(onClientCommand)
```

The handler follows the order above. The `player` is the sender found from the connection, the table is tested before any field is read, and the distance is measured from the server's copy of the player, not from a number in the table. :cite[(`GameServer.java:2308-2321`)] `DistTo` is not used here because it is a Manhattan distance, which is why the example does the sum itself. :cite[(`IsoMovingObject.java:612-614`)] The `clear` command asks `checkPermissions` for a capability that vanilla names `EditMapSymbols`. :cite[(`Capability.java:62`)]

Two limits of the example. In single player `sendServerCommand` does nothing, so a mod that must answer there needs a direct call, as the dice mod on [Client and server commands](/pz/build-42/engine/networking-and-packets/client-and-server-commands) does. And the markers live only in memory, so they are gone when the server restarts.

:::callout[How we know]{kind=proof}
Every engine claim is read from the 42.22 decompiled Java and the vanilla Lua in the capture. The weapon, vehicle, XP and checksum rows are a reading of what each check compares. They are not observed trips, and no mod was loaded in a game.

Not run in a game: the example mod, the effect of `teleportTo` on a client with `NoClip` on, the effect of `addXp` on the XP check. The 60-second XP sample is an update interval, so the real gap between samples is about 60 seconds, not exact.
:::
