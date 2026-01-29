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
  - text: "What This Guide Covers"
    link: "#what-this-guide-covers"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Your First Benchmark (2 Minutes)"
    link: "#your-first-benchmark-2-minutes"
  - text: "Core Benchmark Function"
    link: "#core-benchmark-function"
  - text: "The getTimestampMs() Function"
    link: "#the-gettimestampms-function"
  - text: "Comparing Approaches"
    link: "#comparing-approaches"
  - text: "Bulk Operation Benchmarks"
    link: "#bulk-operation-benchmarks"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Statistical Benchmarking"
    link: "#statistical-benchmarking"
  - text: "In-Game Profiling"
    link: "#in-game-profiling"
  - text: "Benchmark Results Documentation"
    link: "#benchmark-results-documentation"
  - text: "Quick Reference: Common Operations"
    link: "#quick-reference-common-operations"
  - text: "Try It Yourself: Compare Two Approaches"
    link: "#try-it-yourself-compare-two-approaches"
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

You spent hours rewriting your zombie mod to be "faster." You load it up, test it, and... it feels about the same. Maybe even slower? You're not sure. You changed so much code, but you have no idea if it actually helped. Without measurement, you're flying blind.

I remember my first optimization attempt - I spent a whole weekend "improving" my inventory mod. I cached references, reduced loops, rewrote algorithms. Felt proud. Then I actually measured it: **3% faster**. Meanwhile, I'd introduced two new bugs. If I'd measured from the start, I would have known that my real bottleneck was elsewhere - a single `getInventory()` call happening 60 times per second that I never noticed.

Let me show you how to measure, not guess.

## What This Guide Covers

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

## Your First Benchmark (2 Minutes)

Let's measure something simple: how long does it take to add 1000 items to a table?

```lua
-- Start timing
local startTime = getTimestampMs()                       -- Get current time in milliseconds

-- Do the work
local myTable = {}                                       -- Create empty table
for i = 1, 1000 do
    table.insert(myTable, i)                             -- Add each number
end

-- Stop timing
local elapsed = getTimestampMs() - startTime             -- Calculate how long it took
print("Took " .. elapsed .. "ms")                        -- Output: "Took 2ms" (or similar)
```

**That's it!** You just measured actual performance. Everything else in this guide is building on this pattern: start timer → do work → measure elapsed time.

> **Key Takeaway:** `getTimestampMs()` returns the current time in milliseconds. Subtract the start time from the end time to get how long something took. This is the foundation of all performance measurement.

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

## Common Mistakes

Let me show you the mistakes that will give you misleading benchmark results. I've made all of these!

### ❌ Wrong: Not Warming Up First

```lua
-- Measures JIT compilation + actual work
local start = getTimestampMs()
for i = 1, 1000 do myFunction() end
local elapsed = getTimestampMs() - start                 -- Includes JIT compile time!
```

**Why it fails:** Lua uses JIT (Just-In-Time) compilation. The first run compiles the code, making it slower than subsequent runs.

✅ **Right: Warm Up Before Measuring**
```lua
-- Run it once to compile
for i = 1, 100 do myFunction() end                       -- Warm up (compiles code)

-- Now measure actual performance
local start = getTimestampMs()
for i = 1, 1000 do myFunction() end
local elapsed = getTimestampMs() - start                 -- Pure execution time
```

### ❌ Wrong: Too Few Iterations

```lua
-- Single run, 0 or 1ms result
local start = getTimestampMs()
myFunction()                                             -- Runs once
local elapsed = getTimestampMs() - start                 -- Result: 0ms or 1ms (useless!)
```

**Why it fails:** `getTimestampMs()` has millisecond precision. Fast operations complete in under 1ms, giving you 0 or 1.

✅ **Right: Many Iterations for Average**
```lua
-- Run many times for accurate average
local start = getTimestampMs()
for i = 1, 10000 do myFunction() end                     -- 10,000 iterations
local elapsed = getTimestampMs() - start                 -- Total time
local avg = elapsed / 10000                              -- Average per call: 0.0045ms (useful!)
```

### ❌ Wrong: Including Setup in Measurement

```lua
-- Measures setup + work
local start = getTimestampMs()
local zombies = getCell():getZombieList()                -- This takes time too!
for i = 0, zombies:size() - 1 do
    processZombie(zombies:get(i))
end
local elapsed = getTimestampMs() - start                 -- Includes getting zombie list!
```

**Why it fails:** You're measuring both the setup (getting zombies) and the work (processing them). That's two things, not one.

✅ **Right: Setup Outside Timing**
```lua
-- Setup first
local zombies = getCell():getZombieList()                -- Setup (not timed)

-- Measure only the work
local start = getTimestampMs()
for i = 0, zombies:size() - 1 do
    processZombie(zombies:get(i))
end
local elapsed = getTimestampMs() - start                 -- Pure processing time
```

### ❌ Wrong: Ignoring Garbage Collection

```lua
-- GC might pause during test
local start = getTimestampMs()
for i = 1, 100000 do
    local t = {}                                         -- Creates garbage every iteration
    table.insert(t, i)
end
local elapsed = getTimestampMs() - start                 -- Includes GC pauses!
```

**Why it fails:** Lua's garbage collector can pause execution to clean up memory. Your benchmark might measure GC time instead of your code.

✅ **Right: Force GC Before Benchmark**
```lua
-- Clear garbage first
collectgarbage("collect")                                -- Run GC now, not during test

-- Now measure
local start = getTimestampMs()
for i = 1, 100000 do
    local t = {}
    table.insert(t, i)
end
local elapsed = getTimestampMs() - start                 -- More consistent results
```

### ❌ Wrong: Testing in Debug Mode

```lua
-- Debug mode enabled (slower)
local start = getTimestampMs()
myFunction()
local elapsed = getTimestampMs() - start                 -- 2x-10x slower than production!
```

**Why it fails:** Debug mode adds overhead for logging, error checking, and debugging features. Production runs faster.

✅ **Right: Test in Release Mode**
```lua
-- Check if debug mode is affecting results
if isDebugEnabled() then
    print("WARNING: Debug mode is ON. Results don't reflect production performance.")
    return                                               -- Don't benchmark in debug mode
end

-- Benchmark in release mode
local start = getTimestampMs()
myFunction()
local elapsed = getTimestampMs() - start                 -- Accurate production timing
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

## Try It Yourself: Compare Two Approaches

Let's build a real benchmark to answer a real question: Which is faster - string concatenation or table.concat()?

**Goal:** Measure and compare two methods of building a long string.

### Step 1: Create the Benchmark Mod

Create `C:\Users\[YOU]\Zomboid\mods\BenchmarkTest\mod.info`:
```
name=Benchmark Test
id=BenchmarkTest
description=Testing string building performance
```

### Step 2: Write the Comparison

Create `C:\Users\[YOU]\Zomboid\mods\BenchmarkTest\media\lua\client\StringBenchmark.lua`:

```lua
-- StringBenchmark.lua
-- Compare two methods of building strings

local function benchmarkStringConcat()
    -- Method 1: String concatenation with ..
    local iterations = 10000

    -- Warm up
    for i = 1, 100 do
        local str = ""
        for j = 1, 100 do
            str = str .. tostring(j)                     -- Concatenate with ..
        end
    end

    -- Measure
    local start = getTimestampMs()
    for i = 1, iterations do
        local str = ""
        for j = 1, 100 do
            str = str .. tostring(j)
        end
    end
    local elapsed = getTimestampMs() - start

    print("[BENCHMARK] String concatenation (..):")
    print("  Total: " .. elapsed .. "ms")
    print("  Average: " .. string.format("%.4f", elapsed / iterations) .. "ms")

    return elapsed
end

local function benchmarkTableConcat()
    -- Method 2: table.concat
    local iterations = 10000

    -- Warm up
    for i = 1, 100 do
        local parts = {}
        for j = 1, 100 do
            table.insert(parts, tostring(j))
        end
        local str = table.concat(parts)
    end

    -- Measure
    local start = getTimestampMs()
    for i = 1, iterations do
        local parts = {}
        for j = 1, 100 do
            table.insert(parts, tostring(j))            -- Add to table
        end
        local str = table.concat(parts)                  -- Concatenate all at once
    end
    local elapsed = getTimestampMs() - start

    print("[BENCHMARK] table.concat:")
    print("  Total: " .. elapsed .. "ms")
    print("  Average: " .. string.format("%.4f", elapsed / iterations) .. "ms")

    return elapsed
end

-- Run comparison when game starts
Events.OnGameStart.Add(function()
    print("=== String Building Benchmark ===")

    local timeA = benchmarkStringConcat()
    local timeB = benchmarkTableConcat()

    -- Calculate winner
    if timeA < timeB then
        local speedup = timeB / timeA
        print("RESULT: String concatenation (..) is " .. string.format("%.1f", speedup) .. "x faster")
    else
        local speedup = timeA / timeB
        print("RESULT: table.concat is " .. string.format("%.1f", speedup) .. "x faster")
    end

    print("================================")
end)
```

### Step 3: Test It

1. Launch PZ with your mod
2. Start a new game
3. Check the console (press `~`) to see results

### Step 4: Analyze Results

You should see output like:
```
=== String Building Benchmark ===
[BENCHMARK] String concatenation (..):
  Total: 842ms
  Average: 0.0842ms
[BENCHMARK] table.concat:
  Total: 124ms
  Average: 0.0124ms
RESULT: table.concat is 6.8x faster
================================
```

**What you learned:**
1. How to warm up before benchmarking
2. How to measure total and average time
3. How to compare two approaches
4. That table.concat is actually much faster for building long strings!

This benchmark pattern works for any comparison: different algorithms, different data structures, different approaches. Measure, don't guess!

## Key Takeaways

1. **Always benchmark** - Don't assume, measure
2. **Use getTimestampMs()** - PZ's built-in timing function
3. **Warm up first** - JIT compilation affects first runs
4. **Use many iterations** - More data = more accurate
5. **Run multiple trials** - Account for variance
6. **Exclude setup** - Only measure the operation
7. **Document results** - Record for future reference
8. **Profile in production mode** - Debug mode can skew results
