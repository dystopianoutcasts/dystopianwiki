---
id: build-42-the-anti-cheat-checks
slug: the-anti-cheat-checks
title: 'The anti-cheat checks'
game: pz
version: build-42
section: engine
category: anti-cheat
difficulty: intermediate
tags:
  - engine
  - multiplayer
  - anti-cheat
  - server
  - administration
excerpt: >-
  Each of the 20 Build 42.22 anti-cheat checks: what it tests, which option controls it, its counter limit, the reason text it writes, and when an honest player can trip it.
last_updated: '2026-11-22'
related_articles:
  - how-anti-cheat-works
  - anti-cheat-server-options
  - reading-anti-cheat-logs-and-bans
  - the-packet-system
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [server owners](#hits-anticheathit) | [the full table](#all-20-checks-at-a-glance) | modders should also read [the packet system](/pz/build-42/engine/networking-and-packets/the-packet-system)

:::callout[The 1-minute version]{kind=key}
- Each check belongs to one of ten options, and the option decides whether a trip is a Ban, Kick, Log or nothing. [How the anti-cheat works](/pz/build-42/engine/anti-cheat/how-anti-cheat-works) explains the four policies and the counter.
- Four checks are off by default: `NoClip`, `PacketRakNet`, `PacketException` and `PacketType`. The options for the other 16 default to Kick.
- A counter limit of 1 means one trip is enough for a Kick or Ban. Limits are 1, 2 or 4, set per check.
- For the checks that compare positions, distances and ammo, expect lag and desync as honest causes: they can trip when the server's picture of a player is out of date (read from the code, not observed).
- With `AntiCheatChecksum` not Disabled, a client whose game files differ from the server's trips `ChecksumUpdate` 60 seconds after the mismatch, unless its role has `BypassLuaChecksum` or `DoLuaChecksum` is off.
- A check that judges a packet writes the packet's name or an id, a colon and its reason. The three timer checks write "update failed" alone.
:::

:::facts
- **Checks** 20, in 10 options
- **Limit 1** 11 checks, **limit 2** 6 checks, **limit 4** 3 checks
- **Off by default** 4 checks (2 options)
- **Timer checks** 3: `ChecksumUpdate`, `PlayerUpdate`, `XPUpdate`
- **Player-update silence** 30 seconds
- **XP sample** every 60 seconds per player
- **Checksum grace** 60 seconds
:::

## How to read a card

Each card lists where the check runs, what it tests, its limit and reason text, and when an honest player can trip it.

"Applies to" names the kind of packet or timer that feeds the check. "Limit" is the counter value at which a Kick or Ban happens. :cite[(`AntiCheat.java:29-49`)] "Reason" is the text that follows the packet name in the log line, with a placeholder in angle brackets standing for a number that the server supplies. :cite[(`AntiCheat.java:116-130`)]

The cards describe the server's rules and say nothing about getting past them. Where a check can misfire on an honest player, the card says so, so that you can pick a policy that fits your server.

## Hits: AntiCheatHit

`AntiCheatHit` controls four checks that judge hits, and its default is 2 Kick. :cite[(`ServerOptions.java:206`, `AntiCheat.java:30-33`)]

A hit by a player arrives inside one `PlayerHit` packet that carries a sub-packet for each target. The server runs each sub-packet's checks itself while it parses the hit, and a sub-packet that fails is skipped while the others continue. :cite[(`PlayerHitPacket.java:102-112`, `PlayerHitPacket.java:141-152`)]

::::cards
:::card[HitLongDistance]{accent=orange}
**Applies to:** a player's hit on a zombie, animal, player, vehicle, object or square. :cite[(`PlayerHitZombiePacket.java:37`, `PlayerHitVehiclePacket.java:36`)]

**Tests:** whether the reported distance to the target is farther than the range the server uses for what is relevant to that player, with an allowance for network prediction. :cite[(`AntiCheatHitLongDistance.java:18-27`)]

**Limit:** 2. **Reason:** `distance=<value> > range=<value>`.

**Honest trips:** lag that leaves the server with an old position for the player or the target.
:::
:::card[HitShortDistance]{accent=blue}
**Applies to:** hits by a vehicle on a zombie, animal or player, and a zombie's hit on a player or on a thumpable. :cite[(`VehicleHitZombiePacket.java:32`, `ZombieHitPlayerPacket.java:35`, `ZombieHitThumpablePacket.java:36`)]

**Tests:** whether the farthest hit is beyond a fixed short distance. :cite[(`AntiCheatHitShortDistance.java:18-26`)]

**Limit:** 2. **Reason:** `distance=<value> > range=<value>`.

**Honest trips:** a fast vehicle with lag, where the hit is reported late.
:::
:::card[HitWeapon]{accent=purple}
**Applies to:** a player's hit on a zombie, animal or player, and on an object, with a weapon in hand. :cite[(`PlayerHitZombiePacket.java:37`, `PlayerHitObjectPacket.java:43`)]

**Tests:** three things in order: the distance against the weapon's range, with an allowance; for an aimed firearm, whether any ammo is left, unless the player has unlimited ammo; and whether the attack rate suits the weapon. :cite[(`AntiCheatHitWeapon.java:26-80`)]

**Limit:** 2. **Reasons:** `distance=<value> is greater than weapon range`, `not enough ammo`, `attack rate is too high`, and `player not found`.

**Honest trips:** an ammo count that the server and client disagree on after a reload, and weapon values that a mod changes on one side only. The multi-hit sandbox option changes the rate the check allows. :cite[(`AntiCheatHitWeapon.java:62-71`)]
:::
:::card[HitVehicle]{accent=cream}
**Applies to:** hits by a vehicle on a zombie, animal or player. :cite[(`VehicleHitPlayerPacket.java:32`)]

**Tests:** that the vehicle exists, that it has a driver, and that the driver is one of the players on the sender's own connection. :cite[(`AntiCheatHitVehicle.java:18-35`)]

**Limit:** 1. **Reasons:** `vehicle not found`, `driver not found`, `driver is not authorized`.

**Honest trips:** a vehicle that unloads, or a driver who leaves the seat, between the hit and its packet.
:::
::::

## Safety: AntiCheatSafety

`AntiCheatSafety` controls one check that judges whether a hit on another player is allowed by the server's PvP rules, and its default is 2 Kick. :cite[(`ServerOptions.java:203`, `AntiCheat.java:29`)]

::::cards
:::card[Safety]{accent=orange}
**Applies to:** a player's hit on another player, and a vehicle's hit on a player. :cite[(`PlayerHitPlayerPacket.java:38`, `VehicleHitPlayerPacket.java:32`)]

**Tests:** that both players exist, that the target is not in god mode, that the `PVP` option is enabled, the faction rules, the safety system when the `SafetySystem` option is enabled, and the non-PvP zones. :cite[(`AntiCheatSafety.java:23-64`)]

**Limit:** 1. **Reasons:** `wielder not found`, `target not found`, `target is in god-mode`, `server pvp is disabled`, `only melee pvp is allowed for faction members`, `faction melee pvp is disabled by players`, `pvp is disabled by players`, `wielder is in non-pvp zone`, `target is in non-pvp zone`.

**Honest trips:** a hit that lands just as a player toggles the safety system or crosses the edge of a zone. A hit in a non-PvP zone is dropped with the line "skip", which does not count. :cite[(`AntiCheatSafety.java:46-51`, `AntiCheat.java:86-91`)]
:::
::::

## Player: AntiCheatPlayer

`AntiCheatPlayer` controls three checks on a connection's players, and its default is 2 Kick. :cite[(`ServerOptions.java:211`, `AntiCheat.java:39-41`)]

::::cards
:::card[Target]{accent=orange}
**Applies to:** a zombie's hit on a player. :cite[(`ZombieHitPlayerPacket.java:35`)]

**Tests:** that the player the packet names is one of the players on the sender's connection. :cite[(`AntiCheatTarget.java:16-23`)]

**Limit:** 2. **Reason:** `invalid target`.

**Honest trips:** not found in the code. A connection that changes players around the moment of the packet is a possible cause (not verified).
:::
:::card[PlayerUpdate]{accent=blue}
**Applies to:** a timer, for every connection.

**Tests:** whether a connection that is ready has sent no player update for 30 seconds. :cite[(`AntiCheatPlayerUpdate.java:15-32`, `PacketValidator.java:15-40`)] Each player update from the client resets the timer. :cite[(`PlayerPacket.java:191-193`)]

**Limit:** 4. **Reason:** `update failed`.

**Honest trips:** a frozen or stalled client, or a long network gap.
:::
:::card[VehicleEnter]{accent=purple}
**Applies to:** a player's request to enter a vehicle. :cite[(`VehicleEnterPacket.java:38`)]

**Tests:** whether the distance between the player and the vehicle is beyond a fixed distance. :cite[(`AntiCheatVehicleEnter.java:18-26`)]

**Limit:** 2. **Reason:** `distance=<value> > max=<value>`.

**Honest trips:** lag that makes the server's position for the player or the vehicle old.
:::
::::

## Permissions: AntiCheatPermission

`AntiCheatPermission` controls two checks about what a role may do, and its default is 2 Kick. :cite[(`ServerOptions.java:208`, `AntiCheat.java:42-43`)]

::::cards
:::card[Power]{accent=orange}
**Applies to:** a player's movement updates. :cite[(`PlayerPacketReliable.java:20`, `PlayerPacketUnreliable.java:20`)]

**Tests:** whether the update says the player is in debug or cheat (god) mode when the role does not allow it. A role with `ToggleGodModHimself` is not judged. :cite[(`AntiCheatPower.java:17-26`, `IsoPlayer.java:8931-8937`)]

**Limit:** 1. **Reason:** `invalid mode`.

**Honest trips:** a role that changed while the player was online, with a mode left switched on.
:::
:::card[Capability]{accent=blue}
**Applies to:** any packet that needs a capability. The server calls it directly, and no packet lists it. :cite[(`PacketTypes.java:304-316`)]

**Tests:** whether the sender's role holds the capability the packet type requires. A hosted game's host connection counts as authorized. :cite[(`PacketTypes.java:306-312`)]

**Limit:** 1. **Reason:** `<Packet>: no capability`. The packet is dropped whatever the option says. The counter moves only when the option is not Disabled.

**Honest trips:** a custom role that lacks a capability which a menu or a mod still offers to its players.
:::
::::

## Safehouses: AntiCheatSafeHouse

`AntiCheatSafeHouse` controls three checks on safehouse packets, and its default is 2 Kick. :cite[(`ServerOptions.java:210`, `AntiCheat.java:44-46`)]

A role that holds `CanSetupSafehouses` is not judged by any of the three. :cite[(`AntiCheatSafeHouseOwner.java:18-22`, `AntiCheatSafeHouseMember.java:18-22`, `AntiCheatSafeHouseNotMember.java:18-22`)]

::::cards
:::card[SafeHouseOwner]{accent=orange}
**Applies to:** changing a safehouse's owner or title, inviting a player to it, and releasing it. :cite[(`SafehouseChangeOwnerPacket.java:32`, `SafehouseChangeTitlePacket.java:32`, `SafehouseInvitePacket.java:28`, `SafehouseReleasePacket.java:27`)]

**Tests:** that the safehouse's owner is a player on the sender's connection. :cite[(`AntiCheatSafeHouseOwner.java:18-26`)]

**Limit:** 1. **Reason:** `owner not found`.

**Honest trips:** a safehouse list that is out of date after an admin changes ownership.
:::
:::card[SafeHouseMember]{accent=blue}
**Applies to:** changing a member and changing the respawn setting. :cite[(`SafehouseChangeMemberPacket.java:29`, `SafehouseChangeRespawnPacket.java:30`)]

**Tests:** that the named player or the safehouse's owner is on the sender's connection, and that the named player belongs to that safehouse. :cite[(`AntiCheatSafeHouseMember.java:18-31`)]

**Limit:** 1. **Reasons:** `player not found and sender is not owner`, `player is not member or owner of safehouse`.

**Honest trips:** two players acting on the same safehouse at nearly the same time.
:::
:::card[SafeHousePlayer]{accent=purple}
**Applies to:** accepting an invitation and claiming a safehouse or a safe zone. :cite[(`SafehouseAcceptPacket.java:33`, `SafehouseClaimPacket.java:36`, `SafezoneClaimPacket.java:36`)]

**Tests:** that the named player is on the sender's connection and does not already belong to a safehouse. The class behind it is `AntiCheatSafeHouseNotMember`. :cite[(`AntiCheatSafeHouseNotMember.java:18-31`, `AntiCheat.java:46`)]

**Limit:** 1. **Reasons:** `player not found`, `player is already member or owner of safehouse`.

**Honest trips:** accepting the same invitation twice, or claiming just after another action changed the player's safehouse.
:::
::::

## Experience: AntiCheatXP

`AntiCheatXP` controls one timer check on how fast experience grows, and its default is 2 Kick. :cite[(`ServerOptions.java:209`, `AntiCheat.java:37`)]

::::cards
:::card[XPUpdate]{accent=orange}
**Applies to:** a timer, for each player on each connection, once every 60 seconds. :cite[(`AntiCheatXPUpdate.java:104-118`, `NetworkCharacterAI.java:433-439`)]

**Tests:** for each skill, whether the experience gained since the last sample is more than a cap that grows with that player's XP multipliers: the sandbox multipliers, the skill's boost and the Fast Learner and Crafty traits. :cite[(`AntiCheatXPUpdate.java:34-84`)]

**Limit:** 2. **Reason:** `update failed`. A separate error line in the debug log names the skill and the values: "perk <name> xp growth is too high". :cite[(`AntiCheatXPUpdate.java:70-78`)]

**Honest trips:** high XP multipliers set in sandbox, and a mod or script that grants a large amount of XP in one minute. No role is exempt from the test itself. Not run in a game.

**Known gap:** With the global XP multiplier switched off, the check looks up each skill's own multiplier by the name `MultiplierConfig.` plus the skill's translated display name, while the sandbox options are named by the engine's id. :cite[(`AntiCheatXPUpdate.java:55-62`, `PerkFactory.java:84`, `SandboxOptions.java:1843-1880`)] A skill whose display name differs from its option name finds no option, and its multiplier is left out of the cap, so fast legitimate XP can trip the check. In the English text that is 16 of the 35 per-skill options: Long Blunt (`Blunt`), Short Blunt (`SmallBlunt`), Long Blade (`LongBlade`), Short Blade (`SmallBlade`), Carpentry (`Woodwork`), Electrical (`Electricity`), First Aid (`Doctor`), Knapping (`FlintKnapping`), Blacksmithing (`Blacksmith`), Welding (`MetalWelding`), Foraging (`PlantScavenging`), Lightfooted (`Lightfoot`), Running (`Sprinting`), Sneaking (`Sneak`), Agriculture (`Farming`) and Animal Care (`Husbandry`); the other 19 match. :cite[(`SandboxOptions.java:1841-1877`, `PerkFactory.java:105-148`, `media/lua/shared/Translate/EN/IG_UI.json:190-193`, `:199-212`, `:220-223`, `:749-750`)] A server in another language gets different names, so the list differs there. Read from the code; not run in a game.
:::
::::

## Files: AntiCheatChecksum

`AntiCheatChecksum` controls one timer check on whether a player's game files match the server's, and its default is 2 Kick. :cite[(`ServerOptions.java:212`, `AntiCheat.java:38`)]

::::cards
:::card[ChecksumUpdate]{accent=orange}
**Applies to:** a timer, for every connection. :cite[(`AntiCheatChecksumUpdate.java:12-34`)]

**Tests:** whether a connection whose checksum state is "different" is still different 60 seconds after the server marked it. The server marks it when the client's totals for Lua, scripts or animations do not equal the server's. :cite[(`ChecksumPacket.java:237-250`, `IsoWorld.java:316`)]

**Limit:** 1. **Reason:** `update failed`. The server also writes a line that ends "incorrect checksum" with the letters Lua, Script or Anim for what differed, and a `LuaChecksum` userlog entry. :cite[(`ChecksumPacket.java:252-271`)]

**Honest trips:** a player with a different mod version, a different mod order, or edited game files. A role with `BypassLuaChecksum` is treated as matching. With `DoLuaChecksum` off, the client does not send the check and the state is set to done. :cite[(`ChecksumPacket.java:244-246`, `IsoWorld.java:1928`, `LoginPacket.java:173-175`)]
:::
::::

## Speed: AntiCheatSpeed

`AntiCheatSpeed` controls one check on how fast a player or a vehicle is reported to move, and its default is 2 Kick. :cite[(`ServerOptions.java:204`, `AntiCheat.java:47`)]

::::cards
:::card[Speed]{accent=orange}
**Applies to:** a player's movement updates and a vehicle's physics updates. :cite[(`PlayerPacketUnreliable.java:20`, `VehiclePhysicsUnreliablePacket.java:20`, `VehiclePhysicsReliablePacket.java:20`)]

**Tests:** whether the reported speed is above the limit for that kind of mover. For a vehicle the limit is the `SpeedLimit` server option, whose default is 70.0 and whose range is 10.0 to 150.0. For a player on foot it is a fixed value in the game. A role with any of `TeleportToPlayer`, `TeleportToCoordinates`, `TeleportPlayerToAnotherPlayer` or `UseFastMoveCheat` is not judged. :cite[(`AntiCheatSpeed.java:21-46`, `ServerOptions.java:142`)]

**Limit:** 4. **Reason:** `speed=<value> > limit=<value>`.

**Honest trips:** lag bursts, and a vehicle mod whose top speed is above your `SpeedLimit`. Because lag can trip this check, Kick is safer than Ban on a laggy server.
:::
::::

## Walls: AntiCheatNoClip

`AntiCheatNoClip` controls one check on whether a player's move is physically possible, and its default is 4 Disabled. :cite[(`ServerOptions.java:205`, `AntiCheat.java:48`)]

::::cards
:::card[NoClip]{accent=orange}
**Applies to:** a player's movement updates. :cite[(`PlayerPacketUnreliable.java:20`, `PlayerPacketReliable.java:20`)]

**Tests:** whether a walkable path exists between the square where the server last had the player and the square the update reports, for a long step, a diagonal step, a step out of a basement, and a step through a wall, door or window. :cite[(`AntiCheatNoClip.java:56-160`)]

**Limit:** 4. **Reasons:** `Long blocked`, `Diagonal blocked`, `Basement blocked`, `Reachable blocked` and `Unreachable blocked`, each followed by the two squares and a length.

**On a trip** the server also sends the player back to the last position it knew, unless the role is staff with the matching no-clip or fast-move capability enabled. :cite[(`AntiCheatNoClip.java:43-54`)]

**Honest trips:** lag and desync, since the server's last position can be old, and any door or window whose state differs between server and client. This may be why the option defaults to Disabled (inference, not stated in the code).
:::
::::

## Packet errors: AntiCheatPacketException

`AntiCheatPacketException` controls three checks on packets the server cannot make sense of, and its default is 4 Disabled. :cite[(`ServerOptions.java:207`, `AntiCheat.java:34-36`)]

The three classes behind these checks are empty. The server calls each check by hand when it sees the fault. :cite[(`AntiCheatPacketRakNet.java:9-11`, `AntiCheatPacketException.java:9-11`, `AntiCheatPacketType.java:9-11`)]

::::cards
:::card[PacketRakNet]{accent=orange}
**Applies to:** a network-layer message that the server does not recognize. :cite[(`UdpEngine.java:316-320`)]

**Limit:** 1. **Reason:** `<id>: unknown RakNet packet`.

**Honest trips:** a client of a different game build or a damaged connection (not verified).
:::
:::card[PacketException]{accent=blue}
**Applies to:** a packet handler that throws an error. :cite[(`GameServer.java:1634-1642`)]

**Limit:** 1. **Reason:** `<Packet>: exception occurred`.

**Honest trips:** a bug in a handler can trip it for a player who did nothing wrong. This may be why the option defaults to Disabled (inference).
:::
:::card[PacketType]{accent=purple}
**Applies to:** a game packet whose id the server does not know. :cite[(`GameServer.java:3121-3125`)]

**Limit:** 1. **Reason:** `<id>: unknown Zed packet`.

**Honest trips:** a client of a different game build (not verified).
:::
::::

## All 20 checks at a glance

The table has one row per check, in the order of the game's list.

| Check | Option | Default | Limit | Runs on | Code |
|---|---|---|---|---|---|
| Safety | `AntiCheatSafety` | Kick | 1 | hits on a player | `AntiCheat.java:29`, `AntiCheatSafety.java:23-64` |
| HitVehicle | `AntiCheatHit` | Kick | 1 | vehicle hits | `AntiCheat.java:30`, `AntiCheatHitVehicle.java:18-35` |
| HitLongDistance | `AntiCheatHit` | Kick | 2 | player hits | `AntiCheat.java:31`, `AntiCheatHitLongDistance.java:18-27` |
| HitShortDistance | `AntiCheatHit` | Kick | 2 | vehicle and zombie hits | `AntiCheat.java:32`, `AntiCheatHitShortDistance.java:18-26` |
| HitWeapon | `AntiCheatHit` | Kick | 2 | player hits | `AntiCheat.java:33`, `AntiCheatHitWeapon.java:26-80` |
| PacketRakNet | `AntiCheatPacketException` | Disabled | 1 | unknown network message | `AntiCheat.java:34`, `UdpEngine.java:316-320` |
| PacketException | `AntiCheatPacketException` | Disabled | 1 | handler error | `AntiCheat.java:35`, `GameServer.java:1634-1642` |
| PacketType | `AntiCheatPacketException` | Disabled | 1 | unknown packet id | `AntiCheat.java:36`, `GameServer.java:3121-3125` |
| XPUpdate | `AntiCheatXP` | Kick | 2 | timer, 60 seconds | `AntiCheat.java:37`, `AntiCheatXPUpdate.java:104-118` |
| ChecksumUpdate | `AntiCheatChecksum` | Kick | 1 | timer, 60 seconds after mismatch | `AntiCheat.java:38`, `AntiCheatChecksumUpdate.java:12-34` |
| Target | `AntiCheatPlayer` | Kick | 2 | zombie hit on a player | `AntiCheat.java:39`, `AntiCheatTarget.java:16-23` |
| PlayerUpdate | `AntiCheatPlayer` | Kick | 4 | timer, 30 seconds | `AntiCheat.java:40`, `AntiCheatPlayerUpdate.java:15-32` |
| VehicleEnter | `AntiCheatPlayer` | Kick | 2 | entering a vehicle | `AntiCheat.java:41`, `AntiCheatVehicleEnter.java:18-26` |
| Power | `AntiCheatPermission` | Kick | 1 | movement updates | `AntiCheat.java:42`, `AntiCheatPower.java:17-26` |
| Capability | `AntiCheatPermission` | Kick | 1 | packets that need a capability | `AntiCheat.java:43`, `PacketTypes.java:304-316` |
| SafeHouseOwner | `AntiCheatSafeHouse` | Kick | 1 | owner-only safehouse packets | `AntiCheat.java:44`, `AntiCheatSafeHouseOwner.java:18-26` |
| SafeHouseMember | `AntiCheatSafeHouse` | Kick | 1 | member safehouse packets | `AntiCheat.java:45`, `AntiCheatSafeHouseMember.java:18-31` |
| SafeHousePlayer | `AntiCheatSafeHouse` | Kick | 1 | accept and claim packets | `AntiCheat.java:46`, `AntiCheatSafeHouseNotMember.java:18-31` |
| Speed | `AntiCheatSpeed` | Kick | 4 | movement and vehicle physics | `AntiCheat.java:47`, `AntiCheatSpeed.java:21-46` |
| NoClip | `AntiCheatNoClip` | Disabled | 4 | movement updates | `AntiCheat.java:48`, `AntiCheatNoClip.java:56-160` |

:::callout[How we know]{kind=proof}
Every check's behavior is read from its class in `zombie/network/anticheats/` and from the packet classes that list it. The limits, options and defaults are read from `AntiCheat.java:29-49` and `ServerOptions.java:203-212`, and the counts were made by hand from those lines.

Not run in a game: every "honest trips" line is a reading of the code, not an observed trip.

The lag and desync causes are a reasoning step from the fact that the checks compare data the client sent with data the server holds. "This may be why the option defaults to Disabled" is an inference, since the code gives no reason. Not verified: the exact effect of the multi-hit sandbox option on the rate allowance, and how often each reason appears on a real server.
:::
