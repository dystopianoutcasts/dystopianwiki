---
id: build-42-master-checklist
slug: master-checklist
title: Master checklist
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
excerpt: 'For "B42-stable ready" crafting content:'
last_updated: '2026-09-29'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - timedaction-blocks
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
---
# Master checklist

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

For "B42-stable ready" crafting content:

- [ ] Items use `Tags = ...` matching vanilla capability tags so they slot into vanilla recipes.
- [ ] Items use `StaticModel`/`WorldStaticModel` (not B41 `WorldObjectSprite`).
- [ ] Recipes are `craftRecipe` blocks with `time` in seconds, `timedAction`, `category`, and `inputs`/`outputs`.
- [ ] Tools are `mode:keep`; consumables default or `mode:destroy`; degrade flags where appropriate.
- [ ] Ingredients prefer `tags[..]` over hard item names for interop; use `[A;B]` OR-lists where sensible.
- [ ] Recipe `tags` bind to the intended station's `CraftBench.Recipes` (or `AnySurfaceCraft`/`InHandCraft`).
- [ ] Learning path decided: default-known, `AutoLearnAll/Any`, magazine (`TeachedRecipes`), or `ResearchableRecipes`.
- [ ] `SkillRequired` + `xpAward` set to the right skills.
- [ ] Fluids (if any) defined as `fluid` blocks; containers have `component FluidContainer`; recipes use `-fluid`/`+fluid` with an `item 1 [*]` container line.
- [ ] Dynamic outputs use `itemMapper` + `mapper:`/`mappers[]` with a `default`.
- [ ] No legacy `recipe` blocks, no `Property:Value` syntax inside `craftRecipe`.
- [ ] Tested on a fresh B42 save; console clean; recipe resolves via `getScriptManager`.
