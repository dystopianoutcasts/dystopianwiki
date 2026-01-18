# Seasonal Content Documentation

**Location:** `media/lua/shared/Foraging/forageDefinitions.lua`, `media/scripts/clothing/`
**Purpose:** Document seasonal mechanics and holiday-themed items in Build 41

---

## Overview

Project Zomboid Build 41 has limited seasonal/holiday content. The primary seasonal mechanics are:

1. **Foraging seasons** - Plants available by month
2. **Weather patterns** - Temperature and precipitation by month
3. **Holiday clothing** - Santa outfit items (cosmetic only)

There are no scripted holiday events or seasonal spawning changes based on real-world dates.

---

## Foraging Seasons

The most extensive seasonal system is foraging, where items have:
- `months` - Which months the item can be found
- `bonusMonths` - Months with increased spawn chance
- `malusMonths` - Months with decreased spawn chance

### Example Seasonal Items

| Item | Available Months | Bonus | Malus |
|------|------------------|-------|-------|
| Berries | May-Sept (5-9) | Jun-Aug | May, Sept |
| Mushrooms | Feb-Nov (2-11) | Apr-Jun | Jan, Feb, Oct, Nov |
| Grapes | Jul-Oct (7-10) | Aug-Sept | Jul, Oct |
| Acorns | Sept-Dec (9-12) | Oct | Nov |
| Chestnuts | Sept-Nov (9-11) | Oct | Nov |
| Walnuts | Sept-Nov (9-11) | Oct | Nov |
| Insects/Worms | Year-round | Mar-Oct | Jan, Feb, Nov, Dec |

### Season Categories

**Spring (March-May):**
- Early mushrooms, dandelions, violets
- Rosehips from winter still available
- Insects become more common

**Summer (June-August):**
- Peak berry season (strawberries, blueberries, blackberries)
- Wild herbs abundant
- Most foraging items at maximum availability

**Fall (September-November):**
- Nuts peak (acorns, chestnuts, walnuts)
- Late berries (grapes)
- Mushroom availability decreasing

**Winter (December-February):**
- Very limited foraging
- Rosehips and some bark available
- Insects rare or unavailable

---

## Holiday Clothing Items

Santa outfit pieces exist as cosmetic items:

### Santa Outfit (Red)

| Item | ID | Script File |
|------|-----|-------------|
| Santa Hat | `Hat_SantaHat` | clothing_hats.txt |
| Santa Jacket | `JacketLong_Santa` | clothing_jacket.txt |
| Santa Pants | `Trousers_Santa` | clothing_pants.txt |

### Santa Outfit (Green)

| Item | ID | Script File |
|------|-----|-------------|
| Green Santa Hat | `Hat_SantaHatGreen` | clothing_hats.txt |
| Green Santa Jacket | `JacketLong_SantaGreen` | clothing_jacket.txt |
| Green Santa Pants | `Trousers_SantaGreen` | clothing_pants.txt |

These items can spawn in clothing containers but have no special seasonal spawn rates.

---

## Weather Seasons

Temperature and weather vary by month (controlled by sandbox options):

| Season | Months | Temperature Range | Notes |
|--------|--------|-------------------|-------|
| Winter | Dec-Feb | Cold/freezing | Snow possible |
| Spring | Mar-May | Cool to warm | Rain common |
| Summer | Jun-Aug | Hot | Heat exhaustion possible |
| Fall | Sep-Nov | Warm to cool | Rain common |

Weather affects:
- Player temperature/comfort
- Crop growth (farming)
- Foraging availability
- Zombie behavior (indirectly via player noise)

---

## What Build 41 Does NOT Have

1. **No real-world date sync** - Game doesn't check actual calendar
2. **No holiday events** - No Christmas/Halloween special spawns
3. **No seasonal zombies** - No costume changes by date
4. **No holiday loot** - No presents, candy, special items by date
5. **No seasonal decorations** - World doesn't change by month

---

## Modding Seasonal Content

### Adding Seasonal Foraging Items

```lua
-- In forageDefinitions.lua or mod file
forageDefs.items.MySeasonalItem = {
    type = "Base.MyItem",
    months = { 10, 11 },           -- October-November only
    bonusMonths = { 10 },          -- Extra common in October
    malusMonths = { 11 },          -- Less common in November
    zones = { "Forest", "DeepForest" },
    -- ... other properties
}
```

### Checking Current Month

```lua
-- Get current game month (1-12)
local month = getGameTime():getMonth() + 1  -- Java months are 0-indexed

-- Check if it's "winter" (Dec, Jan, Feb)
if month == 12 or month == 1 or month == 2 then
    -- Winter logic
end

-- Check specific date
local day = getGameTime():getDay()
if month == 12 and day == 25 then
    -- Christmas day logic
end
```

### Creating Holiday Event Mod

```lua
-- Example: Christmas loot modifier
Events.OnGameStart.Add(function()
    local month = getGameTime():getMonth() + 1
    local day = getGameTime():getDay()

    if month == 12 and day >= 20 and day <= 31 then
        -- Add holiday items to loot tables
        table.insert(ProceduralDistributions.list.StoreShelfCombo.items, "Base.Hat_SantaHat")
        table.insert(ProceduralDistributions.list.StoreShelfCombo.items, 5) -- weight
    end
end)
```

---

## Related Systems

- **foraging-system.md** - Full foraging documentation
- **sandbox-options.md** - Weather and temperature settings
- **clothing-system.md** - Outfit definitions including Santa items
- **procedural-distributions.md** - Loot table modification

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Foraging seasons | Complete |
| Holiday items | Complete |
| Weather seasons | Basic |
| Modding examples | Complete |

---

## Notes

Build 41 does not have extensive seasonal content. The game is designed around survival mechanics rather than real-world calendar events. Modders can add seasonal content using the game's existing month/day tracking systems.
