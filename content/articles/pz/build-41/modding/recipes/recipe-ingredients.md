---
id: recipes-recipe-ingredients
slug: recipe-ingredients
title: "Recipe Ingredients Deep Dive"
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - recipe
  - ingredients
  - tools
  - learning-path
  - advanced
excerpt: "Master advanced recipe ingredient patterns: alternatives, type functions, quantities, tool behavior, and balancing techniques."
table_of_contents:
  - text: "What Is This Guide?"
    link: "#what-is-this-guide"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Basic Ingredient Patterns"
    link: "#basic-ingredient-patterns"
  - text: "Alternative Items (OR Logic)"
    link: "#alternative-items-or-logic"
  - text: "Item Type Functions"
    link: "#item-type-functions"
  - text: "Quantity Patterns"
    link: "#quantity-patterns"
  - text: "Tool Behavior"
    link: "#tool-behavior"
  - text: "Special Ingredients"
    link: "#special-ingredients"
  - text: "Advanced Pattern Combinations"
    link: "#advanced-pattern-combinations"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Designing Balanced Recipes"
    link: "#designing-balanced-recipes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Testing Your Recipe"
    path: /build-41/modding/recipes/testing-recipes
  - title: "Anatomy of an Item"
    path: /build-41/modding/items/item-anatomy
last_updated: 2026-01-28
---

# Recipe Ingredients Deep Dive

> You're going to master the advanced ingredient patterns that make recipes flexible, realistic, and player-friendly. By the end, you'll know how to create recipes that accept alternative items, use item type matching, and balance complexity with usability.

---

## What Is This Guide?

You know how some Project Zomboid recipes let you use any knife (kitchen knife, hunting knife, butter knife) while others require a specific tool? Or how some recipes accept either planks or pallets as materials? Those flexible recipes use **advanced ingredient patterns** - techniques that make recipes more forgiving and realistic.

**This guide covers:**
- Alternative items (OR logic) - accepting multiple item types
- Item type functions - matching any item with a specific tag
- Quantity patterns - requiring specific amounts
- Tool behavior - understanding `keep` and durability
- Special ingredients - water, drainables, and empty containers
- Balance considerations - designing recipes that feel fair

Think of basic ingredients as building with Lego bricks of one color - it works, but it's limiting. Advanced ingredient patterns are like having every color available - you can create recipes that adapt to what players actually find in the world.

**You would use advanced patterns when:**
- Creating realistic recipes (any knife should sharpen a stick, not just one specific knife)
- Making player-friendly recipes (accept planks OR logs for flexibility)
- Balancing progression (require specific rare tools for advanced crafts)
- Designing mod compatibility (use item type functions so other mods' items work)

If you've ever created a recipe and thought "but players might not have THAT specific item" - that's when you need advanced patterns. When I first started modding, I made recipes that required hyper-specific items, and players complained they could never find the exact screwdriver or exact knife. Learning alternative items and type functions solved that problem completely.

---

## Prerequisites

Before diving into advanced patterns, you should understand:
- [Recipe Creation Basics](/build-41/modding/recipes/recipe-basics) - Fundamental recipe structure
- [Recipe Anatomy](/build-41/modding/recipes/recipe-anatomy) - How recipes are organized

You don't need to be an expert, but you should be comfortable creating simple recipes before tackling advanced ingredient techniques.

---

## Basic Ingredient Patterns

Let's start with the fundamental patterns, then build up to advanced techniques.

### Pattern 1: Single Item

```
recipe Example {
    TreeBranch,                        /* Requires 1 tree branch (consumed) */

    Result:SharpedStick,
    Time:40.0,
}
```

**What it means:** Player needs exactly one tree branch. When crafting completes, the branch disappears (is consumed).

**When to use:** Simple recipes where one specific item makes sense.

### Pattern 2: Multiple of Same Item

```
recipe Example {
    Plank=4,                           /* Requires 4 planks (all consumed) */

    Result:WoodenCrate,
    Time:100.0,
}
```

**What it means:** Player needs 4 planks. All 4 disappear when crafting completes.

**The syntax:** `ItemID=number` where number is the quantity.

**When to use:** Recipes that need multiple units of the same material.

### Pattern 3: Kept Item (Tool)

```
recipe Example {
    Log,                               /* Consumed */
    keep Saw,                          /* NOT consumed - stays in inventory */

    Result:Plank=3,
    Time:150.0,
}
```

**What it means:** Player needs a log and a saw. The log is consumed, but the saw stays in inventory after crafting.

**When to use:** For reusable tools like hammers, saws, knives, screwdrivers, etc.

> **Key Takeaway**
> These three patterns - single item, multiple items, and kept tools - are the building blocks. Everything else builds on these foundations.

---

## Alternative Items (OR Logic)

Alternative items let players use any of several options. This makes recipes more flexible and player-friendly.

### Two Alternatives

```
recipe Example {
    TreeBranch,
    keep KitchenKnife/HuntingKnife,    /* Either kitchen knife OR hunting knife works */

    Result:SharpedStick,
    Time:40.0,
}
```

**What it means:** Player needs either a kitchen knife or a hunting knife - whichever they have. They don't need both.

**The slash `/` means "or"** - it creates alternatives. The game checks the player's inventory and uses the first matching item it finds.

**When to use:** When multiple items logically work for the same purpose (any knife for cutting, any hammer for hammering).

### Multiple Alternatives

```
recipe Example {
    TreeBranch,
    keep Axe/WoodAxe/HandAxe/StoneAxe, /* Any of these four axes works */

    Result:Firewood,
    Time:60.0,
}
```

**What it means:** Player can use any of the four axe types. They only need one - whichever they have.

**You can chain many alternatives:** Just keep adding `/` between item IDs.

**When to use:** When there are many variations of a tool type (axes, knives, saws, etc.).

### Alternative with Quantity

```
recipe Example {
    Plank=2/Log=1,                     /* Either 2 planks OR 1 log */

    Result:SmallCrate,
    Time:80.0,
}
```

**What it means:** Player can provide either 2 planks or 1 log. Different quantities for different alternatives.

**The pattern:** `Item1=quantity1/Item2=quantity2`

**When to use:** When materials can substitute for each other at different ratios (processed vs raw materials).

> **Key Takeaway**
> The `/` symbol is your friend. Use it liberally to make recipes accept variations of similar items. Players will thank you.

---

## Item Type Functions

Item type functions are **powerful** - they let you match any item that has a specific tag, including items from other mods.

### What Are Item Type Functions?

```
recipe Example {
    Log,
    keep [Recipe.GetItemTypes.Saw],    /* Matches ANY item tagged as "Saw" type */

    Result:Plank=3,
    Time:150.0,
}
```

**What it means:** Instead of specifying `Saw` or `HacksawSaw` or listing every saw, this accepts **any item in the game that has the Saw tag** - vanilla saws, mod saws, future saws.

**Why it's powerful:** It makes your recipes automatically compatible with other mods. If someone creates a "Diamond Saw" mod and tags it properly, your recipe will work with it without any changes.

### Common Type Functions

Here are the most common item type functions you'll use:

| Function | Matches | Example Uses |
|----------|---------|--------------|
| `[Recipe.GetItemTypes.Saw]` | All saws | Cutting wood, metal |
| `[Recipe.GetItemTypes.Hammer]` | All hammers | Building, metalworking |
| `[Recipe.GetItemTypes.Screwdriver]` | All screwdrivers | Disassembly, electronics |
| `[Recipe.GetItemTypes.Wrench]` | All wrenches | Mechanical work |
| `[Recipe.GetItemTypes.Knife]` | All knives | Cutting, food prep |
| `[Recipe.GetItemTypes.Welding]` | Welding equipment | Metalworking |

### Using Type Functions as Tools

```
recipe Example {
    ScrapMetal=2,
    keep [Recipe.GetItemTypes.Hammer], /* Any hammer works */

    Result:MetalSheet,
    Time:120.0,
}
```

**When to use:** Almost always prefer type functions over specific item names for tools. They make your recipes more flexible and mod-compatible.

**Exception:** If you specifically need one exact tool for balance or realism reasons, use the specific item ID.

---

## Quantity Patterns

Quantities control how many of an item are required or produced.

### Fixed Input Quantity

```
recipe Example {
    Nails=5,                           /* Exactly 5 nails required */
    Plank=3,                           /* Exactly 3 planks required */

    Result:SmallCrate,
    Time:100.0,
}
```

**What it means:** Player must have exactly these quantities. All are consumed.

### Fixed Output Quantity

```
recipe Example {
    Log,

    Result:Plank=4,                    /* Produces 4 planks */
    Time:150.0,
}
```

**What it means:** Crafting produces 4 planks, not just 1.

### Balancing Ratios

Good recipes have logical input-to-output ratios:

| Input | Output | Feels Right? |
|-------|--------|--------------|
| 1 Log | 4 Planks | ✅ Fair |
| 1 Log | 1 Plank | ❌ Too harsh |
| 1 Log | 20 Planks | ❌ Too generous |
| 3 Cloth | 1 Rope | ✅ Fair |
| 10 Cloth | 1 Rope | ❌ Too expensive |

**Rule of thumb:** Processed materials should give less output than the effort feels worth. 1 log = 3-4 planks feels right because chopping takes time.

---

## Tool Behavior

Understanding tool behavior is critical for creating realistic recipes.

### `keep` vs `destroy`

```
recipe Example {
    Log,
    keep Hammer,                       /* NOT consumed */
    destroy Nails,                     /* Consumed (but so is default!) */
    TreeBranch,                        /* Consumed (default) */

    Result:Plank,
    Time:100.0,
}
```

**The three keywords:**
- `keep` - Item is required but NOT consumed (stays in inventory)
- `destroy` - Item IS consumed (but this is redundant - it's the default)
- No keyword - Item IS consumed (default behavior)

**In practice:** Only use `keep` for tools. You rarely need `destroy` since that's default.

### Tool Durability and Degradation

**Important:** Tools marked with `keep` still lose durability!

```
recipe Example {
    Log,
    keep Saw,                          /* Saw stays BUT loses durability */

    Result:Plank=3,
    Time:150.0,
}
```

**What happens:** The saw stays in inventory but loses condition. Eventually it breaks. This is realistic - tools wear out with use.

**The durability loss** depends on the item's `ConditionLowerChanceOneIn` property (defined in the item file). Lower values = faster degradation.

### Multiple Tools Required

```
recipe Example {
    WoodenChair,
    keep Hammer,                       /* First tool */
    keep Saw,                          /* Second tool */

    Result:Plank=2,
    Time:150.0,
}
```

**What it means:** Player needs BOTH a hammer and a saw. Neither is consumed, but both lose durability.

**When to use:** For complex crafts that realistically need multiple tools (disassembly, advanced crafting).

---

## Special Ingredients

Some ingredients work differently from normal items.

### Water

Water can come from multiple sources - bottles, sinks, rain collectors:

```
recipe Example {
    Flour=2,
    Water=5,                           /* Any water source with 5+ units */

    Result:Dough,
    Time:50.0,
}
```

**What it means:** Player needs 5 units of water from any source. Could be a water bottle, canteen, cooking pot with water, sink water, etc.

**Why it's special:** Water isn't a discrete item - it's measured in units and can be drawn from any container.

### Drainable Items

Items like glue, duct tape, and thread are "drainable" - they have uses/charges rather than being discrete items:

```
recipe Example {
    Plank=2,
    DuctTape=2,                        /* Uses 2 charges from the roll */

    Result:ReinforcedPlank,
    Time:40.0,
}
```

**What it means:** The duct tape roll loses 2 charges but stays in inventory if it has charges remaining.

**Other drainable items:**
- Glue
- Thread
- Duct tape
- Paint

### Empty Containers

Some recipes specifically need empty containers:

```
recipe Example {
    EmptyPetrolCan,                    /* Must be empty */
    Petrol=10,                         /* Fuel source */

    Result:PetrolCan,                  /* Now it's full */
    Time:20.0,
}
```

**What it means:** The petrol can must be empty. A full can won't work.

**Why:** For realism - you can't pour gas into an already-full container.

---

## Advanced Pattern Combinations

Real recipes combine multiple advanced patterns. Let's look at complex examples.

### Example 1: Multi-Pattern Recipe

```
module Base {
    imports {
        Base
    }

    recipe Complex Craft {
        Plank=2,                           /* Fixed quantity */
        Nails=4,                           /* Fixed quantity */
        keep [Recipe.GetItemTypes.Hammer], /* Type function as tool */
        RippedSheets/DenimStrips,          /* Alternatives */
        Water=1,                           /* Drainable */

        Result:ComplexItem,
        Time:200.0,
        Category:Carpentry,
    }
}
```

**This recipe demonstrates:**
- Fixed quantities (`Plank=2`, `Nails=4`)
- Item type function (`[Recipe.GetItemTypes.Hammer]`)
- Alternative items (`RippedSheets/DenimStrips`)
- Drainable ingredient (`Water=1`)
- Kept tool

**When to use:** Complex crafting that needs multiple materials and tools.

### Example 2: Flexible Material Recipe

```
module Base {
    imports {
        Base
    }

    recipe Craft Rope {
        RippedSheets=4/DenimStrips=3/LeatherStrips=2, /* Three material options */

        Result:Rope,
        Time:80.0,
        Category:Survivalist,
    }
}
```

**What this allows:** Player can use 4 ripped sheets, OR 3 denim strips, OR 2 leather strips. Different materials at different ratios, all producing the same rope.

**When to use:** When multiple material types make sense but have different "values" (leather is more valuable, so you need less).

---

## Common Mistakes

Let's look at errors beginners make with advanced patterns, and how to avoid them.

### Mistake 1: Quantity on Kept Tools

❌ **Doesn't work:**

```
recipe Example {
    Log,
    keep Hammer=2,                     /* Can't require multiple kept tools */

    Result:Plank,
    Time:100.0,
}
```

**What you'll see:** Recipe might not parse, or might behave unexpectedly.

**Why it breaks:** The `keep` keyword doesn't support quantities. You can't require "2 hammers that don't get consumed."

✅ **Works:**

```
recipe Example {
    Log,
    keep Hammer,                       /* Just one tool */

    Result:Plank,
    Time:100.0,
}
```

**If you really need two tools:** List them separately:
```
keep Hammer,
keep Saw,
```

### Mistake 2: Mixing Keep and Alternatives Incorrectly

❌ **Doesn't work:**

```
recipe Example {
    TreeBranch,
    keep Knife/Axe,                    /* Won't parse correctly */

    Result:Firewood,
    Time:60.0,
}
```

**What you'll see:** Parsing errors or unexpected behavior.

**Why it breaks:** The recipe parser doesn't handle `keep` with alternatives properly in this syntax.

✅ **Works (use type function instead):**

```
recipe Example {
    TreeBranch,
    keep [Recipe.GetItemTypes.Knife],  /* Matches any knife */

    Result:Firewood,
    Time:60.0,
}
```

**Or if you need specific alternatives as separate requirements:**

```
recipe Example {
    TreeBranch,
    keep Knife,                        /* Either keep one */
    OR
    keep Axe,                          /* Or keep the other */

    Result:Firewood,
    Time:60.0,
}
```

Actually, that won't work either. The correct approach is to use item type functions for tool alternatives.

### Mistake 3: Result with Alternatives

❌ **Doesn't work:**

```
recipe Example {
    TreeBranch,

    Result:Plank/ShortPlank,           /* Can't output alternatives */
    Time:50.0,
}
```

**What you'll see:** Recipe won't load.

**Why it breaks:** The `Result` property only accepts one item type. You can't have "produce this OR that."

✅ **Works:**

```
recipe Example {
    TreeBranch,

    Result:Plank,                      /* One specific result */
    Time:50.0,
}
```

**If you want variable results:** Create separate recipes for different outputs.

### Mistake 4: Wrong Alternative Syntax

❌ **Doesn't work:**

```
recipe Example {
    Knife, Axe,                        /* Comma means BOTH required */

    Result:Firewood,
    Time:60.0,
}
```

**What happens:** Player needs both a knife AND an axe.

✅ **Works:**

```
recipe Example {
    Knife/Axe,                         /* Slash means EITHER works */

    Result:Firewood,
    Time:60.0,
}
```

**The rule:** Comma = AND (both required), Slash = OR (either works).

---

## Designing Balanced Recipes

Good recipe design balances challenge with fairness. Here's how to think about balance.

### Balance Considerations

| Factor | Guideline | Why |
|--------|----------|-----|
| **Rarity** | Rare inputs = valuable output | Players should feel rewarded for finding rare items |
| **Tool requirement** | Tools add realism without grinding | Requiring tools makes recipes feel real but shouldn't be punishing |
| **Time** | Valuable items = longer craft | More time investment = more valuable result |
| **Skill** | Advanced items need skill gates | Progression: beginners get simple recipes, advanced players get complex ones |
| **Output quantity** | Fair ratio to inputs | 1 log = 3-4 planks feels right; 1 log = 20 planks feels broken |

### Progression Examples

Let's see how to design recipes that scale from beginner to advanced.

**Beginner Recipe - No Tools, Common Materials:**

```
module Base {
    imports {
        Base
    }

    recipe Bundle Rags {
        RippedSheets=3,                /* Common material */

        Result:RagBundle,              /* Simple result */
        Time:30.0,                     /* Quick */
        Category:Survivalist,
    }
}
```

**Design reasoning:**
- Materials: Common (ripped sheets are everywhere)
- Tools: None (accessible to everyone)
- Time: Fast (30 units)
- Result: Basic utility item

**Intermediate Recipe - Common Tool, Mixed Materials:**

```
module Base {
    imports {
        Base
    }

    recipe Craft Splint {
        TreeBranch,                    /* Common material */
        RippedSheets=2,                /* Common material */
        keep [Recipe.GetItemTypes.Knife], /* Common tool */

        Result:Splint,                 /* Useful medical item */
        Time:60.0,                     /* Medium time */
        Category:Survivalist,
    }
}
```

**Design reasoning:**
- Materials: Common but requires two types
- Tools: Common (most players find a knife early)
- Time: Medium (60 units)
- Result: Useful item with clear purpose

**Advanced Recipe - Rare Tools, Skill Gate, Valuable Result:**

```
module Base {
    imports {
        Base
    }

    recipe Forge Blade {
        ScrapMetal=3,                  /* Requires scavenging */
        keep BlowTorch,                /* Rare tool */
        keep WeldingMask,              /* Rare tool */
        keep [Recipe.GetItemTypes.Hammer], /* Common tool */

        Result:ForgedBlade,            /* Valuable weapon component */
        Time:300.0,                    /* Long craft time */
        SkillRequired:Metalworking=4,  /* Skill gate */
        Category:Metalworking,
    }
}
```

**Design reasoning:**
- Materials: Requires scavenging multiple scrap metal
- Tools: Mix of rare (blowtorch, mask) and common (hammer)
- Time: Long (300 units = significant investment)
- Skill: Metalworking 4 (gates this from beginners)
- Result: Powerful item worth the effort

> **Key Takeaway**
> Design recipes that scale with player progression. Beginners get accessible recipes with common materials, advanced players get complex recipes with rare materials and skill requirements.

---

## Try It Yourself

Let's practice creating balanced recipes with advanced patterns.

### Exercise 1: Flexible Tool Recipe

**Challenge:** Create a recipe for sharpening a knife using any sharpening tool.

**Requirements:**
- Input: `KitchenKnife` (consumed - it's being replaced by a sharp version)
- Tool: Any item of type `[Recipe.GetItemTypes.Stone]` (NOT consumed)
- Output: `KnifeSharp` (the sharpened knife)
- Time: 40 time units
- Category: Survivalist

Try writing the recipe before looking at the answer.

---

**Answer:**

```
module Base {
    imports {
        Base
    }

    recipe Sharpen Knife {
        KitchenKnife,
        keep [Recipe.GetItemTypes.Stone],

        Result:KnifeSharp,
        Time:40.0,
        Category:Survivalist,
    }
}
```

### Exercise 2: Alternative Materials Recipe

**Challenge:** Create a recipe for making rope that accepts multiple types of fabric.

**Requirements:**
- Input: EITHER 5 ripped sheets OR 4 denim strips OR 3 leather strips
- Output: 1 rope
- Time: 80 time units
- Category: Survivalist

---

**Answer:**

```
module Base {
    imports {
        Base
    }

    recipe Make Rope {
        RippedSheets=5/DenimStrips=4/LeatherStrips=3,

        Result:Rope,
        Time:80.0,
        Category:Survivalist,
    }
}
```

### Exercise 3: Complex Craft Recipe

**Challenge:** Create a balanced recipe for crafting a reinforced door.

**Requirements:**
- Input: 6 planks, 10 nails, 1 hinge
- Tools: Any hammer (NOT consumed), Any saw (NOT consumed)
- Output: 1 reinforced door
- Time: 250 time units
- Skill: Carpentry level 3
- Category: Carpentry

---

**Answer:**

```
module Base {
    imports {
        Base
    }

    recipe Craft Reinforced Door {
        Plank=6,
        Nails=10,
        Hinge,
        keep [Recipe.GetItemTypes.Hammer],
        keep [Recipe.GetItemTypes.Saw],

        Result:ReinforcedDoor,
        Time:250.0,
        SkillRequired:Carpentry=3,
        Category:Carpentry,
    }
}
```

---

## Key Takeaways

Let's recap the advanced ingredient patterns:

1. **Use `/` for alternatives**
   - `Knife/Axe` - either one works
   - `Plank=2/Log=1` - different quantities for different items
   - Makes recipes flexible and player-friendly

2. **Use item type functions for tools**
   - `[Recipe.GetItemTypes.Saw]` - matches any saw
   - Better than specific items for mod compatibility
   - Almost always prefer type functions for tools

3. **Understand tool behavior**
   - `keep` - tool stays in inventory but loses durability
   - Without `keep` - item is consumed (default)
   - Tools still break eventually, even with `keep`

4. **Quantities control balance**
   - Input quantities: `Plank=4` requires 4 planks
   - Output quantities: `Result:Plank=3` produces 3 planks
   - Balance ratios to feel fair (1 log = 3-4 planks)

5. **Special ingredients work differently**
   - Water: Drawn from any water source
   - Drainables: Use charges (duct tape, glue, thread)
   - Empty containers: Must be empty specifically

6. **Combine patterns for complexity**
   - Mix fixed quantities, alternatives, type functions
   - Complex recipes feel more realistic
   - Don't overdo it - keep recipes understandable

7. **Design for progression**
   - Beginner: Common materials, no tools, simple
   - Intermediate: Mixed materials, common tools
   - Advanced: Rare materials, rare tools, skill gates

8. **Common mistakes to avoid**
   - Don't use quantities with `keep` (`keep Hammer=2` won't work)
   - Don't mix `keep` with alternatives directly (use type functions)
   - Don't use alternatives in `Result` (only one output type)
   - Comma = AND, Slash = OR (don't mix them up)

You now have all the tools to create sophisticated, balanced recipes that adapt to what players find in the world. Advanced ingredient patterns are what separate good recipe mods from great ones.

---

## What's Next?

Ready to test your recipes and take things further?

- [Testing Your Recipe](/build-41/modding/recipes/testing-recipes) - Efficient testing strategies and debug techniques
- [Anatomy of an Item](/build-41/modding/items/item-anatomy) - Understand item properties to design better recipes
- [Your First Custom Item](/build-41/modding/items/first-item-file) - Create custom items to use in recipes
