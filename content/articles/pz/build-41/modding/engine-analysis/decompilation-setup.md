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
  - text: "Why Decompile?"
    link: "#why-decompile"
  - text: "Decompilation Tools"
    link: "#decompilation-tools"
  - text: "Finding PZ's Class Files"
    link: "#finding-pzs-class-files"
  - text: "Step-by-Step Decompilation"
    link: "#step-by-step-decompilation"
  - text: "What to Look For"
    link: "#what-to-look-for"
  - text: "Example Discoveries"
    link: "#example-discoveries"
  - text: "Documenting Your Findings"
    link: "#documenting-your-findings"
  - text: "Safety Guidelines"
    link: "#safety-guidelines"
  - text: "Troubleshooting"
    link: "#troubleshooting"
  - text: "Next Steps"
    link: "#next-steps"
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
C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid\zombie\characters\IsoZombie.class
```

**Step 4:** Run the decompiler
```bash
java -jar vineflower.jar -d ./output "C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid\zombie\characters\IsoZombie.class"
```

Let's break down what this command does:
- `java -jar vineflower.jar` - Run the decompiler tool
- `-d ./output` - Put results in an "output" folder
- `"C:\...IsoZombie.class"` - The file to decompile (in quotes because of spaces in path)

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

### Vineflower (Recommended)

Vineflower is a modern Java decompiler with excellent output quality.

**Download:** [github.com/Vineflower/vineflower/releases](https://github.com/Vineflower/vineflower/releases)

**Pros:**
- Active development
- Excellent output quality
- Handles modern Java features well
- Good at preserving variable names

**Usage:**
```bash
java -jar vineflower.jar -d output_dir input_dir/
```

### CFR (Class File Reader)

CFR is a mature decompiler with comprehensive feature support.

**Download:** [github.com/leibnitz27/cfr/releases](https://github.com/leibnitz27/cfr/releases)

**Pros:**
- Very mature and stable
- Comprehensive Java version support
- Good CLI interface
- Handles complex code well

**Usage:**
```bash
java -jar cfr.jar --outputdir output_dir input_dir/
```

### Procyon

Procyon is reliable for straightforward decompilation tasks.

**Download:** [github.com/mstrobel/procyon/releases](https://github.com/mstrobel/procyon/releases)

**Pros:**
- Reliable output
- Good Java 8+ support
- Simple to use

**Usage:**
```bash
java -jar procyon-decompiler.jar -o output_dir input_dir/
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
C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid
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

## Decompiling Everything (The Full Package)

Now that you've seen how to decompile one file, let's decompile the entire `zombie` package. This gives you access to all of PZ's systems - AI, vehicles, inventory, crafting, everything.

Don't worry, this is almost identical to what you just did. The only difference is you're pointing at a folder instead of a single file.

### Step 1: Increase Memory Allocation

The full zombie package has 1,200+ files. We need to give Java more memory:

```bash
cd C:\PZ_Decompiled                                                           # Move to workspace

java -Xmx4g -jar vineflower.jar -d ./output_full "C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid\zombie"
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

### Step 5: Open in an IDE

For best experience, open the output folder in VS Code or IntelliJ:

- Syntax highlighting
- Search across all files (Ctrl+Shift+F)
- Jump to definitions
- Code folding

## What to Look For

### Finding Public Fields

Public fields can be accessed directly from Lua. Look for:

```java
public int speedType = -1;
public int cognition = -1;
public boolean bCrawling;
```

These can be accessed as:
```lua
zombie.speedType = 1
zombie.bCrawling = true
```

### Finding Lua-Exposed Methods

Methods with `@LuaMethod` are accessible from Lua:

```java
@LuaMethod(name = "getHealth", global = false)
public float getHealth() {
    return this.health;
}
```

### Identifying Performance Bottlenecks

Look for:
- Nested loops through large collections
- Methods called every frame
- Linear searches through arrays

Example bottleneck (RecipeManager):
```java
// Called on every right-click - loops ALL recipes!
for (int var4 = 0; var4 < var3.size(); var4++) {
    Recipe var5 = (Recipe)var3.get(var4);
    if (IsRecipeValid(var5, var1, var0, var2)) {
        RecipeList.add(var5);
    }
}
```

## Example Discoveries

### Discovery 1: Zombie Public Fields

**Location:** `IsoZombie.java`, lines 190-197

```java
public int speedType = -1;
public int cognition = -1;
public int hearing = -1;
public int strength = -1;
public int memory = -1;
public int sight = -1;
public boolean bCrawling;
public boolean bLunger;
public float speedMod;
```

**Impact:** 10x faster zombie attribute modification by using direct field access instead of makeInactive() hack.

### Discovery 2: Recipe System Bottleneck

**Location:** `RecipeManager.java`, lines 201-246

**Finding:** Every right-click triggers a full scan of 1000+ recipes with 8 expensive validation checks per recipe.

**Impact:** Potential 100-500x improvement by pre-indexing recipes by ingredient.

## Documenting Your Findings

When you discover something useful, document it:

```markdown
## Finding: [Name]

**Location:** ClassName.java, line X

**Code:**
```java
// Relevant code snippet
```

**Lua Accessible:** Yes/No

**Usage:**
```lua
-- How to use in mods
```

**Impact:** Performance improvement or capability unlocked
```

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

### "Out of Memory" Error

Increase Java heap size:
```bash
java -Xmx8g -jar vineflower.jar ...
```

### Garbled Output

Try a different decompiler. Some handle certain code patterns better.

### Missing Classes

Ensure you're pointing to the correct PZ installation path.

## Next Steps

Once you've set up decompilation:

1. **Start with IsoZombie.java** - Great example of discoverable public fields
2. **Explore LuaManager.java** - Understand the modding API surface
3. **Read RecipeManager.java** - See optimization opportunities
4. **Document your findings** - Share with the community

## Key Takeaways

1. **Vineflower is the best modern decompiler** for PZ analysis
2. **Zombie package contains most modding-relevant code**
3. **Public fields can be accessed directly from Lua**
4. **@LuaMethod marks Lua-accessible functions**
5. **Performance bottlenecks reveal optimization opportunities**
6. **Always use findings ethically** - research only, no redistribution
