---
id: build-42-butchering-and-dead-animals
slug: butchering-and-dead-animals
title: Butchering and dead animals
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - ranch-zones
  - foraging
  - husbandry
excerpt: >-
  Butchering skill governs meat quality harvested from an animal; quality rises
  each level. [CONFIRMED] (Butchering recipes and detailed mechanics are not in
  the cached farming/animal sources -- see...
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - foraging-in-b42
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# Butchering and dead animals

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

- **Butchering skill** governs meat quality harvested from an animal; quality rises each level. [CONFIRMED] (Butchering recipes and detailed mechanics are not in the cached farming/animal sources -- see Gaps.)
- On death, an animal produces a **carcass item** (defined per animal via `carcassItem`, e.g. `Base.CorpseCow`, `Base.CorpseCalf`). [CONFIRMED]
- Butchering products flow from breed data: **`milkType`** (fluid script), **`woolType`** (shear item), **`featherItem`/`maxFeather`** (plucking), and meat governed by the **`meatRatio`** gene. Blood range comes from `minBlood`/`maxBlood`. [CONFIRMED]
- **Dead animals** as a foraging category (Section 6.1) are a separate, hidden source of small dead critters (dead bird/mouse/rabbit/rat/squirrel) found in the world; commensal rodents also spawn in containers. These are distinct from butchering your own livestock. [CONFIRMED]
- Leatherworking sits in the same **Farming crafting category** -- `CutUpLeather_*`, `TanLeather`, `DryLargeLeather`/`DryMediumLeather`/`DrySmallLeather`, `RemoveFlesh`, `RemoveFur` -- turning hides from butchered animals into usable leather. [CONFIRMED]
