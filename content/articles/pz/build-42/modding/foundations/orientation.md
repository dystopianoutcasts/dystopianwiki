---
id: build-42-orientation
slug: orientation
title: Orientation
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
  Where to start for Build 42.22 mods that touch vehicles, power, combat and animation: the folder layout the game reads, what the older notes said about the build, and which pages cover each system.
last_updated: '2026-11-16'
related_articles:
  - practical-b42-readiness-checklist
  - electricity-and-power
  - combat-and-animation
  - misc-catch-all-systems
  - addendum-electricity-generator-power-model
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a modder new to Build 42 who is about to work on vehicles, power, combat or animation. It tells you what to set up first and where each system is explained.

:::callout[The 1-minute version]{kind=key}
- Set up the versioned folder first: `mod.info` and `media/` in `42/`, with an optional `common/`. A flat Build 41 mod is not listed.
- A mod built for an earlier version can stop loading if its `versionMin` or `versionMax` excludes the running game, which is 42.22 here.
- The server's `Mods=` line takes ids split on `;`. A backslash in front of an id is removed, so it is allowed and not needed.
- For the systems themselves, read the pages in the list below. This page does not repeat them.
:::

:::facts
- **Game version** 42.22
- **Lowest version folder** `42` (42.0)
- **Mod folder shape** optional `common/`, plus `42/` with `mod.info` and `media/`
- **`Mods=` separator** `;`
:::

## 1. The folders the game reads

**A Build 42 mod keeps `mod.info` and `media/` in a version folder, with an optional `common/` beside it.**

```
MyMod/
  common/media/     big shared assets, loaded first
  42/mod.info       the Build 42 manifest
  42/media/         Build 42 content, replaces common
```

The game picks the highest version folder that is at least 42.0 and not above the running game, and lists the mod when `mod.info` is in it or in `common`. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/ZomboidFileSystem.java:493-498`)] Inside each `media/` the Lua is split into `lua/shared`, `lua/client` and `lua/server`. :cite[(`zombie/Lua/LuaManager.java:1143-1160`)]

A Build 41 `41/` folder is not a thing the 42.22 loader reads, because it skips versions below 42.0. :cite[(`zombie/gameStates/ChooseGameInfo.java:45`)] The folder pages are [the project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure) and [the versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders).

## 2. Mods built for another version

**A mod is switched off when the game version is outside its `versionMin` and `versionMax`.**

The check compares the two `mod.info` lines with the running game version. :cite[(`zombie/gameStates/ChooseGameInfo.java:654-659`)] So a mod that worked on an earlier point release can stop loading when its range no longer includes the game, which is one reason to set the range on purpose. The rules are on [Build 42 status and versioning](/pz/build-42/modding/foundations/b42-status-versioning-and-the-compatibility-model).

## 3. The server's mod line

**The server reads `Mods=` as ids split on `;`, after it removes every backslash.**

A backslash before each id is therefore tolerated and not required. :cite[(`zombie/network/GameServer.java:667-675`)] The older note called this the most common cause of server breakage, and that was not found in the code. A mod id that the game does not list is dropped from the server's list with a log line. :cite[(`zombie/ZomboidFileSystem.java:837-842`)]

## 4. Where each system is explained

**Each system has its own page, and the checklist is the last stop before testing.**

::::cards
:::card[Power]{accent=orange}
[Electricity and power](/pz/build-42/modding/foundations/electricity-and-power) and [the generator power model](/pz/build-42/modding/foundations/addendum-electricity-generator-power-model).
:::
:::card[Combat and animation]{accent=purple}
[Combat and animation](/pz/build-42/modding/foundations/combat-and-animation).
:::
:::card[Everything else]{accent=blue}
[Miscellaneous systems](/pz/build-42/modding/foundations/misc-catch-all-systems).
:::
:::card[Before you test]{accent=cream}
[The readiness checklist](/pz/build-42/modding/foundations/practical-b42-readiness-checklist).
:::
::::

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java; no game was run. Not verified, and dropped as claims: the release date and size of the Build 42 update, that Build 41 mods are "broadly" incompatible with Build 42, that Build 41 saves do not transfer, and which systems changed (crafting, items, UI, vehicles, multiplayer synchronization, registries, exposed methods) beyond the folder, `mod.info` and registry checks above.
:::
