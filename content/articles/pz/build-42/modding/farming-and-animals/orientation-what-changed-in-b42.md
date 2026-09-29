---
id: build-42-orientation-what-changed-in-b42
slug: orientation-what-changed-in-b42
title: 'Orientation: what changed in B42'
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
  Build 42 turned Project Zomboid's food loop from "loot until it runs out, then
  plant a few crops" into a genuine homesteading system. The major B42-era
  additions and renames relevant to this track:
last_updated: '2026-09-29'
related_articles:
  - the-three-farming-skills
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
# Orientation: what changed in B42

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Build 42 turned Project Zomboid's food loop from "loot until it runs out, then plant a few crops" into a genuine homesteading system. The major B42-era additions and renames relevant to this track:

- **Living, wandering animals with AI were added in Build 42.** [CONFIRMED] Cows, sheep, pigs, and chickens are the core husbandry animals, providing a renewable source of milk, hide, wool, etc. This is the flagship new system this document covers. The wiki explicitly notes this first iteration does not use Lemmy's advanced AI and has "very basic functionality," intended primarily to support B42's new crafting features. [CONFIRMED]
- **The farming skill was renamed to "Agriculture" in Build 42** (it was "farming" back in RC2.9). [CONFIRMED]
- **A dedicated "Animal Care" husbandry skill exists** (internal `skill_id=Husbandry`), separate from Agriculture and Butchering. [CONFIRMED]
- **The crop disease "Aphids" was renamed** -- it was originally "Devil's Water Fungi," changed in Build 42. [CONFIRMED]
- **Foraging was overhauled into a category/search-focus system** with per-biome spawn weights, weather/month modifiers, and skill-gated identification (e.g., Crops focus unlocks at Foraging 5). [CONFIRMED]
- **A new genetics/breed system** underpins animals -- two alleles per gene inherited from parents, dominant/recessive, inbreeding risk. [CONFIRMED]
- **New data/global tables for modders:** `AnimalDefinitions`, `RanchZoneDefinitions`, plus related `AnimalAvatarDefinition` and `AnimalPartsDefinitions`. [CONFIRMED for the first two; the latter two are referenced but not in the cached sources.]

> Note on source versions: the cached pages span 42.3.1 through 42.18.0 page-version stamps (harvest ~v42.19). B42 is now stable at 42.20; the mechanics below are the last-documented state. Numeric tuning values (weights, timers, chances) are the most likely things to have shifted between the cached revision and 42.20. Treat exact numbers as [LIKELY] unless independently re-verified in-game.
