---
id: engine-analysis-core-systems-architecture
slug: core-systems-architecture
title: "Core Systems Architecture"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: advanced
tags:
  - advanced
  - architecture
  - engine
  - systems
  - overview
  - decompilation
excerpt: "Comprehensive overview of Project Zomboid's Java engine architecture based on decompilation analysis. Covers game core, Lua integration, character system, AI, world rendering, networking, and modding systems."
table_of_contents:
  - text: "What Is This Document?"
    link: "#what-is-this-document"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "How to Use This Reference"
    link: "#how-to-use-this-reference"
  - text: "Architecture Overview"
    link: "#architecture-overview"
  - text: "Game Engine Core"
    link: "#game-engine-core"
  - text: "Lua Integration System"
    link: "#lua-integration-system"
  - text: "Character System"
    link: "#character-system"
  - text: "AI System"
    link: "#ai-system"
  - text: "World System"
    link: "#world-system"
  - text: "Networking System"
    link: "#networking-system"
  - text: "UI System"
    link: "#ui-system"
  - text: "Modding System"
    link: "#modding-system"
  - text: "Inventory System"
    link: "#inventory-system"
  - text: "Codebase Statistics"
    link: "#codebase-statistics"
  - text: "Common Misconceptions"
    link: "#common-misconceptions"
  - text: "Modding Strategy Guide"
    link: "#modding-strategy-guide"
  - text: "Key Files for Deep Analysis"
    link: "#key-files-for-deep-analysis"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Lua Modding API Deep Dive"
    path: /pz/build-41/modding/engine-analysis/lua-modding-api
  - title: "Decompilation Setup"
    path: /pz/build-41/modding/engine-analysis/decompilation-setup
  - title: "IsoZombie Reference"
    path: /pz/build-41/modding/engine-analysis/isozombie-reference
last_updated: 2026-01-28
---

# Core Systems Architecture

> A map of Project Zomboid's internal engine - where things live, how they connect, and what you can modify.

---

## What Is This Document?

You're building a mod that affects zombies. You know Lua can change zombie attributes, but you want to understand *where* those attributes actually live in the engine. Or you're trying to optimize a recipe system and need to know which Java class handles recipes. Or you want to hook into the game loop but don't know where it starts.

When I first decompiled Project Zomboid to understand vehicle modding, I was overwhelmed. 500,000+ lines of Java code across 1,200+ files. I spent days just trying to find where vehicles were managed. If someone had given me a map - "vehicles are in `VehicleManager.java`, parts are in `VehiclePart.java`, physics is in `BaseVehicle.java`" - it would have saved me weeks.

This document is that map. It's based on analyzing PZ's decompiled Java source code and documents where major systems live, how they connect, and what's relevant for modding. You don't need to read it cover-to-cover - use it as a reference when you need to find something specific.

**You would use this when:**
- You're trying to find where a specific system lives in the code
- You want to understand how different parts of PZ connect to each other
- You're planning an ambitious mod and need to know what's possible
- You want to identify optimization opportunities
- You're stuck on a problem and need to understand the underlying architecture

---

## Prerequisites

This is advanced content. Before diving in, you should understand:
- [What is a Mod?](../fundamentals/what-is-a-mod) - Basic mod structure
- [Decompilation Setup](./decompilation-setup) - How to read PZ's source code
- Basic object-oriented programming concepts (classes, methods, inheritance)
- Lua modding basics - this document explains the Java engine that Lua mods interact with

> **Source:** Analysis of ~500,000+ lines of decompiled Java code across 1,200+ classes. This represents months of exploration and documentation.

---

## How to Use This Reference

This document is organized like a book's table of contents - each section covers one major system.

**If you're looking for something specific:**
- **Lua modding:** Jump to [Lua Integration System](#lua-integration-system)
- **Zombie behavior:** Jump to [Character System](#character-system) and [AI System](#ai-system)
- **World objects:** Jump to [World System](#world-system)
- **Multiplayer:** Jump to [Networking System](#networking-system)
- **Performance:** Jump to [Inventory System](#inventory-system) for optimization opportunities

**If you're exploring:**
- Start with [Architecture Overview](#architecture-overview) for the big picture
- Then dive into systems that interest you
- Use [Key Files for Deep Analysis](#key-files-for-deep-analysis) to prioritize what to read

**You don't need to memorize this.** Bookmark it and come back when you need to find something.

---

## Architecture Overview

Project Zomboid is built on a custom Java-based game engine with these major components:

```
Project Zomboid Engine
├── Core Systems
│   ├── GameWindow (main loop, rendering, input)
│   └── GameTime (time management, multiplayer sync)
│
├── Lua Integration <- THE MODDING HEART
│   └── LuaManager (8,893 lines - this is how mods work)
│
├── Character System
│   ├── IsoPlayer (7,585 lines - player management)
│   ├── IsoZombie (4,591 lines - zombie AI)
│   └── Body/Health/Skills systems
│
├── World System
│   ├── IsoWorld (world management)
│   ├── IsoGridSquare (8,814 lines - individual tiles)
│   └── Objects/Lighting/Weather
│
├── AI System
│   ├── GameCharacterAIBrain (state machine core)
│   └── 50+ AI states (attacking, pathfinding, idle, etc.)
│
├── Networking
│   ├── GameClient (client-side networking)
│   └── GameServer (server-side, UDP protocol)
│
├── UI System
│   └── UIManager (HUD, menus, text rendering)
│
├── Modding System
│   ├── ActiveMods (mod tracking)
│   └── ScriptManager (item/recipe scripts)
│
└── Inventory System
    ├── InventoryItem (base item class)
    └── RecipeManager (recipe validation)
```

**Key insight:** Lua mods don't directly touch most of this - they interact through `LuaManager`, which exposes specific parts of these systems. Understanding this architecture helps you know what's possible and where to look when things go wrong.

---

## Game Engine Core

### GameWindow.java (~1,218 lines)

**What it is:** The main game window and primary game loop.

**Key Technologies:**
- **LWJGL + OpenGL** for rendering (LWJGL = Lightweight Java Game Library, a wrapper around OpenGL graphics)
- **FMOD** for audio integration
- **Input handling** for keyboard, mouse, and controllers

**Key Responsibilities:**
- Main game loop that runs 60 times per second
- Frame rendering coordination
- Input processing and event distribution
- Audio system integration
- Performance profiling hooks

**When you'd interact with this:** Custom rendering mods, input system modifications, performance profiling.

**Modding relevance:** Critical for understanding frame timing, render order, and input events. Most mods don't touch this directly, but understanding it helps debug performance issues.

---

### GameTime.java (~1,289 lines)

**What it is:** Game time management and multiplayer synchronization.

**Key Features:**
- Real-time to game-time conversion
- Multiplayer time synchronization (`serverTimeShift` keeps everyone on the same clock)
- Calendar system integration (days, months, years)
- Performance timing controls

**Time conversion constant:**
```java
public static final float MULTIPLIER = 0.8F;  // Real seconds to game seconds
```

This means game time passes at 0.8x real time by default.

**When you'd interact with this:** Time-based mods (timed actions, day/night cycle modifications, crop growth, food spoilage).

**Modding relevance:** Critical for understanding when timed events fire and how multiplayer time sync works.

---

## Lua Integration System

### LuaManager.java (~8,893 lines)

> **This is the heart of modding.** All Lua mods flow through this file. Understanding this is crucial for advanced modding.

**What it is:** Complete Lua scripting integration - the bridge between Java engine and Lua mods.

**Architecture:**
- **Kahlua Lua VM** integration (Kahlua is a Java implementation of Lua - it lets Java run Lua code)
- **Reflection-based** Java-Lua bridging (Reflection = Java feature that lets code inspect and call methods dynamically at runtime)
- **Event system** for hooks and callbacks
- **Mod loading** and management

**Key Components:**
```java
public static KahluaConverterManager converterManager  // Converts between Java and Lua types
public static J2SEPlatform platform                    // Java platform adapter
public static KahluaTable env                          // Global Lua environment (where global variables live)
public static KahluaThread thread                      // Main Lua execution thread
public static LuaCaller caller                         // Calls Lua functions from Java
public static LuaManager.Exposer exposer               // Exposes Java methods to Lua
```

**Key Methods:**

| Method | Purpose | Example |
|--------|---------|---------|
| `RunLua(String)` | Execute Lua code from Java | `RunLua("print('Hello')")` |
| `LoadDir(String)` | Load mod directory | `LoadDir("media/lua/client")` |
| `call(String, Object)` | Call Lua from Java | `call("OnPlayerUpdate", player)` |
| `reloadLuaFile(String)` | Hot-reload Lua file | For development |

**How mods work:**
1. PZ loads your mod folder
2. `LoadDir()` reads all `.lua` files
3. `RunLua()` executes your code
4. Your code registers event handlers (like `Events.OnPlayerUpdate.Add(...)`)
5. When events happen in Java, `call()` invokes your Lua functions

**When you'd interact with this:** Understanding how events work, debugging why Lua code isn't being called, creating custom event systems.

**Modding relevance:** Essential - this is literally how all Lua mods work. Every `Events.OnX` you use is defined and triggered through this system.

---

## Character System

### Class Hierarchy

```
IsoGameCharacter (Base class for all characters)
├── IsoPlayer (~7,585 lines)
│   └── Player character management
├── IsoZombie (~4,591 lines)
│   └── Zombie AI and behavior
├── IsoSurvivor
│   └── NPC characters
└── IsoLivingCharacter
    └── Base for all living entities
```

---

### IsoPlayer.java (~7,585 lines)

**What it is:** Player character management - everything about the player.

**Key Systems:**
- Inventory and equipment management
- Skills and traits system
- Multiplayer synchronization
- Action system integration (when you craft, eat, etc.)

**When you'd interact with this:** Character customization mods, skill system modifications, inventory management, equipment handling.

**Modding relevance:** High - most player-affecting mods interact with `IsoPlayer` either directly through Lua or indirectly through exposed methods.

---

### IsoZombie.java (~4,591 lines)

**What it is:** Zombie AI and behavior - everything about zombies.

**Public Fields You Can Modify:**
```java
public int speedType = -1;     // 1=Fast, 2=Normal, 3=Slow
public int cognition = -1;     // 1=Smart, 2=Normal, 3=Dumb
public int hearing = -1;       // 1=Pinpoint, 2=Normal, 3=Poor
public int strength = -1;      // 1=Strong, 2=Normal, 3=Weak
public int memory = -1;        // How long they remember things
public int sight = -1;         // 1=Eagle, 2=Normal, 3=Poor
public boolean bCrawling;      // Is crawling (legs broken)
public boolean bLunger;        // Can do lunge attack
public float speedMod;         // Speed multiplier
```

**When you'd interact with this:** Zombie behavior mods, difficulty modifications, custom zombie types.

**Modding relevance:** High - these fields can be modified directly from Lua (see [Zombie Attribute Optimization](./zombie-attribute-optimization)).

---

### Related Systems

| Directory/System | Purpose |
|-----------------|----------|
| `BodyDamage/` | Health system, injuries, body parts, bleeding, fractures |
| `Moodles/` | Character mood system (hungry, tired, anxious, etc.) |
| `skills/` | Skill progression and XP system |
| `traits/` | Character traits and perks |
| `professions/` | Starting professions and bonuses |

---

## AI System

### GameCharacterAIBrain.java (~222 lines)

**What it is:** Central AI "brain" for all characters - both zombies and players.

**Architecture:** State machine based

> **What's a state machine?** A way of organizing AI behavior into discrete "states" like Idle, Attacking, Walking, Eating. The character can only be in one state at a time. Each state defines what the character does and when to switch to a different state. It's how zombies know to stop wandering and start chasing you.

**Key Responsibilities:**
- State machine management (switching between states)
- Pathfinding coordination
- Behavior decision making
- State transitions based on conditions

---

### State Machine System

```
State.java (~100 lines)
├── Base class all states inherit from
├── enter() - called when entering state
├── update() - called every frame
└── exit() - called when leaving state

StateMachine.java (~150 lines)
└── Manages state transitions and state stack

states/ (50+ individual state classes)
├── AttackState
├── PathFindState
├── IdleState
├── ZombieIdleState
├── ZombieEatBodyState
├── PlayerActionsState
└── [47+ more states]
```

**Key States You'll See:**

| State | What It Does |
|-------|-------------|
| `AttackState` | Character is attacking target |
| `PathFindState` | Character is navigating to location |
| `IdleState` | Generic idle behavior |
| `ZombieIdleState` | Zombie-specific wandering |
| `ZombieEatBodyState` | Zombie feeding on corpse |
| `PlayerActionsState` | Player performing timed action |
| `WalkTowardState` | Simple movement to point |
| `ThumpState` | Zombie attacking door/window |

**When you'd interact with this:** Understanding why zombies behave certain ways, debugging AI issues, predicting behavior changes from attribute modifications.

**Modding relevance:** Medium - you can't add custom states (Java only), but understanding states helps you modify zombie attributes effectively to change behavior.

---

### Pathfinding System

**AStarPathFinder.java (~800 lines)**

**What it is:** A* pathfinding algorithm implementation (A* is an industry-standard pathfinding algorithm that finds optimal routes around obstacles).

**How it works:**
1. Zombie needs to reach target
2. A* evaluates possible paths, scoring each by distance + obstacles
3. Best path selected
4. Zombie follows path nodes
5. If blocked, recalculate

**Related Systems:**
- **Map knowledge system** - Zombies remember blocked paths they've tried
- **Blocked edges memory** - Won't repeatedly try paths they know are blocked
- **Navigation mesh** - Grid-based navigation

**When you'd interact with this:** Custom AI behaviors, understanding why zombies take certain routes, optimization work.

**Modding relevance:** Low direct access, but understanding it helps you predict zombie navigation and create obstacles effectively.

---

## World System

### IsoWorld.java (~2,646 lines)

**What it is:** World management and loading - the top-level container for everything.

**Key Features:**
- Cell and chunk system (cells are large areas, chunks are subdivisions)
- Object placement and management
- Lighting and rendering coordination
- Weather system integration

---

### IsoGridSquare.java (~8,814 lines)

**What it is:** Individual world grid squares - each tile you see is one GridSquare.

> **Note:** This is one of the largest classes in PZ - 8,814 lines because each square tracks everything: objects, zombies, players, items, lighting, etc.

**Key Features:**
- Object storage (furniture, windows, doors)
- Collision detection
- Rendering and visibility
- Pathfinding information

---

### World Architecture

```
IsoWorld (the whole game world)
├── Cells (large map areas, like neighborhoods)
│   └── Chunks (medium areas, loaded/unloaded for performance)
│       └── GridSquares (individual tiles - 1 tile = 1 square)
│           └── IsoObjects (furniture, items, doors, windows, etc.)
```

**Why this structure?** Performance. PZ doesn't load the entire world at once - it loads cells near players, then chunks within those cells, then individual squares within those chunks. This lets the game handle massive maps.

**Key Systems:**
- **Cell/Chunk loading** - Only loads what's nearby for performance
- **Object management** - Doors, windows, furniture, items
- **Lighting system** - Dynamic shadows and light sources
- **Weather system** - Rain, fog, snow effects
- **Particle effects** - Blood splatter, smoke, etc.

**When you'd interact with this:** World generation mods, custom objects, environmental systems, building mods.

**Modding relevance:** High for world/building mods. Most object placement goes through these systems.

---

## Networking System

### Architecture

```
GameClient.java (~500+ lines)
└── Client-side networking, connects to server

GameServer.java (~800+ lines)
└── Server-side networking, manages clients
```

**Protocol:** UDP-based for real-time performance (UDP = User Datagram Protocol, fast but doesn't guarantee delivery - used for real-time games)

---

### Packet System

```
PacketTypes.java
└── Defines all packet type IDs

packets/
├── PlayerPacket (player state sync)
├── InventoryPacket (item management)
├── WorldPacket (world changes)
└── [100+ packet types]

hit/
└── Combat and damage packets

vehicle/
└── Vehicle physics synchronization
```

**Key Features:**
- Chunk synchronization for world loading
- Character state synchronization (position, health, inventory)
- Inventory and item management
- Combat and damage networking
- Vehicle physics synchronization

**When you'd interact with this:** Multiplayer-compatible mods, custom network packets, client-server synchronization.

**Modding relevance:** Medium - most mods work automatically in multiplayer, but custom network data requires understanding this system.

---

## UI System

### UIManager.java

**What it is:** Central UI management for all HUD and menu elements.

**Key Components:**

| Component | Purpose |
|-----------|---------|
| `ActionProgressBar` | Shows progress for timed actions (crafting, eating) |
| `MoodlesUI` | Displays character moods (hungry, tired, etc.) |
| `RadialMenu` | Context menu when right-clicking |
| `TextManager` | Text rendering and fonts |
| `UIFont` | Font loading and management |

**When you'd interact with this:** Custom UI elements, HUD modifications, menu systems.

**Modding relevance:** Medium-High for UI mods. Most UI mods use Lua wrappers around these Java classes.

---

## Modding System

### ActiveMods.java (~192 lines)

**What it is:** Tracks which mods are active and their load order.

**Key Features:**
- Mod ID management (each mod has unique ID)
- Loading order control (mods load in specific sequence)
- Mod state tracking (enabled/disabled)

---

### ScriptManager.java

**What it is:** Parses and loads script files (`.txt` files for items, recipes, vehicles).

**Handles:**
- `.txt` script files
- Module and item definitions
- Recipe parsing
- Vehicle script loading

**When you'd interact with this:** Understanding how script files are loaded, debugging script parsing errors.

**Modding relevance:** High for item/recipe modders. Errors in `.txt` files are caught here.

---

## Inventory System

### Key Classes

| Class | Purpose |
|-------|---------|
| `InventoryItem.java` | Base class for all items |
| `InventoryItemFactory.java` | Creates items from scripts |
| `ItemContainer.java` | Container management (bags, fridges, etc.) |
| `RecipeManager.java` | Recipe validation and crafting |

---

### RecipeManager.java (~500 lines)

**Performance Discovery:** This class has a significant bottleneck.

**The Problem:**
```java
// Runs on EVERY right-click
public static ArrayList getUniqueRecipeItems(InventoryItem item) {
    ArrayList recipeList = new ArrayList();

    // Loops through ALL 1000+ recipes in the game
    for (int i = 0; i < allRecipes.size(); i++) {
        Recipe recipe = (Recipe)allRecipes.get(i);

        // Checks if recipe is valid for this item
        if (IsRecipeValid(recipe, player, item, container)) {
            recipeList.add(recipe);
        }
    }

    return recipeList;
}
```

**What this means:** Every time you right-click an item, PZ checks that item against all 1000+ recipes. This is expensive.

**Potential Optimization:** Pre-index recipes by ingredient. Could achieve 100-500x improvement by only checking relevant recipes instead of all recipes.

**When you'd interact with this:** Recipe system modifications, performance optimization work.

**Modding relevance:** High for understanding recipe system performance and potential optimization opportunities.

---

## Codebase Statistics

Understanding the scale helps you appreciate the complexity:

| Metric | Value |
|--------|-------|
| **Total Java Files** | ~1,200+ classes |
| **Total Lines of Code** | ~500,000+ lines |
| **Largest Single File** | `IsoGridSquare.java` (8,814 lines) |
| **Modding Heart** | `LuaManager.java` (8,893 lines) |
| **Player Management** | `IsoPlayer.java` (7,585 lines) |
| **Zombie Management** | `IsoZombie.java` (4,591 lines) |
| **Pathfinding** | `AStarPathFinder.java` (~800 lines) |
| **World Management** | `IsoWorld.java` (2,646 lines) |

**What this tells us:** PZ is a massive, mature codebase. The largest files are often the most critical systems. `LuaManager` being the biggest non-gameplay class shows how seriously PZ takes modding.

---

## Common Misconceptions

### Misconception 1: "Lua mods can access anything in the engine"

**Reality:** Lua mods can only access what `LuaManager` exposes through `@LuaMethod` annotations. Most engine internals aren't accessible.

**Example:**
- Can access: `IsoZombie.speedType` (exposed)
- Can't access: Internal pathfinding cache (not exposed)

**Why this matters:** Understanding what's exposed helps you know what's possible without diving into Java reflection.

---

### Misconception 2: "All systems run every frame"

**Reality:** PZ heavily optimizes by running different systems at different frequencies:
- Player input: Every frame (60 Hz)
- Zombie AI (nearby): Every frame
- Zombie AI (distant): Every 5-10 frames
- World chunks: Load/unload based on player position

**Why this matters:** Performance mods need to match this pattern - don't process all zombies every frame.

---

### Misconception 3: "Multiplayer is just single-player with syncing"

**Reality:** Multiplayer has significantly different code paths:
- Server is authoritative (makes final decisions)
- Client predictions (smooth movement before server confirms)
- Packet-based synchronization (not shared memory)

**Why this matters:** Mods that work in single-player may break in multiplayer if they don't handle client-server differences.

---

### Misconception 4: "Bigger files = more important"

**Reality:** Sometimes big files are just doing one complex thing. `IsoGridSquare` is huge because squares track everything, but `GameCharacterAIBrain` (222 lines) is arguably more important for behavior.

**Why this matters:** Don't prioritize reading big files first - read files relevant to your modding goal.

---

## Modding Strategy Guide

Based on this architecture, here's a recommended progression for ambitious modding:

### Phase 1: Lua API Mastery (Weeks 1-2)

**Goal:** Understand what's exposed to Lua

**Tasks:**
1. Map the complete Lua API surface (search for `@LuaMethod` in decompiled code)
2. Document all events (`Events.OnX`)
3. Create modding templates for common patterns
4. Test API boundaries (what works, what doesn't)

**Why first:** You need to know what tools you have before building anything complex.

---

### Phase 2: Character System (Weeks 3-4)

**Goal:** Master player and zombie modifications

**Tasks:**
1. Custom character traits and skills
2. AI behavior modifications through attributes
3. Character progression systems
4. Body damage and health modifications

**Why second:** Most mods affect characters, so understanding this system is high-value.

---

### Phase 3: World and Environment (Weeks 5-6)

**Goal:** Understand world generation and objects

**Tasks:**
1. Custom objects and furniture
2. World generation modifications
3. Environmental systems (weather, lighting)
4. Building and construction systems

**Why third:** World mods require understanding character system interactions.

---

### Phase 4: Advanced Features (Weeks 7-8)

**Goal:** Polish and optimization

**Tasks:**
1. UI customization
2. Networking extensions for multiplayer compatibility
3. Performance optimizations
4. Community tools and documentation

**Why last:** These require knowledge from all previous phases.

---

## Key Files for Deep Analysis

If you're going to read decompiled code, prioritize these files:

### Critical (Must Study)

| File | Lines | Why It Matters |
|------|-------|---------------|
| `LuaManager.java` | 8,893 | Heart of modding - all Lua functionality |
| `GameWindow.java` | 1,218 | Core game loop - understand timing |
| `GameTime.java` | 1,289 | Time management - crucial for timed events |
| `IsoPlayer.java` | 7,585 | Player system - most mods affect players |
| `IsoZombie.java` | 4,591 | Zombie AI - understand zombie behavior |

### Important (Should Study)

| File | Lines | Why It Matters |
|------|-------|---------------|
| `IsoWorld.java` | 2,646 | World management - object placement |
| `IsoGridSquare.java` | 8,814 | Grid square details - world interaction |
| `GameCharacterAIBrain.java` | 222 | AI system core - behavior control |
| `ActiveMods.java` | 192 | Mod management - understand load order |
| `RecipeManager.java` | ~500 | Recipe system - optimization opportunities |

---

## Key Takeaways

1. **LuaManager is the modding heart** - All Lua mod functionality flows through this 8,893-line file
2. **Character system is highly modular** - Designed for customization with clear class hierarchy
3. **World system is performance-optimized** - Cell/chunk loading allows massive maps
4. **Networking is robust** - UDP-based with comprehensive state synchronization
5. **UI system is component-based** - Custom elements are possible through the system
6. **Recipe system has optimization opportunities** - Current implementation checks all recipes on every right-click
7. **State machine controls all AI** - Understanding states helps predict and modify behavior
8. **Lua mods are limited by exposed methods** - Only `@LuaMethod` annotated functions are accessible
9. **Performance comes from selective updates** - Not everything updates every frame
10. **Architecture is mature and stable** - 500k+ lines represent years of development

---

## What's Next?

Now that you understand the architecture:

- [Lua Modding API Deep Dive](./lua-modding-api) - Detailed exploration of what Lua can access
- [Decompilation Setup](./decompilation-setup) - Set up tools to read the source code yourself
- [IsoZombie Reference](./isozombie-reference) - Deep dive into zombie properties and methods

---

**Remember:** This document is a reference, not a tutorial. You don't need to memorize it - bookmark it and return when you need to find where something lives in the codebase.
