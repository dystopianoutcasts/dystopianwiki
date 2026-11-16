---
id: build-42-the-versioned-layout-common-build-folders
slug: the-versioned-layout-common-build-folders
title: 'The versioned layout: common + build folders'
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - mod-info
  - registries-lua
  - project-structure
  - workshop-upload
  - debug-mode
excerpt: >-
  How Build 42 (42.22) turns a version folder name like 42 or 42.1.5 into a number, which folder it picks, and how that folder and common combine. Includes what a 41 folder does.
last_updated: '2026-11-16'
related_articles:
  - the-b42-mod-project-structure
  - b42-status-versioning-and-the-compatibility-model
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders new to Build 42 who want to know what to name the version folder. Where the mod goes on disk is on [the project structure page](/pz/build-42/modding/foundations/the-b42-mod-project-structure).

:::callout[The 1-minute version]{kind=key}
- Name your version folder `42`. The game picks the highest folder name that is at least 42.0 and not above the running game, and the capture runs as 42.22.
- A folder name is read as major and minor only, so `42.1.5` counts as `42.1` and `43.5.1` as `43.5`.
- `common/` loads first, then the picked version folder, and a file with the same path in the version folder replaces the one in `common/`.
- Add a second folder such as `42.12` only for files that must differ on that later version.
- A folder named `41` is not used by the 42.22 loader, because the lowest version it accepts is 42.0.
:::

:::facts
- **Running game** 42.22, read as 42022
- **Lowest folder accepted** 42.0, read as 42000
- **A folder name counts as** major x 1000 + minor
- **Minor part capped at** 999
:::

## 1. How a folder name becomes a version

**The game turns a folder name into major x 1000 + minor, and ignores anything after the second number.**

One number in a name gives that number times 1000. Two or more give 1000 times the major number plus the minor number, with the minor capped at 999. Any part that is not a number gives 0. :cite[(`zombie/ZomboidFileSystem.java:576-587`)] The running game is read the same way, as major x 1000 + minor. :cite[(`zombie/core/GameVersion.java:48-50`)]

This table applies that rule to example names.

| Folder name | Counts as | Read as number |
|-------------|-----------|----------------|
| `42` | 42.0 | 42000 |
| `42.1` | 42.1 | 42001 |
| `42.12` | 42.12 | 42012 |
| `42.22` | 42.22 | 42022 |
| `42.0.5` | 42.0 | 42000 |
| `42.1.5` | 42.1 | 42001 |
| `43.5.1` | 43.5 | 43005 |
| `41` | 41.0 | 41000 |
| `media` | no number | 0 |

## 2. Which folder the game picks

**The game picks the highest folder number that is at least 42.0 and not above the running game.**

It walks every entry in the mod folder and keeps the best number that fits. :cite[(`zombie/ZomboidFileSystem.java:470-486`)] The lowest number it accepts is 42.0, and the game version here is 42.22. :cite[(`zombie/gameStates/ChooseGameInfo.java:45`, `zombie/gameStates/ChooseGameInfo.java:56-58`, `zombie/core/Core.java:163`)]

When no folder fits, the version folder is the name `42.0`, which need not exist. The game then finds `mod.info` in `common/` instead. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/gameStates/ChooseGameInfo.java:198-208`)]

So a bare `42` covers 42.0 and everything up to the next folder you add, and a `43` folder does nothing until the game reaches 43.0. Do not keep both `42` and `42.0` in one mod, because they count as the same number and the entry read last wins. :cite[(`zombie/ZomboidFileSystem.java:476-481`)]

## 3. How common and the picked folder combine

**The game loads `common/` first and the picked version folder second, and the second replaces any file with the same path.**

Each file is stored under its path inside the folder, so `common/media/lua/shared/A.lua` and `42/media/lua/shared/A.lua` are the same file to the game, and the one from `42/` is used. :cite[(`zombie/ZomboidFileSystem.java:656-695`)] The game prints "overrides" in its log when that happens, except for `mod.info` and `poster.png`. :cite[(`zombie/ZomboidFileSystem.java:670-674`, `zombie/ZomboidFileSystem.java:687-691`)]

Put big files that do not change with the game, such as models and textures, in `common/media`. Put `mod.info` and the code in the version folder. Files that Lua loads are read from both folders, in the order on [Lua folder load order](/pz/build-42/modding/foundations/lua-folder-load-order).

::::cards
:::card[One build]{accent=orange}
`common/` for big assets, `42/` for `mod.info`, `poster.png` and `media/`.
:::
:::card[A later override]{accent=purple}
Add `42.12/` holding only the files that differ. It replaces the same paths from `common/` on 42.12 and later.
:::
:::card[Two builds in one upload]{accent=blue}
Keep a flat `media/` for Build 41 beside `common/` and `42/`. The 42.22 loader ignores the flat folder.
:::
::::

## 4. Mixing Build 41 and Build 42

**A flat Build 41 `media/` folder next to `common/` and `42/` is not read by the Build 42 loader, so the two do not collide.**

The loaders start from `common` and the picked version folder, and they skip folders below 42.0. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/gameStates/ChooseGameInfo.java:45`)] A mod with only a flat `media/` and a top-level `mod.info` is not listed. :cite[(`zombie/ZomboidFileSystem.java:498`)]

Whether Build 41 reads the same folder was not checked here. The older advice that a mod with crafting recipes cannot share scripts between builds fits the 42.22 scripts, which hold `craftRecipe` blocks and no `recipe` blocks. It is an inference about Build 41, so the cleanest plan stays a Build 42-only project. See [the porting checklist](/pz/build-42/modding/foundations/b41-b42-porting-what-breaks-a-concrete-checklist).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java; no game was run. Counted across vanilla `media/scripts`: 965 lines that open a `craftRecipe` block and none that open a `recipe` block. Not verified: what Build 41 does with a mod that also holds `common/` and `42/`, and whether a legacy `recipe` block still works in 42.22 (the engine still keeps a `recipe` script type).
:::
