---
id: weapon-model-swapping
slug: weapon-model-swapping
title: Weapon 3D Model Swapping - Complete Guide
excerpt: Based on VFE (Vanilla Firearm Expansion) mod analysis, Project Zomboid **fully supports** runtime weapon model changes. | Component | What It Is | How to Change |...
game: pz
version: build-41
section: modding
category: lua-api
subcategory: null
difficulty: advanced
tags:
  - lua
  - item
  - weapon
  - event
  - api
  - model
  - swapping
last_updated: 2026-01-09
---
# Weapon 3D Model Swapping - Complete Guide

## YES, You Can Change Weapon Models at Runtime

Based on VFE (Vanilla Firearm Expansion) mod analysis, Project Zomboid **fully supports** runtime weapon model changes.

---

## The Three Visual Components of a Weapon

| Component | What It Is | How to Change |
|-----------|-----------|---------------|
| **WeaponSprite** | 3D model when HELD by player | `weapon:setWeaponSprite("ModelName")` |
| **WorldStaticModel** | 3D model when DROPPED in world | `ScriptManager.instance:getItem(name):DoParam("WorldStaticModel = ModelName")` |
| **Texture/Icon** | 2D inventory icon | `weapon:setTexture(getTexture("path"))` |

---

## Method 1: Changing Held Weapon Model (setWeaponSprite)

This is the PRIMARY method for visual weapon changes:

```lua
-- Change the weapon's 3D model when held
weapon:setWeaponSprite("GraveIndex_Legendary")

-- Get the original sprite name (useful for appending)
local baseSprite = weapon:getOriginalWeaponSprite()

-- Build dynamic sprite name
local newSprite = baseSprite .. "_Legendary"
weapon:setWeaponSprite(newSprite)
```

### VFE's Pattern

```lua
-- VFE uses a naming convention: BaseSprite + Suffix
-- Example: "HuntingRifle" + "FGS" = "HuntingRifleFGS"

local originalSprite = weapon:getOriginalWeaponSprite()
if hasLegendaryEnchant then
    originalSprite = originalSprite .. "_Legendary"
end
weapon:setWeaponSprite(originalSprite)
```

---

## Method 2: Changing World Dropped Model (WorldStaticModel)

When weapons are dropped on the ground, they use a different model:

```lua
-- Change the world model for an item type
local function SetWorldModel(itemName, modelName)
    local item = ScriptManager.instance:getItem(itemName)
    item:DoParam("WorldStaticModel = " .. modelName)
end

-- Example: Change Grave Index world model to legendary version
SetWorldModel("Outcast.GraveIndex", "GraveIndex_Legendary_World")
```

**Note:** This changes ALL items of that type. For per-item changes, you need separate item definitions.

---

## Method 3: Changing Inventory Icon (setTexture)

```lua
-- Change the 2D inventory icon
local newIcon = getTexture("media/textures/GraveIndex_Legendary.png")
weapon:setTexture(newIcon)
```

---

## Complete Tier Swap Implementation

For the Grave Index weapon, here's how to implement full visual changes:

### Step 1: Create Model/Texture Assets

```
media/
├── models/                          # 3D models
│   ├── GraveIndex_Common.fbx
│   ├── GraveIndex_Rare.fbx
│   ├── GraveIndex_Epic.fbx
│   └── GraveIndex_Legendary.fbx
├── textures/                        # 2D icons
│   ├── GraveIndex_Common.png
│   ├── GraveIndex_Rare.png
│   ├── GraveIndex_Epic.png
│   └── GraveIndex_Legendary.png
└── scripts/
    └── models_GraveIndex.txt        # Model definitions
```

### Step 2: Register Models in Script

```txt
-- File: media/scripts/models_GraveIndex.txt
module Outcast {
    model GraveIndex_Common
    {
        mesh = weapons/GraveIndex_Common,
        texture = weapons/GraveIndex_Common,
        scale = 1.0,
    }

    model GraveIndex_Rare
    {
        mesh = weapons/GraveIndex_Rare,
        texture = weapons/GraveIndex_Rare,
        scale = 1.0,
    }

    model GraveIndex_Epic
    {
        mesh = weapons/GraveIndex_Epic,
        texture = weapons/GraveIndex_Epic,
        scale = 1.0,
    }

    model GraveIndex_Legendary
    {
        mesh = weapons/GraveIndex_Legendary,
        texture = weapons/GraveIndex_Legendary,
        scale = 1.0,
    }
}
```

### Step 3: Lua Model Swap Function

```lua
-- File: media/lua/client/OutcastTiered/OutcastTiered_Models.lua

OutcastTiered = OutcastTiered or {}
OutcastTiered.Models = {}

-- Model mapping per tier
OutcastTiered.Models.SpriteMap = {
    ["Outcast.GraveIndex"] = {
        Common = "GraveIndex_Common",
        Rare = "GraveIndex_Rare",
        Epic = "GraveIndex_Epic",
        Legendary = "GraveIndex_Legendary"
    }
}

OutcastTiered.Models.IconMap = {
    ["Outcast.GraveIndex"] = {
        Common = "media/textures/GraveIndex_Common.png",
        Rare = "media/textures/GraveIndex_Rare.png",
        Epic = "media/textures/GraveIndex_Epic.png",
        Legendary = "media/textures/GraveIndex_Legendary.png"
    }
}

-- Main function to update weapon visuals
function OutcastTiered.Models:updateWeaponVisuals(weapon)
    local fullType = weapon:getFullType()
    local modData = weapon:getModData()
    local tier = modData["OutcastTier"] or "Common"

    -- Get sprite map for this weapon
    local spriteMap = self.SpriteMap[fullType]
    if spriteMap and spriteMap[tier] then
        weapon:setWeaponSprite(spriteMap[tier])
    end

    -- Get icon map for this weapon
    local iconMap = self.IconMap[fullType]
    if iconMap and iconMap[tier] then
        local texture = getTexture(iconMap[tier])
        if texture then
            weapon:setTexture(texture)
        end
    end
end

-- Hook into equip event
Events.OnEquipPrimary.Add(function(player, weapon)
    if weapon and OutcastTiered:isTierable(weapon) then
        OutcastTiered.Models:updateWeaponVisuals(weapon)
    end
end)

-- Hook into tier upgrade
function OutcastTiered:onTierUpgrade(weapon, newTier)
    local modData = weapon:getModData()
    modData["OutcastTier"] = newTier
    OutcastTiered.Models:updateWeaponVisuals(weapon)
end
```

---

## Java Research Needed

To fully understand the weapon model system, you'd want to research these Java classes:

### Classes to Investigate

| Java Class | Purpose | Key Methods |
|------------|---------|-------------|
| `zombie.inventory.types.HandWeapon` | Base weapon class | `setWeaponSprite()`, `getWeaponSprite()` |
| `zombie.inventory.InventoryItem` | Base item class | `setTexture()`, `getTexture()` |
| `zombie.scripting.objects.Item` | Script definitions | `DoParam()`, property getters |
| `zombie.core.textures.Texture` | Texture loading | Used by `getTexture()` |
| `zombie.iso.ModelManager` | 3D model management | Model loading/caching |

### Where to Find Java Source

PZ's Java classes can be decompiled from:
- `R:\Games\Steam\steamapps\common\ProjectZomboid\zombie\` (class files)
- Use a Java decompiler (JD-GUI, Fernflower, CFR) on `zombie.jar` or class files

### Specific Methods to Research

```java
// In HandWeapon.java (or parent class)
public void setWeaponSprite(String spriteName);
public String getWeaponSprite();
public String getOriginalWeaponSprite();

// In InventoryItem.java
public void setTexture(Texture texture);

// In ScriptItem.java (scripting.objects.Item)
public void DoParam(String paramString);
```

---

## What You DON'T Need to Research

You **don't need** deep Java research to change weapon models because:

1. **`setWeaponSprite()` is already exposed** - Works from Lua directly
2. **`setTexture()` is already exposed** - Works from Lua directly
3. **`ScriptManager` is already exposed** - Can modify script properties at runtime
4. **Model loading is automatic** - Just put models in the right folder with correct script definitions

The VFE mod proves this works without any Java modifications.

---

## Summary: For Grave Index Transmogrification

1. **Create 4 model variations** (Common, Rare, Epic, Legendary .fbx files)
2. **Create 4 texture/icon variations** (.png files)
3. **Register models in script file** (models_GraveIndex.txt)
4. **Use `setWeaponSprite()` on tier change** to swap the held model
5. **Use `setTexture()` on tier change** to swap the inventory icon
6. **Track tier in ModData** for persistence

No Java decompilation or custom API needed - PZ already exposes everything required. 