---
id: build-42-the-map-expansion-knox-country-new-towns
slug: the-map-expansion-knox-country-new-towns
title: The map expansion (Knox Country) + new towns
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
  What the 42.22 files show of Knox Country: 11 map folders, a 78 by 63 cell world, 256-square cells, 8-square chunks, and a 300-square spawn rule. Counts and town history are not verified.
last_updated: '2026-11-15'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - map-files-map-info-spawnpoints-lua-folder-structure
  - multi-z-the-vertical-engine-change
  - tile-system
  - map-tile-modder-migration-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- The game ships 11 map folders, besides `challengemaps` (which holds the `Tutorial` map, 13 files). One, `Muldraugh, KY`, holds the lot data. The other ten are start places that read it through `lots=Muldraugh, KY`. That list is on the game's disk, not in the capture's code, and was read on the reading machine.
- The vanilla world covers cells 0 to 77 across and 0 to 62 down, which is 78 by 63 = 4914 cells, and 4065 of them have a lot file.
- A cell is 256 squares wide, which is 32 chunks of 8 squares. The old page called the chunk size uncertain; the code and the game's own `map.info` state it.
- The game's own start places give spawn points as plain square positions. The old 300-square cell format is still read when a spawn point carries `worldX`.
- The old page's building and tile counts, its lists of rebuilt and new towns, and its "32 floors" for Louisville came from dev blogs. The game files read here do not state them, so they are not verified.
:::

:::facts
- **Map folders in the game** 11 besides `challengemaps` (1 with lot data, 10 start places)
- **World size in cells** 78 by 63 = 4914, of which 4065 have lot data
- **World size in squares** 19,968 by 16,128
- **Cell** 256 squares, 32 chunks
- **Chunk** 8 squares
:::

Outcast, the old page told the story of the new Knox Country from dev blogs. This page keeps what the game's own files and code can prove, and says which parts of the story they cannot.

## 1. The game ships eleven map folders

The base game has one folder with the world and ten start-place folders, and the start-place folders carry almost no data of their own.

The folders are `Brandenburg, KY`, `Echo Creek, KY`, `Ekron, KY`, `Fallas Lake, KY`, `Irvington, KY`, `March Ridge, KY`, `Muldraugh, KY`, `Riverside, KY`, `Rosewood, KY`, `Valley Station, KY` and `West Point, KY`. :cite[(`game_snapshot/LIVE_MEDIA_INVENTORY.tsv`)] Ten of them have a `map.info` with `lots=Muldraugh, KY`, and only `Muldraugh, KY` has lot files, which is how the start places share one world. The [map files page](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure) explains `lots=`. These are facts about the installed game's `media/maps/` folder read on 2026-11-15, which the capture's `game_snapshot` does not hold as files.

| Folder | Game modes | Spawn points | First spawn square | Its cell |
|---|---|---|---|---|
| `Muldraugh, KY` | all | 21 | 10770, 10271 | 42, 40 |
| `Rosewood, KY` | all | 20 | 7976, 11402 | 31, 44 |
| `Riverside, KY` | all | 21 | 5739, 5258 | 22, 20 |
| `West Point, KY` | all | 20 | 11308, 6671 | 44, 26 |
| `Brandenburg, KY` | Sandbox only | 1 | 2152, 6089 | 8, 23 |
| `Echo Creek, KY` | Sandbox only | 1 | 3573, 10899 | 13, 42 |
| `Ekron, KY` | Sandbox only | 1 | 411, 9761 | 1, 38 |
| `Fallas Lake, KY` | Sandbox only | 1 | 7213, 8288 | 28, 32 |
| `Irvington, KY` | Sandbox only | 1 | 1912, 14381 | 7, 56 |
| `March Ridge, KY` | Sandbox only | 1 | 9883, 12812 | 38, 50 |
| `Valley Station, KY` | Sandbox only | 1 | 12595, 5330 | 49, 20 |

The cell column is the square divided by 256, rounded down, which is our arithmetic. The four larger folders list several spawn groups (poor, medium and rich houses, doctor, police and fire stations), and the seven others a single spawn for the `unemployed` group. The seven Sandbox-only folders say so with `only_for_game_mode=GameMode.SANDBOX` in their `map.info`.

The world covers cells 0 to 77 across and 0 to 62 down by the numbers in the lot file names, and 4065 cells have a lot file. :cite[(`game_snapshot/LIVE_MEDIA_INVENTORY.tsv`)] The world's `biomemap` pictures number 4914, which is 78 times 63, so every cell of the rectangle has one. That means the vanilla rectangle is 19,968 squares across and 16,128 down. The edges and empty cells are not tested.

## 2. A cell is 256 squares and a chunk is 8

The old page's open question about the chunk size has an answer: a chunk is 8 squares, and a cell is 32 chunks, or 256 squares.

The engine states both as constants. :cite[(`zombie/iso/IsoChunkMap.java:54`, `zombie/iso/IsoCell.java:126-127`)] 

The vanilla map's own `map.info` says it in words: "Chunk size is 8x8, Cell size is 256x256". 

The old page also relayed the community wiki's rule that the editors work in 300-square cells and export 256-square cells. That is about the tools and is on the [mapping pages](/pz/build-42/mapping/fundamentals/the-cell-size-question). The code shows only the 256.

The levels in a column run from -32 to 31, so a building can have up to 32 floors at or above the ground. :cite[(`zombie/iso/IsoChunkMap.java:48-51`)] Whether any Louisville building uses all of them is not in these files. See [Multi-Z](/pz/build-42/modding/world-and-tiles/multi-z-the-vertical-engine-change).

## 3. The 300-square rule is still in the spawn code

The game still reads the old spawn format with 300-square cells, so a spawn point that gives `worldX` and `worldY` is multiplied by 300.

When the chosen spawn point has `worldX`, the character-creation screen sets the start to `worldX * 300 + posX`, and the same for Y, and the code's own comment calls it the old format with 300 by 300 cell coordinates. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:1116-1119`)] The cooperative creation screen does the same. :cite[(`media/lua/client/OptionScreens/CoopCharacterCreation.lua:42-45`)]

Without `worldX` the position is a plain square. The base game's own spawn points are plain squares, as the table above shows. The old page called the 300 grid "baked into more than just the editor". The game code shows it baked into this one old-format rule, and nothing else we read.

The old page's worked example said that Build 41 cell (31, 23) exports to Build 42 cells (36, 26) to (37, 28). The arithmetic fits when the absolute squares stay the same: 31 times 300 is 9300 and 23 times 300 is 6900, so the 300 by 300 cell covers squares 9300 to 9599 across and 6900 to 7199 down, and dividing by 256 touches cells 36 and 37 across and 26, 27 and 28 down. That the tools keep the squares is the wiki's claim and is not verified.

## 4. Two map folders with the same lot file clash

The game reports two map folders that both carry a lot file of the same name as a conflict, which is the code's version of the old page's "adjacent cells will clash".

It collects the lot header names of every folder, and when two folders share one name it writes a conflict message for each. :cite[(`zombie/MapGroups.java:503-519`)] How the game layers the two is on the [migration checklist](/pz/build-42/modding/world-and-tiles/map-tile-modder-migration-checklist). The wiki's wording that "one will not be loaded in" is not verified.

:::callout[How we know]{kind=proof}
- The code citations were read in the 42.22 decompile. The map folder facts come from the installed game's `media/maps/` folder and the capture's file listing, read 2026-11-15. The folders are not part of the capture's `game_snapshot`; the install's build id (26486631) matches the capture's.
- Changed: the chunk size. The old page said it could not be stated. It is 8 squares (`zombie/iso/IsoChunkMap.java:54`).
- Changed: spawn math. The old page said "spawnpoint cell math still treats a cell as 300x300". Only a spawn point with `worldX` does, and the game's own are plain squares.
- Dropped, not verified: "about 1,400 unique buildings", "about 20,000 tiles (Build 41 had about 15,000)", "Rosewood, Riverside, West Point, Fallas Lake, Muldraugh and Ekron were reworked", "Brandenburg is a new location on the Ohio River", "Irvington is known for its race track", and "Louisville skyscrapers hold up to 32 floors". They came from dev blogs. The map files show that the folders exist, not their history or their contents.
- Dropped, not verified: the editors' export details, "active" and "inactive" areas of an exported cell, and the community wiki's quotes about 300 and 256. See the [cell size page](/pz/build-42/mapping/fundamentals/the-cell-size-question).
:::

## Where to go next

- [Map files and folders](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure)
- [Multi-Z](/pz/build-42/modding/world-and-tiles/multi-z-the-vertical-engine-change)
- [The cell size question](/pz/build-42/mapping/fundamentals/the-cell-size-question)
