---
id: game-mechanics-injury-system
slug: injury-system
title: "Injury System Reference"
game: pz
version: build-41
section: modding
category: game-mechanics
subcategory: null
difficulty: intermediate
tags:
  - lua
  - item
  - weapon
  - modding
  - api
  - injury
  - system
  - reference
excerpt: "Complete reference for modding injuries, wounds, and health in Project Zomboid. Learn how to apply scratches, cuts, deep wounds, and more through Lua code."
table_of_contents:
  - text: "What Is the Injury System?"
    link: "#what-is-the-injury-system"
  - text: "Quick Start: The Top 3 Injuries"
    link: "#quick-start-the-top-3-injuries"
  - text: "Body Parts Reference"
    link: "#body-parts-reference"
  - text: "Injury Types & Severity"
    link: "#injury-types--severity"
  - text: "Applying Injuries Step by Step"
    link: "#applying-injuries-step-by-step"
  - text: "Checking for Injuries"
    link: "#checking-for-injuries"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Complete API Reference"
    link: "#complete-api-reference"
last_updated: 2026-01-28
---

# Injury System Reference

## What Is the Injury System?

When you open a can without a can opener in Project Zomboid and see "Hand: Scratched" in the health panel, that's the injury system at work. When you cut yourself with a knife, break a leg falling from a roof, or get bitten by a zombie, the game is tracking injuries on specific body parts.

The **injury system** is how Project Zomboid models damage to the player's body. Instead of just losing HP like in simpler games, PZ tracks injuries on 18 different body parts—each with its own wounds, bleeding, fractures, and infections.

As a modder, you might want to:
- Add injuries when players do dangerous actions (opening cans, breaking windows, failing crafting)
- Create realistic consequences for risky decisions
- Add medical mods that treat specific injuries
- Make items or actions that affect health

Here's the thing: the injury system is complex, but you'll mostly use the same 2-3 injury types. Let me show you the simple examples first, then we'll explore the full system.

---

## Quick Start: The Top 3 Injuries

These are the injuries you'll use most often when modding:

### 1. Light Scratch (Most Common)

**When to use:** Player does something slightly dangerous—opens a can without opener, handles broken glass, works without gloves.

```lua
-- Get the player's left hand body part
local hand = player:getBodyDamage():getBodyPart(BodyPartType.Hand_L)

-- Apply a light scratch (same as vanilla farming without gloves)
hand:SetScratchedWeapon(true)  -- Sets scratched status

-- Add tiny bleeding (optional - bandage not required)
hand:setBleedingTime(0.2)  -- 0.2 = very minor bleed
```

**What this does:**
- Adds "Scratched" status to left hand
- Tiny bit of bleeding (0.2 duration)
- Heals naturally on its own
- Bandage helps but isn't required

---

### 2. Moderate Cut

**When to use:** Player does something more dangerous—breaks a window with bare hands, cuts themselves while crafting, handles sharp objects badly.

```lua
-- Get the player's right hand
local hand = player:getBodyDamage():getBodyPart(BodyPartType.Hand_R)

-- Apply a cut
hand:setCut(true)  -- Mark as cut
hand:setCutTime(0)  // 0 = fresh cut

-- Add moderate bleeding
hand:setBleedingTime(5)  -- 5 = moderate bleed (needs bandage)
```

**What this does:**
- Adds "Cut" status to right hand
- Moderate bleeding (5 duration)
- Needs bandage to stop bleeding
- Takes longer to heal than scratches

---

### 3. Deep Wound (Rare - Use Sparingly)

**When to use:** Player does something VERY dangerous—falls from height, gets hit by car, catastrophic crafting failure.

```lua
-- Get the player's leg
local leg = player:getBodyDamage():getBodyPart(BodyPartType.LowerLeg_L)

// Generates deep wound with automatic bleeding
leg:generateDeepWound()  -- All-in-one method
```

**What this does:**
- Adds "Deep Wound" status to left leg
- Heavy bleeding (automatically set)
- Requires stitches to fully heal
- Can be fatal if untreated
- **Use carefully** - this is serious!

> **Key Takeaway:** 90% of mods use light scratches. Moderate cuts for serious situations. Deep wounds only for catastrophic events. Start with scratches and work up.

---

## Body Parts Reference

Before you apply an injury, you need to know which body part to target. Project Zomboid tracks 18 body parts:

**Hands** (most common for crafting injuries):
```lua
BodyPartType.Hand_L        -- Left hand
BodyPartType.Hand_R        -- Right hand
```

**Arms**:
```lua
BodyPartType.ForeArm_L     -- Left forearm
BodyPartType.ForeArm_R     -- Right forearm
BodyPartType.UpperArm_L    -- Left upper arm
BodyPartType.UpperArm_R    -- Right upper arm
```

**Torso**:
```lua
BodyPartType.Torso_Upper   -- Upper chest
BodyPartType.Torso_Lower   -- Lower chest/abdomen
BodyPartType.Back          -- Back
```

**Head & Neck**:
```lua
BodyPartType.Head          -- Head
BodyPartType.Neck          -- Neck
```

**Legs**:
```lua
BodyPartType.UpperLeg_L    -- Left thigh
BodyPartType.UpperLeg_R    -- Right thigh
BodyPartType.LowerLeg_L    -- Left shin/calf
BodyPartType.LowerLeg_R    -- Right shin/calf
BodyPartType.Foot_L        -- Left foot
BodyPartType.Foot_R        -- Right foot
```

**Other**:
```lua
BodyPartType.Groin         -- Groin
```

**Most mods use hands** because most crafting and interactions involve your hands. Legs for falling damage, torso for impacts.

---

## Injury Types & Severity

Here's every injury type from lightest to most severe:

| Injury Type | Severity | Bleeds? | Use Case |
|-------------|----------|---------|----------|
| **Scratch** | Very Light | Minimal | Farming without gloves, opening cans, minor accidents |
| **Cut** | Light | Yes | Breaking glass, cutting with tools, minor combat |
| **Deep Wound** | Severe | Heavy | Falls, car accidents, catastrophic failures |
| **Fracture** | Severe | No | Falling from height, heavy impacts (doesn't bleed but limits movement) |
| **Burn** | Variable | No | Fire, explosions, hot objects |
| **Bite** | Severe | Heavy | Zombie bites (usually means death via infection) |
| **Bullet Wound** | Severe | Heavy | Gunshots (bullet must be removed) |
| **Glass Wound** | Severe | Heavy | Breaking glass (glass must be removed) |

**For modding, stick to:**
- **Scratch** - 80% of use cases
- **Cut** - 15% of use cases
- **Deep Wound** - 5% of use cases (when you really want to punish the player)

The others (fractures, bites, bullets, glass) are specialized and handled by vanilla systems.

---

## Applying Injuries Step by Step

Let's walk through applying each common injury type with full examples.

### Step 1: Get the Body Part

Before you can injure a body part, you need to access it:

```lua
-- Get the player (method varies by context)
local player = getSpecificPlayer(0)  -- In singleplayer/most contexts

-- Get body damage manager
local bodyDamage = player:getBodyDamage()

-- Get specific body part
local hand = bodyDamage:getBodyPart(BodyPartType.Hand_L)
```

---

### Step 2: Apply the Injury

Now apply the injury with appropriate severity:

**Light Scratch (Recommended Default):**
```lua
local hand = player:getBodyDamage():getBodyPart(BodyPartType.Hand_L)

-- Method 1: Weapon/tool scratch (matches vanilla farming)
hand:SetScratchedWeapon(true)  -- Marks as scratched from tool/object

-- Optional: add tiny bleed
hand:setBleedingTime(0.2)  -- Very light bleeding
```

**Standard Scratch:**
```lua
-- Method 2: Generic scratch (use this for non-tool sources)
hand:setScratched(true, false)  -- (isScratched, fromInfection)
hand:setScratchTime(0)  // 0 = fresh scratch
hand:setBleedingTime(0.2)  -- Minimal bleeding
```

**Moderate Cut:**
```lua
local hand = player:getBodyDamage():getBodyPart(BodyPartType.Hand_R)

hand:setCut(true)  // Mark as cut
hand:setCutTime(0)  // 0 = fresh cut
hand:setBleedingTime(5)  // Moderate bleeding (needs bandage)
```

**Severe Deep Wound:**
```lua
local leg = player:getBodyDamage():getBodyPart(BodyPartType.LowerLeg_L)

// All-in-one method (sets wound + bleeding automatically)
leg:generateDeepWound()

// OR manual (if you want control over bleeding)
leg:setDeepWounded(true)  -- Mark as deep wounded
leg:setDeepWoundTime(50)  -- Duration (higher = worse)
leg:setBleedingTime(20)  // Heavy bleeding
```

---

### Step 3: Add Context (Optional)

For realism, you might want to:

**Random Body Part:**
```lua
-- Random hand (left or right, 50/50 chance)
local hand
if ZombRand(2) == 0 then  // ZombRand(2) returns 0 or 1
    hand = bodyDamage:getBodyPart(BodyPartType.Hand_L)
else
    hand = bodyDamage:getBodyPart(BodyPartType.Hand_R)
end

hand:SetScratchedWeapon(true)
```

**Conditional Injury (Based on Chance):**
```lua
-- 30% chance of injury
if ZombRand(100) < 30 then  // Returns 0-99, so < 30 = 30% chance
    local hand = bodyDamage:getBodyPart(BodyPartType.Hand_L)
    hand:SetScratchedWeapon(true)
end
```

---

## Checking for Injuries

You might want to check if a body part is injured before applying more damage or for conditional logic.

**Basic Checks:**
```lua
local hand = player:getBodyDamage():getBodyPart(BodyPartType.Hand_L)

-- Boolean checks (true/false)
if hand:scratched() then
    print("Hand is scratched!")
end

if hand:isCut() then
    print("Hand is cut!")
end

if hand:bleeding() then
    print("Hand is bleeding!")
end

if hand:isDeepWounded() then
    print("Hand has deep wound!")
end

// Check if ANY injury exists
if hand:HasInjury() then
    print("Hand is injured!")
end
```

**Severity Checks (Get Duration Values):**
```lua
-- Get bleeding time remaining (higher = worse)
local bleedTime = hand:getBleedingTime()
if bleedTime > 10 then
    print("Heavy bleeding!")
end

-- Get scratch duration
local scratchTime = hand:getScratchTime()

-- Get deep wound severity
local deepWoundTime = hand:getDeepWoundTime()
```

**Check All Body Parts:**
```lua
-- Check if player has ANY injuries on hands
local function handsAreInjured(player)
    local bd = player:getBodyDamage()
    local leftHand = bd:getBodyPart(BodyPartType.Hand_L)
    local rightHand = bd:getBodyPart(BodyPartType.Hand_R)

    return leftHand:HasInjury() or rightHand:HasInjury()
end
```

---

## Common Mistakes

### Mistake 1: Using ReduceGeneralHealth() For Injuries

❌ **Dangerous:**
```lua
// DON'T DO THIS!
player:getBodyDamage():ReduceGeneralHealth(8)  -- Directly removes 8% HP
```

**Why this is wrong:** This bypasses the entire injury system and directly damages the player's HP pool. It's extremely harsh—8 HP is massive (zombies don't do this much direct damage). It doesn't create visible injuries, doesn't allow treatment, and can easily kill players.

✅ **Do this instead:**
```lua
// Apply actual injury that players can see and treat
local hand = player:getBodyDamage():getBodyPart(BodyPartType.Hand_L)
hand:SetScratchedWeapon(true)  // Light injury, visible, treatable
hand:setBleedingTime(0.2)  // Minimal bleeding
```

**Why this works:** Creates a visible injury ("Hand: Scratched"), can be bandaged, heals naturally, doesn't risk killing the player.

---

### Mistake 2: Forgetting to Set Injury Time

❌ **Doesn't work right:**
```lua
hand:setCut(true)  // Cut is set but has no duration
// No setCutTime() call!
```

**What happens:** The injury exists but may not display correctly or heal properly.

✅ **Works:**
```lua
hand:setCut(true)  // Mark as cut
hand:setCutTime(0)  // 0 = fresh cut
```

**Why:** Injury time tracks how fresh the wound is. 0 = brand new, higher values = older/healing. Always set the time when applying injuries.

---

### Mistake 3: Excessive Bleeding Values

❌ **Too harsh:**
```lua
hand:setBleedingTime(50)  // 50 is EXTREME bleeding
```

**What happens:** Player bleeds out and dies rapidly.

✅ **Reasonable values:**
```lua
// Light scratch
hand:setBleedingTime(0.2)  // Tiny bleed, optional bandage

// Moderate cut
hand:setBleedingTime(5)  // Noticeable bleed, needs bandage

// Severe cut
hand:setBleedingTime(10)  // Heavy bleed, urgently needs bandage

// Deep wound (life-threatening)
hand:setBleedingTime(20)  // Critical, can be fatal
```

**Why:** Bleeding is cumulative. Even moderate bleeding will kill a player if left untreated for too long. Start low and test.

---

### Mistake 4: Wrong Body Part Type Format

❌ **Doesn't work:**
```lua
local hand = bodyDamage:getBodyPart("Hand_L")  // String - WRONG!
```

**What happens:** Error or nil return - no body part found.

✅ **Works:**
```lua
local hand = bodyDamage:getBodyPart(BodyPartType.Hand_L)  // Enum - correct!
```

**Why:** Body parts use the `BodyPartType` enum, not strings. Always use `BodyPartType.PartName`.

---

### Mistake 5: Applying Bites Casually

❌ **Kills the player:**
```lua
hand:SetBitten(true)  // This starts infection = death
```

**What happens:** Player is infected and will die (unless sandbox settings disable zombie infection).

✅ **Only use bites for zombie attacks:**
```lua
// Regular injury:
hand:SetScratchedWeapon(true)  // Just a scratch, not a bite

// Only use bites in zombie attack code or intentional death scenarios
```

**Why:** Bites in Project Zomboid are zombie-specific and almost always fatal. Don't use them for regular injuries.

---

## Try It Yourself

Let's create a test mod that applies injuries when you press a key.

### Step 1: Create the Mod Structure

```
Zomboid/mods/InjuryTest/
├── mod.info
└── media/
    └── lua/
        └── client/
            └── InjuryTest.lua
```

**mod.info:**
```
name=Injury System Test
id=InjuryTest
description=Press F8 to test different injuries
```

---

### Step 2: Write the Test Code

**InjuryTest.lua:**
```lua
-- Test function: Apply light scratch to left hand
local function testLightScratch()
    local player = getSpecificPlayer(0)  -- Get the player
    local hand = player:getBodyDamage():getBodyPart(BodyPartType.Hand_L)

    hand:SetScratchedWeapon(true)  -- Apply scratch
    hand:setBleedingTime(0.2)  // Tiny bleed

    print("Applied light scratch to left hand")
end

-- Test function: Apply moderate cut to right hand
local function testModerateCut()
    local player = getSpecificPlayer(0)
    local hand = player:getBodyDamage():getBodyPart(BodyPartType.Hand_R)

    hand:setCut(true)  // Mark as cut
    hand:setCutTime(0)  // Fresh cut
    hand:setBleedingTime(5)  // Moderate bleeding

    print("Applied moderate cut to right hand")
end

-- Test function: Check injury status
local function checkInjuries()
    local player = getSpecificPlayer(0)
    local bd = player:getBodyDamage()

    local leftHand = bd:getBodyPart(BodyPartType.Hand_L)
    local rightHand = bd:getBodyPart(BodyPartType.Hand_R)

    print("=== Injury Status ===")
    print("Left Hand - Scratched:", leftHand:scratched(), "Cut:", leftHand:isCut(), "Bleeding:", leftHand:bleeding())
    print("Right Hand - Scratched:", rightHand:scratched(), "Cut:", rightHand:isCut(), "Bleeding:", rightHand:bleeding())
end

-- Key press handler
local function onKeyPressed(key)
    if key == Keyboard.KEY_F8 then  // F8 key
        testLightScratch()
    elseif key == Keyboard.KEY_F9 then  // F9 key
        testModerateCut()
    elseif key == Keyboard.KEY_F10 then  // F10 key
        checkInjuries()
    end
end

-- Register the key press event
Events.OnKeyPressed.Add(onKeyPressed)

print("InjuryTest mod loaded! Press F8=scratch, F9=cut, F10=check")
```

---

### Step 3: Test It

1. Enable the mod
2. Start a game
3. Press **F8** - gives you a light scratch on left hand
4. Open health panel (H key) - you should see "Hand: Scratched"
5. Press **F9** - gives you a moderate cut on right hand
6. Check health panel - you should see "Hand: Cut, Bleeding"
7. Press **F10** - prints injury status to console

**What to observe:**
- Light scratches barely bleed
- Moderate cuts bleed more and need bandaging
- The health panel shows all injuries
- Bleeding drains health slowly

---

### Step 4: Experiment

Try changing the bleeding values:

```lua
-- In testLightScratch, change:
hand:setBleedingTime(0.2)  -- Current: tiny bleed

-- To:
hand:setBleedingTime(10)  -- Heavy bleed

-- Reload and test - notice the difference!
```

Or test different body parts:

```lua
-- Instead of hand, try leg:
local leg = player:getBodyDamage():getBodyPart(BodyPartType.LowerLeg_L)
leg:SetScratchedWeapon(true)
```

---

## Complete API Reference

**For reference:** Full list of injury-related methods. You won't need most of these, but they're here when you need something specific.

### Getting Body Parts
```lua
local bodyDamage = player:getBodyDamage()
local bodyPart = bodyDamage:getBodyPart(BodyPartType.X)
local allParts = bodyDamage:getBodyParts()  -- ArrayList of all parts
```

### Applying Injuries
```lua
-- Scratches
bodyPart:setScratched(true, false)  // (isScratched, fromInfection)
bodyPart:SetScratchedWeapon(true)  // Tool/weapon scratch
bodyPart:setScratchTime(0)  // 0 = fresh

-- Cuts
bodyPart:setCut(true)
bodyPart:setCutTime(0)

-- Bleeding
bodyPart:setBleedingTime(amount)  // 0.2=tiny, 5=moderate, 20=severe

-- Deep Wounds
bodyPart:generateDeepWound()  // Auto-generates with bleeding
bodyPart:setDeepWounded(true)  // Manual
bodyPart:setDeepWoundTime(50)

-- Specialized
bodyPart:generateDeepShardWound()  // Deep wound + glass
bodyPart:setBurnTime(50)  // Burn (higher = worse)
bodyPart:setFractureTime(21)  // Fracture (days to heal)
bodyPart:setHaveBullet(true, 0)  // Bullet wound
bodyPart:SetBitten(true)  // Zombie bite (usually fatal)
bodyPart:SetInfected(true)  // Infection (kills player)
```

### Checking Injuries
```lua
-- Boolean checks
bodyPart:scratched()
bodyPart:isCut()
bodyPart:bleeding()
bodyPart:isDeepWounded()
bodyPart:bitten()
bodyPart:isBurnt()
bodyPart:haveBullet()
bodyPart:haveGlass()
bodyPart:bandaged()
bodyPart:stitched()
bodyPart:HasInjury()  // Any injury at all?

-- Duration/severity
bodyPart:getScratchTime()
bodyPart:getCutTime()
bodyPart:getBleedingTime()
bodyPart:getDeepWoundTime()
bodyPart:getBurnTime()
bodyPart:getFractureTime()
```

### Healing
```lua
-- Remove specific injuries
bodyPart:setScratched(false, true)
bodyPart:setScratchTime(0)
bodyPart:setCut(false)
bodyPart:setCutTime(0)
bodyPart:setDeepWounded(false)
bodyPart:setBleedingTime(0)

// Full heal (removes everything)
bodyPart:RestoreToFullHealth()
```

### Health System
```lua
-- AVOID: Direct HP damage (use injuries instead)
bodyDamage:ReduceGeneralHealth(amount)  // Dangerous!

-- Check health
bodyDamage:getOverallBodyHealth()  // Current HP (0-100)
```

---

## Key Takeaways

1. **Start with scratches** - `SetScratchedWeapon(true)` is your default for most situations

2. **Use body-part injuries, not direct HP damage** - Never use `ReduceGeneralHealth()` unless you know exactly what you're doing

3. **Bleeding values matter** - 0.2 = minor, 5 = moderate, 20 = life-threatening

4. **Always set injury time** - Use `setCutTime(0)`, `setScratchTime(0)`, etc.

5. **Hands are most common** - Most crafting injuries affect hands (`Hand_L` or `Hand_R`)

6. **Test your values** - Injuries can kill players faster than you think. Start light and adjust up.

7. **Use enums, not strings** - `BodyPartType.Hand_L`, not `"Hand_L"`

---

**What's next?** Now that you understand injuries, check out [Events](../../lua/events/events-overview) to learn when to trigger injuries, or [Timed Actions](../../lua/timed-actions) to add crafting animations with injury chances.
