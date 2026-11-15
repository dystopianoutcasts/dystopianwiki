---
id: build-42-new-craftrecipe
slug: new-craftrecipe
title: New craftRecipe
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
  Build a mod that adds one crafting recipe: two planks, a nail and a hammer make a Demo Bundle, and the recipe shows up in the in-hand crafting window.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-item
  - new-workstation
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - craftrecipe-outputs-and-itemmappers
  - changing-recipes-and-crafting
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoCraft`: a recipe script, an item script for the result, two translation files and the two files every mod has, `mod.info` and `poster.png`.
- The recipe is a `craftRecipe` block. Its inputs are a hammer that is kept, plus two planks and a nail that are used up. Its output is your own item, the Demo Bundle.
- An input that names one exact item must sit in square brackets, `[Base.Plank]`. The output must not, `RecipeDemoCraft.Bundle`.
- Without `Recipes.json` the recipe is listed under its id, `MakeDemoBundle`, instead of a name.
- You spawn a hammer, planks and nails from the debug Items List, open the crafting window and craft the bundle.
:::

:::facts
- **Mod id** `RecipeDemoCraft`
- **Recipe** `RecipeDemoCraft.MakeDemoBundle`, shown as Make Demo Bundle
- **Result** `RecipeDemoCraft.Bundle`, shown as Demo Bundle
- **Files** 6 (`mod.info`, `poster.png`, two scripts, `ItemName.json`, `Recipes.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A recipe that appears in the player's crafting window and turns three kinds of ingredient into one new item.**

You learn the three parts of any recipe: the `craftRecipe` block that says what goes in and what comes out, the translation that gives it a name, and the output item. Later recipes ([an evolved recipe](/pz/build-42/modding/cookbook/evolved-recipe), [a workstation](/pz/build-42/modding/cookbook/new-workstation)) change the `Tags` line or the kind of recipe and keep the same parts.

In the game you open the crafting window, find **Make Demo Bundle** in the list, and press the craft button. You end with a **Demo Bundle**, which uses the cork icon of the [new item recipe](/pz/build-42/modding/cookbook/new-item), and you keep the hammer.

## The files

**The mod files, with the scripts and translation files in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `42/` folder and the same `poster.png`. This recipe leaves out the skeleton's `Boot.lua`, because a recipe needs no Lua.

```
Zomboid/mods/RecipeDemoCraft/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoCraft_items.txt
        RecipeDemoCraft_recipes.txt
      lua/
        shared/
          Translate/
            EN/
              ItemName.json
              Recipes.json
```

The game parses every `.txt` file under a mod's `media/scripts/` folder as scripts, however deep. :cite[(`zombie/scripting/ScriptManager.java:1398-1402`, `zombie/scripting/ScriptManager.java:1606-1650`)] The recipe and the item sit in two files only to keep each one short; they could share a file.

## Step by step

**Write the six files in this order.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Craft
id=RecipeDemoCraft
description=Adds one crafting recipe that turns planks and nails into a Demo Bundle.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoCraft_items.txt`

This is the item the recipe makes. It is the same block as the Demo Token of the [new item recipe](/pz/build-42/modding/cookbook/new-item), modeled on the vanilla cork. :cite[(`media/scripts/generated/items/normal.txt:8551-8558`)]

**File `42/media/scripts/RecipeDemoCraft_items.txt`**

```
module RecipeDemoCraft
{
    item Bundle
    {
        DisplayCategory = Junk,
        ItemType = base:normal,
        Weight = 0.1,
        Icon = Cork,
        WorldStaticModel = Cork,
    }
}
```

The item is known by its full type, `RecipeDemoCraft.Bundle`, and that full type is what the recipe's output names.

### Step 3. `42/media/scripts/RecipeDemoCraft_recipes.txt`

This is the recipe. It is modeled on the vanilla recipe that makes a wooden toolbox, which also keeps a hammer and uses up planks and a nail, and on the vanilla lighter recipe, which pairs `timedAction = Making` with `Tags = InHandCraft`. :cite[(`media/scripts/generated/recipes/recipes_carpentry.txt:296-317`, `media/scripts/generated/recipes/recipes.txt:53-67`)]

**File `42/media/scripts/RecipeDemoCraft_recipes.txt`**

```
module RecipeDemoCraft
{
    craftRecipe MakeDemoBundle
    {
        timedAction = Making,
        time = 100,
        Tags = InHandCraft,
        category = Carpentry,
        xpAward = Woodwork:5,
        inputs
        {
            item 1 tags[base:hammer] mode:keep flags[MayDegradeVeryLight],
            item 2 [Base.Plank],
            item 1 [Base.Nails],
        }
        outputs
        {
            item 1 RecipeDemoCraft.Bundle,
        }
    }
}
```

The recipe's name, `MakeDemoBundle`, is the id you write after `craftRecipe`. The loader reads each line at the top of the block by its key, and a key it does not know is logged as an error. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:366-376`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:506-509`)]

| Line | What it does | Code |
|------|--------------|------|
| `timedAction = Making` | Names the timed action script that plays the animation while the player crafts. The loader looks the name up after the block is read, and a name that no script has throws an exception that ends the whole script pass, not only this recipe. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:487-488`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:770-775`, `zombie/scripting/ScriptManager.java:1779-1797`, `media/scripts/generated/timedactions.txt:148-152` |
| `time = 100` | Sets the crafting time as a whole number. The info panel shows the recipe time divided by 10, in seconds. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:380-381`, `media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipeInfoBox.lua:49-50` |
| `Tags = InHandCraft` | Lists the tags that say where the recipe can be made, separated by `;`. The in-hand crafting window asks for the tags `InHandCraft` and `AnySurfaceCraft`. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`, `media/lua/client/ISUI/Crafting/ISHandcraftWindow.lua:53` |
| `category = Carpentry` | Sets the category. A recipe with no category falls back to `Miscellaneous`. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:489-490`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:224` |
| `xpAward = Woodwork:5` | Gives 5 experience points in a skill when the craft ends, as `Skill:amount` pairs separated by `;`. An unknown skill name is skipped with a warning. The skill `Woodwork` is the one the game shows as Carpentry. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:468-481`, `zombie/characters/skills/PerkFactory.java:117`, `media/lua/shared/Translate/EN/IG_UI.json:200` |

The inputs follow one grammar, and the output follows another. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:626-634`, `zombie/scripting/entity/components/crafting/OutputScript.java:317-327`)]

| Line | What it does | Code |
|------|--------------|------|
| `item 1 tags[base:hammer] mode:keep flags[MayDegradeVeryLight]` | Accepts any item that carries the tag `base:hammer`. `mode:keep` keeps the item after the craft, and the flag makes the craft run a condition-damage check on the kept item, the lightest of the four degrade flags. | `zombie/scripting/entity/components/crafting/InputScript.java:673-679`, `zombie/scripting/entity/components/crafting/InputScript.java:729-740`, `zombie/scripting/entity/components/crafting/InputScript.java:749-756`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:1270-1301`, `media/scripts/generated/items/weapon.txt:2985` |
| `item 2 [Base.Plank]` | Takes two of one exact item. The full type goes in square brackets, and a line with no `mode:` uses the item up. | `zombie/scripting/entity/components/crafting/InputScript.java:626-634`, `zombie/scripting/entity/components/crafting/InputScript.java:75` |
| `item 1 RecipeDemoCraft.Bundle` (outputs) | Makes one of the item named by its full type, with no brackets. A line that starts with `mapper:` would read an item mapper instead. | `zombie/scripting/entity/components/crafting/OutputScript.java:317-327` |

A word in an input line that is not in brackets and not one of the known words (`tags`, `categories`, `flags`, `mappers`, `mode:` and a few more) throws the error `unknown recipe param`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:764-770`)] The loader then removes the recipe, and in debug mode the whole script load fails. :cite[(`zombie/scripting/ScriptType.java:112-119`, `zombie/scripting/ScriptBucket.java:199-205`, `zombie/scripting/ScriptManager.java:1710-1712`)] Check every input line for its brackets before you start the game.

### Step 4. `42/media/lua/shared/Translate/EN/ItemName.json`

This file names the output item, in the same way as in the [new item recipe](/pz/build-42/modding/cookbook/new-item). The key is the full type. :cite[(`zombie/core/Translator.java:608-626`)]

**File `42/media/lua/shared/Translate/EN/ItemName.json`**

```
{
    "RecipeDemoCraft.Bundle": "Demo Bundle"
}
```

### Step 5. `42/media/lua/shared/Translate/EN/Recipes.json`

This file names the recipe. Its key is the bare recipe id, with no module in front, as in the vanilla file. :cite[(`media/lua/shared/Translate/EN/Recipes.json:1074`)]

**File `42/media/lua/shared/Translate/EN/Recipes.json`**

```
{
    "MakeDemoBundle": "Make Demo Bundle"
}
```

The loader asks the translator for the recipe's name when it reads the block, and when the file has no entry it uses the id itself. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:369`, `zombie/core/Translator.java:699-710`)] The crafting list shows that name. :cite[(`media/lua/client/Entity/ISUI/CraftRecipe/ISRecipeScrollingListBox.lua:351`)]

## Turn it on and see it work

**Copy the folder, start the game in debug mode, spawn the ingredients and craft.**

1. Put the `RecipeDemoCraft` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoCraft/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Craft**, choose **ACCEPT**, and start a new game.
3. Open the debug **Items List**, as the [new item recipe](/pz/build-42/modding/cookbook/new-item) shows. Add one hammer (the list calls it **Claw Hammer**), two **Plank** and one **Nails**. The list filters by the text you type above its Name column. :cite[(`media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:87`, `media/lua/client/ISUI/AdminPanel/ISItemsListTable.lua:156-169`)]
4. Open the crafting window with the key bound to **Toggle Crafting UI**; you can see or change it in Options, on the **KEY BINDINGS** screen. :cite[(`media/lua/shared/Translate/EN/UI.json:146`, `media/lua/shared/Translate/EN/UI.json:728`, `media/lua/shared/Translate/EN/ItemName.json:1842`)] Find **Make Demo Bundle**, and read the **Required Items** list in its panel. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:5465`)]
5. Press the craft button. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:5458`)]

You should see the craft finish and a **Demo Bundle** with the cork icon appear in your inventory. The planks and the nail are used up, the hammer is still there, and you have a little Carpentry experience. These steps are checked against the code only; the craft has not been run in a game.

On a dedicated server, put `Mods=RecipeDemoCraft` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. Players need the mod too. These server steps have not been run in a game.

## If it does not work

**A recipe fails in a few predictable ways, and most of them leave a line in the log.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| `unknown recipe param: Base.Plank` in the log, and the recipe is missing (in debug mode `Script load errors.` and the load stops) | An input item has no square brackets. Write `[Base.Plank]`. | `zombie/scripting/entity/components/crafting/InputScript.java:764-770`, `zombie/scripting/ScriptBucket.java:199-205`, `zombie/scripting/ScriptManager.java:1710-1712` |
| `Unknown key 'Timeaction' val(Making) in craft recipe: MakeDemoBundle` | A key at the top of the block is misspelled. In debug mode the load then fails with `CraftRecipe error in MakeDemoBundle`. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:506-509` |
| `TimedActionScript 'Makeing' could not be found in recipe MakeDemoBundle`, and later scripts missing | The `timedAction` value is not the name of a `timedAction` block. The exception ends the whole script pass, so other scripts after this one may not finish loading either. Copy a name from `timedactions.txt` and fix it before anything else. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:770-775`, `zombie/scripting/ScriptBucket.java:169-175`, `zombie/scripting/ScriptManager.java:1779-1797` |
| A `flags` word the loader rejects, such as `MayDegradeLite` | Each flag is read by name, and an unknown name throws. Copy flags from a vanilla recipe. | `zombie/scripting/entity/components/crafting/InputScript.java:749-756` |
| The recipe is listed as `MakeDemoBundle` | `Recipes.json` is missing, in the wrong folder, or has a different key. | `zombie/core/Translator.java:699-710` |
| The result is named `RecipeDemoCraft.Bundle` | `ItemName.json` is missing or has a different key. | `zombie/scripting/objects/Item.java:3067` |
| The recipe is not in the crafting window | `Tags` has neither `InHandCraft` nor `AnySurfaceCraft`, the two tags the in-hand window asks for. | `media/lua/client/ISUI/Crafting/ISHandcraftWindow.lua:53` |

Run the recipe checker before you start the game. It reads the scripts the way the vanilla recipes are written, and when you give it the installed game's folder it also checks that every item and tag exists. The command is `python -I check-craft-recipes.py <your mod folder> --game <your game folder>`, and the script ships with the `pz-craft-recipes` skill of the Dystopian Outcasts repository. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors.

## Going further

**Change the inputs, or learn what the other keys and lines do.**

- [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block) walks through a vanilla recipe line by line.
- [craftRecipe inputs in depth](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth) covers tags, categories, flags and fluids on input lines.
- [craftRecipe outputs and itemMappers](/pz/build-42/modding/crafting/craftrecipe-outputs-and-itemmappers) covers the `mapper:` output and empty outputs.
- [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting) changes a vanilla recipe instead of adding one.
- [New workstation](/pz/build-42/modding/cookbook/new-workstation) puts a recipe behind a bench.

:::callout[How we know]{kind=proof}
Every key and line of the recipe is copied from a vanilla block, and the loader behavior comes from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the recipe checker. It has not been run in a game: what the crafting window shows, how the craft feels and the experience you gain are what you check yourself. Whether a category that vanilla has no translation for shows its raw name in the crafting window is not verified; the page uses `Carpentry`, which vanilla translates.
:::
