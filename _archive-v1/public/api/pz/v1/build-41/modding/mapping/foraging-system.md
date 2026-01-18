# Foraging System Documentation

**Location:** `media/lua/shared/Foraging/` and `media/lua/client/Foraging/`
**Purpose:** Item scavenging, zone definitions, profession bonuses, and search mechanics

---

## File Structure

```
lua/shared/Foraging/
├── forageDefinitions.lua      # Item and zone definitions (158KB)
└── forageSystem.lua           # Core foraging mechanics (67KB)

lua/client/Foraging/
├── forageClient.lua           # Client-side initialization
├── ISBaseIcon.lua             # Base icon class
├── ISForageAction.lua         # Foraging timed action
├── ISForageIcon.lua           # Forage item icon
├── ISSearchManager.lua        # Search logic manager
├── ISSearchWindow.lua         # Search UI window
├── ISWorldItemIcon.lua        # World item icon
└── ISZoneDisplay.lua          # Zone display UI
```

---

## Foraging Zones

Zones define where items can be found and their density.

### Zone Definitions

| Zone | Density Min | Density Max | Refill % | Setting |
|------|-------------|-------------|----------|---------|
| DeepForest | 8 | 10 | 7% | NatureAbundance |
| Forest | 8 | 10 | 7% | NatureAbundance |
| Vegitation | 6 | 8 | 5% | NatureAbundance |
| FarmLand | 5 | 7.5 | 5% | NatureAbundance |
| Farm | 5 | 7.5 | 5% | NatureAbundance |
| TrailerPark | 1.5 | 5 | 3% | OtherLoot |
| TownZone | 3 | 5 | 3% | OtherLoot |
| Nav | 3 | 5 | 3% | OtherLoot |

### Zone Properties

```lua
forageZones = {
    DeepForest = {
        name = "DeepForest",
        densityMin = 8,           -- Minimum icon density
        densityMax = 10,          -- Maximum icon density
        refillPercent = 7,        -- % refilled per game day
        abundanceSetting = "NatureAbundance",
    },
}
```

---

## Forage Categories

Categories group items and define zone-specific chances.

### Category List

| Category | Type Category | Identify Level | Description |
|----------|---------------|----------------|-------------|
| Animals | Animals | 5 | Living animals (frogs, worms, etc.) |
| DeadAnimals | Animals | 5 | Dead animals for food |
| Berries | Food | 3 | Wild berries |
| Fruits | Food | 7 | Wild fruits |
| Vegetables | Food | 7 | Wild vegetables |
| Crops | Food | 5 | Wild crop plants |
| Mushrooms | Food | 3 | Fungi |
| Insects | Animals | 3 | Bugs and insects |
| FishBait | Fishing | 3 | Fishing bait items |
| MedicinalPlants | Plants | 5 | Medical herbs |
| WildPlants | Plants | 3 | General wild plants |
| WildHerbs | Plants | 3 | Cooking herbs |
| ForestRarities | Other | 7 | Rare forest items |
| Firewood | Resources | 0 | Wood and kindling |
| Stones | Resources | 0 | Rocks and stones |
| Trash | Junk | 0 | Urban garbage |
| Junk | Junk | 0 | Miscellaneous items |
| JunkFood | Food | 0 | Discarded food |
| Medical | Medical | 0 | Medical supplies |
| Ammunition | Weapons | 5 | Ammo in wilderness |
| JunkWeapons | Weapons | 0 | Discarded weapons |
| JunkClothing | Clothing | 0 | Discarded clothes |

### Category Definition Structure

```lua
forageCategories = {
    ["Berries"] = {
        name = "Berries",
        typeCategory = "Food",
        identifyCategoryPerk = "PlantScavenging",
        identifyCategoryLevel = 3,
        categoryHidden = false,
        validFloors = { "floors_exterior_natural", "blends_natural" },
        rainChance = 0,           -- Weather modifier
        hasRainedChance = 0,      -- Post-rain modifier
        snowChance = 0,           -- Snow modifier
        dayChance = 0,            -- Daytime modifier
        nightChance = 0,          -- Nighttime modifier
        zoneChance = {
            DeepForest = 30,
            Forest = 30,
            Vegitation = 20,
            -- Rolls, NOT percentage
        },
        spriteAffinities = {},    -- World sprites that attract items
        chanceToMoveIcon = 0.0,   -- Move existing icon chance
        chanceToCreateIcon = 0.0, -- Create new icon chance
        focusChanceMin = 20.0,    -- Min focus search bonus
        focusChanceMax = 33.3,    -- Max focus search bonus
    },
}
```

---

## Item Definitions

Individual items that can be foraged.

### Item Properties

```lua
forageItems = {
    Blackberry = {
        type = "Base.BerryBlack",     -- Item type
        minCount = 1,                  -- Min spawn count
        maxCount = 3,                  -- Max spawn count
        skill = 2,                     -- Required skill level
        xp = 3,                        -- XP reward
        perks = { "PlantScavenging" }, -- Required perks
        categories = { "Berries" },    -- Item categories
        -- Weather modifiers (percent)
        rainChance = 0,
        hasRainedChance = 0,
        snowChance = -10,
        dayChance = 0,
        nightChance = 0,
        -- Zone rolls
        zones = {
            Forest = 15,
            DeepForest = 20,
            Vegitation = 10,
        },
        -- Seasonal availability
        months = { 4, 5, 6, 7, 8, 9 },
        bonusMonths = { 6, 7, 8 },
        malusMonths = { 4, 5 },
        -- Spawn functions
        spawnFuncs = { doWildFoodSpawn, doRandomAgeSpawn },
        -- Poison settings
        poisonChance = 0,
        poisonPowerMin = 0,
        poisonPowerMax = 0,
        poisonDetectionLevel = 0,
        -- Visual settings
        altWorldTexture = nil,
        itemSizeModifier = 0,
        isItemOverrideSize = false,
        forceOutside = true,
    },
}
```

---

## Profession Bonuses

Professions and traits modify foraging ability.

### Occupation Bonuses

| Occupation | Vision | Weather | Darkness | Specializations |
|------------|--------|---------|----------|-----------------|
| Park Ranger | +2.0 | 33% | 15% | Animals 10%, Berries 20%, MedicinalPlants 75% |
| Veteran | +1.75 | 33% | 15% | Ammunition 50%, MedicinalPlants 20% |
| Farmer | +1.5 | 33% | 10% | Crops 50%, Animals 10%, Fruits 10% |
| Lumberjack | +1.25 | 33% | 15% | Firewood 50%, Mushrooms 20% |
| Fisherman | +1.0 | 40% | 10% | Insects 50%, FishBait 50% |
| Chef | 0 | 0 | 0 | Mushrooms 50%, Berries 20%, WildHerbs 20% |
| Unemployed | +0.5 | 10% | 5% | Trash 10%, Junk 10%, JunkFood 10% |
| Doctor | 0 | 0 | 0 | Medical 40%, MedicinalPlants 10% |
| Nurse | 0 | 0 | 0 | Medical 30%, MedicinalPlants 5% |
| Burgerflipper | 0 | 0 | 0 | JunkFood 30%, Mushrooms 15% |

### Trait Bonuses

| Trait | Vision | Weather | Darkness | Specializations |
|-------|--------|---------|----------|-----------------|
| Hiker | +1.0 | 25% | 10% | Animals 5%, Berries 10%, MedicinalPlants 10% |
| Hunter | +0.5 | 13% | 5% | Animals 5%, Berries 3%, Mushrooms 3% |
| Eagle Eyed | +1.0 | 0 | 0 | - |
| Gardener | +0.4 | 13% | 0 | Crops 5%, Fruits 5%, Vegetables 5% |
| Outdoorsman | +0.4 | 13% | 5% | All nature categories 5% |
| Cook/Cook2 | +0.2 | 0 | 0 | Animals 5%, Berries 5%, Mushrooms 5% |
| Night Vision | +0.4 | 0 | 0 | - |
| Herbalist | +0.2 | 0 | 0 | MedicinalPlants 15%, Berries 5%, Mushrooms 5% |
| Short Sighted | -2.0 | 0 | 0 | - (negated by glasses) |
| Agoraphobic | -1.5 | 0 | 0 | - |

### Skill Definition Structure

```lua
forageSkills = {
    parkranger = {
        name = "parkranger",
        type = "occupation",
        visionBonus = 2,          -- Bonus vision squares
        weatherEffect = 33,       -- Weather reduction %
        darknessEffect = 15,      -- Darkness reduction %
        specialisations = {
            ["Animals"] = 10,     -- Category bonus %
            ["Berries"] = 20,
            ["MedicinalPlants"] = 75,
        },
    },
}
```

---

## Vision System

Vision determines how far and well a player can search.

### Base Settings

| Setting | Value | Description |
|---------|-------|-------------|
| minVisionRadius | 3.0 | Minimum search radius |
| maxVisionRadius | 10.0 | Maximum search radius |
| visionRadiusCap | 15.0 | Absolute maximum after bonuses |
| levelBonus | 0.5 | Bonus per perk level |
| aimMultiplier | 1.33 | Bonus when looking around |
| sneakMultiplier | 1.10 | Bonus when sneaking |
| darkVisionRadius | 1.5 | Radius for dark squares |

### Vision Penalties (Max %)

| Penalty | Max | Trigger |
|---------|-----|---------|
| Light | 95% | Darkness level |
| Weather | 75% | Rain, fog, snow |
| Exhaustion | 75% | Low endurance/fatigue |
| Panic | 95% | Fear, panic, stress |
| Body | 75% | Drunk, pain, sickness |
| Clothing | 95% | Helmet, glasses, blindfold |

### Vision Bonuses

| Bonus | Max | Trigger |
|-------|-----|---------|
| Hunger | 50% | Finding food when hungry |
| Effect Reduction | 75% | From traits/occupation |

---

## Spawn Functions

Custom functions modify items when picked up.

### Built-in Spawn Functions

| Function | Description |
|----------|-------------|
| `doWildFoodSpawn` | Randomize food size (25-75% + skill bonus) |
| `doRandomAgeSpawn` | Randomize food freshness based on skill |
| `doWildCropSpawn` | Chance to get seeds with crops |
| `doPoisonItemSpawn` | Apply poison to item |
| `doJunkWeaponSpawn` | Randomize weapon condition |
| `doGenericItemSpawn` | Randomize drainable/condition |
| `doClothingItemSpawn` | Randomize wetness, blood, dirt |
| `doDeadTrapAnimalSpawn` | Set animal size and freshness |

### Spawn Function Example

```lua
local function doWildFoodSpawn(_character, _inventory, _itemDef, _items)
    local perkLevel = forageSystem.getPerkLevel(_character, _itemDef);
    for item in iterList(_items) do
        -- 25-75% base size + up to 50% for skill
        local sizeModifier = ((ZombRand(50) + 25) / 100);
        sizeModifier = sizeModifier + ((ZombRand(perkLevel) + 1) / 5)
        -- Modify food stats
        item:setBaseHunger(item:getBaseHunger() * sizeModifier);
        item:setCalories(item:getCalories() * sizeModifier);
    end;
    return _items;
end
```

---

## Sprite Affinities

World sprites that attract certain item categories.

### Affinity Types

| Type | Sprites | Used By |
|------|---------|---------|
| genericPlants | d_plants_1_*, d_generic_1_* | Animals, Fruits, Vegetables |
| specialPlants | d_generic_1_17-19, d_generic_1_47-55 | Rare items |
| stones | d_generic_1_13, floors_overlay_street_* | Stones category |
| wildPlants | d_plants_1_11-15 | Wild plants |
| berryBushes | f_bushes_1_* | Berries |
| bushes | f_bushes_1_64-66 | General bushes |
| shrubs | d_plants_1_19-23, f_bushes_1_* | Shrubs |
| vines | d_plants_1_38, d_plants_1_49-50 | Grapes, Pineapple |
| smallTrees | smallTree_worldSprite.png | Fruits |

---

## Seasonal System

Items have monthly availability.

### Month Modifiers

| Month | Season |
|-------|--------|
| 1, 2, 12 | Winter |
| 3, 4, 5 | Spring |
| 6, 7, 8 | Summer |
| 9, 10, 11 | Fall |

### Seasonal Bonuses

- **bonusMonths**: +50% chance during these months
- **malusMonths**: -50% chance during these months
- Items not in `months` array cannot be found

### Example: Berries

```lua
Blackberry = {
    months = { 4, 5, 6, 7, 8, 9 },    -- Available spring-fall
    bonusMonths = { 6, 7, 8 },         -- Best in summer
    malusMonths = { 4, 5 },            -- Rare in early spring
}
```

---

## Weather Effects

Weather modifies item chances.

### Weather Modifiers

| Condition | Modifier | Example Items |
|-----------|----------|---------------|
| Rain | rainChance | Mushrooms +20%, Slugs +100% |
| Post-Rain | hasRainedChance | Mushrooms +50% |
| Snow | snowChance | Most items -10% to -100% |
| Day | dayChance | Some items prefer day |
| Night | nightChance | Slugs +50%, Snails +50% |

---

## Sample Item Definitions

### Berries

```lua
BerryBlack = {
    type = "Base.BerryBlack",
    minCount = 1, maxCount = 5,
    skill = 2, xp = 3,
    categories = { "Berries" },
    zones = { DeepForest = 20, Forest = 15, Vegitation = 10 },
    months = { 4, 5, 6, 7, 8, 9 },
    bonusMonths = { 6, 7, 8 },
    spawnFuncs = { doWildFoodSpawn, doRandomAgeSpawn },
    altWorldTexture = worldSprites.berryBushes,
}
```

### Mushrooms

```lua
MushroomGeneric6 = {
    type = "Base.MushroomGeneric6",
    skill = 1, xp = 3,
    rainChance = 20,
    hasRainedChance = 50,
    nightChance = 20,
    categories = { "Mushrooms" },
    poisonChance = 15,
    poisonPowerMin = 1,
    poisonPowerMax = 25,
    poisonDetectionLevel = 7,
}
```

### Animals

```lua
Frog = {
    type = "Base.Frog",
    skill = 2, xp = 5,
    rainChance = 100,
    snowChance = -100,
    dayChance = -50,
    nightChance = 50,
    categories = { "Animals" },
    zones = { Forest = 10, DeepForest = 10, Vegitation = 10 },
    months = { 3, 4, 5, 6, 7, 8, 9, 10, 11 },
}
```

---

## Adding Custom Forage Items

### Step 1: Define Item

```lua
forageItems["MyCustomBerry"] = {
    type = "MyMod.CustomBerry",
    minCount = 1,
    maxCount = 3,
    skill = 3,
    xp = 5,
    categories = { "Berries" },
    zones = {
        Forest = 10,
        DeepForest = 15,
    },
    months = { 5, 6, 7, 8 },
    bonusMonths = { 6, 7 },
    spawnFuncs = { doWildFoodSpawn },
}
```

### Step 2: Add to Category (if new)

```lua
forageCategories["MyCategory"] = {
    name = "MyCategory",
    typeCategory = "Food",
    identifyCategoryPerk = "PlantScavenging",
    identifyCategoryLevel = 4,
    validFloors = { "floors_exterior_natural" },
    zoneChance = {
        Forest = 20,
        DeepForest = 25,
    },
}
```

---

## System Constants

### Penalties

| Constant | Value | Description |
|----------|-------|-------------|
| endurancePenalty | 0.015 | Per-search endurance cost |
| fatiguePenalty | -0.001 | Per-search fatigue cost |
| maxIconsPerZone | 2000 | Maximum icons per zone |
| zoneDensityMulti | 20 | Base density multiplier |

### Abundance Settings

```lua
abundanceSettings = {
    NatureAbundance = { -75, -50, 0, 50, 100 },  -- Sandbox levels
    OtherLoot = { -100, -95, -75, -50, 0, 50, 100 },
}
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Zone definitions | Complete |
| Categories | Complete |
| Item definitions | Complete |
| Profession bonuses | Complete |
| Trait bonuses | Complete |
| Vision system | Complete |
| Spawn functions | Complete |
| Seasonal system | Complete |
| Weather effects | Complete |
| Custom item guide | Complete |

---

## Key Patterns

### Zone Rolls vs Percent
- Zone values are **roll counts**, NOT percentages
- Higher values = more chances to roll that item
- Category chances work the same way

### Skill Requirements
- `skill` property sets minimum skill level to see item
- Higher skill reveals rarer items
- Perk level affects item quality (food size, freshness)

### Poison System
- `poisonChance` = % chance item is poisoned
- `poisonDetectionLevel` = skill needed to identify poison
- Used primarily for generic berries and mushrooms

---

## Next Steps

1. Document ISSearchManager mechanics
2. Document icon generation system
3. Create visual foraging zone map
4. Document mod compatibility patterns
