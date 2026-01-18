# ISUI Display Components

## Overview

Display components in Project Zomboid's ISUI framework handle non-interactive visual elements like labels, images, tooltips, and progress indicators.

**Components Covered:**
- **ISLabel** - Text display with alignment options
- **ISToolTip** - Contextual tooltip with rich text
- **ISImage** - Image display with scaling
- **ISGradientBar** - Gradient progress bar with knob
- **ISLcdBar** - LCD-style scrolling text display
- **ISRichTextPanel** - Formatted text display (covered in Dialogs doc)

---

## Inheritance Hierarchy

```
ISBaseObject
└── ISUIElement
    ├── ISLabel
    └── ISPanel
        ├── ISToolTip
        ├── ISImage
        ├── ISGradientBar
        └── ISLcdBar
```

---

## ISLabel

A simple text display component supporting alignment, tooltips, and font configuration.

**Source:** `media/lua/client/ISUI/ISLabel.lua` (169 lines)

### Constructor

```lua
ISLabel:new(x, y, height, name, r, g, b, a, font, bLeft)
```

| Parameter | Description |
|-----------|-------------|
| `x, y` | Position |
| `height` | Label height |
| `name` | Text to display |
| `r, g, b, a` | Text color (0-1 values) |
| `font` | UIFont enum (default: `UIFont.Small`) |
| `bLeft` | If true, align left from x; if false, align right to x |

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `name` | (required) | Text to display |
| `font` | `UIFont.Small` | Font to use |
| `r, g, b, a` | (from constructor) | Text color |
| `left` | `false` | Left alignment mode |
| `center` | `false` | Center alignment mode |
| `originalX` | (from constructor) | Original X position |
| `tooltip` | `nil` | Tooltip text on hover |
| `translation` | `nil` | Translated text override |
| `joypadFocused` | `false` | Joypad focus state |
| `joypadTexture` | `nil` | Joypad button indicator |

### Methods

| Method | Description |
|--------|-------------|
| `getName()` | Get current text |
| `setName(name)` | Set text (recalculates width) |
| `setWidthToName(minWidth)` | Resize width to fit text |
| `setColor(r, g, b)` | Set text color |
| `setTooltip(tooltip)` | Set hover tooltip |
| `setTranslation(text)` | Set translated text |
| `setJoypadFocused(focused)` | Set joypad focus |

### Alignment Behavior

```lua
-- Left-aligned (text starts at x)
local labelLeft = ISLabel:new(100, 50, 20, "Left Text", 1, 1, 1, 1, UIFont.Small, true)

-- Right-aligned (text ends at x)
local labelRight = ISLabel:new(100, 50, 20, "Right Text", 1, 1, 1, 1, UIFont.Small, false)

-- Center-aligned
local labelCenter = ISLabel:new(200, 50, 20, "Centered", 1, 1, 1, 1, UIFont.Small, true)
labelCenter.center = true
```

### Usage Example

```lua
-- Create a label
local label = ISLabel:new(10, 10, 20, "Player Health:", 1, 1, 1, 1, UIFont.Medium, true)
label:initialise()
label:setTooltip("Current health points")
parentPanel:addChild(label)

-- Update text
label:setName("Player Health: 85%")
```

---

## ISToolTip

A floating tooltip panel with rich text support, automatic positioning, and optional title/texture.

**Source:** `media/lua/client/ISUI/ISToolTip.lua` (372 lines)

### Constructor

```lua
ISToolTip:new()
```

No parameters - tooltip is configured via properties and methods.

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `name` | `nil` | Title text |
| `description` | `""` | Body text (supports rich text) |
| `texture` | `nil` | Optional icon texture |
| `footNote` | `nil` | Footer text |
| `maxLineWidth` | `nil` | Max line width for wrapping |
| `owner` | `nil` | Owning UI element |
| `contextMenu` | `nil` | Associated context menu |
| `followMouse` | `true` | Follow mouse position |
| `desiredX, desiredY` | `nil` | Fixed position override |

### Methods

| Method | Description |
|--------|-------------|
| `setName(name)` | Set title text |
| `setTexture(textureName)` | Set icon from path |
| `setOwner(ui)` | Set owning element |
| `setContextMenu(menu)` | Associate with context menu |
| `setDesiredPosition(x, y)` | Set fixed position |
| `reset()` | Clear all content |
| `doLayout()` | Calculate size from content |

### Static Methods

| Method | Description |
|--------|-------------|
| `ISToolTip.GetFont()` | Get tooltip font from settings |

### Automatic Positioning

The tooltip automatically avoids overlapping with:
- The owner element
- Context menu options
- Screen edges

```lua
function ISToolTip:adjustPositionToAvoidOverlap(avoidRect)
    -- Tries: right, left, above
    -- Clamps to screen bounds
end
```

### Rich Text Support

The description field uses ISRichTextPanel internally, supporting formatting codes:

```lua
tooltip.description = "<RGB:1,0,0> Warning! <RGB:0.7,0.7,0.7> This action is dangerous."
```

### Usage Example

```lua
-- Create tooltip (typically cached and reused)
local tooltip = ISToolTip:new()
tooltip:initialise()
tooltip:instantiate()

-- Configure
tooltip:setName("Iron Axe")
tooltip.description = "A sturdy axe for chopping trees.\n<RGB:0.5,1,0.5>+15 Damage"
tooltip:setTexture("media/textures/Item_Axe.png")
tooltip.footNote = "Right-click to use"

-- Show
tooltip:setOwner(myButton)
tooltip:addToUIManager()
tooltip:setVisible(true)

-- Hide
tooltip:setVisible(false)
tooltip:removeFromUIManager()
```

### Integration Pattern

Most UI components use this pattern for tooltips:

```lua
function MyComponent:updateTooltip()
    if self:isMouseOver() and self.tooltip then
        if not self.tooltipUI then
            self.tooltipUI = ISToolTip:new()
            self.tooltipUI:setOwner(self)
            self.tooltipUI:setVisible(false)
            self.tooltipUI:setAlwaysOnTop(true)
        end
        if not self.tooltipUI:getIsVisible() then
            self.tooltipUI:addToUIManager()
            self.tooltipUI:setVisible(true)
        end
        self.tooltipUI.description = self.tooltip
        self.tooltipUI:setX(self:getAbsoluteX())
        self.tooltipUI:setY(self:getAbsoluteY() + self:getHeight())
    else
        if self.tooltipUI and self.tooltipUI:getIsVisible() then
            self.tooltipUI:setVisible(false)
            self.tooltipUI:removeFromUIManager()
        end
    end
end
```

---

## ISImage

An image display component with optional scaling, click handling, and tooltip support.

**Source:** `media/lua/client/ISUI/ISImage.lua` (121 lines)

### Constructor

```lua
ISImage:new(x, y, width, height, texture)
```

| Parameter | Description |
|-----------|-------------|
| `x, y` | Position |
| `width, height` | Display dimensions |
| `texture` | Texture object to display |

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `texture` | (from constructor) | Main texture |
| `textureOverride` | `nil` | Overlay texture (centered) |
| `backgroundColor` | `{r=1, g=1, b=1, a=1}` | Tint color |
| `scaledWidth` | `nil` | Override width for scaling |
| `scaledHeight` | `nil` | Override height for scaling |
| `mouseovertext` | `nil` | Tooltip text |
| `name` | `nil` | Text drawn below image |
| `font` | `UIFont.Small` | Font for name text |
| `onclick` | `nil` | Click callback |
| `target` | `nil` | Callback target |

### Methods

| Method | Description |
|--------|-------------|
| `getTexture()` | Get current texture |
| `setMouseOverText(text)` | Set hover tooltip |
| `setColor(r, g, b)` | Set tint color |

### Click Handling

```lua
image.target = self
image.onclick = function(target, image)
    print("Image clicked!")
end
```

### Usage Example

```lua
-- Basic image
local icon = ISImage:new(10, 10, 32, 32, getTexture("media/ui/myicon.png"))
icon:initialise()
icon:setMouseOverText("My Icon Tooltip")
parentPanel:addChild(icon)

-- Scaled image
local bigIcon = ISImage:new(10, 50, 64, 64, getTexture("media/ui/myicon.png"))
bigIcon.scaledWidth = 64
bigIcon.scaledHeight = 64
bigIcon:initialise()
parentPanel:addChild(bigIcon)

-- Tinted image
local redIcon = ISImage:new(10, 120, 32, 32, getTexture("media/ui/myicon.png"))
redIcon:setColor(1, 0.5, 0.5)  -- Red tint
redIcon:initialise()
parentPanel:addChild(redIcon)

-- Clickable image
local button = ISImage:new(10, 160, 32, 32, getTexture("media/ui/button.png"))
button.target = self
button.onclick = self.onImageClick
button:initialise()
parentPanel:addChild(button)
```

### Overlay Pattern

```lua
-- Base image with status overlay
local itemIcon = ISImage:new(10, 10, 48, 48, getTexture("media/textures/Item_Base.png"))
itemIcon.textureOverride = getTexture("media/ui/status_damaged.png")  -- Centered overlay
```

---

## ISGradientBar

A progress bar with gradient background, highlight position indicator, and optional knob.

**Source:** `media/lua/client/ISUI/ISGradientBar.lua` (129 lines)

### Constructor

```lua
ISGradientBar:new(x, y, width, height)
```

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `value` | `0` | Current value (0-1) |
| `gradientTex` | heatbar texture | Background gradient |
| `highlightTex` | highlight texture | Position highlight |
| `settings.radius` | `3` | Highlight radius |
| `settings.darkAlpha` | `0.70` | Darkness overlay alpha |
| `settings.doKnob` | `true` | Show position knob |
| `settings.colBorder` | gray | Outer border color |
| `settings.colBorderInner` | dark gray | Inner border color |

### Methods

| Method | Description |
|--------|-------------|
| `setValue(value)` | Set progress (0-1, clamped) |
| `setGradientTexture(tex)` | Set background texture |
| `setHighlightRadius(radius)` | Set highlight size |
| `setDarkAlpha(alpha)` | Set darkness overlay |
| `setDoKnob(bool)` | Show/hide knob |
| `setBorderColor(a, r, g, b)` | Set outer border |
| `setBorderInnerColor(a, r, g, b)` | Set inner border |

### Usage Example

```lua
-- Temperature indicator
local tempBar = ISGradientBar:new(10, 10, 200, 16)
tempBar:initialise()
tempBar:setValue(0.75)  -- 75% position
tempBar:setDoKnob(true)
parentPanel:addChild(tempBar)

-- Update dynamically
function MyPanel:updateTemperature(temp)
    -- Convert temperature to 0-1 range
    local normalized = (temp - minTemp) / (maxTemp - minTemp)
    self.tempBar:setValue(normalized)
end
```

### Custom Gradient

```lua
-- Custom gradient texture
local healthBar = ISGradientBar:new(10, 30, 200, 12)
healthBar:setGradientTexture(getTexture("media/ui/health_gradient.png"))
healthBar:setDoKnob(false)  -- No knob, just fill
healthBar:setDarkAlpha(0.8)  -- More contrast
healthBar:initialise()
```

---

## ISLcdBar

An LCD-style text display with character-by-character rendering and scrolling animation.

**Source:** `media/lua/client/ISUI/ISLcdBar.lua` (200 lines)

### Constructor

```lua
ISLcdBar:new(x, y, charWidth)
```

| Parameter | Description |
|-----------|-------------|
| `x, y` | Position |
| `charWidth` | Number of characters to display |

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `lcdwidth` | (from constructor) | Visible character count |
| `text` | `nil` | Text to display |
| `isOn` | `true` | Display powered on |
| `doScroll` | `false` | Enable scrolling animation |
| `pos` | `0` | Current scroll position |
| `ledColor` | `{r=1, g=1, b=1, a=1}` | Background LED color |
| `ledTextColor` | `{r=0, g=0, b=0, a=1}` | Text color |
| `lcdfont` | LCD font texture | Character atlas |
| `lcdback` | LCD background | Background texture |
| `textMode` | `false` | True for unsupported languages |

### Character Set

Supported characters (ISLcdBar.indexes):
```
 !"#$%&'()*+,-./0123456789:;<=>?@abcdefghijklmnopqrstuvwxyz[\]^_
```

### Methods

| Method | Description |
|--------|-------------|
| `setText(text)` | Set display text |
| `toggleOn(bool)` | Turn display on/off |
| `setDoScroll(bool)` | Enable/disable scrolling |
| `setTextMode(bool)` | Set text rendering mode |

### Usage Example

```lua
-- Create LCD display
local lcd = ISLcdBar:new(10, 10, 16)  -- 16 characters wide
lcd:initialise()
lcd:setText("Hello World!")
lcd:toggleOn(true)
parentPanel:addChild(lcd)

-- Scrolling text (for long messages)
lcd:setText("This is a very long message that will scroll across the display")
lcd:setDoScroll(true)
```

### Custom Colors

```lua
-- Green LCD (like old devices)
lcd.ledColor = {r=0.2, g=0.8, b=0.2, a=1}
lcd.ledTextColor = {r=0, g=0.3, b=0, a=1}

-- Orange LCD
lcd.ledColor = {r=1, g=0.6, b=0.1, a=1}
lcd.ledTextColor = {r=0.4, g=0.2, b=0, a=1}
```

### Radio Display Pattern

```lua
-- Radio frequency display
local freqDisplay = ISLcdBar:new(10, 10, 8)
freqDisplay:initialise()
freqDisplay:setText("88.3 FM")
freqDisplay:toggleOn(true)
freqDisplay:setDoScroll(false)

-- Station name (scrolling)
local stationDisplay = ISLcdBar:new(10, 30, 12)
stationDisplay:initialise()
stationDisplay:setText("KNOX Country Radio - Playing the Hits!")
stationDisplay:setDoScroll(true)
```

---

## Common Patterns

### Label + Value Display

```lua
function MyPanel:createLabeledValue(x, y, labelText, valueText)
    local labelWidth = 100

    -- Label (right-aligned)
    local label = ISLabel:new(x + labelWidth, y, 20, labelText, 0.7, 0.7, 0.7, 1, UIFont.Small, false)
    label:initialise()
    self:addChild(label)

    -- Value (left-aligned)
    local value = ISLabel:new(x + labelWidth + 10, y, 20, valueText, 1, 1, 1, 1, UIFont.Small, true)
    value:initialise()
    self:addChild(value)

    return value  -- Return value label for updates
end

-- Usage
self.healthLabel = self:createLabeledValue(10, 50, "Health:", "100%")
```

### Status Icon Grid

```lua
function MyPanel:createStatusIcons()
    local icons = {
        {texture = "media/ui/status_hunger.png", tooltip = "Hunger"},
        {texture = "media/ui/status_thirst.png", tooltip = "Thirst"},
        {texture = "media/ui/status_tired.png", tooltip = "Fatigue"},
    }

    local iconSize = 24
    local spacing = 4

    for i, iconData in ipairs(icons) do
        local x = (i - 1) * (iconSize + spacing)
        local icon = ISImage:new(x, 0, iconSize, iconSize, getTexture(iconData.texture))
        icon:initialise()
        icon:setMouseOverText(iconData.tooltip)
        self:addChild(icon)
        self.statusIcons[i] = icon
    end
end
```

### Progress Bar with Label

```lua
function MyPanel:createProgressBar(x, y, width, label)
    -- Label above bar
    local labelUI = ISLabel:new(x, y, 16, label, 1, 1, 1, 1, UIFont.Small, true)
    labelUI:initialise()
    self:addChild(labelUI)

    -- Progress bar
    local bar = ISGradientBar:new(x, y + 18, width, 12)
    bar:setDoKnob(false)
    bar:initialise()
    self:addChild(bar)

    return bar
end
```

---

## Performance Considerations

1. **Tooltip Caching**: Create tooltips once and reuse them
2. **Label Updates**: `setName()` recalculates width - batch updates if possible
3. **LCD Scrolling**: Disable when not visible to save CPU
4. **Image Scaling**: Pre-scale textures if possible, avoid runtime scaling

---

## Common Gotchas

1. **Label Alignment**: `bLeft=false` aligns text RIGHT edge to x position

2. **Tooltip Visibility**: Always pair `addToUIManager()` with `setVisible(true)`

3. **Image Tint**: `backgroundColor` is used as tint, not actual background

4. **LCD Character Set**: Only ASCII subset supported - accents converted automatically

5. **Tooltip Overlap**: Use `setOwner()` for automatic overlap avoidance

6. **Label Width**: Width auto-calculated from text - don't set manually unless needed

7. **GradientBar Value**: Value is 0-1, not percentage - divide by 100 if needed
