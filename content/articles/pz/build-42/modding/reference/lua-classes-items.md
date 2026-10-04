---
slug: lua-classes-items
title: 'Lua Classes: Items and inventory (Build 42.21)'
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
excerpt: 'The exposed items and inventory classes of Build 42.21: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Items and inventory

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Inventory items, their types (food, weapons, clothing, literature and the rest) and the containers that hold them.

This page holds 28 classes and 2,079 methods, from the packages `zombie.inventory`, `zombie.inventory.recipemanager`, `zombie.inventory.types`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### FixingManager

`zombie.inventory.FixingManager`, class.

Static functions, called as `FixingManager.name(...)`:

- `fixItem(InventoryItem brokenItem, IsoGameCharacter chr, Fixing fixing, Fixing.Fixer fixer): InventoryItem`
- `getChanceOfFail(InventoryItem brokenItem, IsoGameCharacter chr, Fixing fixing, Fixing.Fixer fixer): double`
- `getCondRepaired(InventoryItem brokenItem, IsoGameCharacter chr, Fixing fixing, Fixing.Fixer fixer): double`
- `getFixes(InventoryItem item): ArrayList<Fixing>`
- `useFixer(IsoGameCharacter chr, Fixing.Fixer fixer, InventoryItem brokenItem): void`

Constructors: `FixingManager.new()`.

### InventoryItem

`zombie.inventory.InventoryItem`, class. Extends [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), listed on their own entries.

Methods, called as `obj:name(...)`:

- `CanStack(InventoryItem item): boolean`
- `CopyModData(KahluaTable defaultModData): void`
- `DoTooltip(ObjectTooltip tooltipUI): void`
- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `DoTooltipEmbedded(ObjectTooltip tooltipUI, ObjectTooltip.Layout layoutOverride, int offsetY): void`
- `HowRotten(): float`
- `IsClothing(): boolean`
- `IsDrainable(): boolean`
- `IsFood(): boolean`
- `IsInventoryContainer(): boolean`
- `IsLiterature(): boolean`
- `IsMap(): boolean`
- `IsRotten(): boolean`
- `IsWeapon(): boolean`
- `ModDataMatches(InventoryItem item): boolean`
- `OnAddedToContainer(ItemContainer container): void`
- `OnBeforeRemoveFromContainer(ItemContainer container): void`
- `Remove(): void`
- `SetContainerPosition(int x, int y): void`
- `SynchSpawn(): void`
- `Use(): void`
- `Use(boolean bCrafting): void`
- `Use(boolean bCrafting, boolean bInContainer, boolean bNeedSync): void`
- `UseAndSync(): void`
- `UseForCrafting(int uses): boolean`
- `UseItem(): void`
- `addExtraItem(String type): void`
- `addExtraItem(ItemKey key): void`
- `allowRandomTint(): boolean`
- `applyMaxSharpness(): void`
- `canBeActivated(): boolean`
- `canBeEquipped(): ItemBodyLocation`
- `canBeRemote(): boolean`
- `canEmitLight(): boolean`
- `canHaveOrigin(): boolean`
- `canStoreWater(): boolean`
- `checkSyncItemFields(boolean b): void`
- `copyBloodLevelFrom(InventoryItem item): void`
- `copyClothing(InventoryItem otherItem): void`
- `copyConditionModData(InventoryItem other): void`
- `copyConditionStatesFrom(InventoryItem otherItem): void`
- `copyModData(KahluaTable modData): void`
- `copyTimesHeadRepairedFrom(InventoryItem item): void`
- `copyTimesHeadRepairedTo(InventoryItem item): void`
- `copyTimesRepairedFrom(InventoryItem item): void`
- `copyTimesRepairedTo(InventoryItem item): void`
- `createAndStoreDefaultDeadBody(IsoGridSquare square): IsoDeadBody`
- `createCloneItem(): InventoryItem`
- `damageCheck(): boolean`
- `damageCheck(int skill): boolean`
- `damageCheck(int skill, float multiplier): boolean`
- `damageCheck(int skill, float multiplier, boolean maintenance): boolean`
- `damageCheck(int skill, float multiplier, boolean maintenance, boolean isEquipped): boolean`
- `damageCheck(int skill, float multiplier, boolean maintenance, boolean isEquipped, IsoGameCharacter character): boolean`
- `doBreakSound(): void`
- `doBuildingStash(): void`
- `doDamagedSound(): void`
- `emptyLiquid(): InventoryItem`
- `finishupdate(): boolean`
- `getA(): float`
- `getActualWeight(): float`
- `getActualWeightUnmodded(): float`
- `getAge(): float`
- `getAimReleaseSound(): String`
- `getAlcoholPower(): float`
- `getAlternateModelName(): String`
- `getAmmoType(): AmmoType`
- `getAnimalFeedType(): String`
- `getAnimalTracks(): AnimalTracks`
- `getAttachedSlot(): int`
- `getAttachedSlotType(): String`
- `getAttachedToModel(): String`
- `getAttachmentReplacement(): String`
- `getAttachmentType(): String`
- `getAttachmentsProvided(): ArrayList<String>`
- `getB(): float`
- `getBandagePower(): float`
- `getBlood(BloodBodyPartType bodyPartType): float`
- `getBloodClothingType(): ArrayList<BloodClothingType>`
- `getBloodLevel(): float`
- `getBloodLevelAdjustedHigh(): float`
- `getBloodLevelAdjustedLow(): float`
- `getBodyLocation(): ItemBodyLocation`
- `getBookSubjects(): List<BookSubject>`
- `getBoredomChange(): float`
- `getBrakeForce(): float`
- `getBreakSound(): String`
- `getBringToBearSound(): String`
- `getBulletHitArmourSound(): String`
- `getBurntString(): String`
- `getByteData(): ByteBuffer`
- `getCategory(): String`
- `getChanceToSpawnDamaged(): int`
- `getCleanString(float weight): String`
- `getClothingItem(): ClothingItem`
- `getClothingItemExtra(): ArrayList<String>`
- `getClothingItemExtraOption(): ArrayList<String>`
- `getClothingItemName(): String`
- `getColor(): Color`
- `getColorBlue(): float`
- `getColorGreen(): float`
- `getColorInfo(): ColorInfo`
- `getColorRed(): float`
- `getCondition(): int`
- `getConditionLowerChance(): int`
- `getConditionLowerNormal(): float`
- `getConditionLowerOffroad(): float`
- `getConditionMax(): int`
- `getConsolidateOption(): String`
- `getContainer(): ItemContainer`
- `getContainerX(): int`
- `getContainerY(): int`
- `getContentsWeight(): float`
- `getCookedString(): String`
- `getCookingTime(): float`
- `getCount(): int`
- `getCountDownSound(): String`
- `getCoverType(): CoverType`
- `getCurrentAmmoCount(): int`
- `getCurrentCondition(): float`
- `getCurrentUses(): int`
- `getCurrentUsesFloat(): float`
- `getCustomMenuOption(): String`
- `getDamagedSound(): String`
- `getDeadBodyObject(): IsoDeadBody`
- `getDescription(): String`
- `getDigType(): String`
- `getDirt(BloodBodyPartType bodyPartType): float`
- `getDiscomfortModifier(): float`
- `getDisplayCategory(): String`
- `getDisplayName(): String`
- `getDoubleClickRecipe(): String`
- `getDropSound(): String`
- `getDurability(): float`
- `getEatTime(): int`
- `getEatType(): String`
- `getEngineLoudness(): float`
- `getEntityNetID(): long`
- `getEquipParent(): IsoGameCharacter`
- `getEquipSound(): String`
- `getEquippedWeight(): float`
- `getEvolvedRecipeName(): String`
- `getExplosionSound(): String`
- `getExtinguishedItem(): InventoryItem`
- `getExtraItems(): ArrayList<String>`
- `getExtraItemsWeight(): float`
- `getFabricType(): String`
- `getFatigueChange(): float`
- `getFileName(): String`
- `getFillFromDispenserSound(): String`
- `getFillFromLakeSound(): String`
- `getFillFromTapSound(): String`
- `getFillFromToiletSound(): String`
- `getFireFuelRatio(): float`
- `getFluidContainerFromSelfOrWorldItem(): FluidContainer`
- `getFoodSicknessChange(): int`
- `getFullType(): String`
- `getG(): float`
- `getGameEntityType(): GameEntityType`
- `getGunType(): ArrayList<String>`
- `getGunTypeString(): String`
- `getHaveBeenRepaired(): int`
- `getHeadCondition(): int`
- `getHeadConditionLowerChance(): int`
- `getHeadConditionLowerChanceMultiplier(): float`
- `getHeadConditionMax(): int`
- `getHearingModifier(): float`
- `getHotbarEquippedWeight(): float`
- `getID(): int`
- `getIcon(): Texture`
- `getIconsForTexture(): ArrayList<String>`
- `getInvHeat(): float`
- `getInverseCoughProbability(): int`
- `getInverseCoughProbabilitySmoker(): int`
- `getIsCraftingConsumed(): boolean`
- `getItemAfterCleaning(): String`
- `getItemCapacity(): float`
- `getItemHeat(): float`
- `getItemReplacementPrimaryHand(): ItemReplacement`
- `getItemReplacementSecondHand(): ItemReplacement`
- `getItemWhenDry(): String`
- `getJobDelta(): float`
- `getJobType(): String`
- `getKeyId(): int`
- `getLastAged(): float`
- `getLightDistance(): int`
- `getLightStrength(): float`
- `getLootType(): String`
- `getLuaCreate(): String`
- `getMagazineSubjects(): List<MagazineSubject>`
- `getMaintenanceMod(): int`
- `getMaintenanceMod(boolean isEquipped): int`
- `getMaintenanceMod(boolean isEquipped, IsoGameCharacter character): int`
- `getMaintenanceMod(IsoGameCharacter character): int`
- `getMakeUpType(): String`
- `getMaxAmmo(): int`
- `getMaxCapacity(): int`
- `getMaxMilk(): int`
- `getMaxSharpness(): float`
- `getMaxUses(): int`
- `getMechanicType(): int`
- `getMediaData(): MediaData`
- `getMediaType(): byte`
- `getMeltingTime(): float`
- `getMetalValue(): float`
- `getMilkReplaceItem(): String`
- `getMinutesToBurn(): float`
- `getMinutesToCook(): float`
- `getModData(): KahluaTable`
- `getModID(): String`
- `getModName(): String`
- `getModelIndex(): int`
- `getModule(): String`
- `getName(): String`
- `getName(IsoPlayer player): String`
- `getOffAge(): int`
- `getOffAgeMax(): int`
- `getOffString(): String`
- `getOnBreak(): String`
- `getOpeningRecipe(): String`
- `getOriginX(): int`
- `getOriginY(): int`
- `getOriginZ(): int`
- `getOutermostContainer(): ItemContainer`
- `getOwner(): IsoGameCharacter`
- `getPlaceMultipleSound(): String`
- `getPlaceOneSound(): String`
- `getPlayer(): IsoPlayer`
- `getPourLiquidOnGroundSound(): String`
- `getPourType(): String`
- `getPreviousOwner(): IsoGameCharacter`
- `getQuality(): int`
- `getR(): float`
- `getRecordedMediaIndex(): short`
- `getReduceInfectionPower(): float`
- `getRegistry_id(): short`
- `getRemoteControlID(): int`
- `getRemoteRange(): int`
- `getReplaceOnExtinguish(): String`
- `getReplaceOnUse(): String`
- `getReplaceOnUseFullType(): String`
- `getReplaceOnUseOn(): String`
- `getReplaceOnUseOnString(): String`
- `getReplaceType(String key): String`
- `getReplaceTypes(): String`
- `getReplaceTypesMap(): HashMap<String, String>`
- `getRequireInHandOrInventory(): ArrayList<String>`
- `getResearchableRecipes(): ArrayList<String>`
- `getResearchableRecipes(IsoGameCharacter chr): ArrayList<String>`
- `getRightClickContainer(): ItemContainer`
- `getScore(SurvivorDesc desc): float`
- `getScriptItem(): Item`
- `getSharpness(): float`
- `getSharpnessIncrement(): float`
- `getSharpnessMultiplier(): float`
- `getShoutMultiplier(): float`
- `getShoutType(): String`
- `getSoundByID(String id): String`
- `getSoundLimiterGroupID(): String`
- `getSoundParameter(String parameterName): String`
- `getSquare(): IsoGridSquare`
- `getStashChance(): int`
- `getStashMap(): String`
- `getStaticModel(): String`
- `getStaticModelException(): String`
- `getStaticModelsByIndex(): ArrayList<String>`
- `getStrainModifier(): float`
- `getStressChange(): float`
- `getStringItemType(): String`
- `getSuspensionCompression(): float`
- `getSuspensionDamping(): float`
- `getSwingAnim(): String`
- `getTags(): Set<ItemTag>`
- `getTaken(): ArrayList<IsoObject>`
- `getTex(): Texture`
- `getTexture(): Texture`
- `getTextureBurnt(): Texture`
- `getTextureColorMask(): Texture`
- `getTextureCooked(): Texture`
- `getTextureFluidMask(): Texture`
- `getTexturerotten(): Texture`
- `getTimesHeadRepaired(): int`
- `getTimesRepaired(): int`
- `getTooltip(): String`
- `getTorchDot(): float`
- `getType(): String`
- `getUnCookedString(): String`
- `getUnequipSound(): String`
- `getUnequippedWeight(): float`
- `getUnhappyChange(): float`
- `getUseDelta(): float`
- `getUser(): IsoGameCharacter`
- `getUses(): int`
- `getVisionModifier(): float`
- `getVisual(): ItemVisual`
- `getWeaponHitArmourSound(): String`
- `getWeaponLevel(): int`
- `getWeight(): float`
- `getWetCooldown(): float`
- `getWetness(): float`
- `getWheelFriction(): float`
- `getWithDrainable(): String`
- `getWithoutDrainable(): String`
- `getWorker(): String`
- `getWorldAlpha(): float`
- `getWorldItem(): IsoWorldInventoryObject`
- `getWorldObjectSprite(): String`
- `getWorldStaticItem(): String`
- `getWorldStaticModel(): String`
- `getWorldStaticModelsByIndex(): ArrayList<String>`
- `getWorldTexture(): String`
- `getWorldXRotation(): float`
- `getWorldYRotation(): float`
- `getWorldZRotation(): float`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `hasBeenHeard(IsoPlayer player): boolean`
- `hasBeenSeen(IsoPlayer player): boolean`
- `hasBlood(): boolean`
- `hasDirt(): boolean`
- `hasHeadCondition(): boolean`
- `hasMetal(): boolean`
- `hasModData(): boolean`
- `hasOrigin(): boolean`
- `hasQuality(): boolean`
- `hasReplaceType(String key): boolean`
- `hasResearchableRecipes(): boolean`
- `hasSharpness(): boolean`
- `hasTag(ItemTag itemTag): boolean`
- `hasTag(ItemTag... tags): boolean`
- `hasTimesHeadRepaired(): boolean`
- `hasWorldItem(): boolean`
- `haveExtraItems(): boolean`
- `headConditionCheck(): boolean`
- `headConditionCheck(int skill): boolean`
- `headConditionCheck(int skill, float multiplier): boolean`
- `headConditionCheck(int skill, float multiplier, boolean maintenance): boolean`
- `headConditionCheck(int skill, float multiplier, boolean maintenance, boolean isEquipped): boolean`
- `incrementCondition(int increment): void`
- `inheritFoodAgeFrom(InventoryItem otherFood): void`
- `inheritOlderFoodAge(InventoryItem otherFood): void`
- `initialiseItem(): void`
- `is(ItemKey... item): boolean`
- `isActivated(): boolean`
- `isAlcoholic(): boolean`
- `isAlwaysWelcomeGift(): boolean`
- `isAnimalCorpse(): boolean`
- `isAnimalFeed(): boolean`
- `isBeingFilled(): boolean`
- `isBloody(): boolean`
- `isBodyLocation(ItemBodyLocation itemBodyLocation): boolean`
- `isBroken(): boolean`
- `isBurnt(): boolean`
- `isCanBandage(): boolean`
- `isConditionAffectsCapacity(): boolean`
- `isCookable(): boolean`
- `isCooked(): boolean`
- `isCustomColor(): boolean`
- `isCustomName(): boolean`
- `isCustomWeight(): boolean`
- `isDamaged(): boolean`
- `isDisappearOnUse(): boolean`
- `isDoingExtendedPlacement(): boolean`
- `isDull(): boolean`
- `isEmittingLight(): boolean`
- `isEmptyOfFluid(): boolean`
- `isEntityValid(): boolean`
- `isEquipped(): boolean`
- `isEquippedNoSprint(): boolean`
- `isFakeEquipped(): boolean`
- `isFakeEquipped(IsoGameCharacter character): boolean`
- `isFavorite(): boolean`
- `isFavouriteRecipeInput(IsoPlayer player): boolean`
- `isFishingLure(): boolean`
- `isFluidContainer(): boolean`
- `isFood(): boolean`
- `isForceDropHeavyItem(): boolean`
- `isFullOfFluid(): boolean`
- `isHidden(): boolean`
- `isHumanCorpse(): boolean`
- `isInLocalPlayerInventory(): boolean`
- `isInPlayerInventory(): boolean`
- `isInfected(): boolean`
- `isInitialised(): boolean`
- `isInsideBagOnSquare(IsoGridSquare square): boolean`
- `isIsCookable(): boolean`
- `isItemType(ItemType itemType): boolean`
- `isKeepOnDeplete(): boolean`
- `isKeyRing(): boolean`
- `isMemento(): boolean`
- `isNoRecipes(IsoPlayer player): boolean`
- `isOnGroundOnSquare(IsoGridSquare square): boolean`
- `isOnGroundOrInsideBagOnSquare(IsoGridSquare square): boolean`
- `isProtectFromRainWhileEquipped(): boolean`
- `isPureWater(boolean includeTainted): boolean`
- `isRecordedMedia(): boolean`
- `isRemoteController(): boolean`
- `isRequiresEquippedBothHands(): boolean`
- `isSealed(): boolean`
- `isSharpenable(): boolean`
- `isSpice(): boolean`
- `isTorchCone(): boolean`
- `isTrap(): boolean`
- `isTwoHandWeapon(): boolean`
- `isUnwanted(IsoPlayer player): boolean`
- `isUseWorldItem(): boolean`
- `isVanilla(): boolean`
- `isVisualAid(): boolean`
- `isWaterOnlySource(): boolean`
- `isWaterSource(): boolean`
- `isWet(): boolean`
- `isWorn(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `loadCorpseFromByteData(IsoGridSquare square): IsoDeadBody`
- `monogramAfterDescriptor(SurvivorDesc desc): void`
- `nameAfterDescriptor(SurvivorDesc desc): void`
- `onBreak(): void`
- `playActivateDeactivateSound(): void`
- `playActivateSound(): void`
- `playDeactivateSound(): void`
- `randomizeCondition(): void`
- `randomizeGeneralCondition(): void`
- `randomizeHeadCondition(): void`
- `randomizeSharpness(): void`
- `randomizeWorldZRotation(): void`
- `reduceCondition(): void`
- `reduceHeadCondition(): void`
- `registerWithSoundLimiter(SoundInstanceLimiter limiter): void`
- `researchRecipes(IsoGameCharacter character): void`
- `save(ByteBuffer output, boolean net): void`
- `saveWithSize(ByteBuffer output, boolean net): void`
- `setActivated(boolean activated): void`
- `setActivatedRemote(boolean activated): void`
- `setActualWeight(float actualWeight): void`
- `setAge(float age): void`
- `setAlcoholPower(float alcoholPower): void`
- `setAlcoholic(boolean alcoholic): void`
- `setAmmoType(AmmoType ammoType): void`
- `setAnimalTracks(AnimalTracks animalTracks): void`
- `setAttachedSlot(int attachedSlot): void`
- `setAttachedSlotType(String attachedSlotType): void`
- `setAttachedToModel(String attachedToModel): void`
- `setAttachmentReplacement(String attachementReplacement): void`
- `setAttachmentType(String attachmentType): void`
- `setAttachmentsProvided(ArrayList<String> attachmentsProvided): void`
- `setAutoAge(): void`
- `setBandagePower(float bandagePower): void`
- `setBeingFilled(boolean v): void`
- `setBlood(BloodBodyPartType bodyPartType, float amount): void`
- `setBloodClothingType(ArrayList<BloodClothingType> bloodClothingType): void`
- `setBloodLevel(float level): void`
- `setBoredomChange(float boredomChange): void`
- `setBrakeForce(float brakeForce): void`
- `setBreakSound(String breakSound): void`
- `setBroken(boolean broken): void`
- `setBurnt(boolean burnt): void`
- `setBurntString(String burntString): void`
- `setCanBeActivated(boolean activatedItem): void`
- `setCanBeRemote(boolean canBeRemote): void`
- `setChanceToSpawnDamaged(int chanceToSpawnDamaged): void`
- `setColor(Color color): void`
- `setColorBlue(float colorBlue): void`
- `setColorGreen(float colorGreen): void`
- `setColorRed(float colorRed): void`
- `setCondition(int condition): void`
- `setCondition(int condition, boolean doSound): void`
- `setConditionFrom(InventoryItem item): void`
- `setConditionFromHeadCondition(InventoryItem item): void`
- `setConditionFromModData(InventoryItem other): void`
- `setConditionLowerNormal(float conditionLowerNormal): void`
- `setConditionLowerOffroad(float conditionLowerOffroad): void`
- `setConditionMax(int conditionMax): void`
- `setConditionNoSound(int condition): void`
- `setConditionTo(InventoryItem item): void`
- `setConditionWhileLoading(int condition): void`
- `setContainer(ItemContainer container): void`
- `setContainerX(int containerX): void`
- `setContainerY(int containerY): void`
- `setCooked(boolean cooked): void`
- `setCookedString(String cookedString): void`
- `setCookingTime(float cookingTime): void`
- `setCount(int count): void`
- `setCountDownSound(String sound): void`
- `setCurrentAmmoCount(int ammo): void`
- `setCurrentUses(int newuses): void`
- `setCurrentUsesFloat(float newUses): void`
- `setCurrentUsesFrom(InventoryItem other): void`
- `setCustomColor(boolean customColor): void`
- `setCustomMenuOption(String customMenuOption): void`
- `setCustomName(boolean customName): void`
- `setCustomWeight(boolean custom): void`
- `setDescription(String description): void`
- `setDirt(BloodBodyPartType bodyPartType, float amount): void`
- `setDisplayCategory(String displayCategory): void`
- `setDoingExtendedPlacement(boolean enable): void`
- `setDurability(float durability): void`
- `setEngineLoudness(float engineLoudness): void`
- `setEquipParent(IsoGameCharacter parent): void`
- `setEquipParent(IsoGameCharacter parent, boolean register): void`
- `setEvolvedRecipeName(String evolvedRecipeName): void`
- `setExplosionSound(String explosionSound): void`
- `setFatigueChange(float fatigueChange): void`
- `setFavorite(boolean favorite): void`
- `setFavorite(boolean favorite, boolean isSyncNeeded): void`
- `setFoodSicknessChange(int foodSicknessChange): void`
- `setGunType(ArrayList<String> gunType): void`
- `setHaveBeenRepaired(int haveBeenRepaired): void`
- `setHeadCondition(int value): void`
- `setHeadConditionFromCondition(InventoryItem item): void`
- `setID(int itemId): void`
- `setIcon(Texture texture): void`
- `setIconsForTexture(ArrayList<String> iconsForTexture): void`
- `setInfected(boolean infected): void`
- `setInitialised(boolean initialised): void`
- `setInverseCoughProbability(int inverseCoughProbability): void`
- `setInverseCoughProbabilitySmoker(int inverseCoughProbabilitySmoker): void`
- `setIsCookable(boolean isCookable): void`
- `setIsCraftingConsumed(boolean craftingConsumed): void`
- `setItemCapacity(float capacity): void`
- `setItemHeat(float itemHeat): void`
- `setItemType(ItemType itemType): void`
- `setItemWhenDry(String itemWhenDry): void`
- `setJobDelta(float delta): void`
- `setJobType(String type): void`
- `setKeyId(int keyId): void`
- `setLastAged(float time): void`
- `setLightDistance(int lightDistance): void`
- `setLightStrength(float lightStrength): void`
- `setMaxAmmo(int maxAmmoCount): void`
- `setMaxCapacity(int maxCapacity): void`
- `setMediaType(byte b): void`
- `setMeltingTime(float meltingTime): void`
- `setMetalValue(float metalValue): void`
- `setMinutesToBurn(float minutesToBurn): void`
- `setMinutesToCook(float minutesToCook): void`
- `setModelIndex(int index): void`
- `setModule(String module): void`
- `setName(String name): void`
- `setNoRecipes(IsoPlayer player, Boolean noCrafting): void`
- `setOffAge(int offAge): void`
- `setOffAgeMax(int offAgeMax): void`
- `setOffString(String offString): void`
- `setOrigin(int x, int y): boolean`
- `setOrigin(int x, int y, int z): boolean`
- `setOrigin(IsoGridSquare sq): boolean`
- `setOriginX(int value): void`
- `setOriginY(int value): void`
- `setOriginZ(int value): void`
- `setPreviousOwner(IsoGameCharacter previousOwner): void`
- `setQuality(int value): void`
- `setRecordedMediaData(MediaData data): void`
- `setRecordedMediaIndex(short id): void`
- `setRecordedMediaIndexInteger(int id): void`
- `setReduceInfectionPower(float reduceInfectionPower): void`
- `setRegistry_id(Item itemscript): void`
- `setRemoteControlID(int remoteControlId): void`
- `setRemoteController(boolean remoteController): void`
- `setRemoteRange(int remoteRange): void`
- `setReplaceOnUse(String replaceOnUse): void`
- `setReplaceOnUseOn(String replaceOnUseOn): void`
- `setRequireInHandOrInventory(ArrayList<String> requireInHandOrInventory): void`
- `setRightClickContainer(ItemContainer rightClickContainer): void`
- `setScriptItem(Item scriptItem): void`
- `setSharpness(float value): void`
- `setSharpnessFrom(InventoryItem item): void`
- `setStashChance(int stashChance): void`
- `setStashMap(String stashMap): void`
- `setStaticModel(String model): void`
- `setStaticModel(ModelKey model): void`
- `setStaticModelsByIndex(ArrayList<String> staticModelsByIndex): void`
- `setStressChange(float stressChange): void`
- `setSuspensionCompression(float suspensionCompression): void`
- `setSuspensionDamping(float suspensionDamping): void`
- `setTaken(ArrayList<IsoObject> taken): void`
- `setTexture(Texture texture): void`
- `setTextureBurnt(Texture textureBurnt): void`
- `setTextureColorMask(String tex): void`
- `setTextureCooked(Texture textureCooked): void`
- `setTextureFluidMask(String tex): void`
- `setTexturerotten(Texture texturerotten): void`
- `setTimesHeadRepaired(int haveBeenRepaired): void`
- `setTimesRepaired(int haveBeenRepaired): void`
- `setTooltip(String tooltip): void`
- `setTorchCone(boolean isTorchCone): void`
- `setType(String type): void`
- `setUnCookedString(String unCookedString): void`
- `setUnhappyChange(float unhappyChange): void`
- `setUnwanted(IsoPlayer player, boolean unwanted): void`
- `setUseDelta(float useDelta): void`
- `setUses(int newuses): void`
- `setUsesFrom(InventoryItem other): void`
- `setWeight(float weight): void`
- `setWet(boolean isWet): void`
- `setWetCooldown(float wetCooldown): void`
- `setWheelFriction(float wheelFriction): void`
- `setWorker(String worker): void`
- `setWorldAlpha(float worldAlpha): void`
- `setWorldItem(IsoWorldInventoryObject w): void`
- `setWorldScale(float scale): void`
- `setWorldStaticItem(String model): void`
- `setWorldStaticModel(String model): void`
- `setWorldStaticModel(ModelKey model): void`
- `setWorldStaticModelsByIndex(ArrayList<String> staticModelsByIndex): void`
- `setWorldTexture(String worldTexture): void`
- `setWorldXRotation(float rot): void`
- `setWorldYRotation(float rot): void`
- `setWorldZRotation(float rot): void`
- `sharpnessCheck(): boolean`
- `sharpnessCheck(int skill): boolean`
- `sharpnessCheck(int skill, float multiplier): boolean`
- `sharpnessCheck(int skill, float multiplier, boolean maintenance): boolean`
- `sharpnessCheck(int skill, float multiplier, boolean maintenance, boolean isEquipped): boolean`
- `shouldUpdateInWorld(): boolean`
- `stopSoundOnPlayer(): void`
- `storeInByteData(IsoObject o): void`
- `syncItemFields(): void`
- `synchWithVisual(): void`
- `toString(): String`
- `tryGetWorldStaticModelByIndex(int index): String`
- `unsealIfNotFull(): void`
- `update(): void`
- `updateAge(): void`
- `updateEquippedAndActivatedSound(): void`
- `updateEquippedAndActivatedSound(BaseSoundEmitter emitter): void`
- `updateSound(BaseSoundEmitter emitter): void`
- `updateSound(BaseSoundEmitter emitter, SoundLimiterParams params): void`

Static functions, called as `InventoryItem.name(...)`:

- `RemoveFromContainer(InventoryItem item): boolean`
- `getNoRecipesModDataString(): String`
- `loadItem(ByteBuffer input, int worldVersion): InventoryItem`
- `loadItem(ByteBuffer input, int worldVersion, boolean doSaveTypeCheck): InventoryItem`
- `loadItem(ByteBuffer input, int worldVersion, boolean doSaveTypeCheck, InventoryItem i): InventoryItem`

Constructors: `InventoryItem.new(String module, String name, String type, String tex)`, `InventoryItem.new(String module, String name, String type, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### ItemContainer

`zombie.inventory.ItemContainer`, class.

Methods, called as `obj:name(...)`:

- `AddItem(String type, float useDelta): boolean`
- `AddItem(String type, float useDelta, boolean synchSpawn): boolean`
- `AddItem(String type): InventoryItem`
- `AddItem(InventoryItem item): InventoryItem`
- `AddItemBlind(InventoryItem item): InventoryItem`
- `AddItems(String type, int count): ArrayList<InventoryItem>`
- `AddItems(ArrayList<InventoryItem> items): ArrayList<InventoryItem>`
- `AddItems(InventoryItem item, int count): ArrayList<InventoryItem>`
- `DoAddItem(InventoryItem item): InventoryItem`
- `DoAddItemBlind(InventoryItem item): InventoryItem`
- `DoRemoveItem(InventoryItem item): void`
- `Find(String itemType): InventoryItem`
- `Find(ItemType itemType): InventoryItem`
- `FindAll(String type): ArrayList<InventoryItem>`
- `FindAndReturn(String type, int count): ArrayList<InventoryItem>`
- `FindAndReturn(String type): InventoryItem`
- `FindAndReturn(String type, ArrayList<InventoryItem> itemToCheck): InventoryItem`
- `FindAndReturnCategory(String category): InventoryItem`
- `FindAndReturnStack(String type): InventoryItem`
- `FindAndReturnStack(InventoryItem itemlike): InventoryItem`
- `FindAndReturnWaterItem(int uses): InventoryItem`
- `FindWaterSource(): InventoryItem`
- `HasType(ItemType itemType): boolean`
- `Remove(String itemTypes): void`
- `Remove(InventoryItem item): void`
- `Remove(ItemType itemType): InventoryItem`
- `RemoveAll(String itemType): ArrayList<InventoryItem>`
- `RemoveAll(String itemType, int count): ArrayList<InventoryItem>`
- `RemoveOneOf(String string): void`
- `RemoveOneOf(String string, boolean insideInv): InventoryItem`
- `SpawnItem(String type, float useDelta): boolean`
- `SpawnItem(InventoryItem item): void`
- `SpawnItem(String type): InventoryItem`
- `addItem(ItemKey item): T`
- `addItem(InventoryItem item): InventoryItem`
- `addItems(ItemKey item, int count): List<InventoryItem>`
- `addItemsToProcessItems(): void`
- `canCharacterOpenVehicleDoor(IsoGameCharacter playerObj): boolean`
- `canCharacterUnlockVehicleDoor(IsoGameCharacter playerObj): boolean`
- `canHumanCorpseFit(IsoGameCharacter chr): boolean`
- `canItemFit(InventoryItem item, IsoGameCharacter chr): boolean`
- `clear(): void`
- `contains(T itemToCompare, Invokers.Params2.Boolean.ICallback<T, InventoryItem> predicate, boolean doInv): boolean`
- `contains(String type): boolean`
- `contains(String type, boolean doInv): boolean`
- `contains(String type, boolean doInv, boolean ignoreBroken): boolean`
- `contains(InventoryItem item): boolean`
- `contains(InventoryItem itemToFind, boolean doInv): boolean`
- `contains(Invokers.Params2.Boolean.IParam2<InventoryItem> predicate, boolean doInv): boolean`
- `containsEval(LuaClosure functionObj): boolean`
- `containsEvalArg(LuaClosure functionObj, Object arg): boolean`
- `containsEvalArgRecurse(LuaClosure functionObj, Object arg): boolean`
- `containsEvalRecurse(LuaClosure functionObj): boolean`
- `containsHumanCorpse(): boolean`
- `containsID(int id): boolean`
- `containsRecursive(InventoryItem item): boolean`
- `containsTag(ItemTag itemTag): boolean`
- `containsTagEval(ItemTag itemTag, LuaClosure functionObj): boolean`
- `containsTagEvalArgRecurse(ItemTag itemTag, LuaClosure functionObj, Object arg): boolean`
- `containsTagEvalRecurse(ItemTag itemTag, LuaClosure functionObj): boolean`
- `containsTagRecurse(ItemTag itemTag): boolean`
- `containsType(String type): boolean`
- `containsTypeEvalArgRecurse(String type, LuaClosure functionObj, Object arg): boolean`
- `containsTypeEvalRecurse(String type, LuaClosure functionObj): boolean`
- `containsTypeRecurse(String type): boolean`
- `containsTypeRecurse(ItemKey type): boolean`
- `containsWithModule(String moduleType): boolean`
- `containsWithModule(String moduleType, boolean withDeltaLeft): boolean`
- `doesVehicleDoorNeedOpening(): boolean`
- `dumpContentsInSquare(IsoGridSquare sq): void`
- `emptyIt(): void`
- `findHumanCorpseItem(): InventoryItem`
- `findItem(T itemToCompare, Invokers.Params2.Boolean.ICallback<T, InventoryItem> predicate, boolean doInv): InventoryItem`
- `findItem(String type, boolean doInv, boolean ignoreBroken): InventoryItem`
- `findItem(Invokers.Params2.Boolean.IParam2<InventoryItem> predicate, boolean doInv): InventoryItem`
- `getAcceptItemFunction(): String`
- `getAgeFactor(): float`
- `getAll(Predicate<InventoryItem> predicate): ArrayList<InventoryItem>`
- `getAll(Predicate<InventoryItem> predicate, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllCategory(String category): ArrayList<InventoryItem>`
- `getAllCategory(String category, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllCategoryRecurse(String category, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllCleaningFluidSources(): ArrayList<InventoryItem>`
- `getAllEval(LuaClosure functionObj): ArrayList<InventoryItem>`
- `getAllEval(LuaClosure functionObj, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllEvalArg(LuaClosure functionObj, Object arg): ArrayList<InventoryItem>`
- `getAllEvalArg(LuaClosure functionObj, Object arg, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllEvalArgRecurse(LuaClosure functionObj, Object arg): ArrayList<InventoryItem>`
- `getAllEvalArgRecurse(LuaClosure functionObj, Object arg, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllEvalRecurse(LuaClosure functionObj): ArrayList<InventoryItem>`
- `getAllEvalRecurse(LuaClosure functionObj, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllFoodsForAnimals(): ArrayList<InventoryItem>`
- `getAllItems(LinkedHashMap<String, InventoryItem> items, boolean inInv): LinkedHashMap<String, InventoryItem>`
- `getAllRecurse(Predicate<InventoryItem> predicate): ArrayList<InventoryItem>`
- `getAllRecurse(Predicate<InventoryItem> predicate, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTag(ItemTag itemTag): ArrayList<InventoryItem>`
- `getAllTag(ItemTag itemTag, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTagEval(ItemTag itemTag, LuaClosure functionObj): ArrayList<InventoryItem>`
- `getAllTagEval(ItemTag itemTag, LuaClosure functionObj, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTagEvalArg(ItemTag itemTag, LuaClosure functionObj, Object arg): ArrayList<InventoryItem>`
- `getAllTagEvalArg(ItemTag itemTag, LuaClosure functionObj, Object arg, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTagEvalArgRecurse(ItemTag itemTag, LuaClosure functionObj, Object arg, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTagEvalRecurse(ItemTag itemTag, LuaClosure functionObj, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTagRecurse(ItemTag itemTag, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllType(String type): ArrayList<InventoryItem>`
- `getAllType(String type, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTypeEval(String type, LuaClosure functionObj): ArrayList<InventoryItem>`
- `getAllTypeEval(String type, LuaClosure functionObj, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTypeEvalArg(String type, LuaClosure functionObj, Object arg): ArrayList<InventoryItem>`
- `getAllTypeEvalArg(String type, LuaClosure functionObj, Object arg, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTypeEvalArgRecurse(String type, LuaClosure functionObj, Object arg): ArrayList<InventoryItem>`
- `getAllTypeEvalArgRecurse(String type, LuaClosure functionObj, Object arg, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTypeEvalRecurse(String type, LuaClosure functionObj): ArrayList<InventoryItem>`
- `getAllTypeEvalRecurse(String type, LuaClosure functionObj, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllTypeRecurse(String type): ArrayList<InventoryItem>`
- `getAllTypeRecurse(String type, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getAllWaterFillables(): ArrayList<InventoryItem>`
- `getAllWaterFluidSources(boolean includeTainted): ArrayList<InventoryItem>`
- `getAnimalInventoryItem(IsoAnimal animal): AnimalInventoryItem`
- `getAvailableFluidContainer(String type): ArrayList<InventoryItem>`
- `getAvailableFluidContainersCapacity(String type): float`
- `getAvailableWeightCapacity(): float`
- `getBest(Predicate<InventoryItem> predicate, Comparator<InventoryItem> comparator): InventoryItem`
- `getBestBandage(SurvivorDesc descriptor): InventoryItem`
- `getBestCondition(String type): InventoryItem`
- `getBestCondition(Predicate<InventoryItem> predicate): InventoryItem`
- `getBestConditionEval(LuaClosure functionObj): InventoryItem`
- `getBestConditionEvalArg(LuaClosure functionObj, Object arg): InventoryItem`
- `getBestConditionEvalArgRecurse(LuaClosure functionObj, Object arg): InventoryItem`
- `getBestConditionEvalRecurse(LuaClosure functionObj): InventoryItem`
- `getBestConditionRecurse(String type): InventoryItem`
- `getBestConditionRecurse(Predicate<InventoryItem> predicate): InventoryItem`
- `getBestEval(LuaClosure predicateObj, LuaClosure comparatorObj): InventoryItem`
- `getBestEvalArg(LuaClosure predicateObj, LuaClosure comparatorObj, Object arg): InventoryItem`
- `getBestEvalArgRecurse(LuaClosure predicateObj, LuaClosure comparatorObj, Object arg): InventoryItem`
- `getBestEvalRecurse(LuaClosure predicateObj, LuaClosure comparatorObj): InventoryItem`
- `getBestFood(SurvivorDesc descriptor): InventoryItem`
- `getBestRecurse(Predicate<InventoryItem> predicate, Comparator<InventoryItem> comparator): InventoryItem`
- `getBestType(String type, Comparator<InventoryItem> comparator): InventoryItem`
- `getBestTypeEval(String type, LuaClosure comparatorObj): InventoryItem`
- `getBestTypeEvalArg(String type, LuaClosure comparatorObj, Object arg): InventoryItem`
- `getBestTypeEvalArgRecurse(String type, LuaClosure comparatorObj, Object arg): InventoryItem`
- `getBestTypeEvalRecurse(String type, LuaClosure comparatorObj): InventoryItem`
- `getBestTypeRecurse(String type, Comparator<InventoryItem> comparator): InventoryItem`
- `getBestWeapon(): InventoryItem`
- `getBestWeapon(SurvivorDesc desc): InventoryItem`
- `getCapacity(): int`
- `getCapacityWeight(): float`
- `getCharacter(): IsoGameCharacter`
- `getCloseSound(): String`
- `getContainerPosition(): String`
- `getContainingItem(): InventoryItem`
- `getContentsWeight(): float`
- `getCookingFactor(): float`
- `getCount(Predicate<InventoryItem> predicate): int`
- `getCountEval(LuaClosure functionObj): int`
- `getCountEvalArg(LuaClosure functionObj, Object arg): int`
- `getCountEvalArgRecurse(LuaClosure functionObj, Object arg): int`
- `getCountEvalRecurse(LuaClosure functionObj): int`
- `getCountRecurse(Predicate<InventoryItem> predicate): int`
- `getCountTag(ItemTag itemTag): int`
- `getCountTagEval(ItemTag itemTag, LuaClosure functionObj): int`
- `getCountTagEvalArg(ItemTag itemTag, LuaClosure functionObj, Object arg): int`
- `getCountTagEvalArgRecurse(ItemTag itemTag, LuaClosure functionObj, Object arg): int`
- `getCountTagEvalRecurse(ItemTag itemTag, LuaClosure functionObj): int`
- `getCountTagRecurse(ItemTag itemTag): int`
- `getCountType(String type): int`
- `getCountTypeEval(String type, LuaClosure functionObj): int`
- `getCountTypeEvalArg(String type, LuaClosure functionObj, Object arg): int`
- `getCountTypeEvalArgRecurse(String type, LuaClosure functionObj, Object arg): int`
- `getCountTypeEvalRecurse(String type, LuaClosure functionObj): int`
- `getCountTypeRecurse(String type): int`
- `getCustomName(): String`
- `getCustomTemperature(): float`
- `getDisplayType(): String`
- `getEffectiveCapacity(IsoGameCharacter chr): int`
- `getFirst(Predicate<InventoryItem> predicate): InventoryItem`
- `getFirstAvailableFluidContainer(String type): InventoryItem`
- `getFirstCategory(String category): InventoryItem`
- `getFirstCategoryRecurse(String category): InventoryItem`
- `getFirstCleaningFluidSources(): InventoryItem`
- `getFirstEval(LuaClosure functionObj): InventoryItem`
- `getFirstEvalArg(LuaClosure functionObj, Object arg): InventoryItem`
- `getFirstEvalArgRecurse(LuaClosure functionObj, Object arg): InventoryItem`
- `getFirstEvalRecurse(LuaClosure functionObj): InventoryItem`
- `getFirstFluidContainer(String type): InventoryItem`
- `getFirstRecurse(Predicate<InventoryItem> predicate): InventoryItem`
- `getFirstTag(ItemTag itemTag): InventoryItem`
- `getFirstTagEval(ItemTag itemTag, LuaClosure functionObj): InventoryItem`
- `getFirstTagEvalArgRecurse(ItemTag itemTag, LuaClosure functionObj, Object arg): InventoryItem`
- `getFirstTagEvalRecurse(ItemTag itemTag, LuaClosure functionObj): InventoryItem`
- `getFirstTagRecurse(ItemTag itemTag): InventoryItem`
- `getFirstType(String type): InventoryItem`
- `getFirstTypeEval(String type, LuaClosure functionObj): InventoryItem`
- `getFirstTypeEvalArgRecurse(String type, LuaClosure functionObj, Object arg): InventoryItem`
- `getFirstTypeEvalRecurse(String type, LuaClosure functionObj): InventoryItem`
- `getFirstTypeEvalRecurse(ItemKey key, LuaClosure functionObj): InventoryItem`
- `getFirstTypeRecurse(String type): InventoryItem`
- `getFirstTypeRecurse(ItemKey key): InventoryItem`
- `getFirstWaterFluidSources(boolean includeTainted): InventoryItem`
- `getFirstWaterFluidSources(boolean includeTainted, boolean taintedPriority): InventoryItem`
- `getFreeCapacity(IsoGameCharacter chr): float`
- `getFreezerPosition(): String`
- `getItemById(long id): InventoryItem`
- `getItemCount(String type): int`
- `getItemCount(String type, boolean doBags): int`
- `getItemCount(ItemKey type): int`
- `getItemCountFromTypeRecurse(String type): int`
- `getItemCountRecurse(String type): int`
- `getItemCountRecurse(ItemKey type): int`
- `getItemFromTag(ItemTag itemTag, boolean ignoreBroken, boolean includeInv): InventoryItem`
- `getItemFromTag(ItemTag itemTag, IsoGameCharacter chr, boolean notEquipped, boolean ignoreBroken, boolean includeInv): InventoryItem`
- `getItemFromType(String type): InventoryItem`
- `getItemFromType(String type, boolean ignoreBroken, boolean includeInv): InventoryItem`
- `getItemFromType(String type, IsoGameCharacter chr, boolean notEquipped, boolean ignoreBroken, boolean includeInv): InventoryItem`
- `getItemFromTypeRecurse(String type): InventoryItem`
- `getItemWithID(int id): InventoryItem`
- `getItemWithIDRecursiv(int id): InventoryItem`
- `getItems(): ArrayList<InventoryItem>`
- `getItems4Admin(): LinkedHashMap<String, InventoryItem>`
- `getItemsFromCategory(String category): ArrayList<InventoryItem>`
- `getItemsFromFullType(String type): ArrayList<InventoryItem>`
- `getItemsFromFullType(String type, boolean includeInv): ArrayList<InventoryItem>`
- `getItemsFromType(String type): ArrayList<InventoryItem>`
- `getItemsFromType(String type, boolean includeInv): ArrayList<InventoryItem>`
- `getMaxWeight(): float`
- `getNumItems(String itemLike): int`
- `getNumberOfItem(String findItem): int`
- `getNumberOfItem(String findItem, boolean includeReplaceOnDeplete): int`
- `getNumberOfItem(String findItem, boolean includeReplaceOnDeplete, boolean insideInv): int`
- `getNumberOfItem(String findItem, boolean includeReplaceOnDeplete, ArrayList<ItemContainer> containers): int`
- `getOnlyAcceptCategory(): String`
- `getOpenSound(): String`
- `getOutermostContainer(): ItemContainer`
- `getParent(): IsoObject`
- `getPutSound(): String`
- `getRecipeItem(String recipe, IsoGameCharacter chr, boolean recursive): InventoryItem`
- `getSoapList(List<InventoryItem> result, boolean includeLiquidSoap): List<InventoryItem>`
- `getSome(Predicate<InventoryItem> predicate, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeCategory(String category, int count): ArrayList<InventoryItem>`
- `getSomeCategory(String category, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeCategoryRecurse(String category, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeEval(LuaClosure functionObj, int count): ArrayList<InventoryItem>`
- `getSomeEval(LuaClosure functionObj, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeEvalArg(LuaClosure functionObj, Object arg, int count): ArrayList<InventoryItem>`
- `getSomeEvalArg(LuaClosure functionObj, Object arg, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeEvalArgRecurse(LuaClosure functionObj, Object arg, int count): ArrayList<InventoryItem>`
- `getSomeEvalArgRecurse(LuaClosure functionObj, Object arg, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeEvalRecurse(LuaClosure functionObj, int count): ArrayList<InventoryItem>`
- `getSomeEvalRecurse(LuaClosure functionObj, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeRecurse(Predicate<InventoryItem> predicate, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTag(ItemTag itemTag, int count): ArrayList<InventoryItem>`
- `getSomeTag(ItemTag itemTag, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTagEval(ItemTag itemTag, LuaClosure functionObj, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTagEvalArg(ItemTag itemTag, LuaClosure functionObj, Object arg, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTagEvalArgRecurse(ItemTag itemTag, LuaClosure functionObj, Object arg, int count): ArrayList<InventoryItem>`
- `getSomeTagEvalArgRecurse(ItemTag itemTag, LuaClosure functionObj, Object arg, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTagEvalRecurse(ItemTag itemTag, LuaClosure functionObj, int count): ArrayList<InventoryItem>`
- `getSomeTagEvalRecurse(ItemTag itemTag, LuaClosure functionObj, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTagRecurse(ItemTag itemTag, int count): ArrayList<InventoryItem>`
- `getSomeTagRecurse(ItemTag itemTag, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeType(String type, int count): ArrayList<InventoryItem>`
- `getSomeType(String type, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTypeEval(String type, LuaClosure functionObj, int count): ArrayList<InventoryItem>`
- `getSomeTypeEval(String type, LuaClosure functionObj, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTypeEvalArg(String type, LuaClosure functionObj, Object arg, int count): ArrayList<InventoryItem>`
- `getSomeTypeEvalArg(String type, LuaClosure functionObj, Object arg, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTypeEvalArgRecurse(String type, LuaClosure functionObj, Object arg, int count): ArrayList<InventoryItem>`
- `getSomeTypeEvalArgRecurse(String type, LuaClosure functionObj, Object arg, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTypeEvalRecurse(String type, LuaClosure functionObj, int count): ArrayList<InventoryItem>`
- `getSomeTypeEvalRecurse(String type, LuaClosure functionObj, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSomeTypeRecurse(String type, int count): ArrayList<InventoryItem>`
- `getSomeTypeRecurse(String type, int count, ArrayList<InventoryItem> result): ArrayList<InventoryItem>`
- `getSourceGrid(): IsoGridSquare`
- `getSquare(): IsoGridSquare`
- `getTakeSound(): String`
- `getTemperature(): float`
- `getTemprature(): float`
- `getTotalFoodScore(SurvivorDesc desc): float`
- `getTotalWeaponScore(SurvivorDesc desc): float`
- `getType(): String`
- `getUsesRecurse(Predicate<InventoryItem> predicate): int`
- `getUsesType(String type): int`
- `getUsesTypeRecurse(String type): int`
- `getVehicle(): BaseVehicle`
- `getVehicleDoor(): VehicleDoor`
- `getVehicleDoorPart(): VehiclePart`
- `getVehiclePart(): VehiclePart`
- `getVehiclePartOwner(): VehiclePartOwner`
- `getVehicleSeatDoor(): VehicleDoor`
- `getVehicleSeatDoorPart(): VehiclePart`
- `getWaterContainerCount(): int`
- `getWeightReduction(): int`
- `getWorldItem(): IsoWorldInventoryObject`
- `getWorldPosition(Vector2 result): Vector2`
- `hasRecipe(String recipe, IsoGameCharacter chr): boolean`
- `hasRecipe(String recipe, IsoGameCharacter chr, boolean recursive): boolean`
- `hasRoomFor(IsoGameCharacter chr, float weightVal): boolean`
- `hasRoomFor(IsoGameCharacter chr, float weightVal, float weightAddedToFloor): boolean`
- `hasRoomFor(IsoGameCharacter chr, InventoryItem item): boolean`
- `hasWorldItem(): boolean`
- `haveThisKeyId(int keyId): InventoryItem`
- `isActive(): boolean`
- `isCorpse(): boolean`
- `isDirty(): boolean`
- `isDrawDirty(): boolean`
- `isEmpty(): boolean`
- `isEmptyOrUnwanted(IsoPlayer player): boolean`
- `isExistYet(): boolean`
- `isExplored(): boolean`
- `isFreezer(): boolean`
- `isFridge(): boolean`
- `isFridgeOrFreezerWarming(): boolean`
- `isFull(IsoGameCharacter chr): boolean`
- `isHasBeenLooted(): boolean`
- `isInCharacterInventory(IsoGameCharacter chr): boolean`
- `isInside(InventoryItem item): boolean`
- `isIsDevice(): boolean`
- `isItemAllowed(InventoryItem item): boolean`
- `isLockedToCharacter(IsoGameCharacter chr): boolean`
- `isMicrowave(): boolean`
- `isOccupiedVehicleSeat(): boolean`
- `isPowered(): boolean`
- `isRemoveItemAllowed(InventoryItem item): boolean`
- `isShop(): boolean`
- `isStove(): boolean`
- `isTemperatureChanging(): boolean`
- `isVehiclePart(): boolean`
- `isVehicleSeat(): boolean`
- `load(ByteBuffer input, int worldVersion): ArrayList<InventoryItem>`
- `removeAllItems(): void`
- `removeItemOnServer(InventoryItem item): void`
- `removeItemWithID(int id): boolean`
- `removeItemWithIDRecurse(int id): boolean`
- `removeItemsFromProcessItems(): void`
- `requestServerItemsForContainer(): void`
- `requestSync(): void`
- `reset(): void`
- `save(ByteBuffer output): ArrayList<InventoryItem>`
- `save(ByteBuffer output, IsoGameCharacter noCompress): ArrayList<InventoryItem>`
- `setAcceptItemFunction(String functionName): void`
- `setActive(boolean active): void`
- `setAgeFactor(float ageFactor): void`
- `setCapacity(int capacity): void`
- `setCloseSound(String closeSound): void`
- `setContainerPosition(String containerPosition): void`
- `setCookingFactor(float cookingFactor): void`
- `setCustomName(String name): void`
- `setCustomTemperature(float newTemp): void`
- `setDirty(boolean dirty): void`
- `setDrawDirty(boolean b): void`
- `setExplored(boolean b): void`
- `setFreezerPosition(String freezerPosition): void`
- `setHasBeenLooted(boolean hasBeenLooted): void`
- `setIsDevice(boolean isDevice): void`
- `setItems(ArrayList<InventoryItem> items): void`
- `setOnlyAcceptCategory(String onlyAcceptCategory): void`
- `setOpenSound(String openSound): void`
- `setParent(IsoObject parent): void`
- `setPutSound(String putSound): void`
- `setSourceGrid(IsoGridSquare sourceGrid): void`
- `setTakeSound(String takeSound): void`
- `setType(String type): void`
- `setWeightReduction(int weightReduction): void`
- `takeItemsFrom(ItemContainer other): void`
- `toString(): String`

Static functions, called as `ItemContainer.name(...)`:

- `floatingPointCorrection(float val): float`
- `isObjectPowered(IsoObject parent, boolean includeGenerators): boolean`

Constructors: `ItemContainer.new()`, `ItemContainer.new(int id)`, `ItemContainer.new(int id, String containerName, IsoGridSquare square, IsoObject parent)`, `ItemContainer.new(String containerName, IsoGridSquare square, IsoObject parent)`.

Static fields (a copy of the value taken when the class is exposed): `COLD_LOSS_HOURS: float`, `FRIDGE_FREEZER_TEMPERATURE: float`, `POWER_SHUTOFF_HOUR_OF_DAY: float`.

### ItemPickerJava

`zombie.inventory.ItemPickerJava`, class.

Static functions, called as `ItemPickerJava.name(...)`:

- `DoWeaponUpgrade(InventoryItem item): void`
- `InitSandboxLootSettings(): void`
- `Parse(): void`
- `addVehicleKeyAsLoot(InventoryItem spawnItem, ItemContainer container): boolean`
- `containerHasZone(ItemContainer container, String zone): boolean`
- `doOverlaySprite(IsoGridSquare sq): void`
- `doRollItem(ItemPickerJava.ItemPickerContainer containerDist, ItemContainer container, float zombieDensity, IsoGameCharacter character, boolean doItemContainer, ItemPickerJava.ItemPickerRoom roomDist): void`
- `fillContainer(ItemContainer container, IsoPlayer player): void`
- `fillContainerType(ItemPickerJava.ItemPickerRoom roomDist, ItemContainer container, String roomName, IsoGameCharacter character): void`
- `getActualSpawnChance(ItemPickerJava.ItemPickerItem item, IsoGameCharacter character, ItemContainer container, float zombieDensity, boolean isJunk): float`
- `getAdjustedZombieDensity(float zombieDensity, Item scriptItem, boolean isJunk): float`
- `getBaseChance(ItemPickerJava.ItemPickerItem item, IsoGameCharacter character, boolean isJunk): float`
- `getBaseChanceMultiplier(IsoGameCharacter character, boolean isJunk, Item scriptItem): float`
- `getContainerZombiesType(ItemContainer container): String`
- `getItemContainer(String room, String container, String proceduralName, boolean junk): ItemPickerJava.ItemPickerContainer`
- `getItemPickerContainers(): THashMap<String, ItemPickerJava.ItemPickerContainer>`
- `getLootDebugString(IsoObject object): String`
- `getLootModifier(String itemname): float`
- `getLootModifier(String itemName, boolean isJunk): float`
- `getLootModifierFromType(String lootType): float`
- `getLootType(Item item): String`
- `getSquareBuildingName(IsoGridSquare square): String`
- `getSquareRegion(IsoGridSquare square): String`
- `getSquareZombiesType(IsoGridSquare square): String`
- `getZombieDensityFactor(ItemPickerJava.ItemPickerContainer containerDist, ItemContainer container): float`
- `hasDistributionForContainerInRoom(String containerType, String roomdef): boolean`
- `hasDistributionForRoom(String roomdef): boolean`
- `isGoodKey(String vehicleType): boolean`
- `itemSpawnSanityCheck(InventoryItem spawnItem): void`
- `itemSpawnSanityCheck(InventoryItem spawnItem, ItemContainer container): void`
- `keyNamerBuilding(InventoryItem item, IsoGridSquare square): void`
- `onCreateRegion(InventoryItem item, String region): void`
- `rollContainerItem(InventoryContainer bag, IsoGameCharacter character, ItemPickerJava.ItemPickerContainer containerDist): void`
- `rollItem(ItemPickerJava.ItemPickerContainer containerDist, ItemContainer container, boolean doItemContainer, IsoGameCharacter character, ItemPickerJava.ItemPickerRoom roomDist): void`
- `rotItem(InventoryItem spawnItem): void`
- `spawnLootCarKey(InventoryItem spawnItem, ItemContainer container): void`
- `spawnLootCarKey(InventoryItem spawnItem, ItemContainer container, ItemContainer outtermost): void`
- `squareHasZone(IsoGridSquare square, String zone): boolean`
- `trashItem(InventoryItem spawnItem): void`
- `trashItemLooted(InventoryItem spawnItem): void`
- `trashItemRats(InventoryItem spawnItem): void`
- `tryAddItemToContainer(ItemContainer container, String itemType, ItemPickerJava.ItemPickerContainer containerDist): InventoryItem`
- `updateOverlaySprite(IsoObject obj): void`
- `wearDownItem(InventoryItem spawnItem): void`

Constructors: `ItemPickerJava.new()`.

Static fields (a copy of the value taken when the class is exposed): `NoContainerFillRooms: ArrayList<String>`, `ProceduralDistributions: THashMap<String, ItemPickerJava.ItemPickerContainer>`, `VehicleDistributions: THashMap<String, ItemPickerJava.VehicleDistribution>`, `WeaponUpgradeMap: HashMap<String, ItemPickerJava.ItemPickerUpgradeWeapons>`, `WeaponUpgrades: ArrayList<ItemPickerJava.ItemPickerUpgradeWeapons>`, `containers: THashMap<String, ItemPickerJava.ItemPickerContainer>`, `rooms: THashMap<String, ItemPickerJava.ItemPickerRoom>`, `zombieDensityCap: float`.

### ItemPickerJava.KeyNamer

`zombie.inventory.ItemPickerJava.KeyNamer`, class.

Static functions, called as `ItemPickerJava.KeyNamer.name(...)`:

- `clear(): void`
- `getName(IsoGridSquare square): String`
- `nameKey(InventoryItem item, IsoGridSquare square): void`

Constructors: `ItemPickerJava.KeyNamer.new()`.

Static fields (a copy of the value taken when the class is exposed): `badZones: ArrayList<String>`, `bigBuildingRooms: ArrayList<String>`, `restaurantSubstrings: ArrayList<String>`, `restaurants: ArrayList<String>`, `roomSubstrings: ArrayList<String>`, `rooms: ArrayList<String>`.

### ItemSpawner

`zombie.inventory.ItemSpawner`, abstract class.

Static functions, called as `ItemSpawner.name(...)`:

- `spawnItem(String itemType, ItemContainer container): InventoryItem`
- `spawnItem(String itemType, ItemContainer container, boolean fill): InventoryItem`
- `spawnItem(String itemType, IsoGridSquare square, float x, float y, float z): InventoryItem`
- `spawnItem(String itemType, IsoGridSquare square, float x, float y, float z, boolean fill): InventoryItem`
- `spawnItem(InventoryItem item, ItemContainer container): InventoryItem`
- `spawnItem(InventoryItem item, ItemContainer container, boolean fill): InventoryItem`
- `spawnItem(InventoryItem item, IsoGridSquare square): InventoryItem`
- `spawnItem(InventoryItem item, IsoGridSquare square, boolean fill): InventoryItem`
- `spawnItem(InventoryItem item, IsoGridSquare square, float x, float y, float z): InventoryItem`
- `spawnItem(InventoryItem item, IsoGridSquare square, float x, float y, float z, boolean fill): InventoryItem`
- `spawnItems(String itemType, int count, ItemContainer container): List<InventoryItem>`
- `spawnItems(InventoryItem item, int count, ItemContainer container): List<InventoryItem>`

Constructors: `ItemSpawner.new()`.

### RecipeManager

`zombie.inventory.RecipeManager`, class.

Static functions, called as `RecipeManager.name(...)`:

- `DoesUseItemUp(String itemToUse, Recipe recipe): boolean`
- `DoesWipeUseDelta(String itemToUse, String itemToMake): boolean`
- `GetMovableRecipeTool(boolean isPrimary, Recipe recipe, InventoryItem selectedItem, IsoGameCharacter chr, ArrayList<ItemContainer> containers): InventoryItem`
- `HasAllRequiredItems(Recipe recipe, IsoGameCharacter chr, InventoryItem selectedItem, ArrayList<ItemContainer> containers): boolean`
- `IsItemDestroyed(String itemToUse, Recipe recipe): boolean`
- `IsRecipeValid(Recipe recipe, IsoGameCharacter chr, InventoryItem item, ArrayList<ItemContainer> containers): boolean`
- `LoadedAfterLua(): void`
- `PerformMakeItem(Recipe recipe, InventoryItem selectedItem, IsoGameCharacter chr, ArrayList<ItemContainer> containers): ArrayList<InventoryItem>`
- `ScriptsLoaded(): void`
- `UseAmount(String sourceFullType, Recipe recipe, IsoGameCharacter chr): float`
- `getAllEvolvedRecipes(): ArrayList<EvolvedRecipe>`
- `getAvailableItemsAll(Recipe recipe, IsoGameCharacter chr, ArrayList<ItemContainer> containers, InventoryItem selectedItem, ArrayList<InventoryItem> ignoreItems): ArrayList<InventoryItem>`
- `getAvailableItemsNeeded(Recipe recipe, IsoGameCharacter chr, ArrayList<ItemContainer> containers, InventoryItem selectedItem, ArrayList<InventoryItem> ignoreItems): ArrayList<InventoryItem>`
- `getDismantleRecipeFor(String item): Recipe`
- `getEvolvedRecipe(InventoryItem baseItem, IsoGameCharacter chr, ArrayList<ItemContainer> containers, boolean need1ingredient): ArrayList<EvolvedRecipe>`
- `getKnownRecipesNumber(IsoGameCharacter chr): int`
- `getNumberOfTimesRecipeCanBeDone(Recipe recipe, IsoGameCharacter chr, ArrayList<ItemContainer> containers, InventoryItem selectedItem): int`
- `getSourceItemsAll(Recipe recipe, int sourceIndex, IsoGameCharacter chr, ArrayList<ItemContainer> containers, InventoryItem selectedItem, ArrayList<InventoryItem> ignoreItems): ArrayList<InventoryItem>`
- `getSourceItemsNeeded(Recipe recipe, int sourceIndex, IsoGameCharacter chr, ArrayList<ItemContainer> containers, InventoryItem selectedItem, ArrayList<InventoryItem> ignoreItems): ArrayList<InventoryItem>`
- `getUniqueRecipeItems(InventoryItem item, IsoGameCharacter chr, ArrayList<ItemContainer> containers): ArrayList<Recipe>`
- `hasHeat(Recipe recipe, InventoryItem item, ArrayList<ItemContainer> containers, IsoGameCharacter chr): boolean`
- `isAllItemsUsableRotten(Recipe recipe, IsoGameCharacter chr, InventoryItem selectedItem, ArrayList<ItemContainer> containers): boolean`
- `printDebugRecipeValid(Recipe recipe, IsoGameCharacter chr, InventoryItem item, ArrayList<ItemContainer> containers): void`
- `validateHasHeat(Recipe recipe, InventoryItem item, ArrayList<ItemContainer> containers, IsoGameCharacter chr): boolean`
- `validateRecipeContainsSourceItem(Recipe recipe, InventoryItem item): boolean`

Constructors: `RecipeManager.new()`.

### RecipeMonitor

`zombie.inventory.recipemanager.RecipeMonitor`, class.

Static functions, called as `RecipeMonitor.name(...)`:

- `DecTab(): void`
- `Enable(boolean b): void`
- `GetColorForLine(int i): Color`
- `GetColors(): ArrayList<Color>`
- `GetLines(): ArrayList<String>`
- `GetSaveDir(): String`
- `IncTab(): void`
- `IsEnabled(): boolean`
- `Log(String s): void`
- `Log(String s, Color c): void`
- `LogBlanc(): void`
- `LogInit(Recipe recipe, IsoGameCharacter character, ArrayList<ItemContainer> containers, InventoryItem selectedItem, ArrayList<InventoryItem> ignoreItems, boolean allItems): void`
- `LogItem(String tag, InventoryItem item): void`
- `LogList(String tag, ArrayList<T> sourceTypes): void`
- `LogSources(List<Recipe.Source> sources): void`
- `ResetTabs(): void`
- `SaveToFile(): void`
- `SetTab(int i): void`
- `StartMonitor(): void`
- `canLog(): boolean`
- `getColBlack(): Color`
- `getColGray(): Color`
- `getContainerString(ItemContainer container): String`
- `getMonitorID(): int`
- `getRecipe(): Recipe`
- `getRecipeLines(): ArrayList<String>`
- `getRecipeName(): String`
- `getResultString(Recipe.Result result): String`
- `resume(): void`
- `setRecipe(Recipe recipe): void`
- `suspend(): void`

Constructors: `RecipeMonitor.new()`.

Static fields (a copy of the value taken when the class is exposed): `colGray: Color`, `colHeader: Color`, `colNeg: Color`, `colPos: Color`.

### AlarmClock

`zombie.inventory.types.AlarmClock`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (623), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `finishupdate(): boolean`
- `getAlarmSound(): String`
- `getAlarmSquare(): IsoGridSquare`
- `getCategory(): String`
- `getHour(): int`
- `getMinute(): int`
- `getSoundRadius(): int`
- `isAlarmSet(): boolean`
- `isDigital(): boolean`
- `isRinging(): boolean`
- `load(ByteBuffer input, int worldversion): void`
- `save(ByteBuffer output, boolean net): void`
- `setAlarmSet(boolean alarmSet): void`
- `setAlarmSound(String alarmSound): void`
- `setForceDontRing(int min): void`
- `setHour(int hour): void`
- `setMinute(int min): void`
- `setSoundRadius(int soundRadius): void`
- `shouldUpdateInWorld(): boolean`
- `stopRinging(): void`
- `stopSoundOnPlayer(): void`
- `syncAlarmClock(): void`
- `syncAlarmClock_Player(IsoPlayer player): void`
- `syncAlarmClock_World(): void`
- `syncStopRinging(): void`
- `update(): void`
- `updateSound(BaseSoundEmitter emitter): void`

Constructors: `AlarmClock.new(String module, String name, String itemType, String texName)`, `AlarmClock.new(String module, String name, String itemType, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### AlarmClockClothing

`zombie.inventory.types.AlarmClockClothing`, class. Extends [Clothing](#clothing). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (608), [Clothing](#clothing) (102), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `finishupdate(): boolean`
- `getAlarmSound(): String`
- `getAlarmSquare(): IsoGridSquare`
- `getCategory(): String`
- `getHour(): int`
- `getMinute(): int`
- `getSoundRadius(): int`
- `isAlarmSet(): boolean`
- `isDigital(): boolean`
- `isRinging(): boolean`
- `load(ByteBuffer input, int worldversion): void`
- `save(ByteBuffer output, boolean net): void`
- `setAlarmSet(boolean alarmSet): void`
- `setAlarmSound(String alarmSound): void`
- `setForceDontRing(int min): void`
- `setHour(int hour): void`
- `setMinute(int min): void`
- `setSoundRadius(int soundRadius): void`
- `shouldUpdateInWorld(): boolean`
- `stopRinging(): void`
- `stopSoundOnPlayer(): void`
- `syncAlarmClock(): void`
- `syncAlarmClock_Player(IsoPlayer player): void`
- `syncAlarmClock_World(): void`
- `syncStopRinging(): void`
- `update(): void`
- `updateSound(BaseSoundEmitter emitter): void`

Constructors: `AlarmClockClothing.new(String module, String name, String itemType, String texName, String palette, String spriteName)`, `AlarmClockClothing.new(String module, String name, String itemType, Item item, String palette, String spriteName)`.

Static fields (a copy of the value taken when the class is exposed): `CONDITION_PER_HOLES: int`, `DEFAULT_ENTITY_DISPLAY_NAME: String`, `packetPlayer: short`, `packetWorld: short`.

### AnimalInventoryItem

`zombie.inventory.types.AnimalInventoryItem`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (625), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `finishupdate(): boolean`
- `getAnimal(): IsoAnimal`
- `getCategory(): String`
- `initAnimalData(): void`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output, boolean net): void`
- `setAnimal(IsoAnimal animal): void`
- `shouldUpdateInWorld(): boolean`
- `update(): void`

Constructors: `AnimalInventoryItem.new(String module, String name, String type, String tex)`, `AnimalInventoryItem.new(String module, String name, String type, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### Clothing

`zombie.inventory.types.Clothing`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (611), listed on their own entries.

Methods, called as `obj:name(...)`:

- `CanStack(InventoryItem item): boolean`
- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `IsClothing(): boolean`
- `Unwear(): void`
- `Unwear(boolean drop): void`
- `Use(boolean bCrafting, boolean bInContainer): void`
- `addPatch(IsoGameCharacter chr, BloodBodyPartType part, InventoryItem fabric): void`
- `addPatchForSync(int partIdx, int tailorLvl, int fabricType, boolean hasHole): void`
- `addRandomBlood(): void`
- `addRandomDirt(): void`
- `addRandomHole(): void`
- `canBe3DRender(): boolean`
- `canFullyRestore(IsoGameCharacter chr, BloodBodyPartType part, InventoryItem fabric): boolean`
- `copyPatchesTo(Clothing newClothing): void`
- `drainGasMask(): void`
- `drainGasMask(float rate): void`
- `drainSCBA(): void`
- `finishupdate(): boolean`
- `flushWetness(): void`
- `fullyRestore(): void`
- `getAlternateModelName(): String`
- `getBiteDefense(): float`
- `getBloodLevel(): float`
- `getBloodLevelForPart(BloodBodyPartType part): float`
- `getBloodlevel(): float`
- `getBloodlevelForPart(BloodBodyPartType part): float`
- `getBulletDefense(): float`
- `getCanHaveHoles(): Boolean`
- `getCategory(): String`
- `getChanceToFall(): int`
- `getClothingDirtynessIncreaseLevel(): float`
- `getClothingExtraSubmenu(): String`
- `getCombatSpeedModifier(): float`
- `getCondLossPerHole(): float`
- `getConditionLowerChance(): int`
- `getCorpseSicknessDefense(): float`
- `getCoveredParts(): ArrayList<BloodBodyPartType>`
- `getDefForPart(BloodBodyPartType part, boolean bite, boolean bullet): float`
- `getDirtiness(): float`
- `getFilterType(): String`
- `getHolesNumber(): int`
- `getInsulation(): float`
- `getName(): String`
- `getName(IsoPlayer player): String`
- `getNbrOfCoveredParts(): int`
- `getNeckProtectionModifier(): float`
- `getPalette(): String`
- `getPatchType(BloodBodyPartType part): Clothing.ClothingPatch`
- `getPatchesNumber(): int`
- `getRunSpeedModifier(): float`
- `getScratchDefense(): float`
- `getSpriteName(): String`
- `getStompPower(): float`
- `getTankType(): String`
- `getTemperature(): float`
- `getUseDelta(): float`
- `getUsedDelta(): float`
- `getWaterResistance(): float`
- `getWeight(): float`
- `getWeightWet(): float`
- `getWetness(): float`
- `getWindresistance(): float`
- `hasFilter(): boolean`
- `hasTank(): boolean`
- `isBloody(): boolean`
- `isCosmetic(): boolean`
- `isDirty(): boolean`
- `isRemoveOnBroken(): Boolean`
- `isWorn(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `randomizeCondition(int wetChance, int dirtChance, int bloodChance, int holeChance): void`
- `removeAllPatches(): void`
- `removePatch(BloodBodyPartType part): void`
- `save(ByteBuffer output, boolean net): void`
- `setBiteDefense(float biteDefense): void`
- `setBloodLevel(float delta): void`
- `setBulletDefense(float bulletDefense): void`
- `setCanHaveHoles(Boolean canHaveHoles): void`
- `setChanceToFall(int chanceToFall): void`
- `setCombatSpeedModifier(float combatSpeedModifier): void`
- `setCondition(int condition): void`
- `setConditionLowerChance(int conditionLowerChance): void`
- `setDirtiness(float delta): void`
- `setFilterType(String filterType): void`
- `setInsulation(float insulation): void`
- `setNeckProtectionModifier(float neckProtectionModifier): void`
- `setNoFilter(): void`
- `setNoTank(): void`
- `setPalette(String palette): void`
- `setRemoveOnBroken(Boolean removeOnBroken): void`
- `setRunSpeedModifier(float runSpeedModifier): void`
- `setScratchDefense(float scratchDefense): void`
- `setSpriteName(String spriteName): void`
- `setStompPower(float stompPower): void`
- `setTankType(String tankType): void`
- `setTemperature(float temperature): void`
- `setUsedDelta(float usedDelta): void`
- `setWaterResistance(float waterResistance): void`
- `setWeightWet(float weight): void`
- `setWetness(float percent): void`
- `setWindresistance(float windresistance): void`
- `toString(): String`
- `update(): void`
- `updateWetness(): void`
- `updateWetness(boolean bIgnoreEquipped): void`

Static functions, called as `Clothing.name(...)`:

- `CreateFromSprite(String sprite): Clothing`
- `getBiteDefenseFromItem(IsoGameCharacter chr, InventoryItem fabric): int`
- `getScratchDefenseFromItem(IsoGameCharacter chr, InventoryItem fabric): int`

Constructors: `Clothing.new(String module, String name, String itemType, String texName, String palette, String spriteName)`, `Clothing.new(String module, String name, String itemType, Item item, String palette, String spriteName)`.

Static fields (a copy of the value taken when the class is exposed): `CONDITION_PER_HOLES: int`, `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### Clothing.ClothingPatch

`zombie.inventory.types.Clothing.ClothingPatch`, class.

Methods, called as `obj:name(...)`:

- `getBiteDefense(): int`
- `getFabricType(): int`
- `getFabricTypeName(): String`
- `getScratchDefense(): int`
- `load(ByteBuffer input, int worldVersion): void`
- `load_old(ByteBuffer input, int worldVersion, boolean net): void`
- `save(ByteBuffer output, boolean net): void`
- `save_old(ByteBuffer output, boolean net): void`

Constructors: `Clothing.ClothingPatch.new()`, `Clothing.ClothingPatch.new(int tailorLvl, int fabricType, boolean hasHole)`.

### Clothing.ClothingPatchFabricType

`zombie.inventory.types.Clothing.ClothingPatchFabricType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getType(): String`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `Clothing.ClothingPatchFabricType.name(...)`:

- `fromIndex(int index): Clothing.ClothingPatchFabricType`
- `fromType(String type): Clothing.ClothingPatchFabricType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): Clothing.ClothingPatchFabricType`
- `values(): Clothing.ClothingPatchFabricType[]`

Enum values (read as `Clothing.ClothingPatchFabricType.VALUE`): `Cotton`, `Denim`, `Leather`.

### ComboItem

`zombie.inventory.types.ComboItem`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (632), listed on their own entries.

Constructors: `ComboItem.new(String module, String name, String itemType, String texName)`, `ComboItem.new(String module, String name, String itemType, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### Drainable

`zombie.inventory.types.Drainable`, interface.

No methods of its own beyond those every Java object has.

### DrainableComboItem

`zombie.inventory.types.DrainableComboItem`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (48), [InventoryItem](#inventoryitem) (618), listed on their own entries.

Methods, called as `obj:name(...)`:

- `IsDrainable(): boolean`
- `Use(): void`
- `Use(boolean bCrafting, boolean bInContainer, boolean bNeedSync): void`
- `canConsolidate(): boolean`
- `finishupdate(): boolean`
- `getCurrentUsesFloat(): float`
- `getEnergy(): Energy`
- `getHeat(): float`
- `getInvHeat(): float`
- `getMaxUses(): int`
- `getOnCooked(): String`
- `getOnEat(): String`
- `getReplaceOnCooked(): List<String>`
- `getReplaceOnDeplete(): String`
- `getReplaceOnDepleteFullType(): String`
- `getTicks(): float`
- `getTicksPerEquipUse(): int`
- `getUseDelta(): float`
- `getWeightEmpty(): float`
- `isEmptyUses(): boolean`
- `isEnergy(): boolean`
- `isFullUses(): boolean`
- `isUseWhileEquiped(): boolean`
- `isUseWhileUnequiped(): boolean`
- `randomizeUses(): void`
- `render(): void`
- `renderlast(): void`
- `setCanConsolidate(boolean canConsolidate): void`
- `setCurrentUses(int newuses): void`
- `setCurrentUsesFloat(float newUses): void`
- `setHeat(float heat): void`
- `setOnCooked(String onCooked): void`
- `setOnEat(String onEat): void`
- `setReplaceOnCooked(List<String> replaceOnCooked): void`
- `setReplaceOnDeplete(String replaceOnDeplete): void`
- `setTicks(float ticks): void`
- `setTicksPerEquipUse(int ticksPerEquipUse): void`
- `setUseDelta(float useDelta): void`
- `setUseWhileEquiped(boolean bUseWhileEquiped): void`
- `setUseWhileUnequiped(boolean bUseWhileUnequiped): void`
- `setUsedDelta(float delta): void`
- `setWeightEmpty(float weight): void`
- `shouldUpdateInWorld(): boolean`
- `syncItemFields(): void`
- `update(): void`
- `updateWeight(): void`

Constructors: `DrainableComboItem.new(String module, String name, String itemType, String texName)`, `DrainableComboItem.new(String module, String name, String itemType, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### Food

`zombie.inventory.types.Food`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (594), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `IsFood(): boolean`
- `OnAddedToContainer(ItemContainer container): void`
- `OnBeforeRemoveFromContainer(ItemContainer container): void`
- `canAge(): boolean`
- `canBeFrozen(): boolean`
- `checkEggHatch(IsoHutch hutch): boolean`
- `consumeHunger(float realUsedHunger): void`
- `copyAgeFrom(Food otherFood): void`
- `copyCookedBurntFrom(Food otherFood): void`
- `copyExtraItems(Food otherFood): void`
- `copyFoodFrom(Food otherFood): void`
- `copyFoodFromSplit(Food otherFood, int split): void`
- `copyFrozenFrom(Food otherFood): void`
- `copyNutritionFrom(Food otherFood): void`
- `copyNutritionFromRatio(Food otherFood, float ratio): void`
- `copyNutritionFromSplit(Food otherFood, int split): void`
- `copyPoisonFrom(Food otherFood): void`
- `copyTemperatureFrom(Food otherFood): void`
- `finishupdate(): boolean`
- `freeze(): void`
- `getActualWeight(): float`
- `getAnimalHatch(): String`
- `getAnimalHatchBreed(): String`
- `getBaseHungChange(): float`
- `getBaseHunger(): float`
- `getBoredomChange(): float`
- `getBoredomChangeUnmodified(): float`
- `getCalories(): float`
- `getCarbohydrates(): float`
- `getCategory(): String`
- `getChef(): String`
- `getCompostTime(): float`
- `getCookingSound(): String`
- `getCurrentUses(): int`
- `getCurrentUsesFloat(): float`
- `getCustomEatSound(): String`
- `getEndChange(): float`
- `getEnduranceChange(): float`
- `getEnduranceChangeUnmodified(): float`
- `getFertilizedTime(): int`
- `getFluReduction(): int`
- `getFoodSicknessChange(): int`
- `getFoodType(): String`
- `getFreezingTime(): float`
- `getHeat(): float`
- `getHerbalistType(): String`
- `getHungChange(): float`
- `getHungerChange(): float`
- `getInvHeat(): float`
- `getLastCookMinute(): int`
- `getLipids(): float`
- `getMaxUses(): int`
- `getMilkQty(): int`
- `getMilkType(): String`
- `getName(): String`
- `getName(IsoPlayer player): String`
- `getOnCooked(): String`
- `getOnEat(): String`
- `getPainReduction(): float`
- `getPoisonDetectionLevel(): int`
- `getPoisonLevelForRecipe(): int`
- `getPoisonPower(): int`
- `getProteins(): float`
- `getReplaceOnCooked(): List<String>`
- `getReplaceOnRotten(): String`
- `getRottenTime(): float`
- `getScore(SurvivorDesc desc): float`
- `getSoundLimiterGroupID(): String`
- `getSpices(): ArrayList<String>`
- `getStaticModel(): String`
- `getStressChange(): float`
- `getStressChangeUnmodified(): float`
- `getTex(): Texture`
- `getThirstChange(): float`
- `getThirstChangeUnmodified(): float`
- `getTimeToHatch(): int`
- `getUnhappyChange(): float`
- `getUnhappyChangeUnmodified(): float`
- `getUseForPoison(): int`
- `getUseOnConsume(): String`
- `getWeight(): float`
- `getWorldTexture(): String`
- `hasAnimalParts(): boolean`
- `hasSpices(): boolean`
- `inheritFoodAgeFrom(InventoryItem otherItem): void`
- `inheritOlderFoodAge(InventoryItem otherItem): void`
- `isAnimalSkeleton(): boolean`
- `isBadCold(): boolean`
- `isBadInMicrowave(): boolean`
- `isCookedInMicrowave(): boolean`
- `isFertilized(): boolean`
- `isFood(): boolean`
- `isFreezing(): boolean`
- `isFresh(): boolean`
- `isFrozen(): boolean`
- `isGoodHot(): boolean`
- `isNormalAndFullFood(): boolean`
- `isPackaged(): boolean`
- `isPoison(): boolean`
- `isRemoveNegativeEffectOnCooked(): boolean`
- `isRotten(): boolean`
- `isSpice(): boolean`
- `isTainted(): boolean`
- `isThawing(): boolean`
- `isUncooked(): boolean`
- `isWholeFoodItem(): boolean`
- `isbDangerousUncooked(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `multiplyFoodValues(float percentage): void`
- `registerWithSoundLimiter(SoundInstanceLimiter limiter): void`
- `save(ByteBuffer output, boolean net): void`
- `setAnimalHatch(String animalHatch): void`
- `setAnimalHatchBreed(String animalHatchBreed): void`
- `setAutoAge(): void`
- `setBadCold(boolean bBadCold): void`
- `setBadInMicrowave(boolean badInMicrowave): void`
- `setBaseHunger(float baseHunger): void`
- `setCalories(float calories): void`
- `setCanBeFrozen(boolean canBeFrozen): void`
- `setCarbohydrates(float carbohydrates): void`
- `setChef(String chef): void`
- `setCompostTime(float compostTime): void`
- `setCookedInMicrowave(boolean b): void`
- `setCurrentUses(int newuses): void`
- `setCustomEatSound(String customEatSound): void`
- `setEndChange(float endChange): void`
- `setEnduranceChange(float endChange): void`
- `setFertilized(boolean fertilized): void`
- `setFertilizedTime(int time): void`
- `setFluReduction(int fluReduction): void`
- `setFoodSicknessChange(int foodSicknessChange): void`
- `setFoodType(String foodType): void`
- `setFreezingTime(float freezingTime): void`
- `setFrozen(boolean frozen): void`
- `setGoodHot(boolean bGoodHot): void`
- `setHeat(float heat): void`
- `setHerbalistType(String type): void`
- `setHungChange(float hungChange): void`
- `setLastCookMinute(int lastCookMinute): void`
- `setLipids(float lipids): void`
- `setMilkQty(int qty): void`
- `setMilkType(String type): void`
- `setOnCooked(String onCooked): void`
- `setOnEat(String onEat): void`
- `setPackaged(boolean packaged): void`
- `setPainReduction(float painReduction): void`
- `setPoisonDetectionLevel(int poisonDetectionLevel): void`
- `setPoisonLevelForRecipe(Integer poisonLevelForRecipe): void`
- `setPoisonPower(int poisonPower): void`
- `setProteins(float proteins): void`
- `setRemoveNegativeEffectOnCooked(boolean removeNegativeEffectOnCooked): void`
- `setReplaceOnCooked(List<String> replaceOnCooked): void`
- `setReplaceOnRotten(String replaceOnRotten): void`
- `setRotten(boolean rotten): void`
- `setRottenTime(float time): void`
- `setSpice(boolean isSpice): void`
- `setSpices(ArrayList<String> spices): void`
- `setTainted(boolean tainted): void`
- `setThirstChange(float thirstChange): void`
- `setTimeToHatch(int timeToHatch): void`
- `setUseForPoison(int useForPoison): void`
- `setUseOnConsume(String useOnConsume): void`
- `setbDangerousUncooked(boolean dangerousUncooked): void`
- `shouldUpdateInWorld(): boolean`
- `syncItemFields(): void`
- `update(): void`
- `updateAge(): void`
- `updateAge(boolean bSendItemStats): void`
- `updateClientCookingSounds(): void`
- `updateSound(BaseSoundEmitter emitter, SoundLimiterParams params): void`

Constructors: `Food.new(String module, String name, String itemType, String texName)`, `Food.new(String module, String name, String itemType, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `FreezerAgeMultiplier: float`.

### HandWeapon

`zombie.inventory.types.HandWeapon`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (607), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `IsWeapon(): boolean`
- `attachWeaponPart(IsoGameCharacter character, WeaponPart part): void`
- `attachWeaponPart(IsoGameCharacter character, WeaponPart part, boolean doChange): void`
- `attachWeaponPart(WeaponPart part): void`
- `attachWeaponPart(WeaponPart part, boolean doChange): void`
- `canAttackPierceTransparentWall(IsoGameCharacter isoGameCharacter, HandWeapon handWeapon): boolean`
- `canBeActivated(): boolean`
- `canBePlaced(): boolean`
- `canBeReused(): boolean`
- `canEmitLight(): boolean`
- `checkJam(IsoPlayer player, boolean racking): boolean`
- `checkUnJam(IsoPlayer player): boolean`
- `clearAllWeaponParts(): void`
- `clearWeaponPart(String partType): void`
- `clearWeaponPart(WeaponPart part): void`
- `cycleFireMode(): String`
- `detachAllWeaponParts(): void`
- `detachWeaponPart(String location): void`
- `detachWeaponPart(IsoGameCharacter character, WeaponPart part): void`
- `detachWeaponPart(IsoGameCharacter character, WeaponPart part, boolean doChange): void`
- `detachWeaponPart(WeaponPart part): void`
- `getActiveLight(): WeaponPart`
- `getActiveSight(): WeaponPart`
- `getActualWeight(): float`
- `getAimingMod(): float`
- `getAimingPerkCritModifier(): int`
- `getAimingPerkHitChanceModifier(): float`
- `getAimingPerkMinAngleModifier(): float`
- `getAimingPerkRangeModifier(): float`
- `getAimingTime(): int`
- `getAllWeaponParts(): List<WeaponPart>`
- `getAllWeaponParts(List<WeaponPart> result): List<WeaponPart>`
- `getAmmoBox(): String`
- `getAmmoPerShoot(): int`
- `getAttackTargetSquare(Vector3 attackPosition): IsoGridSquare`
- `getBaseSpeed(): float`
- `getBestMagazine(IsoGameCharacter owner): InventoryItem`
- `getBloodLevel(): float`
- `getBulletOutSound(): String`
- `getCategory(): String`
- `getClickSound(): String`
- `getClipSize(): int`
- `getConditionLowerChance(): int`
- `getContentsWeight(): float`
- `getCriticalChance(): float`
- `getCriticalDamageMultiplier(): float`
- `getCyclicRateMultiplier(): float`
- `getDamageCategory(): String`
- `getDamageMod(IsoGameCharacter chr): float`
- `getDetachableWeaponParts(IsoGameCharacter character): List<WeaponPart>`
- `getDoSwingBeforeImpact(): float`
- `getDoorDamage(): int`
- `getDoorHitSound(): String`
- `getEffectiveWeight(): float`
- `getEjectAmmoSound(): String`
- `getEjectAmmoStartSound(): String`
- `getEjectAmmoStopSound(): String`
- `getEnduranceMod(): float`
- `getExplosionDuration(): int`
- `getExplosionPower(): int`
- `getExplosionRange(): int`
- `getExplosionTimer(): int`
- `getExtraDamage(): float`
- `getFatigueMod(IsoGameCharacter chr): float`
- `getFireMode(): String`
- `getFireModePossibilities(): ArrayList<String>`
- `getFireRange(): int`
- `getFireStartingChance(): int`
- `getFireStartingEnergy(): int`
- `getHitChance(): int`
- `getHitFloorSound(): String`
- `getImpactSound(): String`
- `getInsertAmmoSound(): String`
- `getInsertAmmoStartSound(): String`
- `getInsertAmmoStopSound(): String`
- `getJamGunChance(): float`
- `getKnockbackMod(IsoGameCharacter chr): float`
- `getKnockdownMod(): float`
- `getLightDistance(): int`
- `getLightStrength(): float`
- `getLowLightBonus(): float`
- `getMagazineType(): String`
- `getMaxAngle(): float`
- `getMaxDamage(): float`
- `getMaxHitCount(): int`
- `getMaxRange(): float`
- `getMaxRange(IsoGameCharacter owner): float`
- `getMaxSightRange(): float`
- `getMaxSightRange(IsoGameCharacter character): float`
- `getMinAngle(): float`
- `getMinDamage(): float`
- `getMinRange(): float`
- `getMinRangeRanged(): float`
- `getMinSightRange(): float`
- `getMinSightRange(IsoGameCharacter character): float`
- `getMinimumSwingTime(): float`
- `getModelWeaponPart(): ArrayList<ModelWeaponPart>`
- `getMuzzleFlashModelKey(): ModelKey`
- `getNoiseDuration(): int`
- `getNoiseFactor(): float`
- `getNoiseRange(): int`
- `getOriginalWeaponSprite(): String`
- `getOtherBoost(): float`
- `getOtherHandRequire(): ItemTag`
- `getPerk(): PerkFactory.Perk`
- `getPhysicsObject(): String`
- `getPlacedSprite(): String`
- `getProjectileCount(): int`
- `getProjectileSpread(): float`
- `getProjectileWeightCenter(): float`
- `getPushBackMod(): float`
- `getRackSound(): String`
- `getRangeMod(IsoGameCharacter chr): float`
- `getRecoilDelay(): int`
- `getRecoilDelay(IsoGameCharacter owner): int`
- `getReloadTime(): int`
- `getRunAnim(): String`
- `getScore(SurvivorDesc desc): float`
- `getSensorRange(): int`
- `getShellFallSound(): String`
- `getSmokeRange(): int`
- `getSoundGain(): float`
- `getSoundRadius(): int`
- `getSoundVolume(): int`
- `getSpeedMod(IsoGameCharacter chr): float`
- `getSpentRoundCount(): int`
- `getSplatNumber(): int`
- `getSplatSize(): float`
- `getStaggerBackTimeMod(IsoGameCharacter wielder, IsoGameCharacter target): float`
- `getStaticModel(): String`
- `getStaticModelException(): String`
- `getStopPower(): float`
- `getSubCategory(): String`
- `getSwingSound(): String`
- `getSwingTime(): float`
- `getToHitMod(IsoGameCharacter chr): float`
- `getToHitModifier(): float`
- `getTorchDot(): float`
- `getTreeDamage(): int`
- `getTriggerExplosionTimer(): int`
- `getWeaponPart(String location): WeaponPart`
- `getWeaponPart(WeaponPart part): WeaponPart`
- `getWeaponPartWeightModifier(String type): float`
- `getWeaponPartWeightModifier(WeaponPart part): float`
- `getWeaponReloadType(): WeaponReloadType`
- `getWeaponSkill(IsoGameCharacter chr): int`
- `getWeaponSprite(): String`
- `getWeaponSpritesByIndex(): ArrayList<String>`
- `getWeight(): float`
- `getZombieHitSound(): String`
- `haveChamber(): boolean`
- `inheritAmmunition(HandWeapon other): void`
- `isAimed(): boolean`
- `isAimedFirearm(): boolean`
- `isAimedHandWeapon(): boolean`
- `isAlwaysKnockdown(): boolean`
- `isAngleFalloff(): boolean`
- `isBareHands(): boolean`
- `isCanBarracade(): boolean`
- `isCantAttackWithLowestEndurance(): boolean`
- `isContainsClip(): boolean`
- `isDamageMakeHole(): boolean`
- `isExplosive(): boolean`
- `isInsertAllBulletsReload(): boolean`
- `isInstantExplosion(): boolean`
- `isJammed(): boolean`
- `isKnockBackOnNoDeath(): boolean`
- `isManuallyRemoveSpentRounds(): boolean`
- `isMelee(): boolean`
- `isMultipleHitConditionAffected(): boolean`
- `isOfWeaponCategory(WeaponCategory weaponCategory): boolean`
- `isOtherHandUse(): boolean`
- `isPiercingBullets(): boolean`
- `isRackAfterShoot(): boolean`
- `isRangeFalloff(): boolean`
- `isRanged(): boolean`
- `isReloadable(IsoGameCharacter owner): boolean`
- `isRoundChambered(): boolean`
- `isSelectFire(): boolean`
- `isShareEndurance(): boolean`
- `isSpentRoundChambered(): boolean`
- `isSplatBloodOnNoDeath(): boolean`
- `isTorchCone(): boolean`
- `isUseEndurance(): boolean`
- `isUseSelf(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `muscleStrainMod(IsoGameCharacter chr): float`
- `needToBeClosedOnceReload(): boolean`
- `playActivateSound(): void`
- `playDeactivateSound(): void`
- `randomizeBullets(): int`
- `randomizeFirearmAsLoot(): void`
- `render(): void`
- `save(ByteBuffer output, boolean net): void`
- `setActivated(boolean activated): void`
- `setActiveLight(WeaponPart part): void`
- `setActiveSight(WeaponPart part): void`
- `setAimingPerkCritModifier(int aimingPerkCritModifier): void`
- `setAimingPerkHitChanceModifier(float aimingPerkHitChanceModifier): void`
- `setAimingPerkMinAngleModifier(float aimingPerkMinAngleModifier): void`
- `setAimingPerkRangeModifier(float aimingPerkRangeModifier): void`
- `setAimingTime(int aimingTime): void`
- `setAlwaysKnockdown(boolean alwaysKnockdown): void`
- `setAmmoBox(String ammoBox): void`
- `setAmmoPerShoot(int ammoPerShoot): void`
- `setAngleFalloff(boolean angleFalloff): void`
- `setAttackTargetSquare(IsoGridSquare isoGridSquare): void`
- `setBaseSpeed(float baseSpeed): void`
- `setBloodLevel(float level): void`
- `setBulletOutSound(String bulletOutSound): void`
- `setCanBarracade(boolean bCanBarracade): void`
- `setCanBePlaced(boolean canBePlaced): void`
- `setCanBeReused(boolean canBeReused): void`
- `setCantAttackWithLowestEndurance(boolean cantAttackWithLowestEndurance): void`
- `setClickSound(String clickSound): void`
- `setClipSize(int capacity): void`
- `setConditionLowerChance(int conditionLowerChance): void`
- `setContainsClip(boolean containsClip): void`
- `setCriticalChance(float criticalChance): void`
- `setCriticalDamageMultiplier(float criticalDamageMultiplier): void`
- `setCyclicRateMultiplier(float value): void`
- `setDamageCategory(String damageCategory): void`
- `setDamageMakeHole(boolean damageMakeHole): void`
- `setDoSwingBeforeImpact(float doSwingBeforeImpact): void`
- `setDoorDamage(int doorDamage): void`
- `setDoorHitSound(String doorHitSound): void`
- `setEnduranceMod(float enduranceMod): void`
- `setExplosionDuration(int seconds): void`
- `setExplosionPower(int explosionPower): void`
- `setExplosionRange(int explosionRange): void`
- `setExplosionTimer(int explosionTimer): void`
- `setExtraDamage(float extraDamage): void`
- `setFireMode(String fireMode): void`
- `setFireModePossibilities(ArrayList<String> fireModePossibilities): void`
- `setFireRange(int fireRange): void`
- `setFireStartingChance(int fireStartingChance): void`
- `setFireStartingEnergy(int fireStartingEnergy): void`
- `setHaveChamber(boolean haveChamber): void`
- `setHitChance(int hitChance): void`
- `setHitFloorSound(String hitFloorSound): void`
- `setImpactSound(String impactSound): void`
- `setInsertAllBulletsReload(boolean insertAllBulletsReload): void`
- `setJamGunChance(float jamGunChance): void`
- `setJammed(boolean isJammed): void`
- `setKnockBackOnNoDeath(boolean knockBackOnNoDeath): void`
- `setKnockdownMod(float knockdownMod): void`
- `setMagazineType(String magazineType): void`
- `setMaxAngle(float maxAngle): void`
- `setMaxDamage(float maxDamage): void`
- `setMaxHitCount(int maxHitCount): void`
- `setMaxRange(float maxRange): void`
- `setMaxSightRange(float value): void`
- `setMinAngle(float minAngle): void`
- `setMinDamage(float minDamage): void`
- `setMinRange(float minRange): void`
- `setMinRangeRanged(float minRangeRanged): void`
- `setMinSightRange(float value): void`
- `setMinimumSwingTime(float minimumSwingTime): void`
- `setModelWeaponPart(ArrayList<ModelWeaponPart> modelWeaponPart): void`
- `setMultipleHitConditionAffected(boolean multipleHitConditionAffected): void`
- `setMuzzleFlashModelKey(ModelKey muzzleFlashModelKey): void`
- `setNoiseFactor(float noiseFactor): void`
- `setNoiseRange(int noiseRange): void`
- `setOriginalWeaponSprite(String originalWeaponSprite): void`
- `setOtherBoost(float otherBoost): void`
- `setOtherHandRequire(ItemTag otherHandRequire): void`
- `setOtherHandUse(boolean otherHandUse): void`
- `setPhysicsObject(String physicsObject): void`
- `setPiercingBullets(boolean piercingBullets): void`
- `setPlacedSprite(String placedSprite): void`
- `setProjectileCount(int count): void`
- `setProjectileSpread(float projectileSpread): void`
- `setProjectileWeightCenter(float projectileWeightCenter): void`
- `setPushBackMod(float pushBackMod): void`
- `setRackAfterShoot(boolean rackAfterShoot): void`
- `setRackSound(String rackSound): void`
- `setRangeFalloff(boolean rangeFalloff): void`
- `setRanged(boolean ranged): void`
- `setRecoilDelay(int recoilDelay): void`
- `setReloadTime(int reloadTime): void`
- `setRoundChambered(boolean roundChambered): void`
- `setScriptItem(Item scriptItem): void`
- `setSensorRange(int sensorRange): void`
- `setShareEndurance(boolean shareEndurance): void`
- `setShellFallSound(String shellFallSound): void`
- `setSmokeRange(int smokeRange): void`
- `setSoundGain(float soundGain): void`
- `setSoundRadius(int soundRadius): void`
- `setSoundVolume(int soundVolume): void`
- `setSpentRoundChambered(boolean roundChambered): void`
- `setSpentRoundCount(int count): void`
- `setSplatBloodOnNoDeath(boolean splatBloodOnNoDeath): void`
- `setSplatNumber(int splatNumber): void`
- `setSubCategory(String subcategory): void`
- `setSwingSound(String swingSound): void`
- `setSwingTime(float swingTime): void`
- `setToHitModifier(float toHitModifier): void`
- `setTreeDamage(int treeDamage): void`
- `setTriggerExplosionTimer(int triggerExplosionTimer): void`
- `setUseEndurance(boolean useEndurance): void`
- `setUseSelf(boolean useSelf): void`
- `setWeaponCategories(Set<WeaponCategory> weaponCategories): void`
- `setWeaponLength(float weaponLength): void`
- `setWeaponPart(String partType, WeaponPart part): void`
- `setWeaponPart(WeaponPart part): void`
- `setWeaponReloadType(WeaponReloadType weaponReloadType): void`
- `setWeaponSprite(String weaponSprite): void`
- `setWeaponSpritesByIndex(ArrayList<String> weaponSpritesByIndex): void`
- `setZombieHitSound(String hitSound): void`
- `update(): void`
- `usesExternalMagazine(): boolean`

Static functions, called as `HandWeapon.name(...)`:

- `isAimedFirearm(HandWeapon handWeapon): boolean`

Constructors: `HandWeapon.new(String module, String name, String itemType, String texName)`, `HandWeapon.new(String module, String name, String itemType, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_ATTACHMENT_COUNT: int`.

### InventoryContainer

`zombie.inventory.types.InventoryContainer`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (48), [InventoryItem](#inventoryitem) (619), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI): void`
- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `IsInventoryContainer(): boolean`
- `OnBeforeRemoveFromContainer(ItemContainer container): void`
- `canBeEquipped(): ItemBodyLocation`
- `getBloodLevel(): float`
- `getCapacity(): int`
- `getCategory(): String`
- `getClothingExtraSubmenu(): String`
- `getContentsWeight(): float`
- `getDirtiness(): float`
- `getEffectiveCapacity(IsoGameCharacter chr): int`
- `getEquippedWeight(): float`
- `getInventory(): ItemContainer`
- `getInventoryWeight(): float`
- `getItemContainer(): ItemContainer`
- `getMaxItemSize(): float`
- `getWeightReduction(): int`
- `isEmpty(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `reset(): void`
- `save(ByteBuffer output, boolean net): void`
- `setBloodLevel(float delta): void`
- `setCanBeEquipped(ItemBodyLocation canBeEquipped): void`
- `setCapacity(int capacity): void`
- `setItemContainer(ItemContainer cont): void`
- `setWeightReduction(int weightReduction): void`
- `updateAge(): void`

Constructors: `InventoryContainer.new(String module, String name, String itemType, String texName)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### Key

`zombie.inventory.types.Key`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (627), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getCategory(): String`
- `getKeyId(): int`
- `getNumberOfKey(): int`
- `isDigitalPadlock(): boolean`
- `isPadlock(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output, boolean net): void`
- `setDigitalPadlock(boolean digitalPadlock): void`
- `setKeyId(int keyId): void`
- `setNumberOfKey(int numberOfKey): void`
- `setPadlock(boolean padlock): void`
- `takeKeyId(): void`

Static functions, called as `Key.name(...)`:

- `setHighlightDoors(int playerNum, InventoryItem item): void`

Constructors: `Key.new(String module, String name, String type, String tex)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `highlightDoor: Key.HighlightDoor[]`.

### KeyRing

`zombie.inventory.types.KeyRing`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (631), listed on their own entries.

Methods, called as `obj:name(...)`:

- `addKey(Key key): void`
- `containsKeyId(int keyId): boolean`
- `getCategory(): String`
- `getKeys(): ArrayList<Key>`
- `setKeys(ArrayList<Key> keys): void`

Constructors: `KeyRing.new(String module, String name, String type, String tex)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### Literature

`zombie.inventory.types.Literature`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (622), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `IsLiterature(): boolean`
- `addPage(Integer index, String text): void`
- `canBeWrite(): boolean`
- `containsBuildRecipe(): boolean`
- `containsCraftOrBuildRecipe(): boolean`
- `containsCraftRecipe(): boolean`
- `containsGrowingSeason(): boolean`
- `containsKnownRecipe(IsoGameCharacter chr): boolean`
- `containsMiscRecipe(): boolean`
- `finishupdate(): boolean`
- `getAlreadyReadPages(): int`
- `getBookName(): String`
- `getBoredomChange(): float`
- `getCategory(): String`
- `getCustomPages(): HashMap<Integer, String>`
- `getKnownMiscRecipes(IsoGameCharacter chr): List<String>`
- `getKnownRecipes(IsoGameCharacter chr): List<String>`
- `getLearnedRecipes(): List<String>`
- `getLockedBy(): String`
- `getLvlSkillTrained(): int`
- `getMaxLevelTrained(): int`
- `getNumLevelsTrained(): int`
- `getNumberOfPages(): int`
- `getPageToWrite(): int`
- `getReadType(): String`
- `getSkillTrained(): String`
- `getStressChange(): float`
- `getUnhappyChange(): float`
- `hasRecipe(String recipe): boolean`
- `isEmptyPages(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output, boolean net): void`
- `seePage(Integer index): String`
- `setAlreadyReadPages(int alreadyReadPages): void`
- `setBookName(String bookName): void`
- `setCanBeWrite(boolean canBeWrite): void`
- `setCustomPages(HashMap<Integer, String> customPages): void`
- `setLearnedRecipes(List<String> learnedRecipes): void`
- `setLockedBy(String lockedBy): void`
- `setLvlSkillTrained(int lvlSkillTrained): void`
- `setNumLevelsTrained(int numLevelsTrained): void`
- `setNumberOfPages(int numberOfPages): void`
- `setPageToWrite(int pageToWrite): void`
- `setSkillTrained(String skillTrained): void`
- `update(): void`

Constructors: `Literature.new(String module, String name, String itemType, String texName)`, `Literature.new(String module, String name, String itemType, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### MapItem

`zombie.inventory.types.MapItem`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (629), listed on their own entries.

Methods, called as `obj:name(...)`:

- `IsMap(): boolean`
- `checkDefaultAnnotationsLoaded(): boolean`
- `clearDefaultAnnotations(): void`
- `getMapID(): String`
- `getMediaId(): String`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output, boolean net): void`
- `setMapID(String mapID): void`

Static functions, called as `MapItem.name(...)`:

- `LoadWorldMap(): void`
- `Reset(): void`
- `SaveWorldMap(): void`
- `SaveWorldMapToBufferMap(SaveBufferMap bufferMap): void`
- `getSingleton(): MapItem`

Constructors: `MapItem.new(String module, String name, String type, String tex)`, `MapItem.new(String module, String name, String type, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `worldMapInstance: MapItem`.

### Moveable

`zombie.inventory.types.Moveable`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (627), listed on their own entries.

Methods, called as `obj:name(...)`:

- `CanBeDroppedOnFloor(): boolean`
- `ReadFromWorldSprite(String sprite): boolean`
- `getCustomIcon(String sprite): void`
- `getCustomNameFull(): String`
- `getDisplayName(): String`
- `getLightB(): float`
- `getLightBulbItem(): String`
- `getLightDelta(): float`
- `getLightG(): float`
- `getLightPower(): float`
- `getLightR(): float`
- `getMovableFullName(): String`
- `getName(): String`
- `getName(IsoPlayer player): String`
- `getSpriteGrid(): IsoSpriteGrid`
- `getWorldSprite(): String`
- `isLight(): boolean`
- `isLightHasBattery(): boolean`
- `isLightUseBattery(): boolean`
- `isMultiGridAnchor(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output, boolean net): void`
- `setLight(boolean isLight): void`
- `setLightB(float lightB): void`
- `setLightBulbItem(String lightBulbItem): void`
- `setLightDelta(float lightDelta): void`
- `setLightG(float lightG): void`
- `setLightHasBattery(boolean lightHasBattery): void`
- `setLightPower(float lightPower): void`
- `setLightR(float lightR): void`
- `setLightUseBattery(boolean lightUseBattery): void`
- `setWorldSprite(String worldSprite): void`

Constructors: `Moveable.new(String module, String name, String type, String tex)`, `Moveable.new(String module, String name, String type, Item item)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### Radio

`zombie.inventory.types.Radio`, class. Extends [Moveable](#moveable). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (48), [InventoryItem](#inventoryitem) (618), [Moveable](#moveable) (29), [WaveSignalDevice](/pz/build-42/modding/reference/lua-classes-sound-and-radio#wavesignaldevice) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `AddDeviceText(String line, float r, float g, float b, String guid, String codes, int distance): void`
- `AddDeviceText(ChatMessage msg, float r, float g, float b, String guid, String codes, int distance): void`
- `HasPlayerInRange(): boolean`
- `IsSpeaking(): boolean`
- `OnAddedToContainer(ItemContainer container): void`
- `ReadFromWorldSprite(String sprite): boolean`
- `Say(String line): void`
- `canBeEquipped(): ItemBodyLocation`
- `doReceiveSignal(int distance): void`
- `getClothingExtraSubmenu(): String`
- `getCurrentUsesFloat(): float`
- `getDelta(): float`
- `getDeviceData(): DeviceData`
- `getPlayer(): IsoPlayer`
- `getSayLine(): String`
- `getSquare(): IsoGridSquare`
- `getTalkerType(): String`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `load(ByteBuffer input, int worldVersion): void`
- `render(): void`
- `renderlast(): void`
- `save(ByteBuffer output, boolean net): void`
- `setCanBeEquipped(ItemBodyLocation canBeEquipped): void`
- `setDelta(float delta): void`
- `setDeviceData(DeviceData data): void`
- `update(): void`

Constructors: `Radio.new(String module, String name, String itemType, String texName)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### WeaponPart

`zombie.inventory.types.WeaponPart`, class. Extends [InventoryItem](#inventoryitem). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (49), [InventoryItem](#inventoryitem) (625), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoBatteryTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `canAttach(IsoGameCharacter character, HandWeapon weapon): boolean`
- `canDetach(IsoGameCharacter character, HandWeapon weapon): boolean`
- `getAimingTime(): int`
- `getAngle(): float`
- `getCategory(): String`
- `getClipSize(): int`
- `getCurrentUsesFloat(): float`
- `getDamage(): float`
- `getHitChance(): int`
- `getLowLightBonus(): float`
- `getMaxRange(): float`
- `getMaxSightRange(): float`
- `getMaxUses(): int`
- `getMinRangeRanged(): float`
- `getMinSightRange(): float`
- `getMountOn(): List<String>`
- `getPartType(): String`
- `getRecoilDelay(): float`
- `getReloadTime(): int`
- `getSpreadModifier(): float`
- `getWeightModifier(): float`
- `onAttach(IsoGameCharacter character, HandWeapon weapon): void`
- `onDetach(IsoGameCharacter character, HandWeapon weapon): void`
- `render(): void`
- `setAimingTime(int aimingTime): void`
- `setAngle(float angle): void`
- `setCanAttachCallback(String value): void`
- `setCanDetachCallback(String value): void`
- `setClipSize(int clipSize): void`
- `setCurrentUsesFloat(float newUses): void`
- `setDamage(float damage): void`
- `setHitChance(int hitChance): void`
- `setLowLightBonus(float value): void`
- `setMaxRange(float maxRange): void`
- `setMaxSightRange(float value): void`
- `setMinRangeRanged(float minRangeRanged): void`
- `setMinSightRange(float value): void`
- `setMountOn(List<String> mountOn): void`
- `setOnAttachCallback(String value): void`
- `setOnDetachCallback(String value): void`
- `setPartType(String partType): void`
- `setRecoilDelay(float recoilDelay): void`
- `setReloadTime(int reloadTime): void`
- `setSpreadModifier(float modifier): void`
- `setUseDelta(float useDelta): void`
- `setUsedDelta(float delta): void`
- `setWeightModifier(float weightModifier): void`
- `update(): void`

Constructors: `WeaponPart.new(String module, String name, String itemType, String texName)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### WeaponType

`zombie.inventory.types.WeaponType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getPossibleAttack(): WeightedList<AttackType>`
- `getType(): String`
- `hashCode(): int` from `Enum`
- `isCanMiss(): boolean`
- `isRanged(): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `WeaponType.name(...)`:

- `getWeaponType(IsoGameCharacter chr): WeaponType`
- `getWeaponType(IsoGameCharacter chr, InventoryItem inv1, InventoryItem inv2): WeaponType`
- `getWeaponType(HandWeapon weapon): WeaponType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): WeaponType`
- `values(): WeaponType[]`

Enum values (read as `WeaponType.VALUE`): `CHAINSAW`, `FIREARM`, `HANDGUN`, `HEAVY`, `KNIFE`, `ONE_HANDED`, `SPEAR`, `THROWING`, `TWO_HANDED`, `UNARMED`.
