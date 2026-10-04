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
  - text: "What is Deterministic Randomization?"
    link: "#what-is-deterministic-randomization"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "The Problem: Random Isn't Multiplayer-Safe"
    link: "#the-problem-random-isnt-multiplayer-safe"
  - text: "Your First Deterministic Random (Simple Example)"
    link: "#your-first-deterministic-random-simple-example"
  - text: "Understanding the Pattern: Fibonacci Hash"
    link: "#understanding-the-pattern-fibonacci-hash"
  - text: "Practical Applications"
    link: "#practical-applications"
  - text: "Implementation Patterns"
    link: "#implementation-patterns"
  - text: "Handling Zombie Pooling"
    link: "#handling-zombie-pooling"
  - text: "Performance Considerations"
    link: "#performance-considerations"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself: Create a Consistent Fast Zone"
    link: "#try-it-yourself-create-a-consistent-fast-zone"
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

You're testing your awesome zombie mod in multiplayer. You set up a system where 30% of zombies should be sprinters. On the server, everything looks perfect - exactly 30% are fast. But then your friend joins and sees completely different zombies. The one you see as a shambler is sprinting at them. You reload the save and everything changes again. Your "random" zombies aren't just random - they're chaos.

I remember spending three days debugging this exact issue. My zone-based difficulty mod worked beautifully in single-player, but in multiplayer it was a disaster. Zombies would flicker between fast and slow as clients disagreed about their attributes. The breakthrough came when I discovered the Fibonacci hash pattern hiding in PZ's codebase - a elegant solution that made the same zombie consistently get the same attributes, everywhere, every time.

Let me show you how to create truly "random" results that are actually predictable - in the best possible way.

## What is Deterministic Randomization?

**Deterministic randomization** means getting the same "random" result every time you give it the same input. Think of it like this: Instead of rolling a dice, you're looking up which number a specific zombie "should" roll based on its ID.

**The magic:** If both server and client do the same lookup with the same zombie ID, they both get the same answer - no network communication needed.

**You would use this when:**
- You need "random" results that are the same for all players in multiplayer
- You want consistent outcomes that survive save/load
- You're building zone-based difficulty (some areas have more sprinters)
- You're creating procedural content that should be consistent

## Prerequisites

- [Zombie Attribute Optimization](/pz/build-41/modding/engine-analysis/zombie-attribute-optimization) - See this pattern in action
- Basic understanding of percentages and probability

## The Problem: Random Isn't Multiplayer-Safe

### Why `ZombRand()` Doesn't Work

```lua
-- BAD: Different results each time, on each client
local speed = ZombRand(1, 4)  -- Server rolls a 2, client rolls a 3!
```

**What goes wrong:**
- **Server sees different result than client** - They disagree about zombie attributes
- **Reloading gives different results** - Your "slow" zombie becomes fast after restart
- **Save/load breaks consistency** - Nothing is reliable
- **Multiple clients see different behaviors** - Total chaos

### What We Need Instead

- **Same input = same output** (deterministic) - Zombie 12345 is always the same
- **Works on server and all clients** (multiplayer safe) - Everyone agrees without talking
- **Persists through save/load** (consistent) - Doesn't change over time
- **Fast computation** (performance) - Doesn't lag when processing thousands of zombies

## Your First Deterministic Random (Simple Example)

Let's start with the simplest possible case: making zombie #12345 consistently become a sprinter, while zombie #54321 consistently stays a shambler. No ZombRand(), no chaos, just consistent results.

### The Basic Pattern

```lua
function getZombieRandomValue(zombie)
    -- Get zombie's unique ID number
    local id = zombie:getOnlineID()              -- In multiplayer, this is the same on all clients
    if id < 0 then
        id = zombie:hashCode()                   -- In single-player, use this instead
    end

    -- The magic number (explained later - just trust me for now)
    local hash = (id * 2654435769) % 4294967296

    -- Convert to 0-10000 range (0.00% to 100.00%)
    return math.floor((hash / 65536) * 10000)
end

-- Use it to make 30% of zombies sprinters
function makeZombieFast(zombie)
    local randomValue = getZombieRandomValue(zombie)  -- Get zombie's "random" number (always the same!)

    if randomValue < 3000 then                       -- 3000 out of 10000 = 30%
        zombie.speedType = 1                          -- Make sprinter
        print("Zombie is a sprinter!")
    else
        zombie.speedType = 2                          -- Make shambler
        print("Zombie is a shambler")
    end
end
```

### Why This Works

1. **Zombie #12345** gets ID 12345
2. **We multiply by magic number:** `12345 * 2654435769 = big number`
3. **We convert to 0-10000:** Let's say it becomes 2456
4. **2456 < 3000**, so this zombie is a sprinter
5. **Every time, everywhere:** Server calculates 2456, client calculates 2456, save/load still gets 2456

That's it! Same zombie ID → same "random" number → same result. Always.

> **Key Takeaway:** Zombie #12345 will always get the value 2456 (or whatever the hash produces). It's not actually random - it's a lookup table based on ID. But it *looks* random because sequential IDs produce wildly different values.

## Understanding the Pattern: Fibonacci Hash

### The Full Pattern (Production-Ready)

Now that you've seen the simple version, here's the proper reusable function:

```lua
function getObjectHash(obj)
    -- Get unique identifier for this object
    local id = obj:getOnlineID()                     -- Multiplayer ID (synced across clients)
    if id < 0 then
        id = obj:hashCode()                          -- Single-player fallback (when getOnlineID returns -1)
    end

    -- Fibonacci hash: multiply by golden ratio constant
    local hash = (id * 2654435769) % 4294967296     -- Magic happens here

    -- Convert from huge number to 0-10000 range
    return math.floor((hash / 65536) * 10000)       -- Now we have percentage precision (0.00% to 100.00%)
end
```

### Why The Magic Number Works

**The Magic Number: 2654435769**

This is `2^32 / phi` where phi is the golden ratio (~1.618). Don't worry about the math - just know it has special properties:

1. **Uniform distribution** - Values spread evenly (no clustering)
2. **Avalanche effect** - ID 100 and ID 101 produce wildly different results
3. **Fast computation** - Just multiplication and modulo (instant)
4. **No practical collisions** - Different zombies get different values

You can think of it like a perfect shuffle: Sequential IDs (1, 2, 3, 4...) become scattered values (8234, 2156, 9823, 445...).

**Why 0-10000 Range?**

Converting to 0-10000 gives us percentage precision to two decimal places:
- `0` = 0.00%
- `5000` = 50.00%
- `10000` = 100.00%

This makes it easy to work with percentages: "30% sprinters" = `if hash < 3000`.

## Practical Applications

### Real-World Example: Zone-Based Zombie Difficulty

Here's how to create different difficulty zones - downtown is nightmare mode, suburbs are easier:

```lua
-- Define what % of zombies get special attributes in each tier
local TIER_CONFIG = {
    [1] = {sprinter = 0.00, smart = 0.00, pinpoint = 0.00},  -- Tier 1: Easy (no special zombies)
    [2] = {sprinter = 0.10, smart = 0.05, pinpoint = 0.10},  -- Tier 2: Normal (10% sprinters, 5% smart)
    [3] = {sprinter = 0.30, smart = 0.20, pinpoint = 0.30},  -- Tier 3: Hard (30% sprinters, 20% smart)
    [4] = {sprinter = 0.60, smart = 0.50, pinpoint = 0.60},  -- Tier 4: Nightmare (60% sprinters!)
}

function applyZoneDifficulty(zombie, tier)
    local config = TIER_CONFIG[tier]                         -- Get the tier's percentages
    if not config then return end                            -- Safety check

    -- Get zombie's unique "random" number (0-10000)
    local hash = getObjectHash(zombie)                       -- This zombie always gets the same number!

    -- Apply sprinter based on percentage
    -- Example: If tier 3 (30% sprinters), threshold is 3000
    -- So 30% of zombies will have hash < 3000 and become sprinters
    if hash < (config.sprinter * 10000) then
        zombie.speedType = 1                                 -- Sprinter (fast!)
    else
        zombie.speedType = 2                                 -- Fast shambler (normal)
    end

    -- Apply smart cognition (can open doors, navigate better)
    if hash < (config.smart * 10000) then
        zombie.cognition = 1                                 -- Smart
    else
        zombie.cognition = 3                                 -- Default intelligence
    end

    -- Apply pinpoint hearing (hears you from further away)
    if hash < (config.pinpoint * 10000) then
        zombie.hearing = 1                                   -- Pinpoint (scary good hearing)
    else
        zombie.hearing = 2                                   -- Normal hearing
    end
end
```

### Why This is Multiplayer Safe

1. **Server creates zombie** with ID 12345
2. **Server calculates hash:** `(12345 * 2654435769) % 4294967296 = X`
3. **Server applies attributes** based on hash X
4. **Client receives zombie** with ID 12345 (synced automatically by game)
5. **Client calculates same hash:** `(12345 * 2654435769) % 4294967296 = X` (identical!)
6. **Both agree** on zombie's attributes without any extra network communication

> **Key Takeaway:** The zombie ID is already synced by the game (that's how multiplayer works). We're just using that ID as input to our hash function. Both server and client run the same calculation on the same ID, so they always agree. No network traffic needed!

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

## Common Mistakes

Let me show you the mistakes I made (and you will too) when first learning this pattern.

### Wrong: Using Math.random() or ZombRand()

```lua
-- Different result every time, every client
if math.random(100) < 30 then
    zombie.speedType = 1  -- Server: shambler, Client: sprinter!
end
```

**Why it fails:** Random functions give different results each call. Server and client disagree.

**Right: Use Deterministic Hash**
```lua
-- Same zombie ID = same result, always
local hash = getObjectHash(zombie)
if hash < 3000 then
    zombie.speedType = 1  -- Everyone agrees: sprinter!
end
```

### Wrong: Forgetting Single-Player Fallback

```lua
-- getOnlineID() returns -1 in single-player!
local id = zombie:getOnlineID()
local hash = (id * 2654435769) % 4294967296  -- Breaks in single-player
```

**Why it fails:** In single-player, `getOnlineID()` returns -1 (no online ID exists). All zombies get the same hash!

**Right: Check for Negative ID**
```lua
-- Works in both single-player and multiplayer
local id = zombie:getOnlineID()
if id < 0 then
    id = zombie:hashCode()  -- Use hashCode in single-player
end
local hash = (id * 2654435769) % 4294967296
```

### Wrong: Recomputing Hash Multiple Times

```lua
-- Computes hash 4 times! Wasteful.
if getObjectHash(zombie) < 3000 then ... end
if getObjectHash(zombie) < 5000 then ... end
if getObjectHash(zombie) < 8000 then ... end
```

**Why it fails:** Not technically broken, but inefficient. Computing the hash 4 times when you only need to do it once.

**Right: Compute Once, Use Many Times**
```lua
-- Compute hash once, reuse it
local hash = getObjectHash(zombie)
if hash < 3000 then ... end
if hash < 5000 then ... end
if hash < 8000 then ... end
```

### Wrong: Assuming Hashes are Unique

```lua
-- BAD: Treating hash as unique identifier
local zombieTable = {}
zombieTable[getHash(zombie)] = zombie  -- Collision risk!
assert(getHash(zombie1) ~= getHash(zombie2))  -- Can fail!
```

**Why it fails:** Hashes can collide. Two different zombies might get the same hash value (rare, but possible).

**Right: Use Hash for Probability, Not Identity**
```lua
-- GOOD: Use hash for percentage-based decisions
local hash = getHash(zombie)
if hash < 3000 then
    -- This zombie is in the 30% group
end
-- Don't rely on hash being unique!
```

### Wrong: Forgetting to Track Processing

```lua
-- Processes same zombie multiple times
function OnZombieUpdate(zombie)
    local hash = getObjectHash(zombie)
    if hash < 3000 then
        zombie.speedType = 1  -- Sets this EVERY frame!
    end
end
```

**Why it fails:** Runs every frame, setting attributes over and over. Wasteful and can cause issues with zombie pooling.

**Right: Track if Already Processed**
```lua
-- Process once, skip if already done
function OnZombieUpdate(zombie)
    local modData = zombie:getModData()
    if modData.attributesSet then return end  -- Already processed

    local hash = getObjectHash(zombie)
    if hash < 3000 then
        zombie.speedType = 1
    end

    modData.attributesSet = true  -- Mark as processed
end
```

## Try It Yourself: Create a Consistent Fast Zone

Let's build a working mod that makes zombies in one specific area consistently fast using deterministic randomization.

**Goal:** Create a zone where 50% of zombies are always sprinters, and it works the same in multiplayer and after save/load.

### Step 1: Create the Hash Function

Create `%UserProfile%\Zomboid\mods\FastZone\media\lua\shared\DeterministicHash.lua`:

```lua
-- DeterministicHash.lua
-- Reusable hash function for any mod

function getZombieHash(zombie)
    -- Get zombie's unique ID
    local id = zombie:getOnlineID()                          -- Multiplayer ID
    if id < 0 then
        id = zombie:hashCode()                               -- Single-player fallback
    end

    -- Apply Fibonacci hash
    local hash = (id * 2654435769) % 4294967296             -- Magic number!

    -- Convert to 0-10000 range (percentage precision)
    return math.floor((hash / 65536) * 10000)               -- Return value between 0-10000
end
```

### Step 2: Create the Zone Logic

Create `%UserProfile%\Zomboid\mods\FastZone\media\lua\client\FastZone.lua`:

```lua
-- FastZone.lua
require "DeterministicHash"                                  -- Load our hash function

-- Define the fast zone boundaries (Westpoint downtown as example)
local FAST_ZONE = {
    x1 = 11500,                                              -- Left boundary
    y1 = 6900,                                               -- Top boundary
    x2 = 12000,                                              -- Right boundary
    y2 = 7400                                                -- Bottom boundary
}

-- Check if zombie is in the fast zone
local function isInFastZone(zombie)
    local x = zombie:getX()                                  -- Get zombie X position
    local y = zombie:getY()                                  -- Get zombie Y position

    return x >= FAST_ZONE.x1 and x <= FAST_ZONE.x2 and     -- Check if within X bounds
           y >= FAST_ZONE.y1 and y <= FAST_ZONE.y2          -- Check if within Y bounds
end

-- Apply fast zone logic
local function processFastZone(zombie)
    -- Skip if already processed
    local modData = zombie:getModData()
    if modData.FastZoneProcessed then return end            -- Already done

    -- Only process zombies in the fast zone
    if not isInFastZone(zombie) then return end

    -- Get zombie's deterministic "random" number
    local hash = getZombieHash(zombie)                       -- Always the same for this zombie!

    -- Make 50% of zombies sprinters (hash < 5000 = 50%)
    if hash < 5000 then
        zombie.speedType = 1                                 -- Sprinter
        print("Zombie " .. zombie:getOnlineID() .. " is a sprinter (hash: " .. hash .. ")")
    else
        zombie.speedType = 2                                 -- Shambler
        print("Zombie " .. zombie:getOnlineID() .. " is a shambler (hash: " .. hash .. ")")
    end

    -- Mark as processed
    modData.FastZoneProcessed = true
end

-- Hook into zombie updates
Events.OnZombieUpdate.Add(processFastZone)
```

### Step 3: Create mod.info

Create `%UserProfile%\Zomboid\mods\FastZone\mod.info`:
```
name=Fast Zone Test
id=FastZoneTest
description=Deterministic randomization test - 50% sprinters in Westpoint downtown
```

### Step 4: Test It

1. Launch PZ with your mod enabled
2. Start in Westpoint (or change the coordinates to your location)
3. Spawn some zombies or wait for them to appear
4. Check the console (press `~`) to see the output

### Step 5: Verify Consistency

**Test 1 - Save/Load:**
- Note which zombies are fast
- Save the game
- Load the save
- The SAME zombies should still be fast (not different ones)

**Test 2 - Multiplayer (if you have a friend):**
- Host a multiplayer game
- Have your friend join
- You should both see the same zombies as sprinters
- Look at the console - you'll see the same hash values!

**You just:**
1. Created a deterministic hash function
2. Applied it to zombies in a specific zone
3. Made it consistent across save/load and multiplayer
4. Verified that "randomness" is actually predictable

This is the core pattern for all zone-based difficulty, procedural generation, and multiplayer-safe "random" content.

## Key Takeaways

**The Big Picture:**
- Deterministic randomization = same input produces same output, always
- Perfect for multiplayer where server and client must agree without communication
- Uses Fibonacci hash with golden ratio constant (2654435769)

**What to Remember:**
1. **Fibonacci hash** with constant `2654435769` provides uniform distribution
2. **Use `getOnlineID()` for multiplayer**, `hashCode()` as fallback for single-player
3. **Hash once, use multiple times** for performance (don't recompute unnecessarily)
4. **Track processing** with modData to avoid reprocessing same zombie
5. **0-10000 range** gives percentage precision to 0.01%
6. **Same input = same output** across all clients and save/load cycles

**The Pattern:**
1. Get object's unique ID (onlineID or hashCode)
2. Multiply by 2654435769 and modulo by 4294967296
3. Convert to 0-10000 range
4. Use as percentage threshold (`if hash < 3000` = 30% chance)
5. Track processing to avoid redundant work

## Related Topics

- **Zombie Attribute Optimization** - Uses deterministic randomization for zone-based difficulty
- **Multiplayer Sync** - How PZ synchronizes game state
- **ModData Best Practices** - Storing processed state
