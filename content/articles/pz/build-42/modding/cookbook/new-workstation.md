---
id: build-42-new-workstation
slug: new-workstation
title: New workstation or craft bench
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
  Build a mod with a placeable Demo Bench, built from planks and nails in the build window, and one recipe that only appears when you open that bench. Three scripts and a translation file.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-craftrecipe
  - the-workstation-entity-system
  - the-new-craftrecipe-block
  - testing-loop-and-common-load-errors
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoWorkstation`: an `entity` script for the bench, a skin script for its name and icon, a recipe script, a translation file and the usual `mod.info` and `poster.png`.
- The bench is made of components: `UiConfig` (its window and name), `CraftBench` (which recipe tag it serves), `SpriteConfig` (the tiles it is drawn with) and `CraftRecipe` (the recipe that builds it).
- The link between bench and recipe is one word. The recipe says `Tags = RecipeDemoBench`, and the bench says `Recipes = RecipeDemoBench`.
- The skin script has to be in the `Base` module, or the game ignores it and the bench gets a generic name.
- You build the bench from the build window, right-click it, and craft at it. It uses vanilla tiles, so the mod needs no art.
:::

:::facts
- **Mod id** `RecipeDemoWorkstation`
- **Bench** entity `RecipeDemoWorkstation.RecipeDemoBench`, shown as Demo Bench
- **Bench tag** `RecipeDemoBench`
- **Files** 6 (`mod.info`, `poster.png`, three scripts, `Recipes.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) and the [craftRecipe recipe](/pz/build-42/modding/cookbook/new-craftrecipe)
:::

## What you will build

**A bench that a player builds, places in the world and opens to craft a recipe that no other place offers.**

A workstation is an `entity`: one block that lists components, each of which gives the object one job. The recipe that the bench serves is an ordinary `craftRecipe`, as in the [craftRecipe recipe](/pz/build-42/modding/cookbook/new-craftrecipe), with a tag of its own in place of `InHandCraft`.

In the game you open the build window, find **Demo Bench** in the **Farming** category, build it from a hammer, two planks and four nails, and place it. You then right-click it, choose **Demo Bench**, and craft **Carve Demo Corks** from a plank. The bench uses the tiles of the vanilla scutching board.

## The files

**The mod files, with the scripts and translation file in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `42/` folder and the same `poster.png`. The bench needs no Lua.

```
Zomboid/mods/RecipeDemoWorkstation/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoWorkstation_bench.txt
        RecipeDemoWorkstation_skin.txt
        RecipeDemoWorkstation_recipes.txt
      lua/
        shared/
          Translate/
            EN/
              Recipes.json
```

The game parses every `.txt` file under a mod's `media/scripts/` folder, however deep. :cite[(`zombie/scripting/ScriptManager.java:1398-1402`, `zombie/scripting/ScriptManager.java:1606-1650`)] The three scripts are separate files because they sit in two different modules, as step 3 explains.

## Step by step

**Write the six files in this order.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Workstation
id=RecipeDemoWorkstation
description=Adds a buildable Demo Bench and one recipe that can only be made at it.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoWorkstation_bench.txt`

This is the bench. It is modeled on the vanilla scutching board, which has the same four components, the same two faces and almost the same recipe. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_scutching_board.txt:3-50`)]

**File `42/media/scripts/RecipeDemoWorkstation_bench.txt`**

```
module RecipeDemoWorkstation
{
    entity RecipeDemoBench
    {
        component UiConfig
        {
            xuiSkin = default,
            entityStyle = ES_RecipeDemoBench,
            uiEnabled = true,
        }
        component CraftBench
        {
            Recipes = RecipeDemoBench,
        }
        component SpriteConfig
        {
            isThumpable = false,
            face S
            {
                layer
                {
                    row = crafted_04_57,
                }
            }
            face E
            {
                layer
                {
                    row = crafted_04_56,
                }
            }
        }
        component CraftRecipe
        {
            timedAction = BuildWoodenStructureMedium,
            time = 50,
            category = Farming,
            inputs
            {
                item 1 tags[base:hammer] mode:keep flags[Prop1;MayDegradeVeryLight],
                item 2 [Base.Plank],
                item 4 [Base.Nails],
            }
        }
    }
}
```

An entity holds only `component` blocks, and each one is named by the exact name of a component type. A block of another kind is an error, and a component name that is not a type is skipped with a warning. :cite[(`zombie/scripting/entity/GameEntityScript.java:181-187`, `zombie/scripting/entity/GameEntityScript.java:205-221`, `zombie/entity/ComponentType.java:68-93`)] The entity is known by its full type, `RecipeDemoWorkstation.RecipeDemoBench`.

| Component and line | What it does | Code |
|--------------------|--------------|------|
| `UiConfig`: `xuiSkin`, `entityStyle`, `uiEnabled` | Names the skin and the entity style that give the bench its window class, its name and its icon, and says whether a window can open. The style `ES_RecipeDemoBench` is defined in step 3. | `zombie/scripting/entity/components/ui/UiConfigScript.java:63-70`, `zombie/scripting/ui/XuiSkin.java:67-80` |
| `CraftBench`: `Recipes = RecipeDemoBench` | Gives the tag query that picks which recipes the bench offers. The recipe in step 4 carries the same tag. A bench with no `Recipes` value throws while the scripts finish loading. | `zombie/scripting/entity/components/crafting/CraftBenchScript.java:55-58`, `zombie/scripting/entity/components/crafting/CraftBenchScript.java:68-69` |
| `SpriteConfig`: `face S`, `face E`, `row` | Gives one block per facing, each with the name of the tile to draw. A tile name used twice is an error, and in debug mode it stops the load. | `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:219-223`, `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:302-306`, `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:339` |
| `SpriteConfig`: `isThumpable = false` | Sets whether zombies can break the object. The script default is true. | `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:271-272`, `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:37` |
| `CraftRecipe` | Makes the bench buildable. It is a craft recipe in the entity's own block, with the same keys and the same input lines as in the [craftRecipe recipe](/pz/build-42/modding/cookbook/new-craftrecipe). The loader adds the tag `EntityRecipe` to it. | `zombie/scripting/entity/components/crafting/CraftRecipeComponentScript.java:61-66` |

The bench's tiles, `crafted_04_57` and `crafted_04_56`, are the ones the vanilla scutching board uses, so the mod needs no art. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_scutching_board.txt:12-31`)] The recipe names `Prop1` on the hammer as the vanilla block does, and `MayDegradeVeryLight` makes the build run a condition-damage check on the kept hammer, the lightest of the four degrade flags. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_scutching_board.txt:44`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:1270-1301`)]

### Step 3. `42/media/scripts/RecipeDemoWorkstation_skin.txt`

This is the entity style that gives the bench its window and its name. It is modeled on the vanilla scutching board's style, and it sits in the `Base` module on purpose: the game ignores a skin in any other module. :cite[(`media/scripts/entities/agricultural/workstations/entity_scutching_board_xuiSkin.txt:1-12`, `zombie/scripting/ui/XuiManager.java:205-213`)]

**File `42/media/scripts/RecipeDemoWorkstation_skin.txt`**

```
module Base
{
    xuiSkin default
    {
        entity ES_RecipeDemoBench
        {
            LuaWindowClass = ISEntityWindow,
            DisplayName = Demo Bench,
            Icon = Build_ScutchingBoard,
        }
    }
}
```

A skin of the name `default` is the one that every vanilla `UiConfig` block I found names (215 blocks, counted by search over the vanilla entity scripts), and a second body with that name is read on the same skin script, so the new style is added to it. :cite[(`zombie/scripting/ScriptBucket.java:108-114`, `zombie/scripting/ui/XuiSkin.java:160-169`)] An entity style is a block with an id, and the id `default` is not allowed for it. :cite[(`zombie/scripting/objects/XuiSkinScript.java:144-153`)]

| Line | What it does | Code |
|------|--------------|------|
| `LuaWindowClass = ISEntityWindow` | Names the Lua window class that opens when the player uses the bench. The vanilla bench styles use the same class. | `zombie/scripting/objects/XuiSkinScript.java:163-164`, `media/scripts/entities/agricultural/workstations/entity_scutching_board_xuiSkin.txt:7` |
| `DisplayName = Demo Bench` | The name in the build window and in the right-click menu. The loader removes the spaces, looks the result up in the recipe translation (`DemoBench` in `Recipes.json`), and keeps the text as written when there is no such key. | `zombie/scripting/objects/XuiSkinScript.java:171-180`, `media/lua/shared/Translate/EN/Recipes.json:1593` |
| `Icon = Build_ScutchingBoard` | Names the icon of the build window. The value is the vanilla one, so it needs no file in your mod. | `zombie/scripting/objects/XuiSkinScript.java:184-185` |

### Step 4. `42/media/scripts/RecipeDemoWorkstation_recipes.txt`

This is the recipe the bench serves. It is modeled on the vanilla recipes of the stone mill, which carry the mill's tag and nothing else that says where to craft. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:1-18`)]

**File `42/media/scripts/RecipeDemoWorkstation_recipes.txt`**

```
module RecipeDemoWorkstation
{
    craftRecipe CarveDemoCorks
    {
        timedAction = Making,
        time = 100,
        Tags = RecipeDemoBench,
        category = Farming,
        inputs
        {
            item 1 [Base.Plank],
        }
        outputs
        {
            item 3 Base.Cork,
        }
    }
}
```

The only line that differs from the [craftRecipe recipe](/pz/build-42/modding/cookbook/new-craftrecipe) is `Tags = RecipeDemoBench`, in place of `InHandCraft`. The tag is a plain word of your own: the game registers the tags it finds on recipes, and it compares them without regard to case. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeManager.java:77-80`, `zombie/util/TaggedObjectManager.java:136-152`)] The bench's `Recipes` value is turned into a query on those tags when the scripts finish loading. :cite[(`zombie/scripting/entity/components/crafting/CraftBenchScript.java:52-60`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:84-91`)] The vanilla stone mill lists two tags in one `Recipes` value, separated by `;`, and how several tags combine in a query is not checked here, so this recipe uses one tag.

### Step 5. `42/media/lua/shared/Translate/EN/Recipes.json`

This file names the recipe and the bench. The keys are bare names with no spaces, as in the vanilla file. :cite[(`media/lua/shared/Translate/EN/Recipes.json:1593`)]

**File `42/media/lua/shared/Translate/EN/Recipes.json`**

```
{
    "CarveDemoCorks": "Carve Demo Corks",
    "DemoBench": "Demo Bench"
}
```

`CarveDemoCorks` is the recipe's name, as in the [craftRecipe recipe](/pz/build-42/modding/cookbook/new-craftrecipe). :cite[(`zombie/core/Translator.java:699-710`)] `DemoBench` is the bench's display name with its space taken out, as step 3 explains. The file is optional: without it the two names show as written in the scripts.

## Turn it on and see it work

**Copy the folder, start the game in debug mode, build the bench and craft at it.**

1. Put the `RecipeDemoWorkstation` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoWorkstation/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Workstation**, choose **ACCEPT**, and start a new game.
3. Open the debug **Items List**, as the [new item recipe](/pz/build-42/modding/cookbook/new-item) shows. Add one **Hammer**, three **Plank** and four **Nails**: two planks for the bench and one for the recipe, with one spare.
4. Open the building window with the key bound to **Toggle Building UI** in the options. :cite[(`media/lua/shared/Translate/EN/UI.json:729`)] It lists every entity that has a `CraftRecipe` component, grouped by the recipe's category, so look under **Farming** for **Demo Bench**. :cite[(`media/lua/client/Entity/ISUI/BuildRecipe/ISBuildPanel.lua:40-41`, `zombie/entity/components/build/BuildLogic.java:160-176`, `zombie/entity/components/crafting/BaseCraftingLogic.java:104-114`)]
5. Select **Demo Bench**, press **Build** in the window, and place it on the ground. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:5457`)]
6. Right-click the bench, and choose **Demo Bench**. The window that opens lists **Carve Demo Corks**. :cite[(`media/lua/client/Context/World/ISContextEntity.lua:15-22`)]
7. Craft it. You should get three **Cork**, the vanilla item, from the plank.

The window does not offer the recipe from your inventory without the bench, because the recipe carries no `InHandCraft` or `AnySurfaceCraft` tag. :cite[(`media/lua/client/ISUI/Crafting/ISHandcraftWindow.lua:53`)] These steps are checked against the code only; the bench has not been run in a game, and the tile art, the bench window and its recipe list are what you check yourself.

On a dedicated server, put `Mods=RecipeDemoWorkstation` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. Players need the mod too. These server steps have not been run in a game.

## If it does not work

**A bench fails in a few predictable ways, and the log names most of them.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| `Could not parse component block id = CraftBnch` in the log | A component name is not exactly one of the component types, so that component is skipped. Fix the spelling and the capitals. | `zombie/scripting/entity/GameEntityScript.java:205-221` |
| `Unknown block 'components' in entity  script` | The components were put inside a wrapper block. Put each `component` block directly in the `entity`, as the vanilla files do. | `zombie/scripting/entity/GameEntityScript.java:181-187` |
| `Recipe tag query null or whitespace.` in the log, and other scripts missing | `CraftBench` has no `Recipes` value, or it is empty. The exception is thrown while the scripts finish loading, and the loop has no catch for one script, so the whole pass ends there and later scripts may not finish loading. | `zombie/scripting/entity/components/crafting/CraftBenchScript.java:55-56`, `zombie/scripting/ScriptBucket.java:169-175`, `zombie/scripting/ScriptManager.java:1779-1797` |
| `XuiSkin 'RecipeDemoWorkstation.default' ignored, skin needs to be module Base.` and the bench is called `Generic Entity Name` | The skin script is not in the `Base` module, so the style `ES_RecipeDemoBench` is never defined and the bench falls back to the default style. | `zombie/scripting/ui/XuiManager.java:205-208`, `zombie/scripting/ui/XuiSkin.java:73-76`, `media/lua/shared/Translate/EN/Entity.json:2` |
| `Cannot find face for: X` or `Tile duplicate: X` | A `face` block has an id the game does not know, or two faces use the same tile. In debug mode the duplicate stops the load. | `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:219-223`, `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:302-306` |
| The bench opens, but the recipe list is empty | The recipe's `Tags` does not match the bench's `Recipes`. Compare the two words. Whether the game logs this case was not checked. | `zombie/util/TaggedObjectManager.java:136-138` |
| The bench is not in the build window | The entity has no `CraftRecipe` component. | `zombie/entity/components/build/BuildLogic.java:160-176` |

The recipe checker covers the `craftRecipe` blocks of the recipe file, and it does not read the `CraftRecipe` component inside the entity, so check that component's input lines by eye: bracketed items, as in the [craftRecipe recipe](/pz/build-42/modding/cookbook/new-craftrecipe). The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors.

## Going further

**Change the bench, or learn how the pieces fit.**

- [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system) describes the components and the tag link between bench and recipe.
- [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) covers the recipe lines in detail.
- [craftRecipe inputs in depth](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth) covers tags, flags and fluids on input lines.
- [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting) changes a vanilla recipe instead of adding one.

:::callout[How we know]{kind=proof}
Every block of the bench and its style is copied from the vanilla scutching board and stone mill, and the loader behavior comes from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the recipe checker, which reads the recipe file only. It has not been run in a game: whether the build window groups the bench under Farming, how the placed bench looks and what its window shows are what you check yourself.

That a second `xuiSkin default` body is merged onto the vanilla skin is read from the script loader, not run. How several tags in one `Recipes` value combine, and what the vanilla `Tags = Outdoors` line on the scutching board's build recipe does, are not verified.
:::
