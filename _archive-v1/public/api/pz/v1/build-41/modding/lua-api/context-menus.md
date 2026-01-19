---
id: context-menus
slug: context-menus
title: Context Menu System
excerpt: The context menu system is the primary way players interact with the game world and inventory. When you right-click on objects in the world or items in your inventory, these menus appear with...
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
last_updated: 2026-01-10
---
# Context Menu System

## Overview

The context menu system is the primary way players interact with the game world and inventory. When you right-click on objects in the world or items in your inventory, these menus appear with available actions.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Right-Click                          │
│  (World object or Inventory item)                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Event Triggered                           │
│  OnFillWorldObjectContextMenu / OnFillInventoryObjectContext │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            ISContextMenu.get(player, x, y)                   │
│  Creates/reuses context menu UI at click position            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Option Population                              │
│  - Vanilla code adds default options                         │
│  - Event handlers add mod options                            │
│  - context:addOption(name, target, callback, params...)      │
└─────────────────────────────────────────────────────────────┘
```

### Location

```
media/lua/client/ISUI/ISContextMenu.lua             -- Base class
media/lua/client/ISUI/ISWorldObjectContextMenu.lua  -- World objects
media/lua/client/ISUI/ISInventoryPaneContextMenu.lua -- Inventory items
```

---

## Context Menu Events

### World Object Context Menu

Fires when right-clicking on objects in the world:

```lua
-- Fires AFTER vanilla options are added (most common)
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    -- player: player index (0-3)
    -- context: ISContextMenu object
    -- worldobjects: table of IsoObject
    -- test: boolean (true if testing menu visibility)
    
    if test then return true end  -- Early return for visibility test
    
    local playerObj = getSpecificPlayer(player)
    
    for _, obj in ipairs(worldobjects) do
        if instanceof(obj, "IsoThumpable") then
            context:addOption("My Action", obj, myCallback, playerObj)
        end
    end
end)
```

### Pre-Fill Event

Fires BEFORE vanilla options are added:

```lua
Events.OnPreFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    -- Add options at the top of the menu
end)
```

### Inventory Context Menu

Fires when right-clicking on inventory items:

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(player, context, items)
    -- player: player index (0-3)
    -- context: ISContextMenu object
    -- items: table of InventoryItem or {items = {InventoryItem, ...}}
    
    local playerObj = getSpecificPlayer(player)
    
    -- Handle both single items and stacks
    for _, v in ipairs(items) do
        local item = instanceof(v, "InventoryItem") and v or v.items[1]
        
        if item:getFullType() == "Base.Hammer" then
            context:addOption("Special Hammer Action", item, myCallback, playerObj)
        end
    end
end)
```

---

## ISContextMenu API

### Getting a Context Menu

```lua
-- Get or create the player's context menu
local context = ISContextMenu.get(player, x, y)

-- Create a submenu
local subMenu = ISContextMenu:getNew(parentContext)
```

### Adding Options

```lua
-- Basic option
local option = context:addOption(
    name,     -- Display text (string)
    target,   -- Target object for callback
    onSelect, -- Callback function
    param1, param2, param3  -- Up to 10 parameters
)

-- Callback receives target first, then params
function onSelect(target, param1, param2, param3)
    -- target is the second argument from addOption
    -- params follow in order
end
```

### Option Properties

```lua
local option = context:addOption("My Option", player, myCallback)

-- Add icon
option.iconTexture = getTexture("media/ui/myicon.png")

-- Mark as unavailable (greyed out but visible)
option.notAvailable = true

-- Add checkmark
context:setOptionChecked(option, true)
```

### Other Methods

```lua
-- Add option at top of menu
context:addOptionOnTop(name, target, onSelect, ...)

-- Insert after specific option
context:insertOptionAfter("Existing Option", "New Option", target, onSelect)

-- Insert before specific option
context:insertOptionBefore("Existing Option", "New Option", target, onSelect)

-- Remove option by name
context:removeOptionByName("Option Name")

-- Get option by name
local option = context:getOptionFromName("Option Name")

-- Check if menu is empty
if context:isEmpty() then ... end

-- Clear all options
context:clear()
```

### Submenus

```lua
-- Create submenu
local subMenu = ISContextMenu:getNew(context)

-- Add options to submenu
subMenu:addOption("Sub Option 1", target, callback1)
subMenu:addOption("Sub Option 2", target, callback2)

-- Add parent option that opens submenu
local option = context:addOption("More Options...")
context:addSubMenu(option, subMenu)
```

---

## Tooltips

### Creating Tooltips

```lua
-- Get a tooltip from the pool
local tooltip = ISWorldObjectContextMenu.addToolTip()
-- or for inventory:
local tooltip = ISInventoryPaneContextMenu.addToolTip()

-- Configure tooltip
tooltip:setName("Action Name")
tooltip.description = "Description text here"

-- Assign to option
option.toolTip = tooltip
```

### Tooltip Formatting

```lua
-- Multi-line
tooltip.description = "Line 1 \n Line 2"

-- Colored text using RGB tags
local green = " <RGB:0,1,0> "
local red = " <RGB:1,0,0> "
local white = " <RGB:1,1,1> "

tooltip.description = green .. "Good!" .. white .. " Normal " .. red .. "Bad!"

-- Use game colors
local goodColor = getCore():getGoodHighlitedColor()
local ghs = " <RGB:" .. goodColor:getR() .. "," 
         .. goodColor:getG() .. "," 
         .. goodColor:getB() .. "> "
```

---

## Common Patterns

### World Object with Skill Check

```lua
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    if test then return true end
    
    local playerObj = getSpecificPlayer(player)
    
    for _, obj in ipairs(worldobjects) do
        if instanceof(obj, "IsoThumpable") then
            local option = context:addOption("Repair", obj, onRepair, playerObj)
            
            -- Check skill requirement
            local carpentry = playerObj:getPerkLevel(Perks.Woodwork)
            if carpentry < 3 then
                option.notAvailable = true
                local tooltip = ISWorldObjectContextMenu.addToolTip()
                tooltip.description = "Requires Carpentry 3 (you have " .. carpentry .. ")"
                option.toolTip = tooltip
            end
        end
    end
end)

function onRepair(obj, playerObj)
    -- Walk to object then perform action
    if luautils.walkAdj(playerObj, obj:getSquare()) then
        ISTimedActionQueue.add(ISRepairAction:new(playerObj, obj, 100))
    end
end
```

### Inventory Item with Submenu

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(player, context, items)
    local playerObj = getSpecificPlayer(player)
    
    for _, v in ipairs(items) do
        local item = instanceof(v, "InventoryItem") and v or v.items[1]
        
        if item:hasTag("Craftable") then
            -- Main option with submenu
            local mainOption = context:addOption("Craft With...")
            local subMenu = ISContextMenu:getNew(context)
            context:addSubMenu(mainOption, subMenu)
            
            -- Add craft options
            subMenu:addOption("Make Weapon", item, craftWeapon, playerObj)
            subMenu:addOption("Make Tool", item, craftTool, playerObj)
            subMenu:addOption("Make Armor", item, craftArmor, playerObj)
        end
    end
end)
```

### Dynamic Options Based on State

```lua
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    if test then return true end
    
    local playerObj = getSpecificPlayer(player)
    
    for _, obj in ipairs(worldobjects) do
        local modData = obj:getModData()
        
        if modData.myMod then
            if modData.myMod.isActive then
                -- Show deactivate option
                context:addOption("Deactivate", obj, onDeactivate, playerObj)
            else
                -- Show activate option
                context:addOption("Activate", obj, onActivate, playerObj)
            end
            
            -- Show settings submenu
            local settingsOpt = context:addOption("Settings...")
            local settingsMenu = ISContextMenu:getNew(context)
            context:addSubMenu(settingsOpt, settingsMenu)
            
            -- Toggle options with checkmarks
            local opt1 = settingsMenu:addOption("Auto-run", obj, toggleAutoRun, playerObj)
            context:setOptionChecked(opt1, modData.myMod.autoRun)
            
            local opt2 = settingsMenu:addOption("Silent Mode", obj, toggleSilent, playerObj)
            context:setOptionChecked(opt2, modData.myMod.silent)
        end
    end
end)
```

### Timed Action from Context Menu

```lua
-- Context menu callback
function onUseWorkbench(obj, playerObj)
    -- Walk to the object first
    if luautils.walkAdj(playerObj, obj:getSquare()) then
        -- Queue the timed action
        ISTimedActionQueue.add(
            ISMyWorkbenchAction:new(playerObj, obj, 100)
        )
    end
end

-- The timed action class
ISMyWorkbenchAction = ISBaseTimedAction:derive("ISMyWorkbenchAction")

function ISMyWorkbenchAction:new(character, workbench, time)
    local o = ISBaseTimedAction.new(self, character)
    o.workbench = workbench
    o.maxTime = time
    return o
end

function ISMyWorkbenchAction:isValid()
    return self.character:getSquare():DistToProper(self.workbench:getSquare()) < 2
end

function ISMyWorkbenchAction:perform()
    -- Action complete
    print("Used workbench!")
    ISBaseTimedAction.perform(self)
end
```

---

## Related

- [Events Overview](/build-41/modding/lua-api/events-overview) - Introduction to events
- [Timed Actions](/build-41/modding/lua-api/timed-actions) - ISBaseTimedAction system
- [ISUI Overview](/build-41/modding/ui-framework/isui-overview) - UI framework basics 