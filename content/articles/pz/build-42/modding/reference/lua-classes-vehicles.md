---
slug: lua-classes-vehicles
title: 'Lua Classes: Vehicles (Build 42.21)'
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
excerpt: 'The exposed vehicles classes of Build 42.21: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Vehicles

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Cars and their parts, from the vehicle itself to the part and the scripts that describe it.

This page holds 10 classes and 915 methods, from the package `zombie.vehicles`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### BaseVehicle

`zombie.vehicles.BaseVehicle`, class. Extends [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject) (176), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (384), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Damage(float amount): void`
- `HitByVehicle(BaseVehicle vehicle, float amount): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `Thump(IsoMovingObject thumper, int thumpEventCount): void`
- `WeaponHit(IsoGameCharacter chr, HandWeapon weapon): void`
- `addAnimalFromHandsInTrailer(IsoAnimal animal, IsoPlayer player): void`
- `addAnimalFromHandsInTrailer(IsoDeadBody body, IsoPlayer player): void`
- `addAnimalInTrailer(IsoAnimal animal): void`
- `addAnimalInTrailer(IsoDeadBody body): void`
- `addBuildingKeyToGloveBox(IsoGridSquare square): void`
- `addDamageFrontHitAChr(int dmg): void`
- `addDamageRearHitAChr(int dmg): void`
- `addEngineSpeed(double speed): void`
- `addImpulse(Vector3f impulse, Vector3f relPos): void`
- `addKeyToGloveBox(): void`
- `addKeyToSquare(IsoGridSquare sq): boolean`
- `addKeyToSquare(IsoGridSquare sq, boolean crashed): boolean`
- `addKeyToSquare2(IsoGridSquare sq, int x2): boolean`
- `addKeyToSquare2(IsoGridSquare sq, int x2, boolean crashed): boolean`
- `addKeyToWorld(): void`
- `addKeyToWorld(boolean crashed): void`
- `addPointConstraint(IsoPlayer player, BaseVehicle vehicleB, String attachmentA, String attachmentB): void`
- `addPointConstraint(IsoPlayer player, BaseVehicle vehicleB, String attachmentA, String attachmentB, Boolean remote): void`
- `addRandomDamageFromCrash(IsoGameCharacter chr, float damage): void`
- `addToWorld(): void`
- `addToWorld(boolean crashed): void`
- `adoptParts(VehicleParts partsNew): void`
- `applyAccumulatedImpulsesFromHitObjectsToPhysics(): void`
- `applyAllImpulsesFromProneCharacters(): void`
- `applyImpulseFromHitCorpse(IsoDeadBody chr): void`
- `applyImpulseFromHitObject(IsoObject obj, float mul): void`
- `applyImpulseFromHitPedestrian(IsoGameCharacter chr): void`
- `applyImpulseFromHitPlant(IsoObject obj, float mul): void`
- `applyImpulseGeneric(float fromX, float fromY, float fromZ, float impulseDirX, float impulseDirY, float impulseDirZ, float impulseStrength): void`
- `areAllDoorsLocked(): boolean`
- `areaPositionWorld(VehicleScript.Area area): Vector2`
- `areaPositionWorld(VehicleScript.Area area, Vector2 out): Vector2`
- `areaPositionWorld4PlayerInteract(VehicleScript.Area area): Vector2`
- `areaPositionWorld4PlayerInteract(VehicleScript.Area area, Vector2 out): Vector2`
- `attachmentExist(String attachmentName): boolean`
- `authorizationChanged(IsoGameCharacter character): void`
- `authorizationClientCollide(IsoPlayer driver): void`
- `authorizationServerCollide(short playerId, boolean isCollide): void`
- `authorizationServerOnSeat(IsoPlayer player, boolean enter): void`
- `beginAttachingTrailer(): void`
- `blocked(int x, int y, int z): boolean`
- `breakConstraint(boolean forgetID, boolean remote): void`
- `breakConstraintOnServer(): boolean`
- `breakingObjects(): void`
- `calculateDamageWithCharacter(IsoGameCharacter chr): int`
- `canAccessContainer(int partIndex, IsoGameCharacter chr): boolean`
- `canAddAnimalInTrailer(IsoAnimal animal): boolean`
- `canAddAnimalInTrailer(IsoDeadBody animal): boolean`
- `canAttachTrailer(BaseVehicle vehicleB, String attachmentA, String attachmentB): boolean`
- `canAttachTrailer(BaseVehicle vehicleB, String attachmentA, String attachmentB, boolean reconnect): boolean`
- `canInstallPart(IsoGameCharacter chr, VehiclePart part): boolean`
- `canLightSmoke(IsoGameCharacter chr): boolean`
- `canLockDoor(VehiclePart part, IsoGameCharacter chr): boolean`
- `canOpenDoor(VehiclePart part, IsoGameCharacter chr): boolean`
- `canSwitchSeat(int seatFrom, int seatTo): boolean`
- `canUninstallPart(IsoGameCharacter chr, VehiclePart part): boolean`
- `canUnlockDoor(VehiclePart part, IsoGameCharacter chr): boolean`
- `changeTransmission(TransmissionNumber newTransmission): void`
- `cheatHotwire(boolean hotwired, boolean broken): void`
- `checkForSpecialMatchOne(String one, String two, String three): boolean`
- `checkForSpecialMatchTwo(String one, String two, String three): boolean`
- `checkIfGoodVehicleForKey(): boolean`
- `checkNetworkCollision(IsoGameCharacter target): BaseVehicle.HitVars`
- `checkPhysicsValidWithServer(): void`
- `checkSquareForVehicleKeySpot(IsoGridSquare square): boolean`
- `checkSquareForVehicleKeySpot(IsoGridSquare square, boolean crashed): boolean`
- `checkSquareForVehicleKeySpotContainer(IsoGridSquare square): boolean`
- `checkSquareForVehicleKeySpotZombie(IsoGridSquare square): boolean`
- `checkSurroundingChunks(): void`
- `checkVehicleSoundsExists(): void`
- `checkZombieKeyForVehicle(IsoZombie zombie): boolean`
- `checkZombieKeyForVehicle(IsoZombie zombie, String vehicleType): boolean`
- `chooseAlarmSound(): void`
- `chooseBestAttackPosition(IsoGameCharacter target, IsoGameCharacter attacker, Vector3f worldPos): Vector3f`
- `circleIntersects(float x, float y, float z, float radius): boolean`
- `clearPassenger(int seat): boolean`
- `constraintChanged(): void`
- `couldCrawlerAttackPassenger(IsoGameCharacter chr): boolean`
- `crash(float delta, boolean front): void`
- `createImpulse(Vector3f vec): void`
- `createPhysics(): void`
- `createPhysics(boolean spawnSwap): void`
- `createVehicleKey(): InventoryItem`
- `damageFromHitChr(int dmgFront, int dmgBack): void`
- `damageObjects(float damage): void`
- `damagePlayers(float damage): void`
- `distanceToManhatten(float x, float y): float`
- `doBloodOverlay(): void`
- `doDamageOverlay(): void`
- `drainBatteryUpdateHack(): void`
- `drawDirectionLine(Vector2 dir, float length, float r, float g, float b): void`
- `engineDoIdle(): void`
- `engineDoRetryingStarting(): void`
- `engineDoRunning(): void`
- `engineDoShuttingDown(): void`
- `engineDoShuttingDown(String sound): void`
- `engineDoShuttingDown(VehicleEngineStateChangeReason reason): void`
- `engineDoStalling(): void`
- `engineDoStarting(): void`
- `engineDoStartingFailed(): void`
- `engineDoStartingFailed(String sound): void`
- `engineDoStartingFailed(VehicleEngineStateChangeReason reason): void`
- `engineDoStartingFailedNoPower(): void`
- `engineDoStartingSuccess(): void`
- `enter(int seat, IsoGameCharacter chr): boolean`
- `enter(int seat, IsoGameCharacter chr, Vector3f offset): boolean`
- `enterRSync(int seat, IsoGameCharacter chr, BaseVehicle v): boolean`
- `exit(IsoGameCharacter chr): boolean`
- `exitRSync(IsoGameCharacter chr): boolean`
- `fixLightbarModelLighting(IsoLightSource ls, Vector3f lightPos): void`
- `flipUpright(): void`
- `forceVehicleDistribution(String distribution): void`
- `frameStep(): void` from `ECSEntity`
- `getAllSeatParts(): ArrayList<VehiclePart>`
- `getAllSeatParts(ArrayList<VehiclePart> results): ArrayList<VehiclePart>`
- `getAngleX(): float`
- `getAngleY(): float`
- `getAngleZ(): float`
- `getAnimalById(int animalId): IsoAnimal`
- `getAnimalTrailerSize(): float`
- `getAnimals(): ArrayList<IsoAnimal>`
- `getAnimationPlayer(): AnimationPlayer`
- `getAreaCenter(String areaId): Vector2`
- `getAreaCenter(String areaId, Vector2 out): Vector2`
- `getAreaDist(String areaId, float x, float y, float z): float`
- `getAreaDist(String areaId, IsoGameCharacter chr): float`
- `getAreaFacingPosition(String areaId, Vector2 out): Vector2`
- `getAttachmentLocalPos(String attachmentName, Vector3f v): Vector3f`
- `getAttachmentWorldPos(String attachmentName, Vector3f v): Vector3f`
- `getAuthorizationDescription(): String`
- `getBaseQuality(): float`
- `getBattery(): VehiclePart` from `VehiclePartOwner`
- `getBatteryCharge(): float` from `VehiclePartOwner`
- `getBestSeat(IsoGameCharacter chr): int`
- `getBloodIntensity(String id): float`
- `getBrakeSpeedBetweenUpdate(): float`
- `getBrakingForce(): float`
- `getCharacter(int seat): IsoGameCharacter`
- `getChoosenParts(): HashMap<String, String>`
- `getChosenAlarmSound(): String`
- `getClientForce(): float`
- `getClosestPointOnExtents(float x, float y, Vector2f closest): float`
- `getClosestPointOnPoly(float x, float y, Vector2f closest): float`
- `getClosestPointOnPoly(BaseVehicle other, Vector2f pointSelf, Vector2f pointOther): float`
- `getClosestWindow(IsoGameCharacter chr): VehiclePart`
- `getColorHue(): float`
- `getColorSaturation(): float`
- `getColorValue(): float`
- `getController(): CarController`
- `getCurrentAbsoluteSpeedKmHour(): float`
- `getCurrentKey(): InventoryItem`
- `getCurrentOrLastKnownDriver(): IsoGameCharacter`
- `getCurrentSpeedForRegulator(): float`
- `getCurrentSpeedKmHour(): float`
- `getCurrentSteering(): float`
- `getCurrentTotalAnimalSize(): float`
- `getDebugZ(): float`
- `getDriver(): IsoGameCharacter`
- `getDriverRegardlessOfTow(): IsoGameCharacter`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getEmitter(): BaseSoundEmitter`
- `getEngine(): VehiclePart` from `VehiclePartOwner`
- `getEngineCondition(): int`
- `getEngineLoudness(): int`
- `getEnginePower(): int`
- `getEngineQuality(): int`
- `getEngineSpeed(): double`
- `getEngineState(): BaseVehicle.engineStateTypes`
- `getEnterSeatDistance(int seat, float x, float y): float`
- `getFMODParameters(): FMODParameterList`
- `getFacingPosition(IsoGameCharacter chr, Vector2 out): Vector2`
- `getFirstZombieType(): String`
- `getForce(): float`
- `getForwardVector(Vector3f out): Vector3f`
- `getFrameNo(): int` from `ECSEntity`
- `getFudgedMass(): float`
- `getGasRemaining(): float` from `VehiclePartOwner`
- `getGasTank(): VehiclePart` from `VehiclePartOwner`
- `getHeadlightCanEmmitLight(): boolean`
- `getHeadlightsOn(): boolean`
- `getHeater(): VehiclePart` from `VehiclePartOwner`
- `getId(): short`
- `getInitialMass(): float`
- `getInsideTemperature(): float`
- `getIntersectPoint(Vector3f start, Vector3f end, Vector3f result): Vector3f`
- `getJoypad(): int`
- `getKeySpawned(): boolean`
- `getLightByIndex(int index): VehiclePart`
- `getLightCount(): int`
- `getLightbarLightsMode(): int` from `VehiclePartOwner`
- `getLightbarLightsModeObject(): LightbarLightsMode`
- `getLightbarSirenMode(): int` from `VehicleSoundOwner`
- `getLightbarSirenModeObject(): LightbarSirenMode`
- `getLinearVelocity(Vector3f out): Vector3f`
- `getLocalPos(float worldX, float worldY, float worldZ, Vector3f localPos): Vector3f`
- `getLocalPos(Vector3f worldPos, Vector3f localPos): Vector3f`
- `getMass(): float`
- `getMaxPassengers(): int`
- `getMaxSpeed(): float`
- `getMaxWheelSteering(): float`
- `getMechanicalID(): int`
- `getMinMaxPosition(): BaseVehicle.MinMaxPosition`
- `getMinWheelSkid(): float`
- `getMinimumSimulationLevel(): UpdateSchedulerSimulationLevel`
- `getNameAlignmentForPlayer(IsoGameCharacter player): TextDrawHorizontal`
- `getNameCoordForPlayer(IsoGameCharacter player, float zoom, Vector2 coord): boolean`
- `getNamePrefixForPlayer(IsoGameCharacter player): String`
- `getNearestBodyworkPart(IsoGameCharacter chr): VehiclePart`
- `getNearestVehiclePart(float x, float y, float z, boolean useDestroyed): VehiclePart`
- `getNetPlayerId(): short`
- `getNumberOfPartsWithContainers(): int` from `VehiclePartOwner`
- `getObjectName(): String`
- `getOffroadEfficiency(): float`
- `getPVPPlayerDriver(): IsoPlayer`
- `getPartById(String id): VehiclePart` from `VehiclePartOwner`
- `getPartByIndex(int index): VehiclePart` from `VehiclePartOwner`
- `getPartByPartId(VehiclePart id): VehiclePart` from `VehiclePartOwner`
- `getPartCount(): int` from `VehiclePartOwner`
- `getPartForSeatContainer(int seat): VehiclePart`
- `getPartIndex(String id): int` from `VehiclePartOwner`
- `getParts(): VehicleParts`
- `getPassenger(int seat): BaseVehicle.Passenger`
- `getPassengerAnim(int seat, String id): VehicleScript.Anim`
- `getPassengerArea(int seat): String`
- `getPassengerDoor(int seat): VehiclePart`
- `getPassengerDoor2(int seat): VehiclePart`
- `getPassengerLocalPos(int seat, Vector3f v): Vector3f`
- `getPassengerPosition(int seat, String id): VehicleScript.Position`
- `getPassengerPositionWorldPos(float x, float y, float z, Vector3f out): Vector3f`
- `getPassengerPositionWorldPos(VehicleScript.Position posn, Vector3f out): Vector3f`
- `getPassengerSwitchSeat(int seat, int index): VehicleScript.Passenger.SwitchSeat`
- `getPassengerSwitchSeatCount(int seat): int`
- `getPassengerWorldPos(int seat, Vector3f out): Vector3f`
- `getPlayerTrailerLocalPos(String attachmentName, boolean left, Vector3f v): Vector3f`
- `getPlayerTrailerWorldPos(String attachmentName, boolean left, Vector3f v): Vector3f`
- `getPoly(): VehiclePoly`
- `getPolyPlusRadius(): VehiclePoly`
- `getRandomZombieType(): String`
- `getRegulatorSpeed(): float`
- `getRemainingFuelPercentage(): float`
- `getRoadMaterial(): ParameterVehicleRoadMaterial.Material`
- `getRust(): float`
- `getScript(): VehicleScript`
- `getScriptName(): String`
- `getSeat(IsoGameCharacter chr): int`
- `getShadowTexture(): Texture`
- `getSirenStartTime(): double`
- `getSkin(): String`
- `getSkinCount(): int`
- `getSkinIndex(): int`
- `getSpecialKeyRingChance(): float`
- `getSpeed2D(): float`
- `getSqlId(): int`
- `getSquare(): IsoGridSquare`
- `getSquareForArea(String areaId): IsoGridSquare`
- `getStoplightsOn(): boolean`
- `getSurroundVehicle(): SurroundVehicle`
- `getSwitchSeatAnimName(int seatFrom, int seatTo): String`
- `getSwitchSeatAnimRate(int seatFrom, int seatTo): float`
- `getSwitchSeatSound(int seatFrom, int seatTo): String`
- `getThrottle(): float`
- `getThumpCondition(): float`
- `getThumpableFor(IsoGameCharacter chr): Thumpable`
- `getTotalContainerItemWeight(): float`
- `getTowAttachmentOther(): String`
- `getTowAttachmentSelf(): String`
- `getTowedByLocalPos(String attachmentName, Vector3f v): Vector3f`
- `getTowedByWorldPos(String attachmentName, Vector3f v): Vector3f`
- `getTowingLocalPos(String attachmentName, Vector3f v): Vector3f`
- `getTowingPartner(): BaseVehicle`
- `getTowingWorldPos(String attachmentName, Vector3f v): Vector3f`
- `getTrailerTrunkPart(): VehiclePart` from `VehiclePartOwner`
- `getTransmissionNumber(): int`
- `getTransmissionNumberEnum(): TransmissionNumber`
- `getTransmissionNumberLetter(): String`
- `getTrunkDoorPart(): VehiclePart` from `VehiclePartOwner`
- `getTrunkPart(): VehiclePart` from `VehiclePartOwner`
- `getUpVector(Vector3f out): Vector3f`
- `getUpVectorDot(): float`
- `getUseablePart(IsoGameCharacter chr): VehiclePart`
- `getUseablePart(IsoGameCharacter chr, boolean checkDir): VehiclePart`
- `getVehicleAlarmObject(): VehicleAlarm`
- `getVehicleEngineRPM(): VehicleEngineRPM`
- `getVehicleItemContainers(T paramToCompare, Invokers.Params2.Boolean.ICallback<T, ItemContainer> isValidPredicate): PZArrayList<ItemContainer>`
- `getVehicleItemContainers(T paramToCompare, Invokers.Params2.Boolean.ICallback<T, ItemContainer> isValidPredicate, PZArrayList<ItemContainer> containerList): PZArrayList<ItemContainer>`
- `getVehicleSoundEmitter(): BaseSoundEmitter`
- `getVehicleSounds(): VehicleSounds`
- `getVehicleTowedBy(): BaseVehicle`
- `getVehicleTowing(): BaseVehicle`
- `getVehicleType(): String`
- `getWheelForwardVector(int wheelIndex, Vector3f out): void`
- `getWindowLightsOn(): boolean`
- `getWorldPos(float localX, float localY, float localZ, Vector3f worldPos): Vector3f`
- `getWorldPos(float localX, float localY, float localZ, Vector3f worldPos, VehicleScript script): Vector3f`
- `getWorldPos(Vector3f localPos, Vector3f worldPos): Vector3f`
- `getWorldPos(Vector3f localPos, Vector3f worldPos, VehicleScript script): Vector3f`
- `getWorldTransform(Transform out): Transform`
- `getZombieType(): ArrayList<String>`
- `getZone(): String`
- `hasAlarm(): boolean` from `VehicleSoundOwner`
- `hasAuthorization(UdpConnection connection): boolean`
- `hasBackSignal(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasEnoughGasToRun(): boolean` from `VehiclePartOwner`
- `hasHeadlights(): boolean`
- `hasHorn(): boolean` from `VehicleSoundOwner`
- `hasLightbar(): boolean` from `VehicleSoundOwner`
- `hasLighter(): boolean`
- `hasLiveBattery(): boolean`
- `hasPassenger(): boolean`
- `hasRoof(int seat): boolean`
- `hasSiren(): boolean` from `VehicleSoundOwner`
- `hasZombieType(String outfit): boolean`
- `haveOneDoorUnlocked(): boolean`
- `hitAnimal(IsoAnimal chr): void`
- `hitCharacter(IsoGameCharacter chr, Vector2 impactPosOnVehicle): float`
- `intersectLineWithExtents(float x1, float y1, float x2, float y2, float adjust, Vector2f intersection): boolean`
- `intersectLineWithPoly(float x1, float y1, float x2, float y2, Vector2f intersection): boolean`
- `isAlarmActive(): boolean`
- `isAlarmSoundOn(): boolean`
- `isAlarmSounding(): boolean`
- `isAlarmed(): boolean`
- `isAnyDoorLocked(): boolean`
- `isAnyListenerInside(): boolean`
- `isAnyTireMissing(): boolean`
- `isAtRest(): boolean`
- `isAttachingTrailer(): boolean`
- `isBackSignalEmitting(): boolean`
- `isBackupBeeperSounding(): boolean`
- `isBeingTowedBackwards(): boolean`
- `isBrakePedalPressed(): boolean`
- `isBraking(): boolean`
- `isBurnt(): boolean`
- `isBurntOrSmashed(): boolean`
- `isCharacterAdjacentTo(IsoGameCharacter chr): boolean`
- `isCollided(IsoGameCharacter character): boolean`
- `isCreated(): boolean`
- `isDoColor(): boolean`
- `isDoingOffroad(): boolean`
- `isDoorAlarmSounding(): boolean`
- `isDriveable(): boolean`
- `isDriver(IsoGameCharacter chr): boolean`
- `isEngineRunning(): boolean`
- `isEngineSounding(): boolean`
- `isEngineStarted(): boolean`
- `isEngineWorking(): boolean`
- `isEnterBlocked(IsoGameCharacter chr, int seat): boolean`
- `isEnterBlocked2(IsoGameCharacter chr, int seat): boolean`
- `isExitBlocked(int seat): boolean`
- `isExitBlocked(IsoGameCharacter chr, int seat): boolean`
- `isExitBlocked2(int seat): boolean`
- `isGasPedalPressed(): boolean`
- `isGoodCar(): boolean`
- `isHornSounding(): boolean`
- `isHotwired(): boolean`
- `isHotwiredBroken(): boolean`
- `isInArea(String areaId, Vector3f chr): boolean`
- `isInArea(String areaId, IsoGameCharacter chr): boolean`
- `isInBounds(float worldX, float worldY): boolean`
- `isInForest(): boolean`
- `isInRange(IPositional other, float range): boolean` from `IPositional`
- `isInTrafficJam(): boolean`
- `isIntersectingSquare(int x, int y, int z): boolean`
- `isIntersectingSquare(IsoGridSquare sq): boolean`
- `isIntersectingSquareWithShadow(int x, int y, int z): boolean`
- `isInvalidChunkAhead(): boolean`
- `isInvalidChunkAround(): boolean`
- `isInvalidChunkAround(boolean moveW, boolean moveE, boolean moveN, boolean moveS): boolean`
- `isInvalidChunkBehind(): boolean`
- `isKeyIsOnDoor(): boolean`
- `isKeyboardControlled(): boolean`
- `isKeysInIgnition(): boolean`
- `isListenerInRange(float range): boolean`
- `isLocalPhysicSim(): boolean`
- `isMechanicUIOpen(): boolean`
- `isNetPlayerAuthorization(BaseVehicle.Authorization netPlayerAuthorization): boolean`
- `isNetPlayerId(short netPlayerId): boolean`
- `isOnScreen(): boolean`
- `isOperational(): boolean`
- `isPassengerUseDoor2(IsoGameCharacter chr, int seat): boolean`
- `isPersistentContact(IsoGameCharacter chr): boolean`
- `isPhysicsActive(): boolean`
- `isPointLeftOfCenter(float x, float y): boolean`
- `isPositionOnLeftOrRight(float x, float y): boolean`
- `isPreviouslyEntered(): boolean`
- `isPreviouslyMoved(): boolean`
- `isRegulator(): boolean`
- `isRemovedFromWorld(): boolean`
- `isSeatHoldingItems(int seat): boolean`
- `isSeatHoldingItems(VehiclePart seat): boolean`
- `isSeatInstalled(int seat): boolean`
- `isSeatOccupied(int seat): boolean`
- `isSirenActive(): boolean`
- `isSirenSounding(): boolean`
- `isSirening(): boolean`
- `isSmashed(): boolean`
- `isStarting(): boolean`
- `isStopped(): boolean`
- `isTrunkLocked(): boolean`
- `keyNamerVehicle(InventoryItem item): void`
- `leftSideFuel(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `lockServerUpdate(long lockTimeMs): void`
- `needPartsUpdate(): boolean`
- `netPlayerFromServerUpdate(BaseVehicle.Authorization authorization, short authorizationPlayer): void`
- `notKillCrops(): boolean`
- `onAlarmStart(): void`
- `onAlarmStop(): void`
- `onBackMoveSignalStart(): void`
- `onBackMoveSignalStop(): void`
- `onEngineStateChanged(BaseVehicle.engineStateTypes oldState, BaseVehicle.engineStateTypes newState, VehicleEngineStateChangeReason reason): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onHitLandmine(IsoGridSquare square): void`
- `onHornStart(): void`
- `onHornStop(): void`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onJump(): void`
- `onVehicleAlarmEvent(VehicleAlarmEvent event): void`
- `partsClear(): void`
- `permanentlyRemove(): void`
- `playActorAnim(VehiclePart part, String animId, IsoGameCharacter chr): void`
- `playPartAnim(VehiclePart part, String animId): void`
- `playPartSound(VehiclePart part, IsoPlayer player, String animId): void`
- `playPassengerAnim(int seat, String animId): void`
- `playPassengerAnim(int seat, String animId, IsoGameCharacter chr): void`
- `playPassengerSound(int seat, String animId): void`
- `playSound(String sound): void`
- `playSoundImpl(String file, IsoObject parent): long`
- `playSwitchSeatAnim(int seatFrom, int seatTo): void`
- `positionTrailer(BaseVehicle trailer): void`
- `postupdate(): void`
- `processHit(IsoGameCharacter isoGameCharacter, HandWeapon weapon, float damage): boolean`
- `putKeyInIgnition(InventoryItem key, int containerID): void`
- `putKeyOnDoor(InventoryItem key): void`
- `putKeyToContainer(ItemContainer container, IsoGridSquare sq, IsoObject obj): void`
- `putKeyToContainerServer(InventoryItem item, IsoGridSquare sq, IsoObject obj): void`
- `putKeyToWorld(IsoGridSquare sq): void`
- `putKeyToZombie(IsoZombie zombie): void`
- `registerECSComponents(): void` from `ECSEntity`
- `releaseAnimationPlayers(): void`
- `removeAnimalFromTrailer(IsoAnimal animal): IsoObject`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `removeKeyFromDoor(): void`
- `removeKeyFromIgnition(): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `renderShadow(): void`
- `renderlast(): void`
- `repair(): void`
- `replaceGrownAnimalInTrailer(IsoAnimal current, IsoAnimal grown): void`
- `resumeRunningAfterLoad(): void`
- `rightSideFuel(): boolean`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `scriptReloaded(): void`
- `scriptReloaded(boolean spawnSwap): void`
- `setActiveInBullet(boolean active): void`
- `setAddThumpWorldSound(boolean add): void`
- `setAlarmed(boolean alarmed): void`
- `setAngles(float degreesX, float degreesY, float degreesZ): void`
- `setBaseQuality(float baseQuality): void`
- `setBloodIntensity(String id, float intensity): void`
- `setBraking(boolean isBraking): void`
- `setBrakingForce(float brakingForce): void`
- `setCharacterPosition(IsoGameCharacter chr, int seat, String positionId): void`
- `setCharacterPositionToAnim(IsoGameCharacter chr, int seat, String animId): void`
- `setChosenAlarmSound(String soundName): void`
- `setClientForce(float force): void`
- `setColor(float value, float saturation, float hue): void`
- `setColorHSV(float hue, float saturation, float value): void`
- `setCurrentKey(InventoryItem currentKey): void`
- `setCurrentSteering(float currentSteering): void`
- `setCurrentTotalAnimalSize(float totalAnimalSize): void`
- `setDebugPhysicsRender(boolean addedToWorld): void`
- `setDebugZ(float z): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setDoColor(boolean doColor): void`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setEngineFeature(int quality, int loudness, int engineForce): void`
- `setEngineSpeed(double speed): void`
- `setForceBrake(): void`
- `setGeneralPartCondition(float baseQuality, float chanceToSpawnDamaged): void`
- `setGoodCar(boolean isGoodCar): void`
- `setHeadlightsOn(boolean on): void`
- `setHotwired(boolean hotwired): void`
- `setHotwiredBroken(boolean hotwiredBroken): void`
- `setInitialMass(float initialMass): void`
- `setKeyIsOnDoor(boolean keyIsOnDoor): void`
- `setKeysInIgnition(boolean keysOnContact): void`
- `setLightbarLightsMode(int mode): void`
- `setLightbarSirenMode(int mode): void`
- `setLocked(boolean locked): void`
- `setMass(float mass): void`
- `setMaxSpeed(float maxSpeed): void`
- `setMechanicUIOpen(boolean mechanicUiOpen): void`
- `setMechanicalID(int mechanicalId): void`
- `setModelVisible(VehiclePart part, VehicleScript.Model scriptModel, boolean visible): BaseVehicle.ModelInfo`
- `setNeedPartsUpdate(boolean needPartsUpdate): void`
- `setNetPlayerAuthorization(BaseVehicle.Authorization netPlayerAuthorization, int netPlayerId): void`
- `setPassenger(int seat, IsoGameCharacter chr, Vector3f offset): boolean`
- `setPhysicsActive(boolean active): void`
- `setPhysicsActive(boolean active, boolean setStatic): void`
- `setPreviouslyEntered(boolean bool): void`
- `setPreviouslyMoved(boolean bool): void`
- `setRegulator(boolean regulator): void`
- `setRegulatorSpeed(float regulatorSpeed): void`
- `setRust(float rust): void`
- `setScript(): void`
- `setScript(String name): void`
- `setScriptName(String name): void`
- `setSirenStartTime(double worldAgeHours): void`
- `setSkinIndex(int index): void`
- `setSmashed(String location): BaseVehicle`
- `setSmashed(String location, boolean flipped): BaseVehicle`
- `setSpeedKmHour(float speedKmHour): void`
- `setStoplightsOn(boolean on): void`
- `setTireInflation(int wheelIndex, float inflation): void`
- `setTireRemoved(int wheelIndex, boolean removed): void`
- `setTrunkLocked(boolean locked): void`
- `setVehicleAlarm(VehicleAlarm vehicleAlarm1): void`
- `setVehicleSounds(VehicleSounds vehicleSounds1): void`
- `setVehicleTowedBy(BaseVehicle vehicleA, String attachmentA, String attachmentB): void`
- `setVehicleTowing(BaseVehicle vehicleB, String attachmentA, String attachmentB): void`
- `setVehicleType(String type): void`
- `setWindowLightsOn(boolean on): void`
- `setWorldTransform(Transform in): void`
- `setZone(String name): void`
- `shouldAnimRecorderBeActive(): boolean`
- `shouldCollideWithCharacters(): boolean`
- `shouldCollideWithObjects(): boolean`
- `shouldNotHaveLoot(): boolean`
- `shouldSnapZToCurrentSquare(): boolean`
- `shouldUpdateInMeta(): boolean`
- `showPassenger(int seat): boolean`
- `showPassenger(IsoGameCharacter chr): boolean`
- `shutOff(): void`
- `shutOff(String sound): void`
- `sirenShutoffTimeExpired(): boolean` from `VehicleSoundOwner`
- `softReset(): void`
- `startEvent(long eventInstance, GameSoundClip clip, boolean remote, BitSet parameterSet): void`
- `stopAttachingTrailer(): void`
- `stopEvent(long eventInstance, GameSoundClip clip, boolean remote, BitSet parameterSet): void`
- `stopSound(long channel): int`
- `switchSeat(IsoGameCharacter chr, int seatTo): void`
- `syncKeyInIgnition(boolean inIgnition, boolean onDoor, InventoryItem key): void`
- `testCollisionWithCharacter(IsoGameCharacter chr, float circleRadius, Vector2 outCollisionPos): Vector2`
- `testCollisionWithCorpse(IsoDeadBody body, boolean doSound): int`
- `testCollisionWithObject(IsoObject obj, float circleRadius, Vector2 out): Vector2`
- `testCollisionWithProneCharacter(IsoGameCharacter chr, boolean doSound, Vector2 outImpactPosOnVehicle): int`
- `testCollisionWithProneCharacter(IsoMovingObject chr, float angleX, float angleY, boolean doSound, Vector2 outImpactPosOnVehicle): int`
- `testCollisionWithVehicle(BaseVehicle obj): boolean`
- `testTouchingVehicle(IsoGameCharacter isoGameCharacter, RagdollController ragdollController): boolean`
- `toggleLockedDoor(VehiclePart part, IsoGameCharacter chr, boolean locked): void`
- `transmitAlarmed(): void`
- `transmitBlood(): void`
- `transmitCharacterPosition(int seat, String positionId): void`
- `transmitColorHSV(): void`
- `transmitEngine(): void`
- `transmitPartCondition(VehiclePart part): void`
- `transmitPartDoor(VehiclePart part): void`
- `transmitPartItem(VehiclePart part): void`
- `transmitPartLight(VehiclePart part): void`
- `transmitPartModData(VehiclePart part): void`
- `transmitPartUsedDelta(VehiclePart part): void`
- `transmitPartWindow(VehiclePart part): void`
- `transmitRust(): void`
- `transmitSkinIndex(): void`
- `triggerAlarm(): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `tryHotwire(int electricityLevel): void`
- `trySpawnKey(): void`
- `trySpawnKey(boolean crashed): void`
- `trySpawnVehicleKeyInObject(IsoObject obj): boolean`
- `trySpawnVehicleKeyOnZombie(IsoZombie zombie): boolean`
- `tryStartEngine(): void`
- `tryStartEngine(boolean haveKey): void`
- `update(): void`
- `updateBulletStats(): void`
- `updateControls(): void`
- `updateDamageOverlayLater(): void`
- `updateEvent(long eventInstance, GameSoundClip clip): void`
- `updateHasExtendOffset(IsoGameCharacter chr): void`
- `updateHasExtendOffsetForExit(IsoGameCharacter chr): void`
- `updateHasExtendOffsetForExitEnd(IsoGameCharacter chr): void`
- `updateLights(): void`
- `updateNetworkHitByVehicle(IsoGameCharacter target): boolean`
- `updatePartStats(): void`
- `updateParts(): void`
- `updatePhysics(): void`
- `updatePhysicsNetwork(): void`
- `updateSkin(): void`
- `updateSounds(): void`
- `updateTotalMass(): void`
- `validateHitVehicleDistance(float playerX, float playerY): boolean`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`
- `windowsOpen(): int` from `VehiclePartOwner`

Static functions, called as `BaseVehicle.name(...)`:

- `LoadAllVehicleTextures(): void`
- `LoadVehicleTexture(String name): Texture`
- `LoadVehicleTexture(String name, int flags): Texture`
- `LoadVehicleTextures(VehicleScript script): void`
- `allocMatrix4f(): Matrix4f`
- `allocQuaternionf(): Quaternionf`
- `allocTransform(): Transform`
- `allocVector2(): Vector2`
- `allocVector2f(): Vector2f`
- `allocVector3(): Vector3`
- `allocVector3f(): Vector3f`
- `allocVector4f(): Vector4f`
- `getFakeSpeedModifier(): float`
- `keyNamerVehicle(InventoryItem item, BaseVehicle vehicle): void`
- `releaseMatrix4f(Matrix4f v): void`
- `releaseQuaternionf(Quaternionf q): void`
- `releaseTransform(Transform t): void`
- `releaseVector2(Vector2 v): void`
- `releaseVector2f(Vector2f vector2f): void`
- `releaseVector3(Vector3 v): void`
- `releaseVector3f(Vector3f vector3f): void`
- `releaseVector4f(Vector4f vector4f): void`

Constructors: `BaseVehicle.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `AMBIENT_SOUND_RADIUS: int`, `DEFAULT_ENTITY_DISPLAY_NAME: String`, `DOT_PRODUCT_ATTACH_TRAILER_FORWARD: float`, `DOT_PRODUCT_ATTACH_TRAILER_UP: float`, `ENGINE_SOUND_RADIUS: int`, `FADE_DISTANCE: int`, `HIT_VEHICLE_MAX_DISTANCE_TILES: double`, `MASK1_DOOR_LEFT_FRONT: int`, `MASK1_DOOR_LEFT_REAR: int`, `MASK1_DOOR_RIGHT_FRONT: int`, `MASK1_DOOR_RIGHT_REAR: int`, `MASK1_FRONT: int`, `MASK1_GUARD_LEFT_FRONT: int`, `MASK1_GUARD_LEFT_REAR: int`, `MASK1_GUARD_RIGHT_FRONT: int`, `MASK1_GUARD_RIGHT_REAR: int`, `MASK1_REAR: int`, `MASK1_WINDOW_FRONT: int`, `MASK1_WINDOW_LEFT_FRONT: int`, `MASK1_WINDOW_LEFT_REAR: int`, `MASK1_WINDOW_REAR: int`, `MASK1_WINDOW_RIGHT_FRONT: int`, `MASK1_WINDOW_RIGHT_REAR: int`, `MASK2_BOOT: int`, `MASK2_BRAKE_LEFT: int`, `MASK2_BRAKE_RIGHT: int`, `MASK2_HOOD: int`, `MASK2_LIGHTBAR_LEFT: int`, `MASK2_LIGHTBAR_RIGHT: int`, `MASK2_LIGHT_LEFT_FRONT: int`, `MASK2_LIGHT_LEFT_REAR: int`, `MASK2_LIGHT_RIGHT_FRONT: int`, `MASK2_LIGHT_RIGHT_REAR: int`, `MASK2_ROOF: int`, `MAX_WALL_SPLATS: int`, `MAX_WHEELS: int`, `MAX_ZOMBIES_EATING: int`, `MINIMUM_DOT_UPRIGHT: float`, `MIN_HIT_SPEED_TILES_PER_SECOND: float`, `PHYSICS_PARAM_COUNT: int`, `PHYSICS_Z_SCALE: float`, `PLUS_RADIUS: float`, `POSITION_HISTORY_INTERVAL_MS: long`, `POSITION_HISTORY_MAX_ENTRIES: int`, `RADIUS: float`, `RANDOMIZE_CONTAINER_CHANCE: int`, `SIREN_WORLDSOUND_RADIUS: int`, `SIREN_WORLDSOUND_VOLUME: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `TL_matrix4f_pool: ThreadLocal<BaseVehicle.Matrix4fObjectPool>`, `TL_quaternionf_pool: ThreadLocal<BaseVehicle.QuaternionfObjectPool>`, `TL_transform_pool: ThreadLocal<BaseVehicle.TransformPool>`, `TL_vector2f_pool: ThreadLocal<BaseVehicle.Vector2fObjectPool>`, `TL_vector3_pool: ThreadLocal<BaseVehicle.Vector3ObjectPool>`, `TL_vector3f_pool: ThreadLocal<BaseVehicle.Vector3fObjectPool>`, `TL_vector4f_pool: ThreadLocal<BaseVehicle.Vector4fObjectPool>`, `TRAILER_ANGULAR_LOWER_LIMIT_X: float`, `TRAILER_ANGULAR_LOWER_LIMIT_Y: float`, `TRAILER_ANGULAR_LOWER_LIMIT_Z: float`, `TRAILER_ANGULAR_UPPER_LIMIT_X: float`, `TRAILER_ANGULAR_UPPER_LIMIT_Y: float`, `TRAILER_ANGULAR_UPPER_LIMIT_Z: float`, `TRAILER_LINEAR_LOWER_LIMIT_X: float`, `TRAILER_LINEAR_LOWER_LIMIT_Y: float`, `TRAILER_LINEAR_LOWER_LIMIT_Z: float`, `TRAILER_LINEAR_UPPER_LIMIT_X: float`, `TRAILER_LINEAR_UPPER_LIMIT_Y: float`, `TRAILER_LINEAR_UPPER_LIMIT_Z: float`, `YURI_FORCE_FIELD: boolean`, `bmod: float`, `centerOfMassMagic: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `noAuthorization: byte`, `renderToTexture: boolean`, `rmod: float`, `treeSoundMgr: TreeSoundManager`, `vehicleShadow: Texture`.

### EditVehicleState

`zombie.vehicles.EditVehicleState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `setScript(String scriptName): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void`

Static functions, called as `EditVehicleState.name(...)`:

- `checkInstance(): EditVehicleState`

Constructors: `EditVehicleState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: EditVehicleState`.

### UI3DScene

`zombie.vehicles.UI3DScene`, class. Extends [UIElement](/pz/build-42/modding/reference/lua-classes-ui-and-input#uielement). Also has the methods of [UIElement](/pz/build-42/modding/reference/lua-classes-ui-and-input#uielement) (168), listed on their own entries.

Methods, called as `obj:name(...)`:

- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `fromLua2(String func, Object arg0, Object arg1): Object`
- `fromLua3(String func, Object arg0, Object arg1, Object arg2): Object`
- `fromLua4(String func, Object arg0, Object arg1, Object arg2, Object arg3): Object`
- `fromLua5(String func, Object arg0, Object arg1, Object arg2, Object arg3, Object arg4): Object`
- `fromLua6(String func, Object arg0, Object arg1, Object arg2, Object arg3, Object arg4, Object arg5): Object`
- `fromLua7(String func, Object arg0, Object arg1, Object arg2, Object arg3, Object arg4, Object arg5, Object arg6): Object`
- `fromLua9(String func, Object arg0, Object arg1, Object arg2, Object arg3, Object arg4, Object arg5, Object arg6, Object arg7, Object arg8): Object`
- `render(): void`
- `sceneToUIX(float sceneX, float sceneY, float sceneZ): float`
- `sceneToUIX(Vector3f scenePos): float`
- `sceneToUIY(float sceneX, float sceneY, float sceneZ): float`
- `sceneToUIY(Vector3f scenePos): float`
- `uiToGrid(float uiX, float uiY, UI3DScene.GridPlane gridPlane, Vector3f outScenePos): boolean`
- `uiToScene(float uiX, float uiY, float uiZ, Vector3f out): Vector3f`
- `uiToScene(Matrix4f modelTransform, float uiX, float uiY, float uiZ, Vector3f out): Vector3f`
- `uiToSceneX(float uiX, float uiY): float`
- `uiToSceneY(float uiX, float uiY): float`

Static functions, called as `UI3DScene.name(...)`:

- `allocPlane(): UI3DScene.Plane`
- `allocRay(): UI3DScene.Ray`
- `closest_distance_between_lines(UI3DScene.Ray l1, UI3DScene.Ray l2): float`
- `closest_distance_line_circle(UI3DScene.Ray ray, UI3DScene.Circle c, Vector3f point): float`
- `distance_between_point_ray(Vector3f p, UI3DScene.Ray l): float`
- `intersect_ray_plane(UI3DScene.Plane pn, UI3DScene.Ray s, Vector3f out): int`
- `releasePlane(UI3DScene.Plane plane): void`
- `releaseRay(UI3DScene.Ray ray): void`

Constructors: `UI3DScene.new(KahluaTable table)`.

Static fields (a copy of the value taken when the class is exposed): `Z_SCALE: float`.

### VehicleDoor

`zombie.vehicles.VehicleDoor`, class.

Methods, called as `obj:name(...)`:

- `init(VehicleScript.Door scriptDoor): void`
- `isLockBroken(): boolean`
- `isLocked(): boolean`
- `isOpen(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`
- `setLockBroken(boolean broken): void`
- `setLocked(boolean locked): void`
- `setOpen(boolean open): void`

Constructors: `VehicleDoor.new(VehiclePart part)`.

### VehicleEngineRPM

`zombie.vehicles.VehicleEngineRPM`, class. Extends [BaseScriptObject](/pz/build-42/modding/reference/lua-classes-scripts-1#basescriptobject). Also has the methods of [BaseScriptObject](/pz/build-42/modding/reference/lua-classes-scripts-1#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String totalFile): void`
- `getName(): String`
- `reset(): void`

Constructors: `VehicleEngineRPM.new()`.

Static fields (a copy of the value taken when the class is exposed): `MAX_GEARS: int`.

### VehicleLight

`zombie.vehicles.VehicleLight`, class.

Methods, called as `obj:name(...)`:

- `canFocusingDown(): boolean`
- `canFocusingUp(): boolean`
- `getActive(): boolean`
- `getDistanization(): float`
- `getFocusing(): int`
- `getIntensity(): float`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`
- `setActive(boolean active): void`
- `setFocusingDown(): void`
- `setFocusingUp(): void`

Constructors: `VehicleLight.new()`.

### VehiclePart

`zombie.vehicles.VehiclePart`, class. Extends [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [WaveSignalDevice](/pz/build-42/modding/reference/lua-classes-sound-and-radio#wavesignaldevice) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `AddDeviceText(String line, float r, float g, float b, String guid, String codes, int distance): void`
- `HasPlayerInRange(): boolean`
- `addChild(VehiclePart child): void`
- `clearFlags(): void`
- `createSignalDevice(): DeviceData`
- `createSpotLight(float xOffset, float yOffset, float dist, float intensity, float dot, int focusing): void`
- `createSpotLightColor(float xOffset, float yOffset, float dist, float intensity, float dot, int focusing, float r, float g, float b): void`
- `damage(int amount): void`
- `doInventoryItemStats(InventoryItem newItem, int mechanicSkill): void`
- `findWindow(): VehicleWindow`
- `getAnimById(String id): VehicleScript.Anim`
- `getArea(): String`
- `getCategory(): String`
- `getChatElement(): ChatElement`
- `getChild(int index): VehiclePart`
- `getChildCount(): int`
- `getChildWindow(): VehiclePart`
- `getCondition(): int`
- `getContainerCapacity(): int`
- `getContainerCapacity(IsoGameCharacter chr): int`
- `getContainerCloseSound(): String`
- `getContainerContentAmount(): float`
- `getContainerContentType(): String`
- `getContainerOpenSound(): String`
- `getContainerPutSound(): String`
- `getContainerSeatNumber(): int`
- `getContainerTakeSound(): String`
- `getDelta(): float`
- `getDeviceData(): DeviceData`
- `getDoor(): VehicleDoor`
- `getDurability(): float`
- `getEnclosingDoor(): VehicleDoor`
- `getEngineLoudness(): float`
- `getEntityNetID(): long`
- `getFlag(short flag): boolean`
- `getGameEntityType(): GameEntityType`
- `getId(): String`
- `getIndex(): int`
- `getInventoryItem(): T`
- `getItemContainer(): ItemContainer`
- `getItemType(): ArrayList<String>`
- `getLastUpdated(): float`
- `getLight(): VehicleLight`
- `getLightDistance(): float`
- `getLightFocusing(): float`
- `getLightIntensity(): float`
- `getLuaFunction(String name): String`
- `getMechanicArea(): String`
- `getMechanicSkillInstaller(): int`
- `getModData(): KahluaTable`
- `getOwner(): VehiclePartOwner`
- `getParent(): VehiclePart`
- `getScriptPart(): VehicleScript.Part`
- `getSquare(): IsoGridSquare`
- `getSuspensionCompression(): float`
- `getSuspensionDamping(): float`
- `getTable(String id): KahluaTable`
- `getVehicle(): BaseVehicle`
- `getVehicleEngine(): VehicleEngine`
- `getWheelFriction(): float`
- `getWheelIndex(): int`
- `getWindow(): VehicleWindow`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `hasDevicePower(): boolean`
- `hasModData(): boolean`
- `isContainer(): boolean`
- `isEntityValid(): boolean`
- `isInventoryItemUninstalled(): boolean`
- `isSeat(): boolean`
- `isSetAllModelsVisible(): boolean`
- `isSpecificItem(): boolean`
- `isVehicleTrunk(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `repair(): void`
- `save(ByteBuffer output): void`
- `setAllModelsVisible(boolean visible): void`
- `setCategory(String category): void`
- `setCondition(int condition): void`
- `setContainerCapacity(int cap): void`
- `setContainerContentAmount(float amount): void`
- `setContainerContentAmount(float amount, boolean force, boolean noUpdateMass): void`
- `setDelta(float d): void`
- `setDeviceData(DeviceData data): void`
- `setDurability(float durability): void`
- `setEngineLoudness(float engineLoudness): void`
- `setFlag(short flag): void`
- `setGeneralCondition(InventoryItem item, float baseQuality, float chanceToSpawnDamaged): void`
- `setInventoryItem(InventoryItem item): void`
- `setInventoryItem(InventoryItem item, int mechanicSkill): void`
- `setItemContainer(ItemContainer container): void`
- `setLastUpdated(float hours): void`
- `setLightActive(boolean active): void`
- `setMechanicSkillInstaller(int mechanicSkillInstaller): void`
- `setModelVisible(String id, boolean visible): void`
- `setRandomCondition(InventoryItem item): void`
- `setScriptPart(VehicleScript.Part scriptPart): void`
- `setSpecificItem(boolean specificItem): void`
- `setSuspensionCompression(float suspensionCompression): void`
- `setSuspensionDamping(float suspensionDamping): void`
- `setWheelFriction(float wheelFriction): void`
- `updateSignalDevice(): void`

Static functions, called as `VehiclePart.name(...)`:

- `getNumberByCondition(float number, float cond, float min): float`

Constructors: `VehiclePart.new(VehiclePartOwner vehicle)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### VehicleType

`zombie.vehicles.VehicleType`, class.

Methods, called as `obj:name(...)`:

- `getBaseVehicleQuality(): float`
- `getChanceToSpawnKey(): int`
- `getRandomBaseVehicleQuality(): float`
- `setChanceToSpawnKey(int chanceToSpawnKey): void`

Static functions, called as `VehicleType.name(...)`:

- `Reset(): void`
- `getRandomVehicleType(String zoneName): VehicleType`
- `getRandomVehicleType(String zoneName, Boolean doNormalWhenSpecific): VehicleType`
- `getTypeFromName(String name): VehicleType`
- `hasTypeForZone(String zoneName): boolean`
- `init(): void`

Constructors: `VehicleType.new(String name)`.

Static fields (a copy of the value taken when the class is exposed): `specialVehicles: ArrayList<VehicleType>`, `vehicles: HashMap<String, VehicleType>`.

### VehicleWindow

`zombie.vehicles.VehicleWindow`, class.

Methods, called as `obj:name(...)`:

- `damage(int amount): void`
- `getHealth(): int`
- `getOpenDelta(): float`
- `getPart(): VehiclePart`
- `hit(IsoGameCharacter chr): void`
- `init(VehicleScript.Window scriptWindow): void`
- `isDestroyed(): boolean`
- `isHittable(): boolean`
- `isOpen(): boolean`
- `isOpenable(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`
- `setOpen(boolean open): void`
- `setOpenDelta(float delta): void`

Constructors: `VehicleWindow.new(VehiclePart part)`.

### VirtualVehicle

`zombie.vehicles.VirtualVehicle`, class.

Methods, called as `obj:name(...)`:

- `getBattery(): VehiclePart` from `VehiclePartOwner`
- `getBatteryCharge(): float` from `VehiclePartOwner`
- `getBrakeSpeedBetweenUpdate(): float`
- `getChosenAlarmSound(): String`
- `getCurrentSpeedKmHour(): float`
- `getDriver(): IsoGameCharacter` from `VehiclePartOwner`
- `getDriverRegardlessOfTow(): IsoGameCharacter` from `VehiclePartOwner`
- `getEngine(): VehiclePart` from `VehiclePartOwner`
- `getEngineCondition(): int`
- `getEngineQuality(): int`
- `getEngineSpeed(): double`
- `getEngineState(): BaseVehicle.engineStateTypes`
- `getGasRemaining(): float` from `VehiclePartOwner`
- `getGasTank(): VehiclePart` from `VehiclePartOwner`
- `getHeadlightsOn(): boolean`
- `getHeater(): VehiclePart` from `VehiclePartOwner`
- `getId(): short`
- `getLightbarLightsMode(): int` from `VehiclePartOwner`
- `getLightbarLightsModeObject(): LightbarLightsMode`
- `getLightbarSirenMode(): int` from `VehicleSoundOwner`
- `getLightbarSirenModeObject(): LightbarSirenMode`
- `getMaxSpeed(): float`
- `getMaxWheelSteering(): float`
- `getMinWheelSkid(): float`
- `getNumberOfPartsWithContainers(): int` from `VehiclePartOwner`
- `getPartById(String id): VehiclePart` from `VehiclePartOwner`
- `getPartByIndex(int index): VehiclePart` from `VehiclePartOwner`
- `getPartByPartId(VehiclePart id): VehiclePart` from `VehiclePartOwner`
- `getPartCount(): int` from `VehiclePartOwner`
- `getPartIndex(String id): int` from `VehiclePartOwner`
- `getParts(): VehicleParts`
- `getRoadMaterial(): ParameterVehicleRoadMaterial.Material`
- `getScript(): VehicleScript`
- `getScriptName(): String`
- `getSirenStartTime(): double`
- `getSqlId(): int`
- `getSquare(): IsoGridSquare`
- `getTrailerTrunkPart(): VehiclePart` from `VehiclePartOwner`
- `getTransmissionNumber(): int`
- `getTrunkDoorPart(): VehiclePart` from `VehiclePartOwner`
- `getTrunkPart(): VehiclePart` from `VehiclePartOwner`
- `getVehicleSoundEmitter(): BaseSoundEmitter`
- `getVehicleSounds(): VehicleSounds`
- `getX(): float`
- `getXi(): int`
- `getY(): float`
- `getYi(): int`
- `getZ(): float`
- `getZi(): int`
- `hasAlarm(): boolean` from `VehicleSoundOwner`
- `hasEnoughGasToRun(): boolean` from `VehiclePartOwner`
- `hasHorn(): boolean` from `VehicleSoundOwner`
- `hasLightbar(): boolean` from `VehicleSoundOwner`
- `hasSiren(): boolean` from `VehicleSoundOwner`
- `isAlarmActive(): boolean`
- `isAlarmSoundOn(): boolean`
- `isAlarmSounding(): boolean`
- `isAnyListenerInside(): boolean`
- `isAnyTireMissing(): boolean`
- `isBackupBeeperSounding(): boolean`
- `isBrakePedalPressed(): boolean`
- `isDoorAlarmSounding(): boolean`
- `isEngineRunning(): boolean`
- `isEngineSounding(): boolean`
- `isEngineWorking(): boolean`
- `isGasPedalPressed(): boolean`
- `isHornSounding(): boolean`
- `isListenerInRange(float range): boolean`
- `isSirenActive(): boolean`
- `isSirenSounding(): boolean`
- `onEngineStateChanged(BaseVehicle.engineStateTypes oldState, BaseVehicle.engineStateTypes newState, VehicleEngineStateChangeReason reason): void`
- `onVehicleAlarmEvent(VehicleAlarmEvent event): void`
- `removeFromMeta(BaseVehicle vehicle): void`
- `save(): void`
- `set(BaseVehicle vehicle): void`
- `setEngineFeature(int quality, int loudness, int engineForce): void`
- `setLightbarLightsMode(int mode): void` from `VehiclePartOwner`
- `setLightbarSirenMode(int mode): void`
- `setModelVisible(VehiclePart part, VehicleScript.Model scriptModel, boolean visible): BaseVehicle.ModelInfo`
- `setNeedPartsUpdate(boolean needPartsUpdate): void`
- `setSirenStartTime(double worldAgeHours): void`
- `shouldUpdateInMeta(): boolean`
- `sirenShutoffTimeExpired(): boolean` from `VehicleSoundOwner`
- `stopUpdatingInMeta(): void`
- `transmitEngine(): void`
- `transmitPartCondition(VehiclePart part): void`
- `transmitPartDoor(VehiclePart part): void`
- `transmitPartItem(VehiclePart part): void`
- `transmitPartLight(VehiclePart part): void`
- `transmitPartModData(VehiclePart part): void`
- `transmitPartUsedDelta(VehiclePart part): void`
- `transmitPartWindow(VehiclePart part): void`
- `update(): void`
- `updateBulletStats(): void`
- `updateDamageOverlayLater(): void`
- `updatePartStats(): void`
- `updateTotalMass(): void`
- `windowsOpen(): int` from `VehiclePartOwner`

Constructors: `VirtualVehicle.new()`.
