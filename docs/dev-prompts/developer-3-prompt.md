# Developer #3: V3 Article Conversion Assignment

## Your Mission

Convert **26 articles** from the Dystopian Outcasts Project Zomboid Wiki to V3 Article Standards. You will work through each article methodically, converting it, reviewing it with extreme scrutiny, implementing your own feedback, and only committing when the article meets V3 standards perfectly.

---

## Your Articles (26 total)

Work through these articles **in the order listed**:

1. `content/articles/pz/build-41/modding/recipes/first-recipe-file.md`
2. `content/articles/pz/build-41/modding/recipes/recipe-anatomy.md`
3. `content/articles/pz/build-41/modding/recipes/recipe-basics.md`
4. `content/articles/pz/build-41/modding/recipes/recipe-ingredients.md`
5. `content/articles/pz/build-41/modding/recipes/testing-recipes.md`
6. `content/articles/pz/build-41/modding/recipes/vanilla-recipe-anatomy.md`
7. `content/articles/pz/build-41/modding/reference/events.md`
8. `content/articles/pz/build-41/modding/reference/farming.md`
9. `content/articles/pz/build-41/modding/reference/fixing.md`
10. `content/articles/pz/build-41/modding/reference/globals.md`
11. `content/articles/pz/build-41/modding/reference/script-properties.md`
12. `content/articles/pz/build-41/modding/reference/vehicles.md`
13. `content/articles/pz/build-41/modding/setup/debug-mode.md`
14. `content/articles/pz/build-41/modding/setup/mod-folder-structure.md`
15. `content/articles/pz/build-41/modding/setup/mod-info-file.md`
16. `content/articles/pz/build-41/modding/setup/vscode-setup.md`
17. `content/articles/pz/build-41/modding/tools/mod-quickstart.md`
18. `content/articles/pz/build-41/modding/tools/tilezed-setup.md`
19. `content/articles/pz/build-41/modding/tools/tilezed.md`
20. `content/articles/pz/build-41/modding/tools/worlded.md`
21. `content/articles/pz/build-41/modding/ui-framework/isui-buttons.md`
22. `content/articles/pz/build-41/modding/ui-framework/isui-lifecycle.md` **(V3 - needs [Object object] update)**
23. `content/articles/pz/build-41/modding/ui-framework/isui-overview.md`
24. `content/articles/pz/build-41/modding/ui-framework/isui-panels.md`
25. `content/articles/pz/build-41/modding/ui-framework/isui-text-input.md`
26. `content/articles/pz/build-41/mapping/video-tutorials/map-making-quick-guide.md`

---

## V3 Article Standards Reference

**CRITICAL:** Read and internalize this document completely before starting any conversions:

**File:** `docs/article-standards.md`

This 28KB document contains the complete V3 Article Standards methodology, including:

- Emotional scaffolding (acknowledge overwhelm → promise manageability → prove it)
- Game experience openings (start with in-game observation)
- Simplest example first (5-line minimum viable code)
- Progressive building (Version 1 → 2 → 3)
- Common Mistakes sections (wrong/right code comparisons)
- Try It Yourself sections (step-by-step verification)
- `[Object object]` placeholder explanations with PZ-specific examples
- Exact patterns and templates for each section

**You must follow this template religiously.** Every deviation from V3 standards must be justified.

---

## Your Workflow (For EACH Article)

### Step 1: Convert the Article

1. Open the article file in your editor
2. Read the existing content thoroughly
3. Apply V3 Article Standards transformation:
   - Add emotional scaffolding opening
   - Start with game experience (what player sees/does)
   - Create simplest possible example (5+ lines of working code)
   - Build progressively (Version 1 → 2 → 3 if applicable)
   - Add Common Mistakes section (wrong code → right code comparisons)
   - Add Try It Yourself section (step-by-step verification)
   - Explain ALL placeholders like `[Object object]` with PZ examples
   - Use beginner-friendly language (avoid jargon, explain technical terms)
   - Add inline code comments explaining what each line does

4. Save your changes to the file (do NOT commit yet)

### Step 2: Switch to Reviewer Role

**You are now a strict V3 Article Standards reviewer.** Your job is to catch EVERY deviation from the template.

5. Re-read the article with extreme scrutiny
6. **Write your feedback directly in the article file** as HTML comments at the locations where issues exist:

```markdown
<!-- REVIEWER FEEDBACK:
- Issue: Opening doesn't acknowledge emotional overwhelm
- Fix needed: Add "If you're feeling overwhelmed by..." paragraph before game experience
- Location: Right here, before the current first paragraph
-->
```

7. Check for these specific issues (non-exhaustive list):
   - Missing emotional scaffolding (acknowledge → promise → prove)
   - No game experience opening or weak opening
   - First code example is too complex (should be 5-line minimal viable)
   - Code lacks inline comments explaining each line
   - No Common Mistakes section or weak comparisons
   - No Try It Yourself section or vague steps
   - `[Object object]` or other placeholders not explained with PZ examples
   - Jargon without definitions
   - Missing progressive building (Version 1 → 2 → 3)
   - Weak "Why This Matters" explanations
   - Missing connections to player experience

8. **If the article is perfect** (meets all V3 standards), add NO feedback comments.

9. Save the article with your feedback comments embedded

### Step 3: Switch to Senior Developer Role

**You are now the senior developer implementing the feedback.**

10. Read all reviewer feedback comments in the article
11. Implement EVERY piece of feedback thoroughly
12. Remove the feedback comments as you address them
13. Save your changes

### Step 4: Repeat Review Cycle

14. Go back to Step 2 (Reviewer Role)
15. Review the article again with fresh eyes
16. Add new feedback comments if issues remain
17. Return to Step 3 (Developer Role) and implement feedback
18. **Continue this loop until the Reviewer Role adds ZERO feedback comments**

### Step 5: Commit the Perfect Article

19. When the reviewer has nothing to add:
   ```bash
   git add content/articles/pz/build-41/modding/[category]/[article-name].md
   git commit -m "docs(v3): Convert [article-name] to V3 standards"
   ```

20. **Move to the next article in your list and start from Step 1**

---

## Critical Requirements

### Quality Standards

- **Beginner-first mindset:** Write for someone with zero modding experience
- **Game experience grounding:** Every technical concept connects to something the player sees/does in-game
- **Simplest example first:** The first code example MUST be the absolute minimum to see something work (5+ lines minimum)
- **Progressive complexity:** Build from simple → intermediate → advanced (not all at once)
- **Explain placeholders:** Every `[Object object]`, `[Vector3]`, `[String]`, etc. gets explicit PZ examples
- **Concrete code:** No pseudocode. Every example must be valid Lua that would actually run in PZ

### Self-Review Standards

**Your reviewer role must be merciless.** Catch:

- Weak openings that don't acknowledge overwhelm
- Technical jargon without definitions
- Code examples without inline comments
- Missing "Why This Matters" explanations
- Vague Try It Yourself steps
- Unexplained placeholders
- Complex first examples
- Missing progressive building
- Weak Common Mistakes sections
- No connection to player experience

### Git Commit Standards

- **One commit per completed article** (only after reviewer approves)
- Commit message format: `docs(v3): Convert [article-name] to V3 standards`
- Example: `docs(v3): Convert isui-lifecycle to V3 standards`
- **DO NOT** add `Co-Authored-By` lines to commits
- **DO NOT** commit articles that still have reviewer feedback comments

---

## Special Note: V3 Article with [Object object] Update

**You have 1 existing V3 article in your list:**

- `isui-lifecycle.md`

This article was already converted to V3 standards, but it needs the NEW `[Object object]` placeholder guidance that was just added to the V3 template.

**For this article:**

1. Read the current content carefully (it's already high-quality V3)
2. Identify any placeholders like `[Object object]`, `[String]`, `[Table]`, etc.
3. Add explicit explanations using the new pattern from `docs/article-standards.md`
4. Apply the same rigorous review cycle as other articles
5. Only commit when the reviewer confirms the placeholder explanations are perfect

**This is NOT a free pass.** Review it as critically as any other article.

---

## Example Feedback Workflow

### Article State: After Initial Conversion

```markdown
## Introduction

ISUIButtons are clickable UI elements in Project Zomboid.

<!-- REVIEWER FEEDBACK:
- Issue: Opening is too technical, doesn't acknowledge beginner overwhelm
- Fix needed: Add emotional scaffolding paragraph before this
- Pattern: "If you're feeling overwhelmed by UI creation, you're not alone. UI can seem mysterious, but buttons are actually one of the simplest elements to create. Let me show you exactly how."
- Location: Add new paragraph above this one
-->

<!-- REVIEWER FEEDBACK:
- Issue: No game experience opening
- Fix needed: Connect to player experience BEFORE introducing technical term
- Pattern: Start with "When you click the X to close your inventory, or the 'Play' button on the main menu, you're clicking ISUIButton objects."
- Location: New paragraph needed at the very top
-->
```

### Article State: After Implementing Feedback

```markdown
## Introduction

When you click the X to close your inventory, or the "Play" button on the main menu, you're clicking ISUIButton objects. Behind the scenes, these buttons are listening for your mouse clicks and responding.

If you're feeling overwhelmed by UI creation, you're not alone. Buttons might seem mysterious at first, but they're actually one of the simplest UI elements to create. Let me show you exactly how to make your first button—starting with the absolute minimum code.
```

### Article State: After Second Review (Perfect)

```markdown
## Introduction

When you click the X to close your inventory, or the "Play" button on the main menu, you're clicking ISUIButton objects. Behind the scenes, these buttons are listening for your mouse clicks and responding.

If you're feeling overwhelmed by UI creation, you're not alone. Buttons might seem mysterious at first, but they're actually one of the simplest UI elements to create. Let me show you exactly how to make your first button—starting with the absolute minimum code.
```

**No feedback comments = Ready to commit.**

---

## Validation Checklist

Before committing each article, verify:

- [ ] Opens with game experience (what player sees/does)
- [ ] Has emotional scaffolding (acknowledge → promise → prove)
- [ ] First code example is 5+ lines of simplest working code
- [ ] All code has inline comments explaining each line
- [ ] Has Common Mistakes section with wrong/right comparisons
- [ ] Has Try It Yourself section with step-by-step verification
- [ ] All placeholders (`[Object object]`, etc.) explained with PZ examples
- [ ] All jargon defined on first use
- [ ] Progressive building (if applicable) from Version 1 → 2 → 3
- [ ] Strong "Why This Matters" explanations throughout
- [ ] No reviewer feedback comments remain in file
- [ ] Beginner could follow this article with zero prior knowledge

---

## Important Notes

1. **Do not skip the review cycle.** Even if you think the article is perfect, review it formally as the reviewer role.

2. **Do not batch commits.** Each article gets one commit only after it passes review.

3. **Do not move to the next article until the current one is committed.** Complete the full workflow for each article before starting the next.

4. **The 1 V3 article in your list has already been partially converted.** You must still apply the NEW `[Object object]` placeholder guidance that was just added to the V3 template. Review it as rigorously as any other article.

5. **You have the full codebase.** Reference other articles for examples, check `docs/article-standards.md` frequently, and ensure consistency.

6. **Time estimate:** Each article will take 2-4 hours. You have 26 articles = 52-104 hours of work. Pace yourself but maintain quality.

---

## Questions or Issues?

If you encounter:

- **Unclear V3 standards:** Re-read the specific section in `docs/article-standards.md`
- **Article doesn't fit V3 pattern:** Flag it for discussion, but attempt conversion first
- **Technical inaccuracy in existing content:** Fix it as part of your conversion
- **Missing information:** Research PZ documentation/code and add it

---

## Success Criteria

You will have successfully completed this assignment when:

1. All 26 articles are converted to V3 standards
2. All 26 articles have been committed individually (26 git commits)
3. Each commit follows the format: `docs(v3): Convert [article-name] to V3 standards`
4. Each article would receive zero feedback from a V3-strict reviewer
5. A complete beginner could follow any of your articles and successfully create their first mod

---

## Start Now

Begin with article #1: `content/articles/pz/build-41/modding/recipes/first-recipe-file.md`

Read it, convert it, review it, implement feedback, repeat until perfect, commit it, then move to #2.

**Good luck! Your work will make modding accessible to thousands of new Project Zomboid modders.**
