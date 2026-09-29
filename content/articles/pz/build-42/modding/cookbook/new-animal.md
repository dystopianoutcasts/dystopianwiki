---
id: build-42-new-animal
slug: new-animal
title: New animal or breed
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
  What you build: a new husbandry animal (or a breed variant of an existing one)
  via the AnimalDefinitions global Lua table.
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
  - new-crop
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
# New animal or breed

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a new husbandry animal (or a breed variant of an existing one) via the `AnimalDefinitions` global Lua table.

**Files + placement:** Lua under `42/media/lua/` (shared or server) populating `AnimalDefinitions`; textures under `media/textures/Body`; body model/animset assets in `common/media`. This is **data-in-Lua**, not a `.txt` script. [CONFIRMED -- doc 04 sec 10]

`AnimalDefinitions` has four sub-tables keyed by your animal/stage IDs:
- `AnimalDefinitions.animals[stageID]` -- per-stage stat block (most parameters live here; ~120 params).
- `AnimalDefinitions.stages[animalID]` -- the lifecycle stage graph.
- `AnimalDefinitions.breeds[animalID]` -- breed variants (textures, products, `forcedGenes`, sounds).
- `AnimalDefinitions.genome[animalID]` -- the gene list.

**Workflow** [CONFIRMED -- doc 04 sec 13.2]: pick a unique `animalID`; define `genome`, `stages`, `breeds`; then one `animals[stageID]` stat block per life stage wiring `genes`/`stages`/`breeds` back to those tables and setting `babyType`/`mate`, feeding, products, `carcassItem`, enclosure, behavior; finally spawn via a ranch zone.

```lua
-- 42/media/lua/shared/MyAnimal_Definitions.lua
AnimalDefinitions.genome["myrabbit"] = { genes = AnimalDefinitions.genome["rabbit"].genes }

AnimalDefinitions.stages["myrabbit"] = {
    stages = {
        babyrabbit = { ageToGrow = 3, nextStage = "myrabbit", nextStageMale = "mybuck" },
        -- adult stages listed here...
    }
}

AnimalDefinitions.breeds["myrabbit"] = {
    breeds = {
        ["albino"] = {
            texture = "Rabbit_Albino",           -- media/textures/Body
            invIcon = "Rabbit_Albino",
            forcedGenes = { maxWeight = {0.6, 0.8} },  -- specialize the breed
            sounds = {
                idle = { name = "AnimalVoiceRabbitIdle", intervalMin = 15, intervalMax = 30, slot = "voice" },
            },
        },
    }
}

AnimalDefinitions.animals["myrabbit"] = {          -- adult female (base stage)
    bodyModel = "Rabbit_Body",
    animset   = "rabbit",
    female = true,
    genes  = AnimalDefinitions.genome["myrabbit"].genes,
    stages = AnimalDefinitions.stages["myrabbit"].stages,
    breeds = AnimalDefinitions.breeds["myrabbit"].breeds,
    babyType = "babyrabbit",
    mate = "mybuck",
    minAge = 3 * 30,                                -- days: months*30, years*12*30
    carcassItem = "Base.RabbitCarcass",
    -- feeding, products, behavior flags...
}
```

**Key parameter groups** (all names CONFIRMED from the AnimalDefinitions page; most meanings LIKELY from the name since the wiki gives no description): model/rendering (`bodyModel`, `bodyModelSkel`, `textureSkeleton`, `animset`, `modelscript`); size/weight (`animalSize`, `minWeight`, `maxWeight`); lifecycle (`stages`, `breeds`, `genes`, `babyType`, `babyNbr`, `minAge`, `minAgeForBaby`, `female`, `male`, `mate`, `pregnantPeriod`); feeding (`hungerMultiplier`, `thirstMultiplier`, `eatGrass`, `canBeFeedByHand`); products (`canBeMilked` [CONFIRMED description], `maxMilk`, `milkInc`, `maxWool`, `eggsPerDay`, `eggType`, `carcassItem`, `meatRatio`); behavior (`wild`, `canBeDomesticated`, `attackBack`, `baseDmg`); interaction (`canBePet`, `canBePicked`, `addTrackingXp`).

Breed sounds live at `breeds[id].breeds["breed"].sounds`; valid sound IDs: `attack death fallover idle pain petting pick_up pick_up_corpse put_down put_down_corpse run stressed walkBack walkFront`. [CONFIRMED]

**Spawn it -- ranch zone** [CONFIRMED -- doc 04 sec 11]:

```lua
Events.OnLoadMapZones.Add(function()
    getWorld():registerZone("myrabbit", "Ranch", 1350, 8563, 0, 10, 10)
end)
```

**To edit an existing breed:** add/modify entries in `AnimalDefinitions.breeds["cow"].breeds`; `forcedGenes` is the cleanest lever (push `maxMilk`/`milkInc` high + `meatRatio` low for a dairy breed). Use `copyTable(...)` when a stage needs its own mutable copy of the shared breeds table.

**Gotchas.** Time is in days (`months*30`, `years*12*30`). Female is the base stage (`female=true`), male is a separate `mate` stage. ~110 of ~120 `animals` params are name-only in the cache -- confirm meanings against decompiled Java/in-game. `ageToGrow` time unit is officially "unknown." `AnimalAvatarDefinition`/`AnimalPartsDefinitions` are referenced but not in the cache.

**Deep reference:** doc 04 (`04_FARMING_FORAGING_ANIMALS.md`) sec 10-11, 13.2 (this is the authoritative source -- AnimalDefinitions is not in ScriptsDocs).

---

<a name="15-new-crop"></a>
