---
id: build-42-addendum-canonical-craftrecipe-schema
slug: addendum-canonical-craftrecipe-schema
title: 'ADDENDUM: Canonical craftRecipe schema'
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
  Enriched from pzwiki cache (canonical). Source: pzwiki.net/wiki/CraftRecipe,
  page-version 42.19.0, revid 1441679. NOTE: the "PZwiki (403 ... snippets
  only)" caveat above is now SUPERSEDED for the...
last_updated: '2026-09-29'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - craftrecipe-outputs-and-itemmappers
  - craftrecipe-vs-legacy-recipe
---
# ADDENDUM: Canonical craftRecipe schema (pzwiki cache, CONFIRMED)

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Enriched from pzwiki cache (canonical). Source: pzwiki.net/wiki/CraftRecipe, page-version 42.19.0, revid 1441679. NOTE: the "PZwiki (403 ... snippets only)" caveat above is now SUPERSEDED for the craftRecipe topic -- the full page was retrieved via the MediaWiki API and cached locally at `_raw_pzwiki_sources/02_scripting_crafting/CraftRecipe.wiki.txt` (+ `_json/CraftRecipe.json`). The items below are [CONFIRMED] against that canonical page unless marked otherwise.

### Placement + identity [CONFIRMED]
- A `craftRecipe` block lives inside a `module { }` (crafts an item) OR inside an `entity { }` (that entity's build recipe). This is the B42 replacement for B41 `recipe` blocks.
- `craftRecipe <RecipeID>` -- the ID must contain NO spaces. It is a soft-override target (Soft overrides = True): defining a same-named craftRecipe that contains ONLY `itemMapper`/`overlayMapper` entries ADDS to the original rather than replacing it.
- Translation: add the RecipeID (NOT module-prefixed) to `Recipes.json`, e.g. `{ "MyRecipe": "My recipe name" }`.
- Child blocks: `inputs`, `outputs`, `itemMapper`, `overlayMapper`.

### Skill / learning parameters [CONFIRMED]
Multiple entries are separated with `;`. Skills come from `PerkFactory.Perks` (or a modded skill).
- `xpAward = skill:experience`   (e.g. `xpAward = Woodwork:5`)
- `SkillRequired = skill:level`  (e.g. `SkillRequired = Carving:6`)
- `AutoLearnAll = skill:level`   (learns when ALL listed thresholds met)
- `AutoLearnAny = skill:level`   (learns when ANY listed threshold met)
- `needTobeLearn = true`  -- exact casing is `needTobeLearn` (recipe must be learned, not auto-known).

### Timing + hooks [CONFIRMED]
- `time` / `Time` = <seconds> (B42 crafting time is in seconds; both casings appear in vanilla).
- `timedAction = <ActionName>` (e.g. `SawLogs`, `Making`, `SharpenStake`).
- `OnCreate = Recipe.OnCreate.<Fn>` and `OnTest = Recipe.OnTest.<Fn>` -- Lua hooks.
- `category = <string>` (e.g. `Carpentry`, `Carving`, `Miscellaneous`) -- groups the recipe in the crafting UI.

### Tags [CONFIRMED] -- `Tags = A;B;C`
A crafting-BENCH tag is MANDATORY or the recipe is not recognized.
- General: `CanAlwaysBeResearched`, `CanBeDoneInDark`, `RightClickOnly`.
- Activity: `Cooking`, `Electrical`, `Engineer`, `Farming`, `Fishing`, `Glassmaking`, `Health`, `Packing`, `Pottery`, `Smithing`, `Survivalist`, `Trapper`, `Welding`.
- Crafting bench (pick >=1): `AnySurfaceCraft`, `InHandCraft` (also exposes the recipe on the item context menu), `CanBeDoneFromFloor`, `CoffeeMachine`, `Forge`, `Furnace`, `Grindstone`, `HandPress`, `Heckling`, `KeyDuplicator`, `KilnLarge`, `KilnSmall`, `PotteryBench`, `PotteryWheel`, `Rippling`, `Scutching`, `StandingDrillPress`, `Toaster`.

### inputs / outputs item lines [CONFIRMED]
```
inputs
{
    item <count> [Base.X;Base.Y] tags[Tag] mode:keep|destroy flags[MayDegradeLight;Prop1;...] mappers[LampMapper],
    item 1 [*],                         // any item
    -fluid 1.0 [Petrol],                // a fluid input (leading minus)
}
outputs
{
    item 3 Base.Plank,                  // fixed output
    item 1 mapper:LampMapper,           // output resolved through an itemMapper
}
itemMapper LampMapper
{
    Base.Lantern_Hurricane = Base.Lantern_Hurricane,
    default = Base.Lantern_Hurricane,   // fallback
}
```
- `mode:keep` retains the input item; `mode:destroy` consumes it.
- `flags[...]` include `MayDegradeLight`, `Prop1`/`Prop2` (which hand holds it in the anim), `NotFull`, `AllowFavorite`, `InheritFavorite`, `ItemCount`, `AllowDestroyedItem`, etc.
- `[*]` = accept any item; `[Base.A;Base.B]` = any one of a list; `tags[...]` = any item bearing that tag.

### Modifying EXISTING recipes from Lua -- MAJOR B42 limitation [CONFIRMED]
The pzwiki page states plainly: B42's craftRecipe is "very limited when it comes to modifying existing recipes from Lua compared to the previous recipe scripts from Build 41." Known workarounds:
- Simple key-value override via `ScriptManager.instance:getCraftRecipe(name)` then `recipe:Load(name, "{ time = 50, }")` -- the code block MUST be wrapped in `{ ... }` with a trailing comma or the parser throws `IndexOutOfBoundsException`. Cannot override list values (Tags/xpAward) or sub-blocks (inputs/outputs) this way.
- 42.18 added `getModTags()` / `setTags()` on CraftRecipe (may allow tag edits now).
- itemMapper additive override (define same-name craftRecipe with only the mapper entries), or `mapper:addOutputEntree(...)` + `OnPostWorldDictionaryInit(recipe:getName())` via Lua.
- Adding new INPUTS requires reflection into the Java `loadedItems` field and NO LONGER WORKS outside debug mode (reflection restricted). [CONFIRMED as broken in recent versions]

Porting implication for the Outcast mods: any B41 mod that edited vanilla recipes at runtime via the old `recipe` API must be re-authored as B42 `craftRecipe` script blocks (soft-override/mapper-append pattern), because runtime recipe editing is largely gone. New recipes are fine; mutating vanilla ones is the pain point -- design around it.

### CORRECTION (Workshop-verified, 2026-07-29): runtime `:Load()` is MORE capable than the pzwiki page implies
The claims above ("cannot override sub-blocks", "adding inputs no longer works") are the pzwiki framing. A shipping 42.20 mod (Ammo Maker, analyzed in `../13_WORKSHOP_ANALYSIS/patterns/item_crafting_content.md`) DISPROVES the strong reading:
- `ScriptManager.instance:getCraftRecipe(name):Load(name, fullBodyString)` **can rebuild entire `inputs`/`outputs`/`itemMapper` sub-blocks at runtime**, and can even rewrite VANILLA recipes (`MakePipeBomb`, `MakeFirecracker`).
- The reconciling nuance: `:Load()` parses a full recipe body fine **as long as the recipe already exists** -- either a vanilla recipe or a stub you pre-declared in your own scripts (`craftRecipe X { inputs {} outputs {} }`). What is dead is **Java-reflection input injection on an undeclared recipe** (the `loadedItems` trick) -- that, and only that, is the "no longer works" case.
- Proven scale pattern: author N recipes as empty stubs, keep the numbers in Lua data tables, and have one engine file generate + `:Load()` the full bodies on `OnInitGlobalModData` (optionally gated by `getActivatedMods()`), scaled by SandboxVars. This is a first-class B42 technique, not a hack.

So for the Outcast crafting mods: runtime recipe generation/mutation IS viable in B42 via pre-declared stubs + `:Load()`. Prefer it for large or configurable recipe sets. (Still tag as verify-in-game for any specific field, but the capability is confirmed in a live 42.20 mod.)
