---
id: build-42-reading-server-performance-numbers-honestly
slug: reading-server-performance-numbers-honestly
title: Reading server performance numbers honestly
game: pz
version: build-42
section: modding
category: multiplayer
difficulty: intermediate
tags:
  - server
  - performance
  - statistics
  - admin
excerpt: >-
  The server's own statistics are named after what they are not. The "FPS" is
  the last tick's length in milliseconds, the "average" is not an average, and
  getServerFPS() always says 10. Here is what each number really is, and the one
  to trust. Read from the 42.21 code.
last_updated: '2026-10-04'
related_articles:
  - what-runs-on-the-server-in-build-42-multiplayer
  - sandbox-multiplayer-options
---
# Reading server performance numbers honestly

Outcast, if you run a server and it feels laggy, the first thing you will look at is the statistics page in the admin panel, or the numbers a mod reads for you. Before you act on them, know this: two of the most visible numbers are named after things they are not. We found out by reading the code after they told us something impossible.

## Where the numbers come from

The server measures each update tick and keeps counters. Lua can read them as tables through `getPerformanceLocal()`, `getGameLocal()` and `getNetworkLocal()` (and `...Remote()` versions). The admin panel's statistics window shows the same tables.

Once per statistics period, the game clears the table, copies every counter into it, and resets each counter. The period is the server option `MultiplayerStatisticsPeriod`, in seconds: default 1, range 0 to 10, and 0 turns statistics off.

> **Proof:** Code. `zombie.network.statistics.StatisticManager#update`; `zombie.network.statistics.data.Statistic#update` (`localTable.wipe()`, then each perishable counter is copied and cleared); `zombie.network.ServerOptions` (`MultiplayerStatisticsPeriod`, 0 to 10, default 1); the Lua getters in `zombie.Lua.LuaManager`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What each number really is

Here is the update code for the performance counters, where `period` is how long the last tick took in milliseconds:

```java
if (period > this.maxUpdatePeriod.get()) { this.maxUpdatePeriod.set(period); }
if (period < this.minUpdatePeriod.get()) { this.minUpdatePeriod.set(period); }
this.avgUpdatePeriod.set((long)((period - this.avgUpdatePeriod.get()) * 0.05F));
this.fps.set(period);
```

| Key | What the name suggests | What it is |
|---|---|---|
| `fps` | Frames per second | **The length of the last tick, in milliseconds.** Its own description in the code says "Current update cycle duration", unit ms. Bigger is worse. The admin panel still labels it `FPS :`. |
| `avg-update-period` | Average tick length | **Not an average.** It stores only 5% of the difference between this tick and the stored value, and does not add the stored value back. It hovers around a twentieth of the tick length, and reads **0 for any tick under 20 ms**. |
| `max-update-period` | Worst tick | **This one is honest.** Because counters are reset every period, it is the worst tick inside the last period, in real milliseconds. |
| `min-update-period` | Best tick | The best tick in the last period. |

And one more: the global function `getServerFPS()` returns a hard-coded `10`, always. Anything that shows you "server FPS: 10" is showing you a constant.

> **Proof:** Code. `zombie.network.statistics.data.PerformanceStatistic#addUpdate` (above) and its counter `fps` declared "Current update cycle duration", "ms"; `zombie.Lua.LuaManager.GlobalObject#getServerFPS` (`return 10;`); `media/lua/client/ISUI/AdminPanel/ISStatisticsUI.lua` (`"FPS :"` row reading `performanceLocal["fps"]`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How to read lag without fooling yourself

- **Watch `max-update-period`.** A healthy server's worst tick stays short; spikes there are what players feel as rubber-banding.
- **Read `fps` as a duration.** If it says 40, the last tick took 40 ms. It is not "40 frames".
- **Ignore `avg-update-period`** and `getServerFPS()`.
- **Wait one period before reading.** The tables are empty until the first period has passed, so a mod that reads them at start-up sees nothing.
- **Enumerate the keys with `pairs()`** rather than trusting a written list, including this one. Nothing in the game loops over these tables; every vanilla use asks for a key by name, which is how a list of keys goes out of date unnoticed.

```lua
local perf = getPerformanceLocal()
for k, v in pairs(perf) do print(k, v) end
```

## The Prometheus endpoint shows your players to anyone who can reach it

There is a second way to read these numbers, for server owners who graph them: start the server with the Java system property `-DprometheusPort` set to a port number, and the game opens a Prometheus metrics page on that port. It is off unless you set it.

Before you turn it on, Outcast, know what it publishes. Besides the counters, it lists **every connected player's account name with their X and Y position** (and a made-up longitude and latitude), refreshed every statistics period, plus the server's IP address, name and ports. The game sets up **no password or any other check** on that page. The startup log line says `localhost`, but that is only how the message is written; we have not checked which network address the page actually listens on. Treat it as open to anyone who can reach that port, and keep the port behind your firewall.

> **Proof:** Code. `zombie.network.statistics.StatisticManager` (starts `HTTPServer.builder().port(...)` only when the `prometheusPort` system property is set, with no authenticator; registers the `player_x`, `player_y`, `player_lon` and `player_lat` gauges labelled with the online id and the account name, filled for every fully connected player on each update; the info metric carries the server's IP, name and ports). Build 42.21.0 (revision 4a0e9546ec).

> **Proof:** Code. Tables are wiped and refilled only in `zombie.network.statistics.data.Statistic#update`, once per period; vanilla Lua reads them by literal key (`ISStatisticsUI.lua`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

*Updated 2026-10-04: added the privacy warning for the Prometheus metrics page (player names and positions, no password).*
