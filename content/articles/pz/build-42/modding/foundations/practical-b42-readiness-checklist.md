---
id: build-42-practical-b42-readiness-checklist
slug: practical-b42-readiness-checklist
title: Practical B42 readiness checklist
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - electricity
  - combat
  - animation
  - power
  - misc-systems
excerpt: >-
  A checklist of eight things to confirm before a ported mod is ready to test in Build 42.22: folders, scripts, animations, server checks, the server list, the version range, vehicles and power.
last_updated: '2026-11-16'
related_articles:
  - orientation
  - tl-dr-what-a-b41-modder-must-change-first
  - b41-b42-porting-what-breaks-a-concrete-checklist
  - electricity-and-power
  - combat-and-animation
  - misc-catch-all-systems
  - addendum-electricity-generator-power-model
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a modder who has ported a mod and wants a last pass before testing. How to port is [the porting checklist](/pz/build-42/modding/foundations/b41-b42-porting-what-breaks-a-concrete-checklist), and the five first moves are [the TL;DR](/pz/build-42/modding/foundations/tl-dr-what-a-b41-modder-must-change-first).

:::callout[The 1-minute version]{kind=key}
- Check that `mod.info` is in `42/` or `common/`, and that a version range, if you set one, includes 42.22.
- Check that every script you wrote is Build 42 style, and that every Lua file knows whether it runs on a client, a server or both.
- Check that animation files are in `media/AnimSets`, `media/actiongroups` or `media/anims_X` of `common/` or the version folder, which the mod record names.
- Check the server list: ids split on `;`, a backslash allowed but not needed.
- Vehicle and power items on this page are not checked against 42.22 code.
:::

:::facts
- **Game version** 42.22
- **Lowest version folder** `42`
- **Mod animation folders read** `media/AnimSets`, `media/actiongroups`
- **Checks on this page** 8: 4 verified, 2 in part, 2 not checked
:::

## 1. Eight checks

**Each check says what to look at and whether the 42.22 code was read for it.**

::::cards
:::card[1. Folders]{accent=orange}
`mod.info` in `common/` or `42/`. Verified.
:::
:::card[2. Scripts]{accent=purple}
Re-author against the vanilla 42.22 scripts. Partly verified.
:::
:::card[3. Animations]{accent=blue}
Files in the folders the game reads. Partly verified.
:::
:::card[4. Client or server]{accent=cream}
Know where each Lua file runs. Verified.
:::
:::card[5. Server list]{accent=orange}
`Mods=` split on `;`. Verified.
:::
:::card[6. Version range]{accent=purple}
`versionMin` and `versionMax` against 42.22. Verified.
:::
:::card[7. Vehicles]{accent=blue}
Not checked here.
:::
:::card[8. Power]{accent=cream}
Not checked here.
:::
::::

## 2. Folders and scripts

**Put the mod in a version folder, and write scripts in the Build 42 shapes.**

1. **Folders.** The game lists a mod when `mod.info` is in `common/` or in the picked version folder, which is the highest folder at least 42.0 and not above the game. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/ZomboidFileSystem.java:493-498`)] An optional `41/` folder is not read by this loader, and a flat Build 41 `media/` is not either. :cite[(`zombie/gameStates/ChooseGameInfo.java:45`)] See [the project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure).
2. **Scripts.** Write crafting as `craftRecipe`, the only recipe block vanilla 42.22 uses. :cite[(`zombie/scripting/ScriptType.java:45`)] For items, vehicles and weapons, copy the shape of the vanilla scripts for 42.22. The older page named new multi-part condition and sharpness fields on weapons, which was not checked here. See [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy).

## 3. Animations

**The game reads `AnimSets` and `actiongroups` from a mod's `common/media` and from its version folder's `media`.**

3. **Animations.** The animator collects the files under `media/AnimSets` and `media/actiongroups` in both folders, mod by mod, and sorts each mod's list. :cite[(`zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:792-808`, `zombie/core/skinnedmodel/advancedanimation/AdvancedAnimator.java:815-826`)] The mod record also points at `media/anims_X` in both folders, which holds the animation clips. :cite[(`zombie/gameStates/ChooseGameInfo.java:520`)] What goes inside `anims_X`, including the older advice of `Bob/` and `Kate/` subfolders and `Bob_` and `Kate_` file prefixes, was not checked. See [the animation system](/pz/build-42/engine/animation-system/modding-animations).

## 4. Client, server and the server list

**Decide where each Lua file runs, and write the server's mod line as ids split on `;`.**

4. **Client or server.** `media/lua/server/` loads at world start on a single-player game, on a dedicated server and on a multiplayer client. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`, `zombie/network/GameServer.java:1517-1519`)] A file that must run only on the server has to say so itself. See [Lua folder load order](/pz/build-42/modding/foundations/lua-folder-load-order).
5. **Server list.** The server removes every backslash and splits `Mods=` on `;`, so a backslash in front of an id is allowed and not needed. :cite[(`zombie/network/GameServer.java:667-675`)]

## 5. Version range

**A `versionMin` above the game or a `versionMax` below it switches the mod off.**

6. **Version range.** The check compares those two lines with the game version, 42.22 in this capture. :cite[(`zombie/gameStates/ChooseGameInfo.java:654-659`, `zombie/core/Core.java:163`)] Re-check the range when the game updates. See [mod.info fields](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system).

## 6. Vehicles and power

**These two checks come from the older page and were not read against the 42.22 code.**

7. **Vehicles.** The older page expected a template-inheritance model for vehicle scripts, an engine repair flow instead of a swap, and a Java limit on physics behavior. See [the vehicle cookbook page](/pz/build-42/modding/cookbook/vehicle-mod).
8. **Power.** The older page said to hook the generator power model, because there is no wiring API. See [Electricity and power](/pz/build-42/modding/foundations/electricity-and-power) and [the generator power model](/pz/build-42/modding/foundations/addendum-electricity-generator-power-model).

:::callout[How we know]{kind=proof}
Checks 1, 4, 5 and 6 are read from the 42.22 decompiled Java, and check 2 and 3 in part. No game was run. Not verified: the contents of `anims_X` and its `Bob` and `Kate` naming, the new weapon condition and sharpness fields, and checks 7 and 8.
:::
