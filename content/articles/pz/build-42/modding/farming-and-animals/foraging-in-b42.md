---
id: build-42-foraging-in-b42
slug: foraging-in-b42
title: Foraging in B42
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - ranch-zones
  - foraging
  - husbandry
excerpt: >-
  How 42.22 Search Mode fills a zone with spots, what Search Focus really does, which 27 categories exist, what the Farmer bonus is, and how a multiplayer server runs it. Crops and animals in detail.
last_updated: '2026-11-16'
related_articles:
  - orientation-what-changed-in-b42
  - agriculture-basics-from-seed-to-harvest
  - modding-procedural-distributions
  - the-three-farming-skills
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [players searching](#1-how-search-mode-fills-a-zone) | [modders adding things to find](#6-for-modders)

Outcast, foraging is Search Mode: you walk through wild ground, small icons appear where something can be picked up, and you walk over and take it. This page shows what the code behind it does, and then goes into the categories that matter to farmers: the six wild crops, the living animals and the dead ones.

:::callout[The 1-minute version]{kind=key}
- Press the Toggle Search Mode key (End by default) outside a vehicle. The game finds spots in the forage zone you stand in, from the zone's type, the month, the time of day and the weather.
- Search Focus tilts the odds toward one category. It lists only the categories your Foraging level has unlocked. For Crops the unlock is level 5 and the chance per spot to change is about 12% at level 5 (10% to 20% across levels).
- The six wild crops (carrots, broccoli, potatoes, cabbage, tomato, radish) need Foraging 2, and each comes with 1 to 10 seeds on 75 rolls out of 100.
- A Farmer sees Crops spots from 1.5 times as far. A Gardener or Herbalist sees them 5% farther.
- Your Foraging level decides which items you can see at all: every item has a skill, and a spot whose item needs more than your level is never shown. It also sets how far you see.
- In multiplayer the server builds a separate pool of spots for each player and checks pickups; single player does it all on your own computer.
:::

:::facts
- **Categories** 27, of which 14 are listed in the Search Focus menu :cite[(`media/lua/shared/Foraging/forageCategories.lua:4-669`, `media/lua/client/Foraging/ISSearchWindow.lua:154-175`)]
- **Zone types** 17 :cite[(`media/lua/shared/Foraging/forageZones.lua:1-146`)]
- **Spots in a zone** floor(area / 2,000 x density), the density being 1.5 to 10 depending on the zone type :cite[(`media/lua/shared/Foraging/forageSystem.lua:818-830`)]
- **Refill** 3 to 7 percent of a zone's total per game day, in whole days: 7% is every 1.5 real hours at the default Day Length :cite[(`media/lua/shared/Foraging/forageSystem.lua:832-860`)]
- **Wild crops** 6, Foraging skill 2 each :cite[(`media/lua/shared/Foraging/Categories/Vegetables.lua:158-262`)]
- **Search radius** 3 tiles minimum, 0.5 tile more per level, 10 tiles before bonuses and 15 after :cite[(`media/lua/shared/Foraging/forageSystem.lua:107-114`)]
- **Picking up** takes 50 ticks :cite[(`media/lua/shared/Foraging/ISForageAction.lua:64-68`)]
:::

## 1. How Search Mode fills a zone

**A forage zone is a map zone with a type, and the game gives it a number of spots that depends on its area and the Nature's Abundance option.**

The Toggle Search Mode key is End by default, and Search Mode switches itself off when you get in a vehicle. :cite[(`media/lua/shared/Translate/EN/UI.json:2219`, `media/lua/client/Foraging/ISSearchManager.lua:1178`)]

The zone types are `DeepForest`, `FarmLand`, `Farm`, `Forest`, `ForagingNav`, `Nav`, `TownZone`, `TrailerPark`, `Vegitation`, `PHForest`, `PHMixForest`, `PRForest`, `FarmMixForest`, `FarmForest`, `BirchForest`, `BirchMixForest` and `OrganicForest`. Each has a minimum and maximum density (from 1.5 to 10) and a refill percent (3 to 7). The mixed types borrow the weights of the zones they contain. :cite[(`media/lua/shared/Foraging/forageZones.lua:1-146`)]

The number of spots a zone starts with is its area divided by 2,000, times a density rolled between the zone's minimum and maximum. A 100 by 100 tile forest with density 8 to 10 starts with about 45.

A zone that would round down to 0 spots has an 11 in 100 chance of getting 1 to 3. :cite[(`media/lua/shared/Foraging/forageSystem.lua:818-830`, `media/lua/shared/Foraging/forageSystem.lua:97`)]

Nature's Abundance changes only the top of the density range: Very Poor and Poor lower it by 75% and 50%, Abundant and Very Abundant raise it by 50% and 100%. Normal is no change. :cite[(`media/lua/shared/Foraging/forageSystem.lua:99-103`, `media/lua/shared/Foraging/forageSystem.lua:1458-1479`)] The default is Normal (3), and the Extinction preset sets Poor (2) and the SixMonthsLater preset Very Abundant (5). :cite[(`zombie/SandboxOptions.java:128`, `media/lua/shared/Sandbox/Extinction.lua:60`, `media/lua/shared/Sandbox/SixMonthsLater.lua:35`)]

Each spot is a category and an item chosen by weighted rolls. The weights are not percents.

The game takes the zone's weight for each category, multiplies it by a month factor, a weather factor and a day or night factor, and rolls across the total. Then it does the same inside the category for the items. :cite[(`media/lua/shared/Foraging/forageSystem.lua:1127-1199`)] A month in the item's `months` list counts 1, a bonus month counts 1.5 and a malus month counts 0.5, and a month outside the list counts 0. :cite[(`media/lua/shared/Foraging/forageSystem.lua:1262-1335`, `media/lua/shared/Foraging/forageSystem.lua:104-105`)]

Rain, puddles and snow multiply by the item's `rainChance`, `hasRainedChance` and `snowChance` scaled by how hard it is raining or snowing, and day or night multiplies by `dayChance` or `nightChance`. :cite[(`media/lua/shared/Foraging/forageSystem.lua:1939-2003`)]

When a spot is taken, the zone's counter goes down by one. Each game day, a zone that is below its total refills by its refill percent of the total, and only in whole days since the last refill. At 7% a forest comes back in about 15 game days, which is about 22 real hours at the default Day Length (our arithmetic). :cite[(`media/lua/shared/Foraging/forageSystem.lua:832-872`)] The hourly check, the daily check and every weather change rebuild the spots and check the refill, but only when the month, day or night, or the weather is different from the last check. :cite[(`media/lua/shared/Foraging/forageSystem.lua:751-756`, `media/lua/shared/Foraging/forageSystem.lua:1014-1050`)]

## 2. Categories and Search Focus

**There are 27 categories, and Search Focus lists those of them that are not hidden and that your Foraging level has unlocked.**

Each category has an unlock level (`identifyCategoryLevel`), a group name (`typeCategory`) and a focus chance range (`focusChanceMin` and `focusChanceMax`). Below the unlock level, the zone display shows the category under its group name instead of its own. :cite[(`media/lua/client/Foraging/ISZoneDisplay.lua:535-560`)]

The other fields are the zone weights, the floors an item can sit on (`validFloors`), the chance to move a nearby spot onto a matching object (`chanceToMoveIcon`), the chance to make a new one there (`chanceToCreateIcon`) and the objects that count (`spriteAffinities`). :cite[(`media/lua/shared/Foraging/forageDefinitions.lua:66-104`)] The Search Focus menu holds the categories that are not hidden and whose unlock level you have reached. :cite[(`media/lua/client/Foraging/ISSearchWindow.lua:154-175`)] That is up to 14 entries.

When a focus is set, each spot rolls once for a chance to change into a spot of the focus category: on a server when the pool is built, in single player when you first see it. The chance is the category's minimum plus the spread from minimum to maximum divided by 10 minus your level (at least 1). So Crops, with 10 to 20, is 12% at level 5 and 20% at level 9. If your level is below the unlock level there is no change. :cite[(`media/lua/client/Foraging/ISForageIcon.lua:37-46`, `media/lua/client/Foraging/ISBaseIcon.lua:621-623`, `media/lua/server/Foraging/forageServer.lua:84-105`)]

| Category | Group | Unlocks at | Focus chance, % | In the Search Focus menu | Code |
|---|---|---|---|---|---|
| Tracks | Animal Tracks | 0 | - | listed, focus chance 0 | `forageCategories.lua:4-28` |
| Animals | Animals | 5 | 5-15 | yes | `forageCategories.lua:29-54` |
| DeadAnimals | Animals | 5 | - | no (hidden) | `forageCategories.lua:55-75` |
| Berries | Food | 3 | 20-33.3 | yes | `forageCategories.lua:76-98` |
| Fruits | Food | 7 | 10-20 | yes | `forageCategories.lua:99-124` |
| Vegetables | Food | 7 | 10-20 | yes | `forageCategories.lua:125-150` |
| Crops | Food | 5 | 10-20 | yes | `forageCategories.lua:151-176` |
| Mushrooms | Food | 3 | 10-33.3 | yes | `forageCategories.lua:177-205` |
| FishBait | Animals | 4 | - | no (hidden) | `forageCategories.lua:206-233` |
| ForestGoods | Other | 0 | - | no (hidden) | `forageCategories.lua:234-254` |
| ForestRarities | Other | 8 | - | no (hidden) | `forageCategories.lua:255-275` |
| Insects | Animals | 4 | 10-33.3 | yes | `forageCategories.lua:276-302` |
| MedicinalPlants | Medicinal Plants | 6 | 10-33.3 | yes | `forageCategories.lua:303-332` |
| WildPlants | Food | 4 | 10-33.3 | yes | `forageCategories.lua:333-362` |
| WildHerbs | Food | 4 | 10-33.3 | yes | `forageCategories.lua:363-392` |
| Firewood | Materials | 0 | 25-40 | yes | `forageCategories.lua:393-418` |
| Stones | Materials | 0 | 25-40 | yes | `forageCategories.lua:419-445` |
| CraftingMaterials | Other | 8 | - | no (hidden) | `forageCategories.lua:446-466` |
| Bones | Other | 8 | - | no (hidden) | `forageCategories.lua:467-487` |
| Artifacts | Other | 8 | - | no (hidden) | `forageCategories.lua:488-508` |
| Trash | Other | 4 | 5-25 | yes | `forageCategories.lua:509-537` |
| Junk | Other | 4 | 5-10 | no (hidden) | `forageCategories.lua:538-563` |
| JunkFood | Other | 4 | - | no (hidden) | `forageCategories.lua:564-584` |
| Clothing | Other | 4 | - | no (hidden) | `forageCategories.lua:585-605` |
| JunkWeapons | Other | 4 | - | no (hidden) | `forageCategories.lua:606-626` |
| Ammunition | Other | 8 | - | no (hidden) | `forageCategories.lua:627-647` |
| Medical | Other | 8 | - | no (hidden) | `forageCategories.lua:648-669` |

Tracks is listed but has weight 0 in every zone here, because tracks come from animal tracks code, not these zones. Categories that are hidden never appear in the menu, and their spots still exist. :cite[(`media/lua/shared/Foraging/forageCategories.lua:4-28`, `media/lua/client/Foraging/ISSearchWindow.lua:162-170`)]

### The six wild crops

**Carrots, broccoli, potatoes, cabbage, tomato and radish are the Crops category; each is Foraging 2.**

All six are one item at a time, with Foraging skill 2. They sit in `FarmLand` at weight 10, and in `Forest` and `Vegitation` at 7 (carrots, broccoli, potato) or 3 (cabbage, tomato, radish).

Broccoli is available from May to November and the others from March to November. :cite[(`media/lua/shared/Foraging/Categories/Vegetables.lua:158-262`)] The category's own zone weights are highest on farmland (25) and in general vegetation (10). :cite[(`media/lua/shared/Foraging/forageCategories.lua:151-176`)] Each of the six also has 75 rolls in 100 to come with 1 to 10 seeds of the same crop. :cite[(`media/lua/shared/Foraging/forageSystem.lua:324-364`, `media/lua/shared/Foraging/forageSystem.lua:2290-2302`)]

A foraged vegetable is named with "(Wild Food)", and its hunger and nutrition are scaled by a random size that grows a little with your level. :cite[(`media/lua/shared/Foraging/forageSystem.lua:2266-2288`)]

### Animals and dead animals

**The Animals category is six living finds and the hidden Dead Animals category is five.**

Animals holds wild eggs and eggs (1 to 3, Foraging 8), a frog (7), and a slug, a second slug item and a snail (3).

Frog, slug and snail turn up much more in rain and at night (+100% rain, -100% snow, -50% day, +50% night). Eggs are -20% in rain and snow. :cite[(`media/lua/shared/Foraging/Categories/Animals.lua:1-176`)] Its weights are highest in vegetation (25) and farmland (20). Choosing Animals boosts only that category, not insects or dead animals: the focus roll switches to the category named in the menu. :cite[(`media/lua/shared/Foraging/forageCategories.lua:29-54`, `media/lua/server/Foraging/forageServer.lua:84-105`)]

Dead Animals is hidden and cannot be a focus. It holds a dead bird (7), squirrel (8), rabbit (10), rat (5) and mouse (5).

The rat and mouse weights jump in town zones and trailer parks (10). :cite[(`media/lua/shared/Foraging/Categories/DeadAnimals.lua:1-141`)] A dead animal is aged between nearly fresh and rotten, and its size is rolled from the matching trap animal. :cite[(`media/lua/shared/Foraging/forageSystem.lua:2336-2366`)] Live wild animals come mostly from trapping; see [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works).

## 3. Who sees what

**Your Foraging level decides which items you can see, and your level, occupation, traits, gear and the weather set how far away you notice a spot.**

A spot is shown only when its item exists, is in season, belongs to the zone, needs no more skill than your Foraging level, and has its trait, recipe and tool needs met. :cite[(`media/lua/shared/Foraging/forageSystem.lua:148-151`, `media/lua/shared/Foraging/forageSystem.lua:2055-2058`, `media/lua/client/Foraging/ISBaseIcon.lua:738-745`)] The notice radius starts at 3 tiles and gains 0.5 tile per Foraging level, then the occupation and trait bonus, up to 10 tiles before aiming, sneaking and category bonuses, and never above 15. :cite[(`media/lua/shared/Foraging/forageSystem.lua:107-114`, `media/lua/client/Foraging/ISBaseIcon.lua:310-380`)] Then it is multiplied by panic, body (drunk, sick, pain), exhaustion, clothing over the eyes, the item's size, weather and your level (as (level + 1) / 10), and by the better of the aiming bonus (1.33) and the sneaking bonus (1.1). :cite[(`media/lua/shared/Foraging/forageSystem.lua:109-110`, `media/lua/shared/Foraging/forageSystem.lua:1707-1830`)] A category bonus multiplies on top, and so does hunger, for food. :cite[(`media/lua/client/Foraging/ISBaseIcon.lua:339-357`)]

The category bonus is a percent set by occupation and trait. For Crops: the Farmer occupation gives 50, and the Gardener trait and the Herbalist trait give 5 each, and so does the profession copy of the Herbalist entry. A value of 50 makes the radius 1.5 times larger for that category. :cite[(`media/lua/shared/Foraging/forageSkills.lua:38-52`, `media/lua/shared/Foraging/forageSkills.lua:351-361`, `media/lua/shared/Foraging/forageSkills.lua:462-490`, `media/lua/shared/Foraging/forageSystem.lua:1707-1726`)] The same table gives each occupation and trait a flat vision bonus in tiles, and a darkness and weather reduction. :cite[(`media/lua/shared/Foraging/forageSkills.lua:1-60`)]

Foraging XP comes when you notice a spot, not when you take it, and each spot gives it once. The amount is the distance since the last spot you noticed, times 4, reduced by 5% for each level you are above the item's skill, never less than 1. :cite[(`media/lua/client/Foraging/ISSearchManager.lua:640-654`, `media/lua/shared/Foraging/forageSystem.lua:154-158`, `media/lua/shared/Foraging/forageSystem.lua:2173-2181`)] On a server the distance is capped at 20 tiles. :cite[(`media/lua/server/Foraging/forageServer.lua:323-364`)] Taking an item also costs a little endurance and fatigue. :cite[(`media/lua/shared/Foraging/forageSystem.lua:118-119`, `media/lua/shared/Foraging/forageSystem.lua:2201-2213`)]

## 4. Single player and multiplayer

**In single player your own game does everything; on a server, the server owns the spots and the pickup.**

In single player the spots, the focus roll and the pickup run in your game, and you see the result at once. :cite[(`media/lua/client/Foraging/ISForageIcon.lua:37-46`, `media/lua/shared/Foraging/ISForageAction.lua:60-70`)]

On a server, the client asks for its zone and the server answers with a pool of spots built just for that player, using the player's focus. The server limits a player to one request every 250 ms, builds the pool, adds extra spots next to certain objects within 8 tiles, and drops a pool a minute after the player is more than 25 tiles from the zone. :cite[(`media/lua/server/Foraging/forageServer.lua:7-23`, `media/lua/server/Foraging/forageServer.lua:161-227`, `media/lua/server/Foraging/forageServer.lua:295-321`, `media/lua/server/Foraging/forageServer.lua:446-492`, `media/lua/client/Foraging/forageClient.lua:41-52`)] A pickup is accepted only if the spot is in that player's pool and within 30 tiles of the player; the items are made on the server. :cite[(`media/lua/server/Foraging/forageServer.lua:379-415`, `media/lua/shared/Foraging/ISForageAction.lua:60-73`)] The pool code is new next to Build 41, whose server file was commented out.

## 5. What Build 41 already had

**The category and Search Focus system is not new in B42.**

Build 41 already had categories, a Search Focus menu, the same unlock levels for Animals, Dead Animals and Berries, and the Farmer's Crops bonus. B42 raises the category count from 23 to 27 by adding Tracks, Crafting Materials, Bones and Artifacts, and adds the server-built pools. :cite[(`media/lua/shared/Foraging/forageCategories.lua:4-669`)] An earlier version of this page said B42 introduced the system, and that was wrong.

## 6. For modders

**Add an item with `forageSystem.addForageDef`, or change the tables during the foraging events.**

The system initializes on the map-zone load event, and fires `preAddForageDefs`, `preAddSkillDefs`, `preAddCatDefs`, `preAddZoneDefs`, `preAddItemDefs` and `onAddForageDefs` in that order, so a mod can add or change a definition from a handler. :cite[(`media/lua/shared/Foraging/forageSystem.lua:705-761`)] An item definition names the item type, the Foraging skill needed, categories, per-zone weights, the months, weather and day or night chances, and an optional spawn function. The defaults are listed in `forageDefinitions.lua`. :cite[(`media/lua/shared/Foraging/forageDefinitions.lua:3-55`)] An item that the sandbox Loot Item Removal List names is never added. :cite[(`media/lua/shared/Foraging/forageSystem.lua:763-766`, `media/lua/shared/Foraging/forageSystem.lua:1262-1275`)]

:::callout[Warning for server owners]{kind=warn}
The focus word comes from the client in the zone request. The server compares the named category's unlock level with the player's real level, but it does not check that the player has the Search Focus window open, so a client can ask for any category it has unlocked. The real limit is the pickup check: the spot must be in the player's own pool and within 30 tiles. :cite[(`media/lua/server/Foraging/forageServer.lua:84-105`, `media/lua/server/Foraging/forageServer.lua:295-321`, `media/lua/server/Foraging/forageServer.lua:379-415`)]
:::

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Lua and Java cited beside it. The category, zone and crop tables are copied from the files by a script, and the real-time figures are our own arithmetic. We did not run a game, so the spot counts, the 12% focus chance and the multiplayer pool are read from the code and not observed.

Build 41 facts come from the Build 41 install files `forageDefinitions.lua` and `forageServer.lua` under `media/lua/`, which the citation checker cannot open.

Not verified: the exact in-game look of the icons, the Farmer radius in play, how the 20-tile XP cap feels, the counts of items in the categories other than Crops, Animals and Dead Animals, and what the extra spots next to objects (sprite affinities) are in each zone.
:::
