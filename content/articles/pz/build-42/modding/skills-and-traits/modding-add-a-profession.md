---
id: build-42-modding-add-a-profession
slug: modding-add-a-profession
title: 'Modding: add a PROFESSION'
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
  B42 caveat -- verify before relying on the B41 route. The pzwiki
  profession-modding page was NOT part of this enrichment cache. Given that
  traits moved from TraitFactory (Lua) to a script...
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
  - recipe-gating-in-b42-scripts
  - skill-ui
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
  - trait-modding-correction
---
# Modding: add a PROFESSION

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

> **B42 caveat -- verify before relying on the B41 route.** The pzwiki
> profession-modding page was NOT part of this enrichment cache. Given that traits
> moved from `TraitFactory` (Lua) to a script `character_trait_definition` +
> registry in B42 (section 9), it is **[LIKELY]** professions moved the same way to
> a script-based `character_profession_definition` + `Profession`/registry
> registration. The `ProfessionFactory` Lua snippet below is the **B41** pattern
> and should be treated as **[UNCERTAIN]** for B42 until confirmed against a cached
> Occupation/profession-modding page or live source.

### 10a. B41-era `ProfessionFactory` route (verify for B42) [UNCERTAIN for B42]

```lua
local function addMyProfessions()
    -- addProfession(id, displayName, spriteName)
    local prof = ProfessionFactory.addProfession("blacksmith_pro",
        "Blacksmith", "Prof_Metalworker")

    prof:addXPBoost(Perks.Blacksmith, 3)       -- starting skill level
    prof:addXPBoost(Perks.MetalWelding, 1)
    prof:addFreeTrait("NightOwl")              -- bake in a trait
    prof:addFreeRecipe("Forge_Buckle")         -- grant recipes at spawn
    prof:setSpriteName("Prof_Metalworker")
end

Events.OnGameBoot.Add(addMyProfessions)
```

- If B42 mirrors the trait system, expect script fields analogous to the trait
  definition's `XPBoosts`, `GrantedTraits`/free-traits, and `GrantedRecipes`, plus
  a `Profession.register("mymod:myprof")`-style registry entry. **Confirm the
  exact `character_profession_definition` schema before shipping.**
- Translations (B41 convention): `IGUI_prof_blacksmith_pro = "Blacksmith"`.

> The FWolfe **Profession Framework** mod wraps profession creation in a
> declarative table format and is a useful maintained reference -- but confirm its
> current branch targets B42's definition system, not B41's factory.
