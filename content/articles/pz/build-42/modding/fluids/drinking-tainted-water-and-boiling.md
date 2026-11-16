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
  When 42.22 offers Drink, when a double-click drinks without asking, what auto-drink picks, what heat does to tainted water, why a name can hide a poison, and why recipes refuse your bottle.
last_updated: '2026-11-16'
related_articles:
  - the-fluid-system
  - fluids-for-modders-start-here
  - defining-a-fluid-names-poison-properties
  - hot-items-in-multiplayer
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders adding a drink or a poison](#1-when-the-game-offers-drink) | [modders writing recipes](#7-why-a-recipe-that-wants-water-refuses-your-bottle)

Outcast, this one is for every modder who adds a drink, a poison, a cleaning liquid or anything else a survivor might put in a bottle, and for every player who has wondered why the game drank something without asking. The rules are spread across the inventory menu, the inventory pane, the character and the item. Here they are in one place.

:::callout[The 1-minute version]{kind=key}
- Right-click offers Drink for a container whose main fluid is a `Beverage` or bleach, and for water when the survivor is thirsty. A container with a capacity over 3 liters shows it grayed out.
- Double-clicking a container whose main fluid is a `Beverage` drinks all of it, unless the game "knows" it is tainted. A container holding only your fluid is never "known", so give a poison a category other than `Beverage`.
- Auto-drink looks only for a container where every fluid is in the `Water` category. A fluid-container item needs at least 0.12 liters; a water-only item that is an inventory container (a bag) is not held to that. A multiplayer client does not run it; single player and the dedicated server do.
- A container above heat 1.6 turns its tainted water into clean water, and destroys all its fluid if it holds petrol.
- An item's name can hide a poison, so read the fluids themselves when you show a player what is inside.
- A recipe fluid input is `exact` unless you give a mode, and `exact` refuses a mixture.
:::

:::facts
- **Drink size limit** a container over 3.0 liters of capacity cannot be drunk from :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:2318`)]
- **Thirst needed to drink water** above 0.1 :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:437`)]
- **Auto-drink minimum** 0.12 liters, for a fluid-container item that is not a bag :cite[(`IsoGameCharacter.java:11680-11704`)]
- **Heat that purifies** above 1.6 :cite[(`InventoryItem.java:1478`)]
- **Purify rate** 0.6 liter per unit on a dedicated server, about 29 liters per real second at most; 0.01 liter per frame-multiplier unit on a client or single player :cite[(`InventoryItem.java:1481`)]
- **Recipe fluid modes** 4: exact, primary, mixture, anything :cite[(`FluidMatchMode.java:14-17`)]
:::

## 1. When the game offers Drink

**Right-click offers Drink only for a container whose main fluid is a `Beverage` or bleach, plus water when the survivor is thirsty.**

The main fluid is the one there is most of.

The menu builder sorts a container into one of two slots: a water source, when its main fluid is Water, TaintedWater or CarbonatedWater, or any other fluid container :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:307-322`, `FluidContainer.java:839-841`)]. A water source gets Drink only while the survivor's thirst is above 0.1. Any other container gets Drink when its main fluid is in `Beverage`, or is bleach :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:437-443`)]. Everything else gets Pour and nothing more.

The Drink entry is not always usable:

- **Too big.** A container whose capacity is more than 3 liters shows Drink grayed out, with a tooltip that tells the player to transfer some to a smaller container. That is decided by capacity, not by how much is inside, so nobody drinks from a bucket, a gas can or a large bottle, however little is left :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:2318-2322`, `media/lua/shared/Translate/EN/Tooltip.json:543`)].
- **Sealed.** A container the player cannot empty is grayed out with "Needs to be opened first.", unless it has an opening recipe the survivor can do :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:2308-2312`, `media/lua/shared/Translate/EN/Tooltip.json:563`)].
- **Too full.** When the survivor's "food eaten" moodle is at level 3 or above and the fluid changes hunger, the entry is grayed out with "Too full to eat more." :cite[(`media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:2313-2317`, `media/lua/shared/Translate/EN/Tooltip.json:264`)]

This menu is client Lua. The drink itself runs through `DrinkFluid` in the character code, which the poison and tainted-water sections below read.

## 2. A double-click drinks a Beverage without asking

**Double-clicking a container drinks it all when its main fluid is a `Beverage` and the game does not know its tainted status.**

That is the fast way to drink a soda, and it is also a trap: if your mod gives a poisonous fluid the `Beverage` category, a double-click on the bottle drinks the poison :cite[(`media/lua/client/ISUI/ISInventoryPane.lua:1039-1041`)]. A container whose main fluid is Water or CarbonatedWater is drunk by a second branch, but only when thirst is above 0.1, and only as much as the survivor needs (twice the thirst value, or what is left) :cite[(`media/lua/client/ISUI/ISInventoryPane.lua:1063-1068`)]. A sealed container is opened first.

"Tainted status known" is true when the main fluid is bleach. It is also true when the sandbox option "Enable 'Tainted Water' tooltip" is on and the container holds tainted water or bleach and has a poison effect :cite[(`FluidContainer.java:1360-1366`, `media/lua/shared/Translate/EN/Sandbox.json:841`)]. That option is enabled by default and in the Apocalypse, Outbreak, Rising and SixMonthsLater presets; the `Extinction` preset sets it to false :cite[(`SandboxOptions.java:180`, `media/lua/shared/Sandbox/Apocalypse.lua:106`, `media/lua/shared/Sandbox/Extinction.lua:106`)]. With the option off, only bleach is "known" :cite[(`FluidContainer.java:1360-1366`)].

A container that holds only your fluid is never "known", so the double-click fires for it. A container where your fluid is mixed with tainted water is "known" while the option is on, and the `Beverage` double-click branch is skipped.

**The safe way:** keep a dangerous fluid out of `Beverage`, and offer Drink from your own right-click entry if a survivor should be able to drink it on purpose.

## 3. Auto-drink only takes pure water

**When a survivor drinks on their own, the game picks a container in which every fluid is in the `Water` category, and a fluid-container item must hold at least 0.12 liters.**

Auto-drink runs only when thirst is above 0.1, and it drinks twice the thirst value or what the container holds, whichever is less :cite[(`IsoGameCharacter.java:11662-11672`)]. It is skipped when the game is a multiplayer client, so the dedicated server and single player run it :cite[(`IsoGameCharacter.java:11651`)]. The survivor must not be asleep, aiming, climbing, falling or knocked down, and the player's auto-drink settings must allow it :cite[(`IsoGameCharacter.java:11652-11660`)].

The container search walks the main inventory list in order. With the "Enable 'Tainted Water' tooltip" option on (the default), it also skips containers that hold any `Hazardous` fluid, which is how it avoids tainted water :cite[(`IsoGameCharacter.java:11680-11704`)]. The `Extinction` preset sets that option to false, and with it off auto-drink no longer skips hazardous containers :cite[(`media/lua/shared/Sandbox/Extinction.lua:106`, `IsoGameCharacter.java:11689-11690`)].

The 0.12 liter minimum is checked only for a fluid-container item, and an item that is also an `InventoryContainer` falls through. Any other non-empty, water-only item is taken at any amount :cite[(`IsoGameCharacter.java:11693-11700`)]. One drop of any fluid outside the `Water` category in a bottle of water, your mod's fluid included, and that bottle is never auto-drunk :cite[(`FluidContainer.java:843-855`)].

## 4. Tainted water: what it is and what it does

**Tainted water is a Beverage, a Water and Hazardous at once, and on screen it is called plain "Water".**

- **It is called "Water" on screen.** The English display name of `TaintedWater` is "Water" :cite[(`media/lua/shared/Translate/EN/Fluids.json:183`)]. When the tainted-water tooltip option is enabled, a single-fluid container of it gets "(Tainted)" added to its name :cite[(`FluidContainer.java:458-462`, `media/lua/shared/Translate/EN/Fluids.json:36`)].
- **Any amount counts.** `isTainted()` is true when the container holds any tainted water at all, even a trace in a mix :cite[(`FluidContainer.java:680-688`)].
- **It is a Beverage, a Water and Hazardous.** So it is drinkable, it washes things that accept any water, and auto-drink avoids it only when the sandbox text option is enabled :cite[(`media/scripts/generated/fluids.txt:18-26`)].
- **It changes the dose of everything else in the drink.** If a drink contains any tainted water, the whole poison dose is multiplied by 0.75, and an Iron Gut survivor takes none at all :cite[(`IsoGameCharacter.java:5893`, `:5911-5921`)]. The tainted water lowers the other poisons in the same bottle. The full table of traits is on [defining a fluid](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties).

## 5. What heat does to a container of fluid

**A container held above heat 1.6 turns its tainted water into clean water a little at a time, and destroys everything inside if it holds petrol.**

A container with the `base:cookable` tag (a pot, kettle, bucket or jar) heats in a stove, fireplace, barbecue or campfire. A microwave heats the items tagged `CookableMicrowave`. The heat is capped at 3.0 :cite[(`InventoryItem.java:1470-1475`, `ItemTag.java:89-90`)]. Once it is above 1.6:

- **Tainted water turns into clean water, only the tainted water.** Every other fluid in the mix stays as it was. A mix of tainted water and your poison comes out as clean water and your poison, no longer "known tainted", and a double-click will drink it. If a poison is meant to stay a poison, it must not travel in tainted water :cite[(`InventoryItem.java:1479-1484`)].
- **Petrol is destroyed and starts a fire.** The whole contents, every fluid in the container, are removed, and a fire starts on the square unless the container is in a campfire or fireplace :cite[(`InventoryItem.java:1486-1498`)].

The speed depends on the host, because the item's time multiplier is set differently. A dedicated server computes it from real elapsed time since the item's last update (clamped to 6 seconds), and every other host uses the game's frame multiplier :cite[(`InventoryItem.java:1407-1415`)]. On the server the multiplier is about 48 per real second at normal speed (0.8 x 60, times the speed bias) :cite[(`GameTime.java:1001-1003`)]. So the server converts 0.6 liter per unit, about 29 liters per second at most (a container never loses more than its tainted water), and its heat rises by temperature divided by 16 per unit, about 3 times the source temperature per second :cite[(`InventoryItem.java:1472`, `:1481`)].

A client or single player converts 0.01 liter per unit and heats at one thousandth of the source temperature per unit, and its units come from the frame multiplier, so the real-time speed depends on the frame rate and the game speed. The heat sources and the multiplayer difference are on [hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer).

One vanilla recipe uses the same 1.6 line. `DisinfectBandage` carries an `OnTest` that passes for a fluid container only when its heat is above 1.6, and its tooltip says the water container needs to be very hot :cite[(`media/scripts/generated/recipes/recipes_medical.txt:83-94`, `RecipeCodeOnTest.java:39-41`, `media/lua/shared/Translate/EN/Tooltip.json:219`)].

## 6. The item name can hide a poison

**The name on a container is a summary of its fluids, not a list, and it can leave out the poisonous one.**

The name is built by `getUiName`, and the rules below describe it for the English strings :cite[(`FluidContainer.java:413-520`)]:

- With one fluid, the name shows that fluid.
- With two fluids where one is poisonous, the name shows one of them. It shows the fluid listed first in the container, unless that one is in the `Poisons` category, in which case it shows the other one. Bleach is `Hazardous`, not `Poisons`, so a bottle where water went in first and then bleach is named for the water :cite[(`FluidContainer.java:467-478`, `media/scripts/generated/fluids.txt:179-186`)].
- With two fluids and no poison, the name shows both, with the smaller amount named first. If the two display names are equal, one name shows. The "(Tainted)" suffix applies to two-fluid names too, when the option is enabled :cite[(`FluidContainer.java:472`, `:480-493`)].
- With three or more fluids, the name says "Mixed Beverages", "Cocktail" (two or more alcoholic beverages) or "Mixed Liquids" :cite[(`FluidContainer.java:496-516`, `media/lua/shared/Translate/EN/Fluids.json:29-31`)].
- With the tainted-water tooltip option off, tainted water that sits beside a fluid with the same display name is dropped from the name, so tainted water mixed with clean water shows as plain water :cite[(`FluidContainer.java:419-433`)].

If your mod shows a player what is in a container, read the fluids themselves (`getSpecificFluidAmount` for each) rather than the name.

## 7. Why a recipe that wants Water refuses your bottle

**A fluid input matches in `exact` mode unless the recipe line gives a mode, and `exact` refuses any mixture.**

The default mode is `exact` :cite[(`InputScript.java:76`)]. In `exact` mode the container must not be a mixture and its main fluid must be in the input's list :cite[(`InputScript.java:503-512`)]. So `-fluid 0.5 [Water]` refuses tainted water, which is a different fluid, and refuses a mix of any kind, even 99 percent water. A `categories[Water]` list accepts tainted water, because tainted water is in the `Water` category, but in `exact` mode it still refuses a mix.

The modes loosen or tighten the check :cite[(`InputScript.java:503-531`, `:703-714`)]:

:::chips
- exact: one fluid only, and it must be on the list
- primary: only the main fluid must be on the list
- mixture: every fluid in the container must be on the list
- anything: any container with fluid
:::

An unknown mode word makes the recipe fail to load :cite[(`InputScript.java:710`)]. In vanilla, the recipes that take any water (washing rags, buckets, some cooking) write `categories[Water] mode:mixture`, for example cleaning a bandage :cite[(`media/scripts/generated/recipes/recipes_medical.txt:108-117`)]. Disinfecting a bandage writes `-fluid 0.5 [Water]`, the exact form, and also needs the hot container from the heat section :cite[(`media/scripts/generated/recipes/recipes_medical.txt:83-94`)].

## Where to go next

- [Defining a fluid: names, Poison and Properties](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties)
- [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer)
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)

:::callout[How we know]{kind=proof}
Every code reference was opened in the 42.22 capture. Nothing here was run in a game.

**Checked again for 42.22, and different from 42.21:**
- The sandbox option for tainted-water text is on in the Java default and in four presets (Apocalypse, Outbreak, Rising, SixMonthsLater), so those games avoid tainted water in auto-drink and in the double-click. The `Extinction` preset turns it off, and there only bleach is "known".
- Drink is also grayed out for a sealed container and for a survivor who has eaten too much, besides the 3 liter limit.
- A `mixture` input needs every fluid in the container to be on the input's list; it does not accept any mix.
- With two fluids and a poison, the name shows the first fluid unless it is in the `Poisons` category, so the order matters only when neither or both are in that category.

**Not verified:** the real-time speed on a client or in single player (it follows the frame multiplier); how the auto-drink setting is stored per player on a dedicated server.
:::
