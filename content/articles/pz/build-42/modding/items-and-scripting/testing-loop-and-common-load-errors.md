---
id: build-42-testing-loop-and-common-load-errors
slug: testing-loop-and-common-load-errors
title: Testing loop and common load errors
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
  Testing loop [standard workflow]: Put scripts under /media/scripts/; ensure
  mod.info (and B42's /common/ or versioned folder layout) is correct. Enable
  the mod, start a new test save (B42 caches...
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
  - master-checklist
---
# Testing loop and common load errors

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Testing loop** `[standard workflow]`:
1. Put scripts under `<mod>/media/scripts/`; ensure `mod.info` (and B42's `<mod>/common/` or versioned folder layout) is correct.
2. Enable the mod, start a **new** test save (B42 caches scripts; new save avoids stale data).
3. Watch the console/`console.txt` log on load — the script parser reports the file + line of any syntax error.
4. Use the in-game **debug crafting UI** and `getScriptManager():getRecipe("Module.RecipeId")` in the Lua console to confirm the recipe registered.
5. Iterate. Script `.txt` changes require a game restart (they are parsed at load).

**Common load errors** `[CONFIRMED patterns / community]`:
- **Recipe not appearing:** its `tags` don't match any reachable `CraftBench.Recipes`, OR it's `needTobeLearn = true` and nothing teaches it, OR `SkillRequired` too high. Not an error — a gating problem.
- **Missing comma** at end of an input/output line, or a stray comma after a `}` — parser aborts the block.
- **Unknown item/tag:** referencing `Base.SomeItem` that doesn't exist (typo, or dependency mod not loaded/ordered first) → silent skip or "item not found" spam. Load order matters.
- **`craftRecipe` with spaces in the ID** works in vanilla but breaks Lua lookups and some tooling — avoid in mods.
- **Wrong property syntax:** using `Property:Value` (legacy `recipe` style) inside a `craftRecipe` (which wants `property = value,`), or `=` counts inside `inputs`. Mixing the two syntaxes is the #1 beginner error.
- **Mapper mismatch:** an `output` referencing `mapper:X` with no matching `itemMapper X` block, or an `itemMapper` row whose source item wasn't offered as an input.
- **Fluid identifier collision:** naming a modded fluid the same as a `FluidType` enum makes the game treat it as vanilla (may conflict).
- **B41 leftovers:** `WorldObjectSprite`, old `recipe` blocks, or B41-only item fields → warnings and non-appearance. **[BREAKING]**

Tooling that helps `[CONFIRMED they exist]`: `PZ-Wiki-Modding/ZedScripts` (VS Code extension with B42 syntax highlighting + diagnostics for items/recipes) and `cyberbobjr/pz-syntax-extension` (autocomplete of tags/flags/properties for items & craftRecipe).
