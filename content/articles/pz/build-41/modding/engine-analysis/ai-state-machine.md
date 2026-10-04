---
id: engine-analysis-ai-state-machine
slug: ai-state-machine
title: "AI State Machine Reference"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: advanced
tags:
  - advanced
  - ai
  - state-machine
  - pathfinding
  - zombie
  - npc
  - behavior
excerpt: "Reference for Project Zomboid's state machine AI system. Documents 50+ AI states for zombies and players, A* pathfinding, map knowledge, and performance optimization patterns."
table_of_contents:
  - text: "What Is the AI State Machine?"
    link: "#what-is-the-ai-state-machine"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Understanding States: Simple Example"
    link: "#understanding-states-simple-example"
  - text: "Architecture"
    link: "#architecture"
  - text: "State Machine System"
    link: "#state-machine-system"
  - text: "Zombie AI States"
    link: "#zombie-ai-states"
  - text: "Player AI States"
    link: "#player-ai-states"
  - text: "Pathfinding System"
    link: "#pathfinding-system"
  - text: "State Transitions"
    link: "#state-transitions"
  - text: "Modding AI Behavior"
    link: "#modding-ai-behavior"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Performance Considerations"
    link: "#performance-considerations"
  - text: "Related Classes"
    link: "#related-classes"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "IsoZombie Reference"
    path: /pz/build-41/modding/engine-analysis/isozombie-reference
  - title: "Zombie Attribute Optimization"
    path: /pz/build-41/modding/engine-analysis/zombie-attribute-optimization
  - title: "Events Overview"
    path: /pz/build-41/modding/lua-api/events-overview
last_updated: 2026-01-28
---

# AI State Machine Reference

> Understand how zombies "think" - from idle wandering to targeted attacks - through Project Zomboid's state machine system.

---

## What Is the AI State Machine?

You're watching a zombie through a window. It wanders aimlessly, dragging its feet in random circles. Then you knock on the glass. The zombie's head snaps toward the sound. It walks to the window. It starts thumping. You move away and it follows you along the glass, never stopping.

That sequence - Wander → Turn Toward Sound → Walk to Target → Attack Barrier → Track Target - is controlled by a **state machine**. The zombie switches between different behavioral "states", and each state determines what it does until something triggers a switch to another state.

When I first saw zombies gathering at my base's walls instead of dispersing, I couldn't figure out why. They'd heard me inside, entered their "PathFind" state, reached the wall (their closest point to me), and switched to "Thump" state. They'd stay in Thump state forever because they were making progress (damaging the wall). Understanding these states explained everything about zombie behavior that seemed mysterious before.

This reference documents PZ's AI state system discovered through engine decompilation. It contains 50+ states, but don't worry - you don't need to memorize them all. Most modders only need to understand that states exist and how to influence behavior through zombie attributes.

**You would use this reference when:**
- You're debugging zombie behavior that seems wrong
- You want to understand why zombies react to certain situations
- You're building systems that interact with zombie navigation
- You want to modify zombie AI through attribute changes

---

## Prerequisites

Before diving into this advanced reference, you should understand:
- Basic Lua modding for PZ ([Lua API Basics](../lua-api/lua-basics))
- [IsoZombie Reference](./isozombie-reference) - Zombie object properties
- [Zombie Attribute Optimization](./zombie-attribute-optimization) - How to modify zombie behavior

This is an **advanced reference document**. If you're just starting modding, you might want to begin with simpler articles and return here when you need to understand AI behavior deeply.

---

## Understanding States: Simple Example

Before we look at all 50+ states, let's understand what a state machine is with the simplest possible example.

### What Is a State?

A **state** is a mode of behavior. A zombie can only be in one state at a time:

- **Idle** - Wandering aimlessly
- **Alert** - Heard something, turning toward it
- **Chase** - Moving toward a target
- **Attack** - In range, attacking

The zombie can't be "wandering" and "attacking" simultaneously - it's always in exactly one state.

### Simple State Machine

```
  ┌──────┐  hear sound   ┌───────┐  reach target   ┌────────┐
  │ Idle │ ───────────> │ Alert │ ─────────────> │ Chase  │
  └──────┘               └───────┘                 └────────┘
     ▲                                                  │
     │                                                  │ in range
     │                                                  ▼
     │                                              ┌────────┐
     │ target lost                                  │ Attack │
     └──────────────────────────────────────────────┴────────┘
```

### Why This Matters for Modding

You can't add custom states to PZ's state machine (it's engine code), but you **can** affect which states zombies enter and how they behave in those states by modifying zombie attributes:

```lua
-- Slow zombie = more time in PathFind state
zombie.speedType = 3  -- Slow shambler

-- Smart zombie = enters Alert state from farther away
zombie.cognition = 1  -- Smart, detects targets easily

-- Deaf zombie = less likely to enter Alert state from sounds
zombie.hearing = 3  -- Poor hearing
```

Understanding states helps you predict how attribute changes affect behavior.

---

## Architecture

### Core Components

PZ's AI is implemented in several Java classes:

```
GameCharacterAIBrain.java (~222 lines)
├── StateMachine.java
│   └── Manages transitions between states
├── State.java
│   └── Base class all states inherit from
└── states/
    ├── ZombieIdleState.java
    ├── AttackState.java
    ├── PathFindState.java
    └── [50+ more states]
```

### GameCharacterAIBrain.java

**Purpose:** The "brain" that controls all character AI

**Key Responsibilities:**
- Runs the active state each frame
- Handles state transitions
- Coordinates pathfinding
- Makes high-level behavior decisions

**Location in engine:** `zombie/characters/ai/GameCharacterAIBrain.java`

**Modding relevance:** You can't modify this directly, but understanding it helps you predict behavior.

---

## State Machine System

### How States Work

Every character (zombie or player) has an AI brain with a state machine:

```
IsoZombie (the zombie object)
└── AIBrain (GameCharacterAIBrain)
    └── StateMachine
        ├── currentState (what it's doing right now)
        ├── previousState (for returning to previous behavior)
        └── stateStack (for nested states like "climbing while chasing")
```

### State Lifecycle

Each state has three phases:

```lua
-- Conceptual lifecycle (actual implementation is Java)
function State:enter(character)
    -- Called once when entering this state
    -- Example: "Start walk animation"
end

function State:update(character)
    -- Called every frame while in this state
    -- Example: "Move toward target, check if in range"
    -- Returns: next state to switch to, or nil to continue
end

function State:exit(character)
    -- Called once when leaving this state
    -- Example: "Stop walk animation"
end
```

**Why this matters:** Understanding this lifecycle helps you predict when behavior changes. For example, a zombie in Attack state won't check for new targets until it exits that state.

---

## Zombie AI States

This looks like a lot of states (50+), but they fall into logical categories. You don't need to memorize them - just know where to look when you need to understand specific behavior.

### Primary States (Basic Behavior)

These are the states zombies spend most time in:

| State | What Zombie Does | What Triggers Entry |
|-------|-----------------|-------------------|
| `ZombieIdleState` | Wanders aimlessly, slow rotation | Default state, no targets or sounds |
| `ZombieFakeDeadState` | Lies motionless on ground | Sandbox setting: "Zombies can play dead" |
| `ZombieGetUpState` | Standing up from prone | After being knocked down |
| `ZombieEatBodyState` | Feeding on dead body | Body nearby + hungry |
| `ZombieOnGroundState` | Crawling on ground | Legs broken/destroyed |

**Example behavior flow:**
1. Zombie spawns → `ZombieIdleState` (wanders)
2. Gets knocked down → `ZombieGetUpState` (stands up) → Back to `ZombieIdleState`

---

### Combat States

When zombies detect targets or obstacles:

| State | What Zombie Does | What Triggers Entry |
|-------|-----------------|-------------------|
| `AttackState` | Lunges/swipes at target | Target in melee range |
| `LungeState` | Special lunge attack | Zombie is "lunger" type |
| `ThumpState` | Pounds on door/window | Blocked by destructible object |
| `ClimbThroughWindowState` | Climbing through window | Path requires window entry |
| `ClimbOverFenceState` | Climbing over fence | Fence in shortest path |
| `ZombieHitReactionState` | Recoils from damage | Takes damage from player |

**Example behavior flow:**
1. Zombie sees player → `PathFindState` (navigates toward)
2. Reaches door → `ThumpState` (attacks door)
3. Door breaks → `PathFindState` (continues chasing)
4. In range → `AttackState` (attacks player)
5. Player hits zombie → `ZombieHitReactionState` (staggers) → Back to `AttackState`

---

### Movement States

States related to navigation and locomotion:

| State | What Zombie Does | What Triggers Entry |
|-------|-----------------|-------------------|
| `PathFindState` | Following calculated path | Has target, path computed |
| `WalkTowardState` | Walking to specific point | Simple direct movement needed |
| `ZombieTurnAlertedState` | Rotating toward sound | Heard noise from direction |
| `StaggerBackState` | Pushed backward | Strong hit or shove |
| `BumpedState` | Adjusting after collision | Bumped into another zombie |
| `ZombieFallingState` | Falling animation | Height change (stairs, ledge) |

**Example behavior flow:**
1. Zombie hears door knock → `ZombieTurnAlertedState` (rotates toward sound)
2. After rotation → `PathFindState` (walks toward source)
3. Bumps another zombie → `BumpedState` (adjusts position) → Back to `PathFindState`

---

## Player AI States

Players also use states for their actions:

### Action States

| State | What Player Does |
|-------|-----------------|
| `PlayerActionsState` | Performing timed action (craft, eat, etc.) |
| `PlayerAimState` | Aiming ranged weapon |
| `PlayerEmoteState` | Playing emote animation |
| `PlayerHitReactionState` | Reacting to taking damage |
| `PlayerKnockedDown` | Lying on ground after fall |
| `PlayerGetUpState` | Standing up from prone |
| `PlayerStrafeState` | Strafing while facing direction |
| `SwipeStatePlayer` | Melee weapon swing animation |

### Special States

| State | What Player Does |
|-------|-----------------|
| `ClimbSheetRopeState` | Climbing up sheet rope |
| `ClimbDownSheetRopeState` | Descending sheet rope |
| `IdleState` | Standing still, no actions |

**Why players have states:** Makes multiplayer sync easier - instead of syncing complex actions, just sync "player entered ClimbSheetRopeState".

---

## Pathfinding System

Zombies don't just walk in straight lines - they calculate paths around obstacles.

### A* Pathfinding

**Algorithm:** A* (A-star) - industry standard pathfinding

**How it works (simplified):**
1. Zombie needs to reach target
2. A* evaluates possible paths, scoring each by distance + obstacles
3. Best path selected
4. Zombie follows path nodes
5. If path blocked, recalculate

**Class:** `AStarPathFinder.java` (~800 lines)

### Pathfinding Components

```
AStarPathFinder
├── openList      // Nodes to explore next
├── closedList    // Already explored nodes
├── path          // Final calculated path
└── heuristic     // Estimates remaining distance
```

### Map Knowledge System

Here's something cool: **zombies remember blocked paths**.

```java
// Simplified concept from engine
public class MapKnowledge {
    HashSet<Edge> blockedEdges;  // Remembered blocked paths

    // Zombie tries a path, finds it blocked
    public void rememberBlocked(Edge edge) {
        blockedEdges.add(edge);    // Remember for next time
    }

    // When calculating new path
    public boolean isKnownBlocked(Edge edge) {
        return blockedEdges.contains(edge);  // Avoid known blocks
    }
}
```

**What this means for modding:**
- Zombies learn over time
- They won't repeatedly try paths they know are blocked
- This is why zombies might avoid certain routes after exploring

**Example:** Zombie tries to path through a door, finds it locked (blocked). Next time it calculates a path, it remembers that door is blocked and routes around it.

---

## State Transitions

Understanding when zombies switch states helps you predict behavior.

### Zombie State Flow

```
                    ┌─────────────────┐
                    │  ZombieIdleState │ ◄── Default
                    │   (Wandering)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ PathFind │   │  Thump   │   │  Attack  │
       │ (Chase)  │   │ (Door)   │   │ (Player) │
       └──────────┘   └──────────┘   └──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Target lost/dead │
                    │ → Return to Idle │
                    └─────────────────┘
```

### Transition Conditions (Conceptual)

```lua
-- How state transitions work (simplified from Java)
function ZombieIdleState:update(zombie)
    -- Priority 1: Check for targets
    local target = zombie:getTarget()
    if target then
        if zombie:canAttack(target) then
            return AttackState:new()  -- Switch to attack
        else
            return PathFindState:new(target)  -- Switch to chase
        end
    end

    -- Priority 2: Check for sounds
    local sound = zombie:getLastHeardSound()
    if sound then
        return ZombieTurnAlertedState:new(sound)  -- Switch to alert
    end

    -- Priority 3: Check for food (bodies)
    local body = zombie:getNearbyBody()
    if body and zombie:isHungry() then
        return ZombieEatBodyState:new(body)  -- Switch to feed
    end

    -- No transitions triggered
    return nil  -- Stay in Idle state
end
```

**Key insight:** States check conditions in priority order. A zombie will always prioritize attacking over eating, eating over investigating sounds, etc.

---

## Modding AI Behavior

You can't add new states, but you can influence which states zombies enter and how they behave.

### Influencing State Transitions

```lua
-- Make zombies more aggressive (easier to enter combat states)
local function makeAggressive(zombie)
    zombie.cognition = 1   -- Smart: detects targets from farther
    zombie.sight = 1       -- Excellent vision
    zombie.hearing = 1     -- Pinpoint hearing
end

-- Make zombies passive (harder to enter combat states)
local function makePassive(zombie)
    zombie.cognition = 3   -- Dumb: barely notices targets
    zombie.sight = 3       -- Poor vision
    zombie.hearing = 3     -- Nearly deaf
end

-- Apply to all zombies in an area
Events.OnZombieUpdate.Add(function(zombie)
    local x, y = zombie:getX(), zombie:getY()
    if isInAggroZone(x, y) then
        makeAggressive(zombie)
    end
end)
```

**Why this works:** Cognition, sight, and hearing affect the conditions checked in `ZombieIdleState:update()`. Poor senses = less likely to detect targets = stays in Idle longer.

---

### Affecting Pathfinding

While you can't modify A* directly, you can influence navigation:

#### Method 1: Create Obstacles

```lua
-- Place impassable objects to block paths
local function blockPath(x, y, z)
    local square = getSquare(x, y, z)
    -- Add furniture, walls, etc. to force rerouting
end
```

#### Method 2: Create Distractions

```lua
-- Make zombies path to a different location
local function createDistraction(x, y, z, radius)
    -- Adds sound that zombies will investigate
    addSound(nil, x, y, z, radius, radius)
end
```

#### Method 3: Modify Zombie Speed

```lua
-- Slower zombies = more time in PathFind state before reaching target
local function makeSlowChaser(zombie)
    zombie.speedType = 3  -- Shambler speed
end
```

---

### Zone-Based Behavior System

Here's a practical example of using states for gameplay:

```lua
-- Define different AI behaviors for different map zones
local ZoneBehavior = {}

ZoneBehavior.ZONES = {
    SAFE = {
        speedType = 3,    -- Slow
        cognition = 3,    -- Dumb
        hearing = 3,      -- Deaf
    },
    NORMAL = {
        speedType = 2,    -- Normal
        cognition = 3,    -- Random
        hearing = 2,      -- Normal
    },
    DANGER = {
        speedType = 1,    -- Fast
        cognition = 1,    -- Smart
        hearing = 1,      -- Pinpoint
    },
}

function ZoneBehavior.applyZone(zombie, zoneName)
    local zone = ZoneBehavior.ZONES[zoneName]
    if not zone then return end

    -- Apply zone attributes
    zombie.speedType = zone.speedType
    zombie.cognition = zone.cognition
    zombie.hearing = zone.hearing
end

-- Example usage
Events.OnZombieUpdate.Add(function(zombie)
    local x, y = zombie:getX(), zombie:getY()

    -- Determine which zone zombie is in
    if isInSafeZone(x, y) then
        ZoneBehavior.applyZone(zombie, "SAFE")
    elseif isInDangerZone(x, y) then
        ZoneBehavior.applyZone(zombie, "DANGER")
    else
        ZoneBehavior.applyZone(zombie, "NORMAL")
    end
end)
```

**Result:** Zombies behave differently based on location without modifying states directly.

---

## Common Mistakes

### Mistake 1: Assuming You Can Add Custom States

**Doesn't work:**
```lua
-- Trying to create custom AI state
local CustomChaseState = {}
zombie:setState(CustomChaseState)  -- Not possible
```

**Why:** States are engine code (Java). Lua can't add new ones.

**Works:**
```lua
-- Instead, modify behavior through attributes
zombie.speedType = 1  -- Fast zombie = aggressive chase behavior
zombie.cognition = 1  -- Smart = better at tracking
```

**Why:** Attributes affect how existing states behave.

---

### Mistake 2: Modifying Every Zombie Every Frame

**Doesn't work (performance killer):**
```lua
Events.OnTick.Add(function()
    local zombies = getCell():getZombieList()
    for i = 0, zombies:size() - 1 do
        local zombie = zombies:get(i)
        -- Complex processing on every zombie
        processZombieAI(zombie)  -- Kills FPS!
    end
end)
```

**What happens:** With 1000 zombies, this runs 60,000 times per second (60 FPS × 1000 zombies). Game freezes.

**Works (batched processing):**
```lua
local processIndex = 0
local BATCH_SIZE = 10  -- Process 10 zombies per frame

Events.OnTick.Add(function()
    local zombies = getCell():getZombieList()
    local count = zombies:size()
    if count == 0 then return end

    -- Process only BATCH_SIZE zombies this frame
    for i = 1, math.min(BATCH_SIZE, count) do
        local idx = (processIndex + i - 1) % count
        processZombieAI(zombies:get(idx))
    end

    -- Move to next batch for next frame
    processIndex = (processIndex + BATCH_SIZE) % count
end)
```

**Why:** Spreads processing across multiple frames. With 1000 zombies and batch size 10, each zombie processed once every 100 frames instead of every frame.

---

### Mistake 3: Not Understanding State Priority

**Wrong expectation:**
```lua
-- Player thinks: "I'll make noise to distract zombie from my friend"
createSound(distraction_x, distraction_y, 50)
```

**What actually happens:** Zombie in `AttackState` (actively attacking friend) doesn't switch to investigate sound. Attack has higher priority than sounds.

**Correct understanding:**
```lua
-- Zombies only investigate sounds when in Idle or low-priority states
-- To distract from attack, need to break line of sight / target lock
```

**Why:** State transitions have priorities. Once in Attack, zombie won't switch to Alert from sound alone.

---

## Try It Yourself

Let's create a simple mod that helps you see state machine behavior in action.

### Goal: Zombie Behavior Logger

Create a mod that logs when zombies change states, helping you understand the state machine.

### Step 1: Create the Logger

```lua
-- File: media/lua/client/ZombieStateLogger.lua

local ZombieStateLogger = {}
ZombieStateLogger.trackedZombies = {}

-- Track state changes for nearby zombies
function ZombieStateLogger.logState(zombie)
    local id = zombie:getOnlineID()  -- Unique zombie ID

    -- Get current "behavior" (not exact state, but observable)
    local behavior = "Unknown"
    if zombie:isAttacking() then
        behavior = "ATTACKING"
    elseif zombie:isPlayerMoving() then
        behavior = "MOVING"
    else
        behavior = "IDLE"
    end

    -- Check if state changed
    local lastBehavior = ZombieStateLogger.trackedZombies[id]
    if lastBehavior ~= behavior then
        print("[Zombie " .. id .. "] State change: " ..
              (lastBehavior or "UNKNOWN") .. " -> " .. behavior)

        -- Update tracking
        ZombieStateLogger.trackedZombies[id] = behavior
    end
end

-- Log nearby zombies every second
function ZombieStateLogger.update()
    local player = getPlayer()
    if not player then return end

    -- Get zombies near player
    local x, y = player:getX(), player:getY()
    local zombies = getCell():getZombieList()

    for i = 0, math.min(10, zombies:size() - 1) do  -- Check 10 zombies max
        local zombie = zombies:get(i)
        local dist = math.abs(zombie:getX() - x) + math.abs(zombie:getY() - y)

        if dist < 20 then  -- Within 20 tiles
            ZombieStateLogger.logState(zombie)
        end
    end
end

-- Run every 60 ticks (about 1 second)
local tickCounter = 0
Events.OnTick.Add(function()
    tickCounter = tickCounter + 1
    if tickCounter >= 60 then
        ZombieStateLogger.update()
        tickCounter = 0
    end
end)
```

### Step 2: Test It

1. Load the mod
2. Find zombies
3. Watch console as you:
   - Stand still (zombies stay IDLE)
   - Make noise (zombies switch to MOVING)
   - Let them reach you (zombies switch to ATTACKING)
   - Run away (zombies switch to MOVING or back to IDLE)

### Step 3: Observe Patterns

You'll see patterns like:
```
[Zombie 1] State change: IDLE -> MOVING
[Zombie 1] State change: MOVING -> ATTACKING
[Zombie 2] State change: IDLE -> MOVING
[Zombie 1] State change: ATTACKING -> MOVING
```

This helps you understand how zombies transition through states based on your actions.

---

## Performance Considerations

### AI Update Frequency

Not all zombies update every frame - the engine optimizes based on visibility and distance:

| Zombie Status | Update Frequency | Why |
|---------------|-----------------|-----|
| On-screen, nearby | Every frame | Need smooth animation |
| On-screen, far | Every 2-4 frames | Less noticeable lag |
| Off-screen, near player | Every 5-10 frames | Still affect gameplay |
| Off-screen, far | Every 30+ frames or paused | Save CPU |

**Modding insight:** If your mod processes "all zombies", you're fighting the engine's optimizations. Batch your processing to match the engine's approach.

---

### Optimizing AI Mods

When working with many zombies:

```lua
-- Performance pattern: Process in batches over time
local ZombieProcessor = {}
ZombieProcessor.batchIndex = 0
ZombieProcessor.BATCH_SIZE = 20  -- Adjust based on needs

function ZombieProcessor.processBatch()
    local zombies = getCell():getZombieList()
    local total = zombies:size()
    if total == 0 then return end

    -- Calculate this batch's range
    local startIdx = ZombieProcessor.batchIndex
    local endIdx = math.min(startIdx + ZombieProcessor.BATCH_SIZE - 1, total - 1)

    -- Process this batch
    for i = startIdx, endIdx do
        local zombie = zombies:get(i)
        -- Your processing here
        applyCustomBehavior(zombie)
    end

    -- Move to next batch (wrap around)
    ZombieProcessor.batchIndex = (endIdx + 1) % total
end

-- Run batch every frame - spreads work over time
Events.OnTick.Add(function()
    ZombieProcessor.processBatch()
end)
```

**Result:** With 500 zombies and batch size 20, each zombie processed every 25 frames (about twice per second) instead of 60 times per second.

---

## Related Classes

For reference, here are the engine classes involved:

| Class | Lines | Purpose |
|-------|-------|----------|
| `GameCharacterAIBrain.java` | ~222 | Central AI controller for all characters |
| `StateMachine.java` | ~150 | Manages state transitions and state stack |
| `State.java` | ~100 | Base class that all states inherit from |
| `AStarPathFinder.java` | ~800 | A* pathfinding algorithm implementation |
| `ZombiePopulationManager.java` | ~500 | Handles zombie spawning and despawning |
| `MapKnowledge.java` | ~200 | Tracks blocked paths zombies have learned |

**Note:** You can't modify these directly (engine code), but understanding their role helps you work with the system effectively.

---

## Key Takeaways

1. **State machine controls all AI** - Zombies and players both use states for behavior
2. **50+ built-in states** - Cover all vanilla behaviors from idle to climbing
3. **One state at a time** - Characters can't be in multiple states simultaneously
4. **State priority matters** - Attacking > Chasing > Investigating sounds > Idling
5. **Can't add custom states** - Engine code, but you can affect existing states through attributes
6. **A* pathfinding** - Industry standard grid-based navigation
7. **Zombies learn** - MapKnowledge system remembers blocked paths
8. **Batch processing critical** - Don't process all zombies every frame
9. **Modify via attributes** - speedType, cognition, hearing affect which states trigger
10. **Understand to predict** - Knowing states helps you anticipate zombie behavior

---

## What's Next?

- [IsoZombie Reference](./isozombie-reference) - Deep dive into zombie object properties and methods
- [Zombie Attribute Optimization](./zombie-attribute-optimization) - Practical guide to modifying zombie behavior
- [Events Overview](../lua-api/events-overview) - Hooks for intercepting AI updates
