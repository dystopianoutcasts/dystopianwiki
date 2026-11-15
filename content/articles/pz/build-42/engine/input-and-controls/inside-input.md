---
id: build-42-inside-input
slug: inside-input
title: 'Inside input'
game: pz
version: build-42
section: engine
category: input-and-controls
difficulty: advanced
tags:
  - engine
  - input
  - events
  - modding
  - controller
excerpt: >-
  How a key press, a mouse click or a controller button becomes a Lua event in Build 42.22: the per-frame states, who fires what, in what order, and which events carry which arguments.
last_updated: '2026-11-15'
related_articles:
  - how-controls-and-keybinds-work
  - keys-events-and-mod-keybinds
  - controllers-and-joypads
  - mouse-and-aiming
  - input-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#one-frame-of-input) | [server owners](#which-side-runs-input) | players should start at [How controls and keybinds work](/pz/build-42/engine/input-and-controls/how-controls-and-keybinds-work)

:::callout[The 1-minute version]{kind=key}
- Hardware is read on the render thread into a spare copy of the state. The game thread swaps to that copy once per frame, then fires events from the difference between this frame and the last.
- `OnKeyPressed` fires when a keyboard key is released, not when it goes down. `OnKeyStartPressed` fires on the way down, and `OnKeyKeepPressed` fires each frame the key stays down.
- A mouse button reaches the same three key events as a key code of 10000 plus the button number, but it follows different rules: the left button fires on press, and the right button fires after a short hold.
- A UI element that asks for key events can consume a key before the key events fire. A text box that is taking text stops them too.
- Controller buttons have no Java event. Lua polls them every render tick and calls a joypad method on the focused UI element.
:::

:::facts
- **Key events** 3 main ones on the keyboard, plus 3 custom-UI ones with no vanilla listener
- **Key slots** 256 keyboard key states per copy
- **Mouse key codes** 10000 and up (left button 10000, right 10001)
- **Right-button delay** 0.15 seconds before the delayed press counts
- **Controller slots** 16
:::

## The parts

Input is built from a keyboard layer, a mouse layer, a controller layer, a bindings table and the UI layer that sits in front of them.

::::cards
:::card[GameKeyboard]{accent=orange}
Holds this frame's and last frame's key states, and fires the key events. Its states come from `KeyboardState`, one polled on the render thread and one in use on the game thread.
:::
:::card[Mouse]{accent=blue}
Holds the cursor position, button states, the wheel change and a timer for the right button. Its states come from `MouseState` in the same two-copy way.
:::
:::card[Input and JoypadManager]{accent=purple}
`Input` (reached as `GameWindow.GameInput`) polls up to 16 controllers and reports connections. `JoypadManager` holds the per-controller settings and answers button and stick questions.
:::
:::card[Core key bindings]{accent=cream}
`Core` stores each named binding as a key, an optional alternate key and three modifier flags. `KeybindId` names the vanilla ones.
:::
:::card[UIManager]{accent=orange}
Offers every key and mouse event to the UI elements first, fires the mouse events, and decides what the world gets.
:::
::::

The classes are `GameKeyboard`, `Mouse`, `Input`, `JoypadManager`, `KeybindId`, `KeyboardState` and `MouseState` with their caches, `ControllerState` and `ControllerStateCache`. :cite[(`zombie/input/GameKeyboard.java:20-26`, `zombie/input/Mouse.java:25-46`, `zombie/core/input/Input.java:21-27`, `zombie/input/JoypadManager.java:35-39`, `zombie/input/KeybindId.java:16`, `zombie/core/Core.java:388-390`, `zombie/core/Core.java:4529-4535`)]

## One frame of input

Each frame, the game thread reads the polled state, updates the mouse, then the keyboard, then the controllers, then the UI, and the events fire in that order.

:::flow[One pass of the game thread's per-frame code]
- Render thread: poll the hardware into the spare copy
- `Mouse.update`
- `GameKeyboard.update` fires the key events
- `GameInput.updateGameThread` checks the controllers
- `UIManager.update` fires the mouse events
- An A press on an active controller fires the joypad activate events
:::

The first step runs on the render thread, and it only fills the spare copy. :cite[(`zombie/core/opengl/RenderThread.java:120-136`)] The other steps are in `GameWindow.logic`, in the order drawn: the mouse, the keyboard, the controllers, then the UI. :cite[(`zombie/GameWindow.java:281`, `zombie/GameWindow.java:312-320`, `zombie/GameWindow.java:330-332`)] The activate check for the A button comes after the UI step. :cite[(`zombie/GameWindow.java:343-358`)]

The two-copy trick is the same for keys, mouse and controllers. `poll` fills the copy that is being polled, and `swap` makes it the copy in use and starts the next one. :cite[(`zombie/input/KeyboardStateCache.java:16-34`, `zombie/input/MouseStateCache.java:16-34`, `zombie/input/ControllerStateCache.java:20-47`)] On the very first frames `update` only swaps, until the device exists. :cite[(`zombie/input/GameKeyboard.java:29-31`, `zombie/input/Mouse.java:168-172`)]

## Keyboard events

For each key from 1 up, the game compares this frame with the last and fires the events for the one case that applies, in a fixed order.

Each copy holds 256 key states. :cite[(`zombie/input/KeyboardState.java:22-27`)] `GameKeyboard.update` stores the old state in `lastDown`, reads the new one into `down`, then tests three cases for each key in turn: just released, still held, just pressed. :cite[(`zombie/input/GameKeyboard.java:41-93`)]

| Case | Events fired, in order | Argument | Code |
|---|---|---|---|
| Key released this frame | `OnKeyPressed`, then `OnCustomUIKey`, then `OnCustomUIKeyReleased` | the key code | :cite[(`zombie/input/GameKeyboard.java:44-66`)] |
| Key held for two frames | `OnKeyKeepPressed` | the key code | :cite[(`zombie/input/GameKeyboard.java:68-76`)] |
| Key went down this frame | `OnKeyStartPressed`, then `OnCustomUIKeyPressed` | the key code | :cite[(`zombie/input/GameKeyboard.java:78-92`)] |

The names are easy to misread. In this capture `OnKeyPressed` fires on release, so it is the "key up" event, and `OnKeyStartPressed` is the "key down" one. :cite[(`zombie/input/GameKeyboard.java:44-60`, `zombie/input/GameKeyboard.java:78-87`)] The `OnCustomUIKey*` events have no listener in vanilla Lua. :cite[(`api/events.jsonl:55-57`)]

Several things stop the events before they fire:

- A key that is released while the `eatKey` flag is set only clears the flag. `GameKeyboard.eatKeyPress` sets the flag. :cite[(`zombie/input/GameKeyboard.java:45-48`, `zombie/input/GameKeyboard.java:186-190`)]
- Nothing fires while `noEventsWhileLoading` is true or while a text box is taking text. :cite[(`zombie/input/GameKeyboard.java:39`, `zombie/input/GameKeyboard.java:50`, `zombie/input/GameKeyboard.java:69`, `zombie/input/GameKeyboard.java:78-82`)]
- `OnKeyPressed`, `OnKeyKeepPressed` and `OnKeyStartPressed` are skipped when `doLuaKeyPressed` is false. The key binding dialog turns that off while it is open. :cite[(`zombie/input/GameKeyboard.java:58`, `zombie/input/GameKeyboard.java:73`, `zombie/input/GameKeyboard.java:85`, `media/lua/client/OptionScreens/MainOptions.lua:3662`)]
- A visible UI element that wants key events is asked first, from the top element down. Its `onKeyPress`, `onKeyRepeat` or `onKeyRelease` Lua function is called, and if its `isKeyConsumed` returns true, the key event does not fire. :cite[(`zombie/ui/UIManager.java:1450-1481`, `zombie/ui/UIElement.java:2164-2224`)]

The query methods use the same copies. `isKeyDown` reads the current copy, `wasKeyDown` the last frame's, and `isKeyPressed` is down now and not down last frame. A key code of 10000 or more is sent to the mouse, and the keyboard answers false while a text box is taking text. :cite[(`zombie/input/GameKeyboard.java:111-113`, `zombie/input/GameKeyboard.java:129-137`, `zombie/input/GameKeyboard.java:164-172`)] Looking a binding up by name works from the binding table, as described on [Keys, events and mod keybinds](/pz/build-42/engine/input-and-controls/keys-events-and-mod-keybinds). :cite[(`zombie/input/GameKeyboard.java:139-142`, `zombie/core/Core.java:2421-2435`)]

## Mouse events

The mouse state is read once per frame, then the UI offers each button change to the interface before the world sees it.

`Mouse.update` flips the vertical position so that 0 is the top of the screen, copies the old button states to `buttonPrevStates`, reads the wheel change, and adds up how long the right button has been held. :cite[(`zombie/input/Mouse.java:179-210`)] At the end it updates the aim positions of players who use a controller. :cite[(`zombie/input/Mouse.java:216-217`)]

Then `UIManager.update` runs the mouse step. For each button it offers the press or release to the UI elements from the top down. A click that the UI consumed is not passed to the world. :cite[(`zombie/ui/UIManager.java:584-588`, `zombie/ui/UIManager.java:666-709`)] These events then fire for the world:

| Event | Fires when | Arguments | Code |
|---|---|---|---|
| `OnMouseDown` | left button pressed, not consumed by the UI | x, y | :cite[(`zombie/ui/UIManager.java:720-722`)] |
| `OnMouseUp` | left button released, not consumed (the consumed flag is set only on the press or release frame) | x, y | :cite[(`zombie/ui/UIManager.java:729-731`)] |
| `OnRightMouseDown` | right button pressed, not consumed | x, y | :cite[(`zombie/ui/UIManager.java:737-739`)] |
| `OnRightMouseUp` | right button released, not consumed | x, y | :cite[(`zombie/ui/UIManager.java:757-759`)] |
| `OnMouseWheel` | the wheel moved | wheel value | :cite[(`zombie/ui/UIManager.java:613-627`)] |
| `OnMouseMove` | the mouse moved, no UI element consumed the move and player 0 exists | x, y, world x, world y | :cite[(`zombie/ui/UIManager.java:633-646`)] |

In `OnMouseDown`, the x and y are `Mouse.getXA` and `Mouse.getYA`, and the last two numbers of `OnMouseMove` are `Mouse.getX` and `Mouse.getY`, which are scaled by the zoom. :cite[(`zombie/ui/UIManager.java:527-530`, `zombie/input/Mouse.java:61-75`)] The object events are covered on [Mouse and aiming](/pz/build-42/engine/input-and-controls/mouse-and-aiming).

A mouse button also reaches the key events with the code 10000 plus the button number.

The left button fires `OnKeyStartPressed` and `OnKeyPressed` together on press, which is not the keyboard order, and fires `OnKeyKeepPressed` each frame while it is held, but only if the UI did not consume the click. :cite[(`zombie/ui/UIManager.java:720-735`)] The right button fires `OnKeyKeepPressed` while held, and fires `OnKeyStartPressed` and `OnKeyPressed` once the delay test is true, and the press events need the UI not to have consumed the right click. :cite[(`zombie/ui/UIManager.java:777-794`, `zombie/input/Mouse.java:116-118`)] Buttons 2 and up fire both press events on press and `OnKeyKeepPressed` while held, with no UI check. :cite[(`zombie/ui/UIManager.java:711-718`)] The delay test reads true on every frame after 0.15 seconds, so by reading the code the right-button press events seem to repeat each frame while the button is held (read, not run in a game). :cite[(`zombie/input/Mouse.java:28-29`, `zombie/input/Mouse.java:116-118`, `zombie/ui/UIManager.java:791-794`)]

## Controller events

The engine's own controller events cover connecting and activating, and button presses reach Lua through polling, not through events.

`Input.updateGameThread` checks which of the 16 slots changed, then fires `OnGamepadDisconnect` and `OnGamepadConnect` with the controller id. It also keeps each button's pressed and previous state, and tells `JoypadManager` about activity. :cite[(`zombie/core/input/Input.java:185-197`, `zombie/core/input/Input.java:225-285`)] `JoypadManager` fires `OnJoypadBeforeDeactivate` and `OnJoypadDeactivate` on a disconnect, and `OnJoypadBeforeReactivate` and `OnJoypadReactivate` on a reconnect of a controller the manager already knows, each with the joypad id. :cite[(`zombie/input/JoypadManager.java:576-592`)]

The Java side has no per-button event. The Lua file `JoyPadSetup.lua` registers a function on `OnRenderTick`, and on each tick it asks `JoypadButton.isButtonDown` for every button and calls `onPressButton`, `onReleaseButton` or `onHoldButton`. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:956-972`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:979-986`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:1262`)] How that reaches your window is on [Controllers and joypads](/pz/build-42/engine/input-and-controls/controllers-and-joypads).

## Bindings and KeybindId

A binding is a name, a key, an alternate key and three modifier flags, and it is kept in one table in `Core`.

`Core.addKeyBinding` stores the binding under its name and also under its primary key, so the engine can find all bindings on one key. :cite[(`zombie/core/Core.java:2442-2458`)] `KeybindId` is a registry of names, and the vanilla ones are registered as constants. :cite[(`zombie/input/KeybindId.java:14-20`, `zombie/input/KeybindId.java:110-120`)] The Lua file that supplies default keys, and how a mod adds one, are on the next page: [Keys, events and mod keybinds](/pz/build-42/engine/input-and-controls/keys-events-and-mod-keybinds).

## Which side runs input

Input is read on the machine that has the keyboard, mouse or controller, so its events are client or single-player events.

The calls above are in the game window's per-frame code. :cite[(`zombie/GameWindow.java:281-332`)] Whether a dedicated server runs that code is not shown here (not verified), and a server has no keyboard to read.

> **Warning:** Server owners should not trust a key press or a click as proof of anything. Input events fire on the client, so anything a handler sends to the server has to be checked by the server.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and Lua. We did not run a game, so the order of events in a frame and the repeating right-button press are read, not watched. Not verified: whether a dedicated server runs the per-frame input code, and how many times a hold of the right button fires the delayed press in a real game.
:::
