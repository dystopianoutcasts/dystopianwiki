---
id: weapon-repair-repair-formulas
slug: repair-formulas
title: "Repair Formulas and Calculations"
game: pz
version: build-41
section: modding
category: weapon-repair
subcategory: null
difficulty: intermediate
tags:
  - lua
  - item
  - repair
  - weapon
  - formulas
  - and
  - calculations
excerpt: "Mathematical breakdown of repair system - degradation formulas, success calculations, XP gains, and practical examples with worked calculations."
table_of_contents:
  - text: "Condition Degradation"
    link: "#condition-degradation"
  - text: "Weapon Degradation Formula"
    link: "#weapon-degradation-formula"
  - text: "Maintenance Skill Effect"
    link: "#maintenance-skill-effect"
  - text: "Repair Calculations"
    link: "#repair-calculations"
  - text: "Condition Restoration"
    link: "#condition-restoration"
  - text: "Engine Repair Formula (Exact)"
    link: "#engine-repair-formula-exact"
  - text: "Clothing Repair Duration"
    link: "#clothing-repair-duration"
  - text: "Success Chance"
    link: "#success-chance"
  - text: "Calculation"
    link: "#calculation"
  - text: "Skill-Based Success Modifiers"
    link: "#skill-based-success-modifiers"
  - text: "Failure Consequences"
    link: "#failure-consequences"
  - text: "Condition Caps"
    link: "#condition-caps"
  - text: "Maximum Condition"
    link: "#maximum-condition"
  - text: "Minimum Condition"
    link: "#minimum-condition"
  - text: "XP Gain Formulas"
    link: "#xp-gain-formulas"
  - text: "Maintenance XP (Weapon Usage)"
    link: "#maintenance-xp-weapon-usage"
  - text: "Mechanics XP (Engine Repair)"
    link: "#mechanics-xp-engine-repair"
  - text: "Tailoring XP (Clothing Repair)"
    link: "#tailoring-xp-clothing-repair"
  - text: "Repair Cost Analysis"
    link: "#repair-cost-analysis"
  - text: "Material Efficiency Comparison"
    link: "#material-efficiency-comparison"
  - text: "Firearm Repair Cost"
    link: "#firearm-repair-cost"
  - text: "Fixer Uses Consumed"
    link: "#fixer-uses-consumed"
  - text: "Practical Examples"
    link: "#practical-examples"
  - text: "Example 1: Repairing an Axe"
    link: "#example-1-repairing-an-axe"
  - text: "Example 2: Repairing a Pistol"
    link: "#example-2-repairing-a-pistol"
  - text: "Example 3: Vehicle Engine"
    link: "#example-3-vehicle-engine"
  - text: "Summary Tables"
    link: "#summary-tables"
  - text: "Condition Thresholds"
    link: "#condition-thresholds"
  - text: "Skill Bonuses"
    link: "#skill-bonuses"
last_updated: 2026-01-18
---

# Repair Formulas and Calculations

## Introduction

You're trying to balance a repair mod and need to know exactly how much condition a repair restores. Or you're calculating whether your weapon will break before you reach the safe house. Or maybe you want to understand why higher Maintenance skill makes your axe last so much longer.

If you're confused by the math behind repair mechanics, you're not alone. The repair system uses several interconnected formulas (degradation chance, restoration amount, success probability, XP gains) that aren't documented in-game. Understanding how `ConditionLowerChanceOneIn`, Maintenance skill, and random chance combine to determine durability can feel like reverse-engineering.

Here's the good news: once you understand the core formulas, you can predict repair outcomes, balance custom weapons, and optimize repair strategies. This guide breaks down each formula with worked examples showing exactly how the numbers play out.

---

## Condition Degradation

### Weapon Degradation Formula

When using a weapon, condition loss is calculated per action:

```lua
if ZombRand(conditionLowerChance * 2 + maintenanceMod * 2) == 0 then
    -- Condition decreases by 1
    condition = condition - 1  // Loses 1 durability point
else
    -- No degradation, gain Maintenance XP
    AddXP(Perks.Maintenance, 1)  // Reward for maintaining equipment
end
```

**Variables:**
- `conditionLowerChance` = Item's `ConditionLowerChanceOneIn` property
- `maintenanceMod` = Player's Maintenance skill modifier (~0.5 per level)

**Example:**
- Axe has `ConditionLowerChanceOneIn = 15`
- Player has Maintenance level 5 (modifier ~2.5)
- Formula: `ZombRand((15 * 2) + (2.5 * 2))` = `ZombRand(35)`
- Chance of degradation = 1 in 35 ≈ 2.9%
- **Result**: 97.1% chance to avoid degradation and gain 1 Maintenance XP

### Maintenance Skill Effect

Higher Maintenance skill = lower degradation chance:

| Maintenance Level | Approximate Modifier | Effect | Degradation Reduction |
|-------------------|----------------------|--------|-----------------------|
| 0 | 0 | Base degradation rate | 0% |
| 3 | ~1.5 | ~15% reduction | 1 in 33 vs 1 in 30 |
| 5 | ~2.5 | ~25% reduction | 1 in 35 vs 1 in 30 |
| 7 | ~3.5 | ~35% reduction | 1 in 37 vs 1 in 30 |
| 10 | ~5.0 | ~50% reduction | 1 in 40 vs 1 in 30 |

**Practical Impact**: At Maintenance 10, weapons last approximately twice as long as at Maintenance 0.

---

## Repair Calculations

### Condition Restoration

The FixingManager calculates restoration based on:

1. **Item Type** - Different items have different base restoration
2. **Player Skill Level** - Higher skill = more restoration
3. **Fixer Type** - Skill-based fixers often provide better results

**Approximate Formula (derived from gameplay):**
```
conditionRestored = baseAmount * (1 + skillBonus) * conditionModifier
```

Where:
- `baseAmount` = Fixer-specific base restoration (typically 20-40%)
- `skillBonus` = 0.1 per skill level above requirement
- `conditionModifier` = From fixing definition (default 1.0, can be 1.2 for welding, etc.)

**Example Calculation:**
- Axe at 30% condition
- Repairing with Woodglue (base restoration ~35%)
- Player Woodwork 4, requirement 2 (2 levels above)
- ConditionModifier: 1.0 (default)

```
skillBonus = (4 - 2) * 0.1 = 0.2  // 20% bonus
conditionRestored = 35 * (1 + 0.2) * 1.0 = 42%
newCondition = 30 + 42 = 72%
```

### Engine Repair Formula (Exact)

```lua
local condPerPart = 1 + (skillLevel / 2)  // Base + skill bonus
if condPerPart > 5 then
    condPerPart = 5  // Hard cap at 5 per part
end

-- For each EnginePart used:
condition = condition + condPerPart
if condition > 100 then
    condition = 100  // Maximum condition cap
end
```

**Examples:**
| Skill Above Requirement | Condition Per Part | Calculation |
|-------------------------|-------------------|-------------|
| 0 | 1 | 1 + (0 / 2) = 1 |
| 1 | 1.5 | 1 + (1 / 2) = 1.5 |
| 2 | 2 | 1 + (2 / 2) = 2 |
| 4 | 3 | 1 + (4 / 2) = 3 |
| 6 | 4 | 1 + (6 / 2) = 4 |
| 8+ | 5 (max) | 1 + (8 / 2) = 5 (capped) |

**Practical Example:**
- Engine at 40% condition
- Mechanics skill 6, requirement 3 (3 above)
- Using 5 Engine Parts

```
condPerPart = 1 + (3 / 2) = 2.5
totalRestoration = 2.5 * 5 = 12.5
newCondition = 40 + 12.5 = 52.5%
```

### Clothing Repair Duration

```lua
maxTime = 150 - (tailoringLevel * 6)  // Faster with higher skill
```

| Tailoring Level | Duration (ticks) | Duration (seconds) | Calculation |
|-----------------|------------------|-------------------|-------------|
| 0 | 150 | ~5.0 | 150 - (0 * 6) = 150 |
| 1 | 144 | ~4.8 | 150 - (1 * 6) = 144 |
| 3 | 132 | ~4.4 | 150 - (3 * 6) = 132 |
| 5 | 120 | ~4.0 | 150 - (5 * 6) = 120 |
| 7 | 108 | ~3.6 | 150 - (7 * 6) = 108 |
| 10 | 90 | ~3.0 | 150 - (10 * 6) = 90 |

**Practical Impact**: At Tailoring 10, repairs are 40% faster than at Tailoring 0 (90 ticks vs 150 ticks).

---

## Success Chance

### Calculation

```lua
chanceOfSuccess = 100 - FixingManager.getChanceOfFail(item, player, fixing, fixer)
// FixingManager.getChanceOfFail() returns failure % (0-100)
```

**Factors Affecting Success:**
1. **Player Skill Level** vs. required level (primary factor)
2. **Item Current Condition** - Lower condition = harder repair
3. **Fixer Type** - Some fixers are more reliable

### Skill-Based Success Modifiers

| Skill Difference | Approximate Success Bonus | Example |
|-----------------|--------------------------|---------|
| -2 (below req) | -30% (often fails) | 50% → 20% success |
| -1 (below req) | -15% | 70% → 55% success |
| 0 (at req) | 0% (base) | 80% base |
| +1 (above req) | +10% | 80% → 90% success |
| +2 (above req) | +20% | 80% → 100% success |
| +5 (above req) | +40% | 60% → 100% (capped) |

**Practical Example:**
- Repairing axe with Woodglue
- Skill requirement: Woodwork 2
- Base success chance: 75%

```
Player Woodwork 1: 75% - 15% = 60% success
Player Woodwork 2: 75% + 0% = 75% success (at requirement)
Player Woodwork 4: 75% + 20% = 95% success (2 above requirement)
Player Woodwork 7: 75% + 40% = 100% success (5+ above requirement, capped)
```

### Failure Consequences

**Standard Items:**
- Repair fails, materials consumed
- Item condition unchanged
- May need to try again
- Still gain small Maintenance XP

**Vehicle Parts:**
```lua
if ZombRand(failure) < 100 then
    // Failed repair damages part
    condition = condition - ZombRand(5, 10)  // Lose 5-10% condition
end
```

**Critical**: Vehicle repair failures can make things worse!

---

## Condition Caps

### Maximum Condition

```lua
if condition >= 100 then
    condition = 100  // Hard cap
end
```

All items cap at 100 condition regardless of `ConditionMax` in scripts. `ConditionMax` defines durability points, not the percentage cap.

### Minimum Condition

```lua
if condition <= 0 then
    item:setCondition(0)  // Set to zero
    // Item is now broken (isBroken() returns true)
end
```

When condition reaches 0:
- Item becomes "Broken"
- Can no longer be used
- Can still be repaired (if fixing definition exists)

---

## XP Gain Formulas

### Maintenance XP (Weapon Usage)

```lua
-- When condition doesn't degrade:
AddXP(Perks.Maintenance, 1)  // 1 XP per successful use without degradation
```

Gained every time weapon is used without losing condition. At high Maintenance skill, this happens frequently.

**Example**: 97% no-degradation chance = ~97 XP per 100 uses

### Mechanics XP (Engine Repair)

```lua
-- Per engine part used:
AddXP(Perks.Mechanics, numberOfPartsUsed)  // 1 XP per part
```

Only on first repair (tracked via `getMechanicsItem()`). Subsequent repairs on same part give no XP.

### Tailoring XP (Clothing Repair)

```lua
AddXP(Perks.Tailoring, ZombRand(1, 3))  // Random 1-3 XP
```

Random 1-3 XP per patch applied. Average: 2 XP per repair.

---

## Repair Cost Analysis

### Material Efficiency Comparison

| Material | Uses | Skill Req | Efficiency Rating | Best Use Case |
|----------|------|-----------|-------------------|---------------|
| Woodglue | 2 | Woodwork 2 | High (skilled repair) | Wooden weapons (axes, bats) |
| DuctTape | 2 | None | Medium | Universal emergency repair |
| Glue | 2 | None | Medium | Universal general repair |
| Scotchtape | 4 | None | Low (uses more) | Last resort only |

**Cost Analysis:**
- Woodglue: Best restoration, requires skill
- DuctTape/Glue: No skill, decent restoration, universally available
- Scotchtape: Uses 2x more, avoid unless desperate

### Firearm Repair Cost

Repairing a firearm consumes the same type of weapon:
- 1 Pistol + Aiming 3 = Repairs 1 Pistol
- Effective cost: 50% (lose 1, keep 1 repaired)

**Strategy**: Only repair firearms when they're near-broken, to maximize parts-to-repairs ratio.

### Fixer Uses Consumed

```lua
local usesNeeded = fixer:getNumberOfUse()  // Defined in fixing.txt
// Consumes this many uses from fixer item
```

**Example**: `Fixer : DuctTape=2` consumes 2 duct tape uses per repair.

---

## Practical Examples

### Example 1: Repairing an Axe

**Scenario:**
- Axe at 30% condition
- Player has Woodwork level 4
- Two repair options available

**With Woodglue (skill-based):**
```
Skill requirement: Woodwork 2
Skill difference: 4 - 2 = 2 (player exceeds by 2)
Base restoration: ~35%
Skill bonus: 2 * 10% = 20%
Total restoration: 35 * (1 + 0.2) = 42%
Success chance: 80% (base) + 20% (skill) = 100%
Result: 30% → 72% condition (guaranteed success)
```

**With DuctTape (no skill):**
```
Skill requirement: None
Base restoration: ~30%
Skill bonus: 0%
Total restoration: 30%
Success chance: 85% (base)
Result: 30% → 60% condition (15% chance of failure)
```

**Conclusion**: Woodglue provides better restoration and guaranteed success, but requires Woodwork 2.

### Example 2: Repairing a Pistol

**Scenario:**
- Pistol at 20% condition
- Player has Aiming level 5
- Using another Pistol for parts

**Process:**
```
Skill requirement: Aiming 3
Skill difference: 5 - 3 = 2 (player exceeds by 2)
Base restoration: ~50%
Skill bonus: 2 * 10% = 20%
Total restoration: 50 * (1 + 0.2) = 60%
Success chance: 90% (base) + 20% (skill) = 100%
Cost: 1 Pistol (consumed)
Result: 20% → 80% condition (guaranteed success)
```

**Conclusion**: High Aiming skill (5) guarantees firearm repair success and provides excellent restoration.

### Example 3: Vehicle Engine

**Scenario:**
- Engine at 40% condition
- Player has Mechanics level 6
- Engine requires Mechanics 3
- Player has 5 Engine Parts

**Calculation:**
```
Skill above requirement: 6 - 3 = 3
Condition per part: 1 + (3 / 2) = 2.5
Number of parts: 5
Total restoration: 2.5 * 5 = 12.5%
New condition: 40 + 12.5 = 52.5%
XP gained: 5 XP (1 per part, first repair only)
```

**Conclusion**: Need 20 parts total to fully repair engine (40% → 100% = 60% needed, 2.5% per part = 24 parts, capped at 5 per use).

---

## Summary Tables

### Condition Thresholds

| Condition | State | Can Repair? | Priority |
|-----------|-------|-------------|----------|
| 100 | Perfect | No (already max) | N/A |
| 50-99 | Damaged | Yes | Low priority |
| 20-49 | Heavily Damaged | Yes | Medium priority |
| 1-19 | Nearly Broken | Yes | High priority |
| 0 | Broken | Yes (if fixable) | Urgent |

### Skill Bonuses

| Skill Level Above Req | Restoration Bonus | Success Bonus | Practical Impact |
|-----------------------|-------------------|---------------|------------------|
| 0 | Base | Base | Base repair (80% success typical) |
| +1 | +10% | +10% | Noticeable improvement |
| +2 | +20% | +20% | Significant improvement |
| +3 | +25% | +30% | Excellent results |
| +5 | +35% | +40% | Guaranteed success (near 100%) |

---

## Common Mistakes

### ❌ Wrong: Ignoring Skill Bonuses in Calculations

```lua
-- Custom repair calculator
function calculateRepair(item, baseRestoration)
    return baseRestoration  // WRONG! Doesn't account for skill
end

-- Player with Woodwork 5 repairing with Woodglue (requires 2)
// Your code: 35% restoration
// Actual game: 35% * (1 + 0.3) = 45.5% restoration
// Off by 10.5%!
```

**Why it's wrong:** Skill level above requirement provides significant bonuses (10% per level). Ignoring this makes your calculations inaccurate and can mislead mod users.

✅ **Right:**

```lua
function calculateRepair(item, player, fixer, baseRestoration)
    local skillLevel = player:getPerkLevel(fixer:getRequiredSkill())
    local skillReq = fixer:getSkillLevel()
    local skillDiff = math.max(0, skillLevel - skillReq)

    // 10% bonus per skill level above requirement
    local skillBonus = skillDiff * 0.10

    // Apply skill bonus
    local totalRestoration = baseRestoration * (1 + skillBonus)

    return totalRestoration
end
```

### ❌ Wrong: Not Capping Engine Repair Per Part

```lua
// Custom engine repair
function repairEngine(skillAboveReq, parts)
    local condPerPart = 1 + (skillAboveReq / 2)
    // WRONG! No cap, can exceed 5
    return condPerPart * parts
end

// Mechanics 20 (10 above requirement)
// Your code: 1 + (10/2) = 6 per part
// Actual game: capped at 5 per part
```

**Why it's wrong:** The engine repair formula has a hard cap of 5 condition per part. Without this cap, high-skill players would repair engines instantly.

✅ **Right:**

```lua
function repairEngine(skillAboveReq, parts)
    local condPerPart = 1 + (skillAboveReq / 2)

    // Cap at 5 per part (vanilla limit)
    if condPerPart > 5 then
        condPerPart = 5
    end

    return condPerPart * parts
end
```

### ❌ Wrong: Calculating Degradation Chance Backwards

```lua
// Trying to calculate degradation chance
function getDegradationChance(weapon)
    local lowerChance = weapon:getConditionLowerChance()
    return 1 / lowerChance  // WRONG! Doesn't include Maintenance modifier
end

// Axe with ConditionLowerChanceOneIn = 30
// Your code: 1/30 = 3.3%
// Actual (Maintenance 5): 1/(30*2 + 2.5*2) = 1/65 = 1.5%
// Off by more than 2x!
```

**Why it's wrong:** The degradation formula includes BOTH `ConditionLowerChance * 2` AND `MaintenanceMod * 2`. Ignoring the Maintenance multiplier and the *2 factors makes calculations wildly inaccurate.

✅ **Right:**

```lua
function getDegradationChance(weapon, player)
    local lowerChance = weapon:getConditionLowerChance()
    local maintenanceMod = player:getMaintenanceMod()

    // Vanilla formula: ZombRand(lowerChance * 2 + maintenanceMod * 2)
    local denominator = (lowerChance * 2) + (maintenanceMod * 2)

    // Chance is 1 in denominator
    return 1 / denominator
end

// Axe (lowerChance=30) + Maintenance 5 (mod=2.5)
// denominator = (30*2) + (2.5*2) = 65
// chance = 1/65 = 1.54%
```

---

## Try It Yourself

Let's calculate the exact repair outcome for a custom weapon scenario.

### Step 1: The Scenario

You have:
- Custom machete at 25% condition
- Woodwork skill level 6
- Woodglue available (requires Woodwork 2, base restoration 35%)
- ConditionModifier 1.0 (default)

**Question**: What will the machete's condition be after repair?

### Step 2: Calculate Skill Bonus

```
Skill requirement: 2 (Woodwork)
Your skill level: 6
Skill difference: 6 - 2 = 4 levels above requirement

Skill bonus: 4 * 0.10 = 0.40 (40% bonus)
```

### Step 3: Calculate Total Restoration

```
Base restoration: 35%
Skill bonus multiplier: 1 + 0.40 = 1.40
ConditionModifier: 1.0

Total restoration = 35 * 1.40 * 1.0 = 49%
```

### Step 4: Calculate New Condition

```
Current condition: 25%
Restoration: 49%
New condition: 25 + 49 = 74%
```

### Step 5: Calculate Success Chance

```
Base success: 80% (typical for skill-based repair)
Skill bonus: 4 * 10% = 40%
Total success chance: 80 + 40 = 120% → capped at 100%
```

### Result

**Guaranteed success** (100% chance) with machete restored from 25% → 74% condition.

**Why This Works:**
- Skill level 6 vs requirement 2 = significant bonus (40%)
- Base restoration (35%) multiplied by skill multiplier (1.40) = excellent results
- High skill differential guarantees success (4+ levels above = 100% success)

---

## Next Steps

Now that you understand repair formulas:

1. See [Lua Repair Mechanics](lua-repair-mechanics) for implementation details
2. Check [Fixing.txt Anatomy](fixing-txt-anatomy) for repair definition syntax
3. Read [Repair Cheat Sheet](repair-cheat-sheet) for quick formula lookup
