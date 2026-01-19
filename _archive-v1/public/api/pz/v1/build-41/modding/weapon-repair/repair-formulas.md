---
id: repair-formulas
slug: repair-formulas
title: Repair Formulas and Calculations
excerpt: When using a weapon, condition loss is calculated per action: if ZombRand(conditionLowerChance * 2 + maintenanceMod * 2) == 0 then condition = condition - 1 else AddXP(Perks.Maintenance, 1) end...
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
last_updated: 2026-01-09
---
# Repair Formulas and Calculations

## Condition Degradation

### Weapon Degradation Formula

When using a weapon, condition loss is calculated per action:

```lua
if ZombRand(conditionLowerChance * 2 + maintenanceMod * 2) == 0 then
    -- Condition decreases by 1
    condition = condition - 1
else
    -- No degradation, gain Maintenance XP
    AddXP(Perks.Maintenance, 1)
end
```

**Variables:**
- `conditionLowerChance` = Item's `ConditionLowerChanceOneIn` property
- `maintenanceMod` = Player's Maintenance skill modifier

**Example:**
- Axe has `ConditionLowerChanceOneIn = 15`
- Player has Maintenance level 5 (modifier ~2.5)
- Chance of degradation = 1 / (15 * 2 + 2.5 * 2) = 1/35 ≈ 2.9%

### Maintenance Skill Effect

Higher Maintenance skill = lower degradation chance:

| Maintenance Level | Approximate Modifier | Effect |
|-------------------|----------------------|--------|
| 0 | 0 | Base degradation rate |
| 3 | ~1.5 | ~15% reduction |
| 5 | ~2.5 | ~25% reduction |
| 7 | ~3.5 | ~35% reduction |
| 10 | ~5.0 | ~50% reduction |

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
- `baseAmount` = Fixer-specific base restoration
- `skillBonus` = 0.1 per skill level above requirement
- `conditionModifier` = From fixing definition (default 1.0)

### Engine Repair Formula (Exact)

```lua
local condPerPart = 1 + (skillLevel / 2)
if condPerPart > 5 then
    condPerPart = 5
end

-- For each EnginePart used:
condition = condition + condPerPart
if condition > 100 then
    condition = 100
end
```

**Examples:**
| Skill Above Requirement | Condition Per Part |
|-------------------------|-------------------|
| 0 | 1 |
| 1 | 1.5 |
| 2 | 2 |
| 4 | 3 |
| 6 | 4 |
| 8+ | 5 (max) |

### Clothing Repair Duration

```lua
maxTime = 150 - (tailoringLevel * 6)
```

| Tailoring Level | Duration (ticks) | Duration (seconds) |
|-----------------|------------------|-------------------|
| 0 | 150 | ~5.0 |
| 1 | 144 | ~4.8 |
| 3 | 132 | ~4.4 |
| 5 | 120 | ~4.0 |
| 7 | 108 | ~3.6 |
| 10 | 90 | ~3.0 |

## Success Chance

### Calculation

```lua
chanceOfSuccess = 100 - FixingManager.getChanceOfFail(item, player, fixing, fixer)
```

**Factors Affecting Success:**
1. **Player Skill Level** vs. required level
2. **Item Current Condition** - Lower condition = harder repair
3. **Fixer Type** - Some fixers are more reliable

### Skill-Based Success Modifiers

| Skill Difference | Approximate Success Bonus |
|-----------------|--------------------------|
| -2 (below req) | -30% (often fails) |
| -1 (below req) | -15% |
| 0 (at req) | 0% (base) |
| +1 (above req) | +10% |
| +2 (above req) | +20% |
| +5 (above req) | +40% |

### Failure Consequences

**Standard Items:**
- Repair fails, materials consumed
- Item condition unchanged
- May need to try again

**Vehicle Parts:**
```lua
if ZombRand(failure) < 100 then
    -- Failed repair damages part
    condition = condition - ZombRand(5, 10)
end
```

## Condition Caps

### Maximum Condition

```lua
if condition >= 100 then
    condition = 100  -- Hard cap
end
```

All items cap at 100 condition regardless of `ConditionMax` in scripts.

### Minimum Condition

```lua
if condition <= 0 then
    item:setCondition(0)
    -- Item is now broken (isBroken() returns true)
end
```

## XP Gain Formulas

### Maintenance XP (Weapon Usage)

```lua
-- When condition doesn't degrade:
AddXP(Perks.Maintenance, 1)
```

Gained every time weapon is used without losing condition.

### Mechanics XP (Engine Repair)

```lua
-- Per engine part used:
AddXP(Perks.Mechanics, numberOfPartsUsed)
```

Only on first repair (tracked via `getMechanicsItem()`).

### Tailoring XP (Clothing Repair)

```lua
AddXP(Perks.Tailoring, ZombRand(1, 3))
```

Random 1-3 XP per patch applied.

## Repair Cost Analysis

### Material Efficiency Comparison

| Material | Uses | Skill Req | Efficiency Rating |
|----------|------|-----------|-------------------|
| Woodglue | 2 | Woodwork 2 | High (skilled repair) |
| DuctTape | 2 | None | Medium |
| Glue | 2 | None | Medium |
| Scotchtape | 4 | None | Low (uses more) |

### Firearm Repair Cost

Repairing a firearm consumes the same type of weapon:
- 1 Pistol + Aiming 3 = Repairs 1 Pistol
- Effective cost: 50% (lose 1, keep 1 repaired)

### Fixer Uses Consumed

```lua
local usesNeeded = fixer:getNumberOfUse()
-- Consumes this many uses from fixer item
```

## Practical Examples

### Example 1: Repairing an Axe

**Scenario:**
- Axe at 30% condition
- Player has Woodwork level 4

**With Woodglue:**
- Skill requirement: Woodwork 2 (player exceeds by 2)
- Expected restoration: ~40-50%
- Success chance: ~90%
- Result: Axe restored to ~70-80%

**With DuctTape:**
- No skill requirement
- Expected restoration: ~30-40%
- Success chance: ~85%
- Result: Axe restored to ~60-70%

### Example 2: Repairing a Pistol

**Scenario:**
- Pistol at 20% condition
- Player has Aiming level 5

**Process:**
- Requires: Another Pistol (consumed)
- Skill requirement: Aiming 3 (player exceeds by 2)
- Expected restoration: ~50-60%
- Success chance: ~95%
- Result: Pistol restored to ~70-80%

### Example 3: Vehicle Engine

**Scenario:**
- Engine at 40% condition
- Player has Mechanics level 6
- Engine requires Mechanics 3
- Player has 5 Engine Parts

**Calculation:**
- Skill above requirement: 6 - 3 = 3
- Condition per part: 1 + (3 / 2) = 2.5
- Total restoration: 2.5 * 5 = 12.5
- Result: Engine restored to 52.5%

## Summary Tables

### Condition Thresholds

| Condition | State | Can Repair? |
|-----------|-------|-------------|
| 100 | Perfect | No (already max) |
| 50-99 | Damaged | Yes |
| 1-49 | Heavily Damaged | Yes |
| 0 | Broken | Yes (if fixable) |

### Skill Bonuses

| Skill Level Above Req | Restoration Bonus | Success Bonus |
|-----------------------|-------------------|---------------|
| 0 | Base | Base |
| +1 | +10% | +10% |
| +2 | +20% | +20% |
| +3 | +25% | +30% |
| +5 | +35% | +40% | 
