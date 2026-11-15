---
id: build-42-new-crop
slug: new-crop
title: New crop
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a mod that adds a crop, the Demo Carrot, with its own seed item. A crop is a Lua table of growth numbers and sprites in the vanilla farming files, which the mod fills in for its own name.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-item
  - agriculture-basics-from-seed-to-harvest
  - seasons-curses-and-the-crop-table
  - modding-recipes-adding-a-crop-editing-an-animal-breed
  - crop-health-water-disease
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoCrop`: one seed item script, one Lua file for the crop, two translation files, and the usual `mod.info` and `poster.png`.
- A crop is not a script block. It is an entry in the Lua table `farming_vegetableconf.props`, with the crop's name as the key, plus five sprite tables under the same key.
- Sowing reads your entry when the player sows, so a mod file that runs after the vanilla files is enough. Map-placed plants of your own sprites are not covered.
- The seed item carries the tag `base:isseed`, and the crop entry names it in `seedName`.
- The demo crop copies the vanilla carrot entry and its sprites, so it needs no art and grows like a carrot.
- You turn on the debug Agriculture Cheat mode, dig a furrow, and sow the Demo Carrot Seed. Whether the plant then grows and can be harvested is not checked in a game.
:::

:::facts
- **Mod id** `RecipeDemoCrop`
- **Crop key** `RecipeDemoCarrot`, shown as Demo Carrot
- **Seed** `RecipeDemoCrop.CarrotSeed`, shown as Demo Carrot Seed
- **Harvest** the vanilla `Base.Carrots`
- **Files** 6 (`mod.info`, `poster.png`, one script, one Lua file, `ItemName.json`, `Farming.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A seed that the player can sow in a furrow, which grows into the plant of a crop that your mod defines.**

The crop format is in the vanilla Lua: the farming system reads one table, and each crop is one entry in it. Every crop has a name, an entry with the numbers for growth, water, seasons and harvest, and eight sprite names for each of five states of the plant.

In the game you add a **Demo Carrot Seed**, dig a furrow, and sow the seed. The Sow menu lists the seed, and its tooltip names **Demo Carrot** and shows its growth numbers. The plant looks like a carrot plant, because it uses the carrot's sprites.

## The files

**The mod files, with the script, the Lua file and the translation files in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `42/` folder and the same `poster.png`. This recipe leaves out the skeleton's `Boot.lua`, because the crop's Lua file does that job.

```
Zomboid/mods/RecipeDemoCrop/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoCrop_items.txt
      lua/
        server/
          Farming/
            RecipeDemoCrop_conf.lua
        shared/
          Translate/
            EN/
              ItemName.json
              Farming.json
```

The Lua file sits in `media/lua/server/Farming/`, next to the vanilla farming files that it extends. The game loads the `server` Lua folder when a game is loaded, including on a client. :cite[(`zombie/gameStates/GameLoadingState.java:155-158`)] It runs the game's own files first and the mod files after them, so the vanilla tables exist when your file runs. :cite[(`zombie/Lua/LuaManager.java:1196-1202`)] Whether a dedicated server loads the folder by the same call was not checked.

## Step by step

**Write the six files in this order.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Crop
id=RecipeDemoCrop
description=Adds a crop, Demo Carrot, with its own seed. It grows like the vanilla carrot.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoCrop_items.txt`

This is the seed. It is modeled on the vanilla carrot seed: a plain item with the tag that marks it as a seed, and it uses the vanilla icon and model of a generic seed packet. :cite[(`media/scripts/generated/items/normal.txt:5214-5222`)]

**File `42/media/scripts/RecipeDemoCrop_items.txt`**

```
module RecipeDemoCrop
{
    item CarrotSeed
    {
        DisplayCategory = Gardening,
        ItemType = base:normal,
        Icon = Seeds_Generic,
        Weight = 0.02,
        WorldStaticModel = Seeds_Generic,
        Tags = base:isseed,
    }
}
```

The tag is what makes the Sow option appear: the farming menu offers it when the player's inventory holds an item with the seed tag and the square is a furrow. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:246-248`)] The item's own name comes from `ItemName.json`, as in the [new item recipe](/pz/build-42/modding/cookbook/new-item).

### Step 3. `42/media/lua/server/Farming/RecipeDemoCrop_conf.lua`

This is the crop. Its entry is a copy of the vanilla carrot entry, with a new key and the seed of your mod. :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables.lua:117-142`)]

**File `42/media/lua/server/Farming/RecipeDemoCrop_conf.lua`**

```lua
require "Farming/farming_vegetableconf"

local conf = farming_vegetableconf

conf.props["RecipeDemoCarrot"] = {
    icon = "Item_Carrots",
    texture = "vegetation_farming_01_38",
    waterLvl = 30,
    timeToGrow = 432,
    minVeg = 3,
    maxVeg = 6,
    minVegAutorized = 10,
    maxVegAutorized = 15,
    vegetableName = "Base.Carrots",
    seedName = "RecipeDemoCrop.CarrotSeed",
    harvestLevel = 5,
    waterNeeded = 70,
    mature = 5,
    fullGrown = 6,
    badMonth = { 1, 10, 11, 12, },
    badMonthHardyLevel = 4,
    sowMonth = { 2, 3, 4, 5, 6, 7 },
    bestMonth = { 2, 6 },
    riskMonth = { 7 },
    seasonRecipe = "base:carrot growing season",
}

conf.sprite["RecipeDemoCarrot"] = conf.sprite["Carrots"]
conf.unhealthySprite["RecipeDemoCarrot"] = conf.unhealthySprite["Carrots"]
conf.dyingSprite["RecipeDemoCarrot"] = conf.dyingSprite["Carrots"]
conf.deadSprite["RecipeDemoCarrot"] = conf.deadSprite["Carrots"]
conf.trampledSprite["RecipeDemoCarrot"] = conf.trampledSprite["Carrots"]
```

The vanilla file starts with the same `require`, and it creates the table and its sprite sub-tables. :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables_sprites.lua:1-3`, `media/lua/server/Farming/farming_vegetableconf.lua:395-401`)] The key of the entry is the name of the crop, which the game keeps on each plant as its `typeOfSeed`. The planting menu lists every key of the table. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1128-1131`, `media/lua/server/Farming/SFarmingSystem.lua:335`)]

| Line | What it does | Code |
|------|--------------|------|
| `seedName`, `seedTypes` | Name the seed items that sow this crop, by full type. `seedTypes` is a list; when it is missing the list is just `seedName`. At harvest a plant that has seed gives the player `seedName` items. | `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1138-1141`, `media/lua/server/Farming/SFarmingSystem.lua:353-358` |
| `vegetableName`, `minVeg`, `maxVeg`, `minVegAutorized`, `maxVegAutorized` | The item handed over at harvest, and the range of how many. The number is raised or lowered by the plant's health and pests, and held under the two Autorized limits. | `media/lua/server/Farming/SFarmingSystem.lua:333-345`, `media/lua/server/Farming/farming_vegetableconf.lua:17-70` |
| `waterLvl`, `waterNeeded` | The water levels the plant is checked against: `waterNeeded` at the start, `waterLvl` once it is growing. | `media/lua/server/Farming/farming_vegetableconf.lua:313`, `media/lua/server/Farming/farming_vegetableconf.lua:327` |
| `timeToGrow` | Hours of game time for one growth step, before the sandbox speed setting is applied. The sowing tooltip turns it into days. | `media/lua/server/Farming/farming_vegetableconf.lua:82-101`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:570` |
| `mature`, `fullGrown`, `harvestLevel` | Growth stages, counted from 0. The plant is mature at `mature`, bears seed at `fullGrown`, rots after it, and can be harvested from `harvestLevel` on. | `media/lua/server/Farming/farming_vegetableconf.lua:283-296`, `media/lua/server/Farming/farming_vegetableconf.lua:329-331` |
| `badMonth`, `sowMonth`, `bestMonth`, `riskMonth`, `badMonthHardyLevel` | Months of the year, 1 to 12, for the growing seasons. With the sandbox option for growing seasons on, an outdoor plant in a bad month is cursed or loses health, unless it has grown to the `badMonthHardyLevel` stage or beyond. | `media/lua/server/Farming/SPlantGlobalObject.lua:134-153`, `media/lua/server/Farming/SPlantGlobalObject.lua:164-170`, `media/lua/server/Farming/SFarmingSystem.lua:172-173`, `media/lua/server/Farming/SFarmingSystem.lua:229-231` |
| `seasonRecipe` | The name of the recipe that teaches this crop's seasons. A player who knows it, or has enough farming experience, or has the cheat on, can sow the crop. | `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:543` |
| `icon`, `texture` | The icon for the plant window, and the picture in the sowing tooltip. The two are names of textures that vanilla provides. | `media/lua/client/Farming/ISUI/ISFarmingInfo.lua:22`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:558` |

Sowing needs nothing else from the vanilla files. The planting command calls `seed` with the crop's key, and `seed` reads your entry when it runs. :cite[(`media/lua/server/Farming/farmingCommands.lua:90-93`, `media/lua/server/Farming/SPlantGlobalObject.lua:715-731`)]

One vanilla file does read the table while it loads: `MOFarming.lua` loops over every crop to hook the plants that arrive from the map and to fill its private sprite map. :cite[(`media/lua/server/Map/MapObjects/MOFarming.lua:132-142`, `media/lua/server/Map/MapObjects/MOFarming.lua:8`)] It is a game file, so it runs before any mod file, and the map is a local variable that a mod cannot reach, so your crop is not in that loop. :cite[(`zombie/Lua/LuaManager.java:1196-1203`)] Because the demo's sprites are the carrot's, that loop has already hooked the same sprites for the carrot, and a plant placed from the map with those sprites stays a carrot. A crop whose own sprites should come in from the map would need an edit of that vanilla file, which this recipe does not do.

The five sprite tables hold eight sprite names each, one for each growth stage, and the game picks the table by the plant's health and state. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:245-268`)] The demo points each table at the vanilla carrot's list, so the mod needs no art. :cite[(`media/lua/server/Farming/farming_vegetableconf_vegetables_sprites.lua:33-42`, `media/lua/server/Farming/farming_vegetableconf_vegetables_sprites.lua:355-364`)] A crop with its own art needs tiles in a tile pack, which this recipe does not cover.

### Step 4. `42/media/lua/shared/Translate/EN/ItemName.json`

This file names the seed. The key is the full type. :cite[(`zombie/core/Translator.java:608-626`)]

**File `42/media/lua/shared/Translate/EN/ItemName.json`**

```
{
    "RecipeDemoCrop.CarrotSeed": "Demo Carrot Seed"
}
```

### Step 5. `42/media/lua/shared/Translate/EN/Farming.json`

This file names the crop. The key is `Farming_` followed by the crop's key in the table, as in the vanilla file. :cite[(`media/lua/shared/Translate/EN/Farming.json:2-3`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:556`)]

**File `42/media/lua/shared/Translate/EN/Farming.json`**

```
{
    "Farming_RecipeDemoCarrot": "Demo Carrot"
}
```

The translator reads `Farming.json` into its own table. :cite[(`zombie/core/Translator.java:149`)]

## Turn it on and see it work

**Copy the folder, start the game in debug mode, turn on the cheat, dig a furrow and sow.**

1. Put the `RecipeDemoCrop` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoCrop/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Crop**, choose **ACCEPT**, and start a new game.
3. Open the debug **Items List**, as the [new item recipe](/pz/build-42/modding/cookbook/new-item) shows, and add one **Demo Carrot Seed**.
4. Open the debug menu, choose **Cheats**, and turn on **Agriculture Cheat mode**. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:5652`, `media/lua/shared/Translate/EN/IG_UI.json:5895`, `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua:113-120`)] With the cheat enabled, the Sow menu lists every crop, and a crop can be sown without knowing its season recipe. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:538-543`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1142`)]
5. Right-click a square of bare dirt, and choose **Dig Furrow with Hands**, or **Dig Furrow** if you carry a shovel. The square has to be free and its ground has to be dirt, so grass does not work. :cite[(`media/lua/shared/Translate/EN/ContextMenu.json:89-90`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:139-166`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:526-533`)]
6. Right-click the furrow, and choose **Plowed Land**, then **Sow**. The submenu lists **Demo Carrot Seed** by the seed's name, and with the cheat on it also lists every vanilla seed. Hovering over your entry shows the crop name **Demo Carrot** and its growth numbers. :cite[(`media/lua/client/Farming/ISUI/ISFarmingMenu.lua:280-287`, `media/lua/shared/Translate/EN/Farming.json:128`, `media/lua/shared/Translate/EN/ContextMenu.json:95`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1118`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1142-1147`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:548-558`)]
7. Choose it and sow in the furrow.

You should see a plant that looks like a young carrot. The growth steps take game days. The code has a debug option named `Cheat.Farming.FastGrow` that shortens them, and this recipe did not check how to enable it. :cite[(`media/lua/server/Farming/farming_vegetableconf.lua:282`)] These steps are checked against the code only; the crop has not been run in a game, and growth and harvest are what you check yourself.

On a dedicated server, put `Mods=RecipeDemoCrop` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. Players need the mod too. These server steps have not been run in a game.

## If it does not work

**A crop fails in a few predictable ways, and most of them show as a Lua error in the log.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| The Sow option never appears | The seed item has no `base:isseed` tag, or the square is not a furrow. | `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:246-248` |
| The Sow menu does not list your crop, and `console.txt` has an error from the farming menu | The seed in `seedName` is not an item that exists, so the menu cannot read its name. Check the module and the item name. | `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1138-1147` |
| The crop is listed as `Farming_RecipeDemoCarrot` | `Farming.json` is missing, in the wrong folder, or has a different key. | `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:1130` |
| The Sow entry is grayed out | You carry no seed of that type. With the cheat off, a player who does not know the season recipe and has too little farming experience also gets no tooltip, but the entry is not grayed for that reason. | `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:540-543`, `media/lua/client/Farming/ISUI/ISFarmingMenu.lua:561-564` |
| The plant is invisible, or the log has an error about a missing table | One of the five sprite tables has no entry for your key. The game then finds no sprite name for that state. | `media/lua/server/Farming/farming_vegetableconf.lua:262-268` |
| Nothing from the mod loads, and the log says nothing about it | The Lua file is not under `media/lua/`, or the mod is not enabled. The folder `server` is loaded when a game is loaded. | `zombie/gameStates/GameLoadingState.java:155-158` |
| `attempt to index a nil value` naming `farming_vegetableconf` | The file ran before the vanilla farming file, or the `require` line is missing. Keep the `require` as the first line. | `media/lua/server/Farming/farming_vegetableconf_vegetables_sprites.lua:1` |

Run the Kahlua checker on the mod before you start the game: it reports Lua calls that the game's Lua does not have. The command is `python -I check-kahlua.py <your mod folder>`, and the script is in the OutcastLib repository folder `scripts`. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors.

## Going further

**Learn how a plant lives, and how the seasons work.**

- [Agriculture basics: from seed to harvest](/pz/build-42/modding/farming-and-animals/agriculture-basics-from-seed-to-harvest) is the loop the player sees.
- [Seasons, curses and the crop table](/pz/build-42/modding/farming-and-animals/seasons-curses-and-the-crop-table) covers the month lists.
- [Crop health, water and disease](/pz/build-42/modding/farming-and-animals/crop-health-water-disease) covers what the numbers do to a plant.
- [Adding a crop and editing an animal breed](/pz/build-42/modding/farming-and-animals/modding-recipes-adding-a-crop-editing-an-animal-breed) is the older reference for this page.

:::callout[How we know]{kind=proof}
The crop entry and the sprite tables are copied from the vanilla carrot, and the farming behavior comes from the 42.22 Lua cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Kahlua checker. It has not been run in a game: how the plant grows, whether the harvest gives the carrots, and the fast-growth debug setting are what you check yourself.

The effect of `isFlower`, `growBack`, `produceExtra`, `rotTime`, `waterLvlMax` and the other optional keys that vanilla crops use is not described here. How a dedicated server loads the `server` Lua folder was not checked.
:::
