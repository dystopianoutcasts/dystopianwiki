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
  Build 42 invents ground the map never drew and repaints vegetation on the map it did, from Lua tables, a biome image and the world seed. When it runs in 42.22, and what a mod can do.
last_updated: '2026-11-21'
related_articles:
  - biomemap
  - b41-vs-b42-mapping-delta
  - erosion
  - randomized-stories
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [server owners](#4-when-it-runs-and-on-which-side) | [modders and mappers](#5-what-lua-can-reach)

:::callout[The 1-minute version]{kind=key}
- Outcast, Build 42 invents land past the edge of the drawn map, and repaints trees, bushes and grass on the map it did draw, from a biome image and the world seed.
- The seed you type for a new world, or a server's Seed option, decides all of it. It also decides where some chunks of the drawn map have no zombies, unless the sandbox option Voronoi Noise is off.
- Generation runs once per chunk, the first time the chunk is created without a save file. After that the chunk is saved and not generated again.
- A server started with `-no-worldgen` generates nothing: gaps stay gaps.
- A mod or map can change the Lua tables, but the generator reads them once while the world loads, so edit them when your file loads, and test on a fresh world.
- Not verified: that two worlds with different seeds really differ in zombie layout. We read it in the code and have not compared two worlds.
:::

:::facts
- **Package** `zombie.iso.worldgen`: 69 files and 6,645 lines
- **Block size** a new chunk generates together with its 2 by 2 block, 16 squares on a side
- **Default world rectangle** cells -250 to 250 on both axes (a server or client takes this)
- **Zombie noise** 2 layers: scale 12 with cutoff 0.15, and scale 55 with cutoff 0.08
- **Biome image** 18 pixel values in vanilla's `biome_map_config`
- **Seed** the Java hash of the seed string
:::

## 1. What it does for the player

Beyond the hand-made map there is more land instead of an invisible wall, with forests, clearings, dirt roads and rock outcrops.

Inside the map, forests differ by type (vanilla's biome image config names birch, birch-mix, farm, farm-mix, organic and primary forest, among others) and look different from one world to the next, because the world seed decides which tree, bush or plant grows on each square. :cite[(`media/lua/server/metazones/BiomeMapConfig.lua:1-21`)] The seed you type when you create a world, or a server's Seed setting, decides all of it. :cite[(`media/lua/client/OptionScreens/WorldSelect.lua:157`, `zombie/iso/IsoWorld.java:1887-1899`)]

## 2. Where it lives

The package `zombie.iso.worldgen` is 69 files and about 6,600 lines, and the data it works from is Lua. :cite[(`zombie/iso/worldgen/`)]

| Piece | Class or file | Job | Code |
|---|---|---|---|
| Generator | `WorldGenChunk` | Reads the Lua tables, generates or repaints chunks | `zombie/iso/worldgen/WorldGenChunk.java:78-152` |
| Seed and world size | `WorldGenParams` | The seed string, its hash, the cell rectangle, a random generator per position; saved as `map_worldgen.bin` | `zombie/iso/worldgen/WorldGenParams.java:26-123` |
| Biomes | `biomes.*`, `BiomeRegistry` | Picks a biome per square from simplex noise and the selection rules | `zombie/iso/worldgen/WorldGenChunk.java:85-103`, `zombie/iso/IsoMetaGrid.java:1486` |
| Biome image | `maps.BiomeMap` | Reads `biomemap_<x>_<y>.png` per cell; the first channel is the biome, the second the zone | `zombie/iso/worldgen/maps/BiomeMap.java:39-91`, `zombie/iso/worldgen/maps/BiomeRaster.java:19-39` |
| Roads, veins, prefabs | `roads.*`, `veins.*`, `PrefabStructure` | Generated dirt roads, ore veins, fixed structures | `zombie/iso/worldgen/WorldGenChunk.java:104-114` |
| Edges | `blending.Blending`, `attachments.AttachmentsHandler` | Blending tidies the seam with drawn ground; attachments lay the floor edge tiles (the `FloorAttachmentN`, `S`, `E` and `W` tile flags, by `FloorMaterial`) between ground materials, ordered by `worldgen.priorities` | `zombie/iso/IsoChunk.java:3020-3027` |
| Foraging zones | `zones.ZoneGenerator` | Builds foraging zones from the biome image's zone channel | `zombie/iso/worldgen/zones/ZoneGenerator.java:61-91` |
| Zombie density | `zombie.ZombieVoronoi` | Seed noise that thins zombie density, on drawn map too | `zombie/iso/worldgen/zombie/ZombieVoronoi.java:29-107` |
| Data | `media/lua/server/WorldGen/*.lua` | The `worldgen` table: biomes, features, selection, prefabs, veins, roads, attachments, priorities | `media/lua/server/WorldGen/WorldGen.lua:1-17` |
| Data | `media/lua/server/metazones/BiomeMapConfig.lua` | `biome_map_config`: which pixel value means which biome, zone and ore | `media/lua/server/metazones/BiomeMapConfig.lua:1-21` |
| Data | `media/lua/server/Zombies/VoronoiNoise.lua` | `zombie_voronoi`: the density noise layers | `media/lua/server/Zombies/VoronoiNoise.lua:1-14` |
| Per map | `media/maps/<map>/WorldGenOverride.lua` | Run for each map in the world's map list | `zombie/iso/worldgen/WorldGenChunk.java:121-131` |

Vanilla's own `WorldGenOverride.lua` is not in our capture of the game files, so we cannot say what it contains. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:121-131`)]

:::flow[A chunk that has never been saved]
- `IsoChunk#LoadChunk`
- `LoadOrCreate` finds no save file
- `LoadBrandNew` loads map data for the 2 by 2 chunk block
- `WorldGenChunk#generateChunks`
- Each chunk: `genRandomChunk` or `genMapChunk`
:::

The chain starts when a chunk is loaded with no save file for it. :cite[(`zombie/iso/IsoChunk.java:2308-2316`, `zombie/iso/IsoChunk.java:2321-2345`)] The brand-new load reads the map data for the chunk's 2 by 2 block, runs the generator on it when world generation is enabled, and puts the three other chunks of the block back into the chunk store, so a chunk keeps only its own result. :cite[(`zombie/iso/IsoChunk.java:2243-2276`, `zombie/iso/worldgen/WorldGenUtils.java:294-296`)] The generator then picks per chunk. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:133-152`)]

- **A chunk with any empty ground square is "random".** Each empty square gets a fully generated ground: a fixed module if one covers it, else a road if one passes through, else the biome the noise picks, then ore veins. Squares the map did draw are kept and only marked for blending. :cite[(`zombie/iso/IsoChunk.java:2282-2292`, `zombie/iso/worldgen/WorldGenChunk.java:154-262`, `zombie/iso/worldgen/WorldGenChunk.java:292`)]
- **A chunk with every ground square drawn is "map".** Each square's tree, bush and grass are replaced or deleted according to the biome the biome image gives it, ore may be added, and a square whose biome is `$random` is thrown away and generated from scratch. Afterwards ground cover is cleared from sand and road squares. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:295-420`, `zombie/iso/worldgen/WorldGenChunk.java:145-149`, `media/lua/server/metazones/BiomeMapConfig.lua:8`)]

A biome can also list tile replacements (one sprite swapped for another with a probability), which the map pass applies before the tree, bush and grass rules. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:506-564`)]

## 3. The seed

The seed is a string whose Java hash is the number the generator uses, and the string is set in different places on each side.

`WorldGenParams` keeps the seed string, and its Java hash is the number. :cite[(`zombie/iso/worldgen/WorldGenParams.java:42-53`)]

In single player the world creation screen sets the string and the cell rectangle. :cite[(`media/lua/client/OptionScreens/WorldSelect.lua:157-159`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:912`)]

On a server the seed comes from the `-seed=` launch argument or the `Seed` server option; if the option is empty, the server uses a seed it made at start and writes it into the `Seed` option. :cite[(`zombie/network/GameServer.java:510`, `zombie/network/GameServer.java:573-577`, `zombie/iso/IsoWorld.java:1889-1895`, `zombie/network/ServerOptions.java:218`)] A client takes the server's option, and a server with no saved file also sets the world rectangle to cells -250 to 250. :cite[(`zombie/iso/IsoWorld.java:1887-1899`)]

Once a world exists, the seed lives in `map_worldgen.bin` in the save, which 42.22 writes with world version 251 (42.21 wrote 249). :cite[(`zombie/iso/worldgen/WorldGenParams.java:99-123`)]

The random draws the generator makes for a square come from `WorldGenParams#getRandom(x, y)`, a generator seeded by the world seed and the position. :cite[(`zombie/iso/worldgen/WorldGenParams.java:55-65`)] The biome noise and the road generators are seeded by the world seed too. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:78-80`, `zombie/iso/worldgen/WorldGenChunk.java:109-114`)] The same seed and the same data therefore produce the same ground, on any machine.

## 4. When it runs and on which side

Generation runs once per chunk, at the moment the chunk is created because no save file exists for it, and after that the chunk is saved like any other. The exception is a save file that fails to load: the loader backs it up and generates the chunk again. :cite[(`zombie/iso/IsoChunk.java:2308-2316`, `zombie/iso/IsoChunk.java:2353-2358`)]

- **Single player:** your game generates. :cite[(`zombie/iso/IsoChunk.java:2321-2345`)]
- **Dedicated server:** the server generates when it creates the chunk. A server started with `-no-worldgen` skips generation entirely (empty ground stays empty); `-no-foraging` switches off the foraging zones, and `-no-attachment` switches off both the edge blending and the attachments. :cite[(`zombie/network/GameServer.java:581-586`, `zombie/iso/IsoChunk.java:2259-2262`, `zombie/iso/IsoChunk.java:3020-3027`)]
- **Multiplayer client:** a chunk normally arrives as a buffer from the server, and `LoadOrCreate` loads that buffer instead of generating. The client falls back to generating only if reading that buffer fails. :cite[(`zombie/iso/IsoChunk.java:2308-2316`, `zombie/iso/IsoChunk.java:2321-2326`, `zombie/iso/IsoChunk.java:2353-2373`)]

Foraging zones are built when a chunk loads (a saved chunk included), not only when it is generated. :cite[(`zombie/iso/IsoChunk.java:2348-2350`)]

The tables are read once, when the world loads: the generator, the biome image config and the zombie noise are all built in `IsoMetaGrid#CreateStep1`, which runs before the Lua event `OnInitWorld`. :cite[(`zombie/iso/IsoMetaGrid.java:1480-1485`, `zombie/iso/IsoWorld.java:1901-1912`)] Generated squares then finish loading through the normal chunk path, so `LoadGridsquare` fires for them like for any other square. :cite[(`zombie/iso/IsoChunk.java:3826-3841`)]

## 5. What Lua can reach

Lua can read the seed and the world rectangle, and the generator's data is plain global tables a mod can change before the world loads.

- **The data.** `worldgen` (biomes, features, selection, prefabs, veins, roads, attachments, priorities, plus `static_modules` and `biomes_map`), `biome_map_config` and `zombie_voronoi` are plain global Lua tables. Set `worldgen.biomes_override` or `worldgen.selection_override` and the generator uses those instead of `biomes` and `selection`. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:84-107`, `zombie/iso/worldgen/maps/BiomeMap.java:31`, `zombie/iso/worldgen/zombie/ZombieVoronoi.java:31`)]
- **The seed.** `WorldGenParams.INSTANCE:getSeedString()` and `getSeed()`, as the main menu uses them, and `getMinXCell()` and friends for the world rectangle. `getRandom(x, y)` is listed too, but it returns a `java.util.Random`, a class we found no exposure for, so Lua cannot call methods on the result. :cite[(`media/lua/client/OptionScreens/MainScreen.lua:672`, `zombie/Lua/LuaManager.java:2233-2234`, `zombie/iso/worldgen/WorldGenParams.java:55-57`)]
- **The sandbox.** Voronoi Noise for zombies. :cite[(`zombie/SandboxOptions.java:68`)]
- **Per map.** A map mod ships `WorldGenOverride.lua` in its map folder; it runs when the generator is built, for each map in the world's list. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:83`, `zombie/iso/worldgen/WorldGenChunk.java:121-131`)]

See [WorldGenParams](/pz/build-42/modding/reference/lua-classes-world-3#worldgenparams), [WorldGenUtils](/pz/build-42/modding/reference/lua-classes-world-3#worldgenutils) and the [global functions](/pz/build-42/modding/reference/lua-global-functions). There is no event during generation.

## 6. The seed changes zombies on the drawn map

When the game reads each cell's zombie intensity, it multiplies it by noise layers built from the world seed, so the seed changes where the drawn map has no zombies.

Each layer is a Voronoi pattern; where its value falls under the layer's cutoff, the chunk's intensity becomes 0. Vanilla has two layers, one with scale 12 and cutoff 0.15 and one with scale 55 and cutoff 0.08, each seeded with the world seed plus its index. :cite[(`media/lua/server/Zombies/VoronoiNoise.lua:1-14`, `zombie/iso/worldgen/zombie/ZombieVoronoi.java:29-40`, `zombie/iso/worldgen/zombie/ZombieVoronoi.java:104-107`)] So two worlds on the same map with different seeds have zombie-free chunks in different places. The sandbox option **Voronoi Noise** ("Controls whether some randomization is applied to zombie distribution", on by default) sets the cutoff to 0 when off, which leaves the map's numbers untouched. :cite[(`zombie/SandboxOptions.java:68`, `zombie/iso/worldgen/zombie/ZombieVoronoi.java:99-102`, `media/lua/shared/Sandbox/Apocalypse.lua:5`)]

```java
List<double[]> voronoisValues = IsoWorld.instance.getZombieVoronois().stream().map(vx -> vx.evaluateCellCutoff(wX, wY)).toList();
...
      for (double[] values : voronoisValues) {
         v *= values[wy * 32 + wx];
      }
      intensity = (int)(intensity * v);
```

The multiplication happens when the cell's data is read into the meta grid. :cite[(`zombie/iso/IsoMetaGrid.java:2340-2363`)]

## 7. What a mod or a map can and cannot change

A mod can change the data tables and the zombie noise, but it cannot add a new generation step.

**Can:** add or change biomes, features, selection rules, roads, veins and prefabs in the `worldgen` table; map new pixel values to biomes in `biome_map_config`; force biomes or prefabs on rectangles with `static_modules` in a map's `WorldGenOverride.lua`; tune or remove the zombie noise layers; or paint the biome image so drawn forest grows the trees you want, which is the mapper's side (see [Biomemap](/pz/build-42/mapping/fundamentals/biomemap)). :cite[(`zombie/iso/worldgen/WorldGenChunk.java:84-114`, `zombie/iso/worldgen/WorldGenChunk.java:222-259`)]

**Cannot, from Lua:** add a new kind of generation step, hook a square while it is generated, or regenerate a chunk that already exists in a save. :cite[(`zombie/iso/IsoChunk.java:2321-2345`)]

Traps:

- **Edit the tables when your file loads, not in an event.** The generator reads them in `CreateStep1`, before `OnInitWorld`. Change them at the top level of a `media/lua/server` file, and `require` the vanilla file you change first (vanilla's own files do this with `require("WorldGen/WorldGen")`), because `WorldGen.lua` replaces the whole `worldgen` table when it runs. :cite[(`zombie/iso/IsoMetaGrid.java:1480-1485`, `zombie/iso/IsoWorld.java:1901-1912`, `media/lua/server/WorldGen/WorldGen.lua:1-17`, `media/lua/server/WorldGen/Roads.lua:1`)]
- **Changing the data on an existing save only reaches new ground.** Chunks already saved keep what was generated. Test worldgen changes on a fresh world. :cite[(`zombie/iso/IsoChunk.java:2321-2345`)]
- **A broken module fails quietly.** A static module with neither `biome` nor `prefab` throws inside the generator; in a "random" chunk the generator catches it, logs "Failed to load chunk, blocking out area" and leaves that chunk's squares empty. Look for that line in the log when ground goes missing. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:177-194`, `zombie/iso/worldgen/WorldGenChunk.java:250-252`)]
- **A second `roads` entry replaces the first one's roads.** In the random pass the loop assigns each road generator's roads to the same variable instead of adding them, so only the last generator's roads are used. Vanilla has one road entry (`small_road`), so vanilla is not affected. We read this; we have not run it. :cite[(`zombie/iso/worldgen/WorldGenChunk.java:165-169`, `media/lua/server/WorldGen/Roads.lua:3-19`)]
- **The seed is part of the zombie layout.** Two servers on the same map and sandbox but different seeds do not have the same zombie density map, unless Voronoi Noise is off. :cite[(`zombie/iso/worldgen/zombie/ZombieVoronoi.java:36`, `zombie/iso/worldgen/zombie/ZombieVoronoi.java:99-102`)]
- **`-no-worldgen` on a server is total.** Every chunk with a gap stays a gap, including the generated land beyond the map edge, and drawn chunks keep their vegetation exactly as drawn. :cite[(`zombie/iso/IsoChunk.java:2259-2262`, `zombie/network/GameServer.java:581-582`)]

:::callout[How we know]{kind=proof}
Everything above was read from the 42.22 decompiled code (capture B42_3d39148846) and the vanilla Lua in the same capture. Not tested in a running game: the zombie claim (the test is two fresh single-player worlds in debug mode on the same map and sandbox, seeds "a" and "b", Voronoi Noise on, turning on the world map's `ZombieIntensity` debug option and comparing the same area, then repeating with Voronoi Noise off and expecting the two to match; the map renderer also has `ZombieVoronoi` and `ZombieCutoff` options that draw the noise itself), the second-road-entry quirk, and the world version written to `map_worldgen.bin`. Vanilla's `WorldGenOverride.lua` is not in our capture.
:::

## 8. Where to go next

- [Biomemap](/pz/build-42/mapping/fundamentals/biomemap), the image this page keeps referring to, from the mapper's side.
- [Build 41 vs Build 42 mapping delta](/pz/build-42/mapping/fundamentals/b41-vs-b42-mapping-delta), for `WorldGenOverride.lua` and the other new map files.
- [Erosion](/pz/build-42/modding/engine/erosion), whose single-player random draws come from the same seed.
- [Stories and randomized content](/pz/build-42/modding/engine/randomized-stories), the other thing that happens to a brand-new chunk.
