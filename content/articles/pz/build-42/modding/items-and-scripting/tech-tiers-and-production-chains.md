---
id: build-42-tech-tiers-and-production-chains
slug: tech-tiers-and-production-chains
title: Tech tiers and production chains
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - workstation
  - tech-tiers
  - craftrecipe
  - production
excerpt: >-
  How Build 42.22 builds tiers out of tags: forges and furnaces list the tags of the bench below them, and the vanilla production chains run across benches, skills and learning.
last_updated: '2026-11-16'
related_articles:
  - the-big-picture
  - the-workstation-entity-system
  - skills-xp-and-learning
  - tags
  - master-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who want their recipes to fit the vanilla forge and furnace ladder, or who want to see how a vanilla production chain is spread over benches. The bench mechanics are on [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system).

:::callout[The 1-minute version]{kind=key}
- The engine has no tier setting. A tier is a bench whose `Recipes` list also names the tags of the bench below it.
- The three forges list `PrimitiveForge`, then `PrimitiveForge;Forge`, then `PrimitiveForge;Forge;AdvancedForge`. The three furnaces follow the same pattern. A higher bench therefore shows the recipes of the lower ones.
- A recipe is written with the tag of the lowest bench that can make it, and the higher benches pick it up.
- A tier is more than a bench: the recipes also ask for skill levels and, mostly, for learning.
- A chain, such as iron from ore to steel, is a series of recipes that each need a different bench tag.
:::

:::facts
- **Forge benches** 3, tags `PrimitiveForge`, `Forge`, `AdvancedForge`
- **Furnace benches** 3, tags `PrimitiveFurnace`, `Furnace`, `AdvancedFurnace`
- **Recipes whose tag is exactly** `PrimitiveForge` 58, `Forge` 56, `AdvancedForge` 25
- **Furnace recipes** `PrimitiveFurnace` 7, `Furnace` 12, `AdvancedFurnace` 17
- **Blacksmith levels in forge recipes that name Blacksmith** 0 or 1 to 8 (primitive), 2 to 8 (forge), 3 to 9 (advanced)
:::

## 1. A tier is a list of tags

**A higher bench lists its own tag and the tags of the benches below it, so it offers all of their recipes.**

The `Recipes` value of each forge and furnace shows the stacking. :cite[(`media/scripts/generated/entities/blacksmith/workstations/entity_forge_i.txt:13`, `media/scripts/generated/entities/blacksmith/workstations/entity_forge_ii.txt:13`, `media/scripts/generated/entities/blacksmith/workstations/entity_forge_iii.txt:13`, `media/scripts/generated/entities/blacksmith/workstations/entity_furnace_i.txt:13`, `media/scripts/generated/entities/blacksmith/workstations/entity_furnace_ii.txt:13`, `media/scripts/generated/entities/blacksmith/workstations/entity_furnace_iii.txt:13`)]

| Bench (entity name) | `Recipes` value |
|---|---|
| `Forge_Primitive_Forge` | `PrimitiveForge` |
| `Forge` | `PrimitiveForge;Forge` |
| `Advanced_Forge` | `PrimitiveForge;Forge;AdvancedForge` |
| `Primitive_Furnace` | `PrimitiveFurnace` |
| `Smelting_Furnace` | `PrimitiveFurnace;Furnace` |
| `Blast_Furnace` | `PrimitiveFurnace;Furnace;AdvancedFurnace` |

A recipe matches a bench when its tags overlap the bench list, so a recipe tagged `PrimitiveForge` shows at all three forges. :cite[(`zombie/util/TaggedObjectManager.java:281-285`, `zombie/scripting/entity/components/crafting/CraftBenchScript.java:53-59`)] The recipes themselves carry one tag each, for example `Tags = PrimitiveForge,` on the hammer-head recipe. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_heads.txt:3-12`)]

To fit a bench of your own into the ladder, list a vanilla tag in its `Recipes` value next to your own. That follows from the matching rule above and was not tried in a game.

## 2. What else a tier asks for

**The bench is only one of three gates: the forge recipes also ask for Blacksmith levels and mostly need to be learned.**

Among the 58 recipes tagged `PrimitiveForge`, those that name a Blacksmith requirement ask for levels 0 or 1 to 8, and 28 carry `NeedToBeLearn = true`. The 56 `Forge` recipes ask for levels 2 to 8, and 55 need learning. The 25 `AdvancedForge` recipes ask for levels 3 to 9, and 24 need learning.

The engine drops a requirement of level 0, so those lines ask for nothing. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:408-412`)] The counts come from the recipe files in `generated/entities/blacksmith/craftRecipes`, and the keys are explained on [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning). :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:397-415`)]

Building the benches is a separate matter. The three forge entity files have no `SkillRequired` line, while the stone mill asks for Masonry 1, the scutching board for Carpentry 2, the heckle comb, the ripple comb and the simple loom for Carpentry 3, and the spinning wheel and the pottery bench for Carpentry 5. The three forge files hold none. :cite[(`media/scripts/generated/entities/blacksmith/workstations/entity_forge_i.txt:35-48`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill.txt:30`, `media/scripts/generated/entities/agricultural/workstations/entity_scutching_board.txt:39`, `media/scripts/generated/entities/agricultural/workstations/entity_heckle_comb.txt:40`, `media/scripts/generated/entities/agricultural/workstations/entity_ripple_comb.txt:39`, `media/scripts/generated/entities/agricultural/workstations/entity_simple_loom.txt:39`, `media/scripts/generated/entities/animals/workstations/entity_spinning_wheel.txt:51`, `media/scripts/generated/entities/pottery/workstations/entity_pottery_bench.txt:37`)] In the scripts the skill is written `Woodwork`, which the game shows as Carpentry.

## 3. Chains across benches

**A production chain is a set of recipes where each step needs a different bench tag.**

::::cards
:::card[Fuel and metal]{accent=orange}
`MakeWoodCharcoal` runs at a `WoodCharcoal` bench (charcoal burner, charcoal pit, dome kiln). The forge recipe for a hammer head takes `tags[base:charcoal]` as an input. `ExtractIronBloom` and `SmeltCopperOre` are `PrimitiveFurnace` recipes, `ExtractIronFromIronOre` is a `Furnace` recipe, and `ExtractSteelFromLargeItem` is an `AdvancedFurnace` recipe.
:::
:::card[Cloth]{accent=blue}
`HeckleFlax` (`Heckling`), `RippleFlax` (`Rippling`), `ScutchFibre` (`Scutching`), `SpinThreadFromFlax` (`SpinningWheel`) and `WeaveCloth` (`Weaving`) each have their own bench.
:::
:::card[Leather]{accent=purple}
`RemoveFlesh` and `RemoveFur` have their own tags, `TanLeather` has one, and `DryLargeLeather`, `DryMediumLeather` and `DrySmallLeather` use the drying racks. `CutUpLeather_Large`, `_Medium` and `_Small` are `AnySurfaceCraft`.
:::
:::card[Milling and clay]{accent=cream}
`MillFlour` runs at the stone mill (`Stone_Mill`). Pottery has `PotteryWheel` (10 recipes), `HandPress` (7), `KilnSmall` (18) and `KilnLarge` (19).
:::
::::

The recipe names and tags are from the vanilla scripts. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_woodcharcoal.txt:3-7`, `media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_furnaces_i.txt:3-6`, `media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_furnaces_i.txt:53`, `media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_furnaces_i.txt:166`, `media/scripts/generated/entities/agricultural/craftRecipes/recipes_flax.txt:3`, `media/scripts/generated/entities/agricultural/craftRecipes/recipes_flax.txt:20`, `media/scripts/generated/entities/animals/craftRecipes/recipes_spinning_wheel.txt:35`, `media/scripts/generated/entities/agricultural/craftRecipes/recipes_fiber.txt:3-7`, `media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:161-164`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:35-39`)] This page does not check the order of the steps inside a chain, only which bench each recipe asks for.

## 4. Two benches with no matching recipes

**Some vanilla tags have a bench but no recipe, or a recipe but no bench.**

The key duplicator bench lists `KeyDuplicator`, and no recipe carries that tag. No recipe carries `ChoppingBlock` either, but that bench also lists `AnySurfaceCraft`, so it shows those recipes. Eight recipes carry `StandingDrillPress`, and no bench lists it. :cite[(`media/scripts/generated/entities/blacksmith/workstations/entity_keyduplicator.txt:11-14`, `media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_standingdrill.txt:3-8`)] Whether the game offers those recipes some other way is not verified, so test before you rely on either.

:::callout[How we know]{kind=proof}
The bench lists were read from the six forge and furnace entity files, the matching rule from the 42.22 source, and the recipe counts and Blacksmith levels from `generated/entities/blacksmith/craftRecipes` with a script that read each block's `Tags`, `SkillRequired` and `NeedToBeLearn` lines. The levels cover only recipes whose requirement names Blacksmith. Dropped from the old page: the electric blower forge, arc furnace, hydraulic press and "some still WIP in `tempNotWorking/`", because no such bench exists among the 35 `CraftBench` components and the folder does not exist in the 42.22 game files; the stone age list (grinding slab, cooking pit, drying racks) beyond the benches named above; and the "taxonomy UNCERTAIN" tag. Not verified: the order of steps in each chain.
:::
