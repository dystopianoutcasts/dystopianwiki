---
id: weapon-repair-lua-repair-mechanics
slug: lua-repair-mechanics
title: "Lua Repair Mechanics"
game: pz
version: build-41
section: modding
category: weapon-repair
subcategory: null
difficulty: advanced
tags:
  - lua
  - recipe
  - item
  - repair
  - weapon
  - event
  - api
  - mechanics
excerpt: "Deep dive into how Project Zomboid's repair system works in Lua - ISFixAction workflow, FixingManager API, repair calculations, and custom repair logic."
table_of_contents:
  - text: "Core Files"
    link: "#core-files"
  - text: "ISFixAction.lua - Main Repair Action"
    link: "#isfixactionlua-main-repair-action"
  - text: "Class Structure"
    link: "#class-structure"
  - text: "Constructor"
    link: "#constructor"
  - text: "Perform Method"
    link: "#perform-method"
  - text: "Validation"
    link: "#validation"
  - text: "ISInventoryPaneContextMenu.lua - Repair UI"
    link: "#isinventorypanecontextmenulua-repair-ui"
  - text: "Detecting Repairable Items"
    link: "#detecting-repairable-items"
  - text: "Building Repair Menu"
    link: "#building-repair-menu"
  - text: "Calculating Repair Stats"
    link: "#calculating-repair-stats"
  - text: "Checking Skill Requirements"
    link: "#checking-skill-requirements"
  - text: "Executing Repair"
    link: "#executing-repair"
  - text: "ISRepairClothing.lua - Clothing Repairs"
    link: "#isrepairclothinglua-clothing-repairs"
  - text: "Duration Formula"
    link: "#duration-formula"
  - text: "Perform Method"
    link: "#perform-method"
  - text: "VehicleCommands.lua - Engine Repair Formula"
    link: "#vehiclecommandslua-engine-repair-formula"
  - text: "Condition Per Part Calculation"
    link: "#condition-per-part-calculation"
  - text: "Condition Degradation Example"
    link: "#condition-degradation-example"
  - text: "ISChopTreeAction.lua"
    link: "#ischoptreeactionlua"
  - text: "FixingManager API Reference"
    link: "#fixingmanager-api-reference"
  - text: "Key Item Methods"
    link: "#key-item-methods"
  - text: "Key Player Methods"
    link: "#key-player-methods"
last_updated: 2026-01-18
---

# Lua Repair Mechanics

## Introduction

You're trying to create custom repair behavior for your mod and you need to understand how the Lua repair system works. You've found `ISFixAction.lua` and see Java API calls like `FixingManager.fixItem()`, but you're not sure how everything connects. Or maybe you want to hook into the repair event system but can't find where repair success/failure is determined.

If you're feeling overwhelmed by the repair mechanics, you're not alone. The repair system spans multiple Lua files (ISFixAction, ISInventoryPaneContextMenu, ISRepairClothing, VehicleCommands) and bridges between Lua and Java with the FixingManager API. Understanding the flow from "right-click repair" to "item condition updated" requires tracing through several interconnected systems.

Here's the good news: once you understand the core workflow (UI detection → menu building → action queueing → FixingManager call → condition update), custom repair mechanics become manageable. This guide walks through each key file, shows you the actual repair calculations, and explains where to hook in custom behavior.

**Note:** This is an advanced guide requiring Lua knowledge. If you're new to modding, start with [Fixing.txt Anatomy](fixing-txt-anatomy) for basic repair definitions.

## Core Files

```
R:\Games\Steam\steamapps\common\ProjectZomboid\media\lua\client\
├── TimedActions\
│   ├── ISFixAction.lua           # Main repair action (calls FixingManager)
│   ├── ISRepairClothing.lua      # Clothing-specific repairs
│   └── ISChopTreeAction.lua      # Shows condition degradation example
├── ISUI\
│   └── ISInventoryPaneContextMenu.lua  # Repair UI menus
└── Vehicles\TimedActions\
    └── ISRepairEngine.lua        # Engine repair action

R:\Games\Steam\steamapps\common\ProjectZomboid\media\lua\server\
├── Vehicles\
│   └── VehicleCommands.lua       # Server-side repair logic
└── recipecode.lua                # Item type definitions
```

## ISFixAction.lua - Main Repair Action

### Class Structure

```lua
ISFixAction = ISBaseTimedAction:derive("ISFixAction");
-- Derives from ISBaseTimedAction (timed action base class)
-- Handles the actual repair execution after player queues action
```

### Constructor

```lua
function ISFixAction:new(character, item, time, fixing, fixer, vehiclePart)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character        -- Player performing repair
    o.item = item                  -- Item being repaired
    o.fixing = fixing              -- Fixing definition (from fixing.txt)
    o.fixer = fixer                -- Fixer item (duct tape, woodglue, etc.)
    o.vehiclePart = vehiclePart    -- Optional: vehicle part reference
    o.maxTime = time               -- Default: 60 ticks (~2 seconds)
    o.haveBeenRepaired = item:getHaveBeenRepaired()  -- Track if previously repaired
    return o
end
```

### Perform Method

```lua
function ISFixAction:perform()
    -- Call Java FixingManager to perform repair
    -- This is where actual condition restoration happens
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)

    -- If repairing a vehicle part, sync to server
    if self.vehiclePart then
        local part = self.vehiclePart
        local args = {
            vehicle = part:getVehicle():getId(),
            part = part:getId(),
            condition = self.item:getCondition(),  -- New condition after repair
            haveBeenRepaired = self.item:getHaveBeenRepaired()
        }
        sendClientCommand(self.character, 'vehicle', 'fixPart', args)
    end

    ISBaseTimedAction.perform(self)  -- Cleanup and finish action
end
```

### Validation

```lua
function ISFixAction:isValid()
    -- Check if item still exists and is in player inventory
    -- Called periodically during action to ensure conditions haven't changed
    return self.item and self.character:getInventory():contains(self.item)
end
```

## ISInventoryPaneContextMenu.lua - Repair UI

### Detecting Repairable Items

```lua
-- Line 139: Check if item is damaged or broken
if testItem:isBroken() or testItem:getCondition() < testItem:getConditionMax() then
    brokenObject = testItem  -- Mark as repairable
end
-- isBroken() returns true when condition == 0
-- Otherwise checks if current condition < max (damaged but not broken)
```

### Building Repair Menu

```lua
-- Lines 734-744: Build context menu for repairs
if brokenObject then
    -- Ask FixingManager for available fixes
    local fixingList = FixingManager.getFixes(brokenObject)

    if not fixingList:isEmpty() then
        -- Add "Repair [Item Name]" option
        local fixOption = context:addOption(
            getText("ContextMenu_Repair") .. getItemNameFromFullType(brokenObject:getFullType()),
            items, nil
        )

        -- Create submenu for fixer options
        local subMenuFix = ISContextMenu:getNew(context)
        context:addSubMenu(fixOption, subMenuFix)

        -- Add each fixer as submenu option
        for i = 0, fixingList:size() - 1 do
            ISInventoryPaneContextMenu.buildFixingMenu(
                brokenObject, player, fixingList:get(i),
                fixOption, subMenuFix
            )
        end
    end
end
```

### Calculating Repair Stats

```lua
-- Lines 1898-1908: Calculate and display repair preview
local condPercentRepaired = FixingManager.getCondRepaired(
    brokenObject, getSpecificPlayer(player), fixing, fixer
)
-- Returns percentage of condition that will be restored (0-100)

local chanceOfSuccess = 100 - FixingManager.getChanceOfFail(
    brokenObject, getSpecificPlayer(player), fixing, fixer
)
-- Returns success chance (0-100%)
-- Failure chance is affected by player skill, item condition, fixer quality

-- Display in tooltip
tooltip.description = " " .. color1 .. " " ..
    getText("Tooltip_potentialRepair") .. " " ..
    math.ceil(condPercentRepaired) .. "%"  -- "Will repair X%"
tooltip.description = tooltip.description .. " <LINE> " ..
    getText("Tooltip_chanceOfSuccess") .. " " ..
    math.ceil(chanceOfSuccess) .. "%"  -- "Y% chance of success"
```

### Checking Skill Requirements

```lua
-- Lines 1928-1943: Check if player has required skills
if fixer:getFixerSkills() then
    local skills = fixer:getFixerSkills()  -- Get skill requirements

    for j = 0, skills:size() - 1 do
        local skill = skills:get(j)
        local perk = Perks.FromString(skill:getSkillName())  -- Convert to perk enum
        local perkLvl = getSpecificPlayer(player):getPerkLevel(perk)  -- Player's level

        if perkLvl >= skill:getSkillLevel() then
            color1 = ISInventoryPaneContextMenu.ghs  -- Green (has skill)
        else
            color1 = ISInventoryPaneContextMenu.bhs  -- Red (lacks skill)
            fixOption.notAvailable = true            -- Disable option
        end

        -- Display: "Skill Name: X/Y" (e.g., "Woodwork: 3/5")
        text = text .. " <LINE> " .. color1 .. " " ..
            perk:getName() .. " : " .. perkLvl .. "/" .. skill:getSkillLevel()
    end
end
```

### Executing Repair

```lua
-- Lines 1948-1960: Queue repair action when player selects fixer
ISInventoryPaneContextMenu.onFix = function(brokenObject, player, fixing, fixer, vehiclePart)
    local playerObj = getSpecificPlayer(player)

    -- Transfer item to player's main inventory if in container
    ISInventoryPaneContextMenu.transferIfNeeded(playerObj, brokenObject)

    -- Queue item transfer actions for required materials
    local items = fixing:getRequiredItems(playerObj, fixer, brokenObject)
    for i = 0, items:size() - 1 do
        ISTimedActionQueue.add(
            ISInventoryTransferAction:new(playerObj, items:get(i), ...)
        )
    end

    -- Queue repair action (60 ticks = ~2 seconds default)
    ISTimedActionQueue.add(
        ISFixAction:new(playerObj, brokenObject, 60, fixing, fixer, vehiclePart)
    )
end
```

## ISRepairClothing.lua - Clothing Repairs

### Duration Formula

```lua
function ISRepairClothing:new(character, clothing, part, fabric, thread, needle)
    local o = {}
    -- ...
    -- Base time: 150 ticks (~5 seconds)
    -- Reduced by 6 ticks per Tailoring level
    o.maxTime = 150 - (character:getPerkLevel(Perks.Tailoring) * 6)
    -- Level 0: 150 ticks (~5 seconds)
    -- Level 5: 120 ticks (~4 seconds)
    -- Level 10: 90 ticks (~3 seconds)

    -- Admin instant action override
    if character:isTimedActionInstant() then
        o.maxTime = 1
    end
    return o
end
```

### Perform Method

```lua
function ISRepairClothing:perform()
    -- Add patch to clothing (visual + condition restoration)
    self.clothing:addPatch(self.character, self.part, self.fabric)
    self.character:resetModel()  -- Update character sprite

    -- Consume materials
    self.character:getInventory():Remove(self.fabric)  -- Fabric completely consumed
    self.thread:Use()  -- Degrades thread durability (not removed)

    -- Grant XP (random 1-3 XP)
    self.character:getXp():AddXP(Perks.Tailoring, ZombRand(1, 3))

    -- Trigger event for mods to hook into
    triggerEvent("OnClothingUpdated", self.character)

    ISBaseTimedAction.perform(self)  -- Cleanup
end
```

## VehicleCommands.lua - Engine Repair Formula

### Condition Per Part Calculation

```lua
-- Lines 178-186: Server-side engine repair calculation
function Commands.repairEngine(player, args)
    local vehicle = getVehicleById(args.vehicle)
    local part = vehicle:getPartById("Engine")

    -- Skill-based condition restoration
    -- Base: 1 condition per part
    -- Bonus: +0.5 condition per Mechanics skill level
    local condPerPart = 1 + (args.skillLevel / 2)
    if condPerPart > 5 then
        condPerPart = 5  -- Maximum 5 condition per part (Mechanics 8+)
    end

    local done = 0
    for i = 1, args.numberOfParts do
        part:setCondition(part:getCondition() + condPerPart)
        done = done + 1

        if part:getCondition() >= 100 then
            part:setCondition(100)  -- Hard cap at 100 condition
            break
        end
    end

    -- Grant XP (only on first repair, not subsequent parts)
    if args.giveXP then
        player:sendObjectChange('addXp', {
            perk = Perks.Mechanics:index(),
            xp = done,  -- 1 XP per part used
            noMultiplier = false  -- Affected by XP multipliers
        })
    end
end
```

## Condition Degradation Example

### ISChopTreeAction.lua

```lua
-- Lines 63-68: How tools lose condition during use
if ZombRand(self.axe:getConditionLowerChance() * 2 +
            self.character:getMaintenanceMod() * 2) == 0 then
    -- Condition degrades
    self.axe:setCondition(self.axe:getCondition() - 1)
    ISWorldObjectContextMenu.checkWeapon(self.character)
    -- checkWeapon() removes item if broken (condition == 0)
else
    -- No degradation, gain Maintenance XP
    self.character:getXp():AddXP(Perks.Maintenance, 1)
end

-- Formula explanation:
-- ZombRand(N) returns 0 to N-1
-- Higher ConditionLowerChance = less frequent degradation
-- Higher Maintenance skill = less frequent degradation
// Example: ConditionLowerChance=30, MaintenanceMod=10
// ZombRand((30*2) + (10*2)) = ZombRand(80)
// 1 in 80 chance of degradation (1.25%)
```

## FixingManager API Reference

The FixingManager is a Java class accessed from Lua:

```lua
-- Get available repairs for an item
local fixingList = FixingManager.getFixes(item)
-- Returns: ArrayList<Fixing> of valid fixing definitions
-- Empty if item can't be repaired or no fixers available

-- Calculate condition that will be restored (0-100%)
local condRepaired = FixingManager.getCondRepaired(item, player, fixing, fixer)
-- Returns: Number (0-100) representing percentage of max condition restored
-- Affected by: player Maintenance skill, fixer quality, ConditionModifier

-- Calculate failure chance (0-100%)
local failChance = FixingManager.getChanceOfFail(item, player, fixing, fixer)
-- Returns: Number (0-100) representing percentage chance of failure
// Higher Maintenance skill = lower failure chance
// Previously repaired items = higher failure chance

-- Perform the repair
FixingManager.fixItem(item, character, fixing, fixer)
-- Modifies item condition, consumes fixer materials
-- Handles failure chance (may not restore condition)
// Sets item:setHaveBeenRepaired(true) flag
```

## Key Item Methods

```lua
-- Condition
item:getCondition()           -- Current condition (0-100)
item:setCondition(value)      -- Set condition (clamped to 0-max)
item:getConditionMax()        -- Maximum condition (usually 100)
item:getConditionLowerChance() -- Degradation probability (higher = slower degradation)

-- State
item:isBroken()               -- True if condition == 0
item:getHaveBeenRepaired()    -- True if previously repaired
item:setHaveBeenRepaired(bool) -- Set repair flag (affects future repairs)

-- Type
item:getType()                -- Item type string (e.g., "Axe")
item:getFullType()            -- Full item type with module (e.g., "Base.Axe")
```

## Key Player Methods

```lua
-- Skills
player:getPerkLevel(Perks.Maintenance)  -- Get skill level (0-10)
player:getMaintenanceMod()              -- Get maintenance modifier (skill bonuses)
player:getXp():AddXP(perk, amount)      -- Add XP to skill

-- Inventory
player:getInventory():contains(item)  -- Check if player has item
player:getInventory():Remove(item)    -- Remove item from inventory
player:getInventory():getNumberOfItem(type, checkChildren, includeContainers)
// Get count of item type (useful for checking material availability)
```

---

## Common Mistakes

### ❌ Wrong: Calling FixingManager.fixItem Without Validation

```lua
-- Custom repair action
function MyCustomRepair:perform()
    -- WRONG! No validation before calling FixingManager
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)

    ISBaseTimedAction.perform(self)
end
```

**Why it's wrong:** If the item no longer exists (dropped, moved to container, destroyed by zombie), or the fixer materials were consumed by another action, `FixingManager.fixItem()` will error or fail silently. Always validate before calling Java APIs.

✅ **Right:**

```lua
function MyCustomRepair:perform()
    -- Validate item still exists and is accessible
    if not self.item or not self.character:getInventory():contains(self.item) then
        ISBaseTimedAction.perform(self)  -- Cleanup and exit
        return
    end

    -- Validate fixer materials still available
    if not self.character:getInventory():contains(self.fixer) then
        ISBaseTimedAction.perform(self)
        return
    end

    -- Now safe to call FixingManager
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)

    ISBaseTimedAction.perform(self)
end

-- Also override isValid() for periodic checking
function MyCustomRepair:isValid()
    return self.item and
           self.character:getInventory():contains(self.item) and
           self.character:getInventory():contains(self.fixer)
end
```

### ❌ Wrong: Setting Condition Above Max

```lua
-- Custom repair logic
function repairMyItem(item, player)
    local repairAmount = 50  -- Restore 50 condition

    -- WRONG! Doesn't check if new condition exceeds max
    item:setCondition(item:getCondition() + repairAmount)
    -- If item has 80 condition and max is 100, this sets it to 130!
end
```

**Why it's wrong:** While `setCondition()` internally clamps to max, you're not handling the logic correctly. If an item has 80 condition and you add 50, you're attempting to set it to 130. The game clamps it to 100, but your repair logic may grant XP or consume materials based on the full 50 points, which is incorrect.

✅ **Right:**

```lua
function repairMyItem(item, player)
    local repairAmount = 50  -- Restore 50 condition
    local currentCondition = item:getCondition()
    local maxCondition = item:getConditionMax()

    -- Calculate actual condition restored (don't exceed max)
    local actualRepair = math.min(repairAmount, maxCondition - currentCondition)

    -- Set new condition
    item:setCondition(currentCondition + actualRepair)

    -- Grant XP based on ACTUAL repair (not attempted repair)
    player:getXp():AddXP(Perks.Maintenance, actualRepair / 10)  -- 1 XP per 10 condition

    return actualRepair  -- Return how much was actually restored
end
```

### ❌ Wrong: Not Handling Repair Failure

```lua
-- Custom repair UI
function onCustomRepair(item, player, fixer)
    local repairAmount = 30

    // WRONG! Assumes repair always succeeds
    item:setCondition(item:getCondition() + repairAmount)
    player:getInventory():Remove(fixer)  -- Always consumes materials

    -- Player message
    player:Say("Repaired item by " .. repairAmount .. " points!")
end
```

**Why it's wrong:** The vanilla repair system has a failure chance based on Maintenance skill and item condition. Your custom repair always succeeds, making it overpowered and ignoring game balance. Materials should only be consumed if repair succeeds (or partially consumed on failure).

✅ **Right:**

```lua
function onCustomRepair(item, player, fixer)
    local repairAmount = 30
    local maintenanceLevel = player:getPerkLevel(Perks.Maintenance)

    -- Calculate failure chance (higher Maintenance = lower failure)
    -- Base 20% failure, reduced by 2% per Maintenance level
    local failureChance = math.max(0, 20 - (maintenanceLevel * 2))

    -- Roll for success
    if ZombRand(100) < failureChance then
        -- Repair failed
        player:Say("Repair failed!")
        fixer:Use()  // Partial consumption (degrades but not removed)
        player:getXp():AddXP(Perks.Maintenance, 1)  -- Small XP for trying
        return false
    else
        -- Repair succeeded
        item:setCondition(math.min(
            item:getCondition() + repairAmount,
            item:getConditionMax()
        ))
        player:getInventory():Remove(fixer)  -- Full consumption
        player:Say("Successfully repaired item!")
        player:getXp():AddXP(Perks.Maintenance, repairAmount / 5)  -- Good XP
        return true
    end
end
```

### ❌ Wrong: Not Syncing Vehicle Repairs to Server

```lua
-- Custom vehicle part repair
function MyVehicleRepair:perform()
    local part = self.vehiclePart
    local item = part:getInventoryItem()

    // WRONG! Only updates client-side
    item:setCondition(item:getCondition() + 20)

    ISBaseTimedAction.perform(self)
end
```

**Why it's wrong:** Vehicle state is managed by the server in multiplayer. If you only update the client, the condition change won't persist and other players won't see it. You must send a command to the server to sync the repair.

✅ **Right:**

```lua
function MyVehicleRepair:perform()
    local part = self.vehiclePart
    local item = part:getInventoryItem()

    -- Update client-side condition
    item:setCondition(item:getCondition() + 20)

    -- Sync to server (critical for multiplayer!)
    local args = {
        vehicle = part:getVehicle():getId(),        // Vehicle ID
        part = part:getId(),                        // Part ID
        condition = item:getCondition(),            // New condition
        haveBeenRepaired = item:getHaveBeenRepaired()
    }
    sendClientCommand(self.character, 'vehicle', 'fixPart', args)
    // Server will update authoritative vehicle state

    ISBaseTimedAction.perform(self)
end
```

---

## Try It Yourself

Let's create a custom "Quick Repair" action that repairs 10% condition instantly (no timed action).

### Step 1: Understand the Hook Point

We need to hook into the repair context menu system after vanilla repair options are added.

### Step 2: Create the Quick Repair Action

Create `media/lua/client/MyQuickRepair.lua`:

```lua
-- Import required classes
require "TimedActions/ISBaseTimedAction"

-- Custom quick repair action (instant, no animation)
MyQuickRepairAction = ISBaseTimedAction:derive("MyQuickRepairAction")

function MyQuickRepairAction:new(character, item, fixer)
    local o = {}
    setmetatable(o, self)
    self.__index = self

    o.character = character
    o.item = item
    o.fixer = fixer
    o.maxTime = 1  -- Instant (1 tick)
    o.stopOnWalk = false  -- Don't cancel if player moves
    o.stopOnRun = false

    return o
end

function MyQuickRepairAction:isValid()
    -- Validate item and materials still available
    return self.item and
           self.character:getInventory():contains(self.item) and
           self.character:getInventory():contains(self.fixer)
end

function MyQuickRepairAction:perform()
    -- Validate before repair
    if not self:isValid() then
        ISBaseTimedAction.perform(self)
        return
    end

    local item = self.item
    local player = self.character

    -- Calculate repair amount (10% of max condition)
    local repairAmount = item:getConditionMax() * 0.10
    local currentCondition = item:getCondition()
    local maxCondition = item:getConditionMax()

    -- Don't exceed max
    local actualRepair = math.min(repairAmount, maxCondition - currentCondition)

    -- Repair success chance (90% base, improved by Maintenance)
    local maintenanceLevel = player:getPerkLevel(Perks.Maintenance)
    local successChance = 90 + maintenanceLevel  -- 90-100% success

    if ZombRand(100) < successChance then
        -- Success!
        item:setCondition(currentCondition + actualRepair)
        player:Say("Quick repair successful!")

        -- Consume materials
        self.fixer:Use()  -- Degrades durability

        -- Grant small XP
        player:getXp():AddXP(Perks.Maintenance, actualRepair / 20)
    else
        -- Failure (rare at high skill)
        player:Say("Quick repair failed!")
        self.fixer:Use()  -- Still consumes some material
        player:getXp():AddXP(Perks.Maintenance, 1)
    end

    ISBaseTimedAction.perform(self)  -- Cleanup
end

-- No animation or sound needed for instant action
function MyQuickRepairAction:start()
end

function MyQuickRepairAction:stop()
    ISBaseTimedAction.stop(self)
end
```

### Step 3: Hook Into Context Menu

Create `media/lua/client/MyQuickRepairMenu.lua`:

```lua
-- Hook into inventory context menu
local function addQuickRepairOption(player, context, items)
    -- Get the item being right-clicked
    local playerObj = getSpecificPlayer(player)
    local item = items[1]  -- First selected item

    if not item then return end

    -- Check if item is damaged
    if item:getCondition() >= item:getConditionMax() then
        return  -- Item is full condition
    end

    -- Check if player has duct tape (our quick repair material)
    local ductTape = playerObj:getInventory():getItemFromType("Base.DuctTape")

    if ductTape then
        -- Add "Quick Repair (Duct Tape)" option
        context:addOption(
            "Quick Repair (Duct Tape)",  -- Menu text
            item,  -- Item being repaired
            function()
                -- Queue instant repair action
                ISTimedActionQueue.add(
                    MyQuickRepairAction:new(playerObj, item, ductTape)
                )
            end
        )
    end
end

-- Register hook
Events.OnFillInventoryObjectContextMenu.Add(addQuickRepairOption)
```

### Step 4: Test in Game

1. Start Project Zomboid with your mod
2. Spawn a damaged weapon (e.g., axe with 50% condition)
3. Get duct tape in inventory
4. Right-click the damaged weapon
5. Select "Quick Repair (Duct Tape)"

**What You Should See:**
- Instant repair (no animation or waiting)
- Item condition increases by 10%
- Duct tape loses durability
- Success message appears above player
- Maintenance skill increases slightly

### Why This Works

This custom repair follows vanilla patterns:
- **ISBaseTimedAction** provides structure (perform, isValid, cleanup)
- **Validation** checks item/materials exist before repair
- **Success/failure chance** based on Maintenance skill
- **Condition clamping** prevents exceeding max
- **XP grant** rewards player for using the system
- **Material consumption** via Use() method (not Remove())
- **Context menu hook** integrates with vanilla UI

---

## Next Steps

Now that you understand Lua repair mechanics:

1. See [Repair Formulas](repair-formulas) for detailed repair calculations
2. Check [Repair Items Reference](repair-items-reference) for vanilla fixer materials
3. Read [Fixing.txt Anatomy](fixing-txt-anatomy) for repair definition syntax
