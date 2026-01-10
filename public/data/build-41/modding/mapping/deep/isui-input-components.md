# ISUI User Input Components - Complete Anatomy

> **Documentation Scope:** This document provides exhaustive documentation of user input components: `ISButton`, `ISTextEntryBox`, `ISTickBox`, `ISRadioButtons`, `ISSliderPanel`, and `ISVolumeControl`. These are the interactive elements users click, type in, and manipulate.

---

## Table of Contents
1. [Input Component Hierarchy](#input-component-hierarchy)
2. [ISButton - Clickable Button](#isbutton---clickable-button)
3. [ISTextEntryBox - Text Input](#istextentrybox---text-input)
4. [ISTickBox - Checkboxes](#istickbox---checkboxes)
5. [ISRadioButtons - Radio Selection](#isradiobuttons---radio-selection)
6. [ISSliderPanel - Value Slider](#issliderpanel---value-slider)
7. [ISVolumeControl - Volume Slider](#isvolumecontrol---volume-slider)
8. [Common Patterns](#common-patterns)
9. [Complete Method Reference](#complete-method-reference)
10. [Modding Examples](#modding-examples)

---

## Input Component Hierarchy

```
ISUIElement
    └── ISPanel
            ├── ISButton           -- Clickable button with text/image
            ├── ISTickBox          -- Multiple checkboxes (multi-select)
            ├── ISRadioButtons     -- Single selection from options
            ├── ISSliderPanel      -- Numeric slider with buttons
            └── ISVolumeControl    -- 0-10 volume slider
    └── ISPanelJoypad
            └── ISTextEntryBox     -- Text input field
```

### Type Identification Flags

Each component sets a flag for type checking:

| Component | Flag | Value |
|-----------|------|-------|
| ISButton | `isButton` | `true` |
| ISTickBox | `isTickBox` | `true` |
| ISRadioButtons | `isRadioButtons` | `true` |
| ISSliderPanel | `isSliderPanel` | `true` |
| ISVolumeControl | `isSlider` | `true` |

---

## ISButton - Clickable Button

ISButton is the most common interactive element - a clickable button with text and/or image.

### Source Overview

```
File: lua/client/ISUI/ISButton.lua
Lines: 442
Inherits: ISPanel
```

### Constructor

```lua
function ISButton:new(x, y, width, height, title, clicktarget, onclick, onmousedown, allowMouseUpProcessing)
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self

    o.x = x
    o.y = y
    o.font = UIFont.Small
    o.borderColor = {r=0.7, g=0.7, b=0.7, a=1}
    o.backgroundColor = {r=0, g=0, b=0, a=1.0}
    o.backgroundColorMouseOver = {r=0.3, g=0.3, b=0.3, a=1.0}
    o.textureColor = {r=1.0, g=1.0, b=1.0, a=1.0}
    o.textColor = {r=1.0, g=1.0, b=1.0, a=1.0}

    -- Auto-expand width to fit title
    if width < (getTextManager():MeasureStringX(UIFont.Small, title) + 10) then
        width = getTextManager():MeasureStringX(UIFont.Small, title) + 10
    end

    o.width = width
    o.height = height
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false
    o.mouseOver = false
    o.displayBackground = true
    o.title = title
    o.onclick = onclick
    o.onClickArgs = {}
    o.target = clicktarget
    o.onmousedown = onmousedown
    o.enable = true
    o.tooltip = nil
    o.isButton = true
    o.allowMouseUpProcessing = allowMouseUpProcessing
    o.yoffset = 0
    o.fade = UITransition.new()
    o.joypadTextureWH = 20
    o.sounds = {}
    o.sounds.activate = "UIActivateButton"

    return o
end
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | (param) | Button text |
| `onclick` | function | (param) | Click callback |
| `target` | table | (param) | Callback target (self) |
| `onClickArgs` | table | `{}` | Extra callback arguments |
| `onmousedown` | function | nil | Mouse down callback |
| `enable` | boolean | `true` | Button enabled state |
| `displayBackground` | boolean | `true` | Draw background |
| `font` | UIFont | `UIFont.Small` | Text font |
| `image` | Texture | nil | Button icon |
| `tooltip` | string | nil | Hover tooltip text |
| `isButton` | boolean | `true` | Type identifier |
| `mouseOver` | boolean | `false` | Mouse hovering |
| `pressed` | boolean | - | Button pressed down |
| `joypadFocused` | boolean | - | Has joypad focus |
| `blinkBG` | boolean | - | Enable background blink |
| `blinkImage` | boolean | - | Enable image blink |
| `yoffset` | number | `0` | Text Y offset |
| `sounds.activate` | string | `"UIActivateButton"` | Click sound |

### Color Properties

| Property | Default | Description |
|----------|---------|-------------|
| `backgroundColor` | `{r=0, g=0, b=0, a=1}` | Normal background |
| `backgroundColorMouseOver` | `{r=0.3, g=0.3, b=0.3, a=1}` | Hover background |
| `backgroundColorPressed` | (computed) | Pressed background |
| `borderColor` | `{r=0.7, g=0.7, b=0.7, a=1}` | Border color |
| `textColor` | `{r=1, g=1, b=1, a=1}` | Text color |
| `textureColor` | `{r=1, g=1, b=1, a=1}` | Image tint |

### Click Handler System

The callback pattern: `onclick(target, button, arg1, arg2, arg3, arg4)`

```lua
function ISButton:onMouseUp(x, y)
    if not self:getIsVisible() then return end

    local process = false
    if self.pressed == true then
        process = true
    end
    self.pressed = false

    if self.onclick == nil then return end

    if self.enable and (process or self.allowMouseUpProcessing) then
        getSoundManager():playUISound(self.sounds.activate)
        self.onclick(self.target, self,
            self.onClickArgs[1], self.onClickArgs[2],
            self.onClickArgs[3], self.onClickArgs[4])
    end
end
```

### Key Methods

#### setTitle(title) / getTitle()
```lua
function ISButton:setTitle(title)
    self.title = title
end

function ISButton:getTitle()
    return self.title
end
```

#### setImage(image)
Sets button icon.
```lua
function ISButton:setImage(image)
    self.image = image
end

-- Usage
local tex = getTexture("media/ui/myicon.png")
button:setImage(tex)
```

#### forceImageSize(width, height)
Forces image to specific dimensions.
```lua
function ISButton:forceImageSize(width, height)
    self.forcedWidthImage = width
    self.forcedHeightImage = height
end
```

#### setOverlayText(text)
Sets small overlay text (bottom-right corner).
```lua
function ISButton:setOverlayText(text)
    self.overlayText = text
end
```

#### setEnable(bEnabled)
Enables/disables button with visual feedback.
```lua
function ISButton:setEnable(bEnabled)
    self.enable = bEnabled
    if not self.borderColorEnabled then
        self.borderColorEnabled = {
            r = self.borderColor.r, g = self.borderColor.g,
            b = self.borderColor.b, a = self.borderColor.a
        }
    end
    if bEnabled then
        self:setTextureRGBA(1, 1, 1, 1)
        self:setBorderRGBA(
            self.borderColorEnabled.r, self.borderColorEnabled.g,
            self.borderColorEnabled.b, self.borderColorEnabled.a)
    else
        self:setTextureRGBA(0.3, 0.3, 0.3, 1.0)
        self:setBorderRGBA(0.7, 0.1, 0.1, 0.7)
    end
end
```

#### forceClick()
Programmatically triggers click.
```lua
function ISButton:forceClick()
    if not self:getIsVisible() or not self.enable then return end
    if self.repeatWhilePressedFunc then
        return self.repeatWhilePressedFunc(self.target, self)
    end
    getSoundManager():playUISound(self.sounds.activate)
    self.onclick(self.target, self,
        self.onClickArgs[1], self.onClickArgs[2],
        self.onClickArgs[3], self.onClickArgs[4])
end
```

#### setOnClick(func, arg1, arg2, arg3, arg4)
Changes click handler after creation.
```lua
function ISButton:setOnClick(func, arg1, arg2, arg3, arg4)
    self.onclick = func
    self.onClickArgs = { arg1, arg2, arg3, arg4 }
end
```

#### setRepeatWhilePressed(func)
Sets function to call repeatedly while held.
```lua
function ISButton:setRepeatWhilePressed(func)
    self.repeatWhilePressedFunc = func
end
```

The update loop handles repeat:
```lua
function ISButton:update()
    ISUIElement.update(self)
    if self.enable and self.pressed and self.target and self.repeatWhilePressedFunc then
        if not self.pressedTime then
            self.pressedTime = getTimestampMs()
            self.repeatWhilePressedFunc(self.target, self)
        else
            local ms = getTimestampMs()
            if ms - self.pressedTime > 500 then  -- 500ms repeat rate
                self.pressedTime = ms
                self.repeatWhilePressedFunc(self.target, self)
            end
        end
    else
        self.pressedTime = nil
    end
end
```

#### setWidthToTitle(minWidth, isJoypad)
Resizes button to fit text.
```lua
function ISButton:setWidthToTitle(minWidth, isJoypad)
    local width = getTextManager():MeasureStringX(self.font, self.title) + 10
    if isJoypad then
        width = width + 5 + self.joypadTextureWH
    end
    width = math.max(width, minWidth or 0)
    if width ~= self.width then
        self:setWidth(width)
    end
end
```

#### setTooltip(tooltip)
```lua
function ISButton:setTooltip(tooltip)
    self.tooltip = tooltip
end
```

#### setFont(font)
```lua
function ISButton:setFont(font)
    self.font = font
end
```

#### setDisplayBackground(background)
```lua
function ISButton:setDisplayBackground(background)
    self.displayBackground = background
end
```

#### Color Setters
```lua
function ISButton:setBackgroundRGBA(r, g, b, a)
    self.backgroundColor.r = r
    self.backgroundColor.g = g
    self.backgroundColor.b = b
    self.backgroundColor.a = a
end

function ISButton:setBackgroundColorMouseOverRGBA(r, g, b, a)
    self.backgroundColorMouseOver.r = r
    self.backgroundColorMouseOver.g = g
    self.backgroundColorMouseOver.b = b
    self.backgroundColorMouseOver.a = a
end

function ISButton:setBorderRGBA(r, g, b, a)
    self.borderColor.r = r
    self.borderColor.g = b
    self.borderColor.b = b
    self.borderColor.a = a
end

function ISButton:setTextureRGBA(r, g, b, a)
    self.textureColor.r = r
    self.textureColor.g = g
    self.textureColor.b = b
    self.textureColor.a = a
end
```

### Joypad Support

```lua
function ISButton:setJoypadFocused(focused)
    self.joypadFocused = focused
end

function ISButton:setJoypadButton(texture)
    self.isJoypad = true
    self.joypadTexture = texture
end

function ISButton:clearJoypadButton()
    self.isJoypad = false
    self.joypadTexture = nil
end
```

### Mouse Callbacks

```lua
function ISButton:setOnMouseOverFunction(onmouseover)
    self.onmouseover = onmouseover
end

function ISButton:setOnMouseOutFunction(onmouseout)
    self.onmouseoutfunction = onmouseout
end
```

### Sound Control

```lua
function ISButton:setSound(which, soundName)
    self.sounds[which] = soundName
end

-- Usage
button:setSound("activate", "MySoundName")
```

---

## ISTextEntryBox - Text Input

ISTextEntryBox provides text input with Java-backed editing, supporting single and multi-line modes, validation, and on-screen keyboard for gamepads.

### Source Overview

```
File: lua/client/ISUI/ISTextEntryBox.lua
Lines: 294
Inherits: ISPanelJoypad
Java Class: UITextBox2
```

### Constructor

```lua
function ISTextEntryBox:new(title, x, y, width, height)
    local o = ISPanelJoypad.new(self, x, y, width, height)
    o.title = title
    o.backgroundColor = {r=0, g=0, b=0, a=0.5}
    o.borderColor = {r=0.4, g=0.4, b=0.4, a=1}
    o.keeplog = false
    o.logIndex = 0
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false
    o.fade = UITransition.new()
    o.font = UIFont.Small
    o.currentText = title
    return o
end
```

**Note:** Parameter order is `(title, x, y, width, height)` - title comes first!

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | (param) | Initial/current text |
| `font` | UIFont | `UIFont.Small` | Text font |
| `tooltip` | string | nil | Hover tooltip |
| `joypadFocused` | boolean | - | Has joypad focus |

### instantiate() - Java Bridge

ISTextEntryBox uses a special Java class:

```lua
function ISTextEntryBox:instantiate()
    self.javaObject = UITextBox2.new(self.font, self.x, self.y,
        self.width, self.height, self.title, false)
    self.javaObject:setTable(self)
    self.javaObject:setX(self.x)
    self.javaObject:setY(self.y)
    self.javaObject:setHeight(self.height)
    self.javaObject:setWidth(self.width)
    self.javaObject:setAnchorLeft(self.anchorLeft)
    self.javaObject:setAnchorRight(self.anchorRight)
    self.javaObject:setAnchorTop(self.anchorTop)
    self.javaObject:setAnchorBottom(self.anchorBottom)
    self.javaObject:setEditable(true)
    self.javaObject:SetText(self.title)
end
```

### Text Methods

#### getText() / setText(str)
```lua
function ISTextEntryBox:getText()
    return self.javaObject:getText()
end

function ISTextEntryBox:setText(str)
    if not str then str = "" end
    self.javaObject:SetText(str)
    self.title = str
end
```

#### getInternalText()
Returns raw text without formatting.
```lua
function ISTextEntryBox:getInternalText()
    return self.javaObject:getInternalText()
end
```

#### clear()
Clears all text.
```lua
function ISTextEntryBox:clear()
    self.javaObject:clearInput()
end
```

#### selectAll()
Selects all text.
```lua
function ISTextEntryBox:selectAll()
    self.javaObject:selectAll()
end
```

### Edit State Methods

#### setEditable(editable) / isEditable()
```lua
function ISTextEntryBox:setEditable(editable)
    self.javaObject:setEditable(editable)
    if editable then
        self.borderColor = {r=0.4, g=0.4, b=0.4, a=1}
    else
        self.borderColor = {r=0.4, g=0.4, b=0.4, a=0.5}
    end
end

function ISTextEntryBox:isEditable()
    return self.javaObject:isEditable()
end
```

#### setSelectable(enable) / isSelectable()
```lua
function ISTextEntryBox:setSelectable(enable)
    self.javaObject:setSelectable(enable)
end

function ISTextEntryBox:isSelectable()
    return self.javaObject:isSelectable()
end
```

### Focus Methods

#### focus() / unfocus() / isFocused()
```lua
function ISTextEntryBox:focus()
    return self.javaObject:focus()
end

function ISTextEntryBox:unfocus()
    return self.javaObject:unfocus()
end

function ISTextEntryBox:isFocused()
    return self.javaObject:isFocused()
end
```

### Multi-Line Support

#### setMultipleLine(multiple) / isMultipleLine()
```lua
function ISTextEntryBox:setMultipleLine(multiple)
    self.javaObject:setMultipleLine(multiple)
end

function ISTextEntryBox:isMultipleLine()
    return self.javaObject:isMultipleLine()
end
```

#### setMaxLines(max) / getMaxLines()
```lua
function ISTextEntryBox:setMaxLines(max)
    self.javaObject:setMaxLines(max)
end

function ISTextEntryBox:getMaxLines()
    return self.javaObject:getMaxLines()
end
```

### Input Constraints

#### setOnlyNumbers(onlyNumbers)
Restricts input to numeric characters.
```lua
function ISTextEntryBox:setOnlyNumbers(onlyNumbers)
    self.javaObject:setOnlyNumbers(onlyNumbers)
end
```

#### setMaxTextLength(length)
Limits maximum characters.
```lua
function ISTextEntryBox:setMaxTextLength(length)
    self.javaObject:setMaxTextLength(length)
end
```

#### setForceUpperCase(forceUpperCase)
Forces uppercase input.
```lua
function ISTextEntryBox:setForceUpperCase(forceUpperCase)
    self.javaObject:setForceUpperCase(forceUpperCase)
end
```

#### setMasked(b)
Masks input (password field).
```lua
function ISTextEntryBox:setMasked(b)
    return self.javaObject:setMasked(b)
end
```

### Cursor Control

```lua
function ISTextEntryBox:getCursorPos()
    return self.javaObject:getCursorPos()
end

function ISTextEntryBox:setCursorPos(charIndex)
    self.javaObject:setCursorPos(charIndex)
end
```

### Visual Options

#### setClearButton(hasButton)
Shows/hides clear button.
```lua
function ISTextEntryBox:setClearButton(hasButton)
    self.javaObject:setClearButton(hasButton)
end
```

#### setHasFrame(hasFrame)
```lua
function ISTextEntryBox:setHasFrame(hasFrame)
    self.javaObject:setHasFrame(hasFrame)
end
```

#### setFrameAlpha(alpha) / getFrameAlpha()
```lua
function ISTextEntryBox:setFrameAlpha(alpha)
    self.javaObject:setFrameAlpha(alpha)
end

function ISTextEntryBox:getFrameAlpha()
    return self.javaObject:getFrameAlpha()
end
```

#### setValid(valid)
Sets validation visual state.
```lua
function ISTextEntryBox:setValid(valid)
    if valid then
        self.borderColor = {r=0.4, g=0.4, b=0.4, a=1}
    else
        self.borderColor = {r=0.7, g=0.1, b=0.1, a=0.7}
    end
end
```

### Callback Hooks

Override these for custom behavior:

```lua
function ISTextEntryBox:onCommandEntered()
    -- Called when Enter pressed
end

function ISTextEntryBox:onTextChange()
    -- Called when text changes
end

function ISTextEntryBox:onPressDown()
    -- Called on down arrow
end

function ISTextEntryBox:onPressUp()
    -- Called on up arrow
end
```

### Joypad Support

```lua
function ISTextEntryBox:setJoypadFocused(focused, joypadData)
    self.joypadFocused = focused
    if focused then
        if self:isEditable() then
            self:focus()
        end
    elseif not joypadData or
           (joypadData.focus and joypadData.focus.Type ~= "ISOnScreenKeyboard") then
        self:unfocus()
    end
end

function ISTextEntryBox:onJoypadDown(button, joypadData)
    if button == Joypad.AButton then
        if not self:isEditable() then return end
        if OnScreenKeyboard.IsVisible() then return end
        local osk = OnScreenKeyboard.Show(joypadData.player, self, joypadData)
        osk.prevFocus = joypadData.focus
        joypadData.focus = osk
    end
end
```

---

## ISTickBox - Checkboxes

ISTickBox displays multiple checkboxes allowing multi-selection.

### Source Overview

```
File: lua/client/ISUI/ISTickBox.lua
Lines: 334
Inherits: ISPanel
```

### Constructor

```lua
function ISTickBox:new(x, y, width, height, name, changeOptionTarget, changeOptionMethod, changeOptionArg1, changeOptionArg2)
    local o = {}
    setmetatable(o, self)
    self.__index = self

    o.x = x
    o.y = y
    o.width = width
    o.height = height
    o.tickTexture = getTexture("Quest_Succeed")
    o.borderColor = {r=1, g=1, b=1, a=0.2}
    o.backgroundColor = {r=0, g=0, b=0, a=0.5}
    o.choicesColor = {r=0.7, g=0.7, b=0.7, a=1}
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false
    o.name = name
    o.options = {}
    o.optionCount = 1
    o.optionData = {}
    o.selected = {}
    o.leftMargin = 0
    o.boxSize = 16
    o.textGap = 4
    o.textures = {}
    o.font = UIFont.Small
    o.fontHgt = getTextManager():getFontHeight(o.font)
    o.itemGap = 4
    o.itemHgt = math.max(o.boxSize, o.fontHgt) + o.itemGap
    o.isTickBox = true
    o.tooltip = nil
    o.joypadIndex = 1
    o.changeOptionMethod = changeOptionMethod
    o.changeOptionTarget = changeOptionTarget
    o.changeOptionArgs = { changeOptionArg1, changeOptionArg2 }
    o.enable = true
    o.disabledOptions = {}
    o.optionsIndex = {}

    return o
end
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | (param) | Tickbox group name |
| `options` | table | `{}` | Option text array |
| `optionData` | table | `{}` | Custom data per option |
| `selected` | table | `{}` | Selection state per index |
| `disabledOptions` | table | `{}` | Disabled options by name |
| `onlyOnePossibility` | boolean | - | Single selection mode |
| `autoWidth` | boolean | - | Auto-resize to fit |
| `boxSize` | number | `16` | Checkbox size |
| `textGap` | number | `4` | Gap between box and text |
| `leftMargin` | number | `0` | Left padding |
| `itemGap` | number | `4` | Gap between items |
| `itemHgt` | number | (computed) | Height per item |
| `isTickBox` | boolean | `true` | Type identifier |

### Option Management

#### addOption(name, data, texture)
```lua
function ISTickBox:addOption(name, data, texture)
    table.insert(self.options, name)
    self.textures[self.optionCount] = texture
    self.optionData[self.optionCount] = data
    self.optionsIndex[self.optionCount] = name
    self.optionCount = self.optionCount + 1
    self:setHeight(#self.options * self.itemHgt)

    -- Auto-width if enabled
    if self.autoWidth then
        local w = self.leftMargin + self.boxSize + self.textGap +
            getTextManager():MeasureStringX(self.font, name)
        if texture then w = w + 32 end
        if w > self:getWidth() then
            self:setWidth(w)
        end
    end

    return self.optionCount - 1
end
```

#### clearOptions()
```lua
function ISTickBox:clearOptions()
    self.disabledOptions = {}
    self.selected = {}
    self.options = {}
    self.optionsIndex = {}
    self.textures = {}
    self.optionData = {}
    self.optionCount = 1
end
```

#### getOptionCount()
```lua
function ISTickBox:getOptionCount()
    return self.optionCount - 1
end
```

#### getOptionData(index)
```lua
function ISTickBox:getOptionData(index)
    if index < 1 or index > self:getOptionCount() then
        error "invalid index"
    end
    return self.optionData[index]
end
```

### Selection Methods

#### setSelected(index, selected)
```lua
function ISTickBox:setSelected(index, selected)
    local index = tonumber(index)
    if not index or index < 1 or index > #self.options then
        error "invalid index"
    end
    self.selected[index] = selected
end
```

#### isSelected(index)
```lua
function ISTickBox:isSelected(index)
    local index = tonumber(index)
    if not index or index < 1 or index > #self.options then
        error "invalid index"
    end
    return self.selected[index] == true
end
```

### Disabling Options

```lua
function ISTickBox:disableOption(name, disable)
    self.disabledOptions[name] = disable
end
```

### Visual Customization

#### setFont(font)
```lua
function ISTickBox:setFont(font)
    self.font = font
    self.fontHgt = getTextManager():getFontFromEnum(self.font):getLineHeight()
end
```

#### setWidthToFit()
```lua
function ISTickBox:setWidthToFit()
    local textX = self.leftMargin + self.boxSize + self.textGap
    local maxWid = 0
    for i, option in ipairs(self.options) do
        local wid = textX + getTextManager():MeasureStringX(self.font, option)
        if self.textures[i] then
            wid = wid + 32
        end
        maxWid = math.max(maxWid, wid)
    end
    self:setWidth(maxWid)
end
```

### Change Callback

Callback signature: `changeOptionMethod(target, index, selected, arg1, arg2, tickbox)`

```lua
function ISTickBox:onMouseUp(x, y)
    if self.enable and self.mouseOverOption ~= nil and
       self.mouseOverOption > 0 and self.mouseOverOption < self.optionCount then
        if self.disabledOptions[self.optionsIndex[self.mouseOverOption]] then
            return
        end
        getSoundManager():playUISound("UIToggleTickBox")

        -- Single selection mode
        if self.onlyOnePossibility then
            self.selected = {}
        end

        -- Toggle selection
        if self.selected[self.mouseOverOption] == nil then
            self.selected[self.mouseOverOption] = true
        else
            self.selected[self.mouseOverOption] = not self.selected[self.mouseOverOption]
        end

        -- Fire callback
        if self.changeOptionMethod ~= nil then
            self.changeOptionMethod(self.changeOptionTarget, self.mouseOverOption,
                self.selected[self.mouseOverOption],
                self.changeOptionArgs[1], self.changeOptionArgs[2], self)
        end
    end
    return false
end
```

### Joypad Support

```lua
function ISTickBox:setJoypadFocused(focused)
    self.joypadFocused = focused
end

function ISTickBox:onJoypadDirUp(joypadData)
    self.joypadIndex = self.joypadIndex - 1
    if self.joypadIndex < 1 then
        self.joypadIndex = #self.options
    end
end

function ISTickBox:onJoypadDirDown(joypadData)
    self.joypadIndex = self.joypadIndex + 1
    if self.joypadIndex > #self.options then
        self.joypadIndex = 1
    end
end

function ISTickBox:forceClick()
    if self.disabledOptions[self.optionsIndex[self.joypadIndex]] then return end
    if self.onlyOnePossibility then
        self.selected = {}
    end
    getSoundManager():playUISound("UIToggleTickBox")
    self.selected[self.joypadIndex] = not self.selected[self.joypadIndex]
    if self.changeOptionMethod ~= nil then
        self.changeOptionMethod(self.changeOptionTarget, self.joypadIndex,
            self.selected[self.joypadIndex],
            self.changeOptionArgs[1], self.changeOptionArgs[2], self)
    end
end
```

---

## ISRadioButtons - Radio Selection

ISRadioButtons displays mutually exclusive options where only one can be selected.

### Source Overview

```
File: lua/client/ISUI/ISRadioButtons.lua
Lines: 329
Inherits: ISPanel
```

### Constructor

```lua
function ISRadioButtons:new(x, y, width, height, target, changeOptionFunc, arg1, arg2, arg3, arg4)
    local o = ISPanel.new(self, x, y, width, height)
    o:noBackground()
    o.textureCircle = getTexture("media/ui/RadioButtonCircle.png")
    o.textureIndicator = getTexture("media/ui/RadioButtonIndicator.png")
    o.choicesColor = {r=0.7, g=0.7, b=0.7, a=1}
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false
    o.options = {}
    o.leftMargin = 0
    o.boxSize = 16
    o.textGap = 4
    o.textureSize = 20
    o.font = UIFont.Small
    o.fontHgt = getTextManager():getFontHeight(o.font)
    o.itemGap = 4
    o.itemHgt = math.max(o.boxSize, o.fontHgt) + o.itemGap
    o.isRadioButtons = true
    o.tooltip = nil
    o.joypadIndex = 1
    o.changeOptionFunc = changeOptionFunc
    o.changeOptionTarget = target
    o.changeOptionArgs = { arg1, arg2, arg3, arg4 }
    o.enable = true
    o.autoWidth = false
    o.selected = -1
    o.mouseOverIndex = -1
    return o
end
```

### Option Structure

Each option is a table:
```lua
{
    text = "Option Name",
    data = anyValue,        -- Custom data
    texture = Texture,      -- Optional icon
    enabled = true          -- Can be selected
}
```

### Option Management

#### addOption(text, data, texture, enabled)
```lua
function ISRadioButtons:addOption(text, data, texture, enabled)
    local option = {}
    option.text = text
    option.data = data
    option.texture = texture
    if enabled ~= nil then
        option.enabled = enabled
    else
        option.enabled = true
    end
    table.insert(self.options, option)

    if texture then
        self.itemHgt = math.max(self.boxSize, self.fontHgt, self.textureSize) + self.itemGap
    end
    self:setHeight(#self.options * self.itemHgt)

    if self.autoWidth then
        local w = self.leftMargin + self.boxSize + self.textGap +
            getTextManager():MeasureStringX(self.font, text)
        if texture then w = w + 32 end
        if w > self:getWidth() then
            self:setWidth(w)
        end
    end

    if self.selected == -1 then
        self.selected = 1
    end

    return #self.options
end
```

#### clear()
```lua
function ISRadioButtons:clear()
    table.wipe(self.options)
    self.selected = -1
    self.mouseOverIndex = -1
    self.joypadIndex = 1
    self:setHeight(0)
end
```

#### isEmpty() / getNumOptions()
```lua
function ISRadioButtons:isEmpty()
    return #self.options == 0
end

function ISRadioButtons:getNumOptions()
    return #self.options
end
```

### Option Accessors

```lua
function ISRadioButtons:setOptionText(index, text)
    index = self:checkIndex(index)
    self.options[index].text = text
end

function ISRadioButtons:getOptionText(index)
    index = self:checkIndex(index)
    return self.options[index].text
end

function ISRadioButtons:setOptionData(index, data)
    index = self:checkIndex(index)
    self.options[index].data = data
end

function ISRadioButtons:getOptionData(index)
    index = self:checkIndex(index)
    return self.options[index].data
end

function ISRadioButtons:setOptionTexture(index, texture)
    index = self:checkIndex(index)
    self.options[index].texture = texture
end

function ISRadioButtons:setOptionEnabled(index, enabled)
    index = self:checkIndex(index)
    self.options[index].enabled = enabled
end

function ISRadioButtons:isOptionEnabled(index)
    index = self:checkIndex(index)
    return self.options[index].enabled
end
```

### Selection Methods

```lua
function ISRadioButtons:setSelected(index)
    index = self:checkIndex(index)
    self.selected = index
end

function ISRadioButtons:isSelected(index)
    index = self:checkIndex(index)
    return self.selected == index
end
```

### Change Callback

Callback: `changeOptionFunc(target, radiobuttons, selectedIndex, arg1, arg2, arg3, arg4)`

Or without target: `changeOptionFunc(radiobuttons, selectedIndex, arg1, arg2, arg3, arg4)`

```lua
function ISRadioButtons:onMouseUp(x, y)
    if self.enable and (self.mouseOverIndex >= 1) and
       (self.mouseOverIndex <= #self.options) then
        if not self.options[self.mouseOverIndex].enabled then
            return false
        end
        if self.selected == self.mouseOverIndex then
            return false
        end
        self.selected = self.mouseOverIndex

        if self.changeOptionFunc ~= nil and self.changeOptionTarget ~= nil then
            self.changeOptionFunc(self.changeOptionTarget, self, self.selected,
                self.changeOptionArgs[1], self.changeOptionArgs[2],
                self.changeOptionArgs[3], self.changeOptionArgs[4])
        elseif self.changeOptionFunc ~= nil then
            self.changeOptionFunc(self, self.selected,
                self.changeOptionArgs[1], self.changeOptionArgs[2],
                self.changeOptionArgs[3], self.changeOptionArgs[4])
        end
    end
    return false
end
```

---

## ISSliderPanel - Value Slider

ISSliderPanel provides a numeric slider with optional increment/decrement buttons.

### Source Overview

```
File: lua/client/RadioCom/ISUIRadio/ISSliderPanel.lua
Lines: 249
Inherits: ISPanel
```

### Constructor

```lua
function ISSliderPanel:new(x, y, width, height, target, onValueChange, customPaginate)
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self

    o.x = x
    o.y = y
    o.background = false
    o.backgroundColor = {r=0, g=0, b=0, a=0.0}
    o.borderColor = {r=0.4, g=0.4, b=0.4, a=1}
    o.width = width
    o.height = height
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false
    o.target = target
    o.onValueChange = onValueChange
    o.customPaginate = customPaginate
    o.texBtnLeft = getTexture("media/ui/ArrowLeft.png")
    o.texBtnRight = getTexture("media/ui/ArrowRight.png")

    o.currentValue = 50
    o.minValue = 0
    o.maxValue = 100
    o.stepValue = 1
    o.shiftValue = 10
    o.doButtons = true

    o.buttonColor = {r=0.6, g=0.6, b=0.6, a=1.0}
    o.buttonMouseOverColor = {r=1.0, g=1.0, b=1.0, a=1.0}
    o.sliderColor = {r=0.6, g=0.6, b=0.6, a=1.0}
    o.sliderMouseOverColor = {r=1.0, g=1.0, b=1.0, a=1.0}
    o.sliderBorderColor = {r=1.0, g=1.0, b=1.0, a=1}
    o.sliderBarColor = {r=0.2, g=0.2, b=0.2, a=1.0}
    o.sliderBarBorderColor = {r=0.4, g=0.4, b=0.4, a=1}

    o.dragInside = false
    o.doToolTip = true
    o.toolTipText = getText("UI_Radio_IncreaseStepSize")
    o.isSliderPanel = true

    return o
end
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `currentValue` | number | `50` | Current slider value |
| `minValue` | number | `0` | Minimum value |
| `maxValue` | number | `100` | Maximum value |
| `stepValue` | number | `1` | Normal increment |
| `shiftValue` | number | `10` | Shift+click increment |
| `doButtons` | boolean | `true` | Show +/- buttons |
| `doToolTip` | boolean | `true` | Show tooltip hint |
| `isSliderPanel` | boolean | `true` | Type identifier |

### Value Methods

#### setCurrentValue(value, ignoreOnChange)
```lua
function ISSliderPanel:setCurrentValue(_v, _ignoreOnChange)
    local stepmod = 1 / self.stepValue
    _v = self:round(_v * stepmod, 0) / stepmod
    if _v < self.minValue then _v = self.minValue end
    if _v > self.maxValue then _v = self.maxValue end
    self.currentValue = _v
    if not _ignoreOnChange then
        self:doOnValueChange(_v)
    end
end
```

#### getCurrentValue()
```lua
function ISSliderPanel:getCurrentValue()
    return self.currentValue
end
```

#### setValues(min, max, step, shift, ignoreCurVal)
Sets all range parameters at once.
```lua
function ISSliderPanel:setValues(_min, _max, _step, _shift, _ignoreCurVal)
    self.minValue = _min
    self.maxValue = _max
    self.stepValue = _step
    self.shiftValue = _shift
    if not _ignoreCurVal then
        self:setCurrentValue(self.currentValue)
    end
end
```

### Change Callback

Callback: `onValueChange(target, newValue, slider)`

```lua
function ISSliderPanel:doOnValueChange(_newvalue)
    if self.target and self.onValueChange then
        self.onValueChange(self.target, _newvalue, self)
    end
end
```

### Button Control

```lua
function ISSliderPanel:setDoButtons(_b)
    self.doButtons = _b
    self:paginate()
end
```

---

## ISVolumeControl - Volume Slider

ISVolumeControl is a specialized 0-10 volume slider with visual segments.

### Source Overview

```
File: lua/client/ISUI/ISVolumeControl.lua
Lines: 145
Inherits: ISPanel
```

### Constructor

```lua
function ISVolumeControl:new(x, y, width, height, target, targetFunc)
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.backgroundColor = {r=0, g=0, b=0, a=1}
    o.borderColor = {r=1, g=1, b=1, a=0.5}
    o.volume = 0
    o.target = target
    o.targetFunc = targetFunc
    o.fade = UITransition.new()
    o.isSlider = true
    return o
end
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `volume` | number | `0` | Current volume (0-10) |
| `target` | table | (param) | Callback target |
| `targetFunc` | function | (param) | Value change callback |
| `isSlider` | boolean | `true` | Type identifier |
| `tooltip` | string | nil | Hover tooltip |

### Volume Methods

#### getVolume() / setVolume(volume)
```lua
function ISVolumeControl:getVolume()
    return self.volume
end

function ISVolumeControl:setVolume(volume)
    if volume >= 0 and volume <= 10 and volume ~= self.volume then
        self.volume = volume
        if self.targetFunc then
            self.targetFunc(self.target, self, self.volume)
        end
    end
end
```

### Joypad Support

```lua
function ISVolumeControl:setJoypadFocused(focused)
    self.joypadFocused = focused
end

function ISVolumeControl:onJoypadDirLeft(joypadData)
    self:setVolume(self.volume - 1)
end

function ISVolumeControl:onJoypadDirRight(joypadData)
    self:setVolume(self.volume + 1)
end
```

---

## Common Patterns

### Input Validation Pattern

```lua
local textEntry = ISTextEntryBox:new("", 10, 10, 200, 25)
textEntry:initialise()
textEntry:instantiate()
textEntry:setOnlyNumbers(true)
textEntry:setMaxTextLength(5)

function textEntry:onTextChange()
    local value = tonumber(self:getText())
    if value and value >= 0 and value <= 100 then
        self:setValid(true)
    else
        self:setValid(false)
    end
end
```

### Button with Tooltip Pattern

```lua
local button = ISButton:new(10, 10, 100, 25, "Action", self, self.onAction)
button:initialise()
button:setTooltip("Click to perform action.\nHold Shift for alternate.")
button:setImage(getTexture("media/ui/myicon.png"))
self:addChild(button)
```

### Checkbox Group Pattern

```lua
local tickbox = ISTickBox:new(10, 10, 200, 100, "Options",
    self, self.onOptionChanged)
tickbox:initialise()
tickbox.autoWidth = true
tickbox:addOption("Enable Feature A", "featureA")
tickbox:addOption("Enable Feature B", "featureB")
tickbox:addOption("Enable Feature C", "featureC")
tickbox:setSelected(1, true)  -- Pre-select first
self:addChild(tickbox)

function MyPanel:onOptionChanged(index, selected, arg1, arg2, tickbox)
    local data = tickbox:getOptionData(index)
    print("Option " .. data .. " is now " .. tostring(selected))
end
```

### Radio Selection Pattern

```lua
local radio = ISRadioButtons:new(10, 10, 200, 80, self, self.onModeSelected)
radio:initialise()
radio.autoWidth = true
radio:addOption("Mode A", "modeA")
radio:addOption("Mode B", "modeB")
radio:addOption("Mode C", "modeC", nil, false)  -- Disabled
self:addChild(radio)

function MyPanel:onModeSelected(radioButtons, selectedIndex)
    local data = radioButtons:getOptionData(selectedIndex)
    print("Selected mode: " .. data)
end
```

### Slider with Display Pattern

```lua
local slider = ISSliderPanel:new(10, 50, 200, 20, self, self.onVolumeChanged)
slider:initialise()
slider:setValues(0, 100, 1, 10)
slider:setCurrentValue(50, true)
self:addChild(slider)

self.valueLabel = ISLabel:new(220, 50, 20, "50%", 1, 1, 1, 1, UIFont.Small, true)
self.valueLabel:initialise()
self:addChild(self.valueLabel)

function MyPanel:onVolumeChanged(newValue, sliderPanel)
    self.valueLabel:setName(tostring(math.floor(newValue)) .. "%")
end
```

---

## Complete Method Reference

### ISButton Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x,y,w,h,title,target,onclick,...` | ISButton | Create button |
| `setTitle` | `title` | - | Set text |
| `getTitle` | - | string | Get text |
| `setImage` | `texture` | - | Set icon |
| `forceImageSize` | `w, h` | - | Force icon size |
| `setOverlayText` | `text` | - | Set overlay text |
| `setEnable` | `bool` | - | Enable/disable |
| `isEnabled` | - | boolean | Check enabled |
| `forceClick` | - | - | Trigger click |
| `setOnClick` | `func, arg1-4` | - | Set click handler |
| `setRepeatWhilePressed` | `func` | - | Set hold handler |
| `setTooltip` | `text` | - | Set tooltip |
| `setFont` | `font` | - | Set font |
| `setWidthToTitle` | `minW, isJoypad` | - | Fit to text |
| `setDisplayBackground` | `bool` | - | Show background |
| `setBackgroundRGBA` | `r,g,b,a` | - | Set bg color |
| `setBackgroundColorMouseOverRGBA` | `r,g,b,a` | - | Set hover color |
| `setBorderRGBA` | `r,g,b,a` | - | Set border color |
| `setTextureRGBA` | `r,g,b,a` | - | Set icon tint |
| `setJoypadButton` | `texture` | - | Set joypad icon |
| `clearJoypadButton` | - | - | Remove joypad icon |
| `setJoypadFocused` | `bool` | - | Set focus state |
| `setOnMouseOverFunction` | `func` | - | Set hover callback |
| `setOnMouseOutFunction` | `func` | - | Set leave callback |
| `setSound` | `which, name` | - | Set sound |

### ISTextEntryBox Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `title,x,y,w,h` | ISTextEntryBox | Create |
| `getText` | - | string | Get text |
| `setText` | `str` | - | Set text |
| `getInternalText` | - | string | Get raw text |
| `clear` | - | - | Clear text |
| `selectAll` | - | - | Select all |
| `focus` | - | - | Focus field |
| `unfocus` | - | - | Unfocus |
| `isFocused` | - | boolean | Check focused |
| `setEditable` | `bool` | - | Set editable |
| `isEditable` | - | boolean | Check editable |
| `setSelectable` | `bool` | - | Set selectable |
| `isSelectable` | - | boolean | Check selectable |
| `setMultipleLine` | `bool` | - | Multi-line mode |
| `isMultipleLine` | - | boolean | Check multi-line |
| `setMaxLines` | `num` | - | Set max lines |
| `getMaxLines` | - | number | Get max lines |
| `setOnlyNumbers` | `bool` | - | Numbers only |
| `setMaxTextLength` | `len` | - | Max characters |
| `setForceUpperCase` | `bool` | - | Force uppercase |
| `setMasked` | `bool` | - | Password mode |
| `getCursorPos` | - | number | Get cursor |
| `setCursorPos` | `index` | - | Set cursor |
| `setClearButton` | `bool` | - | Show clear btn |
| `setHasFrame` | `bool` | - | Show frame |
| `setFrameAlpha` | `alpha` | - | Frame opacity |
| `setValid` | `bool` | - | Validation visual |
| `setTooltip` | `text` | - | Set tooltip |
| `ignoreFirstInput` | - | - | Skip first key |

### ISTickBox Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x,y,w,h,name,target,method,...` | ISTickBox | Create |
| `addOption` | `name, data, texture` | number | Add option |
| `clearOptions` | - | - | Remove all |
| `getOptionCount` | - | number | Count options |
| `getOptionData` | `index` | any | Get data |
| `setSelected` | `index, selected` | - | Set selection |
| `isSelected` | `index` | boolean | Check selected |
| `disableOption` | `name, disable` | - | Disable option |
| `setFont` | `font` | - | Set font |
| `setWidthToFit` | - | - | Fit to content |
| `setJoypadFocused` | `bool` | - | Set focus |
| `forceClick` | - | - | Trigger click |

### ISRadioButtons Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x,y,w,h,target,func,...` | ISRadioButtons | Create |
| `addOption` | `text,data,tex,enabled` | number | Add option |
| `clear` | - | - | Remove all |
| `isEmpty` | - | boolean | Check empty |
| `getNumOptions` | - | number | Count options |
| `setOptionText` | `index, text` | - | Set text |
| `getOptionText` | `index` | string | Get text |
| `setOptionData` | `index, data` | - | Set data |
| `getOptionData` | `index` | any | Get data |
| `setOptionTexture` | `index, tex` | - | Set texture |
| `setOptionEnabled` | `index, bool` | - | Enable/disable |
| `isOptionEnabled` | `index` | boolean | Check enabled |
| `setSelected` | `index` | - | Select option |
| `isSelected` | `index` | boolean | Check selected |
| `setFont` | `font` | - | Set font |
| `setWidthToFit` | - | - | Fit to content |
| `setJoypadFocused` | `bool` | - | Set focus |
| `forceClick` | - | - | Trigger click |

### ISSliderPanel Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x,y,w,h,target,onChange,paginate` | ISSliderPanel | Create |
| `setCurrentValue` | `value, ignoreCallback` | - | Set value |
| `getCurrentValue` | - | number | Get value |
| `setValues` | `min,max,step,shift,ignore` | - | Set range |
| `setDoButtons` | `bool` | - | Show buttons |
| `paginate` | - | - | Recalculate layout |

### ISVolumeControl Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x,y,w,h,target,func` | ISVolumeControl | Create |
| `getVolume` | - | number | Get volume (0-10) |
| `setVolume` | `volume` | - | Set volume |
| `setJoypadFocused` | `bool` | - | Set focus |

---

## Modding Examples

### Example 1: Complete Settings Form

```lua
require "ISUI/ISPanelJoypad"
require "ISUI/ISButton"
require "ISUI/ISTextEntryBox"
require "ISUI/ISTickBox"
require "ISUI/ISRadioButtons"

MySettingsForm = ISPanelJoypad:derive("MySettingsForm")

function MySettingsForm:new(x, y)
    local width = 400
    local height = 350
    local o = ISPanelJoypad:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.backgroundColor = {r=0.1, g=0.1, b=0.1, a=0.95}
    o.borderColor = {r=0.5, g=0.5, b=0.5, a=1}
    return o
end

function MySettingsForm:createChildren()
    ISPanelJoypad.createChildren(self)

    local y = 20
    local labelX = 20
    local inputX = 150
    local inputW = 200

    -- Player Name (text entry)
    local nameLabel = ISLabel:new(labelX, y, 25, "Player Name:", 1, 1, 1, 1, UIFont.Small, true)
    nameLabel:initialise()
    self:addChild(nameLabel)

    self.nameEntry = ISTextEntryBox:new("Player", inputX, y, inputW, 25)
    self.nameEntry:initialise()
    self.nameEntry:instantiate()
    self.nameEntry:setMaxTextLength(20)
    self:addChild(self.nameEntry)

    self:insertNewLineOfButtons(self.nameEntry)
    y = y + 35

    -- Difficulty (radio buttons)
    local diffLabel = ISLabel:new(labelX, y, 25, "Difficulty:", 1, 1, 1, 1, UIFont.Small, true)
    diffLabel:initialise()
    self:addChild(diffLabel)

    self.diffRadio = ISRadioButtons:new(inputX, y, inputW, 80, self, self.onDifficultyChanged)
    self.diffRadio:initialise()
    self.diffRadio:addOption("Easy", 1)
    self.diffRadio:addOption("Normal", 2)
    self.diffRadio:addOption("Hard", 3)
    self.diffRadio:setSelected(2)
    self:addChild(self.diffRadio)

    self:insertNewLineOfButtons(self.diffRadio)
    y = y + 90

    -- Options (tick boxes)
    local optLabel = ISLabel:new(labelX, y, 25, "Options:", 1, 1, 1, 1, UIFont.Small, true)
    optLabel:initialise()
    self:addChild(optLabel)

    self.optionsTick = ISTickBox:new(inputX, y, inputW, 60, "options", self, self.onOptionChanged)
    self.optionsTick:initialise()
    self.optionsTick:addOption("Enable Sound", "sound")
    self.optionsTick:addOption("Show Hints", "hints")
    self.optionsTick:setSelected(1, true)
    self.optionsTick:setSelected(2, true)
    self:addChild(self.optionsTick)

    self:insertNewLineOfButtons(self.optionsTick)
    y = y + 70

    -- Volume slider
    local volLabel = ISLabel:new(labelX, y, 25, "Volume:", 1, 1, 1, 1, UIFont.Small, true)
    volLabel:initialise()
    self:addChild(volLabel)

    self.volumeSlider = ISVolumeControl:new(inputX, y, inputW, 25, self, self.onVolumeChanged)
    self.volumeSlider:initialise()
    self.volumeSlider:setVolume(5)
    self:addChild(self.volumeSlider)

    self:insertNewLineOfButtons(self.volumeSlider)
    y = y + 40

    -- Buttons
    self.saveBtn = ISButton:new(self.width - 200, y, 80, 25, "Save", self, self.onSave)
    self.saveBtn:initialise()
    self:addChild(self.saveBtn)

    self.cancelBtn = ISButton:new(self.width - 100, y, 80, 25, "Cancel", self, self.onCancel)
    self.cancelBtn:initialise()
    self:addChild(self.cancelBtn)

    self:insertNewLineOfButtons(self.saveBtn, self.cancelBtn)
    self:setISButtonForA(self.saveBtn)
    self:setISButtonForB(self.cancelBtn)
end

function MySettingsForm:onDifficultyChanged(radio, index)
    print("Difficulty: " .. radio:getOptionData(index))
end

function MySettingsForm:onOptionChanged(index, selected)
    local data = self.optionsTick:getOptionData(index)
    print("Option " .. data .. " = " .. tostring(selected))
end

function MySettingsForm:onVolumeChanged(control, volume)
    print("Volume: " .. volume)
end

function MySettingsForm:onSave()
    local settings = {
        name = self.nameEntry:getText(),
        difficulty = self.diffRadio:getOptionData(self.diffRadio.selected),
        sound = self.optionsTick:isSelected(1),
        hints = self.optionsTick:isSelected(2),
        volume = self.volumeSlider:getVolume()
    }
    print("Saving: " .. tostring(settings.name))
    self:close()
end

function MySettingsForm:onCancel()
    self:close()
end

function MySettingsForm:close()
    self:setVisible(false)
    self:removeFromUIManager()
end
```

### Example 2: Dynamic Button Grid

```lua
function createButtonGrid(options, columns, callback)
    local btnW = 100
    local btnH = 30
    local gap = 5
    local rows = math.ceil(#options / columns)

    local panel = ISPanel:new(0, 0,
        columns * (btnW + gap) + gap,
        rows * (btnH + gap) + gap)
    panel:initialise()
    panel.buttons = {}

    for i, opt in ipairs(options) do
        local col = (i - 1) % columns
        local row = math.floor((i - 1) / columns)
        local x = gap + col * (btnW + gap)
        local y = gap + row * (btnH + gap)

        local btn = ISButton:new(x, y, btnW, btnH, opt.text, panel,
            function(self, button)
                callback(opt.data)
            end)
        btn:initialise()
        if opt.tooltip then
            btn:setTooltip(opt.tooltip)
        end
        if opt.icon then
            btn:setImage(getTexture(opt.icon))
        end
        panel:addChild(btn)
        panel.buttons[i] = btn
    end

    return panel
end

-- Usage
local grid = createButtonGrid({
    {text = "Option 1", data = 1, tooltip = "First option"},
    {text = "Option 2", data = 2, tooltip = "Second option"},
    {text = "Option 3", data = 3, tooltip = "Third option"},
    {text = "Option 4", data = 4, tooltip = "Fourth option"},
}, 2, function(data)
    print("Selected: " .. data)
end)
```

---

## Summary

User input components provide the interactive building blocks for PZ UIs:

| Component | Best For |
|-----------|----------|
| **ISButton** | Actions, navigation, toggles |
| **ISTextEntryBox** | Text input, names, numbers |
| **ISTickBox** | Multiple toggleable options |
| **ISRadioButtons** | Mutually exclusive choices |
| **ISSliderPanel** | Numeric ranges with precision |
| **ISVolumeControl** | Simple 0-10 values |

Key patterns:
1. Always `initialise()` after `new()`
2. Use `instantiate()` for text entry boxes
3. Set callbacks in constructor or with setter methods
4. Handle joypad focus for controller support
5. Use `forceClick()` for programmatic activation
