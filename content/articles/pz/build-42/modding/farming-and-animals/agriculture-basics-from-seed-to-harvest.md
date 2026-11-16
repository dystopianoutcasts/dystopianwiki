---
id: build-42-agriculture-basics-from-seed-to-harvest
slug: agriculture-basics-from-seed-to-harvest
title: 'Agriculture basics: from seed to harvest'
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
  The farming loop in 42.22: where seeds come from, where a furrow can go, what sowing, watering and harvesting do, what destroys a plant, and how a harvest is counted.
last_updated: '2026-11-16'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - foraging-in-b42
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [players who farm](#1-getting-seeds) | [modders adding a crop](#5-how-a-harvest-is-counted)

Outcast, this is the farming loop as the 42.22 code runs it: seeds, a furrow, sowing, tending, harvest. Health, water and disease have [their own page](/pz/build-42/modding/farming-and-animals/crop-health-water-disease), and the month rules are on the [seasons page](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table).

:::callout[The 1-minute version]{kind=key}
- Loop: get seeds, dig a furrow, sow, water and tend, harvest. In multiplayer the server grows the plants; the client sends the actions and draws the result.
- Seeds come from packets (5 seeds each), from cutting seeds out of some vegetables, from a plant that has reached its blooming phase, and from foraged wild crops.
- A furrow needs a free square of natural dirt on the ground floor, and you can dig it with your hands (it may injure them). Digging clears the grass.
- A plant under a roof loses health every health tick unless the room is a greenhouse, while the default Kill Crops Grown Inside option is on.
- A zombie standing on a plant, or a vehicle driving over it, can destroy it. A scythe swing harvests or destroys the plants in its area.
- The harvest count rises with health above 50, drops with aphids and slugs, and at higher skill sometimes jumps by your skill level. The Farming Abundance slider does not change the count in 42.22.
:::

:::facts
- **Vanilla crops** 55, 32 in the vegetable file and 23 in the herb file :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua`)]
- **Seeds per packet** 5, and the empty packet comes back :cite[(`media/scripts/generated/recipes/recipes_farming.txt:186-199`)]
- **Water per use** 200 mL from a fluid container (`farmingFluidContainerMillilitresPerUse`) buys 10 water points; at most 10 uses (2 liters) per watering :cite[(`media/lua/shared/defines.lua:52`, `media/lua/server/Farming/SPlantGlobalObject.lua:501-518`)]
- **Furrow fade** after 30 game days, 1 chance in 20,000 every 10 game minutes, which is 37.5 real seconds at the default Day Length :cite[(`media/lua/server/Farming/SFarmingSystem.lua:253-262`)]
- **Zombie trample** 1 chance in 100 per zombie update at normal game speed :cite[(`zombie/characters/IsoZombie.java:3419-3424`)]
- **Conversion** at the default Day Length (option 4) a game hour is 3.75 real minutes :cite[(`zombie/SandboxOptions.java:413-423`)]
:::

## 1. Getting seeds

**Seeds come from five places, and only a plant that reached its blooming phase gives seeds back at harvest.**

- **Seed packets.** A packet opens into 5 seeds and an empty packet. :cite[(`media/scripts/generated/recipes/recipes_farming.txt:186-199`)]
- **Cutting them out.** The `CollectSeeds` recipe turns one whole vegetable into one seed and needs a knife or tweezers that is not dull. The vegetable is destroyed and may be rotten. It works for 9 vegetables: bell pepper, cucumber, habanero pepper, jalapeno pepper, pumpkin, tomato, strawberry, watermelon and zucchini. :cite[(`media/scripts/generated/recipes/recipes_farming.txt:340-368`)] Two more recipes turn a dried sunflower head into 10 seeds and dried poppy pods into 1 seed. :cite[(`media/scripts/generated/recipes/recipes_farming.txt:370-400`)]
- **Blooming plants.** A harvest from a plant in its blooming phase also gives seeds (section 5).
- **Sowing the crop itself.** Some crops list the vegetable or herb as a seed too, and the Sow menu offers it when it is whole and not rotten, cooked or burnt. A herb cutting must also be fresh. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:24-47`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1128-1141`)]
- **Foraging.** Each of the 6 wild crops you forage has a 75 in 100 chance to come with 1 to 10 seeds of that crop (see [Foraging in B42](/pz/build-42/modding/farming-and-animals/foraging-in-b42)). :cite[(`media/lua/shared/Foraging/forageSystem.lua:2290-2302`, `media/lua/shared/Foraging/forageSystem.lua:324-359`)]

The Sow option appears when you carry any item with the seed tag and the square is a furrow. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:246-248`)]

## 2. Where a furrow can go

**A furrow needs a free square of natural dirt on the ground floor, with no grave and no live plant on it.**

The menu checks the square for a grave and a live plant first, then for ground level (unless the sandbox option Farms not on Ground Level is enabled, and it is off by default), then for a free square whose ground is dirt. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:514-533`, `zombie/SandboxOptions.java:238`)] Dirt here means a floor tile whose name starts with `blends_natural_01_` or `floors_exterior_natural`, except the sand, clay and gravel tiles. :cite[(`media/lua/server/BuildingObjects/ISShovelGroundCursor.lua:97-130`)]

You do not need a shovel. The menu offers Dig Furrow when you carry a tool with the dig tag, and Dig Furrow with Hands otherwise, which is grayed out when a hand is injured. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:141-166`)] Without gloves, a hand dig has a 1 in 10 chance to scratch a hand. :cite[(`media/lua/shared/Farming/TimedActions/ISPlowAction.lua:76-86`)] Digging clears the grass and tall vegetation on the square and puts the furrow there. :cite[(`media/lua/shared/Farming/TimedActions/ISPlowAction.lua:112-124`)]

A plant under a roof is not refused. It loses health instead: every health tick it takes 1 point (times the bad-care multiplier, see the [health page](/pz/build-42/modding/farming-and-animals/crop-health-water-disease)), unless it is a houseplant or sits in a room whose name contains "greenhouse". Kill Crops Grown Inside is on by default. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:152-169`, `media/lua/server/Farming/SFarmingSystem.lua:220-223`, `zombie/SandboxOptions.java:236`)]

A furrow, a destroyed plant or a harvested plant that is older than 30 game days has a 1 in 20,000 chance each ten game minutes of being removed. A dead plant has a 1 in 5,000 chance each ten game minutes of becoming a destroyed one. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:253-262`, `media/lua/server/Farming/SFarmingSystem.lua:264-270`)]

## 3. The steps

**Dig, sow, then water, treat and fertilize until the plant is ready, and harvest it.**

:::flow[One plant, start to finish]
- Dig a furrow
- Sow a seed
- Water to the crop's minimum
- Treat, fertilize, weed
- Harvest when ready, ideally blooming
:::

- **Sow.** Right-click the furrow, then Sow, then pick a seed. The action takes the seed from your inventory and sets the plant's type and owner; the plant's starting health and its curse roll happen here. :cite[(`media/lua/shared/Farming/TimedActions/ISSeedActionNew.lua:56-70`, `media/lua/server/Farming/SPlantGlobalObject.lua:715-746`)]
- **What the Sow tooltip shows.** Once you know the crop's season recipe, or have Agriculture level 6, the tooltip lists the crop's minimum water, its average growth time in days, and its sowing, best and risk months while Plant Growing Seasons is enabled. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:536-565`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:567-611`)]
- **Water.** Each use adds 10 to the plant's water level, up to 100. :cite[(`media/lua/server/Farming/SPlantGlobalObject.lua:501-518`)] Rain adds more on its own (see the health page). The Water entry shows only while the plant is still growing. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:250-252`)]
- **Weeds.** A weed is anything on the square besides the plant: a tree, grass or bush sprites, wall vines. A weedy square doubles the bad-care multiplier, doubles water loss and halves the fertilizer time bonus. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:588-632`, `media/lua/server/Farming/SFarmingSystem.lua:171-183`, `media/lua/server/Farming/SPlantGlobalObject.lua:422-433`, `media/lua/server/Farming/SPlantGlobalObject.lua:596-603`)]
- **Strain.** Sowing, and harvesting a low plant, add back muscle strain, cut by 5% per Agriculture level. :cite[(`media/lua/shared/Farming/TimedActions/ISSeedActionNew.lua:56-58`, `media/lua/shared/Farming/TimedActions/ISHarvestPlantAction.lua:51-58`)]

### Growth phases

A plant moves through numbered phases, and the plant window names them.

The phase number counts from 1 after sowing. The name is "Seedling" up to phase 2, "Young" after that, "Almost Ready for Harvest" at the crop's harvest level, "Ready to harvest" once it can be picked, and "Blooming" once it carries seed. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:168-186`, `media/lua/shared/Translate/EN/Farming.json:67-79`)]

Most crops (harvest level 5) are ready at phase 6 and bloom at phase 7. Eight crops (barley, flax, hemp, hops, rye, strawberry plant, tomato vine and winter wheat; harvest level 6) bloom the moment they are ready, so they have no separate ready phase. Of the 23 herbs, 22 have harvest level 3, so they are ready at phase 4 and bloom at phase 5; wild garlic uses the vegetable levels. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:283-331`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua:3-27`, `media/lua/server/Farming/farming_vegetableconf_herbs.lua:563-590`)]

Each step takes the crop's `timeToGrow` in game hours, plus a random offset of -12 to +12 hours, divided by the Farming Speed option. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:78-122`, `media/lua/server/Farming/farming_vegetableconf.lua:295-327`)] A plant is ready after harvest level times that step: 5 x 292 hours is about 60.8 game days, which is about 91 real hours at the default Day Length. The blooming phase lasts the crop's `rotTime`, or half a step when it has none, and a plant that is not harvested by the end of it rots. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:283-296`)] The full table of times is on the [seasons page](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table).

## 4. What destroys a plant

**A zombie on the square, a vehicle crossing it, a scythe swing, or you.**

- **Zombies.** A zombie standing on a square with a plant rolls a 1-in-N chance on each of its updates, where N is 100 divided by the game speed multiplier (at least 1). A hit destroys the plant. :cite[(`zombie/characters/IsoZombie.java:3419-3424`, `zombie/iso/IsoGridSquare.java:11296-11302`)] That code runs in the zombie's own update, so it runs where the zombie is simulated: single player and the server.
- **Vehicles.** A moving vehicle checks the squares next to it and destroys any plant it overlaps, unless the vehicle script sets `notKillCrops`. :cite[(`zombie/vehicles/BaseVehicle.java:3585-3595`, `zombie/iso/IsoGridSquare.java:9930-9933`, `zombie/scripting/objects/VehicleScript.java:279`)]
- **Scythes.** A scythe swing visits every square of its area, 3 by 3 for a scythe and 1 by 1 for a hand scythe. A ready plant of one of the four scythe crops (barley, flax, rye, winter wheat, set by `scytheHarvest`) is harvested, with no Agriculture XP. Any other plant in the area is destroyed. :cite[(`media/lua/shared/TimedActions/ISScything.lua:38-48`, `media/lua/shared/TimedActions/ISScything.lua:80-86`, `media/lua/shared/TimedActions/ISScything.lua:104-113`)]
- **You.** The Remove entry in the plant's menu removes the plant and needs a shovel. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:455-458`)]

Players walking over a plant do not hurt it: the callers that destroy a plant are the zombie update, the vehicle check, the scythe and the remove command. :cite[(`zombie/characters/IsoZombie.java:3419-3424`, `zombie/iso/IsoGridSquare.java:9930-9933`, `media/lua/shared/TimedActions/ISScything.lua:80-86`)] We looked at those callers only.

## 5. How a harvest is counted

**The count is a roll between a minimum and a maximum that move with the plant's health, trimmed by pests, and sometimes boosted by your skill.**

Each crop has `minVeg` and `maxVeg`, and two caps, `minVegAutorized` and `maxVegAutorized`. The game adds the health step, one for every 10 points of health above 50 (and minus one for every 10 below), to both ends, then holds them under the caps. A plant with the bonus-yield flag that is not cursed raises the caps by 1 and takes the better of two rolls. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:336`, `media/lua/server/Farming/farming_vegetableconf.lua:17-62`)]

Then pests apply: each full 10 points of aphids and of slugs removes one item.

Then skill applies. With a chance of your Agriculture level in 10, your level is added to the count, so at level 5 half of all harvests get 5 extra items. The result is never below 1. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:63-75`)] The level used is the harvester's, read on the server. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:333-336`)]

:::callout[Farming Abundance does nothing in 42.22]{kind=warn}
The slider is read, and the result is stored in a global variable, `numberOfVeg`, that the harvest never reads. The function returns the count from before the multiplier, and the harvest uses that. So raising or lowering Farming Abundance leaves the number of vegetables unchanged. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:72-75`, `media/lua/server/Farming/SFarmingSystem.lua:336`)] Nothing else in the Lua or Java reads the option. :cite[(`zombie/SandboxOptions.java:240`)]
:::

Harvest then gives the vegetable item, plus `produceExtra` when the crop has one. A plant that carries seed also gives at least 1 seed of the crop's `seedName`, normally half the vegetable count rounded down. For the five flower crops (chamomile, lavender, marigold, rosemary, roses) the harvest also lowers unhappiness, boredom and stress by half the count each. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:333-359`)]

Most plants are then left as a harvested plant. The 17 crops with `growBack` (kale, the strawberry plant and 15 herbs) go back to phase 2 instead and grow again, and their fertilizer count resets. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:361-381`)]

Only the player who sowed a plant gets Agriculture XP for it: the harvest compares the harvester with the owner saved on the plant. :cite[(`media/lua/shared/Farming/TimedActions/ISHarvestPlantAction.lua:61-72`, `media/lua/shared/Farming/TimedActions/ISSeedActionNew.lua:62-68`)] The XP formula is on [The three farming skills](/pz/build-42/modding/farming-and-animals/the-three-farming-skills).

## 6. Who runs it

**The server, or single player, owns every plant; a client sends commands and reads the plant's mod data.**

The farming system returns at once on a multiplayer client, and its handlers run in single player and on a dedicated server. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:1`, `media/lua/server/Farming/SFarmingSystem.lua:83-85`)] The clocks that drive growth (hours, health every 2 hours, water every 5) tick on the server's `EveryTenMinutes` event. :cite[(`media/lua/server/Farming/SFarmingSystem.lua:87-119`, `media/lua/server/Farming/SFarmingSystem.lua:582-586`)]

**Warning for server owners.** The handler table accepts a command from any connected client and adds what the arguments say. Watering sends one `water` command per use from the action's update and the server adds 10 points each time, without checking the sender's container or distance. The `seed`, `fertilize` and cure commands read `args.skill` and `args.uses` as sent, and the `cheat` command takes any field name and a client-chosen count, clamped to 0 to 100, with no admin check in Lua. The timed actions themselves finish on the server with the server's own skill and items. :cite[(`media/lua/server/Farming/farmingCommands.lua:13-139`, `media/lua/shared/Farming/TimedActions/ISWaterPlantAction.lua:22-30`, `media/lua/shared/Farming/TimedActions/ISFertilizeAction.lua:58-65`, `zombie/globalObjects/SGlobalObjectSystem.java:118-125`)]

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Lua and Java cited beside it, and the real-time figures are our own arithmetic on those lines. We did not run a game, so the zombie trample rate, the scythe results, sowing a vegetable as its own seed, and the server warning were not played or tested.

The seed tag is `base:isseed` (`isseed` in older notes) and the dig tag was called `digplow`; the `scythe` tag and `takedirt` of the older notes are not what the code reads (it reads the scythe crops' own `scytheHarvest` key). Not verified: whether anything outside the callers listed also destroys plants. An older note mentioned a Take Dirt and Dirt Floor step for ground without dirt. We found no code for it in the farming files and dropped it.
:::
