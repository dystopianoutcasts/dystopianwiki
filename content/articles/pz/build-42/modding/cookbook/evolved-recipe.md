---
id: build-42-evolved-recipe
slug: evolved-recipe
title: Evolved or cooking recipe
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
  What you build: an evolved recipe (sandwich/soup/etc.) that combines a base
  item with opt-in ingredients into a result, optionally cookable.
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
# Evolved or cooking recipe

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** an evolved recipe (sandwich/soup/etc.) that combines a base item with opt-in ingredients into a result, optionally cookable.

**Files + placement:** `42/media/scripts/` inside a `module`; recipe name in `Recipes.json`; each ingredient item opts in via its own `EvolvedRecipe` parameter.

**Skeleton** (CONFIRMED verbatim from `evolvedrecipe.txt`; wiki v42.19 corroborates):

```
module Base
{
    evolvedrecipe Sandwich
    {
        BaseItem              = Base.BreadSlices,
        MaxItems              = 4,
        ResultItem            = Base.Sandwich,
        Name                  = Make Sandwich,
        CanAddSpicesEmpty     = true,
        AddIngredientIfCooked = true,
        Template              = Sandwich,
        Cookable              = true,
    }

    item Processedcheese
    {
        EvolvedRecipe = Sandwich:5;Burger:5;Hotdog:5,   -- RecipeName:quantity ; on the INGREDIENT item
    }
}
```

**Key fields** (all CONFIRMED from `evolvedrecipe.txt`):

| Field | Meaning | Tag |
|-------|---------|-----|
| `BaseItem` | The base item combined with ingredients. | CONFIRMED |
| `ResultItem` | The produced item. | CONFIRMED |
| `MaxItems` | Max ingredients (min 1); unique spices are exempt. | CONFIRMED |
| `Name` | Translation key (`Recipes.json`) for the display name. | CONFIRMED |
| `Cookable` | If present (`true`), `ResultItem` becomes cookable. **Setting `false` does NOT disable it -- remove the line entirely.** | CONFIRMED |
| `AddIngredientIfCooked` | Whether ingredients can be added after cooking. | CONFIRMED |
| `CanAddSpicesEmpty` | Allow spices before any ingredients. | CONFIRMED |
| `MinimumWater` | Min water in `BaseItem` for validity (default 0.0). | CONFIRMED |
| `Template` | Shares an ingredient across all evolved recipes with the same template (cup/bottle/jar variants). | CONFIRMED |
| `AddIngredientSound` | Sound on adding an ingredient (default `AddItemInBeverage`). | CONFIRMED |

Ingredient opt-in: on the ingredient **item**, `EvolvedRecipe = RecipeName:quantity;...`. [CONFIRMED]

**Gotchas.** `Cookable = false` does not disable cooking -- delete the line. The recipe ID can have spaces. Ingredients declare participation on themselves, not in the recipe block.

**Deep reference:** `_raw_scriptsdocs/evolvedrecipe.txt`; `_raw_pzwiki_sources/08_creation_toolkit/Evolvedrecipe_scripts.wiki.txt` (v42.19); doc 02.

---

<a name="11-new-trait"></a>
