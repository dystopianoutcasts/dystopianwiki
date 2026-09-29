---
id: build-42-new-profession
slug: new-profession
title: New profession
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
  What you build: a selectable occupation with a point cost, XP boosts, granted
  traits, and granted recipes.
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
# New profession

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a selectable occupation with a point cost, XP boosts, granted traits, and granted recipes.

**Files + placement:** register in `42/media/registries.lua` (`CharacterProfession.register("mymod:prof")`); define in `42/media/scripts/professions.txt`; translations in `UI_EN.txt`; icon referenced by `IconPathName`.

The ScriptsDocs `character_profession_definition.txt` ships a canonical example (reproduced verbatim); all fields CONFIRMED.

```
module YourModule
{
    character_profession_definition mymod:example_profession
    {
        CharacterProfession = mymod:example_profession,  -- links to registries id
        Cost                = -6,                         -- NEGATIVE removes points, positive adds
        UIName              = UI_prof_MetalWorker,
        UIDescription       = UI_profdesc_metalworker,
        IconPathName        = profession_metalworker,
        XPBoosts            = MetalWelding=4,             -- Skill=level ; separated
        GrantedTraits       = NimbleFingers;Brave,        -- trait ids ; separated
        GrantedRecipes      = Advanced_Forge;Blast_Furnace,
    }
}
```

| Field | Meaning | Tag |
|-------|---------|-----|
| `CharacterProfession` | The registries profession ID this links to. | CONFIRMED |
| `Cost` | Point cost; **negative removes points, positive adds**. | CONFIRMED |
| `UIName` / `UIDescription` | Translation keys (UI translation file). | CONFIRMED |
| `IconPathName` | Icon name/path (e.g. `profession_metalworker`). | CONFIRMED |
| `XPBoosts` | `Skill=level` pairs, `;`-separated. | CONFIRMED |
| `GrantedTraits` | `;`-separated trait IDs granted with the profession. | CONFIRMED |
| `GrantedRecipes` | `;`-separated `craftRecipe` IDs granted. | CONFIRMED |

**Gotchas.** Profession IDs **cannot contain spaces** (trait IDs can). Must be `.register()`-ed in registries.lua. Use B42 skill internal names in `XPBoosts`. Note the vanilla rename: "Unemployed" is now "Custom" occupation.

**Deep reference:** `_raw_scriptsdocs/character_profession_definition.txt`; doc 05 (professions).

---

<a name="13-new-skill--perk"></a>
