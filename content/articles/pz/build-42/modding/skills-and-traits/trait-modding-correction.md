---
id: build-42-trait-modding-correction
slug: trait-modding-correction
title: 'Correction: trait modding, from a shipping 42.20 mod'
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
  Verified against "More Traits" (ToadTraits), which defines ~90 B42 traits --
  analysis in ../13_WORKSHOP_ANALYSIS/libraries/more_traits.md. Fixes to the
  trait-modding guidance above:
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
  - sandbox-multiplayer-options
  - the-xp-grant-skill-query-lua-api
  - concrete-b42-examples
---
# Correction: trait modding, from a shipping 42.20 mod

> Source: 05_SKILLS_TRAITS_PROGRESSION.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Verified against "More Traits" (ToadTraits), which defines ~90 B42 traits -- analysis in `../13_WORKSHOP_ANALYSIS/libraries/more_traits.md`. Fixes to the trait-modding guidance above:

- **Translation keys are `UI_trait_<name>` and `UI_trait_<name>desc`** -- NO namespace/module in the key, lowercase `desc`, no underscore before it. (Earlier guidance showing `UI_trait_mymod:mytrait` / `..._Desc` was wrong.)
- **Trait icons appear OPTIONAL.** More Traits ships NO icons -- no `Texture` field in its `character_trait_definition` blocks and no `media/ui/Traits/` folder. The icon path in the creation docs is uncorroborated; treat icons as optional until verified.
- **`character_trait_definition Cost` sign:** a POSITIVE value = the trait costs points (a negative = grants points). This is the inverse of the pzwiki display-table convention; author scripts with the script sign.
- **Canonical mechanism CONFIRMED:** `media/registries.lua` calls `CharacterTrait.register("Mod:Name")` (handles stored in a flat global table) + a `character_trait_definition Mod:Name { ... }` script + effects wired in Lua on `player:hasTrait(handle)`. There is NO third-party "add-a-trait" API; you replicate this pattern directly. The old B41 `TraitFactory.addTrait` route is dead (More Traits keeps it fully commented out as a migration reference).
- **Conditional traits:** remove a script-defined trait at runtime with `CharacterTraitDefinition.characterTraitDefinitions:remove(handle)` (More Traits `HideTraits.lua`).
- **Translations are per-category JSON** (`UI_*` in the JSON translation files), not legacy `_EN.txt`.
