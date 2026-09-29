---
id: build-42-modding-procedural-distributions
slug: modding-procedural-distributions
title: 'MODDING: procedural distributions'
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
  Relevant because farming/animal mods often add seeds, produce, feed, or animal
  products to world loot. ProceduralDistributions governs container loot.
  [CONFIRMED]
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
  - butchering-and-dead-animals
  - modding-the-animaldefinitions-global-table
  - modding-ranch-zones
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
# MODDING: procedural distributions (loot)

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Relevant because farming/animal mods often add seeds, produce, feed, or animal products to world loot. `ProceduralDistributions` governs container loot. [CONFIRMED]

### 12.1 How it works [CONFIRMED]
- Containers roll from distribution lists on load (or respawn if sandbox allows).
- Each distribution has `rolls` and an `items` list of alternating `"ItemName", chance` pairs. **The chance value is NOT a weight and NOT a percentage** -- base your numbers on existing vanilla entries.
- `junk` sub-table: ignores zombie density, x1.4 chance multiplier.
- `OnFillContainer` fires when loot spawns, letting you modify/add items.
- Vanilla file: `media/lua/server/Items/ProceduralDistributions.lua`; entries go in `ProceduralDistributions.list`.

Structure:
```lua
ProceduralDistributions.list = {
    distributionName = {
        rolls = 3,
        items = { "Item1", 10, "Item2", 5 },
        junk  = { rolls = 1, items = { } }
    },
}
```

### 12.2 Distribution tags [CONFIRMED]
`ignoreZombieDensity`, `isShop` (when false: can be a stash, drainables get random uses, weapons/condition items can spawn degraded, bags get contents), `stashChance`, `canBurn` (food burnt/cooked 25%), `isWorn`/`isTrash` (degraded condition, food rots/ages, clothing dirty/bloody/holed at differing rates), `isRotten`, `bags`, `maxMap` (limits an item to a max count -- UNSURE), `onlyOne` (DEPRECATED).

### 12.3 Adding your loot [CONFIRMED]
Insert into `media/lua/server`. Note: items from a non-`Base` module must be prefixed (`MyMod.MyItem`). The naive way:
```lua
table.insert(ProceduralDistributions.list["ListName"].items, "YourItem")
table.insert(ProceduralDistributions.list["ListName"].items, 0.5)
```
The recommended way is a single table looped through one `table.insert` (the wiki gives a cached-and-looped example inserting both `items` and `junk`).

**Design warning [CONFIRMED]:** adding entries raises the mean loot count in a container (the "bloat" problem seen in big music/gun/clothing mods). Preferred solutions: use one item with swappable variant data instead of many items, or spawn a dummy item and swap it via `OnFillContainer`. Blindly lowering your item's chance is a band-aid. Generic clutter lives in `ClutterTables` (`Distribution_*Junk.lua`) and bags in `Distribution_BagsAndContainers.lua`. `LootZed`/`PZTools` help inspect distributions.
