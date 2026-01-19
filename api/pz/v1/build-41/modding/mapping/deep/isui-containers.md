# ISUI Container Patterns - Complete Anatomy

> **Documentation Scope:** This document provides exhaustive documentation of container components: `ISPanel`, `ISPanelJoypad`, `ISCollapsableWindow`, and `ISResizeWidget`. These are the building blocks for organizing UI elements.

---

## Table of Contents
1. [Container Hierarchy](#container-hierarchy)
2. [ISPanel - Basic Container](#ispanel---basic-container)
3. [ISPanelJoypad - Gamepad Support](#ispaneljoypad---gamepad-support)
4. [ISCollapsableWindow - Windowed Container](#iscollapsablewindow---windowed-container)
5. [ISResizeWidget - Resize Handle](#isresizewidget---resize-handle)
6. [Choosing the Right Container](#choosing-the-right-container)
7. [Complete Method Reference](#complete-method-reference)
8. [Modding Patterns](#modding-patterns)

---

## Container Hierarchy

```
ISUIElement
    └── ISPanel                      -- Basic container with background/border
    │       └── ISCollapsableWindow  -- Window with title bar, collapse, resize
    │       └── ISResizeWidget       -- Resize handle component
    │
    └── ISPanelJoypad                -- Container with gamepad navigation
            └── [Most game UI panels]
```

### When to Use Each

| Container | Use Case |
|-----------|----------|
| **ISPanel** | Simple containers, mouse-only UIs, quick prototypes |
| **ISPanelJoypad** | Any UI that should support gamepad navigation |
| **ISCollapsableWindow** | Draggable, resizable windows with title bars |
| **ISResizeWidget** | Internal component for window resizing |

---

## ISPanel - Basic Container

ISPanel extends ISUIElement with:
- Background rendering (filled rectangle)
- Border rendering
- Optional mouse-drag movement
- Simple `close()` and `noBackground()` helpers

### Source Overview

```
File: lua/client/ISUI/ISPanel.lua
Lines: 132
Inherits: ISUIElement
```

### Constructor

```lua
function ISPanel:new(x, y, width, height)
    local o = ISUIElement:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self

    o.x = x
    o.y = y
    o.background = true
    o.backgroundColor = {r=0, g=0, b=0, a=0.5}
    o.borderColor = {r=0.4, g=0.4, b=0.4, a=1}
    o.width = width
    o.height = height
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false
    o.moveWithMouse = false

    return o
end
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `background` | boolean | `true` | Whether to draw background |
| `backgroundColor` | table | `{r=0, g=0, b=0, a=0.5}` | Background color (RGBA 0-1) |
| `borderColor` | table | `{r=0.4, g=0.4, b=0.4, a=1}` | Border color (RGBA 0-1) |
| `moveWithMouse` | boolean | `false` | Enable drag-to-move |
| `moving` | boolean | - | Currently being dragged |
| `downX` | number | - | Mouse X on drag start |
| `downY` | number | - | Mouse Y on drag start |
| `mouseOver` | boolean | - | Mouse is over panel |

### Methods

#### initialise()
```lua
function ISPanel:initialise()
    ISUIElement.initialise(self)
end
```

#### noBackground()
Disables background rendering.
```lua
function ISPanel:noBackground()
    self.background = false
end
```

#### close()
Hides the panel.
```lua
function ISPanel:close()
    self:setVisible(false)
end
```

#### prerender()
Draws background and border.
```lua
function ISPanel:prerender()
    if self.background then
        self:drawRectStatic(0, 0, self.width, self.height,
            self.backgroundColor.a,
            self.backgroundColor.r,
            self.backgroundColor.g,
            self.backgroundColor.b)
        self:drawRectBorderStatic(0, 0, self.width, self.height,
            self.borderColor.a,
            self.borderColor.r,
            self.borderColor.g,
            self.borderColor.b)
    end
end
```

### Mouse Movement System

When `moveWithMouse = true`, ISPanel handles drag-to-move:

#### onMouseDown(x, y)
```lua
function ISPanel:onMouseDown(x, y)
    if not self.moveWithMouse then return true end
    if not self:getIsVisible() then return end
    if not self:isMouseOver() then return end  -- Prevents capture issues

    self.downX = x
    self.downY = y
    self.moving = true
    self:bringToTop()
end
```

#### onMouseMove(dx, dy)
```lua
function ISPanel:onMouseMove(dx, dy)
    if not self.moveWithMouse then return end
    self.mouseOver = true

    if self.moving then
        if self.parent then
            -- Move parent instead if nested
            self.parent:setX(self.parent.x + dx)
            self.parent:setY(self.parent.y + dy)
        else
            self:setX(self.x + dx)
            self:setY(self.y + dy)
            self:bringToTop()
        end
    end
end
```

#### onMouseMoveOutside(dx, dy)
Continues movement even when mouse leaves panel bounds.
```lua
function ISPanel:onMouseMoveOutside(dx, dy)
    if not self.moveWithMouse then return end
    self.mouseOver = false

    if self.moving then
        if self.parent then
            self.parent:setX(self.parent.x + dx)
            self.parent:setY(self.parent.y + dy)
        else
            self:setX(self.x + dx)
            self:setY(self.y + dy)
            self:bringToTop()
        end
    end
end
```

#### onMouseUp(x, y) / onMouseUpOutside(x, y)
```lua
function ISPanel:onMouseUp(x, y)
    if not self.moveWithMouse then return end
    if not self:getIsVisible() then return end

    self.moving = false
    if ISMouseDrag.tabPanel then
        ISMouseDrag.tabPanel:onMouseUp(x, y)
    end
    ISMouseDrag.dragView = nil
end
```

### Basic Usage

```lua
require "ISUI/ISPanel"

-- Create a simple panel
local panel = ISPanel:new(100, 100, 300, 200)
panel:initialise()
panel:instantiate()
panel:addToUIManager()

-- Panel with custom colors
local customPanel = ISPanel:new(100, 100, 300, 200)
customPanel.backgroundColor = {r=0.2, g=0.1, b=0.1, a=0.9}
customPanel.borderColor = {r=0.8, g=0.2, b=0.2, a=1}
customPanel:initialise()
customPanel:addToUIManager()

-- Moveable panel
local moveablePanel = ISPanel:new(100, 100, 300, 200)
moveablePanel.moveWithMouse = true
moveablePanel:initialise()
moveablePanel:addToUIManager()

-- Transparent panel (no background)
local transparentPanel = ISPanel:new(100, 100, 300, 200)
transparentPanel:noBackground()
transparentPanel:initialise()
transparentPanel:addToUIManager()
```

---

## ISPanelJoypad - Gamepad Support

ISPanelJoypad extends ISUIElement with comprehensive gamepad/controller navigation. This is the base class for most in-game UI panels.

### Source Overview

```
File: lua/client/ISUI/ISPanelJoypad.lua
Lines: 397
Inherits: ISUIElement
```

### Key Concepts

#### Button Grid System

ISPanelJoypad organizes focusable children in a 2D grid:

```
joypadButtonsY = {           -- Rows (Y navigation)
    {btn1, btn2, btn3},      -- Row 1 (joypadIndexY = 1)
    {btn4, btn5},            -- Row 2 (joypadIndexY = 2)
    {btn6, btn7, btn8, btn9} -- Row 3 (joypadIndexY = 3)
}
joypadButtons = current row  -- Active row reference
joypadIndex = column index   -- Current X position
joypadIndexY = row index     -- Current Y position
```

#### Focus Navigation

- **D-pad Left/Right**: Move between buttons in current row
- **D-pad Up/Down**: Move between rows (finds closest button by X position)
- **A Button**: Activate focused button/control
- **B Button**: Cancel / close (if ISButtonB set)

### Constructor

```lua
function ISPanelJoypad:new(x, y, width, height)
    local o = ISUIElement:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self

    o.x = x
    o.y = y
    o.background = true
    o.backgroundColor = {r=0, g=0, b=0, a=0.5}
    o.borderColor = {r=0.4, g=0.4, b=0.4, a=1}
    o.width = width
    o.height = height
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false

    -- Joypad-specific properties
    o.joypadButtons = {}      -- Current row of buttons
    o.joypadIndex = 0         -- Current column index
    o.joypadButtonsY = {}     -- All rows of buttons
    o.joypadIndexY = 0        -- Current row index
    o.moveWithMouse = false

    return o
end
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `joypadButtons` | table | `{}` | Current row of focusable elements |
| `joypadButtonsY` | table | `{}` | All rows of focusable elements |
| `joypadIndex` | number | `0` | Current column (1-based when active) |
| `joypadIndexY` | number | `0` | Current row (1-based when active) |
| `ISButtonA` | ISButton | nil | Button triggered by A |
| `ISButtonB` | ISButton | nil | Button triggered by B |
| `ISButtonX` | ISButton | nil | Button triggered by X |
| `ISButtonY` | ISButton | nil | Button triggered by Y |

### Button Registration Methods

#### insertNewLineOfButtons(button1, ..., button10)
Adds a row of buttons for joypad navigation.

```lua
function ISPanelJoypad:insertNewLineOfButtons(button1, button2, ..., button10)
    local newLine = {}
    if button1 then table.insert(newLine, button1) end
    if button2 then table.insert(newLine, button2) end
    -- ... up to button10
    self.joypadButtons = newLine
    table.insert(self.joypadButtonsY, newLine)
    return newLine
end
```

**Usage:**
```lua
function MyPanel:createChildren()
    local btn1 = ISButton:new(10, 10, 80, 25, "Option 1", self, self.onOption1)
    local btn2 = ISButton:new(100, 10, 80, 25, "Option 2", self, self.onOption2)
    local btn3 = ISButton:new(190, 10, 80, 25, "Option 3", self, self.onOption3)

    btn1:initialise()
    btn2:initialise()
    btn3:initialise()

    self:addChild(btn1)
    self:addChild(btn2)
    self:addChild(btn3)

    -- Register for joypad navigation
    self:insertNewLineOfButtons(btn1, btn2, btn3)
end
```

#### insertNewListOfButtons(list)
Adds a pre-built list of buttons as a row.

```lua
function ISPanelJoypad:insertNewListOfButtons(list)
    self.joypadButtons = list
    table.insert(self.joypadButtonsY, list)
end
```

### Face Button Assignment

Assign buttons to controller face buttons:

```lua
function ISPanelJoypad:setISButtonForA(button)
    self.ISButtonA = button
    button:setJoypadButton(Joypad.Texture.AButton)
end

function ISPanelJoypad:setISButtonForB(button)
    self.ISButtonB = button
    button:setJoypadButton(Joypad.Texture.BButton)
end

function ISPanelJoypad:setISButtonForX(button)
    self.ISButtonX = button
    button:setJoypadButton(Joypad.Texture.XButton)
end

function ISPanelJoypad:setISButtonForY(button)
    self.ISButtonY = button
    button:setJoypadButton(Joypad.Texture.YButton)
end
```

**Usage:**
```lua
function MyPanel:createChildren()
    self.okButton = ISButton:new(...)
    self.cancelButton = ISButton:new(...)

    -- A = OK, B = Cancel
    self:setISButtonForA(self.okButton)
    self:setISButtonForB(self.cancelButton)
end
```

### Navigation Methods

#### onJoypadDirLeft(joypadData)
```lua
function ISPanelJoypad:onJoypadDirLeft(joypadData)
    local children = self:getVisibleChildren(self.joypadIndexY)
    local child = children[self.joypadIndex]

    -- Special handling for sliders
    if child and child.isSlider then
        child:onJoypadDirLeft(joypadData)
    elseif #children > 0 and self.joypadIndex > 1 then
        children[self.joypadIndex]:setJoypadFocused(false, joypadData)
        self.joypadIndex = self.joypadIndex - 1
        children[self.joypadIndex]:setJoypadFocused(true, joypadData)
    end
    self:ensureVisible()
end
```

#### onJoypadDirRight(joypadData)
```lua
function ISPanelJoypad:onJoypadDirRight(joypadData)
    local children = self:getVisibleChildren(self.joypadIndexY)
    local child = children[self.joypadIndex]

    if child and child.isSlider then
        child:onJoypadDirRight(joypadData)
    elseif #children > 0 and self.joypadIndex ~= #children then
        children[self.joypadIndex]:setJoypadFocused(false, joypadData)
        self.joypadIndex = self.joypadIndex + 1
        children[self.joypadIndex]:setJoypadFocused(true, joypadData)
    end
    self:ensureVisible()
end
```

#### onJoypadDirUp(joypadData) / onJoypadDirDown(joypadData)
Moves between rows, finding the closest button by X position.

```lua
function ISPanelJoypad:onJoypadDirUp(joypadData)
    local children = self:getVisibleChildren(self.joypadIndexY)
    local child = children[self.joypadIndex]

    -- Special handling for expanded controls
    if child and child.isCombobox and child.expanded then
        child:onJoypadDirUp(joypadData)
    elseif child and child.isRadioButtons and child.joypadIndex > 1 then
        child:onJoypadDirUp(joypadData)
    elseif child and child.isTickBox and child.joypadIndex > 1 then
        child:onJoypadDirUp(joypadData)
    elseif child and child.isKnob then
        child:onJoypadDirUp(joypadData)
    else
        -- Move to previous row
        if #self.joypadButtonsY > 0 and self.joypadIndexY > 1 then
            child:setJoypadFocused(false, joypadData)
            self.joypadIndexY = self.joypadIndexY - 1
            self.joypadButtons = self.joypadButtonsY[self.joypadIndexY]
            children = self:getVisibleChildren(self.joypadIndexY)
            -- Find closest button by X position
            self.joypadIndex = self:getClosestChild(children, child.x + child.width / 2)
            if self.joypadIndex > #children then
                self.joypadIndex = #children
            end
            children[self.joypadIndex]:setJoypadFocused(true, joypadData)
        end
    end
    self:ensureVisible()
end
```

#### getClosestChild(children, x)
Finds button closest to given X coordinate.

```lua
function ISPanelJoypad:getClosestChild(children, x)
    local closestDist = 100000
    local closestIndex = -1
    for i, child in ipairs(children) do
        local dist = math.abs((child.x + child.width / 2) - x)
        if dist <= closestDist then
            closestDist = dist
            closestIndex = i
        end
    end
    return closestIndex
end
```

### Button Activation

#### onJoypadDown(button, joypadData)
```lua
function ISPanelJoypad:onJoypadDown(button, joypadData)
    local children = self:getVisibleChildren(self.joypadIndexY)
    local child = children[self.joypadIndex]

    -- A button activates buttons, comboboxes, tickboxes, knobs, radio buttons
    if button == Joypad.AButton and child then
        if child.isButton or child.isCombobox or child.isTickBox or
           child.isKnob or child.isRadioButtons then
            self:ensureVisible()
            child:forceClick()
            return
        end
        if child.onJoypadDownInParent and
           child:onJoypadDownInParent(button, joypadData) then
            return
        end
        if child.Type == "ISTextEntryBox" then
            child:onJoypadDown(button, joypadData)
            return
        end
    end

    -- B button closes expanded combobox
    if button == Joypad.BButton and child and
       child.isCombobox and child.expanded then
        child.expanded = false
        child:hidePopup()
        return
    end

    -- Face button shortcuts
    if button == Joypad.BButton and self.ISButtonB then
        self.ISButtonB:forceClick()
    elseif button == Joypad.AButton and self.ISButtonA then
        self.ISButtonA:forceClick()
    elseif button == Joypad.XButton and self.ISButtonX then
        self.ISButtonX:forceClick()
    elseif button == Joypad.YButton and self.ISButtonY then
        self.ISButtonY:forceClick()
    end
end
```

### Focus Management

#### getJoypadFocus()
Returns currently focused child.
```lua
function ISPanelJoypad:getJoypadFocus()
    local children = self:getVisibleChildren(self.joypadIndexY)
    return children[self.joypadIndex]
end
```

#### setJoypadFocus(child, joypadData)
Sets focus to specific child.
```lua
function ISPanelJoypad:setJoypadFocus(child, joypadData)
    for indexY, buttons in ipairs(self.joypadButtonsY) do
        for indexX, button in ipairs(buttons) do
            if button == child then
                self:clearJoypadFocus(joypadData)
                self.joypadIndexY = indexY
                self.joypadIndex = indexX
                self.joypadButtons = buttons
                child:setJoypadFocused(true, joypadData)
                return
            end
        end
    end
end
```

#### clearJoypadFocus(joypadData)
Clears focus from current child.
```lua
function ISPanelJoypad:clearJoypadFocus(joypadData)
    local child = self:getJoypadFocus()
    if child then
        child:setJoypadFocused(false, joypadData)
    end
end
```

#### restoreJoypadFocus(joypadData)
Restores focus to last focused child.
```lua
function ISPanelJoypad:restoreJoypadFocus(joypadData)
    local child = self:getJoypadFocus()
    if child then
        child:setJoypadFocused(true, joypadData)
    end
end
```

### Visibility Helpers

#### getVisibleChildren(joypadIndexY)
Returns only visible children in a row.
```lua
function ISPanelJoypad:getVisibleChildren(joypadIndexY)
    local children = {}
    if self.joypadButtonsY[joypadIndexY] then
        local children1 = self.joypadButtonsY[joypadIndexY]
        for _, child in ipairs(children1) do
            if child:isVisible() then
                table.insert(children, child)
            end
        end
    end
    return children
end
```

#### ensureVisible()
Scrolls to keep focused element visible.
```lua
function ISPanelJoypad:ensureVisible()
    if not self.joyfocus then return end
    local children = self:getVisibleChildren(self.joypadIndexY)
    local child = children[self.joypadIndex]
    if not child then return end

    local y = child:getY()
    if y - 40 < 0 - self:getYScroll() then
        self:setYScroll(0 - y + 40)
    elseif y + child:getHeight() + 40 > 0 - self:getYScroll() + self:getHeight() then
        self:setYScroll(0 - (y + child:getHeight() + 40 - self:getHeight()))
    end
end
```

#### isFocusOnControl()
Checks if focus is on an expanded/active control.
```lua
function ISPanelJoypad:isFocusOnControl()
    local children = self:getVisibleChildren(self.joypadIndexY)
    local child = children[self.joypadIndex]
    if child and child.isCombobox and child.expanded then return true end
    if child and child.isRadioButtons and child.joypadIndex > 1 then return true end
    if child and child.isTickBox and child.joypadIndex > 1 then return true end
    if child and child.isKnob then return true end
    return false
end
```

### Right Stick Scrolling

```lua
function ISPanelJoypad:doRightJoystickScrolling(dx, dy)
    if not self.joyfocus then return end
    if self.isFocusOnControl and self:isFocusOnControl() then return end

    dx = dx or 20
    dy = dy or 20

    local axisY = getJoypadAimingAxisY(self.joyfocus.id)
    if axisY > 0.75 then
        self:setYScroll(self:getYScroll() - dy * UIManager.getMillisSinceLastRender() / 33.3)
    end
    if axisY < -0.75 then
        self:setYScroll(self:getYScroll() + dy * UIManager.getMillisSinceLastRender() / 33.3)
    end

    local axisX = getJoypadAimingAxisX(self.joyfocus.id)
    if axisX > 0.75 then
        self:setXScroll(self:getXScroll() - dx * UIManager.getMillisSinceLastRender() / 33.3)
    end
    if axisX < -0.75 then
        self:setXScroll(self:getXScroll() + dx * UIManager.getMillisSinceLastRender() / 33.3)
    end
end
```

**Usage:**
```lua
function MyScrollablePanel:update()
    ISPanelJoypad.update(self)
    self:doRightJoystickScrolling(15, 15)
end
```

### setVisible Override

ISPanelJoypad overrides `setVisible` to handle joypad focus:

```lua
function ISPanelJoypad:setVisible(visible, joypadData)
    if visible and joypadData then
        joypadData.focus = self
        updateJoypadFocus(joypadData)
    end
    ISUIElement.setVisible(self, visible)
end
```

---

## ISCollapsableWindow - Windowed Container

ISCollapsableWindow provides a full-featured window with:
- Title bar with title text
- Close button (X)
- Collapse/Pin buttons
- Auto-collapse when mouse leaves
- Resizable (with ISResizeWidget)
- Draggable
- Info button with rich text popup

### Source Overview

```
File: lua/client/ISUI/ISCollapsableWindow.lua
Lines: 417
Inherits: ISPanel
Requires: ISPanel, ISButton, ISInventoryPane, ISResizeWidget, ISMouseDrag
```

### Constructor

```lua
function ISCollapsableWindow:new(x, y, width, height)
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self

    o.x = x
    o.y = y
    o.borderColor = {r=0.4, g=0.4, b=0.4, a=1}
    o.backgroundColor = {r=0, g=0, b=0, a=0.8}
    o.width = width
    o.height = height
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false

    -- Textures
    o.widgetTextureColor = {r=1, g=1, b=1, a=1}
    o.titlebarbkg = getTexture("media/ui/Panel_TitleBar.png")
    o.statusbarbkg = getTexture("media/ui/Panel_StatusBar.png")
    o.resizeimage = getTexture("media/ui/Panel_StatusBar_Resize.png")
    o.invbasic = getTexture("media/ui/Icon_InventoryBasic.png")
    o.closeButtonTexture = getTexture("media/ui/Dialog_Titlebar_CloseIcon.png")
    o.collapseButtonTexture = getTexture("media/ui/Panel_Icon_Collapse.png")
    o.pinButtonTexture = getTexture("media/ui/Panel_Icon_Pin.png")
    o.infoBtn = getTexture("media/ui/Panel_info_button.png")

    -- State
    o.pin = true              -- Whether window stays open
    o.isCollapsed = false     -- Currently collapsed
    o.collapseCounter = 0     -- Frames since mouse left
    o.title = nil             -- Title bar text
    o.viewList = {}           -- Child views
    o.resizable = true        -- Allow resizing
    o.drawFrame = true        -- Draw window chrome
    o.clearStentil = true     -- Use stencil clipping
    o.titleFont = UIFont.Small
    o.titleFontHgt = getTextManager():getFontHeight(o.titleFont)

    return o
end
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | nil | Title bar text |
| `pin` | boolean | `true` | Window stays open (not auto-collapse) |
| `isCollapsed` | boolean | `false` | Currently collapsed to title bar |
| `collapseCounter` | number | `0` | Frames since mouse left |
| `resizable` | boolean | `true` | Can be resized |
| `drawFrame` | boolean | `true` | Draw title bar and borders |
| `clearStentil` | boolean | `true` | Use stencil clipping |
| `titleFont` | UIFont | `UIFont.Small` | Title text font |
| `viewList` | table | `{}` | Added views |
| `closeButton` | ISButton | - | Close button |
| `pinButton` | ISButton | - | Pin button |
| `collapseButton` | ISButton | - | Collapse button |
| `infoButton` | ISButton | - | Info button |
| `resizeWidget` | ISResizeWidget | - | Corner resize handle |
| `resizeWidget2` | ISResizeWidget | - | Bottom resize handle |

### createChildren()

Creates all window chrome:

```lua
function ISCollapsableWindow:createChildren()
    -- Corner resize widget (X+Y)
    local rh = self:resizeWidgetHeight()
    local resizeWidget = ISResizeWidget:new(self.width - rh, self.height - rh, rh, rh, self)
    resizeWidget:initialise()
    resizeWidget:setVisible(self.resizable)
    self:addChild(resizeWidget)
    self.resizeWidget = resizeWidget

    -- Bottom resize widget (Y only)
    resizeWidget = ISResizeWidget:new(0, self.height - rh, self.width - rh, rh, self, true)
    resizeWidget.anchorLeft = true
    resizeWidget.anchorRight = true
    resizeWidget:initialise()
    resizeWidget:setVisible(self.resizable)
    self:addChild(resizeWidget)
    self.resizeWidget2 = resizeWidget

    -- Close button
    local th = self:titleBarHeight()
    self.closeButton = ISButton:new(3, 0, th, th, "", self, function(self) self:close() end)
    self.closeButton:initialise()
    self.closeButton.borderColor.a = 0.0
    self.closeButton.backgroundColor.a = 0
    self.closeButton.backgroundColorMouseOver.a = 0
    self.closeButton:setImage(self.closeButtonTexture)
    self:addChild(self.closeButton)

    -- Info button
    self.infoButton = ISButton:new(self.closeButton:getRight() + 1, 0, th, th, "", self, ISCollapsableWindow.onInfo)
    self.infoButton:initialise()
    self.infoButton.borderColor.a = 0.0
    self.infoButton.backgroundColor.a = 0.0
    self.infoButton.backgroundColorMouseOver.a = 0.7
    self.infoButton:setImage(self.infoBtn)
    self:addChild(self.infoButton)
    self.infoButton:setVisible(false)

    -- Pin button (shown when collapsed)
    self.pinButton = ISButton:new(self.width - th - 3, 0, th, th, "", self, ISCollapsableWindow.pin)
    self.pinButton.anchorRight = true
    self.pinButton.anchorLeft = false
    self.pinButton:initialise()
    self.pinButton.borderColor.a = 0.0
    self.pinButton.backgroundColor.a = 0
    self.pinButton.backgroundColorMouseOver.a = 0
    self.pinButton:setImage(self.pinButtonTexture)
    self:addChild(self.pinButton)
    self.pinButton:setVisible(false)

    -- Collapse button (shown when pinned)
    self.collapseButton = ISButton:new(self.width - th - 3, 0, th, th, "", self, ISCollapsableWindow.collapse)
    self.collapseButton.anchorRight = true
    self.collapseButton.anchorLeft = false
    self.collapseButton:initialise()
    self.collapseButton.borderColor.a = 0.0
    self.collapseButton.backgroundColor.a = 0
    self.collapseButton.backgroundColorMouseOver.a = 0
    self.collapseButton:setImage(self.collapseButtonTexture)
    self:addChild(self.collapseButton)
end
```

### Title Bar Methods

#### setTitle(title) / getTitle()
```lua
function ISCollapsableWindow:setTitle(title)
    self.title = title
end

function ISCollapsableWindow:getTitle()
    return self.title
end
```

#### titleBarHeight()
```lua
function ISCollapsableWindow:titleBarHeight()
    return math.max(16, self.titleFontHgt + 1)
end

-- Static version
function ISCollapsableWindow.TitleBarHeight()
    return math.max(16, FONT_HGT_SMALL + 1)
end
```

#### resizeWidgetHeight()
```lua
function ISCollapsableWindow:resizeWidgetHeight()
    return 8
end
```

### Collapse/Pin System

#### collapse()
Enables auto-collapse mode.
```lua
function ISCollapsableWindow:collapse()
    self.pin = false
    self.collapseButton:setVisible(false)
    self.pinButton:setVisible(true)
    self.pinButton:bringToTop()
end
```

#### pin()
Disables auto-collapse mode.
```lua
function ISCollapsableWindow:pin()
    self.pin = true
    self.collapseButton:setVisible(true)
    self.pinButton:setVisible(false)
    self.collapseButton:bringToTop()
end
```

#### uncollapse()
Called when mouse enters collapsed window.
```lua
function ISCollapsableWindow:uncollapse()
    self.collapseCounter = 0
    if self.isCollapsed and self:getMouseY() < self:titleBarHeight() then
        self.isCollapsed = false
        self:clearMaxDrawHeight()
        self.collapseCounter = 0
    end
end
```

### Auto-Collapse Behavior

In `onMouseMoveOutside`:
```lua
function ISCollapsableWindow:onMouseMoveOutside(dx, dy)
    self.mouseOver = false

    if self.moving then
        self:setX(self.x + dx)
        self:setY(self.y + dy)
        self:bringToTop()
    end

    -- Auto-collapse when unpinned and mouse leaves
    if not self.pin and (self:getMouseX() < 0 or self:getMouseY() < 0 or
       self:getMouseX() > self:getWidth() or self:getMouseY() > self:getHeight()) then
        self.collapseCounter = self.collapseCounter + 1

        if self.collapseCounter > 20 and not self.isCollapsed then
            self.isCollapsed = true
            self:setMaxDrawHeight(self:titleBarHeight())
        end
    end
end
```

### Info System

#### setInfo(text)
Sets info text and shows/hides info button.
```lua
function ISCollapsableWindow:setInfo(text)
    if text and text ~= "" then
        self.infoButton:setVisible(true)
        self.infoText = text
        if self.infoRichText then
            self.infoRichText.chatText.text = text
            self.infoRichText.chatText:paginate()
            self.infoRichText:setHeightToContents()
            self.infoRichText:setY(getCore():getScreenHeight()/2 - self.infoRichText:getHeight()/2)
            self.infoRichText:updateButtons()
        end
    else
        self.infoButton:setVisible(false)
        if self.infoRichText then
            self.infoRichText:removeFromUIManager()
        end
    end
end
```

#### onInfo()
Shows/hides info popup.
```lua
function ISCollapsableWindow:onInfo()
    if not self.infoRichText then
        self.infoRichText = ISModalRichText:new(
            getCore():getScreenWidth()/2 - 400,
            getCore():getScreenHeight()/2 - 300,
            600, 600, self.infoText, false)
        self.infoRichText:initialise()
        self.infoRichText.backgroundColor = {r=0, g=0, b=0, a=0.9}
        self.infoRichText.alwaysOnTop = true
        self.infoRichText.chatText:paginate()
        self.infoRichText:setHeightToContents()
        self.infoRichText:ignoreHeightChange()
        self.infoRichText:setY(getCore():getScreenHeight()/2 - self.infoRichText:getHeight()/2)
        self.infoRichText:setVisible(true)
        self.infoRichText:addToUIManager()
    elseif self.infoRichText:isReallyVisible() then
        self.infoRichText:removeFromUIManager()
    else
        self.infoRichText:setVisible(true)
        self.infoRichText:addToUIManager()
    end
end
```

### View Management

#### addView(view)
Adds a child view positioned below title bar.
```lua
function ISCollapsableWindow:addView(view)
    view:setX(0)
    view:setY(self:titleBarHeight())
    self:addChild(view)
    view:setVisible(true)
    table.insert(self.viewList, view)
end
```

#### getViews()
```lua
function ISCollapsableWindow:getViews()
    return self.viewList
end
```

### Resize Control

#### setResizable(resizable)
```lua
function ISCollapsableWindow:setResizable(resizable)
    self.resizable = resizable
    if self.resizeWidget then
        self.resizeWidget:setVisible(resizable)
    end
    if self.resizeWidget2 then
        self.resizeWidget2:setVisible(resizable)
    end
end
```

### Frame Control

#### setDrawFrame(visible)
```lua
function ISCollapsableWindow:setDrawFrame(visible)
    self.background = visible
    self.drawFrame = visible
    if self.closeButton then
        self.closeButton:setVisible(visible)
        self.pinButton:setVisible(visible and not self.pin)
        self.collapseButton:setVisible(visible and self.pin)
    end
end
```

### Layout Save/Restore

```lua
function ISCollapsableWindow:RestoreLayout(name, layout)
    if not self.resizable then
        layout.width = nil
        layout.height = nil
    end
    ISLayoutManager.DefaultRestoreWindow(self, layout)
    if layout.pin == 'true' then
        ISCollapsableWindow.pin(self)
    elseif layout.pin == 'false' then
        self:collapse()
        self.isCollapsed = true
        self:setMaxDrawHeight(self:titleBarHeight())
    end
end

function ISCollapsableWindow:SaveLayout(name, layout)
    ISLayoutManager.DefaultSaveWindow(self, layout)
    if self.pin then layout.pin = 'true' else layout.pin = 'false' end
end
```

---

## ISResizeWidget - Resize Handle

ISResizeWidget is an internal component used by ISCollapsableWindow for resizing.

### Source Overview

```
File: lua/client/ISUI/ISResizeWidget.lua
Lines: 153
Inherits: ISPanel
```

### Constructor

```lua
function ISResizeWidget:new(x, y, width, height, resizeTarget, yonly)
    local o = {}
    setmetatable(o, self)
    self.__index = self

    o.x = x
    o.y = y
    o.borderColor = {r=1, g=1, b=1, a=0.7}
    o.backgroundColor = {r=0, g=0, b=0, a=1.0}
    o.backgroundColorMouseOver = {r=0.3, g=0.3, b=0.3, a=1.0}
    o.width = width
    o.height = height

    -- Anchored to bottom-right
    o.anchorLeft = false
    o.anchorRight = true
    o.anchorTop = false
    o.anchorBottom = true

    o.mouseOver = false
    o.yonly = yonly          -- Only resize vertically
    o.target = resizeTarget  -- Element to resize

    return o
end
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `target` | ISUIElement | Element being resized |
| `yonly` | boolean | Only allow vertical resize |
| `resizing` | boolean | Currently resizing |
| `downX` | number | Mouse X at resize start |
| `downY` | number | Mouse Y at resize start |

### resize(dx, dy)

Core resize logic:

```lua
function ISResizeWidget:resize(dx, dy)
    local x = self.target.width + dx
    local y = self.target.height + dy

    -- Initialize minimum dimensions if needed
    if self.target.minimumWidth == nil then
        self.target.minimumWidth = 0
        self.target.minimumHeight = 0
    end

    -- Enforce minimums
    if x < self.target.minimumWidth then
        x = self.target.minimumWidth
    end
    if y < self.target.minimumHeight then
        y = self.target.minimumHeight
    end

    -- Keep on screen
    if self.target:getY() + y > getCore():getScreenHeight() then
        y = getCore():getScreenHeight() - self.target:getY()
    end

    -- Reset collapse counter (for ISCollapsableWindow)
    self.target.collapseCounter = 0

    -- Apply new size
    self.target:setWidth(x)
    self.target:setHeight(y)
end
```

### Mouse Handling

```lua
function ISResizeWidget:onMouseDown(x, y)
    if not self:getIsVisible() then return end

    self.downX = self:getMouseX()
    self.downY = self:getMouseY()
    self.resizing = true
    self:setCapture(true)
    return true
end

function ISResizeWidget:onMouseMove(dx, dy)
    self.mouseOver = true
    if self.resizing then
        local dx = self:getMouseX() - self.downX
        local dy = self:getMouseY() - self.downY
        if self.yonly then
            self:resize(0, dy)
        else
            self:resize(dx, dy)
        end
    end
end

function ISResizeWidget:onMouseUp(x, y)
    if not self:getIsVisible() then return end
    self.resizing = false
    self:setCapture(false)
    return true
end
```

---

## Choosing the Right Container

### Decision Tree

```
Does your UI need gamepad support?
    │
    ├── YES → Use ISPanelJoypad
    │         └── Does it need a window frame?
    │             └── YES → Wrap with wrapInCollapsableWindow()
    │
    └── NO → Use ISPanel
             └── Does it need a window frame?
                 ├── YES → Use ISCollapsableWindow
                 └── NO → Use ISPanel directly
```

### Comparison Table

| Feature | ISPanel | ISPanelJoypad | ISCollapsableWindow |
|---------|---------|---------------|---------------------|
| Background | ✓ | ✓ | ✓ |
| Border | ✓ | ✓ | ✓ |
| Drag to move | Optional | Optional | ✓ (always) |
| Title bar | ✗ | ✗ | ✓ |
| Close button | ✗ | ✗ | ✓ |
| Resizable | ✗ | ✗ | ✓ |
| Collapsable | ✗ | ✗ | ✓ |
| Gamepad nav | ✗ | ✓ | ✗ |
| Button grid | ✗ | ✓ | ✗ |
| Face buttons | ✗ | ✓ | ✗ |

---

## Complete Method Reference

### ISPanel Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x, y, width, height` | ISPanel | Create panel |
| `initialise` | - | - | Initialize |
| `noBackground` | - | - | Disable background |
| `close` | - | - | Hide panel |
| `prerender` | - | - | Draw background/border |
| `onMouseDown` | `x, y` | - | Handle click |
| `onMouseUp` | `x, y` | - | Handle release |
| `onMouseMove` | `dx, dy` | - | Handle movement |
| `onMouseMoveOutside` | `dx, dy` | - | Handle outside movement |
| `onMouseUpOutside` | `x, y` | - | Handle outside release |

### ISPanelJoypad Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x, y, width, height` | ISPanelJoypad | Create panel |
| `insertNewLineOfButtons` | `btn1...btn10` | table | Add button row |
| `insertNewListOfButtons` | `list` | - | Add button list |
| `setISButtonForA` | `button` | - | Set A button |
| `setISButtonForB` | `button` | - | Set B button |
| `setISButtonForX` | `button` | - | Set X button |
| `setISButtonForY` | `button` | - | Set Y button |
| `onJoypadDown` | `button, joypadData` | - | Handle button press |
| `onJoypadDirLeft` | `joypadData` | - | Handle left |
| `onJoypadDirRight` | `joypadData` | - | Handle right |
| `onJoypadDirUp` | `joypadData` | - | Handle up |
| `onJoypadDirDown` | `joypadData` | - | Handle down |
| `getJoypadFocus` | - | element | Get focused element |
| `setJoypadFocus` | `child, joypadData` | - | Set focus |
| `clearJoypadFocus` | `joypadData` | - | Clear focus |
| `restoreJoypadFocus` | `joypadData` | - | Restore focus |
| `getVisibleChildren` | `joypadIndexY` | table | Get visible row |
| `getClosestChild` | `children, x` | number | Find closest |
| `ensureVisible` | - | - | Scroll to focused |
| `isFocusOnControl` | - | boolean | Check control focus |
| `doRightJoystickScrolling` | `dx, dy` | - | Handle stick scroll |
| `setVisible` | `visible, joypadData` | - | Set visibility |

### ISCollapsableWindow Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x, y, width, height` | window | Create window |
| `setTitle` | `title` | - | Set title text |
| `getTitle` | - | string | Get title |
| `titleBarHeight` | - | number | Get title bar height |
| `resizeWidgetHeight` | - | number | Get resize area height |
| `close` | - | - | Hide window |
| `collapse` | - | - | Enable auto-collapse |
| `pin` | - | - | Disable auto-collapse |
| `uncollapse` | - | - | Expand collapsed window |
| `setInfo` | `text` | - | Set info popup text |
| `onInfo` | - | - | Toggle info popup |
| `addView` | `view` | - | Add child view |
| `getViews` | - | table | Get views |
| `setResizable` | `bool` | - | Enable/disable resize |
| `setDrawFrame` | `bool` | - | Show/hide chrome |
| `SaveLayout` | `name, layout` | - | Save position/size |
| `RestoreLayout` | `name, layout` | - | Restore position/size |

### ISResizeWidget Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x, y, w, h, target, yonly` | widget | Create widget |
| `resize` | `dx, dy` | - | Resize target |
| `onMouseDown` | `x, y` | boolean | Start resize |
| `onMouseMove` | `dx, dy` | - | Continue resize |
| `onMouseUp` | `x, y` | boolean | End resize |

---

## Modding Patterns

### Pattern 1: Simple Settings Panel with Joypad

```lua
require "ISUI/ISPanelJoypad"
require "ISUI/ISButton"
require "ISUI/ISTickBox"

MySettingsPanel = ISPanelJoypad:derive("MySettingsPanel")

function MySettingsPanel:new(x, y, width, height)
    local o = ISPanelJoypad:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.backgroundColor = {r=0.1, g=0.1, b=0.1, a=0.9}
    return o
end

function MySettingsPanel:createChildren()
    ISPanelJoypad.createChildren(self)

    local y = 20

    -- Row 1: Checkboxes
    self.enableFeature = ISTickBox:new(20, y, 200, 20, "")
    self.enableFeature:initialise()
    self.enableFeature:addOption("Enable Feature")
    self:addChild(self.enableFeature)

    self.enableSound = ISTickBox:new(240, y, 200, 20, "")
    self.enableSound:initialise()
    self.enableSound:addOption("Enable Sound")
    self:addChild(self.enableSound)

    self:insertNewLineOfButtons(self.enableFeature, self.enableSound)

    y = y + 40

    -- Row 2: Buttons
    self.okButton = ISButton:new(20, y, 100, 25, "OK", self, MySettingsPanel.onOK)
    self.okButton:initialise()
    self:addChild(self.okButton)

    self.cancelButton = ISButton:new(140, y, 100, 25, "Cancel", self, MySettingsPanel.onCancel)
    self.cancelButton:initialise()
    self:addChild(self.cancelButton)

    self:insertNewLineOfButtons(self.okButton, self.cancelButton)

    -- Set face button shortcuts
    self:setISButtonForA(self.okButton)
    self:setISButtonForB(self.cancelButton)
end

function MySettingsPanel:onOK()
    -- Save settings
    self:close()
end

function MySettingsPanel:onCancel()
    self:close()
end

-- Show with joypad support
function MySettingsPanel.show(joypadData)
    local panel = MySettingsPanel:new(100, 100, 400, 100)
    panel:initialise()
    panel:instantiate()

    local window = panel:wrapInCollapsableWindow("Settings")
    window:setVisible(true, joypadData)
    window:addToUIManager()

    return window
end
```

### Pattern 2: Scrollable List with Joypad

```lua
require "ISUI/ISPanelJoypad"
require "ISUI/ISButton"

MyScrollableList = ISPanelJoypad:derive("MyScrollableList")

function MyScrollableList:new(x, y, width, height)
    local o = ISPanelJoypad:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.items = {}
    o.itemHeight = 30
    return o
end

function MyScrollableList:createChildren()
    ISPanelJoypad.createChildren(self)
    self:addScrollBars(false)
end

function MyScrollableList:addItem(text, data)
    local y = #self.items * self.itemHeight + 10

    local btn = ISButton:new(10, y, self.width - 40, self.itemHeight - 5,
        text, self, MyScrollableList.onItemClick)
    btn:initialise()
    btn.internal = data
    self:addChild(btn)

    table.insert(self.items, btn)

    -- Each item is its own row for vertical navigation
    self:insertNewLineOfButtons(btn)

    -- Update scroll height
    self:setScrollHeight(#self.items * self.itemHeight + 20)
end

function MyScrollableList:onItemClick(button)
    print("Clicked: " .. tostring(button.internal))
end

function MyScrollableList:update()
    ISPanelJoypad.update(self)
    -- Enable right stick scrolling
    self:doRightJoystickScrolling(0, 20)
end
```

### Pattern 3: Custom Window with Multiple Panels

```lua
require "ISUI/ISCollapsableWindow"
require "ISUI/ISTabPanel"

MyTabbedWindow = ISCollapsableWindow:derive("MyTabbedWindow")

function MyTabbedWindow:new(x, y, width, height)
    local o = ISCollapsableWindow:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.title = "My Tabbed Window"
    o.minimumWidth = 300
    o.minimumHeight = 200
    return o
end

function MyTabbedWindow:createChildren()
    ISCollapsableWindow.createChildren(self)

    local th = self:titleBarHeight()
    local rh = self:resizeWidgetHeight()

    -- Create tab panel
    self.tabPanel = ISTabPanel:new(0, th, self.width, self.height - th - rh)
    self.tabPanel:initialise()
    self.tabPanel.anchorRight = true
    self.tabPanel.anchorBottom = true
    self:addChild(self.tabPanel)

    -- Add tabs
    local tab1 = ISPanel:new(0, 0, self.tabPanel.width, self.tabPanel.height - 25)
    tab1:initialise()
    self.tabPanel:addView("General", tab1)

    local tab2 = ISPanel:new(0, 0, self.tabPanel.width, self.tabPanel.height - 25)
    tab2:initialise()
    self.tabPanel:addView("Advanced", tab2)

    -- Set info text
    self:setInfo("This window has multiple tabs. <LINE> Click the tabs to switch views.")
end

function MyTabbedWindow.show()
    local window = MyTabbedWindow:new(
        getCore():getScreenWidth() / 2 - 200,
        getCore():getScreenHeight() / 2 - 150,
        400, 300)
    window:initialise()
    window:addToUIManager()
    return window
end
```

### Pattern 4: Draggable Panel (No Window Frame)

```lua
require "ISUI/ISPanel"

MyDraggablePanel = ISPanel:derive("MyDraggablePanel")

function MyDraggablePanel:new(x, y, width, height)
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self

    o.moveWithMouse = true  -- Enable dragging
    o.backgroundColor = {r=0.2, g=0.2, b=0.3, a=0.95}
    o.borderColor = {r=0.5, g=0.5, b=0.7, a=1}

    return o
end

function MyDraggablePanel:createChildren()
    ISPanel.createChildren(self)

    -- Add a title area
    self.titleLabel = ISLabel:new(10, 5, 20, "Drag Me!", 1, 1, 1, 1, UIFont.Medium, true)
    self.titleLabel:initialise()
    self:addChild(self.titleLabel)

    -- Add close button
    self.closeBtn = ISButton:new(self.width - 25, 5, 20, 20, "X", self, MyDraggablePanel.close)
    self.closeBtn:initialise()
    self.closeBtn.anchorLeft = false
    self.closeBtn.anchorRight = true
    self:addChild(self.closeBtn)
end
```

---

## Summary

Container selection guide:

1. **ISPanel** - Simplest container. Use for:
   - Static UI sections
   - Mouse-only interfaces
   - Quick prototypes
   - Nested containers within larger UIs

2. **ISPanelJoypad** - Gamepad-enabled container. Use for:
   - Any UI that players might use with a controller
   - Settings screens
   - Dialog boxes with button navigation
   - Lists with selectable items

3. **ISCollapsableWindow** - Full-featured window. Use for:
   - Standalone windows (inventory, crafting, etc.)
   - Panels that need title bars
   - Resizable content areas
   - Windows with collapse behavior

4. **ISResizeWidget** - Internal component:
   - Used by ISCollapsableWindow
   - Rarely used directly in mods

Key patterns:
- Use `wrapInCollapsableWindow()` to add window chrome to any panel
- Register buttons with `insertNewLineOfButtons()` for joypad navigation
- Set `moveWithMouse = true` for draggable panels without window chrome
- Override `createChildren()` to add child components
