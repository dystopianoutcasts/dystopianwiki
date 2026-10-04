---
slug: lua-classes-world-4
title: 'Lua Classes: The world: squares, objects, map and weather, part 4 of 4 (Build 42.21)'
game: pz
version: build-42
section: modding
category: reference
difficulty: advanced
tags:
  - lua-api
  - reference
  - generated
  - classes
excerpt: 'The exposed the world: squares, objects, map and weather classes of Build 42.21 (part 4 of 4): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: The world: squares, objects, map and weather, part 4 of 4

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The map and what sits on it: grid squares, tile objects, buildings and rooms, the world map, erosion, weather and the randomized stories.

This page holds 111 classes and 926 methods, part 4 of 4 of this area (from `RDSPokerNight` to `WorldMapVisitedServer`), from the packages `zombie.randomizedWorld`, `zombie.randomizedWorld.randomizedDeadSurvivor`, `zombie.randomizedWorld.randomizedVehicleStory`, `zombie.randomizedWorld.randomizedZoneStory`, `zombie.seams`, `zombie.seating`, `zombie.spriteModel`, `zombie.tileDepth`, `zombie.world.moddata`, `zombie.worldMap`, `zombie.worldMap.editor`, `zombie.worldMap.markers`, `zombie.worldMap.network`, `zombie.worldMap.streets`, `zombie.worldMap.symbols`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### RDSPokerNight

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSPokerNight`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSPokerNight.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSPoliceAtHouse

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSPoliceAtHouse`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSPoliceAtHouse.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSPrisonEscape

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSPrisonEscape`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSPrisonEscape.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSPrisonEscapeWithPolice

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSPrisonEscapeWithPolice`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSPrisonEscapeWithPolice.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSRatInfested

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSRatInfested`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Static functions, called as `RDSRatInfested.name(...)`:

- `ratRoom(RoomDef def): void`

Constructors: `RDSRatInfested.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSRatKing

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSRatKing`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSRatKing.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSRatWar

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSRatWar`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSRatWar.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSResourceGarage

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSResourceGarage`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSResourceGarage.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSRPGNight

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSRPGNight`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSRPGNight.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSSkeletonPsycho

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSSkeletonPsycho`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSSkeletonPsycho.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSSpecificProfession

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSSpecificProfession`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSSpecificProfession.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSStagDo

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSStagDo`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSStagDo.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSStudentNight

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSStudentNight`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSStudentNight.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSSuicidePact

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSSuicidePact`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSSuicidePact.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSTinFoilHat

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSTinFoilHat`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSTinFoilHat.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSZombieLockedBathroom

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSZombieLockedBathroom`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSZombieLockedBathroom.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSZombiesEating

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSZombiesEating`, class. Extends [RandomizedDeadSurvivorBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](/pz/build-42/modding/reference/lua-classes-world-3#randomizedbuildingbase) (44), [RandomizedWorldBase](#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSZombiesEating.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RandomizedVehicleStoryBase

`zombie.randomizedWorld.randomizedVehicleStory.RandomizedVehicleStoryBase`, class. Extends [RandomizedWorldBase](#randomizedworldbase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `addSmashedOverlay(BaseVehicle v1, BaseVehicle v2, int xOffset, int yOffset, boolean horizontalZone, boolean addBlood): BaseVehicle[]`
- `callVehicleStorySpawner(Zone zone, IsoChunk chunk, float additionalRotationRadians): boolean`
- `getCenterOfChunk(Zone zone, IsoChunk chunk): IsoGridSquare`
- `getChance(): int`
- `getMinZoneHeight(): int`
- `getMinZoneWidth(): int`
- `getMinimumDays(): int`
- `getPolylineSpawnPoint(Zone zone, IsoChunk chunk, float[] result): boolean`
- `getRectangleSpawnPoint(Zone zone, IsoChunk chunk, float[] result): boolean`
- `getSpawnPoint(Zone zone, IsoChunk chunk, float[] result): boolean`
- `initSpawnDataForChunk(Zone zone, IsoChunk chunk): VehicleStorySpawnData`
- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `isChunkLoaded(int wx, int wy): boolean`
- `isFullyStreamedIn(int x1, int y1, int x2, int y2): boolean`
- `isValid(Zone zone, IsoChunk chunk, boolean force): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `registerCustomOutfits(): void`
- `setChance(int chance): void`
- `setMinimumDays(int minimumDays): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Static functions, called as `RandomizedVehicleStoryBase.name(...)`:

- `doRandomStory(Zone zone, IsoChunk chunk, boolean force): boolean`
- `getRandomFreeUnoccupiedSquare(RandomizedVehicleStoryBase rvs, Zone zone, IsoGridSquare sq1): IsoGridSquare`
- `initAllRVSMapChance(Zone zone, IsoChunk chunk): void`

Constructors: `RandomizedVehicleStoryBase.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSAmbulanceCrash

`zombie.randomizedWorld.randomizedVehicleStory.RVSAmbulanceCrash`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSAmbulanceCrash.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSAnimalOnRoad

`zombie.randomizedWorld.randomizedVehicleStory.RVSAnimalOnRoad`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Static functions, called as `RVSAnimalOnRoad.name(...)`:

- `getBreeds(): ArrayList<String>`

Constructors: `RVSAnimalOnRoad.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSAnimalTrailerOnRoad

`zombie.randomizedWorld.randomizedVehicleStory.RVSAnimalTrailerOnRoad`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSAnimalTrailerOnRoad.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSBanditRoad

`zombie.randomizedWorld.randomizedVehicleStory.RVSBanditRoad`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSBanditRoad.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSBurntCar

`zombie.randomizedWorld.randomizedVehicleStory.RVSBurntCar`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSBurntCar.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSCarCrash

`zombie.randomizedWorld.randomizedVehicleStory.RVSCarCrash`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSCarCrash.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSCarCrashCorpse

`zombie.randomizedWorld.randomizedVehicleStory.RVSCarCrashCorpse`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSCarCrashCorpse.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSCarCrashDeer

`zombie.randomizedWorld.randomizedVehicleStory.RVSCarCrashDeer`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSCarCrashDeer.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSChangingTire

`zombie.randomizedWorld.randomizedVehicleStory.RVSChangingTire`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSChangingTire.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSConstructionSite

`zombie.randomizedWorld.randomizedVehicleStory.RVSConstructionSite`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSConstructionSite.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSCrashHorde

`zombie.randomizedWorld.randomizedVehicleStory.RVSCrashHorde`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSCrashHorde.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSDeadEnd

`zombie.randomizedWorld.randomizedVehicleStory.RVSDeadEnd`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSDeadEnd.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSFlippedCrash

`zombie.randomizedWorld.randomizedVehicleStory.RVSFlippedCrash`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSFlippedCrash.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSHerdOnRoad

`zombie.randomizedWorld.randomizedVehicleStory.RVSHerdOnRoad`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (22), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`

Static functions, called as `RVSHerdOnRoad.name(...)`:

- `getBreeds(): ArrayList<String>`

Constructors: `RVSHerdOnRoad.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSPlonkies

`zombie.randomizedWorld.randomizedVehicleStory.RVSPlonkies`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSPlonkies.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSPoliceBlockade

`zombie.randomizedWorld.randomizedVehicleStory.RVSPoliceBlockade`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSPoliceBlockade.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSPoliceBlockadeShooting

`zombie.randomizedWorld.randomizedVehicleStory.RVSPoliceBlockadeShooting`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (19), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `isValid(Zone zone, IsoChunk chunk, boolean force): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSPoliceBlockadeShooting.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSRegionalProfessionVehicle

`zombie.randomizedWorld.randomizedVehicleStory.RVSRegionalProfessionVehicle`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSRegionalProfessionVehicle.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSRichJerk

`zombie.randomizedWorld.randomizedVehicleStory.RVSRichJerk`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSRichJerk.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSRoadKill

`zombie.randomizedWorld.randomizedVehicleStory.RVSRoadKill`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Static functions, called as `RVSRoadKill.name(...)`:

- `getBreeds(): ArrayList<String>`

Constructors: `RVSRoadKill.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSRoadKillSmall

`zombie.randomizedWorld.randomizedVehicleStory.RVSRoadKillSmall`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Static functions, called as `RVSRoadKillSmall.name(...)`:

- `getBreeds(): ArrayList<String>`

Constructors: `RVSRoadKillSmall.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSTrailerCrash

`zombie.randomizedWorld.randomizedVehicleStory.RVSTrailerCrash`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSTrailerCrash.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RVSUtilityVehicle

`zombie.randomizedWorld.randomizedVehicleStory.RVSUtilityVehicle`, class. Extends [RandomizedVehicleStoryBase](#randomizedvehiclestorybase). Also has the methods of [RandomizedVehicleStoryBase](#randomizedvehiclestorybase) (20), [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `doUtilityVehicle(Zone zone, IsoChunk chunk, String zoneName, String scriptName, String outfits, Integer femaleChance, String vehicleDistrib, ArrayList<String> items, int nbrOfItem, boolean addTrailer): void`
- `initVehicleStorySpawner(Zone zone, IsoChunk chunk, boolean debug): boolean`
- `randomizeVehicleStory(Zone zone, IsoChunk chunk): void`
- `spawnElement(VehicleStorySpawner spawner, VehicleStorySpawner.Element element): void`

Constructors: `RVSUtilityVehicle.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`.

### RandomizedWorldBase

`zombie.randomizedWorld.RandomizedWorldBase`, class.

Methods, called as `obj:name(...)`:

- `addBloodSplat(IsoGridSquare sq, int nbr): void`
- `addBrazier(IsoGridSquare sq): void`
- `addCampfire(IsoGridSquare sq): void`
- `addCampfireOrPit(IsoGridSquare sq): void`
- `addCharcoalBurner(IsoGridSquare sq): void`
- `addCookingPit(IsoGridSquare sq): void`
- `addItemOnGround(IsoGridSquare square, String type): InventoryItem`
- `addItemOnGround(IsoGridSquare square, InventoryItem item): InventoryItem`
- `addItemOnGround(IsoGridSquare square, InventoryItem item, boolean fill): InventoryItem`
- `addItemOnGroundNoLoot(IsoGridSquare square, String type): InventoryItem`
- `addItemOnGroundNoLoot(IsoGridSquare square, InventoryItem item): InventoryItem`
- `addItemToObjectSurface(String item, IsoObject object): InventoryItem`
- `addMattressNorthSouth(int x, int y, int z): void`
- `addMattressWestEast(int x, int y, int z): void`
- `addRandomFirepit(IsoGridSquare sq): void`
- `addRandomItemOnGround(IsoGridSquare square, ArrayList<String> types): InventoryItem`
- `addRandomItemsOnGround(RoomDef room, String type, int count): void`
- `addRandomItemsOnGround(RoomDef room, ArrayList<String> types, int count): void`
- `addRandomShelterNorthSouth(int x, int y, int z): void`
- `addRandomShelterWestEast(int x, int y, int z): void`
- `addRandomTentNorthSouth(int x, int y, int z): void`
- `addRandomTentWestEast(int x, int y, int z): void`
- `addShelterNorthSouth(int x, int y, int z): void`
- `addShelterWestEast(int x, int y, int z): void`
- `addSimpleCookingPit(IsoGridSquare sq): void`
- `addSimpleFire(IsoGridSquare sq): void`
- `addSleepingBagNorthSouth(int x, int y, int z): void`
- `addSleepingBagOrTentNorthSouth(int x, int y, int z): void`
- `addSleepingBagOrTentWestEast(int x, int y, int z): void`
- `addSleepingBagWestEast(int x, int y, int z): void`
- `addTentNorthSouth(int x, int y, int z): void`
- `addTentNorthSouthNew(int x, int y, int z): void`
- `addTentWestEast(int x, int y, int z): void`
- `addTentWestEastNew(int x, int y, int z): void`
- `addTileObject(int x, int y, int z, String spriteName): IsoObject`
- `addTileObject(int x, int y, int z, String spriteName, boolean dirt): IsoObject`
- `addTileObject(IsoGridSquare sq, String spriteName): IsoObject`
- `addTileObject(IsoGridSquare sq, String spriteName, boolean dirt): IsoObject`
- `addTileObject(IsoGridSquare sq, IsoObject obj): IsoObject`
- `addTileObject(IsoGridSquare sq, IsoObject obj, boolean dirt): IsoObject`
- `addTrailOfBlood(float x, float y, float z, float direction, int count): void`
- `addTrailer(BaseVehicle v, Zone zone, IsoChunk chunk, String zoneName, String vehicleDistrib, String trailerName): BaseVehicle`
- `addTraitOfBlood(IsoDirections dir, int time, int x, int y, int z): void`
- `addVehicle(float vehicleX, float vehicleY, float vehicleZ, float direction, String zoneName, String scriptName, Integer skinIndex, String specificContainer): BaseVehicle`
- `addVehicle(float vehicleX, float vehicleY, float vehicleZ, float direction, String zoneName, String scriptName, Integer skinIndex, String specificContainer, boolean crashed): BaseVehicle`
- `addVehicle(IsoGridSquare sq, IsoChunk chunk, String zoneName, String scriptName, Integer skinIndex, IsoDirections dir, String specificContainer): BaseVehicle`
- `addVehicle(Zone zone, float vehicleX, float vehicleY, float vehicleZ, float direction, String zoneName, String scriptName, Integer skinIndex, String specificContainer): BaseVehicle`
- `addVehicle(Zone zone, float vehicleX, float vehicleY, float vehicleZ, float direction, String zoneName, String scriptName, Integer skinIndex, String specificContainer, boolean crashed): BaseVehicle`
- `addVehicle(Zone zone, IsoGridSquare sq, IsoChunk chunk, String zoneName, String scriptName, Integer skinIndex, IsoDirections dir, String specificContainer): BaseVehicle`
- `addVehicle(Zone zone, IsoGridSquare sq, IsoChunk chunk, String zoneName, String scriptName, Integer skinIndex, IsoDirections dir, String specificContainer, boolean crashed): BaseVehicle`
- `addVehicle(Zone zone, IsoGridSquare sq, IsoChunk chunk, String zoneName, String scriptName, IsoDirections dir): BaseVehicle`
- `addVehicleFlipped(Zone zone, float vehicleX, float vehicleY, float vehicleZ, float direction, String zoneName, String scriptName, Integer skinIndex, String specificContainer): BaseVehicle`
- `addVehicleFlipped(Zone zone, IsoGridSquare sq, IsoChunk chunk, String zoneName, String scriptName, Integer skinIndex, IsoDirections dir, String specificContainer): BaseVehicle`
- `addWeapon(String type, boolean addRandomBullets): HandWeapon`
- `addWorkstationEntity(IsoGridSquare sq, GameEntityScript script, String sprite): void`
- `addWorkstationEntity(IsoThumpable thumpable, IsoGridSquare sq, GameEntityScript script, String sprite): void`
- `addZombiesOnSquare(int totalZombies, String outfit, Integer femaleChance, IsoGridSquare square): ArrayList<IsoZombie>`
- `addZombiesOnVehicle(int totalZombies, String outfit, Integer femaleChance, BaseVehicle vehicle): ArrayList<IsoZombie>`
- `checkAreaForCarsSpawn(IsoGridSquare square): boolean`
- `checkRadiusForCarSpawn(IsoGridSquare square, int radius): boolean`
- `cleanSquareAndNeighbors(IsoGridSquare sq): void`
- `createCorpse(IsoGridSquare freeSQ, boolean skeleton): IsoDeadBody`
- `createCorpse(IsoGridSquare freeSQ, IsoZombie zombie): IsoDeadBody`
- `createCorpse(RoomDef room): IsoDeadBody`
- `createCorpse(RoomDef room, boolean skeleton): IsoDeadBody`
- `createSkeletonCorpse(IsoGridSquare freeSQ): IsoDeadBody`
- `createSkeletonCorpse(RoomDef room): IsoDeadBody`
- `dirtBomb(IsoGridSquare sq): void`
- `getBBQClutter(): ArrayList<String>`
- `getBBQClutterItem(): String`
- `getBarnClutter(): ArrayList<String>`
- `getBathroomSinkClutter(): ArrayList<String>`
- `getBathroomSinkClutterItem(): String`
- `getBeachPartyClutter(): ArrayList<String>`
- `getBeachPartyClutterItem(): String`
- `getBedClutter(): ArrayList<String>`
- `getBedClutterItem(): String`
- `getCafeClutter(): ArrayList<String>`
- `getCarpentryToolClutter(): ArrayList<String>`
- `getCarpentryToolClutterItem(): String`
- `getClutterCopy(ArrayList<String> clutter): TIntObjectHashMap<String>`
- `getClutterCopy(ArrayList<String> clutter, TIntObjectHashMap<String> copy): TIntObjectHashMap<String>`
- `getDeadEndClutter(): ArrayList<String>`
- `getDebugLine(): String`
- `getDormClutter(): ArrayList<String>`
- `getFarmStorageClutter(): ArrayList<String>`
- `getFootballNightDrinks(): ArrayList<String>`
- `getFootballNightSnacks(): ArrayList<String>`
- `getGarageStorageClutter(): ArrayList<String>`
- `getGigamartClutter(): ArrayList<String>`
- `getGroceryClutter(): ArrayList<String>`
- `getHairSalonClutter(): ArrayList<String>`
- `getHallClutter(): ArrayList<String>`
- `getHenDoDrinks(): ArrayList<String>`
- `getHenDoSnacks(): ArrayList<String>`
- `getHoedownClutter(): ArrayList<String>`
- `getHoedownClutterItem(): String`
- `getHousePartyClutter(): ArrayList<String>`
- `getHousePartyClutterItem(): String`
- `getJudgeClutter(): ArrayList<String>`
- `getKidClutter(): ArrayList<String>`
- `getKidClutterItem(): String`
- `getKitchenCounterClutter(): ArrayList<String>`
- `getKitchenCounterClutterItem(): String`
- `getKitchenSinkClutter(): ArrayList<String>`
- `getKitchenSinkClutterItem(): String`
- `getKitchenStoveClutter(): ArrayList<String>`
- `getKitchenStoveClutterItem(): String`
- `getLaundryRoomClutter(): ArrayList<String>`
- `getLaundryRoomClutterItem(): String`
- `getLivingRoomOrKitchen(BuildingDef bDef): RoomDef`
- `getLivingroomClutter(): ArrayList<String>`
- `getLivingroomClutterItem(): String`
- `getMaximumDays(): int`
- `getMedicalClutter(): ArrayList<String>`
- `getMurderSceneClutter(): ArrayList<String>`
- `getName(): String`
- `getNastyMattressClutter(): ArrayList<String>`
- `getOfficeCarDealerClutter(): ArrayList<String>`
- `getOfficeOtherClutter(): ArrayList<String>`
- `getOfficePaperworkClutter(): ArrayList<String>`
- `getOfficePenClutter(): ArrayList<String>`
- `getOfficeTreatClutter(): ArrayList<String>`
- `getOldShelterClutter(): ArrayList<String>`
- `getOvenFoodClutter(): ArrayList<String>`
- `getOvenFoodClutterItem(): String`
- `getPillowClutter(): ArrayList<String>`
- `getPillowClutterItem(): String`
- `getPokerNightClutter(): ArrayList<String>`
- `getPokerNightClutterItem(): String`
- `getRandomRoom(BuildingDef bDef, int minArea): RoomDef`
- `getRandomRoomNoKids(BuildingDef bDef, int minArea): RoomDef`
- `getRichJerkClutter(): ArrayList<String>`
- `getRichJerkClutterItem(): String`
- `getRoom(BuildingDef bDef, String roomName): RoomDef`
- `getRoomNoKids(BuildingDef bDef, String roomName): RoomDef`
- `getSadCampsiteClutter(): ArrayList<String>`
- `getSadCampsiteClutterItem(): String`
- `getSidetableClutter(): ArrayList<String>`
- `getSidetableClutterItem(): String`
- `getSurvivalistCampsiteClutter(): ArrayList<String>`
- `getSurvivalistCampsiteClutterItem(): String`
- `getTwiggyClutter(): ArrayList<String>`
- `getUtilityToolClutter(): ArrayList<String>`
- `getUtilityToolClutterItem(): String`
- `getVanCampClutter(): ArrayList<String>`
- `getVanCampClutterItem(): String`
- `getWatchClutter(): ArrayList<String>`
- `getWatchClutterItem(): String`
- `getWoodcraftClutter(): ArrayList<String>`
- `graffSquare(IsoGridSquare sq, boolean north): void`
- `graffSquare(IsoGridSquare sq, String sprite, boolean north): void`
- `isRat(): boolean`
- `isTimeValid(boolean force): boolean`
- `isUnique(): boolean`
- `isValidGraffSquare(IsoGridSquare sq, boolean north, boolean recursive): boolean`
- `setAttachedItem(IsoZombie zombie, String location, String item, String ensureItem): void`
- `setDebugLine(String debugLine): void`
- `setMaximumDays(int maximumDays): void`
- `setUnique(boolean unique): void`
- `spawnCarOnNearestNav(String carName, BuildingDef def): BaseVehicle`
- `spawnCarOnNearestNav(String carName, BuildingDef def, String distribution): BaseVehicle`
- `trashSquare(IsoGridSquare sq): void`
- `trySpawnStoryItem(String itemType, IsoGridSquare square, float x, float y, float z, boolean fill): InventoryItem`
- `trySpawnStoryItem(InventoryItem item, ItemContainer container): InventoryItem`

Static functions, called as `RandomizedWorldBase.name(...)`:

- `addItemOnGroundStatic(IsoGridSquare square, String type): InventoryItem`
- `addItemOnGroundStatic(IsoGridSquare square, InventoryItem item): InventoryItem`
- `alignCorpseToSquare(IsoGameCharacter chr, IsoGridSquare square): void`
- `createBodyFromZombie(IsoGameCharacter chr): IsoDeadBody`
- `createRandomDeadBody(float x, float y, float z, float direction, boolean alignToSquare, int blood, int crawlerChance, String outfit): IsoDeadBody`
- `createRandomDeadBody(int x, int y, int z, IsoDirections dir, int blood): IsoDeadBody`
- `createRandomDeadBody(int x, int y, int z, IsoDirections dir, int blood, int crawlerChance): IsoDeadBody`
- `createRandomDeadBody(IsoGridSquare sq, IsoDirections dir2, boolean alignToSquare, int blood, int crawlerChance, String outfit, Integer femaleChance): IsoDeadBody`
- `createRandomDeadBody(IsoGridSquare sq, IsoDirections dir, int blood, int crawlerChance, String outfit): IsoDeadBody`
- `createRandomDeadBody(RoomDef room, int blood): IsoDeadBody`
- `createRandomZombie(int x, int y, int z): IsoGameCharacter`
- `createRandomZombie(RoomDef room): IsoGameCharacter`
- `createRandomZombieForCorpse(RoomDef room): IsoGameCharacter`
- `getBarnClutterItem(): String`
- `getCafeClutterItem(): String`
- `getClutterItem(ArrayList<String> clutterArray): String`
- `getDeadEndClutterItem(): String`
- `getDormClutterItem(): String`
- `getFarmStorageClutterItem(): String`
- `getFootballNightDrinkItem(): String`
- `getFootballNightSnackItem(): String`
- `getGarageStorageClutterItem(): String`
- `getGigamartClutterItem(): String`
- `getGroceryClutterItem(): String`
- `getHairSalonClutterItem(): String`
- `getHallClutterItem(): String`
- `getHenDoDrinkItem(): String`
- `getHenDoSnackItem(): String`
- `getJudgeClutterItem(): String`
- `getMedicallutterItem(): String`
- `getMurderSceneClutterItem(): String`
- `getNastyMattressClutterItem(): String`
- `getOfficeCarDealerClutterItem(): String`
- `getOfficeOtherClutterItem(): String`
- `getOfficePaperworkClutterItem(): String`
- `getOfficePenClutterItem(): String`
- `getOfficeTreatClutterItem(): String`
- `getOldShelterClutterItem(): String`
- `getRandomSpawnSquare(RoomDef roomDef): IsoGridSquare`
- `getRandomSquareForCorpse(RoomDef roomDef): IsoGridSquare`
- `getSq(int x, int y, int z): IsoGridSquare`
- `getTwiggyClutterItem(): String`
- `getWoodcraftClutterItem(): String`
- `is1x1AreaClear(IsoGridSquare square): boolean`
- `is1x2AreaClear(IsoGridSquare square): boolean`
- `is2x1AreaClear(IsoGridSquare square): boolean`
- `is2x1or1x2AreaClear(IsoGridSquare square): boolean`
- `is2x2AreaClear(IsoGridSquare square): boolean`
- `removeAllVehiclesOnZone(Zone zone): void`
- `trySpawnStoryItem(String itemType, IsoGridSquare square, float x, float y, float z): InventoryItem`
- `trySpawnStoryItem(String itemType, IsoObject obj, Boolean randomRotation): InventoryItem`
- `trySpawnStoryItem(InventoryItem item, IsoGridSquare square, float x, float y, float z): InventoryItem`

Constructors: `RandomizedWorldBase.new()`.

### RandomizedZoneStoryBase

`zombie.randomizedWorld.randomizedZoneStory.RandomizedZoneStoryBase`, class. Extends [RandomizedWorldBase](#randomizedworldbase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), listed on their own entries.

Methods, called as `obj:name(...)`:

- `cleanAreaForStory(RandomizedZoneStoryBase rzs, Zone zone): void`
- `getMinimumHeight(): int`
- `getMinimumWidth(): int`
- `getRandomExtraFreeSquare(RandomizedZoneStoryBase rzs, Zone zone): IsoGridSquare`
- `getRandomFreeSquare(RandomizedZoneStoryBase rzs, Zone zone): IsoGridSquare`
- `getRandomFreeSquare(RandomizedZoneStoryBase rzs, Zone zone, IsoGridSquare notSquare): IsoGridSquare`
- `getRandomFreeSquareFullZone(RandomizedZoneStoryBase rzs, Zone zone): IsoGridSquare`
- `isValid(): boolean`
- `isValid(Zone zone, boolean force): boolean`
- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RandomizedZoneStoryBase.name(...)`:

- `cleanSquareForStory(IsoGridSquare sq): void`
- `getRandomExtraFreeUnoccupiedSquare(RandomizedZoneStoryBase rzs, Zone zone): IsoGridSquare`
- `getRandomFreeUnoccupiedSquare(RandomizedZoneStoryBase rzs, Zone zone): IsoGridSquare`
- `initAllRZSMapChance(Zone zone): void`
- `isValidForStory(Zone zone, boolean force): boolean`

Constructors: `RandomizedZoneStoryBase.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZJackieJaye

`zombie.randomizedWorld.randomizedZoneStory.RZJackieJaye`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZJackieJaye.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSAttachedAnimal

`zombie.randomizedWorld.randomizedZoneStory.RZSAttachedAnimal`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSAttachedAnimal.name(...)`:

- `getBreeds(): ArrayList<String>`

Constructors: `RZSAttachedAnimal.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSBaseball

`zombie.randomizedWorld.randomizedZoneStory.RZSBaseball`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSBaseball.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSBBQParty

`zombie.randomizedWorld.randomizedZoneStory.RZSBBQParty`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSBBQParty.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSBeachParty

`zombie.randomizedWorld.randomizedZoneStory.RZSBeachParty`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSBeachParty.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSBurntWreck

`zombie.randomizedWorld.randomizedZoneStory.RZSBurntWreck`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSBurntWreck.name(...)`:

- `getForestClutter(): ArrayList<String>`

Constructors: `RZSBurntWreck.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSBuryingCamp

`zombie.randomizedWorld.randomizedZoneStory.RZSBuryingCamp`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSBuryingCamp.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSCampsite

`zombie.randomizedWorld.randomizedZoneStory.RZSCampsite`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSCampsite.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSCharcoalBurner

`zombie.randomizedWorld.randomizedZoneStory.RZSCharcoalBurner`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSCharcoalBurner.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSDean

`zombie.randomizedWorld.randomizedZoneStory.RZSDean`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSDean.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSDuke

`zombie.randomizedWorld.randomizedZoneStory.RZSDuke`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSDuke.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSEscapedAnimal

`zombie.randomizedWorld.randomizedZoneStory.RZSEscapedAnimal`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSEscapedAnimal.name(...)`:

- `getBreeds(): ArrayList<String>`

Constructors: `RZSEscapedAnimal.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSEscapedHerd

`zombie.randomizedWorld.randomizedZoneStory.RZSEscapedHerd`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSEscapedHerd.name(...)`:

- `getBreeds(): ArrayList<String>`

Constructors: `RZSEscapedHerd.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSFishingTrip

`zombie.randomizedWorld.randomizedZoneStory.RZSFishingTrip`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSFishingTrip.name(...)`:

- `getFishes(): ArrayList<String>`
- `getFishingTools(): ArrayList<String>`

Constructors: `RZSFishingTrip.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSForestCamp

`zombie.randomizedWorld.randomizedZoneStory.RZSForestCamp`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSForestCamp.name(...)`:

- `getCoolerClutter(): ArrayList<String>`
- `getFireClutter(): ArrayList<String>`
- `getForestClutter(): ArrayList<String>`

Constructors: `RZSForestCamp.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSForestCampEaten

`zombie.randomizedWorld.randomizedZoneStory.RZSForestCampEaten`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSForestCampEaten.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSFrankHemingway

`zombie.randomizedWorld.randomizedZoneStory.RZSFrankHemingway`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSFrankHemingway.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSHermitCamp

`zombie.randomizedWorld.randomizedZoneStory.RZSHermitCamp`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSHermitCamp.name(...)`:

- `getBagClutter(): ArrayList<String>`
- `getFireClutter(): ArrayList<String>`
- `getForestClutter(): ArrayList<String>`

Constructors: `RZSHermitCamp.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSHillbillyHoedown

`zombie.randomizedWorld.randomizedZoneStory.RZSHillbillyHoedown`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSHillbillyHoedown.name(...)`:

- `getBagClutter(): ArrayList<String>`

Constructors: `RZSHillbillyHoedown.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSHogWild

`zombie.randomizedWorld.randomizedZoneStory.RZSHogWild`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSHogWild.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSHunterCamp

`zombie.randomizedWorld.randomizedZoneStory.RZSHunterCamp`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSHunterCamp.name(...)`:

- `getForestClutter(): ArrayList<String>`

Constructors: `RZSHunterCamp.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSKirstyKormick

`zombie.randomizedWorld.randomizedZoneStory.RZSKirstyKormick`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSKirstyKormick.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSMurderScene

`zombie.randomizedWorld.randomizedZoneStory.RZSMurderScene`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSMurderScene.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSMusicFest

`zombie.randomizedWorld.randomizedZoneStory.RZSMusicFest`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSMusicFest.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSMusicFestStage

`zombie.randomizedWorld.randomizedZoneStory.RZSMusicFestStage`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSMusicFestStage.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSNastyMattress

`zombie.randomizedWorld.randomizedZoneStory.RZSNastyMattress`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSNastyMattress.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSOccultActivity

`zombie.randomizedWorld.randomizedZoneStory.RZSOccultActivity`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSOccultActivity.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSOldFirepit

`zombie.randomizedWorld.randomizedZoneStory.RZSOldFirepit`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSOldFirepit.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSOldShelter

`zombie.randomizedWorld.randomizedZoneStory.RZSOldShelter`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSOldShelter.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSOrphanedFawn

`zombie.randomizedWorld.randomizedZoneStory.RZSOrphanedFawn`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSOrphanedFawn.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSRangerSmith

`zombie.randomizedWorld.randomizedZoneStory.RZSRangerSmith`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSRangerSmith.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSRockerParty

`zombie.randomizedWorld.randomizedZoneStory.RZSRockerParty`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSRockerParty.name(...)`:

- `getBagClutter(): ArrayList<String>`
- `getFireClutter(): ArrayList<String>`
- `getForestClutter(): ArrayList<String>`

Constructors: `RZSRockerParty.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSSadCamp

`zombie.randomizedWorld.randomizedZoneStory.RZSSadCamp`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSSadCamp.name(...)`:

- `getOutfits(): ArrayList<String>`

Constructors: `RZSSadCamp.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSSexyTime

`zombie.randomizedWorld.randomizedZoneStory.RZSSexyTime`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSSexyTime.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSSirTwiggy

`zombie.randomizedWorld.randomizedZoneStory.RZSSirTwiggy`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSSirTwiggy.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSSurvivalistCamp

`zombie.randomizedWorld.randomizedZoneStory.RZSSurvivalistCamp`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSSurvivalistCamp.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSTragicPicnic

`zombie.randomizedWorld.randomizedZoneStory.RZSTragicPicnic`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSTragicPicnic.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSTrapperCamp

`zombie.randomizedWorld.randomizedZoneStory.RZSTrapperCamp`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSTrapperCamp.name(...)`:

- `getTrapList(): ArrayList<String>`

Constructors: `RZSTrapperCamp.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSVanCamp

`zombie.randomizedWorld.randomizedZoneStory.RZSVanCamp`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Static functions, called as `RZSVanCamp.name(...)`:

- `getBriefcaseClutter(): ArrayList<String>`

Constructors: `RZSVanCamp.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSWasteDump

`zombie.randomizedWorld.randomizedZoneStory.RZSWasteDump`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSWasteDump.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### RZSWaterPump

`zombie.randomizedWorld.randomizedZoneStory.RZSWaterPump`, class. Extends [RandomizedZoneStoryBase](#randomizedzonestorybase). Also has the methods of [RandomizedWorldBase](#randomizedworldbase) (217), [RandomizedZoneStoryBase](#randomizedzonestorybase) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeZoneStory(Zone zone): void`

Constructors: `RZSWaterPump.new()`.

Static fields (a copy of the value taken when the class is exposed): `baseChance: int`, `totalChance: int`, `zoneStory: String`.

### SeamManager

`zombie.seams.SeamManager`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `getHighestPriorityTile(String tilesetName, int col, int row): SeamFile.Tile`
- `getHighestPriorityTileFromName(String tileName): SeamFile.Tile`
- `getMasterTileName(String modID, String tilesetName, int col, int row): String`
- `getModIDs(): ArrayList<String>`
- `getOrCreateTile(String modID, String tilesetName, int col, int row): SeamFile.Tile`
- `getTile(String modID, String tilesetName, int col, int row): SeamFile.Tile`
- `getTileFromName(String modID, String tileName): SeamFile.Tile`
- `getTileJoinBelowE(String modID, String tilesetName, int col, int row, boolean bAllocate): ArrayList<String>`
- `getTileJoinBelowS(String modID, String tilesetName, int col, int row, boolean bAllocate): ArrayList<String>`
- `getTileJoinE(String modID, String tilesetName, int col, int row, boolean bAllocate): ArrayList<String>`
- `getTileJoinS(String modID, String tilesetName, int col, int row, boolean bAllocate): ArrayList<String>`
- `getTileProperty(String modID, String tilesetName, int col, int row, String key): String`
- `init(): void`
- `initGameData(): void`
- `initModData(ChooseGameInfo.Mod mod): void`
- `isMasterTile(String modID, String tilesetName, int col, int row): boolean`
- `setTileProperty(String modID, String tilesetName, int col, int row, String key, String value): void`
- `write(String modID): void`

Static functions, called as `SeamManager.name(...)`:

- `getInstance(): SeamManager`

### SeatingManager

`zombie.seating.SeatingManager`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `addTilePosition(String modID, String tilesetName, int col, int row, String id): int`
- `fixDefaultPositions(): void`
- `getAdjacentPosition(String modID, IsoSprite sprite, String sitDirectionStr, String sideStr, Model model, String animSetName, String animStateName, String animNodeName, Vector2f worldPos): boolean`
- `getAdjacentPosition(IsoGameCharacter character, IsoObject isoObject, String sitDirection, String side, String animStateName, String animNodeName, Vector3f worldPos): boolean`
- `getAnimationTrackFraction(IsoGameCharacter character, String animNodeName): float`
- `getDeferredMovement(BoneAxis boneAxis, Vector3f bonePos, Vector2 deferredPos): Vector2`
- `getFacingDirection(String tilesetName, int col, int row): String`
- `getFacingDirection(String modID, String tilesetName, int col, int row): String`
- `getFacingDirection(IsoObject object): String`
- `getFacingDirection(IsoSprite sprite): String`
- `getModIDs(): ArrayList<String>`
- `getOrCreateTile(String modID, String tilesetName, int col, int row): SeatingFile.Tile`
- `getTile(String modID, String tilesetName, int col, int row): SeatingFile.Tile`
- `getTilePositionCount(String tilesetName, int col, int row): int`
- `getTilePositionCount(String modID, String tilesetName, int col, int row): int`
- `getTilePositionCount(IsoObject isoObject): int`
- `getTilePositionID(String modID, String tilesetName, int col, int row, int index): String`
- `getTilePositionProperty(String modID, String tilesetName, int col, int row, int index, String key): String`
- `getTilePositionTranslate(String modID, String tilesetName, int col, int row, int index): Vector3f`
- `getTileProperty(String tilesetName, int col, int row, String key): String`
- `getTileProperty(String modID, String tilesetName, int col, int row, String key): String`
- `getTranslation(String tilesetName, int tileSheetIndex, String sitDirection, Vector3f xln): Vector3f`
- `getTranslation(String modID, String tilesetName, int tileSheetIndex, String sitDirection, Vector3f xln): Vector3f`
- `getTranslation(String modID, IsoSprite sprite, String sitDirection, Vector3f xln): Vector3f`
- `getTranslation(IsoSprite sprite, String sitDirection, Vector3f xln): Vector3f`
- `hasTilePositionWithID(String modID, String tilesetName, int col, int row, String id): boolean`
- `init(): void`
- `initGameData(): void`
- `initModData(ChooseGameInfo.Mod mod): void`
- `mergeAfterEditing(): void`
- `removeTilePosition(String modID, String tilesetName, int col, int row, int index): void`
- `setTilePositionProperty(String modID, String tilesetName, int col, int row, int index, String key, String value): void`
- `setTileProperty(String modID, String tilesetName, int col, int row, String key, String value): void`
- `write(String modID): void`

Static functions, called as `SeatingManager.name(...)`:

- `getInstance(): SeatingManager`

### SpriteModelManager

`zombie.spriteModel.SpriteModelManager`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `clearTileProperties(String modID, String tilesetName, int col, int row): void`
- `findTileset(String modID, String tilesetName): SpriteModelsFile.Tileset`
- `getModIDs(): ArrayList<String>`
- `getTileProperties(String modID, String tilesetName, int col, int row): SpriteModel`
- `init(): void`
- `initGameData(): void`
- `initModData(ChooseGameInfo.Mod mod): void`
- `initSprites(): void`
- `loadedTileDefinitions(): void`
- `setTileProperties(String modID, String tilesetName, int col, int row, SpriteModel spriteModel): void`
- `toScriptManager(): void`
- `toScriptManager(String modID): void`
- `write(String modID): void`

Static functions, called as `SpriteModelManager.name(...)`:

- `getInstance(): SpriteModelManager`

Constructors: `SpriteModelManager.new()`.

### TileDepthTexture

`zombie.tileDepth.TileDepthTexture`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `fileExists(): boolean`
- `getColumn(): int`
- `getHeight(): int`
- `getIndex(): int`
- `getName(): String`
- `getPixel(int x, int y): float`
- `getPixels(): float[]`
- `getRow(): int`
- `getTexture(): Texture`
- `getTileset(): TilesetDepthTexture`
- `getWidth(): int`
- `index(int x, int y): int`
- `isEmpty(): boolean`
- `reload(): void`
- `replacePixels(int x, int y, int w, int h, float oldPixel, float newPixel): void`
- `save(): void`
- `setMinPixel(int x, int y, float pixel): void`
- `setPixel(int x, int y, float pixel): void`
- `setPixels(int x, int y, int w, int h, float pixel): void`
- `updateGPUTexture(): void`

Constructors: `TileDepthTexture.new(TilesetDepthTexture tileset, int tileIndex)`.

### TileDepthTextureAssignmentManager

`zombie.tileDepth.TileDepthTextureAssignmentManager`, class.

Methods, called as `obj:name(...)`:

- `assignDepthTextureToSprite(String modID, String tileName): void`
- `assignTileName(String modID, String assignTo, String otherTile): void`
- `clearAssignedTileName(String modID, String assignTo): void`
- `getAssignedTileName(String modID, String tileName): String`
- `init(): void`
- `initGameData(): void`
- `initModData(ChooseGameInfo.Mod mod): void`
- `initSprites(): void`
- `save(String modID): void`

Static functions, called as `TileDepthTextureAssignmentManager.name(...)`:

- `getInstance(): TileDepthTextureAssignmentManager`

### TileDepthTextureManager

`zombie.tileDepth.TileDepthTextureManager`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `addedLoadTask(): void`
- `finishedLoadTask(): void`
- `getBillboardDepthTexture(): TileDepthTexture`
- `getDefaultDepthTexture(): TileDepthTexture`
- `getEmptyDepthTexture(int width, int height): Texture`
- `getPresetDepthTexture(int col, int row): TileDepthTexture`
- `getPresetTilesetDepthTexture(): TilesetDepthTexture`
- `getTexture(String tilesetName, int tileIndex): TileDepthTexture`
- `getTexture(String modID, String tilesetName, int tileIndex): TileDepthTexture`
- `getTextureFromTileName(String tileName): TileDepthTexture`
- `getTextureFromTileName(String modID, String tileName): TileDepthTexture`
- `init(): void`
- `initGameData(): void`
- `initModData(ChooseGameInfo.Mod mod): void`
- `initSprites(): void`
- `initSprites(String tilesetName): void`
- `isLoadingFinished(): boolean`
- `loadTilesetPixelsIfNeeded(String modID, String tilesetName): void`
- `loadedTileDefinitions(): void`
- `mergeAfterEditing(String tilesetName): void`
- `reloadTileset(String modID, String tilesetName): void`
- `saveTileset(String modID, String tilesetName): void`

Static functions, called as `TileDepthTextureManager.name(...)`:

- `getInstance(): TileDepthTextureManager`

Static fields (a copy of the value taken when the class is exposed): `DELAYED_LOADING: boolean`.

### TileDepthTextures

`zombie.tileDepth.TileDepthTextures`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `getExistingTileset(String tilesetName): TilesetDepthTexture`
- `getTexture(String tilesetName, int tileIndex): TileDepthTexture`
- `getTextureFromTileName(String tileName): TileDepthTexture`
- `initSprites(): void`
- `initSprites(String tilesetName): void`
- `loadDepthTextureImages(): void`
- `mergeTileset(TilesetDepthTexture other): void`
- `mergeTilesets(TileDepthTextures other): void`
- `saveTileset(String tilesetName): void`

Constructors: `TileDepthTextures.new(String modID, String mediaAbsPath)`.

### TileGeometryManager

`zombie.tileDepth.TileGeometryManager`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `copyGeometry(String modID, String tilesetName, int col, int row, ArrayList<TileGeometryFile.Geometry> geometries): void`
- `getGeometry(String modID, String tilesetName, int col, int row): ArrayList<TileGeometryFile.Geometry>`
- `getModIDs(): ArrayList<String>`
- `getOrCreateTile(String modID, String tilesetName, int col, int row): TileGeometryFile.Tile`
- `getTile(String modID, String tilesetName, int col, int row): TileGeometryFile.Tile`
- `getTileProperty(String modID, String tilesetName, int col, int row, String key): String`
- `init(): void`
- `initGameData(): void`
- `initModData(ChooseGameInfo.Mod mod): void`
- `initSpriteProperties(): void`
- `loadedTileDefinitions(): void`
- `setGeometry(String modID, String tilesetName, int col, int row, ArrayList<TileGeometryFile.Geometry> geometry): void`
- `setTileProperty(String modID, String tilesetName, int col, int row, String key, String value): void`
- `write(String modID): void`

Static functions, called as `TileGeometryManager.name(...)`:

- `getInstance(): TileGeometryManager`

Static fields (a copy of the value taken when the class is exposed): `ONE_PIXEL_OFFSET: boolean`.

### TilesetDepthTexture

`zombie.tileDepth.TilesetDepthTexture`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `clearTiles(): void`
- `fileExists(): boolean`
- `getAbsoluteFileName(): String`
- `getColumns(): int`
- `getHeight(): int`
- `getName(): String`
- `getOrCreateTile(int index): TileDepthTexture`
- `getOrCreateTile(int col, int row): TileDepthTexture`
- `getRelativeFileName(): String`
- `getRows(): int`
- `getTexture(): Texture`
- `getTileCount(): int`
- `getTileHeight(): int`
- `getTileWidth(): int`
- `getWidth(): int`
- `initSprites(): void`
- `is2x(): boolean`
- `isKeepPixels(): boolean`
- `load(): void`
- `mergeTileset(TilesetDepthTexture other): void`
- `recalculateShadowDepth(): void`
- `reload(): void`
- `removeFile(): void`
- `save(): void`
- `setKeepPixels(boolean bKeepPixels): void`

Constructors: `TilesetDepthTexture.new(TileDepthTextures owner, String name, int columns, int rows, boolean b2x)`.

### ModData

`zombie.world.moddata.ModData`, class.

Static functions, called as `ModData.name(...)`:

- `add(String tag, KahluaTable table): void`
- `create(): String`
- `create(String tag): KahluaTable`
- `exists(String tag): boolean`
- `get(String tag): KahluaTable`
- `getOrCreate(String tag): KahluaTable`
- `getTableNames(): ArrayList<String>`
- `remove(String tag): KahluaTable`
- `request(String tag): void`
- `transmit(String tag): void`

Constructors: `ModData.new()`.

### WorldMapEditorState

`zombie.worldMap.editor.WorldMapEditorState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua2(String func, Object arg0, Object arg1): Object`
- `load(): void`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `save(): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void`

Static functions, called as `WorldMapEditorState.name(...)`:

- `checkInstance(): WorldMapEditorState`

Constructors: `WorldMapEditorState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: WorldMapEditorState`.

### WorldMapGridSquareMarker

`zombie.worldMap.markers.WorldMapGridSquareMarker`, class. Extends `WorldMapMarker`.

Methods, called as `obj:name(...)`:

- `getPoolReference(): Pool.PoolReference` from `PooledObject`
- `isFree(): boolean` from `PooledObject`
- `onReleased(): void` from `IPooledObject`
- `release(): void` from `PooledObject`
- `setBlink(boolean blink): void`
- `setFree(boolean isFree): void` from `PooledObject`
- `setMinScreenRadius(int pixels): void`
- `setPool(Pool.PoolReference pool): void` from `PooledObject`

Constructors: `WorldMapGridSquareMarker.new()`.

### WorldMapMarkers

`zombie.worldMap.markers.WorldMapMarkers`, class.

Methods, called as `obj:name(...)`:

- `addGridSquareMarker(int worldX, int worldY, int radius, float r, float g, float b, float a): WorldMapGridSquareMarker`
- `clear(): void`
- `removeMarker(WorldMapMarker marker): void`
- `render(UIWorldMap ui): void`

Constructors: `WorldMapMarkers.new()`.

### WorldMapClient

`zombie.worldMap.network.WorldMapClient`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `isAuthorHidden(String userName): boolean`
- `receive(ByteBufferReader bb): void`
- `receiveRequestData(ByteBufferReader bb): void`
- `sendAddSymbol(WorldMapBaseSymbol symbol, WorldMapSymbolNetworkInfo networkInfo): void`
- `sendModifySymbol(WorldMapBaseSymbol symbol): void`
- `sendRemoveSymbol(WorldMapBaseSymbol symbol): void`
- `sendSetPrivateSymbol(WorldMapBaseSymbol symbol): void`
- `sendShareSymbol(WorldMapBaseSymbol symbol, WorldMapSymbolNetworkInfo networkInfo): void`
- `setAuthorHidden(String userName, boolean hidden): void`
- `worldMapLoaded(): void`

Static functions, called as `WorldMapClient.name(...)`:

- `getInstance(): WorldMapClient`

Constructors: `WorldMapClient.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: WorldMapClient`.

### StreetPoints

`zombie.worldMap.streets.StreetPoints`, class. Extends `TFloatArrayList`.

Methods, called as `obj:name(...)`:

- `add(float): boolean` from `TFloatArrayList`
- `add(float[]): void` from `TFloatArrayList`
- `add(float[], int, int): void` from `TFloatArrayList`
- `add(float x, float y): void`
- `addAll(float[]): boolean` from `TFloatArrayList`
- `addAll(TFloatCollection): boolean` from `TFloatArrayList`
- `addAll(Collection<? extends Float>): boolean` from `TFloatArrayList`
- `binarySearch(float): int` from `TFloatArrayList`
- `binarySearch(float, int, int): int` from `TFloatArrayList`
- `calculateBoundIfNeeded(): void`
- `calculateBounds(): void`
- `calculateLength(): float`
- `calculateLength(UIWorldMap ui): float`
- `clear(): void` from `TFloatArrayList`
- `clear(int): void` from `TFloatArrayList`
- `contains(float): boolean` from `TFloatArrayList`
- `containsAll(float[]): boolean` from `TFloatArrayList`
- `containsAll(TFloatCollection): boolean` from `TFloatArrayList`
- `containsAll(Collection<?>): boolean` from `TFloatArrayList`
- `ensureCapacity(int): void` from `TFloatArrayList`
- `equals(Object): boolean` from `TFloatArrayList`
- `fill(float): void` from `TFloatArrayList`
- `fill(int, int, float): void` from `TFloatArrayList`
- `forEach(TFloatProcedure): boolean` from `TFloatArrayList`
- `forEachDescending(TFloatProcedure): boolean` from `TFloatArrayList`
- `get(int): float` from `TFloatArrayList`
- `getMaxX(): float`
- `getMaxY(): float`
- `getMinX(): float`
- `getMinY(): float`
- `getNoEntryValue(): float` from `TFloatArrayList`
- `getQuick(int): float` from `TFloatArrayList`
- `getX(int index): float`
- `getY(int index): float`
- `grep(TFloatProcedure): TFloatList` from `TFloatArrayList`
- `hashCode(): int` from `TFloatArrayList`
- `indexOf(float): int` from `TFloatArrayList`
- `indexOf(int, float): int` from `TFloatArrayList`
- `insert(int, float): void` from `TFloatArrayList`
- `insert(int, float[]): void` from `TFloatArrayList`
- `insert(int, float[], int, int): void` from `TFloatArrayList`
- `invalidateBounds(): void`
- `inverseGrep(TFloatProcedure): TFloatList` from `TFloatArrayList`
- `isClockwise(): boolean`
- `isEmpty(): boolean` from `TFloatArrayList`
- `iterator(): TFloatIterator` from `TFloatArrayList`
- `lastIndexOf(float): int` from `TFloatArrayList`
- `lastIndexOf(int, float): int` from `TFloatArrayList`
- `max(): float` from `TFloatArrayList`
- `min(): float` from `TFloatArrayList`
- `numPoints(): int`
- `readExternal(ObjectInput): void` from `TFloatArrayList`
- `remove(float): boolean` from `TFloatArrayList`
- `remove(int, int): void` from `TFloatArrayList`
- `removeAll(float[]): boolean` from `TFloatArrayList`
- `removeAll(TFloatCollection): boolean` from `TFloatArrayList`
- `removeAll(Collection<?>): boolean` from `TFloatArrayList`
- `removeAt(int): float` from `TFloatArrayList`
- `replace(int, float): float` from `TFloatArrayList`
- `reset(): void` from `TFloatArrayList`
- `resetQuick(): void` from `TFloatArrayList`
- `retainAll(float[]): boolean` from `TFloatArrayList`
- `retainAll(TFloatCollection): boolean` from `TFloatArrayList`
- `retainAll(Collection<?>): boolean` from `TFloatArrayList`
- `reverse(): void` from `TFloatArrayList`
- `reverse(int, int): void` from `TFloatArrayList`
- `set(int, float): float` from `TFloatArrayList`
- `set(int, float[]): void` from `TFloatArrayList`
- `set(int, float[], int, int): void` from `TFloatArrayList`
- `setQuick(int, float): void` from `TFloatArrayList`
- `setReverse(StreetPoints dest): void`
- `shuffle(Random): void` from `TFloatArrayList`
- `size(): int` from `TFloatArrayList`
- `sort(): void` from `TFloatArrayList`
- `sort(int, int): void` from `TFloatArrayList`
- `subList(int, int): TFloatList` from `TFloatArrayList`
- `sum(): float` from `TFloatArrayList`
- `toArray(): float[]` from `TFloatArrayList`
- `toArray(float[]): float[]` from `TFloatArrayList`
- `toArray(float[], int, int): float[]` from `TFloatArrayList`
- `toArray(float[], int, int, int): float[]` from `TFloatArrayList`
- `toArray(int, int): float[]` from `TFloatArrayList`
- `toString(): String` from `TFloatArrayList`
- `transformValues(TFloatFunction): void` from `TFloatArrayList`
- `trimToSize(): void` from `TFloatArrayList`
- `writeExternal(ObjectOutput): void` from `TFloatArrayList`

Static functions, called as `StreetPoints.name(...)`:

- `wrap(float[]): TFloatArrayList` from `TFloatArrayList`
- `wrap(float[], float): TFloatArrayList` from `TFloatArrayList`

Constructors: `StreetPoints.new()`.

Static fields (a copy of the value taken when the class is exposed): `serialVersionUID: long`.

### WorldMapStreet

`zombie.worldMap.streets.WorldMapStreet`, class.

Methods, called as `obj:name(...)`:

- `addPoint(float x, float y): void`
- `clipToObscuredCells(): void`
- `createCopy(WorldMapStreets owner): WorldMapStreet`
- `createHighlightPolygons(TFloatArrayList polygon, TFloatArrayList triangles): void`
- `createPolygon(TFloatArrayList points): void`
- `getAddPointLocation(UIWorldMap ui, float uiX, float uiY, ClosestPoint closestPoint): ClosestPoint`
- `getClosestPointOn(float worldX, float worldY, ClosestPoint closestPoint): float`
- `getClosestPointOn(UIWorldMap ui, float uiX, float uiY, ClosestPoint closestPoint): float`
- `getFont(UIWorldMap ui): UIFont`
- `getFontScale(UIWorldMap ui): double`
- `getIntersections(): ArrayList<Intersection>`
- `getLength(UIWorldMap ui): float`
- `getLengthSquared(UIWorldMap ui): float`
- `getMaxX(): float`
- `getMaxY(): float`
- `getMinX(): float`
- `getMinY(): float`
- `getNumPoints(): int`
- `getOwner(): WorldMapStreets`
- `getPointOn(UIWorldMap ui, float t, PointOn pointOn): boolean`
- `getPointX(int index): float`
- `getPointY(int index): float`
- `getPoints(): StreetPoints`
- `getTranslatedText(): String`
- `getUntranslatedText(): String`
- `getWidth(): int`
- `insertPoint(int index, float x, float y): void`
- `isOnScreen(UIWorldMap ui): boolean`
- `pickPoint(UIWorldMap ui, float uiX, float uiY): int`
- `registerNavZone(int worldX1, int worldY1, int worldX2, int worldY2): void`
- `registerNavZone2(int x, int y, int zoneWidth, int zoneHeight): void`
- `registerNavZonePolyline(TIntArrayList linePoints): void`
- `registerNavZones(): void`
- `removePoint(int index): void`
- `render(UIWorldMap ui, StreetRenderData renderData): void`
- `renderIntersections(UIWorldMap ui, float r, float g, float b, float a): void`
- `renderLines(UIWorldMap ui, float r, float g, float b, float a, int thickness, StreetRenderData renderData): void`
- `resetIntersectionRenderFlag(): void`
- `reverseDirection(): void`
- `setPoint(int index, float x, float y): void`
- `setUntranslatedText(String text): void`
- `setWidth(int width): void`
- `triangulate(TFloatArrayList polygon, TFloatArrayList triangles): void`

Constructors: `WorldMapStreet.new(WorldMapStreets owner, String untranslatedText, StreetPoints points)`.

### MapSymbolDefinitions

`zombie.worldMap.symbols.MapSymbolDefinitions`, class.

Methods, called as `obj:name(...)`:

- `addTexture(String id, String path): void`
- `addTexture(String id, String path, int width, int height, String tab): void`
- `addTexture(String id, String path, String tab): void`
- `getSymbolById(String id): MapSymbolDefinitions.MapSymbolDefinition`
- `getSymbolByIndex(int index): MapSymbolDefinitions.MapSymbolDefinition`
- `getSymbolCount(): int`

Static functions, called as `MapSymbolDefinitions.name(...)`:

- `Reset(): void`
- `getInstance(): MapSymbolDefinitions`

Constructors: `MapSymbolDefinitions.new()`.

### MapSymbolDefinitions.MapSymbolDefinition

`zombie.worldMap.symbols.MapSymbolDefinitions.MapSymbolDefinition`, class.

Methods, called as `obj:name(...)`:

- `getHeight(): int`
- `getId(): String`
- `getTab(): String`
- `getTexturePath(): String`
- `getWidth(): int`

Constructors: `MapSymbolDefinitions.MapSymbolDefinition.new()`.

### UIWorldMap

`zombie.worldMap.UIWorldMap`, class. Extends [UIElement](/pz/build-42/modding/reference/lua-classes-ui-and-input#uielement). Also has the methods of [UIElement](/pz/build-42/modding/reference/lua-classes-ui-and-input#uielement) (168), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DrawSymbol(Texture tex, double pointOfRotationX, double pointOfRotationY, double width, double height, double degrees, double scale, boolean bMatchPerspective, boolean bApplyZoom, double r, double g, double b, double a): void`
- `DrawTextSdf(UIFont font, String text, double x, double y, double scale, double r, double g, double b, double alpha): void`
- `DrawTextSdfRotated(String layerID, String text, double pointOfRotationX, double pointOfRotationY, double anchorX, double anchorY, double degrees, double scale, boolean bMatchPerspective, boolean bApplyZoom, double r, double g, double b, double alpha): void`
- `getAPI(): UIWorldMapV3`
- `getAPIv1(): UIWorldMapV1`
- `getAPIv2(): UIWorldMapV2`
- `getAPIv3(): UIWorldMapV3`
- `isMapEditor(): boolean`
- `render(): void`
- `scaleWidthToHeight(): void`
- `setDoStencil(boolean value): void`
- `setMapEditor(boolean b): void`

Static functions, called as `UIWorldMap.name(...)`:

- `setExposed(LuaManager.Exposer exposer): void`

Constructors: `UIWorldMap.new(KahluaTable table)`.

### UIWorldMapV1

`zombie.worldMap.UIWorldMapV1`, class.

Methods, called as `obj:name(...)`:

- `addData(String fileName): void`
- `addImages(String directory): void`
- `centerOn(float worldX, float worldY): void`
- `clearData(): void`
- `endDirectoryData(): void`
- `getBaseZoom(): float`
- `getBoolean(String name): boolean`
- `getCenterWorldX(): float`
- `getCenterWorldY(): float`
- `getDataCount(): int`
- `getDataFileByIndex(int index): String`
- `getDouble(String name, double defaultValue): double`
- `getHeightInCells(): int`
- `getHeightInSquares(): int`
- `getImagesCount(): int`
- `getMarkersAPI(): WorldMapMarkersV1`
- `getMaxXInCells(): int`
- `getMaxXInSquares(): int`
- `getMaxYInCells(): int`
- `getMaxYInSquares(): int`
- `getMinXInCells(): int`
- `getMinXInSquares(): int`
- `getMinYInCells(): int`
- `getMinYInSquares(): int`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionCount(): int`
- `getStyleAPI(): WorldMapStyleV1`
- `getSymbolsAPI(): WorldMapSymbolsAPI`
- `getWidthInCells(): int`
- `getWidthInSquares(): int`
- `getWorldScale(): float`
- `getZoomF(): float`
- `mouseToWorldX(): float`
- `mouseToWorldY(): float`
- `moveView(float dx, float dy): void`
- `resetView(): void`
- `setBackgroundRGBA(float r, float g, float b, float a): void`
- `setBoolean(String name, boolean value): void`
- `setBoundsFromData(): void`
- `setBoundsFromWorld(): void`
- `setBoundsInCells(int minX, int minY, int maxX, int maxY): void`
- `setBoundsInSquares(int minX, int minY, int maxX, int maxY): void`
- `setDouble(String name, double value): void`
- `setDropShadowWidth(int width): void`
- `setMapItem(MapItem mapItem): void`
- `setUnvisitedGridRGBA(float r, float g, float b, float a): void`
- `setUnvisitedRGBA(float r, float g, float b, float a): void`
- `setZoom(float zoom): void`
- `uiToWorldX(float uiX, float uiY): float`
- `uiToWorldX(float uiX, float uiY, float zoomF, float centerWorldX, float centerWorldY): float`
- `uiToWorldY(float uiX, float uiY): float`
- `uiToWorldY(float uiX, float uiY, float zoomF, float centerWorldX, float centerWorldY): float`
- `worldOriginX(): float`
- `worldOriginY(): float`
- `worldToUIX(float worldX, float worldY): float`
- `worldToUIY(float worldX, float worldY): float`
- `zoomAt(float uiX, float uiY, float delta): void`

Constructors: `UIWorldMapV1.new(UIWorldMap ui)`.

### UIWorldMapV2

`zombie.worldMap.UIWorldMapV2`, class. Extends [UIWorldMapV1](#uiworldmapv1). Also has the methods of [UIWorldMapV1](#uiworldmapv1) (56), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getSymbolsAPI(): WorldMapSymbolsAPI`
- `getSymbolsAPIv2(): WorldMapSymbolsV2`
- `isDimUnsharedSymbols(): boolean`

Constructors: `UIWorldMapV2.new(UIWorldMap ui)`.

### UIWorldMapV3

`zombie.worldMap.UIWorldMapV3`, class. Extends [UIWorldMapV2](#uiworldmapv2). Also has the methods of [UIWorldMapV1](#uiworldmapv1) (55), [UIWorldMapV2](#uiworldmapv2) (3), listed on their own entries.

Methods, called as `obj:name(...)`:

- `addImagePyramid(String fileName): void`
- `clearImages(): void`
- `getDataHeightInCells(): int`
- `getDataWidthInCells(): int`
- `getImagePyramidHeightInSquares(String fileName): int`
- `getImagePyramidMaxX(String fileName): int`
- `getImagePyramidMaxY(String fileName): int`
- `getImagePyramidMinX(String fileName): int`
- `getImagePyramidMinY(String fileName): int`
- `getImagePyramidWidthInSquares(String fileName): int`
- `getMaxZoom(): float`
- `getStreetsAPI(): WorldMapStreetsV1`
- `getStyleAPI(): WorldMapStyleV1`
- `isDataLoaded(): boolean`
- `setDisplayedArea(float worldX1, float worldY1, float worldX2, float worldY2): void`
- `setMaxZoom(float maxZoom): void`
- `transitionTo(float worldX, float worldY, float zoomF): void`

Constructors: `UIWorldMapV3.new(UIWorldMap ui)`.

### WorldMapRenderer.WorldMapBooleanOption

`zombie.worldMap.WorldMapRenderer.WorldMapBooleanOption`, class. Extends [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption). Also has the methods of [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption) (13), [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), listed on their own entries.

Constructors: `WorldMapRenderer.WorldMapBooleanOption.new(WorldMapRenderer, String, boolean)`.

### WorldMapRenderer.WorldMapDoubleOption

`zombie.worldMap.WorldMapRenderer.WorldMapDoubleOption`, class. Extends [DoubleConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#doubleconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), [DoubleConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#doubleconfigoption) (16), listed on their own entries.

Constructors: `WorldMapRenderer.WorldMapDoubleOption.new(WorldMapRenderer, String, double, double, double)`.

### WorldMapSettings

`zombie.worldMap.WorldMapSettings`, class.

Methods, called as `obj:name(...)`:

- `getBoolean(String name): boolean`
- `getDouble(String name, double defaultValue): double`
- `getFileVersion(): int`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `load(): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setDouble(String name, double value): void`

Static functions, called as `WorldMapSettings.name(...)`:

- `Reset(): void`
- `getInstance(): WorldMapSettings`

Constructors: `WorldMapSettings.new()`.

Static fields (a copy of the value taken when the class is exposed): `VERSION: int`, `VERSION1: int`.

### WorldMapVisited

`zombie.worldMap.WorldMapVisited`, class.

Methods, called as `obj:name(...)`:

- `clearKnownInCells(int minX, int minY, int maxX, int maxY): void`
- `clearKnownInSquares(int minX, int minY, int maxX, int maxY): void`
- `clearVisitedInCells(int minX, int minY, int maxX, int maxY): void`
- `clearVisitedInSquares(int minX, int minY, int maxX, int maxY): void`
- `forget(): void`
- `getMinX(): int`
- `getMinY(): int`
- `isKnown(int x, int y): boolean`
- `isKnown(int x1, int y1, int x2, int y2): boolean`
- `isVisited(int x, int y): boolean`
- `isVisited(int x, int y, int x2, int y2): boolean`
- `load(): void`
- `processDataChunk(int pos, byte[] chunk): void`
- `receiveRequestData(ByteBufferReader bb): void`
- `render(float renderX, float renderY, int minX, int minY, int maxX, int maxY, float worldScale, boolean blur): void`
- `renderGrid(float renderX, float renderY, int minX, int minY, int maxX, int maxY, float worldScale, float zoomF): void`
- `renderMain(): void`
- `save(): void`
- `saveToBufferMap(SaveBufferMap bufferMap): void`
- `setBounds(int minX, int minY, int maxX, int maxY): void`
- `setKnownInCells(int minX, int minY, int maxX, int maxY): void`
- `setKnownInSquares(int minX, int minY, int maxX, int maxY): void`
- `setVisitedInCells(int minX, int minY, int maxX, int maxY): void`
- `setVisitedInSquares(int minX, int minY, int maxX, int maxY): void`

Static functions, called as `WorldMapVisited.name(...)`:

- `Reset(): void`
- `SaveAll(): void`
- `getInstance(): WorldMapVisited`
- `getVisitedLength(): int`
- `setKnownInSquares(int minX, int minY, int maxX, int maxY, byte[] visited): void`
- `update(): void`
- `updatePlayer(IsoPlayer player, byte[] visited): void`

Constructors: `WorldMapVisited.new()`.

### WorldMapVisitedServer

`zombie.worldMap.WorldMapVisitedServer`, class.

Methods, called as `obj:name(...)`:

- `deleteUser(String user): void`
- `forget(IsoPlayer player): void`
- `loadUser(IConnection connection): void`
- `save(): void`
- `sendRequestData(IConnection connection, ByteBufferWriter b): void`
- `setKnownInSquares(IsoPlayer player, int minX, int minY, int maxX, int maxY): void`
- `unloadUser(String user): void`
- `update(): void`

Static functions, called as `WorldMapVisitedServer.name(...)`:

- `getInstance(): WorldMapVisitedServer`

Constructors: `WorldMapVisitedServer.new()`.
