# Context Menu System Anatomy - Complete Reference

**Locations:**
- `media/lua/client/ISUI/ISContextMenu.lua` - Base context menu UI class
- `media/lua/client/ISUI/ISWorldObjectContextMenu.lua` - World object menus
- `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` - Inventory item menus
- `media/lua/client/Context/` - Additional context menu modules

**Purpose:** Complete documentation of the right-click context menu system

---

## Overview

The context menu system is the primary way players interact with the game world and inventory. When you right-click on objects in the world or items in your inventory, these menus appear with available actions.

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Right-Click                              │
│  (World object or Inventory item)                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Event Triggered                               │
│  OnFillWorldObjectContextMenu / OnFillInventoryObjectContextMenu │
│  OnPreFillWorldObjectContextMenu / OnPreFill...                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│            ISContextMenu.get(player, x, y)                       │
│  Creates/reuses context menu UI at click position                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               Option Population                                  │
│  - Vanilla code adds default options                             │
│  - Event handlers add mod options                                │
│  - context:addOption(name, target, callback, params...)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Menu Display                                  │
│  - Renders options                                               │
│  - Handles mouse/joypad input                                    │
│  - Supports submenus                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Context Menu Events

### World Object Context Menu

```lua
-- Fires BEFORE vanilla options are added
Events.OnPreFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    -- player: player number (0-3)
    -- context: ISContextMenu object
    -- worldobjects: ArrayList of IsoObject
    -- test: boolean (true if testing menu visibility)
end)

-- Fires AFTER vanilla options are added (most common)
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    -- Same parameters
end)
```

### Inventory Context Menu

```lua
-- Fires BEFORE vanilla options are added
Events.OnPreFillInventoryObjectContextMenu.Add(function(player, context, items)
    -- player: player number (0-3)
    -- context: ISContextMenu object
    -- items: table of InventoryItem or {items = {InventoryItem, ...}}
end)

-- Fires AFTER vanilla options are added (most common)
Events.OnFillInventoryObjectContextMenu.Add(function(player, context, items)
    -- Same parameters
end)
```

---

## ISContextMenu Class Reference

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
    name,     -- Display text
    target,   -- 'self' for callback (usually worldobject or player)
    onSelect, -- Callback function
    param1, param2, param3, param4, param5,
    param6, param7, param8, param9, param10
)

-- Callback signature
function onSelect(target, param1, param2, ...)
    -- Do something
end
```

### Option Properties

```lua
-- Add option and configure it
local option = context:addOption("My Option", player, myCallback, someParam)

-- Set icon
option.iconTexture = getTexture("media/ui/myicon.png")

-- Mark as unavailable (greyed out)
option.notAvailable = true

-- Add tooltip
option.toolTip = ISWorldObjectContextMenu.addToolTip()
option.toolTip.description = "This is what this option does"

-- Add checkmark
context:setOptionChecked(option, true)
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

### Other Methods

```lua
-- Add option at top of menu
context:addOptionOnTop(name, target, onSelect, ...)

-- Insert after specific option
context:insertOptionAfter("Existing Option", "New Option", target, onSelect, ...)

-- Insert before specific option
context:insertOptionBefore("Existing Option", "New Option", target, onSelect, ...)

-- Remove option by name
context:removeOptionByName("Option Name")

-- Remove last option
context:removeLastOption()

-- Get option by name
local option = context:getOptionFromName("Option Name")

-- Check if menu is empty
if context:isEmpty() then ... end

-- Clear all options
context:clear()

-- Get all option names
local names = context:getMenuOptionNames()  -- returns {name = option, ...}
```

---

## Tooltip System

### Creating Tooltips

```lua
-- Get a tooltip from the pool
local tooltip = ISWorldObjectContextMenu.addToolTip()
-- or
local tooltip = ISInventoryPaneContextMenu.addToolTip()

-- Configure tooltip
tooltip:setName("Action Name")
tooltip.description = "Description text here"

-- Assign to option
option.toolTip = tooltip
```

### Tooltip Formatting

```lua
-- Basic text
tooltip.description = "Simple description"

-- Multi-line
tooltip.description = "Line 1 \n Line 2"

-- Colored text
local ghs = " <RGB:" .. getCore():getGoodHighlitedColor():getR() .. ","
          .. getCore():getGoodHighlitedColor():getG() .. ","
          .. getCore():getGoodHighlitedColor():getB() .. "> "
local bhs = " <RGB:" .. getCore():getBadHighlitedColor():getR() .. ","
          .. getCore():getBadHighlitedColor():getG() .. ","
          .. getCore():getBadHighlitedColor():getB() .. "> "

tooltip.description = ghs .. "Good text" .. " <RGB:1,1,1> Normal text"
```

---

## Common Patterns

### Adding World Object Option

```lua
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    if test then return true end  -- Early return for visibility test

    local playerObj = getSpecificPlayer(player)

    for i = 1, #worldobjects do
        local obj = worldobjects[i]

        -- Check for specific object type
        if instanceof(obj, "IsoThumpable") and obj:getTextureName() == "mymod_object" then
            local option = context:addOption(
                getText("ContextMenu_MyAction"),
                worldobjects,
                ISMyMod.onMyAction,
                playerObj,
                obj
            )

            -- Optional: Add tooltip
            local tooltip = ISWorldObjectContextMenu.addToolTip()
            tooltip.description = getText("Tooltip_MyAction")
            option.toolTip = tooltip

            -- Optional: Disable if conditions not met
            if not ISMyMod.canPerformAction(playerObj, obj) then
                option.notAvailable = true
                tooltip.description = getText("Tooltip_CantPerform")
            end
        end
    end
end)
```

### Adding Inventory Item Option

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(player, context, items)
    local playerObj = getSpecificPlayer(player)

    -- Get the actual item (handle both single item and stack)
    local item = nil
    for i, v in ipairs(items) do
        if instanceof(v, "InventoryItem") then
            item = v
        else
            item = v.items[1]
        end
        break
    end

    if not item then return end

    -- Check item type
    if item:getFullType() == "MyMod.MyItem" then
        context:addOption(
            getText("ContextMenu_UseMyItem"),
            item,
            ISMyMod.onUseItem,
            playerObj
        )
    end

    -- Check item tag
    if item:hasTag("MyTag") then
        context:addOption("Tagged Item Action", item, ISMyMod.onTaggedItem, playerObj)
    end
end)
```

### Submenu with Multiple Options

```lua
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    if test then return true end

    local playerObj = getSpecificPlayer(player)

    -- Check if we should show our menu
    local targetObj = nil
    for _, obj in ipairs(worldobjects) do
        if instanceof(obj, "IsoObject") and obj:hasModData() then
            targetObj = obj
            break
        end
    end

    if not targetObj then return end

    -- Create main option
    local mainOption = context:addOption("My Mod Options", nil, nil)

    -- Create submenu
    local subMenu = ISContextMenu:getNew(context)
    context:addSubMenu(mainOption, subMenu)

    -- Add submenu options
    subMenu:addOption("Option A", targetObj, ISMyMod.optionA, playerObj)
    subMenu:addOption("Option B", targetObj, ISMyMod.optionB, playerObj)
    subMenu:addOption("Option C", targetObj, ISMyMod.optionC, playerObj)

    -- Nested submenu
    local nestedOption = subMenu:addOption("More...")
    local nestedMenu = ISContextMenu:getNew(subMenu)
    subMenu:addSubMenu(nestedOption, nestedMenu)
    nestedMenu:addOption("Nested Option", targetObj, ISMyMod.nested, playerObj)
end)
```

### Conditional Options Based on Skills

```lua
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    if test then return true end

    local playerObj = getSpecificPlayer(player)

    for _, obj in ipairs(worldobjects) do
        if instanceof(obj, "IsoThumpable") then
            local option = context:addOption("Repair", obj, ISRepair.onRepair, playerObj)

            -- Check skill requirement
            local carpentryLevel = playerObj:getPerkLevel(Perks.Woodwork)
            if carpentryLevel < 3 then
                option.notAvailable = true
                local tooltip = ISWorldObjectContextMenu.addToolTip()
                tooltip.description = "Requires Carpentry 3 (you have " .. carpentryLevel .. ")"
                option.toolTip = tooltip
            end
        end
    end
end)
```

### Timed Action from Context Menu

```lua
-- Context menu handler
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    if test then return true end

    local playerObj = getSpecificPlayer(player)

    for _, obj in ipairs(worldobjects) do
        if obj:getSprite() and obj:getSprite():getName() == "mymod_workbench" then
            context:addOption("Use Workbench", obj, ISMyMod.onUseWorkbench, playerObj)
        end
    end
end)

-- Callback creates timed action
ISMyMod.onUseWorkbench = function(obj, playerObj)
    -- Walk to object first
    if luautils.walkAdj(playerObj, obj:getSquare()) then
        -- Queue the action
        ISTimedActionQueue.add(ISMyModAction:new(playerObj, obj, 100))
    end
end
```

---

## World Object Context Menu Structure

### ISWorldObjectContextMenu.lua

The vanilla code fetches objects and creates options in phases:

1. **clearFetch()** - Resets all object variables
2. **fetch()** - Scans clicked objects, categorizes them
3. Creates options based on found objects:
   - Door options (open/close/lock)
   - Window options (open/close/smash/climb)
   - Container options (loot)
   - Furniture options (rest/sleep)
   - Crafting options (if near workbench)
   - Vehicle options (if clicking vehicle)

### Key Variables Set by fetch()

```lua
window        -- IsoWindow clicked
door          -- IsoDoor or door-like IsoThumpable
curtain       -- IsoCurtain
stove         -- Stove object
bed           -- Bed object
storeWater    -- Water source
generator     -- Generator
thump         -- IsoThumpable
hoppableN/W   -- Hoppable objects
trap          -- Animal trap
compost       -- Compost bin
clickedSquare -- The square clicked
```

---

## Inventory Context Menu Structure

### ISInventoryPaneContextMenu.lua

The createMenu function:

1. Gets the context menu via `ISContextMenu.get(player, x, y)`
2. Iterates through selected items
3. Categorizes items (food, weapon, clothing, etc.)
4. Adds appropriate options:
   - Eat/Drink for food
   - Equip/Unequip for equipment
   - Wear/Take off for clothing
   - Read for literature
   - Craft if recipes available
   - Repair if damaged

### Key Variables Set During Processing

```lua
isAllFood       -- All selected items are edible
isWeapon        -- Has weapon item
clothing        -- Has clothing item
waterContainer  -- Has water container
canBeActivated  -- Has activatable item (flashlight)
drainable       -- Has drainable item
magazine        -- Has gun magazine
```

---

## Context Folder Modules

Additional context menu handlers in `media/lua/client/Context/`:

### World/

- **ISContextDisassemble.lua** - Furniture disassembly
- **ISContextDoor.lua** - Door-specific options
- **ISContextTelevision.lua** - TV/Radio interaction
- **ISContextDisksAndTapes.lua** - Media items
- **ISContextDebugHighlights.lua** - Debug highlighting

### Inventory/

- **InvContextMedia.lua** - Media item options
- **InvContextRadio.lua** - Radio item options
- **InvContextMovable.lua** - Movable item options

---

## Best Practices

### 1. Always Check `test` Parameter

```lua
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    if test then return true end  -- Important for menu visibility checks
    -- ... rest of code
end)
```

### 2. Use getText() for Translations

```lua
context:addOption(getText("ContextMenu_MyOption"), ...)
```

### 3. Pool Tooltips Properly

```lua
local tooltip = ISWorldObjectContextMenu.addToolTip()
-- Don't create new ISToolTip manually
```

### 4. Handle Multiple Selected Items

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(player, context, items)
    -- items can be: InventoryItem OR {items = {item1, item2, ...}}
    local itemList = {}
    for _, v in ipairs(items) do
        if instanceof(v, "InventoryItem") then
            table.insert(itemList, v)
        else
            for _, item in ipairs(v.items) do
                table.insert(itemList, item)
            end
        end
    end
    -- Now itemList has all selected items
end)
```

### 5. Use instanceof for Type Checking

```lua
if instanceof(obj, "IsoThumpable") then
if instanceof(item, "HandWeapon") then
if instanceof(item, "Food") then
```

### 6. Check Player Capability

```lua
-- Check if player can reach
if not luautils.walkAdj(playerObj, obj:getSquare(), false) then
    option.notAvailable = true
end

-- Check inventory
if not playerObj:getInventory():contains("Base.Hammer") then
    option.notAvailable = true
end
```

---

## Complete Example: Custom Workstation

```lua
-- MyMod/media/lua/client/MyModContextMenu.lua

require "ISUI/ISWorldObjectContextMenu"

ISMyModContextMenu = {}

-- Add world object options
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    if test then return true end

    local playerObj = getSpecificPlayer(player)
    if playerObj:isDead() then return end

    -- Find our workstation
    local workstation = nil
    for _, obj in ipairs(worldobjects) do
        if obj:getSprite() and string.contains(obj:getSprite():getName() or "", "mymod_workstation") then
            workstation = obj
            break
        end
    end

    if not workstation then return end

    -- Main menu option
    local mainOpt = context:addOption(getText("ContextMenu_MyModWorkstation"), workstation, nil)

    -- Create submenu
    local subMenu = ISContextMenu:getNew(context)
    context:addSubMenu(mainOpt, subMenu)

    -- Add craft option
    local craftOpt = subMenu:addOption(
        getText("ContextMenu_Craft"),
        workstation,
        ISMyModContextMenu.onCraft,
        playerObj
    )

    -- Check requirements
    local hasTools = playerObj:getInventory():containsTagEval("Hammer", predicateNotBroken)
    if not hasTools then
        craftOpt.notAvailable = true
        local tip = ISWorldObjectContextMenu.addToolTip()
        tip.description = getText("Tooltip_NeedHammer")
        craftOpt.toolTip = tip
    end

    -- Add repair option
    if workstation:getModData().damage and workstation:getModData().damage > 0 then
        local repairOpt = subMenu:addOption(
            getText("ContextMenu_Repair"),
            workstation,
            ISMyModContextMenu.onRepair,
            playerObj
        )

        local tip = ISWorldObjectContextMenu.addToolTip()
        tip.description = getText("Tooltip_RepairWorkstation", workstation:getModData().damage)
        repairOpt.toolTip = tip
    end

    -- Add upgrade submenu
    local upgradeOpt = subMenu:addOption(getText("ContextMenu_Upgrade"))
    local upgradeMenu = ISContextMenu:getNew(subMenu)
    subMenu:addSubMenu(upgradeOpt, upgradeMenu)

    upgradeMenu:addOption("Speed +1", workstation, ISMyModContextMenu.onUpgradeSpeed, playerObj)
    upgradeMenu:addOption("Quality +1", workstation, ISMyModContextMenu.onUpgradeQuality, playerObj)
end)

-- Callback functions
ISMyModContextMenu.onCraft = function(workstation, playerObj)
    if luautils.walkAdj(playerObj, workstation:getSquare()) then
        ISTimedActionQueue.add(ISMyModCraftAction:new(playerObj, workstation, 200))
    end
end

ISMyModContextMenu.onRepair = function(workstation, playerObj)
    if luautils.walkAdj(playerObj, workstation:getSquare()) then
        ISTimedActionQueue.add(ISMyModRepairAction:new(playerObj, workstation, 100))
    end
end

ISMyModContextMenu.onUpgradeSpeed = function(workstation, playerObj)
    -- Implementation
end

ISMyModContextMenu.onUpgradeQuality = function(workstation, playerObj)
    -- Implementation
end

-- Helper predicate
local function predicateNotBroken(item)
    return not item:isBroken()
end
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| ISContextMenu class | Complete |
| Event hooks | Complete |
| Option API | Complete |
| Submenu system | Complete |
| Tooltip system | Complete |
| World object menus | Complete |
| Inventory menus | Complete |
| Complete examples | Complete |

---

## Related Systems

- **ISTimedActionQueue** - Actions triggered from menus
- **Events System** - Context menu events
- **ISUI** - Parent UI framework
- **Inventory System** - Item context menus
