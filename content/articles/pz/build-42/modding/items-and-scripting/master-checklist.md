---
id: build-42-master-checklist
slug: master-checklist
title: Master checklist
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - craftrecipe
  - checklist
excerpt: >-
  A checklist to run through before you call crafting content ready on Build 42.22: tags, models, craftRecipe keys, input modes, learning, skills, fluids, mappers and the log.
last_updated: '2026-11-16'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders with crafting content that loads and want a last pass before they hand it to players. Each line links to the page that explains it.

:::callout[The 1-minute version]{kind=key}
- Run the checks in order: items, then recipes, then bench, then learning and skill, then fluids and mappers, then the log.
- Write `base:` in front of vanilla tags, and write `LearnedRecipes` (not `TeachedRecipes`) on a recipe magazine.
- The crafting window shows `time` divided by 10 as seconds, but the real wait is about `time` / 9.6 s by hand and `time` / 24 s at a bench.
- Look the recipe up with `getCraftRecipe`, not `getRecipe`.
:::

:::facts
- **Checks** 18, in six groups
- **Recipe `time = 100`** shown as 10 s in the window; about 10.4 s by hand and about 4 s at a bench, at normal game speed
- **Item input modes the loader accepts** `use` (the default), `keep`, `destroy`
- **Recipe lookup call** `getCraftRecipe`, for craftRecipe blocks
:::

## 1. Items

**An item should carry vanilla tags and a model, and its block should load.**

- [ ] The item's `Tags` line names vanilla capability tags, written with `base:` in front, so recipes that ask for those tags accept it. :cite[(`zombie/scripting/objects/Item.java:2353-2359`)] See [Tags](/pz/build-42/modding/items-and-scripting/tags).
- [ ] The item has a `StaticModel`, and a `WorldStaticModel` if it can lie on the ground. `WorldObjectSprite` is still read by the 42.22 loader, so it is not an error. :cite[(`zombie/scripting/objects/Item.java:2712`, `zombie/scripting/objects/Item.java:2866-2871`)] See [Items: the item block](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42).
- [ ] Every key line ends with a comma, including the last one. :cite[(`zombie/scripting/ScriptParser.java:36-45`)] See [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy).

## 2. Recipes

**A recipe is a `craftRecipe` block whose keys, time and input lines the loader accepts.**

- [ ] The block is a `craftRecipe`, and its top-level keys are ones the loader reads, such as `time`, `timedAction`, `category`, `Tags`, `SkillRequired`, `xpAward` and `NeedToBeLearn`. An unknown key is logged as an error. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:376-399`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:505-509`)]
- [ ] `time` is a whole number that is not seconds. The crafting window shows it divided by 10. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:380-381`, `media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipeInfoBox.lua:49`)] A hand craft sets its length to `time` times 5 and adds the game-time multiplier on each update, which is about 48 per real second at normal speed, so it takes about `time` / 9.6 seconds. :cite[(`media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:264`, `zombie/characters/CharacterTimedActions/BaseAction.java:114`, `zombie/GameTime.java:998-999`)] A bench craft adds 2.4 per 100 ms simulation tick, so it takes about `time` / 24 seconds. :cite[(`zombie/entity/components/crafting/CraftLogicSystem.java:100-101`, `zombie/entity/EntitySimulation.java:35-45`)] Each skill level above the highest requirement cuts 5 percent of the base time. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:205-213`)] Mood and pain lengthen hand crafts. :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:99-122`)] The speed bias and the client versus dedicated server rates are not verified.
- [ ] `timedAction` names a `timedAction` block that exists. A name no block has throws an exception. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:770-775`)]
- [ ] Tools use `mode:keep`, and consumables use the default or `mode:destroy`. Any other item mode throws. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:672-696`)]
- [ ] A `flags[...]` word is spelled as the engine names it, because each word is looked up by name and an unknown one throws. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:749-756`)]
- [ ] Inputs ask for `tags[...]` where interop matters, and use `[A;B]` lists where either item will do. The list is split on `;`, and `[*]` accepts any item. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:626-634`)] See [The big picture](/pz/build-42/modding/items-and-scripting/the-big-picture).
- [ ] Recipes you write follow [craftRecipe inputs in depth](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth) and [craftRecipe outputs and itemMappers](/pz/build-42/modding/crafting/craftrecipe-outputs-and-itemmappers). You can also run the recipe checker named on [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) before you start the game.

## 3. Bench

**The recipe's `Tags` value decides where it appears.**

- [ ] The recipe's `Tags` value names a tag in the target bench's `CraftBench` `Recipes` list, or `AnySurfaceCraft` or `InHandCraft` for no bench. :cite[(`zombie/scripting/entity/components/crafting/CraftBenchScript.java:68-69`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`)] See [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system).

## 4. Learning and skill

**Decide how a player learns the recipe, and which skill it needs.**

- [ ] Learning path chosen: known by default, `AutoLearnAll` or `AutoLearnAny` on the recipe, a magazine item with `LearnedRecipes`, or an item with `ResearchableRecipes`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:416-445`, `zombie/scripting/objects/Item.java:2777-2795`)]
- [ ] `SkillRequired` and `xpAward` use skill names the engine knows. An unknown name is logged as a warning and the entry is skipped. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:468-481`)] See [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning).

## 5. Fluids and mappers

**Fluid lines and mappers have rules of their own.**

- [ ] A fluid is a `fluid` block, and an item that holds it has a `component FluidContainer`. See [New fluid](/pz/build-42/modding/cookbook/new-fluid).
- [ ] A `-fluid` or `+fluid` line follows an item line with amount 1, because the engine throws when the line before it is not a single item. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:806-838`)]
- [ ] An output that says `mapper:Name` has an `itemMapper Name` block, and the mapper lists a `default` value for items it does not name. A missing mapper throws. :cite[(`zombie/scripting/entity/components/crafting/OutputScript.java:320-325`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:620-622`)]

## 6. The log

**Read the log before you call the work done.**

- [ ] The mod ran on a game you could throw away, and `console.txt` shows none of the errors on [Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors).
- [ ] The recipe resolves in the Lua console with `getScriptManager():getCraftRecipe("Module.RecipeName")`. The older `getRecipe` call reads the legacy `recipe` list. :cite[(`zombie/scripting/ScriptManager.java:775`, `zombie/scripting/ScriptManager.java:1059-1072`)]

:::callout[How we know]{kind=proof}
Every line above was read from the 42.22 source. Corrected from the old page: `time` is not in seconds (the window divides by 10, and the real wait differs), `TeachedRecipes` is not an item key, and `getRecipe` is not the lookup for craftRecipe blocks. Dropped: the old line about `Property:Value` syntax inside a craftRecipe, because the parser accepts `mode:keep` and similar words on input lines and no line states a rule for "legacy syntax". Not verified: that the recipe lookup works from the Lua console in a running game, and the old "fresh save" advice, which no code line supports.
:::
