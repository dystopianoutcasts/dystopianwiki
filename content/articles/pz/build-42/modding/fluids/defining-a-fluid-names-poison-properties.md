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
  A fluid named like a vanilla one replaces it, mod fluids share one flat
  namespace, a Poison block poisons nobody without a Properties block, and
  minAmount and diluteRatio are never read. What a fluid script really does,
  read from the 42.21 code.
last_updated: '2026-10-04'
---
# Defining a fluid: names, Poison and Properties

Outcast, writing a `fluid` block takes two minutes. Finding out why it does not do what you wrote can take a week. We wrote a whole guide on fluids, trusted it, and later found three things in it that were the opposite of what the game does. This page is what we know now, checked against the 42.21 code. For the basic syntax, see [the fluid system](/pz/build-42/modding/fluids/the-fluid-system) and the [new fluid recipe](/pz/build-42/modding/cookbook/new-fluid).

## Names: one flat namespace, and vanilla names are taken

**A fluid named like a vanilla fluid replaces the vanilla one.** It does not make a second fluid in your module. When the game loads a `fluid` block, it checks the name against its built-in fluid list, ignoring case. A match binds your block to the built-in fluid, and your script becomes that fluid's script. So `fluid Water` or `fluid water` in your mod rewrites Water for every player and every mod.

**The module is ignored.** Fluids are looked up by the bare name after the word `fluid`. `Fluid.Get("MyMod_MotorOil")` finds your fluid; `Fluid.Get("MyModule.MyMod_MotorOil")` returns nil. Two mods that both define `fluid MotorOil` collide, and the one loaded last wins. Put your own prefix in the fluid name itself.

> **Proof:** Code. `zombie.scripting.objects.FluidDefinitionScript#Load` (`FluidType.containsNameLowercase(name)` binds a matching name to the built-in type, anything else becomes `FluidType.Modded` keyed by the name); `zombie.entity.components.fluids.Fluid#Init` (a built-in type gets the new script through `setScript`; modded fluids go into one map keyed by the name) and `Fluid#Get(String)`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

The installed game defines 61 fluids across `fluids.txt`, `fluids_Alcoholic.txt` and `fluids_Beverages.txt`. Only 31 of them are built into the Java fluid list; the rest are registered by name exactly as yours will be. There is no motor oil, coolant, brake fluid or transmission fluid among them, so a car mod has to define its own.

> **Proof:** Code. Counted the `fluid` blocks in the installed `media/scripts/generated/fluids*.txt` (61) and the members of `zombie.entity.components.fluids.FluidType` other than `Modded` and `None` (31). Build 42.21, Steam build 25485521.

## Categories are a fixed list

`Categories` takes only these twelve words: Beverage, Alcoholic, Hazardous, Medical, Industrial, Colors, Dyes, HairDyes, Paint, Fuel, Poisons, Water. A mod cannot add one. Your fluid can join any of them, and the category is what other code keys on: `Beverage` decides whether the game offers Drink (see [drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling)), `Water` decides auto-drink and the recipes that accept any water.

> **Proof:** Code. `zombie.entity.components.fluids.FluidCategory`; `FluidDefinitionScript#LoadCategories` (`FluidCategory.valueOf`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Poison does nothing without Properties

This is the one most fluid mods get wrong, vanilla included.

When someone drinks, the poison they receive comes from the fluid's **properties**, not from its `Poison` block. The game only builds the properties when the fluid has at least one property set to something other than its default. While it builds them, it copies the Poison block's strength into them. No properties, no poison reaches the drinker.

```java
if (script.hasPropertiesSet()) {
   FluidProperties props = new FluidProperties();
   props.setEffects(
      script.getFatigueChange(), script.getHungerChange(), script.getStressChange(),
      script.getThirstChange(), script.getUnhappyChange(), script.getAlcohol(),
      script.getPoisonMaxEffect().getPlayerEffect()
   );
   ...
   this.properties = props.getSealedFluidProperties();
} else {
   this.properties = null;
}
```

A `Properties` block whose values are all zero counts as no block, because "set" means "different from the default", and the defaults are zero.

You can see it in vanilla. Of the ten vanilla fluids with a Poison block, only four also have Properties: TaintedWater, Bleach, Cologne and Perfume. Petrol, Acid, CleaningLiquid, Dye, HairDye and even PoisonPotent have a Poison block and no Properties, so drinking them adds nothing to the poison stat. Bleach poisons because it also has `ThirstChange = -20.0`.

**The safe way:** if your fluid should poison, give it a `Properties` block with at least one real non-zero effect.

> **Proof:** Code. `Fluid#setScript` (the excerpt above); `FluidDefinitionScript#hasPropertiesSet` and `PropertyValue#isSet` (`value != defaultValue`); `FluidContainer#removeFluid` adds poison to the drink only through the properties; `IsoGameCharacter#DrinkFluid` adds `consume.getPoison()` to the poison stat. Vanilla blocks counted in the installed `fluids*.txt`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## `minAmount` and `diluteRatio` are never read

The Poison block accepts `maxEffect`, `minAmount` and `diluteRatio`. Only `maxEffect` matters. The poison check returns the maximum effect whatever the amount or dilution:

```java
public PoisonEffect getPoisonEffect(float volume, float ratio) {
   return this.maxEffect;
}
```

So a drop of your fluid in a bucket of water is as "poisonous" as the pure fluid, in name. How much poison the drinker actually gets scales with how much of the fluid they swallowed (next section).

> **Proof:** Code. `zombie.entity.components.fluids.PoisonInfo#getPoisonEffect`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How strong each poison level is

`maxEffect` takes Mild, Medium, Severe, Extreme or Deadly, worth levels 1, 2, 3, 4 and 100. The amount put into the properties is the level times 7, per litre. So a litre of a Medium fluid adds 14 to the poison stat, and a litre of a Deadly one adds 700. There is nothing between Extreme (28 per litre) and Deadly: a mouthful of a Deadly fluid is already more than a whole litre of an Extreme one.

Traits change the dose. Iron Gut halves it, or removes it entirely for tainted water. Weak Stomach doubles it, or multiplies it by 1.2 for tainted water. Any tainted water in the drink multiplies the whole dose by 0.75 first.

> **Proof:** Code. `zombie.entity.components.fluids.PoisonEffect` (levels) and `#getPlayerEffect` (`level * 7`); `Fluid#setScript`; `IsoGameCharacter#DrinkFluid` (tainted water x0.75, Iron Gut, Weak Stomach). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Blend lists are the only thing that stops mixing

A container holds up to eight fluids and mixes freely. No vanilla item restricts what goes into it: the only fluid whitelist in the base game's scripts is on the well, which is a world entity, not an item. What stops a mix is the **fluid's** blend list, checked both ways: the incoming fluid must accept every fluid already there, and every fluid there must accept it. Petrol's blend whitelist allows only the `Fuel` category, and only Petrol is `Fuel`, so petrol mixes with nothing. Water has no list and mixes with anything that allows it.

> **Proof:** Code. `FluidContainer#canAddFluid` (eight fluids, `canBlendWith` in both directions, then the container's own whitelist and blacklist); `Fluid#canBlendWith`. Searched the installed `media/scripts` for `whitelist`: only the fluid blend lists and `entity_well.txt`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Two small ones in the container script

- `ContainerName` may not contain spaces. The game strips them and logs an error. The name is also a translation key: the label comes from `Fluid_Container_<ContainerName>`.
- `Fluids` in a container script is what it starts with, not what it may hold. What it may hold is a separate whitelist or blacklist block.

> **Proof:** Code. `zombie.scripting.entity.components.fluids.FluidContainerScript` load code (`StringUtils.removeWhitespace` on `ContainerName`); `FluidContainer` builds its label with `Translator.getFluidText("Fluid_Container_" + containerName)`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie)
- [Drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling)
- [Fluids for modders: start here](/pz/build-42/modding/fluids/fluids-for-modders-start-here)
