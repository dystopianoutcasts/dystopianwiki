---
id: build-42-randomized-stories
slug: randomized-stories
title: 'Stories and randomized content: how the world gets its scenes'
game: pz
version: build-42
section: modding
category: engine
difficulty: intermediate
tags:
  - engine
  - world
  - stories
  - sandbox
  - multiplayer
excerpt: >-
  The burnt house, the police roadblock, the campsite in the woods and the dead
  survivor in the bathroom are all placed by one Java system the first time a
  chunk loads. How the five kinds of story are rolled, what the sandbox options
  really do to the odds, what Lua can tune, and the traps we found in the code.
last_updated: '2026-10-04'
related_articles:
  - erosion
  - procedural-world-generation
  - modding-ranch-zones
  - lua-classes-world-3
---
# Stories and randomized content: how the world gets its scenes

Outcast, every scene you stumble on in Knox County that looks like somebody else's last bad day was put there by the code: the barricaded safehouse, the crashed ambulance, the hunters' camp, the corpse in the bathtub with the note. None of it is in the map files. This page walks through the system that places those scenes, read from the Build 42.21 code, so you know what you can tune from a mod and where it will fight you.

## What it does for the player

The first time a part of the world loads, the game rolls dice for it. A house may become a burnt ruin, a looted shop, a survivor's last stand or just a lived-in home with breakfast on the table. A stretch of road may get a car crash, a roadblock or a herd of cows. A forest clearing may get a camp. A paper map you loot may turn out to mark a stash. The roll happens once per place; after that, what you find is whatever was rolled.

## Where it lives

Everything is in `zombie.randomizedWorld`, plus the stash system in `zombie.core.stash`: 154 files, about 21,000 lines together. There are five families of story, each a Java class per scene:

| Family | Base class | How many are rolled | Where they go |
|---|---|---:|---|
| Building stories | `RandomizedBuildingBase` (`RB...` classes) | 31 | A whole building |
| Dead survivor stories | `RandomizedDeadSurvivorBase` (`RDS...`) | 31 | Inside a house picked for the basic pass |
| Table stories | `RBTableStoryBase` (`RBTS...`) | 9 | One table inside a house |
| Vehicle (road) stories | `RandomizedVehicleStoryBase` (`RVS...`) | 23 | A road zone in one chunk |
| Zone stories | `RandomizedZoneStoryBase` (`RZS...`) | 41 | A `ZoneStory` map zone (forest, beach, lake and a few named spots) |

Ranch animals (`randomizedRanch`) and treasure-map stashes (`core.stash.StashSystem`) ride on the same chunk-load moment.

The lists are built once per world in `IsoWorld#init`, by `new` on each class, before any chunk loads. The common helpers that every story uses (spawn zombies on a square, create a corpse, drop an item, add a tent, a campfire, graffiti, blood) live in `RandomizedWorldBase`, about 2,400 lines.

The call chain for a building, from the chunk loader down:

`IsoChunk#doLoadGridsquare` -> `IsoChunk#randomizeBuildingsEtc` -> `StashSystem.doBuildingStash` and `RandomizedBuildingBase.ChunkLoaded` -> the chosen story's `randomizeBuilding(BuildingDef)`.

For roads and zones:

`IsoChunk#doLoadGridsquare` -> `IsoChunk#AddVehicles` -> `IsoChunk#addRandomCarCrash` -> `RandomizedVehicleStoryBase.doRandomStory`, and `IsoChunk#AddZombieZoneStory` -> `RandomizedZoneStoryBase.isValidForStory` -> the story's `randomizeZoneStory(Zone)`.

> **Proof:** Code. `zombie.iso.IsoWorld#init` (the three story lists), `zombie.randomizedWorld.randomizedBuilding.RBBasic` (31 entries in `deadSurvivorsStory`), `zombie.iso.IsoChunk#doLoadGridsquare`, `#randomizeBuildingsEtc`, `#AddVehicles`, `#addRandomCarCrash`, `#AddZombieZoneStory`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs and on which side

### Buildings

`RandomizedBuildingBase.ChunkLoaded` runs for every building that touches a chunk being loaded. It does nothing on a multiplayer client, and on a dedicated server it does nothing while no player is connected. A building is considered once: it must not be marked `seen`, every chunk it overlaps must be loaded, no room in it may be explored, and at least one of its chunks must be brand new (never saved). The method marks the building `seen` before it rolls, and that flag is saved with the map.

Then, in this order:

1. Buildings with more than 500 rooms get nothing at all.
2. Every story flagged "always do" that is valid for the building runs. These are the decoration passes for businesses: bars, cafes, clinics, offices, schools, salons, dorms and the like, plus the trashed-building and looted-shop passes, which roll their own chance inside their validity check.
3. One fixed building has a 31% chance of its own named story, and stops here if it gets it.
4. Spawn buildings stop here.
5. The sandbox roll picks either one special story or the basic pass, `RBBasic`.

```java
int chance = 10;
switch (SandboxOptions.instance.survivorHouseChance.getValue()) {
   case 1:
      return;
   case 2:
      chance -= 5;
   ...
}
if (SandboxOptions.instance.survivorHouseChance.getValue() == 7 || Rand.Next(100) <= chance) {
   ...
   rb = getRandomStory();
```

The basic pass is the lived-in house: food on stoves, clutter in rooms, a one-in-ten chance of a table story on each table it checks (one per house), and a 25% chance of a dead survivor story. The basic pass and every special story then still have to pass the story's own `isValid`. For the basic pass, that check asks for a bedroom, a bathroom, and a kitchen or living room.

> **Proof:** Code. `zombie.randomizedWorld.randomizedBuilding.RandomizedBuildingBase#ChunkLoaded` (`maximumRoomCount = 500`, the `RBKateAndBaldspot` building at 10744, 9409 with `Rand.Next(100) < 31`) and `#isValid`; `zombie.iso.BuildingDef#isFullyStreamedIn` and `#isAnyChunkNewlyLoaded`; `RBBasic#randomizeBuilding` (`Rand.Next(100) < 25` before `addRandomDeadSurvivorStory`) and `#checkForTableSpawn` (`Rand.NextBool(10)`); `zombie.core.random.RandInterface#NextBool`; `zombie.iso.IsoMetaGrid` (saves `BuildingDef.seen`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Roads

Road stories are rolled inside `AddVehicles`, so they need the same things vehicles need: not a client, vehicles enabled, car spawn rate not "None", and a chunk the vehicle database has not seen before. The chunk must have no vehicles and no water. For each road (`Nav`) zone in the chunk, the roll is `Rand.Next(0, chance) <= 25`. The story is then picked by weight among the ones valid for that zone, and spawned a little later in the chunk's life.

### Zones

Zone stories are rolled from `doLoadGridsquare` when not on a client. Only map zones of type `ZoneStory` qualify, and only if the zone has never been seen. The roll is `Rand.Next(100) < chance`. A story flagged "always do" that fits the zone wins without a roll. The roll only picks a story and a spot. The story is spawned later, on a chunk load where every chunk around the spot is loaded.

### Ranches and stashes

Ranch zones (`Ranch`) are filled by `RandomizedRanchBase.checkRanchStory` at the same moment as zone stories. A `chance` in a ranch definition is the weight used to pick between definitions of the same animal type. Stash maps are decided when a map item spawns as loot (`StashSystem.checkStashItem`), only for stashes whose building nobody has entered yet. The stash definitions are a Lua table, which matters below.

> **Proof:** Code. `zombie.iso.IsoChunk#AddVehicles` (guards on `carSpawnRate`, `GameClient.client`, `enableVehicles`), `#doLoadGridsquare` (`VehiclesDB2.isChunkSeen`, `!GameClient.client` around the zone and ranch calls); `zombie.randomizedWorld.randomizedVehicleStory.RandomizedVehicleStoryBase#doRandomStory`; `zombie.randomizedWorld.randomizedZoneStory.RandomizedZoneStoryBase#isValidForStory`, `#doRandomStory`, `#checkCanSpawnStory`; `zombie.randomizedWorld.randomizedRanch.RandomizedRanchBase#checkRanchStory`, `#doRandomRanch`, `#getRandomDef`; `zombie.core.stash.StashSystem#checkStashItem`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Which side

Every roll above is guarded by `!GameClient.client`. In single player your game rolls; in multiplayer the server rolls, and clients see the results as ordinary objects, zombies and items in the chunks the server sends them.

> **Proof:** Code. `RandomizedBuildingBase#ChunkLoaded` and `#isValid` (`GameClient.client` returns early), `IsoChunk#doLoadGridsquare` and `#AddVehicles` (`!GameClient.client`), `StashSystem#checkStashItem` (`!GameClient.client`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What the sandbox options really do to the odds

All four story options share the labels Never, Extremely Rare, Rare, Sometimes, Often, Very Often and Always Tries (the animal option says Always). Here is what each label becomes in the code, at the moment of the roll:

| Label | Building stories | Road stories (per road zone) | Zone stories | Ranch animals |
|---|---|---|---|---|
| Never | no roll at all | none | none | none |
| Extremely Rare | 6% | 1.3% | 2% | 7% |
| Rare | 11% (default) | 2.6% (default) | 6% (default) | 6% |
| Sometimes | 16% | 4.3% | 12% | 20% |
| Often | 21% | 7.4% | 20% | 55% |
| Very Often | 31% | 26% | 40% | 85% |
| Always Tries / Always | always | always | always | always (default) |

The building numbers are one higher than the code's constants because the test is `<=` on a roll from 0 to 99. On the ranch option, Extremely Rare (7) really is higher than Rare (6).

> **Proof:** Code. `RandomizedBuildingBase#ChunkLoaded` (10, minus 5, plus 5, 10 or 20; `Rand.Next(100) <= chance`); `RandomizedVehicleStoryBase#doRandomStory` (2000, 1000, 600, 350, 100, 0; `Rand.Next(0, chance) <= baseChance` with `baseChance = 25`); `RandomizedZoneStoryBase#doRandomStory` (2, 6, 12, 20, 40, 100); `RandomizedRanchBase#doRandomRanch` (7, 6, 20, 55, 85, 120); `zombie.core.random.RandAbstract#Next(int, int, Random)` (returns `min` when both bounds are equal); `zombie.SandboxOptions` (`SurvivorHouseChance`, `VehicleStoryChance`, `ZoneStoryChance` default 3, `AnimalRanchChance` default 7). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Two consequences an Outcast would not guess from the labels:

- **"Always Tries" removes the lived-in houses.** At value 7 every eligible building gets a special story picked by weight, so the basic pass never runs, and with it go the table stories and all 31 dead survivor stories, which only the basic pass can start. A special story that does not fit the building leaves it with nothing.
- **"Never" still decorates businesses.** The "always do" passes run before the sandbox switch, so bars, cafes, clinics and the rest keep their scenes at Never.

> **Proof:** Code. `RandomizedBuildingBase#ChunkLoaded` (forced stories before the switch; at value 7 `rb = getRandomStory()` replaces the basic pass); `RBBasic#addRandomDeadSurvivorStory` is private and called only from `RBBasic#randomizeBuilding`; `RBBasic#doRandomDeadSurvivorStory` is used only by the debug menu. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. We read this; we have not watched it in a game. The test that settles it: two new single-player worlds on the same seed, one at Rare and one at Always Tries, visit the same twenty houses in each and count table scenes and dead-survivor scenes. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

The story classes are exposed, and so is the world that holds the lists. From Lua you can read and change the live lists:

- `getWorld():getRandomizedBuildingList()`, `getWorld():getRandomizedVehicleStoryList()`, `getWorld():getRandomizedZoneList()`: the Java lists themselves, not copies.
- `getWorld():getRBBasic():getSurvivorStories()`: the 31 dead survivor stories.
- `setChance(int)` on building, dead survivor and vehicle stories. Zone stories keep their weight in a public field with no setter, and Lua sees methods, not fields, so a zone story's weight cannot be changed from Lua.
- Every helper on `RandomizedWorldBase`: methods such as `addZombiesOnSquare`, `addItemOnGround`, `addTileObject` and `addCampfire` on any story object, and static functions such as `RandomizedWorldBase.createRandomDeadBody(...)`.
- Forcing a story where you want it, the way the vanilla debug menu does: `RBBurnt.new():randomizeBuilding(square:getBuilding():getDef())`, or `getWorld():getRBBasic():doRandomDeadSurvivorStory(def, story)`. Run it where stories run, on the server or in single player (see the last trap below).

Events: there is no event for the roll itself. `OnInitWorld` fires after the lists are built and before chunks load, which makes it the moment to tune them. See the class pages for [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase), [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase), [RandomizedVehicleStoryBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedvehiclestorybase), [RandomizedZoneStoryBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedzonestorybase), [IsoWorld](/pz/build-42/modding/reference/lua-classes-world-2#isoworld) and the event [OnInitWorld](/pz/build-42/modding/reference/lua-events#oninitworld).

Stashes are the one part that is plain data. `StashSystem.init` reads the global Lua table `StashDescriptions` when the world starts, on single player and on the server. Vanilla fills it from `media/lua/shared/StashDescriptions/*.lua` with `StashUtil.newStash(name, type, item, customName)` and then `addStamp` or `addContainer` on the result. A mod can add its own stash the same way, in a shared Lua file.

> **Proof:** Code. `zombie.Lua.LuaManager` (story classes exposed); `media/lua/client/DebugUIs/DebugContextMenu.lua` (`getWorld():getRandomizedVehicleStoryList()`, `RBBasic:doRandomDeadSurvivorStory`, `randomizeVehicleStory`); `RandomizedBuildingBase#setChance`, `RandomizedVehicleStoryBase#setChance`, `RandomizedZoneStoryBase` (public `chance` field, no setter); `IsoWorld#init` (lists filled before `triggerEvent("OnInitWorld")`); `zombie.core.stash.StashSystem#init` and `#initAllStashes` (reads `StashDescriptions`), called from `IsoWorld#init` under `!GameClient.client`; `media/lua/shared/StashDescriptions/StashUtil.lua`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What a mod can and cannot change

**Can:** change weights, remove stories from the lists, force a story on a building, road or zone, write your own scene with the `RandomizedWorldBase` helpers from a server-side event, and add stash maps. Sandbox options cover the overall odds.

**Cannot, from Lua:** add a new kind of story to the roll. A story is a Java subclass, the lists are filled by `new` in `IsoWorld#init`, and the roll only ever picks from those lists. A Lua "story" has to be its own system that reacts to chunk loads (for example `LoadGridsquare`) and keeps its own record of what it has already done.

Traps we found in the code:

- **Building weights are captured once per game process.** The first building roll copies every story's weight into a static map, and that map is never rebuilt, not even when you load a second save in the same session. Set building weights in `OnInitWorld`, before the first chunk loads; anything later is ignored until the game restarts. Vehicle story and dead survivor weights are re-read on every roll, so those you can change at any time.
- **The house you stand in when it first loads gets no lived-in pass.** The building is marked `seen` before the roll, and then the base validity check refuses it while a player is inside (in single player, the local player; on a server, any player). The basic pass and every story that calls the base check are refused; the business decorations, which have their own check, still run. On the next load the building is already `seen`.
- **A zone story can be lost on quit.** The pick (story and spot) is kept in memory on the zone. The zone's "already rolled" counter is saved, the pick is not. Save and quit between the pick and the spawn and the zone stays empty. We have not reproduced this; it is the save code read end to end.
- **Two building stories are never rolled.** `RBJudge` and `RBReverend` exist, are exposed and appear in the reference, but `IsoWorld#init` never adds them to the list. They only run if a mod creates and calls them.
- **Run story code on the server.** The base validity check returns false on a multiplayer client, and vanilla's debug menu never runs a story on a client: it sends a packet and the server runs it. A story you call directly from a client skips that check, and what it would place on a client is untested ground. Put story code in a server or shared file and run it on the server.

> **Proof:** Code. `RandomizedBuildingBase#initAllRBMapChance` (static `totalChance` and `rbMap`, filled only when `totalChance == 0`, never cleared) and `#getRandomStory`; `zombie.gameStates.GameLoadingState` (`IsoWorld.instance = new IsoWorld()` on each load); `RandomizedVehicleStoryBase#initAllRVSMapChance` and `RBBasic#initRDSMap` (cleared on every roll); `RandomizedBuildingBase#ChunkLoaded` (`building.def.seen = true` before `isValid`) and `#isValid` (client and player-inside checks); `RBBar#isValid` (an override with no player or client check); `zombie.iso.zones.Zone#saveData` (writes `hourLastSeen`, not `pickedRzStory`); `IsoWorld#init` (no `RBJudge` or `RBReverend`); `zombie.network.packets.world.DebugStoryPacket`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. Whether story weights set from Lua on a dedicated server take effect is read from the code only. The test that settles it: on a test server, set every building story's weight to 0 except `RBBurnt` in a server-side `OnInitWorld` handler, set Randomized Building Chance to Always Tries, walk into a town nobody has visited, and check that houses come out burnt; the server log is the evidence. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Erosion: how the world grows back](/pz/build-42/modding/engine/erosion), the other system that changes a chunk when it loads.
- [Procedural world generation](/pz/build-42/modding/engine/procedural-world-generation), which also runs on brand-new chunks.
- [Modding ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones), for the ranch definitions this page only touches.
- [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).
