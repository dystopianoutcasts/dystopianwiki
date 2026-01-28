---
id: engine-analysis-deterministic-randomization
slug: deterministic-randomization
title: "Deterministic Randomization Pattern"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - pattern
  - multiplayer
  - randomization
  - hash
  - zones
excerpt: "Create multiplayer-safe 'random' results using deterministic hashing. The Fibonacci hash pattern ensures the same input always produces the same output, making it perfect for zone-based difficulty, loot distribution, and procedural content."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "The Problem"
    link: "#the-problem"
  - text: "The Solution: Fibonacci Hash"
    link: "#the-solution-fibonacci-hash"
  - text: "Practical Applications"
    link: "#practical-applications"
  - text: "Implementation Patterns"
    link: "#implementation-patterns"
  - text: "Handling Zombie Pooling"
    link: "#handling-zombie-pooling"
  - text: "Performance Considerations"
    link: "#performance-considerations"
  - text: "Common Pitfalls"
    link: "#common-pitfalls"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "Related Topics"
    link: "#related-topics"
next_steps:
  - title: "Zombie Attribute Optimization"
    path: /pz/build-41/modding/engine-analysis/zombie-attribute-optimization
  - title: "IsoZombie Class Reference"
    path: /pz/build-41/modding/engine-analysis/isozombie-reference
  - title: "Performance Benchmarking Guide"
    path: /pz/build-41/modding/engine-analysis/performance-benchmarking
last_updated: 2026-01-28
---

# Deterministic Randomization Pattern

## Overview

When creating mods that need "random" but consistent results - especially in multiplayer - you need **deterministic randomization**. This pattern ensures the same input always produces the same output, making it safe for server-client synchronization.

**You would use this when:**
- You need "random" results that are the same for all players in multiplayer
- You want consistent outcomes that survive save/load
- You're building zone-based difficulty (some areas have more sprinters)
- You're creating procedural content that should be consistent

## Prerequisites

- [Zombie Attribute Optimization](/pz/build-41/modding/engine-analysis/zombie-attribute-optimization) - See this pattern in action
- Basic understanding of percentages and probability

> **Key Use Case:** Zone-based difficulty systems where zombies get attributes based on location. All clients must agree on which zombies are sprinters without network communication.

## The Problem

### Why `ZombRand()` Doesn't Work

```lua
-- BAD: Different results each time, each client
local speed = ZombRand(1, 4)  -- Different for server and client!
```

**Issues with standard random:**
- Server gets different result than client
- Reloading gives different results
- Save/load breaks consistency
- Multiple clients see different behaviors

### What We Need

- **Same input = same output** (deterministic)
- **Works on server and all clients** (multiplayer safe)
- **Persists through save/load** (consistent)
- **Fast computation** (performance)

## The Solution: Fibonacci Hash

### Core Pattern

```lua
function getObjectHash(obj)
    -- Get unique identifier
    local id = obj:getOnlineID()
    if id < 0 then
        id = obj:hashCode()  -- Fallback for single-player
    end
    
    -- Fibonacci hash (golden ratio constant)
    local hash = (id * 2654435769) % 4294967296
    
    -- Convert to 0-10000 range (0.00% to 100.00%)
    return math.floor((hash / 65536) * 10000)
end
```

### Why This Works

**The Magic Number: 2654435769**

This is `2^32 / phi` where phi is the golden ratio (~1.618). The Fibonacci hash has special properties:

1. **Uniform distribution** - Values spread evenly across the output range
2. **Avalanche effect** - Small input changes create large output changes
3. **Fast computation** - Simple multiplication and modulo
4. **No collisions** for practical purposes in our use case

**Why 0-10000 Range?**

Converting to 0-10000 gives us percentage precision to two decimal places:
- `0` = 0.00%
- `5000` = 50.00%
- `10000` = 100.00%

This allows fine-grained probability control.

## Practical Applications

### Zone-Based Zombie Difficulty

Create sprinters, smart zombies, and special attributes based on location:

```lua
-- Zone tier definitions with percentages
local TIER_CONFIG = {
    [1] = {sprinter = 0.00, smart = 0.00, pinpoint = 0.00},  -- Easy
    [2] = {sprinter = 0.10, smart = 0.05, pinpoint = 0.10},  -- Normal
    [3] = {sprinter = 0.30, smart = 0.20, pinpoint = 0.30},  -- Hard
    [4] = {sprinter = 0.60, smart = 0.50, pinpoint = 0.60},  -- Nightmare
}

function applyZoneDifficulty(zombie, tier)
    local config = TIER_CONFIG[tier]
    if not config then return end
    
    -- Get zombie's unique hash (0-10000)
    local hash = getObjectHash(zombie)
    
    -- Apply sprinter based on percentage
    -- If hash < threshold, zombie becomes sprinter
    if hash < (config.sprinter * 10000) then
        zombie.speedType = 1  -- Sprinter
    else
        zombie.speedType = 2  -- Fast shambler
    end
    
    -- Apply smart cognition
    if hash < (config.smart * 10000) then
        zombie.cognition = 1  -- Smart (opens doors)
    else
        zombie.cognition = 3  -- Default
    end
    
    -- Apply pinpoint hearing
    if hash < (config.pinpoint * 10000) then
        zombie.hearing = 1  -- Pinpoint
    else
        zombie.hearing = 2  -- Normal
    end
end
```

### Why This is Multiplayer Safe

1. **Server creates zombie** with ID 12345
2. **Server calculates hash:** `(12345 * 2654435769) % 4294967296 = X`
3. **Server applies attributes** based on hash X
4. **Client receives zombie** with ID 12345
5. **Client calculates same hash:** `(12345 * 2654435769) % 4294967296 = X` (identical!)
6. **Both agree** on zombie's attributes without network sync

### Loot Distribution

Determine rare loot without server communication:

```lua
function shouldSpawnRareItem(container)
    local hash = getObjectHash(container)
    local RARE_CHANCE = 0.05  -- 5% chance
    
    return hash < (RARE_CHANCE * 10000)
end

function fillContainer(container)
    if shouldSpawnRareItem(container) then
        container:AddItem("Outcast.RareWeapon")
    end
end
```

### Player-Specific Randomization

Give each player consistent "random" outcomes:

```lua
function getPlayerHash(player)
    local username = player:getUsername()
    
    -- Simple string hash
    local hash = 0
    for i = 1, #username do
        hash = (hash * 31 + string.byte(username, i)) % 4294967296
    end
    
    -- Apply Fibonacci hash for better distribution
    hash = (hash * 2654435769) % 4294967296
    return math.floor((hash / 65536) * 10000)
end

-- Player always gets same "random" trait bonus
function getPlayerBonus(player)
    local hash = getPlayerHash(player)
    
    if hash < 2000 then
        return "strength"  -- 20% get strength
    elseif hash < 4000 then
        return "speed"     -- 20% get speed
    elseif hash < 6000 then
        return "stealth"   -- 20% get stealth
    else
        return "none"      -- 40% get nothing
    end
end
```

## Implementation Patterns

### Complete Zombie Attribute Module

```lua
-- ZoneZombies.lua
ZoneZombies = {}

-- Constants
ZoneZombies.SPEED = {
    SPRINTER = 1,
    FAST_SHAMBLER = 2,
    SHAMBLER = 3
}

ZoneZombies.COGNITION = {
    SMART = 1,
    DEFAULT = 3
}

ZoneZombies.HEARING = {
    PINPOINT = 1,
    NORMAL = 2,
    POOR = 3
}

-- Core hash function
function ZoneZombies.getHash(obj)
    local id = obj:getOnlineID()
    if id < 0 then
        id = obj:hashCode()
    end
    local hash = (id * 2654435769) % 4294967296
    return math.floor((hash / 65536) * 10000)
end

-- Check if zombie should be processed
function ZoneZombies.shouldProcess(zombie)
    local modData = zombie:getModData()
    local currentHash = ZoneZombies.getHash(zombie)
    
    -- Already processed with same hash
    if modData.ZZ_hash == currentHash then
        return false
    end
    
    return true
end

-- Mark zombie as processed
function ZoneZombies.markProcessed(zombie)
    local modData = zombie:getModData()
    modData.ZZ_hash = ZoneZombies.getHash(zombie)
end

-- Apply tier-based attributes
function ZoneZombies.applyTier(zombie, tier, config)
    if not ZoneZombies.shouldProcess(zombie) then
        return  -- Skip already processed
    end
    
    local hash = ZoneZombies.getHash(zombie)
    
    -- Speed
    if hash < (config.sprinterPercent * 10000) then
        zombie.speedType = ZoneZombies.SPEED.SPRINTER
    else
        zombie.speedType = ZoneZombies.SPEED.FAST_SHAMBLER
    end
    
    -- Cognition
    if hash < (config.smartPercent * 10000) then
        zombie.cognition = ZoneZombies.COGNITION.SMART
    else
        zombie.cognition = ZoneZombies.COGNITION.DEFAULT
    end
    
    -- Hearing
    if hash < (config.pinpointPercent * 10000) then
        zombie.hearing = ZoneZombies.HEARING.PINPOINT
    else
        zombie.hearing = ZoneZombies.HEARING.NORMAL
    end
    
    -- Mark as processed
    ZoneZombies.markProcessed(zombie)
end

return ZoneZombies
```

### Location-Based Seeding

When you need randomness based on world position:

```lua
function getLocationHash(x, y)
    -- Combine x and y into single value
    local combined = x * 65536 + y
    
    -- Apply Fibonacci hash
    local hash = (combined * 2654435769) % 4294967296
    return math.floor((hash / 65536) * 10000)
end

-- Use for procedural generation
function shouldSpawnSpecialZone(cellX, cellY)
    local hash = getLocationHash(cellX, cellY)
    return hash < 500  -- 5% of cells have special zones
end
```

### Time-Based Consistency

For events that should be consistent within a time period:

```lua
function getDayHash(dayNumber)
    local hash = (dayNumber * 2654435769) % 4294967296
    return math.floor((hash / 65536) * 10000)
end

-- Different "weather" each day, but consistent
function getTodayWeather()
    local day = getGameTime():getDay()
    local hash = getDayHash(day)
    
    if hash < 1000 then
        return "storm"     -- 10%
    elseif hash < 3000 then
        return "rain"      -- 20%
    elseif hash < 5000 then
        return "cloudy"    -- 20%
    else
        return "clear"     -- 50%
    end
end
```

## Handling Zombie Pooling

### The Problem

PZ recycles zombie objects from a pool. When a zombie despawns and another spawns, the "new" zombie may be a recycled object with a different ID.

### The Solution

Track processing with modData hash:

```lua
function processZombie(zombie)
    local modData = zombie:getModData()
    local currentHash = getObjectHash(zombie)
    
    -- Check if this exact zombie instance was processed
    if modData.processedHash == currentHash then
        return  -- Already processed, skip
    end
    
    -- Apply attributes...
    zombie.speedType = 1
    
    -- Mark with current hash
    modData.processedHash = currentHash
end
```

**Why This Works:**
- Fresh zombie: No `processedHash` in modData, gets processed
- Recycled zombie: Hash changes due to new ID, gets reprocessed
- Same zombie: Hash unchanged, skipped (fast)

## Performance Considerations

### Hash Computation is Fast

```lua
-- Benchmark: 0.001ms per hash
local startTime = getTimestampMs()
for i = 1, 10000 do
    local hash = (i * 2654435769) % 4294967296
end
local elapsed = getTimestampMs() - startTime
-- Result: ~1ms for 10,000 hashes
```

### Avoid Recomputing

Cache the hash if you use it multiple times:

```lua
-- BAD: Compute hash three times
if getHash(zombie) < 1000 then ... end
if getHash(zombie) < 2000 then ... end
if getHash(zombie) < 3000 then ... end

-- GOOD: Compute once
local hash = getHash(zombie)
if hash < 1000 then ... end
if hash < 2000 then ... end
if hash < 3000 then ... end
```

## Common Pitfalls

### 1. Using Math.random() Instead

```lua
-- BAD: Different each time
math.random(1, 100)

-- GOOD: Same result for same input
getObjectHash(obj) % 100 + 1
```

### 2. Forgetting Fallback for Single-Player

```lua
-- BAD: getOnlineID() returns -1 in single-player
local id = zombie:getOnlineID()

-- GOOD: Use hashCode() as fallback
local id = zombie:getOnlineID()
if id < 0 then
    id = zombie:hashCode()
end
```

### 3. Hash Collision Assumptions

```lua
-- BAD: Assuming unique hashes for all objects
assert(getHash(obj1) ~= getHash(obj2))  -- Can fail!

-- GOOD: Use hash for probability, not uniqueness
if getHash(obj) < threshold then ... end
```

## Key Takeaways

1. **Fibonacci hash** with constant `2654435769` provides uniform distribution
2. **Use `getOnlineID()` for multiplayer**, `hashCode()` as fallback
3. **Hash once, use multiple times** for performance
4. **Track processing** with modData to handle zombie pooling
5. **0-10000 range** gives percentage precision to 0.01%
6. **Same input = same output** across all clients and save/load cycles

## Related Topics

- **Zombie Attribute Optimization** - Uses deterministic randomization for zone-based difficulty
- **Multiplayer Sync** - How PZ synchronizes game state
- **ModData Best Practices** - Storing processed state
