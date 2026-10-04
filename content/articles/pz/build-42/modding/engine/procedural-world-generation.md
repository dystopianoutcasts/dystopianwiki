---
id: build-42-procedural-world-generation
slug: procedural-world-generation
title: 'Procedural world generation in Build 42'
game: pz
version: build-42
section: modding
category: engine
difficulty: advanced
tags:
  - engine
  - world
  - worldgen
  - biomes
  - mapping
  - multiplayer
excerpt: >-
  Build 42 generates ground the map never drew, and repaints the vegetation of
  the map it did draw, from Lua tables, a biome image per cell and the world
  seed. When the generator runs, which side runs it, what the seed really
  changes (zombies included), and how a mod or a map changes the result.
last_updated: '2026-10-04'
related_articles:
  - biomemap
  - b41-vs-b42-mapping-delta
  - erosion
  - randomized-stories
---
# Procedural world generation in Build 42

Outcast, Build 42 is the first build where the world is partly made up on the spot. Walk past the edge of the drawn map and the game invents forest, fields, roads and ore for you. Stay inside the drawn map and it still rewrites the trees and bushes on every square from a biome image. All of it is driven by Lua tables you can change. This page explains the generator from the 42.21 code, for modders and mappers alike.

## What it does for the player

Beyond the hand-made map there is more land instead of an invisible wall, with forests, clearings, dirt roads and rock outcrops. Inside the map, forests differ by type (vanilla's biome list has birch, mixed, farm, organic and primary forest, among others) and look different from one world to the next, because the world seed decides which tree, bush or plant grows on each square. The seed you type when you create a world, or a server's Seed setting, decides all of it.

## Where it lives

The package is `zombie.iso.worldgen`, about 6,600 lines in 69 files. The data it works from is Lua.

| Piece | Class or file | Job |
|---|---|---|
| Generator | `WorldGenChunk` | Reads the Lua tables, generates or repaints chunks |
| Seed and world size | `WorldGenParams` | The seed string, its hash, the cell rectangle, a random generator per position; saved as `map_worldgen.bin` |
| Biomes | `biomes.*`, `BiomeRegistry` | Picks a biome per square from simplex noise and the selection rules |
| Biome image | `maps.BiomeMap` | Reads `biomemap_<x>_<y>.png` per cell; red is the biome, green the zone |
| Roads, veins, prefabs | `roads.*`, `veins.*`, `PrefabStructure` | Generated dirt roads, ore veins, fixed structures |
| Edges | `blending.Blending`, `attachments.AttachmentsHandler` | Blending tidies the seam with drawn ground; attachments lay the floor edge tiles between ground materials, ordered by `worldgen.priorities` |
| Foraging zones | `zones.ZoneGenerator` | Builds foraging zones from the biome image's green channel |
| Zombie density | `zombie.ZombieVoronoi` | Seed noise that thins zombie density, on drawn map too |
| Data | `media/lua/server/WorldGen/*.lua` | The `worldgen` table: biomes, features, selection, prefabs, veins, roads, attachments, priorities |
| Data | `media/lua/server/metazones/BiomeMapConfig.lua` | `biome_map_config`: which pixel value means which biome, zone and ore |
| Data | `media/lua/server/Zombies/VoronoiNoise.lua` | `zombie_voronoi`: the density noise layers |
| Per map | `media/maps/<map>/WorldGenOverride.lua` | Run for each map in the world's map list; vanilla's adds fixed water strips and road prefabs at the edges |

The call chain for a chunk that has never been saved:

`IsoChunk#LoadChunk` -> `IsoChunk#LoadOrCreate` (no save file) -> `IsoChunk#LoadBrandNew` (loads the map data for the 2 by 2 chunk block around it) -> `WorldGenChunk#generateChunks` -> per chunk, either `genRandomChunk` or `genMapChunk`.

- **A chunk with any empty ground square is "random".** Each empty square gets a fully generated ground: a fixed module if one covers it, else a road if one passes through, else the biome the noise picks, then ore veins. Squares the map did draw are kept and only marked for blending.
- **A chunk with every ground square drawn is "map".** Each square's tree, bush and grass are replaced or deleted according to the biome the biome image gives it, ore may be added, and a square whose biome is `$random` is thrown away and generated from scratch. Afterwards ground cover is cleared from sand and road squares.

> **Proof:** Code. `zombie.iso.IsoChunk#LoadOrCreate`, `#LoadBrandNew` (`WorldGenUtils#getCornerOfGeneration`, the `doWorldgen` flag), `#hasEmptySquaresOnLevelZero`; `zombie.iso.worldgen.WorldGenChunk` (constructor, `#generateChunks`, `#genRandomChunk`, `#genRandomSquare`, `#genMapChunk`, `#genMapSquare`, `#cleanChunk` calls); `zombie.iso.worldgen.WorldGenParams` (`GENERATION_SIZE = 2`); `zombie.iso.worldgen.maps.BiomeMap#getRaster`; `zombie.iso.worldgen.attachments.AttachmentsHandler#loadAttachments` (`FloorAttachmentN/S/E/W` tiles by `FloorMaterial`); `media/lua/server/WorldGen/attachments/Priorities.lua`; `media/lua/server/metazones/BiomeMapConfig.lua` (biome names). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The seed

`WorldGenParams` keeps a seed string and uses its Java hash as the number. In single player the world creation screen sets it (along with the cell rectangle). On a server it comes from the `-seed=` launch argument or the `Seed` server option; if both are empty, the server makes one up at start and writes it into the `Seed` option. A client takes the server's. Once a world exists, the seed lives in `map_worldgen.bin` in the save.

The random draws the generator makes for a square come from `WorldGenParams#getRandom(x, y)`, a generator seeded by the world seed and the position, and its biome noise and road generators are seeded by the world seed too. The same seed and the same data therefore produce the same ground, on any machine.

> **Proof:** Code. `zombie.iso.worldgen.WorldGenChunk` constructor (`new WorldGenSimplexGenerator(seed)`, `new RoadGenerator(this.seed, roadConfig, offset)`); `zombie.iso.worldgen.WorldGenParams#setSeedString` (`seedString.hashCode()`), `#getRandom`, `#save`, `#load` (`map_worldgen.bin`); `zombie.iso.IsoWorld#init` (on `Result.CLIENT`, or no file on a server, takes `ServerOptions.instance.seed`, else `GameServer.seed`, and sets the rectangle to -250..250 cells); `zombie.network.GameServer` (`seed = WorldGenUtils.INSTANCE.generateSeed()`, `-seed=`); `media/lua/client/OptionScreens/WorldSelect.lua` and `MapSpawnSelect.lua` (`WorldGenParams.INSTANCE:setSeedString`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The seed changes zombies on the drawn map

This is the part nobody expects. When the game reads the zombie intensity that the map ships for each chunk, it multiplies it by noise layers built from the world seed. Each layer is a Voronoi pattern; where its value falls under the layer's cutoff, the chunk's intensity becomes 0. Vanilla has two layers. So two worlds on the same map with different seeds have zombie-free chunks in different places. The sandbox option **Voronoi Noise** ("Controls whether some randomization is applied to zombie distribution", on by default) sets the cutoff to 0 when off, which leaves the map's numbers untouched.

```java
List<double[]> voronoisValues = IsoWorld.instance.getZombieVoronois().stream().map(vx -> vx.evaluateCellCutoff(wX, wY)).toList();
...
      for (double[] values : voronoisValues) {
         v *= values[wy * 32 + wx];
      }
      intensity = (int)(intensity * v);
```

> **Proof:** Code. `zombie.iso.IsoMetaGrid` (lot header load, above); `zombie.iso.worldgen.zombie.ZombieVoronoi#getVoronois` (one layer per entry of `zombie_voronoi`, seed plus index), `#evaluateCellCutoff` (values under the cutoff become 0.0, others 1.0; cutoff 0 when `zombieVoronoiNoise` is off); `media/lua/server/Zombies/VoronoiNoise.lua` (two layers, scale 12 and 55, cutoff 0.15 and 0.08); `zombie.SandboxOptions` (`ZombieVoronoiNoise` default true). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs and on which side

Generation runs once per chunk, at the moment the chunk is created because no save file exists for it. After that the chunk is saved like any other and never generated again.

- **Single player:** your game generates.
- **Dedicated server:** the server generates when it creates the chunk. A server started with `-no-worldgen` skips generation entirely (empty ground stays empty); `-no-foraging` switches off the foraging zones, and `-no-attachment` switches off both the edge blending and the attachments.
- **Multiplayer client:** a chunk normally arrives as a buffer from the server, and `LoadOrCreate` loads that buffer instead of generating.

The tables are read once, when the world loads: the generator, the biome image config and the zombie noise are all built in `IsoMetaGrid#CreateStep1`, which runs before the Lua event `OnInitWorld`. Generated squares then finish loading through the normal chunk path, so `LoadGridsquare` fires for them like for any other square.

> **Proof:** Code. `IsoChunk#LoadOrCreate` (a chunk with a save file, or a server buffer, is loaded, not generated); `zombie.network.GameServer` (`-no-worldgen`, `-no-foraging`, `-no-attachment`); `IsoChunk#update` (`doAttachments` gates `applyBlending` and `applyAttachments`); `zombie.network.ServerChunkLoader` (`LoadChunk(wx, wy, null)`); `zombie.iso.WorldStreamer#DoChunkAlways` (passes `fromServer`); `zombie.iso.IsoMetaGrid#CreateStep1` (`new WorldGenChunk`, `new BiomeMap`, `ZombieVoronoi.getVoronois`); `zombie.iso.IsoWorld#init` (`CreateStep1` before `triggerEvent("OnInitWorld")`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- **The data.** `worldgen` (biomes, features, selection, prefabs, veins, roads, attachments, priorities, plus `static_modules` and `biomes_map`), `biome_map_config` and `zombie_voronoi` are plain global Lua tables. Set `worldgen.biomes_override` or `worldgen.selection_override` and the generator uses those instead of `biomes` and `selection`.
- **The seed.** `WorldGenParams.INSTANCE:getSeedString()` and `getSeed()`, as the main menu uses them, and `getMinXCell()` and friends for the world rectangle. `getRandom(x, y)` is listed too, but it returns a `java.util.Random`, a class Lua cannot call methods on.
- **The sandbox.** Voronoi Noise for zombies.
- **Per map.** A map mod ships `WorldGenOverride.lua` in its map folder; it runs when the generator is built, for each map in the world's list.

See [WorldGenParams](/pz/build-42/modding/reference/lua-classes-world-3#worldgenparams), [WorldGenUtils](/pz/build-42/modding/reference/lua-classes-world-3#worldgenutils) and the [global functions](/pz/build-42/modding/reference/lua-global-functions). There is no event during generation.

> **Proof:** Code. `WorldGenChunk` constructor (`rawget("worldgen")`, `biomes_override`, `selection_override`, `biomes_map`, `static_modules`, `veins`, `priorities`, `roads`), `#runLuaOverride` (`media/maps/<name>/WorldGenOverride.lua` per name in `IsoWorld.getMap()`); `BiomeMap` constructor (`biome_map_config`); `media/lua/client/OptionScreens/MainScreen.lua` (`WorldGenParams.INSTANCE:getSeedString()`); `zombie.Lua.LuaManager` (`WorldGenParams`, `WorldGenUtils` exposed; `java.util.Random` is not in the exposed class list). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What a mod or a map can and cannot change

**Can:** add or change biomes, features, selection rules, roads, veins and prefabs in the `worldgen` table; map new pixel values to biomes in `biome_map_config`; force biomes or prefabs on rectangles with `static_modules` in a map's `WorldGenOverride.lua`; tune or remove the zombie noise layers; and, as a mapper, paint the biome image so drawn forest grows the trees you want (see [Biomemap](/pz/build-42/mapping/fundamentals/biomemap)).

**Cannot, from Lua:** add a new kind of generation step, hook a square while it is generated, or regenerate a chunk that already exists in a save.

Traps:

- **Edit the tables when your file loads, not in an event.** The generator reads them in `CreateStep1`, before `OnInitWorld`. Change them at the top level of a `media/lua/server` file, and `require` the vanilla file you change first (vanilla's own files do this with `require("WorldGen/WorldGen")`), because `WorldGen.lua` replaces the whole `worldgen` table when it runs.
- **Changing the data on an existing save only reaches new ground.** Chunks already saved keep what was generated. Test worldgen changes on a fresh world.
- **A broken module fails quietly.** A static module with neither `biome` nor `prefab` throws inside the generator; in a "random" chunk the generator catches it, logs "Failed to load chunk, blocking out area" and leaves that chunk's squares empty. Look for that line in the log when ground goes missing.
- **The seed is part of the zombie layout.** Two servers on the same map and sandbox but different seeds do not have the same zombie density map, unless Voronoi Noise is off.
- **`-no-worldgen` on a server is total.** Every chunk with a gap stays a gap, including the generated land beyond the map edge, and drawn chunks keep their vegetation exactly as drawn.

> **Proof:** Code. `IsoMetaGrid#CreateStep1` and `IsoWorld#init` (order above); `media/lua/server/WorldGen/WorldGen.lua` (`worldgen = { ... }`) and `Roads.lua` (`require("WorldGen/WorldGen")`); `IsoChunk#LoadOrCreate` (generation only without a save file); `WorldGenChunk#genRandomSquare` (`throw new RuntimeException("Need at least one of 'biome' or 'prefab' ...")`) and `#genRandomChunk` (catch, "Failed to load chunk, blocking out area", squares set to null). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. We read the zombie claim in the code; we have not compared two worlds. The test that settles it: two fresh single-player worlds in debug mode on the same map and sandbox, seeds "a" and "b", Voronoi Noise on; turn on the world map's `ZombieIntensity` debug option and compare the same area; then repeat with Voronoi Noise off and expect the two to match. The map renderer also has `ZombieVoronoi` and `ZombieCutoff` options that draw the noise itself. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Biomemap](/pz/build-42/mapping/fundamentals/biomemap), the image this page keeps referring to, from the mapper's side.
- [Build 41 vs Build 42 mapping delta](/pz/build-42/mapping/fundamentals/b41-vs-b42-mapping-delta), for `WorldGenOverride.lua` and the other new map files.
- [Erosion](/pz/build-42/modding/engine/erosion), whose single-player random draws come from the same seed.
- [Stories and randomized content](/pz/build-42/modding/engine/randomized-stories), the other thing that happens to a brand-new chunk.
