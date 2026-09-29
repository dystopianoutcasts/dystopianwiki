---
id: build-42-xp-level-thresholds-multipliers
slug: xp-level-thresholds-multipliers
title: 'XP, level thresholds & multipliers'
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
  Thresholds. Each perk defines ten XP thresholds xp1..xp10. The exact vanilla
  curves are now [CONFIRMED via pzwiki Skill, revid 1436755] (the wiki
  attributes the specific figures to build 41.78.16...
last_updated: '2026-09-29'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
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
# XP, level thresholds & multipliers

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Thresholds.** Each perk defines ten XP thresholds `xp1..xp10`. The exact vanilla
curves are now **[CONFIRMED via pzwiki Skill, revid 1436755]** (the wiki attributes
the specific figures to build 41.78.16 and the page carries an `{{Outdated}}`
banner on categorization, so the numbers are strong but not guaranteed unchanged
for every skill in 42.20 -- see gaps).

**Regular skills (per-level, NOT cumulative):**

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|-------|---|---|---|---|---|---|---|---|---|----|
| XP to reach | 75 | 150 | 300 | 750 | 1500 | 3000 | 4500 | 6000 | 7500 | 9000 |
| Cumulative  | 75 | 225 | 525 | 1275 | 2775 | 5775 | 10275 | 16275 | 23775 | 32775 |

**Passive skills (Strength, Fitness) -- far steeper, per-level:**

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|-------|---|---|---|---|---|---|---|---|---|----|
| XP to reach | 1500 | 3000 | 6000 | 9000 | 18000 | 30000 | 60000 | 90000 | 120000 | 150000 |

Strength/Fitness require dramatically more XP (level 1 Strength = 1,500 XP vs.
level 1 Carpentry = 75 XP) and are **exempt from the starting-skill XP-boost
system** below. **[CONFIRMED via pzwiki Skill]**

**The starting-skill XP boost (now CONFIRMED, was [LIKELY]).** Any skill that
starts above level 0 (from a profession or trait) gets a **permanent XP
multiplier** on that skill. The in-game *displayed* percentages are a documented
bug and should be disregarded; the *actual* gains are **[CONFIRMED via pzwiki Skill
+ Trait]**:

| Starting level | Displayed (buggy) | Actual XP gain | Relative rate |
|----------------|-------------------|----------------|---------------|
| 0              | N/A               | 25%            | 1x            |
| 1              | +75%              | 100%           | 4x            |
| 2              | +100%             | 133%           | 5.32x         |
| 3 or higher    | +125%             | 166%           | 6.64x         |

The boost is reflected permanently in the color of the skill's name: gold/yellow
= +125% band, white = +100%, light gray = +75%, dark gray = 0% (default).
**Exceptions [CONFIRMED via pzwiki Skill]:**
- **Running** uses 100% / 125% / 133% / 166% for starting levels 0/1/2/3+.
- **Aiming** and **Reloading** suffer an overall 0.37037x multiplier once the
  character reaches level 5 in that skill.
- Strength and Fitness get the same XP regardless of starting level (no boost).

**Skill books** apply a separate, large XP multiplier for their skill while the
book's level band is active. The multiplier scales up in 10% steps as you read
(each 10% read = that fraction of the book's max multiplier; sub-1.0 results are
floored to 1x). Per-band max multipliers **[CONFIRMED via pzwiki Skill]**:

| Level band | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|-----------|---|---|---|---|---|---|---|---|---|----|
| Book multiplier | 3 | 3 | 5 | 5 | 8 | 8 | 12 | 12 | 16 | 16 |

These stack conceptually with the starting-skill boost. Books exist only for
**Crafting** and **Survivalist** skills, plus the exceptions **Long Blade**,
**Aiming**, and **Reloading**. **[CONFIRMED via pzwiki Skill]**

**Global XP rate** is further scaled by the sandbox `XpMultiplier` option (and
per-skill sandbox multipliers). **[LIKELY]**

**XP is granted** by actions (`xpAward` on a craftRecipe, combat hits, timed
actions) and by Lua (`getXp():AddXP`). See sections 11 and 14.
