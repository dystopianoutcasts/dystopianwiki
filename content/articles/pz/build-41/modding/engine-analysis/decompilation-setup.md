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

## What is Decompilation?

When developers write code, they write it in human-readable form (like Java or Lua). That code gets compiled into machine-friendly format (.class files) that computers can run but humans can't easily read. **Decompilation** is the process of converting that machine code back into readable source code.

For PZ modding, this means we can read the game's Java source code to discover undocumented features, find optimization opportunities, and understand how systems really work.

> **This sounds technical, but don't worry.** You don't need to understand Java deeply - you're just reading code to find useful things. If you can read Lua, you can read enough Java to find what you need.

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

## Step-by-Step Decompilation

### Step 1: Set Up Your Environment

Create a workspace for decompiled sources:

```bash
mkdir C:\PZ_Decompiled
```

### Step 2: Download a Decompiler

Download Vineflower (recommended):
1. Go to the releases page
2. Download `vineflower-X.X.X.jar`
3. Save to your workspace

### Step 3: Run Decompilation

Decompile the entire zombie package:

```bash
cd C:\PZ_Decompiled

java -Xmx4g -jar vineflower.jar -d ./output "C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid\zombie"
```

The `-Xmx4g` flag allocates 4GB of memory (PZ has a lot of classes).

### Step 4: Navigate the Output

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
