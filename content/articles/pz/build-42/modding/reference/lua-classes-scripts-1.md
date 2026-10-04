---
slug: lua-classes-scripts-1
title: 'Lua Classes: Script objects, part 1 of 4 (Build 42.21)'
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
excerpt: 'The exposed script objects classes of Build 42.21 (part 1 of 4): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Script objects, part 1 of 4

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The objects the script parser builds from the files in media/scripts: item scripts, recipes, vehicle scripts and the script manager that holds them.

This page holds 64 classes and 1,171 methods, part 1 of 4 of this area (from `AttributesScript` to `ItemKey.Drainable`), from the packages `zombie.scripting.entity`, `zombie.scripting.entity.components.attributes`, `zombie.scripting.entity.components.contextmenuconfig`, `zombie.scripting.entity.components.crafting`, `zombie.scripting.entity.components.fluids`, `zombie.scripting.entity.components.lua`, `zombie.scripting.entity.components.parts`, `zombie.scripting.entity.components.signals`, `zombie.scripting.entity.components.spriteconfig`, `zombie.scripting.entity.components.test`, `zombie.scripting.entity.components.ui`, `zombie.scripting.itemConfig`, `zombie.scripting.logic`, `zombie.scripting.objects`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### AttributesScript

`zombie.scripting.entity.components.attributes.AttributesScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getTemplateContainer(): AttributeContainer`

### ContextMenuConfigScript

`zombie.scripting.entity.components.contextmenuconfig.ContextMenuConfigScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (30), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getEntries(): ArrayList<ContextMenuConfigScript.EntryScript>`

### ContextMenuConfigScript.EntryScript

`zombie.scripting.entity.components.contextmenuconfig.ContextMenuConfigScript.EntryScript`, class.

Methods, called as `obj:name(...)`:

- `getAllowDistance(): boolean`
- `getCustomFunction(): String`
- `getCustomSubmenu(): String`
- `getExtraParam(): String`
- `getIcon(): String`
- `getMenu(): String`
- `getOpenWindow(): String`
- `getTime(): int`
- `getTimedAction(): String`

Constructors: `ContextMenuConfigScript.EntryScript.new()`.

### CraftBenchScript

`zombie.scripting.entity.components.crafting.CraftBenchScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (29), listed on their own entries.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `getEnergyInputChannels(): EnumBitStore<ResourceChannel>`
- `getFluidInputChannels(): EnumBitStore<ResourceChannel>`
- `getRecipeTagQuery(): String`
- `getRecipes(): List<CraftRecipe>`

### CraftLogicScript

`zombie.scripting.entity.components.crafting.CraftLogicScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getActionAnim(): String`
- `getCraftProcessorScripts(): ArrayList<Object>`
- `getInputsGroupName(): String`
- `getOutputsGroupName(): String`
- `getRecipeTagQuery(): String`
- `getStartMode(): StartMode`

### CraftRecipe

`zombie.scripting.entity.components.crafting.CraftRecipe`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (25), listed on their own entries.

Methods, called as `obj:name(...)`:

- `InitLoadPP(String name): void`
- `Load(String name, String body): void`
- `Load(String name, ScriptParser.Block block): void`
- `OnPostWorldDictionaryInit(): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `OnTestItem(InventoryItem inventoryItem, IsoGameCharacter character): boolean`
- `PreReload(): void`
- `addRequiredSkill(PerkFactory.Perk perk, int level): void`
- `addXP(IsoGameCharacter character): void`
- `addXP(IsoGameCharacter character, boolean showXP): void`
- `canAlwaysBeResearched(): boolean`
- `canBeDoneInDark(): boolean`
- `canBeResearched(): boolean`
- `canBenefitFromRecipeAtHand(IsoGameCharacter chr): boolean`
- `canOutputItem(InventoryItem item): boolean`
- `canOutputItem(Item item): boolean`
- `canResearch(IsoGameCharacter chr): boolean`
- `canResearch(IsoGameCharacter chr, boolean blacklistKnown): boolean`
- `canUseItem(String item): boolean`
- `canUseItem(InventoryItem item, IsoGameCharacter character): boolean`
- `cannotBeResearched(): boolean`
- `characterHasRequiredSkills(IsoGameCharacter chr): boolean`
- `checkAutoLearnAllSkills(IsoGameCharacter chr): void`
- `checkAutoLearnAllSkills(IsoGameCharacter chr, boolean textSpam): void`
- `checkAutoLearnAnySkills(IsoGameCharacter chr): void`
- `checkAutoLearnAnySkills(IsoGameCharacter chr, boolean textSpam): void`
- `checkMetaRecipe(IsoGameCharacter chr): void`
- `checkMetaRecipe(IsoGameCharacter chr, String checkedRecipe): void`
- `clearRequiredSkills(): void`
- `containsIO(CraftRecipe.IOScript script): boolean`
- `couldBenefitFromRecipeAtHand(IsoGameCharacter chr): boolean`
- `generateDebugText(): String`
- `generateDebugText(IsoGameCharacter chr): String`
- `getAnimation(): String`
- `getAutoLearnAllSkill(int index): CraftRecipe.RequiredSkill`
- `getAutoLearnAllSkillCount(): int`
- `getAutoLearnAllSkills(): ArrayList<String>`
- `getAutoLearnAnySkill(int index): CraftRecipe.RequiredSkill`
- `getAutoLearnAnySkillCount(): int`
- `getAutoLearnAnySkills(): ArrayList<String>`
- `getCategory(): String`
- `getExistsAsVanilla(): boolean`
- `getFavouriteModDataString(CraftRecipe recipe): String`
- `getHighestPerkRequirement(): PerkFactory.Perk`
- `getHighestRelevantSkill(IsoGameCharacter character): PerkFactory.Perk`
- `getHighestRelevantSkillFromXpAward(IsoGameCharacter character): PerkFactory.Perk`
- `getHighestRelevantSkillLevel(IsoGameCharacter character): int`
- `getHighestRelevantSkillLevel(IsoGameCharacter character, boolean includeAutoLearn): int`
- `getHighestSkillRequirement(): int`
- `getHighestSkillRequirement(boolean includeAutoLearn): int`
- `getIOForIndex(int index): CraftRecipe.IOScript`
- `getIconName(): String`
- `getIconTexture(): Texture`
- `getIndexForIO(CraftRecipe.IOScript script): int`
- `getInputCount(): int`
- `getInputs(): ArrayList<InputScript>`
- `getIoLines(): ArrayList<CraftRecipe.IOScript>`
- `getLuaCallString(CraftRecipe.LuaCall luaCall): String`
- `getMetaRecipe(): String`
- `getModID(): String`
- `getModName(): String`
- `getModTags(): List<String>`
- `getName(): String`
- `getOnAddToMenu(): String`
- `getOutputCount(): int`
- `getOutputs(): ArrayList<OutputScript>`
- `getOverlayMapper(): OverlayMapper`
- `getProp1(): InputScript`
- `getProp2(): InputScript`
- `getRecipeGroup(): CraftRecipeGroup`
- `getRequiredSkill(int index): CraftRecipe.RequiredSkill`
- `getRequiredSkillCount(): int`
- `getRequiredSkills(): ArrayList<String>`
- `getResearchSkillLevel(): int`
- `getResearchSkillLevel(IsoGameCharacter chr): int`
- `getTagBits(): BitSet`
- `getTags(): List<String>`
- `getTime(): int`
- `getTime(IsoGameCharacter character): int`
- `getTimedActionScript(): TimedActionScript`
- `getToolBoth(): InputScript`
- `getToolLeft(): InputScript`
- `getToolRight(): InputScript`
- `getTooltip(): String`
- `getTranslationName(): String`
- `getXPAward(int index): CraftRecipe.XpAward`
- `getXPAwardCount(): int`
- `hasLuaCall(CraftRecipe.LuaCall luaCall): boolean`
- `hasOnTickInputs(): boolean`
- `hasOnTickOutputs(): boolean`
- `hasPlayerLearned(IsoGameCharacter character): boolean`
- `hasRecipeAtHand(IsoGameCharacter chr, ArrayList<ItemContainer> containers): boolean`
- `hasRecipeAtHand(HandcraftLogic logic): boolean`
- `hasTag(CraftRecipeTag craftRecipeTag): boolean`
- `involvesSkill(PerkFactory.Perk skill): boolean`
- `involvesSkill(PerkFactory.Perk skill, boolean includeAutoLearn): boolean`
- `isAllowBatchCraft(): boolean`
- `isAnySurfaceCraft(): boolean`
- `isAutoRotate(): boolean`
- `isBuildableRecipe(): boolean`
- `isCanBeDoneFromFloor(): boolean`
- `isCanWalk(): boolean`
- `isConsumeOnFinish(): boolean`
- `isFavourite(IsoGameCharacter character): boolean`
- `isInHandCraftCraft(): boolean`
- `isRequiresPlayer(): boolean`
- `isResearchAll(): boolean`
- `isShapeless(): boolean`
- `isSmithing(): boolean`
- `isUsesTools(): boolean`
- `isVanilla(): boolean`
- `needToBeLearn(): boolean`
- `normalizeSkillLevel(int level): int`
- `overrideIconTexture(Texture icon): void`
- `overrideTranslationName(String name): void`
- `requiresSpecificWorkstation(): boolean`
- `setAnimation(String animationString): void`
- `setProp1(InputScript prop): void`
- `setProp2(InputScript prop): void`
- `setResearchSkillLevel(int level): void`
- `setTags(List<String> tags): void`
- `validateBenefitFromRecipeAtHand(IsoGameCharacter chr, ArrayList<ItemContainer> containers): boolean`
- `validateBenefitFromRecipeAtHand(HandcraftLogic logic): boolean`

Static functions, called as `CraftRecipe.name(...)`:

- `onLuaFileReloaded(): void`

Constructors: `CraftRecipe.new()`.

### CraftRecipe.RequiredSkill

`zombie.scripting.entity.components.crafting.CraftRecipe.RequiredSkill`, class.

Methods, called as `obj:name(...)`:

- `getLevel(): int`
- `getPerk(): PerkFactory.Perk`

Constructors: `CraftRecipe.RequiredSkill.new(PerkFactory.Perk perk, int level)`.

### CraftRecipe.XpAward

`zombie.scripting.entity.components.crafting.CraftRecipe.XpAward`, class.

Methods, called as `obj:name(...)`:

- `getAmount(): int`
- `getPerk(): PerkFactory.Perk`

Constructors: `CraftRecipe.XpAward.new(PerkFactory.Perk perk, int amount)`.

### CraftRecipeComponentScript

`zombie.scripting.entity.components.crafting.CraftRecipeComponentScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (26), listed on their own entries.

Methods, called as `obj:name(...)`:

- `OnLoadedAfterLua(): void`
- `OnPostWorldDictionaryInit(): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getBuildCategory(): String`
- `getCraftRecipe(): CraftRecipe`
- `getIconTexture(): Texture`

### FurnaceLogicScript

`zombie.scripting.entity.components.crafting.FurnaceLogicScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getFuelInputsGroupName(): String`
- `getFuelOutputsGroupName(): String`
- `getFuelRecipeTagQuery(): String`
- `getFurnaceRecipeTagQuery(): String`
- `getInputsGroupName(): String`
- `getOutputsGroupName(): String`
- `getStartMode(): StartMode`

### InputScript

`zombie.scripting.entity.components.crafting.InputScript`, class. Extends `CraftRecipe.IOScript`.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `allowDestroyedItem(): boolean`
- `allowFavorites(): boolean`
- `allowFrozenItem(): boolean`
- `allowRottenItem(): boolean`
- `canUseItem(String item): boolean`
- `canUseItem(InventoryItem item, IsoGameCharacter character): boolean`
- `containsEnergy(Energy energy): boolean`
- `containsFluid(Fluid fluid): boolean`
- `containsItem(Item item): boolean`
- `doesItemPassClothingTypeStatusTests(InventoryItem item): boolean`
- `doesItemPassDamageStatusTests(InventoryItem item): boolean`
- `doesItemPassFoodAndCookingTests(InventoryItem item): boolean`
- `doesItemPassIsOrNotEmptyAndFullTests(InventoryItem item): boolean`
- `doesItemPassRoutineStatusTests(InventoryItem item, IsoGameCharacter character): boolean`
- `doesItemPassSharpnessStatusTests(InventoryItem item): boolean`
- `dontAllowFrozenItem(): boolean`
- `dontPutBack(): boolean`
- `getAmount(): float`
- `getAmount(int idx): float`
- `getAmount(String item): float`
- `getConsumeFromItemScript(): InputScript`
- `getCreateToItemScript(): OutputScript`
- `getFluidMatchMode(): FluidMatchMode`
- `getInputFluidFilterDisplayName(): String`
- `getInputFluidFilterTooltip(): String`
- `getIntAmount(): int`
- `getIntAmount(int idx): int`
- `getIntAmount(String item): int`
- `getIntMaxAmount(): int`
- `getIntMaxAmount(int idx): int`
- `getIntMaxAmount(String item): int`
- `getItemApplyMode(): ItemApplyMode`
- `getItemTags(): Set<ItemTag>`
- `getItems(): List<String>`
- `getMaxAmount(): float`
- `getMaxAmount(int idx): float`
- `getMaxAmount(String item): float`
- `getOriginalLine(): String`
- `getParentRecipe(): CraftRecipe` from `CraftRecipe.IOScript`
- `getParentScript(): InputScript`
- `getPossibleInputEnergies(): ArrayList<Energy>`
- `getPossibleInputFluids(): ArrayList<Fluid>`
- `getPossibleInputItems(): List<Item>`
- `getRecipeLineIndex(): int` from `CraftRecipe.IOScript`
- `getRelativeScale(String item): float`
- `getReplaceOutputScript(): OutputScript`
- `getResourceType(): ResourceType`
- `getShapedIndex(): int`
- `hasConsumeFromItem(): boolean`
- `hasCreateToItem(): boolean`
- `hasFlag(InputFlag flag): boolean`
- `hasParentScript(): boolean`
- `hasPossibleFrozenFoodInputItems(): boolean`
- `inheritColor(): boolean`
- `inheritCondition(): boolean`
- `inheritHeadCondition(): boolean`
- `inheritSharpness(): boolean`
- `inheritUses(): boolean`
- `isAcceptsAnyEnergy(): boolean`
- `isAcceptsAnyFluid(): boolean`
- `isAcceptsAnyItem(): boolean`
- `isApplyOnTick(): boolean`
- `isAutomationOnly(): boolean`
- `isCanBeDoneFromFloor(): boolean`
- `isCookedFoodItem(): boolean`
- `isDamaged(): boolean`
- `isDestroy(): boolean`
- `isEmpty(): boolean`
- `isEmptyContainer(): boolean`
- `isEnergyMatch(Energy energy): boolean`
- `isEnergyMatch(DrainableComboItem item): boolean`
- `isExclusive(): boolean`
- `isFluidAnything(): boolean`
- `isFluidExact(): boolean`
- `isFluidMatch(FluidContainer container): boolean`
- `isFluidMixture(): boolean`
- `isFluidPrimary(): boolean`
- `isFull(): boolean`
- `isHandcraftOnly(): boolean`
- `isHeadPart(): boolean`
- `isItemCount(): boolean`
- `isKeep(): boolean`
- `isNotDull(): boolean`
- `isNotWorn(): boolean`
- `isProp1(): boolean`
- `isProp2(): boolean`
- `isRecordInput(): boolean`
- `isReplace(): boolean`
- `isSharpenable(): boolean`
- `isTool(): boolean`
- `isToolLeft(): boolean`
- `isToolRight(): boolean`
- `isUncookedFoodItem(): boolean`
- `isUndamaged(): boolean`
- `isUsesPartialItem(Item item): boolean`
- `isVariableAmount(): boolean`
- `isWholeFoodItem(): boolean`
- `isWorn(): boolean`
- `mayDegrade(): boolean`
- `mayDegradeHeavy(): boolean`
- `mayDegradeLight(): boolean`
- `mayDegradeVeryLight(): boolean`
- `notEmpty(): boolean`
- `notFull(): boolean`
- `passesBrokenTest(InventoryItem item): boolean`
- `passesFavoriteTest(InventoryItem item): boolean`
- `passesFrozenTest(InventoryItem item): boolean`
- `passesRottenTest(InventoryItem item): boolean`
- `passesSealedTest(InventoryItem item): boolean`
- `sharpnessCheck(): boolean`

### MashingLogicScript

`zombie.scripting.entity.components.crafting.MashingLogicScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getInputsGroupName(): String`
- `getRecipeTagQuery(): String`
- `getResourceFluidID(): String`

### OutputScript

`zombie.scripting.entity.components.crafting.OutputScript`, class. Extends `CraftRecipe.IOScript`.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `canOutputItem(InventoryItem item): boolean`
- `canOutputItem(Item item): boolean`
- `containsEnergy(Energy energy): boolean`
- `containsFluid(Fluid fluid): boolean`
- `containsItem(Item item): boolean`
- `getAmount(): float`
- `getChance(): float`
- `getCreateToItemScript(): OutputScript`
- `getEnergy(): Energy`
- `getFluid(): Fluid`
- `getFluidMatchMode(): FluidMatchMode`
- `getIntAmount(): int`
- `getIntMaxAmount(): int`
- `getItem(CraftRecipeData recipeData): Item`
- `getItemApplyMode(): ItemApplyMode`
- `getMaxAmount(): float`
- `getOriginalLine(): String`
- `getOutputMapper(): OutputMapper`
- `getParentRecipe(): CraftRecipe` from `CraftRecipe.IOScript`
- `getPossibleResultEnergies(): ArrayList<Energy>`
- `getPossibleResultFluids(): ArrayList<Fluid>`
- `getPossibleResultItems(): ArrayList<Item>`
- `getRecipeLineIndex(): int` from `CraftRecipe.IOScript`
- `getResourceType(): ResourceType`
- `getShapedIndex(): int`
- `hasCreateToItem(): boolean`
- `hasFlag(OutputFlag flag): boolean`
- `isApplyOnTick(): boolean`
- `isAutomationOnly(): boolean`
- `isCreateUses(): boolean`
- `isEnergyMatch(Energy energy): boolean`
- `isEnergyMatch(DrainableComboItem item): boolean`
- `isFluidAnything(): boolean`
- `isFluidExact(): boolean`
- `isFluidMatch(FluidContainer container): boolean`
- `isFluidPrimary(): boolean`
- `isHandcraftOnly(): boolean`
- `isReplaceInput(): boolean`
- `isVariableAmount(): boolean`

### WallCoveringConfigScript

`zombie.scripting.entity.components.crafting.WallCoveringConfigScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (1), [BaseScriptObject](#basescriptobject) (30), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `getSignIndex(): Integer`
- `getSignSpriteName(): String`
- `getType(): WallCoveringType`
- `getTypeString(): String`

### FluidContainerScript

`zombie.scripting.entity.components.fluids.FluidContainerScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getBlacklistCopy(): FluidFilter`
- `getCanEmpty(): boolean`
- `getCapacity(): float`
- `getContainerName(): String`
- `getCustomDrinkSound(): String`
- `getInitialAmount(): float`
- `getInitialFluids(): ArrayList<FluidContainerScript.FluidScript>`
- `getInputLocked(): boolean`
- `getRainCatcher(): float`
- `getTransferRate(): float`
- `getWhitelistCopy(): FluidFilter`
- `isFilledWithCleanWater(): boolean`
- `isHiddenAmount(): boolean`
- `isInitialFluidsIsRandom(): boolean`

### FluidContainerScript.FluidScript

`zombie.scripting.entity.components.fluids.FluidContainerScript.FluidScript`, class.

Methods, called as `obj:name(...)`:

- `getCustomColor(): Color`
- `getFluid(): Fluid`
- `getFluidType(): String`
- `getPercentage(): float`

### LuaComponentScript

`zombie.scripting.entity.components.lua.LuaComponentScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (30), listed on their own entries.

### PartsScript

`zombie.scripting.entity.components.parts.PartsScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (30), listed on their own entries.

### SignalsScript

`zombie.scripting.entity.components.signals.SignalsScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (30), listed on their own entries.

### SpriteConfigScript

`zombie.scripting.entity.components.spriteconfig.SpriteConfigScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (1), [BaseScriptObject](#basescriptobject) (27), listed on their own entries.

Methods, called as `obj:name(...)`:

- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getAllTileNames(): ArrayList<String>`
- `getBonusHealth(): int`
- `getBreakSound(): String`
- `getCanBePadlocked(): boolean`
- `getCornerSprite(): String`
- `getDebugItem(): String`
- `getDontNeedFrame(): boolean`
- `getFace(int id): SpriteConfigScript.FaceScript`
- `getHealth(): int`
- `getIsThumpable(): boolean`
- `getLightRadius(): int`
- `getLightsourceFuel(): String`
- `getLightsourceItem(): String`
- `getLightsourceTagItem(): ArrayList<String>`
- `getNeedToBeAgainstWall(): boolean`
- `getNeedWindowFrame(): boolean`
- `getOnCreate(): String`
- `getOnIsValid(): String`
- `getPreviousStages(): ArrayList<String>`
- `getSkillBaseHealth(): int`
- `getTimedActionOnIsValid(): String`
- `getVersion(IVersionHash hash): void`
- `isMultiTile(): boolean`
- `isPole(): boolean`
- `isProp(): boolean`
- `isSingleFace(): boolean`
- `isValid(): boolean`
- `isoMasterOnly(): boolean`

### SpriteConfigScript.FaceScript

`zombie.scripting.entity.components.spriteconfig.SpriteConfigScript.FaceScript`, class.

Methods, called as `obj:name(...)`:

- `getFaceName(): String`
- `getLayer(int z): SpriteConfigScript.ZLayer`
- `getLightsourceOffsetX(): int`
- `getLightsourceOffsetY(): int`
- `getLightsourceOffsetZ(): int`
- `getTotalHeight(): int`
- `getTotalWidth(): int`
- `getZLayers(): int`

Constructors: `SpriteConfigScript.FaceScript.new()`.

### SpriteConfigScript.TileScript

`zombie.scripting.entity.components.spriteconfig.SpriteConfigScript.TileScript`, class.

Methods, called as `obj:name(...)`:

- `getTileName(): String`
- `isBlocksSquare(): boolean`
- `isEmptySpace(): boolean`

Constructors: `SpriteConfigScript.TileScript.new()`.

### SpriteConfigScript.XRow

`zombie.scripting.entity.components.spriteconfig.SpriteConfigScript.XRow`, class.

Methods, called as `obj:name(...)`:

- `getTile(int x): SpriteConfigScript.TileScript`
- `getWidth(): int`

Constructors: `SpriteConfigScript.XRow.new()`.

### SpriteConfigScript.ZLayer

`zombie.scripting.entity.components.spriteconfig.SpriteConfigScript.ZLayer`, class.

Methods, called as `obj:name(...)`:

- `getHeight(): int`
- `getRow(int y): SpriteConfigScript.XRow`

Constructors: `SpriteConfigScript.ZLayer.new()`.

### TestComponentScript

`zombie.scripting.entity.components.test.TestComponentScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (30), listed on their own entries.

### UiConfigScript

`zombie.scripting.entity.components.ui.UiConfigScript`, class. Extends [ComponentScript](#componentscript). Also has the methods of [ComponentScript](#componentscript) (2), [BaseScriptObject](#basescriptobject) (29), listed on their own entries.

Methods, called as `obj:name(...)`:

- `PreReload(): void`
- `getDisplayNameDebug(): String`
- `getEntityStyle(): String`
- `getXuiSkinName(): String`
- `isUiEnabled(): boolean`

### ComponentScript

`zombie.scripting.entity.ComponentScript`, abstract class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (30), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `isoMasterOnly(): boolean`

### GameEntityScript

`zombie.scripting.entity.GameEntityScript`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (24), listed on their own entries.

Methods, called as `obj:name(...)`:

- `InitLoadPP(String name): void`
- `Load(String name, String body): void`
- `LoadAttribute(String k, String v): boolean`
- `LoadComponentBlock(ScriptParser.Block block): void`
- `OnLoadedAfterLua(): void`
- `OnPostWorldDictionaryInit(): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `containsComponent(ComponentType componentType): boolean`
- `copyFrom(GameEntityScript other): void`
- `getComponentScriptFor(ComponentType componentType): T`
- `getComponentScripts(): ArrayList<ComponentScript>`
- `getDisplayNameDebug(): String`
- `getExistsAsVanilla(): boolean`
- `getFileAbsPath(): String`
- `getFullName(): String`
- `getModID(): String`
- `getModuleName(): String`
- `getName(): String`
- `getRegistry_id(): short`
- `hasComponents(): boolean`
- `setModID(String modid): void`
- `setRegistry_id(short id): void`

Constructors: `GameEntityScript.new()`.

### GameEntityTemplate

`zombie.scripting.entity.GameEntityTemplate`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (29), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String body): void`
- `getScript(): GameEntityScript`

Constructors: `GameEntityTemplate.new(ScriptModule module, String name, String body)`.

### ItemConfig

`zombie.scripting.itemConfig.ItemConfig`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (27), listed on their own entries.

Methods, called as `obj:name(...)`:

- `BuildBuckets(): void`
- `ConfigureEntityOnCreate(GameEntity entity): void`
- `ConfigureEntitySpawned(GameEntity entity, ItemPickInfo pickInfo): void`
- `Load(String name, String totalFile): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getName(): String`
- `isValid(): boolean`

Constructors: `ItemConfig.new()`.

Static fields (a copy of the value taken when the class is exposed): `VARIABLE_PREFIX: String`, `errorBucket: String`, `errorItemConfig: String`, `errorLine: String`, `errorRoot: String`.

### ItemCodeOnCreate

`zombie.scripting.logic.ItemCodeOnCreate`, class. Extends `RecipeCodeHelper`.

Static functions, called as `ItemCodeOnCreate.name(...)`:

- `nameNewspaper(InventoryItem item, Newspaper newspaper): void` from `RecipeCodeHelper`
- `onCreateArmorSchematic(Literature item): void`
- `onCreateBlacksmithToolsSchematic(Literature item): void`
- `onCreateBrochure(InventoryItem item): void`
- `onCreateBusinessCard(InventoryItem item): void`
- `onCreateBusinessCardNolan(InventoryItem item): void`
- `onCreateCatalogue(InventoryItem item): void`
- `onCreateComicBook(InventoryItem item): void`
- `onCreateComicBookRetail(InventoryItem item): void`
- `onCreateCookwareSchematic(Literature item): void`
- `onCreateDispatchNewNewspaper(InventoryItem item): void`
- `onCreateDogTagPet(InventoryItem item): void`
- `onCreateDoodle(InventoryItem item): void`
- `onCreateDoodleKids(InventoryItem item): void`
- `onCreateExplosivesSchematic(Literature item): void`
- `onCreateFabricRoll(InventoryItem item): void`
- `onCreateFlier(InventoryItem item): void`
- `onCreateFlierNolan(InventoryItem item): void`
- `onCreateGasMask(Clothing item): void`
- `onCreateGenericMail(InventoryItem item): void`
- `onCreateHairDyeBottle(InventoryItem item): void`
- `onCreateHeraldNewNewspaper(InventoryItem item): void`
- `onCreateHottieZ(InventoryItem item): void`
- `onCreateIDCard(InventoryItem item): void`
- `onCreateIDCardFemale(InventoryItem item): void`
- `onCreateIDCardMale(InventoryItem item): void`
- `onCreateKnewsNewNewspaper(InventoryItem item): void`
- `onCreateLetterHandwritten(InventoryItem item): void`
- `onCreateLipstick(InventoryItem item): void`
- `onCreateLocket(InventoryItem item): void`
- `onCreateMeleeWeaponSchematic(Literature item): void`
- `onCreateMonogram(Clothing item): void`
- `onCreateOldNewspaper(InventoryItem item): void`
- `onCreatePaperwork(Literature item): void`
- `onCreatePhoto(InventoryItem item): void`
- `onCreatePopBottle(InventoryItem item): void`
- `onCreatePostcard(InventoryItem item): void`
- `onCreateRacyPhoto(InventoryItem item): void`
- `onCreateRandomColor(InventoryItem item): void`
- `onCreateRecentNewspaper(InventoryItem item): void`
- `onCreateRecipeClipping(Literature item): void`
- `onCreateRecipeMagazine(Literature item): void`
- `onCreateRpgManual(InventoryItem item): void`
- `onCreateScarecrow(InventoryItem item): void`
- `onCreateSecretPhoto(InventoryItem item): void`
- `onCreateSewingPattern(Literature item): void`
- `onCreateSkeletonDisplay(InventoryItem item): void`
- `onCreateSnowGlobe(InventoryItem item): void`
- `onCreateSodaCan(InventoryItem item): void`
- `onCreateSprayPaint(InventoryItem item): void`
- `onCreateStockCertificate(Literature item): void`
- `onCreateSubjectBook(InventoryItem item): void`
- `onCreateSubjectMagazine(InventoryItem item): void`
- `onCreateSurvivalSchematic(Literature item): void`
- `onCreateTVMagazine(InventoryItem item): void`
- `onCreateTimesNewNewspaper(InventoryItem item): void`
- `onCreateToyPlane(InventoryItem item): void`
- `onCreateVeryOldPhoto(InventoryItem item): void`
- `scratchTicketWinner(Literature item): void`
- `setPrintMediaInfo(InventoryItem item, String title, String info, String text, String mediaId): void` from `RecipeCodeHelper`

Constructors: `ItemCodeOnCreate.new()`.

Static fields (a copy of the value taken when the class is exposed): `COLLECTIBLE_KEY: String`, `LITERATURE_TITLE: String`, `PRINT_MEDIA: String`, `PRINT_MEDIA_ID: String`, `PRINT_MEDIA_INFO: String`, `PRINT_MEDIA_TEXT: String`, `PRINT_MEDIA_TITLE: String`.

### ItemCodeOnTest

`zombie.scripting.logic.ItemCodeOnTest`, class.

Static functions, called as `ItemCodeOnTest.name(...)`:

- `hasScrewdriver(IsoGameCharacter character, HandWeapon weapon, WeaponPart part): boolean`

Constructors: `ItemCodeOnTest.new()`.

### RecipeCodeOnCooked

`zombie.scripting.logic.RecipeCodeOnCooked`, class. Extends `RecipeCodeHelper`.

Static functions, called as `RecipeCodeOnCooked.name(...)`:

- `cannedFood(Food food): void`
- `nameCakePrep(Food cake): void`
- `nameNewspaper(InventoryItem item, Newspaper newspaper): void` from `RecipeCodeHelper`
- `setPrintMediaInfo(InventoryItem item, String title, String info, String text, String mediaId): void` from `RecipeCodeHelper`

Constructors: `RecipeCodeOnCooked.new()`.

### RecipeCodeOnCreate

`zombie.scripting.logic.RecipeCodeOnCreate`, class. Extends `RecipeCodeHelper`.

Static functions, called as `RecipeCodeOnCreate.name(...)`:

- `addGasFilter(CraftRecipeData data, IsoGameCharacter character): void`
- `addOxygenTank(CraftRecipeData data, IsoGameCharacter character): void`
- `addToPack(CraftRecipeData data, IsoGameCharacter character): void`
- `applyLidCondition(CraftRecipeData data, IsoGameCharacter character): void`
- `assignRagFilterLife(CraftRecipeData data, IsoGameCharacter character): void`
- `carveSpear(CraftRecipeData data, IsoGameCharacter character): void`
- `copyKey(CraftRecipeData data, IsoGameCharacter character): void`
- `createLogStack(CraftRecipeData data, IsoGameCharacter character): void`
- `cutChicken(CraftRecipeData data, IsoGameCharacter character): void`
- `cutFish(CraftRecipeData data, IsoGameCharacter character): void`
- `cutSmallAnimal(CraftRecipeData data, IsoGameCharacter character): void`
- `dismantleElectronics(CraftRecipeData data, IsoGameCharacter character): void`
- `dismantleFishingNet(CraftRecipeData data, IsoGameCharacter character): void`
- `dismantleFlashlight(CraftRecipeData data, IsoGameCharacter character): void`
- `dismantleMiscElectronics(CraftRecipeData data, IsoGameCharacter character): void`
- `dismantleSpear(CraftRecipeData data, IsoGameCharacter character): void`
- `drawRandomCard(CraftRecipeData data, IsoGameCharacter character): void`
- `fireHardenSpear(CraftRecipeData data, IsoGameCharacter character): void`
- `fixFishingRope(CraftRecipeData data, IsoGameCharacter character): void`
- `genericBetterFixing(CraftRecipeData data, IsoGameCharacter character): void`
- `genericEvenBetterFixing(CraftRecipeData data, IsoGameCharacter character): void`
- `genericFixing(CraftRecipeData data, IsoGameCharacter character): void`
- `inheritColorFromMaterial(CraftRecipeData data, IsoGameCharacter character): void`
- `inheritFoodDisplayName(CraftRecipeData data, IsoGameCharacter character): void`
- `inheritFoodNameBowl(CraftRecipeData data, IsoGameCharacter character): void`
- `knappFlake(CraftRecipeData data, IsoGameCharacter character): void`
- `makeCoffee(CraftRecipeData data, IsoGameCharacter character): void`
- `makeJar(CraftRecipeData data, IsoGameCharacter character): void`
- `makeMilkFromPowder(CraftRecipeData data, IsoGameCharacter character): void`
- `makeOmelette(CraftRecipeData data, IsoGameCharacter character): void`
- `makeSushi(CraftRecipeData data, IsoGameCharacter character): void`
- `minorCondition(CraftRecipeData data, IsoGameCharacter character): void`
- `nameNewspaper(InventoryItem item, Newspaper newspaper): void` from `RecipeCodeHelper`
- `name_muffins(CraftRecipeData data, IsoGameCharacter character): void`
- `openAndEat(CraftRecipeData data, IsoGameCharacter character): void`
- `openCan(CraftRecipeData data, IsoGameCharacter character): void`
- `openDentedCan(CraftRecipeData data, IsoGameCharacter character): void`
- `openDentedCanKnife(CraftRecipeData data, IsoGameCharacter character): void`
- `openMacAndCheese(CraftRecipeData data, IsoGameCharacter isoGameCharacter): void`
- `openMysteryCan(CraftRecipeData data, IsoGameCharacter character): void`
- `openMysteryCanKnife(CraftRecipeData data, IsoGameCharacter character): void`
- `openWaterCan(CraftRecipeData data, IsoGameCharacter character): void`
- `openWaterCanKnife(CraftRecipeData data, IsoGameCharacter character): void`
- `pickAramidThread(CraftRecipeData data, IsoGameCharacter character): void`
- `placeInBox(CraftRecipeData data, IsoGameCharacter character): void`
- `placeItemTypeInBox(CraftRecipeData data, IsoGameCharacter character): void`
- `purifyWater(CraftRecipeData data, IsoGameCharacter character): void`
- `radioCraft(CraftRecipeData data, IsoGameCharacter character): void`
- `refillBlowTorch(CraftRecipeData data, IsoGameCharacter character): void`
- `refillHurricaneLantern(CraftRecipeData data, IsoGameCharacter character): void`
- `refillLighter(CraftRecipeData data, IsoGameCharacter character): void`
- `removeGasFilter(CraftRecipeData data, IsoGameCharacter character): void`
- `removeOxygenTank(CraftRecipeData data, IsoGameCharacter character): void`
- `replaceSawBlade(CraftRecipeData data, IsoGameCharacter character): void`
- `ripClothing(CraftRecipeData data, IsoGameCharacter character): void`
- `rollDice(CraftRecipeData data, IsoGameCharacter character): void`
- `scrapJewellery(CraftRecipeData data, IsoGameCharacter character): void`
- `scratchTicket(CraftRecipeData data, IsoGameCharacter character): void`
- `setEcruColor(CraftRecipeData data, IsoGameCharacter character): void`
- `setPrintMediaInfo(InventoryItem item, String title, String info, String text, String mediaId): void` from `RecipeCodeHelper`
- `sewHideJacket(CraftRecipeData data, IsoGameCharacter character): void`
- `sharpenBlade(CraftRecipeData data, IsoGameCharacter character): void`
- `sharpenBladeGrindstone(CraftRecipeData data, IsoGameCharacter character): void`
- `shotgunSawnoff(CraftRecipeData data, IsoGameCharacter character): void`
- `sliceAnimalHead(CraftRecipeData data, IsoGameCharacter character): void`
- `slightlyMoreDurable(CraftRecipeData data, IsoGameCharacter character): void`
- `smeltIronOrSteelIngot(CraftRecipeData data, IsoGameCharacter character): void`
- `smeltIronOrSteelLarge(CraftRecipeData data, IsoGameCharacter character): void`
- `smeltIronOrSteelMedium(CraftRecipeData data, IsoGameCharacter character): void`
- `smeltIronOrSteelMediumPlus(CraftRecipeData data, IsoGameCharacter character): void`
- `smeltIronOrSteelSmall(CraftRecipeData data, IsoGameCharacter character): void`
- `splitLogStack(CraftRecipeData data, IsoGameCharacter character): void`
- `torchBatteryInsert(CraftRecipeData data, IsoGameCharacter character): void`
- `unpackBox(CraftRecipeData data, IsoGameCharacter character): void`
- `unpackItemTypeFromBox(CraftRecipeData data, IsoGameCharacter character): void`
- `untieHeadband(CraftRecipeData data, IsoGameCharacter character): void`

Constructors: `RecipeCodeOnCreate.new()`.

### RecipeCodeOnEat

`zombie.scripting.logic.RecipeCodeOnEat`, class. Extends `RecipeCodeHelper`.

Static functions, called as `RecipeCodeOnEat.name(...)`:

- `consumeCorrectionFluid(DrainableComboItem item, IsoGameCharacter character): void`
- `consumeNicotine(DrainableComboItem item, IsoGameCharacter character): void`
- `consumeNicotine(Food item, IsoGameCharacter character, float percent): void`
- `consumeRatPoison(DrainableComboItem item, IsoGameCharacter character): void`
- `consumeWildFoodGeneric(Food item, IsoGameCharacter character, float percent): void`
- `nameNewspaper(InventoryItem item, Newspaper newspaper): void` from `RecipeCodeHelper`
- `setPrintMediaInfo(InventoryItem item, String title, String info, String text, String mediaId): void` from `RecipeCodeHelper`

Constructors: `RecipeCodeOnEat.new()`.

### RecipeCodeOnTest

`zombie.scripting.logic.RecipeCodeOnTest`, class. Extends `RecipeCodeHelper`.

Static functions, called as `RecipeCodeOnTest.name(...)`:

- `breakGlass(InventoryItem item, IsoGameCharacter character): boolean`
- `canAddToPack(InventoryItem item, IsoGameCharacter character): boolean`
- `copyKey(InventoryItem item, IsoGameCharacter character): boolean`
- `cutFillet(InventoryItem item, IsoGameCharacter character): boolean`
- `cutFish(InventoryItem item, IsoGameCharacter character): boolean`
- `genericPacking(InventoryItem item, IsoGameCharacter character): boolean`
- `haveFilter(InventoryItem item, IsoGameCharacter character): boolean`
- `haveOxygenTank(InventoryItem item, IsoGameCharacter character): boolean`
- `hotFluidContainer(InventoryItem item, IsoGameCharacter character): boolean`
- `nameNewspaper(InventoryItem item, Newspaper newspaper): void` from `RecipeCodeHelper`
- `noFilter(InventoryItem item, IsoGameCharacter character): boolean`
- `noOxygenTank(InventoryItem item, IsoGameCharacter character): boolean`
- `openFire(InventoryItem item, IsoGameCharacter character): boolean`
- `purifyWater(InventoryItem item, IsoGameCharacter character): boolean`
- `scratchTicket(InventoryItem item, IsoGameCharacter character): boolean`
- `setPrintMediaInfo(InventoryItem item, String title, String info, String text, String mediaId): void` from `RecipeCodeHelper`

Constructors: `RecipeCodeOnTest.new()`.

### ActionSoundTime

`zombie.scripting.objects.ActionSoundTime`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String`

Static functions, called as `ActionSoundTime.name(...)`:

- `fromValue(String value): ActionSoundTime`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ActionSoundTime`
- `values(): ActionSoundTime[]`

Enum values (read as `ActionSoundTime.VALUE`): `ACTION_START`, `ANIMATION_EVENT`, `ANIMATION_START`.

### AmmoType

`zombie.scripting.objects.AmmoType`, class.

Methods, called as `obj:name(...)`:

- `getItemKey(): String`
- `getTranslationName(): String`
- `toString(): String`

Static functions, called as `AmmoType.name(...)`:

- `get(ResourceLocation id): AmmoType`
- `getByItemKey(String key): Optional<AmmoType>`
- `register(String id, String itemKey): AmmoType`

Static fields (a copy of the value taken when the class is exposed): `BULLETS_3030: AmmoType`, `BULLETS_308: AmmoType`, `BULLETS_357: AmmoType`, `BULLETS_38: AmmoType`, `BULLETS_44: AmmoType`, `BULLETS_45: AmmoType`, `BULLETS_556: AmmoType`, `BULLETS_9MM: AmmoType`, `CAP_GUN_CAP: AmmoType`, `SHOTGUN_SHELLS: AmmoType`.

### AnimationsMesh

`zombie.scripting.objects.AnimationsMesh`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String totalFile): void`
- `reset(): void`

Constructors: `AnimationsMesh.new()`.

### BaseScriptObject

`zombie.scripting.objects.BaseScriptObject`, abstract class.

Methods, called as `obj:name(...)`:

- `InitLoadPP(String name): void`
- `Load(String name, String body): void`
- `LoadCommonBlock(String body): void`
- `LoadCommonBlock(ScriptParser.Block block): void`
- `OnLoadedAfterLua(): void`
- `OnPostWorldDictionaryInit(): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `addLoadedScriptBody(String modId, String body): void`
- `calculateScriptVersion(): void`
- `debugString(): String`
- `getAllScriptLines(ArrayList<String> list): ArrayList<String>`
- `getBodyScriptLines(int bodyIndex, ArrayList<String> list): ArrayList<String>`
- `getLoadedScriptBodies(): ArrayList<String>`
- `getLoadedScriptBodyCount(): int`
- `getModule(): ScriptModule`
- `getObsolete(): boolean`
- `getParent(): BaseScriptObject`
- `getScriptLines(): ArrayList<String>`
- `getScriptObjectFullType(): String`
- `getScriptObjectName(): String`
- `getScriptObjectType(): ScriptType`
- `getScriptVersion(): long`
- `getVersion(IVersionHash hash): void`
- `isDebugOnly(): boolean`
- `isEnabled(): boolean`
- `reset(): void`
- `resetLoadedScriptBodies(): void`
- `setModule(ScriptModule module): void`
- `setParent(BaseScriptObject parent): void`

### Brochure

`zombie.scripting.objects.Brochure`, class.

Methods, called as `obj:name(...)`:

- `getTranslationInfoKey(): String`
- `getTranslationKey(): String`
- `getTranslationTextKey(): String`
- `toString(): String`

Static functions, called as `Brochure.name(...)`:

- `get(ResourceLocation id): Brochure`
- `register(String id): Brochure`

Static fields (a copy of the value taken when the class is exposed): `AIRPORT: Brochure`, `ART_GALLERY_OF_LOUISVILLE: Brochure`, `CARDINAL_PLAZA: Brochure`, `COALFIELD: Brochure`, `COLD_WAR_BUNKER: Brochure`, `CROSS_ROADS_MALL: Brochure`, `DARKWALLOW_GUEST_HOUSE: Brochure`, `DELILAH: Brochure`, `DINER_IN_THE_WOODS: Brochure`, `FOSSOIL_FIELD: Brochure`, `GRAND_OHIO_MALL: Brochure`, `HAVISHAM_SUITES: Brochure`, `IRVINGTON_SPEEDWAY: Brochure`, `LSU: Brochure`, `PONDVIEW: Brochure`, `QUILL_MANOR: Brochure`, `SANATORIUM: Brochure`, `SCARLET_OAK_DISTILLERY: Brochure`, `SLEEP_EAZZZE_INN: Brochure`, `SUNSTAR_MOTEL: Brochure`, `WELLINGTON_HEIGHTS_GOLF_CLUB: Brochure`, `WEST_MAPLE_COUNTRY_CLUB: Brochure`.

### CharacterProfession

`zombie.scripting.objects.CharacterProfession`, class.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `toString(): String`

Static functions, called as `CharacterProfession.name(...)`:

- `get(ResourceLocation id): CharacterProfession`
- `register(String id): CharacterProfession`

Static fields (a copy of the value taken when the class is exposed): `BURGER_FLIPPER: CharacterProfession`, `BURGLAR: CharacterProfession`, `CARPENTER: CharacterProfession`, `CHEF: CharacterProfession`, `CONSTRUCTION_WORKER: CharacterProfession`, `DOCTOR: CharacterProfession`, `ELECTRICIAN: CharacterProfession`, `ENGINEER: CharacterProfession`, `FARMER: CharacterProfession`, `FIRE_OFFICER: CharacterProfession`, `FISHERMAN: CharacterProfession`, `FITNESS_INSTRUCTOR: CharacterProfession`, `LUMBERJACK: CharacterProfession`, `MECHANICS: CharacterProfession`, `METALWORKER: CharacterProfession`, `NURSE: CharacterProfession`, `PARK_RANGER: CharacterProfession`, `POLICE_OFFICER: CharacterProfession`, `RANCHER: CharacterProfession`, `REPAIRMAN: CharacterProfession`, `SECURITY_GUARD: CharacterProfession`, `SMITHER: CharacterProfession`, `TAILOR: CharacterProfession`, `UNEMPLOYED: CharacterProfession`, `VETERAN: CharacterProfession`.

### CharacterTrait

`zombie.scripting.objects.CharacterTrait`, class.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `toString(): String`

Static functions, called as `CharacterTrait.name(...)`:

- `get(ResourceLocation id): CharacterTrait`
- `register(String id): CharacterTrait`

Static fields (a copy of the value taken when the class is exposed): `ADRENALINE_JUNKIE: CharacterTrait`, `AGORAPHOBIC: CharacterTrait`, `ALL_THUMBS: CharacterTrait`, `ARTISAN: CharacterTrait`, `ASTHMATIC: CharacterTrait`, `ATHLETIC: CharacterTrait`, `AXEMAN: CharacterTrait`, `BASEBALL_PLAYER: CharacterTrait`, `BLACKSMITH: CharacterTrait`, `BLACKSMITH2: CharacterTrait`, `BRAVE: CharacterTrait`, `BRAWLER: CharacterTrait`, `BURGLAR: CharacterTrait`, `CLAUSTROPHOBIC: CharacterTrait`, `CLUMSY: CharacterTrait`, `CONSPICUOUS: CharacterTrait`, `COOK: CharacterTrait`, `COOK2: CharacterTrait`, `COWARDLY: CharacterTrait`, `CRAFTY: CharacterTrait`, `DEAF: CharacterTrait`, `DESENSITIZED: CharacterTrait`, `DEXTROUS: CharacterTrait`, `DISORGANIZED: CharacterTrait`, `EAGLE_EYED: CharacterTrait`, `EMACIATED: CharacterTrait`, `FAST_HEALER: CharacterTrait`, `FAST_LEARNER: CharacterTrait`, `FAST_READER: CharacterTrait`, `FEEBLE: CharacterTrait`, `FIRST_AID: CharacterTrait`, `FISHING: CharacterTrait`, `FIT: CharacterTrait`, `GARDENER: CharacterTrait`, `GRACEFUL: CharacterTrait`, `GYMNAST: CharacterTrait`, `HANDY: CharacterTrait`, `HARD_OF_HEARING: CharacterTrait`, `HEARTY_APPETITE: CharacterTrait`, `HEMOPHOBIC: CharacterTrait`, `HERBALIST: CharacterTrait`, `HERBALIST_PROF: CharacterTrait`, `HIGH_THIRST: CharacterTrait`, `HIKER: CharacterTrait`, `HUNTER: CharacterTrait`, `ILLITERATE: CharacterTrait`, `INCONSPICUOUS: CharacterTrait`, `INSOMNIAC: CharacterTrait`, `INVENTIVE: CharacterTrait`, `INVENTIVE_PROF: CharacterTrait`, `IRON_GUT: CharacterTrait`, `JOGGER: CharacterTrait`, `KEEN_HEARING: CharacterTrait`, `LIGHT_EATER: CharacterTrait`, `LOW_THIRST: CharacterTrait`, `MARKSMAN: CharacterTrait`, `MASON: CharacterTrait`, `MECHANICS: CharacterTrait`, `MECHANICS2: CharacterTrait`, `NEEDS_LESS_SLEEP: CharacterTrait`, `NEEDS_MORE_SLEEP: CharacterTrait`, `NIGHT_OWL: CharacterTrait`, `NIGHT_VISION: CharacterTrait`, `NUTRITIONIST: CharacterTrait`, `NUTRITIONIST2: CharacterTrait`, `OBESE: CharacterTrait`, `ORGANIZED: CharacterTrait`, `OUTDOORSMAN: CharacterTrait`, `OUT_OF_SHAPE: CharacterTrait`, `OVERWEIGHT: CharacterTrait`, `PACIFIST: CharacterTrait`, `PRONE_TO_ILLNESS: CharacterTrait`, `RESILIENT: CharacterTrait`, `SCOUT: CharacterTrait`, `SHORT_SIGHTED: CharacterTrait`, `SLOW_HEALER: CharacterTrait`, `SLOW_LEARNER: CharacterTrait`, `SLOW_READER: CharacterTrait`, `SMOKER: CharacterTrait`, `SPEED_DEMON: CharacterTrait`, `STOUT: CharacterTrait`, `STRONG: CharacterTrait`, `SUNDAY_DRIVER: CharacterTrait`, `TAILOR: CharacterTrait`, `TARGET_SHOOTER: CharacterTrait`, `THICK_SKINNED: CharacterTrait`, `THIN_SKINNED: CharacterTrait`, `TINKERER: CharacterTrait`, `UNDERWEIGHT: CharacterTrait`, `UNFIT: CharacterTrait`, `VERY_UNDERWEIGHT: CharacterTrait`, `WEAK: CharacterTrait`, `WEAK_STOMACH: CharacterTrait`, `WEIGHT_GAIN: CharacterTrait`, `WEIGHT_LOSS: CharacterTrait`, `WHITTLER: CharacterTrait`, `WILDERNESS_KNOWLEDGE: CharacterTrait`.

### CraftRecipeGroup

`zombie.scripting.objects.CraftRecipeGroup`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getIconTexture(): Texture`
- `getTranslationName(): String`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String`

Static functions, called as `CraftRecipeGroup.name(...)`:

- `fromString(String id): CraftRecipeGroup`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CraftRecipeGroup`
- `values(): CraftRecipeGroup[]`

Enum values (read as `CraftRecipeGroup.VALUE`): `OPEN_BOX`.

### DigType

`zombie.scripting.objects.DigType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String`

Static functions, called as `DigType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): DigType`
- `values(): DigType[]`

Enum values (read as `DigType.VALUE`): `HOE`, `PICK_AXE`, `SHOVEL`, `TROWEL`.

### EnergyDefinitionScript

`zombie.scripting.objects.EnergyDefinitionScript`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (26), listed on their own entries.

Methods, called as `obj:name(...)`:

- `InitLoadPP(String name): void`
- `Load(String name, String body): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getColor(): Color`
- `getDisplayName(): String`
- `getEnergyType(): EnergyType`
- `getEnergyTypeString(): String`
- `getExistsAsVanilla(): boolean`
- `getHorizontalBarTexture(): Texture`
- `getIconTexture(): Texture`
- `getModID(): String`
- `getVerticalBarTexture(): Texture`
- `isVanilla(): boolean`

Static functions, called as `EnergyDefinitionScript.name(...)`:

- `getDefaultHorizontalBarTexture(): Texture`
- `getDefaultIconTexture(): Texture`
- `getDefaultVerticalBarTexture(): Texture`

### EvolvedRecipe

`zombie.scripting.objects.EvolvedRecipe`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (29), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String token): void`
- `addItem(InventoryItem baseItem, InventoryItem usedItem, IsoGameCharacter chr): InventoryItem`
- `getAddIngredientSound(): String`
- `getBaseItem(): String`
- `getFullResultItem(): String`
- `getItemRecipe(InventoryItem usedItem): ItemRecipe`
- `getItemsCanBeUse(IsoGameCharacter chr, InventoryItem baseItem, ArrayList<ItemContainer> containers): ArrayList<InventoryItem>`
- `getItemsList(): Map<String, ItemRecipe>`
- `getMaxItems(): int`
- `getMinimumWater(): float`
- `getName(): String`
- `getOriginalname(): String`
- `getPossibleItems(): ArrayList<ItemRecipe>`
- `getResultItem(): String`
- `getUntranslatedName(): String`
- `hasMinimumWater(InventoryItem item): boolean`
- `isAllowFrozenItem(): boolean`
- `isCookable(): boolean`
- `isHidden(): boolean`
- `isItemUsableInRecipe(IsoGameCharacter chr, InventoryItem baseItem, Integer id): boolean`
- `isResultItem(InventoryItem item): boolean`
- `isSpiceAdded(InventoryItem baseItem, InventoryItem spiceItem): boolean`
- `needToBeCooked(InventoryItem itemTest): boolean`
- `setAllowFrozenItem(boolean allow): void`
- `setIsHidden(boolean hide): void`

Constructors: `EvolvedRecipe.new(String name)`.

### Fixing

`zombie.scripting.objects.Fixing`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (29), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String body): void`
- `addRequiredItem(String require): void`
- `countUses(IsoGameCharacter chr, Fixing.Fixer fixer, InventoryItem brokenObject): int`
- `getConditionModifier(): float`
- `getFixers(): LinkedList<Fixing.Fixer>`
- `getGlobalItem(): Fixing.Fixer`
- `getName(): String`
- `getRequiredFixerItems(IsoGameCharacter chr, Fixing.Fixer fixer, InventoryItem brokenItem, ArrayList<InventoryItem> items): ArrayList<InventoryItem>`
- `getRequiredItem(): ArrayList<String>`
- `getRequiredItems(IsoGameCharacter chr, Fixing.Fixer fixer, InventoryItem brokenItem): ArrayList<InventoryItem>`
- `haveGlobalItem(IsoGameCharacter chr): InventoryItem`
- `haveThisFixer(IsoGameCharacter chr, Fixing.Fixer fixer, InventoryItem brokenObject): InventoryItem`
- `setConditionModifier(float conditionModifier): void`
- `setGlobalItem(Fixing.Fixer globalItem): void`
- `setName(String name): void`
- `usedInFixer(InventoryItem itemType, IsoGameCharacter chr): Fixing.Fixer`

Constructors: `Fixing.new()`.

### Fixing.Fixer

`zombie.scripting.objects.Fixing.Fixer`, class.

Methods, called as `obj:name(...)`:

- `getFixerName(): String`
- `getFixerSkills(): LinkedList<Fixing.FixerSkill>`
- `getNumberOfUse(): int`

Constructors: `Fixing.Fixer.new(String name, LinkedList<Fixing.FixerSkill> skills, int numberOfUse)`.

### Fixing.FixerSkill

`zombie.scripting.objects.Fixing.FixerSkill`, class.

Methods, called as `obj:name(...)`:

- `getSkillLevel(): int`
- `getSkillName(): String`

Constructors: `Fixing.FixerSkill.new(String skillName, int skillLvl)`.

### Flier

`zombie.scripting.objects.Flier`, class.

Methods, called as `obj:name(...)`:

- `getTranslationInfoKey(): String`
- `getTranslationKey(): String`
- `getTranslationTextKey(): String`
- `toString(): String`

Static functions, called as `Flier.name(...)`:

- `get(ResourceLocation id): Flier`
- `register(String id): Flier`

Static fields (a copy of the value taken when the class is exposed): `A1_HAY: Flier`, `ALS_AUTO_SHOP: Flier`, `AMERICAN_TIRE: Flier`, `AMZ_STEEL: Flier`, `BEEF_CHUNK: Flier`, `BENS_CABIN: Flier`, `BRANDENBURG_FD: Flier`, `BROOKS_LIBRARY: Flier`, `BROTT_AUCTION: Flier`, `CABIN_FOR_RENT_DIXIE: Flier`, `CAR_FIXATION: Flier`, `CAT_ON_A_HOT_TIN_GRILL: Flier`, `CIRCUITAL_HEALING: Flier`, `DRAG_RACING_TRACK: Flier`, `DU_CASE_APARTMENTS: Flier`, `EKRON_COLLEGE: Flier`, `ELVEE_ARENA: Flier`, `EP_TOOLS_LV: Flier`, `FALLAS_LAKE_CHURCH: Flier`, `FARMERS_MARKET: Flier`, `FARMING_AND_RURAL_SUPPLY_DOE_VALLEY: Flier`, `FASHION_A_BELLE: Flier`, `FIVE_ALARM_CHILI: Flier`, `FOSSOIL_1: Flier`, `FOSSOIL_2: Flier`, `FOSSOIL_3: Flier`, `FOSSOIL_4: Flier`, `FOSSOIL_5: Flier`, `FOSSOIL_6: Flier`, `FOSSOIL_7: Flier`, `FOSSOIL_8: Flier`, `FOURTH_OF_JULY_CELEBRATION_DIXIE_MOBILE_PARK: Flier`, `GNOME_SWEET_GNOME: Flier`, `GOLDEN_SUNSET: Flier`, `GREENES_JOB_AD_EKRON: Flier`, `GUNS_UNLIMITED_ECHO_CREEK: Flier`, `HIGH_STREET_APARTMENTS: Flier`, `HIT_VIDS_JOB_AD_MARCH_RIDGE: Flier`, `HOBBS_AND_PERKINS_HARDWARE: Flier`, `HOUSE_FOR_SALE_787: Flier`, `HOUSE_FOR_SALE_799: Flier`, `HOUSE_FOR_SALE_818: Flier`, `HOUSE_FOR_SALE_845: Flier`, `HOUSE_FOR_SALE_851: Flier`, `HOUSE_FOR_SALE_855: Flier`, `HOUSE_FOR_SALE_860: Flier`, `HOUSE_FOR_SALE_867: Flier`, `HOUSE_FOR_SALE_895: Flier`, `HOUSE_FOR_SALE_903: Flier`, `HOUSE_FOR_SALE_907: Flier`, `HOUSE_FOR_SALE_912: Flier`, `HOUSE_FOR_SALE_919: Flier`, `HOUSE_FOR_SALE_922: Flier`, `HOUSE_FOR_SALE_929: Flier`, `HOUSE_FOR_SALE_930: Flier`, `HOUSE_FOR_SALE_934: Flier`, `HOUSE_FOR_SALE_943: Flier`, `IRVINGTON_GUN_CLUB: Flier`, `KNOX_BANK_JOB_AD_ROSEWOOD: Flier`, `KNOX_GUN_OWNERS_CLUB_GET_TOGETHER: Flier`, `KNOX_PACK_KITCHENS: Flier`, `LEAFHILL_HEIGHTS: Flier`, `LECTROMAX_MANUFACTURING_JOB_AD: Flier`, `LENNYS_CAR_REPAIR: Flier`, `LOUISVILLE_BRUISER: Flier`, `LOVE_DUET: Flier`, `LOWRY_COURT: Flier`, `LVFD: Flier`, `LVPD_HQ: Flier`, `MAD_DANS_DEN: Flier`, `MAIL_CARRIER_AD_EKRON: Flier`, `MARCH_RIDGE_SCHOOL_JOB_AD: Flier`, `MCCOY_LOGGING_CORP: Flier`, `MEADSHIRE_ESTATES: Flier`, `MULDRAUGH_BAKE_SALE: Flier`, `MULDRAUGH_PD: Flier`, `MUSIC_FEST_93: Flier`, `NAILS_AND_NUTS: Flier`, `NOLANS_USED_CARS: Flier`, `OLD_CGE_CORP_BUILDING: Flier`, `ONYX_DRIVE_IN_THEATER: Flier`, `OVO_FARMS: Flier`, `PILEO_CREPE_JOB_AD_CROSS_ROADS_MALL: Flier`, `PIZZA_WHIRLED_JOB_AD_ROSEWOOD: Flier`, `PREMISES_FOR_LEASE_863: Flier`, `PREMISES_WITH_APARTMENTS_FOR_LEASE_LISTING_NO_891: Flier`, `READY_PREP: Flier`, `RED_OAK_APARTMENTS: Flier`, `RIVERSIDE_INDEPENDENCE_DAY_PARTY_ALL_WELCOME: Flier`, `RIVERSIDE_PD: Flier`, `ROSEWOOD_FD: Flier`, `ROXYS_ROLLER_RINK: Flier`, `RUSTY_RIFLE: Flier`, `SAMMIES: Flier`, `SPIFFOS_HIRING_DIXIE: Flier`, `SPIFFOS_HIRING_LOUISVILLE: Flier`, `SPIFFOS_HIRING_WEST_POINT: Flier`, `STUART_AND_LOG_SCRAPYARD: Flier`, `SUNSET_PINES_FUNERAL_HOME: Flier`, `SURE_FITNESS_BOXING_CLUB: Flier`, `TACO_DEL_PANCHO: Flier`, `THE_SEA_SHANTY: Flier`, `THE_WIZARDS_KEEP: Flier`, `TWIGGYS: Flier`, `UPSCALE_MOBILITY: Flier`, `U_STORE_IT_LOUISVILLE: Flier`, `U_STORE_IT_MULDRAUGH: Flier`, `U_STORE_IT_RIVERSIDE: Flier`, `WPDIY: Flier`, `WP_TOWN_HALL: Flier`, `YOUR_LOCAL_SHELTER_BRANDENBURG: Flier`.

### FluidDefinitionScript

`zombie.scripting.objects.FluidDefinitionScript`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (26), listed on their own entries.

Methods, called as `obj:name(...)`:

- `InitLoadPP(String name): void`
- `Load(String name, String body): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `getAlcohol(): float`
- `getBlendBlackList(): FluidFilterScript`
- `getBlendWhitelist(): FluidFilterScript`
- `getCalories(): float`
- `getCarbohydrates(): float`
- `getCategories(): EnumSet<FluidCategory>`
- `getColor(): Color`
- `getDisplayName(): String`
- `getEnduranceChange(): float`
- `getExistsAsVanilla(): boolean`
- `getFatigueChange(): float`
- `getFluReduction(): float`
- `getFluidType(): FluidType`
- `getFluidTypeString(): String`
- `getFoodSicknessChange(): int`
- `getHungerChange(): float`
- `getLipids(): float`
- `getModID(): String`
- `getPainReduction(): float`
- `getPoisonDiluteRatio(): float`
- `getPoisonMaxEffect(): PoisonEffect`
- `getPoisonMinAmount(): float`
- `getProteins(): float`
- `getStressChange(): float`
- `getThirstChange(): float`
- `getUnhappyChange(): float`
- `hasPropertiesSet(): boolean`
- `isVanilla(): boolean`

### FluidFilterScript

`zombie.scripting.objects.FluidFilterScript`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (25), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String totalFile): void`
- `LoadAnonymousFromBlock(ScriptParser.Block block): void`
- `LoadAnonymousSingleFluid(String fluidName): void`
- `OnPostWorldDictionaryInit(): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `copy(): FluidFilterScript`
- `createFilter(): FluidFilter`
- `getFilter(): FluidFilter`
- `getVersion(IVersionHash hash): void`
- `isSingleFluid(): boolean`

Static functions, called as `FluidFilterScript.name(...)`:

- `GetAnonymous(): FluidFilterScript`
- `GetAnonymous(boolean isWhitelist): FluidFilterScript`

Constructors: `FluidFilterScript.new()`.

### GameSoundScript

`zombie.scripting.objects.GameSoundScript`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String totalFile): void`
- `reset(): void`

Constructors: `GameSoundScript.new()`.

### Item

`zombie.scripting.objects.Item`, class. Extends [GameEntityScript](#gameentityscript). Also has the methods of [GameEntityScript](#gameentityscript) (17), [BaseScriptObject](#basescriptobject) (23), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoParam(String str): void`
- `DoParam(String param, String val): void`
- `InitLoadPP(String name): void`
- `InstanceItem(String param): InventoryItem`
- `InstanceItem(String param, boolean isFirstTimeCreated): InventoryItem`
- `Load(String name, String totalFile): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `addForageFocusCategory(String categoryName): void`
- `addResearchableRecipe(String recipeName): void`
- `addResearchableRecipe(CraftRecipe craftRecipe): void`
- `addResearchableRecipes(ArrayList<String> recipeNames): void`
- `canBeForaged(): boolean`
- `canSpawnAsLoot(): boolean`
- `clearForageFocusCategories(): void`
- `containsWeaponCategory(WeaponCategory weaponCategory): boolean`
- `getAcceptItemFunction(): String`
- `getActualWeight(): float`
- `getAimReleaseSound(): String`
- `getAmmoType(): AmmoType`
- `getB(): float`
- `getBloodClothingType(): ArrayList<BloodClothingType>`
- `getBodyLocation(): ItemBodyLocation`
- `getBoredomChange(): float`
- `getBreakSound(): String`
- `getBringToBearSound(): String`
- `getBulletHitArmourSound(): String`
- `getBulletOutSound(): String`
- `getChanceToFall(): int`
- `getCloseSound(): String`
- `getClothingItem(): String`
- `getClothingItemAsset(): ClothingItem`
- `getClothingItemExtra(): ArrayList<String>`
- `getClothingItemExtraOption(): ArrayList<String>`
- `getColorBlue(): float`
- `getColorGreen(): float`
- `getColorRed(): float`
- `getConditionLowerChance(): int`
- `getConditionMax(): int`
- `getCookingSound(): String`
- `getCorpseSicknessDefense(): float`
- `getCount(): int`
- `getCountDownSound(): String`
- `getCustomEatSound(): String`
- `getDamagedSound(): String`
- `getDaysFresh(): int`
- `getDaysTotallyRotten(): int`
- `getDigType(): String`
- `getDiscomfortModifier(): float`
- `getDisplayCategory(): String`
- `getDisplayName(): String`
- `getDoorDamage(): int`
- `getDoorHitSound(): String`
- `getDoubleClickRecipe(): String`
- `getDropSound(): String`
- `getEatTime(): int`
- `getEatType(): String`
- `getEjectAmmoSound(): String`
- `getEjectAmmoStartSound(): String`
- `getEjectAmmoStopSound(): String`
- `getEnduranceChange(): float`
- `getEnduranceMod(): float`
- `getEquipSound(): String`
- `getEvolvedRecipe(): ArrayList<String>`
- `getExplosionSound(): String`
- `getFabricType(): String`
- `getFileName(): String`
- `getFillFromDispenserSound(): String`
- `getFillFromLakeSound(): String`
- `getFillFromTapSound(): String`
- `getFillFromToiletSound(): String`
- `getFireFuelRatio(): float`
- `getFoodSicknessChange(): int`
- `getForageFocusCategories(): HashSet<String>`
- `getFullName(): String`
- `getG(): float`
- `getHeadConditionLowerChanceMultiplier(): float`
- `getHearingModifier(): float`
- `getHerbalistType(): String`
- `getHungerChange(): float`
- `getIcon(): String`
- `getIconFluidMask(): String`
- `getIconsForTexture(): ArrayList<String>`
- `getImpactSound(): String`
- `getInsertAmmoSound(): String`
- `getInsertAmmoStartSound(): String`
- `getInsertAmmoStopSound(): String`
- `getInsulation(): float`
- `getItemAfterCleaning(): String`
- `getItemConfig(): ItemConfig`
- `getItemConfigKey(): String`
- `getItemType(): ItemType`
- `getKnockdownMod(): float`
- `getLearnedRecipes(): List<String>`
- `getLevelSkillTrained(): int`
- `getLootType(): String`
- `getLuaCreate(): String`
- `getMapID(): String`
- `getMaxDamage(): float`
- `getMaxHitCount(): int`
- `getMaxItemSize(): float`
- `getMaxLevelTrained(): int`
- `getMaxRange(): float`
- `getMinAngle(): float`
- `getMinDamage(): float`
- `getMinimumSwingTime(): float`
- `getMinutesToBurn(): int`
- `getMinutesToCook(): int`
- `getModuleName(): String`
- `getMuzzleFlashModelKey(): ModelKey`
- `getNPCSoundBoost(): float`
- `getName(): String`
- `getNoiseDuration(): int`
- `getNormalTexture(): Texture`
- `getNumLevelsTrained(): int`
- `getNumSpawned(): int`
- `getNumberOfPages(): int`
- `getObsolete(): boolean`
- `getOnBreak(): String`
- `getOpenSound(): String`
- `getOpeningRecipe(): String`
- `getOtherCharacterVolumeBoost(): float`
- `getOtherHandRequire(): ItemTag`
- `getPaletteChoices(): Stack<String>`
- `getPalettesStart(): String`
- `getPhysicsObject(): String`
- `getPlaceMultipleSound(): String`
- `getPlaceOneSound(): String`
- `getPoisonDetectionLevel(): int`
- `getPoisonPower(): float`
- `getPourType(): String`
- `getPushBackMod(): float`
- `getPutInSound(): String`
- `getR(): float`
- `getReadType(): String`
- `getRecordedMediaCat(): String`
- `getReplaceOnDeplete(): String`
- `getReplaceOnExtinguish(): String`
- `getReplaceOnUse(): String`
- `getReplaceType(String key): String`
- `getReplaceTypes(): String`
- `getReplaceTypesMap(): HashMap<String, String>`
- `getReplaceWhenUnequip(): String`
- `getResearchableRecipes(): ArrayList<String>`
- `getResearchableRecipes(IsoGameCharacter chr): ArrayList<String>`
- `getResearchableRecipes(IsoGameCharacter chr, boolean blacklistKnown): ArrayList<String>`
- `getShellFallSound(): String`
- `getShoutMultiplier(): float`
- `getShoutType(): String`
- `getSkillTrained(): String`
- `getSoundByID(String id): String`
- `getSoundByID(SoundMapKey id): String`
- `getSoundParameter(String parameterName): String`
- `getSoundRadius(): int`
- `getSoundVolume(): int`
- `getSpawnWith(): String`
- `getSplatNumber(): int`
- `getSpriteName(): String`
- `getStaticModel(): String`
- `getStaticModelException(): String`
- `getStaticModelsByIndex(): ArrayList<String>`
- `getStrainModifier(): float`
- `getStressChange(): float`
- `getSwingAmountBeforeImpact(): float`
- `getSwingAnim(): String`
- `getSwingSound(): String`
- `getSwingTime(): float`
- `getTags(): Set<ItemTag>`
- `getTemperature(): float`
- `getThirstChange(): float`
- `getTicksPerEquipUse(): float`
- `getToHitModifier(): float`
- `getTooltip(): String`
- `getUnequipSound(): String`
- `getUnhappyChange(): float`
- `getUseDelta(): float`
- `getUsedInFavouriteRecipes(IsoPlayer player): ArrayList<String>`
- `getUsedInRecipes(): ArrayList<String>`
- `getUsedInRecipes(IsoGameCharacter character): ArrayList<String>`
- `getUsedInRecipes(IsoGameCharacter character, ArrayList<String> recipesList): ArrayList<String>`
- `getVehiclePartModels(): ArrayList<VehiclePartModel>`
- `getVisionModifier(): float`
- `getWaterresist(): float`
- `getWeaponCategories(): Set<WeaponCategory>`
- `getWeaponHitArmourSound(): String`
- `getWeaponSprite(): String`
- `getWeaponSpritesByIndex(): ArrayList<String>`
- `getWeaponWeight(): float`
- `getWeightEmpty(): float`
- `getWeightWet(): float`
- `getWindresist(): float`
- `getWithDrainable(): String`
- `getWithoutDrainable(): String`
- `getWorldObjectSprite(): String`
- `getWorldStaticModel(): String`
- `getWorldStaticModelsByIndex(): ArrayList<String>`
- `hasReplaceType(String key): boolean`
- `hasResearchableRecipes(): boolean`
- `hasTag(ItemTag itemTag): boolean`
- `hasTag(ItemTag... tags): boolean`
- `ignoreZombieDensity(): boolean`
- `isAlcoholic(): boolean`
- `isAlwaysKnockdown(): boolean`
- `isAlwaysWelcomeGift(): boolean`
- `isAngleFalloff(): boolean`
- `isBodyLocation(ItemBodyLocation bodyLocation): boolean`
- `isCanBandage(): boolean`
- `isCanBarricade(): boolean`
- `isCantAttackWithLowestEndurance(): boolean`
- `isCantBeFrozen(): boolean`
- `isCantEat(): Boolean`
- `isConditionAffectsCapacity(): boolean`
- `isCookwareLoot(): boolean`
- `isCosmetic(): boolean`
- `isCraftRecipeProduct(): boolean`
- `isDangerousUncooked(): boolean`
- `isDisappearOnUse(): boolean`
- `isFarmingLoot(): boolean`
- `isFavouriteRecipeInput(IsoPlayer player): boolean`
- `isHidden(): boolean`
- `isIsCookable(): boolean`
- `isItemType(ItemType itemType): boolean`
- `isKeepOnDeplete(): boolean`
- `isKnockBackOnNoDeath(): boolean`
- `isManuallyRemoveSpentRounds(): boolean`
- `isMaterialLoot(): boolean`
- `isMechanicsLoot(): boolean`
- `isMedicalLoot(): boolean`
- `isMementoLoot(): boolean`
- `isMultipleHitConditionAffected(): boolean`
- `isOtherHandUse(): boolean`
- `isRangeFalloff(): boolean`
- `isRanged(): boolean`
- `isShareEndurance(): boolean`
- `isSpice(): boolean`
- `isSplatBloodOnNoDeath(): boolean`
- `isSurvivalGearLoot(): boolean`
- `isToolLoot(): boolean`
- `isUnwanted(IsoPlayer player): boolean`
- `isUseEndurance(): boolean`
- `isUseSelf(): boolean`
- `isUseWhileEquipped(): boolean`
- `isUseWhileUnequipped(): boolean`
- `isUsedInBuildRecipes(): boolean`
- `isUsedInBuildRecipes(IsoGameCharacter character): boolean`
- `isUsedInRecipes(): boolean`
- `isUsedInRecipes(IsoGameCharacter character): boolean`
- `isVisualAid(): boolean`
- `isWorldRender(): Boolean`
- `researchRecipes(IsoGameCharacter character): void`
- `resolveItemTypes(): void`
- `resolveModelScripts(): void`
- `setActualWeight(float actualWeight): void`
- `setAlcoholic(boolean alcoholic): void`
- `setAlwaysKnockdown(boolean alwaysKnockdown): void`
- `setAlwaysWelcomeGift(boolean alwaysWelcomeGift): void`
- `setAmmoType(AmmoType ammoType): void`
- `setAngleFalloff(boolean angleFalloff): void`
- `setBodyLocation(ItemBodyLocation bodyLocation): void`
- `setBoredomChange(float boredomChange): void`
- `setCanBandage(boolean canBandage): void`
- `setCanBarricade(boolean canBarricade): void`
- `setCanBeForaged(boolean canBe): void`
- `setCanSpawnAsLoot(boolean canSpawn): void`
- `setCantAttackWithLowestEndurance(boolean cantAttackWithLowestEndurance): void`
- `setClothingItemAsset(ClothingItem asset): void`
- `setConditionLowerChance(int conditionLowerChance): void`
- `setConditionMax(int conditionMax): void`
- `setCount(int count): void`
- `setDangerousUncooked(boolean dangerousUncooked): void`
- `setDaysFresh(int daysFresh): void`
- `setDaysTotallyRotten(int daysTotallyRotten): void`
- `setDisappearOnUse(boolean disappearOnUse): void`
- `setDisplayName(String displayName): void`
- `setDoorDamage(int doorDamage): void`
- `setDoorHitSound(String doorHitSound): void`
- `setDoubleClickRecipe(String recipeName): void`
- `setEnduranceChange(float enduranceChange): void`
- `setEnduranceMod(float enduranceMod): void`
- `setHungerChange(float hungerChange): void`
- `setIcon(String icon): void`
- `setImpactSound(String impactSound): void`
- `setInsulation(float f): void`
- `setIsCookable(boolean isCookable): void`
- `setIsCraftRecipeProduct(): void`
- `setIsCraftRecipeProduct(boolean isProduct): void`
- `setItemConfig(ItemConfig itemConfig): void`
- `setItemType(ItemType itemType): void`
- `setKeepOnDeplete(boolean keepOnDeplete): void`
- `setKnockBackOnNoDeath(boolean knockBackOnNoDeath): void`
- `setKnockdownMod(float knockdownMod): void`
- `setLuaCreate(String functionName): void`
- `setMaxDamage(float maxDamage): void`
- `setMaxHitCount(int maxHitCount): void`
- `setMaxRange(float maxRange): void`
- `setMinAngle(float minAngle): void`
- `setMinDamage(float minDamage): void`
- `setMinimumSwingTime(float minimumSwingTime): void`
- `setMinutesToBurn(int minutesToBurn): void`
- `setMinutesToCook(int minutesToCook): void`
- `setMultipleHitConditionAffected(boolean multipleHitConditionAffected): void`
- `setNPCSoundBoost(float npcSoundBoost): void`
- `setName(String name): void`
- `setOpeningRecipe(String recipeName): void`
- `setOtherCharacterVolumeBoost(float otherCharacterVolumeBoost): void`
- `setOtherHandRequire(ItemTag otherHandRequire): void`
- `setOtherHandUse(boolean otherHandUse): void`
- `setPaletteChoices(Stack<String> paletteChoices): void`
- `setPalettesStart(String palettesStart): void`
- `setPhysicsObject(String physicsObject): void`
- `setPushBackMod(float pushBackMod): void`
- `setRangeFalloff(boolean rangeFalloff): void`
- `setRanged(boolean ranged): void`
- `setReplaceOnDeplete(String replaceOnDeplete): void`
- `setReplaceOnExtinguish(String replaceOnExtinguish): void`
- `setReplaceOnUse(String replaceOnUse): void`
- `setShareEndurance(boolean shareEndurance): void`
- `setSoundRadius(int soundRadius): void`
- `setSoundVolume(int soundVolume): void`
- `setSplatBloodOnNoDeath(boolean splatBloodOnNoDeath): void`
- `setSplatNumber(int splatNumber): void`
- `setSpriteName(String spriteName): void`
- `setStressChange(float stressChange): void`
- `setSwingAmountBeforeImpact(float swingAmountBeforeImpact): void`
- `setSwingAnim(String swingAnim): void`
- `setSwingSound(String swingSound): void`
- `setSwingTime(float swingTime): void`
- `setTemperature(float temperature): void`
- `setThirstChange(float thirstChange): void`
- `setTicksPerEquipUse(int ticksPerEquipUse): void`
- `setToHitModifier(float toHitModifier): void`
- `setUnhappyChange(float unhappyChange): void`
- `setUnwanted(IsoPlayer player): void`
- `setUnwanted(IsoPlayer player, boolean unwanted): void`
- `setUseDelta(float useDelta): void`
- `setUseEndurance(boolean useEndurance): void`
- `setUseSelf(boolean useSelf): void`
- `setUseWhileEquipped(boolean useWhileEquipped): void`
- `setUseWhileUnequipped(boolean useWhileUnequipped): void`
- `setWanted(IsoPlayer player): void`
- `setWaterresist(float w): void`
- `setWeaponCategories(Set<WeaponCategory> categories): void`
- `setWeaponSprite(String weaponSprite): void`
- `setWeaponWeight(float weaponWeight): void`
- `setWeightEmpty(float weight): void`
- `setWeightWet(float weight): void`
- `setWindresist(float w): void`
- `toString(): String`

Constructors: `Item.new()`.

Static fields (a copy of the value taken when the class is exposed): `MAXIMUM_FOOD_AGE: int`, `netIdToItem: HashMap<Integer, String>`, `netItemToId: HashMap<String, Integer>`.

### ItemBodyLocation

`zombie.scripting.objects.ItemBodyLocation`, class.

Methods, called as `obj:name(...)`:

- `getTranslationName(): String`
- `toString(): String`

Static functions, called as `ItemBodyLocation.name(...)`:

- `get(ResourceLocation id): ItemBodyLocation`
- `register(String id): ItemBodyLocation`

Static fields (a copy of the value taken when the class is exposed): `AMMO_STRAP: ItemBodyLocation`, `ANKLE_HOLSTER: ItemBodyLocation`, `BACK: ItemBodyLocation`, `BANDAGE: ItemBodyLocation`, `BATH_ROBE: ItemBodyLocation`, `BELLY_BUTTON: ItemBodyLocation`, `BELT: ItemBodyLocation`, `BELT_EXTRA: ItemBodyLocation`, `BODY_COSTUME: ItemBodyLocation`, `BOILERSUIT: ItemBodyLocation`, `CALF_LEFT: ItemBodyLocation`, `CALF_LEFT_TEXTURE: ItemBodyLocation`, `CALF_RIGHT: ItemBodyLocation`, `CALF_RIGHT_TEXTURE: ItemBodyLocation`, `CODPIECE: ItemBodyLocation`, `CUIRASS: ItemBodyLocation`, `DRESS: ItemBodyLocation`, `EARS: ItemBodyLocation`, `EAR_TOP: ItemBodyLocation`, `ELBOW_LEFT: ItemBodyLocation`, `ELBOW_RIGHT: ItemBodyLocation`, `EYES: ItemBodyLocation`, `FANNY_PACK_BACK: ItemBodyLocation`, `FANNY_PACK_FRONT: ItemBodyLocation`, `FORE_ARM_LEFT: ItemBodyLocation`, `FORE_ARM_RIGHT: ItemBodyLocation`, `FULL_HAT: ItemBodyLocation`, `FULL_ROBE: ItemBodyLocation`, `FULL_SUIT: ItemBodyLocation`, `FULL_SUIT_HEAD: ItemBodyLocation`, `FULL_SUIT_HEAD_SCBA: ItemBodyLocation`, `FULL_TOP: ItemBodyLocation`, `GAITER_LEFT: ItemBodyLocation`, `GAITER_RIGHT: ItemBodyLocation`, `GORGET: ItemBodyLocation`, `HANDS: ItemBodyLocation`, `HANDS_LEFT: ItemBodyLocation`, `HANDS_RIGHT: ItemBodyLocation`, `HAT: ItemBodyLocation`, `JACKET: ItemBodyLocation`, `JACKET_BULKY: ItemBodyLocation`, `JACKET_DOWN: ItemBodyLocation`, `JACKET_HAT: ItemBodyLocation`, `JACKET_HAT_BULKY: ItemBodyLocation`, `JACKET_SUIT: ItemBodyLocation`, `JERSEY: ItemBodyLocation`, `KNEE_LEFT: ItemBodyLocation`, `KNEE_RIGHT: ItemBodyLocation`, `LEFT_ARM: ItemBodyLocation`, `LEFT_EYE: ItemBodyLocation`, `LEFT_MIDDLE_FINGER: ItemBodyLocation`, `LEFT_RING_FINGER: ItemBodyLocation`, `LEFT_WRIST: ItemBodyLocation`, `LEGS1: ItemBodyLocation`, `LEGS5: ItemBodyLocation`, `LONG_DRESS: ItemBodyLocation`, `LONG_SKIRT: ItemBodyLocation`, `MAKE_UP_EYES: ItemBodyLocation`, `MAKE_UP_EYES_SHADOW: ItemBodyLocation`, `MAKE_UP_FULL_FACE: ItemBodyLocation`, `MAKE_UP_LIPS: ItemBodyLocation`, `MASK: ItemBodyLocation`, `MASK_EYES: ItemBodyLocation`, `MASK_FULL: ItemBodyLocation`, `NECK: ItemBodyLocation`, `NECKLACE: ItemBodyLocation`, `NECKLACE_LONG: ItemBodyLocation`, `NECK_TEXTURE: ItemBodyLocation`, `NOSE: ItemBodyLocation`, `PANTS: ItemBodyLocation`, `PANTS_EXTRA: ItemBodyLocation`, `PANTS_SKINNY: ItemBodyLocation`, `RIGHT_ARM: ItemBodyLocation`, `RIGHT_EYE: ItemBodyLocation`, `RIGHT_MIDDLE_FINGER: ItemBodyLocation`, `RIGHT_RING_FINGER: ItemBodyLocation`, `RIGHT_WRIST: ItemBodyLocation`, `SATCHEL: ItemBodyLocation`, `SCARF: ItemBodyLocation`, `SCBA: ItemBodyLocation`, `SCBANOTANK: ItemBodyLocation`, `SHIRT: ItemBodyLocation`, `SHOES: ItemBodyLocation`, `SHORTS_SHORT: ItemBodyLocation`, `SHORT_PANTS: ItemBodyLocation`, `SHORT_SLEEVE_SHIRT: ItemBodyLocation`, `SHOULDERPAD_LEFT: ItemBodyLocation`, `SHOULDERPAD_RIGHT: ItemBodyLocation`, `SHOULDER_HOLSTER: ItemBodyLocation`, `SKIRT: ItemBodyLocation`, `SOCKS: ItemBodyLocation`, `SPORT_SHOULDERPAD: ItemBodyLocation`, `SPORT_SHOULDERPAD_ON_TOP: ItemBodyLocation`, `SWEATER: ItemBodyLocation`, `SWEATER_HAT: ItemBodyLocation`, `TAIL: ItemBodyLocation`, `TANK_TOP: ItemBodyLocation`, `THIGH_LEFT: ItemBodyLocation`, `THIGH_RIGHT: ItemBodyLocation`, `TORSO1: ItemBodyLocation`, `TORSO1LEGS1: ItemBodyLocation`, `TORSO_EXTRA: ItemBodyLocation`, `TORSO_EXTRA_VEST: ItemBodyLocation`, `TORSO_EXTRA_VEST_BULLET: ItemBodyLocation`, `TSHIRT: ItemBodyLocation`, `UNDERWEAR: ItemBodyLocation`, `UNDERWEAR_BOTTOM: ItemBodyLocation`, `UNDERWEAR_EXTRA1: ItemBodyLocation`, `UNDERWEAR_EXTRA2: ItemBodyLocation`, `UNDERWEAR_TOP: ItemBodyLocation`, `VEST_TEXTURE: ItemBodyLocation`, `WEBBING: ItemBodyLocation`, `WOUND: ItemBodyLocation`, `ZED_DMG: ItemBodyLocation`.

### ItemFilterScript

`zombie.scripting.objects.ItemFilterScript`, class. Extends [BaseScriptObject](#basescriptobject). Also has the methods of [BaseScriptObject](#basescriptobject) (25), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String totalFile): void`
- `OnLoadedAfterLua(): void`
- `OnPostWorldDictionaryInit(): void`
- `OnScriptsLoaded(ScriptLoadMode loadMode): void`
- `PreReload(): void`
- `allowsItem(InventoryItem item): boolean`
- `allowsItem(Item item): boolean`
- `getName(): String`

Constructors: `ItemFilterScript.new()`.

### ItemKey

`zombie.scripting.objects.ItemKey`, record.

Methods, called as `obj:name(...)`:

- `equals(Object): boolean`
- `hashCode(): int`
- `id(): String`
- `itemType(): ItemType`
- `toString(): String`

Static functions, called as `ItemKey.name(...)`:

- `getByItemKeyValue(String name): ItemKey`
- `getByName(String name): Optional<ItemKey>`

Constructors: `ItemKey.new(String id, ItemType itemType)`.

### ItemKey.AlarmClock

`zombie.scripting.objects.ItemKey.AlarmClock`, class.

Constructors: `ItemKey.AlarmClock.new()`.

Static fields (a copy of the value taken when the class is exposed): `ALARM_CLOCK_2: ItemKey`, `POCKETWATCH: ItemKey`.

### ItemKey.AlarmClockClothing

`zombie.scripting.objects.ItemKey.AlarmClockClothing`, class.

Constructors: `ItemKey.AlarmClockClothing.new()`.

Static fields (a copy of the value taken when the class is exposed): `WRIST_WATCH_LEFT_CLASSIC_BLACK: ItemKey`, `WRIST_WATCH_LEFT_CLASSIC_BROWN: ItemKey`, `WRIST_WATCH_LEFT_CLASSIC_GOLD: ItemKey`, `WRIST_WATCH_LEFT_CLASSIC_MILITARY: ItemKey`, `WRIST_WATCH_LEFT_DIGITAL_BLACK: ItemKey`, `WRIST_WATCH_LEFT_DIGITAL_DRESS: ItemKey`, `WRIST_WATCH_LEFT_DIGITAL_RED: ItemKey`, `WRIST_WATCH_LEFT_EXPENSIVE: ItemKey`, `WRIST_WATCH_RIGHT_CLASSIC_BLACK: ItemKey`, `WRIST_WATCH_RIGHT_CLASSIC_BROWN: ItemKey`, `WRIST_WATCH_RIGHT_CLASSIC_GOLD: ItemKey`, `WRIST_WATCH_RIGHT_CLASSIC_MILITARY: ItemKey`, `WRIST_WATCH_RIGHT_DIGITAL_BLACK: ItemKey`, `WRIST_WATCH_RIGHT_DIGITAL_DRESS: ItemKey`, `WRIST_WATCH_RIGHT_DIGITAL_RED: ItemKey`, `WRIST_WATCH_RIGHT_EXPENSIVE: ItemKey`.

### ItemKey.Animal

`zombie.scripting.objects.ItemKey.Animal`, class.

Constructors: `ItemKey.Animal.new()`.

Static fields (a copy of the value taken when the class is exposed): `ANIMAL: ItemKey`.

### ItemKey.Clothing

`zombie.scripting.objects.ItemKey.Clothing`, class.

Constructors: `ItemKey.Clothing.new()`.

Static fields (a copy of the value taken when the class is exposed): `APRON_BBQ: ItemKey`, `APRON_BLACK: ItemKey`, `APRON_GARBAGE: ItemKey`, `APRON_HIDE: ItemKey`, `APRON_ICE_CREAM: ItemKey`, `APRON_JAY: ItemKey`, `APRON_LEATHER: ItemKey`, `APRON_PILE_OCREPE: ItemKey`, `APRON_PIZZA_WHIRLED: ItemKey`, `APRON_SPIFFOS: ItemKey`, `APRON_TARP: ItemKey`, `APRON_WHITE: ItemKey`, `APRON_WHITE_TEXTURE: ItemKey`, `ATHLETIC_CUP: ItemKey`, `BAG_LEATHER_WATER_BAG: ItemKey`, `BANDAGE_ABDOMEN: ItemKey`, `BANDAGE_ABDOMEN_BLOOD: ItemKey`, `BANDAGE_CHEST: ItemKey`, `BANDAGE_CHEST_BLOOD: ItemKey`, `BANDAGE_GROIN: ItemKey`, `BANDAGE_GROIN_BLOOD: ItemKey`, `BANDAGE_HEAD: ItemKey`, `BANDAGE_HEAD_BLOOD: ItemKey`, `BANDAGE_LEFT_FOOT: ItemKey`, `BANDAGE_LEFT_FOOT_BLOOD: ItemKey`, `BANDAGE_LEFT_HAND: ItemKey`, `BANDAGE_LEFT_HAND_BLOOD: ItemKey`, `BANDAGE_LEFT_LOWER_ARM: ItemKey`, `BANDAGE_LEFT_LOWER_ARM_BLOOD: ItemKey`, `BANDAGE_LEFT_LOWER_LEG: ItemKey`, `BANDAGE_LEFT_LOWER_LEG_BLOOD: ItemKey`, `BANDAGE_LEFT_UPPER_ARM: ItemKey`, `BANDAGE_LEFT_UPPER_ARM_BLOOD: ItemKey`, `BANDAGE_LEFT_UPPER_LEG: ItemKey`, `BANDAGE_LEFT_UPPER_LEG_BLOOD: ItemKey`, `BANDAGE_NECK: ItemKey`, `BANDAGE_NECK_BLOOD: ItemKey`, `BANDAGE_RIGHT_FOOT: ItemKey`, `BANDAGE_RIGHT_FOOT_BLOOD: ItemKey`, `BANDAGE_RIGHT_HAND: ItemKey`, `BANDAGE_RIGHT_HAND_BLOOD: ItemKey`, `BANDAGE_RIGHT_LOWER_ARM: ItemKey`, `BANDAGE_RIGHT_LOWER_ARM_BLOOD: ItemKey`, `BANDAGE_RIGHT_LOWER_LEG: ItemKey`, `BANDAGE_RIGHT_LOWER_LEG_BLOOD: ItemKey`, `BANDAGE_RIGHT_UPPER_ARM: ItemKey`, `BANDAGE_RIGHT_UPPER_ARM_BLOOD: ItemKey`, `BANDAGE_RIGHT_UPPER_LEG: ItemKey`, `BANDAGE_RIGHT_UPPER_LEG_BLOOD: ItemKey`, `BANDEAU_BURLAP: ItemKey`, `BANDEAU_DENIM: ItemKey`, `BANDEAU_FAUN_HIDE: ItemKey`, `BANDEAU_GARBAGE: ItemKey`, `BANDEAU_HIDE: ItemKey`, `BANDEAU_RAG: ItemKey`, `BANDEAU_TARP: ItemKey`, `BELLY_BUTTON_DANGLE_GOLD: ItemKey`, `BELLY_BUTTON_DANGLE_GOLD_RUBY: ItemKey`, `BELLY_BUTTON_DANGLE_SILVER: ItemKey`, `BELLY_BUTTON_DANGLE_SILVER_DIAMOND: ItemKey`, `BELLY_BUTTON_RING_GOLD: ItemKey`, `BELLY_BUTTON_RING_GOLD_DIAMOND: ItemKey`, `BELLY_BUTTON_RING_GOLD_RUBY: ItemKey`, `BELLY_BUTTON_RING_SILVER: ItemKey`, `BELLY_BUTTON_RING_SILVER_AMETHYST: ItemKey`, `BELLY_BUTTON_RING_SILVER_DIAMOND: ItemKey`, `BELLY_BUTTON_RING_SILVER_RUBY: ItemKey`, `BELLY_BUTTON_STUD_GOLD: ItemKey`, `BELLY_BUTTON_STUD_GOLD_DIAMOND: ItemKey`, `BELLY_BUTTON_STUD_SILVER: ItemKey`, `BELLY_BUTTON_STUD_SILVER_DIAMOND: ItemKey`, `BELT_2: ItemKey`, `BIKINI_PATTERN_01: ItemKey`, `BIKINI_TINT: ItemKey`, `BLACK_ROBE: ItemKey`, `BOILERSUIT: ItemKey`, `BOILERSUIT_BLUE_RED: ItemKey`, `BOILERSUIT_FLYING: ItemKey`, `BOILERSUIT_PRISONER: ItemKey`, `BOILERSUIT_PRISONER_KHAKI: ItemKey`, `BOILERSUIT_SWAT: ItemKey`, `BOILERSUIT_YELLOW: ItemKey`, `BOOB_TUBE: ItemKey`, `BOOB_TUBE_SMALL: ItemKey`, `BOXERS_HEARTS: ItemKey`, `BOXERS_RED_STRIPES: ItemKey`, `BOXERS_SILK_BLACK: ItemKey`, `BOXERS_SILK_RED: ItemKey`, `BOXERS_WHITE: ItemKey`, `BRACELET_BANGLE_LEFT_GOLD: ItemKey`, `BRACELET_BANGLE_LEFT_SILVER: ItemKey`, `BRACELET_BANGLE_RIGHT_GOLD: ItemKey`, `BRACELET_BANGLE_RIGHT_SILVER: ItemKey`, `BRACELET_CHAIN_LEFT_GOLD: ItemKey`, `BRACELET_CHAIN_LEFT_SILVER: ItemKey`, `BRACELET_CHAIN_RIGHT_GOLD: ItemKey`, `BRACELET_CHAIN_RIGHT_SILVER: ItemKey`, `BRACELET_LEFT_FRIENDSHIP_TINT: ItemKey`, `BRACELET_RIGHT_FRIENDSHIP_TINT: ItemKey`, `BRA_STRAPLESS_ANIMAL_PRINT: ItemKey`, `BRA_STRAPLESS_BLACK: ItemKey`, `BRA_STRAPLESS_FRILLY_BLACK: ItemKey`, `BRA_STRAPLESS_FRILLY_PINK: ItemKey`, `BRA_STRAPLESS_FRILLY_RED: ItemKey`, `BRA_STRAPLESS_HIDE: ItemKey`, `BRA_STRAPLESS_RED_SPOTS: ItemKey`, `BRA_STRAPLESS_WHITE: ItemKey`, `BRA_STRAPS_ANIMAL_PRINT: ItemKey`, `BRA_STRAPS_BLACK: ItemKey`, `BRA_STRAPS_FRILLY_BLACK: ItemKey`, `BRA_STRAPS_FRILLY_PINK: ItemKey`, `BRA_STRAPS_FRILLY_RED: ItemKey`, `BRA_STRAPS_HIDE: ItemKey`, `BRA_STRAPS_WHITE: ItemKey`, `BRIEFS_ANIMAL_PRINTS: ItemKey`, `BRIEFS_BURLAP: ItemKey`, `BRIEFS_DENIM: ItemKey`, `BRIEFS_GARBAGE: ItemKey`, `BRIEFS_HIDE: ItemKey`, `BRIEFS_RAG: ItemKey`, `BRIEFS_SMALL_TRUNKS_BLACK: ItemKey`, `BRIEFS_SMALL_TRUNKS_BLUE: ItemKey`, `BRIEFS_SMALL_TRUNKS_RED: ItemKey`, `BRIEFS_SMALL_TRUNKS_WHITE_TINT: ItemKey`, `BRIEFS_TARP: ItemKey`, `BRIEFS_WHITE: ItemKey`, `BUNNY_SUIT_BLACK: ItemKey`, `BUNNY_SUIT_PINK: ItemKey`, `BUNNY_TAIL: ItemKey`, `CANTEEN_COWBOY: ItemKey`, `CHAINMAIL_HAND_L: ItemKey`, `CHAINMAIL_HAND_R: ItemKey`, `CHAINMAIL_SLEEVE_FULL_L: ItemKey`, `CHAINMAIL_SLEEVE_FULL_R: ItemKey`, `CODPIECE_LEATHER: ItemKey`, `CODPIECE_METAL: ItemKey`, `CORSET: ItemKey`, `CORSET_BLACK: ItemKey`, `CORSET_MEDICAL: ItemKey`, `CORSET_RED: ItemKey`, `CUIRASS_BASIC_BONE: ItemKey`, `CUIRASS_BONE: ItemKey`, `CUIRASS_COAT_OF_PLATES: ItemKey`, `CUIRASS_MAGAZINE: ItemKey`, `CUIRASS_METAL: ItemKey`, `CUIRASS_METAL_SCRAP: ItemKey`, `CUIRASS_TIRE: ItemKey`, `CUIRASS_WOOD: ItemKey`, `DRESS_KNEES: ItemKey`, `DRESS_KNEES_CRAFTED_BURLAP: ItemKey`, `DRESS_KNEES_CRAFTED_COTTON: ItemKey`, `DRESS_KNEES_CRAFTED_DENIM: ItemKey`, `DRESS_KNEES_CRAFTED_DENIM_BLACK: ItemKey`, `DRESS_KNEES_CRAFTED_DENIM_LIGHT: ItemKey`, `DRESS_KNEES_STRAPS: ItemKey`, `DRESS_LONG: ItemKey`, `DRESS_LONG_CRAFTED_BURLAP: ItemKey`, `DRESS_LONG_CRAFTED_COTTON: ItemKey`, `DRESS_LONG_CRAFTED_DENIM: ItemKey`, `DRESS_LONG_CRAFTED_DENIM_BLACK: ItemKey`, `DRESS_LONG_CRAFTED_DENIM_LIGHT: ItemKey`, `DRESS_LONG_STRAPS: ItemKey`, `DRESS_NORMAL: ItemKey`, `DRESS_SATIN_NEGLIGEE: ItemKey`, `DRESS_SHORT: ItemKey`, `DRESS_SMALL_BLACK_STRAPLESS: ItemKey`, `DRESS_SMALL_BLACK_STRAPS: ItemKey`, `DRESS_SMALL_DEER_HIDE_STRAPLESS: ItemKey`, `DRESS_SMALL_GARBAGE_STRAPLESS: ItemKey`, `DRESS_SMALL_HIDE_STRAPLESS: ItemKey`, `DRESS_SMALL_STRAPLESS: ItemKey`, `DRESS_SMALL_STRAPS: ItemKey`, `DRESS_SMALL_TARP_STRAPLESS: ItemKey`, `DRESS_STRAPS: ItemKey`, `DUNGAREES: ItemKey`, `DUNGAREES_HUNTING_CAMO: ItemKey`, `EARRING_BIRD_SKULL: ItemKey`, `EARRING_BOAR_TUSK: ItemKey`, `EARRING_DANGLY_DIAMOND: ItemKey`, `EARRING_DANGLY_EMERALD: ItemKey`, `EARRING_DANGLY_PEARL: ItemKey`, `EARRING_DANGLY_RUBY: ItemKey`, `EARRING_DANGLY_SAPPHIRE: ItemKey`, `EARRING_LOOP_LRG_GOLD: ItemKey`, `EARRING_LOOP_LRG_SILVER: ItemKey`, `EARRING_LOOP_MED_GOLD: ItemKey`, `EARRING_LOOP_MED_SILVER: ItemKey`, `EARRING_LOOP_SMALL_GOLD_BOTH: ItemKey`, `EARRING_LOOP_SMALL_GOLD_TOP: ItemKey`, `EARRING_LOOP_SMALL_SILVER_BOTH: ItemKey`, `EARRING_LOOP_SMALL_SILVER_TOP: ItemKey`, `EARRING_PEARL: ItemKey`, `EARRING_STONE_EMERALD: ItemKey`, `EARRING_STONE_RUBY: ItemKey`, `EARRING_STONE_SAPPHIRE: ItemKey`, `EARRING_STUD_GOLD: ItemKey`, `EARRING_STUD_SILVER: ItemKey`, `ELBOW_PAD_LEFT: ItemKey`, `ELBOW_PAD_LEFT_LEATHER: ItemKey`, `ELBOW_PAD_LEFT_MILITARY: ItemKey`, `ELBOW_PAD_LEFT_SPORT: ItemKey`, `ELBOW_PAD_LEFT_TACTICAL: ItemKey`, `ELBOW_PAD_LEFT_TINT: ItemKey`, `ELBOW_PAD_LEFT_WORKMAN: ItemKey`, `ELBOW_PAD_RIGHT: ItemKey`, `ELBOW_PAD_RIGHT_LEATHER: ItemKey`, `ELBOW_PAD_RIGHT_MILITARY: ItemKey`, `ELBOW_PAD_RIGHT_SPORT: ItemKey`, `ELBOW_PAD_RIGHT_TACTICAL: ItemKey`, `ELBOW_PAD_RIGHT_TINT: ItemKey`, `ELBOW_PAD_RIGHT_WORKMAN: ItemKey`, `FOOTBALL_JERSEY_BLACK: ItemKey`, `FOOTBALL_JERSEY_BLUE: ItemKey`, `FOOTBALL_JERSEY_WHITE: ItemKey`, `FRILLY_UNDERPANTS_BLACK: ItemKey`, `FRILLY_UNDERPANTS_PINK: ItemKey`, `FRILLY_UNDERPANTS_RED: ItemKey`, `F_HAIR_STUBBLE: ItemKey`, `GAITER_LEFT: ItemKey`, `GAITER_RIGHT: ItemKey`, `GARTER: ItemKey`, `GHILLIE_TOP: ItemKey`, `GHILLIE_TROUSERS: ItemKey`, `GLASSES: ItemKey`, `GLASSES_3D_GLASSES: ItemKey`, `GLASSES_70S_GOLD: ItemKey`, `GLASSES_AVIATORS: ItemKey`, `GLASSES_CATS_EYE: ItemKey`, `GLASSES_CATS_EYE_SUN: ItemKey`, `GLASSES_COSMETIC_70S_GOLD: ItemKey`, `GLASSES_COSMETIC_CATS_EYE: ItemKey`, `GLASSES_COSMETIC_HALF_MOON: ItemKey`, `GLASSES_COSMETIC_MONOCLE_LEFT: ItemKey`, `GLASSES_COSMETIC_MONOCLE_RIGHT: ItemKey`, `GLASSES_COSMETIC_NORMAL: ItemKey`, `GLASSES_COSMETIC_NORMAL_HORN_RIMMED: ItemKey`, `GLASSES_COSMETIC_ROUND_NORMAL: ItemKey`, `GLASSES_EYEPATCH_LEFT: ItemKey`, `GLASSES_EYEPATCH_RIGHT: ItemKey`, `GLASSES_GROUCHO: ItemKey`, `GLASSES_HALF_MOON: ItemKey`, `GLASSES_JACKIE_O: ItemKey`, `GLASSES_MACHO: ItemKey`, `GLASSES_MONOCLE_LEFT: ItemKey`, `GLASSES_MONOCLE_RIGHT: ItemKey`, `GLASSES_NEW_WAVE: ItemKey`, `GLASSES_NORMAL: ItemKey`, `GLASSES_NORMAL_HORN_RIMMED: ItemKey`, `GLASSES_NOVELTY_XRAY: ItemKey`, `GLASSES_OLD_WELDING_GOGGLES: ItemKey`, `GLASSES_PRESCRIPTION: ItemKey`, `GLASSES_PRESCRIPTION_AVIATORS: ItemKey`, `GLASSES_PRESCRIPTION_CATS_EYE_SUN: ItemKey`, `GLASSES_PRESCRIPTION_JACKIE_O: ItemKey`, `GLASSES_PRESCRIPTION_ROUND_SHADES: ItemKey`, `GLASSES_PRESCRIPTION_SHOOTING: ItemKey`, `GLASSES_PRESCRIPTION_SUN: ItemKey`, `GLASSES_READING: ItemKey`, `GLASSES_ROUND_HOLO_SKULLS: ItemKey`, `GLASSES_ROUND_NORMAL: ItemKey`, `GLASSES_ROUND_SHADES: ItemKey`, `GLASSES_SAFETY_GOGGLES: ItemKey`, `GLASSES_SHOOTING: ItemKey`, `GLASSES_SKI_GOGGLES: ItemKey`, `GLASSES_SUN: ItemKey`, `GLASSES_SUN_CHEAP: ItemKey`, `GLASSES_SWIMMING_GOGGLES: ItemKey`, `GLASSES_VENETIAN: ItemKey`, `GLOVES_BONE_GLOVES: ItemKey`, `GLOVES_BOXING_BLUE: ItemKey`, `GLOVES_BOXING_RED: ItemKey`, `GLOVES_BURLAP_WRAP: ItemKey`, `GLOVES_DENIM_WRAP: ItemKey`, `GLOVES_DISH: ItemKey`, `GLOVES_FINGERLESS_GLOVES: ItemKey`, `GLOVES_FINGERLESS_LEATHER_GLOVES: ItemKey`, `GLOVES_FINGERLESS_LEATHER_GLOVES_BLACK: ItemKey`, `GLOVES_FINGERLESS_LEATHER_GLOVES_BROWN: ItemKey`, `GLOVES_HUNTING_CAMO: ItemKey`, `GLOVES_ICE_HOCKEY_GLOVES: ItemKey`, `GLOVES_ICE_HOCKEY_GLOVES_BLACK: ItemKey`, `GLOVES_ICE_HOCKEY_GLOVES_BLUE: ItemKey`, `GLOVES_ICE_HOCKEY_GLOVES_WHITE: ItemKey`, `GLOVES_LEATHER_GLOVES: ItemKey`, `GLOVES_LEATHER_GLOVES_BLACK: ItemKey`, `GLOVES_LEATHER_GLOVES_BROWN: ItemKey`, `GLOVES_LEATHER_WRAP: ItemKey`, `GLOVES_LONG_WOMEN_GLOVES: ItemKey`, `GLOVES_METAL_ARMOUR: ItemKey`, `GLOVES_METAL_SCRAP_ARMOUR: ItemKey`, `GLOVES_RAG_WRAP: ItemKey`, `GLOVES_SURGICAL: ItemKey`, `GLOVES_TARP_WRAP: ItemKey`, `GLOVES_WHITE_TINT: ItemKey`, `GORGET_BURLAP: ItemKey`, `GORGET_DENIM: ItemKey`, `GORGET_LEATHER: ItemKey`, `GORGET_LEATHER_WRAP: ItemKey`, `GORGET_METAL: ItemKey`, `GORGET_RAG: ItemKey`, `GREAVE_BODY_ARMOUR_LEFT: ItemKey`, `GREAVE_BODY_ARMOUR_LEFT_ARMY: ItemKey`, `GREAVE_BODY_ARMOUR_LEFT_CIV: ItemKey`, `GREAVE_BODY_ARMOUR_LEFT_DESERT: ItemKey`, `GREAVE_BODY_ARMOUR_LEFT_POLICE: ItemKey`, `GREAVE_BODY_ARMOUR_LEFT_SWAT: ItemKey`, `GREAVE_BODY_ARMOUR_RIGHT: ItemKey`, `GREAVE_BODY_ARMOUR_RIGHT_ARMY: ItemKey`, `GREAVE_BODY_ARMOUR_RIGHT_CIV: ItemKey`, `GREAVE_BODY_ARMOUR_RIGHT_DESERT: ItemKey`, `GREAVE_BODY_ARMOUR_RIGHT_POLICE: ItemKey`, `GREAVE_BODY_ARMOUR_RIGHT_SWAT: ItemKey`, `GREAVE_BONE_LEFT: ItemKey`, `GREAVE_BONE_RIGHT: ItemKey`, `GREAVE_LEFT: ItemKey`, `GREAVE_MAGAZINE_LEFT: ItemKey`, `GREAVE_MAGAZINE_RIGHT: ItemKey`, `GREAVE_RIGHT: ItemKey`, `GREAVE_SCRAP_LEFT: ItemKey`, `GREAVE_SCRAP_RIGHT: ItemKey`, `GREAVE_SPIKE_LEFT: ItemKey`, `GREAVE_SPIKE_RIGHT: ItemKey`, `GREAVE_SPIKE_SCRAP_LEFT: ItemKey`, `GREAVE_SPIKE_SCRAP_RIGHT: ItemKey`, `GREAVE_TIRE_LEFT: ItemKey`, `GREAVE_TIRE_RIGHT: ItemKey`, `GREAVE_WOOD_LEFT: ItemKey`, `GREAVE_WOOD_RIGHT: ItemKey`, `HAT_ANTLERS: ItemKey`, `HAT_ARMY: ItemKey`, `HAT_ARMY_DESERT: ItemKey`, `HAT_ARMY_DESERT_NEW: ItemKey`, `HAT_ARMY_WWII: ItemKey`, `HAT_BALACLAVA_FACE: ItemKey`, `HAT_BALACLAVA_FULL: ItemKey`, `HAT_BANDANA: ItemKey`, `HAT_BANDANA_GREEN: ItemKey`, `HAT_BANDANA_MASK: ItemKey`, `HAT_BANDANA_MASK_GREEN: ItemKey`, `HAT_BANDANA_MASK_TINT: ItemKey`, `HAT_BANDANA_TIED: ItemKey`, `HAT_BANDANA_TIED_GREEN: ItemKey`, `HAT_BANDANA_TIED_TINT: ItemKey`, `HAT_BANDANA_TINT: ItemKey`, `HAT_BASEBALL_CAP: ItemKey`, `HAT_BASEBALL_CAP_3N: ItemKey`, `HAT_BASEBALL_CAP_3N_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_AMERICAN_EATS: ItemKey`, `HAT_BASEBALL_CAP_AMERICAN_EATS_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_AMERICAN_TIRE: ItemKey`, `HAT_BASEBALL_CAP_AMERICAN_TIRE_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_AMERIGLOBE_COM: ItemKey`, `HAT_BASEBALL_CAP_AMERIGLOBE_COM_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_ARMY: ItemKey`, `HAT_BASEBALL_CAP_ARMY_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_BLUE: ItemKey`, `HAT_BASEBALL_CAP_BLUE_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_BODY_CHISEL: ItemKey`, `HAT_BASEBALL_CAP_BODY_CHISEL_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_BOXPOP_BREWERY: ItemKey`, `HAT_BASEBALL_CAP_BOXPOP_BREWERY_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_FIRE_DEPT: ItemKey`, `HAT_BASEBALL_CAP_FIRE_DEPT_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_FOSSOIL: ItemKey`, `HAT_BASEBALL_CAP_FOSSOIL_02: ItemKey`, `HAT_BASEBALL_CAP_FOSSOIL_02_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_FOSSOIL_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_GAS2GO: ItemKey`, `HAT_BASEBALL_CAP_GAS2GO_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_GREEN: ItemKey`, `HAT_BASEBALL_CAP_GREEN_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_HUNTING_CAMO: ItemKey`, `HAT_BASEBALL_CAP_HUNTING_CAMO_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_JAYS_CHICKEN: ItemKey`, `HAT_BASEBALL_CAP_JAYS_CHICKEN_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_KNOX_DISTILLERY: ItemKey`, `HAT_BASEBALL_CAP_KNOX_DISTILLERY_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_KY: ItemKey`, `HAT_BASEBALL_CAP_KYTRANSIT: ItemKey`, `HAT_BASEBALL_CAP_KYTRANSIT_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_KY_RED: ItemKey`, `HAT_BASEBALL_CAP_KY_RED_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_KY_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_LBMW: ItemKey`, `HAT_BASEBALL_CAP_LBMW_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_LOUISVILLE_BRUISER: ItemKey`, `HAT_BASEBALL_CAP_LOUISVILLE_BRUISER_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_LSU: ItemKey`, `HAT_BASEBALL_CAP_LSU_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_MASS_GENFAC: ItemKey`, `HAT_BASEBALL_CAP_MASS_GENFAC_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_PIZZA_WHIRLED: ItemKey`, `HAT_BASEBALL_CAP_PIZZA_WHIRLED_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_POLICE: ItemKey`, `HAT_BASEBALL_CAP_POLICE_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_RED: ItemKey`, `HAT_BASEBALL_CAP_RED_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_SCARLET_OAK_DISTILLERY: ItemKey`, `HAT_BASEBALL_CAP_SCARLET_OAK_DISTILLERY_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_SHERIFF: ItemKey`, `HAT_BASEBALL_CAP_SHERIFF_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_SPIFFOS: ItemKey`, `HAT_BASEBALL_CAP_SPIFFOS_LOGO: ItemKey`, `HAT_BASEBALL_CAP_SPIFFOS_LOGO_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_SPIFFOS_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_SWAT: ItemKey`, `HAT_BASEBALL_CAP_SWAT_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_TINT: ItemKey`, `HAT_BASEBALL_CAP_TINT_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_USL: ItemKey`, `HAT_BASEBALL_CAP_USL_REVERSE: ItemKey`, `HAT_BASEBALL_CAP_WEST_MAPLE_COUNTRY_CLUB: ItemKey`, `HAT_BASEBALL_CAP_WEST_MAPLE_COUNTRY_CLUB_REVERSE: ItemKey`, `HAT_BASEBALL_HELMET: ItemKey`, `HAT_BASEBALL_HELMET_KY: ItemKey`, `HAT_BASEBALL_HELMET_RANGERS: ItemKey`, `HAT_BASEBALL_HELMET_Z: ItemKey`, `HAT_BEANY: ItemKey`, `HAT_BERET: ItemKey`, `HAT_BERET_ARMY: ItemKey`, `HAT_BICYCLE_HELMET: ItemKey`, `HAT_BONE_MASK: ItemKey`, `HAT_BONNIE_HAT: ItemKey`, `HAT_BONNIE_HAT_CAMO_GREEN: ItemKey`, `HAT_BONNIE_HAT_DESERT_CAMO: ItemKey`, `HAT_BONNIE_HAT_DESERT_CAMO_NEW: ItemKey`, `HAT_BONNIE_HAT_MILIUS_CAMO: ItemKey`, `HAT_BONNIE_HAT_OLIVE_DRAB: ItemKey`, `HAT_BONNIE_HAT_TIGER_STRIPE_CAMO: ItemKey`, `HAT_BOXING_BLUE: ItemKey`, `HAT_BOXING_RED: ItemKey`, `HAT_BUCKET_HAT: ItemKey`, `HAT_BUCKET_HAT_FISHING: ItemKey`, `HAT_BUILDERS_RESPIRATOR: ItemKey`, `HAT_BUILDERS_RESPIRATOR_NOFILTER: ItemKey`, `HAT_BUNNY_EARS_BLACK: ItemKey`, `HAT_BUNNY_EARS_WHITE: ItemKey`, `HAT_CHEF_HAT: ItemKey`, `HAT_COWBOY: ItemKey`, `HAT_COWBOY_ANGUS: ItemKey`, `HAT_COWBOY_BLACK: ItemKey`, `HAT_COWBOY_COW_HIDE: ItemKey`, `HAT_COWBOY_HOLSTEIN: ItemKey`, `HAT_COWBOY_PLASTIC: ItemKey`, `HAT_COWBOY_SIMMENTAL: ItemKey`, `HAT_COWBOY_WHITE: ItemKey`, `HAT_CRASH_HELMET: ItemKey`, `HAT_CRASH_HELMET_FULL: ItemKey`, `HAT_CRASH_HELMET_FULL_BLACK: ItemKey`, `HAT_CRASH_HELMET_FULL_BLACK_SPIKED: ItemKey`, `HAT_CRASH_HELMET_FULL_SPIKED: ItemKey`, `HAT_CRASH_HELMET_POLICE: ItemKey`, `HAT_CRASH_HELMET_STARS: ItemKey`, `HAT_DEER_HEADRESS: ItemKey`, `HAT_DUST_MASK: ItemKey`, `HAT_EAR_MUFFS: ItemKey`, `HAT_EAR_MUFF_PROTECTORS: ItemKey`, `HAT_FAST_FOOD: ItemKey`, `HAT_FAST_FOOD_ICE_CREAM: ItemKey`, `HAT_FAST_FOOD_SPIFFO: ItemKey`, `HAT_FEDORA: ItemKey`, `HAT_FEDORA_DELMONTE: ItemKey`, `HAT_FIREMAN: ItemKey`, `HAT_FISHERMAN_RAIN_HAT: ItemKey`, `HAT_FOOTBALL_HELMET: ItemKey`, `HAT_FOOTBALL_HELMET_BLUE: ItemKey`, `HAT_FOOTBALL_HELMET_RED: ItemKey`, `HAT_FOOTBALL_HELMET_WHITE: ItemKey`, `HAT_FURRY_EARS: ItemKey`, `HAT_GAS_MASK: ItemKey`, `HAT_GAS_MASK_NOFILTER: ItemKey`, `HAT_GOLD_STAR: ItemKey`, `HAT_GOLF_HAT: ItemKey`, `HAT_GOLF_HAT_TINT: ItemKey`, `HAT_HALLOWEEN_MASK_DEVIL: ItemKey`, `HAT_HALLOWEEN_MASK_MONSTER: ItemKey`, `HAT_HALLOWEEN_MASK_PUMPKIN: ItemKey`, `HAT_HALLOWEEN_MASK_SKELETON: ItemKey`, `HAT_HALLOWEEN_MASK_VAMPIRE: ItemKey`, `HAT_HALLOWEEN_MASK_WITCH: ItemKey`, `HAT_HARD_HAT: ItemKey`, `HAT_HARD_HAT_MINER: ItemKey`, `HAT_HEAD_MIRROR_DOWN: ItemKey`, `HAT_HEAD_MIRROR_UP: ItemKey`, `HAT_HEAD_SACK_BURLAP: ItemKey`, `HAT_HEAD_SACK_COTTON: ItemKey`, `HAT_HEAD_SACK_GARBAGE: ItemKey`, `HAT_HEAD_SACK_HIDE: ItemKey`, `HAT_HEAD_SACK_TARP: ItemKey`, `HAT_HIDE_HAT: ItemKey`, `HAT_HOCKEY_HELMET: ItemKey`, `HAT_HOCKEY_HELMET_TINT: ItemKey`, `HAT_HOCKEY_MASK: ItemKey`, `HAT_HOCKEY_MASK_COPPER: ItemKey`, `HAT_HOCKEY_MASK_GOLD: ItemKey`, `HAT_HOCKEY_MASK_HIDE: ItemKey`, `HAT_HOCKEY_MASK_METAL: ItemKey`, `HAT_HOCKEY_MASK_METAL_SCRAP: ItemKey`, `HAT_HOCKEY_MASK_SILVER: ItemKey`, `HAT_HOCKEY_MASK_WOOD: ItemKey`, `HAT_IMPROVISED_GAS_MASK: ItemKey`, `HAT_IMPROVISED_GAS_MASK_NOFILTER: ItemKey`, `HAT_JAY: ItemKey`, `HAT_JOCKEY_HELMET_01: ItemKey`, `HAT_JOCKEY_HELMET_02: ItemKey`, `HAT_JOCKEY_HELMET_03: ItemKey`, `HAT_JOCKEY_HELMET_04: ItemKey`, `HAT_JOCKEY_HELMET_05: ItemKey`, `HAT_JOCKEY_HELMET_06: ItemKey`, `HAT_JOKE_ARROW: ItemKey`, `HAT_JOKE_KNIFE: ItemKey`, `HAT_LEATHER_STRIP_TIED: ItemKey`, `HAT_METAL_HELMET: ItemKey`, `HAT_METAL_SCRAP_HELMET: ItemKey`, `HAT_NBCMASK: ItemKey`, `HAT_NBCMASK_NOFILTER: ItemKey`, `HAT_NEWSPAPER_HAT: ItemKey`, `HAT_PARTY_HAT_STARS: ItemKey`, `HAT_PARTY_HAT_TINT: ItemKey`, `HAT_PEAKED_CAP_ARMY: ItemKey`, `HAT_PEAKED_CAP_YACHT: ItemKey`, `HAT_PILGRIM: ItemKey`, `HAT_PIRATE: ItemKey`, `HAT_POLICE: ItemKey`, `HAT_POLICE_GREY: ItemKey`, `HAT_RACCOON: ItemKey`, `HAT_RAG_BANDANA: ItemKey`, `HAT_RAG_BANDANA_MASK: ItemKey`, `HAT_RAG_BANDANA_TIED: ItemKey`, `HAT_RANGER: ItemKey`, `HAT_RIDING_HELMET: ItemKey`, `HAT_RIOT_HELMET: ItemKey`, `HAT_SANTA_HAT: ItemKey`, `HAT_SANTA_HAT_GREEN: ItemKey`, `HAT_SHEMAGH_FACE: ItemKey`, `HAT_SHEMAGH_FACE_BURLAP: ItemKey`, `HAT_SHEMAGH_FACE_COTTON: ItemKey`, `HAT_SHEMAGH_FACE_GREEN: ItemKey`, `HAT_SHEMAGH_FULL: ItemKey`, `HAT_SHEMAGH_FULL_BURLAP: ItemKey`, `HAT_SHEMAGH_FULL_COTTON: ItemKey`, `HAT_SHEMAGH_FULL_GREEN: ItemKey`, `HAT_SHERIFF: ItemKey`, `HAT_SHOWER_CAP: ItemKey`, `HAT_SPHHELMET: ItemKey`, `HAT_SPIFFO: ItemKey`, `HAT_STOVEPIPE: ItemKey`, `HAT_STOVEPIPE_BLACK: ItemKey`, `HAT_STOVEPIPE_UNCLE_SAM: ItemKey`, `HAT_STRAW_HAT: ItemKey`, `HAT_SUMMER_FLOWER_HAT: ItemKey`, `HAT_SUMMER_HAT: ItemKey`, `HAT_SURGICAL_CAP: ItemKey`, `HAT_SURGICAL_MASK: ItemKey`, `HAT_SWAT: ItemKey`, `HAT_SWEATBAND: ItemKey`, `HAT_TARP_HAT: ItemKey`, `HAT_TIN_FOIL_HAT: ItemKey`, `HAT_VISOR_BLACK: ItemKey`, `HAT_VISOR_RED: ItemKey`, `HAT_VISOR_WHITE_TINT: ItemKey`, `HAT_WEDDING_VEIL: ItemKey`, `HAT_WINTER_HAT: ItemKey`, `HAT_WINTER_HAT_SHEEP_SKIN: ItemKey`, `HAT_WITCH: ItemKey`, `HAT_WIZARD: ItemKey`, `HAT_WOOLY_HAT: ItemKey`, `HAZMAT_SUIT: ItemKey`, `HOLSTER_ANKLE: ItemKey`, `HOLSTER_DOUBLE: ItemKey`, `HOLSTER_DUCT_TAPE: ItemKey`, `HOLSTER_HIDE: ItemKey`, `HOLSTER_SIMPLE: ItemKey`, `HOLSTER_SIMPLE_BLACK: ItemKey`, `HOLSTER_SIMPLE_BROWN: ItemKey`, `HOLSTER_SIMPLE_GREEN: ItemKey`, `HOODIE_DOWN_WHITE_TINT: ItemKey`, `HOODIE_HIDE_DOWN: ItemKey`, `HOODIE_HIDE_UP: ItemKey`, `HOODIE_HUNTING_CAMO_DOWN: ItemKey`, `HOODIE_HUNTING_CAMO_UP: ItemKey`, `HOODIE_UP_WHITE_TINT: ItemKey`, `HOSPITAL_GOWN: ItemKey`, `ICE_HOCKEY_JERSEY_BLACK: ItemKey`, `ICE_HOCKEY_JERSEY_BLUE_UNI: ItemKey`, `ICE_HOCKEY_JERSEY_RED: ItemKey`, `ICE_HOCKEY_JERSEY_WHITE: ItemKey`, `ICE_HOCKEY_NECK_GUARD: ItemKey`, `JACKET_ANGUS_CALF_HIDE: ItemKey`, `JACKET_ANGUS_HIDE: ItemKey`, `JACKET_ARMY_CAMO_DESERT: ItemKey`, `JACKET_ARMY_CAMO_DESERT_NEW: ItemKey`, `JACKET_ARMY_CAMO_GREEN: ItemKey`, `JACKET_ARMY_CAMO_MILIUS: ItemKey`, `JACKET_ARMY_CAMO_TIGER_STRIPE: ItemKey`, `JACKET_ARMY_CAMO_URBAN: ItemKey`, `JACKET_ARMY_OLIVE_DRAB: ItemKey`, `JACKET_BLACK: ItemKey`, `JACKET_CHEF: ItemKey`, `JACKET_COAT_ARMY: ItemKey`, `JACKET_COW_HIDE: ItemKey`, `JACKET_DEER_HIDE: ItemKey`, `JACKET_FIREMAN: ItemKey`, `JACKET_HIDE: ItemKey`, `JACKET_HOLSTEIN_CALF_HIDE: ItemKey`, `JACKET_HOLSTEIN_HIDE: ItemKey`, `JACKET_HUNTING_CAMO: ItemKey`, `JACKET_LEATHER: ItemKey`, `JACKET_LEATHER_BARREL_DOGS: ItemKey`, `JACKET_LEATHER_BLACK: ItemKey`, `JACKET_LEATHER_BROWN: ItemKey`, `JACKET_LEATHER_IRON_RODENT: ItemKey`, `JACKET_LEATHER_PUNK: ItemKey`, `JACKET_LEATHER_WILD_RACOONS: ItemKey`, `JACKET_LONG_ANGUS_CALF_HIDE: ItemKey`, `JACKET_LONG_ANGUS_HIDE: ItemKey`, `JACKET_LONG_BLACK: ItemKey`, `JACKET_LONG_COW_HIDE: ItemKey`, `JACKET_LONG_DOCTOR: ItemKey`, `JACKET_LONG_HIDE: ItemKey`, `JACKET_LONG_HOLSTEIN_CALF_HIDE: ItemKey`, `JACKET_LONG_HOLSTEIN_HIDE: ItemKey`, `JACKET_LONG_RANDOM: ItemKey`, `JACKET_LONG_SANTA: ItemKey`, `JACKET_LONG_SANTA_GREEN: ItemKey`, `JACKET_LONG_SHEEP_SKIN: ItemKey`, `JACKET_LONG_SIMMENTAL_CALF_HIDE: ItemKey`, `JACKET_LONG_SIMMENTAL_HIDE: ItemKey`, `JACKET_NAVY_BLUE: ItemKey`, `JACKET_PADDED: ItemKey`, `JACKET_PADDED_DOWN: ItemKey`, `JACKET_PADDED_HUNTING_CAMO: ItemKey`, `JACKET_PADDED_HUNTING_CAMO_DOWN: ItemKey`, `JACKET_POLICE: ItemKey`, `JACKET_RANGER: ItemKey`, `JACKET_SHEEP_SKIN: ItemKey`, `JACKET_SHELLSUIT_BLACK: ItemKey`, `JACKET_SHELLSUIT_BLUE: ItemKey`, `JACKET_SHELLSUIT_GREEN: ItemKey`, `JACKET_SHELLSUIT_PINK: ItemKey`, `JACKET_SHELLSUIT_TEAL: ItemKey`, `JACKET_SHELLSUIT_TINT: ItemKey`, `JACKET_SHERIFF: ItemKey`, `JACKET_SIMMENTAL_CALF_HIDE: ItemKey`, `JACKET_SIMMENTAL_HIDE: ItemKey`, `JACKET_VARSITY: ItemKey`, `JACKET_WHITE_TINT: ItemKey`, `JUMPER_DIAMOND_PATTERN_TINT: ItemKey`, `JUMPER_POLO_NECK: ItemKey`, `JUMPER_ROUND_NECK: ItemKey`, `JUMPER_TANK_TOP_DIAMOND_TINT: ItemKey`, `JUMPER_TANK_TOP_TINT: ItemKey`, `JUMPER_VNECK: ItemKey`, `KNAPSACK_SPRAYER: ItemKey`, `KNAPSACK_SPRAYER_STOWED: ItemKey`, `KNEEPAD_LEFT: ItemKey`, `KNEEPAD_LEFT_LEATHER: ItemKey`, `KNEEPAD_LEFT_MILITARY: ItemKey`, `KNEEPAD_LEFT_SPORT: ItemKey`, `KNEEPAD_LEFT_TACTICAL: ItemKey`, `KNEEPAD_LEFT_TINT: ItemKey`, `KNEEPAD_LEFT_WORKMAN: ItemKey`, `KNEEPAD_RIGHT: ItemKey`, `KNEEPAD_RIGHT_LEATHER: ItemKey`, `KNEEPAD_RIGHT_MILITARY: ItemKey`, `KNEEPAD_RIGHT_SPORT: ItemKey`, `KNEEPAD_RIGHT_TACTICAL: ItemKey`, `KNEEPAD_RIGHT_TINT: ItemKey`, `KNEEPAD_RIGHT_WORKMAN: ItemKey`, `LOCKET: ItemKey`, `LONG_COAT_BATHROBE: ItemKey`, `LONG_COAT_HIDE: ItemKey`, `LONG_JOHNS: ItemKey`, `LONG_JOHNS_BOTTOMS: ItemKey`, `LONG_JOHNS_BOTTOMS_CRAFTED_BURLAP: ItemKey`, `LONG_JOHNS_BOTTOMS_CRAFTED_COTTON: ItemKey`, `LONG_JOHNS_CRAFTED_BURLAP: ItemKey`, `LONG_JOHNS_CRAFTED_COTTON: ItemKey`, `MAKE_UP_BRAVE_HEART: ItemKey`, `MAKE_UP_CAMO_EYES_1: ItemKey`, `MAKE_UP_CAMO_EYES_2: ItemKey`, `MAKE_UP_CAMO_FULL_FACE_1: ItemKey`, `MAKE_UP_CAMO_FULL_FACE_2: ItemKey`, `MAKE_UP_CAMO_STRIPES: ItemKey`, `MAKE_UP_CLOWN_FACE_1: ItemKey`, `MAKE_UP_CLOWN_FACE_2: ItemKey`, `MAKE_UP_CROW: ItemKey`, `MAKE_UP_EYES_SHADOW_BLUE: ItemKey`, `MAKE_UP_EYES_SHADOW_GREEN: ItemKey`, `MAKE_UP_EYES_SHADOW_LIGHT_BLUE: ItemKey`, `MAKE_UP_EYES_SHADOW_PINK: ItemKey`, `MAKE_UP_EYES_SHADOW_RED: ItemKey`, `MAKE_UP_EYES_SHADOW_WHITE: ItemKey`, `MAKE_UP_EYES_SHADOW_YELLOW: ItemKey`, `MAKE_UP_FOOTBALL: ItemKey`, `MAKE_UP_LIPS_BLACK: ItemKey`, `MAKE_UP_LIPS_BLUE: ItemKey`, `MAKE_UP_LIPS_GREEN: ItemKey`, `MAKE_UP_LIPS_LIGHT_BLUE: ItemKey`, `MAKE_UP_LIPS_PINK: ItemKey`, `MAKE_UP_LIPS_RED: ItemKey`, `MAKE_UP_RED_STRIPES_1: ItemKey`, `MAKE_UP_RED_STRIPES_2: ItemKey`, `MAKE_UP_SKULL_FACE_1: ItemKey`, `MAKE_UP_SKULL_FACE_2: ItemKey`, `MEDAL_BRONZE: ItemKey`, `MEDAL_GOLD: ItemKey`, `MEDAL_SILVER: ItemKey`, `M_BEARD_STUBBLE: ItemKey`, `M_HAIR_STUBBLE: ItemKey`, `NECKLACE_BOAR_TUSK: ItemKey`, `NECKLACE_BOAR_TUSK_MULTI: ItemKey`, `NECKLACE_CHOKER: ItemKey`, `NECKLACE_CHOKER_AMBER: ItemKey`, `NECKLACE_CHOKER_BONE: ItemKey`, `NECKLACE_CHOKER_DIAMOND: ItemKey`, `NECKLACE_CHOKER_SAPPHIRE: ItemKey`, `NECKLACE_CRUCIFIX: ItemKey`, `NECKLACE_DOG_TAG: ItemKey`, `NECKLACE_DOG_TAG_FEMALE: ItemKey`, `NECKLACE_DOG_TAG_MALE: ItemKey`, `NECKLACE_GOLD: ItemKey`, `NECKLACE_GOLD_DIAMOND: ItemKey`, `NECKLACE_GOLD_RUBY: ItemKey`, `NECKLACE_LONG_AMBER: ItemKey`, `NECKLACE_LONG_GOLD: ItemKey`, `NECKLACE_LONG_GOLD_DIAMOND: ItemKey`, `NECKLACE_LONG_SILVER: ItemKey`, `NECKLACE_LONG_SILVER_DIAMOND: ItemKey`, `NECKLACE_LONG_SILVER_EMERALD: ItemKey`, `NECKLACE_LONG_SILVER_SAPPHIRE: ItemKey`, `NECKLACE_LONG_SKULL_MAMMAL: ItemKey`, `NECKLACE_LONG_SKULL_MAMMAL_MULTI: ItemKey`, `NECKLACE_LONG_SKULL_SMALL: ItemKey`, `NECKLACE_LONG_SKULL_SMALL_MULTI: ItemKey`, `NECKLACE_LONG_TEETH: ItemKey`, `NECKLACE_PEARL: ItemKey`, `NECKLACE_SILVER: ItemKey`, `NECKLACE_SILVER_CRUCIFIX: ItemKey`, `NECKLACE_SILVER_DIAMOND: ItemKey`, `NECKLACE_SILVER_SAPPHIRE: ItemKey`, `NECKLACE_SKULL_MAMMAL: ItemKey`, `NECKLACE_SKULL_MAMMAL_MULTI: ItemKey`, `NECKLACE_SKULL_SMALL: ItemKey`, `NECKLACE_SKULL_SMALL_MULTI: ItemKey`, `NECKLACE_TEETH: ItemKey`, `NECKLACE_YING_YANG: ItemKey`, `NOSE_RING_GOLD: ItemKey`, `NOSE_RING_SILVER: ItemKey`, `NOSE_STUD_GOLD: ItemKey`, `NOSE_STUD_SILVER: ItemKey`, `PONCHO_GARBAGE_BAG: ItemKey`, `PONCHO_GARBAGE_BAG_DOWN: ItemKey`, `PONCHO_GREEN: ItemKey`, `PONCHO_GREEN_DOWN: ItemKey`, `PONCHO_TARP: ItemKey`, `PONCHO_TARP_DOWN: ItemKey`, `PONCHO_YELLOW: ItemKey`, `PONCHO_YELLOW_DOWN: ItemKey`, `RING_LEFT_MIDDLE_FINGER_GOLD: ItemKey`, `RING_LEFT_MIDDLE_FINGER_GOLD_DIAMOND: ItemKey`, `RING_LEFT_MIDDLE_FINGER_GOLD_RUBY: ItemKey`, `RING_LEFT_MIDDLE_FINGER_SIGNET: ItemKey`, `RING_LEFT_MIDDLE_FINGER_SILVER: ItemKey`, `RING_LEFT_MIDDLE_FINGER_SILVER_DIAMOND: ItemKey`, `RING_LEFT_RING_FINGER_GOLD: ItemKey`, `RING_LEFT_RING_FINGER_GOLD_DIAMOND: ItemKey`, `RING_LEFT_RING_FINGER_GOLD_RUBY: ItemKey`, `RING_LEFT_RING_FINGER_SIGNET: ItemKey`, `RING_LEFT_RING_FINGER_SILVER: ItemKey`, `RING_LEFT_RING_FINGER_SILVER_DIAMOND: ItemKey`, `RING_RIGHT_MIDDLE_FINGER_GOLD: ItemKey`, `RING_RIGHT_MIDDLE_FINGER_GOLD_DIAMOND: ItemKey`, `RING_RIGHT_MIDDLE_FINGER_GOLD_RUBY: ItemKey`, `RING_RIGHT_MIDDLE_FINGER_SIGNET: ItemKey`, `RING_RIGHT_MIDDLE_FINGER_SILVER: ItemKey`, `RING_RIGHT_MIDDLE_FINGER_SILVER_DIAMOND: ItemKey`, `RING_RIGHT_RING_FINGER_GOLD: ItemKey`, `RING_RIGHT_RING_FINGER_GOLD_DIAMOND: ItemKey`, `RING_RIGHT_RING_FINGER_GOLD_RUBY: ItemKey`, `RING_RIGHT_RING_FINGER_SIGNET: ItemKey`, `RING_RIGHT_RING_FINGER_SILVER: ItemKey`, `RING_RIGHT_RING_FINGER_SILVER_DIAMOND: ItemKey`, `ROPE_BELT: ItemKey`, `SCARF_STRIPE_BLACK_WHITE: ItemKey`, `SCARF_STRIPE_BLUE_WHITE: ItemKey`, `SCARF_STRIPE_RED_WHITE: ItemKey`, `SCARF_WHITE: ItemKey`, `SCBA: ItemKey`, `SCBA_NOTANK: ItemKey`, `SHEMAGH_SCARF: ItemKey`, `SHEMAGH_SCARF_FACE: ItemKey`, `SHEMAGH_SCARF_FACE_GREEN: ItemKey`, `SHEMAGH_SCARF_GREEN: ItemKey`, `SHINPAD_HOCKEY_GOALIE_L: ItemKey`, `SHINPAD_HOCKEY_GOALIE_L_BLUE: ItemKey`, `SHINPAD_HOCKEY_GOALIE_L_RED: ItemKey`, `SHINPAD_HOCKEY_GOALIE_L_WHITE: ItemKey`, `SHINPAD_HOCKEY_GOALIE_R: ItemKey`, `SHINPAD_HOCKEY_GOALIE_R_BLUE: ItemKey`, `SHINPAD_HOCKEY_GOALIE_R_RED: ItemKey`, `SHINPAD_HOCKEY_GOALIE_R_WHITE: ItemKey`, `SHINPAD_L: ItemKey`, `SHINPAD_L_BLUE: ItemKey`, `SHINPAD_L_RIGID: ItemKey`, `SHINPAD_L_WHITE: ItemKey`, `SHINPAD_R: ItemKey`, `SHINPAD_R_BLUE: ItemKey`, `SHINPAD_R_RIGID: ItemKey`, `SHINPAD_R_WHITE: ItemKey`, `SHIN_KNEE_GUARD_L: ItemKey`, `SHIN_KNEE_GUARD_L_BASEBALL: ItemKey`, `SHIN_KNEE_GUARD_L_ICE_HOCKEY: ItemKey`, `SHIN_KNEE_GUARD_L_METAL: ItemKey`, `SHIN_KNEE_GUARD_L_PROTECTIVE: ItemKey`, `SHIN_KNEE_GUARD_L_TINT: ItemKey`, `SHIN_KNEE_GUARD_R: ItemKey`, `SHIN_KNEE_GUARD_R_BASEBALL: ItemKey`, `SHIN_KNEE_GUARD_R_ICE_HOCKEY: ItemKey`, `SHIN_KNEE_GUARD_R_METAL: ItemKey`, `SHIN_KNEE_GUARD_R_PROTECTIVE: ItemKey`, `SHIN_KNEE_GUARD_R_TINT: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_L: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_L_BASEBALL: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_L_ICE_HOCKEY: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_L_METAL: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_L_PROTECTIVE: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_R: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_R_BASEBALL: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_R_ICE_HOCKEY: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_R_METAL: ItemKey`, `SHIN_KNEE_GUARD_SPIKE_R_PROTECTIVE: ItemKey`, `SHIRT_BASEBALL_KY: ItemKey`, `SHIRT_BASEBALL_RANGERS: ItemKey`, `SHIRT_BASEBALL_Z: ItemKey`, `SHIRT_BOWLING_BLUE: ItemKey`, `SHIRT_BOWLING_BROWN: ItemKey`, `SHIRT_BOWLING_GREEN: ItemKey`, `SHIRT_BOWLING_LIME_GREEN: ItemKey`, `SHIRT_BOWLING_PINK: ItemKey`, `SHIRT_BOWLING_WHITE: ItemKey`, `SHIRT_CAMO_DESERT: ItemKey`, `SHIRT_CAMO_DESERT_NEW: ItemKey`, `SHIRT_CAMO_GREEN: ItemKey`, `SHIRT_CAMO_MILIUS: ItemKey`, `SHIRT_CAMO_TIGER_STRIPE: ItemKey`, `SHIRT_CAMO_URBAN: ItemKey`, `SHIRT_CRAFTED_BURLAP: ItemKey`, `SHIRT_CRAFTED_COTTON: ItemKey`, `SHIRT_CRAFTED_DENIM: ItemKey`, `SHIRT_CRAFTED_DENIM_BLACK: ItemKey`, `SHIRT_CRAFTED_DENIM_LIGHT: ItemKey`, `SHIRT_CRAFTED_DENIM_RANDOM: ItemKey`, `SHIRT_CROP_TOP_NO_ARM_TINT: ItemKey`, `SHIRT_CROP_TOP_TINT: ItemKey`, `SHIRT_DENIM: ItemKey`, `SHIRT_FORMAL_TINT: ItemKey`, `SHIRT_FORMAL_WHITE: ItemKey`, `SHIRT_FORMAL_WHITE_SHORT_SLEEVE: ItemKey`, `SHIRT_FORMAL_WHITE_SHORT_SLEEVE_TINT: ItemKey`, `SHIRT_HAWAIIAN_RED: ItemKey`, `SHIRT_HAWAIIAN_TINT: ItemKey`, `SHIRT_JOCKEY_01: ItemKey`, `SHIRT_JOCKEY_02: ItemKey`, `SHIRT_JOCKEY_03: ItemKey`, `SHIRT_JOCKEY_04: ItemKey`, `SHIRT_JOCKEY_05: ItemKey`, `SHIRT_JOCKEY_06: ItemKey`, `SHIRT_LUMBERJACK: ItemKey`, `SHIRT_LUMBERJACK_GREEN: ItemKey`, `SHIRT_LUMBERJACK_TINT: ItemKey`, `SHIRT_NO_SLEEVES_CRAFTED_BURLAP: ItemKey`, `SHIRT_NO_SLEEVES_CRAFTED_COTTON: ItemKey`, `SHIRT_NO_SLEEVES_CRAFTED_DENIM: ItemKey`, `SHIRT_NO_SLEEVES_CRAFTED_DENIM_BLACK: ItemKey`, `SHIRT_NO_SLEEVES_CRAFTED_DENIM_LIGHT: ItemKey`, `SHIRT_OFFICER_WHITE: ItemKey`, `SHIRT_OLIVE_DRAB: ItemKey`, `SHIRT_POLICE_BLUE: ItemKey`, `SHIRT_POLICE_GREY: ItemKey`, `SHIRT_PRIEST: ItemKey`, `SHIRT_PRISON_GUARD: ItemKey`, `SHIRT_RANGER: ItemKey`, `SHIRT_SCRUBS: ItemKey`, `SHIRT_SHERIFF: ItemKey`, `SHIRT_WORKMAN: ItemKey`, `SHOES_ARMY_BOOTS: ItemKey`, `SHOES_ARMY_BOOTS_DESERT: ItemKey`, `SHOES_BLACK: ItemKey`, `SHOES_BLACK_BOOTS: ItemKey`, `SHOES_BLUE_TRAINERS: ItemKey`, `SHOES_BOWLING: ItemKey`, `SHOES_BROWN: ItemKey`, `SHOES_BURLAP_WRAP: ItemKey`, `SHOES_COWBOY_BOOTS: ItemKey`, `SHOES_COWBOY_BOOTS_BLACK: ItemKey`, `SHOES_COWBOY_BOOTS_BROWN: ItemKey`, `SHOES_COWBOY_BOOTS_FANCY: ItemKey`, `SHOES_COWBOY_BOOTS_SNAKE_SKIN: ItemKey`, `SHOES_CRUDE_LEATHER_FOOTWEAR: ItemKey`, `SHOES_DENIM_WRAP: ItemKey`, `SHOES_FANCY: ItemKey`, `SHOES_FLIP_FLOP: ItemKey`, `SHOES_HIDE_BOOTS: ItemKey`, `SHOES_HIKING_BOOTS: ItemKey`, `SHOES_LEATHER_WRAP: ItemKey`, `SHOES_RAG_WRAP: ItemKey`, `SHOES_RANDOM: ItemKey`, `SHOES_RED_TRAINERS: ItemKey`, `SHOES_RIDING_BOOTS: ItemKey`, `SHOES_SANDALS: ItemKey`, `SHOES_SLIPPERS: ItemKey`, `SHOES_STRAPPED: ItemKey`, `SHOES_TARP_WRAP: ItemKey`, `SHOES_TIRE_SANDALS: ItemKey`, `SHOES_TRAINER_TINT: ItemKey`, `SHOES_TWINE: ItemKey`, `SHOES_WELLIES: ItemKey`, `SHOES_WORK_BOOTS: ItemKey`, `SHORTS_BOXING_BLUE: ItemKey`, `SHORTS_BOXING_RED: ItemKey`, `SHORTS_CAMO_DESERT_NEW_LONG: ItemKey`, `SHORTS_CAMO_GREEN_LONG: ItemKey`, `SHORTS_CAMO_MILIUS_LONG: ItemKey`, `SHORTS_CAMO_TIGER_STRIPE_LONG: ItemKey`, `SHORTS_CAMO_URBAN_LONG: ItemKey`, `SHORTS_FOOTBALL_PANTS: ItemKey`, `SHORTS_FOOTBALL_PANTS_BLACK: ItemKey`, `SHORTS_FOOTBALL_PANTS_GOLD: ItemKey`, `SHORTS_FOOTBALL_PANTS_WHITE: ItemKey`, `SHORTS_HOCKEY_PANTS: ItemKey`, `SHORTS_HOCKEY_PANTS_BLACK: ItemKey`, `SHORTS_HOCKEY_PANTS_RED: ItemKey`, `SHORTS_HOCKEY_PANTS_UNI_BLUE: ItemKey`, `SHORTS_HOCKEY_PANTS_WHITE: ItemKey`, `SHORTS_LONG_DENIM: ItemKey`, `SHORTS_LONG_DENIM_PUNK: ItemKey`, `SHORTS_LONG_SPORT: ItemKey`, `SHORTS_LONG_SPORT_RED: ItemKey`, `SHORTS_OLIVE_DRAB_LONG: ItemKey`, `SHORTS_SHORT_DENIM: ItemKey`, `SHORTS_SHORT_FORMAL: ItemKey`, `SHORTS_SHORT_SPORT: ItemKey`, `SHOULDERPADS_FOOTBALL: ItemKey`, `SHOULDERPADS_FOOTBALL_ON_TOP: ItemKey`, `SHOULDERPADS_FOOTBALL_ON_TOP_SPIKED: ItemKey`, `SHOULDERPADS_ICE_HOCKEY: ItemKey`, `SHOULDERPADS_ICE_HOCKEY_ON_TOP: ItemKey`, `SHOULDERPAD_ARTICULATED_L_METAL: ItemKey`, `SHOULDERPAD_ARTICULATED_R_METAL: ItemKey`, `SHOULDERPAD_ARTICULATED_SPIKE_L: ItemKey`, `SHOULDERPAD_ARTICULATED_SPIKE_R: ItemKey`, `SHOULDERPAD_BONE_L: ItemKey`, `SHOULDERPAD_BONE_R: ItemKey`, `SHOULDERPAD_FOOTBALL_L: ItemKey`, `SHOULDERPAD_FOOTBALL_R: ItemKey`, `SHOULDERPAD_FOOTBALL_SPIKED_L: ItemKey`, `SHOULDERPAD_FOOTBALL_SPIKED_R: ItemKey`, `SHOULDERPAD_METAL_L: ItemKey`, `SHOULDERPAD_METAL_R: ItemKey`, `SHOULDERPAD_METAL_SCRAP_L: ItemKey`, `SHOULDERPAD_METAL_SCRAP_R: ItemKey`, `SHOULDERPAD_METAL_SPIKE_L: ItemKey`, `SHOULDERPAD_METAL_SPIKE_R: ItemKey`, `SHOULDERPAD_METAL_SPIKE_SCRAP_L: ItemKey`, `SHOULDERPAD_METAL_SPIKE_SCRAP_R: ItemKey`, `SHOULDERPAD_TIRE_L: ItemKey`, `SHOULDERPAD_TIRE_R: ItemKey`, `SHOULDERPAD_WOOD_L: ItemKey`, `SHOULDERPAD_WOOD_R: ItemKey`, `SKIRT_KNEES: ItemKey`, `SKIRT_KNEES_CRAFTED_BURLAP: ItemKey`, `SKIRT_KNEES_CRAFTED_COTTON: ItemKey`, `SKIRT_KNEES_CRAFTED_DENIM: ItemKey`, `SKIRT_KNEES_CRAFTED_DENIM_BLACK: ItemKey`, `SKIRT_KNEES_CRAFTED_DENIM_LIGHT: ItemKey`, `SKIRT_KNEES_DEER_HIDE: ItemKey`, `SKIRT_KNEES_GARBAGE: ItemKey`, `SKIRT_KNEES_HIDE: ItemKey`, `SKIRT_KNEES_TARP: ItemKey`, `SKIRT_LONG: ItemKey`, `SKIRT_LONG_CRAFTED_BURLAP: ItemKey`, `SKIRT_LONG_CRAFTED_COTTON: ItemKey`, `SKIRT_LONG_CRAFTED_DENIM: ItemKey`, `SKIRT_LONG_CRAFTED_DENIM_BLACK: ItemKey`, `SKIRT_LONG_CRAFTED_DENIM_LIGHT: ItemKey`, `SKIRT_LONG_GARBAGE: ItemKey`, `SKIRT_LONG_HIDE: ItemKey`, `SKIRT_LONG_TARP: ItemKey`, `SKIRT_MINI: ItemKey`, `SKIRT_NORMAL: ItemKey`, `SKIRT_NORMAL_GARBAGE: ItemKey`, `SKIRT_NORMAL_HIDE: ItemKey`, `SKIRT_NORMAL_TARP: ItemKey`, `SKIRT_SHORT: ItemKey`, `SKIRT_SHORT_FAUN_HIDE: ItemKey`, `SKIRT_SHORT_GARBAGE: ItemKey`, `SKIRT_SHORT_HIDE: ItemKey`, `SKIRT_SHORT_TARP: ItemKey`, `SOCKS_ANKLE: ItemKey`, `SOCKS_ANKLE_BLACK: ItemKey`, `SOCKS_ANKLE_WHITE: ItemKey`, `SOCKS_HEAVY: ItemKey`, `SOCKS_LEG_WARMERS: ItemKey`, `SOCKS_LONG: ItemKey`, `SOCKS_LONG_BLACK: ItemKey`, `SOCKS_LONG_WHITE: ItemKey`, `SPIFFO_SUIT: ItemKey`, `SPIFFO_TAIL: ItemKey`, `STOCKINGS_BLACK: ItemKey`, `STOCKINGS_BLACK_SEMI_TRANS: ItemKey`, `STOCKINGS_BLACK_TRANS: ItemKey`, `STOCKINGS_WHITE: ItemKey`, `SUIT_JACKET: ItemKey`, `SUIT_JACKET_TINT: ItemKey`, `SUIT_JACKET_WHITE: ItemKey`, `SWIMSUIT_TINT: ItemKey`, `SWIM_TRUNKS_BLUE: ItemKey`, `SWIM_TRUNKS_GREEN: ItemKey`, `SWIM_TRUNKS_RED: ItemKey`, `SWIM_TRUNKS_YELLOW: ItemKey`, `THIGH_ARTIC_METAL_L: ItemKey`, `THIGH_ARTIC_METAL_R: ItemKey`, `THIGH_BODY_ARMOUR_L: ItemKey`, `THIGH_BODY_ARMOUR_L_ARMY: ItemKey`, `THIGH_BODY_ARMOUR_L_CIV: ItemKey`, `THIGH_BODY_ARMOUR_L_DESERT: ItemKey`, `THIGH_BODY_ARMOUR_L_POLICE: ItemKey`, `THIGH_BODY_ARMOUR_L_SWAT: ItemKey`, `THIGH_BODY_ARMOUR_R: ItemKey`, `THIGH_BODY_ARMOUR_R_ARMY: ItemKey`, `THIGH_BODY_ARMOUR_R_CIV: ItemKey`, `THIGH_BODY_ARMOUR_R_DESERT: ItemKey`, `THIGH_BODY_ARMOUR_R_POLICE: ItemKey`, `THIGH_BODY_ARMOUR_R_SWAT: ItemKey`, `THIGH_BONE_L: ItemKey`, `THIGH_BONE_R: ItemKey`, `THIGH_MAGAZINE_L: ItemKey`, `THIGH_MAGAZINE_R: ItemKey`, `THIGH_METAL_L: ItemKey`, `THIGH_METAL_R: ItemKey`, `THIGH_METAL_SPIKE_L: ItemKey`, `THIGH_METAL_SPIKE_R: ItemKey`, `THIGH_PROTECTIVE_L: ItemKey`, `THIGH_PROTECTIVE_R: ItemKey`, `THIGH_SCRAP_METAL_L: ItemKey`, `THIGH_SCRAP_METAL_R: ItemKey`, `THIGH_SCRAP_METAL_SPIKE_L: ItemKey`, `THIGH_SCRAP_METAL_SPIKE_R: ItemKey`, `THIGH_TIRE_L: ItemKey`, `THIGH_TIRE_R: ItemKey`, `THIGH_WOOD_L: ItemKey`, `THIGH_WOOD_R: ItemKey`, `TIE_BOW_TIE_FULL: ItemKey`, `TIE_BOW_TIE_WORN: ItemKey`, `TIE_FULL: ItemKey`, `TIE_FULL_SPIFFO: ItemKey`, `TIE_WORN: ItemKey`, `TIE_WORN_SPIFFO: ItemKey`, `TIGHTS_BLACK: ItemKey`, `TIGHTS_BLACK_SEMI_TRANS: ItemKey`, `TIGHTS_BLACK_TRANS: ItemKey`, `TIGHTS_FISHNETS: ItemKey`, `TROUSERS: ItemKey`, `TROUSERS_ARMY_SERVICE: ItemKey`, `TROUSERS_BLACK: ItemKey`, `TROUSERS_CAMO_DESERT: ItemKey`, `TROUSERS_CAMO_DESERT_NEW: ItemKey`, `TROUSERS_CAMO_GREEN: ItemKey`, `TROUSERS_CAMO_MILIUS: ItemKey`, `TROUSERS_CAMO_TIGER_STRIPE: ItemKey`, `TROUSERS_CAMO_URBAN: ItemKey`, `TROUSERS_CHEF: ItemKey`, `TROUSERS_CRAFTED_BURLAP: ItemKey`, `TROUSERS_CRAFTED_COTTON: ItemKey`, `TROUSERS_CRAFTED_DENIM: ItemKey`, `TROUSERS_CRAFTED_DENIM_BLACK: ItemKey`, `TROUSERS_CRAFTED_DENIM_LIGHT: ItemKey`, `TROUSERS_CRAFTED_DENIM_RANDOM: ItemKey`, `TROUSERS_DEER_HIDE: ItemKey`, `TROUSERS_DEFAULT_TEXTURE: ItemKey`, `TROUSERS_DEFAULT_TEXTURE_HUE: ItemKey`, `TROUSERS_DEFAULT_TEXTURE_TINT: ItemKey`, `TROUSERS_DENIM: ItemKey`, `TROUSERS_DENIM_PUNK: ItemKey`, `TROUSERS_FAUN_HIDE: ItemKey`, `TROUSERS_FIREMAN: ItemKey`, `TROUSERS_HIDE: ItemKey`, `TROUSERS_HUNTING_CAMO: ItemKey`, `TROUSERS_JEAN_BAGGY: ItemKey`, `TROUSERS_JEAN_BAGGY_PUNK: ItemKey`, `TROUSERS_LEATHER_BLACK: ItemKey`, `TROUSERS_LEATHER_CRAFTED: ItemKey`, `TROUSERS_MESH_DENIM_LIGHT: ItemKey`, `TROUSERS_MESH_LEATHER: ItemKey`, `TROUSERS_NAVY_BLUE: ItemKey`, `TROUSERS_OLIVE_DRAB: ItemKey`, `TROUSERS_PADDED: ItemKey`, `TROUSERS_PADDED_HUNTING_CAMO: ItemKey`, `TROUSERS_POLICE: ItemKey`, `TROUSERS_POLICE_GREY: ItemKey`, `TROUSERS_PRISON_GUARD: ItemKey`, `TROUSERS_RANGER: ItemKey`, `TROUSERS_SANTA: ItemKey`, `TROUSERS_SANTA_GREEN: ItemKey`, `TROUSERS_SCRUBS: ItemKey`, `TROUSERS_SHEEP_SKIN: ItemKey`, `TROUSERS_SHELLSUIT_BLACK: ItemKey`, `TROUSERS_SHELLSUIT_BLUE: ItemKey`, `TROUSERS_SHELLSUIT_GREEN: ItemKey`, `TROUSERS_SHELLSUIT_PINK: ItemKey`, `TROUSERS_SHELLSUIT_TEAL: ItemKey`, `TROUSERS_SHELLSUIT_TINT: ItemKey`, `TROUSERS_SHERIFF: ItemKey`, `TROUSERS_SPORT: ItemKey`, `TROUSERS_SUIT: ItemKey`, `TROUSERS_SUIT_TEXTURE: ItemKey`, `TROUSERS_SUIT_WHITE: ItemKey`, `TROUSERS_SUIT_WHITE_WHITE: ItemKey`, `TROUSERS_WHITE_TEXTURE: ItemKey`, `TROUSERS_WHITE_TINT: ItemKey`, `TSHIRT_ARMY_GREEN: ItemKey`, `TSHIRT_BLUES_COUNTRY: ItemKey`, `TSHIRT_BUSINESS_SPIFFO: ItemKey`, `TSHIRT_CAMO_DESERT: ItemKey`, `TSHIRT_CAMO_DESERT_NEW: ItemKey`, `TSHIRT_CAMO_GREEN: ItemKey`, `TSHIRT_CAMO_MILIUS: ItemKey`, `TSHIRT_CAMO_TIGER_STRIPE: ItemKey`, `TSHIRT_CAMO_URBAN: ItemKey`, `TSHIRT_DEFAULT_DECAL: ItemKey`, `TSHIRT_DEFAULT_DECAL_TINT: ItemKey`, `TSHIRT_DEFAULT_TEXTURE: ItemKey`, `TSHIRT_DEFAULT_TEXTURE_TINT: ItemKey`, `TSHIRT_EMD: ItemKey`, `TSHIRT_FOSSOIL: ItemKey`, `TSHIRT_GAS2GO: ItemKey`, `TSHIRT_HIP_HOP: ItemKey`, `TSHIRT_HUNTING_CAMO: ItemKey`, `TSHIRT_INDIE: ItemKey`, `TSHIRT_INDIE_STONE_DECAL: ItemKey`, `TSHIRT_LONG_SLEEVE_HUNTING_CAMO: ItemKey`, `TSHIRT_LONG_SLEEVE_SUPER_COLOR: ItemKey`, `TSHIRT_MC_COYS: ItemKey`, `TSHIRT_METAL: ItemKey`, `TSHIRT_OLIVE_DRAB: ItemKey`, `TSHIRT_PILE_OCREPE: ItemKey`, `TSHIRT_PIZZA_WHIRLED: ItemKey`, `TSHIRT_POLICE_BLUE: ItemKey`, `TSHIRT_POLICE_GREY: ItemKey`, `TSHIRT_POLO_STRIPED_TINT: ItemKey`, `TSHIRT_POLO_TINT: ItemKey`, `TSHIRT_PROFESSION_FIREMAN_BLUE: ItemKey`, `TSHIRT_PROFESSION_FIREMAN_RED: ItemKey`, `TSHIRT_PROFESSION_FIREMAN_RED_02: ItemKey`, `TSHIRT_PROFESSION_FIREMAN_WHITE: ItemKey`, `TSHIRT_PROFESSION_POLICE_BLUE: ItemKey`, `TSHIRT_PROFESSION_POLICE_WHITE: ItemKey`, `TSHIRT_PROFESSION_RANGER_BROWN: ItemKey`, `TSHIRT_PROFESSION_RANGER_GREEN: ItemKey`, `TSHIRT_PROFESSION_VETEREN_GREEN: ItemKey`, `TSHIRT_PROFESSION_VETEREN_RED: ItemKey`, `TSHIRT_PUNK: ItemKey`, `TSHIRT_RANGER: ItemKey`, `TSHIRT_ROCK: ItemKey`, `TSHIRT_ROCK_2: ItemKey`, `TSHIRT_SCRUBS: ItemKey`, `TSHIRT_SHERIFF: ItemKey`, `TSHIRT_SPIFFO_DECAL: ItemKey`, `TSHIRT_SPORT: ItemKey`, `TSHIRT_SPORT_DECAL: ItemKey`, `TSHIRT_SUPER_COLOR: ItemKey`, `TSHIRT_THUNDER_GAS: ItemKey`, `TSHIRT_TIE_DYE: ItemKey`, `TSHIRT_TUXEDO: ItemKey`, `TSHIRT_VALLEY_STATION: ItemKey`, `TSHIRT_WHITE_LONG_SLEEVE: ItemKey`, `TSHIRT_WHITE_LONG_SLEEVE_TINT: ItemKey`, `TSHIRT_WHITE_TINT: ItemKey`, `UNDERPANTS_ANIMAL_PRINT: ItemKey`, `UNDERPANTS_BLACK: ItemKey`, `UNDERPANTS_HIDE: ItemKey`, `UNDERPANTS_RED_SPOTS: ItemKey`, `UNDERPANTS_WHITE: ItemKey`, `VAMBRACE_BODY_ARMOUR_LEFT: ItemKey`, `VAMBRACE_BODY_ARMOUR_LEFT_ARMY: ItemKey`, `VAMBRACE_BODY_ARMOUR_LEFT_CIV: ItemKey`, `VAMBRACE_BODY_ARMOUR_LEFT_DESERT: ItemKey`, `VAMBRACE_BODY_ARMOUR_LEFT_POLICE: ItemKey`, `VAMBRACE_BODY_ARMOUR_LEFT_SWAT: ItemKey`, `VAMBRACE_BODY_ARMOUR_RIGHT: ItemKey`, `VAMBRACE_BODY_ARMOUR_RIGHT_ARMY: ItemKey`, `VAMBRACE_BODY_ARMOUR_RIGHT_CIV: ItemKey`, `VAMBRACE_BODY_ARMOUR_RIGHT_DESERT: ItemKey`, `VAMBRACE_BODY_ARMOUR_RIGHT_POLICE: ItemKey`, `VAMBRACE_BODY_ARMOUR_RIGHT_SWAT: ItemKey`, `VAMBRACE_BONE_LEFT: ItemKey`, `VAMBRACE_BONE_RIGHT: ItemKey`, `VAMBRACE_FULL_METAL_LEFT: ItemKey`, `VAMBRACE_FULL_METAL_RIGHT: ItemKey`, `VAMBRACE_LEATHER_LEFT: ItemKey`, `VAMBRACE_LEATHER_RIGHT: ItemKey`, `VAMBRACE_LEATHER_SPIKE_LEFT: ItemKey`, `VAMBRACE_LEATHER_SPIKE_RIGHT: ItemKey`, `VAMBRACE_LEFT: ItemKey`, `VAMBRACE_MAGAZINE_LEFT: ItemKey`, `VAMBRACE_MAGAZINE_RIGHT: ItemKey`, `VAMBRACE_RIGHT: ItemKey`, `VAMBRACE_SCRAP_LEFT: ItemKey`, `VAMBRACE_SCRAP_RIGHT: ItemKey`, `VAMBRACE_SPIKE_LEFT: ItemKey`, `VAMBRACE_SPIKE_RIGHT: ItemKey`, `VAMBRACE_SPIKE_SCRAP_LEFT: ItemKey`, `VAMBRACE_SPIKE_SCRAP_RIGHT: ItemKey`, `VAMBRACE_TIRE_LEFT: ItemKey`, `VAMBRACE_TIRE_RIGHT: ItemKey`, `VAMBRACE_WOOD_LEFT: ItemKey`, `VAMBRACE_WOOD_RIGHT: ItemKey`, `VEST_ANGUS_HIDE: ItemKey`, `VEST_BULLET_ARMY: ItemKey`, `VEST_BULLET_CIVILIAN: ItemKey`, `VEST_BULLET_DESERT: ItemKey`, `VEST_BULLET_DESERT_NEW: ItemKey`, `VEST_BULLET_OLIVE_DRAB: ItemKey`, `VEST_BULLET_POLICE: ItemKey`, `VEST_BULLET_SWAT: ItemKey`, `VEST_CATCHER_VEST: ItemKey`, `VEST_CATCHER_VEST_BLUE: ItemKey`, `VEST_CATCHER_VEST_GREEN: ItemKey`, `VEST_CATCHER_VEST_RED: ItemKey`, `VEST_DEER_HIDE: ItemKey`, `VEST_DEFAULT_TEXTURE: ItemKey`, `VEST_DEFAULT_TEXTURE_TINT: ItemKey`, `VEST_FAWN_HIDE: ItemKey`, `VEST_FOREMAN: ItemKey`, `VEST_GARBAGE: ItemKey`, `VEST_HIDE: ItemKey`, `VEST_HIGH_VIZ: ItemKey`, `VEST_HOLSTEIN_HIDE: ItemKey`, `VEST_HUNTING_CAMO: ItemKey`, `VEST_HUNTING_CAMO_GREEN: ItemKey`, `VEST_HUNTING_GREY: ItemKey`, `VEST_HUNTING_KHAKI: ItemKey`, `VEST_HUNTING_ORANGE: ItemKey`, `VEST_LEATHER: ItemKey`, `VEST_LEATHER_BARREL_DOGS: ItemKey`, `VEST_LEATHER_BIKER: ItemKey`, `VEST_LEATHER_IRON_RODENTS: ItemKey`, `VEST_LEATHER_VETERAN: ItemKey`, `VEST_LEATHER_WILD_RACCOONS: ItemKey`, `VEST_SHEEP_SKIN: ItemKey`, `VEST_SIMMENTAL_HIDE: ItemKey`, `VEST_TARP: ItemKey`, `VEST_TRUCKER: ItemKey`, `VEST_WAISTCOAT: ItemKey`, `VEST_WAISTCOAT_GIGA_MART: ItemKey`, `VEST_WAISTCOAT_TINT: ItemKey`, `WEDDING_DRESS: ItemKey`, `WEDDING_JACKET: ItemKey`, `WELDING_MASK: ItemKey`, `WOUND_ABDOMEN_BITE_FEMALE: ItemKey`, `WOUND_ABDOMEN_BITE_MALE: ItemKey`, `WOUND_ABDOMEN_LACERATION_FEMALE: ItemKey`, `WOUND_ABDOMEN_LACERATION_MALE: ItemKey`, `WOUND_ABDOMEN_SCRATCH_FEMALE: ItemKey`, `WOUND_ABDOMEN_SCRATCH_MALE: ItemKey`, `WOUND_CHEST_BITE_FEMALE: ItemKey`, `WOUND_CHEST_BITE_MALE: ItemKey`, `WOUND_CHEST_LACERATION_FEMALE: ItemKey`, `WOUND_CHEST_LACERATION_MALE: ItemKey`, `WOUND_CHEST_SCRATCH_FEMALE: ItemKey`, `WOUND_CHEST_SCRATCH_MALE: ItemKey`, `WOUND_GROIN_BITE_FEMALE: ItemKey`, `WOUND_GROIN_BITE_MALE: ItemKey`, `WOUND_GROIN_LACERATION_FEMALE: ItemKey`, `WOUND_GROIN_LACERATION_MALE: ItemKey`, `WOUND_GROIN_SCRATCH_FEMALE: ItemKey`, `WOUND_GROIN_SCRATCH_MALE: ItemKey`, `WOUND_LFOREARM_BITE_FEMALE: ItemKey`, `WOUND_LFOREARM_BITE_MALE: ItemKey`, `WOUND_LFOREARM_LACERATION_FEMALE: ItemKey`, `WOUND_LFOREARM_LACERATION_MALE: ItemKey`, `WOUND_LFOREARM_SCRATCH_FEMALE: ItemKey`, `WOUND_LFOREARM_SCRATCH_MALE: ItemKey`, `WOUND_LHAND_BITE_FEMALE: ItemKey`, `WOUND_LHAND_BITE_MALE: ItemKey`, `WOUND_LHAND_LACERATION_FEMALE: ItemKey`, `WOUND_LHAND_LACERATION_MALE: ItemKey`, `WOUND_LHAND_SCRATCH_FEMALE: ItemKey`, `WOUND_LHAND_SCRATCH_MALE: ItemKey`, `WOUND_LUARM_BITE_FEMALE: ItemKey`, `WOUND_LUARM_BITE_MALE: ItemKey`, `WOUND_LUARM_LACERATION_FEMALE: ItemKey`, `WOUND_LUARM_LACERATION_MALE: ItemKey`, `WOUND_LUARM_SCRATCH_FEMALE: ItemKey`, `WOUND_LUARM_SCRATCH_MALE: ItemKey`, `WOUND_NECK_BITE_FEMALE: ItemKey`, `WOUND_NECK_BITE_MALE: ItemKey`, `WOUND_NECK_LACERATION_FEMALE: ItemKey`, `WOUND_NECK_LACERATION_MALE: ItemKey`, `WOUND_NECK_SCRATCH_FEMALE: ItemKey`, `WOUND_NECK_SCRATCH_MALE: ItemKey`, `WOUND_RFOREARM_BITE_FEMALE: ItemKey`, `WOUND_RFOREARM_BITE_MALE: ItemKey`, `WOUND_RFOREARM_LACERATION_FEMALE: ItemKey`, `WOUND_RFOREARM_LACERATION_MALE: ItemKey`, `WOUND_RFOREARM_SCRATCH_FEMALE: ItemKey`, `WOUND_RFOREARM_SCRATCH_MALE: ItemKey`, `WOUND_RHAND_BITE_FEMALE: ItemKey`, `WOUND_RHAND_BITE_MALE: ItemKey`, `WOUND_RHAND_LACERATION_FEMALE: ItemKey`, `WOUND_RHAND_LACERATION_MALE: ItemKey`, `WOUND_RHAND_SCRATCH_FEMALE: ItemKey`, `WOUND_RHAND_SCRATCH_MALE: ItemKey`, `WOUND_RUARM_BITE_FEMALE: ItemKey`, `WOUND_RUARM_BITE_MALE: ItemKey`, `WOUND_RUARM_LACERATION_FEMALE: ItemKey`, `WOUND_RUARM_LACERATION_MALE: ItemKey`, `WOUND_RUARM_SCRATCH_FEMALE: ItemKey`, `WOUND_RUARM_SCRATCH_MALE: ItemKey`, `ZED_DMG_BACK_SLASH: ItemKey`, `ZED_DMG_BACK_SPINE: ItemKey`, `ZED_DMG_BELLY_BULLET: ItemKey`, `ZED_DMG_BELLY_SHOTGUN: ItemKey`, `ZED_DMG_BELLY_SKIN: ItemKey`, `ZED_DMG_BELLY_SLASH: ItemKey`, `ZED_DMG_BELLY_SLASH_LEFT: ItemKey`, `ZED_DMG_BELLY_SLASH_RIGHT: ItemKey`, `ZED_DMG_BULLET_BELLY_01: ItemKey`, `ZED_DMG_BULLET_BELLY_02: ItemKey`, `ZED_DMG_BULLET_BELLY_03: ItemKey`, `ZED_DMG_BULLET_CHEST_01: ItemKey`, `ZED_DMG_BULLET_CHEST_02: ItemKey`, `ZED_DMG_BULLET_CHEST_03: ItemKey`, `ZED_DMG_BULLET_CHEST_04: ItemKey`, `ZED_DMG_BULLET_FACE_01: ItemKey`, `ZED_DMG_BULLET_FACE_02: ItemKey`, `ZED_DMG_BULLET_FOREHEAD_01: ItemKey`, `ZED_DMG_BULLET_FOREHEAD_02: ItemKey`, `ZED_DMG_BULLET_FOREHEAD_03: ItemKey`, `ZED_DMG_BULLET_LEFT_TEMPLE: ItemKey`, `ZED_DMG_BULLET_RIGHT_TEMPLE: ItemKey`, `ZED_DMG_CHEST_BULLET: ItemKey`, `ZED_DMG_CHEST_SHOTGUN: ItemKey`, `ZED_DMG_CHEST_SLASH: ItemKey`, `ZED_DMG_CHEST_SLASH_LEFT: ItemKey`, `ZED_DMG_FACE_SKULL_LEFT: ItemKey`, `ZED_DMG_FACE_SKULL_RIGHT: ItemKey`, `ZED_DMG_HEAD_BULLET: ItemKey`, `ZED_DMG_HEAD_SHOTGUN: ItemKey`, `ZED_DMG_HEAD_SKIN: ItemKey`, `ZED_DMG_HEAD_SLASH: ItemKey`, `ZED_DMG_HEAD_SLASH_CENTRE_01: ItemKey`, `ZED_DMG_HEAD_SLASH_CENTRE_02: ItemKey`, `ZED_DMG_HEAD_SLASH_CENTRE_03: ItemKey`, `ZED_DMG_HEAD_SLASH_LEFT_01: ItemKey`, `ZED_DMG_HEAD_SLASH_LEFT_02: ItemKey`, `ZED_DMG_HEAD_SLASH_LEFT_03: ItemKey`, `ZED_DMG_HEAD_SLASH_LEFT_BACK_01: ItemKey`, `ZED_DMG_HEAD_SLASH_LEFT_BACK_02: ItemKey`, `ZED_DMG_HEAD_SLASH_RIGHT_01: ItemKey`, `ZED_DMG_HEAD_SLASH_RIGHT_02: ItemKey`, `ZED_DMG_HEAD_SLASH_RIGHT_03: ItemKey`, `ZED_DMG_HEAD_SLASH_RIGHT_BACK_01: ItemKey`, `ZED_DMG_HEAD_SLASH_RIGHT_BACK_02: ItemKey`, `ZED_DMG_MOUTH_01: ItemKey`, `ZED_DMG_MOUTH_02: ItemKey`, `ZED_DMG_MOUTH_LEFT: ItemKey`, `ZED_DMG_MOUTH_RIGHT: ItemKey`, `ZED_DMG_NECK_BITE: ItemKey`, `ZED_DMG_NECK_BITE_BACK_LEFT: ItemKey`, `ZED_DMG_NECK_BITE_BACK_RIGHT: ItemKey`, `ZED_DMG_NECK_BITE_FRONT_LEFT: ItemKey`, `ZED_DMG_NECK_BITE_FRONT_RIGHT: ItemKey`, `ZED_DMG_NO_CHIN: ItemKey`, `ZED_DMG_NO_EAR_LEFT: ItemKey`, `ZED_DMG_NO_EAR_RIGHT: ItemKey`, `ZED_DMG_NO_NOSE: ItemKey`, `ZED_DMG_RIBS_LEFT: ItemKey`, `ZED_DMG_RIBS_RIGHT: ItemKey`, `ZED_DMG_SHOTGUN_BELLY: ItemKey`, `ZED_DMG_SHOTGUN_CHEST_CENTRE: ItemKey`, `ZED_DMG_SHOTGUN_CHEST_LEFT: ItemKey`, `ZED_DMG_SHOTGUN_CHEST_RIGHT: ItemKey`, `ZED_DMG_SHOTGUN_FACE_FULL: ItemKey`, `ZED_DMG_SHOTGUN_FACE_LEFT: ItemKey`, `ZED_DMG_SHOTGUN_FACE_RIGHT: ItemKey`, `ZED_DMG_SHOTGUN_LEFT: ItemKey`, `ZED_DMG_SHOTGUN_RIGHT: ItemKey`, `ZED_DMG_SHOULDER_SLASH_LEFT: ItemKey`, `ZED_DMG_SHOULDER_SLASH_RIGHT: ItemKey`, `ZED_DMG_SKULL_CAP: ItemKey`, `ZED_DMG_SKULL_UP_LEFT: ItemKey`, `ZED_DMG_SKULL_UP_RIGHT: ItemKey`.

### ItemKey.Container

`zombie.scripting.objects.ItemKey.Container`, class.

Constructors: `ItemKey.Container.new()`.

Static fields (a copy of the value taken when the class is exposed): `AMMO_STRAP_BROWN_BULLETS: ItemKey`, `AMMO_STRAP_BROWN_SHELLS: ItemKey`, `AMMO_STRAP_BULLETS: ItemKey`, `AMMO_STRAP_BULLETS_308: ItemKey`, `AMMO_STRAP_SHELLS: ItemKey`, `BAG_ALICEPACK: ItemKey`, `BAG_ALICEPACK_ARMY: ItemKey`, `BAG_ALICEPACK_DESERT_CAMO: ItemKey`, `BAG_ALICE_BELT_SUS: ItemKey`, `BAG_ALICE_BELT_SUS_CAMO: ItemKey`, `BAG_ALICE_BELT_SUS_GREEN: ItemKey`, `BAG_AMMO_BOX: ItemKey`, `BAG_AMMO_BOX_308: ItemKey`, `BAG_AMMO_BOX_38: ItemKey`, `BAG_AMMO_BOX_44: ItemKey`, `BAG_AMMO_BOX_45: ItemKey`, `BAG_AMMO_BOX_9MM: ItemKey`, `BAG_AMMO_BOX_HUNTING: ItemKey`, `BAG_AMMO_BOX_MIXED: ItemKey`, `BAG_AMMO_BOX_SHOTGUN_SHELLS: ItemKey`, `BAG_BASEBALL_BAG: ItemKey`, `BAG_BIG_HIKING_BAG: ItemKey`, `BAG_BIG_HIKING_BAG_TRAVEL: ItemKey`, `BAG_BIRTHDAY_BASKET: ItemKey`, `BAG_BOWLING_BALL_BAG: ItemKey`, `BAG_BREAKDOWN_BAG: ItemKey`, `BAG_BURGLAR_BAG: ItemKey`, `BAG_CHEST_RIG: ItemKey`, `BAG_CHEST_RIG_TARP: ItemKey`, `BAG_CLOTH_SATCHEL_BURLAP: ItemKey`, `BAG_CLOTH_SATCHEL_COTTON: ItemKey`, `BAG_CLOTH_SATCHEL_DENIM: ItemKey`, `BAG_CLOTH_SATCHEL_DENIM_BLACK: ItemKey`, `BAG_CLOTH_SATCHEL_DENIM_LIGHT: ItemKey`, `BAG_CRAFTED_FRAMEPACK_LARGE: ItemKey`, `BAG_CRAFTED_FRAMEPACK_LARGE_2: ItemKey`, `BAG_CRAFTED_FRAMEPACK_LARGE_3: ItemKey`, `BAG_CRAFTED_FRAMEPACK_SMALL: ItemKey`, `BAG_CRUDE_LEATHER_BAG: ItemKey`, `BAG_CRUDE_TARP_BAG: ItemKey`, `BAG_DANCER: ItemKey`, `BAG_DEAD_MICE: ItemKey`, `BAG_DEAD_RATS: ItemKey`, `BAG_DEAD_ROACHES: ItemKey`, `BAG_DOCTOR_BAG: ItemKey`, `BAG_DUFFEL_BAG: ItemKey`, `BAG_DUFFEL_BAG_TINT: ItemKey`, `BAG_FANNY_PACK_BACK: ItemKey`, `BAG_FANNY_PACK_BACK_HIDE: ItemKey`, `BAG_FANNY_PACK_BACK_TARP: ItemKey`, `BAG_FANNY_PACK_FRONT: ItemKey`, `BAG_FANNY_PACK_FRONT_HIDE: ItemKey`, `BAG_FANNY_PACK_FRONT_TARP: ItemKey`, `BAG_FISHING_BASKET: ItemKey`, `BAG_FLUTE_CASE: ItemKey`, `BAG_FOOD_CANNED: ItemKey`, `BAG_FOOD_SNACKS: ItemKey`, `BAG_GARDEN_BASKET: ItemKey`, `BAG_GOLF_BAG: ItemKey`, `BAG_GOLF_BAG_MELEE: ItemKey`, `BAG_GUNNY: ItemKey`, `BAG_HIDE_SACK: ItemKey`, `BAG_HIDE_SATCHEL: ItemKey`, `BAG_HIDE_SLING_BAG: ItemKey`, `BAG_HIKING_BAG_TRAVEL: ItemKey`, `BAG_HYDRATION_BACKPACK: ItemKey`, `BAG_HYDRATION_BACKPACK_CAMO: ItemKey`, `BAG_INMATE_ESCAPED_BAG: ItemKey`, `BAG_JANITOR_TOOLBOX: ItemKey`, `BAG_LAUNDRY: ItemKey`, `BAG_LAUNDRY_HOSPITAL: ItemKey`, `BAG_LAUNDRY_LINEN: ItemKey`, `BAG_MAIL: ItemKey`, `BAG_MEDICAL_BAG: ItemKey`, `BAG_MILITARY: ItemKey`, `BAG_MONEY_BAG: ItemKey`, `BAG_NORMAL_HIKING_BAG: ItemKey`, `BAG_PICNIC_BASKET: ItemKey`, `BAG_POLICE: ItemKey`, `BAG_PROTECTIVE_CASE: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO_308: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO_38: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO_44: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO_45: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO_556: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO_9MM: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO_HUNTING: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AMMO_SHOTGUN_SHELLS: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_AUDIO: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_HAMRADIO_1: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_HAZARD: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_MILITARY: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_MILITARY_HAMRADIO_2: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_SCBA: ItemKey`, `BAG_PROTECTIVE_CASE_BULKY_SURVIVALIST: ItemKey`, `BAG_PROTECTIVE_CASE_MILITARY: ItemKey`, `BAG_PROTECTIVE_CASE_MILITARY_MEDICAL: ItemKey`, `BAG_PROTECTIVE_CASE_MILITARY_TOOLS: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_ARMORER: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_ELECTRONICS: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_FIRST_AID: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_KEY_CUTTING: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_MILITARY: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_MILITARY_FIRST_AID: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_MILITARY_PISTOL_1: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_MILITARY_WALKIE_TALKIE: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_PISTOL_1: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_PISTOL_2: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_PISTOL_3: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_REVOLVER_1: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_REVOLVER_2: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_REVOLVER_3: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_SURVIVALIST: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_WALKIE_TALKIE: ItemKey`, `BAG_PROTECTIVE_CASE_SMALL_WALKIE_TALKIE_POLICE: ItemKey`, `BAG_PROTECTIVE_CASE_SURVIVALIST: ItemKey`, `BAG_PROTECTIVE_CASE_TOOLS: ItemKey`, `BAG_RIFLE_CASE: ItemKey`, `BAG_RIFLE_CASE_CLOTH: ItemKey`, `BAG_RIFLE_CASE_CLOTH_2: ItemKey`, `BAG_RIFLE_CASE_CLOTH_CAMO: ItemKey`, `BAG_RIFLE_CASE_GREEN: ItemKey`, `BAG_RIFLE_CASE_GREEN_2: ItemKey`, `BAG_RIFLE_CASE_POLICE: ItemKey`, `BAG_RIFLE_CASE_POLICE_2: ItemKey`, `BAG_RIFLE_CASE_POLICE_3: ItemKey`, `BAG_SATCHEL: ItemKey`, `BAG_SATCHEL_FISHING: ItemKey`, `BAG_SATCHEL_LEATHER: ItemKey`, `BAG_SATCHEL_MAIL: ItemKey`, `BAG_SATCHEL_MEDICAL: ItemKey`, `BAG_SATCHEL_MILITARY: ItemKey`, `BAG_SATCHEL_PHOTO: ItemKey`, `BAG_SAXOPHONE_CASE: ItemKey`, `BAG_SCHOOLBAG: ItemKey`, `BAG_SCHOOLBAG_KIDS: ItemKey`, `BAG_SCHOOLBAG_MEDICAL: ItemKey`, `BAG_SCHOOLBAG_PATCHES: ItemKey`, `BAG_SCHOOLBAG_TRAVEL: ItemKey`, `BAG_SHEET_SLING_BAG: ItemKey`, `BAG_SHERIFF: ItemKey`, `BAG_SHOTGUN_BAG: ItemKey`, `BAG_SHOTGUN_CASE_CLOTH: ItemKey`, `BAG_SHOTGUN_CASE_CLOTH_2: ItemKey`, `BAG_SHOTGUN_CASE_GREEN: ItemKey`, `BAG_SHOTGUN_CASE_POLICE: ItemKey`, `BAG_SHOTGUN_DBL_BAG: ItemKey`, `BAG_SHOTGUN_DBL_SAWNOFF_BAG: ItemKey`, `BAG_SHOTGUN_SAWNOFF_BAG: ItemKey`, `BAG_SURVIVOR_BAG: ItemKey`, `BAG_SWAT: ItemKey`, `BAG_TARP_FRAMEPACK_LARGE: ItemKey`, `BAG_TARP_FRAMEPACK_SMALL: ItemKey`, `BAG_TARP_SACK: ItemKey`, `BAG_TARP_SLING_BAG: ItemKey`, `BAG_TENNIS_BAG: ItemKey`, `BAG_TOOL_BAG: ItemKey`, `BAG_TRASH_BAG: ItemKey`, `BAG_TREASURE_BAG: ItemKey`, `BAG_TRUMPET_CASE: ItemKey`, `BAG_VIOLIN_CASE: ItemKey`, `BAG_WEAPON_BAG: ItemKey`, `BAG_WORKER_BAG: ItemKey`, `BRIEFCASE: ItemKey`, `BRIEFCASE_MONEY: ItemKey`, `CASHBOX: ItemKey`, `CIGAR_BOX: ItemKey`, `CIGAR_BOX_GAMING: ItemKey`, `CIGAR_BOX_KEEPSAKES: ItemKey`, `CIGAR_BOX_KIDS: ItemKey`, `COOKIE_JAR: ItemKey`, `COOKIE_JAR_BEAR: ItemKey`, `COOLER: ItemKey`, `COOLER_BEER: ItemKey`, `COOLER_MEAT: ItemKey`, `COOLER_SEAFOOD: ItemKey`, `COOLER_SODA: ItemKey`, `DICE_BAG: ItemKey`, `EMPTY_SANDBAG: ItemKey`, `FIRST_AID_KIT: ItemKey`, `FIRST_AID_KIT_CAMPING: ItemKey`, `FIRST_AID_KIT_CAMPING_NEW: ItemKey`, `FIRST_AID_KIT_MILITARY: ItemKey`, `FIRST_AID_KIT_NEW: ItemKey`, `FIRST_AID_KIT_NEW_PRO: ItemKey`, `FLIGHTCASE: ItemKey`, `GARBAGEBAG: ItemKey`, `GEM_BAG: ItemKey`, `GROCERY_BAG_1: ItemKey`, `GROCERY_BAG_2: ItemKey`, `GROCERY_BAG_3: ItemKey`, `GROCERY_BAG_4: ItemKey`, `GROCERY_BAG_5: ItemKey`, `GROCERY_BAG_GOURMET: ItemKey`, `GUITARCASE: ItemKey`, `HALLOWEEN_CANDY_BUCKET: ItemKey`, `HANDBAG: ItemKey`, `HATBOX: ItemKey`, `HOLLOW_BOOK: ItemKey`, `HOLLOW_BOOK_HANDGUN: ItemKey`, `HOLLOW_BOOK_KIDS: ItemKey`, `HOLLOW_BOOK_PRISON: ItemKey`, `HOLLOW_BOOK_VALUABLES: ItemKey`, `HOLLOW_BOOK_WHISKEY: ItemKey`, `HOLLOW_FANCY_BOOK: ItemKey`, `HOLSTER_SHOULDER: ItemKey`, `HUMIDOR: ItemKey`, `JEWELLERY_BOX: ItemKey`, `JEWELLERY_BOX_FANCY: ItemKey`, `KEY_RING: ItemKey`, `KEY_RING_BASS: ItemKey`, `KEY_RING_BLUE_FOX: ItemKey`, `KEY_RING_BUG: ItemKey`, `KEY_RING_CAR_DEALER: ItemKey`, `KEY_RING_CLOVER: ItemKey`, `KEY_RING_EAGLE_FLAG: ItemKey`, `KEY_RING_EIGHT_BALL: ItemKey`, `KEY_RING_FORGED: ItemKey`, `KEY_RING_FORGED_GOLD: ItemKey`, `KEY_RING_FORGED_SILVER: ItemKey`, `KEY_RING_HOTDOG: ItemKey`, `KEY_RING_KITTY: ItemKey`, `KEY_RING_LARGE: ItemKey`, `KEY_RING_NOLANS: ItemKey`, `KEY_RING_PANTHER: ItemKey`, `KEY_RING_PINE_TREE: ItemKey`, `KEY_RING_PRAYING_HANDS: ItemKey`, `KEY_RING_RABBIT_FOOT: ItemKey`, `KEY_RING_RACECAR_12: ItemKey`, `KEY_RING_RACECAR_34: ItemKey`, `KEY_RING_RACECAR_58: ItemKey`, `KEY_RING_RAINBOW_STAR: ItemKey`, `KEY_RING_RUBBER_DUCK: ItemKey`, `KEY_RING_SECURITY_PASS: ItemKey`, `KEY_RING_SEXY: ItemKey`, `KEY_RING_SPIFFOS: ItemKey`, `KEY_RING_STINKY_FACE: ItemKey`, `KEY_RING_WEST_MAPLE: ItemKey`, `LUNCHBAG: ItemKey`, `LUNCHBOX: ItemKey`, `LUNCHBOX_2: ItemKey`, `MAKEUP_CASE_PROFESSIONAL: ItemKey`, `PAPERBAG_JAYS: ItemKey`, `PAPERBAG_SPIFFOS: ItemKey`, `PAPER_BAG: ItemKey`, `PARCEL_EXTRA_LARGE: ItemKey`, `PARCEL_EXTRA_SMALL: ItemKey`, `PARCEL_LARGE: ItemKey`, `PARCEL_MEDIUM: ItemKey`, `PARCEL_SMALL: ItemKey`, `PENCIL_CASE: ItemKey`, `PENCIL_CASE_GAMING: ItemKey`, `PHOTO_ALBUM: ItemKey`, `PHOTO_ALBUM_OLD: ItemKey`, `PISTOL_CASE_1: ItemKey`, `PISTOL_CASE_2: ItemKey`, `PISTOL_CASE_3: ItemKey`, `PLASTICBAG: ItemKey`, `PLASTICBAG_BAGS: ItemKey`, `PLASTICBAG_CLOTHING: ItemKey`, `PRESENT_EXTRA_LARGE: ItemKey`, `PRESENT_EXTRA_SMALL: ItemKey`, `PRESENT_LARGE: ItemKey`, `PRESENT_MEDIUM: ItemKey`, `PRESENT_SMALL: ItemKey`, `PRODUCE_BOX_EXTRA_LARGE: ItemKey`, `PRODUCE_BOX_EXTRA_SMALL: ItemKey`, `PRODUCE_BOX_LARGE: ItemKey`, `PRODUCE_BOX_MEDIUM: ItemKey`, `PRODUCE_BOX_SMALL: ItemKey`, `PURSE: ItemKey`, `REVOLVER_CASE_1: ItemKey`, `REVOLVER_CASE_2: ItemKey`, `REVOLVER_CASE_3: ItemKey`, `RIFLE_CASE_1: ItemKey`, `RIFLE_CASE_2: ItemKey`, `RIFLE_CASE_3: ItemKey`, `RIFLE_CASE_4: ItemKey`, `SEED_BAG: ItemKey`, `SEED_BAG_FARMING: ItemKey`, `SEWING_KIT: ItemKey`, `SHOEBOX: ItemKey`, `SHOTGUN_CASE_1: ItemKey`, `SHOTGUN_CASE_2: ItemKey`, `SUITCASE: ItemKey`, `TACKLEBOX: ItemKey`, `TAKEOUT_BOX_CHINESE: ItemKey`, `TAKEOUT_BOX_STYROFOAM: ItemKey`, `TOOLBOX: ItemKey`, `TOOLBOX_FARMING: ItemKey`, `TOOLBOX_FISHING: ItemKey`, `TOOLBOX_GARDENING: ItemKey`, `TOOLBOX_MECHANIC: ItemKey`, `TOOLBOX_WOODEN: ItemKey`, `TOOL_ROLL_FABRIC: ItemKey`, `TOOL_ROLL_LEATHER: ItemKey`, `TOTE: ItemKey`, `TOTE_BAGS: ItemKey`, `TOTE_CLOTHING: ItemKey`, `WALLET: ItemKey`, `WALLET_FEMALE: ItemKey`, `WALLET_HIDE: ItemKey`, `WALLET_MALE: ItemKey`, `WHEAT_SACK: ItemKey`, `WHEAT_SEED_SACK: ItemKey`.

### ItemKey.Drainable

`zombie.scripting.objects.ItemKey.Drainable`, class.

Constructors: `ItemKey.Drainable.new()`.

Static fields (a copy of the value taken when the class is exposed): `ALCOHOLED_COTTON_BALLS: ItemKey`, `ALCOHOL_WIPES: ItemKey`, `ANIMAL_FEED_BAG: ItemKey`, `ANIMAL_MILK_POWDER: ItemKey`, `BAKING_SODA: ItemKey`, `BATH_TOWEL: ItemKey`, `BATTERY: ItemKey`, `BBQSTARTER_FLUID: ItemKey`, `BLOW_TORCH: ItemKey`, `BUCKET_CARVED_CLAY_CEMENT: ItemKey`, `BUCKET_CARVED_CONCRETE_FULL: ItemKey`, `BUCKET_CARVED_PLASTER_FULL: ItemKey`, `BUCKET_CARVED_WALLPAPER_PASTE: ItemKey`, `BUCKET_CLAY_CEMENT: ItemKey`, `BUCKET_CONCRETE_FULL: ItemKey`, `BUCKET_PLASTER_FULL: ItemKey`, `BUCKET_WALLPAPER_PASTE: ItemKey`, `BULLHORN: ItemKey`, `CANDLE: ItemKey`, `CANDLE_LIT: ItemKey`, `CAR_BATTERY_1: ItemKey`, `CAR_BATTERY_2: ItemKey`, `CAR_BATTERY_3: ItemKey`, `CERAMIC_CRUCIBLE_IRON: ItemKey`, `CERAMIC_CRUCIBLE_SMALL_IRON: ItemKey`, `CERAMIC_CRUCIBLE_SMALL_STEEL: ItemKey`, `CERAMIC_CRUCIBLE_STEEL: ItemKey`, `CERAMIC_CRUCIBLE_WITH_GLASS: ItemKey`, `CIGARETTE_PACK: ItemKey`, `CIGARETTE_ROLLING_PAPERS: ItemKey`, `CLAYBAG: ItemKey`, `COMPOST_BAG: ItemKey`, `CORRECTION_FLUID: ItemKey`, `DENTAL_FLOSS: ItemKey`, `DIRTBAG: ItemKey`, `DISH_CLOTH: ItemKey`, `DUCT_TAPE: ItemKey`, `EPOXY: ItemKey`, `EXTINGUISHER: ItemKey`, `FABRIC_ROLL_COTTON: ItemKey`, `FABRIC_ROLL_DENIM_BLACK: ItemKey`, `FABRIC_ROLL_DENIM_BLUE: ItemKey`, `FABRIC_ROLL_DENIM_DARK_BLUE: ItemKey`, `FERTILIZER: ItemKey`, `FIBERGLASS_TAPE: ItemKey`, `FISHING_LINE: ItemKey`, `FLASHLIGHT_CRAFTED: ItemKey`, `FLASH_LIGHT_ANGLE_HEAD: ItemKey`, `FLASH_LIGHT_ANGLE_HEAD_ARMY: ItemKey`, `GARBAGEBAG_BOX: ItemKey`, `GARDENING_SPRAY_APHIDS: ItemKey`, `GARDENING_SPRAY_CIGARETTES: ItemKey`, `GARDENING_SPRAY_MILK: ItemKey`, `GASMASK_FILTER: ItemKey`, `GASMASK_FILTER_CRAFTED: ItemKey`, `GLUE: ItemKey`, `GRASS_BAG: ItemKey`, `GRAVELBAG: ItemKey`, `GRAVY_MIX: ItemKey`, `GUN_POWDER: ItemKey`, `HAIRGEL: ItemKey`, `HAIRSPRAY_2: ItemKey`, `HAND_TORCH: ItemKey`, `INSECT_REPELLENT: ItemKey`, `LANTERN_CRAFTED_ELECTRIC: ItemKey`, `LANTERN_HURRICANE: ItemKey`, `LANTERN_HURRICANE_COPPER: ItemKey`, `LANTERN_HURRICANE_COPPER_LIT: ItemKey`, `LANTERN_HURRICANE_FORGED: ItemKey`, `LANTERN_HURRICANE_FORGED_LIT: ItemKey`, `LANTERN_HURRICANE_GOLD: ItemKey`, `LANTERN_HURRICANE_GOLD_LIT: ItemKey`, `LANTERN_HURRICANE_LIT: ItemKey`, `LANTERN_HURRICANE_SILVER: ItemKey`, `LANTERN_HURRICANE_SILVER_LIT: ItemKey`, `LANTERN_PROPANE: ItemKey`, `LIGHTER: ItemKey`, `LIGHTER_BATTERY: ItemKey`, `LIGHTER_BBQ: ItemKey`, `LIGHTER_DISPOSABLE: ItemKey`, `LIGHTER_FLUID: ItemKey`, `LIPSTICK: ItemKey`, `MAGNESIUM_FIRESTARTER: ItemKey`, `MAKEUP_EYESHADOW: ItemKey`, `MAKEUP_FOUNDATION: ItemKey`, `MATCHBOX: ItemKey`, `MATCHES: ItemKey`, `OXYGEN_TANK: ItemKey`, `PAINT_BLACK: ItemKey`, `PAINT_BLUE: ItemKey`, `PAINT_BROWN: ItemKey`, `PAINT_CYAN: ItemKey`, `PAINT_GREEN: ItemKey`, `PAINT_GREY: ItemKey`, `PAINT_LIGHT_BLUE: ItemKey`, `PAINT_LIGHT_BROWN: ItemKey`, `PAINT_ORANGE: ItemKey`, `PAINT_PINK: ItemKey`, `PAINT_PURPLE: ItemKey`, `PAINT_RED: ItemKey`, `PAINT_TURQUOISE: ItemKey`, `PAINT_WHITE: ItemKey`, `PAINT_YELLOW: ItemKey`, `PANCAKE_MIX: ItemKey`, `PAPER_NAPKINS_2: ItemKey`, `PEN_LIGHT: ItemKey`, `PILLS: ItemKey`, `PILLS_ANTI_DEP: ItemKey`, `PILLS_BETA: ItemKey`, `PILLS_SLEEPING_TABLETS: ItemKey`, `PILLS_VITAMINS: ItemKey`, `PREMIUM_FISHING_LINE: ItemKey`, `PROPANE_REFILL: ItemKey`, `PROPANE_TANK: ItemKey`, `RAG_FILTER: ItemKey`, `RAT_POISON: ItemKey`, `RESPIRATOR_FILTERS: ItemKey`, `RESPIRATOR_FILTERS_RECHARGED: ItemKey`, `SANDBAG: ItemKey`, `SHEEP_ELECTRIC_SHEARS: ItemKey`, `SLUG_REPELLENT: ItemKey`, `SOAP_2: ItemKey`, `SPRAY_PAINT: ItemKey`, `STAPLES: ItemKey`, `STEEL_WOOL: ItemKey`, `TEST_WATER_MUG: ItemKey`, `THREAD: ItemKey`, `THREAD_ARAMID: ItemKey`, `THREAD_SINEW: ItemKey`, `TISSUE: ItemKey`, `TISSUE_BOX: ItemKey`, `TOBACCO_CHEWING: ItemKey`, `TOBACCO_LOOSE: ItemKey`, `TOILET_PAPER: ItemKey`, `TORCH: ItemKey`, `TWINE: ItemKey`, `VINEGAR_2: ItemKey`, `VINEGAR_JUG: ItemKey`, `WALLPAPER_BEIGE_STRIPE: ItemKey`, `WALLPAPER_BLACK_FLORAL: ItemKey`, `WALLPAPER_BLUE_STRIPE: ItemKey`, `WALLPAPER_GREEN_DIAMOND: ItemKey`, `WALLPAPER_GREEN_FLORAL: ItemKey`, `WALLPAPER_PINK_CHEVRON: ItemKey`, `WALLPAPER_PINK_FLORAL: ItemKey`, `WATER_PURIFICATION_TABLETS: ItemKey`, `WELDING_RODS: ItemKey`, `WIRE: ItemKey`, `WOODGLUE: ItemKey`, `YEAST: ItemKey`.
