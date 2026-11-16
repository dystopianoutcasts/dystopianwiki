---
id: build-42-modding-recipes-adding-a-crop-editing-an-animal-breed
slug: modding-recipes-adding-a-crop-editing-an-animal-breed
title: 'MODDING recipes: adding a crop / editing an animal breed'
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: advanced
tags:
  - animaldefinitions
  - farming
  - ranch-zones
  - foraging
  - husbandry
excerpt: >-
  A crop in 42.22 is a Lua table entry, not a script. The 17 keys every crop sets, the optional keys and what reads them, how to change a vanilla crop, and where to start on a new animal breed.
last_updated: '2026-11-16'
related_articles:
  - agriculture-basics-from-seed-to-harvest
  - seasons-curses-and-the-crop-table
  - crop-health-water-disease
  - modding-procedural-distributions
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders adding or retuning a crop](#1-a-crop-is-a-table-entry) | [modders starting on an animal breed](#4-animals-where-to-start)

An older version of this page said the crop format was unknown. It is known: a crop is one entry in a Lua table, and the complete working mod is on the [new crop recipe](/pz/build-42/modding/cookbook/new-crop). This page is the reference for the entry's keys, and a short pointer for animals, whose tables have their own pages.

:::callout[The 1-minute version]{kind=key}
- A crop is `farming_vegetableconf.props["YourCrop"]` plus five sprite tables under the same key, set in a `server` Lua file that runs after the vanilla farming files. The key is the crop's name and is saved on every plant.
- Every one of the 55 vanilla crops sets the same 17 keys; the rest are optional.
- The seed is a normal item with the seed tag. The crop entry names it in `seedName`, and sowing calls `seed` with the crop's key.
- To retune a vanilla crop, change its entry after the vanilla file loads. The game reads the entry each time a step grows.
- A new animal breed is an entry in each life stage's `breeds` table of an existing species. A new species needs art this page does not cover.
:::

:::facts
- **Required keys** 17, set by all 55 vanilla crops :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua:5-32`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua:3-27`)]
- **Sprite tables** 5: sprite, unhealthy, dying, dead and trampled :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:395-401`)]
- **Animal tables per species** 4: stages, genome, breeds and animals, in each of 10 species files :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:4`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:23`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:42`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:109`)]
- **Seed item tag** `IS_SEED`, which the Sow menu looks for :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:246-248`)]
:::

## 1. A crop is a table entry

**You add a crop by setting a key of `farming_vegetableconf.props` in a `server` Lua file, and the farming code reads it from then on.**

The table is created in the vanilla file, with five empty sprite tables beside it. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:395-401`)] Vanilla's crop files run first, so a mod's server file finds the table already built. :cite[(`zombie/Lua/LuaManager.java:1196-1202`)] The `server` Lua also loads on a multiplayer client, so the file needs no side guard. :cite[(`zombie/gameStates/GameLoadingState.java:155-158`)]

The key you choose is the crop's name for everything: the Sow menu lists every key, the plant stores it as its type, and the translation key is `Farming_` plus it. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1128-1131`, `media/lua/server/Farming/SFarmingSystem.lua:30-31`, `media/lua/shared/Translate/EN/Farming.json:2-3`)] The type is saved with the plant, so it survives a reload and a map-placed plant that loads from a save. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:30-31`, `media/lua/server/Map/MapObjects/MOFarming.lua:117-121`)]

The seed is an ordinary item script with the seed tag, and the crop's `seedName` names it. The [new crop recipe](/pz/build-42/modding/cookbook/new-crop) is a complete mod (the files, the translations, how to turn it on, and the debug steps to see it) and the best place to start. For a dedicated server, its enable line is `Mods=` and the mod id, separated from others by `;`, and the mod folder on the server.

## 2. The keys

**Seventeen keys are required, and the rest are optional switches that vanilla uses on some crops.**

Every vanilla crop sets: `icon`, `texture`, `waterLvl`, `waterNeeded`, `timeToGrow`, `minVeg`, `maxVeg`, `minVegAutorized`, `maxVegAutorized`, `vegetableName`, `seedName`, `badMonth`, `sowMonth`, `seasonRecipe`, `harvestLevel`, `mature` and `fullGrown`. What each does is on [Agriculture basics](/pz/build-42/modding/farming-and-animals/agriculture-basics-from-seed-to-harvest) (growth and harvest) and [Seasons, curses and the crop table](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table) (months and water). :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:17-76`, `media/lua/server/Farming/farming_vegetableconf.lua:270-334`)]

The optional keys, how many of the 55 set each, and what reads them:

| Key | Crops that set it | What it does | Code |
|---|---|---|---|
| `bestMonth`, `riskMonth` | 52 and 50 | Best months give the bonus-yield roll at sowing; risk months give the curse roll | `media/lua/server/Farming/SPlantGlobalObject.lua:176-202`, `media/lua/server/Farming/SPlantGlobalObject.lua:715-731` |
| `seedTypes` | 39 | Item types that sow this crop; when missing it is just `seedName` | `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1138-1141` |
| `growBack` | 17 | The phase a plant returns to after harvest, so it grows again | `media/lua/server/Farming/SFarmingSystem.lua:366-375` |
| `rotTime` | 6 | Hours of the blooming phase; half a step when missing | `media/lua/server/Farming/farming_vegetableconf.lua:285-288` |
| `isFlower` | 5 | Harvest lowers unhappiness, boredom and stress | `media/lua/server/Farming/SFarmingSystem.lua:338-342` |
| `scytheHarvest` | 4 | A scythe swing harvests a ready plant instead of destroying it | `media/lua/shared/TimedActions/ISScything.lua:80-86` |
| `harvestPosition` | 9 | `"High"` skips the back strain a low harvest adds | `media/lua/shared/Farming/TimedActions/ISHarvestPlantAction.lua:22-24`, `media/lua/shared/Farming/TimedActions/ISHarvestPlantAction.lua:51-58` |
| `coldHardy` | 9 | Immune to the winter curse and the cold health penalty | `media/lua/server/Farming/SPlantGlobalObject.lua:156-160` |
| `badMonthHardyLevel` | 2 | The growth step from which a bad month does not curse | `media/lua/server/Farming/SPlantGlobalObject.lua:148-154` |
| `aphidsBane`, `fliesBane`, `slugsBane`, `slugsProof` | 9, 5, 2 and 12 | Immunity to a disease; the three `Bane` keys also protect neighbors from phase 3 | `media/lua/server/Farming/SFarmingSystem.lua:385-411`, `media/lua/server/Farming/SPlantGlobalObject.lua:258-261` |
| `aphidsProof`, `fliesProof` | 0 | Also read as immunity, with no vanilla crop using them | `media/lua/server/Farming/SFarmingSystem.lua:391-393` |
| `produceExtra`, `seedPerVeg`, `isHouseplant` | 0 | `produceExtra` gives a second item per vegetable, `seedPerVeg` sets seeds per vegetable (0.5 when missing), `isHouseplant` exempts a plant from the indoor penalty | `media/lua/server/Farming/SFarmingSystem.lua:349-359`, `media/lua/server/Farming/SFarmingSystem.lua:187` |

Some keys that vanilla crops carry are read by nothing except a debug tooltip: `mothFood` (12), `mothBane` (7), `rabbitBane` (5) and `deerBane` (2), and `specialSeed` (2) was not found read at all. A mod can set them, but they change nothing in the game. :cite[(`media/lua/client/Farming/CFarmingSystem.lua:139-157`, `media/lua/server/Farming/farming_vegetableconf_vegetables.lua:60-84`)] The counts come from a script that read every crop block.

## 3. Changing a vanilla crop

**Set the key you want on the vanilla entry, from a `server` file that loads after it.**

The farming code reads the entry when it needs it: at sowing, at every growth step, at harvest, and in the Sow tooltip. So a change in your file takes hold for plants that are sown or advanced afterward. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:295-327`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:567-611`)] For example, to make carrots grow in 360 hours a step instead of 432, add this line to the `server` file of the complete mod on the [new crop recipe](/pz/build-42/modding/cookbook/new-crop), after its `require` line:

```lua
farming_vegetableconf.props["Carrots"].timeToGrow = 360
```

To see the change, right-click a furrow and open Sow, then hover the crop. The tooltip appears only with Agriculture 6, with the crop's season recipe known, or in cheat mode. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:543`)] 

It prints 75 days to harvest instead of 90, because it is `timeToGrow` times the harvest level over 24 (360 x 5 / 24), divided by the Farming Speed option. That is 75 at Farming Speed 1.0, which is the default and the value of the Apocalypse, Extinction and Rising presets; the Outbreak preset sets 1.5, which would print 50. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:567-570`, `media/lua/server/Farming/farming_vegetableconf.lua:104-107`, `media/lua/shared/Sandbox/Outbreak.lua:162`, `media/lua/shared/Sandbox/Apocalypse.lua:162`)] This was not run in a game.

A trap in the vanilla files: habanero and jalapeno each set `harvestLevel` twice in their entry (5, then 3), and the later line wins, so they are ready at step 3 like the other herbs. A repeated key in a Lua table gives no warning, so check your own entry for duplicates. :cite[(`media/lua/server/Farming/farming_vegetableconf_herbs.lua:207-210`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua:234-237`)]

Two cautions about changes. A plant that is already growing has its next step time stored in saved data, so an edit does not move it. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:30-35`)] And a crop's seeds are in loot lists, which are a separate edit: see [procedural distributions](/pz/build-42/modding/farming-and-animals/modding-procedural-distributions).

The `Farming` crafting category in `recipes_farming.txt` holds 13 recipes: the five cures, `PutSeedsInPacket` and `OpenPacketOfSeeds`, `MakeScarecrow`, `CollectSeeds` (nine vegetables), `CollectSunflowerSeeds`, `CollectPoppySeeds`, `ShredTobacco` and `ThreshGrain`. :cite[(`media/scripts/generated/recipes/recipes_farming.txt:3-440`)] Their seed and packet lists name vanilla items only, so a new crop's seed is not packable until a mod edits those recipes. That last step was not tried.

The drying, flax and mill recipes are in other files: for example `DryCorn` in the drying rack file, `HeckleFlax` in the flax file and `MillSeeds` in the stone mill file. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_Drying_Rack_craftRecipe.txt:3`, `media/scripts/generated/entities/agricultural/craftRecipes/recipes_flax.txt:20`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:51`)]

## 4. Animals: where to start

**A new breed is an entry in an existing species' `breeds` tables; a new species also needs art.**

Each of the 10 species files (chicken, cow, deer, mouse, pig, rabbit, raccoon, rat, sheep, turkey) fills four tables under `AnimalDefinitions`: `stages`, `genome`, `breeds` and `animals`. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:4`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:23`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:42`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:109`)] A breed holds its textures, its icons and gene limits (`forcedGenes`, for genes such as `maxMilk`, `milkInc` and `meatRatio`), and each life stage in `animals` gets its own copy of the species' breed table through `copyTable`. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:23-52`, `media/lua/shared/Definitions/animal/RabbitDefinitions.lua:109-125`)] The `ageToGrow` of a stage is written as months times 30, as in `4 * 30`. :cite[(`media/lua/shared/Definitions/animal/RabbitDefinitions.lua:8`)]

Use the [new animal recipe](/pz/build-42/modding/cookbook/new-animal) for a complete mod that adds a breed, [the AnimalDefinitions table](/pz/build-42/modding/farming-and-animals/modding-the-animaldefinitions-global-table) for the keys, and [ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones) for where animals spawn on the map.

:::callout[How we know]{kind=proof}
The keys, the counts and what reads them come from the 42.22 farming Lua, read by a script over every crop block. The one-line timing edit and the packing remark are our own reading, and we did not run a game or a mod for either.

Not verified: the full set of art a new crop sprite needs (the new crop recipe reuses the carrot's), what `specialSeed` is for, and whether an edit to a crop affects plants already growing in a loaded world.
:::
