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
  Long grass, new trees, vines on walls and cracks in the road all come from
  one clock that ticks every ten game minutes. How the erosion clock works,
  why your base does not change while you stand in it, how multiplayer keeps
  every client growing the same plants, and what a mod can and cannot touch.
last_updated: '2026-10-04'
related_articles:
  - randomized-stories
  - procedural-world-generation
  - tiles-and-tiledefs
  - lua-classes-world-1
---
# Erosion: how the world grows back

Outcast, the longer you survive, the more Knox County forgets it was ever a place where people mowed lawns. Grass grows tall, saplings become trees, vines climb walls and cracks spread through asphalt. That is the erosion system. It is small next to the rest of the engine, but it touches almost every outdoor square, and it behaves in ways that surprise people, so here is what the Build 42.21 code does.

## What it does for the player

Outdoor natural ground slowly fills with grass, bushes, plants and young trees. Paved streets get cracks. Walls get vines and cracks. Flowerbeds bloom and fade with the seasons, plants change colour through the year, and tiles that have a winter version switch to it when snow lies on the ground. A new game set some months after the outbreak starts with that growth already partly done.

## Where it lives

The package is `zombie.erosion`, about 13,500 lines in 23 files. Most of that size is one file: `ErosionData` is 8,282 lines because it carries a fixed table of numbers, one per line in the decompiled output (more on that table below).

| Class | Job |
|---|---|
| `ErosionMain` | The clock (`eTicks`), the per-chunk and per-square entry points, the multiplayer state packet |
| `ErosionConfig` | The `erosion.ini` file in the save folder: noise seeds, the clock, season settings |
| `ErosionRegions` | Four regions, each a list of categories, chosen by the floor under the square |
| `categories.*` | `NatureTrees`, `NatureBush`, `NaturePlants`, `NatureGeneric` (grass), `StreetCracks`, `WallVines`, `WallCracks`, `Flowerbed` |
| `obj.ErosionObj` | Places and restages the actual objects on a square |
| `ErosionData` | Per-chunk and per-square erosion state, saved with the map |
| `season.ErosionSeason` | The season and daylight model; the climate reads it too |
| `season.ErosionIceQueen` | Swaps sprites to their winter version while snow lies |

The four regions, from `ErosionRegions#init`:

| Region | Floor | Categories |
|---|---|---|
| Nature | sprite name starts with `blends_natural_01`, outdoors | trees, bushes, plants, grass |
| Street | sprite name starts with `blends_street`, outdoors | street cracks |
| Wall | any floor, square has a wall | vines, wall cracks |
| Flowerbed | any floor, outdoors | flowerbeds |

Only ground level erodes: `ErosionMain#loadGridsquare` returns at once for any square with `z` other than 0.

> **Proof:** Code. `zombie.erosion.ErosionMain#loadGridsquare` (`square.getZ() == 0`), `zombie.erosion.ErosionRegions#init`, `zombie.erosion.ErosionWorld#validateSpawn`, `zombie.erosion.ErosionData.Square` (the `rands` table). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The erosion clock

Everything is driven by one number, `eTicks`. Think of it as "percent of the way to a fully overgrown world", except that it does not stop at 100.

- `GameTime` calls `ErosionMain.EveryTenMinutes` every ten game minutes, in the same place it fires the Lua event `EveryTenMinutes`.
- With the default config, 144 ten-minute ticks (one game day) add 1 to `eTicks`. The sandbox option **Erosion Speed** divides or multiplies that unit: Very Fast 20 days to 100, Fast 50, Normal 100, Slow 200, Very Slow 500. The result is written into `erosion.ini` in the save folder.
- **Erosion Days**, when above 0, replaces the speed: `eTicks` becomes the ten-minute ticks counted in that mode, divided by 144 and by Erosion Days, times 100. It is read on every tick.
- **Erosion Days at -1** pins `eTicks` to 0 on every tick. The option's tooltip only describes 0 and positive values.
- A new game starts at `(Months since the Apocalypse - 1) x 30` days' worth of erosion, capped at 100.
- The clock is not capped after that. It keeps counting, and objects keep following it until they reach their last stage.

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

> **Proof:** Code. `zombie.erosion.ErosionMain#mainTimer` (above), `#initConfig` (Erosion Speed divides or multiplies `time.tickunit`; the starting `eticks` from `timeSinceApo`), `#EveryTenMinutes`; `zombie.GameTime` (calls `ErosionMain.EveryTenMinutes()` next to `triggerEvent("EveryTenMinutes")`); `zombie.erosion.ErosionConfig.Time` (`tickunit = 144`); `zombie.SandboxOptions` (`ErosionSpeed` default 3, `ErosionDays` from -1 to 36500, default 0). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How one square grows

The first time a ground square is processed, it is classified once and for all:

1. Noise values are computed for the square's position (main, moisture, minerals, kudzu) from the seeds in `erosion.ini`, and a soil type for its chunk.
2. Each region whose floor test matches lets its categories try, in order. In each matching region, the first category that accepts the square records what will grow there, its maximum stage and the `eTicks` value at which it appears, so one square can carry growth from more than one region. A square no category wants is marked "do nothing" for good.

For trees, for example, only squares whose main noise is above 50 can get one, and the tree appears when `eTicks` reaches `130 - noise`, so roughly between 30 and 80. From then on the object's stage is the time since it appeared divided by its growth cycle, and its sprite follows the season.

**Remove a grown object and the square forgets it.** When the next update wants to restage an object that is gone (cut grass, a felled tree), the category drops its record for that square. Nothing in the erosion package puts it back.

> **Proof:** Code. `ErosionMain#initGridSquare`, `#initChunk` (`soilTable`); `zombie.erosion.categories.NatureTrees#init` (`spawnChance` is 0 below 50) and `#validateSpawn` (`spawnTime = 130 - eValue`); `zombie.erosion.categories.NatureGeneric#update`; `zombie.erosion.categories.ErosionCategory#updateObj` (object missing, `clearCatModData`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs and on which side

This is the part that explains most "erosion is broken" reports.

- **Single player:** a square is brought up to date when its chunk loads. Outside the game's debug mode (where the climate refreshes the loaded chunks once a day), that is the only time. While a chunk stays loaded around you, nothing on it grows; the next time it loads, it catches up in one step. Your base looks frozen because you live in it.
- **Dedicated server:** when a chunk loads, and every ten game minutes if the clock or the day has changed, the server brings every square in every loaded cell up to date. The day changes once a day, so at least once a day.
- **Multiplayer client:** the server sends the clock in its weather packet. When the clock or the day changes, the client brings the squares it has loaded up to date itself.

In multiplayer a chunk arrives from the server with whatever had grown when the server sent it, but every update after that the client works out on its own, so both sides must arrive at the same answer. Three things make sure of it:

- The client receives the server's `erosion.ini` settings when it connects.
- The noise seeds are constants in the code, and nothing randomizes them. Unless someone edits `erosion.ini`, every world uses the same seeds.
- The per-square random draw differs by mode. In single player it comes from a generator seeded by the world seed and the square's position. On a server and on a client it comes from that fixed table in `ErosionData`, 8,100 numbers indexed by position modulo 90, so it repeats every 90 squares.

Nothing in the erosion package sends an object change over the network. Erosion objects are flagged `doNotSync`; the only reader of that flag we found is the object save code, which stores it.

```java
public final int rand(int x, int y, int max) {
   if (!ErosionData.staticRand && !GameServer.server && !GameClient.client) {
      return this.rand != null ? this.rand.Next(max) : Rand.Next(max);
   } else {
      ...
      float rand = rands[x % 90 + y % 90 * 90] / 100.0F;
      return Math.min((int)(rand * max), max - 1);
```

> **Proof:** Code. `zombie.iso.IsoChunk#doLoadGridsquare` (calls `ErosionMain.LoadGridsquare` per square and `ErosionMain.ChunkLoaded`, except on a soft reset); `ErosionMain#mainTimer` (the `GameServer.server` loop over `ServerMap.instance.loadedCells`; no square update in single player), `zombie.iso.weather.ClimateManager#updateValues` (`DebugUpdateMapNow` on a day change only with `Core.debug` in single player); `ErosionMain#receiveState` and `#updateMapNow` (client), `#initConfig` (client takes `GameClient.instance.erosionConfig`); `zombie.network.ConnectionDetails` (writes the config); `zombie.network.packets.WeatherPacket` (`sendState`, `receiveState`); `zombie.erosion.ErosionConfig.Seeds` (constant defaults); `zombie.erosion.ErosionData.Square#rand` (above); `zombie.core.random.RandLocation` (seeded through `WorldGenParams#getRandom`); `zombie.erosion.obj.ErosionObj#placeObject` (`doNotSync = true`); `zombie.iso.IsoObject` (`doNotSync` written and read as save flag 16; `customHashCode`, which skips it, has no caller); no transmit call anywhere under `zombie.erosion`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. That clients really grow the same plants as the server is the code's design, not something we have watched. The test that settles it: on a test server with Erosion Speed at Very Fast, let two clients stand in different spots of the same field for a few in-game days, then compare screenshots of the same squares from both clients after each reconnects. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Seasons and snow

`ErosionSeason` is more than an erosion detail: it is the season and daylight model for the game. `ErosionMain#start` builds it from the config (latitude 38, temperatures, rain per month), shifts the temperatures by the sandbox Temperature option, and then fires the Lua event `OnInitSeasons` with the season object. The climate system takes its season object from `ErosionMain` and reads dawn, dusk, noon and the daily temperatures from it.

Winter sprites come from tile properties. When the world boots, `ErosionIceQueen` scans every loaded sprite for a `SnowTile` property and pairs the sprite with the winter tile it names. The climate system switches the whole set on while the snow on the ground is above 20%; most of its calls also require that the season allows winter sprites. Mod tiles with a `SnowTile` property join in, because the scan runs after tile definitions load.

> **Proof:** Code. `ErosionMain#start` (`season.init`, temperature shifts, `triggerEvent("OnInitSeasons", this.season)`); `zombie.erosion.ErosionConfig.Season` (defaults); `zombie.iso.weather.ClimateManager` (`ErosionMain.getInstance().getSeasons()`, `ErosionIceQueen.instance.setSnow(... snowFracNow > 0.2F)`); `zombie.iso.weather.ClimateValues` (`season.getDawn()`, `getDusk()`, `getDayHighNoon()`, `getDayTemperature()`, `getDayMeanTemperature()`); `zombie.erosion.season.ErosionIceQueen#readTileProperties` (`SnowTile`); `zombie.iso.IsoWorld#init` (`ErosionGlobals.Boot` after `triggerEvent("OnLoadedTileDefinitions")`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- `getErosion()` returns `ErosionMain`. Useful: `getEtick()` (the clock; on a client, the server's value), `getSeasons()`, `getConfig()`. `ErosionConfig` exposes almost nothing beyond file reading and writing; seeds and timings have no getters.
- `OnInitSeasons(season)`: your one chance to reshape the season model with `season:init(lat, tempMax, tempMin, tempDiff, seasonLag, noon, seedA, seedB, seedC)` and `season:setRain(jan, ..., dec)`. Vanilla calls `setDay` right after `init`; do the same, because `init` clears the year data that `setDay` fills.
- `LoadGridsquare(square)`: fires for each square after erosion has processed it, so a handler sees the grown objects.
- `useStaticErosionRand(true)`: makes single player use the fixed table too. Vanilla only uses it in debug scenarios.
- Sandbox options: Erosion Speed, Erosion Days, Months since the Apocalypse, Temperature.

Calls that look useful and do nothing in 42.21:

- `forceSnowCheck()` calls `ErosionMain#snowCheck`, whose body is empty.
- `getErosion():isSnow()`, `getSnowFraction()` and `getSnowFractionYesterday()` read fields nothing ever sets, so they always return false or 0. For snow, ask the climate (`getClimateManager()`).

See [ErosionMain](/pz/build-42/modding/reference/lua-classes-world-1#erosionmain), [ErosionSeason](/pz/build-42/modding/reference/lua-classes-world-1#erosionseason), [ErosionConfig](/pz/build-42/modding/reference/lua-classes-world-1#erosionconfig), [ClimateManager](/pz/build-42/modding/reference/lua-classes-world-3#climatemanager), the events [OnInitSeasons](/pz/build-42/modding/reference/lua-events#oninitseasons), [LoadGridsquare](/pz/build-42/modding/reference/lua-events#loadgridsquare) and [EveryTenMinutes](/pz/build-42/modding/reference/lua-events#everytenminutes), and the [global functions](/pz/build-42/modding/reference/lua-global-functions).

> **Proof:** Code. `zombie.Lua.LuaManager` (`getErosion`, `useStaticErosionRand`, `forceSnowCheck`); `ErosionMain#snowCheck` (empty), `#isSnow`, `#getSnowFraction` (fields with no assignment); `zombie.erosion.season.ErosionSeason#init` (resets `yearData`) and `#setDay`; `IsoChunk#doLoadGridsquare` (`ErosionMain.LoadGridsquare(square)` before `triggerEvent("LoadGridsquare", square)`); `media/lua/client/DebugUIs/Scenarios/*.lua` (`useStaticErosionRand(true)`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What a mod can and cannot change

**Can:** speed the clock up or slow it down through sandbox options; reshape seasons, day length and temperatures in `OnInitSeasons`; give tiles winter versions with `SnowTile`; remove or replace grown objects from `LoadGridsquare` (the square then forgets them, see above).

**Cannot, from Lua:** add a category, a region, or a new kind of growth. The regions and categories are built by `new` in `ErosionRegions#init`, and their sprite tables are Java arrays.

Traps:

- **Erosion Speed is fixed when the world is created.** `ErosionMain#initConfig` applies Erosion Speed and the Months-since-the-Apocalypse head start only when the save has no `erosion.ini` yet; when the file exists, it reads it and returns before that code. The clock writes the file every ten game minutes. So changing Erosion Speed on a running save does nothing, while Erosion Days, read live, does.
- **Erosion Days throws away the head start.** In that mode the clock is recomputed from the ticks counted since the world began, so the starting value from Months since the Apocalypse is replaced on the first ten-minute tick, and switching a running save to Erosion Days drops the clock to whatever its tick counter gives. We read this; we have not watched it.
- **`OnInitSeasons` fires on every side.** `ErosionMain#start` runs in single player, on the server and on each client, so a season mod belongs in a shared file and must compute the same values everywhere. Which side's season decides what a multiplayer player feels is Unknown: the test is to change the latitude on the server only and compare dawn and dusk times on a client.
- **Editing the seeds in `erosion.ini` changes growth on every square not yet classified.** Squares already classified keep their saved record. The server sends its settings to clients at connect, so on a server, edit the server's copy, never a client's.
- **Do not wait for erosion inside a base you are standing in** (single player). Leave the area until the chunks unload, and they catch up when they load again.

> **Proof:** Code. `zombie.iso.IsoWorld#init` (`ErosionGlobals.Boot` with no side guard); `zombie.erosion.ErosionGlobals#Boot`; `ErosionMain#initConfig` (server and single player read `erosion.ini` from the save folder and `return true` when `readFile` succeeds, before the `getErosionSpeed()` switch and the `timeSinceApo` start; a client takes the server's); `zombie.erosion.ErosionConfig#readFile`; `ErosionMain#mainTimer` (`erosionDays` read each tick, `eTicks` recomputed from `ticks`, `cfg.writeFile` each tick); `zombie.erosion.ErosionRegions#init`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Stories and randomized content](/pz/build-42/modding/engine/randomized-stories), the other system that rewrites chunks when they load.
- [Procedural world generation](/pz/build-42/modding/engine/procedural-world-generation), which owns the world seed the single-player erosion random draws from.
- [Tiles and tiledefs](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs), for adding tile properties such as `SnowTile`.
