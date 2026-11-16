---
id: build-42-anti-cheat-reference
slug: anti-cheat-reference
title: 'Anti-cheat reference'
game: pz
version: build-42
section: engine
category: anti-cheat
difficulty: advanced
tags:
  - engine
  - multiplayer
  - anti-cheat
  - reference
  - server
excerpt: >-
  The Build 42.22 anti-cheat in tables, counted by script: the 20 checks, the ten server options, the packets that list each check, the userlog types, the exempting capabilities and the Lua calls.
last_updated: '2026-11-15'
related_articles:
  - how-anti-cheat-works
  - the-anti-cheat-checks
  - anti-cheat-server-options
  - reading-anti-cheat-logs-and-bans
  - networking-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [server owners](#the-ten-options) | [modders](#lua-callable-members) | the plain-words version of each check is on [The anti-cheat checks](/pz/build-42/engine/anti-cheat/the-anti-cheat-checks)

:::callout[The 1-minute version]{kind=key}
- Each of the 20 checks belongs to one option and has a counter limit of 1, 2 or 4 trips. The limit is 1 for 11 checks, 2 for 6 and 4 for 3.
- Four checks default to Disabled: `NoClip` and the three packet-error checks. The other 16 default to Kick.
- Thirteen of the 20 checks are named in packet lists, and the other seven run from code or timers. The 25 packet entries that carry a list use a check 39 times in all, the same counts as the networking reference.
- Two capabilities, `CantBeKickedByAnticheat` and `CantBeBannedByAnticheat`, keep a player from being counted, kicked or banned by the anti-cheat. The default roles `observer`, `gm`, `moderator` and `admin` hold both.
- No Lua function runs a check on a packet. The Lua calls here are `checkPermissions`, which reuses the capability test, and the client-side calls that send userlog and ban requests, which the server answers only for a role with the right capability.
:::

:::facts
- **Checks** 20 (limit 1 for 11, 2 for 6, 4 for 3)
- **Options** 10, values 1 Ban, 2 Kick, 3 Log, 4 Disabled
- **Packet entries with a check list** 25, using a check 39 times
- **Userlog types** 8
- **Capabilities that change a check** 12
:::

## The 20 checks

The table has one row for each value of the `AntiCheat` list except the placeholder `None`, in the order the game lists them.

The check name is the name in the list, and the class is the class that tests it. The reason text is what the check writes after the packet name and a colon; a placeholder such as `%f` stands for a number that the game replaces with the real value. The three timer checks write "update failed" with no packet name. :cite[(`AntiCheat.java:87-103`)]

The Limit column is the number of trips that fills the check's counter, and the Default column is the value of the check's option when the server's ini file does not set it. :cite[(`AntiCheat.java:29-49`, `ServerOptions.java:203-212`)]

| Check | Class | Option | Default | Limit | Reason text | Code |
|---|---|---|---|---|---|---|
| Safety | `AntiCheatSafety` | `AntiCheatSafety` | Kick | 1 | `wielder not found`; `target not found`; `target is in god-mode`; `server pvp is disabled`; `only melee pvp is allowed for faction members`; `faction melee pvp is disabled by players`; `pvp is disabled by players`; `wielder is in non-pvp zone`; `target is in non-pvp zone` | `AntiCheat.java:29`, `AntiCheatSafety.java:23-64` |
| HitVehicle | `AntiCheatHitVehicle` | `AntiCheatHit` | Kick | 1 | `vehicle not found`; `driver not found`; `driver is not authorized` | `AntiCheat.java:30`, `AntiCheatHitVehicle.java:18-35` |
| HitLongDistance | `AntiCheatHitLongDistance` | `AntiCheatHit` | Kick | 2 | `distance=%f > range=%f` | `AntiCheat.java:31`, `AntiCheatHitLongDistance.java:18-27` |
| HitShortDistance | `AntiCheatHitShortDistance` | `AntiCheatHit` | Kick | 2 | `distance=%f > range=%d` | `AntiCheat.java:32`, `AntiCheatHitShortDistance.java:18-26` |
| HitWeapon | `AntiCheatHitWeapon` | `AntiCheatHit` | Kick | 2 | `player not found`; `distance=%f is greater than weapon range`; `not enough ammo`; `attack rate is too high` | `AntiCheat.java:33`, `AntiCheatHitWeapon.java:26-80` |
| PacketRakNet | `AntiCheatPacketRakNet` | `AntiCheatPacketException` | Disabled | 1 | `unknown RakNet packet` | `AntiCheat.java:34`, `UdpEngine.java:316-320` |
| PacketException | `AntiCheatPacketException` | `AntiCheatPacketException` | Disabled | 1 | `exception occurred` | `AntiCheat.java:35`, `GameServer.java:1634-1642` |
| PacketType | `AntiCheatPacketType` | `AntiCheatPacketException` | Disabled | 1 | `unknown Zed packet` | `AntiCheat.java:36`, `GameServer.java:3121-3125` |
| XPUpdate | `AntiCheatXPUpdate` | `AntiCheatXP` | Kick | 2 | `update failed` | `AntiCheat.java:37`, `AntiCheatXPUpdate.java:104-118` |
| ChecksumUpdate | `AntiCheatChecksumUpdate` | `AntiCheatChecksum` | Kick | 1 | `update failed` | `AntiCheat.java:38`, `AntiCheatChecksumUpdate.java:12-34` |
| Target | `AntiCheatTarget` | `AntiCheatPlayer` | Kick | 2 | `invalid target` | `AntiCheat.java:39`, `AntiCheatTarget.java:16-23` |
| PlayerUpdate | `AntiCheatPlayerUpdate` | `AntiCheatPlayer` | Kick | 4 | `update failed` | `AntiCheat.java:40`, `AntiCheatPlayerUpdate.java:15-32` |
| VehicleEnter | `AntiCheatVehicleEnter` | `AntiCheatPlayer` | Kick | 2 | `distance=%f > max=%f` | `AntiCheat.java:41`, `AntiCheatVehicleEnter.java:18-26` |
| Power | `AntiCheatPower` | `AntiCheatPermission` | Kick | 1 | `invalid mode` | `AntiCheat.java:42`, `AntiCheatPower.java:17-26` |
| Capability | `AntiCheatCapability` | `AntiCheatPermission` | Kick | 1 | `no capability` | `AntiCheat.java:43`, `PacketTypes.java:314-316` |
| SafeHouseOwner | `AntiCheatSafeHouseOwner` | `AntiCheatSafeHouse` | Kick | 1 | `owner not found` | `AntiCheat.java:44`, `AntiCheatSafeHouseOwner.java:18-26` |
| SafeHouseMember | `AntiCheatSafeHouseMember` | `AntiCheatSafeHouse` | Kick | 1 | `player not found and sender is not owner`; `player is not member or owner of safehouse` | `AntiCheat.java:45`, `AntiCheatSafeHouseMember.java:18-31` |
| SafeHousePlayer | `AntiCheatSafeHouseNotMember` | `AntiCheatSafeHouse` | Kick | 1 | `player not found`; `player is already member or owner of safehouse` | `AntiCheat.java:46`, `AntiCheatSafeHouseNotMember.java:18-31` |
| Speed | `AntiCheatSpeed` | `AntiCheatSpeed` | Kick | 4 | `speed=%f > limit=%f` | `AntiCheat.java:47`, `AntiCheatSpeed.java:21-46` |
| NoClip | `AntiCheatNoClip` | `AntiCheatNoClip` | Disabled | 4 | `Long blocked`; `Diagonal blocked`; `Basement blocked`; `Reachable blocked`; `Unreachable blocked` | `AntiCheat.java:48`, `AntiCheatNoClip.java:56-160` |

Two checks write their detail elsewhere. `XPUpdate` writes only "update failed" to the anti-cheat line, and the reason it tripped goes to the multiplayer debug log. `ChecksumUpdate` also gets a line at the moment of a mismatch, written as the letters of the files that differ followed by "incorrect checksum". :cite[(`AntiCheatXPUpdate.java:73-83`, `ChecksumPacket.java:246-271`)] The check named `SafeHousePlayer` is tested by the class `AntiCheatSafeHouseNotMember`. :cite[(`AntiCheat.java:46`)]

## The ten options

Each option holds a choice from 1 to 4 and controls the checks in its row, so the row counts add up to the 20 checks.

All ten are choices of four values, and the English labels of the values are "ban", "kick", "log" and "disabled". :cite[(`ServerOptions.java:203-212`, `UI.json:1822-1825`)] There are no separate display names for the options: the tooltip is the only English text each one has. :cite[(`UI.json:1812-1821`)]

| Option | Default | English tooltip | Checks it controls | Count | Code |
|---|---|---|---|---|---|
| `AntiCheatSafety` | Kick | Disables safety system anti-cheat protection. | Safety | 1 | `ServerOptions.java:203`, `UI.json:1812` |
| `AntiCheatSpeed` | Kick | Disables character speed anti-cheat protection. | Speed | 1 | `ServerOptions.java:204`, `UI.json:1813` |
| `AntiCheatNoClip` | Disabled | Disables character no-clipping anti-cheat protection. | NoClip | 1 | `ServerOptions.java:205`, `UI.json:1814` |
| `AntiCheatHit` | Kick | Disables character hit anti-cheat protection. | HitVehicle, HitLongDistance, HitShortDistance, HitWeapon | 4 | `ServerOptions.java:206`, `UI.json:1815` |
| `AntiCheatPacketException` | Disabled | Disables packet exception checks anti-cheat protection. | PacketRakNet, PacketException, PacketType | 3 | `ServerOptions.java:207`, `UI.json:1816` |
| `AntiCheatPermission` | Kick | Disables player permissions anti-cheat protection. | Power, Capability | 2 | `ServerOptions.java:208`, `UI.json:1817` |
| `AntiCheatXP` | Kick | Disables player XP anti-cheat protection. | XPUpdate | 1 | `ServerOptions.java:209`, `UI.json:1818` |
| `AntiCheatSafeHouse` | Kick | Disables safehouse anti-cheat protection. | SafeHouseOwner, SafeHouseMember, SafeHousePlayer | 3 | `ServerOptions.java:210`, `UI.json:1819` |
| `AntiCheatPlayer` | Kick | Disables player anti-cheat protection. | Target, PlayerUpdate, VehicleEnter | 3 | `ServerOptions.java:211`, `UI.json:1820` |
| `AntiCheatChecksum` | Kick | Disables checksum anti-cheat protection. | ChecksumUpdate | 1 | `ServerOptions.java:212`, `UI.json:1821` |

The speed check also reads a number option, `SpeedLimit`, with the range 10.0 to 150.0 and the default 70.0, for vehicles. :cite[(`ServerOptions.java:142`, `AntiCheatSpeed.java:21-46`)] [The options page](/pz/build-42/engine/anti-cheat/anti-cheat-server-options) explains how to choose a value for each option.

## Packets that list each check

A script over the packet classes counted the checks in each packet's `anticheats` setting, and it agrees with the networking reference.

The script found 25 packet entries with a non-empty list, and 39 uses of 13 different check names in those lists. :cite[(`PacketTypes.java:682-724`)] [The networking reference](/pz/build-42/engine/networking-and-packets/networking-reference) reports the same 25 entries, 39 uses and 13 names. The other seven checks are called from code or run on a timer: `Capability`, `PacketRakNet`, `PacketException` and `PacketType` from the code paths that handle a refusal or a failed read, and `ChecksumUpdate`, `PlayerUpdate` and `XPUpdate` from the timer. :cite[(`PacketTypes.java:314-316`, `UdpEngine.java:316-320`, `GameServer.java:1634-1642`, `GameServer.java:3121-3125`, `AntiCheat.java:100-106`)]

The first table is by check, and its Entries column is the number of entries that name that check.

| Check | Packet entries that list it | Entries |
|---|---|---|
| Safety | PlayerHitPlayer, VehicleHitPlayer | 2 |
| HitVehicle | VehicleHitAnimal, VehicleHitPlayer, VehicleHitZombie | 3 |
| HitLongDistance | PlayerHitAnimal, PlayerHitObject, PlayerHitPlayer, PlayerHitSquare, PlayerHitVehicle, PlayerHitZombie | 6 |
| HitShortDistance | VehicleHitAnimal, VehicleHitPlayer, VehicleHitZombie, ZombieHitPlayer, ZombieHitThumpable | 5 |
| HitWeapon | PlayerHitAnimal, PlayerHitObject, PlayerHitPlayer, PlayerHitZombie | 4 |
| Target | ZombieHitPlayer | 1 |
| VehicleEnter | VehicleEnter | 1 |
| Power | PlayerUpdateReliable, PlayerUpdateUnreliable | 2 |
| SafeHouseOwner | SafehouseChangeOwner, SafehouseChangeTitle, SafehouseInvite, SafehouseRelease | 4 |
| SafeHouseMember | SafehouseChangeMember, SafehouseChangeRespawn | 2 |
| SafeHousePlayer | SafehouseAccept, SafehouseClaim, SafezoneClaim | 3 |
| Speed | PlayerUpdateReliable, PlayerUpdateUnreliable, VehiclePhysicsReliable, VehiclePhysicsUnreliable | 4 |
| NoClip | PlayerUpdateReliable, PlayerUpdateUnreliable | 2 |

The second table is by packet entry, and its Code column gives the line of each packet class's setting.

| Packet entry | Checks it lists | Code |
|---|---|---|
| PlayerUpdateReliable | Power, Speed, NoClip | `PlayerPacketReliable.java:20` |
| PlayerUpdateUnreliable | Power, Speed, NoClip | `PlayerPacketUnreliable.java:20` |
| VehiclePhysicsReliable | Speed | `VehiclePhysicsReliablePacket.java:20` |
| VehiclePhysicsUnreliable | Speed | `VehiclePhysicsUnreliablePacket.java:20` |
| VehicleEnter | VehicleEnter | `VehicleEnterPacket.java:38` |
| PlayerHitSquare | HitLongDistance | `PlayerHitSquarePacket.java:33` |
| PlayerHitObject | HitLongDistance, HitWeapon | `PlayerHitObjectPacket.java:43` |
| PlayerHitVehicle | HitLongDistance | `PlayerHitVehiclePacket.java:36` |
| PlayerHitZombie | HitLongDistance, HitWeapon | `PlayerHitZombiePacket.java:37` |
| PlayerHitPlayer | HitLongDistance, HitWeapon, Safety | `PlayerHitPlayerPacket.java:38` |
| PlayerHitAnimal | HitLongDistance, HitWeapon | `PlayerHitAnimalPacket.java:35` |
| ZombieHitPlayer | HitShortDistance, Target | `ZombieHitPlayerPacket.java:35` |
| ZombieHitThumpable | HitShortDistance | `ZombieHitThumpablePacket.java:36` |
| VehicleHitZombie | HitShortDistance, HitVehicle | `VehicleHitZombiePacket.java:32` |
| VehicleHitPlayer | HitShortDistance, Safety, HitVehicle | `VehicleHitPlayerPacket.java:32` |
| VehicleHitAnimal | HitShortDistance, HitVehicle | `VehicleHitAnimalPacket.java:32` |
| SafehouseInvite | SafeHouseOwner | `SafehouseInvitePacket.java:28` |
| SafehouseAccept | SafeHousePlayer | `SafehouseAcceptPacket.java:33` |
| SafehouseChangeMember | SafeHouseMember | `SafehouseChangeMemberPacket.java:29` |
| SafehouseChangeOwner | SafeHouseOwner | `SafehouseChangeOwnerPacket.java:32` |
| SafehouseChangeRespawn | SafeHouseMember | `SafehouseChangeRespawnPacket.java:30` |
| SafehouseChangeTitle | SafeHouseOwner | `SafehouseChangeTitlePacket.java:32` |
| SafehouseRelease | SafeHouseOwner | `SafehouseReleasePacket.java:27` |
| SafehouseClaim | SafeHousePlayer | `SafehouseClaimPacket.java:36` |
| SafezoneClaim | SafeHousePlayer | `SafezoneClaimPacket.java:36` |

The six `PlayerHit...` entries are not passed on by the server's general receive path. The class `PlayerHitPacket` reads each hit's own packet and runs these lists itself, and a hit that fails is skipped while the rest of that packet is still processed. :cite[(`PlayerHitPacket.java:102-112`, `PlayerHitPacket.java:150`)]

## The userlog types

The userlog is a table in the server's database, and each row has one of the types below.

The enum has eight types, numbered from 0. The table lists all eight, and [the logs page](/pz/build-42/engine/anti-cheat/reading-anti-cheat-logs-and-bans) names all eight. :cite[(`Userlog.java:80-92`)] Some types add 1 to an existing row's amount, some replace the text of an existing row and some always add a new row, as [the logs page](/pz/build-42/engine/anti-cheat/reading-anti-cheat-logs-and-bans) explains. :cite[(`ServerWorldDatabase.java:1383-1437`)]

| Type | Number | Written by | Code |
|---|---|---|---|
| `AdminLog` | 0 | Not written by any server code in a search for the name | `Userlog.java:80-92` |
| `Kicked` | 1 | The anti-cheat's kick, the `/kick` command, and a kick action sent from the admin panel | `AntiCheat.java:165`, `KickUserCommand.java:57`, `BanUnbanUserActionPacket.java:74` |
| `Banned` | 2 | The anti-cheat's ban, and any ban through `BanUser` | `AntiCheat.java:173`, `BanSystem.java:43` |
| `DupeItem` | 3 | Only the helper `logDupeItem`, which nothing in the source calls | `AddInventoryItemToContainerPacket.java:143-158` |
| `LuaChecksum` | 4 | The checksum step, when the file totals differ | `ChecksumPacket.java:271` |
| `UnauthorizedPacket` | 6 | Not written by any server code in 42.22 (a search of the source finds the name only in the enum and the merge rule) | `Userlog.java:80-92`, `ServerWorldDatabase.java:1391` |
| `WarningPoint` | 5 | A warning point added by an admin | `ServerWorldDatabase.java:1702-1708`, `GameClient.java:2388-2392` |
| `SuspiciousActivity` | 7 | The anti-cheat, on a trip when it is not in debug mode | `AntiCheat.java:159` |

## Capabilities that change a check

Twelve capabilities change what a check does to a role's players, and the default roles that hold each one are listed with them.

The roles come from the default role definitions: `observer` and `gm` list their capabilities one by one, and `moderator` and `admin` start from every capability, with `moderator` giving up eight of them. :cite[(`Roles.java:385-482`)] `banned`, `user` and `priority` hold none of the twelve. :cite[(`Roles.java:363-384`)] A custom role has exactly what you give it.

| Capability | What it changes | Default roles that hold it | Code |
|---|---|---|---|
| `CantBeKickedByAnticheat` | The player is not counted, logged, kicked or banned | observer, gm, moderator, admin | `AntiCheat.java:136-153`, `Roles.java:403`, `Roles.java:435` |
| `CantBeBannedByAnticheat` | The ban step does nothing for the player; a kick under the Kick policy is not affected | observer, gm, moderator, admin | `AntiCheat.java:171-173`, `Roles.java:404`, `Roles.java:436` |
| `CantBeBannedByUser` | A role that holds it is not banned by the anti-cheat's ban, because the ban call refuses it; the player is still kicked | moderator, admin | `BanSystem.java:31-33`, `AntiCheat.java:176` |
| `TeleportToPlayer` | The `Speed` check passes the role | observer, gm, moderator, admin | `AntiCheatSpeed.java:28-33` |
| `TeleportToCoordinates` | The `Speed` check passes the role | observer, gm, moderator, admin | `AntiCheatSpeed.java:28-33` |
| `TeleportPlayerToAnotherPlayer` | The `Speed` check passes the role | gm, moderator, admin | `AntiCheatSpeed.java:28-33` |
| `UseFastMoveCheat` | The `Speed` check passes the role, and `NoClip` does not react while fast move is on | moderator, admin | `AntiCheatSpeed.java:28-33`, `AntiCheatNoClip.java:47-48` |
| `ToggleGodModHimself` | The `Power` check passes the role | observer, gm, moderator, admin | `AntiCheatPower.java:20` |
| `ToggleNoclipHimself` | `NoClip` does not react while the player's own no-clip is on | observer, gm, moderator, admin | `AntiCheatNoClip.java:47-48`, `AntiCheatNoClip.java:73-74` |
| `CanSetupSafehouses` | The three safehouse checks pass the role | moderator, admin | `AntiCheatSafeHouseOwner.java:20`, `AntiCheatSafeHouseMember.java:20`, `AntiCheatSafeHouseNotMember.java:20` |
| `ConnectWithDebug` | The `Power` check does not reject the debug-mode flag | admin | `IsoPlayer.java:8934` |
| `BypassLuaChecksum` | The checksum comparison counts as matching, and the login step sets the checksum state to done | admin | `ChecksumPacket.java:242-244`, `LoginPacket.java:173-175` |

One more capability is related but is not an exemption: `AdminChat` decides who sees the anti-cheat lines live. :cite[(`ChatServer.java:140-143`)]

## Lua-callable members

Lua has no call that runs a check on a packet, and the members below are the ones that touch the anti-cheat's neighbors: roles, the userlog, bans and options.

The anti-cheat classes, the ban system and the server class itself are not on the engine's list of classes exposed to Lua. :cite[(`LuaManager.java:2243-2249`, `LuaManager.java:2475-2476`, `LuaManager.java:2502-2503`)] What is exposed is below. A client-side call only sends a request, and the server answers it only if the sender's role holds the packet's capability. :cite[(`PacketTypes.java:304-316`)]

| Member | Works on | What it does | Code |
|---|---|---|---|
| `checkPermissions(player, capability)` | Server logic | Returns the role's answer for the player's connection; returns true on a client, in single player, or when no connection is found | `LuaManager.java:3081-3092` |
| `getCapabilities()` | Any side | Returns every `Capability` value | `LuaManager.java:3391-3397` |
| `player:getRole()` and `role:hasCapability(capability)` | Any side | Reads a role and tests one capability; in a single-player debug game every test returns true | `IsoPlayer.java:7582`, `Role.java:192-198` |
| `requestUserlog(user)` | A client | Sends a request for a player's userlog; needs `ReadUserLog` | `LuaManager.java:3741-3747`, `RequestUserLogPacket.java:36` |
| `addUserlog(user, type, text)` | A client | Sends a request to add an entry; needs `AddUserlog` | `LuaManager.java:3751-3757`, `AddUserlogPacket.java:26` |
| `removeUserlog(user, type, text)` | A client | Sends a request to remove entries; needs `WorkWithUserlog` | `LuaManager.java:3761-3767`, `RemoveUserlogPacket.java:28` |
| `addWarningPoint(user, reason, amount)` | A client | Sends a warning point request when the sender's role holds `AddUserlog` | `LuaManager.java:9124-9130`, `GameClient.java:2388-2392` |
| `banUnbanUserAction(action, username, argument)` | A client | Sends a ban or unban request; needs `BanUnbanUser` | `LuaManager.java:3349-3353`, `BanUnbanUserActionPacket.java:32` |
| `getBannedIPs()`, `getBannedSteamIDs()` | A client | Ask for the banned lists; each needs `BanUnbanUser` | `LuaManager.java:4991-5007`, `PacketTypes.java:580-581` |
| `getServerOptions():getOption(name)` | Any side | Returns an option's value as text, or nil when no option has that name | `LuaManager.java:4113-4119`, `ServerOptions.java:335-338` |
| `writeLog(loggerName, text)` | Any side | Writes a line to the log named `loggerName` | `LuaManager.java:9142-9146` |

The enums `Capability` and `Userlog.UserlogType` are also exposed, so Lua can name a capability or a userlog type. :cite[(`LuaManager.java:2475-2476`, `LuaManager.java:2502-2503`)] How to use `checkPermissions`, `getRole` and `writeLog` in a mod's handler is on [Anti-cheat and mods](/pz/build-42/engine/anti-cheat/anti-cheat-and-mods).

:::callout[How we know]{kind=proof}
The check, option and packet tables were made by a script over `AntiCheat.java`, `ServerOptions.java`, `PacketTypes.java` and the packet classes, and the role table by a script over `Roles.java` and `Capability.java`. The scripts were run once and deleted. The script counts are 20 checks, 10 options, 25 packet entries, 39 uses of 13 check names, 11 limits of 1, 6 of 2 and 3 of 4, 16 defaults of Kick and 4 of Disabled, and 98 capability values.

Not verified: how often each reason text appears on a real server, which user-log type the admin panel's Add Log button writes, and the full list of Lua functions, because the Lua exposure list was read for the names above and not searched for every anti-cheat-related call. No game or server was run.
:::
