---
id: build-42-overriding-patching-vanilla
slug: overriding-patching-vanilla
title: Overriding / patching vanilla
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - overrides
  - tags
  - recipes
excerpt: >-
  When to change a vanilla item or recipe in Build 42.22 and when to add new ones beside it: redefining merges, new items join recipes by tag, and recipes join a workstation by tag.
last_updated: '2026-11-16'
related_articles:
  - overriding-scripts
  - item-block-merge-behaviour
  - tags
  - items-the-item-block-in-b42
  - script-file-anatomy
  - testing-loop-and-common-load-errors
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders deciding between changing a vanilla item and adding new ones beside it. This page is the short choice guide; the detail lives on the pages it links.

:::callout[The 1-minute version]{kind=key}
- To change one value on a vanilla item, write the same `module Base` and item name with just that key. The blocks merge: your keys land on top of vanilla's, and the keys you leave out stay.
- Between two mods, the script file's path decides which body is parsed last. The exception: for the same relative path, the later mod in the load list wins and the other file is never read.
- To make a new item work in vanilla recipes, give it the vanilla tags those recipes ask for, and leave the recipes alone.
- To add a recipe to a vanilla workstation, give your recipe the tag that the workstation's `Recipes` value names.
- To teach a recipe, put its id in `LearnedRecipes` on a literature item, or put skill levels in `AutoLearnAny` or `AutoLearnAll` on the recipe itself.
- Loot is not set in item scripts. It is set in the distribution Lua tables.
:::

:::facts
- **Item keys that merge** all keys the item loader reads, except that `Tags` only adds
- **Script types that replace instead** 7 (`model`, `sound`, `mannequin`, `soundTimeline`, `animationsMesh`, `stringList`, `xuiConfig`)
- **Vanilla item names defined twice** 13, which go through the same merge
:::

## 1. Redefining a vanilla id merges

**A block with a vanilla item's name does not replace the item; it adds a second body that is loaded on top of vanilla's.**

An item or craft recipe you redefine in `module Base` merges with vanilla's, rather than winning by load order. :cite[(`zombie/scripting/ScriptBucket.java:98-125`, `zombie/scripting/ScriptBucket.java:173-198`)] The bodies of one name are loaded one after another, so a later body overwrites a key an earlier one set. Between mods, the sorted relative path of the file decides which body comes last, and when two mods ship the same relative path, the later mod in the load list wins and the other file is never read. :cite[(`zombie/scripting/ScriptManager.java:1658-1676`, `zombie/ZomboidFileSystem.java:672-677`)]

[Item block merge behaviour](/pz/build-42/modding/items-and-scripting/item-block-merge-behaviour) shows the merge with a Weight-only block, with steps to see it in game. Seven script types replace instead of merge, because their classes clear their fields before the next body: `model`, `sound`, `mannequin`, `soundTimeline`, `animationsMesh`, `stringList` and `xuiConfig`. :cite[(`zombie/scripting/objects/ModelScript.java:251`, `zombie/scripting/objects/GameSoundScript.java:91`, `zombie/scripting/objects/MannequinScript.java:119`, `zombie/scripting/objects/SoundTimelineScript.java:48`, `zombie/scripting/objects/AnimationsMesh.java:54`, `zombie/scripting/objects/StringListScript.java:51`, `zombie/scripting/objects/XuiConfigScript.java:39`)] [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts) explains them, and the typo that removes a vanilla item.

## 2. Prefer adding over overriding

**Because recipes accept items by tag, the cleanest change is a new item with the right tags and, where needed, a new recipe.**

A recipe input that names a tag takes every loaded item that carries it, mod items included. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:891-900`)] So a mod tool that carries `base:sharpknife` is accepted by the vanilla recipes that ask for that tag, with no edit to them. [Tags](/pz/build-42/modding/items-and-scripting/tags) has a short mod and the steps to check it in the crafting window.

New items and new `craftRecipe` blocks survive a game update better than a copy of a vanilla recipe does, because a copy has to be kept up to date by hand. A vanilla item can change between builds: for example the weight of one radio item changed from 42.21 to 42.22. :cite[(`media/scripts/generated/items/radio.txt:143-147`)]

## 3. Adding a recipe to a vanilla workstation

**Give your recipe the tag in the workstation's `Recipes` value, and leave the workstation alone.**

A workstation picks its recipes by the tags the recipes carry, and the tag can be any word the recipes use. :cite[(`zombie/scripting/entity/components/crafting/CraftBenchScript.java:58`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:84-91`)] Vanilla recipes for the primitive forge carry `Tags = PrimitiveForge`, for example. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_heads.txt:11`, `media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_heads.txt:35`)] [New workstation](/pz/build-42/modding/cookbook/new-workstation) builds the pair from scratch, and [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) builds a recipe.

## 4. Teaching a recipe

**A literature item teaches the recipes in its `LearnedRecipes` list when read, and a recipe can learn itself from skill levels.**

Reading a literature item adds each recipe of its `LearnedRecipes` list to the reader's known recipes. :cite[(`zombie/characters/IsoGameCharacter.java:4897-4906`, `zombie/scripting/objects/Item.java:2777-2784`)] The Build 41 spelling `TeachedRecipes` is not read; see [Items: the item block in B42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42).

A craft recipe can list skill levels in `AutoLearnAny` or `AutoLearnAll`, written as `Skill:level` pairs separated by `;`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:416-445`)] The game checks both lists for every recipe the character does not know yet. :cite[(`zombie/scripting/ScriptManager.java:1196-1208`)] A vanilla example is a recipe that teaches itself at Blacksmith level 3. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_heads.txt:8`)] `ResearchableRecipes` on an item is a third key, for recipes tied to researching it. :cite[(`zombie/scripting/objects/Item.java:2788-2795`)]

## 5. Loot lives in Lua, not in the script

**Item scripts do not decide where an item spawns; the distribution tables do.**

Loot tables are Lua files in `media/lua/server/Items/`: `Distributions.lua`, `ProceduralDistributions.lua` and `SuburbsDistributions.lua`. [Changing loot](/pz/build-42/modding/changing-vanilla/changing-loot) covers adding your item to them and when the game reads them.

## 6. Try it

**Run the two small mods the linked pages build, and compare what changed.**

1. Build the [lighter plank](/pz/build-42/modding/items-and-scripting/item-block-merge-behaviour#2-try-it-a-lighter-plank) mod. Look for the plank's weight in its tooltip: it is the one value you overrode, and the icon and weapon use are untouched.
2. Build the [TagKnife](/pz/build-42/modding/items-and-scripting/tags#try-it-a-blade-that-vanilla-recipes-accept) mod. Look for your `Blade` in the required items of the carving recipe: you changed no vanilla recipe.

Neither check has been run in a game.

:::callout[How we know]{kind=proof}
Read from the 42.22 engine source and scripts; the merge and tag rules are the ones shown with their lines on the linked pages. Not verified: that a recipe with no `Tags` of the workstation's word is hidden from it in a running game, how `AutoLearnAny` and `AutoLearnAll` differ in what they require, and what the game does after a failed recipe load.
:::
