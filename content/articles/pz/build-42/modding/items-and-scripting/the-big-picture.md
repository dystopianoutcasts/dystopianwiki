---
id: build-42-the-big-picture
slug: the-big-picture
title: The big picture
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - tags
  - workstation
  - tech-tiers
  - timedaction
excerpt: >-
  [CONFIRMED] B42 is a crafting/production overhaul first, everything-else
  second. The headline shift for a scripter:
last_updated: '2026-09-29'
related_articles:
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - timedaction-blocks
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
# The big picture

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED]** B42 is a crafting/production overhaul first, everything-else second. The headline shift for a scripter:

- **A whole new recipe block, `craftRecipe`, replaces the old `recipe` block** for the modern crafting menu. The legacy `recipe` block still parses for some cases, but the vanilla game moved essentially all crafting to `craftRecipe`. **[BREAKING]**
- **Recipes are now tag-driven, not item-name-driven.** Instead of naming a specific item as an ingredient, you match any item carrying a tag (e.g. `tags[SharpKnife]`), so mod items automatically slot into vanilla recipes if they carry the right tags. `[CONFIRMED]`
- **Crafting is tied to workstations ("entities" / CraftBench).** Many recipes only appear when you are at the right workstation, which is itself an `entity` script with a `CraftBench` component whose `Recipes = ...` list is matched against each recipe's `tags`. `[CONFIRMED]`
- **A real fluid system** replaces most of B41's separate "full/empty/partial" item variants. Fluids are first-class: defined in `fluid` blocks, stored in items with a `FluidContainer` component, and consumed/produced in recipes with `-fluid` / `+fluid` lines. `[CONFIRMED]`
- **Production is tiered** ("tech tiers"): stone-age -> primitive forge -> advanced/electric stations, gating recipes by workstation tier plus skill plus learned knowledge. `[CONFIRMED for tiering existing; exact tier taxonomy UNCERTAIN]`
- **Learning is layered:** skill books set an XP band multiplier (they do NOT teach recipes), recipe *magazines* teach specific recipes (`TeachedRecipes` on the item), recipes can be `AutoLearn`ed at a skill level, and some are learned by *researching/disassembling* an item (`ResearchableRecipes`). `[CONFIRMED]`

New skills accompany the overhaul (Blacksmith/metalworking, Pottery, Masonry, Carving, Flintknapping, Tailoring/Textiles, etc.). Old "Carpentry"/"Metalworking" now sit alongside a wider skill tree. `[CONFIRMED that new skills exist; full list UNCERTAIN]`
