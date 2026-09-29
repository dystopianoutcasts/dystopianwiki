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
  - item-scripts
  - tags
  - workstation
  - tech-tiers
  - timedaction
excerpt: >-
  [CONFIRMED] Workstations are entity blocks made of components. The
  crafting-relevant one is CraftBench, whose Recipes = ... value lists tags that
  recipes must carry to appear at this station.
last_updated: '2026-09-29'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - tech-tiers-and-production-chains
  - timedaction-blocks
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
# The workstation / entity system

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED]** Workstations are `entity` blocks made of **components**. The crafting-relevant one is `CraftBench`, whose `Recipes = ...` value lists tags that recipes must carry to appear at this station.

Real vanilla entity (from `entities/agricultural/workstations/entity_stone_mill.txt`) `[CONFIRMED]`:

```
entity Stone_Mill
{
    component UiConfig
    {
        xuiSkin      = default,
        entityStyle  = ES_Stone_Mill,
        uiEnabled    = true,
    }

    component CraftBench
    {
        Recipes = Stone_Quern;Stone_Mill,
    }
}
```

How binding works: the recipes in that same file carry `tags = Stone_Mill,`. When the player opens the Stone Mill, the game shows every `craftRecipe` whose `tags` intersect the entity's `CraftBench.Recipes` list (`Stone_Quern;Stone_Mill`). So **the recipe's `tags` field is the workstation key.** `[CONFIRMED]`

Other components seen (some commented-out / WIP in the shipped tree) `[CONFIRMED they appear; full schema UNCERTAIN]`:
- `component UiConfig` — which XUI skin / entity style / whether a UI opens.
- `component CraftBench { Recipes = ... }` — the recipe surface.
- `component Resources { group craft_inputs { Item@Input@100 } group craft_outputs { Item@Output@1 } }` — input/output slot config (appears commented in some files; used for stations that hold materials).
- `component CraftLogic { Recipes = ... }` — alternate/older logic container (seen commented).

**Workstation-binding tags observed:** `PrimitiveForge`, `Stone_Mill`, `Stone_Quern`, `ChurnBucket`, `Scutching`, `DryLeatherLarge/Medium/Small`, `TanLeather`. Recipes with `AnySurfaceCraft`/`InHandCraft` need no station.

**[NOTE]** A large set of forge/furnace/kiln entities ship under a `tempNotWorking/` folder in the vanilla tree (e.g. `entity_forge_i.txt`, `entity_charcoal_pit.txt`, `entity_arc_furnace.txt`) — evidence that some advanced stations were still being finalized around the stable cutoff. Check the shipped 42.20 files before depending on a specific advanced station. `[CONFIRMED folder exists; live status per-station UNCERTAIN]`
