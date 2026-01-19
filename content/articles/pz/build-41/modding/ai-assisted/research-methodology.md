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
related_articles:
  - context-library
  - writing-prompts
  - ai-debugging
last_updated: 2026-01-19
---

# AI Research Methodology

## Overview

The most effective way to use AI for modding isn't to point it at code and say "copy this." AI models work best when they have **deep understanding** of the problem they're solving. This guide teaches a research-first methodology that dramatically improves AI output quality.

## The Core Principle

AI models have vast training data, but that knowledge isn't always "active" during your conversation. When you ask AI to research a topic and write documentation about it, two things happen:

1. **The AI retrieves and synthesizes** relevant knowledge from its training
2. **That understanding becomes part of the active context** - it's "fresh" in the AI's mind

This is fundamentally different from pasting raw code. Raw code gives the AI *syntax* to copy. Research documentation gives the AI *understanding* to apply.

## The Research-First Workflow

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

## Step 1: Identify the Closest Equivalent

Before asking AI to build anything, ask yourself:

> "What existing feature in vanilla PZ or another mod is closest to what I want?"

This is critical. If you want to create:
- A new weapon → Research how vanilla weapons work
- A crafting system → Research vanilla recipes and crafting
- A custom UI → Research existing UI implementations
- A timed event → Research how vanilla handles scheduled events

### Example: Custom Fishing Rod

You want to create a custom fishing rod with special properties.

**Wrong approach:** "Make me a fishing rod item"

**Right approach:** First identify that vanilla already has fishing rods. Your research target is the vanilla fishing system.

## Step 2: Direct the AI to Research

Now ask the AI to research that specific functionality. Be explicit about:
- The game version (Build 41, Build 42, etc.)
- What aspects to focus on
- That you want a documentation-style output

### Research Prompt Template

```
I'm modding Project Zomboid Build 41.

I need you to research [SPECIFIC FEATURE] thoroughly.

Please write a markdown document that explains:
1. How this feature works in vanilla
2. The relevant file locations and structure
3. Key properties/parameters and what they do
4. Code examples with explanations
5. Common patterns and conventions
6. Any quirks or gotchas to be aware of

Search for Build 41 specific information. I want to understand
this deeply before implementing my own version.
```

### Example Research Request

```
I'm modding Project Zomboid Build 41.

I need you to research the vanilla fishing system thoroughly.

Please write a markdown document that explains:
1. How fishing works in vanilla (mechanics, items, skills)
2. Where fishing-related files are located
3. The FishingRod item properties and what each does
4. How the fishing action/timed action works in Lua
5. How fish are defined and caught
6. Common patterns for fishing-related recipes

Search for Build 41 specific information. I want to understand
this deeply before implementing my custom fishing rod.
```

## Step 3: AI Produces Documentation

The AI will produce a comprehensive document. This document contains:

- **Explanations** - Not just code, but *why* things work
- **Examples** - Real syntax from vanilla or documented sources
- **Context** - How pieces connect together
- **Patterns** - Conventions that should be followed

### What Good Research Output Looks Like

```markdown
# Project Zomboid Fishing System (Build 41)

## Overview
The fishing system in PZ involves several interconnected components:
the fishing rod item, the fishing action (timed action), fish items,
and the fishing skill...

## File Locations
- Items: `media/scripts/items_fishing.txt`
- Lua Actions: `media/lua/client/TimedActions/ISFishingAction.lua`
- Fish Definitions: `media/scripts/items_food.txt`

## FishingRod Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `UseWhileEquipped` | boolean | Allows use from hotbar |
| `UseDelta` | float | Condition loss per use |
| `FishingLure` | boolean | Whether it has a lure attached |

## Example: Vanilla Fishing Rod
```lua
item FishingRod {
    Weight = 1.5,
    Type = Normal,
    DisplayName = Fishing Rod,
    Icon = FishingRod,
    UseWhileEquipped = TRUE,
    ...
}
```

## How Fishing Actions Work
The `ISFishingAction` extends `ISBaseTimedAction` and...

[continues with detailed explanations]
```

## Step 4: Reference the Documentation

Now comes the key insight: **point the AI back to its own documentation**.

The documentation is now part of your conversation context. The AI has:
- Retrieved the relevant knowledge
- Organized it coherently
- Made it "active" in the current session

### Implementation Prompt Template

```
Based on the fishing system documentation above, I now want to
create a custom fishing rod for my mod.

Requirements:
- [Your specific requirements]
- [More requirements]

Using the patterns and syntax from the documentation, please create:
1. The item definition
2. Any necessary Lua modifications
3. Related recipes if applicable

Follow the conventions documented above.
```

## Step 5: Implement with Understanding

The AI now creates your mod content with:
- **Correct syntax** - Because it just documented the exact format
- **Proper conventions** - Because it analyzed vanilla patterns
- **Appropriate structure** - Because it understands how pieces connect
- **Fewer errors** - Because it's working from understanding, not guessing

## Targeting Specific Builds

PZ modding differs significantly between builds. Always specify your target:

### Build 41 Research
```
Research this for Project Zomboid Build 41 specifically.
Build 41 uses the older Lua API and ISUI system.
```

### Build 42 Research
```
Research this for Project Zomboid Build 42 specifically.
Build 42 introduced significant changes including [relevant changes].
Look for Build 42 documentation and changelogs.
```

The AI can also search online for build-specific information, API changes, and community documentation.

## Using Online Sources

Ask the AI to incorporate online research:

```
Research the PZ vehicle system for Build 41.

Please also search for:
- PZ Wiki documentation on vehicles
- Community modding guides for vehicle mods
- The PZ Modding Discord resources
- GitHub examples of vehicle mods

Combine what you find with your existing knowledge to create
comprehensive documentation.
```

## Practical Example: Complete Workflow

### Goal: Create a Custom Weapon with Special Effects

**Session 1: Research**

```
User: I want to create a weapon that sets zombies on fire when it hits them.
      First, I need to understand how weapons work in PZ Build 41.

      Please research and document:
      1. Weapon item definitions (melee focus)
      2. How weapon damage/effects are processed in Lua
      3. How vanilla handles special weapon effects
      4. The OnWeaponHitCharacter event or similar
      5. How fire/burning works on characters

      Write this as a reference document I can use.

AI: [Produces comprehensive documentation on weapons and damage]
```

**Session 1: Implement**

```
User: Based on your documentation above, create my fire weapon:
      - A torch club that has a chance to ignite zombies
      - Uses the OnWeaponHitCharacter hook you documented
      - Moderate damage, slow swing
      - Follows vanilla weapon conventions

AI: [Creates weapon with correct syntax and working Lua code]
```

## Saving Research Documents

Don't lose your research! Save valuable documentation:

```
MyMod/
├── _ai_research/
│   ├── fishing_system.md
│   ├── weapon_effects.md
│   ├── timed_actions.md
│   └── vehicle_mechanics.md
├── media/
└── mod.info
```

Benefits:
- Reference for future sessions
- Share with other modders
- Track what you've learned
- Paste into new AI conversations

## Why This Works Better Than Copy-Paste

| Approach | What AI Has | Result |
|----------|-------------|--------|
| "Copy this code" | Raw syntax | May miss context, wrong assumptions |
| "Look at this file" | Structure only | Doesn't understand purpose |
| **Research methodology** | Deep understanding | Correct, contextual output |

When AI researches and documents, it:
- Activates relevant knowledge from training
- Connects concepts together
- Identifies patterns and conventions
- Creates a mental model of the system

This mental model then informs every line of code it writes.

## Common Mistakes to Avoid

### Mistake 1: Skipping Research
```
❌ "Make me a custom vehicle"
✓ "First, research how vehicles work in PZ Build 41, then we'll create one"
```

### Mistake 2: Too Broad
```
❌ "Research everything about PZ modding"
✓ "Research specifically how timed actions work in PZ Build 41"
```

### Mistake 3: Not Specifying Build
```
❌ "How do recipes work in PZ?"
✓ "How do recipes work in PZ Build 41? Include evolved recipes."
```

### Mistake 4: Forgetting to Reference
```
❌ [Get documentation] → [Start new topic without referencing it]
✓ [Get documentation] → "Based on the documentation above, create..."
```

## Key Takeaways

1. **Research before implementation** - Understanding beats copying
2. **AI documentation activates knowledge** - It becomes "fresh" context
3. **Specify your build version** - 41 and 42 differ significantly
4. **Target specific systems** - Focused research produces better results
5. **Reference the documentation** - Point AI back to what it wrote
6. **Save your research** - Build a knowledge base over time

## Next Steps

Combine this methodology with:
- **Context Library** - Store research documents for reuse
- **Good Prompts** - Structure your research requests effectively
- **Debugging with AI** - Use research docs when troubleshooting
