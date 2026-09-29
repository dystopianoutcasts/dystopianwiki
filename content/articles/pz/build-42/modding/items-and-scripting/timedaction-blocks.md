---
id: build-42-timedaction-blocks
slug: timedaction-blocks
title: timedAction blocks
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
  [CONFIRMED] timedAction is both a reference on a recipe (timedAction =
  MakingHammer_Surface) and its own script block type that defines the
  animation, hand props, sound, and player impact of an...
last_updated: '2026-09-29'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
# `timedAction` blocks

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED]** `timedAction` is both a *reference* on a recipe (`timedAction = MakingHammer_Surface`) and its own script block type that defines the animation, hand props, sound, and player impact of an action. Recipes point at a timedAction ID; the block controls how the crafting animation looks and what it does to the character.

Values seen referenced by vanilla recipes: `Making`, `MakingHammer_Surface`, `UseStoneQuern`, `TanLeatherBarrel`, `SharpenStake`, `OpenBeerBottle`, `OpenChampagne`, `OpenPopCan`, `UncorkBottle`, `SawLogs`, `UseStoneQuern`.

For most mod recipes you can reuse an existing vanilla `timedAction` ID (e.g. `Making` for a generic craft, `MakingHammer_Surface` for a forge-at-surface animation) rather than authoring a new one. Authoring a new timedAction block (custom anim/sound/props) is an advanced task; schema details are thin on the accessible web. `[block-authoring schema UNCERTAIN]`
