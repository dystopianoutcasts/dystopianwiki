---
id: build-42-new-trait
slug: new-trait
title: New trait
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
  What you build: a selectable character-creation trait with a point cost, XP
  boosts, and granted recipes.
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
# New trait

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a selectable character-creation trait with a point cost, XP boosts, and granted recipes.

**Files + placement:** register in `42/media/registries.lua`; define in `42/media/scripts/traits.txt`; translations in `42/media/lua/shared/Translate/EN/UI_EN.txt`; an 18x18 icon under `media/textures/` (or `media/ui/Traits/`).

**Three steps** (all CONFIRMED -- pzwiki *Creating a trait mod* rev 1387543; `character_trait_definition.txt`): (1) `CharacterTrait.register("mymod:trait")` in registries.lua; (2) the script below; (3) optional Lua for custom behavior.

```
module YourModule
{
    character_trait_definition mymod:NimbleFingers
    {
        IsProfessionTrait       = false,            -- Required
        DisabledInMultiplayer   = false,            -- Required
        Cost                    = -4,               -- Required; NEGATIVE gives points, positive takes
        CharacterTrait          = mymod:NimbleFingers,  -- Required; links to the registries id
        UIName                  = UI_trait_NimbleFingers,
        UIDescription           = UI_traitdesc_NimbleFingers,
        MutuallyExclusiveTraits = ClumsyTrait;AllThumbs,
        XPBoosts                = Lockpicking=2;Tailoring=1,   -- Skill=level ; separated
        GrantedRecipes          = CreateBobbyPin;PickLock,     -- craftRecipe ids ; separated
        Texture                 = media/textures/NimbleFingers.png,
    }
}
```

| Field | Meaning | Tag |
|-------|---------|-----|
| `IsProfessionTrait` | Required. If true, only available via a profession that grants it. | CONFIRMED |
| `DisabledInMultiplayer` | Required. Disabled in MP if true. | CONFIRMED |
| `Cost` | Required. Point cost; **negative GIVES points, positive TAKES**. | CONFIRMED |
| `CharacterTrait` | Required. The registries trait ID this links to. | CONFIRMED |
| `UIName` / `UIDescription` | Required. Translation keys (in the UI translation file). | CONFIRMED |
| `MutuallyExclusiveTraits` | `;`-separated trait IDs that can't be picked together. | CONFIRMED |
| `XPBoosts` | `Skill=level` pairs, `;`-separated (e.g. `Axe=1;Blunt=1`). | CONFIRMED |
| `GrantedRecipes` | `;`-separated `craftRecipe` IDs learned when the trait is chosen. | CONFIRMED |
| `Texture` | Path to the trait's icon PNG. | CONFIRMED |

**Gotchas.** The trait must be `.register()`-ed in registries.lua or the `CharacterTrait` link is dangling. Cost sign is inverted from intuition (negative = beneficial-costing / gives points). Use the new B42 skill internal names in `XPBoosts` (e.g. `Blacksmithing`, `Welding`, `Knapping`, `Agriculture`, `Electrical` -- see doc 05). The old B41 `TraitFactory` Lua route is gone.

**Deep reference:** `_raw_scriptsdocs/character_trait_definition.txt`; doc 05 sec 9 (traits) + doc 01 sec 6 (registries).

---

<a name="12-new-profession"></a>
