---
id: build-42-the-mental-model
slug: the-mental-model
title: The mental model
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
  Project Zomboid calls skill lines perks internally, even though the character
  screen labels them "Skills." Two distinct systems meet at character creation:
last_updated: '2026-09-29'
related_articles:
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
  - concrete-b42-examples
  - trait-modding-correction
---
# The mental model (start here)

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Project Zomboid calls skill lines **perks** internally, even though the character
screen labels them "Skills." Two distinct systems meet at character creation:

- **Skills / perks** -- levelled 0..10 by earning XP during play (e.g. `Carpentry`,
  `Strength`, `Tracking`). Defined by `perk` script blocks; queried and modified
  through the `Perks` enum and `IsoGameCharacter:getXp()`.
- **Traits** -- point-costed picks in the character creator (plus a few granted
  free by your occupation). They can carry starting-skill XP boosts, free recipes,
  and mutual exclusions.
- **Professions / occupations** -- the job you pick; grants starting skill levels,
  free traits, and sometimes free recipes.

Build 42's headline change is a **complete crafting rework**: the single old
"crafting" surface became a whole family of trade skills fed by workstations, and
recipe knowledge is now gated by a mix of skill level (auto-learn) and found
literature. That is the through-line for everything below. **[CONFIRMED]**
