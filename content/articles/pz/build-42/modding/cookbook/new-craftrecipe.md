---
id: build-42-new-craftrecipe
slug: new-craftrecipe
title: New craftRecipe
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  What you build: a crafting recipe in the B42 craftRecipe format (the
  replacement for the B41 recipe block).
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-workstation
  - new-fluid
  - item-repair
  - evolved-recipe
  - new-trait
  - new-profession
  - new-skill
  - new-animal
  - new-crop
  - lua-gameplay-mod
  - custom-ui
  - custom-moodle
  - sound-mod
  - radio-channel
  - translations
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# New craftRecipe

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a crafting recipe in the B42 `craftRecipe` format (the replacement for the B41 `recipe` block).

**Files + placement:** `42/media/scripts/recipes.txt` inside a `module` block (item recipes) or an `entity` block (build recipes); recipe display name in `Recipes.json` (sec 21).

**Skeleton.**

```
module yourModule
{
    craftRecipe SawLogs
    {
        timedAction = SawLogs,                 -- timedAction script block (drives anim/sound/xp burn)
        Time        = 230,
        Tags        = InHandCraft;CanBeDoneFromFloor,   -- MANDATORY: at least one bench tag
        category    = Carpentry,
        xpAward     = Woodwork:5,
        inputs
        {
            item 1 [Base.Log] flags[Prop2],
            item 1 tags[Saw] mode:keep flags[MayDegradeLight;Prop1],
        }
        outputs
        {
            item 3 Base.Plank,
        }
    }
}
```

**Key top-level fields** (all CONFIRMED from `craftrecipe.txt`):

| Field | Meaning | Tag |
|-------|---------|-----|
| `timedAction` | Reference to a `timedAction` script block; drives animation, sound, calories burned. (Note: there is **no** `timedActionAnim` field -- that token does not exist.) | CONFIRMED |
| `Time` | Craft duration (abstract units; copy vanilla for feel; default 50). | CONFIRMED |
| `Tags` | `;`-separated conditions/bench gating. **Required** -- at least one crafting-bench tag (`InHandCraft`, `AnySurfaceCraft`, `Forge`, `Furnace`, `Grindstone`, or a custom bench tag from a CraftBench component). | CONFIRMED |
| `category` | Crafting-menu category (default `Miscellaneous`; no translation support as of 42.19). | CONFIRMED |
| `xpAward` | `skill:xp` pairs, `;`-separated (`Blacksmith:10;Tailoring:5`). | CONFIRMED |
| `SkillRequired` | `skill:level` minimums. | CONFIRMED |
| `AutoLearnAll` / `AutoLearnAny` | Auto-learn when all / any listed skill levels reached. | CONFIRMED |
| `AllowBatchCraft` | Batch/quantity slider (default True). | CONFIRMED |
| `CanWalk` | Craft while walking (default False). | CONFIRMED |
| `Icon` / `Tooltip` | Menu icon / `Tooltip.json` key. | CONFIRMED |
| `MetaRecipe` | Links recipes: knowing the meta recipe grants this one. | CONFIRMED |
| `OnCreate` / `OnTest` / `OnFailed` / `OnUpdate` / `OnAddToMenu` | Lua callbacks (`OnCreate(craftRecipeData, character)`, `OnTest(item, character)`->bool, `OnAddToMenu` return true to add). | CONFIRMED |
| `ResearchSkillLevel` / `ResearchAll` / `ResearchAny` | Reverse-engineering requirements (Inventive trait lowers by 2). | CONFIRMED |

**Input line syntax** (CONFIRMED by example in `craftrecipe.txt`; `inputs.txt`/`outputs.txt` declare no parameters themselves):

```
item <count> [Base.ItemA;Base.ItemB]  mode:<keep|destroy>  flags[FlagA;FlagB]  mappers[MapperID],
item <count> tags[TagA;TagB]          mode:keep,
item 1 [*],                            -- wildcard: any item
-fluid 1.0 [Petrol],                   -- consume a fluid ingredient
```

- Specific items: `[Base.Log]`; `;` inside brackets = any-of alternatives.
- Tag-based: `tags[Saw]` matches any item with that tag.
- Fluids: `-fluid <float> [FluidName]`.
- `mode:keep` keeps the item (tools); `mode:destroy` consumes/transforms; no `mode:` = consumed (default LIKELY).
- Observed `flags[...]`: `Prop1`/`Prop2` (anim slot), `MayDegradeLight`, `NotFull`, `AllowFavorite`, `InheritFavorite`, `ItemCount`, `AllowDestroyedItem` (field CONFIRMED via examples; individual semantics LIKELY).
- `mappers[ID]` links an input to an `itemMapper` (sec: itemMapper below).

**Output line syntax** (CONFIRMED): `item <count> Base.Item,` or `item <count> mapper:MapperID,` (resolves via an itemMapper).

**itemMapper** (child of `craftRecipe`; CONFIRMED) -- input->output lookup so a variant produces its matching variant back:

```
itemMapper LampMapper
{
    Base.Lantern_Hurricane        = Base.Lantern_Hurricane,
    Base.Lantern_Hurricane_Copper = Base.Lantern_Hurricane_Copper,
    default = Base.Lantern_Hurricane,
}
```

Reference it with `mappers[LampMapper]` on the input and `item 1 mapper:LampMapper,` on the output.

**Gotchas.** The bench `Tags` line is the single most common new-recipe failure -- omit it and the recipe is silently not recognized. Rewriting a B41 `recipe` as-is silently fails. Recipe display names live in `Recipes.json` keyed by the bare RecipeID (no module prefix). `category` has no translation support yet.

**Deep reference:** `_raw_scriptsdocs/craftrecipe.txt`, `inputs.txt`, `outputs.txt`, `itemmapper.txt`; doc 02 (craftRecipe addendum -- authoritative).

---

<a name="7-new-workstation--craft-bench"></a>
