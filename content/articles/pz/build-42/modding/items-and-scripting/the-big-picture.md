---
id: build-42-the-big-picture
slug: the-big-picture
title: The big picture
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - craftrecipe
  - workstation
  - tags
  - skills
excerpt: >-
  What a Build 42.22 scripter should know first: crafting is written as craftRecipe blocks, matched by tag, tied to workstation entities, and gated by skill and learning.
last_updated: '2026-11-16'
related_articles:
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who know Build 41 scripts and want the shape of Build 42 crafting before they open a script file. Each part below links to the page that goes deep.

:::callout[The 1-minute version]{kind=key}
- Vanilla writes every crafting recipe as a `craftRecipe` block, and the scripts hold no `recipe` block at all. The engine still lists `recipe` as a block word.
- An input line can name a tag, such as `tags[base:hammer]`, so any item that carries the tag fits. A mod item that carries a vanilla tag matches every recipe input that asks for that tag, though an `OnTest` function, an input flag or a fluid line can still reject it.
- A recipe is shown at a workstation when the recipe's `Tags` value matches a tag in the workstation's `CraftBench` component.
- Fluids are their own script blocks. An item holds fluid through a `FluidContainer` component, and recipe lines with `-fluid` and `+fluid` use it.
- Three checks are separate: whether the player knows the recipe, whether the player's skill is high enough, and whether the recipe is offered at the bench.
:::

:::facts
- **craftRecipe blocks in vanilla** 965, counted in `media/scripts`
- **`recipe` blocks in vanilla** 0
- **Recipe components inside entities** 202 `component CraftRecipe` blocks
- **Workstation components** 35 `component CraftBench` blocks
- **Fluid blocks** 61 `fluid` blocks
- **Tag matches in input lines** 2,099 `tags[` lines in `generated/recipes` and `generated/entities`
:::

## 1. One recipe block

**Crafting in Build 42 is written as `craftRecipe` blocks, and vanilla no longer uses the Build 41 `recipe` block.**

Counting the `craftRecipe` blocks in `media/scripts` gives 965, and counting `recipe` blocks gives none. A further 202 recipes sit inside entities as `component CraftRecipe`, such as the build recipe of the stone mill. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill.txt:25-43`)]

The engine still knows the word `recipe`. It is one block word in the script type list, next to `craftRecipe`, `evolvedrecipe` and `uniquerecipe`. :cite[(`zombie/scripting/ScriptType.java:23-25`, `zombie/scripting/ScriptType.java:45`)] This page does not test whether a mod that still writes a `recipe` block shows up in the crafting window. [craftRecipe versus the legacy recipe](/pz/build-42/modding/crafting/craftrecipe-vs-legacy-recipe) covers the difference, and [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block) reads one vanilla block line by line.

The keys at the top of a block are read one by one. A key the loader does not know is logged as an error, and in debug mode the load then stops with an exception. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:376-399`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:505-509`)]

## 2. Recipes match tags, not only item names

**An input line can ask for a tag, and every item that carries the tag is accepted.**

In an input line, `tags[...]` is split on `;` and each entry becomes an item tag. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:729-739`)] The engine builds a table from tag to items once the item scripts are loaded. :cite[(`zombie/scripting/ScriptManager.java:158-163`, `zombie/inventory/ItemTags.java:22-30`)] A tag that no item carries makes the input throw `Tag has no items`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:891-896`)]

An item gets its tags from its `Tags = ...` line, which is also split on `;`. :cite[(`zombie/scripting/objects/Item.java:2353-2359`)] So a mod item with `Tags = base:hammer,` is a hammer for every vanilla recipe that asks for `tags[base:hammer]`, with no change to the recipe. The input lines of the vanilla hammer-head recipe show the pattern. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_heads.txt:3-25`)]

The [Tags](/pz/build-42/modding/items-and-scripting/tags) page explains the two kinds of tag, and [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua) covers tags you register yourself.

## 3. Recipes belong to workstations

**A recipe appears at a workstation when its `Tags` value matches a tag in the workstation's `CraftBench` list.**

A workstation is an `entity` block built from components. The `CraftBench` component has one key that matters here, `Recipes`, which holds a list of recipe tags. :cite[(`zombie/scripting/entity/components/crafting/CraftBenchScript.java:68-69`)] A recipe's own `Tags` value is read as a `;` list. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`)]

The stone mill is the model. Its bench lists `Stone_Quern;Stone_Mill`, and its flour recipes carry `Tags = Stone_Mill,`. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill.txt:11-14`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:3-7`)] Recipes that carry `AnySurfaceCraft` or `InHandCraft` are not tied to a bench. The full story is on [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system).

## 4. Fluids

**Fluids are defined in their own blocks, held by items through a component, and used in recipes with `-fluid` and `+fluid` lines.**

Vanilla has 61 `fluid` blocks, and the script type for them is `FluidDefinition`. :cite[(`zombie/scripting/ScriptType.java:49`)] An input line such as `-fluid 0.2 categories[Water] mode:mixture,` takes 0.2 of fluid from the Water category, as the vanilla coffee recipe does. :cite[(`media/scripts/generated/entities/appliances/workstations/entity_coffeemachine_craftRecipe.txt:3-14`)] Counting lines that start with `-fluid` or `+fluid` gives 56 in `media/scripts`.

Items that hold fluid carry a `component FluidContainer` block inside the item. Counting that block in `media/scripts` gives 144, in items and in entities together. [New fluid](/pz/build-42/modding/cookbook/new-fluid) builds one.

## 5. Learning, skill and bench are separate checks

**A recipe can fail on three different gates, and each gate is its own key.**

- **Learning:** `NeedToBeLearn = true` makes the recipe unknown until the player learns it. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:397-398`, `zombie/characters/IsoGameCharacter.java:11724-11730`)]
- **Skill:** `SkillRequired = Blacksmith:1,` is a minimum level. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`)]
- **Bench:** the recipe tag against the `CraftBench` list, as in part 3.

The engine checks the skill and the learning in the same function that decides whether a character may craft, and the known-recipe test also passes when a sandbox option shows unlearned recipes or the character knows every recipe. :cite[(`zombie/characters/IsoGameCharacter.java:11724-11730`)] :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeManager.java:350-358`)] The details, and the ways to learn a recipe, are on [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning). How stations stack into tiers is on [Tech tiers and production chains](/pz/build-42/modding/items-and-scripting/tech-tiers-and-production-chains).

## 6. Where to go next

**Pick the page that matches what you are about to do.**

::::cards
:::card[Write your first script]{accent=blue}
[Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy), then [Items: the item block](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42).
:::
:::card[Change vanilla]{accent=orange}
[Overriding / patching vanilla](/pz/build-42/modding/items-and-scripting/overriding-patching-vanilla).
:::
:::card[Build something]{accent=purple}
The cookbook: [New item](/pz/build-42/modding/cookbook/new-item), [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe), [New workstation](/pz/build-42/modding/cookbook/new-workstation).
:::
:::card[Test it]{accent=cream}
[Testing loop and common load errors](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors), then the [master checklist](/pz/build-42/modding/items-and-scripting/master-checklist).
:::
::::

:::callout[How we know]{kind=proof}
The counts were made over the 42.22 `media/scripts` folder, and every engine claim was read from the 42.22 source. Not verified: whether a legacy `recipe` block shows in the crafting window. The old page's claim that the skills Blacksmith, Pottery, Masonry, Carving, Flintknapping and Tailoring are new in Build 42 was dropped, because no line in the code says which skills are new. The engine registers all of them. :cite[(`zombie/characters/skills/PerkFactory.java:117-128`)]
:::
