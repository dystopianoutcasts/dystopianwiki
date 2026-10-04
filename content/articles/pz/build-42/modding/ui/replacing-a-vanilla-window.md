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
  A hidden window never prerenders, instantiate already builds your children,
  a focused text box swallows every key release, the context menu is one
  shared object that clears itself, and vanilla actions talk to whatever sits
  in the mechanics-window slot. What we learned replacing the vehicle
  mechanics window, read from the 42.21 code.
last_updated: '2026-10-04'
---
# Replacing or extending a vanilla window: the traps in the UI code

Outcast, we rebuilt the whole vehicle mechanics window for one of our mods. The drawing was the easy part. The hard part was the dozen places where vanilla UI code assumes things about windows, menus and keys that nobody writes down. Each of these cost us a bug report. If you are writing a panel of your own, and especially if you are replacing one of vanilla's, read this first.

For the basics of the UI classes, see [UI engine reference](/pz/build-42/modding/ui/ui-engine-reference) and [custom UI](/pz/build-42/modding/cookbook/custom-ui).

## A hidden element never runs `prerender`

The engine calls your `prerender` and `render` only while the element is visible. A window you have hidden does no work at all: no refresh, no timers you hung on `prerender`. If something must keep updating while the window is hidden, drive it from an event or from whatever is on screen.

> **Proof:** Code. `zombie.ui.UIElement#render` looks up and calls `prerender` only inside `if (this.isVisible())`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## `instantiate()` already calls `createChildren()`

`ISUIElement:instantiate()` builds the Java object and then calls your `createChildren()`. If your code also calls `createChildren()` itself, every child button and list exists twice, stacked exactly on top of each other, and you will chase "why does this click fire twice" for a while.

> **Proof:** Code. `media/lua/client/ISUI/ISUIElement.lua`, `ISUIElement:instantiate` ends with `self:createChildren()`. Build 42.21, Steam build 25485521.

## An error in `createChildren` means no window and no error dialog

`addToUIManager()` calls `instantiate()` (and so `createChildren()`) and only then adds the element to the screen. If anything in `createChildren` raises, the add never happens. The player sees nothing at all, and the only trace is a stack in the console. Our case was load order: a file captured another module at file scope before that module had loaded. See [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

> **Proof:** Code. `media/lua/client/ISUI/ISUIElement.lua`, `ISUIElement:addToUIManager` (`self:instantiate()` then `UIManager.AddUI(self.javaObject)`). Build 42.21, Steam build 25485521.

> **Proof:** Game test. The window failed to open for every car, with the stack trace in the console and no dialog. Build 42.20, engine revision a2947723ca.

## A focused text box swallows every key release

While a text entry box has focus, the engine skips `UIManager.onKeyRelease` for every key. Your window's key handling, Escape included, never runs. The only thing that sees other keys is the box's own `onOtherKey`, and `ISTextEntryBox` does not define one. So a text box that keeps focus after its window closes eats every key release for the rest of the session.

**The safe way:** give your text box an `onOtherKey` that unfocuses it on Escape, and unfocus it in your window's `close()`.

> **Proof:** Code. `zombie.input.GameKeyboard#update` (`bDoingTextEntry` skips `UIManager.onKeyRelease`); `zombie.ui.UITextBox2#onOtherKey` calls a Lua `onOtherKey` only if the table has one; `media/lua/client/ISUI/ISTextEntryBox.lua` defines none. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Escape closes your window and opens the pause menu, unless you consume it

A window that closes on Escape must also say it consumed the key, through an `isKeyConsumed(key)` method. Without it, Escape closes your window and then also opens the pause menu. Vanilla's mechanics window has one; copy the pattern.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:isKeyConsumed`. Build 42.21, Steam build 25485521.

> **Proof:** Game test. Escape opened the pause menu behind our replacement window until it gained `isKeyConsumed`. Build 42.20, engine revision a2947723ca.

## `ISButton:setEnable`, not `setEnabled`

To grey out a button and stop it taking clicks, call the button's own `setEnable(bool)`. The similar-looking `setEnabled(bool)` belongs to every UI element and switches the Java element itself: a disabled element is not drawn at all, so `setEnabled(false)` makes the button vanish instead of greying it.

> **Proof:** Code. `media/lua/client/ISUI/ISButton.lua`, `ISButton:setEnable` (sets `self.enable` and the colours); `media/lua/client/ISUI/ISUIElement.lua`, `ISUIElement:setEnabled`; `zombie.ui.UIElement#render` draws nothing unless `this.enabled`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The context menu is one shared object per player

`ISContextMenu.get(player, x, y)` does not make a new menu. It returns the player's single context menu, hides it, and **clears every option already in it**. So:

- Two pieces of code that each call `get` for the same click do not build two menus; the second wipes the first.
- A fresh menu starts with `numOptions = 1`, not 0.
- To remove another mod's or vanilla's entry, use `removeOptionByName`, not edits to the `options` table.

> **Proof:** Code. `media/lua/client/ISUI/ISContextMenu.lua`: `ISContextMenu.get` (`getPlayerContextMenu(player)`, `hideAndChildren`, `clear`), `self.numOptions = 1` in `clear` and `new`, `ISContextMenu:removeOptionByName`. Build 42.21, Steam build 25485521.

## Vanilla's part menu can return before it sets `self.context`

`ISVehicleMechanics:doPartContextMenu` returns at the top when the game is paused, or when the player is sitting in a vehicle (unless they are an admin or in debug mode). It returns **before** assigning `self.context`. If you wrap it and then add your own options to `self.context`, you are adding them to the menu from the previous click. Set `self.context = nil` before calling the original, and check it afterwards.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:doPartContextMenu` (two early `return`s before `self.context = ISContextMenu.get(...)`). Build 42.21, Steam build 25485521.

## Replacing the mechanics window: claim the slot

Vanilla does not find "the mechanics window" by looking at the screen. It asks `getPlayerMechanicsUI(playerNum)`, which simply returns a field in the player's data, `mechanicsUI`. Several vanilla pieces then call methods on whatever is in that field:

- the action that opens the window checks it to decide whether a window is already showing;
- the install and uninstall code calls `isReallyVisible()` on it, then `startFlashGreen()` or `startFlashRed()`;
- the vehicle menu and the mechanics code look it up too.

So a replacement window must put itself in that field when it opens (and restore the old value when it closes), and must answer `isReallyVisible`, `startFlashGreen` and `startFlashRed`. If it does not, pressing the mechanics key at an open hood keeps queuing new open actions, and the success and failure flashes go nowhere.

> **Proof:** Code. `media/lua/client/ISUI/PlayerData/ISPlayerData.lua`, `getPlayerMechanicsUI` (`return data and data.mechanicsUI`); callers in `media/lua/client/Vehicles/TimedActions/ISOpenMechanicsUIAction.lua`, `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua`, `ISVehicleMechanics.lua`, and `media/lua/server/Vehicles/Vehicles.lua` (`ui:isReallyVisible()`, `ui:startFlashRed()`, `ui:startFlashGreen()`). Build 42.21, Steam build 25485521.

> **Proof:** Game test. With the slot claimed, our window received the vanilla flashes after installs and uninstalls, in single player and in a two-player session. Build 42.20, engine revision a2947723ca.

## List-box overrides run with `self` as the list

Methods you assign onto an `ISScrollingListBox` itself (`doDrawItem`, `onMouseMove`, `onMouseDown` overrides) run as methods of the **list**, so `self` is the list, not your panel; reach your panel through `self.parent`. The callback you register with `setOnMouseDownFunction(target, fn)` is different: it is called with the `target` you passed. And when you work out which row is under the mouse, rows are in the list's content coordinates, which already include the scroll.

> **Proof:** Code. `media/lua/client/ISUI/ISScrollingListBox.lua`: its own methods take `self` as the list; `ISScrollingListBox:invokeOnMouseDownFunction` calls `self.onmousedown(self.target, item)`. Build 42.21, Steam build 25485521.

## Where to go next

- [UI engine reference](/pz/build-42/modding/ui/ui-engine-reference)
- [Vehicle UI reference](/pz/build-42/vehicles/reference/vehicle-ui-reference)
