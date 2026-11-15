---
id: build-42-mouse-and-aiming
slug: mouse-and-aiming
title: 'Mouse and aiming'
game: pz
version: build-42
section: engine
category: input-and-controls
difficulty: advanced
tags:
  - engine
  - input
  - mouse
  - aiming
  - modding
  - lua
excerpt: >-
  How Build 42.22 turns mouse clicks into world and menu events, why the UI gets the click first, and how the aiming modes and the reticle follow the mouse or a stick.
last_updated: '2026-11-15'
related_articles:
  - how-controls-and-keybinds-work
  - inside-input
  - keys-events-and-mod-keybinds
  - controllers-and-joypads
  - input-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#the-mouse-state) | [server owners](#a-note-for-server-owners) | players should start at [How controls and keybinds work](/pz/build-42/engine/input-and-controls/how-controls-and-keybinds-work)

:::callout[The 1-minute version]{kind=key}
- The mouse position comes in two forms. `getMouseX` and `getMouseY` are in screen units, and `getMouseXScaled` and `getMouseYScaled` are multiplied by the zoom.
- The UI gets each click first. A click that a UI element consumes does not reach the world events.
- The `OnObject...MouseButton...` events carry the object under the cursor, and they only fire when there is one. The "left" events follow the Attack/Click binding, not the left button itself.
- A right click opens the world context menu from the right-button release, and only when the click is not a double click and the button was held for less than 500 milliseconds over the same object (read from the Lua, not run in a game).
- Aiming has nine modes, chosen by the weapon, a found target and the precise-aim control. `getAimingMode()` on a character returns the current one.
- The reticle position is the mouse position for the keyboard and mouse, and a position worked out from the right stick for a controller.
:::

:::facts
- **Right-click hold limit** 500 milliseconds in the Lua handler
- **Right-button delay** 0.15 seconds before an Aim bound to the right button counts as down
- **Aiming modes** 9, in the enum `AimingMode`
- **Mouse key codes** 10000 and up, as the key events see them
- **Object events** 4: left down, left up, right down, right up
:::

## The mouse state

The mouse is read once per frame into a few static fields, and the Lua can ask for them.

`Mouse.update` fills the position, the wheel change, and the pressed and previous state of each button. :cite[(`zombie/input/Mouse.java:179-204`)] The vertical position is flipped so that 0 is the top of the screen. :cite[(`zombie/input/Mouse.java:182`)]

These Lua globals read it:

| Call | Returns | Code |
|---|---|---|
| `getMouseX()`, `getMouseY()` | the position in screen units | :cite[(`zombie/Lua/LuaManager.java:7957-7962`, `zombie/Lua/LuaManager.java:7989-7994`)] |
| `getMouseXScaled()`, `getMouseYScaled()` | the position multiplied by the zoom | :cite[(`zombie/Lua/LuaManager.java:7941-7955`, `zombie/input/Mouse.java:69-75`)] |
| `isMouseButtonDown(n)`, `isMouseButtonPressed(n)` | the button state | :cite[(`zombie/Lua/LuaManager.java:7973-7987`)] |
| `Mouse.isLeftDown()` and the other `Mouse` methods | the same state, by button | :cite[(`zombie/input/Mouse.java:81-166`)] |

The `Mouse` constants for the buttons are `LMB` (10000), `RMB` (10001) and `MMB` (10002), and the key events and the binding system use them as key codes. :cite[(`zombie/input/Mouse.java:30-41`)]

A click that a UI element handled can be blocked from the key checks. `UIBlockButtonDown` marks a button as captured, and `isButtonDownUICheck` then answers false until the button is released. :cite[(`zombie/input/Mouse.java:97-114`)] The right button has an extra rule: `isButtonDownUICheck(1)` answers only after the button has been held for 0.15 seconds. :cite[(`zombie/input/Mouse.java:28-29`, `zombie/input/Mouse.java:101-118`)] So a binding on the right button, such as the default alternate Aim key, counts as down only after that hold. :cite[(`media/lua/shared/keyBinding.lua:75-77`, `zombie/input/GameKeyboard.java:129-131`)]

## UI first, then the world

Every click goes to the UI elements from the top down, and only a click that none of them consumed reaches the world.

`UIManager.updateMouseButtons` runs the press and release of each button over the UI list and records whether the left and right clicks were consumed. :cite[(`zombie/ui/UIManager.java:666-709`)] A consumed left click calls `Mouse.UIBlockButtonDown(0)` instead of firing `OnMouseDown`, and the right button does the same. :cite[(`zombie/ui/UIManager.java:720-728`, `zombie/ui/UIManager.java:737-745`)] So a mod window sees a click first and can stop it from becoming a world click. How an element asks for that is in `onConsumeMouseButtonDown` and the element's `consumeMouseEvents` flag. :cite[(`zombie/ui/UIElement.java:170-174`, `zombie/ui/UIElement.java:1377-1383`)]

The plain events are `OnMouseDown`, `OnMouseUp`, `OnRightMouseDown`, `OnRightMouseUp`, `OnMouseWheel` and `OnMouseMove`. When each fires and with which arguments is on [Inside input](/pz/build-42/engine/input-and-controls/inside-input).

## World clicks on an object

The four object events pass the object under the cursor, and they fire only when the picker found one.

| Event | Arguments | Fires when | Code |
|---|---|---|---|
| `OnObjectLeftMouseButtonDown` | object, x, y | the Attack/Click binding goes down, there is a picked object, and the click was not consumed by the UI | :cite[(`zombie/ui/UIManager.java:590-594`)] |
| `OnObjectLeftMouseButtonUp` | object, x, y | the Attack/Click binding was down on the previous frame, there is a picked object, and the click was not consumed (the consumed flag is set only on the press or release frame, so a drag that began on a window can still fire it over objects) | :cite[(`zombie/ui/UIManager.java:608-611`)] |
| `OnObjectRightMouseButtonDown` | object, x, y | the right button goes down, the UI did not consume it and there is a picked object | :cite[(`zombie/ui/UIManager.java:737-742`)] |
| `OnObjectRightMouseButtonUp` | object, x, y | the right button is released, the UI did not consume it and there is a picked object | :cite[(`zombie/ui/UIManager.java:757-762`)] |

The picked object comes from `IsoObjectPicker.ContextPick` at the mouse position. It is refreshed in the move step, after the buttons, so the click events use the pick from the previous frame. :cite[(`zombie/ui/UIManager.java:637-641`, `zombie/ui/UIManager.java:822-824`)] The x and y in these events are the UI-unit mouse position. :cite[(`zombie/ui/UIManager.java:527-528`)]

Two details are easy to miss. The "left" events follow the binding named Attack/Click, so if a player rebinds Attack/Click to a keyboard key, that key fires them. :cite[(`zombie/ui/UIManager.java:590-594`, `media/lua/shared/keyBinding.lua:67-68`)] And the up event tests `whichKeyWasDown`, which is true on every frame after a frame where the key was down, so by reading the code it fires on the release frame and on each held frame except the press frame (read, not run in a game). :cite[(`zombie/ui/UIManager.java:608-611`, `zombie/input/GameKeyboard.java:164-184`)] Vanilla's handler protects itself: it clears its stored object on the first call, so the click is done once. :cite[(`media/lua/server/ISObjectClickHandler.lua:345-362`)]

The left press also does a second job. If the click is not a building action, the game is not paused and the player is not aiming or asleep, it calls the picked object's `onMouseLeftClick`. :cite[(`zombie/ui/UIManager.java:596-605`)] The right press sets the game speed back to normal and calls `onMouseRightClick` when a picked object exists and the player is not aiming, not asleep and the game is not paused. :cite[(`zombie/ui/UIManager.java:747-756`)]

## Right-click menus and UI clicks

The world menu opens when the right button is released over an object, and a UI element that consumed the click stops that.

:::flow[From a right click to the world menu]
- The right button goes down and then up over an object
- `OnObjectRightMouseButtonUp` fires with the object
- Vanilla's handler checks the hold time and the object
- It gathers the doors, windows and other objects at the point
- The context manager builds the menu and fires `OnFillWorldObjectContextMenu`
:::

On release, `UIManager` fires `OnObjectRightMouseButtonUp` only when the UI did not consume the click and an object is picked. :cite[(`zombie/ui/UIManager.java:757-762`)] Vanilla's handler listens for it. It opens the menu only when the click is not a double click (a double click goes to `doRDoubleClick`), the button was held for under 500 milliseconds and the same object was pressed and released. :cite[(`media/lua/server/ISObjectClickHandler.lua:387-401`, `media/lua/server/ISObjectClickHandler.lua:425`)]

Then `doRClick` collects the objects at the point: the object itself when its square is seen or when it is a window, door, thumpable or tree, plus any door, window, window frame, thumpable, hoppable and tree the picker finds. It returns without a menu if the list is empty. :cite[(`media/lua/server/ISObjectClickHandler.lua:23-60`)] It then asks the context manager for the menu. :cite[(`media/lua/server/ISObjectClickHandler.lua:63`)] The handler uses player 0 for the character. :cite[(`media/lua/server/ISObjectClickHandler.lua:24`)]

The menu code triggers `OnFillWorldObjectContextMenu` for mods, unless the safehouse rule blocks it. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:209-214`, `media/lua/client/Context/ISContextManager.lua:23-27`)] The controller version of the same menu is on [Controllers and joypads](/pz/build-42/engine/input-and-controls/controllers-and-joypads).

A UI element that sits over the world stops this chain. When it consumes the right click, `OnRightMouseDown`, the object events and the world handlers do not run. :cite[(`zombie/ui/UIManager.java:737-745`, `zombie/ui/UIManager.java:757-763`)]

## Aiming modes

The aiming mode is one of nine values, chosen by the weapon, whether a target is found and whether the precise-aim control is down.

`IsoGameCharacter.getAimingMode()` returns `NOT_AIMING` when the character is not aiming. If a melee weapon is equipped it returns a melee mode, and for a ranged weapon it returns the precise or the plain ranged mode, depending on `isPrecisionAimKeyDown`. Unarmed gives an unarmed mode, and a target found picks the "target found" version. :cite[(`zombie/characters/IsoGameCharacter.java:16500-16515`)] The call is exposed to Lua, so a mod can read it. :cite[(`api/api.jsonl:14417`)]

Each mode carries five values that shape the aim point. :cite[(`zombie/input/AimingMode.java:19-43`)]

| Mode | Fixed distance | Lerp out | Lerp in | Min distance | Target |
|---|---|---|---|---|---|
| `UNARMED` | yes | -1 | -1 | 0.05 | no |
| `UNARMED_TARGET_FOUND` | yes | -1 | -1 | 0.05 | yes |
| `MELEE` | yes | -1 | -1 | 0.05 | no |
| `MELEE_TARGET_FOUND` | yes | -1 | -1 | 0.05 | yes |
| `RANGED` | yes | -1 | -1 | 0.05 | no |
| `RANGED_TARGET_FOUND` | yes | -1 | -1 | 0.05 | yes |
| `RANGED_PRECISE` | no | 0.065 | 0.095 | 0 | no |
| `RANGED_PRECISE_TARGET_FOUND` | no | 0.03 | 0.085 | 0 | yes |
| `NOT_AIMING` | yes | -1 | -1 | -1 | no |

The table is the enum's constructor arguments in order. :cite[(`zombie/input/AimingMode.java:19-27`)] In the fixed modes the lerp rates are not read, and a minimum distance of -1 is the flag for the snap case below.

`lerpAiming` then works out where the aim point goes.

In one case it snaps the point in front of the player, at a height of 0.57 above the player's floor level, or 0.468 with a firearm. That case is when the character is aiming but the aim key is up, or the mode is fixed with a minimum distance of -1, which is `NOT_AIMING`. :cite[(`zombie/input/AimingMode.java:27`, `zombie/input/AimingMode.java:45-47`, `zombie/input/AimingMode.java:78-80`, `zombie/input/AimingMode.java:97-107`)] For the other fixed modes it places the point a fixed distance from the player's screen center, in the direction of the target, scaled by the zoom. :cite[(`zombie/input/AimingMode.java:48-49`, `zombie/input/AimingMode.java:82-95`)] The two precise modes instead move the point toward the target step by step, with one rate when the target is farther from the player's center than the current aim point and another when it is nearer. :cite[(`zombie/input/AimingMode.java:69-72`)] :cite[(`zombie/input/AimingMode.java:50-75`)]

## The reticle and the aim point

The aim point is the mouse position for a keyboard player and a position derived from the right stick for a controller player.

`AimingReticle.getXA` and `getYA` return the stored controller position when the player's input mode is `GAMEPAD`, and `Mouse.getXA` and `Mouse.getYA` otherwise. :cite[(`zombie/input/AimingReticle.java:37-45`)] `Mouse.update` calls `AimingReticle.update` at its end, and that updates the stored position for each controller player from the player's aiming mode and the stick. :cite[(`zombie/input/Mouse.java:216-217`, `zombie/input/AimingReticle.java:94-111`)]

The stick value is first reshaped. A small deflection is cut off, the rest is scaled to a range, and the result is eased, then mapped onto the screen around the player's chest. :cite[(`zombie/input/AimingReticle.java:22-25`, `zombie/input/AimingReticle.java:47-92`)]

The character's aim direction is built from that position, converted to a world direction from the aim origin, when an aim control is down. :cite[(`zombie/characters/IsoPlayer.java:1691-1703`)] The picture follows the mode, for a local player only: the reticle is used while the precise-aim control is down with a firearm in hand, and the cursor otherwise. The precise mode itself needs the character to be aiming first. :cite[(`zombie/characters/IsoPlayer.java:2164-2169`)] The combat code also hands the "target found" flag of the current mode to the reticle. :cite[(`zombie/CombatManager.java:3536`)]

`isAimKeyDown()` and `isPrecisionAimKeyDown()` are exposed to Lua through `CharacterInputComponentEntity`, which the player uses. :cite[(`api/api.jsonl:12605`, `api/api.jsonl:12630`)] For the keyboard, the precise-aim control is the Aim key. For a controller, it is the `PrecisionAim` binding, and it does not count while the aim is being ignored, for example when a focused UI element sets `ignoreAim`. :cite[(`zombie/characters/component/CharacterInputComponent.java:346-362`)]

## Try it: log the aiming mode

This small mod prints the aiming mode each time it changes. It shows how a mod reads the state described above.

Put the file at `Zomboid/Workshop/AimLog/Contents/mods/AimLog/42/media/lua/client/AimLog.lua`. The mod also needs a `mod.info` with `id=AimLog` and an empty `common` folder, as on [Keys, events and mod keybinds](/pz/build-42/engine/input-and-controls/keys-events-and-mod-keybinds). Enable the mod in the game's Mods screen before you load a save.

```lua
-- 42/media/lua/client/AimLog.lua
local lastMode

local function onPlayerUpdate(player)
    if player ~= getPlayer() then return end
    local mode = player:getAimingMode()
    if mode ~= lastMode then
        lastMode = mode
        print("[AimLog] aiming mode: " .. tostring(mode))
    end
end

Events.OnPlayerUpdate.Add(onPlayerUpdate)
```

Load a save, raise a weapon with the Aim key, and look in `console.txt` for lines that start with `[AimLog]`. This was not run in a game. Not verified: how a Java enum value prints through `tostring` in the game's Lua.

`OnPlayerUpdate` passes the player. :cite[(`api/events.jsonl:150`)]

## A note for server owners

> **Warning:** The mouse position and the aim direction come from the client. A server that accepts an attack or a shot has to check it itself, because it cannot see the cursor.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 Java and Lua. We did not run a game, so the 500-millisecond rule, the repeating "up" event and the aiming pictures are read, not watched. Not verified: how an aiming mode prints in Lua, and how mouse aiming turns the cursor position into hits beyond the aim direction shown here.
:::
