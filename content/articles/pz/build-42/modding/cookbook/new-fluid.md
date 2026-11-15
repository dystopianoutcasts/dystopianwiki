---
id: build-42-new-fluid
slug: new-fluid
title: New fluid
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
  Build a mod that adds a new drink, Demo Tea, and a glass flask that you can spawn already full of it and drink from. One fluid, one item and two translation files, with no Lua.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-item
  - fluids-for-modders-start-here
  - defining-a-fluid-names-poison-properties
  - fluid-container-calls-that-lie
  - what-a-mod-fluid-can-plug-into
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoFluid`: one script with a `fluid` block and an `item` block, two translation files, and the usual `mod.info` and `poster.png`.
- A fluid is defined on its own, and an item holds it through a `component FluidContainer` block written directly inside the item block.
- The `Fluids { fluid = RecipeDemoTea:1.0 }` block inside the container is the starting content, not a list of what the container may hold.
- A not-empty flask whose main fluid is in the `Beverage` category gets a Drink option in the inventory menu. Bleach gets it too, and a water source is handled by a branch that comes first.
- Give your fluid a new name. A fluid named like a vanilla one, in any letter case, replaces the vanilla definition.
- You spawn the flask from the debug Items List, check its contents, and drink from it.
:::

:::facts
- **Mod id** `RecipeDemoFluid`
- **Fluid** `RecipeDemoTea`, shown as Demo Tea
- **Item** `RecipeDemoFluid.Flask`, shown as Demo Tea Flask, capacity 1 liter
- **Files** 5 (`mod.info`, `poster.png`, one script, `ItemName.json`, `Fluids.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A new drink and a bottle that starts full of it, which a player can carry, check and drink.**

A fluid has two halves. The `fluid` block says what the liquid is: its name, its color, which category it belongs to and what a drink of it does to the player. The `FluidContainer` component on an item says how much of a liquid the item can hold, and it can say what the item holds when it is made.

In the game you add a **Demo Tea Flask** from the Items List, and it holds one full liter of **Demo Tea**. You right-click it and choose **Drink**. The mod needs no Lua and no art: the flask borrows the icon and the model of the vanilla crafted glass bottle.

## The files

**The mod files, with the script and the translation files in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `42/` folder and the same `poster.png`. This recipe leaves out the skeleton's `Boot.lua`.

```
Zomboid/mods/RecipeDemoFluid/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoFluid_fluids.txt
      lua/
        shared/
          Translate/
            EN/
              ItemName.json
              Fluids.json
```

The game parses every `.txt` file under a mod's `media/scripts/` folder, however deep. :cite[(`zombie/scripting/ScriptManager.java:1398-1402`, `zombie/scripting/ScriptManager.java:1606-1650`)] The translation of a fluid's name lives in `Fluids.json`, which the translator reads into its own table. :cite[(`zombie/core/Translator.java:167`)]

## Step by step

**Write the five files in this order.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Fluid
id=RecipeDemoFluid
description=Adds a new drink, Demo Tea, and a flask that starts full of it.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoFluid_fluids.txt`

This is the fluid and the item. The fluid is modeled on the vanilla tea, and the item on the vanilla crafted bottle, with the starting-content block taken from the vanilla gas can. :cite[(`media/scripts/generated/fluids_Beverages.txt:411-430`, `media/scripts/generated/items/normal.txt:7238-7257`, `media/scripts/generated/items/normal.txt:7227-7235`)]

**File `42/media/scripts/RecipeDemoFluid_fluids.txt`**

```
module RecipeDemoFluid
{
    fluid RecipeDemoTea
    {
        ColorReference = SandyBrown,
        DisplayName = Fluid_Name_RecipeDemoTea,
        Categories
        {
            Beverage,
        }
        Properties
        {
            fatigueChange = -5.0,
            HungerChange = -10.0,
            StressChange = -20.0,
            ThirstChange = -30.0,
            UnhappyChange = -50.0,
            Calories = 10.0,
            Carbohydrates = 0.0,
            Lipids = 0.0,
            Proteins = 0.0,
        }
    }

    item Flask
    {
        DisplayCategory = WaterContainer,
        ItemType = base:normal,
        Weight = 0.1,
        Icon = GlassBottle,
        IconFluidMask = GlassBottle_Mask,
        WorldStaticModel = BottleCrafted_Ground,
        component FluidContainer
        {
            ContainerName = Flask,
            Capacity = 1.0,
            CustomDrinkSound = DrinkingFromBottleGlass,
            Fluids
            {
                fluid = RecipeDemoTea:1.0,
            }
        }
    }
}
```

The fluid is read first, then the item. Every line in the fluid block is explained in the first table, and every line of the container in the second.

| Fluid line | What it does | Code |
|------------|--------------|------|
| `fluid RecipeDemoTea` | The id. A name that matches a vanilla fluid, in any letter case, is bound to that fluid and replaces its definition. A name that matches none becomes a modded fluid known by that name. | `zombie/scripting/objects/FluidDefinitionScript.java:223-228` |
| `ColorReference = SandyBrown` | The color, by the name of a color the game defines. The vanilla tea uses this one. | `zombie/scripting/objects/FluidDefinitionScript.java:236-237`, `zombie/core/Colors.java:171` |
| `DisplayName = Fluid_Name_RecipeDemoTea` | A translation key for the name. The game looks it up in `Fluids.json` and shows the text as written when no key matches. | `zombie/scripting/objects/FluidDefinitionScript.java:234-235`, `zombie/core/Translator.java:879-882` |
| `Categories { Beverage }` | The fluid's categories, one name per line, each read as a category name, so an unknown name throws while the script loads. | `zombie/scripting/objects/FluidDefinitionScript.java:282-287`, `zombie/entity/components/fluids/FluidCategory.java:16-28` |
| `Properties { ... }` | What one liter does to the drinker. The keys are a fixed list, and a key outside it is logged as an error, and in debug mode it stops the load. | `zombie/scripting/objects/FluidDefinitionScript.java:313-351` |

A key that the fluid block does not know is also an error: it is logged, and in debug mode it throws. :cite[(`zombie/scripting/objects/FluidDefinitionScript.java:251-256`)] There is no key for boredom: the keys for mood are `stressChange` and `unhappyChange`. :cite[(`zombie/scripting/objects/FluidDefinitionScript.java:313-351`)]

| Item line | What it does | Code |
|-----------|--------------|------|
| `component FluidContainer { ... }` | Makes the item a container. The block is written directly inside the item block, with the component's name after the word `component`. | `media/scripts/generated/items/normal.txt:7251-7256` |
| `Capacity = 1.0` | Liters. The default is 1.0, and a smaller value than 0.05 is raised to 0.05. | `zombie/scripting/entity/components/fluids/FluidContainerScript.java:34`, `zombie/scripting/entity/components/fluids/FluidContainerScript.java:75` |
| `ContainerName = Flask` | A name for the container. A name with a space in it is changed to one without. | `zombie/scripting/entity/components/fluids/FluidContainerScript.java:150-155` |
| `CustomDrinkSound` | The sound played when the player drinks from it. | `zombie/scripting/entity/components/fluids/FluidContainerScript.java:179-180` |
| `Fluids { fluid = RecipeDemoTea:1.0 }` | The starting content: what the container holds when the item is made. The number after the colon is this fluid's share, and shares are scaled so that they add up to 1. With no `InitialPercent` the container starts full. | `zombie/scripting/entity/components/fluids/FluidContainerScript.java:188-189`, `zombie/scripting/entity/components/fluids/FluidContainerScript.java:212-228`, `zombie/scripting/entity/components/fluids/FluidContainerScript.java:294-299`, `zombie/entity/components/fluids/FluidContainer.java:106-118` |
| `IconFluidMask = GlassBottle_Mask` | The mask that the icon uses to draw the fluid inside it. The value is the vanilla one. | `media/scripts/generated/items/normal.txt:7244` |

The `Fluids` block is not a list of the fluids that the container may hold. That job belongs to a `whitelist` block of its own, which this recipe does not use. :cite[(`zombie/scripting/entity/components/fluids/FluidContainerScript.java:188-203`)] A container with no `Fluids` block starts empty. :cite[(`zombie/entity/components/fluids/FluidContainer.java:106-107`)]

The item is a plain `base:normal` item, as in the [new item recipe](/pz/build-42/modding/cookbook/new-item), and [the item block page](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42) lists its other fields. Do not use the Build 41 key `Type`: Build 42 reads `ItemType`. :cite[(`zombie/scripting/objects/Item.java:1982-1983`)]

### Step 3. `42/media/lua/shared/Translate/EN/Fluids.json`

This file gives the fluid its name. The key is the same text as `DisplayName` in the script, and the vanilla file names fluids with the prefix `Fluid_Name_`. :cite[(`media/lua/shared/Translate/EN/Fluids.json:184`)]

**File `42/media/lua/shared/Translate/EN/Fluids.json`**

```
{
    "Fluid_Name_RecipeDemoTea": "Demo Tea"
}
```

### Step 4. `42/media/lua/shared/Translate/EN/ItemName.json`

This file names the flask, in the same way as in the [new item recipe](/pz/build-42/modding/cookbook/new-item). The key is the full type. :cite[(`zombie/core/Translator.java:608-626`)]

**File `42/media/lua/shared/Translate/EN/ItemName.json`**

```
{
    "RecipeDemoFluid.Flask": "Demo Tea Flask"
}
```

## Turn it on and see it work

**Copy the folder, start the game in debug mode, spawn the flask and drink from it.**

1. Put the `RecipeDemoFluid` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoFluid/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Fluid**, choose **ACCEPT**, and start a new game.
3. Open the debug **Items List**, as the [new item recipe](/pz/build-42/modding/cookbook/new-item) shows. Type `Demo` in the Name filter and add one **Demo Tea Flask**. :cite[(`media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:87`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:156-169`)]
4. Open your inventory and look at the flask: it has the glass bottle icon, and its fluid shows as **Demo Tea**.
5. Right-click the flask. A container that is not empty and whose main fluid is in the `Beverage` category gets a **Drink** option; bleach also gets it, and a water-source item is handled by the branch before. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:437-444`, `media/lua/shared/Translate/EN/ContextMenu.json:12`)]

You should see the flask start full, and the amount in it go down as you drink. The effects of the drink come from the `Properties` block: the getters for `fatigueChange`, `hungerChange`, `stressChange` and `thirstChange` divide the written number by 100, and the getter for `unhappyChange` does not. :cite[(`zombie/scripting/objects/FluidDefinitionScript.java:143-161`)] These steps are checked against the code only; the flask has not been run in a game.

On a dedicated server, put `Mods=RecipeDemoFluid` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. Players need the mod too. These server steps have not been run in a game.

## If it does not work

**A fluid fails in a few predictable ways, and the log names most of them.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| `Unknown key 'Boredomchange' val(-5) in fluid properties definition: RecipeDemoFluid.RecipeDemoTea` (in debug mode `FluidDefinition error.` and the load stops) | A key in `Properties` is not one of the fixed list. There is no boredom key. | `zombie/scripting/objects/FluidDefinitionScript.java:346-351` |
| An exception naming `Beverag` or another category word while the scripts load | A name in `Categories` is not a category. Copy the name from a vanilla fluid. | `zombie/scripting/objects/FluidDefinitionScript.java:282-287` |
| The flask shows `Fluid_Name_RecipeDemoTea` as the fluid's name | `Fluids.json` is missing, in the wrong folder, or has a different key. | `zombie/core/Translator.java:879-882` |
| The flask is named `RecipeDemoFluid.Flask` | `ItemName.json` is missing or has a different key. | `zombie/scripting/objects/Item.java:3067` |
| The flask starts empty | The `Fluids` block is missing, or the name in it does not match the fluid exactly. | `zombie/entity/components/fluids/FluidContainer.java:106-118` |
| There is no Drink option on the flask | The flask is empty, or its main fluid is not in the `Beverage` category (bleach is the one other fluid with the option). A water-source item takes an earlier branch. | `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:437-444` |
| Your fluid behaves like a vanilla one | Its name matches a vanilla fluid, in any letter case, so it replaced the vanilla definition. Rename it. | `zombie/scripting/objects/FluidDefinitionScript.java:223-228`, `zombie/entity/components/fluids/Fluid.java:168-177` |

A `Poison` block, which this recipe leaves out, is not enough to poison a drinker: the dose the drinker takes comes from the fluid's `Properties`, which are built only when the script has a `Properties` block, and the poison level is passed into them there. :cite[(`zombie/entity/components/fluids/Fluid.java:271-280`, `zombie/characters/IsoGameCharacter.java:5911`)] A container drain does record the poison level of a fluid that has a `Poison` block, whether or not it has `Properties`, but the dose the character reads at that line is the one from the properties. :cite[(`zombie/entity/components/fluids/FluidContainer.java:991-995`, `zombie/entity/components/fluids/FluidConsume.java:73-76`)] I did not trace any other use of the recorded level.

The poison level is one of `None`, `Mild`, `Medium`, `Severe`, `Extreme` and `Deadly`, and only `maxEffect` is used by the game. :cite[(`zombie/entity/components/fluids/PoisonEffect.java:16-21`, `zombie/entity/components/fluids/PoisonInfo.java:35-37`)] The vanilla petrol has a `Poison` block and no `Properties` block. :cite[(`media/scripts/generated/fluids.txt:55-79`)] The page on [defining a fluid](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties) has the details.

Script files are parsed when the game loads, so restart the game after every change to the `.txt` file. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors.

## Going further

**Learn what the engine does with a fluid, and what a mod fluid cannot do.**

- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here) has a second example that fills a flask from Lua.
- [Defining a fluid](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties) covers names, poison and the property keys.
- [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie) is the page to read before you write fluid Lua.
- [What a mod fluid can plug into](/pz/build-42/modding/fluids/what-a-mod-fluid-can-plug-into) says which vanilla machines accept a new fluid.

:::callout[How we know]{kind=proof}
Every line of the fluid and the item is copied from a vanilla block, and the loader behavior comes from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker. It has not been run in a game: how the flask looks, what its fluid is called in the inventory and the effect of a drink are what you check yourself. The Drink option is read from the inventory menu code and has not been run.
:::
