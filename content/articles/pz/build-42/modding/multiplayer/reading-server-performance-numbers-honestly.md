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
  In 42.22 the server statistic "fps" is the last frame step's length in milliseconds, "avg-update-period" is not an average, and getServerFPS() always says 10. What each number is, and which to trust.
last_updated: '2026-11-21'
related_articles:
  - what-runs-on-the-server-in-build-42-multiplayer
  - sandbox-multiplayer-options
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [server owners](#2-what-each-number-really-is) | [modders](#3-how-to-read-lag-without-fooling-yourself) | [anyone thinking of the Prometheus page](#4-the-prometheus-endpoint-shows-your-players-to-anyone-who-can-reach-it)

Outcast, if you run a server and it feels laggy, the first thing you will look at is the statistics page in the admin panel, or the numbers a mod reads for you. Before you act on them, know this: two of the most visible numbers are named after things they are not. We found out by reading the code after they told us something impossible.

:::callout[The 1-minute version]{kind=key}
- `fps` is not frames per second. It is the length of the last frame step in milliseconds, and bigger is worse. The admin panel still labels it `FPS :`.
- `avg-update-period` is not an average. It keeps only 5% of the gap between the last frame step and its own stored value, so it reads far below the frame-step length, and 0 for a steady frame step under 20 ms.
- `max-update-period` is the worst frame step inside the last statistics period, in real milliseconds, and the one number here that is not misnamed.
- `getServerFPS()` returns 10 whatever the server is doing. Nothing in vanilla Lua calls it.
- A dedicated server's frame step is paced to run about every 100 ms, so a healthy `fps` can read around 100. We read that from the code; we did not measure it.
- Setting the Java property `-DprometheusPort` opens a metrics page that lists every connected player's account name and position, with no password. It is off unless you set it.
:::

:::facts
- **Statistics period** `MultiplayerStatisticsPeriod`: 1 second by default, 0 to 10, and 0 turns statistics off
- **Server frame step** one every 100 ms at most, so up to 10 per second
- **`avg-update-period`** 5% of the gap to the last frame step; reads 0 under 20 ms, 4 for a steady 100 ms
- **`getServerFPS()`** always 10
- **Prometheus** off by default; on only with `-DprometheusPort`
:::

## 1. Where the numbers come from

The server measures the length of each frame step and keeps counters, and Lua reads them as tables that are refilled once per statistics period.

Lua can read them through `getPerformanceLocal()`, `getGameLocal()` and `getNetworkLocal()`, and through the matching `...Remote()` functions. :cite[(`Lua/LuaManager.java:3115-3161`)] The local tables hold the counters of the machine that asks. The remote tables are filled from a statistics packet that the server sends to players whose role has the `GetStatistic` capability and who have enabled transmission, and the packet carries only the Network, Performance and Game tables of the server. :cite[(`StatisticsPacket.java:34-48`, `StatisticManager.java:188-192`)] 

The admin panel's statistics window shows the two as a "Client" column and a "Server" column. :cite[(`media/lua/client/ISUI/AdminPanel/ISStatisticsUI.lua:53-66`)] Who may see them is on [Reading the server's numbers](/pz/build-42/server/getting-started/reading-the-servers-numbers).

Once per statistics period, the game clears the table, copies every counter into it, and resets each counter that can perish. :cite[(`Statistic.java:43-60`, `Counter.java:53-55`)] The period is the server option `MultiplayerStatisticsPeriod`, in seconds: default 1, range 0 to 10, and 0 turns statistics off. :cite[(`ServerOptions.java:213`, `StatisticManager.java:146-151`, `media/lua/shared/Translate/EN/UI.json:1826`)] Each frame step feeds the performance counters first, whatever the period is. :cite[(`StatisticManager.java:146-148`)]

## 2. What each number really is

The performance counters are updated once per frame step with the length of that step, and three of the four timing keys do not mean what their names suggest.

On a dedicated server the length is the time since the previous frame step began, and the call is made once per step. :cite[(`GameServer.java:1158-1168`)] The update code, where `period` is that length in milliseconds, is this.

```java
if (period > this.maxUpdatePeriod.get()) { this.maxUpdatePeriod.set(period); }
if (period < this.minUpdatePeriod.get()) { this.minUpdatePeriod.set(period); }
this.avgUpdatePeriod.set((long)((period - this.avgUpdatePeriod.get()) * 0.05F));
this.fps.set(period);
```

:cite[(`PerformanceStatistic.java:44-55`)]

| Key | What the name suggests | What it is | Code |
|---|---|---|---|
| `fps` | Frames per second | **The length of the last frame step, in milliseconds.** Its own description in the code says "Current update cycle duration", unit ms. Bigger is worse. The admin panel still labels it `FPS :`. | `PerformanceStatistic.java:30`, `PerformanceStatistic.java:54`, `media/lua/client/ISUI/AdminPanel/ISStatisticsUI.lua:66` |
| `avg-update-period` | Average frame-step length | **Not an average.** It stores only 5% of the difference between this frame step and the stored value, and does not add the stored value back. It settles near a twenty-first of a steady frame-step length, and reads **0 for a steady frame step under 20 ms**. | `PerformanceStatistic.java:29`, `PerformanceStatistic.java:53` |
| `max-update-period` | Worst frame step | **This one is honest.** Because counters are reset every period, it is the worst frame step inside the last period, in real milliseconds. | `PerformanceStatistic.java:28`, `PerformanceStatistic.java:45-47`, `Statistic.java:58-60` |
| `min-update-period` | Best frame step | The best frame step in the last period. | `PerformanceStatistic.java:27`, `PerformanceStatistic.java:49-51` |

The average rule comes from the fixed point of its update: the stored value `a` moves to 0.05 times `(period - a)`, so it settles at `period / 21`, and the cast to a whole number drops the fraction. For a steady 100 ms frame step the stored value is 4 (the first step after a reset gives 5, then 4.75 drops to 4), and for a steady 19 ms frame step it stays at 0. We worked that out from the code and have not read it off a live server.

One more: the global function `getServerFPS()` returns a hard-coded `10`, always. :cite[(`Lua/LuaManager.java:12088-12094`)] Anything that shows you "server FPS: 10" is showing you a constant. That 10 does match the frame-rate lock the server sets for itself, but the function never reads it. :cite[(`GameServer.java:859`)] No vanilla Lua calls `getServerFPS()`.

**What "normal" looks like on a dedicated server.** The server loop runs a full frame step only when its 100 ms limiter allows, and otherwise sleeps and goes round again. :cite[(`GameServer.java:858`, `GameServer.java:1005-1014`)] So the length of a healthy frame step is about 100 ms, not a few milliseconds. By the same code, `fps` and `max-update-period` on a healthy server should read around 100, and values clearly above 100 mean steps are running late. We did not measure this on a live server.

## 3. How to read lag without fooling yourself

Watch the worst frame step, read `fps` as a duration, and ignore the two numbers that are not what they say.

- **Watch `max-update-period`.** Compare it with the roughly 100 ms the server aims for (section 2). Spikes well above it are what players feel as rubber-banding.
- **Read `fps` as a duration.** If it says 140, the last frame step took 140 ms. It is not "140 frames".
- **Ignore `avg-update-period`** and `getServerFPS()`.
- **Wait one period before reading.** The tables are empty until they are first filled, about a second after startup and then every period, so a mod that reads them at start-up sees nothing. :cite[(`StatisticManager.java:40`, `StatisticManager.java:149-151`)]
- **Enumerate the keys with `pairs()`** rather than trusting a written list, including this one. Nothing in the game loops over these tables, and the only vanilla Lua that reads them asks for keys by name, which is how a list of keys goes out of date unnoticed. :cite[(`media/lua/client/ISUI/AdminPanel/ISStatisticsUI.lua:53-115`)]

```lua
local perf = getPerformanceLocal()
for k, v in pairs(perf) do print(k, v) end
```

A statistic whose counter throws when read is dropped from the list for good, so a key can also vanish. :cite[(`Statistic.java:43-72`)]

## 4. The Prometheus endpoint shows your players to anyone who can reach it

There is a second way to read these numbers, for server owners who graph them, and it publishes every connected player's name and position without any check.

Start the program with the Java system property `-DprometheusPort` set to a port number, and the game opens a Prometheus metrics page on that port. It is off unless you set it. :cite[(`StatisticManager.java:71-72`, `StatisticManager.java:108-116`)] The code that sets it up runs from the game's startup on both a server and a client. :cite[(`GameServer.java:1548`, `MainScreenState.java:290`)]

Outcast, before you enable it, know what it publishes.

Besides the counters, it lists **every connected player's account name with their X and Y position** (and a made-up longitude and latitude), refreshed every statistics period. :cite[(`StatisticManager.java:103-106`, `StatisticManager.java:162-186`)] The server's IP address, name, game version, checksum and ports are in an info metric. :cite[(`StatisticManager.java:80-92`)] Two histograms of packet sizes are labeled with the packet type and the player's account name. :cite[(`StatisticManager.java:93-102`, `NetworkStatistic.java:133`, `NetworkStatistic.java:149`)] The JVM's own metrics are added too. :cite[(`StatisticManager.java:73`)]

The game sets up **no password or any other check** on that page. The code builds the page from a port number alone. :cite[(`StatisticManager.java:110`)]

The startup log line says `localhost`, but that is only how the message is written, and we have not checked which network address the page actually binds to. :cite[(`StatisticManager.java:115`)] The `prometheusHost` property does not change where the page listens; the code uses it only as a label for the instance name. :cite[(`StatisticManager.java:120-127`)] Treat the page as open to anyone who can reach that port, and keep the port behind your firewall. Setting `MultiplayerStatisticsPeriod` to 0 also stops the code that fills the player gauges, because it sits inside the same period check. :cite[(`StatisticManager.java:146-151`, `StatisticManager.java:162-186`)]

:::callout[How we know]{kind=proof}
- **Code, 42.22.** Every claim above was read from the decompiled 42.22 engine and the vanilla Lua on 2026-11-21.
- **Not tested.** A live server was not run. The "about 100 ms is normal" reading and the average's settling value come from the code and arithmetic. We also did not check which address the Prometheus page binds to, because the listening address is chosen inside the Prometheus library, not in the game's code.
:::
