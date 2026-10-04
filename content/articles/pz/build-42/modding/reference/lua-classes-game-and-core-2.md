---
slug: lua-classes-game-and-core-2
title: 'Lua Classes: Game, core and utilities, part 2 of 2 (Build 42.21)'
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
excerpt: 'The exposed game, core and utilities classes of Build 42.21 (part 2 of 2): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Game, core and utilities, part 2 of 2

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The game itself: Core, the game time, sandbox options, game states, the Lua manager, debug options and the utility classes.

This page holds 13 classes and 284 methods, part 2 of 2 of this area (from `MapObjects` to `VirtualZombieManager`), from the packages `zombie`, `zombie.Lua`, `zombie.modding`, `zombie.util`, `zombie.util.list`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### MapObjects

`zombie.Lua.MapObjects`, class.

Static functions, called as `MapObjects.name(...)`:

- `OnLoadWithSprite(String spriteName, LuaClosure function, int priority): void`
- `OnLoadWithSprite(KahluaTable spriteNames, LuaClosure function, int priority): void`
- `OnNewWithSprite(String spriteName, LuaClosure function, int priority): void`
- `OnNewWithSprite(KahluaTable spriteNames, LuaClosure function, int priority): void`
- `Reset(): void`
- `debugLoadChunk(int wx, int wy): void`
- `debugLoadSquare(int x, int y, int z): void`
- `debugNewSquare(int x, int y, int z): void`
- `loadGridSquare(IsoGridSquare square): void`
- `newGridSquare(IsoGridSquare square): void`
- `reroute(Prototype prototype, LuaClosure luaClosure): void`

Constructors: `MapObjects.new()`.

### ActiveMods

`zombie.modding.ActiveMods`, class.

Methods, called as `obj:name(...)`:

- `checkMissingMaps(): void`
- `checkMissingMods(): void`
- `clear(): void`
- `copyFrom(ActiveMods other): void`
- `getMapOrder(): ArrayList<String>`
- `getMods(): ArrayList<String>`
- `isModActive(String modID): boolean`
- `removeMapOrder(String folder): void`
- `removeMod(String modID): void`
- `setModActive(String modID, boolean active): void`

Static functions, called as `ActiveMods.name(...)`:

- `Reset(): void`
- `getById(String id): ActiveMods`
- `getByIndex(int index): ActiveMods`
- `indexOf(String id): int`
- `renderUI(): void`
- `requiresResetLua(ActiveMods activeMods): boolean`
- `setLoadedMods(ActiveMods activeMods): void`

Constructors: `ActiveMods.new(String id)`.

### SandboxOptions

`zombie.SandboxOptions`, class.

Methods, called as `obj:name(...)`:

- `applySettings(): void`
- `copyValuesFrom(SandboxOptions other): void`
- `doesPowerGridExist(): boolean`
- `doesPowerGridExist(int offset): boolean`
- `getAllClothesUnlocked(): boolean`
- `getCompostHours(): int`
- `getCurrentDiminishedLootPercentage(): int`
- `getCurrentDiminishedLootPercentage(IsoGridSquare square): int`
- `getCurrentLootMultiplier(): float`
- `getCurrentLootMultiplier(IsoGridSquare square): float`
- `getCurrentLootedChance(): int`
- `getCurrentLootedChance(IsoGridSquare square): int`
- `getCurrentRatIndex(): int`
- `getDayLengthMinutes(): int`
- `getDayLengthMinutesDefault(): int`
- `getElecShutModifier(): int`
- `getEnduranceRegenMultiplier(): double`
- `getErosionSpeed(): int`
- `getFirstYear(): int`
- `getNumOptions(): int`
- `getOptionByIndex(int index): SandboxOptions.SandboxOption`
- `getOptionByName(String name): SandboxOptions.SandboxOption`
- `getRainModifier(): int`
- `getStatsDecreaseMultiplier(): double`
- `getTemperatureModifier(): int`
- `getTimeSinceApo(): int`
- `getWaterShutModifier(): int`
- `handleOldServerZombiesFile(): void`
- `handleOldZombiesFile1(): void`
- `handleOldZombiesFile2(): void`
- `initSandboxVars(): void`
- `isUnstableScriptNameSpam(): boolean`
- `load(): void`
- `load(ByteBuffer input): void`
- `loadCurrentGameBinFile(): void`
- `loadGameFile(String presetName): boolean`
- `loadPresetFile(String presetName): boolean`
- `loadServerLuaFile(String serverName): boolean`
- `loadServerTextFile(String serverName): boolean`
- `loadServerZombiesFile(String serverName): boolean`
- `lootItemRemovalListContains(String itemType): boolean`
- `newCopy(): SandboxOptions`
- `newCustomOption(CustomSandboxOption customSandboxOption): void`
- `randomAlarmDecay(int alarmDecayModifier): int`
- `randomElectricityShut(int electricityShutoffModifier): int`
- `randomWaterShut(int waterShutoffModifier): int`
- `resetToDefault(): void`
- `save(ByteBuffer output): void`
- `saveGameFile(String presetName): boolean`
- `savePresetFile(String presetName): boolean`
- `saveServerLuaFile(String serverName): boolean`
- `sendToServer(): void`
- `set(String name, Object o): void`
- `setDefaultsToCurrentValues(): void`
- `toLua(): void`
- `updateFromLua(): void`
- `worldItemRemovalListContains(String itemType): boolean`

Static functions, called as `SandboxOptions.name(...)`:

- `Reset(): void`
- `getInstance(): SandboxOptions`
- `isValidPresetName(String name): boolean`

Constructors: `SandboxOptions.new()`.

Static fields (a copy of the value taken when the class is exposed): `FIRST_YEAR: int`, `instance: SandboxOptions`.

### SandboxOptions.BooleanSandboxOption

`zombie.SandboxOptions.BooleanSandboxOption`, class. Extends [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption). Also has the methods of [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption) (12), [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): BooleanConfigOption`
- `fromTable(KahluaTable): void`
- `getPageName(): String`
- `getShortName(): String`
- `getTableName(): String`
- `getTooltip(): String`
- `getTranslatedName(): String`
- `isCustom(): boolean`
- `setCustom(): void`
- `setPageName(String): SandboxOptions.BooleanSandboxOption`
- `setTranslation(String translation): SandboxOptions.BooleanSandboxOption`
- `toTable(KahluaTable table): void`

Constructors: `SandboxOptions.BooleanSandboxOption.new(SandboxOptions owner, String name, boolean defaultValue)`.

### SandboxOptions.DoubleSandboxOption

`zombie.SandboxOptions.DoubleSandboxOption`, class. Extends [DoubleConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#doubleconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), [DoubleConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#doubleconfigoption) (15), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): DoubleConfigOption`
- `fromTable(KahluaTable): void`
- `getPageName(): String`
- `getShortName(): String`
- `getTableName(): String`
- `getTooltip(): String`
- `getTranslatedName(): String`
- `isCustom(): boolean`
- `setCustom(): void`
- `setPageName(String): SandboxOptions.DoubleSandboxOption`
- `setTranslation(String translation): SandboxOptions.DoubleSandboxOption`
- `toTable(KahluaTable table): void`

Constructors: `SandboxOptions.DoubleSandboxOption.new(SandboxOptions owner, String name, double min, double max, double defaultValue)`.

### SandboxOptions.EnumSandboxOption

`zombie.SandboxOptions.EnumSandboxOption`, class. Extends [EnumConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#enumconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), [EnumConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#enumconfigoption) (2), [IntegerConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#integerconfigoption) (13), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): EnumConfigOption`
- `fromTable(KahluaTable): void`
- `getPageName(): String`
- `getShortName(): String`
- `getTableName(): String`
- `getTooltip(): String`
- `getTranslatedName(): String`
- `getValueTranslation(): String`
- `getValueTranslationByIndex(int index): String`
- `getValueTranslationByIndexOrNull(int index): String`
- `isCustom(): boolean`
- `setCustom(): void`
- `setPageName(String): SandboxOptions.EnumSandboxOption`
- `setTranslation(String translation): SandboxOptions.EnumSandboxOption`
- `setValueTranslation(String translation): SandboxOptions.EnumSandboxOption`
- `toTable(KahluaTable table): void`

Constructors: `SandboxOptions.EnumSandboxOption.new(SandboxOptions owner, String name, int numValues, int defaultValue)`.

### SandboxOptions.IntegerSandboxOption

`zombie.SandboxOptions.IntegerSandboxOption`, class. Extends [IntegerConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#integerconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), [IntegerConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#integerconfigoption) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): IntegerConfigOption`
- `fromTable(KahluaTable): void`
- `getPageName(): String`
- `getShortName(): String`
- `getTableName(): String`
- `getTooltip(): String`
- `getTranslatedName(): String`
- `isCustom(): boolean`
- `setCustom(): void`
- `setPageName(String): SandboxOptions.IntegerSandboxOption`
- `setTranslation(String translation): SandboxOptions.IntegerSandboxOption`
- `toTable(KahluaTable table): void`

Constructors: `SandboxOptions.IntegerSandboxOption.new(SandboxOptions owner, String name, int min, int max, int defaultValue)`.

### SandboxOptions.StringSandboxOption

`zombie.SandboxOptions.StringSandboxOption`, class. Extends [StringConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#stringconfigoption). Also has the methods of [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (3), [StringConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#stringconfigoption) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `asConfigOption(): StringConfigOption`
- `fromTable(KahluaTable): void`
- `getPageName(): String`
- `getShortName(): String`
- `getTableName(): String`
- `getTooltip(): String`
- `getTranslatedName(): String`
- `isCustom(): boolean`
- `setCustom(): void`
- `setPageName(String): SandboxOptions.StringSandboxOption`
- `setTranslation(String translation): SandboxOptions.StringSandboxOption`
- `toTable(KahluaTable table): void`

Constructors: `SandboxOptions.StringSandboxOption.new(SandboxOptions owner, String name, String defaultValue, int maxLength)`.

### SystemDisabler

`zombie.SystemDisabler`, class.

Static functions, called as `SystemDisabler.name(...)`:

- `Reset(): void`
- `getDoMainLoopDealWithNetData(): boolean`
- `getEnableAdvancedSoundOptions(): boolean`
- `getUncappedFPS(): boolean`
- `getdoHighFriction(): boolean`
- `getdoVehicleLowRider(): boolean`
- `printDetailedInfo(): boolean`
- `setDoCharacterStats(boolean bDo): void`
- `setDoPlayerCreation(boolean bDo): void`
- `setDoSurvivorCreation(boolean bDo): void`
- `setDoZombieCreation(boolean bDo): void`
- `setEnableAdvancedSoundOptions(boolean enable): void`
- `setOverridePOVCharacters(boolean bDo): void`
- `setUncappedFPS(boolean b): void`
- `setVehiclesEverywhere(boolean bDo): void`
- `setWorldSyncEnable(boolean bDo): void`

Constructors: `SystemDisabler.new()`.

Static fields (a copy of the value taken when the class is exposed): `doCharacterStats: boolean`, `doEnableDetectOpenGLErrors: boolean`, `doEnableDetectOpenGLErrorsInTexture: boolean`, `doOverridePOVCharacters: boolean`, `doPlayerCreation: boolean`, `doSurvivorCreation: boolean`, `doVehiclesEverywhere: boolean`, `doVehiclesWithoutTextures: boolean`, `doWorldSyncEnable: boolean`, `doZombieCreation: boolean`, `zombiesDontAttack: boolean`.

### PZArrayList

`zombie.util.list.PZArrayList`, class. Extends `AbstractList`. Also has the methods of [List](/pz/build-42/modding/reference/lua-classes-java-and-libraries#list) (10), listed on their own entries.

Methods, called as `obj:name(...)`:

- `add(E e): boolean`
- `add(int index, E e): void`
- `addAll(Collection<? extends E>): boolean` from `AbstractCollection`
- `addAll(int, Collection<? extends E>): boolean` from `AbstractList`
- `addUnique(E newItem): void`
- `addUnique(E newItem, Invokers.Params2.Boolean.ICallback<E, E> comparator): void`
- `addUniqueReference(E newItem): void`
- `clear(): void`
- `contains(E1 o, Invokers.Params2.Boolean.ICallback<E1, E> comparator): boolean`
- `contains(Object o): boolean`
- `containsAll(Collection<?>): boolean` from `AbstractCollection`
- `containsReference(E o): boolean`
- `ensureCapacity(int minCapacity): void`
- `equals(Object): boolean` from `AbstractList`
- `forEach(Consumer<? super T>): void` from `Iterable`
- `get(int index): E`
- `getElements(): E[]`
- `hashCode(): int` from `AbstractList`
- `indexOf(E1 o, Invokers.Params2.Boolean.ICallback<E1, E> comparator): int`
- `indexOf(Object o): int`
- `isEmpty(): boolean`
- `iterator(): Iterator<E>`
- `lastIndexOf(Object): int` from `AbstractList`
- `listIterator(): ListIterator<E>`
- `listIterator(int index): ListIterator<E>`
- `parallelStream(): Stream<E>` from `Collection`
- `remove(int index): E`
- `remove(Object o): boolean`
- `removeAll(Collection<?> c): boolean`
- `removeIf(Predicate<? super E>): boolean` from `Collection`
- `retainAll(Collection<?>): boolean` from `AbstractCollection`
- `set(int index, E e): E`
- `size(): int`
- `stream(): Stream<E>` from `Collection`
- `subList(int, int): List<E>` from `AbstractList`
- `toArray(T[]): T[]` from `AbstractCollection`
- `toArray(IntFunction<T[]>): T[]` from `Collection`
- `toArray(): Object[]` from `AbstractCollection`
- `toString(): String`

Static functions, called as `PZArrayList.name(...)`:

- `emptyList(): AbstractList<E>`
- `objectsEqual(E1 a, E2 b): boolean`
- `referenceEqual(E1 a, E2 b): boolean`

Constructors: `PZArrayList.new(Class<E> elementType, int initialCapacity)`.

### PZUnmodifiableList

`zombie.util.list.PZUnmodifiableList`, class. Extends `PZUnmodifiableCollection`. Also has the methods of [List](/pz/build-42/modding/reference/lua-classes-java-and-libraries#list) (7), listed on their own entries.

Methods, called as `obj:name(...)`:

- `add(E e): boolean` from `PZUnmodifiableCollection`
- `add(int index, E element): void`
- `addAll(Collection<? extends E> coll): boolean` from `PZUnmodifiableCollection`
- `addAll(int index, Collection<? extends E> c): boolean`
- `clear(): void` from `PZUnmodifiableCollection`
- `contains(Object o): boolean` from `PZUnmodifiableCollection`
- `containsAll(Collection<?> coll): boolean` from `PZUnmodifiableCollection`
- `equals(Object o): boolean`
- `forEach(Consumer<? super E> action): void` from `PZUnmodifiableCollection`
- `get(int index): E`
- `hashCode(): int`
- `indexOf(Object o): int`
- `isEmpty(): boolean` from `PZUnmodifiableCollection`
- `iterator(): Iterator<E>` from `PZUnmodifiableCollection`
- `lastIndexOf(Object o): int`
- `listIterator(): ListIterator<E>`
- `listIterator(int index): ListIterator<E>`
- `parallelStream(): Stream<E>` from `PZUnmodifiableCollection`
- `remove(int index): E`
- `remove(Object o): boolean` from `PZUnmodifiableCollection`
- `removeAll(Collection<?> coll): boolean` from `PZUnmodifiableCollection`
- `removeIf(Predicate<? super E> filter): boolean` from `PZUnmodifiableCollection`
- `replaceAll(UnaryOperator<E> operator): void`
- `retainAll(Collection<?> coll): boolean` from `PZUnmodifiableCollection`
- `set(int index, E element): E`
- `size(): int` from `PZUnmodifiableCollection`
- `sort(Comparator<? super E> c): void`
- `spliterator(): Spliterator<E>` from `PZUnmodifiableCollection`
- `stream(): Stream<E>` from `PZUnmodifiableCollection`
- `subList(int fromIndex, int toIndex): List<E>`
- `toArray(T[] a): T[]` from `PZUnmodifiableCollection`
- `toArray(IntFunction<T[]>): T[]` from `PZUnmodifiableCollection`
- `toArray(): Object[]` from `PZUnmodifiableCollection`
- `toString(): String` from `PZUnmodifiableCollection`

Static functions, called as `PZUnmodifiableList.name(...)`:

- `wrap(List<? extends T> list): List<T>`

### PZCalendar

`zombie.util.PZCalendar`, class.

Methods, called as `obj:name(...)`:

- `get(int field): int`
- `getTime(): Date`
- `getTimeInMillis(): long`
- `isLeapYear(int year): boolean`
- `set(int year, int month, int dayOfMonth, int hourOfDay, int minute): void`
- `setTimeInMillis(long millis): void`

Static functions, called as `PZCalendar.name(...)`:

- `getInstance(): PZCalendar`

Constructors: `PZCalendar.new(Calendar calendar)`.

### VirtualZombieManager

`zombie.VirtualZombieManager`, class.

Methods, called as `obj:name(...)`:

- `AddBloodToMap(int nSize, IsoChunk chk): void`
- `RemoveZombie(IsoZombie obj): void`
- `Reset(): void`
- `addDeadZombiesToMap(int nSize, RoomDef room): void`
- `addIndoorZombiesToChunk(IsoChunk chunk, IsoRoom room): void`
- `addIndoorZombiesToChunk(IsoChunk chunk, IsoRoom room, int zombieCountForRoom, ArrayList<IsoZombie> zombies): void`
- `addToReusable(IsoZombie z): void`
- `addZombiesToMap(int nSize, RoomDef room): ArrayList<IsoZombie>`
- `addZombiesToMap(int nSize, RoomDef room, boolean bAllowDead): ArrayList<IsoZombie>`
- `canSpawnAt(int x, int y, int z): boolean`
- `checkAndSpawnZombieForBuildingKey(IsoZombie zombie): boolean`
- `checkAndSpawnZombieForBuildingKey(IsoZombie zombie, boolean bandits): boolean`
- `checkZombieKeyForBuilding(String outfitName, IsoGridSquare square): boolean`
- `createCorpseZombie(IsoDirections dir): IsoZombie`
- `createEatingZombies(IsoDeadBody target, int nb): void`
- `createHordeFromTo(float spawnX, float spawnY, float targetX, float targetY, int count): void`
- `createRealZombie(float x, float y, float z): IsoZombie`
- `createRealZombieAlways(int descriptorId, IsoDirections dir, boolean bDead, int persistentId): IsoZombie`
- `createRealZombieAlways(IsoDirections dir, boolean bDead): IsoZombie`
- `createRealZombieAlways(IsoDirections dir, boolean bDead, int outfitID, int persistentId): IsoZombie`
- `createRealZombieNow(float x, float y, float z): IsoZombie`
- `getKeySpawnChanceD100(): float`
- `init(): void`
- `isReused(IsoZombie z): boolean`
- `removeZombieFromWorld(IsoZombie z): boolean`
- `reusableZombiesSize(): int`
- `roomSpotted(IsoRoom room): void`
- `shouldSpawnZombiesOnLevel(int level): boolean`
- `spawnBuildingKeyOnZombie(IsoZombie zombie): boolean`
- `spawnBuildingKeyOnZombie(IsoZombie zombie, BuildingDef def): boolean`
- `tryAddIndoorZombies(RoomDef room, boolean bAllowDead): void`
- `update(): void`

Constructors: `VirtualZombieManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: VirtualZombieManager`.
