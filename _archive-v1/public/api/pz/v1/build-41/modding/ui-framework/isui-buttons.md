---
id: isui-buttons
slug: isui-buttons
title: Buttons and Input Components
excerpt: ISButton and ISTextEntryBox are the primary interactive components for user input in the ISUI framework. ISUIElement └── ISPanel └── ISButton           -- Clickable button with text/image └──...
game: pz
version: build-41
section: modding
category: ui-framework
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - lua
  - ui
  - isui
  - isbutton
  - istextentrybox
  - input
last_updated: 2026-01-10
---
# Buttons and Input Components

## Overview

ISButton and ISTextEntryBox are the primary interactive components for user input in the ISUI framework.

### Component Hierarchy

```
ISUIElement
    └── ISPanel
            └── ISButton           -- Clickable button with text/image
    └── ISPanelJoypad
            └── ISTextEntryBox     -- Text input field
```

### Location

```
media/lua/client/ISUI/ISButton.lua        -- 442 lines
media/lua/client/ISUI/ISTextEntryBox.lua  -- 294 lines
```

---

## ISButton

ISButton is a clickable button that can display text, an icon, or both.

### Constructor

```lua
function ISButton:new(x, y, width, height, title, clicktarget, onclick, onmousedown, allowMouseUpProcessing)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | number | X position |
| `y` | number | Y position |
| `width` | number | Button width (auto-expands for text) |
| `height` | number | Button height |
| `title` | string | Button text |
| `clicktarget` | table | Target for callback (usually `self`) |
| `onclick` | function | Click handler function |
| `onmousedown` | function | Optional mouse-down handler |
| `allowMouseUpProcessing` | boolean | Process mouse-up even if not pressed |

### Basic Usage

```lua
require "ISUI/ISButton"

-- Simple button
local button = ISButton:new(
    10, 10,           -- x, y
    100, 25,          -- width, height
    "Click Me",       -- title
    self,             -- target
    MyPanel.onClick   -- callback
)
button:initialise()
button:instantiate()
self:addChild(button)

-- Callback receives target, then the button
function MyPanel:onClick(button)
    print("Button clicked:", button:getTitle())
end
```

### Button Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | (param) | Button text |
| `onclick` | function | (param) | Click callback |
| `target` | table | (param) | Callback target |
| `onClickArgs` | table | `{}` | Extra callback arguments |
| `enable` | boolean | `true` | Button enabled state |
| `displayBackground` | boolean | `true` | Draw background |
| `font` | UIFont | `UIFont.Small` | Text font |
| `image` | Texture | nil | Button icon |
| `tooltip` | string | nil | Hover tooltip text |
| `mouseOver` | boolean | - | Mouse is hovering |
| `pressed` | boolean | - | Button is pressed |

### Color Properties

| Property | Default | Description |
|----------|---------|-------------|
| `backgroundColor` | `{r=0, g=0, b=0, a=1}` | Normal background |
| `backgroundColorMouseOver` | `{r=0.3, g=0.3, b=0.3, a=1}` | Hover background |
| `borderColor` | `{r=0.7, g=0.7, b=0.7, a=1}` | Border color |
| `textColor` | `{r=1, g=1, b=1, a=1}` | Text color |

### Button Methods

#### Text & Title

```lua
-- Get/set title
button:setTitle("New Title")
local title = button:getTitle()

-- Auto-resize to fit text
button:setWidthToTitle(minWidth, isJoypad)
```

#### Icons

```lua
-- Set button icon
local tex = getTexture("media/ui/myicon.png")
button:setImage(tex)

-- Force specific icon size
button:forceImageSize(32, 32)

-- Small overlay text (bottom-right)
button:setOverlayText("5")
```

#### Enable/Disable

```lua
-- Disable button (greys out)
button:setEnable(false)

-- Re-enable
button:setEnable(true)
```

#### Click Handling

```lua
-- Change click handler after creation
button:setOnClick(newFunction, arg1, arg2, arg3, arg4)

-- Programmatically trigger click
button:forceClick()

-- Repeat while held (for increment/decrement)
button:setRepeatWhilePressed(incrementFunction)
```

#### Visual Customization

```lua
-- Change font
button:setFont(UIFont.Medium)

-- Hide background (icon-only button)
button:setDisplayBackground(false)

-- Set tooltip
button:setTooltip("Click to perform action")

-- Set colors
button:setBackgroundRGBA(0.2, 0.2, 0.2, 1)
button:setBackgroundColorMouseOverRGBA(0.4, 0.4, 0.4, 1)
button:setBorderRGBA(0.5, 0.5, 0.5, 1)
```

#### Mouse Callbacks

```lua
-- Mouse over/out handlers
button:setOnMouseOverFunction(onHoverFunction)
button:setOnMouseOutFunction(onLeaveFunction)
```

#### Sound

```lua
-- Custom click sound
button:setSound("activate", "MySoundName")
```

---

## ISTextEntryBox

ISTextEntryBox provides text input with Java-backed editing.

### Constructor

```lua
function ISTextEntryBox:new(title, x, y, width, height)
```

**Note:** Parameter order is `(title, x, y, width, height)` - title comes first!

### Basic Usage

```lua
require "ISUI/ISTextEntryBox"

-- Text input field
local textBox = ISTextEntryBox:new(
    "",           -- initial text
    10, 50,       -- x, y
    200, 25       -- width, height
)
textBox:initialise()
textBox:instantiate()
self:addChild(textBox)

-- Get the entered text
local text = textBox:getText()
```

### Text Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | (param) | Initial/current text |
| `font` | UIFont | `UIFont.Small` | Text font |
| `tooltip` | string | nil | Hover tooltip |

### Text Input Methods

#### Text Access

```lua
-- Get/set text
local text = textBox:getText()
textBox:setText("New text")

-- Get raw text without formatting
local raw = textBox:getInternalText()

-- Clear all text
textBox:clear()

-- Select all text
textBox:selectAll()
```

#### Focus Control

```lua
-- Focus the input (keyboard active)
textBox:focus()

-- Remove focus
textBox:unfocus()

-- Check if focused
if textBox:isFocused() then ... end
```

#### Edit State

```lua
-- Make read-only
textBox:setEditable(false)

-- Check if editable
if textBox:isEditable() then ... end

-- Allow text selection (for read-only)
textBox:setSelectable(true)
```

#### Input Constraints

```lua
-- Numbers only
textBox:setOnlyNumbers(true)

-- Maximum characters
textBox:setMaxTextLength(50)

-- Force uppercase
textBox:setForceUpperCase(true)

-- Password field (masked)
textBox:setMasked(true)
```

#### Multi-Line

```lua
-- Enable multi-line
textBox:setMultipleLine(true)

-- Set max lines
textBox:setMaxLines(5)
```

#### Visual Options

```lua
-- Show/hide clear button
textBox:setClearButton(true)

-- Show/hide frame
textBox:setHasFrame(true)

-- Set validation state (red border if invalid)
textBox:setValid(false)
```

#### Cursor Control

```lua
-- Get/set cursor position
local pos = textBox:getCursorPos()
textBox:setCursorPos(5)
```

### Callback Hooks

Override these methods for custom behavior:

```lua
function MyTextBox:onCommandEntered()
    -- Called when Enter is pressed
    local text = self:getText()
    print("Entered:", text)
end

function MyTextBox:onTextChange()
    -- Called when text changes
    self:validateInput()
end
```

---

## Common Patterns

### Button with Callback Arguments

```lua
function MyPanel:createChildren()
    ISPanel.createChildren(self)
    
    -- Pass extra arguments to callback
    local button = ISButton:new(10, 10, 80, 25, "Action", self, MyPanel.onAction)
    button.onClickArgs = { "extraData", 42 }
    button:initialise()
    button:instantiate()
    self:addChild(button)
end

function MyPanel:onAction(button, arg1, arg2)
    print(arg1, arg2)  -- "extraData", 42
end
```

### Text Input with Validation

```lua
MyInputPanel = ISPanel:derive("MyInputPanel")

function MyInputPanel:createChildren()
    ISPanel.createChildren(self)
    
    -- Label
    self.label = ISLabel:new(10, 10, 25, "Enter Name:", 1, 1, 1, 1, UIFont.Small, true)
    self.label:initialise()
    self:addChild(self.label)
    
    -- Text input
    self.nameInput = ISTextEntryBox:new("", 100, 10, 150, 25)
    self.nameInput:initialise()
    self.nameInput:instantiate()
    self.nameInput:setMaxTextLength(20)
    self:addChild(self.nameInput)
    
    -- Override onTextChange for validation
    self.nameInput.onTextChange = function()
        self:validateName()
    end
    
    -- Submit button
    self.submitBtn = ISButton:new(260, 10, 60, 25, "OK", self, MyInputPanel.onSubmit)
    self.submitBtn:initialise()
    self.submitBtn:instantiate()
    self:addChild(self.submitBtn)
end

function MyInputPanel:validateName()
    local name = self.nameInput:getText()
    local valid = #name >= 3
    self.nameInput:setValid(valid)
    self.submitBtn:setEnable(valid)
end

function MyInputPanel:onSubmit()
    local name = self.nameInput:getText()
    print("Submitted:", name)
end
```

### Icon Button

```lua
-- Create icon-only button
local iconBtn = ISButton:new(10, 10, 32, 32, "", self, MyPanel.onIconClick)
iconBtn:initialise()
iconBtn:instantiate()
iconBtn:setImage(getTexture("media/ui/settings.png"))
iconBtn:setDisplayBackground(false)
iconBtn:setTooltip("Settings")
self:addChild(iconBtn)
```

### Increment/Decrement Buttons

```lua
function MyPanel:createChildren()
    ISPanel.createChildren(self)
    
    -- Value display
    self.valueLabel = ISLabel:new(50, 10, 25, "10", 1, 1, 1, 1, UIFont.Medium, true)
    self.valueLabel:initialise()
    self:addChild(self.valueLabel)
    
    -- Minus button (repeats while held)
    self.minusBtn = ISButton:new(10, 10, 30, 25, "-", self, MyPanel.onMinus)
    self.minusBtn:initialise()
    self.minusBtn:instantiate()
    self.minusBtn:setRepeatWhilePressed(MyPanel.onMinus)
    self:addChild(self.minusBtn)
    
    -- Plus button (repeats while held)
    self.plusBtn = ISButton:new(90, 10, 30, 25, "+", self, MyPanel.onPlus)
    self.plusBtn:initialise()
    self.plusBtn:instantiate()
    self.plusBtn:setRepeatWhilePressed(MyPanel.onPlus)
    self:addChild(self.plusBtn)
    
    self.value = 10
end

function MyPanel:onMinus()
    self.value = math.max(0, self.value - 1)
    self.valueLabel:setName(tostring(self.value))
end

function MyPanel:onPlus()
    self.value = math.min(100, self.value + 1)
    self.valueLabel:setName(tostring(self.value))
end
```

### Numeric Input Field

```lua
-- Numbers-only text field
local numInput = ISTextEntryBox:new("0", 10, 10, 80, 25)
numInput:initialise()
numInput:instantiate()
numInput:setOnlyNumbers(true)
numInput:setMaxTextLength(5)
self:addChild(numInput)

-- Get numeric value
local value = tonumber(numInput:getText()) or 0
```

---

## Related

- [ISUI Framework Overview](/build-41/modding/ui-framework/isui-overview) - Framework introduction
- [UI Element Lifecycle](/build-41/modding/ui-framework/isui-lifecycle) - Lifecycle phases
- [Panels and Containers](/build-41/modding/ui-framework/isui-panels) - ISPanel  
