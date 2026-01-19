# Professions & Traits System Documentation

**Location:** `media/lua/shared/NPCs/MainCreationMethods.lua`, `media/lua/shared/NPCs/Professions.lua`
**Purpose:** Define character professions, traits, XP boosts, and mutual exclusions

---

## Overview

Project Zomboid's character creation system uses professions and traits to customize starting attributes. Professions provide XP boosts and free recipes, while traits modify character capabilities with positive/negative effects and point costs.

---

## API Architecture

The system is Java-based with Lua wrappers:

```lua
-- Factory classes (Java)
ProfessionFactory    -- Manages professions
TraitFactory         -- Manages traits
PerkFactory          -- Manages perks/skills
ObservationFactory   -- NPC observations (unused in B41)
SurvivorFactory      -- NPC name generation
```

---

## Profession System

### Creating a Profession

```lua
local prof = ProfessionFactory.addProfession(
    "professionID",           -- Unique identifier
    getText("UI_prof_Name"),  -- Display name (translated)
    "profession_icon",        -- Icon texture name
    pointCost                 -- Positive = gives points, negative = costs points
)
```

### Profession Methods

| Method | Description |
|--------|-------------|
| `prof:addXPBoost(Perks.SkillName, level)` | Add skill XP boost (+1 to +3) |
| `prof:addFreeTrait(traitID)` | Grant free trait |
| `prof:getFreeRecipes():add(recipeName)` | Grant free recipe |
| `prof:getType()` | Get profession ID |
| `prof:getName()` | Get display name |
| `prof:getCost()` | Get point cost |
| `prof:getXPBoostMap()` | Get skill boost map |
| `prof:getFreeTraits()` | Get free traits list |
| `prof:setDescription(desc)` | Set description |

### Accessing Professions

```lua
-- Get all professions
local profList = ProfessionFactory.getProfessions()
for i = 0, profList:size() - 1 do
    local prof = profList:get(i)
    print(prof:getType(), prof:getCost())
end

-- Get specific profession
local prof = ProfessionFactory.getProfession("fireofficer")
```

---

## Vanilla Professions (24 Total)

### Starting Points Breakdown

| Profession | ID | Cost | Free Traits | Key XP Boosts |
|------------|----|----|-------------|---------------|
| Unemployed | `unemployed` | +8 | - | - |
| Firefighter | `fireofficer` | 0 | - | Sprinting+1, Strength+1, Fitness+1, Axe+1 |
| Police Officer | `policeofficer` | -4 | - | Aiming+3, Reloading+2, Nimble+1 |
| Park Ranger | `parkranger` | -4 | - | Trapping+2, Axe+1, Foraging+2, Carpentry+1 |
| Construction Worker | `constructionworker` | -2 | - | Blunt+3, Carpentry+1 |
| Security Guard | `securityguard` | -2 | NightOwl | Sprinting+2, Lightfoot+1 |
| Carpenter | `carpenter` | +2 | - | Carpentry+3, Blunt+1 |
| Burglar | `burglar` | -6 | Burglar | Nimble+2, Sneak+2, Lightfoot+2 |
| Chef | `chef` | -4 | Cook2 | Cooking+3, Maintenance+1, Blade+1 |
| Repairman | `repairman` | -4 | - | Carpentry+1, Maintenance+2, Blunt+1 |
| Farmer | `farmer` | +2 | - | Farming+3 |
| Fisherman | `fisherman` | -2 | - | Fishing+3, Foraging+1 |
| Doctor | `doctor` | +2 | - | First Aid+3, Blade+1 |
| Veteran | `veteran` | -8 | Desensitized | Aiming+2, Reloading+2 |
| Nurse | `nurse` | +2 | - | First Aid+2, Lightfoot+1 |
| Lumberjack | `lumberjack` | 0 | Axeman | Axe+2, Strength+1 |
| Fitness Instructor | `fitnessInstructor` | -6 | Nutritionist2 | Fitness+3, Sprinting+2 |
| Burger Flipper | `burgerflipper` | +2 | Cook2 | Cooking+2, Maintenance+1, Blade+1 |
| Electrician | `electrician` | -4 | - | Electrical+3 |
| Engineer | `engineer` | -4 | - | Electrical+1, Carpentry+1 |
| Metalworker | `metalworker` | -6 | - | Metalworking+3 |
| Mechanic | `mechanics` | -4 | Mechanics2 | Mechanics+3, Blunt+1 |

### Profession Rarity (Multiplayer)

From `Professions.lua`:

```lua
Professions = {
    PoliceOfficer = { rare = 1 },      -- Uncommon
    ParkRanger = { rare = 2 },         -- Rare
    MilitarySoldier = { rare = 2 },    -- Rare
    MilitaryOfficer = { rare = 3 },    -- Very Rare
    Doctor = { rare = 2 },             -- Rare
    Chef = { rare = 3 },               -- Very Rare
    Burglar = { rare = 1 },            -- Uncommon
    Fireman = { rare = 1 },            -- Uncommon
    -- ...
}
```

Rarity levels:
- `rare = 1` - Uncommon (limited slots)
- `rare = 2` - Rare (very limited)
- `rare = 3` - Very Rare (extremely limited)

---

## Trait System

### Creating a Trait

```lua
local trait = TraitFactory.addTrait(
    "traitID",                  -- Unique identifier
    getText("UI_trait_name"),   -- Display name
    cost,                       -- Positive = good trait, negative = bad trait
    getText("UI_trait_desc"),   -- Description
    isFree,                     -- true = profession-granted only
    isRemoveInMP                -- Optional: remove in multiplayer (for sleep traits)
)
```

### Trait Methods

| Method | Description |
|--------|-------------|
| `trait:getType()` | Get trait ID |
| `trait:getLabel()` | Get display name |
| `trait:getDescription()` | Get description |
| `trait:getCost()` | Get point cost (+ good, - bad) |
| `trait:isFree()` | Is profession-only trait |
| `trait:getXPBoostMap()` | Get skill boosts |
| `trait:getMutuallyExclusiveTraits()` | Get exclusive traits |

### Accessing Traits

```lua
-- Get all traits
for i = 0, TraitFactory.getTraits():size() - 1 do
    local trait = TraitFactory.getTraits():get(i)
    if trait:getCost() >= 0 then
        -- Good trait (positive points)
    else
        -- Bad trait (negative points)
    end
end

-- Get specific trait
local brave = TraitFactory.getTrait("Brave")
```

---

## Vanilla Traits (70+ Total)

### Positive Traits (Cost Points)

| Trait | ID | Cost | Effect |
|-------|----|----|--------|
| Athletic | `Athletic` | 10 | +4 Fitness, +4 Sprinting |
| Strong | `Strong` | 10 | +4 Strength |
| Brave | `Brave` | 4 | Reduced panic |
| Thick Skinned | `ThickSkinned` | 8 | Reduced bite/scratch chance |
| Fast Learner | `FastLearner` | 6 | +30% XP gain |
| Fast Healer | `FastHealer` | 6 | Faster injury recovery |
| Keen Hearing | `KeenHearing` | 6 | Wider hearing radius |
| Eagle Eyed | `EagleEyed` | 6 | Wider vision cone |
| Organized | `Organized` | 6 | +30% container capacity |
| Lucky | `Lucky` | 4 | Better loot, reduced events |
| Graceful | `Graceful` | 4 | Quieter movement |
| Inconspicuous | `Inconspicuous` | 4 | Reduced zombie attraction |
| Light Eater | `LightEater` | 4 | Less hunger drain |
| Low Thirst | `LowThirst` | 6 | Less thirst drain |
| Resilient | `Resilient` | 4 | Resist illness |
| Outdoorsman | `Outdoorsman` | 2 | No weather effects |
| Night Owl | `NightOwl` | 0 | Better night vision (free) |
| Fit | `Fit` | 6 | +2 Fitness |
| Stout | `Stout` | 6 | +2 Strength |
| Dexterous | `Dextrous` | 2 | Faster inventory transfers |
| Speed Demon | `SpeedDemon` | 1 | Faster vehicle operation |
| Fast Reader | `FastReader` | 2 | Read books faster |
| Iron Gut | `IronGut` | 3 | Resist food poisoning |
| Adrenaline Junkie | `AdrenalineJunkie` | 8 | Damage boost when panicked |
| Night Vision | `NightVision` | 2 | Better low-light vision |
| Needs Less Sleep | `NeedsLessSleep` | 2 | Sleep less often |

### Negative Traits (Give Points)

| Trait | ID | Cost | Effect |
|-------|----|----|--------|
| Weak | `Weak` | -10 | -5 Strength |
| Unfit | `Unfit` | -10 | -4 Fitness |
| Obese | `Obese` | -10 | Start overweight, -2 Fitness |
| Cowardly | `Cowardly` | -2 | More panic |
| Thin Skinned | `Thinskinned` | -8 | Increased bite/scratch chance |
| Slow Learner | `SlowLearner` | -6 | -30% XP gain |
| Slow Healer | `SlowHealer` | -6 | Slower injury recovery |
| Hard of Hearing | `HardOfHearing` | -4 | Smaller hearing radius |
| Short Sighted | `ShortSighted` | -2 | Narrower vision |
| Deaf | `Deaf` | -12 | No hearing |
| Disorganized | `Disorganized` | -4 | -30% container capacity |
| Unlucky | `Unlucky` | -4 | Worse loot, more events |
| Clumsy | `Clumsy` | -2 | Louder movement |
| Conspicuous | `Conspicuous` | -4 | Increased zombie attraction |
| Hearty Appetite | `HeartyAppitite` | -4 | More hunger drain |
| High Thirst | `HighThirst` | -6 | More thirst drain |
| Prone to Illness | `ProneToIllness` | -4 | Get sick easier |
| Illiterate | `Illiterate` | -8 | Cannot read |
| Agoraphobic | `Agoraphobic` | -4 | Panic outdoors |
| Claustrophobic | `Claustophobic` | -4 | Panic indoors |
| Feeble | `Feeble` | -6 | -2 Strength |
| Out of Shape | `Out of Shape` | -6 | -2 Fitness |
| Overweight | `Overweight` | -6 | Start slightly overweight |
| Underweight | `Underweight` | -6 | Start underweight |
| Very Underweight | `Very Underweight` | -10 | Start very underweight |
| Smoker | `Smoker` | -4 | Nicotine addiction |
| Asthmatic | `Asthmatic` | -5 | Reduced endurance recovery |
| All Thumbs | `AllThumbs` | -2 | Slower inventory transfers |
| Sunday Driver | `SundayDriver` | -1 | Slower vehicle operation |
| Slow Reader | `SlowReader` | -2 | Read books slower |
| Weak Stomach | `WeakStomach` | -3 | Food poisoning easier |
| Hemophobic | `Hemophobic` | -5 | Panic from blood |
| Needs More Sleep | `NeedsMoreSleep` | -4 | Sleep more often |
| Insomniac | `Insomniac` | -6 | Sleep problems |
| Pacifist | `Pacifist` | -4 | Less combat XP |

### Profession-Only Traits (Free)

| Trait | ID | Granted By |
|-------|----|----|
| Axeman | `Axeman` | Lumberjack |
| Burglar | `Burglar` | Burglar |
| Cook | `Cook2` | Chef, Burger Flipper |
| Desensitized | `Desensitized` | Veteran |
| Marksman | `Marksman` | (unused) |
| Nutritionist | `Nutritionist2` | Fitness Instructor |
| Night Owl | `NightOwl` | Security Guard |
| Mechanics | `Mechanics2` | Mechanic |

### Hobby/Skill Traits (Cost Points)

| Trait | ID | Cost | XP Boosts |
|-------|----|----|-----------|
| Cook | `Cook` | 6 | Cooking+2 |
| First Aid | `FirstAid` | 4 | Doctor+1 |
| Fishing | `Fishing` | 4 | Fishing+1 |
| Gardener | `Gardener` | 4 | Farming+1 |
| Jogger | `Jogger` | 4 | Sprinting+1, Nimble+1 |
| Tailor | `Tailor` | 4 | Tailoring+1 |
| Brawler | `Brawler` | 6 | Blunt+1, Blade+1, Spear+1 |
| Former Scout | `Formerscout` | 6 | Foraging+1, Trapping+1 |
| Hiker | `Hiker` | 6 | Trapping+1, Foraging+1 |
| Hunter | `Hunter` | 8 | Aiming+1, Sneak+1, Trapping+2 |
| Baseball Player | `BaseballPlayer` | 4 | Blunt+1, Sprinting+1 |
| Gymnast | `Gymnast` | 5 | Lightfoot+1, Nimble+1 |
| Amateur Mechanic | `Mechanics` | 5 | Mechanics+1 |
| Handy | `Handy` | 8 | Carpentry+1, Blunt+1, Maintenance+1 |
| Herbalist | `Herbalist` | 6 | Doctor+1, PlantScavenging+1 |

---

## Mutual Exclusions

### Setting Exclusions

```lua
TraitFactory.setMutualExclusive("TraitA", "TraitB")
```

### Exclusion Groups

**Physical Build:**
- Strong ↔ Weak, Feeble, Stout
- Athletic ↔ Overweight, Obese, Out of Shape, Unfit, Fit, Very Underweight
- Fit ↔ Out of Shape, Unfit, Overweight
- Obese ↔ Underweight, Very Underweight, LightEater, Fit

**Senses:**
- Deaf ↔ Hard of Hearing, Keen Hearing
- Short Sighted ↔ Eagle Eyed
- Hard of Hearing ↔ Keen Hearing

**Mental:**
- Brave ↔ Cowardly, Agoraphobic, Claustrophobic
- Desensitized ↔ Hemophobic, Cowardly, Brave, Agoraphobic, Claustrophobic
- Claustrophobic ↔ Agoraphobic

**Health:**
- Fast Healer ↔ Slow Healer
- Resilient ↔ Prone to Illness
- Iron Gut ↔ Weak Stomach
- Thick Skinned ↔ Thin Skinned

**Learning:**
- Fast Learner ↔ Slow Learner
- Fast Reader ↔ Slow Reader
- Illiterate ↔ Fast Reader, Slow Reader

**Survival:**
- Lucky ↔ Unlucky
- Organized ↔ Disorganized
- Conspicuous ↔ Inconspicuous
- Clumsy ↔ Graceful
- Low Thirst ↔ High Thirst
- Light Eater ↔ Hearty Appetite
- Needs Less Sleep ↔ Needs More Sleep

**Driving:**
- Speed Demon ↔ Sunday Driver

**Skills:**
- Cook ↔ Cook2 (profession version)
- Mechanics ↔ Mechanics2 (profession version)
- Nutritionist ↔ Nutritionist2 (profession version)

---

## Modding Professions

### Adding a New Profession

```lua
local myProf = ProfessionFactory.addProfession(
    "mymodprofession",
    getText("UI_prof_MyProfession"),
    "profession_mymod_icon",
    -6  -- Costs 6 points
)

-- Add XP boosts
myProf:addXPBoost(Perks.Woodwork, 2)
myProf:addXPBoost(Perks.Maintenance, 1)

-- Add free traits
myProf:addFreeTrait("Handy")

-- Add free recipes
myProf:getFreeRecipes():add("My Mod Recipe")

-- Hook into game boot
Events.OnGameBoot.Add(function()
    -- Add profession after base game
end)
```

### Available Perks

```lua
Perks.Strength     Perks.Fitness      Perks.Cooking
Perks.Farming      Perks.Doctor       Perks.Fishing
Perks.Mechanics    Perks.Electricity  Perks.MetalWelding
Perks.Woodwork     Perks.Aiming       Perks.Reloading
Perks.Axe          Perks.SmallBlunt   Perks.SmallBlade
Perks.LongBlade    Perks.LongBlunt    Perks.Spear
Perks.Maintenance  Perks.Sneak        Perks.Lightfoot
Perks.Nimble       Perks.Sprinting    Perks.Trapping
Perks.PlantScavenging  Perks.Tailoring
```

---

## Modding Traits

### Adding a New Trait

```lua
-- Good trait (costs points)
local myGoodTrait = TraitFactory.addTrait(
    "MyModTrait",
    getText("UI_trait_mymodtrait"),
    6,  -- Costs 6 points
    getText("UI_trait_mymodtraitdesc"),
    false  -- Selectable normally
)

-- Add XP boosts
myGoodTrait:addXPBoost(Perks.Cooking, 1)

-- Bad trait (gives points)
local myBadTrait = TraitFactory.addTrait(
    "MyModBadTrait",
    getText("UI_trait_mymodbadtrait"),
    -4,  -- Gives 4 points
    getText("UI_trait_mymodbadtraitdesc"),
    false
)

-- Profession-only trait
local myFreeTrait = TraitFactory.addTrait(
    "MyModFreeTrait",
    getText("UI_trait_mymodfreetrait"),
    0,
    getText("UI_trait_mymodfreetraitdesc"),
    true  -- Only from professions
)

-- Set mutual exclusions
TraitFactory.setMutualExclusive("MyModTrait", "MyModBadTrait")
```

### Checking Traits at Runtime

```lua
-- Check if player has trait
if player:HasTrait("Brave") then
    -- Player is brave
end

-- Get player traits
local traits = player:getTraits()
for i = 0, traits:size() - 1 do
    local traitID = traits:get(i)
    print(traitID)
end

-- Add trait at runtime
player:getTraits():add("Lucky")

-- Remove trait at runtime
player:getTraits():remove("Unlucky")
```

---

## XP Boost System

### How XP Boosts Work

XP boosts affect starting skill levels:
- `+1` = Start at level 1
- `+2` = Start at level 2
- `+3` = Start at level 3

```lua
-- Get XP boosts from profession
local boostMap = profession:getXPBoostMap()
local kahluaTable = transformIntoKahluaTable(boostMap)
for perk, level in pairs(kahluaTable) do
    local perkName = PerkFactory.getPerkName(perk)
    local levelNum = level:intValue()
    print(perkName .. ": +" .. levelNum)
end
```

### Stacking Boosts

Profession + trait boosts stack:
- Lumberjack (+2 Axe) + Hunter (+0 Axe) = Level 2 Axe
- Carpenter (+3 Carpentry) + Handy (+1 Carpentry) = Level 4 Carpentry

---

## Related Systems

- **Sandbox Options** - Starting point allocation, trait restrictions
- **Skills System** - What perks/skills are available
- **Recipe System** - Free recipes from professions
- **clothing.xml** - Profession outfit definitions
- **zombie-spawning.md** - Profession-specific zombie outfits

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Profession factory API | Complete |
| Trait factory API | Complete |
| Vanilla professions (24) | Complete |
| Vanilla traits (70+) | Complete |
| Mutual exclusions | Complete |
| Modding examples | Complete |
| XP boost system | Complete |
| Runtime trait access | Complete |
