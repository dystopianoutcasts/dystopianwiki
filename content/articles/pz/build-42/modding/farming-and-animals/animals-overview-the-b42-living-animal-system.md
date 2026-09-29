---
id: build-42-animals-overview-the-b42-living-animal-system
slug: animals-overview-the-b42-living-animal-system
title: 'Animals overview: the B42 living-animal system'
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
  B42 living animals are defined by a stack of per-animal-type properties. The
  wiki groups them conceptually [CONFIRMED]:
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - agriculture-basics-from-seed-to-harvest
  - crop-health-water-disease
  - seasons-curses-and-the-crop-table
  - foraging-in-b42
  - animal-genetics-breeds-and-weight
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-procedural-distributions
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# Animals overview: the B42 living-animal system

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B42 living animals are defined by a stack of per-animal-type properties. The wiki groups them conceptually [CONFIRMED]:

- **Livestock** -- the animal type (cow, sheep, pig, chicken...).
- **Breed** -- variants with unique properties (e.g. Angus = meat breed, Holstein = milk breed).
- **Sex** -- male/female, gating breeding, milking, etc.
- **Age** -- gates breeding (too young/too old), scales milk output, and eventually causes death of old age.
- **Size** -- min/max; larger animals give more resources.
- **Can be milked** -- e.g. cows; produce milk for a period after delivering a calf.
- **Flee humans** -- e.g. mouse runs away.
- **Can be attached** -- a rope can lead/tether certain animals.
- **Hunger / thirst** -- animals eat (amount depends on breed) from a trough; left hungry/thirsty they lose health and die.
- **Food types** -- which foods it can eat from a trough; some can graze grass if the trough is empty, but grow smaller.
- **Enclosure size** -- below a minimum, the animal won't grow as large, yielding fewer resources.

**Behavioral/lore facts [CONFIRMED]:**
- Animal noise attracts zombies, but zombies won't attack animals unless a Custom Sandbox option is set. Animals cannot be infected by the Knox virus (humans only); most animals flee approaching zombies.
- The debug/inspection info panel shows animal statistics (skill-gated by Animal Care).

**Husbandry animals (core B42):** cow, sheep, pig, chicken. **Also defined/spawnable:** turkey, rabbit; **wild/trapping/foraging:** deer, mouse, rat, raccoon, squirrel, bird. Planned/teased: garter snake, bears, multiple deer, elk. [CONFIRMED]
