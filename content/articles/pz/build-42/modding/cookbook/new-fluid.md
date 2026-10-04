---
id: build-42-new-fluid
slug: new-fluid
title: New fluid
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
  What you build: a custom drinkable/industrial fluid and an item that can hold
  it.
last_updated: '2026-10-04'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
  - new-workstation
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
# New fluid

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a custom drinkable/industrial fluid and an item that can hold it.

**Files + placement:** `42/media/scripts/fluids.txt` (fluid + container item), translation key in `42/media/lua/shared/Translate/EN/Fluids_EN.txt` (or `Fluids.json`).

**Skeleton -- fluid.** Note: ScriptsDocs `fluid.txt` only documents `ColorReference` and `DisplayName` directly; it confirms the child blocks `Properties`, `Poison`, `Categories`, `BlendWhiteList` **exist** but does not enumerate their inner fields, so those inner fields are LIKELY (from the pzwiki example, page 42.19.0).

```
module YourModule
{
    fluid HerbalTea
    {
        ColorReference = Green,                 -- CONFIRMED: a Colors-class color name
        DisplayName    = Fluid_Name_HerbalTea,  -- CONFIRMED: translation key (Fluids.json)

        Categories                              -- block existence CONFIRMED; values LIKELY
        {
            Beverage,
        }

        Properties                              -- block CONFIRMED; inner fields LIKELY
        {
            thirstChange  = -0.3,
            hungerChange  = 0,
            stressChange  = -0.05,
            unhappyChange = -0.05,
            calories      = 2,
        }

        Poison                                  -- block CONFIRMED; inner fields LIKELY
        {
            maxEffect   = None,                 -- None | Low | Medium | Extreme | Deadly
            minAmount   = 0,                    -- loaded, never read
            diluteRatio = 0,                    -- loaded, never read
        }
    }
}
```

| Field | Meaning | Tag |
|-------|---------|-----|
| `ColorReference` | Color name from the Colors class (e.g. `Azure`, `Red`, `Green`). | CONFIRMED (fluid.txt) |
| `DisplayName` | In-game name; the value is a translation key in `Fluids.json`. Convention prefix `Fluid_Name_`. | CONFIRMED (fluid.txt) |
| `Color = R : G : B` | Alternative to `ColorReference`; RGB01 (0.0-1.0 per channel), no alpha. | LIKELY (wiki) |
| `Properties{}` stat deltas | `thirstChange hungerChange stressChange unhappyChange enduranceChange fatigueChange foodSicknessChange`; nutrition `calories carbohydrates lipids proteins alcohol`; `fluReduction painReduction`. | block CONFIRMED / fields LIKELY |
| `Poison{}` | `maxEffect` (None/Low/Medium/Extreme/Deadly) is the only field the game uses. `minAmount` and `diluteRatio` are loaded and never read. The poison only reaches the drinker if the fluid also has a `Properties{}` block. | Code (see the proof line below the table) |
| `Categories{}` | Grouping tags (`Beverage`, `Industrial`, ...). | block CONFIRMED / values LIKELY |
| `BlendWhiteList` / `BlendBlackList` | Blend rules; either a scalar `BlendWhiteList = MyFilter,` or a block with `whitelist=true/false`, `fluids{}`, `categories{}`. | BlendWhiteList CONFIRMED / usage LIKELY |

> **Proof:** Code. `zombie.entity.components.fluids.PoisonInfo#getPoisonEffect` (returns `maxEffect`); `zombie.entity.components.fluids.Fluid#setScript` (properties, with the poison dose, only when the script has a `Properties` block). Build 42.20 (revision a2947723ca).

Name your fluid something new. A fluid named like a vanilla one (`Water`, `Petrol`, ...) is bound to the vanilla fluid and overwrites its definition, in any module.

> **Proof:** Code. `zombie.scripting.objects.FluidDefinitionScript#Load` and `zombie.entity.components.fluids.Fluid#Init`. Build 42.20 (revision a2947723ca).

There is **no `boredomChange` field** in any source -- use `unhappyChange`/`stressChange`. (UNCERTAIN if it exists.)

**Skeleton -- item as a FluidContainer.** Add the `FluidContainer` component to an item. All container fields below are CONFIRMED from `component__component-fluidcontainer.txt` (PascalCase there; script parsing is generally case-insensitive but match the schema to be safe). `Fluids{}` lists which fluids the container may hold. [CONFIRMED -- `fluids.txt`]

```
module YourModule
{
    item TeaFlask
    {
        Type        = Normal,
        DisplayName = Tea Flask,
        Icon        = TeaFlask,
        Weight      = 0.4,

        component
        {
            FluidContainer
            {
                Capacity = 1.0,             -- CONFIRMED: float, default 1.0, min 0.05
                Fluids
                {
                    fluid = HerbalTea,      -- CONFIRMED: one line per allowable fluid
                    fluid = Water,
                }
            }
        }
    }
}
```

| FluidContainer field | Meaning | Tag |
|----------------------|---------|-----|
| `Capacity` | Fluid capacity (float, default 1.0, min 0.05). | CONFIRMED |
| `Fluids { fluid = X, ... }` | The fluids this container may hold (child block, no ID). | CONFIRMED |
| `PickRandomFluid` | If true, fill picks ONE random listed fluid; if false, all listed appear. Default False. | CONFIRMED |
| `InitialPercent` / `InitialPercentMin` / `InitialPercentMax` | Starting fill. `InitialPercent` is incompatible with the Min/Max pair. (Note: the ScriptsDocs Min/Max text descriptions appear swapped -- verify in-game.) | CONFIRMED |
| `RainFactor` | How much rain fills it (0.0 = never). If a weapon and >0, aiming empties it. | CONFIRMED |
| `FillsWithCleanWater` | Fill with clean (not tainted) water in rain. Default False. | CONFIRMED |
| `CustomDrinkSound` | Sound on drink (default `DrinkingFromGeneric`). | CONFIRMED |
| `HiddenAmount` | Hide fluid quantity in UI. Default False. | CONFIRMED |
| `ContainerName` | Default `FluidContainer`; flagged unused; no whitespace allowed. | CONFIRMED |

There is no `initialFluid`, `rgb`, or `fluid amount` field on the container -- initial contents come from `InitialPercent*`, and color lives on the `fluid` definition. (UNCERTAIN / not found.)

**Gotchas.** The `Fluids` sub-block must have no ID. Color/alpha: fluids have no transparency. `boredomChange` does not exist. `Fluids.json` (not a `.txt`) is the modern translation home for fluid display names.

**Deep reference:** `_raw_scriptsdocs/fluid.txt`, `_raw_scriptsdocs/fluids.txt`, `_raw_scriptsdocs/component__component-fluidcontainer.txt`; `_raw_pzwiki_sources/08_creation_toolkit/Fluid_scripts.wiki.txt`; doc 02 (fluids).

---

<a name="9-item-repair-fixing"></a>

---

*Corrected 2026-10-04: Poison minAmount and diluteRatio are never read, Poison needs a Properties block to reach the drinker, and a vanilla-named fluid overwrites vanilla's.*
