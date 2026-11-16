---
id: build-42-combat-and-animation
slug: combat-and-animation
title: Combat and Animation
game: pz
version: build-42
section: modding
category: foundations
difficulty: intermediate
tags:
  - combat
  - animation
  - weapons
excerpt: >-
  A signpost for modders in 42.22: what changed in firearms, melee weapons and animation files since Build 41, and which page explains each one.
last_updated: '2026-11-16'
related_articles:
  - orientation
  - misc-catch-all-systems
  - practical-b42-readiness-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who ported a weapon or an animation from Build 41 and want to know what to check first. It points to the pages that explain each system; it does not repeat them.

:::callout[The 1-minute version]{kind=key}
- Firearm hit chance, point-blank range and jamming come from engine numbers and sandbox options. The Java default of the jam multiplier is 0, which turns jamming off, and the vanilla presets read for this page set it to 1.0 or 1.25.
- Some melee weapons carry a separate head condition next to the handle condition, and a weapon script can set it.
- A mod's own animation clips are read from `anims_X` folders, and in 42.22 the human mesh takes clips from `Bob`, `Kate` and `Zombie` with no file-name prefix required.
- Combat numbers for players are on [the firearm page](/pz/build-42/gameplay/the-real-numbers/firearm-accuracy-and-damage) and [the melee page](/pz/build-42/gameplay/the-real-numbers/melee-damage-and-critical-hits). Animation files, nodes and variables are in the animation system pages.
:::

:::facts
- **Jam multiplier** 1.0 in the standard presets (Extinction 1.25); 0 turns jams off
- **Human clip folders** `Bob`, `Kate`, `Zombie`
- **Name prefix on human clips** none required
:::

## 1. Firearms

**Firearm accuracy, range and jamming are engine numbers and sandbox options, not something a weapon mod writes.**

Jamming and hit chance come from engine numbers and the Firearm sandbox options. :cite[(`zombie/SandboxOptions.java:254-257`)] The jam rule is the weapon's chance times the multiplier, and no jam at 0. :cite[(`zombie/inventory/types/HandWeapon.java:2151-2153`)] The Java default of the multiplier is 0. :cite[(`zombie/SandboxOptions.java:254`)] The Apocalypse, Rising and Outbreak presets set it to 1.0 and Extinction sets 1.25, so jamming is on in those presets and off only at 0. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:177`, `media/lua/shared/Sandbox/Rising.lua:177`, `media/lua/shared/Sandbox/Outbreak.lua:177`, `media/lua/shared/Sandbox/Extinction.lua:177`)]

Every number, with the formula that joins them, is on [firearm accuracy and damage](/pz/build-42/gameplay/the-real-numbers/firearm-accuracy-and-damage). What a shot does to a ragdoll is on [hit reactions and ballistics](/pz/build-42/engine/physics-and-ragdolls/hit-reactions-and-ballistics).

## 2. Melee weapons

**A melee weapon can have a head condition as well as a handle condition, and the item script sets it.**

The item tooltip shows "Handle" and "Head" condition bars for a weapon that has a head condition. :cite[(`zombie/inventory/types/HandWeapon.java:288-299`)] The script loader treats `HeadCondition` as an item attribute and sets a repair counter beside it. :cite[(`zombie/scripting/objects/Item.java:1955-1956`)]

How hard a swing hits, how a critical is rolled and how reach is worked out are on [melee damage and critical hits](/pz/build-42/gameplay/the-real-numbers/melee-damage-and-critical-hits). Every weapon's own numbers are in the weapon tables once they go live.

## 3. Animation files

**Clip files in a mod's `anims_X` folder are read by folder, and the human mesh takes three folders in 42.22.**

The human mesh lists the folders `Bob`, `Kate` and `Zombie`, and lists no name prefix. :cite[(`media/scripts/generated/animations_meshes.txt:3-9`)] The mesh script reads a prefix only from an `animationPrefix` line. :cite[(`zombie/scripting/objects/AnimationsMesh.java:43-44`)] An empty prefix list accepts any file name. :cite[(`zombie/core/skinnedmodel/ModelManager.java:249-253`)]

For the human mesh, a mod's other subfolders of `anims_X`, and loose files beside them, are also loaded. :cite[(`zombie/core/skinnedmodel/ModelManager.java:1811-1856`)]

Clip format and naming are on [skinned models and clips](/pz/build-42/engine/animation-system/skinned-models-and-clips). Adding a working animation end to end is on [modding animations](/pz/build-42/engine/animation-system/modding-animations), and the node files are on [AnimSets, nodes and transitions](/pz/build-42/engine/animation-system/animsets-nodes-and-transitions).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla scripts; no game was run. Not verified: what the Six Months Later preset sets for jamming (it does not set the option); that a weapon's head can fall off as it wears, that some broken weapons stay usable as a club, that a Broken Spear still works, and that characters make vocal calls. Earlier notes listed these, and this page found no code for them in the lines above.
:::
