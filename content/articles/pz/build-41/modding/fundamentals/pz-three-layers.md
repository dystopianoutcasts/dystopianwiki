---
id: fundamentals-pz-three-layers
slug: pz-three-layers
title: "PZ's Three Layers"
game: pz
version: build-41
section: modding
category: fundamentals
subcategory: null
difficulty: beginner
tags:
  - beginner
  - architecture
  - java
  - lua
  - scripts
  - data
  - layers
  - engine
excerpt: "Project Zomboid's architecture consists of three distinct layers: Java (engine), Lua (behavior), and Data (content). Understanding this separation is crucial for knowing what you can modify and how."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "The Three Layers"
    link: "#the-three-layers"
  - text: "Layer 1: Java (The Engine)"
    link: "#layer-1-java-the-engine"
  - text: "What It Does"
    link: "#what-it-does"
  - text: "Can Modders Change It?"
    link: "#can-modders-change-it"
  - text: "What We Can Infer"
    link: "#what-we-can-infer"
  - text: "Layer 2: Lua (Game Logic)"
    link: "#layer-2-lua-game-logic"
  - text: "The Three Lua Folders"
    link: "#the-three-lua-folders"
  - text: "Client vs Server: The Rule"
    link: "#client-vs-server-the-rule"
  - text: "Layer 3: Data (Content Definitions)"
    link: "#layer-3-data-content-definitions"
  - text: "How Scripts Connect to Lua"
    link: "#how-scripts-connect-to-lua"
  - text: "What Can You Change at Each Layer?"
    link: "#what-can-you-change-at-each-layer"
  - text: "Practical Examples"
    link: "#practical-examples"
  - text: "Key Patterns for Beginners"
    link: "#key-patterns-for-beginners"
  - text: "The Flow of a Recipe"
    link: "#the-flow-of-a-recipe"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "The Media Folder"
    path: /build-41/modding/fundamentals/media-folder
  - title: "File Types Explained"
    path: /build-41/modding/fundamentals/file-types-explained
last_updated: 2026-01-09
---

# PZ's Three Layers

## Overview

Project Zomboid's architecture consists of three distinct layers, each with different capabilities and access levels for modders. Understanding this separation is crucial for knowing what you can change and how.

## The Three Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      JAVA LAYER                             │
│            (Game Engine - Cannot Modify)                    │
│   Rendering, Physics, Networking, Save/Load, Core Systems   │
└─────────────────────────────────────────────────────────────┘
                              ↑
                     Lua calls into Java
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       LUA LAYER                             │
│              (Game Logic - Can Modify)                      │
│   UI, Events, Timed Actions, Recipe Callbacks, Behaviors    │
└─────────────────────────────────────────────────────────────┘
                              ↑
                  Lua reads script definitions
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│             (Content Definitions - Can Modify)              │
│    Items, Recipes, Sounds, Moveables, Farming, Camping      │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Java (The Engine)

### What It Does

The Java layer is the game engine itself:
- Rendering graphics and 3D models
- Physics and collision detection
- Networking for multiplayer
- Save/load game state
- Input handling (keyboard, mouse, controller)
- Memory management and optimization

### Can Modders Change It?

**No.** The Java source code is not available for modification.

### What We Can Infer

While we can't edit Java, we can see how Lua interacts with it:

```lua
-- These functions call into the Java engine
local playerObj = getSpecificPlayer(player)  -- Java returns a player object
local inv = playerObj:getInventory()         -- Java-side inventory
local cell = getCell()                       -- Java world cell
local world = getWorld()                     -- Java world object
```

The `:` method calls (like `:getInventory()`) are calling Java methods through Lua bindings. Common patterns include:

```lua
-- Player manipulation
player:getInventory()
player:getXp():AddXP(Perks.Woodwork, 3)
player:getPerkLevel(Perks.Carpentry)

-- World access
getCell()
getWorld()
getCore()

-- UI and text
getText("UI_SomethingKey")
```

**Key Insight:** Many "objects" you manipulate in Lua are actually wrappers around Java game objects.

## Layer 2: Lua (Game Logic)

### What It Does

The Lua layer implements game behavior:
- Recipe callbacks (OnCreate, OnGiveXP, OnTest)
- UI creation and interaction
- Context menu building
- Timed actions (crafting animations)
- Event handling (game start, player death, etc.)
- Client/server communication in multiplayer

### Can Modders Change It?

**Yes!** This is where behavioral modding happens.

### The Three Lua Folders

```
media/lua/
├── client/    <- UI, menus, input, local-only logic
├── server/    <- Authority logic, world changes, recipes
└── shared/    <- Code used by both client and server
```

#### Client Lua (`lua/client/`)

Runs only on each player's computer:
- UI panels and windows (ISUI)
- Context menus (right-click actions)
- Tooltips and hover effects
- Local player input handling
- Visual effects and animations

**Example from vanilla:**
```lua
-- Building a context menu
ISWorldObjectContextMenu.onRightClickOnFood = function(player, context, worldobjects)
    local playerObj = getSpecificPlayer(player)
    local playerInv = playerObj:getInventory()
    -- Add menu options...
end
```

#### Server Lua (`lua/server/`)

Runs with authority over the game world:
- Recipe code (the actual crafting logic)
- World state changes
- Spawning items and zombies
- Multiplayer synchronization

**Example from vanilla `recipecode.lua`:**
```lua
function Recipe.OnGiveXP.SawLogs(recipe, ingredients, result, player)
    if player:getPerkLevel(Perks.Woodwork) <= 3 then
        player:getXp():AddXP(Perks.Woodwork, 3)
    else
        player:getXp():AddXP(Perks.Woodwork, 1)
    end
end

function Recipe.OnCreate.SpikedBat(items, result, player)
    for i=1,items:size() do
        local item = items:get(i-1)
        if item:getType() == "BaseballBat" then
            result:setCondition(item:getCondition())
            break
        end
    end
end
```

#### Shared Lua (`lua/shared/`)

Code that both client and server need:
- Utility functions
- Shared definitions
- Systems that must exist on both sides

### Client vs Server: The Rule

> **If it's visual/UI/input → client**  
> **If it changes world state → server (or synchronized)**

In single-player, this distinction matters less. In multiplayer, it's critical.

## Layer 3: Data (Content Definitions)

### What It Does

The data layer defines *what exists* in the game:
- Items (properties, types, weights, icons)
- Recipes (inputs, outputs, requirements)
- Sounds (audio banks and effects)
- Moveables (furniture placement rules)
- Farming (crop definitions)
- Evolved recipes (cooking systems)

### Can Modders Change It?

**Yes!** This is the easiest layer to modify.

### File Location

```
media/scripts/
├── items.txt           <- Main item definitions
├── items_weapons.txt   <- Weapon-specific items
├── items_food.txt      <- Food items
├── recipes.txt         <- Crafting recipes
├── uniquerecipes.txt   <- Special recipes
├── sounds_*.txt        <- Sound definitions
├── farming.txt         <- Crop definitions
└── ...more definition files
```

### How Scripts Connect to Lua

Script files can reference Lua functions through callbacks:

**Script (data):**
```
recipe Saw Logs {
    Log,
    keep [Recipe.GetItemTypes.Saw],
    
    Result:Plank=3,
    OnGiveXP:Recipe.OnGiveXP.SawLogs,    <- Calls Lua function
    OnCreate:Recipe.OnCreate.SawLogs,    <- Calls Lua function
}
```

**Lua (behavior):**
```lua
-- This function name must EXACTLY match the script reference
function Recipe.OnGiveXP.SawLogs(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Woodwork, 3)
end
```

The script says "call this function." The Lua implements what the function does.

## What Can You Change at Each Layer?

| Layer | Can Modify? | What You Can Add/Change |
|-------|-------------|-------------------------|
| **Java** | No | Nothing directly |
| **Lua** | Yes | UI, events, callbacks, behaviors, systems |
| **Data** | Yes | Items, recipes, sounds, balance, properties |

## Practical Examples

### Adding a New Item (Data Only)

```
module Base {
    item MyNewItem {
        DisplayName = My New Item,
        Type = Normal,
        Weight = 1.0,
        Icon = MyItemIcon,
    }
}
```

No Lua needed. The Java engine knows how to handle Normal items.

### Adding a Recipe That Awards XP (Data + Existing Lua)

```
module Base {
    recipe Craft Something {
        Material1,
        Material2,
        keep Hammer,
        
        Result:MyNewItem,
        Time:100.0,
        OnGiveXP:Give10CarpentryXP,    <- Uses existing function
    }
}
```

You're connecting to Lua that already exists in vanilla.

### Adding Custom XP Logic (Data + Custom Lua)

**Script:**
```
recipe Advanced Craft {
    RareMaterial,
    keep SpecialTool,
    
    Result:AdvancedItem,
    OnGiveXP:MyMod.GiveCustomXP,
}
```

**Lua (in your mod's lua/server/ folder):**
```lua
MyMod = MyMod or {}

function MyMod.GiveCustomXP(recipe, ingredients, result, player)
    local skill = player:getPerkLevel(Perks.MetalWelding)
    if skill < 5 then
        player:getXp():AddXP(Perks.MetalWelding, 10)
    else
        player:getXp():AddXP(Perks.MetalWelding, 5)
    end
end
```

## Key Patterns for Beginners

### 1. Start with Data

Most mods don't need custom Lua. Items and recipes cover a lot.

### 2. Use Existing Callbacks

Vanilla has many OnGiveXP and OnCreate functions you can reference:
- `Recipe.OnGiveXP.SawLogs`
- `Recipe.OnCreate.SpikedBat`
- `Give10CarpentryXP`, `Give25MWXP`

### 3. Add Lua Only When Needed

If vanilla callbacks don't do what you need, then write custom Lua.

### 4. Respect the Client/Server Split

In multiplayer:
- UI code goes in `lua/client/`
- World-changing code goes in `lua/server/`

## The Flow of a Recipe

```
1. Player clicks "Craft" (UI/Client Lua)
          ↓
2. Game checks recipe requirements (Data Layer + Java)
          ↓
3. OnTest callback runs if defined (Server Lua)
          ↓
4. OnCanPerform callback runs if defined (Server Lua)
          ↓
5. Timed action plays (Java + Client Lua)
          ↓
6. OnCreate callback runs (Server Lua)
          ↓
7. OnGiveXP callback runs (Server Lua)
          ↓
8. Item appears in inventory (Java)
```

Each step involves different layers working together.

## Key Takeaways

1. **Java is the engine** - you can't modify it, but Lua talks to it
2. **Lua is behavior** - UI, events, callbacks, game logic
3. **Data is content** - items, recipes, sounds, definitions
4. **Scripts define what, Lua defines how**
5. **Client Lua = visuals, Server Lua = authority**
6. **Start with Data**, add Lua only when needed
