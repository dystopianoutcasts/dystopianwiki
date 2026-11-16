---
id: build-42-what-a-mod-fluid-can-plug-into
slug: what-a-mod-fluid-can-plug-into
title: 'What a mod fluid can plug into, and what is hardcoded to petrol'
game: pz
version: build-42
section: modding
category: fluids
difficulty: intermediate
tags:
  - fluids
  - fire
  - recipes
  - vehicles
excerpt: >-
  In 42.22 a new fluid will not fuel a generator, light a campfire or fill a Molotov: those paths name petrol. What a mod fluid gets for free, what needs a recipe, and which vessels hold it.
last_updated: '2026-11-16'
related_articles:
  - the-fluid-system
  - fluids-for-modders-start-here
  - defining-a-fluid-names-poison-properties
  - fluids-in-multiplayer
  - new-fluid
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders adding a fuel or a liquid](#3-what-it-does-not-get-everything-that-burns) | [modders adding a car fluid](#5-what-it-does-not-get-anything-on-a-car) | [modders picking a vessel](#6-vanilla-vessels-you-can-reuse)

Outcast, when you add a fluid it is tempting to think "I'll put it in the Fuel category and it will burn like petrol". It will not. Most vanilla fire, fuel and vehicle code names `Fluid.Petrol` directly. This page is the census we did before designing fluids for our car mod, redone against 42.22, so you do not have to repeat it.

:::callout[The 1-minute version]{kind=key}
- A mod fluid is accepted by any vanilla fluid container unless a blend list forbids the mix. The vanilla pour and transfer actions move it.
- It is drinkable when it is in the `Beverage` category, and its effects come from its `Properties` block.
- The vanilla fire, fuel, generator, graffiti and gas-tank code names `Fluid.Petrol`. Putting your fluid in `Fuel` does not join any of it.
- Recipes you write can take your fluid by name, or a whole category with `categories[...]`.
- A poisonous fluid poisons the person who drinks it. Poisoning a dish is a different system, driven by the `PoisonPower` of a Food item.
- The vanilla vehicle menus name petrol for the gas tank and water for washing a vehicle; any oil, coolant or brake fluid part is yours to write.
:::

:::facts
- **Vanilla items with a fluid container** 133 `component FluidContainer` blocks in four item script files, counted by script
- **Fluid category lists in vanilla recipe scripts** 25 `categories[...]` lists, all `Water`, counted by script
- **Food items with `PoisonPower`** 4: Millipede, Millipede2, MonarchCaterpillar and SwallowtailCaterpillar, counted by script
- **Petrol needed to light a fire** 0.1 liter :cite[(`media/lua/shared/defines.lua:49`)]
:::

## 1. What a mod fluid gets for free

**A mod fluid works with the container, pour, drink and recipe code that does not name a specific fluid.**

- **Containers.** Any vanilla fluid container accepts it, unless a blend list forbids the mix (see [defining a fluid](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties)). No vanilla item script sets a container whitelist; the only one in the scripts is the well's :cite[(`FluidContainer.java:906-916`, `media/scripts/generated/entities/appliances/workstations/entity_well.txt:24-28`)].
- **Pouring.** The vanilla pour and transfer actions move it, in single player and in multiplayer (see [fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer)) :cite[(`media/lua/shared/Fluids/ISFluidTransferAction.lua:5-10`)].
- **Drinking**, if you put it in `Beverage`, and the poison and nutrition in its `Properties` (see [drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling)) :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:437-443`)].
- **Recipes you write.** A recipe input can name your fluid, or take a whole category with `categories[...]` :cite[(`InputScript.java:495-497`)].
- **Counting as water.** A world object or world item whose fluids are all in the `Water` category counts as holding water, and an evolved recipe with a minimum water level reads the same rule :cite[(`IsoObject.java:3154-3156`, `EvolvedRecipe.java:646-652`)]. A mod fluid in `Water` therefore passes those checks.

## 2. What the update system does to it

**A rain-catching container evaporates petrol and fills with rain, and a mod fluid gets only the rain.**

Every update, a container with a `RainFactor` that holds petrol as its main fluid loses a little of it :cite[(`FluidContainerUpdateSystem.java:63-70`)]. When it is raining and the container is outside, it also takes in rain: tainted water, or clean water if the container is marked to fill with clean water, as long as `canAddFluid` accepts that water :cite[(`FluidContainerUpdateSystem.java:76-100`)]. So a mod fluid in a bucket left outside is diluted by rain unless a blend list or a container whitelist refuses the water. Rain itself is covered on [water and plumbing](/pz/build-42/engine/fire-water-and-power/water-and-plumbing).

## 3. What it does not get: everything that burns

**The fire, fuel and generator code checks for petrol by identity, so no category buys a mod fluid a place in it.**

| Vanilla use | What the code checks | Can a mod fluid join in? | Code |
|---|---|---|---|
| Lighting a campfire or barbecue with fuel | `contains(Fluid.Petrol)` and at least 0.1 L | No | `ISCampingMenu.lua:45-46`, `defines.lua:49` |
| Fuelling a generator | `contains(Fluid.Petrol)` | No | `ISWorldObjectContextMenu.lua:565-575` |
| Burning a corpse | A container holding petrol | No | `ISWorldObjectContextMenu.lua:16-17`, `ISWorldObjectContextMenuLogic.java:1299-1301` |
| Cleaning graffiti | A container holding petrol | No | `ISCleanGraffiti.lua:10`, `ISWorldObjectContextMenuLogic.java:3319-3323` |
| Storing fuel in a container | An empty container, or one that already holds petrol | Only an empty container | `ISWorldObjectContextMenu.lua:20-30` |
| Burning a container as campfire fuel | Any container holding fluid is refused | No, not even an empty-looking one with a drop in it | `ISCampingMenu.lua:30-38` |
| Molotov cocktail, flame bomb | The recipes list fluids by name: Molotov takes RubbingAlcohol, Petrol, Tequila, Vodka or Whiskey, and the flame bomb takes Petrol | Only through a second recipe of your own | `recipes_traps.txt:298-326` |
| Hurricane lantern refill, lighter refill | `-fluid 0.1 [Petrol]` and `-fluid 0.01 [Petrol]` | Only through your own recipe | `recipes_lightsources.txt:123-134`, `recipes.txt:69-80` |
| Taking fuel from a pump or a vehicle | The take-fuel actions add `Fluid.Petrol` to the can | No | `ISTakeFuel.lua:29`, `ISTakeGasolineFromVehicle.lua:44` |
| Refilling a hurricane lantern from the recipe code | The recipe's `OnCreate` looks for kept petrol | No | `RecipeCodeOnCreate.java:865` |
| Heat on a container | The container's petrol is destroyed and may start a fire | No | `InventoryItem.java:1486-1498` |
| The `Fuel` category | No Lua or Java line checks it; the only vanilla use is Petrol's blend whitelist | Category alone buys nothing | `fluids.txt:55-79` |

So a mod fuel needs its own code or its own recipes. Putting it in `Fuel` is still worth doing if it should mix with petrol in a gas can, and it lets your own recipes take `categories[Fuel] mode:mixture`. A search of the capture's Lua and Java for `FluidCategory.Fuel` finds nothing, and every `categories[...]` list in the vanilla scripts is `Water`, so the `Fuel` row holds for the whole capture.

## 4. What it does not get: poisoning food

**Poisoning a dish in vanilla is not done with fluids, so a poisonous fluid poisons only the person who drinks it.**

An evolved recipe passes poison on when an ingredient is a **Food** item with `PoisonPower` above zero :cite[(`EvolvedRecipe.java:454-455`, `:508-523`)]. In the base game four Food items have it: Millipede, Millipede2, MonarchCaterpillar and SwallowtailCaterpillar :cite[(`media/scripts/generated/items/food.txt:8358`, `:8386`, `:8413`, `:8599`)].

## 5. What it does not get: anything on a car

**The vanilla vehicle menus name petrol for the gas tank and water for washing; no vanilla car part carries oil, coolant or brake fluid.**

Petrol is checked by identity for filling and siphoning the gas tank :cite[(`media/lua/client/Vehicles/ISUI/ISVehiclePartMenu.lua:9-10`, `:21-22`, `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua:10`, `:18`)]. 

Washing a vehicle accepts a container holding Water or TaintedWater :cite[(`media/lua/shared/Vehicles/TimedActions/ISWashVehicle.lua:6`)]. Tires are filled through the part's `Air` container content type, which is not a fluid :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:290`)]. No file in the Java vehicles package names a fluid. The engine template has no install or uninstall table and no container, so the engine part has no fluid action :cite[(`media/scripts/generated/vehicles/template_engine.txt:1-20`)].

If your mod adds oil, coolant or brake fluid to a car, every action that adds, drains or checks it is yours to write. The game ships no motor oil, coolant, brake fluid or transmission fluid either, as the fluid scripts show :cite[(`media/scripts/generated/fluids.txt:3`)].

## 6. Vanilla vessels you can reuse

**There is no basin, drain pan, oil pan or wash tub item in the base game, so the best carryable vessels are buckets, pots, jars and cans.**

The metal drum is furniture with no fluid container, and the baking and roasting pans are cookable but have none :cite[(`media/scripts/generated/items/moveable.txt:2543`, `media/scripts/generated/items/normal.txt:3975`, `:4036`)]. The vessels that do hold fluid fall into three groups. A vessel catches rain when its container has a `RainFactor`.

- **Catch rain:** the 10 L buckets (`Bucket`, `BucketEmpty`, `BucketForged`, `BucketWood`, `BucketCarved`, `PaintbucketEmpty`), the 20 L `BucketLargeWood`, the 8 L `WateredCan`, the 1.5 L `Pot` and `PotForged`, the ceramic crucibles (3 L and 1.5 L), jars, bowls, tin cans and cups :cite[(`media/scripts/generated/items/normal.txt:13889`, `:13249`, `:1483`, `:13299`, `:4008`, `:9854`, `:3351`, `:3770`, `:7599`)].
- **Do not catch rain:** the 10 L `PetrolCan` and 20 L `JerryCan`, the 15 L `WaterDispenserBottle`, the 2 L `PopBottle`, the 1 L `WaterBottle`, canteens, the 1.5 L `Kettle` and the 16 L `KnapsackSprayer` :cite[(`media/scripts/generated/items/normal.txt:7216`, `:14250`, `:14382`, `:7103`, `:13346`, `:4112`, `:14042`, `media/scripts/generated/items/clothing.txt:24538`)].
- **Cookable** (they heat on a stove, see [hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer)): the ones tagged `base:cookable`, such as `Pot`, `Kettle`, `Bucket`, `EmptyJar` and `JerryCan`. The plastic bottles and the `PetrolCan` carry `base:cookablemicrowave` instead :cite[(`media/scripts/generated/items/normal.txt:4008`, `:4112`, `:13889`, `:3351`, `:14250`, `:7103`, `:7216`)].

A cookable container is a trap for a flammable mod fluid. Heat above 1.6 destroys petrol and starts a fire, and a mod fluid gets none of that special handling :cite[(`InventoryItem.java:1478-1498`)].

## Where to go next

- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)
- [Defining a fluid: names, Poison and Properties](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties)

:::callout[How we know]{kind=proof}
Every code reference was opened in the 42.22 capture. The counts (133 containers, 25 category lists, 4 poisonous Food items) come from reading the script files, not from a cited line. The list of vessels was read from the item scripts.

**Checked again for 42.22, and different from 42.21:**
- Petrol is now also named by the graffiti cleaner, the corpse burner, the lighter refill and the fuel-storage menu, besides the campfire, generator, Molotov and lantern.
- The vanilla vehicle code names a second fluid pair: Water and TaintedWater, for washing a vehicle.
- The 42.21 claim that only Petrol and air appear in the vehicle menus no longer holds.
- `JerryCan` is `base:cookable`; the `PetrolCan` and the plastic bottles carry the microwave tag.

**Not verified:** the Lua and the Java world-object menu code both name petrol with different minimum amounts for burning a body (0.099 L in the Lua, more than 0.5 L in the Java); which of the two runs in a given game was not traced.
:::
