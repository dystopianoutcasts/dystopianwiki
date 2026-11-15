---
id: build-42-inside-the-stash-system
slug: inside-the-stash-system
title: 'Inside the stash system'
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
  - multiplayer
  - modding
excerpt: >-
  The full life of a stash in Build 42.22: loading the Lua table, naming a map, arming a building, filling it at chunk load, what is saved, and which side runs each step.
last_updated: '2026-11-14'
related_articles:
  - how-stash-maps-work
  - paper-maps-and-annotations
  - every-vanilla-stash
  - modding-stashes
  - stash-and-maps-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#the-rules-in-order) | [server owners](#which-side-runs-each-step) | new players should start at [How stash maps work](/pz/build-42/engine/stash-and-annotated-maps/how-stash-maps-work)

:::callout[The 1-minute version]{kind=key}
- A stash is a Lua table. The engine turns each one into a `Stash` object when the world loads, and lists its building as a "possible stash".
- A rolled map item picks one possible stash (`checkStashItem`), copies its stamps onto the item and takes the stash out of the possible list.
- Reading the map moves the building to a to-do list (`prepareBuildingStash`). The building is filled when it is fully loaded (`doBuildingStash`), and only if nobody has visited it.
- Filling means: refill matching containers from the stash's loot table, add special containers, traps, zombies and barricades, and mark the building explored.
- Three lists are saved in the world file. Clients keep none of it, and the server runs every step except drawing.
:::

:::facts
- **Java classes** 5 in `zombie/core/stash`, 794 lines in all
- **Entry points** 1 init, 1 roll, 1 read, 1 fill, 1 visit
- **Saved lists** 3 (possible, to do, already read)
- **Day limit rule** days counted from the longest-surviving local player, wrapped at 30 (about 45 real hours at the default day length of 1 hour 30 minutes, choice 4 of the day length option) :cite[(`SandboxOptions.java:71`, `Sandbox.json:30`)]
- **Zombie floor** at least 1 zombie in each room when a stash sets zombies
:::

## The parts

The system is five small classes and one Lua table, and nothing else holds stash state. :cite[(`StashSystem.java:55-59`, `Stash.java:23-39`, `StashBuilding.java:13-16`, `StashContainer.java:10-17`, `StashAnnotation.java:14-24`)]

::::cards
:::card[Stash]{accent=orange}
One description loaded from Lua: name, map item, building coordinates, loot table, containers, stamps, zombies, barricades, traps and day limits. `allStashes` holds all of them.
:::
:::card[StashBuilding]{accent=blue}
A stash name with a building x and y. Three lists use it: `possibleStashes`, `buildingsToDo` and the ones saved to disk.
:::
:::card[StashContainer]{accent=purple}
A special container to place: type, tile sprite or bag item, room, and an optional exact square.
:::
:::card[StashAnnotation]{accent=cream}
One stamp or note: symbol or text, map position, color, and optional anchor and rotation.
:::
::::

`StashSystem` itself is a static class with the three lists, the roll, the arming step and the fill. It is exposed to Lua, along with `Stash` and `StashBuilding`, so mods can read the lists and call the steps. :cite[(`StashSystem.java:54-59`, `LuaManager.java:2524-2526`)]

## The rules in order

A stash goes through six steps, and each step is a single method.

Here is the whole path as a drawing, then each step in turn.

```
 world start
   |  StashSystem.init  ->  Lua table StashDescriptions
   |                        -> allStashes + possibleStashes     (step 1)
   v
 a map item is rolled as loot (server or single player)
   |  checkStashItem   -> sandbox gate -> pick one eligible stash   (step 2)
   |  doStashItem      -> copy stamps, rename, set item.stashMap,
   |                      drop stash from possibleStashes          (step 3)
   v
 the player reads the map
   |  prepareBuildingStash -> alreadyReadMap + buildingsToDo       (step 4)
   v
 the building is fully loaded (now, or when its chunks stream in)
   |  doBuildingStash  -> fill / containers / traps / zombies /
   |                      barricades, mark explored                (step 5)
   v
 anyone enters or sees the building
      visitedBuilding  -> removed from possibleStashes             (step 6)
```

### Step 1: load the table

`StashSystem.init` runs once, reads the global Lua table `StashDescriptions` and builds one `Stash` for every entry. :cite[(`StashSystem.java:61-85`)] Each `Stash.load` also adds a matching `StashBuilding` to `possibleStashes`, so at the start of a new world every stash is possible. :cite[(`Stash.java:45-51`)]

The call sits in world setup with no multiplayer guard, so it runs on single player, on a client and on a dedicated server (the server also calls it when its map is built). :cite[(`IsoWorld.java:2068`, `ServerMap.java:221`)] Lua shared files have already run by then, which is why a mod's `StashUtil.newStash` call at load time is in time. :cite[(`StashUtil.lua:3-16`)]

Missing numbers are read as -1, so a stash that leaves out `zombies` or `barricades` means "none". This comes from the Java table reader, which returns -1 when a key is absent (checked in the jar's bytecode, not the decompiled source). :cite[(`Stash.java:54-55`, `projectzomboid.jar: se/krka/kahlua/j2se/KahluaTableImpl.rawgetInt`)]

### Step 2: a map item picks a stash

When the loot system rolls an item into a container, `checkStashItem` runs and decides whether this item becomes a stash map. The main roll skips shop containers. :cite[(`ItemPickerJava.java:1053-1055`, `ItemPickerJava.java:1250-1256`)]

The second call site, for items rolled inside a bag, has no shop test. A map that the container's `maxMap` limit has just removed still reaches `checkStashItem`, so a stash can be used up by a map that is thrown away. :cite[(`ItemPickerJava.java:1314-1329`)] It does nothing on a multiplayer client and does nothing if there are no possible stashes. :cite[(`StashSystem.java:96`)]

The gate is the sandbox option. The starting chance is the item's `stashChance` (80 unless the container's table set 10 and the item is a map with an id), moved by the choice, and the roll passes when `Rand.Next(100) <= 100 - chance`. Choice 1 returns at once. The numbers per choice are in the table on [How stash maps work](/pz/build-42/engine/stash-and-annotated-maps/how-stash-maps-work#the-odds). :cite[(`StashSystem.java:97-120`, `InventoryItem.java:273`, `ItemPickerJava.java:1250-1253`)]

If the gate passes, the engine builds a list of stashes that fit and picks one with equal odds. A stash fits when all of these hold :cite[(`StashSystem.java:121-153`, `StashSystem.java:216-221`)]:

1. Its `item` equals this item's full type.
2. If `spawnOnlyOnZed` is set, the item sits in a corpse container; otherwise there is no such limit.
3. The days survived are at least `minDayToSpawn` (when set) and at most `maxDayToSpawn` (when set).
4. Its name is in `possibleStashes`.
5. A room exists at its building coordinates on floor 0, that room has a building, and the building has not been visited.

If the list is empty, the item stays a plain map.

### Step 3: the item becomes a stash map

`doStashItem` writes the stash onto the item. It sets the display name to the stash's custom name, copies every annotation to the item's own symbol list, removes the stash from `possibleStashes` and stores the stash name in the item's `stashMap` field. :cite[(`StashSystem.java:158-200`)]

Two details matter to modders. The copy happens once, so editing the Lua table later changes only maps made afterwards. And `doStashItem` throws if the item is not a map item, but only for stashes of type "Map", which is the only type vanilla has. :cite[(`StashSystem.java:163-166`)] Removal from the possible list matches by exact building x and y, not by building. :cite[(`StashSystem.java:223-231`)]

Stamps with a texture are anchored at the middle of the image unless the table gave an anchor, and text goes through one of two calls depending on whether the text is a translation key or a plain string. :cite[(`StashSystem.java:172-191`)]

### Step 4: reading the map arms the building

`prepareBuildingStash` runs when the map is read: it ignores a name that was read before, otherwise adds the name to `alreadyReadMap` and the building to `buildingsToDo`, then fills at once if the building is already fully loaded. :cite[(`StashSystem.java:202-214`)]

The read action's `complete` method calls `item:doBuildingStash()`. That Java method sends the `ReadAnnotedMap` packet when it runs on a client and calls `prepareBuildingStash` directly everywhere else. :cite[(`ISReadMapItem.lua:36-40`, `InventoryItem.java:3684-3691`)] A Lua timed action's `complete` method is skipped on clients, so in real play the server (or the single player game) is the one that arms it. :cite[(`LuaTimedActionNew.java:176-181`)] Nothing in vanilla's own scripts calls `doBuildingStash` on a client, so the packet route is not reached by vanilla play. :cite[(`ISReadMapItem.lua:36-40`, `StashDebug.lua:94-103`, `ClientCommands.lua:774-791`)]

### Step 5: the building is filled

`doBuildingStash` runs when a to-do building is loaded, and it is called from two places: the chunk-load code, and `prepareBuildingStash` if the building is already streamed in. :cite[(`IsoChunk.java:4178-4182`, `StashSystem.java:208-211`)] The chunk code only does this when the building is fully streamed in and the code is not a multiplayer client. :cite[(`IsoChunk.java:4178-4179`)]

For each to-do entry whose coordinates are strictly inside the building's bounds, the first check is the visited flag. If the building was visited, the entry is dropped and nothing is placed. :cite[(`StashSystem.java:238-244`)] Otherwise the engine does these things, in this order :cite[(`StashSystem.java:245-299`)]:

1. Look up the loot table named by `spawnTable` and mark every room of the building explored.
2. Run the special properties: containers, traps and zombies (next section).
3. Walk every square in the building's rectangle plus a one-square border, on every floor from -32 to 30. For each container on a square that belongs to that building and sits in a named room, if the table has an entry for that container's type, refill it from the table. When the room's normal loot table has no entry for that type, the container is emptied first and marked explored.
4. For every door and window that allows barricades, board it up with the stash's `barricades` percent chance.
5. Remove the entry from the to-do list.

The table lookup is by container type, which is why a `GunBox` entry in the table fills a `GunBox` the stash placed, and a `counter` entry fills ordinary kitchen counters in the building. :cite[(`StashSystem.java:261-279`)]

### Step 6: any visit protects the building from stashes

`visitedBuilding` removes a building from `possibleStashes` (not from the to-do list) and runs only on single player or on a server. :cite[(`StashSystem.java:429-439`)] It is triggered in three ways :cite[(`BuildingDef.java:484-490`, `IsoPlayer.java:2185-2186`, `IsoRoom.java:301-306`, `IsoChunk.java:4180-4182`)]:

- A player inside a building sets the building's visited flag, which calls it. This is any player that is not invisible, so a server counts every connected player.
- When a player's view sees a room of a stash building.
- At chunk load, right after the fill step above: a building that has fully loaded gives up its stash even if nobody entered. The fill step runs first, so a to-do building is still filled.

## What the building does while it waits

A building that is still listed as a stash building gets no random story.

Every random building story and every dead survivor story checks `isStashBuilding` and refuses; the check looks at both `possibleStashes` and `buildingsToDo`. :cite[(`StashSystem.java:511-531`, `RandomizedBuildingBase.java:102-104`, `RandomizedDeadSurvivorBase.java:38-40`)]

The classes with their own copy of the check are RBBurnt, RBBurntCorpse, RBBurntFireman, RBLooted, RBOther, RBSafehouse, RBShopLooted, RBTrashed, and the dead survivor stories RDSBandPractice, RDSBanditRaid, RDSFootballNight, RDSGrouchos, RDSHenDo, RDSHouseParty, RDSPokerNight, RDSRPGNight, RDSRatInfested, RDSRatKing, RDSRatWar, RDSResourceGarage and RDSStagDo. :cite[(`RBBurnt.java:51`, `RBBurntCorpse.java:63`, `RBBurntFireman.java:79`, `RBLooted.java:99`, `RBOther.java:58`, `RBSafehouse.java:183`, `RBShopLooted.java:69`, `RBTrashed.java:59`, `RDSBanditRaid.java:165`, `RDSBandPractice.java:82`)] Marking the building explored in the fill step also keeps later stories out, because the base check refuses explored buildings. :cite[(`RandomizedBuildingBase.java:105-106`, `StashSystem.java:248`)]

The protection has a gap. A stash leaves `possibleStashes` when its map is created (step 3) and joins `buildingsToDo` only when the map is read (step 4). In between, `isStashBuilding` is false for that building, so a story can run there.

The same list also feeds a debug overlay of stash buildings. :cite[(`StashSystem.java:197`, `StashSystem.java:207`, `ZombiePopulationRenderer.java:322`)] We read this and have not watched it in a game.

## Containers, traps and zombies

`doSpecificBuildingProperties` places special containers first, then traps, then zombies, and it has several quirks a modder should know. :cite[(`StashSystem.java:307-416`)]

**Containers.** For each container entry, a room name other than "all" collects every room of that name into one shared list, and an entry with an exact x, y and z uses that square. Everything else uses a random free square from any room. After that, if the shared room list is not empty, the engine overrides the square with a random free square from it. :cite[(`StashSystem.java:311-330`)] The list is never cleared between entries, so once one entry names a room, every later entry in the same stash lands in one of those rooms too, even an "all" entry. :cite[(`StashSystem.java:309`, `StashSystem.java:327-330`)] If the room name matches nothing, no square is found and the log gets "No free room was found". :cite[(`StashSystem.java:360-362`)]

A container with a `containerItem` spawns that item, rolls its contents from the loot table (looked up by the item type, then by `containerType`) and drops it on the square. If the loot table is missing or the item does not exist, the method returns, which also skips every later container, the traps and the zombies. :cite[(`StashSystem.java:333-352`)] A container with only a sprite becomes a non-thumpable object holding an empty container of that type, which step 5 then fills. :cite[(`StashSystem.java:353-359`)]

**Traps.** `traps = "a-b"` places `b - a` traps, because the loop runs from the low end up to but not including the high end. `traps = "n"` sets both ends to n and places none. The kinds are chosen at random from five sensor traps (flame, smoke, two noise sensors, aerosol). :cite[(`StashSystem.java:65-69`, `StashSystem.java:366-378`, `Stash.java:68-78`)] Vanilla's only use is `traps = "1"` on one March Ridge stash, so that stash places no traps. :cite[(`media/lua/shared/StashDescriptions/MarchRidgeStashDesc.lua:36`)]

**Zombies.** When `zombies` is set (0 or more) and zombies are enabled, every room of the building gets its own count. Each floor square of the room is rolled at the stash's percent, and the Insane, Very High and High population settings add 4, 3 and 2, while Low removes 4. The count is capped at half the room's squares and then raised to at least 1. :cite[(`StashSystem.java:380-415`)]

## What is saved and where

Three lists are saved, in this order, as counts followed by entries, using the standard string writer. :cite[(`StashSystem.java:465-491`)]

| List | Meaning | Entry | Code |
|---|---|---|---|
| `possibleStashes` | stashes still waiting for a map | name, x, y | :cite[(`StashSystem.java:467-474`)] |
| `buildingsToDo` | read maps whose building is not filled yet | name, x, y | :cite[(`StashSystem.java:476-483`)] |
| `alreadyReadMap` | names of stashes already read | name | :cite[(`StashSystem.java:485-489`)] |

They go into the world's `map_meta.bin`. On a server the block is wrapped with a length prefix, and a multiplayer client skips it. On load the three lists replace what step 1 built. :cite[(`IsoMetaGrid.java:1108-1112`, `IsoMetaGrid.java:1125-1127`, `IsoMetaGrid.java:1264-1272`, `StashSystem.java:441-463`)]

Three consequences follow. A stash that a mod adds to an existing save is not in the saved possible list, so it never gets a map there, but `getStash` and the debug spawn still find it. A vanilla stash a mod removes still sits in the saved list, but the roll walks `allStashes`, so it can no longer be chosen. :cite[(`StashSystem.java:119-129`, `StashSystem.java:418-427`)] And maps already made keep their stamps and stash name on the item itself. :cite[(`InventoryItem.java:1785-1788`)]

The item field `stashMap` is saved with the item, with a flag bit, so it survives drops, trades and reloads. :cite[(`InventoryItem.java:1785-1788`, `InventoryItem.java:2123-2125`)] `reinit` throws the lists away, reloads from Lua and also empties `alreadyReadMap`. :cite[(`StashSystem.java:497-501`)]

## Which side runs each step

The server runs steps 1 to 6 on a dedicated server, single player runs them locally, and a client runs only step 1 and the drawing.

Every step with a rule about visits or rolls is guarded by "not a multiplayer client". :cite[(`StashSystem.java:96`, `StashSystem.java:430`, `IsoChunk.java:4179`, `IsoRoom.java:302`, `IsoPlayer.java:2185`)]

| Step | Single player | Dedicated server | Client | Code |
|---|---|---|---|---|
| 1 load Lua | yes | yes | yes | :cite[(`IsoWorld.java:2068`, `ServerMap.java:221`)] |
| 2 and 3 roll and name | yes | yes | no | :cite[(`StashSystem.java:96`)] |
| 4 read the map | yes, in the read action | yes, in the read action's `complete` method | sends the packet only if Lua calls `doBuildingStash` on it | :cite[(`LuaTimedActionNew.java:176-181`, `InventoryItem.java:3684-3691`)] |
| 5 fill | yes | yes | no | :cite[(`IsoChunk.java:4178-4179`)] |
| 6 visit | yes | yes | no | :cite[(`StashSystem.java:430`)] |
| save and load | yes | yes | skipped | :cite[(`IsoMetaGrid.java:1264-1272`)] |

When the server places a trap, it also sends it to clients. The special containers and refilled loot appear to clients through normal chunk data, but we did not check how a client already standing in range learns of a container the server adds (not verified). :cite[(`StashSystem.java:373-375`)]

## The ReadAnnotedMap packet

The packet carries one string, the stash name, and the server answers it by calling `prepareBuildingStash` with that name. :cite[(`ReadAnnotedMapPacket.java:28-44`)]

It is declared for any player who has logged in. :cite[(`ReadAnnotedMapPacket.java:20-26`)] The enum entry, the sender and the handler are the only Java that mentions it. :cite[(`PacketTypes.java:419`, `InventoryItem.java:3687`)]

> **Warning:** The packet handler arms whatever stash name it receives. Server owners should treat stash buildings as shared loot and keep their logs on.

## A bug-shaped detail: the day limit

The day limits use `getDaysSurvived`, which is the longest-surviving local player's hours divided by 24, then taken modulo 30. :cite[(`GameTime.java:237-249`)]

A limit of 30 or more can never stop a stash, and a minimum of 30 or more can never be met. Vanilla's one limit is `daysToSpawn = "0-30"`, which therefore never excludes anything. :cite[(`media/lua/shared/StashDescriptions/RosewoodStashDesc.lua:30`)] On a dedicated server the method reads the server's own local player slots; we did not check what they hold (not verified).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and Lua. Not verified: the client-side view of server-placed containers, the story-gap case in a running game, what `IsoPlayer.players` holds on a dedicated server, and whether the 9 vanilla stashes at placeholder coordinates really have no building (we did not read the map data). The one fact from bytecode, not source, is that the table reader returns -1 for a missing integer.
:::
