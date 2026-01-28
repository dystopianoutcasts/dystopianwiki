# Template V3 Unified Requirements - FINAL

> The definitive blueprint for creating Wiki Article Standards v3, synthesizing both developers' analyses.

---

## Executive Summary

Both developers independently analyzed the same two templates against the sample article. Their conclusions align strongly:

| Source | Primary Contribution |
|--------|---------------------|
| Template_V2.md | Structure, goals, learning patterns, closing philosophy |
| Template_V2_Claude.md | Vocabulary tools, symbol tables, collaborative language |
| Sample Article | Specific warmth, personal voice, vivid language, permission-giving |

**The gap both identified:** Templates capture the philosophy but miss the specific, vivid, personal warmth of the sample article. Template V3 must provide not just principles, but actual phrases writers can use.

---

## Part 1: Elements to Keep

### From Template_V2.md

| Element | Include In V3 | Reason |
|---------|---------------|--------|
| **3 Explicit Goals** | YES | Sets philosophical foundation before tactics |
| **"Scared but won't admit it"** | YES | More emotionally specific than "embarrassed" |
| **5 Named Learning Patterns** | YES | Writers pick the right pattern for content |
| **4-Step Complex Template** | YES | Step 4 (summarize) closes the loop |
| **"What you'll see"** in mistakes | YES | Helps readers recognize their errors |
| **"Comprehension beats brevity"** | YES | Permission to be thorough |
| **Philosophy anchor** | YES | Memorable closing mindset |

### From Template_V2_Claude.md

| Element | Include In V3 | Reason |
|---------|---------------|--------|
| **"The End Goal: Fluency" opening** | YES | Most important insight first |
| **Vocabulary Progression Table** | YES | Actionable 4-stage journey |
| **Target Vocabulary List** | YES | Measurable fluency goal |
| **"NEW:" Section Labels** | YES | Scannable organization |
| **Symbol Explanation Table** | YES | Quick reference for writers |
| **"Use 'We' and 'Let's'"** | YES | Collaborative warmth |
| **"Show Solidarity"** | YES | Names the technique explicitly |
| **"Why is it called that?"** | YES | Helps terms stick |
| **Good/Bad Contrast Format** | YES | Actionable guidance |

### From Both (Shared)

| Element | Status |
|---------|--------|
| "Write AS IF you ARE a beginner" philosophy | KEEP |
| Context Before Content | KEEP |
| Ground in Game Experience | KEEP |
| Simplest Thing First | KEEP |
| Explain Every Line | KEEP |
| Tell Them Where It Goes | KEEP |
| Anticipate Failure | KEEP |
| Give Them a Win | KEEP |
| Emotional Scaffolding concept | KEEP |
| Define Everything concept | KEEP |
| Pattern Teaching | KEEP |
| Vocabulary Building toward fluency | KEEP |
| Split criteria (10+ TOC, 15 min, etc.) | KEEP |
| Quality checklists | KEEP |

---

## Part 2: Elements to Add (Missing from Both)

Both developers identified the same gaps. These MUST be added to Template V3:

### 1. Rhythm of Reassurance

**Problem:** Templates mention "emotional scaffolding" once. The sample article has it THROUGHOUT.

**Solution:** Add explicit guidance on WHEN to place emotional checkpoints:

```markdown
### When to Add Emotional Checkpoints

Add reassurance after:
- Any code block over 10 lines
- Any list of 5+ items
- Any section introducing new terminology
- Before saying "now let's go deeper"

The reader should never go more than 2-3 paragraphs without hearing
"this is okay" or "let's take this one piece at a time."

Don't clump all your empathy at the start. Distribute it throughout.
```

### 2. Signposting / Road-mapping

**Problem:** The sample article tells readers what's coming. Neither template teaches this.

**Solution:** Add signposting guidance with examples:

```markdown
### Signposting

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

This prevents readers from feeling lost when you pause the main
thread to explain something foundational.
```

### 3. Permission-Giving Language

**Problem:** The sample explicitly gives readers freedom. Templates only imply this.

**Solution:** Add dedicated section:

```markdown
### Give Permission

Many beginners are afraid to deviate from examples. Explicitly tell them they can:

**Permission to organize:**
- "This is how I organize it - you can do whatever makes sense to you."
- "There's no 'right' way to order these properties."
- "Feel free to rename this file to something that makes sense for your mod."
- "These groups I made up are nothing official."

**Permission to not understand:**
- "You don't need to memorize all of this right now."
- "It's okay to copy-paste for now and understand later."
- "You can always come back to this section."

**Permission to experiment:**
- "Try changing this value and see what happens."
- "Break it on purpose - you'll learn more that way."
- "Your mod, your rules."
```

### 4. Vivid, Physical Metaphors

**Problem:** Both templates mention metaphors but don't emphasize vividness.

**Solution:** Emphasize quality of imagery:

```markdown
### Use Vivid, Physical Metaphors

Don't say: "This might be a lot of information."
Do say: "This is like drinking from a firehose."

Physical, visceral metaphors land better than abstract ones:
- "Russian nesting dolls" (not "nested structures")
- "A container that holds things" (not "an encapsulation mechanism")
- "Like a recipe - ingredients on top, result at bottom" (not "declarative syntax")
- "Ownership - the Katana belongs to Base" (not "namespaced reference")
- "Drinking from a firehose, half waterboarded" (not "potentially overwhelming")
```

### 5. The "I Remember" / Personal Voice Technique

**Problem:** Neither template explicitly permits using "I" or sharing personal struggles.

**Solution:** Add explicit guidance:

```markdown
### Share Your Own Journey

You are allowed - encouraged, even - to use "I":

- "When I first saw this file, I wanted to close it immediately."
- "I spent hours confused by this before it clicked."
- "That was just me? Okay, moving on then."
- "At least for me, this was the hardest part."
- "I hope this helps!"

This isn't about you - it's about showing that confusion is a normal
part of the journey, not a sign of inadequacy.

You're not writing a textbook. You're a modder helping another modder.
```

### 6. Mid-Article Key Takeaway Boxes

**Problem:** Templates only have summaries at the end.

**Solution:** Add mid-article summary guidance:

```markdown
### Mid-Article Summaries

Add "Key Takeaway" boxes after complex concepts, not just at the end:

> **Key Takeaway**
> This pattern of declaration, name, and content container is what
> we'll use in all our .txt scripts.

Place these after any explanation that took more than 3 paragraphs.
They give readers a checkpoint - confirmation they understood correctly.
```

### 7. In-Article Pattern Repetition

**Problem:** Templates say to repeat patterns across articles, not within the same article.

**Solution:** Add explicit within-article repetition guidance:

```markdown
### Repeat Patterns 3+ Times Within an Article

Core concepts should appear multiple times in the SAME article:
1. First introduction (prose explanation)
2. Annotated example (visual breakdown)
3. Different context (another application)
4. Summary statement ("That is the pattern: ...")

The sample article shows the declaration pattern:
- First with modules
- Then with items inside modules
- Then with a fully annotated visual
- Then summarized in words

Repetition isn't redundancy - it's reinforcement.
```

### 8. Warmth Levels by Article Type

**Problem:** Both templates define article types but don't specify warmth variation.

**Solution:** Add warmth guidance per type:

```markdown
### Warmth by Article Type

| Type | Emotional Scaffolding | Notes |
|------|----------------------|-------|
| Tutorial | HIGH | First exposure - lots of reassurance and checkpoints |
| Concept | MEDIUM | Some scaffolding, focus on "why" explanations |
| Reference | LOW | Readers are looking things up - can be more technical |
| Guide | MEDIUM-HIGH | System overview - acknowledge complexity |

Reference articles CAN be drier. Tutorials MUST be warm.
```

### 9. The "Note:" Callout Pattern

**Problem:** Neither template addresses tangential information.

**Solution:** Add callout guidance:

```markdown
### Use "Note:" for Tangents

When you have useful but tangential information, use a callout:

> **Note:** Lua is a programming language that The Indie Stone (PZ dev
> company) chose to build the public facing game on.

This lets curious readers learn more without interrupting the main
flow for readers who want to stay focused.

Use sparingly - if you have many notes, consider whether that
information should be in the main text or a separate article.
```

### 10. Phrase Libraries

**Problem:** Templates say "acknowledge overwhelm" but don't provide specific language.

**Solution:** Include actual phrase libraries:

```markdown
### Phrase Library: Acknowledging Overwhelm

Pick and adapt:
- "This is like drinking from a firehose."
- "If you feel half waterboarded looking at this, you're not alone."
- "And then close it, cry a little, and feel completely overwhelmed... No? That was just me."
- "If this is clear as mud, that's okay."
- "We all started there."
- "This looks scary. It's not - but it looks scary."
- "If you're feeling overwhelmed, that's normal."

### Phrase Library: Promising Manageability

- "But if we take it one piece at a time..."
- "However, if we slow down and look at this one line at a time..."
- "It's not as intimidating as it might seem at first."
- "Let's break this down."
- "Once you see the pattern, it becomes simple."
- "There's actually less here than it looks like."

### Phrase Library: Personal Warmth

- "I hope this helps!"
- "At least for me, this was the confusing part."
- "When I first saw this, I wanted to close the file and pretend it didn't exist."
- "Let's not talk about that then. Moving on..."
- "Okay, so..."
- "Take your time with this one."
- "This will make more sense once you try it."
```

---

## Part 3: Template V3 Structure

The recommended structure, agreed upon by both developers:

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
   - Use "I" for Personal Experience
   - Permission-Giving Language
   - Rhythm of Reassurance (WHEN to add checkpoints)
   - Use Vivid Physical Metaphors

## NEW: Pattern Teaching
   - 5 Learning Patterns (with templates)
   - 4-Step Complex Section Template (acknowledge → promise → prove → summarize)
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
   - Symbol explanation table (., {}, =, etc.)
   - Terms definition table
   - Include "obvious" navigation details

## NEW: Reorganize for Teaching
   - Don't just dump raw data
   - Organize logically with comments
   - Explain and give permission for the reorganization

## Voice and Tone
   - Be Conversational
   - Be Encouraging (But Not Dismissive) [with good/bad contrast]
   - Use Self-Deprecating Humor (Sparingly)
   - Define Jargon Immediately (But Use It)
   - Use "Note:" for Tangents

## When to Split an Article
   - Split rules (10+ TOC, 15 min read, mixed levels, etc.)
   - One article = One concept or one task

## Article Template
   - Full template with all sections
   - "What you'll see" in Common Mistakes
   - Section dividers (---) for visual structure
   - Mid-article Key Takeaway boxes

## Article Types (with Warmth Levels)
   - Tutorial: HIGH warmth
   - Concept: MEDIUM warmth
   - Reference: LOW warmth (can be drier)
   - Guide: MEDIUM-HIGH warmth

## Quality Checklist v3
   - Context
   - Examples
   - Practical
   - Errors
   - Definitions (NEW)
   - Vocabulary Building (NEW)
   - Emotional Scaffolding (NEW)
   - Pattern Teaching (NEW)
   - Organization (NEW)
   - Structure

## Phrase Libraries (Quick Reference)
   - Acknowledging Overwhelm
   - Promising Manageability
   - Personal Warmth
   - Permission-Giving
   - Signposting

## The Philosophy (Closing Anchor)
   > "The published version is written FOR beginners.
   > Your version should be written AS IF YOU ARE a beginner."

   > "They're not stupid. They're just new. Treat them accordingly."

   Write for the person who's about to give up. Write the article that keeps them going.
```

---

## Part 4: Final Checklist for Template V3

### Must Include from Template_V2.md
- [ ] 3 Explicit Goals section
- [ ] "Scared but won't admit it" audience description
- [ ] 5 Named Learning Patterns with templates
- [ ] 4-Step Complex Section Template (including "summarize the pattern")
- [ ] "What you'll see" format in Common Mistakes
- [ ] "Comprehension beats brevity" permission
- [ ] Philosophy anchor at the end

### Must Include from Template_V2_Claude.md
- [ ] Opening with "The End Goal: Fluency"
- [ ] Vocabulary Progression Table (4 stages)
- [ ] Target Vocabulary List
- [ ] "NEW:" Section Labels for scanability
- [ ] Symbol Explanation Table
- [ ] "Use 'We' and 'Let's'" guidance
- [ ] "Show Solidarity" section
- [ ] "Why is it called that?" pattern
- [ ] Good/Bad Contrast format throughout

### Must Add NEW (from both analyses)
- [ ] Rhythm of Reassurance (WHEN to place emotional checkpoints)
- [ ] Signposting / Road-mapping with examples
- [ ] Permission-Giving Language section
- [ ] Vivid Physical Metaphor emphasis
- [ ] The "I Remember" Technique
- [ ] Personal "I" voice permission
- [ ] Mid-Article Key Takeaway Boxes guidance
- [ ] In-Article Pattern Repetition (3+ times within same article)
- [ ] Warmth Levels by Article Type table
- [ ] "Note:" Callout Pattern guidance
- [ ] Phrase Libraries (Overwhelm, Manageability, Personal Warmth)

---

## Summary

This document represents the complete, unified requirements for Template V3. Both developers agree on:

1. **What to keep** - All core principles from both templates
2. **What to add** - 10 missing elements that provide the specific warmth of the sample
3. **How to structure** - A clear outline for the final template
4. **What to provide** - Actual phrase libraries, not just principles

**The key insight remains:**
> Don't write *for* beginners. Write *as if you ARE* a beginner.

Template V3 will give writers not just the philosophy, but the specific tools, phrases, and examples they need to write with genuine warmth.

---

## Ready for Implementation

With this final unified plan, we can now create **Template_V3.md** by following the structure above and including all checked items.
