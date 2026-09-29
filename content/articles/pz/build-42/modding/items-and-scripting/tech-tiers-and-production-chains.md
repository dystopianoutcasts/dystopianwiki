---
id: build-42-tech-tiers-and-production-chains
slug: tech-tiers-and-production-chains
title: Tech tiers and production chains
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
  [CONFIRMED at a high level; exact taxonomy UNCERTAIN] B42 structures
  production as chains with tiered stations:
last_updated: '2026-09-29'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - timedaction-blocks
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
# Tech tiers and production chains

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED at a high level; exact taxonomy UNCERTAIN]** B42 structures production as chains with tiered stations:

- **Stone age / primitive:** grinding slab, stone quern, stone mill, cooking pit, drying racks, scutching board, heckle/ripple combs, simple loom — buildable from raw materials, gated by low skill.
- **Primitive forge (Blacksmith tier I):** recipes tagged `PrimitiveForge`, needing charcoal fuel + bar stock + hammer/tongs/punch tools; produce tools, nails, blades, armor.
- **Advanced / electric:** electric blower forges, arc furnace, hydraulic press, standing drill press, key duplicator — higher tier, some map-found only, some still WIP at stable (`tempNotWorking/`).

Production chains cross skills: e.g. **textiles** = harvest flax/hemp -> ripple/heckle comb -> scutching board (`ScutchFibre`) -> spinning wheel -> loom; **leather** = raw hide -> tan (`TanLeather`) -> dry (`DryLargeLeather`) -> cut (`CutUpLeather_*` -> LeatherStrips) -> sew armor; **metal** = ore -> crush -> smelt (bloom) -> forge bar stock -> forge tools/weapons/armor; **milling/food** = seeds -> stone mill (`MillFlour`) -> flour -> cooking.

Gating stacks three ways: **station** (recipe tag vs CraftBench), **skill** (`SkillRequired`), **knowledge** (`needTobeLearn` + magazine/research/auto-learn).
