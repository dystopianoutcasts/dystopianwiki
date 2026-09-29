---
id: build-42-learning-paths
slug: learning-paths
title: 'Learning: learn-by-doing, skill books, recipe magazines and auto-learn'
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
  Two orthogonal things are "learned": skill LEVEL (your perk number) and recipe
  KNOWLEDGE (whether you know how to make a thing). B42 gates them separately.
last_updated: '2026-09-29'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - traits
  - professions-occupations
  - modding-add-a-skill
  - modding-add-a-trait
  - modding-add-a-profession
  - recipe-gating-in-b42-scripts
  - skill-ui
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
  - trait-modding-correction
---
# Learning: learn-by-doing, skill books, recipe magazines and auto-learn

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Two orthogonal things are "learned": **skill LEVEL** (your perk number) and
**recipe KNOWLEDGE** (whether you know how to make a thing). B42 gates them
separately.

### 5a. Skill level -- learn by doing (+ skill books to accelerate)

- **Learn by doing:** performing an action that carries an `xpAward` raises the
  matching perk. Most crafting skills level by "completing recipes, builds,
  dismantles, or repairs that award that perk." **[CONFIRMED]** (`xpAward` field).
- **Skill books accelerate, they do not unlock.** A skill book multiplies XP gain
  for one skill within a level band (see the multiplier table in section 4). Fields
  (from vanilla `items_literature_skill.txt`) **[CONFIRMED]**:
  - `SkillTrained` -- the internal perk name (e.g. `Carving`).
  - `LvlSkillTrained` -- the level at which this volume's boost begins (1, 3, 5, 7, 9).
  - `NumLevelsTrained` -- how many levels the boost covers (vanilla = 2 each).
  - `NumberOfPages` -- reading time / progress granularity.
  - There are 5 volumes per skill (I..V), each covering two levels, so a full set
    covers 1..10. A `...Set` item is a slipcase container. **[CONFIRMED via pzwiki
    Skill: "a book for every two levels of skill, totaling 5 volumes"]**
  - A book can only be read at the matching skill level (e.g. Vol. 2 requires level
    2 first). **[CONFIRMED via pzwiki Skill]**

### 5b. Recipe knowledge -- auto-learn vs. must-be-taught

A `craftRecipe` decides whether you know it via three fields **[CONFIRMED]**:

- `SkillRequired = Blacksmith:4` -- you cannot craft it below that level (can be
  multiple, semicolon-separated, e.g. `Blacksmith:4;Tailoring:3`).
- `needTobeLearn = true` -- the recipe is **hidden until taught**; you will not
  auto-learn it just by levelling.
- `AutoLearnAll = Blacksmith:6` (or `AutoLearnAny = ...`) -- the recipe is
  **auto-granted** once you meet the listed skill level(s). `AutoLearnAll` needs
  all listed skills; `AutoLearnAny` needs any one.

The interplay: many B42 recipes set `needTobeLearn = true` **and** an
`AutoLearnAll` a level or two above `SkillRequired`. So you can EITHER grind the
skill high enough to auto-learn it, OR find the recipe magazine to learn it early
(at the lower `SkillRequired`). In 42.x the devs deliberately relaxed auto-learn
thresholds (especially knapping / improvised weapons / carving) so most learnable
recipes auto-unlock about one level above their requirement. **[CONFIRMED via
changelog snippets]** Note the **Inventive** trait lowers the skill level required
to research recipes from items or to auto-learn them. **[CONFIRMED via pzwiki
Trait]**

### 5c. Recipe magazines -- permanent unlocks

Magazine items unlock recipes permanently via `TeachedRecipes`
(semicolon-separated recipe IDs). Unlike skill books they are **not consumed** and
do not train a skill; they just flip recipes to "known." **[CONFIRMED]**
(`items_literature_recipe.txt`). Example: `ArmorMag4` teaches
`Assemble_Shoulder_Armor;...;Forge_CoatOfPlates;Forge_Buckle`, matching the
`needTobeLearn` forge recipes in the blacksmith scripts. The **Illiterate** trait
blocks reading recipe magazines and skill books entirely. **[CONFIRMED via pzwiki
Trait]**

> Summary table:
> | Mechanism        | Affects        | Consumed? | Field(s)                              |
> |------------------|----------------|-----------|---------------------------------------|
> | Doing the action | skill level    | n/a       | `xpAward` on recipe/action            |
> | Skill book       | skill XP rate  | on read   | `SkillTrained`,`LvlSkillTrained`,`NumLevelsTrained` |
> | Recipe magazine  | recipe known   | no        | `TeachedRecipes`                      |
> | Auto-learn       | recipe known   | n/a       | `AutoLearnAll` / `AutoLearnAny`       |
> | Hard gate        | can craft?     | n/a       | `SkillRequired`, `needTobeLearn`      |
