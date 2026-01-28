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
  - text: "What Are the Three Layers?"
    link: "#what-are-the-three-layers"
  - text: "The Simplest Examples"
    link: "#the-simplest-examples"
  - text: "Layer 3: Data (Start Here)"
    link: "#layer-3-data-start-here"
  - text: "Layer 2: Lua (Add Behavior)"
    link: "#layer-2-lua-add-behavior"
  - text: "Layer 1: Java (The Foundation)"
    link: "#layer-1-java-the-foundation"
  - text: "Building Up: Version 1, 2, 3"
    link: "#building-up-version-1-2-3"
  - text: "How the Layers Work Together"
    link: "#how-the-layers-work-together"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "The Media Folder"
    path: /build-41/modding/fundamentals/media-folder
  - title: "File Types Explained"
    path: /build-41/modding/fundamentals/file-types-explained
last_updated: 2026-01-28
---

# PZ's Three Layers

## What Are the Three Layers?

When you craft a wooden spear in Project Zomboid, three different systems work together to make it happen. You click the craft button (that's **Lua code** drawing a UI). The game checks if you have the ingredients (that's **data definitions** in a text file). The game creates the item in your inventory and shows it on screen (that's the **Java engine** doing the heavy lifting).

Project Zomboid is built like a layer cake. At the bottom is the Java engine (the foundation you can't change). In the middle is Lua code (the behavior you can modify). At the top is data files (the content that's easiest to change). When you mod PZ, you're working with the middle and top layers.

If the phrase "three layers" sounds intimidating, don't worry—it's simpler than it seems. You don't need to master all three layers to start modding. In fact, most mods only touch the top layer (data). Let me show you exactly what each layer does, starting with the easiest one.

---

## The Simplest Examples

Before we dive into architecture diagrams, let's see what "three layers" means in practice.

### Data Layer (Easiest)
**A text file that defines an item:**
```
module MyMod  // Creates a named group for your items
{
    item MyKnife  // Defines an item called MyKnife
    {
        DisplayName = My Custom Knife,  // Name players see
        Type = Weapon,  // Tells the game this is a weapon
        Weight = 0.5,  // How heavy it is
        MinDamage = 0.6,  // Minimum damage to zombies
        MaxDamage = 1.2,  // Maximum damage to zombies
    }
}
```

**No programming required.** You can create complete mods with just text files like this.

---

### Lua Layer (Medium Difficulty)
**Code that makes something happen when you craft an item:**
```lua
-- This function runs after the player crafts a wooden spear
-- (It gives them Carpentry XP)
function Recipe.OnGiveXP.MakeSpear(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Carpentry, 3)  -- Awards 3 Carpentry XP
end
```

**This is programming**, but it's straightforward: "When this happens, do this."

---

### Java Layer (Cannot Change)
**The engine that powers everything:**
```
[You can't see or edit this code]
- Draws graphics on your screen
- Handles mouse clicks and keyboard input
- Saves your game to disk
- Manages multiplayer networking
- Runs physics and collisions
```

**You can't modify Java**, but you don't need to. The Java engine provides everything you need through Lua.

> **Key Takeaway:** Data = what exists, Lua = how it behaves, Java = the engine that runs it all. You'll work with Data and Lua. Java just does its thing in the background.

---

## Layer 3: Data (Start Here)

This is where you should start. The **data layer** is the easiest to modify because it's just text files with structured content. No programming knowledge required.

### What Goes in the Data Layer

The `media/scripts/` folder holds text files that define:
- **Items** - weapons, food, clothing, tools, materials
- **Recipes** - crafting instructions (inputs, outputs, requirements)
- **Sounds** - audio effects and music
- **Moveables** - furniture you can pick up and place
- **Farming** - crops, seeds, grow times
- **Evolved recipes** - cooking and food combination systems

### File Location
```
YourMod/Contents/mods/YourModName/media/scripts/
├── items_yourmod.txt       // Your custom items
├── recipes_yourmod.txt     // Your custom recipes
└── sounds_yourmod.txt      // Your custom sounds
```

### Example: A Simple Item

Let's create a hammer with custom stats:

```
module MyMod  // Your mod's namespace
{
    item CustomHammer  // Item name (used internally)
    {
        DisplayName = Custom Hammer,  // Name players see
        Type = Weapon,  // Item type
        Icon = Hammer,  // Icon filename (Hammer.png)
        Weight = 1.5,  // Weight in inventory
        MinDamage = 0.8,  // Min damage to zombies
        MaxDamage = 1.2,  // Max damage to zombies
    }
}
```

**That's it.** Save this in `media/scripts/items_mymod.txt`, and the game will load your custom hammer. The Java engine knows how to handle weapons, so you don't need any Lua code.

### Example: A Simple Recipe

```
module MyMod
{
    recipe Make Custom Spear  // Recipe name
    {
        WoodPlank,  // Required ingredient 1
        SheetMetal,  // Required ingredient 2
        keep Hammer,  // Needed but not consumed

        Result:CustomSpear,  // What you get
        Time:100.0,  // Crafting time (in game ticks)
    }
}
```

This recipe takes a wood plank and sheet metal, requires a hammer (but doesn't consume it), and creates a CustomSpear after 100 game ticks.

> **Key Takeaway:** Most mods are data-only. If you just want to add items and recipes, you never need to touch Lua. The data layer is powerful enough for complete mods.

---

## Layer 2: Lua (Add Behavior)

When data isn't enough—when you want custom logic, UI modifications, or special behaviors—you use the **Lua layer**.

### What Goes in the Lua Layer

The `media/lua/` folder holds Lua code that defines:
- **Recipe callbacks** - code that runs when crafting (OnGiveXP, OnCreate, OnTest)
- **UI panels and windows** - custom menus, buttons, displays
- **Context menus** - right-click actions
- **Timed actions** - crafting animations and progress bars
- **Event handlers** - code that runs when something happens (game start, zombie death, etc.)

### The Three Lua Folders

```
media/lua/
├── client/    // Runs on player's screen (UI, graphics, input)
├── server/    // Runs with world authority (crafting logic, world changes)
└── shared/    // Runs on both (utility functions, shared data)
```

**Why the split?** Even in singleplayer, PZ runs a "server" (tracks the world state) and a "client" (draws graphics). In multiplayer, they're on separate machines.

| Folder | Runs On | Use For | Example |
|--------|---------|---------|---------|
| `client/` | Player's screen | UI, menus, visual effects | Showing a custom window |
| `server/` | Game authority | Crafting logic, XP awards, item spawning | Giving XP when you craft something |
| `shared/` | Both | Helper functions | Utility functions both need |

### Example: Custom XP Logic

Let's say you want a recipe to give MORE XP if the player's skill is low (to help beginners level faster).

**Data (in `media/scripts/recipes_mymod.txt`):**
```
recipe Make Advanced Tool
{
    SteelBar,
    WoodPlank,
    keep Hammer,

    Result:AdvancedTool,
    Time:200.0,
    OnGiveXP:MyMod.GiveScaledXP,  // Calls our custom Lua function
}
```

**Lua (in `media/lua/server/MyModRecipes.lua`):**
```lua
-- Create a namespace for our mod (prevents conflicts with other mods)
MyMod = MyMod or {}

-- This function runs after the player crafts the item
function MyMod.GiveScaledXP(recipe, ingredients, result, player)
    -- Get the player's current MetalWelding skill level
    local skill = player:getPerkLevel(Perks.MetalWelding)

    -- If skill is low (5 or less), give 10 XP
    if skill <= 5 then
        player:getXp():AddXP(Perks.MetalWelding, 10)
    else
        -- If skill is high, give only 3 XP
        player:getXp():AddXP(Perks.MetalWelding, 3)
    end
end
```

**What this does:**
1. The data file says: "When this recipe finishes, call `MyMod.GiveScaledXP`"
2. The Lua file defines what that function does: checks the player's skill and awards XP accordingly

> **Key Takeaway:** Data files can *reference* Lua functions using callbacks like `OnGiveXP:FunctionName`. The Lua code defines what those functions actually do.

---

## Layer 1: Java (The Foundation)

The **Java layer** is the game engine itself. It handles everything the player never thinks about: rendering graphics, saving games, handling mouse clicks, running physics, managing multiplayer networking.

### What the Java Layer Does

- **Rendering** - draws zombies, items, the world on your screen
- **Physics** - makes objects fall, collide, push each other
- **Networking** - syncs multiplayer games across players
- **Save/Load** - writes your game state to disk and loads it back
- **Input** - detects keyboard, mouse, controller inputs
- **Performance** - optimizes memory, CPU usage, frame rate

### Can You Modify It?

**No.** The Java source code is proprietary and not available for modding.

### What You CAN Do

Even though you can't edit Java, **Lua can talk to Java**. When you write Lua code like this:

```lua
local player = getSpecificPlayer(0)  -- Gets the player object from Java
local inventory = player:getInventory()  -- Calls a Java method
inventory:AddItem("Base.Hammer")  -- Tells Java to spawn an item
```

...you're calling Java functions from Lua. The colon (`:`) in `:getInventory()` means "call a method that belongs to this object"—and that method is implemented in Java.

**Common Java methods you'll call from Lua:**
```lua
-- Player methods
player:getInventory()  -- Gets player's inventory
player:getXp():AddXP(Perks.Carpentry, 5)  -- Awards XP
player:getPerkLevel(Perks.Carpentry)  -- Gets skill level

-- World methods
getCell()  -- Gets the current game cell
getWorld()  -- Gets the world object
getCore()  -- Gets the core game engine

-- Item methods
item:getType()  -- Gets item type name
item:getCondition()  -- Gets item durability
item:setCondition(50)  -- Sets item durability
```

**Why does this matter?** Because when you see `:` in Lua code, you know it's talking to the Java engine. The Java layer provides the heavy lifting; Lua just tells it what to do.

> **Key Takeaway:** You can't modify Java, but you don't need to. Lua provides hundreds of functions that call into Java. When you write `player:getInventory()`, you're using Java power without writing Java code.

---

## Building Up: Version 1, 2, 3

Let's create the same mod three different ways, adding complexity each time. This shows how the layers work together.

### Version 1: Data Only

**Goal:** Add a custom knife to the game. No programming.

**File:** `media/scripts/items_mymod.txt`
```
module MyMod
{
    item SimpleKnife
    {
        DisplayName = Simple Knife,
        Type = Weapon,
        Weight = 0.4,
        MinDamage = 0.5,
        MaxDamage = 0.9,
    }
}
```

**What happens:** The game loads your item. Players can spawn it with debug mode. It works like any other weapon—the Java engine already knows how to handle weapons, so you don't need custom code.

**Layers used:** Data only.

---

### Version 2: Data + Existing Lua Callback

**Goal:** Add a recipe to craft the knife. Award Carpentry XP using vanilla's existing XP function.

**File:** `media/scripts/recipes_mymod.txt`
```
module MyMod
{
    recipe Make Simple Knife
    {
        SheetMetal,  // Required material
        keep Hammer,  // Tool (not consumed)

        Result:MyMod.SimpleKnife,  // Creates your custom knife
        Time:50.0,  // Crafting time
        OnGiveXP:Give10CarpentryXP,  // Uses vanilla's function
    }
}
```

**What happens:** The game sees `OnGiveXP:Give10CarpentryXP` and looks for that function in the Lua layer. Vanilla PZ already has this function defined (it awards 10 Carpentry XP), so you don't need to write any Lua yourself.

**Layers used:** Data + existing Lua.

---

### Version 3: Data + Custom Lua Callback

**Goal:** Add a recipe that awards XP based on the player's current skill level.

**File 1:** `media/scripts/recipes_mymod.txt`
```
module MyMod
{
    recipe Make Advanced Knife
    {
        SteelBar,  // Harder material
        Leather,  // For the handle
        keep Hammer,

        Result:MyMod.AdvancedKnife,
        Time:150.0,
        OnGiveXP:MyMod.GiveScaledKnifeXP,  // Calls OUR custom function
    }
}
```

**File 2:** `media/lua/server/MyModRecipes.lua`
```lua
-- Create a namespace for our mod
MyMod = MyMod or {}

-- Custom XP function that scales with player skill
function MyMod.GiveScaledKnifeXP(recipe, ingredients, result, player)
    -- Get player's MetalWelding skill
    local skill = player:getPerkLevel(Perks.MetalWelding)

    -- Award more XP if skill is low
    if skill <= 3 then
        player:getXp():AddXP(Perks.MetalWelding, 8)  // Beginner boost
    elseif skill <= 6 then
        player:getXp():AddXP(Perks.MetalWelding, 5)  // Moderate XP
    else
        player:getXp():AddXP(Perks.MetalWelding, 2)  // Expert gets less
    end
end
```

**What happens:** The data file says "call MyMod.GiveScaledKnifeXP when crafting." The Lua file defines that function. Now your recipe has custom XP logic that vanilla doesn't provide.

**Layers used:** Data + custom Lua.

> **Key Takeaway:** You start with data-only mods, use existing Lua when possible, and write custom Lua only when you need behavior that doesn't exist yet.

---

## How the Layers Work Together

Here's what happens when a player crafts a wooden spear:

```
1. Player clicks "Craft" button
   └─> Client Lua (UI code) detects the click

2. Game checks if player has ingredients
   └─> Java engine reads Data layer (recipe definition)

3. Game checks if recipe can be performed
   └─> Server Lua (OnTest callback) runs if defined

4. Crafting animation plays
   └─> Client Lua (TimedAction) shows progress bar
   └─> Java engine renders the animation

5. Recipe completes
   └─> Server Lua (OnCreate callback) runs if defined
   └─> Java engine creates the item in inventory

6. XP is awarded
   └─> Server Lua (OnGiveXP callback) runs
   └─> Java engine updates player's skill XP

7. Item appears in UI
   └─> Java engine tells Client Lua to update
   └─> Client Lua redraws inventory window
```

Every step involves at least two layers working together. The data layer defines *what* happens. Lua defines *how* it happens. Java makes it *actually happen*.

---

## Common Mistakes

### Mistake 1: Putting Lua Code in the Data Layer

❌ **Doesn't work:**
```
// In media/scripts/items.txt
item MyItem {
    DisplayName = Test,
    function onClick()  // <-- You can't write Lua here!
        print("clicked")
    end
}
```

**What you'll see:** Syntax error. The game expects data properties, not code.

✅ **Works:**

**File 1** (`media/scripts/items.txt`):
```
item MyItem {
    DisplayName = Test,
    Type = Normal,
}
```

**File 2** (`media/lua/client/MyItemMod.lua`):
```lua
-- Lua code goes in a separate .lua file
Events.OnGameStart.Add(function()
    print("MyItem mod loaded")
end)
```

**Why:** Data files and Lua files are separate. Data defines what exists. Lua defines behavior.

---

### Mistake 2: Calling a Lua Function That Doesn't Exist

❌ **Doesn't work:**
```
recipe Make Something {
    Material,
    Result:Item,
    OnGiveXP:MyMod.GiveXP,  // Function doesn't exist!
}
```

**What you'll see:** Silent failure. The recipe works, but no XP is awarded. No error message.

✅ **Works:**

**File 1** (recipe):
```
recipe Make Something {
    Material,
    Result:Item,
    OnGiveXP:MyMod.GiveXP,
}
```

**File 2** (`media/lua/server/MyMod.lua`):
```lua
MyMod = MyMod or {}

-- Define the function that the recipe references
function MyMod.GiveXP(recipe, ingredients, result, player)
    player:getXp():AddXP(Perks.Carpentry, 5)
end
```

**Why:** If you reference a function in the data layer, you MUST define that function in the Lua layer. The names must match exactly (including capitalization).

---

### Mistake 3: Putting World-Changing Code in Client Lua

❌ **Doesn't work (in multiplayer):**
```lua
// In media/lua/client/MyMod.lua
function givePlayerItem()
    local player = getSpecificPlayer(0)
    player:getInventory():AddItem("Base.Hammer")  // Won't sync in multiplayer!
end
```

**What you'll see:** In singleplayer, it might work. In multiplayer, other players won't see the item. Desync chaos.

✅ **Works:**
```lua
// In media/lua/server/MyMod.lua
function givePlayerItem(player)
    player:getInventory():AddItem("Base.Hammer")  // Server has authority
end
```

**Why:** World-changing code (spawning items, modifying player state, etc.) must run in `server/` Lua. The server has authority over the game world. Client Lua is only for visuals.

---

### Mistake 4: Trying to Modify Java

❌ **Cannot do:**
```
"How do I change the rendering engine?"
"How do I modify the save system?"
"Can I change how zombies pathfind?"
```

**What you'll see:** Impossible. Java source is not available.

✅ **What you CAN do:**
- Override Lua behavior (many systems are implemented in Lua, not Java)
- Use Lua hooks to add logic before/after Java systems
- Modify data to change balance/behavior indirectly

**Why:** Java is closed-source. But most gameplay is in Lua, so you have lots of control.

---

## Try It Yourself

Let's create a simple three-layer mod from scratch to see how everything connects.

### Step 1: Create the Mod Structure

Navigate to your Project Zomboid mods folder:
```
C:\Users\[YourName]\Zomboid\mods\
```

Create this structure:
```
ThreeLayerTest/
├── mod.info
└── Contents/
    └── mods/
        └── ThreeLayerTest/
            └── media/
                ├── scripts/
                │   ├── items_test.txt
                │   └── recipes_test.txt
                └── lua/
                    └── server/
                        └── TestRecipes.lua
```

---

### Step 2: Write mod.info

`mod.info`:
```
name=Three Layer Test
id=ThreeLayerTest
description=A test mod demonstrating PZ's three layers
```

---

### Step 3: Write the Data Layer (Item)

`media/scripts/items_test.txt`:
```
module ThreeLayerTest
{
    item TestHammer  // Define a custom hammer
    {
        DisplayName = Test Hammer,
        Type = Weapon,
        Weight = 1.2,
        MinDamage = 0.7,
        MaxDamage = 1.1,
    }
}
```

---

### Step 4: Write the Data Layer (Recipe)

`media/scripts/recipes_test.txt`:
```
module ThreeLayerTest
{
    recipe Make Test Hammer
    {
        WoodPlank=2,  // Needs 2 wood planks

        Result:ThreeLayerTest.TestHammer,  // Creates our custom hammer
        Time:100.0,
        OnGiveXP:ThreeLayerTest.GiveHammerXP,  // Calls our custom Lua function
    }
}
```

---

### Step 5: Write the Lua Layer

`media/lua/server/TestRecipes.lua`:
```lua
-- Create a namespace for our mod
ThreeLayerTest = ThreeLayerTest or {}

-- This function runs after crafting the Test Hammer
function ThreeLayerTest.GiveHammerXP(recipe, ingredients, result, player)
    -- Get player's Woodwork skill level
    local skill = player:getPerkLevel(Perks.Woodwork)

    -- Award more XP if skill is low
    if skill <= 3 then
        player:getXp():AddXP(Perks.Woodwork, 8)
        print("ThreeLayerTest: Gave 8 XP (beginner)")
    else
        player:getXp():AddXP(Perks.Woodwork, 3)
        print("ThreeLayerTest: Gave 3 XP (experienced)")
    end
end
```

---

### Step 6: Test It

1. Launch Project Zomboid
2. Go to Mods menu
3. Enable "Three Layer Test"
4. Restart the game
5. Start a new sandbox game
6. Open debug menu (default key: backslash `\`)
7. Spawn 2 Wood Planks
8. Open the crafting menu (B key)
9. Find "Make Test Hammer" recipe
10. Craft it
11. Check the console output—you should see the XP message

**Success!** You just created a mod using all three layers:
- **Data layer:** Defined the hammer and recipe
- **Lua layer:** Wrote custom XP logic
- **Java layer:** Handled the actual crafting, inventory, and XP systems

---

## Key Takeaways

1. **Three layers:** Java (engine), Lua (behavior), Data (content)

2. **What you can change:**
   - Java: NO (closed source)
   - Lua: YES (behaviors, UI, logic)
   - Data: YES (items, recipes, balance)

3. **Start with Data** - most mods don't need Lua at all

4. **Add Lua when needed** - use existing callbacks first, write custom functions only if necessary

5. **Data defines what, Lua defines how** - recipes say "call this function," Lua implements what the function does

6. **Client vs Server:**
   - Client = visuals, UI, input (player's screen)
   - Server = authority, world state, crafting logic

7. **Lua talks to Java** - when you see `:getInventory()` or `:AddItem()`, you're calling Java methods from Lua

---

**What's next?** Now that you understand the three-layer architecture, you're ready to dive into specific topics. Check out [The Media Folder](../media-folder) to understand file organization, or [Item Creation](../../items/item-creation) to start making custom items.
