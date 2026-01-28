---
id: research-methodology
slug: research-methodology
title: AI Research Methodology
game: pz
version: build-41
section: modding
category: ai-assisted
subcategory: null
difficulty: intermediate
tags:
  - ai
  - research
  - workflow
  - methodology
  - documentation
excerpt: Learn a research-first approach to AI-assisted modding where AI documents and understands game systems before implementing, resulting in dramatically better output.
table_of_contents:
  - text: "What Is Research-First Modding?"
    link: "#what-is-research-first-modding"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Your First Research Session"
    link: "#your-first-research-session"
  - text: "Why Research-First Works"
    link: "#why-research-first-works"
  - text: "The Research-First Workflow"
    link: "#the-research-first-workflow"
  - text: "Step 1: Identify the Closest Equivalent"
    link: "#step-1-identify-the-closest-equivalent"
  - text: "Step 2: Direct AI to Research"
    link: "#step-2-direct-ai-to-research"
  - text: "Step 3: AI Produces Documentation"
    link: "#step-3-ai-produces-documentation"
  - text: "Step 4: Reference the Documentation"
    link: "#step-4-reference-the-documentation"
  - text: "Step 5: Implement with Understanding"
    link: "#step-5-implement-with-understanding"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Practical Example: Complete Workflow"
    link: "#practical-example-complete-workflow"
  - text: "Key Takeaways"
    link: "#key-takeaways"
related_articles:
  - context-library
  - writing-prompts
  - ai-debugging
last_updated: 2026-01-19
---

# AI Research Methodology

> Learn how to make AI understand game systems deeply before coding, resulting in dramatically better mod quality.

---

## What Is Research-First Modding?

You want to create a custom fishing rod for Project Zomboid. You open ChatGPT and type: "Create a fishing rod item for PZ Build 41."

AI gives you this:

```
item FishingRod {
    Name = Fishing Rod,
    Weight = 1.5,
    Type = Tool,
    Durability = 100,
}
```

You test it. Half the properties don't exist in PZ. The ones that do are named wrong. You spend an hour fixing AI's guesses.

Now imagine a different approach. You ask AI: "Research how fishing works in PZ Build 41. Document the fishing rod properties, the fishing action system, and how fish are caught."

AI spends 3 minutes researching and produces a detailed document explaining the entire fishing system with correct property names, file locations, and code patterns. *Then* you say "Now create my custom fishing rod" - and AI generates perfect code on the first try because it actually understands the system.

That's research-first modding. When I discovered this approach, my AI-generated code went from "needs 5 rounds of fixes" to "works immediately" about 80% of the time. The difference is that AI isn't guessing anymore - it's working from understanding.

Let me show you exactly how this works, starting with the simplest possible example.

**You would use research-first modding when:**
- You're creating something based on vanilla systems (weapons, recipes, vehicles)
- AI keeps generating code with wrong property names
- You want to understand a system before modifying it
- You're starting a complex mod and need to map out how things work

---

## Prerequisites

Before this article, you should understand:
- How to use AI tools for modding ([AI Tools for Modding](./ai-for-modding))
- Basic PZ modding concepts (items, recipes, Lua scripts)
- Where vanilla PZ files are located

You don't need to be an expert - this methodology actually helps beginners learn faster because AI explains systems as it researches them.

---

## Your First Research Session

Let's do the simplest possible research-first workflow. We'll research one vanilla item, then create a custom version.

### Step 1: Pick a Research Target

You want to create a custom backpack. The vanilla game already has backpacks, so that's your research target.

### Step 2: Ask AI to Research

Open ChatGPT or Claude and paste this:

```
I'm modding Project Zomboid Build 41.

Research the vanilla "Bag_BigHikingBag" item and write a short document explaining:
1. What properties it has
2. What each property does
3. The file location

Keep it focused - just this one item for now.
```

### Step 3: AI Researches and Documents

AI will produce something like:

```markdown
# BigHikingBag Analysis (PZ Build 41)

## Location
Found in: media/scripts/items_bags.txt

## Item Definition
item Bag_BigHikingBag {
    DisplayCategory = Container,
    Type = Container,
    Capacity = 22,
    WeightReduction = 70,
    Weight = 1.5,
    Icon = Bag_BigHikingBag,
    DisplayName = Big Hiking Bag,
}

## Properties Explained
- **Capacity = 22**: Can hold 22 weight units of items
- **WeightReduction = 70**: Items inside weigh 70% less (30% of normal weight)
- **Weight = 1.5**: The bag itself weighs 1.5 units when empty
- **DisplayCategory = Container**: Shows up in "Container" category in inventory
- **Type = Container**: Tells the game this is a container item
```

### Step 4: Create Your Custom Item

Now, in the same conversation, say:

```
Based on your research above, create a "Bag_MilitaryRucksack" that:
- Has 25 capacity (more than the hiking bag)
- Has 75 weight reduction (better than hiking bag)
- Weighs 2.0 (heavier than hiking bag)
- Use the same property structure you documented
```

AI will generate:

```
item Bag_MilitaryRucksack {
    DisplayCategory = Container,  -- Same category as hiking bag
    Type = Container,              -- Must be Container for bags
    Capacity = 25,                 -- More storage than hiking bag's 22
    WeightReduction = 75,          -- Better reduction than hiking bag's 70
    Weight = 2.0,                  -- Heavier than hiking bag's 1.5
    Icon = Bag_MilitaryRucksack,
    DisplayName = Military Rucksack,
}
```

Perfect! AI used the correct properties because it just researched them. No guessing.

> **Key Takeaway**
> Research-first means AI documents a system before coding. This "activates" AI's knowledge of that system, resulting in accurate code instead of guesses.

---

## Why Research-First Works

Let's understand what happens in AI's "mind" during research vs. direct coding.

### Without Research: AI Guesses

**You ask:** "Create a fishing rod item for PZ Build 41"

**AI's process:**
1. "I know general game item properties exist"
2. "Fishing rods probably have durability, damage, maybe fishing_power?"
3. Generates code based on *generic game item concepts*

**Result:** Wrong property names, missing required properties, incorrect syntax.

---

### With Research: AI Understands

**You ask:** "First research how fishing rods work in PZ Build 41, then create one"

**AI's process:**
1. Recalls training data about PZ fishing systems
2. Organizes that knowledge into documentation
3. That documentation becomes "active context" in the conversation
4. When generating code, AI references the exact patterns it just documented

**Result:** Correct properties, proper syntax, follows vanilla conventions.

**Why this works:** AI models have vast knowledge, but not all of it is "active" at once. Research brings specific knowledge to the front of AI's attention. It's like the difference between knowing something is "somewhere in your memory" vs. having it written on a notepad in front of you.

---

## The Research-First Workflow

Here's the complete 5-step process you'll use for every complex modding task.

```
┌─────────────────────────────────────────────────────────────┐
│                    RESEARCH PHASE                           │
├─────────────────────────────────────────────────────────────┤
│  1. Identify → What vanilla/mod feature is closest?         │
│  2. Research → Have AI study that functionality             │
│  3. Document → AI writes explanation with examples          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  IMPLEMENTATION PHASE                       │
├─────────────────────────────────────────────────────────────┤
│  4. Reference → Point AI to the documentation it wrote      │
│  5. Implement → AI creates your mod with full understanding │
└─────────────────────────────────────────────────────────────┘
```

Let's go through each step in detail.

---

## Step 1: Identify the Closest Equivalent

Before asking AI to build anything, ask yourself:

> "What existing feature in vanilla PZ is closest to what I want?"

This is critical because AI researches best when given a specific target.

### Good Research Targets

| What You Want to Create | Research Target |
|------------------------|-----------------|
| Custom weapon | Vanilla weapons (pick one similar to yours) |
| New recipe | Vanilla recipes (pick similar complexity) |
| Timed action | Existing timed actions (ISTimedAction examples) |
| Custom UI panel | Vanilla UI panels (ISPanel examples) |
| Special item effect | Items with similar effects (buffs, debuffs) |

### Example: Custom Torch That Burns Forever

**What you want:** A torch that never runs out of fuel.

**Closest equivalent:** The vanilla torch (Base.Torch) which *does* run out.

**Research target:** "How does the vanilla torch work, specifically its fuel/condition system?"

---

## Step 2: Direct AI to Research

Now give AI a focused research task. Be specific about what you want to understand.

### Research Prompt Template

```
I'm modding Project Zomboid Build 41.

I need you to research [SPECIFIC FEATURE] thoroughly.

Please write a markdown document that explains:
1. How this works in vanilla
2. Relevant file locations
3. Key properties/parameters and what they do
4. Code examples with inline comments
5. Common patterns and conventions

I want to understand this before implementing my own version.
```

### Example Research Prompts

**For an item:**
```
Research the vanilla "Base.Torch" item in PZ Build 41.

Document:
1. All properties it uses
2. What each property does
3. How the light/fuel system works
4. File location

I want to create a custom torch variant.
```

**For a recipe:**
```
Research how "Make Campfire" recipe works in PZ Build 41.

Document:
1. The recipe syntax
2. How it handles multiple ingredients
3. How it consumes items vs. keeping tools
4. What OnCreate or OnGiveXP means

I want to create similar outdoor crafting recipes.
```

**For a Lua system:**
```
Research how "ISTimedAction" works in PZ Build 41.

Document:
1. The base class structure
2. Required methods (perform, start, update, stop)
3. How to pass data to the action
4. Common patterns in vanilla timed actions

I want to create a custom action for my mod.
```

---

## Step 3: AI Produces Documentation

AI will research and produce a document. This document should include:

- **Clear explanations** of how things work
- **Code examples** with comments
- **File locations** so you can verify
- **Patterns** that you should follow

### What Good Research Output Looks Like

```markdown
# Vanilla Torch System (PZ Build 41)

## Item Definition Location
`media/scripts/items_lighting.txt`

## Properties

| Property | Value | What It Does |
|----------|-------|--------------|
| `LightDistance` | 15 | Radius of light emitted |
| `LightStrength` | 1.0 | Brightness intensity |
| `TorchCone` | true | Creates directional cone of light |
| `UseDelta` | 0.0005 | Condition loss per use |
| `UseWhileEquipped` | true | Can be activated from hotbar |

## Full Definition
```lua
item Torch {
    Weight = 0.8,              -- Light enough to carry multiple
    Type = Drainable,          -- Has a condition that drains
    DisplayName = Torch,
    Icon = Torch,
    LightDistance = 15,        -- How far the light reaches
    LightStrength = 1.0,       -- How bright it is
    TorchCone = true,          -- Directional light
    UseDelta = 0.0005,         -- Drains 0.0005 condition per tick
    UseWhileEquipped = true,   -- Works from hotbar
}
```

## How It Works
The torch uses the "Drainable" type, meaning it has a condition value (0-1).
Each game tick while active, it loses UseDelta from its condition.
When condition reaches 0, the torch is consumed/destroyed.

## Key Pattern
For infinite-use items, either:
- Set UseDelta to 0 (never drains)
- Don't use Type = Drainable
```

Notice how this explains *why* things work, not just *what* the code is. This understanding is what AI will use when creating your custom version.

---

## Step 4: Reference the Documentation

Here's the key insight: **point AI back to its own documentation**.

The documentation is now part of your conversation. AI can reference it directly.

### Implementation Prompt Template

```
Based on your documentation above, now create [MY CUSTOM THING]:

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Follow the syntax and patterns you documented.
```

### Example

```
Based on your torch documentation above, create "Base.EternalTorch":

Requirements:
- Same light distance and strength as vanilla torch
- Never runs out (doesn't drain condition)
- Weighs slightly more (1.0 instead of 0.8)
- Uses the patterns you documented

Follow the vanilla torch structure but modify for infinite use.
```

AI will generate:

```lua
item EternalTorch {
    Weight = 1.0,              -- Heavier than vanilla torch's 0.8
    Type = Normal,             -- NOT Drainable - won't run out
    DisplayName = Eternal Torch,
    Icon = Torch,              -- Reuse vanilla icon
    LightDistance = 15,        -- Same as vanilla torch
    LightStrength = 1.0,       -- Same brightness
    TorchCone = true,          -- Same directional light
    -- NO UseDelta - doesn't drain since Type != Drainable
    UseWhileEquipped = true,   -- Works from hotbar
}
```

Perfect! AI understood:
- Type = Drainable causes fuel drain
- Removing that makes it infinite
- Other properties stay the same
- Syntax matches vanilla patterns

---

## Step 5: Implement with Understanding

The AI now creates your mod with:

- **Correct syntax** - Because it just documented the exact format
- **Proper patterns** - Because it analyzed how vanilla does it
- **Appropriate structure** - Because it understands the system
- **Fewer bugs** - Because it's not guessing

**Compare the results:**

**Without research:**
- 5+ rounds of "this property doesn't work"
- Missing required properties
- Wrong syntax
- Takes 30+ minutes to get working

**With research:**
- Works on first or second try
- All required properties included
- Correct syntax from the start
- Takes 5-10 minutes total (including research time)

---

## Common Mistakes

### Mistake 1: Skipping Research Phase

❌ **Doesn't work:**
```
User: "Create a custom vehicle for PZ Build 41"
AI: [Generates vehicle with guessed properties]
User: [Spends an hour fixing wrong properties]
```

✅ **Works:**
```
User: "First, research how vehicles work in PZ Build 41. Document the BaseVehicle properties, templates, and script structure."
AI: [Produces detailed vehicle documentation]
User: "Based on that documentation, create a custom pickup truck."
AI: [Generates correct vehicle using documented patterns]
```

**Why:** Vehicles are complex with dozens of properties. Research ensures AI knows the correct structure before coding.

---

### Mistake 2: Research Request Too Broad

❌ **Doesn't work:**
```
"Research everything about PZ modding"
```

**What happens:** AI produces generic, shallow information because the request is unfocused.

✅ **Works:**
```
"Research how the ISTimedAction system works in PZ Build 41, specifically the perform() and start() methods and how to create custom timed actions."
```

**Why:** Focused research produces deep, actionable understanding of one system instead of shallow knowledge of many systems.

---

### Mistake 3: Not Specifying Build Version

❌ **Doesn't work:**
```
"How do recipes work in Project Zomboid?"
```

**What happens:** AI might give Build 40 information, or mix versions, leading to incompatible code.

✅ **Works:**
```
"How do recipes work in Project Zomboid Build 41 specifically? Include evolved recipes if they exist in Build 41."
```

**Why:** PZ syntax changes significantly between builds. Build 41 and Build 42 have different APIs.

---

### Mistake 4: Not Referencing the Documentation

❌ **Doesn't work:**
```
[Gets detailed documentation]
[Starts new conversation]
"Create a fishing rod"
[AI has no context, guesses again]
```

✅ **Works:**
```
[Gets detailed documentation]
"Based on the fishing system documentation above, create a fishing rod with these properties..."
[AI references the documentation it just wrote]
```

**Why:** Documentation is only useful if you reference it in the same conversation. Starting fresh loses all that context.

---

### Mistake 5: Accepting First Draft Without Verification

❌ **Doesn't work:**
```
[AI researches and documents]
[User assumes it's all correct]
[Implements without checking]
[Code has errors because AI's research had mistakes]
```

✅ **Works:**
```
[AI researches and documents]
[User checks a few facts against vanilla files]
"The documentation says UseDelta, but I see ConditionLowerChance in vanilla. Which is correct for Build 41?"
[AI corrects the documentation]
[Then implementation uses correct properties]
```

**Why:** AI research is usually good but not perfect. Quick verification catches errors before they become code bugs.

---

## Try It Yourself

Let's practice the complete research-first workflow. This exercise takes about 20 minutes.

### Your Goal

Research the vanilla baseball bat, then create a custom weapon based on that research.

### Step 1: Open AI and Start Research

Open ChatGPT or Claude and paste:

```
I'm modding Project Zomboid Build 41.

Research the vanilla "Base.BaseballBat" weapon item.

Document:
1. All properties it has
2. What each weapon-specific property does (MaxRange, MaxDamage, etc.)
3. The file location
4. Which properties are required vs. optional

Keep it focused on weapon properties.
```

### Step 2: Read the Documentation

AI will produce documentation. Read through it and make sure you understand:
- What properties exist
- What they mean
- Which ones you'll need for your custom weapon

### Step 3: Create Your Custom Weapon

In the same conversation, say:

```
Based on your baseball bat documentation above, create "Base.MetalPipe":

Requirements:
- Longer reach than baseball bat (maybe +0.2 to MaxRange)
- Less damage than baseball bat (reduce Max/MinDamage by 20%)
- Weighs the same as baseball bat
- Can hit 2 targets like baseball bat
- Follow the exact property structure you documented

Use inline comments explaining key differences from the baseball bat.
```

### Step 4: Review the Output

AI should generate something like:

```lua
item MetalPipe {
    MaxRange = 1.5,              -- Baseball bat is 1.3, this is +0.2 longer
    WeaponSprite = MetalPipe,
    Type = Weapon,
    Weight = 2,                  -- Same as baseball bat
    MaxDamage = 0.96,            -- Baseball bat is 1.2, this is 20% less (1.2 * 0.8)
    MinDamage = 0.64,            -- Baseball bat is 0.8, this is 20% less (0.8 * 0.8)
    DisplayName = Metal Pipe,
    Icon = MetalPipe,
    Categories = Blunt,
    MaxHitCount = 2,             -- Can hit 2 zombies like baseball bat
    SubCategory = Swinging,
    SwingAnim = Bat,
    ConditionMax = 15,           -- Same durability as baseball bat
}
```

### Step 5: Verify Success

Check if:
- All property names match the documented pattern
- Math is correct (20% reduction from baseball bat values)
- Comments explain the reasoning
- Structure follows vanilla format

If yes, you've successfully used research-first methodology!

**Optional Challenge:** In the same conversation, ask AI to create a recipe for crafting the metal pipe. AI already understands weapon properties from its research, so it will create a sensible recipe.

---

## Practical Example: Complete Workflow

Let's see a full research-first session from start to finish.

### Goal: Custom Weapon with Fire Effect

**Session Start: Research Phase**

```
User: I want to create a torch-club weapon that sets zombies on fire when it hits them. Before implementing, I need to understand the relevant systems in PZ Build 41.

Please research and document:
1. How melee weapon damage works (OnWeaponHitCharacter event or similar)
2. How to apply fire/burning to characters
3. Example weapon that has special effects on hit
4. The structure of weapon item definitions

Write this as a reference document.

AI: [Produces 2-3 page documentation covering:]
- Weapon item structure with all properties explained
- OnWeaponHitCharacter event hook in Lua
- Character:setOnFire() method for applying fire
- Example showing how vanilla implements weapon effects
- File locations for items and Lua scripts
```

**Session Continue: Implementation Phase**

```
User: Perfect! Based on your documentation, now create my torch-club:

Item requirements:
- Moderate damage (between baseball bat and axe)
- Slow swing speed (bigger/heavier weapon feel)
- Can be used as a light source (like torch properties)
- 30% chance to ignite zombies on hit

Lua requirements:
- Hook OnWeaponHitCharacter
- Check if weapon is our torch-club
- Roll for 30% ignite chance
- Apply fire to zombie if successful

Follow the patterns you documented. Include inline comments.

AI: [Generates complete item definition and Lua script with:]
- Properly formatted item with weapon + torch properties
- Correct event hook usage
- Proper zombie:setOnFire() implementation
- All following documented patterns
```

**Result:** Working torch-club weapon on first try because AI understood the systems before coding.

---

## Saving Your Research

Don't lose valuable research! Create a knowledge base:

```
MyMod/
├── _ai_research/
│   ├── 01_weapons_system.md
│   ├── 02_timed_actions.md
│   ├── 03_vehicle_mechanics.md
│   ├── 04_ui_panels.md
│   └── 05_farming_system.md
├── media/
└── mod.info
```

**Benefits:**
- Reference in future sessions (paste into new AI conversations)
- Share with teammates or the community
- Track what systems you understand
- Build up over time

**Tip:** Number your research files in the order you created them. This tracks your learning progression.

---

## Key Takeaways

1. **Research before implementing** - AI generates better code when it understands systems first
2. **Focus research on specific systems** - "How do timed actions work" not "How does everything work"
3. **Always specify Build 41 or 42** - Syntax differs significantly between versions
4. **Reference the documentation** - Point AI back to what it wrote: "Based on your docs above..."
5. **Verify AI's research** - Check a few facts against vanilla files to catch mistakes early
6. **Save your research documents** - Build a knowledge base for future reference
7. **One research session = many implementations** - Research vehicles once, create dozens of vehicle mods

---

## What's Next?

Combine research methodology with:
- [Context Library](./context-library) - Store research documents for reuse across sessions
- [Writing Good Prompts](./writing-prompts) - Structure research requests for best results
- [AI for Debugging](./ai-debugging) - Use research docs when troubleshooting errors
