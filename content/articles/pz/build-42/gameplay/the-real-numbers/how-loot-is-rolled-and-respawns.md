---
id: build-42-how-loot-is-rolled-and-respawns
slug: how-loot-is-rolled-and-respawns
title: 'How loot is rolled, and when it respawns'
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - loot
  - distributions
  - sandbox
  - loot-respawn
excerpt: >-
  Every container rolls its loot list a set number of times, and on each roll
  every item gets its own test: listed chance x 100 x your sandbox slider, out of
  10,000. Default sliders are 0.6 for most categories. Loot is rolled once per
  container and saved; respawn is off by default and, when on, only refills
  looted town containers holding fewer than 5 items. Read from the 42.21 code.
last_updated: '2026-10-04'
---
# How loot is rolled, and when it respawns

Every Outcast has opened an empty fridge in a full kitchen and blamed the game. Here is how Build 42.21 really fills a container, what the sandbox loot settings change, and when anything comes back.

## The short answer

- **Each container has a loot list.** The list says how many times to roll, and gives each item a chance.
- **On every roll, every item in the list gets its own test:** listed chance x 100 x your sandbox setting for that item's category, out of 10,000. An item listed at 8 with its setting at 0.6 has a **4.8% chance per roll**. Rolls are independent, so you can find the same item twice.
- **Default settings** (the Apocalypse preset, which is also the game's default): **0.6** for most categories; **0.8** for Perishable Food and Other; **1.2** for Ranged Weapons; **0.4** for Keys. A setting of 0 means that category never spawns as container loot.
- **Loot is rolled once per container**, the first time the game fills it (when its square first loads near a player, or when you first open it), and then saved. Reloading does not re-roll it.
- **Loot thins out slowly over time:** by default up to 20% less after ten years, so under 1% less in the first six months.
- **Loot respawn is off by default.** When you switch it on, it only refills town and trailer park containers that someone has looted and that hold fewer than 5 items.

## The roll, step by step

1. **Pick the list.** The game looks up the room and the container type in the distribution tables. Many containers point to "procedural" lists: the container picks one of several named lists by weight, honouring each list's minimum and maximum per room, and some lists are forced when certain tiles, rooms or zones are present.
2. **Work out the number of rolls:** the list's `rolls` x the sandbox Rolls Multiplier (default 1.0), rounded down, at least 1.
3. **For each roll, test every item in the list:** a random number from 0 to 9,999 must be below

   **(listed chance x 100 x category setting + zombie density bonus) x (1 - diminished loot % / 100)**

4. **Stop early if the container fills up.** Once an item no longer fits, the rest of the rolls are skipped.

Some lists have a separate "junk" list rolled first. Junk items get their listed chance x 1.4, use a category setting of 1.0 whatever your slider says (unless the slider is 0), and ignore the zombie density bonus.

> **Proof:** Code. `zombie.inventory.ItemPickerJava#rollItemInternal`, `#doRollItemInternal` (`rolls = (int)(containerDist.rolls * rollsMultiplier)`, at least 1; `Rand.Next(10000) < getActualSpawnChance(...)`; returns when `tryAddItemToContainer` gives null), `#getActualSpawnChance` (`(baseChance * 100.0F * lootModifier + zombieDensity) * overTimeModifier`), `#getBaseChanceMultiplier` (junk x1.4), `#getLootModifier(String, boolean)` (junk uses 1.0 unless 0), `#rollProceduralItemInternal` (weighted pick, min and max per room, forced lists). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### A worked example

The tool crate list (`CrateTools`), when a crate rolls it, has 4 rolls and lists the garden saw at 8. The garden saw is a Tool, and Tools default to 0.6:

- per roll: 8 x 100 x 0.6 = 480 out of 10,000, so **4.8%**;
- over 4 rolls: 1 - (1 - 0.048)^4, so about **17.9%** that the crate has at least one;
- on average 0.19 garden saws per crate.

> **Proof:** Code. `media/lua/server/Items/ProceduralDistributions.lua`, `CrateTools` (`rolls = 4`, `"GardenSaw", 8`); `media/scripts/generated/items/normal.txt`, `item GardenSaw` (`DisplayCategory = Tool`); `zombie.inventory.ItemPickerJava#getLootType` (Tool is tested before Survival). Build 42.21, Steam build 25485521.

## The sandbox loot settings

Each item falls into one category, checked in this order: Generators, Mementos, Medical, Mechanics, Material, Farming, Tools, Cooking, Survival Essentials, then food (Perishable or Non-Perishable), Ammo, Melee Weapons, Ranged Weapons (guns and weapon parts), Keys, Bags, Skill Books, Recipe Resources, Other Literature, Clothing, Media and finally Other. The first match wins, which is why a saw marked as survival gear still counts as a Tool.

| Setting | Default | Notes |
|---|---|---|
| Perishable Food | 0.8 | food that can rot |
| Other | 0.8 | anything not in another category |
| Ranged Weapons | 1.2 | guns and weapon parts |
| Keys | 0.4 | |
| Every other category | 0.6 | range 0.0 to 4.0 for all of them |
| Rolls Multiplier | 1.0 | multiplies every list's rolls; the game itself warns against changing it |
| Loot Item Removal List | empty | item types listed here never spawn as container loot |
| Generators | Rare | the only setting that uses the six loot factors below |

**The six loot factors** (Insanely Rare 0.05, Extremely Rare 0.2, Rare 0.6, Normal 1.0, Common 2.0, Abundant 3.0) are read only for generators in 42.21: the Generators setting picks one of them. None of the other categories use them.

**Remove Story Loot** and **Remove Zombie Loot** (both off) extend a 0 setting to items placed by the world's stories and to weapons stuck in zombies. With them off, a category set to 0 still turns up there.

> **Proof:** Code. `zombie.inventory.ItemPickerJava#getLootType` (category order), `#getLootModifierFromType`, `#getLootModifier(String)` (0 for the removal list), `#InitSandboxLootSettings`, `#doSandboxSettings` (called only for "Generator"); `zombie.SandboxOptions` (each `...LootNew` 0.0 to 4.0, `RollsMultiplier`, `LootItemRemovalList`, loot factors); `media/lua/shared/Sandbox/Apocalypse.lua` (the defaults, loaded by the `SandboxOptions` constructor); `zombie.randomizedWorld.RandomizedWorldBase` and `zombie.characters.AttachedItems.AttachedWeaponDefinitions` (story and zombie loot checks). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Things that change loot over time and place

### Diminished loot

**Maximum Diminished Loot Percentage** (default 20) is reached after **Days Until Maximum Diminished Loot** (default 3,650, ten years). In between it grows in whole percent steps:

**diminished % = 20 x days / 3,650**, rounded down

So the first 1% arrives around day 183, and a year in you lose 2%. The days are counted from the world's start, plus 30 days for each month of the "Time Since Apocalypse" setting beyond the first. The percentage is taken when the container is first filled, not when you open it later.

> **Proof:** Code. `zombie.SandboxOptions#getCurrentDiminishedLootPercentage` (`maxLooted * days / daysUntilMax` in integers, clamped 0 to 100), `#getCurrentLootMultiplier` (1 - percentage / 100); `zombie.GameTime#getWorldAgeDaysSinceBegin` (adds `(TimeSinceApo - 1) * 30`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Zombie density bonus

**Zombie Population Loot Effect** is 0 in the default preset, so it does nothing. Above 0, each item's threshold out of 10,000 gains the area's zombie density (capped at 8) x the setting: at most +80 for the setting 10, which is +0.8 percentage points per item per roll.

> **Proof:** Code. `zombie.inventory.ItemPickerJava#getZombieDensityFactor` (`IsoMetaChunk#getLootZombieIntensity`, `zombieDensityCap = 8.0F`, times `ZombiePopLootEffect`); `ZombiePopLootEffect = 0` in `media/lua/shared/Sandbox/Apocalypse.lua`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Already-looted buildings

**Maximum Looted Building Chance** (default 25) is reached after **Days Until Max Looted Building Chance** (default 90), growing in whole steps from day 1, and is 1.5 times higher in "rich" areas. It feeds the world stories that place buildings already looted or trashed; which building gets which story is the stories system's job.

The **Rural Building Looted Chance Multiplier** (default 0.5) is applied in the code to both this chance and the diminished loot, but only when a square has no region, but the region lookup always answers, with "General" when nothing else matches, so the multiplier never applies. Even if it did, the code turns the multiplier into a whole number before using it, and 0.5 becomes 0.

> **Proof:** Code. `zombie.SandboxOptions#getCurrentLootedChance` (`maxLooted * days / daysUntilMax`, "Rich" x1.5, rural branch only when `ItemPickerJava.getSquareRegion(square) == null`, multiplier cast with `(int)`; the bytecode, read with `javap` from the installed jar whose sha256 matches the capture, is `ifnonnull` then `d2i`, `imul`) and `#getCurrentDiminishedLootPercentage` (the same rural branch); `zombie.iso.IsoGridSquare#getSquareRegion` (returns `"General"` when no Region zone); `zombie.randomizedWorld.randomizedBuilding.RandomizedBuildingBase#getChance` ("Trashed Building"), `RBLooted#isValid`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Loot respawn

Off by default: **Hours for Loot Respawn** is 0. Set it to a number of in-game hours and this happens on each interval:

- Only squares in **town zones and trailer parks** are touched.
- Only containers that have already been filled once and that **someone has taken an item from** qualify.
- A qualifying container holding **fewer than Max Items For Loot Respawn** items (default 5) gets a fresh roll of its normal loot list, **added on top** of what is left.
- Never: corpses, player-built containers, compost bins.
- **Construction Prevents Loot Respawn** (default on): any zone where a player has built something is skipped.
- **Loot Seen Prevent Hours** (default 0, off): when set, zones a player has been in within that many hours are skipped.
- In multiplayer, the server option **Safehouse Prevents Loot Respawn** (default on) skips safehouses.

The interval counts from 7 AM on the first day, so the first refill comes that many hours after it. Areas near a player are refilled when the interval ticks over; any other area is refilled when it next loads, once, however many intervals it missed.

> **Proof:** Code. `zombie.LootRespawn#update`, `#checkChunk` (`7 + (int)(worldAgeHours / hours) * hours`, one refill per chunk when its stored hour is behind), `#respawnInChunk` (TownZone, TownZones, TrailerPark; construction, seen-hours and safehouse checks; skips `IsoDeadBody`, `IsoThumpable`, `IsoCompost`; container must be `explored` and `isHasBeenLooted()`), `#respawnInContainer` (`count < maxItemsForLootRespawn`, then `ItemPickerJava.fillContainer`); `media/lua/client/TimedActions/ISInventoryTransferAction.lua` (taking an item marks the container looted); `zombie.network.ServerOptions` (`SafehousePreventsLootRespawn` true). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Multiplayer

The server rolls the loot, with the server's sandbox settings, and sends the items to the players nearby. A client asking for a container's contents makes the server fill it if nobody has yet.

> **Proof:** Code. `zombie.network.packets.RequestItemsForContainerPacket#processServer` (fills an unexplored container, then sends its items); `zombie.LoadGridsquarePerformanceWorkaround` (fills on square load, not on clients). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Procedural distributions for modders](/pz/build-42/modding/farming-and-animals/modding-procedural-distributions) if you want to add to the loot lists.
- [Loot room definitions and custom distributions](/pz/build-42/mapping/zones-and-packaging/loot-room-definitions-and-custom-distributions) for mappers.
