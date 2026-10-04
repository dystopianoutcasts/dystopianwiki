---
slug: lua-classes-scripts-4
title: 'Lua Classes: Script objects, part 4 of 4 (Build 42.21)'
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
excerpt: 'The exposed script objects classes of Build 42.21 (part 4 of 4): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Script objects, part 4 of 4

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The objects the script parser builds from the files in media/scripts: item scripts, recipes, vehicle scripts and the script manager that holds them.

This page holds 44 classes and 429 methods, part 4 of 4 of this area (from `ScriptManager` to `XuiVarType`), from the packages `zombie.scripting`, `zombie.scripting.ui`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### ScriptManager

`zombie.scripting.ScriptManager`, class.

Methods, called as `obj:name(...)`:

- `CheckExitPoints(): void`
- `FindItem(String name): Item`
- `FindItem(String name, boolean moduleDefaultsToBase): Item`
- `Load(): void`
- `LoadFile(ScriptLoadMode loadMode, String filename, boolean bLoadJar): void`
- `LoadedAfterLua(): void`
- `ParseScript(ScriptLoadMode loadMode, String totalFile): void`
- `PostTileDefinitions(): void`
- `PostWorldDictionaryInit(): void`
- `ReloadScripts(EnumSet<ScriptType> types): void`
- `ReloadScripts(ScriptType type): void`
- `Reset(): void`
- `VerifyAllCraftRecipesAreLearnable(): void`
- `addModelScript(ModelScript modelScript): void`
- `addSpriteModel(SpriteModel spriteModel): void`
- `checkAutoLearn(IsoGameCharacter chr): void`
- `checkMetaRecipe(IsoGameCharacter chr, String checkRecipe): void`
- `checkMetaRecipes(IsoGameCharacter chr): void`
- `getAllAnimationsMeshes(): ArrayList<AnimationsMesh>`
- `getAllBuildableRecipes(): ArrayList<CraftRecipe>`
- `getAllClockScripts(): ArrayList<ClockScript>`
- `getAllCraftRecipes(): ArrayList<CraftRecipe>`
- `getAllEnergyDefinitionScripts(): ArrayList<EnergyDefinitionScript>`
- `getAllEvolvedRecipes(): Stack<EvolvedRecipe>`
- `getAllEvolvedRecipesList(): ArrayList<EvolvedRecipe>`
- `getAllFixing(ArrayList<Fixing> result): ArrayList<Fixing>`
- `getAllFluidDefinitionScripts(): ArrayList<FluidDefinitionScript>`
- `getAllFluidFilters(): ArrayList<FluidFilterScript>`
- `getAllGameEntities(): ArrayList<GameEntityScript>`
- `getAllGameEntityTemplates(): ArrayList<GameEntityTemplate>`
- `getAllGameSounds(): ArrayList<GameSoundScript>`
- `getAllItemConfigs(): ArrayList<ItemConfig>`
- `getAllItemFilters(): ArrayList<ItemFilterScript>`
- `getAllItems(): ArrayList<Item>`
- `getAllMannequinScripts(): ArrayList<MannequinScript>`
- `getAllModelScripts(): ArrayList<ModelScript>`
- `getAllPhysicsShapes(): ArrayList<PhysicsShapeScript>`
- `getAllRecipes(): ArrayList<Recipe>`
- `getAllRecipesFor(String result): ArrayList<Recipe>`
- `getAllRuntimeAnimationScripts(): ArrayList<RuntimeAnimationScript>`
- `getAllSoundTimelines(): ArrayList<SoundTimelineScript>`
- `getAllSpriteModels(): ArrayList<SpriteModel>`
- `getAllStringLists(): ArrayList<StringListScript>`
- `getAllTimedActionScripts(): ArrayList<TimedActionScript>`
- `getAllUniqueRecipes(): Stack<UniqueRecipe>`
- `getAllVehicleEngineRPMs(): ArrayList<VehicleEngineRPM>`
- `getAllVehicleScripts(): ArrayList<VehicleScript>`
- `getAllVehicleTemplates(): ArrayList<VehicleTemplate>`
- `getAllXuiColors(): ArrayList<XuiColorsScript>`
- `getAllXuiConfigScripts(): ArrayList<XuiConfigScript>`
- `getAllXuiDefaultStyles(): ArrayList<XuiLayoutScript>`
- `getAllXuiLayouts(): ArrayList<XuiLayoutScript>`
- `getAllXuiSkinScripts(): ArrayList<XuiSkinScript>`
- `getAllXuiStyles(): ArrayList<XuiLayoutScript>`
- `getAnimationsMesh(String name): AnimationsMesh`
- `getBuildableRecipe(String recipe): CraftRecipe`
- `getCharacterProfessionScript(String name): CharacterProfessionDefinitionScript`
- `getCharacterTraitScript(String name): CharacterTraitDefinitionScript`
- `getChecksum(): String`
- `getClockScript(String name): ClockScript`
- `getCraftRecipe(String name): CraftRecipe`
- `getEnergyDefinitionScript(String name): EnergyDefinitionScript`
- `getEvolvedRecipe(String name): EvolvedRecipe`
- `getFixing(String name): Fixing`
- `getFluidDefinitionScript(String name): FluidDefinitionScript`
- `getFluidFilter(String name): FluidFilterScript`
- `getGameEntityScript(String name): GameEntityScript`
- `getGameEntityTemplate(String name): GameEntityTemplate`
- `getGameSound(String name): GameSoundScript`
- `getItem(String name): Item`
- `getItemConfig(String name): ItemConfig`
- `getItemFilter(String name): ItemFilterScript`
- `getItemForClothingItem(String clothingName): Item`
- `getItemTypeForClothingItem(String clothingItem): String`
- `getItemsByType(String type): ArrayList<Item>`
- `getItemsTag(ItemTag itemTag): ArrayList<Item>`
- `getMannequinScript(String name): MannequinScript`
- `getModelScript(String name): ModelScript`
- `getModule(String name): ScriptModule`
- `getModule(String name, boolean defaultToBase): ScriptModule`
- `getModuleNoDisableCheck(String name): ScriptModule`
- `getPhysicsHitReactionScript(String name): PhysicsHitReactionScript`
- `getPhysicsShape(String name): PhysicsShapeScript`
- `getRagdollScript(String name): RagdollScript`
- `getRandomVehicleScript(): VehicleScript`
- `getRecipe(String name): Recipe`
- `getRuntimeAnimationScript(String name): RuntimeAnimationScript`
- `getScriptsForType(ScriptType type): ArrayList<?>`
- `getSoundTimeline(String name): SoundTimelineScript`
- `getSpecificEntity(String name): GameEntityScript`
- `getSpecificItem(String name): Item`
- `getSpriteModel(String name): SpriteModel`
- `getStringList(String name): StringListScript`
- `getTimedActionScript(String name): TimedActionScript`
- `getUniqueRecipe(String name): UniqueRecipe`
- `getVehicle(String name): VehicleScript`
- `getVehicleEngineRPM(String name): VehicleEngineRPM`
- `getVehicleTemplate(String name): VehicleTemplate`
- `getXuiColor(String name): XuiColorsScript`
- `getXuiConfigScript(String name): XuiConfigScript`
- `getXuiDefaultStyle(String name): XuiLayoutScript`
- `getXuiLayout(String name): XuiLayoutScript`
- `getXuiSkinScript(String name): XuiSkinScript`
- `getXuiStyle(String name): XuiLayoutScript`
- `getZedDmgMap(): ArrayList<String>`
- `hasLoadErrors(): boolean`
- `hasLoadErrors(boolean onlyCritical): boolean`
- `isDrainableItemType(String itemType): boolean`
- `resolveItemType(ScriptModule module, String itemType): String`
- `resolveModelScript(ScriptModule module, String modelScriptName): String`
- `searchFolders(URI base, File fo, List<String> loadList): void`
- `update(): void`

Static functions, called as `ScriptManager.name(...)`:

- `EnableDebug(ScriptType type, boolean enable): void`
- `getCurrentLoadFileAbsPath(): String`
- `getCurrentLoadFileMod(): String`
- `getCurrentLoadFileName(): String`
- `getItemName(String name): String`
- `isDebugEnabled(ScriptType type): boolean`
- `println(ScriptType type, String msg): void`
- `println(BaseScriptObject scriptObject, String msg): void`
- `resolveGetItemTypes(ArrayList<String> sourceItems, ArrayList<Item> scriptItems): void`

Constructors: `ScriptManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `Base: String`, `Base_Module: String`, `VanillaID: String`, `instance: ScriptManager`.

### ScriptType

`zombie.scripting.ScriptType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getScriptTag(): String`
- `hasFlag(ScriptType.Flags flag): boolean`
- `hasFlags(EnumSet<ScriptType.Flags> flags): boolean`
- `hashCode(): int` from `Enum`
- `isCritical(): boolean`
- `isTemplate(): boolean`
- `isVerbose(): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `setVerbose(boolean b): void`
- `toString(): String` from `Enum`

Static functions, called as `ScriptType.name(...)`:

- `GetEnumListLua(): ArrayList<ScriptType>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ScriptType`
- `values(): ScriptType[]`

Enum values (read as `ScriptType.VALUE`): `AnimationMesh`, `CharacterProfessionDefinition`, `CharacterTraitDefinition`, `Clock`, `CraftRecipe`, `EnergyDefinition`, `Entity`, `EntityComponent`, `EntityTemplate`, `EvolvedRecipe`, `Fixing`, `FluidDefinition`, `FluidFilter`, `Item`, `ItemConfig`, `ItemFilter`, `Mannequin`, `Model`, `PhysicsHitReaction`, `PhysicsShape`, `Ragdoll`, `Recipe`, `RuntimeAnimation`, `Sound`, `SoundTimeline`, `SpriteModel`, `StringList`, `TimedAction`, `UniqueRecipe`, `Vehicle`, `VehicleEngineRPM`, `VehicleTemplate`, `XuiColor`, `XuiConfig`, `XuiDefaultStyle`, `XuiLayout`, `XuiSkin`, `XuiStyle`.

### TextAlign

`zombie.scripting.ui.TextAlign`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `TextAlign.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): TextAlign`
- `values(): TextAlign[]`

Enum values (read as `TextAlign.VALUE`): `Center`, `Left`, `Right`.

### VectorPosAlign

`zombie.scripting.ui.VectorPosAlign`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getX(XuiScript.XuiVector v): float`
- `getXmod(): float`
- `getY(XuiScript.XuiVector v): float`
- `getYmod(): float`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `VectorPosAlign.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): VectorPosAlign`
- `values(): VectorPosAlign[]`

Enum values (read as `VectorPosAlign.VALUE`): `BottomLeft`, `BottomMiddle`, `BottomRight`, `CenterLeft`, `CenterMiddle`, `CenterRight`, `None`, `TopLeft`, `TopMiddle`, `TopRight`.

### XuiAutoApply

`zombie.scripting.ui.XuiAutoApply`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `XuiAutoApply.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): XuiAutoApply`
- `values(): XuiAutoApply[]`

Enum values (read as `XuiAutoApply.VALUE`): `Always`, `Forbidden`, `IfSet`, `IfSetAndKeyExists`, `No`.

### XuiLuaStyle

`zombie.scripting.ui.XuiLuaStyle`, class.

Methods, called as `obj:name(...)`:

- `copyVarsFrom(XuiLuaStyle other): void`
- `getVar(String key): XuiLuaStyle.XuiVar<?, ?>`
- `getVars(): ArrayList<XuiLuaStyle.XuiVar<?, ?>>`
- `getXuiLuaClass(): String`
- `getXuiStyleName(): String`
- `loadVar(String key, String val): boolean`
- `toString(): String`

Static functions, called as `XuiLuaStyle.name(...)`:

- `ReadConfigs(ArrayList<XuiConfigScript> configs): void`
- `Reset(): void`

Static fields (a copy of the value taken when the class is exposed): `ALLOWED_VAR_TYPES: EnumSet<XuiVarType>`.

### XuiLuaStyle.XuiBoolean

`zombie.scripting.ui.XuiLuaStyle.XuiBoolean`, class. Extends [XuiLuaStyle.XuiVar](#xuiluastylexuivar). Also has the methods of [XuiLuaStyle.XuiVar](#xuiluastylexuivar) (10), listed on their own entries.

### XuiLuaStyle.XuiColor

`zombie.scripting.ui.XuiLuaStyle.XuiColor`, class. Extends [XuiLuaStyle.XuiVar](#xuiluastylexuivar). Also has the methods of [XuiLuaStyle.XuiVar](#xuiluastylexuivar) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getA(): float`
- `getB(): float`
- `getG(): float`
- `getR(): float`
- `getValueString(): String`

### XuiLuaStyle.XuiDouble

`zombie.scripting.ui.XuiLuaStyle.XuiDouble`, class. Extends [XuiLuaStyle.XuiVar](#xuiluastylexuivar). Also has the methods of [XuiLuaStyle.XuiVar](#xuiluastylexuivar) (10), listed on their own entries.

### XuiLuaStyle.XuiFontType

`zombie.scripting.ui.XuiLuaStyle.XuiFontType`, class. Extends [XuiLuaStyle.XuiVar](#xuiluastylexuivar). Also has the methods of [XuiLuaStyle.XuiVar](#xuiluastylexuivar) (10), listed on their own entries.

### XuiLuaStyle.XuiString

`zombie.scripting.ui.XuiLuaStyle.XuiString`, class. Extends [XuiLuaStyle.XuiVar](#xuiluastylexuivar). Also has the methods of [XuiLuaStyle.XuiVar](#xuiluastylexuivar) (10), listed on their own entries.

### XuiLuaStyle.XuiStringList

`zombie.scripting.ui.XuiLuaStyle.XuiStringList`, class. Extends [XuiLuaStyle.XuiVar](#xuiluastylexuivar). Also has the methods of [XuiLuaStyle.XuiVar](#xuiluastylexuivar) (10), listed on their own entries.

### XuiLuaStyle.XuiTexture

`zombie.scripting.ui.XuiLuaStyle.XuiTexture`, class. Extends [XuiLuaStyle.XuiVar](#xuiluastylexuivar). Also has the methods of [XuiLuaStyle.XuiVar](#xuiluastylexuivar) (10), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getTexture(): Texture`

### XuiLuaStyle.XuiTranslateString

`zombie.scripting.ui.XuiLuaStyle.XuiTranslateString`, class. Extends [XuiLuaStyle.XuiVar](#xuiluastylexuivar). Also has the methods of [XuiLuaStyle.XuiVar](#xuiluastylexuivar) (8), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getValueString(): String`
- `value(): String`

### XuiLuaStyle.XuiVar

`zombie.scripting.ui.XuiLuaStyle.XuiVar`, abstract class.

Methods, called as `obj:name(...)`:

- `getAutoApplyMode(): XuiAutoApply`
- `getLuaTableKey(): String`
- `getType(): XuiVarType`
- `getUiOrder(): int`
- `getValueString(): String`
- `isValueSet(): boolean`
- `setAutoApplyMode(XuiAutoApply autoApplyMode): void`
- `setUiOrder(int order): int`
- `setValue(T value): void`
- `value(): T`

### XuiManager

`zombie.scripting.ui.XuiManager`, class.

Static functions, called as `XuiManager.name(...)`:

- `GetAllDefaultStyles(): ArrayList<XuiScript>`
- `GetAllLayouts(): ArrayList<XuiScript>`
- `GetAllStyles(): ArrayList<XuiScript>`
- `GetCombinedScripts(): ArrayList<XuiScript>`
- `GetDefaultSkin(): XuiSkin`
- `GetDefaultStyle(String luaClass): XuiScript`
- `GetDefaultStyleScript(String name): XuiLayoutScript`
- `GetLayout(String name): XuiScript`
- `GetLayoutScript(String name): XuiLayoutScript`
- `GetSkin(String name): XuiSkin`
- `GetStyle(String style): XuiScript`
- `GetStyleScript(String name): XuiLayoutScript`
- `ParseScripts(): void`
- `getDefaultSkinName(): String`
- `setParseOnce(boolean b): void`

Constructors: `XuiManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `XUI_SCRIPT_TYPES: EnumSet<ScriptType>`.

### XuiReference

`zombie.scripting.ui.XuiReference`, class. Extends [XuiScript](#xuiscript). Also has the methods of [XuiScript](#xuiscript) (89), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(ScriptParser.Block block): void`
- `addChild(XuiScript child): void`
- `getDynamic(): XuiScript.XuiBoolean`
- `getLayout(): XuiScript.XuiString`
- `getReferenceLayout(): XuiScript`
- `setDefaultStyle(XuiScript defaultStyle): void`
- `setStyle(XuiScript style): void`

Constructors: `XuiReference.new(String xuiLayoutName, boolean readAltKeys)`.

### XuiScript

`zombie.scripting.ui.XuiScript`, class.

Methods, called as `obj:name(...)`:

- `Load(ScriptParser.Block block): void`
- `addChild(XuiScript child): void`
- `getAllowDropAlways(): XuiScript.XuiBoolean`
- `getAnchorBottom(): XuiScript.XuiBoolean`
- `getAnchorLeft(): XuiScript.XuiBoolean`
- `getAnchorRight(): XuiScript.XuiBoolean`
- `getAnchorTop(): XuiScript.XuiBoolean`
- `getAnimationList(): XuiScript.XuiStringList`
- `getAnimationTime(): XuiScript.XuiFloat`
- `getBackDropTexCol(): XuiScript.XuiColor`
- `getBackground(): XuiScript.XuiBoolean`
- `getBackgroundColor(): XuiScript.XuiColor`
- `getBackgroundColorHL(): XuiScript.XuiColor`
- `getBackgroundColorHLInv(): XuiScript.XuiColor`
- `getBackgroundColorHLVal(): XuiScript.XuiColor`
- `getBackgroundColorMouseOver(): XuiScript.XuiColor`
- `getBackgroundEmpty(): XuiScript.XuiColor`
- `getBackgroundHover(): XuiScript.XuiColor`
- `getBorderColor(): XuiScript.XuiColor`
- `getBorderColorHL(): XuiScript.XuiColor`
- `getBorderColorHLInv(): XuiScript.XuiColor`
- `getBorderColorHLVal(): XuiScript.XuiColor`
- `getBorderInput(): XuiScript.XuiColor`
- `getBorderInvalid(): XuiScript.XuiColor`
- `getBorderLocked(): XuiScript.XuiColor`
- `getBorderOutput(): XuiScript.XuiColor`
- `getBorderValid(): XuiScript.XuiColor`
- `getChildren(): ArrayList<XuiScript>`
- `getChoicesColor(): XuiScript.XuiColor`
- `getDefaultStyle(): XuiScript`
- `getDisplayBackground(): XuiScript.XuiBoolean`
- `getDoBackDropTex(): XuiScript.XuiBoolean`
- `getDoBorderLocked(): XuiScript.XuiBoolean`
- `getDoHighlight(): XuiScript.XuiBoolean`
- `getDoInvalidHighlight(): XuiScript.XuiBoolean`
- `getDoToolTip(): XuiScript.XuiBoolean`
- `getDoValidHighlight(): XuiScript.XuiBoolean`
- `getDrawBackground(): XuiScript.XuiBoolean`
- `getDrawBorder(): XuiScript.XuiBoolean`
- `getDrawGrid(): XuiScript.XuiBoolean`
- `getFont(): XuiScript.XuiFontType`
- `getFont2(): XuiScript.XuiFontType`
- `getFont3(): XuiScript.XuiFontType`
- `getGridColor(): XuiScript.XuiColor`
- `getHsbFactor(): XuiScript.XuiColor`
- `getIcon(): XuiScript.XuiTexture`
- `getIconVector(): XuiScript.XuiVector`
- `getMargin(): XuiScript.XuiSpacing`
- `getMinimumHeight(): XuiScript.XuiFloat`
- `getMinimumWidth(): XuiScript.XuiFloat`
- `getMouseEnabled(): XuiScript.XuiBoolean`
- `getMouseOverText(): XuiScript.XuiTranslateString`
- `getMoveWithMouse(): XuiScript.XuiBoolean`
- `getName(): XuiScript.XuiTranslateString`
- `getPadding(): XuiScript.XuiSpacing`
- `getPosAlign(): XuiScript.XuiVectorPosAlign`
- `getScriptType(): XuiScriptType`
- `getStoreItem(): XuiScript.XuiBoolean`
- `getStyle(): XuiScript`
- `getTextAlign(): XuiScript.XuiTextAlign`
- `getTextColor(): XuiScript.XuiColor`
- `getTexture(): XuiScript.XuiTexture`
- `getTextureBackground(): XuiScript.XuiTexture`
- `getTextureColor(): XuiScript.XuiColor`
- `getTextureOverride(): XuiScript.XuiTexture`
- `getTickTexture(): XuiScript.XuiTexture`
- `getTitle(): XuiScript.XuiTranslateString`
- `getToolTipTextItem(): XuiScript.XuiTranslateString`
- `getToolTipTextLocked(): XuiScript.XuiTranslateString`
- `getTooltip(): XuiScript.XuiTranslateString`
- `getVar(String key): XuiScript.XuiVar<?, ?>`
- `getVars(): ArrayList<XuiScript.XuiVar<?, ?>>`
- `getVector(): XuiScript.XuiVector`
- `getXuiCustomDebug(): String`
- `getXuiKey(): String`
- `getXuiLayoutName(): String`
- `getXuiLuaClass(): String`
- `getXuiStyle(): String`
- `getXuiUUID(): String`
- `isAnyStyle(): boolean`
- `isDefaultStyle(): boolean`
- `isLayout(): boolean`
- `isStyle(): boolean`
- `loadVar(String key, String val): boolean`
- `loadVar(String key, String val, boolean allowNull): boolean`
- `setDefaultStyle(XuiScript defaultStyle): void`
- `setStyle(XuiScript style): void`
- `setXuiKey(String xuiKey): XuiScript`
- `setXuiLuaClass(String xuiLuaClass): XuiScript`
- `setXuiStyle(String xuiStyle): XuiScript`
- `toString(): String`

Static functions, called as `XuiScript.name(...)`:

- `CreateScriptForClass(String xuiLayoutName, String luaClass, boolean readAltKeys, XuiScriptType scriptType): XuiScript`
- `ReadLuaClassValue(ScriptParser.Block block): String`

Constructors: `XuiScript.new(String xuiLayoutName, boolean readAltKeys, String xuiLuaClass)`, `XuiScript.new(String xuiLayoutName, boolean readAltKeys, String xuiLuaClass, XuiScriptType type)`.

### XuiScript.XuiBoolean

`zombie.scripting.ui.XuiScript.XuiBoolean`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiColor

`zombie.scripting.ui.XuiScript.XuiColor`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (16), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getA(): float`
- `getB(): float`
- `getG(): float`
- `getR(): float`
- `getValueString(): String`

### XuiScript.XuiDouble

`zombie.scripting.ui.XuiScript.XuiDouble`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiFloat

`zombie.scripting.ui.XuiScript.XuiFloat`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiFontType

`zombie.scripting.ui.XuiScript.XuiFontType`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiFunction

`zombie.scripting.ui.XuiScript.XuiFunction`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiInteger

`zombie.scripting.ui.XuiScript.XuiInteger`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiSpacing

`zombie.scripting.ui.XuiScript.XuiSpacing`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (15), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getBottom(): float`
- `getLeft(): float`
- `getRight(): float`
- `getTop(): float`
- `getValueString(): String`
- `isBottomPercent(): boolean`
- `isLeftPercent(): boolean`
- `isRightPercent(): boolean`
- `isTopPercent(): boolean`
- `isValueSet(): boolean`

Constructors: `XuiScript.XuiSpacing.new(XuiScript parent, String key, XuiScript.XuiUnit top, XuiScript.XuiUnit right, XuiScript.XuiUnit bottom, XuiScript.XuiUnit left)`.

### XuiScript.XuiString

`zombie.scripting.ui.XuiScript.XuiString`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiStringList

`zombie.scripting.ui.XuiScript.XuiStringList`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiTextAlign

`zombie.scripting.ui.XuiScript.XuiTextAlign`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScript.XuiTexture

`zombie.scripting.ui.XuiScript.XuiTexture`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getTexture(): Texture`

### XuiScript.XuiTranslateString

`zombie.scripting.ui.XuiScript.XuiTranslateString`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (15), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getValueString(): String`
- `value(): String`

### XuiScript.XuiUnit

`zombie.scripting.ui.XuiScript.XuiUnit`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (16), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getValueString(): String`
- `isPercent(): boolean`
- `setValue(float val, boolean isPercent): void`

### XuiScript.XuiVar

`zombie.scripting.ui.XuiScript.XuiVar`, abstract class.

Methods, called as `obj:name(...)`:

- `getAutoApplyMode(): XuiAutoApply`
- `getDefaultStyle(): XuiScript.XuiVar<T, C>`
- `getLuaTableKey(): String`
- `getStyle(): XuiScript.XuiVar<T, C>`
- `getType(): XuiVarType`
- `getUiOrder(): int`
- `getValueString(): String`
- `getValueType(): XuiScriptType`
- `isIgnoreStyling(): boolean`
- `isScriptLoadEnabled(): boolean`
- `isStyle(): boolean`
- `isValueSet(): boolean`
- `setAutoApplyMode(XuiAutoApply autoApplyMode): void`
- `setScriptLoadEnabled(boolean b): void`
- `setUiOrder(int order): int`
- `setValue(T value): void`
- `value(): T`

### XuiScript.XuiVector

`zombie.scripting.ui.XuiScript.XuiVector`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (15), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getH(): float`
- `getHeight(): float`
- `getValueString(): String`
- `getW(): float`
- `getWidth(): float`
- `getX(): float`
- `getY(): float`
- `isValueSet(): boolean`
- `ishPercent(): boolean`
- `iswPercent(): boolean`
- `isxPercent(): boolean`
- `isyPercent(): boolean`

Constructors: `XuiScript.XuiVector.new(XuiScript parent, String key, XuiScript.XuiUnit x, XuiScript.XuiUnit y, XuiScript.XuiUnit w, XuiScript.XuiUnit h)`.

### XuiScript.XuiVectorPosAlign

`zombie.scripting.ui.XuiScript.XuiVectorPosAlign`, class. Extends [XuiScript.XuiVar](#xuiscriptxuivar). Also has the methods of [XuiScript.XuiVar](#xuiscriptxuivar) (17), listed on their own entries.

### XuiScriptType

`zombie.scripting.ui.XuiScriptType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `XuiScriptType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): XuiScriptType`
- `values(): XuiScriptType[]`

Enum values (read as `XuiScriptType.VALUE`): `DefaultStyle`, `Layout`, `Reference`, `Style`.

### XuiSkin

`zombie.scripting.ui.XuiSkin`, class.

Methods, called as `obj:name(...)`:

- `color(String alias): Color`
- `debugPrint(): void`
- `get(String luaClass, String alias): XuiLuaStyle`
- `getComponentUiStyle(String entityAlias, ComponentType componentType): XuiSkin.ComponentUiStyle`
- `getDefault(String luaClass): XuiLuaStyle`
- `getEntityDisplayName(String entityAlias): String`
- `getEntityUiStyle(String alias): XuiSkin.EntityUiStyle`
- `getName(): String`
- `isInvalidated(): boolean`

Static functions, called as `XuiSkin.name(...)`:

- `Default(): XuiSkin`
- `getDefaultSkinName(): String`

Constructors: `XuiSkin.new(String name, XuiSkinScript script)`.

### XuiSkin.ComponentUiStyle

`zombie.scripting.ui.XuiSkin.ComponentUiStyle`, class.

Methods, called as `obj:name(...)`:

- `getDisplayName(): String`
- `getIcon(): Texture`
- `getListOrderZ(): int`
- `getLuaPanelClass(): String`
- `getXuiStyle(): String`
- `isEnabled(): boolean`

Constructors: `XuiSkin.ComponentUiStyle.new()`.

### XuiSkin.EntityUiStyle

`zombie.scripting.ui.XuiSkin.EntityUiStyle`, class.

Methods, called as `obj:name(...)`:

- `getBuildDescription(): String`
- `getComponentUiStyle(ComponentType componentType): XuiSkin.ComponentUiStyle`
- `getDescription(): String`
- `getDisplayName(): String`
- `getIcon(): Texture`
- `getLuaCanOpenWindow(): Object`
- `getLuaOpenWindow(): Object`
- `getLuaWindowClass(): String`
- `getXuiStyle(): String`
- `isComponentEnabled(ComponentType componentType): boolean`

Constructors: `XuiSkin.EntityUiStyle.new()`.

### XuiTableScript

`zombie.scripting.ui.XuiTableScript`, class. Extends [XuiScript](#xuiscript). Also has the methods of [XuiScript](#xuiscript) (92), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(ScriptParser.Block block): void`
- `LoadColumnsRows(ScriptParser.Block block, ArrayList<T> list): void`
- `getCell(int column, int row): XuiScript`
- `getCellStyle(): XuiScript.XuiString`
- `getColumn(int index): XuiScript`
- `getColumnCount(): int`
- `getColumnStyle(): XuiScript.XuiString`
- `getRow(int index): XuiScript`
- `getRowCount(): int`
- `getRowStyle(): XuiScript.XuiString`

Constructors: `XuiTableScript.new(String xuiLayoutName, boolean readAltKeys, XuiScriptType type)`.

### XuiTableScript.XuiTableCellScript

`zombie.scripting.ui.XuiTableScript.XuiTableCellScript`, class. Extends [XuiScript](#xuiscript). Also has the methods of [XuiScript](#xuiscript) (93), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isCellHasLoaded(): boolean`

Constructors: `XuiTableScript.XuiTableCellScript.new(String xuiLayoutName, boolean readAltKeys, XuiScript style)`.

### XuiTableScript.XuiTableColumnScript

`zombie.scripting.ui.XuiTableScript.XuiTableColumnScript`, class. Extends [XuiScript](#xuiscript). Also has the methods of [XuiScript](#xuiscript) (93), listed on their own entries.

Constructors: `XuiTableScript.XuiTableColumnScript.new(String xuiLayoutName, boolean readAltKeys, XuiScript style)`.

### XuiTableScript.XuiTableRowScript

`zombie.scripting.ui.XuiTableScript.XuiTableRowScript`, class. Extends [XuiScript](#xuiscript). Also has the methods of [XuiScript](#xuiscript) (93), listed on their own entries.

Constructors: `XuiTableScript.XuiTableRowScript.new(String xuiLayoutName, boolean readAltKeys, XuiScript style)`.

### XuiVarType

`zombie.scripting.ui.XuiVarType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `XuiVarType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): XuiVarType`
- `values(): XuiVarType[]`

Enum values (read as `XuiVarType.VALUE`): `Boolean`, `Color`, `Double`, `Float`, `FontType`, `Function`, `Integer`, `String`, `StringList`, `TextAlign`, `Texture`, `TranslateString`, `Unit`, `Vector`, `VectorPosAlign`.
