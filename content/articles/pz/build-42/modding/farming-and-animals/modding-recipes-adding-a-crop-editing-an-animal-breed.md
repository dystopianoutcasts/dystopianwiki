---
id: build-42-modding-recipes-adding-a-crop-editing-an-animal-breed
slug: modding-recipes-adding-a-crop-editing-an-animal-breed
title: 'MODDING recipes: adding a crop / editing an animal breed'
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
  The cached farming sources describe crop behavior (seasons, water, disease,
  phases) and the crafting recipes that surround crops, but do not contain the
  crop script/data schema itself (the file...
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
  - modding-procedural-distributions
---
# MODDING recipes: adding a crop / editing an animal breed

> Source: 04_FARMING_FORAGING_ANIMALS.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 13.1 Adding a new crop [LIKELY / partial]
The cached farming sources describe crop *behavior* (seasons, water, disease, phases) and the crafting recipes that surround crops, but **do not contain the crop script/data schema itself** (the file that defines a crop's growth time, min water, seasons, hardiness, yield range, and `isseed` linkage). What we can state:
- Crops key off item tags: `isseed` (plantable), `takedirt`, `digplow`, `scythe`. [CONFIRMED] A new crop's seed item needs the `isseed` tag; herbs must be fresh to plant, vegetables fresh or stale.
- Crop tuning surfaces in the crop table (Section 5.4): min water level, growth days, planting/bad/best/poor months, cold/bad-month hardiness, and per-disease immunity. A new crop must supply those. [LIKELY that these live in a crop data script/module -- exact file/format is a GAP in the cached sources.]
- Farming crafting recipes tie in via the `Farming` crafting category (Section 2 / Farming_crafting): seed handling (`CollectSeeds`, `OpenPacketOfSeeds`, `PutSeedsInPacket`, `MillSeeds`), drying (`DryX` for each herb/grain), processing (`GrindFlour`, `PressOil`, `ThreshGrain`, `HeckleFlax`, etc.), and disease cures. Register a new crop's processing/drying recipes here. [CONFIRMED these recipe IDs exist]

### 13.2 Adding or editing an animal / breed [CONFIRMED workflow]
This is the well-documented path. To add a new animal:
1. Choose a unique `yourAnimalID`.
2. Define the **genome**: `AnimalDefinitions.genome[yourAnimalID] = { genes = {...} }` (reuse built-in gene names, add custom ones as needed).
3. Define the **stages**: `AnimalDefinitions.stages[yourAnimalID] = { stages = { baby, adultFemale, adultMale } }` with `ageToGrow`, `nextStage`, `nextStageMale`.
4. Define the **breeds**: `AnimalDefinitions.breeds[yourAnimalID] = { breeds = {...} }` with textures (in `media/textures/Body`), inventory icons, product items (`milkType`/`woolType`/`featherItem`), `forcedGenes` to specialize, and `sounds`.
5. Define one **animals[stageID]** stat block per stage, wiring `genes`/`stages`/`breeds` back to the tables above, setting `babyType`/`mate`, feeding multipliers, products, `carcassItem`, enclosure size, and behavior flags.
6. Spawn it on the map via a **ranch zone** (`RanchZoneDefinitions` + a `Ranch` zone, or `world:registerZone` on `OnLoadMapZones`) pointing `globalName` at `yourAnimalID`.

To **edit an existing breed** (e.g. retune milk output or add a breed): modify or add entries in `AnimalDefinitions.breeds["cow"].breeds`. The cleanest lever is `forcedGenes` -- e.g. to make a super-dairy cow breed, push `maxMilk`/`milkInc` high and `meatRatio` low, mirroring the Holstein example. Because breeds carry their own textures and icons, a texture-only reskin breed is entirely data-driven (no new model needed if you reuse `bodyModel`). Time values follow the `months * 30`, `years * 12 * 30` idiom. Remember `copyTable(...)` when a stage needs an independent copy of the shared breeds table.
