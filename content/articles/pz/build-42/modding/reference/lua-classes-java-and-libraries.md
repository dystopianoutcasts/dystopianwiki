---
slug: lua-classes-java-and-libraries
title: 'Lua Classes: Java and library classes (Build 42.21)'
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
excerpt: 'The exposed java and library classes classes of Build 42.21: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Java and library classes

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Standard Java classes (lists, maps, numbers, files) and library classes (JOML vectors, the Kahlua runtime) that the game hands to Lua.

This page holds 30 classes and 1,211 methods, from the packages `java.io`, `java.lang`, `java.lang.reflect`, `java.text`, `java.util`, `org.joml`, `org.lwjglx.input`, `se.krka.kahlua.vm`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### BufferedReader

`java.io.BufferedReader`, class. Extends `Reader`.

Methods, called as `obj:name(...)`:

- `close(): void`
- `lines(): Stream<String>`
- `mark(int): void`
- `markSupported(): boolean`
- `read(): int`
- `read(char[], int, int): int`
- `read(char[]): int` from `Reader`
- `read(CharBuffer): int` from `Reader`
- `readAllAsString(): String` from `Reader`
- `readAllLines(): List<String>` from `Reader`
- `readLine(): String`
- `ready(): boolean`
- `reset(): void`
- `skip(long): long`
- `transferTo(Writer): long` from `Reader`

Static functions, called as `BufferedReader.name(...)`:

- `nullReader(): Reader` from `Reader`
- `of(CharSequence): Reader` from `Reader`

Constructors: `BufferedReader.new(Reader)`, `BufferedReader.new(Reader, int)`.

### BufferedWriter

`java.io.BufferedWriter`, class. Extends `Writer`.

Methods, called as `obj:name(...)`:

- `append(char): Writer` from `Writer`
- `append(CharSequence): Writer` from `Writer`
- `append(CharSequence, int, int): Writer` from `Writer`
- `close(): void`
- `flush(): void`
- `newLine(): void`
- `write(char[], int, int): void`
- `write(int): void`
- `write(String, int, int): void`
- `write(char[]): void` from `Writer`
- `write(String): void` from `Writer`

Static functions, called as `BufferedWriter.name(...)`:

- `nullWriter(): Writer` from `Writer`

Constructors: `BufferedWriter.new(Writer)`, `BufferedWriter.new(Writer, int)`.

### DataInputStream

`java.io.DataInputStream`, class. Extends `FilterInputStream`.

Methods, called as `obj:name(...)`:

- `available(): int` from `FilterInputStream`
- `close(): void` from `FilterInputStream`
- `mark(int): void` from `FilterInputStream`
- `markSupported(): boolean` from `FilterInputStream`
- `read(byte[]): int`
- `read(byte[], int, int): int`
- `read(): int` from `FilterInputStream`
- `readAllBytes(): byte[]` from `InputStream`
- `readBoolean(): boolean`
- `readByte(): byte`
- `readChar(): char`
- `readDouble(): double`
- `readFloat(): float`
- `readFully(byte[]): void`
- `readFully(byte[], int, int): void`
- `readInt(): int`
- `readLine(): String`
- `readLong(): long`
- `readNBytes(int): byte[]` from `InputStream`
- `readNBytes(byte[], int, int): int` from `InputStream`
- `readShort(): short`
- `readUTF(): String`
- `readUnsignedByte(): int`
- `readUnsignedShort(): int`
- `reset(): void` from `FilterInputStream`
- `skip(long): long` from `FilterInputStream`
- `skipBytes(int): int`
- `skipNBytes(long): void` from `InputStream`
- `transferTo(OutputStream): long` from `InputStream`

Static functions, called as `DataInputStream.name(...)`:

- `nullInputStream(): InputStream` from `InputStream`
- `readUTF(DataInput): String`

Constructors: `DataInputStream.new(InputStream)`.

### DataOutputStream

`java.io.DataOutputStream`, class. Extends `FilterOutputStream`.

Methods, called as `obj:name(...)`:

- `close(): void` from `FilterOutputStream`
- `flush(): void`
- `size(): int`
- `write(byte[], int, int): void`
- `write(int): void`
- `write(byte[]): void` from `FilterOutputStream`
- `writeBoolean(boolean): void`
- `writeByte(int): void`
- `writeBytes(String): void`
- `writeChar(int): void`
- `writeChars(String): void`
- `writeDouble(double): void`
- `writeFloat(float): void`
- `writeInt(int): void`
- `writeLong(long): void`
- `writeShort(int): void`
- `writeUTF(String): void`

Static functions, called as `DataOutputStream.name(...)`:

- `nullOutputStream(): OutputStream` from `OutputStream`

Constructors: `DataOutputStream.new(OutputStream)`.

### Boolean

`java.lang.Boolean`, class.

Methods, called as `obj:name(...)`:

- `booleanValue(): boolean`
- `compareTo(Boolean): int`
- `describeConstable(): Optional<DynamicConstantDesc<Boolean>>`
- `equals(Object): boolean`
- `hashCode(): int`
- `toString(): String`

Static functions, called as `Boolean.name(...)`:

- `compare(boolean, boolean): int`
- `getBoolean(String): boolean`
- `hashCode(boolean): int`
- `logicalAnd(boolean, boolean): boolean`
- `logicalOr(boolean, boolean): boolean`
- `logicalXor(boolean, boolean): boolean`
- `parseBoolean(String): boolean`
- `toString(boolean): String`
- `valueOf(boolean): Boolean`
- `valueOf(String): Boolean`

Constructors: `Boolean.new(boolean)`, `Boolean.new(String)`.

Static fields (a copy of the value taken when the class is exposed): `FALSE: Boolean`, `TRUE: Boolean`, `TYPE: Class<Boolean>`.

### Double

`java.lang.Double`, class. Extends `Number`.

Methods, called as `obj:name(...)`:

- `byteValue(): byte`
- `compareTo(Double): int`
- `describeConstable(): Optional<Double>`
- `doubleValue(): double`
- `equals(Object): boolean`
- `floatValue(): float`
- `hashCode(): int`
- `intValue(): int`
- `isInfinite(): boolean`
- `isNaN(): boolean`
- `longValue(): long`
- `resolveConstantDesc(MethodHandles.Lookup): Double`
- `shortValue(): short`
- `toString(): String`

Static functions, called as `Double.name(...)`:

- `compare(double, double): int`
- `doubleToLongBits(double): long`
- `doubleToRawLongBits(double): long`
- `hashCode(double): int`
- `isFinite(double): boolean`
- `isInfinite(double): boolean`
- `isNaN(double): boolean`
- `longBitsToDouble(long): double`
- `max(double, double): double`
- `min(double, double): double`
- `parseDouble(String): double`
- `sum(double, double): double`
- `toHexString(double): String`
- `toString(double): String`
- `valueOf(double): Double`
- `valueOf(String): Double`

Constructors: `Double.new(double)`, `Double.new(String)`.

Static fields (a copy of the value taken when the class is exposed): `BYTES: int`, `MAX_EXPONENT: int`, `MAX_VALUE: double`, `MIN_EXPONENT: int`, `MIN_NORMAL: double`, `MIN_VALUE: double`, `NEGATIVE_INFINITY: double`, `NaN: double`, `POSITIVE_INFINITY: double`, `PRECISION: int`, `SIZE: int`, `TYPE: Class<Double>`.

### Float

`java.lang.Float`, class. Extends `Number`.

Methods, called as `obj:name(...)`:

- `byteValue(): byte`
- `compareTo(Float): int`
- `describeConstable(): Optional<Float>`
- `doubleValue(): double`
- `equals(Object): boolean`
- `floatValue(): float`
- `hashCode(): int`
- `intValue(): int`
- `isInfinite(): boolean`
- `isNaN(): boolean`
- `longValue(): long`
- `resolveConstantDesc(MethodHandles.Lookup): Float`
- `shortValue(): short`
- `toString(): String`

Static functions, called as `Float.name(...)`:

- `compare(float, float): int`
- `float16ToFloat(short): float`
- `floatToFloat16(float): short`
- `floatToIntBits(float): int`
- `floatToRawIntBits(float): int`
- `hashCode(float): int`
- `intBitsToFloat(int): float`
- `isFinite(float): boolean`
- `isInfinite(float): boolean`
- `isNaN(float): boolean`
- `max(float, float): float`
- `min(float, float): float`
- `parseFloat(String): float`
- `sum(float, float): float`
- `toHexString(float): String`
- `toString(float): String`
- `valueOf(float): Float`
- `valueOf(String): Float`

Constructors: `Float.new(double)`, `Float.new(float)`, `Float.new(String)`.

Static fields (a copy of the value taken when the class is exposed): `BYTES: int`, `MAX_EXPONENT: int`, `MAX_VALUE: float`, `MIN_EXPONENT: int`, `MIN_NORMAL: float`, `MIN_VALUE: float`, `NEGATIVE_INFINITY: float`, `NaN: float`, `POSITIVE_INFINITY: float`, `PRECISION: int`, `SIZE: int`, `TYPE: Class<Float>`.

### Integer

`java.lang.Integer`, class. Extends `Number`.

Methods, called as `obj:name(...)`:

- `byteValue(): byte`
- `compareTo(Integer): int`
- `describeConstable(): Optional<Integer>`
- `doubleValue(): double`
- `equals(Object): boolean`
- `floatValue(): float`
- `hashCode(): int`
- `intValue(): int`
- `longValue(): long`
- `resolveConstantDesc(MethodHandles.Lookup): Integer`
- `shortValue(): short`
- `toString(): String`

Static functions, called as `Integer.name(...)`:

- `bitCount(int): int`
- `compare(int, int): int`
- `compareUnsigned(int, int): int`
- `compress(int, int): int`
- `decode(String): Integer`
- `divideUnsigned(int, int): int`
- `expand(int, int): int`
- `getInteger(String): Integer`
- `getInteger(String, int): Integer`
- `getInteger(String, Integer): Integer`
- `hashCode(int): int`
- `highestOneBit(int): int`
- `lowestOneBit(int): int`
- `max(int, int): int`
- `min(int, int): int`
- `numberOfLeadingZeros(int): int`
- `numberOfTrailingZeros(int): int`
- `parseInt(CharSequence, int, int, int): int`
- `parseInt(String): int`
- `parseInt(String, int): int`
- `parseUnsignedInt(CharSequence, int, int, int): int`
- `parseUnsignedInt(String): int`
- `parseUnsignedInt(String, int): int`
- `remainderUnsigned(int, int): int`
- `reverse(int): int`
- `reverseBytes(int): int`
- `rotateLeft(int, int): int`
- `rotateRight(int, int): int`
- `signum(int): int`
- `sum(int, int): int`
- `toBinaryString(int): String`
- `toHexString(int): String`
- `toOctalString(int): String`
- `toString(int): String`
- `toString(int, int): String`
- `toUnsignedLong(int): long`
- `toUnsignedString(int): String`
- `toUnsignedString(int, int): String`
- `valueOf(int): Integer`
- `valueOf(String): Integer`
- `valueOf(String, int): Integer`

Constructors: `Integer.new(int)`, `Integer.new(String)`.

Static fields (a copy of the value taken when the class is exposed): `BYTES: int`, `MAX_VALUE: int`, `MIN_VALUE: int`, `SIZE: int`, `TYPE: Class<Integer>`.

### Long

`java.lang.Long`, class. Extends `Number`.

Methods, called as `obj:name(...)`:

- `byteValue(): byte`
- `compareTo(Long): int`
- `describeConstable(): Optional<Long>`
- `doubleValue(): double`
- `equals(Object): boolean`
- `floatValue(): float`
- `hashCode(): int`
- `intValue(): int`
- `longValue(): long`
- `resolveConstantDesc(MethodHandles.Lookup): Long`
- `shortValue(): short`
- `toString(): String`

Static functions, called as `Long.name(...)`:

- `bitCount(long): int`
- `compare(long, long): int`
- `compareUnsigned(long, long): int`
- `compress(long, long): long`
- `decode(String): Long`
- `divideUnsigned(long, long): long`
- `expand(long, long): long`
- `getLong(String): Long`
- `getLong(String, Long): Long`
- `getLong(String, long): Long`
- `hashCode(long): int`
- `highestOneBit(long): long`
- `lowestOneBit(long): long`
- `max(long, long): long`
- `min(long, long): long`
- `numberOfLeadingZeros(long): int`
- `numberOfTrailingZeros(long): int`
- `parseLong(CharSequence, int, int, int): long`
- `parseLong(String): long`
- `parseLong(String, int): long`
- `parseUnsignedLong(CharSequence, int, int, int): long`
- `parseUnsignedLong(String): long`
- `parseUnsignedLong(String, int): long`
- `remainderUnsigned(long, long): long`
- `reverse(long): long`
- `reverseBytes(long): long`
- `rotateLeft(long, int): long`
- `rotateRight(long, int): long`
- `signum(long): int`
- `sum(long, long): long`
- `toBinaryString(long): String`
- `toHexString(long): String`
- `toOctalString(long): String`
- `toString(long): String`
- `toString(long, int): String`
- `toUnsignedString(long): String`
- `toUnsignedString(long, int): String`
- `valueOf(String): Long`
- `valueOf(String, int): Long`
- `valueOf(long): Long`

Constructors: `Long.new(String)`, `Long.new(long)`.

Static fields (a copy of the value taken when the class is exposed): `BYTES: int`, `MAX_VALUE: long`, `MIN_VALUE: long`, `SIZE: int`, `TYPE: Class<Long>`.

### Math

`java.lang.Math`, class.

Static functions, called as `Math.name(...)`:

- `IEEEremainder(double, double): double`
- `abs(double): double`
- `abs(float): float`
- `abs(int): int`
- `abs(long): long`
- `absExact(int): int`
- `absExact(long): long`
- `acos(double): double`
- `addExact(int, int): int`
- `addExact(long, long): long`
- `asin(double): double`
- `atan(double): double`
- `atan2(double, double): double`
- `cbrt(double): double`
- `ceil(double): double`
- `ceilDiv(int, int): int`
- `ceilDiv(long, int): long`
- `ceilDiv(long, long): long`
- `ceilDivExact(int, int): int`
- `ceilDivExact(long, long): long`
- `ceilMod(int, int): int`
- `ceilMod(long, int): int`
- `ceilMod(long, long): long`
- `clamp(double, double, double): double`
- `clamp(float, float, float): float`
- `clamp(long, int, int): int`
- `clamp(long, long, long): long`
- `copySign(double, double): double`
- `copySign(float, float): float`
- `cos(double): double`
- `cosh(double): double`
- `decrementExact(int): int`
- `decrementExact(long): long`
- `divideExact(int, int): int`
- `divideExact(long, long): long`
- `exp(double): double`
- `expm1(double): double`
- `floor(double): double`
- `floorDiv(int, int): int`
- `floorDiv(long, int): long`
- `floorDiv(long, long): long`
- `floorDivExact(int, int): int`
- `floorDivExact(long, long): long`
- `floorMod(int, int): int`
- `floorMod(long, int): int`
- `floorMod(long, long): long`
- `fma(double, double, double): double`
- `fma(float, float, float): float`
- `getExponent(double): int`
- `getExponent(float): int`
- `hypot(double, double): double`
- `incrementExact(int): int`
- `incrementExact(long): long`
- `log(double): double`
- `log10(double): double`
- `log1p(double): double`
- `max(double, double): double`
- `max(float, float): float`
- `max(int, int): int`
- `max(long, long): long`
- `min(double, double): double`
- `min(float, float): float`
- `min(int, int): int`
- `min(long, long): long`
- `multiplyExact(int, int): int`
- `multiplyExact(long, int): long`
- `multiplyExact(long, long): long`
- `multiplyFull(int, int): long`
- `multiplyHigh(long, long): long`
- `negateExact(int): int`
- `negateExact(long): long`
- `nextAfter(double, double): double`
- `nextAfter(float, double): float`
- `nextDown(double): double`
- `nextDown(float): float`
- `nextUp(double): double`
- `nextUp(float): float`
- `pow(double, double): double`
- `powExact(int, int): int`
- `powExact(long, int): long`
- `random(): double`
- `rint(double): double`
- `round(float): int`
- `round(double): long`
- `scalb(double, int): double`
- `scalb(float, int): float`
- `signum(double): double`
- `signum(float): float`
- `sin(double): double`
- `sinh(double): double`
- `sqrt(double): double`
- `subtractExact(int, int): int`
- `subtractExact(long, long): long`
- `tan(double): double`
- `tanh(double): double`
- `toDegrees(double): double`
- `toIntExact(long): int`
- `toRadians(double): double`
- `ulp(double): double`
- `ulp(float): float`
- `unsignedMultiplyExact(int, int): int`
- `unsignedMultiplyExact(long, int): long`
- `unsignedMultiplyExact(long, long): long`
- `unsignedMultiplyHigh(long, long): long`
- `unsignedPowExact(int, int): int`
- `unsignedPowExact(long, int): long`

Static fields (a copy of the value taken when the class is exposed): `E: double`, `PI: double`, `TAU: double`.

### Field

`java.lang.reflect.Field`, class. Extends `AccessibleObject`. **Exposed only when the game runs in debug mode.**

Methods, called as `obj:name(...)`:

- `accessFlags(): Set<AccessFlag>`
- `canAccess(Object): boolean` from `AccessibleObject`
- `equals(Object): boolean`
- `get(Object): Object`
- `getAnnotatedType(): AnnotatedType`
- `getAnnotation(Class<T>): T`
- `getAnnotations(): Annotation[]` from `AccessibleObject`
- `getAnnotationsByType(Class<T>): T[]`
- `getBoolean(Object): boolean`
- `getByte(Object): byte`
- `getChar(Object): char`
- `getDeclaredAnnotation(Class<T>): T` from `AccessibleObject`
- `getDeclaredAnnotations(): Annotation[]`
- `getDeclaredAnnotationsByType(Class<T>): T[]` from `AccessibleObject`
- `getDeclaringClass(): Class<?>`
- `getDouble(Object): double`
- `getFloat(Object): float`
- `getGenericType(): Type`
- `getInt(Object): int`
- `getLong(Object): long`
- `getModifiers(): int`
- `getName(): String`
- `getShort(Object): short`
- `getType(): Class<?>`
- `hashCode(): int`
- `isAccessible(): boolean` from `AccessibleObject`
- `isAnnotationPresent(Class<? extends Annotation>): boolean` from `AccessibleObject`
- `isEnumConstant(): boolean`
- `isSynthetic(): boolean`
- `set(Object, Object): void`
- `setAccessible(boolean): void`
- `setBoolean(Object, boolean): void`
- `setByte(Object, byte): void`
- `setChar(Object, char): void`
- `setDouble(Object, double): void`
- `setFloat(Object, float): void`
- `setInt(Object, int): void`
- `setLong(Object, long): void`
- `setShort(Object, short): void`
- `toGenericString(): String`
- `toString(): String`
- `trySetAccessible(): boolean` from `AccessibleObject`

Static functions, called as `Field.name(...)`:

- `setAccessible(AccessibleObject[], boolean): void` from `AccessibleObject`

Static fields (a copy of the value taken when the class is exposed): `DECLARED: int`, `PUBLIC: int`.

### Method

`java.lang.reflect.Method`, class. Extends `Executable`. **Exposed only when the game runs in debug mode.**

Methods, called as `obj:name(...)`:

- `accessFlags(): Set<AccessFlag>` from `Executable`
- `canAccess(Object): boolean` from `AccessibleObject`
- `equals(Object): boolean`
- `getAnnotatedExceptionTypes(): AnnotatedType[]` from `Executable`
- `getAnnotatedParameterTypes(): AnnotatedType[]` from `Executable`
- `getAnnotatedReceiverType(): AnnotatedType` from `Executable`
- `getAnnotatedReturnType(): AnnotatedType`
- `getAnnotation(Class<T>): T`
- `getAnnotations(): Annotation[]` from `AccessibleObject`
- `getAnnotationsByType(Class<T>): T[]` from `Executable`
- `getDeclaredAnnotation(Class<T>): T` from `AccessibleObject`
- `getDeclaredAnnotations(): Annotation[]`
- `getDeclaredAnnotationsByType(Class<T>): T[]` from `AccessibleObject`
- `getDeclaringClass(): Class<?>`
- `getDefaultValue(): Object`
- `getExceptionTypes(): Class<?>[]`
- `getGenericExceptionTypes(): Type[]`
- `getGenericParameterTypes(): Type[]`
- `getGenericReturnType(): Type`
- `getModifiers(): int`
- `getName(): String`
- `getParameterAnnotations(): Annotation[][]`
- `getParameterCount(): int`
- `getParameterTypes(): Class<?>[]`
- `getParameters(): Parameter[]` from `Executable`
- `getReturnType(): Class<?>`
- `getTypeParameters(): TypeVariable<Method>[]`
- `hashCode(): int`
- `invoke(Object, Object...): Object`
- `isAccessible(): boolean` from `AccessibleObject`
- `isAnnotationPresent(Class<? extends Annotation>): boolean` from `AccessibleObject`
- `isBridge(): boolean`
- `isDefault(): boolean`
- `isSynthetic(): boolean`
- `isVarArgs(): boolean`
- `setAccessible(boolean): void`
- `toGenericString(): String`
- `toString(): String`
- `trySetAccessible(): boolean` from `AccessibleObject`

Static functions, called as `Method.name(...)`:

- `setAccessible(AccessibleObject[], boolean): void` from `AccessibleObject`

Static fields (a copy of the value taken when the class is exposed): `DECLARED: int`, `PUBLIC: int`.

### Void

`java.lang.Void`, class.

Static fields (a copy of the value taken when the class is exposed): `TYPE: Class<Void>`.

### SimpleDateFormat

`java.text.SimpleDateFormat`, class. Extends `DateFormat`.

Methods, called as `obj:name(...)`:

- `applyLocalizedPattern(String): void`
- `applyPattern(String): void`
- `clone(): Object`
- `equals(Object): boolean`
- `format(Date): String` from `DateFormat`
- `format(Object): String` from `Format`
- `format(Object, StringBuffer, FieldPosition): StringBuffer` from `DateFormat`
- `format(Date, StringBuffer, FieldPosition): StringBuffer`
- `formatToCharacterIterator(Object): AttributedCharacterIterator`
- `get2DigitYearStart(): Date`
- `getCalendar(): Calendar` from `DateFormat`
- `getDateFormatSymbols(): DateFormatSymbols`
- `getNumberFormat(): NumberFormat` from `DateFormat`
- `getTimeZone(): TimeZone` from `DateFormat`
- `hashCode(): int`
- `isLenient(): boolean` from `DateFormat`
- `parse(String): Date` from `DateFormat`
- `parse(String, ParsePosition): Date`
- `parseObject(String, ParsePosition): Object` from `DateFormat`
- `parseObject(String): Object` from `Format`
- `set2DigitYearStart(Date): void`
- `setCalendar(Calendar): void` from `DateFormat`
- `setDateFormatSymbols(DateFormatSymbols): void`
- `setLenient(boolean): void` from `DateFormat`
- `setNumberFormat(NumberFormat): void` from `DateFormat`
- `setTimeZone(TimeZone): void` from `DateFormat`
- `toLocalizedPattern(): String`
- `toPattern(): String`
- `toString(): String`

Static functions, called as `SimpleDateFormat.name(...)`:

- `getAvailableLocales(): Locale[]` from `DateFormat`
- `getDateInstance(): DateFormat` from `DateFormat`
- `getDateInstance(int): DateFormat` from `DateFormat`
- `getDateInstance(int, Locale): DateFormat` from `DateFormat`
- `getDateTimeInstance(): DateFormat` from `DateFormat`
- `getDateTimeInstance(int, int): DateFormat` from `DateFormat`
- `getDateTimeInstance(int, int, Locale): DateFormat` from `DateFormat`
- `getInstance(): DateFormat` from `DateFormat`
- `getTimeInstance(): DateFormat` from `DateFormat`
- `getTimeInstance(int): DateFormat` from `DateFormat`
- `getTimeInstance(int, Locale): DateFormat` from `DateFormat`

Constructors: `SimpleDateFormat.new()`, `SimpleDateFormat.new(String)`, `SimpleDateFormat.new(String, DateFormatSymbols)`, `SimpleDateFormat.new(String, Locale)`.

Static fields (a copy of the value taken when the class is exposed): `AM_PM_FIELD: int`, `DATE_FIELD: int`, `DAY_OF_WEEK_FIELD: int`, `DAY_OF_WEEK_IN_MONTH_FIELD: int`, `DAY_OF_YEAR_FIELD: int`, `DEFAULT: int`, `ERA_FIELD: int`, `FULL: int`, `HOUR0_FIELD: int`, `HOUR1_FIELD: int`, `HOUR_OF_DAY0_FIELD: int`, `HOUR_OF_DAY1_FIELD: int`, `LONG: int`, `MEDIUM: int`, `MILLISECOND_FIELD: int`, `MINUTE_FIELD: int`, `MONTH_FIELD: int`, `SECOND_FIELD: int`, `SHORT: int`, `TIMEZONE_FIELD: int`, `WEEK_OF_MONTH_FIELD: int`, `WEEK_OF_YEAR_FIELD: int`, `YEAR_FIELD: int`.

### ArrayList

`java.util.ArrayList`, class. Extends `AbstractList`. Also has the methods of [List](#list) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `add(E): boolean`
- `add(int, E): void`
- `addAll(int, Collection<? extends E>): boolean`
- `addAll(Collection<? extends E>): boolean`
- `addFirst(E): void`
- `addLast(E): void`
- `clear(): void`
- `clone(): Object`
- `contains(Object): boolean`
- `containsAll(Collection<?>): boolean` from `AbstractCollection`
- `ensureCapacity(int): void`
- `equals(Object): boolean`
- `forEach(Consumer<? super E>): void`
- `get(int): E`
- `getFirst(): E`
- `getLast(): E`
- `hashCode(): int`
- `indexOf(Object): int`
- `isEmpty(): boolean`
- `iterator(): Iterator<E>`
- `lastIndexOf(Object): int`
- `listIterator(): ListIterator<E>`
- `listIterator(int): ListIterator<E>`
- `parallelStream(): Stream<E>` from `Collection`
- `remove(int): E`
- `remove(Object): boolean`
- `removeAll(Collection<?>): boolean`
- `removeFirst(): E`
- `removeIf(Predicate<? super E>): boolean`
- `removeLast(): E`
- `replaceAll(UnaryOperator<E>): void`
- `retainAll(Collection<?>): boolean`
- `set(int, E): E`
- `size(): int`
- `sort(Comparator<? super E>): void`
- `spliterator(): Spliterator<E>`
- `stream(): Stream<E>` from `Collection`
- `subList(int, int): List<E>`
- `toArray(T[]): T[]`
- `toArray(IntFunction<T[]>): T[]` from `Collection`
- `toArray(): Object[]`
- `toString(): String` from `AbstractCollection`
- `trimToSize(): void`

Constructors: `ArrayList.new()`, `ArrayList.new(int)`, `ArrayList.new(Collection<? extends E>)`.

### EnumMap

`java.util.EnumMap`, class. Extends `AbstractMap`.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `clone(): EnumMap<K, V>`
- `compute(K, BiFunction<? super K, ? super V, ? extends V>): V` from `Map`
- `computeIfAbsent(K, Function<? super K, ? extends V>): V` from `Map`
- `computeIfPresent(K, BiFunction<? super K, ? super V, ? extends V>): V` from `Map`
- `containsKey(Object): boolean`
- `containsValue(Object): boolean`
- `entrySet(): Set<Map.Entry<K, V>>`
- `equals(Object): boolean`
- `forEach(BiConsumer<? super K, ? super V>): void` from `Map`
- `get(Object): V`
- `getOrDefault(Object, V): V` from `Map`
- `hashCode(): int`
- `isEmpty(): boolean` from `AbstractMap`
- `keySet(): Set<K>`
- `merge(K, V, BiFunction<? super V, ? super V, ? extends V>): V` from `Map`
- `put(K, V): V`
- `putAll(Map<? extends K, ? extends V>): void`
- `putIfAbsent(K, V): V` from `Map`
- `remove(Object): V`
- `remove(Object, Object): boolean` from `Map`
- `replace(K, V): V` from `Map`
- `replace(K, V, V): boolean` from `Map`
- `replaceAll(BiFunction<? super K, ? super V, ? extends V>): void` from `Map`
- `size(): int`
- `toString(): String` from `AbstractMap`
- `values(): Collection<V>`

Constructors: `EnumMap.new(Class<K>)`, `EnumMap.new(EnumMap<K, ? extends V>)`, `EnumMap.new(Map<K, ? extends V>)`.

### HashMap

`java.util.HashMap`, class. Extends `AbstractMap`.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `clone(): Object`
- `compute(K, BiFunction<? super K, ? super V, ? extends V>): V`
- `computeIfAbsent(K, Function<? super K, ? extends V>): V`
- `computeIfPresent(K, BiFunction<? super K, ? super V, ? extends V>): V`
- `containsKey(Object): boolean`
- `containsValue(Object): boolean`
- `entrySet(): Set<Map.Entry<K, V>>`
- `equals(Object): boolean` from `AbstractMap`
- `forEach(BiConsumer<? super K, ? super V>): void`
- `get(Object): V`
- `getOrDefault(Object, V): V`
- `hashCode(): int` from `AbstractMap`
- `isEmpty(): boolean`
- `keySet(): Set<K>`
- `merge(K, V, BiFunction<? super V, ? super V, ? extends V>): V`
- `put(K, V): V`
- `putAll(Map<? extends K, ? extends V>): void`
- `putIfAbsent(K, V): V`
- `remove(Object): V`
- `remove(Object, Object): boolean`
- `replace(K, V): V`
- `replace(K, V, V): boolean`
- `replaceAll(BiFunction<? super K, ? super V, ? extends V>): void`
- `size(): int`
- `toString(): String` from `AbstractMap`
- `values(): Collection<V>`

Static functions, called as `HashMap.name(...)`:

- `newHashMap(int): HashMap<K, V>`

Constructors: `HashMap.new()`, `HashMap.new(int)`, `HashMap.new(int, float)`, `HashMap.new(Map<? extends K, ? extends V>)`.

### HashSet

`java.util.HashSet`, class. Extends `AbstractSet`.

Methods, called as `obj:name(...)`:

- `add(E): boolean`
- `addAll(Collection<? extends E>): boolean` from `AbstractCollection`
- `clear(): void`
- `clone(): Object`
- `contains(Object): boolean`
- `containsAll(Collection<?>): boolean` from `AbstractCollection`
- `equals(Object): boolean` from `AbstractSet`
- `forEach(Consumer<? super T>): void` from `Iterable`
- `hashCode(): int` from `AbstractSet`
- `isEmpty(): boolean`
- `iterator(): Iterator<E>`
- `parallelStream(): Stream<E>` from `Collection`
- `remove(Object): boolean`
- `removeAll(Collection<?>): boolean` from `AbstractSet`
- `removeIf(Predicate<? super E>): boolean` from `Collection`
- `retainAll(Collection<?>): boolean` from `AbstractCollection`
- `size(): int`
- `spliterator(): Spliterator<E>`
- `stream(): Stream<E>` from `Collection`
- `toArray(T[]): T[]`
- `toArray(IntFunction<T[]>): T[]` from `Collection`
- `toArray(): Object[]`
- `toString(): String` from `AbstractCollection`

Static functions, called as `HashSet.name(...)`:

- `newHashSet(int): HashSet<T>`

Constructors: `HashSet.new()`, `HashSet.new(int)`, `HashSet.new(int, float)`, `HashSet.new(Collection<? extends E>)`.

### Iterator

`java.util.Iterator`, interface.

Methods, called as `obj:name(...)`:

- `forEachRemaining(Consumer<? super E>): void`
- `hasNext(): boolean`
- `next(): E`
- `remove(): void`

### LinkedHashMap

`java.util.LinkedHashMap`, class. Extends [HashMap](#hashmap). Also has the methods of [HashMap](#hashmap) (16), listed on their own entries.

Methods, called as `obj:name(...)`:

- `clear(): void`
- `containsValue(Object): boolean`
- `entrySet(): Set<Map.Entry<K, V>>`
- `equals(Object): boolean` from `AbstractMap`
- `firstEntry(): Map.Entry<K, V>` from `SequencedMap`
- `forEach(BiConsumer<? super K, ? super V>): void`
- `get(Object): V`
- `getOrDefault(Object, V): V`
- `hashCode(): int` from `AbstractMap`
- `keySet(): Set<K>`
- `lastEntry(): Map.Entry<K, V>` from `SequencedMap`
- `pollFirstEntry(): Map.Entry<K, V>` from `SequencedMap`
- `pollLastEntry(): Map.Entry<K, V>` from `SequencedMap`
- `putFirst(K, V): V`
- `putLast(K, V): V`
- `replaceAll(BiFunction<? super K, ? super V, ? extends V>): void`
- `reversed(): SequencedMap<K, V>`
- `sequencedEntrySet(): SequencedSet<Map.Entry<K, V>>`
- `sequencedKeySet(): SequencedSet<K>`
- `sequencedValues(): SequencedCollection<V>`
- `toString(): String` from `AbstractMap`
- `values(): Collection<V>`

Static functions, called as `LinkedHashMap.name(...)`:

- `newLinkedHashMap(int): LinkedHashMap<K, V>`

Constructors: `LinkedHashMap.new()`, `LinkedHashMap.new(int)`, `LinkedHashMap.new(int, float)`, `LinkedHashMap.new(int, float, boolean)`, `LinkedHashMap.new(Map<? extends K, ? extends V>)`.

### LinkedList

`java.util.LinkedList`, class. Extends `AbstractSequentialList`. Also has the methods of [List](#list) (2), listed on their own entries.

Methods, called as `obj:name(...)`:

- `add(E): boolean`
- `add(int, E): void`
- `addAll(int, Collection<? extends E>): boolean`
- `addAll(Collection<? extends E>): boolean`
- `addFirst(E): void`
- `addLast(E): void`
- `clear(): void`
- `clone(): Object`
- `contains(Object): boolean`
- `containsAll(Collection<?>): boolean` from `AbstractCollection`
- `descendingIterator(): Iterator<E>`
- `element(): E`
- `equals(Object): boolean` from `AbstractList`
- `forEach(Consumer<? super T>): void` from `Iterable`
- `get(int): E`
- `getFirst(): E`
- `getLast(): E`
- `hashCode(): int` from `AbstractList`
- `indexOf(Object): int`
- `isEmpty(): boolean` from `AbstractCollection`
- `iterator(): Iterator<E>` from `AbstractSequentialList`
- `lastIndexOf(Object): int`
- `listIterator(): ListIterator<E>` from `AbstractList`
- `listIterator(int): ListIterator<E>`
- `offer(E): boolean`
- `offerFirst(E): boolean`
- `offerLast(E): boolean`
- `parallelStream(): Stream<E>` from `Collection`
- `peek(): E`
- `peekFirst(): E`
- `peekLast(): E`
- `poll(): E`
- `pollFirst(): E`
- `pollLast(): E`
- `pop(): E`
- `push(E): void`
- `remove(): E`
- `remove(int): E`
- `remove(Object): boolean`
- `removeAll(Collection<?>): boolean` from `AbstractCollection`
- `removeFirst(): E`
- `removeFirstOccurrence(Object): boolean`
- `removeIf(Predicate<? super E>): boolean` from `Collection`
- `removeLast(): E`
- `removeLastOccurrence(Object): boolean`
- `retainAll(Collection<?>): boolean` from `AbstractCollection`
- `reversed(): LinkedList<E>`
- `set(int, E): E`
- `size(): int`
- `spliterator(): Spliterator<E>`
- `stream(): Stream<E>` from `Collection`
- `subList(int, int): List<E>` from `AbstractList`
- `toArray(T[]): T[]`
- `toArray(IntFunction<T[]>): T[]` from `Collection`
- `toArray(): Object[]`
- `toString(): String` from `AbstractCollection`

Constructors: `LinkedList.new()`, `LinkedList.new(Collection<? extends E>)`.

### List

`java.util.List`, interface.

Methods, called as `obj:name(...)`:

- `add(E): boolean`
- `add(int, E): void`
- `addAll(int, Collection<? extends E>): boolean`
- `addAll(Collection<? extends E>): boolean`
- `addFirst(E): void`
- `addLast(E): void`
- `clear(): void`
- `contains(Object): boolean`
- `containsAll(Collection<?>): boolean`
- `equals(Object): boolean`
- `forEach(Consumer<? super T>): void` from `Iterable`
- `get(int): E`
- `getFirst(): E`
- `getLast(): E`
- `hashCode(): int`
- `indexOf(Object): int`
- `isEmpty(): boolean`
- `iterator(): Iterator<E>`
- `lastIndexOf(Object): int`
- `listIterator(): ListIterator<E>`
- `listIterator(int): ListIterator<E>`
- `parallelStream(): Stream<E>` from `Collection`
- `remove(int): E`
- `remove(Object): boolean`
- `removeAll(Collection<?>): boolean`
- `removeFirst(): E`
- `removeIf(Predicate<? super E>): boolean` from `Collection`
- `removeLast(): E`
- `replaceAll(UnaryOperator<E>): void`
- `retainAll(Collection<?>): boolean`
- `reversed(): List<E>`
- `set(int, E): E`
- `size(): int`
- `sort(Comparator<? super E>): void`
- `spliterator(): Spliterator<E>`
- `stream(): Stream<E>` from `Collection`
- `subList(int, int): List<E>`
- `toArray(T[]): T[]`
- `toArray(): Object[]`
- `toArray(IntFunction<T[]>): T[]` from `Collection`

Static functions, called as `List.name(...)`:

- `copyOf(Collection<? extends E>): List<E>`
- `of(): List<E>`
- `of(E): List<E>`
- `of(E, E): List<E>`
- `of(E, E, E): List<E>`
- `of(E, E, E, E): List<E>`
- `of(E, E, E, E, E): List<E>`
- `of(E, E, E, E, E, E): List<E>`
- `of(E, E, E, E, E, E, E): List<E>`
- `of(E, E, E, E, E, E, E, E): List<E>`
- `of(E, E, E, E, E, E, E, E, E): List<E>`
- `of(E, E, E, E, E, E, E, E, E, E): List<E>`
- `of(E...): List<E>`

### Locale

`java.util.Locale`, class.

Methods, called as `obj:name(...)`:

- `clone(): Object`
- `equals(Object): boolean`
- `getCountry(): String`
- `getDisplayCountry(): String`
- `getDisplayCountry(Locale): String`
- `getDisplayLanguage(): String`
- `getDisplayLanguage(Locale): String`
- `getDisplayName(): String`
- `getDisplayName(Locale): String`
- `getDisplayScript(): String`
- `getDisplayScript(Locale): String`
- `getDisplayVariant(): String`
- `getDisplayVariant(Locale): String`
- `getExtension(char): String`
- `getExtensionKeys(): Set<Character>`
- `getISO3Country(): String`
- `getISO3Language(): String`
- `getLanguage(): String`
- `getScript(): String`
- `getUnicodeLocaleAttributes(): Set<String>`
- `getUnicodeLocaleKeys(): Set<String>`
- `getUnicodeLocaleType(String): String`
- `getVariant(): String`
- `hasExtensions(): boolean`
- `hashCode(): int`
- `stripExtensions(): Locale`
- `toLanguageTag(): String`
- `toString(): String`

Static functions, called as `Locale.name(...)`:

- `availableLocales(): Stream<Locale>`
- `caseFoldLanguageTag(String): String`
- `filter(List<Locale.LanguageRange>, Collection<Locale>): List<Locale>`
- `filter(List<Locale.LanguageRange>, Collection<Locale>, Locale.FilteringMode): List<Locale>`
- `filterTags(List<Locale.LanguageRange>, Collection<String>): List<String>`
- `filterTags(List<Locale.LanguageRange>, Collection<String>, Locale.FilteringMode): List<String>`
- `forLanguageTag(String): Locale`
- `getAvailableLocales(): Locale[]`
- `getDefault(): Locale`
- `getDefault(Locale.Category): Locale`
- `getISOCountries(): String[]`
- `getISOCountries(Locale.IsoCountryCode): Set<String>`
- `getISOLanguages(): String[]`
- `lookup(List<Locale.LanguageRange>, Collection<Locale>): Locale`
- `lookupTag(List<Locale.LanguageRange>, Collection<String>): String`
- `of(String): Locale`
- `of(String, String): Locale`
- `of(String, String, String): Locale`
- `setDefault(Locale.Category, Locale): void`
- `setDefault(Locale): void`

Constructors: `Locale.new(String)`, `Locale.new(String, String)`, `Locale.new(String, String, String)`.

Static fields (a copy of the value taken when the class is exposed): `CANADA: Locale`, `CANADA_FRENCH: Locale`, `CHINA: Locale`, `CHINESE: Locale`, `ENGLISH: Locale`, `FRANCE: Locale`, `FRENCH: Locale`, `GERMAN: Locale`, `GERMANY: Locale`, `ITALIAN: Locale`, `ITALY: Locale`, `JAPAN: Locale`, `JAPANESE: Locale`, `KOREA: Locale`, `KOREAN: Locale`, `PRC: Locale`, `PRIVATE_USE_EXTENSION: char`, `ROOT: Locale`, `SIMPLIFIED_CHINESE: Locale`, `TAIWAN: Locale`, `TRADITIONAL_CHINESE: Locale`, `UK: Locale`, `UNICODE_LOCALE_EXTENSION: char`, `US: Locale`.

### Stack

`java.util.Stack`, class. Extends [Vector](#vector). Also has the methods of [List](#list) (7), [Vector](#vector) (49), listed on their own entries.

Methods, called as `obj:name(...)`:

- `empty(): boolean`
- `parallelStream(): Stream<E>` from `Collection`
- `peek(): E`
- `pop(): E`
- `push(E): E`
- `search(Object): int`
- `stream(): Stream<E>` from `Collection`
- `toArray(IntFunction<T[]>): T[]` from `Collection`

Constructors: `Stack.new()`.

### Vector

`java.util.Vector`, class. Extends `AbstractList`. Also has the methods of [List](#list) (7), listed on their own entries.

Methods, called as `obj:name(...)`:

- `add(E): boolean`
- `add(int, E): void`
- `addAll(Collection<? extends E>): boolean`
- `addAll(int, Collection<? extends E>): boolean`
- `addElement(E): void`
- `capacity(): int`
- `clear(): void`
- `clone(): Object`
- `contains(Object): boolean`
- `containsAll(Collection<?>): boolean`
- `copyInto(Object[]): void`
- `elementAt(int): E`
- `elements(): Enumeration<E>`
- `ensureCapacity(int): void`
- `equals(Object): boolean`
- `firstElement(): E`
- `forEach(Consumer<? super E>): void`
- `get(int): E`
- `hashCode(): int`
- `indexOf(Object): int`
- `indexOf(Object, int): int`
- `insertElementAt(E, int): void`
- `isEmpty(): boolean`
- `iterator(): Iterator<E>`
- `lastElement(): E`
- `lastIndexOf(Object): int`
- `lastIndexOf(Object, int): int`
- `listIterator(): ListIterator<E>`
- `listIterator(int): ListIterator<E>`
- `parallelStream(): Stream<E>` from `Collection`
- `remove(Object): boolean`
- `remove(int): E`
- `removeAll(Collection<?>): boolean`
- `removeAllElements(): void`
- `removeElement(Object): boolean`
- `removeElementAt(int): void`
- `removeIf(Predicate<? super E>): boolean`
- `replaceAll(UnaryOperator<E>): void`
- `retainAll(Collection<?>): boolean`
- `set(int, E): E`
- `setElementAt(E, int): void`
- `setSize(int): void`
- `size(): int`
- `sort(Comparator<? super E>): void`
- `spliterator(): Spliterator<E>`
- `stream(): Stream<E>` from `Collection`
- `subList(int, int): List<E>`
- `toArray(IntFunction<T[]>): T[]` from `Collection`
- `toArray(T[]): T[]`
- `toArray(): Object[]`
- `toString(): String`
- `trimToSize(): void`

Constructors: `Vector.new()`, `Vector.new(int)`, `Vector.new(int, int)`, `Vector.new(Collection<? extends E>)`.

### Vector2f

`org.joml.Vector2f`, class.

Methods, called as `obj:name(...)`:

- `absolute(): Vector2f`
- `absolute(Vector2f): Vector2f`
- `add(float, float): Vector2f`
- `add(float, float, Vector2f): Vector2f`
- `add(Vector2fc): Vector2f`
- `add(Vector2fc, Vector2f): Vector2f`
- `angle(Vector2fc): float`
- `ceil(): Vector2f`
- `ceil(Vector2f): Vector2f`
- `distance(float, float): float`
- `distance(Vector2fc): float`
- `distanceSquared(float, float): float`
- `distanceSquared(Vector2fc): float`
- `div(float): Vector2f`
- `div(float, float): Vector2f`
- `div(float, float, Vector2f): Vector2f`
- `div(float, Vector2f): Vector2f`
- `div(Vector2fc): Vector2f`
- `div(Vector2fc, Vector2f): Vector2f`
- `dot(Vector2fc): float`
- `equals(float, float): boolean`
- `equals(Object): boolean`
- `equals(Vector2fc, float): boolean`
- `floor(): Vector2f`
- `floor(Vector2f): Vector2f`
- `fma(float, Vector2fc): Vector2f`
- `fma(float, Vector2fc, Vector2f): Vector2f`
- `fma(Vector2fc, Vector2fc): Vector2f`
- `fma(Vector2fc, Vector2fc, Vector2f): Vector2f`
- `get(int): float`
- `get(int, ByteBuffer): ByteBuffer`
- `get(ByteBuffer): ByteBuffer`
- `get(int, FloatBuffer): FloatBuffer`
- `get(FloatBuffer): FloatBuffer`
- `get(Vector2d): Vector2d`
- `get(Vector2f): Vector2f`
- `get(int, Vector2i): Vector2i`
- `getToAddress(long): Vector2fc`
- `hashCode(): int`
- `isFinite(): boolean`
- `length(): float`
- `lengthSquared(): float`
- `lerp(Vector2fc, float): Vector2f`
- `lerp(Vector2fc, float, Vector2f): Vector2f`
- `max(Vector2fc): Vector2f`
- `max(Vector2fc, Vector2f): Vector2f`
- `maxComponent(): int`
- `min(Vector2fc): Vector2f`
- `min(Vector2fc, Vector2f): Vector2f`
- `minComponent(): int`
- `mul(float): Vector2f`
- `mul(float, float): Vector2f`
- `mul(float, float, Vector2f): Vector2f`
- `mul(float, Vector2f): Vector2f`
- `mul(Matrix2dc): Vector2f`
- `mul(Matrix2dc, Vector2f): Vector2f`
- `mul(Matrix2fc): Vector2f`
- `mul(Matrix2fc, Vector2f): Vector2f`
- `mul(Vector2fc): Vector2f`
- `mul(Vector2fc, Vector2f): Vector2f`
- `mulDirection(Matrix3x2fc): Vector2f`
- `mulDirection(Matrix3x2fc, Vector2f): Vector2f`
- `mulPosition(Matrix3x2fc): Vector2f`
- `mulPosition(Matrix3x2fc, Vector2f): Vector2f`
- `mulTranspose(Matrix2fc): Vector2f`
- `mulTranspose(Matrix2fc, Vector2f): Vector2f`
- `negate(): Vector2f`
- `negate(Vector2f): Vector2f`
- `normalize(): Vector2f`
- `normalize(float): Vector2f`
- `normalize(float, Vector2f): Vector2f`
- `normalize(Vector2f): Vector2f`
- `perpendicular(): Vector2f`
- `readExternal(ObjectInput): void`
- `round(): Vector2f`
- `round(Vector2f): Vector2f`
- `set(double): Vector2f`
- `set(double, double): Vector2f`
- `set(float): Vector2f`
- `set(float, float): Vector2f`
- `set(float[]): Vector2f`
- `set(int, ByteBuffer): Vector2f`
- `set(int, FloatBuffer): Vector2f`
- `set(ByteBuffer): Vector2f`
- `set(FloatBuffer): Vector2f`
- `set(Vector2dc): Vector2f`
- `set(Vector2fc): Vector2f`
- `set(Vector2ic): Vector2f`
- `setComponent(int, float): Vector2f`
- `setFromAddress(long): Vector2f`
- `sub(float, float): Vector2f`
- `sub(float, float, Vector2f): Vector2f`
- `sub(Vector2fc): Vector2f`
- `sub(Vector2fc, Vector2f): Vector2f`
- `toString(): String`
- `toString(NumberFormat): String`
- `writeExternal(ObjectOutput): void`
- `x(): float`
- `y(): float`
- `zero(): Vector2f`

Static functions, called as `Vector2f.name(...)`:

- `distance(float, float, float, float): float`
- `distanceSquared(float, float, float, float): float`
- `length(float, float): float`
- `lengthSquared(float, float): float`

Constructors: `Vector2f.new()`, `Vector2f.new(float)`, `Vector2f.new(float, float)`, `Vector2f.new(float[])`, `Vector2f.new(int, ByteBuffer)`, `Vector2f.new(int, FloatBuffer)`, `Vector2f.new(ByteBuffer)`, `Vector2f.new(FloatBuffer)`, `Vector2f.new(Vector2fc)`, `Vector2f.new(Vector2ic)`.

### Vector3f

`org.joml.Vector3f`, class.

Methods, called as `obj:name(...)`:

- `absolute(): Vector3f`
- `absolute(Vector3f): Vector3f`
- `add(float, float, float): Vector3f`
- `add(float, float, float, Vector3f): Vector3f`
- `add(Vector3fc): Vector3f`
- `add(Vector3fc, Vector3f): Vector3f`
- `angle(Vector3fc): float`
- `angleCos(Vector3fc): float`
- `angleSigned(float, float, float, float, float, float): float`
- `angleSigned(Vector3fc, Vector3fc): float`
- `ceil(): Vector3f`
- `ceil(Vector3f): Vector3f`
- `cross(float, float, float): Vector3f`
- `cross(float, float, float, Vector3f): Vector3f`
- `cross(Vector3fc): Vector3f`
- `cross(Vector3fc, Vector3f): Vector3f`
- `distance(float, float, float): float`
- `distance(Vector3fc): float`
- `distanceSquared(float, float, float): float`
- `distanceSquared(Vector3fc): float`
- `div(float): Vector3f`
- `div(float, float, float): Vector3f`
- `div(float, float, float, Vector3f): Vector3f`
- `div(float, Vector3f): Vector3f`
- `div(Vector3fc): Vector3f`
- `div(Vector3fc, Vector3f): Vector3f`
- `dot(float, float, float): float`
- `dot(Vector3fc): float`
- `equals(float, float, float): boolean`
- `equals(Object): boolean`
- `equals(Vector3fc, float): boolean`
- `floor(): Vector3f`
- `floor(Vector3f): Vector3f`
- `fma(float, Vector3fc): Vector3f`
- `fma(float, Vector3fc, Vector3f): Vector3f`
- `fma(Vector3fc, Vector3fc): Vector3f`
- `fma(Vector3fc, Vector3fc, Vector3f): Vector3f`
- `get(int): float`
- `get(int, ByteBuffer): ByteBuffer`
- `get(ByteBuffer): ByteBuffer`
- `get(int, FloatBuffer): FloatBuffer`
- `get(FloatBuffer): FloatBuffer`
- `get(Vector3d): Vector3d`
- `get(Vector3f): Vector3f`
- `get(int, Vector3i): Vector3i`
- `getToAddress(long): Vector3fc`
- `half(float, float, float): Vector3f`
- `half(float, float, float, Vector3f): Vector3f`
- `half(Vector3fc): Vector3f`
- `half(Vector3fc, Vector3f): Vector3f`
- `hashCode(): int`
- `hermite(Vector3fc, Vector3fc, Vector3fc, float, Vector3f): Vector3f`
- `isFinite(): boolean`
- `length(): float`
- `lengthSquared(): float`
- `lerp(Vector3fc, float): Vector3f`
- `lerp(Vector3fc, float, Vector3f): Vector3f`
- `max(Vector3fc): Vector3f`
- `max(Vector3fc, Vector3f): Vector3f`
- `maxComponent(): int`
- `min(Vector3fc): Vector3f`
- `min(Vector3fc, Vector3f): Vector3f`
- `minComponent(): int`
- `mul(float): Vector3f`
- `mul(float, float, float): Vector3f`
- `mul(float, float, float, Vector3f): Vector3f`
- `mul(float, Vector3f): Vector3f`
- `mul(Matrix3dc): Vector3f`
- `mul(Matrix3dc, Vector3f): Vector3f`
- `mul(Matrix3fc): Vector3f`
- `mul(Matrix3fc, Vector3f): Vector3f`
- `mul(Matrix3x2fc): Vector3f`
- `mul(Matrix3x2fc, Vector3f): Vector3f`
- `mul(Vector3fc): Vector3f`
- `mul(Vector3fc, Vector3f): Vector3f`
- `mulAdd(float, Vector3fc): Vector3f`
- `mulAdd(float, Vector3fc, Vector3f): Vector3f`
- `mulAdd(Vector3fc, Vector3fc): Vector3f`
- `mulAdd(Vector3fc, Vector3fc, Vector3f): Vector3f`
- `mulDirection(Matrix4dc): Vector3f`
- `mulDirection(Matrix4dc, Vector3f): Vector3f`
- `mulDirection(Matrix4fc): Vector3f`
- `mulDirection(Matrix4fc, Vector3f): Vector3f`
- `mulDirection(Matrix4x3fc): Vector3f`
- `mulDirection(Matrix4x3fc, Vector3f): Vector3f`
- `mulPosition(Matrix4fc): Vector3f`
- `mulPosition(Matrix4fc, Vector3f): Vector3f`
- `mulPosition(Matrix4x3fc): Vector3f`
- `mulPosition(Matrix4x3fc, Vector3f): Vector3f`
- `mulPositionW(Matrix4fc): float`
- `mulPositionW(Matrix4fc, Vector3f): float`
- `mulProject(Matrix4fc): Vector3f`
- `mulProject(Matrix4fc, float, Vector3f): Vector3f`
- `mulProject(Matrix4fc, Vector3f): Vector3f`
- `mulTranspose(Matrix3fc): Vector3f`
- `mulTranspose(Matrix3fc, Vector3f): Vector3f`
- `mulTransposeDirection(Matrix4fc): Vector3f`
- `mulTransposeDirection(Matrix4fc, Vector3f): Vector3f`
- `mulTransposePosition(Matrix4fc): Vector3f`
- `mulTransposePosition(Matrix4fc, Vector3f): Vector3f`
- `negate(): Vector3f`
- `negate(Vector3f): Vector3f`
- `normalize(): Vector3f`
- `normalize(float): Vector3f`
- `normalize(float, Vector3f): Vector3f`
- `normalize(Vector3f): Vector3f`
- `orthogonalize(Vector3fc): Vector3f`
- `orthogonalize(Vector3fc, Vector3f): Vector3f`
- `orthogonalizeUnit(Vector3fc): Vector3f`
- `orthogonalizeUnit(Vector3fc, Vector3f): Vector3f`
- `readExternal(ObjectInput): void`
- `reflect(float, float, float): Vector3f`
- `reflect(float, float, float, Vector3f): Vector3f`
- `reflect(Vector3fc): Vector3f`
- `reflect(Vector3fc, Vector3f): Vector3f`
- `rotate(Quaternionfc): Vector3f`
- `rotate(Quaternionfc, Vector3f): Vector3f`
- `rotateAxis(float, float, float, float): Vector3f`
- `rotateAxis(float, float, float, float, Vector3f): Vector3f`
- `rotateX(float): Vector3f`
- `rotateX(float, Vector3f): Vector3f`
- `rotateY(float): Vector3f`
- `rotateY(float, Vector3f): Vector3f`
- `rotateZ(float): Vector3f`
- `rotateZ(float, Vector3f): Vector3f`
- `rotationTo(float, float, float, Quaternionf): Quaternionf`
- `rotationTo(Vector3fc, Quaternionf): Quaternionf`
- `round(): Vector3f`
- `round(Vector3f): Vector3f`
- `set(double): Vector3f`
- `set(double, double, double): Vector3f`
- `set(float): Vector3f`
- `set(float, float, float): Vector3f`
- `set(float[]): Vector3f`
- `set(int, ByteBuffer): Vector3f`
- `set(int, FloatBuffer): Vector3f`
- `set(ByteBuffer): Vector3f`
- `set(FloatBuffer): Vector3f`
- `set(Vector2dc, float): Vector3f`
- `set(Vector2fc, float): Vector3f`
- `set(Vector2ic, float): Vector3f`
- `set(Vector3dc): Vector3f`
- `set(Vector3fc): Vector3f`
- `set(Vector3ic): Vector3f`
- `setComponent(int, float): Vector3f`
- `setFromAddress(long): Vector3f`
- `smoothStep(Vector3fc, float, Vector3f): Vector3f`
- `sub(float, float, float): Vector3f`
- `sub(float, float, float, Vector3f): Vector3f`
- `sub(Vector3fc): Vector3f`
- `sub(Vector3fc, Vector3f): Vector3f`
- `toString(): String`
- `toString(NumberFormat): String`
- `writeExternal(ObjectOutput): void`
- `x(): float`
- `y(): float`
- `z(): float`
- `zero(): Vector3f`

Static functions, called as `Vector3f.name(...)`:

- `distance(float, float, float, float, float, float): float`
- `distanceSquared(float, float, float, float, float, float): float`
- `length(float, float, float): float`
- `lengthSquared(float, float, float): float`

Constructors: `Vector3f.new()`, `Vector3f.new(float)`, `Vector3f.new(float, float, float)`, `Vector3f.new(float[])`, `Vector3f.new(int, ByteBuffer)`, `Vector3f.new(int, FloatBuffer)`, `Vector3f.new(ByteBuffer)`, `Vector3f.new(FloatBuffer)`, `Vector3f.new(Vector2fc, float)`, `Vector3f.new(Vector2ic, float)`, `Vector3f.new(Vector3fc)`, `Vector3f.new(Vector3ic)`.

### Keyboard

`org.lwjglx.input.Keyboard`, class.

Static functions, called as `Keyboard.name(...)`:

- `addCharEvent(char): void`
- `addKeyEvent(int, int): void`
- `areRepeatEventsEnabled(): boolean`
- `create(): void`
- `destroy(): void`
- `enableRepeatEvents(boolean): void`
- `getEventCharacter(): char`
- `getEventKey(): int`
- `getEventKeyState(): boolean`
- `getEventNanoseconds(): long`
- `getKeyIndex(String): int`
- `getKeyName(int): String`
- `initKeyNames(): void`
- `isCreated(): boolean`
- `isKeyDown(int): boolean`
- `isRepeatEvent(): boolean`
- `next(): boolean`
- `poll(): void`

Constructors: `Keyboard.new()`.

Static fields (a copy of the value taken when the class is exposed): `CHAR_NONE: int`, `KEYBOARD_SIZE: int`, `KEY_0: int`, `KEY_1: int`, `KEY_2: int`, `KEY_3: int`, `KEY_4: int`, `KEY_5: int`, `KEY_6: int`, `KEY_7: int`, `KEY_8: int`, `KEY_9: int`, `KEY_A: int`, `KEY_ADD: int`, `KEY_APOSTROPHE: int`, `KEY_APPS: int`, `KEY_AT: int`, `KEY_AX: int`, `KEY_B: int`, `KEY_BACK: int`, `KEY_BACKSLASH: int`, `KEY_C: int`, `KEY_CAPITAL: int`, `KEY_CIRCUMFLEX: int`, `KEY_CLEAR: int`, `KEY_COLON: int`, `KEY_COMMA: int`, `KEY_CONVERT: int`, `KEY_D: int`, `KEY_DECIMAL: int`, `KEY_DELETE: int`, `KEY_DIVIDE: int`, `KEY_DOWN: int`, `KEY_E: int`, `KEY_END: int`, `KEY_EQUALS: int`, `KEY_ESCAPE: int`, `KEY_F: int`, `KEY_F1: int`, `KEY_F10: int`, `KEY_F11: int`, `KEY_F12: int`, `KEY_F13: int`, `KEY_F14: int`, `KEY_F15: int`, `KEY_F16: int`, `KEY_F17: int`, `KEY_F18: int`, `KEY_F19: int`, `KEY_F2: int`, `KEY_F3: int`, `KEY_F4: int`, `KEY_F5: int`, `KEY_F6: int`, `KEY_F7: int`, `KEY_F8: int`, `KEY_F9: int`, `KEY_FUNCTION: int`, `KEY_G: int`, `KEY_GRAVE: int`, `KEY_H: int`, `KEY_HOME: int`, `KEY_I: int`, `KEY_INSERT: int`, `KEY_J: int`, `KEY_K: int`, `KEY_KANA: int`, `KEY_KANJI: int`, `KEY_L: int`, `KEY_LBRACKET: int`, `KEY_LCONTROL: int`, `KEY_LEFT: int`, `KEY_LMENU: int`, `KEY_LMETA: int`, `KEY_LSHIFT: int`, `KEY_LWIN: int`, `KEY_M: int`, `KEY_MINUS: int`, `KEY_MULTIPLY: int`, `KEY_N: int`, `KEY_NEXT: int`, `KEY_NOCONVERT: int`, `KEY_NONE: int`, `KEY_NUMLOCK: int`, `KEY_NUMPAD0: int`, `KEY_NUMPAD1: int`, `KEY_NUMPAD2: int`, `KEY_NUMPAD3: int`, `KEY_NUMPAD4: int`, `KEY_NUMPAD5: int`, `KEY_NUMPAD6: int`, `KEY_NUMPAD7: int`, `KEY_NUMPAD8: int`, `KEY_NUMPAD9: int`, `KEY_NUMPADCOMMA: int`, `KEY_NUMPADENTER: int`, `KEY_NUMPADEQUALS: int`, `KEY_O: int`, `KEY_P: int`, `KEY_PAUSE: int`, `KEY_PERIOD: int`, `KEY_POWER: int`, `KEY_PRIOR: int`, `KEY_Q: int`, `KEY_R: int`, `KEY_RBRACKET: int`, `KEY_RCONTROL: int`, `KEY_RETURN: int`, `KEY_RIGHT: int`, `KEY_RMENU: int`, `KEY_RMETA: int`, `KEY_RSHIFT: int`, `KEY_RWIN: int`, `KEY_S: int`, `KEY_SCROLL: int`, `KEY_SECTION: int`, `KEY_SEMICOLON: int`, `KEY_SLASH: int`, `KEY_SLEEP: int`, `KEY_SPACE: int`, `KEY_STOP: int`, `KEY_SUBTRACT: int`, `KEY_SYSRQ: int`, `KEY_T: int`, `KEY_TAB: int`, `KEY_U: int`, `KEY_UNDERLINE: int`, `KEY_UNLABELED: int`, `KEY_UP: int`, `KEY_V: int`, `KEY_W: int`, `KEY_X: int`, `KEY_Y: int`, `KEY_YEN: int`, `KEY_Z: int`.

### Coroutine

`se.krka.kahlua.vm.Coroutine`, class. **Exposed only when the game runs in debug mode.**

Methods, called as `obj:name(...)`:

- `addStackTrace(LuaCallFrame): void`
- `atBottom(): boolean`
- `cleanCallFrames(LuaCallFrame): void`
- `closeUpvalues(int): void`
- `currentCallFrame(): LuaCallFrame`
- `destroy(): void`
- `findUpvalue(int): UpValue`
- `getCallFrame(int): LuaCallFrame`
- `getCallframeStack(): LuaCallFrame[]`
- `getCallframeTop(): int`
- `getCurrentStackTrace(int, int, int): String`
- `getObjectFromStack(int): Object`
- `getObjectStackSize(): int`
- `getParent(): Coroutine`
- `getParent(int): LuaCallFrame`
- `getParentCallframe(): LuaCallFrame`
- `getParentNoAssert(int): LuaCallFrame`
- `getPlatform(): Platform`
- `getStatus(): String`
- `getThread(): KahluaThread`
- `getTop(): int`
- `isDead(): boolean`
- `popCallFrame(): void`
- `pushNewCallFrame(LuaClosure, JavaFunction, int, int, int, boolean, boolean): LuaCallFrame`
- `resume(Coroutine): void`
- `setCallFrameStackTop(int): void`
- `setTop(int): void`
- `stackClear(int, int): void`
- `stackCopy(int, int, int): void`
- `stackCopyNoDebugStuff(int, int, int): void`

Static functions, called as `Coroutine.name(...)`:

- `yieldHelper(LuaCallFrame, LuaCallFrame, int): void`

Constructors: `Coroutine.new()`, `Coroutine.new(Platform, KahluaTable)`, `Coroutine.new(Platform, KahluaTable, KahluaThread)`.

### KahluaUtil

`se.krka.kahlua.vm.KahluaUtil`, class.

Static functions, called as `KahluaUtil.name(...)`:

- `assertArgNotNull(Object, int, String, String): void`
- `boolEval(Object): boolean`
- `fail(String): void`
- `fromDouble(Object): double`
- `getArg(LuaCallFrame, int, String): Object`
- `getClassMetatables(Platform, KahluaTable): KahluaTable`
- `getDoubleArg(LuaCallFrame, int, String): double`
- `getNumberArg(LuaCallFrame, int, String): Double`
- `getOptionalArg(LuaCallFrame, int): Object`
- `getOptionalNumberArg(LuaCallFrame, int): Double`
- `getOptionalStringArg(LuaCallFrame, int): String`
- `getOrCreateTable(Platform, KahluaTable, String): KahluaTable`
- `getStringArg(LuaCallFrame, int, String): String`
- `getWorkerThread(Platform, KahluaTable): KahluaThread`
- `identityHashCode(Object): String`
- `ipow(long, int): long`
- `isFunction(Object): boolean`
- `isNegative(double): boolean`
- `isTable(Object): boolean`
- `isUserdata(Object): boolean`
- `len(KahluaTable, int, int): int`
- `loadByteCodeFromFile(File, KahluaTable): LuaClosure`
- `loadByteCodeFromResource(String, KahluaTable): LuaClosure`
- `luaAssert(boolean, String): void`
- `numberToString(Double): String`
- `rawToStackTraceElement(Object): StackTraceElement`
- `rawTonumber(Object): Double`
- `rawTostring(Object): String`
- `rawTostring2(Object): String`
- `round(double): double`
- `setWorkerThread(KahluaTable, KahluaThread): void`
- `setupLibrary(KahluaTable, KahluaThread, File): void`
- `setupLibraryText(KahluaTable, KahluaThread, File): void`
- `toBoolean(boolean): Boolean`
- `toDouble(double): Double`
- `toDouble(long): Double`
- `tonumber(String): Double`
- `tonumber(String, int): Double`
- `tostring(Object, KahluaThread): String`
- `type(Object): String`

Constructors: `KahluaUtil.new()`.
