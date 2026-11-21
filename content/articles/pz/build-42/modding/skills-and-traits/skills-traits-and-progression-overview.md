---
id: build-42-skills-traits-and-progression-overview
slug: skills-traits-and-progression-overview
title: 'Skills, traits and progression'
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
  A map of the skills, traits and professions pages for Build 42.22: what each one answers, the key numbers in one place, and the order to read them in.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
  - trait-reference
  - professions-reading-them-and-what-they-unlock
  - modding-add-a-skill
  - modding-add-a-trait
  - modding-add-a-profession
  - recipe-gating-in-b42-scripts
  - skill-ui
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders new to the system](#1-start-here) | [modders adding a skill, trait or profession](#2-build-something) | [modders looking something up](#3-look-something-up)

:::callout[The 1-minute version]{kind=key}
- A skill is a perk with a level from 0 to 10. A trait and a profession are script blocks that give a character starting levels and recipes at creation.
- Skill level and recipe knowledge are separate. XP decides the level. A recipe is known when its name is in the character's list.
- XP is computed on your machine in single player and on the server in multiplayer. In multiplayer, a mod must grant XP on the server.
- Start with [The mental model](/pz/build-42/modding/skills-and-traits/the-mental-model), then pick the page for your job below.
:::

:::facts
- **Skills** 35, in 6 groups on the Skills tab
- **XP to level 10, normal skill** 32,775
- **XP to level 10, Strength or Fitness** 487,500
- **Skills with skill books** 24
- **Vanilla trait definitions** 97
- **Vanilla professions** 25
:::

## 1. Start here

**Read these three pages in order to get the model, the names and the changes from Build 41.**

- [The mental model](/pz/build-42/modding/skills-and-traits/the-mental-model): the three systems, how a character gets its first levels, and who decides XP.
- [The Build 42 skill list](/pz/build-42/modding/skills-and-traits/the-build-42-skill-list): the 35 skills, their groups, and the three names a skill can have.
- [B41 to B42 skill changes](/pz/build-42/modding/skills-and-traits/b41-b42-skill-changes): what a Build 41 skill mod has to change.

The 35, the 32,775 and the 487,500 are counted and summed from `PerkFactory.java`. :cite[(`zombie/characters/skills/PerkFactory.java:105-148`, `zombie/characters/skills/PerkFactory.java:314-325`)] The 24 books are the entries of the Lua `SkillBook` table. :cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-196`)]

## 2. Build something

**These pages are the how-tos for adding a skill, a trait or a profession to a mod.**

- [Modding: add a skill](/pz/build-42/modding/skills-and-traits/modding-add-a-skill)
- [Modding: add a trait](/pz/build-42/modding/skills-and-traits/modding-add-a-trait)
- [Modding: add a profession](/pz/build-42/modding/skills-and-traits/modding-add-a-profession)

A mod skill lives in a `media/perks.txt` file. A trait is a `character_trait_definition` block, and a profession is a `character_profession_definition` block. :cite[(`zombie/characters/skills/CustomPerks.java:32-69`, `zombie/scripting/objects/CharacterTraitDefinitionScript.java:49-100`, `zombie/scripting/objects/CharacterProfessionDefinitionScript.java:45-88`)]

## 3. Look something up

**These pages answer one question each, and each one links to the code it read.**

- [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers): the cost of each level, the order of the multipliers, the calls that grant XP, and who runs them.
- [Learning: learn-by-doing, skill books, recipe magazines and auto-learn](/pz/build-42/modding/skills-and-traits/learning-paths): how skill level and recipe knowledge are gained.
- [Vanilla trait reference](/pz/build-42/modding/skills-and-traits/trait-reference): every vanilla trait.
- [Professions: reading them and what they unlock](/pz/build-42/modding/skills-and-traits/professions-reading-them-and-what-they-unlock): every vanilla profession.
- [Recipe gating in B42 scripts](/pz/build-42/modding/skills-and-traits/recipe-gating-in-b42-scripts)
- [Skill UI](/pz/build-42/modding/skills-and-traits/skill-ui)
- [Sandbox and multiplayer options](/pz/build-42/modding/skills-and-traits/sandbox-multiplayer-options)
- [The XP-grant and skill-query Lua API](/pz/build-42/modding/skills-and-traits/the-xp-grant-skill-query-lua-api)
- [Concrete B42 examples](/pz/build-42/modding/skills-and-traits/concrete-b42-examples)

The player-sized version of the XP numbers is [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level). The recipe side is [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning), and the farming skills are in [The three farming skills](/pz/build-42/modding/farming-and-animals/the-three-farming-skills).

:::callout[How we know]{kind=proof}
The skill, book and level counts come from a script over the 42.22 Java and Lua cited above. The trait and profession counts (97 and 25) are counts of `character_trait_definition` and `character_profession_definition` blocks in the 42.22 scripts, the same counts as on the two reference pages. This page is a map, so each linked page holds its own sources and its own list of what we did not test.
:::
