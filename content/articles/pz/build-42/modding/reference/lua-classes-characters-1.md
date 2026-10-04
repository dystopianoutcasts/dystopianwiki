---
slug: lua-classes-characters-1
title: 'Lua Classes: Characters, players, zombies and animals, part 1 of 3 (Build 42.21)'
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
excerpt: 'The exposed characters, players, zombies and animals classes of Build 42.21 (part 1 of 3): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Characters, players, zombies and animals, part 1 of 3

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Everything that walks: players, zombies, animals, their bodies, stats, skills, moodles and traits. If your mod touches a character, the class you want is probably here.

This page holds 41 classes and 1,714 methods, part 1 of 3 of this area (from `AnimalAllele` to `IsoDummyCameraCharacter`), from the packages `zombie.characters`, `zombie.characters.AttachedItems`, `zombie.characters.BodyDamage`, `zombie.characters.CharacterTimedActions`, `zombie.characters.animals`, `zombie.characters.animals.behavior`, `zombie.characters.animals.datas`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### AnimalAllele

`zombie.characters.animals.AnimalAllele`, class.

Methods, called as `obj:name(...)`:

- `getCurrentValue(): float`
- `getGeneticDisorder(): String`
- `getName(): String`
- `getTrueRatioValue(): float`
- `isDominant(): boolean`
- `isUsed(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setCurrentValue(float newValue): void`
- `setDominant(boolean dom): void`
- `setGeneticDisorder(String gd): void`
- `setTrueRatioValue(float newValue): void`
- `setUsed(boolean used): void`

Constructors: `AnimalAllele.new()`, `AnimalAllele.new(AnimalAllele allele)`.

### AnimalChunk

`zombie.characters.animals.AnimalChunk`, class.

Methods, called as `obj:name(...)`:

- `addTracks(VirtualAnimal animal, AnimalTracksDefinitions.AnimalTracksType trackType): void`
- `addTracksStr(VirtualAnimal animal, String trackType): void`
- `deleteTracks(): void`
- `findAnimalByID(double id): VirtualAnimal`
- `getAnimalsTracks(): ArrayList<AnimalTracks>`
- `getVirtualAnimals(): ArrayList<VirtualAnimal>`
- `updateTracks(): void`

Constructors: `AnimalChunk.new()`.

### AnimalDefinitions

`zombie.characters.animals.AnimalDefinitions`, class.

Methods, called as `obj:name(...)`:

- `canBeSkeleton(): boolean`
- `getAnimalType(): String`
- `getBabyType(): String`
- `getBodyModelStr(): String`
- `getBreedByName(String breedName): AnimalBreed`
- `getBreeds(): ArrayList<AnimalBreed>`
- `getGroup(): String`
- `getGrowStage(): AnimalGrowStage`
- `getMaxBaby(): int`
- `getMinBaby(): int`
- `getRandomBreed(): AnimalBreed`
- `getWildFleeTimeUntilDeadTimer(): float`
- `isBaby(): boolean`
- `isInsideHutchTime(Integer hour): boolean`
- `isOutsideHutchTime(): boolean`

Static functions, called as `AnimalDefinitions.name(...)`:

- `Reset(): void`
- `getAnimalDefs(): HashMap<String, AnimalDefinitions>`
- `getAnimalDefsArray(): ArrayList<AnimalDefinitions>`
- `getDef(String animalType): AnimalDefinitions`
- `getDef(IsoAnimal animal): AnimalDefinitions`
- `loadAnimalDefinitions(): void`

Constructors: `AnimalDefinitions.new()`.

Static fields (a copy of the value taken when the class is exposed): `animalDefs: HashMap<String, AnimalDefinitions>`.

### AnimalGene

`zombie.characters.animals.AnimalGene`, class.

Methods, called as `obj:name(...)`:

- `getAllele1(): AnimalAllele`
- `getAllele2(): AnimalAllele`
- `getName(): String`
- `getUsedGene(): AnimalAllele`
- `initUsedGene(): void`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `save(ByteBuffer output, boolean isDebugSave): void`

Static functions, called as `AnimalGene.name(...)`:

- `checkGeneticDisorder(IsoAnimal animal): void`
- `doMutation(AnimalAllele allele): void`
- `doRatio(AnimalGenomeDefinitions def, HashMap<String, AnimalGene> fullGenome, AnimalAllele allele): void`
- `initGenesFromParents(HashMap<String, AnimalGene> femaleGenome, HashMap<String, AnimalGene> maleGenome): HashMap<String, AnimalGene>`
- `initGenome(IsoAnimal animal): void`

Constructors: `AnimalGene.new()`, `AnimalGene.new(AnimalGene gene)`.

### AnimalGenomeDefinitions

`zombie.characters.animals.AnimalGenomeDefinitions`, class.

Static functions, called as `AnimalGenomeDefinitions.name(...)`:

- `getGeneticDisorderList(): ArrayList<String>`
- `loadGenomeDefinition(): void`

Constructors: `AnimalGenomeDefinitions.new()`.

Static fields (a copy of the value taken when the class is exposed): `fullGenomeDef: HashMap<String, AnimalGenomeDefinitions>`, `geneticDisorder: ArrayList<String>`.

### AnimalPartsDefinitions

`zombie.characters.animals.AnimalPartsDefinitions`, class.

Static functions, called as `AnimalPartsDefinitions.name(...)`:

- `getAllBonesDef(String animalType): ArrayList<AnimalPart>`
- `getAllPartsDef(String animalType): ArrayList<AnimalPart>`
- `getAnimalDef(String animalType): KahluaTableImpl`
- `getDef(KahluaTableImpl def, String type): ArrayList<AnimalPart>`
- `getLeather(String animalType): String`

Constructors: `AnimalPartsDefinitions.new()`.

### AnimalTracks

`zombie.characters.animals.AnimalTracks`, class.

Methods, called as `obj:name(...)`:

- `addItemToWorld(): InventoryItem`
- `addToWorld(): ArrayList<IsoAnimalTrack>`
- `addTrackingExp(IsoGameCharacter chr, boolean success): void`
- `canFindTrack(IsoGameCharacter chr): boolean`
- `getAllIsoTracks(): ArrayList<IsoAnimalTrack>`
- `getAnimalType(): String`
- `getDir(): IsoDirections`
- `getFreshnessString(int trackingLevel): String`
- `getIsoAnimalTrack(): IsoAnimalTrack`
- `getItem(): InventoryItem`
- `getMinSkill(): int`
- `getSquare(): IsoGridSquare`
- `getTimestamp(): String`
- `getTrackAge(IsoGameCharacter chr): String`
- `getTrackAgeDays(): int`
- `getTrackHours(): int`
- `getTrackItem(): String`
- `getTrackSprite(): String`
- `getTrackType(): String`
- `isAddedToWorld(): boolean`
- `isItem(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`
- `setAddedToWorld(boolean b): void`
- `setItem(InventoryItem item): void`

Static functions, called as `AnimalTracks.name(...)`:

- `addAnimalTrack(VirtualAnimal animal, AnimalTracksDefinitions.AnimalTracksType trackType): AnimalTracks`
- `addAnimalTrackAtPos(VirtualAnimal animal, int x, int y, AnimalTracksDefinitions.AnimalTracksType trackType, long timeMinus): AnimalTracks`
- `broadcastAnimalTrackToAdminsDebug(AnimalTracks track, boolean state): void`
- `getAndFindNearestTracks(IsoGameCharacter character): ArrayList<AnimalTracks>`
- `getNearestTracks(int x, int y, int radius): ArrayList<AnimalTracks>`
- `getTrackStr(String trackType): String`

Constructors: `AnimalTracks.new()`.

### BaseAnimalBehavior

`zombie.characters.animals.behavior.BaseAnimalBehavior`, class.

Methods, called as `obj:name(...)`:

- `callToHutch(IsoHutch hutch, boolean force): boolean`
- `canBeAttached(): boolean`
- `canDrinkFromTrough(IsoFeedingTrough trough): boolean`
- `canEatThis(InventoryItem item): boolean`
- `canGoToHutch(IsoHutch hutch, boolean force): boolean`
- `checkBehavior(): void`
- `checkEatBehavior(): boolean`
- `checkSit(): void`
- `doBehaviorAction(): void`
- `eatFromVehicle(): boolean`
- `fightAnimal(): void`
- `forceEatFromMom(): void`
- `forceFleeFromChr(IsoGameCharacter chr): void`
- `getNearestWaterSquare(IsoGridSquare sq): IsoGridSquare`
- `getRandomTroughList(): ArrayList<IsoFeedingTrough>`
- `getWildDropDeadTimer(): float`
- `goAttack(IsoGameCharacter fightingOpponent): void`
- `isWildAndHurt(): boolean`
- `pickRandomWanderInterval(): float`
- `resetBehaviorAction(): void`
- `setBlockMovement(boolean block): void`
- `setDoingBehavior(boolean doingBehavior): void`
- `setHourBeforeLeavingHutch(int hours): void`
- `setWildAndHurt(boolean wildAndHurt): void`
- `setWildDropDeadTimer(float wildDropDeadTimer): void`
- `spotted(IsoMovingObject other, boolean bForced, float dist): void`
- `tryAndGetGrassFloor(): IsoObject`
- `tryAndGetPuddle(int searchRadius): IsoObject`
- `update(): void`
- `updateAttackTimer(): void`
- `walkedOnSpot(): void`
- `wanderIdle(): void`

Static functions, called as `BaseAnimalBehavior.name(...)`:

- `shuffleList(ArrayList<IsoFeedingTrough> a): void`
- `shuffleListSq(ArrayList<IsoGridSquare> a): void`

Constructors: `BaseAnimalBehavior.new(IsoAnimal parent)`.

### AnimalBreed

`zombie.characters.animals.datas.AnimalBreed`, class.

Methods, called as `obj:name(...)`:

- `getFeatherItem(): String`
- `getMilkType(): String`
- `getName(): String`
- `getRottenTexture(): String`
- `getSound(String id): AnimalBreed.Sound`
- `getWoolType(): String`
- `isSoundDefined(String id): boolean`
- `isSoundUndefined(String id): boolean`
- `loadForcedGenes(KahluaTableImpl def): void`
- `loadSounds(KahluaTableImpl soundsTable): void`

Constructors: `AnimalBreed.new()`.

### AnimalData

`zombie.characters.animals.datas.AnimalData`, class.

Methods, called as `obj:name(...)`:

- `callToTrough(IsoFeedingTrough trough): void`
- `canBePregnant(): boolean`
- `canHaveBaby(): boolean`
- `canHaveMilk(): boolean`
- `checkEggs(PZCalendar realCal, boolean meta): void`
- `checkFertilizedTime(): void`
- `checkPoop(boolean meta, boolean bForce): InventoryItem`
- `checkStages(): void`
- `drink(): void`
- `drinkFromGround(): void`
- `dropFeather(boolean meta): InventoryItem`
- `eat(): void`
- `eatItem(InventoryItem item, boolean onground): void`
- `findFemaleToInseminate(PZCalendar realCal): void`
- `getAge(): int`
- `getAgeGrowModifier(): float`
- `getAgeString(IsoGameCharacter chr): String`
- `getAttachedPlayer(): IsoPlayer`
- `getAttachedTree(): IsoObject`
- `getAttachedTreeX(): int`
- `getAttachedTreeY(): int`
- `getBreed(): AnimalBreed`
- `getClutchSize(): int`
- `getDaysSurvived(): int`
- `getDebugBehaviorString(): String`
- `getFertilizedTime(): int`
- `getGeriatricPercentage(): float`
- `getGrowStage(): ArrayList<AnimalGrowStage>`
- `getHealthLoss(Float divide): float`
- `getHutchPosition(): int`
- `getInventoryIconTextureName(): String`
- `getLastImpregnatePeriod(PZCalendar realCal): int`
- `getLastPregnancyPeriod(): String`
- `getLastTimeMilkedInHour(): Float`
- `getMaxAgeGeriatric(): float`
- `getMaxMilk(): float`
- `getMaxMilkActual(): float`
- `getMaxSize(): float`
- `getMaxWeight(): float`
- `getMaxWool(): float`
- `getMilkInc(): float`
- `getMilkQuantity(): float`
- `getMinMilk(): float`
- `getMinSize(): float`
- `getMinWeight(): float`
- `getOriginalSize(): float`
- `getPreferredHutchPosition(): int`
- `getPregnancyTime(): int`
- `getPregnantPeriod(): int`
- `getRandomTroughList(): ArrayList<IsoFeedingTrough>`
- `getRegionHutch(): IsoHutch`
- `getSize(): float`
- `getTimeBeforeNextPregnancy(): int`
- `getWeight(): float`
- `getWoolInc(): float`
- `getWoolQuantity(): float`
- `grow(String newtype): void`
- `growUp(boolean meta): void`
- `haveLayingEggPeriod(): boolean`
- `hourGrow(boolean meta): void`
- `init(): void`
- `initSize(): void`
- `initStage(): void`
- `initWeight(): void`
- `isFemale(): boolean`
- `isFertilized(): boolean`
- `isInLayingEggPeriod(PZCalendar cal): boolean`
- `isPregnant(): boolean`
- `reduceHealthDueToMilk(): boolean`
- `resetEatingCheck(): void`
- `setAge(int age): void`
- `setAttachedPlayer(IsoPlayer chr): void`
- `setAttachedTree(IsoObject tree): void`
- `setBreed(AnimalBreed breed): void`
- `setCanHaveMilk(boolean canHaveMilk): void`
- `setFertilized(boolean b): void`
- `setFertilizedTime(int period): int`
- `setHutchPosition(int hutchPosition): void`
- `setMaleGenome(HashMap<String, AnimalGene> maleGenome): void`
- `setMaxMilkActual(float maxMilkActual): void`
- `setMilkQuantity(float milkQty): void`
- `setPreferredHutchPosition(int preferredHutchPosition): void`
- `setPregnancyTime(int period): void`
- `setPregnant(boolean pregnant): void`
- `setSize(float size): void`
- `setSizeForced(float size): void`
- `setWeight(float weight): void`
- `setWoolQuantity(float woolQty): void`
- `setWoolQuantity(float woolQty, boolean force): void`
- `tryInseminateInMeta(PZCalendar realCal): void`
- `update(): void`
- `updateHealth(): void`
- `updateHungerAndThirst(boolean fromMeta): void`
- `updateLastPregnancyTime(): void`
- `updateLastTimeMilked(): void`

Static functions, called as `AnimalData.name(...)`:

- `shuffleList(ArrayList<IsoFeedingTrough> a): void`

Constructors: `AnimalData.new(IsoAnimal parent, AnimalBreed breed)`.

Static fields (a copy of the value taken when the class is exposed): `FEATHER_CHANCE_PER_HOUR: int`, `HUNGER_PER_DRAINABLE_USE: float`, `ONE_DAY_MILLISECONDS: long`, `ONE_HOUR_MILLISECONDS: long`, `ONE_WEEK_MILLISECONDS: long`.

### IsoAnimal

`zombie.characters.animals.IsoAnimal`, class. Extends [IsoPlayer](/pz/build-42/modding/reference/lua-classes-characters-2#isoplayer). Also has the methods of [IsoGameCharacter](/pz/build-42/modding/reference/lua-classes-characters-2#isogamecharacter) (1,123), [IsoPlayer](/pz/build-42/modding/reference/lua-classes-characters-2#isoplayer) (370), [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (44), [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject) (165), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (385), listed on their own entries.

Methods, called as `obj:name(...)`:

- `AcceptGrapple(IGrappleable grappleAcceptor, String grappleType): void` from `IGrappleableWrapper`
- `AttemptAttack(float chargeDelta): boolean` from `IsoLivingCharacter`
- `GetAnimSetName(): String`
- `Grappled(IGrappleable grappler, HandWeapon weapon, float grappleEffectiveness, String grappleType): void` from `IGrappleableWrapper`
- `GrapplerLetGo(IGrappleable grappler, String grappleResult): void` from `IGrappleableWrapper`
- `Hit(BaseVehicle vehicle, float speed, boolean isHitFromBehind, float hitDirX, float hitDirY, boolean pushedBack, float collisionPosOnVehicleX, float collisionPosOnVehicleY): float`
- `Hit(BaseVehicle vehicle, float speed, boolean isHitFromBehind, Vector2 hitDir): float`
- `HitByAnimal(IsoAnimal animal, boolean bIgnoreDamage): void`
- `LetGoOfGrappled(String grappleResult): void` from `IGrappleableWrapper`
- `OnDeath(): void`
- `RejectGrapple(IGrappleable grappleRejector): void` from `IGrappleableWrapper`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addAcceptance(IsoPlayer chr, float acceptance): void`
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
- `addBaby(): IsoAnimal`
- `addDebugBucketOfMilk(IsoGameCharacter chr): InventoryItem`
- `addEgg(boolean meta): boolean`
- `addToWorld(): void`
- `alertOtherAnimals(IsoMovingObject chr, boolean alert): void`
- `allowsTwist(): boolean`
- `animEvent(IsoGameCharacter owner, AnimLayer layer, AnimationTrack track, AnimEvent event): void` from `IAnimEventWrappedBroadcaster`
- `animalShouldThump(): boolean`
- `attackOtherMales(): boolean`
- `calcDamage(): float`
- `canBeFeedByHand(): boolean`
- `canBeHitByVehicle(BaseVehicle impactingVehicle): boolean` from `IStateCharacter`
- `canBeKilledWithoutWeapon(): boolean`
- `canBeMilked(): boolean`
- `canBePet(): boolean`
- `canBePicked(IsoGameCharacter chr): boolean`
- `canBePutInHutch(IsoHutch hutch): boolean`
- `canBeSheared(): boolean`
- `canClimbFences(): boolean`
- `canClimbStairs(): boolean`
- `canCurrentStateRagdoll(): boolean` from `IStateCharacter`
- `canDoAction(): boolean`
- `canEatFromTrough(IsoFeedingTrough trough): InventoryItem`
- `canGoThere(IsoGridSquare sq): boolean`
- `canHaveEggs(): boolean`
- `canPoop(): boolean`
- `canRagdoll(): boolean`
- `canSlowDownVehicleWhenHit(BaseVehicle impactingVehicle): boolean` from `IStateCharacter`
- `canTransitionToState(String stateName): boolean` from `IAnimatable`
- `canUseCurrentPoseForCorpse(): boolean`
- `cancelLuring(): void`
- `carCrash(float delta, boolean front): void`
- `changeStress(float inc): void`
- `checkAlphaAndTargetAlpha(IsoPlayer other): void`
- `checkForChickenpocalypse(IsoAnimal replacingAnimal): boolean`
- `checkForWater(): boolean`
- `checkKilledByMetaPredator(int hour): boolean`
- `climbOverFence(IsoDirections dir): void`
- `containsVariable(String name): boolean` from `IAnimationVariableSourceContainer`
- `copyFrom(IsoAnimal animal): void`
- `copyGeneticDisorder(Collection<String> disorders): void`
- `copyGenome(Collection<AnimalGene> genome): void`
- `createEgg(): Food`
- `debugAgeAway(int hour): void`
- `debugForceEgg(): void`
- `debugForceSit(): void`
- `debugRandomHappyAnim(): void`
- `debugRandomIdleAnim(): void`
- `delete(): void`
- `drawDirectionLine(Vector2 dir, float length, float r, float g, float b): void`
- `drawRope(IsoGameCharacter chr): void`
- `eatFromLured(IsoPlayer chr, InventoryItem item): void`
- `feedFromHand(IsoPlayer chr, InventoryItem food): void`
- `fertilize(IsoAnimal male, boolean force): void`
- `fleeTo(IsoGridSquare sq): void`
- `forceWanderNow(): void`
- `frameStep(): void` from `ECSEntity`
- `getAcceptanceLevel(IsoPlayer chr): float`
- `getAdef(): AnimalDefinitions`
- `getAge(): int`
- `getAgeText(boolean cheat, int skillLvl): String`
- `getAllPossibleFoodFromInv(IsoGameCharacter chr): ArrayList<InventoryItem>`
- `getAnimalID(): int`
- `getAnimalOriginalSize(): float`
- `getAnimalSize(): float`
- `getAnimalSoundState(String slot): AnimalSoundState`
- `getAnimalTrailerSize(): float`
- `getAnimalType(): String`
- `getAnimalVisual(): AnimalVisual`
- `getAnimalZone(): AnimalZone`
- `getAppearanceText(boolean cheat): String`
- `getAttachmentWorldPos(String attachmentName): Position3D`
- `getAttachmentWorldPos(String attachmentName, Position3D pos): Position3D`
- `getAttackingWeapon(): HandWeapon` from `IsoLivingCharacter`
- `getBabies(): ArrayList<IsoAnimal>`
- `getBabyType(): String`
- `getBearingFromGrappledTarget(): float` from `IGrappleableWrapper`
- `getBearingToGrappledTarget(): float` from `IGrappleableWrapper`
- `getBehavior(): BaseAnimalBehavior`
- `getBloodQuantity(): float`
- `getBreed(): AnimalBreed`
- `getCharacterInputComponent(): CharacterInputComponent` from `CharacterInputComponentEntity`
- `getConnectedDZone(): ArrayList<DesignationZoneAnimal>`
- `getCorpseLength(): float`
- `getCorpseSize(): float`
- `getCurrentClutchSize(): int`
- `getCustomName(): String`
- `getDZone(): DesignationZoneAnimal`
- `getData(): AnimalData`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getEatTypePossibleFromHand(): ArrayList<String>`
- `getEggGeneMod(): float`
- `getEggsPerDay(): int`
- `getFeatherItem(): String`
- `getFeatherNumber(): int`
- `getFeedByHandAnim(): String`
- `getFeelersize(): float`
- `getFertilizedTimeMax(): int`
- `getFrameNo(): int` from `ECSEntity`
- `getFullGenome(): HashMap<String, AnimalGene>`
- `getFullGenomeList(): ArrayList<AnimalGene>`
- `getFullName(): String`
- `getGeneticDisorder(): ArrayList<String>`
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
- `getHealthText(boolean cheat, int skillLvl): String`
- `getHook(): IsoButcherHook`
- `getHunger(): float`
- `getHungerBoost(): float`
- `getHutch(): IsoHutch`
- `getInputMode(): CharacterInputMode` from `CharacterInputComponentEntity`
- `getInputMovementRate(): float` from `CharacterInputComponentEntity`
- `getInventoryIconTexture(): Texture`
- `getInventoryIconTextureName(): String`
- `getItemID(): int`
- `getJoypadBind(): int` from `CharacterInputComponentEntity`
- `getLastCellSavedToX(): int`
- `getLastCellSavedToY(): int`
- `getLastSoundRespondedTo(): WorldSoundManager.WorldSound`
- `getMate(): String`
- `getMaxClutchSize(): int`
- `getMeatRatio(): float`
- `getMilkAnimPreset(): String`
- `getMilkType(): String`
- `getMinAgeForBaby(): int`
- `getMinClutchSize(): int`
- `getMother(): IsoAnimal`
- `getNestBoxIndex(): int`
- `getNextStageAnimalType(): String`
- `getObjectName(): String`
- `getPetTimer(): float`
- `getPlayerAcceptance(IsoPlayer chr): float`
- `getPossibleLuringItems(IsoGameCharacter chr): ArrayList<InventoryItem>`
- `getRandomSquareInZone(): IsoGridSquare`
- `getSharedGrappleAnimFraction(): float` from `IGrappleableWrapper`
- `getSharedGrappleAnimNode(): String` from `IGrappleableWrapper`
- `getSharedGrappleAnimTime(): float` from `IGrappleableWrapper`
- `getSharedGrappleType(): String` from `IGrappleableWrapper`
- `getStress(): float`
- `getStressTxt(boolean cheat, int skillLvl): String`
- `getThirst(): float`
- `getThirstBoost(): float`
- `getThumpDelay(): float`
- `getTypeAndBreed(): String`
- `getUsedGene(String name): AnimalAllele`
- `getVariable(String key): IAnimationVariableSlot` from `IAnimationVariableSourceContainer`
- `getVariableBoolean(AnimationVariableHandle handle): boolean` from `IAnimationVariableSource`
- `getVariableBoolean(String name): boolean` from `IAnimationVariableSourceContainer`
- `getVariableBoolean(String key, boolean defaultVal): boolean` from `IAnimationVariableSourceContainer`
- `getVariableEnum(String key, EnumType defaultVal): EnumType` from `IAnimationVariableSource`
- `getVariableFloat(String name, float defaultVal): float` from `IAnimationVariableSourceContainer`
- `getVariableString(String name): String` from `IAnimationVariableSourceContainer`
- `getZone(): DesignationZone`
- `getZoneAcceptance(): float`
- `hasAnimalZone(): boolean`
- `hasCurrentState(): boolean` from `IStateCharacter`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasGeneticDisorder(String gd): boolean`
- `hasUdder(): boolean`
- `haveEnoughMilkToFeedFrom(): boolean`
- `haveHappyAnim(): boolean`
- `haveMatingSeason(): boolean`
- `hitConsequences(HandWeapon weapon, IsoGameCharacter wielder, boolean bIgnoreDamage, float damage, boolean bRemote): void`
- `init(AnimalBreed breed): void`
- `initializeStates(): void`
- `isAimKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isAlerted(): boolean`
- `isAllowRun(): boolean` from `CharacterInputComponentEntity`
- `isAllowSprint(): boolean` from `CharacterInputComponentEntity`
- `isAnimalAttacking(): boolean`
- `isAnimalEating(): boolean`
- `isAnimalMoving(): boolean`
- `isAnimalRunningToDeathPosition(): boolean`
- `isAnimalSitting(): boolean`
- `isAnyAimKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isAttackButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isBaby(): boolean`
- `isBeingGrappled(): boolean` from `IGrappleableWrapper`
- `isBeingGrappledBy(IGrappleable grappledBy): boolean` from `IGrappleableWrapper`
- `isBuildButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isBuildButtonReleased(): boolean` from `CharacterInputComponentEntity`
- `isChangeCharacterKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isCollidedWithPushableThisFrame(): boolean` from `IsoLivingCharacter`
- `isCrouchButtonPressed(): boolean` from `CharacterInputComponentEntity`
- `isCurrentStateAttacking(): boolean` from `IStateCharacter`
- `isCurrentStateMoving(): boolean` from `IStateCharacter`
- `isDoContinueGrapple(): boolean` from `IGrappleableWrapper`
- `isDoGrapple(): boolean` from `IGrappleableWrapper`
- `isDoHandToHandAttack(): boolean` from `IsoLivingCharacter`
- `isDoShove(): boolean` from `IsoLivingCharacter`
- `isDoStomp(): boolean` from `IsoLivingCharacter`
- `isExistInTheWorld(): boolean`
- `isF12KeyDown(): boolean` from `CharacterInputComponentEntity`
- `isForceAim(): boolean` from `CharacterInputComponentEntity`
- `isForceRun(): boolean` from `CharacterInputComponentEntity`
- `isForceSprint(): boolean` from `CharacterInputComponentEntity`
- `isGeriatric(): boolean`
- `isGrappling(): boolean` from `IGrappleableWrapper`
- `isGrapplingTarget(IGrappleable grapplingTarget): boolean` from `IGrappleableWrapper`
- `isGrapplingWhileAiming(): boolean` from `IsoLivingCharacter`
- `isHappy(): boolean`
- `isHeld(): boolean`
- `isIgnoreInputsForDirection(): boolean` from `CharacterInputComponentEntity`
- `isIgnoringAimingInput(): boolean` from `CharacterInputComponentEntity`
- `isInMatingSeason(): boolean`
- `isInRange(IPositional other, float range): boolean` from `IPositional`
- `isInputMoveAxisApplied(): boolean` from `CharacterInputComponentEntity`
- `isInteractButtonClicked(): boolean` from `CharacterInputComponentEntity`
- `isInteractButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isInteractButtonPressed(): boolean` from `CharacterInputComponentEntity`
- `isInvincible(): boolean`
- `isJoypadButtonsActive(): boolean` from `CharacterInputComponentEntity`
- `isJoypadIgnoreAimUntilCentered(): boolean` from `CharacterInputComponentEntity`
- `isLocalPlayer(): boolean`
- `isManualFloorAtkButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isMeleeButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isMoveForwardOnZone(): boolean`
- `isOnHook(): boolean`
- `isPerformingAnyGrappleAnimation(): boolean` from `IGrappleableWrapper`
- `isPerformingGrappleGrabAnimation(): boolean` from `IGrappleableWrapper`
- `isPrecisionAimKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isRoadKill(): boolean`
- `isRunButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isShiftKeyDown(): boolean` from `CharacterInputComponentEntity`
- `isShoving(): boolean` from `IsoLivingCharacter`
- `isShovingWhileAiming(): boolean` from `IsoLivingCharacter`
- `isSprintButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isUnarmed(): boolean` from `IsoLivingCharacter`
- `isVariable(String name, String val): boolean` from `IAnimationVariableSourceContainer`
- `isWalkToButtonDown(): boolean` from `CharacterInputComponentEntity`
- `isWild(): boolean`
- `killed(IsoPlayer chr): void`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `milkAnimal(IsoGameCharacter chr, InventoryItem bucket): InventoryItem`
- `needHutch(): boolean`
- `needMom(): boolean`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onPlayBreedSoundEvent(String id): void`
- `pathFailed(): void`
- `pathToCharacter(IsoGameCharacter target): void`
- `pathToLocation(int x, int y, int z): void`
- `pathToTrough(IsoFeedingTrough trough): void`
- `petAnimal(IsoPlayer chr): void`
- `petTimerDone(): boolean`
- `playBreedSound(String id): long`
- `playDeadSound(): void`
- `playNextFootstepSound(): void`
- `playSoundDebug(): void`
- `playStressedSound(): void`
- `randomizeAge(): void`
- `readyToBeMilked(): boolean`
- `readyToBeSheared(): boolean`
- `reattachBackToHook(): void`
- `remove(): void`
- `removeBaby(IsoAnimal baby): void`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromUpdateLists(): void`
- `removeFromWorld(): void`
- `renderShadow(float x, float y, float z): void`
- `renderlast(): void`
- `resetGrappleStateToDefault(String grappleResult): void` from `IGrappleableWrapper`
- `respondToSound(): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `save(ByteBuffer output, boolean isDebugSave, boolean serialize): void`
- `sendExtraUpdateToClients(): void`
- `setAgeDebug(int newAge): void`
- `setAllowRun(boolean allowRun): void` from `CharacterInputComponentEntity`
- `setAllowSprint(boolean allowSprint): void` from `CharacterInputComponentEntity`
- `setAnimalAttackingOnClient(boolean value): void`
- `setAnimalID(int id): void`
- `setAnimalZone(AnimalZone zone): void`
- `setCustomName(String customName): void`
- `setDZone(DesignationZoneAnimal dZone): void`
- `setData(AnimalData newData): void`
- `setDebugAcceptance(IsoPlayer chr, float acceptance): void`
- `setDebugStress(float stress): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setDoContinueGrapple(boolean doContinueGrapple): void` from `IGrappleableWrapper`
- `setDoGrapple(boolean doGrapple): void` from `IGrappleableWrapper`
- `setDoGrappleLetGo(): void` from `IGrappleable`
- `setDoShove(boolean bDoShove): void` from `IsoLivingCharacter`
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
- `setHealth(float health): void`
- `setHook(IsoButcherHook hook): void`
- `setIgnoreAimingInput(boolean b): void` from `CharacterInputComponentEntity`
- `setIgnoreInputsForDirection(boolean ignoreInputsForDirection): void` from `CharacterInputComponentEntity`
- `setIsAlerted(boolean b): void`
- `setIsInvincible(boolean b): void`
- `setIsRoadKill(boolean roadKill): void`
- `setItemID(int itemId): void`
- `setJoypadBind(int joypadBind): void` from `CharacterInputComponentEntity`
- `setJoypadButtonsActive(boolean joypadMovementActive): void` from `CharacterInputComponentEntity`
- `setJoypadIgnoreAim(boolean ignore): void` from `CharacterInputComponentEntity`
- `setJoypadIgnoreAimUntilCentered(boolean ignore): void` from `CharacterInputComponentEntity`
- `setLastCellSavedTo(int x, int y): void`
- `setMaxSizeDebug(): void`
- `setMother(IsoAnimal mom): void`
- `setMoveForwardOnZone(boolean b): void`
- `setOnHook(boolean onhook): void`
- `setPerformingGrappleGrabAnimation(boolean grappleGrabAnim): void` from `IGrappleableWrapper`
- `setPosition(Vector3 position): void` from `IGrappleable`
- `setSharedGrappleAnimFraction(float grappleAnimFraction): void` from `IGrappleableWrapper`
- `setSharedGrappleAnimNode(String sharedGrappleAnimNode): void` from `IGrappleableWrapper`
- `setSharedGrappleAnimTime(float grappleAnimTime): void` from `IGrappleableWrapper`
- `setSharedGrappleType(String sharedGrappleType): void` from `IGrappleableWrapper`
- `setShouldBeSkeleton(boolean shouldBeSkeleton): void`
- `setShouldFollowWall(boolean b): void`
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
- `setWild(boolean b): void`
- `shearAnimal(IsoGameCharacter chr, InventoryItem shear): boolean`
- `shouldAnimalStressAboveGround(): boolean`
- `shouldBeSkeleton(): boolean`
- `shouldBecomeZombieAfterDeath(): boolean`
- `shouldBreakObstaclesDuringPathfinding(): boolean`
- `shouldCreateZone(): boolean`
- `shouldFollowWall(): boolean`
- `shouldStartFollowWall(): boolean`
- `spotted(IsoMovingObject other, boolean bForced, float dist): void`
- `stopAllMovementNow(): void`
- `test(): void`
- `testCollideWithVehicles(BaseVehicle vehicle, BaseVehicle.HitVars hitVars): boolean`
- `toggleForceAim(): boolean` from `CharacterInputComponentEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `tryLure(IsoPlayer chr, InventoryItem item): void`
- `tryThump(IsoGridSquare square): boolean`
- `unloaded(): void`
- `update(): void`
- `updateLOS(): void`
- `updateLastTimeSinceUpdate(): void`
- `updateLoopingSounds(): void`
- `updateRunLoopingSound(): void`
- `updateStatsAway(int hours): void`
- `updateStress(): void`
- `updateVocalProperties(): void`
- `updateWalkLoopingSound(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`
- `wasRunButtonDown(): boolean` from `CharacterInputComponentEntity`

Static functions, called as `IsoAnimal.name(...)`:

- `addAnimalPart(AnimalPart part, IsoPlayer player, IsoDeadBody carcass): void`
- `createAnimalFromCorpse(IsoDeadBody body): IsoAnimal`
- `modifyMeat(Food item, float size, float meatRatio): void`

Constructors: `IsoAnimal.new(IsoCell cell)`, `IsoAnimal.new(IsoCell cell, int x, int y, int z, String type, String breedName)`, `IsoAnimal.new(IsoCell cell, int x, int y, int z, String type, String breedName, boolean skeleton)`, `IsoAnimal.new(IsoCell cell, int x, int y, int z, String type, AnimalBreed breed)`, `IsoAnimal.new(IsoCell cell, int x, int y, int z, String type, AnimalBreed breed, boolean skeleton)`.

Static fields (a copy of the value taken when the class is exposed): `AwkwardGlovesStrengthDivisor: int`, `DEATH_MUSIC_NAME: String`, `DEFAULT_ENTITY_DISPLAY_NAME: String`, `GlovesStrengthBonus: int`, `HUMANOID_SCREEN_CHEST_HEIGHT: float`, `HUMANOID_WORLD_CHEST_HEIGHT: float`, `INVALID_SQUARE_XY: int`, `MAX: short`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `NoSound: boolean`, `RENDER_OFFSET_X: int`, `RENDER_OFFSET_Y: int`, `SOUND_RADIUS_MULTIPLIER_WILD: float`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `WALK_SPEED_DEFAULT: float`, `WALK_SPEED_SLOW: float`, `assumedPlayer: int`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `isTestAIMode: boolean`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `numPlayers: int`, `players: IsoPlayer[]`, `rmod: float`, `s_maxPossibleTwist: float`, `tempVector2: Vector2`, `treeSoundMgr: TreeSoundManager`.

### VirtualAnimal

`zombie.characters.animals.VirtualAnimal`, class.

Methods, called as `obj:name(...)`:

- `findAnimalById(int animalID): IsoAnimal`
- `forceEat(): void`
- `forceRest(): void`
- `forceStopEat(): void`
- `forceWakeUp(): void`
- `getEndEatPeriod(): String`
- `getEndSleepPeriod(): String`
- `getNextEatPeriod(): String`
- `getNextSleepPeriod(): String`
- `getState(): VirtualAnimalState`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `isEating(): boolean`
- `isRemoved(): boolean`
- `isSleeping(): boolean`
- `isTimeToEat(): boolean`
- `isTimeToSleep(): boolean`
- `setRemoved(boolean bRemoved): void`
- `setState(VirtualAnimalState state): void`
- `setX(float x): void`
- `setY(float y): void`
- `setZ(float z): void`

Constructors: `VirtualAnimal.new()`.

### AttachedItem

`zombie.characters.AttachedItems.AttachedItem`, class.

Methods, called as `obj:name(...)`:

- `getItem(): InventoryItem`
- `getLocation(): String`

Constructors: `AttachedItem.new(String location, InventoryItem item)`.

### AttachedItems

`zombie.characters.AttachedItems.AttachedItems`, class.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `contains(InventoryItem item): boolean`
- `copyFrom(AttachedItems other): void`
- `forEach(Consumer<AttachedItem> c): void`
- `get(int index): AttachedItem`
- `getGroup(): AttachedLocationGroup`
- `getItem(String location): InventoryItem`
- `getItemByIndex(int index): InventoryItem`
- `getLocation(InventoryItem item): String`
- `isEmpty(): boolean`
- `remove(InventoryItem item): void`
- `setItem(String location, InventoryItem item): void`
- `size(): int`

Constructors: `AttachedItems.new(AttachedItems other)`, `AttachedItems.new(AttachedLocationGroup group)`.

### AttachedLocation

`zombie.characters.AttachedItems.AttachedLocation`, class.

Methods, called as `obj:name(...)`:

- `getAttachmentName(): String`
- `getId(): String`
- `setAttachmentName(String attachmentName): void`

Constructors: `AttachedLocation.new(AttachedLocationGroup group, String id)`.

### AttachedLocationGroup

`zombie.characters.AttachedItems.AttachedLocationGroup`, class.

Methods, called as `obj:name(...)`:

- `checkValid(String locationId): void`
- `getLocation(String locationId): AttachedLocation`
- `getLocationByIndex(int index): AttachedLocation`
- `getOrCreateLocation(String locationId): AttachedLocation`
- `indexOf(String locationId): int`
- `size(): int`

Constructors: `AttachedLocationGroup.new(String id)`.

### AttachedLocations

`zombie.characters.AttachedItems.AttachedLocations`, class.

Static functions, called as `AttachedLocations.name(...)`:

- `Reset(): void`
- `getGroup(String id): AttachedLocationGroup`

Constructors: `AttachedLocations.new()`.

### BodyDamage

`zombie.characters.BodyDamage.BodyDamage`, class.

Methods, called as `obj:name(...)`:

- `AddDamage(int bodyPartIndex, float val): void`
- `AddDamage(BodyPartType bodyPart, float val): void`
- `AddGeneralHealth(float val): void`
- `AddRandomDamage(): void`
- `AddRandomDamageFromZombie(IsoZombie zombie, String hitReaction, int partIndex): boolean`
- `DamageFromAnimal(IsoAnimal wielder): void`
- `DamageFromWeapon(HandWeapon weapon, int partIndex): void`
- `DisableFakeInfection(int bodyPartIndex): void`
- `DrawUntexturedQuad(int x, int y, int width, int height, float r, float g, float b, float a): void`
- `GetBaseCorpseSickness(): float`
- `HasInjury(): boolean`
- `IncreasePanic(int numNewZombiesSeen): void`
- `IncreasePanicFloat(float delta): void`
- `IsBandaged(int bodyPartIndex): boolean`
- `IsBandaged(BodyPartType bodyPart): boolean`
- `IsBitten(int bodyPartIndex): boolean`
- `IsBitten(BodyPartType bodyPart): boolean`
- `IsBleeding(int bodyPartIndex): boolean`
- `IsBleeding(BodyPartType bodyPart): boolean`
- `IsBleedingStemmed(int bodyPartIndex): boolean`
- `IsBleedingStemmed(BodyPartType bodyPart): boolean`
- `IsCauterized(int bodyPartIndex): boolean`
- `IsCauterized(BodyPartType bodyPart): boolean`
- `IsCut(BodyPartType bodyPart): boolean`
- `IsDeepWounded(BodyPartType bodyPart): boolean`
- `IsFakeInfected(): boolean`
- `IsFakeInfected(int bodyPartIndex): boolean`
- `IsInfected(): boolean`
- `IsInfected(int bodyPartIndex): boolean`
- `IsInfected(BodyPartType bodyPart): boolean`
- `IsOnFire(): boolean`
- `IsScratched(int bodyPartIndex): boolean`
- `IsScratched(BodyPartType bodyPart): boolean`
- `IsSneezingCoughing(): int`
- `IsStitched(int bodyPartIndex): boolean`
- `IsStitched(BodyPartType bodyPart): boolean`
- `IsWounded(int bodyPartIndex): boolean`
- `IsWounded(BodyPartType bodyPart): boolean`
- `JustAteFood(Food newFood): void`
- `JustAteFood(Food newFood, float percentage): void`
- `JustAteFood(Food newFood, float percentage, boolean useUtensil): void`
- `JustDrankBooze(Food food, float percentage): void`
- `JustDrankBoozeFluid(float alcohol): void`
- `JustReadSomething(Literature literature): void`
- `JustTookPainMeds(): void`
- `JustTookPill(InventoryItem pill): void`
- `OnFire(boolean onFire): void`
- `ReduceGeneralHealth(float val): void`
- `ReducePanic(): void`
- `RestoreToFullHealth(): void`
- `SetBandaged(int bodyPartIndex, boolean bandaged, float bandageLife, boolean isAlcoholic, String bandageType): void`
- `SetBitten(int bodyPartIndex, boolean bitten): void`
- `SetBitten(int bodyPartIndex, boolean bitten, boolean infected): void`
- `SetBitten(BodyPartType bodyPart, boolean bitten): void`
- `SetBleeding(int bodyPartIndex, boolean bleeding): void`
- `SetBleeding(BodyPartType bodyPart, boolean bleeding): void`
- `SetBleedingStemmed(int bodyPartIndex, boolean bleedingStemmed): void`
- `SetBleedingStemmed(BodyPartType bodyPart, boolean bleedingStemmed): void`
- `SetCauterized(int bodyPartIndex, boolean cauterized): void`
- `SetCauterized(BodyPartType bodyPart, boolean cauterized): void`
- `SetCut(int bodyPartIndex, boolean cut): void`
- `SetScratched(int bodyPartIndex, boolean scratched): void`
- `SetScratched(BodyPartType bodyPart, boolean scratched): void`
- `SetScratchedFromWeapon(int bodyPartIndex, boolean scratched): void`
- `SetWounded(int bodyPartIndex, boolean wounded): void`
- `SetWounded(BodyPartType bodyPart, boolean wounded): void`
- `ShowDebugInfo(): void`
- `TriggerSneezeCough(): void`
- `Update(): void`
- `UpdateBoredom(): void`
- `UpdateCold(): void`
- `UpdateDiscomfort(): void`
- `UpdateDraggingCorpse(): void`
- `UpdatePanicState(): void`
- `UpdateStrength(): void`
- `UpdateWetness(): void`
- `UseBandageOnMostNeededPart(): boolean`
- `WasBurntToDeath(): boolean`
- `addStiffness(BodyPart part, float stiffness): void`
- `addStiffness(BodyPartType partType, float stiffness): void`
- `applyDamageFromWeapon(int partIndex, float damage, int damageType, float pain): void`
- `areBodyPartsBleeding(BodyPartType partA, BodyPartType partB): boolean`
- `calculateOverallHealth(): void`
- `decreaseBodyWetness(float amount): void`
- `doBodyPartsHaveInjuries(BodyPartType partA, BodyPartType partB): boolean`
- `doesBodyPartHaveInjury(BodyPartType part): boolean`
- `getApparentInfectionLevel(): float`
- `getBodyPart(BodyPartType type): BodyPart`
- `getBodyPartHealth(int bodyPartIndex): float`
- `getBodyPartHealth(BodyPartType bodyPart): float`
- `getBodyPartName(int bodyPartIndex): String`
- `getBodyPartName(BodyPartType bodyPart): String`
- `getBodyParts(): ArrayList<BodyPart>`
- `getBodyPartsLastState(BodyPartType type): BodyPartLast`
- `getBoredomDecreaseFromReading(): float`
- `getCatchACold(): float`
- `getColdDamageStage(): float`
- `getColdProgressionRate(): float`
- `getColdReduction(): float`
- `getColdSneezeTimerMax(): int`
- `getColdSneezeTimerMin(): int`
- `getColdStrength(): float`
- `getContinualPainIncrease(): float`
- `getCurrentNumZombiesVisible(): int`
- `getDamageModCount(): int`
- `getDrunkIncreaseValue(): float`
- `getDrunkReductionValue(): float`
- `getGeneralWoundInfectionLevel(): float`
- `getHealth(): float`
- `getHealthFromFood(): float`
- `getHealthFromFoodTimer(): float`
- `getHealthReductionFromSevereBadMoodles(): float`
- `getInfectionGrowthRate(): float`
- `getInfectionMortalityDuration(): float`
- `getInfectionTime(): float`
- `getInitialBitePain(): float`
- `getInitialScratchPain(): float`
- `getInitialThumpPain(): float`
- `getInitialWoundPain(): float`
- `getMildColdSneezeTimerMax(): int`
- `getMildColdSneezeTimerMin(): int`
- `getNastyColdSneezeTimerMax(): int`
- `getNastyColdSneezeTimerMin(): int`
- `getNumPartsBitten(): int`
- `getNumPartsBleeding(): int`
- `getNumPartsScratched(): int`
- `getOldNumZombiesVisible(): int`
- `getOverallBodyHealth(): float`
- `getPainReduction(): float`
- `getPainReductionFromMeds(): float`
- `getPanicIncreaseValue(): float`
- `getPanicIncreaseValueFrame(): float`
- `getPanicReductionValue(): float`
- `getParentChar(): IsoGameCharacter`
- `getReducedHealthAddition(): float`
- `getRemotePainLevel(): int`
- `getSeverlyReducedHealthAddition(): float`
- `getSleepingHealthAddition(): float`
- `getSmokerSneezeTimerMax(): int`
- `getSmokerSneezeTimerMin(): int`
- `getSneezeCoughActive(): int`
- `getSneezeCoughDelay(): int`
- `getSneezeCoughTime(): int`
- `getStandardHealthAddition(): float`
- `getStandardHealthFromFoodTime(): int`
- `getStandardPainReductionWhenWell(): float`
- `getThermoregulator(): Thermoregulator`
- `getTimeToSneezeOrCough(): float`
- `getWasDraggingCorpse(): boolean`
- `increaseBodyWetness(float amount): void`
- `isBodyPartBleeding(BodyPartType part): boolean`
- `isBurntToDeath(): boolean`
- `isHasACold(): boolean`
- `isInf(): boolean`
- `isInfected(): boolean`
- `isIsFakeInfected(): boolean`
- `isIsOnFire(): boolean`
- `isNeckBleeding(): boolean`
- `isReduceFakeInfection(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `loadMainFields(ByteBuffer input, int worldVersion): void`
- `pickMortalityDuration(): float`
- `save(ByteBuffer output): void`
- `saveMainFields(ByteBuffer output): void`
- `setBodyPartsLastState(): void`
- `setBoredomDecreaseFromReading(float boredomDecreaseFromReading): void`
- `setBurntToDeath(boolean burntToDeath): void`
- `setCatchACold(float catchACold): void`
- `setColdDamageStage(float coldDamageStage): void`
- `setColdProgressionRate(float coldProgressionRate): void`
- `setColdReduction(float coldReduction): void`
- `setColdSneezeTimerMax(int coldSneezeTimerMax): void`
- `setColdSneezeTimerMin(int coldSneezeTimerMin): void`
- `setColdStrength(float coldStrength): void`
- `setContinualPainIncrease(float continualPainIncrease): void`
- `setCurrentNumZombiesVisible(int currentNumZombiesVisible): void`
- `setDamageModCount(int damageModCount): void`
- `setDrunkIncreaseValue(float drunkIncreaseValue): void`
- `setDrunkReductionValue(float drunkReductionValue): void`
- `setHasACold(boolean hasACold): void`
- `setHealthFromFood(float healthFromFood): void`
- `setHealthFromFoodTimer(float healthFromFoodTimer): void`
- `setHealthReductionFromSevereBadMoodles(float healthReductionFromSevereBadMoodles): void`
- `setInf(boolean inf): void`
- `setInfected(boolean infected): void`
- `setInfectionGrowthRate(float infectionGrowthRate): void`
- `setInfectionMortalityDuration(float worldHours): void`
- `setInfectionTime(float worldHours): void`
- `setInitialBitePain(float initialBitePain): void`
- `setInitialScratchPain(float initialScratchPain): void`
- `setInitialThumpPain(float initialThumpPain): void`
- `setInitialWoundPain(float initialWoundPain): void`
- `setIsFakeInfected(boolean isFakeInfected): void`
- `setIsOnFire(boolean isOnFire): void`
- `setMildColdSneezeTimerMax(int mildColdSneezeTimerMax): void`
- `setMildColdSneezeTimerMin(int mildColdSneezeTimerMin): void`
- `setNastyColdSneezeTimerMax(int nastyColdSneezeTimerMax): void`
- `setNastyColdSneezeTimerMin(int nastyColdSneezeTimerMin): void`
- `setOldNumZombiesVisible(int oldNumZombiesVisible): void`
- `setOverallBodyHealth(float overallBodyHealth): void`
- `setPainReduction(float painReduction): void`
- `setPainReductionFromMeds(float painReductionFromMeds): void`
- `setPanicIncreaseValue(float panicIncreaseValue): void`
- `setPanicReductionValue(float panicReductionValue): void`
- `setReduceFakeInfection(boolean reduceFakeInfection): void`
- `setReducedHealthAddition(float reducedHealthAddition): void`
- `setRemotePainLevel(int painLevel): void`
- `setScratchedWindow(): BodyPart`
- `setSeverlyReducedHealthAddition(float severlyReducedHealthAddition): void`
- `setSleepingHealthAddition(float sleepingHealthAddition): void`
- `setSneezeCoughActive(int sneezeCoughActive): void`
- `setSneezeCoughDelay(int sneezeCoughDelay): void`
- `setSneezeCoughTime(int sneezeCoughTime): void`
- `setStandardHealthAddition(float standardHealthAddition): void`
- `setStandardHealthFromFoodTime(int standardHealthFromFoodTime): void`
- `setStandardPainReductionWhenWell(float standardPainReductionWhenWell): void`
- `setTimeToSneezeOrCough(float timeToSneezeOrCough): void`
- `setWasDraggingCorpse(boolean wasDraggingCorpse): void`
- `splatBloodFloorBig(): void`

Static functions, called as `BodyDamage.name(...)`:

- `damageFromSpikedArmor(IsoGameCharacter owner, IsoGameCharacter target, int partIndex, HandWeapon weapon): void`
- `getSicknessFromCorpsesRate(int corpseCount): float`

Constructors: `BodyDamage.new(IsoGameCharacter parentCharacter)`.

Static fields (a copy of the value taken when the class is exposed): `InfectionLevelToZombify: float`.

### BodyPart

`zombie.characters.BodyDamage.BodyPart`, class.

Methods, called as `obj:name(...)`:

- `AddDamage(float val): void`
- `AddHealth(float val): void`
- `DamageUpdate(): void`
- `DisableFakeInfection(): void`
- `HasInjury(): boolean`
- `IsBleedingStemmed(): boolean`
- `IsCauterized(): boolean`
- `IsFakeInfected(): boolean`
- `IsInfected(): boolean`
- `ReduceHealth(float val): void`
- `RestoreToFullHealth(): void`
- `SetBitten(boolean bitten): void`
- `SetBitten(boolean bitten, boolean infected): void`
- `SetBleedingStemmed(boolean bleedingStemmed): void`
- `SetCauterized(boolean cauterized): void`
- `SetFakeInfected(boolean inf): void`
- `SetHealth(float newHealth): void`
- `SetInfected(boolean inf): void`
- `SetScratchedWeapon(boolean scratched): void`
- `SetScratchedWindow(boolean scratched): void`
- `addStiffness(float stiffness): void`
- `bandaged(): boolean`
- `bitten(): boolean`
- `bleeding(): boolean`
- `damageFromFirearm(float damage): void`
- `deepWounded(): boolean`
- `generateBleeding(): void`
- `generateDeepShardWound(): void`
- `generateDeepWound(): void`
- `generateFracture(float fractureTime): void`
- `generateFractureNew(float fractureTime): void`
- `generateZombieInfection(int baseChance): void`
- `getAdditionalPain(): float`
- `getAdditionalPain(boolean includeStiffness): float`
- `getAlcoholLevel(): float`
- `getBandageLife(): float`
- `getBandageNeededDamageLevel(): float`
- `getBandageType(): String`
- `getBiteTime(): float`
- `getBleedingTime(): float`
- `getBurnSpeedModifier(): float`
- `getBurnTime(): float`
- `getComfreyFactor(): float`
- `getCutSpeedModifier(): float`
- `getCutTime(): float`
- `getDamageScaler(): float`
- `getDeepWoundSpeedModifier(): float`
- `getDeepWoundTime(): float`
- `getDistToCore(): float`
- `getFractureTime(): float`
- `getGarlicFactor(): float`
- `getHealth(): float`
- `getIndex(): int`
- `getInnerTemperature(): float`
- `getLastTimeBurnWash(): float`
- `getPain(): float`
- `getParentChar(): IsoGameCharacter`
- `getPlantainFactor(): float`
- `getScratchSpeedModifier(): float`
- `getScratchTime(): float`
- `getSkinSurface(): float`
- `getSkinTemperature(): float`
- `getSplintFactor(): float`
- `getSplintItem(): String`
- `getStiffness(): float`
- `getStitchTime(): float`
- `getThermalNode(): Thermoregulator.ThermalNode`
- `getType(): BodyPartType`
- `getWetness(): float`
- `getWoundInfectionLevel(): float`
- `hasBloodyClothing(): boolean`
- `hasDirtyClothing(): boolean`
- `haveBullet(): boolean`
- `haveGlass(): boolean`
- `isBandageDirty(): boolean`
- `isBurnt(): boolean`
- `isCut(): boolean`
- `isDeepWounded(): boolean`
- `isGetBandageXp(): boolean`
- `isGetSplintXp(): boolean`
- `isGetStitchXp(): boolean`
- `isInfectedWound(): boolean`
- `isNeedBurnWash(): boolean`
- `isSplint(): boolean`
- `manipulatingUsername(): String`
- `scratched(): boolean`
- `setAdditionalPain(float additionalPain): void`
- `setAlcoholLevel(float alcoholLevel): void`
- `setBandageLife(float bandageLife): void`
- `setBandageType(String bandageType): void`
- `setBandaged(boolean bandaged, float bandageLife): void`
- `setBandaged(boolean bandaged, float bandageLife, boolean isAlcoholic, String bandageType): void`
- `setBiteTime(float biteTime): void`
- `setBleeding(boolean bleeding): void`
- `setBleedingTime(float bleedingTime): void`
- `setBurnSpeedModifier(float burnSpeedModifier): void`
- `setBurnTime(float burnTime): void`
- `setBurned(): void`
- `setComfreyFactor(float comfreyFactor): void`
- `setCut(boolean cut): void`
- `setCut(boolean cut, boolean forceNoInfection): void`
- `setCutSpeedModifier(float cutSpeedModifier): void`
- `setCutTime(float cutTime): void`
- `setDeepWoundSpeedModifier(float deepWoundSpeedModifier): void`
- `setDeepWoundTime(float deepWoundTime): void`
- `setDeepWounded(boolean wounded): void`
- `setFractureTime(float fractureTime): void`
- `setGarlicFactor(float garlicFactor): void`
- `setGetBandageXp(boolean getBandageXp): void`
- `setGetSplintXp(boolean getSplintXp): void`
- `setGetStitchXp(boolean getStitchXp): void`
- `setHaveBullet(boolean haveBullet, int doctorLevel): void`
- `setHaveGlass(boolean haveGlass): void`
- `setInfectedWound(boolean infectedWound): void`
- `setLastTimeBurnWash(float lastTimeBurnWash): void`
- `setManipulatingUsername(String manipulatingUsername): void`
- `setNeedBurnWash(boolean needBurnWash): void`
- `setPlantainFactor(float plantainFactor): void`
- `setScratchSpeedModifier(float scratchSpeedModifier): void`
- `setScratchTime(float scratchTime): void`
- `setScratched(boolean scratched, boolean forceNoInfection): void`
- `setSplint(boolean splint, float splintFactor): void`
- `setSplintFactor(float splintFactor): void`
- `setSplintItem(String splintItem): void`
- `setStiffness(float stiffness): void`
- `setStitchTime(float stitchTime): void`
- `setStitched(boolean stitched): void`
- `setWetness(float wetness): void`
- `setWoundInfectionLevel(float infectedWound): void`
- `stitched(): boolean`
- `sync(BodyPart other, BodyDamageSync.Updater updater): void`
- `sync(ByteBufferReader bb, byte id): void`
- `syncWrite(ByteBufferWriter bb, int id): void`

Constructors: `BodyPart.new(BodyPartType partType, IsoGameCharacter parent)`.

### BodyPartType

`zombie.characters.BodyDamage.BodyPartType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getBandageModel(): String`
- `getBiteWoundModel(CharacterGender gender): String`
- `getCutWoundModel(CharacterGender gender): String`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getScratchWoundModel(CharacterGender gender): String`
- `hashCode(): int` from `Enum`
- `index(): int`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `BodyPartType.name(...)`:

- `FromIndex(int index): BodyPartType`
- `FromString(String str): BodyPartType`
- `GetDistToCore(BodyPartType bodyPartType): float`
- `GetMaxActionPenalty(BodyPartType bodyPartType): float`
- `GetMaxMovementPenalty(BodyPartType bodyPartType): float`
- `GetSkinSurface(BodyPartType bodyPartType): float`
- `GetUmbrellaMod(BodyPartType bodyPartType): float`
- `ToIndex(BodyPartType bpt): int`
- `ToString(BodyPartType bpt): String`
- `getBleedingTimeModifyer(int index): float`
- `getDamageModifyer(int index): float`
- `getDisplayName(BodyPartType bpt): String`
- `getPainModifyer(int index): float`
- `getRandom(): BodyPartType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): BodyPartType`
- `values(): BodyPartType[]`

Enum values (read as `BodyPartType.VALUE`): `Foot_L`, `Foot_R`, `ForeArm_L`, `ForeArm_R`, `Groin`, `Hand_L`, `Hand_R`, `Head`, `LowerLeg_L`, `LowerLeg_R`, `MAX`, `Neck`, `Torso_Lower`, `Torso_Upper`, `UpperArm_L`, `UpperArm_R`, `UpperLeg_L`, `UpperLeg_R`.

### Fitness

`zombie.characters.BodyDamage.Fitness`, class.

Methods, called as `obj:name(...)`:

- `exerciseRepeat(): void`
- `getCurrentExe(): Fitness.FitnessExercise`
- `getCurrentExeStiffnessInc(String type): float`
- `getCurrentExeStiffnessTimer(String type): int`
- `getParent(): IsoGameCharacter`
- `getRegularity(String type): float`
- `getRegularityMap(): HashMap<String, Float>`
- `incFutureStiffness(): void`
- `incRegularity(): void`
- `incStats(): void`
- `init(): void`
- `initRegularityMapProfession(): void`
- `load(ByteBuffer input, int worldVersion): void`
- `onGoingStiffness(): boolean`
- `reduceEndurance(): void`
- `removeStiffnessValue(String type): void`
- `resetValues(): void`
- `save(ByteBuffer output): void`
- `setCurrentExercise(String type): void`
- `setParent(IsoGameCharacter parent): void`
- `setRegularityMap(HashMap<String, Float> regularityMap): void`
- `update(): void`

Constructors: `Fitness.new(IsoGameCharacter parent)`.

### Metabolics

`zombie.characters.BodyDamage.Metabolics`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getBtuHr(): float`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getMet(): float`
- `getW(): float`
- `getWm2(): float`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `Metabolics.name(...)`:

- `MetToBtuHr(float met): float`
- `MetToW(float met): float`
- `MetToWm2(float met): float`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): Metabolics`
- `values(): Metabolics[]`

Enum values (read as `Metabolics.VALUE`): `ClimbRope`, `Default`, `DefaultExercise`, `DiggingSpade`, `DrivingCar`, `Fitness`, `FitnessHeavy`, `ForestryAxe`, `HeavyDomestic`, `HeavyWork`, `JumpFence`, `LightDomestic`, `LightWork`, `MAX`, `MediumWork`, `Running10kmh`, `Running15kmh`, `SeatedResting`, `SedentaryActivity`, `Sleeping`, `StandingAtRest`, `UsingTools`, `Walking2kmh`, `Walking5kmh`.

### Nutrition

`zombie.characters.BodyDamage.Nutrition`, class.

Methods, called as `obj:name(...)`:

- `applyTraitFromWeight(): void`
- `applyWeightFromTraits(): void`
- `canAddFitnessXp(): boolean`
- `characterHaveWeightTrouble(): boolean`
- `getCalories(): float`
- `getCarbohydrates(): float`
- `getLipids(): float`
- `getProteins(): float`
- `getWeight(): double`
- `isDecWeight(): boolean`
- `isIncWeight(): boolean`
- `isIncWeightLot(): boolean`
- `load(ByteBuffer input): void`
- `save(ByteBuffer output): void`
- `setCalories(float calories): void`
- `setCarbohydrates(float carbohydrates): void`
- `setDecWeight(boolean decWeight): void`
- `setIncWeight(boolean incWeight): void`
- `setIncWeightLot(boolean incWeightLot): void`
- `setLipids(float lipids): void`
- `setProteins(float proteins): void`
- `setWeight(double weight): void`
- `update(): void`

Constructors: `Nutrition.new(IsoPlayer parent)`.

### Thermoregulator

`zombie.characters.BodyDamage.Thermoregulator`, class.

Methods, called as `obj:name(...)`:

- `getBodyFluids(): float`
- `getBodyHeatDelta(): float`
- `getBodyHeatMultiplier(): float`
- `getCatchAColdDelta(): float`
- `getCombatModifier(): float`
- `getCoreCelcius(): float`
- `getCoreHeatContractMultiplier(): float`
- `getCoreHeatDelta(): float`
- `getCoreHeatExpandMultiplier(): float`
- `getCoreRateOfChange(): float`
- `getCoreTemperature(): float`
- `getCoreTemperatureUI(): float`
- `getDbg_primTotal(): float`
- `getDbg_secTotal(): float`
- `getDbg_totalHeat(): float`
- `getDbg_totalHeatRaw(): float`
- `getDefaultMultiplier(): float`
- `getEnergy(): float`
- `getEnergyMultiplier(): double`
- `getExternalAirTemperature(): float`
- `getFatigueMultiplier(): double`
- `getFluidsMultiplier(): double`
- `getHeatGeneration(): float`
- `getHeatGenerationUI(): float`
- `getMetabolicRate(): float`
- `getMetabolicRateDecMultiplier(): float`
- `getMetabolicRateIncMultiplier(): float`
- `getMetabolicRateReal(): float`
- `getMetabolicTarget(): float`
- `getMovementModifier(): float`
- `getNode(int index): Thermoregulator.ThermalNode`
- `getNodeForBloodType(BloodBodyPartType type): Thermoregulator.ThermalNode`
- `getNodeForType(BodyPartType type): Thermoregulator.ThermalNode`
- `getNodeSize(): int`
- `getSetPoint(): float`
- `getSimulationMultiplier(): float`
- `getSkinCelciusMultiplier(): float`
- `getTemperatureAir(): float`
- `getTemperatureAirAndWind(): float`
- `getThermalDamage(): float`
- `getTimedActionTimeModifier(): float`
- `load(ByteBuffer input, int worldVersion): void`
- `reset(): void`
- `save(ByteBuffer output): void`
- `setMetabolicTarget(float target): void`
- `setMetabolicTarget(Metabolics meta): void`
- `thermalChevronCount(): int`
- `thermalChevronUp(): boolean`
- `update(): void`

Static functions, called as `Thermoregulator.name(...)`:

- `getSkinCelciusFavorable(): float`
- `getSkinCelciusMax(): float`
- `getSkinCelciusMin(): float`
- `setSimulationMultiplier(float multiplier): void`

Constructors: `Thermoregulator.new(BodyDamage parent)`.

Static fields (a copy of the value taken when the class is exposed): `THERMAL_COLD_DAMAGE_MOD: float`.

### Thermoregulator.ThermalNode

`zombie.characters.BodyDamage.Thermoregulator.ThermalNode`, class.

Methods, called as `obj:name(...)`:

- `getBodyResponse(): float`
- `getBodyResponseUI(): float`
- `getBodyWetness(): float`
- `getBodyWetnessUI(): float`
- `getCelcius(): float`
- `getClothingWetness(): float`
- `getClothingWetnessUI(): float`
- `getDistToCore(): float`
- `getHeatDelta(): float`
- `getHeatDeltaUI(): float`
- `getInsulation(): float`
- `getInsulationUI(): float`
- `getName(): String`
- `getPrimaryDelta(): float`
- `getPrimaryDeltaUI(): float`
- `getSecondaryDelta(): float`
- `getSecondaryDeltaUI(): float`
- `getSkinCelcius(): float`
- `getSkinCelciusUI(): float`
- `getSkinSurface(): float`
- `getWindresist(): float`
- `getWindresistUI(): float`
- `hasDownstream(): boolean`
- `hasUpstream(): boolean`
- `isCore(): boolean`

Constructors: `Thermoregulator.ThermalNode.new(Thermoregulator, boolean, float, BodyPart, float)`, `Thermoregulator.ThermalNode.new(Thermoregulator, float, BodyPart, float)`.

### Capability

`zombie.characters.Capability`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `Capability.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): Capability`
- `values(): Capability[]`

Enum values (read as `Capability.VALUE`): `AddItem`, `AddUserlog`, `AddXP`, `AdminChat`, `AnimalCheats`, `AnswerTickets`, `BanUnbanUser`, `BypassLuaChecksum`, `CanAlwaysJoinServer`, `CanGoInsideSafehouses`, `CanHearAll`, `CanMedicalCheat`, `CanModifyBodyStats`, `CanModifyPlayerStatsInThePlayerStatsUI`, `CanOpenLockedDoors`, `CanSeeAll`, `CanSeeMessageForAdmin`, `CanSeePlayersStats`, `CanSetupNonPVPZone`, `CanSetupSafehouses`, `CantBeBannedByAnticheat`, `CantBeBannedByUser`, `CantBeKickedByAnticheat`, `CantBeKickedByUser`, `CantBeKickedIfTooLaggy`, `ChangeAccessLevel`, `ChangeAndReloadServerOptions`, `ClimateManager`, `ConnectWithDebug`, `CreateHorde`, `CreateStory`, `DebugConsole`, `DisplayServerMessage`, `EditItem`, `EditMapSymbols`, `EmptyLinesInChat`, `FactionCheat`, `GeneralCheats`, `GetStatistic`, `GetSteamScoreboard`, `HideFromSteamUserList`, `IgnoreChatSlowMode`, `InspectPlayerInventory`, `KickUser`, `LoginOnServer`, `MakeEventsAlarmGunshot`, `ManipulateMods`, `ManipulateVehicle`, `ManipulateWhitelist`, `ManipulateZombie`, `ModifyNetworkUsers`, `None`, `PVPLogTool`, `PopmanManage`, `PriorityLogin`, `QuitWorld`, `ReadUserLog`, `ReloadLuaFiles`, `RolesRead`, `RolesWrite`, `SandboxOptions`, `SaveWorld`, `SeeNetworkUsers`, `SeePlayersConnected`, `SeePublicServerOptions`, `SeeWorldMap`, `SeesInvisiblePlayers`, `StartStopRain`, `TeleportPlayerToAnotherPlayer`, `TeleportToCoordinates`, `TeleportToPlayer`, `ToggleGodModEveryone`, `ToggleGodModHimself`, `ToggleInvincibleHimself`, `ToggleInvisibleEveryone`, `ToggleInvisibleHimself`, `ToggleKnowAllRecipes`, `ToggleNoclipEveryone`, `ToggleNoclipHimself`, `ToggleUnlimitedAmmo`, `ToggleUnlimitedCarry`, `ToggleUnlimitedEndurance`, `ToggleWriteRoleNameAbove`, `UIManagerProcessCommands`, `UseBrushToolManager`, `UseBuildCheat`, `UseDebugContextMenu`, `UseFarmingCheat`, `UseFastMoveCheat`, `UseFishingCheat`, `UseHealthCheat`, `UseLootLog`, `UseLootZed`, `UseMechanicsCheat`, `UseMovablesCheat`, `UseTimedActionInstantCheat`, `UseZombieDontAttackCheat`, `WorkWithUserlog`.

### CharacterActionAnims

`zombie.characters.CharacterActionAnims`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CharacterActionAnims.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CharacterActionAnims`
- `values(): CharacterActionAnims[]`

Enum values (read as `CharacterActionAnims.VALUE`): `Bandage`, `Build`, `BuildLow`, `Chop_tree`, `Craft`, `Destroy`, `Dig`, `DigHoe`, `DigPickAxe`, `DigShovel`, `DigTrowel`, `Disassemble`, `Drink`, `Eat`, `InsertBullets`, `None`, `Paint`, `Pour`, `Read`, `Reload`, `RemoveBullets`, `Shave`, `TakePills`.

### CharacterInputBindingSet

`zombie.characters.CharacterInputBindingSet`, class.

Methods, called as `obj:name(...)`:

- `addBinding(CharacterInputBindingSetEntry newBinding): void`
- `apply(): void`
- `getDescription(): String`
- `getName(): String`
- `save(): boolean`
- `setBindingsToCurrent(): void`

Static functions, called as `CharacterInputBindingSet.name(...)`:

- `containsSetName(String name): boolean`
- `createNewFromCurrent(String name): CharacterInputBindingSet`
- `getLoadedBindingSets(): CharacterInputBindingSet[]`
- `getUniqueSetName(String name): String`
- `reloadAll(): CharacterInputBindingSet[]`
- `resetAllToDefault(): void`
- `saveAll(): boolean`

Constructors: `CharacterInputBindingSet.new()`.

### CharacterInputBindingSetEntry

`zombie.characters.CharacterInputBindingSetEntry`, abstract class.

Constructors: `CharacterInputBindingSetEntry.new()`.

### CharacterJoypadAxis2dBinding

`zombie.characters.CharacterJoypadAxis2dBinding`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getBinding(): JoypadAxis2d`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getJoypadAxis(): JoypadAxis2d`
- `getLength(int joypadBind): float`
- `getNameTranslationKey(): String`
- `getValue(int joypadBind, Vector2 out): Vector2`
- `getValueX(int joypadBind): float`
- `getValueY(int joypadBind): float`
- `hashCode(): int` from `Enum`
- `isApplied(int joypadBind): boolean`
- `moveBindingFrom(CharacterJoypadAxis2dBinding fromBinding): void`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `removeBinding(JoypadAxis2d binding): void`
- `setBinding(JoypadAxis2d newBinding): void`
- `setDefault(): void`
- `toString(): String` from `Enum`

Static functions, called as `CharacterJoypadAxis2dBinding.name(...)`:

- `allBindings(): CharacterJoypadAxis2dBinding[]`
- `findBindings(JoypadAxis2d joypadAxis): CharacterJoypadAxis2dBinding[]`
- `fromString(String name): CharacterJoypadAxis2dBinding`
- `setAllToDefault(): void`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CharacterJoypadAxis2dBinding`
- `values(): CharacterJoypadAxis2dBinding[]`

Enum values (read as `CharacterJoypadAxis2dBinding.VALUE`): `Aiming`, `Movement`.

### CharacterJoypadButtonBinding

`zombie.characters.CharacterJoypadButtonBinding`, enum.

Methods, called as `obj:name(...)`:

- `addBinding(JoypadAxis1d axis1d): void`
- `addBinding(JoypadAxis2d axis2d): void`
- `addBinding(JoypadButton button): void`
- `compareTo(E): int` from `Enum`
- `containsBinding(JoypadAxis1d axis1d): boolean`
- `containsBinding(JoypadAxis2d axis2d): boolean`
- `containsBinding(JoypadButton button): boolean`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getAxisMaxThreshold(): float`
- `getAxisMinThreshold(): float`
- `getBinding(): CharacterJoypadButtonBinding.IsDownBinding`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getJoypadAxis1d(): JoypadAxis1d`
- `getJoypadAxis2d(): JoypadAxis2d`
- `getJoypadButton(): JoypadButton`
- `getNameTranslationKey(): String`
- `hashCode(): int` from `Enum`
- `isAxisMaxThresholdInfinity(): boolean`
- `isDown(int): boolean`
- `moveBindingFrom(CharacterJoypadButtonBinding fromBinding): void`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `removeBinding(JoypadAxis1d axis1d): void`
- `removeBinding(JoypadAxis2d axis2d): void`
- `removeBinding(JoypadButton button): void`
- `setBinding(JoypadAxis1d axis1d, float min): void`
- `setBinding(JoypadAxis1d axis1d, float min, float max): void`
- `setBinding(JoypadAxis2d axis2d, float min): void`
- `setBinding(JoypadAxis2d axis2d, float min, float max): void`
- `setBinding(JoypadButton newBinding): void`
- `setDefault(): void`
- `toString(): String` from `Enum`

Static functions, called as `CharacterJoypadButtonBinding.name(...)`:

- `allBindings(): CharacterJoypadButtonBinding[]`
- `findBinding(JoypadButton joypadButton): CharacterJoypadButtonBinding`
- `findBindings(JoypadAxis1d joypadAxis): CharacterJoypadButtonBinding[]`
- `findBindings(JoypadAxis2d joypadAxis): CharacterJoypadButtonBinding[]`
- `findBindings(JoypadButton joypadButton): CharacterJoypadButtonBinding[]`
- `fromString(String name): CharacterJoypadButtonBinding`
- `setAllToDefault(): void`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CharacterJoypadButtonBinding`
- `values(): CharacterJoypadButtonBinding[]`

Enum values (read as `CharacterJoypadButtonBinding.VALUE`): `Aim`, `Attack`, `Brakes`, `CancelAction`, `ClimbThrough`, `ClosePanel`, `Crouch`, `CruiseControl`, `CycleInventory`, `CycleLoot`, `CycleTabsLeft`, `CycleTabsRight`, `Interact`, `InteractOptions`, `Inventory`, `Loot`, `ManualFloorAtk`, `Melee`, `PrecisionAim`, `RackFirearm`, `ReloadWeapon`, `Run`, `SmashWindow`, `Sprint`, `TransferItem`, `WalkTo`, `ZoomIn`, `ZoomOut`.

### CharacterSoundEmitter

`zombie.characters.CharacterSoundEmitter`, class. Extends `BaseCharacterSoundEmitter`.

Methods, called as `obj:name(...)`:

- `hasSoundsToStart(): boolean`
- `hasSustainPoints(long handle): boolean`
- `isClear(): boolean`
- `isEmpty(): boolean`
- `isPlaying(String alias): boolean`
- `isPlaying(long eventInstance): boolean`
- `playFootsteps(String file, float volume): void`
- `playSound(String file): long`
- `playSound(String file, boolean doWorldSound): long`
- `playSound(String file, IsoObject proxy): long`
- `playSoundImpl(String file, IsoObject proxy): long`
- `playVocals(String file): long`
- `register(): void`
- `set(float x, float y, float z): void`
- `setParameterValue(long soundRef, FMOD_STUDIO_PARAMETER_DESCRIPTION parameterDescription, float value): void`
- `setParameterValueByName(long soundRef, String parameterName, float value): void`
- `setPitch(long handle, float pitch): void`
- `setPos(float x, float y, float z): void`
- `setVolume(long handle, float volume): void`
- `stopAll(): void`
- `stopOrTriggerSound(long eventInstance): void`
- `stopOrTriggerSoundByName(String name): void`
- `stopOrTriggerSoundLocal(long eventInstance): void`
- `stopSound(long eventInstance): int`
- `stopSoundByName(String soundName): int`
- `stopSoundDelayRelease(long eventInstance): int`
- `stopSoundLocal(long handle): void`
- `tick(): void`
- `triggerCue(long handle): void`
- `unregister(): void`

Constructors: `CharacterSoundEmitter.new(IsoGameCharacter chr)`.

### CharacterStat

`zombie.characters.CharacterStat`, class.

Methods, called as `obj:name(...)`:

- `clamp(float value): float`
- `getDefaultValue(): float`
- `getId(): String`
- `getMaximumValue(): float`
- `getMinimumValue(): float`
- `isAtMaximum(float value): boolean`
- `isAtMinimum(float value): boolean`
- `toString(): String`

Static functions, called as `CharacterStat.name(...)`:

- `getById(String id): CharacterStat`
- `register(String id, float minimumValue, float maximumValue, float defaultValue): CharacterStat`

Static fields (a copy of the value taken when the class is exposed): `ANGER: CharacterStat`, `BOREDOM: CharacterStat`, `DISCOMFORT: CharacterStat`, `ENDURANCE: CharacterStat`, `FATIGUE: CharacterStat`, `FITNESS: CharacterStat`, `FOOD_SICKNESS: CharacterStat`, `HUNGER: CharacterStat`, `IDLENESS: CharacterStat`, `INTOXICATION: CharacterStat`, `MORALE: CharacterStat`, `NICOTINE_WITHDRAWAL: CharacterStat`, `ORDERED_STATS: CharacterStat[]`, `PAIN: CharacterStat`, `PANIC: CharacterStat`, `POISON: CharacterStat`, `REGISTRY: Map<String, CharacterStat>`, `SANITY: CharacterStat`, `SICKNESS: CharacterStat`, `STRESS: CharacterStat`, `TEMPERATURE: CharacterStat`, `THIRST: CharacterStat`, `UNHAPPINESS: CharacterStat`, `WETNESS: CharacterStat`, `ZOMBIE_FEVER: CharacterStat`, `ZOMBIE_INFECTION: CharacterStat`.

### LuaTimedAction

`zombie.characters.CharacterTimedActions.LuaTimedAction`, class. Extends `BaseAction`.

Methods, called as `obj:name(...)`:

- `OnAnimEvent(AnimEvent event): void` from `BaseAction`
- `PlayLoopedSoundTillComplete(String name, int radius, float maxGain): void` from `BaseAction`
- `complete(): void` from `BaseAction`
- `finished(): boolean` from `BaseAction`
- `forceComplete(): void` from `BaseAction`
- `forceStop(): void` from `BaseAction`
- `getCurrentTime(): float` from `BaseAction`
- `getDeltaModifiers(MoveDeltaModifiers modifiers): void` from `BaseAction`
- `getJobDelta(): float` from `BaseAction`
- `getPrimaryHandItem(): InventoryItem` from `BaseAction`
- `getPrimaryHandMdl(): String` from `BaseAction`
- `getSecondaryHandItem(): InventoryItem` from `BaseAction`
- `getSecondaryHandMdl(): String` from `BaseAction`
- `hasStalled(): boolean` from `BaseAction`
- `interruptWaitToStart(): void` from `BaseAction`
- `isAllowedWhileDraggingCorpses(): boolean` from `BaseAction`
- `isForceComplete(): boolean` from `BaseAction`
- `isPathfinding(): boolean` from `BaseAction`
- `isStarted(): boolean` from `BaseAction`
- `overrideWeaponType(): void` from `BaseAction`
- `perform(): void`
- `reset(): void` from `BaseAction`
- `resetJobDelta(): void` from `BaseAction`
- `restoreWeaponType(): void` from `BaseAction`
- `setActionAnim(String animNode): void` from `BaseAction`
- `setActionAnim(CharacterActionAnims act): void` from `BaseAction`
- `setAllowedWhileDraggingCorpses(boolean val): void` from `BaseAction`
- `setAnimVariable(String key, boolean val): void` from `BaseAction`
- `setAnimVariable(String key, String val): void` from `BaseAction`
- `setBlockMovementEtc(boolean block): void` from `BaseAction`
- `setJobDelta(float delta): void` from `BaseAction`
- `setLoopedAction(boolean looped): void` from `BaseAction`
- `setOverrideAnimation(boolean override): void` from `BaseAction`
- `setOverrideHandModels(InventoryItem primaryHand, InventoryItem secondaryHand): void` from `BaseAction`
- `setOverrideHandModels(InventoryItem primaryHand, InventoryItem secondaryHand, boolean resetModel): void` from `BaseAction`
- `setOverrideHandModelsObject(Object primaryHand, Object secondaryHand, boolean resetModel): void` from `BaseAction`
- `setOverrideHandModelsString(String primaryHand, String secondaryHand): void` from `BaseAction`
- `setOverrideHandModelsString(String primaryHand, String secondaryHand, boolean resetModel): void` from `BaseAction`
- `setPathfinding(boolean b): void` from `BaseAction`
- `setUseProgressBar(boolean use): void` from `BaseAction`
- `setWaitForFinished(boolean val): void` from `BaseAction`
- `start(): void`
- `stop(): void`
- `stopTimedActionAnim(): void` from `BaseAction`
- `update(): void`
- `valid(): boolean`
- `waitToStart(): void` from `BaseAction`

Constructors: `LuaTimedAction.new(KahluaTable table, IsoGameCharacter chr)`.

Static fields (a copy of the value taken when the class is exposed): `statObj: Object[]`.

### LuaTimedActionNew

`zombie.characters.CharacterTimedActions.LuaTimedActionNew`, class. Extends `BaseAction`.

Methods, called as `obj:name(...)`:

- `Failed(Mover mover): void`
- `OnAnimEvent(AnimEvent event): void`
- `Pathfind(IsoGameCharacter chr, int x, int y, int z): void`
- `PlayLoopedSoundTillComplete(String name, int radius, float maxGain): void` from `BaseAction`
- `Succeeded(Path path, Mover mover): void`
- `complete(): void`
- `finished(): boolean` from `BaseAction`
- `forceComplete(): void` from `BaseAction`
- `forceStop(): void` from `BaseAction`
- `getCurrentTime(): float` from `BaseAction`
- `getDeltaModifiers(MoveDeltaModifiers modifiers): void`
- `getJobDelta(): float` from `BaseAction`
- `getMetaType(): String`
- `getName(): String`
- `getPrimaryHandItem(): InventoryItem` from `BaseAction`
- `getPrimaryHandMdl(): String` from `BaseAction`
- `getSecondaryHandItem(): InventoryItem` from `BaseAction`
- `getSecondaryHandMdl(): String` from `BaseAction`
- `getTable(): KahluaTable`
- `getTime(): int`
- `hasStalled(): boolean` from `BaseAction`
- `interruptWaitToStart(): void`
- `isAllowedWhileDraggingCorpses(): boolean` from `BaseAction`
- `isForceComplete(): boolean` from `BaseAction`
- `isPathfinding(): boolean` from `BaseAction`
- `isStarted(): boolean` from `BaseAction`
- `overrideWeaponType(): void` from `BaseAction`
- `perform(): void`
- `replaceObjectInTable(Object oldObj, Object newObj): void`
- `reset(): void` from `BaseAction`
- `resetJobDelta(): void` from `BaseAction`
- `restoreWeaponType(): void` from `BaseAction`
- `setActionAnim(String animNode): void` from `BaseAction`
- `setActionAnim(CharacterActionAnims act): void` from `BaseAction`
- `setAllowedWhileDraggingCorpses(boolean val): void` from `BaseAction`
- `setAnimVariable(String key, boolean val): void` from `BaseAction`
- `setAnimVariable(String key, String val): void` from `BaseAction`
- `setBlockMovementEtc(boolean block): void` from `BaseAction`
- `setCurrentTime(float time): void`
- `setCustomRemoteTimedActionSync(boolean customRemoteTimedActionSync): void`
- `setJobDelta(float delta): void` from `BaseAction`
- `setLoopedAction(boolean looped): void` from `BaseAction`
- `setOverrideAnimation(boolean override): void` from `BaseAction`
- `setOverrideHandModels(InventoryItem primaryHand, InventoryItem secondaryHand): void` from `BaseAction`
- `setOverrideHandModels(InventoryItem primaryHand, InventoryItem secondaryHand, boolean resetModel): void` from `BaseAction`
- `setOverrideHandModelsObject(Object primaryHand, Object secondaryHand, boolean resetModel): void` from `BaseAction`
- `setOverrideHandModelsString(String primaryHand, String secondaryHand): void` from `BaseAction`
- `setOverrideHandModelsString(String primaryHand, String secondaryHand, boolean resetModel): void` from `BaseAction`
- `setPathfinding(boolean b): void` from `BaseAction`
- `setTime(int maxTime): void`
- `setUseProgressBar(boolean use): void` from `BaseAction`
- `setWaitForFinished(boolean val): void` from `BaseAction`
- `start(): void`
- `stop(): void`
- `stopTimedActionAnim(): void` from `BaseAction`
- `update(): void`
- `valid(): boolean`
- `waitToStart(): void`

Constructors: `LuaTimedActionNew.new(KahluaTable table, IsoGameCharacter chr)`.

### CheatType

`zombie.characters.CheatType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getTooltip(): String`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CheatType.name(...)`:

- `fromId(byte id): CheatType`
- `fromString(String str): CheatType`
- `getList(): List<CheatType>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CheatType`
- `values(): CheatType[]`

Enum values (read as `CheatType.VALUE`): `ALWAYS_DAY`, `ANIMAL`, `ANIMAL_EXTRA_VALUES`, `BRUSH_TOOL`, `BUILD`, `CAN_HEAR_EVERYONE`, `CAN_SEE_EVERYONE`, `DEBUG_CONTEXT_MENU`, `FARMING`, `FAST_MOVE`, `FISHING`, `GOD_MODE`, `HEALTH`, `INVISIBLE`, `KNOW_ALL_RECIPES`, `LOOT_LOG`, `LOOT_ZED`, `MECHANICS`, `MOVABLES`, `NO_CLIP`, `TIMED_ACTION_INSTANT`, `UNLIMITED_AMMO`, `UNLIMITED_CARRY`, `UNLIMITED_ENDURANCE`, `ZOMBIES_DONT_ATTACK`.

### DummyCharacterSoundEmitter

`zombie.characters.DummyCharacterSoundEmitter`, class. Extends `BaseCharacterSoundEmitter`.

Methods, called as `obj:name(...)`:

- `hasSoundsToStart(): boolean`
- `hasSustainPoints(long handle): boolean`
- `isClear(): boolean`
- `isPlaying(String alias): boolean`
- `isPlaying(long channel): boolean`
- `playFootsteps(String file, float volume): void`
- `playSound(String file): long`
- `playSound(String file, IsoObject proxy): long`
- `playSoundImpl(String file, IsoObject proxy): long`
- `playVocals(String file): long`
- `register(): void`
- `set(float x, float y, float z): void`
- `setParameterValue(long soundRef, FMOD_STUDIO_PARAMETER_DESCRIPTION parameterDescription, float value): void`
- `setParameterValueByName(long soundRef, String parameterName, float value): void`
- `setPitch(long handle, float pitch): void`
- `setVolume(long handle, float volume): void`
- `stopAll(): void`
- `stopOrTriggerSound(long handle): void`
- `stopOrTriggerSoundByName(String name): void`
- `stopOrTriggerSoundLocal(long handle): void`
- `stopSound(long channel): int`
- `stopSoundByName(String soundName): int`
- `stopSoundDelayRelease(long channel): int`
- `stopSoundLocal(long handle): void`
- `tick(): void`
- `unregister(): void`

Constructors: `DummyCharacterSoundEmitter.new(IsoGameCharacter chr)`.

### Faction

`zombie.characters.Faction`, class. Extends `Invite`.

Methods, called as `obj:name(...)`:

- `addInvite(String invited): void` from `Invite`
- `addPlayer(String pName): void`
- `canCreateTag(): boolean`
- `getName(): String`
- `getOwner(): String`
- `getPlayers(): ArrayList<String>`
- `getTag(): String`
- `getTagColor(): ColorInfo`
- `hasInvite(String player): boolean` from `Invite`
- `isMember(String name): boolean`
- `isOwner(String name): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `removeInvite(String player): void` from `Invite`
- `removePlayer(String player): void`
- `save(ByteBuffer output): void`
- `setName(String name): void`
- `setOwner(String owner): void`
- `setTag(String tag): void`
- `setTagColor(ColorInfo tagColor): void`
- `writeToBuffer(ByteBufferWriter bb, boolean remove): void`

Static functions, called as `Faction.name(...)`:

- `canCreateFaction(IsoPlayer player): boolean`
- `factionExist(String name): boolean`
- `getFaction(String name): Faction`
- `getFactions(): ArrayList<Faction>`
- `getPlayerFaction(String username): Faction`
- `getPlayerFaction(IsoPlayer player): Faction`
- `isAlreadyInFaction(String username): boolean`
- `isAlreadyInFaction(IsoPlayer player): boolean`
- `isInSameFaction(IsoPlayer player, String username): boolean`
- `isInSameFaction(IsoPlayer player, IsoPlayer other): boolean`
- `tagExist(String name): boolean`

Constructors: `Faction.new()`, `Faction.new(String name, String owner)`.

Static fields (a copy of the value taken when the class is exposed): `factions: ArrayList<Faction>`.

### HaloTextHelper

`zombie.characters.HaloTextHelper`, class.

Static functions, called as `HaloTextHelper.name(...)`:

- `addBadText(IsoPlayer player, String text): void`
- `addBadText(IsoPlayer player, String text, String separator): void`
- `addGoodText(IsoPlayer player, String text): void`
- `addGoodText(IsoPlayer player, String text, String separator): void`
- `addText(IsoPlayer player, String text): void`
- `addText(IsoPlayer player, String text, String separator): void`
- `addText(IsoPlayer player, String text, String separator, int r, int g, int b): void`
- `addText(IsoPlayer player, String text, String seperator, HaloTextHelper.ColorRGB color): void`
- `addTextWithArrow(IsoPlayer player, String text, boolean arrowIsUp, int r, int g, int b): void`
- `addTextWithArrow(IsoPlayer player, String text, boolean arrowIsUp, int r, int g, int b, int aR, int aG, int aB): void`
- `addTextWithArrow(IsoPlayer player, String text, boolean arrowIsUp, HaloTextHelper.ColorRGB color): void`
- `addTextWithArrow(IsoPlayer player, String text, boolean arrowIsUp, HaloTextHelper.ColorRGB color, HaloTextHelper.ColorRGB arrowColor): void`
- `addTextWithArrow(IsoPlayer player, String text, String separator, boolean arrowIsUp, int r, int g, int b): void`
- `addTextWithArrow(IsoPlayer player, String text, String separator, boolean arrowIsUp, int r, int g, int b, int aR, int aG, int aB): void`
- `addTextWithArrow(IsoPlayer player, String text, String separator, boolean arrowIsUp, HaloTextHelper.ColorRGB color): void`
- `addTextWithArrow(IsoPlayer player, String text, String separator, boolean arrowIsUp, HaloTextHelper.ColorRGB color, HaloTextHelper.ColorRGB arrowColor): void`
- `forceNextAddText(): void`
- `getBadColor(): HaloTextHelper.ColorRGB`
- `getColorGreen(): HaloTextHelper.ColorRGB`
- `getColorRed(): HaloTextHelper.ColorRGB`
- `getColorWhite(): HaloTextHelper.ColorRGB`
- `getGoodColor(): HaloTextHelper.ColorRGB`
- `update(): void`

Constructors: `HaloTextHelper.new()`.

Static fields (a copy of the value taken when the class is exposed): `COLOR_GREEN: HaloTextHelper.ColorRGB`, `COLOR_RED: HaloTextHelper.ColorRGB`, `COLOR_WHITE: HaloTextHelper.ColorRGB`.

### HaloTextHelper.ColorRGB

`zombie.characters.HaloTextHelper.ColorRGB`, class.

Constructors: `HaloTextHelper.ColorRGB.new(int r, int g, int b)`.

### IsoDummyCameraCharacter

`zombie.characters.IsoDummyCameraCharacter`, class. Extends [IsoGameCharacter](/pz/build-42/modding/reference/lua-classes-characters-2#isogamecharacter). Also has the methods of [IsoGameCharacter](/pz/build-42/modding/reference/lua-classes-characters-2#isogamecharacter) (1,194), [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (44), [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject) (172), [IsoObject](/pz/build-42/modding/reference/lua-classes-world-2#isoobject) (386), listed on their own entries.

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
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
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

Constructors: `IsoDummyCameraCharacter.new(float x, float y, float z)`.

Static fields (a copy of the value taken when the class is exposed): `AwkwardGlovesStrengthDivisor: int`, `DEFAULT_ENTITY_DISPLAY_NAME: String`, `GlovesStrengthBonus: int`, `HUMANOID_SCREEN_CHEST_HEIGHT: float`, `HUMANOID_WORLD_CHEST_HEIGHT: float`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `RENDER_OFFSET_X: int`, `RENDER_OFFSET_Y: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `WALK_SPEED_DEFAULT: float`, `WALK_SPEED_SLOW: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `s_maxPossibleTwist: float`, `treeSoundMgr: TreeSoundManager`.
