# Unified Template V3 Requirements

> Synthesizing both developer comparisons to create the definitive article standards template.

---

## Summary of Comparisons

Both developers analyzed the same two templates and independently identified:
- **Template_V2.md** - Strong on structure, patterns, and goals
- **Template_V2_Claude.md** - Strong on vocabulary progression and technical reference

Both comparisons agree on what's missing: the **specific warmth, personal voice, and emotional language** from the sample article.

---

## Elements to KEEP (Both Comparisons Agree)

These core principles appear in both templates and should remain:

| Principle | Status |
|-----------|--------|
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

## Best Elements from Template_V2.md

Both comparisons identified these as strong:

### 1. Three Explicit Goals
```markdown
1. Help People Become Modders
2. Build Technical Fluency Over Time
3. Create Confidence, Not Dependency
```
**Include:** Goal 3 especially - "The ultimate success is a reader who no longer needs our wiki."

### 2. "Scared but won't admit it" Audience Description
```markdown
They're worried they're "not smart enough" or "not a real programmer."
They need permission to feel confused.
```
**Include:** More emotionally specific than generic "embarrassed to ask."

### 3. Five Named Learning Patterns
1. Concept → Example → Breakdown → Practice
2. Problem → Solution → Why
3. Build Up Gradually (Version 1, 2, 3)
4. Mistake → Fix → Consequence
5. **Overwhelm → Acknowledge → Break Down** (explicitly named)

**Include:** Writers can pick the right pattern for their content type.

### 4. Four-Step Complex Section Template
```markdown
1. Acknowledge the overwhelm - "This looks like a lot."
2. Promise it's manageable - "But if we take it one piece at a time..."
3. Prove it step by step - Break it down with explanations
4. Summarize the pattern - "That's all there is to it: [pattern]"
```
**Include:** Step 4 (summarize) is critical - it closes the loop.

### 5. "What you'll see" in Common Mistakes
```markdown
❌ **Doesn't work:**
[Broken code]

**What you'll see:** [Error message or symptom]

✅ **Works:**
[Fixed code]
```
**Include:** Helps readers recognize when they've made this specific mistake.

### 6. "Comprehension beats brevity" Note
```markdown
A longer article that the reader understands is better than a short one
that leaves them confused.
```
**Include:** Explicit permission to be thorough.

### 7. Closing Philosophy
```markdown
"They're not stupid. They're just new. Treat them accordingly."
```
**Include:** Memorable, compassionate closing anchor.

---

## Best Elements from Template_V2_Claude.md

Both comparisons identified these as strong:

### 1. Opening with "The End Goal: Fluency"
Front-and-center positioning of the vocabulary-building mission.

**Include:** The most important insight should be first, not buried.

### 2. Detailed Vocabulary Progression Table
```markdown
| Stage | How We Use "Callback" |
|-------|----------------------|
| First mention | "a **callback** (a function that runs later when something happens)" |
| Second mention | "the callback (remember: the function that runs when clicked)" |
| Third mention | "the callback function" |
| Later articles | "the callback" - they know what this means now |
```
**Include:** Concrete, actionable progression.

### 3. Target Vocabulary List
```markdown
By the time someone has read 5-10 of our articles, they should be comfortable with:
- Callback, hook, event, listener
- Module, namespace, scope
- Instance, object, instantiate
- Property, value, parameter
- Client, server, shared
```
**Include:** Sets a measurable fluency goal.

### 4. Symbols and Notation Table
```markdown
| Symbol | Meaning |
|--------|---------|
| `.` | "Possession - `Base.Katana` means the Katana that belongs to Base" |
| `{}` | "Content container - everything between these braces belongs together" |
| `=` | "Assignment - 'this property gets this value'" |
```
**Include:** Quick reference for consistent explanations.

### 5. Terms Definition Table
```markdown
| Term | Define It |
|------|-----------|
| module | "A named group that prevents naming conflicts - like a folder..." |
| declaration | "The keyword that tells the game what type of thing you're defining" |
```
**Include:** Ensures consistent definitions across articles.

### 6. "Why is it called that?" Pattern
```markdown
> Why is it called a "declaration"? Because when you type `module` or `item`,
> you're *declaring* to the game engine: "Hey! I'm about to tell you about a
> module/item." The word declares your intent.
```
**Include:** Helps terms stick by explaining their etymology.

### 7. "Use 'We' and 'Let's'" Section
```markdown
- "Let's look at what this means..."
- "We need to understand X before we can do Y..."
- "Let's break this down..."
```
**Include:** Collaborative language creates warmth.

### 8. "NEW:" Section Labels
Makes the template scannable - writers can quickly find new additions vs. standard practices.

**Include:** Good organizational pattern.

---

## Elements MISSING from BOTH Templates

Both comparisons independently identified these gaps:

### 1. Specific Emotional Language Library

**The Problem:** Both templates say "acknowledge overwhelm" but don't provide the vivid, specific language from the sample article.

**The Sample Uses:**
- "drinking from a firehose, half waterboarded"
- "cry a little, and feel completely overwhelmed… No? That was just me."
- "If this is clear as mud, that's okay"
- "We all started there"
- "I hope this helps!"

**ADD:** A library of specific phrases writers can use or adapt:

```markdown
### Empathy Phrases Library

**When showing something complex:**
- "This looks like a lot. That's because it is."
- "If you're feeling overwhelmed, that's normal."
- "This is like drinking from a firehose."

**When acknowledging confusion:**
- "If this is clear as mud, that's okay."
- "I remember being completely lost at this point."
- "We all started there."

**When the reader might feel inadequate:**
- "This isn't intuitive at first - you're not missing something obvious."
- "If this clicked immediately, you're ahead of most of us."
- "That was just me? Okay, moving on then."

**When closing a section:**
- "I hope this helps!"
- "Take your time with this one."
- "This will make more sense once you try it."
```

### 2. The Personal "I" Voice

**The Problem:** Neither template explicitly permits using "I" or sharing personal experience.

**The Sample Uses:**
- "That was just me"
- "at least for me"
- "I will take the liberty of grouping things"
- "I hope this helps!"
- "When I first saw..."

**ADD:** Explicit guidance to use first person:

```markdown
### Share Your Own Journey

You are allowed - encouraged, even - to use "I":

- "When I first saw this file, I wanted to close it immediately."
- "I spent hours confused by this before it clicked."
- "That was just me? Okay, moving on then."

This isn't about you - it's about showing that confusion is a normal part
of the journey, not a sign of inadequacy. Readers trust "I remember being
confused too" more than "this is easy."
```

### 3. Mid-Article "Key Takeaway" Summaries

**The Problem:** Both templates only have summary sections at the end.

**The Sample Has:**
```markdown
> **Key Takeaway**
> This pattern of declaration, name, and content container is the pattern
> that we will be using in our .txt scripts.
```

**ADD:** Guidance to add mini-summaries after each complex concept:

```markdown
### Mid-Article Summaries

Don't wait until the end to summarize. After each complex concept, add a
"Key Takeaway" box:

> **Key Takeaway:** [One sentence summary of what they just learned]

This reinforces learning and gives readers a checkpoint to ensure they
understood before moving on.
```

### 4. Transitional Signposting

**The Problem:** Neither template teaches how to bridge between sections.

**The Sample Uses:**
- "Before we get into changing text files, we need to understand..."
- "Now that we have talked about module declarations... let's talk about items"
- "So, let's open the Base.Katana item back and take a look at this again"

**ADD:** Signposting examples:

```markdown
### Signposting Transitions

Tell readers where you're going, especially before tangents:

**Before a prerequisite:**
- "Before we can do X, we need to understand Y."
- "This will make more sense after the next section - trust me."

**Between major sections:**
- "Now that we understand X, let's see how Y fits in."
- "We've covered the basics. Let's look at a real example."

**Returning to the main thread:**
- "Let's get back to our [topic]."
- "So, let's open [file] again and take another look."
```

### 5. Permission-Giving Language

**The Problem:** Both templates imply it but neither makes it explicit.

**The Sample Uses:**
- "These groups I made up are nothing official"
- "you can group and arrange your properties however you want"
- "The order doesn't matter, so I'll reorganize"
- "Be creative, but note that..."

**ADD:** New section on giving permission:

```markdown
### Give Permission

Many beginners are afraid to deviate from examples. Explicitly tell them they can:

**Permission to organize:**
- "This is how I organize it - you can do whatever makes sense to you."
- "There's no 'right' way to order these properties."
- "Feel free to rename this file to something that makes sense for your mod."

**Permission to not understand:**
- "You don't need to memorize all of this right now."
- "It's okay to copy-paste for now and understand later."
- "You can always come back to this section."

**Permission to experiment:**
- "Try changing this value and see what happens."
- "Break it on purpose - you'll learn more that way."
- "Your mod, your rules."
```

### 6. Vivid Physical Metaphors

**The Problem:** Both templates mention metaphors but don't emphasize vividness.

**The Sample Uses:**
- "drinking from a firehose"
- "half waterboarded"
- "Russian nesting dolls"
- "like a folder for organizing related things"

**ADD:** Guidance on metaphor quality:

```markdown
### Use Vivid, Physical Metaphors

Don't say: "This might be a lot of information."
Do say: "This is like drinking from a firehose."

Physical, visceral metaphors land better than abstract ones:
- "Russian nesting dolls" (not "nested structures")
- "A container that holds things" (not "an encapsulation mechanism")
- "Like a recipe - ingredients on top, result at bottom" (not "declarative syntax")
- "Ownership - the Katana belongs to Base" (not "namespaced reference")
```

### 7. Pattern Repetition WITHIN Same Article

**The Problem:** Both templates talk about pattern teaching but don't specify frequency.

**The Sample Repeats the declaration pattern 3+ times in ONE article:**
1. First with modules
2. Then with items inside modules
3. Then with a fully annotated visual

**ADD:** Explicit repetition guidance:

```markdown
### Repeat Patterns 3+ Times

Core patterns should appear multiple times in the SAME article:

1. **First introduction** (conceptual explanation)
2. **Second appearance** (annotated example)
3. **Third appearance** (different context or visual)
4. **Summary statement** ("That's all there is to it: [pattern]")

This isn't redundancy - it's how learning works. Each repetition adds a
new angle. By the third time, the pattern clicks.
```

### 8. The "Note:" Callout Pattern

**The Problem:** Neither template addresses tangential information.

**The Sample Uses:**
```markdown
> Note: Lua is a programming language that the Indie Stone (PZ dev company)
> chose to build the public facing game on.
```

**ADD:** Guidance on callouts:

```markdown
### Use "Note:" for Tangents

When you have useful but tangential information, use a callout:

> **Note:** [Tangential but useful information]

This lets curious readers learn more without interrupting the main flow
for readers who want to stay focused.
```

### 9. Warmth Levels by Article Type

**The Problem:** Neither template specifies how warmth should vary.

**ADD:**

```markdown
### Warmth by Article Type

| Type | Emotional Scaffolding | Why |
|------|----------------------|-----|
| Tutorial | HIGH | First exposure - lots of reassurance and checkpoints |
| Concept | MEDIUM | Some scaffolding, focus on "why" explanations |
| Reference | LOW | Readers are looking things up - can be more technical |
| Guide | MEDIUM-HIGH | System overview - acknowledge complexity |

Reference articles can be drier. Tutorials should feel like a patient mentor.
```

### 10. Rhythm of Reassurance

**The Problem:** Both templates have ONE emotional scaffolding section. The sample has them THROUGHOUT.

**ADD:**

```markdown
### When to Add Emotional Checkpoints

The reader should never go more than 2-3 paragraphs without hearing
"this is okay" or "let's take this one piece at a time."

Add a reassurance after:
- Any code block over 10 lines
- Any list of 5+ items
- Any section introducing new terminology
- Before saying "now let's go deeper"

Don't clump all your empathy at the start. Distribute it throughout.
```

---

## Template V3 Structure

Based on both comparisons, here's the recommended structure:

```
# Wiki Article Standards v3

## The End Goal: Fluency [from V2_Claude - front and center]
   Brief: we're building modders who can speak the language

## Our Goals [from V2 - explicit 3 goals]
   1. Help People Become Modders
   2. Build Technical Fluency Over Time
   3. Create Confidence, Not Dependency

## Our Audience [merged - add "scared but won't admit it"]

## Core Principles [keep the 7 originals]
   1. Context Before Content
   2. Ground in Game Experience
   3. Simplest Thing First
   4. Explain Every Line (And Every Symbol)
   5. Tell Them Where It Goes
   6. Anticipate Failure (And Explain Consequences)
   7. Give Them a Win

## NEW: Emotional Scaffolding [expanded]
   - Acknowledge overwhelm
   - Promise manageability
   - Prove it step by step
   - Summarize the pattern (4-step template)
   - Share YOUR confusion ("I remember...")
   - Rhythm of reassurance (distributed throughout)
   - Empathy phrases library

## NEW: Give Permission [new section]
   - Permission to feel confused
   - Permission to organize their way
   - Permission to not understand everything
   - Permission to experiment

## NEW: Pattern Teaching [from V2 - 5 patterns]
   - Five named patterns
   - Repeat 3+ times in same article
   - Signposting transitions

## NEW: Build Technical Vocabulary [merged]
   - Progression stages (introduction → fluency)
   - Target vocabulary list
   - "Why is it called that?" technique

## NEW: Define Everything [from V2_Claude]
   - Symbol explanation table
   - Terms definition table
   - Programmer notation explained

## NEW: Reorganize for Teaching [from both]

## Learning Patterns [from V2 - all 5]

## When to Split an Article [shared]

## Article Template [merged - with mid-article summaries, signposting]

## Voice and Tone [expanded]
   - Be Conversational
   - Use "We" and "Let's"
   - Use "I" and Share Your Journey
   - Be Encouraging (with contrast examples)
   - Show Solidarity
   - Use Vivid Physical Metaphors
   - Define Jargon (but use it)
   - The "Note:" Pattern

## Warmth by Article Type [new]

## Quality Checklist v3 [merged - comprehensive]

## Empathy Phrases Library [new - quick reference]

## The Philosophy [from V2 - closing anchor]
   "They're not stupid. They're just new. Treat them accordingly."
```

---

## Action Items for Template V3

### Directly Merge (copy best version)
- [ ] Three explicit goals (from V2)
- [ ] "Scared but won't admit it" audience description (from V2)
- [ ] Five named learning patterns (from V2)
- [ ] Four-step complex section template (from V2)
- [ ] Vocabulary progression table (from V2_Claude)
- [ ] Target vocabulary list (from V2_Claude)
- [ ] Symbol/notation table (from V2_Claude)
- [ ] Terms definition table (from V2_Claude)
- [ ] "Why is it called that?" pattern (from V2_Claude)
- [ ] "Use We and Let's" section (from V2_Claude)
- [ ] "Comprehension beats brevity" note (from V2)
- [ ] Closing philosophy line (from V2)

### Write New Sections
- [ ] Empathy phrases library (specific vivid language)
- [ ] "Share Your Own Journey" (personal I voice)
- [ ] Mid-article summaries guidance
- [ ] Transitional signposting examples
- [ ] "Give Permission" section
- [ ] Vivid metaphor guidance
- [ ] In-article pattern repetition (3+ times)
- [ ] "Note:" callout pattern
- [ ] Warmth levels by article type
- [ ] Rhythm of reassurance guidance

### Update Existing Sections
- [ ] Expand emotional scaffolding with 4-step template
- [ ] Update quality checklist with new items
- [ ] Add "What you'll see" to common mistakes format

---

## Summary

| Source | Contribution |
|--------|--------------|
| Template_V2.md | Structure, goals, patterns, closing philosophy |
| Template_V2_Claude.md | Vocabulary tools, symbol tables, collaborative language |
| Sample Article | Specific warmth, personal voice, vivid language, permission-giving |

**The unified Template V3 will be comprehensive, warm, and actionable.**

Both developers agree: the templates capture the philosophy but miss the specific warmth. Template V3 needs to give writers not just principles, but actual phrases they can use.

---

## Ready for Template V3

This document contains all requirements for creating the final Template V3. The next step is to write `Template_V3.md` incorporating all elements above.
