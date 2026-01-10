# ISUIElement Foundations - Complete Anatomy

> **Documentation Scope:** This document provides exhaustive documentation of `ISUIElement.lua`, the foundational class for ALL UI elements in Project Zomboid. Every panel, button, list, window, and custom UI component inherits from this class.

---

## Table of Contents
1. [Inheritance Hierarchy](#inheritance-hierarchy)
2. [Element Lifecycle](#element-lifecycle)
3. [Constructor and Properties](#constructor-and-properties)
4. [Position and Sizing System](#position-and-sizing-system)
5. [Anchoring System](#anchoring-system)
6. [Rendering Pipeline](#rendering-pipeline)
7. [Drawing Primitives](#drawing-primitives)
8. [Child Management](#child-management)
9. [Scrolling System](#scrolling-system)
10. [Stenciling/Clipping System](#stencilingclipping-system)
11. [Mouse Input Events](#mouse-input-events)
12. [Joypad/Controller Events](#joypadcontroller-events)
13. [Visibility and State](#visibility-and-state)
14. [Utility Methods](#utility-methods)
15. [Java Bridge (javaObject)](#java-bridge-javaobject)
16. [Complete Method Reference](#complete-method-reference)
17. [Modding Patterns](#modding-patterns)

---

## Inheritance Hierarchy

```
ISBaseObject                    -- Root class (shared/ISBaseObject.lua)
    └── ISUIElement             -- UI foundation (client/ISUI/ISUIElement.lua)
            ├── ISPanel              -- Basic container with background
            │   └── ISPanelJoypad    -- Panel with gamepad support
            │       └── [Most UI components]
            ├── ISScrollBar          -- Scrollbar component
            ├── ISButton             -- Clickable button
            ├── ISLabel              -- Text display
            └── [Other direct derivatives]
```

### ISBaseObject Foundation

ISBaseObject (`lua/shared/ISBaseObject.lua`) provides:
- `Type` property for class identification
- `derive(type)` - Class inheritance method
- `initialise()` - Initialization hook
- `new()` - Instance creation

```lua
-- ISBaseObject source (32 lines)
ISBaseObject = {};
ISBaseObject.Type = "ISBaseObject";

function ISBaseObject:derive(type)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.Type = type;
    return o
end

function ISBaseObject:initialise()
    -- Override in derived classes
end

function ISBaseObject:new()
    local o = {}
    setmetatable(o, self)
    self.__index = self
    return o
end
```

---

## Element Lifecycle

Understanding the lifecycle is **critical** for creating custom UI elements.

### Lifecycle Phases

```
1. CONSTRUCTION     new(x, y, width, height)
        │
        ▼
2. INITIALIZATION   initialise()
        │
        ▼
3. INSTANTIATION    instantiate()
        │
        ├─────────► Creates javaObject (UIElement.new)
        │
        ▼
4. CHILD CREATION   createChildren()
        │
        ▼
5. UI MANAGER ADD   addToUIManager()
        │
        ▼
6. RENDER LOOP      prerender() → render() [repeating]
        │
        ▼
7. REMOVAL          removeFromUIManager()
```

### Phase Details

#### Phase 1: Construction - `new(x, y, width, height)`
```lua
function ISUIElement:new(x, y, width, height)
    local o = {}
    setmetatable(o, self)
    self.__index = self

    -- Screen boundary clamping (keepOnScreen behavior)
    local maxY = getCore():getScreenHeight()
    local maxX = getCore():getScreenWidth()
    o.x = math.max(0, math.min(x, maxX - width))
    o.y = math.max(0, math.min(y, maxY - height))

    -- Core dimensions
    o.width = width
    o.height = height

    -- Default anchoring (top-left)
    o.anchorLeft = true
    o.anchorRight = false
    o.anchorTop = true
    o.anchorBottom = false

    -- Other defaults
    o.dock = "none"
    o.minimumWidth = 0
    o.minimumHeight = 0
    o.scrollwidth = 0
    o.removed = false

    return o
end
```

**Key Points:**
- Position is clamped to screen bounds by default
- Anchoring defaults to top-left
- `javaObject` is NOT created yet

#### Phase 2: Initialization - `initialise()`
```lua
function ISUIElement:initialise()
    self.children = {}
    self.ID = ISUIElement.IDMax
    ISUIElement.IDMax = ISUIElement.IDMax + 1
end
```

**Key Points:**
- Creates empty `children` table
- Assigns unique ID from global counter
- Called ONCE per element

#### Phase 3: Instantiation - `instantiate()`
```lua
function ISUIElement:instantiate()
    self.javaObject = UIElement.new(self)
    self.javaObject:setX(self.x)
    self.javaObject:setY(self.y)
    self.javaObject:setHeight(self.height)
    self.javaObject:setWidth(self.width)
    self.javaObject:setAnchorLeft(self.anchorLeft)
    self.javaObject:setAnchorRight(self.anchorRight)
    self.javaObject:setAnchorTop(self.anchorTop)
    self.javaObject:setAnchorBottom(self.anchorBottom)
    self.javaObject:setWantKeyEvents(self.wantKeyEvents or false)
    self.javaObject:setForceCursorVisible(self.forceCursorVisible or false)
    self:createChildren()
end
```

**Key Points:**
- Creates the Java-side `UIElement` object
- Syncs all Lua properties to Java
- Automatically calls `createChildren()`

#### Phase 4: Child Creation - `createChildren()`
```lua
function ISUIElement:createChildren()
    -- Empty by default - override in derived classes
end
```

**Key Points:**
- Override this to add child elements
- Called automatically by `instantiate()`
- Children should use `self:addChild(childElement)`

#### Phase 5: UI Manager Addition - `addToUIManager()`
```lua
function ISUIElement:addToUIManager()
    if self.javaObject == nil then
        self:instantiate()
    end
    UIManager.AddUI(self.javaObject)
end
```

**Key Points:**
- Auto-instantiates if needed
- Registers with Java UIManager
- Element now receives events and renders

#### Phase 6: Render Loop
```lua
function ISUIElement:prerender()
    -- Called BEFORE children render
    -- Draw backgrounds, borders here
end

function ISUIElement:render()
    -- Called AFTER children render
    -- Draw overlays, foreground content here
end

function ISUIElement:update()
    -- Called each frame for logic updates
end
```

#### Phase 7: Removal - `removeFromUIManager()`
```lua
function ISUIElement:removeFromUIManager()
    if self.javaObject == nil then
        return
    end
    UIManager.RemoveElement(self.javaObject)
    self.removed = true
end
```

---

## Constructor and Properties

### Default Properties (set in `new()`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `x` | number | (clamped) | X position in pixels |
| `y` | number | (clamped) | Y position in pixels |
| `width` | number | (param) | Width in pixels |
| `height` | number | (param) | Height in pixels |
| `anchorLeft` | boolean | `true` | Anchor to left edge |
| `anchorRight` | boolean | `false` | Anchor to right edge |
| `anchorTop` | boolean | `true` | Anchor to top edge |
| `anchorBottom` | boolean | `false` | Anchor to bottom edge |
| `dock` | string | `"none"` | Docking mode |
| `minimumWidth` | number | `0` | Minimum width constraint |
| `minimumHeight` | number | `0` | Minimum height constraint |
| `scrollwidth` | number | `0` | Horizontal scroll content width |
| `removed` | boolean | `false` | Whether element was removed |

### Additional Properties (set during lifecycle)

| Property | Type | Set In | Description |
|----------|------|--------|-------------|
| `children` | table | `initialise()` | Child elements by ID |
| `ID` | number | `initialise()` | Unique element identifier |
| `javaObject` | UIElement | `instantiate()` | Java-side UI element |
| `parent` | ISUIElement | `addChild()` | Parent element reference |
| `vscroll` | ISScrollBar | `addScrollBars()` | Vertical scrollbar |
| `hscroll` | ISScrollBar | `addScrollBars()` | Horizontal scrollbar |
| `controller` | any | `setController()` | Custom controller reference |
| `joyfocus` | table | `onGainJoypadFocus()` | Joypad focus data |
| `enabled` | boolean | `setEnabled()` | Whether element is enabled |
| `wantKeyEvents` | boolean | `setWantKeyEvents()` | Receive keyboard events |
| `forceCursorVisible` | boolean | `setForceCursorVisible()` | Force cursor visible |
| `keepOnScreen` | boolean | (optional) | Override screen clamping |

---

## Position and Sizing System

### Position Methods

#### setX(x) / setY(y)
```lua
function ISUIElement:setX(x)
    local xs = x
    if self:getKeepOnScreen() then
        local maxX = getCore():getScreenWidth()
        xs = math.max(0, math.min(x, maxX - self.width))
    end
    self.x = xs
    if self.javaObject ~= nil then
        self.javaObject:setX(xs)
    end
end
```

**Behavior:**
- Clamps to screen bounds if `keepOnScreen` is true
- Updates both Lua and Java state
- `getKeepOnScreen()` returns `true` for root elements (no parent)

#### getX() / getY()
```lua
function ISUIElement:getX()
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:getX()
end
```

**Behavior:**
- Auto-instantiates if needed
- Returns Java object's position

#### getAbsoluteX() / getAbsoluteY()
```lua
function ISUIElement:getAbsoluteX()
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:getAbsoluteX()
end
```

**Behavior:**
- Returns screen-space position
- Accounts for parent chain offsets

### Size Methods

#### setWidth(w) / setHeight(h)
```lua
function ISUIElement:setWidth(w)
    self.width = w
    if self:getKeepOnScreen() then
        local maxX = getCore():getScreenWidth()
        self.x = math.max(0, math.min(self.x, maxX - self.width))
    end
    if self.javaObject ~= nil then
        self.javaObject:setWidth(w)
        self.javaObject:setX(self.x)
    end
end
```

**Behavior:**
- Updates width and re-clamps position
- Syncs to Java object

#### getWidth() / getHeight()
```lua
function ISUIElement:getWidth()
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:getWidth()
end
```

#### getRight() / getBottom()
```lua
function ISUIElement:getRight()
    return self.javaObject:getX() + self.javaObject:getWidth()
end

function ISUIElement:getBottom()
    return self.javaObject:getY() + self.javaObject:getHeight()
end
```

### Center Methods

```lua
function ISUIElement:getCentreX()
    return self:getWidth() / 2.0
end

function ISUIElement:getCentreY()
    return self:getHeight() / 2.0
end
```

### Recursive Sizing

```lua
function ISUIElement:setWidthAndParentWidth(w)
    ISPanel.setWidth(self, w)
    local parent = self.parent
    local child = self
    while parent do
        parent:setWidth(child:getX() + child:getWidth())
        child = parent
        parent = parent.parent
    end
end
```

**Use Case:** Auto-expand parent chain when content grows

### Resize Handling

```lua
function ISUIElement:onResize()
    self.x = self:getX()
    self.y = self:getY()
    self.width = self:getWidth()
    self.height = self:getHeight()

    -- Enforce minimum dimensions
    if self.minimumWidth == nil then
        self.minimumWidth = 0
        self.minimumHeight = 0
    end
    if self.width < self.minimumWidth then
        self.width = self.minimumWidth
        if self.javaObject then
            self.javaObject:setWidthOnly(self.width)
        end
    end
    if self.height < self.minimumHeight then
        self.height = self.minimumHeight
        if self.javaObject then
            self.javaObject:setHeightOnly(self.height)
        end
    end

    self:updateScrollbars()
end
```

### Screen Boundary Behavior

```lua
function ISUIElement:getKeepOnScreen()
    if self.keepOnScreen ~= nil then
        return self.keepOnScreen
    end
    return not self.parent  -- Root elements stay on screen
end
```

---

## Anchoring System

Anchoring determines how elements resize when their parent resizes.

### Anchor Properties

| Anchor | Effect When Parent Resizes |
|--------|---------------------------|
| `anchorLeft` | Maintain distance from left edge |
| `anchorRight` | Maintain distance from right edge |
| `anchorTop` | Maintain distance from top edge |
| `anchorBottom` | Maintain distance from bottom edge |

### Anchor Methods

```lua
function ISUIElement:setAnchorLeft(bAnchor)
    self.anchorLeft = bAnchor
    if self.javaObject ~= nil then
        self.javaObject:setAnchorLeft(bAnchor)
    end
end

function ISUIElement:setAnchorRight(bAnchor)
    self.anchorRight = bAnchor
    if self.javaObject ~= nil then
        self.javaObject:setAnchorRight(bAnchor)
    end
end

function ISUIElement:setAnchorTop(bAnchor)
    self.anchorTop = bAnchor
    if self.javaObject ~= nil then
        self.javaObject:setAnchorTop(bAnchor)
    end
end

function ISUIElement:setAnchorBottom(bAnchor)
    self.anchorBottom = bAnchor
    if self.javaObject ~= nil then
        self.javaObject:setAnchorBottom(bAnchor)
    end
end
```

### Common Anchor Patterns

```lua
-- Fixed top-left corner (default)
element.anchorLeft = true
element.anchorRight = false
element.anchorTop = true
element.anchorBottom = false

-- Stretch horizontally with parent
element.anchorLeft = true
element.anchorRight = true
element.anchorTop = true
element.anchorBottom = false

-- Stretch both directions (fill)
element.anchorLeft = true
element.anchorRight = true
element.anchorTop = true
element.anchorBottom = true

-- Fixed to bottom-right corner
element.anchorLeft = false
element.anchorRight = true
element.anchorTop = false
element.anchorBottom = true
```

---

## Rendering Pipeline

### Render Order

1. **prerender()** - Draw backgrounds, borders (BEFORE children)
2. **(children render)**
3. **render()** - Draw foreground, overlays (AFTER children)

### Base Methods (empty, override in derived)

```lua
function ISUIElement:prerender()
    -- Override to draw background
end

function ISUIElement:render()
    -- Override to draw foreground
end

function ISUIElement:update()
    -- Override for per-frame logic
end
```

### Typical Prerender Override

```lua
function MyPanel:prerender()
    -- Draw background
    self:drawRect(0, 0, self.width, self.height,
        self.backgroundColor.a,
        self.backgroundColor.r,
        self.backgroundColor.g,
        self.backgroundColor.b)

    -- Draw border
    self:drawRectBorder(0, 0, self.width, self.height,
        self.borderColor.a,
        self.borderColor.r,
        self.borderColor.g,
        self.borderColor.b)
end
```

---

## Drawing Primitives

ISUIElement provides numerous drawing methods for custom rendering.

### Rectangle Drawing

#### drawRect(x, y, w, h, a, r, g, b)
Draws a filled rectangle.

```lua
-- Signature
function ISUIElement:drawRect(x, y, w, h, a, r, g, b)

-- Example: Red semi-transparent rectangle
self:drawRect(10, 10, 100, 50, 0.5, 1, 0, 0)
```

**Parameters:**
- `x, y` - Position relative to element
- `w, h` - Width and height
- `a` - Alpha (0-1)
- `r, g, b` - Color components (0-1)

#### drawRectBorder(x, y, w, h, a, r, g, b)
Draws a rectangle outline (1px border).

```lua
self:drawRectBorder(0, 0, self.width, self.height, 1, 0.4, 0.4, 0.4)
```

#### Static Variants
"Static" variants account for scroll offset:

```lua
-- Moves with scroll
self:drawRectStatic(x, y, w, h, a, r, g, b)
self:drawRectBorderStatic(x, y, w, h, a, r, g, b)
```

### Text Drawing

#### drawText(str, x, y, r, g, b, a, font)
Draws left-aligned text.

```lua
-- Available fonts: UIFont.Small, UIFont.Medium, UIFont.Large, UIFont.Title, etc.
self:drawText("Hello World", 10, 10, 1, 1, 1, 1, UIFont.Small)
```

#### drawTextCentre(str, x, y, r, g, b, a, font)
Draws center-aligned text (x is center point).

```lua
self:drawTextCentre("Centered", self.width / 2, 10, 1, 1, 1, 1, UIFont.Medium)
```

#### drawTextRight(str, x, y, r, g, b, a, font)
Draws right-aligned text (x is right edge).

```lua
self:drawTextRight("Right", self.width - 10, 10, 1, 1, 1, 1, UIFont.Small)
```

#### drawTextZoomed(str, x, y, zoom, r, g, b, a, font)
Draws text with zoom factor.

```lua
self:drawTextZoomed("Big", 10, 10, 2.0, 1, 1, 1, 1, UIFont.Small)
```

#### drawTextUntrimmed(str, x, y, r, g, b, a, font)
Draws text without trimming whitespace.

#### Static Variants
```lua
self:drawTextStatic(str, x, y, r, g, b, a, font)
self:drawTextCentreStatic(str, x, y, r, g, b, a, font)
self:drawTextRightStatic(str, x, y, r, g, b, a, font)
```

### Texture Drawing

#### drawTexture(texture, x, y, a, r, g, b)
Draws a texture at original size.

```lua
local tex = getTexture("media/ui/myicon.png")
self:drawTexture(tex, 10, 10, 1)  -- Full opacity
self:drawTexture(tex, 10, 10, 0.5, 1, 0, 0)  -- Red tinted, half opacity
```

#### drawTextureScaled(texture, x, y, w, h, a, r, g, b)
Draws a texture scaled to specified dimensions.

```lua
self:drawTextureScaled(tex, 10, 10, 64, 64, 1)
```

#### drawTextureScaledUniform(texture, x, y, scale, a, r, g, b)
Draws a texture with uniform scaling.

```lua
self:drawTextureScaledUniform(tex, 10, 10, 2.0, 1)  -- 2x size
```

#### drawTextureScaledAspect(texture, x, y, w, h, a, r, g, b)
Scales texture to fit within bounds, maintaining aspect ratio.

```lua
self:drawTextureScaledAspect(tex, 0, 0, 100, 100, 1)
```

#### drawTextureScaledAspect2(texture, x, y, w, h, a, r, g, b)
Alternative aspect-preserving scale (different fitting mode).

#### DrawTextureAngle(tex, centerX, centerY, angle)
Draws texture rotated around a center point.

```lua
self:DrawTextureAngle(tex, 50, 50, math.pi / 4)  -- 45 degrees
```

#### drawTextureTiledX(texture, x, y, w, h, r, g, b, a)
Tiles texture horizontally.

```lua
self:drawTextureTiledX(tex, 0, 0, self.width, 32, 1, 1, 1, 1)
```

#### drawTextureTiledY(texture, x, y, w, h, r, g, b, a)
Tiles texture vertically.

#### drawTextureAllPoint(texture, tlx, tly, trx, try, brx, bry, blx, bly, r, g, b, a)
Draws texture with arbitrary quad corners (for perspective/distortion).

```lua
-- Draw with custom quad points (top-left, top-right, bottom-right, bottom-left)
self:drawTextureAllPoint(tex, 0, 0, 100, 0, 100, 100, 0, 100, 1, 1, 1, 1)
```

### Line Drawing

#### drawLine2(x, y, x2, y2, a, r, g, b)
Draws a line between two points.

```lua
self:drawLine2(0, 0, 100, 100, 1, 1, 1, 1)  -- Diagonal white line
```

### Progress Bar

#### drawProgressBar(x, y, w, h, f, fg)
Draws a progress bar.

```lua
local fgColor = {r=0.2, g=0.8, b=0.2, a=1.0}
self:drawProgressBar(10, 10, 200, 20, 0.75, fgColor)  -- 75% filled
```

---

## Child Management

### addChild(otherElement)
Adds a child element.

```lua
function ISUIElement:addChild(otherElement)
    -- Auto-instantiate both if needed
    if self.javaObject == nil then
        self:instantiate()
    end
    if otherElement.javaObject == nil then
        otherElement:instantiate()
    end

    -- Initialize children table if needed
    if self.children == nil then
        self.children = {}
        self.ID = ISUIElement.IDMax
        ISUIElement.IDMax = ISUIElement.IDMax + 1
    end
    if otherElement.children == nil then
        otherElement.children = {}
        otherElement.ID = ISUIElement.IDMax
        ISUIElement.IDMax = ISUIElement.IDMax + 1
    end

    -- Add to children table and Java object
    self.children[otherElement.ID] = otherElement
    self.javaObject:AddChild(otherElement.javaObject)
    otherElement.parent = self
end
```

**Usage:**
```lua
local button = ISButton:new(10, 10, 80, 25, "Click", self, MyPanel.onClick)
button:initialise()
self:addChild(button)
```

### removeChild(otherElement)
Removes a child element.

```lua
function ISUIElement:removeChild(otherElement)
    if self.javaObject == nil then
        return
    end
    self.children[otherElement.ID] = nil
    if otherElement.javaObject ~= nil then
        self.javaObject:RemoveChild(otherElement.javaObject)
    end
end
```

### clearChildren()
Removes all children.

```lua
function ISUIElement:clearChildren()
    if self.javaObject == nil then
        return
    end
    self.children = {}
    self.javaObject:ClearChildren()
end
```

### getChildren()
Returns the children table.

```lua
function ISUIElement:getChildren()
    return self.children
end
```

### getParent()
Returns the parent element.

```lua
function ISUIElement:getParent()
    return self.parent
end
```

---

## Scrolling System

ISUIElement has built-in support for scrollable content.

### Adding Scrollbars

```lua
function ISUIElement:addScrollBars(addHorizontal)
    self.vscroll = ISScrollBar:new(self, true)  -- Vertical
    self.vscroll:initialise()
    self:addChild(self.vscroll)

    if addHorizontal then
        self.hscroll = ISScrollBar:new(self, false)  -- Horizontal
        self.hscroll:initialise()
        self:addChild(self.hscroll)
    end
end
```

**Usage:**
```lua
function MyScrollablePanel:createChildren()
    self:addScrollBars(false)  -- Vertical only
    -- or
    self:addScrollBars(true)   -- Both scrollbars
end
```

### Scroll Content Size

```lua
function ISUIElement:setScrollHeight(h)
    if self.javaObject == nil then return end
    self.javaObject:setScrollHeight(h)
    self:updateScrollbars()
end

function ISUIElement:getScrollHeight()
    if self.javaObject == nil then return 0 end
    return self.javaObject:getScrollHeight()
end

function ISUIElement:setScrollWidth(w)
    self.scrollwidth = w
    self:updateScrollbars()
end

function ISUIElement:getScrollWidth()
    return self.scrollwidth
end
```

**Key Concept:**
- `scrollHeight`/`scrollWidth` = total content size
- Element `height`/`width` = visible viewport size
- Scrolling shows when content > viewport

### Scroll Position

```lua
function ISUIElement:setYScroll(y)
    if self.javaObject == nil then return end

    -- Clamp to valid range
    if -y > self:getScrollHeight() - self:getScrollAreaHeight() then
        y = -(self:getScrollHeight() - self:getScrollAreaHeight())
    end
    if -y < 0 then
        y = 0
    end

    self.javaObject:setYScroll(y)
    self:updateScrollbars()
end

function ISUIElement:getYScroll()
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:getYScroll()
end
```

**Note:** Scroll values are negative (scroll down = negative Y)

### Scroll Area Size

```lua
function ISUIElement:getScrollAreaWidth()
    if self:isVScrollBarVisible() then
        return self:getWidth() - self.vscroll:getWidth()
    end
    return self:getWidth()
end

function ISUIElement:getScrollAreaHeight()
    if self.hscroll then
        return self:getHeight() - self.hscroll:getHeight()
    end
    return self:getHeight()
end
```

### Scrollbar Visibility

```lua
function ISUIElement:isVScrollBarVisible()
    return self.vscroll and (self.vscroll:getHeight() < self:getScrollHeight())
end
```

### Scroll Children Option

```lua
-- When true, child elements scroll with content
self:setScrollChildren(true)

-- When true, this element scrolls with its parent
self:setScrollWithParent(true)
```

### Mouse Wheel Handler

```lua
function ISUIElement:onMouseWheel(del)
    return false  -- Return true to consume event
end
```

**Override example:**
```lua
function MyList:onMouseWheel(del)
    self:setYScroll(self:getYScroll() - del * 40)  -- 40px per scroll
    return true
end
```

---

## Stenciling/Clipping System

Stenciling clips rendering to a rectangular region.

### Basic Stencil Operations

```lua
-- Set clipping rectangle
function ISUIElement:setStencilRect(x, y, w, h)
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:setStencilRect(x, y, w, h)
end

-- Clear clipping
function ISUIElement:clearStencilRect()
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:clearStencilRect()
end
```

### Stencil with Parent Clamping

```lua
function ISUIElement:clampStencilRectToParent(x, y, w, h)
    if self.javaObject == nil then
        self:instantiate()
    end
    if self.parent then
        local absX, absY = self:getAbsoluteX(), self:getAbsoluteY()
        local stencilX, stencilY = x, y
        local stencilX2, stencilY2 = x + w, y + h

        -- Account for parent's scrollbar
        if self.parent:isVScrollBarVisible() then
            stencilX2 = math.min(stencilX2, self.parent.width - self.parent.vscroll.width)
        end

        -- Clamp to parent bounds
        stencilX = self.javaObject:clampToParentX(absX + stencilX) - absX
        stencilX2 = self.javaObject:clampToParentX(absX + stencilX2) - absX
        stencilY = self.javaObject:clampToParentY(absY + stencilY) - absY
        stencilY2 = self.javaObject:clampToParentY(absY + stencilY2) - absY

        self:setStencilRect(stencilX, stencilY, stencilX2 - stencilX, stencilY2 - stencilY)
        return stencilX, stencilY, stencilX2 - stencilX, stencilY2 - stencilY
    end
    self.javaObject:setStencilRect(x, y, w, h)
    return x, y, w, h
end
```

### Suspend/Resume Stencil

```lua
-- Temporarily disable stencil (for drawing outside bounds)
self:suspendStencil()
-- Draw something outside clip region
self:resumeStencil()
```

### Max Draw Height

```lua
self:setMaxDrawHeight(500)  -- Limit rendering height
self:clearMaxDrawHeight()   -- Remove limit
local h = self:getMaxDrawHeight()
```

---

## Mouse Input Events

ISUIElement provides comprehensive mouse event handling.

### Mouse Position

```lua
-- Position relative to element (accounting for scroll)
function ISUIElement:getMouseX()
    return (getMouseX() - self.javaObject:getXScroll()) - self:getAbsoluteX()
end

function ISUIElement:getMouseY()
    return (getMouseY() - self.javaObject:getYScroll()) - self:getAbsoluteY()
end

-- Check if mouse is over element
function ISUIElement:isMouseOver()
    return self.javaObject:isMouseOver()
end
```

### Mouse Event Methods

| Method | Trigger | Default Behavior |
|--------|---------|------------------|
| `onMouseDown(x, y)` | Left click down | - |
| `onMouseUp(x, y)` | Left click up | Forwards to vscroll |
| `onMouseMove(dx, dy)` | Mouse moves over element | - |
| `onMouseMoveOutside(dx, dy)` | Mouse moves outside element | - |
| `onMouseWheel(del)` | Mouse wheel scroll | Returns false |
| `onMouseDownOutside(x, y)` | Left click outside element | - |
| `onMouseUpOutside(x, y)` | Left click up outside element | Forwards to vscroll |
| `onRightMouseDown(x, y)` | Right click down | - |
| `onRightMouseUp(x, y)` | Right click up | - |
| `onRightMouseDownOutside(x, y)` | Right click outside | - |
| `onRightMouseUpOutside(x, y)` | Right click up outside | - |

### Double-Click Support

```lua
function ISUIElement:setOnMouseDoubleClick(target, onmousedblclick)
    self.onMouseDoubleClick = onmousedblclick
    self.target = target
end
```

### Focus Event

```lua
function ISUIElement:onFocus(x, y)
    if self.parent == nil then
        self:bringToTop()
    end
end
```

### Mouse Capture

```lua
-- Capture all mouse events (even outside element)
self:setCapture(true)

-- Check if capturing
local capturing = self:getIsCaptured()
```

### Hit Testing

```lua
-- Test if point is within element bounds (global coords)
function ISUIElement:containsPoint(x, y)
    if x >= self.x and x < self.x + self.width and
       y >= self.y and y < self.y + self.height then
        return true
    end
    return false
end

-- Test with local coords
function ISUIElement:containsPointLocal(x, y)
    if x >= 0 and x < self.width and
       y >= 0 and y < self.height then
        return true
    end
    return false
end
```

---

## Joypad/Controller Events

For gamepad support (extended in ISPanelJoypad).

### Focus Events

```lua
function ISUIElement:onGainJoypadFocus(joypadData)
    self.joyfocus = joypadData
end

function ISUIElement:onLoseJoypadFocus(joypadData)
    self.joyfocus = nil
end
```

### Directional Events

```lua
function ISUIElement:onJoypadDown(button)
    -- Override to handle button presses
end

function ISUIElement:onJoypadDirUp()
    -- Override for D-pad up
end

function ISUIElement:onJoypadDirDown()
    -- Override for D-pad down
end

function ISUIElement:onJoypadDirLeft()
    -- Override for D-pad left
end

function ISUIElement:onJoypadDirRight()
    -- Override for D-pad right
end
```

---

## Visibility and State

### Visibility Methods

```lua
function ISUIElement:setVisible(bVisible)
    if self.javaObject == nil then
        self:instantiate()
    end
    self.javaObject:setVisible(bVisible)

    -- Optional callback
    if self.visibleTarget and self.visibleFunction then
        self.visibleFunction(self.visibleTarget, self)
    end
end

function ISUIElement:getIsVisible()
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:isVisible()
end

function ISUIElement:isVisible()
    -- Alias for getIsVisible
    return self.javaObject:isVisible()
end

function ISUIElement:isReallyVisible()
    if not self:getIsVisible() then return false end
    if self:getParent() then
        local parentJavaObject = self:getParent():getJavaObject()
        if parentJavaObject and not parentJavaObject:getControls():contains(self:getJavaObject()) then
            return false
        end
        return self:getParent():isReallyVisible()
    end
    return UIManager.getUI():contains(self.javaObject)
end
```

### Enabled State

```lua
function ISUIElement:setEnabled(en)
    if self.javaObject == nil then
        self:instantiate()
    end
    self.javaObject:setEnabled(en)
    self.enabled = en
end

function ISUIElement:isEnabled()
    if self.javaObject == nil then
        self:instantiate()
    end
    if self.enabled == nil then
        self.enabled = self.javaObject:isEnabled()
    end
    return self.enabled
end
```

### Removed State

```lua
function ISUIElement:isRemoved()
    return self.removed
end

function ISUIElement:setRemoved(bremove)
    self.removed = bremove
end
```

### Z-Order

```lua
function ISUIElement:bringToTop()
    if self.javaObject == nil then return end
    self.javaObject:bringToTop()
end

function ISUIElement:backMost()
    if self.javaObject == nil then
        self:instantiate()
    end
    self.javaObject:backMost()
end

function ISUIElement:setAlwaysOnTop(b)
    if self.javaObject ~= nil then
        self.javaObject:setAlwaysOnTop(b)
    end
end
```

---

## Utility Methods

### Controller Reference

```lua
function ISUIElement:setController(c)
    self.controller = c
end

function ISUIElement:getController()
    return self.controller
end
```

### UI Name (for debugging/accessibility)

```lua
function ISUIElement:setUIName(name)
    if self.javaObject == nil then
        self:instantiate()
    end
    self.javaObject:setUIName(name)
end

function ISUIElement:getUIName()
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:getUIName()
end

function ISUIElement:toString()
    local name = self:getUIName()
    if name == "" then
        return self.Type..'('..tostring(self)..')'
    end
    return name
end
```

### Split Screen Support

```lua
function ISUIElement:stayOnSplitScreen(playerNum)
    if getNumActivePlayers() > 1 then
        local sL = getPlayerScreenLeft(playerNum)
        local sT = getPlayerScreenTop(playerNum)
        local sW = getPlayerScreenWidth(playerNum)
        local sH = getPlayerScreenHeight(playerNum)
        if self:getX() < sL then self:setX(sL) end
        if self:getY() < sT then self:setY(sT) end
        if self:getX() + self:getWidth() > sL + sW then
            self:setX((sL + sW) - self:getWidth())
        end
        if self:getY() + self:getHeight() > sT + sH then
            self:setY((sT + sH) - self:getHeight())
        end
    end
end
```

### Follow Game World

```lua
-- Make UI element move with game world (e.g., overhead indicators)
function ISUIElement:setFollowGameWorld(bFollow)
    if self.javaObject == nil then
        self:instantiate()
    end
    self.javaObject:setFollowGameWorld(bFollow)
end

function ISUIElement:isFollowGameWorld()
    return self.javaObject:isFollowGameWorld()
end
```

### Render Player Restriction

```lua
-- Only render for specific player (split screen)
function ISUIElement:setRenderThisPlayerOnly(playerNum)
    if self.javaObject == nil then
        self:instantiate()
    end
    self.javaObject:setRenderThisPlayerOnly(playerNum)
end
```

### Keyboard Events

```lua
function ISUIElement:setWantKeyEvents(want)
    if self.javaObject == nil then
        self.wantKeyEvents = want
    else
        self.wantKeyEvents = nil
        self.javaObject:setWantKeyEvents(want)
    end
end
```

### Force Cursor Visible

```lua
function ISUIElement:setForceCursorVisible(force)
    if self.javaObject == nil then
        self.forceCursorVisible = force
    else
        self.forceCursorVisible = nil
        self.javaObject:setForceCursorVisible(force)
    end
end
```

### Shrink Animations

```lua
-- Shrink element proportionally on Y axis
function ISUIElement:shrinkY(y)
    y = 1.0 - y
    self.height = self:getHeight()
    local newY = self:getY()
    newY = newY + ((self.height * y) / 2)
    self:setHeight(self:getHeight() - (self.height * y))
    self:setY(newY)
end

-- Shrink element proportionally on X axis
function ISUIElement:shrinkX(x)
    x = 1.0 - x
    self.width = self:getWidth()
    local newX = self:getX()
    newX = newX + ((self.width * x) / 2)
    self:setWidth(self:getWidth() - (self.width * x))
    self:setX(newX)
end
```

### Wrap in Window

```lua
function ISUIElement:wrapInCollapsableWindow(title, resizable, subClass)
    local titleBarHeight = ISCollapsableWindow.TitleBarHeight()
    local resizeWidgetHeight = (resizable == nil or resizable == true) and 8 or 0
    subClass = subClass or ISCollapsableWindow

    local o = subClass:new(self.x, self.y, self.width,
        self.height + titleBarHeight + resizeWidgetHeight)
    o.title = title
    o:setResizable(resizable == nil or resizable == true)
    o:initialise()
    o:instantiate()

    if self.javaObject ~= nil then
        self:removeFromUIManager()
    end
    o:addChild(self)
    self:setX(0)
    self:setY(o:titleBarHeight())
    o.nested = self

    return o
end
```

**Usage:**
```lua
local myPanel = MyCustomPanel:new(100, 100, 300, 200)
myPanel:initialise()
local window = myPanel:wrapInCollapsableWindow("My Panel Title", true)
window:addToUIManager()
```

---

## Java Bridge (javaObject)

ISUIElement wraps a Java `UIElement` object.

### Key Java Bridge Methods

Most ISUIElement methods delegate to the Java object:

```lua
-- Pattern: auto-instantiate, then delegate
function ISUIElement:someMethod(params)
    if self.javaObject == nil then
        self:instantiate()
    end
    return self.javaObject:someMethod(params)
end
```

### Direct Java Object Access

```lua
function ISUIElement:getJavaObject()
    return self.javaObject
end
```

### Java Methods Available

The `javaObject` (UIElement) provides:
- Position/size: `setX`, `setY`, `setWidth`, `setHeight`, `getAbsoluteX`, `getAbsoluteY`
- Anchoring: `setAnchorLeft`, `setAnchorRight`, `setAnchorTop`, `setAnchorBottom`
- Visibility: `setVisible`, `isVisible`, `setEnabled`, `isEnabled`
- Children: `AddChild`, `RemoveChild`, `ClearChildren`, `getControls`
- Drawing: `DrawTexture`, `DrawTextureScaled`, `DrawText`, `DrawTextCentre`, etc.
- Scrolling: `setYScroll`, `getYScroll`, `setScrollHeight`, `getScrollHeight`
- Stencil: `setStencilRect`, `clearStencilRect`, `suspendStencil`, `resumeStencil`
- Z-order: `bringToTop`, `backMost`, `setAlwaysOnTop`
- Events: `setCapture`, `isCapture`, `setWantKeyEvents`
- Mouse: `isMouseOver`, `getXScroll`, `getYScroll`
- Misc: `onResize`, `setUIName`, `getUIName`

---

## Complete Method Reference

### Constructor
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `new` | `x, y, width, height` | ISUIElement | Creates new element |

### Lifecycle
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `initialise` | - | - | Initialize element |
| `instantiate` | - | - | Create Java object |
| `createChildren` | - | - | Override to add children |
| `addToUIManager` | - | - | Add to UI system |
| `removeFromUIManager` | - | - | Remove from UI system |

### Position/Size
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setX` | `x` | - | Set X position |
| `setY` | `y` | - | Set Y position |
| `setWidth` | `w` | - | Set width |
| `setHeight` | `h` | - | Set height |
| `getX` | - | number | Get X position |
| `getY` | - | number | Get Y position |
| `getWidth` | - | number | Get width |
| `getHeight` | - | number | Get height |
| `getAbsoluteX` | - | number | Get screen X |
| `getAbsoluteY` | - | number | Get screen Y |
| `getRight` | - | number | Get right edge X |
| `getBottom` | - | number | Get bottom edge Y |
| `getCentreX` | - | number | Get center X |
| `getCentreY` | - | number | Get center Y |
| `setWidthAndParentWidth` | `w` | - | Set width recursively |
| `setHeightAndParentHeight` | `h` | - | Set height recursively |
| `onResize` | - | - | Handle resize event |
| `recalcSize` | - | - | Recalculate size |
| `getKeepOnScreen` | - | boolean | Check screen clamping |

### Anchoring
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setAnchorLeft` | `bool` | - | Set left anchor |
| `setAnchorRight` | `bool` | - | Set right anchor |
| `setAnchorTop` | `bool` | - | Set top anchor |
| `setAnchorBottom` | `bool` | - | Set bottom anchor |

### Rendering
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `prerender` | - | - | Pre-render hook |
| `render` | - | - | Render hook |
| `update` | - | - | Update hook |

### Drawing - Rectangles
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `drawRect` | `x,y,w,h,a,r,g,b` | - | Draw filled rect |
| `drawRectStatic` | `x,y,w,h,a,r,g,b` | - | Draw rect (scroll-adjusted) |
| `drawRectBorder` | `x,y,w,h,a,r,g,b` | - | Draw rect outline |
| `drawRectBorderStatic` | `x,y,w,h,a,r,g,b` | - | Draw outline (scroll-adjusted) |
| `drawLine2` | `x,y,x2,y2,a,r,g,b` | - | Draw line |
| `drawProgressBar` | `x,y,w,h,f,fg` | - | Draw progress bar |

### Drawing - Text
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `drawText` | `str,x,y,r,g,b,a,font` | - | Draw left-aligned text |
| `drawTextCentre` | `str,x,y,r,g,b,a,font` | - | Draw centered text |
| `drawTextRight` | `str,x,y,r,g,b,a,font` | - | Draw right-aligned text |
| `drawTextZoomed` | `str,x,y,zoom,r,g,b,a,font` | - | Draw zoomed text |
| `drawTextUntrimmed` | `str,x,y,r,g,b,a,font` | - | Draw untrimmed text |
| `drawTextStatic` | `str,x,y,r,g,b,a,font` | - | Draw text (scroll-adjusted) |
| `drawTextCentreStatic` | `str,x,y,r,g,b,a,font` | - | Draw centered (scroll-adjusted) |
| `drawTextRightStatic` | `str,x,y,r,g,b,a,font` | - | Draw right (scroll-adjusted) |

### Drawing - Textures
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `drawTexture` | `tex,x,y,a,r,g,b` | - | Draw texture |
| `drawTextureScaled` | `tex,x,y,w,h,a,r,g,b` | - | Draw scaled texture |
| `drawTextureScaledUniform` | `tex,x,y,scale,a,r,g,b` | - | Draw uniformly scaled |
| `drawTextureScaledAspect` | `tex,x,y,w,h,a,r,g,b` | - | Draw aspect-preserved |
| `drawTextureScaledAspect2` | `tex,x,y,w,h,a,r,g,b` | - | Draw aspect (alt) |
| `DrawTextureAngle` | `tex,cx,cy,angle` | - | Draw rotated |
| `drawTextureTiledX` | `tex,x,y,w,h,r,g,b,a` | - | Draw tiled horizontally |
| `drawTextureTiledY` | `tex,x,y,w,h,r,g,b,a` | - | Draw tiled vertically |
| `drawTextureAllPoint` | `tex,tlx,tly,...,a` | - | Draw with quad points |
| `drawTextureStatic` | `tex,x,y,a,r,g,b` | - | Draw (scroll-adjusted) |
| `drawTextureScaledStatic` | `tex,x,y,w,h,a,r,g,b` | - | Draw scaled (scroll) |

### Children
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `addChild` | `element` | - | Add child element |
| `removeChild` | `element` | - | Remove child element |
| `clearChildren` | - | - | Remove all children |
| `getChildren` | - | table | Get children table |
| `getParent` | - | ISUIElement | Get parent element |

### Scrolling
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `addScrollBars` | `addHorizontal` | - | Add scrollbars |
| `setScrollHeight` | `h` | - | Set content height |
| `getScrollHeight` | - | number | Get content height |
| `setScrollWidth` | `w` | - | Set content width |
| `getScrollWidth` | - | number | Get content width |
| `setYScroll` | `y` | - | Set Y scroll position |
| `getYScroll` | - | number | Get Y scroll position |
| `setXScroll` | `x` | - | Set X scroll position |
| `getXScroll` | - | number | Get X scroll position |
| `getScrollAreaWidth` | - | number | Get viewport width |
| `getScrollAreaHeight` | - | number | Get viewport height |
| `isVScrollBarVisible` | - | boolean | Check scrollbar visible |
| `updateScrollbars` | - | - | Update scrollbar state |
| `setScrollChildren` | `bool` | - | Set child scrolling |
| `getScrollChildren` | - | boolean | Get child scrolling |
| `setScrollWithParent` | `bool` | - | Set parent scrolling |
| `getScrollWithParent` | - | boolean | Get parent scrolling |

### Stenciling
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setStencilRect` | `x,y,w,h` | - | Set clip rectangle |
| `clearStencilRect` | - | - | Clear clip |
| `suspendStencil` | - | - | Pause clipping |
| `resumeStencil` | - | - | Resume clipping |
| `repaintStencilRect` | `x,y,w,h` | - | Repaint clip region |
| `clampStencilRectToParent` | `x,y,w,h` | x,y,w,h | Set clamped clip |
| `setMaxDrawHeight` | `h` | - | Set max draw height |
| `getMaxDrawHeight` | - | number | Get max draw height |
| `clearMaxDrawHeight` | - | - | Clear height limit |
| `ignoreWidthChange` | - | - | Ignore width changes |
| `ignoreHeightChange` | - | - | Ignore height changes |

### Mouse Events
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `onMouseDown` | `x, y` | - | Left button down |
| `onMouseUp` | `x, y` | - | Left button up |
| `onMouseMove` | `dx, dy` | - | Mouse move |
| `onMouseMoveOutside` | `dx, dy` | - | Move outside |
| `onMouseWheel` | `del` | boolean | Wheel scroll |
| `onMouseDownOutside` | `x, y` | - | Click outside |
| `onMouseUpOutside` | `x, y` | - | Release outside |
| `onRightMouseDown` | `x, y` | - | Right button down |
| `onRightMouseUp` | `x, y` | - | Right button up |
| `onRightMouseDownOutside` | `x, y` | - | Right click outside |
| `onRightMouseUpOutside` | `x, y` | - | Right release outside |
| `onFocus` | `x, y` | - | Element focused |
| `getMouseX` | - | number | Mouse X relative |
| `getMouseY` | - | number | Mouse Y relative |
| `isMouseOver` | - | boolean | Check mouse over |
| `containsPoint` | `x, y` | boolean | Point in bounds |
| `containsPointLocal` | `x, y` | boolean | Local point check |
| `setCapture` | `bool` | - | Set mouse capture |
| `getIsCaptured` | - | boolean | Check captured |
| `setOnMouseDoubleClick` | `target, func` | - | Set dblclick handler |

### Joypad Events
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `onJoypadDown` | `button` | - | Button pressed |
| `onJoypadDirUp` | - | - | D-pad up |
| `onJoypadDirDown` | - | - | D-pad down |
| `onJoypadDirLeft` | - | - | D-pad left |
| `onJoypadDirRight` | - | - | D-pad right |
| `onGainJoypadFocus` | `joypadData` | - | Gained focus |
| `onLoseJoypadFocus` | `joypadData` | - | Lost focus |

### Visibility/State
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setVisible` | `bool` | - | Set visibility |
| `getIsVisible` | - | boolean | Check visible |
| `isVisible` | - | boolean | Alias for getIsVisible |
| `isReallyVisible` | - | boolean | Check truly visible |
| `setEnabled` | `bool` | - | Set enabled |
| `isEnabled` | - | boolean | Check enabled |
| `isRemoved` | - | boolean | Check removed |
| `setRemoved` | `bool` | - | Set removed flag |
| `bringToTop` | - | - | Raise to top |
| `backMost` | - | - | Send to back |
| `setAlwaysOnTop` | `bool` | - | Set always on top |

### Utility
| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setController` | `c` | - | Set controller ref |
| `getController` | - | any | Get controller ref |
| `setUIName` | `name` | - | Set debug name |
| `getUIName` | - | string | Get debug name |
| `toString` | - | string | String representation |
| `getJavaObject` | - | UIElement | Get Java object |
| `setFollowGameWorld` | `bool` | - | Follow world position |
| `isFollowGameWorld` | - | boolean | Check follow world |
| `setRenderThisPlayerOnly` | `num` | - | Restrict to player |
| `getRenderThisPlayerOnly` | - | number | Get player restriction |
| `setWantKeyEvents` | `bool` | - | Enable key events |
| `setForceCursorVisible` | `bool` | - | Force cursor |
| `stayOnSplitScreen` | `playerNum` | - | Keep in split region |
| `shrinkX` | `factor` | - | Shrink horizontally |
| `shrinkY` | `factor` | - | Shrink vertically |
| `wrapInCollapsableWindow` | `title,resize,class` | window | Wrap in window |

---

## Modding Patterns

### Pattern 1: Basic Custom Panel

```lua
require "ISUI/ISPanel"

MyCustomPanel = ISPanel:derive("MyCustomPanel")

function MyCustomPanel:new(x, y, width, height)
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self

    o.backgroundColor = {r=0.1, g=0.1, b=0.1, a=0.9}
    o.borderColor = {r=0.4, g=0.4, b=0.4, a=1}

    return o
end

function MyCustomPanel:initialise()
    ISPanel.initialise(self)
end

function MyCustomPanel:createChildren()
    ISPanel.createChildren(self)

    -- Add a button
    self.closeButton = ISButton:new(
        self.width - 90, self.height - 35,
        80, 25,
        getText("UI_Close"),
        self, MyCustomPanel.onClose
    )
    self.closeButton:initialise()
    self.closeButton:instantiate()
    self.closeButton.anchorTop = false
    self.closeButton.anchorBottom = true
    self:addChild(self.closeButton)
end

function MyCustomPanel:onClose()
    self:setVisible(false)
end

-- Usage:
local panel = MyCustomPanel:new(100, 100, 300, 200)
panel:initialise()
panel:addToUIManager()
```

### Pattern 2: Scrollable List Panel

```lua
require "ISUI/ISPanel"

MyScrollablePanel = ISPanel:derive("MyScrollablePanel")

function MyScrollablePanel:new(x, y, width, height)
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.items = {}
    o.itemHeight = 25
    return o
end

function MyScrollablePanel:createChildren()
    ISPanel.createChildren(self)
    self:addScrollBars(false)  -- Vertical only
end

function MyScrollablePanel:addItem(text)
    table.insert(self.items, text)
    self:setScrollHeight(#self.items * self.itemHeight)
end

function MyScrollablePanel:prerender()
    ISPanel.prerender(self)

    -- Set clipping
    self:setStencilRect(0, 0, self.width - 13, self.height)

    local y = 0
    for i, item in ipairs(self.items) do
        self:drawText(item, 10, y, 1, 1, 1, 1, UIFont.Small)
        y = y + self.itemHeight
    end

    self:clearStencilRect()
end

function MyScrollablePanel:onMouseWheel(del)
    self:setYScroll(self:getYScroll() - del * 40)
    return true
end
```

### Pattern 3: Window with Content

```lua
require "ISUI/ISCollapsableWindow"

function showMyWindow()
    local content = ISPanel:new(0, 0, 400, 300)
    content:initialise()

    -- Add content to panel
    local label = ISLabel:new(10, 10, 25, "Hello World", 1, 1, 1, 1, UIFont.Medium, true)
    label:initialise()
    content:addChild(label)

    -- Wrap in window
    local window = content:wrapInCollapsableWindow("My Window", true)
    window:setVisible(true)
    window:addToUIManager()

    -- Center on screen
    window:setX((getCore():getScreenWidth() - window.width) / 2)
    window:setY((getCore():getScreenHeight() - window.height) / 2)
end
```

### Pattern 4: Custom Drawing

```lua
require "ISUI/ISUIElement"

MyGraphicsElement = ISUIElement:derive("MyGraphicsElement")

function MyGraphicsElement:new(x, y, width, height)
    local o = ISUIElement:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self
    o.rotation = 0
    return o
end

function MyGraphicsElement:update()
    self.rotation = self.rotation + 0.01
    if self.rotation > math.pi * 2 then
        self.rotation = 0
    end
end

function MyGraphicsElement:render()
    -- Draw background
    self:drawRect(0, 0, self.width, self.height, 0.5, 0.1, 0.1, 0.2)

    -- Draw rotating texture
    local tex = getTexture("media/ui/myicon.png")
    if tex then
        self:DrawTextureAngle(tex, self.width/2, self.height/2, self.rotation)
    end

    -- Draw progress bar
    local progress = (math.sin(self.rotation * 2) + 1) / 2
    self:drawProgressBar(10, self.height - 30, self.width - 20, 20,
        progress, {r=0.2, g=0.8, b=0.2, a=1})
end
```

---

## Summary

ISUIElement is the foundation of all Project Zomboid UI components. Key takeaways:

1. **Lifecycle matters** - Follow new → initialise → instantiate → addToUIManager
2. **createChildren** is your main setup hook for adding child elements
3. **prerender/render** split - backgrounds before children, overlays after
4. **Anchoring** enables responsive layouts when parent resizes
5. **Scrolling** requires setting scrollHeight > element height
6. **Stenciling** clips content to bounds for scrollable areas
7. **javaObject** is the bridge to Java rendering engine
8. **Always call parent class methods** when overriding lifecycle hooks

For gamepad support, see **ISPanelJoypad** documentation (5b. Container Patterns).
