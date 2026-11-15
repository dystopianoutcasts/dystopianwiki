---
id: build-42-stash-and-maps-reference
slug: stash-and-maps-reference
title: 'Stash and maps reference'
game: pz
version: build-42
section: engine
category: stash-and-annotated-maps
difficulty: advanced
tags:
  - engine
  - stash
  - maps
  - lua
  - reference
  - sandbox
  - modding
excerpt: >-
  Lookup tables for Build 42.22 stashes: what Lua can call, every StashDescriptions key, every StashUtil function, the AnnotatedMapChance option, the saved lists and the ReadAnnotedMap packet.
last_updated: '2026-11-14'
related_articles:
  - how-stash-maps-work
  - inside-the-stash-system
  - paper-maps-and-annotations
  - every-vanilla-stash
  - modding-stashes
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [mod authors](#what-lua-can-call) | [table writers](#the-stashdescriptions-table) | [server owners](#the-sandbox-option) | the story behind each row is in [Inside the stash system](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system)

:::callout[The 1-minute version]{kind=key}
- Lua can call 16 `StashSystem` methods, 6 `Stash` methods and 1 `StashBuilding` method. It cannot read their fields, and it cannot reach `StashAnnotation` or `StashContainer` at all.
- A stash is a Lua table with 14 keys. `StashUtil.newStash` builds it, `addStamp` and `addContainer` fill it, and `StashSystem.init` reads it once at world setup.
- `StashUtil.newStash` attaches `addStamp` and `addContainer` only. `addStampV2` exists in the same file, but a new stash does not carry it.
- The only sandbox option is `AnnotatedMapChance`: 6 choices, default 4 ("Sometimes"), read live at each roll.
- Saved state is three lists in `map_meta.bin`, plus a `stashMap` name on each map item.
- One network packet, `ReadAnnotedMap`, carries a stash name from a client to the server.
:::

:::facts
- **Lua-callable methods** 16 on `StashSystem`, 6 on `Stash`, 1 on `StashBuilding`
- **Table keys** 14 on the stash, 7 on a container, 10 on a stamp
- **StashUtil functions** 4 (`newStash`, `addStamp`, `addStampV2`, `addContainer`)
- **Sandbox option** `AnnotatedMapChance`, 6 choices, default 4
- **Day limit wrap** days count 0 to 29 and wrap, so a full wrap is about 45 real hours at the default day length of 1 hour 30 minutes (:cite[(`SandboxOptions.java:71`, `Sandbox.json:30`)])
- **Saved lists** 3, in the world's `map_meta.bin`
:::

## What Lua can call

Lua reaches three classes by name, `StashSystem`, `Stash` and `StashBuilding`, and everything else in the system is hidden from it. :cite[(`LuaManager.java:2524-2526`)]

`StashAnnotation` and `StashContainer` are not exposed, so a mod edits them only through the table that builds them. :cite[(`StashAnnotation.java:14`, `StashContainer.java:10`)]

The fields of `Stash` and `StashBuilding` are public in Java, but the engine's API index marks them as not callable from Lua, so a mod reads a stash through its getters. The same index marks the three public lists on `StashSystem` as exposed; vanilla Lua never uses them directly and always goes through the getter methods. We did not test field access in a running game. :cite[(`Stash.java:24-39`, `StashBuilding.java:14-16`, `StashSystem.java:55-57`, `api/api.jsonl`)]

### StashSystem (static methods)

All of these are static, so Lua calls them as `StashSystem.name(...)`. The class sits on the Lua whitelist by its annotation. :cite[(`StashSystem.java:53-54`)]

| Method | What it does | Where it is explained | Code |
|---|---|---|---|
| `init()` | Builds `allStashes`, `possibleStashes` and `buildingsToDo` from Lua, once. Does nothing if the lists exist. | [Inside, step 1](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#step-1-load-the-table) | :cite[(`StashSystem.java:61-71`)] |
| `initAllStashes()` | Rebuilds `allStashes` and `possibleStashes` from the table. Does not touch `buildingsToDo`. | same | :cite[(`StashSystem.java:73-85`)] |
| `getAllStashes()` | The list of every `Stash`. | same | :cite[(`StashSystem.java:87-89`)] |
| `getPossibleStashes()` | The list of `StashBuilding` still waiting for a map. | same | :cite[(`StashSystem.java:493-495`)] |
| `getAlreadyReadMap()` | The list of stash names read so far. Feeds the world map icons. | [Paper maps](/pz/build-42/engine/stash-and-annotated-maps/paper-maps-and-annotations) | :cite[(`StashSystem.java:91-93`, `ISWorldMap.lua:597`)] |
| `getStash(name)` | The `Stash` with that exact name, or null. | | :cite[(`StashSystem.java:418-427`)] |
| `checkStashItem(item)` | The loot roll: maybe turns a map item into a stash map. Does nothing on a client. | [Inside, step 2](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#step-2-a-map-item-picks-a-stash) | :cite[(`StashSystem.java:95-156`)] |
| `doStashItem(stash, item)` | Writes the stash onto a map item and removes the building from the possible list. Throws for a non-map item. | [Inside, step 3](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#step-3-the-item-becomes-a-stash-map) | :cite[(`StashSystem.java:158-200`)] |
| `prepareBuildingStash(name)` | Arms a building: records the name as read and queues the building. | [Inside, step 4](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#step-4-reading-the-map-arms-the-building) | :cite[(`StashSystem.java:202-214`)] |
| `doBuildingStash(buildingDef)` | Fills every queued stash inside that building. | [Inside, step 5](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#step-5-the-building-is-filled) | :cite[(`StashSystem.java:233-305`)] |
| `visitedBuilding(buildingDef)` | Drops that building from the possible list. Does nothing on a client. | [Inside, step 6](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#step-6-any-visit-protects-the-building-from-stashes) | :cite[(`StashSystem.java:429-439`)] |
| `isStashBuilding(buildingDef)` | True if the building is in the possible list or the to-do list. | | :cite[(`StashSystem.java:511-531`)] |
| `reinit()` | Drops the lists, empties the read list and runs `init` again. | [Modding stashes](/pz/build-42/engine/stash-and-annotated-maps/modding-stashes) | :cite[(`StashSystem.java:497-501`)] |
| `Reset()` | Sets every list to null or empty. Called from the in-game state's `exit` method. | | :cite[(`StashSystem.java:503-509`, `IngameState.java:806`, `IngameState.java:929`)] |
| `load(buffer, worldVersion)` | Reads the three saved lists. Meant for the engine's save code. | [Save data](#save-data) | :cite[(`StashSystem.java:441-463`)] |
| `save(buffer)` | Writes the three saved lists. Meant for the engine's save code. | [Save data](#save-data) | :cite[(`StashSystem.java:465-491`)] |

A mod has no reason to call `load` or `save` from Lua, and a call to `reinit` mid-game also clears `buildingsToDo`, because `init` builds a fresh one. :cite[(`StashSystem.java:62-64`, `StashSystem.java:497-501`)]

### Stash and StashBuilding (instance methods)

| Class | Method | Returns | Code |
|---|---|---|---|
| `Stash` | `getName()` | the stash name | :cite[(`Stash.java:116-118`)] |
| `Stash` | `getItem()` | the map item's full type, such as `Base.RosewoodMap` | :cite[(`Stash.java:120-122`)] |
| `Stash` | `getBuildingX()`, `getBuildingY()` | the building point | :cite[(`Stash.java:124-130`)] |
| `Stash` | `applyAnnotations(uiWorldMap)` | draws the stash's stamps on a world map window. Used for the icon preview on the world map. | :cite[(`Stash.java:132-166`, `ISWorldMap.lua:771-773`)] |
| `Stash` | `load(table)` | reads one description table. Called by the engine; a mod should not call it. | :cite[(`Stash.java:45-114`)] |
| `StashBuilding` | `getName()` | the stash name it belongs to | :cite[(`StashBuilding.java:24-26`)] |

`StashBuilding` has no getter for its x and y, so Lua can read a building's coordinates only through the matching `Stash`. :cite[(`StashBuilding.java:14-26`, `Stash.java:124-130`)] There is no getter on `Stash` for the loot table, the container list, the day limits, the zombie percent or the barricade percent. A mod that needs those reads the `StashDescriptions` row it wrote. :cite[(`Stash.java:116-130`)]

## The StashDescriptions table

`StashDescriptions` is a global Lua list of rows, and each row becomes one `Stash` when `StashSystem.init` iterates it. :cite[(`StashSystem.java:73-85`)]

The name comes from `name`; every other key is read by `Stash.load`. :cite[(`StashSystem.java:81`, `Stash.java:45-113`)]

A key left out is read as -1 for integers, per the table reader's bytecode (see [Inside, step 1](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#step-1-load-the-table)). So an absent `zombies` or `barricades` means none. :cite[(`Stash.java:54-55`)]

| Key | Type | Meaning | Code |
|---|---|---|---|
| `name` | string | unique stash name; also the map drawing function name | :cite[(`StashSystem.java:81`)] |
| `type` | string | only `"Map"` does anything | :cite[(`Stash.java:46`, `Stash.java:100`, `StashSystem.java:163`)] |
| `item` | string | full type of the map item that can carry it | :cite[(`Stash.java:47`, `StashSystem.java:125`)] |
| `customName` | string | translation key for the item's new display name | :cite[(`Stash.java:53`, `StashSystem.java:159-161`)] |
| `buildingX`, `buildingY` | int | a point inside the building, floor 0 | :cite[(`Stash.java:48-51`, `StashSystem.java:131`)] |
| `spawnTable` | string | loot table name in the room distributions | :cite[(`Stash.java:52`, `StashSystem.java:247`)] |
| `zombies` | int | percent per floor square, per room. -1 or absent: no zombies | :cite[(`Stash.java:54`, `StashSystem.java:380-415`)] |
| `barricades` | int | percent per door and window. -1 or absent: none | :cite[(`Stash.java:55`, `StashSystem.java:286`)] |
| `spawnOnlyOnZed` | boolean | map must be rolled inside a corpse | :cite[(`Stash.java:56`, `StashSystem.java:217`)] |
| `daysToSpawn` | string `"a-b"` or `"a"` | min and max day, or min only | :cite[(`Stash.java:57-66`, `StashSystem.java:218-219`)] |
| `traps` | string `"a-b"` or `"n"` | places `b - a` traps; `"n"` places none | :cite[(`Stash.java:68-78`, `StashSystem.java:366-378`)] |
| `containers` | list of rows | special containers, below | :cite[(`Stash.java:80-98`)] |
| `annotations` | list of rows | stamps and notes, read only when `type` is `"Map"` | :cite[(`Stash.java:100-113`)] |

The day numbers wrap at 30, and the traps rule is "up to but not including". The reasons are in [Inside the stash system](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#containers-traps-and-zombies). A malformed `daysToSpawn` or `traps` string (letters, an empty part) throws a number-format error inside `Stash.load`, with no guard around it. :cite[(`Stash.java:61`, `Stash.java:64`, `Stash.java:72-73`, `Stash.java:75`)] We read that and did not trigger it.

### Container rows

| Key | Default | Meaning | Code |
|---|---|---|---|
| `room` | `"all"` when absent | room name to place in, or any room | :cite[(`StashContainer.java:19-24`)] |
| `containerType` | none | key into the loot table; the type of an empty container | :cite[(`Stash.java:87`, `StashSystem.java:346-356`)] |
| `containerSprite` | none | tile sprite for a placed container | :cite[(`Stash.java:87`, `StashSystem.java:354`)] |
| `containerItem` | none | bag item to spawn instead of a tile; logs an error at load if the item does not exist | :cite[(`Stash.java:91-94`, `StashSystem.java:333-352`)] |
| `contX`, `contY`, `contZ` | -1 | exact square; used only when `room` is `"all"` and all three are set | :cite[(`Stash.java:88-90`, `StashSystem.java:321-322`)] |

Note the order in which `StashContainer` is built: the Java constructor takes `room`, then `containerSprite`, then `containerType`, while the Lua helper takes `containerType` first. The helper writes the keys by name, so the order only matters if you build rows by hand. :cite[(`StashContainer.java:19`, `Stash.java:87`, `StashUtil.lua:51-63`)]

### Stamp rows

| Key | Default | Meaning | Code |
|---|---|---|---|
| `symbol` | none | a map symbol id; wins over `text` | :cite[(`StashAnnotation.java:28`, `StashSystem.java:172-174`)] |
| `text` | none | a translation key or plain text | :cite[(`StashAnnotation.java:29`, `StashSystem.java:175-185`)] |
| `x`, `y` | read as float | map position in world squares | :cite[(`StashAnnotation.java:30-31`)] |
| `r`, `g`, `b` | read as float | color, 0 to 1 | :cite[(`StashAnnotation.java:32-34`)] |
| `anchorX`, `anchorY` | not a number (unset) | which point of the stamp sits on the position | :cite[(`StashAnnotation.java:22-23`, `StashAnnotation.java:35-36`)] |
| `rotation` | not a number (unset) | degrees | :cite[(`StashAnnotation.java:37`, `StashSystem.java:191-193`)] |

Texture stamps default to anchor 0.5, 0.5 and scale 0.666; text stamps set an anchor only when both parts are given. :cite[(`StashSystem.java:172-190`)] How stamps reach the paper map is on [Paper maps and annotations](/pz/build-42/engine/stash-and-annotated-maps/paper-maps-and-annotations).

## StashUtil

`StashUtil` is a plain Lua table in a shared file, so any mod can read or wrap it.

It holds four functions. :cite[(`StashUtil.lua:1`, `StashUtil.lua:3`, `StashUtil.lua:18`, `StashUtil.lua:33`, `StashUtil.lua:51`)]

| Function | Call it as | Arguments | What it does | Code |
|---|---|---|---|---|
| `StashUtil.newStash` | `StashUtil.newStash(...)` (dot) | `name, type, item, customName` | Creates the `StashDescriptions` table if missing, builds a row, attaches `addStamp` and `addContainer`, appends the row and returns it. | :cite[(`StashUtil.lua:3-16`)] |
| `StashUtil:addStamp` | `stash:addStamp(...)` (colon) | `symbol, text, mapX, mapY, r, g, b` | Appends a stamp with no anchor and no rotation. | :cite[(`StashUtil.lua:18-31`)] |
| `StashUtil:addStampV2` | `StashUtil.addStampV2(stash, ...)` | `symbol, text, mapX, mapY, anchorX, anchorY, rotation, r, g, b` | Same, with an anchor and a rotation. | :cite[(`StashUtil.lua:33-49`)] |
| `StashUtil:addContainer` | `stash:addContainer(...)` (colon) | `containerType, containerSprite, containerItem, room, x, y, z` | Appends a container row. Pass `nil` for what you do not use. | :cite[(`StashUtil.lua:51-64`)] |

`newStash` copies only `addStamp` and `addContainer` onto the row. :cite[(`StashUtil.lua:12-13`)] No vanilla stash file calls `addStampV2`, and the Map Editor's Annotations tab writes `stashMap:addStampV2(...)` lines for you to paste. :cite[(`WorldMapEditorMode_Annotations.lua:208-215`)]

Pasted onto a stash from `newStash`, that call would most likely fail, because the row has no such method. Attach it first with `stash.addStampV2 = StashUtil.addStampV2`, or call `StashUtil.addStampV2(stash, ...)`. We read this and did not run it.

Vanilla's town files all start with `require "StashDescriptions/StashUtil"`. A mod's file should do the same, so `StashUtil` exists when the file runs. :cite[(`RosewoodStashDesc.lua:1`, `BrandenburgStashDesc.lua:7`)]

## The sandbox option

`AnnotatedMapChance` is one enum option with 6 choices and a default of 4. :cite[(`SandboxOptions.java:155`, `SandboxOptions.java:539-541`)]

The engine reads it each time `checkStashItem` runs, not once at load, so a change on a running server applies to the next roll. :cite[(`StashSystem.java:102`)]

| Choice | English label | Effect on the roll | Code |
|---|---|---|---|
| 1 | Never | `checkStashItem` returns at once | :cite[(`StashSystem.java:103-104`, `Sandbox.json:650`)] |
| 2 | Extremely Rare | chance +15 | :cite[(`StashSystem.java:105-107`, `Sandbox.json:651`)] |
| 3 | Rare | chance +10 | :cite[(`StashSystem.java:108-109`, `Sandbox.json:652`)] |
| 4 | Sometimes (default) | no change | :cite[(`StashSystem.java:110-112`, `Sandbox.json:653`)] |
| 5 | Often | chance -10 | :cite[(`StashSystem.java:113-115`, `Sandbox.json:654`)] |
| 6 | Very Often | chance -20 | :cite[(`StashSystem.java:116-117`, `Sandbox.json:655`)] |

The numbers in "in 100" form are in the table on [How stash maps work](/pz/build-42/engine/stash-and-annotated-maps/how-stash-maps-work#the-odds). The base chance is the item's `stashChance`, which is 80 by default, or 60 if an item reports a value of 0 or less. :cite[(`StashSystem.java:97-101`, `InventoryItem.java:273`)] A map picked from a loot list that sets its own `stashChance` takes that value instead. :cite[(`ItemPickerJava.java:1250-1253`)]

| Where it is set | Value | Code |
|---|---|---|
| Java default | 4 | :cite[(`SandboxOptions.java:155`)] |
| Apocalypse, Rising, Six Months Later presets | 4 | :cite[(`Apocalypse.lua:83`, `Rising.lua:83`, `SixMonthsLater.lua:60`)] |
| Outbreak preset | 5 | :cite[(`Outbreak.lua:83`)] |
| Extinction preset | 2 | :cite[(`Extinction.lua:83`)] |
| 28 Minutes Later challenge | 1 | :cite[(`28MinutesLater.lua:83`)] |
| Top of the World challenge | 4 | :cite[(`TopOfTheWorld.lua:90`)] |
| Server settings screen | listed as an editable option | :cite[(`ServerSettingsScreen.lua:4945`)] |

No vanilla Lua reads `SandboxVars.AnnotatedMapChance`; only the Java roll does. That is a search of the Lua folders in the capture, so a mod that reads it will be the first. :cite[(`StashSystem.java:102`)] There is no separate option for the zombie count, the barricades or the day limits of a stash; those come only from the table. The zombie count does depend on the general zombie population option. :cite[(`StashSystem.java:393-401`)]

## Save data

The saved state is three lists written into the world's `map_meta.bin`, plus a name on each map item. :cite[(`StashSystem.java:465-491`, `IsoMetaGrid.java:1126`, `IsoMetaGrid.java:1662-1664`)]

| Block | Layout | Code |
|---|---|---|
| Possible stashes | an int count, then for each: name string, int x, int y | :cite[(`StashSystem.java:467-474`)] |
| Buildings to do | an int count, then for each: name string, int x, int y | :cite[(`StashSystem.java:476-483`)] |
| Already read | an int count, then for each: name string | :cite[(`StashSystem.java:485-489`)] |
| Item field `stashMap` | a flag bit 32768 on the item, then the name string | :cite[(`InventoryItem.java:256`, `InventoryItem.java:1785-1788`, `InventoryItem.java:2123-2125`)] |

Strings go through the engine's standard string writer. :cite[(`StashSystem.java:471`, `GameWindow.java:1102-1104`)] On a server the block is preceded by a length number that the server fills in after writing, and the loader reads and ignores it. A single-player game writes no prefix. A multiplayer client writes nothing and, on load, skips ahead. :cite[(`IsoMetaGrid.java:1108-1114`, `IsoMetaGrid.java:1264-1272`)]

On load, all three lists are replaced by the saved ones; the table is not consulted again for the possible list. :cite[(`StashSystem.java:441-463`)] What that means for a mod that adds or removes a stash on an old save is in [Inside the stash system](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#what-is-saved-and-where).

## The ReadAnnotedMap packet

The packet carries one string, the stash name, from a client to the server.

The spelling "Annoted" is the engine's own. :cite[(`ReadAnnotedMapPacket.java:27-29`, `PacketTypes.java:419`)]

| Part | Value | Code |
|---|---|---|
| Class | `ReadAnnotedMapPacket` | :cite[(`ReadAnnotedMapPacket.java:27`)] |
| Field | `stashName`, a string | :cite[(`ReadAnnotedMapPacket.java:28-29`)] |
| Written as | one UTF string | :cite[(`ReadAnnotedMapPacket.java:32-34`)] |
| Read as | one UTF string | :cite[(`ReadAnnotedMapPacket.java:37-39`)] |
| Packet settings | ordering 0, priority 1, reliability 2, capability `LoginOnServer`, handled by the server | :cite[(`ReadAnnotedMapPacket.java:20-26`, `PacketSetting.java:35-37`)] |
| Server action | `StashSystem.prepareBuildingStash(stashName)` | :cite[(`ReadAnnotedMapPacket.java:42-44`)] |
| Sent by | `InventoryItem.doBuildingStash`, when it runs on a client | :cite[(`InventoryItem.java:3684-3688`)] |

The server's answer is the same step 4 that a single-player read runs. :cite[(`InventoryItem.java:3689`, `StashSystem.java:202-214`)] In vanilla, the read action calls `doBuildingStash` from its `complete` method, which the engine skips on clients, so real play arms the building on the server and the packet is the route for a mod that calls `doBuildingStash` on a client. :cite[(`ISReadMapItem.lua:36-39`, `LuaTimedActionNew.java:176-181`)] Nothing else in the capture sends or handles this packet. :cite[(`PacketTypes.java:419`, `InventoryItem.java:3687`, `ReadAnnotedMapPacket.java:43`)]

The client commands that touch stashes are the debug ones, `debugAction.spawnStashMap` and `debugAction.reinitStashes`. They are used by the Stash debuggers panel and are covered in [Modding stashes](/pz/build-42/engine/stash-and-annotated-maps/modding-stashes#seeing-the-result). :cite[(`ClientCommands.lua:774-800`, `StashDebug.lua:93-113`)]

## Traps

Five details cost modders time, and each is a read, not a run.

- **A stash removed from the table but still in a saved list can break the debug panel.** The panel looks up each possible entry with `getStash`, which returns null for a removed stash, and then calls `getName` on the result. :cite[(`StashDebug.lua:61-63`, `StashSystem.java:418-427`)]
- **`addStampV2` is not on a new stash.** See [StashUtil](#stashutil).
- **`getDaysSurvived` wraps at 30.** A day limit of 30 or more cannot do anything. :cite[(`GameTime.java:237-249`)]
- **`init` runs everywhere.** It is called in world setup with no multiplayer guard and again when the server builds its map, so the table must be complete in shared Lua on every machine. :cite[(`IsoWorld.java:2068`, `ServerMap.java:221`)]
- **Only the roll skips clients.** `checkStashItem` and `visitedBuilding` return on a client, but the lists exist there and `getAlreadyReadMap` is read by the world map. :cite[(`StashSystem.java:96`, `StashSystem.java:430`, `ISWorldMap.lua:597`)]

:::callout[How we know]{kind=proof}
Every row comes from the 42.22 decompiled Java and Lua, with the line opened before it was cited. The Lua exposure column comes from the engine's API index, not from a running game. Not verified: field access from Lua on the exposed `StashSystem` lists, the failure of `stash:addStampV2` on a `newStash` row, the number-format failure on a malformed `daysToSpawn`, the debug panel error for a removed stash, whether an absent boolean key reads as false, and the behavior of a `customName` that is nil. The decompiled output is not the original source; the one bytecode check behind the -1 default is described in [Inside the stash system](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system).
:::
