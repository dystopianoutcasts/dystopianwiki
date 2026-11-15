---
id: build-42-project-skeleton
slug: project-skeleton
title: Project skeleton
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build the empty mod every other recipe starts from, enable it, and watch it write two lines into console.txt.
last_updated: '2026-11-15'
related_articles:
  - cookbook-index
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - item-repair
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build a mod called `RecipeDemoSkeleton`: a `common` folder, a `42` folder with `mod.info` and `poster.png`, and one Lua file.
- It goes in `Zomboid/mods/RecipeDemoSkeleton/`, in the user folder of the game, not in the game install.
- You enable it from the MODS screen and start a game. The Lua file writes two lines into `Zomboid/console.txt`, which proves the mod loaded.
- The other cookbook recipes start from this layout and only add files to it.
:::

:::facts
- **Mod id** `RecipeDemoSkeleton`
- **Files** 3 (`mod.info`, `poster.png`, `Boot.lua`) in `42/`, plus an empty `common/`
- **Where it goes** `Zomboid/mods/RecipeDemoSkeleton/`
- **You will see** `Boot.lua was loaded` and `OnGameStart fired` in `console.txt`
:::

## What you will build

**A mod with no content that the game still lists, loads and logs.**

Every later recipe adds an item, a food, a weapon or some clothing to this same folder layout. Build this one first, because it is also where you learn the loop you will use for every mod: edit, start the game, read `console.txt`.

When you finish, the MODS screen shows **Recipe Demo Skeleton** with a poster, and your log shows two lines that start with `[RecipeDemoSkeleton]`.

## The files

**A few small files and two folders make a mod the game can load.**

The tree below is the whole mod, starting at `Zomboid/mods/`. The `common` folder is optional and stays empty here; the loader does not need anything in it, except that a mod with a map must put it under `common/media/maps/` (see the [map recipe](/pz/build-42/modding/cookbook/map-building-basement)). :cite[(`zombie/MapGroups.java:123-150`)] The test mod keeps it as an empty folder, which needs no placeholder file.

```
Zomboid/mods/RecipeDemoSkeleton/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      lua/
        shared/
          RecipeDemoSkeleton/
            Boot.lua
```

The game looks for mods in the `mods` folder of its cache directory, which is the `Zomboid` folder in your user folder. :cite[(`zombie/ZomboidFileSystem.java:205-213`, `zombie/ZomboidFileSystem.java:548-552`)] The Workshop folder `Zomboid/Workshop/<Item>/Contents/mods/<ModId>/` is scanned only when Steam mode is enabled. This recipe uses the plain `mods` folder instead, which does not depend on Steam mode. :cite[(`zombie/ZomboidFileSystem.java:457-465`)]

A folder counts as a mod when `mod.info` exists in its `common` folder or in its version folder. :cite[(`zombie/ZomboidFileSystem.java:498`)] The recipes still create `common/` and `42/` side by side, because the other cookbook pages and the [mod folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model) describe that layout. The loader code does not require `common/` to hold anything.

## Step by step

**Create the folders, then the three files, in this order.**

### Step 1. The folders

Make `Zomboid/mods/RecipeDemoSkeleton/`, and inside it an empty `common/` and a `42/`. The `42` folder name is read as version 42.0, and the game uses the highest version folder that is not newer than the running game, falling back to 42.0. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/ZomboidFileSystem.java:576-587`, `zombie/gameStates/ChooseGameInfo.java:45`)]

The game reads `mod.info` from the version folder first and from `common` only when the version folder has none. :cite[(`zombie/gameStates/ChooseGameInfo.java:198-209`)] All the recipes put `mod.info` and their other files in `42/`.

### Step 2. `42/mod.info`

This is the file that makes the mod appear in the list. The loader reads it line by line, and the lines below are the ones the recipes use. :cite[(`zombie/gameStates/ChooseGameInfo.java:198-248`)]

**File `42/mod.info`**

```
name=Recipe Demo Skeleton
id=RecipeDemoSkeleton
description=The empty base every cookbook recipe starts from.
poster=poster.png
author=Your Name
```

Each line gives a key and a value, and the loader keeps everything after the key as the value. :cite[(`zombie/gameStates/ChooseGameInfo.java:217-221`, `zombie/gameStates/ChooseGameInfo.java:243-247`)] The id is the name that goes in a server's `Mods=` line, so it must be the same on every machine.

| Key | What the loader does | Code |
|-----|----------------------|------|
| `name=` | Sets the name shown in the list. Any line that contains `name=` matches, so keep that text out of other lines. | `zombie/gameStates/ChooseGameInfo.java:217-221` |
| `id=` | Sets the mod id. The line must start with `id=`. | `zombie/gameStates/ChooseGameInfo.java:243-247` |
| `description=` | Adds the text to the description. | `zombie/gameStates/ChooseGameInfo.java:233-234` |
| `poster=` | Names a picture, looked for in `42/` first and in `common/` second. | `zombie/gameStates/ChooseGameInfo.java:222-232` |
| `author=` | Records the author. | `zombie/gameStates/ChooseGameInfo.java:248-249` |
| `require=` | Lists mod ids, separated by commas, that must be installed. The recipes do not use it. | `zombie/gameStates/ChooseGameInfo.java:235-236` |
| `versionMin=`, `versionMax=` | Mark the mod unavailable when the game is outside the range. The recipes do not use them. | `zombie/gameStates/ChooseGameInfo.java:329-348`, `zombie/gameStates/ChooseGameInfo.java:654-659` |

If a `require=` line names a mod that is not installed, the mod is marked unavailable. :cite[(`zombie/gameStates/ChooseGameInfo.java:661-682`)] The recipes in this cookbook leave `require=` out unless a recipe needs another mod, and then the page says so.

### Step 3. `42/poster.png`

The poster is the picture beside the mod in the list, and the mod loads without it. If the file is missing, the game uses a plain white texture, and in debug mode it writes `failed to load poster` to the log. :cite[(`zombie/gameStates/ChooseGameInfo.java:533-547`)] The code reads no size for the poster; this recipe makes a 256 by 256 picture, which is a choice of this page.

You can use any PNG. To make a plain blue one with nothing but Python, save this script as `make_poster.py` next to a spare folder and run `python make_poster.py`, then move `poster.png` into `42/`.

**File `make_poster.py`** (a helper, not part of the mod)

```python
import struct, zlib

W = H = 256
rows = b"".join(b"\x00" + bytes([40, 90, 140]) * W for _ in range(H))

def chunk(tag, data):
    body = tag + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(rows))
png += chunk(b"IEND", b"")
open("poster.png", "wb").write(png)
```

The result is a 761-byte PNG file, and every other recipe uses a copy of it.

### Step 4. `42/media/lua/shared/RecipeDemoSkeleton/Boot.lua`

This file proves the mod loaded. The game runs the Lua files of vanilla first and then those of each enabled mod, in the order of the mod list, and the `shared` folder runs before `client`. :cite[(`zombie/Lua/LuaManager.java:1200-1202`, `zombie/Lua/LuaManager.java:1255-1256`)] Putting the file in a folder named after the mod keeps its path from matching another mod's file.

**File `42/media/lua/shared/RecipeDemoSkeleton/Boot.lua`**

```lua
print("[RecipeDemoSkeleton] Boot.lua was loaded")

local function onGameStart()
    print("[RecipeDemoSkeleton] OnGameStart fired")
end

Events.OnGameStart.Add(onGameStart)
```

The first `print` runs when the file loads. The second runs when a game starts, because `OnGameStart` is raised from the in-game state. :cite[(`zombie/Lua/LuaEventManager.java:604`, `zombie/gameStates/IngameState.java:775`)] The function is passed to `.Add` as a value, without calling it.

The game writes its standard output to `console.txt` in the cache directory. :cite[(`zombie/gameStates/MainScreenState.java:184-188`)] The step that connects a Lua `print` to that output is part of the Kahlua library, which is not in the capture, so this page has not read it. The log lines are the check you do in the game.

## Turn it on and see it work

**Start the game in debug mode, check the mod, and read two lines in the log.**

1. Add `-debug` to the game's launch options, so that the command line carries it. The game reads `-debug` from its arguments and switches debug mode to enabled. :cite[(`zombie/gameStates/MainScreenState.java:242-243`)] In Steam the place for it is the Launch Options box in the game's properties; this page did not check that menu.
2. Start the game. On the main menu choose **MODS**, which opens the **SELECT MODS** screen. :cite[(`media/lua/shared/Translate/EN/UI.json:8`, `media/lua/shared/Translate/EN/UI.json:801`)]
3. Find **Recipe Demo Skeleton** in the list and click its box so that it shows a check mark. :cite[(`media/lua/client/OptionScreens/ModSelector/ModListBox.lua:193-194`)] Choose **ACCEPT**. :cite[(`media/lua/client/OptionScreens/ModSelector/ModSelector.lua:71-72`, `media/lua/shared/Translate/EN/UI.json:428`)]
4. Start a new game. Open `Zomboid/console.txt` in a text editor.

You should find `[RecipeDemoSkeleton] Boot.lua was loaded` near the point where the Lua files load, and `[RecipeDemoSkeleton] OnGameStart fired` once the world has started.

With debug mode enabled, the left side bar of the game shows a debug button, and it opens the debug menu, whose **Items List** you will use in the item recipes. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:453-458`, `media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:23`, `media/lua/shared/Translate/EN/IG_UI.json:5656`)] That list adds an item to your inventory when you double-click it. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:1536`)]

On a dedicated server, copy the mod folder into the `mods` folder of the server's own cache directory, so that it is `mods/RecipeDemoSkeleton/` there, and put the id in the settings file as `Mods=RecipeDemoSkeleton`. Separate several entries with `;`, for example `Mods=RecipeDemoSkeleton;OtherMod`, and do the same for `WorkshopItems=` when a mod comes from the Workshop.

The `mods` folder rule is in the code. :cite[(`zombie/ZomboidFileSystem.java:548-552`)] The `Mods=` and `WorkshopItems=` lines and the `;` separator are not re-read in the code for this page. These server steps have not been run in a game.

## If it does not work

**Most failures are a mod folder in the wrong place or a file the loader never reads.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| The mod is not in the MODS list at all | The folder must sit directly in `Zomboid/mods/`, with `mod.info` inside `common/` or the version folder. A folder named `examplemod` is refused. | `zombie/ZomboidFileSystem.java:493-498` |
| `can't find mod.info in mod dir` in the log | The version folder was not picked up or `mod.info` is in the wrong folder. Check that the folder is called `42` and holds `mod.info`. | `zombie/gameStates/ChooseGameInfo.java:198-208` |
| The mod is listed with a cross instead of a check mark | It is unavailable: a `require=` mod is missing, or the game is outside `versionMin=` and `versionMax=`. | `zombie/gameStates/ChooseGameInfo.java:632-682`, `media/lua/client/OptionScreens/ModSelector/ModListBox.lua:195-198` |
| The mod shows the id `undefined_id` or the name `Unnamed Mod` | The `id=` line does not start the line, or the `name=` line is missing or empty. | `zombie/gameStates/ChooseGameInfo.java:243-247`, `zombie/gameStates/ChooseGameInfo.java:489-491` |
| The poster is a white square | The `poster=` file is not in `42/` or `common/`. In debug mode the log says `failed to load poster`. | `zombie/gameStates/ChooseGameInfo.java:533-547` |
| No `[RecipeDemoSkeleton]` line in `console.txt` | The mod is not checked for this game, or the Lua file is not under `media/lua/shared/`, which the game loads before `media/lua/client/`. If the mod is checked, search the log for the mod id and for the file name. | `zombie/Lua/LuaManager.java:1255-1256` |

Script `.txt` files, which later recipes add, are parsed when the game loads, so after you change one you restart the game. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) covers the same loop for scripts.

## Going further

**Pick the next recipe, or read how the pieces fit.**

- [New item](/pz/build-42/modding/cookbook/new-item) adds the simplest thing a mod can add.
- [The B42 mod folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model) explains `common/` and the version folders.
- [Mod info fields and the versioning system](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system) lists every `mod.info` key.
- [Debug mode and dev tools](/pz/build-42/modding/foundations/in-game-debug-mode-and-dev-tools) covers what the debug menu offers.
- [The cookbook start page](/pz/build-42/modding/cookbook/cookbook-index) lists every recipe.

:::callout[How we know]{kind=proof}
The folder rules, the `mod.info` keys, the poster fallback and the load order come from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker. It has not been run in a game: the two log lines, the MODS screen and the Steam launch options are what you check yourself. The step from a Lua `print` to `console.txt` is not in the capture and is not verified here.
:::
