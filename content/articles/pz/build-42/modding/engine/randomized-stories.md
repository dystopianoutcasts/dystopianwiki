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
  The burnt house, the roadblock, the campsite and the dead survivor are placed by one system when a chunk first loads. How the odds work in 42.22, what Lua can tune, and the traps.
last_updated: '2026-11-21'
related_articles:
  - erosion
  - procedural-world-generation
  - modding-ranch-zones
  - lua-classes-world-3
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [server owners](#4-what-the-sandbox-options-really-do-to-the-odds) | [modders](#6-what-lua-can-reach)

:::callout[The 1-minute version]{kind=key}
- Outcast, scenes like the burnt house, the roadblock and the hunters' camp are rolled by the game the first time the place loads, and never again. None of them is in the map files.
- In multiplayer the server rolls. A client does not roll buildings, roads, zones or ranches.
- The four story sliders are Randomized Building Chance, Randomized Road Stories Chance, Randomized Zone Stories Chance and Animal Spawn Chance (ranches). Their Java defaults are Rare for the first three and Always for ranches, but players start from the Apocalypse preset, which sets Rare for the first three and Often for ranches.
- Setting Randomized Building Chance to Always Tries removes the lived-in houses, because the basic house pass never runs. Setting it to Never still decorates businesses.
- Many stories only fit a certain world age. The age counts the Months since the Apocalypse head start, so a late-start world can skip the early ones.
- Ranch animals can spawn dead: a female from world day 189 on, a male from day 249 on, as the code reads. Not tested in a running game.
- A mod cannot add a new story kind from Lua. It can change weights, remove stories from the lists and force a story on a spot.
:::

:::facts
- **Building stories rolled** 31 (33 classes exist; `RBJudge` and `RBReverend` are never added)
- **Dead survivor stories** 31 (32 classes exist; `RDSRatWar` is never added)
- **Vehicle (road) stories** 23, **zone stories** 41, **table stories** 9
- **Building chance by label** Extremely Rare 6%, Rare 11% (Java default), Sometimes 16%, Often 21%, Very Often 31%
- **Dead survivor pass** 25% per basic house, from the Apocalypse preset's Rare building chance; **table story** 1 in 10 per table checked
- **Code size** 154 files and 21,214 lines in `randomizedWorld` and `core/stash`
:::

## 1. What it does for the player

The first time a part of the world loads, the game rolls dice for it, and what you find afterwards is whatever was rolled.

A house may become a burnt ruin, a looted shop, a survivor's last stand or just a lived-in home with breakfast on the table. A stretch of road may get a car crash, a roadblock or a herd of cows. A forest clearing may get a camp. A paper map you loot may turn out to mark a stash.

## 2. Where it lives

The system is the package `zombie.randomizedWorld` plus the stash system in `zombie.core.stash`, which together are 154 files and about 21,000 lines. :cite[(`zombie/randomizedWorld/`, `zombie/core/stash/`)] There are five families of story, one Java class per scene.

| Family | Base class | Rolled | Where they go | Code |
|---|---|---:|---|---|
| Building stories | `RandomizedBuildingBase` (`RB...`) | 31 | A whole building | `zombie/iso/IsoWorld.java:1722-1752`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:66` |
| Dead survivor stories | `RandomizedDeadSurvivorBase` (`RDS...`) | 31 | Inside a house picked for the basic pass | `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1080-1110` |
| Table stories | `RBTableStoryBase` (`RBTS...`) | 9 | One table inside a house | `zombie/randomizedWorld/randomizedBuilding/TableStories/RBTableStoryBase.java:31-39` |
| Vehicle (road) stories | `RandomizedVehicleStoryBase` (`RVS...`) | 23 | A road zone in one chunk | `zombie/iso/IsoWorld.java:1753-1775` |
| Zone stories | `RandomizedZoneStoryBase` (`RZS...`) | 41 | A `ZoneStory` map zone | `zombie/iso/IsoWorld.java:1776-1816` |

The lists are built by `new` on each class in `IsoWorld#init`, before any chunk loads, and they are built on every side (client, server, single player) except in the tutorial. :cite[(`zombie/iso/IsoWorld.java:1720-1817`)] Two building stories, `RBJudge` and `RBReverend`, exist and are exposed to Lua but are not in the building list. :cite[(`zombie/Lua/LuaManager.java:2556`, `zombie/Lua/LuaManager.java:2560`)] One dead survivor story, `RDSRatWar`, is exposed but is not in the basic pass's list either. :cite[(`zombie/Lua/LuaManager.java:2592`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1080-1110`)]

The common helpers every story uses (spawn zombies on a square, create a corpse, drop an item, add a tent, blood) live in `RandomizedWorldBase`, which is 2,380 lines. :cite[(`zombie/randomizedWorld/RandomizedWorldBase.java:491-541`)]

Ranch animals (`randomizedRanch`) and treasure-map stashes (`core.stash.StashSystem`) ride on the same chunk-load moment.

:::flow[A building, from the chunk loader down]
- Chunk loads (`doLoadGridsquare`)
- `randomizeBuildingsEtc`
- `StashSystem.doBuildingStash` and `RandomizedBuildingBase.ChunkLoaded`
- The chosen story's `randomizeBuilding(BuildingDef)`
:::

The chain for a building runs from the chunk load to the building pass, and the same load also starts the road, zone and ranch passes. :cite[(`zombie/iso/IsoChunk.java:3915`, `zombie/iso/IsoChunk.java:4161-4185`)] Roads go through `AddVehicles` and `addRandomCarCrash` to `RandomizedVehicleStoryBase.doRandomStory`, and zones go through `AddZombieZoneStory` to `isValidForStory` and the story's `randomizeZoneStory(Zone)`. :cite[(`zombie/iso/IsoChunk.java:1823`, `zombie/iso/IsoChunk.java:1930-1936`, `zombie/iso/IsoChunk.java:4221-4229`)]

## 3. When it runs and on which side

Every roll is guarded so that a multiplayer client never rolls: in single player your game rolls, and in multiplayer the server rolls and clients see the results as ordinary objects, zombies and items.

### Buildings

A building is considered once, and only if it passes five gates. The code runs for every building that touches a chunk being loaded and does nothing on a multiplayer client; on a dedicated server it does nothing while no player is connected. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:181-186`)] The building must not be marked `seen`, every chunk it overlaps must be loaded, no room in it may be explored, and at least one of its chunks must be brand new. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:181`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:188-197`, `zombie/iso/BuildingDef.java:430-457`)] The method marks the building `seen` before it rolls, and that flag is saved with the map. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:194`, `zombie/iso/IsoMetaGrid.java:1074`, `zombie/iso/IsoMetaGrid.java:1208-1221`)]

Then, in this order:

1. Buildings with more than 500 rooms get nothing at all, so none of the passes below run. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:73`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:183`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:200`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:211-216`)]
2. Every story flagged "really always" that is valid for the building runs at once. In the list these are `RBJackieJaye`, `RBJoanHartford`, `RBMayorWestPoint`, `RBNolans`, `RBTwiggy` and `RBWoodcraft`. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:203-204`, `zombie/randomizedWorld/randomizedBuilding/RBNolans.java:59`)]
3. Every story flagged "always do" that is valid is set aside. These are the decoration passes for businesses (bars, cafes, clinics, offices, schools, salons, dorms and the like) plus the trashed-building and looted-shop passes, which roll their own chance inside their validity check. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:205-207`, `zombie/randomizedWorld/randomizedBuilding/RBBar.java:114-120`)]
4. One fixed building (at 10744, 9409) has a 31% chance of its own named story, and stops here if it gets it. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:218-222`)]
5. The set-aside "always do" stories run. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:224-231`)]
6. Spawn buildings stop here, and so does the tutorial. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:233-240`)]
7. The sandbox roll picks either one special story or the basic pass, `RBBasic`. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:237`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:243-275`)]

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

The basic pass is the lived-in house: food on stoves, clutter in rooms, a one-in-ten chance of a table story on each table it checks (one per house), and a 25% chance of a dead survivor story. :cite[(`zombie/randomizedWorld/randomizedBuilding/RBBasic.java:222-226`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:288-293`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1004-1012`)]

The basic pass and every special story from the sandbox roll then still have to pass the story's own `isValid` and a world-age check. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:273`)] For the basic pass, the validity check asks for a bedroom, a bathroom, and a kitchen or living room. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:125-156`)]

### Roads

Road stories are rolled inside `AddVehicles`, so they need the same things vehicles need. The chunk must not be seen by the vehicle database, the code must not be a client, vehicles must be enabled, and the car spawn rate must not be "None". :cite[(`zombie/iso/IsoChunk.java:1736-1745`, `zombie/iso/IsoChunk.java:3718-3722`)] The chunk must have no vehicles and no water, and for each road (`Nav`) zone in the chunk the roll is `Rand.Next(0, chance) <= 25`. :cite[(`zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:41`, `zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:68-97`, `zombie/iso/IsoChunk.java:1930-1936`)] The story is then picked by weight among the ones valid for that zone, and its spawn is kept for later in the chunk's life. :cite[(`zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:55-66`, `zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:98-109`, `zombie/iso/IsoChunk.java:5333`)]

### Zones

Zone stories are rolled when the chunk loads, and not on a client. :cite[(`zombie/iso/IsoChunk.java:3726-3728`)] Only map zones of type `ZoneStory` qualify, and only if the zone has never been seen. :cite[(`zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:46-52`)] The roll is `Rand.Next(100) < chance`, and a story flagged "always do" that fits the zone wins without a roll, except at Never, which returns first. :cite[(`zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:99-103`, `zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:122-142`)]

The roll only picks a story and a spot. The story is spawned later, on a chunk load where every chunk around the spot is loaded. :cite[(`zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:39-44`, `zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:245-265`)]

### Ranches and stashes

Ranch zones (`Ranch`) are filled at the same moment as zone stories, and the ranch has its own dice and its own dead-animal rule. :cite[(`zombie/iso/IsoChunk.java:3726-3729`, `zombie/iso/IsoChunk.java:4231-4238`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:38-61`)] A `chance` in a ranch definition is the weight used to pick between definitions of the same animal type. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:98-127`)]

After world day 60, each female may spawn dead with a chance of 1 in (190 minus the world age in days), and each male with 1 in (250 minus it); when that number reaches 0 or 1 the animal always spawns dead, so females from day 189 and males from day 249. :cite[(`zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:218-226`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:255-260`, `zombie/core/random/RandInterface.java:28-30`)] The world age used here includes the Months since the Apocalypse head start, 30 days for each month after month one. :cite[(`zombie/GameTime.java:897-899`)] This matches the [Modding ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones) page, which has the full ranch table.

Stash maps are decided when a map item spawns as loot, only for stashes whose building nobody has entered yet. :cite[(`zombie/core/stash/StashSystem.java:95-96`, `zombie/core/stash/StashSystem.java:233`)] The stash definitions are a Lua table, which matters in section 6.

## 4. What the sandbox options really do to the odds

The story sliders (building, road, zone and ranch) share the labels Never, Extremely Rare, Rare, Sometimes, Often, Very Often and Always Tries (the animal slider says Always), and each label becomes a different number in the code.

Here is what each label becomes at the moment of the roll. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:243-262`, `zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:74-97`, `zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:99-120`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:65-91`)]

| Label | Building stories | Road stories (per road zone) | Zone stories | Ranch animals |
|---|---|---|---|---|
| Never | no roll at all | none | none | none |
| Extremely Rare | 6% | 1.3% | 2% | 7% |
| Rare | 11% | 2.6% | 6% | 6% |
| Sometimes | 16% | 4.3% | 12% | 20% |
| Often | 21% | 7.4% | 20% | 55% |
| Very Often | 31% | 26% | 40% | 85% |
| Always Tries / Always | always | always | always | always |

The building numbers are one higher than the code's constants because the test is `<=` on a roll from 0 to 99. On the ranch option, Extremely Rare (7) really is higher than Rare (6). :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:262`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:70`, `zombie/randomizedWorld/randomizedRanch/RandomizedRanchBase.java:91`)] The road numbers follow from `Rand.Next(0, chance) <= 25` with the chance at 2000, 1000, 600, 350 and 100 (and 0, which always passes). :cite[(`zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:96-97`, `zombie/core/random/RandAbstract.java:22-24`)]

What a player actually gets is two facts. The Java defaults are Rare for the building, road and zone sliders and Always for ranches, and the live sandbox pages treat the Apocalypse preset as the one players get, which is Rare, Rare, Rare and Often. :cite[(`zombie/SandboxOptions.java:176-178`, `zombie/SandboxOptions.java:213`, `media/lua/shared/Sandbox/Apocalypse.lua:102-104`, `media/lua/shared/Sandbox/Apocalypse.lua:136`)] The presets then change some of them:

- Randomized Building Chance: Apocalypse, Rising and Six Months Later set Rare; Extinction sets Extremely Rare; Outbreak sets Sometimes. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:102`, `media/lua/shared/Sandbox/Extinction.lua:102`, `media/lua/shared/Sandbox/Outbreak.lua:102`, `media/lua/shared/Sandbox/Rising.lua:102`, `media/lua/shared/Sandbox/SixMonthsLater.lua:57`)]
- Road and zone stories: every preset sets Rare. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:103-104`, `media/lua/shared/Sandbox/SixMonthsLater.lua:58-59`)]
- Ranch animals: Apocalypse sets Often, Extinction sets Sometimes, Outbreak and Rising set Very Often; Six Months Later sets none, so it keeps the Java default. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:136`, `media/lua/shared/Sandbox/Extinction.lua:136`, `media/lua/shared/Sandbox/Outbreak.lua:136`, `media/lua/shared/Sandbox/Rising.lua:136`)]

Two consequences an Outcast would not guess from the labels:

- **"Always Tries" removes the lived-in houses.** At value 7 every eligible building gets a special story picked by weight, so the basic pass never runs, and with it go the table stories and all 31 dead survivor stories, which only the basic pass can start. A special story that does not fit the building leaves it with nothing. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:262-275`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:288-293`)]
- **"Never" still decorates businesses, but removes the lived-in houses too.** The "really always" and "always do" passes run before the sandbox switch, so bars, cafes, clinics and the rest keep their scenes at Never, while the switch returns before the basic pass, so no lived-in house pass, table story or dead survivor story runs. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:203-231`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:245-247`)]

`RBBasic#addRandomDeadSurvivorStory` is private and called only from the basic pass, and `RBBasic#doRandomDeadSurvivorStory` is used by the debug menu. :cite[(`zombie/randomizedWorld/randomizedBuilding/RBBasic.java:288-293`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1038`, `media/lua/client/DebugUIs/DebugContextMenu.lua:1356-1363`)] We read this; we have not watched it in a game.

## 5. Stories that need a certain world age

Some stories only fit early or late in a save, and the check uses the world age in days, which includes the Months since the Apocalypse head start.

A story with a minimum or maximum day count is left out of the pick while the world age is outside that window. :cite[(`zombie/randomizedWorld/RandomizedWorldBase.java:1173-1179`, `zombie/GameTime.java:897-899`)] The check runs for the sandbox roll's building story, for the dead survivor pick, for the road pick and for the zone pick. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:273`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1064-1066`, `zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:61`, `zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:64`)]

- **Dead survivor stories:** six have a minimum (`RDSBanditRaid` 30, `RDSDevouredByRats` 30, `RDSBleach` 60, `RDSSuicidePact` 60, `RDSCorpsePsycho` 120, `RDSSkeletonPsycho` 120) and eleven have a maximum (30 for `RDSGrouchos` and `RDSRPGNight`; 60 for `RDSBandPractice`, `RDSFootballNight`, `RDSHenDo`, `RDSPokerNight`, `RDSStagDo`, `RDSStudentNight` and `RDSZombiesEating`; 90 for `RDSPrisonEscape` and `RDSPrisonEscapeWithPolice`). :cite[(`zombie/randomizedWorld/randomizedDeadSurvivor/RDSBanditRaid.java:36`, `zombie/randomizedWorld/randomizedDeadSurvivor/RDSCorpsePsycho.java:26`, `zombie/randomizedWorld/randomizedDeadSurvivor/RDSPrisonEscape.java:20`, `zombie/randomizedWorld/randomizedDeadSurvivor/RDSGrouchos.java:26`)]
- **Road stories:** a minimum of 30 for `RVSAnimalOnRoad`, `RVSBanditRoad`, `RVSHerdOnRoad` and `RVSRoadKill`, a minimum of 60 for `RVSCrashHorde`, and a maximum of 30 for the two police blockades. :cite[(`zombie/randomizedWorld/randomizedVehicleStory/RVSCrashHorde.java:29`, `zombie/randomizedWorld/randomizedVehicleStory/RVSPoliceBlockade.java:27`, `zombie/randomizedWorld/randomizedVehicleStory/RVSPoliceBlockadeShooting.java:30`)]
- **Zone stories:** a minimum of 30 for `RZSAttachedAnimal`, `RZSEscapedAnimal`, `RZSEscapedHerd` and `RZSForestCampEaten`, and 20 for `RZSBuryingCamp`. :cite[(`zombie/randomizedWorld/randomizedZoneStory/RZSAttachedAnimal.java:29`, `zombie/randomizedWorld/randomizedZoneStory/RZSBuryingCamp.java:24`)]

The dead survivor pick also skips a "unique" story that already spawned in this world (eleven classes are marked unique, ten of them in the rolled list and the unrolled `RDSRatWar` the eleventh; examples are `RDSRatKing` and `RDSGrouchos`), and skips the rat stories (`RDSDevouredByRats`, `RDSRatInfested`, `RDSRatKing`) when the maximum rat index option is 0 or less. :cite[(`zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1057-1072`, `zombie/randomizedWorld/randomizedDeadSurvivor/RDSRatKing.java:29-30`, `zombie/randomizedWorld/randomizedDeadSurvivor/RDSRatInfested.java:39`)]

## 6. What Lua can reach

Lua can read and change the live story lists and call any story's helpers, but it cannot add a story kind.

The story classes are exposed, and so is the world that holds the lists. :cite[(`zombie/iso/IsoWorld.java:3241-3278`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1132-1134`)] From Lua you can:

- Read and change the live lists with `getWorld():getRandomizedBuildingList()`, `getWorld():getRandomizedVehicleStoryList()` and `getWorld():getRandomizedZoneList()`. These return the Java lists themselves, not copies.
- Reach the dead survivor stories with `getWorld():getRBBasic():getSurvivorStories()`.
- Call `setChance(int)` on building, dead survivor and vehicle stories. Zone stories keep their weight in a public field with no setter, and Lua sees methods, not fields, so a zone story's weight cannot be changed from Lua. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:299-301`, `zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:585-587`, `zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:32`)]
- Use every helper on `RandomizedWorldBase`: methods such as `addZombiesOnSquare`, `addItemOnGround`, `addTileObject`, `addBloodSplat` and `addTentNorthSouth` on any story object, and static functions such as `RandomizedWorldBase.createRandomDeadBody(...)`. :cite[(`zombie/randomizedWorld/RandomizedWorldBase.java:502`, `zombie/randomizedWorld/RandomizedWorldBase.java:1037`, `zombie/randomizedWorld/RandomizedWorldBase.java:1218`, `zombie/randomizedWorld/RandomizedWorldBase.java:741`, `zombie/randomizedWorld/RandomizedWorldBase.java:1325`, `zombie/randomizedWorld/RandomizedWorldBase.java:491`)]
- Force a story the way the vanilla debug menu does: take a story object from a list and call `randomizeBuilding` on a building definition, or call `getWorld():getRBBasic():doRandomDeadSurvivorStory(def, story)`. :cite[(`media/lua/client/DebugUIs/DebugContextMenu.lua:1342-1365`, `media/lua/client/DebugUIs/DebugContextMenu.lua:1231-1232`, `media/lua/client/DebugUIs/DebugContextMenu.lua:1305`)] Run it where stories run, on the server or in single player.

There is no event for the roll itself. `OnInitWorld` fires after the lists are built and before chunks load, which makes it the moment to tune them. :cite[(`zombie/iso/IsoWorld.java:1720-1817`, `zombie/iso/IsoWorld.java:1912-1913`)] See the class pages for [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase), [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase), [RandomizedVehicleStoryBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedvehiclestorybase), [RandomizedZoneStoryBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedzonestorybase), [IsoWorld](/pz/build-42/modding/reference/lua-classes-world-2#isoworld) and the event [OnInitWorld](/pz/build-42/modding/reference/lua-events#oninitworld).

Stashes are the one part that is plain data. `StashSystem.init` reads the global Lua table `StashDescriptions` when the world starts. :cite[(`zombie/core/stash/StashSystem.java:61-76`)] It is not limited to single player and the server: the call in `IsoWorld` has no client guard and `ServerMap` calls it too, so clients run it as well. :cite[(`zombie/iso/IsoWorld.java:2068`, `zombie/network/ServerMap.java:221`)] See [Inside the stash system](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system). Vanilla fills the table from `media/lua/shared/StashDescriptions/*.lua` with `StashUtil.newStash(name, type, item, customName)` and then `addStamp` or `addContainer` on the result, and a mod can add its own stash the same way, in a shared Lua file.

## 7. What a mod can and cannot change

A mod can change weights, remove stories and force scenes, but a new story kind needs its own Lua system.

**Can:** change weights, remove stories from the lists, force a story on a building, road or zone, write your own scene with the `RandomizedWorldBase` helpers from a server-side event, and add stash maps. Sandbox options cover the overall odds.

**Cannot, from Lua:** add a new kind of story to the roll. A story is a Java subclass, the lists are filled by `new` in `IsoWorld#init`, and the roll only ever picks from those lists. A Lua "story" has to be its own system that reacts to chunk loads (for example `LoadGridsquare`) and keeps its own record of what it has already done. :cite[(`zombie/iso/IsoWorld.java:1722-1816`)]

Traps we found in the code:

- **Building weights are captured once per game process.** The first building roll copies every story's weight into a static map, and that map is never rebuilt, not even when you load a second save in the same session. Set building weights in `OnInitWorld`, before any chunk loads; anything later is ignored until the game restarts. Vehicle story and dead survivor weights are re-read on every roll, so those you can change at any time. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:91-96`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:263-265`, `zombie/gameStates/GameLoadingState.java:312`, `zombie/randomizedWorld/randomizedVehicleStory/RandomizedVehicleStoryBase.java:55-66`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1057-1072`, `zombie/iso/IsoWorld.java:1913`)]
- **The house you stand in when it first loads gets no lived-in pass.** The building is marked `seen` before the roll, and then the base validity check refuses it while a player is inside (in single player, the local player; on a server, any player). The basic pass and every story that calls the base check are refused, while a story with its own check, such as the bar, still runs. On the next load the building is already `seen`. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:194`, `zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:108-123`, `zombie/randomizedWorld/randomizedBuilding/RBBar.java:114-116`)]
- **A zone story can be lost on quit.** The pick (story and spot) is kept in memory on the zone. The zone's "already rolled" counter is saved, the pick is not. Save and quit between the pick and the spawn and the zone stays empty. We have not reproduced this; it is the save code read end to end. :cite[(`zombie/iso/zones/Zone.java:73`, `zombie/iso/zones/Zone.java:209`, `zombie/randomizedWorld/randomizedZoneStory/RandomizedZoneStoryBase.java:99`)]
- **Two building stories and one dead survivor story are never rolled.** `RBJudge`, `RBReverend` and `RDSRatWar` exist and are exposed, but the lists never contain them, so they only run if a mod creates and calls them. :cite[(`zombie/iso/IsoWorld.java:1722-1752`, `zombie/Lua/LuaManager.java:2556-2592`, `zombie/randomizedWorld/randomizedBuilding/RBBasic.java:1080-1110`)]
- **Run story code on the server.** The base validity check returns false on a multiplayer client, and vanilla's debug menu sends a packet and the server runs the story. A story you call directly from a client skips that check, and what it would place on a client is untested ground. Put story code in a server or shared file and run it on the server. :cite[(`zombie/randomizedWorld/randomizedBuilding/RandomizedBuildingBase.java:100-101`, `zombie/network/packets/world/DebugStoryPacket.java:69-73`)]

:::callout[How we know]{kind=proof}
Everything above was read from the 42.22 decompiled code (capture B42_3d39148846). Not tested in a running game: the "Always Tries removes lived-in houses" effect (the test is two new single-player worlds on the same seed, one at Rare and one at Always Tries, visiting the same twenty houses in each and counting table scenes and dead-survivor scenes); whether story weights set from Lua on a dedicated server take effect (the test is to set every building story's weight to 0 except `RBBurnt` in a server-side `OnInitWorld` handler, set Randomized Building Chance to Always Tries, walk into a town nobody has visited, and check that houses come out burnt, with the server log as evidence); the lost zone-story pick on quit; and the dead ranch animals from world day 189 and 249.
:::

## 8. Where to go next

- [Erosion: how the world grows back](/pz/build-42/modding/engine/erosion), the other system that changes a chunk when it loads.
- [Procedural world generation](/pz/build-42/modding/engine/procedural-world-generation), which also runs on brand-new chunks.
- [Modding ranch zones](/pz/build-42/modding/farming-and-animals/modding-ranch-zones), for the ranch definitions this page only touches.
- [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).
