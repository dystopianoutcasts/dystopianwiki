---
id: build-42-the-new-craftrecipe-block
slug: the-new-craftrecipe-block
title: The new craftRecipe block
game: pz
version: build-42
section: modding
category: crafting
difficulty: intermediate
tags:
  - craftrecipe
  - crafting
  - scripts
  - recipe-time
excerpt: >-
  How a craftRecipe block reads in Build 42.22: the id, the 26 top-level keys, the comma rule, what time really means, and what the engine does with a bad line.
last_updated: '2026-11-16'
related_articles:
  - craftrecipe-inputs-in-depth
  - craftrecipe-outputs-and-itemmappers
  - craftrecipe-vs-legacy-recipe
  - addendum-canonical-craftrecipe-schema
  - craftrecipe-reference
  - new-craftrecipe
  - changing-recipes-and-crafting
  - master-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write a recipe by hand and want to know what each top-level line does. The [inputs](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth) and [outputs](/pz/build-42/modding/crafting/craftrecipe-outputs-and-itemmappers) pages cover the two blocks inside it.

:::callout[The 1-minute version]{kind=key}
- A recipe is `craftRecipe <id> { ... }` inside a `module`. `key = value,` lines come first, then an `inputs` block and an `outputs` block.
- Every `key = value,` line must end with a comma. A last line with no comma is dropped, and nothing says so.
- `time` is a whole number, not seconds. The crafting window shows it divided by 10, but at normal speed a hand craft takes about `time` / 9.6 seconds and a bench craft about `time` / 24.
- `Tags` decides where the recipe is offered: `InHandCraft` or `AnySurfaceCraft` for the crafting window, or a bench's tag for that bench.
- A key the loader does not know is logged as an error, and with `-debug` the load stops.
:::

:::facts
- **Top-level keys the loader reads** 26, listed in section 3
- **Child blocks it accepts** 4: `inputs`, `outputs`, `itemMapper`, `overlayMapper`
- **Vanilla recipes** 965 `craftRecipe` blocks, 0 `recipe` blocks, and 202 more as `component CraftRecipe` inside entities
- **`time = 100`** shown as 10 seconds in the window; about 10.4 s by hand and about 4 s at a bench, at normal game speed
- **`time` when you leave it out** 50
:::

## 1. One vanilla recipe, line by line

**A recipe is a named block of `key = value,` lines on top, with an `inputs` block and an `outputs` block under them.**

This is the vanilla recipe that grinds seeds into flour at the stone mill. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:35-49`)]

```
craftRecipe MillFlour
{
    time = 100,
    timedAction = UseStoneQuern,
    Tags = Stone_Mill,
    category = Farming,
    inputs
    {
        item 12 [Base.WheatSeed;Base.RyeSeed;Base.BarleySeed] flags[ItemCount],
    }
    outputs
    {
        item 1 Base.Flour2,
    }
}
```

The word after `craftRecipe` is the recipe's id. `time` is the length, `timedAction` names the animation block, `Tags` says where the recipe is offered (here at the stone mill), and `category` files it in the crafting list. The `inputs` block lists what the craft takes, and the `outputs` block lists what it makes. The two blocks are covered on the [inputs](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth) and [outputs](/pz/build-42/modding/crafting/craftrecipe-outputs-and-itemmappers) pages.

## 2. The id and where the block lives

**The id is the text before the opening brace, and the block sits inside a `module` or inside an entity.**

The loader takes the text after the script word and before the brace as the recipe's name. :cite[(`zombie/scripting/ScriptBucket.java:99-103`)] None of the 965 vanilla ids contains a space, and this page does not test whether a space in an id works, so write ids without spaces.

A recipe for a mod item goes in its own `module` block, as in the example in section 6.

Vanilla also writes a recipe inside an entity as `component CraftRecipe { ... }`, which is how a buildable object gets its build recipe. The engine reads that body with the same code and adds the recipe tag `EntityRecipe` to it. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipeComponentScript.java:61-67`)] Vanilla has 202 such components. The [workstation page](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system) covers entities.

The recipe's display name comes from a translation file. The loader asks the translator for the id when it reads the block, and when the file has no entry the id itself is shown. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:369`, `zombie/core/Translator.java:699-710`)] The key in `Recipes.json` is the bare id, as the [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) recipe shows.

Lookup from Lua uses `getScriptManager():getCraftRecipe("Module.Id")`, and the older `getRecipe` call reads the legacy list. :cite[(`zombie/scripting/ScriptManager.java:775-777`, `zombie/scripting/ScriptManager.java:1059-1072`)]

## 3. The keys at the top of the block

**The loader reads 26 keys at the top of a recipe, and it compares them without regard to case.**

:::chips
- recipeGroup
- icon
- time
- ResearchSkillLevel
- OnTest
- OnAddToMenu
- OnStart
- OnUpdate
- OnCreate
- OnFailed
- needToBeLearn
- SkillRequired
- AutoLearnAny
- AutoLearnAll
- ResearchAll
- ResearchAny
- xpAward
- MetaRecipe
- Animation
- timedAction
- category
- Tags
- Tooltip
- AllowBatchCraft
- CanWalk
- overlayStyle
:::

Each key is one branch of a single `equalsIgnoreCase` chain. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:376-503`)] A key with an empty value is skipped, and the words `consumeOnFinish` and `requiresPlayer` are skipped on purpose. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:375`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:396`)] The keys that teach, require or reward a skill are explained on [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning), and the five Lua hooks are on the same page.

Four of the 26 keys appear on almost every recipe. Vanilla spells them `time`, `timedAction`, `category` and `Tags`.

| Line | What it does | Vanilla blocks that set it (of 965) | Code |
|---|---|---|---|
| `time = 100,` | The craft length as a whole number. It is 50 when the line is missing. | 965 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:70`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:380-381` |
| `timedAction = Making,` | Names a `timedAction` block that gives the animation. A name that no block has throws. | 885 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:487-488`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:770-775` |
| `category = Cooking,` | The group the crafting list files the recipe under. A recipe with no category falls back to `Miscellaneous`. | 930 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:489-490`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:223-225` |
| `Tags = InHandCraft;CanBeDoneInDark,` | Recipe tags, split on `;`. They decide which windows and benches offer the recipe. | 965 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496` |

A recipe can leave out `timedAction`. The craft action only sets the animation and plays the start sound when its `actionScript` is set, and the recipe's `timedAction` is the source of that script. 80 vanilla recipes have no `timedAction`. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:141-149`)]

### How long `time` really is

**`time` is not seconds: the window divides it by 10, and the real wait depends on whether you craft by hand or at a bench.**

The crafting window shows the recipe's time divided by 10 and labels it seconds. :cite[(`media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipeInfoBox.lua:49-50`)] A hand craft sets its length to `time` times 5, and each update adds the game-time multiplier, which is about 48 per real second at normal speed, so the wait is about `time` / 9.6 seconds. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:264`, `zombie/characters/CharacterTimedActions/BaseAction.java:114`, `zombie/GameTime.java:998-999`)] A bench adds 2.4 per 100 ms simulation tick, so the wait is about `time` / 24 seconds. :cite[(`zombie/entity/components/crafting/CraftLogicSystem.java:100-101`, `zombie/entity/EntitySimulation.java:35-45`)]

Each skill level above the recipe's highest skill requirement cuts 5 percent of the base time. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:205-213`)] Mood and wounded hands lengthen a hand craft further. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:99-122`)] The worked numbers are on the [Master checklist](/pz/build-42/modding/items-and-scripting/master-checklist). How the rates differ between a single-player game, a multiplayer client and a dedicated server is not verified.

## 4. The comma rule

**A `key = value,` line exists only because of its comma, so a last line with no comma is lost without any message.**

The parser cuts the block at each comma, and text after the last comma before the closing brace is never turned into a line. :cite[(`zombie/scripting/ScriptParser.java:30-46`)] The braces of `inputs`, `outputs` and `itemMapper` are not followed by commas, but every line inside them is. Vanilla writes a comma after the last line of a block as well. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:43-47`)]

A missing comma between two lines glues them into one line, and the loader then reads one odd key. The [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy) page shows both traps with a test.

## 5. What a bad line does

**A mistake in a recipe is caught at one of three steps, and each step does something different to the rest of the game.**

| Mistake | What the engine does | Code |
|---|---|---|
| An unknown top-level key, such as `enabled = false,` | Logs an `Unknown key` error. With `-debug` it also throws, and the recipe is removed. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:505-509`, `zombie/scripting/ScriptBucket.java:198-205` |
| An unknown child block, or `fluidMapper` and `energyMapper` | `fluidMapper` and `energyMapper` throw "Not yet implemented". Other names log an error, and with `-debug` throw. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:521-535` |
| A bad line inside `inputs` or `outputs`, such as a word the line parser does not know | Throws while the block is read. The loader logs the stack trace and removes that one recipe; the others load. | `zombie/scripting/entity/components/crafting/InputScript.java:764-770`, `zombie/scripting/ScriptBucket.java:198-205` |
| A `timedAction` name with no block, or two inputs that both claim `Prop1` | Throws in the step after all scripts are read. That step is one `try`, so the stack trace is logged and the rest of that step is skipped. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:749-757`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:770-775`, `zombie/scripting/ScriptManager.java:1772-1795` |
| An output item that does not exist | Throws when the world dictionary is built. One failing recipe ends that pass for the remaining craft recipes, and the stack trace is logged. | `zombie/entity/components/crafting/recipe/OutputMapper.java:83-90`, `zombie/scripting/ScriptBucketCollection.java:189-195`, `zombie/scripting/ScriptManager.java:1823-1832` |

With `-debug` a script load error also stops the start with `Script load errors.`. :cite[(`zombie/scripting/ScriptManager.java:1710-1712`)] What a skipped step does to the recipes it never reached in play is not verified. The [Testing loop](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) page shows how to read the log for these.

## 6. Try it: one recipe in a mod

**A one-recipe mod that grinds seeds into flour by hand, and what to look for when you enable it.**

1. Make the folder `Zomboid/mods/CraftBlockDemo/` with `42/mod.info` and `42/poster.png`, laid out as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Write `42/mod.info`:

```
name=Craft Block Demo
id=CraftBlockDemo
description=One recipe that grinds seeds into flour by hand.
poster=poster.png
author=Your Name
```

3. Write `42/media/scripts/CraftBlockDemo_recipes.txt`:

```
module CraftBlockDemo
{
    craftRecipe GrindSeedsByHand
    {
        time = 100,
        timedAction = Making,
        Tags = InHandCraft,
        category = Cooking,
        inputs
        {
            item 12 [Base.WheatSeed;Base.RyeSeed;Base.BarleySeed] flags[ItemCount],
        }
        outputs
        {
            item 1 Base.Flour2,
        }
    }
}
```

4. Start the game, open **Mods**, check **Craft Block Demo** and start a game. In debug mode, spawn 12 `Base.WheatSeed` from the debug Items List, open the crafting window and look for the recipe.

You should find `GrindSeedsByHand` in the Cooking list, shown under its id because the mod has no `Recipes.json`. The window should show a craft time of 10 seconds, and crafting should take about 10 seconds and swap the 12 seeds for one `Flour2`. Search `console.txt` for `Unknown key`: there should be none. The recipe pairs the lighter recipe's `Making` and `InHandCraft` lines with the stone mill recipe's inputs. :cite[(`media/scripts/generated/recipes/recipes.txt:53-67`)]

:::callout[How we know]{kind=proof}
Every code line above was opened in the 42.22 capture, and the vanilla counts (965 `craftRecipe`, 0 `recipe`, 202 `component CraftRecipe`, the per-key counts in section 3 and the 80 recipes with no `timedAction`) were counted over `media/scripts`. The example recipe was checked with the repo's recipe checker and compared with vanilla lines, and it was not run in a game. Not verified: whether a space in a recipe id works, how the hand and bench rates differ on a dedicated server, and what a skipped load step does to the recipes after the failing one. Dropped from the old page: the claim that `time` is in seconds, the claim that vanilla uses ids with spaces (none of the 965 does), and the vanilla file path `entity_stone_mill.txt`, which holds the entity and not the recipe.
:::
