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
  - tags
  - workstation
  - tech-tiers
  - timedaction
excerpt: '[CONFIRMED / standard PZ mechanics]'
last_updated: '2026-09-29'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - timedaction-blocks
  - testing-loop-and-common-load-errors
  - master-checklist
---
# Overriding / patching vanilla

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED / standard PZ mechanics]**

- **Redefining an existing ID** (same `module Base` + same `item`/`craftRecipe` name) in a mod loaded after vanilla **overrides** it. Load order (mod list order + `require` in `mod.info`) decides who wins. Last loaded wins.
- **Prefer additive over override:** because ingredients are tags, the cleanest B42 integration is to (a) add your items with the right vanilla `Tags` so they slot into existing recipes, and (b) add NEW `craftRecipe`s tagged to the appropriate station — no vanilla edits needed. This survives vanilla updates far better than overriding recipe blocks.
- **Adding recipes to a vanilla station:** give your recipe a `tags = <StationTag>` that matches the vanilla entity's `CraftBench.Recipes` list (e.g. `tags = PrimitiveForge,`). No need to touch the entity.
- **Teaching your recipe:** add a magazine item with `TeachedRecipes = YourRecipeId`, or set `AutoLearnAll`/`AutoLearnAny`, or put `ResearchableRecipes` on a relevant item.
- **Distributing your magazine/loot:** handled separately in `distributions`/`proceduraldistributions` Lua, not in the script `.txt` (out of scope here). `[CONFIRMED it's separate; details out of scope]`
