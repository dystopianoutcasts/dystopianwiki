---
id: build-42-ui-overview
slug: ui-overview
title: UI overview
game: pz
version: build-42
section: modding
category: ui
difficulty: intermediate
tags:
  - ui-overview
  - isui
  - vehicle-mechanics-ui
  - engine-traps
excerpt: >-
  How a Build 42.22 mod window is built from the ISUI classes, how to open one, and the three traps that cost the most time: anchors, the resize strip, and parked-car part updates.
last_updated: '2026-11-15'
related_articles:
  - ui-engine-reference
  - replacing-a-vanilla-window
  - ui-coordinate-traps
  - ui3dscene-a-car-in-a-mod-window
  - the-events-system
  - key-globals-and-classes
  - timed-actions
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders writing a window](#how-a-window-is-built) | [modders whose panel misbehaves](#the-three-traps-that-cost-the-most)

:::callout[The 1-minute version]{kind=key}
- Mod windows are Lua tables built on `ISUIElement`, then `ISPanel`, then `ISCollapsableWindow`, each made with `derive`.
- A Lua element makes its Java `UIElement` when it is added to the UI manager or to another element, and its anchors are copied to the Java object at that moment.
- Set anchors with the setter functions, because writing the field afterward does not change the Java object.
- `ISCollapsableWindow` puts two resize widgets along its bottom edge, and their height comes from the Small font height.
- A parked car with its engine off, no driver and a cold engine part has its parts update switched off, unless a mechanic window is open or its alarm is active.
- This page grew out of the Outcast Motors UI work, the vehicle mechanics window replacement.
:::

:::facts
- **Base classes** 3 (`ISUIElement`, `ISPanel`, `ISCollapsableWindow`)
- **Default anchors** left and top on, right and bottom off
- **Resize strip height** half the Small-font button height plus 2
:::

## How a window is built

A window is a Lua table derived from `ISCollapsableWindow`, which comes from `ISPanel`, which comes from `ISUIElement`.

Each class is made with `derive`, the same call that timed actions use. :cite[(`media/lua/client/ISUI/ISUIElement.lua:9`, `media/lua/client/ISUI/ISPanel.lua:3`, `media/lua/client/ISUI/ISCollapsableWindow.lua:9`)] The Lua table owns the Java `UIElement`: `instantiate` creates it, copies the position, size and anchors across, and then calls `createChildren`. :cite[(`media/lua/client/ISUI/ISUIElement.lua:993-1008`)] `addToUIManager` and `addChild` call `instantiate` first when the element has no Java object yet. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1365-1370`, `media/lua/client/ISUI/ISUIElement.lua:1451-1458`)]

A minimal window with one button follows the pattern of vanilla's admin panels, which build their buttons in `createChildren` and call `initialise` on each. :cite[(`media/lua/client/ISUI/AdminPanel/ISAdminMessage.lua:6-17`)]

```lua
local MyWindow = ISCollapsableWindow:derive("MyWindow")

function MyWindow:createChildren()
    ISCollapsableWindow.createChildren(self)
    self.btn = ISButton:new(10, 30, 100, 25, "Click", self, MyWindow.onClick)
    self.btn:initialise()
    self:addChild(self.btn)
end

function MyWindow:onClick(button) print("clicked") end

function MyWindow:new(x, y, w, h)
    return ISCollapsableWindow.new(self, x, y, w, h)
end

local function onKey(key)
    if key ~= Keyboard.KEY_J then return end
    local win = MyWindow:new(100, 100, 300, 200)
    win:initialise()
    win:addToUIManager()
end
Events.OnKeyPressed.Add(onKey)
```

Save this as `media/lua/client/MyWindowMod.lua`, because UI code belongs in the `client` folder. The mod is a folder `MyWindowMod` in the `mods` folder of your game's cache directory, holding `common/` and `42/mod.info` with the lines `name=My window`, `id=MyWindowMod` and `description=Press J for a window`, and the Lua file under `42/media/lua/client/`.

Enable "My window" in the Mods screen, start a game and press J: a window with a "Click" button opens, and the button prints "clicked" to the console. This sample was not run in a game. `ISButton:new` takes the position, size, title, the object to call, and the function to call. :cite[(`media/lua/client/ISUI/ISButton.lua:479`)] When the button is clicked, the game calls that function with the target and then the button. :cite[(`media/lua/client/ISUI/ISButton.lua:42-47`)]

The game fires the `OnCreateUI` event once the standard UI has been built, and a window can be opened there or on demand. :cite[(`zombie/ui/UIManager.java:199`, `zombie/ui/UIManager.java:268`)] The event list is in [The events system](/pz/build-42/modding/lua-api/the-events-system).

## The three traps that cost the most

Three engine behaviors cost the most time in the Outcast Motors UI work, and each has a cause in the code.

### Anchors must go through the setters

The Java object copies the anchors once, when `instantiate` runs, so writing `btn.anchorBottom = true` afterward changes only the Lua table. :cite[(`media/lua/client/ISUI/ISUIElement.lua:993-1002`)] The setters `setAnchorBottom`, `setAnchorTop`, `setAnchorLeft`, `setAnchorRight`, `setAnchorsTBLR` and `setAnchors` write the field and the Java object together. :cite[(`media/lua/client/ISUI/ISUIElement.lua:128-190`)]

The anchors take effect when the parent is resized: an element anchored at both top and bottom grows in height, and one anchored only at the bottom moves down. :cite[(`zombie/ui/UIElement.java:1419-1434`)] A new element starts with left and top anchored. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1983-1986`)] An element whose anchors were set through the field alone looks frozen while the window resizes. The same copied lines appeared in two Outcast mods.

### ISCollapsableWindow has a resize strip along its bottom edge

`ISCollapsableWindow` adds two resize widgets: one in the bottom-right corner and one that runs along the bottom edge from the left side to the corner. :cite[(`media/lua/client/ISUI/ISCollapsableWindow.lua:32-49`)] Both are as tall as `resizeWidgetHeight`, which is half the button height plus 2, where the button height is the Small font height plus 6. :cite[(`media/lua/client/ISUI/ISCollapsableWindow.lua:11-12`, `media/lua/client/ISUI/ISCollapsableWindow.lua:302-304`)]

The Small font height is read when the file loads, so the strip's height follows the font and not a corner grip. Keep your content above `resizeWidgetHeight()`. An earlier game test found a button placed in the strip clickable at some font sizes and not at others, and that test was not repeated for 42.22. The related traps are in [UI coordinate traps](/pz/build-42/modding/ui/ui-coordinate-traps).

### A parked car can stop updating its parts

A panel that reads or changes vehicle part data needs the vehicle to keep running its parts update, and a cold parked car does not.

The vehicle's own update runs the parts update only when `needPartsUpdate` is true, the mechanic window is open, or the alarm is active. :cite[(`zombie/vehicles/BaseVehicle.java:3547-3551`)] The engine part's Lua update sets `needPartsUpdate` to false when the part temperature has reached 0, the engine is not running and nobody drives. :cite[(`media/lua/server/Vehicles/Vehicles.lua:526`, `media/lua/server/Vehicles/Vehicles.lua:556-559`)] So anything of yours that hangs on that update, such as population, wear or ageing, does not run for such a car.

Calling `vehicle:setNeedPartsUpdate(true)` when your panel opens restores the update. :cite[(`zombie/vehicles/BaseVehicle.java:9423-9429`)] How many cars in a world are in that state was not measured.

## Where to go next

The engine details are in [UI engine reference and gotchas](/pz/build-42/modding/ui/ui-engine-reference), and the traps for replacing a vanilla window are in [Replacing or extending a vanilla window](/pz/build-42/modding/ui/replacing-a-vanilla-window). Drawing a car in your own window is in [UI3DScene: a 3D car in your mod window](/pz/build-42/modding/ui/ui3dscene-a-car-in-a-mod-window).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and vanilla Lua, with no game run. The window sample was not run, and the resize-strip and anchor symptoms (frozen elements, an unclickable strip) come from earlier game tests of the Outcast mods that were not repeated here. Not verified: whether the strip height changes with the UI scale option as well as the font size, and whether vanilla's mechanic window is the only code that sets the mechanic-window flag.
:::
