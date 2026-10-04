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
- A fresh menu starts with `numOptions = 1`, not 0. So "nothing was added" is `numOptions == 1`, and vanilla's part menu ends with `if self.context.numOptions == 1 then self.context:setVisible(false) end`. Do the same, or an empty menu opens, which looks exactly like a right-click that did nothing.
- To remove another mod's or vanilla's entry, use `removeOptionByName`, not edits to the `options` table.

> **Proof:** Code. `media/lua/client/ISUI/ISContextMenu.lua`: `ISContextMenu.get` (`getPlayerContextMenu(player)`, `hideAndChildren`, `clear`), `self.numOptions = 1` in `clear` and `new`, `ISContextMenu:removeOptionByName`; `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, the end of `ISVehicleMechanics:doPartContextMenu` (`numOptions == 1` hides the menu). Build 42.21.0 (revision 4a0e9546ec).

## Vanilla's part menu can return before it sets `self.context`

`ISVehicleMechanics:doPartContextMenu` returns at the top when the game is paused, or when the player is sitting in a vehicle (unless they are an admin or in debug mode). It returns **before** assigning `self.context`. If you wrap it and then add your own options to `self.context`, you are adding them to the menu from the previous click. Set `self.context = nil` before calling the original, and check it afterwards.

If you build a menu of your own for a part vanilla does not handle, apply the same two gates (paused, and sitting in a vehicle). Otherwise your part offers a menu while every part beside it correctly refuses.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:doPartContextMenu` (two early `return`s before `self.context = ISContextMenu.get(...)`). Build 42.21, Steam build 25485521.

## Replacing the mechanics window: claim the slot

Vanilla does not find "the mechanics window" by looking at the screen. It asks `getPlayerMechanicsUI(playerNum)`, which simply returns a field in the player's data, `mechanicsUI`. Several vanilla pieces then call methods on whatever is in that field:

- the action that opens the window checks it to decide whether a window is already showing;
- the install and uninstall code calls `isReallyVisible()` on it, then `startFlashGreen()` or `startFlashRed()`;
- the vehicle menu and the mechanics code look it up too.

So a replacement window must put itself in that field when it opens (and restore the old value when it closes), and must answer `isReallyVisible`, `startFlashGreen` and `startFlashRed`. If it does not, pressing the mechanics key at an open hood keeps queuing new open actions, and the success and failure flashes go nowhere.

What that contract costs you, method by method:

- `isReallyVisible` comes free: every `ISUIElement` has it, so anything derived from `ISPanel` or `ISCollapsableWindow` answers it.
- `startFlashRed` and `startFlashGreen` are only defined on vanilla's own `ISVehicleMechanics`. Vanilla calls them without checking that they exist, so a window in the slot without them raises "attempt to call nil" on the first finished install or uninstall. Empty stubs stop the error but throw away the only feedback the base game gives for a failed install, so make them do something.
- You hold the slot only while your window is open. An install that finishes after the player closed your window reaches whatever you restored, `isReallyVisible()` answers false, and nothing flashes. No crash, just no feedback.

> **Proof:** Code. `media/lua/client/ISUI/ISUIElement.lua`, `ISUIElement:isReallyVisible`; `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:startFlashRed` and `:startFlashGreen` (the only definitions) and `ISVehicleMechanics.OnMechanicActionDone`; `media/lua/client/ISUI/PlayerData/ISPlayerData.lua`, `getPlayerMechanicsUI` (`return data and data.mechanicsUI`); callers in `media/lua/client/Vehicles/TimedActions/ISOpenMechanicsUIAction.lua`, `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua`, `ISVehicleMechanics.lua`, and `media/lua/server/Vehicles/Vehicles.lua` (`ui:isReallyVisible()`, `ui:startFlashRed()`, `ui:startFlashGreen()`). Build 42.21, Steam build 25485521.

> **Proof:** Game test. With the slot claimed, our window received the vanilla flashes after installs and uninstalls, in single player and in a two-player session. Build 42.20, engine revision a2947723ca.

## List-box overrides run with `self` as the list

Methods you assign onto an `ISScrollingListBox` itself (`doDrawItem`, `onMouseMove`, `onMouseDown` overrides) run as methods of the **list**, so `self` is the list, not your panel; reach your panel through `self.parent`. The callback you register with `setOnMouseDownFunction(target, fn)` is different: it is called with the `target` you passed. And when you work out which row is under the mouse, rows are in the list's content coordinates, which already include the scroll.

> **Proof:** Code. `media/lua/client/ISUI/ISScrollingListBox.lua`: its own methods take `self` as the list; `ISScrollingListBox:invokeOnMouseDownFunction` calls `self.onmousedown(self.target, item)`. Build 42.21, Steam build 25485521.

## If you rebuild the part menu, copy vanilla's gates

Vanilla's part menu gates every action, and some gates are easy to miss when you write your own:

- **The Engine part is special.** "Take Engine Parts" and "Repair Engine" only appear when the car's key requirement is met (`VehicleUtils.RequiredKeyNotFound` is false), so the Engine's key flag matters even though the part has no install or uninstall table of its own.
- **A refused action is still shown.** Vanilla adds the option, sets `option.notAvailable = true` and hangs the reason on a tooltip. The menu then draws its text in the "bad" highlight colour and will not run it, and the player can see why. Hiding the option instead leaves them guessing.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:doPartContextMenu` (`if part:getId() == "Engine" and not VehicleUtils.RequiredKeyNotFound(part, self.chr)`, then `IGUI_TakeEngineParts` and `IGUI_RepairEngine`, each with `option.notAvailable = true` when the skill, tool or condition test fails, and `doMenuTooltip`); `media/lua/client/ISUI/ISContextMenu.lua` (an option with `notAvailable` is never selected and is drawn in `getCore():getBadHighlitedColor()`; its `toolTip` is shown on hover). Build 42.21.0 (revision 4a0e9546ec).

## The car diagram's hit boxes are in vanilla's window coordinates

The mechanics window's car diagram comes from `ISCarMechanicsOverlay`, which holds one rectangle per part (with variants per body type). Two things worth knowing before you lay out your own window:

- There are rectangles for exactly two parts above the car body: `Engine` and `Battery`. Vanilla has always drawn the engine as an inset separate from the hood, so if you want to split "the hood" from "the engine", the art already supports it.
- Vanilla compares the mouse position in its window directly with those rectangles, so they only line up where vanilla draws the image. If your window draws the overlay anywhere else, or at another scale, move every rectangle by the same offset and scale, or clicks land one part away.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISCarMechanicsOverlay.lua`, `ISCarMechanicsOverlay.PartList` (`Engine` at y 48 to 106 and `Battery` at y 64 to 99, every hood rectangle from y 143 down); `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:isMouseOverPart` (tests the mouse against the raw rectangle) and the overlay drawing (`drawTextureScaledUniform` at the overlay's own `x`, `y` and scale). Build 42.21.0 (revision 4a0e9546ec).

## Where to go next

- [UI engine reference](/pz/build-42/modding/ui/ui-engine-reference)
- [Vehicle UI reference](/pz/build-42/vehicles/reference/vehicle-ui-reference)

*Updated 2026-10-04: merged the remaining facts from our mechanics-window notes, each re-read in 42.21: what claiming the slot costs, hiding an empty menu, gating your own menus, vanilla's Engine key gate and refused options, and the diagram hit boxes.*
