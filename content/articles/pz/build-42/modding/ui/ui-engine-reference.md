---
id: build-42-ui-engine-reference
slug: ui-engine-reference
title: UI engine reference and gotchas
game: pz
version: build-42
section: modding
category: ui
difficulty: intermediate
tags:
  - isui
  - anchors
  - iscollapsablewindow
  - engine-reference
excerpt: >-
  The UI traps in Build 42.22 that cost real test runs: anchors, the resize strip, list drawing, key events, drawing coordinates and the vehicle mechanics window, each read from the game code.
last_updated: '2026-11-21'
related_articles:
  - ui-overview
  - replacing-a-vanilla-window
  - ui-coordinate-traps
  - ui3dscene-a-car-in-a-mod-window
  - debugging-lua-in-b42
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [modders writing a panel](#1-anchors-must-go-through-the-setters) | [modders replacing the vehicle mechanics window](#7-vehicle-mechanics-specifics)

:::callout[The 1-minute version]{kind=key}
- Set anchors with the setter functions after `instantiate()`: the Java object copies the Lua fields once, when the element is instantiated.
- `ISCollapsableWindow` puts a full-width resize strip along its bottom edge, and its height comes from the Small font height read when the file loads.
- `doDrawItem` runs with `self` as the list, and it must return the next y.
- A text box that has focus stops the UI key handlers and the key events for every key; a window that closes on Escape needs `isKeyConsumed`, or the pause menu opens too.
- `drawLine2` draws in screen coordinates and `drawLine` in element coordinates; `rowAt` takes content coordinates.
- Vanilla builds the mechanics window once per player, hidden, and its open action fills that window in.
:::

:::facts
- **Resize strip height** half the Small-font button height plus 2
- **Text-box keys passed to `onOtherKey`** Escape (key 1) and Tab (key 15)
- **Places vanilla queues the open-mechanics action** 6 (3 in `ISVehicleMenu.lua`, 3 in `Vehicles.lua`)
- **Vanilla files that call `setWantKeyEvents(true)`** 22
- **`category = nodisplay` declarations in vehicle scripts** 126
:::

This page grew out of the Outcast Motors UI work, where several of these traps cost a test run each. Every claim below is stated as vanilla behavior and read from the 42.22 code. The window basics are in [UI overview](/pz/build-42/modding/ui/ui-overview). UI code runs on the client only, so every Lua call here is a client call.

## 1. Anchors must go through the setters

**Assigning an anchor field after `instantiate()` does nothing to the Java object, which is the side that enforces anchoring.**

```lua
-- BROKEN after instantiate(): updates the Lua table only.
btn.anchorTop, btn.anchorBottom = false, true

-- CORRECT.
btn:setAnchorTop(false)
btn:setAnchorBottom(true)
```

`instantiate()` makes the Java `UIElement` and copies the four anchor fields across once, then calls `createChildren`. :cite[(`media/lua/client/ISUI/ISUIElement.lua:993-1007`)] The setters write the field and also the Java object when one exists, so they work on either side of `instantiate()`. :cite[(`media/lua/client/ISUI/ISUIElement.lua:128-190`)]

A new element starts with `anchorLeft` and `anchorTop` true and the other two false. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1983-1986`)] Assigning the fields before `instantiate()` does work, because the copy then picks them up; vanilla's resize widget does it that way. :cite[(`media/lua/client/ISUI/ISCollapsableWindow.lua:43-44`)] The Java side applies anchors when the parent resizes: top and bottom together grow the height, bottom alone moves the element down, and the same holds for left and right. :cite[(`zombie/ui/UIElement.java:1418-1437`)]

The symptom is an element that sits correctly at the window's starting size and then stays welded in place while the window is resized. A sibling that used the setters, typically a scrolling list, stretches and grows over the frozen ones, which looks like a z-order bug. The same copied lines shipped in two Outcast mods. Grep any new panel for `.anchor` followed by `=`.

## 2. ISCollapsableWindow puts a full-width strip across the bottom edge

**`createChildren()` adds two resize widgets, and the second one covers the whole bottom edge.**

```lua
local resizeWidget = ISResizeWidget:new(self.width-rh, self.height-rh, rh, rh, self);        -- corner grip
resizeWidget = ISResizeWidget:new(0, self.height-rh, self.width-rh, rh, self, true);         -- full width
```

Both widgets are visible only when the window is resizable. :cite[(`media/lua/client/ISUI/ISCollapsableWindow.lua:32-49`)] A mouse press goes to the last-added child first, so a button you add after the window's own children is offered the press before the strip. :cite[(`zombie/ui/UIElement.java:1075-1082`)]

`resizeWidgetHeight()` returns half of `BUTTON_HGT` plus 2, and `BUTTON_HGT` is the Small font height plus 6, both read when the file loads. :cite[(`media/lua/client/ISUI/ISCollapsableWindow.lua:11-12`, `media/lua/client/ISUI/ISCollapsableWindow.lua:302-304`)] So the strip follows the font and is not a constant. Whether a button placed over it is clickable depends on which element is offered the press first, which is the child added last. Whether the UI scale option changes the height as well was not checked, as on [UI overview](/pz/build-42/modding/ui/ui-overview).

Reserve room for it the way vanilla's mechanics window does, with the measured height and no fixed number. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:141`)] `titleBarHeight()` is derived too: the larger of 16 and the title font height plus 1. :cite[(`media/lua/client/ISUI/ISCollapsableWindow.lua:298-300`)]

## 3. FONT_HGT_SMALL is not a global

**Each vanilla file declares its own file-local copy of `FONT_HGT_SMALL`, and none of them sets a global.**

```lua
local FONT_HGT_SMALL = getTextManager():getFontHeight(UIFont.Small)
```

`ISCollapsableWindow.lua` and `ISVehicleMechanics.lua` both open with that line. :cite[(`media/lua/client/ISUI/ISCollapsableWindow.lua:11`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:13`)] The debug tools keep theirs as a field instead, `ISDebugUtils.FONT_HGT_SMALL`. :cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugUtils.lua:4`)] Using the bare name without your own `local` reads `nil` and fails at its first arithmetic use, at panel construction.

Measure the font, and never hardcode a row or button height: the font option changes it, and a fixed height clips its own label.

## 4. doDrawItem: self is the list, and it returns the next y

**A `doDrawItem` you assign onto a list box runs with the list as `self`, and the list uses its return value as the next row's y.**

```lua
self.listbox.doDrawItem = MyPanel.drawRow

function MyPanel:drawRow(y, item, alt)
    local row = item.item        -- addItem(text, data) -> data is item.item
    local h   = self.itemheight
    ...
    return y + h
end
```

The default `ISScrollingListBox:doDrawItem` is a method of the list and returns the next y. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:304-323`)] The draw loop calls `self:doDrawItem(y, v, alt)` and then works out `v.height = y2 - y`. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:527-534`)] So reach your panel through `self.parent`, and set `listbox.parent` yourself if you need it.

A function that returns nothing leaves `y2` as `nil`, and the subtraction `y2 - y` is arithmetic on `nil`. The earlier version of this page said the rows silently stacked; at 42.22 the code points to an error on row one instead. This was read, not run in a game.

## 5. Keys: setWantKeyEvents, text boxes and Escape

**Setting `setWantKeyEvents(true)` claims keyboard input for your element, so implement `onKeyRelease` and `isKeyConsumed` or leave the flag off.**

The engine asks each visible element that wants key events, from the top of the stack down, and stops at whichever element answers true from `isKeyConsumed` after its `onKeyRelease`. :cite[(`zombie/ui/UIManager.java:1472-1481`, `zombie/ui/UIElement.java:2218-2221`)] An element with no `isKeyConsumed` counts as not consuming. :cite[(`zombie/ui/UIElement.java:2181-2188`)] 

The same consume step runs for key presses and key repeats, through `onKeyPress` and `onKeyRepeat`. :cite[(`zombie/ui/UIElement.java:2190-2210`, `zombie/input/GameKeyboard.java:69`, `zombie/input/GameKeyboard.java:83`)] So a window eats a key only when its `isKeyConsumed` returns true, and then the press never reaches `OnKeyStartPressed`, which is the event vanilla's hotbar is registered for. :cite[(`media/lua/client/Hotbar/ISHotbar.lua:888`)]

Movement keys are read by polling `GameKeyboard.isKeyDown` (the vehicle controller does it this way), not through the consume step. :cite[(`zombie/core/physics/CarController.java:947`)] Player walking input was not traced. One that sets the flag and defines neither method takes part in the pass for nothing.

Do not drop the flag on a window that replaces a vanilla one. Vanilla's mechanics window sets it and handles Escape, and also the action's own keybind, which closes the window like every other toggled window. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1533`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1537-1553`)]

```lua
function ISVehicleMechanics:onKeyRelease(key)
    if key == Keyboard.KEY_ESCAPE then
        if isPlayerDoingActionThatCanBeCancelled(self.chr) then
            stopDoingActionThatCanBeCancelled(self.chr)   -- cancel BEFORE closing
        else
            self:close()
        end
    end
    if getCore():isKey(KeybindId.VEHICLE_MECHANICS, key) then
        self:close()
    end
end
```

Escape cancels an in-progress action first, because Escape in the middle of a repair means stop. The helper functions are vanilla Lua globals. :cite[(`media/lua/client/OptionScreens/MainScreen.lua:1670-1677`)] The `KeybindId` form is how vanilla names keybinds now. The older string form `isKey("VehicleMechanics", key)` was not rechecked at 42.22.

Vanilla files that set the flag are not only debug tools: the 22 files include crafting, building, map, hutch and seat windows next to the animation, attachment and tile editors. The rule stands: claim key events only if you handle them, and if you replace a vanilla window, handle at least what it handled.

### Two key traps around it

**A focused text box stops key releases for every other element, and Escape needs `isKeyConsumed`.**

- **A focused text entry box.** While one is doing text entry, `GameKeyboard.update` skips the UI release, repeat and press handlers and the matching events (`OnKeyPressed`, `OnKeyKeepPressed`, `OnKeyStartPressed`), so your window's `onKeyRelease` never runs. :cite[(`zombie/input/GameKeyboard.java:39`, `zombie/input/GameKeyboard.java:50-59`, `zombie/input/GameKeyboard.java:69`, `zombie/input/GameKeyboard.java:83`)] The box itself is handed only Escape (key 1) and Tab (key 15), through `onOtherKey`, and the Escape press is eaten. :cite[(`zombie/core/Core.java:1629-1637`)] The Java side calls a Lua `onOtherKey` only if the table has one, and `ISTextEntryBox` has none. :cite[(`zombie/ui/UITextBox2.java:861-865`)] Give the box an `onOtherKey` that unfocuses it on Escape, and unfocus it when your window closes. A box left focused does not last forever: any left-click press unfocuses the active text box, except the chat box. :cite[(`zombie/ui/UIManager.java:672-674`, `zombie/core/Core.java:988-996`)] Until that click, keys are swallowed.
- **Escape and the pause menu.** The pause menu is an `OnKeyPressed` handler that opens on the main-menu keybind, Escape by default, and that event fires only when no element consumed the release. :cite[(`media/lua/client/OptionScreens/MainScreen.lua:1709-1710`, `media/lua/client/OptionScreens/MainScreen.lua:2161`, `media/lua/shared/keyBinding.lua:154-155`, `zombie/input/GameKeyboard.java:50-59`)] Without `isKeyConsumed`, Escape closes your window and then opens the pause menu as well. Vanilla's mechanics window answers true for Escape and its own keybind. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1537-1540`)]

Both are explained with the rest of the window-replacement traps in [Replacing or extending a vanilla window](/pz/build-42/modding/ui/replacing-a-vanilla-window).

## 6. Coordinates, and what an error costs

**Almost every draw call takes element coordinates, two things take another system, and a Lua error in `render` repeats every frame.**

Two calls switch coordinate systems, and the code and the fixes are in [UI coordinate traps](/pz/build-42/modding/ui/ui-coordinate-traps):

- `drawLine2` draws in screen coordinates, so element-local points put the line off by your window's position. Use `drawLine`, which takes a texture and a thickness and adds the element's position. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1229-1240`, `zombie/ui/UIElement.java:516-536`)]
- `ISScrollingListBox:rowAt(x, y)` takes content coordinates, the position in the whole list as if it were not scrolled. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:66-76`)]

`getText` returns the key itself when there is no translation, so a missing entry shows as `IGUI_VehiclePartCatbodywork` on screen, and the game logs the miss once in debug mode. :cite[(`zombie/core/Translator.java:488-505`)] Guard it where a raw id would look worse than the key. The text files are the JSON files under `media/lua/shared/Translate/EN/`.

`prerender` and `render` run for each rendered frame while an element is enabled and visible. :cite[(`zombie/ui/UIElement.java:1610-1640`)] A `pcall` around a failing call does not hide the stack trace, because the engine writes the error and a Lua stack trace to the log before `pcall` returns false; the settled explanation is in [Kahlua: what Project Zomboid Lua does not have](/pz/build-42/modding/lua-api/kahlua-what-project-zomboid-lua-does-not-have), section 6. So anything called from `render()` or `prerender()` must not raise repeatedly. The pattern the Outcast mods settled on is to catch once, report once per subject, and serve a fallback quietly after that.

## 7. Vehicle mechanics specifics

**These are the vanilla facts a replacement or extension of the vehicle mechanics window has to respect.**

### One interception point for opening the window

Vanilla builds the mechanics window once per player, hidden and disabled, when the player data is created, and `getPlayerMechanicsUI` returns it. :cite[(`media/lua/client/ISUI/PlayerData/ISPlayerDataObject.lua:119-122`, `media/lua/client/ISUI/PlayerData/ISPlayerData.lua:128-131`)] The open action then fills that existing window: it sets the vehicle, runs `initParts`, shows it and adds it to the UI manager. :cite[(`media/lua/client/Vehicles/TimedActions/ISOpenMechanicsUIAction.lua:28-36`)]

The action is queued from six places: three in `ISVehicleMenu.lua` and three in the hood handler `Vehicles.Use.EngineDoor`, which lives in `media/lua/server/`, a folder that also loads on a multiplayer client. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)] :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua:972`, `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua:1006`, `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua:1236`, `media/lua/server/Vehicles/Vehicles.lua:836`, `media/lua/server/Vehicles/Vehicles.lua:846`, `media/lua/server/Vehicles/Vehicles.lua:855`)] So `ISOpenMechanicsUIAction:perform()` is the one place every route passes, and patching the entry points one by one is six chances to miss one.

- **Chain, do not replace.** Another mod that assigns straight over `ISVehicleMechanics:doPartContextMenu` silently fights yours.
- **Call `ISBaseTimedAction.perform(self)`** when you intercept, or the action never leaves the queue and everything behind it stalls. :cite[(`media/lua/client/Vehicles/TimedActions/ISOpenMechanicsUIAction.lua:36`, `media/lua/shared/TimedActions/ISBaseTimedAction.lua:68-72`)] That looks like a frozen game, not a UI bug.
- **Mark the wrapper** so a Lua reload cannot wrap it twice:

```lua
if ISOpenMechanicsUIAction.perform ~= nil and ISOpenMechanicsUIAction.__myHooked ~= true then
    local previous = ISOpenMechanicsUIAction.perform
    ISOpenMechanicsUIAction.__myHooked = true
    function ISOpenMechanicsUIAction:perform() ... return previous(self) end
end
```

### Enumerating parts

`initParts` loops from 1 to `getPartCount()` and reads `getPartByIndex(i-1)`, so the index is zero-based while the loop is one-based. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:50-52`)] It skips every part whose category is `nodisplay`. That value is declared 126 times across the vehicle scripts under `media/scripts/generated/vehicles`, so hiding a part is an established move. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:53`)] Names come from `getText("IGUI_VehiclePart" .. part:getId())` and categories from `getText("IGUI_VehiclePartCat" .. category)`. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:59`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:64`)]

### Fitted or missing

A part counts as empty when it declares an item type and holds no item; a part with no item type is structural, such as a door frame, and is never missing. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:112`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:221`)] Get this backwards and half a working car reads as missing.

### The left and right split cannot grow

The window's two lists are split by a hardcoded three-name test: door, bodywork or lights go to the right list. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:81`)] Column widths come from the longest part name measured with `MeasureStringX`, and the categories are walked with `pairs` over a hash, which has no fixed order. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:76`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:85-87`)]

### Vanilla gates actions, and displays information freely

Three live `getPerkLevel(Perks.Mechanics)` checks decide whether an option is available: each one still adds the option, and a failed check sets `notAvailable` instead of hiding it. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:325-340`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:343-350`)] Two more headlight checks sit inside a block comment and are dead code. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:353-374`)] The same skill is also compared in the tooltips, where it only colors the requirement line. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:651`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:671`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:694`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:714`)]

The render code draws overall condition, mass, engine power, braking force, temperature, engine loudness, engine quality and wheel friction with no skill test on those lines. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1172-1178`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1289`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1321-1331`)]

Action gating is extensive and worth reusing: the install tooltips check `requireInstalled` parts and the engine actions check the vehicle key. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:817-824`, `media/lua/server/Vehicles/Vehicles.lua:901-905`, `media/lua/server/Vehicles/Vehicles.lua:1380-1389`)]

### A parked car can stop updating its parts

**A cold, parked, driverless car has its parts update switched off, so anything of yours that hangs on that update does not run for it.**

The full chain is on [UI overview](/pz/build-42/modding/ui/ui-overview). In short, the engine part's update sets `needPartsUpdate` to false at that state, and the vehicle runs `updateParts` only when the flag is true, the mechanic window is open, or the alarm is active. :cite[(`media/lua/server/Vehicles/Vehicles.lua:556-559`, `zombie/vehicles/BaseVehicle.java:3547-3551`)] Calling `vehicle:setNeedPartsUpdate(true)` when your panel opens restores it. :cite[(`zombie/vehicles/BaseVehicle.java:9427-9429`)]

A plain test showed 0 of 19 parts populated on three consecutive opens of a never-driven car, before a wake call existed; that was a 42.20 observation. Which side the call has to run on in multiplayer was not checked.

### The diagram already exists

**The mechanics window draws a base picture and one overlay per part, each tinted by that part's condition.**

The overlay names are built from a prefix and a part image, and the prefix comes from `ISCarMechanicsOverlay.CarList` for the vehicle's script or the script's own overlay name. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:918`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:936`, `media/lua/client/Vehicles/ISUI/ISCarMechanicsOverlay.lua:3-5`)] The 42.22 media inventory lists 314 files named "mechanic overlay".

Two caveats. They are keyed by vanilla body type, so a modded vehicle almost certainly has none and a non-spatial fallback is needed. And the tint is the part's condition, so a mod that withholds condition information from a character cannot use these textures unmodified.

## 8. Logging: buffered lines can be lost

**A log writer built on `LuaFileWriter` has no `flush`, so a session that ends without a save can lose the tail of what it buffered.**

`LuaFileWriter` has `write`, `writeln` and `close`, and wraps a `PrintWriter`. :cite[(`zombie/Lua/LuaManager.java:12822-12840`, `zombie/Lua/LuaManager.java:6125-6137`)] Since the writer cannot be flushed, the moments a mod can close it and reopen it are `OnPostSave`, `OnSave` and `OnMainMenuEnter`, plus `OnDisconnect` on a multiplayer client. :cite[(`zombie/gameStates/IngameState.java:1388`, `zombie/GameWindow.java:1014`, `zombie/gameStates/MainScreenState.java:412`, `zombie/network/GameClient.java:355`)] None of them is named for quitting the program. Whether any fires on a crash was not checked, so treat none as a reliable last chance.

The first Outcast Motors UI run wrote the boot line and lost the hook-installation line, because one was written to the ungated channel and the other was not. So put the once-per-session milestones on the channel that is always written: "loaded" and "loaded and hooked" are different facts, and the gap between them is the most useful thing a log can say about a UI mod.

## 9. Checklist for a new panel

**Run this list before you ship a panel, and test it at two font sizes, because the strip and row heights follow the font.**

- [ ] `local FONT_HGT_SMALL = getTextManager():getFontHeight(UIFont.Small)`
- [ ] reserve `resizeWidgetHeight()` at the bottom, measured not assumed
- [ ] button height from the font, never a fixed 25
- [ ] anchors via `setAnchorX()`, never by field assignment
- [ ] `doDrawItem` returns the next y and treats `self` as the list
- [ ] refresh on a timer, never in `render()`
- [ ] hook chained, not replaced, with a re-entry guard and an idempotence marker
- [ ] `isKeyConsumed` on any window that closes on Escape; text boxes unfocused on close
- [ ] `drawLine` for element-local lines; `rowAt` fed content coordinates

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and vanilla Lua, with no game run for this page. Two symptoms come from earlier game tests of the Outcast mods on 42.20 and were not repeated: Escape opening the pause menu behind a replacement mechanics window until it gained `isKeyConsumed`, and a button in the resize strip that worked at some font sizes only.

The unchained `doDrawItem` error (section 4) and the missing `flush` consequence (section 8) are read from code, not run. Not verified: whether the UI scale option, and not only the font size, changes the strip height; which side runs the parts-update wake in multiplayer; the older string form of `isKey`. The media inventory count of 314 overlay files comes from `game_snapshot/LIVE_MEDIA_INVENTORY.tsv`, not from a code line. A mod that assigns over `ISVehicleMechanics:doPartContextMenu` was reported by a published mod's users on 42.20 and its file was not rechecked here.
:::
