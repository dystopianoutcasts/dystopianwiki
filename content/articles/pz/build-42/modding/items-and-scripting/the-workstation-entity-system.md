---
id: build-42-the-workstation-entity-system
slug: the-workstation-entity-system
title: The workstation / entity system
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - workstation
  - entity
  - craftbench
  - craftrecipe
excerpt: >-
  How a Build 42.22 workstation is an entity made of components, how the CraftBench Recipes list picks the recipes it shows, and which vanilla benches and tags exist.
last_updated: '2026-11-16'
related_articles:
  - the-big-picture
  - tags
  - tech-tiers-and-production-chains
  - skills-xp-and-learning
  - script-file-anatomy
  - master-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who want a recipe to appear at a bench, or want to read how a vanilla bench is built. To build a working bench step by step, follow [New workstation](/pz/build-42/modding/cookbook/new-workstation).

:::callout[The 1-minute version]{kind=key}
- A workstation is an `entity` block made of components. The `CraftBench` component holds a `Recipes` value, a list of recipe tags separated by `;`.
- A recipe appears at the bench when its own `Tags` value shares at least one tag with that list.
- A `-` inside the `Recipes` value starts an exclusion list, so do not put a hyphen in a recipe tag you want to match.
- Many vanilla entities, the stone mill among them, also carry a `CraftRecipe` component, which is the recipe to build the object.
- Recipes tagged `AnySurfaceCraft` or `InHandCraft` need no bench of their own, but the chopping block bench also lists `AnySurfaceCraft`.
:::

:::facts
- **Entity blocks in `generated/entities`** 219
- **`CraftBench` components** 35, using 31 different tags
- **`CraftRecipe` components (build recipes)** 202
- **Component types the engine knows** 23
- **`tempNotWorking` folders in the 42.22 game files** 0
:::

## 1. An entity is a list of components

**An entity block is a name and a list of `component` blocks, and each component type does one job.**

The engine knows 23 component types, among them `UiConfig`, `SpriteConfig`, `CraftBench`, `CraftRecipe`, `FluidContainer`, `Resources` and `DryingCraftLogic`. :cite[(`zombie/entity/ComponentType.java:68-92`)] Counting the `component` lines in the vanilla entity scripts gives these.

| Component | Blocks in vanilla | What the stone mill and the forge show |
|---|---|---|
| `UiConfig` | 215 | `xuiSkin`, `entityStyle` and `uiEnabled`, which pick the window |
| `SpriteConfig` | 210 | the sprite names for each face of the placed object |
| `CraftRecipe` | 202 | the recipe that builds the bench, with the same keys as a `craftRecipe` |
| `CraftBench` | 35 | the `Recipes` list |
| `ContextMenuConfig` | 14 | not checked |
| `FluidContainer` | 11 | not checked |
| `CraftBenchSounds` | 9 | not checked |
| `WallCoveringConfig`, `SpriteOverlayConfig` | 8 each | not checked |
| `Resources`, `DryingCraftLogic` | 7 each | the drying racks: slot groups and a `Recipes` value |

Vanilla scripts under `generated/entities` use 11 of the 23 types, and none uses `CraftLogic`, which the engine also knows. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill.txt:5-44`, `media/scripts/generated/entities/agricultural/workstations/entity_Drying_Rack.txt:11-25`)]

The entity itself lives in `generated/entities/<subject>/workstations/`, and the separate `media/scripts/entities/` folder holds the window skins. :cite[(`media/scripts/generated/entities/blacksmith/workstations/entity_forge_i.txt:3`, `media/scripts/entities/blacksmith/workstations/entity_charcoal_burner_xuiSkin.txt:3-5`)]

## 2. How a bench picks its recipes

**The `Recipes` value of `CraftBench` is a tag query, and a recipe is shown when its tags meet the query.**

The bench loader reads the key `recipes` into a query string, and a bench with no value throws while the scripts finish loading. :cite[(`zombie/scripting/entity/components/crafting/CraftBenchScript.java:53-59`, `zombie/scripting/entity/components/crafting/CraftBenchScript.java:68-69`)] A recipe's own `Tags` value is split on `;` into its tags. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`)]

The query is read as a list to accept, then an optional list to refuse. Names before any `-` are separated by `;`, and names after the `-` are the refused ones. :cite[(`zombie/util/TaggedObjectManager.java:427-447`)] A recipe matches when its tags overlap the accept list and do not overlap the refuse list. :cite[(`zombie/util/TaggedObjectManager.java:281-285`)] Because the split is on `-`, a recipe tag that contains a hyphen cannot be asked for reliably.

## 3. The stone mill

**The stone mill is a complete small bench: a window, a sprite, a `CraftBench` and a build recipe.**

The bench lists two tags, and the recipes beside it in the same folder carry the second one. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill.txt:11-14`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:3-7`)]

```
entity Stone_Mill
{
    component UiConfig     { xuiSkin = default, entityStyle = ES_Stone_Mill, uiEnabled = true, }
    component CraftBench   { Recipes = Stone_Quern;Stone_Mill, }
    component SpriteConfig { ... }
    component CraftRecipe
    {
        timedAction = BuildCairn,  time = 50,  category = Farming,
        SkillRequired = Masonry:1,  xpAward = Masonry:10,
        inputs { item 1 [Base.StoneWheel], item 10 [Base.StoneBlock], ... }
    }
}
```

The file is shown shortened. Its `CraftRecipe` component lists seven input lines and asks for Masonry 1. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill.txt:25-43`)]

The recipe file beside it holds five recipes, `MillCornflour`, `MillCornmeal`, `MillFlour`, `MillSeeds` and `MillSunflowerSeeds`, and each one has `Tags = Stone_Mill,`. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:7`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:23`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:39`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:55`, `media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:71`)] Buildable benches in general are covered on [Building recipes by skill](/pz/build-42/engine/building-and-moveables/building-recipes-by-skill). The quern bench lists only `Stone_Quern`, so it shows the recipes with that tag and not the mill ones. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_quern.txt:11-13`)]

## 4. The tags vanilla benches use

**Vanilla's 35 `CraftBench` components use 31 different recipe tags.**

:::chips
- AdvancedForge
- AdvancedFurnace
- AnySurfaceCraft
- ChoppingBlock
- ChurnBucket
- CoffeeMachine
- DomeKiln
- Forge
- Furnace
- Grindstone
- HandPress
- Heckling
- KeyDuplicator
- KilnLarge
- KilnSmall
- MetalBandsaw
- PotteryBench
- PotteryWheel
- PrimitiveForge
- PrimitiveFurnace
- RemoveFlesh
- RemoveFur
- Rippling
- Scutching
- SpinningWheel
- Stone_Mill
- Stone_Quern
- TanLeather
- Toaster
- Weaving
- WoodCharcoal
:::

The drying racks bind recipes another way. Their `DryingCraftLogic` component has its own `Recipes` value, with `DryingRackGrain`, `DryingRackHerb`, `DryLeatherLarge`, `DryLeatherMedium` and `DryLeatherSmall`. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_Drying_Rack.txt:22-25`, `media/scripts/generated/entities/animals/workstations/entity_leather_prep.txt:135`, `media/scripts/generated/entities/animals/workstations/entity_leather_prep.txt:509`, `media/scripts/generated/entities/animals/workstations/entity_leather_prep.txt:867`)] This page does not check how that component matches recipes.

Three tags have a gap in vanilla. Eight recipes carry `StandingDrillPress`, but no `CraftBench` in the 42.22 entity scripts lists it. No recipe carries `KeyDuplicator` or `ChoppingBlock`, which benches do list. The chopping block bench still shows recipes through its `AnySurfaceCraft` entry.

Whether another route offers those recipes is not verified.

## 5. Recipes that need no bench of their own

**Recipes tagged `AnySurfaceCraft` or `InHandCraft` need no bench of their own, though one vanilla bench lists `AnySurfaceCraft`.**

`AnySurfaceCraft` and `InHandCraft` are recipe tags that do not name a workstation.

The chopping block's `Recipes` value is `AnySurfaceCraft;ChoppingBlock`, so that bench lists all of the `AnySurfaceCraft` recipes too. :cite[(`media/scripts/generated/entities/outdoors/entity_chopping_block.txt:13`)] The recipe tag list has an entry for each, the recipe class can ask for them, and the in-hand window asks for them. :cite[(`zombie/scripting/objects/CraftRecipeTag.java:13`, `zombie/scripting/objects/CraftRecipeTag.java:46`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1052-1060`, `media/lua/client/ISUI/Crafting/ISHandcraftWindow.lua:53`)] In the vanilla recipe and entity scripts, 425 tag entries are `AnySurfaceCraft` and 242 are `InHandCraft`. The [Tags](/pz/build-42/modding/items-and-scripting/tags) page covers these recipe tags in full.

[Tech tiers and production chains](/pz/build-42/modding/items-and-scripting/tech-tiers-and-production-chains) shows how forges and furnaces list the tags of the stations below them.

:::callout[How we know]{kind=proof}
The loading and matching rules were read from the 42.22 source. The component and tag counts were made over `media/scripts/generated/entities`. Not verified: what the components marked "not checked" do, how `DryingCraftLogic` matches its recipes, and whether the tags with a gap are offered some other way. Corrected from the old page: the `component CraftLogic` example is gone from vanilla (the engine still knows the type), the stone mill has a build recipe and sprites now, and the claim that forges and furnaces ship in a `tempNotWorking` folder is false for 42.22, where the folder does not exist in the game files and the forges are in `generated/entities/blacksmith/workstations`.
:::
