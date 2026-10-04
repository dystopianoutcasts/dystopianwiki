---
slug: lua-classes-world-1
title: 'Lua Classes: The world: squares, objects, map and weather, part 1 of 4 (Build 42.21)'
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
excerpt: 'The exposed the world: squares, objects, map and weather classes of Build 42.21 (part 1 of 4): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: The world: squares, objects, map and weather, part 1 of 4

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The map and what sits on it: grid squares, tile objects, buildings and rooms, the world map, erosion, weather and the randomized stories.

This page holds 59 classes and 2,461 methods, part 1 of 4 of this area (from `Basements` to `IsoMovingObject`), from the packages `zombie.basements`, `zombie.buildingRooms`, `zombie.erosion`, `zombie.erosion.season`, `zombie.globalObjects`, `zombie.iso`, `zombie.iso.areas`, `zombie.iso.areas.isoregion`, `zombie.iso.areas.isoregion.data`, `zombie.iso.areas.isoregion.regions`, `zombie.iso.fboRenderChunk`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### Basements

`zombie.basements.Basements`, class.

Methods, called as `obj:name(...)`:

- `afterLoadMetaGrid(): void`
- `beforeLoadMetaGrid(): void`
- `beforeOnLoadMapZones(): void`
- `chunkHasBasement(IsoChunk chunk): boolean`
- `getOrCreatePerMap(String mapID): BasementsPerMap`
- `getPerMap(String mapID): BasementsPerMap`
- `onNewChunkLoaded(IsoChunk chunk): void`
- `parseBasementAccessDefinitions(): void`
- `parseBasementDefinitions(): void`

Static functions, called as `Basements.name(...)`:

- `getAPIv1(): BasementsV1`
- `getInstance(): Basements`

Constructors: `Basements.new()`.

Static fields (a copy of the value taken when the class is exposed): `SAVEFILE_VERSION: int`.

### BasementsV1

`zombie.basements.BasementsV1`, class.

Methods, called as `obj:name(...)`:

- `addAccessDefinitions(String mapID, KahluaTable table): void`
- `addBasementDefinitions(String mapID, KahluaTable table): void`
- `addSpawnLocations(String mapID, KahluaTable table): void`
- `registerBasementSpawnLocation(String mapID, String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): BasementSpawnLocation`

Constructors: `BasementsV1.new()`.

### BREBuilding

`zombie.buildingRooms.BREBuilding`, class.

Methods, called as `obj:name(...)`:

- `applyChanges(boolean bLoading): void`
- `copyFrom(BuildingDef buildingDef2): BREBuilding`
- `createRoom(int level): BRERoom`
- `getRoomByIndex(int index): BRERoom`
- `getRoomCount(): int`
- `getRoomIndexAt(int x, int y, int z): int`
- `hasNonEmptyRoomsOnLevel(int z): boolean`
- `intersects(int x, int y, int w, int h, int z): boolean`
- `isAdjacent(int x, int y, int w, int h, int z): boolean`
- `isEdited(): boolean`
- `isValid(): boolean`
- `removeRoom(BRERoom room): void`
- `setEdited(boolean b): void`

Constructors: `BREBuilding.new()`.

### BRERoom

`zombie.buildingRooms.BRERoom`, class.

Methods, called as `obj:name(...)`:

- `addRectangle(int x, int y, int w, int h): void`
- `contains(int x, int y, int z): boolean`
- `copyFrom(RoomDef roomDef2): BRERoom`
- `getLevel(): int`
- `getName(): String`
- `getRectangle(int index): RoomDef.RoomRect`
- `getRectangleCount(): int`
- `hitTest(int squareX, int squareY): int`
- `intersects(int x, int y, int w, int h): boolean`
- `isAdjacent(int x, int y, int w, int h): boolean`
- `isValid(): boolean`
- `removeRectangle(int index): void`
- `setName(String name): void`

### BuildingRoomsEditor

`zombie.buildingRooms.BuildingRoomsEditor`, class.

Methods, called as `obj:name(...)`:

- `applyChanges(boolean bLoading): void`
- `callLua(String event, Object... args): void`
- `canAddRoomRectangle(BRERoom room, int x, int y, int w, int h, int z): boolean`
- `checkBuildingAndRoomIDs(): void`
- `checkBuildingAndRoomIDs(IsoMetaCell metaCell): void`
- `copyExistingBuilding(BuildingDef buildingDef2): BREBuilding`
- `createBuilding(): BREBuilding`
- `getBuildingByIndex(int index): BREBuilding`
- `getBuildingCount(): int`
- `getInvalidString(): String`
- `init(int worldX, int worldY): void`
- `isValid(): boolean`
- `load(): void`
- `removeBuilding(BREBuilding building): void`
- `renderMain(): void`
- `setCurrentBuilding(BREBuilding building): void`
- `setCurrentLevel(int level): void`
- `setCurrentRoom(BRERoom room): void`
- `setHighlightRectForDeletion(int rectIndex): void`
- `setLuaEditor(KahluaTable table): void`

Static functions, called as `BuildingRoomsEditor.name(...)`:

- `Reset(): void`
- `getInstance(): BuildingRoomsEditor`
- `setExposed(LuaManager.Exposer exposer): void`

Constructors: `BuildingRoomsEditor.new()`.

### ErosionConfig

`zombie.erosion.ErosionConfig`, class.

Methods, called as `obj:name(...)`:

- `consolePrint(): void`
- `getDebug(): ErosionConfig.Debug`
- `load(ByteBufferReader bb): void`
- `readFile(String fileName): boolean`
- `save(ByteBufferWriter bb): void`
- `writeFile(String fileName): void`

Constructors: `ErosionConfig.new()`.

### ErosionConfig.Debug

`zombie.erosion.ErosionConfig.Debug`, class.

Methods, called as `obj:name(...)`:

- `getEnabled(): boolean`
- `getStartDay(): int`
- `getStartMonth(): int`

Constructors: `ErosionConfig.Debug.new()`.

### ErosionConfig.Season

`zombie.erosion.ErosionConfig.Season`, class.

Constructors: `ErosionConfig.Season.new()`.

### ErosionConfig.Seeds

`zombie.erosion.ErosionConfig.Seeds`, class.

Constructors: `ErosionConfig.Seeds.new()`.

### ErosionConfig.Time

`zombie.erosion.ErosionConfig.Time`, class.

Constructors: `ErosionConfig.Time.new()`.

### ErosionMain

`zombie.erosion.ErosionMain`, class.

Methods, called as `obj:name(...)`:

- `DebugUpdateMapNow(): void`
- `getConfig(): ErosionConfig`
- `getEtick(): int`
- `getSeasons(): ErosionSeason`
- `getSnowFraction(): int`
- `getSnowFractionYesterday(): int`
- `getSpriteManager(): IsoSpriteManager`
- `isSnow(): boolean`
- `mainTimer(): void`
- `receiveState(ByteBufferReader bb): void`
- `sendState(ByteBufferWriter bb): void`
- `snowCheck(): void`
- `start(): void`

Static functions, called as `ErosionMain.name(...)`:

- `ChunkLoaded(IsoChunk isoChunk): void`
- `EveryTenMinutes(): void`
- `LoadGridsquare(IsoGridSquare square): void`
- `Reset(): void`
- `getInstance(): ErosionMain`

Constructors: `ErosionMain.new(IsoSpriteManager isoSpriteManager, boolean debug)`.

### ErosionSeason

`zombie.erosion.season.ErosionSeason`, class.

Methods, called as `obj:name(...)`:

- `clone(): ErosionSeason`
- `getCurDayPercent(): float`
- `getDawn(): float`
- `getDayHighNoon(): float`
- `getDayMeanTemperature(): float`
- `getDayNoiseVal(): float`
- `getDayTemperature(): float`
- `getDaylight(): float`
- `getDusk(): float`
- `getHighNoon(): float`
- `getLat(): int`
- `getMaxDaylightSummer(): double`
- `getMaxDaylightWinter(): double`
- `getRainDayStrength(): float`
- `getRainYearAverage(): float`
- `getSeason(): int`
- `getSeasonDay(): float`
- `getSeasonDays(): float`
- `getSeasonLag(): int`
- `getSeasonName(): String`
- `getSeasonNameTranslated(): String`
- `getSeasonProgression(): float`
- `getSeasonStrength(): float`
- `getSeedA(): int`
- `getSeedB(): int`
- `getSeedC(): int`
- `getTempDiff(): int`
- `getTempMax(): int`
- `getTempMin(): int`
- `getWinterStartDay(int day, int month, int year): GregorianCalendar`
- `init(int lat, int tempMax, int tempMin, int tempDiff, int seasonLag, float noon, int seedA, int seedB, int seedC): void`
- `isEndlessDay(): boolean`
- `isEndlessNight(): boolean`
- `isRainDay(): boolean`
- `isSeason(int season): boolean`
- `isSunnyDay(): boolean`
- `isThunderDay(): boolean`
- `setCurSeason(int season): void`
- `setDay(int day, int month, int year): void`
- `setRain(float jan, float feb, float mar, float apr, float may, float jun, float jul, float aug, float sep, float oct, float nov, float dec): void`

Static functions, called as `ErosionSeason.name(...)`:

- `Reset(): void`

Constructors: `ErosionSeason.new()`.

Static fields (a copy of the value taken when the class is exposed): `NUM_SEASONS: int`, `SEASON_AUTUMN: int`, `SEASON_DEFAULT: int`, `SEASON_SPRING: int`, `SEASON_SUMMER: int`, `SEASON_SUMMER2: int`, `SEASON_WINTER: int`.

### CGlobalObject

`zombie.globalObjects.CGlobalObject`, class. Extends `GlobalObject`.

Methods, called as `obj:name(...)`:

- `Reset(): void` from `GlobalObject`
- `destroyThisObject(): void` from `GlobalObject`
- `getIsoObject(): IsoObject` from `GlobalObject`
- `getModData(): KahluaTable` from `GlobalObject`
- `getSquare(): IsoGridSquare` from `GlobalObject`
- `getSystem(): GlobalObjectSystem` from `GlobalObject`
- `getX(): int` from `GlobalObject`
- `getY(): int` from `GlobalObject`
- `getZ(): int` from `GlobalObject`
- `isValidIsoObject(IsoObject obj): boolean` from `GlobalObject`
- `setLocation(int x, int y, int z): void` from `GlobalObject`

### CGlobalObjects

`zombie.globalObjects.CGlobalObjects`, class.

Static functions, called as `CGlobalObjects.name(...)`:

- `Reset(): void`
- `getSystemByIndex(int index): CGlobalObjectSystem`
- `getSystemByName(String name): CGlobalObjectSystem`
- `getSystemCount(): int`
- `initSystems(): void`
- `loadInitialState(ByteBufferReader bb): void`
- `newSystem(String name): CGlobalObjectSystem`
- `noise(String message): void`
- `receiveServerCommand(String systemName, String command, KahluaTable args): boolean`
- `registerSystem(String name): CGlobalObjectSystem`

Constructors: `CGlobalObjects.new()`.

### CGlobalObjectSystem

`zombie.globalObjects.CGlobalObjectSystem`, class. Extends `GlobalObjectSystem`.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `allocList(): ArrayList<GlobalObject>` from `GlobalObjectSystem`
- `finishedWithList(ArrayList<GlobalObject> list): void` from `GlobalObjectSystem`
- `getModData(): KahluaTable` from `GlobalObjectSystem`
- `getName(): String` from `GlobalObjectSystem`
- `getObjectAt(int x, int y, int z): GlobalObject` from `GlobalObjectSystem`
- `getObjectAt(IsoGridSquare sq): GlobalObject` from `GlobalObjectSystem`
- `getObjectByIndex(int index): GlobalObject` from `GlobalObjectSystem`
- `getObjectCount(): int` from `GlobalObjectSystem`
- `getObjectsAdjacentTo(int x, int y, int z): ArrayList<GlobalObject>` from `GlobalObjectSystem`
- `getObjectsInChunk(int wx, int wy): ArrayList<GlobalObject>` from `GlobalObjectSystem`
- `hasObjectsInChunk(int wx, int wy): boolean` from `GlobalObjectSystem`
- `newObject(int x, int y, int z): GlobalObject` from `GlobalObjectSystem`
- `receiveNewLuaObjectAt(int x, int y, int z, KahluaTable args): void`
- `receiveRemoveLuaObjectAt(int x, int y, int z): void`
- `receiveServerCommand(String command, KahluaTable args): void`
- `receiveUpdateLuaObjectAt(int x, int y, int z, KahluaTable args): void`
- `removeObject(GlobalObject object): void` from `GlobalObjectSystem`
- `sendCommand(String command, IsoPlayer player, KahluaTable args): void`

Constructors: `CGlobalObjectSystem.new(String name)`.

### SGlobalObject

`zombie.globalObjects.SGlobalObject`, class. Extends `GlobalObject`.

Methods, called as `obj:name(...)`:

- `Reset(): void` from `GlobalObject`
- `destroyThisObject(): void` from `GlobalObject`
- `getIsoObject(): IsoObject` from `GlobalObject`
- `getModData(): KahluaTable` from `GlobalObject`
- `getSquare(): IsoGridSquare` from `GlobalObject`
- `getSystem(): GlobalObjectSystem` from `GlobalObject`
- `getX(): int` from `GlobalObject`
- `getY(): int` from `GlobalObject`
- `getZ(): int` from `GlobalObject`
- `isValidIsoObject(IsoObject obj): boolean` from `GlobalObject`
- `load(ByteBuffer bb, int worldVersion): void`
- `save(ByteBuffer bb): void`
- `setLocation(int x, int y, int z): void` from `GlobalObject`

### SGlobalObjects

`zombie.globalObjects.SGlobalObjects`, class.

Static functions, called as `SGlobalObjects.name(...)`:

- `OnIsoObjectChangedItself(String systemName, IsoObject isoObject): void`
- `OnModDataChangeItself(String systemName, IsoObject isoObject): void`
- `Reset(): void`
- `chunkLoaded(int wx, int wy): void`
- `getSystemByIndex(int index): SGlobalObjectSystem`
- `getSystemByName(String name): SGlobalObjectSystem`
- `getSystemCount(): int`
- `initSystems(): void`
- `load(): void`
- `newSystem(String name): SGlobalObjectSystem`
- `noise(String message): void`
- `receiveClientCommand(String systemName, String command, IsoPlayer playerObj, KahluaTable args): boolean`
- `registerSystem(String name): SGlobalObjectSystem`
- `save(): void`
- `saveInitialStateForClient(ByteBufferWriter bb): void`
- `update(): void`

Constructors: `SGlobalObjects.new()`.

### SGlobalObjectSystem

`zombie.globalObjects.SGlobalObjectSystem`, class. Extends `GlobalObjectSystem`.

Methods, called as `obj:name(...)`:

- `OnIsoObjectChangedItself(IsoObject isoObject): void`
- `OnModDataChangeItself(IsoObject isoObject): void`
- `Reset(): void`
- `addGlobalObjectOnClient(SGlobalObject globalObject): void`
- `allocList(): ArrayList<GlobalObject>` from `GlobalObjectSystem`
- `chunkLoaded(int wx, int wy): void`
- `finishedWithList(ArrayList<GlobalObject> list): void` from `GlobalObjectSystem`
- `getInitialStateForClient(): KahluaTable`
- `getModData(): KahluaTable` from `GlobalObjectSystem`
- `getName(): String` from `GlobalObjectSystem`
- `getObjectAt(int x, int y, int z): GlobalObject` from `GlobalObjectSystem`
- `getObjectAt(IsoGridSquare sq): GlobalObject` from `GlobalObjectSystem`
- `getObjectByIndex(int index): GlobalObject` from `GlobalObjectSystem`
- `getObjectCount(): int` from `GlobalObjectSystem`
- `getObjectsAdjacentTo(int x, int y, int z): ArrayList<GlobalObject>` from `GlobalObjectSystem`
- `getObjectsInChunk(int wx, int wy): ArrayList<GlobalObject>` from `GlobalObjectSystem`
- `hasObjectsInChunk(int wx, int wy): boolean` from `GlobalObjectSystem`
- `load(): void`
- `load(ByteBuffer bb, int worldVersion): void`
- `loadedWorldVersion(): int`
- `newObject(int x, int y, int z): GlobalObject` from `GlobalObjectSystem`
- `receiveClientCommand(String command, IsoPlayer playerObj, KahluaTable args): void`
- `removeGlobalObjectOnClient(SGlobalObject globalObject): void`
- `removeObject(GlobalObject object): void` from `GlobalObjectSystem`
- `save(): void`
- `save(ByteBuffer bb): void`
- `sendCommand(String command, KahluaTable args): void`
- `setModDataKeys(KahluaTable keys): void`
- `setObjectModDataKeys(KahluaTable keys): void`
- `setObjectSyncKeys(KahluaTable keys): void`
- `update(): void`
- `updateGlobalObjectOnClient(SGlobalObject globalObject): void`

Constructors: `SGlobalObjectSystem.new(String name)`.

### DesignationZone

`zombie.iso.areas.DesignationZone`, class.

Methods, called as `obj:name(...)`:

- `check(): void`
- `doMeta(int hours): void`
- `getH(): int`
- `getId(): Double`
- `getName(): String`
- `getRandomFreeSquare(): IsoGridSquare`
- `getRandomSquare(): IsoGridSquare`
- `getW(): int`
- `getX(): int`
- `getY(): int`
- `getZ(): int`
- `isFullyStreamed(): boolean`
- `isStillStreamed(): boolean`
- `loading(): void`
- `save(ByteBuffer output): void`
- `setName(String name): void`
- `unloading(): void`

Static functions, called as `DesignationZone.name(...)`:

- `Reset(): void`
- `addZone(String type, String name, int x, int y, int z, int x2, int y2): DesignationZone`
- `getAllZonesByType(String type): ArrayList<DesignationZone>`
- `getZone(int x, int y, int z): DesignationZone`
- `getZoneById(Double id): DesignationZone`
- `getZoneByName(String name): DesignationZone`
- `getZoneByNameAndType(String type, String name): DesignationZone`
- `getZoneByType(String type, int x, int y, int z): DesignationZone`
- `load(ByteBuffer input, int worldVersion): DesignationZone`
- `removeZone(String type, String name): void`
- `removeZone(DesignationZone zone, boolean doSync): void`
- `update(): void`

Constructors: `DesignationZone.new()`, `DesignationZone.new(String type, String name, int x, int y, int z, int x2, int y2, boolean doSync)`.

Static fields (a copy of the value taken when the class is exposed): `allZones: ArrayList<DesignationZone>`, `lastUpdate: long`.

### DesignationZoneAnimal

`zombie.iso.areas.DesignationZoneAnimal`, class. Extends [DesignationZone](#designationzone). Also has the methods of [DesignationZone](#designationzone) (26), listed on their own entries.

Methods, called as `obj:name(...)`:

- `addAnimal(IsoAnimal animal): void`
- `addCorpse(IsoDeadBody corpse): void`
- `addFoodOnGround(IsoWorldInventoryObject item): void`
- `check(): void`
- `createSurroundingFence(): void`
- `doMeta(int hours): void`
- `getAnimals(): ArrayList<IsoAnimal>`
- `getAnimalsConnected(): ArrayList<IsoAnimal>`
- `getCorpses(): ArrayList<IsoDeadBody>`
- `getCorpsesConnected(): ArrayList<IsoDeadBody>`
- `getFoodOnGround(): ArrayList<IsoWorldInventoryObject>`
- `getFoodOnGroundConnected(): ArrayList<IsoWorldInventoryObject>`
- `getFullZoneSize(): int`
- `getHutchs(): ArrayList<IsoHutch>`
- `getHutchsConnected(): ArrayList<IsoHutch>`
- `getNbOfDung(): int`
- `getNbOfFeather(): int`
- `getNearWaterSquaresConnected(): ArrayList<IsoGridSquare>`
- `getRoofAreas(): ArrayList<Position3D>`
- `getRoofAreasConnected(): ArrayList<Position3D>`
- `getTroughs(): ArrayList<IsoFeedingTrough>`
- `getTroughsConnected(): ArrayList<IsoFeedingTrough>`
- `removeAnimal(IsoAnimal animal): void`
- `removeCorpse(IsoDeadBody corpse): void`

Static functions, called as `DesignationZoneAnimal.name(...)`:

- `Reset(): void`
- `addItemOnGround(IsoWorldInventoryObject item, IsoGridSquare sq): void`
- `addNewRoof(int x, int y, int z): void`
- `getAllDZones(ArrayList<DesignationZoneAnimal> currentList, DesignationZoneAnimal zone, DesignationZoneAnimal previousZone): ArrayList<DesignationZoneAnimal>`
- `getAllZones(): ArrayList<DesignationZoneAnimal>`
- `getType(): String`
- `getZone(int x, int y): DesignationZoneAnimal`
- `getZone(int x, int y, int z): DesignationZoneAnimal`
- `getZoneById(double zoneID): DesignationZoneAnimal`
- `getZoneF(float x, float y, float z): DesignationZoneAnimal`
- `isItemDung(IsoWorldInventoryObject item): boolean`
- `isItemFeather(IsoWorldInventoryObject item): boolean`
- `isItemFood(IsoWorldInventoryObject item): boolean`
- `removeItemFromGround(IsoWorldInventoryObject item): void`
- `removeZone(DesignationZoneAnimal zone, boolean doSync): void`

Constructors: `DesignationZoneAnimal.new(String name, int x, int y, int z, int x2, int y2, boolean doSync)`.

Static fields (a copy of the value taken when the class is exposed): `FENCE_NORTH: String`, `FENCE_NORTHCORNER: String`, `FENCE_WEST: String`, `ZONE_COLOR_B: float`, `ZONE_COLOR_G: float`, `ZONE_COLOR_R: float`, `ZONE_SELECTED_COLOR_B: float`, `ZONE_SELECTED_COLOR_G: float`, `ZONE_SELECTED_COLOR_R: float`, `ZONE_TYPE: String`, `allZones: ArrayList<DesignationZone>`, `designationAnimalZoneList: ArrayList<DesignationZoneAnimal>`, `lastUpdate: long`.

### IsoBuilding

`zombie.iso.areas.IsoBuilding`, class.

Methods, called as `obj:name(...)`:

- `AddRoom(IsoRoom room): void`
- `CalculateExits(): void`
- `CalculateWindows(): void`
- `ContainsAllItems(Stack<String> items): boolean`
- `CreateFrom(BuildingDef building, IsoMetaCell metaCell): void`
- `FillContainers(): void`
- `ScoreBuildingPersonSpecific(SurvivorDesc desc, boolean bFarGood): float`
- `TriggerAlarm(): void`
- `addDoor(IsoDoor obj, boolean bOtherTile): void`
- `addDoor(IsoDoor obj, boolean bOtherTile, IsoGridSquare from, IsoBuilding building): void`
- `addWindow(IsoWindow obj, boolean bOtherTile): void`
- `addWindow(IsoWindow obj, boolean bOtherTile, IsoGridSquare from, IsoBuilding building): void`
- `containsRoom(String room): boolean`
- `forceAwake(): void`
- `getContainerWith(ItemType itemType): ItemContainer`
- `getDef(): BuildingDef`
- `getFreeTile(): IsoGridSquare`
- `getID(): int`
- `getRandomContainer(String type): ItemContainer`
- `getRandomContainerSingle(String type): ItemContainer`
- `getRandomFirstFloorWindow(): IsoWindow`
- `getRandomRoom(): IsoRoom`
- `getRandomRoom(String room): IsoRoom`
- `getRandomRoomExcluding(List<String> badRooms): IsoRoom`
- `getRoomsNumber(): int`
- `hasBasement(): boolean`
- `hasRoom(String room): boolean`
- `hasWater(): boolean`
- `isAllExplored(): boolean`
- `isEntirelyEmptyOutside(): boolean`
- `isResidential(): boolean`
- `isToxic(): boolean`
- `setAllExplored(boolean b): void`
- `setAllExplored(boolean b, IsoRoom exception): void`
- `setToxic(boolean isToxic): void`
- `update(): void`

Constructors: `IsoBuilding.new()`, `IsoBuilding.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `goodBuildingScore: float`, `idCount: int`, `poorBuildingScore: float`.

### DataCell

`zombie.iso.areas.isoregion.data.DataCell`, class.

No methods of its own beyond those every Java object has.

### DataChunk

`zombie.iso.areas.isoregion.data.DataChunk`, class.

Methods, called as `obj:name(...)`:

- `getCellX(): int`
- `getCellY(): int`
- `getChunkX(): int`
- `getChunkY(): int`
- `getIsoChunkRegion(int x, int y, int z): IsoChunkRegion`
- `getLastUpdateStamp(): long`
- `getSquare(int x, int y, int z): byte`
- `getSquare(int x, int y, int z, boolean ignoreCoordCheck): byte`
- `load(ByteBuffer bb, int worldVersion, boolean readLength): void`
- `save(ByteBuffer bb): void`
- `selectedHasFlags(byte flags): boolean`
- `setDirtyAllActive(): void`
- `setLastUpdateStamp(long lastUpdateStamp): void`
- `setRegion(int x, int y, int z, byte regionIndex): void`
- `setSelectedFlags(int x, int y, int z): void`
- `squareGetFlags(int x, int y, int z): byte`

### IsoRegionLogType

`zombie.iso.areas.isoregion.IsoRegionLogType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `IsoRegionLogType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): IsoRegionLogType`
- `values(): IsoRegionLogType[]`

Enum values (read as `IsoRegionLogType.VALUE`): `Normal`, `Warn`.

### IsoRegions

`zombie.iso.areas.isoregion.IsoRegions`, class.

Static functions, called as `IsoRegions.name(...)`:

- `GetOppositeDir(byte dir): byte`
- `ResetAllDataDebug(): void`
- `getChunkFile(int chunkX, int chunkY): File`
- `getChunkRegion(int x, int y, int z): IChunkRegion`
- `getDataChunk(int chunkx, int chunky): DataChunk`
- `getDirectory(): File`
- `getHeaderFile(): File`
- `getIsoWorldRegion(int x, int y, int z): IWorldRegion`
- `getIsoWorldRegionsInCell(int cellX, int cellY, ArrayList<IsoWorldRegion> worldRegions): List<IsoWorldRegion>`
- `getLogger(): IsoRegionsLogger`
- `getSquareFlags(int x, int y, int z): byte`
- `hash(int x, int y): int`
- `init(): void`
- `isDebugLoadAllChunks(): boolean`
- `log(String str): void`
- `log(String str, Color col): void`
- `receiveClientRequestFullDataChunks(ByteBufferReader input, UdpConnection conn): void`
- `receiveServerUpdatePacket(ByteBufferReader input): void`
- `reset(): void`
- `setDebugLoadAllChunks(boolean b): void`
- `setPreviousFlags(IsoGridSquare gs): void`
- `squareChanged(IsoGridSquare gs): void`
- `squareChanged(IsoGridSquare gs, boolean isRemoval): void`
- `update(): void`
- `warn(String str): void`

Constructors: `IsoRegions.new()`.

Static fields (a copy of the value taken when the class is exposed): `BIT_EMPTY: byte`, `BIT_HAS_FLOOR: byte`, `BIT_HAS_ROOF: byte`, `BIT_PATH_WALL_N: byte`, `BIT_PATH_WALL_W: byte`, `BIT_STAIRCASE: byte`, `BIT_WALL_N: byte`, `BIT_WALL_W: byte`, `CELL_CHUNK_DIM: int`, `CELL_DIM: int`, `CHUNKS_DATA_PACKET_SIZE: int`, `CHUNK_DIM: int`, `CHUNK_MAX_Z: int`, `DIR_2D_MAX: byte`, `DIR_2D_NW: byte`, `DIR_BOT: byte`, `DIR_E: byte`, `DIR_MAX: byte`, `DIR_N: byte`, `DIR_NONE: byte`, `DIR_S: byte`, `DIR_TOP: byte`, `DIR_W: byte`, `FILE_DIR: String`, `FILE_EXT: String`, `FILE_PRE: String`, `FILE_SEP: String`, `SINGLE_CHUNK_PACKET_SIZE: int`, `printD: boolean`.

### IsoRegionsLogger

`zombie.iso.areas.isoregion.IsoRegionsLogger`, class.

Methods, called as `obj:name(...)`:

- `getLogs(): ArrayList<IsoRegionsLogger.IsoRegionLog>`
- `isDirtyUI(): boolean`
- `unsetDirtyUI(): void`

Constructors: `IsoRegionsLogger.new(boolean doConsolePrint)`.

### IsoRegionsLogger.IsoRegionLog

`zombie.iso.areas.isoregion.IsoRegionsLogger.IsoRegionLog`, class.

Methods, called as `obj:name(...)`:

- `getColor(): Color`
- `getStr(): String`
- `getType(): IsoRegionLogType`

Constructors: `IsoRegionsLogger.IsoRegionLog.new()`.

### IsoRegionsRenderer

`zombie.iso.areas.isoregion.IsoRegionsRenderer`, class.

Methods, called as `obj:name(...)`:

- `editRotate(): void`
- `getActiveEditKind(): String`
- `getBoolean(String name): boolean`
- `getChunkRegion(int x, int y): IsoChunkRegion`
- `getEditOptionByIndex(int index): ConfigOption`
- `getEditOptionByName(String name): ConfigOption`
- `getEditOptionCount(): int`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `getZLevel(): int`
- `getZLevelOptionByIndex(int index): ConfigOption`
- `getZLevelOptionByName(String name): ConfigOption`
- `getZLevelOptionCount(): int`
- `hasChunkRegion(int x, int y): boolean`
- `isEditingEnabled(): boolean`
- `isHasSelected(): boolean`
- `load(): void`
- `outlineRect(float x, float y, float w, float h, float r, float g, float b, float a): void`
- `recalcSurroundings(): void`
- `render(UIElement ui, float zoom, float xPos, float yPos): void`
- `renderCellInfo(int cellX, int cellY, int effectivePopulation, int targetPopulation, float lastRepopTime): void`
- `renderEntity(float size, float x, float y, float r, float g, float b, float a): void`
- `renderLine(float x1, float y1, float x2, float y2, float r, float g, float b, float a): void`
- `renderRect(float x, float y, float w, float h, float r, float g, float b, float a): void`
- `renderSquare(float x, float y, float r, float g, float b, float alpha): void`
- `renderString(float x, float y, String str, double r, double g, double b, double a): void`
- `renderStringUI(float x, float y, String str, double r, double g, double b, double a): void`
- `renderStringUI(float x, float y, String str, Color c): void`
- `renderZombie(float x, float y, float r, float g, float b): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setEditOption(int index, boolean b): void`
- `setEditSquareCoord(int x, int y): void`
- `setSelected(int x, int y): void`
- `setSelectedWorld(int x, int y): void`
- `setZLevelOption(int index, boolean b): void`
- `uiToWorldX(float x): float`
- `uiToWorldY(float y): float`
- `unsetSelected(): void`
- `worldToScreenX(float x): float`
- `worldToScreenY(float y): float`

Constructors: `IsoRegionsRenderer.new()`.

### IsoRegionsRenderer.BooleanDebugOption

`zombie.iso.areas.isoregion.IsoRegionsRenderer.BooleanDebugOption`, class. Extends [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption). Also has the methods of [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption) (13), [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getIndex(): int`

Constructors: `IsoRegionsRenderer.BooleanDebugOption.new(ArrayList<ConfigOption> optionList, String name, boolean defaultValue)`, `IsoRegionsRenderer.BooleanDebugOption.new(ArrayList<ConfigOption> optionList, String name, boolean defaultValue, int zLevel)`.

### IsoChunkRegion

`zombie.iso.areas.isoregion.regions.IsoChunkRegion`, class.

Methods, called as `obj:name(...)`:

- `addChunkBorderSquaresCnt(): void`
- `addConnectedNeighbor(IsoChunkRegion neighbor): void`
- `addNeighbor(IsoChunkRegion neighbor): void`
- `addRoof(): void`
- `addSquareCount(): void`
- `containsConnectedNeighbor(IsoChunkRegion n): boolean`
- `containsConnectedNeighborID(int id): boolean`
- `getChunkBorderSquaresCnt(): int`
- `getColor(): Color`
- `getConnectedNeighborWithLargestIsoWorldRegion(): IsoChunkRegion`
- `getConnectedNeighbors(): List<IsoChunkRegion>`
- `getDataChunk(): DataChunk`
- `getDebugConnectedNeighborCopy(): ArrayList<IsoChunkRegion>`
- `getID(): int`
- `getIsEnclosed(): boolean`
- `getIsoWorldRegion(): IsoWorldRegion`
- `getNeighborCount(): int`
- `getRoofCnt(): int`
- `getSquareSize(): int`
- `getzLayer(): int`
- `resetRoofCnt(): void`
- `setEnclosed(byte dir, boolean b): void`
- `setIsoWorldRegion(IsoWorldRegion mr): void`
- `unlinkFromIsoWorldRegion(): IsoWorldRegion`

### IsoWorldRegion

`zombie.iso.areas.isoregion.regions.IsoWorldRegion`, class.

Methods, called as `obj:name(...)`:

- `addIsoChunkRegion(IsoChunkRegion region): void`
- `clearBuildingDef(ArrayList<IsoGameCharacter.Location> changedCells): void`
- `containsIsoChunkRegion(IsoChunkRegion region): boolean`
- `getBuildingDef(): BuildingDef`
- `getCellX(): int`
- `getCellY(): int`
- `getChunkRegions(): List<IsoChunkRegion>`
- `getColor(): Color`
- `getDebugConnectedNeighborCopy(): ArrayList<IsoWorldRegion>`
- `getDebugIsoChunkRegionCopy(): ArrayList<IsoChunkRegion>`
- `getID(): int`
- `getNeighbors(): ArrayList<IsoWorldRegion>`
- `getRoofCnt(): int`
- `getRoofedPercentage(): float`
- `getSquareSize(): int`
- `isEnclosed(): boolean`
- `isFogMask(): boolean`
- `isFullyRoofed(): boolean`
- `isPlayerRoom(): boolean`
- `linkNeighbors(): void`
- `merge(IsoWorldRegion other): void`
- `setBuildingDef(BuildingDef buildingDef): void`
- `size(): int`
- `swapIsoChunkRegions(ArrayList<IsoChunkRegion> newlist): ArrayList<IsoChunkRegion>`
- `unlinkNeighbors(): void`

### IsoRoom

`zombie.iso.areas.IsoRoom`, class.

Methods, called as `obj:name(...)`:

- `CreateBuilding(IsoCell cell): IsoBuilding`
- `add2TileBench(String bench, String sprite1, String sprite2, String sprite3, String sprite4, boolean both): boolean`
- `addMetalWorkbench(): boolean`
- `addModernPotteryWheel(): boolean`
- `addOldPotteryWheel(): boolean`
- `addPotteryWheel(): boolean`
- `addSquare(IsoGridSquare sq): void`
- `clear(boolean bLoading): void`
- `createLights(boolean active): void`
- `findRoomLightByID(int id): IsoRoomLight`
- `getBuilding(): IsoBuilding`
- `getContainer(): ArrayList<ItemContainer>`
- `getFreeTile(): IsoGridSquare`
- `getLightSwitches(): ArrayList<IsoLightSwitch>`
- `getName(): String`
- `getRandomDoorAndWallFreeSquare(): IsoGridSquare`
- `getRandomDoorFreeSquare(): IsoGridSquare`
- `getRandomFreeSquare(): IsoGridSquare`
- `getRandomSquare(): IsoGridSquare`
- `getRandomWallFreePairSquare(IsoDirections dir, boolean both): IsoGridSquare`
- `getRandomWallFreeSquare(): IsoGridSquare`
- `getRandomWallSquare(): IsoGridSquare`
- `getRectsBounds(): Rectangle`
- `getRoomDef(): RoomDef`
- `getSquares(): ArrayList<IsoGridSquare>`
- `getTileList(): Vector<IsoGridSquare>`
- `getWaterSources(): ArrayList<IsoObject>`
- `getWindows(): ArrayList<IsoWindow>`
- `hasLightSwitches(): boolean`
- `hasWater(): boolean`
- `isDerelict(): boolean`
- `isInside(int x, int y, int z): boolean`
- `isRural(): boolean`
- `isShop(): boolean`
- `onSee(): void`
- `refreshSquares(): void`
- `removeSquare(IsoGridSquare sq): void`
- `setWaterSources(ArrayList<IsoObject> waterSources): void`
- `spawnRandom2TileWorkstation(): boolean`
- `spawnRandomWorkstation(): boolean`
- `spawnZombies(): void`
- `useWater(): void`

Constructors: `IsoRoom.new()`.

Static fields (a copy of the value taken when the class is exposed): `MAXIMUM_DAYS: int`.

### NonPvpZone

`zombie.iso.areas.NonPvpZone`, class.

Methods, called as `obj:name(...)`:

- `getSize(): int`
- `getTitle(): String`
- `getX(): int`
- `getX2(): int`
- `getY(): int`
- `getY2(): int`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`
- `setSize(int size): void`
- `setTitle(String title): void`
- `setX(int x): void`
- `setX2(int x2): void`
- `setY(int y): void`
- `setY2(int y2): void`
- `syncNonPvpZone(boolean remove): void`

Static functions, called as `NonPvpZone.name(...)`:

- `addNonPvpZone(String title, int x, int y, int x2, int y2): NonPvpZone`
- `getAllZones(): ArrayList<NonPvpZone>`
- `getNonPvpZone(int x, int y): NonPvpZone`
- `getZoneByTitle(String title): NonPvpZone`
- `isInNonPvpZone(IsoPlayer player): boolean`
- `removeNonPvpZone(String title): void`

Constructors: `NonPvpZone.new()`, `NonPvpZone.new(String title, int x, int y, int x2, int y2)`.

Static fields (a copy of the value taken when the class is exposed): `nonPvpZoneList: ArrayList<NonPvpZone>`.

### SafeHouse

`zombie.iso.areas.SafeHouse`, class. Extends `Invite`.

Methods, called as `obj:name(...)`:

- `addInvite(String invited): void` from `Invite`
- `addPlayer(String player): void`
- `alreadyHaveSafehouse(String username): SafeHouse`
- `alreadyHaveSafehouse(IsoPlayer player): SafeHouse`
- `checkTrespass(IsoPlayer player): void`
- `containsLocation(float x, float y): boolean`
- `getDatetimeCreated(): long`
- `getDatetimeCreatedStr(): String`
- `getH(): int`
- `getHitPoints(): int`
- `getId(): String`
- `getLastVisited(): long`
- `getLocation(): String`
- `getOnlineID(): int`
- `getOpenTimer(): int`
- `getOwner(): String`
- `getPlayerConnected(): int`
- `getPlayers(): ArrayList<String>`
- `getPlayersRespawn(): ArrayList<String>`
- `getTitle(): String`
- `getW(): int`
- `getX(): int`
- `getX2(): int`
- `getY(): int`
- `getY2(): int`
- `hasInvite(String player): boolean` from `Invite`
- `isOwner(String username): boolean`
- `isOwner(IsoPlayer player): boolean`
- `isRespawnInSafehouse(String username): boolean`
- `playerAllowed(String name): boolean`
- `playerAllowed(IsoPlayer player): boolean`
- `removeInvite(String player): void` from `Invite`
- `removePlayer(String player): void`
- `save(ByteBuffer output): void`
- `setDatetimeCreated(long datetimeCreated): void`
- `setH(int h): void`
- `setHitPoints(int hitPoints): void`
- `setLastVisited(long lastVisited): void`
- `setLocation(String location): void`
- `setOnlineID(int value): void`
- `setOpenTimer(int openTimer): void`
- `setOwner(String owner): void`
- `setPlayerConnected(int playerConnected): void`
- `setPlayers(ArrayList<String> players): void`
- `setRespawnInSafehouse(boolean b, String username): void`
- `setTitle(String title): void`
- `setW(int w): void`
- `setX(int x): void`
- `setY(int y): void`
- `updatePlayersConnected(): void`

Static functions, called as `SafeHouse.name(...)`:

- `addSafeHouse(int x, int y, int w, int h, String player): SafeHouse`
- `addSafeHouse(IsoGridSquare square, IsoPlayer player): SafeHouse`
- `allowSafeHouse(IsoPlayer player): boolean`
- `canBeSafehouse(IsoGridSquare clickedSquare, IsoPlayer player): String`
- `clearSafehouseList(): void`
- `getOnlineID(int x, int y): int`
- `getSafeHouse(int onlineID): SafeHouse`
- `getSafeHouse(int x, int y, int w, int h): SafeHouse`
- `getSafeHouse(String title): SafeHouse`
- `getSafeHouse(IsoGridSquare square): SafeHouse`
- `getSafehouseByOwner(String username): SafeHouse`
- `getSafehouseList(): ArrayList<SafeHouse>`
- `getSafehouseOverlapping(int x1, int y1, int x2, int y2): SafeHouse`
- `getSafehouseOverlapping(int x1, int y1, int x2, int y2, SafeHouse ignore): SafeHouse`
- `hasNotSurvivedEnoughToClaim(IsoPlayer player): boolean`
- `hasSafehouse(String username): SafeHouse`
- `hasSafehouse(IsoPlayer player): SafeHouse`
- `hitPoint(int onlineID): void`
- `init(): void`
- `intersects(int startX, int startY, int endX, int endY): boolean`
- `isInSameSafehouse(String player1, String player2): boolean`
- `isPlayerAllowedOnSquare(IsoPlayer player, IsoGridSquare sq): boolean`
- `isSafeHouse(IsoGridSquare square, String username, boolean doDisableSafehouse): SafeHouse`
- `isSafehouseAllowClaimWar(SafeHouse safehouse, IsoPlayer player): boolean`
- `isSafehouseAllowInteract(IsoGridSquare square, IsoPlayer player): boolean`
- `isSafehouseAllowLoot(IsoGridSquare square, IsoPlayer player): boolean`
- `isSafehouseAllowTrepass(IsoGridSquare square, IsoPlayer player): boolean`
- `kickUserFromSafehouse(SafeHouse safeHouse, String username): void`
- `load(ByteBuffer bb, int worldVersion): SafeHouse`
- `removeSafeHouse(SafeHouse safeHouse): void`
- `update(): void`
- `updateSafehousePlayersConnected(): void`

Constructors: `SafeHouse.new(int x, int y, int w, int h, String player)`.

### BentFences

`zombie.iso.BentFences`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `addFenceTiles(int version, KahluaTableImpl tiles): void`
- `bendFence(IsoObject obj, IsoDirections dir): void`
- `checkCanCollapse(IsoObject obj, IsoDirections dir, BentFences.Entry entry): boolean`
- `checkDamageHoppableFence(IsoMovingObject thumper, IsoGridSquare sq, IsoGridSquare oppositeSq): void`
- `collapse(IsoObject obj, IsoDirections dir, BentFences.Entry entry, int index): void`
- `getCollapsedFence(IsoGridSquare square): IsoObject`
- `getThumpData(IsoObject obj): BentFences.ThumpData`
- `getThumpData(IsoObject obj, BentFences.Entry entry): BentFences.ThumpData`
- `isBendableFence(IsoObject obj): boolean`
- `isBentObject(IsoObject obj): boolean`
- `isEnabled(): boolean`
- `isUnbentObject(IsoObject obj): boolean`
- `isUnbentObject(IsoObject obj, GridSquareEdgeFacingDirection facingDirection): boolean`
- `removeCollapsedTiles(IsoObject obj, IsoDirections dir, BentFences.Entry entry, int index): void`
- `resetFence(IsoObject obj): void`
- `smashFence(IsoObject obj, IsoDirections dir): void`
- `smashFence(IsoObject obj, IsoDirections dir, int index): void`
- `swapTiles(IsoObject obj, IsoDirections dir, boolean bending): void`
- `swapTiles(IsoObject obj, IsoDirections dir, boolean bending, int forceStage): void`
- `unbendFence(IsoObject obj): void`

Static functions, called as `BentFences.name(...)`:

- `getInstance(): BentFences`
- `init(): void`

Constructors: `BentFences.new()`.

### BrokenFences

`zombie.iso.BrokenFences`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `addBrokenTiles(KahluaTableImpl tiles): void`
- `addDebrisTiles(KahluaTableImpl tiles): void`
- `addItems(IsoObject obj, IsoGridSquare square): void`
- `destroyFence(IsoObject obj, IsoDirections dir): void`
- `getBreakableObject(IsoGridSquare square, boolean north): IsoObject`
- `isBreakableObject(IsoObject obj): boolean`
- `isBreakableSprite(String spriteName): boolean`
- `setDamagedLeft(IsoObject obj): void`
- `setDamagedRight(IsoObject obj): void`
- `setDestroyed(IsoObject obj): void`
- `updateSprite(IsoObject obj, boolean brokenLeft, boolean brokenRight): void`

Static functions, called as `BrokenFences.name(...)`:

- `getInstance(): BrokenFences`

Constructors: `BrokenFences.new()`.

### BuildingDef

`zombie.iso.BuildingDef`, class.

Methods, called as `obj:name(...)`:

- `CalculateBounds(ArrayList<RoomDef> tempRooms): void`
- `Dispose(): void`
- `addRoomToCollapseRect(RoomDef room): void`
- `addRoomsOf(BuildingDef sourceDef, ArrayList<RoomDef> tempRooms): void`
- `calculateCollapseRect(): void`
- `calculateMetaID(int cellX, int cellY): long`
- `containsRoom(String name): boolean`
- `containsXYZ(int x, int y, int z): boolean`
- `getArea(): int`
- `getCellX(): int`
- `getCellX2(): int`
- `getCellY(): int`
- `getCellY2(): int`
- `getChunkX(): int`
- `getChunkY(): int`
- `getClosestPoint(float x, float y, Vector2f closestXY): float`
- `getEmptyOutside(): ArrayList<RoomDef>`
- `getFirstRoom(): RoomDef`
- `getFreeSquareInRoom(): IsoGridSquare`
- `getH(): int`
- `getID(): long`
- `getIDString(): String`
- `getKeyId(): int`
- `getKeySpawned(): int`
- `getMaxLevel(): int`
- `getMinLevel(): int`
- `getObjects(): List<IsoObject>`
- `getRandomRoom(): RoomDef`
- `getRandomRoom(int minArea): RoomDef`
- `getRandomRoom(int minArea, boolean noKids): RoomDef`
- `getRoofRoomID(int level): long`
- `getRoom(String roomName): RoomDef`
- `getRoom(String roomName, boolean noKids): RoomDef`
- `getRooms(): ArrayList<RoomDef>`
- `getRoomsNumber(): int`
- `getSquares(): List<IsoGridSquare>`
- `getTable(): KahluaTable`
- `getW(): int`
- `getX(): int`
- `getX2(): int`
- `getY(): int`
- `getY2(): int`
- `getZone(): Zone`
- `intersects(int x, int y, int w, int h, int z): boolean`
- `invalidateOverlappedChunkLevelsAbove(int playerIndex, int minLevel, long dirtyFlags): void`
- `isAdjacent(int x, int y, int w, int h, int z): boolean`
- `isAdjacent(BuildingDef other): boolean`
- `isAdjacent(BuildingDef other, boolean bIgnoreZ): boolean`
- `isAlarmed(): boolean`
- `isAllExplored(): boolean`
- `isAnyChunkNewlyLoaded(): boolean`
- `isBasement(): boolean`
- `isEntirelyEmptyOutside(): boolean`
- `isFullyStreamedIn(): boolean`
- `isHasBeenVisited(): boolean`
- `isResidential(): boolean`
- `isRural(): boolean`
- `isShop(): boolean`
- `isUserDefined(): boolean`
- `overlaps(BuildingDef other, boolean bIgnoreZ): boolean`
- `overlapsChunk(int wx, int wy): boolean`
- `recalculate(): void`
- `refreshSquares(): void`
- `resetMinMaxLevel(): void`
- `setAlarmed(boolean alarm): void`
- `setAllExplored(boolean b): void`
- `setHasBeenVisited(boolean hasBeenVisited): void`
- `setInvalidateCacheForAllChunks(int playerIndex, long dirtyFlags): void`
- `setKeyId(int keyId): void`
- `setKeySpawned(int keySpawned): void`
- `setUserDefined(boolean b): void`

Constructors: `BuildingDef.new()`, `BuildingDef.new(boolean userDefined)`.

### ContainerOverlays

`zombie.iso.ContainerOverlays`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `addOverlays(KahluaTableImpl overlayMap): void`
- `getUnderlyingSpriteNames(String overlayName): ArrayList<String>`
- `hasOverlays(IsoObject obj): boolean`
- `updateContainerOverlaySprite(IsoObject obj): void`

Constructors: `ContainerOverlays.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: ContainerOverlays`.

### FBORenderChunk

`zombie.iso.fboRenderChunk.FBORenderChunk`, class.

Methods, called as `obj:name(...)`:

- `beginMainThread(boolean bClear): void`
- `beginRenderThread(boolean bClear): void`
- `endMainThread(): void`
- `endRenderThread(): void`
- `getMinLevel(): int`
- `getRenderLevels(): FBORenderLevels`
- `getTexture(): Texture`
- `getTextureHeight(float cameraZoom): int`
- `getTextureWidth(float cameraZoom): int`
- `getTopLevel(): int`
- `init(): void`
- `isTopLevel(int level): boolean`
- `preInit(): void`
- `renderInWorldMainThread(): void`
- `setRenderLevels(FBORenderLevels renderLevels): void`

Constructors: `FBORenderChunk.new()`.

Static fields (a copy of the value taken when the class is exposed): `DIRTY_BLOOD: long`, `DIRTY_CORPSE: long`, `DIRTY_CREATE: long`, `DIRTY_CUTAWAYS: long`, `DIRTY_ITEM_ADD: long`, `DIRTY_ITEM_MODIFY: long`, `DIRTY_ITEM_REMOVE: long`, `DIRTY_LIGHTING: long`, `DIRTY_NONE: long`, `DIRTY_OBJECT_ADD: long`, `DIRTY_OBJECT_MODIFY: long`, `DIRTY_OBJECT_REMOVE: long`, `DIRTY_OBSCURING: long`, `DIRTY_REDO_CUTAWAYS: long`, `DIRTY_REDRAW: long`, `DIRTY_TREES: long`, `FLOOR_HEIGHT: int`, `FLOOR_WIDTH: int`, `JUMBO_L_HEIGHT: int`, `JUMBO_L_WIDTH: int`, `JUMBO_XL_HEIGHT: int`, `JUMBO_XL_WIDTH: int`, `JUMBO_XXL_HEIGHT: int`, `JUMBO_XXL_WIDTH: int`, `LEVELS_PER_TEXTURE: int`, `PIXELS_PER_LEVEL: int`, `TEXTURE_HEIGHT: int`.

### FBORenderTracerEffects

`zombie.iso.fboRenderChunk.FBORenderTracerEffects`, class.

Methods, called as `obj:name(...)`:

- `addEffect(IsoGameCharacter chr, float range): void`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `load(): void`
- `releaseWeaponTransform(IsoGameCharacter chr): void`
- `render(): void`
- `save(): void`
- `storeWeaponTransform(IsoGameCharacter chr, Matrix4f xfrm): void`

Static functions, called as `FBORenderTracerEffects.name(...)`:

- `getInstance(): FBORenderTracerEffects`

### FishSchoolManager

`zombie.iso.FishSchoolManager`, class.

Methods, called as `obj:name(...)`:

- `addChum(int x, int y, int force): void`
- `addSoundNoise(int x, int y, int radius): void`
- `catchFish(int x, int y): void`
- `generateSeed(): void`
- `getFishAbundance(int x, int y): double`
- `getTrashAbundance(int x, int y): double`
- `init(): void`
- `load(): void`
- `receiveFishingData(ByteBufferReader bb): void`
- `save(): void`
- `setFishingData(ByteBufferWriter bb): void`
- `update(): void`
- `updateFishingData(): void`
- `updateSeed(): void`

Static functions, called as `FishSchoolManager.name(...)`:

- `getInstance(): FishSchoolManager`

Constructors: `FishSchoolManager.new()`.

### IsoButcherHook

`zombie.iso.IsoButcherHook`, class. Extends [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (409), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `frameStep(): void` from `ECSEntity`
- `getAnimal(): IsoAnimal`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getObjectName(): String`
- `getRemovingBloodProgress(): float`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isRemovingBlood(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onReceivedNetUpdate(): void`
- `playPutDownCorpseSound(IsoAnimal animal): void`
- `reattachAnimal(IsoAnimal animal): void`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `removeHook(): void`
- `setAnimal(IsoAnimal animal): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setLuaHook(KahluaTableImpl luaHook): void`
- `setPlayRemovingBloodSound(boolean b): void`
- `startRemovingBlood(KahluaTableImpl luaHook): void`
- `stopRemovingBlood(): void`
- `syncIsoObjectReceive(ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `updateAnimalModel(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoButcherHook.new(IsoCell cell)`, `IsoButcherHook.new(IsoGridSquare sq)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoCamera

`zombie.iso.IsoCamera`, class.

Static functions, called as `IsoCamera.name(...)`:

- `SetCharacterToFollow(IsoGameCharacter isoGameCharacter): void`
- `clearCameraCharacter(): void`
- `getCameraCharacter(): IsoGameCharacter`
- `getCameraCharacterZ(): float`
- `getLastOffX(): float`
- `getLastOffY(): float`
- `getOffX(): float`
- `getOffX(int playerIndex): float`
- `getOffY(): float`
- `getOffY(int playerIndex): float`
- `getOffscreenHeight(int playerIndex): int`
- `getOffscreenLeft(int playerIndex): int`
- `getOffscreenTop(int playerIndex): int`
- `getOffscreenWidth(int playerIndex): int`
- `getRightClickOffX(): float`
- `getRightClickOffY(): float`
- `getScreenHeight(int playerIndex): int`
- `getScreenLeft(int playerIndex): int`
- `getScreenTop(int playerIndex): int`
- `getScreenWidth(int playerIndex): int`
- `getTOffX(): float`
- `getTOffY(): float`
- `getTargetTileY(): int`
- `init(): void`
- `setCameraCharacter(IsoGameCharacter isoGameCharacter): boolean`
- `setLastOffX(float aLastOffX): void`
- `setLastOffY(float aLastOffY): void`
- `setOffX(float aOffX): void`
- `setOffY(float aOffY): void`
- `setTargetTileY(int aTargetTileY): void`
- `update(): void`
- `updateAll(): void`

Constructors: `IsoCamera.new()`.

Static fields (a copy of the value taken when the class is exposed): `cameras: PlayerCamera[]`, `frameState: IsoCamera.FrameState`, `playerOffsetX: int`, `playerOffsetY: int`.

### IsoCell

`zombie.iso.IsoCell`, class.

Methods, called as `obj:name(...)`:

- `AddUniqueToBuildingList(ArrayList<IsoBuilding> buildings, IsoBuilding inBuilding): void`
- `CalculateVertColoursForTile(IsoGridSquare sqThis, int x, int y, int zz, int playerIndex): void`
- `CanBuildingSquareOccludePlayer(IsoGridSquare square, int playerIndex): boolean`
- `ConnectNewSquare(IsoGridSquare newSquare, boolean bDoSurrounds): IsoGridSquare`
- `DeleteAllMovingObjects(): void`
- `Dispose(): void`
- `DistanceFromSupport(int x, int y, int z): float`
- `DoBuilding(int player, boolean bRender): boolean`
- `DoesSquareHaveValidCutaways(IsoGridSquare playerSquare, IsoGridSquare square, int playerIndex, long currentTimeMillis): boolean`
- `EnsureSurroundNotNull(int xx, int yy, int zz): void`
- `GetBuildingsInFrontOfCharacter(ArrayList<IsoBuilding> buildings, IsoGridSquare square, boolean bRightOfSquare): void`
- `GetBuildingsInFrontOfMustSeeSquare(IsoGridSquare square, IsoGridOcclusionData.OcclusionFilter filter): ArrayList<IsoBuilding>`
- `GetEffectivePlayerRoomId(): long`
- `GetPeekedInBuilding(IsoGridSquare square, IsoDirections lookDir): IsoBuilding`
- `GetSquaresAroundPlayerSquare(IsoPlayer player, IsoGridSquare square, ArrayList<IsoGridSquare> outGridSquaresToLeft, ArrayList<IsoGridSquare> outGridSquaresToRight): void`
- `IsBehindStuff(IsoGridSquare sq): boolean`
- `IsCollapsibleBuildingSquare(IsoGridSquare square): boolean`
- `IsCutawaySquare(IsoGridSquare square, long currentTimeMillis): boolean`
- `IsPlayerWindowPeeking(int playerIndex): boolean`
- `LoadPlayer(int worldVersion): boolean`
- `PlaceLot(IsoLot lot, int sx, int sy, int sz, IsoChunk ch, int wx, int wy, boolean[] bDoneSquares): int`
- `PlaceLot(String filename, int sx, int sy, int sz, boolean bClearExisting): void`
- `PlaceLot(IsoLot lot, int sx, int sy, int sz, boolean bClearExisting): void`
- `ProcessSpottedRooms(): void`
- `Remove(IsoMovingObject obj): void`
- `RenderFloorShading(int zza): void`
- `RenderSnow(int zza): void`
- `RenderTiles(int maxHeight): void`
- `SetCutawayRoomsForPlayer(): boolean`
- `addHeatSource(IsoHeatSource heatSource): void`
- `addLamppost(IsoLightSource light): void`
- `addLamppost(int x, int y, int z, float r, float g, float b, int rad): IsoLightSource`
- `addMovingObject(IsoMovingObject o): void`
- `addTileObject(IsoGridSquare sq, String spriteName): IsoObject`
- `addToProcessIsoObject(IsoObject object): void`
- `addToProcessIsoObjectRemove(IsoObject object): void`
- `addToProcessItems(ArrayList<InventoryItem> items): void`
- `addToProcessItems(InventoryItem item): void`
- `addToProcessItemsRemove(ArrayList<InventoryItem> items): void`
- `addToProcessItemsRemove(InventoryItem item): void`
- `addToProcessWorldItems(IsoWorldInventoryObject worldItem): void`
- `addToProcessWorldItemsRemove(IsoWorldInventoryObject worldItem): void`
- `addToStaticUpdaterObjectList(IsoObject object): void`
- `addToWindowList(IsoWindow window): void`
- `blocked(Mover mover, int x, int y, int z, int lx, int ly, int lz): boolean`
- `checkHaveRoof(int x, int y): void`
- `clearCacheGridSquare(int playerIndex): void`
- `collapsibleBuildingSquareAlgorithm(BuildingDef def, IsoGridSquare sq, IsoGridSquare pl): boolean`
- `createNewGridSquare(int x, int y, int z, boolean recalcAll): IsoGridSquare`
- `drawStencilMask(): void`
- `flattenAnyFoliage(IsoCell.PerPlayerRender perPlayerRender, int playerIndex): void`
- `getAddList(): Set<IsoMovingObject>`
- `getAnimals(): List<IsoAnimal>`
- `getBestBuildings(IsoCell.BuildingSearchCriteria criteria, int count): Stack<BuildingScore>`
- `getBuildingList(): ArrayList<IsoBuilding>`
- `getBuildingScores(): HashMap<Integer, BuildingScore>`
- `getChunk(int wx, int wy): IsoChunk`
- `getChunkForGridSquare(int x, int y, int z): IsoChunk`
- `getChunkMap(int pl): IsoChunkMap`
- `getClosestBuildingExcept(IsoGameCharacter chr, IsoRoom except): IsoBuilding`
- `getCurrentLightX(): int`
- `getCurrentLightY(): int`
- `getCurrentLightZ(): int`
- `getCurrentLotHeader(): LotHeader`
- `getDangerScore(int x, int y): int`
- `getDangerUpdate(): OnceEvery`
- `getDrag(int player): KahluaTable`
- `getFakeZombieForHit(): IsoZombie`
- `getFreeTile(RoomDef def): IsoGridSquare`
- `getGridSquare(double x, double y, double z): IsoGridSquare`
- `getGridSquare(int x, int y, int z): IsoGridSquare`
- `getGridSquare(Double x, Double y, Double z): IsoGridSquare`
- `getGridSquareDirect(int x, int y, int z, int playerIndex): IsoGridSquare`
- `getHeatSourceHighestTemperature(float surroundingAirTemperature, int x, int y, int z): float`
- `getHeatSourceTemperature(int x, int y, int z): int`
- `getHeight(): int`
- `getHeightInTiles(): int`
- `getLamppostPositions(): Stack<IsoLightSource>`
- `getLightInfoUpdate(): Thread`
- `getLightSourceAt(int x, int y, int z): IsoLightSource`
- `getLuaObjectList(): KahluaTable`
- `getMaxFloors(): int`
- `getMaxX(): int`
- `getMaxY(): int`
- `getMaxZ(): int`
- `getMinX(): int`
- `getMinY(): int`
- `getMinZ(): int`
- `getNearestVisibleZombie(int playerIndex): IsoZombie`
- `getNetworkPlayer(int remoteId): IsoSurvivor`
- `getObjectList(): Set<IsoMovingObject>`
- `getObjectListForLua(): List<IsoMovingObject>`
- `getOrCreateGridSquare(double x, double y, double z): IsoGridSquare`
- `getPerPlayerRenderAt(int playerIndex): IsoCell.PerPlayerRender`
- `getProcessIsoObjectRemove(): Set<IsoObject>`
- `getProcessIsoObjects(): ArrayList<IsoObject>`
- `getProcessItems(): ArrayList<InventoryItem>`
- `getProcessItemsRemove(): Set<InventoryItem>`
- `getProcessWorldItems(): ArrayList<IsoWorldInventoryObject>`
- `getPushableObjectList(): ArrayList<IsoPushableObject>`
- `getRainIntensity(): int`
- `getRandomFreeTileInRoom(): IsoGridSquare`
- `getRandomOutdoorTile(): IsoGridSquare`
- `getRelativeGridSquare(int x, int y, int z): IsoGridSquare`
- `getRemoteSurvivorList(): ArrayList<IsoGameCharacter>`
- `getRemoveList(): Set<IsoMovingObject>`
- `getRoom(int id): IsoRoom`
- `getRoomList(): ArrayList<IsoRoom>`
- `getSnowTarget(): int`
- `getSpriteManager(): IsoSpriteManager`
- `getStaticUpdaterObjectList(): ArrayList<IsoObject>`
- `getStencilAreas(): List<IsoCell.StencilArea>`
- `getSurvivorList(): ArrayList<IsoSurvivor>`
- `getVehicles(): Set<BaseVehicle>`
- `getWeatherFX(): IsoWeatherFX`
- `getWidth(): int`
- `getWidthInTiles(): int`
- `getWindowList(): ArrayList<IsoWindow>`
- `getWorldX(): int`
- `getWorldY(): int`
- `getZombieList(): ArrayList<IsoZombie>`
- `gridSquareIsSnow(int x, int y, int z): boolean`
- `initTileShaders(): void`
- `invalidatePeekedRoom(int playerIndex): void`
- `isInChunkMap(int x, int y): boolean`
- `isInStencil(float sx, float sy): boolean`
- `isNull(int x, int y, int z): boolean`
- `isSafeToAdd(): boolean`
- `putInVehicle(IsoGameCharacter chr): void`
- `reloadRainTextures(): void`
- `removeFromStaticUpdaterObjectList(IsoObject object): void`
- `removeFromWindowList(IsoWindow window): void`
- `removeHeatSource(IsoHeatSource heatSource): void`
- `removeLamppost(int x, int y, int z): void`
- `removeLamppost(IsoLightSource light): void`
- `render(): void`
- `renderDebugLighting(IsoCell.PerPlayerRender perPlayerRender, int maxHeight): void`
- `renderDebugPhysics(int playerIndex): void`
- `renderRain(): void`
- `renderShadows(): void`
- `resumeVehicleSounds(IsoGameCharacter chr): void`
- `roomSpotted(IsoRoom room): void`
- `save(DataOutputStream output, boolean bDoChars): void`
- `setCacheChunk(IsoChunk chunk): void`
- `setCacheChunk(IsoChunk chunk, int playerIndex): void`
- `setCacheGridSquare(int x, int y, int z, IsoGridSquare square): void`
- `setCacheGridSquareLocal(int x, int y, int z, IsoGridSquare square, int playerIndex): void`
- `setCurrentLightX(int currentLX): void`
- `setCurrentLightY(int currentLY): void`
- `setCurrentLightZ(int currentLZ): void`
- `setDangerUpdate(OnceEvery dangerUpdate): void`
- `setDrag(KahluaTable draggingItem, int player): void`
- `setHeight(int height): void`
- `setLightInfoUpdate(Thread lightInfoUpdate): void`
- `setMaxX(int maxX): void`
- `setMaxY(int maxY): void`
- `setMaxZ(int maxZ): void`
- `setMinX(int minX): void`
- `setMinY(int minY): void`
- `setMinZ(int minZ): void`
- `setRainAlpha(int alpha): void`
- `setRainIntensity(int intensity): void`
- `setRainSpeed(int speed): void`
- `setSafeToAdd(boolean safeToAdd): void`
- `setSnowTarget(int target): void`
- `setWidth(int width): void`
- `setWorldX(int worldX): void`
- `setWorldY(int worldY): void`
- `update(): void`
- `updateHeatSources(): void`

Static functions, called as `IsoCell.name(...)`:

- `FromMouseTile(): IsoDirections`
- `getBComponent(int col): int`
- `getBuildings(): Stack<BuildingScore>`
- `getCellSizeInChunks(): int`
- `getCellSizeInSquares(): int`
- `getGComponent(int col): int`
- `getInstance(): IsoCell`
- `getMaxHeight(): int`
- `getRComponent(int col): int`
- `isBasementWallAdjacentToTheVoid_North(IsoObject object): boolean`
- `isBasementWallAdjacentToTheVoid_West(IsoObject object): boolean`
- `setBuildings(Stack<BuildingScore> scores): void`
- `toIntColor(float r, float g, float b, float a): int`

Constructors: `IsoCell.new(int width, int height)`.

Static fields (a copy of the value taken when the class is exposed): `CELL_SIZE_IN_CHUNKS: int`, `CELL_SIZE_IN_SQUARES: int`, `ENABLE_SQUARE_CACHE: boolean`, `ISOANGLEFACTOR: int`, `MinusFloorCharacters: ArrayList<IsoGridSquare>`, `NEARESTZOMBIEDISTSQRMAX: float`, `RTF_MinusFloorCharacters: int`, `RTF_ShadedFloor: int`, `RTF_Shadows: int`, `RTF_SolidFloor: int`, `RTF_VegetationCorpses: int`, `ShadedFloor: ArrayList<IsoGridSquare>`, `ShadowSquares: ArrayList<IsoGridSquare>`, `SolidFloor: ArrayList<IsoGridSquare>`, `VegetationCorpses: ArrayList<IsoGridSquare>`, `ZOMBIESCANBUDGET: int`, `floorRenderShader: Shader`, `gridStack: ArrayList<IsoGridSquare>`, `maxHeight: int`, `perPlayerRender: IsoCell.PerPlayerRender[]`, `wallRenderShader: Shader`.

### IsoChunk

`zombie.iso.IsoChunk`, class.

Methods, called as `obj:name(...)`:

- `AddBlood(int wx, int wy): void`
- `AddCorpses(int wx, int wy): void`
- `AddVehicles(): void`
- `Blam(int wx, int wy): void`
- `IsOnScreen(boolean halfTileBorder): boolean`
- `LoadChunk(int wx, int wy, ByteBuffer fromServer): boolean`
- `LoadFromBuffer(int wx, int wy, ByteBuffer bb): boolean`
- `LoadFromDisk(): void`
- `RandomizeModel(BaseVehicle v, Zone zone, String name, VehicleType type): boolean`
- `Save(ByteBuffer bb, CRC32 crc, boolean bHotSave): ByteBuffer`
- `Save(boolean bPreventChunkReuse): void`
- `SaveLoadedChunk(ClientChunkRequest.Chunk ccrc, CRC32 crc32): void`
- `addBloodSplat(float x, float y, float z, int type): void`
- `addGeneratorPos(int x, int y, int z): void`
- `addModded(ChunkGenerationStatus chunkGenerationStatus): void`
- `addObjectAmbientEmitter(IsoObject object, ObjectAmbientEmitters.PerObjectLogic logic): void`
- `addObjectPoweredByGenerator(IsoObject object): void`
- `addRandomCarCrash(Zone zone, boolean addToWorld): void`
- `addSpawnedRoom(long roomID): void`
- `addSurvivorInHorde(boolean forced): void`
- `assignLoadID(): void`
- `attachmentsPartialSize(): Integer`
- `canAddRandomCarCrash(Zone zone, boolean force): boolean`
- `checkForMissingGenerators(): void`
- `checkLightingLater_AllPlayers_AllLevels(): void`
- `checkLightingLater_AllPlayers_OneLevel(int level): void`
- `checkLightingLater_OnePlayer_AllLevels(int playerIndex): void`
- `checkLightingLater_OnePlayer_OneLevel(int playerIndex, int level): void`
- `checkPhysicsLater(int level): void`
- `checkPhysicsLaterForActiveRagdoll(IsoChunkLevel isoChunkLevel): void`
- `containsPoint(float x, float y): boolean`
- `doLoadGridsquare(): void`
- `doPathfind(): void`
- `doReuseGridsquares(): void`
- `flagForHotSave(): void`
- `getAttachmentsPartial(int i): SquareCoord`
- `getAttachmentsState(): boolean[]`
- `getCutawayData(): FBORenderCutaways.ChunkLevelsData`
- `getCutawayDataForLevel(int z): FBORenderCutaways.ChunkLevelData`
- `getErosionData(): ErosionData.Chunk`
- `getGridSquare(int, int, int): IsoGridSquare`
- `getLevelData(int level): IsoChunkLevel`
- `getLoadID(): short`
- `getMaxLevel(): int`
- `getMinLevel(): int`
- `getModifDepth(BlendDirection dir): byte`
- `getNumberOfWaterTiles(): int`
- `getRenderLevels(int playerIndex): FBORenderLevels`
- `getRoom(long roomID): IsoRoom`
- `getScavengeZone(): Zone`
- `getSquaresForLevel(int worldSquareZ): IsoGridSquare[]`
- `getVispolyData(): VisibilityPolygon2.ChunkData`
- `getVispolyDataForLevel(int z): VisibilityPolygon2.ChunkLevelData`
- `hasAttachmentsPartial(SquareCoord coord): boolean`
- `hasEmptySquaresOnLevelZero(): boolean`
- `hasFence(): boolean`
- `hasObjectAmbientEmitter(IsoObject object): boolean`
- `hasWaterSquare(): boolean`
- `ignorePathfind(): void`
- `invalidateRenderChunkLevel(int level, long dirtyFlags): void`
- `invalidateRenderChunkLevels(long dirtyFlags): void`
- `invalidateVispolyChunkLevel(int level): void`
- `isAttachmentsDone(int i): boolean`
- `isAttachmentsDoneFull(): boolean`
- `isBlendingDone(int i): boolean`
- `isBlendingDoneFull(): boolean`
- `isBlendingDonePartial(): boolean`
- `isGeneratorPoweringSquare(int x, int y, int z): boolean`
- `isModded(): EnumSet<ChunkGenerationStatus>`
- `isModded(EnumSet<ChunkGenerationStatus> chunkGenerationStatus): void`
- `isModded(ChunkGenerationStatus chunkGenerationStatus): void`
- `isNewChunk(): boolean`
- `isSpawnedRoom(long roomID): boolean`
- `isValidLevel(int level): boolean`
- `loadInMainThread(): void`
- `loadInWorldStreamerThread(): void`
- `loadObjectState(ByteBuffer bb): void`
- `recalcNeighboursNow(): void`
- `removeFromWorld(): void`
- `removeGeneratorPos(int x, int y, int z): void`
- `removeObjectAmbientEmitter(IsoObject object): void`
- `removeObjectPoweredByGenerator(IsoObject object): void`
- `resetForStore(): void`
- `rmModded(ChunkGenerationStatus chunkGenerationStatus): void`
- `saveObjectState(ByteBuffer bb): boolean`
- `setAttachmentsDoneFull(boolean attachmentsDoneFull): void`
- `setAttachmentsPartial(SquareCoord coord): void`
- `setAttachmentsState(int i, boolean value): void`
- `setBlendingDoneFull(boolean flag): void`
- `setBlendingDonePartial(boolean flag): void`
- `setBlendingModified(int i): void`
- `setCache(): void`
- `setCacheIncludingNull(): void`
- `setMinMaxLevel(int minLevel, int maxLevel): void`
- `setModifDepth(BlendDirection dir, byte depth): void`
- `setModifDepth(BlendDirection dir, int depth): void`
- `setRandomVehicleStoryToSpawnLater(VehicleStorySpawnData spawnData): void`
- `setSquare(int x, int y, int z, IsoGridSquare square): void`
- `squaresIndexOfLevel(int worldSquareZ): int`
- `update(): void`
- `updateBuildings(): void`
- `updatePhysicsForLevel(int z): void`
- `updateSounds(): void`
- `updateVehicleStory(): void`

Static functions, called as `IsoChunk.name(...)`:

- `FileExists(int wx, int wy): boolean`
- `Fix2x(IsoGridSquare square, int spriteID): int`
- `Fix2x(String tileName): String`
- `IsDebugSave(): boolean`
- `Reset(): void`
- `SafeRead(int wx, int wy, ByteBuffer bb): ByteBuffer`
- `SafeWrite(int wx, int wy, ByteBuffer bb): void`
- `addFromCheckedVehicles(BaseVehicle v): void`
- `doSpawnedVehiclesInInvalidPosition(BaseVehicle v): boolean`
- `removeFromCheckedVehicles(BaseVehicle v): void`
- `updatePlayerInBullet(): void`
- `validateByteBufferHeader(ByteBuffer bb): boolean`

Constructors: `IsoChunk.new(IsoCell cell)`, `IsoChunk.new(WorldReuserThread dummy)`.

Static fields (a copy of the value taken when the class is exposed): `BLOCK_SIZE: int`, `LB_PATHFIND: short`, `WriteLock: Object`, `doAttachments: boolean`, `doForaging: boolean`, `doServerRequests: boolean`, `doWorldgen: boolean`, `loadGridSquare: CappedConcurrentQueue<IsoChunk>`, `renderByIndex: byte[][]`.

### IsoChunkMap

`zombie.iso.IsoChunkMap`, class.

Methods, called as `obj:name(...)`:

- `Dispose(): void`
- `LoadChunk(int wx, int wy, int x, int y): void`
- `LoadChunkForLater(int wx, int wy, int x, int y): IsoChunk`
- `ProcessChunkPos(IsoGameCharacter chr): void`
- `Save(): void`
- `SwapChunkBuffers(): void`
- `Unload(): void`
- `calculateZExtentsForChunkMap(): void`
- `checkIntegrity(): void`
- `checkIntegrityThread(): void`
- `copy(IsoChunkMap from): void`
- `drawDebugChunkMap(): void`
- `getChunk(int chunkMapChunkX, int chunkMapChunkY): IsoChunk`
- `getChunkCurrent(int x, int y): IsoChunk`
- `getChunkForGridSquare(int worldSquareX, int worldSquareY): IsoChunk`
- `getChunks(): IsoChunk[]`
- `getGridSquare(int worldSquareX, int worldSquareY, int worldSquareZ): IsoGridSquare`
- `getGridSquareDirect(int chunkMapSquareX, int chunkMapSquareY, int worldSquareZ): IsoGridSquare`
- `getRoom(int iD): IsoRoom`
- `getWidthInTiles(): int`
- `getWorldXMaxTiles(): int`
- `getWorldXMin(): int`
- `getWorldXMinTiles(): int`
- `getWorldYMaxTiles(): int`
- `getWorldYMin(): int`
- `getWorldYMinTiles(): int`
- `processAllLoadGridSquare(): void`
- `renderBloodForChunks(int zza): void`
- `setChunkDirect(IsoChunk c, boolean bRequireLock): boolean`
- `setGridSquare(IsoGridSquare square, int worldSquareX, int worldSquareY, int worldSquareZ): void`
- `setInitialPos(int wx, int wy): void`
- `update(): void`

Static functions, called as `IsoChunkMap.name(...)`:

- `CalcChunkWidth(): void`
- `isGridSquareOutOfRangeZ(int tileZ): boolean`
- `setWorldStartPos(int x, int y): void`

Constructors: `IsoChunkMap.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `BOTTOM_LEVEL: int`, `CHUNKS_PER_WIDTH: int`, `CHUNK_SIZE_IN_SQUARES: int`, `GROUND_LEVEL: int`, `LEVELS: int`, `OLD_CHUNKS_PER_WIDTH: int`, `SWorldX: int[]`, `SWorldY: int[]`, `SharedChunks: HashMap<Integer, IsoChunk>`, `TOP_LEVEL: int`, `bSettingChunk: ReentrantLock`, `chunkGridWidth: int`, `chunkStore: CappedConcurrentQueue<IsoChunk>`, `chunkWidthInTiles: int`, `mpWorldXa: int`, `mpWorldYa: int`, `mpWorldZa: int`, `ppp_update: PerformanceProfileProbe`, `worldXa: int`, `worldYa: int`, `worldZa: int`.

### IsoDirections

`zombie.iso.IsoDirections`, enum.

Methods, called as `obj:name(...)`:

- `Rot180(): IsoDirections`
- `RotLeft(): IsoDirections`
- `RotLeft(int times): IsoDirections`
- `RotRight(): IsoDirections`
- `RotRight(int times): IsoDirections`
- `ToVector(): Vector2`
- `ToVector(Vector2 result): Vector2`
- `addToVector(Vector2 addTo, Vector2 result): Vector2`
- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `dx(): int`
- `dy(): int`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `isCardinal(): boolean`
- `isDiagonal(): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toAngle(): float`
- `toAngleDegrees(): float`
- `toString(): String` from `Enum`

Static functions, called as `IsoDirections.name(...)`:

- `cardinalFromAngle(float angleRadians): IsoDirections`
- `cardinalFromAngle(float dx, float dy): IsoDirections`
- `cardinalFromAngle(Vector2 v): IsoDirections`
- `fromAngle(float angleRadians): IsoDirections`
- `fromAngle(float dx, float dy): IsoDirections`
- `fromAngle(Vector2 v): IsoDirections`
- `fromIndex(int index): IsoDirections`
- `fromString(String str): IsoDirections`
- `getRandom(): IsoDirections`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): IsoDirections`
- `values(): IsoDirections[]`

Enum values (read as `IsoDirections.VALUE`): `E`, `N`, `NE`, `NW`, `S`, `SE`, `SW`, `W`.

### IsoDirectionSet

`zombie.iso.IsoDirectionSet`, class.

Methods, called as `obj:name(...)`:

- `getNext(): IsoDirections`

Static functions, called as `IsoDirectionSet.name(...)`:

- `rotate(IsoDirections dir, int amount): IsoDirections`

Constructors: `IsoDirectionSet.new()`.

### IsoGridSquare

`zombie.iso.IsoGridSquare`, class.

Methods, called as `obj:name(...)`:

- `AddSpecialObject(IsoObject obj): void`
- `AddSpecialObject(IsoObject obj, int index): void`
- `AddSpecialTileObject(IsoObject obj): void`
- `AddStairs(boolean north, int level, String sprite, String pillarSprite, KahluaTable table): IsoThumpable`
- `AddTileObject(IsoObject obj): void`
- `AddTileObject(IsoObject obj, int index): void`
- `AddWorldInventoryItem(String itemType, float x, float y, float height, int nbr): void`
- `AddWorldInventoryItem(String itemType, float x, float y, float height): InventoryItem`
- `AddWorldInventoryItem(String itemType, float x, float y, float height, boolean autoAge): InventoryItem`
- `AddWorldInventoryItem(String itemType, float x, float y, float height, boolean autoAge, boolean synchSpawn): InventoryItem`
- `AddWorldInventoryItem(InventoryItem item, float x, float y, float height): InventoryItem`
- `AddWorldInventoryItem(InventoryItem item, float x, float y, float height, boolean transmit): InventoryItem`
- `AddWorldInventoryItem(InventoryItem item, float x, float y, float height, boolean transmit, boolean synchSpawn): InventoryItem`
- `AddWorldInventoryItem(ItemKey itemKey, float x, float y, float height): InventoryItem`
- `AddWorldInventoryItem(ItemKey itemKey, float x, float y, float height, boolean autoAge): InventoryItem`
- `Burn(): void`
- `Burn(boolean explode): void`
- `BurnTick(): void`
- `BurnWalls(boolean explode, boolean recursive): void`
- `BurnWallsTCOnly(): void`
- `CalcVisibility(int playerIndex, IsoGameCharacter isoGameCharacter, VisibilityData visibilityData): void`
- `CalculateCollide(IsoGridSquare gridSquare, boolean bVision, boolean bPathfind, boolean bIgnoreSolidTrans): boolean`
- `CalculateCollide(IsoGridSquare gridSquare, boolean bVision, boolean bPathfind, boolean bIgnoreSolidTrans, boolean bIgnoreSolid): boolean`
- `CalculateCollide(IsoGridSquare gridSquare, boolean bVision, boolean bPathfind, boolean bIgnoreSolidTrans, boolean bIgnoreSolid, IsoGridSquare.GetSquare getter): boolean`
- `CalculateVisionBlocked(IsoGridSquare gridSquare, IsoGridSquare.GetSquare getter): boolean`
- `ClearTileObjects(): void`
- `ClearTileObjectsExceptFloor(): void`
- `DeleteTileObject(IsoObject obj): void`
- `DirtySlice(): void`
- `DistTo(int x, int y): float`
- `DistTo(IsoGridSquare sq): float`
- `DistTo(IsoMovingObject other): float`
- `DistToProper(int x, int y): float`
- `DistToProper(IsoGridSquare sq): float`
- `DistToProper(IsoMovingObject other): float`
- `DoCutawayShader(IsoObject obj, IsoDirections dir, int cutawaySelf, int cutawayN, int cutawayS, int cutawayW, int cutawayE, boolean bHasDoorN, boolean bHasDoorW, boolean bHasWindowN, boolean bHasWindowW, WallShaper texdModifier): void`
- `DoCutawayShaderSprite(IsoSprite sprite, IsoDirections dir, int cutawaySelf, int cutawayN, int cutawayS, int cutawayW, int cutawayE): void`
- `DoSplat(String id, boolean bFlip, IsoFlagType prop, float offX, float offZ, float alpha): void`
- `DoWallLightingN(IsoObject obj, int stenciled, int cutawaySelf, int cutawayN, int cutawayS, int cutawayW, int cutawayE, boolean bHasDoorN, boolean bHasWindowN, Shader wallRenderShader): int`
- `DoWallLightingNW(IsoObject obj, int stenciled, int cutawaySelf, int cutawayN, int cutawayS, int cutawayW, int cutawayE, boolean bHasDoorN, boolean bHasDoorW, boolean bHasWindowN, boolean bHasWindowW, Shader wallRenderShader): int`
- `DoWallLightingW(IsoObject obj, int stenciled, int cutawaySelf, int cutawayN, int cutawayS, int cutawayW, int cutawayE, boolean bHasDoorW, boolean bHasWindowW, Shader wallRenderShader): int`
- `EnsureSurroundNotNull(): void`
- `FindEnemy(IsoGameCharacter g, int range, ArrayList<IsoMovingObject> enemyList): IsoGameCharacter`
- `FindEnemy(IsoGameCharacter g, int range, ArrayList<IsoMovingObject> enemyList, IsoGameCharacter rangeTest, int testRangeMax): IsoGameCharacter`
- `FindFriend(IsoGameCharacter g, int range, Stack<IsoGameCharacter> enemyList): IsoGameCharacter`
- `FixStackableObjects(): void`
- `GetBLightLevel(): int`
- `GetGLightLevel(): int`
- `GetRLightLevel(): int`
- `HasEave(): boolean`
- `HasElevatedFloor(): boolean`
- `HasPushable(): boolean`
- `HasSlopedRoof(): boolean`
- `HasSlopedRoofNorth(): boolean`
- `HasSlopedRoofWest(): boolean`
- `HasStairTop(): boolean`
- `HasStairTopNorth(): boolean`
- `HasStairTopWest(): boolean`
- `HasStairs(): boolean`
- `HasStairsBelow(): boolean`
- `HasStairsNorth(): boolean`
- `HasStairsWest(): boolean`
- `HasTree(): boolean`
- `InvalidateSpecialObjectPaths(): void`
- `IsOnScreen(): boolean`
- `IsOnScreen(boolean halfTileBorder): boolean`
- `ReCalculateCollide(IsoGridSquare square): void`
- `ReCalculateCollide(IsoGridSquare square, IsoGridSquare.GetSquare getter): void`
- `ReCalculatePathFind(IsoGridSquare square): void`
- `ReCalculatePathFind(IsoGridSquare square, IsoGridSquare.GetSquare getter): void`
- `ReCalculateVisionBlocked(IsoGridSquare square): void`
- `ReCalculateVisionBlocked(IsoGridSquare square, IsoGridSquare.GetSquare getter): void`
- `RecalcAllWithNeighbours(boolean bDoReverse): void`
- `RecalcAllWithNeighbours(boolean bDoReverse, IsoGridSquare.GetSquare getter): void`
- `RecalcAllWithNeighboursMineOnly(): void`
- `RecalcProperties(): void`
- `RecalcPropertiesIfNeeded(): void`
- `RemoveTileObject(IsoObject obj): int`
- `RemoveTileObject(IsoObject obj, boolean safelyRemove): int`
- `RemoveTileObjectErosionNoRecalc(IsoObject obj): int`
- `RenderMinusFloorFxMask(int maxZ, boolean doSE, boolean vegitationRender): boolean`
- `RenderOpenDoorOnly(): void`
- `ResetIsoWorldRegion(): void`
- `SetBLightLevel(int val): void`
- `SetGLightLevel(int val): void`
- `SetRLightLevel(int val): void`
- `SpawnWorldInventoryItem(String itemType, float x, float y, float height, int nbr): void`
- `SpawnWorldInventoryItem(String itemType, float x, float y, float height): InventoryItem`
- `SpawnWorldInventoryItem(String itemType, float x, float y, float height, boolean autoAge): InventoryItem`
- `SpawnWorldInventoryItem(InventoryItem item, float x, float y, float height, boolean transmit): InventoryItem`
- `StartFire(): void`
- `TreatAsSolidFloor(): boolean`
- `addAshes(): void`
- `addBrokenGlass(): IsoBrokenGlass`
- `addCorpse(IsoDeadBody body, boolean bRemote): void`
- `addCorpse(): IsoDeadBody`
- `addCorpse(boolean isSkeleton): IsoDeadBody`
- `addDeferredCharacter(IsoGameCharacter chr): void`
- `addFloodLights(): void`
- `addFloor(String sprite): IsoObject`
- `addFreezer(): void`
- `addGrindstone(): void`
- `addHandPress(): void`
- `addLoom(): void`
- `addPlayerCutawayFlag(int playerIndex, int flag, long currentTimeMillis): void`
- `addSpinningWheel(): void`
- `addStump(): void`
- `addTileObject(String spriteName): IsoObject`
- `addUndergroundBlock(String sprite): IsoObject`
- `addWorkstationEntity(IsoThumpable thumpable, GameEntityScript script): void`
- `addWorkstationEntity(String scriptString, String sprite): IsoThumpable`
- `addWorkstationEntity(GameEntityScript script, String sprite): IsoThumpable`
- `cacheLightInfo(): void`
- `canReachTo(IsoGridSquare other): boolean`
- `canSpawnVermin(): boolean`
- `canStand(): boolean`
- `checkForIntersectingCrops(BaseVehicle vehicle): void`
- `checkHaveDung(): boolean`
- `checkHaveGrass(): boolean`
- `checkRoomSeen(int playerIndex): void`
- `clearPlayerCutawayFlag(int playerIndex, int flag, long currentTimeMillis): void`
- `clearPuddles(): void`
- `clearWater(): void`
- `connectedWithFloor(): boolean`
- `containsVegetation(): boolean`
- `createAnimalCorpseFromItem(InventoryItem item): IsoDeadBody`
- `createCorpse(boolean skeleton): IsoDeadBody`
- `createCorpse(IsoZombie zombie): IsoDeadBody`
- `createCorpse(IsoZombie zombie, boolean skeleton): IsoDeadBody`
- `damageSpriteSheetRopeFromBottom(): void`
- `destroyFarmingPlant(): void`
- `dirtStamp(): void`
- `disableErosion(): void`
- `discard(): void`
- `doGridNav(IsoGridSquare.GetSquare getter): IsoGridSquare`
- `findEdgeObject(Class<? extends T> returnType, GridSquareEdgeFacingDirection facingDirection): T`
- `findEdgeSpecialObject(Class<? extends T> returnType, GridSquareEdgeFacingDirection facingDirection): T`
- `findObject(Class<? extends T> returnType, BiPredicate<T, U> checkPredicate, U comparisonParam): T`
- `findObject(Class<? extends T> returnType): T`
- `findSpecialObject(Class<? extends T> returnType, BiPredicate<T, U> checkPredicate, U comparisonParam): T`
- `findSpecialObject(Class<? extends T> returnType): T`
- `fixPlacedItemRenderOffsets(): void`
- `flagForHotSave(): void`
- `getAdjacentPathSquare(IsoDirections dir): IsoGridSquare`
- `getAdjacentSquare(IsoDirections dir): IsoGridSquare`
- `getAllContainers(T paramToCompare, Invokers.Params2.Boolean.ICallback<T, ItemContainer> isValidPredicate, PZArrayList<ItemContainer> containerList): PZArrayList<ItemContainer>`
- `getAllContainersFromAdjacentSquare(IsoDirections dir, T paramToCompare, Invokers.Params2.Boolean.ICallback<T, ItemContainer> isValidPredicate, PZArrayList<ItemContainer> containerList): PZArrayList<ItemContainer>`
- `getAnimalTrack(): IsoAnimalTrack`
- `getAnimals(): ArrayList<IsoAnimal>`
- `getAnimals(ArrayList<IsoAnimal> result): ArrayList<IsoAnimal>`
- `getApparentZ(float dx, float dy): float`
- `getBed(): IsoObject`
- `getBendable(GridSquareEdge alongEdge): IsoObject`
- `getBendable(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): IsoObject`
- `getBendable(GridSquareEdgeFacingDirection facingDirection): IsoObject`
- `getBendableTo(IsoGridSquare next): IsoObject`
- `getBrokenGlass(): IsoBrokenGlass`
- `getBuilding(): IsoBuilding`
- `getBuildingDef(): BuildingDef`
- `getBush(): IsoObject`
- `getBushes(): List<IsoObject>`
- `getButcherHook(): IsoButcherHook`
- `getCampfire(): GlobalObject`
- `getCanSee(int playerIndex): boolean`
- `getCell(): IsoCell`
- `getCenterX(): float`
- `getCenterY(): float`
- `getChunk(): IsoChunk`
- `getCollideMatrix(int dx, int dy, int dz): boolean`
- `getCompost(): IsoCompost`
- `getContainerItem(String type): IsoObject`
- `getCoords(): SquareCoord`
- `getCountertopAttachObject(): IsoObject`
- `getCountertopObject(): IsoObject`
- `getCurtain(IsoObjectType curtainType): IsoCurtain`
- `getDarkMulti(int playerIndex): float`
- `getDeadBody(): IsoDeadBody`
- `getDeadBodys(): List<IsoDeadBody>`
- `getDeferedCharacters(): ArrayList<IsoGameCharacter>`
- `getDeviceData(): DeviceData`
- `getDoor(GridSquareEdge alongEdge): IsoObject`
- `getDoor(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): IsoObject`
- `getDoor(GridSquareEdgeFacingDirection facingDirection): IsoObject`
- `getDoorOrWindow(boolean north): IsoObject`
- `getDoorOrWindowOrWindowFrame(IsoDirections dir, boolean ignoreOpen): IsoObject`
- `getDoorTo(IsoGridSquare next): IsoObject`
- `getDoorTo(IsoGridSquare next, IsoGridSquare.GetSquare getSquare): IsoObject`
- `getE(): IsoGridSquare`
- `getEast(): IsoGridSquare`
- `getEast(IsoGridSquare.GetSquare getSquare): IsoGridSquare`
- `getEdgeElement(GridSquareEdge alongEdge, BiFunction<IsoGridSquare, GridSquareEdgeFacingDirection, T> facingGetter, IsoGridSquare.GetSquare getSquare): T`
- `getEdgeElementTo(IsoGridSquare next, TriFunction<IsoGridSquare, GridSquareEdge, IsoGridSquare.GetSquare, T> edgeGetter, IsoGridSquare.GetSquare getSquare): T`
- `getErosionData(): ErosionData.Square`
- `getFarmingPlant(): GlobalObject`
- `getFire(): IsoFire`
- `getFirstBlocking(IsoGridSquareCollisionData isoGridSquareCollisionData, int x, int y, int z, boolean specialDiag, boolean bIgnoreDoors): IsoGridSquareCollisionData`
- `getFloor(): IsoObject`
- `getFloorSquareBelow(): IsoGridSquare`
- `getGarageDoor(boolean bNorth): IsoObject`
- `getGenerator(): IsoGenerator`
- `getGraffitiObject(): IsoObject`
- `getGrass(): IsoObject`
- `getGrassLike(): List<IsoObject>`
- `getGridSneakModifier(boolean onlySolidTrans): float`
- `getHashCodeObjects(): long`
- `getHashCodeObjectsInt(): int`
- `getHiddenStash(): IsoObject`
- `getHoppable(boolean north): IsoObject`
- `getHoppableOrWindowFrame(GridSquareEdge alongEdge): IsoObject`
- `getHoppableOrWindowFrame(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): IsoObject`
- `getHoppableOrWindowFrame(GridSquareEdgeFacingDirection facingDirection): IsoObject`
- `getHoppableThumpable(GridSquareEdge alongEdge): IsoThumpable`
- `getHoppableThumpable(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): IsoThumpable`
- `getHoppableThumpableTo(IsoGridSquare next): IsoThumpable`
- `getHoppableTo(IsoGridSquare next): IsoObject`
- `getHoppableTo(IsoGridSquare next, IsoGridSquare.GetSquare getSquare): IsoObject`
- `getHoppableWall(boolean bNorth): IsoObject`
- `getHourLastSeen(): int`
- `getHoursSinceLastSeen(): float`
- `getHutch(): IsoHutch`
- `getHutchTiles(IsoHutch sourceHutch): ArrayList<IsoHutch>`
- `getID(): Integer`
- `getIsDissolved(int playerIndex, long currentTimeMillis): boolean`
- `getIsoDoor(): IsoDoor`
- `getIsoWorldRegion(): IWorldRegion`
- `getLampostTotalB(): float`
- `getLampostTotalG(): float`
- `getLampostTotalR(): float`
- `getLightInfluenceB(): ArrayList<Float>`
- `getLightInfluenceG(): ArrayList<Float>`
- `getLightInfluenceR(): ArrayList<Float>`
- `getLightInfo(int playerNumber): ColorInfo`
- `getLightLevel(int playerIndex): float`
- `getLightLevel2(): float`
- `getLootZone(): String`
- `getLuaMovingObjectList(): KahluaTable`
- `getLuaTileObjectList(): KahluaTable`
- `getModData(): KahluaTable`
- `getMovingObjects(): ArrayList<IsoMovingObject>`
- `getN(): IsoGridSquare`
- `getNextNonItemObjectIndex(int index): int`
- `getNorth(): IsoGridSquare`
- `getNorth(IsoGridSquare.GetSquare getSquare): IsoGridSquare`
- `getObjectContainers(T paramToCompare, Invokers.Params2.Boolean.ICallback<T, ItemContainer> isValidPredicate, PZArrayList<ItemContainer> containerList): PZArrayList<ItemContainer>`
- `getObjectWithSprite(String spriteName): IsoObject`
- `getObjects(): PZArrayList<IsoObject>`
- `getOcclusionData(): IsoGridOcclusionData`
- `getOpenAir(): boolean`
- `getOpenDoor(IsoDirections dir): IsoObject`
- `getOppositeSquare(GridSquareEdgeFacingDirection edgeDirection): IsoGridSquare`
- `getOrCreateOcclusionData(): IsoGridOcclusionData`
- `getOre(): IsoObject`
- `getOres(): List<IsoObject>`
- `getPathMatrix(int dx, int dy, int dz): boolean`
- `getPlayer(): IsoPlayer`
- `getPlayerBuiltFloor(): IsoObject`
- `getPlayerCutawayFlag(int playerIndex, long currentTimeMillis): int`
- `getProperties(): PropertyContainer`
- `getPuddleFloor(): IsoObject`
- `getPuddles(): IsoPuddlesGeometry`
- `getPuddlesDir(): int`
- `getPuddlesInGround(): float`
- `getRadius(int radius): List<IsoGridSquare>`
- `getRainDrop(): IsoRaindrop`
- `getRainSplash(): IsoRainSplash`
- `getRandomAdjacent(): IsoGridSquare`
- `getRandomAdjacentFreeSameRoom(): IsoGridSquare`
- `getRoofHideBuilding(): IsoBuilding`
- `getRoom(): IsoRoom`
- `getRoomDef(): RoomDef`
- `getRoomID(): long`
- `getRoomIDString(): String`
- `getRoomSize(): int`
- `getS(): IsoGridSquare`
- `getSeen(int playerIndex): boolean`
- `getSheetRope(): IsoObject`
- `getSlopedSurfaceDirection(): IsoDirections`
- `getSlopedSurfaceHeight(float dx, float dy): float`
- `getSlopedSurfaceHeight(IsoDirections edge): float`
- `getSlopedSurfaceHeightMax(): float`
- `getSlopedSurfaceHeightMin(): float`
- `getSouth(): IsoGridSquare`
- `getSouth(IsoGridSquare.GetSquare getSquare): IsoGridSquare`
- `getSpecialObjects(): List<IsoObject>`
- `getSquareAbove(): IsoGridSquare`
- `getSquareBelow(): IsoGridSquare`
- `getSquareRegion(): String`
- `getSquareZombiesType(): String`
- `getStairPillar(): IsoObject`
- `getStairs(): IsoObjectType`
- `getStairsDirection(): IsoDirections`
- `getStairsHeight(IsoDirections edge): float`
- `getStairsHeightMax(): float`
- `getStairsHeightMin(): float`
- `getStaticMovingObjects(Class<? extends ObjectType> objectType, Predicate<ObjectType> objectFilter): List<ObjectType>`
- `getStaticMovingObjects(): ArrayList<IsoMovingObject>`
- `getStaticMovingObjectsInNearbySquares(Class<? extends ObjectType> objectType, BiPredicate<IsoGridSquare, IsoGridSquare> squareFilter, Predicate<ObjectType> objectFilter): List<ObjectType>`
- `getStump(): IsoObject`
- `getSurroundingSquares(): IsoGridSquare[]`
- `getTargetDarkMulti(int playerIndex): float`
- `getThumpable(boolean north): IsoThumpable`
- `getThumpableWall(boolean bNorth): IsoObject`
- `getThumpableWallOrHoppable(boolean bNorth): IsoObject`
- `getThumpableWindow(GridSquareEdge alongEdge): IsoThumpable`
- `getThumpableWindow(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): IsoThumpable`
- `getTileInDirection(IsoDirections directions): IsoGridSquare`
- `getTotalWeightOfItemsOnFloor(): float`
- `getTransparentWallTo(IsoGridSquare other): IsoObject`
- `getTrapPositionX(): int`
- `getTrapPositionY(): int`
- `getTrapPositionZ(): int`
- `getTrashReceptacle(): IsoObject`
- `getTree(): IsoTree`
- `getVehicleContainer(): BaseVehicle`
- `getVehicleItemContainers(T paramToCompare, Invokers.Params2.Boolean.ICallback<T, ItemContainer> isValidPredicate): PZArrayList<ItemContainer>`
- `getVehicleItemContainers(T paramToCompare, Invokers.Params2.Boolean.ICallback<T, ItemContainer> isValidPredicate, PZArrayList<ItemContainer> containerList): PZArrayList<ItemContainer>`
- `getVertLight(int i, int playerIndex): int`
- `getVisionMatrix(int dx, int dy, int dz): boolean`
- `getW(): IsoGridSquare`
- `getWall(): IsoObject`
- `getWall(boolean bNorth): IsoObject`
- `getWallExcludingObject(boolean bNorth, IsoObject exclude): IsoObject`
- `getWallFull(): Boolean`
- `getWallHoppable(GridSquareEdge alongEdge): IsoObject`
- `getWallHoppable(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): IsoObject`
- `getWallHoppable(GridSquareEdgeFacingDirection facingDirection): IsoObject`
- `getWallHoppableTo(IsoGridSquare next): IsoObject`
- `getWallHoppableTo(IsoGridSquare next, IsoGridSquare.GetSquare getSquare): IsoObject`
- `getWallNW(): IsoObject`
- `getWallSE(): IsoObject`
- `getWallType(): int`
- `getWater(): IsoWaterGeometry`
- `getWaterObject(): IsoObject`
- `getWest(): IsoGridSquare`
- `getWest(IsoGridSquare.GetSquare getSquare): IsoGridSquare`
- `getWindow(): IsoWindow`
- `getWindow(GridSquareEdge alongEdge): IsoWindow`
- `getWindow(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): IsoWindow`
- `getWindow(GridSquareEdgeFacingDirection facingDirection): IsoWindow`
- `getWindowFrame(GridSquareEdge alongEdge): IsoWindowFrame`
- `getWindowFrame(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): IsoWindowFrame`
- `getWindowFrame(GridSquareEdgeFacingDirection edgeFacingDirection): IsoWindowFrame`
- `getWindowFrameTo(IsoGridSquare next): IsoWindowFrame`
- `getWindowFrameTo(IsoGridSquare next, IsoGridSquare.GetSquare getSquare): IsoWindowFrame`
- `getWindowThumpableTo(IsoGridSquare next): IsoThumpable`
- `getWindowThumpableTo(IsoGridSquare next, IsoGridSquare.GetSquare getSquare): IsoThumpable`
- `getWindowTo(IsoGridSquare next): IsoWindow`
- `getWindowTo(IsoGridSquare next, IsoGridSquare.GetSquare getSquare): IsoWindow`
- `getWorldObjects(): ArrayList<IsoWorldInventoryObject>`
- `getX(): int`
- `getY(): int`
- `getZ(): int`
- `getZombie(): IsoZombie`
- `getZombieCount(): int`
- `getZombiesType(): String`
- `getZone(): Zone`
- `getZoneType(): String`
- `has(int type): boolean`
- `has(String flag): boolean`
- `has(IsoPropertyType flag): boolean`
- `has(IsoPropertyType... flag): boolean`
- `has(IsoFlagType flag): boolean`
- `has(IsoObjectType type): boolean`
- `hasAdjacentCanStandSquare(): boolean`
- `hasAdjacentFireObject(): boolean`
- `hasBlockedDoor(GridSquareEdgeFacingDirection facingDirection): boolean`
- `hasBlockedWindow(GridSquareEdgeFacingDirection facingDirection): boolean`
- `hasBush(): boolean`
- `hasClosedDoorOnEdge(IsoDirections edge): boolean`
- `hasDirt(): boolean`
- `hasDoorOnEdge(IsoDirections edge, boolean ignoreOpen): boolean`
- `hasFarmingPlant(): boolean`
- `hasFence(): boolean`
- `hasFenceInVicinity(): boolean`
- `hasFireObject(): boolean`
- `hasFireplace(): boolean`
- `hasFlies(): boolean`
- `hasFloor(): boolean`
- `hasFloor(boolean north): boolean`
- `hasFloorAtTopOfStairs(): boolean`
- `hasFloorBelow(): boolean`
- `hasFloorOverWater(): boolean`
- `hasGrassLike(): boolean`
- `hasGrave(): boolean`
- `hasGridPower(): boolean`
- `hasGridPower(int offset): boolean`
- `hasIdenticalSlopedSurface(IsoGridSquare other): boolean`
- `hasLitCampfire(): boolean`
- `hasModData(): boolean`
- `hasNaturalFloor(): boolean`
- `hasNonHoppableWall(boolean isNorth): boolean`
- `hasObject(Predicate<IsoObject> checkPredicate): boolean`
- `hasOpenDoorOnEdge(IsoDirections edge): boolean`
- `hasProperty(IsoFlagType flag): boolean`
- `hasRainBlockingTile(): boolean`
- `hasRoomDef(): boolean`
- `hasSand(): boolean`
- `hasSlopedSurface(): boolean`
- `hasSlopedSurfaceToLevelAbove(IsoDirections dir): boolean`
- `hasSupport(): boolean`
- `hasTrash(): boolean`
- `hasTrashReceptacle(): boolean`
- `hasWater(): boolean`
- `hasWindowFrame(): boolean`
- `hasWindowOrWindowFrame(): boolean`
- `hashCodeNoOverride(): int`
- `haveBlood(): boolean`
- `haveBloodFloor(): boolean`
- `haveBloodWall(): boolean`
- `haveDoor(): boolean`
- `haveElectricity(): boolean`
- `haveFire(): boolean`
- `haveGraffiti(): boolean`
- `haveGrime(): boolean`
- `haveGrimeFloor(): boolean`
- `haveGrimeWall(): boolean`
- `haveRoofFull(): boolean`
- `haveStains(): boolean`
- `interpolateLight(ColorInfo inf, float x, float y): void`
- `invalidateRenderChunkLevel(long dirtyFlags): void`
- `invalidateVispolyChunkLevel(): void`
- `isAdjacentTo(IsoGridSquare sq): boolean`
- `isAdjacentToEdgeElement(BiFunction<IsoGridSquare, GridSquareEdge, T> edgeGetter): boolean`
- `isAdjacentToHoppable(): boolean`
- `isAdjacentToWindow(): boolean`
- `isBlockedDoor(GridSquareEdge alongEdge): boolean`
- `isBlockedDoor(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): boolean`
- `isBlockedTo(IsoGridSquare other): boolean`
- `isBlockedTo(IsoGridSquare other, IsoGridSquare.GetSquare getSquare): boolean`
- `isBlockedWindow(GridSquareEdge alongEdge): boolean`
- `isBlockedWindow(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): boolean`
- `isCacheIsFree(): boolean`
- `isCachedIsFree(): boolean`
- `isCanSee(int playerIndex): boolean`
- `isCommonGrass(): boolean`
- `isCouldSee(int playerIndex): boolean`
- `isDerelict(): boolean`
- `isDiagonalTo(IsoGridSquare other): boolean`
- `isDoor(GridSquareEdge alongEdge): boolean`
- `isDoor(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): boolean`
- `isDoor(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isDoorBlockedTo(IsoGridSquare other): boolean`
- `isDoorBlockedTo(IsoGridSquare other, IsoGridSquare.GetSquare getSquare): boolean`
- `isDoorOrWallSquare(): boolean`
- `isDoorSquare(): boolean`
- `isDoorTo(IsoGridSquare other): boolean`
- `isDoorTo(IsoGridSquare other, IsoGridSquare.GetSquare getSquare): boolean`
- `isEastOf(IsoGridSquare other): boolean`
- `isEdgeElement(GridSquareEdge alongEdge, BiPredicate<IsoGridSquare, GridSquareEdgeFacingDirection> facingGetter, IsoGridSquare.GetSquare getSquare): boolean`
- `isEdgeElementTo(IsoGridSquare other, TriPredicate<IsoGridSquare, GridSquareEdge, IsoGridSquare.GetSquare> facingGetter, IsoGridSquare.GetSquare getSquare): boolean`
- `isExtraFreeSquare(): boolean`
- `isFree(boolean bCountOtherCharacters): boolean`
- `isFreeOrMidair(boolean bCountOtherCharacters): boolean`
- `isFreeOrMidair(boolean bCountOtherCharacters, boolean bDoZombie): boolean`
- `isFreeWallPair(IsoDirections dir, boolean both): boolean`
- `isFreeWallSquare(): boolean`
- `isGoodOutsideSquare(): boolean`
- `isGoodSquare(): boolean`
- `isHoppable(GridSquareEdge alongEdge): boolean`
- `isHoppable(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): boolean`
- `isHoppableTo(IsoGridSquare other): boolean`
- `isHoppableTo(IsoGridSquare other, IsoGridSquare.GetSquare getSquare): boolean`
- `isInARoom(): boolean`
- `isInsideRectangle(int x, int y, int w, int h): boolean`
- `isNoGas(): boolean`
- `isNoPower(): boolean`
- `isNoWater(): boolean`
- `isNorthOf(IsoGridSquare other): boolean`
- `isNotBlocked(boolean bCountOtherCharacters): boolean`
- `isOutside(): boolean`
- `isOverlayDone(): boolean`
- `isPlayerAbleToHopWallTo(IsoDirections dir, IsoGridSquare oppositeSq): boolean`
- `isRural(): boolean`
- `isRuralExtraFussy(): boolean`
- `isSafeToSpawn(): boolean`
- `isSafeToSpawn(IsoGridSquare sq, int depth): void`
- `isSameStaircase(int x, int y, int z): boolean`
- `isSeen(int playerIndex): boolean`
- `isSeenByAnyLocalPlayer(): boolean`
- `isShop(): boolean`
- `isSlopedSurfaceEdgeBlocked(IsoDirections edge): boolean`
- `isSolid(): boolean`
- `isSolidFloor(): boolean`
- `isSolidFloorCached(): boolean`
- `isSolidTrans(): boolean`
- `isSomethingTo(IsoGridSquare other): boolean`
- `isSomethingTo(IsoGridSquare other, IsoGridSquare.GetSquare getSquare): boolean`
- `isSouthOf(IsoGridSquare other): boolean`
- `isSpriteOnSouthOrEastWall(IsoObject obj): boolean`
- `isStairBlockedTo(IsoGridSquare other): boolean`
- `isStairsEdgeBlocked(IsoDirections edge): boolean`
- `isUndergroundBlock(): boolean`
- `isUserDefinedBuilding(): boolean`
- `isUserDefinedRoom(): boolean`
- `isVehicleIntersecting(): boolean`
- `isVehicleIntersectingCrops(): boolean`
- `isWall(GridSquareEdge alongEdge): boolean`
- `isWall(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): boolean`
- `isWall(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isWallSquare(): boolean`
- `isWallSquareNW(): boolean`
- `isWallTo(IsoGridSquare other): boolean`
- `isWallTo(IsoGridSquare other, IsoGridSquare.GetSquare getSquare): boolean`
- `isWaterSquare(): boolean`
- `isWestOf(IsoGridSquare other): boolean`
- `isWindow(GridSquareEdge alongEdge): boolean`
- `isWindow(GridSquareEdge alongEdge, IsoGridSquare.GetSquare getSquare): boolean`
- `isWindow(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isWindowBlockedTo(IsoGridSquare other): boolean`
- `isWindowBlockedTo(IsoGridSquare other, IsoGridSquare.GetSquare getSquare): boolean`
- `isWindowOrWindowFrame(IsoObject obj, boolean north): boolean`
- `isWindowTo(IsoGridSquare other): boolean`
- `isWindowTo(IsoGridSquare other, IsoGridSquare.GetSquare getSquare): boolean`
- `load(ByteBuffer b, int worldVersion): void`
- `load(ByteBuffer b, int worldVersion, boolean isDebugSave): void`
- `placeWallAndDoorCheck(IsoObject obj, int index): int`
- `playSound(String file): long`
- `playSound(String file, boolean doWorldSound): long`
- `playSoundLocal(String file): long`
- `putOutCampfire(): void`
- `recalcHashCodeObjects(): void`
- `removeAllDung(): ArrayList<InventoryItem>`
- `removeAllWorldObjects(): void`
- `removeBlood(boolean remote, boolean onlyWall): void`
- `removeCorpse(IsoDeadBody body, boolean bRemote): void`
- `removeErosionObject(String type): void`
- `removeGlassAttachments(IsoWindow window): void`
- `removeGraffiti(): void`
- `removeGrass(): boolean`
- `removeGrime(): void`
- `removeUnderground(): void`
- `removeWorldObject(IsoWorldInventoryObject object): void`
- `renderCharacters(int maxZ, boolean deadRender, boolean doBlendFunc): void`
- `renderDeferredCharacters(int maxZ): void`
- `renderFishSplash(int playerIndex, ColorInfo lightInfo): void`
- `renderFloor(Shader floorShader): int`
- `renderMinusFloor(int maxZ, boolean doSE, boolean vegitationRender, int cutawaySelf, int cutawayN, int cutawayS, int cutawayW, int cutawayE, Shader wallRenderShader): boolean`
- `renderRainSplash(int playerIndex, ColorInfo lightInfo): void`
- `renderRainSplash(int playerIndex, ColorInfo lightInfo, float splashFrame, boolean bRandomXY): void`
- `restackSheetRope(): void`
- `save(ByteBuffer output, ObjectOutputStream outputObj): void`
- `save(ByteBuffer output, ObjectOutputStream outputObj, boolean isDebugSave): void`
- `scoreAsWaypoint(int x, int y): float`
- `set(String tilePropertyKey): void`
- `setAdjacentSquare(IsoDirections dir, IsoGridSquare square): void`
- `setCacheIsFree(boolean cacheIsFree): void`
- `setCachedIsFree(boolean cachedIsFree): void`
- `setCanSee(int playerIndex, boolean canSee): void`
- `setCouldSee(int playerIndex, boolean bCouldSee): void`
- `setDarkMulti(int playerIndex, float darkMulti): void`
- `setE(IsoGridSquare e): void`
- `setHasFlies(boolean hasFlies): void`
- `setHaveElectricity(boolean haveElectricity): void`
- `setHourSeenToCurrent(): void`
- `setID(int id): void`
- `setIsDissolved(int playerIndex, boolean bDissolved, long currentTimeMillis): void`
- `setIsSeen(int playerIndex, boolean bSeen): void`
- `setIsoWorldRegion(IsoWorldRegion mr): void`
- `setLampostTotalB(float lampostTotalB): void`
- `setLampostTotalG(float lampostTotalG): void`
- `setLampostTotalR(float lampostTotalR): void`
- `setLightInfluenceB(ArrayList<Float> lightInfluenceB): void`
- `setLightInfluenceG(ArrayList<Float> lightInfluenceG): void`
- `setLightInfluenceR(ArrayList<Float> lightInfluenceR): void`
- `setLightInfoServerGUIOnly(ColorInfo c): void`
- `setN(IsoGridSquare n): void`
- `setOverlayDone(boolean overlayDone): void`
- `setPlayerCutawayFlag(int playerIndex, int flags, long currentTimeMillis): void`
- `setRainDrop(IsoRaindrop drop): void`
- `setRainSplash(IsoRainSplash splash): void`
- `setRoom(IsoRoom room): void`
- `setRoomID(long roomId): void`
- `setS(IsoGridSquare s): void`
- `setSolidFloor(boolean solidFloor): void`
- `setSolidFloorCached(boolean solidFloorCached): void`
- `setSquareChanged(): void`
- `setTargetDarkMulti(int playerIndex, float targetDarkMulti): void`
- `setTrapPositionX(int trapPositionX): void`
- `setTrapPositionY(int trapPositionY): void`
- `setTrapPositionZ(int trapPositionZ): void`
- `setVertLight(int i, int col, int playerIndex): void`
- `setW(IsoGridSquare w): void`
- `setX(int x): void`
- `setY(int y): void`
- `setZ(int z): void`
- `shouldNotSpawnActivatedRadiosOrTvs(): boolean`
- `shouldRenderFishSplash(int playerIndex): boolean`
- `shouldSave(): boolean`
- `softClear(): void`
- `spawnRandomGenerator(): void`
- `spawnRandomNewGenerator(): void`
- `spawnRandomRuralWorkstation(): void`
- `spawnRandomWorkstation(): void`
- `splatBlood(int dist, float alpha): void`
- `startWaterSplash(boolean isBigSplash): void`
- `startWaterSplash(boolean isBigSplash, float dx, float dy): void`
- `stopFire(): void`
- `switchLight(boolean active): void`
- `syncIsoTrap(HandWeapon weapon, IsoPlayer attacker): void`
- `testCollideAdjacent(IsoMovingObject collideObject, int x, int y, int z): boolean`
- `testCollideAdjacentAdvanced(int x, int y, int z, boolean ignoreDoors): boolean`
- `testCollideSpecialObjects(IsoGridSquare next): IsoObject`
- `testPathFindAdjacent(IsoMovingObject mover, int x, int y, int z): boolean`
- `testPathFindAdjacent(IsoMovingObject mover, int x, int y, int z, IsoGridSquare.GetSquare getter): boolean`
- `testVisionAdjacent(int x, int y, int z, boolean specialDiag, boolean bIgnoreDoors): LosUtil.TestResults`
- `transmitAddObjectToSquare(IsoObject obj, int index): void`
- `transmitModdata(): void`
- `transmitRemoveItemFromSquare(IsoObject obj): int`
- `transmitRemoveItemFromSquare(IsoObject obj, boolean safelyRemove): int`
- `transmitRemoveItemFromSquareOnClients(IsoObject obj): void`
- `transmitStopFire(): void`
- `tryAddCorpseToWorld(InventoryItem item, float x, float y): IsoDeadBody`
- `tryAddCorpseToWorld(InventoryItem item, float x, float y, boolean isVisible): IsoDeadBody`
- `unset(String tilePropertyKey): void`
- `visitNearbySquares(Param param, BiPredicate<IsoGridSquare, IsoGridSquare> squareFilter, BiConsumer<Param, IsoGridSquare> squareVisitor): Param`
- `visitStaticMovingObjects(Class<? extends ObjectType> objectType, Param param, Predicate<ObjectType> objectFilter, BiConsumer<Param, ObjectType> objectVisitor): Param`
- `visitStaticMovingObjectsInNearbySquares(Class<? extends ObjectType> objectType, Param param, BiPredicate<IsoGridSquare, IsoGridSquare> squareFilter, Predicate<ObjectType> objectFilter, BiConsumer<Param, ObjectType> objectVisitor): Param`

Static functions, called as `IsoGridSquare.name(...)`:

- `getDarkStep(): float`
- `getDefColorInfo(): ColorInfo`
- `getLightcache(): int`
- `getMatrixBit(int matrix, byte x, byte y, byte z): boolean`
- `getMatrixBit(int matrix, int x, int y, int z): boolean`
- `getNew(ArrayDeque<IsoGridSquare> isoGridSquareCache, IsoCell cell, SliceY slice, int x, int y, int z): IsoGridSquare`
- `getNew(IsoCell cell, SliceY slice, int x, int y, int z): IsoGridSquare`
- `getRecalcLightTime(): float`
- `getSquaresForThread(ArrayDeque<IsoGridSquare> isoGridSquareCacheDest, int count): void`
- `isBlockedDoor(IsoObject obj, GridSquareEdgeFacingDirection facingDirection): boolean`
- `isbDoSlowPathfinding(): boolean`
- `setBlendFunc(): void`
- `setCollisionMode(): void`
- `setDarkStep(float aDarkStep): void`
- `setLightcache(int aLightcache): void`
- `setMatrixBit(int matrix, byte x, byte y, byte z, boolean val): int`
- `setMatrixBit(int matrix, int x, int y, int z, boolean val): int`
- `setRecalcLightTime(float aRecalcLightTime): void`
- `setbDoSlowPathfinding(boolean abDoSlowPathfinding): void`
- `toBoolean(byte[] data): boolean`

Constructors: `IsoGridSquare.new(IsoCell cell, SliceY slice, int x, int y, int z)`.

Static fields (a copy of the value taken when the class is exposed): `ADD_UNDERGROUND_BLOCKS: boolean`, `FLOORS_BURNT_SPRITE_PREFIX: String`, `PCF_NONE: byte`, `PCF_NORTH: byte`, `PCF_WEST: byte`, `USE_WALL_SHADER: boolean`, `WALL_TYPE_E: int`, `WALL_TYPE_N: int`, `WALL_TYPE_S: int`, `WALL_TYPE_W: int`, `bmod: float`, `cellGetSquare: IsoGridSquare.GetSquare`, `choices: ArrayList<IsoGridSquare>`, `circleStencil: boolean`, `gmod: float`, `gridSquareCacheEmptyTimer: int`, `idMax: int`, `ignoreBlockingSprites: ArrayList<String>`, `isOnScreenLast: boolean`, `isoGridSquareCache: CappedConcurrentQueue<IsoGridSquare>`, `loadGridSquareCache: ArrayDeque<IsoGridSquare>`, `recalcLightTime: float`, `rmod: float`, `useSlowCollision: boolean`.

### IsoHeatSource

`zombie.iso.IsoHeatSource`, class.

Methods, called as `obj:name(...)`:

- `getRadius(): int`
- `getTemperature(): int`
- `getX(): int`
- `getY(): int`
- `getZ(): int`
- `isInBounds(): boolean`
- `isInBounds(int minX, int minY, int maxX, int maxY): boolean`
- `setRadius(int radius): void`
- `setTemperature(int temperature): void`

Constructors: `IsoHeatSource.new(int x, int y, int z, int radius, int temperature)`.

### IsoLightSource

`zombie.iso.IsoLightSource`, class.

Methods, called as `obj:name(...)`:

- `clearInfluence(): void`
- `getB(): float`
- `getG(): float`
- `getLocalToBuilding(): IsoBuilding`
- `getR(): float`
- `getRadius(): int`
- `getSwitches(): ArrayList<IsoLightSwitch>`
- `getX(): int`
- `getY(): int`
- `getZ(): int`
- `isActive(): boolean`
- `isHydroPowered(): boolean`
- `isInBounds(): boolean`
- `isInBounds(int minX, int minY, int maxX, int maxY): boolean`
- `setActive(boolean bActive): void`
- `setB(float b): void`
- `setG(float g): void`
- `setR(float r): void`
- `setRadius(int radius): void`
- `setSwitches(ArrayList<IsoLightSwitch> switches): void`
- `setWasActive(boolean bWasActive): void`
- `setX(int x): void`
- `setY(int y): void`
- `setZ(int z): void`
- `update(): void`
- `wasActive(): boolean`

Constructors: `IsoLightSource.new(int x, int y, int z, float r, float g, float b, int radius)`, `IsoLightSource.new(int x, int y, int z, float r, float g, float b, int radius, int life)`, `IsoLightSource.new(int x, int y, int z, float r, float g, float b, int radius, IsoBuilding building)`.

Static fields (a copy of the value taken when the class is exposed): `nextId: int`.

### IsoLot

`zombie.iso.IsoLot`, class.

Methods, called as `obj:name(...)`:

- `load(MapFiles mapFiles, Integer cX, Integer cY, Integer wX, Integer wY, IsoChunk ch): void`
- `loadNew(int cX, int cY, int wX, int wY, IsoChunk ch): void`

Static functions, called as `IsoLot.name(...)`:

- `Dispose(): void`
- `get(MapFiles mapFiles, int cX, int cY, int wX, int wY, IsoChunk ch): IsoLot`
- `get(MapFiles mapFiles, Integer cX, Integer cY, Integer wX, Integer wY, IsoChunk ch): IsoLot`
- `getHeader(int cellX, int cellY): LotHeader`
- `put(IsoLot lot): void`
- `readInt(RandomAccessFile in): int`
- `readShort(RandomAccessFile in): int`
- `readString(BufferedRandomAccessFile in): String`

Constructors: `IsoLot.new()`.

Static fields (a copy of the value taken when the class is exposed): `InfoFileModded: HashMap<String, ChunkGenerationStatus>`, `InfoFileNames: HashMap<String, String>`, `InfoHeaderNames: ArrayList<String>`, `InfoHeaders: HashMap<String, LotHeader>`, `MapFiles: ArrayList<MapFiles>`, `pool: ObjectPool<IsoLot>`.

### IsoLuaMover

`zombie.iso.IsoLuaMover`, class. Extends [IsoGameCharacter](/pz/build-42/modding/reference/lua-classes-characters-2#isogamecharacter). Also has the methods of [IsoGameCharacter](/pz/build-42/modding/reference/lua-classes-characters-2#isogamecharacter) (1,193), [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (44), [IsoMovingObject](#isomovingobject) (171), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (386), listed on their own entries.

Methods, called as `obj:name(...)`:

- `AcceptGrapple(IGrappleable grappleAcceptor, String grappleType): void` from `IGrappleableWrapper`
- `Grappled(IGrappleable grappler, HandWeapon weapon, float grappleEffectiveness, String grappleType): void` from `IGrappleableWrapper`
- `GrapplerLetGo(IGrappleable grappler, String grappleResult): void` from `IGrappleableWrapper`
- `LetGoOfGrappled(String grappleResult): void` from `IGrappleableWrapper`
- `RejectGrapple(IGrappleable grappleRejector): void` from `IGrappleableWrapper`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addAnimEventListener(String animEventName, IAnimEventListenerEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackEnum<E> listener, E defaultValue): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListener listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerBoolean listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerFloat listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoParam listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrack listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerNoTrackString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(String animEventName, IAnimEventListenerString listener): void` from `IAnimEventWrappedBroadcaster`
- `addAnimEventListener(IAnimEventListenerSetVariableString listener): void` from `IAnimEventWrappedBroadcaster`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `IAnimEventWrappedBroadcaster`
- `canBeHitByVehicle(BaseVehicle impactingVehicle): boolean` from `IStateCharacter`
- `canCurrentStateRagdoll(): boolean` from `IStateCharacter`
- `canSlowDownVehicleWhenHit(BaseVehicle impactingVehicle): boolean` from `IStateCharacter`
- `canTransitionToState(String stateName): boolean` from `IAnimatable`
- `containsVariable(String name): boolean` from `IAnimationVariableSourceContainer`
- `frameStep(): void` from `ECSEntity`
- `getBearingFromGrappledTarget(): float` from `IGrappleableWrapper`
- `getBearingToGrappledTarget(): float` from `IGrappleableWrapper`
- `getCharacterInputComponent(): CharacterInputComponent` from `CharacterInputComponentEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGrappleOffset(Vector3f result): Vector3f` from `IGrappleableWrapper`
- `getGrappleOffset(Vector3 result): Vector3` from `IGrappleableWrapper`
- `getGrappleOffsetBehaviour(): GrappleOffsetBehaviour` from `IGrappleableWrapper`
- `getGrapplePosOffsetForward(): float` from `IGrappleableWrapper`
- `getGrappleResult(): String` from `IGrappleableWrapper`
- `getGrappleRotOffsetYaw(): float` from `IGrappleableWrapper`
- `getGrappledBy(): IGrappleable` from `IGrappleableWrapper`
- `getGrappledByString(): String` from `IGrappleableWrapper`
- `getGrappledByType(): String` from `IGrappleableWrapper`
- `getGrapplingTarget(): IGrappleable` from `IGrappleableWrapper`
- `getInputMode(): CharacterInputMode` from `CharacterInputComponentEntity`
- `getInputMoveVector(Vector2 out): Vector2` from `CharacterInputComponentEntity`
- `getInputMovementRate(): float` from `CharacterInputComponentEntity`
- `getJoypadBind(): int` from `CharacterInputComponentEntity`
- `getObjectName(): String`
- `getOnlineID(): short` from `IAnimatable`
- `getSharedGrappleAnimFraction(): float` from `IGrappleableWrapper`
- `getSharedGrappleAnimNode(): String` from `IGrappleableWrapper`
- `getSharedGrappleAnimTime(): float` from `IGrappleableWrapper`
- `getSharedGrappleType(): String` from `IGrappleableWrapper`
- `getVariable(String key): IAnimationVariableSlot` from `IAnimationVariableSourceContainer`
- `getVariableBoolean(AnimationVariableHandle handle): boolean` from `IAnimationVariableSource`
- `getVariableBoolean(String name): boolean` from `IAnimationVariableSourceContainer`
- `getVariableBoolean(String key, boolean defaultVal): boolean` from `IAnimationVariableSourceContainer`
- `getVariableEnum(String key, EnumType defaultVal): EnumType` from `IAnimationVariableSource`
- `getVariableFloat(String name, float defaultVal): float` from `IAnimationVariableSourceContainer`
- `getVariableString(String name): String` from `IAnimationVariableSourceContainer`
- `hasCurrentState(): boolean` from `IStateCharacter`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isAimKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isAllowRun(): boolean` from `CharacterInputComponentEntity`
- `isAllowSprint(): boolean` from `CharacterInputComponentEntity`
- `isAnyAimKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isAttackButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isBeingGrappled(): boolean` from `IGrappleableWrapper`
- `isBeingGrappledBy(IGrappleable grappledBy): boolean` from `IGrappleableWrapper`
- `isBuildButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isBuildButtonReleased(): boolean` from `CharacterInputComponentEntity`
- `isChangeCharacterKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isCrouchButtonPressed(): boolean` from `CharacterInputComponentEntity`
- `isCurrentStateAttacking(): boolean` from `IStateCharacter`
- `isCurrentStateMoving(): boolean` from `IStateCharacter`
- `isDoContinueGrapple(): boolean` from `IGrappleableWrapper`
- `isDoGrapple(): boolean` from `IGrappleableWrapper`
- `isF12KeyDown(): boolean` from `CharacterInputComponentEntity`
- `isForceAim(): boolean` from `CharacterInputComponentEntity`
- `isForceRun(): boolean` from `CharacterInputComponentEntity`
- `isForceSprint(): boolean` from `CharacterInputComponentEntity`
- `isGrappling(): boolean` from `IGrappleableWrapper`
- `isGrapplingTarget(IGrappleable grapplingTarget): boolean` from `IGrappleableWrapper`
- `isIgnoreInputsForDirection(): boolean` from `CharacterInputComponentEntity`
- `isIgnoringAimingInput(): boolean` from `CharacterInputComponentEntity`
- `isInputMoveAxisApplied(): boolean` from `CharacterInputComponentEntity`
- `isInteractButtonClicked(): boolean` from `CharacterInputComponentEntity`
- `isInteractButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isInteractButtonPressed(): boolean` from `CharacterInputComponentEntity`
- `isJoypadButtonsActive(): boolean` from `CharacterInputComponentEntity`
- `isJoypadIgnoreAimUntilCentered(): boolean` from `CharacterInputComponentEntity`
- `isManualFloorAtkButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isMeleeButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isPerformingAnyGrappleAnimation(): boolean` from `IGrappleableWrapper`
- `isPerformingGrappleGrabAnimation(): boolean` from `IGrappleableWrapper`
- `isPrecisionAimKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isRunButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isShiftKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isSprintButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isVariable(String name, String val): boolean` from `IAnimationVariableSourceContainer`
- `isWalkToButtonDown(): boolean` from `CharacterInputComponentEntity`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `playAnim(String name, float seconds, boolean looped, boolean playing): void`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `render(float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `resetGrappleStateToDefault(String grappleResult): void` from `IGrappleableWrapper`
- `setAllowRun(boolean allowRun): void` from `CharacterInputComponentEntity`
- `setAllowSprint(boolean allowSprint): void` from `CharacterInputComponentEntity`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setDoContinueGrapple(boolean doContinueGrapple): void` from `IGrappleableWrapper`
- `setDoGrapple(boolean doGrapple): void` from `IGrappleableWrapper`
- `setDoGrappleLetGo(): void` from `IGrappleable`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setForceAim(boolean forceAim): void` from `CharacterInputComponentEntity`
- `setForceRun(boolean forceRun): void` from `CharacterInputComponentEntity`
- `setForceSprint(boolean forceSprint): void` from `CharacterInputComponentEntity`
- `setGrappleDeferredOffset(Vector3f grappleOffset): void` from `IGrappleable`
- `setGrappleDeferredOffset(Vector3 grappleOffset): void` from `IGrappleable`
- `setGrappleDeferredOffset(float x, float y, float z): void` from `IGrappleableWrapper`
- `setGrapplePosOffsetForward(float grappleOffsetForward): void` from `IGrappleableWrapper`
- `setGrappleResult(String grappleResult): void` from `IGrappleableWrapper`
- `setGrappleRotOffsetYaw(float grappleOffsetYaw): void` from `IGrappleableWrapper`
- `setGrappleoffsetBehaviour(GrappleOffsetBehaviour newBehaviour): void` from `IGrappleableWrapper`
- `setIgnoreAimingInput(boolean b): void` from `CharacterInputComponentEntity`
- `setIgnoreInputsForDirection(boolean ignoreInputsForDirection): void` from `CharacterInputComponentEntity`
- `setJoypadBind(int joypadBind): void` from `CharacterInputComponentEntity`
- `setJoypadButtonsActive(boolean joypadMovementActive): void` from `CharacterInputComponentEntity`
- `setJoypadIgnoreAim(boolean ignore): void` from `CharacterInputComponentEntity`
- `setJoypadIgnoreAimUntilCentered(boolean ignore): void` from `CharacterInputComponentEntity`
- `setPerformingGrappleGrabAnimation(boolean grappleGrabAnim): void` from `IGrappleableWrapper`
- `setPosition(Vector3 position): void` from `IGrappleable`
- `setSharedGrappleAnimFraction(float grappleAnimFraction): void` from `IGrappleableWrapper`
- `setSharedGrappleAnimNode(String sharedGrappleAnimNode): void` from `IGrappleableWrapper`
- `setSharedGrappleAnimTime(float grappleAnimTime): void` from `IGrappleableWrapper`
- `setSharedGrappleType(String sharedGrappleType): void` from `IGrappleableWrapper`
- `setTargetGrapplePos(Vector3f grapplePos): void` from `IGrappleable`
- `setTargetGrapplePos(Vector3 grapplePos): void` from `IGrappleable`
- `setTargetGrappleRotation(Vector2 forward): void` from `IGrappleable`
- `setTargetGrappleRotation(float x, float y): void` from `IGrappleableWrapper`
- `setVariable(String key, Class<EnumType> enumTypeClass, Supplier<EnumType> callbackGet, Consumer<EnumType> callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, Class<EnumType> enumTypeClass, Supplier<EnumType> callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, boolean defaultVal, AnimationVariableSlotCallbackBool.CallbackGetStrongTyped callbackGet, AnimationVariableSlotCallbackBool.CallbackSetStrongTyped callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, boolean defaultVal, AnimationVariableSlotCallbackBool.CallbackGetStrongTyped callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, float defaultVal, AnimationVariableSlotCallbackFloat.PrimitiveFloatSupplier callbackGet, AnimationVariableSlotCallbackFloat.PrimitiveFloatConsumer callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, float defaultVal, AnimationVariableSlotCallbackFloat.PrimitiveFloatSupplier callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, int defaultVal, AnimationVariableSlotCallbackInt.PrimitiveIntSupplier callbackGet, AnimationVariableSlotCallbackInt.PrimitiveIntConsumer callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, int defaultVal, AnimationVariableSlotCallbackInt.PrimitiveIntSupplier callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, String defaultVal, AnimationVariableSlotCallbackString.CallbackGetStrongTyped callbackGet, AnimationVariableSlotCallbackString.CallbackSetStrongTyped callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, String defaultVal, AnimationVariableSlotCallbackString.CallbackGetStrongTyped callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, AnimationVariableSlotCallbackBool.CallbackGetStrongTyped callbackGet, AnimationVariableSlotCallbackBool.CallbackSetStrongTyped callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, AnimationVariableSlotCallbackBool.CallbackGetStrongTyped callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, AnimationVariableSlotCallbackFloat.PrimitiveFloatSupplier callbackGet, AnimationVariableSlotCallbackFloat.PrimitiveFloatConsumer callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, AnimationVariableSlotCallbackFloat.PrimitiveFloatSupplier callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, AnimationVariableSlotCallbackInt.PrimitiveIntSupplier callbackGet, AnimationVariableSlotCallbackInt.PrimitiveIntConsumer callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, AnimationVariableSlotCallbackInt.PrimitiveIntSupplier callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, AnimationVariableSlotCallbackString.CallbackGetStrongTyped callbackGet, AnimationVariableSlotCallbackString.CallbackSetStrongTyped callbackSet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `setVariable(String key, AnimationVariableSlotCallbackString.CallbackGetStrongTyped callbackGet, IAnimationVariableSlotDescriptor descriptor): void` from `IAnimationVariableRegistry`
- `toggleForceAim(): boolean` from `CharacterInputComponentEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`
- `wasRunButtonDown(): boolean` from `CharacterInputComponentEntity`

Constructors: `IsoLuaMover.new(KahluaTable table)`.

Static fields (a copy of the value taken when the class is exposed): `AwkwardGlovesStrengthDivisor: int`, `DEFAULT_ENTITY_DISPLAY_NAME: String`, `GlovesStrengthBonus: int`, `HUMANOID_SCREEN_CHEST_HEIGHT: float`, `HUMANOID_WORLD_CHEST_HEIGHT: float`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `RENDER_OFFSET_X: int`, `RENDER_OFFSET_Y: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `WALK_SPEED_DEFAULT: float`, `WALK_SPEED_SLOW: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `s_maxPossibleTwist: float`, `treeSoundMgr: TreeSoundManager`.

### IsoMarkers

`zombie.iso.IsoMarkers`, class.

Methods, called as `obj:name(...)`:

- `addIsoMarker(String spriteName, IsoGridSquare gs, float r, float g, float b, float alpha): IsoMarkers.IsoMarker`
- `addIsoMarker(KahluaTable textureTable, IsoGridSquare gs, float r, float g, float b, float alpha): IsoMarkers.IsoMarker`
- `addIsoMarker(InventoryItem item, IsoGridSquare gs, float r, float g, float b, float alpha, float rotation): IsoMarkers.IsoMarker`
- `getIsoMarker(int id): IsoMarkers.IsoMarker`
- `removeIsoMarker(int id): boolean`
- `removeIsoMarker(IsoMarkers.IsoMarker marker): boolean`
- `render(): void`
- `renderIsoMarkers(IsoCell.PerPlayerRender perPlayerRender, int zLayer, int playerIndex): void`
- `reset(): void`
- `update(): void`

Static fields (a copy of the value taken when the class is exposed): `instance: IsoMarkers`.

### IsoMarkers.IsoMarker

`zombie.iso.IsoMarkers.IsoMarker`, class.

Methods, called as `obj:name(...)`:

- `getA(): float`
- `getB(): float`
- `getCircleSize(): float`
- `getG(): float`
- `getID(): int`
- `getR(): float`
- `getSquare(): IsoGridSquare`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `init(String spriteName, int x, int y, int z, IsoGridSquare gs): void`
- `init(KahluaTable textureTable, int x, int y, int z, IsoGridSquare gs): void`
- `init(InventoryItem item, int x, int y, int z, IsoGridSquare gs): void`
- `isActive(): boolean`
- `isRemoved(): boolean`
- `remove(): void`
- `setA(float a): void`
- `setActive(boolean active): void`
- `setAlpha(float alpha): void`
- `setB(float b): void`
- `setCircleSize(float size): void`
- `setColor(float r, float g, float b, float a): void`
- `setG(float g): void`
- `setPos(int x, int y, int z): void`
- `setR(float r): void`
- `setRotation(float rotation): void`
- `setSquare(IsoGridSquare square): void`

Constructors: `IsoMarkers.IsoMarker.new()`.

### IsoMetaCell

`zombie.iso.IsoMetaCell`, class.

Methods, called as `obj:name(...)`:

- `Dispose(): void`
- `addAnimalZone(AnimalZone animalZone): void`
- `addRoom(RoomDef room, int cellX, int cellY): void`
- `addRooms(ArrayList<RoomDef> rooms, int cellX, int cellY): void`
- `addTrigger(BuildingDef def, int triggerRange, int zombieExclusionRange, String type): void`
- `addZone(Zone zone, int cellX, int cellY): void`
- `checkAnimalZonesGenerated(int chunkX, int chunkY): void`
- `checkTriggers(): void`
- `clearAnimalZones(): void`
- `clearChunk(int i): void`
- `getAnimalZone(int index): AnimalZone`
- `getAnimalZonesSize(): int`
- `getBuildingCount(): int`
- `getBuildingCount(boolean bExcludeUserDefined): int`
- `getBuildingsIntersecting(int x, int y, int w, int h, ArrayList<BuildingDef> result): void`
- `getChunk(int i): IsoMetaChunk`
- `getChunk(int x, int y): IsoMetaChunk`
- `getRoomCount(): int`
- `getRoomCount(boolean bExcludeUserDefined): int`
- `getRoomsIntersecting(int x, int y, int w, int h, ArrayList<RoomDef> result): void`
- `getX(): int`
- `getY(): int`
- `getZonesIntersecting(int x, int y, int z, int w, int h, ArrayList<Zone> result): void`
- `getZonesUnique(Set<Zone> result): void`
- `hasChunk(int i): boolean`
- `hasChunk(int x, int y): boolean`
- `load(IsoMetaGrid grid, ByteBuffer input, int worldVersion): void`
- `removeRoom(RoomDef room): void`
- `removeRooms(ArrayList<RoomDef> rooms): void`
- `removeRooms(ArrayList<RoomDef> rooms, int userDefined): void`
- `removeZone(Zone zone): void`
- `save(ByteBuffer output): void`

Constructors: `IsoMetaCell.new(int wx, int wy)`.

### IsoMetaChunk

`zombie.iso.IsoMetaChunk`, class.

Methods, called as `obj:name(...)`:

- `Dispose(): void`
- `addRoom(RoomDef room): void`
- `addZone(Zone zone): void`
- `clearRooms(): void`
- `clearZones(): void`
- `compactRoomDefArray(): void`
- `compactZoneArray(): void`
- `doesHaveForaging(): boolean`
- `doesHaveZone(String zone): boolean`
- `getAssociatedBuildingAt(int x, int y): BuildingDef`
- `getBuildingsIntersecting(int x, int y, int w, int h, ArrayList<BuildingDef> result): void`
- `getEmptyOutsideAt(int x, int y, int z): RoomDef`
- `getLootZombieIntensity(): float`
- `getRoomAt(int x, int y, int z): RoomDef`
- `getRoomsIntersecting(int x, int y, int w, int h, ArrayList<RoomDef> result): void`
- `getRoomsSize(): int`
- `getUnadjustedZombieIntensity(): int`
- `getZombieIntensity(): float`
- `getZombieIntensity(boolean bRandom): float`
- `getZone(int index): Zone`
- `getZoneAt(int x, int y, int z): Zone`
- `getZoneAt(int x, int y, int z, String zone): Zone`
- `getZonesAt(int x, int y, int z): ArrayList<Zone>`
- `getZonesAt(int x, int y, int z, ArrayList<Zone> result): ArrayList<Zone>`
- `getZonesIntersecting(int x, int y, int z, int w, int h, ArrayList<Zone> result): void`
- `getZonesSize(): int`
- `getZonesUnique(Set<Zone> result): void`
- `removeRoom(RoomDef room): void`
- `removeZone(Zone zone): void`
- `setZombieIntensity(byte zombieIntensity): void`

Constructors: `IsoMetaChunk.new()`.

Static fields (a copy of the value taken when the class is exposed): `zombiesFullPerChunk: float`, `zombiesMinPerChunk: float`.

### IsoMetaGrid

`zombie.iso.IsoMetaGrid`, class.

Methods, called as `obj:name(...)`:

- `AddToMeta(IsoGameCharacter isoPlayer): void`
- `Create(): void`
- `CreateStep1(): void`
- `CreateStep2(): void`
- `Dispose(): void`
- `RemoveFromMeta(IsoPlayer isoPlayer): void`
- `addCellToSave(IsoMetaCell cell): void`
- `addRoomsToAdjacentCells(BuildingDef buildingDef): void`
- `addRoomsToAdjacentCells(BuildingDef buildingDef, ArrayList<RoomDef> roomDefs): void`
- `addZone(Zone zone): void`
- `checkVehiclesZones(): void`
- `countNearbyBuildingsRooms(IsoPlayer isoPlayer): int`
- `countRoomsIntersecting(int x, int y, int w, int h): int`
- `getAssociatedBuildingAt(int x, int y): BuildingDef`
- `getBuildingAt(int x, int y): BuildingDef`
- `getBuildingAt(int x, int y, int z): BuildingDef`
- `getBuildingAtRelax(int x, int y): BuildingDef`
- `getBuildings(): ArrayList<BuildingDef>`
- `getBuildingsIntersecting(int x, int y, int w, int h, ArrayList<BuildingDef> result): void`
- `getCell(int x, int y): IsoMetaCell`
- `getCellData(int x, int y): IsoMetaCell`
- `getCellDataAbs(int x, int y): IsoMetaCell`
- `getCellOrCreate(int x, int y): IsoMetaCell`
- `getChunkData(int chunkX, int chunkY): IsoMetaChunk`
- `getChunkDataFromTile(int x, int y): IsoMetaChunk`
- `getCurrentCellData(): IsoMetaCell`
- `getCurrentChunkData(): IsoMetaChunk`
- `getEmptyOutsideAt(int x, int y, int z): RoomDef`
- `getHeight(): int`
- `getLotDirectories(): ArrayList<String>`
- `getMaxX(): int`
- `getMaxY(): int`
- `getMetaGridFromTile(int wx, int wy): IsoMetaCell`
- `getMinX(): int`
- `getMinY(): int`
- `getRandomIndoorCoord(): Vector2`
- `getRandomRoomBetweenRange(float x, float y, float min, float max): RoomDef`
- `getRandomRoomNotInRange(float x, float y, int range): RoomDef`
- `getRemovedBuildings(): ArrayList<RemovedBuilding>`
- `getRoomAt(int x, int y, int z): RoomDef`
- `getRoomByID(long roomID): IsoRoom`
- `getRoomDefByID(long roomID): RoomDef`
- `getRoomsIntersecting(int x, int y, int w, int h, ArrayList<RoomDef> roomDefs): void`
- `getVehicleZoneAt(int x, int y, int z): VehicleZone`
- `getWidth(): int`
- `getZoneAt(int x, int y, int z): Zone`
- `getZoneWithBoundsAndType(int x, int y, int z, int w, int h, String type): Zone`
- `getZones(): List<Zone>`
- `getZonesAt(int x, int y, int z): ArrayList<Zone>`
- `getZonesAt(int x, int y, int z, ArrayList<Zone> result): ArrayList<Zone>`
- `getZonesIntersecting(int x, int y, int z, int w, int h): ArrayList<Zone>`
- `getZonesIntersecting(int x, int y, int z, int w, int h, ArrayList<Zone> result): ArrayList<Zone>`
- `gridX(): int`
- `gridY(): int`
- `hasCell(int x, int y): boolean`
- `hasCellData(int x, int y): MetaCellPresence`
- `isChunkLoaded(int wx, int wy): boolean`
- `isValidChunk(int wx, int wy): boolean`
- `isValidSquare(int x, int y): boolean`
- `isZoneAbove(Zone zone1, Zone zone2, int x, int y, int z): boolean`
- `load(): void`
- `load(String inFilePath, BiConsumer<ByteBuffer, Integer> loadMethod): void`
- `load(ByteBuffer input): void`
- `loadAnimalZones(ByteBuffer input, int worldVersion): void`
- `loadCells(String path, String filter, QuadConsumer<IsoMetaCell, IsoMetaGrid, ByteBuffer, Integer> loadMethod): void`
- `loadZone(ByteBuffer input, int worldVersion): void`
- `processZones(): void`
- `registerAnimalZone(String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): Zone`
- `registerAnimalZone(AnimalZone animalZone): Zone`
- `registerAnimalZone(AnimalZone animalZone, boolean bHotSave): Zone`
- `registerGeometryZone(String name, String type, int z, String geometry, KahluaTable pointsTable, KahluaTable properties): Zone`
- `registerGeometryZone(String name, String type, int z, ZoneGeometryType geometryType, TIntArrayList points, KahluaTable properties, int width): Zone`
- `registerMannequinZone(String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): Zone`
- `registerRoomTone(String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): void`
- `registerVehiclesZone(String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): Zone`
- `registerWorldGenZone(String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): Zone`
- `registerZone(String name, String type, int x, int y, int z, int width, int height): Zone`
- `registerZone(String name, String type, int x, int y, int z, int width, int height, ZoneGeometryType geometryType, TIntArrayList points, int polylineWidth): Zone`
- `registerZone(Zone zone): Zone`
- `registerZoneNoOverlap(String name, String type, int x, int y, int z, int width, int height): Zone`
- `removeRoomsFromAdjacentCells(ArrayList<RoomDef> rooms, int cellX1, int cellY1, int cellX2, int cellY2, int userDefined): void`
- `removeRoomsFromAdjacentCells(BuildingDef buildingDef): void`
- `removeZone(Zone zone): void`
- `removeZonesForLotDirectory(String lotDir): void`
- `save(): void`
- `save(ByteBuffer output): void`
- `saveAnimalZones(ByteBuffer output): void`
- `saveCellsToSaveBufferMap(SaveBufferMap bufferMap, String path, String filter, BiConsumer<IsoMetaCell, ByteBuffer> saveMethod): void`
- `savePart(ByteBuffer output, int part, boolean fromServer): void`
- `saveToBufferMap(SaveBufferMap bufferMap): void`
- `saveToSaveBufferMap(SaveBufferMap bufferMap, String fileName, Consumer<ByteBuffer> saveMethod): void`
- `saveZone(ByteBuffer output): void`
- `setCell(int x, int y, IsoMetaCell cell): void`
- `setCellData(int x, int y, IsoMetaCell cell): void`
- `wasLoaded(): boolean`

Constructors: `IsoMetaGrid.new()`.

Static fields (a copy of the value taken when the class is exposed): `ANY_Z: int`, `IDEAL_MAX_ZONE_SIZE: int`, `TL_Location: ThreadLocal<IsoGameCharacter.Location>`, `clipperBuffer: ByteBuffer`, `clipperOffset: ClipperOffset`.

### IsoMovingObject

`zombie.iso.IsoMovingObject`, class. Extends [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (397), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Despawn(): void`
- `DistTo(int x, int y): float`
- `DistTo(IsoMovingObject other): float`
- `DistToProper(IsoObject other): float`
- `DistToSquared(float x, float y): float`
- `DistToSquared(IsoMovingObject other): float`
- `DoCollideNorS(): void`
- `DoCollideWorE(): void`
- `Hit(HandWeapon weapon, IsoGameCharacter wielder, float damageSplit, boolean bIgnoreDamage, float modDelta): float`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `closeAnimationRecorder(): void`
- `collideWith(IsoObject obj): void`
- `compareToY(IsoMovingObject other): int`
- `distToNearestCamCharacter(): float`
- `doStairs(): void`
- `ensureOnTile(): void`
- `findCurrentGridSquare(): IsoGridSquare`
- `frameStep(): void` from `ECSEntity`
- `getAnimationRecorder(): AnimationPlayerRecorder`
- `getBuilding(): IsoBuilding`
- `getBumpedType(IsoGameCharacter bumped): String`
- `getClosestObject(List<ObjectType> objects): ObjectType`
- `getClosestStaticMovingObjectInNearbySquares(Class<? extends ObjectType> objectType, BiPredicate<IsoGridSquare, IsoGridSquare> squareFilter, Predicate<ObjectType> objectFilter): ObjectType`
- `getCollideType(): String`
- `getCollidedObject(): IsoObject`
- `getCurrentBuilding(): IsoBuilding`
- `getCurrentSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getCurrentSquare(): IsoGridSquare`
- `getCurrentZone(): Zone`
- `getDescription(String separatorStr): String`
- `getDistanceSq(IsoMovingObject other): float`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getEatingZombies(): ArrayList<IsoZombie>`
- `getFacingPosition(Vector2 pos): Vector2`
- `getFeelerTile(float dist): IsoGridSquare`
- `getFeelersize(): float`
- `getFrameNo(): int` from `ECSEntity`
- `getFuturWalkedSquare(): IsoGridSquare`
- `getGlobalMovementMod(): float`
- `getGlobalMovementMod(boolean bDoNoises): float`
- `getHitDir(): Vector2`
- `getHitForce(): float`
- `getHitFromAngle(): float`
- `getID(): int`
- `getImpulsex(): float`
- `getImpulsey(): float`
- `getLastCollideTime(): float`
- `getLastSquare(): IsoGridSquare`
- `getLastTargettedBy(): IsoZombie`
- `getLastX(): float`
- `getLastY(): float`
- `getLastZ(): float`
- `getLimpulsex(): float`
- `getLimpulsey(): float`
- `getMasterRegion(): IWorldRegion`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getMovementLastFrame(): Vector2`
- `getMovingSquare(): IsoGridSquare`
- `getNextX(): float`
- `getNextXi(): int`
- `getNextY(): float`
- `getNextYi(): int`
- `getNoDamage(): boolean`
- `getObjectName(): String`
- `getPathFindIndex(): int`
- `getPosition(Vector3f out): Vector3f`
- `getPosition(Vector2 out): Vector2`
- `getPosition(Vector3 position): Vector3`
- `getScreenX(): float`
- `getScreenY(): float`
- `getSquare(): IsoGridSquare`
- `getStateEventDelayTimer(): float`
- `getSurroundingThumpers(): int`
- `getThumpTarget(): Thumpable`
- `getTimeSinceZombieAttack(): int`
- `getUID(): String`
- `getVectorFromDirection(Vector2 moveForwardVec): Vector2`
- `getWeight(): float`
- `getWeight(float x, float y): float`
- `getWidth(): float`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isAnimationRecorderActive(): boolean`
- `isCharacter(): boolean`
- `isCloseKilled(): boolean`
- `isCollidable(): boolean`
- `isCollided(): boolean`
- `isCollidedE(): boolean`
- `isCollidedN(): boolean`
- `isCollidedS(): boolean`
- `isCollidedThisFrame(): boolean`
- `isCollidedW(): boolean`
- `isCollidedWithDoor(): boolean`
- `isCollidedWithVehicle(): boolean`
- `isCrawling(): boolean`
- `isDestroyed(): boolean`
- `isEatingOther(IsoMovingObject other): boolean`
- `isExistInTheWorld(): boolean`
- `isFirstUpdate(): boolean`
- `isGettingUp(): boolean`
- `isOnFloor(): boolean`
- `isProne(): boolean`
- `isPushableForSeparate(): boolean`
- `isPushedByForSeparate(IsoMovingObject other): boolean`
- `isShootable(): boolean`
- `isSolid(): boolean`
- `isSolidForSeparate(): boolean`
- `isStanding(): boolean`
- `isTransparentWallTo(IsoMovingObject target): boolean`
- `isWithinRange(IsoMovingObject object, float minRange): boolean`
- `isbAltCollide(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `moveUnmodded(float diffX, float diffY): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onMouseRightClick(int lx, int ly): void`
- `postupdate(): void`
- `preupdate(): void`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromSquare(): void`
- `removeFromWorld(): void`
- `renderlast(): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `separate(): void`
- `setAnimRecorderActive(boolean isActive, boolean isExclusive): void`
- `setCloseKilled(boolean closeKilled): void`
- `setCollidable(boolean collidable): void`
- `setCollideType(String collideType): void`
- `setCollidedE(boolean collidedE): void`
- `setCollidedN(boolean collidedN): void`
- `setCollidedObject(IsoObject collidedObject): void`
- `setCollidedS(boolean collidedS): void`
- `setCollidedThisFrame(boolean collidedThisFrame): void`
- `setCollidedW(boolean collidedW): void`
- `setCollidedWithDoor(boolean collidedWithDoor): void`
- `setCurrent(IsoGridSquare current): void`
- `setCurrentSimulationLevel(UpdateSchedulerSimulationLevel simulationLevel): void`
- `setCurrentSquare(IsoGridSquare square): void`
- `setCurrentSquareFromPosition(): void`
- `setCurrentSquareFromPosition(float x1, float y1): void`
- `setCurrentSquareFromPosition(float x1, float y1, float z1): void`
- `setDestroyed(boolean destroyed): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setEatingZombies(ArrayList<IsoZombie> zeds): void`
- `setFeelersize(float feelersize): void`
- `setFirstUpdate(boolean firstUpdate): void`
- `setForceX(float x): void`
- `setForceY(float y): void`
- `setHitDir(Vector2 hitDir): void`
- `setHitForce(float hitForce): void`
- `setHitFromAngle(float hitFromAngle): void`
- `setImpulsex(float impulsex): void`
- `setImpulsey(float impulsey): void`
- `setLast(IsoGridSquare last): void`
- `setLastCollideTime(float lastCollideTime): void`
- `setLastTargettedBy(IsoZombie lastTargettedBy): void`
- `setLastX(float lx): float`
- `setLastY(float ly): float`
- `setLastZ(float lz): float`
- `setLimpulsex(float limpulsex): void`
- `setLimpulsey(float limpulsey): void`
- `setMovementLastFrame(Vector2 movementLastFrame): void`
- `setMovingSquare(IsoGridSquare newMovingSquare): void`
- `setMovingSquareNow(): void`
- `setNextX(float nx): float`
- `setNextY(float ny): float`
- `setNoDamage(boolean dmg): void`
- `setOnFloor(boolean onFloor): void`
- `setPathFindIndex(int pathFindIndex): void`
- `setPosition(float x, float y): void`
- `setPosition(float x, float y, float z): void`
- `setPosition(Vector2 pos): void`
- `setShootable(boolean shootable): void`
- `setSolid(boolean solid): void`
- `setStateEventDelayTimer(float stateEventDelayTimer): void`
- `setThumpTarget(Thumpable thumpTarget): void`
- `setTimeSinceZombieAttack(int timeSinceZombieAttack): void`
- `setWeight(float weight): void`
- `setWidth(float width): void`
- `setX(float x): float`
- `setY(float y): float`
- `setZ(float z): float`
- `setbAltCollide(boolean altCollide): void`
- `shouldAnimRecorderBeActive(): boolean`
- `shouldIgnoreCollisionWithSquare(IsoGridSquare square): boolean`
- `shouldSnapZToCurrentSquare(): boolean`
- `slideAwayToCollisionPos(float collNewPosX, float collNewPosY, boolean instant): void`
- `spotted(IsoMovingObject other, boolean bForced): void`
- `toString(): String`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `updateAnimation(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoMovingObject.name(...)`:

- `getIDCount(): int`
- `getVectorFromDirection(Vector2 moveForwardVec, IsoDirections dir): Vector2`
- `setIDCount(int aIDCount): void`

Constructors: `IsoMovingObject.new()`, `IsoMovingObject.new(boolean bObjectListAdd)`, `IsoMovingObject.new(IsoSprite spr, boolean bObjectListAdd)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `treeSoundMgr: TreeSoundManager`.
