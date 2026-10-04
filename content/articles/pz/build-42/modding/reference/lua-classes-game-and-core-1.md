---
slug: lua-classes-game-and-core-1
title: 'Lua Classes: Game, core and utilities, part 1 of 2 (Build 42.21)'
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
excerpt: 'The exposed game, core and utilities classes of Build 42.21 (part 1 of 2): every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Game, core and utilities, part 1 of 2

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The game itself: Core, the game time, sandbox options, game states, the Lua manager, debug options and the utility classes.

This page holds 88 classes and 2,313 methods, part 1 of 2 of this area (from `BloodBodyPartType` to `LuaManager.GlobalObject.LuaFileWriter`), from the packages `zombie`, `zombie.Lua`, `zombie.characterTextures`, `zombie.config`, `zombie.core`, `zombie.core.fonts`, `zombie.core.logger`, `zombie.core.math`, `zombie.core.physics`, `zombie.core.properties`, `zombie.core.skinnedmodel.advancedanimation.debug`, `zombie.core.skinnedmodel.population`, `zombie.core.skinnedmodel.runtime`, `zombie.core.skinnedmodel.visual`, `zombie.core.stash`, `zombie.core.textures`, `zombie.core.znet`, `zombie.debug`, `zombie.debug.objects`, `zombie.gameStates`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### BloodBodyPartType

`zombie.characterTextures.BloodBodyPartType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getCharacterMaskParts(): CharacterMask.Part[]`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getDisplayName(): String`
- `hashCode(): int` from `Enum`
- `index(): int`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `BloodBodyPartType.name(...)`:

- `FromIndex(int index): BloodBodyPartType`
- `FromString(String str): BloodBodyPartType`
- `ToIndex(BloodBodyPartType bpt): int`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): BloodBodyPartType`
- `values(): BloodBodyPartType[]`

Enum values (read as `BloodBodyPartType.VALUE`): `Back`, `Foot_L`, `Foot_R`, `ForeArm_L`, `ForeArm_R`, `Groin`, `Hand_L`, `Hand_R`, `Head`, `LowerLeg_L`, `LowerLeg_R`, `MAX`, `Neck`, `Torso_Lower`, `Torso_Upper`, `UpperArm_L`, `UpperArm_R`, `UpperLeg_L`, `UpperLeg_R`.

### BloodClothingType

`zombie.characterTextures.BloodClothingType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `BloodClothingType.name(...)`:

- `addBasicPatch(BloodBodyPartType part, HumanVisual humanVisual, ArrayList<ItemVisual> itemVisuals): void`
- `addBlood(int count, HumanVisual humanVisual, ArrayList<ItemVisual> itemVisuals, boolean allLayers): void`
- `addBlood(BloodBodyPartType part, float intensity, HumanVisual humanVisual, ArrayList<ItemVisual> itemVisuals, boolean allLayers): void`
- `addBlood(BloodBodyPartType part, HumanVisual humanVisual, ArrayList<ItemVisual> itemVisuals, boolean allLayers): void`
- `addDirt(BloodBodyPartType part, float intensity, HumanVisual humanVisual, ArrayList<ItemVisual> itemVisuals, boolean allLayers): void`
- `addDirt(BloodBodyPartType part, HumanVisual humanVisual, ArrayList<ItemVisual> itemVisuals, boolean allLayers): void`
- `addHole(BloodBodyPartType part, HumanVisual humanVisual, ArrayList<ItemVisual> itemVisuals, boolean allLayers): boolean`
- `addHole(BloodBodyPartType part, HumanVisual humanVisual, ArrayList<ItemVisual> itemVisuals): void`
- `calcTotalBloodLevel(Clothing clothing): void`
- `calcTotalDirtLevel(Clothing clothing): void`
- `fromString(String str): BloodClothingType`
- `getCoveredPartCount(ArrayList<BloodClothingType> bloodClothingType): int`
- `getCoveredParts(ArrayList<BloodClothingType> bloodClothingType): ArrayList<BloodBodyPartType>`
- `getCoveredParts(ArrayList<BloodClothingType> bloodClothingType, ArrayList<BloodBodyPartType> result): ArrayList<BloodBodyPartType>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): BloodClothingType`
- `values(): BloodClothingType[]`

Enum values (read as `BloodClothingType.VALUE`): `Apron`, `Bag`, `Foot_L`, `Foot_R`, `ForeArm_L`, `ForeArm_R`, `FullHelmet`, `Groin`, `Hand_L`, `Hand_R`, `Hands`, `Head`, `Jacket`, `Jumper`, `JumperNoSleeves`, `LongJacket`, `LowerArms`, `LowerBody`, `LowerLeg_L`, `LowerLeg_R`, `LowerLegs`, `Neck`, `Shirt`, `ShirtLongSleeves`, `ShirtNoSleeves`, `Shoes`, `ShortsShort`, `Trousers`, `UpperArm_L`, `UpperArm_R`, `UpperArms`, `UpperBody`, `UpperLeg_L`, `UpperLeg_R`, `UpperLegs`.

### BooleanConfigOption

`zombie.config.BooleanConfigOption`, class. Extends [ConfigOption](#configoption). Also has the methods of [ConfigOption](#configoption) (4), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getDefaultValue(): boolean`
- `getTooltip(): String`
- `getType(): String`
- `getValue(): boolean`
- `getValueAsObject(): Object`
- `getValueAsString(): String`
- `isValidString(String s): boolean`
- `makeCopy(): ConfigOption`
- `parse(String s): void`
- `resetToDefault(): void`
- `setDefaultToCurrentValue(): void`
- `setValue(boolean value): void`
- `setValueFromObject(Object o): void`

Constructors: `BooleanConfigOption.new(String name, boolean defaultValue)`.

### ConfigOption

`zombie.config.ConfigOption`, abstract class.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `getTooltip(): String`
- `getType(): String`
- `getValueAsLuaString(): String`
- `getValueAsObject(): Object`
- `getValueAsString(): String`
- `invokeOnChangeEvent(): void`
- `isValidString(String var1): boolean`
- `makeCopy(): ConfigOption`
- `parse(String): void`
- `resetToDefault(): void`
- `setDefaultToCurrentValue(): void`
- `setOnChangeCallback(ConfigOption.ConfigOptionOnChangeCallback onChange): void`
- `setValueFromObject(Object var1): void`

Constructors: `ConfigOption.new(String name)`.

### DoubleConfigOption

`zombie.config.DoubleConfigOption`, class. Extends [ConfigOption](#configoption). Also has the methods of [ConfigOption](#configoption) (4), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getDefaultValue(): double`
- `getMax(): double`
- `getMin(): double`
- `getTooltip(): String`
- `getType(): String`
- `getValue(): double`
- `getValueAsObject(): Object`
- `getValueAsString(): String`
- `isValidString(String s): boolean`
- `makeCopy(): ConfigOption`
- `parse(String s): void`
- `resetToDefault(): void`
- `setDefault(double value): void`
- `setDefaultToCurrentValue(): void`
- `setValue(double value): void`
- `setValueFromObject(Object o): void`

Constructors: `DoubleConfigOption.new(String name, double min, double max, double defaultValue)`.

### EnumConfigOption

`zombie.config.EnumConfigOption`, class. Extends [IntegerConfigOption](#integerconfigoption). Also has the methods of [ConfigOption](#configoption) (4), [IntegerConfigOption](#integerconfigoption) (14), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getNumValues(): int`
- `getType(): String`

Constructors: `EnumConfigOption.new(String name, int numValues, int defaultValue)`.

### IntegerConfigOption

`zombie.config.IntegerConfigOption`, class. Extends [ConfigOption](#configoption). Also has the methods of [ConfigOption](#configoption) (4), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getDefaultValue(): int`
- `getMax(): double`
- `getMin(): double`
- `getTooltip(): String`
- `getType(): String`
- `getValue(): int`
- `getValueAsObject(): Object`
- `getValueAsString(): String`
- `isValidString(String s): boolean`
- `makeCopy(): ConfigOption`
- `parse(String s): void`
- `resetToDefault(): void`
- `setDefaultToCurrentValue(): void`
- `setValue(int value): void`
- `setValueFromObject(Object o): void`

Constructors: `IntegerConfigOption.new(String name, int min, int max, int defaultValue)`, `IntegerConfigOption.new(String name, int min, int max, int defaultValue, ConfigOption.ConfigOptionOnChangeCallback onChange)`.

### StringConfigOption

`zombie.config.StringConfigOption`, class. Extends [ConfigOption](#configoption). Also has the methods of [ConfigOption](#configoption) (3), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getDefaultValue(): String`
- `getSplitCSVList(): Set<String>`
- `getTooltip(): String`
- `getType(): String`
- `getValue(): String`
- `getValueAsLuaString(): String`
- `getValueAsObject(): Object`
- `getValueAsString(): String`
- `isValidString(String s): boolean`
- `makeCopy(): ConfigOption`
- `parse(String s): void`
- `resetToDefault(): void`
- `setDefaultToCurrentValue(): void`
- `setValue(String value): void`
- `setValueFromObject(Object o): void`

Constructors: `StringConfigOption.new(String name, String defaultValue, int maxLength)`, `StringConfigOption.new(String name, String defaultValue, String[] values)`, `StringConfigOption.new(String name, String defaultValue, ConfigOption.ConfigOptionOnChangeCallback onChange)`.

### Clipboard

`zombie.core.Clipboard`, class.

Static functions, called as `Clipboard.name(...)`:

- `getClipboard(): String`
- `initMainThread(): void`
- `rememberCurrentValue(): void`
- `setClipboard(String str): void`
- `updateMainThread(): void`

Constructors: `Clipboard.new()`.

### Color

`zombie.core.Color`, class.

Methods, called as `obj:name(...)`:

- `add(Color c): void`
- `addToCopy(Color c): Color`
- `brighter(): Color`
- `brighter(float scale): Color`
- `changeHSBValue(float hFactor, float sFactor, float bFactor): void`
- `darker(): Color`
- `darker(float scale): Color`
- `equalBytes(Color other): boolean`
- `equals(Object other): boolean`
- `fromColor(int valueABGR): void`
- `getAlpha(): int`
- `getAlphaByte(): int`
- `getAlphaFloat(): float`
- `getB(): float`
- `getBlue(): int`
- `getBlueByte(): int`
- `getBlueFloat(): float`
- `getG(): float`
- `getGreen(): int`
- `getGreenByte(): int`
- `getGreenFloat(): float`
- `getR(): float`
- `getRed(): int`
- `getRedByte(): int`
- `getRedFloat(): float`
- `hashCode(): int`
- `interp(Color to, float delta, Color dest): void`
- `load(ByteBuffer input, int worldVersion): void`
- `loadCompact(ByteBuffer input): void`
- `loadCompactNoAlpha(ByteBuffer input): void`
- `multiply(Color c): Color`
- `save(ByteBuffer output): void`
- `saveCompact(ByteBuffer output): void`
- `saveCompactNoAlpha(ByteBuffer output): void`
- `scale(float value): Color`
- `scaleCopy(float value): Color`
- `set(float r, float g, float b): Color`
- `set(float r, float g, float b, float a): Color`
- `set(Color other): Color`
- `setABGR(int valueABGR): void`
- `setColor(Color colorA, Color colorB, float delta): void`
- `toString(): String`

Static functions, called as `Color.name(...)`:

- `HSBtoRGB(float hue, float saturation, float brightness): Color`
- `HSBtoRGB(float hue, float saturation, float brightness, Color result): Color`
- `abgrToColor(int valueABGR, Color result): Color`
- `blendABGR(int valueABGR, int targetABGR): int`
- `blendBGR(int valueABGR, int targetABGR): int`
- `colorToABGR(float r, float g, float b, float a): int`
- `colorToABGR(Color val): int`
- `colorToABGR(ColorInfo val): int`
- `decode(String nm): Color`
- `getAlphaChannelFromABGR(int valueABGR): float`
- `getBlueChannelFromABGR(int valueABGR): float`
- `getGreenChannelFromABGR(int valueABGR): float`
- `getRedChannelFromABGR(int valueABGR): float`
- `lerpABGR(int colA, int colB, float alpha): int`
- `multiplyABGR(int valueABGR, int multiplierABGR): int`
- `multiplyBGR(int valueABGR, int multiplierABGR): int`
- `random(): Color`
- `setAlphaChannelToABGR(int valueABGR, float a): int`
- `setBlueChannelToABGR(int valueABGR, float b): int`
- `setGreenChannelToABGR(int valueABGR, float g): int`
- `setRedChannelToABGR(int valueABGR, float r): int`
- `tintABGR(int targetABGR, int tintABGR): int`

Constructors: `Color.new()`, `Color.new(float r, float g, float b)`, `Color.new(float r, float g, float b, float a)`, `Color.new(int value)`, `Color.new(int r, int g, int b)`, `Color.new(int r, int g, int b, int a)`, `Color.new(Color color)`, `Color.new(Color colorA, Color colorB, float delta)`.

Static fields (a copy of the value taken when the class is exposed): `black: Color`, `blue: Color`, `cyan: Color`, `darkGray: Color`, `darkGreen: Color`, `gray: Color`, `green: Color`, `lightGray: Color`, `lightGreen: Color`, `magenta: Color`, `orange: Color`, `pink: Color`, `purple: Color`, `red: Color`, `transparent: Color`, `white: Color`, `yellow: Color`.

### Colors

`zombie.core.Colors`, class.

Static functions, called as `Colors.name(...)`:

- `AddGameColor(String name, Color color): Color`
- `CB_ColorExists(String name): boolean`
- `CB_GetColorByName(String name): Color`
- `CB_GetColorFromIndex(int index): Color`
- `CB_GetColorNameFromIndex(int index): String`
- `CB_GetColorNames(): ArrayList<String>`
- `CB_GetColorsCount(): int`
- `CB_GetRandomColor(): Color`
- `ColorExists(String name): boolean`
- `GetColorByName(String name): Color`
- `GetColorFromIndex(int index): Color`
- `GetColorInfo(String name): Colors.ColNfo`
- `GetColorNameFromIndex(int index): String`
- `GetColorNames(): ArrayList<String>`
- `GetColorsCount(): int`
- `GetRandomColor(): Color`
- `getNameFromColor(Color color): String`

Constructors: `Colors.new()`.

Static fields (a copy of the value taken when the class is exposed): `AliceBlue: Color`, `AntiqueWhite: Color`, `Aqua: Color`, `Aquamarine: Color`, `Azure: Color`, `Beige: Color`, `Bisque: Color`, `Black: Color`, `BlanchedAlmond: Color`, `Blue: Color`, `BlueViolet: Color`, `Brown: Color`, `BurlyWood: Color`, `CB_B0_Submerge: Color`, `CB_B1_Elvis: Color`, `CB_B2_FlatMediumBlue: Color`, `CB_B3_ClearBlue: Color`, `CB_B4_Azure: Color`, `CB_B5_SpiroDiscoBall: Color`, `CB_B6_AquaBlue: Color`, `CB_B7_LightBrilliantCyan: Color`, `CB_G0_SherwoodGreen: Color`, `CB_G1_PthaloGreen: Color`, `CB_G2_TropicalRainForest: Color`, `CB_G3_Observatory: Color`, `CB_G4_JungleGreen: Color`, `CB_G5_Dali: Color`, `CB_G6_AquaMarine: Color`, `CB_G7_LightAqua: Color`, `CB_R0_DeepAmaranth: Color`, `CB_R1_HotChile: Color`, `CB_R2_Smashing: Color`, `CB_R3_GeraniumLake: Color`, `CB_R4_RedOrange: Color`, `CB_R5_Crusta: Color`, `CB_R6_GoldenYellow: Color`, `CB_R7_BananaYellow: Color`, `CB_White: Color`, `CadetBlue: Color`, `Chartreuse: Color`, `Chocolate: Color`, `Cola: Color`, `Coral: Color`, `CornFlowerBlue: Color`, `Cornsilk: Color`, `Crimson: Color`, `Cyan: Color`, `DarkBlue: Color`, `DarkCyan: Color`, `DarkGoldenrod: Color`, `DarkGray: Color`, `DarkGreen: Color`, `DarkKhaki: Color`, `DarkMagenta: Color`, `DarkOliveGreen: Color`, `DarkOrange: Color`, `DarkOrchid: Color`, `DarkRed: Color`, `DarkSalmon: Color`, `DarkSeaGreen: Color`, `DarkSlateBlue: Color`, `DarkSlateGray: Color`, `DarkTurquoise: Color`, `DarkViolet: Color`, `DeepPink: Color`, `DeepSkyBlue: Color`, `DimGray: Color`, `DodgerBlue: Color`, `FireBrick: Color`, `FloralWhite: Color`, `ForestGreen: Color`, `FruitPunch: Color`, `Fuchsia: Color`, `Gainsboro: Color`, `GhostWhite: Color`, `Ginger: Color`, `Gold: Color`, `Goldenrod: Color`, `Gray: Color`, `Green: Color`, `GreenYellow: Color`, `Grenadine: Color`, `HoneyDew: Color`, `HotPink: Color`, `IndianRed: Color`, `Indigo: Color`, `Ivory: Color`, `Khaki: Color`, `Lavender: Color`, `LavenderBlush: Color`, `LawnGreen: Color`, `LemonChiffon: Color`, `LightBlue: Color`, `LightCoral: Color`, `LightCyan: Color`, `LightGoldenrodYellow: Color`, `LightGray: Color`, `LightGreen: Color`, `LightPink: Color`, `LightSalmon: Color`, `LightSeaGreen: Color`, `LightSkyBlue: Color`, `LightSlateGray: Color`, `LightSteelBlue: Color`, `LightYellow: Color`, `Lime: Color`, `LimeGreen: Color`, `Linen: Color`, `Magenta: Color`, `Maroon: Color`, `MediumAquamarine: Color`, `MediumBlue: Color`, `MediumOrchid: Color`, `MediumPurple: Color`, `MediumSeaGreen: Color`, `MediumSlateBlue: Color`, `MediumSpringGreen: Color`, `MediumTurquoise: Color`, `MediumVioletRed: Color`, `MidnightBlue: Color`, `MintCream: Color`, `MistyRose: Color`, `Moccasin: Color`, `NavajoWhite: Color`, `Navy: Color`, `OldLace: Color`, `Olive: Color`, `OliveDrab: Color`, `Orange: Color`, `OrangeRed: Color`, `Orchid: Color`, `PaleGoldenrod: Color`, `PaleGreen: Color`, `PaleTurquoise: Color`, `PaleVioletRed: Color`, `PapayaWhip: Color`, `PeachPuff: Color`, `Peru: Color`, `Pink: Color`, `Plum: Color`, `PowderBlue: Color`, `Purple: Color`, `RebeccaPurple: Color`, `Red: Color`, `RosyBrown: Color`, `RoyalBlue: Color`, `SaddleBrown: Color`, `Salmon: Color`, `SandyBrown: Color`, `SeaGreen: Color`, `SeaShell: Color`, `Sienna: Color`, `Silver: Color`, `SkyBlue: Color`, `SlateBlue: Color`, `SlateGray: Color`, `Snow: Color`, `SpringGreen: Color`, `SteelBlue: Color`, `Tan: Color`, `Teal: Color`, `Thistle: Color`, `Tomato: Color`, `Turquoise: Color`, `UI_Background: Color`, `Violet: Color`, `Wheat: Color`, `White: Color`, `WhiteSmoke: Color`, `Yellow: Color`, `YellowGreen: Color`.

### Colors.ColNfo

`zombie.core.Colors.ColNfo`, class.

Methods, called as `obj:name(...)`:

- `getB(): float`
- `getBInt(): int`
- `getColor(): Color`
- `getColorSet(): Colors.ColorSet`
- `getColorSetIndex(): int`
- `getG(): float`
- `getGInt(): int`
- `getHex(): String`
- `getName(): String`
- `getR(): float`
- `getRInt(): int`

Constructors: `Colors.ColNfo.new(String name, Color c, Colors.ColorSet colorSet)`.

### Colors.ColorSet

`zombie.core.Colors.ColorSet`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getIndex(): int`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `Colors.ColorSet.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): Colors.ColorSet`
- `values(): Colors.ColorSet[]`

Enum values (read as `Colors.ColorSet.VALUE`): `ColorBlind`, `Game`, `Standard`.

### Core

`zombie.core.Core`, class.

Methods, called as `obj:name(...)`:

- `ChangeWorldViewport(int w, int h, int player): void`
- `CheckDelayResetLua(): void`
- `DelayResetLua(String activeMods, String reason): void`
- `DoEndFrameStuff(int w, int h): void`
- `DoEndFrameStuffFx(int w, int h, int player): void`
- `DoFrameReady(): void`
- `DoPopIsoStuff(): void`
- `DoPushIsoParticleStuff(float ox, float oy, float oz): void`
- `DoPushIsoStuff(float ox, float oy, float oz, float useangle, boolean vehicle): void`
- `DoPushIsoStuff2D(float ox, float oy, float oz, float useangle, boolean vehicle): void`
- `DoStartFrameNoZoom(int w, int h, float zoom, int player, boolean isTextFrame, boolean isFx, boolean isSmartTexture): void`
- `DoStartFrameStuff(int w, int h, float zoom, int player): void`
- `DoStartFrameStuff(int w, int h, float zoom, int player, boolean isTextFrame): void`
- `DoStartFrameStuffSmartTextureFx(int w, int h, int player): void`
- `EndFrame(): void`
- `EndFrame(int nPlayer): void`
- `EndFrameText(int nPlayer): void`
- `EndFrameUI(): void`
- `MoveMethodToggle(): void`
- `RenderOffScreenBuffer(): void`
- `ResetLua(boolean sp, String reason): void`
- `ResetLua(String activeMods, String reason): void`
- `StartFrame(): void`
- `StartFrame(int nPlayer, boolean clear): void`
- `StartFrameFlipY(int w, int h, float zoom, int player): void`
- `StartFrameText(int nPlayer): void`
- `StartFrameUI(): boolean`
- `TakeFullScreenshot(String filename): void`
- `TakeScreenshot(): void`
- `TakeScreenshot(int width, int height, int readBuffer): void`
- `TakeScreenshot(int x, int y, int width, int height, int readBuffer): void`
- `addKeyBinding(String keyName, int key, int altKey, boolean shift, boolean ctrl, boolean alt): void`
- `addKeyBinding(KeybindId keybindID, int key, int altKey, boolean shift, boolean ctrl, boolean alt): void`
- `allowOptionTextureCompression(): boolean`
- `countMissing3DItems(): void`
- `debugOutputMissingCLothingSpawn(): String`
- `debugOutputMissingItemSpawn(): String`
- `debugOutputMissingSpawn(String directory, String category): String`
- `doZoomScroll(int playerIndex, int del): void`
- `exitToMenu(): void`
- `getAccountUsed(): Account`
- `getAltKey(String keyName): int`
- `getAltKey(KeybindId keybindID): int`
- `getAutoZoom(int playerIndex): boolean`
- `getBadHighlitedColor(): ColorInfo`
- `getBlinkingMoodle(): String`
- `getBreakModGameVersion(): GameVersion`
- `getBulletVersion(): String`
- `getChallengeID(): String`
- `getConsoleDotTxtSizeKB(): int`
- `getContentTranslationsEnabled(): boolean`
- `getCurrentPlayerZoom(): float`
- `getDebug(): boolean`
- `getDefaultZoomLevels(): ArrayList<Integer>`
- `getGameAndBuildVersion(): String`
- `getGameMode(): String`
- `getGameVersion(): GameVersion`
- `getGitRevision(): String`
- `getGitSha(): String`
- `getGoodHighlitedColor(): ColorInfo`
- `getIgnoreProneZombieRange(): float`
- `getIsoCursorAlpha(): float`
- `getIsoCursorVisibility(): int`
- `getKey(String keyName): int`
- `getKey(KeybindId keybindID): int`
- `getKeyBinding(int keyId): Core.KeyBinding`
- `getKeyBinding(String keyName): Core.KeyBinding`
- `getKeyBinding(KeybindId keybindID): Core.KeyBinding`
- `getMaxActiveRagdolls(): int`
- `getMaxTextureSize(): int`
- `getMaxTextureSizeFromFlags(int flags): int`
- `getMaxTextureSizeFromOption(int option): int`
- `getMaxVehicleTextureSize(): int`
- `getMaxZoom(): float`
- `getMicVolumeError(): boolean`
- `getMicVolumeIndicator(): int`
- `getMinZoom(): float`
- `getMpTextColor(): ColorInfo`
- `getNextZoom(int playerIndex, int del): float`
- `getNoTargetColor(): ColorInfo`
- `getObjectHighlitedColor(): ColorInfo`
- `getOffscreenBuffer(): TextureFBO`
- `getOffscreenBuffer(int nPlayer): TextureFBO`
- `getOffscreenHeight(int playerIndex): int`
- `getOffscreenTrueHeight(): int`
- `getOffscreenTrueWidth(): int`
- `getOffscreenWidth(int playerIndex): int`
- `getOptionActionProgressBarSize(): int`
- `getOptionActiveController(String guid): boolean`
- `getOptionAimTextureIndex(): int`
- `getOptionAmbientVolume(): int`
- `getOptionAutoDrink(): boolean`
- `getOptionAutoRevealPrintMediaMapLocations(): boolean`
- `getOptionAutoWalkContainer(): boolean`
- `getOptionBloodDecals(): int`
- `getOptionBorderlessWindow(): boolean`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionChatFadeTime(): float`
- `getOptionChatFontSize(): String`
- `getOptionChatOpaqueOnFocus(): boolean`
- `getOptionClock24Hour(): boolean`
- `getOptionClockFormat(): int`
- `getOptionClockSize(): int`
- `getOptionCodeFontSize(): String`
- `getOptionColorblindPatterns(): boolean`
- `getOptionContextMenuFont(): String`
- `getOptionControllerButtonStyle(): int`
- `getOptionControllerButtonStyleString(): String`
- `getOptionCorpseShadows(): boolean`
- `getOptionCount(): int`
- `getOptionCrosshairTextureIndex(): int`
- `getOptionCycleContainerKey(): String`
- `getOptionDisableLightningDuringStorms(): boolean`
- `getOptionDisplayAsCelsius(): boolean`
- `getOptionDoContainerOutline(): boolean`
- `getOptionDoDoorSpriteEffects(): boolean`
- `getOptionDoVideoEffects(): boolean`
- `getOptionDoWindSpriteEffects(): boolean`
- `getOptionDropItemsOnSquareCenter(): boolean`
- `getOptionEnableDyslexicFont(): boolean`
- `getOptionEnableLeftJoystickRadialMenu(): boolean`
- `getOptionFontSize(): int`
- `getOptionFontSizeReal(): int`
- `getOptionGamepadBindingPreset(): String`
- `getOptionHighResPlacedItems(): boolean`
- `getOptionIgnoreProneZombieRange(): int`
- `getOptionInventoryContainerSize(): int`
- `getOptionInventoryFont(): String`
- `getOptionJumpScareVolume(): int`
- `getOptionLanguageName(): String`
- `getOptionLeaveKeyInIgnition(): boolean`
- `getOptionLockCursorToWindow(): boolean`
- `getOptionMacOSIgnoreMouseWheelAcceleration(): boolean`
- `getOptionMacOSMapHorizontalMouseWheelToVertical(): boolean`
- `getOptionMapViewPause(): boolean`
- `getOptionMaxChatOpaque(): float`
- `getOptionMaxCrosshairOffset(): int`
- `getOptionMaxTextureSize(): int`
- `getOptionMaxVehicleTextureSize(): int`
- `getOptionMeasurementFormat(): String`
- `getOptionMeleeOutline(): boolean`
- `getOptionMinChatOpaque(): float`
- `getOptionModelTextureMipmaps(): boolean`
- `getOptionModsEnabled(): boolean`
- `getOptionMoodleSize(): int`
- `getOptionMusicActionStyle(): int`
- `getOptionMusicLibrary(): int`
- `getOptionMusicVolume(): int`
- `getOptionOnStartup(String name): Object`
- `getOptionPanCameraWhileAiming(): boolean`
- `getOptionPanCameraWhileDriving(): boolean`
- `getOptionPauseOnFocusloss(): boolean`
- `getOptionPrecipitationSpeedMultiplier(): float`
- `getOptionRackProgress(): boolean`
- `getOptionRadialMenuKeyToggle(): boolean`
- `getOptionReloadDifficulty(): int`
- `getOptionReloadRadialInstant(): boolean`
- `getOptionRenderPrecipitation(): int`
- `getOptionReticleCameraZoom(): boolean`
- `getOptionReticleMode(): int`
- `getOptionReticleTextureIndex(): int`
- `getOptionScreenFilter(): String`
- `getOptionSearchModeOverlayEffect(): int`
- `getOptionShoulderButtonContainerSwitch(): int`
- `getOptionShowAimTexture(): boolean`
- `getOptionShowCraftingXP(): boolean`
- `getOptionShowCursorWhileAiming(): boolean`
- `getOptionShowFirstAnimalZoneInfo(): boolean`
- `getOptionShowItemModInfo(): boolean`
- `getOptionShowReticleTexture(): boolean`
- `getOptionShowSurvivalGuide(): boolean`
- `getOptionShowValidTargetReticleTexture(): boolean`
- `getOptionShowWelcomeMessage(): boolean`
- `getOptionSidebarSize(): int`
- `getOptionSimpleClothingTextures(): int`
- `getOptionSimpleWeaponTextures(): boolean`
- `getOptionSingleContextMenu(int playerIndex): boolean`
- `getOptionSoundVolume(): int`
- `getOptionStreamerMode(): boolean`
- `getOptionTemperatureDisplayCelsius(): boolean`
- `getOptionTexture2x(): boolean`
- `getOptionTextureCompression(): boolean`
- `getOptionTieredZombieUpdates(): boolean`
- `getOptionTimedActionGameSpeedReset(): boolean`
- `getOptionTooltipFont(): String`
- `getOptionUIFBO(): boolean`
- `getOptionUIRenderFPS(): int`
- `getOptionUpdateSneakButton(): boolean`
- `getOptionUsePhysicsHitReaction(): boolean`
- `getOptionVSync(): boolean`
- `getOptionValidTargetReticleTextureIndex(): int`
- `getOptionVehicleEngineVolume(): int`
- `getOptionVoiceAGCMode(): int`
- `getOptionVoiceEnable(): boolean`
- `getOptionVoiceMode(): int`
- `getOptionVoiceRecordDevice(): int`
- `getOptionVoiceRecordDeviceName(): String`
- `getOptionVoiceVADMode(): int`
- `getOptionVoiceVolumeMic(): int`
- `getOptionVoiceVolumePlayers(): int`
- `getOptionWorldMapBrightness(): double`
- `getOptionZoom(): boolean`
- `getOptionZoomLevels1x(): String`
- `getOptionZoomLevels2x(): String`
- `getPerfPuddles(): int`
- `getPerfPuddlesOnLoad(): int`
- `getPerfReflections(): boolean`
- `getPerfReflectionsOnLoad(): boolean`
- `getPerfSkybox(): int`
- `getPerfSkyboxOnLoad(): int`
- `getPoisonousBerry(): String`
- `getPoisonousMushroom(): String`
- `getRealOptionSoundVolume(): float`
- `getSaveFolder(): String`
- `getScreenFilter(): int`
- `getScreenHeight(): int`
- `getScreenModes(): KahluaTable`
- `getScreenWidth(): int`
- `getSeenUpdateText(): String`
- `getSelectedMap(): String`
- `getServerVOIPEnable(): boolean`
- `getShownWelcomeMessageVersion(): double`
- `getSteamServerVersion(): String`
- `getTargetColor(): ColorInfo`
- `getTermsOfServiceVersion(): int`
- `getUseOpenGL21(): boolean`
- `getUseShaders(): boolean`
- `getVersion(): String`
- `getVersionNumber(): String`
- `getVidMem(): int`
- `getWorldItemHighlightColor(): ColorInfo`
- `getXAngle(int width, float angle): int`
- `getYAngle(int width, float angle): int`
- `getZoom(int playerIndex): float`
- `gotNewBelt(): boolean`
- `init(int width, int height): void`
- `initFBOs(): void`
- `initGlobalShader(): void`
- `initPoisonousBerry(): void`
- `initPoisonousMushroom(): void`
- `initShaders(): void`
- `invalidBindingShiftCtrl(Core.KeyBinding keyB): boolean`
- `isAnimPopupDone(): boolean`
- `isAzerty(): boolean`
- `isCelsius(): boolean`
- `isChallenge(): boolean`
- `isCollideZombies(): boolean`
- `isDedicated(): boolean`
- `isDefaultOptions(): boolean`
- `isDisplayCursor(): boolean`
- `isDisplayPlayerModel(): boolean`
- `isDoingTextEntry(): boolean`
- `isDoneNewSaveFolder(): boolean`
- `isFlashIsoCursor(): boolean`
- `isForceSnow(): boolean`
- `isFullScreen(): boolean`
- `isInDebug(): boolean`
- `isKey(String keyName, Integer key): boolean`
- `isKey(KeybindId keybindID, Integer key): boolean`
- `isModsPopupDone(): boolean`
- `isMultiThread(): boolean`
- `isNoSave(): boolean`
- `isOption3DGroundItem(): boolean`
- `isOptionAutoProneAtk(): boolean`
- `isOptionProgressBar(): boolean`
- `isOptionShowChatTimestamp(): boolean`
- `isOptionShowChatTitle(): boolean`
- `isOptionSimpleClothingTextures(boolean bZombie): boolean`
- `isOptiondblTapJogToSprint(): boolean`
- `isPopulateServerListOnStart(): boolean`
- `isRenderPrecipIndoors(): boolean`
- `isRiversideDone(): boolean`
- `isSelectingAll(): boolean`
- `isShowFirstTimeSearchTutorial(): boolean`
- `isShowFirstTimeSneakTutorial(): boolean`
- `isShowFirstTimeVehicleTutorial(): boolean`
- `isShowFirstTimeWeatherTutorial(): boolean`
- `isShowPing(): boolean`
- `isShowYourUsername(): boolean`
- `isToggleToAim(): boolean`
- `isToggleToRun(): boolean`
- `isToggleToSprint(): boolean`
- `isTutorialDone(): boolean`
- `isVehiclesWarningShow(): boolean`
- `isZombieGroupSound(): boolean`
- `isZoomEnabled(): boolean`
- `loadOptions(): boolean`
- `loadOptions_OLD(): boolean`
- `loadedShader(): boolean`
- `onOptionControllerButtonStyleChanged(ConfigOption sender): void`
- `onOptionGamepadBindingPresetChanged(ConfigOption sender): void`
- `quit(): void`
- `quitToDesktop(): void`
- `reinitKeyMaps(): void`
- `saveOptions(): void`
- `saveOptions_OLD(): void`
- `setAccountUsed(Account accountUsed): void`
- `setAnimPopupDone(boolean done): void`
- `setAnimalCheat(boolean cheat): void`
- `setAutoZoom(int playerIndex, boolean auto): void`
- `setAzerty(boolean isAzerty): void`
- `setBadHighlitedColor(ColorInfo badHighlitedColor): void`
- `setBlinkingMoodle(String blinkingMoodle): void`
- `setCelsius(boolean celsius): void`
- `setChallenge(boolean bChallenge): void`
- `setCollideZombies(boolean collideZombies): void`
- `setConsoleDotTxtSizeKB(int kilobytes): void`
- `setConsoleDotTxtSizeKB(String kilobytesString): void`
- `setContentTranslationsEnabled(boolean b): void`
- `setDisplayCursor(boolean display): void`
- `setDisplayPlayerModel(boolean display): void`
- `setDoneNewSaveFolder(boolean doneNewSaveFolder): void`
- `setFlashIsoCursor(boolean flashIsoCursor): void`
- `setForceSnow(boolean forceSnow): void`
- `setFramerate(int index): void`
- `setGameMode(String gameMode): void`
- `setGoodHighlitedColor(ColorInfo goodHighlitedColor): void`
- `setGotNewBelt(boolean gotit): void`
- `setIsSelectingAll(boolean isSelectingAll): void`
- `setIsoCursorVisibility(int isoCursorVisibility): void`
- `setLastRenderedFBO(TextureFBO fbo): void`
- `setMaxActiveRagdolls(int maxActiveRagdolls): void`
- `setModsPopupDone(boolean done): void`
- `setMpTextColor(ColorInfo mpTextColor): void`
- `setMultiThread(boolean val): void`
- `setNoSave(boolean noSave): void`
- `setNoTargetColor(ColorInfo colorInfo): void`
- `setObjectHighlitedColor(ColorInfo objectHighlitedColor): void`
- `setOption3DGroundItem(boolean option3Dgrounditem): void`
- `setOptionActionProgressBarSize(int size): void`
- `setOptionActiveController(int controllerIndex, boolean active): void`
- `setOptionAimTextureIndex(int index): void`
- `setOptionAmbientVolume(int volume): void`
- `setOptionAutoDrink(boolean enable): void`
- `setOptionAutoProneAtk(boolean optionAutoProneAtk): void`
- `setOptionAutoRevealPrintMediaMapLocations(boolean enable): void`
- `setOptionAutoWalkContainer(boolean enable): void`
- `setOptionBloodDecals(int n): void`
- `setOptionBorderlessWindow(boolean b): void`
- `setOptionChatFadeTime(float optionChatFadeTime): void`
- `setOptionChatFontSize(String optionChatFontSize): void`
- `setOptionChatOpaqueOnFocus(boolean optionChatOpaqueOnFocus): void`
- `setOptionClock24Hour(boolean b24Hour): void`
- `setOptionClockFormat(int fmt): void`
- `setOptionClockSize(int size): void`
- `setOptionCodeFontSize(String font): void`
- `setOptionColorblindPatterns(boolean enable): void`
- `setOptionContextMenuFont(String font): void`
- `setOptionControllerButtonStyle(int v): void`
- `setOptionCorpseShadows(boolean enable): void`
- `setOptionCrosshairTextureIndex(int index): void`
- `setOptionCycleContainerKey(String s): void`
- `setOptionDisableLightningDuringStorms(boolean enable): void`
- `setOptionDisplayAsCelsius(boolean b): void`
- `setOptionDoContainerOutline(boolean b): void`
- `setOptionDoDoorSpriteEffects(boolean b): void`
- `setOptionDoVideoEffects(boolean b): void`
- `setOptionDoWindSpriteEffects(boolean b): void`
- `setOptionDropItemsOnSquareCenter(boolean b): void`
- `setOptionEnableDyslexicFont(boolean enable): void`
- `setOptionEnableLeftJoystickRadialMenu(boolean b): void`
- `setOptionFontSize(int size): void`
- `setOptionGamepadBindingPreset(String newValue): void`
- `setOptionHighResPlacedItems(boolean b): void`
- `setOptionIgnoreProneZombieRange(int i): void`
- `setOptionInventoryContainerSize(int size): void`
- `setOptionInventoryFont(String font): void`
- `setOptionJumpScareVolume(int volume): void`
- `setOptionLanguageName(String name): void`
- `setOptionLeaveKeyInIgnition(boolean enable): void`
- `setOptionLockCursorToWindow(boolean b): void`
- `setOptionMacOSIgnoreMouseWheelAcceleration(boolean b): void`
- `setOptionMacOSMapHorizontalMouseWheelToVertical(boolean b): void`
- `setOptionMapViewPause(boolean pause): void`
- `setOptionMaxChatOpaque(float optionMaxChatOpaque): void`
- `setOptionMaxCrosshairOffset(int maxCrosshairOffset): void`
- `setOptionMaxTextureSize(int v): void`
- `setOptionMaxVehicleTextureSize(int v): void`
- `setOptionMeasurementFormat(String format): void`
- `setOptionMeleeOutline(boolean toggle): void`
- `setOptionMinChatOpaque(float optionMinChatOpaque): void`
- `setOptionModelTextureMipmaps(boolean b): void`
- `setOptionModsEnabled(boolean enabled): void`
- `setOptionMoodleSize(int size): void`
- `setOptionMusicActionStyle(int v): void`
- `setOptionMusicLibrary(int m): void`
- `setOptionMusicVolume(int volume): void`
- `setOptionOnStartup(String name, Object value): void`
- `setOptionPanCameraWhileAiming(boolean enable): void`
- `setOptionPanCameraWhileDriving(boolean enable): void`
- `setOptionPauseOnFocusloss(boolean pause): void`
- `setOptionPrecipitationSpeedMultiplier(float f): void`
- `setOptionProgressBar(boolean optionProgressBar): void`
- `setOptionRackProgress(boolean b): void`
- `setOptionRadialMenuKeyToggle(boolean toggle): void`
- `setOptionReloadDifficulty(int d): void`
- `setOptionReloadRadialInstant(boolean enable): void`
- `setOptionRenderPrecipitation(int optionRenderPrecipitation): void`
- `setOptionReticleCameraZoom(boolean optionReticleCameraZoom): void`
- `setOptionReticleMode(int mode): void`
- `setOptionReticleTextureIndex(int index): void`
- `setOptionScreenFilter(String value): void`
- `setOptionSearchModeOverlayEffect(int v): void`
- `setOptionShoulderButtonContainerSwitch(int v): void`
- `setOptionShowAimTexture(boolean show): void`
- `setOptionShowChatTimestamp(boolean optionShowChatTimestamp): void`
- `setOptionShowChatTitle(boolean optionShowChatTitle): void`
- `setOptionShowCraftingXP(boolean b): void`
- `setOptionShowCursorWhileAiming(boolean show): void`
- `setOptionShowFirstAnimalZoneInfo(boolean b): void`
- `setOptionShowItemModInfo(boolean b): void`
- `setOptionShowReticleTexture(boolean show): void`
- `setOptionShowSurvivalGuide(boolean b): void`
- `setOptionShowValidTargetReticleTexture(boolean show): void`
- `setOptionShowWelcomeMessage(boolean showWelcomeMessage): void`
- `setOptionSidebarSize(int size): void`
- `setOptionSimpleClothingTextures(int v): void`
- `setOptionSimpleWeaponTextures(boolean enable): void`
- `setOptionSingleContextMenu(int playerIndex, boolean b): void`
- `setOptionSoundVolume(int volume): void`
- `setOptionStreamerMode(boolean b): void`
- `setOptionTexture2x(boolean b): void`
- `setOptionTextureCompression(boolean b): void`
- `setOptionTieredZombieUpdates(boolean val): void`
- `setOptionTimedActionGameSpeedReset(boolean b): void`
- `setOptionTooltipFont(String font): void`
- `setOptionUIFBO(boolean use): void`
- `setOptionUIRenderFPS(int fps): void`
- `setOptionUpdateSneakButton(boolean b): void`
- `setOptionUsePhysicsHitReaction(boolean usePhysicsHitReaction): void`
- `setOptionVSync(boolean sync): void`
- `setOptionValidTargetReticleTextureIndex(int index): void`
- `setOptionVehicleEngineVolume(int volume): void`
- `setOptionVoiceAGCMode(int option): void`
- `setOptionVoiceEnable(boolean option): void`
- `setOptionVoiceEnable(boolean option, boolean bRestartClient): void`
- `setOptionVoiceMode(int option): void`
- `setOptionVoiceRecordDevice(int option): void`
- `setOptionVoiceRecordDeviceName(String option): void`
- `setOptionVoiceVADMode(int option): void`
- `setOptionVoiceVolumeMic(int option): void`
- `setOptionVoiceVolumePlayers(int option): void`
- `setOptionWorldMapBrightness(double d): void`
- `setOptionZoom(boolean zoom): void`
- `setOptionZoomLevels1x(String levels): void`
- `setOptionZoomLevels2x(String levels): void`
- `setOptiondblTapJogToSprint(boolean dbltap): void`
- `setPerfPuddles(int val): void`
- `setPerfReflections(boolean val): void`
- `setPerfSkybox(int val): void`
- `setPoisonousBerry(String poisonousBerry): void`
- `setPoisonousMushroom(String poisonousMushroom): void`
- `setPopulateServerListOnStart(boolean populateServerListOnStart): void`
- `setRenderPrecipIndoors(boolean optionRenderPrecipIndoors): void`
- `setResolution(String res): void`
- `setResolutionAndFullScreen(int w, int h, boolean fullScreen): void`
- `setRiversideDone(boolean riversideDone): void`
- `setScreenSize(int width, int height): void`
- `setSeenUpdateText(String seenUpdateText): void`
- `setSelectedMap(String selectedMap): void`
- `setShowFirstTimeSearchTutorial(boolean showFirstTimeSearchTutorial): void`
- `setShowFirstTimeSneakTutorial(boolean showFirstTimeSneakTutorial): void`
- `setShowFirstTimeVehicleTutorial(boolean showFirstTimeVehicleTutorial): void`
- `setShowFirstTimeWeatherTutorial(boolean showFirstTimeWeatherTutorial): void`
- `setShowPing(boolean showPing): void`
- `setShowYourUsername(boolean showYourUsername): void`
- `setShownWelcomeMessageVersion(double value): void`
- `setTargetColor(ColorInfo colorInfo): void`
- `setTermsOfServiceVersion(int v): void`
- `setTestingMicrophone(boolean testing): void`
- `setToggleToAim(boolean enable): void`
- `setToggleToRun(boolean toggleToRun): void`
- `setToggleToSprint(boolean toggleToSprint): void`
- `setTutorialDone(boolean done): void`
- `setUseShaders(boolean bUse): void`
- `setVehiclesWarningShow(boolean done): void`
- `setVidMem(int mem): void`
- `setWindowed(boolean b): void`
- `setWorldItemHighlightColor(ColorInfo colorInfo): void`
- `setZombieGroupSound(boolean zombieGroupSound): void`
- `setZoomEnalbed(boolean val): void`
- `shadersOptionChanged(): void`
- `supportRes(int width, int height): boolean`
- `supportsFBO(): boolean`
- `updateKeyboard(): void`
- `zoomLevelsChanged(): void`
- `zoomOptionChanged(boolean inGame): void`

Static functions, called as `Core.name(...)`:

- `UnfocusActiveTextEntryBox(): void`
- `flipPixels(int[] imgPixels, int imgw, int imgh): int[]`
- `getGLMajorVersion(): int`
- `getGLVersion(): String`
- `getGitRevisionString(): String`
- `getInstance(): Core`
- `getMyDocumentFolder(): String`
- `getOpenGLVersions(): void`
- `getTileScale(): int`
- `isDevMode(): boolean`
- `isImGui(): boolean`
- `isLastStand(): boolean`
- `isUseGameViewport(): boolean`
- `isUseViewports(): boolean`
- `setDisplayMode(int width, int height, boolean fullscreen): void`
- `setFullScreen(boolean bool): void`
- `setInitialSize(): void`
- `supportCompressedTextures(): boolean`
- `supportNPTTexture(): boolean`

Constructors: `Core.new()`.

Static fields (a copy of the value taken when the class is exposed): `IS_DEV: boolean`, `KEYBINDING_EMPTY: Core.KeyBinding`, `ModelScale: float`, `PZWorldToBulletZScale: float`, `UnitVector3f: Vector3f`, `_UNIT_Z: Vector3f`, `addZombieOnCellLoad: boolean`, `altMoveMethod: boolean`, `antiCheats: boolean`, `bDemo: boolean`, `blinkAlpha: float`, `blinkAlphaIncrease: boolean`, `challengeId: String`, `characterHeight: float`, `characterMeleeAimPointHeight: float`, `characterRangedAimPointHeight: float`, `currentTextEntryBox: UITextEntryInterface`, `dirtyGlobalLightsCount: int`, `exiting: boolean`, `gameMap: String`, `gameMode: String`, `gameSaveWorld: String`, `height: int`, `iPerfPuddles_All: int`, `iPerfPuddles_GroundOnly: int`, `iPerfPuddles_GroundWithRuts: int`, `iPerfPuddles_None: int`, `iPerfSkybox_High: int`, `iPerfSkybox_Medium: int`, `iPerfSkybox_Static: int`, `imGui: boolean`, `initialHeight: float`, `initialWidth: float`, `lastStand: boolean`, `maxJukeBoxesActive: int`, `numJukeBoxesActive: int`, `optionModsEnabled: boolean`, `preset: String`, `safeMode: boolean`, `safeModeForced: boolean`, `scale: float`, `soundDisabled: boolean`, `tileScale: int`, `tutorial: boolean`, `useGameViewport: boolean`, `useViewports: boolean`, `width: int`, `xx: int`, `yy: int`, `zz: int`.

### CreditsName

`zombie.core.CreditsName`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getName(): String`
- `getSort(): String`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CreditsName.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CreditsName`
- `values(): CreditsName[]`

Enum values (read as `CreditsName.VALUE`): `ADAM_HANUS`, `ADRIC_HARTIN`, `AFEKAY`, `AITOR_CRUZ`, `ALAIN_DELLEPIANE`, `ALAN_CARTER`, `ALBION`, `ALEKSANDRA_MIHAILOVA`, `ALEKSEI_KHOKHOLOV`, `ALEXANDER_BLINOV`, `ALEXA_ALTEZ`, `ALICE_BONNEAU`, `AMBIGUOUSAMPHIBIAN`, `AMY_YOUNG`, `ANDREI_MELNIKOV`, `ANDREI_TOPILIN`, `ANDRES_CASTRO`, `ANDRÁS_ÁCS`, `ANDY_HODGETTS`, `ANGELA_BATEMAN`, `ANNA_SHEVCHENKO`, `ANONYMOUS`, `ANTTI_RIIKONEN`, `ARMIN_HAAS`, `ARTEM_BORDYUGOV`, `ASH_BLAKE_HOOD`, `ASIA_MLECZAK`, `AVI_GREENBURY`, `AWPENHEIMER`, `AYRTON_ORIO`, `A_BRICK_FAIRY`, `BARBARA_MONTI`, `BAURZHAN_SITKALIEV`, `BEAR_GRANANDER`, `BENJAMIN_JAMES`, `BENJAMIN_SCHIEDER`, `BILL_REDPATH`, `BLAIR_FITZPATRICK`, `BOBHECKLING`, `BOXER`, `BRIAN_HICKS`, `BYRON_BULLOCK`, `CALLY`, `CARL_STONE`, `CASEY_JO_KENNY`, `CASPIAN_PRINCE`, `CATHERINE_NGO`, `CHARLIE_SLOAN`, `CHET_FALISZEK`, `CHIEF`, `CHRISTIAN_ALLEN`, `CHRISTIAN_JORGE`, `CHRISTIAN_WALBER`, `CHRISTOPHER_GREEN`, `CHRISTOPHER_SCHNITZERLING`, `CHRIS_SIMPSON`, `CHRIS_WOOD`, `CILLIAN_JUNG`, `CLEMENT_GIRAUDEAU`, `CLIFF_ANDERSON`, `CONNALL_LINDSAY`, `CROMULENT_ARCHER`, `DADDYDIRKIEDIRK`, `DANIEL_HEELAN`, `DANIEL_MARQUES`, `DANIEL_SOBHI`, `DANIIL_KLESHCHEVNIKOV`, `DAVID_PHILIPP`, `DEAN_HALL`, `DEAN_TROTMAN`, `DEMI_BARTELS`, `DEREK_BUCHANAN`, `DITOSEADIO`, `DMITRY_BOROVSKY`, `DRAKE_BARRON`, `DR_COX1911`, `DUFFY_DAVIS`, `DYLAN_MYERS`, `ECKYMAN`, `EDWARD_SMALLWOOD`, `EDWIN_TRAN`, `ELIA_TASSELL`, `ELSPETH_EDMONDS`, `EMILY_RICHARDSON`, `EMMA_SMITH`, `ERIKA_EDGREN`, `ERIK_BROES`, `ERIS_CLARK`, `ERJAN_READ`, `FILIBUSTER_RHYMES`, `FLAVIA_TACONI`, `FOX_CHAOTICA`, `FRANCOIS_DESFORGES`, `FRANK_JORDAN`, `GENNADII_POTAPOV`, `GRAEME_STRUTHERS`, `HELEEN_WIEMANS`, `HENRY_PATTERSON`, `HENRY_SHU`, `HESTER_LEISTRA`, `HOODIE_GUY`, `HYESU_CHOE`, `ILIA_TEPLISHCHEV`, `ILJA_GAIDENKO`, `INNOKENTIY_SEDOV`, `IRIS_KUPPEN`, `ISAAC_SALES`, `IURI_IAKOVLEV`, `JACK_BELL`, `JACOB_HALEY`, `JAIME_BYRNE`, `JAKE_RILEY`, `JAKOB_KANDEL`, `JAMES_STRETTON`, `JAMIE_CARR`, `JAMIE_MAGNUSON`, `JAS_PUREWAL`, `JAY_MILLS`, `JEMMA_RILEY_TOLCH`, `JESSE_BURLAND_LOKKO`, `JOHNATHON_TINSLEY`, `JONATHAN_BURSAC`, `JONES_GAMBARINE`, `JORGE_GUEDES`, `JOSH_HENNING`, `JUNWON_KONG`, `KAROLINA_BARSZCZ`, `KASIA_DZIEKAN`, `KEES_BEKKEMA`, `KEVIN_BANKS`, `KEVIN_KING`, `KIERAN_RAFFERTY`, `KIEREN_VERNON`, `KIM_METZGER`, `KIWO`, `KLEAN`, `KONSTANTIN_KOPIN`, `KRISTINE_MYRENE`, `KRZYSZTOF_SAGOLA`, `KYLE_ROWLEY`, `LEE_BARNES`, `LEONKIEL`, `LEO_DIMILO`, `LEO_IVANOV`, `LINDA_MYRWOLD`, `LIWEN_ZHANG`, `LORENZO_BERTOLUCCI`, `LORENZO_PIANI`, `LOUIS_KEEP`, `MACA`, `MARCO_PURSCHLER`, `MARCUS_GONCALVES`, `MARCUS_HILL`, `MARC_TOOKEY`, `MARINA_SIU_CHONG`, `MARK_EXE`, `MARK_ROWLEY`, `MARK_SANDERS`, `MARK_WRIGHT`, `MARTIN_GREENALL`, `MARTIN_NEHRDICH`, `MASON_PARADA`, `MATHAS`, `MATHILDACHAN`, `MATTEO_LUPIERI`, `MATTEO_SCARABELLI`, `MATTHEW_HARBER`, `MATTHEW_SULLIVAN`, `MATTHIAS_WOLF`, `MATT_RITCHIE`, `MATT_SCHILLACI`, `MAX_BRODE`, `MAX_NUTTALL`, `MAYATUTORS`, `MICHAEL_HARTUNG`, `MICHAEL_HAZELWOOD`, `MICHAL_CHECINSKI`, `MIDDLEAGEDBOB`, `MIKE_BERRY`, `MIKHAIL_GUDIM`, `MILLER_MEI`, `MISTER_LAMPREY`, `MRATOMICDUCK`, `MR_BROLLOW`, `MR_L_TARTAN`, `NATALIA_PATEREK`, `NATALIA_ROWLEY`, `NICHOLAS_STEVENS`, `NICK_COWEN`, `NICOLÁS_SOSA_IALAZZO`, `NIKOLA_KAPIDZIC`, `NJ_APOSTOL`, `NORMAN_VEZINA`, `NOTCH`, `OLIVIA_WHITE`, `ORSOLYA_LIPTAY`, `PATRICK_BRENNAN`, `PATRICK_BROTT`, `PAUL_JR`, `PAUL_MCALOON`, `PAUL_RING`, `PAUL_WRIGHT`, `PETER_LEE`, `PETER_LEWIN`, `PETER_LOVERSO`, `PHILL_CAMERON`, `PIOTR_HELAK`, `PR1VATELIME`, `PUPPERS`, `RAPHAEL_BARANDAS`, `RASMUS_NIELSEN`, `REDWIRE`, `REKKIE`, `RICHARD_CABAN`, `ROBBAZ`, `ROBOMAT`, `ROMAIN_DRON`, `ROMUALD_DRON`, `ROYALEWITHCHEESE`, `RUAL_STORGE`, `SACRIEL`, `SAMI_OLAVI`, `SAM_BASSETT_SEAMARK`, `SAM_BURROUGHES`, `SAM_GATES`, `SAM_SPAWTON`, `SARAH_NEWELL`, `SAUDIGAMER`, `SAVELIY_ZELOVSKIY`, `SCOTT_PURCIVAL`, `SCOTT_REISMANIS`, `SERGEI_SHUBIN`, `SHANNON_KILLER`, `SHARPGOLDEN`, `SIMON_CADET`, `SPIFFO`, `STEPHEN_REID`, `STEVE_NORTH`, `STEVE_SHARP`, `STEVE_YOUNG`, `STUART_JONES`, `SYED_BILAL_AHMED`, `TANJA_SUITIALA`, `THE_COMMANDER`, `THE_COMMUNITY`, `THE_PUB`, `THOMAS_DEYN`, `THOMAS_GUIMBRETIERE`, `THOMAS_ROBINSON`, `THOR_PENTHIN_GRUMLØSE`, `TIMOTHY_BAKER`, `TIM_BUCKLEY`, `TITOPEI`, `TOMEK_KALISZEWSKI`, `TOM_HALL`, `TOM_PORTER`, `TRAILER_FARM`, `TWIGGY`, `TZU_SHENG_HSIAO`, `UNCONID`, `VIBRANCE`, `VICKI_WOODS`, `WILL_PORTER`, `WOJCIECH_BRUDZIŃSKI`, `YANA_DUNCAN`, `YANNICK_WINTER`, `YICHING_CHOU`, `YULIIA_TATSENKO`, `ZACH_BEEVER`, `ZAC_CONGO`.

### CreditsRole

`zombie.core.CreditsRole`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getNames(): List<CreditsName>`
- `getTitle(): String`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CreditsRole.name(...)`:

- `getTranslatorCredits(): KahluaTable`
- `getTranslatorCreditsList(Language language): List<String>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CreditsRole`
- `values(): CreditsRole[]`

Enum values (read as `CreditsRole.VALUE`): `ADDITIONAL_ARTISTS`, `ADDITIONAL_CODE`, `ADDITIONAL_SUPPORT`, `ARTISTS`, `ART_DIRECTOR`, `ASSOCIATE_PRODUCER`, `ASSOCIATE_SOUND_DESIGNER`, `BACKUP_SYSADMIN`, `COMMUNITY_MANAGERS`, `COMMUNITY_MODERATORS`, `CONCEPT_ARTIST`, `CONTRIBUTORS`, `DESIGN_DIRECTOR`, `DIRECTOR`, `ENGINEERS`, `ENVIRONMENTAL_ARTISTS`, `FINANCE`, `FOUNDERS`, `GENERAL_ARCADE`, `GRAPHIC_DESIGNER`, `HEAD_FQA`, `HEAD_PRODUCER`, `HEAD_RACCOON`, `HR`, `INTERACTIVE_MUSIC_COMPOSER`, `IN_LOVING_MEMORY_OF`, `JUNIOR_SYSTEM_ADMINISTRATOR`, `LEAD_COMMUNITY_MANAGER`, `LEAD_GAMEPLAY_PROGRAMMER`, `LEAD_PROGRAMMER`, `LEAD_QA`, `LEAD_QA_TIS`, `LEAD_QA_USS`, `LEAD_SOUND_DESIGNER_ARRIVAL`, `LEAD_TECHNICAL_PROGRAMMER`, `LOCALISATION_LEAD`, `LOCALIZATION`, `MARKETING_ARTIST`, `MIDDLE_SOFTWARE_DEVELOPER`, `MUSIC_ORIGINALLY_COMPOSED_BY`, `OPERATIONS_MANAGER`, `PRODUCER`, `PRODUCTION_DIRECTOR`, `QA`, `QA_PROJECT_MANAGER`, `QA_TECHNICIANS`, `QUALITY_ASSURANCE`, `QUALITY_ASSURANCE_TESTERS`, `RENDERING_PROGRAMMER`, `RESEARCH_AND_DEVELOPMENT`, `SENIOR_PRODUCER`, `SENIOR_PROGRAMMER`, `SENIOR_QA`, `SENIOR_QA_TECHNICIANS`, `SENIOR_SOFTWARE_DEVELOPER`, `SOUND_DESIGNER`, `SOUND_SUPERVISOR`, `SPECIAL_INFECTED`, `SPECIAL_THANKS`, `SYSTEM_ADMINISTRATOR`, `TECHNICAL_DIRECTOR`, `TECHNICAL_SOUND_DESIGNER_ARRIVAL`, `TECH_SUPPORT`, `TMG_CH`, `TMG_CN`, `TMG_DA`, `TMG_DE`, `TMG_FI`, `TMG_HU`, `TMG_IT`, `TMG_KO`, `TMG_NL`, `TMG_NO`, `TMG_PL`, `TMG_PT`, `TMG_UA`, `UI_DESIGNER`, `WIKI_ADMIN`, `WIKI_EDITORS`, `WRITER`.

Static fields (a copy of the value taken when the class is exposed): `CREDITS_TRANSLATOR_JSON: Path`, `TRANSLATION_FOLDER: Path`, `TRANSLATOR: String`.

### CreditsRoleGroup

`zombie.core.CreditsRoleGroup`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getLogo(): String`
- `getRoles(): List<CreditsRole>`
- `getTitle(): String`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CreditsRoleGroup.name(...)`:

- `getAll(): List<CreditsRoleGroup>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CreditsRoleGroup`
- `values(): CreditsRoleGroup[]`

Enum values (read as `CreditsRoleGroup.VALUE`): `ADMINISTRATION`, `CONTRIBUTORS`, `CREATIVE_TEAM`, `EXECUTIVES_AND_LEADERSHIP`, `GENERAL_ARCADE`, `IN_LOVING_MEMORY_OF`, `LOCALIZATION`, `MUSIC_BY`, `PRODUCTION`, `PROGRAMMING_TEAM`, `QUALITY_ASSURANCE`, `RESEARCH_AND_DEVELOPMENT`, `SOUND_ARRIVAL`, `TEA`, `TMG`, `TOOLS`, `USS`, `VERTEX_BREAK`.

### AngelCodeFont

`zombie.core.fonts.AngelCodeFont`, class.

Methods, called as `obj:name(...)`:

- `destroy(): void`
- `drawString(float x, float y, float scale, String text, float r, float g, float b, float a): void`
- `drawString(float x, float y, float scale, String text, float r, float g, float b, float a, int startIndex, int endIndex): void`
- `drawString(float x, float y, String text): void`
- `drawString(float x, float y, String text, float r, float g, float b, float a): void`
- `drawString(float x, float y, String text, float r, float g, float b, float a, int startIndex, int endIndex): void`
- `drawString(float x, float y, String text, Color col): void`
- `drawString(float x, float y, String text, Color col, int startIndex, int endIndex): void`
- `getHeight(String text): int`
- `getHeight(String text, boolean returnActualHeight, boolean returnOffset): int`
- `getLineHeight(): int`
- `getWidth(String text): int`
- `getWidth(String text, boolean xAdvance): int`
- `getWidth(String text, int start, int end): int`
- `getWidth(String text, int start, int end, boolean xadvance): int`
- `getYOffset(String text): int`
- `isLoading(): boolean`
- `isSdf(): boolean`
- `onStateChanged(Asset.State oldState, Asset.State newState, Asset asset): void`
- `setSdf(boolean b): void`

Constructors: `AngelCodeFont.new(String fntFile, String imgFile)`, `AngelCodeFont.new(String fntFile, Texture image)`.

Static fields (a copy of the value taken when the class is exposed): `curA: float`, `curB: float`, `curCol: Color`, `curG: float`, `curR: float`, `xoff: int`, `yoff: int`.

### GameMode

`zombie.core.GameMode`, class.

Methods, called as `obj:name(...)`:

- `getDescription(): String`
- `getThumbnail(): String`
- `getTitle(): String`
- `getVideo(): String`
- `toString(): String`

Static functions, called as `GameMode.name(...)`:

- `get(ResourceLocation id): GameMode`
- `register(String id): GameMode`

Static fields (a copy of the value taken when the class is exposed): `APOCALYPSE: GameMode`, `CHALLENGES: GameMode`, `EXTINCTION: GameMode`, `OUTBREAK: GameMode`, `RISING: GameMode`, `SANDBOX: GameMode`.

### GameVersion

`zombie.core.GameVersion`, class.

Methods, called as `obj:name(...)`:

- `equals(Object obj): boolean`
- `getInt(): int`
- `getMajor(): int`
- `getMinor(): int`
- `getSuffix(): String`
- `isGreaterThan(GameVersion rhs): boolean`
- `isGreaterThanOrEqualTo(GameVersion rhs): boolean`
- `isLessThan(GameVersion rhs): boolean`
- `isLessThanOrEqualTo(GameVersion rhs): boolean`
- `toString(): String`

Static functions, called as `GameVersion.name(...)`:

- `parse(String str): GameVersion`

Constructors: `GameVersion.new(int major, int minor, String suffix)`.

### ImmutableColor

`zombie.core.ImmutableColor`, class.

Methods, called as `obj:name(...)`:

- `add(ImmutableColor c): ImmutableColor`
- `brighter(): ImmutableColor`
- `brighter(float scale): ImmutableColor`
- `darker(): ImmutableColor`
- `darker(float scale): ImmutableColor`
- `equals(Object other): boolean`
- `getAlphaByte(): byte`
- `getAlphaFloat(): float`
- `getAlphaInt(): int`
- `getBlueByte(): byte`
- `getBlueFloat(): float`
- `getBlueInt(): int`
- `getGreenByte(): byte`
- `getGreenFloat(): float`
- `getGreenInt(): int`
- `getRedByte(): byte`
- `getRedFloat(): float`
- `getRedInt(): int`
- `hashCode(): int`
- `interp(ImmutableColor to, float delta): ImmutableColor`
- `multiply(Color c): ImmutableColor`
- `scale(float value): ImmutableColor`
- `toMutableColor(): Color`
- `toString(): String`

Static functions, called as `ImmutableColor.name(...)`:

- `HSBtoRGB(float hue, float saturation, float brightness): Integer[]`
- `decode(String nm): ImmutableColor`
- `random(): ImmutableColor`

Constructors: `ImmutableColor.new(float r, float g, float b)`, `ImmutableColor.new(float r, float g, float b, float a)`, `ImmutableColor.new(int value)`, `ImmutableColor.new(int r, int g, int b)`, `ImmutableColor.new(int r, int g, int b, int a)`, `ImmutableColor.new(Color color)`, `ImmutableColor.new(Color colorA, Color colorB, float delta)`, `ImmutableColor.new(ImmutableColor color)`.

Static fields (a copy of the value taken when the class is exposed): `black: ImmutableColor`, `blue: ImmutableColor`, `cyan: ImmutableColor`, `darkGray: ImmutableColor`, `darkGreen: ImmutableColor`, `gray: ImmutableColor`, `green: ImmutableColor`, `lightGray: ImmutableColor`, `lightGreen: ImmutableColor`, `magenta: ImmutableColor`, `orange: ImmutableColor`, `pink: ImmutableColor`, `purple: ImmutableColor`, `red: ImmutableColor`, `transparent: ImmutableColor`, `white: ImmutableColor`, `yellow: ImmutableColor`.

### Language

`zombie.core.Language`, class.

Methods, called as `obj:name(...)`:

- `base(): String`
- `isAzerty(): boolean`
- `name(): String`
- `text(): String`
- `toString(): String`

### ZLogger

`zombie.core.logger.ZLogger`, class.

Methods, called as `obj:name(...)`:

- `close(): void`
- `recreateLogFile(): void`
- `write(Exception ex): void`
- `write(String logs): void`
- `write(String logs, String level): void`
- `write(String logs, String level, boolean append): void`
- `writeUnsafe(String logs, String prefix, boolean append): void`

Constructors: `ZLogger.new(String name, boolean useConsole)`.

### PZMath

`zombie.core.math.PZMath`, class.

Static functions, called as `PZMath.name(...)`:

- `abs(float val): float`
- `abs(int val): int`
- `acosf(float a): float`
- `almostIdentity(float x, float m, float n): float`
- `almostUnitIdentity(float x): float`
- `angleBetween(float ax, float ay, float bx, float by): float`
- `angleBetween(Vector2 va, Vector2 vb): float`
- `angleBetweenNormalized(float ax, float bx, float ay, float by): float`
- `c_lerp(float src, float dest, float alpha): float`
- `calculateBearing(Vector3 fromPosition, Vector2 fromForward, Vector3 toPosition): float`
- `canParseFloat(String varStr): boolean`
- `ceil(float val): float`
- `clamp(double val, double min, double max): double`
- `clamp(float val, float min, float max): float`
- `clamp(int val, int min, int max): int`
- `clamp(long val, long min, long max): long`
- `clampDouble_01(double val): double`
- `clampFloat(float val, float min, float max): float`
- `clamp_01(float val): float`
- `closestPointOnLineSegment(float x1, float y1, float x2, float y2, float px, float py, double endpointSnapEpsilon, Vector2f out): double`
- `closestPointsOnLineSegments(float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4, Vector2f p1, Vector2f p2): double`
- `closestVector3(float lx0, float ly0, float lz0, float lx1, float ly1, float lz1, float x, float y, float z): Vector3`
- `convertMatrix(Matrix4f src, Matrix4f dst): Matrix4f`
- `convertMatrix(Matrix4f src, Matrix4f dst): Matrix4f`
- `coorddivision(int value, int divisor): int`
- `coordmodulo(int value, int divisor): int`
- `coordmodulof(float value, int divisor): float`
- `cross(Vector3 a, Vector3 b, Vector3 out): Vector3`
- `degToRad(float degrees): float`
- `equal(float a, float b): boolean`
- `equal(float a, float b, float delta): boolean`
- `fastfloor(double val): int`
- `fastfloor(float val): int`
- `floor(double val): double`
- `floor(float val): float`
- `frac(float val): float`
- `gain(float x, float k): float`
- `getClosestAngle(float radsA, float radsB): float`
- `getClosestAngleDegrees(float degsA, float degsB): float`
- `getLength(float x, float y): float`
- `getLengthSq(float x, float y): float`
- `intersectLineSegments(float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4, Vector2f intersection): boolean`
- `intersectLineSegments(Vector2f p1, Vector2f p2, Vector2f q1, Vector2f q2, Vector2f intersection): boolean`
- `isBetween(float value, float min, float max): boolean`
- `isLeft(float x0, float y0, float x1, float y1, float x2, float y2): float`
- `isNullOrZero(Vector2 vec): boolean`
- `lerp(float src, float dest, float alpha): float`
- `lerp(float src, float dest, float alpha, LerpType lerpType): float`
- `lerp(Vector3f out, Vector3f a, Vector3f b, float t): Vector3f`
- `lerp(Vector2 out, Vector2 a, Vector2 b, float t): Vector2`
- `lerp(Vector3 out, Vector3 a, Vector3 b, float t): Vector3`
- `lerpAngle(float src, float dest, float alpha): float`
- `lerpFunc_EaseInQuad(float x): float`
- `lerpFunc_EaseOutInQuad(float x): float`
- `lerpFunc_EaseOutQuad(float x): float`
- `lineSegmentsIntersect(float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4): boolean`
- `lineSegmentsIntersect(Vector2f p1, Vector2f p2, Vector2f q1, Vector2f q2): boolean`
- `max(float a, float b): float`
- `max(float a, float b, float c): float`
- `max(float a, float b, float c, float d): float`
- `max(float a, float b, float c, float d, float e): float`
- `max(int a, int b): int`
- `max(int a, int b, int c): int`
- `max(int a, int b, int c, int d): int`
- `max(int a, int b, int c, int d, int e): int`
- `min(float a, float b): float`
- `min(float a, float b, float c): float`
- `min(float a, float b, float c, float d): float`
- `min(float a, float b, float c, float d, float e): float`
- `min(int a, int b): int`
- `min(int a, int b, int c): int`
- `min(int a, int b, int c, int d): int`
- `min(int a, int b, int c, int d, int e): int`
- `nextPowerOfTwo(int value): int`
- `normalize(E[] list, PZMath.FloatGet<E> floatGet, PZMath.FloatSet<E> floatSet): void`
- `normalize(List<E> list, PZMath.FloatGet<E> floatGet, PZMath.FloatSet<E> floatSet): void`
- `normalize(float[] weights): float[]`
- `normalize(ArrayList<Double> list): ArrayList<Double>`
- `pow(float a, float b): float`
- `radToDeg(float radians): float`
- `rotateVector(float vx, float vy, float vz, float qx, float qy, float qz, float qw, Vector3f result): Vector3f`
- `rotateVector(Vector3f vector, Quaternion quaternion, Vector3f result): Vector3f`
- `rotateVector(float vx, float vy, float qx, float qy, float qz, float qw, Vector2 result): Vector2`
- `roundFloat(float value, int scale): float`
- `roundFloatPos(float number, int scale): float`
- `roundFromEdges(float val): float`
- `roundToInt(float val): int`
- `roundToIntPlus05(float val): float`
- `roundToNearest(float val): float`
- `setFromAxisAngle(float ax, float ay, float az, float angleRadians, Quaternion result): Quaternion`
- `sign(float val): int`
- `slerp(Quaternion result, Quaternion from, Quaternion to, float alpha): Quaternion`
- `smallestEncompassingPowerOfTwo(int input): int`
- `sqrt(float val): float`
- `squared(float a): float`
- `step(float from, float to, float delta): float`
- `testSideOfLine(float x1, float y1, float x2, float y2, float px, float py): PZMath.SideOfLine`
- `tryParseDouble(String varStr, double defaultVal): double`
- `tryParseFloat(String varStr, float defaultVal): float`
- `tryParseInt(String varStr, int defaultVal): int`
- `wrap(float val, float range): float`
- `wrap(float val, float min, float max): float`

Constructors: `PZMath.new()`.

Static fields (a copy of the value taken when the class is exposed): `PI: float`, `PI2: float`, `degToRads: float`, `halfPI: float`, `microsToNanos: long`, `millisToMicros: long`, `radToDegs: float`, `secondsToMillis: long`, `secondsToNanos: long`.

### NetTimedAction

`zombie.core.NetTimedAction`, class. Extends `Action`.

Methods, called as `obj:name(...)`:

- `animEvent(String event, String parameter): void`
- `copyFrom(NetTimedAction act): void`
- `forceComplete(): void`
- `getClassDescription(StringBuilder s, Class<?> cls, HashSet<Object> excludedObjects): void` from `IDescriptor`
- `getDescription(): String` from `IDescriptor`
- `getDescription(HashSet<Object> excludedObjects): String` from `IDescriptor`
- `getPacketSizeBytes(): int` from `INetworkPacketField`
- `parse(ByteBufferReader b, IConnection connection): void`
- `set(IsoPlayer player, KahluaTable action): void`
- `setState(Transaction.TransactionState state): void`
- `write(ByteBufferWriter b): void`

Constructors: `NetTimedAction.new()`.

### PerformanceSettings

`zombie.core.PerformanceSettings`, class.

Methods, called as `obj:name(...)`:

- `getFogQuality(): int`
- `getFramerate(): int`
- `getLightingFPS(): int`
- `getLightingQuality(): int`
- `getNewRoofHiding(): boolean`
- `getPuddlesQuality(): int`
- `getUIRenderFPS(): int`
- `getViewConeOpacity(): int`
- `getWaterQuality(): int`
- `isFramerateUncapped(): boolean`
- `setFogQuality(int fogQuality): void`
- `setFramerate(int framerate): void`
- `setFramerateUncapped(boolean uncappedFPS): void`
- `setLightingFPS(int fps): void`
- `setLightingQuality(int lighting): void`
- `setNewRoofHiding(boolean enabled): void`
- `setPuddlesQuality(int puddles): void`
- `setViewConeOpacity(int viewConeOpacity): void`
- `setWaterQuality(int water): void`

Static functions, called as `PerformanceSettings.name(...)`:

- `getLockFPS(): int`
- `setLockFPS(int lockFPS): void`

Constructors: `PerformanceSettings.new()`.

Static fields (a copy of the value taken when the class is exposed): `animationSkip: int`, `auto3DZombies: boolean`, `baseStaticAnimFramerate: int`, `fboRenderChunk: boolean`, `fogQuality: int`, `instance: PerformanceSettings`, `interpolateAnims: boolean`, `lightingFps: int`, `lightingThread: boolean`, `manualFrameSkips: int`, `modelLighting: boolean`, `newRoofHiding: boolean`, `numberZombiesBlended: int`, `puddlesQuality: int`, `useFbos: boolean`, `viewConeOpacity: int`, `waterQuality: int`, `zombieAnimationSpeedFalloffCount: int`, `zombieBonusFullspeedFalloff: int`.

### Transform

`zombie.core.physics.Transform`, class.

Methods, called as `obj:name(...)`:

- `equals(Object obj): boolean`
- `getMatrix(Matrix4f out): Matrix4f`
- `getOrigin(): Vector3f`
- `getRotation(Quaternionf out): Quaternionf`
- `hashCode(): int`
- `inverse(): void`
- `inverse(Transform tr): void`
- `set(Matrix3f mat): void`
- `set(Matrix4f mat): void`
- `set(Transform tr): void`
- `setIdentity(): void`
- `setRotation(Quaternionf q): void`
- `transform(Vector3f v): void`

Constructors: `Transform.new()`, `Transform.new(Matrix3f mat)`, `Transform.new(Matrix4f mat)`, `Transform.new(Transform tr)`.

### IsoObjectChange

`zombie.core.properties.IsoObjectChange`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getName(): String`
- `hashCode(): int` from `Enum`
- `isProperty(String inObjectChangeName): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String`

Static functions, called as `IsoObjectChange.name(...)`:

- `lookup(Object obj): IsoObjectChange`
- `lookup(String name): IsoObjectChange`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): IsoObjectChange`
- `values(): IsoObjectChange[]`

Enum values (read as `IsoObjectChange.VALUE`): `ADD_ITEM`, `ADD_ITEM_OF_TYPE`, `ADD_RANDOM_DAMAGE_FROM_ZOMBIE`, `ADD_SHEET`, `ADD_ZOMBIE_KILL`, `ANIMAL_ROT_STAGE`, `BECOME_SKELETON`, `CONTAINER`, `CONTAINERS`, `CONTAINER_CUSTOM_TEMPERATURE`, `COUGH`, `DRYER_STATE`, `EMPTY_TRASH`, `ENERGY`, `EXIT_VEHICLE`, `LIGHT_RADIUS`, `LIGHT_SOURCE`, `MECHANIC_ACTION_DONE`, `MODE`, `NAME`, `OBJECT_ID`, `PAINTABLE`, `PLAY_GAIN_EXPERIENCE_LEVEL_SOUND`, `REANIMATED_ID`, `REMOVE_ITEM`, `REMOVE_ITEM_ID`, `REMOVE_ITEM_TYPE`, `REMOVE_ONE_OF`, `REMOVE_SHEET`, `REPLACE_WITH`, `ROTATE`, `SET_CURTAIN_OPEN`, `SET_HALO_NOTE`, `SHOVE`, `SPRITE`, `STATE`, `STOP_BURNING`, `SWAP_ITEM`, `USES_EXTERNAL_WATER_SOURCE`, `VEHICLE_HIT_OBJECT`, `VEHICLE_NO_KEY`, `WAKE_UP`, `WASHER_STATE`, `ZOMBIE_ROT_STAGE`.

### IsoPropertyType

`zombie.core.properties.IsoPropertyType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getName(): String`
- `hashCode(): int` from `Enum`
- `isProperty(String inPropertyName): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String`

Static functions, called as `IsoPropertyType.name(...)`:

- `lookup(String name): IsoPropertyType`
- `lookupOrDefaultStr(String name): String`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): IsoPropertyType`
- `values(): IsoPropertyType[]`

Enum values (read as `IsoPropertyType.VALUE`): `ALWAYS_DRAW`, `AMBIENT_SOUND`, `ATTACHED_CEILING`, `ATTACHED_E`, `ATTACHED_FLOOR`, `ATTACHED_N`, `ATTACHED_NW`, `ATTACHED_S`, `ATTACHED_SE`, `ATTACHED_SURFACE`, `ATTACHED_TO_GLASS`, `ATTACHED_W`, `BED`, `BED_TYPE`, `BLOCKS_PLACEMENT`, `BLOCK_RAIN`, `BLUE_LIGHT`, `BURNT_TILE`, `BUSH`, `CANT_CLIMB`, `CAN_ATTACH_ANIMAL`, `CAN_BE_CUT`, `CAN_BE_REMOVED`, `CAN_BREAK`, `CAN_SCRAP`, `CAR_SLOW_FACTOR`, `CHAIR_E`, `CHAIR_N`, `CHAIR_S`, `CHAIR_W`, `CLIMB_SHEET_E`, `CLIMB_SHEET_N`, `CLIMB_SHEET_S`, `CLIMB_SHEET_TOP_E`, `CLIMB_SHEET_TOP_N`, `CLIMB_SHEET_TOP_S`, `CLIMB_SHEET_TOP_W`, `CLIMB_SHEET_W`, `CLOSE_SNEAK_BONUS`, `COLLIDE_N`, `COLLIDE_W`, `CONNECT_X`, `CONNECT_Y`, `CONTAINER`, `CONTAINER_CAPACITY`, `CONTAINER_CLOSE_SOUND`, `CONTAINER_OPEN_SOUND`, `CONTAINER_POSITION`, `CONTAINER_PUT_SOUND`, `CONTAINER_TAKE_SOUND`, `CORNER_NORTH_WALL`, `CORNER_WEST_WALL`, `COUNTERTOP`, `COUNTERTOP_ATTACH`, `CURTAIN_E`, `CURTAIN_N`, `CURTAIN_S`, `CURTAIN_SOUND`, `CURTAIN_W`, `CUSTOM_ITEM`, `CUSTOM_NAME`, `CUTAWAY_HINT`, `CUT_N`, `CUT_W`, `DAMAGED_SPRITE`, `DIAMOND_FLOOR`, `DOOR_FR_N`, `DOOR_FR_W`, `DOOR_N`, `DOOR_SOUND`, `DOOR_TRANS`, `DOOR_W`, `DOOR_WALL_N`, `DOOR_WALL_N_TRANS`, `DOOR_WALL_W`, `DOOR_WALL_W_TRANS`, `DOUBLE_DOOR`, `DOUBLE_DOOR_1`, `DOUBLE_DOOR_2`, `ENERGY`, `ENTITY_SCRIPT_NAME`, `EXTERIOR`, `E_OFFSET`, `FACING`, `FASCIA_EDGE`, `FENCE_TYPE_HIGH`, `FENCE_TYPE_LOW`, `FIRE_REQUIREMENT`, `FITS_BENEATH_COUNTERTOP`, `FLOOR_ATTACHMENT_E`, `FLOOR_ATTACHMENT_N`, `FLOOR_ATTACHMENT_S`, `FLOOR_ATTACHMENT_W`, `FLOOR_HEIGHT`, `FLOOR_MATERIAL`, `FLOOR_OVERLAY`, `FOOTSTEP_MATERIAL`, `FORCE_AMBIENT`, `FORCE_FADE`, `FORCE_LOCKED`, `FORCE_RENDER`, `FORCE_SINGLE_ITEM`, `FREEZER`, `FREEZER_CAPACITY`, `FREEZER_POSITION`, `FUEL_AMOUNT`, `GARAGE_DOOR`, `GENERATOR_SOUND`, `GENERIC_CRAFTING_SURFACE`, `GLASS_REMOVED_OFFSET`, `GRASS_FLOOR`, `GREEN_LIGHT`, `GRIME_TYPE`, `GROUP_NAME`, `HAS_LIGHT_ON_SPRITE`, `HIT_BY_CAR`, `HOPPABLE_N`, `HOPPABLE_W`, `IGNORE_SURFACE_SNAP`, `INTERIOR_SIDE`, `INVISIBLE`, `ISO_TYPE`, `IS_CLOSED_STATE`, `IS_EAVE`, `IS_FLOOR_ATTACHED`, `IS_FRIDGE`, `IS_GRID_EXTENSION_TILE`, `IS_HIGH`, `IS_LOW`, `IS_MIRROR`, `IS_MOVE_ABLE`, `IS_PAINTABLE`, `IS_STACKABLE`, `IS_SURFACE_OFFSET`, `IS_TABLE`, `IS_TABLE_TOP`, `IS_TRASH_CAN`, `IS_WATER_COLLECTOR`, `ITEM_HEIGHT`, `LIGHT_RADIUS`, `LIGHT_SWITCH`, `LIVING_ROOM`, `MAKE_WINDOW_INVINCIBLE`, `MATERIAL`, `MATERIAL_2`, `MATERIAL_3`, `MATERIAL_TYPE`, `MAXIMUM_WATER_AMOUNT`, `MICROWAVE`, `MINIMUM_CAR_SPEED_DMG`, `MOVEMENT`, `MOVE_TYPE`, `MOVE_WITH_WIND`, `NATURE_FLOOR`, `NEVER_CUTAWAY`, `NO_FREEZER`, `NO_WALL_LIGHTING`, `N_OFFSET`, `OPEN_TILE_OFFSET`, `PAINTING_TYPE`, `PHYSICS_MESH`, `PHYSICS_SHAPE`, `PICK_UP_LEVEL`, `PICK_UP_TOOL`, `PICK_UP_WEIGHT`, `PLACE_TOOL`, `PROPANE_TANK`, `RED_LIGHT`, `RENDER_LAYER`, `ROOF_GROUP`, `ROOF_WALL_START`, `SCRAP_SIZE`, `SCRAP_USE_SKILL`, `SCRAP_USE_TOOL`, `SEAT_MATERIAL`, `SIGNAL`, `SINK_TYPE`, `SLOPED_SURFACE_DIRECTION`, `SLOPED_SURFACE_HEIGHT_MAX`, `SLOPED_SURFACE_HEIGHT_MIN`, `SMASHED_TILE_OFFSET`, `SNOW_TILE`, `SOLID`, `SOLID_FLOOR`, `SOLID_TRANS`, `SPEAR_ONLY_ATTACK_THROUGH`, `SPRITE_GRID_POS`, `STACK_REPLACE_TILE_OFFSET`, `STAIRS_BN`, `STAIRS_BW`, `STAIRS_MN`, `STAIRS_MW`, `STAIRS_TN`, `STAIRS_TW`, `STOP_CAR`, `STREETLIGHT`, `SURFACE`, `S_OFFSET`, `TAINTED_WATER`, `TALL_HOPPABLE_N`, `TALL_HOPPABLE_W`, `THUMP_SOUND`, `TIE_SHEET_ROPE`, `TILE_OVERLAY`, `TRANSPARENT_FLOOR`, `TREAT_AS_WALL_ORDER`, `TREE`, `TV`, `VEGETATION`, `WALL`, `WALL_N`, `WALL_NW`, `WALL_NW_TRANS`, `WALL_N_TRANS`, `WALL_OBJECT_ALLOW_DOORFRAME`, `WALL_OVERLAY`, `WALL_SE`, `WALL_TYPE`, `WALL_W`, `WALL_W_TRANS`, `WATER`, `WATER_AMOUNT`, `WATER_PIPED`, `WEST_ROOF_B`, `WEST_ROOF_M`, `WEST_ROOF_T`, `WHEELIE_BIN`, `WINDOW_FRAME_N`, `WINDOW_FRAME_W`, `WINDOW_LOCKED`, `WINDOW_N`, `WINDOW_W`, `WIND_TYPE`, `W_OFFSET`.

### PropertyContainer

`zombie.core.properties.PropertyContainer`, class. Extends `TShortShortHashMap`.

Methods, called as `obj:name(...)`:

- `AddProperties(PropertyContainer other): void`
- `Clear(): void`
- `CreateKeySet(): void`
- `adjustOrPutValue(short, short, short): short` from `TShortShortHashMap`
- `adjustValue(short, short): boolean` from `TShortShortHashMap`
- `capacity(): int` from `TPrimitiveHash`
- `clear(): void` from `TShortShortHashMap`
- `compact(): void` from `THash`
- `contains(short): boolean` from `TShortShortHash`
- `containsKey(short): boolean` from `TShortShortHashMap`
- `containsValue(short): boolean` from `TShortShortHashMap`
- `ensureCapacity(int): void` from `THash`
- `equals(Object): boolean` from `TShortShortHashMap`
- `forEach(TShortProcedure): boolean` from `TShortShortHash`
- `forEachEntry(TShortShortProcedure): boolean` from `TShortShortHashMap`
- `forEachKey(TShortProcedure): boolean` from `TShortShortHashMap`
- `forEachValue(TShortProcedure): boolean` from `TShortShortHashMap`
- `get(String name): String`
- `get(IsoPropertyType type): String`
- `get(short): short` from `TShortShortHashMap`
- `getAutoCompactionFactor(): float` from `THash`
- `getFlagsList(): ArrayList<IsoFlagType>`
- `getItemHeight(): int`
- `getNoEntryKey(): short` from `TShortShortHash`
- `getNoEntryValue(): short` from `TShortShortHash`
- `getPropertyNames(): ArrayList<String>`
- `getSlopedSurfaceDirection(): IsoDirections`
- `getSlopedSurfaceHeightMax(): int`
- `getSlopedSurfaceHeightMin(): int`
- `getStackReplaceTileOffset(): int`
- `getSurface(): int`
- `has(Double flag): boolean`
- `has(String isoPropertyType): boolean`
- `has(IsoPropertyType isoPropertyType): boolean`
- `has(IsoPropertyType... isoPropertyType): boolean`
- `has(IsoFlagType flag): boolean`
- `hashCode(): int` from `TShortShortHashMap`
- `increment(short): boolean` from `TShortShortHashMap`
- `isEmpty(): boolean` from `TShortShortHashMap`
- `isSurfaceOffset(): boolean`
- `isTable(): boolean`
- `isTableTop(): boolean`
- `iterator(): TShortShortIterator` from `TShortShortHashMap`
- `keySet(): TShortSet` from `TShortShortHashMap`
- `keys(): short[]` from `TShortShortHashMap`
- `keys(short[]): short[]` from `TShortShortHashMap`
- `propertyEquals(String name, String value): boolean`
- `propertyEquals(IsoPropertyType type, String value): boolean`
- `put(short, short): short` from `TShortShortHashMap`
- `putAll(TShortShortMap): void` from `TShortShortHashMap`
- `putAll(Map<? extends Short, ? extends Short>): void` from `TShortShortHashMap`
- `putIfAbsent(short, short): short` from `TShortShortHashMap`
- `readExternal(ObjectInput): void` from `TShortShortHashMap`
- `reenableAutoCompaction(boolean): void` from `THash`
- `remove(short): short` from `TShortShortHashMap`
- `retainEntries(TShortShortProcedure): boolean` from `TShortShortHashMap`
- `set(String tilePropertyKey): void`
- `set(String propName, String propValue): void`
- `set(String propName, String propValue, boolean checkIsoFlagType): void`
- `set(IsoPropertyType type, String propValue): void`
- `set(IsoPropertyType type, String propValue, boolean checkIsoFlagType): void`
- `set(IsoFlagType flag): void`
- `set(IsoFlagType flag, String ignored): void`
- `setAutoCompactionFactor(float): void` from `THash`
- `size(): int` from `THash`
- `tempDisableAutoCompaction(): void` from `THash`
- `toString(): String` from `TShortShortHashMap`
- `transformValues(TShortFunction): void` from `TShortShortHashMap`
- `trimToSize(): void` from `THash`
- `unset(String propName): void`
- `unset(IsoFlagType flag): void`
- `valueCollection(): TShortCollection` from `TShortShortHashMap`
- `values(): short[]` from `TShortShortHashMap`
- `values(short[]): short[]` from `TShortShortHashMap`
- `writeExternal(ObjectOutput): void` from `TShortShortHashMap`

Constructors: `PropertyContainer.new()`.

Static fields (a copy of the value taken when the class is exposed): `FREE: byte`, `FULL: byte`, `REMOVED: byte`, `sorted: List<Object>`.

### AnimatorDebugMonitor

`zombie.core.skinnedmodel.advancedanimation.debug.AnimatorDebugMonitor`, class.

Methods, called as `obj:name(...)`:

- `IsDirty(): boolean`
- `IsDirtyFloatList(): boolean`
- `addCustomVariable(String var): void`
- `getFilter(int index): boolean`
- `getFloatNames(): ArrayList<String>`
- `getLogString(): String`
- `getSelectedVarFloatList(): ArrayList<Float>`
- `getSelectedVarMaxFloat(): String`
- `getSelectedVarMinFloat(): String`
- `getSelectedVariable(): String`
- `getSelectedVariableFloat(): float`
- `getTarget(): IsoGameCharacter`
- `isDoTickStamps(): boolean`
- `removeCustomVariable(String var): void`
- `setDoTickStamps(boolean doTickStamps): void`
- `setFilter(int index, boolean b): void`
- `setSelectedVariable(String key): void`
- `setTarget(IsoGameCharacter isoGameCharacter): void`
- `update(IsoGameCharacter chr, AnimLayer[] layers): void`

Static functions, called as `AnimatorDebugMonitor.name(...)`:

- `getKnownVariables(): List<String>`
- `isKnownVarsDirty(): boolean`
- `registerVariable(String key): void`

Constructors: `AnimatorDebugMonitor.new(IsoGameCharacter chr)`.

Static fields (a copy of the value taken when the class is exposed): `instance: AnimatorDebugMonitor`.

### BeardStyle

`zombie.core.skinnedmodel.population.BeardStyle`, class.

Methods, called as `obj:name(...)`:

- `getLevel(): int`
- `getName(): String`
- `getTrimChoices(): ArrayList<String>`
- `isValid(): boolean`

Constructors: `BeardStyle.new()`.

### BeardStyles

`zombie.core.skinnedmodel.population.BeardStyles`, class.

Methods, called as `obj:name(...)`:

- `FindStyle(String name): BeardStyle`
- `getAllStyles(): ArrayList<BeardStyle>`
- `getInstance(): BeardStyles`
- `getRandomStyle(String outfitName): String`

Static functions, called as `BeardStyles.name(...)`:

- `Parse(String filename): BeardStyles`
- `Reset(): void`
- `init(): void`
- `parse(String filename): BeardStyles`

Constructors: `BeardStyles.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: BeardStyles`.

### ClothingItem

`zombie.core.skinnedmodel.population.ClothingItem`, class. Extends `Asset`.

Methods, called as `obj:name(...)`:

- `GetATexture(): String`
- `addDependency(Asset dependentAsset): void` from `Asset`
- `getAllowRandomHue(): boolean`
- `getAllowRandomTint(): boolean`
- `getAltFemaleModel(): String`
- `getAltMaleModel(): String`
- `getAltModel(boolean female): String`
- `getAssetManager(): AssetManager` from `Asset`
- `getBaseTextures(): ArrayList<String>`
- `getCombinedMask(CharacterMask mask): void`
- `getDecalGroup(): String`
- `getFemaleModel(): String`
- `getMaleModel(): String`
- `getModel(boolean female): String`
- `getObserverCb(): Asset.ObserverCallback` from `Asset`
- `getPath(): AssetPath` from `Asset`
- `getRefCount(): int` from `Asset`
- `getSpawnWith(): ArrayList<String>`
- `getState(): Asset.State` from `Asset`
- `getTextureChoices(): ArrayList<String>`
- `getType(): AssetType`
- `hasModel(): boolean`
- `isEmpty(): boolean` from `Asset`
- `isFailure(): boolean` from `Asset`
- `isHat(): boolean`
- `isMask(): boolean`
- `isReady(): boolean` from `Asset`
- `onCreated(Asset.State state): void` from `Asset`
- `removeDependency(Asset dependentAsset): void` from `Asset`
- `setAssetParams(AssetManager.AssetParams params): void` from `Asset`
- `toString(): String`

Static functions, called as `ClothingItem.name(...)`:

- `tryGetCombinedMask(ClothingItem item, CharacterMask mask): void`
- `tryGetCombinedMask(ClothingItemReference itemRef, CharacterMask mask): void`

Constructors: `ClothingItem.new(AssetPath path, AssetManager assetManager)`.

Static fields (a copy of the value taken when the class is exposed): `ASSET_TYPE: AssetType`, `s_masksFolderDefault: String`.

### HairStyle

`zombie.core.skinnedmodel.population.HairStyle`, class.

Methods, called as `obj:name(...)`:

- `getAlternate(String category): String`
- `getLevel(): int`
- `getName(): String`
- `getTrimChoices(): ArrayList<String>`
- `isAttachedHair(): boolean`
- `isGrowReference(): boolean`
- `isNoChoose(): boolean`
- `isValid(): boolean`

Constructors: `HairStyle.new()`.

### HairStyles

`zombie.core.skinnedmodel.population.HairStyles`, class.

Methods, called as `obj:name(...)`:

- `FindFemaleStyle(String name): HairStyle`
- `FindMaleStyle(String name): HairStyle`
- `getAllFemaleStyles(): ArrayList<HairStyle>`
- `getAllMaleStyles(): ArrayList<HairStyle>`
- `getAlternateForHat(HairStyle style, String category): HairStyle`
- `getRandomFemaleStyle(String outfitName): String`
- `getRandomMaleStyle(String outfitName): String`

Static functions, called as `HairStyles.name(...)`:

- `Parse(String filename): HairStyles`
- `Reset(): void`
- `init(): void`
- `parse(String filename): HairStyles`

Constructors: `HairStyles.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: HairStyles`.

### VoiceStyle

`zombie.core.skinnedmodel.population.VoiceStyle`, class.

Methods, called as `obj:name(...)`:

- `getBodyTypeDefault(): int`
- `getName(): String`
- `getPrefix(): String`
- `getVoiceType(): int`
- `isValid(): boolean`

Constructors: `VoiceStyle.new()`.

### VoiceStyles

`zombie.core.skinnedmodel.population.VoiceStyles`, class.

Methods, called as `obj:name(...)`:

- `FindStyle(String name): VoiceStyle`
- `getAllStyles(): ArrayList<VoiceStyle>`
- `getInstance(): VoiceStyles`

Static functions, called as `VoiceStyles.name(...)`:

- `Parse(String filename): VoiceStyles`
- `Reset(): void`
- `init(): void`
- `parse(String filename): VoiceStyles`

Constructors: `VoiceStyles.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: VoiceStyles`.

### RuntimeAnimationScript

`zombie.core.skinnedmodel.runtime.RuntimeAnimationScript`, class. Extends [BaseScriptObject](/pz/build-42/modding/reference/lua-classes-scripts-1#basescriptobject). Also has the methods of [BaseScriptObject](/pz/build-42/modding/reference/lua-classes-scripts-1#basescriptobject) (28), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Load(String name, String totalFile): void`
- `exec(): void`
- `reset(): void`

Constructors: `RuntimeAnimationScript.new()`.

### AnimalVisual

`zombie.core.skinnedmodel.visual.AnimalVisual`, class. Extends `BaseVisual`.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `copyFrom(BaseVisual baseVisual): void`
- `dressInNamedOutfit(String outfitName, ItemVisuals itemVisuals): void`
- `getAnimalSize(): float`
- `getAnimalType(): String`
- `getIsoAnimal(): IsoAnimal`
- `getModel(): Model`
- `getModelScript(): ModelScript`
- `getModelTest(IsoAnimal animal): Model`
- `getSkinTexture(): String`
- `isSkeleton(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`
- `setSkinTextureName(String textureName): void`

Constructors: `AnimalVisual.new(IAnimalVisual owner)`.

### HumanVisual

`zombie.core.skinnedmodel.visual.HumanVisual`, class. Extends `BaseVisual`.

Methods, called as `obj:name(...)`:

- `addBodyVisual(String clothingItemName): ItemVisual`
- `addBodyVisualFromClothingItemName(String clothingItemName): ItemVisual`
- `addBodyVisualFromItemType(String itemType): ItemVisual`
- `addClothingItem(ItemVisuals itemVisuals, ClothingItem clothingItem): ItemVisual`
- `addClothingItem(ItemVisuals itemVisuals, Item scriptItem): ItemVisual`
- `clear(): void`
- `copyFrom(BaseVisual baseVisual): void`
- `dressInClothingItem(String itemGUID, ItemVisuals itemVisuals): void`
- `dressInClothingItem(String itemGUID, ItemVisuals itemVisuals, boolean clearCurrentVisuals): void`
- `dressInNamedOutfit(String outfitName, ItemVisuals itemVisuals): void`
- `dressInNamedOutfit(String outfitName, ItemVisuals itemVisuals, boolean clear): void`
- `getBeardColor(): ImmutableColor`
- `getBeardModel(): String`
- `getBlood(BloodBodyPartType bodyPartType): float`
- `getBodyHairIndex(): int`
- `getBodyVisuals(): ItemVisuals`
- `getDirt(BloodBodyPartType bodyPartType): float`
- `getHairColor(): ImmutableColor`
- `getHairModel(): String`
- `getHole(BloodBodyPartType bodyPartType): float`
- `getLastStandString(): String`
- `getModel(): Model`
- `getModelScript(): ModelScript`
- `getNaturalBeardColor(): ImmutableColor`
- `getNaturalHairColor(): ImmutableColor`
- `getNonAttachedHair(): String`
- `getOutfit(): Outfit`
- `getSkinColor(): ImmutableColor`
- `getSkinTexture(): String`
- `getSkinTextureIndex(): int`
- `getTotalBlood(): float`
- `hasBodyVisualFromItemType(String itemType): boolean`
- `isFemale(): boolean`
- `isSkeleton(): boolean`
- `isZombie(): boolean`
- `lerp(float start, float end, float delta): float`
- `load(ByteBuffer input, int worldversion): void`
- `loadLastStandString(String saveStr): boolean`
- `pickRandomZombieRotStage(): int`
- `randomBlood(): void`
- `randomDirt(): void`
- `removeBlood(): void`
- `removeBodyVisualFromItemType(String itemType): ItemVisual`
- `removeDirt(): void`
- `save(ByteBuffer output): void`
- `setBeardColor(ImmutableColor color): void`
- `setBeardModel(String model): void`
- `setBlood(BloodBodyPartType bodyPartType, float amount): void`
- `setBodyHairIndex(int index): void`
- `setDirt(BloodBodyPartType bodyPartType, float amount): void`
- `setForceModel(Model model): void`
- `setForceModelScript(String modelScript): void`
- `setHairColor(ImmutableColor color): void`
- `setHairModel(String model): void`
- `setHole(BloodBodyPartType bodyPartType): void`
- `setNaturalBeardColor(ImmutableColor color): void`
- `setNaturalHairColor(ImmutableColor color): void`
- `setNonAttachedHair(String nonAttachedHair): void`
- `setOutfit(Outfit outfit): void`
- `setSkinColor(ImmutableColor color): void`
- `setSkinTextureIndex(int index): void`
- `setSkinTextureName(String textureName): void`
- `synchWithOutfit(Outfit outfit): void`

Static functions, called as `HumanVisual.name(...)`:

- `GetMask(ItemVisuals itemVisuals): CharacterMask`

Constructors: `HumanVisual.new(IHumanVisual owner)`.

### ItemVisual

`zombie.core.skinnedmodel.visual.ItemVisual`, class.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `copyBlood(ItemVisual other): void`
- `copyDirt(ItemVisual other): void`
- `copyFrom(ItemVisual other): void`
- `copyHoles(ItemVisual other): void`
- `copyPatches(ItemVisual other): void`
- `copyVisualFrom(ItemVisual visual): void`
- `getAlternateModelName(): String`
- `getBaseTexture(): int`
- `getBaseTexture(ClothingItem clothingItem): String`
- `getBasicPatch(BloodBodyPartType bodyPartType): float`
- `getBasicPatchesNumber(): int`
- `getBlood(BloodBodyPartType bodyPartType): float`
- `getClothingItem(): ClothingItem`
- `getClothingItemCombinedMask(CharacterMask mask): void`
- `getClothingItemName(): String`
- `getDecal(ClothingItem clothingItem): String`
- `getDenimPatch(BloodBodyPartType bodyPartType): float`
- `getDescription(): String`
- `getDirt(BloodBodyPartType bodyPartType): float`
- `getHole(BloodBodyPartType bodyPartType): float`
- `getHolesNumber(): int`
- `getHue(): float`
- `getHue(ClothingItem clothingItem): float`
- `getInventoryItem(): InventoryItem`
- `getItemType(): String`
- `getLastStandString(): String`
- `getLeatherPatch(BloodBodyPartType bodyPartType): float`
- `getScriptItem(): Item`
- `getTextureChoice(): int`
- `getTextureChoice(ClothingItem clothingItem): String`
- `getTint(): ImmutableColor`
- `getTint(ClothingItem clothingItem): ImmutableColor`
- `getTotalBlood(): float`
- `load(ByteBuffer input, int worldVersion): void`
- `pickUninitializedValues(ClothingItem clothingItem): void`
- `removeBlood(): void`
- `removeDirt(): void`
- `removeHole(int bodyPartIndex): void`
- `removePatch(int bodyPartIndex): void`
- `save(ByteBuffer output): void`
- `setAlternateModelName(String name): void`
- `setBaseTexture(int baseTexture): void`
- `setBasicPatch(BloodBodyPartType bodyPartType): void`
- `setBlood(BloodBodyPartType bodyPartType, float amount): void`
- `setClothingItemName(String name): void`
- `setDecal(String decalName): void`
- `setDenimPatch(BloodBodyPartType bodyPartType): void`
- `setDirt(BloodBodyPartType bodyPartType, float amount): void`
- `setHole(BloodBodyPartType bodyPartType): void`
- `setHue(float hue): void`
- `setInventoryItem(InventoryItem inventoryItem): void`
- `setItemType(String fullType): void`
- `setLeatherPatch(BloodBodyPartType bodyPartType): void`
- `setTextureChoice(int textureChoice): void`
- `setTint(ImmutableColor tint): void`
- `synchWithOutfit(ClothingItemReference itemRef): void`
- `toString(): String`

Static functions, called as `ItemVisual.name(...)`:

- `createLastStandItem(String saveStr): InventoryItem`

Constructors: `ItemVisual.new()`, `ItemVisual.new(ItemVisual other)`.

Static fields (a copy of the value taken when the class is exposed): `NULL_HUE: float`.

### ItemVisuals

`zombie.core.skinnedmodel.visual.ItemVisuals`, class. Extends [ArrayList](/pz/build-42/modding/reference/lua-classes-java-and-libraries#arraylist). Also has the methods of [ArrayList](/pz/build-42/modding/reference/lua-classes-java-and-libraries#arraylist) (38), [List](/pz/build-42/modding/reference/lua-classes-java-and-libraries#list) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `containsAll(Collection<?>): boolean` from `AbstractCollection`
- `findHat(): ItemVisual`
- `findMask(): ItemVisual`
- `getDescription(): String`
- `load(ByteBuffer input, int worldVersion): void`
- `parallelStream(): Stream<E>` from `Collection`
- `save(ByteBuffer output): void`
- `stream(): Stream<E>` from `Collection`
- `toArray(IntFunction<T[]>): T[]` from `Collection`
- `toString(): String` from `AbstractCollection`

Constructors: `ItemVisuals.new()`.

### SpriteRenderer

`zombie.core.SpriteRenderer`, class.

Methods, called as `obj:name(...)`:

- `EndShader(): void`
- `FBORenderChunkEnd(): void`
- `FBORenderChunkStart(int index, boolean bClear): void`
- `NewFrame(): void`
- `ShaderUpdate1f(int shaderID, int uniform, float uniformValue): void`
- `ShaderUpdate1i(int shaderID, int uniform, int uniformValue): void`
- `ShaderUpdate2f(int shaderID, int uniform, float value1, float value2): void`
- `ShaderUpdate3f(int shaderID, int uniform, float value1, float value2, float value3): void`
- `ShaderUpdate4f(int shaderID, int uniform, float value1, float value2, float value3, float value4): void`
- `StartShader(int iD, int playerIndex): void`
- `StartShader(int iD, int playerIndex, ShaderUniformSetter uniforms): void`
- `acquireStateForRendering(BooleanSupplier waitCallback): SpriteRenderState`
- `beginProfile(PerformanceProfileProbe probe): void`
- `clearCutawayTexture(): void`
- `clearSprites(): void`
- `clearUseVertColorsArray(): void`
- `create(): void`
- `doCoreIntParam(int id, float val): void`
- `drawGeneric(TextureDraw.GenericDrawer gd): TextureDraw`
- `drawModel(ModelManager.ModelSlot model): void`
- `drawParticles(int playerIndex, int var1, int var2): void`
- `drawPuddles(int playerIndex, int z, int firstSquare, int numSquares): void`
- `drawSkyBox(Shader shader, int playerIndex, int apiId, int bufferId): void`
- `drawWater(Shader shader, int playerIndex, int firstSquare, int numSquares, boolean bShore): void`
- `endProfile(PerformanceProfileProbe probe): void`
- `getDoAdditive(): boolean`
- `getMainStateIndex(): int`
- `getPlayerMaxZoom(): float`
- `getPlayerMinZoom(): float`
- `getPlayerZoomLevel(): float`
- `getPopulatingState(): SpriteRenderState`
- `getRenderStateIndex(): int`
- `getRenderingPlayerCamera(int userId): PlayerCamera`
- `getRenderingPlayerIndex(): int`
- `getRenderingState(): SpriteRenderState`
- `glAlphaFunc(int a, float b): void`
- `glBind(int a): void`
- `glBindFramebuffer(int binding, int fbo): void`
- `glBlendEquation(int a): void`
- `glBlendFunc(int a, int b): void`
- `glBlendFuncSeparate(int a, int b, int c, int d): void`
- `glBuffer(int i, int p): void`
- `glClear(int a): void`
- `glClearColor(int r, int g, int b, int a): void`
- `glClearDepth(float d): void`
- `glColorMask(int a, int b, int c, int d): void`
- `glDepthFunc(int a): void`
- `glDepthMask(boolean b): void`
- `glDisable(int a): void`
- `glDoEndFrame(): void`
- `glDoEndFrameFx(int player): void`
- `glDoStartFrame(int w, int h, float zoom, int player): void`
- `glDoStartFrame(int w, int h, float zoom, int player, boolean isTextFrame): void`
- `glDoStartFrameFlipY(int w, int h, float zoom, int player): void`
- `glDoStartFrameFx(int w, int h, int player): void`
- `glDoStartFrameNoZoom(int w, int h, float zoom, int player): void`
- `glEnable(int a): void`
- `glGenerateMipMaps(int a): void`
- `glIgnoreStyles(boolean b): void`
- `glLoadIdentity(): void`
- `glStencilFunc(int a, int b, int c): void`
- `glStencilMask(int a): void`
- `glStencilOp(int a, int b, int c): void`
- `glTexParameteri(int a, int b, int c): void`
- `glViewport(int x, int y, int width, int height): void`
- `initFromIsoCamera(int nPlayer): void`
- `isMaxZoomLevel(): boolean`
- `isMinZoomLevel(): boolean`
- `isWaitingForRenderState(): boolean`
- `notifyRenderStateQueue(): void`
- `popIsoView(): void`
- `postRender(): void`
- `prePopulating(): void`
- `pushFrameDown(): void`
- `pushIsoView(float ox, float oy, float oz, float useangle, boolean vehicle): void`
- `releaseFBORenderChunkLock(): void`
- `render(ImDrawData drawData): void`
- `render(Texture tex, double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4, double u1, double v1, double u2, double v2, double u3, double v3, double u4, double v4, float r, float g, float b, float a): void`
- `render(Texture tex, double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4, float r1, float g1, float b1, float a1, float r2, float g2, float b2, float a2, float r3, float g3, float b3, float a3, float r4, float g4, float b4, float a4, Consumer<TextureDraw> texdModifier): void`
- `render(Texture tex, double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `render(Texture tex, float x, float y, float width, float height, float r, float g, float b, float a, float u1, float v1, float u2, float v2, float u3, float v3, float u4, float v4): void`
- `render(Texture tex, float x, float y, float width, float height, float r, float g, float b, float a, float u1, float v1, float u2, float v2, float u3, float v3, float u4, float v4, Consumer<TextureDraw> texdModifier): void`
- `render(Texture tex, float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4, int c1, int c2, int c3, int c4): void`
- `render(Texture tex, float x, float y, float width, float height, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `render(Texture tex, Texture tex2, float x, float y, float width, float height, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `renderClamped(Texture tex, int x, int y, int width, int height, int clampMinX, int clampMinY, int clampWidth, int clampHeight, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `renderPoly(float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4, float r, float g, float b, float a): void`
- `renderPoly(Texture tex, float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4, float r, float g, float b, float a): void`
- `renderPoly(Texture tex, float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4, float r, float g, float b, float a, float u1, float v1, float u2, float v2, float u3, float v3, float u4, float v4): void`
- `renderQueued(): void`
- `renderRect(int x, int y, int width, int height, float r, float g, float b, float a): void`
- `renderdebug(Texture tex, float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4, float r1, float g1, float b1, float a1, float r2, float g2, float b2, float a2, float r3, float g3, float b3, float a3, float r4, float g4, float b4, float a4, Consumer<TextureDraw> texdModifier): void`
- `renderflipped(Texture tex, float x, float y, float width, float height, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `renderi(Texture tex, int x, int y, int width, int height, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `renderline(Texture tex, int x1, int y1, int x2, int y2, float r, float g, float b, float a): void`
- `renderline(Texture tex, int x1, int y1, int x2, int y2, float r, float g, float b, float a, float thickness): void`
- `renderlinef(Texture tex, float x1, float y1, float x2, float y2, float r, float g, float b, float a, float baseThickness, float topThickness): void`
- `renderlinef(Texture tex, float x1, float y1, float x2, float y2, float r, float g, float b, float a, int thickness): void`
- `setCutawayTexture(Texture tex, int x, int y, int w, int h): void`
- `setCutawayTexture2(Texture tex, int x, int y, int w, int h): void`
- `setDefaultStyle(AbstractStyle style): void`
- `setDoAdditive(boolean bDoAdditive): void`
- `setExtraWallShaderParams(SpriteRenderer.WallShaderTexRender wallTexRender): void`
- `setRenderingPlayerIndex(int player): void`
- `setUseVertColorsArray(byte whichShader, int c0, int c1, int c2, int c3): void`
- `startOffscreenUI(): void`
- `stopOffscreenUI(): void`

Static functions, called as `SpriteRenderer.name(...)`:

- `getWaitTime(): long`

Constructors: `SpriteRenderer.new()`.

Static fields (a copy of the value taken when the class is exposed): `NUM_RENDER_STATES: int`, `glBlendfuncEnabled: boolean`, `instance: SpriteRenderer`, `ringBuffer: SpriteRenderer.RingBuffer`.

### Stash

`zombie.core.stash.Stash`, class.

Methods, called as `obj:name(...)`:

- `applyAnnotations(UIWorldMap ui): void`
- `getBuildingX(): int`
- `getBuildingY(): int`
- `getItem(): String`
- `getName(): String`
- `load(KahluaTableImpl stashDesc): void`

Constructors: `Stash.new(String name)`.

### StashBuilding

`zombie.core.stash.StashBuilding`, class.

Methods, called as `obj:name(...)`:

- `getName(): String`

Constructors: `StashBuilding.new(String stashName, int buildingX, int buildingY)`.

### StashSystem

`zombie.core.stash.StashSystem`, class.

Static functions, called as `StashSystem.name(...)`:

- `Reset(): void`
- `checkStashItem(InventoryItem item): void`
- `doBuildingStash(BuildingDef def): void`
- `doStashItem(Stash stash, InventoryItem item): void`
- `getAllStashes(): ArrayList<Stash>`
- `getAlreadyReadMap(): ArrayList<String>`
- `getPossibleStashes(): ArrayList<StashBuilding>`
- `getStash(String stashName): Stash`
- `init(): void`
- `initAllStashes(): void`
- `isStashBuilding(BuildingDef def): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `prepareBuildingStash(String stashName): void`
- `reinit(): void`
- `save(ByteBuffer output): void`
- `visitedBuilding(BuildingDef def): void`

Constructors: `StashSystem.new()`.

Static fields (a copy of the value taken when the class is exposed): `allStashes: ArrayList<Stash>`, `buildingsToDo: ArrayList<StashBuilding>`, `possibleStashes: ArrayList<StashBuilding>`.

### SurvivalGuideEntry

`zombie.core.SurvivalGuideEntry`, class.

Methods, called as `obj:name(...)`:

- `getCategoryImage(): String`
- `getDescription(): String`
- `getJoypadKeys(): List<String>`
- `getKeys(): List<String>`
- `getSubCategory(): String`
- `getText(boolean hasJoystick): String`
- `getThumbnail(): String`
- `getTitle(): String`
- `getVideo(): String`
- `toString(): String`

Static functions, called as `SurvivalGuideEntry.name(...)`:

- `get(ResourceLocation id): SurvivalGuideEntry`
- `getAll(): List<SurvivalGuideEntry>`
- `register(String id, String subCategory, List<String> keys, List<String> joypadKeys): SurvivalGuideEntry`

Static fields (a copy of the value taken when the class is exposed): `ACTIVATE_PVP: SurvivalGuideEntry`, `ADD_BAIT: SurvivalGuideEntry`, `ANIMAL_HUTCH: SurvivalGuideEntry`, `ANIMAL_MENU: SurvivalGuideEntry`, `ANIMAL_ROPE: SurvivalGuideEntry`, `ANIMAL_STRESS: SurvivalGuideEntry`, `ANIMAL_UPKEEP: SurvivalGuideEntry`, `ANIMAL_ZONE: SurvivalGuideEntry`, `BAD_GASES: SurvivalGuideEntry`, `BAD_SMELLS: SurvivalGuideEntry`, `BARRICADES: SurvivalGuideEntry`, `BUILD_MENU: SurvivalGuideEntry`, `BUILD_WALLS: SurvivalGuideEntry`, `BURN_CORPSES: SurvivalGuideEntry`, `BUTCHERING: SurvivalGuideEntry`, `CAST_AND_CATCH: SurvivalGuideEntry`, `CHARACTER: SurvivalGuideEntry`, `CLEANING: SurvivalGuideEntry`, `CLEANING_AREA: SurvivalGuideEntry`, `CLEAN_SELF: SurvivalGuideEntry`, `COMBAT: SurvivalGuideEntry`, `COMBAT_EQUIP_PRIMARY: SurvivalGuideEntry`, `COMBAT_MELEE_ATTACK: SurvivalGuideEntry`, `COMBAT_SHOOTING: SurvivalGuideEntry`, `COMBAT_SHOVE: SurvivalGuideEntry`, `COOKING: SurvivalGuideEntry`, `CRAFTING: SurvivalGuideEntry`, `CRAFTING_INVENTORY: SurvivalGuideEntry`, `CRAFTING_MENU: SurvivalGuideEntry`, `CRAFTING_STATION: SurvivalGuideEntry`, `CRAFT_ON_SURFACE: SurvivalGuideEntry`, `CURTAINS: SurvivalGuideEntry`, `DIG_FURROW: SurvivalGuideEntry`, `DOORS: SurvivalGuideEntry`, `EATING_DRINKING: SurvivalGuideEntry`, `EXERCISE: SurvivalGuideEntry`, `FACTION_MENU: SurvivalGuideEntry`, `FARMING: SurvivalGuideEntry`, `FENCE_DEFENSE: SurvivalGuideEntry`, `FIRST_AID: SurvivalGuideEntry`, `FISHING: SurvivalGuideEntry`, `FISHING_ZONE: SurvivalGuideEntry`, `FOOD_AND_WATER: SurvivalGuideEntry`, `FOOD_PREPARATION: SurvivalGuideEntry`, `FORAGING: SurvivalGuideEntry`, `FORAGING_MINING: SurvivalGuideEntry`, `GAS_REFILL: SurvivalGuideEntry`, `HARVESTING: SurvivalGuideEntry`, `HOTBAR: SurvivalGuideEntry`, `INTERACTABLE: SurvivalGuideEntry`, `INVENTORY: SurvivalGuideEntry`, `INVENTORY_BACKPACKS: SurvivalGuideEntry`, `INVENTORY_DOUBLE_CLICK: SurvivalGuideEntry`, `INVENTORY_WEIGHT: SurvivalGuideEntry`, `LAUNDRY: SurvivalGuideEntry`, `LIGHTS: SurvivalGuideEntry`, `LIQUID: SurvivalGuideEntry`, `MAP: SurvivalGuideEntry`, `MECHANICS_MENU: SurvivalGuideEntry`, `MEDICAL_CHECK: SurvivalGuideEntry`, `MINING: SurvivalGuideEntry`, `MOODLES: SurvivalGuideEntry`, `MOVEMENT: SurvivalGuideEntry`, `MOVEMENT_AIMING: SurvivalGuideEntry`, `MOVEMENT_CLIMBING: SurvivalGuideEntry`, `MOVEMENT_SNEAK_FENCE: SurvivalGuideEntry`, `MOVEMENT_STRAFING: SurvivalGuideEntry`, `MOVEMENT_VAULTING: SurvivalGuideEntry`, `MOVEMENT_WALKING_RUNNING: SurvivalGuideEntry`, `MULTIPLAYER: SurvivalGuideEntry`, `MULTIPLAYER_CHAT: SurvivalGuideEntry`, `OPEN_CANS: SurvivalGuideEntry`, `OPEN_SEEDS: SurvivalGuideEntry`, `PETTING: SurvivalGuideEntry`, `RANCHING: SurvivalGuideEntry`, `RELOAD: SurvivalGuideEntry`, `REST: SurvivalGuideEntry`, `RIGHT_CLICK_INTERACT: SurvivalGuideEntry`, `SEASONS_AND_WEATHER: SurvivalGuideEntry`, `SHEET_ROPES: SurvivalGuideEntry`, `SHOUTING: SurvivalGuideEntry`, `SKILL_BOOKS: SurvivalGuideEntry`, `SOW_SEEDS: SurvivalGuideEntry`, `START_VEHICLE: SurvivalGuideEntry`, `STEALTH_KILL: SurvivalGuideEntry`, `TELEVISION: SurvivalGuideEntry`, `TEMPERATURE: SurvivalGuideEntry`, `TRAILERS: SurvivalGuideEntry`, `TRAPPING: SurvivalGuideEntry`, `TREAT_WATER: SurvivalGuideEntry`, `VEHICLES: SurvivalGuideEntry`, `VEHICLE_RADIAL_MENU: SurvivalGuideEntry`, `VEHICLE_STORAGE: SurvivalGuideEntry`, `WEATHER: SurvivalGuideEntry`, `WINDOWS: SurvivalGuideEntry`, `ZOMBIE_ATTACKS: SurvivalGuideEntry`.

### ColorInfo

`zombie.core.textures.ColorInfo`, class.

Methods, called as `obj:name(...)`:

- `desaturate(float s): void`
- `equals(Object obj): boolean`
- `getA(): float`
- `getB(): float`
- `getG(): float`
- `getR(): float`
- `interp(ColorInfo to, float delta, ColorInfo dest): void`
- `min(float r, float g, float b, float a): ColorInfo`
- `minRGB(float rgb): ColorInfo`
- `minRGB(float r, float g, float b): ColorInfo`
- `set(float r, float g, float b, float a): ColorInfo`
- `set(ColorInfo other): ColorInfo`
- `setABGR(int abgr): ColorInfo`
- `setRGB(float rgb): ColorInfo`
- `setRGB(float r, float g, float b): ColorInfo`
- `toColor(): Color`
- `toImmutableColor(): ImmutableColor`
- `toString(): String`

Constructors: `ColorInfo.new()`, `ColorInfo.new(float r, float g, float b, float a)`.

### NinePatchTexture

`zombie.core.textures.NinePatchTexture`, class. Extends `Asset`.

Methods, called as `obj:name(...)`:

- `addDependency(Asset dependentAsset): void` from `Asset`
- `getAssetManager(): AssetManager` from `Asset`
- `getColumnWidth(int column): int`
- `getMinHeight(): int`
- `getMinWidth(): int`
- `getObserverCb(): Asset.ObserverCallback` from `Asset`
- `getPath(): AssetPath` from `Asset`
- `getRefCount(): int` from `Asset`
- `getRowHeight(int row): int`
- `getState(): Asset.State` from `Asset`
- `getType(): AssetType`
- `hasBottomRow(): boolean`
- `hasLeftColumn(): boolean`
- `hasRightColumn(): boolean`
- `hasTopRow(): boolean`
- `is1x3(): boolean`
- `is3x1(): boolean`
- `is9x9(): boolean`
- `isEmpty(): boolean` from `Asset`
- `isFailure(): boolean` from `Asset`
- `isReady(): boolean` from `Asset`
- `onCreated(Asset.State state): void` from `Asset`
- `removeDependency(Asset dependentAsset): void` from `Asset`
- `render(float x, float y, float width, float height): void`
- `render(float x, float y, float width, float height, float r, float g, float b, float a): void`
- `setAssetParams(AssetManager.AssetParams params): void` from `Asset`
- `setImageData(ImageData imageData): void`

Static functions, called as `NinePatchTexture.name(...)`:

- `Reset(): void`
- `getSharedTexture(String path): NinePatchTexture`
- `onTexturePacksChanged(): void`

Static fields (a copy of the value taken when the class is exposed): `ASSET_TYPE: AssetType`, `BOTTOM_LEFT: int`, `BOTTOM_MIDDLE: int`, `BOTTOM_RIGHT: int`, `MIDDLE_CENTER: int`, `MIDDLE_LEFT: int`, `MIDDLE_RIGHT: int`, `TOP_LEFT: int`, `TOP_MIDDLE: int`, `TOP_RIGHT: int`.

### Texture

`zombie.core.textures.Texture`, class. Extends `Asset`.

Methods, called as `obj:name(...)`:

- `TexDeferedCreation(int w, int h, int flags): void`
- `TexDeferedCreation(int w, int h, int flags, int format, int internalFormat): void`
- `addDependency(Asset dependentAsset): void` from `Asset`
- `bind(): void`
- `bind(int unit): void`
- `copyMaskRegion(Texture from, int x, int y, int width, int height): void`
- `createMask(): void`
- `createMask(boolean[] mask): void`
- `createMask(BooleanGrid mask): void`
- `createMask(WrappedBuffer buf): void`
- `destroy(): void`
- `equals(Texture other): boolean`
- `getAssetManager(): AssetManager` from `Asset`
- `getData(): WrappedBuffer`
- `getHeight(): int`
- `getHeightHW(): int`
- `getHeightOrig(): int`
- `getID(): int`
- `getMask(): Mask`
- `getName(): String`
- `getObserverCb(): Asset.ObserverCallback` from `Asset`
- `getOffsetX(): float`
- `getOffsetY(): float`
- `getPath(): AssetPath` from `Asset`
- `getRealHeight(): int`
- `getRealWidth(): int`
- `getRefCount(): int` from `Asset`
- `getState(): Asset.State` from `Asset`
- `getTextureId(): TextureID`
- `getType(): AssetType`
- `getUVScale(Vector2 uvScale): Vector2`
- `getUseAlphaChannel(): boolean`
- `getWidth(): int`
- `getWidthHW(): int`
- `getWidthOrig(): int`
- `getX(): int`
- `getXEnd(): float`
- `getXStart(): float`
- `getY(): int`
- `getYEnd(): float`
- `getYStart(): float`
- `isCollisionable(): boolean`
- `isDestroyed(): boolean`
- `isEmpty(): boolean` from `Asset`
- `isFailure(): boolean` from `Asset`
- `isMaskSet(int x, int y): boolean`
- `isReady(): boolean` from `Asset`
- `isSolid(): boolean`
- `isValid(): boolean`
- `loadMaskRegion(ByteBuffer cache): void`
- `makeTransp(int red, int green, int blue): void`
- `onBeforeReady(): void`
- `onCreated(Asset.State state): void` from `Asset`
- `reloadFromFile(String name): void`
- `removeDependency(Asset dependentAsset): void` from `Asset`
- `render(float x, float y): void`
- `render(float x, float y, float width, float height): void`
- `render(float x, float y, float width, float height, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `render(ObjectRenderEffects dr, float x, float y, float width, float height, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `renderdiamond(float x, float y, float width, float height, int l, int u, int r, int d): void`
- `rendershader2(float x, float y, float width, float height, int texx, int texy, int texWidth, int texHeight, float r, float g, float b, float a): void`
- `renderstrip(int x, int y, int width, int height, float r, float g, float b, float a, Consumer<TextureDraw> texdModifier): void`
- `renderwalln(float x, float y, float width, float height, int u, int d, int u2, int d2): void`
- `renderwallnw(float x, float y, float width, float height, int u, int d, int u2, int d2, int r, int r2): void`
- `renderwallw(float x, float y, float width, float height, int u, int d, int u2, int d2): void`
- `saveMask(String name): void`
- `saveMaskRegion(ByteBuffer cache): void`
- `saveOnRenderThread(String filename): void`
- `saveToCurrentSavefileDirectory(String filename): void`
- `saveToZomboidDirectory(String filename): void`
- `setAlphaForeach(int red, int green, int blue, int alpha): void`
- `setAssetParams(AssetManager.AssetParams params): void` from `Asset`
- `setCustomizedTexture(): void`
- `setData(ByteBuffer data): void`
- `setHeight(int height): void`
- `setMask(Mask mask): void`
- `setName(String name): void`
- `setNameOnly(String name): void`
- `setOffsetX(int offset): void`
- `setOffsetY(int offset): void`
- `setRealHeight(int realHeight): void`
- `setRealWidth(int realWidth): void`
- `setRegion(int x, int y, int width, int height): void`
- `setUseAlphaChannel(boolean value): void`
- `setWidth(int width): void`
- `split(int xOffset, int yOffset, int width, int height): Texture`
- `split(String name, int xOffset, int yOffset, int width, int height): Texture`
- `split(int xOffset, int yOffset, int row, int coloumn, int width, int height, int spaceX, int spaceY): Texture[]`
- `split2D(int[] xstep, int[] ystep): Texture[][]`
- `splitIcon(): Texture`
- `toString(): String`

Static functions, called as `Texture.name(...)`:

- `bindNone(): void`
- `clearTextures(): void`
- `collectAllIcons(HashMap<String, String> map, HashMap<String, String> mapFull): void`
- `flipPixels(int[] imgPixels, int imgw, int imgh): int[]`
- `forgetTexture(String name): void`
- `getEngineMipmapTexture(): Texture`
- `getErrorTexture(): Texture`
- `getSharedTexture(String name): Texture`
- `getSharedTexture(String name, int flags): Texture`
- `getSteamAvatar(long steamID): Texture`
- `getTexture(String name): Texture`
- `getWhite(): Texture`
- `onTexturePacksChanged(): void`
- `processFilePath(String filePath): String`
- `reload(String name): void`
- `steamAvatarChanged(long steamID): void`
- `trygetTexture(String name): Texture`

Constructors: `Texture.new()`, `Texture.new(int width, int height, int flags)`, `Texture.new(int width, int height, int flags, boolean deferCreation)`, `Texture.new(int width, int height, int flags, int format, int internalFormat)`, `Texture.new(int width, int height, String name, int flags)`, `Texture.new(String file)`, `Texture.new(String file, boolean useAlphaChannel)`, `Texture.new(String file, boolean bDelete, boolean bUseAlpha)`, `Texture.new(String file, int red, int green, int blue)`, `Texture.new(String name, BufferedInputStream b, boolean bDoMask)`, `Texture.new(AssetPath path, AssetManager manager, Texture.TextureAssetParams params)`, `Texture.new(Texture t)`, `Texture.new(TextureID data, String name)`, `Texture.new(TextureID data, String name, int splitX, int splitY, int splitW, int splitH)`.

Static fields (a copy of the value taken when the class is exposed): `ASSET_TYPE: AssetType`, `bindCount: int`, `doingQuad: boolean`, `la: float`, `lastTextureID: int`, `lastlastTextureID: int`, `lb: float`, `lg: float`, `lr: float`, `nullTextures: HashSet<String>`, `totalTextureID: int`, `warnFailFindTexture: boolean`.

### VideoTexture

`zombie.core.textures.VideoTexture`, class. Extends [Texture](#texture). Also has the methods of [Texture](#texture) (95), listed on their own entries.

Methods, called as `obj:name(...)`:

- `Close(): void`
- `LoadVideoFile(): boolean`
- `RenderFrame(): void`
- `addDependency(Asset dependentAsset): void` from `Asset`
- `closeAndDestroy(): void`
- `getAssetManager(): AssetManager` from `Asset`
- `getObserverCb(): Asset.ObserverCallback` from `Asset`
- `getPath(): AssetPath` from `Asset`
- `getRefCount(): int` from `Asset`
- `getState(): Asset.State` from `Asset`
- `isEmpty(): boolean` from `Asset`
- `isFailure(): boolean` from `Asset`
- `isReady(): boolean` from `Asset`
- `isValid(): boolean`
- `onCreated(Asset.State state): void` from `Asset`
- `removeDependency(Asset dependentAsset): void` from `Asset`
- `setAssetParams(AssetManager.AssetParams params): void` from `Asset`

Static functions, called as `VideoTexture.name(...)`:

- `getOrCreate(String filename, int width, int height): VideoTexture`
- `getOrCreate(String filename, int width, int height, boolean useAsync): VideoTexture`

Static fields (a copy of the value taken when the class is exposed): `ASSET_TYPE: AssetType`, `bindCount: int`, `doingQuad: boolean`, `la: float`, `lastTextureID: int`, `lastlastTextureID: int`, `lb: float`, `lg: float`, `lr: float`, `nullTextures: HashSet<String>`, `totalTextureID: int`, `warnFailFindTexture: boolean`.

### TradingState

`zombie.core.TradingState`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `TradingState.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): TradingState`
- `values(): TradingState[]`

Enum values (read as `TradingState.VALUE`): `DealWasFinalized`, `DealWasSealed`, `DealWasUnsealed`, `WindowWasClosed`.

### Translator

`zombie.core.Translator`, class.

Static functions, called as `Translator.name(...)`:

- `debugItemEvolvedRecipeNames(): void`
- `debugItemNames(): void`
- `debugMultiStageBuildNames(): void`
- `debugRecipeGroupNames(): void`
- `debugRecipeNames(): void`
- `forLanguageStack(Consumer<Language> consumer): void`
- `getAttributeText(String s): String`
- `getAttributeTextOrNull(String s): String`
- `getAvailableLanguage(): List<Language>`
- `getAzertyMap(): ArrayList<String>`
- `getDefaultLanguage(): Language`
- `getDisplayItemName(String trim): String`
- `getEntityText(String s): String`
- `getFluidText(String s): String`
- `getItemEvolvedRecipeName(String fullType): String`
- `getItemNameFromFullType(String fullType): String`
- `getLanguage(): Language`
- `getMapLabelText(String s): String`
- `getMoveableDisplayName(String name): String`
- `getMoveableDisplayName(IsoObject item): String`
- `getMoveableDisplayNameOrNull(String name): String`
- `getRecipeGroupName(String name): String`
- `getRecipeName(String name): String`
- `getText(String desc, Object... args): String`
- `getTextMediaEN(String desc): String`
- `getTextOrNull(String desc, Object... args): String`
- `getUI(): Map<String, String>`
- `loadFiles(): void`
- `readMapTranslation(ChooseGameInfo.Map map, String dir): void`
- `readModTranslation(ChooseGameInfo.Mod mod): void`
- `setDefaultItemEvolvedRecipeName(String fullType, String english): void`
- `setLanguage(int languageId): void`
- `setLanguage(Language newlanguage): void`

Constructors: `Translator.new()`.

Static fields (a copy of the value taken when the class is exposed): `BY_NAME: Map<String, Map<String, String>>`, `LOOKALIKE_CHARS: char[]`, `debug: boolean`, `language: Language`.

### SteamFriend

`zombie.core.znet.SteamFriend`, class.

Methods, called as `obj:name(...)`:

- `getAvatar(): Texture`
- `getName(): String`
- `getState(): String`
- `getSteamID(): String`

Constructors: `SteamFriend.new()`, `SteamFriend.new(String name, long steamId)`.

### SteamUGCDetails

`zombie.core.znet.SteamUGCDetails`, class.

Methods, called as `obj:name(...)`:

- `getChildID(int index): long`
- `getChildren(): long[]`
- `getFileSize(): int`
- `getID(): long`
- `getIDString(): String`
- `getNumChildren(): int`
- `getState(): String`
- `getTimeCreated(): long`
- `getTimeUpdated(): long`
- `getTitle(): String`

Constructors: `SteamUGCDetails.new(long id, String title, long timeCreated, long timeUpdated, int fileSize, long[] childIds)`.

### SteamWorkshopItem

`zombie.core.znet.SteamWorkshopItem`, class.

Methods, called as `obj:name(...)`:

- `create(): boolean`
- `getChangeNote(): String`
- `getContentFolder(): String`
- `getDescription(): String`
- `getExtendedErrorInfo(String error): String`
- `getFolderName(): String`
- `getID(): String`
- `getPreviewImage(): String`
- `getSubmitDescription(): String`
- `getSubmitTags(): String[]`
- `getTags(): ArrayList<String>`
- `getTitle(): String`
- `getUpdateProgress(KahluaTable table): boolean`
- `getUpdateProgressTotal(): int`
- `getVisibility(): String`
- `getVisibilityInteger(): int`
- `readWorkshopTxt(): boolean`
- `setChangeNote(String changeNote): void`
- `setDescription(String description): void`
- `setID(String id): void`
- `setTags(ArrayList<String> tags): void`
- `setTitle(String title): void`
- `setVisibility(String visibility): void`
- `setVisibilityInteger(int v): void`
- `submitUpdate(): boolean`
- `validateContents(): String`
- `validatePreviewImage(Path path): String`
- `writeWorkshopTxt(): boolean`

Static functions, called as `SteamWorkshopItem.name(...)`:

- `getAllowedTags(): ArrayList<String>`

Constructors: `SteamWorkshopItem.new(String workshopFolder)`.

### BooleanDebugOption

`zombie.debug.BooleanDebugOption`, class. Extends [BooleanConfigOption](#booleanconfigoption). Also has the methods of [BooleanConfigOption](#booleanconfigoption) (12), [ConfigOption](#configoption) (3), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `getParent(): IDebugOptionGroup`
- `getValue(): boolean`
- `isDebugOnly(): boolean`
- `onFullPathChanged(): void`
- `setParent(IDebugOptionGroup parent): void`

Static functions, called as `BooleanDebugOption.name(...)`:

- `newDebugOnlyOption(IDebugOptionGroup parentGroup, String name, boolean defaultValue): BooleanDebugOption`
- `newOption(IDebugOptionGroup parentGroup, String name, boolean defaultValue): BooleanDebugOption`

Constructors: `BooleanDebugOption.new(String name, boolean debugOnly, boolean defaultValue)`.

### DebugCSVExport

`zombie.debug.DebugCSVExport`, class.

Static functions, called as `DebugCSVExport.name(...)`:

- `doCSV(): void`

Constructors: `DebugCSVExport.new()`.

### DebugCSVExportFirearms

`zombie.debug.DebugCSVExportFirearms`, class.

Static functions, called as `DebugCSVExportFirearms.name(...)`:

- `doCSV(): void`

Constructors: `DebugCSVExportFirearms.new()`.

### DebugCSVExportFluidContainers

`zombie.debug.DebugCSVExportFluidContainers`, class.

Static functions, called as `DebugCSVExportFluidContainers.name(...)`:

- `doCSV(): void`

Constructors: `DebugCSVExportFluidContainers.new()`.

### DebugCSVExportMoveableTiles

`zombie.debug.DebugCSVExportMoveableTiles`, class.

Static functions, called as `DebugCSVExportMoveableTiles.name(...)`:

- `doCSV(): void`

Constructors: `DebugCSVExportMoveableTiles.new()`.

### DebugLog

`zombie.debug.DebugLog`, class.

Methods, called as `obj:name(...)`:

- `createLogStream(DebugType debugType): DebugLogStream`
- `echoExceptionLineToLogFiles(DebugType debugType, LogSeverity logSeverity, String messageType, String outString): void`
- `echoToLogFiles(DebugType debugType, LogSeverity logSeverity, String callerAffix, String rawOutString): void`
- `formatLogStringAnimationRecordingFile(DebugType debugType, LogSeverity logSeverity, String callerAffix, Object outputStr): String`
- `formatLogStringForConsole(DebugType debugType, LogSeverity logSeverity, String callerAffix, Object outputStr): String`
- `formatLogStringForLogFile(DebugType debugType, LogSeverity logSeverity, String callerAffix, Object outputStr): String`
- `getRecordingOut(): PrintStream`
- `init(): void`
- `isLogServerTimeMsEnabled(): boolean`
- `isLogTraceFileLocationEnabled(): boolean`
- `loadDebugConfig(String filepath): void`
- `readConfigCommand(String s, boolean enable): void`
- `setLogServerTimeMsEnabled(boolean logServerTimeMsEnabled): void`
- `setRecordingOut(PrintStream recordingOut): void`
- `setStdErr(OutputStream out): void`
- `setStdOut(OutputStream out): void`
- `shouldLogIncludeServerTime(): boolean`
- `shouldLogIncludeTimeMs(): boolean`

Static functions, called as `DebugLog.name(...)`:

- `getDebugTypes(): ArrayList<DebugType>`
- `getInstance(): DebugLog`
- `getLogSeverityForSelectedProfile(DebugType debugType): LogSeverity`
- `getProfileAliases(): List<String>`
- `getProfileNames(): List<String>`
- `getSelectedProfileName(): String`
- `invokeProfile(String profileOrAlias): void`
- `invokeSelectedProfile(): void`
- `isEnabled(DebugType type): boolean`
- `isLogEnabled(DebugType type, LogSeverity logSeverity): boolean`
- `log(String str): void`
- `log(DebugType type, String str): void`
- `nativeLog(String logType, String logSeverity, String logTxt): void`
- `printLogLevels(): void`
- `setDefaultLogSeverity(): void`
- `setLogEnabled(DebugType type, boolean bEnabled): void`
- `setLogEnabledFromCommandLine(String token): void`
- `updateSelectedProfile(DebugType debugType, LogSeverity logSeverity): void`
- `updateSelectedProfileAll(LogSeverity logSeverity): void`
- `writeConfigFile(): void`

### DebugOptions

`zombie.debug.DebugOptions`, class.

Methods, called as `obj:name(...)`:

- `addChild(IDebugOption newChild): void`
- `getBoolean(String name): boolean`
- `getChildren(): Iterable<IDebugOption>`
- `getCombinedName(String childName): String`
- `getName(): String`
- `getOptionByIndex(int index): BooleanDebugOption`
- `getOptionByName(String name): BooleanDebugOption`
- `getOptionCount(): int`
- `getParent(): IDebugOptionGroup`
- `getSlowMotionMultiplier(): SlowMotionMultiplier`
- `init(): void`
- `load(): void`
- `newDebugOnlyOption(String name, boolean defaultValue): BooleanDebugOption` from `IDebugOptionGroup`
- `newOption(String name, boolean defaultValue): BooleanDebugOption` from `IDebugOptionGroup`
- `newOptionGroup(E newGroup): E` from `IDebugOptionGroup`
- `onChildAdded(IDebugOption newOption): void`
- `onDescendantAdded(IDebugOption newOption): void`
- `onFullPathChanged(): void`
- `removeChild(IDebugOption child): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setParent(IDebugOptionGroup parent): void`

Static functions, called as `DebugOptions.name(...)`:

- `testThreadCrash(int idx): void`

Constructors: `DebugOptions.new()`.

Static fields (a copy of the value taken when the class is exposed): `VERSION: int`, `instance: DebugOptions`.

### DebugType

`zombie.debug.DebugType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `debugOnceln(Object formatNoParams): void`
- `debugOnceln(String format, Object... params): void`
- `debugln(Object formatNoParams): void`
- `debugln(String format, Object... params): void`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `error(Object formatNoParams): void`
- `error(String format, Object... params): void`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getFormatter(): IDebugLogFormatter`
- `getLogSeverity(): LogSeverity`
- `getLogStream(): DebugLogStream`
- `hashCode(): int` from `Enum`
- `isEnabled(): boolean`
- `isEnabled(LogSeverity logSeverity): boolean`
- `isName(String rhs): boolean`
- `name(): String` from `Enum`
- `noise(Object formatNoParams): void`
- `noise(String format, Object... params): void`
- `ordinal(): int` from `Enum`
- `print(boolean b): void`
- `print(char c): void`
- `print(double d): void`
- `print(float f): void`
- `print(int i): void`
- `print(Object obj): void`
- `print(String s): void`
- `print(long l): void`
- `printException(Throwable ex, String message, LogSeverity logSeverity): void`
- `printException(Throwable ex, LogSeverity logSeverity): void`
- `printException(Throwable ex, LogSeverity logSeverity, String messageFormat, Object... params): void`
- `printStackTrace(): void`
- `printStackTrace(String message): void`
- `printStackTrace(LogSeverity severity, int depth, String messageFormat, Object... params): void`
- `printf(String format, Object... args): PrintStream`
- `println(): void`
- `println(boolean x): void`
- `println(char x): void`
- `println(char[] x): void`
- `println(double x): void`
- `println(float x): void`
- `println(int x): void`
- `println(Object x): void`
- `println(String x): void`
- `println(String format, Object... params): void`
- `println(long x): void`
- `routedWrite(int backTraceOffset, LogSeverity logSeverity, String logText): void`
- `setLogSeverity(LogSeverity newSeverity): void`
- `toString(): String` from `Enum`
- `trace(Object formatNoParams): void`
- `trace(String format, Object... params): void`
- `warn(Object formatNoParams): void`
- `warn(String format, Object... params): void`
- `warnOnce(Object formatNoParams): void`
- `warnOnce(String format, Object... params): void`
- `write(LogSeverity logSeverity, String logText): void`

Static functions, called as `DebugType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): DebugType`
- `values(): DebugType[]`

Enum values (read as `DebugType.VALUE`): `Action`, `ActionSystem`, `ActionSystemEvents`, `Animal`, `Animation`, `AnimationDetailed`, `AnimationLayers`, `AnimationRecorder`, `Asset`, `Ballistics`, `Basement`, `BodyDamage`, `CharacterTrait`, `Checksum`, `ClientCommand`, `Clothing`, `Combat`, `Context`, `CraftLogic`, `Damage`, `Death`, `DetailedInfo`, `Discord`, `Energy`, `Entity`, `ExitDebug`, `FaceLocationFix`, `FallDamage`, `FileIO`, `Fireplace`, `Fluid`, `Foraging`, `GameOption`, `General`, `Grapple`, `ISUI`, `ISUIStackTrace`, `ImGui`, `Input`, `IsoRegion`, `ItemPicker`, `Lightning`, `LoadAnimation`, `Lua`, `LuaObject`, `MapLoading`, `Mod`, `ModelManager`, `Moveable`, `Multiplayer`, `Network`, `NetworkFileDebug`, `Objects`, `PZBullet`, `Packet`, `Physics`, `Radio`, `Ragdoll`, `Recipe`, `Saving`, `Script`, `Shader`, `Sound`, `Sprite`, `Statistic`, `Translation`, `UnitTest`, `Vehicle`, `VehicleClientCommand`, `VehicleHit`, `Voice`, `WorldGen`, `Xml`, `ZNet`, `Zombie`, `Zone`.

Static fields (a copy of the value taken when the class is exposed): `Default: DebugType`.

### LogSeverity

`zombie.debug.LogSeverity`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `isLogEnabled(LogSeverity logSeverity): boolean`
- `isName(String str): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `LogSeverity.name(...)`:

- `getValueList(): ArrayList<LogSeverity>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): LogSeverity`
- `values(): LogSeverity[]`

Enum values (read as `LogSeverity.VALUE`): `Debug`, `Error`, `General`, `Noise`, `Off`, `Trace`, `Warning`.

Static fields (a copy of the value taken when the class is exposed): `All: LogSeverity`.

### ObjectDebuggerLua

`zombie.debug.objects.ObjectDebuggerLua`, class.

Static functions, called as `ObjectDebuggerLua.name(...)`:

- `AllocList(): ArrayList<String>`
- `GetLines(Object o, ArrayList<String> list): void`
- `GetLines(Object o, ArrayList<String> list, int inheritanceDepth): void`
- `GetLines(Object o, ArrayList<String> list, int inheritanceDepth, int memberDepth): void`
- `Log(Object o): void`
- `Log(Object o, int inheritanceDepth): void`
- `Log(Object o, int inheritanceDepth, int memberDepth): void`
- `ReleaseList(ArrayList<String> list): void`

Constructors: `ObjectDebuggerLua.new()`.

### AnimationViewerState

`zombie.gameStates.AnimationViewerState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `getBoolean(String name): boolean`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `load(): void`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void`

Static functions, called as `AnimationViewerState.name(...)`:

- `checkInstance(): AnimationViewerState`

Constructors: `AnimationViewerState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: AnimationViewerState`.

### AnimationViewerState.BooleanDebugOption

`zombie.gameStates.AnimationViewerState.BooleanDebugOption`, class. Extends [BooleanConfigOption](#booleanconfigoption). Also has the methods of [BooleanConfigOption](#booleanconfigoption) (13), [ConfigOption](#configoption) (4), listed on their own entries.

Constructors: `AnimationViewerState.BooleanDebugOption.new(AnimationViewerState, String, boolean)`.

### AttachmentEditorState

`zombie.gameStates.AttachmentEditorState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void`

Static functions, called as `AttachmentEditorState.name(...)`:

- `checkInstance(): AttachmentEditorState`
- `readScript(String fileName): ArrayList<String>`
- `readScriptNew(ModelScript script): void`

Constructors: `AttachmentEditorState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: AttachmentEditorState`.

### ChooseGameInfo.Mod

`zombie.gameStates.ChooseGameInfo.Mod`, class.

Methods, called as `obj:name(...)`:

- `addPack(String name, int flags): void`
- `addTileDef(String name, int fileNumber): void`
- `getAuthor(): String`
- `getCategory(): String`
- `getCommonDir(): String`
- `getDescription(): String`
- `getDir(): String`
- `getIcon(): String`
- `getId(): String`
- `getIncompatible(): ArrayList<String>`
- `getLoadAfter(): ArrayList<String>`
- `getLoadBefore(): ArrayList<String>`
- `getModVersion(): String`
- `getName(): String`
- `getPacks(): ArrayList<ChooseGameInfo.PackFile>`
- `getPoster(int index): String`
- `getPosterCount(): int`
- `getRequire(): ArrayList<String>`
- `getSource(): String`
- `getTexture(): Texture`
- `getTileDefs(): ArrayList<ChooseGameInfo.TileDef>`
- `getUrl(): String`
- `getVersionDir(): String`
- `getVersionMax(): GameVersion`
- `getVersionMin(): GameVersion`
- `getWorkshopID(): String`
- `isAvailable(): boolean`
- `isAvailableSelf(): boolean`
- `setAuthor(String author): void`
- `setAvailable(boolean available): void`
- `setCategory(String name): void`
- `setDescription(String desc): void`
- `setIcon(String name): void`
- `setId(String id): void`
- `setIncompatible(ArrayList<String> incompatible): void`
- `setLoadAfter(ArrayList<String> loadAfter): void`
- `setLoadBefore(ArrayList<String> loadBefore): void`
- `setModVersion(String version): void`
- `setName(String name): void`
- `setRequire(ArrayList<String> require): void`
- `setTexture(Texture tex): void`
- `setUrl(String url): void`

Constructors: `ChooseGameInfo.Mod.new(String dir)`.

### DebugChunkState

`zombie.gameStates.DebugChunkState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `drawObjectAtCursor(): void`
- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `fromLua2(String func, Object arg0, Object arg1): Object`
- `getBoolean(String name): boolean`
- `getObjectAtCursorScale(): float`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `lineClearCached(IsoCell cell, int x1, int y1, int z1, int x0, int y0, int z0, boolean bIgnoreDoors): LosUtil.TestResults`
- `load(): void`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `renderScene(): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `updateScene(): GameStateMachine.StateAction`
- `yield(): void`

Static functions, called as `DebugChunkState.name(...)`:

- `checkInstance(): DebugChunkState`

Constructors: `DebugChunkState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: DebugChunkState`.

### DebugChunkState.BooleanDebugOption

`zombie.gameStates.DebugChunkState.BooleanDebugOption`, class. Extends [BooleanConfigOption](#booleanconfigoption). Also has the methods of [BooleanConfigOption](#booleanconfigoption) (13), [ConfigOption](#configoption) (4), listed on their own entries.

Constructors: `DebugChunkState.BooleanDebugOption.new(DebugChunkState, String, boolean)`.

### DebugGlobalObjectState

`zombie.gameStates.DebugGlobalObjectState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `fromLua2(String func, Object arg0, Object arg1): Object`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `renderScene(): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `updateScene(): GameStateMachine.StateAction`
- `yield(): void`

Constructors: `DebugGlobalObjectState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: DebugGlobalObjectState`.

### GameLoadingState

`zombie.gameStates.GameLoadingState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `redirectState(): GameState`
- `reenter(): void` from `GameState`
- `render(): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void` from `GameState`

Static functions, called as `GameLoadingState.name(...)`:

- `Done(): void`
- `SendDone(): void`

Constructors: `GameLoadingState.new()`.

Static fields (a copy of the value taken when the class is exposed): `QUICK_TIP_MAX_TIMER: int`, `convertingFileCount: int`, `convertingFileMax: int`, `convertingWorld: boolean`, `gameLoadingString: String`, `loader: Thread`, `playerWrongIP: boolean`, `worldVersionError: boolean`.

### LoadingQueueState

`zombie.gameStates.LoadingQueueState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void` from `GameState`
- `redirectState(): GameState`
- `reenter(): void` from `GameState`
- `render(): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void` from `GameState`

Static functions, called as `LoadingQueueState.name(...)`:

- `onConnectionImmediate(): void`
- `onPlaceInQueue(int place, HashMap<String, Object> serverInformation): void`

Constructors: `LoadingQueueState.new()`.

### MainScreenState

`zombie.gameStates.MainScreenState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `ShouldShowLogo(): boolean`
- `enter(): void`
- `exit(): void`
- `redirectState(): GameState` from `GameState`
- `reenter(): void` from `GameState`
- `render(): void`
- `renderBackground(): void`
- `setConnectToServerState(ConnectToServerState state): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void` from `GameState`

Static functions, called as `MainScreenState.name(...)`:

- `DrawTexture(Texture tex, int x, int y, int width, int height, float alpha): void`
- `DrawTexture(Texture tex, int x, int y, int width, int height, Color col): void`
- `getInstance(): MainScreenState`
- `loadIcons(): GLFWImage.Buffer`
- `preloadBackgroundTextures(): void`

Constructors: `MainScreenState.new()`.

Static fields (a copy of the value taken when the class is exposed): `VERSION: String`, `ambient: Audio`, `instance: MainScreenState`, `totalScale: float`.

### SeamEditorState

`zombie.gameStates.SeamEditorState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `getBoolean(String name): boolean`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `load(): void`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void`

Static functions, called as `SeamEditorState.name(...)`:

- `checkInstance(): SeamEditorState`

Constructors: `SeamEditorState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: SeamEditorState`.

### SeamEditorState.BooleanDebugOption

`zombie.gameStates.SeamEditorState.BooleanDebugOption`, class. Extends [BooleanConfigOption](#booleanconfigoption). Also has the methods of [BooleanConfigOption](#booleanconfigoption) (13), [ConfigOption](#configoption) (4), listed on their own entries.

Constructors: `SeamEditorState.BooleanDebugOption.new(SeamEditorState, String, boolean)`.

### SpriteModelEditorState

`zombie.gameStates.SpriteModelEditorState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `fromLua2(String func, Object arg0, Object arg1): Object`
- `fromLua3(String func, Object arg0, Object arg1, Object arg2): Object`
- `fromLua4(String func, Object arg0, Object arg1, Object arg2, Object arg3): Object`
- `fromLua5(String func, Object arg0, Object arg1, Object arg2, Object arg3, Object arg4): Object`
- `getBoolean(String name): boolean`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `load(): void`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void`

Static functions, called as `SpriteModelEditorState.name(...)`:

- `checkInstance(): SpriteModelEditorState`

Constructors: `SpriteModelEditorState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: SpriteModelEditorState`.

### SpriteModelEditorState.BooleanDebugOption

`zombie.gameStates.SpriteModelEditorState.BooleanDebugOption`, class. Extends [BooleanConfigOption](#booleanconfigoption). Also has the methods of [BooleanConfigOption](#booleanconfigoption) (13), [ConfigOption](#configoption) (4), listed on their own entries.

Constructors: `SpriteModelEditorState.BooleanDebugOption.new(SpriteModelEditorState, String, boolean)`.

### TermsOfServiceState

`zombie.gameStates.TermsOfServiceState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `redirectState(): GameState` from `GameState`
- `reenter(): void` from `GameState`
- `render(): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void` from `GameState`

Constructors: `TermsOfServiceState.new()`.

### TileGeometryState

`zombie.gameStates.TileGeometryState`, class. Extends `GameState`.

Methods, called as `obj:name(...)`:

- `enter(): void`
- `exit(): void`
- `fromLua0(String func): Object`
- `fromLua1(String func, Object arg0): Object`
- `fromLua2(String func, Object arg0, Object arg1): Object`
- `getBoolean(String name): boolean`
- `getOptionByIndex(int index): ConfigOption`
- `getOptionByName(String name): ConfigOption`
- `getOptionCount(): int`
- `load(): void`
- `redirectState(): GameState` from `GameState`
- `reenter(): void`
- `render(): void`
- `save(): void`
- `setBoolean(String name, boolean value): void`
- `setTable(KahluaTable table): void`
- `update(): GameStateMachine.StateAction`
- `yield(): void`

Static functions, called as `TileGeometryState.name(...)`:

- `checkInstance(): TileGeometryState`

Constructors: `TileGeometryState.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: TileGeometryState`.

### TileGeometryState.BooleanDebugOption

`zombie.gameStates.TileGeometryState.BooleanDebugOption`, class. Extends [BooleanConfigOption](#booleanconfigoption). Also has the methods of [BooleanConfigOption](#booleanconfigoption) (13), [ConfigOption](#configoption) (4), listed on their own entries.

Constructors: `TileGeometryState.BooleanDebugOption.new(TileGeometryState, String, boolean)`.

### GameTime

`zombie.GameTime`, class.

Methods, called as `obj:name(...)`:

- `Lerp(float start, float end, float delta): float`
- `RemoveZombiesIndiscriminate(int i): void`
- `TimeLerp(float startVal, float endVal, float startTime, float endTime): float`
- `clampHours(double hours): double`
- `clampHours(float hours): float`
- `daysInMonth(int year, int month): int`
- `getAmbient(): float`
- `getAmbientMax(): float`
- `getAmbientMin(): float`
- `getCalender(): PZCalendar`
- `getDawn(): int`
- `getDay(): int`
- `getDayPlusOne(): int`
- `getDaysSurvived(): int`
- `getDeathString(IsoPlayer playerObj): String`
- `getDeltaMinutesPerDay(): float`
- `getDusk(): int`
- `getGameModeText(): String`
- `getGameWorldSecondsSinceLastUpdate(): float`
- `getHelicopterDay(): int`
- `getHelicopterDay1(): int`
- `getHelicopterEndHour(): int`
- `getHelicopterStartHour(): int`
- `getHour(): int`
- `getHoursSurvived(): double`
- `getInvMultiplier(): float`
- `getLastTimeOfDay(): float`
- `getMaxZombieCount(): float`
- `getMaxZombieCountStart(): float`
- `getMinZombieCount(): float`
- `getMinZombieCountStart(): float`
- `getMinutes(): int`
- `getMinutesPerDay(): float`
- `getMinutesStamp(): long`
- `getModData(): KahluaTable`
- `getMonth(): int`
- `getMultipliedSecondsSinceLastUpdate(): float`
- `getMultiplier(): float`
- `getMultiplierFromTimeDelta(float timeDelta): float`
- `getMultiplierInMenu(): float`
- `getNight(): float`
- `getNightMax(): float`
- `getNightMin(): float`
- `getNightTint(): float`
- `getNightsSurvived(): int`
- `getPhysicsSecondsSinceLastUpdate(): float`
- `getRealworldSecondsSinceLastUpdate(): float`
- `getServerMultiplier(): float`
- `getSkyLightLevel(): int`
- `getStartDay(): int`
- `getStartMonth(): int`
- `getStartTimeOfDay(): float`
- `getStartYear(): int`
- `getThirtyFPSMultiplier(): float`
- `getThirtyFPSMultiplierInMenu(): float`
- `getThunderStorm(): boolean`
- `getTimeDelta(): float`
- `getTimeDeltaFromMultiplier(float multiplier): float`
- `getTimeDeltaInMenu(): float`
- `getTimeOfDay(): float`
- `getTimeSurvived(IsoPlayer playerObj): String`
- `getTrueMultiplier(): float`
- `getUnmoddedMultiplier(): float`
- `getViewDist(): float`
- `getViewDistMax(): float`
- `getViewDistMin(): float`
- `getWorldAgeDaysSinceBegin(): double`
- `getWorldAgeHours(): double`
- `getYear(): int`
- `getZombieKilledText(IsoPlayer playerObj): String`
- `init(): void`
- `isDay(): boolean`
- `isEndlessDay(): boolean`
- `isEndlessNight(): boolean`
- `isNight(): boolean`
- `isRainingToday(): boolean`
- `isThunderDay(): boolean`
- `isZombieActivityPhase(): boolean`
- `isZombieInactivityPhase(): boolean`
- `load(): void`
- `load(DataInputStream input): void`
- `load(ByteBufferReader input): void`
- `minHours(double hours): double`
- `minHours(float hours): float`
- `save(): void`
- `save(DataOutputStream output): void`
- `save(ByteBuffer output): void`
- `saveToBufferMap(SaveBufferMap bufferMap): void`
- `saveToPacket(ByteBufferWriter bb): void`
- `setAmbient(float ambient): void`
- `setAmbientMax(float ambientMax): void`
- `setAmbientMin(float ambientMin): void`
- `setCalender(PZCalendar calendar): void`
- `setDawn(int dawn): void`
- `setDay(int day): void`
- `setDusk(int dusk): void`
- `setHelicopterDay(int day): void`
- `setHelicopterEndHour(int hour): void`
- `setHelicopterStartHour(int hour): void`
- `setHoursSurvived(double hoursSurvived): void`
- `setLastTimeOfDay(float lastTimeOfDay): void`
- `setMaxZombieCount(float maxZombieCount): void`
- `setMaxZombieCountStart(float maxZombieCountStart): void`
- `setMinZombieCount(float minZombieCount): void`
- `setMinZombieCountStart(float minZombieCountStart): void`
- `setMinutesPerDay(float minutesPerDay): void`
- `setMonth(int month): void`
- `setMoon(float moon): void`
- `setMultiplier(float multiplier): void`
- `setNightMax(float max): void`
- `setNightMin(float min): void`
- `setNightsSurvived(int nightsSurvived): void`
- `setStartDay(int startDay): void`
- `setStartMonth(int startMonth): void`
- `setStartTimeOfDay(float startTimeOfDay): void`
- `setStartYear(int startYear): void`
- `setTargetZombies(int targetZombies): void`
- `setThunderDay(boolean thunderDay): void`
- `setTimeOfDay(float timeOfDay): void`
- `setViewDistMax(float viewDistMax): void`
- `setViewDistMin(float viewDistMin): void`
- `setYear(int year): void`
- `update(boolean bSleeping): void`
- `updateCalendar(int year, int month, int dayOfMonth, int hourOfDay, int minute): void`

Static functions, called as `GameTime.name(...)`:

- `checkHours(double hours, double worldAgeHours): double`
- `checkHours(float hours, float worldAgeHours): float`
- `clampHours(double hours, double worldAgeHours): double`
- `clampHours(float hours, float worldAgeHours): float`
- `getInstance(): GameTime`
- `getServerTime(): long`
- `getServerTimeMills(): long`
- `getServerTimeShiftIsSet(): boolean`
- `getSlomoMultiplier(): float`
- `isGamePaused(): boolean`
- `minHours(double hours, double worldAgeHours): double`
- `minHours(float hours, float worldAgeHours): float`
- `setInstance(GameTime aInstance): void`
- `setServerTimeShift(long tshift): void`
- `syncServerTime(long timeClientSend, long timeServer, long timeClientReceive): void`

Constructors: `GameTime.new()`.

Static fields (a copy of the value taken when the class is exposed): `MILLISECONDS_PER_SECOND: int`, `MULTIPLIER: float`, `MinutesPerHour: float`, `NANOSECONDS_PER_SECOND: int`, `SECONDS_PER_MINUTE: int`, `START_OF_NEW_DAY: float`, `SYNC_CLOCK_MS: long`, `SecondsPerHour: float`, `THIRTY_FPS_SCALE: float`, `instance: GameTime`.

### GameWindow

`zombie.GameWindow`, class.

Static functions, called as `GameWindow.name(...)`:

- `DoLoadingText(String text): void`
- `InitDisplay(): void`
- `InitGameThread(): void`
- `LoadTexturePack(String pack, int flags): void`
- `LoadTexturePack(String pack, int flags, String modID): void`
- `ReadString(DataInputStream input): String`
- `ReadString(ByteBuffer input): String`
- `ReadUUID(ByteBuffer input): UUID`
- `WriteString(DataOutputStream output, String str): void`
- `WriteString(ByteBuffer output, String str): void`
- `WriteUUID(ByteBuffer output, UUID uuid): void`
- `doEpilepsyWarningText(): void`
- `doRenderEvent(boolean b): void`
- `getCoopServerHome(): String`
- `getEncodedBytesUTF(String str): ByteBuffer`
- `getUpdateTime(): long`
- `initFonts(): void`
- `isIngameState(): boolean`
- `readInt(DataInputStream in): int`
- `readLong(DataInputStream in): long`
- `render(): void`
- `save(boolean bDoChars): void`
- `setTexturePackLookup(): void`
- `uncaughtException(Thread thread, Throwable e): void`

Constructors: `GameWindow.new()`.

Static fields (a copy of the value taken when the class is exposed): `DEBUG_SAVE: boolean`, `GameInput: Input`, `activatedJoyPad: JoypadManager.Joypad`, `assetManagers: AssetManagers`, `averageFPS: float`, `closeRequested: boolean`, `drawReloadingLua: boolean`, `fileSystem: FileSystem`, `gameThread: Thread`, `gameThreadExited: boolean`, `kickReason: String`, `lastP: String`, `loadedAsClient: boolean`, `luaDebuggerKeyDown: boolean`, `okToSaveOnExit: boolean`, `serverDisconnected: boolean`, `states: GameStateMachine`, `texturePackTextures: FileSystem.TexturePackTextures`, `texturePacks: ArrayList<GameWindow.TexturePack>`, `version: String`.

### LuaEventManager

`zombie.Lua.LuaEventManager`, class.

Methods, called as `obj:name(...)`:

- `call(LuaCallFrame callFrame, int nArguments): int`

Static functions, called as `LuaEventManager.name(...)`:

- `AddEvent(String name): Event`
- `Reset(): void`
- `ResetCallbacks(): void`
- `RunQueuedEvents(): void`
- `clear(): void`
- `getEvents(ArrayList<Event> eventList, HashMap<String, Event> eventMap): void`
- `register(Platform platform, KahluaTable environment): void`
- `reroute(Prototype prototype, LuaClosure luaClosure): void`
- `setEvents(ArrayList<Event> eventList, HashMap<String, Event> eventMap): void`
- `triggerEvent(String event): void`
- `triggerEvent(String event, Object param1): void`
- `triggerEvent(String event, Object param1, Object param2): void`
- `triggerEvent(String event, Object param1, Object param2, Object param3): void`
- `triggerEvent(String event, Object param1, Object param2, Object param3, Object param4): void`
- `triggerEvent(String event, Object param1, Object param2, Object param3, Object param4, Object param5): void`
- `triggerEvent(String event, Object param1, Object param2, Object param3, Object param4, Object param5, Object param6): void`
- `triggerEvent(String event, Object param1, Object param2, Object param3, Object param4, Object param5, Object param6, Object param7): void`
- `triggerEvent(String event, Object param1, Object param2, Object param3, Object param4, Object param5, Object param6, Object param7, Object param8): void`
- `triggerEventGarbage(String event, Object param1): void`
- `triggerEventGarbage(String event, Object param1, Object param2): void`
- `triggerEventGarbage(String event, Object param1, Object param2, Object param3): void`
- `triggerEventGarbage(String event, Object param1, Object param2, Object param3, Object param4): void`
- `triggerEventUnique(String event, Object param1): void`

Constructors: `LuaEventManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `OnTickCallbacks: ArrayList<LuaClosure>`.

### LuaManager.GlobalObject.LuaFileWriter

`zombie.Lua.LuaManager.GlobalObject.LuaFileWriter`, class.

Methods, called as `obj:name(...)`:

- `close(): void`
- `write(String str): void`
- `writeln(String str): void`

Constructors: `LuaManager.GlobalObject.LuaFileWriter.new(PrintWriter writer)`.
