---
id: build-42-anti-cheat-server-options
slug: anti-cheat-server-options
title: 'The anti-cheat server options'
game: pz
version: build-42
section: engine
category: anti-cheat
difficulty: beginner
tags:
  - engine
  - multiplayer
  - anti-cheat
  - server
  - administration
excerpt: >-
  The ten Build 42.22 anti-cheat server options: key, default, values, the game's own labels and tooltips, which checks each one controls, how to set them, and how to choose a policy.
last_updated: '2026-11-15'
related_articles:
  - how-anti-cheat-works
  - the-anti-cheat-checks
  - reading-anti-cheat-logs-and-bans
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [server owners choosing a policy](#choosing-a-policy) | [server owners setting an option](#how-to-set-them) | [the table of all ten](#the-ten-options)

:::callout[The 1-minute version]{kind=key}
- There are ten options, one per group of checks. Each takes a number: 1 ban, 2 kick, 3 log, 4 disabled.
- Eight options default to 2 (kick). `AntiCheatNoClip` and `AntiCheatPacketException` default to 4 (disabled).
- On a new or modded server, set the options you want to try to 3 (log) first, read the log, and move to 2 (kick) when the log shows no honest players tripping a check.
- Log still drops the packet that a check rejects. Only 4 (disabled) lets it through, except for the `Capability` check, which drops its packets at every setting.
- You can set the options in the server's ini file, with `/changeoption`, or in the admin panel's server options list. `/reloadoptions` applies a change to every client and resets every counter.
- The game's tooltips for these options all begin "Disables ...", even though the option is a choice of four.
:::

:::facts
- **Options** 10, all with values 1 to 4
- **Default 2 (kick)** 8 options
- **Default 4 (disabled)** 2 options: `AntiCheatNoClip`, `AntiCheatPacketException`
- **Who may change them** a role with `ChangeAndReloadServerOptions`
- **Counter cooldown** 150 seconds (2.5 minutes), the same for every option
:::

## The ten options

Each option decides what the server does when one of its checks trips, and all ten share the same four values.

All ten are enum options with four values. :cite[(`ServerOptions.java:203-212`)] The game's English labels for the values are "ban", "kick", "log" and "disabled", and the game has no display name for an option beyond its key. :cite[(`UI.json:1822-1825`)]

| Option | Default | Checks it controls | Tooltip in the game | Code |
|---|---|---|---|---|
| `AntiCheatSafety` | 2 kick | Safety | "Disables safety system anti-cheat protection." | `ServerOptions.java:203`, `UI.json:1812` |
| `AntiCheatSpeed` | 2 kick | Speed | "Disables character speed anti-cheat protection." | `ServerOptions.java:204`, `UI.json:1813` |
| `AntiCheatNoClip` | 4 disabled | NoClip | "Disables character no-clipping anti-cheat protection." | `ServerOptions.java:205`, `UI.json:1814` |
| `AntiCheatHit` | 2 kick | HitVehicle, HitLongDistance, HitShortDistance, HitWeapon | "Disables character hit anti-cheat protection." | `ServerOptions.java:206`, `UI.json:1815` |
| `AntiCheatPacketException` | 4 disabled | PacketRakNet, PacketException, PacketType | "Disables packet exception checks anti-cheat protection." | `ServerOptions.java:207`, `UI.json:1816` |
| `AntiCheatPermission` | 2 kick | Power, Capability | "Disables player permissions anti-cheat protection." | `ServerOptions.java:208`, `UI.json:1817` |
| `AntiCheatXP` | 2 kick | XPUpdate | "Disables player XP anti-cheat protection." | `ServerOptions.java:209`, `UI.json:1818` |
| `AntiCheatSafeHouse` | 2 kick | SafeHouseOwner, SafeHouseMember, SafeHousePlayer | "Disables safehouse anti-cheat protection." | `ServerOptions.java:210`, `UI.json:1819` |
| `AntiCheatPlayer` | 2 kick | Target, PlayerUpdate, VehicleEnter | "Disables player anti-cheat protection." | `ServerOptions.java:211`, `UI.json:1820` |
| `AntiCheatChecksum` | 2 kick | ChecksumUpdate | "Disables checksum anti-cheat protection." | `ServerOptions.java:212`, `UI.json:1821` |

The check-to-option pairing comes from the list of checks. :cite[(`AntiCheat.java:29-49`)] What each check tests, its counter limit and its reason text are on [the checks page](/pz/build-42/engine/anti-cheat/the-anti-cheat-checks). The published [ini-file options page](/pz/build-42/server/server-options/server-options-only-in-the-ini-file) lists the same ten with their defaults, and [the options directory](/pz/build-42/server/server-options/server-options-directory) places them among all server options.

## What the four values do

The value is the whole policy for that group, so changing it changes what every check in the group does.

:::chips
- 1 ban
- 2 kick
- 3 log
- 4 disabled
:::

At 4 the check does not run and writes nothing, except that `Capability` still drops a packet from a sender whose role lacks the capability. :cite[(`PacketTypes.java:306-316`)] At 1, 2 and 3 the check runs, drops what it rejects, counts, and writes a log line. At 2 the player is kicked when a counter reaches its limit, and at 1 the player is banned. :cite[(`AntiCheat.java:78-98`, `AntiCheat.java:136-153`)] [How the anti-cheat works](/pz/build-42/engine/anti-cheat/how-anti-cheat-works) covers the counter, its cooldown and the exemptions.

A hosted game ignores all ten options unless the host was started with the anti-cheat switch, and a server run in debug mode counts and logs but never kicks or bans. :cite[(`AntiCheat.java:78-80`, `AntiCheat.java:139-150`)]

## Choosing a policy

Start by watching, then kick, and ban only where you have watched long enough to trust the check.

On a new or modded server, set the groups you want to try to 3 (log). A trip then writes a log line and still drops the packet, but nobody is removed, so you learn which checks your players and mods trigger. :cite[(`AntiCheat.java:116-153`)] [Reading the logs and bans](/pz/build-42/engine/anti-cheat/reading-anti-cheat-logs-and-bans) shows how to read those lines and where they go.

Move a group to 2 (kick) when the log shows no honest player tripping it. A kick is easy to undo: the player can rejoin. Kick is also the safer choice on a laggy server for the groups whose checks compare positions, speed and distances, because lag can trip them. :cite[(`AntiCheatSpeed.java:21-46`, `AntiCheatHitLongDistance.java:18-27`)] That is reasoning from what the checks compare, not something the game states.

Choose 1 (ban) only for a group that you have watched in log or kick mode with no honest trips.

A ban sets the player's role to `banned`. In Steam mode it also records the Steam ID. Lifting it takes an admin. :cite[(`ServerWorldDatabase.java:1472-1498`, `AntiCheat.java:171-188`)]

Which groups to ban on is your call. From the code, `AntiCheatPermission` and `AntiCheatSafeHouse` compare a packet with who sent it, so an honest trip needs a stale safehouse list or a custom role that lacks a capability which a mod's menu still offers (read from the code, not observed). :cite[(`ServerOptions.java:208`, `ServerOptions.java:210`, `PacketTypes.java:304-316`)]

Leave the two default-disabled options alone until you have watched them. `AntiCheatNoClip` compares positions, and `AntiCheatPacketException` can count a handler bug as the player's fault. Setting either to 3 first shows what it would do. :cite[(`AntiCheatNoClip.java:56-160`, `GameServer.java:1634-1642`)]

## How to set them

You can set an option in the ini file, with a chat command, or in the admin panel, and changing one needs the `ChangeAndReloadServerOptions` capability unless you edit the file yourself.

In the ini file the line is the key, an equals sign and the number, for example `AntiCheatHit=3`. The server reads the file from the `Server` folder of its cache folder when it starts and when `/reloadoptions` runs. :cite[(`ServerOptions.java:262-286`, `ReloadOptionsCommand.java:38-46`)] The published page for [ini-only options](/pz/build-42/server/server-options/server-options-only-in-the-ini-file) says these options are on no page of the pre-game settings screen.

With a command, `/changeoption AntiCheatHit 3` changes the value and saves the ini file, and `/reloadoptions` re-reads the file and sends the options to every client. Both need `ChangeAndReloadServerOptions`, which the default `admin` role holds and the default `moderator` role does not. :cite[(`ChangeOptionCommand.java:20-45`, `ServerOptions.java:370-380`, `ReloadOptionsCommand.java:15-35`, `Roles.java:453-466`)] A change made with `/changeoption` should apply to the next packet, since the checks read the option each time (read from the code, not run in a game). :cite[(`ServerOptions.java:370-380`, `AntiCheat.java:78-80`)]

In the admin panel, "See Server Options" opens a list with a filter box. The ten options are in it, because only a few options are hidden from that list. :cite[(`ISAdminPanelUI.lua:53`, `ISServerOptions.lua:127-148`, `ServerOptions.java:225-235`)] Select the option and press "Change", then pick one of ban, kick, log or disabled.

The change is sent as `/changeoption` and "Apply Changes" sends `/reloadoptions`. :cite[(`ServerOptions.java:575-592`, `ISServerOptions.lua:179-191`, `ISServerOptions.lua:218-221`, `ISServerOptionsChange.lua:64-70`)] The game's tooltip for "Apply Changes" says it reloads the options for all clients, and that otherwise you need to restart the server or run `/reloadoptions`. :cite[(`IG_UI.json:838-839`)]

Reloading the options also sets every connection's counters back to 0. :cite[(`GameServer.java:1959-1966`)]

## Options near these

A few options outside the ten change what a check judges or where its lines go.

`SpeedLimit` is the speed limit the Speed check applies to vehicles, and `DoLuaChecksum` decides whether the checksum check applies at all. `PVP` and `SafetySystem` feed the Safety check's reasons. :cite[(`AntiCheatSpeed.java:30-37`, `LoginPacket.java:173-175`, `AntiCheatSafety.java:35-45`)] The published pages cover [SpeedLimit](/pz/build-42/server/server-options/server-options-chat-voice-and-connections) and [PVP and safehouses](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions).

`BadWordPolicy` uses the same ban, kick and log steps, with the same labels, but with no counter: it acts as soon as it finds a bad word. :cite[(`ChatServer.java:184-195`)] Anti-cheat log lines also go to the Discord log channel when Discord is enabled, and to the webhook address when one is set. :cite[(`AntiCheat.java:108-114`, `GameServer.java:1588-1603`)]

:::callout[How we know]{kind=proof}
The options, defaults and values are read from the option list in ServerOptions.java, the labels and tooltips from the English translation files, and the admin panel steps from the vanilla Lua files and the command classes. The advice in "Choosing a policy" is judgment from how the checks work, and the game does not state it. Not run in a game: setting an option in the admin panel, the change command taking effect on the next packet, and the exact location of the cache folder on your machine.
:::
