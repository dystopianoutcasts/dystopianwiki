---
slug: reading-the-servers-numbers
title: Reading the server's numbers
game: pz
version: build-42
section: server
category: getting-started
difficulty: beginner
tags:
  - server
  - statistics
  - admin
  - logs
excerpt: 'Where a Build 42.22 server keeps its numbers: the statistics period, who may see the statistics, the /stats command, and the perk and action logs. What the numbers mean is in our separate article.'
last_updated: '2026-11-15'
related_articles:
  - running-a-server
  - reading-server-performance-numbers-honestly
  - admin-commands
  - server-options-directory
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, when your server feels slow, you will want numbers. This page says where the server keeps them and who may see them. What each number really means is a different story, and a surprising one: read [Reading server performance numbers honestly](/pz/build-42/modding/multiplayer/reading-server-performance-numbers-honestly) before you act on any of them. We do not repeat it here.

:::callout[The 1-minute version]{kind=key}
- The server option `MultiplayerStatisticsPeriod` sets how often the statistics update, in seconds. The default is 1, and 0 stops the update.
- Only a player whose role has the `GetStatistic` capability, and whose connection has statistics enabled, is sent them. Of the built-in roles, `moderator` and `admin` have it.
- `/stats` needs the same capability. `/stats list` lists the statistics and `/stats <statistic> all` prints one statistic's values.
- `/players` lists who is connected. `/connections` would list every connection, but it is switched off in this build.
- `PerkLogs` is on by default. `ClientActionLogs` names the timed actions that are logged, and by default the list names `ISEnterVehicle`, `ISExitVehicle` and `ISTakeEngineParts`.
- Both logs are written because each player's game sends the line to the server. Nothing here was tested on a live server.
:::

:::facts
- **Statistics period** 1 second by default (the option takes 0 to 10); 0 stops the update
- **Who sees them** roles with `GetStatistic`: `moderator` and `admin`
- **Who is on** `/players`, needs `SeePlayersConnected`
- **Perk log** `PerkLogs`, on by default
- **Action log** `ClientActionLogs`, by default `ISEnterVehicle`, `ISExitVehicle` and `ISTakeEngineParts`
:::

## 1. The statistics

The server updates its statistics once per period, and sends them only to players whose role has the `GetStatistic` capability.

- **How often.** The server option [MultiplayerStatisticsPeriod](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#multiplayerstatisticsperiod) is the statistics period in seconds: the code multiplies it by 1,000 to get milliseconds, and when the result is 0 it does not update them. :cite[(`zombie/network/statistics/StatisticManager.java:146-150`)] The option takes 0 to 10, and the default is 1. :cite[(`zombie/network/ServerOptions.java:213`)]
- **Who sees them.** Each period, the server sends the statistics only to players whose role has the [GetStatistic](/pz/build-42/server/roles-and-access/where-each-capability-is-checked#getstatistic) capability and whose connection has statistics enabled. :cite[(`zombie/network/statistics/StatisticManager.java:188-192`)] A packet from the player's game flips that setting each time it arrives. :cite[(`zombie/network/packets/service/StatisticsPacket.java:52-54`)] The statistics button in the admin panel is enabled by the same capability. :cite[(`media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua:230`)]
- **Which roles.** The `moderator` and `admin` roles are built with every capability, and the moderator then loses eight, none of them `GetStatistic`. :cite[(`zombie/characters/Roles.java:453-480`)]
- **From the console or chat.** [/stats](/pz/build-42/server/admin-commands/admin-commands#stats) needs the same capability. :cite[(`zombie/commands/serverCommands/StatisticsCommand.java:32-34`)] `/stats list` lists the statistics, `/stats version` prints the game version, `/stats <statistic> list` lists one statistic's counters, `/stats <statistic> all` prints all of its values, and `/stats <statistic> <counter>` prints one. Anything else prints the help text again. :cite[(`zombie/commands/serverCommands/StatisticsCommand.java:41-73`)]

## 2. Who is on

The command for who is connected is `/players`, and the one that would show every connection is switched off.

[/players](/pz/build-42/server/admin-commands/admin-commands#players) needs the `SeePlayersConnected` capability and lists the connected players. :cite[(`zombie/commands/serverCommands/PlayersCommand.java:26-28`, `zombie/commands/serverCommands/PlayersCommand.java:35-60`)] `/connections` would list every connection :cite[(`zombie/commands/serverCommands/ConnectionsCommand.java:39-56`)], but it carries the `@DisabledCommand` marker, and the server skips marked commands when it looks a command up. :cite[(`zombie/commands/serverCommands/ConnectionsCommand.java:21`, `zombie/commands/CommandBase.java:172-175`)]

## 3. The logs

The skill log and the action log are both written from the player's game, which sends each line to the server to be saved.

- **Skill logs.** [PerkLogs](/pz/build-42/server/server-options/server-options-players-and-admins#perklogs) is on by default. :cite[(`zombie/network/ServerOptions.java:171`)] The perk log functions, `logCreatePlayer`, `logLogin`, `logPerkLevelChange`, `logAllPerks` and `logDeath`, each check it first and do nothing while it is off. :cite[(`media/lua/shared/Logs/ISPerkLog.lua:23-103`)] They write only on a multiplayer client, for the local player. :cite[(`media/lua/shared/Logs/ISPerkLog.lua:105-118`)]
- **Action logs.** [ClientActionLogs](/pz/build-42/server/server-options/server-options-players-and-admins#clientactionlogs) is a list of timed actions, separated by `;`. By default the list is `ISEnterVehicle`, `ISExitVehicle` and `ISTakeEngineParts`. :cite[(`zombie/network/ServerOptions.java:168-170`)] A timed action is checked when it performs, and it is logged if its type name matches the list text. The match is a text match against the whole list, so a type name that appears anywhere inside the list text matches too. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:67-71`, `media/lua/shared/Logs/ISLogSystem.lua:39-45`)]
- **How a line gets written.** The player's game sends the line to the server as a client command, and the server's handler writes it to the log. :cite[(`media/lua/shared/Logs/ISLogSystem.lua:75-94`)]

Because the lines come from each player's own game, the server cannot vouch that a missing line means nothing happened. Do not treat these logs as proof against a player.

:::callout[How we know]{kind=proof}
- Every line above was read in the 42.22 capture. Nothing on this page was run on a live server, and we have not timed the statistics period in a running game.
- "Moderator and admin" is read from the built-in role definitions, which are marked read-only :cite[(`zombie/characters/Roles.java:469`, `zombie/characters/Roles.java:480`)]. A role you add yourself is not covered.
- The `ClientActionLogs` match is read from `string.match` on the list text. We did not test which type names match one another in play.
:::
