---
id: build-42-map-modding-toolchain-for-b42
slug: map-modding-toolchain-for-b42
title: Map-modding toolchain for B42
game: pz
version: build-42
section: modding
category: world-and-tiles
difficulty: intermediate
tags:
  - tiles
  - multi-z
  - basements
  - map-modding
  - tiledefs
excerpt: >-
  What the Build 42.22 game checks in a map tool's output, and what is only reported about the editors by the community wiki. Tool behavior is marked not verified and dated.
last_updated: '2026-11-15'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - map-tile-modder-migration-checklist
  - basements-the-underground-system
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- The map editors are separate programs, and the game's code cannot say which editor build is "ready". What it can say is what a tool's output must look like for the game to load it.
- A lot file must carry a version of 0 or 1, and a `.lotheader` must say its chunks are 8 by 8 squares, or that cell fails to load and the game logs an error for it.
- A tile name in a lot file that the game has no definition for is logged as "Missing tile definition", and the square is left without that tile.
- A basement piece is a `.pzby` file that starts with the four bytes `PZBY`. A `tiledef=` number in `mod.info` must be from 100 to 8189 or the mod is refused.
- Which community build of the tools to use, and whether official tools have shipped, is reported by the community wiki. It is not verified here, as of 2026-11-15. The [tools setup page](/pz/build-42/mapping/fundamentals/tools-setup) is where the mapping section keeps it.
:::

:::facts
- **Lot file versions the game accepts** 0 and 1
- **Chunk width the cell header must declare** 8 x 8 squares
- **Piece file marker** the four bytes `PZBY`
- **tiledef= range** 100 to 8189 (the old page said 100 to 8190)
- **Reported community tool builds** 2 (not verified)
:::

Outcast, a map tool is only as good as the files it writes, and the game is strict about three things in them. This page lists those checks first, since they hold for any tool, and then what the old page reported about the editors, kept apart and dated.

## 1. What the game checks in a tool's output

The game reads each lot file's version and refuses a version it does not know.

A `.lotpack` carries a version of 0 or 1, and anything else raises "Unsupported version". :cite[(`zombie/iso/IsoLot.java:134-139`)] A `.lotheader` does the same, and it must also say its chunk width and height are 8, or the loader throws "invalid chunk width". :cite[(`zombie/iso/IsoMetaGrid.java:2227`, `zombie/iso/IsoMetaGrid.java:2241`, `zombie/iso/IsoMetaGrid.java:2364-2369`)] When a cell throws, the game logs "ERROR loading" with the file's path and moves to the next cell. :cite[(`zombie/iso/IsoMetaGrid.java:2370-2374`)]

A lot file is therefore a hard fit. As read, a tool that writes 10-square chunks, as Build 41 did, produces a cell the game will not load.

A tile name that is not defined is not an error that stops the map. The game logs "Missing tile definition" with the name, and carries on without the tile. :cite[(`zombie/iso/IsoCell.java:2522-2525`)] The names a cell uses are listed in its `.lotheader`. :cite[(`zombie/iso/IsoMetaGrid.java:2228-2233`)] The tile definition side is on the [tile system page](/pz/build-42/modding/world-and-tiles/tile-system).

The two other checks are on a mod's own files. A basement piece begins with `PZBY`, then a version, its tile names, size, levels, rooms and buildings. :cite[(`zombie/iso/NewMapBinaryFile.java:216-264`)] A `tiledef=` line needs a file name and a number from 100 to 8189, and a line outside that range makes the mod fail to read. :cite[(`zombie/gameStates/ChooseGameInfo.java:305-326`)] The old page said to use a number from 100 to 8190 and to avoid anything above 8190; the game's own limit is 8189.

## 2. What the old page reported about the editors

The old page's account of the editors came from the community wiki and from TIS blog text quoted there, so all of it is not verified as of 2026-11-15.

- **Official tools.** It reported that no official Build 42 mapping tool had been released, that the tools are a public project anyone can compile, and that TIS would release WorldZed, TileZed and an animation tool (AnimZed) after the stable build and its hotfixes. It said the official package was TileZed, WorldEd and PNG tiles, with the building editor merged into TileZed, and that WorldEd joins cells into a map.
- **Two community builds.** It named the build by Alree (GitHub name Unjammer), a fork of the Build 41 tools with changes from before April 2025, and the Community Edition by Crater, a direct fork of the Build 42 official tools. It added that Crater's edition was the more up to date.
- **Reliability.** It quoted the wiki as saying the community tools are a reliable way to make Build 42 maps. It dropped an earlier warning that the tile definition files (`newtilesdef`) were the shakiest area, because the wiki did not back it.
- **Verdict.** It rated the toolchain "green" for building maps, buildings and basements now, and "yellow" for anything that needs official-tool features that had not shipped.

Those four points are dropped as advice, since a readiness grade is a judgment about software the capture does not hold. The facts in them are kept above and marked. The mapping section keeps the current tool notes on the [tools setup page](/pz/build-42/mapping/fundamentals/tools-setup) and the [cell-size page](/pz/build-42/mapping/fundamentals/the-cell-size-question); read those for which tool to run.

## 3. Reference material the old page listed

The old page listed one reference project and several building collections, all from the community wiki.

The reference project is `PZ_Vanilla_map_b42`, a Build 42 vanilla map export that rebuilds the Kentucky map as an editor project. The old page said its building files are reconstructions, because the original building metadata cannot be fully recovered. The building collections were listed as the official Building Pool, Blackbeard, okkydoo, Dylan, Community Architect and "B42 Vanilla Map Building Exports". None of this is verified here, and the repository's [mapping section](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) covers buildings.

:::callout[How we know]{kind=proof}
- The checks in section 1 are read from the 42.22 decompile: `IsoLot.java`, `IsoMetaGrid.java`, `IsoCell.java`, `NewMapBinaryFile.java` and `ChooseGameInfo.java`. None was tested with a deliberately bad file.
- Not verified, as of 2026-11-15: everything in sections 2 and 3, which is what the old page quoted from the community wiki ("Mapping", revision 1443363, and pages on the tools and the building editor) and a TIS blog post.
- The tiledef limit changed from the old page's figure. The game's check is `fileNumber < 100 || fileNumber > 8189`.
- Dropped: the old page's "readiness verdict" and the downgrade of the tiledef warning to "tool-version quirks". They were opinions about tool builds, not facts about the game.
:::
