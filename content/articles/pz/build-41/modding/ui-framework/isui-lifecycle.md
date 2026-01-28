---
id: ui-framework-isui-lifecycle
slug: isui-lifecycle
title: "UI Element Lifecycle"
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
  - lifecycle
  - api
excerpt: "Complete guide to the ISUIElement lifecycle phases: new, initialise, instantiate, createChildren, addToUIManager, render loop, and removal."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Lifecycle Diagram"
    link: "#lifecycle-diagram"
  - text: "Phase 1: Construction - new()"
    link: "#phase-1-construction---new"
  - text: "Phase 2: Initialization - initialise()"
    link: "#phase-2-initialization---initialise"
  - text: "Phase 3: Instantiation - instantiate()"
    link: "#phase-3-instantiation---instantiate"
  - text: "Phase 4: Child Creation - createChildren()"
    link: "#phase-4-child-creation---createchildren"
  - text: "Phase 5: UI Manager Addition - addToUIManager()"
    link: "#phase-5-ui-manager-addition---addtouimanager"
  - text: "Phase 6: Render Loop"
    link: "#phase-6-render-loop"
  - text: "Phase 7: Removal - removeFromUIManager()"
    link: "#phase-7-removal---removefromuimanager"
  - text: "Shortcut: Typical Usage Pattern"
    link: "#shortcut-typical-usage-pattern"
  - text: "Child Element Pattern"
    link: "#child-element-pattern"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-10
---

# UI Element Lifecycle

## Overview

Every ISUI component goes through a well-defined lifecycle. Understanding these phases is essential for creating custom UI elements that initialize correctly and clean up properly.

---

## Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CREATION PHASE                       │
├─────────────────────────────────────────────────────────┤
│  1. new(x, y, width, height)                            │
│     └── Creates Lua object, sets dimensions             │
│         └── Position clamped to screen bounds           │
│                                                         │
│  2. initialise()                                        │
│     └── Creates children table                          │
│         └── Assigns unique ID                           │
│                                                         │
│  3. instantiate()                                       │
│     └── Creates Java UIElement                          │
│         └── Syncs properties to Java                    │
│             └── Calls createChildren()                  │
│                                                         │
│  4. createChildren()                                    │
│     └── Add child components (buttons, labels, etc.)    │
│                                                         │
│  5. addToUIManager()                                    │
│     └── Registers with game's UI system                 │
│         └── Element now visible and receiving events    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    ACTIVE PHASE                         │
├─────────────────────────────────────────────────────────┤
│  6. Render Loop (repeating each frame):                 │
│     ├── update()      - Logic updates                   │
│     ├── prerender()   - Draw backgrounds                │
│     │   └── (children prerender)                        │
│     │       └── (children render)                       │
│     └── render()      - Draw foreground                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   CLEANUP PHASE                         │
├─────────────────────────────────────────────────────────┤
│  7. removeFromUIManager()                               │
│     └── Unregisters from UI system                      │
│         └── Sets removed = true                         │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Construction - `new()`

```lua
function ISUIElement:new(x, y, width, height)
    local o = {}
    setmetatable(o, self)
    self.__index = self

    -- Screen boundary clamping
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
    o.removed = false

    return o
end
```

**Key Points:**
- Creates the Lua table object
- Position is clamped to keep element on screen
- Sets default anchoring to top-left
- `javaObject` does NOT exist yet

**Override Pattern:**
```lua
function MyPanel:new(x, y, width, height)
    local o = ISPanel:new(x, y, width, height)  -- Call parent
    setmetatable(o, self)
    self.__index = self
    
    -- Set your custom properties
    o.myCustomData = {}
    o.backgroundColor = {r=0.1, g=0.1, b=0.1, a=0.9}
    
    return o
end
```

---

## Phase 2: Initialization - `initialise()`

```lua
function ISUIElement:initialise()
    self.children = {}
    self.ID = ISUIElement.IDMax
    ISUIElement.IDMax = ISUIElement.IDMax + 1
end
```

**Key Points:**
- Creates the `children` table for storing child elements
- Assigns a unique ID from a global counter
- Called exactly ONCE per element
- `javaObject` still does NOT exist

**Override Pattern:**
```lua
function MyPanel:initialise()
    ISPanel.initialise(self)  -- ALWAYS call parent first
    
    -- Initialize your custom state
    self.selectedItem = nil
    self.isAnimating = false
end
```

---

## Phase 3: Instantiation - `instantiate()`

```lua
function ISUIElement:instantiate()
    -- Create the Java-side element
    self.javaObject = UIElement.new(self)
    
    -- Sync Lua properties to Java
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
    
    -- Automatically calls createChildren
    self:createChildren()
end
```

**Key Points:**
- Creates the Java `UIElement` that handles actual rendering
- Syncs all Lua properties to the Java object
- Automatically triggers `createChildren()`
- After this, `self.javaObject` is available

**Override Pattern:**
```lua
function MyPanel:instantiate()
    ISPanel.instantiate(self)  -- ALWAYS call parent
    
    -- Do things that require javaObject
    self.javaObject:setUIName("MyCustomPanel")
end
```

---

## Phase 4: Child Creation - `createChildren()`

```lua
function ISUIElement:createChildren()
    -- Empty by default - override in derived classes
end
```

**Key Points:**
- Override this to add child components
- Called automatically by `instantiate()`
- `javaObject` IS available in this phase
- Use `self:addChild()` to add children

**Override Pattern (Most Important):**
```lua
function MyPanel:createChildren()
    ISPanel.createChildren(self)  -- Call parent if it has children
    
    -- Add a label
    self.titleLabel = ISLabel:new(
        10, 10, 25,
        "My Panel Title",
        1, 1, 1, 1,
        UIFont.Medium, true
    )
    self.titleLabel:initialise()
    self:addChild(self.titleLabel)
    
    -- Add a button
    self.okButton = ISButton:new(
        self.width - 90, self.height - 35,
        80, 25,
        "OK",
        self, MyPanel.onOK
    )
    self.okButton:initialise()
    self.okButton:instantiate()
    self.okButton.anchorTop = false
    self.okButton.anchorBottom = true
    self:addChild(self.okButton)
end
```

---

## Phase 5: UI Manager Addition - `addToUIManager()`

```lua
function ISUIElement:addToUIManager()
    if self.javaObject == nil then
        self:instantiate()  -- Auto-instantiate if needed
    end
    UIManager.AddUI(self.javaObject)
end
```

**Key Points:**
- Auto-instantiates if you skipped that step
- Registers the element with the game's UI system
- After this, the element renders and receives events

**Usage:**
```lua
local panel = MyPanel:new(100, 100, 300, 200)
panel:initialise()
panel:addToUIManager()  -- Now visible!
```

---

## Phase 6: Render Loop

Once added to the UI manager, these methods are called every frame:

### update()
```lua
function ISUIElement:update()
    -- Called each frame for logic updates
end
```

**Use for:** Animations, state checks, data updates

```lua
function MyPanel:update()
    -- Animate a rotation
    self.rotation = self.rotation + 0.01
    
    -- Check for changes
    if self.needsRefresh then
        self:refreshData()
        self.needsRefresh = false
    end
end
```

### prerender()
```lua
function ISUIElement:prerender()
    -- Called BEFORE children render
    -- Draw backgrounds, borders here
end
```

**Use for:** Backgrounds, borders, content that should appear behind children

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

### render()
```lua
function ISUIElement:render()
    -- Called AFTER children render
    -- Draw overlays, foreground content here
end
```

**Use for:** Overlays, highlights, content that should appear in front of children

```lua
function MyPanel:render()
    -- Draw highlight over selected item
    if self.selectedItem then
        self:drawRect(0, self.selectedItem.y, self.width, 25,
            0.3, 0.4, 0.6, 1.0)
    end
end
```

---

## Phase 7: Removal - `removeFromUIManager()`

```lua
function ISUIElement:removeFromUIManager()
    if self.javaObject == nil then
        return
    end
    UIManager.RemoveElement(self.javaObject)
    self.removed = true
end
```

**Key Points:**
- Unregisters from UI system
- Sets `removed` flag to true
- Element stops rendering and receiving events

**Usage:**
```lua
function MyPanel:onClose()
    self:removeFromUIManager()
    -- or just hide without removing:
    -- self:setVisible(false)
end
```

---

## Shortcut: Typical Usage Pattern

For most cases, you only need:

```lua
-- Create
local panel = MyPanel:new(100, 100, 300, 200)
panel:initialise()
panel:addToUIManager()  -- instantiate() called automatically

-- Later, to remove:
panel:removeFromUIManager()
```

---

## Child Element Pattern

Children go through a slightly different flow:

```lua
function MyPanel:createChildren()
    -- Create child
    self.myButton = ISButton:new(10, 10, 80, 25, "Click", self, self.onClick)
    
    -- Initialize child
    self.myButton:initialise()
    
    -- Optional: instantiate (addChild will do it if needed)
    self.myButton:instantiate()
    
    -- Add to parent (this registers it)
    self:addChild(self.myButton)
    -- Children do NOT call addToUIManager()
    -- They render as part of their parent
end
```

---

## Common Mistakes

### 1. Forgetting to call parent methods
```lua
-- WRONG
function MyPanel:initialise()
    self.myData = {}  -- Parent never initializes!
end

-- CORRECT
function MyPanel:initialise()
    ISPanel.initialise(self)  -- Call parent FIRST
    self.myData = {}
end
```

### 2. Accessing javaObject too early
```lua
-- WRONG - javaObject doesn't exist in new()
function MyPanel:new(x, y, w, h)
    local o = ISPanel:new(x, y, w, h)
    o.javaObject:setUIName("test")  -- CRASH!
    return o
end

-- CORRECT - wait until createChildren() or later
function MyPanel:createChildren()
    ISPanel.createChildren(self)
    self.javaObject:setUIName("test")  -- Works!
end
```

### 3. Adding children to UI manager
```lua
-- WRONG - children should not be added to UI manager
self.myButton:addToUIManager()

-- CORRECT - just add to parent
self:addChild(self.myButton)
```

---

## Related

- [ISUI Framework Overview](/build-41/modding/ui-framework/isui-overview) - Framework introduction
- [Panels and Containers](/build-41/modding/ui-framework/isui-panels) - ISPanel documentation
- [ISBaseObject Inheritance](/build-41/modding/lua-api/isbaseobject) - The base class system
