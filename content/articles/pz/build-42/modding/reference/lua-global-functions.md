---
slug: lua-global-functions
title: 'Lua Global Functions (Build 42.21)'
game: pz
version: build-42
section: modding
category: reference
difficulty: intermediate
tags:
  - lua-api
  - reference
  - generated
excerpt: 'All 728 global Lua functions of Build 42.21, with their parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-class-directory
  - lua-classes-characters-1
---
# Lua global functions in Build 42.21

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

These 728 functions are in the Lua global table from the moment the game starts: call them by name, no `require`, no object. They all live in one Java class, `LuaManager.GlobalObject`, where each carries `@LuaMethod(global = true)`. 759 Java methods stand behind the 728 names, because some names have more than one form (overloads): the game picks the one whose parameters match what you pass.

Types are the Java types: a `String` is a Lua string, `int`, `float`, `double` and their boxed forms are Lua numbers, `boolean` is a Lua boolean, `KahluaTable` is a Lua table, and every other type is a Java object you call methods on. Parameter names come from the decompiled source; a parameter shown with a type only had no single matching declaration to take a name from.

A note follows a function only where the name does not say enough and we read what the code does.

> **Proof:** Code. zombie.Lua.LuaManager$GlobalObject, the methods with @LuaMethod(global = true), as LuaJavaClassExposer#exposeGlobalFunctions reads them. Build 42.21 (revision 4a0e9546ec).

## A

- `acceptFactionInvite(Faction faction, String host, String invited, boolean isAccepted): void`
- `acceptMedicalCheck(IsoPlayer target, IsoPlayer requester): void`
- `acceptSafehouseInvite(SafeHouse safehouse, String host, String invited, boolean isAccepted): void`
- `acceptTrading(IsoPlayer you, IsoPlayer other, boolean accept): void`
- `activateJoypadOnSteamDeck(): void`
- `activateSteamOverlayToWebPage(String url): void`
- `activateSteamOverlayToWorkshop(): void`
- `activateSteamOverlayToWorkshopItem(String itemID): void`
- `activateSteamOverlayToWorkshopUser(): void`
- `addAccountToAccountList(Server server, Account account): void`
- `addAllBurntVehicles(): void`
- `addAllSmashedVehicles(): void`
- `addAllVehicles(): void`
- `addAnimal(IsoCell cell, int x, int y, int z, String animalType, AnimalBreed breed): IsoAnimal` or `addAnimal(IsoCell cell, int x, int y, int z, String animalType, AnimalBreed breed, boolean skeleton): IsoAnimal`
- `addAreaHighlight(int x1, int y1, int x2, int y2, int z, float r, float g, float b, float a): void`
- `addAreaHighlightForPlayer(int playerIndex, int x1, int y1, int x2, int y2, int z, float r, float g, float b, float a): void`
- `addBloodSplat(IsoGridSquare sq, int nbr): void` or `addBloodSplat(IsoGridSquare sq, int nbr, float xoffset, float yoffset): void`
- `addCarCrash(): void`
- `AddNoiseToken(IsoGridSquare sq, int radius): void`
- `addPhysicsObject(): BaseVehicle`
- `addRole(String name): void`
- `addServerToAccountList(Server server): void`
- `addSound(IsoObject source, int x, int y, int z, int radius, int volume): void`
- `addTicket(String author, String message, int ticketID): void`
- `addUserlog(String user, String type, String text): void`
- `addVariableToSyncList(String key): void`
- `addVehicle(String script, int x, int y, int z): BaseVehicle`
- `addVehicleDebug(String scriptName, IsoDirections dir, Integer skinIndex, IsoGridSquare sq): BaseVehicle`
- `addVirtualZombie(int x, int y): void`
- `addWarningPoint(String user, String reason, int amount): void`
- `AddWorldSound(IsoPlayer player, int radius, int volume): void`
- `addXp(IsoPlayer player, PerkFactory.Perk perk, float amount): void`
- `addXpMultiplier(IsoPlayer player, PerkFactory.Perk perk, float multiplier, int minLevel, int maxLevel): void`
- `addXpNoMultiplier(IsoPlayer player, PerkFactory.Perk perk, float amount): void`
- `addZombiesEating(int x, int y, int z, int totalZombies, boolean skeletonBody): void`
- `addZombiesInBuilding(BuildingDef def, int totalZombies, String outfit, RoomDef room, Integer femaleChance): ArrayList<IsoZombie>`
- `addZombiesInOutfit(int x, int y, int z, int totalZombies, String outfit, Integer femaleChance): ArrayList<IsoZombie>` or `addZombiesInOutfit(int x, int y, int z, int totalZombies, String outfit, Integer femaleChance, boolean isCrawler, boolean isFallOnFront, boolean isFakeDead, boolean isKnockedDown, boolean isInvulnerable, boolean isSitting, float health): ArrayList<IsoZombie>` or `addZombiesInOutfit(int x, int y, int z, int totalZombies, String outfit, Integer femaleChance, boolean isCrawler, boolean isFallOnFront, boolean isFakeDead, boolean isKnockedDown, boolean isInvulnerable, boolean isSitting, float health, boolean isAnimRecording): ArrayList<IsoZombie>` or `addZombiesInOutfit(int x, int y, int z, int totalZombies, String outfit, Integer femaleChance, boolean isCrawler, boolean isFallOnFront, boolean isFakeDead, boolean isKnockedDown, boolean isInvulnerable, boolean isSitting, float health, boolean isAnimRecording, float heightOffset): ArrayList<IsoZombie>` or `addZombiesInOutfit(int x, int y, int z, int totalZombies, String outfit, Integer femaleChance, boolean isCrawler, boolean isFallOnFront, boolean isFakeDead, boolean isKnockedDown, boolean isInvulnerable, boolean isSitting, float health, boolean isAnimRecording, float heightOffset, boolean isRagdolling): ArrayList<IsoZombie>` or `addZombiesInOutfit(int x, int y, int z, int totalZombies, String outfit, Integer femaleChance, boolean isCrawler, boolean isFallOnFront, boolean isFakeDead, boolean isKnockedDown, boolean isInvulnerable, boolean isSitting, float health, boolean isAnimRecording, float heightOffset, boolean isRagdolling, boolean onFire): ArrayList<IsoZombie>`
- `addZombiesInOutfitArea(int x1, int y1, int x2, int y2, int z, int totalZombies, String outfit, Integer femaleChance): ArrayList<IsoZombie>`
- `addZombieSitting(int x, int y, int z): void`
- `assaultPlayer(): void`
- `attachTrailerToPlayerVehicle(int playerIndex): void`

## B

- `backToSinglePlayer(): void`
- `banUnbanUserAction(String action, String username, String additionArgument): void`
- `breakpoint(): void`

## C

- `cacheFileExists(String filename): boolean`
- `callLua(String func, Object param1): void`
- `callLuaBool(String func, Object params): Boolean`
- `callLuaReturn(String func, ArrayList<Object> params): ArrayList<Object>`
- `canConnect(): boolean`
- `canInviteFriends(): boolean`
- `canModifyPlayerScoreboard(): boolean`
- `canSeePlayerStats(): boolean`
- `checkModsNeedUpdate(UdpConnection connection): void`
- `checkPermissions(IsoPlayer player, Capability capability): boolean`
- `checkPlayerCanUseChat(String chatCommand): Boolean`
- `checkPlayerExistsInDatabase(String savedir, String player, String world): boolean`
- `checkSaveFileExists(String f): boolean`
- `checkSaveFolderExists(String f): boolean`
- `checkSavePlayerExists(): boolean`
- `checkServerName(String name): String`
- `checkStringPattern(String pattern): boolean`
- `clearPVPEvents(): void`
- `cloneItemType(String newName, String oldName): Item`
- `configRoomFade(float seconds, float percent): void`
- `configureLighting(float darkStep): void`
- `connectionManagerLog(String event, String message): void`
- `connectToServerStateCallback(String button): void`
- `convertToPZNetTable(KahluaTable table): KahluaTable`
- `copyTable(KahluaTable): KahluaTable` or `copyTable(KahluaTable to, KahluaTable from): KahluaTable`
- `createBuildAction(IsoPlayer player, float x, float y, float z, boolean north, String spriteName, KahluaTable item): byte`
- `createHordeFromTo(float spawnX, float spawnY, float targetX, float targetY, int count): void`
- `createHordeInAreaTo(int spawnX, int spawnY, int spawnW, int spawnH, int targetX, int targetY, int count): void`
- `createItemTransaction(IsoPlayer player, KahluaTableImpl table, ItemContainer src, ItemContainer dst): byte`
- `createNewScriptItem(String base, String name, String display, String type, String icon): Item`
- `createQRCodeTex(String user, String key): Texture`
- `createRandomDeadBody(IsoGridSquare square, int blood): IsoDeadBody`
- `createRegionFile(): KahluaTable`
- `createStory(String storyName): void`
- `createTile(String tile, IsoGridSquare square): void`
- `createWorld(String worldName): void`
- `createZombie(float x, float y, float z, SurvivorDesc desc, int palette, IsoDirections dir): IsoZombie`

## D

- `debugFullyStreamedIn(int x, int y): void`
- `debugLuaTable(Object param): void` or `debugLuaTable(Object param, int depth): void`
- `debugSetRoomType(Double roomType): void`
- `deleteAccountToAccountList(Account account): void`
- `deleteAllGameModeSaves(String gameMode): void`
- `deleteDatabase(String folder): void`
- `deletePlayerFromDatabase(String savedir, String player, String world): void`
- `deletePlayerSave(String fileName): void`
- `deleteRole(String name): void`
- `deleteSandboxPreset(String name): void`
- `deleteSave(String folder): void`
- `deleteServerToAccountList(Server server): void`
- `detectBadWords(String text): boolean`
- `disconnect(): void`
- `displayLUATable(KahluaTable table): void`
- `doChallenge(KahluaTable challenge): void`
- `doKeyPress(boolean doIt): void`
- `doLuaDebuggerAction(String action): void`
- `doTutorial(KahluaTable tutorial): void`
- `drawOverheadMap(UIElement ui, int level, float zoom, float xpos, float ypos): void`

## E

- `emulateAnimEvent(NetTimedAction action, long duration, String event, String parameter): void`
- `emulateAnimEventOnce(NetTimedAction action, long duration, String event, String parameter): void`
- `endFileInput(): void`
- `endFileOutput(): void`
- `endHelicopter(): void`
- `endTextFileInput(): void`

## F

- `fastfloor(float coord): float`
- `fileExists(String filename): boolean`
- `focusOnTab(Short id): void`
- `forceChangeState(GameState state): void`
- `forceDisconnect(): void`
- `forceSnowCheck(): void`

## G

- `generateSecretKey(): String`
- `getAbsoluteSaveFolderName(String f): String`
- `getAccessLevel(): String`
- `getActionDuration(IsoPlayer player, byte id): int`
- `getActivatedMods(): List<String>`
- `getAllAnimalsDefinitions(): ArrayList<AnimalDefinitions>`
- `getAllBeardStyles(): ArrayList<String>`
- `getAllDecalNamesForItem(InventoryItem item): ArrayList<String>`
- `getAllHairStyles(boolean female): ArrayList<String>`
- `getAllItems(): ArrayList<Item>`
- `getAllItemsForBodyLocation(String bodyLocation): KahluaTable`
- `getAllOutfits(boolean female): ArrayList<String>`
- `getAllRecipes(): ArrayList<Recipe>`
- `getAllSavedPlayers(): List<BufferedReader>`
- `getAllVehicles(): ArrayList<String>`
- `getAllVoiceStyles(): ArrayList<VoiceStyle>`
- `getAmbientStreamManager(): BaseAmbientStreamManager`
- `getAndFindNearestTracks(IsoGameCharacter chr): ArrayList<AnimalTracks>`
- `getAnimal(int id): IsoAnimal`
- `getAnimalChunk(int x, int y): AnimalChunk`
- `getAnimationViewerState(): AnimationViewerState`
- `getAttachmentEditorState(): AttachmentEditorState`
- `getAverageFPS(): Double`
- `getBannedIPs(): void`
- `getBannedSteamIDs(): void`
- `getBaseSoundBank(): BaseSoundBank`
- `getBeardStylesInstance(): BeardStyles`
- `getBehaviourDebugPlayer(): IsoGameCharacter`
- `getBreakModGameVersion(): GameVersion`
- `getButtonCount(int joypad): int`
- `getCallframeTop(Coroutine c): int`
- `getCameraOffX(): float`
- `getCameraOffY(): float`
- `getCapabilities(): ArrayList<Capability>`
- `getCell(): IsoCell`
- `getCellMaxX(): int`
- `getCellMaxY(): int`
- `getCellMinX(): int`
- `getCellMinY(): int`
- `getCellSizeInChunks(): Double`
- `getCellSizeInSquares(): Double`
- `getCheatTypes(): List<CheatType>`
- `getChunkSizeInSquares(): Double`
- `getClassField(Object o, int i): Field`
- `getClassFieldVal(Object o, Field field): Object`
- `getClassFunction(Object o, int i): Method`
- `getClassSimpleName(Object object): String`
- `getClientUsername(): String`
- `getClimateManager(): ClimateManager`
- `getClimateMoon(): ClimateMoon`
- `getCombatConfig(): CombatConfig`
- `getConnectedPlayers(): ArrayList<IsoPlayer>`
- `getContainerOverlays(): ContainerOverlays`
- `getControllerAxisValue(int c, int axis): float`
- `getControllerCount(): int`
- `getControllerDeadZone(int c, int axis): float`
- `getControllerGUID(int joypad): String`
- `getControllerName(int joypad): String`
- `getControllerPovX(int c): float`
- `getControllerPovY(int c): float`
- `getCore(): Core`
- `getCoroutineCallframeStack(Coroutine c, int n): LuaCallFrame`
- `getCoroutineObjStack(Coroutine c, int n): Object`
- `getCoroutineObjStackWithBase(Coroutine c, int n): Object`
- `getCoroutineTop(Coroutine c): int`
- `getCPUTime(): long`
- `getCPUWait(): long`
- `getCurrentCoroutine(): Coroutine`
- `getCurrentSaveName(): String`
- `getCurrentUserProfileName(): String`
- `getCurrentUserSteamID(): String`
- `getCustomizationData(String username, String pwd, String ip, String port, String serverPassword, String serverName, boolean doHash): void`
- `getDebug(): boolean`
- `getDebugOptions(): DebugOptions`
- `getDirectionTo(IsoGameCharacter chara, IsoObject objTarget): IsoDirections`
- `getEditVehicleState(): EditVehicleState`
- `getErosion(): ErosionMain`
- `getEvolvedRecipes(): Stack<EvolvedRecipe>`
- `getFakeAttacker(): IsoGameCharacter`
- `getFileInput(String filename): DataInputStream`
- `getFilenameOfCallframe(LuaCallFrame c): String`
- `getFilenameOfClosure(LuaClosure c): String`
- `getFileOutput(String filename): DataOutputStream`
- `getFileReader(String filename, boolean createIfNull): BufferedReader`
- `getFileSeparator(): String`
- `getFileWriter(String filename, boolean createIfNull, boolean append): LuaManager.GlobalObject.LuaFileWriter`
- `getFirstLineOfClosure(LuaClosure c): int`
- `getFMODEventPathList(): ArrayList<String>`
- `getFMODSoundBank(): BaseSoundBank`
- `getFriendsList(): KahluaTable`
- `getFullSaveDirectoryTable(): KahluaTable`
- `getFunctionsForFile(String filename): KahluaTable`
- `getGameClient(): GameClient`
- `getGameFilesInput(String filename): DataInputStream`
- `getGameFilesTextInput(String filename): BufferedReader`
- `getGameLocal(): KahluaTable`
- `getGameRemote(): KahluaTable`
- `getGameSpeed(): int`
- `getGameTime(): GameTime`
- `getGametimeTimestamp(): long`
- `getGameVersion(): String`
- `getGPUTime(): long`
- `getGPUWait(): long`
- `getHairStylesInstance(): HairStyles`
- `getHostByName(String hostname): String`
- `getHourMinute(): String`
- `getHutch(int x, int y, int z): IsoHutch`
- `getIsoEntitiesDebug(): ArrayList<GameEntity>`
- `getIsoMarkers(): IsoMarkers`
- `getISUIStackTrace(int maxDepth): String`
- `getItem(String itemType): Item`
- `getItemActualWeight(String itemType): float`
- `getItemConditionMax(String itemType): int`
- `getItemCount(String itemType): int`
- `getItemDisplayName(String itemType): String`
- `getItemEvolvedRecipeName(String itemType): String`
- `getItemFoodType(String itemType): String`
- `getItemName(String itemType): String`
- `getItemNameFromFullType(String fullType): String`
- `getItemStaticModel(String itemType): String`
- `getItemTex(String itemType): Texture`
- `getItemText(String txt): String`
- `getItemTextureName(String itemType): String`
- `getItemTransactionDuration(byte id): int`
- `getItemWeight(String itemType): float`
- `getJoypadAimingAxisX(int joypad): float`
- `getJoypadAimingAxisY(int joypad): float`
- `getJoypadMovementAxisX(int joypad): float`
- `getJoypadMovementAxisY(int joypad): float`
- `getKeyCode(String keyName): int`
- `getKeyName(int key): String`
- `getLastPlayedDate(String filename): String`
- `getLastStandPlayerFileNames(): List<String>`
- `getLastStandPlayersDirectory(): String`
- `getLatestSave(): KahluaTable`
- `getLineNumber(LuaCallFrame c): int`
- `getLoadedLua(int n): String`
- `getLoadedLuaCount(): int`
- `getLocalVarCount(Coroutine c): int` or `getLocalVarCount(LuaCallFrame callFrame): int`
- `getLocalVarName(Coroutine c, int n): String` or `getLocalVarName(LuaCallFrame callFrame, int n): String`
- `getLocalVarStack(Coroutine c, int n): int`
- `getLocalVarStackIndex(LuaCallFrame callFrame, int n): int`
- `getLoosingXpTick(Object timer): int`
- `getLoosingXpValue(): int`
- `getLotDirectories(): ArrayList<String>`
- `getLuaDebuggerErrorCount(): int`
- `getLuaDebuggerErrors(): ArrayList<String>`
- `getLuaStackTrace(): ArrayList<String>`
- `getMapDirectoryTable(): KahluaTable`
- `getMapFoldersForMod(String modID): ArrayList<String>`
- `getMapInfo(String mapDir): KahluaTable`
- `getMaxActivePlayers(): int`
- `getMaximumWorldLevel(): Double`
- `getMaxPlayers(): Double`
- `getMaxUsernameLength(): int`
- `getMethodParameter(Method o, int i): String`
- `getMethodParameterCount(Method o): int`
- `getMinimumWorldLevel(): Double`
- `getMinUsernameLength(): int`
- `getModDirectoryTable(): KahluaTable`
- `getModFileReader(String modId, String filename, boolean createIfNull): BufferedReader`
- `getModFileWriter(String modId, String filename, boolean createIfNull, boolean append): LuaManager.GlobalObject.LuaFileWriter`
- `getModInfo(String modDir): ChooseGameInfo.Mod`
- `getModInfoByID(String modID): ChooseGameInfo.Mod`
- `getMouseX(): int`
- `getMouseXScaled(): int`
- `getMouseY(): int`
- `getMouseYScaled(): int`
- `getMPStatus(): KahluaTable`
- `getMyDocumentFolder(): String`
- `getNetworkLocal(): KahluaTable`
- `getNetworkRemote(): KahluaTable`
- `getNumActivePlayers(): int`
- `getNumClassFields(Object o): int`
- `getNumClassFunctions(Object o): int`
- `getOnlinePlayers(): ArrayList<IsoPlayer>`
- `getOnlineUsername(): String`
- `getPerformance(): PerformanceSettings`
- `getPerformanceLocal(): KahluaTable`
- `getPerformanceRemote(): KahluaTable`
- `getPickedUpFish(IsoPlayer player): InventoryItem`
- `getPlayer(): IsoPlayer`
- `getPlayerByOnlineID(int id): IsoPlayer`
- `getPlayerFromUsername(String username): IsoPlayer`
- `getPlayerInfo(IsoPlayer player): KahluaTable`
- `getPlayerScreenHeight(int player): int`
- `getPlayerScreenLeft(int player): int`
- `getPlayerScreenTop(int player): int`
- `getPlayerScreenWidth(int player): int`
- `getPublicServersList(): KahluaTable`
- `getPuddlesManager(): IsoPuddles`
- `getRadioAPI(): RadioAPI`
- `getRandomUUID(): String`
- `getRecipeDisplayName(String name): String`
- `getReconnectCountdownTimer(): String`
- `getRemotePlayModeActive(): Boolean`
- `getRenderer(): SpriteRenderer`
- `getRoles(): ArrayList<Role>`
- `getSandboxOptions(): SandboxOptions`
- `getSandboxPresets(): List<String>`
- `getSaveDirectory(String folder): ArrayList<File>`
- `getSaveDirectoryTable(): KahluaTable`
- `getSaveInfo(String saveDir): KahluaTable`
- `getScriptManager(): ScriptManager`
- `getSeamEditorState(): SeamEditorState`
- `getSearchMode(): SearchMode`
- `getServerAddressFromArgs(): String`
- `getServerFPS(): int`
- `getServerIP(): String`
- `getServerList(): KahluaTable`
- `getServerListFile(): String`
- `getServerModData(): void`
- `getServerName(): String`
- `getServerOptions(): ServerOptions`
- `getServerPasswordFromArgs(): String`
- `getServerPort(): String`
- `getServerSavedWorldVersion(String saveFolder): int`
- `getServerSettingsManager(): ServerSettingsManager`
- `getServerSpawnRegions(): KahluaTable`
- `getShortenedFilename(String str): String`
- `getSleepingEvent(): SleepingEvent`
- `getSLSoundManager(): SLSoundManager`
- `getSoundManager(): BaseSoundManager`
- `getSpecificPlayer(int player): IsoPlayer`
- `getSprite(String sprite): IsoSprite`
- `getSpriteManager(String sprite): IsoSpriteManager`
- `getSpriteModelEditorState(): SpriteModelEditorState`
- `getSquare(double x, double y, double z): IsoGridSquare`
- `getSteamAvatarFromSteamID(String steamID): Texture`
- `getSteamAvatarFromUsername(String username): Texture`
- `getSteamIDFromUsername(String username): String`
- `getSteamModeActive(): Boolean`
- `getSteamProfileNameFromSteamID(String steamID): String`
- `getSteamProfileNameFromUsername(String username): String`
- `getSteamScoreboard(): boolean`
- `getSteamWorkshopItemIDs(): ArrayList<String>`
- `getSteamWorkshopItemMods(String itemIDStr): ArrayList<ChooseGameInfo.Mod>`
- `getSteamWorkshopStagedItems(): ArrayList<SteamWorkshopItem>`
- `getStreamModeActive(): Boolean`
- `getStreets(WorldMapStreets worldMapStreets): List<WorldMapStreet>`
- `getText(String txt, Object... args): String`
- `getTextManager(): TextManager`
- `getTextMediaEN(String txt): String`
- `getTextOrNull(String txt, Object... args): String`
- `getTexture(String filename): Texture`
- `getTextureFromSaveDir(String filename, String saveName): Texture`
- `getTickets(String author): void`
- `getTileGeometryState(): TileGeometryState`
- `getTileOverlays(): TileOverlays`
- `getTimeInMillis(): long`
- `getTimestamp(): long`
- `getTimestampMs(): long`
- `getTwoLetters(String input): String`
- `getUsers(): ArrayList<NetworkUser>`
- `getVehicleById(int id): BaseVehicle`
- `getVehicleInfo(BaseVehicle vehicle): KahluaTable`
- `getVehicleZoneAt(int x, int y, int z): VehicleZone`
- `getVideo(String filename, int width, int height): VideoTexture`
- `getVoiceStylesInstance(): VoiceStyles`
- `getWarNearest(): WarManager.War`
- `getWars(): ArrayList<WarManager.War>`
- `getWorld(): IsoWorld`
- `getWorldMarkers(): WorldMarkers`
- `getWorldSoundManager(): WorldSoundManager`
- `getZombieInfo(IsoZombie zombie): KahluaTable`
- `getZomboidRadio(): ZomboidRadio`
- `getZone(int x, int y, int z): Zone`
- `getZones(int x, int y, int z): ArrayList<Zone>`

## H

- `hasBreakpoint(String file, int line): boolean`
- `hasDataBreakpoint(KahluaTable table, Object key): boolean`
- `hasDataReadBreakpoint(KahluaTable table, Object key): boolean`
- `hasItemTag(String itemType, ItemTag itemTag): boolean`
- `haveAccess(String access): boolean`

## I

- `initUISystem(): void`
- `instanceItem(String item): InventoryItem` or `instanceItem(String item, float useDelta): InventoryItem` or `instanceItem(Item item): InventoryItem` or `instanceItem(ItemKey item): InventoryItem`
- `instanceof(Object obj, String name): boolean`
- `invalidateLighting(): void`
- `inviteFriend(String steamID): void`
- `InvMngGetItem(long itemId, String itemType, int playerID, String username): void`
- `InvMngRemoveItem(long itemId, int playerID, String username): void`
- `InvMngUpdateItem(InventoryItem item, int playerID): void`
- `isAccessLevel(String accessLevel): boolean`
- `isActionDone(IsoPlayer player, byte id): boolean`
- `isActionRejected(IsoPlayer player, byte id): boolean`
- `isAdmin(): boolean`
- `isAltKeyDown(): boolean`
- `isAnimationRecorderActive(): boolean`
- `isClient(): boolean` - True only on a multiplayer client (it returns GameClient.client); false in single player.
- `isControllerConnected(int index): boolean`
- `isCoopHost(): boolean`
- `isCtrlKeyDown(): boolean`
- `isCurrentExecutionPoint(String file, int line): boolean`
- `isDebugEnabled(): boolean`
- `isDemo(): boolean`
- `isDesktopOpenSupported(): boolean`
- `isFloatingGamepadTextInputVisible(): boolean`
- `isGamePaused(): boolean`
- `isIngameState(): boolean`
- `isItemFood(String itemType): boolean`
- `isItemFresh(String itemType, float age): boolean`
- `isItemTransactionConsistent(InventoryItem item, ItemContainer src, ItemContainer dst, String extra, IsoPlayer player): boolean`
- `isItemTransactionDone(byte id): boolean`
- `isItemTransactionRejected(byte id): boolean`
- `isJoypadConnected(int index): boolean`
- `isJoypadDown(int joypad): boolean`
- `isJoypadLBPressed(int joypad): boolean`
- `isJoypadLeft(int joypad): boolean`
- `isJoypadLeftStickButtonPressed(int joypad): boolean`
- `isJoypadLTPressed(int joypad): boolean`
- `isJoypadRBPressed(int joypad): boolean`
- `isJoypadRight(int joypad): boolean`
- `isJoypadRightStickButtonPressed(int joypad): boolean`
- `isJoypadRTPressed(int joypad): boolean`
- `isJoypadUp(int joypad): boolean`
- `isKeyDown(int key): boolean` or `isKeyDown(String keyName): boolean` or `isKeyDown(KeybindId keybindID): boolean`
- `isKeyPressed(int key): boolean` or `isKeyPressed(String keyName): boolean` or `isKeyPressed(KeybindId keybindID): boolean`
- `isMetaKeyDown(): boolean`
- `isModActive(ChooseGameInfo.Mod mod): boolean`
- `isMouseButtonDown(int number): boolean`
- `isMouseButtonPressed(int number): boolean`
- `isMultiplayer(): boolean`
- `isoRegionsRenderer(): IsoRegionsRenderer`
- `isoToScreenX(int player, float x, float y, float z): float`
- `isoToScreenY(int player, float x, float y, float z): float`
- `isPlaystationController(int id): boolean`
- `isPublicServerListAllowed(): boolean`
- `isQuitCooldown(): boolean`
- `isServer(): boolean` - True only in the multiplayer server process (it returns GameServer.server); false in single player.
- `isServerSoftReset(): boolean` - True only on the multiplayer server during a soft reset.
- `isShiftKeyDown(): boolean`
- `isShowConnectionInfo(): boolean`
- `isShowServerInfo(): boolean`
- `isSoundPlaying(Object sound): boolean`
- `isSteamOverlayEnabled(): boolean`
- `isSteamRunningOnSteamDeck(): boolean`
- `isSteamServerBrowserEnabled(): boolean`
- `isSystemLinux(): boolean`
- `isSystemMacOS(): boolean`
- `isSystemWindows(): boolean`
- `istype(Object obj, String name): boolean`
- `isValidSteamID(String s): boolean`
- `isValidUserName(String user): boolean`
- `isXBOXController(): boolean`

## J

- `javaListRemoveAt(List<?> javaList, int index): Object`

## L

- `lineSeparator(): String`
- `listFilesInModDirectory(String modID, String directory): ArrayList<String>`
- `listFilesInZomboidLuaDirectory(String directory): ArrayList<String>`
- `loadSkinnedZomboidModel(String name, String loc, String tex): Model`
- `loadStaticZomboidModel(String name, String loc, String tex): Model`
- `loadVehicleModel(String name, String loc, String tex): Model`
- `loadZomboidModel(String name, String mesh, String tex, String shader, boolean bStatic): Model`
- `localVarName(Coroutine c, int n): String`
- `log(DebugType type, String message): void`
- `luaDebug(): void`

## M

- `manipulateSavefile(String folder, String action): void`
- `mergeTable(KahluaTable... tables): KahluaTable`
- `moduleDotType(String module, String type): String`
- `moveRole(byte dir, String roleName): void`

## N

- `networkUserAction(String action, String username, String additionArgument): void`
- `NewMapBinaryFile(String cmd): void`

## O

- `openUrl(String url): void`

## P

- `pauseSoundAndMusic(): void`
- `ping(String username, String pwd, String ip, String port, boolean doHash): void`
- `playServerSound(String sound, IsoGridSquare sq): void`
- `proceedFactionMessage(String message): void`
- `proceedPM(String command): String`
- `processAdminChatMessage(String message): void`
- `processGeneralMessage(String message): void`
- `processSafehouseMessage(String message): void`
- `processSayMessage(String message): void`
- `processShoutMessage(String message): void`
- `profanityFilterCheck(String text): boolean`

## Q

- `querySteamWorkshopItemDetails(ArrayList<String> itemIDs, LuaClosure functionObj, Object arg1): void`
- `queueCharEvent(String eventChar): void`
- `queueKeyEvent(int lwjglKeyCode): void`

## R

- `rainConfig(String cmd, int arg): void`
- `reactivateJoypadAfterResetLua(): boolean`
- `reloadControllerConfigFiles(): void`
- `reloadEngineRPM(): void`
- `reloadEntitiesDebug(): void`
- `reloadEntityDebug(GameEntity entity): void`
- `reloadEntityFromScriptDebug(GameEntity entity): void`
- `reloadEntityScripts(): void`
- `reloadLuaFile(String filename): Object`
- `reloadModelsMatching(String meshName): void`
- `reloadScripts(ScriptType type): void`
- `reloadServerLuaFile(String filename): Object`
- `reloadSoundFiles(): void`
- `reloadVehicles(): void`
- `reloadVehicleTextures(String scriptName): void`
- `reloadXui(): void`
- `removeAction(IsoPlayer player, byte id, boolean isCanceled): void`
- `removeAllVehicles(IsoPlayer player): void`
- `removeAnimal(int id): void`
- `removeItemTransaction(byte id, boolean isCanceled): void`
- `removeTicket(int ticketID): void`
- `removeUserlog(String user, String type, String text): void`
- `removeVehicle(IsoPlayer player, BaseVehicle baseVehicle): void`
- `renameSavefile(String gameMode, String oldName, String newName): boolean`
- `Render3DItem(InventoryItem item, IsoGridSquare sq, float xoffset, float yoffset, float zoffset, float rotation): void`
- `renderIsoCircle(float x, float y, float z, float radius, int segments, int thickness, float r, float g, float b, float a): void`
- `renderIsoLine(float x, float y, float z, float tx, float ty, float tz, int thickness, float r, float g, float b, float a): void`
- `renderIsoRect(float x, float y, float z, float radius, float r, float g, float b, float a, int thickness): void`
- `renderLine(float x, float y, float z, float tx, float ty, float tz, float r, float g, float b, float a): void`
- `replaceItemInContainer(ItemContainer container, InventoryItem oldItem, InventoryItem newItem): void`
- `replaceWith(String toReplace, String regex, String by): String`
- `requestMedicalCheck(IsoPlayer target, IsoPlayer requester): void`
- `requestPVPEvents(): void`
- `requestRoles(): void`
- `requestTrading(IsoPlayer you, IsoPlayer other): void`
- `requestUserlog(String user): void`
- `requestUsers(): void`
- `require(String f): Object`
- `resetRegionFile(): void`
- `resumeSoundAndMusic(): void`
- `revertToKeyboardAndMouse(): void`
- `revertToKeyboardAndMouseFromMainMenu(): void`

## S

- `sanitizeWorldName(String worldName): String`
- `save(boolean doCharacter): void`
- `saveControllerSettings(int c): void`
- `saveGame(): void`
- `saveModsFile(): void`
- `scoreboardUpdate(): void`
- `screenToIsoX(int player, float x, float y, float z): float`
- `screenToIsoY(int player, float x, float y, float z): float`
- `screenZoomIn(): void`
- `screenZoomOut(): void`
- `sendAddAnimalFromHandsInTrailer(IsoAnimal animal, IsoPlayer player, BaseVehicle vehicle): void` or `sendAddAnimalFromHandsInTrailer(IsoDeadBody animal, IsoPlayer player, BaseVehicle vehicle): void`
- `sendAddAnimalInTrailer(IsoAnimal animal, IsoPlayer player, BaseVehicle vehicle): void` or `sendAddAnimalInTrailer(IsoDeadBody animal, IsoPlayer player, BaseVehicle vehicle): void`
- `sendAddItemsToContainer(ItemContainer container, ArrayList<InventoryItem> items): void`
- `sendAddItemToContainer(ItemContainer container, InventoryItem item): void`
- `sendAddObjectToMap(IsoGridSquare square, String sprite): void`
- `sendAnimalGenome(IsoAnimal animal): void`
- `sendAttachedItem(IsoGameCharacter character, String location, InventoryItem item): void`
- `sendButcherAnimal(IsoDeadBody body, IsoPlayer player): void`
- `sendClientCommand(String module, String command, KahluaTable args): void` or `sendClientCommand(IsoPlayer player, String module, String command, KahluaTable args): void` - Called on the server, it fires OnClientCommand there directly.
- `sendClientCommandV(IsoPlayer player, String module, String command, Object... values): void`
- `sendClothing(IsoPlayer player, ItemBodyLocation location, InventoryItem item): void`
- `SendCommandToServer(String command): void`
- `sendCorpse(IsoDeadBody body): void`
- `sendDamage(IsoPlayer player): void`
- `sendDebugStory(IsoGridSquare square, int type, String name): void`
- `sendEquip(IsoPlayer player): void`
- `sendFactionChangeOwner(Faction faction, String username): void`
- `sendFactionChangeTag(Faction faction): void`
- `sendFactionChangeTitle(Faction faction, String title): void`
- `sendFactionCreate(String title, String host): void`
- `sendFactionDisband(Faction faction): void`
- `sendFactionInvite(Faction faction, String host, String invited): void`
- `sendFactionRemoveMember(Faction faction, String username): void`
- `sendFactionStatsChange(IsoPlayer player): void`
- `sendFeedAnimalFromHand(IsoAnimal animal, IsoPlayer player, InventoryItem item): void`
- `sendForagePool(IsoPlayer player, String zoneId, KahluaTable icons): void`
- `sendForageRequestZone(IsoPlayer player, String focus): void`
- `sendForageSpot(IsoPlayer player, String iconID): void`
- `sendGoogleAuth(String username, String code): void`
- `sendHitPlayer(IsoPlayer target, String damage, String range): void`
- `sendHitVehicle(IsoGameCharacter target, String damage, boolean isTargetHitFromBehind, String vehicleSpeed): void`
- `sendHitZombie(IsoPlayer target): void`
- `sendHumanVisual(IsoPlayer player): void`
- `sendHutchGrabAnimal(IsoAnimal animal, IsoPlayer player, IsoObject object, InventoryItem item): void`
- `sendHutchGrabCorpseAction(IsoAnimal animal, IsoPlayer player, IsoObject object, InventoryItem item): void`
- `sendHutchRemoveAnimalAction(IsoAnimal animal, IsoPlayer player, IsoObject object): void`
- `sendIconFound(IsoPlayer player, String type, float distanceTraveled): void`
- `sendItemListNet(IsoPlayer sender, ArrayList<InventoryItem> items, IsoPlayer receiver, String transferID, String custom): boolean`
- `sendItemsInContainer(IsoObject obj, ItemContainer container): void`
- `sendItemStats(InventoryItem item): void`
- `sendPersonalColor(IsoPlayer player): void`
- `sendPickupAnimal(IsoAnimal animal, IsoPlayer player, AnimalInventoryItem item): void`
- `sendPickupAnimalFromTrap(IsoAnimal animal, IsoPlayer player, AnimalInventoryItem item): void`
- `sendPing(): void`
- `sendPlayerEffects(IsoPlayer player): void`
- `sendPlayerExtraInfo(IsoPlayer p): void`
- `sendPlayerNutrition(IsoPlayer player): void`
- `sendPlayerStat(IsoPlayer player, CharacterStat stat): void`
- `sendPlayerStatsChange(IsoPlayer player): void`
- `sendPlaySound(String sound, boolean loop, IsoMovingObject object): void`
- `sendRemoveAndGrabAnimalFromTrailer(IsoAnimal animal, IsoPlayer player, BaseVehicle vehicle, InventoryItem item): void` or `sendRemoveAndGrabAnimalFromTrailer(IsoDeadBody animal, IsoPlayer player, BaseVehicle vehicle, InventoryItem item): void`
- `sendRemoveAnimalFromTrailer(IsoAnimal animal, IsoPlayer player, BaseVehicle vehicle): void`
- `sendRemoveItemFromContainer(ItemContainer container, InventoryItem item): void`
- `sendRemoveItemsFromContainer(ItemContainer container, ArrayList<InventoryItem> items): void`
- `sendReplaceItemInContainer(ItemContainer container, InventoryItem oldItem, InventoryItem newItem): void`
- `sendRequestInventory(int id, String username): void`
- `sendSafehouseChangeMember(SafeHouse safehouse, String player): void`
- `sendSafehouseChangeOwner(SafeHouse safehouse, String username): void`
- `sendSafehouseChangeRespawn(SafeHouse safehouse, String player, boolean doRemove): void`
- `sendSafehouseChangeTitle(SafeHouse safehouse, String title): void`
- `sendSafehouseClaim(IsoGridSquare square, IsoPlayer player, String title): void`
- `sendSafehouseInvite(SafeHouse safehouse, String host, String invited): void`
- `sendSafehouseRelease(SafeHouse safehouse): void`
- `sendSafezoneClaim(String username, int x, int y, int h, int w, String title): void`
- `sendSecretKey(String username, String pwd, String ip, int port, String serverPassword, boolean doHash, int authType, String secretKey): void`
- `sendServerCommand(String module, String command, KahluaTable args): void` or `sendServerCommand(IsoPlayer player, String module, String command, KahluaTable args): void`
- `sendServerCommandV(String module, String command, Object... values): void`
- `sendSwitchSeat(BaseVehicle vehicle, IsoGameCharacter chr, int seatFrom, int seatTo): void`
- `sendSyncPlayerFields(IsoPlayer player, byte syncParams): void`
- `sendVisual(IsoPlayer player): void`
- `sendWarManagerUpdate(int onlineID, String attacker, WarManager.State state): void`
- `serverConnect(String user, String pass, String server, String localIP, String port, String serverPassword, String serverName, boolean useSteamRelay, boolean doHash, int authtype, String secretKey): void`
- `serverConnectCoop(String serverSteamID): void`
- `serverFileExists(String filename): boolean`
- `setActivePlayer(int id): void`
- `setAdmin(): void`
- `setAggroTarget(int id, int x, int y): void`
- `setAnimationRecorderActive(boolean setActive): void`
- `setBehaviorStep(boolean b): void`
- `setControllerDeadZone(int c, int axis, float value): void`
- `setDebugToggleControllerPluggedIn(int index): void`
- `setDefaultRoleFor(String defaultId, String roleName): void`
- `setGameSpeed(int newSpeed): void`
- `setIgnoreInputsForDirection(int id, boolean bActive): void`
- `setJoypadIgnoreAim(int id, boolean bActive): void`
- `setJoypadIgnoreAimUntilCentered(int id, boolean bActive): void`
- `setMinMaxZombiesPerChunk(float min, float max): void`
- `setModelMetaData(String name, String mesh, String tex, String shader, boolean bStatic): void`
- `setMouseXY(int x, int y): void`
- `setPlayerButtonsActive(int id, boolean bActive): void`
- `setPlayerJoypad(int player, int joypad, IsoPlayer playerObj, String username, boolean allowNewPlayer): void`
- `setPlayerMouse(IsoPlayer playerObj): void`
- `setProgressBarValue(IsoPlayer player, int value): void`
- `setPuddles(float initialPuddles): void`
- `setSavefilePlayer1(String gameMode, String saveDir, int sqlID): void`
- `setShowConnectionInfo(boolean enabled): void`
- `setShowPausedMessage(boolean b): void`
- `setShowServerInfo(boolean enabled): void`
- `setSpawnRegion(String spawnRegionName): void`
- `setupRole(Role role, String description, Color color, KahluaTable capabilitiesRaw): void`
- `setZoomLevels(Double... zooms): void`
- `showAnimationViewer(): void`
- `showAttachmentEditor(): void`
- `showChunkDebugger(): void`
- `showDebugInfoInChat(String msg): void`
- `showFolderInDesktop(String folder): void`
- `showGlobalObjectDebugger(): void`
- `showSeamEditor(): void`
- `showSpriteModelEditor(): void`
- `showSteamFloatingGamepadTextInput(boolean multiLine, int x, int y, int width, int height): boolean`
- `showSteamGamepadTextInput(boolean password, boolean multiLine, String description, int maxChars, String existingText): boolean`
- `showVehicleEditor(String scriptName): void`
- `showWorldMapEditor(String value): void`
- `showWrongChatTabMessage(int actualTabID, int rightTabID, String chatCommand): void`
- `sledgeDestroy(IsoObject object): void`
- `sortBrowserList(KahluaTableImpl table, String sortType, boolean sortDown, KahluaTableImpl filterTable): KahluaTable`
- `spawnHorde(float x, float y, float x2, float y2, float z, int count): void`
- `spawnpointsExistsForMod(String modID, String mapFolder): boolean`
- `splitString(String input, int maxSize): KahluaTable`
- `startFishingAction(IsoPlayer player, InventoryItem item, IsoGridSquare sq, KahluaTable bobber): byte`
- `steamGetInternetServerDetails(int index): Server`
- `steamReleaseInternetServersRequest(): void`
- `steamRequestInternetServersCount(): int`
- `steamRequestInternetServersList(): void`
- `steamRequestServerDetails(String host, int port): boolean`
- `steamRequestServerRules(String host, int port): boolean`
- `stepForward(): void`
- `stopFire(Object obj): void`
- `stopPing(): void`
- `stopSendSecretKey(): void`
- `stopSound(long sound): void`
- `syncBodyPart(BodyPart bodyPart, long syncParams): void`
- `syncClothingFields(IsoPlayer player): void`
- `syncHandWeaponFields(IsoPlayer player, HandWeapon item): void`
- `syncItemActivated(IsoPlayer player, InventoryItem item): void`
- `syncItemFields(IsoPlayer player, InventoryItem item): void`
- `syncItemModData(IsoPlayer player, InventoryItem item): void`
- `syncPlayerStats(IsoPlayer player, int syncParams): void`
- `syncVisuals(IsoPlayer player): void`
- `SyncXp(IsoPlayer player): void`

## T

- `tabToX(String a, int tabX): String`
- `takeScreenshot(): void` or `takeScreenshot(String fileName): void`
- `teleportPlayers(IsoPlayer player): void`
- `teleportToHimUserAction(String action, String username, String additionArgument): void`
- `teleportUserAction(String action, String username, String additionArgument): void`
- `testHelicopter(): void`
- `testSound(): void`
- `timerGetKept(String clazzStr, String field): void`
- `timersReset(String clazzStr): void`
- `timersShowMean(String clazzStr): void`
- `timersShowTotal(String clazzStr): void`
- `timSort(KahluaTable table, Object functionObject): void`
- `toggleBreakOnChange(KahluaTable table, Object key): void`
- `toggleBreakOnRead(KahluaTable table, Object key): void`
- `toggleBreakpoint(String file, int line): void`
- `toggleModActive(ChooseGameInfo.Mod mod, boolean active): void`
- `toggleStatisticsTransmission(): void`
- `toggleVehicleRenderToTexture(): void`
- `toInt(double val): int`
- `tradingUISendAddItem(IsoPlayer you, IsoPlayer other, InventoryItem item): void`
- `tradingUISendRemoveItem(IsoPlayer you, IsoPlayer other, InventoryItem item): void`
- `tradingUISendUpdateState(IsoPlayer you, IsoPlayer other, TradingState state): void`
- `transformIntoKahluaTable(HashMap<Object, Object> map): KahluaTable`
- `translatePointXInOverheadMapToWindow(float x, UIElement ui, float zoom, float xpos): float`
- `translatePointXInOverheadMapToWorld(float x, UIElement ui, float zoom, float xpos): float`
- `translatePointYInOverheadMapToWindow(float y, UIElement ui, float zoom, float ypos): float`
- `translatePointYInOverheadMapToWorld(float y, UIElement ui, float zoom, float ypos): float`
- `transmitBigWaterSplash(int x, int y, float dx, float dy): void`
- `triggerEvent(String event): void` or `triggerEvent(String event, Object param): void` or `triggerEvent(String event, Object param, Object param2): void` or `triggerEvent(String event, Object param, Object param2, Object param3): void` or `triggerEvent(String event, Object param, Object param2, Object param3, Object param4): void` - Fires an event by name. A name the game has not registered is created on the spot (LuaEventManager#checkEvent).
- `tryGetTexture(String filename): Texture`
- `typeof(Object o): String`

## U

- `updateAccountToAccountList(Account account): void`
- `updateChatSettings(String fontSize, boolean showTimestamp, boolean showTitle): void`
- `updateFire(): void`
- `updateServerToAccountList(Server server): void`
- `useStaticErosionRand(boolean use): void`
- `useTextureFiltering(boolean bUse): void`

## V

- `viewedTicket(String author, int ticketID): void`

## W

- `wasKeyDown(int key): boolean` or `wasKeyDown(String keyName): boolean` or `wasKeyDown(KeybindId keybindID): boolean`
- `wasMouseActiveMoreRecentlyThanJoypad(): boolean`
- `writeLog(String loggerName, String logs): void`

## Z

- `ZombRand(double max): double` or `ZombRand(double min, double max): double`
- `ZombRandBetween(double min, double max): double`
- `ZombRandFloat(float min, float max): float`
- `zpopClearZombies(int cellX, int cellY): void`
- `zpopNewRenderer(): ZombiePopulationRenderer`
- `zpopSpawnNow(int cellX, int cellY): void`
- `zpopSpawnTimeToZero(int cellX, int cellY): void`
