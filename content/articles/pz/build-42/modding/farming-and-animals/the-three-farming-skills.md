---
id: build-42-the-three-farming-skills
slug: the-three-farming-skills
title: The three farming skills
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
  B42 splits food production across three skills (all under the "Farming" skill
  group in the character sheet). [CONFIRMED]
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - foraging-in-b42
  - animals-overview-the-b42-living-animal-system
  - animal-genetics-breeds-and-weight
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# The three farming skills

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B42 splits food production across three skills (all under the "Farming" skill group in the character sheet). [CONFIRMED]

| Skill | Internal ID | What it does | Key XP source |
|---|---|---|---|
| **Agriculture** | `Farming` | More crop info on inspection; higher levels reduce curse chance, raise bonus-yield chance, boost initial health, disease reduction, and yield | Harvesting player-planted crops only |
| **Animal Care** | `Husbandry` | More animal info on inspection; increases resources harvested; reduces chance stressed animals break from milking/shearing | Milking, shearing, giving water, petting, collecting eggs |
| **Butchering** | (Butchering) | Quality of meat harvested from animals rises with level | Butchering animals |

**Agriculture leveling detail [CONFIRMED]:**
- Harvesting a crop *you planted yourself* is the ONLY gameplay XP source (plus starting bonuses and media). Plowing, sowing, weeding, watering, fertilizing give **zero** XP.
- XP per crop = crop health at harvest / 2. Good-condition crop adds +25; a badly cared-for crop subtracts 15. Max 100 XP per crop.
- Occupation: Farmer (+4 Agriculture). Trait: Gardener (+1). Fast Learner 130% XP rate, Slow Learner 70%.
- Per-level agriculture benefits (each level): -5% curse chance in poor months (from 50% down toward 5%); +5% bonus-yield chance (up to 95%) when planting in best month and/or fertilizing in phases 1-3; +1 initial crop health; +1 to disease-level reduction; +1 to yield.

**Animal Care leveling detail [CONFIRMED]:**
- XP gained by performing actions on animals: milking, shearing, giving water, petting, collecting eggs. (Wiki flags precise values as still-to-document.)
- Occupations: Farmer (+1), Rancher (+4 -- the husbandry specialist occupation). Traits affect XP rate only (Fast Learner 130%, Slow Learner 70%), not starting level.
- Skill books: Animal Care I-V ("A Tale of St. Francis" through "Wilds Tamed").
- Trivia caveat: as of the cached revision, none of the traits affect the *initial* Animal Care skill level. [CONFIRMED]

Both Agriculture and Animal Care recipes live in the **`Farming` crafting category** (recipes for agriculture, animal care, and leatherworking). [CONFIRMED]
