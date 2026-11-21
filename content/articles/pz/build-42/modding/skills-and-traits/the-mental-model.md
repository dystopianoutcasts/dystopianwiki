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
  Start here. In 42.22 a skill is a perk with 0 to 10 levels, a trait and a profession are script blocks that give a character its starting levels and recipes, and the server decides XP.
last_updated: '2026-11-15'
related_articles:
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
  - modding-add-a-skill
  - modding-add-a-trait
  - modding-add-a-profession
  - trait-reference
  - professions-reading-them-and-what-they-unlock
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- The game calls a skill a perk. The character screen shows it as a skill. A perk has a level from 0 to 10, and XP decides the level.
- Vanilla perks are registered in Java. A mod adds a perk in a `media/perks.txt` file.
- A trait and a profession are script blocks, not perks. At character creation they give starting skill levels (`XPBoosts`), recipes (`GrantedRecipes`) and, for a profession, traits (`GrantedTraits`).
- A starting level also sets an XP speed for that skill for the rest of the game.
- Skill level and recipe knowledge are separate records. A level comes from XP, and a recipe is known when its name is in the character's list.
- In single player the game computes XP on your machine, and on a dedicated server the server computes it.
:::

:::facts
- **Skills** 35, in 6 groups on the Skills tab
- **Level range** 0 to 10
- **Characters start with** Fitness 5 and Strength 5, plus what traits and the profession give
- **Starting-level boost is capped at** 3 (which means "3 or more")
:::

:::flow[From the character creator to a skill level]
- Pick a profession and traits
- Their XPBoosts add up per skill
- The character is created with those levels
- The starting level sets the XP speed
- Play adds XP and the level follows
:::

## 1. Three systems meet at character creation

**Skills are perks that earn levels by XP, while traits and professions are definitions that start a character with levels and recipes.**

A skill is a `PerkFactory.Perk`, such as `Strength` or `Tracking`, and the Lua `Perks` table holds the vanilla ones and any mod ones. Carpentry is `Perks.Woodwork` in code and `Carpentry` on screen. :cite[(`zombie/characters/skills/PerkFactory.java:335-382`, `zombie/characters/skills/CustomPerks.java:71-77`)] A character's XP object is `IsoGameCharacter:getXp()`, and `getPerkLevel(perk)` returns the level. :cite[(`zombie/characters/IsoGameCharacter.java:2851`, `zombie/characters/IsoGameCharacter.java:4800-4803`)] The full list is in [The Build 42 skill list](/pz/build-42/modding/skills-and-traits/the-build-42-skill-list).

The two script block names are `character_trait_definition` and `character_profession_definition`. :cite[(`zombie/scripting/ScriptType.java:55-56`)] 

A trait block carries a cost, starting-skill boosts, free recipes and exclusions. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:49-100`)] A profession block carries a cost, granted recipes, granted traits and starting-skill boosts. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:45-88`)] The trait list is in [Vanilla trait reference](/pz/build-42/modding/skills-and-traits/trait-reference), and the professions are in [Professions: reading them and what they unlock](/pz/build-42/modding/skills-and-traits/professions-reading-them-and-what-they-unlock). The how-tos are [add a trait](/pz/build-42/modding/skills-and-traits/modding-add-a-trait), [add a profession](/pz/build-42/modding/skills-and-traits/modding-add-a-profession) and [add a skill](/pz/build-42/modding/skills-and-traits/modding-add-a-skill).

## 2. How a character gets its first levels

**At creation, the engine adds up every `XPBoosts` value for each skill and levels the skill up that many times.**

`applyTraits` starts Fitness and Strength at 5, adds the `XPBoosts` of each trait and the profession's boosts, clamps each total to 0 to 10, and levels the skill that many times. It then stores a boost value of at most 3 for the skill. :cite[(`zombie/characters/IsoGameCharacter.java:11551-11608`, `zombie/characters/SurvivorDesc.java:153-156`)] The stored value is the XP speed for the rest of the game: x0.25 for a start at 0, x1.0 for 1, x1.33 for 2 and x1.66 for 3 or more, with Running, Strength and Fitness treated differently. :cite[(`zombie/characters/IsoGameCharacter.java:17810-17832`)] The rule is the same for a skill your profession gives you and one a trait gives you.

A trait added or removed later changes the stored boost by its `XPBoosts` amount. :cite[(`zombie/characters/IsoGameCharacter.java:11527-11549`)] The details, and the multipliers that follow, are in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

## 3. Who decides XP and levels

**The Lua `addXp` function computes XP on your machine in single player and on the server in multiplayer, and a multiplayer client receives the result.**

In single player the Lua `addXp` function calls `AddXP` on your machine. On a dedicated server it calls the server's grant function. On a multiplayer client it does nothing. :cite[(`zombie/Lua/LuaManager.java:11855-11867`, `zombie/network/GameServer.java:1892-1902`)]

The server then sends each client the whole XP record about once a second. :cite[(`zombie/network/NetworkPlayerManager.java:25-43`, `zombie/network/packets/PlayerXpPacket.java:40-64`)] A mod that grants XP has to do it on the server.

## 4. Skill level and recipe knowledge

**A skill level and a known recipe are separate records, and a level teaches a recipe only where a rule says so.**

A recipe is known when it does not need learning or its name is in the character's list. :cite[(`zombie/characters/IsoGameCharacter.java:11720-11731`)] A level teaches a recipe through an `AutoLearn` key on that recipe, or through a rule in vanilla's Lua for a few named recipes. A magazine teaches another way. Whether a known recipe can be crafted is a separate check, `validateHasRequiredSkill`, of its required levels. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeManager.java:367-384`)] [Learning](/pz/build-42/modding/skills-and-traits/learning-paths) walks through the three routes, and [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning) shows the recipe side.

## 5. Which page to read next

**Pick the page that matches the job.**

| If you want to | Read |
|---|---|
| Know which skills exist and what they are called | [The Build 42 skill list](/pz/build-42/modding/skills-and-traits/the-build-42-skill-list) |
| See what changed from Build 41 | [B41 to B42 skill changes](/pz/build-42/modding/skills-and-traits/b41-b42-skill-changes) |
| Work with XP and multipliers | [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers) |
| Understand books, magazines and auto-learn | [Learning](/pz/build-42/modding/skills-and-traits/learning-paths) |
| Know the player's numbers | [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level) |

:::callout[How we know]{kind=proof}
Every statement above is read from the 42.22 Java and Lua in the lines cited, and the counts come from a script over `PerkFactory.java`. We did not start a character in a game.

Dropped from the older page: the statement that Build 42's headline change is "a complete crafting rework" in which "the single old crafting surface became a whole family of trade skills". The code shows 12 skills under Crafting, and no "old crafting surface" is in the capture, so we cannot support the comparison. The claim that perks are "defined by `perk` script blocks" is corrected: only mod perks use `perk` blocks, and they live in `media/perks.txt`; vanilla perks are in Java. Not tested: the creation screen itself, and how a mod trait that is added later reaches a server.
:::
