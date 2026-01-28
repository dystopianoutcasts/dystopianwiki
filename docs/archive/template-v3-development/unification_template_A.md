# Template V3 Unification Plan

> Synthesizing insights from both developers' comparisons to create the definitive article standards template.

---

## Overview

Both developers independently analyzed Template_V2.md and Template_V2_Claude.md, then compared them to the sample article. This document unifies those analyses into a single blueprint for Template_V3.

---

## Agreed-Upon Best Elements

### From Template_V2.md (Original Developer)

Both comparisons agree these should be kept:

| Element | Description | Why It Works |
|---------|-------------|--------------|
| **3 Explicit Goals** | Help people become modders, Build technical fluency, Create confidence not dependency | Sets philosophical foundation before tactics |
| **"Scared but won't admit it"** | Audience description | More emotionally specific than "embarrassed" |
| **Five Learning Patterns** | Named patterns with templates for different teaching scenarios | Writers can pick the right pattern for their content |
| **Four-Step Complex Template** | Acknowledge → Promise → Prove → Summarize | Step 4 (summarize the pattern) closes the loop |
| **"What you'll see"** | In Common Mistakes sections | Helps readers recognize when they've made this mistake |
| **Philosophy Anchor** | "They're not stupid. They're just new." | Memorable closing that sets the right mindset |
| **"Comprehension beats brevity"** | Explicit permission to be thorough | Prevents over-abbreviation |

### From Template_V2_Claude.md (Claude)

Both comparisons agree these should be kept:

| Element | Description | Why It Works |
|---------|-------------|--------------|
| **Opening with Fluency Goal** | "The End Goal: Fluency" front and center | Most important insight is immediately visible |
| **Vocabulary Progression Table** | 4-stage journey in clean table format | More actionable than prose description |
| **Target Vocabulary List** | Specific terms readers should know after 5-10 articles | Concrete fluency goal we can measure |
| **"NEW:" Section Labels** | Clear visual breaks for added concepts | Scannable; writers find new additions quickly |
| **Symbol Explanation Table** | `.`, `{}`, etc. with plain English meanings | Quick reference while writing |
| **"Use 'We' and 'Let's'"** | Collaborative language guidance | Captures warmth and collaborative feeling |
| **"Show Solidarity"** | Share your own confusion | Explicitly names the technique |
| **"Why is it called that?"** | Etymology explanations | Helps terms stick |
| **Good/Bad Contrast Format** | Shows both versions | Makes guidance more actionable |

---

## Agreed-Upon Missing Elements

Both comparisons identified these gaps that NEITHER template addresses:

### 1. Rhythm of Reassurance

**The Problem:** Both templates mention "emotional scaffolding" but don't say WHERE to place it.

**The Solution:**
```markdown
### When to Add Emotional Checkpoints

Add reassurance after:
- Any code block over 10 lines
- Any list of 5+ items
- Any section introducing new terminology
- Before saying "now let's go deeper"

The reader should never go more than 2-3 paragraphs
without hearing "this is okay" or "let's take this one piece at a time."
```

### 2. Signposting / Road-mapping

**The Problem:** The sample article frequently tells readers what's coming. Neither template teaches this.

**The Solution:**
```markdown
### Signposting

Tell readers where you're going, especially before tangents:

- "Before we can do X, we need to understand Y."
- "We'll cover this in detail later. For now, just know that..."
- "This will make more sense after the next section - trust me."
- "Now that we understand X, let's talk about how Y works."

This prevents readers from feeling lost when you pause the main
thread to explain something foundational.
```

### 3. Permission-Giving Language

**The Problem:** The sample explicitly tells readers they have freedom. Templates only imply this.

**The Solution:**
```markdown
### Give Permission

Beginners are afraid to deviate from examples. Explicitly give permission:

- "This is how I organize it - you can do whatever makes sense to you."
- "There's no 'right' way to order these properties."
- "Feel free to rename this file to something that makes sense for your mod."
- "These groups I made up are nothing official."
- "The order doesn't matter to PZ, so reorganize however helps you."
```

### 4. Vivid, Physical Metaphors

**The Problem:** Both templates mention metaphors but don't emphasize the QUALITY of imagery.

**The Solution:**
```markdown
### Use Vivid, Physical Metaphors

Don't say: "This might be a lot of information."
Do say: "This is like drinking from a firehose."

Physical, visceral metaphors land better than abstract ones:
- "Russian nesting dolls" (not "nested structures")
- "A container that holds things" (not "an encapsulation mechanism")
- "Like a recipe - ingredients on top, result at bottom" (not "declarative syntax")
- "Drinking from a firehose, half waterboarded" (not "potentially overwhelming")
```

### 5. The "I Remember" Technique

**The Problem:** Neither template explicitly teaches sharing your own confusion.

**The Solution:**
```markdown
### The "I Remember" Technique

Share your own journey when appropriate:

- "When I first saw this file, I wanted to close it immediately."
- "I spent hours confused by this before it clicked."
- "That was just me? Okay, moving on then."
- "At least for me, this was the hardest part."

This isn't about you - it's about showing that confusion is
a normal part of the journey, not a sign of inadequacy.
```

### 6. Personal "I" Voice

**The Problem:** Templates say "be conversational" but don't explicitly permit first-person.

**The Solution:**
```markdown
### Use "I" When Sharing Experience

The sample article uses first person frequently:
- "That was just me"
- "at least for me"
- "I will take the liberty of grouping things"
- "I hope this helps!"

You're not writing a textbook. You're a modder helping another modder.
Use "I" to share your own experience and perspective.
```

### 7. Mid-Article Key Takeaway Boxes

**The Problem:** Templates only have summaries at the end, but the sample has them WITHIN sections.

**The Solution:**
```markdown
### Mid-Article Summaries

Add "Key Takeaway" boxes after complex concepts, not just at the end:

> **Key Takeaway**
> This pattern of declaration, name, and content container is what
> we'll use in all our .txt scripts.

Place these after any explanation that took more than 3 paragraphs.
They give readers a "checkpoint" - confirmation they understood correctly.
```

### 8. In-Article Pattern Repetition

**The Problem:** Templates say to repeat patterns across articles, but not WITHIN the same article.

**The Solution:**
```markdown
### Repeat Patterns 3+ Times Within an Article

Core concepts should appear multiple times in the SAME article:
1. First introduction (prose explanation)
2. Annotated example (visual breakdown)
3. Summary statement ("That is the pattern: ...")

The sample article shows the declaration pattern:
- First with modules
- Then with items inside modules
- Then with a fully annotated visual
- Then summarized in words

Repetition isn't redundancy - it's reinforcement.
```

### 9. Warmth Levels by Article Type

**The Problem:** Both templates define article types but don't specify how warmth should vary.

**The Solution:**
```markdown
### Warmth by Article Type

| Type | Emotional Scaffolding Level |
|------|----------------------------|
| Tutorial | HIGH - First exposure, lots of reassurance and checkpoints |
| Concept | MEDIUM - Some scaffolding, focus on "why" explanations |
| Reference | LOW - Can be more technical, readers are looking things up |
| Guide | MEDIUM-HIGH - System overview, acknowledge complexity |

Reference articles CAN be drier. Tutorials MUST be warm.
```

---

## Structural Recommendation for Template V3

Based on both comparisons, the recommended structure is:

```
# Wiki Article Standards v3

## The End Goal: Fluency
   - Why we teach terminology (not avoid it)
   - The vocabulary journey (4-stage table)
   - Target vocabulary list
   - "That's the goal: readers who can speak the language of modding"

## Our Goals
   1. Help people become modders (not just copy-paste)
   2. Build technical fluency over time
   3. Create confidence, not dependency

## Our Audience
   - Who they are (gamers first, self-taught, time-limited)
   - "Scared but won't admit it" description
   - Assume they know / Assume they don't know

## Core Principles (7)
   1. Context Before Content
   2. Ground in Game Experience
   3. Simplest Thing First
   4. Explain Every Line (And Every Symbol)
   5. Tell Them Where It Goes (With Obvious Details)
   6. Anticipate Failure (And Explain Consequences)
   7. Give Them a Win

## NEW: Emotional Scaffolding
   - Acknowledge the overwhelm
   - Use "We" and "Let's"
   - Show Solidarity ("I remember...")
   - Permission-Giving Language
   - Rhythm of Reassurance (WHEN to add checkpoints)
   - Use Vivid Physical Metaphors
   - Library of Specific Phrases

## NEW: Pattern Teaching
   - 5 Learning Patterns (with templates)
   - 4-Step Complex Section Template
   - Repeat Patterns 3+ Times WITHIN an Article
   - Mid-Article Key Takeaway Boxes
   - Signposting / Road-mapping

## NEW: Build Technical Vocabulary
   - First encounter → Reinforcement → Natural use → Fluency
   - Vocabulary progression table
   - Target vocabulary list
   - "Why is it called that?" pattern

## NEW: Define Everything
   - Terms that seem obvious (but aren't)
   - Symbol explanation table
   - Include "obvious" navigation details

## NEW: Reorganize for Teaching
   - Don't just dump raw data
   - Organize logically with comments
   - Explain and give permission for the reorganization

## Voice and Tone
   - Be Conversational
   - Be Encouraging (But Not Dismissive) [with contrast]
   - Use "I" for Personal Experience
   - Define Jargon Immediately

## When to Split an Article
   - Split rules (10+ TOC, 15 min read, etc.)
   - One article = One concept or one task

## Article Template
   - Full template with all sections
   - "What you'll see" in Common Mistakes
   - Section dividers for visual structure

## Article Types (with Warmth Levels)
   - Tutorial: HIGH warmth
   - Concept: MEDIUM warmth
   - Reference: LOW warmth (can be drier)
   - Guide: MEDIUM-HIGH warmth

## Quality Checklist
   - Context
   - Examples
   - Practical
   - Errors
   - Structure
   - Definitions (NEW)
   - Vocabulary Building (NEW)
   - Emotional Scaffolding (NEW)
   - Organization (NEW)

## The Philosophy (Closing Anchor)
   > "The published version is written FOR beginners.
   > Your version should be written AS IF YOU ARE a beginner."

   > "They're not stupid. They're just new. Treat them accordingly."

   Write for the person who's about to give up. Write the article that keeps them going.
```

---

## Specific Content to Include

### Library of Emotional Phrases

Both comparisons noted the sample has vivid, specific phrases that templates only describe generically. Template V3 needs an actual library:

```markdown
### Phrase Library: Acknowledging Overwhelm

Pick and adapt:
- "This is like drinking from a firehose."
- "If you feel half waterboarded looking at this, you're not alone."
- "And then close it, cry a little, and feel completely overwhelmed... No? That was just me."
- "If this is clear as mud, that's okay."
- "We all started there."
- "This looks scary. It's not - but it looks scary."

### Phrase Library: Promising Manageability

- "But if we take it one piece at a time..."
- "However, if we slow down and look at this one line at a time..."
- "It's not as intimidating as it might seem at first."
- "Let's break this down."
- "Once you see the pattern, it becomes simple."

### Phrase Library: Personal Warmth

- "I hope this helps!"
- "At least for me, this was the confusing part."
- "When I first saw this, I wanted to close the file and pretend it didn't exist."
- "Let's not talk about that then. Moving on..."
- "Okay, so..."
```

### Example Signposting Language

```markdown
### Signposting Examples

Before a tangent:
- "Before we get into changing text files, we need to understand..."
- "We'll explore this more later. For now, just know that..."

After completing a section:
- "Now that we've talked about modules, let's talk about items."
- "With that foundation, we can finally look at..."

Returning from a tangent:
- "So, let's open Base.Katana back up and look at this again."
- "Back to our main topic..."
```

---

## Unique Contributions from Each Comparison

### From Template_V2_Comparison.md (Claude's Comparison)

Unique insights to include:

1. **"Note:" Callout Pattern** - When/how to use callout notes for tangential info without breaking flow
2. **Transitional signposting examples** - Specific phrases for moving between sections
3. **"I hope this helps!" warmth** - Small personal touches of direct connection

### From Template_Comparison.md (Other Dev's Comparison)

Unique insights to include:

1. **Structural merge recommendation** - Clear order for template sections
2. **Warmth levels by article type** - Tutorial HIGH, Reference LOW, etc.
3. **Good/Bad contrast format** - Show both versions for actionable guidance

---

## Summary: What Template V3 Must Have

### Keep from Template_V2.md
- [ ] 3 Explicit Goals section
- [ ] "Scared but won't admit it" audience description
- [ ] 5 Named Learning Patterns with templates
- [ ] 4-Step Complex Section Template (including "summarize the pattern")
- [ ] "What you'll see" format in Common Mistakes
- [ ] "Comprehension beats brevity" permission
- [ ] Philosophy anchor at the end

### Keep from Template_V2_Claude.md
- [ ] Opening with "The End Goal: Fluency"
- [ ] Vocabulary Progression Table (4 stages)
- [ ] Target Vocabulary List
- [ ] "NEW:" Section Labels for scanability
- [ ] Symbol Explanation Table
- [ ] "Use 'We' and 'Let's'" guidance
- [ ] "Show Solidarity" section
- [ ] "Why is it called that?" pattern
- [ ] Good/Bad contrast format

### Add NEW (from both comparisons)
- [ ] Rhythm of Reassurance (WHEN to place emotional checkpoints)
- [ ] Signposting / Road-mapping with examples
- [ ] Permission-Giving Language section
- [ ] Vivid Physical Metaphor emphasis
- [ ] The "I Remember" Technique
- [ ] Personal "I" voice permission
- [ ] Mid-Article Key Takeaway Boxes
- [ ] In-Article Pattern Repetition (3+ times)
- [ ] Warmth Levels by Article Type
- [ ] Phrase Library (Overwhelm, Manageability, Personal Warmth)
- [ ] "Note:" Callout Pattern guidance

---

## Next Step

With this unification complete, we can now write **Template_V3.md** by:

1. Following the structural outline above
2. Including all checked items from the summary
3. Adding the phrase libraries and example language
4. Ensuring scanability with clear section breaks and "NEW:" labels

This unified plan represents the consensus of both developers' analyses, incorporating the best elements from both V2 templates while adding the missing elements needed to capture the warmth and voice of the sample article.
