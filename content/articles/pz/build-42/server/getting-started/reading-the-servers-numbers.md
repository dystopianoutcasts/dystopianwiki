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
excerpt: 'Where a Build 42.21 server keeps its numbers: the statistics period, who may see the statistics, the /stats command, and the perk and action logs. What the numbers mean is in our separate article.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - reading-server-performance-numbers-honestly
  - admin-commands
  - server-options-directory
---
# Reading the server's numbers

Outcast, when your server feels slow, you will want numbers. This page says where the server keeps them and who may see them. What each number really means is a different story, and a surprising one: read [Reading server performance numbers honestly](/pz/build-42/modding/multiplayer/reading-server-performance-numbers-honestly) before you act on any of them. We do not repeat it here.

## The statistics

- **How often.** The server option [MultiplayerStatisticsPeriod](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#multiplayerstatisticsperiod) is the statistics period in seconds: the code multiplies it by 1,000 to get milliseconds. The default is 1, and 0 stops the statistics from updating.
- **Who sees them.** Each period, the server sends the statistics only to players whose role has the [GetStatistic](/pz/build-42/server/roles-and-access/where-each-capability-is-checked#getstatistic) capability and whose connection has statistics switched on. The statistics button in the admin panel is enabled by the same capability. Of the built-in roles, `moderator` and `admin` have it.
- **From the console or chat.** [/stats](/pz/build-42/server/admin-commands/admin-commands#stats) needs the same capability. `/stats list` lists the statistics; `/stats <statistic> all` prints all of one statistic's values.

> **Proof:** Code. `zombie.network.statistics.StatisticManager#update` (the period times 1,000, nothing when it is 0, and the send to roles with `GetStatistic`); `zombie.network.statistics.data.NetworkStatistic#updateConnection`; `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` `ISAdminPanelUI:updateButtons`; `zombie.characters.Roles#addStatic`; `zombie.commands.serverCommands.StatisticsCommand#Command`. Build 42.21 (revision 4a0e9546ec).

## Who is on, and the logs

- **Who is connected.** [/players](/pz/build-42/server/admin-commands/admin-commands#players) lists the connected players. `/connections` would show every connection, but it is switched off in this build.
- **Skill logs.** [PerkLogs](/pz/build-42/server/server-options/server-options-players-and-admins#perklogs) is on by default. The perk log functions, `logCreatePlayer`, `logLogin`, `logPerkLevelChange`, `logAllPerks` and `logDeath`, each check it first and do nothing while it is off.
- **Action logs.** [ClientActionLogs](/pz/build-42/server/server-options/server-options-players-and-admins#clientactionlogs) is a list of timed actions, separated by `;`. The action log only records an action whose type it finds in that list. By default the list is `ISEnterVehicle`, `ISExitVehicle` and `ISTakeEngineParts`.

> **Proof:** Code. `zombie.commands.serverCommands.PlayersCommand#Command` and the `@DisabledCommand` on `ConnectionsCommand`; `media/lua/shared/Logs/ISPerkLog.lua` (`logCreatePlayer`, `logLogin`, `logPerkLevelChange`, `logAllPerks`, `logDeath`, each checking `PerkLogs` first); `media/lua/shared/Logs/ISLogSystem.lua` `ISLogSystem.logAction` (matches the action type against `ClientActionLogs`); `zombie.network.ServerOptions` (the defaults). Build 42.21 (revision 4a0e9546ec).
