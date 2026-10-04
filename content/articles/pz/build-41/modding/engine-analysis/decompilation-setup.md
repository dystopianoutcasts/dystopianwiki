---
id: engine-analysis-decompilation-setup
slug: decompilation-setup
title: "Decompilation Setup Guide"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - decompilation
  - java
  - engine
  - vineflower
  - cfr
  - analysis
  - advanced
excerpt: "Learn to decompile Project Zomboid's Java engine to discover undocumented APIs and optimization opportunities. This guide covers Vineflower, CFR, and Procyon setup with step-by-step instructions."
table_of_contents:
  - text: "What is Decompilation?"
    link: "#what-is-decompilation"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Legal Note"
    link: "#legal-note"
  - text: "Your First Decompilation (5 Minutes)"
    link: "#your-first-decompilation-5-minutes"
  - text: "Why Decompile?"
    link: "#why-decompile"
  - text: "Decompilation Tools"
    link: "#decompilation-tools"
  - text: "Finding PZ's Class Files"
    link: "#finding-pzs-class-files"
  - text: "Decompiling Everything (The Full Package)"
    link: "#decompiling-everything-the-full-package"
  - text: "What to Look For When Reading Java Code"
    link: "#what-to-look-for-when-reading-java-code"
  - text: "Real Discoveries From Decompilation"
    link: "#real-discoveries-from-decompilation"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself: Find and Use a Hidden Field"
    link: "#try-it-yourself-find-and-use-a-hidden-field"
  - text: "Documenting Your Findings"
    link: "#documenting-your-findings"
  - text: "Safety Guidelines"
    link: "#safety-guidelines"
  - text: "Troubleshooting"
    link: "#troubleshooting"
  - text: "Where to Go From Here"
    link: "#where-to-go-from-here"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Core Systems Architecture"
    path: /pz/build-41/modding/engine-analysis/core-systems-architecture
  - title: "IsoZombie Class Reference"
    path: /pz/build-41/modding/engine-analysis/isozombie-reference
  - title: "Zombie Attribute Optimization"
    path: /pz/build-41/modding/engine-analysis/zombie-attribute-optimization
last_updated: 2026-01-28
---

# Decompilation Setup Guide

Have you ever wondered if there's a `zombie.setSpeed()` method, but the wiki doesn't mention it? Or wished you could see exactly how zombies choose their targets? The answer is hiding in plain sight - right in your game files. Every time you launch Project Zomboid, thousands of Java class files sit there waiting to reveal their secrets.

I remember the first time I decompiled `IsoZombie.java`. I spent hours searching the wiki for how to change zombie attributes, finding only workarounds and half-answers. Then I opened the decompiled file and saw it: `public int speedType`, `public int cognition`, `public int hearing` - all sitting right there, publicly accessible. That single discovery changed how I approached modding forever.

Let me show you how to unlock this same power. You don't need to be a Java expert - if you can read Lua, you can read enough Java to find what you need.

## What is Decompilation?

When developers write code, they write it in human-readable form (like Java or Lua). That code gets compiled into machine-friendly format (`.class files`) that computers can run but humans can't easily read. **Decompilation** is the process of converting that machine code back into readable source code.

Think of it like this: The game ships with a recipe book written in code. Decompilation translates it back into English so you can read the recipes.

**You would use this when:**
- The wiki doesn't document what you need
- You want to know if a field or method exists before trying it
- You're debugging something that doesn't make sense
- You want to find performance optimization opportunities
- You're curious how a system actually works

## Prerequisites

Before starting:
- [What is a Mod?](/pz/build-41/modding/fundamentals/what-is-a-mod) - Basic mod structure
- Java installed (to run decompiler) - [Download Java](https://adoptium.net/)
- Familiarity with command line (basic commands)

## Legal Note

> Decompilation for modding research is acceptable. You may study the code, find APIs, and share techniques. Do NOT redistribute PZ's decompiled source or use it commercially.

## Your First Decompilation (5 Minutes)

Let's start with the simplest possible example: decompiling just one file. We'll decompile `IsoZombie.java` because it's full of useful discoveries.

### What You'll Need

1. **Java** - [Download here](https://adoptium.net/) if you don't have it
2. **Vineflower** - [Download the jar file](https://github.com/Vineflower/vineflower/releases)
3. **Project Zomboid installed** (obviously!)

### The Five-Minute Process

**Step 1:** Create a folder for your work
```bash
mkdir C:\PZ_Decompiled          # Create workspace folder
cd C:\PZ_Decompiled             # Move into it
```

**Step 2:** Download Vineflower (the decompiler tool)
- Go to the [releases page](https://github.com/Vineflower/vineflower/releases)
- Download `vineflower-X.X.X.jar` (get the latest version)
- Put it in `C:\PZ_Decompiled`

**Step 3:** Find your IsoZombie.class file

It's in your PZ installation. Right-click PZ in Steam → Manage → Browse Local Files.

Then navigate to: `zombie\characters\IsoZombie.class`

The full path is usually:
```
<your Steam library>\steamapps\common\ProjectZomboid\zombie\characters\IsoZombie.class
```

**Step 4:** Run the decompiler
```bash
java -jar vineflower.jar -d ./output "<your Steam library>\steamapps\common\ProjectZomboid\zombie\characters\IsoZombie.class"
```

Let's break down what this command does:
- `java -jar vineflower.jar` - Run the decompiler tool
- `-d ./output` - Put results in an "output" folder
- `"...\IsoZombie.class"` - The file to decompile (in quotes because of spaces in path)

**Step 5:** Look at your results

Open `C:\PZ_Decompiled\output\zombie\characters\IsoZombie.java` in any text editor.

Search for "public int" and you'll see:

```java
public int speedType = -1;        // Zombie speed (0=Sprinter, 1=Fast Shambler, 2=Shambler)
public int cognition = -1;        // How smart (0-3, higher = smarter)
public int hearing = -1;          // Hearing range
public int strength = -1;         // Damage multiplier
public int memory = -1;           // How long they remember seeing you
public int sight = -1;            // Vision range
public boolean bCrawling;         // Is this zombie crawling?
public boolean bLunger;           // Can this zombie lunge?
```

**That's it!** You just discovered undocumented fields you can modify from Lua:

```lua
-- Now you can do this in your mods:
local zombie = getSpecificPlayer(0):getZombieList():get(0)  -- Get a zombie
zombie.speedType = 0           -- Make it a sprinter
zombie.cognition = 3           -- Make it smart
zombie.bLunger = true          -- Make it a lunger
```

> **Key Takeaway:** You just found the zombie attribute fields that aren't documented anywhere in the official wiki. This is the power of decompilation - discovering what's possible by reading the source.

## Why Decompile?

The official PZ modding documentation is incomplete. Through decompilation, you can:

- **Discover undocumented APIs** - Find methods and fields not in the wiki
- **Understand internal behavior** - See exactly how systems work
- **Find optimization opportunities** - Identify expensive operations to avoid
- **Debug mod issues** - Understand why something isn't working
- **Future-proof your mods** - Know what might change between versions

## Decompilation Tools

There are three main decompilers for Java. I recommend Vineflower for most people, but all three work fine. Don't overthink this choice - pick one and start.

### Vineflower (Recommended)

Vineflower is a modern Java decompiler with excellent output quality. It's actively maintained and handles PZ's code very well.

**Download:** [github.com/Vineflower/vineflower/releases](https://github.com/Vineflower/vineflower/releases)

**Why I recommend it:**
- Active development (gets better over time)
- Excellent output quality (readable code)
- Handles modern Java features well
- Good at preserving variable names (easier to understand)

**Basic usage:**
```bash
java -jar vineflower.jar -d output_dir input_dir/
#    │                     │           └─ What to decompile
#    │                     └─ Where to put results
#    └─ Run the tool
```

### CFR (Class File Reader)

CFR is a mature decompiler with comprehensive feature support. Great alternative if Vineflower gives you trouble.

**Download:** [github.com/leibnitz27/cfr/releases](https://github.com/leibnitz27/cfr/releases)

**Why you might use it:**
- Very mature and stable (been around a long time)
- Comprehensive Java version support
- Good CLI interface
- Handles complex code patterns well

**Basic usage:**
```bash
java -jar cfr.jar --outputdir output_dir input_dir/
#                 └─ Note: CFR uses --outputdir (two dashes)
```

### Procyon

Procyon is reliable for straightforward decompilation tasks. Simple and effective.

**Download:** [github.com/mstrobel/procyon/releases](https://github.com/mstrobel/procyon/releases)

**Why you might use it:**
- Reliable output
- Good Java 8+ support
- Very simple to use

**Basic usage:**
```bash
java -jar procyon-decompiler.jar -o output_dir input_dir/
#                                 └─ Note: Procyon uses -o (one dash)
```

### Tool Comparison

| Tool | Output Quality | Speed | Best For |
|------|---------------|-------|----------|
| **Vineflower** | Excellent | Medium | General use, modern code |
| **CFR** | Very Good | Fast | Complex code, detailed analysis |
| **Procyon** | Good | Fast | Simple tasks |

## Finding PZ's Class Files

### Locating the Installation

PZ's Java class files are in the game's installation directory.

**Typical Steam path:**
```
<your Steam library>\steamapps\common\ProjectZomboid
```

Or right-click PZ in Steam -> Manage -> Browse Local Files.

### Key Directories

The `zombie/` folder contains the compiled Java classes:

```
ProjectZomboid/
└── zombie/
    ├── ai/                    # AI and pathfinding
    ├── characters/            # IsoPlayer, IsoZombie, etc.
    ├── core/                  # Core game systems
    ├── inventory/             # Items and containers
    ├── iso/                   # World and rendering
    ├── Lua/                   # Lua-Java bridge
    ├── modding/               # Mod system
    ├── network/               # Multiplayer
    ├── scripting/             # Script parsing
    └── ui/                    # UI components
```

### Priority Classes to Decompile

**Tier 1 - Critical for Modding:**

| Class | Lines | Purpose |
|-------|-------|----------|
| `LuaManager.java` | ~8,893 | Heart of modding - Lua-Java bridge |
| `IsoZombie.java` | ~4,591 | Zombie behavior and attributes |
| `IsoPlayer.java` | ~7,585 | Player character system |
| `RecipeManager.java` | ~500 | Recipe validation and lookup |

**Tier 2 - Important Systems:**

| Class | Lines | Purpose |
|-------|-------|----------|
| `GameWindow.java` | ~1,218 | Main game loop |
| `GameTime.java` | ~1,289 | Time management |
| `IsoWorld.java` | ~2,646 | World management |
| `IsoGridSquare.java` | ~8,814 | Grid squares and objects |
| `ItemContainer.java` | ~1,500 | Inventory containers |

> **Key Takeaway:** You don't need to decompile or read everything. Start with the Tier 1 files related to your modding goal. Making zombie mods? Start with IsoZombie.java. Making crafting mods? Start with RecipeManager.java. Let your specific needs guide you.

## Decompiling Everything (The Full Package)

Now that you've seen how to decompile one file, let's decompile the entire `zombie` package. This gives you access to all of PZ's systems - AI, vehicles, inventory, crafting, everything.

Don't worry, this is almost identical to what you just did. The only difference is you're pointing at a folder instead of a single file.

### Step 1: Increase Memory Allocation

The full zombie package has 1,200+ files. We need to give Java more memory:

```bash
cd C:\PZ_Decompiled                                                           # Move to workspace

java -Xmx4g -jar vineflower.jar -d ./output_full "<your Steam library>\steamapps\common\ProjectZomboid\zombie"
```

Let's break this down:
- `-Xmx4g` - Give Java 4GB of memory (PZ has a LOT of classes)
- `-d ./output_full` - Put results in "output_full" folder
- Last parameter is now pointing to the `zombie` *folder*, not a single file

This will take 2-5 minutes depending on your computer. Go grab some water!

### Step 2: Navigate the Output

After decompilation, you'll have:

```
PZ_Decompiled/
└── output/
    └── zombie/
        ├── ai/
        │   ├── states/
        │   │   ├── AttackState.java
        │   │   ├── IdleState.java
        │   │   └── ...
        │   ├── GameCharacterAIBrain.java
        │   └── ...
        ├── characters/
        │   ├── IsoZombie.java
        │   ├── IsoPlayer.java
        │   └── ...
        └── ...
```

### Step 3: Open in an IDE

For the best experience, open the output folder in VS Code or IntelliJ. This gives you:

- **Syntax highlighting** - Colored code for readability
- **Search across all files** - Press Ctrl+Shift+F to search everything
- **Jump to definitions** - Click a class name to see where it's defined
- **Code folding** - Collapse sections you're not interested in

But honestly? Even opening files in Notepad works fine. Don't overthink it.

## What to Look For When Reading Java Code

Let me show you the three most important patterns to recognize. You don't need to understand Java deeply - just recognize these patterns and you'll find what you need.

### Pattern 1: Public Fields (Direct Lua Access)

Look for lines starting with `public` followed by a type and name:

```java
// IsoZombie.java, lines 190-197
public int speedType = -1;       // "public" means Lua can access it
public int cognition = -1;       // "int" means it's a number
public boolean bCrawling;        // "boolean" means true/false
```

**How to use them in Lua:**
```lua
local zombie = getSpecificPlayer(0):getZombieList():get(0)  -- Get any zombie
zombie.speedType = 1             -- Change speed type
zombie.bCrawling = true          -- Make it crawl
zombie.cognition = 3             -- Make it smart
```

That's it. If you see `public [type] [name]`, you can access it as `object.name` in Lua.

### Pattern 2: Lua-Exposed Methods (@LuaMethod)

Look for `@LuaMethod` above a method definition:

```java
// This annotation means "Lua can call this"
@LuaMethod(name = "getHealth", global = false)
public float getHealth() {
    return this.health;          // Returns the health value
}
```

**How to use them in Lua:**
```lua
local zombie = getSpecificPlayer(0):getZombieList():get(0)
local health = zombie:getHealth()  -- Call the method with colon syntax
print("Zombie health: " .. health)
```

If you see `@LuaMethod`, you can call it from Lua. Use `:` (colon) for methods, `.` (dot) for fields.

### Pattern 3: Performance Bottlenecks (When to Optimize)

Look for loops that run every frame or on every action. Example from RecipeManager:

```java
// This runs EVERY time you right-click anything
for (int var4 = 0; var4 < var3.size(); var4++) {           // Loop through ALL recipes (1000+)
    Recipe var5 = (Recipe)var3.get(var4);                  // Get each recipe
    if (IsRecipeValid(var5, var1, var0, var2)) {           // Check if it's valid (expensive!)
        RecipeList.add(var5);                              // Add to list if valid
    }
}
```

**Why this matters:** This loops through 1000+ recipes on every right-click, each with 8 validation checks. If you add lots of recipes, this is where lag comes from.

**What you can do:** Cache results, pre-index recipes by ingredient, or validate only when needed.

## Real Discoveries From Decompilation

Let me show you two real discoveries that came from decompilation. These weren't documented anywhere - they were found by reading the source.

### Discovery 1: Zombie Public Fields

**Location:** `IsoZombie.java`, lines 190-197

```java
// These were completely undocumented!
public int speedType = -1;       // Zombie speed tier
public int cognition = -1;       // Intelligence level
public int hearing = -1;         // Hearing range
public int strength = -1;        // Damage multiplier
public int memory = -1;          // Memory duration
public int sight = -1;           // Vision range
public boolean bCrawling;        // Crawler status
public boolean bLunger;          // Lunger ability
public float speedMod;           // Speed multiplier
```

**Impact:** Before this discovery, modders used the `makeInactive()` hack to change zombie attributes - a slow workaround. Direct field access is 10x faster and more reliable.

**Who found it:** Community member analyzing zombie behavior in 2023.

### Discovery 2: Recipe System Bottleneck

**Location:** `RecipeManager.java`, lines 201-246

**Finding:** Every right-click triggers a full scan of 1000+ recipes with 8 expensive validation checks per recipe. No caching, no indexing.

```java
// This runs on EVERY right-click
for (int var4 = 0; var4 < var3.size(); var4++) {           // Loop ALL recipes
    Recipe var5 = (Recipe)var3.get(var4);                  // Get recipe
    if (IsRecipeValid(var5, var1, var0, var2)) {           // 8 checks per recipe!
        RecipeList.add(var5);
    }
}
```

**Impact:** With 100+ custom recipes, right-clicking caused lag. Pre-indexing recipes by ingredient improved performance by 100-500x.

**Who found it:** Performance analysis during recipe mod development, 2024.

> **Key Takeaway:** These discoveries weren't made by Java experts - they were made by modders who decompiled specific files to answer specific questions. You don't need to read everything. Search for what you need, find the pattern, and move on.

## Documenting Your Findings

When you discover something useful, document it for others (and future you). Here's a simple template:

```markdown
## Finding: [Give it a descriptive name]

**Location:** ClassName.java, line X

**What I found:**
```java
// The relevant code snippet
```

**Can Lua access it?** Yes/No (public means yes, private means no)

**How to use it:**
```lua
-- Working example code
```

**Why it matters:** What does this unlock? Performance gain? New capability?

**Tested:** Yes/No (Did you actually test it in-game?)
```

**Example documentation:**

```markdown
## Finding: Zombie Speed Multiplier

**Location:** IsoZombie.java, line 234

**What I found:**
```java
public float speedMod;  // Speed multiplier for individual zombies
```

**Can Lua access it?** Yes (it's public)

**How to use it:**
```lua
zombie.speedMod = 2.0  -- Make zombie twice as fast
```

**Why it matters:** Allows per-zombie speed control without changing speedType. Great for dynamic difficulty.

**Tested:** Yes - works in Build 41.78
```

Share your findings in Discord, on forums, or in this wiki. Every documented discovery helps the whole community.

## Common Mistakes

Let me show you the mistakes everyone makes when starting with decompilation. I made all of these myself!

### ❌ Wrong: Forgetting Quotes in Paths
```bash
java -jar vineflower.jar -d ./output C:\Program Files (x86)\Steam\...\zombie
# Error: "C:\Program" is not recognized
```

**Why it fails:** The space in "Program Files" breaks the command.

✅ **Right: Use Quotes for Paths with Spaces**
```bash
java -jar vineflower.jar -d ./output "C:\Program Files (x86)\Steam\...\zombie"
# Works! Quotes treat the whole path as one argument
```

### ❌ Wrong: Not Enough Memory
```bash
java -jar vineflower.jar -d ./output "...\ProjectZomboid\zombie"
# Error: java.lang.OutOfMemoryError
```

**Why it fails:** PZ has 1,200+ classes. Default Java memory (512MB) isn't enough.

✅ **Right: Allocate Enough Memory**
```bash
java -Xmx4g -jar vineflower.jar -d ./output "...\ProjectZomboid\zombie"
# -Xmx4g = Give Java 4GB of memory (4 gigabytes)
```

### ❌ Wrong: Getting Lost in Code
```java
// Opening a 7,000-line file and trying to read it all
// IsoPlayer.java has 7,585 lines - where do I even start?
```

**Why it fails:** These files are HUGE. Reading linearly is overwhelming.

✅ **Right: Use Search (Ctrl+F)**
```
Open the file → Press Ctrl+F → Search for what you need
Looking for health? Search "health"
Looking for speed? Search "speed"
Looking for public fields? Search "public int" or "public boolean"
```

### ❌ Wrong: Assuming Private Fields are Accessible
```java
private int health = 100;        // "private" means Lua CANNOT access this
```

```lua
zombie.health = 50  -- Won't work! Field is private
```

**Why it fails:** Only `public` fields are accessible from Lua. `private` means "Java only."

✅ **Right: Look for Public Fields or Setter Methods**
```java
public int health = 100;         // Public field - Lua can access
// OR
public void setHealth(int h) {   // Public method - Lua can call
    this.health = h;
}
```

```lua
zombie.health = 50        -- Works if field is public
zombie:setHealth(50)      -- Works if setter method exists
```

### ❌ Wrong: Trying to Access Every Discovery
```java
// You found 500 public fields!
// Let me try to use all of them in my mod...
```

**Why it fails:** Most fields are for internal engine use. Many will have no effect or will break things.

✅ **Right: Test Small, Document Results**
```lua
-- Test ONE field at a time
zombie.speedType = 0
print("Changed speed, testing...")
-- Does it work? Document it. Doesn't work? Move on.
```

## Try It Yourself: Find and Use a Hidden Field

Let's put everything together with a hands-on exercise. You'll decompile a file, find a field, and use it in a real mod.

**Goal:** Create a mod that makes zombies 50% faster by modifying the `speedMod` field.

### Step 1: Decompile IsoZombie.java

```bash
cd C:\PZ_Decompiled
java -jar vineflower.jar -d ./output "<your Steam library>\steamapps\common\ProjectZomboid\zombie\characters\IsoZombie.class"
```

### Step 2: Find the speedMod Field

Open `output\zombie\characters\IsoZombie.java` in any text editor.

Press Ctrl+F and search for: `public float speed`

You should find:
```java
public float speedMod;           // Speed multiplier for this zombie
```

### Step 3: Create a Test Mod

Create `%UserProfile%\Zomboid\mods\FastZombies\mod.info`:
```
name=Fast Zombies Test
id=FastZombiesTest
description=Testing speedMod field from decompilation
```

Create `%UserProfile%\Zomboid\mods\FastZombies\media\lua\client\fast_zombies.lua`:
```lua
-- Make all zombies 50% faster using the speedMod field we discovered

local function makeZombiesFast()
    local zombies = getCell():getZombieList()  -- Get all zombies in the world

    for i = 0, zombies:size() - 1 do           -- Loop through each zombie
        local zombie = zombies:get(i)          -- Get individual zombie
        zombie.speedMod = 1.5                  -- Set speed multiplier to 150%
        print("Made zombie " .. i .. " faster!")
    end
end

-- Run when player spawns
Events.OnPlayerUpdate.Add(function()
    makeZombiesFast()
end)
```

### Step 4: Test It

1. Launch PZ with your mod enabled
2. Start a game
3. Spawn some zombies (or find them naturally)
4. Watch them move - they should be noticeably faster!

### Step 5: Verify It Worked

Press `F11` to open the Lua debugger and check the output:
```
Made zombie 0 faster!
Made zombie 1 faster!
Made zombie 2 faster!
```

**You just:**
1. Decompiled Java source
2. Found an undocumented field
3. Used it in a working mod
4. Verified the results

This is the full decompilation workflow. Everything else is just variations of this pattern.

## Safety Guidelines

### Acceptable Uses

- Analyzing public fields and methods
- Finding undocumented APIs
- Performance research
- Sharing optimization techniques
- Educational documentation

### Not Acceptable

- Redistributing decompiled source code
- Exposing security vulnerabilities
- Breaking game functionality
- Commercial use without permission
- Bypassing DRM or protection

## Troubleshooting

### Problem: "Out of Memory" Error

**You'll see:**
```
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
```

**What's happening:** Java ran out of memory while decompiling. PZ has a LOT of files.

**Fix:** Give Java more memory with `-Xmx`:
```bash
java -Xmx8g -jar vineflower.jar -d ./output "...\ProjectZomboid\zombie"
# -Xmx8g = 8 gigabytes (double the default 4GB)
```

If 8GB still isn't enough (unlikely), try 12GB: `-Xmx12g`

### Problem: Garbled or Unreadable Output

**You'll see:** Code that looks like random symbols, or Java that doesn't make sense.

**What's happening:** Every decompiler has strengths and weaknesses. Sometimes a file just doesn't decompile well with one tool.

**Fix:** Try a different decompiler:
```bash
# Try CFR instead
java -jar cfr.jar --outputdir output "...\ProjectZomboid\zombie"

# Or try Procyon
java -jar procyon-decompiler.jar -o output "...\ProjectZomboid\zombie"
```

### Problem: "Cannot find class file" or Empty Output

**What's happening:** The path to PZ is wrong, or you're pointing at the wrong folder.

**Fix:** Verify your PZ installation path:
1. Open Steam
2. Right-click Project Zomboid → Manage → Browse Local Files
3. You should see a `zombie` folder in there
4. Copy that full path and use it in your command

**Common wrong paths:**
- `C:\Steam\...` (Steam isn't usually in C:\)
- `...\ProjectZomboid\media\...` (wrong folder - media is for Lua/assets)
- `...\ProjectZomboid\java\...` (wrong folder - this is the JVM)

**Correct path ends in:**
```
...\ProjectZomboid\zombie\
```

## Where to Go From Here

You now have the power to answer questions the wiki can't. Here's what I recommend exploring next:

### Start Here (Easy Wins)
1. **IsoZombie.java** - Full of public fields you can modify
   - Search for "public int" to find zombie attributes
   - Try changing `speedType`, `cognition`, `hearing`
   - Instant results you can see in-game

2. **IsoPlayer.java** - Player character capabilities
   - Search for "public boolean" to find flags
   - Look for `@LuaMethod` to find callable functions
   - Huge file (7,585 lines) but super useful

### Intermediate Exploration
3. **LuaManager.java** - The bridge between Java and Lua
   - Shows exactly what's exposed to mods
   - Search for `@LuaMethod` to find all Lua-accessible methods
   - 8,893 lines of modding possibilities

4. **RecipeManager.java** - Crafting system internals
   - Great example of performance bottlenecks
   - Learn why recipe mods can cause lag
   - Find optimization opportunities

### Advanced Deep Dives
5. **Core Systems Architecture** - Read our [reference guide](/pz/build-41/modding/engine-analysis/core-systems-architecture)
6. **Vehicle System** - If you're modding vehicles, start with `BaseVehicle.java`
7. **AI System** - For advanced AI modding, explore `zombie/ai/states/`

Don't try to read everything. Pick a specific question, find the relevant file, search for what you need, and move on.

## Key Takeaways

**The Big Picture:**
- Decompilation turns .class files back into readable Java code
- This reveals undocumented APIs and optimization opportunities
- You don't need to be a Java expert - just recognize patterns

**What to Remember:**
1. **Public fields = Lua accessible** (use `object.fieldName`)
2. **@LuaMethod = Lua callable** (use `object:methodName()`)
3. **Private = Java only** (can't access from Lua)
4. **Vineflower is the recommended decompiler** for modern Java
5. **Use Ctrl+F to search** - don't read files linearly
6. **Test one thing at a time** - then document what worked

**The Workflow:**
1. Have a question ("Can I change zombie hearing?")
2. Decompile the relevant class (IsoZombie.java)
3. Search for keywords ("hearing")
4. Find the pattern (public int hearing)
5. Test in a mod (zombie.hearing = 50)
6. Document if it works

You've got this. Every expert started exactly where you are now - staring at decompiled code, trying things, and learning what works. Welcome to the world of Java-level modding!
