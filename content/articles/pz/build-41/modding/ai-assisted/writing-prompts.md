---
id: ai-assisted-writing-prompts
slug: writing-prompts
title: "Writing Good Prompts"
game: pz
version: build-41
section: modding
category: ai-assisted
subcategory: null
difficulty: beginner
tags:
  - beginner
  - ai
  - prompts
  - tips
  - workflow
  - productivity
excerpt: "Learn the CERC framework for writing AI prompts that produce useful, accurate code for Project Zomboid modding."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "The CERC Framework"
    link: "#the-cerc-framework"
  - text: "Bad vs Good Prompts"
    link: "#bad-vs-good-prompts"
  - text: "Context That Helps"
    link: "#context-that-helps"
  - text: "Providing Examples"
    link: "#providing-examples"
  - text: "Asking for Explanations"
    link: "#asking-for-explanations"
  - text: "Iterating Effectively"
    link: "#iterating-effectively"
  - text: "Prompt Templates"
    link: "#prompt-templates"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "AI for Debugging"
    path: /build-41/modding/ai-assisted/ai-debugging
  - title: "Building a Context Library"
    path: /build-41/modding/ai-assisted/context-library
last_updated: 2026-01-09
---

# Writing Good Prompts

## Overview

The quality of AI output depends on the quality of your input. A vague prompt gets vague results. A specific, well-structured prompt gets useful code. This guide teaches you how to write prompts that get results.

## The CERC Framework

Use this structure for consistent results:

| Element | Purpose | Example |
|---------|---------|--------|
| **C**ontext | Set the scene | "In Project Zomboid Build 41..." |
| **E**xample | Show what you want | "Similar to the vanilla Axe item..." |
| **R**equest | State your need | "Create a recipe that..." |
| **C**onstraints | Set boundaries | "The recipe should not require Lua" |

## Bad vs Good Prompts

### Example 1: Item Creation

**Bad:**
> "Make me a sword item"

**Good:**
> "In Project Zomboid Build 41, create a script file item definition for a katana sword. It should:
> - Be a two-handed weapon
> - Have high damage but low durability
> - Use the existing KatanaModelMale attachment
> - Follow the same format as vanilla's Axe item
> 
> I only need the item script, no Lua."

### Example 2: Recipe Creation

**Bad:**
> "Recipe for crafting something"

**Good:**
> "Create a PZ Build 41 recipe definition that:
> - Combines 2 short planks and 4 nails to make a wooden sign
> - Requires a hammer (not consumed)
> - Takes 60 time units
> - Gives carpentry XP
> - Uses the Carpentry category
> 
> Output in script file format (.txt), using module Base."

### Example 3: Explaining Code

**Bad:**
> "What does this do?" [pastes 100 lines]

**Good:**
> "I'm learning PZ modding. Please explain this vanilla recipe line by line. I don't understand what 'keep' does or why there are square brackets:
> ```
> recipe Saw Logs {
>     Log,
>     keep [Recipe.GetItemTypes.Saw],
>     Result:Plank=3,
>     Time:230.0,
> }
> ```"

## Context That Helps

### Always Include

1. **Game and version:** "Project Zomboid Build 41"
2. **File type:** "script file (.txt)" or "Lua file"
3. **Module:** "using module Base" or "custom module MyMod"

### Include When Relevant

1. **Your skill level:** "I'm a beginner" helps AI calibrate explanations
2. **What you've tried:** "I tried X but got error Y"
3. **Similar vanilla content:** "Like the vanilla Axe but..."
4. **What you don't want:** "No Lua required" or "Server-side only"

## Providing Examples

AI learns from examples. Always include relevant vanilla code:

**Prompt:**
> "Create a food item similar to this vanilla example but for a custom pizza:
> ```
> item Apple {
>     DisplayCategory = Food,
>     Type = Food,
>     DisplayName = Apple,
>     Icon = Apple,
>     Weight = 0.2,
>     HungerChange = -10,
>     ThirstChange = 5,
>     Calories = 52,
>     Carbohydrates = 14,
>     Proteins = 0,
>     Lipids = 0,
> }
> ```
> 
> My pizza should restore more hunger, have cheese nutrients, and be heavier."

The AI now knows exactly what format to follow and what properties to adjust.

## Asking for Explanations

Don't just ask for code - ask for understanding:

**Instead of:**
> "Give me the code"

**Try:**
> "Give me the code and explain each property so I can modify it later"

**Or:**
> "Write the code with comments explaining what each line does"

## Iterating Effectively

### When Something Doesn't Work

**Bad:**
> "It doesn't work"

**Good:**
> "When I load this in PZ, I get this error in console.txt:
> ```
> ERROR: ScriptModule.CreateFromToken> Unknown item type: MyMod.CustomSword
> ```
> Here's my full item script: [paste code]
> 
> What's wrong?"

### When You Need Changes

**Bad:**
> "Make it better"

**Good:**
> "This works but I need two changes:
> 1. Increase the damage from 1.5 to 2.5
> 2. Add a sound effect when swinging
> 
> Which properties control these?"

## Prompt Templates

### For New Items

```
In Project Zomboid Build 41, create a script item definition for [item name].

Item properties:
- Type: [Normal/Weapon/Food/etc]
- Weight: [number]
- [Other specific properties]

Based on vanilla item: [similar vanilla item]
Module: Base (or custom)
Output format: script file (.txt)
```

### For New Recipes

```
Create a PZ Build 41 recipe script for [recipe name].

Ingredients:
- [item1] x[quantity]
- [item2] (kept/destroyed)

Result: [output item]
Time: [time units]
Category: [Cooking/Carpentry/etc]

Additional requirements:
- [skill requirements]
- [XP rewards]

Module: Base
Format: script file (.txt)
```

### For Debugging

```
I'm getting this error in PZ Build 41:

[paste full error message]

Here's my code:

[paste your code]

What's causing this error and how do I fix it?
```

### For Understanding Vanilla

```
Explain this vanilla PZ code line by line. I'm a beginner modder.

[paste code]

Specifically, I don't understand:
1. [specific confusion]
2. [specific confusion]
```

## Common Mistakes

### Being Too Vague

❌ "Make a mod"  
✓ "Create a script file that adds a crowbar item in Build 41"

### No Version Specified

❌ "PZ recipe syntax"  
✓ "PZ Build 41 recipe syntax"

### No Format Specified

❌ "Create an item"  
✓ "Create an item definition in script file format (.txt)"

### Asking Multiple Things at Once

❌ "Make an item, recipe, and Lua script for a new weapon system"  
✓ Start with one: "First, create the item definition for the weapon"

## Key Takeaways

1. **Use CERC** - Context, Example, Request, Constraints
2. **Be specific** - Version, format, module, file type
3. **Include examples** - Paste vanilla code you want to match
4. **Include errors** - Full error messages help AI debug
5. **Iterate** - Refine prompts based on results
6. **Ask for explanations** - Understanding beats copy-paste
