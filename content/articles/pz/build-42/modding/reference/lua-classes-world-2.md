---
slug: lua-classes-world-2
title: 'Lua Classes: The world: squares, objects, map and weather, part 2 of 4 (Build 42.21)'
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
excerpt: 'The exposed the world: squares, objects, map and weather classes of Build 42.21 (part 2 of 4): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: The world: squares, objects, map and weather, part 2 of 4

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The map and what sits on it: grid squares, tile objects, buildings and rooms, the world map, erosion, weather and the randomized stories.

This page holds 42 classes and 2,134 methods, part 2 of 4 of this area (from `IsoObject` to `IsoThumpable`), from the packages `zombie.iso`, `zombie.iso.objects`, `zombie.iso.objects.interfaces`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### IsoObject

`zombie.iso.IsoObject`, class. Extends [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), listed on their own entries.

Methods, called as `obj:name(...)`:

- `AttachAnim(String objectName, String animName, int numFrames, float frameIncrease, int offsetX, int offsetY, boolean looping, int finishHoldFrameIndex, boolean deleteWhenFinished, float zBias, ColorInfo tintMod): IsoSpriteInstance`
- `AttachAnim(String objectName, String animName, int numFrames, float frameIncrease, int offsetX, int offsetY, boolean looping, int finishHoldFrameIndex, boolean deleteWhenFinished, float zBias, ColorInfo tintMod, boolean randomFrame): IsoSpriteInstance`
- `AttachExistingAnim(IsoSprite spr, int offsetX, int offsetY, boolean looping, int finishHoldFrameIndex, boolean deleteWhenFinished, float zBias): void`
- `AttachExistingAnim(IsoSprite spr, int offsetX, int offsetY, boolean looping, int finishHoldFrameIndex, boolean deleteWhenFinished, float zBias, ColorInfo tintMod): void`
- `AttackObject(IsoGameCharacter owner): void`
- `Collision(Vector2 collision, IsoObject object): void`
- `Damage(float amount): void`
- `DirtySlice(): void`
- `DoSpecialTooltip(ObjectTooltip tooltipUI, IsoGridSquare square): void`
- `DoTooltip(ObjectTooltip tooltipUI): void`
- `FindExternalWaterSource(): IsoObject`
- `GetVehicleSlowFactor(BaseVehicle vehicle): float`
- `HasTooltip(): boolean`
- `Hit(Vector2 collision, IsoObject obj, float damage): void`
- `HitByVehicle(BaseVehicle vehicle, float amount): void`
- `RemoveAttachedAnim(int index): void`
- `RemoveAttachedAnims(): void`
- `Serialize(): boolean`
- `SetName(String name): void`
- `TestCollide(IsoMovingObject obj, IsoGridSquare from, IsoGridSquare to): boolean`
- `TestPathfindCollide(IsoMovingObject obj, IsoGridSquare from, IsoGridSquare to): boolean`
- `TestVision(IsoGridSquare from, IsoGridSquare to): IsoObject.VisionResult`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `Thump(IsoMovingObject thumper, int thumpEventCount): void`
- `UnCollision(IsoObject object): void`
- `WeaponHit(IsoGameCharacter chr, HandWeapon weapon): void`
- `addAttachedAnimSprite(IsoSprite sprite): void`
- `addAttachedAnimSpriteByName(String spriteName): void`
- `addAttachedAnimSpriteInstance(IsoSpriteInstance inst): void`
- `addChild(IsoObject child): void`
- `addFluid(FluidType fluidType, float amount): void`
- `addItemToObjectSurface(String item): InventoryItem`
- `addItemToObjectSurface(String item, boolean randomRotation): InventoryItem`
- `addItemToObjectSurface(String item, boolean randomRotation, boolean spawnChecks): InventoryItem`
- `addSecondaryContainer(ItemContainer container): void`
- `addSheetRope(IsoPlayer player, String itemType): boolean`
- `addToWorld(): void`
- `afterRotated(): void`
- `canAddSheetRope(): boolean`
- `canTransferFluidFrom(FluidContainer other): boolean`
- `canTransferFluidTo(FluidContainer other): boolean`
- `checkAmbientSound(): void`
- `checkHaveElectricity(): void`
- `checkLightSourceActive(): void`
- `checkObjectPowered(): boolean`
- `cleanWallBlood(): void`
- `clearAttachedAnimSprite(): void`
- `clearOnOverlay(): void`
- `couldBePoweredByGenerator(): boolean`
- `countAddSheetRope(): int`
- `createContainersFromSpriteProperties(): void`
- `createFluidContainersFromSpriteProperties(): void`
- `customHashCode(): long`
- `debugPrintout(): void`
- `destroyFence(IsoDirections dir): void`
- `doFindExternalWaterSource(): void`
- `dumpContentsInSquare(): void`
- `emptyFluid(): void`
- `flagForHotSave(): void`
- `frameStep(): void` from `ECSEntity`
- `getAlpha(): float`
- `getAlpha(int playerIndex): float`
- `getAttachedAnimSprite(): ArrayList<IsoSpriteInstance>`
- `getAttachedAnimSpriteCount(): int`
- `getBlockedEdgeDirection(): GridSquareEdgeFacingDirection`
- `getCell(): IsoCell`
- `getChildSprites(): ArrayList<IsoSpriteInstance>`
- `getChunk(): IsoChunk`
- `getClosestSpriteGridObject(float toX, float toY): IsoObject`
- `getContainer(): ItemContainer`
- `getContainerByEitherType(String type1, String type2): ItemContainer`
- `getContainerByIndex(int index): ItemContainer`
- `getContainerByType(String type): ItemContainer`
- `getContainerClickedOn(int screenX, int screenY): ItemContainer`
- `getContainerCount(): int`
- `getContainerIndex(ItemContainer container): int`
- `getContainers(T paramToCompare, Invokers.Params2.Boolean.ICallback<T, ItemContainer> isValidPredicate, PZArrayList<ItemContainer> containerList): PZArrayList<ItemContainer>`
- `getCurrentFrameTex(): Texture`
- `getCustomColor(): ColorInfo`
- `getDamage(): short`
- `getDir(): IsoDirections`
- `getDoRender(): boolean`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getECSComponentMap(): HashMap<Class<? extends ECSComponent>, ECSComponent>`
- `getEntityNetID(): long`
- `getFacing(): IsoDirections`
- `getFacingPosition(Vector2 pos): Vector2`
- `getFacingPositionAlt(Vector2 pos): Vector2`
- `getFasciaAttachedSquare(): IsoGridSquare`
- `getFluidAmount(): float`
- `getFluidCapacity(): float`
- `getFluidUiName(): String`
- `getForwardIsoDirection(): IsoDirections`
- `getForwardMovementIsoDirection(): IsoDirections`
- `getFrameNo(): int` from `ECSEntity`
- `getGameEntityType(): GameEntityType`
- `getGeneratorPowerConsumption(): float`
- `getHighlightColor(): ColorInfo`
- `getHighlightColor(int playerIndex): ColorInfo`
- `getHoppableDirection(): GridSquareEdgeFacingDirection`
- `getIsSurfaceNormalOffset(): boolean`
- `getItemContainer(): ItemContainer`
- `getKeyId(): int`
- `getLightSource(): IsoLightSource`
- `getMaskClickedY(int x, int y, boolean flip): float`
- `getMasterObject(): IsoObject`
- `getModData(): KahluaTable`
- `getMovingObjectIndex(): int`
- `getName(): String`
- `getObjectIndex(): int`
- `getObjectName(): String`
- `getObjectRenderEffects(): ObjectRenderEffects`
- `getObjectRenderEffectsToApply(): ObjectRenderEffects`
- `getOffsetX(): float`
- `getOffsetY(): float`
- `getOnOverlay(): IsoSpriteInstance`
- `getOutlineHighlightCol(int playerIndex): int`
- `getOutlineThickness(): float`
- `getOverlaySprite(): IsoSprite`
- `getOverlaySpriteColor(): ColorInfo`
- `getPipedFuelAmount(): int`
- `getPosition(Vector3f out): Vector3f`
- `getPosition(Vector3 out): Vector3`
- `getPrimaryFluid(): Fluid`
- `getProperties(): PropertyContainer`
- `getProperty(String p): String`
- `getProperty(IsoPropertyType p): String`
- `getRenderEffectMaster(): IsoObject`
- `getRenderEffectObjectByIndex(int index): IsoObject`
- `getRenderEffectObjectCount(): int`
- `getRenderInfo(int playerIndex): ObjectRenderInfo`
- `getRenderSquare(): IsoGridSquare`
- `getRenderYOffset(): float`
- `getRerouteCollide(): IsoObject`
- `getRerouteMask(): IsoObject`
- `getRerouteMaskObject(): IsoObject`
- `getScriptName(): String`
- `getSpecialObjectIndex(): int`
- `getSprite(): IsoSprite`
- `getSpriteGrid(): IsoSpriteGrid`
- `getSpriteGridObjects(ArrayList<IsoObject> result): ArrayList<IsoObject>`
- `getSpriteGridObjects(ArrayList<IsoObject> result, boolean bAddSelf): ArrayList<IsoObject>`
- `getSpriteGridObjectsExcludingSelf(ArrayList<IsoObject> result): ArrayList<IsoObject>`
- `getSpriteGridObjectsIncludingSelf(ArrayList<IsoObject> result): ArrayList<IsoObject>`
- `getSpriteModel(): SpriteModel`
- `getSpriteName(): String`
- `getSquare(): IsoGridSquare`
- `getStaticMovingObjectIndex(): int`
- `getStressModFromThumping(): float`
- `getSurfaceNormalOffset(): float`
- `getSurfaceOffset(): float`
- `getSurfaceOffsetNoTable(): float`
- `getTable(): KahluaTable`
- `getTargetAlpha(): float`
- `getTargetAlpha(int playerIndex): float`
- `getTextureName(): String`
- `getThumpCondition(): float`
- `getThumpableFor(IsoGameCharacter chr): Thumpable`
- `getThumpableFor(IsoGameCharacter chr, HandWeapon weapon): Thumpable`
- `getTile(): String`
- `getTileName(): String`
- `getType(): IsoObjectType`
- `getUsesExternalWaterSource(): boolean`
- `getWindRenderEffects(): ObjectRenderEffects`
- `getWindowFrameDirection(): GridSquareEdgeFacingDirection`
- `getWorldObjectIndex(): int`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `handleBurning(): void`
- `hasAdjacentCanStandSquare(): boolean`
- `hasAnimatedAttachments(): boolean`
- `hasAttachedAnimSprites(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasExternalWaterSource(): boolean`
- `hasFluid(): boolean`
- `hasGridPower(): boolean`
- `hasModData(): boolean`
- `hasOverlaySprite(): boolean`
- `hasPropaneTank(): boolean`
- `hasProperty(String p): boolean`
- `hasProperty(IsoPropertyType p): boolean`
- `hasProperty(IsoFlagType flag): boolean`
- `hasSpriteGrid(): boolean`
- `hasWater(): boolean`
- `haveSheetRope(): boolean`
- `haveSpecialTooltip(): boolean`
- `invalidateRenderChunkLevel(long dirtyFlags): void`
- `invalidateVispolyChunkLevel(): void`
- `isAlphaAndTargetZero(): boolean`
- `isAlphaAndTargetZero(int playerIndex): boolean`
- `isAlphaZero(): boolean`
- `isAlphaZero(int playerIndex): boolean`
- `isAnimating(): boolean`
- `isAttachedAnimSprite(IsoSprite sprite): boolean`
- `isAttachedOrOverlaySprite(IsoSprite sprite): boolean`
- `isBlink(): boolean`
- `isBlink(int playerIndex): boolean`
- `isBush(): boolean`
- `isCanPath(): boolean`
- `isCharacter(): boolean`
- `isConnectedSpriteGridObject(IsoObject object): boolean`
- `isDestroyed(): boolean`
- `isEntityValid(): boolean`
- `isExistInTheWorld(): boolean`
- `isFascia(): boolean`
- `isFireInteractionObject(): boolean`
- `isFloor(): boolean`
- `isFluidInputLocked(): boolean`
- `isFurnitureOccupied(IsoGameCharacter localCharacter): boolean`
- `isGenericCraftingSurface(): boolean`
- `isGrass(): boolean`
- `isGrassLike(): boolean`
- `isGrave(): boolean`
- `isHighlightRenderOnce(): boolean`
- `isHighlightRenderOnce(int playerIndex): boolean`
- `isHighlighted(): boolean`
- `isHighlighted(int playerIndex): boolean`
- `isHoppable(): boolean`
- `isHoppable(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isHoppableOrWindowFrame(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isItemAllowedInContainer(ItemContainer container, InventoryItem item): boolean`
- `isLit(): boolean`
- `isMaskClicked(int x, int y): boolean`
- `isMaskClicked(int x, int y, boolean flip): boolean`
- `isMovedThumpable(): boolean`
- `isNoPicking(): boolean`
- `isNorthHoppable(): boolean`
- `isObjectNoContainerOrEmpty(): boolean`
- `isOnScreen(): boolean`
- `isOre(): boolean`
- `isOres(): boolean`
- `isOutlineHighlight(): boolean`
- `isOutlineHighlight(int playerIndex): boolean`
- `isOutlineHlAttached(): boolean`
- `isOutlineHlAttached(int playerIndex): boolean`
- `isOutlineHlBlink(): boolean`
- `isOutlineHlBlink(int playerIndex): boolean`
- `isOutlineOnMouseover(): boolean`
- `isPropaneBBQ(): boolean`
- `isRemoveItemAllowedFromContainer(ItemContainer container, InventoryItem item): boolean`
- `isSatChair(): boolean`
- `isSceneCulled(): boolean`
- `isSpriteInvisible(): boolean`
- `isStairsNorth(): boolean`
- `isStairsObject(): boolean`
- `isStairsWest(): boolean`
- `isStump(): boolean`
- `isTableSurface(): boolean`
- `isTableTopObject(): boolean`
- `isTaintedWater(): boolean`
- `isTallHoppable(): boolean`
- `isTargetAlphaZero(int playerIndex): boolean`
- `isTent(): boolean`
- `isUnbentObject(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isUseSnowSprite(): boolean`
- `isWall(): boolean`
- `isWallN(): boolean`
- `isWallSE(): boolean`
- `isWallW(): boolean`
- `isWindow(): boolean`
- `isWindowFrame(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isZombie(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `loadFromRemoteBuffer(ByteBufferReader b): void`
- `loadFromRemoteBuffer(ByteBufferReader b, boolean addToObjects): void`
- `loadState(ByteBuffer bb): void`
- `moveFluidToTemporaryContainer(float amount): FluidContainer`
- `onAnimationFinished(): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onMouseLeftClick(int x, int y): boolean`
- `onMouseRightClick(int lx, int ly): void`
- `onMouseRightReleased(): void`
- `propertyEquals(String key, String value): boolean`
- `propertyEqualsIgnoreCase(String key, String value): boolean`
- `registerECSComponents(): void` from `ECSEntity`
- `removeAllContainers(): void`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromSquare(): void`
- `removeFromWorld(): void`
- `removeFromWorldToMeta(): void`
- `removeRenderEffect(ObjectRenderEffects o): void`
- `removeSheetRope(IsoPlayer player): boolean`
- `render(float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `renderAnimatedAttachments(float x, float y, float z, ColorInfo col): void`
- `renderAttachedAndOverlaySprites(IsoDirections dir, float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader, Consumer<TextureDraw> texdModifier): void`
- `renderFloorTile(float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader, Consumer<TextureDraw> texdModifier, Consumer<TextureDraw> attachedAndOverlayModifier): void`
- `renderFxMask(float x, float y, float z, boolean bDoAttached): void`
- `renderObjectPicker(float x, float y, float z, ColorInfo lightInfo): void`
- `renderWallTile(IsoDirections dir, float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader, Consumer<TextureDraw> texdModifier): void`
- `renderWallTileDepth(IsoDirections dir, boolean cutawaySelf, boolean cutawayE, boolean cutawayS, int cutawaySEX, float x, float y, float z, ColorInfo col, Shader shader, Consumer<TextureDraw> texdModifier): void`
- `renderWallTileOnly(IsoDirections dir, float x, float y, float z, ColorInfo col, Shader shader, Consumer<TextureDraw> texdModifier): void`
- `replaceItem(InventoryItem item): InventoryItem`
- `reset(): void`
- `reuseGridSquare(): void`
- `save(ByteBuffer output): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `saveState(ByteBuffer bb): void`
- `sendObjectChange(IsoObjectChange change): void`
- `sendObjectChange(IsoObjectChange change, Object... args): void`
- `sendObjectChange(IsoObjectChange change, KahluaTable tbl): void`
- `setAlpha(float alpha): void`
- `setAlpha(int playerIndex, float alpha): void`
- `setAlphaAndTarget(float alpha): void`
- `setAlphaAndTarget(int playerIndex, float alpha): void`
- `setAlphaToTarget(int playerIndex): void`
- `setAnimating(boolean bAnimating): void`
- `setAttachedAnimSprite(ArrayList<IsoSpriteInstance> attachedAnimSprite): void`
- `setBlink(boolean blink): void`
- `setBlink(int playerIndex, boolean blink): void`
- `setChildSprites(ArrayList<IsoSpriteInstance> attachedAnimSprite): void`
- `setContainer(ItemContainer container): void`
- `setCustomColor(float r, float g, float b, float a): void`
- `setCustomColor(ColorInfo col): void`
- `setDamage(short damage): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setDir(int dir): void`
- `setDoRender(boolean doRender): void`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setExplored(boolean isExplored): void`
- `setForwardIsoDirection(int dir): void`
- `setForwardIsoDirection(IsoDirections dir): void`
- `setHighlightColor(float r, float g, float b, float a): void`
- `setHighlightColor(int playerIndex, float r, float g, float b, float a): void`
- `setHighlightColor(int playerIndex, ColorInfo highlightColor): void`
- `setHighlightColor(ColorInfo highlightColor): void`
- `setHighlightRenderOnce(boolean highlight): void`
- `setHighlightRenderOnce(int playerIndex, boolean highlight): void`
- `setHighlighted(boolean highlight): void`
- `setHighlighted(boolean highlight, boolean renderOnce): void`
- `setHighlighted(int playerIndex, boolean highlight): void`
- `setHighlighted(int playerIndex, boolean highlight, boolean renderOnce): void`
- `setKeyId(int keyId): void`
- `setLightSource(IsoLightSource lightSource): void`
- `setLit(boolean lit): void`
- `setModData(KahluaTable newDatas): void`
- `setMovedThumpable(boolean movedThumpable): void`
- `setName(String name): void`
- `setNoPicking(boolean noPicking): void`
- `setOffsetX(float offsetX): void`
- `setOffsetY(float offsetY): void`
- `setOnOverlay(IsoSpriteInstance inst): void`
- `setOutlineHighlight(boolean isOutlineHighlight): void`
- `setOutlineHighlight(int playerIndex, boolean isOutlineHighlight): void`
- `setOutlineHighlightCol(float r, float g, float b, float a): void`
- `setOutlineHighlightCol(int playerIndex, float r, float g, float b, float a): void`
- `setOutlineHighlightCol(int playerIndex, ColorInfo outlineHighlightCol): void`
- `setOutlineHighlightCol(ColorInfo outlineHighlightCol): void`
- `setOutlineHlAttached(int playerIndex, boolean isOutlineHlAttached): void`
- `setOutlineHlAttached(boolean isOutlineHlAttached): void`
- `setOutlineHlBlink(int playerIndex, boolean isOutlineHlBlink): void`
- `setOutlineHlBlink(boolean isOutlineHlBlink): void`
- `setOutlineOnMouseover(boolean outlineOnMouseover): void`
- `setOutlineThickness(float outlineThickness): void`
- `setOverlaySprite(String spriteName, float r, float g, float b, float a, boolean bTransmit): boolean`
- `setOverlaySprite(String spriteName): void`
- `setOverlaySprite(String spriteName, boolean bTransmit): void`
- `setOverlaySprite(String spriteName, float r, float g, float b, float a): void`
- `setOverlaySpriteColor(float r, float g, float b, float a): void`
- `setPipedFuelAmount(int units): void`
- `setRenderEffect(RenderEffectType type): void`
- `setRenderEffect(RenderEffectType type, boolean reuseEqualType): void`
- `setRenderYOffset(float f): void`
- `setRerouteCollide(IsoObject rerouteCollide): void`
- `setRerouteMask(IsoObject rerouteMask): void`
- `setSatChair(boolean satChair): void`
- `setSceneCulled(boolean isCulled): void`
- `setSpecialTooltip(boolean specialTooltip): void`
- `setSprite(String name): void`
- `setSprite(IsoSprite sprite): void`
- `setSpriteFromName(String name): void`
- `setSpriteModelName(String spriteModelName): void`
- `setSquare(IsoGridSquare square): void`
- `setTable(KahluaTable table): void`
- `setTargetAlpha(float targetAlpha): void`
- `setTargetAlpha(int playerIndex, float targetAlpha): void`
- `setTile(String tile): void`
- `setType(IsoObjectType type): void`
- `setUsesExternalWaterSource(boolean b): void`
- `shouldShowOnOverlay(): boolean`
- `softReset(): void`
- `spawnItemToObjectSurface(String item): InventoryItem`
- `spawnItemToObjectSurface(String item, boolean randomRotation): InventoryItem`
- `spawnItemToObjectSurface(String item, boolean randomRotation, boolean checkForAdjacentCanStandSquare): InventoryItem`
- `sync(): void`
- `sync(int i): void`
- `syncFluidContainerReceive(ByteBufferReader bb): void`
- `syncFluidContainerSend(ByteBufferWriter bb): void`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source, ByteBufferReader bb): void`
- `syncIsoObjectReceive(ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter bb): void`
- `toString(): String`
- `transferFluidFrom(FluidContainer source, float amount): float`
- `transferFluidTo(FluidContainer target, float amount): float`
- `transmitCompleteItemToClients(): void`
- `transmitCustomColorToClients(): void`
- `transmitModData(): void`
- `transmitUpdatedSprite(): void`
- `transmitUpdatedSpriteToClients(): void`
- `transmitUpdatedSpriteToClients(UdpConnection connection): void`
- `transmitUpdatedSpriteToServer(): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `turnOn(): void`
- `unsetOutlineHighlight(): void`
- `update(): void`
- `useFluid(float amount): float`
- `useItemOn(InventoryItem item): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`
- `writeToRemoteBuffer(ByteBufferWriter b): void`

Static functions, called as `IsoObject.name(...)`:

- `FindExternalWaterSource(int x, int y, int z): IsoObject`
- `FindExternalWaterSource(IsoGridSquare square): IsoObject`
- `FindWaterSourceOnSquare(IsoGridSquare square): IsoObject`
- `factoryClassFromFileInput(IsoCell cell, int classID): Class<?>`
- `factoryFromFileInput(IsoCell cell, byte classID): IsoObject`
- `factoryFromFileInput(IsoCell cell, ByteBuffer b): IsoObject`
- `factoryFromFileInput_OLD(IsoCell cell, int classID): IsoObject`
- `factoryGetClassID(String name): byte`
- `getFactoryVehicle(): IsoObject.IsoObjectFactory`
- `getLastRendered(): IsoObject`
- `getLastRenderedRendered(): IsoObject`
- `getNew(): IsoObject`
- `getNew(IsoGridSquare sq, String spriteName, String name, boolean bShareTilesWithMap): IsoObject`
- `setLastRendered(IsoObject aLastRendered): void`
- `setLastRenderedRendered(IsoObject aLastRenderedRendered): void`

Constructors: `IsoObject.new()`, `IsoObject.new(IsoCell cell)`, `IsoObject.new(IsoCell cell, IsoGridSquare square, String gid)`, `IsoObject.new(IsoCell cell, IsoGridSquare square, IsoSprite spr)`, `IsoObject.new(IsoGridSquare square, String tile)`, `IsoObject.new(IsoGridSquare square, String tile, boolean bShareTilesWithMap)`, `IsoObject.new(IsoGridSquare square, String tile, String name)`, `IsoObject.new(IsoGridSquare square, String tile, String name, boolean bShareTilesWithMap)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoObjectPicker

`zombie.iso.IsoObjectPicker`, class.

Methods, called as `obj:name(...)`:

- `Add(int x, int y, int width, int height, IsoGridSquare gridSquare, IsoObject tile, boolean flip, float scaleX, float scaleY): void`
- `ContextPick(int screenX, int screenY): IsoObjectPicker.ClickObject`
- `Init(): void`
- `Pick(int xx, int yy): IsoObjectPicker.ClickObject`
- `PickCorpse(int screenX, int screenY): IsoObject`
- `PickDoor(int screenX, int screenY, boolean bTransparent): IsoObject`
- `PickHoppable(int screenX, int screenY): IsoObject`
- `PickTarget(int xx, int yy): IsoMovingObject`
- `PickThumpable(int screenX, int screenY): IsoObject`
- `PickTree(int screenX, int screenY): IsoObject`
- `PickVehicle(int screenX, int screenY): BaseVehicle`
- `PickWindow(int screenX, int screenY): IsoObject`
- `PickWindowFrame(int screenX, int screenY): IsoObject`
- `StartRender(): void`
- `getInstance(): IsoObjectPicker`

Constructors: `IsoObjectPicker.new()`.

Static fields (a copy of the value taken when the class is exposed): `Instance: IsoObjectPicker`, `comp: Comparator<IsoObjectPicker.ClickObject>`.

### IsoPuddles

`zombie.iso.IsoPuddles`, class.

Methods, called as `obj:name(...)`:

- `applyNetworkUpdate(float wetGroundValue, float puddlesSizeValue, float muddyPuddlesValue): void`
- `applyPuddlesQuality(): void`
- `clearThreadData(): void`
- `freeHMTextureBuffer(): void`
- `getBoolMax(): int`
- `getFloatMax(): int`
- `getHMTexture(): ITexture`
- `getHMTextureBuffer(): ByteBuffer`
- `getMuddyPuddlesFinalValue(): float`
- `getPuddlesFloat(int id): IsoPuddles.PuddlesFloat`
- `getPuddlesParams(int z): FloatBuffer`
- `getPuddlesSize(): float`
- `getPuddlesSizeFinalValue(): float`
- `getRainIntensity(): float`
- `getShaderEnable(): boolean`
- `getShaderOffset(): Vector4f`
- `getShaderOffsetMain(): Vector4f`
- `getShaderTime(): float`
- `getWetGroundFinalValue(): float`
- `puddlesGeometry(int firstSquare, int numSquares): void`
- `puddlesProjection(Matrix4f projection): void`
- `render(ArrayList<IsoGridSquare> grid, int z): void`
- `renderToChunkTexture(ArrayList<IsoGridSquare> squares, int z): void`
- `shouldRenderPuddles(): boolean`
- `update(ClimateManager cm): void`
- `updateHMTextureBuffer(): void`

Static functions, called as `IsoPuddles.name(...)`:

- `getInstance(): IsoPuddles`

Constructors: `IsoPuddles.new()`.

Static fields (a copy of the value taken when the class is exposed): `BOOL_MAX: int`, `FLOAT_MAX: int`, `FLOAT_MUDDYPUDDLES: int`, `FLOAT_PUDDLESSIZE: int`, `FLOAT_RAIN: int`, `FLOAT_RAININTENSITY: int`, `FLOAT_WETGROUND: int`, `VBOs: SharedVertexBufferObjects`, `leakingPuddlesInTheRoom: boolean`.

### IsoPuddles.PuddlesFloat

`zombie.iso.IsoPuddles.PuddlesFloat`, class.

Methods, called as `obj:name(...)`:

- `addFinalValue(float f): void`
- `addFinalValueForMax(float f, float maximum): void`
- `getAdminValue(): float`
- `getFinalValue(): float`
- `getID(): int`
- `getMax(): float`
- `getMin(): float`
- `getName(): String`
- `init(int id, String name): IsoPuddles.PuddlesFloat`
- `interpolateFinalValue(float f): void`
- `isEnableAdmin(): boolean`
- `setAdminValue(float f): void`
- `setEnableAdmin(boolean b): void`
- `setFinalValue(float f): void`

Constructors: `IsoPuddles.PuddlesFloat.new()`.

### IsoPushableObject

`zombie.iso.IsoPushableObject`, class. Extends [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject) (180), [IsoObject](#isoobject) (397), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoCollideNorS(): void`
- `DoCollideWorE(): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getObjectName(): String`
- `getWeight(float x, float y): float`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoPushableObject.new(IsoCell cell)`, `IsoPushableObject.new(IsoCell cell, int x, int y, int z)`, `IsoPushableObject.new(IsoCell cell, IsoGridSquare square, IsoSprite spr)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `treeSoundMgr: TreeSoundManager`.

### IsoUtils

`zombie.iso.IsoUtils`, class.

Static functions, called as `IsoUtils.name(...)`:

- `DistanceManhatten(float fromX, float fromY, float toX, float toY): float`
- `DistanceManhatten(float fromX, float fromY, float toX, float toY, float fromZ, float toZ): float`
- `DistanceManhattenSquare(float fromX, float fromY, float toX, float toY): float`
- `DistanceTo(float fromX, float fromY, float toX, float toY): float`
- `DistanceTo(float fromX, float fromY, float fromZ, float toX, float toY, float toZ): float`
- `DistanceTo2D(float fromX, float fromY, float toX, float toY): float`
- `DistanceToSquared(float fromX, float fromY, float toX, float toY): float`
- `DistanceToSquared(float fromX, float fromY, float fromZ, float toX, float toY, float toZ): float`
- `XToIso(float screenX, float screenY, float floor): float`
- `XToIso(int playerIndex, float screenX, float screenY, float floor): float`
- `XToIsoTrue(float screenX, float screenY, int floor): float`
- `XToScreen(float objectX, float objectY, float objectZ, int screenZ): float`
- `XToScreenExact(float objectX, float objectY, float objectZ, int screenZ): float`
- `XToScreenInt(int objectX, int objectY, int objectZ, int screenZ): float`
- `YToIso(float screenX, float screenY, float floor): float`
- `YToIso(int playerIndex, float screenX, float screenY, float floor): float`
- `YToScreen(float objectX, float objectY, float objectZ, int screenZ): float`
- `YToScreenExact(float objectX, float objectY, float objectZ, int screenZ): float`
- `YToScreenInt(int objectX, int objectY, int objectZ, int screenZ): float`
- `clamp(float x, float minVal, float maxVal): float`
- `isSimilarDirection(IsoGameCharacter chr, float xA, float yA, float xB, float yB, float similar): boolean`
- `lerp(float val, float min, float max): float`
- `smoothstep(float edge0, float edge1, float x): float`

Constructors: `IsoUtils.new()`.

### IsoWaterGeometry

`zombie.iso.IsoWaterGeometry`, class.

Methods, called as `obj:name(...)`:

- `getFlow(): float`
- `getSpeed(): float`
- `hasWater(): boolean`
- `init(IsoGridSquare square): IsoWaterGeometry`
- `initRenderIfNeeded(): void`
- `isActualShore(): boolean`
- `isShore(): boolean`
- `isValid(): boolean`
- `isbShore(): boolean`

Constructors: `IsoWaterGeometry.new()`.

Static fields (a copy of the value taken when the class is exposed): `pool: ObjectPool<IsoWaterGeometry>`.

### IsoWorld

`zombie.iso.IsoWorld`, class.

Methods, called as `obj:name(...)`:

- `CreateRandomSurvivor(SurvivorDesc desc, IsoGridSquare sq, IsoPlayer player): IsoSurvivor`
- `CreateSwarm(int num, int x1, int y1, int x2, int y2): void`
- `DrawPlayerCone(): void`
- `DrawPlayerCone2(): void`
- `FinishAnimation(): void`
- `ForceKillAllZombies(): void`
- `KillCell(): void`
- `LoadPlayerForInfo(): boolean`
- `LoadTileDefinitions(IsoSpriteManager sprMan, String filename, int fileNumber): void`
- `LoadTileDefinitionsPropertyStrings(IsoSpriteManager sprMan, String filename, int fileNumber): void`
- `addLuaTrait(CharacterTrait trait): void`
- `checkVehiclesZones(): void`
- `getAllTiles(String filename): ArrayList<String>`
- `getAllTiles(): HashMap<String, ArrayList<String>>`
- `getAllTilesName(): ArrayList<String>`
- `getAttachmentsHandler(): AttachmentsHandler`
- `getBiomeMap(): BiomeMap`
- `getBlending(): Blending`
- `getCell(): IsoCell`
- `getClimateManager(): ClimateManager`
- `getFrameNo(): int`
- `getFreeEmitter(): BaseSoundEmitter`
- `getFreeEmitter(float x, float y, float z): BaseSoundEmitter`
- `getGameMode(): String`
- `getGlobalTemperature(): float`
- `getLuaPlayerDesc(): SurvivorDesc`
- `getLuaPosX(): int`
- `getLuaPosY(): int`
- `getLuaPosZ(): int`
- `getLuaSpawnCellX(): int`
- `getLuaSpawnCellY(): int`
- `getLuaTraits(): List<CharacterTrait>`
- `getMap(): String`
- `getMetaChunk(int wx, int wy): IsoMetaChunk`
- `getMetaChunkFromTile(int wx, int wy): IsoMetaChunk`
- `getMetaGrid(): IsoMetaGrid`
- `getPreset(): String`
- `getPuddlesManager(): IsoPuddles`
- `getRBBasic(): RandomizedBuildingBase`
- `getRandomizedBuildingList(): ArrayList<RandomizedBuildingBase>`
- `getRandomizedVehicleStoryByName(String name): RandomizedVehicleStoryBase`
- `getRandomizedVehicleStoryList(): ArrayList<RandomizedVehicleStoryBase>`
- `getRandomizedWorldBase(): RandomizedWorldBase`
- `getRandomizedZoneList(): ArrayList<RandomizedZoneStoryBase>`
- `getRandomizedZoneStoryByName(String name): RandomizedZoneStoryBase`
- `getRules(): Rules`
- `getSpawnRegion(): String`
- `getSpawnedZombieZone(): HashMap<String, ArrayList<UUID>>`
- `getTileImageNames(): ArrayList<String>`
- `getTimeSinceLastSurvivorInHorde(): int`
- `getWeather(): String`
- `getWgChunk(): WorldGenChunk`
- `getWorld(): String`
- `getWorldAgeDays(): float`
- `getWorldSquareX(): int`
- `getWorldSquareY(): int`
- `getZombieVoronois(): List<ZombieVoronoi>`
- `getZoneGenerator(): ZoneGenerator`
- `init(): void`
- `isHydroPowerOn(): boolean`
- `isValidSquare(int x, int y, int z): boolean`
- `registerMannequinZone(String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): Zone`
- `registerNavZones(): void`
- `registerRoomTone(String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): void`
- `registerSpawnOrigin(int x, int y, int width, int height, KahluaTable properties): void`
- `registerVehiclesZone(String name, String type, int x, int y, int z, int width, int height, KahluaTable properties): Zone`
- `registerWaterFlow(float x, float y, float flow, float speed): void`
- `registerWaterZone(float x1, float y1, float x2, float y2, float shore, float waterGround): void`
- `registerZone(String name, String type, int x, int y, int z, int width, int height): Zone`
- `registerZoneNoOverlap(String name, String type, int x, int y, int z, int width, int height): Zone`
- `removeZonesForLotDirectory(String lotDir): void`
- `render(): void`
- `renderTerrain(): void`
- `returnOwnershipOfEmitter(BaseSoundEmitter emitter): void`
- `sceneCullAnimals(): void`
- `sceneCullZombies(): void`
- `setAttachmentsHandler(AttachmentsHandler attachmentsHandler): void`
- `setBiomeMap(BiomeMap biomeMap): void`
- `setBlending(Blending blending): void`
- `setDrawWorld(boolean b): void`
- `setEmitterOwner(BaseSoundEmitter emitter, IsoObject object): void`
- `setGameMode(String mode): void`
- `setHydroPowerOn(boolean on): void`
- `setLuaPlayerDesc(SurvivorDesc desc): void`
- `setLuaPosX(int luaPosX): void`
- `setLuaPosY(int luaPosY): void`
- `setLuaPosZ(int luaPosZ): void`
- `setLuaSpawnCellX(int luaSpawnCellX): void`
- `setLuaSpawnCellY(int luaSpawnCellY): void`
- `setMap(String world): void`
- `setPreset(String mode): void`
- `setRules(Rules rules): void`
- `setSpawnRegion(String spawnRegionName): void`
- `setTimeSinceLastSurvivorInHorde(int timeSinceLastSurvivorInHorde): void`
- `setWeather(String weather): void`
- `setWgChunk(WorldGenChunk wgChunk): void`
- `setWorld(String world): void`
- `setZombieVoronois(List<ZombieVoronoi> zombieVoronois): void`
- `setZoneGenerator(ZoneGenerator zoneGenerator): void`
- `takeOwnershipOfEmitter(BaseSoundEmitter emitter): void`
- `transmitWeather(): void`
- `update(): void`

Static functions, called as `IsoWorld.name(...)`:

- `getWorldVersion(): int`
- `getZombiesDisabled(): boolean`
- `getZombiesEnabled(): boolean`
- `parseDistributions(): void`
- `readInt(InputStream in): int`
- `readInt(RandomAccessFile in): int`
- `readString(InputStream in, StringBuilder input): String`
- `readString(RandomAccessFile in): String`

Constructors: `IsoWorld.new()`.

Static fields (a copy of the value taken when the class is exposed): `LUA_CHECKSUM_TIMEOUT_MS: long`, `MAX_TDEF_FILE_NUMBER_FOR_MODS: int`, `MIN_TDEF_FILE_NUMBER_FOR_MODS: int`, `PropertyValueMap: HashMap<String, ArrayList<String>>`, `WorldVersion: int`, `WorldVersion_42_13: int`, `WorldVersion_AlarmClock: int`, `WorldVersion_AlarmDecay: int`, `WorldVersion_AnimalHutch: int`, `WorldVersion_AnimalOnlineId: int`, `WorldVersion_AnimalPetTime: int`, `WorldVersion_AnimalRottingTexture: int`, `WorldVersion_AnimalWild: int`, `WorldVersion_BodyDamageSavePoulticeValues: int`, `WorldVersion_BodyDamageStatusesSync: int`, `WorldVersion_BuildMaterials: int`, `WorldVersion_CharacterDiscomfort: int`, `WorldVersion_CharacterVoiceOptions: int`, `WorldVersion_CharacterVoiceType: int`, `WorldVersion_ChunksAttachmentsPartial: int`, `WorldVersion_ChunksAttachmentsState: int`, `WorldVersion_ChunksWorldGeneratedBoolean: int`, `WorldVersion_ChunksWorldModifiedBoolean: int`, `WorldVersion_CraftLogicParallelCrafting: int`, `WorldVersion_CraftUpdateFoundations: int`, `WorldVersion_DeadBodyAnimalGenetics: int`, `WorldVersion_DesignationZone: int`, `WorldVersion_EnableWorldgen: int`, `WorldVersion_FastMoveCheat: int`, `WorldVersion_FishingCheat: int`, `WorldVersion_HutchAndVehicleAnimalFormat: int`, `WorldVersion_InventoryItemUsesInteger: int`, `WorldVersion_IsoCompostHealthValues: int`, `WorldVersion_ItemWorldRotationFloats: int`, `WorldVersion_LearnedRecipes: int`, `WorldVersion_MetaEntityOutsideAware: int`, `WorldVersion_ObjectID: int`, `WorldVersion_PlayerAutoDrink: int`, `WorldVersion_PlayerExtraInfoFlags: int`, `WorldVersion_PlayerInsulation: int`, `WorldVersion_PlayerSaveCraftingHistory: int`, `WorldVersion_PreviouslyMoved: int`, `WorldVersion_PrintMediaRottingCorpsesBodyDamage: int`, `WorldVersion_RecipesAndAmmoCheats: int`, `WorldVersion_RemoveDifficulty: int`, `WorldVersion_RootLocale: int`, `WorldVersion_SafeHouseCreatedTimeAndLocation: int`, `WorldVersion_SafeHouseHitPoints: int`, `WorldVersion_SaveFireTimer: int`, `WorldVersion_SavePlayerCheats: int`, `WorldVersion_SquareSeen: int`, `WorldVersion_Stats_Idleness: int`, `WorldVersion_ThermalDuration: int`, `WorldVersion_TrapExplosionDuration: int`, `WorldVersion_VariableCraftInputCounts: int`, `WorldVersion_VariableHeight: int`, `WorldVersion_VehicleAlarm: int`, `WorldVersion_VisitedFileVersion: int`, `WorldVersion_ZoneIDisUUID: int`, `animationThread: CompletableFuture<Void>`, `instance: IsoWorld`, `mapPath: String`, `mapUseJar: boolean`, `noZombies: boolean`, `savedWorldVersion: int`, `saveoffsetx: int`, `saveoffsety: int`, `totalWorldVersion: int`.

### ISWorldObjectContextMenuLogic

`zombie.iso.ISWorldObjectContextMenuLogic`, class.

Static functions, called as `ISWorldObjectContextMenuLogic.name(...)`:

- `callCustomFunction(ContextMenuConfigScript.EntryScript entry, InventoryItem item, IsoPlayer playerObj): void`
- `callCustomFunction(ContextMenuConfigScript.EntryScript entry, ISContextMenuWrapper context, GameEntity entity, IsoPlayer playerObj): void`
- `checkBlowTorchForBarricade(IsoPlayer chr): boolean`
- `createMenuEntries(KahluaTable fetch, KahluaTable context, double player, KahluaTable worldobjects, int x, int y, boolean test): boolean`
- `fetch(KahluaTable fetch, IsoObject v, double player, boolean doSquare): void`

Constructors: `ISWorldObjectContextMenuLogic.new()`.

### LosUtil

`zombie.iso.LosUtil`, class.

Static functions, called as `LosUtil.name(...)`:

- `getFirstBlockingIsoGridSquare(IsoCell cell, int x0, int y0, int z0, int x1, int y1, int z1, boolean bIgnoreDoors): IsoGridSquareCollisionData`
- `init(int width, int height): void`
- `lineClear(IsoCell cell, int x0, int y0, int z0, int x1, int y1, int z1, boolean bIgnoreDoors): LosUtil.TestResults`
- `lineClear(IsoCell cell, int x0, int y0, int z0, int x1, int y1, int z1, boolean bIgnoreDoors, int rangeTillWindows): LosUtil.TestResults`
- `lineClearCached(IsoCell cell, int x1, int y1, int z1, int x0, int y0, int z0, boolean bIgnoreDoors, int playerIndex): LosUtil.TestResults`
- `lineClearCollide(int x1, int y1, int z1, int x0, int y0, int z0, boolean bIgnoreDoors): boolean`
- `lineClearCollideCount(IsoGameCharacter chr, IsoCell cell, int x1, int y1, int z1, int x0, int y0, int z0): int`

Constructors: `LosUtil.new()`.

Static fields (a copy of the value taken when the class is exposed): `cachecleared: boolean[]`, `cachedresults: LosUtil.PerPlayerData[]`, `sizeX: int`, `sizeY: int`, `sizeZ: int`.

### MetaObject

`zombie.iso.MetaObject`, class.

Methods, called as `obj:name(...)`:

- `getRoom(): RoomDef`
- `getType(): int`
- `getUsed(): boolean`
- `getX(): int`
- `getY(): int`
- `setUsed(boolean bUsed): void`

Constructors: `MetaObject.new(int type, int x, int y, RoomDef def)`.

### GridSquareEdge

`zombie.iso.objects.GridSquareEdge`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `GridSquareEdge.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): GridSquareEdge`
- `values(): GridSquareEdge[]`

Enum values (read as `GridSquareEdge.VALUE`): `EAST`, `NORTH`, `SOUTH`, `WEST`.

### GridSquareEdgeFacingDirection

`zombie.iso.objects.GridSquareEdgeFacingDirection`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `GridSquareEdgeFacingDirection.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): GridSquareEdgeFacingDirection`
- `values(): GridSquareEdgeFacingDirection[]`

Enum values (read as `GridSquareEdgeFacingDirection.VALUE`): `EAST_WEST`, `NORTH_SOUTH`.

### BarricadeAble

`zombie.iso.objects.interfaces.BarricadeAble`, interface.

Methods, called as `obj:name(...)`:

- `addBarricadesFromCraftRecipe(IsoGameCharacter chr, ArrayList<InventoryItem> items, CraftRecipeData craftRecipeData, boolean opposite): IsoBarricade`
- `getBarricadeForCharacter(IsoGameCharacter var1): IsoBarricade`
- `getBarricadeOnOppositeSquare(): IsoBarricade`
- `getBarricadeOnSameSquare(): IsoBarricade`
- `getBarricadeOppositeCharacter(IsoGameCharacter): IsoBarricade`
- `getGridSquareEdgeFacingDirection(): GridSquareEdgeFacingDirection` from `GridSquareEdgeElement`
- `getNorth(): boolean` from `GridSquareEdgeElement`
- `getOppositeSquare(): IsoGridSquare` from `GridSquareEdgeElement`
- `getSquare(): IsoGridSquare` from `GridSquareEdgeElement`
- `isBarricadeAllowed(): boolean`
- `isBarricaded(): boolean`

### IsoAnimalTrack

`zombie.iso.objects.IsoAnimalTrack`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (412), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `frameStep(): void` from `ECSEntity`
- `getAnimalTracks(): AnimalTracks`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getObjectName(): String`
- `glow(IsoPlayer chr): void`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `load(ByteBuffer input, int worldversion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `stopGlow(IsoPlayer chr): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoAnimalTrack.new(IsoCell cell)`, `IsoAnimalTrack.new(IsoGridSquare sq, String sprite, AnimalTracks track)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoBarbecue

`zombie.iso.objects.IsoBarbecue`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (398), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addFuel(int fuelAmount): void`
- `addToWorld(): void`
- `extinguish(): void`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getFuelAmount(): int`
- `getObjectName(): String`
- `getTemperature(): float`
- `hasAnimatedAttachments(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasFuel(): boolean`
- `hasPropaneTank(): boolean`
- `isLit(): boolean`
- `isPropaneBBQ(): boolean`
- `isSmouldering(): boolean`
- `isTemperatureChanging(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader byteBuffer): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `removePropaneTank(): InventoryItem`
- `render(float x, float y, float z, ColorInfo colorInfo, boolean doChild, boolean wallLightingPass, Shader shader): void`
- `renderAnimatedAttachments(float x, float y, float z, ColorInfo colorInfo): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable kahluaTable, ByteBufferWriter byteBuffer): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setFuelAmount(int fuelAmount): void`
- `setLit(boolean lit): void`
- `setPropaneTank(InventoryItem tank): void`
- `setSprite(IsoSprite isoSprite): void`
- `toggle(): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `turnOff(): void`
- `turnOn(): void`
- `update(): void`
- `useFuel(int amount): int`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoBarbecue.name(...)`:

- `isSpriteWithPropaneTank(IsoSprite sprite): boolean`
- `isSpriteWithoutPropaneTank(IsoSprite sprite): boolean`

Constructors: `IsoBarbecue.new(IsoCell cell)`, `IsoBarbecue.new(IsoCell cell, IsoGridSquare isoGridSquare, IsoSprite isoSprite)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoBarricade

`zombie.iso.objects.IsoBarricade`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (398), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Damage(float amount): void`
- `TestVision(IsoGridSquare from, IsoGridSquare to): IsoObject.VisionResult`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `Thump(IsoMovingObject thumper, int thumpEventCount): void`
- `WeaponHit(IsoGameCharacter owner, HandWeapon weapon): void`
- `addFromCraftRecipe(IsoGameCharacter chr, ArrayList<InventoryItem> items): void`
- `addMetal(IsoGameCharacter chr, InventoryItem metal): void`
- `addMetalBar(IsoGameCharacter chr, InventoryItem metalBar): void`
- `addPlank(IsoGameCharacter chr): void`
- `addPlank(IsoGameCharacter chr, InventoryItem plank): void`
- `canAddPlank(): boolean`
- `canAttackBypassIsoBarricade(IsoGameCharacter isoGameCharacter, HandWeapon handWeapon): boolean`
- `frameStep(): void` from `ECSEntity`
- `getBarricadedObject(): BarricadeAble`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFacingPosition(Vector2 pos): Vector2`
- `getFrameNo(): int` from `ECSEntity`
- `getHealth(): int`
- `getLightTransmission(): float`
- `getMaxHealth(): int`
- `getNumPlanks(): int`
- `getObjectName(): String`
- `getThumpCondition(): float`
- `getThumpableFor(IsoGameCharacter chr): Thumpable`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isBlockVision(): boolean`
- `isDestroyed(): boolean`
- `isMetal(): boolean`
- `isMetalBar(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeMetal(IsoGameCharacter chr): InventoryItem`
- `removeMetalBar(IsoGameCharacter chr): InventoryItem`
- `removePlank(IsoGameCharacter chr): InventoryItem`
- `render(float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setHealth(int health): void`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source, ByteBufferReader bb): void`
- `syncIsoObjectReceive(ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoBarricade.name(...)`:

- `AddBarricadeToObject(BarricadeAble to, boolean addOpposite): IsoBarricade`
- `AddBarricadeToObject(BarricadeAble to, IsoGameCharacter chr): IsoBarricade`
- `GetBarricadeForCharacter(BarricadeAble obj, IsoGameCharacter chr): IsoBarricade`
- `GetBarricadeOnSquare(IsoGridSquare square, IsoDirections dir): IsoBarricade`
- `GetBarricadeOppositeCharacter(BarricadeAble obj, IsoGameCharacter chr): IsoBarricade`
- `barricadeCurrentCellWithMetalBars(): void`
- `barricadeCurrentCellWithMetalPlate(): void`
- `barricadeCurrentCellWithPlanks(int numberOfPlanks): void`

Constructors: `IsoBarricade.new(IsoCell cell)`, `IsoBarricade.new(IsoGridSquare gridSquare, IsoDirections dir)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_PLANKS: int`, `MAX_WALL_SPLATS: int`, `METAL_BAR_HEALTH: int`, `METAL_HEALTH: int`, `METAL_HEALTH_DAMAGED: int`, `PLANK_HEALTH: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoBrokenGlass

`zombie.iso.objects.IsoBrokenGlass`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (413), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getObjectName(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `renderObjectPicker(float x, float y, float z, ColorInfo lightInfo): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoBrokenGlass.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoCarBatteryCharger

`zombie.iso.objects.IsoCarBatteryCharger`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (401), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `couldBePoweredByGenerator(): boolean`
- `frameStep(): void` from `ECSEntity`
- `getBattery(): InventoryItem`
- `getChargeRate(): float`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getItem(): InventoryItem`
- `getObjectName(): String`
- `getTexture(): Texture`
- `hasAnimatedAttachments(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isActivated(): boolean`
- `load(ByteBuffer bb, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoChild, boolean bWallLightingPass, Shader shader): void`
- `renderAnimatedAttachments(float x, float y, float z, ColorInfo col): void`
- `renderObjectPicker(float x, float y, float z, ColorInfo lightInfo): void`
- `save(ByteBuffer bb, boolean isDebugSave): void`
- `setActivated(boolean activated): void`
- `setBattery(InventoryItem battery): void`
- `setChargeRate(float chargeRate): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `syncIsoObjectReceive(ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoCarBatteryCharger.new(InventoryItem item, IsoCell cell, IsoGridSquare square)`, `IsoCarBatteryCharger.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoClothingDryer

`zombie.iso.objects.IsoClothingDryer`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (404), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `couldBePoweredByGenerator(): boolean`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getObjectName(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isActivated(): boolean`
- `isItemAllowedInContainer(ItemContainer container, InventoryItem item): boolean`
- `isRemoveItemAllowedFromContainer(ItemContainer container, InventoryItem item): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setActivated(boolean activated): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoClothingDryer.new(IsoCell cell)`, `IsoClothingDryer.new(IsoCell cell, IsoGridSquare sq, IsoSprite gid)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoClothingWasher

`zombie.iso.objects.IsoClothingWasher`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (404), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `couldBePoweredByGenerator(): boolean`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getObjectName(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isActivated(): boolean`
- `isItemAllowedInContainer(ItemContainer container, InventoryItem item): boolean`
- `isRemoveItemAllowedFromContainer(ItemContainer container, InventoryItem item): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setActivated(boolean activated): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoClothingWasher.new(IsoCell cell)`, `IsoClothingWasher.new(IsoCell cell, IsoGridSquare sq, IsoSprite gid)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoCombinationWasherDryer

`zombie.iso.objects.IsoCombinationWasherDryer`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (404), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `couldBePoweredByGenerator(): boolean`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getObjectName(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isActivated(): boolean`
- `isItemAllowedInContainer(ItemContainer container, InventoryItem item): boolean`
- `isModeDryer(): boolean`
- `isModeWasher(): boolean`
- `isRemoveItemAllowedFromContainer(ItemContainer container, InventoryItem item): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setActivated(boolean activated): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setModeDryer(): void`
- `setModeWasher(): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoCombinationWasherDryer.new(IsoCell cell)`, `IsoCombinationWasherDryer.new(IsoCell cell, IsoGridSquare sq, IsoSprite gid)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoCompost

`zombie.iso.objects.IsoCompost`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (403), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Damage(float amount): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `Thump(IsoMovingObject thumper, int thumpEventCount): void`
- `WeaponHit(IsoGameCharacter owner, HandWeapon weapon): void`
- `addToWorld(): void`
- `frameStep(): void` from `ECSEntity`
- `getCompost(): float`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getHealth(): int`
- `getMaxHealth(): int`
- `getObjectName(): String`
- `getThumpCondition(): float`
- `getThumpableFor(IsoGameCharacter chr): Thumpable`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isDestroyed(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `remove(): void`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setCompost(float compost): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setHealth(int health): void`
- `setMaxHealth(int maxHealth): void`
- `sync(): void`
- `syncCompost(): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `updateSprite(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoCompost.new(IsoCell cell)`, `IsoCompost.new(IsoCell cell, IsoGridSquare sq, String sprite)`, `IsoCompost.new(IsoCell cell, IsoGridSquare sq, IsoSprite sprite)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoCurtain

`zombie.iso.objects.IsoCurtain`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (406), listed on their own entries.

Methods, called as `obj:name(...)`:

- `IsOpen(): boolean`
- `TestVision(IsoGridSquare from, IsoGridSquare to): IsoObject.VisionResult`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `ToggleDoor(IsoGameCharacter chr): void`
- `ToggleDoorSilent(): void`
- `canInteractWith(IsoGameCharacter chr): boolean`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFacingPosition(Vector2 pos): Vector2`
- `getFrameNo(): int` from `ECSEntity`
- `getGridSquareEdgeFacingDirection(): GridSquareEdgeFacingDirection` from `GridSquareEdgeElement`
- `getNorth(): boolean`
- `getObjectAttachedTo(): IsoObject`
- `getObjectName(): String`
- `getOppositeSquare(): IsoGridSquare`
- `getSoundPrefix(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isAdjacentToSquare(IsoGridSquare square2): boolean`
- `isAdjacentToSquare(IsoGridSquare square1, IsoGridSquare square2): boolean`
- `isCurtainOpen(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onMouseLeftClick(int x, int y): boolean`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeSheet(IsoGameCharacter chr): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source): void`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source, ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoCurtain.name(...)`:

- `isSheet(IsoObject curtain): boolean`

Constructors: `IsoCurtain.new(IsoCell cell)`, `IsoCurtain.new(IsoCell cell, IsoGridSquare gridSquare, String gid, boolean north)`, `IsoCurtain.new(IsoCell cell, IsoGridSquare gridSquare, IsoSprite gid, boolean north, boolean spriteclosed)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoDeadBody

`zombie.iso.objects.IsoDeadBody`, class. Extends [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject) (178), [IsoObject](#isoobject) (386), listed on their own entries.

Methods, called as `obj:name(...)`:

- `AcceptGrapple(IGrappleable grappleAcceptor, String grappleType): void` from `IGrappleableWrapper`
- `Burn(): void`
- `Collision(Vector2 collision, IsoObject object): void`
- `Grappled(IGrappleable grappler, HandWeapon weapon, float grappleEffectiveness, String grappleType): void`
- `GrapplerLetGo(IGrappleable grappler, String grappleResult): void` from `IGrappleableWrapper`
- `IsSpeaking(): boolean`
- `LetGoOfGrappled(String grappleResult): void` from `IGrappleableWrapper`
- `RejectGrapple(IGrappleable grappleRejector): void` from `IGrappleableWrapper`
- `Say(String line): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `becomeCorpseItem(boolean isRemote): InventoryItem`
- `canBeGrabbed(): boolean`
- `canBeGrabbedFrom(float x, float y): boolean`
- `canBeGrappled(): boolean` from `IGrappleableWrapper`
- `changeRotStage(int newStage): void`
- `checkClothing(InventoryItem removedItem): void`
- `frameStep(): void` from `ECSEntity`
- `getAngle(): float`
- `getAnimForwardDirection(Vector2 forwardDirection): Vector2`
- `getAnimalGeneticDisorder(): List<String>`
- `getAnimalGenome(): List<AnimalGene>`
- `getAnimalSize(): float`
- `getAnimalType(): String`
- `getAnimalVisual(): AnimalVisual`
- `getAnimatable(): IAnimatable`
- `getAtlasTexture(): DeadBodyAtlas.BodyTexture`
- `getAttachedItems(): AttachedItems`
- `getBearingFromGrappledTarget(): float` from `IGrappleableWrapper`
- `getBearingToGrappledTarget(): float` from `IGrappleableWrapper`
- `getBreed(): String`
- `getCarcassName(): String`
- `getCharacterOnlineID(): short`
- `getCorpseItem(): String`
- `getCustomName(): String`
- `getDeathTime(): float`
- `getDescription(): String`
- `getDescriptor(): SurvivorDesc`
- `getDiedBoneTransforms(): TwistableBoneTransform[]`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGrabHeadPosition(Vector2f out): Vector2f`
- `getGrabLegsPosition(Vector2f out): Vector2f`
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
- `getHumanVisual(): HumanVisual`
- `getInitialItemAge(InventoryItem item): float`
- `getInvIcon(): String`
- `getInventoryWeight(): float`
- `getItem(): InventoryItem`
- `getItemVisuals(ItemVisuals itemVisuals): void`
- `getKilledBy(): IsoGameCharacter`
- `getObjectID(): ObjectID`
- `getObjectIDAsLong(): long`
- `getObjectName(): String`
- `getOutfitName(): String`
- `getPickUpSound(): String`
- `getPrimaryHandItem(): InventoryItem`
- `getReanimateTime(): float`
- `getRenderSquare(): IsoGridSquare`
- `getSayLine(): String`
- `getSecondaryHandItem(): InventoryItem`
- `getShadowParams(): ShadowParams`
- `getSharedGrappleAnimFraction(): float` from `IGrappleableWrapper`
- `getSharedGrappleAnimNode(): String` from `IGrappleableWrapper`
- `getSharedGrappleAnimTime(): float` from `IGrappleableWrapper`
- `getSharedGrappleType(): String` from `IGrappleableWrapper`
- `getTalkerType(): String`
- `getTargetGrapplePos(Vector3f result): Vector3f` from `IGrappleableWrapper`
- `getTargetGrapplePos(Vector3 result): Vector3` from `IGrappleableWrapper`
- `getTargetGrappleRotation(Vector2 result): Vector2` from `IGrappleableWrapper`
- `getVisual(): BaseVisual`
- `getWeight(): float`
- `getWornItems(): WornItems`
- `getWrappedGrappleable(): IGrappleable`
- `hasAnimalParts(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `invalidateCorpse(): void`
- `isAnimal(): boolean`
- `isAnimalSkeleton(): boolean`
- `isAttachedItem(InventoryItem item): boolean`
- `isBeingGrappled(): boolean` from `IGrappleableWrapper`
- `isBeingGrappledBy(IGrappleable grappledBy): boolean` from `IGrappleableWrapper`
- `isCrawling(): boolean`
- `isDoContinueGrapple(): boolean` from `IGrappleableWrapper`
- `isDoGrapple(): boolean` from `IGrappleableWrapper`
- `isEquipped(InventoryItem item): boolean`
- `isEquippedClothing(InventoryItem item): boolean`
- `isFakeDead(): boolean`
- `isFallOnFront(): boolean`
- `isFemale(): boolean`
- `isGrappling(): boolean` from `IGrappleableWrapper`
- `isGrapplingTarget(IGrappleable grapplingTarget): boolean` from `IGrappleableWrapper`
- `isHandItem(InventoryItem item): boolean`
- `isInRange(IPositional other, float range): boolean` from `IPositional`
- `isKilledByFall(): boolean`
- `isMouseOver(float screenX, float screenY): boolean`
- `isMoving(): boolean` from `IGrappleable`
- `isOnHook(): boolean`
- `isPerformingAnyGrappleAnimation(): boolean` from `IGrappleableWrapper`
- `isPerformingGrappleAnimation(): boolean`
- `isPerformingGrappleGrabAnimation(): boolean` from `IGrappleableWrapper`
- `isPlayer(): boolean`
- `isPrimaryHandItem(InventoryItem item): boolean`
- `isSecondaryHandItem(InventoryItem item): boolean`
- `isSkeleton(): boolean`
- `isZombie(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `readInventory(ByteBuffer b): String`
- `reanimate(): IsoGameCharacter`
- `reanimateLater(): void`
- `reanimateNow(): void`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoChild, boolean bWallLightingPass, Shader shader): void`
- `renderDebugData(): void`
- `renderObjectPicker(float x, float y, float z, ColorInfo lightInfo): void`
- `renderShadow(): void`
- `renderlast(): void`
- `resetGrappleStateToDefault(String grappleResult): void` from `IGrappleableWrapper`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setAnimalData(IsoAnimal died): void`
- `setAttachedItems(AttachedItems other): void`
- `setCharacterOnlineID(short onlineID): void`
- `setContainer(ItemContainer container): void`
- `setCrawling(boolean crawling): void`
- `setDeathTime(float worldAgeHours): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setDoContinueGrapple(boolean doContinueGrapple): void` from `IGrappleableWrapper`
- `setDoGrapple(boolean doGrapple): void` from `IGrappleableWrapper`
- `setDoGrappleLetGo(): void` from `IGrappleable`
- `setDoRender(boolean doRender): void`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setFakeDead(boolean fakeDead): void`
- `setFallOnFront(boolean fallOnFront): void`
- `setForwardDirection(float directionX, float directionY): void`
- `setForwardDirectionAngle(float angle): void`
- `setGrappleDeferredOffset(Vector3f grappleOffset): void` from `IGrappleable`
- `setGrappleDeferredOffset(Vector3 grappleOffset): void` from `IGrappleable`
- `setGrappleDeferredOffset(float x, float y, float z): void` from `IGrappleableWrapper`
- `setGrapplePosOffsetForward(float grappleOffsetForward): void` from `IGrappleableWrapper`
- `setGrappleResult(String grappleResult): void` from `IGrappleableWrapper`
- `setGrappleRotOffsetYaw(float grappleOffsetYaw): void` from `IGrappleableWrapper`
- `setGrappleoffsetBehaviour(GrappleOffsetBehaviour newBehaviour): void` from `IGrappleableWrapper`
- `setInvalidateNextRender(boolean invalidate): void`
- `setKilledBy(IsoGameCharacter killedBy): void`
- `setKilledByFall(boolean killedByFall): void`
- `setOnHook(boolean value): void`
- `setPerformingGrappleGrabAnimation(boolean grappleGrabAnim): void` from `IGrappleableWrapper`
- `setPosition(Vector3 position): void` from `IGrappleable`
- `setPrimaryHandItem(InventoryItem item): void`
- `setReanimateTime(float hours): void`
- `setSecondaryHandItem(InventoryItem item): void`
- `setSharedGrappleAnimFraction(float grappleAnimFraction): void` from `IGrappleableWrapper`
- `setSharedGrappleAnimNode(String sharedGrappleAnimNode): void` from `IGrappleableWrapper`
- `setSharedGrappleAnimTime(float grappleAnimTime): void` from `IGrappleableWrapper`
- `setSharedGrappleType(String sharedGrappleType): void` from `IGrappleableWrapper`
- `setTargetAndCurrentDirection(float directionX, float directionY): void` from `IGrappleableWrapper`
- `setTargetGrapplePos(Vector3f grapplePos): void` from `IGrappleable`
- `setTargetGrapplePos(Vector3 grapplePos): void` from `IGrappleable`
- `setTargetGrapplePos(float x, float y, float z): void` from `IGrappleableWrapper`
- `setTargetGrappleRotation(Vector2 forward): void` from `IGrappleable`
- `setTargetGrappleRotation(float x, float y): void` from `IGrappleableWrapper`
- `setWornItems(WornItems other): void`
- `softReset(): void`
- `toString(): String`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`
- `writeInventory(ByteBufferWriter b): void`

Static functions, called as `IsoDeadBody.name(...)`:

- `Reset(): void`
- `canPickUpBodyFromSquare(IsoGridSquare fromSquare, IsoGridSquare toSquare): boolean`
- `isDead(short characterOnlineID): boolean`
- `removeDeadBodies(UdpConnection removeCorpsesConnection): void`
- `removeDeadBody(ObjectID id): void`
- `renderShadow(float x, float y, float z, Vector3f forward, float w, float fm, float bm, ColorInfo lightInfo, float alpha): void`
- `renderShadow(float x, float y, float z, Vector3f forward, float w, float fm, float bm, ColorInfo lightInfo, float alpha, boolean isAnimal): void`
- `updateBodies(): void`

Constructors: `IsoDeadBody.new(IsoGameCharacter died)`, `IsoDeadBody.new(IsoGameCharacter died, boolean wasCorpseAlready)`, `IsoDeadBody.new(IsoGameCharacter died, boolean wasCorpseAlready, boolean bAddToSquareAndWorld)`, `IsoDeadBody.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_ROT_STAGES: int`, `MAX_ROT_STAGES_ANIMALS: int`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `treeSoundMgr: TreeSoundManager`.

### IsoDoor

`zombie.iso.objects.IsoDoor`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (385), [BarricadeAble](#barricadeable) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `HasCurtains(): IsoDoor`
- `IsOpen(): boolean`
- `IsStrengthenedByPushedItems(): boolean`
- `TestCollide(IsoMovingObject obj, IsoGridSquare from, IsoGridSquare to): boolean`
- `TestPathfindCollide(IsoMovingObject obj, IsoGridSquare from, IsoGridSquare to): boolean`
- `TestVision(IsoGridSquare from, IsoGridSquare to): IsoObject.VisionResult`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `Thump(IsoMovingObject thumper, int thumpEventCount): void`
- `ToggleDoor(IsoGameCharacter chr): void`
- `ToggleDoorActual(IsoGameCharacter chr): void`
- `ToggleDoorSilent(): void`
- `WeaponHit(IsoGameCharacter owner, HandWeapon weapon): void`
- `addRandomBarricades(): void`
- `addSheet(boolean inside, IsoGameCharacter chr): void`
- `addSheet(IsoGameCharacter chr): void`
- `addToWorld(): void`
- `canAddCurtain(): boolean`
- `canClimbOver(IsoGameCharacter chr): boolean`
- `changeSprite(IsoDoor door): void`
- `checkKeyHighlight(int playerIndex): void`
- `checkKeyId(): int`
- `couldBeOpen(IsoGameCharacter chr): boolean`
- `destroy(): void`
- `forEachDoorObject(Consumer<IsoDoor> consumer): void`
- `frameStep(): void` from `ECSEntity`
- `getAddSheetSquare(IsoGameCharacter chr): IsoGridSquare`
- `getBarricadeForCharacter(IsoGameCharacter chr): IsoBarricade`
- `getBarricadeOnOppositeSquare(): IsoBarricade`
- `getBarricadeOnSameSquare(): IsoBarricade`
- `getBarricadeOppositeCharacter(IsoGameCharacter chr): IsoBarricade`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFacingPosition(Vector2 pos): Vector2`
- `getFacingPositionAlt(Vector2 pos): Vector2`
- `getFrameNo(): int` from `ECSEntity`
- `getGridSquareEdgeFacingDirection(): GridSquareEdgeFacingDirection` from `GridSquareEdgeElement`
- `getHealth(): int`
- `getKeyId(): int`
- `getMaxHealth(): int`
- `getNorth(): boolean`
- `getObjectName(): String`
- `getOpenSprite(): IsoSprite`
- `getOppositeSquare(): IsoGridSquare` from `GridSquareEdgeElement`
- `getOtherSideOfDoor(IsoGameCharacter chr): IsoGridSquare`
- `getRenderEffectMaster(): IsoObject`
- `getRenderEffectObjectByIndex(int index): IsoObject`
- `getRenderEffectObjectCount(): int`
- `getSheetSquare(): IsoGridSquare`
- `getSoundPrefix(): String`
- `getSpriteEdge(boolean ignoreOpen): IsoDirections`
- `getSpriteModel(): SpriteModel`
- `getThumpCondition(): float`
- `getThumpSound(): String`
- `getThumpableFor(IsoGameCharacter chr): Thumpable`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `haveKey(): boolean`
- `isAdjacentToSquare(IsoGridSquare square2): boolean`
- `isBarricadeAllowed(): boolean`
- `isBarricaded(): boolean`
- `isBlocked(): boolean`
- `isBlocked(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isCurtainOpen(): boolean`
- `isDestroyed(): boolean`
- `isExterior(): boolean`
- `isExteriorDoor(IsoGameCharacter chr): boolean`
- `isFacingSheet(IsoGameCharacter chr): boolean`
- `isHoppable(): boolean`
- `isLocked(): boolean`
- `isLockedByKey(): boolean`
- `isObstructed(): boolean`
- `isOpen(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `loadState(ByteBuffer bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onMouseLeftClick(int x, int y): boolean`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `removeSheet(IsoGameCharacter chr): void`
- `render(float x, float y, float z, ColorInfo info, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `renderWallTile(IsoDirections dir, float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader, Consumer<TextureDraw> texdModifier): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `saveState(ByteBuffer bb): void`
- `setCurtainOpen(boolean open): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setHaveKey(boolean haveKey): void`
- `setHealth(int health): void`
- `setIsLocked(boolean lock): void`
- `setLocked(boolean bLocked): void`
- `setLockedByKey(boolean lockedByKey): void`
- `setLockedByKey(boolean lockedByKey, boolean doSync): void`
- `setOpen(boolean open): void`
- `setOpenSprite(IsoSprite sprite): void`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source, ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `toggleCurtain(): void`
- `transmitSetCurtainOpen(boolean open): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoDoor.name(...)`:

- `destroyDoubleDoor(IsoObject oneOfFour): boolean`
- `destroyGarageDoor(IsoObject oneOfThree): boolean`
- `forEachDoorObject(IsoObject object, Consumer<IsoObject> consumer): void`
- `getDoubleDoorIndex(IsoObject oneOfFour): int`
- `getDoubleDoorObject(IsoObject oneOfFour, int index): IsoObject`
- `getDoubleDoorPartnerIndex(int ddIndex): int`
- `getGarageDoorFirst(IsoObject oneOfThree): IsoObject`
- `getGarageDoorIndex(IsoObject oneOfThree): int`
- `getGarageDoorNext(IsoObject oneOfThree): IsoObject`
- `getGarageDoorPrev(IsoObject oneOfThree): IsoObject`
- `isDoorObstructed(IsoObject object): boolean`
- `isDoubleDoorObstructed(IsoObject oneOfFour): boolean`
- `toggleDoubleDoor(IsoObject oneOfFour, boolean doSync): void`
- `toggleGarageDoor(IsoObject oneOfThree, boolean doSync): void`

Constructors: `IsoDoor.new(IsoCell cell)`, `IsoDoor.new(IsoCell cell, IsoGridSquare gridSquare, String gid, boolean north)`, `IsoDoor.new(IsoCell cell, IsoGridSquare gridSquare, String gid, boolean north, KahluaTable table)`, `IsoDoor.new(IsoCell cell, IsoGridSquare gridSquare, IsoSprite gid, boolean north)`.

Static fields (a copy of the value taken when the class is exposed): `BREAK_SOUND_RADIUS: int`, `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `tempo: Vector2`.

### IsoFeedingTrough

`zombie.iso.objects.IsoFeedingTrough`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoObject](#isoobject) (406), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addLinkedAnimal(IsoAnimal animal): void`
- `addToWorld(): void`
- `addWater(FluidType type, float amount): void`
- `checkContainer(): void`
- `checkIsoRegion(): void`
- `checkOverlayAfterAnimalEat(): void`
- `checkOverlayFull(boolean transmit): void`
- `checkWaterFromRain(): void`
- `checkZone(): void`
- `createFluidContainer(): void`
- `doDef(KahluaTableImpl def): void`
- `frameStep(): void` from `ECSEntity`
- `getAllFeedingTypes(): ArrayList<String>`
- `getCurrentFeedAmount(): float`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFeedAmount(String type): float`
- `getFrameNo(): int` from `ECSEntity`
- `getLinkedAnimals(): ArrayList<IsoAnimal>`
- `getLinkedX(): int`
- `getLinkedY(): int`
- `getMasterTrough(): IsoFeedingTrough`
- `getMaxFeed(): int`
- `getMaxWater(): float`
- `getObjectName(): String`
- `getWater(): float`
- `handleBurning(): void`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `initWithDef(): void`
- `isEmptyFeed(): boolean`
- `isItemAllowedInContainer(ItemContainer container, InventoryItem item): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onFluidContainerUpdate(): void`
- `onFoodAdded(): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onRemoveFood(): void`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFluidContainer(): void`
- `removeFromWorld(): void`
- `removeWater(float water): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setContainer(ItemContainer container): void`
- `setDef(KahluaTableImpl def): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setLinkedAnimals(ArrayList<IsoAnimal> linkedAnimals): void`
- `setLinkedX(int x): void`
- `setLinkedY(int y): void`
- `setMaxFeed(int maxFeed): void`
- `setMaxWater(float maxWater): void`
- `setNorth(boolean north): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `updateLuaObject(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoFeedingTrough.new(IsoCell cell)`, `IsoFeedingTrough.new(IsoGridSquare square, String spriteName, IsoGridSquare linkedSquare)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoFire

`zombie.iso.objects.IsoFire`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (403), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Spread(): void`
- `TestCollide(IsoMovingObject obj, IsoGridSquare passedObjectSquare): boolean`
- `TestVision(IsoGridSquare from, IsoGridSquare to): IsoObject.VisionResult`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `extinctFire(): void`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getEnergy(): int`
- `getFrameNo(): int` from `ECSEntity`
- `getLife(): int`
- `getLightRadius(): int`
- `getObjectName(): String`
- `getSpreadDelay(): int`
- `hasAnimatedAttachments(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isCampfire(): boolean`
- `isPermanent(): boolean`
- `load(ByteBuffer b, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoChild, boolean bWallLightingPass, Shader shader): void`
- `renderAnimatedAttachments(float x, float y, float z, ColorInfo col): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setLife(int life): void`
- `setLifeStage(int lifeStage): void`
- `setLightRadius(int radius): void`
- `setSpreadDelay(int spreadDelay): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `updateFromTimer(float timer): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoFire.name(...)`:

- `CanAddFire(IsoGridSquare gridSquare, boolean canBurnAnywhere): boolean`
- `CanAddFire(IsoGridSquare gridSquare, boolean canBurnAnywhere, boolean smoke): boolean`
- `CanAddSmoke(IsoGridSquare gridSquare, boolean canBurnAnywhere): boolean`
- `Fire_IsSquareFlamable(IsoGridSquare gridSquare): boolean`

Constructors: `IsoFire.new(IsoCell cell)`, `IsoFire.new(IsoCell cell, IsoGridSquare gridSquare)`, `IsoFire.new(IsoCell cell, IsoGridSquare gridSquare, boolean canBurnAnywhere, int startingEnergy)`, `IsoFire.new(IsoCell cell, IsoGridSquare gridSquare, boolean canBurnAnywhere, int startingEnergy, int setLife)`, `IsoFire.new(IsoCell cell, IsoGridSquare gridSquare, boolean canBurnAnywhere, int startingEnergy, int setLife, boolean isSmoke)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `LIGHT_B: float`, `LIGHT_G: float`, `LIGHT_R: float`, `LIGHT_RADIUS_HIGH: int`, `LIGHT_RADIUS_LOW: int`, `LIGHT_RADIUS_MEDIUM: int`, `LIGHT_RADIUS_MINIMUM: int`, `MAX_WALL_SPLATS: int`, `MaxLife: int`, `MinLife: int`, `NUM_FRAMES_FIRE: int`, `NUM_FRAMES_SMOKE: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoFireManager

`zombie.iso.objects.IsoFireManager`, class.

Static functions, called as `IsoFireManager.name(...)`:

- `Add(IsoFire newFire): void`
- `AddBurningCharacter(IsoGameCharacter burningCharacter): void`
- `Fire_LightCalc(IsoGridSquare fireSquare, IsoGridSquare testSquare, int playerIndex): void`
- `LightTileWithFire(IsoGridSquare testSquare): void`
- `MolotovSmash(IsoCell cell, IsoGridSquare gridSquare): void`
- `Remove(IsoFire dyingFire): void`
- `RemoveAllOn(IsoGridSquare sq): void`
- `RemoveBurningCharacter(IsoGameCharacter burningCharacter): void`
- `Reset(): void`
- `StartFire(IsoCell cell, IsoGridSquare gridSquare, boolean igniteOnAny, int fireStartingEnergy): void`
- `StartFire(IsoCell cell, IsoGridSquare gridSquare, boolean igniteOnAny, int fireStartingEnergy, int life): void`
- `StartSmoke(IsoCell cell, IsoGridSquare gridSquare, boolean igniteOnAny, int fireStartingEnergy, int life): void`
- `Update(): void`
- `addCharacterOnFire(IsoGameCharacter character): void`
- `deleteCharacterOnFire(IsoGameCharacter character): void`
- `explode(IsoCell cell, IsoGridSquare gridSquare, int power): void`
- `stopSound(IsoFire fire): void`
- `updateSound(IsoFire fire): void`

Constructors: `IsoFireManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `CharactersOnFire_Stack: ArrayList<IsoGameCharacter>`, `FIRE_ANIM_DELAY: float`, `FIRE_TINT_MOD: ColorInfo`, `FireStack: ArrayList<IsoFire>`, `blueOscilator: double`, `blueOscilatorRate: double`, `blueOscilatorVal: double`, `fireAlpha: float`, `fireRecalc: int`, `fireRecalcDelay: int`, `greenOscilator: double`, `greenOscilatorRate: double`, `greenOscilatorVal: double`, `lightCalcFromBurningCharacters: boolean`, `maxFireObjects: int`, `oscilatorEffectScalar: double`, `oscilatorSpeedScalar: double`, `redOscilator: double`, `redOscilatorRate: double`, `redOscilatorVal: double`, `smokeAlpha: float`, `smokeAnimDelay: float`, `smokeTintMod: ColorInfo`.

### IsoFireplace

`zombie.iso.objects.IsoFireplace`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (399), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addFuel(int units): void`
- `addToWorld(): void`
- `afterRotated(): void`
- `extinguish(): void`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFacingPosition(Vector2 pos): Vector2`
- `getFrameNo(): int` from `ECSEntity`
- `getFuelAmount(): int`
- `getObjectName(): String`
- `getTemperature(): float`
- `hasAnimatedAttachments(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasFuel(): boolean`
- `isFireSpriteUsingOurDepthTexture(): boolean`
- `isLit(): boolean`
- `isSmouldering(): boolean`
- `isTemperatureChanging(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoChild, boolean bWallLightingPass, Shader shader): void`
- `renderAnimatedAttachments(float x, float y, float z, ColorInfo col): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setFuelAmount(int units): void`
- `setLit(boolean lit): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `turnOn(): void`
- `update(): void`
- `useFuel(int amount): int`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoFireplace.new(IsoCell cell)`, `IsoFireplace.new(IsoCell cell, IsoGridSquare sq, IsoSprite gid)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoGenerator

`zombie.iso.objects.IsoGenerator`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (406), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `failToStart(): void`
- `frameStep(): void` from `ECSEntity`
- `getBasePowerConsumption(): double`
- `getBasePowerConsumptionString(): String`
- `getCondition(): int`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getFuel(): float`
- `getFuelPercentage(): float`
- `getGeneratorItemType(): String`
- `getItemsPowered(): ArrayList<String>`
- `getMaxAffectedLevel(): int`
- `getMaxFuel(): float`
- `getMinAffectedLevel(): int`
- `getObjectName(): String`
- `getSoundPrefix(): String`
- `getTotalPowerUsing(): float`
- `getTotalPowerUsingString(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isActivated(): boolean`
- `isConnected(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `remove(): void`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setActivated(boolean activated): void`
- `setCondition(int condition): void`
- `setConnected(boolean connected): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setFuel(float fuel): void`
- `setInfoFromItem(InventoryItem item): void`
- `setSurroundingElectricity(): void`
- `setTotalPowerUsing(float totalPowerUsing): void`
- `shouldShowOnOverlay(): boolean`
- `syncIsoObjectReceive(ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoGenerator.name(...)`:

- `Reset(): void`
- `chunkLoaded(IsoChunk chunk): void`
- `isPoweringSquare(int generatorX, int generatorY, int generatorZ, int x, int y, int z): boolean`
- `updateGenerator(IsoGridSquare sq): void`
- `updateSurroundingNow(): void`

Constructors: `IsoGenerator.new(InventoryItem item, IsoCell cell, IsoGridSquare sq)`, `IsoGenerator.new(IsoCell cell)`.

Static fields (a copy of the value taken when the class is exposed): `BatteryChargerPowerConsumption: float`, `ClothingAppliancePowerConsumption: float`, `DEFAULT_ENTITY_DISPLAY_NAME: String`, `FridgeFreezerPowerConsumption: float`, `LightSwitchPowerConsumption: float`, `MAX_WALL_SPLATS: int`, `PipedFuelPowerConsumption: float`, `RadioPowerConsumption: float`, `SingleFridgeOrFreezerPowerConsumption: float`, `StackedWasherDryerPowerConsumption: float`, `StovePowerConsumption: float`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `TelevisionPowerConsumption: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoHutch

`zombie.iso.objects.IsoHutch`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (405), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addAnimalInNestBox(IsoAnimal animal): boolean`
- `addAnimalInside(IsoAnimal animal): boolean`
- `addAnimalInside(IsoAnimal animal, boolean bSync): boolean`
- `addAnimalOutside(IsoAnimal animal): void`
- `addEgg(IsoAnimal animal): void`
- `addMetaEgg(IsoAnimal animal): boolean`
- `addToWorld(): void`
- `doMeta(int hours): void`
- `dropAllEggs(): void`
- `frameStep(): void` from `ECSEntity`
- `getAllHutchObjects(): List<IsoHutch>`
- `getAnimal(Integer index): IsoAnimal`
- `getAnimalInNestBox(Integer index): IsoAnimal`
- `getAnimalInside(): HashMap<Integer, IsoAnimal>`
- `getDeadBody(Integer index): IsoDeadBody`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getEnterSpotX(): int`
- `getEnterSpotY(): int`
- `getEntrySq(): IsoGridSquare`
- `getFrameNo(): int` from `ECSEntity`
- `getHutch(): IsoHutch`
- `getHutchDirt(): float`
- `getMaxAnimals(): int`
- `getMaxNestBox(): int`
- `getNestBox(Integer index): IsoHutch.NestBox`
- `getNestBoxDirt(): float`
- `getObjectName(): String`
- `handleBurning(): void`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `haveEggHatchDoor(): boolean`
- `haveRoomForNewEggs(): boolean`
- `isAllDoorClosed(): boolean`
- `isDoorClosed(): boolean`
- `isEggHatchDoorClosed(): boolean`
- `isEggHatchDoorOpen(): boolean`
- `isOpen(): boolean`
- `isOwner(): boolean`
- `isSlave(): boolean`
- `killAnimal(IsoAnimal animal): void`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `reforceUpdate(): void`
- `registerECSComponents(): void` from `ECSEntity`
- `releaseAllAnimals(): void`
- `removeAnimal(IsoAnimal animal): void`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `removeHutch(): void`
- `removeHutchObject(IsoHutch hutch): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setHutchDirt(float hutchDirt): void`
- `setNestBoxDirt(float nestBoxDirt): void`
- `syncIsoObjectReceive(ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `toggleDoor(): void`
- `toggleEggHatchDoor(): void`
- `transmitCompleteItemToClients(): void`
- `tryFindAndRemoveAnimalFromNestBox(IsoAnimal animal): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `tryRemoveAnimalFromWorld(IsoAnimal animal): void`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoHutch.name(...)`:

- `getHutch(int x, int y, int z): IsoHutch`

Constructors: `IsoHutch.new(IsoCell cell)`, `IsoHutch.new(IsoGridSquare sq, boolean north, String mainSprite, KahluaTableImpl def, IsoGridSquare linkedSq)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoHutch.NestBox

`zombie.iso.objects.IsoHutch.NestBox`, class.

Methods, called as `obj:name(...)`:

- `addEgg(Food egg): void`
- `getEgg(int index): Food`
- `getEggsNb(): int`
- `getIndex(): int`
- `removeEgg(int index): Food`

Constructors: `IsoHutch.NestBox.new(IsoHutch, int)`.

Static fields (a copy of the value taken when the class is exposed): `maxEggs: int`.

### IsoJukebox

`zombie.iso.objects.IsoJukebox`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (411), listed on their own entries.

Methods, called as `obj:name(...)`:

- `SetPlaying(boolean shouldPlay): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getObjectName(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onMouseLeftClick(int x, int y): boolean`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoJukebox.new(IsoCell cell)`, `IsoJukebox.new(IsoCell cell, IsoGridSquare sq, String gid)`, `IsoJukebox.new(IsoCell cell, IsoGridSquare sq, IsoSprite spr)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoLightSwitch

`zombie.iso.objects.IsoLightSwitch`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (403), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addBattery(IsoGameCharacter chr, InventoryItem battery): void`
- `addLightBulb(IsoGameCharacter chr, InventoryItem bulb): void`
- `addLightSourceFromSprite(): void`
- `addToWorld(): void`
- `canSwitchLight(): boolean`
- `couldBePoweredByGenerator(): boolean`
- `createLightSource(): void`
- `createLightSource(float r, float g, float b): void`
- `frameStep(): void` from `ECSEntity`
- `getBulbItem(): String`
- `getCanBeModified(): boolean`
- `getCustomSettingsFromItem(InventoryItem item): void`
- `getDelta(): float`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getHasBattery(): boolean`
- `getLights(): ArrayList<IsoLightSource>`
- `getObjectName(): String`
- `getPower(): float`
- `getPrimaryB(): float`
- `getPrimaryG(): float`
- `getPrimaryR(): float`
- `getUseBattery(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasLightBulb(): boolean`
- `isActivated(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onMouseLeftClick(int x, int y): boolean`
- `registerECSComponents(): void` from `ECSEntity`
- `removeBattery(IsoGameCharacter chr): DrainableComboItem`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `removeLightBulb(IsoGameCharacter chr): InventoryItem`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setActivated(boolean val): void`
- `setActive(boolean active): boolean`
- `setActive(boolean active, boolean setActiveBoolOnly): boolean`
- `setActive(boolean active, boolean setActiveBoolOnly, boolean ignoreSwitchCheck): boolean`
- `setBulbItemRaw(String item): void`
- `setCanBeModified(boolean val): void`
- `setCustomSettingsToItem(InventoryItem item): void`
- `setDelta(float delta): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setHasBattery(boolean val): void`
- `setHasBatteryRaw(boolean b): void`
- `setPower(float power): void`
- `setPrimaryB(float b): void`
- `setPrimaryG(float g): void`
- `setPrimaryR(float r): void`
- `setUseBattery(boolean b): void`
- `setUseBatteryDirect(boolean b): void`
- `shouldShowOnOverlay(): boolean`
- `switchLight(boolean activated): void`
- `syncCustomizedSettings(UdpConnection source): void`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source): void`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source, ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `toggle(): boolean`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoLightSwitch.name(...)`:

- `chunkLoaded(IsoChunk chunk): void`

Constructors: `IsoLightSwitch.new(IsoCell cell)`, `IsoLightSwitch.new(IsoCell cell, IsoGridSquare sq, IsoSprite gid, long roomId)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `DEFAULT_LIGHT_RADIUS: int`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoMannequin

`zombie.iso.objects.IsoMannequin`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (402), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `checkClothing(InventoryItem removedItem): void`
- `checkRenderDirection(int playerIndex): void`
- `frameStep(): void` from `ECSEntity`
- `getAnimSetName(): String`
- `getAnimStateName(): String`
- `getAtlasTexture(): DeadBodyAtlas.BodyTexture`
- `getCustomSettingsFromItem(InventoryItem item): void`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getHumanVisual(): HumanVisual`
- `getItemVisuals(ItemVisuals itemVisuals): void`
- `getMannequinScriptName(): String`
- `getObjectName(): String`
- `getPose(): String`
- `getVariables(Map<String, String> vars): void`
- `getWornItems(): WornItems`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isFemale(): boolean`
- `isItemAllowedInContainer(ItemContainer container, InventoryItem item): boolean`
- `isSkeleton(): boolean`
- `isZombie(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `loadState(ByteBuffer input): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `render(float x, float y, float z, ColorInfo col, boolean bDoChild, boolean bWallLightingPass, Shader shader): void`
- `renderFxMask(float x, float y, float z, boolean bDoAttached): void`
- `renderShadow(float x, float y, float z): void`
- `rotate(IsoDirections newDir): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `saveState(ByteBuffer output): void`
- `setCustomSettingsToItem(InventoryItem item): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setMannequinScriptName(String name): void`
- `setRenderDirection(IsoDirections newDir): void`
- `shouldRenderEachFrame(): boolean`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`
- `wearItem(InventoryItem item, IsoGameCharacter chr): void`

Static functions, called as `IsoMannequin.name(...)`:

- `getDirectionFromItem(Moveable item, int playerIndex): IsoDirections`
- `isMannequinSprite(IsoSprite sprite): boolean`
- `renderMoveableItem(Moveable item, int x, int y, int z, IsoDirections dir): void`
- `renderMoveableObject(IsoMannequin mannequin, int x, int y, int z, IsoDirections dir): void`

Constructors: `IsoMannequin.new(IsoCell cell)`, `IsoMannequin.new(IsoCell cell, IsoGridSquare square, IsoSprite sprite)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoMolotovCocktail

`zombie.iso.objects.IsoMolotovCocktail`, class. Extends `IsoPhysicsObject`. Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoMovingObject](/pz/build-42/modding/reference/lua-classes-world-1#isomovingobject) (184), [IsoObject](#isoobject) (396), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `collideCharacter(): void`
- `collideGround(): void`
- `collideWall(): void`
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

Constructors: `IsoMolotovCocktail.new(IsoCell cell)`, `IsoMolotovCocktail.new(IsoCell cell, float x, float y, float z, float xVelocity, float yVelocity, HandWeapon weapon, IsoGameCharacter character)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `MAX_ZOMBIES_EATING: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `treeSoundMgr: TreeSoundManager`.

### IsoRadio

`zombie.iso.objects.IsoRadio`, class. Extends [IsoWaveSignal](/pz/build-42/modding/reference/lua-classes-world-3#isowavesignal). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoObject](#isoobject) (404), [IsoWaveSignal](/pz/build-42/modding/reference/lua-classes-world-3#isowavesignal) (28), [WaveSignalDevice](/pz/build-42/modding/reference/lua-classes-sound-and-radio#wavesignaldevice) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `couldBePoweredByGenerator(): boolean`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getObjectName(): String`
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
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoRadio.new(IsoCell cell)`, `IsoRadio.new(IsoCell cell, IsoGridSquare sq, IsoSprite spr)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoStackedWasherDryer

`zombie.iso.objects.IsoStackedWasherDryer`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (403), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addToWorld(): void`
- `couldBePoweredByGenerator(): boolean`
- `createContainersFromSpriteProperties(): void`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getObjectName(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isDryerActivated(): boolean`
- `isItemAllowedInContainer(ItemContainer container, InventoryItem item): boolean`
- `isRemoveItemAllowedFromContainer(ItemContainer container, InventoryItem item): boolean`
- `isWasherActivated(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setDryerActivated(boolean activated): void`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setWasherActivated(boolean activated): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoStackedWasherDryer.new(IsoCell cell)`, `IsoStackedWasherDryer.new(IsoCell cell, IsoGridSquare sq, IsoSprite gid)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoStove

`zombie.iso.objects.IsoStove`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (403), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Activated(): boolean`
- `PlayToggleSound(): void`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `Toggle(): void`
- `addToWorld(): void`
- `afterRotated(): void`
- `couldBePoweredByGenerator(): boolean`
- `frameStep(): void` from `ECSEntity`
- `getActivatableType(): String`
- `getCurrentTemperature(): float`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getMaxTemperature(): float`
- `getObjectName(): String`
- `getTimer(): int`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isBroken(): boolean`
- `isMicrowave(): boolean`
- `isRunningFor(): int`
- `isTemperatureChanging(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `setActivated(boolean b): void`
- `setBroken(boolean broken): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setMaxTemperature(float maxTemperature): void`
- `setTimer(int seconds): void`
- `shouldShowOnOverlay(): boolean`
- `sync(): void`
- `syncIsoObject(boolean bRemote, byte val, UdpConnection source, ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `syncSpriteGridObjects(boolean toggle, boolean network): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoStove.new(IsoCell cell)`, `IsoStove.new(IsoCell cell, IsoGridSquare sq, IsoSprite gid)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `LitTemperature: float`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `UnlitTemperature: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoTelevision

`zombie.iso.objects.IsoTelevision`, class. Extends [IsoWaveSignal](/pz/build-42/modding/reference/lua-classes-world-3#isowavesignal). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (45), [IsoObject](#isoobject) (404), [IsoWaveSignal](/pz/build-42/modding/reference/lua-classes-world-3#isowavesignal) (26), [WaveSignalDevice](/pz/build-42/modding/reference/lua-classes-sound-and-radio#wavesignaldevice) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `addTvScreenSprite(IsoSprite sprite): void`
- `clearTvScreenSprites(): void`
- `couldBePoweredByGenerator(): boolean`
- `frameStep(): void` from `ECSEntity`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFrameNo(): int` from `ECSEntity`
- `getGeneratorPowerConsumption(): float`
- `getObjectName(): String`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `isFacing(IsoPlayer player): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `registerECSComponents(): void` from `ECSEntity`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeTvScreenSprite(IsoSprite sprite): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Constructors: `IsoTelevision.new(IsoCell cell)`, `IsoTelevision.new(IsoCell cell, IsoGridSquare sq, IsoSprite spr)`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`.

### IsoThumpable

`zombie.iso.objects.IsoThumpable`, class. Extends [IsoObject](#isoobject). Also has the methods of [GameEntity](/pz/build-42/modding/reference/lua-classes-entities#gameentity) (46), [IsoObject](#isoobject) (369), [BarricadeAble](#barricadeable) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Damage(float amount): void`
- `HasCurtains(): IsoCurtain`
- `IsOpen(): boolean`
- `IsStrengthenedByPushedItems(): boolean`
- `TestCollide(IsoMovingObject obj, IsoGridSquare from, IsoGridSquare to): boolean`
- `TestPathfindCollide(IsoMovingObject obj, IsoGridSquare from, IsoGridSquare to): boolean`
- `TestVision(IsoGridSquare from, IsoGridSquare to): IsoObject.VisionResult`
- `Thump(IsoMovingObject isoMovingObject): void` from `Thumpable`
- `Thump(IsoMovingObject thumper, int thumpEventCount): void`
- `ToggleDoor(IsoGameCharacter chr): void`
- `ToggleDoorActual(IsoGameCharacter chr): void`
- `ToggleDoorSilent(): void`
- `WeaponHit(IsoGameCharacter owner, HandWeapon weapon): void`
- `addSheet(IsoGameCharacter chr): void`
- `addSheetRope(IsoPlayer player, String itemType): boolean`
- `addToWorld(): void`
- `afterRotated(): void`
- `animalHit(IsoAnimal animal): void`
- `canAddCurtain(): boolean`
- `canAddSheetRope(): boolean`
- `canBeLockByPadlock(): boolean`
- `canBePlastered(): boolean`
- `canClimbOver(IsoGameCharacter chr): boolean`
- `canClimbThrough(IsoGameCharacter chr): boolean`
- `changeSprite(IsoThumpable thumpable): void`
- `checkKeyHighlight(int playerIndex): void`
- `couldBeOpen(IsoGameCharacter chr): boolean`
- `countAddSheetRope(): int`
- `createLightSource(int radius, int offsetX, int offsetY, int offsetZ, int life, String lightSourceFuel, InventoryItem baseItem, IsoGameCharacter chr): void`
- `destroy(): void`
- `forEachDoorObject(Consumer<IsoThumpable> consumer): void`
- `frameStep(): void` from `ECSEntity`
- `getAddSheetSquare(IsoGameCharacter chr): IsoGridSquare`
- `getBarricadeForCharacter(IsoGameCharacter chr): IsoBarricade`
- `getBarricadeOnOppositeSquare(): IsoBarricade`
- `getBarricadeOnSameSquare(): IsoBarricade`
- `getBarricadeOppositeCharacter(IsoGameCharacter chr): IsoBarricade`
- `getBreakSound(): String`
- `getBuildMaterials(): KahluaTable`
- `getCanBarricade(): boolean`
- `getClosedSpriteTextureName(): String`
- `getCrossSpeed(): float`
- `getECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `getFacingPosition(Vector2 pos): Vector2`
- `getFrameNo(): int` from `ECSEntity`
- `getGridSquareEdgeFacingDirection(): GridSquareEdgeFacingDirection` from `GridSquareEdgeElement`
- `getHealth(): int`
- `getIndoorSquare(): IsoGridSquare`
- `getKeyId(): int`
- `getLifeDelta(): float`
- `getLifeLeft(): float`
- `getLightSource(): IsoLightSource`
- `getLightSourceFuel(): String`
- `getLightSourceLife(): int`
- `getLightSourceRadius(): int`
- `getLightSourceXOffset(): int`
- `getLightSourceYOffset(): int`
- `getLockedByCode(): int`
- `getMaxHealth(): int`
- `getModData(): KahluaTable`
- `getNorth(): boolean`
- `getObjectName(): String`
- `getOpenSprite(): IsoSprite`
- `getOppositeSquare(): IsoGridSquare` from `GridSquareEdgeElement`
- `getOtherSideOfDoor(IsoGameCharacter chr): IsoGridSquare`
- `getRenderEffectMaster(): IsoObject`
- `getSoundPrefix(): String`
- `getSpriteEdge(boolean ignoreOpen): IsoDirections`
- `getSpriteModel(): SpriteModel`
- `getTable(): KahluaTable`
- `getThumpCondition(): float`
- `getThumpDmg(): int`
- `getThumpSound(): String`
- `getThumpableFor(IsoGameCharacter chr): Thumpable`
- `getThumpableFor(IsoGameCharacter chr, HandWeapon weapon): Thumpable`
- `hasBuildMaterials(): boolean`
- `hasECSComponent(Class<? extends ECSComponent> componentTypeClass): boolean` from `ECSEntity`
- `hasECSComponent(ECSComponent component): boolean` from `ECSEntity`
- `hasModData(): boolean`
- `haveFuel(): boolean`
- `haveSheetRope(): boolean`
- `insertNewFuel(InventoryItem item, IsoGameCharacter chr): InventoryItem`
- `isAdjacentToSquare(IsoGridSquare square2): boolean`
- `isBarricadeAllowed(): boolean`
- `isBarricaded(): boolean`
- `isBlockAllTheSquare(): boolean`
- `isBlockedDoor(): boolean`
- `isBlockedDoor(GridSquareEdgeFacingDirection facingDirection): boolean`
- `isCanPassThrough(): boolean`
- `isCorner(): boolean`
- `isDestroyed(): boolean`
- `isDismantable(): boolean`
- `isDoor(): boolean`
- `isDoorFrame(): boolean`
- `isFloor(): boolean`
- `isHoppable(): boolean`
- `isLightSourceOn(): boolean`
- `isLocked(): boolean`
- `isLockedByKey(): boolean`
- `isLockedByPadlock(): boolean`
- `isLockedToCharacter(IsoGameCharacter chr): boolean`
- `isObstructed(): boolean`
- `isPaintable(): boolean`
- `isStairs(): boolean`
- `isTallHoppable(): boolean`
- `isThumpable(): boolean`
- `isWindowN(): boolean`
- `isWindowW(): boolean`
- `load(ByteBuffer input, int worldVersion, boolean isDebugSave): void`
- `loadChange(IsoObjectChange change, ByteBufferReader bb): void`
- `onGameLoadingStateEnter(): void` from `ECSEntity`
- `onInGameStateEnter(): void` from `ECSEntity`
- `onMouseLeftClick(int x, int y): boolean`
- `registerECSComponents(): void` from `ECSEntity`
- `removeCurrentFuel(IsoGameCharacter chr): InventoryItem`
- `removeECSComponent(ComponentType component): void` from `ECSEntity`
- `removeECSComponent(Class<ComponentType> componentClass): void` from `ECSEntity`
- `removeFromWorld(): void`
- `removeSheetRope(IsoPlayer player): boolean`
- `render(float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader): void`
- `renderWallTile(IsoDirections dir, float x, float y, float z, ColorInfo col, boolean bDoAttached, boolean bWallLightingPass, Shader shader, Consumer<TextureDraw> texdModifier): void`
- `save(ByteBuffer output, boolean isDebugSave): void`
- `saveChange(IsoObjectChange change, KahluaTable tbl, ByteBufferWriter bb): void`
- `setBlockAllTheSquare(boolean blockAllTheSquare): void`
- `setBreakSound(String pBreakSound): void`
- `setCanBarricade(boolean pCanBarricade): void`
- `setCanBeLockByPadlock(boolean canBeLockByPadlock): void`
- `setCanBePlastered(boolean canBePlastered): void`
- `setCanPassThrough(boolean pCanPassThrough): void`
- `setClosedSprite(IsoSprite sprite): void`
- `setCorner(boolean pCorner): void`
- `setCrossSpeed(float pCrossSpeed): void`
- `setDir(IsoDirections directions): void` from `ILuaIsoObject`
- `setECSComponent(ComponentType component): void` from `ECSEntity`
- `setHaveFuel(boolean haveFuel): void`
- `setHealth(int health): void`
- `setHoppable(boolean isHoppable): void`
- `setIsContainer(boolean pIsContainer): void`
- `setIsDismantable(boolean dismantable): void`
- `setIsDoor(boolean pIsDoor): void`
- `setIsDoor(Boolean pIsDoor): void`
- `setIsDoorFrame(boolean pIsDoorFrame): void`
- `setIsFloor(boolean pIsFloor): void`
- `setIsHoppable(boolean isHoppable): void`
- `setIsLocked(boolean lock): void`
- `setIsStairs(boolean pStairs): void`
- `setIsThumpable(boolean thumpable): void`
- `setKeyId(int keyId): void`
- `setKeyId(int keyId, boolean doNetwork): void`
- `setLifeDelta(float lifeDelta): void`
- `setLifeLeft(float lifeLeft): void`
- `setLightSource(IsoLightSource lightSource): void`
- `setLightSourceFuel(String lightSourceFuel): void`
- `setLightSourceLife(int lightSourceLife): void`
- `setLightSourceOn(boolean lightSourceOn): void`
- `setLightSourceRadius(int lightSourceRadius): void`
- `setLightSourceXOffset(int lightSourceXOffset): void`
- `setLightSourceYOffset(int lightSourceYOffset): void`
- `setLockedByCode(int lockedByCode): void`
- `setLockedByKey(boolean lockedByKey): void`
- `setLockedByKey(boolean lockedByKey, boolean doSync): void`
- `setLockedByPadlock(boolean lockedByPadlock): void`
- `setMaxHealth(int maxHealth): void`
- `setModData(KahluaTable modData): void`
- `setOpenSprite(IsoSprite sprite): void`
- `setPaintable(boolean paintable): void`
- `setSprite(String sprite): void`
- `setSpriteFromName(String name): void`
- `setTable(KahluaTable table): void`
- `setThumpDmg(Integer pThumpDmg): void`
- `setThumpSound(String thumpSound): void`
- `syncIsoObjectReceive(ByteBufferReader bb): void`
- `syncIsoObjectSend(ByteBufferWriter b): void`
- `syncIsoThumpable(): void`
- `toggleLightSource(boolean toggle): void`
- `tryGetECSComponent(Class<ComponentType> componentTypeClass): ComponentType` from `ECSEntity`
- `update(): void`
- `visitAllComponents(Class<? extends ST> instanceOf, BiConsumer<ST, P1> visitor, P1 param1): void` from `ECSEntity`
- `visitAllComponents(Class<? extends ST> instanceOf, Consumer<ST> visitor): void` from `ECSEntity`

Static functions, called as `IsoThumpable.name(...)`:

- `GetBreakFurnitureSound(String spriteName): String`
- `GetBreakFurnitureSound(IsoSprite sprite): String`

Constructors: `IsoThumpable.new(IsoCell cell)`, `IsoThumpable.new(IsoCell cell, IsoGridSquare gridSquare, String sprite, boolean north)`, `IsoThumpable.new(IsoCell cell, IsoGridSquare gridSquare, String sprite, boolean north, KahluaTable table)`, `IsoThumpable.new(IsoCell cell, IsoGridSquare gridSquare, String closedSprite, String openSprite, boolean north, KahluaTable table)`.

Static fields (a copy of the value taken when the class is exposed): `BREAK_SOUND_RADIUS: int`, `DEFAULT_BREAK_SOUND: SoundKey`, `DEFAULT_ENTITY_DISPLAY_NAME: String`, `MAX_WALL_SPLATS: int`, `THUMP_STRESS_DEFAULT: float`, `THUMP_STRESS_FENCES: float`, `THUMP_STRESS_THUMPABLE: float`, `THUMP_STRESS_TRANSPARENT_FENCES: float`, `bmod: float`, `fireColor: ColorInfo`, `gmod: float`, `lastRendered: IsoObject`, `lastRenderedRendered: IsoObject`, `lowLightingQualityHack: boolean`, `rmod: float`, `tempo: Vector2`.
