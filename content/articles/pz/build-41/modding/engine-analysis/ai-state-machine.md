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
  - text: "Overview"
    link: "#overview"
  - text: "Prerequisites"
    link: "#prerequisites"
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

## Overview

Ever notice how a zombie will wander aimlessly until it hears a sound, then turn toward it, then chase you, then attack? That sequence of behaviors is controlled by a **state machine** - the zombie switches between different "states" like Idle → Alert → Chase → Attack.

This reference documents PZ's AI state system discovered through engine decompilation.

**You would use this when:**
- You want to understand why zombies behave the way they do
- You're debugging zombie behavior that seems wrong
- You want to affect zombie AI through attribute modification
- You're building systems that interact with zombie navigation

> **This is an advanced reference with 50+ states documented.** You don't need to memorize them all. Most modders only need to know that states exist and how to affect behavior through zombie attributes (speedType, cognition, etc.).

## Prerequisites

Before diving in:
- [IsoZombie Reference](/pz/build-41/modding/engine-analysis/isozombie-reference) - Zombie attributes
- [Zombie Attribute Optimization](/pz/build-41/modding/engine-analysis/zombie-attribute-optimization) - Modifying behavior

> **What's a state machine?** A way of organizing behavior into discrete modes. A zombie can only be in one state at a time - either wandering OR attacking OR climbing, not all at once. Each state controls what the zombie does until something triggers a switch to another state.

## Architecture

### Core Components

```
GameCharacterAIBrain.java (~222 lines)
├── StateMachine.java
│   └── Manages state transitions
├── State.java
│   └── Base state class
└── states/
    └── 50+ individual AI states
```

### GameCharacterAIBrain.java

**Purpose:** Central AI controller for all characters

**Key Responsibilities:**
- State machine management
- Pathfinding coordination
- Behavior decision making
- State transitions

## State Machine System

### How States Work

Each character has an active state that controls their behavior:

```
Character
└── AIBrain
    └── StateMachine
        ├── currentState (active behavior)
        ├── previousState (for returns)
        └── stateStack (nested states)
```

### State Lifecycle

```lua
-- Pseudocode of state lifecycle
function State:enter(character)
    -- Called when entering this state
end

function State:update(character)
    -- Called every frame while active
    -- Return next state or nil to continue
end

function State:exit(character)
    -- Called when leaving this state
end
```

## Zombie AI States

### Primary States

| State | Purpose | Triggers |
|-------|---------|----------|
| `ZombieIdleState` | Wandering, no target | Default state |
| `ZombieFakeDeadState` | Playing dead | Sandbox setting |
| `ZombieFallingState` | Falling animation | Height change |
| `ZombieGetUpState` | Standing up | After knockdown |
| `ZombieEatBodyState` | Feeding on corpse | Body nearby |
| `ZombieHitReactionState` | Reacting to hit | Taking damage |
| `ZombieTurnAlertedState` | Turning to sound | Heard noise |
| `ZombieOnGroundState` | Crawling/downed | Leg damage |

### Combat States

| State | Purpose | Triggers |
|-------|---------|----------|
| `AttackState` | Attacking target | In range |
| `LungeState` | Lunge attack | Lunger zombie |
| `ThumpState` | Attacking door/window | Blocked path |
| `ClimbThroughWindowState` | Entering window | Path through window |
| `ClimbOverFenceState` | Climbing fence | Fence in path |

### Movement States

| State | Purpose | Triggers |
|-------|---------|----------|
| `PathFindState` | Following path | Has target |
| `WalkTowardState` | Walking to point | Simple movement |
| `StaggerBackState` | Pushed back | Hit by player |
| `BumpedState` | Bumped by other | Collision |

## Player AI States

### Action States

| State | Purpose |
|-------|----------|
| `PlayerActionsState` | Performing timed action |
| `PlayerAimState` | Aiming weapon |
| `PlayerEmoteState` | Playing emote |
| `PlayerFallDownState` | Falling over |
| `PlayerGetUpState` | Getting up |
| `PlayerHitReactionState` | Reacting to damage |
| `PlayerKnockedDown` | On ground |
| `PlayerStrafeState` | Strafing movement |

### Special States

| State | Purpose |
|-------|----------|
| `ClimbSheetRopeState` | Using sheet rope |
| `ClimbDownSheetRopeState` | Descending rope |
| `SwipeStatePlayer` | Swinging weapon |
| `IdleState` | Player idle |

## Pathfinding System

### A* Pathfinder

**Class:** `AStarPathFinder.java`

**Algorithm:** A* (A-star) pathfinding

**Key Features:**
- Grid-based navigation
- Obstacle avoidance
- Dynamic path recalculation
- Cost-based routing

### Pathfinding Components

```
AStarPathFinder
├── openList (nodes to explore)
├── closedList (explored nodes)
├── path (result)
└── heuristic (distance estimate)
```

### Map Knowledge System

Zombies remember blocked paths:

```java
// Simplified concept
public class MapKnowledge {
    HashSet<Edge> blockedEdges;  // Remembered blocked paths
    
    public void rememberBlocked(Edge edge) {
        blockedEdges.add(edge);
    }
    
    public boolean isKnownBlocked(Edge edge) {
        return blockedEdges.contains(edge);
    }
}
```

**Modding Relevance:** Zombies can "learn" that certain paths are blocked, affecting their navigation over time.

## State Transitions

### Zombie State Flow

```
                    ┌─────────────────┐
                    │  ZombieIdleState │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ PathFind │   │  Thump   │   │  Attack  │
       │  State   │   │  State   │   │  State   │
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

### Transition Conditions

```lua
-- Conceptual transition logic
function ZombieIdleState:update(zombie)
    -- Check for targets
    local target = zombie:getTarget()
    if target then
        if zombie:canAttack(target) then
            return AttackState:new()
        else
            return PathFindState:new(target)
        end
    end
    
    -- Check for sounds
    local sound = zombie:getLastHeardSound()
    if sound then
        return ZombieTurnAlertedState:new(sound)
    end
    
    -- Continue idling
    return nil
end
```

## Modding AI Behavior

### Hooking into AI Updates

```lua
local function onZombieUpdate(zombie)
    -- Access current state (if exposed)
    -- Modify behavior based on conditions
    
    -- Example: Make zombies in certain areas more aggressive
    local x, y = zombie:getX(), zombie:getY()
    if isInDangerZone(x, y) then
        zombie.cognition = 1  -- Smart
        zombie.hearing = 1    -- Pinpoint
    end
end

Events.OnZombieUpdate.Add(onZombieUpdate)
```

### Affecting Pathfinding

While you can't directly modify the pathfinder, you can affect navigation through:

1. **Blocking paths** - Place obstacles
2. **Modifying terrain costs** - Through world objects
3. **Distracting zombies** - Create sounds

```lua
-- Create distraction sound
local function createDistraction(x, y, z, radius)
    addSound(nil, x, y, z, radius, radius)
end
```

### Custom Behavior Patterns

```lua
-- Zone-based behavior modification
local ZoneBehavior = {}

ZoneBehavior.ZONES = {
    SAFE = { speedType = 3, cognition = 3 },      -- Slow, dumb
    NORMAL = { speedType = 2, cognition = 3 },    -- Normal
    DANGER = { speedType = 1, cognition = 1 },    -- Fast, smart
}

function ZoneBehavior.applyZone(zombie, zoneName)
    local zone = ZoneBehavior.ZONES[zoneName]
    if zone then
        zombie.speedType = zone.speedType
        zombie.cognition = zone.cognition
    end
end
```

## Performance Considerations

### AI Update Frequency

Not all AI updates every frame:

| Update Type | Frequency | Purpose |
|-------------|-----------|----------|
| Full update | Every frame | Active combat |
| Partial update | Every N frames | Idle zombies |
| Culled | When visible | Off-screen optimization |

### Optimizing AI Mods

```lua
-- Bad: Process every zombie every frame
local function onTick()
    local zombies = getCell():getZombieList()
    for i = 0, zombies:size() - 1 do
        processZombie(zombies:get(i))  -- Expensive!
    end
end

-- Better: Process in batches
local processIndex = 0
local BATCH_SIZE = 10

local function onTick()
    local zombies = getCell():getZombieList()
    local count = zombies:size()
    
    for i = 1, BATCH_SIZE do
        local idx = (processIndex + i - 1) % count
        processZombie(zombies:get(idx))
    end
    
    processIndex = (processIndex + BATCH_SIZE) % count
end
```

## Related Classes

| Class | Lines | Purpose |
|-------|-------|----------|
| `GameCharacterAIBrain.java` | ~222 | AI controller |
| `StateMachine.java` | ~150 | State management |
| `State.java` | ~100 | Base state class |
| `AStarPathFinder.java` | ~800 | Pathfinding |
| `ZombiePopulationManager.java` | ~500 | Spawn management |

## Key Takeaways

1. **State machine architecture** - All AI uses states
2. **50+ built-in states** - Cover most behaviors
3. **A* pathfinding** - Grid-based navigation
4. **Map knowledge** - Zombies remember blocked paths
5. **Performance optimized** - Not all zombies update every frame
6. **Modify via attributes** - speedType, cognition, etc. affect state behavior
7. **Can't add custom states** - But can affect existing behavior through attributes and events
