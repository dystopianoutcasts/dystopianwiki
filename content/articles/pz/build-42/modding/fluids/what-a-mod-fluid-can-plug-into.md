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
  Your new fluid will not fuel a generator, light a campfire or fill a
  Molotov, however you categorise it: those paths name petrol. What a mod
  fluid gets for free, what it needs a recipe for, and which vanilla vessels
  can carry it. Read from the 42.21 scripts and Lua.
last_updated: '2026-10-04'
---
# What a mod fluid can plug into, and what is hardcoded to petrol

Outcast, when you add a fluid it is tempting to think "I'll put it in the Fuel category and it will burn like petrol". It will not. Most vanilla fire, fuel and vehicle code names `Fluid.Petrol` directly. This page is the census we did before designing fluids for our car mod, so you do not have to repeat it.

## What a mod fluid gets for free

- **Containers.** Any vanilla fluid container accepts it, unless a blend list forbids the mix (see [defining a fluid](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties)). No vanilla item restricts what it holds.
- **Pouring.** The vanilla pour and transfer actions move it, in single player and in multiplayer (see [fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer)).
- **Drinking**, if you put it in `Beverage`, and the poison and nutrition in its `Properties`.
- **Recipes you write.** A recipe input can name your fluid, or take a whole category with `categories[...]`.

> **Proof:** Code. `zombie.entity.components.fluids.FluidContainer#canAddFluid`; `media/lua/shared/Fluids/ISFluidTransferAction.lua`; `zombie.scripting.entity.components.crafting.InputScript` (fluid inputs by name or category). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What it does not get: everything that burns

| Vanilla use | What the code checks | Can a mod fluid join in? |
|---|---|---|
| Lighting a campfire or barbecue with fuel | `contains(Fluid.Petrol)` and at least 0.1 L | No |
| Fuelling a generator | `contains(Fluid.Petrol)` | No |
| Burning a container as campfire fuel | Any container holding fluid is refused | No, not even an empty-looking one with a drop in it |
| Molotov cocktail | The recipe lists fluids by name: RubbingAlcohol, Petrol, Tequila, Vodka, Whiskey | Only through a second recipe of your own |
| Hurricane lantern refill | `-fluid 0.1 [Petrol]` | Only through your own recipe |
| The `Fuel` category | Nothing in the game's Lua or Java checks it. It only makes your fluid blend with petrol, because petrol's blend whitelist is `Fuel` | Category alone buys nothing |

So a mod fuel needs its own code or its own recipes. Putting it in `Fuel` is still worth doing if it should mix with petrol in a gas can, and it lets your own recipes take `categories[Fuel] mode:mixture`.

> **Proof:** Code. `media/lua/shared/Camping/ISCampingMenu.lua`, `ISCampingMenu.isPetrol` and `ISCampingMenu.shouldBurn` (`if item:getFluidContainer() and item:getFluidContainer():getAmount() > 0 then return false end`); `media/lua/client/ISUI/ISWorldObjectContextMenu.lua`, generator fuel (`contains(Fluid.Petrol)`); `media/scripts/generated/recipes/recipes_traps.txt`, `craftRecipe MakeMolotovCocktail`; searched the installed Lua and the decompiled Java for `FluidCategory.Fuel` (no code hits); `media/scripts/generated/fluids.txt`, Petrol's `BlendWhiteList`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What it does not get: poisoning food

Poisoning a dish in vanilla is not done with fluids. An evolved recipe passes poison on when an ingredient is a **Food** item with `PoisonPower` above zero, and in the base game only four insects have it. A poisonous fluid poisons the person who drinks it and nobody else.

> **Proof:** Code. `zombie.scripting.objects.EvolvedRecipe`, the `food.getPoisonPower() > 0` branch that calls `addPoison`; searched the installed item scripts for `PoisonPower` (four Food items in `food.txt`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What it does not get: anything on a car

The vanilla vehicle menus touch two fluids and no others: petrol, for the gas tank and the siphon, and air, for the tyres. The engine part has no install table and no fluid action. If your mod adds oil, coolant or brake fluid to a car, every action that adds, drains or checks it is yours to write. The game ships no motor oil, coolant, brake fluid or transmission fluid either.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua` and `ISVehiclePartMenu.lua` (petrol through `Fluid.Petrol`, tyres through the `Air` container type); `media/scripts/generated/vehicles/template_engine.txt` (no install or uninstall table); `media/scripts/generated/fluids*.txt` (no car fluids). Build 42.21, Steam build 25485521.

## Vanilla vessels you can reuse

There is no basin, drain pan, oil pan or wash tub item in the base game, and the metal drums and barrels are furniture with no fluid component. The best carryable vessels:

- **Open-topped** (they catch rain, which is the game's own sign of an open top): the 10 L buckets (metal, forged, wooden, paint), the 20 L large wooden bucket, the 8 L watering can, the 1.5 L cooking pots, ceramic crucibles, jars, bowls, tin cans and cups.
- **Closed:** the 10 L gas can and 20 L jerrycan, the 15 L dispenser bottle, the 2 L pop bottles, the 1 L water bottles, canteens, the 16 L backpack sprayer.
- **Cookable** (they heat on a stove, see [hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer)): the ones tagged `base:cookable`, such as pots, kettles, buckets and jars. The frying, baking and roasting pans are cookable but cannot hold fluid at all.

> **Proof:** Code. Read the `component FluidContainer` blocks (`Capacity`, `RainFactor`) and `Tags` in the installed `media/scripts/generated/items/*.txt`; `MetalDrum` in `moveable.txt` has no fluid component. Build 42.21, Steam build 25485521.

## Where to go next

- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)
- [Defining a fluid: names, Poison and Properties](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties)
