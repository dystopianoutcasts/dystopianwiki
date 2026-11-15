---
id: build-42-new-food
slug: new-food
title: New food
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
  Build a mod that adds a food, the Demo Spud, with hunger, nutrition, freshness and cooking, and spawn it with the debug Items List.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-item
  - items-the-item-block-in-b42
  - item-block-merge-behaviour
  - evolved-recipe
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoFood`: one food script, one translation file and the two files every mod has, `mod.info` and `poster.png`.
- The food is a copy of the vanilla potato's block under a new name: it lowers hunger and thirst, has calories, spoils after a few in-game days and can be cooked.
- `HungerChange` and `ThirstChange` are written as whole-bar numbers, and the engine divides them by 100 when it builds the food.
- You spawn it from the debug Items List, eat it from the right-click menu and see your hunger fall.
:::

:::facts
- **Mod id** `RecipeDemoFood`
- **Food** `RecipeDemoFood.Spud`, shown as Demo Spud
- **Freshness** fresh for 2 days, totally rotten at 4 days (in-game days)
- **Cooking** 10 minutes to cook, 30 minutes to burn
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) and [new item](/pz/build-42/modding/cookbook/new-item)
:::

## What you will build

**An edible item with real nutrition, a spoil timer and a cooked state.**

The Demo Spud is a food, so it is built from an item block with `ItemType = base:food` and a set of food lines. You keep everything from [new item](/pz/build-42/modding/cookbook/new-item): the script, the translation and the mod files. Only the block changes.

In the game you eat it and your hunger and thirst go down, it rots if it sits long enough, and it changes its icon when it is cooked or burnt.

## The files

**The mod files, one script and one translation file, laid out as in the project skeleton.**

```
Zomboid/mods/RecipeDemoFood/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoFood_items.txt
      lua/
        shared/
          Translate/
            EN/
              ItemName.json
```

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) for the folders and the poster. The script folder and the translation path work as they do in [new item](/pz/build-42/modding/cookbook/new-item).

## Step by step

**Write the three text files and copy the poster.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton and write `mod.info` with the new id.

**File `42/mod.info`**

```
name=Recipe Demo Food
id=RecipeDemoFood
description=Adds one cookable food, the Demo Spud.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoFood_items.txt`

This is the food. It is modeled on the vanilla potato, whose block is a plain cookable vegetable. :cite[(`media/scripts/generated/items/food.txt:117-143`)] The recipe drops the potato's `EvolvedRecipe` and `Tags` lines, which belong to cooking recipes and to farming, and keeps the rest.

**File `42/media/scripts/RecipeDemoFood_items.txt`**

```
module RecipeDemoFood
{
    item Spud
    {
        DisplayCategory = Food,
        ItemType = base:food,
        Weight = 0.2,
        Icon = Potato,
        FoodType = Vegetables,
        HungerChange = -18.0,
        ThirstChange = -7.0,
        Calories = 70.0,
        Carbohydrates = 15.0,
        Lipids = 0.15,
        Proteins = 3.0,
        DaysFresh = 2,
        DaysTotallyRotten = 4,
        IsCookable = true,
        MinutesToCook = 10,
        MinutesToBurn = 30,
        RemoveUnhappinessWhenCooked = true,
        UnhappyChange = 5,
        CookingSound = FryingFood,
        GoodHot = true,
        StaticModel = Potato_Ground,
        WorldStaticModel = Potato_Ground,
    }
}
```

The item is `RecipeDemoFood.Spud`.

A food line that the loader does not know is kept as mod data and ignored, as it is for any item. :cite[(`zombie/scripting/objects/Item.java:2998-3019`)] The lines below are the food ones.

| Line | What it does | Code |
|------|--------------|------|
| `ItemType = base:food` | Builds the item as a `Food` object, which carries the freshness and cooking state. | `zombie/scripting/objects/Item.java:1535-1536` |
| `HungerChange = -18.0`, `ThirstChange = -7.0` | Set how much eating changes hunger and thirst. The engine divides both numbers by 100 when it builds the food, and vanilla foods use negative numbers. | `zombie/scripting/objects/Item.java:1543-1545`, `zombie/scripting/objects/Item.java:2066-2069` |
| `Calories`, `Carbohydrates`, `Lipids`, `Proteins` | Set the nutrition the food carries. | `zombie/scripting/objects/Item.java:2730-2737`, `zombie/scripting/objects/Item.java:1562-1566` |
| `DaysFresh = 2`, `DaysTotallyRotten = 4` | Set the age, in days, at which the food stops being fresh and at which it is rotten. | `zombie/scripting/objects/Item.java:2080-2089`, `zombie/scripting/objects/Item.java:1547-1548` |
| `IsCookable`, `MinutesToCook`, `MinutesToBurn` | Make the food cookable, and set the cooking time and the time at which it burns. | `zombie/scripting/objects/Item.java:2090-2097`, `zombie/scripting/objects/Item.java:1549-1551` |
| `UnhappyChange`, `RemoveUnhappinessWhenCooked` | Raise unhappiness when eaten, and remove that rise once the food is cooked. | `zombie/scripting/objects/Item.java:2102-2105` |
| `FoodType`, `CookingSound`, `GoodHot` | A category word, the sound played while it cooks, and a flag for food that is better hot. | `zombie/scripting/objects/Item.java:1990`, `zombie/scripting/objects/Item.java:2092`, `zombie/scripting/objects/Item.java:2564` |
| `StaticModel`, `WorldStaticModel` | Name the vanilla potato model, which is found in any module. | `zombie/scripting/objects/Item.java:2866`, `zombie/scripting/ScriptManager.java:1981-2002` |

The age of a food counts in days. Each update adds the hours that passed, multiplied by the food's rot speed and divided by 24. :cite[(`zombie/inventory/types/Food.java:780`)] The food is fresh while its age is below the fresh limit and rotten once its age reaches the rotten limit. :cite[(`zombie/inventory/types/Food.java:1864-1870`)]

The cooked and burnt looks come from icon files named after the icon. When the item is built, the game looks for the icon name plus `Rotten`, `Spoiled`, `Cooked`, `Overdone` and `Burnt`, so the vanilla `Potato` icon brings its own variants along. :cite[(`zombie/scripting/objects/Item.java:2011-2040`)]

### Step 3. `42/media/lua/shared/Translate/EN/ItemName.json`

This gives the food its name, in the same way as [new item](/pz/build-42/modding/cookbook/new-item): the key is the full type. :cite[(`zombie/core/Translator.java:608-626`)]

**File `42/media/lua/shared/Translate/EN/ItemName.json`**

```
{
    "RecipeDemoFood.Spud": "Demo Spud"
}
```

## Turn it on and see it work

**Spawn the food, eat it, then cook it.**

1. Put the `RecipeDemoFood` folder in `Zomboid/mods/`, start the game with `-debug`, check **Recipe Demo Food** on the **MODS** screen, choose **ACCEPT** and start a new game, as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Open the debug menu from the side bar, choose **Items List**, type `Demo Spud` in the **Name** filter and press **Add 1**. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:453-458`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:156-169`, `media/lua/shared/Translate/EN/IG_UI.json:1538`)]
3. Right-click the **Demo Spud** in your inventory and eat it. The time the action takes is worked out from the `HungerChange` value. :cite[(`media/lua/shared/TimedActions/ISEatFoodAction.lua:146`, `media/lua/shared/TimedActions/ISEatFoodAction.lua:210-211`)]
4. Spawn a second one to try cooking. The game adds cooking time while the food sits in a hot container, and it counts that time against `MinutesToCook` and `MinutesToBurn`. :cite[(`zombie/inventory/types/Food.java:394-407`)] Which containers count as hot, such as a stove or an oven, and the menu steps for them are not covered here.

You should see **Demo Spud** with the vanilla potato icon and a hunger drop when you eat it. After two in-game days in your inventory it is no longer fresh, and at four days it should read as rotten.

On a dedicated server, add `Mods=RecipeDemoFood` to the settings file and copy the mod into the server's `mods` folder, as described in the skeleton page. These server steps have not been run in a game.

## If it does not work

**Food fails like any item, plus a few food-only ways.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| The food is named `RecipeDemoFood.Spud` | `ItemName.json` is missing or its key is not the full type. | `zombie/scripting/objects/Item.java:3067` |
| Eating does nothing, or the item acts like a plain item | `ItemType` is not `base:food`, so the item is not built as `Food`. | `zombie/scripting/objects/Item.java:1535-1536` |
| The food never spoils | `DaysFresh` and `DaysTotallyRotten` are left at their default of 1000000000, which counts as never. | `zombie/scripting/objects/Item.java:97-98`, `zombie/inventory/types/Food.java:778-783` |
| `adding unknown item param "Calorie"` in the log | A misspelled food line is kept as mod data on the item and does nothing. | `zombie/scripting/objects/Item.java:2998-3019` |
| The cooked or burnt food shows the plain icon | No texture named like the icon plus `Cooked` or `Burnt` exists for your icon. Use an icon that has those variants, as `Potato` does. | `zombie/scripting/objects/Item.java:2011-2040` |
| Optional, only if you add a `ReplaceOnRotten` line: the log names an item that does not exist | A food that rots into another item needs that item to exist in the same module. The game warns and destroys the food. | `zombie/inventory/types/Food.java:667-677` |

The shared load errors, such as a bad icon or a missing translation, are in the table on [new item](/pz/build-42/modding/cookbook/new-item).

## Going further

**Keep the food, change what it does.**

- [New item](/pz/build-42/modding/cookbook/new-item) shows the same recipe for a plain item.
- [Evolved recipe](/pz/build-42/modding/cookbook/evolved-recipe) puts a food into a sandwich or a soup.
- [The item block in Build 42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42) lists the fields of the item block.
- [How item blocks merge](/pz/build-42/modding/items-and-scripting/item-block-merge-behaviour) explains what happens when two mods write the same item.

:::callout[How we know]{kind=proof}
The block is a copy of the vanilla potato block with a new name, and the parse, age and cooking behavior come from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker. It has not been run in a game: the hunger change, the spoil days and the cooked icon are what you check yourself. The stove or oven steps for cooking are not described because they were not read in the code for this page.
:::
