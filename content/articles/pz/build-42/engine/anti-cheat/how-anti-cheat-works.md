---
id: build-42-how-anti-cheat-works
slug: how-anti-cheat-works
title: 'How the anti-cheat works'
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
  What the Build 42.22 server's anti-cheat does when a check trips: the four policies, the counter and its cooldown, who is exempt, debug mode and hosted games, and what a kicked or banned player sees.
last_updated: '2026-11-15'
related_articles:
  - the-anti-cheat-checks
  - anti-cheat-server-options
  - reading-anti-cheat-logs-and-bans
  - the-packet-system
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [server owners](#the-four-policies) | [players](#what-a-player-sees) | modders should read [the packet system](/pz/build-42/engine/networking-and-packets/the-packet-system) and then the other pages in this series

:::callout[The 1-minute version]{kind=key}
- The anti-cheat runs only on a server. A client never runs a check on itself.
- Ten server options set what each group of checks does. Each takes 1 Ban, 2 Kick, 3 Log or 4 Disabled.
- `AntiCheatNoClip` and `AntiCheatPacketException` default to Disabled. The other eight options default to Kick.
- Every check keeps a counter for each connected player. A Kick or Ban happens when the counter reaches that check's limit, and each counter goes down by 1 every 2.5 minutes.
- A packet that a check rejects is dropped under Ban, Kick and Log, and only Disabled lets it through. The exception is `Capability`, whose packets are dropped at every setting.
- A player whose role holds `CantBeKickedByAnticheat` is not counted, kicked or banned by it.
- In debug mode the checks still write their log line but never kick or ban. In a hosted game they do nothing unless the host was started with the anti-cheat switch.
:::

:::facts
- **Checks** 20, each with one option and one counter limit
- **Options** 10, values 1 Ban, 2 Kick, 3 Log, 4 Disabled
- **Counter limit** 1, 2 or 4 trips, set per check
- **Counter cooldown** 1 point every 150 seconds (2.5 minutes)
- **Where it runs** the server only
:::

## What the anti-cheat is

The anti-cheat is a set of server-side tests on what players send, with a counter for each test and a policy that says what to do when the counter is full.

Each test is one entry in the `AntiCheat` list. The list holds 20 real checks and one placeholder named `None`, and each real check names the server option that controls it and the number of trips that counts as enough. :cite[(`AntiCheat.java:29-49`)] The test runs only in server code, so a client never judges itself. :cite[(`AntiCheat.java:82-83`)]

Some tests look at one packet that a player sent. Three do not wait for a packet: `ChecksumUpdate`, `PlayerUpdate` and `XPUpdate` run on a timer for every connection and fail when something has not happened or has grown too fast. :cite[(`AntiCheat.java:100-106`, `AntiCheatChecksumUpdate.java:23-26`, `AntiCheatPlayerUpdate.java:13-24`, `AntiCheatXPUpdate.java:104-118`)] [The checks](/pz/build-42/engine/anti-cheat/the-anti-cheat-checks) lists all 20 with what each one tests.

## From a packet to a decision

A check can only act after the packet has been received and parsed, and it ends in one of three results: pass, drop, or drop and punish.

:::flow[One packet through one check]
- A player's packet reaches the server and is parsed
- Its type lists the checks to run, and each enabled check tests it
- A check that objects makes the server drop the packet
- The check's counter for this player goes up by 1 and a line is logged
- At the counter limit the server kicks or bans, if the policy says so
:::

A packet type that carries a list of checks runs them after the consistency test and before its handler. A rejected packet writes a warning and never reaches the handler. :cite[(`PacketTypes.java:766-786`)] The full order of steps is on [the packet system](/pz/build-42/engine/networking-and-packets/the-packet-system).

A check passes a packet when its option is Disabled, and drops it when it is enabled and finds a fault. The `Capability` check is the exception: the server drops a packet whose sender lacks the capability at every setting. :cite[(`PacketTypes.java:306-316`)] :cite[(`AntiCheat.java:78-98`)] That includes the Log policy: Log changes what happens to the player, not to the packet.

Some faults are dropped without any counting. A check can return an empty reason, and the server then drops the packet and writes a line that ends in "skip" without raising the counter. :cite[(`AntiCheat.java:86-91`)] The safety check does this, for example, when the wielder is in a non-PvP zone. :cite[(`AntiCheatSafety.java:46-50`)]

## The four policies

A policy is the value of a check's option, and it decides what the server does once a counter is full.

:::chips
- 1 Ban
- 2 Kick
- 3 Log
- 4 Disabled
:::

The game labels the four values "ban", "kick", "log" and "disabled". :cite[(`UI.json:1822-1825`)] A check whose option is 4 does nothing at all. For any other value the check runs, writes its log line and counts. :cite[(`AntiCheat.java:78-80`)]

Kick and Ban act only when the counter reaches the check's limit. Kick sends the player a message and disconnects the connection. Ban does the same after it writes the ban, as [reading the logs and bans](/pz/build-42/engine/anti-cheat/reading-anti-cheat-logs-and-bans) explains. :cite[(`AntiCheat.java:136-153`, `AntiCheat.java:163-188`)]

Log never kicks and never bans. The counter still rises, so the log can show a counter above the limit, and the line names the action as "Log". :cite[(`AntiCheat.java:116-130`, `AntiCheat.java:191-206`)] Because a rejected packet is still dropped under Log, a server in Log mode loses the packets that an honest player's lag spoils, but it does not lose the player.

[Which option controls which checks](/pz/build-42/engine/anti-cheat/anti-cheat-server-options) and how to pick a policy are on the options page.

## The counter and the cooldown

Each connection has one counter per check, and a check punishes a player only when that counter reaches its limit.

The counters live in a `SuspiciousActivity` object that belongs to the connection, so a new connection starts at 0. Each trip adds 1. :cite[(`SuspiciousActivity.java:41-47`, `UdpConnection.java:93`)] The limit is 1 for 11 checks, 2 for 6 checks and 4 for 3 checks, and the checks page gives each one. :cite[(`AntiCheat.java:29-49`)]

With a limit of 1, a single trip of that check kicks or bans. With a limit of 4, it takes four trips. Counters are kept per check, not per option, so the four hit checks each count on their own. :cite[(`AntiCheat.java:29-49`)]

The cooldown lowers every counter above 0 by 1 once every 150 000 milliseconds, which is 150 seconds or 2.5 minutes, and it writes a log line with the reason "cooldown" for each counter it lowers. :cite[(`SuspiciousActivity.java:17-39`)] A counter does not go below 0.

Two other events set the counters back to 0: a new connection, and a reload of the server options, which runs `resetCounters` for every connection. :cite[(`GameServer.java:1959-1966`, `ReloadOptionsCommand.java:38-46`)]

The cooldown is there so that an occasional lag spike does not add up over a long session. A policy of Kick with a limit of 4 still removes a player whose connection trips that check four times.

## Who is exempt

A role can hold two capabilities that keep the anti-cheat from punishing its players.

`CantBeKickedByAnticheat` makes the whole counting step do nothing for that player: no counter, no log line, no kick and no ban. `CantBeBannedByAnticheat` is read only when a ban is about to happen. A role that has `CantBeBannedByAnticheat` alone is still counted and logged. Under Kick it is kicked, and under Ban nothing happens to it. :cite[(`AntiCheat.java:136-138`, `AntiCheat.java:163-165`, `AntiCheat.java:171-173`)]

Of the default roles, `observer`, `gm`, `moderator` and `admin` hold both capabilities. `banned`, `user` and `priority` hold neither. :cite[(`Roles.java:363-384`, `Roles.java:385-452`, `Roles.java:453-482`)] A custom role has whatever you give it; see [server roles and capabilities](/pz/build-42/server/roles-and-access/server-roles-and-capabilities).

Some checks add their own role exemption for one kind of packet, such as the speed check for roles that can teleport and the safehouse checks for roles that can set up safehouses. [The checks page](/pz/build-42/engine/anti-cheat/the-anti-cheat-checks) names them.

An exempt role is only spared the counting, kick and ban. The rejected packet is still dropped and the "skip" lines are still written, and the `NoClip` check still sends the player back to the last position the server knew. :cite[(`AntiCheat.java:86-94`, `AntiCheatNoClip.java:43-52`)]

A player must also be fully connected for a counter to move. The server marks a connection fully connected once the player has joined, and the counting step does nothing before that. :cite[(`AntiCheat.java:137`, `GameServer.java:2886`)]

## Debug mode and hosted games

Debug mode keeps the tests but removes the punishment, and a hosted game keeps the tests off unless it is told otherwise.

In debug mode the server still counts and writes its log line, but it never writes the userlog entry and never kicks or bans. :cite[(`AntiCheat.java:139-150`)] The server's `Core.debug` flag is set when the server runs with the `debug` system property. :cite[(`GameServer.java:494-497`)] Not run in a game.

In a hosted (co-op) game the checks are off unless the game was launched with `-anti-cheats`, which sets the `Core.antiCheats` flag. :cite[(`MainScreenState.java:240-241`)] If the flag is set, the start command for a hosted server adds `-anti-cheats`, and the server turns that argument back into the flag. :cite[(`AntiCheat.java:78-80`, `CoopMaster.java:110-114`, `GameServer.java:443-446`)] Not run in a game.

On a dedicated server `GameServer.coop` is false, so the option values alone decide. :cite[(`AntiCheat.java:79`, `GameServer.java:256`)]

## What a player sees

The player gets a message built from translation keys, and the connection closes.

A kick shows "You have been kicked from this server." and the policy message for a ban is "You have been banned from this server." Both add "Malformed packet or suspicious activity was detected." :cite[(`UI.json:1108-1112`, `AntiCheat.java:163-188`)]

The ban code first sends the plain text "You were banned" and disconnects the connection, and only then sends the policy message. :cite[(`BanSystem.java:43-47`, `BanSystem.java:71-80`, `AntiCheat.java:171-188`)] Which of the two a client shows was not run in a game.

The client puts the message in chat if the player is already in the game, and raises the connect-failed event with it if the player is not. :cite[(`KickedPacket.java:55-78`)] Nothing in the message says which check tripped. The check, its option and the reason go to the server's log, and [reading the logs and bans](/pz/build-42/engine/anti-cheat/reading-anti-cheat-logs-and-bans) shows where.

A banned player is turned away at the next login. The ban sets the player's role to `banned`, which has no login capability, and the login step answers "Banned", which the client shows as "You are banned from this server". :cite[(`ServerWorldDatabase.java:1472-1498`, `Roles.java:363-368`, `LoginPacket.java:224-231`, `AccessDeniedPacket.java:47`, `UI.json:1090-1091`)]

## What the checks leave to other code

The checks cover the packet types that list them and a few timers, and not the whole protocol.

For the rest, the server relies on each packet's own handler, and on mods, to check what the sender asks for. [What the anti-cheat does not cover](/pz/build-42/engine/anti-cheat/what-anti-cheat-does-not-cover) gives the server owner's side of this, and [the anti-cheat and mods](/pz/build-42/engine/anti-cheat/anti-cheat-and-mods) gives the modder's. :cite[(`PacketTypes.java:773-783`)]

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java in `zombie/network/anticheats/`, `PacketTypes.java`, `GameServer.java`, `Roles.java`, `KickedPacket.java` and `LoginPacket.java`, and from the English translation file. The cooldown is converted from milliseconds to seconds and minutes by hand (150 000 / 1 000 = 150 seconds, 150 / 60 = 2.5 minutes). Not run in a game: the debug property, the hosted-game flag, what a kicked client's screen looks like, and the exact moment a counter is lowered (the timer is checked in the server's update loop, so the interval is about 150 seconds, not exact).
:::
