# ISBaseTimedAction Anatomy - Complete Reference

**Location:** `media/lua/shared/TimedActions/ISBaseTimedAction.lua`
**Purpose:** Base class for all timed/queued actions in Project Zomboid

---

## Overview

ISBaseTimedAction is the foundation for all player actions that take time to complete. Every action you see with a progress bar - eating, crafting, building, repairing, opening doors - inherits from this class. Understanding this system is essential for creating custom mod actions.

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ISTimedActionQueue                            │
│  - Static queues table: ISTimedActionQueue.queues[character]     │
│  - Manages action order (FIFO)                                   │
│  - Handles completion callbacks                                  │
│  - Monitors stalled actions                                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ISBaseTimedAction                             │
│  - Base class for all timed actions                              │
│  - Lifecycle: new() → begin() → start() → update() → perform()  │
│  - Derived via ISBaseObject:derive()                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LuaTimedActionNew (Java)                       │
│  - Java-side action handler                                      │
│  - Manages animation states                                      │
│  - Tracks job delta (progress)                                   │
│  - Handles character state machine                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Action Lifecycle

### Phase Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CREATION: ISTimedActionQueue.add(action)                     │
│     └─ Calls action:isValidStart()                               │
│     └─ If first in queue, calls action:begin()                   │
├─────────────────────────────────────────────────────────────────┤
│  2. INITIALIZATION: action:begin()                               │
│     └─ Calls action:create() to set up Java-side action          │
│     └─ Applies time modifiers (mood, wounds, temperature)        │
│     └─ Calls character:StartAction(action.action)                │
├─────────────────────────────────────────────────────────────────┤
│  3. START: action:start()                                        │
│     └─ Called once when action begins                            │
│     └─ Set up animations: setActionAnim()                        │
│     └─ Set hand models: setOverrideHandModels()                  │
│     └─ Start sounds, set job display text                        │
├─────────────────────────────────────────────────────────────────┤
│  4. UPDATE: action:update() (called every tick)                  │
│     └─ Called repeatedly during action                           │
│     └─ Update progress: setJobDelta()                            │
│     └─ Play looping sounds                                       │
│     └─ Check ongoing validity                                    │
├─────────────────────────────────────────────────────────────────┤
│  5. COMPLETION (Success): action:perform()                       │
│     └─ Action completed successfully                             │
│     └─ Apply effects, create items, etc.                         │
│     └─ MUST call ISBaseTimedAction.perform(self) at end          │
├─────────────────────────────────────────────────────────────────┤
│  5b. CANCELLATION: action:stop()                                 │
│     └─ Action was interrupted                                    │
│     └─ Clean up partial work                                     │
│     └─ MUST call ISBaseTimedAction.stop(self)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Lifecycle Methods

| Method | When Called | Must Override? | Must Call Parent? |
|--------|-------------|----------------|-------------------|
| `new()` | Action construction | Yes | No |
| `isValidStart()` | Before action can begin | Optional | No |
| `isValid()` | Before each update tick | Yes | No |
| `waitToStart()` | Before start(), returns bool | Optional | No |
| `start()` | Once when action begins | Yes | No |
| `update()` | Every tick during action | Yes | No |
| `perform()` | On successful completion | Yes | Yes |
| `stop()` | On interruption/cancellation | Yes | Yes |

---

## ISBaseTimedAction API Reference

### Constructor Properties

```lua
function ISBaseTimedAction:new(character)
    local o = {}
    setmetatable(o, self)
    self.__index = self
    o.character = character      -- IsoPlayer performing action
    o.stopOnWalk = false         -- Cancel if character walks
    o.stopOnRun = false          -- Cancel if character runs
    o.stopOnAim = true           -- Cancel if character aims
    o.caloriesModifier = 1       -- Calorie burn multiplier
    o.maxTime = -1               -- Duration in ticks (-1 = instant)
    return o
end
```

### Standard Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `character` | IsoPlayer | required | Player performing the action |
| `maxTime` | number | -1 | Action duration in ticks (-1 = instant) |
| `stopOnWalk` | boolean | false | Cancel on walking |
| `stopOnRun` | boolean | false | Cancel on running |
| `stopOnAim` | boolean | true | Cancel on aiming |
| `caloriesModifier` | number | 1 | Calorie expenditure multiplier |
| `ignoreHandsWounds` | boolean | false | Skip hand wound time penalty |
| `action` | LuaTimedActionNew | nil | Java-side action object |
| `forceProgressBar` | boolean | false | Show progress bar even for quick actions |
| `Type` | string | class name | Used for logging and identification |

### Core Methods

#### `isValidStart()`
Called before action can begin. Return false to prevent starting.

```lua
function MyAction:isValidStart()
    -- Check if player isn't too full to eat
    return self.character:getMoodles():getMoodleLevel(MoodleType.FoodEaten) < 3
end
```

#### `isValid()`
Called before each update. Return false to cancel the action.

```lua
function MyAction:isValid()
    -- Ensure item still exists
    return self.character:getInventory():contains(self.item)
end
```

#### `waitToStart()`
Return true to delay action start (e.g., waiting for pathfinding).

```lua
function MyAction:waitToStart()
    return false  -- Start immediately
end
```

#### `start()`
Called once when action begins. Set up animations, sounds, job text.

```lua
function MyAction:start()
    -- Set animation
    self:setActionAnim(CharacterActionAnims.Craft)

    -- Set hand models
    self:setOverrideHandModels(self.tool, self.item)

    -- Play sound
    self.sound = self.character:playSound("CraftingSound")

    -- Set progress bar text
    self.item:setJobType("Crafting...")
    self.item:setJobDelta(0.0)
end
```

#### `update()`
Called every tick during action. Update progress, sounds, validity.

```lua
function MyAction:update()
    -- Update progress display
    self.item:setJobDelta(self:getJobDelta())

    -- Loop sound if needed
    if not self.character:getEmitter():isPlaying(self.sound) then
        self.sound = self.character:playSound("CraftingSound")
    end

    -- Optional: face target
    self.character:faceThisObject(self.targetObject)
end
```

#### `perform()`
Called on successful completion. Apply effects, then call parent.

```lua
function MyAction:perform()
    -- Stop sounds
    if self.sound then
        self.character:stopOrTriggerSound(self.sound)
    end

    -- Apply action effect
    self.item:Use()

    -- Clean up
    self.item:setJobDelta(0.0)

    -- CRITICAL: Must call parent to finish properly
    ISBaseTimedAction.perform(self)
end
```

#### `stop()`
Called when action is cancelled. Clean up partial work.

```lua
function MyAction:stop()
    -- Stop sounds
    if self.sound then
        self.character:stopOrTriggerSound(self.sound)
    end

    -- Reset progress display
    self.item:setJobDelta(0.0)

    -- Optional: partial effect application
    if self:getJobDelta() > 0.5 then
        self:applyPartialEffect()
    end

    -- CRITICAL: Must call parent to clean up queue
    ISBaseTimedAction.stop(self)
end
```

### Animation Methods

#### `setActionAnim(animName, displayItemModels)`
Set the character animation.

```lua
-- Using CharacterActionAnims enum
self:setActionAnim(CharacterActionAnims.Craft)
self:setActionAnim(CharacterActionAnims.Eat)
self:setActionAnim(CharacterActionAnims.Drink)
self:setActionAnim(CharacterActionAnims.Read)

-- Using string name
self:setActionAnim("Loot")
```

#### `setOverrideHandModels(primaryHand, secondaryHand, resetModel)`
Set items displayed in character's hands.

```lua
-- Using item objects
self:setOverrideHandModels(self.hammer, self.nail)

-- Primary hand only
self:setOverrideHandModels(self.item, nil)

-- Clear hand models
self:setOverrideHandModels(nil, nil, true)
```

#### `setOverrideHandModelsString(primaryHand, secondaryHand, resetModel)`
Set hand models using model name strings.

```lua
self:setOverrideHandModelsString("Hammer", "Plank", true)
```

#### `setAnimVariable(key, value)`
Set animation blend variables.

```lua
self:setAnimVariable("FoodType", "can")
self:setAnimVariable("WeaponType", "Hammer")
```

### Progress Methods

#### `getJobDelta()`
Get current progress (0.0 to 1.0).

```lua
local progress = self:getJobDelta()
if progress > 0.5 then
    print("More than half done!")
end
```

#### `resetJobDelta()`
Reset progress to 0.

```lua
self:resetJobDelta()
```

#### `setTime(time)`
Set action duration.

```lua
self:setTime(200)  -- 200 ticks
```

#### `setCurrentTime(time)`
Set current progress time.

```lua
self:setCurrentTime(100)  -- Jump to tick 100
```

### Control Methods

#### `forceComplete()`
Immediately complete the action successfully.

```lua
if self.shouldSkip then
    self:forceComplete()
end
```

#### `forceStop()`
Immediately cancel the action.

```lua
if self.shouldCancel then
    self:forceStop()
end
```

#### `addAfter(action)`
Add another action to run after this one.

```lua
local nextAction = ISAnotherAction:new(self.character, ...)
self:addAfter(nextAction)
```

---

## ISTimedActionQueue API Reference

### Static Methods

#### `ISTimedActionQueue.add(action)`
Add action to character's queue. This is the primary way to start actions.

```lua
local action = ISEatFoodAction:new(player, food, 1.0)
ISTimedActionQueue.add(action)
```

#### `ISTimedActionQueue.addAfter(previousAction, newAction)`
Insert action after a specific action in queue.

```lua
local secondAction = ISSecondAction:new(player, ...)
ISTimedActionQueue.addAfter(firstAction, secondAction)
```

#### `ISTimedActionQueue.queueActions(character, addActionsFunction, ...)`
Queue multiple actions atomically. Actions added inside the function are grouped.

```lua
ISTimedActionQueue.queueActions(player, function(player, item1, item2)
    ISTimedActionQueue.add(ISAction1:new(player, item1))
    ISTimedActionQueue.add(ISAction2:new(player, item2))
end, myItem1, myItem2)
```

#### `ISTimedActionQueue.clear(character)`
Cancel current action and clear the queue.

```lua
ISTimedActionQueue.clear(player)
```

#### `ISTimedActionQueue.hasAction(action)`
Check if action is still in queue.

```lua
if ISTimedActionQueue.hasAction(myAction) then
    print("Action still queued")
end
```

#### `ISTimedActionQueue.isPlayerDoingAction(playerObj)`
Check if player has any active action.

```lua
if not ISTimedActionQueue.isPlayerDoingAction(player) then
    -- Player is idle, can start new action
end
```

#### `ISTimedActionQueue.getTimedActionQueue(character)`
Get the queue object for a character.

```lua
local queue = ISTimedActionQueue.getTimedActionQueue(player)
local currentAction = queue.current
```

---

## Time Modifiers

The `adjustMaxTime()` method automatically applies penalties:

### Mood Penalty
```lua
-- +10 ticks per unhappiness moodle level
maxTime = maxTime + (character:getMoodles():getMoodleLevel(MoodleType.Unhappy) * 10)
```

### Hand Wound Penalty
```lua
-- Add pain from hand/arm injuries (unless ignoreHandsWounds is set)
for i = Hand_L to ForeArm_R do
    maxTime = maxTime + bodyPart:getPain()
end
```

### Temperature Modifier
```lua
-- Applied last via Java
maxTime = maxTime * character:getTimedActionTimeModifier()
```

### Skipping Modifiers
```lua
function MyAction:new(character, item)
    local o = ISBaseTimedAction.new(self, character)
    o.ignoreHandsWounds = true  -- Don't add hand wound time
    o.maxTime = 100
    return o
end
```

---

## Common Action Patterns

### Minimal Action (Instant Effect)

```lua
require "TimedActions/ISBaseTimedAction"

ISMyQuickAction = ISBaseTimedAction:derive("ISMyQuickAction")

function ISMyQuickAction:isValid()
    return true
end

function ISMyQuickAction:start()
end

function ISMyQuickAction:update()
end

function ISMyQuickAction:stop()
    ISBaseTimedAction.stop(self)
end

function ISMyQuickAction:perform()
    -- Do the thing
    self.targetObject:doSomething()
    ISBaseTimedAction.perform(self)
end

function ISMyQuickAction:new(character, target, time)
    local o = ISBaseTimedAction.new(self, character)
    o.targetObject = target
    o.stopOnWalk = true
    o.stopOnRun = true
    o.maxTime = time
    return o
end
```

### Item Consumption Action

```lua
require "TimedActions/ISBaseTimedAction"

ISConsumeItemAction = ISBaseTimedAction:derive("ISConsumeItemAction")

function ISConsumeItemAction:isValid()
    return self.character:getInventory():contains(self.item)
end

function ISConsumeItemAction:start()
    self.item:setJobType(getText("ContextMenu_Use"))
    self.item:setJobDelta(0.0)
    self:setActionAnim(CharacterActionAnims.Craft)
    self:setOverrideHandModels(self.item, nil)
end

function ISConsumeItemAction:update()
    self.item:setJobDelta(self:getJobDelta())
end

function ISConsumeItemAction:stop()
    self.item:setJobDelta(0.0)
    ISBaseTimedAction.stop(self)
end

function ISConsumeItemAction:perform()
    self.item:setJobDelta(0.0)
    -- Apply effect
    self.character:getStats():setEndurance(
        self.character:getStats():getEndurance() + 0.2
    )
    -- Remove item
    self.character:getInventory():Remove(self.item)
    ISBaseTimedAction.perform(self)
end

function ISConsumeItemAction:new(character, item)
    local o = ISBaseTimedAction.new(self, character)
    o.item = item
    o.maxTime = 100
    o.stopOnWalk = false
    o.stopOnRun = true
    return o
end
```

### World Object Interaction

```lua
require "TimedActions/ISBaseTimedAction"

ISInteractWithObject = ISBaseTimedAction:derive("ISInteractWithObject")

function ISInteractWithObject:isValid()
    -- Check object still exists
    local sq = self.object:getSquare()
    return sq and sq:getObjects():contains(self.object)
end

function ISInteractWithObject:start()
    self:setActionAnim("Loot")
end

function ISInteractWithObject:update()
    self.character:faceThisObject(self.object)
end

function ISInteractWithObject:stop()
    ISBaseTimedAction.stop(self)
end

function ISInteractWithObject:perform()
    -- Interact with object
    self.object:toggle()
    ISBaseTimedAction.perform(self)
end

function ISInteractWithObject:new(character, object, time)
    local o = ISBaseTimedAction.new(self, character)
    o.object = object
    o.maxTime = time or 50
    o.stopOnWalk = true
    o.stopOnRun = true
    return o
end
```

### Action with Sound

```lua
require "TimedActions/ISBaseTimedAction"

ISSoundAction = ISBaseTimedAction:derive("ISSoundAction")

function ISSoundAction:isValid()
    return self.character:getInventory():contains(self.item)
end

function ISSoundAction:start()
    self.item:setJobType("Working...")
    self.item:setJobDelta(0.0)
    self.sound = self.character:playSound(self.soundName)
    self:setActionAnim(CharacterActionAnims.Craft)
end

function ISSoundAction:update()
    self.item:setJobDelta(self:getJobDelta())
    -- Loop sound
    if not self.character:getEmitter():isPlaying(self.sound) then
        self.sound = self.character:playSound(self.soundName)
    end
end

function ISSoundAction:stop()
    if self.sound and self.character:getEmitter():isPlaying(self.sound) then
        self.character:stopOrTriggerSound(self.sound)
    end
    self.item:setJobDelta(0.0)
    ISBaseTimedAction.stop(self)
end

function ISSoundAction:perform()
    if self.sound and self.character:getEmitter():isPlaying(self.sound) then
        self.character:stopOrTriggerSound(self.sound)
    end
    self.item:setJobDelta(0.0)
    -- Apply effect...
    ISBaseTimedAction.perform(self)
end

function ISSoundAction:new(character, item, soundName)
    local o = ISBaseTimedAction.new(self, character)
    o.item = item
    o.soundName = soundName or "Hammering"
    o.maxTime = 200
    o.sound = 0
    return o
end
```

### Action with Partial Completion

```lua
require "TimedActions/ISBaseTimedAction"

ISPartialAction = ISBaseTimedAction:derive("ISPartialAction")

function ISPartialAction:isValid()
    return self.character:getInventory():contains(self.item)
end

function ISPartialAction:start()
    self.item:setJobType("Processing...")
    self.item:setJobDelta(0.0)
end

function ISPartialAction:update()
    self.item:setJobDelta(self:getJobDelta())
end

function ISPartialAction:stop()
    -- Apply partial effect based on progress
    local progress = self:getJobDelta()
    if progress > 0.1 then
        local partialAmount = math.floor(self.totalAmount * progress)
        self.character:getInventory():AddItem("Base.PartialResult")
        print("Partial completion: " .. partialAmount .. "/" .. self.totalAmount)
    end
    self.item:setJobDelta(0.0)
    ISBaseTimedAction.stop(self)
end

function ISPartialAction:perform()
    self.item:setJobDelta(0.0)
    -- Full completion
    for i = 1, self.totalAmount do
        self.character:getInventory():AddItem("Base.Result")
    end
    self.character:getInventory():Remove(self.item)
    ISBaseTimedAction.perform(self)
end

function ISPartialAction:new(character, item, amount)
    local o = ISBaseTimedAction.new(self, character)
    o.item = item
    o.totalAmount = amount or 10
    o.maxTime = 100 * o.totalAmount
    return o
end
```

---

## Chaining Actions

### Sequential Actions

```lua
-- Queue multiple actions to run in sequence
local player = getPlayer()

ISTimedActionQueue.add(ISWalkToAction:new(player, targetSquare))
ISTimedActionQueue.add(ISOpenDoorAction:new(player, door))
ISTimedActionQueue.add(ISSearchAction:new(player, container))
```

### Conditional Chains

```lua
-- Using addAfter for dependent actions
local walkAction = ISWalkToAction:new(player, targetSquare)
ISTimedActionQueue.add(walkAction)

local openAction = ISOpenDoorAction:new(player, door)
walkAction:addAfter(openAction)
```

### Atomic Action Groups

```lua
-- All actions added together - if one fails, all fail
ISTimedActionQueue.queueActions(player, function(player, materials)
    for _, material in ipairs(materials) do
        ISTimedActionQueue.add(ISProcessMaterialAction:new(player, material))
    end
end, myMaterials)
```

---

## Integration Points

### From Context Menus

```lua
-- In ISWorldObjectContextMenu or similar
local function onRepairOption(worldobjects, player, object)
    local action = ISRepairAction:new(player, object, 200)
    ISTimedActionQueue.add(action)
end

-- Add to context menu
context:addOption("Repair", worldobjects, onRepairOption, player, object)
```

### From Recipes

Crafting recipes automatically create ISCraftAction when performed.

### From Events

```lua
Events.OnPlayerUpdate.Add(function(player)
    -- Check conditions, maybe queue action
    if shouldAutoAction(player) then
        local action = ISAutoAction:new(player, ...)
        ISTimedActionQueue.add(action)
    end
end)
```

---

## Debugging Actions

### Logging

```lua
function MyAction:start()
    print("MyAction started for " .. self.character:getUsername())
end

function MyAction:perform()
    print("MyAction completed, delta: " .. self:getJobDelta())
    ISBaseTimedAction.perform(self)
end

function MyAction:stop()
    print("MyAction cancelled at " .. (self:getJobDelta() * 100) .. "% progress")
    ISBaseTimedAction.stop(self)
end
```

### Server Logging

Actions with a `Type` property are logged if enabled in server options:

```lua
function MyAction:new(character, ...)
    local o = ISBaseTimedAction.new(self, character)
    o.Type = "MyAction"  -- Used for ClientActionLogs
    return o
end

-- Optional: Add extra log data
function MyAction:getExtraLogData()
    return { self.item:getFullType(), tostring(self.targetX) }
end
```

---

## All Vanilla Timed Actions (139 files)

### Core Actions
- ISEatFoodAction - Eating/drinking
- ISCraftAction - Recipe crafting
- ISBuildAction - Construction
- ISDestroyStuffAction - Destruction/dismantling
- ISDismantleAction - Furniture disassembly

### Item Actions
- ISEquipWeaponAction - Equip weapons
- ISGrabItemAction - Pick up items
- ISDropItemAction - Drop items
- ISTransferItemsAction - Move items between containers
- ISConsolidateDrainable - Combine drainables

### World Interaction
- ISOpenCloseDoor - Doors
- ISOpenCloseWindow - Windows
- ISOpenCloseCurtain - Curtains
- ISSmashWindow - Break windows
- ISClimbOverFence - Climb fences
- ISClimbSheetRopeAction - Use sheet ropes

### Vehicle Actions (in Vehicles/TimedActions/)
- ISEnterVehicle - Enter vehicles
- ISExitVehicle - Exit vehicles
- ISInstallVehiclePart - Install parts
- ISUninstallVehiclePart - Remove parts
- ISRepairEngine - Fix engines
- ISHotwireVehicle - Hotwire

### Medical Actions
- ISMedicalCheckAction - Examine wounds
- ISApplyBandage - Apply bandages
- ISSplintAction - Apply splints
- ISCleanBurn - Clean burns
- ISComfreyCataplasm - Apply poultice

### Building Actions (in BuildingObjects/TimedActions/)
- ISBuildAction - Generic building
- ISMultiStageBuild - Multi-stage construction
- ISPaintAction - Paint surfaces
- ISPlasterAction - Apply plaster

### Camping Actions (in Camping/TimedActions/)
- ISPlaceCampfireAction - Place campfires
- ISLightFromKindle - Light from kindling
- ISLightFromPetrol - Light with gas
- ISAddFuelAction - Add fuel

### Farming Actions (in Farming/TimedActions/)
- ISPlowAction - Plow ground
- ISSeedAction - Plant seeds
- ISHarvestPlantAction - Harvest crops
- ISWaterPlantAction - Water plants

### Foraging Actions (in Foraging/)
- ISForageAction - Foraging
- ISScavengeAction - Search mode

### Fishing Actions (in Fishing/TimedActions/)
- ISFishingAction - Fishing activity

---

## Performance Considerations

1. **Keep isValid() fast** - Called every tick
2. **Don't create objects in update()** - Causes GC pressure
3. **Use sounds sparingly** - Can cause audio issues if spammed
4. **Clean up in stop()** - Memory leaks if sounds/references not cleared

---

## Related Systems

- **Events System** - OnPlayerUpdate for monitoring actions
- **Context Menus** - Primary trigger for player actions
- **Recipe System** - ISCraftAction for crafting
- **Animation System** - CharacterActionAnims, setAnimVariable
- **Sound System** - playSound, stopOrTriggerSound

---

## Documentation Status

| Component | Status |
|-----------|--------|
| ISBaseTimedAction class | Complete |
| ISTimedActionQueue class | Complete |
| Lifecycle documentation | Complete |
| All methods documented | Complete |
| Code examples | Complete |
| Integration points | Complete |
| Vanilla action catalog | Complete |
