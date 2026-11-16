---
id: build-42-reading-anti-cheat-logs-and-bans
slug: reading-anti-cheat-logs-and-bans
title: 'Reading anti-cheat logs and bans'
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
  How to read a Build 42.22 anti-cheat log line, where lines are written, what the userlog keeps, how to find a player's history, how anti-cheat bans are stored and how an admin lifts one.
last_updated: '2026-11-15'
related_articles:
  - how-anti-cheat-works
  - the-anti-cheat-checks
  - anti-cheat-server-options
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [server owners reading a line](#the-log-line-field-by-field) | [admins looking up a player](#finding-one-players-history) | [admins lifting a ban](#lifting-a-ban)

:::callout[The 1-minute version]{kind=key}
- A trip writes one line when its option is not Disabled, the player's role is not exempt and the connection is fully connected. The same text goes to the server's debug log, a `user` log file, the in-game admin chat, and Discord or a webhook if you set them up.
- The line names the check, the player, the option, the reason, the counter against its limit, the action the option sets and the player's ping.
- The "action" in the line is the option's policy. It does not prove that anything happened: in Log mode, in debug mode and below the limit the player is not removed.
- Lines that end in "skip" or whose reason is "cooldown" do not count a trip. "update failed" is what the three timer checks write.
- The userlog is a table in the server database that an admin reads in the admin panel with a role that holds `ReadUserLog`. It keeps one row per player, type, reason and option, with a count.
- An anti-cheat ban sets the player's role to `banned` and, in Steam mode, adds the Steam ID. Unbanning sets the role back to the default `user` role.
:::

:::facts
- **Places a line goes** 4: the debug log, the `user` log, admin chat, Discord or webhook
- **Fields in a line** 7
- **Userlog types** 8, of which the anti-cheat writes 4
- **Userlog write limit** 1 `SuspiciousActivity` row per second per connection
- **Cooldown line** one for each counter above 0, every 150 seconds (2.5 minutes)
:::

## Where each line goes

One call writes the line to four places, and each place suits a different job.

The call adds the player's last ping to the message and sends it to the `Multiplayer` debug channel as a warning, to the `user` logger, to the admin chat and to the event manager. :cite[(`AntiCheat.java:108-114`)] The table says what each place is. A plain file path is the game's cache folder plus `Logs`. :cite[(`LoggerManager.java:78-83`)]

| Place | What you get | Code |
|---|---|---|
| Debug log | The line with a "WARN : Multiplayer" prefix, in the server's `DebugLog-server` file | `AntiCheat.java:110`, `DebugLog.java:259-262`, `DebugLog.java:139-150` |
| `user` log | The line with a time stamp, in a file named from the server start time and `user` | `AntiCheat.java:111`, `LoggerManager.java:85-97`, `ZLogger.java:62-76` |
| Admin chat | The line as a message to every player whose role holds `AdminChat`, live | `AntiCheat.java:112`, `ChatServer.java:140-143` |
| Discord or webhook | The line in the Discord log channel, and in the webhook if an address is set | `AntiCheat.java:113`, `GameServer.java:1588-1603`, `DiscordBot.java:38-45` |

On start the server moves the files from the earlier session into a folder named `logs_` and a time stamp inside `Logs`, so an old session's lines are in that folder. :cite[(`LoggerManager.java:42-64`)] Not run in a game: whether the `Multiplayer` channel's warnings reach the debug log at the default log level.

A kick also leaves a line in the `connections` log, with the event "kick" and the message `UI_ValidationFailed`. :cite[(`GameServer.java:3311-3314`, `ConnectionManager.java:173-179`)]

## The log line, field by field

The line has seven fields, always in the same order, and the last one is added by the log call.

:::chips
- Anti-cheat
- connection
- server-option
- reason
- counter
- action
- ping
:::

The text is built from this pattern: `Anti-cheat="<check>" is triggered for connection="<player>" server-option="<option>" reason="<text>" counter=<n>/<limit> action="<policy>"`, followed by ` ping=<ms>`. :cite[(`AntiCheat.java:108-130`)]

| Field | What it holds | Code |
|---|---|---|
| `Anti-cheat` | The name of the check, as on [the checks page](/pz/build-42/engine/anti-cheat/the-anti-cheat-checks) | `AntiCheat.java:120-121` |
| `connection` | The user name on the connection | `AntiCheat.java:122` |
| `server-option` | The key of the option that controls the check, which is the option to change | `AntiCheat.java:123`, `AntiCheat.java:29-49` |
| `reason` | For a packet check, the packet's class name, a colon and the check's text. For a timer check, "update failed" | `AntiCheat.java:87-95`, `AntiCheat.java:100-106`, `AntiCheat.java:119-121` |
| `counter` | The player's counter for this check after the trip, a slash and the check's limit | `AntiCheat.java:125-126`, `SuspiciousActivity.java:41-47` |
| `action` | The policy name of the option: Ban, Kick or Log | `AntiCheat.java:120-127`, `AntiCheat.java:191-206` |
| `ping` | The connection's last ping in milliseconds | `AntiCheat.java:108-110` |

The check writes the line only when its option is not Disabled. :cite[(`AntiCheat.java:116-118`)]

## A worked example

One line, read left to right, tells you which player, which rule and how close the player is to a kick.

This line is an invented example in the real format, as it would appear in the user log, where the log adds a time stamp in front and a period at the end. :cite[(`ZLogger.java:62-76`)]

```
[15-11-26 14:03:22.417] Anti-cheat="Target" is triggered for connection="Rivka" server-option="AntiCheatPlayer" reason="ZombieHitPlayerPacket: invalid target" counter=1/2 action="Kick" ping=38.
```

Read it field by field:

- `Anti-cheat="Target"` is the check named `Target`.
- `connection="Rivka"` is the account that sent the packet.
- `server-option="AntiCheatPlayer"` is the option to open if you want a different policy for this check.
- `reason="ZombieHitPlayerPacket: invalid target"` says the packet was a zombie-hits-player packet and the check's text is "invalid target".
- `counter=1/2` says this was the first trip against a limit of 2. A second trip kicks, if the option stays at Kick.
- `action="Kick"` is the option's value. Nothing has happened to the player yet.
- `ping=38` is the ping in milliseconds, which helps you judge whether lag could explain the line.

The packet itself was dropped. If the player trips the check again before the counter has gone down, the next line reads `counter=2/2`, and the server then kicks. :cite[(`AntiCheat.java:136-153`)]

## Other lines you will see

Some lines have the same format with a different reason, and some lines are not anti-cheat checks at all.

- **`<Packet>: skip`:** the check dropped the packet and did not count it. The counter shown is the player's current value. :cite[(`AntiCheat.java:87-91`)]
- **`cooldown`:** the counter was lowered by 1, and the line shows the new value. It appears once for each counter above 0 every 150 seconds, so a busy log holds many of them. :cite[(`SuspiciousActivity.java:24-39`)]
- **`update failed`:** a timer check failed. It has no packet name. :cite[(`AntiCheat.java:100-106`)]
- **`<Packet>: no capability`:** a player sent a packet that the role may not send. :cite[(`PacketTypes.java:314-316`)]
- **`incorrect checksum`:** the checksum check found different Lua, script or animation files. The line always shows `counter=1/1`, and the letters Lua, Script or Anim come before the words. :cite[(`ChecksumPacket.java:252-271`)]
- **`ping:` lines:** the server also uses the same log call, with no check name, when it refuses or removes a player for a ping that is too high. :cite[(`PingManager.java:55-62`, `LoginPacket.java:190-197`)]

In debug mode the lines are still written, and the `action` still says Kick or Ban, but nothing is done to the player. :cite[(`AntiCheat.java:120-127`, `AntiCheat.java:139-150`)]

## The userlog

The userlog is a table of what the server has recorded about each player, and the anti-cheat adds rows to it.

The table is `userlog` in the server's database, which is the file named after the server in the `db` folder of the cache folder. Each row holds a user name, a type, a text, who issued it, an amount and the time of the last update. :cite[(`ServerWorldDatabase.java:410-415`, `ServerWorldDatabase.java:635-645`, `Userlog.java:13-20`)]

There are eight types: `AdminLog`, `Kicked`, `Banned`, `DupeItem`, `LuaChecksum`, `WarningPoint`, `UnauthorizedPacket` and `SuspiciousActivity`. :cite[(`Userlog.java:80-92`)] The anti-cheat writes four of them:

:::chips
- SuspiciousActivity
- Kicked
- Banned
- LuaChecksum
:::

A trip writes a `SuspiciousActivity` row, with the reason as the text and the option key as "issued by". It does so at most once a second for each connection, and never in debug mode. :cite[(`AntiCheat.java:139-141`, `AntiCheat.java:155-161`)] A kick writes a `Kicked` row and a ban writes a `Banned` row in the same way. :cite[(`AntiCheat.java:163-181`)]

The `Banned` type is written twice for one anti-cheat ban: once by the ban step with the reason as text, and once by the ban system with the option key as text and "System" as the issuer. :cite[(`AntiCheat.java:171-173`, `BanSystem.java:43`)]

A checksum mismatch writes a `LuaChecksum` row whether or not `AntiCheatChecksum` is enabled. :cite[(`ChecksumPacket.java:252-271`)]

A new row is added only when no row has the same user, type, text and issuer. If one exists, its amount goes up by 1 and its time is updated, which is why a reason with a distance or speed in it makes a new row each time. :cite[(`ServerWorldDatabase.java:1383-1437`)] `LuaChecksum` and `DupeItem` rows are kept as one row per user and type, with the newest text. :cite[(`ServerWorldDatabase.java:1386-1432`)]

## Finding one player's history

An admin finds a player's history in the admin panel, and the log files answer the question of what happened around it.

1. In the admin panel's users list, each player shows "Suspicion points: N", which is the sum of the amounts of that player's `SuspiciousActivity` rows. :cite[(`ISUsersList.lua:237-254`, `ServerWorldDatabase.java:140-150`)]
2. Right-click the player and choose "See User Log". The window lists each row with its type, who issued it, the amount and the reason. :cite[(`ISUsersList.lua:392-397`, `ISPlayerStatsUserlogUI.lua:44-47`)]
3. For a player who is online, choose "See Suspicion Activity". It shows the player's current counters, one per check, which the cooldown keeps lowering. :cite[(`ISUsersList.lua:398-403`, `RequestUserLogPacket.java:118-130`)]
4. In the log files, search for the player's name inside quotation marks after `connection=` to see every line for that player.

Your role must hold `ReadUserLog` for steps 2 and 3. Of the default roles, `moderator` and `admin` hold it, because they take every capability that is not removed from them. :cite[(`ISUsersList.lua:587-591`, `Roles.java:453-482`)] The same window can add a log row with `AddUserlog` and remove one with `WorkWithUserlog`, after it asks "Are you sure you want to remove this log?". :cite[(`ISPlayerStatsUserlogUI.lua:119-153`, `RemoveUserlogPacket.java:24-30`)]

## How an anti-cheat ban is stored

An anti-cheat ban is stored as a role and, in Steam mode, as a Steam ID, and never as an IP ban.

The ban step calls the ban system for the user name, with the option key as the reason, and then for the Steam ID, in Steam mode only. :cite[(`AntiCheat.java:171-188`)]

- **By name:** the player's row in the whitelist table gets the role `banned`. If the player has no row, the server adds one with that role and a placeholder password. :cite[(`ServerWorldDatabase.java:1472-1498`)]
- **By Steam ID:** the ID goes into the `bannedid` table with the reason, and every whitelist account with that Steam ID gets the `banned` role as well. :cite[(`ServerWorldDatabase.java:1569-1588`, `BanSystem.java:82-117`)]
- **In the admin log:** the ban writes a line such as "System banned user" followed by the user name and the option key with no space between them. :cite[(`BanSystem.java:43-46`)]

The player is turned away at login. A player banned by name is answered "Banned", which the client shows as "You are banned from this server". When a ban record stores a reason, the answer is "BannedReason##" and the reason, shown as "You are banned from this server. Reason: ...". :cite[(`LoginPacket.java:224-231`, `ServerWorldDatabase.java:1085-1091`, `UI.json:1090-1091`)]

A Steam ID in the ban table is refused earlier, when Steam asks the server whether to accept the connection. What that player sees on screen is not verified. :cite[(`SteamUtils.java:222-225`, `ServerWorldDatabase.java:1152-1170`)]

## Lifting a ban

An admin with `BanUnbanUser` lifts an anti-cheat ban by name, and by Steam ID as well in Steam mode.

1. In the users list, a banned player's right-click menu shows "Unban" instead of "Ban". Choose it. In chat or the server console, `/unbanuser "name"` does the same. :cite[(`ISUsersList.lua:510-514`, `UnbanUserCommand.java:25-33`)]
2. In Steam mode, open the "Banned SteamIDs" list from the users list, select the ID, press "Unban" and confirm. In chat, `/unbanid <SteamID>` does the same. :cite[(`ISUsersList.lua:336-343`, `ISBannedSteamIDViewer.lua:66-67`, `UnbanSteamIDCommand.java:25-39`)]
3. Give the player back any custom role. Unbanning sets the role to the default `user` role, not to the role the player had before. :cite[(`ServerWorldDatabase.java:1491-1498`)]

Unbanning by name also removes, in Steam mode, the Steam ID ban recorded for that account. :cite[(`BanSystem.java:47-62`)] The userlog rows stay until an admin removes them. :cite[(`ServerWorldDatabase.java:398-401`)]

:::callout[How we know]{kind=proof}
Everything above is read from `AntiCheat.java`, `SuspiciousActivity.java`, `BanSystem.java`, `ServerWorldDatabase.java`, `Userlog.java`, the log classes, the command classes, the vanilla Lua for the admin panel and the English translation files. The line in the worked example is invented to show the format, and its player name is made up.

Not run in a game: what each log file looks like on disk, whether the `Multiplayer` warnings are written at the default log level, the order in which a banned client sees its two messages, and the admin panel steps.
:::
