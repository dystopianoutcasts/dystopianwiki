---
slug: lua-classes-ui-and-input
title: 'Lua Classes: UI and input (Build 42.21)'
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
excerpt: 'The exposed ui and input classes of Build 42.21: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: UI and input

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

The Java side of the user interface (the elements vanilla Lua builds its windows from), fonts and text, keyboard, mouse and controllers.

This page holds 39 classes and 955 methods, from the packages `zombie.gizmo`, `zombie.input`, `zombie.text.templating`, `zombie.ui`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 42.21 (revision 4a0e9546ec).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### Gizmos

`zombie.gizmo.Gizmos`, class.

Methods, called as `obj:name(...)`:

- `getGizmo(int playerIndex): Gizmo`
- `getRotateGizmo(int playerIndex): Gizmo`
- `getTranslateGizmo(int playerIndex): Gizmo`
- `hitTest(int mouseX, int mouseY): boolean`
- `isTrackingMouse(): boolean`
- `render(int playerIndex): void`
- `setGizmo(int playerIndex, Gizmo gizmo): void`

Static functions, called as `Gizmos.name(...)`:

- `getInstance(): Gizmos`

### RotateGizmo

`zombie.gizmo.RotateGizmo`, class. Extends `Gizmo`.

Methods, called as `obj:name(...)`:

- `getChild(): SceneObject` from `Gizmo`
- `getOrigin(): SceneObject` from `Gizmo`
- `getParent(): SceneObject` from `Gizmo`
- `getRotation(): Vector3f` from `Gizmo`
- `getScale(): float` from `Gizmo`
- `getTable(): KahluaTable` from `Gizmo`
- `getTransformMode(): TransformMode` from `Gizmo`
- `getWorldPosition(): Vector3f` from `Gizmo`
- `isVisible(): boolean` from `Gizmo`
- `setRotation(float rx, float ry, float rz): void` from `Gizmo`
- `setTable(KahluaTable table): void` from `Gizmo`
- `setTransformMode(TransformMode mode): void` from `Gizmo`
- `setVisible(boolean visible): void` from `Gizmo`
- `setWorldPosition(float x, float y, float z): void` from `Gizmo`

Static functions, called as `RotateGizmo.name(...)`:

- `releaseRay(UI3DScene.Ray ray): void` from `Gizmo`

### TransformMode

`zombie.gizmo.TransformMode`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `TransformMode.name(...)`:

- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): TransformMode`
- `values(): TransformMode[]`

Enum values (read as `TransformMode.VALUE`): `Global`, `Local`.

### TranslateGizmo

`zombie.gizmo.TranslateGizmo`, class. Extends `Gizmo`.

Methods, called as `obj:name(...)`:

- `getChild(): SceneObject` from `Gizmo`
- `getOrigin(): SceneObject` from `Gizmo`
- `getParent(): SceneObject` from `Gizmo`
- `getRotation(): Vector3f` from `Gizmo`
- `getScale(): float` from `Gizmo`
- `getTable(): KahluaTable` from `Gizmo`
- `getTransformMode(): TransformMode` from `Gizmo`
- `getWorldPosition(): Vector3f` from `Gizmo`
- `isVisible(): boolean` from `Gizmo`
- `setRotation(float rx, float ry, float rz): void` from `Gizmo`
- `setTable(KahluaTable table): void` from `Gizmo`
- `setTransformMode(TransformMode mode): void` from `Gizmo`
- `setVisible(boolean visible): void` from `Gizmo`
- `setWorldPosition(float x, float y, float z): void` from `Gizmo`

Static functions, called as `TranslateGizmo.name(...)`:

- `releaseRay(UI3DScene.Ray ray): void` from `Gizmo`

### GameKeyboard

`zombie.input.GameKeyboard`, class.

Static functions, called as `GameKeyboard.name(...)`:

- `eatKeyPress(int key): void`
- `getEventQueue(): KeyEventQueue`
- `getEventQueuePolling(): KeyEventQueue`
- `isKeyDown(int key): boolean`
- `isKeyDown(String keyName): boolean`
- `isKeyDown(KeybindId keybindId): boolean`
- `isKeyDownRaw(int key): boolean`
- `isKeyPressed(int key): boolean`
- `isKeyPressed(String keyName): boolean`
- `isKeyPressed(KeybindId keybindId): boolean`
- `poll(): void`
- `setDoLuaKeyPressed(boolean doIt): void`
- `update(): void`
- `wasKeyDown(int key): boolean`
- `wasKeyDown(String keyName): boolean`
- `wasKeyDown(KeybindId keybindId): boolean`
- `wasKeyDownRaw(int key): boolean`
- `whichKeyDown(String keyName): int`
- `whichKeyDown(KeybindId keybindId): int`
- `whichKeyDownIgnoreMouse(String keyName): int`
- `whichKeyPressed(String keyName): int`
- `whichKeyWasDown(String keyName): int`

Constructors: `GameKeyboard.new()`.

Static fields (a copy of the value taken when the class is exposed): `doLuaKeyPressed: boolean`, `noEventsWhileLoading: boolean`.

### JoypadAxis1d

`zombie.input.JoypadAxis1d`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeadZone(int joypadBind): float`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getNameTranslationKey(): String`
- `getValue(int joypadBind): float`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `setDeadZone(int joypadBind, float newValue): void`
- `toString(): String` from `Enum`

Static functions, called as `JoypadAxis1d.name(...)`:

- `fromIndex(int axisIdx): JoypadAxis1d`
- `getAxes(): JoypadAxis1d[]`
- `getAxisCount(): int`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): JoypadAxis1d`
- `values(): JoypadAxis1d[]`

Enum values (read as `JoypadAxis1d.VALUE`): `LeftStickX`, `LeftStickY`, `LeftTrigger`, `RightStickX`, `RightStickY`, `RightTrigger`.

### JoypadAxis2d

`zombie.input.JoypadAxis2d`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getLength(int joypadBind): float`
- `getNameTranslationKey(): String`
- `getValue(int joypadBind, Vector2 out): Vector2`
- `getValueX(int joypadBind): float`
- `getValueY(int joypadBind): float`
- `hashCode(): int` from `Enum`
- `isApplied(int joypadBind): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `JoypadAxis2d.name(...)`:

- `getAxes(): JoypadAxis2d[]`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): JoypadAxis2d`
- `values(): JoypadAxis2d[]`

Enum values (read as `JoypadAxis2d.VALUE`): `LeftStick`, `RightStick`.

### JoypadButton

`zombie.input.JoypadButton`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `getNameTranslationKey(): String`
- `hashCode(): int` from `Enum`
- `isDown(int joypadBind): boolean`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `JoypadButton.name(...)`:

- `fromIndex(int buttonIdx): JoypadButton`
- `getButtonCount(): int`
- `getButtons(): JoypadButton[]`
- `isButtonDown(int joypadBind, int buttonIdx): boolean`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): JoypadButton`
- `values(): JoypadButton[]`

Enum values (read as `JoypadButton.VALUE`): `A`, `B`, `Back`, `DPadDown`, `DPadLeft`, `DPadRight`, `DPadUp`, `Guide`, `LeftBump`, `LeftStick`, `RightBump`, `RightStick`, `Start`, `X`, `Y`.

### KeybindId

`zombie.input.KeybindId`, class.

Methods, called as `obj:name(...)`:

- `getId(): String`
- `toString(): String`

Static functions, called as `KeybindId.name(...)`:

- `get(ResourceLocation id): KeybindId`
- `register(String id): KeybindId`

Static fields (a copy of the value taken when the class is exposed): `AIM: KeybindId`, `ALT_TOGGLE_CHAT: KeybindId`, `ANIMAL_RADIAL_MENU: KeybindId`, `ATTACK_CLICK: KeybindId`, `BACKWARD: KeybindId`, `BRAKE: KeybindId`, `BUILDING_UI: KeybindId`, `CANCEL_ACTION: KeybindId`, `CRAFTING_UI: KeybindId`, `CROUCH: KeybindId`, `CRUISE_CONTROL: KeybindId`, `DISPLAY_FPS: KeybindId`, `DROP_BOTH_HELD_ITEMS: KeybindId`, `DROP_BOTH_HELD_ITEMS_AND_WORN_BAG: KeybindId`, `DROP_PRIMARY_HELD_ITEM: KeybindId`, `DROP_SECONDARY_HELD_ITEM: KeybindId`, `DROP_WORN_BAG: KeybindId`, `EMOTE: KeybindId`, `ENABLE_VOICE_TRANSMIT: KeybindId`, `FAST_FORWARD_X1: KeybindId`, `FAST_FORWARD_X2: KeybindId`, `FAST_FORWARD_X3: KeybindId`, `FORWARD: KeybindId`, `GRAB_CORPSE: KeybindId`, `HOTBAR_1: KeybindId`, `HOTBAR_2: KeybindId`, `HOTBAR_3: KeybindId`, `HOTBAR_4: KeybindId`, `HOTBAR_5: KeybindId`, `HOTBAR_6: KeybindId`, `HOTBAR_7: KeybindId`, `HOTBAR_8: KeybindId`, `INTERACT: KeybindId`, `LEFT: KeybindId`, `LIGHT_SOURCE: KeybindId`, `MAIN_MENU: KeybindId`, `MANUAL_FLOOR_ATTACK: KeybindId`, `MAP: KeybindId`, `MELEE: KeybindId`, `NORMAL_SPEED: KeybindId`, `PAN_CAMERA: KeybindId`, `PAUSE: KeybindId`, `RACK_FIREARM: KeybindId`, `RELEASE_ROPE: KeybindId`, `RELOAD_WEAPON: KeybindId`, `RIGHT: KeybindId`, `ROTATE_BUILDING: KeybindId`, `RUN: KeybindId`, `SHARPEN_WEAPON: KeybindId`, `SHOUT: KeybindId`, `SIT_ON_GROUND: KeybindId`, `SPRINT: KeybindId`, `START_VEHICLE_ENGINE: KeybindId`, `SWITCH_CHAT_STREAM: KeybindId`, `TAKE_SCREENSHOT: KeybindId`, `TOGGLE_ANIMATION_TEXT: KeybindId`, `TOGGLE_CHAT: KeybindId`, `TOGGLE_CLOTHING_PROTECTION_PANEL: KeybindId`, `TOGGLE_GOD_MODE: KeybindId`, `TOGGLE_HEALTH_PANEL: KeybindId`, `TOGGLE_INFO_PANEL: KeybindId`, `TOGGLE_INVENTORY: KeybindId`, `TOGGLE_LUA_CONSOLE: KeybindId`, `TOGGLE_LUA_DEBUGGER: KeybindId`, `TOGGLE_MODE: KeybindId`, `TOGGLE_MODELS_ENABLED: KeybindId`, `TOGGLE_MOVABLE_PANEL_MODE: KeybindId`, `TOGGLE_MUSIC: KeybindId`, `TOGGLE_OLD_RENDERER: KeybindId`, `TOGGLE_SAFETY: KeybindId`, `TOGGLE_SEARCH_MODE: KeybindId`, `TOGGLE_SKILL_PANEL: KeybindId`, `TOGGLE_SURVIVAL_GUIDE: KeybindId`, `TOGGLE_UI: KeybindId`, `TOGGLE_VEHICLE_HEADLIGHTS: KeybindId`, `VEHICLE_HEATER: KeybindId`, `VEHICLE_HORN: KeybindId`, `VEHICLE_MECHANICS: KeybindId`, `VEHICLE_RADIAL_MENU: KeybindId`, `VEHICLE_SWITCH_SEAT: KeybindId`, `WALK_TO: KeybindId`, `ZOOM_IN: KeybindId`, `ZOOM_OUT: KeybindId`.

### Mouse

`zombie.input.Mouse`, class.

Static functions, called as `Mouse.name(...)`:

- `UIBlockButtonDown(int number): void`
- `getButtonCount(): int`
- `getWheelState(): int`
- `getX(): int`
- `getXA(): int`
- `getY(): int`
- `getYA(): int`
- `initCustomCursor(): void`
- `isButtonDown(int number): boolean`
- `isButtonDownUICheck(int number): boolean`
- `isButtonKey(int key): boolean`
- `isButtonPressed(int number): boolean`
- `isButtonReleased(int number): boolean`
- `isCursorVisible(): boolean`
- `isLeftDown(): boolean`
- `isLeftPressed(): boolean`
- `isLeftReleased(): boolean`
- `isLeftUp(): boolean`
- `isMiddleDown(): boolean`
- `isMiddlePressed(): boolean`
- `isMiddleReleased(): boolean`
- `isMiddleUp(): boolean`
- `isRightDelay(): boolean`
- `isRightDown(): boolean`
- `isRightPressed(): boolean`
- `isRightReleased(): boolean`
- `isRightUp(): boolean`
- `loadCursor(String filename): Cursor`
- `poll(): void`
- `renderCursorTexture(): void`
- `setCursorVisible(boolean bVisible): void`
- `setXY(int x, int y): void`
- `update(): void`
- `wasButtonDown(int number): boolean`

Constructors: `Mouse.new()`.

Static fields (a copy of the value taken when the class is exposed): `BTN_0: int`, `BTN_1: int`, `BTN_2: int`, `BTN_3: int`, `BTN_4: int`, `BTN_5: int`, `BTN_6: int`, `BTN_7: int`, `BTN_OFFSET: int`, `LMB: int`, `MMB: int`, `RMB: int`, `buttonDownStates: boolean[]`, `buttonPrevStates: boolean[]`, `lastActivity: long`, `uiCaptured: boolean[]`, `wheelDelta: int`.

### ReplaceProviderCharacter

`zombie.text.templating.ReplaceProviderCharacter`, class. Extends `ReplaceProvider`.

Methods, called as `obj:name(...)`:

- `addKey(String key, String value): void` from `ReplaceProvider`
- `addKey(String key, KahluaTableImpl table): void` from `ReplaceProvider`
- `addReplacer(String key, IReplace replace): void` from `ReplaceProvider`
- `getReplacer(String key): IReplace` from `ReplaceProvider`
- `hasReplacer(String key): boolean` from `ReplaceProvider`

Constructors: `ReplaceProviderCharacter.new(IsoGameCharacter character)`.

### TemplateText

`zombie.text.templating.TemplateText`, class.

Static functions, called as `TemplateText.name(...)`:

- `Build(String input): String`
- `Build(String input, KahluaTableImpl table): String`
- `Build(String input, IReplaceProvider replaceProvider): String`
- `CreateBlanc(): ITemplateBuilder`
- `CreateCopy(): ITemplateBuilder`
- `Initialize(): void`
- `RandNext(float bound): float`
- `RandNext(float min, float max): float`
- `RandNext(int bound): int`
- `RandNext(int min, int max): int`
- `RegisterKey(String key, KahluaTableImpl table): void`
- `RegisterKey(String key, IReplace replace): void`
- `Reset(): void`

Constructors: `TemplateText.new()`.

### ActionProgressBar

`zombie.ui.ActionProgressBar`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (168), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getValue(): float`
- `render(): void`
- `setValue(float delta): void`
- `update(int nPlayer): void`

Constructors: `ActionProgressBar.new(int x, int y)`.

### AtomUI

`zombie.ui.AtomUI`, class.

Methods, called as `obj:name(...)`:

- `addNode(AtomUI el): void`
- `bringToTop(): void`
- `clearStencilRect(): void`
- `getAngle(): Double`
- `getColor(): KahluaTable`
- `getHeight(): Double`
- `getLuaAbsolutePosition(double x, double y): KahluaTable`
- `getLuaLocalPosition(double x, double y): KahluaTable`
- `getLuaParentPosition(double x, double y): KahluaTable`
- `getMaxDrawHeight(): Double`
- `getNodes(): ArrayList<AtomUI>`
- `getParent(): UIElementInterface`
- `getParentNode(): AtomUI`
- `getPivotX(): Double`
- `getPivotY(): Double`
- `getRenderThisPlayerOnly(): int`
- `getScaleX(): Double`
- `getScaleY(): Double`
- `getTable(): KahluaTable`
- `getUIName(): String`
- `getWidth(): Double`
- `getX(): Double`
- `getY(): Double`
- `init(): void`
- `isAlwaysOnTop(): boolean`
- `isBackMost(): boolean`
- `isCapture(): Boolean`
- `isDefaultDraw(): Boolean`
- `isEnabled(): Boolean`
- `isFollowGameWorld(): Boolean`
- `isForceCursorVisible(): boolean`
- `isIgnoreLossControl(): Boolean`
- `isModalVisible(): boolean`
- `isMouseOver(): Boolean`
- `isOverElement(double mx, double my): boolean`
- `isPointOver(double screenX, double screenY): Boolean`
- `isVisible(): Boolean`
- `isWantKeyEvents(): boolean`
- `onConsumeKeyPress(int key): boolean`
- `onConsumeKeyRelease(int key): boolean`
- `onConsumeKeyRepeat(int key): boolean`
- `onConsumeMouseButtonDown(int btn, double x, double y): boolean`
- `onConsumeMouseButtonUp(int btn, double x, double y): boolean`
- `onConsumeMouseMove(double dx, double dy, double x, double y): Boolean`
- `onConsumeMouseWheel(double del, double x, double y): Boolean`
- `onExtendMouseMoveOutside(double dx, double dy, double x, double y): void`
- `onMouseButtonDownOutside(int btn, double x, double y): void`
- `onMouseButtonUpOutside(int btn, double x, double y): void`
- `removeNode(AtomUI el): void`
- `render(): void`
- `repaintStencilRect(): void`
- `setAlwaysOnTop(boolean value): void`
- `setAngle(double angle): void`
- `setBackMost(boolean value): void`
- `setColor(double r, double g, double b, double a): void`
- `setEnabled(boolean enabled): void`
- `setHeight(double value): void`
- `setHeightSilent(double value): void`
- `setParentNode(AtomUI parent): void`
- `setPivotX(double x): void`
- `setPivotY(double y): void`
- `setScaleX(double x): void`
- `setScaleY(double y): void`
- `setStencilRect(): void`
- `setUIName(String name): void`
- `setVisible(boolean value): void`
- `setWidth(double value): void`
- `setWidthSilent(double value): void`
- `setX(double value): void`
- `setY(double value): void`
- `update(): void`

Constructors: `AtomUI.new(KahluaTable table)`.

### AtomUIMap

`zombie.ui.AtomUIMap`, class. Extends [AtomUI](#atomui). Also has the methods of [AtomUI](#atomui) (69), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getMapUI(): UIWorldMap`
- `init(): void`
- `render(): void`
- `revealOnMap(): void`

Constructors: `AtomUIMap.new(KahluaTable table)`.

### AtomUIText

`zombie.ui.AtomUIText`, class. Extends [AtomUI](#atomui). Also has the methods of [AtomUI](#atomui) (69), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getTextHeight(): Double`
- `getTextWidth(): Double`
- `init(): void`
- `render(): void`
- `setAutoWidth(Double width): void`
- `setFont(UIFont font): void`
- `setText(String text): void`

Constructors: `AtomUIText.new(KahluaTable table)`.

### AtomUITextEntry

`zombie.ui.AtomUITextEntry`, class. Extends [AtomUI](#atomui). Also has the methods of [AtomUI](#atomui) (63), listed on their own entries.

Methods, called as `obj:name(...)`:

- `copyToClipboard(): void`
- `cutToClipboard(): void`
- `focus(): void`
- `getForceUpperCase(): boolean`
- `getFrame(): UINineGrid`
- `getMaxTextLength(): int`
- `getStandardFrameColour(): Color`
- `getText(): String`
- `init(): void`
- `isDoingTextEntry(): boolean`
- `isEditable(): boolean`
- `isIgnoreFirst(): boolean`
- `isMask(): boolean`
- `isMultiline(): boolean`
- `isOnlyNumbers(): boolean`
- `isOnlyText(): boolean`
- `isTextLimit(): boolean`
- `onConsumeMouseButtonDown(int btn, double x, double y): boolean`
- `onConsumeMouseButtonUp(int btn, double x, double y): boolean`
- `onConsumeMouseMove(double dx, double dy, double x, double y): Boolean`
- `onExtendMouseMoveOutside(double dx, double dy, double x, double y): void`
- `onKeyBack(): void`
- `onKeyDelete(): void`
- `onKeyDown(): void`
- `onKeyEnd(): void`
- `onKeyEnter(): void`
- `onKeyHome(): void`
- `onKeyLeft(): void`
- `onKeyRight(): void`
- `onKeyUp(): void`
- `onMouseButtonUpOutside(int btn, double x, double y): void`
- `onOtherKey(int eventKey): void`
- `pasteFromClipboard(): void`
- `putCharacter(char eventChar): void`
- `render(): void`
- `resetBlink(): void`
- `selectAll(): void`
- `setDoingTextEntry(boolean value): void`
- `setFont(UIFont font): void`
- `setForceUpperCase(boolean forceUpperCase): void`
- `setIgnoreFirst(boolean value): void`
- `setMask(boolean b): void`
- `setMaxTextLength(int maxtextLength): void`
- `setMultiline(boolean value): void`
- `setOnlyNumbers(boolean onlyNumbers): void`
- `setOnlyText(boolean onlyText): void`
- `setSelectingRange(boolean value): void`
- `setText(String text): void`
- `unfocus(): void`
- `update(): void`

Constructors: `AtomUITextEntry.new(KahluaTable table)`.

### AtomUITexture

`zombie.ui.AtomUITexture`, class. Extends [AtomUI](#atomui). Also has the methods of [AtomUI](#atomui) (69), listed on their own entries.

Methods, called as `obj:name(...)`:

- `animPause(): void`
- `animPlay(): void`
- `animStop(): void`
- `init(): void`
- `render(): void`
- `setAnimValues(double animDelay, double animFrameNum, double animFrameRows, double animFrameColumns): void`
- `setSlice9(double left, double right, double top, double down): void`
- `setTexture(Texture tex): void`

Constructors: `AtomUITexture.new(KahluaTable table)`.

### Clock

`zombie.ui.Clock`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (167), listed on their own entries.

Methods, called as `obj:name(...)`:

- `isDateVisible(): boolean`
- `onMouseDown(double x, double y): Boolean`
- `render(): void`
- `resize(): void`

Constructors: `Clock.new(int x, int y)`.

Static fields (a copy of the value taken when the class is exposed): `instance: Clock`.

### ModalDialog

`zombie.ui.ModalDialog`, class. Extends `NewWindow`. Also has the methods of [UIElement](#uielement) (162), listed on their own entries.

Methods, called as `obj:name(...)`:

- `ButtonClicked(String name): void`
- `Clicked(String name): void`
- `Nest(UIElement el, int t, int r, int b, int l): void` from `NewWindow`
- `onMouseDown(double x, double y): Boolean` from `NewWindow`
- `onMouseMove(double dx, double dy): Boolean` from `NewWindow`
- `onMouseMoveOutside(double dx, double dy): void` from `NewWindow`
- `onMouseUp(double x, double y): Boolean` from `NewWindow`
- `render(): void` from `NewWindow`
- `setMovable(boolean bMoveable): void` from `NewWindow`
- `update(): void` from `NewWindow`

Constructors: `ModalDialog.new(String name, String help, boolean bYesNo)`.

### MoodlesUI

`zombie.ui.MoodlesUI`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (165), listed on their own entries.

Methods, called as `obj:name(...)`:

- `onMouseMove(double dx, double dy): Boolean`
- `onMouseMoveOutside(double dx, double dy): void`
- `render(): void`
- `setCharacter(IsoGameCharacter chr): void`
- `update(): void`
- `wiggle(MoodleType moodleType): void`

Static functions, called as `MoodlesUI.name(...)`:

- `getInstance(): MoodlesUI`

Constructors: `MoodlesUI.new()`.

### NewHealthPanel

`zombie.ui.NewHealthPanel`, class. Extends `NewWindow`. Also has the methods of [UIElement](#uielement) (162), listed on their own entries.

Methods, called as `obj:name(...)`:

- `ButtonClicked(String name): void` from `NewWindow`
- `Nest(UIElement el, int t, int r, int b, int l): void` from `NewWindow`
- `SetCharacter(IsoGameCharacter chr): void`
- `getDamageStatusString(): String`
- `onMouseDown(double x, double y): Boolean` from `NewWindow`
- `onMouseMove(double dx, double dy): Boolean` from `NewWindow`
- `onMouseMoveOutside(double dx, double dy): void` from `NewWindow`
- `onMouseUp(double x, double y): Boolean` from `NewWindow`
- `render(): void`
- `setMovable(boolean bMoveable): void` from `NewWindow`
- `update(): void`

Constructors: `NewHealthPanel.new(int x, int y, IsoGameCharacter parentCharacter)`.

Static fields (a copy of the value taken when the class is exposed): `instance: NewHealthPanel`.

### ObjectTooltip

`zombie.ui.ObjectTooltip`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (160), listed on their own entries.

Methods, called as `obj:name(...)`:

- `DrawProgressBar(int x, int y, int w, int h, float f, double r, double g, double b, double a): void`
- `DrawText(UIFont font, String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawTextCentre(UIFont font, String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawTextRight(UIFont font, String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawTextureScaled(Texture tex, double x, double y, double width, double height, double alpha): void`
- `DrawTextureScaledAspect(Texture tex, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawValueRight(int value, int x, int y, boolean highGood): void`
- `DrawValueRightNoPlus(float value, int x, int y): void`
- `DrawValueRightNoPlus(int value, int x, int y): void`
- `adjustWidth(int textX, String text): void`
- `beginLayout(): ObjectTooltip.Layout`
- `endLayout(ObjectTooltip.Layout layout): void`
- `getCharacter(): IsoGameCharacter`
- `getFont(): UIFont`
- `getLineSpacing(): int`
- `getTexture(): Texture`
- `getWeightOfStack(): float`
- `hide(): void`
- `isMeasureOnly(): boolean`
- `onMouseMove(double dx, double dy): Boolean`
- `onMouseMoveOutside(double dx, double dy): void`
- `render(): void`
- `setCharacter(IsoGameCharacter chr): void`
- `setMeasureOnly(boolean b): void`
- `setWeightOfStack(float weight): void`
- `show(IsoObject obj, double x, double y): void`
- `update(): void`

Static functions, called as `ObjectTooltip.name(...)`:

- `checkFont(): void`

Constructors: `ObjectTooltip.new()`.

Static fields (a copy of the value taken when the class is exposed): `alphaStep: float`.

### ObjectTooltip.Layout

`zombie.ui.ObjectTooltip.Layout`, class.

Methods, called as `obj:name(...)`:

- `addItem(): ObjectTooltip.LayoutItem`
- `free(): void`
- `render(int left, int top, ObjectTooltip ui): int`
- `setMinLabelWidth(int minWidth): void`
- `setMinValueWidth(int minWidth): void`

Constructors: `ObjectTooltip.Layout.new()`.

### ObjectTooltip.LayoutItem

`zombie.ui.ObjectTooltip.LayoutItem`, class.

Methods, called as `obj:name(...)`:

- `calcSizes(): void`
- `render(int x, int y, int mid, int right, ObjectTooltip ui): void`
- `reset(): void`
- `setLabel(String label, float r, float g, float b, float a): void`
- `setProgress(float fraction, float r, float g, float b, float a): void`
- `setValue(String label, float r, float g, float b, float a): void`
- `setValueRight(int value, boolean highGood): void`
- `setValueRightNoPlus(float value): void`
- `setValueRightNoPlus(int value): void`

Constructors: `ObjectTooltip.LayoutItem.new()`.

### RadarPanel

`zombie.ui.RadarPanel`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (167), listed on their own entries.

Methods, called as `obj:name(...)`:

- `render(): void`
- `update(): void`

Constructors: `RadarPanel.new(int playerIndex)`.

### RadialMenu

`zombie.ui.RadialMenu`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (167), listed on their own entries.

Methods, called as `obj:name(...)`:

- `addSlice(String text, Texture texture): void`
- `clear(): void`
- `getSliceIndexFromJoypad(int joypad): int`
- `getSliceIndexFromMouse(int mx, int my): int`
- `render(): void`
- `setJoypad(int joypad): void`
- `setSliceText(int sliceIndex, String text): void`
- `setSliceTexture(int sliceIndex, Texture texture): void`
- `update(): void`

Constructors: `RadialMenu.new(int x, int y, int innerRadius, int outerRadius)`.

### RadialProgressBar

`zombie.ui.RadialProgressBar`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (167), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getTexture(): Texture`
- `getValue(): float`
- `render(): void`
- `setColor(ColorInfo color): void`
- `setTexture(Texture texture): void`
- `setValue(float delta): void`
- `update(): void`

Constructors: `RadialProgressBar.new(KahluaTable table, Texture tex)`.

### SpeedControls

`zombie.ui.SpeedControls`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (164), listed on their own entries.

Methods, called as `obj:name(...)`:

- `ButtonClicked(String name): void`
- `Pause(): void`
- `SetCorrectIconStates(): void`
- `SetCurrentGameSpeed(int newSpeed): void`
- `getCurrentGameSpeed(): int`
- `isPaused(): boolean`
- `onMouseMove(double dx, double dy): Boolean`
- `onMouseMoveOutside(double dx, double dy): void`
- `render(): void`
- `stepForward(): void`
- `update(): void`

Constructors: `SpeedControls.new()`.

Static fields (a copy of the value taken when the class is exposed): `FastForwardSpeed: int`, `FasterForwardSpeed: int`, `PauseSpeed: int`, `PlaySpeed: int`, `WaitSpeed: int`, `instance: SpeedControls`.

### TextDrawObject

`zombie.ui.TextDrawObject`, class.

Methods, called as `obj:name(...)`:

- `AddBatchedDraw(double x, double y): void`
- `AddBatchedDraw(double x, double y, boolean drawOutlines): void`
- `AddBatchedDraw(double x, double y, boolean drawOutlines, float alpha): void`
- `AddBatchedDraw(double x, double y, double r, double g, double b, double a, boolean drawOutlines): void`
- `AddBatchedDraw(TextDrawHorizontal horz, double x, double y, double r, double g, double b, double a, boolean drawOutlines): void`
- `Clear(): void`
- `Draw(double x, double y): void`
- `Draw(double x, double y, boolean drawOutlines): void`
- `Draw(double x, double y, boolean drawOutlines, float alpha): void`
- `Draw(double x, double y, double r, double g, double b, double a, boolean drawOutlines): void`
- `Draw(TextDrawHorizontal horz, double x, double y, double r, double g, double b, double a, boolean drawOutlines): void`
- `DrawRaw(TextDrawHorizontal horz, double x, double y, float r, float g, float b, float a, boolean drawOutlines): void`
- `ReadString(String str): void`
- `ReadString(String str, int maxLineWidth): void`
- `ReadString(UIFont font, String str, int maxLineWidth): void`
- `calculateDimensions(): void`
- `getCustomTag(): String`
- `getDefaultFontEnum(): UIFont`
- `getEnabled(): boolean`
- `getHearRange(): int`
- `getHeight(): int`
- `getHorizontalAlign(): TextDrawHorizontal`
- `getInternalClock(): float`
- `getOriginal(): String`
- `getScrambleVal(): float`
- `getUnformatted(): String`
- `getVisibleRadius(): int`
- `getWidth(): int`
- `isNullOrZeroLength(): boolean`
- `setAllowAnyImage(boolean allowAnyImage): void`
- `setAllowBBcode(boolean allowBbcode): void`
- `setAllowChatIcons(boolean allowChatIcons): void`
- `setAllowColors(boolean allowColors): void`
- `setAllowFonts(boolean allowFonts): void`
- `setAllowImages(boolean allowImages): void`
- `setAllowLineBreaks(boolean allowLineBreaks): void`
- `setCustomImageMaxDimensions(int dim): void`
- `setCustomTag(String tag): void`
- `setDefaultColors(float r, float g, float b): void`
- `setDefaultColors(float r, float g, float b, float a): void`
- `setDefaultColors(int r, int g, int b): void`
- `setDefaultColors(int r, int g, int b, int a): void`
- `setDefaultFont(UIFont f): void`
- `setDrawBackground(boolean draw): void`
- `setEnabled(boolean enabled): void`
- `setEqualizeLineHeights(boolean equalizeLineHeights): void`
- `setHearRange(int range): void`
- `setHorizontalAlign(String horz): void`
- `setHorizontalAlign(TextDrawHorizontal horz): void`
- `setInternalTickClock(float ticks): void`
- `setMaxCharsPerLine(int charsperline): void`
- `setOutlineColors(float r, float g, float b): void`
- `setOutlineColors(float r, float g, float b, float a): void`
- `setOutlineColors(int r, int g, int b): void`
- `setOutlineColors(int r, int g, int b, int a): void`
- `setScrambleVal(float value): void`
- `setSettings(boolean allowBBcode, boolean allowImages, boolean allowChatIcons, boolean allowColors, boolean allowFonts, boolean equalizeLineHeights): void`
- `setValidFonts(String[] list): void`
- `setValidImages(String[] list): void`
- `setVisibleRadius(int radius): void`
- `updateInternalTickClock(): float`
- `updateInternalTickClock(float delta): float`

Static functions, called as `TextDrawObject.name(...)`:

- `NoRender(int playerNum): void`
- `RenderBatch(int playerNum): void`

Constructors: `TextDrawObject.new()`, `TextDrawObject.new(int r, int g, int b, boolean allowBbcode)`, `TextDrawObject.new(int r, int g, int b, boolean allowBbcode, boolean allowImages, boolean allowChatIcons, boolean allowColors, boolean allowFonts, boolean equalizeLineHeights)`.

### TextManager

`zombie.ui.TextManager`, class.

Methods, called as `obj:name(...)`:

- `CentreStringYOffset(UIFont font, String str): int`
- `DrawString(double x, double y, String str): void`
- `DrawString(double x, double y, String str, double r, double g, double b, double a): void`
- `DrawString(UIFont font, double x, double y, double zoom, String str, double r, double g, double b, double a): void`
- `DrawString(UIFont font, double x, double y, String str, double r, double g, double b, double a): void`
- `DrawStringBBcode(UIFont font, double x, double y, String str, double r, double g, double b, double a): void`
- `DrawStringCentre(double x, double y, String str, double r, double g, double b, double a): void`
- `DrawStringCentre(AngelCodeFont font, double x, double y, String str, double r, double g, double b, double a): void`
- `DrawStringCentre(UIFont font, double x, double y, String str, double r, double g, double b, double a): void`
- `DrawStringCentreDefered(UIFont font, double x, double y, String str, double r, double g, double b, double a): void`
- `DrawStringRight(double x, double y, String str, double r, double g, double b, double a): void`
- `DrawStringRight(UIFont font, double x, double y, String str, double r, double g, double b, double a): void`
- `DrawStringUntrimmed(UIFont font, double x, double y, String str, double r, double g, double b, double a): void`
- `DrawTextFromGameWorld(): void`
- `DrawTextObject(double x, double y, TextDrawObject td): void`
- `GetDrawTextObject(String str, int maxLineWidth, boolean restrictImages): TextDrawObject`
- `Init(): void`
- `MeasureFont(UIFont font): int`
- `MeasureStringX(UIFont font, String str): int`
- `MeasureStringY(UIFont font, String str): int`
- `MeasureStringY(UIFont font, String str, boolean returnActualHeight, boolean returnOffset): int`
- `MeasureStringYOffset(UIFont font, String str): int`
- `MeasureStringYReal(UIFont font, String str): int`
- `WrapText(UIFont font, String str, int maxWidth): String`
- `WrapText(UIFont font, String str, int maxWidth, int maxLines, String maxLinesSuffix): String`
- `getAllFonts(ArrayList<UIFont> result): ArrayList<UIFont>`
- `getCurrentCodeFont(): UIFont`
- `getFontFromEnum(UIFont font): AngelCodeFont`
- `getFontHeight(UIFont fontID): int`
- `getNormalFromFontSize(int points): AngelCodeFont`
- `isAnyFontLoading(): boolean`
- `isSdf(UIFont font): boolean`
- `isUsingNonEnglishFonts(): boolean`

Constructors: `TextManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `instance: TextManager`, `sdfShader: SDFShader`.

### UI3DModel

`zombie.ui.UI3DModel`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (168), listed on their own entries.

Methods, called as `obj:name(...)`:

- `clearVariable(String key): void`
- `clearVariables(): void`
- `clothingItemChanged(String itemGuid): void`
- `getCharacter(): IsoGameCharacter`
- `getDirection(): IsoDirections`
- `getState(): String`
- `getVariable(String key): Object`
- `render(): void`
- `reportEvent(String event): void`
- `setAnimSetName(String name): void`
- `setAnimate(boolean animate): void`
- `setCharacter(IsoGameCharacter character): void`
- `setDirection(IsoDirections dir): void`
- `setDoRandomExtAnimations(boolean doExt): void`
- `setIsometric(boolean iso): void`
- `setOutfitName(String outfitName, boolean female, boolean zombie): void`
- `setState(String state): void`
- `setSurvivorDesc(SurvivorDesc survivorDesc): void`
- `setVariable(String key, boolean value): void`
- `setVariable(String key, float value): void`
- `setVariable(String key, String value): void`
- `setXOffset(float newXOffset): void`
- `setYOffset(float newYOffset): void`
- `setZoom(float newZoom): void`

Constructors: `UI3DModel.new(KahluaTable table)`.

### UIDebugConsole

`zombie.ui.UIDebugConsole`, class. Extends `NewWindow`. Also has the methods of [UIElement](#uielement) (161), listed on their own entries.

Methods, called as `obj:name(...)`:

- `ButtonClicked(String name): void` from `NewWindow`
- `Nest(UIElement el, int t, int r, int b, int l): void` from `NewWindow`
- `ProcessCommand(): void`
- `addOutput(byte[] b, int off, int len): void`
- `levenshteinDistance(CharSequence lhs, CharSequence rhs): int`
- `onMouseDown(double x, double y): Boolean`
- `onMouseMove(double dx, double dy): Boolean`
- `onMouseMoveOutside(double dx, double dy): void` from `NewWindow`
- `onMouseUp(double x, double y): Boolean`
- `onMouseUpOutside(double x, double y): void`
- `onOtherKey(int key): void`
- `render(): void`
- `setMovable(boolean bMoveable): void` from `NewWindow`
- `update(): void`

Constructors: `UIDebugConsole.new(int x, int y)`.

Static fields (a copy of the value taken when the class is exposed): `instance: UIDebugConsole`.

### UIElement

`zombie.ui.UIElement`, class.

Methods, called as `obj:name(...)`:

- `AddChild(UIElement el): void`
- `BringToTop(UIElement el): void`
- `ButtonClicked(String name): void`
- `ClearChildren(): void`
- `DrawItemIcon(InventoryItem item, double x, double y, double alpha, double width, double height): void`
- `DrawLine(Texture tex, double x1, double y1, double x2, double y2, float thickness, double r, double g, double b, double a): void`
- `DrawPolygon(Texture tex, double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4, double r, double g, double b, double a): void`
- `DrawScriptItemIcon(Item scriptItem, double x, double y, double alpha, double width, double height): void`
- `DrawSubTextureRGBA(Texture tex, double subX, double subY, double subW, double subH, double x, double y, double w, double h, double r, double g, double b, double a): void`
- `DrawText(String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawText(String text, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawText(UIFont font, String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawText(UIFont font, String text, double x, double y, double zoom, double r, double g, double b, double alpha): void`
- `DrawTextCentre(String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawTextCentre(UIFont font, String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawTextRight(String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawTextRight(UIFont font, String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawTextUntrimmed(UIFont font, String text, double x, double y, double r, double g, double b, double alpha): void`
- `DrawTexture(Texture tex, double x, double y, double alpha): void`
- `DrawTexture(Texture tex, double tlx, double tly, double trx, double try2, double brx, double bry, double blx, double bly, double r, double g, double b, double a): void`
- `DrawTextureAngle(Texture tex, double centerX, double centerY, double angle): void`
- `DrawTextureAngle(Texture tex, double centerX, double centerY, double angle, double r, double g, double b, double a): void`
- `DrawTextureCol(Texture tex, double x, double y, Color col): void`
- `DrawTextureColor(Texture tex, double x, double y, double r, double g, double b, double a): void`
- `DrawTextureIcon(Texture tex, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawTextureIconMask(Texture tex, double yRatio, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawTextureIgnoreOffset(Texture tex, double x, double y, int width, int height, Color col): void`
- `DrawTexturePercentage(Texture tex, double yRatio, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawTexturePercentageBottomUp(Texture tex, double yRatio, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawTextureScaled(Texture tex, double x, double y, double width, double height, double alpha): void`
- `DrawTextureScaledAspect(Texture tex, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawTextureScaledAspect2(Texture tex, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawTextureScaledAspect3(Texture tex, double x, double y, double width, double height, double r, double g, double b, double alpha): void`
- `DrawTextureScaledCol(Texture tex, double x, double y, double width, double height, double r, double g, double b, double a): void`
- `DrawTextureScaledCol(Texture tex, double x, double y, double width, double height, Color col): void`
- `DrawTextureScaledColor(Texture tex, Double x, Double y, Double width, Double height, Double r, Double g, Double b, Double a): void`
- `DrawTextureScaledUniform(Texture tex, double x, double y, double scale, double r, double g, double b, double alpha): void`
- `DrawTextureTiled(Texture tex, double x, double y, double w, double h, double r, double g, double b, double a): void`
- `DrawTextureTiledX(Texture tex, double x, double y, double w, double h, double r, double g, double b, double a): void`
- `DrawTextureTiledY(Texture tex, double x, double y, double w, double h, double r, double g, double b, double a): void`
- `DrawTextureTiledYOffset(Texture tex, double x, double y, double w, double h, double r, double g, double b, double a): void`
- `DrawTexture_FlippedX(Texture tex, double x, double y, int width, int height, Color col): void`
- `DrawTexture_FlippedXIgnoreOffset(Texture tex, double x, double y, int width, int height, Color col): void`
- `DrawUVSliceTexture(Texture tex, double x, double y, double width, double height, Color col, double xStart, double yStart, double xEnd, double yEnd): void`
- `EndOutline(): void`
- `RemoveChild(UIElement el): void`
- `RemoveControl(UIElement el): void`
- `StartOutline(Texture tex, float outlineThickness, float r, float g, float b, float a): void`
- `backMost(): void`
- `bringToTop(): void`
- `clampToParentX(double x): Double`
- `clampToParentY(double y): Double`
- `clearMaxDrawHeight(): void`
- `clearStencilRect(): void`
- `drawTextWithBackground(UIFont font, String text, double x, double y, double r, double g, double b, double a, double padX, double padY, double bgR, double bgG, double bgB, double bgA): void`
- `getAbsoluteX(): Double`
- `getAbsoluteY(): Double`
- `getClickedValue(): String`
- `getControls(): ArrayList<UIElement>`
- `getHeight(): Double`
- `getMaxDrawHeight(): Double`
- `getParent(): UIElement`
- `getPlayerContext(): int`
- `getRenderThisPlayerOnly(): int`
- `getScrollChildren(): Boolean`
- `getScrollHeight(): Double`
- `getScrollWithParent(): Boolean`
- `getTable(): KahluaTable`
- `getUIName(): String`
- `getWidth(): Double`
- `getX(): Double`
- `getXScroll(): Double`
- `getXScrolled(UIElement parent): Double`
- `getY(): Double`
- `getYScroll(): Double`
- `getYScrolled(UIElement parent): Double`
- `ignoreHeightChange(): void`
- `ignoreWidthChange(): void`
- `isAlwaysOnTop(): boolean`
- `isAnchorBottom(): Boolean`
- `isAnchorLeft(): Boolean`
- `isAnchorRight(): Boolean`
- `isAnchorTop(): boolean`
- `isBackMost(): boolean`
- `isCapture(): Boolean`
- `isConsumeMouseEvents(): boolean`
- `isDefaultDraw(): Boolean`
- `isEnabled(): boolean`
- `isFollowGameWorld(): Boolean`
- `isForceCursorVisible(): boolean`
- `isIgnoreLossControl(): Boolean`
- `isKeyConsumed(int key): boolean`
- `isModalVisible(): boolean`
- `isMouseOver(): Boolean`
- `isOverElement(double mx, double my): boolean`
- `isPointOver(double screenX, double screenY): Boolean`
- `isReallyVisible(): boolean`
- `isVisible(): Boolean`
- `isWantExtraMouseEvents(): boolean`
- `isWantKeyEvents(): boolean`
- `onConsumeKeyPress(int key): boolean`
- `onConsumeKeyRelease(int key): boolean`
- `onConsumeKeyRepeat(int key): boolean`
- `onConsumeMouseButtonDown(int btn, double x, double y): boolean`
- `onConsumeMouseButtonUp(int btn, double x, double y): boolean`
- `onConsumeMouseMove(double dx, double dy, double x, double y): Boolean`
- `onConsumeMouseWheel(double del, double x, double y): Boolean`
- `onExtendMouseMoveOutside(double dx, double dy, double x, double y): void`
- `onKeyPress(int key): void`
- `onKeyRelease(int key): void`
- `onKeyRepeat(int key): void`
- `onMouseButtonDown(int btn, double x, double y): void`
- `onMouseButtonDownOutside(int btn, double x, double y): void`
- `onMouseButtonUpOutside(int btn, double x, double y): void`
- `onMouseDown(double x, double y): Boolean`
- `onMouseMove(double dx, double dy): Boolean`
- `onMouseMoveOutside(double dx, double dy): void`
- `onMouseUp(double x, double y): Boolean`
- `onMouseUpOutside(double x, double y): void`
- `onMouseWheel(double del): Boolean`
- `onResize(): void`
- `onRightMouseDown(double x, double y): Boolean`
- `onRightMouseUp(double x, double y): Boolean`
- `onresize(): void`
- `render(): void`
- `repaintStencilRect(double x, double y, double width, double height): void`
- `resumeStencil(): void`
- `setAlwaysOnTop(boolean b): void`
- `setAnchorBottom(boolean anchorBottom): void`
- `setAnchorLeft(boolean anchorLeft): void`
- `setAnchorRight(boolean anchorRight): void`
- `setAnchorTop(boolean anchorTop): void`
- `setCapture(boolean capture): void`
- `setClickedValue(String clickedValue): void`
- `setConsumeMouseEvents(boolean bConsume): void`
- `setControls(Vector<UIElement> controls): void`
- `setDefaultDraw(boolean defaultDraw): void`
- `setEnabled(boolean en): void`
- `setFollowGameWorld(boolean followGameWorld): void`
- `setForceCursorVisible(boolean force): void`
- `setHeight(double height): void`
- `setHeightOnly(double height): void`
- `setHeightSilent(double height): void`
- `setIgnoreLossControl(boolean ignoreLossControl): void`
- `setMaxDrawHeight(double height): void`
- `setParent(UIElement parent): void`
- `setPlayerContext(int nPlayer): void`
- `setRenderClippedChildren(boolean b): void`
- `setRenderThisPlayerOnly(int playerIndex): void`
- `setScrollChildren(boolean bScroll): void`
- `setScrollHeight(double h): void`
- `setScrollWithParent(boolean bScroll): void`
- `setStencilCircle(double x, double y, double width, double height): void`
- `setStencilRect(double x, double y, double width, double height): void`
- `setTable(KahluaTable table): void`
- `setUIName(String name): void`
- `setVisible(boolean visible): void`
- `setWantExtraMouseEvents(boolean want): void`
- `setWantKeyEvents(boolean want): void`
- `setWidth(double width): void`
- `setWidthOnly(double width): void`
- `setWidthSilent(double width): void`
- `setX(double x): void`
- `setXScroll(double x): void`
- `setY(double y): void`
- `setYScroll(double y): void`
- `suspendStencil(): void`
- `toString(): String`
- `update(): void`

Constructors: `UIElement.new()`, `UIElement.new(KahluaTable table)`.

### UIFont

`zombie.ui.UIFont`, enum.

Methods, called as `obj:name(...)`:

- `compareTo(E): int` from `Enum`
- `describeConstable(): Optional<Enum.EnumDesc<E>>` from `Enum`
- `equals(Object): boolean` from `Enum`
- `getDeclaringClass(): Class<E>` from `Enum`
- `hashCode(): int` from `Enum`
- `name(): String` from `Enum`
- `ordinal(): int` from `Enum`
- `toString(): String` from `Enum`

Static functions, called as `UIFont.name(...)`:

- `FromString(String str): UIFont`
- `valueOf(Class<T>, String): T` from `Enum`
- `valueOf(String): UIFont`
- `values(): UIFont[]`

Enum values (read as `UIFont.VALUE`): `AutoNormLarge`, `AutoNormMedium`, `AutoNormSmall`, `Code`, `CodeLarge`, `CodeMedium`, `CodeSmall`, `Cred1`, `Cred2`, `DebugConsole`, `Dialogue`, `Handwritten`, `Intro`, `Large`, `MainMenu1`, `MainMenu2`, `Massive`, `Medium`, `MediumNew`, `NewLarge`, `NewMedium`, `NewSmall`, `SdfBold`, `SdfBoldItalic`, `SdfCaveat`, `SdfItalic`, `SdfOldBold`, `SdfOldBoldItalic`, `SdfOldItalic`, `SdfOldRegular`, `SdfRegular`, `SdfRobertoSans`, `Small`, `Title`.

### UIManager

`zombie.ui.UIManager`, class.

Static functions, called as `UIManager.name(...)`:

- `AddUI(UIElementInterface el): void`
- `CloseContainers(): void`
- `CreateFBO(int width, int height): void`
- `DrawTexture(Texture tex, double x, double y): void`
- `DrawTexture(Texture tex, double x, double y, double width, double height, double alpha): void`
- `FadeIn(double seconds): void`
- `FadeIn(double playerIndex, double seconds): void`
- `FadeOut(double seconds): void`
- `FadeOut(double playerIndex, double seconds): void`
- `RemoveElement(UIElementInterface el): void`
- `clearArrays(): void`
- `closeContainers(): void`
- `createTexture(float x, float y, boolean test): TextureFBO`
- `debugBreakpoint(String filename, long pc): void`
- `getBlack(): Texture`
- `getBlinkAlpha(int playerIndex): float`
- `getClock(): Clock`
- `getDebugConsole(): UIDebugConsole`
- `getDefaultThread(): KahluaThread`
- `getDoneTutorials(): ArrayList<String>`
- `getDoubleClickDist(): Double`
- `getDoubleClickInterval(): Double`
- `getFadeAlpha(double playerIndex): float`
- `getFadeAlpha(): Double`
- `getFadeInTime(): Double`
- `getFadeInTimeMax(): Double`
- `getLastAlpha(): float`
- `getLastMouseTexture(): Texture`
- `getLastMouseX(): Double`
- `getLastMouseY(): Double`
- `getLastOffX(): float`
- `getLastOffY(): float`
- `getLastPicked(): IsoObject`
- `getMillisSinceLastRender(): double`
- `getMillisSinceLastUpdate(): double`
- `getModal(): ModalDialog`
- `getMoodleUI(double index): MoodlesUI`
- `getMouseArrow(): Texture`
- `getMouseAttack(): Texture`
- `getMouseExamine(): Texture`
- `getMouseGrab(): Texture`
- `getPicked(): IsoObjectPicker.ClickObject`
- `getPickedTile(): Vector2`
- `getPickedTileLocal(): Vector2`
- `getProgressBar(int index): ActionProgressBar`
- `getRightDownObject(): IsoObject`
- `getSecondsSinceLastRender(): double`
- `getSecondsSinceLastUpdate(): double`
- `getSpeedControls(): SpeedControls`
- `getSyncedIconIndex(int playerIndex, int maxIndex): int`
- `getTileFromMouse(double mx, double my, double z): Vector2`
- `getToolTip(): ObjectTooltip`
- `getUI(): ArrayList<UIElementInterface>`
- `init(): void`
- `isDoubleClick(double x1, double y1, double x2, double y2, double clickTime): Boolean`
- `isFBOActive(): boolean`
- `isFadingOut(): Boolean`
- `isForceCursorVisible(): boolean`
- `isModalVisible(): boolean`
- `isMouseOverInventory(): boolean`
- `isRendering(): boolean`
- `isShowLuaDebuggerOnError(): boolean`
- `isShowPausedMessage(): boolean`
- `isUpdating(): boolean`
- `isbFadeBeforeUI(): boolean`
- `onKeyPress(int key): boolean`
- `onKeyRelease(int key): boolean`
- `onKeyRepeat(int key): boolean`
- `render(): void`
- `renderFadeOverlay(): void`
- `resetSyncedIconIndex(int playerIndex): int`
- `resize(): void`
- `setBlack(Texture aBlack): void`
- `setClock(Clock aClock): void`
- `setDebugConsole(UIDebugConsole aDebugConsole): void`
- `setDoneTutorials(ArrayList<String> aDoneTutorials): void`
- `setFadeAlpha(double aFadeAlpha): void`
- `setFadeBeforeUI(int playerIndex, boolean bFadeBeforeUI): void`
- `setFadeInTime(double aFadeInTime): void`
- `setFadeInTimeMax(double aFadeInTimeMax): void`
- `setFadeTime(double playerIndex, double fadeTime): void`
- `setFadingOut(boolean): void`
- `setLastAlpha(float aLastAlpha): void`
- `setLastMouseTexture(Texture aLastMouseTexture): void`
- `setLastMouseX(double aLastMouseX): void`
- `setLastMouseY(double aLastMouseY): void`
- `setLastOffX(float aLastOffX): void`
- `setLastOffY(float aLastOffY): void`
- `setLastPicked(IsoObject aLastPicked): void`
- `setModal(ModalDialog aModal): void`
- `setMoodleUI(double index, MoodlesUI aMoodleUI): void`
- `setMouseArrow(Texture aMouseArrow): void`
- `setMouseAttack(Texture aMouseAttack): void`
- `setMouseExamine(Texture aMouseExamine): void`
- `setMouseGrab(Texture aMouseGrab): void`
- `setPicked(IsoObjectPicker.ClickObject aPicked): void`
- `setPickedTile(Vector2 aPickedTile): void`
- `setPickedTileLocal(Vector2 aPickedTileLocal): void`
- `setPlayerInventory(int playerIndex, UIElementInterface inventory, UIElementInterface loot): void`
- `setPlayerInventoryTooltip(int playerIndex, UIElementInterface inventory, UIElementInterface loot): void`
- `setProgressBar(double index, ActionProgressBar aProgressBar): void`
- `setRightDownObject(IsoObject aRightDownObject): void`
- `setShowLuaDebuggerOnError(boolean show): void`
- `setShowPausedMessage(boolean showPausedMessage): void`
- `setSpeedControls(SpeedControls aSpeedControls): void`
- `setToolTip(ObjectTooltip aToolTip): void`
- `setUI(ArrayList<UIElementInterface> aUI): void`
- `setVisibleAllUI(boolean visible): void`
- `setbFadeBeforeUI(boolean abFadeBeforeUI): void`
- `tableget(KahluaTable table, Object key): Object`
- `trySetProgressBarValue(int index, float value): boolean`
- `update(): void`
- `updateBeforeFadeOut(): void`

Constructors: `UIManager.new()`.

Static fields (a copy of the value taken when the class is exposed): `DEBUGGER_FPS: int`, `DoneTutorials: ArrayList<String>`, `MoodleUI: MoodlesUI[]`, `PickedTile: Vector2`, `PickedTileLocal: Vector2`, `ProgressBar: ActionProgressBar[]`, `UI: ArrayList<UIElementInterface>`, `black: Texture`, `clock: Clock`, `debugConsole: UIDebugConsole`, `defaultthread: KahluaThread`, `doTick: boolean`, `fadeAlpha: float`, `fadeBeforeUi: boolean`, `fadeInTime: int`, `fadeInTimeMax: int`, `fadingOut: boolean`, `lastAlpha: float`, `lastMouseTexture: Texture`, `lastMouseX: int`, `lastMouseY: int`, `lastOffX: float`, `lastOffY: float`, `lastPicked: IsoObject`, `luaDebuggerAction: String`, `modal: ModalDialog`, `mouseArrow: Texture`, `mouseAttack: Texture`, `mouseExamine: Texture`, `mouseGrab: Texture`, `picked: IsoObjectPicker.ClickObject`, `previousThread: KahluaThread`, `rightDownObject: IsoObject`, `speedControls: SpeedControls`, `suspend: boolean`, `toTop: ArrayList<UIElementInterface>`, `toolTip: ObjectTooltip`, `uiFbo: TextureFBO`, `uiRenderIntervalMS: long`, `uiRenderTimeMS: long`, `uiTextureContentsValid: boolean`, `uiUpdateIntervalMS: long`, `uiUpdateTimeMS: long`, `useUiFbo: boolean`, `visibleAllUi: boolean`.

### UITextBox2

`zombie.ui.UITextBox2`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (161), listed on their own entries.

Methods, called as `obj:name(...)`:

- `ClearHighlights(): void`
- `SetText(String text): void`
- `clearInput(): void`
- `copyToClipboard(): void`
- `cutToClipboard(): void`
- `focus(): void`
- `getCursorLine(): int`
- `getCursorPos(): int`
- `getForceUpperCase(): boolean`
- `getFrame(): UINineGrid`
- `getFrameAlpha(): float`
- `getHasFrame(): boolean`
- `getInset(): int`
- `getInternalText(): String`
- `getMaxLines(): int`
- `getMaxTextLength(): int`
- `getPlaceholderText(): String`
- `getStandardFrameColour(): Color`
- `getText(): String`
- `hasClearButton(): boolean`
- `ignoreFirstInput(): void`
- `isDoingTextEntry(): boolean`
- `isEditable(): boolean`
- `isFocused(): boolean`
- `isIgnoreFirst(): boolean`
- `isMasked(): boolean`
- `isMultipleLine(): boolean`
- `isOnlyNumbers(): boolean`
- `isOnlyText(): boolean`
- `isSelectable(): boolean`
- `isTextLimit(): boolean`
- `onCommandEntered(): void`
- `onKeyBack(): void`
- `onKeyDelete(): void`
- `onKeyDown(): void`
- `onKeyEnd(): void`
- `onKeyEnter(): void`
- `onKeyHome(): void`
- `onKeyLeft(): void`
- `onKeyRight(): void`
- `onKeyUp(): void`
- `onLostFocus(): void`
- `onMouseDown(double x, double y): Boolean`
- `onMouseMove(double dx, double dy): Boolean`
- `onMouseMoveOutside(double dx, double dy): void`
- `onMouseUp(double x, double y): Boolean`
- `onMouseUpOutside(double x, double y): void`
- `onOtherKey(int key): void`
- `onPressDown(): void`
- `onPressUp(): void`
- `onTextChange(): void`
- `onresize(): void`
- `pasteFromClipboard(): void`
- `putCharacter(char eventChar): void`
- `render(): void`
- `resetBlink(): void`
- `selectAll(): void`
- `setCentreVertically(boolean b): void`
- `setClearButton(boolean hasButton): void`
- `setCursorLine(int line): void`
- `setCursorPos(int charIndex): void`
- `setDoingTextEntry(boolean value): void`
- `setEditable(boolean b): void`
- `setFont(UIFont font): void`
- `setForceUpperCase(boolean forceUpperCase): void`
- `setFrameAlpha(float alpha): void`
- `setHasFrame(boolean hasFrame): void`
- `setIgnoreFirst(boolean value): void`
- `setMasked(boolean b): void`
- `setMaxLines(int maxLines): void`
- `setMaxTextLength(int maxTextLength): void`
- `setMultipleLine(boolean multiple): void`
- `setOnlyNumbers(boolean onlyNumbers): void`
- `setOnlyText(boolean onlyText): void`
- `setPlaceholderText(String text): void`
- `setPlaceholderTextColor(ColorInfo color): void`
- `setPlaceholderTextRGBA(float r, float g, float b, float a): void`
- `setSelectable(boolean b): void`
- `setSelectingRange(boolean value): void`
- `setTextColor(ColorInfo newColor): void`
- `setTextRGBA(float r, float g, float b, float a): void`
- `setWrapLines(boolean b): void`
- `toDisplayLine(int textOffset): int`
- `unfocus(): void`
- `update(): void`
- `updateText(): void`

Constructors: `UITextBox2.new(UIFont font, int x, int y, int width, int height, String text, boolean hasFrame)`.

### UITransition

`zombie.ui.UITransition`, class.

Methods, called as `obj:name(...)`:

- `fraction(): float`
- `getElapsed(): float`
- `init(float duration, boolean fadeOut): void`
- `reset(): void`
- `setElapsed(float elapsed): void`
- `setFadeIn(boolean fadeIn): void`
- `setIgnoreUpdateTime(boolean ignore): void`
- `update(): void`

Static functions, called as `UITransition.name(...)`:

- `UpdateAll(): void`

Constructors: `UITransition.new()`.

### VehicleGauge

`zombie.ui.VehicleGauge`, class. Extends [UIElement](#uielement). Also has the methods of [UIElement](#uielement) (168), listed on their own entries.

Methods, called as `obj:name(...)`:

- `render(): void`
- `setNeedleWidth(int newSize): void`
- `setTexture(Texture newText): void`
- `setValue(float value): void`

Constructors: `VehicleGauge.new(Texture texture, int needleX, int needleY, float minAngle, float maxAngle)`.
