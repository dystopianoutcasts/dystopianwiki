---
id: build-42-recipe-gating-in-b42-scripts
slug: recipe-gating-in-b42-scripts
title: Recipe gating in B42 scripts
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
  B42 replaced the old recipe block with craftRecipe (the B41 recipe syntax is
  not used; you must rewrite for the new system). A craftRecipe can live in a
  module (item output) or inside an entity...
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
  - skill-ui
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
  - trait-modding-correction
---
# Recipe gating in B42 scripts (craftRecipe)

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B42 **replaced the old `recipe` block** with `craftRecipe` (the B41 `recipe`
syntax is not used; you must rewrite for the new system). A `craftRecipe` can live
in a `module` (item output) or inside an `entity` (building/workstation output).
**[CONFIRMED]**

Real vanilla 42.20 example (blacksmith armor), showing every gating field
**[CONFIRMED from source]**:

```
craftRecipe Forge_Codpiece
{
    time          = 400,
    SkillRequired = Blacksmith:4;Tailoring:3,   /* hard level gate, multi-skill */
    needTobeLearn = true,                        /* hidden until taught/auto-learned */
    timedAction   = MakingHammer_Surface,        /* animation/action used */
    xpAward       = Blacksmith:10;Tailoring:5,   /* XP granted on completion */
    tags          = Forge,                        /* required workstation/context tag */
    category      = Armor,
    AutoLearnAll  = Blacksmith:6,                 /* auto-known at Blacksmith 6 */
    inputs
    {
        item 3 tags[Charcoal],
        item 1 [Base.SmallSheetMetal],
        item 1 tags[SmithingHammer] mode:keep flags[Prop1;MayDegradeLight],
        item 1 tags[Tongs]          mode:keep flags[Prop2;MayDegradeLight],
        item 1 tags[LeatherStrips]  mode:destroy,
        /* ...more tools/materials... */
    }
    outputs
    {
        item 1 Base.Codpiece,
    }
}
```

Key fields for a modder:

- `SkillRequired = Skill:Level` (semicolon-separate for multiple).
- `xpAward = Skill:Amount` -- this is the "learn by doing" reward; add your custom
  perk here.
- `needTobeLearn = true` + `AutoLearnAll`/`AutoLearnAny` -- the knowledge gate.
- `tags = Forge` (etc.) -- ties the recipe to a **workstation/surface**; the B42
  workstation system is how many recipes are physically gated (need an anvil/forge,
  pottery wheel, loom, etc.).
- `timedAction` -- the action/animation; new B42 actions exist (e.g. `MakingHammer_Surface`).
- `inputs` use item counts, `[Base.Item]` exact ids or `tags[...]` tag matches,
  with modes (`keep`, `destroy`) and `flags` (`MayDegradeLight`, `Prop1/Prop2`).

The paired magazine (`ArmorMag4`) teaches `Forge_Codpiece` via `TeachedRecipes`,
letting you make it at `Blacksmith:4` before reaching the `Blacksmith:6` auto-learn.
