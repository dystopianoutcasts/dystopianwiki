---
id: build-42-agriculture-basics-from-seed-to-harvest
slug: agriculture-basics-from-seed-to-harvest
title: 'Agriculture basics: from seed to harvest'
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
  The core loop (all [CONFIRMED]): obtain seeds -> plow furrows -> sow -> tend
  (water/weed/fertilize) -> harvest.
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
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
# Agriculture basics: from seed to harvest

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The core loop (all [CONFIRMED]): obtain seeds -> plow furrows -> sow -> tend (water/weed/fertilize) -> harvest.

### 3.1 Obtaining seeds (5 routes)
1. **Seed packets** -- looted in barns, gardening shops, farm sheds; each packet holds 5 seeds.
2. **Seed extraction** -- some crops give seeds via tweezers or knives in the crafting menu; the vegetable is destroyed, and its freshness doesn't matter.
3. **Blooming crops** -- harvesting at the blooming stage yields seeds alongside vegetables; seed count = harvested vegetables / 2. A few crops only give seeds by extraction (flax additionally needs drying and rippling first).
4. **Crops themselves** -- items with the `isseed` item tag can be planted directly if fresh or stale (herbs must be fresh).
5. **Foraging** -- wild vegetables sometimes come with their seeds; the foraging window's search focus can be set to Crops, Vegetables, Fruits, or Wild Herbs.

### 3.2 Location rules [CONFIRMED]
- Crops must be **outside** for sunlight (exception: greenhouses). Sandbox can disable this.
- Crops must be at **ground level** by default; a sandbox option allows other levels.
- Furrows go only on **grass or dirt tiles** with no world objects (bushes, trees, stones) present. Plowing auto-removes weeds.
- No natural dirt/grass? Use a `takedirt`-tagged item (shovel + sack) -> "Take Dirt," then place "Dirt Floor" via the building menu.
- **Zombies** trample crops by walking over them; **players** can walk over crops safely. **Vehicles** damage crops. **Scything grass destroys crops** in the area of effect. Corpses/blood have no effect.

### 3.3 The physical steps [CONFIRMED]
- **Plowing:** an item with the `digplow` tag (trowel, shovel) -> context menu "Gardening" -> "Dig Furrows." Applies minor muscle strain.
- **Sowing:** click a furrow tile -> "Plowed Land" -> "Sow" -> pick seeds. Minor muscle strain. Watch the planting season (see Section 5).
- **Weeding:** as erosion progresses, weeds/bushes appear on crop tiles. Weeds are bad -- they halve the fertilizer time bonus, double water loss and disease chance, halve health gain / double health loss, and cancel fertilizer bonus yield.
- **Harvesting:** at growth phase 6 ("Ready to harvest") or 7 ("Blooming"). No tools needed; some crops accept a `scythe`-tagged tool. Yield is random between two crop-specific values. Some crops reset to phase 2 to regrow (multiple harvests). Minor muscle strain.
