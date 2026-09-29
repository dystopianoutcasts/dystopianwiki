---
id: build-42-new-crop
slug: new-crop
title: New crop
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  What you build: a plantable crop (seed item + growth behavior + farming
  recipes). This is YELLOW / partial -- the cached sources cover crop behavior
  thoroughly but do not contain the...
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
  - new-workstation
  - new-fluid
  - item-repair
  - evolved-recipe
  - new-trait
  - new-profession
  - new-skill
  - new-animal
  - lua-gameplay-mod
  - custom-ui
  - custom-moodle
  - sound-mod
  - radio-channel
  - translations
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# New crop

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a plantable crop (seed item + growth behavior + farming recipes). **This is YELLOW / partial** -- the cached sources cover crop *behavior* thoroughly but do not contain the crop-definition script schema itself (growth days, min water, seasons, hardiness, yield range).

**What is known** [doc 04 sec 13.1]:
- Crops key off item tags: `isseed` (plantable), plus `takedirt`, `digplow`, `scythe`. A new crop's seed item needs the `isseed` tag; herbs must be fresh to plant, vegetables fresh or stale. [CONFIRMED]
- A crop must supply the crop-table tuning (min water, growth days, planting/best/poor/bad months, cold/bad-month hardiness, per-disease immunity). **It is LIKELY these live in a crop data script/module, but the exact file/format is a GAP in the cached sources.**
- Farming recipes tie in via the `Farming` crafting category: seed handling (`CollectSeeds`, `OpenPacketOfSeeds`, `PutSeedsInPacket`, `MillSeeds`), drying (`DryX`), processing (`GrindFlour`, `PressOil`, `ThreshGrain`, `HeckleFlax`). Register a new crop's processing/drying recipes here as normal `craftRecipe` blocks (sec 6). [CONFIRMED these recipe IDs exist]

**Practical path today:** create the seed item with the `isseed` tag (sec 2), author the surrounding farming `craftRecipe`s (sec 6), and copy the crop-growth data format from a vanilla farming script in the `wink-/pzmcp` mirror (the schema is not in this cache -- verify before shipping).

**Gotchas.** XP is earned only by harvesting a crop **you planted** (health/2, +25 good / -15 bad, max 100); plowing/watering give zero XP. The farming skill is now `Agriculture`. Curses (poor/bad-month/winter planting) are permanent.

**Deep reference:** doc 04 sec 3-5 (crop behavior) + sec 13.1 (modding, partial). Crop script schema = GAP; consult vanilla `media/scripts` farming files.

---

<a name="16-lua-gameplay-mod"></a>
