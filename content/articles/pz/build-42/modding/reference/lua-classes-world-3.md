---
slug: lua-classes-world-3
title: 'Lua Classes: The world: squares, objects, map and weather, part 3 of 4 (Build 42.21)'
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
excerpt: 'The exposed the world: squares, objects, map and weather classes of Build 42.21 (part 3 of 4): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: The world: squares, objects, map and weather, part 3 of 4

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The map and what sits on it: grid squares, tile objects, buildings and rooms, the world map, erosion, weather and the randomized stories.

This page holds 113 classes and 1,890 methods, part 3 of 4 of this area (from `IsoTrap` to `RDSHouseParty`), from the packages `zombie`, `zombie.iso`, `zombie.iso.SpriteDetails`, `zombie.iso.objects`, `zombie.iso.sprite`, `zombie.iso.weather`, `zombie.iso.weather.fog`, `zombie.iso.weather.fx`, `zombie.iso.worldgen`, `zombie.iso.zones`, `zombie.pathfind`, `zombie.popman`, `zombie.randomizedWorld.randomizedBuilding`, `zombie.randomizedWorld.randomizedDeadSurvivor`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### IsoTrap

`zombie.iso.objects.IsoTrap`, class. Extends [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (407), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `frameStep(): void` from `ECSEntity`
- `getAttacker(): IsoGameCharacter`
- `getCountDownSound(): String`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getExplosionDuration(): int`
- `getExplosionPower(): int`
- `getExplosionRange(): int`
- `getExplosionSound(): String`
- `getExtraDamage(): float`
- `getFireRange(): int`
- `getFireStartingChance(): int`
- `getFireStartingEnergy(): int`
- `getFrameNo(): int` from `ECSEntity`
- `getHandWeapon(): HandWeapon`
- `getItem(): InventoryItem`
- `getNoiseDuration(): int`
- `getNoiseRange(): int`
- `getObjectName(): String`
- `getRemoteControlID(): int`
- `getRenderSquare(): IsoGridSquare`
- `getSensorRange(): int`
- `getSmokeRange(): int`
- `getTimerBeforeExplosion(): int`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isExploding(): boolean`
- `isInstantExplosion(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `place(): void`
- `playExplosionSound(): void`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoChild, boolean bWallLightingPass, Shader shader): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setCountDownSound(String sound): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setExplosionDuration(int minutes): void`
- `setExplosionPower(int explosionPower): void`
- `setExplosionRange(int explosionRange): void`
- `setExplosionSound(String explosionSound): void`
- `setExtraDamage(float extraDamage): void`
- `setFireRange(int fireRange): void`
- `setFireStartingChance(int fireStartingChance): void`
- `setFireStartingEnergy(int fireStartingEnergy): void`
- `setInstantExplosion(boolean instantExplosion): void`
- `setNoiseDuration(int noiseDuration): void`
- `setNoiseRange(int noiseRange): void`
- `setRemoteControlID(int remoteControlId): void`
- `setSensorRange(int sensorRange): void`
- `setSmokeRange(int smokeRange): void`
- `setTimerBeforeExplosion(int timerBeforeExplosion): void`
- `shouldPlaceInWorldAfterThrowing(): boolean`
- `triggerExplosion(): void`
- `triggerExplosion(boolean sensor): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoTrap.name(...)`:

- `triggerRemote(IsoPlayer player, int remoteID, int range): void`

Constructors: `IsoTrap.new(IsoGameCharacter attacker, HandWeapon weapon, IsoCell cell, IsoGridSquare sq)`, `IsoTrap.new(HandWeapon weapon, IsoCell cell, IsoGridSquare sq)`, `IsoTrap.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoTree

`zombie.iso.objects.IsoTree`, class. Extends [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (404), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Damage(float amount): void`
- `HitByVehicle(BaseVehicle vehicle, float amount): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `WeaponHit(IsoGameCharacter owner, HandWeapon weapon): void`
- `WeaponHitEffects(IsoGameCharacter owner, HandWeapon weapon): void`
- `checkChopTreeIndicator(): void`
- `dropWood(): void`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getHealth(): int`
- `getLogYield(): int`
- `getMaxHealth(): int`
- `getObjectName(): String`
- `getRenderSquare(): IsoGridSquare`
- `getSize(): int`
- `getSlowFactor(IsoMovingObject chr): float`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `initTree(): void`
- `isMaskClicked(int x, int y, boolean flip): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `render(float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `reset(): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setHealth(int health): void`
- `setSprite(IsoSprite sprite): void`
- `toppleTree(): void`
- `toppleTree(IsoGameCharacter owner): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoTree.name(...)`:

- `checkChopTreeIndicators(int playerIndex): void`
- `getNew(): IsoTree`
- `renderChopTreeIndicators(): void`
- `setChopTreeCursorLocation(int playerIndex, int x, int y, int z): void`

Constructors: `IsoTree.new()`, `IsoTree.new(IsoCell cell)`, `IsoTree.new(IsoGridSquare sq, String gid)`, `IsoTree.new(IsoGridSquare sq, IsoSprite gid)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_SIZE: int`, `MAX_WALL_SPLATS: int`, `SIZE_JUMBO: int`, `SIZE_JUMBO_L: int`, `SIZE_JUMBO_XL: int`, `SIZE_JUMBO_XXL: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `WIDTH_JUMBO_XXL: int`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoWaveSignal

`zombie.iso.objects.IsoWaveSignal`, class. Extends [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (407), [WaveSignalDevice](/pz/build-42/modding/reference/lua-classes-sound-and-radio#wavesignaldevice) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `AddDeviceText(String line, float r, float g, float b, String guid, String codes, int distance): void`
- `AddDeviceText(String line, float r, float g, float b, String guid, String codes, int distance, boolean attractZombies): void`
- `AddDeviceText(String line, int r, int g, int b, String guid, String codes, int distance): void`
- `AddDeviceText(String line, int r, int g, int b, String guid, String codes, int distance, boolean attractZombies): void`
- `HasPlayerInRange(): boolean`
- `IsSpeaking(): boolean`
- `Say(String line): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `cloneDeviceDataFromItem(String itemfull): DeviceData`
- `frameStep(): void` from `ECSEntity`
- `getChatElement(): ChatElement`
- `getDelta(): float`
- `getDeviceData(): DeviceData`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getSayLine(): String`
- `getTalkerType(): String`
- `hasChatToDisplay(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadState(ByteBuffer bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromSquare(): void`
- `removeFromWorld(): void`
- `renderlast(): void`
- `renderlastold2(): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveState(ByteBuffer bb): void`
- `setDelta(float delta): void`
- `setDeviceData(DeviceData data): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setTalkerType(String type): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoWaveSignal.name(...)`:

- `Reset(): void`

Constructors: `IsoWaveSignal.new(IsoCell cell)`, `IsoWaveSignal.new(IsoCell cell, IsoGridSquare sq, IsoSprite spr)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoWheelieBin

`zombie.iso.objects.IsoWheelieBin`, class. Extends [IsoPushableObject](/pz/build-42/modding/reference/lua-classes-world-2#isopushableobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject) (180), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (397), [IsoPushableObject](/pz/build-42/modding/reference/lua-classes-world-2#isopushableobject) (4), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getObjectName(): String`
- `getWeight(float x, float y): float`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoWheelieBin.new(IsoCell cell)`, `IsoWheelieBin.new(IsoCell cell, int x, int y, int z)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `treeSoundMgr: TreeSoundManager`.

### IsoWindow

`zombie.iso.objects.IsoWindow`, class. Extends [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (388), [BarricadeAble](/pz/build-42/modding/reference/lua-classes-world-2#barricadeable) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `AttackObject(IsoGameCharacter owner): void`
- `Damage(float amount): void`
- `HasCurtains(): IsoCurtain`
- `IsOpen(): boolean`
- `TestCollide(IsoMovingObject obj, IsoGridSquare from, IsoGridSquare to): boolean`
- `TestVision(IsoGridSquare from, IsoGridSquare to): IsoObject.VisionResult`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `Thump(IsoMovingObject thumper, int thumpEventCount): void`
- `ToggleWindow(IsoGameCharacter chr): void`
- `WeaponHit(IsoGameCharacter owner, HandWeapon weapon): void`
- `addBarricadesDebug(int numPlanks, boolean metal): IsoBarricade`
- `addBrokenGlass(boolean onOppositeSquare): void`
- `addBrokenGlass(IsoMovingObject chr): void`
- `addRandomBarricades(): void`
- `addSheet(IsoGameCharacter chr): void`
- `addSheetRope(IsoPlayer player, String itemType): boolean`
- `addToWorld(): void`
- `canAddSheetRope(): boolean`
- `canAttackBypassIsoBarricade(IsoGameCharacter isoGameCharacter, HandWeapon handWeapon): boolean`
- `canClimbThrough(IsoGameCharacter chr): boolean`
- `countAddSheetRope(): int`
- `frameStep(): void` from `ECSEntity`
- `getAddSheetSquare(IsoGameCharacter chr): IsoGridSquare`
- `getBarricadeForCharacter(IsoGameCharacter chr): IsoBarricade`
- `getBarricadeOnOppositeSquare(): IsoBarricade`
- `getBarricadeOnSameSquare(): IsoBarricade`
- `getBarricadeOppositeCharacter(IsoGameCharacter chr): IsoBarricade`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFacingPosition(Vector2 pos): Vector2`
- `getFirstCharacterClimbingThrough(): IsoGameCharacter`
- `getFirstCharacterClimbingThrough(IsoGridSquare square): IsoGameCharacter`
- `getFirstCharacterClosing(): IsoGameCharacter`
- `getFirstCharacterClosing(IsoGridSquare square): IsoGameCharacter`
- `getFrameNo(): int` from `ECSEntity`
- `getGridSquareEdgeFacingDirection(): GridSquareEdgeFacingDirection` from `GridSquareEdgeElement`
- `getHealth(): int`
- `getIndoorSquare(): IsoGridSquare`
- `getNorth(): boolean`
- `getObjectName(): String`
- `getOpenSprite(): IsoSprite`
- `getOppositeSquare(): IsoGridSquare` from `GridSquareEdgeElement`
- `getSmashedSprite(): IsoSprite`
- `getThumpCondition(): float`
- `getThumpableFor(IsoGameCharacter chr): Thumpable`
- `getThumpableFor(IsoGameCharacter chr, HandWeapon weapon): Thumpable`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `haveSheetRope(): boolean`
- `isBarricadeAllowed(): boolean`
- `isBarricaded(): boolean`
- `isBlocked(): boolean`
- `isBlocked(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isDestroyed(): boolean`
- `isExterior(): boolean`
- `isGlassRemoved(): boolean`
- `isInvincible(): boolean`
- `isLocked(): boolean`
- `isNorth(): boolean`
- `isPermaLocked(): boolean`
- `isSmashed(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadState(ByteBuffer bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onMouseLeftClick(int x, int y): boolean`
- `openCloseCurtain(IsoGameCharacter chr): void`
- `registerECSComponents(): void` from `ECSEntity`
- `removeBrokenGlass(): void`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `removeSheet(IsoGameCharacter chr): void`
- `removeSheetRope(IsoPlayer player): boolean`
- `reset(): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveState(ByteBuffer bb): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setGlassRemoved(boolean removed): void`
- `setIsLocked(boolean lock): void`
- `setOpenSprite(IsoSprite sprite): void`
- `setPermaLocked(Boolean permaLock): void`
- `setSmashed(boolean destroyed): void`
- `setSmashedSprite(IsoSprite sprite): void`
- `smashWindow(): void`
- `smashWindow(boolean bRemote): void`
- `smashWindow(boolean bRemote, boolean doAlarm): void`
- `syncIsoObjectReceive(ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoWindow.name(...)`:

- `addSheetRope(IsoPlayer player, IsoGridSquare sq, boolean north, String itemType): boolean`
- `canAddSheetRope(IsoGridSquare sq, boolean north): boolean`
- `canClimbHere(IsoGridSquare sq): boolean`
- `canClimbThroughHelper(IsoGameCharacter chr, IsoGridSquare sq, IsoGridSquare oppositeSq, boolean north): boolean`
- `countAddSheetRope(IsoGridSquare sq, boolean north): int`
- `isSheetRopeHere(IsoGridSquare sq): boolean`
- `isTopOfSheetRopeHere(IsoGridSquare sq): boolean`
- `isTopOfSheetRopeHere(IsoGridSquare sq, boolean north): boolean`
- `removeSheetRope(IsoPlayer player, IsoGridSquare square, boolean north): boolean`
- `resetCurrentCellWindows(): void`

Constructors: `IsoWindow.new(IsoCell cell)`, `IsoWindow.new(IsoCell cell, IsoGridSquare gridSquare, IsoSprite gid, boolean north)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `NoWeaponDoorDamage: float`, `SMASH_SOUND_RADIUS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `WeaponDoorDamageModifier: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoWindowFrame

`zombie.iso.objects.IsoWindowFrame`, class. Extends [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (406), [BarricadeAble](/pz/build-42/modding/reference/lua-classes-world-2#barricadeable) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `HasCurtains(): IsoCurtain`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addSheet(IsoGameCharacter chr): void`
- `addSheetRope(IsoPlayer player, String itemType): boolean`
- `canAddSheetRope(): boolean`
- `canClimbThrough(IsoGameCharacter chr): boolean`
- `countAddSheetRope(): int`
- `frameStep(): void` from `ECSEntity`
- `getAddSheetSquare(IsoGameCharacter chr): IsoGridSquare`
- `getBarricadeForCharacter(IsoGameCharacter chr): IsoBarricade`
- `getBarricadeOnOppositeSquare(): IsoBarricade`
- `getBarricadeOnSameSquare(): IsoBarricade`
- `getBarricadeOppositeCharacter(IsoGameCharacter chr): IsoBarricade`
- `getCurtain(): IsoCurtain`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGridSquareEdgeFacingDirection(): GridSquareEdgeFacingDirection` from `GridSquareEdgeElement`
- `getNorth(): boolean`
- `getObjectName(): String`
- `getOppositeSquare(): IsoGridSquare` from `GridSquareEdgeElement`
- `getThumpableFor(IsoGameCharacter chr): Thumpable`
- `getWindow(): IsoWindow`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasWindow(): boolean`
- `haveSheetRope(): boolean`
- `isBarricadeAllowed(): boolean`
- `isBarricaded(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeSheetRope(IsoPlayer player): boolean`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoWindowFrame.name(...)`:

- `addSheet(IsoObject o, IsoGameCharacter chr): void`
- `addSheetRope(IsoObject o, IsoPlayer player, String itemType): boolean`
- `canAddSheetRope(IsoObject o): boolean`
- `canClimbThrough(IsoObject o, IsoGameCharacter chr): boolean`
- `countAddSheetRope(IsoObject o): int`
- `getAddSheetSquare(IsoObject o, IsoGameCharacter chr): IsoGridSquare`
- `getCurtain(IsoObject o): IsoCurtain`
- `getIndoorSquare(IsoObject o): IsoGridSquare`
- `getOppositeSquare(IsoObject o): IsoGridSquare`
- `haveSheetRope(IsoObject o): boolean`
- `removeSheetRope(IsoObject o, IsoPlayer player): boolean`

Constructors: `IsoWindowFrame.new(IsoCell cell)`, `IsoWindowFrame.new(IsoCell cell, IsoGridSquare gridSquare, IsoSprite gid, boolean north)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoWorldInventoryObject

`zombie.iso.objects.IsoWorldInventoryObject`, class. Extends [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (383), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `WeaponHit(IsoGameCharacter owner, HandWeapon weapon): void`
- `addFluid(FluidType fluidType, float amount): void`
- `addToWorld(): void`
- `canTransferFluidFrom(FluidContainer other): boolean`
- `canTransferFluidTo(FluidContainer other): boolean`
- `couldBePoweredByGenerator(): boolean`
- `emptyFluid(): void`
- `finishupdate(): boolean`
- `frameStep(): void` from `ECSEntity`
- `getCustomMenuOption(): String`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFluidAmount(): float`
- `getFluidCapacity(): float`
- `getFluidUiName(): String`
- `getFrameNo(): int` from `ECSEntity`
- `getItem(): InventoryItem`
- `getObjectName(): String`
- `getOffX(): float`
- `getOffY(): float`
- `getOffZ(): float`
- `getRenderSquare(): IsoGridSquare`
- `getScreenPosX(int playerIndex): float`
- `getScreenPosY(int playerIndex): float`
- `getWorldPosX(): float`
- `getWorldPosY(): float`
- `getWorldPosZ(): float`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasWater(): boolean`
- `isExtendedPlacement(): boolean`
- `isFluidInputLocked(): boolean`
- `isIgnoreRemoveSandbox(): boolean`
- `isPureWater(boolean includeTainted): boolean`
- `isTaintedWater(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromSquare(): void`
- `removeFromWorld(): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoChild, boolean bWallLightingPass, Shader shader): void`
- `renderObjectPicker(float x, float y, float z, ColorInfo lightInfo): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setExtendedPlacement(boolean b): void`
- `setHighlighted(int playerIndex, boolean bHighlight, boolean bRenderOnce): void`
- `setIgnoreRemoveSandbox(boolean b): void`
- `setOffX(float newoff): void`
- `setOffY(float newoff): void`
- `setOffZ(float newoff): void`
- `setOffset(float x, float y, float z): void`
- `softReset(): void`
- `swapItem(InventoryItem newItem): void`
- `syncExtendedPlacement(): void`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source, ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `transferFluidFrom(FluidContainer source, float amount): float`
- `transferFluidTo(FluidContainer target, float amount): float`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `updateSprite(): void`
- `useFluid(float amount): float`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoWorldInventoryObject.name(...)`:

- `getSurfaceAlpha(IsoGridSquare square, float zoff): float`
- `getSurfaceAlpha(IsoGridSquare square, float zoff, boolean bTargetAlpha): float`

Constructors: `IsoWorldInventoryObject.new(InventoryItem item, IsoGridSquare sq, float xoff, float yoff, float zoff)`, `IsoWorldInventoryObject.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoZombieGiblets

`zombie.iso.objects.IsoZombieGiblets`, class. Extends `IsoPhysicsObject`. Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject) (184), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (395), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Serialize(): boolean`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `collideGround(): void` from `IsoPhysicsObject`
- `collideWall(): void` from `IsoPhysicsObject`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGlobalMovementMod(boolean bDoNoises): float` from `IsoPhysicsObject`
- `getObjectName(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `render(float x, float y, float z, ColorInfo info, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoZombieGiblets.new(IsoCell cell)`, `IsoZombieGiblets.new(IsoZombieGiblets.GibletType type, IsoCell cell, float x, float y, float z, float xvel, float yvel)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `treeSoundMgr: TreeSoundManager`.

### ObjectRenderEffects

`zombie.iso.objects.ObjectRenderEffects`, class.

Methods, called as `obj:name(...)`:

- `add(ObjectRenderEffects other): void`
- `copyMainFromOther(ObjectRenderEffects other): void`
- `update(): boolean`

Static functions, called as `ObjectRenderEffects.name(...)`:

- `alloc(): ObjectRenderEffects`
- `getNew(IsoObject parent, RenderEffectType t, boolean reuseEqualType): ObjectRenderEffects`
- `getNew(IsoObject parent, RenderEffectType t, boolean reuseEqualType, boolean dontAdd): ObjectRenderEffects`
- `getNextWindEffect(int windType, boolean isTreeLike): ObjectRenderEffects`
- `init(): void`
- `release(ObjectRenderEffects o): void`
- `updateStatic(): void`

Static fields (a copy of the value taken when the class is exposed): `ENABLED: boolean`.

### RainManager

`zombie.iso.objects.RainManager`, class.

Static functions, called as `RainManager.name(...)`:

- `AddRainSplash(IsoRainSplash newRainSplash): void`
- `AddRaindrop(IsoRaindrop newRaindrop): void`
- `AddSplashes(): void`
- `RemoveAllOn(IsoGridSquare sq): void`
- `RemoveRainSplash(IsoRainSplash dyingRainSplash): void`
- `RemoveRaindrop(IsoRaindrop dyingRaindrop): void`
- `SetPlayerLocation(int playerIndex, IsoGridSquare playerCurrentSquare): void`
- `StartRainSplash(IsoCell cell, IsoGridSquare gridSquare, boolean canSee): void`
- `StartRaindrop(IsoCell cell, IsoGridSquare gridSquare, boolean canSee): void`
- `Update(): void`
- `UpdateServer(): void`
- `getRainIntensity(): float`
- `inBounds(IsoGridSquare sq): boolean`
- `isRaining(): Boolean`
- `reset(): void`
- `setRandRainMax(int pRandRainMax): void`
- `setRandRainMin(int pRandRainMin): void`
- `startRaining(): void`
- `stopRaining(): void`

Constructors: `RainManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `addNewSplashesDelay: int`, `addNewSplashesTimer: int`, `darkRaindropTintMod: ColorInfo`, `gravModMax: float`, `gravModMin: float`, `maxRainSplashObjects: int`, `maxRaindropObjects: int`, `numActiveRainSplashes: int`, `numActiveRaindrops: int`, `playerLocation: IsoGridSquare[]`, `playerMoved: boolean`, `playerOldLocation: IsoGridSquare[]`, `rainAmbient: Audio`, `rainDesiredIntensity: float`, `rainIntensity: float`, `rainRadius: int`, `rainSplashAnimDelay: float`, `rainSplashReuseStack: Stack<IsoRainSplash>`, `rainSplashStack: ArrayList<IsoRainSplash>`, `rainSplashTintMod: ColorInfo`, `raindropGravity: float`, `raindropReuseStack: Stack<IsoRaindrop>`, `raindropStack: ArrayList<IsoRaindrop>`, `raindropStartDistance: float`, `raindropTintMod: ColorInfo`, `randRainMax: int`, `randRainMin: int`, `thunderAmbient: Audio`.

### RoomDef

`zombie.iso.RoomDef`, class.

Methods, called as `obj:name(...)`:

- `CalculateBounds(): void`
- `Dispose(): void`
- `calculateMetaID(int cellX, int cellY): long`
- `contains(int x, int y): boolean`
- `copyFrom(RoomDef other): void`
- `forEachChunk(BiConsumer<RoomDef, IsoChunk> consumer): void`
- `getArea(): int`
- `getAreaOverlapping(int x, int y, int w, int h): float`
- `getAreaOverlapping(IsoChunk chunk): float`
- `getBuilding(): BuildingDef`
- `getClosestPoint(float x, float y, Vector2f closestXY): float`
- `getExtraFreeSquare(): IsoGridSquare`
- `getFreeSquare(): IsoGridSquare`
- `getFreeUnoccupiedSquare(): IsoGridSquare`
- `getH(): int`
- `getID(): long`
- `getIDString(): String`
- `getIsoRoom(): IsoRoom`
- `getMetaObjects(): ArrayList<MetaObject>`
- `getName(): String`
- `getObjects(): ArrayList<MetaObject>`
- `getProceduralSpawnedContainer(): HashMap<String, Integer>`
- `getRandomSquare(Predicate<IsoGridSquare> predicate): IsoGridSquare`
- `getRects(): ArrayList<RoomDef.RoomRect>`
- `getRoomRect(int x, int y, int z): RoomDef.RoomRect`
- `getW(): int`
- `getX(): int`
- `getX2(): int`
- `getY(): int`
- `getY2(): int`
- `getZ(): int`
- `intersects(int x, int y, int w, int h): boolean`
- `isAdjacent(int x, int y, int w, int h): boolean`
- `isAdjacent(RoomDef other): boolean`
- `isEmptyOutside(): boolean`
- `isExplored(): boolean`
- `isInside(int x, int y, int z): boolean`
- `isKidsRoom(): boolean`
- `isRoofFixed(): boolean`
- `isShop(): boolean`
- `isUserDefined(): boolean`
- `offset(int dx, int dy): void`
- `overlaps(RoomDef other): boolean`
- `refreshSquares(): void`
- `setBuilding(BuildingDef def): void`
- `setExplored(boolean explored): void`
- `setInvalidateCacheForAllChunks(int playerIndex, long dirtyFlags): void`
- `setName(String newName): void`
- `setRoofFixed(boolean b): void`

Constructors: `RoomDef.new()`, `RoomDef.new(long id, String name)`.

### RoomDef.RoomRect

`zombie.iso.RoomDef.RoomRect`, class.

Methods, called as `obj:name(...)`:

- `contains(float x, float y): boolean`
- `getClosestPoint(float x, float y, Vector2f closestXY): float`
- `getH(): int`
- `getW(): int`
- `getX(): int`
- `getX2(): int`
- `getY(): int`
- `getY2(): int`
- `set(int x, int y, int w, int h): RoomDef.RoomRect`

Constructors: `RoomDef.RoomRect.new()`, `RoomDef.RoomRect.new(int x, int y, int w, int h)`.

### SearchMode

`zombie.iso.SearchMode`, class.

Methods, called as `obj:name(...)`:

- `getBlur(int plrIdx): SearchMode.SearchModeFloat`
- `getDarkness(int plrIdx): SearchMode.SearchModeFloat`
- `getDesat(int plrIdx): SearchMode.SearchModeFloat`
- `getFadeTime(): float`
- `getGradientWidth(int plrIdx): SearchMode.SearchModeFloat`
- `getRadius(int plrIdx): SearchMode.SearchModeFloat`
- `getSearchModeForPlayer(int index): SearchMode.PlayerSearchMode`
- `isEnabled(int plrIdx): boolean`
- `isOverride(int plrIdx): boolean`
- `isOverrideSearchManager(int plrIdx): boolean`
- `setEnabled(int plrIdx, boolean b): void`
- `setFadeTime(float fadeTime): void`
- `setOverride(int plrIdx, boolean enabled): void`
- `setOverrideSearchManager(int plrIdx, boolean enabled): void`
- `update(): void`

Static functions, called as `SearchMode.name(...)`:

- `getInstance(): SearchMode`
- `reset(): void`

### SearchMode.PlayerSearchMode

`zombie.iso.SearchMode.PlayerSearchMode`, class.

Methods, called as `obj:name(...)`:

- `getBlur(): SearchMode.SearchModeFloat`
- `getDarkness(): SearchMode.SearchModeFloat`
- `getDesat(): SearchMode.SearchModeFloat`
- `getGradientWidth(): SearchMode.SearchModeFloat`
- `getRadius(): SearchMode.SearchModeFloat`
- `getShaderBlur(): float`
- `getShaderDarkness(): float`
- `getShaderDesat(): float`
- `getShaderGradientWidth(): float`
- `getShaderRadius(): float`
- `isShaderEnabled(): boolean`

Constructors: `SearchMode.PlayerSearchMode.new(int index, SearchMode sm)`.

### SearchMode.SearchModeFloat

`zombie.iso.SearchMode.SearchModeFloat`, class.

Methods, called as `obj:name(...)`:

- `equalise(): void`
- `getExterior(): float`
- `getInterior(): float`
- `getMax(): float`
- `getMin(): float`
- `getStepsize(): float`
- `getTargetExterior(): float`
- `getTargetInterior(): float`
- `reset(): void`
- `resetAll(): void`
- `set(float exterior, float targetExterior, float interior, float targetInterior): void`
- `setAll(float value): void`
- `setExterior(float exterior): void`
- `setInterior(float interior): void`
- `setTargetExterior(float targetExterior): void`
- `setTargetInterior(float targetInterior): void`
- `setTargets(float targetExterior, float targetInterior): void`
- `update(float delta): void`

### SliceY

`zombie.iso.SliceY`, class.

Constructors: `SliceY.new()`.

Static fields (a copy of the value taken when the class is exposed): `SliceBuffer: ByteBuffer`, `SliceBufferLock: Object`, `sliceBufferReader: ByteBufferReader`, `sliceBufferWriter: ByteBufferWriter`.

### IsoSprite

`zombie.iso.sprite.IsoSprite`, class.

Methods, called as `obj:name(...)`:

- `AddProperties(IsoSprite sprite): void`
- `CacheAnims(String key): void`
- `ChangeTintMod(ColorInfo newTintMod): void`
- `Dispose(): void`
- `LoadCache(String string): void`
- `LoadFrameExplicit(String objectName): Texture`
- `LoadFrames(String objectName, String animName, int nFrames): void`
- `LoadFramesNoDirPage(String objectName, String animName, int nFrames): void`
- `LoadFramesNoDirPageDirect(String objectName, String animName, int nFrames): void`
- `LoadFramesNoDirPageSimple(String objectName): void`
- `LoadFramesPageSimple(String nObjectName, String sObjectName, String eObjectName, String wObjectName): void`
- `LoadFramesReverseAltName(String objectName, String animName, String altName, int nFrames): void`
- `LoadSingleTexture(String textureName): Texture`
- `PlayAnim(String name): void`
- `PlayAnim(IsoAnim anim): void`
- `PlayAnimUnlooped(String name): void`
- `RenderGhostTile(int x, int y, int z): void`
- `RenderGhostTileColor(int x, int y, int z, float r, float g, float b, float a): void`
- `RenderGhostTileColor(int x, int y, int z, float offsetX, float offsetY, float r, float g, float b, float a): void`
- `RenderGhostTileRed(int x, int y, int z): void`
- `ReplaceCurrentAnimFrames(String objectName): void`
- `clearCurtainOffset(): void`
- `disposeAnimation(): void`
- `getAnimFrame(int frame): IsoDirectionFrame`
- `getCurtainOffset(): Vector3f`
- `getFacing(): IsoDirections`
- `getFasciaEdge(): FasciaEdge`
- `getFrameCount(): int`
- `getID(): int`
- `getItemHeight(): int`
- `getMaskClickedY(IsoDirections dir, int x, int y, boolean flip): float`
- `getName(): String`
- `getParentObjectName(): String`
- `getProperties(): PropertyContainer`
- `getProperty(String name): String`
- `getProperty(IsoPropertyType propertyType): String`
- `getRoofProperties(): RoofProperties`
- `getSheetGridIdFromName(): int`
- `getSlopedSurfaceDirection(): IsoDirections`
- `getSnowSprite(): IsoSprite`
- `getSpriteGrid(): IsoSpriteGrid`
- `getStackReplaceTileOffset(): int`
- `getSurface(): int`
- `getTextureForCurrentFrame(IsoDirections dir): Texture`
- `getTextureForCurrentFrame(IsoDirections dir, boolean useSnowSprite): Texture`
- `getTextureForCurrentFrame(IsoDirections dir, IsoObject obj): Texture`
- `getTextureForFrame(int frame, IsoDirections dir): Texture`
- `getTextureForFrame(int frame, IsoDirections dir, boolean useSnowSprite): Texture`
- `getTileType(): IsoObjectType`
- `getTintMod(): ColorInfo`
- `getType(): IsoObjectType`
- `hasActiveModel(): boolean`
- `hasAnimation(): boolean`
- `hasNoTextures(): boolean`
- `hasProperty(String propertyName): boolean`
- `hasProperty(IsoPropertyType propertyType): boolean`
- `hasProperty(IsoFlagType flag): boolean`
- `is(IsoFlagType flag): boolean`
- `isMaskClicked(IsoDirections dir, int x, int y): boolean`
- `isMaskClicked(IsoDirections dir, int x, int y, boolean flip): boolean`
- `isMoveWithWind(): boolean`
- `isSurfaceOffset(): boolean`
- `isTable(): boolean`
- `isTableTop(): boolean`
- `isWallSE(): boolean`
- `load(DataInputStream input): void`
- `newInstance(): IsoSpriteInstance`
- `render(IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep): void`
- `render(IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `render(IsoSpriteInstance inst, IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep): void`
- `render(IsoSpriteInstance inst, IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `renderActiveModel(): void`
- `renderBloodSplat(float x, float y, float z, ColorInfo info2): void`
- `renderCurrentAnim(IsoSpriteInstance inst, IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo col, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `renderCurrentAnimDepth(IsoSpriteInstance inst, IsoObject obj, IsoDirections dir, boolean cutawayNW, boolean cutawayNE, boolean cutawaySW, int cutawaySEX, float x, float y, float z, float offsetX, float offsetY, ColorInfo col, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `renderDepth(IsoObject obj, IsoDirections isoDirections, boolean cutawayNW, boolean cutawayNE, boolean cutawaySW, int cutawaySEX, float x, float y, float z, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `renderDepth(IsoSpriteInstance inst, IsoObject obj, IsoDirections isoDirections, boolean cutawayNW, boolean cutawayNE, boolean cutawaySW, int cutawaySEX, float x, float y, float z, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `renderObjectPicker(IsoSpriteInstance def, IsoObject obj, IsoDirections dir): void`
- `renderVehicle(IsoSpriteInstance inst, IsoObject obj, float x, float y, float z, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep): void`
- `renderWallSliceN(IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `renderWallSliceW(IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `save(DataOutputStream output): void`
- `setAnimate(boolean animate): void`
- `setCurtainOffset(float x, float y, float z): void`
- `setFasciaEdge(FasciaEdge fasciaEdge): void`
- `setFromCache(String objectName, String animName, int numFrames): IsoSprite`
- `setHideForWaterRender(): void`
- `setName(String string): void`
- `setParentObjectName(String val): void`
- `setSnowSprite(IsoSprite sprite): void`
- `setSpriteGrid(IsoSpriteGrid sGrid): void`
- `setTileType(IsoObjectType type): void`
- `setTintMod(ColorInfo info): void`
- `setType(IsoObjectType type): void`
- `shouldHaveCollision(): boolean`
- `update(): void`
- `update(IsoSpriteInstance def): void`

Static functions, called as `IsoSprite.name(...)`:

- `CreateSprite(IsoSpriteManager manager): IsoSprite`
- `CreateSpriteUsingCache(String objectName, String animName, int numFrames): IsoSprite`
- `DisposeAll(): void`
- `HasCache(String string): boolean`
- `calculateDepth(float x, float y, float z): float`
- `getSheetGridIdFromName(String name): int`
- `getSprite(IsoSpriteManager manager, int id): IsoSprite`
- `getSprite(IsoSpriteManager manager, String name, int offset): IsoSprite`
- `getSprite(IsoSpriteManager manager, IsoSprite spr, int offset): IsoSprite`
- `renderTextureWithDepth(Texture texture, float width, float height, float r, float g, float b, float a, float x, float y, float z): void`
- `setSpriteID(IsoSpriteManager manager, int id, IsoSprite spr): void`

Constructors: `IsoSprite.new()`, `IsoSprite.new(IsoSpriteManager manager)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_SPRITE_ID: int`, `RL_DEFAULT: byte`, `RL_FLOOR: byte`, `SDF_OPAQUE_PIXELS_ONLY: int`, `SDF_TRANSLUCENT: int`, `SDF_USE_OBJECT_DEPTH_TEXTURE: int`, `SEAM_SOUTH: boolean`, `alphaStep: float`, `globalOffsetX: float`, `globalOffsetY: float`, `maxCount: int`, `seamEast: boolean`, `seamFix2: TileSeamManager.Tiles`.

### IsoSpriteGrid

`zombie.iso.sprite.IsoSpriteGrid`, class.

Methods, called as `obj:name(...)`:

- `getAnchorSprite(): IsoSprite`
- `getHeight(): int`
- `getLevels(): int`
- `getSprite(int x, int y): IsoSprite`
- `getSprite(int x, int y, int z): IsoSprite`
- `getSpriteCount(): int`
- `getSpriteFromIndex(int index): IsoSprite`
- `getSpriteGridPosX(IsoSprite sprite): int`
- `getSpriteGridPosY(IsoSprite sprite): int`
- `getSpriteGridPosZ(IsoSprite sprite): int`
- `getSpriteIndex(int x, int y, int z): int`
- `getSpriteIndex(IsoSprite sprite): int`
- `getSprites(): IsoSprite[]`
- `getWidth(): int`
- `isValidXYZ(int x, int y, int z): boolean`
- `setSprite(int x, int y, int z, IsoSprite sprite): void`
- `setSprite(int x, int y, IsoSprite sprite): void`
- `validate(): boolean`

Constructors: `IsoSpriteGrid.new(int width, int height)`, `IsoSpriteGrid.new(int width, int height, int levels)`.

### IsoSpriteInstance

`zombie.iso.sprite.IsoSpriteInstance`, class.

Methods, called as `obj:name(...)`:

- `Dispose(): void`
- `RenderGhostTileColor(int x, int y, int z, float r, float g, float b, float a): void`
- `SetAlpha(float f): void`
- `SetTargetAlpha(float targetAlpha): void`
- `getAlpha(): float`
- `getFrame(): float`
- `getID(): int`
- `getName(): String`
- `getParentSprite(): IsoSprite`
- `getScaleX(): float`
- `getScaleY(): float`
- `getTargetAlpha(): float`
- `getTintB(): float`
- `getTintG(): float`
- `getTintR(): float`
- `isCopyTargetAlpha(): boolean`
- `isFinished(): boolean`
- `isMultiplyObjectAlpha(): boolean`
- `render(IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2): void`
- `render(IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep): void`
- `render(IsoObject obj, float x, float y, float z, IsoDirections dir, float offsetX, float offsetY, ColorInfo info2, boolean bDoRenderPrep, Consumer<TextureDraw> texdModifier): void`
- `scaleAspect(float texW, float texH, float width, float height): void`
- `setFrameSpeedPerFrame(float perSecond): void`
- `setScale(float scaleX, float scaleY): void`
- `update(): void`

Static functions, called as `IsoSpriteInstance.name(...)`:

- `add(IsoSpriteInstance isoSpriteInstance): void`
- `get(IsoSprite spr): IsoSpriteInstance`

Constructors: `IsoSpriteInstance.new()`, `IsoSpriteInstance.new(IsoSprite spr)`.

Static fields (a copy of the value taken when the class is exposed): `pool: ObjectPool<IsoSpriteInstance>`.

### IsoSpriteManager

`zombie.iso.sprite.IsoSpriteManager`, class.

Methods, called as `obj:name(...)`:

- `AddSprite(String tex): IsoSprite`
- `AddSprite(String tex, int id): IsoSprite`
- `Dispose(): void`
- `getNamedMap(): Map<String, IsoSprite>`
- `getOrAddSpriteCache(String tex): IsoSprite`
- `getOrAddSpriteCache(String tex, Color col): IsoSprite`
- `getSprite(int gid): IsoSprite`
- `getSprite(String gid): IsoSprite`

Constructors: `IsoSpriteManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: IsoSpriteManager`.

### IsoFlagType

`zombie.iso.SpriteDetails.IsoFlagType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `index(): int`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `IsoFlagType.name(...)`:

- `FromString(String str): IsoFlagType`
- `fromIndex(int value): IsoFlagType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): IsoFlagType`
- `values(): IsoFlagType[]`

Enum values (read as `IsoFlagType.VALUE`): `BlockRain`, `CantClimb`, `DoorWallN`, `DoorWallW`, `DoubleDoor1`, `DoubleDoor2`, `EntityScript`, `FloorAttachmentE`, `FloorAttachmentN`, `FloorAttachmentS`, `FloorAttachmentW`, `FloorHeightOneThird`, `FloorHeightTwoThirds`, `FloorOverlay`, `ForceAmbient`, `HasLightOnSprite`, `HasRainSplashes`, `HasRaindrop`, `HoppableN`, `HoppableW`, `IsFloorAttached`, `MAX`, `NeverCutaway`, `NoWallLighting`, `SpearOnlyAttackThrough`, `SpriteConfig`, `TallHoppableN`, `TallHoppableW`, `WallN`, `WallNTrans`, `WallNW`, `WallOverlay`, `WallSE`, `WallW`, `WallWTrans`, `WindowN`, `WindowW`, `alwaysDraw`, `attachedCeiling`, `attachedE`, `attachedFloor`, `attachedN`, `attachedNW`, `attachedS`, `attachedSE`, `attachedSurface`, `attachedW`, `attachtostairs`, `bed`, `blocksight`, `blueprint`, `burning`, `burntOut`, `canBeCut`, `canBeRemoved`, `canPathN`, `canPathW`, `climbSheetE`, `climbSheetN`, `climbSheetS`, `climbSheetTopE`, `climbSheetTopN`, `climbSheetTopS`, `climbSheetTopW`, `climbSheetW`, `collideN`, `collideW`, `container`, `cutN`, `cutW`, `diamondFloor`, `doorN`, `doorW`, `exterior`, `floorE`, `floorS`, `forceRender`, `halfheight`, `hidewalls`, `invisible`, `isEave`, `makeWindowInvincible`, `noStart`, `ontable`, `open`, `openAir`, `pushable`, `sheetCurtains`, `shelfE`, `shelfS`, `smoke`, `solid`, `solidfloor`, `solidtrans`, `tableE`, `tableN`, `tableNE`, `tableNW`, `tableS`, `tableSE`, `tableSW`, `tableW`, `taintedWater`, `trans`, `transparentFloor`, `transparentN`, `transparentW`, `unflamable`, `unlit`, `vegitation`, `water`, `waterPiped`, `windowN`, `windowW`.

### IsoObjectType

`zombie.iso.SpriteDetails.IsoObjectType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `index(): int`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `IsoObjectType.name(...)`:

- `FromString(String str): IsoObjectType`
- `fromIndex(int value): IsoObjectType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): IsoObjectType`
- `values(): IsoObjectType[]`

Enum values (read as `IsoObjectType.VALUE`): `MAX`, `UNUSED10`, `UNUSED24`, `UNUSED9`, `WestRoofB`, `WestRoofM`, `WestRoofT`, `curtainE`, `curtainN`, `curtainS`, `curtainW`, `doorFrN`, `doorFrW`, `doorN`, `doorW`, `isMoveAbleObject`, `jukebox`, `lightswitch`, `normal`, `radio`, `stairsBN`, `stairsBW`, `stairsMN`, `stairsMW`, `stairsTN`, `stairsTW`, `tree`, `wall`, `windowFN`, `windowFW`.

### SpriteModel

`zombie.iso.SpriteModel`, class. Extends [BaseScriptObject](/pz/build-42/modding/reference/lua-classes-scripts-1#basescriptobject). Also has the methods of [BaseScriptObject](/pz/build-42/modding/reference/lua-classes-scripts-1#basescriptobject) (29), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String totalFile): void`
- `getAnimationName(): String`
- `getAnimationTime(): float`
- `getModelScriptName(): String`
- `getRotate(): Vector3f`
- `getRuntimeString(): String`
- `getScale(): float`
- `getTextureName(): String`
- `getTranslate(): Vector3f`
- `parseRuntimeString(String tilesetName, int tileColumn, int tileRow, String runtimeString): void`
- `set(SpriteModel other): SpriteModel`
- `setAnimationName(String animationName): void`
- `setAnimationTime(float animationTime): void`
- `setModelScriptName(String modelScriptName): void`
- `setRuntimeString(String runtimeString): void`
- `setScale(float scale): void`
- `setTextureName(String textureName): void`

Constructors: `SpriteModel.new()`.

### TileOverlays

`zombie.iso.TileOverlays`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `addOverlays(KahluaTableImpl overlayMap): void`
- `fixTableTopOverlays(IsoGridSquare square): void`
- `getUnderlyingSpriteNames(String overlayName): ArrayList<String>`
- `hasOverlays(IsoObject obj): boolean`
- `updateTileOverlaySprite(IsoObject obj): void`

Constructors: `TileOverlays.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: TileOverlays`.

### Vector2

`zombie.iso.Vector2`, class.

Methods, called as `obj:name(...)`:

- `add(Vector2 other): Vector2`
- `aimAt(Vector2 other): Vector2`
- `angleBetween(Vector2 other): float`
- `angleTo(Vector2 other): float`
- `clone(): Vector2`
- `distanceTo(Vector2 other): float`
- `dot(float otherX, float otherY): float`
- `dot(Vector2 other): float`
- `equals(Object other): boolean`
- `floorX(): int`
- `floorY(): int`
- `getDirection(): float`
- `getDirectionNeg(): float`
- `getLength(): float`
- `getLengthSquared(): float`
- `getX(): float`
- `getY(): float`
- `mul(float m): Vector2`
- `normalize(): float`
- `rotate(float radians): void`
- `scale(float scale): void`
- `set(float x, float y): Vector2`
- `set(Vector2 other): Vector2`
- `setDirection(float directionRadians): Vector2`
- `setLength(float length): Vector2`
- `setLengthAndDirection(float direction, float length): Vector2`
- `setMaxLength(float maxLength): float`
- `setX(float x): void`
- `setY(float y): void`
- `tangent(): void`
- `toString(): String`

Static functions, called as `Vector2.name(...)`:

- `addScaled(Vector2 a, Vector2 b, float scale, Vector2 result): Vector2`
- `dot(float x, float y, float tx, float ty): float`
- `fromLengthDirection(float length, float direction): Vector2`
- `getDirection(float x, float y): float`
- `moveTowards(Vector2 currentVector, Vector2 targetVector, float maxDistanceDelta): Vector2`
- `scale(Vector2 val, float scale): Vector2`

Constructors: `Vector2.new()`, `Vector2.new(float x, float y)`, `Vector2.new(Vector2 other)`.

### Vector3

`zombie.iso.Vector3`, class.

Methods, called as `obj:name(...)`:

- `add(Vector2 other): Vector2`
- `addToThis(Vector2 other): Vector3`
- `addToThis(Vector3 other): Vector3`
- `aimAt(Vector2 other): Vector3`
- `angleTo(Vector2 other): float`
- `clone(): Vector3`
- `distanceTo(float x, float y, float z): float`
- `distanceTo(Vector2 other): float`
- `distanceTo(Vector3 other): float`
- `div(float scalar): Vector3`
- `dot(Vector2 other): float`
- `dot3d(Vector3 other): float`
- `equals(Object other): boolean`
- `getDirection(): float`
- `getLength(): float`
- `getLengthSq(): float`
- `normalize(): void`
- `rotate(float rad): void`
- `rotatey(float rad): void`
- `set(float x, float y, float z): Vector3`
- `set(Vector3 other): Vector3`
- `setDirection(float direction): Vector3`
- `setLength(float length): Vector3`
- `setLengthAndDirection(float direction, float length): Vector3`
- `sub(Vector3 val, Vector3 out): Vector3`
- `toString(): String`

Static functions, called as `Vector3.name(...)`:

- `dot(float x, float y, float tx, float ty): float`
- `fromLengthDirection(float length, float direction): Vector2`
- `sub(Vector3 a, Vector3 b, Vector3 out): Vector3`

Constructors: `Vector3.new()`, `Vector3.new(float x, float y, float z)`, `Vector3.new(Vector3 other)`.

### ClimateColorInfo

`zombie.iso.weather.ClimateColorInfo`, class.

Methods, called as `obj:name(...)`:

- `getExterior(): Color`
- `getInterior(): Color`
- `interp(ClimateColorInfo to, float t, ClimateColorInfo result): ClimateColorInfo`
- `load(DataInputStream input, int worldVersion): void`
- `read(ByteBufferReader input): void`
- `save(DataOutputStream output): void`
- `scale(float val): void`
- `setExterior(float r, float g, float b, float a): void`
- `setExterior(Color other): void`
- `setInterior(float r, float g, float b, float a): void`
- `setInterior(Color other): void`
- `setTo(ClimateColorInfo other): void`
- `write(ByteBufferWriter output): void`

Static functions, called as `ClimateColorInfo.name(...)`:

- `interp(ClimateColorInfo source, ClimateColorInfo target, float t, ClimateColorInfo resultColorInfo): ClimateColorInfo`
- `writeColorInfoConfig(): boolean`

Constructors: `ClimateColorInfo.new()`, `ClimateColorInfo.new(float r, float g, float b, float a)`, `ClimateColorInfo.new(float r, float g, float b, float a, float r2, float g2, float b2, float a2)`.

### ClimateForecaster

`zombie.iso.weather.ClimateForecaster`, class.

Methods, called as `obj:name(...)`:

- `getDaysTillFirstWeather(): int`
- `getForecast(): ClimateForecaster.DayForecast`
- `getForecast(int offset): ClimateForecaster.DayForecast`
- `getForecasts(): ArrayList<ClimateForecaster.DayForecast>`

Constructors: `ClimateForecaster.new()`.

### ClimateForecaster.DayForecast

`zombie.iso.weather.ClimateForecaster.DayForecast`, class.

Methods, called as `obj:name(...)`:

- `getAirFront(): ClimateManager.AirFront`
- `getAirFrontString(): String`
- `getCloudiness(): ClimateForecaster.ForecastValue`
- `getDawn(): float`
- `getDayLightHours(): float`
- `getDusk(): float`
- `getFogDuration(): float`
- `getFogStrength(): float`
- `getHumidity(): ClimateForecaster.ForecastValue`
- `getIndexOffset(): int`
- `getMeanWindAngleString(): String`
- `getName(): String`
- `getTemperature(): ClimateForecaster.ForecastValue`
- `getWeatherEndTime(): float`
- `getWeatherOverlap(): ClimateForecaster.DayForecast`
- `getWeatherPeriod(): WeatherPeriod`
- `getWeatherStages(): ArrayList<Integer>`
- `getWeatherStartTime(): float`
- `getWindDirection(): ClimateForecaster.ForecastValue`
- `getWindPower(): ClimateForecaster.ForecastValue`
- `isChanceOnSnow(): boolean`
- `isHasBlizzard(): boolean`
- `isHasFog(): boolean`
- `isHasHeavyRain(): boolean`
- `isHasStorm(): boolean`
- `isHasTropicalStorm(): boolean`
- `isWeatherStarts(): boolean`

Constructors: `ClimateForecaster.DayForecast.new()`.

### ClimateForecaster.ForecastValue

`zombie.iso.weather.ClimateForecaster.ForecastValue`, class.

Methods, called as `obj:name(...)`:

- `getDayMax(): float`
- `getDayMean(): float`
- `getDayMin(): float`
- `getNightMax(): float`
- `getNightMean(): float`
- `getNightMin(): float`
- `getTotalMax(): float`
- `getTotalMean(): float`
- `getTotalMin(): float`

Constructors: `ClimateForecaster.ForecastValue.new()`.

### ClimateHistory

`zombie.iso.weather.ClimateHistory`, class.

Methods, called as `obj:name(...)`:

- `init(ClimateManager climateManager): void`
- `updateDayChange(ClimateManager climateManager): void`

Constructors: `ClimateHistory.new()`.

### ClimateManager

`zombie.iso.weather.ClimateManager`, class.

Methods, called as `obj:name(...)`:

- `CalculateWeatherFrontStrength(int year, int month, int day, ClimateManager.AirFront front): void`
- `CopyClimateValues(ClimateValues copy): void`
- `Reset(): void`
- `execute_Simulation(): void`
- `execute_Simulation(int rainModOverride): void`
- `forceDayInfoUpdate(): void`
- `getAirMass(): float`
- `getAirMassDaily(): float`
- `getAirMassTemperature(): float`
- `getAirTemperatureForCharacter(IsoGameCharacter plr): float`
- `getAirTemperatureForCharacter(IsoGameCharacter plr, boolean doWindChill): float`
- `getAirTemperatureForSquare(IsoGridSquare square): float`
- `getAirTemperatureForSquare(IsoGridSquare square, BaseVehicle vehicle): float`
- `getAirTemperatureForSquare(IsoGridSquare square, BaseVehicle vehicle, boolean doWindChill): float`
- `getAmbient(): float`
- `getBaseTemperature(): float`
- `getBoolMax(): int`
- `getClimateBool(int id): ClimateManager.ClimateBool`
- `getClimateColor(int id): ClimateManager.ClimateColor`
- `getClimateFloat(int id): ClimateManager.ClimateFloat`
- `getClimateForecaster(): ClimateForecaster`
- `getClimateHistory(): ClimateHistory`
- `getClimateValuesCopy(): ClimateValues`
- `getCloudIntensity(): float`
- `getColFog(): ClimateColorInfo`
- `getColFogLegacy(): ClimateColorInfo`
- `getColFogNew(): ClimateColorInfo`
- `getColNight(): ClimateColorInfo`
- `getColNightMoon(): ClimateColorInfo`
- `getColNightNoMoon(): ClimateColorInfo`
- `getColorMax(): int`
- `getColorNewFog(): ClimateColorInfo`
- `getCorrectedWindAngleIntensity(): float`
- `getCurrentDay(): ClimateManager.DayInfo`
- `getDayLightStrength(): float`
- `getDayMeanTemperature(): float`
- `getDesaturation(): float`
- `getEnabledFxUpdate(): boolean`
- `getEnabledSimulation(): boolean`
- `getEnabledWeatherGeneration(): boolean`
- `getFloatMax(): int`
- `getFogIntensity(): float`
- `getFogTintStorm(): ClimateColorInfo`
- `getFogTintTropical(): ClimateColorInfo`
- `getFrontStrength(): float`
- `getGlobalLight(): ClimateColorInfo`
- `getGlobalLightIntensity(): float`
- `getGlobalLightInternal(): Color`
- `getHumidity(): float`
- `getIsThunderStorming(): boolean`
- `getMaxWindspeedKph(): float`
- `getMaxWindspeedMph(): float`
- `getModData(): KahluaTable`
- `getNextDay(): ClimateManager.DayInfo`
- `getNightStrength(): float`
- `getPrecipitationIntensity(): float`
- `getPrecipitationIsSnow(): boolean`
- `getPreviousDay(): ClimateManager.DayInfo`
- `getRainIntensity(): float`
- `getSeason(): ErosionSeason`
- `getSeasonColor(int segment, int temperature, int season): ClimateColorInfo`
- `getSeasonId(): byte`
- `getSeasonName(): String`
- `getSeasonNameTranslated(): String`
- `getSeasonProgression(): float`
- `getSeasonStrength(): float`
- `getSimplexOffsetA(): double`
- `getSimplexOffsetB(): double`
- `getSimplexOffsetC(): double`
- `getSimplexOffsetD(): double`
- `getSnowFracNow(): float`
- `getSnowIntensity(): float`
- `getSnowStrength(): float`
- `getTemperature(): float`
- `getThunderStorm(): ThunderStorm`
- `getViewDistance(): float`
- `getWeatherInterference(): float`
- `getWeatherPeriod(): WeatherPeriod`
- `getWindAngleDegrees(): float`
- `getWindAngleIntensity(): float`
- `getWindAngleRadians(): float`
- `getWindForceMovement(IsoGameCharacter character, float angle): float`
- `getWindIntensity(): float`
- `getWindPower(): float`
- `getWindSpeedMovement(): float`
- `getWindspeedKph(): float`
- `getWorldAgeHours(): double`
- `init(IsoMetaGrid metaGrid): void`
- `isRaining(): boolean`
- `isSnowing(): boolean`
- `isUpdated(): boolean`
- `launchFlare(): void`
- `load(DataInputStream input, int worldVersion): void`
- `postCellLoadSetSnow(): void`
- `receiveClimatePacket(ByteBufferReader bb, UdpConnection ignoreConnection): void`
- `resetAdmin(): void`
- `resetModded(): void`
- `resetOverrides(): void`
- `save(DataOutputStream output): void`
- `sendInitialState(IConnection connection): void`
- `setAmbient(float f): void`
- `setDayLightStrength(float f): void`
- `setDesaturation(float desaturation): void`
- `setEnabledFxUpdate(boolean b): void`
- `setEnabledSimulation(boolean b): void`
- `setEnabledWeatherGeneration(boolean b): void`
- `setNightStrength(float b): void`
- `setPrecipitationIsSnow(boolean b): void`
- `setSeasonColorDawn(int temperature, int season, float r, float g, float b, float a, boolean exterior): void`
- `setSeasonColorDay(int temperature, int season, float r, float g, float b, float a, boolean exterior): void`
- `setSeasonColorDusk(int temperature, int season, float r, float g, float b, float a, boolean exterior): void`
- `setViewDistance(float f): void`
- `stopWeatherAndThunder(): void`
- `transmitClientChangeAdminVars(): void`
- `transmitGenerateWeather(float strength, int front): void`
- `transmitRequestAdminVars(): void`
- `transmitServerStartRain(float intensity): void`
- `transmitServerStopRain(): void`
- `transmitServerStopWeather(): void`
- `transmitServerTriggerLightning(int x, int y, boolean doStrike, boolean doLightning, boolean doRumble): void`
- `transmitServerTriggerStorm(float duration): void`
- `transmitStopWeather(): void`
- `transmitTriggerBlizzard(float duration): void`
- `transmitTriggerStorm(float duration): void`
- `transmitTriggerTropical(float duration): void`
- `triggerCustomWeather(float strength, boolean warmFront): boolean`
- `triggerCustomWeatherStage(int stage, float duration): boolean`
- `triggerKateBobIntroStorm(int centerX, int centerY, double duration, float strength, float initialProgress, float angle, float initialPuddles): void`
- `triggerKateBobIntroStorm(int centerX, int centerY, double duration, float strength, float initialProgress, float angle, float initialPuddles, ClimateColorInfo cloudcolor): void`
- `triggerWinterIsComingStorm(): void`
- `update(): void`
- `updateEveryTenMins(): void`
- `updateOLD(): void`

Static functions, called as `ClimateManager.name(...)`:

- `ToKph(float val): float`
- `ToMph(float val): float`
- `clamp(float min, float max, float val): float`
- `clamp(int min, int max, int val): int`
- `clamp01(float val): float`
- `clerp(float t, float a, float b): float`
- `getInstance(): ClimateManager`
- `getWindAngleString(float angle): String`
- `getWindNoiseBase(): double`
- `getWindNoiseFinal(): double`
- `getWindTickFinal(): double`
- `lerp(float t, float a, float b): float`
- `normalizeRange(float v, float n): float`
- `posToPosNegRange(float v): float`
- `setInstance(ClimateManager inst): void`

Constructors: `ClimateManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `AVG_FAV_AIR_TEMPERATURE: float`, `BOOL_IS_SNOW: int`, `BOOL_MAX: int`, `COLOR_GLOBAL_LIGHT: int`, `COLOR_MAX: int`, `COLOR_NEW_FOG: int`, `FLOAT_AMBIENT: int`, `FLOAT_CLOUD_INTENSITY: int`, `FLOAT_DAYLIGHT_STRENGTH: int`, `FLOAT_DESATURATION: int`, `FLOAT_FOG_INTENSITY: int`, `FLOAT_GLOBAL_LIGHT_INTENSITY: int`, `FLOAT_HUMIDITY: int`, `FLOAT_MAX: int`, `FLOAT_NIGHT_STRENGTH: int`, `FLOAT_PRECIPITATION_INTENSITY: int`, `FLOAT_TEMPERATURE: int`, `FLOAT_VIEW_DISTANCE: int`, `FLOAT_WIND_ANGLE_INTENSITY: int`, `FLOAT_WIND_INTENSITY: int`, `FRONT_COLD: int`, `FRONT_STATIONARY: int`, `FRONT_WARM: int`, `MAX_WINDSPEED_KPH: float`, `MAX_WINDSPEED_MPH: float`, `PUDDLES_BROADCAST_INTERVAL_MS: long`, `PacketAdminVarsUpdate: byte`, `PacketClientChangedAdminVars: byte`, `PacketClientChangedWeather: byte`, `PacketFlare: byte`, `PacketRequestAdminVars: byte`, `PacketThunderEvent: byte`, `PacketUpdateClimateVars: byte`, `PacketWeatherUpdate: byte`, `aStormIsComing: boolean`, `theDescendingFog: boolean`, `winterIsComing: boolean`.

### ClimateManager.AirFront

`zombie.iso.weather.ClimateManager.AirFront`, class.

Methods, called as `obj:name(...)`:

- `addDaySample(float noiseval): void`
- `copyFrom(ClimateManager.AirFront other): void`
- `getAngleDegrees(): float`
- `getDays(): float`
- `getMaxNoise(): float`
- `getStrength(): float`
- `getTotalNoise(): float`
- `getType(): int`
- `load(DataInputStream input): void`
- `save(DataOutputStream output): void`
- `setFrontType(int type): void`
- `setStrength(float str): void`

Constructors: `ClimateManager.AirFront.new()`.

### ClimateManager.ClimateBool

`zombie.iso.weather.ClimateManager.ClimateBool`, class.

Methods, called as `obj:name(...)`:

- `getAdminValue(): boolean`
- `getID(): int`
- `getInternalValue(): boolean`
- `getModdedValue(): boolean`
- `getName(): String`
- `getOverride(): boolean`
- `init(int id, String name): ClimateManager.ClimateBool`
- `isEnableAdmin(): boolean`
- `isEnableOverride(): boolean`
- `setAdminValue(boolean b): void`
- `setEnableAdmin(boolean b): void`
- `setEnableModded(boolean b): void`
- `setEnableOverride(boolean b): void`
- `setFinalValue(boolean b): void`
- `setModdedValue(boolean b): void`
- `setOverride(boolean b): void`

Constructors: `ClimateManager.ClimateBool.new()`.

### ClimateManager.ClimateColor

`zombie.iso.weather.ClimateManager.ClimateColor`, class.

Methods, called as `obj:name(...)`:

- `getAdminValue(): ClimateColorInfo`
- `getFinalValue(): ClimateColorInfo`
- `getID(): int`
- `getInternalValue(): ClimateColorInfo`
- `getModdedValue(): ClimateColorInfo`
- `getName(): String`
- `getOverride(): ClimateColorInfo`
- `getOverrideInterpolate(): float`
- `init(int id, String name): ClimateManager.ClimateColor`
- `isEnableAdmin(): boolean`
- `isEnableOverride(): boolean`
- `setAdminValue(float r, float g, float b, float a, float r1, float g1, float b1, float a1): void`
- `setAdminValue(ClimateColorInfo targ): void`
- `setAdminValueExterior(float r, float g, float b, float a): void`
- `setAdminValueInterior(float r, float g, float b, float a): void`
- `setEnableAdmin(boolean b): void`
- `setEnableModded(boolean b): void`
- `setEnableOverride(boolean b): void`
- `setFinalValue(ClimateColorInfo targ): void`
- `setModdedInterpolate(float f): void`
- `setModdedValue(ClimateColorInfo targ): void`
- `setOverride(ByteBufferReader input, float interp): void`
- `setOverride(ClimateColorInfo targ, float inter): void`

Constructors: `ClimateManager.ClimateColor.new()`.

### ClimateManager.ClimateFloat

`zombie.iso.weather.ClimateManager.ClimateFloat`, class.

Methods, called as `obj:name(...)`:

- `getAdminValue(): float`
- `getFinalValue(): float`
- `getID(): int`
- `getInternalValue(): float`
- `getMax(): float`
- `getMin(): float`
- `getModdedValue(): float`
- `getName(): String`
- `getOverride(): float`
- `getOverrideInterpolate(): float`
- `init(int id, String name): ClimateManager.ClimateFloat`
- `isEnableAdmin(): boolean`
- `isEnableOverride(): boolean`
- `setAdminValue(float f): void`
- `setEnableAdmin(boolean b): void`
- `setEnableModded(boolean b): void`
- `setEnableOverride(boolean b): void`
- `setFinalValue(float f): void`
- `setModdedInterpolate(float f): void`
- `setModdedValue(float f): void`
- `setOverride(float targ, float inter): void`
- `setOverrideValue(boolean overrideValue): void`

Constructors: `ClimateManager.ClimateFloat.new()`.

### ClimateManager.DayInfo

`zombie.iso.weather.ClimateManager.DayInfo`, class.

Methods, called as `obj:name(...)`:

- `getDateValue(): long`
- `getDay(): int`
- `getHour(): int`
- `getMinutes(): int`
- `getMonth(): int`
- `getSeason(): ErosionSeason`
- `getYear(): int`
- `set(int day, int month, int year): void`

Constructors: `ClimateManager.DayInfo.new()`.

### ClimateMoon

`zombie.iso.weather.ClimateMoon`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `getCurrentMoonPhase(): int`
- `getMoonFloat(): float`
- `getPhaseName(): String`
- `updatePhase(int year, int month, int day): void`

Static functions, called as `ClimateMoon.name(...)`:

- `getInstance(): ClimateMoon`

Constructors: `ClimateMoon.new()`.

### ClimateValues

`zombie.iso.weather.ClimateValues`, class.

Methods, called as `obj:name(...)`:

- `CopyValues(ClimateValues copy): void`
- `getAirFrontAirmass(): float`
- `getAirMassNoiseFrequencyMod(): double`
- `getAirMassTemperature(): float`
- `getAmbient(): float`
- `getBaseTemperature(): float`
- `getCacheDay(): int`
- `getCacheMonth(): int`
- `getCacheWorldAgeHours(): double`
- `getCacheYear(): int`
- `getCloudIntensity(): float`
- `getCloudyT(): float`
- `getCopy(): ClimateValues`
- `getDawn(): float`
- `getDayFogDuration(): float`
- `getDayFogStrength(): float`
- `getDayLightLagged(): float`
- `getDayLightStrength(): float`
- `getDayLightStrengthBase(): float`
- `getDayMeanTemperature(): float`
- `getDesaturation(): float`
- `getDusk(): float`
- `getHumidity(): float`
- `getLerpNight(): float`
- `getNightLagged(): float`
- `getNightStrength(): float`
- `getNoiseAirmass(): float`
- `getNoon(): float`
- `getTemperature(): float`
- `getTime(): float`
- `getWindAngleDegrees(): float`
- `getWindAngleIntensity(): float`
- `getWindIntensity(): float`
- `isDayDoFog(): boolean`
- `isTemperatureIsSnow(): boolean`
- `pollDate(int year, int month, int dayOfMonth): void`
- `pollDate(int year, int month, int dayOfMonth, int hourOfDay): void`
- `pollDate(int year, int month, int dayOfMonth, int hourOfDay, int minute): void`
- `pollDate(GregorianCalendar calendar): void`
- `print(): void`

Constructors: `ClimateValues.new(ClimateManager clim)`.

### ImprovedFog

`zombie.iso.weather.fog.ImprovedFog`, class.

Static functions, called as `ImprovedFog.name(...)`:

- `DrawSubTextureRGBA(Texture tex, double subX, double subY, double subW, double subH, double x, double y, double w, double h, double r, double g, double b, double a): void`
- `endRender(): void`
- `getAlphaCircleAlpha(): float`
- `getAlphaCircleRad(): float`
- `getBaseAlpha(): float`
- `getBottomAlphaHeight(): float`
- `getColorB(): float`
- `getColorG(): float`
- `getColorR(): float`
- `getDrawer(): ImprovedFogDrawer`
- `getMaxXOffset(): int`
- `getMaxYOffset(): int`
- `getMinXOffset(): int`
- `getNoiseTexture(): Texture`
- `getOctaves(): float`
- `getRenderEveryXRow(): int`
- `getRenderXRowsFromCenter(): int`
- `getScalingX(): float`
- `getScalingY(): float`
- `getSecondLayerAlpha(): float`
- `getTopAlphaHeight(): float`
- `init(): void`
- `isDrawDebugColors(): boolean`
- `isEnableEditing(): boolean`
- `isHighQuality(): boolean`
- `isRenderCurrentLayerOnly(): boolean`
- `isRenderEndOnly(): boolean`
- `isRenderOnlyOneRow(): boolean`
- `renderRowsBehind(IsoGridSquare squareMax): void`
- `setAlphaCircleAlpha(float alphaCircleAlpha): void`
- `setAlphaCircleRad(float alphaCircleRad): void`
- `setBaseAlpha(float baseAlpha): void`
- `setBottomAlphaHeight(float bottomAlphaHeight): void`
- `setColorB(float colorB): void`
- `setColorG(float colorG): void`
- `setColorR(float colorR): void`
- `setDrawDebugColors(boolean drawDebugColors): void`
- `setEnableEditing(boolean enableEditing): void`
- `setHighQuality(boolean highQuality): void`
- `setMaxXOffset(int maxXOffset): void`
- `setMaxYOffset(int maxYOffset): void`
- `setMinXOffset(int minXOffset): void`
- `setOctaves(float octaves): void`
- `setRenderCurrentLayerOnly(boolean renderCurrentLayerOnly): void`
- `setRenderEndOnly(boolean renderEndOnly): void`
- `setRenderEveryXRow(int renderEveryXRow): void`
- `setRenderOnlyOneRow(boolean renderOnlyOneRow): void`
- `setRenderXRowsFromCenter(int renderXRowsFromCenter): void`
- `setScalingX(float scalingX): void`
- `setScalingY(float scalingY): void`
- `setSecondLayerAlpha(float secondLayerAlpha): void`
- `setTopAlphaHeight(float topAlphaHeight): void`
- `startFrame(ImprovedFogDrawer drawer): void`
- `startRender(int nPlayer, int z): boolean`
- `update(): void`
- `updateKeys(): void`

Constructors: `ImprovedFog.new()`.

Static fields (a copy of the value taken when the class is exposed): `MAX_FOG_Z: int`.

### IsoWeatherFX

`zombie.iso.weather.fx.IsoWeatherFX`, class.

Methods, called as `obj:name(...)`:

- `Reset(): void`
- `getCloudIntensity(): float`
- `getDrawer(int id): WeatherParticleDrawer`
- `getFogIntensity(): float`
- `getPrecipitationIntensity(): float`
- `getPrecipitationIsSnow(): boolean`
- `getRenderWindAngleRain(): float`
- `getWindAngleIntensity(): float`
- `getWindIntensity(): float`
- `getWindPrecipIntensity(): float`
- `hasCloudsToRender(): boolean`
- `hasFogToRender(): boolean`
- `hasPrecipitationToRender(): boolean`
- `init(): void`
- `isDebugBounds(): boolean`
- `render(): void`
- `renderClouds(): void`
- `renderFog(): void`
- `renderLayered(boolean doClouds, boolean doFog, boolean doPrecip): void`
- `renderPrecipitation(): void`
- `setCloudIntensity(float intensity): void`
- `setDebugBounds(boolean b): void`
- `setFogIntensity(float intensity): void`
- `setPrecipitationIntensity(float intensity): void`
- `setPrecipitationIsSnow(boolean b): void`
- `setWindAngleIntensity(float intensity): void`
- `setWindIntensity(float intensity): void`
- `setWindPrecipIntensity(float intensity): void`
- `update(): void`

Static functions, called as `IsoWeatherFX.name(...)`:

- `clamp(float min, float max, float val): float`
- `clerp(float t, float a, float b): float`
- `lerp(float t, float a, float b): float`

Constructors: `IsoWeatherFX.new()`.

Static fields (a copy of the value taken when the class is exposed): `cloudId: int`, `fogId: int`, `rainId: int`, `snowId: int`, `zoomMod: float`.

### Temperature

`zombie.iso.weather.Temperature`, class.

Static functions, called as `Temperature.name(...)`:

- `CelsiusToFahrenheit(float celsius): float`
- `FahrenheitToCelsius(float fahrenheit): float`
- `WindchillCelsiusKph(float t, float v): float`
- `getCelsiusPostfix(): String`
- `getFahrenheitPostfix(): String`
- `getFractionForRealTimeRatePerMin(float rate): float`
- `getRoundedDisplayTemperature(float celsius): int`
- `getTemperaturePostfix(): String`
- `getTemperatureString(float celsius): String`
- `getTrueInsulationValue(float insulation): float`
- `getTrueWindresistanceValue(float windresist): float`
- `getValueColor(float val): Color`
- `getWindChillAmountForPlayer(IsoPlayer player): float`
- `reset(): void`

Constructors: `Temperature.new()`.

Static fields (a copy of the value taken when the class is exposed): `BodyMaxTemp: float`, `BodyMinTemp: float`, `CELSIUS_POSTFIX: String`, `DO_DAYLEN_MOD: boolean`, `DO_DEFAULT_BASE: boolean`, `FAHRENHEIT_POSTFIX: String`, `FavorableNakedTemp: float`, `FavorableRoomTemp: float`, `Hyperthermia_1: float`, `Hyperthermia_2: float`, `Hyperthermia_3: float`, `Hyperthermia_4: float`, `Hypothermia_1: float`, `Hypothermia_2: float`, `Hypothermia_3: float`, `Hypothermia_4: float`, `TrueInsulationMultiplier: float`, `TrueWindresistMultiplier: float`, `coreCelciusMax: float`, `coreCelciusMin: float`, `homeostasisDefault: float`, `neutralZone: float`, `skinCelciusFavorable: float`, `skinCelciusMax: float`, `skinCelciusMin: float`.

### ThunderStorm

`zombie.iso.weather.ThunderStorm`, class.

Methods, called as `obj:name(...)`:

- `HasActiveThunderClouds(): boolean`
- `applyLightningForPlayer(RenderSettings.PlayerRenderSettings renderSettings, int plrIndex, IsoPlayer player): void`
- `enqueueThunderEvent(int x, int y, boolean doStrike, boolean doLightning, boolean doRumble): void`
- `getClouds(): ArrayList<ThunderStorm.ThunderCloud>`
- `isModifyingNight(): boolean`
- `load(DataInputStream input): void`
- `noise(String s): void`
- `readNetThunderEvent(ByteBufferReader input): void`
- `save(DataOutputStream output): void`
- `startThunderCloud(float str, float angle, float radius, float eventFreq, float thunderRatio, double duration, boolean targetRandomPlayer): void`
- `startThunderCloud(float str, float angle, float radius, float eventFreq, float thunderRatio, double duration, boolean targetRandomPlayer, float percentageOffset): ThunderStorm.ThunderCloud`
- `stopAllClouds(): void`
- `stopCloud(int id): void`
- `triggerThunderEvent(int x, int y, boolean doStrike, boolean doLightning, boolean doRumble): void`
- `update(double currentTime): void`
- `writeNetThunderEvent(ByteBufferWriter output): void`

Static functions, called as `ThunderStorm.name(...)`:

- `getMapDiagonal(): int`

Constructors: `ThunderStorm.new(ClimateManager climmgr)`.

Static fields (a copy of the value taken when the class is exposed): `mapMaxX: int`, `mapMaxY: int`, `mapMinX: int`, `mapMinY: int`.

### ThunderStorm.ThunderCloud

`zombie.iso.weather.ThunderStorm.ThunderCloud`, class.

Methods, called as `obj:name(...)`:

- `getCurrentX(): int`
- `getCurrentY(): int`
- `getRadius(): float`
- `getStrength(): float`
- `isRunning(): boolean`
- `lifeTime(): double`
- `setCenter(int centerX, int centerY, float angle): void`

Constructors: `ThunderStorm.ThunderCloud.new()`.

### WeatherPeriod

`zombie.iso.weather.WeatherPeriod`, class.

Methods, called as `obj:name(...)`:

- `createAndAddModdedStage(String moddedID, double duration): WeatherPeriod.WeatherStage`
- `createAndAddStage(int typeid, double duration): WeatherPeriod.WeatherStage`
- `endCreateModdedPeriod(): boolean`
- `getCloudColor(): ClimateColorInfo`
- `getCloudColorBlizzard(): ClimateColorInfo`
- `getCloudColorBlueish(): ClimateColorInfo`
- `getCloudColorGreenish(): ClimateColorInfo`
- `getCloudColorPurplish(): ClimateColorInfo`
- `getCloudColorReddish(): ClimateColorInfo`
- `getCloudColorTropical(): ClimateColorInfo`
- `getCurrentStage(): WeatherPeriod.WeatherStage`
- `getCurrentStageID(): int`
- `getCurrentStrength(): float`
- `getDuration(): double`
- `getFrontCache(): ClimateManager.AirFront`
- `getFrontType(): int`
- `getPrecipitationFinal(): float`
- `getPrintStuff(): boolean`
- `getRainThreshold(): float`
- `getStageForWorldAge(double worldAgeHours): WeatherPeriod.WeatherStage`
- `getStageProgress(): float`
- `getTotalProgress(): float`
- `getTotalStrength(): float`
- `getWeatherNoise(): double`
- `getWeatherStages(): ArrayList<WeatherPeriod.WeatherStage>`
- `getWindAngleDegrees(): float`
- `hasBlizzard(): boolean`
- `hasHeavyRain(): boolean`
- `hasStorm(): boolean`
- `hasTropical(): boolean`
- `initSimulationDebug(ClimateManager.AirFront front, double hoursSinceStart): void`
- `initSimulationDebug(ClimateManager.AirFront front, double hoursSinceStart, int doThisStageOnly, float singleStageDuration): void`
- `isBlizzard(): boolean`
- `isRunning(): boolean`
- `isThunderStorm(): boolean`
- `isTropicalStorm(): boolean`
- `load(DataInputStream input, int worldVersion): void`
- `readNetWeatherData(ByteBufferReader input): void`
- `save(DataOutputStream output): void`
- `setCloudColor(ClimateColorInfo cloudcol): void`
- `setDummy(boolean b): void`
- `setKateBobStormCoords(int x, int y): void`
- `setKateBobStormProgress(float progress): void`
- `setPrintStuff(boolean b): void`
- `startCreateModdedPeriod(boolean warmFront, float strength, float angle): boolean`
- `stopWeatherPeriod(): void`
- `update(double hoursSinceStart): void`
- `writeNetWeatherData(ByteBufferWriter output): void`

Static functions, called as `WeatherPeriod.name(...)`:

- `getMaxTemperatureInfluence(): float`

Constructors: `WeatherPeriod.new(ClimateManager climmgr, ThunderStorm ts)`.

Static fields (a copy of the value taken when the class is exposed): `FRONT_STRENGTH_THRESHOLD: float`, `STAGE_BLIZZARD: int`, `STAGE_CLEARING: int`, `STAGE_DRIZZLE: int`, `STAGE_HEAVY_PRECIP: int`, `STAGE_INTERMEZZO: int`, `STAGE_KATEBOB_STORM: int`, `STAGE_MAX: int`, `STAGE_MODDED: int`, `STAGE_MODERATE: int`, `STAGE_SHOWERS: int`, `STAGE_START: int`, `STAGE_STORM: int`, `STAGE_TROPICAL_STORM: int`.

### WeatherPeriod.StrLerpVal

`zombie.iso.weather.WeatherPeriod.StrLerpVal`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getValue(): int`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `WeatherPeriod.StrLerpVal.name(...)`:

- `fromValue(int id): WeatherPeriod.StrLerpVal`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): WeatherPeriod.StrLerpVal`
- `values(): WeatherPeriod.StrLerpVal[]`

Enum values (read as `WeatherPeriod.StrLerpVal.VALUE`): `Entry`, `NextTarget`, `None`, `Target`.

### WeatherPeriod.WeatherStage

`zombie.iso.weather.WeatherPeriod.WeatherStage`, class.

Methods, called as `obj:name(...)`:

- `getHasStartedCloud(): boolean`
- `getLinearT(): float`
- `getModID(): String`
- `getParabolicT(): float`
- `getStageCurrentStrength(): float`
- `getStageDuration(): double`
- `getStageEnd(): double`
- `getStageID(): int`
- `getStageStart(): double`
- `lerpEntryTo(int mid, int end): void`
- `load(DataInputStream input, int worldVersion): void`
- `save(DataOutputStream output): void`
- `setHasStartedCloud(boolean b): void`
- `setStageID(int id): void`
- `setTargetStrength(float t): void`

Constructors: `WeatherPeriod.WeatherStage.new()`, `WeatherPeriod.WeatherStage.new(int id)`.

### WorldFlares

`zombie.iso.weather.WorldFlares`, class.

Static functions, called as `WorldFlares.name(...)`:

- `Clear(): void`
- `applyFlaresForPlayer(RenderSettings.PlayerRenderSettings renderSettings, int plrIndex, IsoPlayer player): void`
- `debugRender(): void`
- `getDebugDraw(): boolean`
- `getFlare(int index): WorldFlares.Flare`
- `getFlareCount(): int`
- `getFlareID(int id): WorldFlares.Flare`
- `launchFlare(float lifetime, int x, int y, int range, float windSpeed, float r, float g, float b, float ri, float gi, float bi): void`
- `setDebugDraw(boolean b): void`
- `update(): void`

Constructors: `WorldFlares.new()`.

Static fields (a copy of the value taken when the class is exposed): `ENABLED: boolean`, `debugDraw: boolean`, `nextId: int`.

### WorldFlares.Flare

`zombie.iso.weather.WorldFlares.Flare`, class.

Methods, called as `obj:name(...)`:

- `getColor(): ClimateColorInfo`
- `getColorPlayer(int index): ClimateColorInfo`
- `getDistModPlayer(int index): float`
- `getId(): int`
- `getIntensity(): float`
- `getIntensityPlayer(int index): float`
- `getLerpPlayer(int index): float`
- `getLifeTime(): float`
- `getMaxLifeTime(): float`
- `getOutColorPlayer(int index): ClimateColorInfo`
- `getPercent(): float`
- `getRange(): int`
- `getWindSpeed(): float`
- `getX(): float`
- `getY(): float`
- `isHasLaunched(): boolean`

Constructors: `WorldFlares.Flare.new()`.

### WorldGenParams

`zombie.iso.worldgen.WorldGenParams`, class.

Methods, called as `obj:name(...)`:

- `getMaxXCell(): int`
- `getMaxYCell(): int`
- `getMinXCell(): int`
- `getMinYCell(): int`
- `getRandom(int wx, int wy): Random`
- `getRandom(int wx, int wy, long offset): Random`
- `getSeed(): long`
- `getSeedString(): String`
- `load(): WorldGenParams.Result`
- `save(): void`
- `setMaxXCell(int maxXCell): void`
- `setMaxYCell(int maxYCell): void`
- `setMinXCell(int minXCell): void`
- `setMinYCell(int minYCell): void`
- `setSeedString(String seedString): void`

Static fields (a copy of the value taken when the class is exposed): `GENERATION_SIZE: int`, `GENERATION_SQUARES: int`, `INSTANCE: WorldGenParams`.

### WorldGenUtils

`zombie.iso.worldgen.WorldGenUtils`, class.

Methods, called as `obj:name(...)`:

- `canPlace(List<String> placement, String floorName): boolean`
- `displayTable(String tableName): String`
- `displayTable(KahluaTable table): String`
- `doesFloorExit(IsoCell cell, int tileX, int tileY, int z): IsoObject`
- `doesFloorExit(IsoChunk chunk, int tileX, int tileY, int z): IsoObject`
- `generateSeed(): String`
- `getCornerOfGeneration(int b): int`
- `getFile(int i): String`
- `getFiles(String basePath): void`
- `getFilesNum(): int`
- `getTimerKept(String clazzStr, String fieldName): void`
- `methodName(StackTraceElement trace): String`
- `methodsCall(String header, int depth, String... args): String`
- `resetTimers(String clazzStr): void`
- `showTimers(String clazzStr): void`
- `showTimersTotal(String clazzStr): void`

Static fields (a copy of the value taken when the class is exposed): `INSTANCE: WorldGenUtils`.

### WorldMarkers

`zombie.iso.WorldMarkers`, class.

Methods, called as `obj:name(...)`:

- `addDirectionArrow(IsoPlayer player, int x, int y, int z, String texname, float r, float g, float b, float a): WorldMarkers.DirectionArrow`
- `addGridSquareMarker(String texid, String overlay, IsoGridSquare gs, float r, float g, float b, boolean doAlpha, float size): WorldMarkers.GridSquareMarker`
- `addGridSquareMarker(String texid, String overlay, IsoGridSquare gs, float r, float g, float b, boolean doAlpha, float size, float fadeSpeed, float fadeMin, float fadeMax): WorldMarkers.GridSquareMarker`
- `addGridSquareMarker(IsoGridSquare gs, float r, float g, float b, boolean doAlpha, float size): WorldMarkers.GridSquareMarker`
- `addPlayerHomingPoint(IsoPlayer player, int x, int y): WorldMarkers.PlayerHomingPoint`
- `addPlayerHomingPoint(IsoPlayer player, int x, int y, float r, float g, float b, float a): WorldMarkers.PlayerHomingPoint`
- `addPlayerHomingPoint(IsoPlayer player, int x, int y, String texname, float r, float g, float b, float a, boolean homeOnTarget, int homeOnDist): WorldMarkers.PlayerHomingPoint`
- `debugRender(): void`
- `getDirectionArrow(int id): WorldMarkers.DirectionArrow`
- `getGridSquareMarker(int id): WorldMarkers.GridSquareMarker`
- `getHomingPoint(int id): WorldMarkers.PlayerHomingPoint`
- `init(): void`
- `removeAllDirectionArrows(IsoPlayer player): void`
- `removeAllHomingPoints(IsoPlayer player): void`
- `removeDirectionArrow(int id): boolean`
- `removeDirectionArrow(WorldMarkers.DirectionArrow arrow): boolean`
- `removeGridSquareMarker(int id): boolean`
- `removeGridSquareMarker(WorldMarkers.GridSquareMarker marker): boolean`
- `removeHomingPoint(int id): boolean`
- `removeHomingPoint(WorldMarkers.PlayerHomingPoint point): boolean`
- `removePlayerDirectionArrow(IsoPlayer player, int id): boolean`
- `removePlayerDirectionArrow(IsoPlayer player, WorldMarkers.DirectionArrow arrow): boolean`
- `removePlayerHomingPoint(IsoPlayer player, int id): boolean`
- `removePlayerHomingPoint(IsoPlayer player, WorldMarkers.PlayerHomingPoint point): boolean`
- `render(): void`
- `renderDirectionArrow(boolean worldDraw): void`
- `renderGridSquareMarkers(int z): void`
- `renderGridSquareMarkers(IsoCell.PerPlayerRender perPlayerRender, int zLayer, int playerIndex): void`
- `renderHomingPoint(): void`
- `reset(): void`
- `update(): void`

Static functions, called as `WorldMarkers.name(...)`:

- `intersectLineSegments(WorldMarkers.Line l1, WorldMarkers.Line l2, WorldMarkers.Point intersection): boolean`

Static fields (a copy of the value taken when the class is exposed): `instance: WorldMarkers`.

### WorldMarkers.DirectionArrow

`zombie.iso.WorldMarkers.DirectionArrow`, class.

Methods, called as `obj:name(...)`:

- `getA(): float`
- `getB(): float`
- `getG(): float`
- `getID(): int`
- `getR(): float`
- `getRenderHeight(): float`
- `getRenderWidth(): float`
- `getX(): int`
- `getY(): int`
- `getZ(): int`
- `isActive(): boolean`
- `isRemoved(): boolean`
- `remove(): void`
- `setA(float a): void`
- `setActive(boolean active): void`
- `setB(float b): void`
- `setG(float g): void`
- `setR(float r): void`
- `setRGBA(float r, float g, float b, float a): void`
- `setRenderHeight(float renderHeight): void`
- `setRenderWidth(float renderWidth): void`
- `setTexDown(String texname): void`
- `setTexStairsDown(String texname): void`
- `setTexStairsUp(String texname): void`
- `setTexture(String texname): void`
- `setX(int x): void`
- `setY(int y): void`
- `setZ(int z): void`

Constructors: `WorldMarkers.DirectionArrow.new(WorldMarkers, int)`.

Static fields (a copy of the value taken when the class is exposed): `doDebug: boolean`.

### WorldMarkers.GridSquareMarker

`zombie.iso.WorldMarkers.GridSquareMarker`, class.

Methods, called as `obj:name(...)`:

- `getA(): float`
- `getAlpha(): float`
- `getAlphaMax(): float`
- `getAlphaMin(): float`
- `getB(): float`
- `getFadeSpeed(): float`
- `getG(): float`
- `getID(): int`
- `getOriginalX(): float`
- `getOriginalY(): float`
- `getOriginalZ(): float`
- `getOverlayTextureName(): String`
- `getR(): float`
- `getSize(): float`
- `getTextureName(): String`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `init(String texid, String overlay, int x, int y, int z, float size): void`
- `isActive(): boolean`
- `isDoAlpha(): boolean`
- `isDoBlink(): boolean`
- `isRemoved(): boolean`
- `isScaleCircleTexture(): boolean`
- `remove(): void`
- `setA(float a): void`
- `setActive(boolean active): void`
- `setAlpha(float alpha): void`
- `setAlphaMax(float alphaMax): void`
- `setAlphaMin(float alphaMin): void`
- `setB(float b): void`
- `setDoAlpha(boolean doAlpha): void`
- `setDoBlink(boolean doBlink): void`
- `setFadeSpeed(float fadeSpeed): void`
- `setG(float g): void`
- `setPos(int x, int y, int z): void`
- `setPosAndSize(int x, int y, int z, float size): void`
- `setR(float r): void`
- `setScaleCircleTexture(boolean bScale): void`
- `setSize(float size): void`

Constructors: `WorldMarkers.GridSquareMarker.new()`.

### WorldMarkers.PlayerHomingPoint

`zombie.iso.WorldMarkers.PlayerHomingPoint`, class.

Methods, called as `obj:name(...)`:

- `getA(): float`
- `getAngleLerpVal(): float`
- `getB(): float`
- `getG(): float`
- `getHomeOnOffsetX(): float`
- `getHomeOnOffsetY(): float`
- `getHomeOnTargetDist(): int`
- `getID(): int`
- `getMovementLerpVal(): float`
- `getR(): float`
- `getRenderHeight(): float`
- `getRenderOffsetX(): float`
- `getRenderOffsetY(): float`
- `getRenderWidth(): float`
- `getStickToCharDist(): float`
- `getTargetAngle(): float`
- `getX(): int`
- `getY(): int`
- `isActive(): boolean`
- `isCustomTargetAngle(): boolean`
- `isHomeOnTargetInView(): boolean`
- `isRemoved(): boolean`
- `remove(): void`
- `setA(float a): void`
- `setActive(boolean active): void`
- `setAngleLerpVal(float angleLerpVal): void`
- `setB(float b): void`
- `setCustomTargetAngle(boolean customTargetAngle): void`
- `setG(float g): void`
- `setHighCounter(): void`
- `setHomeOnOffsetX(float homeOnOffsetX): void`
- `setHomeOnOffsetY(float homeOnOffsetY): void`
- `setHomeOnTargetDist(int homeOnTargetDist): void`
- `setHomeOnTargetInView(boolean homeOnTargetInView): void`
- `setMovementLerpVal(float movementLerpVal): void`
- `setR(float r): void`
- `setRenderHeight(float renderHeight): void`
- `setRenderOffsetX(float renderOffsetX): void`
- `setRenderOffsetY(float renderOffsetY): void`
- `setRenderWidth(float renderWidth): void`
- `setStickToCharDist(float stickToCharDist): void`
- `setTableSurface(): void`
- `setTargetAngle(float targetAngle): void`
- `setTexture(String texname): void`
- `setX(int x): void`
- `setXOffsetScaled(float offset): void`
- `setY(int y): void`
- `setYOffsetScaled(float offset): void`

Constructors: `WorldMarkers.PlayerHomingPoint.new(int plrIndex)`.

### Trigger

`zombie.iso.zones.Trigger`, class.

Methods, called as `obj:name(...)`:

- `getModData(): KahluaTable`

Constructors: `Trigger.new(BuildingDef def, int triggerRange, int zombieExclusionRange, String type)`.

### VehicleZone

`zombie.iso.zones.VehicleZone`, class. Extends [Zone](#zone). Also has the methods of [Zone](#zone) (54), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isFaceDirection(): boolean`

Constructors: `VehicleZone.new(String name, String type, int x, int y, int z, int w, int h, KahluaTable properties)`.

Static fields (a copy of the value taken when the class is exposed): `VZF_FaceDirection: short`, `clipper: Clipper`.

### Zone

`zombie.iso.zones.Zone`, class.

Methods, called as `obj:name(...)`:

- `Dispose(): void`
- `addSquare(IsoGridSquare sq): void`
- `contains(int x, int y, int z): boolean`
- `difference(int x, int y, int z, int w, int h, ArrayList<Zone> result): boolean`
- `getClippedSegmentOfPolyline(int clipX1, int clipY1, int clipX2, int clipY2, double[] t1t2): int`
- `getHeight(): int`
- `getHoursSinceLastSeen(): float`
- `getLastActionTimestamp(): int`
- `getName(): String`
- `getOriginalName(): String`
- `getPointsToLua(): List<Integer>`
- `getPolygonTriangles(): float[]`
- `getPolylineLength(): float`
- `getPolylineOutlineTriangles(): float[]`
- `getRandomFreeSquareInZone(): IsoGridSquare`
- `getRandomSquareInZone(): IsoGridSquare`
- `getRandomUnseenSquareInZone(): IsoGridSquare`
- `getSquares(): ArrayList<IsoGridSquare>`
- `getTotalArea(): float`
- `getType(): String`
- `getWidth(): int`
- `getX(): int`
- `getY(): int`
- `getZ(): int`
- `getZombieDensity(): int`
- `hasWaterSquare(): boolean`
- `haveCons(): boolean`
- `intersects(int x, int y, int z, int w, int h): boolean`
- `isFullyStreamed(): boolean`
- `isPoint(): boolean`
- `isPolygon(): boolean`
- `isPolyline(): boolean`
- `isRectangle(): boolean`
- `load(ByteBuffer input, int worldVersion): Zone`
- `load(ByteBuffer input, int worldVersion, Map<Integer, String> stringMap, SharedStrings sharedStrings): Zone`
- `pickRandomLocation(IsoGameCharacter.Location location): IsoGameCharacter.Location`
- `removeSquare(IsoGridSquare sq): void`
- `save(ByteBuffer output): void`
- `save(ByteBuffer output, Map<String, Integer> stringMap): void`
- `sendToServer(): void`
- `setH(int h): void`
- `setHaveConstruction(boolean have): void`
- `setHourSeenToCurrent(): void`
- `setLastActionTimestamp(int lastActionTimestamp): void`
- `setName(String name): void`
- `setOriginalName(String originalName): void`
- `setPickedXForZoneStory(int pickedXForZoneStory): void`
- `setPickedYForZoneStory(int pickedYForZoneStory): void`
- `setType(String type): void`
- `setW(int w): void`
- `setX(int x): void`
- `setY(int y): void`
- `toString(): String`

Static functions, called as `Zone.name(...)`:

- `isPreferredZoneForSquare(String type): boolean`

Constructors: `Zone.new()`, `Zone.new(String name, String type, int x, int y, int z, int w, int h)`, `Zone.new(String name, String type, int x, int y, int z, int w, int h, ZoneGeometryType geometryType, TIntArrayList points, int polylineWidth)`.

Static fields (a copy of the value taken when the class is exposed): `clipper: Clipper`.

### MapGroups

`zombie.MapGroups`, class.

Methods, called as `obj:name(...)`:

- `checkMapConflicts(): boolean`
- `createGroups(): void`
- `createGroups(ActiveMods activeMods, boolean includeVanilla): void`
- `createGroups(ActiveMods activeMods, boolean includeVanilla, boolean includeChallenges): void`
- `getAllMapsInOrder(): ArrayList<String>`
- `getMapConflicts(String mapName): ArrayList<String>`
- `getMapDirectoriesInGroup(int groupIndex): ArrayList<String>`
- `getNumberOfGroups(): int`
- `setWorld(int groupIndex): void`

Static functions, called as `MapGroups.name(...)`:

- `addMissingVanillaDirectories(String mapName): String`

Constructors: `MapGroups.new()`.

### PathFindBehavior2

`zombie.pathfind.PathFindBehavior2`, class.

Methods, called as `obj:name(...)`:

- `Failed(Mover mover): void`
- `Succeeded(Path path, Mover mover): void`
- `allowTurnAnimation(): boolean`
- `cancel(): void`
- `getGoalSitOnFurnitureObject(): IsoObject`
- `getIsCancelled(): boolean`
- `getPathLength(): float`
- `getTargetChar(): IsoGameCharacter`
- `getTargetX(): float`
- `getTargetY(): float`
- `getTargetZ(): float`
- `hasStartedMoving(): boolean`
- `isGoalCharacter(): boolean`
- `isGoalLocation(): boolean`
- `isGoalNone(): boolean`
- `isGoalSitOnFurniture(): boolean`
- `isGoalSound(): boolean`
- `isGoalVehicleAdjacent(): boolean`
- `isGoalVehicleArea(): boolean`
- `isGoalVehicleSeat(): boolean`
- `isGoodChairAdjacentSquare(IsoGridSquare targetSquare, IsoGridSquare adjacentSquare): boolean`
- `isMovingUsingPathFind(): boolean`
- `isStrafing(): boolean`
- `isTargetLocation(float x, float y, float z): boolean`
- `isTurningToObstacle(): boolean`
- `moveToDir(IsoMovingObject target, float speedMul): void`
- `moveToPoint(float x, float y, float speedMul): void`
- `pathToCharacter(IsoGameCharacter target): void`
- `pathToGrabCorpse(IsoDeadBody targetBody): void`
- `pathToLocation(int x, int y, int z): void`
- `pathToLocationF(float x, float y, float z): void`
- `pathToNearest(TFloatArrayList locations): void`
- `pathToNearestTable(KahluaTable locationsTable): void`
- `pathToSitOnFurniture(IsoObject furniture, boolean bAnySpriteGridObject): void`
- `pathToSound(int x, int y, int z): void`
- `pathToVehicleAdjacent(BaseVehicle vehicle): void`
- `pathToVehicleArea(BaseVehicle vehicle, String areaId): void`
- `pathToVehicleSeat(BaseVehicle vehicle, int seat): void`
- `render(): void`
- `reset(): void`
- `setData(float targetX, float targetY, float targetZ): void`
- `shouldBeMoving(): boolean`
- `shouldGetUpFromCrawl(): boolean`
- `shouldIgnoreCollisionWithSquare(IsoGridSquare square): boolean`
- `update(): PathFindBehavior2.BehaviorResult`
- `update(float speedMul): PathFindBehavior2.BehaviorResult`

Static functions, called as `PathFindBehavior2.name(...)`:

- `closestPointOnPath(float x3, float y3, float z, IsoMovingObject mover, Path path, PathFindBehavior2.PointOnPath pop): void`

Constructors: `PathFindBehavior2.new(IsoGameCharacter chr)`.

### PathFindBehavior2.BehaviorResult

`zombie.pathfind.PathFindBehavior2.BehaviorResult`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `PathFindBehavior2.BehaviorResult.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): PathFindBehavior2.BehaviorResult`
- `values(): PathFindBehavior2.BehaviorResult[]`

Enum values (read as `PathFindBehavior2.BehaviorResult.VALUE`): `Failed`, `Succeeded`, `Working`.

### ZombiePopulationRenderer

`zombie.popman.ZombiePopulationRenderer`, class.

Methods, called as `obj:name(...)`:

- `getBoolean(String name): boolean`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `load(): void`
- `outlineRect(float x, float y, float w, float h, float r, float g, float b, float a): void`
- `render(UIElement ui, float zoom, float xPos, float yPos): void`
- `renderCellInfo(int cellX, int cellY, int effectivePopulation, int targetPopulation, float lastRepopTime): void`
- `renderCircle(float x, float y, float radius, float r, float g, float b, float a): void`
- `renderLine(float x1, float y1, float x2, float y2, float r, float g, float b, float a): void`
- `renderRect(float x, float y, float w, float h, float r, float g, float b, float a): void`
- `renderString(float x, float y, String str, double r, double g, double b, double a): void`
- `renderVehicle(int sqlid, float x, float y, float r, float g, float b): void`
- `renderZombie(float x, float y, float r, float g, float b): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setWallFollowerEnd(int x, int y): void`
- `setWallFollowerStart(int x, int y): void`
- `uiToWorldX(float x): float`
- `uiToWorldY(float y): float`
- `wallFollowerMouseMove(int x, int y): void`
- `worldToScreenX(float x): float`
- `worldToScreenY(float y): float`

Constructors: `ZombiePopulationRenderer.new()`.

### ZombiePopulationRenderer.BooleanDebugOption

`zombie.popman.ZombiePopulationRenderer.BooleanDebugOption`, class. Extends [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption). Also has the methods of [BooleanConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#booleanconfigoption) (13), [ConfigOption](/pz/build-42/modding/reference/lua-classes-game-and-core-1#configoption) (4), listed on their own entries.

Constructors: `ZombiePopulationRenderer.BooleanDebugOption.new(ZombiePopulationRenderer, String, boolean)`.

### RandomizedBuildingBase

`zombie.randomizedWorld.randomizedBuilding.RandomizedBuildingBase`, class. Extends [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase). Also has the methods of [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `addBarricade(IsoGridSquare sq, int numPlanks): void`
- `addRandomRangedWeapon(ItemContainer container, boolean addBulletsInGun, boolean addBoxInContainer, boolean attachPart): HandWeapon`
- `addWorldItem(String item, IsoGridSquare sq, float xoffset, float yoffset, float zoffset): InventoryItem`
- `addWorldItem(String item, IsoGridSquare sq, float xoffset, float yoffset, float zoffset, boolean randomRotation): InventoryItem`
- `addWorldItem(String item, IsoGridSquare sq, float xoffset, float yoffset, float zoffset, int worldZ): InventoryItem`
- `addWorldItem(String item, IsoGridSquare sq, IsoObject obj): InventoryItem`
- `addWorldItem(String item, IsoGridSquare sq, IsoObject obj, boolean randomRotation): InventoryItem`
- `addZombies(BuildingDef def, int totalZombies, String outfit, Integer femaleChance, RoomDef room): ArrayList<IsoZombie>`
- `addZombiesOnSquare(int totalZombies, String outfit, Integer femaleChance, IsoGridSquare square): ArrayList<IsoZombie>`
- `getChance(): int`
- `getChance(IsoGridSquare sq): int`
- `getDoor(IsoGridSquare sq): IsoDoor`
- `getMinimumDays(): int`
- `getMinimumRooms(): int`
- `getWindow(IsoGridSquare sq): IsoWindow`
- `init(): void`
- `isAlwaysDo(): boolean`
- `isTableFor3DItems(IsoObject obj, IsoGridSquare sq): boolean`
- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `setAlwaysDo(boolean alwaysDo): void`
- `setChance(int chance): void`
- `setMinimumDays(int minimumDays): void`
- `setMinimumRooms(int minimumRooms): void`
- `spawnItemsInContainers(BuildingDef def, String distribName, int chance): void`
- `trySpawnStoryItem(String itemType, IsoGridSquare square, IsoObject obj): InventoryItem`

Static functions, called as `RandomizedBuildingBase.name(...)`:

- `ChunkLoaded(IsoBuilding building): void`
- `addClip(HandWeapon gun): void`
- `doAmmoCans(PropertyContainer props, boolean facingE, boolean facingW, boolean facingN, IsoGridSquare sq, WeightedList<ItemKey> ammoCans): void`
- `doBodyArmor(boolean facingE, IsoGridSquare sq, ItemKey vestType, int spawnChance): void`
- `doCornerAmmoCans(boolean facingE, boolean facingW, boolean facingN, IsoGridSquare sq, WeightedList<ItemKey> ammoCases, WeightedList<ItemKey> ammoCans): void`
- `doCounterAmmoDisplay(boolean facingE, boolean facingW, boolean facingN, IsoGridSquare sq, WeightedList<ItemKey> ammoBoxes): void`
- `doGunShelfHandguns(boolean facingE, IsoGridSquare sq, WeightedList<ItemKey> pistolTypes, WeightedList<ItemKey> rifleTypes, int spawnChancePistol, int spawnChanceRifle): void`
- `doGunShelfRifles(boolean facingE, IsoGridSquare sq, WeightedList<ItemKey> rifleTypes, int spawnChance): void`
- `doHandgunCounterDisplay(boolean facingE, boolean facingW, boolean facingN, IsoGridSquare sq, WeightedList<ItemKey> pistolTypes): void`
- `doRifleCounterDisplay(boolean facingE, boolean facingW, boolean facingN, IsoGridSquare sq, WeightedList<ItemKey> rifleTypes): void`
- `getBuildingObjects(BuildingDef def): ArrayList<IsoObject>`
- `getBuildingObjectsSimple(BuildingDef def): ArrayList<IsoObject>`
- `getBuildingSquares(BuildingDef def): ArrayList<IsoGridSquare>`
- `getRectSquares(RoomDef.RoomRect rect, RoomDef room): ArrayList<IsoGridSquare>`
- `initAllRBMapChance(): void`
- `setWorldRotation(InventoryItem item, float xRotation, float yRotation, float zRotation): void`
- `spawnBodyArmor(InventoryItem vest, IsoGridSquare sq, float xOffset, float yOffset, float zOffset, int spawnChance): void`
- `spawnPistol(ItemKey gunType): HandWeapon`
- `spawnRifle(ItemKey gunType): HandWeapon`

Constructors: `RandomizedBuildingBase.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBBar

`zombie.randomizedWorld.randomizedBuilding.RBBar`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBBar.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBBarn

`zombie.randomizedWorld.randomizedBuilding.RBBarn`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBBarn.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBBasic

`zombie.randomizedWorld.randomizedBuilding.RBBasic`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `doProfessionBuilding(BuildingDef def, String professionChoosed, ItemPickerJava.ItemPickerRoom prof): void`
- `doProfessionStory(BuildingDef def, String professionChoosed): void`
- `doRandomDeadSurvivorStory(BuildingDef buildingDef, RandomizedDeadSurvivorBase dsDef): void`
- `forceVehicleDistribution(BaseVehicle vehicle, String distribution): void`
- `getSurvivorProfession(): ArrayList<String>`
- `getSurvivorStories(): ArrayList<RandomizedDeadSurvivorBase>`
- `randomizeBuilding(BuildingDef def): void`

Static functions, called as `RBBasic.name(...)`:

- `doCafeStuff(IsoGridSquare sq): void`
- `doGeneralRoom(IsoGridSquare sq, ArrayList<String> clutter): void`
- `doGigamartStuff(IsoGridSquare sq): void`
- `doGroceryStuff(IsoGridSquare sq): void`
- `doJudgeStuff(IsoGridSquare sq): void`
- `doNolansOfficeStuff(IsoGridSquare sq): void`
- `doOfficeStuff(IsoGridSquare sq): void`
- `doTwiggyStuff(IsoGridSquare sq): void`
- `doWoodcraftStuff(IsoGridSquare sq): void`
- `getUniqueRDSSpawned(): ArrayList<String>`

Constructors: `RBBasic.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBBurnt

`zombie.randomizedWorld.randomizedBuilding.RBBurnt`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBBurnt.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBBurntCorpse

`zombie.randomizedWorld.randomizedBuilding.RBBurntCorpse`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBBurntCorpse.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBBurntFireman

`zombie.randomizedWorld.randomizedBuilding.RBBurntFireman`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBBurntFireman.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBCafe

`zombie.randomizedWorld.randomizedBuilding.RBCafe`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBCafe.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBClinic

`zombie.randomizedWorld.randomizedBuilding.RBClinic`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBClinic.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBDorm

`zombie.randomizedWorld.randomizedBuilding.RBDorm`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBDorm.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBGunstoreSiege

`zombie.randomizedWorld.randomizedBuilding.RBGunstoreSiege`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBGunstoreSiege.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBHairSalon

`zombie.randomizedWorld.randomizedBuilding.RBHairSalon`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBHairSalon.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBHeatBreakAfternoon

`zombie.randomizedWorld.randomizedBuilding.RBHeatBreakAfternoon`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBHeatBreakAfternoon.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBJackieJaye

`zombie.randomizedWorld.randomizedBuilding.RBJackieJaye`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBJackieJaye.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBJoanHartford

`zombie.randomizedWorld.randomizedBuilding.RBJoanHartford`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBJoanHartford.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBJudge

`zombie.randomizedWorld.randomizedBuilding.RBJudge`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBJudge.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBKateAndBaldspot

`zombie.randomizedWorld.randomizedBuilding.RBKateAndBaldspot`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBKateAndBaldspot.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBLooted

`zombie.randomizedWorld.randomizedBuilding.RBLooted`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBLooted.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBMayorWestPoint

`zombie.randomizedWorld.randomizedBuilding.RBMayorWestPoint`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBMayorWestPoint.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBNolans

`zombie.randomizedWorld.randomizedBuilding.RBNolans`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBNolans.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBOffice

`zombie.randomizedWorld.randomizedBuilding.RBOffice`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBOffice.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBOther

`zombie.randomizedWorld.randomizedBuilding.RBOther`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBOther.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBPileOCrepe

`zombie.randomizedWorld.randomizedBuilding.RBPileOCrepe`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBPileOCrepe.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBPizzaWhirled

`zombie.randomizedWorld.randomizedBuilding.RBPizzaWhirled`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBPizzaWhirled.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBPoliceSiege

`zombie.randomizedWorld.randomizedBuilding.RBPoliceSiege`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBPoliceSiege.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBReverend

`zombie.randomizedWorld.randomizedBuilding.RBReverend`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBReverend.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBSafehouse

`zombie.randomizedWorld.randomizedBuilding.RBSafehouse`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBSafehouse.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBSchool

`zombie.randomizedWorld.randomizedBuilding.RBSchool`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBSchool.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBShopLooted

`zombie.randomizedWorld.randomizedBuilding.RBShopLooted`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBShopLooted.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBSpiffo

`zombie.randomizedWorld.randomizedBuilding.RBSpiffo`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBSpiffo.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBStripclub

`zombie.randomizedWorld.randomizedBuilding.RBStripclub`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`

Constructors: `RBStripclub.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBTrashed

`zombie.randomizedWorld.randomizedBuilding.RBTrashed`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getFloorSquare(ArrayList<IsoGridSquare> squares, IsoGridSquare square, RoomDef room, IsoBuilding building): IsoGridSquare`
- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `trashHouse(BuildingDef def): void`

Constructors: `RBTrashed.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBTwiggy

`zombie.randomizedWorld.randomizedBuilding.RBTwiggy`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBTwiggy.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RBWoodcraft

`zombie.randomizedWorld.randomizedBuilding.RBWoodcraft`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (43), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeBuilding(BuildingDef def): void`
- `roomValid(IsoGridSquare sq): boolean`

Constructors: `RBWoodcraft.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RandomizedDeadSurvivorBase

`zombie.randomizedWorld.randomizedDeadSurvivor.RandomizedDeadSurvivorBase`, class. Extends [RandomizedBuildingBase](#randomizedbuildingbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RandomizedDeadSurvivorBase.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSBanditRaid

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSBanditRaid`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSBanditRaid.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSBandPractice

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSBandPractice`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSBandPractice.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSBathroomZed

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSBathroomZed`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSBathroomZed.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSBedroomZed

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSBedroomZed`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSBedroomZed.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSBleach

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSBleach`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSBleach.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSCorpsePsycho

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSCorpsePsycho`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSCorpsePsycho.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSDeadDrunk

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSDeadDrunk`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSDeadDrunk.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSDevouredByRats

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSDevouredByRats`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSDevouredByRats.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSFootballNight

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSFootballNight`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSFootballNight.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSGrouchos

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSGrouchos`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSGrouchos.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSGunmanInBathroom

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSGunmanInBathroom`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSGunmanInBathroom.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSGunslinger

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSGunslinger`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSGunslinger.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSHenDo

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSHenDo`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSHenDo.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSHockeyPsycho

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSHockeyPsycho`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase) (1), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSHockeyPsycho.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.

### RDSHouseParty

`zombie.randomizedWorld.randomizedDeadSurvivor.RDSHouseParty`, class. Extends [RandomizedDeadSurvivorBase](#randomizeddeadsurvivorbase). Also has the methods of [RandomizedBuildingBase](#randomizedbuildingbase) (44), [RandomizedWorldBase](/pz/build-42/modding/reference/lua-classes-world-4#randomizedworldbase) (216), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isValid(BuildingDef def, boolean force): boolean`
- `randomizeDeadSurvivor(BuildingDef def): void`

Constructors: `RDSHouseParty.new()`.

Static fields (a copy of the value taken when the class is exposed): `maximumRoomCount: int`.
