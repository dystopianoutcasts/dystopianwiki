---
id: build-42-item-repair
slug: item-repair
title: Item repair
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
  What you build: a repair definition letting a material (and optional skill)
  restore an item's condition.
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
# Item repair

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a repair definition letting a material (and optional skill) restore an item's condition.

**Files + placement:** `42/media/scripts/fixing.txt` inside a `module`.

**Skeleton.** (Field names CONFIRMED from `fixing.txt`; the `:`-delimited line syntax is attested only in the 41.78 wiki -- LIKELY still valid in B42; verify against a B42 vanilla `fixing` block.)

```
module yourModule
{
    fixing Fix Wood Axe
    {
        Require : WoodAxe,

        Fixer : Woodglue=2; Woodwork=2,     -- material=qty ; skill=level
        Fixer : DuctTape=2,
        Fixer : Glue=2,
    }
}
```

**Key fields:**

| Field | Meaning | Tag |
|-------|---------|-----|
| `Require` | Item(s) this block can repair (e.g. `Require : WoodAxe,`). | name CONFIRMED (fixing.txt) / syntax LIKELY |
| `Fixer` | A repair material + quantity, with optional skill (`Material=qty; Skill=level`). Multiple `Fixer` lines = alternative repair options. | name CONFIRMED / syntax LIKELY |
| `GlobalItem` | Additional item consumed to perform the repair (`GlobalItem : DuctTape=3,`). | name+type CONFIRMED / syntax LIKELY |
| `ConditionModifier` | Multiplier on condition restored (`ConditionModifier : 0.3,`). | name+type CONFIRMED / example LIKELY |

`Fixer` skill values (41.78 list, LIKELY): Axe, Blunt, LongBlade, SmallBlade, Spear, Maintenance, Woodwork, Cooking, Electricity, MetalWelding, Mechanics, Tailoring, etc. (use B42 renamed internal names where applicable, e.g. Welding/Blacksmithing).

**Gotchas.** The fixing ID can contain spaces (`fixing Fix Wood Axe`). The B42 `fixing.txt` confirms field names but not the `:`-delimited syntax (its wiki source is 41.78) -- verify against a B42 vanilla block. Use `Require` (not `Required`).

**Deep reference:** `_raw_scriptsdocs/fixing.txt`; `_raw_pzwiki_sources/08_creation_toolkit/Fixing_scripts.wiki.txt` (v41.78); doc 02.

---

<a name="10-evolved--cooking-recipe"></a>
