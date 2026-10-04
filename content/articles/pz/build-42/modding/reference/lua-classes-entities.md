---
slug: lua-classes-entities
title: 'Lua Classes: Entities, components and crafting (Build 42.21)'
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
excerpt: 'The exposed entities, components and crafting classes of Build 42.21: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Entities, components and crafting

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The Build 42 entity system: components, crafting, building, fluids and energy as the code models them.

This page holds 124 classes and 1,930 methods, from the packages `zombie.entity`, `zombie.entity.components.attributes`, `zombie.entity.components.build`, `zombie.entity.components.contextmenuconfig`, `zombie.entity.components.crafting`, `zombie.entity.components.crafting.recipe`, `zombie.entity.components.fluids`, `zombie.entity.components.lua`, `zombie.entity.components.parts`, `zombie.entity.components.resources`, `zombie.entity.components.script`, `zombie.entity.components.signals`, `zombie.entity.components.sounds`, `zombie.entity.components.spriteconfig`, `zombie.entity.components.test`, `zombie.entity.components.ui`, `zombie.entity.debug`, `zombie.entity.energy`, `zombie.entity.events`, `zombie.entity.meta`, `zombie.entity.util`, `zombie.entity.util.assoc`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### Component

`zombie.entity.Component`, abstract class.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI): void`
- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `dumpContentsInSquare(): void`
- `getComponent(ComponentType type): T`
- `getComponentType(): ComponentType`
- `getGameEntity(): GameEntity`
- `getOwner(): GameEntity`
- `getRenderLastPriority(): int`
- `getUsingPlayer(): IsoPlayer`
- `isAddedToEngine(): boolean`
- `isNoContainerOrEmpty(): boolean`
- `isQualifiesForMetaStorage(): boolean`
- `isRenderLast(): boolean`
- `isRunningInMeta(): boolean`
- `isUsingPlayer(IsoPlayer target): boolean`
- `isValid(): boolean`
- `isValidOwnerType(GameEntityType type): boolean`
- `sendServerPacketTo(IsoPlayer player, EntityPacketData data): void`
- `toString(): String`

### Attribute

`zombie.entity.components.attributes.Attribute`, abstract class.

Static functions, called as `Attribute.name(...)`:

- `GetAllTypes(): ArrayList<AttributeType>`
- `TypeFromId(short value): AttributeType`
- `TypeFromName(String name): AttributeType`
- `init(): void`

Constructors: `Attribute.new()`.

Static fields (a copy of the value taken when the class is exposed): `HeadCondition: AttributeType.Int`, `HeadConditionMax: AttributeType.Int`, `OriginX: AttributeType.Int`, `OriginY: AttributeType.Int`, `OriginZ: AttributeType.Int`, `Quality: AttributeType.Int`, `Sharpness: AttributeType.Float`, `TestBool: AttributeType.Bool`, `TestCategories: AttributeType.EnumSet<TestEnum>`, `TestCondition: AttributeType.Float`, `TestItemType: AttributeType.Enum<TestEnum>`, `TestQuality: AttributeType.Float`, `TestString: AttributeType.String`, `TestString2: AttributeType.String`, `TestTags: AttributeType.EnumStringSet<TestEnum>`, `TestUses: AttributeType.Int`, `TimesHeadRepaired: AttributeType.Int`.

### AttributeContainer

`zombie.entity.components.attributes.AttributeContainer`, class. Extends [Component](#component). Also has the methods of [Component](#component) (17), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `add(AttributeType type): boolean`
- `clear(): void`
- `contains(AttributeType type): boolean`
- `copy(): AttributeContainer`
- `forEach(BiConsumer<AttributeType, AttributeInstance> action): void`
- `get(AttributeType.Enum<E> type): E`
- `get(AttributeType.Enum<E> type, E defaultTo): E`
- `get(AttributeType.EnumSet<E> type): EnumSet<E>`
- `get(AttributeType.EnumStringSet<E> type): EnumStringObj<E>`
- `get(AttributeType.Bool type): boolean`
- `get(AttributeType.Bool type, boolean defaultTo): boolean`
- `get(AttributeType.Byte type): byte`
- `get(AttributeType.Byte type, byte defaultTo): byte`
- `get(AttributeType.Double type): double`
- `get(AttributeType.Double type, double defaultTo): double`
- `get(AttributeType.Float type): float`
- `get(AttributeType.Float type, float defaultTo): float`
- `get(AttributeType.Int type): int`
- `get(AttributeType.Int type, int defaultTo): int`
- `get(AttributeType.String type): String`
- `get(AttributeType.String type, String defaultTo): String`
- `get(AttributeType.Long type): long`
- `get(AttributeType.Long type, long defaultTo): long`
- `get(AttributeType.Short type): short`
- `get(AttributeType.Short type, short defaultTo): short`
- `getAttribute(int index): AttributeInstance`
- `getAttribute(AttributeType type): AttributeInstance`
- `getFloatValue(AttributeType.Numeric type): float`
- `getFloatValue(AttributeType.Numeric type, float defaultTo): float`
- `getKey(int index): AttributeType`
- `isIdenticalTo(AttributeContainer other): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `put(AttributeType.Enum<E> type, E value): void`
- `put(AttributeType.EnumSet<E> type, EnumSet<E> value): void`
- `put(AttributeType.EnumStringSet<E> type, EnumStringObj<E> value): void`
- `put(AttributeType.Bool type, boolean value): void`
- `put(AttributeType.Byte type, byte value): void`
- `put(AttributeType.Double type, double value): void`
- `put(AttributeType.Float type, float value): void`
- `put(AttributeType.Int type, int value): void`
- `put(AttributeType.Long type, long value): void`
- `put(AttributeType.Short type, short value): void`
- `put(AttributeType.String type, String value): void`
- `putFloatValue(AttributeType.Numeric type, float value): void`
- `putFromScript(AttributeType type, String scriptVal): boolean`
- `remove(AttributeType type): void`
- `save(ByteBuffer output): void`
- `set(AttributeType.Enum<E> type, E value): void`
- `set(AttributeType.EnumSet<E> type, EnumSet<E> value): void`
- `set(AttributeType.EnumStringSet<E> type, EnumStringObj<E> value): void`
- `set(AttributeType.Bool type, boolean value): void`
- `set(AttributeType.Byte type, byte value): void`
- `set(AttributeType.Double type, double value): void`
- `set(AttributeType.Float type, float value): void`
- `set(AttributeType.Int type, int value): void`
- `set(AttributeType.Long type, long value): void`
- `set(AttributeType.Short type, short value): void`
- `set(AttributeType.String type, String value): void`
- `setFloatValue(AttributeType.Numeric type, float value): void`
- `size(): int`
- `toString(): String`

Static functions, called as `AttributeContainer.name(...)`:

- `Copy(AttributeContainer source, AttributeContainer target): void`
- `Merge(AttributeContainer source, AttributeContainer target): void`

Static fields (a copy of the value taken when the class is exposed): `STORAGE_SIZE: short`.

### AttributeInstance

`zombie.entity.components.attributes.AttributeInstance`, abstract class.

Methods, called as `obj:name(...)`:

- `copy(): C`
- `equalTo(C var1): boolean`
- `getDisplayAsBarUnit(): float`
- `getFloatValue(): float`
- `getIntValue(): int`
- `getNameUI(): String`
- `getType(): T`
- `getValueType(): AttributeValueType`
- `isDisplayAsBar(): boolean`
- `isHiddenUI(): boolean`
- `isReadOnly(): boolean`
- `isRequiresValidation(): boolean`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`
- `toString(): String`

### AttributeInstance.Bool

`zombie.entity.components.attributes.AttributeInstance.Bool`, class. Extends [AttributeInstance](#attributeinstance). Also has the methods of [AttributeInstance](#attributeinstance) (11), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.Bool`
- `equalTo(AttributeInstance.Bool): boolean`
- `getValue(): boolean`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(boolean value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.Bool.new()`.

### AttributeInstance.Byte

`zombie.entity.components.attributes.AttributeInstance.Byte`, class. Extends [AttributeInstance.Numeric](#attributeinstancenumeric). Also has the methods of [AttributeInstance](#attributeinstance) (6), [AttributeInstance.Numeric](#attributeinstancenumeric) (5), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.Byte`
- `equalTo(AttributeInstance.Byte): boolean`
- `floatValue(): float`
- `fromFloat(float f): void`
- `getValue(): byte`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(byte value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.Byte.new()`.

### AttributeInstance.Double

`zombie.entity.components.attributes.AttributeInstance.Double`, class. Extends [AttributeInstance.Numeric](#attributeinstancenumeric). Also has the methods of [AttributeInstance](#attributeinstance) (6), [AttributeInstance.Numeric](#attributeinstancenumeric) (5), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.Double`
- `equalTo(AttributeInstance.Double): boolean`
- `floatValue(): float`
- `fromFloat(float f): void`
- `getValue(): double`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(double value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.Double.new()`.

### AttributeInstance.Enum

`zombie.entity.components.attributes.AttributeInstance.Enum`, class. Extends [AttributeInstance](#attributeinstance). Also has the methods of [AttributeInstance](#attributeinstance) (11), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.Enum<E>`
- `equalTo(AttributeInstance.Enum<E>): boolean`
- `getValue(): E`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(E value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.Enum.new()`.

### AttributeInstance.EnumSet

`zombie.entity.components.attributes.AttributeInstance.EnumSet`, class. Extends [AttributeInstance](#attributeinstance). Also has the methods of [AttributeInstance](#attributeinstance) (11), listed on their own entries.

Methods, called as `obj:name(...)`:

- `addValueFromString(String val): void`
- `clear(): void`
- `copy(): AttributeInstance.EnumSet<E>`
- `equalTo(AttributeInstance.EnumSet<E>): boolean`
- `getValue(): EnumSet<E>`
- `load(ByteBuffer): void`
- `removeValueFromString(String val): boolean`
- `save(ByteBuffer output): void`
- `setValue(EnumSet<E> value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.EnumSet.new()`.

### AttributeInstance.EnumStringSet

`zombie.entity.components.attributes.AttributeInstance.EnumStringSet`, class. Extends [AttributeInstance](#attributeinstance). Also has the methods of [AttributeInstance](#attributeinstance) (11), listed on their own entries.

Methods, called as `obj:name(...)`:

- `addEnumValueFromString(String val): void`
- `addStringValue(String val): void`
- `clear(): void`
- `copy(): AttributeInstance.EnumStringSet<E>`
- `equalTo(AttributeInstance.EnumStringSet<E>): boolean`
- `getValue(): EnumStringObj<E>`
- `load(ByteBuffer): void`
- `removeEnumValueFromString(String val): boolean`
- `removeStringValue(String val): boolean`
- `save(ByteBuffer output): void`
- `setValue(EnumStringObj<E> value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.EnumStringSet.new()`.

### AttributeInstance.Float

`zombie.entity.components.attributes.AttributeInstance.Float`, class. Extends [AttributeInstance.Numeric](#attributeinstancenumeric). Also has the methods of [AttributeInstance](#attributeinstance) (6), [AttributeInstance.Numeric](#attributeinstancenumeric) (5), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.Float`
- `equalTo(AttributeInstance.Float): boolean`
- `floatValue(): float`
- `fromFloat(float f): void`
- `getValue(): float`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(float value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.Float.new()`.

### AttributeInstance.Int

`zombie.entity.components.attributes.AttributeInstance.Int`, class. Extends [AttributeInstance.Numeric](#attributeinstancenumeric). Also has the methods of [AttributeInstance](#attributeinstance) (6), [AttributeInstance.Numeric](#attributeinstancenumeric) (5), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.Int`
- `equalTo(AttributeInstance.Int): boolean`
- `floatValue(): float`
- `fromFloat(float f): void`
- `getValue(): int`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(int value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.Int.new()`.

### AttributeInstance.Long

`zombie.entity.components.attributes.AttributeInstance.Long`, class. Extends [AttributeInstance.Numeric](#attributeinstancenumeric). Also has the methods of [AttributeInstance](#attributeinstance) (6), [AttributeInstance.Numeric](#attributeinstancenumeric) (5), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.Long`
- `equalTo(AttributeInstance.Long): boolean`
- `floatValue(): float`
- `fromFloat(float f): void`
- `getValue(): long`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(long value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.Long.new()`.

### AttributeInstance.Numeric

`zombie.entity.components.attributes.AttributeInstance.Numeric`, abstract class. Extends [AttributeInstance](#attributeinstance). Also has the methods of [AttributeInstance](#attributeinstance) (12), listed on their own entries.

Methods, called as `obj:name(...)`:

- `floatValue(): float`
- `fromFloat(float f): void`
- `getDisplayAsBarUnit(): float`
- `getFloatValue(): float`
- `getIntValue(): int`
- `isDisplayAsBar(): boolean`
- `isRequiresValidation(): boolean`

Constructors: `AttributeInstance.Numeric.new()`.

### AttributeInstance.Short

`zombie.entity.components.attributes.AttributeInstance.Short`, class. Extends [AttributeInstance.Numeric](#attributeinstancenumeric). Also has the methods of [AttributeInstance](#attributeinstance) (6), [AttributeInstance.Numeric](#attributeinstancenumeric) (5), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.Short`
- `equalTo(AttributeInstance.Short): boolean`
- `floatValue(): float`
- `fromFloat(float f): void`
- `getValue(): short`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(short value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.Short.new()`.

### AttributeInstance.String

`zombie.entity.components.attributes.AttributeInstance.String`, class. Extends [AttributeInstance](#attributeinstance). Also has the methods of [AttributeInstance](#attributeinstance) (11), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copy(): AttributeInstance.String`
- `equalTo(AttributeInstance.String): boolean`
- `getValue(): String`
- `load(ByteBuffer): void`
- `save(ByteBuffer output): void`
- `setValue(String value): void`
- `setValueFromScriptString(String val): boolean`
- `stringValue(): String`

Constructors: `AttributeInstance.String.new()`.

### AttributeType

`zombie.entity.components.attributes.AttributeType`, abstract class.

Methods, called as `obj:name(...)`:

- `getName(): String`
- `getNameUI(): String`
- `getTranslateKey(): String`
- `getValueType(): AttributeValueType`
- `id(): short`
- `isDecimal(): boolean`
- `isHiddenUI(): boolean`
- `isNumeric(): boolean`
- `isReadOnly(): boolean`
- `toString(): String`

### AttributeType.Bool

`zombie.entity.components.attributes.AttributeType.Bool`, class. Extends [AttributeType](#attributetype). Also has the methods of [AttributeType](#attributetype) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getInitialValue(): boolean`
- `getValueType(): AttributeValueType`

### AttributeType.Byte

`zombie.entity.components.attributes.AttributeType.Byte`, class. Extends [AttributeType.Numeric](#attributetypenumeric). Also has the methods of [AttributeType](#attributetype) (9), [AttributeType.Numeric](#attributetypenumeric) (2), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getMax(): Byte`
- `getMin(): Byte`
- `getValueType(): AttributeValueType`
- `validate(Byte): Byte`

### AttributeType.Double

`zombie.entity.components.attributes.AttributeType.Double`, class. Extends [AttributeType.Numeric](#attributetypenumeric). Also has the methods of [AttributeType](#attributetype) (9), [AttributeType.Numeric](#attributetypenumeric) (2), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getMax(): Double`
- `getMin(): Double`
- `getValueType(): AttributeValueType`
- `validate(Double): Double`

### AttributeType.Enum

`zombie.entity.components.attributes.AttributeType.Enum`, class. Extends [AttributeType](#attributetype). Also has the methods of [AttributeType](#attributetype) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `enumValueFromByteID(byte id): E`
- `enumValueFromString(String s): E`
- `getInitialValue(): E`
- `getValueType(): AttributeValueType`

### AttributeType.EnumSet

`zombie.entity.components.attributes.AttributeType.EnumSet`, class. Extends [AttributeType](#attributetype). Also has the methods of [AttributeType](#attributetype) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `enumValueFromByteID(byte id): E`
- `enumValueFromString(String s): E`
- `getInitialValue(): EnumSet<E>`
- `getValueType(): AttributeValueType`

### AttributeType.EnumStringSet

`zombie.entity.components.attributes.AttributeType.EnumStringSet`, class. Extends [AttributeType](#attributetype). Also has the methods of [AttributeType](#attributetype) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `enumValueFromByteID(byte id): E`
- `enumValueFromString(String s): E`
- `getInitialValue(): EnumStringObj<E>`
- `getValueType(): AttributeValueType`

### AttributeType.Float

`zombie.entity.components.attributes.AttributeType.Float`, class. Extends [AttributeType.Numeric](#attributetypenumeric). Also has the methods of [AttributeType](#attributetype) (9), [AttributeType.Numeric](#attributetypenumeric) (3), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getMax(): Float`
- `getMin(): Float`
- `validate(Float): Float`

### AttributeType.Int

`zombie.entity.components.attributes.AttributeType.Int`, class. Extends [AttributeType.Numeric](#attributetypenumeric). Also has the methods of [AttributeType](#attributetype) (9), [AttributeType.Numeric](#attributetypenumeric) (2), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getMax(): Integer`
- `getMin(): Integer`
- `getValueType(): AttributeValueType`
- `validate(Integer): Integer`

### AttributeType.Long

`zombie.entity.components.attributes.AttributeType.Long`, class. Extends [AttributeType.Numeric](#attributetypenumeric). Also has the methods of [AttributeType](#attributetype) (9), [AttributeType.Numeric](#attributetypenumeric) (2), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getMax(): Long`
- `getMin(): Long`
- `getValueType(): AttributeValueType`
- `validate(Long): Long`

### AttributeType.Numeric

`zombie.entity.components.attributes.AttributeType.Numeric`, abstract class. Extends [AttributeType](#attributetype). Also has the methods of [AttributeType](#attributetype) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getInitialValue(): T`
- `getMax(): T`
- `getMin(): T`
- `getValueType(): AttributeValueType`
- `hasBounds(): boolean`
- `validate(T var1): T`

### AttributeType.Short

`zombie.entity.components.attributes.AttributeType.Short`, class. Extends [AttributeType.Numeric](#attributetypenumeric). Also has the methods of [AttributeType](#attributetype) (9), [AttributeType.Numeric](#attributetypenumeric) (2), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getMax(): Short`
- `getMin(): Short`
- `getValueType(): AttributeValueType`
- `validate(Short): Short`

### AttributeType.String

`zombie.entity.components.attributes.AttributeType.String`, class. Extends [AttributeType](#attributetype). Also has the methods of [AttributeType](#attributetype) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getInitialValue(): String`
- `getValueType(): AttributeValueType`

### AttributeUtil

`zombie.entity.components.attributes.AttributeUtil`, class.

Static functions, called as `AttributeUtil.name(...)`:

- `allocDoubleList(): ArrayList<Double>`
- `allocItemList(): ArrayList<InventoryItem>`
- `convertAttribute(InventoryItem item, AttributeType attribute, AttributeType target): float`
- `convertAttributeToRange(InventoryItem item, AttributeType attribute, float rangeMin, float rangeMax): float`
- `convertAttributeToUnit(InventoryItem item, AttributeType attribute): float`
- `enumValueFromScriptString(Class<E> enumClass, String s): E`
- `getAttributeAverage(ArrayList<InventoryItem> items, AttributeType attribute): float`
- `getItemsFromList(String itemString, ArrayList<InventoryItem> sources, ArrayList<InventoryItem> outputlist): ArrayList<InventoryItem>`
- `isEnumString(String s): boolean`
- `releaseDoubleList(ArrayList<Double> list): void`
- `releaseItemList(ArrayList<InventoryItem> list): void`
- `tryEnumValueFromScriptString(Class<E> enumClass, String s): E`

Constructors: `AttributeUtil.new()`.

Static fields (a copy of the value taken when the class is exposed): `enum_prefix: String`.

### AttributeValueType

`zombie.entity.components.attributes.AttributeValueType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getByteIndex(): int`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `AttributeValueType.name(...)`:

- `IsDecimal(AttributeValueType valueType): boolean`
- `IsNumeric(AttributeValueType valueType): boolean`
- `fromByteIndex(int value): AttributeValueType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): AttributeValueType`
- `valueOfIgnoreCase(String s): AttributeValueType`
- `values(): AttributeValueType[]`

Enum values (read as `AttributeValueType.VALUE`): `Boolean`, `Byte`, `Double`, `Enum`, `EnumSet`, `EnumStringSet`, `Float`, `Int`, `Long`, `Short`, `String`.

### EnumStringObj

`zombie.entity.components.attributes.EnumStringObj`, class.

Methods, called as `obj:name(...)`:

- `add(E e): void`
- `add(String): void`
- `addAll(boolean clearAll, EnumStringObj<E> c): void`
- `addAll(EnumStringObj<E> c): void`
- `clear(): void`
- `contains(E o): boolean`
- `contains(String o): boolean`
- `copy(): EnumStringObj<E>`
- `equals(Object o): boolean`
- `getSortedNames(ArrayList<String> list): void`
- `isEmpty(): boolean`
- `remove(E e): boolean`
- `remove(String): boolean`
- `removeAllEnums(): void`
- `removeAllStrings(): void`
- `size(): int`
- `sizeEnums(): int`
- `sizeStrings(): int`
- `toString(): String`

### BuildLogic

`zombie.entity.components.build.BuildLogic`, class. Extends [BaseCraftingLogic](#basecraftinglogic). Also has the methods of [BaseCraftingLogic](#basecraftinglogic) (60), listed on their own entries.

Methods, called as `obj:name(...)`:

- `areAllInputItemsSatisfied(): boolean`
- `getAllBuildableRecipes(): ArrayList<CraftRecipe>`
- `getAllConsumedItems(): ArrayList<InventoryItem>`
- `getLastSelectedRecipe(): CraftRecipe`
- `getRecipe(): CraftRecipe`
- `getRecipeData(): CraftRecipeData`
- `getRecipeDataInProgress(): CraftRecipeData`
- `getRecipeList(): CraftRecipeListNodeCollection`
- `getRecipeSortMode(): String`
- `getSelectedBuildObject(): SpriteConfigManager.ObjectInfo`
- `getSelectedRecipeStyle(): String`
- `getWallCoveringParams(): KahluaTable`
- `isCraftActionInProgress(): boolean`
- `isInputSatisfied(InputScript inputScript): boolean`
- `performCurrentRecipe(): boolean`
- `setLastManualInputMode(boolean b): void`
- `setLastSelectedRecipe(CraftRecipe recipe): void`
- `setRecipe(CraftRecipe recipe): void`
- `setRecipeSortMode(String sortMode): void`
- `setSelectedRecipeStyle(String style): void`
- `startCraftAction(KahluaTableImpl actionTable): void`
- `stopCraftAction(): void`
- `updateFloorContainer(): void`

Constructors: `BuildLogic.new(IsoGameCharacter player, CraftBench craftBench, IsoObject isoObject)`.

### ContextMenuConfig

`zombie.entity.components.contextmenuconfig.ContextMenuConfig`, class. Extends [Component](#component). Also has the methods of [Component](#component) (18), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getEntries(): ArrayList<ContextMenuConfigScript.EntryScript>`
- `isQualifiesForMetaStorage(): boolean`

### BaseCraftingLogic

`zombie.entity.components.crafting.BaseCraftingLogic`, abstract class.

Methods, called as `obj:name(...)`:

- `addEventListener(String event, Object function): void`
- `addEventListener(String event, Object function, Object targetTable): void`
- `areAllInputItemsSatisfied(): boolean`
- `autoPopulateInputs(): void`
- `cachedCanPerformCurrentRecipe(): boolean`
- `canPerformCurrentRecipe(): boolean`
- `clearManualInputs(): void`
- `clearManualInputsFor(CraftRecipeData.InputScriptData input): void`
- `clearTargetVariableInputRatio(): void`
- `copyManualInputsFrom(BaseCraftingLogic logic): void`
- `filterRecipeList(String filter, String categoryFilter): void`
- `filterRecipeList(String filter, String categoryFilter, boolean force): void`
- `filterRecipeList(String filter, String categoryFilter, boolean force, IsoPlayer player): void`
- `getAllViableInputInventoryItems(): List<InventoryItem>`
- `getAllViableInputResources(): List<Resource>`
- `getCachedRecipeInfo(CraftRecipe recipe): BaseCraftingLogic.CachedRecipeInfo`
- `getCategoryList(): ArrayList<String>`
- `getContainers(): ArrayList<ItemContainer>`
- `getInputCount(InputScript inputScript): int`
- `getInputItemNodes(): ArrayList<InputItemNode>`
- `getInputItemNodesForInput(InputScript input): ArrayList<InputItemNode>`
- `getInputUses(InputScript inputScript): float`
- `getManualInputsFor(InputScript inputScript, ArrayList<InventoryItem> list): ArrayList<InventoryItem>`
- `getManualSelectInputScriptFilter(): InputScript`
- `getModelHandOne(): String`
- `getModelHandTwo(): String`
- `getMulticraftConsumedItems(): ArrayList<InventoryItem>`
- `getMulticraftConsumedItemsFor(InputScript inputScript, ArrayList<InventoryItem> list): ArrayList<InventoryItem>`
- `getMulticraftConsumedResources(): ArrayList<Resource>`
- `getPossibleCraftCount(boolean forceRecache): int`
- `getRecipe(): CraftRecipe`
- `getSatisfiedInputFluids(InputScript inputScript): List<Fluid>`
- `getSatisfiedInputInventoryItems(InputScript inputScript): List<InventoryItem>`
- `getSatisfiedInputItems(InputScript inputScript): List<Item>`
- `getVariableInputRatio(): float`
- `hasRequiredWorkstation(): boolean`
- `isCharacterInRangeOfWorkbench(): boolean`
- `isContainersAccessible(List<ItemContainer> containers): boolean`
- `isInputSatisfied(InputScript inputScript): boolean`
- `isManualSelectInputs(): boolean`
- `offerInputItem(InventoryItem item): boolean`
- `populateInputs(IsoGameCharacter player, List<InventoryItem> inputItems, List<Resource> resources, boolean clearExisting): void`
- `refresh(): void`
- `removeInputItem(InventoryItem item): boolean`
- `setContainers(ArrayList<ItemContainer> containersToUse): boolean`
- `setManualInputsFor(InputScript inputScript, ArrayList<InventoryItem> list): boolean`
- `setManualSelectInputScriptFilter(InputScript script): void`
- `setManualSelectInputs(boolean b): void`
- `setRecipe(CraftRecipe recipe): void`
- `setRecipes(List<CraftRecipe> recipes): void`
- `setShowManualSelectInputs(boolean b): void`
- `setTargetVariableInputRatio(float target): void`
- `shouldShowManualSelectInputs(): boolean`
- `sortRecipeList(): void`
- `updateFloorContainer(ArrayList<ItemContainer> containers): boolean`
- `updateManualInputAllowedItemTypes(): void`

Static functions, called as `BaseCraftingLogic.name(...)`:

- `callLua(String func, Object params): void`
- `callLua(String func, Object params, Object params2): void`
- `callLua(String func, Object params, Object params2, Object params3): void`
- `callLuaBool(String func, Object params): boolean`
- `callLuaObject(String func, Object params): KahluaTable`
- `filterAndSortRecipeList(String filterString, String categoryFilterString, CraftRecipeListNodeCollection listToPopulate, List<CraftRecipe> sourceList, IsoPlayer player, Comparator<CraftRecipe> sortComparator): CraftRecipeListNodeCollection`
- `getFavouriteModDataString(String recipe): String`
- `getFavouriteModDataString(CraftRecipe recipe): String`

Constructors: `BaseCraftingLogic.new(IsoGameCharacter player, CraftBench craftBench)`.

### BaseCraftingLogic.CachedRecipeInfo

`zombie.entity.components.crafting.BaseCraftingLogic.CachedRecipeInfo`, class.

Methods, called as `obj:name(...)`:

- `getRecipe(): CraftRecipe`
- `isAvailable(): boolean`
- `isCanPerform(): boolean`
- `isValid(): boolean`
- `overrideCanPerform(boolean value): void`

Constructors: `BaseCraftingLogic.CachedRecipeInfo.new()`.

### CraftBench

`zombie.entity.components.crafting.CraftBench`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getEnergyInputChannels(): EnumBitStore<ResourceChannel>`
- `getFluidInputChannels(): EnumBitStore<ResourceChannel>`
- `getRecipeTagQuery(): String`
- `getRecipes(): List<CraftRecipe>`
- `getResources(): ArrayList<Resource>`
- `setRecipeTagQuery(String recipeTagQuery): void`

### CraftLogic

`zombie.entity.components.crafting.CraftLogic`, class. Extends [Component](#component). Also has the methods of [Component](#component) (16), listed on their own entries.

Methods, called as `obj:name(...)`:

- `canStart(IsoPlayer player): boolean`
- `canStartWithInventoryItems(IsoPlayer player, List<InventoryItem> selectedInventoryItems): boolean`
- `debugCanStart(IsoPlayer player): CraftRecipeMonitor`
- `doProgressTooltip(ObjectTooltip.Layout layout, Resource resource, CraftRecipeData craftRecipeData): void`
- `dumpContentsInSquare(): void`
- `finaliseRecipe(CraftRecipeData craftRecipeData): void`
- `getActionAnimOverride(): String`
- `getActiveCraftCount(): int`
- `getCurrentRecipe(): CraftRecipe`
- `getFreeOutputSlotCount(): int`
- `getInputResources(): List<Resource>`
- `getInputsGroupName(): String`
- `getOutputResources(): List<Resource>`
- `getOutputsGroupName(): String`
- `getPossibleRecipe(): CraftRecipe`
- `getProgress(CraftRecipeData craftRecipeData): double`
- `getRecipeTagQuery(): String`
- `getRecipes(ArrayList<CraftRecipe> list): ArrayList<CraftRecipe>`
- `getRecipes(): List<CraftRecipe>`
- `getRequestingPlayer(): IsoPlayer`
- `getStartMode(): StartMode`
- `getStatusIconsForInputItem(InventoryItem item, CraftRecipeData craftRecipeData): ArrayList<Texture>`
- `isDoAutomaticCraftCheck(): boolean`
- `isNoContainerOrEmpty(): boolean`
- `isRunning(): boolean`
- `isStartRequested(): boolean`
- `isStopRequested(): boolean`
- `isValid(): boolean`
- `onStart(): void`
- `onStop(CraftRecipeData craftRecipeData, boolean isCancelled): void`
- `onUpdate(CraftRecipeData craftRecipeData): void`
- `returnConsumedItemsToResourcesOrSquare(CraftRecipeData craftRecipeData): void`
- `sendCraftLogicSync(): void`
- `sendStartRequest(IsoPlayer player): void`
- `sendStopRequest(IsoPlayer player): void`
- `setRecipe(CraftRecipe recipe): void`
- `setRecipeTagQuery(String recipeTagQuery): void`
- `start(IsoPlayer player): void`
- `stop(IsoPlayer player): void`
- `stop(IsoPlayer player, boolean force): void`
- `willInputsAccommodate(List<InventoryItem> inventoryItems): boolean`

### CraftLogicUILogic

`zombie.entity.components.crafting.CraftLogicUILogic`, class.

Methods, called as `obj:name(...)`:

- `addEventListener(String event, Object function): void`
- `addEventListener(String event, Object function, Object targetTable): void`
- `areAllInputItemsSatisfied(): boolean`
- `cachedCanPerformCurrentRecipe(): boolean`
- `cachedCanStart(IsoPlayer player): boolean`
- `clearManualInputsFor(CraftRecipeData.InputScriptData input): void`
- `doPreviewSlotTooltip(KahluaTable itemSlot, ObjectTooltip tooltipUI): void`
- `doProgressSlotTooltip(KahluaTable itemSlot, ObjectTooltip tooltipUI): void`
- `filterRecipeList(String filter, String categoryFilter): void`
- `filterRecipeList(String filter, String categoryFilter, boolean force): void`
- `filterRecipeList(String filter, String categoryFilter, boolean force, IsoPlayer player): void`
- `getContainers(): ArrayList<ItemContainer>`
- `getCraftLogic(): CraftLogic`
- `getEntity(): GameEntity`
- `getEntityIcon(): Texture`
- `getInputItemNodes(): ArrayList<InputItemNode>`
- `getInputItemNodesForInput(InputScript input): ArrayList<InputItemNode>`
- `getInventoryItemsToTransfer(): KahluaTable`
- `getItemsInProgress(): KahluaTable`
- `getManualSelectInputScriptFilter(): InputScript`
- `getManualSelectItemSlot(): KahluaTable`
- `getOutputItems(): KahluaTable`
- `getPossibleCraftCount(boolean forceRecache): int`
- `getRecipe(): CraftRecipe`
- `getRecipeData(): CraftRecipeData`
- `getRecipeList(): CraftRecipeListNodeCollection`
- `getRecipeSortMode(): String`
- `getResourceItemNodes(): ArrayList<InputItemNode>`
- `getSelectedRecipeStyle(): String`
- `getStatusIconsForItemInProgress(InventoryItem item, CraftRecipeData craftRecipeData): ArrayList<Texture>`
- `offerInputItem(InventoryItem inventoryItem): void`
- `onResourceSlotContentsChanged(): void`
- `removeInputItem(InventoryItem inventoryItem): void`
- `setContainers(ArrayList<ItemContainer> containersToUse): void`
- `setCraftQuantity(int quantity): void`
- `setManualSelectInputScriptFilter(InputScript script, KahluaTable itemSlot): void`
- `setRecipe(CraftRecipe recipe): void`
- `setRecipeSortMode(String sortMode): void`
- `setSelectedRecipeStyle(String style): void`
- `setShowManualSelectInputs(boolean b): void`
- `shouldShowManualSelectInputs(): boolean`
- `sortRecipeList(): void`

Constructors: `CraftLogicUILogic.new(IsoPlayer player, GameEntity entity, CraftLogic component)`.

### CraftMode

`zombie.entity.components.crafting.CraftMode`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CraftMode.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CraftMode`
- `values(): CraftMode[]`

Enum values (read as `CraftMode.VALUE`): `Automation`, `Handcraft`.

### CraftRecipeComponent

`zombie.entity.components.crafting.CraftRecipeComponent`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

### CraftRecipeMonitor

`zombie.entity.components.crafting.CraftRecipeMonitor`, class.

Methods, called as `obj:name(...)`:

- `GetLines(): ArrayList<String>`
- `canLog(): boolean`
- `close(): void`
- `getRecipe(): CraftRecipe`
- `log(String s): void`
- `logCraftLogic(CraftLogic logic): void`
- `logDryingLogic(DryingLogic logic): void`
- `logFurnaceLogic(FurnaceLogic logic): void`
- `logInputScript(InputScript input): void`
- `logList(String tag, ArrayList<T> list): void`
- `logMashingLogic(MashingLogic logic): void`
- `logOutputScript(OutputScript output): void`
- `logRecipe(CraftRecipe recipe, boolean doInputsOutputs): void`
- `logResources(List<Resource> inputs, List<Resource> outputs): void`
- `logResourcesList(String tag, List<Resource> resources): void`
- `open(): void`
- `reset(): void`
- `seal(): CraftRecipeMonitor`
- `setPrintToConsole(boolean b): void`
- `setRecipe(CraftRecipe recipe): void`
- `success(String s): void`
- `warn(String s): void`

Static functions, called as `CraftRecipeMonitor.name(...)`:

- `Create(): CraftRecipeMonitor`

### CraftUtil

`zombie.entity.components.crafting.CraftUtil`, class.

Static functions, called as `CraftUtil.name(...)`:

- `AllocResourceList(): ArrayList<Resource>`
- `ReleaseResourceList(ArrayList<Resource> list): void`
- `canItemsStack(InventoryItem item, InventoryItem other): boolean`
- `canItemsStack(InventoryItem item, InventoryItem other, boolean nullReturn): boolean`
- `canItemsStack(Item item, Item other, boolean nullReturn): boolean`
- `canPerformRecipe(CraftRecipe recipe, CraftRecipeData craftTestData, List<Resource> inputs, List<Resource> outputs): boolean`
- `canPerformRecipe(CraftRecipe recipe, CraftRecipeData craftTestData, List<Resource> inputs, List<Resource> outputs, CraftRecipeMonitor monitor): boolean`
- `canResourceFitItem(Resource resource, InventoryItem item): boolean`
- `canResourceFitItem(Resource resource, InventoryItem item, int count): boolean`
- `canResourceFitItem(Resource resource, InventoryItem item, int count, Resource ignoreResource, HashSet<Resource> ignoreSet): boolean`
- `canResourceFitItem(Resource resource, Item item): boolean`
- `canResourceFitItem(Resource resource, Item item, int count): boolean`
- `canResourceFitItem(Resource resource, Item item, int count, Resource ignoreResource, HashSet<Resource> ignoreSet): boolean`
- `canStart(CraftRecipeData craftTestData, List<CraftRecipe> recipes, List<Resource> inputs, List<Resource> outputs): boolean`
- `canStart(CraftRecipeData craftTestData, List<CraftRecipe> recipes, List<Resource> inputs, List<Resource> outputs, CraftRecipeMonitor monitor): boolean`
- `debugCanStart(IsoPlayer player, CraftRecipeData craftTestData, List<CraftRecipe> recipes, List<Resource> inputs, List<Resource> outputs, CraftRecipeMonitor monitor): CraftRecipeMonitor`
- `findResourceOrEmpty(ResourceIO resourceIO, List<Resource> resources, Fluid fluid, float amount, Resource ignoreResource, HashSet<Resource> ignoreSet): Resource`
- `findResourceOrEmpty(ResourceIO resourceIO, List<Resource> resources, Energy energy, float amount, Resource ignoreResource, HashSet<Resource> ignoreSet): Resource`
- `findResourceOrEmpty(ResourceIO resourceIO, List<Resource> outputResources, InventoryItem item, int count, Resource ignoreResource, HashSet<Resource> ignoreSet): Resource`
- `findResourceOrEmpty(ResourceIO resourceIO, List<Resource> resources, Item item, int count, Resource ignoreResource, HashSet<Resource> ignoreSet): Resource`
- `getEntityTemperature(GameEntity entity): float`
- `getPossibleRecipe(CraftRecipeData craftTestData, List<CraftRecipe> recipes, List<Resource> inputs, List<Resource> outputs): CraftRecipe`
- `getPossibleRecipe(CraftRecipeData craftTestData, List<CraftRecipe> recipes, List<Resource> inputs, List<Resource> outputs, CraftRecipeMonitor monitor): CraftRecipe`

Constructors: `CraftUtil.new()`.

### DryingCraftLogic

`zombie.entity.components.crafting.DryingCraftLogic`, class. Extends [CraftLogic](#craftlogic). Also has the methods of [Component](#component) (16), [CraftLogic](#craftlogic) (37), listed on their own entries.

Methods, called as `obj:name(...)`:

- `doProgressTooltip(ObjectTooltip.Layout layout, Resource resource, CraftRecipeData craftRecipeData): void`
- `getStatusIconsForInputItem(InventoryItem item, CraftRecipeData craftRecipeData): ArrayList<Texture>`
- `onStart(): void`
- `onUpdate(CraftRecipeData craftRecipeData): void`

### FluidMatchMode

`zombie.entity.components.crafting.FluidMatchMode`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `FluidMatchMode.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): FluidMatchMode`
- `values(): FluidMatchMode[]`

Enum values (read as `FluidMatchMode.VALUE`): `Anything`, `Exact`, `Mixture`, `Primary`.

### FurnaceLogic

`zombie.entity.components.crafting.FurnaceLogic`, class. Extends [Component](#component). Also has the methods of [Component](#component) (18), listed on their own entries.

Methods, called as `obj:name(...)`:

- `canStart(IsoPlayer player): boolean`
- `debugCanStart(IsoPlayer player): CraftRecipeMonitor`
- `getCurrentRecipe(): CraftRecipe`
- `getElapsedTime(): int`
- `getFuelInputResources(): List<Resource>`
- `getFuelInputsGroupName(): String`
- `getFuelOutputResources(): List<Resource>`
- `getFuelOutputsGroupName(): String`
- `getFuelRecipeTagQuery(): String`
- `getFuelRecipes(ArrayList<CraftRecipe> list): ArrayList<CraftRecipe>`
- `getFurnaceInputResources(): List<Resource>`
- `getFurnaceInputsGroupName(): String`
- `getFurnaceOutputResources(): List<Resource>`
- `getFurnaceOutputsGroupName(): String`
- `getFurnaceRecipeTagQuery(): String`
- `getFurnaceRecipes(ArrayList<CraftRecipe> list): ArrayList<CraftRecipe>`
- `getInputSlotResource(int index): ResourceItem`
- `getOutputSlotResource(int index): ResourceItem`
- `getPossibleRecipe(): CraftRecipe`
- `getProgress(): double`
- `getRequestingPlayer(): IsoPlayer`
- `getSlot(int index): FurnaceLogic.FurnaceSlot`
- `getSlotSize(): int`
- `getStartMode(): StartMode`
- `isDoAutomaticCraftCheck(): boolean`
- `isFinished(): boolean`
- `isRunning(): boolean`
- `isStartRequested(): boolean`
- `isStopRequested(): boolean`
- `isValid(): boolean`
- `sendStartRequest(IsoPlayer player): void`
- `sendStopRequest(IsoPlayer player): void`
- `setFuelRecipeTagQuery(String recipeTagQuery): void`
- `setFurnaceRecipeTagQuery(String recipeTagQuery): void`
- `start(IsoPlayer player): void`
- `stop(IsoPlayer player): void`
- `stop(IsoPlayer player, boolean force): void`

### InputFlag

`zombie.entity.components.crafting.InputFlag`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `InputFlag.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): InputFlag`
- `values(): InputFlag[]`

Enum values (read as `InputFlag.VALUE`): `AllowDestroyedItem`, `AllowFavorite`, `AllowFrozenItem`, `AllowRottenItem`, `AutomationOnly`, `CanBeDoneFromFloor`, `CopyClothing`, `DontInheritCondition`, `DontPutBack`, `DontRecordInput`, `DontReplace`, `EquipSecondary`, `FakeOutput`, `HandcraftOnly`, `HasNoUses`, `HasOneUse`, `InheritAmmunition`, `InheritColor`, `InheritCondition`, `InheritCooked`, `InheritEquipped`, `InheritFavorite`, `InheritFood`, `InheritFoodAge`, `InheritFreezingTime`, `InheritHeadCondition`, `InheritModelVariation`, `InheritName`, `InheritSharpness`, `InheritUses`, `InheritUsesAndEmpty`, `InheritWeight`, `IsBlunt`, `IsCookedFoodItem`, `IsDamaged`, `IsEmpty`, `IsEmptyContainer`, `IsExclusive`, `IsFull`, `IsHeadPart`, `IsNotDull`, `IsNotSealed`, `IsNotWorn`, `IsSealed`, `IsSharpenable`, `IsUncookedFoodItem`, `IsUndamaged`, `IsWholeFoodItem`, `IsWorn`, `ItemCount`, `ItemIsEnergy`, `ItemIsFluid`, `ItemIsUses`, `MayDegrade`, `MayDegradeHeavy`, `MayDegradeLight`, `MayDegradeVeryLight`, `NoBrokenItems`, `NotEmpty`, `NotFull`, `Prop1`, `Prop2`, `RecordInput`, `ResearchInput`, `SetActivated`, `SharpnessCheck`, `ToolLeft`, `ToolRight`, `Unseal`.

### ItemApplyMode

`zombie.entity.components.crafting.ItemApplyMode`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ItemApplyMode.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ItemApplyMode`
- `values(): ItemApplyMode[]`

Enum values (read as `ItemApplyMode.VALUE`): `Destroy`, `Keep`, `Normal`.

### MashingLogic

`zombie.entity.components.crafting.MashingLogic`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

Methods, called as `obj:name(...)`:

- `canStart(IsoPlayer player): boolean`
- `debugCanStart(IsoPlayer player): CraftRecipeMonitor`
- `getBarrelConsumedAmount(): float`
- `getCurrentRecipe(): CraftRecipe`
- `getElapsedTime(): double`
- `getFluidBarrel(): ResourceFluid`
- `getInputResources(List<Resource> list): List<Resource>`
- `getInputsGroupName(): String`
- `getLastWorldAge(): double`
- `getPossibleRecipe(): CraftRecipe`
- `getProgress(): double`
- `getRecipeTagQuery(): String`
- `getRecipes(List<CraftRecipe> list): List<CraftRecipe>`
- `getRequestingPlayer(): IsoPlayer`
- `getResourceFluidID(): String`
- `isFinished(): boolean`
- `isRunning(): boolean`
- `isStartRequested(): boolean`
- `isStopRequested(): boolean`
- `sendStartRequest(IsoPlayer player): void`
- `sendStopRequest(IsoPlayer player): void`
- `setElapsedTime(double time): void`
- `setLastWorldAge(double time): void`
- `setRecipeTagQuery(String recipeTagQuery): void`
- `start(IsoPlayer player): void`
- `stop(IsoPlayer player): void`
- `stop(IsoPlayer player, boolean force): void`

### OutputFlag

`zombie.entity.components.crafting.OutputFlag`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `OutputFlag.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): OutputFlag`
- `values(): OutputFlag[]`

Enum values (read as `OutputFlag.VALUE`): `AlwaysFill`, `AutomationOnly`, `DontInheritCondition`, `EquipSecondary`, `ForceEmpty`, `HandcraftOnly`, `HasNoUses`, `HasOneUse`, `IsBlunt`, `IsEmpty`, `RespectCapacity`, `SetActivated`.

### CraftRecipeData

`zombie.entity.components.crafting.recipe.CraftRecipeData`, class.

Methods, called as `obj:name(...)`:

- `OnTestItem(InventoryItem inventoryItem): boolean`
- `addOverfilledResource(InputScript input, HashMap<Resource, ArrayList<InventoryItem>> resources): void`
- `areAllInputItemsSatisfied(): boolean`
- `canConsumeInputs(List<Resource> inputResources): boolean`
- `canConsumeInputs(List<Resource> inputResources, List<InventoryItem> overrideInputItems, boolean forceTestAll, boolean clearAllViable): boolean`
- `canCreateOutputs(List<Resource> outputResources): boolean`
- `canCreateOutputs(List<Resource> outputResources, IsoGameCharacter character): boolean`
- `canOfferInputItem(InventoryItem inventoryItem): boolean`
- `canOfferInputItem(InventoryItem inventoryItem, boolean verbose): boolean`
- `canOfferInputItem(InputScript inputScript, InventoryItem item): boolean`
- `canOfferInputItem(InputScript inputScript, InventoryItem item, boolean verbose): boolean`
- `canPerform(IsoGameCharacter character, List<Resource> inputResources, List<InventoryItem> overrideInputItems, boolean forceTestAll, ArrayList<ItemContainer> containers): boolean`
- `clearManualInputs(): void`
- `clearManualInputs(CraftRecipeData.InputScriptData input): void`
- `clearTargetVariableInputRatio(): void`
- `consumeInputs(List<Resource> inputResources): boolean`
- `consumeOnTickInputs(List<Resource> inputResources): boolean`
- `containsInputItem(CraftRecipeData.InputScriptData data, InventoryItem inventoryItem): boolean`
- `containsInputItem(InventoryItem inventoryItem): boolean`
- `createOnTickOutputs(List<Resource> outputResources): boolean`
- `createOutputs(List<Resource> outputResources): boolean`
- `createOutputs(List<Resource> outputResources, IsoGameCharacter character): boolean`
- `createRecipeOutputs(boolean testOnly, List<Resource> outputResources, IsoGameCharacter character): boolean`
- `getAllConsumedItems(): ArrayList<InventoryItem>`
- `getAllConsumedItems(ArrayList<InventoryItem> list): ArrayList<InventoryItem>`
- `getAllConsumedItems(ArrayList<InventoryItem> list, boolean includeKeep): ArrayList<InventoryItem>`
- `getAllConsumedItems(ArrayList<InventoryItem> list, boolean includeKeep, boolean onlyRecorded): ArrayList<InventoryItem>`
- `getAllCreatedItems(): ArrayList<InventoryItem>`
- `getAllCreatedItems(ArrayList<InventoryItem> list): ArrayList<InventoryItem>`
- `getAllDestroyInputItems(): ArrayList<InventoryItem>`
- `getAllInputItems(): ArrayList<InventoryItem>`
- `getAllInputItemsWithFlag(String flag): ArrayList<InventoryItem>`
- `getAllInputItemsWithFlag(InputFlag flag): ArrayList<InventoryItem>`
- `getAllKeepInputItems(): ArrayList<InventoryItem>`
- `getAllKeepInputItems(ArrayList<InventoryItem> list): ArrayList<InventoryItem>`
- `getAllNotKeepInputItems(): ArrayList<InventoryItem>`
- `getAllPutBackInputItems(): ArrayList<InventoryItem>`
- `getAllRecordedConsumedItems(): ArrayList<InventoryItem>`
- `getAllRecordedConsumedItems(ArrayList<InventoryItem> list): ArrayList<InventoryItem>`
- `getAllViableItemsCount(): int`
- `getAllViableResourcesCount(): int`
- `getAppliedInputItemTypes(HashSet<String> appliedItemTypes): HashSet<String>`
- `getCalculatedVariableInputRatio(): float`
- `getCharacter(): IsoGameCharacter`
- `getDataForInputScript(InputScript script): CraftRecipeData.InputScriptData`
- `getEatPercentage(): int`
- `getElapsedTime(): double`
- `getFirstCreatedItem(): InventoryItem`
- `getFirstInputFluidWithFlag(String flag): FluidSample`
- `getFirstInputFluidWithFlag(InputFlag flag): FluidSample`
- `getFirstInputItemWithFlag(String flag): InventoryItem`
- `getFirstInputItemWithFlag(InputFlag flag): InventoryItem`
- `getFirstInputItemWithTag(ItemTag itemTag): InventoryItem`
- `getFirstManualInputFor(InputScript inputScript): InventoryItem`
- `getInputItems(Integer index): ArrayList<InventoryItem>`
- `getManualInputsFor(InputScript inputScript, ArrayList<InventoryItem> list): ArrayList<InventoryItem>`
- `getModData(): KahluaTable`
- `getModelHandOne(): String`
- `getModelHandTwo(): String`
- `getPossibleCraftCount(List<Resource> inputResources, List<InventoryItem> inputItems, List<Resource> consumedResources, List<InventoryItem> consumedItems, boolean limitItemsToAppliedItems): int`
- `getRecipe(): CraftRecipe`
- `getToOutputItems(): ItemDataList`
- `getVariableInputRatio(): float`
- `getViableItem(int index): InventoryItem`
- `getViableResource(int index): Resource`
- `isAllowInputItems(): boolean`
- `isAllowInputResources(): boolean`
- `isAllowOutputItems(): boolean`
- `isAllowOutputResources(): boolean`
- `isFinished(): boolean`
- `isVariableAmount(): boolean`
- `load(ByteBuffer input, int worldVersion, CraftRecipe recipe, boolean recipeInvalidated): boolean`
- `luaCallOnCreate(): void`
- `luaCallOnCreate(IsoGameCharacter character): void`
- `luaCallOnFailed(): void`
- `luaCallOnStart(): void`
- `luaCallOnStart(IsoGameCharacter character): void`
- `luaCallOnTest(): boolean`
- `luaCallOnUpdate(): void`
- `offerAndReplaceInputItem(CraftRecipeData.InputScriptData data, InventoryItem inventoryItem): boolean`
- `offerAndReplaceInputItem(InventoryItem inventoryItem): boolean`
- `offerInputItem(InputScript inputScript, InventoryItem item): boolean`
- `offerInputItem(InputScript inputScript, InventoryItem item, boolean verbose): boolean`
- `perform(IsoGameCharacter character, List<Resource> inputResources, List<InventoryItem> overrideInputItems, ArrayList<ItemContainer> containers): boolean`
- `populateInputs(IsoGameCharacter player, List<InventoryItem> inputItems, List<Resource> resources, boolean clearExisting): void`
- `processDestroyAndUsedItems(IsoGameCharacter character): void`
- `removeInputItem(InventoryItem): boolean`
- `reset(): void`
- `save(ByteBuffer output): void`
- `setCalculatedVariableInputRatio(float value): void`
- `setCharacter(IsoGameCharacter character): void`
- `setEatPercentage(int percentage): void`
- `setElapsedTime(double elapsedTime): void`
- `setManualInputsFor(InputScript inputScript, ArrayList<InventoryItem> list): boolean`
- `setMonitor(CraftRecipeMonitor monitor): void`
- `setRecipe(CraftRecipe recipe): void`
- `setTargetVariableInputRatio(float target): void`

Static functions, called as `CraftRecipeData.name(...)`:

- `Alloc(CraftMode craftMode, boolean allowInputResources, boolean allowInputItems, boolean allowOutputResources, boolean allowOutputItems): CraftRecipeData`
- `Release(CraftRecipeData data): void`

Constructors: `CraftRecipeData.new(CraftMode craftMode, boolean allowInputResources, boolean allowInputItems, boolean allowOutputResources, boolean allowOutputItems)`.

### CraftRecipeData.CacheData

`zombie.entity.components.crafting.recipe.CraftRecipeData.CacheData`, abstract class.

Methods, called as `obj:name(...)`:

- `addAppliedItemsToList(ArrayList<InventoryItem> items): void`
- `getAppliedItem(int index): InventoryItem`
- `getAppliedItemsCount(): int`
- `getFirstAppliedItem(): InventoryItem`
- `getMostRecentItem(): InventoryItem`
- `hasAppliedItem(InventoryItem item): boolean`
- `hasAppliedItemType(Item item): boolean`
- `isMoveToOutputs(): boolean`
- `setMoveToOutputs(boolean b): void`

Constructors: `CraftRecipeData.CacheData.new()`.

### CraftRecipeData.InputScriptData

`zombie.entity.components.crafting.recipe.CraftRecipeData.InputScriptData`, class. Extends [CraftRecipeData.CacheData](#craftrecipedatacachedata). Also has the methods of [CraftRecipeData.CacheData](#craftrecipedatacachedata) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `acceptsInputItem(InventoryItem inventoryItem): boolean`
- `addInputItem(InventoryItem inventoryItem): boolean`
- `getFirstInputItem(): InventoryItem`
- `getInputItemCount(): int`
- `getInputItemFluidUses(): float`
- `getInputItemUses(): int`
- `getInputScript(): InputScript`
- `getLastInputItem(): InventoryItem`
- `getManualInputItems(ArrayList<InventoryItem> list): void`
- `isCachedCanConsume(): boolean`
- `isDestroy(): boolean`
- `isInputItemsSatisfied(): boolean`
- `isInputItemsSatisifiedToMaximum(): boolean`
- `removeInputItem(InventoryItem): boolean`
- `verifyInputItems(ArrayList<InventoryItem> playerItems): void`

Constructors: `CraftRecipeData.InputScriptData.new()`.

### CraftRecipeData.OutputScriptData

`zombie.entity.components.crafting.recipe.CraftRecipeData.OutputScriptData`, class. Extends [CraftRecipeData.CacheData](#craftrecipedatacachedata). Also has the methods of [CraftRecipeData.CacheData](#craftrecipedatacachedata) (9), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getOutputScript(): OutputScript`

Constructors: `CraftRecipeData.OutputScriptData.new()`.

### CraftRecipeListNode

`zombie.entity.components.crafting.recipe.CraftRecipeListNode`, class.

Methods, called as `obj:name(...)`:

- `getChildren(): List<CraftRecipeListNode>`
- `getExpandedState(): CraftRecipeListNode.CraftRecipeListNodeExpandedState`
- `getGroup(): CraftRecipeGroup`
- `getIconTexture(): Texture`
- `getParent(): CraftRecipeListNode`
- `getRecipe(): CraftRecipe`
- `getTitle(): String`
- `getType(): CraftRecipeListNode.CraftRecipeListNodeType`
- `setExpandedState(CraftRecipeListNode.CraftRecipeListNodeExpandedState state): void`
- `toggleExpandedState(): void`

Static functions, called as `CraftRecipeListNode.name(...)`:

- `createGroupNode(CraftRecipeGroup group, String title, Texture iconTexture, CraftRecipeListNode.CraftRecipeListNodeExpandedState expandedState): CraftRecipeListNode`
- `createRecipeNode(CraftRecipe recipe, CraftRecipeListNode parent): CraftRecipeListNode`

Constructors: `CraftRecipeListNode.new()`.

### CraftRecipeListNode.CraftRecipeListNodeExpandedState

`zombie.entity.components.crafting.recipe.CraftRecipeListNode.CraftRecipeListNodeExpandedState`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CraftRecipeListNode.CraftRecipeListNodeExpandedState.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CraftRecipeListNode.CraftRecipeListNodeExpandedState`
- `values(): CraftRecipeListNode.CraftRecipeListNodeExpandedState[]`

Enum values (read as `CraftRecipeListNode.CraftRecipeListNodeExpandedState.VALUE`): `CLOSED`, `OPEN`, `PARTIAL`.

### CraftRecipeListNode.CraftRecipeListNodeType

`zombie.entity.components.crafting.recipe.CraftRecipeListNode.CraftRecipeListNodeType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `CraftRecipeListNode.CraftRecipeListNodeType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): CraftRecipeListNode.CraftRecipeListNodeType`
- `values(): CraftRecipeListNode.CraftRecipeListNodeType[]`

Enum values (read as `CraftRecipeListNode.CraftRecipeListNodeType.VALUE`): `GROUP`, `RECIPE`.

### CraftRecipeListNodeCollection

`zombie.entity.components.crafting.recipe.CraftRecipeListNodeCollection`, class.

Methods, called as `obj:name(...)`:

- `add(CraftRecipe recipe): void`
- `addAll(List<CraftRecipe> recipeList): void`
- `clear(): void`
- `contains(CraftRecipe recipe): boolean`
- `getAllRecipes(): List<CraftRecipe>`
- `getFirstRecipe(): CraftRecipe`
- `getNodes(): List<CraftRecipeListNode>`
- `isEmpty(): boolean`
- `removeIf(Predicate<? super CraftRecipe> filter): void`
- `setInitialExpandedStates(BaseCraftingLogic logic, boolean isBuildCheat): void`
- `sort(Comparator<? super CraftRecipe> comparator): void`

Constructors: `CraftRecipeListNodeCollection.new()`.

### CraftRecipeManager

`zombie.entity.components.crafting.recipe.CraftRecipeManager`, class.

Static functions, called as `CraftRecipeManager.name(...)`:

- `FormatAndRegisterRecipeTagsQuery(String tagQueryString): String`
- `Init(): void`
- `LogAllRecipesToFile(): void`
- `Reset(): void`
- `debugPrintTagManager(): void`
- `debugPrintTagManagerLines(): ArrayList<String>`
- `filterRecipeList(String filterString, List<CraftRecipe> listToPopulate): List<CraftRecipe>`
- `filterRecipeList(String filterString, List<CraftRecipe> listToPopulate, List<CraftRecipe> sourceList): List<CraftRecipe>`
- `getAllItemsFromContainers(ArrayList<ItemContainer> containers, ArrayList<InventoryItem> items): ArrayList<InventoryItem>`
- `getAllRecipeTags(): List<String>`
- `getAllValidInputScriptsForItem(CraftRecipe recipe, InventoryItem inventoryItem, IsoGameCharacter character): ArrayList<InputScript>`
- `getAllValidItemsForRecipe(CraftRecipe recipe, ArrayList<InventoryItem> sourceItems, ArrayList<InventoryItem> filteredItems, IsoGameCharacter character): ArrayList<InventoryItem>`
- `getAutoCraftCountItems(CraftRecipe recipe, ArrayList<InventoryItem> allItems): int`
- `getCraftDataForPlayer(IsoPlayer player): CraftRecipeData`
- `getRecipesForTag(String category): List<CraftRecipe>`
- `getTagGroups(): List<String>`
- `getUniqueRecipeItems(InventoryItem item, IsoGameCharacter chr, ArrayList<ItemContainer> containers): ArrayList<CraftRecipe>`
- `getValidInputScriptForItem(CraftRecipe recipe, InventoryItem inventoryItem, IsoGameCharacter character): InputScript`
- `hasPlayerLearnedRecipe(CraftRecipe recipe, IsoGameCharacter character): boolean`
- `hasPlayerRequiredSkill(CraftRecipe.RequiredSkill requiredSkill, IsoGameCharacter character): boolean`
- `isItemToolForRecipe(CraftRecipe recipe, InventoryItem inventoryItem, IsoGameCharacter character): boolean`
- `isItemValidForInputScript(InputScript input, InventoryItem inventoryItem, IsoGameCharacter character): boolean`
- `isItemValidForRecipe(CraftRecipe recipe, InventoryItem inventoryItem, IsoGameCharacter character): boolean`
- `isValidRecipeForCharacter(CraftRecipe recipe, IsoGameCharacter character, CraftRecipeMonitor monitor, ArrayList<ItemContainer> containers): boolean`
- `itemGetQueuedAmount(IsoGameCharacter player, InventoryItem item, CraftRecipeData.CacheData cacheData): float`
- `populateRecipeList(String tagQueryString, List<CraftRecipe> listToPopulate, boolean clearList): List<CraftRecipe>`
- `populateRecipeList(String tagQueryString, List<CraftRecipe> listToPopulate, List<CraftRecipe> sourceList, boolean clearList): List<CraftRecipe>`
- `queryRecipes(String tagQueryString): List<CraftRecipe>`
- `queryRecipes(CraftRecipeTag... craftRecipeTag): List<CraftRecipe>`
- `sanitizeTagQuery(String tagQueryString): String`

Constructors: `CraftRecipeManager.new()`.

### CraftRecipeSort

`zombie.entity.components.crafting.recipe.CraftRecipeSort`, class.

Static functions, called as `CraftRecipeSort.name(...)`:

- `alphaNumeric(List<CraftRecipe> listToSort): List<CraftRecipe>`
- `canPerformAndValidRecipes(List<CraftRecipe> listToSort, IsoGameCharacter character, ArrayList<Resource> sourceResources, ArrayList<InventoryItem> sourceItems, ArrayList<ItemContainer> containers): List<CraftRecipe>`
- `validRecipes(List<CraftRecipe> listToSort, IsoGameCharacter character): List<CraftRecipe>`

Constructors: `CraftRecipeSort.new()`.

### HandcraftLogic

`zombie.entity.components.crafting.recipe.HandcraftLogic`, class. Extends [BaseCraftingLogic](#basecraftinglogic). Also has the methods of [BaseCraftingLogic](#basecraftinglogic) (60), listed on their own entries.

Methods, called as `obj:name(...)`:

- `canCharacterPerformRecipe(CraftRecipe recipe): boolean`
- `checkValidRecipeSelected(): void`
- `filterRecipeList(String filter, String categoryFilter, boolean force, IsoPlayer player): void`
- `findCraftSurface(IsoGameCharacter player, int radius): IsoObject`
- `getAllItems(): ArrayList<InventoryItem>`
- `getCraftActionTable(): KahluaTableImpl`
- `getCraftBench(): CraftBench`
- `getCreatedOutputItems(ArrayList<InventoryItem> list): void`
- `getIsoObject(): IsoObject`
- `getLastSelectedRecipe(): CraftRecipe`
- `getPlayer(): IsoGameCharacter`
- `getRecipeData(): CraftRecipeData`
- `getRecipeList(): CraftRecipeListNodeCollection`
- `getRecipeSortMode(): String`
- `getResidualFluidFromInput(InputScript inputScript): float`
- `getResultTexture(): Texture`
- `getSelectedRecipeStyle(): String`
- `getSourceResources(): ArrayList<Resource>`
- `getUsingRecipeAtHandItem(): InventoryItem`
- `isCharacterInRangeOfWorkbench(): boolean`
- `isCraftActionInProgress(): boolean`
- `isRecipeAtHand(): boolean`
- `isRecipeAvailableForCharacter(CraftRecipe recipe): boolean`
- `isUsingRecipeAtHandBenefit(): boolean`
- `isValidRecipeForCharacter(CraftRecipe recipe): boolean`
- `performCurrentRecipe(): boolean`
- `setIsoObject(IsoObject isoObj): void`
- `setLastManualInputMode(boolean b): void`
- `setLastSelectedRecipe(CraftRecipe recipe): void`
- `setRecipe(CraftRecipe recipe): void`
- `setRecipeFromContextClick(CraftRecipe recipe, InventoryItem inventoryItem): void`
- `setRecipeSortMode(String sortMode): void`
- `setRecipes(List<CraftRecipe> recipes): void`
- `setSelectedRecipeStyle(String style): void`
- `startCraftAction(KahluaTableImpl actionTable): void`
- `stopCraftAction(): void`
- `stopCraftAction(boolean stopAll): void`

Constructors: `HandcraftLogic.new(IsoGameCharacter player, CraftBench craftBench, IsoObject isoObject)`.

### HandcraftLogic.CachedRecipeInfo

`zombie.entity.components.crafting.recipe.HandcraftLogic.CachedRecipeInfo`, class.

Methods, called as `obj:name(...)`:

- `getRecipe(): CraftRecipe`
- `isAvailable(): boolean`
- `isCanPerform(): boolean`
- `isValid(): boolean`

Constructors: `HandcraftLogic.CachedRecipeInfo.new()`.

### InputItemNode

`zombie.entity.components.crafting.recipe.InputItemNode`, class.

Methods, called as `obj:name(...)`:

- `getFirstMatchedInputScript(): InputScript`
- `getItems(): ArrayList<InventoryItem>`
- `getName(): String`
- `getRecipe(): CraftRecipe`
- `getScriptItem(): Item`
- `isExpandedAvailable(): boolean`
- `isExpandedUsed(): boolean`
- `isItemCount(): boolean`
- `isKeep(): boolean`
- `isTool(): boolean`
- `isToolLeft(): boolean`
- `isToolRight(): boolean`
- `setExpandedAvailable(boolean b): void`
- `setExpandedUsed(boolean b): void`
- `toggleExpandedAvailable(): void`
- `toggleExpandedUsed(): void`

Constructors: `InputItemNode.new()`.

### ItemDataList

`zombie.entity.components.crafting.recipe.ItemDataList`, class.

Methods, called as `obj:name(...)`:

- `addItem(InventoryItem inventoryItem): void`
- `addItem(InventoryItem inventoryItem, boolean existingItem): void`
- `addItem(Item item): void`
- `addItem(Item item, boolean existingItem): void`
- `clear(): void`
- `getInventoryItem(int index): InventoryItem`
- `getItem(int index): Item`
- `getUnprocessed(ArrayList<InventoryItem> items): void`
- `getUnprocessed(ArrayList<InventoryItem> items, boolean includeExisting): void`
- `hasUnprocessed(): boolean`
- `isProcessed(int index): boolean`
- `reset(): void`
- `setProcessed(int index): void`
- `size(): int`

Constructors: `ItemDataList.new(int capacity)`.

### OutputMapper

`zombie.entity.components.crafting.recipe.OutputMapper`, class.

Methods, called as `obj:name(...)`:

- `OnPostWorldDictionaryInit(): void`
- `OnPostWorldDictionaryInit(String recipe): void`
- `addOutputEntree(String result, String[] items): void`
- `addOutputEntree(String result, ArrayList<String> items): void`
- `getEntrees(): ArrayList<OutputMapper.OutputEntree>`
- `getOutputItem(CraftRecipeData recipeData): Item`
- `getOutputItem(CraftRecipeData recipeData, boolean testManualInputs): Item`
- `getPatternForResult(Item result): ArrayList<Item>`
- `getResultItems(): ArrayList<Item>`
- `isEmpty(): boolean`
- `registerInputScript(InputScript inputScript): void`
- `setDefaultOutputEntree(String item): void`

Constructors: `OutputMapper.new(String name)`.

### StartMode

`zombie.entity.components.crafting.StartMode`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getBits(): int`
- `getByteId(): byte`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `StartMode.name(...)`:

- `fromByteId(byte id): StartMode`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): StartMode`
- `values(): StartMode[]`

Enum values (read as `StartMode.VALUE`): `Automatic`, `Manual`, `Passive`.

### Fluid

`zombie.entity.components.fluids.Fluid`, class.

Methods, called as `obj:name(...)`:

- `canBlendWith(Fluid fluid): boolean`
- `getCategories(): ImmutableSet<FluidCategory>`
- `getColor(): Color`
- `getDisplayName(): String`
- `getFluidType(): FluidType`
- `getFluidTypeString(): String`
- `getInstance(): FluidInstance`
- `getPoisonInfo(): PoisonInfo`
- `getProperties(): SealedFluidProperties`
- `getScript(): FluidDefinitionScript`
- `getTranslatedName(): String`
- `getTranslatedNameLower(): String`
- `isCategory(FluidCategory category): boolean`
- `isPoisonous(): boolean`
- `isVanilla(): boolean`
- `toString(): String`

Static functions, called as `Fluid.name(...)`:

- `FluidsInitialized(): boolean`
- `Get(String name): Fluid`
- `Get(FluidType type): Fluid`
- `Init(ScriptLoadMode loadMode): void`
- `PreReloadScripts(): void`
- `Reset(): void`
- `getAllFluidItemsDebug(): ArrayList<Item>`
- `getAllFluids(): ArrayList<Fluid>`
- `loadFluid(ByteBuffer input, int worldVersion): Fluid`
- `saveFluid(Fluid fluid, ByteBuffer output): void`

Static fields (a copy of the value taken when the class is exposed): `Acid: Fluid`, `Alcohol: Fluid`, `AnimalBlood: Fluid`, `AnimalGrease: Fluid`, `AnimalMilk: Fluid`, `Beer: Fluid`, `Bleach: Fluid`, `Blood: Fluid`, `CarbonatedWater: Fluid`, `CleaningLiquid: Fluid`, `Coffee: Fluid`, `CowMilk: Fluid`, `Dye: Fluid`, `HairDye: Fluid`, `Honey: Fluid`, `Mead: Fluid`, `Petrol: Fluid`, `PoisonPotent: Fluid`, `SecretFlavoring: Fluid`, `SheepMilk: Fluid`, `SodaPop: Fluid`, `SpiffoJuice: Fluid`, `TaintedWater: Fluid`, `Tea: Fluid`, `Water: Fluid`, `Whiskey: Fluid`, `Wine: Fluid`.

### FluidCategory

`zombie.entity.components.fluids.FluidCategory`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getId(): byte`
- `getName(): String`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `FluidCategory.name(...)`:

- `FromId(byte id): FluidCategory`
- `getList(): ArrayList<FluidCategory>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): FluidCategory`
- `values(): FluidCategory[]`

Enum values (read as `FluidCategory.VALUE`): `Alcoholic`, `Beverage`, `Colors`, `Dyes`, `Fuel`, `HairDyes`, `Hazardous`, `Industrial`, `Medical`, `Paint`, `Poisons`, `Water`.

### FluidConsume

`zombie.entity.components.fluids.FluidConsume`, class. Extends [SealedFluidProperties](#sealedfluidproperties). Also has the methods of [SealedFluidProperties](#sealedfluidproperties) (18), listed on their own entries.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `combineWith(FluidConsume b): FluidConsume`
- `getAmount(): float`
- `getPoisonEffect(): PoisonEffect`
- `release(): void`

Static functions, called as `FluidConsume.name(...)`:

- `Alloc(): FluidConsume`
- `Load(ByteBuffer input, int worldVersion): FluidConsume`
- `Load(FluidConsume fluidConsume, ByteBuffer input, int worldVersion): FluidConsume`
- `Save(FluidConsume fluidConsume, ByteBuffer output): void`
- `combine(FluidConsume a, FluidConsume b): FluidConsume`

Static fields (a copy of the value taken when the class is exposed): `Str_Alcohol: String`, `Str_Calories: String`, `Str_Carbohydrates: String`, `Str_Endurance: String`, `Str_Fatigue: String`, `Str_Flu: String`, `Str_FoodSickness: String`, `Str_Hunger: String`, `Str_Lipids: String`, `Str_Pain: String`, `Str_Proteins: String`, `Str_Stress: String`, `Str_Thirst: String`, `Str_Unhappy: String`.

### FluidContainer

`zombie.entity.components.fluids.FluidContainer`, class. Extends [Component](#component). Also has the methods of [Component](#component) (16), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI): void`
- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `Empty(): void`
- `Empty(boolean bRecalculate): void`
- `addFluid(String fluidType, float amount): void`
- `addFluid(Fluid fluid, float amount): void`
- `addFluid(FluidType fluidType, float amount): void`
- `adjustAmount(float newAmount): void`
- `adjustSpecificFluidAmount(Fluid fluid, float newAmount): void`
- `canAddFluid(Fluid fluid): boolean`
- `canPlayerEmpty(): boolean`
- `contains(Fluid fluid): boolean`
- `copy(): FluidContainer`
- `copyFluidsFrom(FluidContainer other): void`
- `createFluidSample(): FluidSample`
- `createFluidSample(float scaleAmount): FluidSample`
- `createFluidSample(FluidSample sample, float scaleAmount): FluidSample`
- `getAmount(): float`
- `getBlacklist(): FluidFilter`
- `getCapacity(): float`
- `getColor(): Color`
- `getContainerName(): String`
- `getCustomDrinkSound(): String`
- `getFilledRatio(): float`
- `getFreeCapacity(): float`
- `getPoisonEffect(): PoisonEffect`
- `getPoisonRatio(): float`
- `getPrimaryFluid(): Fluid`
- `getPrimaryFluidAmount(): float`
- `getProperties(): SealedFluidProperties`
- `getRainCatcher(): float`
- `getRatioForFluid(Fluid fluid): float`
- `getSpecificFluidAmount(Fluid fluid): float`
- `getTransferRate(): float`
- `getTranslatedContainerName(): String`
- `getUiName(): String`
- `getWhitelist(): FluidFilter`
- `isAllCategory(FluidCategory category): boolean`
- `isCategory(FluidCategory category): boolean`
- `isEmpty(): boolean`
- `isFilledWithCleanWater(): boolean`
- `isFull(): boolean`
- `isHiddenAmount(): boolean`
- `isInputLocked(): boolean`
- `isMixture(): boolean`
- `isMultiTileMoveable(): boolean`
- `isPerceivedFluidToPlayer(Fluid fluid, IsoGameCharacter character): boolean`
- `isPoisonous(): boolean`
- `isPrimaryFluid(Fluid fluid): boolean`
- `isPrimaryFluidType(String fluidType): boolean`
- `isPrimaryFluidType(FluidType fluidType): boolean`
- `isPureFluid(Fluid fluid): boolean`
- `isQualifiesForMetaStorage(): boolean`
- `isTainted(): boolean`
- `isTaintedStatusKnown(): boolean`
- `isWaterOnlySource(): boolean`
- `isWaterSource(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `removeFluid(): void`
- `removeFluid(float remove): void`
- `removeFluid(boolean createFluidConsume): FluidConsume`
- `removeFluid(float remove, boolean createFluidConsume): FluidConsume`
- `removeFluid(float remove, boolean createFluidConsume, FluidConsume fluidConsume): FluidConsume`
- `save(ByteBuffer output): void`
- `setCanPlayerEmpty(boolean b): void`
- `setCapacity(float capacity): void`
- `setContainerName(String name): void`
- `setInputLocked(boolean b): void`
- `setNonSavedFieldsFromItemScript(InventoryItem item): void`
- `setRainCatcher(float rainCatcher): void`
- `setWhitelist(FluidFilter ff): void`
- `transferFrom(FluidContainer other): void`
- `transferFrom(FluidContainer other, float amount): void`
- `transferTo(FluidContainer other): void`
- `transferTo(FluidContainer other, float amount): void`
- `unseal(): void`
- `unsealIfNotFull(): void`

Static functions, called as `FluidContainer.name(...)`:

- `CanTransfer(FluidContainer source, FluidContainer target): boolean`
- `CreateContainer(): FluidContainer`
- `DisposeContainer(FluidContainer container): void`
- `GetTransferReason(FluidContainer source, FluidContainer target): String`
- `GetTransferReason(FluidContainer source, FluidContainer target, boolean testFirst): String`
- `Transfer(FluidContainer source, FluidContainer target): void`
- `Transfer(FluidContainer source, FluidContainer target, float amount): void`
- `Transfer(FluidContainer source, FluidContainer target, float amount, boolean keepSource): void`

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_TRANSFER_RATE: float`, `DEF_CONTAINER_NAME: String`, `MAX_FLUIDS: int`.

### FluidFilter

`zombie.entity.components.fluids.FluidFilter`, class.

Methods, called as `obj:name(...)`:

- `add(String fluid): FluidFilter`
- `add(Fluid fluid): FluidFilter`
- `add(FluidCategory category): FluidFilter`
- `add(FluidType fluid): FluidFilter`
- `allows(String fluidString): boolean`
- `allows(Fluid fluid): boolean`
- `allows(FluidType fluidType): boolean`
- `contains(String fluid): boolean`
- `contains(Fluid fluid): boolean`
- `contains(FluidCategory category): boolean`
- `contains(FluidType fluid): boolean`
- `copy(): FluidFilter`
- `getFilterDisplayName(): String`
- `getFilterTooltipText(): String`
- `getFilterType(): FluidFilter.FilterType`
- `isSealed(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `remove(String fluid): FluidFilter`
- `remove(Fluid fluid): FluidFilter`
- `remove(FluidCategory category): FluidFilter`
- `remove(FluidType fluid): FluidFilter`
- `save(ByteBuffer output): void`
- `seal(): void`
- `setFilterScript(String filterScriptName): void`
- `setFilterType(FluidFilter.FilterType filterType): FluidFilter`
- `toString(): String`

Constructors: `FluidFilter.new()`.

### FluidFilter.FilterType

`zombie.entity.components.fluids.FluidFilter.FilterType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `FluidFilter.FilterType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): FluidFilter.FilterType`
- `values(): FluidFilter.FilterType[]`

Enum values (read as `FluidFilter.FilterType.VALUE`): `Blacklist`, `Whitelist`.

### FluidProperties

`zombie.entity.components.fluids.FluidProperties`, class. Extends [SealedFluidProperties](#sealedfluidproperties). Also has the methods of [SealedFluidProperties](#sealedfluidproperties) (18), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getSealedFluidProperties(): SealedFluidProperties`
- `setAlcohol(float alcohol): void`
- `setCalories(float calories): void`
- `setCarbohydrates(float carbohydrates): void`
- `setEffects(float fatigueChange, float hungerChange, float stressChange, float thirstChange, float unhappyChange, float alcoholChange, float poisonChange): void`
- `setEnduranceChange(float enduranceChange): void`
- `setFatigueChange(float fatigueChange): void`
- `setFluReduction(float fluReduction): void`
- `setFoodSicknessChange(int foodSicknessChange): void`
- `setHungerChange(float hungerChange): void`
- `setLipids(float lipids): void`
- `setNutrients(float calories, float carbohydrates, float lipids, float proteins): void`
- `setPainReduction(float painReduction): void`
- `setProteins(float proteins): void`
- `setReductions(float fluReduction, float painReduction, float enduranceChange, int foodSicknessChange): void`
- `setStressChange(float stressChange): void`
- `setThirstChange(float thirstChange): void`
- `setUnhappyChange(float unhappyChange): void`

Constructors: `FluidProperties.new()`.

Static fields (a copy of the value taken when the class is exposed): `Str_Alcohol: String`, `Str_Calories: String`, `Str_Carbohydrates: String`, `Str_Endurance: String`, `Str_Fatigue: String`, `Str_Flu: String`, `Str_FoodSickness: String`, `Str_Hunger: String`, `Str_Lipids: String`, `Str_Pain: String`, `Str_Proteins: String`, `Str_Stress: String`, `Str_Thirst: String`, `Str_Unhappy: String`.

### FluidSample

`zombie.entity.components.fluids.FluidSample`, class.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `combineWith(FluidSample b): FluidSample`
- `copy(): FluidSample`
- `getAmount(): float`
- `getColor(): Color`
- `getFluid(int index): Fluid`
- `getFluidInstance(int index): FluidInstance`
- `getFluidInstance(Fluid fluid): FluidInstance`
- `getPercentage(int index): float`
- `getPrimaryFluid(): Fluid`
- `isEmpty(): boolean`
- `isPureFluid(): boolean`
- `release(): void`
- `scaleToAmount(float amount): void`
- `size(): int`

Static functions, called as `FluidSample.name(...)`:

- `Alloc(): FluidSample`
- `Load(ByteBuffer input, int worldVersion): FluidSample`
- `Load(FluidSample fluidSample, ByteBuffer input, int worldVersion): FluidSample`
- `Save(FluidSample fluidSample, ByteBuffer output): void`
- `combine(FluidSample a, FluidSample b): FluidSample`

### FluidType

`zombie.entity.components.fluids.FluidType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getDisplayName(): String`
- `getId(): byte`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`
- `toStringLower(): String`

Static functions, called as `FluidType.name(...)`:

- `FromId(byte id): FluidType`
- `FromNameLower(String name): FluidType`
- `containsNameLowercase(String name): boolean`
- `getAllFluidName(): ArrayList<String>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): FluidType`
- `values(): FluidType[]`

Enum values (read as `FluidType.VALUE`): `Acid`, `AnimalBlood`, `AnimalGrease`, `AnimalMilk`, `Beer`, `Bleach`, `Blood`, `CarbonatedWater`, `CleaningLiquid`, `Coffee`, `CowMilk`, `Dye`, `HairDye`, `Honey`, `Mead`, `Modded`, `None`, `Paint`, `Petrol`, `PoisonNormal`, `PoisonPotent`, `PoisonStrong`, `PoisonWeak`, `RubbingAlcohol`, `SecretFlavoring`, `SheepMilk`, `SodaPop`, `SpiffoJuice`, `TaintedWater`, `Tea`, `Water`, `Whiskey`, `Wine`.

### FluidUtil

`zombie.entity.components.fluids.FluidUtil`, class.

Static functions, called as `FluidUtil.name(...)`:

- `getAmountFormatted(float amount): String`
- `getAmountLiter(float amount): String`
- `getAmountLiter10(float amount): String`
- `getAmountLiter1000(float amount): String`
- `getAmountMilli(float amount): String`
- `getFractionFormatted(float numerator, float denominator): String`
- `getMinContainerCapacity(): float`
- `getMinTransferActionTime(): float`
- `getMinUnit(): float`
- `getTransferActionTimePerLiter(): float`
- `getUnitCentiLiter(): float`
- `getUnitCentiMilliLiter(): float`
- `getUnitDeciLiter(): float`
- `getUnitDeciMilliLiter(): float`
- `getUnitLiter(): float`
- `getUnitMicroLiter(): float`
- `getUnitMilliLiter(): float`
- `roundTransfer(float amount): float`

Constructors: `FluidUtil.new()`.

Static fields (a copy of the value taken when the class is exposed): `MIN_CONTAINER_CAPACITY: float`, `MIN_TRANSFER_ACTION_TIME: float`, `MIN_UNIT: float`, `TRANSFER_ACTION_TIME_PER_LITER: float`, `UNIT_L: float`, `UNIT_cL: float`, `UNIT_cmL: float`, `UNIT_dL: float`, `UNIT_dmL: float`, `UNIT_mL: float`, `UNIT_uL: float`.

### PoisonEffect

`zombie.entity.components.fluids.PoisonEffect`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getLevel(): int`
- `getPlayerEffect(): int`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`
- `toStringLower(): String`

Static functions, called as `PoisonEffect.name(...)`:

- `FromLevel(int level): PoisonEffect`
- `FromNameLower(String name): PoisonEffect`
- `containsNameLowercase(String name): boolean`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): PoisonEffect`
- `values(): PoisonEffect[]`

Enum values (read as `PoisonEffect.VALUE`): `Deadly`, `Extreme`, `Medium`, `Mild`, `None`, `Severe`.

### PoisonInfo

`zombie.entity.components.fluids.PoisonInfo`, class.

Methods, called as `obj:name(...)`:

- `getFluid(): Fluid`
- `getPoisonEffect(float volume, float ratio): PoisonEffect`

### SealedFluidProperties

`zombie.entity.components.fluids.SealedFluidProperties`, class.

Methods, called as `obj:name(...)`:

- `getAlcohol(): float`
- `getCalories(): float`
- `getCarbohydrates(): float`
- `getEnduranceChange(): float`
- `getFatigueChange(): float`
- `getFluReduction(): float`
- `getFoodSicknessChange(): int`
- `getHungerChange(): float`
- `getLipids(): float`
- `getPainReduction(): float`
- `getPoison(): float`
- `getProteins(): float`
- `getStressChange(): float`
- `getThirstChange(): float`
- `getUnhappyChange(): float`
- `hasProperties(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`

Constructors: `SealedFluidProperties.new()`.

Static fields (a copy of the value taken when the class is exposed): `Str_Alcohol: String`, `Str_Calories: String`, `Str_Carbohydrates: String`, `Str_Endurance: String`, `Str_Fatigue: String`, `Str_Flu: String`, `Str_FoodSickness: String`, `Str_Hunger: String`, `Str_Lipids: String`, `Str_Pain: String`, `Str_Proteins: String`, `Str_Stress: String`, `Str_Thirst: String`, `Str_Unhappy: String`.

### LuaComponent

`zombie.entity.components.lua.LuaComponent`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

### Parts

`zombie.entity.components.parts.Parts`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

### Resource

`zombie.entity.components.resources.Resource`, abstract class.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI): void`
- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `acceptsItem(InventoryItem item, boolean ignoreFilters): boolean`
- `acceptsItem(InventoryItem item): boolean`
- `canDrainFromItem(InventoryItem item): boolean`
- `canDrainToItem(InventoryItem item): boolean`
- `canMoveItemsToOutput(): boolean`
- `canStackItem(InventoryItem item): boolean`
- `canStackItem(Item item): boolean`
- `clear(): void`
- `containsItem(InventoryItem item): boolean`
- `drainFromItem(InventoryItem item): boolean`
- `drainToItem(InventoryItem item): boolean`
- `getChannel(): ResourceChannel`
- `getDebugFlagsString(): String`
- `getEnergyAmount(): float`
- `getEnergyCapacity(): float`
- `getFilterName(): String`
- `getFluidAmount(): float`
- `getFluidCapacity(): float`
- `getFreeEnergyCapacity(): float`
- `getFreeFluidCapacity(): float`
- `getFreeItemCapacity(): int`
- `getFreeItemUsesCapacity(): float`
- `getGameEntity(): GameEntity`
- `getIO(): ResourceIO`
- `getId(): String`
- `getItemAmount(): int`
- `getItemCapacity(): int`
- `getItemUses(InputScript inputScript): float`
- `getItemUsesAmount(): float`
- `getItemUsesCapacity(): float`
- `getProgress(): double`
- `getResourcesComponent(): Resources`
- `getType(): ResourceType`
- `hasFlag(ResourceFlag flag): boolean`
- `isAutoDecay(): boolean`
- `isDirty(): boolean`
- `isEmpty(): boolean`
- `isFull(): boolean`
- `isLocked(): boolean`
- `isTemporary(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `loadSync(ByteBuffer input, int worldVersion): void`
- `offerItem(InventoryItem item): InventoryItem`
- `offerItem(InventoryItem item, boolean ignoreFilters): InventoryItem`
- `offerItem(InventoryItem item, boolean ignoreFilters, boolean force, boolean syncEntity): InventoryItem`
- `peekItem(): InventoryItem`
- `peekItem(int offset): InventoryItem`
- `pollItem(): InventoryItem`
- `pollItem(boolean force, boolean syncEntity): InventoryItem`
- `save(ByteBuffer output): void`
- `saveSync(ByteBuffer output): void`
- `setDirty(): void`
- `setLocked(boolean locked): void`
- `setProgress(double progress): void`
- `sync(): void`
- `tryTransferTo(Resource target): void`
- `tryTransferTo(Resource target, float amount): void`

### ResourceBlueprint

`zombie.entity.components.resources.ResourceBlueprint`, class.

Methods, called as `obj:name(...)`:

- `getCapacity(): float`
- `getChannel(): ResourceChannel`
- `getFilter(): String`
- `getFlagBits(): int`
- `getIO(): ResourceIO`
- `getId(): String`
- `getType(): ResourceType`
- `hasFlag(ResourceFlag flag): boolean`
- `isStackAnyItem(): boolean`

Static functions, called as `ResourceBlueprint.name(...)`:

- `Deserialize(String serial): ResourceBlueprint`
- `Deserialize(ResourceBlueprint bp, String serial): ResourceBlueprint`
- `Deserialize(ResourceBlueprint bp, String serial, boolean flagsAsString): ResourceBlueprint`
- `DeserializeFromScript(String serial): ResourceBlueprint`
- `Serialize(String id, ResourceType type, ResourceIO io, float capacity, boolean stackAnyItem, String filter, ResourceChannel channel, EnumBitStore<ResourceFlag> flags): String`
- `Serialize(ResourceBlueprint bp): String`
- `alloc(String id, ResourceType type, ResourceIO io, float capacity, String filter, ResourceChannel channel, EnumBitStore<ResourceFlag> flags): ResourceBlueprint`
- `release(ResourceBlueprint bp): void`

Static fields (a copy of the value taken when the class is exposed): `serialElementSeparator: String`, `serialSubSeparator: String`.

### ResourceChannel

`zombie.entity.components.resources.ResourceChannel`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getBits(): int`
- `getByteId(): byte`
- `getColor(): Color`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ResourceChannel.name(...)`:

- `fromId(byte id): ResourceChannel`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ResourceChannel`
- `values(): ResourceChannel[]`

Enum values (read as `ResourceChannel.VALUE`): `Channel_Blue`, `Channel_Cyan`, `Channel_Green`, `Channel_Magenta`, `Channel_Orange`, `Channel_Purple`, `Channel_Red`, `Channel_Yellow`, `NO_CHANNEL`.

Static fields (a copy of the value taken when the class is exposed): `BitStoreAll: EnumBitStore<ResourceChannel>`.

### ResourceEnergy

`zombie.entity.components.resources.ResourceEnergy`, class. Extends [Resource](#resource). Also has the methods of [Resource](#resource) (42), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `canDrainFromItem(InventoryItem item): boolean`
- `canDrainToItem(InventoryItem item): boolean`
- `clear(): void`
- `drainFromItem(InventoryItem item): boolean`
- `drainToItem(InventoryItem item): boolean`
- `getEnergy(): Energy`
- `getEnergyAmount(): float`
- `getEnergyCapacity(): float`
- `getEnergyRatio(): float`
- `getFreeEnergyCapacity(): float`
- `isEmpty(): boolean`
- `isFull(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `loadSync(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`
- `saveSync(ByteBuffer output): void`
- `setEnergyAmount(float amount): boolean`
- `transferTo(ResourceEnergy target, float transferAmount): void`
- `tryTransferTo(Resource target): void`
- `tryTransferTo(Resource target, float amount): void`

### ResourceFlag

`zombie.entity.components.resources.ResourceFlag`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getBits(): int`
- `getByteId(): byte`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ResourceFlag.name(...)`:

- `fromByteId(byte id): ResourceFlag`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ResourceFlag`
- `values(): ResourceFlag[]`

Enum values (read as `ResourceFlag.VALUE`): `AutoDecay`, `Temporary`.

### ResourceFluid

`zombie.entity.components.resources.ResourceFluid`, class. Extends [Resource](#resource). Also has the methods of [Resource](#resource) (42), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `canDrainFromItem(InventoryItem item): boolean`
- `canDrainToItem(InventoryItem item): boolean`
- `clear(): void`
- `drainFromItem(InventoryItem item): boolean`
- `drainToItem(InventoryItem item): boolean`
- `getFluidAmount(): float`
- `getFluidCapacity(): float`
- `getFluidContainer(): FluidContainer`
- `getFluidRatio(): float`
- `getFreeFluidCapacity(): float`
- `isEmpty(): boolean`
- `isFull(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `loadSync(ByteBuffer input, int worldVersion): void`
- `save(ByteBuffer output): void`
- `saveSync(ByteBuffer output): void`
- `transferTo(ResourceFluid target, float transferAmount): void`
- `tryTransferTo(Resource target): void`
- `tryTransferTo(Resource target, float amount): void`

### ResourceIO

`zombie.entity.components.resources.ResourceIO`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getId(): byte`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ResourceIO.name(...)`:

- `fromId(byte id): ResourceIO`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ResourceIO`
- `values(): ResourceIO[]`

Enum values (read as `ResourceIO.VALUE`): `Any`, `Input`, `Output`.

### ResourceItem

`zombie.entity.components.resources.ResourceItem`, class. Extends [Resource](#resource). Also has the methods of [Resource](#resource) (25), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DoTooltip(ObjectTooltip tooltipUI): void`
- `DoTooltip(ObjectTooltip tooltipUI, ObjectTooltip.Layout layout): void`
- `acceptsItem(InventoryItem item, boolean ignoreFilters): boolean`
- `canStackItem(InventoryItem item): boolean`
- `canStackItem(Item item): boolean`
- `clear(): void`
- `containsItem(InventoryItem item): boolean`
- `getEnergyAmount(): float`
- `getEnergyCapacity(): float`
- `getFluidAmount(): float`
- `getFluidCapacity(): float`
- `getFreeEnergyCapacity(): float`
- `getFreeFluidCapacity(): float`
- `getFreeItemCapacity(): int`
- `getFreeItemUsesCapacity(): float`
- `getItemAmount(): int`
- `getItemAmount(Item itemType): int`
- `getItemById(int id): InventoryItem`
- `getItemCapacity(): int`
- `getItemFilter(): ItemFilter`
- `getItemUses(InputScript inputScript): float`
- `getItemUsesAmount(): float`
- `getItemUsesCapacity(): float`
- `getStoredItems(): ArrayList<InventoryItem>`
- `getStoredItemsOfType(Item itemType): ArrayList<InventoryItem>`
- `getUniqueItems(): ArrayList<Item>`
- `isEmpty(): boolean`
- `isFull(): boolean`
- `isStackAnyItem(): boolean`
- `load(ByteBuffer input, int worldVersion): void`
- `loadSync(ByteBuffer input, int worldVersion): void`
- `offerItem(InventoryItem item, boolean ignoreFilters): InventoryItem`
- `offerItem(InventoryItem item, boolean ignoreFilters, boolean force, boolean syncEntity): InventoryItem`
- `offerItems(List<InventoryItem> items): ArrayList<InventoryItem>`
- `offerItems(List<InventoryItem> items, boolean ignoreFilters): ArrayList<InventoryItem>`
- `peekItem(): InventoryItem`
- `peekItem(int offset): InventoryItem`
- `pollItem(): InventoryItem`
- `pollItem(boolean force, boolean syncEntity): InventoryItem`
- `removeAllItems(ArrayList<InventoryItem> list): ArrayList<InventoryItem>`
- `removeAllItems(ArrayList<InventoryItem> list, Item itemType): ArrayList<InventoryItem>`
- `removeItem(InventoryItem item): InventoryItem`
- `removeItemById(int id): InventoryItem`
- `save(ByteBuffer output): void`
- `saveSync(ByteBuffer output): void`
- `storedSize(): int`
- `transferTo(ResourceItem target, int transferAmount): void`
- `tryLoadSyncItems(ByteBuffer input, int worldVersion, int size, String type, boolean forceCreate): boolean`
- `tryTransferTo(Resource target): void`
- `tryTransferTo(Resource target, float amount): void`

### Resources

`zombie.entity.components.resources.Resources`, class. Extends [Component](#component). Also has the methods of [Component](#component) (17), listed on their own entries.

Methods, called as `obj:name(...)`:

- `createResource(String groupName, ResourceBlueprint blueprint): void`
- `createResource(ResourceBlueprint blueprint): void`
- `createResourceFromSerial(String blueprintSerial): void`
- `createResourceFromSerial(String groupName, String blueprintSerial): void`
- `dumpContentsInSquare(): void`
- `getResource(int index): Resource`
- `getResource(String nameId): Resource`
- `getResourceCount(): int`
- `getResourceGroup(String name): ResourceGroup`
- `getResourceIndex(Resource resource): int`
- `getResources(): List<Resource>`
- `getResources(List<Resource> list, ResourceChannel channel): List<Resource>`
- `getResources(List<Resource> list, ResourceIO io): List<Resource>`
- `getResources(List<Resource> list, ResourceIO io, ResourceChannel channel): List<Resource>`
- `getResources(List<Resource> list, ResourceIO io, ResourceType type): List<Resource>`
- `getResources(List<Resource> list, ResourceType type): List<Resource>`
- `getResourcesForGroup(String name): List<Resource>`
- `getResourcesFromGroup(String group, List<Resource> list, ResourceChannel channel): List<Resource>`
- `getResourcesFromGroup(String group, List<Resource> list, ResourceIO io): List<Resource>`
- `getResourcesFromGroup(String group, List<Resource> list, ResourceIO io, ResourceChannel channel): List<Resource>`
- `getResourcesFromGroup(String group, List<Resource> list, ResourceIO io, ResourceType type): List<Resource>`
- `getResourcesFromGroup(String group, List<Resource> list, ResourceType type): List<Resource>`
- `isNoContainerOrEmpty(): boolean`
- `removeResource(String resourceID): void`
- `removeResource(Resource resource): void`
- `removeResourceGroup(String groupName): void`
- `removeResourceGroup(ResourceGroup group): void`

Static fields (a copy of the value taken when the class is exposed): `defaultGroup: String`.

### ResourceType

`zombie.entity.components.resources.ResourceType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getId(): byte`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ResourceType.name(...)`:

- `fromId(byte id): ResourceType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ResourceType`
- `values(): ResourceType[]`

Enum values (read as `ResourceType.VALUE`): `Any`, `Energy`, `Fluid`, `Item`.

### EntityScriptInfo

`zombie.entity.components.script.EntityScriptInfo`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getOriginalScript(): String`
- `getScript(): GameEntityScript`
- `isOriginalIsItem(): boolean`
- `setOriginalScript(GameEntityScript entityScript): void`

### Signals

`zombie.entity.components.signals.Signals`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

### CraftBenchSounds

`zombie.entity.components.sounds.CraftBenchSounds`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getSoundName(String id, String param1): String`

### SpriteConfig

`zombie.entity.components.spriteconfig.SpriteConfig`, class. Extends [Component](#component). Also has the methods of [Component](#component) (18), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getAllMultiSquareObjects(ArrayList<IsoObject> outlist): boolean`
- `getFaceInfo(): SpriteConfigManager.FaceInfo`
- `getMasterOffsetX(): int`
- `getMasterOffsetY(): int`
- `getMasterOffsetZ(): int`
- `getMultiSquareMaster(): IsoObject`
- `getObjectInfo(): SpriteConfigManager.ObjectInfo`
- `getTileInfo(): SpriteConfigManager.TileInfo`
- `isCanRotate(): boolean`
- `isMultiSquareFullyLoaded(): boolean`
- `isMultiSquareMaster(): boolean`
- `isMultiSquareSlave(): boolean`
- `isValid(): boolean`
- `isValidMultiSquare(): boolean`
- `isWasLoadedAsMaster(): boolean`

### SpriteConfigManager

`zombie.entity.components.spriteconfig.SpriteConfigManager`, class.

Static functions, called as `SpriteConfigManager.name(...)`:

- `GetFaceIdForString(String face): int`
- `GetObjectInfo(String name): SpriteConfigManager.ObjectInfo`
- `GetObjectInfoList(): ArrayList<SpriteConfigManager.ObjectInfo>`
- `HasLoadErrors(): boolean`
- `InitScriptsPostTileDef(): void`
- `Reset(): void`
- `getObjectInfoFromSprite(String spriteName): SpriteConfigManager.ObjectInfo`

Constructors: `SpriteConfigManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `FACE_E: String`, `FACE_ID_CARDINAL_MAX: int`, `FACE_ID_E: int`, `FACE_ID_MAX: int`, `FACE_ID_N: int`, `FACE_ID_N_OPEN: int`, `FACE_ID_S: int`, `FACE_ID_SINGLE: int`, `FACE_ID_W: int`, `FACE_ID_W_OPEN: int`, `FACE_N: String`, `FACE_N_OPEN: String`, `FACE_S: String`, `FACE_SINGLE: String`, `FACE_W: String`, `FACE_W_OPEN: String`.

### SpriteConfigManager.FaceInfo

`zombie.entity.components.spriteconfig.SpriteConfigManager.FaceInfo`, class.

Methods, called as `obj:name(...)`:

- `getFaceName(): String`
- `getHeight(): int`
- `getMasterTileInfo(): SpriteConfigManager.TileInfo`
- `getMasterX(): int`
- `getMasterY(): int`
- `getMasterZ(): int`
- `getTileInfo(int x, int y, int z): SpriteConfigManager.TileInfo`
- `getTileInfoForSprite(String tile): SpriteConfigManager.TileInfo`
- `getWidth(): int`
- `getzLayers(): int`
- `isMasterSet(): boolean`
- `isMultiSquare(): boolean`
- `verifyObject(int x, int y, int z, IsoObject object): boolean`

### SpriteConfigManager.ObjectInfo

`zombie.entity.components.spriteconfig.SpriteConfigManager.ObjectInfo`, class.

Methods, called as `obj:name(...)`:

- `canRotate(): boolean`
- `getFace(int faceID): SpriteConfigManager.FaceInfo`
- `getFace(String face): SpriteConfigManager.FaceInfo`
- `getFaceForSprite(String spriteName): SpriteConfigManager.FaceInfo`
- `getIconTexture(): Texture`
- `getMainSpriteNameUI(): String`
- `getName(): String`
- `getRecipe(): CraftRecipeComponentScript`
- `getRequiredSkillCount(): int`
- `getScript(): SpriteConfigScript`
- `getTags(): List<String>`
- `getTime(): int`
- `getVersion(): long`
- `isProp(): boolean`
- `isSingleFace(): boolean`
- `needToBeLearn(): boolean`

### SpriteConfigManager.TileInfo

`zombie.entity.components.spriteconfig.SpriteConfigManager.TileInfo`, class.

Methods, called as `obj:name(...)`:

- `getMasterOffsetX(): int`
- `getMasterOffsetY(): int`
- `getMasterOffsetZ(): int`
- `getSpriteName(): String`
- `getX(): int`
- `getY(): int`
- `getZ(): int`
- `isBlocking(): boolean`
- `isEmpty(): boolean`
- `isMaster(): boolean`
- `verifyObject(IsoObject object): boolean`

### SpriteOverlayConfig

`zombie.entity.components.spriteconfig.SpriteOverlayConfig`, class. Extends [Component](#component). Also has the methods of [Component](#component) (18), listed on their own entries.

Methods, called as `obj:name(...)`:

- `clearStyle(): void`
- `getAvailableStyles(): ArrayList<String>`
- `hasStyle(String style): boolean`
- `isValid(): boolean`
- `setStyle(String style): void`

### TestComponent

`zombie.entity.components.test.TestComponent`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

### UiConfig

`zombie.entity.components.ui.UiConfig`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getEntityDisplayName(): String`
- `getEntityStyleName(): String`
- `getEntityUiStyle(): XuiSkin.EntityUiStyle`
- `getSkin(): XuiSkin`
- `getSkin(boolean doDefault): XuiSkin`
- `getSkinOrDefault(): XuiSkin`
- `isUiEnabled(): boolean`

### ComponentType

`zombie.entity.ComponentType`, enum.

Methods, called as `obj:name(...)`:

- `CreateComponent(): Component`
- `CreateComponentFromScript(ComponentScript script): Component`
- `CreateComponentScript(): ComponentScript`
- `GetComponentClass(): Class<? extends Component>`
- `GetID(): short`
- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `isAddToEngine(): boolean`
- `isRenderLast(): boolean`
- `isRunInMeta(): boolean`
- `isValidGameEntityType(GameEntityType type): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ComponentType.name(...)`:

- `FromClass(Class<? extends Component> clazz): ComponentType`
- `FromId(short id): ComponentType`
- `GetList(): ArrayList<ComponentType>`
- `ReleaseComponent(Component component): void`
- `getBitsFor(ComponentType... componentTypes): BitSet`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ComponentType`
- `values(): ComponentType[]`

Enum values (read as `ComponentType.VALUE`): `Attributes`, `ContextMenuConfig`, `CraftBench`, `CraftBenchSounds`, `CraftLogic`, `CraftRecipe`, `DryingCraftLogic`, `DryingLogic`, `Durability`, `FluidContainer`, `FurnaceLogic`, `Lua`, `MashingLogic`, `MetaTag`, `Parts`, `Resources`, `Script`, `Signals`, `SpriteConfig`, `SpriteOverlayConfig`, `TestComponent`, `UiConfig`, `Undefined`, `WallCoveringConfig`.

Static fields (a copy of the value taken when the class is exposed): `MAX_ID_INDEX: int`.

### EntityDebugTest

`zombie.entity.debug.EntityDebugTest`, abstract class.

Methods, called as `obj:name(...)`:

- `create(IsoGridSquare): void`
- `update(): void`

Static functions, called as `EntityDebugTest.name(...)`:

- `CreateTest(EntityDebugTestType type, IsoGridSquare square): void`
- `Reset(): void`
- `Update(): void`

Constructors: `EntityDebugTest.new()`.

### EntityDebugTestType

`zombie.entity.debug.EntityDebugTestType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `EntityDebugTestType.name(...)`:

- `getValueList(): ArrayList<EntityDebugTestType>`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): EntityDebugTestType`
- `values(): EntityDebugTestType[]`

Enum values (read as `EntityDebugTestType.VALUE`): `BaseTest`.

### Energy

`zombie.entity.energy.Energy`, class.

Methods, called as `obj:name(...)`:

- `getColor(): Color`
- `getDisplayName(): String`
- `getEnergyTypeString(): String`
- `getHorizontalBarTexture(): Texture`
- `getIconTexture(): Texture`
- `getVerticalBarTexture(): Texture`
- `isVanilla(): boolean`

Static functions, called as `Energy.name(...)`:

- `Get(String name): Energy`
- `Get(EnergyType type): Energy`
- `Init(ScriptLoadMode loadMode): void`
- `PreReloadScripts(): void`
- `Reset(): void`
- `getAllEnergies(): ArrayList<Energy>`
- `loadEnergy(ByteBuffer input, int worldVersion): Energy`
- `saveEnergy(Energy energy, ByteBuffer output): void`

Static fields (a copy of the value taken when the class is exposed): `Electric: Energy`, `Mechanical: Energy`, `Steam: Energy`, `Thermal: Energy`, `VoidEnergy: Energy`.

### EnergyType

`zombie.entity.energy.EnergyType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getId(): byte`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`
- `toStringLower(): String`

Static functions, called as `EnergyType.name(...)`:

- `FromId(byte id): EnergyType`
- `FromNameLower(String name): EnergyType`
- `containsNameLowercase(String name): boolean`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): EnergyType`
- `values(): EnergyType[]`

Enum values (read as `EnergyType.VALUE`): `Electric`, `Mechanical`, `Modded`, `None`, `Steam`, `Thermal`, `VoidEnergy`.

### EntityBucket

`zombie.entity.EntityBucket`, abstract class.

Methods, called as `obj:name(...)`:

- `addListener(int priority, IBucketListener listener): void`
- `getEntities(): ImmutableArray<GameEntity>`
- `getIndex(): int`
- `removeListener(IBucketListener listener): void`
- `setVerbose(boolean b): void`

### ComponentEvent

`zombie.entity.events.ComponentEvent`, class.

Methods, called as `obj:name(...)`:

- `getEventType(): ComponentEventType`
- `getSender(): Component`
- `release(): void`

Static functions, called as `ComponentEvent.name(...)`:

- `Alloc(ComponentEventType type, Component sender): ComponentEvent`

### ComponentEventType

`zombie.entity.events.ComponentEventType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `ComponentEventType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): ComponentEventType`
- `values(): ComponentEventType[]`

Enum values (read as `ComponentEventType.VALUE`): `OnContentsChanged`.

### EntityEvent

`zombie.entity.events.EntityEvent`, class.

Methods, called as `obj:name(...)`:

- `getEntity(): GameEntity`
- `getEventType(): EntityEventType`
- `release(): void`

Static functions, called as `EntityEvent.name(...)`:

- `Alloc(EntityEventType type, GameEntity entity): EntityEvent`

### EntityEventType

`zombie.entity.events.EntityEventType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `EntityEventType.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): EntityEventType`
- `values(): EntityEventType[]`

Enum values (read as `EntityEventType.VALUE`): `AddedToWorld`.

### Family

`zombie.entity.Family`, class.

Methods, called as `obj:name(...)`:

- `equals(Object obj): boolean`
- `getIndex(): int`
- `hashCode(): int`
- `matches(GameEntity entity): boolean`

Static functions, called as `Family.name(...)`:

- `all(ComponentType... componentTypes): Family.Builder`
- `exclude(ComponentType... componentTypes): Family.Builder`
- `one(ComponentType... componentTypes): Family.Builder`

### GameEntity

`zombie.entity.GameEntity`, abstract class.

Methods, called as `obj:name(...)`:

- `addToWorld(): void`
- `attrib(): AttributeContainer`
- `componentSize(): int`
- `containsComponent(Component component): boolean`
- `getAttributes(): AttributeContainer`
- `getComponent(ComponentType type): T`
- `getComponentAny(ComponentType... types): T`
- `getComponentForIndex(int index): Component`
- `getComponentFromID(short id): Component`
- `getDurabilityComponent(): Durability`
- `getEntityDisplayName(): String`
- `getEntityFullTypeDebug(): String`
- `getEntityNetID(): long`
- `getEntityScript(): GameEntityScript`
- `getExceptionCompatibleString(): String`
- `getFluidContainer(): FluidContainer`
- `getGameEntityType(): GameEntityType`
- `getSpriteConfig(): SpriteConfig`
- `getSquare(): IsoGridSquare`
- `getUsingPlayer(): IsoPlayer`
- `getX(): float`
- `getXi(): int`
- `getY(): float`
- `getYi(): int`
- `getZ(): float`
- `getZi(): int`
- `hasComponent(ComponentType type): boolean`
- `hasComponentAny(ComponentType... types): boolean`
- `hasComponents(): boolean`
- `hasRenderers(): boolean`
- `isAddedToEngine(): boolean`
- `isEntityValid(): boolean`
- `isMeta(): boolean`
- `isOutside(): boolean`
- `isRemovingFromEngine(): boolean`
- `isScheduledForBucketUpdate(): boolean`
- `isScheduledForEngineRemoval(): boolean`
- `isUsingPlayer(IsoPlayer target): boolean`
- `isValidEngineEntity(): boolean`
- `loadEntity(ByteBuffer input, int worldVersion): void`
- `loadEntity(ByteBuffer input, int worldVersion, List<Component> loaded): void`
- `onEquip(): void`
- `onEquip(boolean register): void`
- `onFluidContainerUpdate(): void`
- `onUnEquip(): void`
- `removeFromWorld(boolean offloadEntityToMeta): void`
- `removeFromWorld(): void`
- `renderlast(): void`
- `renderlastComponents(): void`
- `requiresEntitySave(): boolean`
- `reset(): void`
- `saveEntity(ByteBuffer output): void`
- `sendRequestSyncGameEntity(): void`
- `sendSyncEntity(UdpConnection ignoreConnection): void`
- `setUsingPlayer(IsoPlayer player): void`

Static functions, called as `GameEntity.name(...)`:

- `getDefaultEntityDisplayName(): String`

Constructors: `GameEntity.new()`.

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### GameEntityFactory

`zombie.entity.GameEntityFactory`, class.

Static functions, called as `GameEntityFactory.name(...)`:

- `AddComponent(GameEntity entity, boolean replace, Component component): void`
- `AddComponent(GameEntity entity, Component component): void`
- `AddComponents(GameEntity entity, boolean replace, Component... components): void`
- `AddComponents(GameEntity entity, Component... components): void`
- `CreateEntityDebugReload(GameEntity entity, GameEntityScript script, boolean isFirstTimeCreated): void`
- `CreateInventoryItemEntity(InventoryItem inventoryItem, Item itemScript, boolean isFirstTimeCreated): void`
- `CreateIsoEntityFromCellLoading(IsoObject isoObject): void`
- `CreateIsoObjectEntity(IsoObject isoObject, GameEntityScript script, boolean isFirstTimeCreated): void`
- `RemoveComponent(GameEntity entity, Component component): void`
- `RemoveComponentType(GameEntity entity, ComponentType componentType): void`
- `RemoveComponentTypes(GameEntity entity, EnumSet<ComponentType> componentTypes): void`
- `RemoveComponents(GameEntity entity, Component... components): void`
- `TransferComponent(GameEntity source, GameEntity target, ComponentType componentType): void`
- `TransferComponents(GameEntity source, GameEntity target): void`

Constructors: `GameEntityFactory.new()`.

### GameEntityType

`zombie.entity.GameEntityType`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getBits(): int`
- `getByteId(): byte`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getId(): byte`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `GameEntityType.name(...)`:

- `FromID(byte id): GameEntityType`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): GameEntityType`
- `values(): GameEntityType[]`

Enum values (read as `GameEntityType.VALUE`): `InventoryItem`, `IsoMovingObject`, `IsoObject`, `MetaEntity`, `Template`, `VehiclePart`.

### MetaTagComponent

`zombie.entity.meta.MetaTagComponent`, class. Extends [Component](#component). Also has the methods of [Component](#component) (19), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getStoredID(): long`
- `setStoredID(long storedId): void`

### MetaEntity

`zombie.entity.MetaEntity`, class. Extends [GameEntity](#gameentity). Also has the methods of [GameEntity](#gameentity) (43), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getEntityNetID(): long`
- `getGameEntityType(): GameEntityType`
- `getOriginalGameEntityType(): GameEntityType`
- `getSquare(): IsoGridSquare`
- `getUsingPlayer(): IsoPlayer`
- `getX(): float`
- `getY(): float`
- `getZ(): float`
- `isEntityValid(): boolean`
- `isMeta(): boolean`
- `isOutside(): boolean`
- `isUsingPlayer(IsoPlayer target): boolean`
- `loadMetaEntity(ByteBuffer input, int worldVersion): void`
- `reset(): void`
- `saveMetaEntity(ByteBuffer output): void`
- `setUsingPlayer(IsoPlayer player): void`

Static fields (a copy of the value taken when the class is exposed): `DEFAULT_ENTITY_DISPLAY_NAME: String`.

### Array

`zombie.entity.util.Array`, class.

Methods, called as `obj:name(...)`:

- `add(T value): void`
- `add(T value1, T value2): void`
- `add(T value1, T value2, T value3): void`
- `add(T value1, T value2, T value3, T value4): void`
- `addAll(T... array): void`
- `addAll(T[] array, int start, int count): void`
- `addAll(Array<? extends T> array): void`
- `addAll(Array<? extends T> array, int start, int count): void`
- `clear(): void`
- `contains(T value, boolean identity): boolean`
- `containsAll(Array<? extends T> values, boolean identity): boolean`
- `containsAny(Array<? extends T> values, boolean identity): boolean`
- `ensureCapacity(int additionalCapacity): T[]`
- `equals(Object object): boolean`
- `equalsIdentity(Object object): boolean`
- `first(): T`
- `forEach(Consumer<? super T>): void` from `Iterable`
- `get(int index): T`
- `hashCode(): int`
- `indexOf(T value, boolean identity): int`
- `insert(int index, T value): void`
- `insertRange(int index, int count): void`
- `isEmpty(): boolean`
- `iterator(): Array.ArrayIterator<T>`
- `lastIndexOf(T value, boolean identity): int`
- `notEmpty(): boolean`
- `peek(): T`
- `pop(): T`
- `random(): T`
- `removeAll(Array<? extends T> array, boolean identity): boolean`
- `removeIndex(int index): T`
- `removeRange(int start, int end): void`
- `removeValue(T value, boolean identity): boolean`
- `reverse(): void`
- `select(Predicate<T> predicate): Iterable<T>`
- `selectRanked(Comparator<T> comparator, int kthLowest): T`
- `selectRankedIndex(Comparator<T> comparator, int kthLowest): int`
- `set(int index, T value): void`
- `setSize(int newSize): T[]`
- `shrink(): T[]`
- `shuffle(): void`
- `sort(): void`
- `sort(Comparator<? super T> comparator): void`
- `spliterator(): Spliterator<T>` from `Iterable`
- `swap(int first, int second): void`
- `toArray(Class<V> type): V[]`
- `toArray(): T[]`
- `toString(): String`
- `toString(String separator): String`
- `truncate(int newSize): void`

Static functions, called as `Array.name(...)`:

- `of(boolean ordered, int capacity, Class<T> arrayType): Array<T>`
- `of(Class<T> arrayType): Array<T>`
- `with(T... array): Array<T>`

Constructors: `Array.new()`, `Array.new(T[] array)`, `Array.new(boolean ordered, T[] array, int start, int count)`, `Array.new(boolean ordered, int capacity)`, `Array.new(boolean ordered, int capacity, Class<?> arrayType)`, `Array.new(int)`, `Array.new(Class<?>)`, `Array.new(Array<? extends T> array)`.

### AssocArray

`zombie.entity.util.assoc.AssocArray`, class.

Methods, called as `obj:name(...)`:

- `add(K k, V v): boolean`
- `add(int frontIndex, K k, V v): void`
- `addAll(AssocArray<K, V> other): void`
- `clear(): void`
- `containsKey(K o): boolean`
- `containsValue(V o): boolean`
- `ensureCapacity(int minCapacity): void`
- `equals(Object o): boolean`
- `forEach(BiConsumer<? super K, ? super V> action): void`
- `get(K k): V`
- `getKey(int frontIndex): K`
- `getValue(int frontIndex): V`
- `hashCode(): int`
- `indexOfKey(K o): int`
- `indexOfValue(V o): int`
- `isEmpty(): boolean`
- `lastIndexOfKey(K o): int`
- `lastIndexOfValue(V o): int`
- `put(K k, V v): V`
- `putAll(AssocArray<K, V> other): void`
- `remove(K o): V`
- `removeIndex(int frontIndex): V`
- `set(K k, V v): V`
- `setAll(AssocArray<K, V> other): void`
- `size(): int`
- `trimToSize(): void`

Constructors: `AssocArray.new()`, `AssocArray.new(int initialCapacity)`.

### AssocEnumArray

`zombie.entity.util.assoc.AssocEnumArray`, class. Extends [AssocArray](#assocarray). Also has the methods of [AssocArray](#assocarray) (18), listed on their own entries.

Methods, called as `obj:name(...)`:

- `add(K k, V v): boolean`
- `add(int frontIndex, K k, V v): void`
- `clear(): void`
- `containsKey(K o): boolean`
- `equals(Object o): boolean`
- `equalsKeys(AssocEnumArray<K, V> other): boolean`
- `keys(): Iterator<K>`
- `put(K k, V v): V`
- `remove(K o): V`
- `removeIndex(int frontIndex): V`

Constructors: `AssocEnumArray.new(Class<K> enumType)`, `AssocEnumArray.new(Class<K> enumType, int initialCapacity)`.

### BitSet

`zombie.entity.util.BitSet`, class.

Methods, called as `obj:name(...)`:

- `and(BitSet other): void`
- `andNot(BitSet other): void`
- `clear(): void`
- `clear(int index): void`
- `containsAll(BitSet other): boolean`
- `equals(Object obj): boolean`
- `flip(int index): void`
- `get(int index): boolean`
- `getAndClear(int index): boolean`
- `getAndSet(int index): boolean`
- `hashCode(): int`
- `intersects(BitSet other): boolean`
- `isEmpty(): boolean`
- `length(): int`
- `nextClearBit(int fromIndex): int`
- `nextSetBit(int fromIndex): int`
- `notEmpty(): boolean`
- `numBits(): int`
- `or(BitSet other): void`
- `set(int index): void`
- `xor(BitSet other): void`

Constructors: `BitSet.new()`, `BitSet.new(int nbits)`, `BitSet.new(BitSet bitsToCpy)`.

### GameEntityUtil

`zombie.entity.util.GameEntityUtil`, class.

Static functions, called as `GameEntityUtil.name(...)`:

- `getCloseWindowDistance(): int`

Constructors: `GameEntityUtil.new()`.

Static fields (a copy of the value taken when the class is exposed): `CloseWindowDistance: int`.

### ImmutableArray

`zombie.entity.util.ImmutableArray`, class.

Methods, called as `obj:name(...)`:

- `contains(T value, boolean identity): boolean`
- `equals(Object object): boolean`
- `first(): T`
- `forEach(Consumer<? super T>): void` from `Iterable`
- `get(int index): T`
- `hashCode(): int`
- `indexOf(T value, boolean identity): int`
- `iterator(): Iterator<T>`
- `lastIndexOf(T value, boolean identity): int`
- `peek(): T`
- `random(): T`
- `size(): int`
- `spliterator(): Spliterator<T>` from `Iterable`
- `toArray(Class<V> type): V[]`
- `toArray(): T[]`
- `toString(): String`
- `toString(String separator): String`

Constructors: `ImmutableArray.new(Array<T> array)`.
