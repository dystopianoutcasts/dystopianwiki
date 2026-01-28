---
id: context-menus
slug: context-menus
title: "Adding Right-Click Menu Options"
game: pz
version: build-41
section: modding
category: lua-api
subcategory: null
difficulty: intermediate
tags:
  - context-menu
  - right-click
  - ui
  - iscontextmenu
  - intermediate
excerpt: "Learn how to add custom options to the right-click menus in Project Zomboid - the menus that appear when clicking items or world objects."
table_of_contents:
  - text: "What Are Context Menus?"
    link: "#what-are-context-menus"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Where Does This Go?"
    link: "#where-does-this-go"
  - text: "The Simplest Example"
    link: "#the-simplest-example"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "How Context Menus Work"
    link: "#how-context-menus-work"
  - text: "Two Types of Menus"
    link: "#two-types-of-menus"
  - text: "Making Options Do Things"
    link: "#making-options-do-things"
  - text: "Checking Items Before Showing"
    link: "#checking-items-before-showing"
  - text: "Submenus"
    link: "#submenus"
  - text: "Tooltips"
    link: "#tooltips"
  - text: "Common Patterns"
    link: "#common-patterns"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "What's Next?"
    link: "#whats-next"
next_steps:
  - title: "Timed Actions"
    path: /pz/build-41/modding/lua-api/timed-actions
  - title: "Understanding Events"
    path: /pz/build-41/modding/lua-api/events-overview
  - title: "ISUI Overview"
    path: /pz/build-41/modding/ui-framework/isui-overview
last_updated: 2026-01-28
---

# Adding Right-Click Menu Options

## What Are Context Menus?

We right-click on things constantly in Project Zomboid. Right-click a door and we see "Open", "Barricade", "Destroy". Right-click food in our inventory and we see "Eat", "Craft", "Drop". These popup menus are called **context menus** - they show options that make sense for what we clicked.

Context menus are one of the most common things modders add. Want to let players do something special with a hammer? Add a right-click option. Want to interact with a custom machine? Add a right-click option. Almost every mod that adds new gameplay uses context menus.

When I first tried to add a context menu option, I was intimidated by the code I saw in vanilla files. But here's the secret: the basic pattern is just 5 lines. Everything else is optional customization.

**We'd use context menus when we want to:**
- Add a new action to existing items ("Sharpen" for knives)
- Add interactions with world objects ("Use Workbench")
- Add custom crafting or repair options
- Let players configure mod settings by right-clicking

---

## Prerequisites

Before this article, we should understand:
- [Understanding Events](/pz/build-41/modding/lua-api/events-overview) - How events work
- Basic Lua functions and tables

If we've successfully made an event fire (like OnGameStart), we're ready for context menus.

---

## Where Does This Go?

Context menu code goes in the **client** folder because menus only appear on the player's screen:

```
MyMod/
├── mod.info
└── media/
    └── lua/
        └── client/              ← Context menu code goes here
            └── MyContextMenu.lua
```

**Why client?** Context menus are UI - they exist on our screen, not the server. The server doesn't need to know about our menus.

---

## The Simplest Example

Let's add a "Hello!" option to every item we right-click in our inventory:

```lua
-- The function that runs when our option is clicked
local function onHello(items, player)
    print("Hello from context menu!")
end

-- Add our option when the inventory context menu appears
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    context:addOption("Say Hello", items, onHello, getSpecificPlayer(playerNum))
end)
```

**Line by line:**

| Line | What It Does |
|------|-------------|
| `local function onHello(items, player)` | Our **callback** - runs when the option is clicked |
| `Events.OnFillInventoryObjectContextMenu.Add(...)` | Subscribe to the "menu is appearing" event |
| `context:addOption("Say Hello", ...)` | Add our option to the menu |

The `context` is the menu itself. We're saying "add an option called 'Say Hello' to this menu."

> **Key Takeaway:** The pattern is: (1) Define a callback function, (2) Listen for the menu event, (3) Call `context:addOption()`. That's the whole thing.

---

## Try It Yourself

**Step 1:** Create a file at `MyMod/media/lua/client/TestContextMenu.lua`

```lua
local function onSayHello(items, player)
    local item = items[1]  -- Get the first item
    print("You right-clicked: " .. item:getDisplayName())
end

Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    context:addOption("Say Hello", items, onSayHello, getSpecificPlayer(playerNum))
end)
```

**Step 2:** Start a game with the mod enabled

**Step 3:** Right-click any item in our inventory

**Step 4:** We should see "Say Hello" in the menu

**Step 5:** Click it and check the console for our message

If it worked, we just added our first context menu option! If not, check:
- Is the file in `client/` folder?
- Is the mod enabled?
- Any typos in `Events.OnFillInventoryObjectContextMenu`?

---

## How Context Menus Work

Here's what happens when we right-click something:

```
1. Player right-clicks an item or world object
         ↓
2. Game creates an empty context menu
         ↓
3. Game adds vanilla options (Eat, Drop, etc.)
         ↓
4. Game fires the event: OnFillInventoryObjectContextMenu
         ↓
5. Every mod listening to that event adds their options
         ↓
6. Menu appears with all options
```

We're hooking into step 4 - adding our options after vanilla has added theirs.

> **Key Takeaway:** We don't create the menu - we receive it via the `context` parameter and add our options to it.

---

## Two Types of Menus

There are two different events for two different situations:

### Inventory Items

When we right-click items in our inventory:

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    -- 'items' is what we right-clicked
    -- Could be one item or multiple (if we selected several)
end)
```

### World Objects

When we right-click things in the world (doors, furniture, the ground):

```lua
Events.OnFillWorldObjectContextMenu.Add(function(playerNum, context, worldobjects, test)
    -- 'worldobjects' is what we right-clicked in the world
    -- 'test' is true when the game is just checking if there ARE any options
    
    if test then return true end  -- Tell the game "yes, we have options"
    
    -- Add our options here
end)
```

**The `test` parameter:** For world objects, the game sometimes asks "would there be any options?" without showing the menu. We return `true` to say "yes" and exit early. This is just for performance - if it's confusing, don't worry about it for now.

---

## Making Options Do Things

The `addOption` function takes several parameters:

```lua
context:addOption(
    "Option Text",     -- What the player sees
    targetObject,       -- Gets passed to our callback
    callbackFunction,   -- The function to run
    extraParam1,        -- Optional: also passed to callback
    extraParam2         -- Optional: also passed to callback
)
```

Our callback receives these in order:

```lua
local function myCallback(targetObject, extraParam1, extraParam2)
    -- targetObject is the second argument from addOption
    -- extraParams follow in order
end
```

**Example with player:**

```lua
local function onRepairItem(item, player)
    print(player:getUsername() .. " wants to repair " .. item:getDisplayName())
end

Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    local player = getSpecificPlayer(playerNum)
    local item = items[1]
    
    context:addOption("Repair", item, onRepairItem, player)
end)
```

---

## Checking Items Before Showing

Usually we don't want our option on EVERY item. Let's only show it for specific items:

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    local player = getSpecificPlayer(playerNum)
    
    -- Handle both single items and stacks
    for _, v in ipairs(items) do
        local item = v
        if not instanceof(v, "InventoryItem") then
            item = v.items[1]  -- It's a stack, get the first item
        end
        
        -- Only show for hammers
        if item:getFullType() == "Base.Hammer" then
            context:addOption("Do Special Hammer Thing", item, onHammerAction, player)
        end
    end
end)
```

**Common checks:**

```lua
-- Check by exact type
if item:getFullType() == "Base.Hammer" then

-- Check by category
if item:getCategory() == "Weapon" then

-- Check by display name (not recommended - breaks with translations)
if item:getDisplayName() == "Hammer" then

-- Check for a tag (if the item has one)
if item:hasTag("MyModTag") then

-- Check if it's a specific class
if instanceof(item, "HandWeapon") then
```

> **Key Takeaway:** Loop through items, check each one, and only add options for items that make sense.

---

## Submenus

If we have multiple related options, we can group them in a submenu:

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    local player = getSpecificPlayer(playerNum)
    local item = items[1]
    
    -- Create the parent option
    local parentOption = context:addOption("Crafting Options...")
    
    -- Create a submenu
    local subMenu = ISContextMenu:getNew(context)
    context:addSubMenu(parentOption, subMenu)
    
    -- Add options to the submenu
    subMenu:addOption("Make Weapon", item, makeWeapon, player)
    subMenu:addOption("Make Tool", item, makeTool, player)
    subMenu:addOption("Make Armor", item, makeArmor, player)
end)
```

This creates a "Crafting Options..." option that expands into three sub-options.

---

## Tooltips

We can add helpful text that appears when hovering over an option:

```lua
local option = context:addOption("Repair", item, onRepair, player)

-- Create a tooltip
local tooltip = ISInventoryPaneContextMenu.addToolTip()
tooltip:setName("Repair Item")
tooltip.description = "Fix this item using repair materials. \n Requires Maintenance skill 2."

-- Attach tooltip to option
option.toolTip = tooltip
```

**Tooltip formatting:**
- `\n` creates a new line
- `<RGB:1,0,0>` changes text color (red)
- `<RGB:0,1,0>` changes text color (green)

```lua
tooltip.description = "This will " 
    .. " <RGB:0,1,0> repair " 
    .. " <RGB:1,1,1> the item."
```

---

## Common Patterns

### Disabled Option with Reason

Show an option but grey it out with an explanation:

```lua
local option = context:addOption("Repair", item, onRepair, player)

local skill = player:getPerkLevel(Perks.Maintenance)
if skill < 3 then
    option.notAvailable = true
    local tooltip = ISInventoryPaneContextMenu.addToolTip()
    tooltip.description = "Requires Maintenance 3 \n You have: " .. skill
    option.toolTip = tooltip
end
```

### Toggle Option with Checkmark

```lua
local isEnabled = player:getModData().myModEnabled or false
local option = context:addOption("Enable My Feature", player, toggleFeature)
context:setOptionChecked(option, isEnabled)
```

### World Object Interaction

```lua
Events.OnFillWorldObjectContextMenu.Add(function(playerNum, context, worldobjects, test)
    if test then return true end
    
    local player = getSpecificPlayer(playerNum)
    
    for _, obj in ipairs(worldobjects) do
        -- Check if it's a door
        if instanceof(obj, "IsoDoor") then
            context:addOption("Knock on Door", obj, onKnock, player)
        end
        
        -- Check if it's furniture we can search
        if obj:getContainer() then
            context:addOption("Search Thoroughly", obj, onSearch, player)
        end
    end
end)
```

---

## Common Mistakes

### Mistake: Forgetting to handle item stacks

```lua
-- WRONG: Crashes when right-clicking a stack
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    local item = items[1]  -- Might not be an InventoryItem!
    print(item:getDisplayName())  -- CRASH
end)

-- RIGHT: Handle both single items and stacks
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    for _, v in ipairs(items) do
        local item = instanceof(v, "InventoryItem") and v or v.items[1]
        print(item:getDisplayName())  -- Works!
    end
end)
```

**What we'll see:** "attempt to call method 'getDisplayName' (a nil value)" or similar

### Mistake: Forgetting the test parameter for world objects

```lua
-- WRONG: Missing test check
Events.OnFillWorldObjectContextMenu.Add(function(playerNum, context, worldobjects, test)
    -- Heavy code runs even when game is just testing
end)

-- RIGHT: Exit early on test
Events.OnFillWorldObjectContextMenu.Add(function(playerNum, context, worldobjects, test)
    if test then return true end
    -- Now do our actual work
end)
```

**What we'll see:** Slight performance issues, code runs twice

### Mistake: Wrong callback parameter order

```lua
-- WRONG: Parameters in wrong order
context:addOption("Test", player, myCallback, item)

local function myCallback(item, player)  -- We think item comes first
    item:getDisplayName()  -- CRASH - 'item' is actually player!
end

-- RIGHT: Match the order from addOption
context:addOption("Test", item, myCallback, player)

local function myCallback(item, player)  -- item is target, player is extra param
    item:getDisplayName()  -- Works!
end
```

**What we'll see:** Wrong object type errors, "attempt to call method that doesn't exist"

### Mistake: Option appears for wrong items

```lua
-- WRONG: Shows for ALL items
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    context:addOption("Sharpen", items[1], onSharpen)  -- Sharpen a banana?
end)

-- RIGHT: Check the item first
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    local item = items[1]
    if instanceof(item, "InventoryItem") and item:hasTag("Blade") then
        context:addOption("Sharpen", item, onSharpen)
    end
end)
```

---

## Key Takeaways

1. **Two events:** `OnFillInventoryObjectContextMenu` for items, `OnFillWorldObjectContextMenu` for world objects
2. **The basic pattern:** Define callback, listen for event, call `context:addOption()`
3. **Always check what we clicked:** Don't show "Sharpen" on bananas
4. **Handle stacks:** Items might be single or stacked - check with `instanceof`
5. **World objects have a `test` parameter:** Return `true` and exit early
6. **Submenus for grouping:** `ISContextMenu:getNew(context)` then `context:addSubMenu()`
7. **Tooltips for explanation:** Especially for disabled options

Context menus are how we let players use our mod's features. Once we're comfortable with them, we can add interactions to almost anything in the game.

---

## What's Next?

- [Timed Actions](/pz/build-41/modding/lua-api/timed-actions) - Make options trigger progress bar actions
- [Understanding Events](/pz/build-41/modding/lua-api/events-overview) - Review event basics
- [ISUI Overview](/pz/build-41/modding/ui-framework/isui-overview) - Create custom UI panels
