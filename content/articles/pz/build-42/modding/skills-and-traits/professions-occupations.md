---
id: build-42-professions-occupations
slug: professions-occupations
title: Professions / occupations
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
  Design shift (official). Occupations were reworked to give higher starting
  skills and adjusted point costs, so you "feel like a professional from day one
  instead of an apprentice." Combined with...
last_updated: '2026-09-29'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - learning-paths
  - traits
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
# Professions / occupations (B42 changes + new ones)

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Design shift (official).** Occupations were reworked to give **higher starting
skills** and adjusted point costs, so you "feel like a professional from day one
instead of an apprentice." Combined with the starting-skill XP boost (section 4),
your occupation both starts you higher and levels that line faster. **[CONFIRMED
intent / LIKELY specifics]**

**Occupation-confirmed facts (from the Trait page occupation-exclusive table)
[CONFIRMED via pzwiki Trait]:** Veteran (Desensitized), Lumberjack (Ax-pert),
Burglar (Burglar trait), **Blacksmith** occupation (+1 Maintenance, +2
Blacksmithing via its Blacksmith Knowledge trait), Chef (Keen Cook), Mechanic (+3
Mechanics, repair all vehicles), Security Guard (Night Owl). The existence of a
**Blacksmith occupation** is now confirmed by its occupation trait.

**Concrete examples [LIKELY unless noted]:**
- **Carpenter** -- starts with higher Carpentry than TV shows can even teach.
- **Construction Worker** -- Blunt split across Long Blunt and Short Blunt (tools).
- **Mechanic** -- +3 Mechanics and can repair all vehicle types without magazines
  **[CONFIRMED via pzwiki Trait]**.

**New occupations in B42/42.20 [LIKELY]:** trade-flavored jobs supporting the
crafting + animals systems (Blacksmith is confirmed; Rancher/Artisan-style jobs
appear in secondary guides). Exact 42.20 occupation roster with starting levels,
costs, free traits, and free recipes is **[UNCERTAIN]** -- the pzwiki Occupation
page was NOT part of this enrichment cache; verify in the live creator or a cached
Occupation page.

Professions grant: starting skill levels (XP), free traits, and (sometimes) free
recipes. In B42 the authoring route almost certainly mirrors the trait system's
move to a script definition (see section 10 caveat).
