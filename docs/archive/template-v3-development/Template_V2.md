# Wiki Article Standards v2

> **The goal of this wiki is not to document everything - it's to help people become modders.**
>
> **The key insight:** Don't write *for* beginners. Write *as if you are* a beginner.

---

## Our Goals

### 1. Help People Become Modders
We're not just explaining how to do things - we're creating modders who can solve their own problems, read other people's code, and eventually help others.

### 2. Build Technical Fluency Over Time
We want readers to eventually **speak the language** of programming. Terms like "callback," "hook," "instantiate," and "namespace" should become second nature to them.

**The approach:**
1. **First exposure:** Define the term in plain English with a game example
2. **Repetition:** Use the term again (with a brief reminder of what it means)
3. **Fluency:** Eventually use the term without explanation - they know it now

**Example progression across articles:**

| Stage | How We Use "Callback" |
|-------|----------------------|
| First mention | "a **callback** (a function that runs later when something happens)" |
| Second mention | "the callback function (remember: the function that runs when the button is clicked)" |
| Third mention | "the callback function" |
| Later articles | "the callback" - they know what this means now |

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

- **Easily discouraged** - One confusing article can make them give up. We're often the difference between "I made my first mod!" and "modding is too hard for me."

- **Scared but won't admit it** - They're worried they're "not smart enough" or "not a real programmer." They need permission to feel confused.

### Assume They Know

- How to play Project Zomboid
- What mods are (they've installed some)
- Basic computer skills (files, folders, text editors)

### Assume They Don't Know

- Programming, Lua, or game engines
- What "syntax," "API," "callback," or "namespace" means
- What symbols like `.`, `{}`, `=`, or `:` mean in code
- Why code has to be in specific folders
- What error messages mean
- That it's okay to feel overwhelmed

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

For introductory content, don't leave any line unexplained. This includes symbols that programmers take for granted:

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

**Also explain notation:**
> The period in `Base.Katana` is a way of signifying possession - everything to the right of the `.` belongs to the module on the left. So `Base.Katana` means "the Katana that belongs to the Base module."

### 5. Tell Them Where It Goes (With Obvious Details)

Always include:
- The file path where code should be saved
- Which folder (client/server/shared) and why
- What the file should be named
- **Details that seem obvious but prevent confusion**

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

**Include "obvious" navigation details:**
> Look for the `media` folder (it's alphabetical, so it'll be in the M's).
>
> The typical path looks like: `C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid\media`
>
> Note: If you installed Steam somewhere else (like another drive), navigate there first, then follow the path to the media folder.

### 6. Anticipate Failure (And Explain Consequences)

Show what goes wrong and how to fix it. **Explain what happens when rules are broken:**

```lua
-- WRONG: Missing comma
local button = ISButton:new(10, 10, 100 30, "Click")
--                                    ^ Error!

-- RIGHT: Commas separate parameters
local button = ISButton:new(10, 10, 100, 30, "Click")
```

**Always explain the consequence:**
> If your module name has spaces, the entire `.txt` script will NOT work. The game engine will simply skip it, and it will be as though it does not exist. No error message - just nothing happens.

### 7. Give Them a Win

Every article should enable the reader to DO something that works.

> **Try it:** Change the button text to your name. Save, restart PZ, and see your button.

---

## NEW: Emotional Scaffolding

### 8. Acknowledge Overwhelm at Overwhelm Points

When showing complex code, large files, or many concepts at once, **explicitly acknowledge that it's overwhelming.** Don't just say "this is easy" - name the feeling they're having.

**Bad:**
> Look at that. It's just a list of properties with values. No scary code.

**Good:**
> And then close it, cry a little, and feel completely overwhelmed…. No? That was just me. Okay, let's not talk about that then.
>
> This is like drinking from a firehose. However, if we take a moment to look at this one line at a time, we can see it's not as intimidating as it might seem at first.

**Empathy phrases to use:**
- "If this is clear as mud, that's okay."
- "If you're feeling overwhelmed, that's normal. We all started here."
- "This looks like a lot. It is a lot. But we'll break it down."
- "I remember being confused by this too."

**Why this works:** Beginners don't trust "this is easy" from experts. They trust "I remember being confused too."

### 9. Define Everything (Even "Obvious" Terms)

Don't assume readers understand programming terms. Define them in context, with purpose:

**Bad:**
> A module is like a namespace.

**Good:**
> **What is a module?**
>
> A module is a named group that prevents naming conflicts and organizes game content. Think of it as a labeled box - everything in the "Base" box belongs to vanilla PZ.
>
> **Why is it called a "declaration"?**
>
> When you type `module Base`, you're *declaring* to the game engine: "Hey! I'm about to give you the name of a module, okay?" The engine doesn't know what your text means unless it follows a pattern. The word `module` declares what kind of thing you're talking about.

**Terms that need defining (even if they seem obvious):**
- module, namespace, declaration
- property, value, parameter
- curly braces `{}`, parentheses `()`, brackets `[]`
- the dot `.` in `Base.Katana`
- the colon `:` in `ISPanel:new()`
- callback, function, method
- syntax, parse, compile

### 10. Teach the Pattern, Not Just the Example

Don't just show how something works - **explicitly name the pattern** so readers can recognize it in new contexts.

**Bad:**
```
module Base {
    item Katana {
        Type = Weapon,
    }
}
```
"Here's how to define an item."

**Good:**
```
module Base   ← declaration (what kind of thing)
{             ← opening curly brace (start of contents)
    item Katana   ← nested declaration
    {             ← opening curly brace for item
        Type = Weapon,
    }             ← closing curly brace for item
}             ← closing curly brace for module
```

> **That is the pattern:** declaration, name, opening curly brace, content, closing curly brace.
>
> If the content has declarations inside of it, we simply nest that pattern (like Russian nesting dolls) inside of it. There's nothing else to the pattern. I hope this helps!

**Repeat the pattern 3+ times** in different forms:
1. First introduction (conceptual)
2. Annotated example (visual)
3. Summary statement (explicit)

### 11. Build Technical Vocabulary Intentionally

Use real technical terms - but introduce them properly. The goal is fluency, not avoidance.

**Bad:** Avoid jargon entirely
> "the function that runs when you click"

**Also Bad:** Use jargon without explaining
> "the onClick callback"

**Good:** Introduce the term with a definition, then use it
> "the **callback** (a function that runs later when something happens) - in this case, it runs when you click the button"

**Pattern for introducing terms:**

```markdown
When you click the button, PZ runs a **callback** - that's programmer-speak for
"a function that gets called later when something happens." You'll see this term
everywhere in modding, so let's get comfortable with it.
```

**Key terms every modder should eventually know:**
- callback, hook, event, listener
- instantiate, initialize, constructor
- module, namespace, scope
- property, method, function
- parent, child, inherit
- client, server, shared

**The progression:**
1. Define it clearly on first use (with plain English and example)
2. Use it again with a brief reminder
3. Use it freely - they've learned it

This isn't dumbing down. It's building up.

### 12. Reorganize Complex Information for Teaching

When showing vanilla code or complex data, **don't just dump it** - reorganize it for learning.

**Bad:** Show the vanilla Katana with 40 properties in random order.

**Good:**
> The vanilla file has these properties in a jumbled order. That's fine for the game, but hard for us to read. Remember: **the order doesn't matter to PZ**, so I'll reorganize them into logical groups:

```
item Katana
{
    /* Display */
    DisplayName = Katana,
    Icon = Katana,

    /* Damage */
    MinDamage = 8,
    MaxDamage = 8,

    /* Combat */
    MaxHitCount = 3,
    CriticalChance = 30,
    ...
}
```

> These groups are my own invention - nothing official. But organizing properties this way makes it much easier to find what you want to change.

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

## Learning Patterns

Use these structures to help readers learn:

### Pattern 1: Concept → Example → Breakdown → Practice

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

### Pattern 2: Problem → Solution → Why

```markdown
## The Problem
You want to [goal], but [obstacle].

## The Solution
[Code that solves it]

## Why This Works
[Explanation]
```

### Pattern 3: Build Up Gradually

```markdown
## Version 1: The Basics
[Minimal code - 5 lines]

## Version 2: Adding [Feature]
[Previous + new feature]

## Version 3: Making It [Better]
[Previous + improvement]
```

### Pattern 4: Mistake → Fix → Consequence

```markdown
### Common Mistake: [Description]

❌ **Doesn't work:**
[Broken code]

✅ **Works:**
[Fixed code]

**Why:** [Explanation]

**What happens if you do this wrong:** [Concrete consequence - error message, silent failure, crash]
```

### Pattern 5: Overwhelm → Acknowledge → Break Down

```markdown
[Show complex thing]

This looks like a lot. That's because it is. But here's the good news: [reassurance].

Let's take it one piece at a time:

[Break into small pieces with explanations]

See? Not so bad. The pattern is: [explicit pattern statement]
```

---

## Article Template v2

```markdown
# [Article Title]

## What Is [Topic]?

[One sentence in plain English]

[Connection to in-game experience the reader knows]

**You would use this when:** [Concrete use cases]

---

## Prerequisites

Before this article, understand:
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

**What the symbols mean:**
- The `:` in `ISPanel:new()` means [explanation]
- The `{}` curly braces mean [explanation]

---

## Where Does This Go?

[File path diagram]

**Why this folder?** [Explain client/server/shared]

**Finding it:**
> Navigate to [path]. If your installation is different, [guidance for variations].

---

## What Happens When You Run It

1. The game loads your mod
2. [Step 2]
3. You see [expected result]

**Try it:** [Specific test steps]

---

## [Main Content Sections]

[When showing complex information, add empathy checkpoints:]

> This might look overwhelming at first. That's normal - there's a lot here. Let's break it down piece by piece.

[When introducing patterns, explicitly name them:]

> **The pattern is:** [explicit statement]. This same pattern applies to [other examples].

[When showing rules, explain consequences:]

> If you forget this, [specific thing will happen]. The game will [error/skip/crash], and you'll see [what they'll see].

---

## Common Mistakes

### Mistake: [Problem]

❌ **Doesn't work:**
[Broken code]

✅ **Works:**
[Fixed code]

**Why:** [Explanation]

**What you'll see:** [Error message or symptom]

---

## Key Takeaways

1. **[Point 1]** - [One sentence]
2. **[Point 2]** - [One sentence]
3. **[Point 3]** - [One sentence]

---

## What's Next?

- [Next Article](/path) - [Why they'd read it]
```

---

## Article Types

| Type | Purpose | Length | Focus |
|------|---------|--------|-------|
| **Tutorial** | Walk through creating something | 1,000-3,000 words | Step-by-step with complete code |
| **Concept** | Explain an idea or system | 500-2,000 words | What, why, simple example |
| **Reference** | Look up specific info | Variable | Scannable tables, code snippets |
| **Guide** | Understand how a system works | 1,500-4,000 words | Overview, components, connections |

**Note:** Comprehension beats brevity. A longer article that the reader understands is better than a short one that leaves them confused.

---

## Voice and Tone

### Be Conversational

| Don't say | Say |
|-----------|-----|
| "One must ensure that..." | "Make sure you..." |
| "It is necessary to..." | "You need to..." |
| "Instantiate the object" | "Create the button" |
| "The aforementioned pattern" | "This pattern" |

### Be Encouraging and Honest

- "This part is tricky at first - don't worry if it takes a few tries."
- "If this seems confusing, you're not alone. I felt the same way."
- "You just created your first X - that's a real accomplishment!"
- "This looks intimidating. Let's slow down and look at it piece by piece."

### Use Self-Deprecating Humor (Sparingly)

> And then close it, cry a little, and feel completely overwhelmed…. No? That was just me.

This builds trust by showing you're human, not an unapproachable expert.

### Define Jargon Immediately (But Use It)

Don't avoid technical terms - introduce them properly. The goal is to build fluency.

> The function has a **callback** (a function that runs later when something happens) that triggers when clicked. You'll see "callback" everywhere in modding - it just means "call this function back when the thing happens."

**The formula:** Term in bold → plain English definition → why they should know it

### Explain Programmer Notation

> The `.` in `Base.Katana` means "belongs to" - the Katana belongs to the Base module. It's like saying "Base's Katana."

---

## Quality Checklist v2

Before publishing:

**Context**
- [ ] Opening explains what this is in plain English
- [ ] Connection to in-game experience
- [ ] Reader knows why they'd care

**Examples**
- [ ] First example is the simplest possible
- [ ] Every line is explained
- [ ] Reader can copy-paste and it works
- [ ] Symbols and notation are explained

**Practical**
- [ ] File path is shown
- [ ] Folder choice is explained
- [ ] "Try it" verification step exists
- [ ] Navigation includes "obvious" details

**Errors & Consequences**
- [ ] Common mistakes shown with wrong/right
- [ ] **Consequences of mistakes explained** (what happens when it breaks)
- [ ] Error messages or symptoms described
- [ ] Troubleshooting included

**Emotional Support**
- [ ] Acknowledges overwhelm at complex/dense sections
- [ ] Uses reassuring language ("it's okay", "we all started here")
- [ ] At least one moment of solidarity or appropriate humor

**Pattern Teaching**
- [ ] Explicitly names patterns when they appear
- [ ] Shows how patterns apply to multiple examples
- [ ] Uses memorable metaphors (nesting dolls, containers, etc.)
- [ ] Pattern repeated 3+ times in different forms

**Vocabulary Building**
- [ ] Uses real technical terms (callback, hook, instantiate, etc.)
- [ ] Defines terms clearly on first use with plain English + example
- [ ] Reminds reader of meaning on second use
- [ ] Builds toward fluency, not avoidance of jargon

**Organization**
- [ ] Complex data reorganized for learning (not raw dumps)
- [ ] Explains that reorganization is allowed
- [ ] Signposts before tangents ("Before we continue, we need to understand...")

**Structure**
- [ ] Focused on one concept/task
- [ ] Length appropriate for type (comprehension > brevity)
- [ ] Could any section be its own article?

---

## The Philosophy

> **The published version is written FOR beginners.**
> **Your version should be written AS IF YOU ARE a beginner.**

The difference is empathy translated into word count. Over-explain, repeat, visualize, and validate. This is not padding; it's pedagogy.

**The template for complex sections:**
1. **Acknowledge the overwhelm** - "This looks like a lot."
2. **Promise it's manageable** - "But if we take it one piece at a time..."
3. **Prove it step by step** - Break it down with explanations
4. **Summarize the pattern** - "That's all there is to it: [pattern]"

---

## Remember

> Every person reading our wiki could become a modder who creates something amazing. Our job is to make sure confusion doesn't stop them.

Write for the person who's about to give up. Write the article that keeps them going.

**They're not stupid. They're just new. Treat them accordingly.**
