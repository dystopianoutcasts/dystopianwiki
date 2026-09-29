---
id: build-42-the-xp-grant-skill-query-lua-api
slug: the-xp-grant-skill-query-lua-api
title: The XP-grant / skill-query Lua API
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
  Confirmed from the LuaDocs mirror + recipe-script docs. [CONFIRMED] unless
  noted.
last_updated: '2026-09-29'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
  - traits
  - professions-occupations
  - modding-add-a-skill
  - modding-add-a-trait
  - modding-add-a-profession
  - recipe-gating-in-b42-scripts
  - skill-ui
  - sandbox-multiplayer-options
  - concrete-b42-examples
  - trait-modding-correction
---
# The XP-grant / skill-query Lua API

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Confirmed from the LuaDocs mirror + recipe-script docs. **[CONFIRMED]** unless noted.

**Query level / XP:**
```lua
local lvl = player:getPerkLevel(Perks.Blacksmith)   -- integer 0..10
local xp  = player:getXp():getXP(Perks.Blacksmith)  -- raw XP in that perk
```

**Grant XP (learn by doing, from Lua):**
```lua
player:getXp():AddXP(Perks.Blacksmith, 25)          -- add 25 XP to Blacksmithing
```
`AddXP(perk, amount)` adds `amount` XP after multipliers; it triggers the `AddXP`
event and can trigger `LevelPerk`. With the CONFIRMED regular-skill curve (75 XP
to level 1), 25 XP is ~1/3 of a first level -- consistent with `amount` being raw
XP, not "skill points." **[CONFIRMED method / units now corroborated by the
CONFIRMED XP table]**

**Check for a modded trait (B42 registry pattern):**
```lua
local MyModRegistries = require("MyMod/Registries")
if player:hasTrait(MyModRegistries.traits.MyTrait) then ... end
```
**[CONFIRMED via pzwiki "Creating a trait mod"]**

**Events you can hook:**
- `Events.AddXP.Add(fn)` -> `fn(character, perk, amount)` -- fires after a local
  character gains perk XP (unless the source suppressed the event). **[CONFIRMED]**
- `Events.LevelPerk.Add(fn)` -> `fn(character, perk, level, increased)` -- fires
  after a perk level changes up or down. **[CONFIRMED]**
- `Events.OnNewGame.Add(fn)` -> `fn(player, ...)` -- fires per new character
  (spawn logic, trait-driven grants). **[CONFIRMED via pzwiki]**

**The `Perks` enum:** access any perk (vanilla or modded) as `Perks.Name`; the set
of available perks is enumerable via the `PerkFactory.Perks` class. Modded perks
defined by your `perk` block are addressable the same way. **[CONFIRMED]**

**Factory (engine side):** `PerkFactory` registers perks (parent skill, translation,
passive flag, xp1..xp10). Script `perk` blocks are the modder-facing front door to
it; direct `PerkFactory.AddPerk(...)` calls exist in the API for programmatic
creation. **[LIKELY -- official javadoc page returned 403 during research]**
