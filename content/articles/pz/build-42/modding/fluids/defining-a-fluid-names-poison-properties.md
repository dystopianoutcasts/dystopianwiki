---
id: build-42-defining-a-fluid-names-poison-properties
slug: defining-a-fluid-names-poison-properties
title: 'Defining a fluid: names, Poison and Properties'
game: pz
version: build-42
section: modding
category: fluids
difficulty: intermediate
tags:
  - fluids
  - scripts
  - poison
  - silent-failure
excerpt: >-
  What a fluid script really does in 42.22: a vanilla name replaces the vanilla fluid, a Poison block poisons nobody without a Properties block, and minAmount and diluteRatio are never used.
last_updated: '2026-11-16'
related_articles:
  - the-fluid-system
  - fluids-for-modders-start-here
  - drinking-tainted-water-and-boiling
  - fluid-container-calls-that-lie
  - new-fluid
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders naming a fluid](#1-names-one-flat-namespace) | [modders who want a poison](#4-poison-does-nothing-without-properties)

Outcast, writing a `fluid` block takes two minutes. Finding out why it does not do what you wrote can take a week. This page is what we know now, checked against the 42.22 code. For the basic syntax, see [the fluid system](/pz/build-42/modding/fluids/the-fluid-system) and the [new fluid recipe](/pz/build-42/modding/cookbook/new-fluid).

:::callout[The 1-minute version]{kind=key}
- A fluid script named like a built-in fluid, in any letter case, replaces that fluid for every player and every mod. Give yours your own prefix.
- The module name is not part of a fluid's name: `Fluid.Get` takes the bare name after the word `fluid`.
- A `Poison` block alone poisons nobody. The poison a drinker takes comes from the fluid's `Properties`, and those exist only when at least one property is set to something other than zero.
- Of the `Poison` block's keys, only `maxEffect` is used. `minAmount` and `diluteRatio` are stored and never read.
- Two fluids mix only when each one's blend list allows the other.
- Nothing here has been run on a dedicated server; it is all read from the code.
:::

:::facts
- **Vanilla fluid scripts** 61 `fluid` blocks in three files, counted by script
- **Names built into the Java list** 31, and 27 of them have a vanilla script :cite[(`FluidType.java:19-49`)]
- **Fluid categories** 12 :cite[(`FluidCategory.java:17-28`)]
- **Poison levels** None, Mild, Medium, Severe, Extreme, Deadly; the dose is the level times 7 per liter :cite[(`PoisonEffect.java:16-21`, `:37-39`)]
- **Vanilla `Poison` blocks** 10, and only 4 of those fluids have `Properties`, counted by script
- **Fluids in one container** at most 8 :cite[(`FluidContainer.java:907`)]
:::

## 1. Names: one flat namespace

**A fluid named like a built-in fluid replaces it, and every other name becomes a mod fluid keyed by the bare name.**

When the game loads a `fluid` block it checks the name against the built-in fluid list, ignoring letter case. A match binds your block to the built-in fluid, so `fluid Water` or `fluid water` in your mod rewrites Water for every player and every mod. Any other name becomes a modded fluid keyed by that name :cite[(`FluidDefinitionScript.java:223-227`, `Fluid.java:157-181`)].

The module is ignored. `Fluid.Get("MyMod_MotorOil")` finds your fluid, and `Fluid.Get("MyModule.MyMod_MotorOil")` returns nil, because the lookup is a plain map from the bare name :cite[(`Fluid.java:106-111`, `:165`)]. Two mods that both define `fluid MotorOil` collide: both scripts load, but the name map keeps the one put in last, so put your own prefix in the fluid name.

The installed game defines 61 fluids across `fluids.txt`, `fluids_Alcoholic.txt` and `fluids_Beverages.txt` :cite[(`media/scripts/generated/fluids.txt:3`, `media/scripts/generated/fluids_Alcoholic.txt:3`, `media/scripts/generated/fluids_Beverages.txt:3`)]. The Java list has 31 names, and 27 of them have a vanilla script, so the other 34 vanilla fluids are registered by name exactly as yours will be. The four built-in names with no vanilla script are Paint, PoisonWeak, PoisonNormal and PoisonStrong. There is no motor oil, coolant, brake fluid or transmission fluid among the vanilla scripts, so a car mod has to define its own.

## 2. A complete small example

**One script file, one `mod.info` and a flask is enough to see a poison work, or fail.**

The fluid follows the vanilla syntax: commas after values, a `Properties` block and a `Poison` block :cite[(`media/scripts/generated/fluids.txt:18-38`)]. The fluid name has its own prefix. The flask is the container from [the new fluid recipe](/pz/build-42/modding/cookbook/new-fluid), which has the translation files and the full walk-through.

Copy `poster.png` from the project skeleton into `42/` as well.

File `Zomboid/mods/PoisonDemo/42/mod.info`:

```
name=Poison Demo
id=PoisonDemo
description=A flask of a poisonous drink, for testing.
poster=poster.png
```

File `Zomboid/mods/PoisonDemo/42/media/scripts/PoisonDemo_fluids.txt`:

```
module PoisonDemo
{
    fluid PoisonDemo_Toxin
    {
        ColorReference = Khaki,
        DisplayName = Fluid_Name_PoisonDemo_Toxin,
        Categories
        {
            Beverage,
        }
        Properties
        {
            ThirstChange = -10.0,
        }
        Poison
        {
            maxEffect = Medium,
        }
    }

    item Flask
    {
        ItemType = base:normal,
        Weight = 0.1,
        Icon = GlassBottle,
        component FluidContainer
        {
            ContainerName = Flask,
            Capacity = 1.0,
            Fluids
            {
                fluid = PoisonDemo_Toxin:1.0,
            }
        }
    }
}
```

To enable it, put the folder in `Zomboid/mods/`, start the game with `-debug`, tick Poison Demo in MODS and start a new game. Add `PoisonDemo.Flask` from the debug Items List, right-click it, choose Drink, and open the debug menu's General Debug window, Body tab ("Player Stats and Body"), where the Poison slider shows the stat :cite[(`media/lua/client/DebugUIs/DebugMenu/General/ISGeneralDebug.lua:22`, `media/lua/client/DebugUIs/DebugMenu/General/ISStatsAndBody.lua:103`)]. Then delete the `Properties` block and try again: the Poison stat does not move. This was checked against the code only and not run in a game; the `Beverage` category is there only so the menu offers Drink.

## 3. Categories are a fixed list

**`Categories` takes only the twelve words of the game's list, and a mod cannot add one.**

The words are Beverage, Alcoholic, Hazardous, Medical, Industrial, Colors, Dyes, HairDyes, Paint, Fuel, Poisons and Water :cite[(`FluidCategory.java:17-28`)]. A word outside the list throws when the script loads :cite[(`FluidDefinitionScript.java:285`)].

Your fluid can join any of them, and the category is what other code keys on. `Beverage` decides whether the game offers Drink, and `Water` decides auto-drink and the recipes that accept any water; both are on [drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling).

## 4. Poison does nothing without Properties

**The poison a drinker takes comes from the fluid's properties, so a fluid with a `Poison` block and no set property poisons nobody.**

This is the one most fluid mods get wrong, vanilla included. The game builds a fluid's properties only when at least one property is set to something other than its default, and while building them it copies the `Poison` block's strength into them :cite[(`Fluid.java:271-286`)]. With no properties, the fluid keeps none at all :cite[(`Fluid.java:287`)].

"Set" means different from the default, and every default is zero, so a `Properties` block whose values are all zero counts as no block :cite[(`FluidDefinitionScript.java:52-65`, `:199-206`, `:420-422`)]. When someone drinks, the container adds up the properties of each fluid in proportion to the amount swallowed, and the poison total is among them :cite[(`FluidContainer.java:995-999`, `SealedFluidProperties.java:259`)]. The character then adds that total to the poison stat :cite[(`IsoGameCharacter.java:5911`, `:5932`)].

In the 42.22 scripts, ten fluids have a `Poison` block, and four of them also have `Properties`: TaintedWater, Cologne, Perfume and Bleach :cite[(`media/scripts/generated/fluids.txt:18-38`, `:105-131`, `:133-159`, `:179-205`)]. The other six (Petrol, PoisonPotent, CleaningLiquid, Dye, HairDye and Acid) have a `Poison` block and no `Properties`, so drinking them adds nothing to the poison stat :cite[(`media/scripts/generated/fluids.txt:55-79`, `:161-177`, `:224-245`, `:247-272`, `:274-299`, `:301-324`)]. Bleach poisons because it also has `ThirstChange = -20.0` :cite[(`media/scripts/generated/fluids.txt:187-190`)].

**The safe way:** if your fluid should poison, give it a `Properties` block with at least one real non-zero effect.

A poisonous fluid still counts as poisonous to the container when its properties are empty. The container's poison label, the tainted-water checks and the name logic read the `Poison` block, not the properties :cite[(`Fluid.java:289-293`, `FluidContainer.java:664-678`)]. So a fluid like Petrol shows up as poisonous in the UI and still adds no poison when swallowed.

## 5. Two keys of the Poison block are never read

**Only `maxEffect` of the `Poison` block has an effect; `minAmount` and `diluteRatio` are stored and never used.**

The poison lookup returns `maxEffect` whatever volume and ratio it is given :cite[(`PoisonInfo.java:35-37`)]. The container's two callers pass a volume and a ratio and get the same answer back, and the two key names appear nowhere else in the Java or the vanilla Lua :cite[(`FluidContainer.java:670`, `:993`, `Fluid.java:291`)]. So a drop of your fluid in a bucket of water counts as poisonous, in name, as much as the pure fluid does. How much poison the drinker actually takes scales with how much of the fluid they swallow (next section).

A `Poison` block must name a real effect. If the block has a non-empty key but `maxEffect` is missing or is `None`, the script throws when the scripts finish loading :cite[(`FluidDefinitionScript.java:296-298`, `:392-393`)].

The script manager catches the throw, records a load error and skips the rest of that step :cite[(`ScriptManager.java:1789-1792`)]. Then the world refuses to load, with "World loading could not proceed, there are script load errors" :cite[(`IsoWorld.java:2462-2466`)]. An empty `Poison` block with no non-empty key does not set the flag and does not throw :cite[(`FluidDefinitionScript.java:296-298`)]. A key other than the three is logged as an error, and in debug mode it throws :cite[(`FluidDefinitionScript.java:302-307`)].

## 6. How strong each poison level is

**A level's dose is the level times 7 per liter swallowed, and a Deadly fluid is far stronger than any other level.**

`maxEffect` takes Mild, Medium, Severe, Extreme or Deadly, worth levels 1, 2, 3, 4 and 100 :cite[(`PoisonEffect.java:16-21`)]. The amount put into the properties is the level times 7 :cite[(`PoisonEffect.java:37-39`)].

:::chips
- Mild: 7 per liter
- Medium: 14 per liter
- Severe: 21 per liter
- Extreme: 28 per liter
- Deadly: 700 per liter
:::

So a liter of a Medium fluid adds 14 to the poison stat, and a liter of a Deadly one adds 700. There is nothing between Extreme and Deadly: a mouthful of a Deadly fluid is already more than a whole liter of an Extreme one.

Traits and tainted water change the dose, in this order :cite[(`IsoGameCharacter.java:5911-5932`)]:

| Step | Effect on the poison dose |
|---|---|
| Any tainted water in the drink | The whole dose is multiplied by 0.75 first |
| Iron Gut, drink holds tainted water | The dose becomes 0 |
| Iron Gut, no tainted water | The dose is halved, except when the main fluid is bleach |
| Weak Stomach, drink holds tainted water | The dose is multiplied by 1.2 |
| Weak Stomach, no tainted water | The dose is doubled |

## 7. Blend lists are the only thing that stops mixing

**A container holds up to eight fluids and mixes freely, so what stops a mix is each fluid's blend list, checked both ways.**

The incoming fluid must accept every fluid already there, and every fluid there must accept it :cite[(`FluidContainer.java:906-916`)]. A fluid always blends with itself, and a fluid with no list accepts anything :cite[(`Fluid.java:343-346`)]. Petrol's blend whitelist allows only the `Fuel` category, and only Petrol is in `Fuel`, so petrol mixes with nothing else :cite[(`media/scripts/generated/fluids.txt:55-79`)]. Water has no list and mixes with anything that allows it.

On top of the blend rules, a container may carry its own whitelist or blacklist. No vanilla item script sets one: in the `media/scripts` files the only container whitelist is on the well, a world entity :cite[(`media/scripts/generated/entities/appliances/workstations/entity_well.txt:24-28`)].

## 8. Two small ones in the container script

**`ContainerName` loses its spaces, and `Fluids` is only what the container starts with.**

- A `ContainerName` with whitespace is sanitized: the game strips the spaces and logs an error :cite[(`FluidContainerScript.java:150-156`)]. The name is also a translation key, because the label comes from `Fluid_Container_<ContainerName>` :cite[(`FluidContainer.java:407`)]. Vanilla's own fuel pump script has `ContainerName = Fuel Pump`, so it goes through this sanitizing too :cite[(`media/scripts/generated/entities/appliances/workstations/entity_fuelpump.txt:7`)].
- `Fluids` in a container script is what it starts with, not what it may hold. What it may hold is a separate `whitelist` or `blacklist` block :cite[(`FluidContainerScript.java:188-206`)].

## Where to go next

- [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie)
- [Drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling)
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)

:::callout[How we know]{kind=proof}
Every code reference was opened in the 42.22 capture. The counts of vanilla fluid blocks (61), `Poison` blocks (10) and fluids with `Properties` come from reading the three script files. The 31 built-in names come from the Java list.

**Checked again for 42.22, and different from 42.21:**
- The vanilla blocks are under `media/scripts/generated/`.
- In 42.22, 27 of the 61 vanilla fluids match a built-in name, not 31. Four built-in names (Paint, PoisonWeak, PoisonNormal, PoisonStrong) have no vanilla script, and 34 vanilla fluids are registered by name.
- Iron Gut does not halve the dose when the main fluid is bleach.
- A `Poison` block with a key but no real `maxEffect` throws, and the world then refuses to load.

**Not verified:** nothing here has been run on a dedicated server. Which of two same-named scripts from two mods is "last" depends on the order the script manager hands them to the fluid loader, which was not traced.
:::
