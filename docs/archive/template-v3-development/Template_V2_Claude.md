# Wiki Article Standards - Template V2

> **The goal of this wiki is not to document everything - it's to help people become modders.**
>
> **The key insight:** Don't write *for* beginners. Write *as if you ARE* a beginner.

---

## The End Goal: Fluency

We're not just teaching people to copy-paste code. We're teaching them to **become modders** - people who can:

- Read other people's code and understand it
- Ask questions in Discord using the right terminology
- Search documentation effectively
- Eventually help other beginners

**This means we teach proper terminology - but we teach it gently.**

### The Vocabulary Journey

1. **First encounter:** Plain English with the term in parentheses
   > "When the button is clicked, it runs a function you specify - this is called a **callback** (code that gets 'called back' when something happens)."

2. **Repeated use:** Use the term naturally, with brief reminders
   > "The callback function receives the button as a parameter..."
   > "Remember, callbacks run when the event happens, not immediately."

3. **Eventual fluency:** Reader recognizes and uses the term themselves
   > They can now search for "PZ callback examples" or ask "how do I pass data to my callback?"

### Why This Matters

If we only use plain English and never introduce terms like "callback," "hook," "event," or "instance," our readers will be lost when they:
- Read vanilla PZ code (which uses these terms)
- Ask for help in modding communities
- Search for solutions online
- Read other tutorials or documentation

**We're not dumbing things down permanently. We're scaffolding toward fluency.**

### The Pattern

Every technical term should follow this pattern across our wiki:

| Stage | How We Write It |
|-------|-----------------|
| **Introduction** | "This is called a **callback** - a function that runs later when something happens" |
| **Reinforcement** | "The callback (the function that runs when clicked)..." |
| **Natural use** | "Your callback receives two parameters..." |
| **Reader fluency** | Reader can now use "callback" in their own questions and code |

By the time someone has read 5-10 of our articles, they should be comfortable with terms like:
- Callback, hook, event
- Module, namespace
- Instance, object
- Property, value, parameter
- Client, server, shared

**That's the goal: readers who can speak the language of modding.**

---

## Our Audience

### Who They Are

- **Gamers first, coders second** - They love Project Zomboid and want to add to it. They didn't start with "I want to learn Lua" - they started with "I want to add a cool weapon to my favorite game."

- **Self-taught learners** - Many have no formal programming background. They learn by doing, by copying, by breaking things and fixing them.

- **Learning programming through modding** - For many, this is their first real exposure to code. PZ modding might be the thing that turns them into a programmer.

- **Time-limited** - They're doing this for fun. They don't want to read a textbook - they want to make something cool tonight.

- **Easily discouraged** - One confusing article can make them give up. We're often the difference between "I made my first mod!" and "modding is too hard for me."

- **Embarrassed to ask** - They won't admit they don't know what a "namespace" is. They'll just leave.

### Assume They Know

- How to play Project Zomboid
- What mods are (they've installed some)
- Basic computer skills (files, folders, text editors)

### Assume They Don't Know

- Programming, Lua, or game engines
- What "syntax," "API," "callback," or "namespace" means
- Why code has to be in specific folders
- What error messages mean
- What symbols like `.`, `{}`, `=`, or `:` mean in code
- Why things are named the way they are

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

**Good:** Show 3-5 lines that work, then add features one at a time.

### 4. Explain Every Line (And Every Symbol)

For introductory content, don't leave any line unexplained. This includes:
- What the code does
- Why it's written that way
- What symbols mean (`.`, `{}`, `=`, `:`)

```lua
-- Load the button library (PZ needs this to know what ISButton is)
require "ISUI/ISButton"

-- Create a button at position x=10, y=10
-- Size: 100 pixels wide, 30 pixels tall
-- "Click Me" is the text on the button
-- self = the panel this button belongs to
-- self.onButtonClick = function to run when clicked
local button = ISButton:new(10, 10, 100, 30, "Click Me", self, self.onButtonClick)
```

**For notation, explain it in plain English:**

> The period in `Base.Katana` is a way of signifying possession - everything to the right of the `.` belongs to the module on the left. So `Base.Katana` means "the Katana that belongs to the Base module."

### 5. Tell Them Where It Goes (With Obvious Details)

Always include:
- The file path where code should be saved
- Which folder (client/server/shared) and why
- What the file should be named
- **"Obvious" navigation details** that prevent confusion

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

**Include obvious details:**
> The `media` folder is alphabetical, so it'll be in the M's. If you installed Steam somewhere other than the default location, navigate to your Steam folder and follow the same path from there.

### 6. Anticipate Failure (And Explain Consequences)

Show what goes wrong, what happens when it goes wrong, and how to fix it:

```lua
-- WRONG: Missing comma
local button = ISButton:new(10, 10, 100 30, "Click")
--                                    ^ Error!

-- What happens: The game won't load your mod. You'll see an error
-- in console.txt that says something about "unexpected number".

-- RIGHT: Commas separate parameters
local button = ISButton:new(10, 10, 100, 30, "Click")
```

**For every rule, explain the failure mode:**
> If your module name has spaces, the entire .txt script will NOT work. It will simply be skipped by the engine and it will be as though it does not exist. No error message - it just won't load.

### 7. Give Them a Win

Every article should enable the reader to DO something that works.

> **Try it:** Change the button text to your name. Save, restart PZ, and see your button.

---

## NEW: Emotional Scaffolding

### Acknowledge Overwhelm

When showing something complex (large code blocks, many properties, dense information), **name the reader's likely reaction** and validate it:

**Do this:**
> This might look overwhelming at first - that's completely normal. If you're feeling like you're drinking from a firehose, that's okay. We all started there. Let's take it one line at a time.

**Also good:**
> "If this is clear as mud, that's okay."
> "Don't worry if this doesn't click immediately - it will make more sense as we go."

**Why this works:** Beginners don't trust "this is easy" from experts. They trust "I remember being confused too."

### Use Self-Deprecating Humor

Shows you're human and builds trust:

> And then close the file, cry a little, and feel completely overwhelmed... No? That was just me. Okay, let's not talk about that then.

### Promise Manageability, Then Prove It

The pattern: **Acknowledge the overwhelm** → **Promise it's manageable** → **Prove it step by step**

> This looks like a lot of properties. That's because it is. But here's the thing - you don't need to understand all of them right now. Let's focus on just three: Type, DisplayName, and Weight. Those three lines are enough to create a working item.

---

## NEW: Pattern Teaching

### Name Patterns Explicitly

Don't just show how something works - identify the underlying pattern and state it clearly:

```
module Base   ← declaration
{             ← opening brace
    item Katana   ← nested declaration
    {             ← opening brace
        ...       ← content
    }             ← closing brace
}             ← closing brace

That is the pattern: declaration, name, opening brace, content, closing brace.
If the content has declarations inside of it, we simply nest that pattern
(like Russian nesting dolls) inside of it. That's it.
```

### Repeat Core Concepts 3+ Times

Important patterns should appear multiple times in different forms:

1. **First introduction** - Explain it
2. **Visual/annotated example** - Show it with labels
3. **Summary statement** - "That is the pattern: ..."

Each repetition adds a new angle or visualization.

### Use Memorable Metaphors

- "Like Russian nesting dolls" (for nested structures)
- "Like a container that holds items" (for modules)
- "Like a recipe - ingredients on top, result at bottom" (for script structure)

---

## NEW: Define Everything

**Remember:** We define terms not to avoid them, but to **teach** them. The goal is fluency - readers who can eventually use these terms themselves. (See "The End Goal: Fluency" above.)

### Terms That Seem Obvious (But Aren't)

Define these even if they feel basic:

| Term | Define It |
|------|-----------|
| module | "A named group that prevents naming conflicts - like a folder for your items" |
| declaration | "The keyword that tells the game what type of thing you're defining" |
| property | "A setting that controls one aspect of an item (like its weight or damage)" |
| value | "What you set the property to (the number or text after the `=` sign)" |
| namespace | "A way to group things so two mods can have items with the same name without conflict" |

### Symbols and Notation

Explain what symbols mean in plain English:

| Symbol | Meaning |
|--------|---------|
| `.` | "Possession - `Base.Katana` means the Katana that belongs to Base" |
| `{}` | "Content container - everything between these braces belongs together" |
| `=` | "Sets a property to a value (in .txt scripts)" |
| `:` | "Sets a property to a value (in recipes)" |
| `--` | "Comment - the game ignores everything after this on the same line" |

### Why Things Are Named That Way

> Why is it called a "declaration"? Because when you type `module` or `item`, you're *declaring* to the game engine: "Hey! I'm about to tell you about a module/item." The word declares your intent.

---

## NEW: Reorganize for Teaching

### Don't Just Dump Raw Data

When showing vanilla code or large examples:

1. **Show it as they'll encounter it** (the messy original)
2. **Acknowledge it's overwhelming**
3. **Reorganize it logically with comments**
4. **Explain that reorganization is allowed**

**Example:**

> The vanilla Katana has 40+ properties in a seemingly random order. That's intimidating. But remember - the order doesn't matter. Let me reorganize it in a way that makes sense:

```
item Katana
{
    /* Display - What players see */
    DisplayName = Katana,
    DisplayCategory = Weapon,
    Icon = Katana,

    /* Damage - How much it hurts */
    MinDamage = 8,
    MaxDamage = 8,

    /* Durability - How long it lasts */
    ConditionMax = 10,
    ...
}
```

> These groups aren't official - I made them up. You can organize your own items however makes sense to you. The game doesn't care about order.

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

---

## Article Template

```markdown
# [Article Title]

## What Is [Topic]?

[One sentence in plain English - no jargon]

[Connection to in-game experience the reader knows - "You know when..."]

**You would use this when:**
- [Concrete use case 1]
- [Concrete use case 2]

## Prerequisites

Before this article, you should understand:
- [Link to prerequisite 1] - [One-line summary]
- [Link to prerequisite 2] - [One-line summary]

## Your First [Topic] (X Lines)

The simplest [topic] you can make:

```
[Minimum working code - aim for 3-10 lines]
```

**Line by line:**

| Line | What It Does |
|------|--------------|
| `[code]` | [Plain English explanation] |
| `[code]` | [Plain English explanation] |

[If showing complex code, add: "If this looks like a lot, don't worry - we'll break it down."]

## Where Does This Code Go?

```
YourMod/
├── mod.info
└── media/
    └── [appropriate folder]/
        └── your_file.txt
```

**Why this folder?** [Explain client/server/shared or scripts/lua]

**Navigation tip:** [Include "obvious" details like "it's alphabetical" or "if your path is different..."]

**Try it:** [Specific test steps to verify it works]

## Understanding [Key Concept]

[Deeper explanation of the main concept]

[If introducing a pattern, name it explicitly:]
> That is the pattern: [pattern description]. You'll see this same pattern for [other uses].

[Use a metaphor if helpful:]
> Think of it like [familiar analogy].

## Common Mistakes

### Mistake: [Problem Description]

❌ **Don't do this:**
```
[Broken code]
```

✅ **Do this instead:**
```
[Fixed code]
```

**Why:** [Explanation of what goes wrong and how the failure manifests]

[Repeat for 2-3 common mistakes]

## Key Takeaways

1. **[Point 1]** - [One sentence]
2. **[Point 2]** - [One sentence]
3. **[Point 3]** - [One sentence]
4. **[Point 4]** - [One sentence]
5. **[Point 5]** - [One sentence]

## What's Next?

- [Next Article](/path) - [Why they'd read it]
- [Related Article](/path) - [Why they'd read it]
```

---

## Voice and Tone

### Be Conversational

| Don't say | Say |
|-----------|-----|
| "One must ensure that..." | "Make sure you..." |
| "It is necessary to..." | "You need to..." |
| "Instantiate the object" | "Create the button" |
| "The module declaration" | "The word `module` tells the game..." |

### Be Encouraging (But Not Dismissive)

**Good - acknowledges difficulty:**
> This part is tricky at first - don't worry if it takes a few tries.

**Bad - dismisses difficulty:**
> This is easy, just do X.

**Good - normalizes confusion:**
> If this seems confusing, you're not alone. It clicks after you've done it a few times.

**Bad - assumes understanding:**
> As you can see, it's straightforward.

### Show Solidarity

Share that you (or others) also found things confusing:

> When I first saw a vanilla item file, I wanted to close it and pretend it didn't exist. If you're feeling that way, that's normal.

### Define Jargon Immediately

> The function has a **callback** (a function that runs later when something happens) that triggers when clicked.

### Use "We" and "Let's"

Creates a collaborative feeling:
- "Let's look at what this means..."
- "We need to understand X before we can do Y..."
- "Let's break this down..."

---

## Quality Checklist

Before publishing:

### Context
- [ ] Opening explains what this is in plain English
- [ ] Connection to in-game experience
- [ ] Reader knows why they'd care

### Examples
- [ ] First example is the simplest possible (under 10 lines)
- [ ] Every line is explained
- [ ] Reader can copy-paste and it works
- [ ] Symbols and notation are explained

### Practical
- [ ] File path is shown
- [ ] Folder choice is explained
- [ ] "Try it" verification step exists
- [ ] "Obvious" navigation details included

### Errors
- [ ] Common mistakes shown with ❌/✅ format
- [ ] Failure modes explained (what happens when it breaks)
- [ ] Troubleshooting included

### Structure
- [ ] Focused on one concept/task
- [ ] Length appropriate for type
- [ ] Could any section be its own article?

### Emotional Scaffolding (NEW)
- [ ] Acknowledges overwhelm at complex/dense sections
- [ ] Uses reassuring language ("it's okay", "we all started here")
- [ ] Includes at least one moment of solidarity/humor
- [ ] Promises manageability before proving it

### Pattern Teaching (NEW)
- [ ] Core patterns are named explicitly
- [ ] Important concepts repeated 3+ times in different forms
- [ ] Uses memorable metaphors where helpful
- [ ] Summary statements after examples ("That is the pattern: ...")

### Definitions (NEW)
- [ ] All technical terms defined on first use
- [ ] Symbols and notation explained in plain English
- [ ] "Why is it called that?" answered where helpful

### Vocabulary Building (NEW)
- [ ] Proper technical terms ARE used (not avoided)
- [ ] Terms are introduced with plain English explanation
- [ ] Terms are used again later in the article (reinforcement)
- [ ] Reader will recognize these terms in other contexts after reading

### Organization (NEW)
- [ ] Raw data/code reorganized for learning (not just dumped)
- [ ] Reorganization explained and permission given
- [ ] Comments used to group related properties

---

## Article Types

| Type | Purpose | Length | Focus |
|------|---------|--------|-------|
| **Tutorial** | Walk through creating something | 1,500-3,000 words | Step-by-step with complete code, emotional scaffolding |
| **Concept** | Explain an idea or system | 800-2,000 words | What, why, pattern identification |
| **Reference** | Look up specific info | Variable | Scannable tables, code snippets (can be more technical) |
| **Guide** | Understand how a system works | 2,000-4,000 words | Overview, components, connections, reorganized data |

---

## Remember

> Every person reading our wiki could become a modder who creates something amazing. Our job is to make sure confusion doesn't stop them.

**Don't write *for* beginners. Write *as if you ARE* a beginner.**

The difference is empathy translated into word count. Over-explain, repeat, visualize, and validate. That's not padding - that's pedagogy.

**The template for complex sections:**
1. **Acknowledge the overwhelm**
2. **Promise it's manageable**
3. **Prove it step by step**

Write for the person who's about to give up. Write the article that keeps them going.
