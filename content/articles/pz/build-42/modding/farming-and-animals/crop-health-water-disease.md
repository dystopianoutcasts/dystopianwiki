---
id: build-42-crop-health-water-disease
slug: crop-health-water-disease
title: 'Crop health, water, disease'
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
  Crops start ~50 health, modified by moon phase (below). Range 0-100; 0 kills
  the crop. Updated every 3 hours. Every 10 health above 50 at harvest = +1
  extra vegetable.
last_updated: '2026-09-29'
related_articles:
  - orientation-what-changed-in-b42
  - the-three-farming-skills
  - agriculture-basics-from-seed-to-harvest
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
# Crop health, water, disease (intermediate)

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 4.1 Health [CONFIRMED]
- Crops start ~50 health, modified by moon phase (below). Range 0-100; 0 kills the crop. Updated every 3 hours.
- **Every 10 health above 50 at harvest = +1 extra vegetable.**

| Health value | Name |
|---|---|
| 0-25 | Dying |
| 26-50 | Sickly |
| 51-60 | Healthy |
| 61-80 | Verdant |
| 81-100 | Flourishing |

**Moon phase initial health [CONFIRMED]:** Ascending 47-53; Full 57-64; Descending 37-44.

**Weather effect on health [CONFIRMED]:** Sunny +1; Not sunny +0.25; Temp below 10 deg C -0.25 (cold-hardy crops are immune to the cold penalty).

### 4.2 Water [CONFIRMED]
Water a crop in 10-unit increments with a fluid container (watering can, backpack sprayer) via context menu. Rain adds water by intensity. A newly planted crop starts at water level 0.

| Water level | Name |
|---|---|
| 0-29 | Parched |
| 30-59 | Dry |
| 60-69 | Thirsty |
| 70-89 | Fine |
| 90-100 | Well watered |

Each crop has a **minimum water level** (see crop table). Effects:
- At/above minimum: +0.4 health every 3 hours.
- 1-10% below minimum: growth delayed 1 hour per point below.
- 10-30% below minimum: growth halted, -0.2 health every 3 hours.
- 30%+ below minimum: -0.5 health every 3 hours.
- Water level 0: crop dries out and dies.
- Any level below minimum: higher disease chance, and existing disease persists longer.
- Info window shows water; at Agriculture 3 the hover tooltip shows it (color-coded); at Agriculture 4 a bar graphic appears. **Overwatering exists in code but is currently unused.** [CONFIRMED]

### 4.3 Fertilizing [CONFIRMED]
- Fertilizer OR compost raises health and cuts growth time; can combine.
- First use per growth phase: removes 40 hours of the current phase (20 if weeds present; if less than 40h remain, it jumps to next phase and extra hours are lost) and adds +10 health.
- In phases 1-3, fertilizer can trigger bonus yield (unless cursed or weedy).
- **Overuse penalty differs by material:**
  - **Fertilizer** used again in a phase: no speed/health gain, -25 health each subsequent use, AND used 3+ times it **curses** the crop.
  - **Compost** used again: no benefit but never harms the crop.
- No benefit in winter or at growth phase 6/7.
- Compost is made in a composter (build needs Carpentry 3, or found in backyards) from stale/rotten food and/or poppies; ~2 in-game weeks to break down (sandbox-adjustable), collected with a sack.

### 4.4 Diseases [CONFIRMED]
Four diseases: **mildew, pest flies, slugs, aphids.**
- Disease is rolled on reaching a new growth phase. Base 2% chance. Bonus yield halves it; weeds or cursed status doubles it. Sandbox "plant resilience" shifts the odds. (An unused function would add +1% per point below minimum water.)
- **Spreads to adjacent crops** (1 tile any direction), checked once per diseased neighbor, at each crop's own chance.
- No pest flies / slugs / aphids in winter or at temps <=10 deg C.
- Untreated, disease level rises every 2 hours: +0.5 (mildew/flies/slugs, well watered), +1 (mildew/flies/slugs, underwatered), +1 (aphids, well watered).

| Disease level | Effect |
|---|---|
| 10-29 | Growth delayed |
| 30-59 | Growth stops |
| 60+ | Crop dies on reaching next phase |
| Any aphids or slugs | -1 vegetable yield per 10 disease points |
| Any pest flies | -1 extra water point per 10 disease points |

- Some crops are immune to specific diseases; at phase 3+ an immune crop even protects non-immune neighbors from that disease.
- **Cures:** mildew, pest flies, and aphids cures are craftable (need Farmer occupation OR Gardener trait OR having read Magazine: Kentucky Farmer - June 1993, plus a gardening spray can). Recipes: `MakeMildewCure`, `MakeFliesCureFromChewingTobacco`, `MakeFliesCureFromCigarettes`, `MakeFliesCureFromLooseTobacco`, `MakeAphidsCure`. Slugs need looted **slug repellent**; flies can also use insect repellent; aphids can be reduced by deliberate dehydration (-2 aphids per 2h when below needed water). Disease for flies/slugs/aphids also drops during winter.
- **Unused mechanics** exist for crop threats by moths, rabbits, and deer. [CONFIRMED as unused]
