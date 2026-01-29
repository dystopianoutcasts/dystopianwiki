---
id: your-first-vehicle-mod
slug: your-first-vehicle-mod
title: "Your First Vehicle Mod"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: beginner
tags:
  - vehicle
  - beginner
  - tutorial
  - lua
  - first-mod
excerpt: "Create your first vehicle mod - display the car name when you get in. No prior Lua experience needed."
related_articles:
  - reading-vehicle-stats
  - vehicle-parts-basics
next_steps:
  - title: "Reading Vehicle Stats"
    path: /pz/build-41/modding/engine-analysis/reading-vehicle-stats
  - title: "Working with Vehicle Parts"
    path: /pz/build-41/modding/engine-analysis/vehicle-parts-basics
last_updated: 2026-01-28
---

# Your First Vehicle Mod

You're running from zombies, you spot a car, you dive inside—and you're safe. That moment of relief when you get behind the wheel is pure survival magic. But have you ever wanted to make something happen the instant you enter a vehicle?

Maybe a custom warning system? A speed notification? A fuel check? Every vehicle mod starts with one simple question: **"How do I detect when the player gets in a car?"**

Let me show you the answer—and I promise it's simpler than you think.

---

## I Remember My First Vehicle Mod

I spent an embarrassing amount of time trying to figure this out. I thought I needed to check `player:getVehicle()` every frame with a timer. I created a loop that ran 60 times per second, constantly asking "Are you in a car? Are you in a car? Are you in a car?"

It worked, but it was ridiculous.

Then I discovered events. One line—`Events.OnEnterVehicle.Add(myFunction)`—and the game just... tells you when someone gets in a car. No loops, no timers, no waste. I deleted 40 lines of hacky code and replaced them with 8 clean ones.

**The lesson:** Project Zomboid has built-in events for almost everything. You don't need to constantly check—just listen.

---

## What We're Building

We're going to make a mod that prints the car's name to the console when you sit in the driver's seat.

It's simple, but it teaches you the foundation for ALL vehicle modding.

**You would use this when:** You want to learn how vehicle mods work, or you're building something that needs to know when a player enters a vehicle.

---

## Prerequisites

Before this article, you should:
- Know how to create a basic mod folder (mod.info file)
- Have enabled the Lua debugger in PZ options (so you can see print messages)

If you haven't made any mod before, that's okay - we'll show the folder structure.

---

## The Simplest Example

Here's the complete mod - just 8 lines:

```lua
-- This runs whenever a player enters a vehicle
local function onEnterVehicle(player)           -- PZ passes us the player who entered
    local vehicle = player:getVehicle()         -- Ask: "What vehicle is this player in?"
    if vehicle then                             -- Only continue if they're actually in one
        local name = vehicle:getScriptName()    -- Get the vehicle's name (like "Base.CarNormal")
        print("You got into: " .. name)         -- Show it in the console
    end                                         -- Close the 'if'
end                                             -- Close the function

Events.OnEnterVehicle.Add(onEnterVehicle)       -- Tell PZ: "Run my function when someone enters a vehicle"
```

**Line by line:**

| Line | Code | What It Does |
|------|------|---------------|
| 1 | `-- This runs...` | A comment - the game ignores this, it's just for humans |
| 2 | `local function onEnterVehicle(player)` | Creates a function that receives the player who entered |
| 3 | `local vehicle = player:getVehicle()` | Asks "what vehicle is this player in?" |
| 4 | `if vehicle then` | Only continue if they're actually in a vehicle |
| 5 | `local name = vehicle:getScriptName()` | Get the vehicle's name (like "Base.CarNormal") |
| 6 | `print("You got into: " .. name)` | Show it in the console |
| 7 | `end` | Closes the `if` |
| 8 | `end` | Closes the function |
| 10 | `Events.OnEnterVehicle.Add(...)` | Tell PZ: "run my function when someone enters a vehicle" |

---

## Where Does This Go?

```
YourModName/
├── mod.info
└── media/
    └── lua/
        └── client/                    ← Your file goes here
            └── VehicleGreeter.lua     ← Name it whatever you want
```

**Why the `client` folder?**

PZ has three Lua folders:
- `client/` - Code that runs on your screen (UI, messages, local player)
- `server/` - Code that runs the game world (spawning, rules)
- `shared/` - Code both need

Our mod shows a message on YOUR screen when YOU enter a vehicle. That's client-side.

---

## What Happens When You Run It

1. You start PZ with your mod enabled
2. You walk up to a car and press E to get in
3. PZ fires the `OnEnterVehicle` event
4. Your function runs and receives your player
5. It gets the vehicle, gets the name, prints it
6. You see `You got into: Base.CarNormal` in the console

**Try it:** 
1. Create the folder structure above
2. Paste the code into `VehicleGreeter.lua`
3. Create a basic `mod.info` file
4. Enable your mod and start a game
5. Get into any vehicle
6. Press `~` to open the console - you should see your message!

---

## Common Mistakes

### 1. Nothing Happens When I Get in a Car

**Check these four things:**

1. Is your mod enabled in the mod menu?
2. Is the file in `client/` (not `server/` or `shared/`)?
3. Did you open the console (`~` key) to see the message?
4. Is there a typo in `Events.OnEnterVehicle`? (capital letters matter!)

**Most common:** You forgot to enable the mod in the Mods menu before starting the game.

---

### 2. Error: "Attempt to Index Nil Value"

```lua
-- ❌ WRONG: Forgot to check if vehicle exists
local function onEnterVehicle(player)
    local name = player:getVehicle():getScriptName()    -- Crashes if getVehicle() returns nil!
end

-- ✅ RIGHT: Always check first
local function onEnterVehicle(player)
    local vehicle = player:getVehicle()                 -- Store it in a variable
    if vehicle then                                     -- Check if it exists
        local name = vehicle:getScriptName()            -- Only call methods if it's real
    end
end
```

**Why this happens:** Sometimes `OnEnterVehicle` fires when you're *starting* to get in, but not fully seated yet. `getVehicle()` might return `nil` during this transition. Always check!

---

### 3. I See the Message Twice (Multiplayer/Split-Screen)

```lua
-- ❌ WRONG: Runs for all players
local function onEnterVehicle(player)
    local vehicle = player:getVehicle()                 -- Any player entering triggers this!
    if vehicle then
        print("You got into: " .. vehicle:getScriptName())
    end
end

-- ✅ RIGHT: Only run for YOUR player
local function onEnterVehicle(player)
    if player ~= getPlayer() then return end            -- Exit early if it's not the local player

    local vehicle = player:getVehicle()                 -- Now it only runs for YOU
    if vehicle then
        print("You got into: " .. vehicle:getScriptName())
    end
end
```

**When this matters:** In multiplayer or split-screen, `OnEnterVehicle` fires for *every* player who enters a vehicle. If you only want to show a message to the local player, add the `getPlayer()` check.

---

### 4. Wrong Folder Location

```
❌ WRONG:
YourModName/
└── media/
    └── lua/
        └── VehicleGreeter.lua              ← Not in any subfolder - won't load!

✅ RIGHT:
YourModName/
└── media/
    └── lua/
        └── client/                         ← Must be in client/ folder
            └── VehicleGreeter.lua          ← Now PZ finds it
```

**Why:** PZ only loads Lua files from `client/`, `server/`, or `shared/` subfolders. A file sitting directly in `lua/` won't be loaded.

---

## Try It Yourself: Speed Alert Mod

Now let's build something practical. Create a mod that warns you when you enter a slow vehicle (max speed under 60 km/h).

**Create this file:** `media/lua/client/SpeedAlert.lua`

```lua
-- Warn the player if they get into a slow vehicle
local function checkVehicleSpeed(player)
    if player ~= getPlayer() then return end            -- Only for local player

    local vehicle = player:getVehicle()                 -- Get the vehicle they entered
    if vehicle then                                     -- Make sure it exists
        local maxSpeed = vehicle:getMaxSpeed()          -- Get its top speed
        local name = vehicle:getScriptName()            -- Get its name

        if maxSpeed < 60 then                           -- If it's slow
            print("⚠️ WARNING: " .. name .. " is slow! Max speed: " .. maxSpeed .. " km/h")
        else                                            -- If it's fast enough
            print("✓ " .. name .. " - Max speed: " .. maxSpeed .. " km/h")
        end
    end
end

Events.OnEnterVehicle.Add(checkVehicleSpeed)            -- Hook it up to the event
```

**Test it:**

1. Save the file in your mod's `media/lua/client/` folder
2. Start PZ with your mod enabled
3. Find different vehicles and get in them
4. Open console (`~`) to see the warnings

**What you'll see:**

- Get in a police car (fast): `✓ Base.CarLuxury - Max speed: 120 km/h`
- Get in a van (slow): `⚠️ WARNING: Base.Van - Max speed: 50 km/h`

**Bonus challenge:** Modify the mod to also warn if the vehicle has less than 25% fuel. Hint: Use `vehicle:getFuelAmount()` and `vehicle:getFuelCapacity()`.

> **Key Takeaway**
>
> You just learned the pattern for ALL vehicle mods:
> 1. Hook into an event (`OnEnterVehicle`, `OnVehicleDamage`, etc.)
> 2. Get the vehicle from the player
> 3. Check properties (`getMaxSpeed()`, `getFuelAmount()`, etc.)
> 4. Do something with that information
>
> This same pattern works for hundreds of different mods.

---

## Understanding the Colon `:` 

You might wonder why we write `player:getVehicle()` with a colon.

In Lua for PZ:
- **Colon `:`** = "Hey object, do this thing" (calling a method)
- **Dot `.`** = "Give me this property"

```lua
-- Colon: Asking the player to DO something (get their vehicle)
local vehicle = player:getVehicle()

-- Colon: Asking the vehicle to DO something (get its name)
local name = vehicle:getScriptName()
```

Don't worry about memorizing this - you'll get used to it by copying examples.

---

## Making It More Interesting

Now that the basics work, let's show more info:

```lua
local function onEnterVehicle(player)
    if player ~= getPlayer() then return end
    
    local vehicle = player:getVehicle()
    if vehicle then
        local name = vehicle:getScriptName()
        local speed = vehicle:getMaxSpeed()
        
        print("=== VEHICLE INFO ===")
        print("Name: " .. name)
        print("Max Speed: " .. speed .. " km/h")
    end
end

Events.OnEnterVehicle.Add(onEnterVehicle)
```

**Try it:** Add this, get in different vehicles, and compare their max speeds!

---

## Key Takeaways

1. **Events connect your code to the game** - `Events.OnEnterVehicle.Add()` is how PZ knows to run your code
2. **Always check if things exist** - `if vehicle then` prevents crashes
3. **The colon `:` calls methods** - `player:getVehicle()` asks the player object to give you the vehicle
4. **Client folder for player-facing code** - Anything the player sees goes in `client/`

---

## What's Next?

- [Reading Vehicle Stats](/pz/build-41/modding/engine-analysis/reading-vehicle-stats) - Check fuel, engine condition, speed
- [Working with Vehicle Parts](/pz/build-41/modding/engine-analysis/vehicle-parts-basics) - Access tires, doors, engine

---

**You just made your first vehicle mod!** This same pattern - listen for an event, get the vehicle, do something with it - is the foundation for every vehicle mod out there.
