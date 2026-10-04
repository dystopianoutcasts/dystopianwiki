---
id: build-42-drinking-tainted-water-and-boiling
slug: drinking-tainted-water-and-boiling
title: 'Drinking, tainted water and boiling: what the game really checks'
game: pz
version: build-42
section: modding
category: fluids
difficulty: intermediate
tags:
  - fluids
  - drinking
  - tainted-water
  - cooking
excerpt: >-
  When the game offers Drink, when a double-click drinks a bottle without
  asking, why nobody drinks from a bucket, what boiling does to a mixture, why
  the item name can hide a poison, and why a recipe that wants Water refuses
  your bottle. Read from the 42.21 code.
last_updated: '2026-10-04'
---
# Drinking, tainted water and boiling: what the game really checks

Outcast, this one is for every modder who adds a drink, a poison, a cleaning liquid or anything else a survivor might put in a bottle, and for every player who has wondered why the game drank something without asking. The rules are spread across the inventory menu, the inventory pane, the character and the item. Here they are in one place.

## When the game offers Drink

Right-click a container that holds fluid. The game offers **Drink** only when the container's main fluid (the one there is most of) is in the `Beverage` category, or is bleach. Everything else gets Pour and nothing more. Water also gets a Drink entry when the survivor is thirsty, through the water-source path.

A container that holds **more than 3 litres** shows Drink greyed out with "can't drink from this". That is decided by the container's capacity, not by how much is in it, so nobody drinks from a bucket, a gas can or a large bottle, however little is left.

> **Proof:** Code. `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua`, the fluid branch of the context menu (`fluid:isCategory(FluidCategory.Beverage) or fluid:getFluidType() == FluidType.Bleach`) and `ISInventoryPaneContextMenu.doDrinkFluidMenu` (`getCapacity() > 3.0`). Build 42.21, Steam build 25485521.

## A double-click drinks a Beverage without asking

Double-clicking an item in the inventory drinks it when its main fluid is a `Beverage` and its "tainted status" is not known. That is the fast way to drink a soda, and it is also a trap: if your mod gives a poisonous fluid the `Beverage` category, a double-click on the bottle drinks the poison.

"Tainted status known" is true only for bleach, or, when the sandbox option that shows tainted water is on, for a container holding tainted water or bleach that is actually poisonous. A mod fluid is never "known", so the double-click always fires for it.

**The safe way:** keep a dangerous fluid out of `Beverage`, and offer Drink from your own right-click entry if a survivor should be able to drink it on purpose.

> **Proof:** Code. `media/lua/client/ISUI/ISInventoryPane.lua`, the double-click handler (`getPrimaryFluid():isCategory(FluidCategory.Beverage) and (not ... isTaintedStatusKnown())` then `onDrinkFluid`); `zombie.entity.components.fluids.FluidContainer#isTaintedStatusKnown`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Auto-drink only takes pure water

When a survivor drinks on their own, the game looks for a container in which **every** fluid is in the `Water` category, holding at least 0.12 litres. With the tainted-water sandbox option on, it also skips containers that are `Hazardous`, which is how it avoids tainted water. One drop of any non-Water fluid in a bottle of water, your mod's fluid included, and that bottle is never auto-drunk again.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#getWaterSource`; `FluidContainer#isWaterOnlySource`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Tainted water: what it is and what it does

- **It is called "Water" on screen.** The English display name of `TaintedWater` is "Water". Only the sandbox option for tainted-water text adds the "Tainted" word to the item name.
- **Any amount counts.** `isTainted()` is true when the container holds any tainted water at all, even a trace in a mix.
- **It is a Beverage, a Water and Hazardous.** So it is drinkable, it washes things that accept any water, and auto-drink avoids it only when the sandbox text option is on.
- **It changes the dose of everything else in the drink.** If a drink contains any tainted water, the whole poison dose is multiplied by 0.75, and an Iron Gut survivor takes none at all. The tainted water protects the other poisons in the same bottle.

> **Proof:** Code. `media/scripts/generated/fluids.txt` (`fluid TaintedWater`: categories Beverage, Hazardous, Water); `media/lua/shared/Translate/EN/Fluids.json` (`Fluid_Name_TaintedWater` is "Water"); `FluidContainer#isTainted`; `IsoGameCharacter#DrinkFluid`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What heat does to a container of fluid

A container tagged `base:cookable` (a pot, kettle, bucket, jar) heats up in a stove, fireplace, barbecue or campfire. Once its heat is above 1.6:

- **Tainted water turns into clean water, a little at a time, and only the tainted water.** Every other fluid in the mix stays exactly as it was. A mix of tainted water and your poison comes out as clean water and your poison, no longer "known tainted", and a double-click will drink it. If a poison is meant to stay a poison, it must not travel in tainted water.
- **Petrol is destroyed and starts a fire.** The whole contents are removed and a fire starts on the square, unless the container is in a campfire or fireplace.

How hot each heat source gets, and why this behaves differently in multiplayer, is on [hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer).

> **Proof:** Code. `zombie.inventory.InventoryItem#update`, the fluid-container heat block (`if (this.itemHeat > 1.6F && !cont.isEmpty())`: `adjustSpecificFluidAmount(Fluid.TaintedWater, ...)` plus `addFluid(Fluid.Water, ...)`, and the `Fluid.Petrol` branch with `IsoFireManager.StartFire`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The item name can hide a poison

The name on an item is a summary, not a list:

- With two fluids where one is poisonous, the name shows only one of them, and which one depends on the order they went in. A "Bottle of Water" can hold bleach.
- With three or more fluids, the name says "Mixed Beverages", "Cocktail" or "Mixed Liquids".
- With the tainted-water text off, tainted water mixed with clean water shows as plain water.

If your mod shows a player what is in a container, read the fluids (`getSpecificFluidAmount` for each) rather than the name.

> **Proof:** Code. `FluidContainer#getUiName`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Why a recipe that wants Water refuses your bottle

A recipe input such as `-fluid 0.5 [Water]` matches **exactly** by default: the container must hold one single fluid, and that fluid must be on the list. Tainted water is refused (it is a different fluid). A mixture is refused, even 99% water. Only inputs written with a mode, such as `-fluid 0.5 categories[Water] mode:mixture`, accept a mix or tainted water. In vanilla, the recipes that take any water (washing rags, buckets, some cooking and farming) use that second form; disinfecting a bandage uses the exact form, which is why it needs clean boiled water.

The modes are `exact` (the default), `primary`, `mixture` and `anything`.

> **Proof:** Code. `zombie.scripting.entity.components.crafting.InputScript` (`fluidMatchMode = FluidMatchMode.Exact` by default; the exact test is `!container.isMixture() && this.containsFluid(container.getPrimaryFluid())`; the mode keywords are parsed in its load code). Vanilla recipe lines read in the installed `media/scripts/generated/recipes`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Defining a fluid: names, Poison and Properties](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties)
- [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer)
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)
