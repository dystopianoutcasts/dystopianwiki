---
id: build-42-the-b42-mod-project-structure
slug: the-b42-mod-project-structure
title: 'The B42 mod PROJECT STRUCTURE (basics)'
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
  Where Build 42 (42.22) looks for your mod, which folders inside it are read, when a mod is listed, and which copy wins when two folders hold the same mod id.
last_updated: '2026-11-16'
related_articles:
  - the-versioned-layout-common-build-folders
  - b42-status-versioning-and-the-compatibility-model
  - mod-info-fields-and-the-versioning-compatibility-system
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - packaging-and-workshop-upload-for-b42
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders new to Build 42. It is about folders. For the version-folder names see [the versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders), and for the first working mod see [the project skeleton](/pz/build-42/modding/cookbook/project-skeleton).

:::callout[The 1-minute version]{kind=key}
- Put your mod in `Zomboid/mods/<ModId>/` for a local test. That folder is always scanned. Enable the mod on the game's Mods screen.
- Inside it, put `42/mod.info` and `42/media/...`. A `common/` folder is optional for the loader.
- The game lists a mod when `mod.info` is in `common/` or in the version folder it picked, so `common/` can be empty or missing.
- The staging folder `Zomboid/Workshop/<Item>/Contents/mods/<ModId>/` is scanned only when the game runs in Steam mode.
- When two scanned folders hold the same mod id, the folder scanned earlier wins. Do not keep two copies.
- A mod with `mod.info` at its top folder and no `common/` or version folder is not listed.
:::

:::facts
- **Local mods folder** `Zomboid/mods/`, always scanned
- **Scan order** staged Workshop items, installed Steam items, then `mods`
- **Lowest version folder** `42` (read as 42.0)
- **Listed when** `mod.info` is in `common/` or in the picked version folder
:::

## 1. Where the game looks for mods

**The game scans up to three places, in a fixed order, and lists each folder that holds a `mod.info`.**

The cache directory is the `Zomboid` folder in your user folder. :cite[(`zombie/ZomboidFileSystem.java:205-213`)] The default order is `workshop`, then `steam`, then `mods`. :cite[(`zombie/ZomboidFileSystem.java:530-534`)]

:::flow[The three places, in the order they are scanned]
- Staged Workshop items: `Zomboid/Workshop/<Item>/Contents/mods/`
- Installed Steam items: `<item folder>/mods/`
- Local mods: `Zomboid/mods/`
:::

Staged items and installed Steam items are scanned only when Steam mode is enabled. :cite[(`zombie/ZomboidFileSystem.java:443-466`)] The `mods` folder is always scanned, and the game creates it when it is missing. :cite[(`zombie/ZomboidFileSystem.java:548-552`)] The staging folder is the `Workshop` folder in the cache directory. :cite[(`zombie/core/znet/SteamWorkshop.java:98-100`)]

A launch argument `-modfolders` replaces that order with your own comma-separated list. :cite[(`zombie/gameStates/MainScreenState.java:269-271`, `zombie/ZomboidFileSystem.java:524-526`)]

## 2. What is inside your mod folder

**One mod folder holds an optional `common/` and one version folder, and `mod.info` goes in either.**

```
Zomboid/mods/MyMod/
  common/             optional for the loader
    media/            shared models, textures, sounds
  42/
    mod.info
    poster.png
    media/
      registries.lua
      lua/shared/  lua/client/  lua/server/
      scripts/
```

The smallest `42/mod.info` is two lines. The game reads `name=` and `id=`, and the `id=` value is the mod id that a server lists in `Mods=`. :cite[(`zombie/gameStates/ChooseGameInfo.java:217-221`, `zombie/gameStates/ChooseGameInfo.java:243-247`, `zombie/network/GameServer.java:667-675`)] After you save it, start the game, enable the mod on the Mods screen and start a world. The first working mod is walked through on [the project skeleton](/pz/build-42/modding/cookbook/project-skeleton).

```
name=My First Mod
id=MyFirstMod
```

A staged Workshop item wraps the same mod one level deeper, and the uploader wants two more files beside `Contents`:

```
Zomboid/Workshop/MyItem/
  workshop.txt
  preview.png
  Contents/mods/MyMod/   (the tree above)
```

One upload may hold several mod folders under `Contents/mods`, and the uploader checks each one. :cite[(`zombie/core/znet/SteamWorkshopItem.java:457-476`)] The uploader reads `workshop.txt` and `preview.png` from the item folder and takes everything it uploads from `Contents`. :cite[(`zombie/core/znet/SteamWorkshopItem.java:57-59`, `zombie/core/znet/SteamWorkshopItem.java:194-196`, `zombie/core/znet/SteamWorkshopItem.java:590-592`)] The preview rules and the upload check are on [Packaging and Workshop upload](/pz/build-42/modding/foundations/packaging-and-workshop-upload-for-b42).

`registries.lua` sits at `media/registries.lua` inside the version folder, or inside `common`. :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`)] See [media/registries.lua](/pz/build-42/modding/foundations/media-registries-lua-the-new-b42-identifier-file).

## 3. When a folder counts as a mod

**A folder is listed when `mod.info` exists in `common/` or in the version folder the game picked.**

The scan skips a folder named `examplemod`. For every other folder it works out the version folder name, then checks for `common/mod.info` and `<version folder>/mod.info`. :cite[(`zombie/ZomboidFileSystem.java:493-498`)] Nothing in that check asks for `common/` to exist or to hold files.

The uploader agrees: it needs a `mod.info` in `common` or in a version folder in range, and it reports `MissingModDotInfo` otherwise. :cite[(`zombie/core/znet/SteamWorkshopItem.java:398-450`)]

When the game reads the file it tries the version folder first and falls back to `common`. :cite[(`zombie/gameStates/ChooseGameInfo.java:198-208`)] If neither has one it logs "can't find mod.info". :cite[(`zombie/gameStates/ChooseGameInfo.java:206`)]

## 4. How common and the version folder combine

**The game reads `common` first and the version folder second, and a file in the second replaces a file of the same path in the first.**

For each enabled mod the file system registers every file of `common`, then every file of the version folder, under its path inside that folder. :cite[(`zombie/ZomboidFileSystem.java:656-695`)] A later file with the same path replaces the earlier one, and the game logs "overrides" unless the file is `mod.info` or `poster.png`. :cite[(`zombie/ZomboidFileSystem.java:670-674`, `zombie/ZomboidFileSystem.java:687-691`)] A mod file also replaces a vanilla file with the same path, because the vanilla files are in the same table. :cite[(`zombie/ZomboidFileSystem.java:119-127`)]

So put big, build-independent files in `common/media`, and keep the files that change with the game in the version folder. Lua is read from both folders, and the order is in [Lua folder load order](/pz/build-42/modding/foundations/lua-folder-load-order).

## 5. Two copies of one mod id

**When two scanned folders hold the same mod id, the folder scanned earlier wins.**

The loader keeps one entry per id, and a copy found later takes its place only when its folder comes earlier in the scan list. :cite[(`zombie/gameStates/ChooseGameInfo.java:171-186`)] With the default order a staged Workshop copy beats an installed Steam copy, and both beat `Zomboid/mods/`. :cite[(`zombie/ZomboidFileSystem.java:530-552`)]

So an old subscribed copy can hide the dev copy you are editing, or the reverse, with no message. Keep one copy of a mod id on the machine you test on.

## 6. A mod with a map

**The map-group builder reads `common/media/maps/` first, and it looks at the version folder's maps only when `common/media/maps/` exists.**

For each available mod it lists the map folders under `common/media/maps/`, and the check of `<version folder>/media/maps/` sits inside that branch. :cite[(`zombie/MapGroups.java:123-150`)] A map kept only under the version folder is therefore not picked up by this code. See [the map cookbook page](/pz/build-42/modding/cookbook/map-building-basement).

## 7. A Build 41 mod, and one upload for two builds

**The Build 42 loader does not read a flat `media/` folder at a mod's top level.**

The mod folders the loaders use are `common` and the version folder, and the lowest version folder is 42.0, so a `41/` folder is skipped too. :cite[(`zombie/gameStates/ChooseGameInfo.java:45`, `zombie/ZomboidFileSystem.java:470-486`)] A flat mod with `mod.info` at its top folder is not listed. :cite[(`zombie/ZomboidFileSystem.java:498`)]

An upload may still keep a flat `media/` and a `mod.info` beside `common/` and `42/` for Build 41, because the 42.22 code never looks at them. What Build 41 does with that layout was not checked here.

```
Contents/mods/MyMod/
  media/        (Build 41, flat)
  mod.info      (Build 41)
  common/       (Build 42)
  42/           (Build 42)
```

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java, and no game was run. Not verified: how Build 41 reads a mod folder that also holds `common/` and `42/`, and the claim from the older page that development should happen in the `Workshop` folder (the loader scans both).
:::
