---
id: build-42-sandbox-multiplayer-options
slug: sandbox-multiplayer-options
title: Sandbox & multiplayer options
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
  XP multipliers: global XpMultiplier plus (in B42) per-skill sandbox
  multipliers let servers tune leveling rates. [LIKELY] Starting skill /
  occupation behavior: sandbox controls exist for how much...
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
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
  - trait-modding-correction
---
# Sandbox & multiplayer options

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

- **XP multipliers:** global `XpMultiplier` plus (in B42) per-skill sandbox
  multipliers let servers tune leveling rates. **[LIKELY]**
- **Starting skill / occupation behavior:** sandbox controls exist for how much
  head start occupations give and for skill loss on death. **[UNCERTAIN -- verify
  exact 42.20 option names]**
- **Strength/Fitness XP boost toggle:** a sandbox setting controls whether
  Strength/Fitness show/apply the boost display (a known B41.78.16 bug showed the
  bonus even when disabled). **[CONFIRMED behavior exists via pzwiki; 42.20 status
  flagged for re-verify]**
- **Multiplayer:** perks, XP, and recipe-known state are per-character and
  server-authoritative. Custom perks/traits/professions must be present on both
  server and client (ship them in one mod loaded by both). Traits can be marked
  `DisabledInMultiplayer = true` in the script (section 9). XP grants from server
  Lua replicate to the client; `AddXP` on the client for a local player is the
  normal path. **[LIKELY]**
- New skills you add participate in the sandbox multiplier system automatically if
  they are real perks. **[LIKELY]**
