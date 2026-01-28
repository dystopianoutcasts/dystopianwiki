---
id: lua-api-timed-actions
slug: timed-actions
title: "Creating Progress Bar Actions"
game: pz
version: build-41
section: modding
category: lua-api
subcategory: null
difficulty: intermediate
tags:
  - timed-actions
  - progress-bar
  - gameplay
  - lua
  - api
  - intermediate
excerpt: "Learn how to create custom progress bar actions in Project Zomboid - the system behind bandaging, crafting, eating, and every action that takes time."
table_of_contents:
  - text: "What Are Timed Actions?"
    link: "#what-are-timed-actions"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Where Does This Go?"
    link: "#where-does-this-go"
  - text: "The Simplest Example"
    link: "#the-simplest-example"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "How Timed Actions Work"
    link: "#how-timed-actions-work"
  - text: "The Lifecycle"
    link: "#the-lifecycle"
  - text: "Building a Real Action"
    link: "#building-a-real-action"
  - text: "Common Properties"
    link: "#common-properties"
  - text: "Queueing Actions"
    link: "#queueing-actions"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "What's Next?"
    link: "#whats-next"
next_steps:
  - title: "Context Menus"
    path: /pz/build-41/modding/lua-api/context-menus
  - title: "Events Reference"
    path: /pz/build-41/modding/reference/events
  - title: "ISUI Overview"
    path: /pz/build-41/modding/ui-framework/isui-overview
last_updated: 2026-01-28
---

# Creating Progress Bar Actions

## What Are Timed Actions?

We've all seen that progress bar in Project Zomboid. When we bandage a wound, craft a plank, eat an apple, or read a skill book - there's a bar that fills up while our character does the thing. That's a **TimedAction**.

TimedActions are the backbone of player interactions in PZ. Almost anything the player does that takes time uses this system. When we want our mod to add actions that take time (with a progress bar), we create a custom TimedAction.

**We'd use TimedActions when we want to:**
- Add a new crafting action with a progress bar
- Create a custom interaction (like "examine" or "repair")
- Make the player wait while something happens
- Show visual feedback that an action is in progress

When I first looked at TimedAction code in vanilla files, I was overwhelmed by all the methods. But here's the thing: most of them are optional. The core pattern is simpler than it looks.

---

## Prerequisites

Before this article, we should understand:
- Basic Lua syntax (functions, tables)
- How events work in PZ
- How to create a mod folder with mod.info

If we've added a right-click menu option before, we're ready for this.

---

## Where Does This Go?

TimedAction code goes in the **client** folder because actions are visual things that happen on the player's screen:

```
MyMod/
├── mod.info
└── media/
    └── lua/
        └── client/                    ← Our actions go here
            └── TimedActions/          ← Convention: put actions in a subfolder
                └── MyCustomAction.lua
```

**Why client?** The progress bar is a UI element that only the local player sees. Even in multiplayer, each player's progress bars are handled on their own client.

---

## The Simplest Example

Let's create the absolute minimum TimedAction that works:

```lua
require "TimedActions/ISBaseTimedAction"

MySimpleAction = ISBaseTimedAction:derive("MySimpleAction")

function MySimpleAction:perform()
    ISBaseTimedAction.perform(self)
    print("Action completed!")
end

function MySimpleAction:new(character)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character
    o.maxTime = 100  -- About 3 seconds
    return o
end
```

**Line by line:**

| Line | What It Does |
|------|-------------|
| `require "TimedActions/ISBaseTimedAction"` | Loads the base class we inherit from |
| `MySimpleAction = ISBaseTimedAction:derive("MySimpleAction")` | Creates our action class by inheriting from the base |
| `function MySimpleAction:perform()` | What happens when the bar fills up |
| `ISBaseTimedAction.perform(self)` | **Critical** - tells the game the action is done |
| `print("Action completed!")` | Our custom code runs here |
| `function MySimpleAction:new(character)` | **Constructor** - creates a new instance of our action |
| `o.character = character` | Store the player doing the action |
| `o.maxTime = 100` | How long it takes (in **ticks** - about 30 ticks per second) |

To use this action:

```lua
local player = getPlayer()
ISTimedActionQueue.add(MySimpleAction:new(player))
```

> **Key Takeaway:** A TimedAction needs just two methods: `new()` to set it up and `perform()` to do the thing when it completes. Everything else is optional.

---

## Try It Yourself

**Step 1:** Create a file at `MyMod/media/lua/client/TimedActions/MySimpleAction.lua`

```lua
require "TimedActions/ISBaseTimedAction"

MySimpleAction = ISBaseTimedAction:derive("MySimpleAction")

function MySimpleAction:perform()
    ISBaseTimedAction.perform(self)
    self.character:Say("I did the thing!")
end

function MySimpleAction:new(character)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character
    o.maxTime = 100
    return o
end
```

**Step 2:** Create a way to trigger it. Add this to a separate file `MyMod/media/lua/client/TestAction.lua`:

```lua
require "TimedActions/MySimpleAction"

Events.OnKeyPressed.Add(function(key)
    if key == Keyboard.KEY_F6 then
        local player = getPlayer()
        ISTimedActionQueue.add(MySimpleAction:new(player))
    end
end)
```

**Step 3:** Make sure you have a `mod.info` file:

```
name=My Timed Action Test
id=MyTimedActionTest
description=Testing timed actions
```

**Step 4:** Enable the mod and load a game.

**Step 5:** Press F6. You should see a progress bar, and when it completes, your character says "I did the thing!"

If nothing happens, check:
- Is the mod enabled?
- Are the files in the right folders (`client/TimedActions/`)?
- Check the console for errors (press `~`)

---

## How Timed Actions Work

Here's what happens behind the scenes:

```
1. We create an action:     MyAction:new(player, item)
2. We queue it:             ISTimedActionQueue.add(action)
3. The game checks:         Can this action start? (isValidStart)
4. The game waits:          Does player need to turn? (waitToStart)
5. The game starts:         Setup animations, sounds (start)
6. The game loops:          Update progress bar (update) - every tick
7. The game checks:         Is this still valid? (isValid) - every tick
8. On completion:           Do the thing! (perform)
   OR if cancelled:         Clean up (stop)
```

A **tick** is one game frame - roughly 30 ticks per second. When we set `maxTime = 100`, we're saying "run for about 100 ticks" which is roughly 3 seconds.

> **Key Takeaway:** The game calls methods on our action automatically. We just override the ones we need - usually `new()`, `perform()`, and maybe `isValid()`.

---

## The Lifecycle

This looks like a lot. If we're feeling overwhelmed, that's normal - I remember staring at this list wondering if I had to write all of them. But here's the secret: most are optional with sensible defaults.

| Method | When Called | Required? | Default Behavior |
|--------|-------------|-----------|------------------|
| `new()` | When action is created | **YES** | - |
| `isValidStart()` | Once, before starting | No | Returns true |
| `waitToStart()` | After valid, before start | No | Returns false (no wait) |
| `start()` | Once, when action begins | No | Does nothing |
| `update()` | Every tick while running | No | Does nothing |
| `isValid()` | Every tick while running | No | Returns true |
| `perform()` | Once, when bar fills | **YES** | - |
| `stop()` | If cancelled | No | Resets action queue |

Let's break down when we'd actually use each one:

### new() - Always Required

This is the **constructor** - it creates a new **instance** of our action. (An instance is one specific occurrence of our action, like one specific bandaging, not the concept of bandaging in general.)

```lua
function MyAction:new(character, item)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character
    o.item = item
    o.maxTime = 200
    o.stopOnWalk = true
    return o
end
```

### isValidStart() - Use When You Have Conditions

Checks if the action can begin. Good for verifying items exist, distance is right, etc.

```lua
function MyAction:isValidStart()
    -- Do we still have the item?
    return self.character:getInventory():contains(self.item)
end
```

### start() - Use When You Need Setup

Runs once when the action actually begins. Great for animations and sounds.

```lua
function MyAction:start()
    self:setActionAnim(CharacterActionAnims.Craft)
    self.sound = self.character:playSound("Hammering")
end
```

### update() - Use for Progress Feedback

Runs every tick. Good for updating progress bars or doing gradual effects.

```lua
function MyAction:update()
    self.item:setJobDelta(self:getJobDelta())  -- Update item's progress bar
end
```

### isValid() - Use When Things Can Go Wrong Mid-Action

Called every tick. Return false to cancel the action.

```lua
function MyAction:isValid()
    -- Cancel if item disappeared
    return self.character:getInventory():contains(self.item)
end
```

### perform() - Always Required

The action completed successfully. Do the actual thing here.

```lua
function MyAction:perform()
    ISBaseTimedAction.perform(self)  -- MUST call this!
    
    -- Now do our stuff
    self.item:setCondition(self.item:getCondition() + 10)
    self.character:getXp():AddXP(Perks.Mechanics, 5)
end
```

### stop() - Use When You Need Cleanup

Called if the action is cancelled. Clean up sounds, UI states, etc.

```lua
function MyAction:stop()
    if self.sound then
        self.character:stopOrTriggerSound(self.sound)
    end
    ISBaseTimedAction.stop(self)  -- MUST call this!
end
```

---

## Building a Real Action

Let's build up a real action step by step - a "Sharpen Blade" action.

### Version 1: The Minimum

```lua
require "TimedActions/ISBaseTimedAction"

ISSharpenBlade = ISBaseTimedAction:derive("ISSharpenBlade")

function ISSharpenBlade:perform()
    ISBaseTimedAction.perform(self)
    local condition = self.item:getCondition()
    self.item:setCondition(condition + 10)
end

function ISSharpenBlade:new(character, item)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character
    o.item = item
    o.maxTime = 200
    return o
end
```

This works, but it's bare bones.

### Version 2: Adding Validation

```lua
function ISSharpenBlade:isValidStart()
    -- Need both the weapon and a whetstone
    if not self.character:getInventory():contains(self.item) then
        return false
    end
    if not self.character:getInventory():containsType("Whetstone") then
        return false
    end
    return true
end

function ISSharpenBlade:isValid()
    -- Keep checking during the action
    return self.character:getInventory():contains(self.item)
end
```

### Version 3: Adding Animation and Sound

```lua
function ISSharpenBlade:start()
    self:setActionAnim(CharacterActionAnims.Craft)
    self.sound = self.character:playSound("Sharpening")
    self.item:setJobType(getText("ContextMenu_Sharpen"))
    self.item:setJobDelta(0.0)
end

function ISSharpenBlade:update()
    self.item:setJobDelta(self:getJobDelta())
end

function ISSharpenBlade:stop()
    self.item:setJobDelta(0.0)
    if self.sound then
        self.character:stopOrTriggerSound(self.sound)
    end
    ISBaseTimedAction.stop(self)
end
```

### Version 4: Complete Action

```lua
require "TimedActions/ISBaseTimedAction"

ISSharpenBlade = ISBaseTimedAction:derive("ISSharpenBlade")

function ISSharpenBlade:isValidStart()
    return self.character:getInventory():contains(self.item) and
           self.character:getInventory():containsType("Whetstone")
end

function ISSharpenBlade:isValid()
    return self.character:getInventory():contains(self.item)
end

function ISSharpenBlade:start()
    self:setActionAnim(CharacterActionAnims.Craft)
    self:setOverrideHandModels(self.item, nil)
    self.sound = self.character:playSound("Sharpening")
    self.item:setJobType(getText("ContextMenu_Sharpen"))
    self.item:setJobDelta(0.0)
    self.character:reportEvent("EventCrafting")
end

function ISSharpenBlade:update()
    self.item:setJobDelta(self:getJobDelta())
    self.character:setMetabolicTarget(Metabolics.LightDomestic)
end

function ISSharpenBlade:stop()
    self.item:setJobDelta(0.0)
    if self.sound then
        self.character:stopOrTriggerSound(self.sound)
    end
    ISBaseTimedAction.stop(self)
end

function ISSharpenBlade:perform()
    ISBaseTimedAction.perform(self)
    self.item:setJobDelta(0.0)
    
    -- Calculate repair based on skill
    local skillLevel = self.character:getPerkLevel(Perks.Blade)
    local repairAmount = 10 + (skillLevel * 2)
    
    -- Apply the repair
    local newCondition = math.min(
        self.item:getConditionMax(),
        self.item:getCondition() + repairAmount
    )
    self.item:setCondition(newCondition)
    
    -- Use the whetstone
    local stone = self.character:getInventory():getFirstType("Whetstone")
    stone:Use()
    
    -- Award XP
    self.character:getXp():AddXP(Perks.Blade, 3)
end

function ISSharpenBlade:new(character, item)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character
    o.item = item
    o.stopOnWalk = true
    o.stopOnRun = true
    
    -- Time based on skill (faster with higher skill)
    local skillLevel = character:getPerkLevel(Perks.Blade)
    o.maxTime = 300 - (skillLevel * 20)
    
    return o
end
```

> **Key Takeaway:** Start with the minimum that works (`new` + `perform`), then add methods as you need features. You don't need all of them for every action.

---

## Common Properties

These properties can be set in `new()`:

| Property | Type | What It Does |
|----------|------|-------------|
| `maxTime` | number | Duration in ticks (~30 ticks/second). Use -1 for instant. |
| `stopOnWalk` | boolean | Cancel if player walks |
| `stopOnRun` | boolean | Cancel if player runs |
| `stopOnAim` | boolean | Cancel if player aims (default: true) |
| `ignoreHandsWounds` | boolean | Don't slow down for injured hands |

Example:

```lua
function MyAction:new(character)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character
    o.maxTime = 150           -- About 5 seconds
    o.stopOnWalk = true       -- Cancel if we move
    o.stopOnRun = true        -- Cancel if we run
    o.ignoreHandsWounds = false  -- Injured hands slow us down
    return o
end
```

---

## Queueing Actions

### Adding to the Queue

```lua
-- Add a single action
ISTimedActionQueue.add(MyAction:new(player, item))
```

### Chaining Actions

Want one action to run after another? Use `addAfter`:

```lua
local action1 = WalkToAction:new(player, square)
local action2 = MyAction:new(player, item)

ISTimedActionQueue.add(action1)
action1:addAfter(action2)  -- action2 runs after action1 finishes
```

### Checking If Player Is Busy

```lua
if player:getCurrentAction() then
    print("Player is doing something")
else
    print("Player is idle")
end
```

---

## Common Mistakes

### Mistake: Forgetting to Call Parent in perform()

```lua
-- WRONG: Action never ends!
function MyAction:perform()
    self.item:setCondition(100)
    -- Forgot ISBaseTimedAction.perform(self)
end

-- RIGHT: Always call parent first
function MyAction:perform()
    ISBaseTimedAction.perform(self)  -- This removes action from queue
    self.item:setCondition(100)
end
```

**What we'll see:** The progress bar fills, but nothing happens and the action seems stuck. The player can't do other actions.

### Mistake: Forgetting to Call Parent in stop()

```lua
-- WRONG: Queue gets corrupted
function MyAction:stop()
    if self.sound then
        self.character:stopOrTriggerSound(self.sound)
    end
    -- Forgot ISBaseTimedAction.stop(self)
end

-- RIGHT: Call parent last in stop()
function MyAction:stop()
    if self.sound then
        self.character:stopOrTriggerSound(self.sound)
    end
    ISBaseTimedAction.stop(self)  -- Clean up action queue
end
```

**What we'll see:** Action cancels but player can't start new actions, or weird behavior with subsequent actions.

### Mistake: Not Setting character

```lua
-- WRONG: Missing o.character
function MyAction:new(character, item)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.item = item
    o.maxTime = 100
    return o
end

-- RIGHT: Always set character
function MyAction:new(character, item)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character  -- The base class needs this!
    o.item = item
    o.maxTime = 100
    return o
end
```

**What we'll see:** `attempt to index nil value` error when the action starts.

### Mistake: Confusing Ticks and Seconds

```lua
-- WRONG: maxTime is in ticks, not seconds!
o.maxTime = 5  -- This is 5 ticks = 0.17 seconds (instant!)

-- RIGHT: ~30 ticks per second
o.maxTime = 150  -- About 5 seconds
o.maxTime = 300  -- About 10 seconds
```

**What we'll see:** Action completes instantly instead of showing a progress bar.

---

## Key Takeaways

1. **TimedActions are progress bar actions** - bandaging, crafting, eating all use this system
2. **Only two methods are required:** `new()` to set up and `perform()` to do the thing
3. **Always call the parent methods** - `ISBaseTimedAction.perform(self)` and `ISBaseTimedAction.stop(self)`
4. **maxTime is in ticks** - roughly 30 ticks per second, so `maxTime = 150` is about 5 seconds
5. **Add methods as needed** - start simple, add `isValid`, `start`, `update` when you need them
6. **Put actions in client/TimedActions/** - they're visual, client-side code
7. **Use ISTimedActionQueue.add()** - to queue up the action for the player

---

## What's Next?

- [Context Menus](/pz/build-41/modding/lua-api/context-menus) - Add right-click options that trigger your actions
- [Events Reference](/pz/build-41/modding/reference/events) - Hook into game events to trigger actions automatically
- [ISUI Overview](/pz/build-41/modding/ui-framework/isui-overview) - Create custom UI to complement your actions
