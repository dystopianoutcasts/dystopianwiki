---
id: build-42-evolved-recipe
slug: evolved-recipe
title: Evolved or cooking recipe
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
  Build a mod with an evolved recipe: right-click a Demo Crust, add up to three Demo Toppings, and it becomes a Demo Snack. Three food items, one recipe block and two translation files.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-food
  - new-craftrecipe
  - items-the-item-block-in-b42
  - testing-loop-and-common-load-errors
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoEvolved`: three food items (a base, a result and an ingredient), one `evolvedrecipe` block, two translation files, and the usual `mod.info` and `poster.png`.
- The recipe lives in a block of its own, but the ingredient joins it from the other side: the ingredient item carries the line `EvolvedRecipe = RecipeDemoSnack:5`.
- You spawn a Demo Crust and some Demo Toppings from the debug Items List, right-click the crust and choose to create a Demo Snack from a topping.
- `ContextMenu.json` holds the text of that menu option. Without its entry the menu shows the raw key.
- `Cookable = false` does not stop the result from being cookable: the loader reads the key, not the value.
:::

:::facts
- **Mod id** `RecipeDemoEvolved`
- **Recipe** `RecipeDemoSnack`: base `RecipeDemoEvolved.Crust`, result `RecipeDemoEvolved.Snack`
- **Ingredient** `RecipeDemoEvolved.Topping`, up to 3 per snack
- **Files** 6 (`mod.info`, `poster.png`, two scripts, `ItemName.json`, `ContextMenu.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A food that grows as you add ingredients to it, the way the vanilla sandwich does.**

An evolved recipe is not a crafting-window recipe. The player right-clicks the base food in the inventory, and the game lists the ingredients it can add. The first ingredient swaps the base food for the result item, and later ingredients are added to the result up to a maximum.

In the game you right-click a **Demo Crust**, choose **Create Demo Snack**, and pick **From Demo Topping**. You then hold a **Demo Snack** with the topping in it. You can add two more toppings before the menu stops offering them.

## The files

**The mod files, with the scripts and translation files in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `42/` folder and the same `poster.png`. A recipe of this kind needs no Lua.

```
Zomboid/mods/RecipeDemoEvolved/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoEvolved_items.txt
        RecipeDemoEvolved_recipes.txt
      lua/
        shared/
          Translate/
            EN/
              ItemName.json
              ContextMenu.json
```

The game parses every `.txt` file under a mod's `media/scripts/` folder, however deep. :cite[(`zombie/scripting/ScriptManager.java:1398-1402`, `zombie/scripting/ScriptManager.java:1606-1650`)] The vanilla evolved recipes are in one file, `evolvedrecipes.txt`, and the loader reads your block from whichever script file holds it. :cite[(`media/scripts/generated/evolvedrecipes.txt:175-185`)]

## Step by step

**Write the six files in this order.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Evolved
id=RecipeDemoEvolved
description=Adds an evolved recipe: a Demo Crust plus Demo Toppings makes a Demo Snack.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoEvolved_items.txt`

These are the three foods. `Crust` is modeled on the vanilla bread slices, `Snack` on the vanilla sandwich, and `Topping` on the vanilla processed cheese, each with the cooking and tag lines removed so that the demo stays small. They use the vanilla icons and models, so the mod needs no art. :cite[(`media/scripts/generated/items/food.txt:2123-2145`, `media/scripts/generated/items/food.txt:6360-6379`, `media/scripts/generated/items/food.txt:4576-4594`)]

**File `42/media/scripts/RecipeDemoEvolved_items.txt`**

```
module RecipeDemoEvolved
{
    item Crust
    {
        DisplayCategory = Food,
        ItemType = base:food,
        Weight = 0.1,
        Icon = BreadSlices,
        FoodType = Bread,
        DaysFresh = 3,
        DaysTotallyRotten = 6,
        HungerChange = -10.0,
        Calories = 177.0,
        Carbohydrates = 33.0,
        Lipids = 2.22,
        Proteins = 5.9,
        StaticModel = BreadSlices,
        WorldStaticModel = BreadSlices,
    }

    item Snack
    {
        DisplayCategory = Food,
        ItemType = base:food,
        Weight = 0.2,
        Icon = Sandwich,
        DaysFresh = 3,
        DaysTotallyRotten = 6,
        HungerChange = -10.0,
        Calories = 360.0,
        Carbohydrates = 42.0,
        Lipids = 8.5,
        Proteins = 5.8,
        StaticModel = Sandwich,
        WorldStaticModel = CheeseSandwich,
    }

    item Topping
    {
        DisplayCategory = Food,
        ItemType = base:food,
        Weight = 0.1,
        Icon = Processedcheese,
        EvolvedRecipe = RecipeDemoSnack:5,
        FoodType = Cheese,
        DaysFresh = 6,
        DaysTotallyRotten = 10,
        HungerChange = -5.0,
        Calories = 70.0,
        Carbohydrates = 0.0,
        Lipids = 6.0,
        Proteins = 4.0,
        StaticModel = ProcessedCheese,
        WorldStaticModel = ProcessedCheese,
    }
}
```

The food lines are explained on the [new food recipe](/pz/build-42/modding/cookbook/new-food). Only one line here is new: `EvolvedRecipe = RecipeDemoSnack:5` on the topping.

| Line | What it does | Code |
|------|--------------|------|
| `EvolvedRecipe = RecipeDemoSnack:5` | Opts this item in as an ingredient. The text before the colon names a recipe, and the whole value is a list separated by `;`, so one item can join several recipes. The number after the colon is read as a whole number. For a food ingredient, one hundredth of it is the amount of hunger taken from the ingredient when it is added. | `zombie/scripting/objects/Item.java:2817-2863`, `zombie/scripting/objects/EvolvedRecipe.java:309` |
| (the name at load) | When all scripts are loaded, each name in the list is looked up as a recipe in the `Base` module and as the template of every recipe. A name that matches neither throws while the scripts finish loading, and that exception ends the whole pass. | `zombie/scripting/objects/Item.java:3043-3063`, `zombie/scripting/ScriptBucketCollection.java:79-96` |

The vanilla topping line looks the same, a list of recipe names with a number each. :cite[(`media/scripts/generated/items/food.txt:4582`)] The name is looked up in `Base` only when it has no module, so a recipe in your own module is found through its template, and the template of a recipe is its own name unless the block says otherwise. :cite[(`zombie/scripting/objects/EvolvedRecipe.java:104-114`)]

### Step 3. `42/media/scripts/RecipeDemoEvolved_recipes.txt`

This is the recipe block. It is modeled on the vanilla sandwich recipe. :cite[(`media/scripts/generated/evolvedrecipes.txt:175-185`)]

**File `42/media/scripts/RecipeDemoEvolved_recipes.txt`**

```
module RecipeDemoEvolved
{
    evolvedrecipe RecipeDemoSnack
    {
        BaseItem = RecipeDemoEvolved.Crust,
        MaxItems = 3,
        ResultItem = RecipeDemoEvolved.Snack,
        Name = Make Demo Snack,
        AddIngredientIfCooked = true,
        Template = RecipeDemoSnack,
    }
}
```

The loader cuts the block at every comma and reads each piece as `key = value`, so every line ends in a comma, and a comma inside a value cuts it short. :cite[(`zombie/scripting/objects/EvolvedRecipe.java:67-85`)]

| Line | What it does | Code |
|------|--------------|------|
| `BaseItem = RecipeDemoEvolved.Crust` | The food that the player right-clicks. The game compares it with the item's full type, so the module is part of the value. | `zombie/scripting/objects/EvolvedRecipe.java:83-84`, `zombie/inventory/RecipeManager.java:511-513` |
| `ResultItem = RecipeDemoEvolved.Snack` | The item that replaces the base item when the first ingredient goes in. The base item is removed from the inventory and a new result item is created in its place. | `zombie/scripting/objects/EvolvedRecipe.java:88-89`, `zombie/scripting/objects/EvolvedRecipe.java:238-241`, `zombie/scripting/objects/EvolvedRecipe.java:292-293` |
| `MaxItems = 3` | How many ingredients the dish can hold. The menu stops offering an ordinary ingredient when the item already holds that many; spices are not held to the limit. | `zombie/scripting/objects/EvolvedRecipe.java:92-93`, `zombie/scripting/objects/EvolvedRecipe.java:188-201` |
| `Name = Make Demo Snack` | The recipe's display name, looked up like a crafting recipe's name and shown as written when no `Recipes.json` entry has that key. The menu does not use it: the menu text comes from `ContextMenu.json`. | `zombie/scripting/objects/EvolvedRecipe.java:85-87`, `zombie/core/Translator.java:699-710` |
| `AddIngredientIfCooked = true` | Lets the player add ingredients to a base item that is already cooked. | `zombie/scripting/objects/EvolvedRecipe.java:94-95`, `zombie/inventory/RecipeManager.java:511` |
| `Template = RecipeDemoSnack` | Groups recipes that share ingredients: an ingredient that names the template joins every recipe with that template. Left out, it is the recipe's own name. | `zombie/scripting/objects/EvolvedRecipe.java:104-114`, `zombie/scripting/objects/Item.java:3054-3058` |

Two more keys from the vanilla sandwich are left out on purpose. `Cookable` makes the result cookable, and the loader sets it when the key is present, whatever its value, so `Cookable = false` also makes the result cookable: leave the line out instead. :cite[(`zombie/scripting/objects/EvolvedRecipe.java:90-91`, `zombie/scripting/objects/EvolvedRecipe.java:264`)] `CanAddSpicesEmpty` lets a spice go into an empty dish. :cite[(`zombie/scripting/objects/EvolvedRecipe.java:98-99`, `zombie/scripting/objects/EvolvedRecipe.java:189-193`)]

### Step 4. `42/media/lua/shared/Translate/EN/ItemName.json`

This file names the three items. The key is the full type, as in the [new item recipe](/pz/build-42/modding/cookbook/new-item). :cite[(`zombie/core/Translator.java:608-626`)]

**File `42/media/lua/shared/Translate/EN/ItemName.json`**

```
{
    "RecipeDemoEvolved.Crust": "Demo Crust",
    "RecipeDemoEvolved.Snack": "Demo Snack",
    "RecipeDemoEvolved.Topping": "Demo Topping"
}
```

### Step 5. `42/media/lua/shared/Translate/EN/ContextMenu.json`

This file gives the menu option its text. The key is `ContextMenu_EvolvedRecipe_` followed by the recipe's id, as in the vanilla file. :cite[(`media/lua/shared/Translate/EN/ContextMenu.json:296-297`)]

**File `42/media/lua/shared/Translate/EN/ContextMenu.json`**

```
{
    "ContextMenu_EvolvedRecipe_RecipeDemoSnack": "Demo Snack"
}
```

The inventory menu builds that key from the recipe's untranslated name, which is the id after `evolvedrecipe`. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:4218`, `zombie/scripting/objects/EvolvedRecipe.java:633-635`)] On a base item that is not yet the result, the option reads `Create` followed by that text, and its submenu lists `From` and each ingredient. On the result item, the submenu lists `Add` and each ingredient. :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:4219-4224`, `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:2029-2032`, `media/lua/shared/Translate/EN/ContextMenu.json:262-264`)]

## Turn it on and see it work

**Copy the folder, start the game in debug mode, spawn the foods and build the snack.**

1. Put the `RecipeDemoEvolved` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoEvolved/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Evolved**, choose **ACCEPT**, and start a new game.
3. Open the debug **Items List**, as the [new item recipe](/pz/build-42/modding/cookbook/new-item) shows. Type `Demo` in the Name filter, and add one **Demo Crust** and three **Demo Topping**. :cite[(`media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:87`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:156-169`)]
4. Right-click the **Demo Crust** in your inventory. Choose **Create Demo Snack**, then **From Demo Topping**. The game offers an ingredient only when it is food that is not burnt, not rotten (unless your Cooking level is 7 or more) and not frozen. :cite[(`zombie/scripting/objects/EvolvedRecipe.java:186-218`)]
5. Right-click the new **Demo Snack**. Choose **Demo Snack**, then **Add Demo Topping**. Do it once more, and the menu then stops offering a topping, because `MaxItems` is 3.

You should see the crust replaced by a **Demo Snack** after the first topping, and the same snack stay in your inventory as you add the other two. These steps are checked against the code only; the recipe has not been run in a game.

On a dedicated server, put `Mods=RecipeDemoEvolved` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. Players need the mod too. These server steps have not been run in a game.

## If it does not work

**An evolved recipe fails quietly more often than a crafting recipe, so the menu is the first place to look.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| `Could not find evolved recipe or template: 'RecipeDemoSnak' in item = RecipeDemoEvolved.Topping` in the log, and later scripts may be missing | The name in the item's `EvolvedRecipe` line matches no recipe in `Base` and no template. The exception is thrown while the scripts finish loading, and the loop has no catch for one script, so the whole pass ends there. Fix the spelling first. | `zombie/scripting/objects/Item.java:3058-3063`, `zombie/scripting/ScriptBucket.java:169-175`, `zombie/scripting/ScriptManager.java:1779-1797` |
| The menu option reads `ContextMenu_EvolvedRecipe_RecipeDemoSnack` | `ContextMenu.json` is missing, in the wrong folder, or has a different key. | `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:4218` |
| No evolved option on the crust at all | The crust's full type differs from `BaseItem`, or no usable ingredient is in your inventory (burnt, rotten, frozen or not food), or the crust is cooked and `AddIngredientIfCooked` is missing. | `zombie/inventory/RecipeManager.java:500-522`, `zombie/scripting/objects/EvolvedRecipe.java:186-218` |
| The recipe loads but its name or its `ResultItem` is cut short | A comma inside a value ends it, because the block is split at commas. | `zombie/scripting/objects/EvolvedRecipe.java:67-85` |
| The snack is cookable though `Cookable = false` | The key is read without its value. Delete the line. | `zombie/scripting/objects/EvolvedRecipe.java:90-91` |
| Items are named `RecipeDemoEvolved.Crust` | `ItemName.json` is missing or has a different key. | `zombie/scripting/objects/Item.java:3067` |

Script files are parsed when the game loads, so restart the game after every change to a `.txt` file. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors.

## Going further

**Change the dish, or learn what the other lines do.**

- [New food](/pz/build-42/modding/cookbook/new-food) explains the food lines in the three items.
- [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) is the crafting-window kind of recipe.
- [The item block in Build 42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42) lists the fields of the item block.
- [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy) explains modules, blocks and commas.

:::callout[How we know]{kind=proof}
Every line of the three items and the recipe is modeled on a vanilla block, and the loader and menu behavior comes from the 42.22 engine and Lua code cited above. The mod in this page was built file for file in a test folder and passed the script checker. It has not been run in a game: the menu wording and the number shown next to each topping are what you check yourself. The effect of the number after the colon is read from the code for food ingredients only; the engine code for non-food ingredients was not followed.
:::
