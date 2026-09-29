---
id: build-42-the-new-craftrecipe-block
slug: the-new-craftrecipe-block
title: The new craftRecipe block
game: pz
version: build-42
section: modding
category: crafting
difficulty: intermediate
tags:
  - craftrecipe
  - crafting
  - itemmapper
  - recipe-tags
excerpt: >-
  Minimal real recipe (from
  entities/agricultural/workstations/entity_stone_mill.txt) [CONFIRMED]:
last_updated: '2026-09-29'
related_articles:
  - craftrecipe-inputs-in-depth
  - craftrecipe-outputs-and-itemmappers
  - craftrecipe-vs-legacy-recipe
  - addendum-canonical-craftrecipe-schema
---
# The new `craftRecipe` block (basics)

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Minimal real recipe (from `entities/agricultural/workstations/entity_stone_mill.txt`) `[CONFIRMED]`:

```
craftRecipe MillFlour
{
    time        = 100,
    timedAction = UseStoneQuern,
    tags = Stone_Mill,
    category = Farming,
    inputs
    {
        item 12 [Base.WheatSeed;Base.RyeSeed;Base.BarleySeed],
    }
    outputs
    {
        item 1 Base.Flour2,
    }
}
```

Anatomy:

- `craftRecipe <RecipeID>` — the ID is the unique key. **No spaces recommended** (vanilla sometimes uses spaces, e.g. `craftRecipe Churn Cow Butter`, but avoid it in mods; it complicates Lua/`getScriptManager` lookups). `[CONFIRMED spaces exist in vanilla; avoiding them UNCERTAIN-best-practice]`
- `time = <seconds>` — **time is in in-game action SECONDS**, not the abstract "ticks" B41 used. `time = 100` ~ 100 game-seconds of the timed action. `[CONFIRMED — vanilla uses values like 15/100/200/300/500 consistent with seconds]` Both `time` and `Time` (capitalized) are accepted; vanilla mixes them. `[CONFIRMED]`
- `timedAction = <ActionID>` — which animation/action set plays (see section 13). Optional; defaults to a generic action if omitted, but vanilla almost always sets one (`Making`, `MakingHammer_Surface`, `UseStoneQuern`, `TanLeatherBarrel`...).
- `category = <UICategory>` — which crafting-menu category (e.g. `Farming`, `Cooking`, `Tools`, `Carpentry`). Note lowercase `category` here vs `DisplayCategory` on items.
- `tags = ...` — recipe-level tags (workstation binding + flags).
- `inputs { ... }` and `outputs { ... }` — the ingredient and result blocks.

**Comma rule** `[CONFIRMED]`: every statement inside `inputs`/`outputs` ends with a comma, INCLUDING the last one in vanilla files (vanilla is lenient). The block braces `{ }` themselves are NOT comma-terminated. Top-level `key = value,` lines are all comma-terminated.
