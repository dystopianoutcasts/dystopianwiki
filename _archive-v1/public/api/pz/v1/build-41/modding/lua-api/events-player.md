---
id: events-player
slug: events-player
title: Player Events
excerpt: Player events fire when the player character moves, takes damage, dies, gains XP, or changes equipment. These events are essential for mods that modify player behavior or track player statistics....
game: pz
version: build-41
section: modding
category: lua-api
subcategory: null
difficulty: intermediate
tags:
  - events
  - player
  - movement
  - death
  - xp
  - skills
  - intermediate
last_updated: 2026-01-10
---
# Player Events

## Overview

Player events fire when the player character moves, takes damage, dies, gains XP, or changes equipment. These events are essential for mods that modify player behavior or track player statistics.

---

## Player Update Events

### OnPlayerUpdate
**When:** Every frame, per player
**Parameters:** `player` (IsoPlayer)
**Use Case:** Continuous player monitoring (use sparingly - performance impact)

```lua
Events.OnPlayerUpdate.Add(function(player)
    -- Called every frame - be careful!
    if player:isAsleep() then
        -- Player is sleeping
    end
    
    -- Check for specific conditions
    if player:getMoodles():getMoodleLevel(MoodleType.Tired) >= 3 then
        -- Player is very tired
    end
end)
```
**Files that listen:** 11+ vanilla files
**Performance:** HIGH IMPACT - runs every frame

---

### OnPlayerMove
**When:** Player moves
**Parameters:** `player` (IsoPlayer)
**Use Case:** Movement-triggered effects, footstep sounds, terrain checks

```lua
Events.OnPlayerMove.Add(function(player)
    local square = player:getCurrentSquare()
    if square then
        -- Check terrain
        if square:isOutside() then
            -- Player moved outside
        end
    end
end)
```

---

### OnCreatePlayer
**When:** Player character is created
**Parameters:** `playerIndex` (int), `player` (IsoPlayer)
**Use Case:** Player-specific initialization, modData setup

```lua
Events.OnCreatePlayer.Add(function(playerIndex, player)
    print("Player", playerIndex, "created:", player:getUsername())
    
    -- Initialize player-specific mod data
    local modData = player:getModData()
    modData.myMod = modData.myMod or {
        kills = 0,
        distanceTraveled = 0,
        daysSurvived = 0
    }
end)
```

---

### OnCreateSurvivor
**When:** NPC survivor is created
**Parameters:** `survivor` (IsoSurvivor)
**Use Case:** NPC initialization, custom NPC behavior

```lua
Events.OnCreateSurvivor.Add(function(survivor)
    print("Survivor created:", survivor:getFullName())
end)
```

---

### OnCharacterCreateStats
**When:** Character stats are being calculated during creation
**Parameters:** `player` (IsoPlayer)
**Use Case:** Modify starting stats based on traits/profession

```lua
Events.OnCharacterCreateStats.Add(function(player)
    -- Modify stats after character creation
    local traits = player:getTraits()
    if traits:contains("Athletic") then
        -- Boost fitness further
        player:getBodyDamage():setFitnessLevel(player:getPerkLevel(Perks.Fitness) + 1)
    end
end)
```

---

## Player State Events

### OnPlayerDeath
**When:** Player dies
**Parameters:** `player` (IsoPlayer)
**Use Case:** Death handling, statistics, respawn logic

```lua
Events.OnPlayerDeath.Add(function(player)
    local day = getGameTime():getDay()
    local hours = getGameTime():getWorldAgeHours()
    
    print(player:getUsername(), "died on day", day)
    print("Survived for", hours, "hours")
    
    -- Save death statistics
    local modData = ModData.getOrCreate("DeathStats")
    modData.totalDeaths = (modData.totalDeaths or 0) + 1
end)
```
**Files that listen:** 11+ vanilla files

---

### OnInfectionCheck
**When:** Infection status is checked (zombie virus)
**Parameters:** `player` (IsoPlayer)
**Use Case:** Custom infection handling, cure systems

```lua
Events.OnInfectionCheck.Add(function(player)
    if player:getBodyDamage():IsInfected() then
        -- Player is infected
        local infectionLevel = player:getBodyDamage():getInfectionLevel()
        print("Infection level:", infectionLevel)
    end
end)
```

---

## XP & Skill Events

### AddXP
**When:** Player gains XP in any skill
**Parameters:** `player` (IsoPlayer), `perk` (PerkFactory.Perks), `amount` (float)
**Use Case:** XP tracking, bonus XP systems, skill caps

```lua
Events.AddXP.Add(function(player, perk, amount)
    print(player:getUsername(), "gained", amount, "XP in", tostring(perk))
    
    -- Track total XP gained
    local modData = player:getModData()
    modData.totalXP = (modData.totalXP or 0) + amount
end)
```

---

### LevelPerk
**When:** Player levels up a skill
**Parameters:** `player` (IsoPlayer), `perk` (PerkFactory.Perks), `level` (int)
**Use Case:** Level-up notifications, bonus rewards, achievement tracking

```lua
Events.LevelPerk.Add(function(player, perk, level)
    print(player:getUsername(), "leveled up", tostring(perk), "to level", level)
    
    -- Award bonus for reaching level 5
    if level == 5 then
        -- Give reward item
        player:getInventory():AddItem("Base.SkillBook" .. tostring(perk))
    end
end)
```

---

## Equipment Events

### OnClothingUpdated
**When:** Player clothing changes (equip, remove, wash, dye)
**Parameters:** `player` (IsoPlayer)
**Use Case:** Outfit tracking, armor calculations, visual effects

```lua
Events.OnClothingUpdated.Add(function(player)
    -- Recalculate armor value
    local wornItems = player:getWornItems()
    local totalProtection = 0
    
    for i = 0, wornItems:size() - 1 do
        local item = wornItems:get(i):getItem()
        if item then
            totalProtection = totalProtection + (item:getBiteDefense() or 0)
        end
    end
    
    player:getModData().totalProtection = totalProtection
end)
```
**Triggered in:** Many TimedActions (wear, wash, dye, etc.)

---

### OnEquipPrimary
**When:** Primary weapon is equipped
**Parameters:** `player` (IsoPlayer), `item` (InventoryItem)
**Use Case:** Weapon tracking, special weapon effects

```lua
Events.OnEquipPrimary.Add(function(player, item)
    if item then
        print("Equipped primary:", item:getDisplayName())
        
        -- Check for custom weapon effects
        if item:hasTag("Blessed") then
            enableBlessedWeaponEffects(player)
        end
    else
        print("Unequipped primary weapon")
    end
end)
```

---

### OnEquipSecondary
**When:** Secondary item is equipped (off-hand)
**Parameters:** `player` (IsoPlayer), `item` (InventoryItem)
**Use Case:** Dual-wield tracking, shield effects

```lua
Events.OnEquipSecondary.Add(function(player, item)
    if item then
        print("Equipped secondary:", item:getDisplayName())
    end
end)
```

---

## Common Patterns

### Player Statistics Tracking

```lua
local PlayerStats = {}

Events.OnCreatePlayer.Add(function(playerIndex, player)
    -- Initialize stats on player creation
    local modData = player:getModData()
    modData.stats = modData.stats or {
        zombiesKilled = 0,
        daysSurvived = 0,
        distanceTraveled = 0,
        itemsCrafted = 0
    }
end)

Events.OnZombieDead.Add(function(zombie)
    local player = getPlayer()
    if player then
        local dist = zombie:DistTo(player)
        if dist < 20 then  -- Player likely killed it
            local modData = player:getModData()
            modData.stats.zombiesKilled = modData.stats.zombiesKilled + 1
        end
    end
end)

Events.EveryDays.Add(function()
    local player = getPlayer()
    if player then
        local modData = player:getModData()
        modData.stats.daysSurvived = modData.stats.daysSurvived + 1
    end
end)
```

### XP Multiplier System

```lua
local originalAddXP = nil

Events.OnGameStart.Add(function()
    -- Store original function if you need to modify behavior
    -- Note: Direct XP modification is done via AddXP event
end)

Events.AddXP.Add(function(player, perk, amount)
    -- Apply bonus XP during certain conditions
    local bonus = 0
    
    -- Weekend bonus (example)
    if isWeekend() then
        bonus = amount * 0.25  -- 25% bonus
    end
    
    -- Study bonus if reading
    if player:isReading() then
        bonus = bonus + amount * 0.1  -- 10% reading bonus
    end
    
    if bonus > 0 then
        player:getXp():AddXP(perk, bonus, false, false, false)
    end
end)
```

### Death Penalty System

```lua
Events.OnPlayerDeath.Add(function(player)
    -- Save death location for corpse run
    local modData = ModData.getOrCreate("DeathSystem")
    modData.lastDeath = {
        x = player:getX(),
        y = player:getY(),
        z = player:getZ(),
        time = getGameTime():getWorldAgeHours()
    }
    
    -- Apply death penalty
    local penalty = ModData.getOrCreate("PlayerPenalty")
    penalty.deaths = (penalty.deaths or 0) + 1
    penalty.xpPenalty = math.min(penalty.deaths * 0.05, 0.25)  -- Max 25% penalty
end)
```

### Equipment Set Bonus

```lua
local function checkSetBonus(player)
    local wornItems = player:getWornItems()
    local setCount = 0
    
    -- Check for set pieces
    for i = 0, wornItems:size() - 1 do
        local item = wornItems:get(i):getItem()
        if item and item:hasTag("MySet") then
            setCount = setCount + 1
        end
    end
    
    -- Apply set bonus
    local modData = player:getModData()
    if setCount >= 3 then
        modData.setBonus = "full"
        -- Apply full set bonus
    elseif setCount >= 2 then
        modData.setBonus = "partial"
        -- Apply partial bonus
    else
        modData.setBonus = nil
    end
end

Events.OnClothingUpdated.Add(function(player)
    checkSetBonus(player)
end)
```

---

## Related

- [Events Overview](/build-41/modding/lua-api/events-overview) - Introduction to events
- [Lifecycle Events](/build-41/modding/lua-api/events-lifecycle) - Game boot, start, save events
- [Timed Actions](/build-41/modding/lua-api/timed-actions) - Custom action system
- [Context Menus](/build-41/modding/lua-api/context-menus) - Right-click menu system 