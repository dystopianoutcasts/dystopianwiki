---
id: build-42-custom-ui
slug: custom-ui
title: Custom UI or HUD
game: pz
version: build-42
section: modding
category: cookbook
difficulty: intermediate
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a mod that adds a small movable panel with a title, a counter and two buttons, opened from the world right-click menu, using the ISUI Lua classes.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - custom-moodle
  - lua-gameplay-mod
  - ui-overview
  - ui-coordinate-traps
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoUI`: two client Lua files, one translation file, and the two files every mod has, `mod.info` and `poster.png`.
- The panel is a class derived from `ISPanel`. It shows a title, a counter and two buttons, **Press me** and **Close**, and you can drag it by its background.
- You open it from a new entry, **Open demo panel**, on the world right-click menu. No key is needed.
- UI code goes in `media/lua/client/`, because the server does not draw anything.
:::

:::facts
- **Mod id** `RecipeDemoUI`
- **Panel class** `RecipeDemoPanel`, derived from `ISPanel`
- **Files** 5 (`mod.info`, `poster.png`, `DemoPanel.lua`, `DemoMenu.lua`, `UI.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A small window of your own that opens from the right-click menu and does something when you press a button.**

Right-click the ground in a game and the menu has a new line, **Open demo panel**. Choosing it opens a dark panel in the middle of the screen with the title **Demo panel**, the text **Button pressed 0 times**, a **Press me** button and a **Close** button. Each press on **Press me** adds one to the count, and **Close** removes the panel.

The panel is plain on purpose. It has the parts every ISUI window has: a class, a constructor, children, a draw function and a way to open and close. The depth is in the [UI overview](/pz/build-42/modding/ui/ui-overview), and the traps with coordinates are in [UI coordinate traps](/pz/build-42/modding/ui/ui-coordinate-traps).

## The files

**Five files make the mod, in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders and the same `poster.png`. The skeleton's `Boot.lua` is left out here.

```
Zomboid/mods/RecipeDemoUI/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      lua/
        shared/
          Translate/
            EN/
              UI.json
        client/
          RecipeDemoUI/
            DemoPanel.lua
            DemoMenu.lua
```

The game loads the Lua files of the `shared` folder and then those of the `client` folder, so a UI file belongs in `client`. :cite[(`zombie/Lua/LuaManager.java:1253-1257`)] Vanilla's own files load first, in alphabetical order, and the files of each enabled mod follow. :cite[(`zombie/Lua/LuaManager.java:1200-1203`)] Because of that, `DemoMenu.lua` loads before `DemoPanel.lua`, and it must only use the panel class inside a function that runs later, never at the top of the file.

## Step by step

**Write the five files in this order: the mod info, the text, the panel, then the menu entry.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo UI
id=RecipeDemoUI
description=Adds a small movable panel that you open from the world right-click menu.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/lua/shared/Translate/EN/UI.json`

This holds every word the panel shows. The game picks the table from the start of the key, so keys that start with `UI_` belong in `UI.json`. :cite[(`zombie/core/Translator.java:436-437`)] The text `%1` stands for the first value you pass to `getText`. :cite[(`zombie/core/Translator.java:917-918`)] A whole number passed as a value prints without a decimal point. :cite[(`zombie/core/Translator.java:551-558`)]

**File `42/media/lua/shared/Translate/EN/UI.json`**

```
{
    "UI_RecipeDemoUI_Open": "Open demo panel",
    "UI_RecipeDemoUI_Title": "Demo panel",
    "UI_RecipeDemoUI_Count": "Button pressed %1 times",
    "UI_RecipeDemoUI_Add": "Press me"
}
```

The **Close** button uses the vanilla key `UI_Close`, which already has the text. :cite[(`media/lua/shared/Translate/EN/UI.json:1547`)] A key with no text shows the key itself, and in debug mode the log says `ERROR: Missing translation`. :cite[(`zombie/core/Translator.java:489-506`)]

### Step 3. `42/media/lua/client/RecipeDemoUI/DemoPanel.lua`

This is the panel class. It follows the pattern of vanilla's modal dialog, which is also a small class derived from a panel that makes its buttons in `initialise`. :cite[(`media/lua/client/ISUI/ISModalDialog.lua:3`, `media/lua/client/ISUI/ISModalDialog.lua:11-45`)]

**File `42/media/lua/client/RecipeDemoUI/DemoPanel.lua`**

```lua
require "ISUI/ISPanel"
require "ISUI/ISButton"

RecipeDemoPanel = ISPanel:derive("RecipeDemoPanel")

function RecipeDemoPanel:initialise()
    ISPanel.initialise(self)

    local addButton = ISButton:new(20, 80, 100, 25, getText("UI_RecipeDemoUI_Add"), self, RecipeDemoPanel.onAdd)
    addButton:initialise()
    addButton:instantiate()
    self:addChild(addButton)

    local closeButton = ISButton:new(130, 80, 90, 25, getText("UI_Close"), self, RecipeDemoPanel.onClose)
    closeButton:initialise()
    closeButton:instantiate()
    self:addChild(closeButton)
end

function RecipeDemoPanel:render()
    self:drawText(getText("UI_RecipeDemoUI_Title"), 20, 12, 1, 1, 1, 1, UIFont.Medium)
    self:drawText(getText("UI_RecipeDemoUI_Count", self.count), 20, 48, 1, 1, 1, 1, UIFont.Small)
end

function RecipeDemoPanel:onAdd()
    self.count = self.count + 1
    print("[RecipeDemoUI] button pressed " .. self.count .. " times")
end

function RecipeDemoPanel:onClose()
    self:setVisible(false)
    self:removeFromUIManager()
    RecipeDemoPanel.instance = nil
end

function RecipeDemoPanel:new(x, y, width, height)
    local o = ISPanel.new(self, x, y, width, height)
    o.count = 0
    o.moveWithMouse = true
    return o
end

function RecipeDemoPanel.open()
    if RecipeDemoPanel.instance then
        RecipeDemoPanel.instance:bringToTop()
        return
    end

    local width = 240
    local height = 120
    local x = (getCore():getScreenWidth() - width) / 2
    local y = (getCore():getScreenHeight() - height) / 2

    local panel = RecipeDemoPanel:new(x, y, width, height)
    panel:initialise()
    panel:addToUIManager()
    RecipeDemoPanel.instance = panel
end
```

Each piece, in the order it appears:

| Piece | What it does | Code |
|-------|--------------|------|
| `ISPanel:derive("RecipeDemoPanel")` | Makes a new class that inherits everything from `ISPanel`. The name is stored as the class's type. | `media/lua/shared/ISBaseObject.lua:9-16` |
| `RecipeDemoPanel:new(...)` | Calls the parent constructor, which sets the size, the dark background color and the border color, and then sets your own fields. | `media/lua/client/ISUI/ISPanel.lua:96-115` |
| `o.moveWithMouse = true` | Lets the player drag the panel by its background. Without it the panel ignores the mouse. | `media/lua/client/ISUI/ISPanel.lua:49-62`, `media/lua/client/ISUI/ISPanel.lua:80-94` |
| `initialise` | Runs once before the panel is shown. It makes the child buttons, calls `instantiate` on each so they have a Java object, and adds them. | `media/lua/client/ISUI/ISModalDialog.lua:11-45`, `media/lua/client/ISUI/ISUIElement.lua:993-1008` |
| `ISButton:new(x, y, width, height, title, target, onclick)` | Makes a button. The positions are relative to the panel's top-left corner. When pressed, the button calls `onclick` with your target first and the button second. | `media/lua/client/ISUI/ISButton.lua:479-481`, `media/lua/client/ISUI/ISButton.lua:47` |
| `render` | Runs every frame after the background is drawn. `drawText` takes the text, then x, y, red, green, blue, alpha and the font. | `media/lua/client/ISUI/ISUIElement.lua:1293`, `media/lua/client/ISUI/ISPanel.lua:18-23` |
| `addToUIManager` | Makes the Java object if it does not exist and hands it to the game's UI manager, which shows and updates it. | `media/lua/client/ISUI/ISUIElement.lua:1365-1371` |
| `removeFromUIManager` | Takes the panel off the screen. Vanilla's dialog hides, then removes. | `media/lua/client/ISUI/ISUIElement.lua:1373-1379`, `media/lua/client/ISUI/ISModalDialog.lua:54-56` |
| `getCore():getScreenWidth()` | The size of the game window, used to center the panel. | `media/lua/client/ISUI/ISCollapsableWindow.lua:116` |

The `RecipeDemoPanel.instance` field keeps one panel at a time: a second request brings the open one to the front instead of making another. :cite[(`media/lua/client/ISUI/ISUIElement.lua:1548-1553`)]

### Step 4. `42/media/lua/client/RecipeDemoUI/DemoMenu.lua`

This adds the entry to the world right-click menu, so the player can open the panel without a key. The game raises `OnFillWorldObjectContextMenu` while it builds that menu, with the player number, the menu, the objects under the cursor and a `test` flag. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:213`, `api/events.jsonl:79`)] The event is raised only when the square allows interaction, which is not the case, for example, in someone else's safehouse. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:211-214`)]

**File `42/media/lua/client/RecipeDemoUI/DemoMenu.lua`**

```lua
local function onFillWorldObjectContextMenu(player, context, worldobjects, test)
    if test then return ISWorldObjectContextMenu.setTest() end
    context:addOption(getText("UI_RecipeDemoUI_Open"), nil, RecipeDemoPanel.open)
end

Events.OnFillWorldObjectContextMenu.Add(onFillWorldObjectContextMenu)
```

When `test` is true, the game is only asking whether the menu has any entry, which it does for controller users, and the vanilla comment says a handler with something to add should call `setTest`. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:122-128`, `media/lua/client/BuildingObjects/ISUI/ISInventoryBuildMenu.lua:81`)] `addOption` takes the text, a target and a function, and the menu calls the function with the target and the extra values when the line is chosen. :cite[(`media/lua/client/ISUI/ISContextMenu.lua:873-886`, `media/lua/client/ISUI/ISContextMenu.lua:70`)] The function is passed to `.Add` as a value, without calling it.

## Turn it on and see it work

**Enable the mod, start a game, right-click the ground, and press the buttons.**

1. Put the `RecipeDemoUI` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoUI/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo UI**, choose **ACCEPT**, and start a new game.
3. Right-click the ground. The menu has a line **Open demo panel**. Choose it.
4. The panel opens in the middle of the screen. Press **Press me** three times: the text reads **Button pressed 3 times**, and `console.txt` holds three `[RecipeDemoUI]` lines.
5. Drag the panel by its background to move it. Choose **Open demo panel** again while it is open: the same panel comes to the front and the count stays. Press **Close** and the panel goes.

On a dedicated server, copy the mod into the server's own `mods` folder and put `Mods=RecipeDemoUI` in the settings file. Separate several entries with `;`, and do the same for `WorkshopItems=` when a mod comes from the Workshop. A UI mod needs no server code, but every player needs the mod. These steps have not been run in a game.

## If it does not work

**A UI mod fails in a few predictable ways, and each one leaves a clue in `console.txt`.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| No **Open demo panel** line on the menu | The mod is not checked, the file is not under `media/lua/client/`, or you right-clicked where the event is not raised, such as a safehouse you may not use. Check `console.txt` for a Lua error that names `DemoMenu.lua`. | `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:211-214` |
| The menu line shows `UI_RecipeDemoUI_Open` | The text is missing from `UI.json`, the file is in the wrong folder, or the key is spelled differently. | `zombie/core/Translator.java:489-506` |
| An error that says `RecipeDemoPanel` is nil when you choose the line | `DemoPanel.lua` did not load, or the menu code used `RecipeDemoPanel` at the top of its file. Use the class only inside a function that runs later. | `zombie/Lua/LuaManager.java:1200-1203` |
| The panel opens, but the buttons are missing | The buttons were added before they had a Java object. Call `initialise` and `instantiate` on each button before `addChild`, as the vanilla dialog does. | `media/lua/client/ISUI/ISModalDialog.lua:11-45` |
| The panel opens but cannot be dragged | `moveWithMouse` is not set to true. | `media/lua/client/ISUI/ISPanel.lua:49-50` |
| The button text is cut off or the count line is wrong | The button width is raised to fit its title, but the panel does not move other children. Make the panel wider, or the text shorter. | `media/lua/client/ISUI/ISButton.lua:493-496` |

Lua files are read when the game loads, so restart the game after every change to a `.lua` or `.json` file. The [debugging Lua page](/pz/build-42/modding/lua-api/debugging-lua-in-b42) covers the log and the debug tools.

## Going further

**Draw more, avoid the coordinate traps, or replace a vanilla window.**

- [UI overview](/pz/build-42/modding/ui/ui-overview) explains how a window is built from `ISUIElement`, `ISPanel` and `ISCollapsableWindow`, and how to open one.
- [UI coordinate traps](/pz/build-42/modding/ui/ui-coordinate-traps) explains why `drawLine2` takes screen coordinates and why `rowAt` takes content coordinates.
- [Replacing a vanilla window](/pz/build-42/modding/ui/replacing-a-vanilla-window) shows how to change a window the game already has.
- [Custom moodle](/pz/build-42/modding/cookbook/custom-moodle) uses a panel like this one as a status badge.
- [Lua gameplay mod](/pz/build-42/modding/cookbook/lua-gameplay-mod) covers events, mod data and commands, which a UI usually needs behind it.

:::callout[How we know]{kind=proof}
Every class and call comes from the vanilla Lua cited above, and the load order and translation behavior from the 42.22 engine code. The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker.

It has not been run in a game: what the panel looks like, where the buttons sit, and the right-click menu are what you check yourself. The sizes and positions are choices of this page. We did not check controller or split-screen behavior, or how a UI element is removed when the player leaves the game.
:::
