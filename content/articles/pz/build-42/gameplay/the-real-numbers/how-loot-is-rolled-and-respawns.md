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
  Each container rolls its loot list a set number of times, and every item gets its own test: listed chance x 100 x your sandbox slider, out of 10,000. Respawn is off by default (42.22).
last_updated: '2026-11-15'
related_articles:
  - modding-procedural-distributions
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, you have opened an empty fridge in a full kitchen and blamed the game. Here is how the game really fills a container, what the sandbox loot settings change, and when anything comes back.

:::callout[The 1-minute version]{kind=key}
- Each container has a loot list. The list says how many times to roll, and gives each item a chance.
- On every roll, every item in the list gets its own test: listed chance x 100 x your sandbox setting for that item's category, out of 10,000. An item listed at 8 with its setting at 0.6 has a 4.8% chance per roll. Rolls are independent, so you can find the same item twice.
- In the default preset the settings are 0.6 for most categories, 0.8 for Perishable Food and Other, 1.2 for Ranged Weapons and 0.4 for Keys. A setting of 0 means that category never spawns as container loot.
- Loot is rolled once per container, the first time the game fills it, and then saved. Reloading does not re-roll it.
- Loot thins out slowly over time: by default up to 20% less after ten game years, so under 1% less in the first 6 game months.
- Loot respawn is off by default. When you switch it on, it only refills town and trailer park containers that someone has looted and that hold fewer than 5 items.
:::

:::facts
- **Chance per roll** listed chance x 100 x category setting, out of 10,000
- **Default category settings** 0.6 (most), 0.8 (Perishable Food, Other), 1.2 (Ranged Weapons), 0.4 (Keys)
- **Diminished loot** up to 20% less after 3,650 game days, in whole percent steps
- **Loot respawn** off by default (0 hours); first refill comes after the interval you set, counted from 7 AM on day 1
- **Conversion** one game day is 1.5 real hours at the default day length, so one game hour is 3.75 real minutes: 3,650 game days is about 5,475 real hours, and a 24-hour respawn interval is 1.5 real hours
:::

:::flow[From an unopened container to your loot]
- The container is filled the first time it is needed
- The game picks its loot list
- Each roll tests every item
- The container stops early when it is full
- Optional: respawn adds more later
:::

## 1. The roll, step by step

The game picks a loot list for the container, works out how many rolls it gets, and tests every item in the list on each roll.

1. **Pick the list.** The game looks up the room and the container type in the distribution tables. Many containers point to "procedural" lists: the container picks one of several named lists by weight, and some lists are forced when certain tiles, rooms or zones are present. :cite[(`zombie/inventory/ItemPickerJava.java:565-645`, `zombie/inventory/ItemPickerJava.java:744-870`)]
2. **Work out the number of rolls:** the list's `rolls` x the sandbox Rolls Multiplier (default 1.0), rounded down, at least 1. :cite[(`zombie/inventory/ItemPickerJava.java:1023-1024`)]
3. **For each roll, test every item in the list:** a random number from 0 to 9,999 must be below the number worked out in the formula that follows. :cite[(`zombie/inventory/ItemPickerJava.java:1045`)]

   **(listed chance x 100 x category setting + zombie density bonus) x (1 - diminished loot % / 100)**

   :cite[(`zombie/inventory/ItemPickerJava.java:2097-2116`)]
4. **Stop early if the container fills up, or the item cannot be made.** Once an item no longer fits, or its script is missing or obsolete, the rest of the rolls are skipped. :cite[(`zombie/inventory/ItemPickerJava.java:1046-1049`, `zombie/inventory/ItemPickerJava.java:702-722`, `zombie/inventory/ItemPickerJava.java:704-708`)]

A container is filled the first time its square loads near a player, or the first time you open it, whichever comes first. Each fill marks the container explored, and the explored flag is saved with it, so a container is rolled once and then kept. :cite[(`zombie/LoadGridsquarePerformanceWorkaround.java:70-81`, `zombie/iso/IsoChunk.java:3981`, `zombie/inventory/ItemContainer.java:3126-3130`, `media/lua/client/ISUI/ISInventoryPage.lua:1110`, `zombie/network/packets/RequestItemsForContainerPacket.java:50-58`, `zombie/inventory/ItemContainer.java:2491`)]

Within a procedural list, a sub-list with a minimum of 1 is forced once per room before anything else is picked, and a sub-list that has already spawned its maximum in that room drops out. :cite[(`zombie/inventory/ItemPickerJava.java:838-844`, `zombie/inventory/ItemPickerJava.java:862-866`)] The pick among the rest is weighted. :cite[(`zombie/inventory/ItemPickerJava.java:871-896`)]

Some lists have a separate "junk" list rolled first. Junk items get their listed chance x 1.4, use a category setting of 1.0 whatever your slider says (unless the slider is 0), and ignore the zombie density bonus. :cite[(`zombie/inventory/ItemPickerJava.java:2071-2072`, `zombie/inventory/ItemPickerJava.java:2084-2091`, `zombie/inventory/ItemPickerJava.java:2093-2095`, `zombie/inventory/ItemPickerJava.java:934-939`)]

A few items get a bonus when there are no zombies. Items tagged for it have their listed chance doubled when the Zombie Count setting is "None" or the Population Multiplier is 0. In the vanilla scripts the tag is on the wristwatches, the key rings and the building and car keys. :cite[(`zombie/inventory/ItemPickerJava.java:2074-2079`, `media/scripts/generated/items/alarmclockclothing.txt:19`, `media/scripts/generated/items/container.txt:4148`, `media/scripts/generated/items/key.txt:11`, `media/scripts/generated/items/key.txt:73`, `media/lua/shared/Translate/EN/Sandbox.json:15`)]

### A worked example

The tool crate list (`CrateTools`), when a crate rolls it, has 4 rolls and lists the garden saw at 8. The garden saw is a Tool, and Tools default to 0.6.

- per roll: 8 x 100 x 0.6 = 480 out of 10,000, so 4.8%;
- over 4 rolls: 1 - (1 - 0.048)^4, so about 17.9% that the crate has at least one;
- on average 0.19 garden saws per crate.

:cite[(`media/lua/server/Items/ProceduralDistributions.lua:17718-17725`, `media/scripts/generated/items/normal.txt:3492-3494`, `media/lua/shared/Sandbox/Apocalypse.lua:42`)] Tool is tested before Survival in the category order, so the saw is a Tool. :cite[(`zombie/inventory/ItemPickerJava.java:1562-1580`)]


## 2. The sandbox loot settings

Each item falls into exactly one category, and that category's setting is the number in the formula.

The game checks the categories in this order: Generators, Mementos, Medical, Mechanics, Material, Farming, Tools, Cooking, Survival Essentials, then food (Perishable or Non-Perishable), Ammo, Melee Weapons, Ranged Weapons (guns and weapon parts), Keys, Bags, Skill Books, Recipe Resources, Other Literature, Clothing, Media and finally Other. The first match wins, which is why a saw marked as survival gear still counts as a Tool. :cite[(`zombie/inventory/ItemPickerJava.java:1562-1600`, `zombie/inventory/ItemPickerJava.java:1515-1560`)]

| Setting | Default | Notes |
|---|---|---|
| Perishable Food | 0.8 | food that can rot |
| Other | 0.8 | anything not in another category |
| Ranged Weapons | 1.2 | guns and weapon parts |
| Keys | 0.4 | |
| Every other category | 0.6 | range 0.0 to 4.0 for all of them |
| Rolls Multiplier | 1.0 | multiplies every list's rolls (range 0.1 to 100); the game itself warns against changing it |
| Loot Item Removal List | empty | item types listed here never spawn as container loot |
| Generators | Rare | the only setting that uses the six loot factors below |

:cite[(`media/lua/shared/Sandbox/Apocalypse.lua:22-43`, `zombie/SandboxOptions.java:88-110`, `media/lua/shared/Translate/EN/Sandbox.json:303-343`, `zombie/inventory/ItemPickerJava.java:1497-1512`)] The defaults above are the Apocalypse preset, which the game loads as its defaults; the Java fields alone have a different default for some options. :cite[(`zombie/SandboxOptions.java:273-279`)]

The six loot factors (Insanely Rare 0.05, Extremely Rare 0.2, Rare 0.6, Normal 1.0, Common 2.0, Abundant 3.0) are read only for generators: the Generators setting picks one of them, and None gives 0. None of the other categories use them. :cite[(`zombie/inventory/ItemPickerJava.java:494-513`, `zombie/inventory/ItemPickerJava.java:1517-1518`, `media/lua/shared/Sandbox/Apocalypse.lua:47-52`, `media/lua/shared/Sandbox/Apocalypse.lua:82`)]

Remove Unwanted Story Loot and Remove Unwanted Zombie Loot (both off) extend a 0 setting to items placed by the world's stories and to weapons stuck in zombies. With them off, a category set to 0 still turns up there. :cite[(`zombie/randomizedWorld/RandomizedWorldBase.java:1038-1076`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:602`, `zombie/characters/AttachedItems/AttachedWeaponDefinitions.java:115`, `media/lua/shared/Sandbox/Apocalypse.lua:44-45`)]

## 3. Things that change loot over time and place

Three settings move the numbers with time or place: diminished loot, zombie density and already-looted buildings.

### Diminished loot

Maximum Diminished Loot Percentage (default 20) is reached after Days Until Maximum Diminished Loot (default 3,650, ten game years). In between it grows in whole percent steps.

**diminished % = 20 x days / 3,650**, rounded down

:cite[(`zombie/SandboxOptions.java:1243-1279`, `media/lua/shared/Sandbox/Apocalypse.lua:167-168`)] So 1% arrives around day 183 (about 275 real hours), and a year in you lose 2%. The days are counted from the world's start, plus 30 days for each month of the "Months since the Apocalypse" setting above 1. :cite[(`zombie/GameTime.java:897-899`, `media/lua/shared/Translate/EN/Sandbox.json:536`)] The percentage is taken when the container is filled, not when you open it later. :cite[(`zombie/inventory/ItemPickerJava.java:2108-2116`)]

### Zombie density bonus

Zombie Population Loot Effect is 0 in the default preset, so it does nothing. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:46`)] Above 0, each item's threshold out of 10,000 gains the area's loot zombie density (capped at 8) x the setting: at most +80 for the setting 10, which is +0.8 percentage points per item per roll. :cite[(`zombie/inventory/ItemPickerJava.java:2119-2142`)]

The loot zombie density is not the plain map density. It is 0.06 plus 11.94 times the map's density share, and each time it is read there is also a small random chance that it jumps to the maximum; with zombies disabled it is treated as the maximum too. :cite[(`zombie/iso/IsoMetaChunk.java:125-136`, `zombie/iso/IsoWorld.java:3283-3285`)]

### Already-looted buildings

Maximum Looted Building Chance (default 25) is reached after Days Until Max Looted Building Chance (default 90), growing in whole steps from day 1, and is 1.5 times higher in "rich" areas. It feeds the world stories that place buildings already looted or trashed; which building gets which story is the stories system's job. :cite[(`zombie/SandboxOptions.java:1205-1239`, `media/lua/shared/Sandbox/Apocalypse.lua:164-165`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:295`, `zombie/randomizedWorld/randomizedBuilding/RBLooted.java:102`)]

The Rural Building Looted Chance Multiplier (default 0.5) is applied in the code to both this chance and the diminished loot, but only when a square has no region. The region lookup always answers, with "General" when nothing else matches, so the multiplier never applies. Even if it did, the code turns the multiplier into a whole number before using it, and 0.5 becomes 0. :cite[(`zombie/SandboxOptions.java:1223-1225`, `zombie/SandboxOptions.java:1261-1263`, `zombie/iso/IsoGridSquare.java:10487-10500`, `media/lua/shared/Sandbox/Apocalypse.lua:166`)]

## 4. Loot respawn

Respawn is off by default: Hours for Loot Respawn is 0, and any other number is game hours between refills.

On each interval, these rules apply. :cite[(`zombie/LootRespawn.java:105-107`, `media/lua/shared/Sandbox/Apocalypse.lua:67-70`)]

- Only squares in town zones and trailer parks are touched. :cite[(`zombie/LootRespawn.java:118-121`)]
- Only containers that have already been filled once and that someone has taken an item from qualify. :cite[(`zombie/LootRespawn.java:147`, `media/lua/client/TimedActions/ISInventoryTransferAction.lua:656`)]
- A qualifying container holding fewer than Max Items For Loot Respawn items (default 5) gets a fresh roll of its normal loot list, added on top of what is left. :cite[(`zombie/LootRespawn.java:160-167`)]
- Never: corpses, player-built containers, compost bins. :cite[(`zombie/LootRespawn.java:144`)]
- Construction Prevents Loot Respawn (on by default): any zone where a player has built something is skipped. :cite[(`zombie/LootRespawn.java:122`)]
- Loot Seen Prevent Hours (default 0, off): when set, zones a player has been in within that many hours are skipped. :cite[(`zombie/LootRespawn.java:122`)]
- In multiplayer, the server option Safehouse Prevents Loot Respawn (on by default) skips safehouses. :cite[(`zombie/LootRespawn.java:111-123`, `zombie/network/ServerOptions.java:82`)]

The interval counts from 7 AM on day 1, so the refill clock starts at that hour. Areas near a player are refilled when the interval comes around; any other area is refilled when it next loads, once, however many intervals it missed. :cite[(`zombie/LootRespawn.java:39-60`, `zombie/LootRespawn.java:86-103`)] Respawn runs on single player and on the server, not on a multiplayer client. :cite[(`zombie/LootRespawn.java:40`)]

## 5. Multiplayer

The server rolls the loot, with the server's sandbox settings, and sends the items to the players nearby.

A client asking for a container's contents makes the server fill it if nobody has yet, and a multiplayer client never fills a container itself. :cite[(`zombie/inventory/ItemPickerJava.java:566`, `zombie/network/packets/RequestItemsForContainerPacket.java:50-58`, `zombie/LoadGridsquarePerformanceWorkaround.java:70-81`)]

## Where to go next

- [Procedural distributions for modders](/pz/build-42/modding/farming-and-animals/modding-procedural-distributions): if you want to add to the loot lists.
- [Loot room definitions and custom distributions](/pz/build-42/mapping/zones-and-packaging/loot-room-definitions-and-custom-distributions): for mappers.

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Java and Lua. The worked example, the real-time figures and the "about 275 real hours" are our own arithmetic on those rules; we did not run a game to count real loot.

Not tested: the loot odds in a running game, the zombie density bonus at settings above 0, and respawn on a live server. We did not count which exact items carry the no-zombies tag beyond the ones named, and we did not read the stash or world-story code that places extra loot outside containers.
:::
