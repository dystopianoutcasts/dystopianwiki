# Wiki Article Standards v3

> **The goal of this wiki is not to document everything - it's to help people become modders.**
>
> **The key insight:** Don't write *for* beginners. Write *as if you ARE* a beginner.

---

## The End Goal: Fluency

We're not just teaching people to copy-paste code. We're teaching them to **become modders** - people who can read other mods, understand vanilla code, ask good questions, and eventually help others.

**The vocabulary journey:**

| Stage | How We Write It |
|-------|-----------------|
| First encounter | "This is called a **callback** - a function that runs later when something happens" |
| Reinforcement | "The callback (the function that runs when clicked)..." |
| Natural use | "Your callback receives two parameters..." |
| Reader fluency | Reader can now use "callback" in their own questions and understand others |

**Target vocabulary** - By the time someone has read 5-10 of our articles, they should be comfortable with:
- callback, hook, event, listener
- module, namespace, scope
- instance, object, instantiate, initialize
- property, method, function, parameter
- parent, child, inherit
- client, server, shared

That's the goal: readers who can speak the language of modding.

---

## Our Goals

### 1. Help People Become Modders
We're not just explaining how to do things - we're creating modders who can solve their own problems, read other people's code, and eventually help others.

### 2. Build Technical Fluency Over Time
We want readers to eventually **speak the language** of programming. Terms like "callback," "hook," "instantiate," and "namespace" should become second nature to them.

**The approach:**
1. **First exposure:** Define the term in plain English with a game example
2. **Repetition:** Use the term again (with a brief reminder)
3. **Fluency:** Eventually use the term without explanation - they know it now

**Why this matters:** When they ask questions in Discord, read other mods, or watch tutorials, they'll understand the jargon. We're not dumbing things down permanently - we're building them up to fluency.

### 3. Create Confidence, Not Dependency
The ultimate success is a reader who no longer needs our wiki because they can:
- Read vanilla code and understand it
- Recognize patterns in unfamiliar code
- Debug their own mistakes
- Help other beginners

---

## Our Audience

### Who They Are

- **Gamers first, coders second** - They love Project Zomboid and want to add to it. They didn't start with "I want to learn Lua" - they started with "I want to add a cool weapon to my favorite game."

- **Self-taught learners** - Many have no formal programming background. They learn by doing, by copying, by breaking things and fixing them.

- **Learning programming through modding** - For many, this is their first real exposure to code. PZ modding might be the thing that turns them into a programmer.

- **Time-limited** - They're doing this for fun. They don't want to read a textbook - they want to make something cool tonight.

- **Scared but won't admit it** - They're worried they're "not smart enough" or "not a real programmer." They need permission to feel confused.

- **Easily discouraged** - One confusing article can make them give up. We're often the difference between "I made my first mod!" and "modding is too hard for me."

### Assume They Know

- How to play Project Zomboid
- What mods are (they've installed some)
- Basic computer skills (files, folders, text editors)

### Assume They DON'T Know

- Programming, Lua, or game engines
- What "syntax," "API," or "callback" means
- Why code has to be in specific folders
- What error messages mean

**They won't ask about these things because they're embarrassed. So we explain them without being asked.**

---

## Core Principles

### 1. Context Before Content

Never start with technical information. Always start with:
- **What is this thing?** (in plain English)
- **Why does it exist?** (what problem does it solve)
- **When would I use it?** (concrete scenarios)

**Bad:**
> ISButton is a class that inherits from ISPanel and provides clickable button functionality.

**Good:**
> You know those "OK" and "Cancel" buttons you click in PZ's menus? Those are ISButtons. When you want your mod to have clickable buttons, ISButton is how you create them.

### 2. Ground in Game Experience

Connect every concept to something the reader has experienced while playing.

| Instead of... | Say... |
|---------------|--------|
| "TimedActions are queued player actions" | "When your character bandages a wound and you see that progress bar - that's a TimedAction" |
| "Events are callback hooks" | "You know how zombies react when you make noise? The game uses Events to make that happen" |
| "ModData persists across saves" | "Ever notice how your skills save when you quit? ModData lets your mod remember things the same way" |

### 3. Simplest Thing First

Start with the absolute minimum that works. Build complexity gradually.

**Bad:** Show a "complete, production-ready" 30-line example first.

**Good:** Show 3 lines that work, then add features one at a time.

### 4. Explain Every Line (And Every Symbol)

For introductory content, don't leave any line unexplained:

```lua
-- Load the button library (PZ needs this to know what ISButton is)
require "ISUI/ISButton"

-- Create a button at position x=10, y=10
-- Size: 100 pixels wide, 30 pixels tall
-- "Click Me" is the text on the button
local button = ISButton:new(10, 10, 100, 30, "Click Me", self, self.onButtonClick)
```

**Explain symbols too:**

| Symbol | Meaning |
|--------|---------|
| `.` | "Possession" - `Base.Katana` means the Katana that belongs to Base |
| `{}` | "Content container" - everything between these braces belongs together |
| `=` | "Assignment" - this property gets this value |
| `:` | "Method call" - calling a function that belongs to something |
| `--` | "Comment" - the game ignores this, it's just for humans |

### 5. Tell Them Where It Goes (With Obvious Details)

Always include:
- The file path where code should be saved
- Which folder (client/server/shared) and why
- What the file should be named

```
MyMod/
├── mod.info
└── media/
    └── lua/
        └── client/             ← UI code goes here
            └── MyButtonMod.lua

Why "client"? Buttons are visual - they only exist on
the player's screen, not on the server.
```

Include "obvious" details that help beginners navigate:
- "It's alphabetical, so it'll be in the M's"
- "If your Steam is installed somewhere else, navigate there instead"

### 6. Anticipate Failure (And Explain Consequences)

Show what goes wrong and how to fix it:

```lua
-- WRONG: Missing comma
local button = ISButton:new(10, 10, 100 30, "Click")
--                                    ^ Error!

-- RIGHT: Commas separate parameters
local button = ISButton:new(10, 10, 100, 30, "Click")
```

**Always explain what happens when things break:**
- "If you forget the comma, you'll see: `unexpected symbol near '30'`"
- "If the script has errors, PZ will silently skip it - your mod just won't work"
- "If the path is wrong, the game won't find your file and nothing will happen"

### 7. Give Them a Win

Every article should enable the reader to DO something that works.

> **Try it:** Change the button text to your name. Save, restart PZ, and see your button.

Small wins build confidence. Big wins come later.

---

## NEW: Emotional Scaffolding

### Acknowledge the Overwhelm

When showing something complex, **name the reaction** before diving in:

**The 4-Step Pattern:**
1. **Acknowledge** - "This looks like a lot. That's because it is."
2. **Promise** - "But if we take it one piece at a time..."
3. **Prove** - Break it down with explanations
4. **Summarize** - "That's all there is to it: [pattern]"

**Example:**
> This file has 40 properties. If you're feeling overwhelmed, that's normal - I felt the same way when I first saw it. But here's the thing: you don't need to understand all of them. Let's focus on the 5 that actually matter for what we're doing.

### Use "We" and "Let's"

Write collaboratively, not instructionally:

| Instead of... | Say... |
|---------------|--------|
| "You need to understand X" | "We need to understand X" |
| "Create a new file" | "Let's create a new file" |
| "Look at this code" | "Let's look at what this means" |
| "This section explains..." | "Let's break this down..." |

### Show Solidarity (The "I Remember" Technique)

Share your own journey when appropriate:

- "When I first saw this file, I wanted to close it immediately."
- "I spent hours confused by this before it clicked."
- "That was just me? Okay, moving on then."
- "At least for me, this was the hardest part."

This isn't about you - it's about showing that confusion is a normal part of the journey, not a sign of inadequacy.

### Use "I" for Personal Experience

You're not writing a textbook. You're a modder helping another modder.

- "I hope this helps!"
- "I will take the liberty of grouping things in a way that makes sense to me"
- "At least for me, this was confusing at first"
- "Let's not talk about that then. Moving on..."

### Give Permission

Many beginners are afraid to deviate from examples. Explicitly tell them they can:

**Permission to organize:**
- "This is how I organize it - you can do whatever makes sense to you."
- "There's no 'right' way to order these properties."
- "These groups I made up are nothing official."

**Permission to not understand:**
- "You don't need to memorize all of this right now."
- "It's okay to copy-paste for now and understand later."
- "You can always come back to this section."

**Permission to experiment:**
- "Try changing this value and see what happens."
- "Break it on purpose - you'll learn more that way."
- "Your mod, your rules."

### Rhythm of Reassurance

Don't clump all your empathy at the start. Distribute it throughout.

**Add reassurance after:**
- Any code block over 10 lines
- Any list of 5+ items
- Any section introducing new terminology
- Before saying "now let's go deeper"

The reader should never go more than 2-3 paragraphs without hearing "this is okay" or "let's take this one piece at a time."

### Use Vivid, Physical Metaphors

Don't say: "This might be a lot of information."
Do say: "This is like drinking from a firehose."

Physical, visceral metaphors land better than abstract ones:
- "Russian nesting dolls" (not "nested structures")
- "A container that holds things" (not "an encapsulation mechanism")
- "Like a recipe - ingredients on top, result at bottom" (not "declarative syntax")
- "Ownership - the Katana belongs to Base" (not "namespaced reference")

---

## NEW: Pattern Teaching

### Five Learning Patterns

Use these structures for different teaching situations:

**Pattern 1: Concept → Example → Breakdown → Practice**
```markdown
## What is [Thing]?
[Plain English + game connection]

## See It In Action
[Simplest code example]

## How It Works
[Line-by-line breakdown]

## Try It Yourself
[Modification exercise]
```

**Pattern 2: Problem → Solution → Why**
```markdown
## The Problem
You want to [goal], but [obstacle].

## The Solution
[Code that solves it]

## Why This Works
[Explanation]
```

**Pattern 3: Build Up Gradually**
```markdown
## Version 1: The Basics
[Minimal code - 5 lines]

## Version 2: Adding [Feature]
[Previous + new feature]

## Version 3: Making It [Better]
[Previous + improvement]
```

**Pattern 4: Mistake → Fix → Consequence**
```markdown
### Common Mistake: [Description]

❌ **Doesn't work:**
[Broken code]

**What you'll see:** [Error message or symptom]

✅ **Works:**
[Fixed code]

**Why:** [Explanation]
```

**Pattern 5: Overwhelm → Acknowledge → Break Down**
```markdown
[Show complex thing]

This looks like a lot. If you're feeling overwhelmed, that's normal.

Let's break it down piece by piece:
[Systematic breakdown]

**Key Takeaway:** [Summary of the pattern]
```

### The 4-Step Complex Section Template

When explaining anything complex:

1. **Acknowledge the overwhelm** - "This looks like a lot."
2. **Promise it's manageable** - "But if we take it one piece at a time..."
3. **Prove it step by step** - Break it down with explanations
4. **Summarize the pattern** - "That's all there is to it: [pattern]"

Step 4 is critical - it closes the loop and gives the reader something to remember.

### Repeat Patterns 3+ Times Within an Article

Core concepts should appear multiple times in the SAME article:
1. First introduction (prose explanation)
2. Annotated example (visual breakdown)
3. Different context (another application)
4. Summary statement ("That is the pattern: ...")

**Example from the sample article - the declaration pattern appears:**
- First when explaining modules
- Then when showing items inside modules
- Then with a fully annotated visual
- Then summarized: "That is the pattern: declaration, name, opening curly brace, content, closing curly brace"

Repetition isn't redundancy - it's reinforcement.

### Mid-Article Key Takeaway Boxes

Add summary boxes WITHIN sections, not just at the end:

> **Key Takeaway**
> This pattern of declaration, name, and content container is what
> we'll use in all our .txt scripts.

Place these after any explanation that took more than 3 paragraphs. They give readers a checkpoint - confirmation they understood correctly.

### Signposting / Road-mapping

Tell readers where you're going, especially before tangents:

**Before a tangent:**
- "Before we can do X, we need to understand Y."
- "We'll cover this in detail later. For now, just know that..."
- "This will make more sense after the next section - trust me."

**Between major sections:**
- "Now that we understand X, let's see how Y fits in."
- "With that foundation, we can finally look at..."

**Returning to the main thread:**
- "So, let's open [file] again and take another look."
- "Back to our main topic..."

This prevents readers from feeling lost when you pause the main thread to explain something foundational.

---

## NEW: Build Technical Vocabulary

### The Vocabulary Progression

Use real technical terms - but introduce them properly. The goal is fluency, not avoidance.

**Bad:** Avoid jargon entirely
> "the function that runs when you click"

**Also Bad:** Use jargon without explaining
> "the onClick callback"

**Good:** Introduce the term with a definition, then use it
> "the **callback** (a function that runs later when something happens) - in this case, it runs when you click the button"

### Pattern for Introducing Terms

```markdown
When you click the button, PZ runs a **callback** - that's programmer-speak for
"a function that gets called later when something happens." You'll see this term
everywhere in modding, so let's get comfortable with it.
```

**The formula:** Term in bold → plain English definition → why they should know it

### "Why is it called that?"

Help terms stick by explaining their etymology:

> Why is it called a "declaration"? Because when you type `module` or `item`, you're *declaring* to the game engine: "Hey! I'm about to tell you about a module/item." The word declares your intent.

### The Progression Across Articles

| Stage | How We Write It |
|-------|-----------------|
| First mention | "a **callback** (a function that runs later when something happens)" |
| Second mention | "the callback function (remember: the function that runs when the button is clicked)" |
| Third mention | "the callback function" |
| Later articles | "the callback" - they know what this means now |

This isn't dumbing down. It's building up.

---

## NEW: Define Everything

### Terms That Seem Obvious (But Aren't)

Define these even if they seem basic:

| Term | Define It |
|------|-----------|
| module | "A named group that prevents naming conflicts - like a folder for organizing related items" |
| declaration | "The keyword that tells the game what type of thing you're defining" |
| property | "A characteristic or setting - like 'MaxDamage' or 'DisplayName'" |
| parameter | "A value you pass into a function - the stuff inside the parentheses" |
| return | "What a function gives back when it's done" |

### Symbol Explanation Table

Include when relevant:

| Symbol | Meaning |
|--------|---------|
| `.` | "Possession" - `Base.Katana` means the Katana that belongs to Base |
| `{}` | "Content container" - everything between these braces belongs together |
| `=` | "Assignment" - this property gets this value |
| `:` | "Method call" - calling a function that belongs to something |
| `()` | "Function call" - run this function, optionally with values inside |
| `,` | "Separator" - separates items in a list |
| `--` | "Comment" - the game ignores this, it's just for humans |

### Include "Obvious" Navigation Details

- "It's alphabetical, so it'll be in the M's"
- "If your Steam is installed somewhere else, navigate there instead"
- "You can scroll manually, but I recommend Ctrl+F"
- "The file will be in the same folder we looked at earlier"

These details seem unnecessary to experts but prevent confusion for beginners.

---

## NEW: Reorganize for Teaching

When showing vanilla code or complex data, **don't just dump it** - reorganize it for learning.

**Bad:** Show the vanilla Katana with 40 properties in random order.

**Good:**
> The vanilla file has these properties in a jumbled order. That's fine for the game, but hard for us to read. Remember: **the order doesn't matter to PZ**, so I'll reorganize them into logical groups:

```lua
item Katana
{
    /* Display Properties */
    DisplayName = Katana,
    DisplayCategory = Weapon,
    Icon = Katana,

    /* Combat Stats */
    MinDamage = 0.8,
    MaxDamage = 1.3,
    BaseSpeed = 1.0,
    CriticalChance = 30,

    /* Durability */
    MaxCondition = 15,
    ConditionLowerChance = 2,
    ...
}
```

**Always explain and give permission:**
- "These groups I made up are nothing official"
- "You can organize your own items however makes sense to you"
- "The order doesn't matter to PZ, so I'll reorganize for clarity"

---

## Voice and Tone

### Be Conversational

| Don't say | Say |
|-----------|-----|
| "One must ensure that..." | "Make sure you..." |
| "It is necessary to..." | "You need to..." |
| "Instantiate the object" | "Create the button" |
| "The aforementioned..." | "The [thing] we talked about..." |

### Be Encouraging (But Not Dismissive)

**Good:**
- "This part is tricky at first - don't worry if it takes a few tries."
- "If this seems confusing, you're not alone."
- "You just created your first X - that's a real accomplishment!"

**Bad:**
- "This is easy, just do X." (dismisses their struggle)
- "Simply add the following..." (nothing is "simple" to a beginner)
- "Obviously, you need to..." (implies they should already know)

### Use Self-Deprecating Humor (Sparingly)

> And then close it, cry a little, and feel completely overwhelmed…. No? That was just me.

This builds trust by showing you're human, not an unapproachable expert.

### Use "Note:" for Tangents

When you have useful but tangential information:

> **Note:** Lua is a programming language that The Indie Stone (PZ dev company) chose to build the public-facing game on. You don't need to know Lua history to mod, but it helps explain why things work the way they do.

This lets curious readers learn more without interrupting the main flow.

---

## When to Split an Article

### Split When You See

1. **Multiple "But first..." moments** - Prerequisites should be separate articles
2. **10+ TOC entries** - Too overwhelming to scan
3. **Mixed skill levels** - Beginner and advanced content together
4. **Reader only needs half** - If someone wants "buttons" but has to scroll past "text inputs"
5. **More than 15 minutes to read** - Too long for one session

### The Split Rule

**One article = One concept or one task**

| Instead of... | Split into... |
|---------------|---------------|
| "Complete ISUI Guide" | "What is ISUI?", "Your First Window", "ISButton Guide" |
| "TimedAction Reference" | "What Are TimedActions?", "Your First TimedAction", "TimedAction Reference" |
| "All About Items" | "Item Basics", "Food Items", "Weapon Items" |

**Note:** Comprehension beats brevity. A longer article that the reader understands is better than a short one that leaves them confused. Split for organization, not just length.

---

## Article Template

```markdown
# [Article Title]

> [One-sentence summary of what the reader will learn]

---

## What Is [Topic]?

[One sentence in plain English]

[Connection to in-game experience the reader knows]

**You would use this when:** [Concrete use cases]

---

## Prerequisites

Before this article, you should understand:
- [Link to prerequisite 1]
- [Link to prerequisite 2]

---

## The Simplest Example

[Minimum code that works - aim for under 10 lines]

**Line by line:**

| Line | What It Does |
|------|--------------|
| `require "..."` | Loads the library |
| ... | ... |

> **Key Takeaway:** [One sentence summary]

---

## Where Does This Go?

[File path diagram]

**Why this folder?** [Explain client/server/shared]

---

## What Happens When You Run It

1. The game loads your mod
2. [Step 2]
3. You see [expected result]

**Try it:** [Specific test steps]

---

## Building On The Basics

### Adding [Feature 1]

[Code with new feature highlighted]

### Adding [Feature 2]

[Code with another feature]

---

## Common Mistakes

### Mistake: [Problem]

❌ **Doesn't work:**
[Broken code]

**What you'll see:** [Error message or symptom]

✅ **Works:**
[Fixed code]

**Why:** [Explanation]

---

## Key Takeaways

1. **[Point 1]** - [One sentence]
2. **[Point 2]** - [One sentence]
3. **[Point 3]** - [One sentence]

---

## What's Next?

- [Next Article](path) - [Why they'd read it]
- [Related Article](path) - [When they'd need it]
```

---

## Article Types (with Warmth Levels)

| Type | Purpose | Warmth Level | Notes |
|------|---------|--------------|-------|
| **Tutorial** | Walk through creating something | HIGH | First exposure - lots of reassurance and checkpoints |
| **Concept** | Explain an idea or system | MEDIUM | Some scaffolding, focus on "why" explanations |
| **Reference** | Look up specific info | LOW | Can be more technical - readers are looking things up |
| **Guide** | Understand how a system works | MEDIUM-HIGH | System overview - acknowledge complexity |

Reference articles CAN be drier. Tutorials MUST be warm.

---

## Quality Checklist v3

Before publishing, verify:

### Context
- [ ] Opening explains what this is in plain English
- [ ] Connected to in-game experience
- [ ] Reader knows why they'd care
- [ ] Prerequisites linked (not explained inline)

### Examples
- [ ] First example is the simplest possible
- [ ] Every line is explained
- [ ] Reader can copy-paste and it works
- [ ] Code builds up gradually (Version 1, 2, 3)

### Practical
- [ ] File path is shown with diagram
- [ ] Folder choice is explained (client/server/shared)
- [ ] "Try it" verification step exists
- [ ] "Obvious" navigation details included

### Errors
- [ ] Common mistakes shown with wrong/right code
- [ ] "What you'll see" describes error symptoms
- [ ] Consequences of mistakes explained
- [ ] Troubleshooting included

### Definitions (NEW)
- [ ] All technical terms defined on first use
- [ ] Symbols explained (., {}, =, etc.) where relevant
- [ ] "Why is it called that?" for key terms
- [ ] Terms used again with brief reminders

### Vocabulary Building (NEW)
- [ ] Uses real technical terms (callback, hook, etc.)
- [ ] Defines terms with plain English + example
- [ ] Reminds reader of meaning on second use
- [ ] Builds toward fluency, not avoidance

### Emotional Scaffolding (NEW)
- [ ] Overwhelm acknowledged when showing complex things
- [ ] Uses "we" and "let's" (collaborative tone)
- [ ] Includes at least one "I remember..." moment
- [ ] Permission given to feel confused / do things their way
- [ ] Reassurance distributed throughout (not just at start)
- [ ] Uses vivid physical metaphors

### Pattern Teaching (NEW)
- [ ] Explicitly names patterns when they appear
- [ ] Pattern repeated 3+ times in different forms
- [ ] Mid-article Key Takeaway boxes after complex sections
- [ ] Signposts before tangents
- [ ] 4-step complex section template used (acknowledge → promise → prove → summarize)

### Organization (NEW)
- [ ] Complex data reorganized for learning (not raw dumps)
- [ ] Explains that reorganization is allowed
- [ ] Section dividers (`---`) for visual structure

### Structure
- [ ] Focused on one concept/task
- [ ] Length appropriate for type (comprehension > brevity)
- [ ] Could any section be its own article?

---

## Phrase Libraries (Quick Reference)

### Acknowledging Overwhelm

- "This looks like a lot. That's because it is."
- "If you're feeling overwhelmed, that's normal."
- "This is like drinking from a firehose."
- "And then close it, cry a little, and feel completely overwhelmed... No? That was just me."
- "If this is clear as mud, that's okay."
- "We all started there."
- "This looks scary. It's not - but it looks scary."

### Promising Manageability

- "But if we take it one piece at a time..."
- "Let's slow down and look at this one line at a time."
- "It's not as intimidating as it might seem at first."
- "Let's break this down."
- "Once you see the pattern, it becomes simple."
- "There's actually less here than it looks like."

### Personal Warmth

- "I hope this helps!"
- "At least for me, this was the confusing part."
- "When I first saw this, I wanted to close the file and pretend it didn't exist."
- "Let's not talk about that then. Moving on..."
- "Take your time with this one."
- "This will make more sense once you try it."

### Permission-Giving

- "This is how I organize it - you can do whatever makes sense to you."
- "There's no 'right' way to order these."
- "These groups I made up are nothing official."
- "You don't need to memorize all of this right now."
- "It's okay to copy-paste for now and understand later."
- "Break it on purpose - you'll learn more that way."

### Signposting

- "Before we can do X, we need to understand Y."
- "We'll cover this in detail later. For now, just know that..."
- "Now that we understand X, let's see how Y fits in."
- "So, let's open [file] again and take another look."

---

## The Philosophy

> **The published version is written FOR beginners.**
> **Your version should be written AS IF YOU ARE a beginner.**

The difference is empathy translated into word count. Don't trust that the reader understood - over-explain, repeat, visualize, and validate. This is not padding; it's pedagogy.

> **They're not stupid. They're just new. Treat them accordingly.**

Write for the person who's about to give up. Write the article that keeps them going.

Every person reading our wiki could become a modder who creates something amazing. Our job is to make sure confusion doesn't stop them.
