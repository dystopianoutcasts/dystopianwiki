---
id: build-42-erosion
slug: erosion
title: 'Erosion: how the world grows back'
game: pz
version: build-42
section: modding
category: engine
difficulty: intermediate
tags:
  - engine
  - world
  - erosion
  - seasons
  - sandbox
  - multiplayer
excerpt: >-
  Long grass, new trees, vines and road cracks come from one clock that runs every ten game minutes. How it works in 42.22, why your base looks frozen, how multiplayer syncs it, and what mods can do.
last_updated: '2026-11-21'
related_articles:
  - randomized-stories
  - procedural-world-generation
  - tiles-and-tiledefs
  - lua-classes-world-1
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [modders](#2-where-it-lives)

:::callout[The 1-minute version]{kind=key}
- Outcast, the longer you survive, the more grass, bushes, young trees, vines and cracks the outdoors gains. One number, `eTicks`, drives all of it.
- In single player a square only catches up when its chunk loads, so the base you stand in looks frozen. Leave until the chunks unload and they catch up when you return.
- Erosion Speed is read once, when a save is created. Changing it on a running save does nothing, while Erosion Days is read on every tick.
- Only squares on the ground floor (`z` of 0) erode.
- From Lua you can reshape seasons (`OnInitSeasons`) and tile winter versions (`SnowTile`), but you cannot add a new kind of growth.
- Not verified: that two multiplayer clients really grow identical plants. That is the code's design, and we have not watched it.
:::

:::facts
- **Clock unit** 1 `eTicks` = 144 ten-minute ticks = 1 game day, at the default Normal speed. At the default 90-minute day length, one tick is 37.5 real seconds (our arithmetic)
- **Erosion Speed** Very Fast (20 Days), Fast (50), Normal (100, Java default), Slow (200), Very Slow (500); players start from the Apocalypse preset, which is Slow
- **Erosion Days** -1 to 36500; 0 means use Erosion Speed
- **Trees** appear when the clock reaches 130 minus the square's noise, so between 31 and 79
- **Package** 23 files and 13,464 lines; `ErosionData` alone is 8,282
:::

## 1. What it does for the player

Outdoor natural ground slowly fills with grass, bushes, plants and young trees, paved streets get cracks, and walls get vines and cracks.

Flowerbeds bloom and fade with the seasons, plants change color through the year, and tiles that have a winter version switch to it when snow lies on the ground. A new game set some months after the outbreak starts with that growth already partly done.

The system is small next to the rest of the engine, but it touches almost every outdoor square, and it behaves in ways that surprise people. The rest of this page is what the 42.22 code does.

## 2. Where it lives

The package `zombie.erosion` is 23 source files, and most of its size is one file of fixed random numbers.

`ErosionData` is 8,282 lines because it carries a table of numbers, one per line in the decompiled output. :cite[(`zombie/erosion/ErosionData.java:78-8262`)]

| Class | Job | Code |
|---|---|---|
| `ErosionMain` | The clock (`eTicks`), the per-chunk and per-square entry points, the multiplayer state packet | `zombie/erosion/ErosionMain.java:105-249` |
| `ErosionConfig` | The `erosion.ini` file in the save folder: noise seeds, the clock, season settings | `zombie/erosion/ErosionConfig.java:337-386` |
| `ErosionRegions` | Four regions, each a list of categories, chosen by the floor under the square | `zombie/erosion/ErosionRegions.java:45-61` |
| `categories.*` | `NatureTrees`, `NatureBush`, `NaturePlants`, `NatureGeneric` (grass), `StreetCracks`, `WallVines`, `WallCracks`, `Flowerbed` | `zombie/erosion/ErosionRegions.java:47-56` |
| `obj.ErosionObj` | Places and restages the actual objects on a square | `zombie/erosion/obj/ErosionObj.java:85-144` |
| `ErosionData` | Per-chunk and per-square erosion state, saved with the map | `zombie/iso/IsoChunk.java:3633-3634`, `zombie/iso/IsoChunk.java:4488` |
| `season.ErosionSeason` | The season and daylight model; the climate reads it too | `zombie/iso/weather/ClimateManager.java:794` |
| `season.ErosionIceQueen` | Swaps sprites to their winter version while snow lies | `zombie/erosion/season/ErosionIceQueen.java:30-36` |

The four regions are built in one place, and each tests the floor sprite and whether the square is outdoors. :cite[(`zombie/erosion/ErosionRegions.java:47-56`, `zombie/erosion/ErosionWorld.java:22-52`)]

| Region | Floor | Categories |
|---|---|---|
| Nature | sprite name starts with `blends_natural_01`, outdoors | trees, bushes, plants, grass |
| Street | sprite name starts with `blends_street`, outdoors | street cracks |
| Wall | any floor, square has a wall | vines, wall cracks |
| Flowerbed | any floor, outdoors | flowerbeds |

Only ground level erodes: the per-square entry point returns at once for any square whose `z` is not 0. :cite[(`zombie/erosion/ErosionMain.java:230-231`)] A square with no floor sprite is marked "do nothing" for good. :cite[(`zombie/erosion/ErosionWorld.java:27-29`)]

## 3. The erosion clock

Everything is driven by one number, `eTicks`, which you can read as "percent of the way to a fully overgrown world", except that it does not stop at 100.

`GameTime` calls `ErosionMain.EveryTenMinutes` every ten game minutes, right before it fires the Lua event `EveryTenMinutes`. :cite[(`zombie/GameTime.java:635-637`)] With the default config, 144 of those ticks (one game day) add 1 to `eTicks`. :cite[(`zombie/erosion/ErosionConfig.java:381`, `zombie/erosion/ErosionMain.java:119-124`)]

- The sandbox option **Erosion Speed** divides or multiplies that unit: Very Fast divides it by 5, Fast by 2, Normal leaves it, Slow multiplies by 2, Very Slow by 5. The labels say 20, 50, 100, 200 and 500 days to 100; Very Fast works out to 28 ticks per step, about 19.4 days, which the label rounds. :cite[(`zombie/erosion/ErosionMain.java:335-352`, `media/lua/shared/Translate/EN/Sandbox.json:220-224`)]
- **Erosion Days**, when above 0, replaces the speed: `eTicks` becomes the ticks counted in that mode, divided by 144 and by Erosion Days, times 100. It is read on every tick. :cite[(`zombie/erosion/ErosionMain.java:111`, `zombie/erosion/ErosionMain.java:116-118`)]
- **Erosion Days at -1** pins `eTicks` to 0 on every tick. The option's tooltip only describes 0 and positive values. :cite[(`zombie/erosion/ErosionMain.java:114-115`, `media/lua/shared/Translate/EN/Sandbox.json:226`)]
- A new game starts at `(Months since the Apocalypse - 1) x 30` days' worth of erosion, capped at 100 percent. :cite[(`zombie/erosion/ErosionMain.java:352-354`)]
- The clock is not capped after that. It keeps counting, and objects keep following it until they reach their last stage. :cite[(`zombie/erosion/ErosionMain.java:127-129`)]

The Java default for Erosion Speed is 3 (Normal), and Erosion Days defaults to 0. :cite[(`zombie/SandboxOptions.java:123-124`)] The presets differ: Apocalypse, Outbreak and Rising set Erosion Speed to 4 (Slow), Extinction sets 3, and Six Months Later sets 1 (Very Fast) with Months since the Apocalypse 7. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:55-56`, `media/lua/shared/Sandbox/Outbreak.lua:55`, `media/lua/shared/Sandbox/Rising.lua:55`, `media/lua/shared/Sandbox/Extinction.lua:55`, `media/lua/shared/Sandbox/SixMonthsLater.lua:27`, `media/lua/shared/Sandbox/SixMonthsLater.lua:48`)] Which preset a player starts from depends on what they pick, so check the preset before quoting a speed.

```java
} else if (erosionDays < 0) {
   this.eTicks = 0;
} else if (erosionDays > 0) {
   this.ticks++;
   this.eTicks = (int)(this.ticks / 144.0F / erosionDays * 100.0F);
} else {
   this.ticks++;
   if (this.ticks >= this.tickUnit) {
      this.ticks = 0;
      this.eTicks++;
   }
}
```

A separate debug setting in `erosion.ini` (`debug.enabled`, false in the code's defaults) makes the clock add 1 every tick on anything that is not a dedicated server. :cite[(`zombie/erosion/ErosionConfig.java:317-318`, `zombie/erosion/ErosionMain.java:112-113`, `zombie/erosion/ErosionMain.java:374`)]

## 4. How one square grows

The first time a ground square is processed, it is classified once and for all.

1. Noise values are computed for the square's position (main, moisture, minerals, kudzu) from the seeds in `erosion.ini`, and a soil type for its chunk. :cite[(`zombie/erosion/ErosionMain.java:251-266`, `zombie/erosion/ErosionMain.java:276-290`)]
2. Each region whose floor test matches lets its categories try, in order. In each matching region, the category that accepts the square earliest records what will grow there, its maximum stage and the `eTicks` value at which it appears, so one square can carry growth from more than one region. :cite[(`zombie/erosion/ErosionWorld.java:32-51`, `zombie/erosion/categories/NatureTrees.java:155-158`)]
3. A square no category wants is marked "do nothing" for good. :cite[(`zombie/erosion/ErosionWorld.java:53-55`)]

Trees show the pattern. Only squares whose main noise is above 50 can get one, the chance rises from 0 to 90 in 100 across that range, and a square with more objects than the limit (more than 1, or more than 2 when it has a wall) is refused. :cite[(`zombie/erosion/categories/NatureTrees.java:140-153`, `zombie/erosion/categories/NatureTrees.java:196`)]

A tree appears when `eTicks` reaches `130 - noise`, so between 31 and 79, because the noise must be above 50 for any chance. :cite[(`zombie/erosion/categories/NatureTrees.java:157`, `zombie/erosion/categories/NatureTrees.java:150-157`, `zombie/erosion/categories/NatureTrees.java:170`)] From then on the object's stage is the time since it appeared divided by its growth cycle, and its sprite follows the season. :cite[(`zombie/erosion/categories/NatureTrees.java:168-186`)]

**Remove a grown object and the square forgets it.** When the next update wants to restage an object that is gone (cut grass, a felled tree), the category drops its record for that square. :cite[(`zombie/erosion/categories/ErosionCategory.java:169-177`, `zombie/erosion/categories/ErosionCategory.java:189-197`)] Nothing in the erosion package puts it back.

## 5. When it runs and on which side

Single player, a dedicated server and a multiplayer client each bring squares up to date at different moments, and that explains most "erosion is broken" reports.

- **Single player:** a square is brought up to date when its chunk loads, because the load calls erosion once per square. :cite[(`zombie/iso/IsoChunk.java:3826-3829`)] Outside the game's debug mode the clock tick does not update squares at all, and with debug on the climate refreshes the loaded chunks once a day. :cite[(`zombie/erosion/ErosionMain.java:141-168`, `zombie/iso/weather/ClimateManager.java:1338-1342`)] A chunk that stays loaded around you does not grow; the next time it loads, it catches up in one step. Your base looks frozen because you live in it.
- **Dedicated server:** when a chunk loads, and on every ten-minute tick where the clock or the epoch counter has changed, the server brings every square in every loaded cell up to date. :cite[(`zombie/erosion/ErosionMain.java:141-168`)] The epoch counter goes up when the game day changes, so a loaded chunk updates at least once a day. :cite[(`zombie/erosion/ErosionMain.java:132-139`)]
- **Multiplayer client:** the server sends the clock in its weather packet. When the clock or the epoch changes, the client brings the squares it has loaded up to date itself. :cite[(`zombie/network/packets/WeatherPacket.java:39`, `zombie/erosion/ErosionMain.java:203-228`, `zombie/erosion/ErosionMain.java:436-469`)]

A chunk arrives from the server with whatever had grown when the server sent it, but every update after that the client works out on its own, so both sides must arrive at the same answer. Three things aim at it.

- The client receives the server's `erosion.ini` settings when it connects. :cite[(`zombie/network/ConnectionDetails.java:152-153`, `zombie/erosion/ErosionMain.java:294-301`)]
- The noise seeds are constants in the code, and nothing randomizes them. Unless someone edits `erosion.ini`, every world uses the same seeds. :cite[(`zombie/erosion/ErosionConfig.java:363-376`)]
- The per-square random draw differs by mode. In single player it comes from a generator seeded by the world seed and the square's position. On a server and on a client it comes from a fixed table in `ErosionData`, 90 by 90 numbers indexed by position modulo 90, so it repeats every 90 squares. :cite[(`zombie/erosion/ErosionData.java:8265-8280`, `zombie/core/random/RandLocation.java:13-14`, `zombie/iso/worldgen/WorldGenParams.java:55-62`)]

```java
public final int rand(int x, int y, int max) {
   if (!ErosionData.staticRand && !GameServer.server && !GameClient.client) {
      return this.rand != null ? this.rand.Next(max) : Rand.Next(max);
   } else {
      ...
      float rand = rands[x % 90 + y % 90 * 90] / 100.0F;
      return Math.min((int)(rand * max), max - 1);
```

Nothing in the erosion package sends an object change over the network. Erosion objects are flagged `doNotSync` when they are made. :cite[(`zombie/erosion/obj/ErosionObj.java:55`, `zombie/erosion/obj/ErosionObj.java:81`, `zombie/erosion/obj/ErosionObj.java:88`)] The object save code stores that flag as flag 16, and the one other reader, `customHashCode`, which returns 0 for such objects, has no caller anywhere in the decompiled source we searched. :cite[(`zombie/iso/IsoObject.java:1279`, `zombie/iso/IsoObject.java:1527-1529`, `zombie/iso/IsoObject.java:2303-2306`)]

## 6. Seasons and snow

`ErosionSeason` is more than an erosion detail: it is the season and daylight model for the game.

The start routine builds it from the config (latitude 38, the temperatures, rain per month), shifts the temperatures by the sandbox Temperature option, and then fires the Lua event `OnInitSeasons` with the season object. :cite[(`zombie/erosion/ErosionMain.java:392-413`, `zombie/erosion/ErosionConfig.java:337-361`)] The climate system takes its season object from `ErosionMain` and reads dawn, dusk, noon and the daily temperatures from it through `getDawn`, `getDusk`, `getDayHighNoon`, `getDayTemperature` and `getDayMeanTemperature`. :cite[(`zombie/iso/weather/ClimateManager.java:794`, `zombie/iso/weather/ClimateValues.java:246-249`, `zombie/iso/weather/ClimateValues.java:258-259`)]

Winter sprites come from tile properties. When the world boots, `ErosionIceQueen` scans every loaded sprite for a `SnowTile` property and pairs the sprite with the winter tile it names. :cite[(`zombie/erosion/season/ErosionIceQueen.java:49-60`)] The climate system switches the whole set on while the snow on the ground is above 20 percent; most of its calls also require that the season allows winter sprites. :cite[(`zombie/iso/weather/ClimateManager.java:1143`, `zombie/iso/weather/ClimateManager.java:1147`, `zombie/iso/weather/ClimateManager.java:1153`, `zombie/iso/weather/ClimateManager.java:1180`)] Mod tiles with a `SnowTile` property are included, because the scan runs after tile definitions load. :cite[(`zombie/erosion/season/ErosionIceQueen.java:54`, `zombie/iso/IsoWorld.java:1975-1985`, `zombie/iso/IsoWorld.java:2043`)]

## 7. What Lua can reach

Lua gets the erosion clock, the season object and a few hooks, and the snow helpers it exposes do not work.

- `getErosion()` returns `ErosionMain`. Useful: `getEtick()` (the clock; on a client, the server's value), `getSeasons()`, `getConfig()`. :cite[(`zombie/Lua/LuaManager.java:11541-11545`, `zombie/erosion/ErosionMain.java:89-99`)] `ErosionConfig` exposes almost nothing beyond file reading and writing; seeds and timings have no getters. :cite[(`zombie/erosion/ErosionConfig.java:337-386`)]
- `OnInitSeasons(season)`: your one chance to reshape the season model with `season:init(lat, tempMax, tempMin, tempDiff, seasonLag, noon, seedA, seedB, seedC)` and `season:setRain(jan, ..., dec)`. Vanilla calls `setDay` right after `init`; do the same, because `init` replaces the year data that `setDay` fills. :cite[(`zombie/erosion/ErosionMain.java:410-413`, `zombie/erosion/season/ErosionSeason.java:76-98`, `zombie/erosion/season/ErosionSeason.java:277-304`)]
- `LoadGridsquare(square)`: fires for each square after erosion has processed it, so a handler sees the grown objects. :cite[(`zombie/iso/IsoChunk.java:3828`, `zombie/iso/IsoChunk.java:3841`)]
- `useStaticErosionRand(true)`: makes single player use the fixed table too. Vanilla only calls it in debug scenarios. :cite[(`zombie/Lua/LuaManager.java:11501-11505`, `media/lua/client/DebugUIs/Scenarios/Multiplayer.lua:125`)]
- Sandbox options: Erosion Speed, Erosion Days, Months since the Apocalypse, Temperature. :cite[(`zombie/SandboxOptions.java:121-124`, `zombie/SandboxOptions.java:146`)]

Calls that look useful and do nothing in 42.22:

- `forceSnowCheck()` calls `ErosionMain#snowCheck`, whose body is empty. :cite[(`zombie/Lua/LuaManager.java:9244-9250`, `zombie/erosion/ErosionMain.java:177-178`)]
- `getErosion():isSnow()`, `getSnowFraction()` and `getSnowFractionYesterday()` read fields that this class never assigns, so they return false or 0. For snow, ask the climate (`getClimateManager()`). :cite[(`zombie/erosion/ErosionMain.java:74-76`, `zombie/erosion/ErosionMain.java:180-190`)]

See [ErosionMain](/pz/build-42/modding/reference/lua-classes-world-1#erosionmain), [ErosionSeason](/pz/build-42/modding/reference/lua-classes-world-1#erosionseason), [ErosionConfig](/pz/build-42/modding/reference/lua-classes-world-1#erosionconfig), [ClimateManager](/pz/build-42/modding/reference/lua-classes-world-3#climatemanager), the events [OnInitSeasons](/pz/build-42/modding/reference/lua-events#oninitseasons), [LoadGridsquare](/pz/build-42/modding/reference/lua-events#loadgridsquare) and [EveryTenMinutes](/pz/build-42/modding/reference/lua-events#everytenminutes), and the [global functions](/pz/build-42/modding/reference/lua-global-functions).

## 8. What a mod can and cannot change

A mod can speed or slow the clock and reshape the seasons, but it cannot add a new kind of growth from Lua.

**Can:** speed the clock up or slow it down through sandbox options; reshape seasons, day length and temperatures in `OnInitSeasons`; give tiles winter versions with `SnowTile`; remove or replace grown objects from `LoadGridsquare` (the square then forgets them, see section 4).

**Cannot, from Lua:** add a category, a region, or a new kind of growth. The regions and categories are built by `new` in `ErosionRegions#init`, and their sprite tables are Java arrays. :cite[(`zombie/erosion/ErosionRegions.java:45-61`)]

Traps:

- **Erosion Speed is fixed when the world is created.** On a server or in single player, `initConfig` reads the save's `erosion.ini` when it exists and returns before the Erosion Speed switch and the head start. The clock writes the file every ten game minutes. So changing Erosion Speed on a running save does nothing, while Erosion Days, read live, does. :cite[(`zombie/erosion/ErosionMain.java:303-311`, `zombie/erosion/ErosionMain.java:335-350`, `zombie/erosion/ErosionMain.java:173`)]
- **Erosion Days throws away the head start.** In that mode the clock is recomputed from the ticks counted since the world began, so the starting value from Months since the Apocalypse is replaced on the next ten-minute tick, and switching a running save to Erosion Days drops the clock to whatever its tick counter gives. We read this; we have not watched it. :cite[(`zombie/erosion/ErosionMain.java:116-118`, `zombie/erosion/ErosionMain.java:355-359`)]
- **`OnInitSeasons` fires on every side.** `ErosionMain#start` runs in single player, on the server and on each client, so a season mod belongs in a shared file and must compute the same values everywhere. :cite[(`zombie/iso/IsoWorld.java:2043`, `zombie/erosion/ErosionMain.java:365-413`)] For weather, only the server and single player run the climate simulation, while each client builds its own `ErosionSeason`; see [Seasons and day length](/pz/build-42/engine/weather-and-climate/seasons-and-day-length). Which side's season drives other things a multiplayer player sees (dawn and dusk times, for example) is still Unknown: the test is to change the latitude on the server only and compare dawn and dusk times on a client.
- **Editing the seeds in `erosion.ini` changes growth on every square not yet classified.** Squares already classified keep their saved record. The server sends its settings to clients at connect, so on a server, edit the server's copy, never a client's. :cite[(`zombie/erosion/ErosionMain.java:234-237`, `zombie/network/ConnectionDetails.java:152-153`)]
- **Do not wait for erosion inside a base you are standing in** (single player). Leave the area until the chunks unload, and they catch up when they load again.

:::callout[How we know]{kind=proof}
Everything above was read from the 42.22 decompiled code (capture B42_3d39148846). Not tested in game: that clients grow the same plants as the server (the code's design; the test is to set Erosion Speed to Very Fast on a test server, let two clients stand in different spots of one field for a few in-game days, then compare screenshots of the same squares after each reconnects), the Erosion Days head-start loss, and which side's season drives dawn and dusk for a multiplayer player.
:::

## 9. Where to go next

- [Stories and randomized content](/pz/build-42/modding/engine/randomized-stories), the other system that rewrites chunks when they load.
- [Procedural world generation](/pz/build-42/modding/engine/procedural-world-generation), which owns the world seed the single-player erosion random draws from.
- [Tiles and tiledefs](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs), for adding tile properties such as `SnowTile`.
