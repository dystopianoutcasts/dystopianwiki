---
id: build-42-mod-info-fields-and-the-versioning-compatibility-system
slug: mod-info-fields-and-the-versioning-compatibility-system
title: 'mod.info fields and the versioning/compatibility system'
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
  Every key the 42.22 game reads from mod.info, what each one does, the defaults when a key is missing, and the traps in how the file is read line by line.
last_updated: '2026-11-15'
related_articles:
  - b42-status-versioning-and-the-compatibility-model
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - in-game-debug-mode-and-dev-tools
  - packaging-and-workshop-upload-for-b42
  - tl-dr-what-a-b41-modder-must-change-first
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders writing a `mod.info`](#the-keys-the-game-reads) | [anyone debugging a mod that does not appear or is switched off](#how-the-file-is-read)

:::callout[The 1-minute version]{kind=key}
- The game reads `mod.info` from your version folder first, and from `common` when the version folder has none.
- Keys it reads: `name`, `id`, `description`, `poster`, `icon`, `author`, `modversion`, `category`, `url`, `require`, `incompatible`, `loadModAfter`, `loadModBefore`, `pack`, `tiledef`, `versionMin` and `versionMax`.
- A mod with no `id=` line gets the id `undefined_id`, and one with no `name=` line is shown as "Unnamed Mod".
- `id=` is what goes in a server's `Mods=` line, and it is not the Steam Workshop id.
- A `tiledef=` file number outside 100 to 8189 makes the whole `mod.info` fail to load.
- Each line is matched by `contains` for most keys, so a line of free text can be taken for a key.
:::

:::facts
- **Keys read** 17
- **`tiledef=` file numbers** 100 to 8189
- **Defaults** name "Unnamed Mod", id `undefined_id`, description empty
- **Lists** `require`, `incompatible`, `loadModAfter` and `loadModBefore` are split on `,`
:::

## The keys the game reads

The game reads seventeen keys from `mod.info`, and a key it does not list is ignored.

The loader looks at each line in turn. :cite[(`zombie/gameStates/ChooseGameInfo.java:215-351`)] A mod starts with the name "Unnamed Mod", an empty description and the id `undefined_id`. :cite[(`zombie/gameStates/ChooseGameInfo.java:489-491`)]

A minimal file for a mod that works in the versioned layout is:

```
name=My amazing mod
id=myAmazingModID
author=an amazing modder
description=Hello World
poster=poster.png
icon=icon.png
modversion=1.0
versionMin=42.0
```

To depend on another mod, add a `require=` line with the real id of an installed mod, such as `require=SomeFrameworkModID`. A required mod that is not installed makes your mod unavailable. :cite[(`zombie/gameStates/ChooseGameInfo.java:668-669`)]

Name it `mod.info`, all lowercase, with no `.txt` after it, and put it in your `42` folder or in `common`. The file name the game looks for is exactly `mod.info`. :cite[(`zombie/gameStates/ChooseGameInfo.java:200-203`)]

| Key | What the game does with it | Code |
|---|---|---|
| `name` | The display name in the mod list. A line that is empty after `name=` keeps "Unnamed Mod". | :cite[(`zombie/gameStates/ChooseGameInfo.java:217-221`)] |
| `id` | The mod's id. The id is read from a line that starts with `id=`, and an empty value keeps `undefined_id`. | :cite[(`zombie/gameStates/ChooseGameInfo.java:243-247`)] |
| `description` | Each `description=` line is added onto the end of the text, with no line break between them. | :cite[(`zombie/gameStates/ChooseGameInfo.java:233-235`)] |
| `poster` | A picture file name. The game looks in the version folder first, then in `common`, and a mod can list more than one. | :cite[(`zombie/gameStates/ChooseGameInfo.java:222-232`)] |
| `icon` | An icon file name, looked up in the version folder first, then in `common`. | :cite[(`zombie/gameStates/ChooseGameInfo.java:252-262`)] |
| `author` | The author text. | :cite[(`zombie/gameStates/ChooseGameInfo.java:248-249`)] |
| `modversion` | The mod's own version text, lowercase only. | :cite[(`zombie/gameStates/ChooseGameInfo.java:250-251`)] |
| `category` | A category text. | :cite[(`zombie/gameStates/ChooseGameInfo.java:263-264`)] |
| `url` | A web address text. | :cite[(`zombie/gameStates/ChooseGameInfo.java:265-266`)] |
| `require` | Ids of mods this mod needs, split on commas, with backslashes removed. | :cite[(`zombie/gameStates/ChooseGameInfo.java:235-236`)] |
| `incompatible` | Ids of mods this mod cannot run with, split the same way. | :cite[(`zombie/gameStates/ChooseGameInfo.java:237-238`)] |
| `loadModAfter` | Ids of mods this mod should load after, split the same way. | :cite[(`zombie/gameStates/ChooseGameInfo.java:239-240`)] |
| `loadModBefore` | Ids of mods this mod should load before, split the same way. | :cite[(`zombie/gameStates/ChooseGameInfo.java:241-242`)] |
| `pack` | A texture pack file name, with an optional `type=ui` after it. An empty value makes the whole file fail. | :cite[(`zombie/gameStates/ChooseGameInfo.java:267-303`)] |
| `tiledef` | A tile definition file name and its file number, separated by white space. | :cite[(`zombie/gameStates/ChooseGameInfo.java:304-328`)] |
| `versionMin` | The lowest game version the mod runs on. An unreadable value makes the whole file fail. | :cite[(`zombie/gameStates/ChooseGameInfo.java:339-349`)] |
| `versionMax` | The highest game version the mod runs on, read the same way. | :cite[(`zombie/gameStates/ChooseGameInfo.java:329-338`)] |

How the game uses the three lists that name other mods, and the two version keys, is in [Build 42 status and versioning](/pz/build-42/modding/foundations/b42-status-versioning-and-the-compatibility-model). Only `require` and the two version keys were found to change whether a mod is used. What `incompatible`, `loadModAfter` and `loadModBefore` change was not verified. :cite[(`zombie/gameStates/ChooseGameInfo.java:654-686`)]

## How the file is read

Most keys are found with a `contains` test, so any line that holds the key text is taken for that key.

The tests run in a fixed order, and the first one that matches wins. :cite[(`zombie/gameStates/ChooseGameInfo.java:217-339`)] A `description=` line that happens to contain the text `name=` is read as the name, and one that contains `require=` is read as a require list. Only `id=`, `versionMax=` and `versionMin=` need to be at the start of the line. :cite[(`zombie/gameStates/ChooseGameInfo.java:243`, `zombie/gameStates/ChooseGameInfo.java:329`, `zombie/gameStates/ChooseGameInfo.java:339`)] Keep free text away from the key words, and put each key on its own line.

When a key fails in the three ways below, the game logs an error and the mod's `mod.info` is dropped: an empty `pack=`, a `tiledef=` that does not have a name and a number, and a `versionMin` or `versionMax` that does not parse. :cite[(`zombie/gameStates/ChooseGameInfo.java:269-273`, `zombie/gameStates/ChooseGameInfo.java:304-316`, `zombie/gameStates/ChooseGameInfo.java:329-349`)]

## Tile definitions and tile packs

A `tiledef=` line gives the game one tile definition file and the number that file owns, and the number must be from 100 to 8189.

The loader rejects any other number with the error "file number must be from 100 to 8189", and then the whole `mod.info` fails. :cite[(`zombie/gameStates/ChooseGameInfo.java:316-328`)] How map mods use them is in [Mapping toolchain status](/pz/build-42/modding/foundations/mapping-toolchain-status).

## The two ids

A mod id and a Workshop id are different values, and each goes on a different server line.

The mod id is the `id=` line, and the server reads it from `Mods=`. :cite[(`zombie/network/GameServer.java:667-675`)] The Workshop id is the number Steam gives the item, and the server reads it from `WorkshopItems=`. :cite[(`zombie/network/GameServer.java:693-701`)] When an item is submitted, the game appends `Workshop ID:` and one `Mod ID:` line per mod to the description. :cite[(`zombie/core/znet/SteamWorkshopItem.java:170-182`)]

A mod loaded from a numbered Steam folder takes that folder's name as its Workshop id. :cite[(`zombie/gameStates/ChooseGameInfo.java:526-528`)]

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled `ChooseGameInfo`. No game was run, so the failure messages and the shown defaults were read, not seen. Not verified: what `incompatible`, `loadModAfter` and `loadModBefore` change in the game, how the `pack=` flags are used, the meaning of the `type=ui` pack, and where a mod's `poster` and `icon` are drawn in the mod list.
:::
