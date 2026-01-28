---
id: ui-framework-isui-lifecycle
slug: isui-lifecycle
title: "Understanding the UI Lifecycle"
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
  - createchildren
  - initialise
excerpt: "Learn how UI elements are born, live, and die in Project Zomboid. Understanding the lifecycle prevents most \"my UI doesn't work\" problems."
table_of_contents:
  - text: "Why Lifecycle Matters"
    link: "#why-lifecycle-matters"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Where Does This Go?"
    link: "#where-does-this-go"
  - text: "The Simple Version"
    link: "#the-simple-version"
  - text: "The Five Steps"
    link: "#the-five-steps"
  - text: "Step 1: new() - Create the Object"
    link: "#step-1-new"
  - text: "Step 2: initialise() - Set Up Internals"
    link: "#step-2-initialise"
  - text: "Step 3: instantiate() - Connect to Java"
    link: "#step-3-instantiate"
  - text: "Step 4: createChildren() - Add Buttons and Labels"
    link: "#step-4-createchildren"
  - text: "Step 5: addToUIManager() - Show It"
    link: "#step-5-addtouimanager"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "The Render Loop"
    link: "#the-render-loop"
  - text: "Removing UI Elements"
    link: "#removing-ui-elements"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "What's Next?"
    link: "#whats-next"
next_steps:
  - title: "Creating Buttons"
    path: /pz/build-41/modding/ui-framework/isui-buttons
  - title: "Collapsable Windows"
    path: /pz/build-41/modding/ui-framework/isui-windows
  - title: "ISBaseObject Pattern"
    path: /pz/build-41/modding/lua-api/isbaseobject
last_updated: 2026-01-28
---

# Understanding the UI Lifecycle

## Why Lifecycle Matters

We press `I` and our inventory opens. We click the X and it closes. Simple, right?

But behind the scenes, that inventory window goes through several steps: it's created, set up, connected to the game's rendering system, and finally displayed. When we close it, it goes through cleanup.

**This matters because** most "my UI doesn't work" problems happen when we skip a step or do things in the wrong order. Our panel might:

- Exist but be invisible (forgot to add to UI manager)
- Crash when clicked (buttons not properly initialized)
- Have missing children (createChildren never ran)
- Keep running after closed (forgot to remove)

When I first looked at PZ's UI code, I thought I'd need to memorize a dozen different methods. But here's the good news: there's really just one pattern, and once we see it, everything clicks into place.

Understanding the lifecycle means we'll know *why* things break and *how* to fix them.

**We'd want to learn this when:**
- Our UI shows up but buttons don't work
- We want to add elements dynamically after creation
- We're overriding built-in UI and it crashes
- We need to understand error messages about "nil javaObject"

---

## Prerequisites

Before this article, we should understand:
- [What is ISUI?](/pz/build-41/modding/ui-framework/isui-overview) - Basic concepts
- [Creating Panels](/pz/build-41/modding/ui-framework/isui-panels) - Our first panel

---

## Where Does This Go?

UI code goes in the **client** folder because it only runs on the player's computer - the server doesn't need to know about our panels and buttons.

```
MyMod/
├── mod.info
└── media/
    └── lua/
        └── client/              ← UI code goes here
            └── MyPanelMod.lua
```

**Why "client"?** UI is visual - it exists on our screen, not the server. If we put UI code in `shared/` or `server/`, it will either error or just never run.

---

## The Simple Version

For 90% of our mods, here's all we need to know:

```lua
-- Step 1 & 2: Create and initialize
local panel = ISPanel:new(100, 100, 300, 200)
panel:initialise()

-- Step 3, 4, 5: Connect, add children, show
panel:addToUIManager()  -- Does steps 3-5 automatically!

-- Later, to close:
panel:removeFromUIManager()
```

**That's it!** The game handles the complex stuff. But if we're building custom panels with buttons, or overriding existing UI, we need to understand what each step does.

If this seems too easy - good! It IS easy for basic panels. The details below are for when things don't work and we need to debug, or when we're doing something more advanced.

---

## The Five Steps

Every UI element goes through these phases:

```
1. new()          → Creates the Lua object (size, position)
2. initialise()   → Sets up internal tables and ID
3. instantiate()  → Creates the Java object that actually draws
4. createChildren() → Adds buttons, labels, etc. inside
5. addToUIManager() → Shows it on screen
```

This might look like a lot to remember. Don't worry - we don't need to memorize this. Let's use a metaphor that makes it stick.

Think of it like building a house:
1. **new()** = Draw the blueprint (dimensions)
2. **initialise()** = Pour the foundation (internal setup)
3. **instantiate()** = Build the frame (connect to the rendering engine)
4. **createChildren()** = Add furniture (buttons, labels)
5. **addToUIManager()** = Move in! (now we can see and use it)

> **Key Takeaway:** The pattern is always the same: create → set up → connect → add children → show. If something breaks, it's usually because we skipped a step or did them out of order.

---

## Step 1: new() - Create the Object

This is where we set position and size:

```lua
local panel = ISPanel:new(100, 100, 300, 200)
--                       x    y   width height
```

**What happens:**
- Creates a Lua table with our dimensions
- Sets default properties (anchoring, visibility)
- Clamps position so it doesn't go off-screen

**What DOESN'T exist yet:**
- No `javaObject` (the thing that actually draws)
- No `children` table (can't add buttons yet)
- Nothing visible on screen

**When we override `new()`:**

```lua
function MyPanel:new(x, y)
    local width = 300
    local height = 200

    -- ALWAYS call the parent first
    local o = ISPanel:new(x, y, width, height)
    setmetatable(o, self)
    self.__index = self

    -- Set our custom properties here
    o.backgroundColor = {r=0.1, g=0.1, b=0.1, a=0.9}
    o.myCustomData = {}

    return o
end
```

---

## Step 2: initialise() - Set Up Internals

```lua
panel:initialise()
```

**What happens:**
- Creates the `children` table (now we CAN add children)
- Assigns a unique ID to this element
- Runs ONCE per element

**What STILL doesn't exist:**
- No `javaObject` yet - we can't draw anything

**When we override `initialise()`:**

```lua
function MyPanel:initialise()
    -- ALWAYS call parent FIRST
    ISPanel.initialise(self)

    -- Set up our custom state
    self.selectedItem = nil
    self.isAnimating = false
end
```

**Why call the parent first?** Because the parent creates `self.children`. If we don't call it, adding children will crash. I learned this the hard way - spent an hour debugging a "nil children" error before realizing I'd forgotten that one line.

---

## Step 3: instantiate() - Connect to Java

```lua
panel:instantiate()
```

Here's where things get a bit technical. The word **instantiate** means "to create an instance of" - in this case, we're creating the actual Java object that PZ's rendering engine uses to draw our panel on screen.

**What happens:**
- Creates the `javaObject` - the actual Java UI element that draws on screen
- Syncs our Lua properties (size, position) to Java
- Automatically calls `createChildren()`

**After this step:**
- `self.javaObject` exists and we can use it
- Our children are created

**Good news:** We rarely call this directly. `addToUIManager()` calls it for us.

---

## Step 4: createChildren() - Add Buttons and Labels

This is where we add things *inside* our panel:

```lua
function MyPanel:createChildren()
    -- ALWAYS call parent first (if it has children)
    ISPanel.createChildren(self)

    -- Add a title label
    self.title = ISLabel:new(
        10, 10, 25,           -- x, y, height
        "My Panel",           -- text
        1, 1, 1, 1,           -- RGBA (white)
        UIFont.Medium, true   -- font, left-aligned
    )
    self.title:initialise()
    self:addChild(self.title)

    -- Add a close button
    -- The last two parameters are the "callback" - that's programmer-speak
    -- for "the function to call back when the button is clicked"
    self.closeBtn = ISButton:new(
        self.width - 90,      -- x (near right edge)
        self.height - 35,     -- y (near bottom)
        80, 25,               -- width, height
        "Close",              -- text
        self,                 -- target (who receives the callback)
        MyPanel.onClose       -- callback function (runs when clicked)
    )
    self.closeBtn:initialise()
    self.closeBtn:instantiate()  -- Required for buttons!
    self:addChild(self.closeBtn)
end
```

**Key points:**
- Children are positioned relative to the parent (10, 10 = inside the panel)
- Each child needs `initialise()` called
- Buttons specifically need `instantiate()` before `addChild()`
- Use `self:addChild()` - NOT `addToUIManager()`

**Why not `addToUIManager()` for children?** Children render as part of their parent. They don't need to be registered separately. This confused me at first too - it feels like everything should go to the UI manager, but children are different.

---

## Step 5: addToUIManager() - Show It

```lua
panel:addToUIManager()
```

**What happens:**
- If `instantiate()` wasn't called yet, it calls it automatically
- Registers the element with the game's UI system
- The element is now visible and receives mouse/keyboard events

**Typical usage:**

```lua
local panel = MyPanel:new(100, 100)
panel:initialise()
panel:addToUIManager()  -- Steps 3-5 happen here
```

> **Key Takeaway:** For basic panels, we only need three lines: `new()`, `initialise()`, `addToUIManager()`. The game handles the rest. We only dig into the individual steps when debugging or doing advanced customization.

---

## Try It Yourself

Let's verify we understand the lifecycle by creating a simple panel with a button:

**Step 1:** Create a file at `MyMod/media/lua/client/TestLifecycle.lua`

```lua
require "ISUI/ISPanel"
require "ISUI/ISButton"
require "ISUI/ISLabel"

TestPanel = ISPanel:derive("TestPanel")

function TestPanel:new(x, y)
    local o = ISPanel:new(x, y, 300, 200)
    setmetatable(o, self)
    self.__index = self
    o.backgroundColor = {r=0.1, g=0.1, b=0.1, a=0.9}
    return o
end

function TestPanel:createChildren()
    ISPanel.createChildren(self)

    self.title = ISLabel:new(10, 10, 25, "Lifecycle Test", 1, 1, 1, 1, UIFont.Medium, true)
    self.title:initialise()
    self:addChild(self.title)

    self.testBtn = ISButton:new(10, 50, 100, 25, "Click Me", self, TestPanel.onTestClick)
    self.testBtn:initialise()
    self.testBtn:instantiate()
    self:addChild(self.testBtn)

    self.closeBtn = ISButton:new(self.width - 90, self.height - 35, 80, 25, "Close", self, TestPanel.onClose)
    self.closeBtn:initialise()
    self.closeBtn:instantiate()
    self:addChild(self.closeBtn)
end

function TestPanel:onTestClick()
    print("Button clicked! Lifecycle works!")
end

function TestPanel:onClose()
    self:setVisible(false)
    self:removeFromUIManager()
end

-- Add a key binding to open it (press Home key)
Events.OnKeyPressed.Add(function(key)
    if key == Keyboard.KEY_HOME then
        local panel = TestPanel:new(100, 100)
        panel:initialise()
        panel:addToUIManager()
    end
end)
```

**Step 2:** Load the game with your mod enabled

**Step 3:** Press the `Home` key - our panel should appear

**Step 4:** Click "Click Me" - check the console for "Button clicked! Lifecycle works!"

**Step 5:** Click "Close" - the panel should disappear

If all five steps worked, we've got the lifecycle down! If something didn't work, check the Common Mistakes section below.

---

## The Render Loop

Once our UI is on screen, three methods run every frame. This is where our UI comes alive.

### update() - Logic

```lua
function MyPanel:update()
    -- Check for state changes, run animations
    if self.needsRefresh then
        self:refreshData()
        self.needsRefresh = false
    end
end
```

**Use for:** Timers, animations, checking if data changed

### prerender() - Draw Background

```lua
function MyPanel:prerender()
    -- Draw background first (children draw on top)
    self:drawRect(0, 0, self.width, self.height,
        self.backgroundColor.a,
        self.backgroundColor.r,
        self.backgroundColor.g,
        self.backgroundColor.b)
end
```

**Use for:** Backgrounds, borders - anything that should appear *behind* children

### render() - Draw Foreground

```lua
function MyPanel:render()
    -- Draw on top of children
    if self.highlightedItem then
        self:drawRect(0, self.highlightedItem.y, self.width, 25,
            0.3, 0.4, 0.6, 1.0)  -- Selection highlight
    end
end
```

**Use for:** Overlays, highlights - anything that should appear *in front of* children

**The order:**
1. `update()` runs
2. `prerender()` draws background
3. Children's `prerender()` and `render()` run
4. `render()` draws foreground

> **Key Takeaway:** `prerender()` = behind children, `render()` = in front of children. Use `update()` for logic, not drawing.

---

## Removing UI Elements

```lua
function MyPanel:onClose()
    self:setVisible(false)       -- Hide it
    self:removeFromUIManager()   -- Remove from game's UI system
end
```

**What happens:**
- Element stops rendering
- Stops receiving mouse/keyboard events
- Sets `self.removed = true`

**Hide vs Remove:**
- `setVisible(false)` - Hides but keeps in memory (can show again)
- `removeFromUIManager()` - Fully removes (need to recreate to show again)

Which should we use? If the panel might be reopened soon (like a toggle), use `setVisible()`. If it's truly closed (like a one-time dialog), use `removeFromUIManager()` to free up memory.

---

## Common Mistakes

### Mistake: Forgot to call parent in initialise()

```lua
-- WRONG: Children table never created
function MyPanel:initialise()
    self.myData = {}
end

-- RIGHT: Call parent first
function MyPanel:initialise()
    ISPanel.initialise(self)  -- Creates self.children
    self.myData = {}
end
```

**What we'll see:** `attempt to index nil value (field 'children')` crash

### Mistake: Using javaObject in new()

```lua
-- WRONG: javaObject doesn't exist yet
function MyPanel:new(x, y, w, h)
    local o = ISPanel:new(x, y, w, h)
    o.javaObject:setUIName("test")  -- CRASH!
    return o
end

-- RIGHT: Wait until createChildren()
function MyPanel:createChildren()
    ISPanel.createChildren(self)
    self.javaObject:setUIName("test")  -- Works!
end
```

**What we'll see:** `attempt to index nil value (field 'javaObject')` crash

### Mistake: Calling addToUIManager() on children

```lua
-- WRONG: Children don't go in UI manager
self.myButton:addToUIManager()

-- RIGHT: Add to parent
self:addChild(self.myButton)
```

**What we'll see:** Button appears but doesn't move with panel, or duplicates weirdly

### Mistake: Forgetting instantiate() for buttons

```lua
-- WRONG: Button won't respond to clicks
self.btn = ISButton:new(10, 10, 80, 25, "Click", self, self.onClick)
self.btn:initialise()
self:addChild(self.btn)

-- RIGHT: Buttons need instantiate()
self.btn = ISButton:new(10, 10, 80, 25, "Click", self, self.onClick)
self.btn:initialise()
self.btn:instantiate()  -- Required for buttons!
self:addChild(self.btn)
```

**What we'll see:** Button appears but never responds to clicks. This one is frustrating because there's no error - it just silently doesn't work.

---

## Key Takeaways

1. **The basic pattern is simple:** `new()` → `initialise()` → `addToUIManager()`
2. **`addToUIManager()` is smart** - It calls `instantiate()` and `createChildren()` for us
3. **Override `createChildren()` to add buttons and labels** - Not `new()` or `initialise()`
4. **Always call the parent method first** - `ISPanel.initialise(self)` before our code
5. **`javaObject` only exists after `instantiate()`** - Don't try to use it in `new()`
6. **Children use `addChild()`, not `addToUIManager()`** - They're part of the parent
7. **Buttons need that extra `instantiate()` call** - Labels don't, buttons do

We don't need to memorize all of this. Bookmark this page and come back when something doesn't work - the Common Mistakes section will probably have our answer.

---

## What's Next?

- [Creating Buttons](/pz/build-41/modding/ui-framework/isui-buttons) - Add clickable buttons with callbacks
- [Collapsable Windows](/pz/build-41/modding/ui-framework/isui-windows) - Draggable windows with title bars
- [ISBaseObject Pattern](/pz/build-41/modding/lua-api/isbaseobject) - How Lua inheritance works in PZ
