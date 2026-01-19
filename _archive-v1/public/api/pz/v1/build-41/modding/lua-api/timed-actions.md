---
id: timed-actions
slug: timed-actions
title: TimedAction Lifecycle
excerpt: Timed actions are the backbone of player interactions in Project Zomboid. From bandaging wounds to crafting items, eating food to reading books - everything uses the timed action system....
game: pz
version: build-41
section: modding
category: lua-api
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - lua
  - timed-actions
  - gameplay
  - api
last_updated: 2026-01-10
---
# TimedAction Lifecycle

## Overview

Timed actions are the backbone of player interactions in Project Zomboid. From bandaging wounds to crafting items, eating food to reading books - everything uses the timed action system.

## Location

```
media/lua/shared/TimedActions/ISBaseTimedAction.lua
media/lua/client/TimedActions/  -- All action implementations
```

---

## Lifecycle Phases

A timed action goes through these phases in order:

```
1. new()         - Constructor: Initialize the action
2. isValidStart() - Check: Can we begin this action?
3. waitToStart()  - Wait: Turn to face target if needed
4. start()       - Begin: Setup animations and state
5. update()      - Loop: Called every tick while running
6. isValid()     - Check: Is action still valid? (called each update)
7. perform()     - Complete: Execute the final result
   OR
7. stop()        - Cancel: Clean up if interrupted
```

---

## ISBaseTimedAction Methods

### new(character)

**Purpose:** Create a new action instance

**Called:** When you instantiate the action

```lua
function MyAction:new(character, item, targetSquare)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character;
    o.item = item;
    o.targetSquare = targetSquare;
    o.stopOnWalk = true;
    o.stopOnRun = true;
    o.maxTime = 200;  -- Ticks (roughly 6.6 seconds)
    return o;
end
```

**Key properties to set:**
| Property | Type | Description |
|----------|------|-------------|
| `character` | IsoPlayer | The player performing action |
| `maxTime` | int | Duration in ticks (-1 = instant) |
| `stopOnWalk` | bool | Cancel if player walks |
| `stopOnRun` | bool | Cancel if player runs |
| `stopOnAim` | bool | Cancel if player aims (default true) |
| `ignoreHandsWounds` | bool | Don't slow down for hand injuries |
| `caloriesModifier` | float | Calorie burn multiplier |

---

### isValidStart()

**Purpose:** Check if action can begin

**Called:** Once, before action starts

**Return:** `true` to proceed, `false` to abort

```lua
function MyAction:isValidStart()
    -- Check if we still have the item
    if not self.character:getInventory():contains(self.item) then
        return false;
    end
    -- Check if we're close enough
    if self.character:DistToSquared(self.targetSquare:getX(), self.targetSquare:getY()) > 4 then
        return false;
    end
    return true;
end
```

Default implementation returns `true`.

---

### waitToStart()

**Purpose:** Wait for preconditions (like turning to face target)

**Called:** After isValidStart(), before start()

**Return:** `true` to keep waiting, `false` to proceed

```lua
function MyAction:waitToStart()
    -- Turn to face the target object
    self.character:faceThisObject(self.targetObject);
    return self.character:shouldBeTurning();
end
```

Default implementation returns `false` (no waiting).

---

### start()

**Purpose:** Initialize the action (setup animations, sounds, UI)

**Called:** Once, when action actually begins

```lua
function MyAction:start()
    -- Set animation
    self:setActionAnim(CharacterActionAnims.Craft);
    
    -- Set hand models
    self:setOverrideHandModels(self.item, nil);
    
    -- Play sound
    self.sound = self.character:playSound("Hammering");
    
    -- Set item job info (for progress bar)
    self.item:setJobType(getText("ContextMenu_Repair"));
    self.item:setJobDelta(0.0);
    
    -- Report event for moodles
    self.character:reportEvent("EventCrafting");
end
```

**Helper methods:**
| Method | Description |
|--------|-------------|
| `setActionAnim(anim)` | Set character animation |
| `setAnimVariable(key, val)` | Set animation variable |
| `setOverrideHandModels(primary, secondary)` | Set held items |

---

### update()

**Purpose:** Per-tick logic while action is running

**Called:** Every tick until complete or cancelled

```lua
function MyAction:update()
    -- Update progress bar
    self.item:setJobDelta(self:getJobDelta());
    
    -- Keep facing target
    self.character:faceThisObject(self.targetObject);
    
    -- Set metabolic activity
    self.character:setMetabolicTarget(Metabolics.LightDomestic);
    
    -- Custom per-tick logic
    if self:getJobDelta() > 0.5 and not self.halfwayDone then
        self.halfwayDone = true;
        self.character:Say("Halfway there!");
    end
end
```

**Useful methods:**
| Method | Description |
|--------|-------------|
| `getJobDelta()` | Progress 0.0 to 1.0 |
| `resetJobDelta()` | Reset progress |
| `setCurrentTime(time)` | Set elapsed time |

---

### isValid()

**Purpose:** Check if action should continue

**Called:** Every tick during update

**Return:** `true` to continue, `false` to stop

```lua
function MyAction:isValid()
    -- Check if item still exists
    if not self.character:getInventory():contains(self.item) then
        return false;
    end
    
    -- Check if target moved
    if self.targetPlayer and ISHealthPanel.DidPatientMove(
        self.character, self.targetPlayer, 
        self.savedX, self.savedY
    ) then
        return false;
    end
    
    return true;
end
```

---

### perform()

**Purpose:** Execute the action's result

**Called:** Once, when action completes successfully

```lua
function MyAction:perform()
    -- IMPORTANT: Always call parent first!
    ISBaseTimedAction.perform(self);
    
    -- Clear job delta
    self.item:setJobDelta(0.0);
    
    -- Apply the actual effect
    self.targetObject:repair(self.repairAmount);
    
    -- Consume materials
    self.character:getInventory():Remove(self.item);
    
    -- Award XP
    self.character:getXp():AddXP(Perks.Woodwork, 5);
    
    -- Play completion sound
    self.character:playSound("RepairComplete");
end
```

**Critical:** Always call `ISBaseTimedAction.perform(self)` first! This removes the action from the queue and starts the next action.

---

### stop()

**Purpose:** Clean up when action is interrupted

**Called:** When action is cancelled (player moved, invalid, etc.)

```lua
function MyAction:stop()
    -- Clear job delta
    if self.item then
        self.item:setJobDelta(0.0);
    end
    
    -- Stop sounds
    if self.sound then
        self.character:stopOrTriggerSound(self.sound);
    end
    
    -- Clean up UI state
    ISHealthPanel.setBodyPartActionForPlayer(
        self.otherPlayer, self.bodyPart, nil, nil, nil
    );
    
    -- IMPORTANT: Call parent last!
    ISBaseTimedAction.stop(self);
end
```

**Critical:** Always call `ISBaseTimedAction.stop(self)` - this resets the action queue.

---

## Queueing Actions

### Adding to Queue

```lua
-- Simple add
ISTimedActionQueue.add(MyAction:new(player, item, target));

-- Add after another action
local action1 = MyAction:new(player, item1, target);
local action2 = MyAction:new(player, item2, target);
ISTimedActionQueue.add(action1);
action1:addAfter(action2);  -- action2 runs after action1
```

### Getting the Queue

```lua
local queue = ISTimedActionQueue.getTimedActionQueue(player);
```

### Checking Queue State

```lua
-- Check if player is doing something
if player:getCurrentAction() then
    print("Player is busy");
end
```

---

## Complete Action Example

```lua
require "TimedActions/ISBaseTimedAction"

ISRepairItemAction = ISBaseTimedAction:derive("ISRepairItemAction");

function ISRepairItemAction:isValidStart()
    -- Must have the item and repair kit
    return self.character:getInventory():contains(self.item) and
           self.character:getInventory():contains(self.repairKit);
end

function ISRepairItemAction:isValid()
    -- Continue checking while running
    return self.character:getInventory():contains(self.item) and
           self.character:getInventory():contains(self.repairKit);
end

function ISRepairItemAction:waitToStart()
    -- No waiting needed for self-actions
    return false;
end

function ISRepairItemAction:start()
    self:setActionAnim(CharacterActionAnims.Craft);
    self:setOverrideHandModels(self.item, self.repairKit);
    self.item:setJobType(getText("ContextMenu_Repair"));
    self.item:setJobDelta(0.0);
    self.character:reportEvent("EventCrafting");
end

function ISRepairItemAction:update()
    self.item:setJobDelta(self:getJobDelta());
    self.character:setMetabolicTarget(Metabolics.LightDomestic);
end

function ISRepairItemAction:stop()
    self.item:setJobDelta(0.0);
    ISBaseTimedAction.stop(self);
end

function ISRepairItemAction:perform()
    ISBaseTimedAction.perform(self);
    self.item:setJobDelta(0.0);
    
    -- Calculate repair amount based on skill
    local skillLevel = self.character:getPerkLevel(Perks.Mechanics);
    local repairAmount = 10 + (skillLevel * 5);
    
    -- Apply repair
    local newCondition = math.min(
        self.item:getConditionMax(),
        self.item:getCondition() + repairAmount
    );
    self.item:setCondition(newCondition);
    
    -- Use repair kit
    self.repairKit:Use();
    
    -- Award XP
    self.character:getXp():AddXP(Perks.Mechanics, 5);
end

function ISRepairItemAction:new(character, item, repairKit)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character;
    o.item = item;
    o.repairKit = repairKit;
    o.stopOnWalk = true;
    o.stopOnRun = true;
    
    -- Time based on skill
    local skillLevel = character:getPerkLevel(Perks.Mechanics);
    o.maxTime = 300 - (skillLevel * 20);
    
    return o;
end
```

---

## Time Adjustments

The base class automatically adjusts `maxTime` based on:

1. **Unhappiness** - Adds time per moodle level
2. **Hand injuries** - Adds time based on pain
3. **Body temperature** - Multiplier from getTimedActionTimeModifier()

```lua
function ISBaseTimedAction:adjustMaxTime(maxTime)
    if maxTime ~= -1 then
        -- Unhappy penalty
        maxTime = maxTime + ((self.character:getMoodles():getMoodleLevel(MoodleType.Unhappy)) * 10)
        
        -- Hand/arm injury penalty
        if not self.ignoreHandsWounds then
            for i = BodyPartType.ToIndex(BodyPartType.Hand_L), 
                    BodyPartType.ToIndex(BodyPartType.ForeArm_R) do
                local part = self.character:getBodyDamage():getBodyPart(
                    BodyPartType.FromIndex(i)
                );
                maxTime = maxTime + part:getPain();
            end
        end
        
        -- Temperature modifier
        maxTime = maxTime * self.character:getTimedActionTimeModifier();
    end
    return maxTime;
end
```

---

## Common Animations

| Animation | Use Case |
|-----------|----------|
| `CharacterActionAnims.Craft` | Crafting, repairing |
| `CharacterActionAnims.Bandage` | Medical actions |
| `CharacterActionAnims.Eat` | Eating food |
| `CharacterActionAnims.Drink` | Drinking |
| `CharacterActionAnims.Read` | Reading books |
| `CharacterActionAnims.Loot` | Taking items |
| `"Loot"` | Generic interaction |

---

## Metabolic Targets

```lua
self.character:setMetabolicTarget(Metabolics.LightDomestic);
self.character:setMetabolicTarget(Metabolics.HeavyDomestic);
self.character:setMetabolicTarget(Metabolics.LightWork);
self.character:setMetabolicTarget(Metabolics.MediumWork);
self.character:setMetabolicTarget(Metabolics.HeavyWork);
```

---

## Related

- [ISBaseObject Inheritance](/build-41/modding/lua-api/isbaseobject) - The base class system
- [Official Lua Examples](/build-41/modding/lua-api/official-examples) - Example code from the game
- [Events Reference](/build-41/modding/reference/events) - Game events 