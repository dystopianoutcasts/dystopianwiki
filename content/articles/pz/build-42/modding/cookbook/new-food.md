---
id: build-42-new-food
slug: new-food
title: New food
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
  What you build: an edible item with nutrition, freshness, and (optionally)
  cooking behavior.
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
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
# New food

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** an edible item with nutrition, freshness, and (optionally) cooking behavior.

**Files + placement:** same as a normal item (`42/media/scripts/items.txt`), plus optional rotten/cooked icon variants (`Item_Foo_Rotten.png`, `Item_Foo_Cooked.png`).

**Skeleton.**

```
module yourModule
{
    item CannedBeansOpen
    {
        ItemType          = base:food,
        Weight            = 0.4,
        Icon              = CannedBeansOpen,
        HungerChange      = -30,      -- negative reduces hunger (100 = max)
        ThirstChange      = -5,
        Calories          = 340,
        Carbohydrates     = 60,
        Proteins          = 20,
        Lipids            = 4,
        DaysFresh         = 3,
        DaysTotallyRotten = 6,
    }
}
```

**Key fields** (all CONFIRMED as `item.txt` schema parameters). The food-exclusive params (only loaded for `base:food`): `BadInMicrowave`, `Calories`, `CannedFood`, `Carbohydrates`, `DangerousUncooked`, `DaysFresh`, `DaysTotallyRotten`, `Lipids`, `Packaged`, `Proteins`, `RemoveNegativeEffectOnCooked`, `ReplaceOnRotten`, `Spice`.

| Field | Meaning | Tag |
|-------|---------|-----|
| `HungerChange` / `ThirstChange` | Stat deltas on eating; negative reduces the need (100 = max). | CONFIRMED |
| `Calories` / `Carbohydrates` / `Proteins` / `Lipids` | Nutrition stats; positive raises them, affecting weight. | CONFIRMED |
| `DaysFresh` / `DaysTotallyRotten` | In-game days to spoil / fully rot (default 1000000000 = never). | CONFIRMED |
| `IsCookable` | Marks the food cookable. | CONFIRMED |
| `MinutesToCook` / `MinutesToBurn` | Cook time / burn time (`MinutesToBurn` must be > `MinutesToCook`; default 120). | CONFIRMED |
| `DangerousUncooked` | Food poisoning if eaten raw. | CONFIRMED |
| `CannedFood` | Marks canned; changes spawn + item type. | CONFIRMED |
| `RemoveNegativeEffectOnCooked` | Removes negative thirst/unhappiness/boredom when cooked. | CONFIRMED |
| `UnhappyChange` / `StressChange` / `BoredomChange` | Consumable mood deltas. | CONFIRMED |
| `Alcoholic` / `AlcoholPower`, `Poison`, `FoodType`, `Spice` | Alcohol / poison / classification. | CONFIRMED |

Icon variants: suffix files `...Rotten`/`Spoiled`, `...Cooked`, `...Overdone`/`Burnt` auto-swap. [CONFIRMED]

**Gotchas.** Note `BoredomChange` DOES exist on food items (unlike on fluids, sec 8). Cooking needs `IsCookable = true` and sane `MinutesToCook`/`MinutesToBurn`. For evolved/combined dishes see sec 10.

**Deep reference:** `_raw_scriptsdocs/item.txt` (base:food section); doc 02.

---

<a name="4-new-weapon"></a>
