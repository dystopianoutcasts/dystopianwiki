---
id: build-42-new-workstation
slug: new-workstation
title: New workstation or craft bench
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
  What you build: a placeable workstation (an entity with components) that gates
  a set of craftRecipes behind a bench tag.
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
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
# New workstation or craft bench

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a placeable workstation (an `entity` with components) that gates a set of `craftRecipe`s behind a bench tag.

**Files + placement:** `42/media/scripts/` -- an `entity` block plus the `craftRecipe`s that reference its bench tag.

**The entity + component model** [CONFIRMED -- `entity.txt`, `component.txt`, `components.txt`]: an `entity` "defines a tile with special properties" and holds functionality via typed `component` child blocks. Allowed component IDs: `CraftRecipe`, `SpriteConfig`, `UiConfig`, `CraftBench`, `CraftBenchSounds`, `Resources`, `DryingCraftLogic`, `SpriteOverlayConfig`, `Durability`, `FluidContainer`, `ContextMenuConfig`, `WallCoveringConfig`. Components go directly under `entity` or grouped under a `components { }` wrapper.

**How a recipe binds to a bench** [CONFIRMED]: the `CraftBench` component's `Recipes` field defines the bench **tag name**; put that tag in each `craftRecipe`'s `Tags`. "A crafting bench tag can be created by adding a component CraftBench to an entity script, which can then be used in this tags parameter."

**Skeleton.**

```
module yourModule
{
    entity Foo
    {
        component CraftBench
        {
            Recipes = FooBench,          -- this string becomes the bench tag
        }
        component SpriteConfig
        {
            face
            {
                -- face sub-block required by SpriteConfig; sprite rows undocumented in cache
            }
        }
        component CraftBenchSounds
        {
            -- StartCraft, AddInput, RemoveInput, LightFire, AddFuel, Running
        }
        component UiConfig
        {
            -- xuiSkin, entityStyle, uiEnabled
        }
    }

    craftRecipe MakeThingAtFoo
    {
        timedAction = Making,
        Time        = 100,
        Tags        = FooBench,          -- matches CraftBench.Recipes above
        inputs  { item 1 [Base.Plank], }
        outputs { item 1 Base.Thing, }
    }
}
```

**Key component fields:**

| Component / field | Meaning | Tag |
|-------------------|---------|-----|
| `CraftBench.Recipes` | `;`-separated bench tag name(s) referenced by a craftRecipe's `Tags`. (Only documented CraftBench field.) | CONFIRMED |
| `CraftBenchSounds.{StartCraft,AddInput,RemoveInput,LightFire,AddFuel,Running}` | Sound hooks for craft events. | field names CONFIRMED / meaning LIKELY |
| `SpriteConfig` (+ required `face` block) | Placement/rendering; params `health`, `bonusHealth`, `corner`, `isThumpable`, `isProp`, `OnCreate`, `OnIsValid`, `skillBaseHealth`. | field names CONFIRMED / meaning LIKELY; `face` rows UNCERTAIN |
| `UiConfig.{xuiSkin,entityStyle,uiEnabled}` | Bench UI skin/style. | field names CONFIRMED / meaning LIKELY |
| `Durability` (on items) | Item durability component; declares no parameters in the cache. | CONFIRMED (empty) |

**Gotchas.** The `CraftBench.Recipes` tag must exactly match the recipe `Tags` value. `entity` top-level params (`LuaWindowClass`, `DisplayName`, `Icon`) and most component inner fields are typed "Unknown" in ScriptsDocs (no descriptions) -- confirm SpriteConfig `face` sprite rows and UiConfig values against B42 vanilla scripts. The bench also needs a placeable moveable item / world tile to exist in-game (standard tile/moveable setup).

**Deep reference:** `_raw_scriptsdocs/entity.txt`, `component.txt`, `components.txt`, `component__component-craftbench.txt`, `component__component-craftbenchsounds.txt`, `component__component-spriteconfig.txt`, `component__component-uiconfig.txt`, `component__component-durability.txt`; doc 02.

---

<a name="8-new-fluid--fluidcontainer"></a>
