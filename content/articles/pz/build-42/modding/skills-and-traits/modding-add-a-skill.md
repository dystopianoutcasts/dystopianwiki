---
id: build-42-modding-add-a-skill
slug: modding-add-a-skill
title: 'Modding: add a SKILL'
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - skills
  - traits
  - professions
  - xp
  - craftrecipe-gating
excerpt: >-
  There are two layers: a script perk block (defines the perk + XP curve) and
  Lua/translation wiring so it shows up and can be trained.
last_updated: '2026-10-04'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
  - traits
  - professions-occupations
  - modding-add-a-trait
  - modding-add-a-profession
  - recipe-gating-in-b42-scripts
  - skill-ui
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
  - trait-modding-correction
---
# Modding: add a SKILL (perk)

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

There are two layers: a **script `perk` block** (defines the perk + XP curve) and
**Lua/translation** wiring so it shows up and can be trained.

> The pzwiki perk-creation page was not in this cache, so the `perk` block details
> below remain at their prior confidence. What the wiki DID confirm is the
> category set your perk should slot into (section 2): Passive, Agility, Combat,
> Crafting, Firearm, Survivalist (+ the Farming group).

### 8a. The `perk` script block

Historically placed in `media/perks.txt` beginning with `VERSION = 1,`. In B42's
versioned mod layout, put your media under the build folder (see 8c). Schema
**[CONFIRMED for fields; B42 path LIKELY]**:

```
VERSION = 1,

perk MyPerkCat            /* optional parent category */
{
    parent = None,
    translation = MyPerkCatName,
    passive = false,
    xp1 = 0, xp2 = 0, xp3 = 0, xp4 = 0, xp5 = 0,
    xp6 = 0, xp7 = 0, xp8 = 0, xp9 = 0, xp10 = 0,
}

perk MyPerk
{
    parent = MyPerkCat,       /* group it under a category */
    name = MyPerk,
    translation = MyPerkName,  /* IGUI translation key suffix */
    passive = false,           /* true = passive stat like Strength/Fitness */
    xp1 = 75, xp2 = 150, xp3 = 300, xp4 = 750, xp5 = 1500,
    xp6 = 3000, xp7 = 4500, xp8 = 6000, xp9 = 7500, xp10 = 9000,
}
```

- `parent` groups the perk in the UI; `None` for a top-level category.
- `passive = true` marks stat-style perks (no level actions, affects the passive
  panel) -- and remember passives use the far steeper XP curve (section 4).
- `xp1..xp10` are the per-level thresholds. The values above mirror the CONFIRMED
  vanilla *regular-skill* curve so a custom perk feels vanilla-paced.

### 8b. Translations

In `media/lua/shared/Translate/EN/IG_UI_EN.txt` (case of the folder matters on
Linux servers):

```
IGUI_perks_MyPerkCatName = "My Category",
IGUI_perks_MyPerkName = "My Skill",
```

### 8c. B42 folder layout (versioned)

B42 supports a single mod targeting multiple builds **[CONFIRMED via B42 mod
guide]**:

```
MyMod/
  common/media/            (shared across builds: lua, scripts, textures)
  42/
    mod.info
    poster.png
    media/                 (B42-specific: lua/shared, lua/client, lua/server, scripts, textures)
  41/                      (optional B41 support)
    mod.info
    media/
```

Load order: `lua/shared` -> `lua/client` -> `lua/server`, alphabetical within each
(by path, ignoring case; vanilla's files first, then each mod's). So never call
into another of your files at file scope: the one you need may not have loaded
yet. See [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

> **Proof:** Code. `zombie.Lua.LuaManager#LoadDirBase(String, boolean)` sorts each list with `Collections.sort(..., String.CASE_INSENSITIVE_ORDER)`. Build 42.21.0 (revision 4a0e9546ec).

### 8d. Reference it

Once loaded, the perk is available as `Perks.MyPerk`. Grant XP and query level via
the API in section 14. Gate recipes with `SkillRequired = MyPerk:3` and reward with
`xpAward = MyPerk:10` (section 11).

> **Caveat:** the `perks.txt` route is the long-standing B41 pattern and still the
> most-documented. The exact B42 media path (`common/media` vs `42/media`) and
> whether perks must live at `media/perks.txt` vs a subfolder should be validated
> against a live 42.20 load -- flagged in Gaps.

---

*Corrected 2026-10-04: files load alphabetically within each lua folder (LoadDirBase sorts by path, ignoring case); this is confirmed, not uncertain.*
