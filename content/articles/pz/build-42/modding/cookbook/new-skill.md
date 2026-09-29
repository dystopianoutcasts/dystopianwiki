---
id: build-42-new-skill
slug: new-skill
title: New skill or perk
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
  What you build: a brand-new skill/perk (its own XP curve and UI category)
  referenceable as Perks.MyPerk.
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
# New skill or perk

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a brand-new skill/perk (its own XP curve and UI category) referenceable as `Perks.MyPerk`.

**Files + placement:** `media/perks.txt` under the build folder (`42/media/perks.txt` -- the exact B42 subpath should be validated against a live load; LIKELY); category/name translations in `42/media/lua/shared/Translate/EN/IG_UI_EN.txt`.

Schema CONFIRMED for fields; the B42 media path is LIKELY (this is the long-standing B41 `perks.txt` route, still the most documented).

```
VERSION = 1,

perk MyPerkCat                 /* optional parent category */
{
    parent = None,
    translation = MyPerkCatName,
    passive = false,
    xp1 = 0, xp2 = 0, xp3 = 0, xp4 = 0, xp5 = 0,
    xp6 = 0, xp7 = 0, xp8 = 0, xp9 = 0, xp10 = 0,
}

perk MyPerk
{
    parent = MyPerkCat,        /* group under a category; None = top level */
    name = MyPerk,
    translation = MyPerkName,  /* IGUI translation key suffix */
    passive = false,           /* true = passive stat like Strength/Fitness (steeper curve) */
    xp1 = 75, xp2 = 150, xp3 = 300, xp4 = 750, xp5 = 1500,
    xp6 = 3000, xp7 = 4500, xp8 = 6000, xp9 = 7500, xp10 = 9000,
}
```

Translations:

```
IGUI_perks_MyPerkCatName = "My Category",
IGUI_perks_MyPerkName = "My Skill",
```

| Field | Meaning | Tag |
|-------|---------|-----|
| `parent` | Groups the perk in the UI; `None` for a top-level category. | CONFIRMED |
| `name` | Internal perk name -> `Perks.MyPerk`. | CONFIRMED |
| `translation` | IGUI key suffix for the display name. | CONFIRMED |
| `passive` | `true` = stat-style perk (passive panel, steeper XP). | CONFIRMED |
| `xp1..xp10` | Per-level XP thresholds (values above mirror the vanilla regular-skill curve). | CONFIRMED |

Reference it: gate recipes with `SkillRequired = MyPerk:3`, reward with `xpAward = MyPerk:10`; in Lua `player:getPerkLevel(Perks.MyPerk)` and `player:getXp():AddXP(Perks.MyPerk, 25)`. Engine-side, `PerkFactory` registers perks (parent, thresholds, passive); `PerkFactory.AddPerk(...)` overloads exist for programmatic creation (LIKELY -- verify signatures against a live client).

**Gotchas.** This is the one YELLOW item in the capability matrix: the field schema is CONFIRMED but the B42 media path (`media/perks.txt` vs a subfolder, `common/` vs `42/`) should be verified against a live 42.20 load. New B42 skills split Metalworking into `Welding`/`Blacksmithing` and renamed several -- match internal names.

**Deep reference:** doc 05 sec 8 (skills/perks) + sec 14 (XP API); `_raw_scriptsdocs/` has no dedicated perk file (perks.txt is not in ScriptsDocs).

---

<a name="14-new-animal--breed"></a>
