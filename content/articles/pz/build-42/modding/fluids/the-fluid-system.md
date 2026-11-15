---
id: build-42-the-fluid-system
slug: the-fluid-system
title: The fluid system
game: pz
version: build-42
section: modding
category: fluids
difficulty: intermediate
tags:
  - fluids
  - fluidcontainer
  - liquids
excerpt: >-
  The reference for Build 42 fluids: the fluid script syntax, the FluidContainer item component and its fields, fluids in recipes, the Lua calls, and what the engine already ships. Checked on 42.22.
last_updated: '2026-11-15'
related_articles:
  - fluids-for-modders-start-here
  - defining-a-fluid-names-poison-properties
  - fluid-container-calls-that-lie
  - drinking-tainted-water-and-boiling
  - fluids-in-multiplayer
  - what-a-mod-fluid-can-plug-into
  - new-fluid
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders writing a fluid](#defining-a-fluid) | [modders putting a container on an item](#the-fluidcontainer-component) | [modders writing Lua](#the-lua-calls)

New to fluids? Begin at [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here), which has a complete small mod. This page is the reference behind it.

:::callout[The 1-minute version]{kind=key}
- A fluid is a `fluid` script block. A container is a `component FluidContainer` block on an item or a world entity.
- Only `maxEffect` of a `Poison` block does anything, and a poison reaches the drinker only when the fluid also has a `Properties` block.
- The fluid container keeps up to eight fluids and refuses a new one that the blend rules, the container's lists, a lock or a full tank turn away.
- A recipe asks for fluid with a `-fluid` input line. No vanilla script line was found that uses a `+fluid` output, so that syntax is not verified.
- The engine already ships the containers' Lua and UI layer: pour actions, a fluid bar and a transfer window.
- The older version of this page gave 42.20 and 42.21 facts; the ones that changed are in the closing "How we know" box.
:::

:::facts
- **Vanilla fluid scripts** 61 `fluid` blocks in three files, counted by script
- **Fluid categories** 12 :cite[(`FluidCategory.java:17-28`)]
- **Poison effect levels** None, Mild, Medium, Severe, Extreme, Deadly :cite[(`PoisonEffect.java:16-21`)]
- **Fluid classes** 14 Java files, 3,727 lines in all, in `zombie/entity/components/fluids`
- **Vanilla items with a container** 133 `component FluidContainer` blocks in four item script files, counted by script
- **Units** 1 liter = 1.0, 1 mL = 0.001 :cite[(`FluidUtil.java:19-22`)]
:::

## Defining a fluid

A fluid is one `fluid` block in a script, and the game reads only the keys and child blocks listed here.

The vanilla fluids are in three files: `fluids.txt`, `fluids_Beverages.txt` and `fluids_Alcoholic.txt` :cite[(`media/scripts/generated/fluids.txt:3`, `media/scripts/generated/fluids_Beverages.txt:3`, `media/scripts/generated/fluids_Alcoholic.txt:3`)]. The tainted-water block shows every part a poisonous drink needs:

```
fluid TaintedWater
{
    ColorReference = LightSkyBlue,
    DisplayName = Fluid_Name_TaintedWater,
    Categories
    {
        Beverage,
        Hazardous,
        Water,
    }
    Properties
    {
        ThirstChange = -50.0,
    }
    Poison
    {
        maxEffect = Medium,
        minAmount = 1.0,
        diluteRatio = 0.2,
    }
}
```

That is the vanilla block as shipped :cite[(`media/scripts/generated/fluids.txt:18-38`)]. Key names are matched without regard to case, which is why vanilla can write `ThirstChange` :cite[(`FluidDefinitionScript.java:312-351`)].

The top-level keys and child blocks of a fluid are:

| Part | What it takes | Code |
|---|---|---|
| `DisplayName` | A translation key from `Fluids.json`; the text itself shows when no key matches | `FluidDefinitionScript.java:234-235`, `Translator.java:879-882` |
| `ColorReference` | A color name; an unknown name throws when the color is read | `FluidDefinitionScript.java:236-237`, `:106-113` |
| `Color`, or `r`, `g`, `b` | The color as `R:G:B` (exactly three parts) or as separate values | `FluidDefinitionScript.java:238-250` |
| `Categories { ... }` | Names from the category list below; an unknown name throws | `FluidDefinitionScript.java:282-287` |
| `Properties { ... }` | The effect and nutrition keys below | `FluidDefinitionScript.java:313-351` |
| `Poison { ... }` | `maxEffect`, `minAmount`, `diluteRatio` | `FluidDefinitionScript.java:291-311` |
| `BlendWhiteList { ... }`, `BlendBlackList { ... }` | An inline filter block (see "Blend rules") | `FluidDefinitionScript.java:261-266` |

Any other key at the top level, or in Properties or Poison, is logged as an error, and in debug mode it throws :cite[(`FluidDefinitionScript.java:252-257`, `:303-307`, `:346-351`)]. The page [Defining a fluid](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties) covers names, Poison and Properties in depth.

### Categories

The category list is fixed, and a fluid's categories are used for blend rules and recipe matching.

:::chips
- Beverage
- Alcoholic
- Hazardous
- Medical
- Industrial
- Colors
- Dyes
- HairDyes
- Paint
- Fuel
- Poisons
- Water
:::

The twelve names are the whole enum :cite[(`FluidCategory.java:17-28`)].

### Properties

A `Properties` block sets what one unit of the fluid does to a drinker, and each key is optional.

| Key | Note |
|---|---|
| `thirstChange`, `hungerChange`, `stressChange`, `fatigueChange` | The script value is divided by 100 when read |
| `unhappyChange`, `enduranceChange` | Read as written |
| `calories`, `carbohydrates`, `lipids`, `proteins`, `alcohol` | Nutrition and alcohol |
| `fluReduction`, `painReduction` | Reductions |
| `foodSicknessChange` | Read as a whole number |

The names and the division by 100 are in the script class :cite[(`FluidDefinitionScript.java:52-65`, `:144-156`, `:313-351`)]. The key is `foodSicknessChange`; the older page wrote `foodSicknessReduction`, which the game rejects as an unknown key :cite[(`FluidDefinitionScript.java:344-351`)].

### Poison

A `Poison` block has three keys, and only `maxEffect` has an effect.

`maxEffect` is one of None, Mild, Medium, Severe, Extreme or Deadly :cite[(`PoisonEffect.java:16-21`)]. The poison lookup returns `maxEffect` whatever the amount or ratio, so `minAmount` and `diluteRatio` are stored and never used :cite[(`PoisonInfo.java:35-37`)]. The poison dose for a drinker is `maxEffect`'s level times 7, and it is stored in the fluid's properties, so a fluid with a `Poison` block and no `Properties` block poisons nobody who drinks it :cite[(`PoisonEffect.java:37-39`, `Fluid.java:271-286`)]. In the 42.22 scripts, ten fluids have a `Poison` block, and six of them (Petrol, PoisonPotent, CleaningLiquid, Dye, HairDye and Acid) have no `Properties` :cite[(`media/scripts/generated/fluids.txt:55-79`)].

### Blend rules

Blend rules say what a fluid may be mixed with, and a fluid script takes them only as inline blocks.

Petrol allows only fuels :cite[(`media/scripts/generated/fluids.txt:71-79`)]. A filter block takes `whitelist = true` or `false`, a `fluids { ... }` list and a `categories { ... }` list :cite[(`FluidFilterScript.java:166-192`)]. Two fluids mix only when each allows the other; a fluid always blends with itself :cite[(`Fluid.java:343-346`, `FluidContainer.java:906-916`)]. A scalar form such as `BlendWhiteList = MyFilter,` is not among the keys the fluid script accepts, so it is logged as an unknown key :cite[(`FluidDefinitionScript.java:234-257`)].

### The name rule

A fluid script named like a vanilla fluid replaces that fluid, in any module and in any letter case, and any other name becomes a modded fluid :cite[(`FluidDefinitionScript.java:223-228`, `Fluid.java:156-181`)]. Name yours something new. The Lua call `Fluid.Get(name)` and the `addFluid(String, float)` call look the name up by exact spelling :cite[(`Fluid.java:106-112`)].

## The FluidContainer component

A container is a `component FluidContainer` block, and it works on an item or on a world entity.

Vanilla uses it on 133 items and on world entities such as the well, a rain collector and the fuel pump :cite[(`media/scripts/generated/entities/appliances/workstations/entity_well.txt:11-29`, `media/scripts/generated/entities/outdoors/entity_raincollector.txt`, `media/scripts/generated/entities/appliances/workstations/entity_fuelpump.txt`)]. The Bucket sets a name, a rain factor, a capacity and a transfer rate :cite[(`normal.txt:13906-13912`)]. A petrol can starts full of petrol :cite[(`normal.txt:7216-7235`)].

```
component FluidContainer
{
    ContainerName = GasCan,
    Capacity = 10.0,
    Fluids
    {
        fluid = Petrol:1.0,
    }
}
```

The keys the script reads are these (matched without regard to case):

| Key | Meaning | Code |
|---|---|---|
| `Capacity` | Liters. Default 1.0; the engine raises anything below 0.05 | `FluidContainerScript.java:34`, `:75`, `:148-149` |
| `ContainerName` | Default `FluidContainer`; whitespace is removed with an error message | `FluidContainerScript.java:150-156` |
| `InitialPercent`, `InitialPercentMin`, `InitialPercentMax` | The starting fill as a fraction of capacity from 0 to 1; a min above the max is swapped, and the value is clamped | `FluidContainerScript.java:157-166`, `:74-85` |
| `Fluids { ... }` | What the container starts with, as `fluid = Name:ratio` lines or `Fluid { type = ..., percentage = ... }` blocks. This is the starting content, not a list of allowed fluids | `FluidContainerScript.java:188-189`, `:220-232`, `:294-307` |
| `PickRandomFluid` | When true and there are several starting fluids, one is picked at random | `FluidContainerScript.java:167-168`, `FluidContainer.java:108-112` |
| `InputLocked` | When true, nothing can be added | `FluidContainerScript.java:169-170`, `FluidContainer.java:907` |
| `Opened` | When false, the player cannot empty it, and `canAddFluid` refuses new fluid | `FluidContainerScript.java:171-172`, `FluidContainer.java:907` |
| `HiddenAmount` | Hides the amount in the UI | `FluidContainerScript.java:173-174` |
| `RainFactor` | How fast rain fills it; zero means it never catches rain | `FluidContainerScript.java:175-176`, `FluidContainerUpdateSystem.java:76-106` |
| `FillsWithCleanWater` | Rain adds clean water instead of tainted water | `FluidContainerScript.java:177-178`, `FluidContainerUpdateSystem.java:77-85` |
| `CustomDrinkSound` | Default `DrinkingFromGeneric` | `FluidContainerScript.java:179-180`, `:45` |
| `TransferRate` | Default 1.0; the empty action divides its time by it when it is above zero | `FluidContainerScript.java:181-182`, `ISFluidEmptyAction.lua:47-50` |
| `whitelist { ... }`, `blacklist { ... }` | Fluids this one container allows or refuses, as `fluid = Water` lines | `FluidContainerScript.java:190-206`, `entity_well.txt:24-28` |

When a container has several starting fluids and no `PickRandomFluid`, their ratios are normalized so they add up to 1 :cite[(`FluidContainerScript.java:86-88`)]. With no `InitialPercent` keys at all, a container with starting fluids begins full :cite[(`FluidContainerScript.java:331-337`)].

The item script itself says `ItemType = base:normal`; the item parser reads `ItemType` and has no `Type` key :cite[(`Item.java:1982`)]. See [Items: the item block in B42](/pz/build-42/modding/items-and-scripting/items-the-item-block-in-b42).

The item may also set `IconFluidMask`, which is read by the item script, not by the component :cite[(`Item.java:2938`)]. The Bucket uses it :cite[(`normal.txt:13897`)].

## Fluids in recipes

A craft recipe asks for fluid with a `-fluid` input line, and the amount is in liters.

The butter churn takes 5 liters of cow or sheep milk :cite[(`media/scripts/generated/entities/animals/craftRecipes/recipes_butter_churn.txt:11`)]. A recipe can match a whole category instead of a name, as the coffee machine does with water :cite[(`media/scripts/generated/entities/appliances/workstations/entity_coffeemachine_craftRecipe.txt:14`)]. A single fluid reads `-fluid 0.01 [Petrol]` :cite[(`media/scripts/generated/recipes/recipes.txt:80`)].

```
inputs
{
    item 1 [*],
    -fluid 5.0 [CowMilk;SheepMilk] mode:mixture,
}
```

An output can be a fluid in the engine: the output script has a fluid resource type :cite[(`OutputScript.java:69-70`)]. No vanilla script line was found that writes one, so the exact output syntax is not verified here.

## The Lua calls

The whole public surface of `FluidContainer` is open to Lua, and these are the calls you will use most.

No method of the class is hidden from Lua (the file has no `HiddenFromLua` annotation). `FluidContainer` is reached from any entity with `getFluidContainer()` :cite[(`GameEntity.java:190`)]. The core calls, with their line numbers:

| Call | What it gives you | Code |
|---|---|---|
| `addFluid(String, float)` | Adds by fluid name; it merges into an existing fluid or creates a new one, and adds nothing when the container is full or refuses the fluid | `FluidContainer.java:920`, `:936-955` |
| `canAddFluid(Fluid)` | Whether the container would accept it, honoring the blend rules, both lists, the lock and the eight-fluid limit | `FluidContainer.java:906` |
| `removeFluid(float)` | Drains across the mixture by each fluid's share | `FluidContainer.java:964`, `:989` |
| `getAmount()`, `getCapacity()`, `getFilledRatio()` | Totals | `FluidContainer.java:565`, `:537`, `:546` |
| `getSpecificFluidAmount(Fluid)`, `adjustSpecificFluidAmount(Fluid, float)` | One fluid's amount in the mix | `FluidContainer.java:737`, `:721` |
| `isMixture()` | True when more than one fluid is inside | `FluidContainer.java:862-864` |
| `getPrimaryFluid()`, `getPrimaryFluidAmount()` | The fluid with the largest amount | `FluidContainer.java:799`, `:817` |
| `isTainted()`, `isPoisonous()`, `getPoisonRatio()` | Quality checks | `FluidContainer.java:680`, `:654`, `:644` |
| `Empty()` | Removes everything | `FluidContainer.java:874` |
| `getWhitelist()`, `getBlacklist()` | The container's own lists | `FluidContainer.java:866`, `:870` |
| `FluidContainer.Transfer(source, target, amount)` | Moves fluid, each by its share; it does nothing when `CanTransfer` says no | `FluidContainer.java:1124-1153`, `:1155-1186` |

A container holds up to eight fluids :cite[(`FluidContainer.java:56`)]. Several of these calls behave in ways the names do not suggest; see [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie).

## What the engine already ships

The game ships a complete Lua layer for containers, so a mod rarely needs to draw its own fluid UI.

The shared actions and helpers are `ISFluidContainer`, `ISFluidTransferAction`, `ISFluidEmptyAction` and `ISFluidUtil` :cite[(`media/lua/shared/Fluids/ISFluidContainer.lua`, `media/lua/shared/Fluids/ISFluidTransferAction.lua`, `media/lua/shared/Fluids/ISFluidEmptyAction.lua`, `media/lua/shared/Fluids/ISFluidUtil.lua`)]. The client side has the fluid bar, the container panel, the info and transfer windows, plus a context menu and the slot controls used by entity windows :cite[(`media/lua/client/Fluids/ISFluidBar.lua`, `media/lua/client/Fluids/ISFluidContainerPanel.lua`, `media/lua/client/Fluids/ISFluidInfoUI.lua`, `media/lua/client/Fluids/ISFluidTransferUI.lua`, `media/lua/client/ISUI/ISFluidContainerMenu.lua`, `media/lua/client/Entity/ISUI/Controls/ISFluidSlot.lua`)]. A pour takes 40 action-time units for each liter, and never less than 20 :cite[(`FluidUtil.java:31-32`, `ISFluidTransferAction.lua:135`)]. A debug export, `DebugCSVExportFluidContainers`, writes each fluid item's capacity and transfer rate, which is useful for balancing against vanilla :cite[(`DebugCSVExportFluidContainers.java:33`)].

Prefer the engine's containers to a hand-rolled per-item number. The container gives you mixtures, proportional draining, blend rules, poison profiles, per-container lists and the UI bar without extra code. A vehicle part's own content number is a single float with no fluid identity, so it cannot express a mixture :cite[(`VehiclePart.java:382-394`)].

## Where fluid state is stored and synced

A container's contents are saved and synced as a component of its item, and a few rules follow from that.

The container writes and reads its whole state for the entity sync, and the item sync creates the component on the receiving side if it is missing :cite[(`FluidContainer.java:1196-1204`, `GameEntity.java:724-733`)]. Only the server sends it :cite[(`GameEntity.java:666-667`)]. An item's save includes its entity data, which is why a fluid rides along when an item is sent or saved :cite[(`InventoryItem.java:1833-1835`)]. Identical stacked items are merged only when their saved bytes match, so two flasks at different levels are never merged :cite[(`CompressIdenticalItems.java:80-129`)].

The per-tick fluid update does almost nothing for ordinary items, as described on [the start page](/pz/build-42/modding/fluids/fluids-for-modders-start-here). When you change a fluid in code on the server, you must send the change yourself: nothing sends a changed fluid on its own, and the call for an item in a crate or a vehicle part's container is `sendItemStats(item)`, whose packet carries the item's whole fluid container :cite[(`GameServer.java:3180-3212`, `ItemStatsPacket.java:170-173`)]. The table of which call fits which place is on [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer).

:::callout[How we know]{kind=proof}
Every code reference was opened in the 42.22 capture. Counts of vanilla fluid blocks, `Poison` blocks and items with a container come from reading the script files, and are not cited by line.

**Corrected since the older page:**
- The properties key `foodSicknessReduction` is `foodSicknessChange`.
- The Bucket example in 42.22 no longer lists `DisplayName`, uses `base:`-prefixed tags, and has `TransferRate = 5.0`; the old `Tags = Bucket;Cookable` form is not what 42.22 ships.
- The `Fluids { fluid = Name }` block is the container's starting content, not a list of what it may hold (the old page said it listed the allowed fluids). The allowed list is the `whitelist` block.
- A scalar `BlendWhiteList = Name` is not accepted by the fluid script.
- The vanilla fluid files moved under `media/scripts/generated/`, and there are now 61 fluids, not 20.
- The `TransferRate` field is read by the empty action, and `InitialPercent` values are fractions of capacity.

**Not verified:** the old claim that Build 41 modeled liquids as many item variants (this capture holds no Build 41 data); a vanilla `+fluid` output line; whether changing a fluid on an item already inside a vehicle part's container reaches clients, which is read from `sendItemStats` only and not watched on a server.
:::
