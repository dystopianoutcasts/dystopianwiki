---
id: build-42-controllers-and-joypads
slug: controllers-and-joypads
title: 'Controllers and joypads'
game: pz
version: build-42
section: engine
category: input-and-controls
difficulty: intermediate
tags:
  - engine
  - input
  - controller
  - ui
  - modding
  - lua
excerpt: >-
  How a controller drives the interface in Build 42.22: joypad focus, the calls a UI element receives, the OnJoypad events, and how to make a mod window usable with a controller.
last_updated: '2026-11-15'
related_articles:
  - how-controls-and-keybinds-work
  - inside-input
  - keys-events-and-mod-keybinds
  - mouse-and-aiming
  - input-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#joypad-focus) | [server owners](#a-note-for-server-owners) | players should start at [How controls and keybinds work](/pz/build-42/engine/input-and-controls/how-controls-and-keybinds-work)

:::callout[The 1-minute version]{kind=key}
- A controller has no Java button events. Lua polls every button on each render tick and sends the press to the one UI element that has joypad focus for that player.
- If a player is on a controller, `JoypadState.players[playerNum + 1]` is that player's joypad data. Its `focus` field is the element that receives the buttons.
- Any element with focus switches the character's own game buttons off, so a window with focus must handle every button the player needs, including a way to close it.
- To make a window usable, derive from `ISPanelJoypad`, list its buttons with `insertNewLineOfButtons`, and call `setJoypadFocus(playerNum, window)` when it opens. Give the focus back when it closes.
- The `OnJoypad*` events report activation, disconnects and a debug overlay. They do not report button presses.
- Not run in a game: the example below is read against the 42.22 Lua.
:::

:::facts
- **Focus field** `JoypadState.players[playerNum + 1].focus`
- **Set focus** `setJoypadFocus(playerNum, element)`, and `nil` to release it
- **Button calls** `onJoypadDown(button, joypadData)` and `onJoypadButtonReleased(button, joypadData)`
- **Direction calls** `onJoypadDirUp`, `onJoypadDirDown`, `onJoypadDirLeft`, `onJoypadDirRight`
- **Hold to navigate** the right bumper, after the element's start delay
:::

## Joypad focus

Each player on a controller has one focused element, and button presses go to it, except in navigation mode, while the game is paused, or when nothing has focus.

The Lua file `JoyPadSetup.lua` keeps a joypad data table per player, and `getJoypadData(playerNum)` and `getJoypadFocus(playerNum)` read it. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:537-544`)] A player on keyboard and mouse has no entry, which is why vanilla windows test `JoypadState.players[player + 1]` before they touch focus. :cite[(`media/lua/client/TimedActions/ISOvenUITimedAction.lua:41-44`)]

`setJoypadFocus(playerNum, element)` stores the element as the focus and remembers the old one as the previous focus. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:546-569`)] The change takes effect on the next tick, when `updateJoypadFocus` calls `onGainJoypadFocus` on the new element and `onLoseJoypadFocus` on the old one. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:608-628`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:974-976`)]

Focus also changes what the player's character does. Any non-nil focus turns the character's game buttons off for a player who has a character, and the focused element's `ignoreAim` field decides whether the aiming stick is ignored too. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:600-606`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:630-638`)] With no focus, the game buttons are on and the button prompts are rebuilt. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:641-655`)]

Three helpers move focus back: `setPrevFocusForPlayer`, `setPrevPrevFocusForPlayer`, and `setJoypadFocus` with a saved element. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:571-598`)]

## How a button reaches your window

The Lua polls the controller each render tick and sends each change to the focused element.

:::flow[One button press, from the controller to your window]
- `OnRenderTick` runs the polling function for each controller
- The function compares each button with the last tick
- A new press calls `onPressButton`
- `onPressButton` calls the focused element's `onJoypadDown`
- Your window handles the button
:::

The polling function is registered on `OnRenderTick` and runs for all 16 controller slots, and it does nothing while `JoypadState.controllerTest` is set. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:979-986`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:1262`)] For every button it keeps the pressed and previous values, and it calls `onPressButton` on a new press, `onReleaseButton` on a release and `onHoldButton` while held. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:956-972`)]

`onPressButton` hands the button to `focus:onJoypadDown(button, joypadData)`. It does nothing while the player is in navigation mode, and while the game is paused unless the element set `activeWhilePaused`. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:431-458`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:564-566`)] With no focus, the press goes to the game's own button handling instead. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:436-439`)]

The directions come separately. The d-pad calls `onJoypadDirUp`, `onJoypadDirDown`, `onJoypadDirLeft` and `onJoypadDirRight` on the focused element, with a repeat while held. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:666-682`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:898-952`)] The d-pad is the controller's hat switch unless the controller's file gives it four button numbers. :cite[(`zombie/input/JoypadManager.java:677-691`, `zombie/Lua/LuaManager.java:6625-6648`)] Releases go to `onJoypadButtonReleased(button, joypadData)`. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:480-535`)]

## What a UI element receives

A plain element passes joypad calls up to its parent, and a joypad panel acts on them.

| Call | Arguments | What the base class does | Code |
|---|---|---|---|
| `onGainJoypadFocus` | joypad data | stores the data in `joyfocus` | :cite[(`media/lua/client/ISUI/ISUIElement.lua:649-651`)] |
| `onLoseJoypadFocus` | joypad data | clears the focus mark and `joyfocus` | :cite[(`media/lua/client/ISUI/ISUIElement.lua:644-647`)] |
| `onJoypadDown` | button, joypad data | passes it to the parent's `onJoypadDown_Descendant` | :cite[(`media/lua/client/ISUI/ISUIElement.lua:697-701`)] |
| `onJoypadButtonReleased` | button, joypad data | passes it to the parent | :cite[(`media/lua/client/ISUI/ISUIElement.lua:703-707`)] |
| `onJoypadDirUp`, `Down`, `Left`, `Right` | joypad data | passes it to the parent | :cite[(`media/lua/client/ISUI/ISUIElement.lua:709-731`)] |

`ISPanelJoypad` adds the grid behavior. :cite[(`media/lua/client/ISUI/ISPanelJoypad.lua:113-114`)] You give it rows of buttons with `insertNewLineOfButtons`, and the d-pad then moves a highlight between them. :cite[(`media/lua/client/ISUI/ISPanelJoypad.lua:127-150`, `media/lua/client/ISUI/ISPanelJoypad.lua:448-536`)] Pressing A on a highlighted button, combo box, tickbox, knob or radio group clicks it. :cite[(`media/lua/client/ISUI/ISPanelJoypad.lua:310-318`)]

It also lets you tie a button to a face button. `setISButtonForA`, `setISButtonForB`, `setISButtonForX` and `setISButtonForY` record a button and show its glyph, and the matching face button then clicks it, except that A first clicks a highlighted button of the panel. :cite[(`media/lua/client/ISUI/ISPanelJoypad.lua:255-273`, `media/lua/client/ISUI/ISPanelJoypad.lua:332-339`)] The clear calls remove them again. :cite[(`media/lua/client/ISUI/ISPanelJoypad.lua:275-308`)]

Two more fields matter. `activeWhilePaused` lets focus keep working while the game is paused. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:453-455`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:564-566`)] Holding the right bumper starts a navigation mode that moves between whole panels through the `joypadNavigate` table, unless the element sets `disableJoypadNavigation`. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:460-478`, `media/lua/client/ISUI/ISUIElement.lua:781-839`)]

## The OnJoypad events

The events mostly report a controller waking up or going away, and Lua already listens to all of them. Two more, `OnJoypadRenderUI` and `OnJoypadDebugRenderUIOptionSet`, only drive a debug overlay. :cite[(`zombie/input/JoypadManager.java:621-631`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:1230-1243`)]

:::chips
- OnGamepadConnect
- OnGamepadDisconnect
- OnJoypadActivate
- OnJoypadActivateUI
- OnJoypadBeforeDeactivate
- OnJoypadDeactivate
- OnJoypadBeforeReactivate
- OnJoypadReactivate
:::

`OnGamepadConnect` and `OnGamepadDisconnect` pass the controller id. The four `Before` and `Deactivate` or `Reactivate` events pass the joypad id. :cite[(`zombie/core/input/Input.java:185-197`, `zombie/input/JoypadManager.java:576-592`)] When A is pressed on an active controller, `OnJoypadActivate` fires if a character exists, and `OnJoypadActivateUI` fires if none does. :cite[(`zombie/GameWindow.java:343-358`)] Vanilla's `JoyPadSetup.lua` listens to all of them and uses them to assign controllers to players. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:1254-1261`)]

When a controller is about to disconnect, the focused element's `onJoypadBeforeDeactivate` is called, and `onJoypadBeforeReactivate` and `onJoypadReactivate` are called on reconnect if the element defines them. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:1056-1064`, `media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:1095-1116`)] After a disconnect the player gets a "disconnected" window. :cite[(`media/lua/client/ISUI/Gamepad/JoyPadSetup.lua:1086-1092`)]

## A complete example, from an empty folder

This mod adds an "Open HelloPad" option to the world right-click menu. It opens a small window with a Say hello button and a Close button that works with a mouse or a controller. The steps are read from the code, not run in a game.

**1. Make the folders.** Put the mod in the Workshop folder, with the mandatory `common` folder and a `42` folder:

```
Zomboid/Workshop/HelloPad/
  Contents/
    mods/
      HelloPad/
        common/                  <- must exist; empty is fine
        42/
          mod.info
          media/
            lua/
              client/
                HelloPad.lua
```

**2. Write `mod.info`.** Plain text, every key lowercase:

```
name=Hello Pad
id=HelloPad
description=A small window that works with a controller.
```

**3. Write `HelloPad.lua`.** It goes in the `client` folder because it draws a window and reads a controller on the player's own machine:

```lua
-- 42/media/lua/client/HelloPad.lua
require "ISUI/ISPanelJoypad"
require "ISUI/ISButton"

HelloPad = ISPanelJoypad:derive("HelloPad")

function HelloPad:createChildren()
    local btnW, btnH = 100, 25
    self.hello = ISButton:new(10, 40, btnW, btnH, "Say hello", self, HelloPad.onClick)
    self.hello.internal = "HELLO"
    self.hello:initialise()
    self.hello:instantiate()
    self:addChild(self.hello)

    self.close = ISButton:new(self.width - btnW - 10, 40, btnW, btnH, "Close", self, HelloPad.onClick)
    self.close.internal = "CLOSE"
    self.close:initialise()
    self.close:instantiate()
    self:addChild(self.close)

    self:insertNewLineOfButtons(self.hello, self.close)
end

function HelloPad:onClick(button)
    if button.internal == "HELLO" then
        self.character:setHaloNote("Hello from HelloPad")
    elseif button.internal == "CLOSE" then
        self:setVisible(false)
        self:removeFromUIManager()
        if JoypadState.players[self.playerNum + 1] then
            setJoypadFocus(self.playerNum, self.prevFocus)
        end
    end
end

function HelloPad:onGainJoypadFocus(joypadData)
    ISPanelJoypad.onGainJoypadFocus(self, joypadData)
    self.joypadIndexY = 1
    self.joypadIndex = 1
    self.joypadButtons = self.joypadButtonsY[self.joypadIndexY]
    self.joypadButtons[self.joypadIndex]:setJoypadFocused(true)
    self:setISButtonForB(self.close)
end

function HelloPad:onLoseJoypadFocus(joypadData)
    ISPanelJoypad.onLoseJoypadFocus(self, joypadData)
    self:clearISButtonB()
end

function HelloPad:new(x, y, width, height, character)
    local o = ISPanelJoypad:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.character = character
    o.playerNum = character:getPlayerNum()
    o.moveWithMouse = true
    return o
end

local function openHelloPad(playerNum)
    local playerObj = getSpecificPlayer(playerNum)
    local window = HelloPad:new(200, 200, 240, 90, playerObj)
    window:initialise()
    window:addToUIManager()
    local joypadData = JoypadState.players[playerNum + 1]
    if joypadData then
        window.prevFocus = joypadData.focus
        setJoypadFocus(playerNum, window)
    end
end

local function onFillWorldObjectContextMenu(player, context, worldobjects, test)
    if test then return ISWorldObjectContextMenu.setTest() end
    context:addOption("Open HelloPad", player, openHelloPad)
end

Events.OnFillWorldObjectContextMenu.Add(onFillWorldObjectContextMenu)
```

**4. Enable the mod and test.** Enable Hello Pad in the game's Mods screen before you load a save. With a mouse, right-click the ground and pick Open HelloPad. With a controller, open the world menu and pick the same option. Use the d-pad to move between the two buttons, A to press one, and B to close the window. This was not run in a game.

Why each part is there:

- `ISPanelJoypad:derive` gives the window the grid behavior and the A and B handling. :cite[(`media/lua/client/ISUI/ISPanelJoypad.lua:113-114`, `media/lua/client/ISUI/ISPanelJoypad.lua:310-343`)]
- `insertNewLineOfButtons` is how the panel learns which buttons the d-pad may move between. :cite[(`media/lua/client/ISUI/ISPanelJoypad.lua:127-150`)]
- `onGainJoypadFocus` sets the starting highlight and ties B to Close. The vanilla microwave window does the same. :cite[(`media/lua/client/ISUI/Fireplace/ISMicrowaveUI.lua:146-154`)]
- `openHelloPad` stores the old focus and calls `setJoypadFocus`, as the vanilla oven window's timed action does. :cite[(`media/lua/client/TimedActions/ISOvenUITimedAction.lua:41-44`)]
- The Close branch gives the focus back, as the vanilla microwave window does. :cite[(`media/lua/client/ISUI/Fireplace/ISMicrowaveUI.lua:124-132`)]
- `OnFillWorldObjectContextMenu` fires when the world menu is built, for the mouse and for a controller, unless `fetch.safehouseAllowInteract` is false. When `test` is true, a handler that wants to add something returns `ISWorldObjectContextMenu.setTest()`. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:122-128`, `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:209-214`, `media/lua/client/ISUI/ISButtonPrompt.lua:183`, `media/lua/client/ISUI/ISButtonPrompt.lua:1115`)]
- With a controller, choosing a menu option first closes the menu and hands focus back, then calls your function, so your `setJoypadFocus` is the last word. :cite[(`media/lua/client/ISUI/ISContextMenu.lua:256-259`, `media/lua/client/ISUI/ISContextMenu.lua:268-274`)]

If your window is not opened from a menu, it still needs some way to open for a controller user. The vanilla windows are opened by an action the player chose in a menu or on a prompt, and this page does not cover other ways in.

## A note for server owners

> **Warning:** A controller press is a client event like any other input. If a mod window sends a command to the server, the server has to check the request itself, because it cannot see which button was used.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 Java and Lua. We did not run a game or a controller, so the focus handoff, the navigation mode and the example are read, not watched. Not verified: how the options screen's controller tab behaves, how to open a window with a controller without a menu, how a controller user reaches the HelloPad world menu, and how a controller that is not reported as a gamepad behaves.
:::
