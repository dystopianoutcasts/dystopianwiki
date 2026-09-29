---
id: build-42-concrete-b42-examples
slug: concrete-b42-examples
title: Concrete B42 examples
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
excerpt: 'A) Gate + reward a recipe on a vanilla B42 skill:'
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
  - the-xp-grant-skill-query-lua-api
  - trait-modding-correction
---
# Concrete B42 examples (copy-ready)

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**A) Gate + reward a recipe on a vanilla B42 skill:**
```
craftRecipe Carve_MyTotem
{
    time          = 220,
    SkillRequired = Carving:3,
    xpAward       = Carving:30,
    needTobeLearn = true,
    AutoLearnAll  = Carving:5,
    timedAction   = Whittling,
    tags          = Knife,
    category      = Carving,
    inputs  { item 1 tags[SharpKnife] mode:keep flags[MayDegradeLight], item 1 [Base.Log], }
    outputs { item 1 Base.MyTotem, }
}
```

**B) A skill book for a custom or vanilla skill (5-volume pattern):**
```
item BookMyCarving3
{
    DisplayName      = Carving III: "Advanced Whittling",
    DisplayCategory  = SkillBook,
    Type             = Literature,
    SkillTrained     = Carving,
    LvlSkillTrained  = 5,
    NumLevelsTrained = 2,
    NumberOfPages    = 300,
    Weight           = 1,
}
```

**C) A recipe magazine that permanently unlocks recipes:**
```
item MyForgeMag
{
    DisplayName    = Forgecraft Monthly (My Recipes),
    DisplayCategory = SkillBook,
    Type           = Literature,
    TeachedRecipes = Carve_MyTotem;Forge_MyBlade,
    Weight         = 0.5,
    Tags           = Magazine,
}
```

**D) Grant XP for a custom action in Lua:**
```lua
local function onFinishMyAction(player)
    player:getXp():AddXP(Perks.Carving, 15)
end
```

**E) A B42 custom trait (script + registry + Lua), end to end:**
```lua
--- media/registries.lua
_MyModRegistries = {}
_MyModRegistries.traits = {
    Woodsy = CharacterTrait.register("mymod:woodsy")
}
```
```lua
--- media/lua/shared/MyMod/Registries.lua
return _MyModRegistries
```
```
/* media/scripts/traits_mymod.txt */
module MyMod {
    character_trait_definition mymod:woodsy {
        CharacterTrait = mymod:woodsy,
        UIName = UI_trait_mymod:woodsy,
        Cost = 4,
        UIDescription = UI_trait_mymod:woodsy_Desc,
        IsProfessionTrait = false,
        DisabledInMultiplayer = false,
        XPBoosts = Carving=1;Foraging=1,
        GrantedRecipes = Carve_MyTotem,
        MutuallyExclusiveTraits = base:allthumbs,
    }
}
```
```lua
--- media/lua/shared/Translate/EN/UI_EN.txt  (getText keys)
UI_trait_mymod:woodsy = "Woodsman",
UI_trait_mymod:woodsy_Desc = "Faster Carving XP. Knows basic carving recipes.",
```
Icon: `media/ui/Traits/trait_woodsy.png` (18x18).
