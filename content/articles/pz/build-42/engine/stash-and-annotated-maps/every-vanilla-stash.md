---
id: build-42-every-vanilla-stash
slug: every-vanilla-stash
title: 'Every vanilla stash'
game: pz
version: build-42
section: engine
category: stash-and-annotated-maps
difficulty: intermediate
tags:
  - engine
  - stash
  - maps
  - loot
  - reference
excerpt: >-
  All 125 vanilla stash maps in Build 42.22: name, town, map item, building coordinates, loot table, zombies, boarded doors and special containers, with counts per town and how we counted.
last_updated: '2026-11-14'
related_articles:
  - how-stash-maps-work
  - inside-the-stash-system
  - paper-maps-and-annotations
  - modding-stashes
  - stash-and-maps-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [players looking for a cache](#every-stash-by-town) | [modders checking what is taken](#how-we-counted) | the rules behind the columns are in [Inside the stash system](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system)

:::callout[The 1-minute version]{kind=key}
- Vanilla has **125** stashes in 10 Lua files, all of type "Map". Every one has a unique name and a unique building point.
- 95 name a loot table; 30 do not and add only notes, zombies or boarded doors. 53 place a special container, 59 containers in all.
- The most common loot is Survivor Cache 1 (28 stashes), then Gun Cache 1 (15) and Tools Cache 1 (13).
- 29 stashes add zombies, 45 board up doors and windows, and 25 can only come from a corpse.
- 9 stashes use placeholder coordinates near 0,0. By the code they cannot be handed out by a roll.
:::

:::facts
- **Stashes** 125 in 10 files
- **Map items** 13 different town maps; 54 stashes share the Rosewood map
- **Loot tables used** 11
- **Day limits** 1 stash (days 0 to 30, which never excludes anything; see the day-count note in Inside the stash system)
- **Traps** 1 stash sets traps, and its value places none
:::

## How we counted

We counted with a script, not by eye.

It reads each of the ten `*StashDesc.lua` files line by line, skips comment lines, treats each `StashUtil.newStash(...)` call as one stash and collects every `stashMap.field = value`, `addContainer(...)` and `addStamp(...)` line after it until the next stash. :cite[(`media/lua/shared/StashDescriptions/StashUtil.lua:3-16`)]

Two independent checks agree with the script. A plain search for `StashUtil.newStash(` finds 125 calls, and the 125 drawing functions in `ISMapDefinitions.lua` are named for exactly these 125 stashes (8 Brandenburg, 8 Ekron, 10 Irvington, 16 Louisville, 10 March Ridge, 19 Muldraugh, 10 Riverside, 5 Rosewood, 23 World and 16 West Point). :cite[(`media/lua/client/ISUI/Maps/ISMapDefinitions.lua:626-1544`)] Commented-out lines such as `--stashMap.zombies = 5` are not counted, which is why a hand search for `zombies` gives more hits than the 29 stashes that really set it.

The totals below are therefore "what the 42.22 files define". We did not check which of them a given server has turned off with a mod, and we did not read the map data to confirm that each building point lies in a real building.

## Counts per town

The map items are named for towns, but the town files group stashes by where the building is, so a stash can use a map item from a neighboring town.

For example, Brandenburg, Ekron, Irvington, Rosewood and the scattered World stashes all use the Rosewood map item. :cite[(`BrandenburgStashDesc.lua:10`, `EkronStashDesc.lua:10`, `IrvingtonStashDesc.lua:10`, `WorldStashDesc.lua:10`)]

::bar[Muldraugh]{value=19 max=25 text="19 stashes" accent=orange}
::bar[Scattered (World file)]{value=23 max=25 text="23 stashes" accent=blue}
::bar[West Point]{value=16 max=25 text="16 stashes" accent=orange}
::bar[Louisville]{value=16 max=25 text="16 stashes" accent=blue}
::bar[Riverside]{value=10 max=25 text="10 stashes" accent=orange}
::bar[March Ridge]{value=10 max=25 text="10 stashes" accent=blue}
::bar[Irvington]{value=10 max=25 text="10 stashes" accent=orange}
::bar[Brandenburg]{value=8 max=25 text="8 stashes" accent=blue}
::bar[Ekron]{value=8 max=25 text="8 stashes" accent=orange}
::bar[Rosewood]{value=5 max=25 text="5 stashes" accent=blue}

| Town (file) | Stashes | Map items used | With a loot table | Special containers | Zombies set | Barricades set | Corpse-only | Placeholder building | Code |
|---|---|---|---|---|---|---|---|---|---|
| Rosewood | 5 | RosewoodMap | 5 | 5 | 2 | 0 | 1 | 0 | `RosewoodStashDesc.lua` |
| Muldraugh | 19 | MuldraughMap | 17 | 12 | 5 | 4 | 9 | 1 | `MulStashDesc.lua` |
| West Point | 16 | WestpointMap | 16 | 8 | 5 | 10 | 6 | 0 | `WpStashDesc.lua` |
| Riverside | 10 | RiversideMap | 8 | 3 | 0 | 5 | 0 | 0 | `RiversideStashDesc.lua` |
| March Ridge | 10 | MarchRidgeMap | 10 | 5 | 1 | 2 | 5 | 0 | `MarchRidgeStashDesc.lua` |
| Louisville | 16 | 8 Louisville maps | 11 | 7 | 0 | 5 | 1 | 0 | `LouisvilleStashDesc.lua` |
| Brandenburg | 8 | RosewoodMap | 6 | 4 | 3 | 2 | 2 | 0 | `BrandenburgStashDesc.lua` |
| Ekron | 8 | RosewoodMap | 5 | 7 | 2 | 3 | 0 | 3 | `EkronStashDesc.lua` |
| Irvington | 10 | RosewoodMap | 6 | 1 | 5 | 6 | 1 | 2 | `IrvingtonStashDesc.lua` |
| Scattered (World file) | 23 | RosewoodMap | 11 | 7 | 6 | 8 | 0 | 3 | `WorldStashDesc.lua` |
| **All** | **125** | 13 map items | **95** | **59** | **29** | **45** | **25** | **9** | 10 files |

Column meanings: "With a loot table" counts stashes that name a `spawnTable`; "Special containers" counts container entries (some stashes place more than one); "Placeholder building" means both coordinates are under 100. :cite[(`StashSystem.java:247`, `StashSystem.java:308-364`)]

## Counts by loot table

Eleven loot tables are used, and Survivor Cache 1 alone covers more than a fifth of all stashes. :cite[(`media/lua/server/Items/Distributions.lua:20971-22594`)]

:::chips
- Survivor Cache 1: 28
- Gun Cache 1: 15
- Tools Cache 1: 13
- Shotgun Cache 1: 11
- Food Cache 1: 8
- Survivor Cache 2: 7
- Gun Cache 2: 6
- Medical Cache 1: 4
- Shotgun Cache 2: 1
- Survivor Cache Big Building: 1
- Booze Cache 1: 1
- No loot table: 30
:::

What a table holds, in short, by the container types it fills. Each `Cache` name is a key in `Distributions.lua`; the container types inside it decide which chests, counters and crates get refilled. :cite[(`StashSystem.java:261-279`)]

| Table | Container types it fills | Main contents | Code |
|---|---|---|---|
| GunCache1 | GunBox, counter, plankstash, Bag_DuffelBagTINT | ammo boxes, handguns, shotgun, varmint and hunting rifles, scopes, holsters, money | :cite[(`Distributions.lua:21196-21372`)] |
| GunCache2 | GunBox, Bag_DuffelBagTINT | similar to Gun Cache 1, fewer entries | :cite[(`Distributions.lua:21374-21477`)] |
| ShotgunCache1 | ShotgunBox, plankstash, Bag_DuffelBagTINT | shotguns (including sawn-off), shells, choke tubes | :cite[(`Distributions.lua:21930-22008`)] |
| ShotgunCache2 | ShotgunBox, counter | shotguns, double barrel, shells | :cite[(`Distributions.lua:22010-22057`)] |
| ToolsCache1 | ToolsBox, counter, Bag_DuffelBagTINT | hammers, saws, wrenches, crowbar, nails, rope, tarp | :cite[(`Distributions.lua:22441-22594`)] |
| FoodCache1 | FoodBox | candy, canned food, drinks | :cite[(`Distributions.lua:21034-21194`)] |
| SurvivorCache1 | counter, SurvivorCrate | counters: canned food 1-7, dry food 1-2, melee weapons 1-2, one firearm; crate: cans, water, jerky, crisps, backpack | :cite[(`Distributions.lua:22059-22184`)] |
| SurvivorCache2 | counter, SurvivorCrate | same crate item list as Survivor Cache 1 (the 94 listed items are identical); counters roll the same as Cache 1 | :cite[(`Distributions.lua:22186-22311`, `Distributions.lua:22188-22193`)] |
| SurvivorCacheBigBuilding | counter, SurvivorCrate | same crate item list as Survivor Cache 1; counters differ: canned food 0-7, dry food 0-1, one random kitchen item 0-1, melee weapon at a 20 percent weight, firearm at 10 | :cite[(`Distributions.lua:22313-22439`, `Distributions.lua:22315-22320`)] |
| MedicalCache1 | MedicalBox | bandages, antibiotics, pills, disinfectant, suture kit, first-aid books | :cite[(`Distributions.lua:21479-21522`)] |
| BoozeCache1 | BoozeBox, plankstash | spirits, wine, beer, corkscrew, bottle opener | :cite[(`Distributions.lua:20971-21032`)] |

All are under `media/lua/server/Items/`. A twelfth table, BombCache1, exists but no vanilla stash uses it. :cite[(`Distributions.lua:20927-20969`)]

## What the other columns mean

The numbers in each row come straight from the file, and the table below reads them as follows. :cite[(`Stash.java:45-98`, `StashSystem.java:286`, `StashSystem.java:380-415`)]

- **Zed** is the `zombies` value: a percent chance per floor square of each room, before the zombie-count sandbox option moves it. Values in vanilla run from 1 to 20 (1: 7 stashes, 2: 6, 3: 4, 5: 4, 7: 2, 8: 2, 10: 3, 20: 1).
- **Barr** is the `barricades` value: a percent chance that each door and window that allows boards gets them. Values run from 20 to 90 (80 is the most common, on 18 stashes).
- **Zed-only** means `spawnOnlyOnZed = true`: the map can only come from a container on a corpse. :cite[(`StashSystem.java:216-221`)]
- **Special container** is the first argument of `addContainer` (the container type), the bag or tile it comes in, and the room it was told to use.
- **Building x,y** is the point the map's reading sets up. It must lie strictly inside the building's bounds. :cite[(`StashSystem.java:240`)]

## Every stash by town

Each stash is one row, grouped by the file it lives in, and the Code column is the file and line of its `newStash` call.

### Rosewood: 5 stashes

All 5 stashes in `RosewoodStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| RosewoodStashMap1 | RosewoodMap | 8238,11555 | GunCache1 | 5 | - | - | GunBox in Bag_DuffelBagTINT | guns | :cite[(`RosewoodStashDesc.lua:4`)] |
| RosewoodStashMap2 | RosewoodMap | 8305,11558 | ShotgunCache1 | - | - | - | ShotgunBox tile @office | shotgun | :cite[(`RosewoodStashDesc.lua:17`)] |
| RosewoodStashMap3 | RosewoodMap | 8415,11555 | ToolsCache1 | 2 | - | yes | ToolsBox in Bag_DuffelBagTINT | tools (days 0-30) | :cite[(`RosewoodStashDesc.lua:29`)] |
| RosewoodStashMap4 | RosewoodMap | 8000,11438 | FoodCache1 | - | - | - | FoodBox in Bag_DuffelBagTINT @kitchen | food cache | :cite[(`RosewoodStashDesc.lua:46`)] |
| RosewoodStashMap5 | RosewoodMap | 8076,11312 | FoodCache1 | - | - | - | FoodBox in Bag_DuffelBagTINT | unlooted restaurant | :cite[(`RosewoodStashDesc.lua:59`)] |

### Muldraugh: 19 stashes

All 19 stashes in `MulStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| MulStashMap1 | MuldraughMap | 10660,9758 | GunCache1 | - | - | yes | GunBox tile @livingroom | guns | :cite[(`MulStashDesc.lua:4`)] |
| MulStashMap2 | MuldraughMap | 10876,10191 | GunCache1 | 3 | - | yes | GunBox in Bag_DuffelBagTINT |  | :cite[(`MulStashDesc.lua:18`)] |
| MulStashMap11 | MuldraughMap | 10612,9649 | ShotgunCache1 | - | - | yes | GunBox in Bag_DuffelBagTINT |  | :cite[(`MulStashDesc.lua:30`)] |
| MulStashMap3 | MuldraughMap | 10673,10188 | ShotgunCache1 | - | - | - | ShotgunBox tile @hall | shotgun | :cite[(`MulStashDesc.lua:44`)] |
| MulStashMap4 | MuldraughMap | 10873,10025 | ShotgunCache1 | - | - | - | ShotgunBox tile @livingroom |  | :cite[(`MulStashDesc.lua:54`)] |
| MulStashMap12 | MuldraughMap | 10619,10529 | ShotgunCache1 | 2 | 50 | - | ShotgunBox tile at 10619,10532,0 |  | :cite[(`MulStashDesc.lua:66`)] |
| MulStashMap5 | MuldraughMap | 10875,10080 | ToolsCache1 | - | - | - | ToolsBox tile @kitchen | tools | :cite[(`MulStashDesc.lua:80`)] |
| MulStashMap13 | MuldraughMap | 10689,10359 | ToolsCache1 | - | 80 | yes | ToolsBox tile at 10696,10371,0 |  | :cite[(`MulStashDesc.lua:87`)] |
| MulStashMap6 | MuldraughMap | 10698,9524 | ToolsCache1 | - | - | yes | ToolsBox tile |  | :cite[(`MulStashDesc.lua:100`)] |
| MulStashMap7 | MuldraughMap | 10882,9888 | SurvivorCache1 | - | 80 | yes | - | survivor houses | :cite[(`MulStashDesc.lua:114`)] |
| MulStashMap8 | MuldraughMap | 10854,9927 | SurvivorCache1 | 7 | - | yes | - |  | :cite[(`MulStashDesc.lua:126`)] |
| MulStashMap9 | MuldraughMap | 10686,9909 | SurvivorCache1 | 10 | - | yes | - | danger houses | :cite[(`MulStashDesc.lua:139`)] |
| MulStashMap10 | MuldraughMap | 10719,9989 | SurvivorCache1 | 10 | - | yes | - |  | :cite[(`MulStashDesc.lua:147`)] |
| MulStashMap14 | MuldraughMap | 10667,9577 | SurvivorCache1 | - | 80 | - | - | survivor house | :cite[(`MulStashDesc.lua:159`)] |
| MulStashMap15 | MuldraughMap | 10781,9883 | MedicalCache1 | - | - | - | MedicalBox tile @livingroom | medical cache | :cite[(`MulStashDesc.lua:171`)] |
| MulStashMap16 | MuldraughMap | 10628,9698 | GunCache1 | - | - | - | GunBox in Bag_DuffelBagTINT | gun cache | :cite[(`MulStashDesc.lua:183`)] |
| MulStashMap17 | MuldraughMap | 10608,9615 | - | - | - | - | - | unlooted store | :cite[(`MulStashDesc.lua:195`)] |
| MulStashMap18 | MuldraughMap | 10976,9729 | GunCache1 | - | - | - | GunBox in Bag_DuffelBagTINT | gun cache | :cite[(`MulStashDesc.lua:204`)] |
| MulStashMap19 | MuldraughMap | 8,0 | - | - | - | - | - | no changes | :cite[(`MulStashDesc.lua:215`)] |

### West Point: 16 stashes

All 16 stashes in `WpStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| WpStashMap1 | WestpointMap | 10941,6726 | GunCache1 | - | - | - | GunBox tile | guns | :cite[(`WpStashDesc.lua:4`)] |
| WpStashMap2 | WestpointMap | 11040,6731 | GunCache1 | - | 30 | - | - |  | :cite[(`WpStashDesc.lua:18`)] |
| WpStashMap3 | WestpointMap | 11318,6727 | ShotgunCache1 | 3 | - | yes | (no type) in Bag_DuffelBagTINT | shotgun | :cite[(`WpStashDesc.lua:31`)] |
| WpStashMap4 | WestpointMap | 11187,6735 | ShotgunCache1 | - | 20 | - | (no type) in Bag_DuffelBagTINT |  | :cite[(`WpStashDesc.lua:40`)] |
| WpStashMap11 | WestpointMap | 11980,6813 | ShotgunCache1 | - | 40 | - | (no type) in Bag_DuffelBagTINT |  | :cite[(`WpStashDesc.lua:51`)] |
| WpStashMap5 | WestpointMap | 11439,6732 | ToolsCache1 | - | 30 | - | ToolsBox tile @bedroom | tools | :cite[(`WpStashDesc.lua:66`)] |
| WpStashMap6 | WestpointMap | 11496,6703 | ToolsCache1 | 7 | - | yes | ToolsBox tile |  | :cite[(`WpStashDesc.lua:77`)] |
| WpStashMap7 | WestpointMap | 11621,6779 | SurvivorCache1 | - | - | yes | - | survivor houses | :cite[(`WpStashDesc.lua:89`)] |
| WpStashMap8 | WestpointMap | 11507,6800 | SurvivorCache1 | 3 | 40 | yes | - |  | :cite[(`WpStashDesc.lua:96`)] |
| WpStashMap9 | WestpointMap | 11656,6816 | SurvivorCache2 | 20 | 40 | yes | - | danger houses | :cite[(`WpStashDesc.lua:110`)] |
| WpStashMap10 | WestpointMap | 11645,6694 | SurvivorCache2 | - | 30 | yes | - |  | :cite[(`WpStashDesc.lua:122`)] |
| WpStashMap12 | WestpointMap | 11981,6943 | SurvivorCache2 | 10 | 80 | - | - |  | :cite[(`WpStashDesc.lua:134`)] |
| WpStashMap13 | WestpointMap | 10890,6741 | GunCache1 | - | - | - | GunBox in Bag_DuffelBagTINT | gun/weapon cache | :cite[(`WpStashDesc.lua:150`)] |
| WpStashMap14 | WestpointMap | 11288,6583 | FoodCache1 | - | - | - | FoodBox tile at 11286,6580,0 | food cache | :cite[(`WpStashDesc.lua:161`)] |
| WpStashMap15 | WestpointMap | 12058,7368 | SurvivorCache1 | - | 80 | - | - | survivor house | :cite[(`WpStashDesc.lua:171`)] |
| WpStashMap16 | WestpointMap | 11141,6862 | SurvivorCache1 | - | 80 | - | - | survivor house | :cite[(`WpStashDesc.lua:181`)] |

### Riverside: 10 stashes

All 10 stashes in `RiversideStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| RiversideStashMap1 | RiversideMap | 6763,5479 | SurvivorCache1 | - | 80 | - | - | food cache/survivor house | :cite[(`RiversideStashDesc.lua:4`)] |
| RiversideStashMap2 | RiversideMap | 7146,6075 | ToolsCache1 | - | - | - | ToolsBox in Bag_DuffelBagTINT at 7145,6075,1 | tool cache | :cite[(`RiversideStashDesc.lua:15`)] |
| RiversideStashMap3 | RiversideMap | 6207,5346 | - | - | - | - | - | location info | :cite[(`RiversideStashDesc.lua:26`)] |
| RiversideStashMap4 | RiversideMap | 6763,5330 | SurvivorCache1 | - | 80 | - | - | Survivor House | :cite[(`RiversideStashDesc.lua:38`)] |
| RiversideStashMap5 | RiversideMap | 6413,5351 | SurvivorCache1 | - | 80 | - | - | Survivor House | :cite[(`RiversideStashDesc.lua:50`)] |
| RiversideStashMap6 | RiversideMap | 6224,5471 | GunCache1 | - | - | - | GunBox tile @kitchen | gun cache in floorboards | :cite[(`RiversideStashDesc.lua:60`)] |
| RiversideStashMap7 | RiversideMap | 6629,5330 | SurvivorCache1 | - | 80 | - | - | survivor house | :cite[(`RiversideStashDesc.lua:71`)] |
| RiversideStashMap8 | RiversideMap | 6502,5561 | FoodCache1 | - | - | - | FoodBox tile at 6502,5561,0 | food cache | :cite[(`RiversideStashDesc.lua:83`)] |
| RiversideStashMap9 | RiversideMap | 6057,5347 | SurvivorCache1 | - | 80 | - | - | survivor house | :cite[(`RiversideStashDesc.lua:95`)] |
| RiversideStashMap10 | RiversideMap | 6495,5265 | - | - | - | - | - | location info | :cite[(`RiversideStashDesc.lua:107`)] |

### March Ridge: 10 stashes

All 10 stashes in `MarchRidgeStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| MarchRidgeStashMap1 | MarchRidgeMap | 9885,12647 | GunCache2 | - | - | yes | GunBox in Bag_DuffelBagTINT | guns | :cite[(`MarchRidgeStashDesc.lua:4`)] |
| MarchRidgeStashMap2 | MarchRidgeMap | 9926,12676 | GunCache1 | - | - | yes | GunBox in Bag_DuffelBagTINT |  | :cite[(`MarchRidgeStashDesc.lua:20`)] |
| MarchRidgeStashMap3 | MarchRidgeMap | 9979,12720 | ShotgunCache2 | - | - | yes | - | shotgun (traps 1) | :cite[(`MarchRidgeStashDesc.lua:34`)] |
| MarchRidgeStashMap4 | MarchRidgeMap | 9886,12748 | ShotgunCache1 | - | - | - | ShotgunBox in Bag_DuffelBagTINT |  | :cite[(`MarchRidgeStashDesc.lua:47`)] |
| MarchRidgeStashMap5 | MarchRidgeMap | 9970,12779 | ToolsCache1 | - | - | - | ToolsBox in Bag_DuffelBagTINT | tools | :cite[(`MarchRidgeStashDesc.lua:59`)] |
| MarchRidgeStashMap6 | MarchRidgeMap | 9947,12832 | ToolsCache1 | - | - | yes | - |  | :cite[(`MarchRidgeStashDesc.lua:70`)] |
| MarchRidgeStashMap7 | MarchRidgeMap | 9885,12813 | SurvivorCache1 | - | 50 | yes | - | survivor houses | :cite[(`MarchRidgeStashDesc.lua:81`)] |
| MarchRidgeStashMap8 | MarchRidgeMap | 9833,13128 | ToolsCache1 | - | - | - | - | tool cache | :cite[(`MarchRidgeStashDesc.lua:93`)] |
| MarchRidgeStashMap9 | MarchRidgeMap | 10092,12619 | SurvivorCacheBigBuilding | 5 | 50 | - | - | survivor building/general caches | :cite[(`MarchRidgeStashDesc.lua:102`)] |
| MarchRidgeStashMap10 | MarchRidgeMap | 10332,12794 | MedicalCache1 | - | - | - | MedicalBox tile at 10318,12780,0 | floorboard medical stash, beside church piano | :cite[(`MarchRidgeStashDesc.lua:114`)] |

### Louisville: 16 stashes

All 16 stashes in `LouisvilleStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| LouisvilleStashMap1 | LouisvilleMap8 | 12841,3593 | GunCache1 | - | - | - | GunBox in Bag_DuffelBagTINT | gun cache | :cite[(`LouisvilleStashDesc.lua:4`)] |
| LouisvilleStashMap2 | LouisvilleMap7 | 12643,3226 | SurvivorCache1 | - | - | - | SurvivorCrate tile at 12643,3228,0 | general cache | :cite[(`LouisvilleStashDesc.lua:16`)] |
| LouisvilleStashMap3 | LouisvilleMap8 | 13003,3246 | ToolsCache1 | - | - | - | Toolbox tile | tools | :cite[(`LouisvilleStashDesc.lua:29`)] |
| LouisvilleStashMap4 | LouisvilleMap9 | 13961,3231 | - | - | - | - | - | general location info | :cite[(`LouisvilleStashDesc.lua:40`)] |
| LouisvilleStashMap5 | LouisvilleMap4 | 12148,2450 | SurvivorCache1 | - | 80 | - | - | survivor house | :cite[(`LouisvilleStashDesc.lua:53`)] |
| LouisvilleStashMap6 | LouisvilleMap6 | 13786,2379 | SurvivorCache1 | - | 80 | - | ShotgunBox tile | survivor house | :cite[(`LouisvilleStashDesc.lua:67`)] |
| LouisvilleStashMap7 | LouisvilleMap6 | 14073,2616 | SurvivorCache1 | - | 80 | yes | - | survivor house, only spawn on zed | :cite[(`LouisvilleStashDesc.lua:81`)] |
| LouisvilleStashMap8 | LouisvilleMap5 | 13323,2121 | SurvivorCache1 | - | - | - | SurvivorCrate tile at 13323,2119,1 | survivor house | :cite[(`LouisvilleStashDesc.lua:95`)] |
| LouisvilleStashMap9 | LouisvilleMap5 | 13034,2839 | SurvivorCache1 | - | - | - | SurvivorCrate tile at 13035,2837,0 | guns and food cache | :cite[(`LouisvilleStashDesc.lua:109`)] |
| LouisvilleStashMap10 | LouisvilleMap4 | 12280,2032 | FoodCache1 | - | - | - | FoodBox tile @kitchen | food cache | :cite[(`LouisvilleStashDesc.lua:120`)] |
| LouisvilleStashMap11 | LouisvilleMap5 | 12702,2004 | - | - | - | - | - | general location info | :cite[(`LouisvilleStashDesc.lua:134`)] |
| LouisvilleStashMap12 | LouisvilleMap6 | 13733,1898 | - | - | - | - | - | general location info | :cite[(`LouisvilleStashDesc.lua:146`)] |
| LouisvilleStashMap13 | LouisvilleMap2 | 13266,1842 | - | - | - | - | - | car | :cite[(`LouisvilleStashDesc.lua:159`)] |
| LouisvilleStashMap14 | LouisvilleMap1 | 12191,1775 | SurvivorCache1 | - | 80 | - | - | survivor house | :cite[(`LouisvilleStashDesc.lua:172`)] |
| LouisvilleStashMap15 | LouisvilleMap1 | 12619,1406 | - | - | - | - | - | art gallery | :cite[(`LouisvilleStashDesc.lua:187`)] |
| LouisvilleStashMap16 | LouisvilleMap5 | 13520,2024 | SurvivorCache1 | - | 80 | - | - | survivor house | :cite[(`LouisvilleStashDesc.lua:201`)] |

### Brandenburg: 8 stashes

All 8 stashes in `BrandenburgStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| BBurgStashMap1 | RosewoodMap | 2174,6011 | GunCache1 | 5 | 50 | - | GunBox in Bag_DuffelBagTINT | survivor house, guns | :cite[(`BrandenburgStashDesc.lua:10`)] |
| BBurgStashMap2 | RosewoodMap | 1720,5934 | ToolsCache1 | 2 | - | - | - | tools | :cite[(`BrandenburgStashDesc.lua:23`)] |
| BBurgStashMap3 | RosewoodMap | 2132,6344 | GunCache2 | - | - | - | GunBox in Bag_DuffelBagTINT at 2133,6350,0 | guns | :cite[(`BrandenburgStashDesc.lua:32`)] |
| BBurgStashMap4 | RosewoodMap | 2736,6291 | FoodCache1 | - | - | yes | FoodBox tile at 2735,6288,0 | food | :cite[(`BrandenburgStashDesc.lua:43`)] |
| BBurgStashMap5 | RosewoodMap | 1936,6583 | - | - | - | - | - | location info | :cite[(`BrandenburgStashDesc.lua:53`)] |
| BBurgStashMap6 | RosewoodMap | 1675,6109 | ShotgunCache1 | - | - | - | ShotgunBox tile @livingroom | floorboard stash | :cite[(`BrandenburgStashDesc.lua:63`)] |
| BBurgStashMap7 | RosewoodMap | 2243,5820 | SurvivorCache2 | 2 | 75 | yes | - | survivor house | :cite[(`BrandenburgStashDesc.lua:73`)] |
| BBurgStashMap8 | RosewoodMap | 2774,5907 | - | - | - | - | - | remote house, always has random basement | :cite[(`BrandenburgStashDesc.lua:85`)] |

### Ekron: 8 stashes

All 8 stashes in `EkronStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| EkronStashMap1 | RosewoodMap | 493,9319 | MedicalCache1 | 2 | - | - | MedicalBox tile at 487,9313,0 | medical cache | :cite[(`EkronStashDesc.lua:10`)] |
| EkronStashMap2 | RosewoodMap | 390,9624 | GunCache2 | - | 40 | - | GunBox in Bag_AmmoBox_Mixed @kitchen x4 | ammo boxes | :cite[(`EkronStashDesc.lua:22`)] |
| EkronStashMap3 | RosewoodMap | 790,9540 | GunCache2 | - | 40 | - | GunBox in Bag_DuffelBagTINT @derelict | gun | :cite[(`EkronStashDesc.lua:37`)] |
| EkronStashMap4 | RosewoodMap | 415,9823 | SurvivorCache1 | 2 | 60 | - | - | survivor house | :cite[(`EkronStashDesc.lua:49`)] |
| EkronStashMap5 | RosewoodMap | 684,9830 | MedicalCache1 | - | - | - | MedicalBox in Bag_DuffelBagTINT @bathroom | medical | :cite[(`EkronStashDesc.lua:62`)] |
| EkronStashMap6 | RosewoodMap | 1,0 | - | - | - | - | - | rude message | :cite[(`EkronStashDesc.lua:73`)] |
| EkronStashMap7 | RosewoodMap | 2,0 | - | - | - | - | - | location info | :cite[(`EkronStashDesc.lua:81`)] |
| EkronStashMap8 | RosewoodMap | 3,0 | - | - | - | - | - | location info | :cite[(`EkronStashDesc.lua:90`)] |

### Irvington: 10 stashes

All 10 stashes in `IrvingtonStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| IrvingtonStashMap1 | RosewoodMap | 929,13035 | - | - | - | - | - | race track times | :cite[(`IrvingtonStashDesc.lua:10`)] |
| IrvingtonStashMap2 | RosewoodMap | 2899,14567 | SurvivorCache1 | 1 | 75 | yes | - | survivor house | :cite[(`IrvingtonStashDesc.lua:18`)] |
| IrvingtonStashMap3 | RosewoodMap | 2233,14271 | SurvivorCache2 | 1 | 75 | - | - | food | :cite[(`IrvingtonStashDesc.lua:36`)] |
| IrvingtonStashMap4 | RosewoodMap | 1778,14717 | GunCache2 | 1 | 25 | - | - | barricaded house | :cite[(`IrvingtonStashDesc.lua:49`)] |
| IrvingtonStashMap5 | RosewoodMap | 2224,14028 | FoodCache1 | 1 | 25 | - | FoodBox tile at 2225,14036,0 | food | :cite[(`IrvingtonStashDesc.lua:63`)] |
| IrvingtonStashMap6 | RosewoodMap | 2722,13962 | ToolsCache1 | - | 25 | - | - | tools | :cite[(`IrvingtonStashDesc.lua:75`)] |
| IrvingtonStashMap7 | RosewoodMap | 2549,14366 | SurvivorCache2 | 3 | 75 | - | - | survivor house | :cite[(`IrvingtonStashDesc.lua:85`)] |
| IrvingtonStashMap8 | RosewoodMap | 2469,14462 | - | - | - | - | - | location info | :cite[(`IrvingtonStashDesc.lua:95`)] |
| IrvingtonStashMap9 | RosewoodMap | 6,0 | - | - | - | - | - | location info, two storey house | :cite[(`IrvingtonStashDesc.lua:108`)] |
| IrvingtonStashMap10 | RosewoodMap | 7,0 | - | - | - | - | - | house | :cite[(`IrvingtonStashDesc.lua:121`)] |

### Scattered across the map (WorldStashDesc): 23 stashes

All 23 stashes in `WorldStashDesc.lua`. Each row's Code cell is the line of its `StashUtil.newStash` call.

| Name | Map item | Building x,y | Spawn table | Zed | Barr | Zed-only | Special container | Note | Code |
|---|---|---|---|---|---|---|---|---|---|
| WorldStashMap1 | RosewoodMap | 7301,8459 | SurvivorCache1 | 1 | 75 | - | - | survivor house | :cite[(`WorldStashDesc.lua:10`)] |
| WorldStashMap2 | RosewoodMap | 6931,8088 | GunCache1 | - | 75 | - | - | survivor house, guns | :cite[(`WorldStashDesc.lua:22`)] |
| WorldStashMap3 | RosewoodMap | 5466,9710 | - | - | - | - | - | location info | :cite[(`WorldStashDesc.lua:34`)] |
| WorldStashMap4 | RosewoodMap | 4704,7914 | - | - | - | - | - | survivor house | :cite[(`WorldStashDesc.lua:44`)] |
| WorldStashMap5 | RosewoodMap | 3971,6238 | ShotgunCache1 | - | - | - | ShotgunBox tile | gun floorboard stash | :cite[(`WorldStashDesc.lua:54`)] |
| WorldStashMap6 | RosewoodMap | 0,1 | - | - | - | - | - | location info | :cite[(`WorldStashDesc.lua:65`)] |
| WorldStashMap7 | RosewoodMap | 11690,8793 | FoodCache1 | - | - | - | FoodBox tile | food cache | :cite[(`WorldStashDesc.lua:76`)] |
| WorldStashMap8 | RosewoodMap | 11459,8953 | BoozeCache1 | - | - | - | BoozeBox tile | booze | :cite[(`WorldStashDesc.lua:91`)] |
| WorldStashMap9 | RosewoodMap | 11508,9745 | - | - | - | - | - | location info, railyard | :cite[(`WorldStashDesc.lua:101`)] |
| WorldStashMap10 | RosewoodMap | 11596,8309 | - | - | - | - | - | location info, crossroads town north of Dixie | :cite[(`WorldStashDesc.lua:113`)] |
| WorldStashMap11 | RosewoodMap | 10267,8743 | - | - | - | - | - | radio relay location, useless | :cite[(`WorldStashDesc.lua:126`)] |
| WorldStashMap12 | RosewoodMap | 13850,6769 | SurvivorCache1 | 5 | 75 | - | - | survivor house, large camping grounds site | :cite[(`WorldStashDesc.lua:136`)] |
| WorldStashMap13 | RosewoodMap | 14023,5476 | SurvivorCache1 | 1 | 35 | - | - | survivor house, Valley Station | :cite[(`WorldStashDesc.lua:155`)] |
| WorldStashMap14 | RosewoodMap | 14347,5453 | SurvivorCache2 | 1 | 45 | - | - | survivor house, east of Valley Station | :cite[(`WorldStashDesc.lua:167`)] |
| WorldStashMap15 | RosewoodMap | 14732,4084 | GunCache1 | - | - | - | - | gun cache | :cite[(`WorldStashDesc.lua:179`)] |
| WorldStashMap16 | RosewoodMap | 12516,4358 | - | - | - | - | - | army checkpoint map | :cite[(`WorldStashDesc.lua:187`)] |
| WorldStashMap17 | RosewoodMap | 5559,12479 | - | - | - | - | - | facility "raid" | :cite[(`WorldStashDesc.lua:199`)] |
| WorldStashMap18 | RosewoodMap | 13564,4048 | - | - | - | - | - | burned town info | :cite[(`WorldStashDesc.lua:209`)] |
| WorldStashMap19 | RosewoodMap | 10209,7416 | GunCache1 | - | 90 | - | - | gun cache | :cite[(`WorldStashDesc.lua:251`)] |
| WorldStashMap20 | RosewoodMap | 14549,4974 | GunCache2 | 8 | 80 | - | GunBox in Bag_AmmoBox_Mixed @church; GunBox in Bag_FoodCanned @church x2; GunBox in Bag_ShotgunDblBag @church | survivor bags, in small church | :cite[(`WorldStashDesc.lua:262`)] |
| WorldStashMap21 | RosewoodMap | 4,0 | - | - | - | - | - | location info | :cite[(`WorldStashDesc.lua:278`)] |
| WorldStashMap22 | RosewoodMap | 1226,11879 | - | 8 | 80 | - | - | survivor house | :cite[(`WorldStashDesc.lua:286`)] |
| WorldStashMap23 | RosewoodMap | 5,0 | - | - | - | - | - | Thunder Gas | :cite[(`WorldStashDesc.lua:294`)] |


:::callout[How we know]{kind=proof}
The rows are generated from the 42.22 Lua files by the script described above, so a number in a row is exactly what the file says. Not verified: that the nine placeholder-coordinate stashes cannot spawn (we did not read the map data), that every other building point is inside a real building, and the loot table summaries, which name the main contents, not every entry.
:::
