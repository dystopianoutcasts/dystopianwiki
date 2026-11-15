---
id: build-42-modding-stashes
slug: modding-stashes
title: 'Modding stashes'
game: pz
version: build-42
section: engine
category: stash-and-annotated-maps
difficulty: advanced
tags:
  - engine
  - stash
  - maps
  - modding
  - lua
  - multiplayer
excerpt: >-
  Build a complete mod that adds one stash map in Build 42.22, test it with the stash debug panel, run it on a dedicated server, and change or remove vanilla stashes. Includes what needs Java.
last_updated: '2026-11-14'
related_articles:
  - how-stash-maps-work
  - inside-the-stash-system
  - paper-maps-and-annotations
  - every-vanilla-stash
  - stash-and-maps-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [mod authors](#the-mod-file-by-file) | [server owners](#running-it-on-a-dedicated-server) | [anyone changing vanilla](#changing-vanilla-stashes)

:::callout[The 1-minute version]{kind=key}
- A stash is a row in a Lua table. One shared Lua file with `StashUtil.newStash` plus `addContainer` and `addStamp` is the whole data side.
- One client Lua file with `LootMaps.Init.<StashName>` zooms the map to your building. One `Stash.json` holds the title and note text.
- You need no new item: your stash can ride on a vanilla map item such as `Base.RosewoodMap`. A custom map item is optional.
- Test with the Stash debuggers panel in debug mode: your stash appears in its list, and Spawn gives you the map and sets up the building.
- On a dedicated server, the mod goes in `Mods=` and `WorkshopItems=`, each separated by `;`, and must also reach every client.
- Removing or editing a vanilla stash is a few lines of Lua. The roll formula, the zombie rule and the trap kinds need Java.
:::

:::facts
- **Files in the demo mod** 5 (`mod.info`, 1 shared Lua, 1 client Lua, 1 translation, 1 empty folder)
- **Data call** `StashUtil.newStash(name, type, item, customName)`
- **Demo building** the one vanilla Rosewood stash 5 points at, 8076, 11312
- **Load deadline** your shared Lua must run before world setup, which reads the table once
- **Server lists** `Mods=` and `WorkshopItems=`, separated by `;`
:::

## The mod, file by file

The demo mod adds one stash, "Demo Annotated Map", that points at the Rosewood restaurant.

It reuses the exact recipe of a vanilla stash (a duffel bag of food from `FoodCache1`), so every value in it is known to work. Where it goes while you develop (the folder rules are in [the B42 mod folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model)):

```
Zomboid/Workshop/ExampleStashDemo/
  Contents/
    mods/
      ExampleStashDemo/
        common/                                  <- must exist, may be empty
        42/
          mod.info
          media/
            lua/
              shared/
                StashDescriptions/
                  ExampleStashDesc.lua           <- the stash (server and client)
                Translate/
                  EN/
                    Stash.json                   <- title and note text
              client/
                ExampleStashDemo/
                  ExampleStashMaps.lua           <- how the map is drawn
```

**`42/mod.info`**

```
name=Example Stash Demo
id=ExampleStashDemo
author=You
description=Adds one demo stash map to Rosewood.
```

The `id` is what a server lists in `Mods=`. :cite[(`ChooseGameInfo.java:225-260`, `GameServer.java:667-676`)]

**`42/media/lua/shared/StashDescriptions/ExampleStashDesc.lua`**

```lua
require "StashDescriptions/StashUtil"

local stash = StashUtil.newStash(
    "ExampleStashMap1",              -- unique name, also the drawing function name
    "Map",                           -- the only type that does anything
    "Base.RosewoodMap",              -- the map item that can carry this stash
    "Stash_ExampleStashDemo_Title")  -- display name (a translation key)

stash.buildingX = 8076               -- a point inside the building, floor 0
stash.buildingY = 11312
stash.spawnTable = "FoodCache1"      -- loot table in Distributions.lua
stash.zombies = 2                    -- percent per floor square, at least 1 per room
stash.barricades = 50                -- percent per door and window

-- a duffel bag on a free floor square, filled from FoodCache1's "FoodBox" entry
stash:addContainer("FoodBox", nil, "Base.Bag_DuffelBagTINT", nil, nil, nil, nil)

-- a red circle on the building and one note
stash:addStamp("Circle", nil, 8076, 11312, 0.65, 0.054, 0.054)
stash:addStamp(nil, "Stash_ExampleStashDemo_Text1", 8030, 11290, 0.65, 0.054, 0.054)
```

Every call here is the vanilla one. `newStash` adds the row to the global `StashDescriptions` table and attaches `addStamp` and `addContainer` to it. :cite[(`StashUtil.lua:3-16`, `StashUtil.lua:18-31`, `StashUtil.lua:51-64`)] The values copy vanilla's restaurant stash, which has the same building and bag. :cite[(`media/lua/shared/StashDescriptions/RosewoodStashDesc.lua:58-68`)]

`addContainer(containerType, containerSprite, containerItem, room, x, y, z)` takes a type (a key in your loot table), then either a tile sprite or a bag item, then an optional room name, then an optional exact square. :cite[(`StashUtil.lua:51-64`, `Stash.java:80-98`)] Leave the room as `nil` unless you are sure the building has a room of that name. A room name that matches nothing places no container and only writes a log line. :cite[(`StashSystem.java:314-319`, `StashSystem.java:360-362`)]

**`42/media/lua/shared/Translate/EN/Stash.json`**

```json
{
    "Stash_ExampleStashDemo_Title": "Demo Annotated Map",
    "Stash_ExampleStashDemo_Text1": "pantry is in the back"
}
```

Keys must start with `Stash_`, because the translator sends only keys with that prefix to the stash text table. Mods' `Stash.json` files, from `common` and from the version folder, are merged over the base game's. :cite[(`Translator.java:158`, `Translator.java:228-230`, `Translator.java:365-398`, `Translator.java:458-459`)] Avoid a percent sign in the text: the translator runs every string through a format call. :cite[(`Translator.java:530-545`)]

The display name is not optional in practice. The engine passes `customName` to the translator without a null check, so a stash made without one most likely fails at load (read from code, not run). :cite[(`Stash.java:53`)]

**`42/media/lua/client/ExampleStashDemo/ExampleStashMaps.lua`**

```lua
require "ISUI/Maps/ISMapDefinitions"

-- the rectangle must contain the building point and every stamp
LootMaps.Init.ExampleStashMap1 = function(mapUI)
    local mapAPI = mapUI.javaObject:getAPIv1()
    MapUtils.initDirectoryMapData(mapUI, LootMaps.DEFAULT_MAP_DIRECTORY)
    MapUtils.initDefaultStyleV3(mapUI)
    mapAPI:setBoundsInSquares(7976, 11212, 8176, 11412)
end
```

The function name must equal the stash name, because the map window looks up the stash name first. It is the same shape as vanilla's stash drawing functions, minus the water style helper, which is local to the vanilla file. :cite[(`ISMapDefinitions.lua:428-443`, `ISMapDefinitions.lua:626-631`, `ISMapDefinitions.lua:392`)] The `require` makes sure `LootMaps` exists before your file assigns into it. :cite[(`ISMapDefinitions.lua:425-426`)] Without this file the stash still works, and the map falls back to drawing the whole Rosewood map. :cite[(`ISMapDefinitions.lua:436`, `ISMapDefinitions.lua:593-602`)]

## Seeing the result

You can see the stash in about two minutes with the debug tools, without waiting for a map to drop.

Here is the test from a cold start:

1. Start the game in debug mode. In Steam, right-click Project Zomboid, choose Properties, open Launch Options and type `-debug`. More is on [In-game debug mode and dev tools](/pz/build-42/modding/foundations/in-game-debug-mode-and-dev-tools).
2. Install the mod by hand. Copy the inner `ExampleStashDemo` folder (the one that holds `common` and `42`) into `C:\Users\<name>\Zomboid\mods\`, where `<name>` is your Windows user name. Create the `mods` folder if it is missing. Local installs are described on [The B42 mod project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure).
3. On the main menu choose Mods, tick **Example Stash Demo**, go back, and start a new single player game.
4. Open the debug menu, DEV tab, and press **Stash debuggers**. The list shows the stashes still in the possible list. `ExampleStashMap1` should be among them. :cite[(`ISDebugMenu.lua:35`, `StashDebug.lua:59-65`)]
5. Select it and press **Spawn**. In single player this makes the map, applies the stash to it, adds it to your inventory and sets up the building. :cite[(`StashDebug.lua:93-103`)]
6. Right-click the map in your inventory and read it. You should see the title "Demo Annotated Map", a red circle on the building and the note "pantry is in the back".
7. Go to the building at 8076, 11312 in Rosewood (the restaurant). In debug mode, open the Map Debugger and press **T** with the cursor over the spot to teleport there, or walk there using the world map. Expect boarded windows, at least one zombie in every room, and a duffel bag of food on a free floor square.

If your stash is not in the list, the Lua file did not load, the name is mistyped, or the stash is missing from an old save's possible list. The Reinitialize button reloads every stash from Lua and fixes the last case. :cite[(`StashDebug.lua:107-113`, `StashSystem.java:497-501`)] The debug path ignores the odds and the sandbox setting, and it skips the roll entirely. To test the roll, set Annotated Map Chance to Very Often and loot Rosewood-map containers; we did not run that test.

The spawn in step 5 calls `doStashItem`, which removes every stash at the same building point from the possible list. Because the demo shares its point with vanilla's restaurant stash, spawning yours also removes that one for the session. :cite[(`StashSystem.java:223-231`)]

A real mod should pick an unused building. The Map Editor's Stashes tab places a point by clicking, and its Lua button writes the header and `buildingX`, `buildingY` lines. See [Paper maps and annotations](/pz/build-42/engine/stash-and-annotated-maps/paper-maps-and-annotations#testing-tools).

## Making your stash roll as loot

For a stash to appear in the world, a map item of its type must be rolled by the loot system, and a vanilla map item such as `Base.RosewoodMap` already is.

A stash on a vanilla map item needs nothing more, but it shares the pool of that item with the other stashes (54 on the Rosewood map). :cite[(`StashSystem.java:125`, `media/lua/server/Items/ProceduralDistributions.lua:15922-15926`)]

A custom map item gives your stash its own pool. Add an item script and a Lua drawing function for the map id, then add the item to a loot list. This is the vanilla map script's shape, read, not run:

```
module Base
{
    item ExampleTownMap
    {
        DisplayCategory = Cartography,
        ItemType = base:map,
        Weight = 0.2,
        Icon = Map,
        Map = ExampleTownMap,
        StaticModel = MapInHand,
        WorldStaticModel = Map,
        Tags = base:ignorezombiedensity,
    }
}
```

:cite[(`media/scripts/generated/items/map.txt:149-160`)] Put it in `media/scripts/` in your mod, set the stash's item to `Base.ExampleTownMap`, add `LootMaps.Init.ExampleTownMap` next to your stash function, and add it to a list in a server Lua file. :cite[(`ProceduralDistributions.lua:15910-15927`, `Item.java:1818-1826`)]

```lua
-- media/lua/server/ExampleStashDemo/ExampleLoot.lua
require "Items/ProceduralDistributions"
table.insert(ProceduralDistributions.list.CrateMaps.items, "Base.ExampleTownMap")
table.insert(ProceduralDistributions.list.CrateMaps.items, 10)
```

An item list is a flat run of name, weight pairs. :cite[(`ProceduralDistributions.lua:15915-15926`)] The roll that turns an item into a stash map uses the container's `stashChance` (see the odds in [How stash maps work](/pz/build-42/engine/stash-and-annotated-maps/how-stash-maps-work#the-odds)), so a list that sets `stashChance = 10` gives your map the generous 91 in 100 gate.

## Running it on a dedicated server

On a dedicated server the mod must be in the server's mod lists and on every player's computer.

The server reads the `Mods=` line as a list of mod ids separated by `;` and the `WorkshopItems=` line as a list of Workshop ids separated by `;`. :cite[(`GameServer.java:667-676`, `GameServer.java:693-699`)]

```
Mods=ExampleStashDemo
WorkshopItems=1234567890
```

The number `1234567890` is a placeholder. Replace it with the Workshop id of your own uploaded item.

Both lines live in the server's settings file, `Zomboid\Server\<servername>.ini` (on Windows, in your user folder), where `<servername>` is the name you gave the server. `WorkshopItems=` only works for an item that is uploaded to the Workshop. A mod you have not uploaded goes in the server's own `Zomboid\mods` folder and appears in `Mods=` only. We did not run a server for this page, so treat the file and folder names as the usual layout, not a verified one.

With more than one mod, join them with a semicolon and no spaces: `Mods=ModA;ExampleStashDemo` and `WorkshopItems=111;222`. A backslash in the `Mods=` text is stripped before the split, so the older backslash-prefixed form still loads. :cite[(`GameServer.java:669`)] The Workshop id is the number from the upload page and the mod id is the `id=` line of `mod.info`; they are different values.

Both halves need the mod. The server needs the shared Lua (the stash data and the loot lists), and the client needs the client Lua (the drawing function) and the translation. Without the client file, a stash map opens as the plain town map. :cite[(`ISMapDefinitions.lua:436`)] The server rolls, arms and fills the stash, so test on a server by joining as an admin with debug rights and using the same Stash debuggers panel, which sends a client command that the server accepts for admins with the add-item capability. :cite[(`StashDebug.lua:95-97`, `ClientCommands.lua:774-791`)]

> **Warning:** Everything in a stash, including its building point and notes, is in shared Lua that every client downloads. Do not use a stash to hide anything you need to keep secret.

An existing server world has a saved list of possible stashes. A stash you add later is in the table but not in that list, so it never gets a map there; a stash you remove stays in the saved list. That is not harmless: the roll can no longer choose it, but its building is still listed as a stash building and refuses random stories, and the Stash debuggers panel throws on it. :cite[(`StashSystem.java:511-519`, `RandomizedBuildingBase.java:102-104`, `StashDebug.lua:61-63`)] New worlds start with the full table. :cite[(`StashSystem.java:441-463`, `IsoWorld.java:2068-2074`)]

## Changing vanilla stashes

Vanilla's stashes are rows in the same table, so a mod changes them by editing rows before the table is read.

Add a shared Lua file that requires the vanilla town files it edits, so they have run first, then edit the global `StashDescriptions`. :cite[(`StashSystem.java:73-85`, `StashUtil.lua:3-16`)]

```lua
require "StashDescriptions/RosewoodStashDesc"

local function findStash(name)
    for i, s in ipairs(StashDescriptions) do
        if s.name == name then return s, i end
    end
end

-- 1. remove a stash
local _, index = findStash("RosewoodStashMap3")
if index then table.remove(StashDescriptions, index) end

-- 2. change a stash
local s = findStash("RosewoodStashMap1")
if s then
    s.zombies = 10            -- was 5
    s.barricades = 80
    s.spawnOnlyOnZed = nil    -- allow it from any container
    s.spawnTable = "GunCache2"
end
```

Put the file in `media/lua/shared/` of your mod and list the mod after any mod that also edits those stashes. Editing works because `StashSystem.init` copies the table into Java objects when the world starts, and not before. :cite[(`StashSystem.java:61-85`, `IsoWorld.java:2068`)] Removing a stash from the table stops it being chosen on a save that already has it in its possible list, but it does not clean the saved list: that building stays a stash building that refuses random stories, and the Stash debuggers panel throws on the missing stash until you press Reinitialize (which also clears the read list). :cite[(`StashSystem.java:121-129`, `StashSystem.java:511-519`, `StashDebug.lua:61-63`, `StashDebug.lua:107-113`)]

To change what a cache holds, change the loot table, not the stash. The tables are plain Lua in `SuburbsDistributions`, parsed after the distribution events, so edit them in `OnPostDistributionMerge`. :cite[(`IsoWorld.java:1906-1921`, `ItemPickerJava.java:173-180`, `Distributions.lua:21196-21200`)]

Put this in its own file, `media/lua/server/ExampleStashDemo/TweakCaches.lua`, inside the mod's `42` folder next to the other Lua files.

```lua
local function tweakCaches()
    local box = SuburbsDistributions.FoodCache1 and SuburbsDistributions.FoodCache1.FoodBox
    if box then
        table.insert(box.items, "Base.Bandage")
        table.insert(box.items, 5)
    end
end
Events.OnPostDistributionMerge.Add(tweakCaches)
```

The odds have three levers that Lua can reach: the sandbox option (`AnnotatedMapChance`), a container list's `stashChance` and `maxMap` fields, and the weight of a map item in a list. :cite[(`StashSystem.java:97-120`, `ItemPickerJava.java:344-346`, `ItemPickerJava.java:1250-1253`)]

## What needs Java

The engine hard-codes these rules, so a Lua mod cannot change them.

Each row shows where the fixed value lives.

| Rule | Where it is fixed | Code |
|---|---|---|
| The chance steps per sandbox choice (+15, +10, 0, -10, -20) and Never at 1 | `checkStashItem` switch | :cite[(`StashSystem.java:102-118`)] |
| The default stash chance of an item (80) | field initializer | :cite[(`InventoryItem.java:273`)] |
| The five trap kinds a stash can place | private static list | :cite[(`StashSystem.java:58`, `StashSystem.java:65-69`)] |
| The zombie count rule (at least 1 per room, cap half the room, the sandbox offsets) | `doSpecificBuildingProperties` | :cite[(`StashSystem.java:380-415`)] |
| Only type "Map" does anything | `doStashItem` and `Stash.load` | :cite[(`StashSystem.java:163-199`, `Stash.java:100`)] |
| The visited rules that drop a stash | `doBuildingStash`, `visitedBuilding` | :cite[(`StashSystem.java:241-243`, `StashSystem.java:429-439`)] |
| The floor-0 room lookup and strict-inside building test | `checkStashItem`, `doBuildingStash` | :cite[(`StashSystem.java:131`, `StashSystem.java:240`)] |
| The day count wrapping at 30 | `GameTime.getDaysSurvived` | :cite[(`GameTime.java:247-248`)] |
| Which story classes skip stash buildings | each story's `isValid` | :cite[(`RandomizedBuildingBase.java:102-104`)] |

A Lua mod can still call the exposed `StashSystem` methods, for example `StashSystem.getPossibleStashes()` to read what is left, or `StashSystem.reinit()` to rebuild everything, which also clears the read list. :cite[(`LuaManager.java:2524`, `StashSystem.java:493-501`)]

Three traps for the unwary: a stash whose `item` is not a map item throws when it is chosen, `traps = "n"` places no traps and `"a-b"` places `b - a`, and a day limit of 30 or more never applies. :cite[(`StashSystem.java:164-166`, `StashSystem.java:367`, `GameTime.java:247-248`)]

:::callout[How we know]{kind=proof}
Every engine fact is cited to the 42.22 capture. We did not run the demo mod. Not verified: that the demo loads and renders as described, that `Zomboid/mods` or the Workshop test folder is picked up on your setup, that the missing `customName` fails, that `require` of a vanilla town file orders load as intended, and the custom item and loot-list steps. The test that settles it: follow the seven test steps above on a new debug single player game and compare what you see.
:::
