---
id: build-42-skill-ui
slug: skill-ui
title: Skill UI
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
  The Skills tab lives in the health panel (heart icon, top-left) or via the L
  key. It groups perks by category, showing level bars and XP tooltips.
  [CONFIRMED via pzwiki Skill] Skill-name color...
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
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
  - trait-modding-correction
---
# Skill UI

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

- The Skills tab lives in the **health panel** (heart icon, top-left) or via the
  **L** key. It groups perks by category, showing level bars and XP tooltips.
  **[CONFIRMED via pzwiki Skill]**
- **Skill-name color** encodes the starting XP boost: gold/yellow (+125% band),
  white (+100%), light gray (+75%), dark gray (0%). Animated arrows on a skill
  indicate an active skill-book XP multiplier; hovering shows the current
  multiplier. **[CONFIRMED via pzwiki Skill]**
- The **crafting menu** was overhauled: recipes searchable by **input or output**
  item, choice of which ingredients to consume, craft-multiple, and right-click
  "craft when all conditions met" shortcuts. Recipe entries surface their
  `SkillRequired`/known state. **[CONFIRMED via official overview]**
- Passive perks (`passive = true`) render differently (stat-style) and use the
  steep passive XP curve. **[LIKELY]**
- For a modder, a custom perk with a proper `translation` and `parent` appears in
  the Skills panel automatically once the `perk` block loads. **[LIKELY]**
