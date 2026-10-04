---
id: build-42-custom-ui
slug: custom-ui
title: Custom UI or HUD
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: 'What you build: a custom on-screen panel/HUD via the ISUI Lua framework.'
last_updated: '2026-10-04'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
  - new-workstation
  - new-fluid
  - item-repair
  - evolved-recipe
  - new-trait
  - new-profession
  - new-skill
  - new-animal
  - new-crop
  - lua-gameplay-mod
  - custom-moodle
  - sound-mod
  - radio-channel
  - translations
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# Custom UI or HUD

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a custom on-screen panel/HUD via the ISUI Lua framework.

**Files + placement:** client-side only -- `42/media/lua/client/YourMod/YourCustomUI.lua`. Nest under a mod-named subfolder to avoid path clashes. [CONFIRMED -- `User_Interface.wiki.txt` v42.14.1]

**Skeleton -- an ISPanel-derived class** (verbatim pattern from the wiki; note it uses British `initialise`, not `createChildren`):

```lua
-- media/lua/client/YourMod/YourCustomUI.lua
---@class YourCustomUI : ISPanel
local YourCustomUI = ISPanel:derive("YourCustomUI")

function YourCustomUI:initialise()          -- add child elements here
    local label = ISLabel:new(0, 20, 20, "Hello world!", 1, 1, 1, 1, UIFont.Small, true)
    self:addChild(label)

    local button = ISButton:new(0, 40, 50, 20, "Click me", self, function(parent)
        print("clicked"); parent:close()
    end)
    self:addChild(button)

    ISPanel.initialise(self)
end

function YourCustomUI:prerender()           -- precompute/cache before drawing
    ISPanel.prerender(self)
end

function YourCustomUI:render()              -- draw every frame
    self:drawText("Hello world", 0, 0, 1, 1, 1, 1, UIFont.Small)
end

function YourCustomUI:new(x, y, width, height)
    local o = ISPanel.new(self, x, y, width, height)
    return o
end

return YourCustomUI
```

**Instantiate + add to the UI manager** (toggle on key X; wrap in `Events.OnGameStart.Add(...)` for a persistent HUD instead):

```lua
local YourCustomUI = require("YourMod/YourCustomUI")
local ui
Events.OnKeyPressed.Add(function(key)
    if key ~= Keyboard.KEY_X then return end
    if ui then
        ui:setVisible(false); ui:removeFromUIManager(); ui = nil
    else
        ui = YourCustomUI:new(100, 100, 200, 200)
        ui:initialise()
        ui:addToUIManager()
    end
end)
```

**Key API** [CONFIRMED per wiki]:

| Element / method | Meaning |
|------------------|---------|
| `ISPanel:derive("Name")` | Base class for a custom panel. Alternatives: `ISPanelJoypad` (gamepad), `ISCollapsableWindow` (movable window; no code sample in cache). |
| `:initialise()` / `:prerender()` / `:render()` / `:new(x,y,w,h)` | Lifecycle. Children added in `:initialise()` via `self:addChild(...)`. |
| `:addToUIManager()` / `:removeFromUIManager()` / `:setVisible()` | Show/hide/register. |
| Drawing: `drawText drawRect drawRectBorder drawTexture drawTextureScaled drawItemIcon drawProgressBar drawLine2 drawPolygon` | On any ISUIElement. |
| `backgroundColor` / `borderColor` | `{r,g,b,a}` (defaults `{0,0,0,0.5}` / `{0.4,0.4,0.4,1}`). |
| `getCore():getScreenWidth()/getScreenHeight()`, `getMouseX/Y()`, `isShiftKeyDown()` | Layout/input utilities. |

**Two exceptions to "relative to your element", Outcast.** Every draw call in the table takes coordinates relative to your panel's top-left corner except `drawLine2`, which draws in **screen** coordinates: give it panel-local points and the line lands off by your panel's position. Use `drawLine` instead, or add `self:getAbsoluteX()` and `self:getAbsoluteY()` yourself. And if your panel holds a scrolling list, `ISScrollingListBox:rowAt(x, y)` wants the list's **content** coordinates, which include the scroll. Both are explained in [UI coordinate traps](/pz/build-42/modding/ui/ui-coordinate-traps).

> **Proof:** Code. `media/lua/client/ISUI/ISUIElement.lua`, `ISUIElement:drawLine2` (passes its points to the eight-point `DrawTexture`, which does not add the element's position) and `ISUIElement:drawLine`; `media/lua/client/ISUI/ISScrollingListBox.lua`, `ISScrollingListBox:rowAt`. Build 42.21.0 (revision 4a0e9546ec).

**Gotchas.** UI is client-only (`lua/client/`). The wiki uses `initialise` (British spelling) for child creation -- there is no `createChildren` in the shown pattern. In MP, any state a HUD reflects must come from server-authoritative data (sec 16). All of this is wiki-sourced (v42.14.1), not ScriptsDocs -- LIKELY/CONFIRMED-per-wiki.

**Deep reference:** `_raw_pzwiki_sources/08_creation_toolkit/User_Interface.wiki.txt`; `_raw_scriptsdocs/component__component-uiconfig.txt` (entity UI); doc 03.

---

<a name="18-custom-moodle"></a>

*Updated 2026-10-04: `drawLine2` draws in screen coordinates and `rowAt` takes content coordinates; linked UI coordinate traps.*
