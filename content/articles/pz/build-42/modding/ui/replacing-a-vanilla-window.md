---
id: build-42-replacing-a-vanilla-window
slug: replacing-a-vanilla-window
title: 'Replacing or extending a vanilla window: the traps in the UI code'
game: pz
version: build-42
section: modding
category: ui
difficulty: advanced
tags:
  - ui
  - context-menu
  - keyboard
  - vehicles
  - silent-failure
excerpt: >-
  Build 42.22 traps in replacing a vanilla window: hidden elements never prerender, a focused text box swallows keys, one shared context menu, and the mechanics-window slot.
last_updated: '2026-11-21'
related_articles:
  - ui-overview
  - ui-engine-reference
  - ui-coordinate-traps
  - custom-ui
  - vehicle-ui-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [modders writing a panel](#1-a-hidden-element-never-runs-prerender) | [modders replacing the vehicle mechanics window](#9-replacing-the-mechanics-window-the-slot-and-what-vanilla-asks-of-it)

Outcast, we rebuilt the whole vehicle mechanics window for one of our mods. The drawing was the easy part. The hard part was the dozen places where vanilla UI code assumes things about windows, menus and keys that nobody writes down. Each of these cost us a bug report.

This page states each trap as vanilla behavior, read from 42.22. All of it is client UI code. The basics are in [UI overview](/pz/build-42/modding/ui/ui-overview), [UI engine reference](/pz/build-42/modding/ui/ui-engine-reference) and [custom UI](/pz/build-42/modding/cookbook/custom-ui).

:::callout[The 1-minute version]{kind=key}
- A hidden or disabled element never runs `prerender` or `render`, so nothing you hung on them updates.
- `instantiate()` already calls `createChildren()`; an error inside it means the window is never added and the player sees nothing.
- A focused text box stops the UI key handlers until the next left click unfocuses it, and a window that closes on Escape needs `isKeyConsumed` or the pause menu opens too.
- Use `ISButton:setEnable`, not `setEnabled`: the second one makes the element disappear.
- `ISContextMenu.get` returns the player's one menu and clears it; a fresh menu counts `numOptions` from 1.
- Vanilla finds the mechanics window through a per-player slot, and its open action fills that existing window in.
:::

:::facts
- **Shared context menus per player** 1 (`getPlayerContextMenu`)
- **Starting value of `numOptions`** 1 for an empty menu
- **Early returns in `doPartContextMenu` before `self.context` is set** 2
- **Hit boxes above the car body in the overlay data** 2 (`Engine`, `Battery`)
:::

## 1. A hidden element never runs prerender

**The engine calls `prerender` and `render` only while the element is enabled and visible, so a hidden window does no work.**

The check is at the top of `UIElement.render`, and the `prerender` call sits inside it. :cite[(`zombie/ui/UIElement.java:1610-1626`)] There is no refresh and no timer you hung on `prerender` while the window is hidden. If something must keep updating then, drive it from an event or from whatever is on screen.

## 2. instantiate() already calls createChildren()

**`ISUIElement:instantiate()` builds the Java object and then calls your `createChildren()`, so calling it yourself builds every child twice.**

The call is the last line of `instantiate`. :cite[(`media/lua/client/ISUI/ISUIElement.lua:993-1007`)] Every child button and list then exists twice, stacked exactly on top of each other, and you chase "why does this click fire twice" for a while. `addToUIManager()` and `addChild()` also instantiate first when the element has no Java object yet. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1365-1371`, `media/lua/client/ISUI/ISUIElement.lua:1451-1458`)]

## 3. An error in createChildren means no window and no error dialog

**If `createChildren` raises, `addToUIManager()` never reaches the line that adds the element, and the only trace is a stack in the console.**

`addToUIManager()` calls `instantiate()` first and then `UIManager.AddUI(self.javaObject)`. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1365-1371`)] Our case was load order: a file captured another module at file scope before that module had loaded. See [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders). The error text and stack trace are described in [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42).

## 4. A focused text box swallows every key release

**While a text entry box has focus, the engine skips the UI key handlers for every key, so your window's key handling never runs.**

`GameKeyboard.update` checks whether the current text box is doing text entry and skips `UIManager.onKeyRelease`, `onKeyRepeat` and `onKeyPress` and the matching key events. :cite[(`zombie/input/GameKeyboard.java:39`, `zombie/input/GameKeyboard.java:50-59`, `zombie/input/GameKeyboard.java:69`, `zombie/input/GameKeyboard.java:83`)] The box itself is handed only Escape and Tab, through its `onOtherKey`, which the Java side calls only if the Lua table has one. :cite[(`zombie/core/Core.java:1629-1637`, `zombie/ui/UITextBox2.java:861-865`)] `ISTextEntryBox` defines no `onOtherKey`. So a text box that keeps focus after its window closes keeps the keys from the UI until the player left-clicks: any left-click press unfocuses the active text box, except the chat box. :cite[(`zombie/ui/UIManager.java:672-674`, `zombie/core/Core.java:988-996`)]

**The safe way:** give your text box an `onOtherKey` that unfocuses it on Escape, and unfocus it in your window's `close()`. `ISTextEntryBox:unfocus()` does the unfocusing. :cite[(`media/lua/client/ISUI/ISTextEntryBox.lua:150-152`)]

## 5. Escape closes your window and opens the pause menu, unless you consume it

**A window that closes on Escape must also answer true from `isKeyConsumed(key)`, or Escape opens the pause menu as well.**

The pause menu is an `OnKeyPressed` handler that opens on the main-menu keybind, Escape by default, and that event fires only when no element consumed the key release. :cite[(`media/lua/client/OptionScreens/MainScreen.lua:1709-1710`, `media/lua/client/OptionScreens/MainScreen.lua:2161`, `media/lua/shared/keyBinding.lua:154-155`, `zombie/input/GameKeyboard.java:50-59`)] An element with no `isKeyConsumed` counts as not consuming. :cite[(`zombie/ui/UIElement.java:2181-2188`)] Vanilla's mechanics window answers true for Escape and for its own keybind, so copy that pattern. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1537-1540`)] A game test on 42.20 showed Escape opening the pause menu behind our replacement window until it gained `isKeyConsumed`.

## 6. ISButton:setEnable, not setEnabled

**To gray out a button and stop it taking clicks, call the button's own `setEnable(bool)`; `setEnabled(false)` makes the button vanish.**

`ISButton:setEnable` sets `self.enable` and recolors the button, and the button's mouse handlers test `self.enable`. :cite[(`media/lua/client/ISUI/ISButton.lua:416-440`, `media/lua/client/ISUI/ISButton.lua:45`, `media/lua/client/ISUI/ISButton.lua:60`)] The similar-looking `setEnabled(bool)` belongs to every UI element and switches the Java element itself. :cite[(`media/lua/client/ISUI/ISUIElement.lua:397-404`)] A disabled Java element draws nothing, so the button disappears instead of graying. :cite[(`zombie/ui/UIElement.java:1610-1612`)]

## 7. The context menu is one shared object per player

**`ISContextMenu.get(player, x, y)` does not make a new menu: it returns the player's single context menu, hides it and its submenus, shows it again and clears every option in it.**

The code reads the player's menu from the player data, hides it, shows it and clears it. :cite[(`media/lua/client/ISUI/ISContextMenu.lua:1166-1176`, `media/lua/client/ISUI/PlayerData/ISPlayerData.lua:99`)] So:

- Two pieces of code that each call `get` for the same click do not build two menus; the second wipes the first.
- A fresh menu starts with `numOptions = 1`, not 0. :cite[(`media/lua/client/ISUI/ISContextMenu.lua:1088-1097`, `media/lua/client/ISUI/ISContextMenu.lua:1151`)] So "nothing was added" is `numOptions == 1`, and vanilla's part menu ends with `if self.context.numOptions == 1 then self.context:setVisible(false) end`. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:408`)] Do the same, or an empty menu opens, which looks exactly like a right-click that did nothing.
- To remove another mod's or vanilla's entry, use `removeOptionByName`, not edits to the `options` table. :cite[(`media/lua/client/ISUI/ISContextMenu.lua:1016-1035`)]

Submenus differ: a submenu adds default entries for its ancestors when it is first drawn, so the `numOptions == 1` test is for the top-level menu. :cite[(`media/lua/client/ISUI/ISContextMenu.lua:655-678`)]

## 8. Vanilla's part menu can return before it sets self.context

**`ISVehicleMechanics:doPartContextMenu` returns at the top in two cases, both before it assigns `self.context`.**

It returns when the game speed is 0 (paused), and when the player is sitting in a vehicle, unless they are in debug mode or an admin or moderator on a multiplayer client. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:208-214`)] If you wrap it and then add your own options to `self.context`, you are adding them to the menu from the previous click. Set `self.context = nil` before calling the original, and check it afterwards.

If you build a menu of your own for a part vanilla does not handle, apply the same two gates. Otherwise your part offers a menu while every part beside it correctly refuses.

## 9. Replacing the mechanics window: the slot, and what vanilla asks of it

**Vanilla finds its mechanics window through `getPlayerMechanicsUI(playerNum)`, which returns a field in the player's data, and it calls methods on whatever sits there.**

The player data builds one `ISVehicleMechanics` window at creation, hidden and disabled, and stores it in that field. :cite[(`media/lua/client/ISUI/PlayerData/ISPlayerDataObject.lua:119-122`, `media/lua/client/ISUI/PlayerData/ISPlayerData.lua:128-131`)] The open action does not create a window: its `perform` sets `vehicle` and `usedHood` on the slot, calls `initParts`, shows it and adds it to the UI manager. :cite[(`media/lua/client/Vehicles/TimedActions/ISOpenMechanicsUIAction.lua:28-36`)] So a window of your own does not take over by existing. Either you intercept `perform` (see the [UI engine reference](/pz/build-42/modding/ui/ui-engine-reference), section 7), or your window puts itself in the slot when it opens and restores the old value when it closes.

Other vanilla code calls the slot too, and each call tells you what a replacement must answer:

- **Whether it is showing.** The vehicle menu and the hood handler call `isReallyVisible()` and `close()` on the slot, and queue the open action when it is not visible. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua:962-966`, `media/lua/server/Vehicles/Vehicles.lua:830-846`)] With your window outside the slot, the slot is the hidden vanilla window, so pressing the mechanics key at an open hood keeps queuing open actions that show the vanilla window.
- **Install and uninstall flashes.** `VehicleUtils.UninstallPart` and `InstallPart` call `isReallyVisible()` and then `startFlashRed()` or `startFlashGreen()` on the slot of player 0. :cite[(`media/lua/server/Vehicles/Vehicles.lua:1404-1431`, `media/lua/server/Vehicles/Vehicles.lua:1435-1459`)] The `OnMechanicActionDone` event does the same for the acting player. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1555-1575`, `zombie/characters/IsoGameCharacter.java:10827`)]

What that contract costs you, method by method:

- `isReallyVisible` comes free: every `ISUIElement` has it, so anything derived from `ISPanel` or `ISCollapsableWindow` answers it. :cite[(`media/lua/client/ISUI/ISUIElement.lua:690-695`)]
- `startFlashRed` and `startFlashGreen` are defined only on vanilla's own `ISVehicleMechanics`, and vanilla calls them without checking that they exist. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1106-1118`)] A window in the slot without them raises an error as soon as an install or uninstall finishes (Kahlua words it "tried to call nil", see [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42)). Empty stubs stop the error but throw away the only feedback the base game gives for a failed install, so make them do something.
- You hold the slot only while your window is open. An install that finishes after the player closed your window reaches whatever you restored, `isReallyVisible()` answers false, and nothing flashes. No crash, just no feedback.
- Vanilla's `setVisible` also tells the vehicle the mechanic window is open (`setMechanicUIOpen`), and the vehicle's parts update runs when `needPartsUpdate()` is true, when that flag is set, or when the alarm is active (see [UI overview](/pz/build-42/modding/ui/ui-overview)). :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1382-1396`, `zombie/vehicles/BaseVehicle.java:3547-3551`)] A replacement that never sets the flag leaves a cold parked car's parts update to the other two conditions, unless it calls `setNeedPartsUpdate(true)` itself.

## 10. List-box overrides run with self as the list

**Methods you assign onto an `ISScrollingListBox` run as methods of the list, so reach your panel through `self.parent`.**

That covers `doDrawItem`, `onMouseMove` and `onMouseDown` overrides. The callback you register with `setOnMouseDownFunction(target, fn)` is different: it is called with the `target` you passed. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:277-290`)] And when you work out which row is under the mouse, rows are in the list's content coordinates, which already include the scroll. :cite[(`media/lua/client/ISUI/ISScrollingListBox.lua:66-76`)] The fix is in [UI coordinate traps](/pz/build-42/modding/ui/ui-coordinate-traps).

## 11. If you rebuild the part menu, copy vanilla's gates

**Vanilla's part menu gates every action, and some gates are easy to miss when you write your own.**

- **The Engine part is special.** "Take Engine Parts" and "Repair Engine" only appear when the vehicle key requirement is met (`VehicleUtils.RequiredKeyNotFound` is false), so the Engine's key flag matters even though the part has no install or uninstall table of its own. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:324-340`, `media/lua/server/Vehicles/Vehicles.lua:1380-1389`)]
- **A refused action is still shown.** Vanilla adds the option, sets `option.notAvailable = true` and hangs the reason on a tooltip. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:324-340`)] The menu draws its text in the "bad" highlight color and will not run it, and the player can see why. :cite[(`media/lua/client/ISUI/ISContextMenu.lua:66`, `media/lua/client/ISUI/ISContextMenu.lua:372-376`, `media/lua/client/ISUI/ISContextMenu.lua:207-214`)] Hiding the option instead leaves them guessing.

## 12. The car diagram's hit boxes are in vanilla's window coordinates

**The mechanics window's car diagram comes from `ISCarMechanicsOverlay`, which holds one rectangle per part, with variants per body type.**

Two things are worth knowing before you lay out your own window:

- Only two parts have rectangles above the car body: `Engine` (y 48 to 106) and `Battery` (y 64 to 99). :cite[(`media/lua/client/Vehicles/ISUI/ISCarMechanicsOverlay.lua:223-225`, `media/lua/client/Vehicles/ISUI/ISCarMechanicsOverlay.lua:262`)] Every hood rectangle has y of 143 or more. :cite[(`media/lua/client/Vehicles/ISUI/ISCarMechanicsOverlay.lua:267-274`)] The engine is drawn as an inset separate from the hood, so if you want to split "the hood" from "the engine", the art already supports it.
- Vanilla compares the mouse position in its window directly with those rectangles, so they only line up where vanilla draws the image. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:977-1000`)] It draws the overlay at the overlay's own x and y with a fixed scale of 1. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:899`, `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:918`)] If your window draws the overlay anywhere else, or at another scale, move every rectangle by the same offset and scale, or clicks land one part away. In debug mode the option `Mechanics.Render.Hitbox` draws the boxes for you. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua:1000-1003`)]

## 13. Where to go next

- [UI engine reference](/pz/build-42/modding/ui/ui-engine-reference)
- [Vehicle UI reference](/pz/build-42/vehicles/reference/vehicle-ui-reference)

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and vanilla Lua, with no game run for this page. Two game tests on 42.20 were not repeated: the window failing to open for every car when `createChildren` raised (a stack trace in the console, no dialog), and the vanilla flashes reaching our window after installs and uninstalls with the slot claimed, in single player and in a two-player session. The Escape and pause-menu symptom is from the same 42.20 tests. Not verified: what the open action's `perform` does to a window that is not an `ISVehicleMechanics`, because no such window was run on 42.22.
:::
