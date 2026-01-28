---
id: engine-analysis-performance-benchmarking
slug: performance-benchmarking
title: "Performance Benchmarking Guide"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: beginner
tags:
  - beginner
  - performance
  - benchmarking
  - optimization
  - testing
  - profiling
excerpt: "Learn to measure and compare Lua code performance in Project Zomboid. Covers benchmark templates, getTimestampMs() usage, statistical analysis, and common measurement mistakes to avoid."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Core Benchmark Function"
    link: "#core-benchmark-function"
  - text: "The getTimestampMs() Function"
    link: "#the-gettimestampms-function"
  - text: "Comparing Approaches"
    link: "#comparing-approaches"
  - text: "Bulk Operation Benchmarks"
    link: "#bulk-operation-benchmarks"
  - text: "Avoiding Common Mistakes"
    link: "#avoiding-common-mistakes"
  - text: "Statistical Benchmarking"
    link: "#statistical-benchmarking"
  - text: "In-Game Profiling"
    link: "#in-game-profiling"
  - text: "Benchmark Results Documentation"
    link: "#benchmark-results-documentation"
  - text: "Quick Reference: Common Operations"
    link: "#quick-reference-common-operations"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Zombie Attribute Optimization"
    path: /pz/build-41/modding/engine-analysis/zombie-attribute-optimization
  - title: "Inventory System Optimization"
    path: /pz/build-41/modding/engine-analysis/inventory-system-optimization
  - title: "Deterministic Randomization"
    path: /pz/build-41/modding/engine-analysis/deterministic-randomization
last_updated: 2026-01-28
---

# Performance Benchmarking Guide

## Overview

"I optimized my code!" But did you actually measure it? When optimizing PZ mods, you need to measure actual performance - not just assume one approach is faster. This guide covers how to benchmark Lua code in Project Zomboid, compare approaches, and avoid common measurement mistakes.

**You would use this when:**
- You think your mod is causing lag and want to confirm it
- You're comparing two approaches and need to know which is faster
- You want to track your mod's performance impact over time
- You're debugging performance issues in multiplayer

## Prerequisites

- Basic Lua programming (loops, functions, tables)
- A mod that you want to optimize
- Understanding that "feeling faster" isn't the same as being faster

> **Start simple.** The basic benchmark template in this guide will handle 90% of your needs. The advanced stuff is here when you need it.

## Core Benchmark Function

### Basic Template

```lua
function benchmark(name, func, iterations)
    iterations = iterations or 1000
    
    local startTime = getTimestampMs()
    
    for i = 1, iterations do
        func()
    end
    
    local elapsed = getTimestampMs() - startTime
    local avgMs = elapsed / iterations
    
    print(string.format(
        "[BENCHMARK] %s: %dms total, %.4fms avg (%d iterations)",
        name, elapsed, avgMs, iterations
    ))
    
    return elapsed, avgMs
end
```

### Usage

```lua
-- Benchmark a simple operation
benchmark("Table insert", function()
    local t = {}
    for i = 1, 100 do
        table.insert(t, i)
    end
end, 10000)

-- Output: [BENCHMARK] Table insert: 245ms total, 0.0245ms avg (10000 iterations)
```

## The getTimestampMs() Function

PZ provides `getTimestampMs()` which returns the current time in milliseconds. This is the foundation of all benchmarking.

```lua
local start = getTimestampMs()
-- ... do work ...
local elapsed = getTimestampMs() - start
print("Took " .. elapsed .. "ms")
```

> **Note:** `getTimestampMs()` has millisecond precision. For very fast operations, you need many iterations to get meaningful results.

## Comparing Approaches

### A/B Comparison Template

```lua
function compareApproaches(nameA, funcA, nameB, funcB, iterations)
    iterations = iterations or 10000
    
    -- Warm up (important for JIT)
    for i = 1, 100 do funcA() end
    for i = 1, 100 do funcB() end
    
    -- Benchmark A
    local startA = getTimestampMs()
    for i = 1, iterations do funcA() end
    local elapsedA = getTimestampMs() - startA
    
    -- Benchmark B
    local startB = getTimestampMs()
    for i = 1, iterations do funcB() end
    local elapsedB = getTimestampMs() - startB
    
    -- Results
    local faster = elapsedA < elapsedB and nameA or nameB
    local ratio = math.max(elapsedA, elapsedB) / math.max(1, math.min(elapsedA, elapsedB))
    
    print("=== COMPARISON ===")
    print(string.format("%s: %dms (%.4fms avg)", nameA, elapsedA, elapsedA/iterations))
    print(string.format("%s: %dms (%.4fms avg)", nameB, elapsedB, elapsedB/iterations))
    print(string.format("Winner: %s (%.1fx faster)", faster, ratio))
    print("==================")
    
    return elapsedA, elapsedB, ratio
end
```

### Real Example: Zombie Attribute Modification

```lua
-- Old approach: makeInactive() hack
local function oldApproach(zombie)
    local opts = getSandboxOptions()
    opts:set("ZombieLore.Speed", 1)
    zombie:makeInactive(true)
    zombie:makeInactive(false)
    opts:set("ZombieLore.Speed", 2)
end

-- New approach: Direct field access
local function newApproach(zombie)
    zombie.speedType = 1
end

-- Run comparison
local zombie = getCell():getZombieList():get(0)
if zombie then
    compareApproaches(
        "makeInactive hack", function() oldApproach(zombie) end,
        "Direct field", function() newApproach(zombie) end,
        1000
    )
end

-- Output:
-- === COMPARISON ===
-- makeInactive hack: 52ms (0.0520ms avg)
-- Direct field: 5ms (0.0050ms avg)
-- Winner: Direct field (10.4x faster)
-- ==================
```

## Bulk Operation Benchmarks

### Processing Multiple Entities

When benchmarking operations on many entities (zombies, items, etc.):

```lua
function benchmarkBulk(name, setupFunc, processFunc)
    local entities = setupFunc()  -- Get test entities
    local count = entities:size()
    
    if count == 0 then
        print("[BENCHMARK] " .. name .. ": No entities to test")
        return
    end
    
    local startTime = getTimestampMs()
    
    for i = 0, count - 1 do
        processFunc(entities:get(i))
    end
    
    local elapsed = getTimestampMs() - startTime
    local perEntity = elapsed / count
    
    print(string.format(
        "[BENCHMARK] %s: %dms for %d entities (%.4fms each)",
        name, elapsed, count, perEntity
    ))
    
    return elapsed, count, perEntity
end
```

### Usage

```lua
benchmarkBulk(
    "Zombie attribute update",
    function() return getCell():getZombieList() end,
    function(zombie)
        zombie.speedType = 1
        zombie.cognition = 1
        zombie.hearing = 1
    end
)

-- Output: [BENCHMARK] Zombie attribute update: 12ms for 2400 entities (0.0050ms each)
```

## Avoiding Common Mistakes

### 1. Not Warming Up

Lua uses JIT compilation. First runs may be slower:

```lua
-- BAD: First run includes JIT compilation time
local start = getTimestampMs()
for i = 1, 1000 do myFunction() end
local elapsed = getTimestampMs() - start

-- GOOD: Warm up first
for i = 1, 100 do myFunction() end  -- Warm up
local start = getTimestampMs()
for i = 1, 1000 do myFunction() end
local elapsed = getTimestampMs() - start
```

### 2. Too Few Iterations

```lua
-- BAD: Single iteration, noise dominates
local start = getTimestampMs()
myFunction()
local elapsed = getTimestampMs() - start  -- Could be 0 or 1ms

-- GOOD: Many iterations for accurate average
local start = getTimestampMs()
for i = 1, 10000 do myFunction() end
local elapsed = getTimestampMs() - start
local avg = elapsed / 10000  -- Accurate average
```

### 3. Including Setup in Measurement

```lua
-- BAD: Setup included in timing
local start = getTimestampMs()
local zombies = getCell():getZombieList()  -- This takes time!
for i = 0, zombies:size() - 1 do
    processZombie(zombies:get(i))
end
local elapsed = getTimestampMs() - start

-- GOOD: Setup outside timing
local zombies = getCell():getZombieList()  -- Setup
local start = getTimestampMs()
for i = 0, zombies:size() - 1 do
    processZombie(zombies:get(i))
end
local elapsed = getTimestampMs() - start
```

### 4. Garbage Collection Interference

```lua
-- BAD: GC might run during benchmark
local start = getTimestampMs()
for i = 1, 100000 do
    local t = {}  -- Creates garbage
    table.insert(t, i)
end
local elapsed = getTimestampMs() - start  -- Includes GC pauses

-- BETTER: Force GC before benchmark
collectgarbage("collect")  -- Clear garbage first
local start = getTimestampMs()
for i = 1, 100000 do
    local t = {}
    table.insert(t, i)
end
local elapsed = getTimestampMs() - start
```

### 5. Testing in Debug Mode

Debug mode can significantly slow down code. Test in release mode for accurate results:

```lua
-- Check if debug mode affects your benchmarks
if isDebugEnabled() then
    print("WARNING: Debug mode is ON. Results may not reflect production performance.")
end
```

## Statistical Benchmarking

For more reliable results, run multiple trials:

```lua
function benchmarkWithStats(name, func, iterations, trials)
    iterations = iterations or 1000
    trials = trials or 5
    
    local results = {}
    
    -- Warm up
    for i = 1, 100 do func() end
    
    -- Run trials
    for trial = 1, trials do
        local start = getTimestampMs()
        for i = 1, iterations do func() end
        local elapsed = getTimestampMs() - start
        table.insert(results, elapsed)
    end
    
    -- Calculate statistics
    table.sort(results)
    local min = results[1]
    local max = results[#results]
    local median = results[math.ceil(#results / 2)]
    
    local sum = 0
    for _, v in ipairs(results) do sum = sum + v end
    local mean = sum / #results
    
    print(string.format(
        "[BENCHMARK] %s (%d trials, %d iterations each)",
        name, trials, iterations
    ))
    print(string.format(
        "  Min: %dms, Max: %dms, Median: %dms, Mean: %.1fms",
        min, max, median, mean
    ))
    print(string.format(
        "  Per-iteration: %.4fms (median)",
        median / iterations
    ))
    
    return results
end
```

## In-Game Profiling

### Frame Time Tracking

Track how much time your mod uses per frame:

```lua
local ModProfiler = {
    frameTimes = {},
    maxSamples = 60,  -- Track last 60 frames
}

function ModProfiler:startFrame()
    self.frameStart = getTimestampMs()
end

function ModProfiler:endFrame()
    if not self.frameStart then return end
    
    local elapsed = getTimestampMs() - self.frameStart
    table.insert(self.frameTimes, elapsed)
    
    -- Keep only recent samples
    while #self.frameTimes > self.maxSamples do
        table.remove(self.frameTimes, 1)
    end
    
    self.frameStart = nil
end

function ModProfiler:getStats()
    if #self.frameTimes == 0 then
        return {avg = 0, max = 0, min = 0}
    end
    
    local sum, max, min = 0, 0, 999999
    for _, t in ipairs(self.frameTimes) do
        sum = sum + t
        max = math.max(max, t)
        min = math.min(min, t)
    end
    
    return {
        avg = sum / #self.frameTimes,
        max = max,
        min = min
    }
end

-- Usage in your mod
Events.OnTick.Add(function()
    ModProfiler:startFrame()
    
    -- Your mod code here
    processAllZombies()
    updateUI()
    
    ModProfiler:endFrame()
end)

-- Print stats periodically
Events.EveryOneMinute.Add(function()
    local stats = ModProfiler:getStats()
    print(string.format(
        "[MyMod] Frame time: avg=%.2fms, max=%.2fms, min=%.2fms",
        stats.avg, stats.max, stats.min
    ))
end)
```

### Budget Tracking

Ensure your mod stays within performance budget:

```lua
local BUDGET_MS = 2  -- Max 2ms per frame

local function checkBudget(operation, elapsed)
    if elapsed > BUDGET_MS then
        print(string.format(
            "[WARN] %s exceeded budget: %.2fms (budget: %dms)",
            operation, elapsed, BUDGET_MS
        ))
    end
end

Events.OnTick.Add(function()
    local start = getTimestampMs()
    
    processZombies()
    
    local elapsed = getTimestampMs() - start
    checkBudget("processZombies", elapsed)
end)
```

## Benchmark Results Documentation

### Standard Format

Document your benchmarks consistently:

```lua
--[[
    BENCHMARK RESULTS
    =================
    Test: Zombie Attribute Modification
    Date: 2026-01-28
    PZ Version: Build 41
    Hardware: i7-9700K, 32GB RAM
    
    Method A: makeInactive() hack
    Method B: Direct field access
    
    Iterations: 10,000
    Trials: 5
    
    Results (median):
    - Method A: 520ms (0.052ms per zombie)
    - Method B: 48ms (0.0048ms per zombie)
    - Improvement: 10.8x faster
    
    Conclusion: Direct field access is significantly faster
    and should be preferred for zombie attribute modification.
]]
```

## Quick Reference: Common Operations

### Performance Expectations

| Operation | Typical Time | Notes |
|-----------|-------------|-------|
| Field read | 0.0001ms | Instant |
| Field write | 0.0001ms | Instant |
| Method call | 0.001ms | Depends on method |
| Table insert | 0.001ms | Amortized |
| String concat | 0.01ms | Use table.concat for many |
| getZombieList() | 0.1ms | Cache result |
| makeInactive() | 0.05ms | Two calls + stats recalc |
| AddItem() | 0.1ms | Creates new item |
| getFirstTypeRecurse() | 0.5ms | Depends on inventory size |

### Red Flags (Operations to Benchmark)

- Any loop over all zombies/items
- String concatenation in loops
- Creating tables in tight loops
- Recursive inventory searches
- Any operation called every frame

## Key Takeaways

1. **Always benchmark** - Don't assume, measure
2. **Use getTimestampMs()** - PZ's built-in timing function
3. **Warm up first** - JIT compilation affects first runs
4. **Use many iterations** - More data = more accurate
5. **Run multiple trials** - Account for variance
6. **Exclude setup** - Only measure the operation
7. **Document results** - Record for future reference
8. **Profile in production mode** - Debug mode can skew results
