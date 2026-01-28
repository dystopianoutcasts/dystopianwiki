# Template V2 Comparison

Comparing **Template_V2.md** (mine) vs **Template_V2_Claude.md** (other dev) to identify the best elements from each and areas for improvement.

---

## Executive Summary

Both templates capture the core insights from the voice analysis. The key differences are in **organization** and **emphasis**:

| Aspect | Template_V2.md | Template_V2_Claude.md |
|--------|----------------|----------------------|
| Opening focus | Goals (3 explicit goals) | Vocabulary fluency journey |
| Structure | 12 numbered principles | 7 core principles + 4 "NEW" sections |
| Scanability | Denser, more comprehensive | Cleaner section breaks |
| Warmth | Good but more formal | More conversational examples |
| Article template | Detailed with many sections | More compact, essential elements |

---

## Best Elements from Template_V2.md (Mine)

### 1. Explicit Goals Section
Clear 3-part mission statement:
- Help people become modders
- Build technical fluency over time
- Create confidence, not dependency

**Why it's good:** Sets the philosophical foundation before diving into tactics. Makes the "why" explicit.

### 2. Five Learning Patterns
Provides multiple structural templates for different teaching situations:
1. Concept → Example → Breakdown → Practice
2. Problem → Solution → Why
3. Build Up Gradually
4. Mistake → Fix → Consequence
5. Overwhelm → Acknowledge → Break Down

**Why it's good:** Gives writers multiple tools for different scenarios.

### 3. "Philosophy" Section at the End
Summarizes the key insight in one place:
> "The published version is written FOR beginners. Your version should be written AS IF YOU ARE a beginner."

**Why it's good:** Memorable anchor point for writers to return to.

### 4. More Detailed Article Template
Includes more explicit sections like:
- "What the symbols mean" breakdown
- Navigation tips section
- Multiple Common Mistakes format

**Why it's good:** Provides more scaffolding for writers who need it.

---

## Best Elements from Template_V2_Claude.md (Other Dev)

### 1. Opening with "The End Goal: Fluency"
Immediately positions the vocabulary-building mission upfront:
> "We're not just teaching people to copy-paste code. We're teaching them to **become modders**"

**Why it's good:** The most important insight is front-and-center, not buried.

### 2. Better Vocabulary Progression Table
Shows all 4 stages in one clear table:
| Stage | How We Write It |
|-------|-----------------|
| Introduction | "This is called a **callback** - a function that runs later..." |
| Reinforcement | "The callback (the function that runs when clicked)..." |
| Natural use | "Your callback receives two parameters..." |
| Reader fluency | Reader can now use "callback" in their own questions |

**Why it's good:** Clearer, more actionable than my progression description.

### 3. "NEW" Section Labels
Clear visual breaks for new concepts:
- "NEW: Emotional Scaffolding"
- "NEW: Pattern Teaching"
- "NEW: Define Everything"
- "NEW: Reorganize for Teaching"

**Why it's good:** Makes it scannable. Writers can quickly find the new additions vs. standard practices.

### 4. Symbol Explanation Table
Clean, scannable reference:
| Symbol | Meaning |
|--------|---------|
| `.` | "Possession - `Base.Katana` means the Katana that belongs to Base" |
| `{}` | "Content container - everything between these braces belongs together" |

**Why it's good:** Quick reference format, easier to consult while writing.

### 5. "Use 'We' and 'Let's'" Section
Explicit guidance on collaborative language:
- "Let's look at what this means..."
- "We need to understand X before we can do Y..."
- "Let's break this down..."

**Why it's good:** Captures the warmth and collaborative feeling of the sample article. This is missing from my template entirely.

### 6. "Show Solidarity" Section
> "When I first saw a vanilla item file, I wanted to close it and pretend it didn't exist. If you're feeling that way, that's normal."

**Why it's good:** Explicitly names the solidarity technique from the sample article.

### 7. "Be Encouraging (But Not Dismissive)" Contrast
Shows both good AND bad versions:
- **Good:** "This part is tricky at first - don't worry if it takes a few tries."
- **Bad:** "This is easy, just do X."

**Why it's good:** The contrast makes the guidance more actionable.

### 8. Cleaner Checklist Organization
Checklist items are grouped with "(NEW)" labels, making it clear what's been added from the voice analysis.

---

## Things BOTH Templates Could Improve

### 1. Missing: The Rhythm of Reassurance

The sample article doesn't just have ONE "emotional scaffolding" moment - it has them **distributed throughout**, at every potential overwhelm point.

**What's missing:** Guidance on WHERE to place these moments - not just at the start, but:
- After showing complex code
- After introducing a new concept
- Before diving deeper
- After a long section

**Suggested addition:**
```markdown
### When to Add Emotional Checkpoints

Add a reassurance after:
- Any code block over 10 lines
- Any list of 5+ items
- Any section introducing new terminology
- Before saying "now let's go deeper"

The reader should never go more than 2-3 paragraphs without
hearing "this is okay" or "let's take this one piece at a time."
```

### 2. Missing: Signposting / Road-mapping

The sample article frequently tells readers what's coming:
- "Before we get into changing text files, we need to understand..."
- "We will go into details of how these are organized, but the core is..."

**Neither template explicitly teaches this technique.**

**Suggested addition:**
```markdown
### Signposting

Tell readers where you're going, especially before tangents:

- "Before we can do X, we need to understand Y."
- "We'll cover this in detail later. For now, just know that..."
- "This will make more sense after the next section - trust me."

This prevents readers from feeling lost when you pause the main
thread to explain something foundational.
```

### 3. Missing: Permission-Giving Language

The sample article explicitly gives readers permission to do things their own way:
- "These groups I made up are nothing official"
- "You can organize your own items however makes sense to you"
- "The order doesn't matter to PZ, so I'll reorganize..."

**Suggested addition:**
```markdown
### Give Permission

Explicitly tell readers they can do things their way:

- "This is how I organize it - you can do whatever makes sense to you."
- "There's no 'right' way to order these properties."
- "Feel free to rename this file to something that makes sense for your mod."

Many beginners are afraid to deviate from examples. Give them permission.
```

### 4. Missing: The "Fire Hose" Quality of Imagery

The sample article uses vivid, visceral metaphors:
- "drinking from a firehose"
- "half waterboarded"
- "cry a little"
- "Russian nesting dolls"

**Both templates mention metaphors but don't emphasize the QUALITY of imagery.**

**Suggested addition:**
```markdown
### Use Vivid, Physical Metaphors

Don't say: "This might be a lot of information."
Do say: "This is like drinking from a firehose."

Physical, visceral metaphors land better than abstract ones:
- "Russian nesting dolls" (not "nested structures")
- "A container that holds things" (not "an encapsulation mechanism")
- "Like a recipe - ingredients on top, result at bottom" (not "declarative syntax")
```

### 5. Missing: The "I Remember" Technique

The sample article frequently references the author's own journey:
- "That was just me"
- "I remember being confused by this"
- "We all started there"

**Suggested addition:**
```markdown
### The "I Remember" Technique

Share your own journey when appropriate:

- "When I first saw this file, I wanted to close it immediately."
- "I spent hours confused by this before it clicked."
- "That was just me? Okay, moving on then."

This isn't about you - it's about showing that confusion is
a normal part of the journey, not a sign of inadequacy.
```

### 6. Missing: Article Type Guidance for Warmth Levels

Both templates have article types (Tutorial, Concept, Reference, Guide) but don't specify how warmth/scaffolding should vary by type.

**Suggested addition:**
```markdown
### Warmth by Article Type

| Type | Emotional Scaffolding Level |
|------|----------------------------|
| Tutorial | HIGH - First exposure, lots of reassurance and checkpoints |
| Concept | MEDIUM - Some scaffolding, focus on "why" explanations |
| Reference | LOW - Can be more technical, readers are looking things up |
| Guide | MEDIUM-HIGH - System overview, acknowledge complexity |
```

---

## Structural Recommendation

Merge the best of both into this structure:

```
# Wiki Article Standards v2

## The End Goal: Fluency [from Claude's template - front and center]

## Our Goals [from my template - 3 explicit goals]

## Our Audience [shared - both have this]

## Core Principles [keep the 7 core from Claude, cleaner]
   1. Context Before Content
   2. Ground in Game Experience
   3. Simplest Thing First
   4. Explain Every Line (And Every Symbol)
   5. Tell Them Where It Goes (With Obvious Details)
   6. Anticipate Failure (And Explain Consequences)
   7. Give Them a Win

## NEW: Emotional Scaffolding [from Claude - cleaner section]
   - Add: Rhythm of Reassurance (when to place checkpoints)
   - Add: The "I Remember" Technique
   - Add: Permission-Giving Language

## NEW: Pattern Teaching [from Claude]
   - Add: Signposting / Road-mapping

## NEW: Build Technical Vocabulary [from my template - expanded]

## NEW: Define Everything [from Claude - with symbol table]

## NEW: Reorganize for Teaching [from Claude]

## Learning Patterns [from my template - keep all 5]

## When to Split an Article [shared]

## Article Template [merge both - Claude's structure, my detail]

## Voice and Tone [merge both]
   - Be Conversational [shared]
   - Be Encouraging (But Not Dismissive) [Claude's contrast format]
   - Show Solidarity [Claude - explicit]
   - Use "We" and "Let's" [Claude - missing from mine]
   - Define Jargon Immediately [shared]
   - Use Vivid Physical Metaphors [NEW]

## Quality Checklist [merge both - Claude's organization, my vocabulary section]

## Article Types [merge - add warmth levels]

## The Philosophy [from my template - closing anchor]
```

---

## Key Insight

**Template_V2_Claude.md is warmer and more scannable.**
**Template_V2.md is more comprehensive and philosophically grounded.**

The ideal template combines:
- Claude's opening focus on fluency
- Claude's "NEW" section organization
- Claude's explicit warmth techniques ("We," "Let's," solidarity)
- My explicit goals section
- My five learning patterns
- My closing philosophy anchor

**Both are missing:**
- Rhythm of reassurance guidance
- Signposting technique
- Permission-giving language
- Vivid metaphor emphasis
- The "I remember" technique
- Warmth levels by article type

---

## Recommendation

Create a **Template_V3.md** that:
1. Opens with "The End Goal: Fluency" (Claude)
2. Adds "Our Goals" section (mine)
3. Uses "NEW:" section labels for scanability (Claude)
4. Includes all the warmth techniques explicitly (merge)
5. Adds the 5 missing elements identified above
6. Ends with the philosophy anchor (mine)

Would you like me to create this merged Template_V3.md?
