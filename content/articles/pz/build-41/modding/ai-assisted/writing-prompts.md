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
  - text: "What Makes a Good Prompt?"
    link: "#what-makes-a-good-prompt"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Your First Good Prompt"
    link: "#your-first-good-prompt"
  - text: "The CERC Framework"
    link: "#the-cerc-framework"
  - text: "Context That Helps"
    link: "#context-that-helps"
  - text: "Providing Examples"
    link: "#providing-examples"
  - text: "Asking for Explanations"
    link: "#asking-for-explanations"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Iterating Effectively"
    link: "#iterating-effectively"
  - text: "Prompt Templates"
    link: "#prompt-templates"
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

> Learn how to write AI prompts that produce useful, accurate code instead of frustrating guesses.

---

## What Makes a Good Prompt?

You open ChatGPT and type: "Make me a sword item."

AI gives you this:

```
item Sword {
    name = "Sword",
    damage = 50,
    weight = 2,
}
```

You test it. Nothing works. The properties don't exist in PZ. The syntax is wrong. You try again: "Make a sword for Project Zomboid." AI generates similar broken code.

After five rounds of this, you wonder if AI is even useful for modding.

Now imagine typing this instead:

```
In Project Zomboid Build 41, create a script file item definition for a katana sword.

Use this vanilla weapon as a template:
[paste Base.BaseballBat definition]

The katana should:
- Have higher damage than the baseball bat
- Be two-handed like the baseball bat
- Have lower durability (breaks faster)

Follow the exact property names from the template.
```

AI generates perfect code on the first try because you gave it everything it needed: the game version, an example to follow, specific requirements, and clear constraints.

When I first started using AI for modding, I got frustrated constantly. "It keeps giving me wrong code!" Then someone showed me how to structure prompts properly, and suddenly AI became incredibly useful. The difference wasn't AI - it was how I asked.

Let me show you exactly how to write prompts that work, starting with the simplest possible example.

**You would use good prompts when:**
- AI keeps generating broken code
- You're not getting what you expected
- You want to learn while AI helps you
- You're working on something based on vanilla systems

---

## Prerequisites

Before this article, you should understand:
- How to use AI tools for modding ([AI Tools for Modding](./ai-for-modding))
- What a prompt is (the text you type to AI)

You don't need to know how to code - this article is about communication, not programming.

---

## Your First Good Prompt

Let's write the simplest possible good prompt. We'll create a custom food item.

### Bad Prompt (What Not to Do)

```
Make me a food item
```

**What happens:** AI guesses at property names. Might give you `nutrition = 50` or `hungerReduction = 10` - properties that don't exist in PZ.

---

### Good Prompt (What to Do)

```
I'm creating a mod for Project Zomboid Build 41.

Here's a vanilla food item showing the correct syntax:

item Apple {
    DisplayName = Apple,
    Type = Food,
    Weight = 0.2,
    HungerChange = -10,
    Icon = Apple,
}

Create a "Pizza" food item following this exact format.
The pizza should:
- Reduce hunger by 25 (more than apple's 10)
- Weigh 0.5 (heavier than apple)
- Use Icon = Pizza

Use the same property names as the apple example.
```

**What happens:** AI sees the correct syntax and follows it exactly. You get working code on the first try.

> **Key Takeaway**
> Good prompts give AI three things: context (what game/version), examples (correct syntax), and specifics (what you want). This prevents guessing.

---

## The CERC Framework

Use this structure for every prompt and you'll get consistent results:

| Element | Purpose | What to Include |
|---------|---------|----------------|
| **C**ontext | Set the scene | Game, version, your skill level |
| **E**xample | Show correct syntax | Vanilla code that works |
| **R**equest | State what you want | Specific requirements, clear goal |
| **C**onstraints | Set boundaries | What NOT to do, format requirements |

Let's see CERC in action:

### Example 1: Creating a Weapon

**Context:**
```
I'm modding Project Zomboid Build 41. I'm a beginner modder.
```

**Example:**
```
Here's a vanilla weapon showing the correct format:

item BaseballBat {
    MaxRange = 1.3,
    Type = Weapon,
    Weight = 2,
    MaxDamage = 1.2,
    MinDamage = 0.8,
    DisplayName = Baseball Bat,
    Icon = BaseballBat,
}
```

**Request:**
```
Create a "MetalPipe" weapon item.

Requirements:
- Same range as baseball bat (1.3)
- Less damage: MaxDamage = 0.9, MinDamage = 0.6
- Lighter: Weight = 1.5
- Follow the exact property structure above
```

**Constraints:**
```
Output format: Script file (.txt) format only, no Lua needed.
Module: Use module Base
```

**Complete Prompt:**
```
I'm modding Project Zomboid Build 41. I'm a beginner modder.

Here's a vanilla weapon showing the correct format:

item BaseballBat {
    MaxRange = 1.3,
    Type = Weapon,
    Weight = 2,
    MaxDamage = 1.2,
    MinDamage = 0.8,
    DisplayName = Baseball Bat,
    Icon = BaseballBat,
}

Create a "MetalPipe" weapon item.

Requirements:
- Same range as baseball bat (1.3)
- Less damage: MaxDamage = 0.9, MinDamage = 0.6
- Lighter: Weight = 1.5
- Follow the exact property structure above

Output format: Script file (.txt) format only, no Lua needed.
Module: Use module Base
```

AI will generate exactly what you need because each element gives it critical information.

---

## Context That Helps

Let's break down what context to include and why it matters.

### Always Include These

**1. Game and Version**
```
"Project Zomboid Build 41"
```

**Why:** PZ syntax changes between builds. Build 40 and Build 41 have different properties. AI needs to know which version's syntax to use.

---

**2. File Type**
```
"script file (.txt format)" or "Lua file (.lua format)"
```

**Why:** Script files use different syntax than Lua files. Script files have `item { }` and `recipe { }`. Lua files have functions and events.

---

**3. Module Name**
```
"using module Base" or "custom module MyMod"
```

**Why:** The module name determines how you reference items later. `Base.Axe` vs `MyMod.Axe`.

---

### Include When Relevant

**1. Your Skill Level**
```
"I'm a beginner" or "I'm intermediate"
```

**Why:** AI adjusts explanation complexity. Beginners get simpler explanations with more comments.

---

**2. What You Tried**
```
"I tried setting WeaponDamage = 50 but got an error"
```

**Why:** Helps AI understand what didn't work so it can explain why.

---

**3. Similar Vanilla Content**
```
"Like the vanilla Axe but with less durability"
```

**Why:** Gives AI a starting point. "Make it like X" is clearer than "make Y from scratch."

---

**4. What You Don't Want**
```
"No Lua required" or "Server-side only, no client code"
```

**Why:** Prevents AI from over-complicating. If you just need a simple item, say "script file only."

---

## Providing Examples

AI learns from patterns. When you paste vanilla code, AI matches those patterns exactly.

### Without Examples

**Prompt:**
```
Create a food item for a sandwich
```

**AI generates:**
```
item Sandwich {
    nutrition = 50,        -- Wrong property name
    fillsHunger = true,    -- Doesn't exist in PZ
    spoilTime = 5,         -- Not how spoiling works
}
```

**Problem:** AI guessed at property names and got them all wrong.

---

### With Examples

**Prompt:**
```
Create a food item for a sandwich.

Here's the vanilla apple showing correct syntax:

item Apple {
    DisplayName = Apple,      -- Name shown to player
    Type = Food,              -- Must be "Food" for edible items
    Weight = 0.2,             -- Inventory weight
    HungerChange = -10,       -- Negative = reduces hunger (good!)
    Icon = Apple,             -- Icon file reference
    DaysFresh = 6,            -- Days before starting to rot
    DaysTotallyRotten = 12,   -- Days until completely rotten
}

Make the sandwich:
- Reduce hunger by 20 (more than apple's 10)
- Weigh 0.4 (heavier than apple)
- Last 3 days fresh, 6 days until rotten
```

**AI generates:**
```
item Sandwich {
    DisplayName = Sandwich,      -- Player-visible name
    Type = Food,                 -- Edible item
    Weight = 0.4,                -- Heavier than apple as requested
    HungerChange = -20,          -- Reduces hunger by 20
    Icon = Sandwich,             -- Icon reference
    DaysFresh = 3,               -- Fresh for 3 days as requested
    DaysTotallyRotten = 6,       -- Rotten after 6 days
}
```

**Perfect!** AI matched the property names exactly because it saw the pattern.

---

## Asking for Explanations

Don't just get code - get understanding. This helps you learn and modify things later.

### Without Explanation Request

**Prompt:**
```
Give me the code for a recipe
```

**AI gives:**
```
recipe MakeBox {
    Plank=2,
    Nails=4,
    keep Hammer,
    Result:Box,
    Time:100.0,
}
```

You don't understand what `keep` means or why `Result` uses a colon but `Plank` uses equals.

---

### With Explanation Request

**Prompt:**
```
Give me the code for a recipe that makes a box from planks and nails.

Please explain each part so I understand:
- What "keep" does
- Why some lines use = and others use :
- What Time means (seconds? minutes?)
```

**AI gives:**
```
recipe MakeBox {
    Plank=2,        -- Need 2 planks (consumed in crafting)
    Nails=4,        -- Need 4 nails (consumed)
    keep Hammer,    -- Need hammer but DON'T consume it (that's what "keep" does)

    Result:Box,     -- What you get (uses : for results)
    Time:100.0,     -- How long it takes (in game time units, roughly 1 second)
}

Explanation:
- "=" for ingredients means "this many required"
- ":" for Result means "this is what you produce"
- "keep" means the item is required but not destroyed
- Time is in game time units (100.0 ≈ 100 seconds)
```

Now you understand the recipe and can modify it yourself next time.

---

## Common Mistakes

Let's look at the most common prompt mistakes and how to fix them.

### Mistake 1: Being Too Vague

❌ **Doesn't work:**
```
Make a mod
```

**What happens:** AI says "What kind of mod? What should it do?" You waste time going back and forth.

✅ **Works:**
```
Create a script file that adds a crowbar weapon item to Project Zomboid Build 41.

The crowbar should:
- Be a melee weapon
- Have medium damage
- Can open locked doors (if possible)
- Weight about 1.5

Output as a .txt script file using module Base.
```

**Why:** Specific requests get specific answers. AI knows exactly what to create.

---

### Mistake 2: No Version Specified

❌ **Doesn't work:**
```
How do PZ recipes work?
```

**What happens:** AI might give Build 40 syntax which doesn't work in Build 41, or mix versions.

✅ **Works:**
```
How do recipes work in Project Zomboid Build 41 specifically?

I want to understand:
- Basic recipe syntax
- How to use "keep" for tools
- How evolved recipes work (if they exist in Build 41)
```

**Why:** Different PZ builds have different syntax. Always specify your version.

---

### Mistake 3: No Format Specified

❌ **Doesn't work:**
```
Create an item
```

**What happens:** AI might give you Lua code when you wanted a script file, or vice versa.

✅ **Works:**
```
Create a weapon item definition in script file format (.txt) for Project Zomboid Build 41.

I need the item { } definition only, no Lua code.
```

**Why:** PZ has multiple file formats. Specify which one you need.

---

### Mistake 4: Asking Multiple Things at Once

❌ **Doesn't work:**
```
Make an item, a recipe for crafting it, distribution for where it spawns, and Lua code for special effects when used.
```

**What happens:** AI gets overwhelmed, gives incomplete answers, or produces code that doesn't integrate well.

✅ **Works:**
```
First request: "Create the weapon item definition"
[Get that working]

Second request: "Now create a recipe that crafts that weapon"
[Get that working]

Third request: "Now add distribution so it spawns in tool stores"
[And so on...]
```

**Why:** One thing at a time. Build step-by-step. Each step builds on the previous working code.

---

### Mistake 5: Not Including Error Messages

❌ **Doesn't work:**
```
It doesn't work
```

**What happens:** AI asks "What error did you get?" and you have to paste it in a follow-up message, wasting time.

✅ **Works:**
```
When I load this item in PZ Build 41, I get this console error:

ERROR: ScriptModule.CreateFromToken> Unknown item type: MyMod.CustomSword

Here's my complete item script:
[paste your code]

What's causing this error?
```

**Why:** Error messages tell AI exactly what's wrong. Without them, AI is guessing blindly.

---

## Try It Yourself

Let's practice writing a good prompt from scratch. This exercise takes about 10 minutes.

### Your Goal

Write a prompt that asks AI to create a custom recipe. We'll use CERC framework.

### Step 1: Gather Information

Before writing the prompt, answer these questions:

1. What do you want to create? "A recipe for a wooden chair"
2. What game/version? "Project Zomboid Build 41"
3. What inputs? "3 planks, 2 nails, a hammer"
4. What output? "1 wooden chair"
5. Any special requirements? "Hammer is not consumed, takes 120 time units"

### Step 2: Find an Example

Open your PZ installation and find a simple vanilla recipe. For example:

```
recipe Make Wooden Crate {
    Plank=4,
    Nails=8,
    keep Hammer,

    Result:Crate,
    Time:150.0,
    Category:Carpentry,
}
```

### Step 3: Write the Prompt Using CERC

**Context:**
```
I'm creating a mod for Project Zomboid Build 41.
I want to add a recipe for crafting a wooden chair.
```

**Example:**
```
Here's a vanilla recipe showing the correct format:

recipe Make Wooden Crate {
    Plank=4,
    Nails=8,
    keep Hammer,

    Result:Crate,
    Time:150.0,
    Category:Carpentry,
}
```

**Request:**
```
Create a recipe called "Make Wooden Chair" that:
- Uses 3 planks (consumed)
- Uses 2 nails (consumed)
- Requires a hammer (NOT consumed)
- Produces 1 WoodenChair
- Takes 120 time units
- Goes in the Carpentry category
```

**Constraints:**
```
Output format: Recipe script (.txt format)
Module: Base
Follow the exact syntax from the example above.
```

### Step 4: Combine Into Complete Prompt

Paste this into ChatGPT or Claude:

```
I'm creating a mod for Project Zomboid Build 41.
I want to add a recipe for crafting a wooden chair.

Here's a vanilla recipe showing the correct format:

recipe Make Wooden Crate {
    Plank=4,
    Nails=8,
    keep Hammer,

    Result:Crate,
    Time:150.0,
    Category:Carpentry,
}

Create a recipe called "Make Wooden Chair" that:
- Uses 3 planks (consumed)
- Uses 2 nails (consumed)
- Requires a hammer (NOT consumed)
- Produces 1 WoodenChair
- Takes 120 time units
- Goes in the Carpentry category

Output format: Recipe script (.txt format)
Module: Base
Follow the exact syntax from the example above.
```

### Step 5: Review AI's Response

AI should generate something like:

```
recipe Make Wooden Chair {
    Plank=3,           -- Need 3 planks (consumed)
    Nails=2,           -- Need 2 nails (consumed)
    keep Hammer,       -- Need hammer but don't consume it

    Result:WoodenChair,  -- Produces 1 wooden chair
    Time:120.0,          -- Takes 120 time units
    Category:Carpentry,  -- Shows up in Carpentry menu
}
```

### Step 6: Verify Success

You've successfully written a good prompt if:
- AI used correct syntax from your example
- All your requirements are met
- The code has comments explaining things
- You understand what each line does

**Optional Challenge:** Write another prompt asking AI to explain what would change if you wanted the recipe to require Carpentry skill level 2.

---

## Iterating Effectively

Sometimes your first prompt doesn't get exactly what you need. Here's how to iterate without starting over.

### When Something Doesn't Work

**Bad iteration:**
```
It doesn't work
```

**Good iteration:**
```
When I test this in PZ Build 41, I get this error:

ERROR: Unknown property 'weaponDamage' at line 5

Here's the code you generated:
[paste code]

I think the property name is wrong. What should it be instead of 'weaponDamage'?
```

**Why this works:** You're giving AI the error, the code, and a specific question. AI can fix the exact problem.

---

### When You Need Changes

**Bad iteration:**
```
Make it better
```

**Good iteration:**
```
This works great! But I need two small changes:

1. Increase the MaxDamage from 1.5 to 2.5
2. Make it heavier - change Weight to 3.0

Can you update just those two properties?
```

**Why this works:** Specific changes are easy for AI to make. "Better" is subjective and unclear.

---

### When You Don't Understand the Output

**Bad iteration:**
```
What does this mean?
```

**Good iteration:**
```
This code works, but I don't understand this line:

ConditionLowerChanceOneIn = 20,

What does "ConditionLowerChanceOneIn" mean?
Is 20 good or bad?
How does this affect gameplay?
```

**Why this works:** Pointing to specific parts you don't understand helps AI give focused explanations.

---

## Prompt Templates

Here are ready-to-use templates for common tasks. Fill in the [brackets] with your specifics.

### Template 1: Create New Item

```
In Project Zomboid Build 41, create a script file item definition for [item name].

Use this vanilla item as a template:
[paste similar vanilla item]

My item should:
- [Property 1 and value]
- [Property 2 and value]
- [Property 3 and value]

Follow the exact property names from the template.
Module: Base
Output: Script file (.txt) format
```

---

### Template 2: Create New Recipe

```
Create a PZ Build 41 recipe script for [recipe name].

Example recipe showing correct syntax:
[paste similar vanilla recipe]

Ingredients:
- [item1] x[quantity] (consumed/kept)
- [item2] x[quantity] (consumed/kept)

Result: [output item] x[quantity]
Time: [time units]
Category: [Cooking/Carpentry/etc]

Output: Recipe script (.txt) format
Module: Base
```

---

### Template 3: Debug Errors

```
I'm getting this error in PZ Build 41:

[paste complete error message from console.txt]

Here's the code that causes it:

[paste your complete code file]

What's causing this error and how do I fix it?
```

---

### Template 4: Explain Vanilla Code

```
I'm learning PZ Build 41 modding. Please explain this vanilla code line by line.

[paste code]

I'm confused about:
1. [specific thing you don't understand]
2. [another specific thing]

Please explain in beginner terms.
```

---

### Template 5: Modify Existing Code

```
I have this working PZ Build 41 code:

[paste your working code]

I want to change:
1. [Specific change 1]
2. [Specific change 2]

Which lines do I need to modify and what values should I use?
```

---

## Key Takeaways

1. **Use the CERC framework** - Context, Example, Request, Constraints give AI everything it needs
2. **Always specify version** - "Build 41" matters because syntax changes between versions
3. **Include vanilla examples** - AI matches patterns from examples instead of guessing
4. **Be specific** - "Create a crowbar weapon" beats "make a mod"
5. **Specify file format** - Script file (.txt) vs Lua file (.lua) have different syntax
6. **Ask for explanations** - Understanding helps you modify code later
7. **One thing at a time** - Build step-by-step instead of asking for everything at once
8. **Include error messages** - Complete errors help AI debug accurately

---

## What's Next?

- [AI for Debugging](./ai-debugging) - Use these prompting skills to debug errors effectively
- [Building a Context Library](./context-library) - Create a collection of vanilla examples to use in prompts
