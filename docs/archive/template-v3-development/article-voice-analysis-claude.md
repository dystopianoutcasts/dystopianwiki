# Article Voice Analysis: "What Is a Mod?"

> Comparing the published version vs. the user's hand-edited version to extract writing patterns for wiki articles.

---

## Executive Summary

The edited version is **4-5x longer** and employs a fundamentally different teaching philosophy: it assumes the reader knows *nothing* and might be scared, then systematically builds confidence through over-explanation, emotional validation, and repetition.

**The core insight:** The published version is written *for* beginners. The edited version is written *as if you ARE* a beginner.

---

## Key Differences

### 1. Emotional Acknowledgment & Empathy

**Published version:**
> "No magic, no advanced computer science degree required."

**Edited version:**
> "And then close it, cry a little, and feel completely overwhelmed…. No? That was just me."
>
> "drinking from a firehose, half waterboarded, and possibly overwhelmed"
>
> "If this is clear as mud, that's okay"
>
> "If you're feeling overwhelmed, it's okay. The repetition of the pattern will make things easier with time."

**Pattern identified:** The edited version **names the reader's fear** and validates it. It doesn't just say "this is easy" - it says "this looks hard, you'll feel overwhelmed, that's normal, I felt that way too."

**Why this works:** Beginners don't trust "this is easy" from experts. They trust "I remember being confused too."

---

### 2. Defining Terms Most Writers Assume Are Known

**Published version:**
Uses "module" and "namespace" without deep explanation.

**Edited version:**
```
"module"
In Project Zomboid `.txt` script files, the module is essentially a namespace
or container that groups related items, recipes, and other definitions together.
A way to label groups of items that might be created in different files and folders.

That being said, we referred to the word module as a declaration. That is because
when inside of a PZ .txt script like this one, the game engine doesn't know what
the text inside it means unless it's in a pattern. If we start typing a word for
our namespace, the engine might not know whether you're talking about a "container"
or an "item" or a "recipe" or anything. So the key word "module" (all lowercase)
declares to the game engine: "Hey! I am about to give you the name of a module,
okay?". Typing the word module declares that you are talking about a module.
Hence why it is called the module declaration.
```

**Pattern identified:**
- Define EVERY term, even if it seems obvious
- Explain the *reason* behind the term (why is it called a "declaration"?)
- Use conversational dialogue ("Hey! I am about to give you the name of a module, okay?")

---

### 3. Explaining Notation/Syntax in Plain English

**Published version:**
> "The full item name is `WickedWeapons.WickedKatana`"

**Edited version:**
```
The period is a way of signifying possession, everything to the right of the "."
belongs to the module on the left. This is programming logic, but there is
nothing cryptic about it.

If your module name is "thisIsAnExampleOfCamelCasing" and you create a Katana
item, the way you point to your Katana item and not vanilla's Katana is by
referring to it as:

thisIsAnExampleOfCamelCasing.Katana

Where the name of the module comes first, the "." indicates we're talking about
something within that module, and the name of the item we're talking about comes last.
```

**Pattern identified:**
- Don't assume readers understand programming notation (`.`, `{}`, `=`)
- Explain what symbols *mean* in plain English
- Use concrete, spelled-out examples

---

### 4. Explaining the "Why" Behind Restrictions

**Published version:**
> "Module Naming Rules: No spaces, start with a letter..."

**Edited version:**
```
The naming restriction refers to the rule that the name of the module must be
a single word or, more accurately, a single group of characters without any spaces.

Since this is a .txt script, when this gets read by PZ's game engine it expects
the pattern of these three things as you see above. The word "module" (all lowercase),
the name of the module (one phrase no spaces), and then the opening curly brace.
If our module name has spaces or extra words, those will break the pattern and
this entire .txt script will NOT work. It will simply be skipped by the engine
and it will be as though it does not exist.

This is why it's important to know the restriction of one word for the module.
```

**Pattern identified:**
- Don't just list rules - explain what happens if you break them
- "The script will NOT work. It will be skipped. It will be as though it does not exist."
- Concrete consequences > abstract rules

---

### 5. Acknowledging When Things Are Overwhelming

**Published version:**
Shows the full vanilla Katana block, then moves on.

**Edited version:**
```
And then close it, cry a little, and feel completely overwhelmed…. No? That
was just me. Okay, let's not talk about that then. So, this is going to be
just like when I asked you to look inside the media folder (if you did so)
drinking from a firehose, half waterboarded, and possibly overwhelmed. However,
if we take a moment to look at this one line at a time we can see it's not as
intimidating as it might seem at first.
```

**Pattern identified:**
- When showing something complex, **acknowledge the reaction**
- Promise it will make sense if we slow down
- Self-deprecating humor builds trust

---

### 6. Reorganizing Complex Information for Teaching

**Published version:**
Shows the vanilla Katana properties in their original chaotic order.

**Edited version:**
```
Whew, that's still intimidating (at least for me), but remember that the order
does not matter, so I will take the liberty of grouping things in a way that
makes sense to me, let's look at Base.Katana again, but with the properties
rearranged:

item Katana
{
    /* Display */
    DisplayCategory = Weapon,
    DisplayName = Wicked Katana,
    Icon = Katana,

    /* Type & Category */
    Type = Weapon,
    SubCategory = Swinging,
    ...
}

Once an item's properties are organized it is easier to see that there are
logical groups inside of them. These groups I made up are nothing official...
```

**Pattern identified:**
- Don't just show raw data - *organize it for learning*
- Tell the reader you're reorganizing and why
- Point out that the reorganization is your choice, not mandatory

---

### 7. Repeating Core Patterns Multiple Times

**Published version:**
Explains the declaration pattern once.

**Edited version:**
Explains the `declaration → name → { content }` pattern:
- First when introducing modules
- Again when showing the item inside the module
- Again with explicit nesting visualization:

```
module Base   ← module declaration named Base
{  ← opening curly brace for Base
 [...]
    item Saucepan  ← item declaration named Saucepan
    { ← opening curly brace for Saucepan
    [Contents of Saucepan item here…]
    } ← closing curly brace for Saucepan, we are no longer talking about Saucepan
...
} ← closing curly brace for module Base, we are no longer talking about Base

That is the pattern: declaration, name, opening curly brace, content, closing
curly brace. If the content has declarations inside of it, we simply nest that
pattern (like russian nesting dolls) inside of it.
```

**Pattern identified:**
- Core concepts should be repeated 3+ times in different forms
- Each repetition adds a new angle or visualization
- Explicit summary after examples ("That is the pattern: ...")

---

### 8. Practical Navigational Details

**Published version:**
> "In Steam, right-click Project Zomboid → Manage → Browse Local Files"

**Edited version:**
```
The easy way: In Steam, right-click Project Zomboid → Manage → Browse Local Files
This opens the game folder. Look for the media folder (it's alphabetical, so
it'll be in the M's).

The typical path looks like: C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid\media

Note: the above example is assuming you installed Steam in its default location,
if you placed it somewhere else like another drive or another folder navigate
there and when you get to Steam, follow the path to the media folder.
```

**Pattern identified:**
- Include obvious details ("it's alphabetical, so it'll be in the M's")
- Acknowledge variations ("if you installed Steam somewhere else...")
- These details seem unnecessary to experts but prevent confusion for beginners

---

## Voice Characteristics

### Tone
- **Conversational** - "Let's not talk about that then"
- **Self-deprecating** - "cry a little... No? That was just me"
- **Encouraging** - "If you're feeling overwhelmed, it's okay"
- **Collaborative** - "we need to understand", "let's look at this"

### Sentence Structure
- Short sentences for key points
- Longer explanatory sentences for "why"
- Questions answered immediately after asking

### Vocabulary
- Uses programmer terms but immediately defines them
- Prefers plain English over jargon ("container" over "scope")
- Uses analogies ("like Russian nesting dolls")

---

## Things the Edited Version Does NOT Do

1. **Does NOT use formal academic tone**
2. **Does NOT assume prior programming knowledge**
3. **Does NOT skip steps because they're "obvious"**
4. **Does NOT worry about being too long** - comprehension beats brevity
5. **Does NOT hide behind bullet points** - explains in prose, then summarizes

---

## Additions vs Published Version

| Aspect | Published | Edited |
|--------|-----------|--------|
| Module explanation | 3 paragraphs | 15+ paragraphs with definitions, purpose, examples |
| Curly brace explanation | None | Full section with nesting visualization |
| Emotional acknowledgment | 1 sentence | Throughout, 5+ instances |
| Navigation details | Basic path | Path + variations + "in the M's" |
| Property organization | None | Full reorganization with reasoning |
| Pattern repetition | Once | 3+ times with different visualizations |
| "Why" explanations | Minimal | Every restriction/rule explained |

---

## Recommendations for Article Standards

Based on this analysis, articles should include:

### 1. Empathy Checkpoints
After showing anything complex, add an acknowledgment:
- "This looks like a lot. That's okay."
- "If you're feeling overwhelmed, that's normal."

### 2. Define Everything
Even terms that seem obvious:
- What is a "module"?
- What is a "declaration"?
- What does `.` mean in `Base.Katana`?

### 3. Explain Consequences
Every rule should include what happens if broken:
- "If you use spaces, the script will be ignored."
- "If you forget a comma, the item won't load."

### 4. Pattern Repetition Target
Core concepts should appear 3+ times:
1. First introduction
2. Visual/annotated example
3. Summary statement

### 5. Reorganize Raw Data
When showing vanilla code:
- Don't just dump it - organize it logically
- Explain the reorganization
- Use comment blocks (`/* Category */`)

### 6. Include "Obvious" Details
- "It's alphabetical, in the M's"
- "If your path is different..."
- "You can scroll manually, but I recommend Ctrl+F"

---

## Key Insight

**The published version is written FOR beginners.**
**The edited version is written AS IF YOU ARE a beginner.**

The difference is empathy translated into word count. The edited version doesn't trust that the reader understood - it over-explains, repeats, visualizes, and validates. This is not padding; it's pedagogy.

---

## Quote That Captures the Philosophy

> "drinking from a firehose, half waterboarded, and possibly overwhelmed. However, if we take a moment to look at this one line at a time we can see it's not as intimidating as it might seem at first."

This is the template: **acknowledge the overwhelm**, then **promise it's manageable**, then **prove it step by step**.
