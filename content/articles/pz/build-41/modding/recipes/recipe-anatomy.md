---
id: recipes-recipe-anatomy
slug: recipe-anatomy
title: "Anatomy of a Recipe"
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: beginner
tags:
  - beginner
  - recipe
  - anatomy
  - syntax
  - learning-path
  - fundamentals
excerpt: "Learn the structure and syntax of Project Zomboid recipes by breaking down a vanilla recipe line by line."
table_of_contents:
  - text: "What Is Recipe Anatomy?"
    link: "#what-is-recipe-anatomy"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "The Simplest Recipe"
    link: "#the-simplest-recipe"
  - text: "Breaking Down Each Part"
    link: "#breaking-down-each-part"
  - text: "Recipe Syntax Rules"
    link: "#recipe-syntax-rules"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "A More Complex Example"
    link: "#a-more-complex-example"
  - text: "Common Recipe Properties"
    link: "#common-recipe-properties"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Your First Recipe File"
    path: /build-41/modding/recipes/first-recipe-file
  - title: "Testing Your Recipe"
    path: /build-41/modding/recipes/testing-recipes
last_updated: 2026-01-28
---

# Anatomy of a Recipe

> You're going to learn how Project Zomboid recipes are structured by dissecting a real vanilla recipe. By the end, you'll be able to read any recipe file and understand exactly what it does.

---

## What Is Recipe Anatomy?

You know how doctors study human anatomy to understand how the body works? **Recipe anatomy** is the same idea - we're going to look inside a recipe to see how all the parts fit together.

Every crafting recipe in Project Zomboid - from opening a can of beans to building a wooden crate - follows the same structural pattern. Once you understand this pattern, you can read any recipe in the game and immediately know:
- What ingredients it needs
- What it produces
- How long it takes
- What tools are required
- What skills you need

**Think of this like learning to read an X-ray.** At first, an X-ray looks like random shapes. But once a doctor shows you what to look for - "this is a bone, this is a joint" - suddenly you can see the structure. That's what we're doing with recipes.

**You would use this knowledge when:**
- Reading vanilla recipes to understand how they work
- Debugging your own recipes
- Creating complex recipes with multiple ingredients
- Understanding error messages about recipes

If you're feeling overwhelmed by recipe files - those files with hundreds of lines and confusing syntax - you're not alone. When I first opened `recipes.txt` (the vanilla recipe file), I immediately closed it and went looking for simpler examples. But here's what I learned: every recipe, no matter how complex, uses the exact same structure. Once you know that structure, the complexity disappears.

---

## Prerequisites

Before this article, you should understand:
- [Mod Folder Structure](/build-41/modding/setup/mod-folder-structure) - Where recipe files go
- [The mod.info File](/build-41/modding/setup/mod-info-file) - Basic mod setup

You don't need to have created a recipe yet - this article will teach you the fundamentals so you understand what you're doing when you create one.

---

## The Simplest Recipe

Let's start with the absolute simplest recipe in Project Zomboid - opening a can of beans:

```
module Base {                              /* Declare we're working in the Base module */
    recipe Open Canned Beans {             /* Recipe name shown to players */
        CannedBeans,                       /* Requires 1 can of beans (consumed) */
        TinOpener,                         /* Requires 1 tin opener (consumed) */

        Result:CannedBeansOpen,            /* Produces 1 opened can of beans */
        Time:30,                           /* Takes 30 time units */
    }
}                                          /* Close the module */
```

That's a complete, working recipe. Just 7 lines (plus comments). Let's break down what each part means.

> **Key Takeaway**
> This recipe has just three essential parts: ingredients (what you need), Result (what you get), and Time (how long it takes). Everything else is optional.

---

## Breaking Down Each Part

Let's examine this recipe one piece at a time. If we take it slowly, you'll see the pattern.

### Part 1: The Module Declaration

```
module Base {
```

**What it is:** A **module** is like a namespace - a way to organize related items so their names don't conflict.

**Why it matters:** The `Base` module is where all of Project Zomboid's vanilla items live. When we put our recipe in the `Base` module, we're saying "this recipe uses items from the Base module" (like `CannedBeans`, `TinOpener`, etc.).

If you were creating a completely custom recipe with custom items, you might use your own module name:

```
module MyMod {
    recipe ...
}
```

But for recipes that use vanilla items, we stick with `Base`.

**The opening brace `{`** means "everything after this, until the closing brace, belongs to this module." Think of it like opening a container.

### Part 2: The Recipe Declaration

```
    recipe Open Canned Beans {
```

**What it is:** This line declares a new **recipe** - a crafting definition.

**Breaking it down:**
- `recipe` - The keyword (special instruction word) that says "I'm defining a recipe"
- `Open Canned Beans` - The display name players see in the crafting menu
- `{` - Opens the recipe block (everything inside belongs to this recipe)

**Important:** "Open Canned Beans" is NOT a variable name or code identifier. It's the exact text that appears in the player's crafting menu. If you write `recipe Make Epic Sword`, players will see "Make Epic Sword" as the option.

### Part 3: The Ingredients

```
        CannedBeans,
        TinOpener,
```

**What they are:** The items the player needs in their inventory to craft this recipe.

**How they work:**
- Each ingredient goes on its own line
- Items are listed by their **item ID** (code name), not display name
- Each line ends with a comma `,`
- When the recipe completes, these items disappear from the player's inventory (they're **consumed**)

**Why no numbers?** When you don't specify a quantity, the game assumes you mean 1. So `CannedBeans,` means "1 CannedBeans."

If you wanted 3 cans, you'd write:
```
CannedBeans=3,
```

**Common confusion:** Why `TinOpener` and not `Tin Opener`? Because `TinOpener` is the item's internal code ID. Display names (what players see) can have spaces, but item IDs cannot. The item ID is always one word.

### Part 4: The Blank Line

```

```

Notice the blank line between ingredients and properties? This isn't required - the game ignores it. But it makes the recipe easier for humans to read by visually separating "what you need" from "what you get."

You'll see this pattern in vanilla recipes. It's a good habit to follow.

### Part 5: The Result

```
        Result:CannedBeansOpen,
```

**What it is:** The item the player receives when crafting completes.

**Breaking it down:**
- `Result:` - The property keyword followed by a colon `:` (not an equals sign!)
- `CannedBeansOpen` - The item ID to create
- `,` - The comma at the end (required!)

**Notice the colon.** This is a **property** - a characteristic of the recipe. Properties always use colons `:`, not equals signs `=`. This is different from ingredients, where quantities use equals signs:

| Type | Symbol | Example |
|------|--------|---------|
| Ingredient quantity | `=` | `CannedBeans=3,` |
| Recipe property | `:` | `Result:CannedBeansOpen,` |

**Multiple results:** If a recipe produces multiple items, you add a quantity:
```
Result:Plank=3,              /* Produces 3 planks */
```

### Part 6: The Time

```
        Time:30,
```

**What it is:** How long (in time units) the crafting action takes.

**How it works:**
- `Time:` - Property keyword (notice the colon)
- `30` - Time units (higher = longer)
- `,` - Comma at the end

**What are "time units"?** They roughly correspond to in-game time. `30` is quick (a few in-game minutes), `230` is slow (like sawing logs). The exact conversion isn't important - what matters is that higher numbers = longer waits.

**You can use decimals:** `Time:30.0,` or `Time:125.5,` - both work.

### Part 7: Closing Braces

```
    }
}
```

**What they do:** Close the containers we opened earlier.

**The structure:**
- First `}` - Closes the recipe block
- Second `}` - Closes the module block

**Think of it like nested containers** - like Russian nesting dolls. The recipe sits inside the module, so we close them in reverse order: recipe first, then module.

> **Key Takeaway**
> Every opening brace `{` needs a matching closing brace `}`. If you forget one, the game won't know where things end and your recipe won't load.

---

## Recipe Syntax Rules

Let's explicitly state the rules that recipes must follow. These are non-negotiable - break them and your recipe won't work.

### Rule 1: Properties Use Colons, Not Equals

Recipe properties (Result, Time, Category, etc.) use colons `:`, not equals signs `=`.

**Correct:**
```
Result:Plank,
Time:50,
Category:Carpentry,
```

**Wrong:**
```
Result=Plank,              /* Won't work! */
Time=50,                   /* Won't work! */
```

**Why?** That's just how the recipe syntax works. Properties use colons, ingredient quantities use equals. Different symbols for different purposes.

### Rule 2: Every Line Needs a Comma

Every line inside a recipe block must end with a comma.

**Correct:**
```
recipe Make Crate {
    Plank,
    Nails=5,

    Result:Crate,
    Time:100,            /* Even the last property! */
}
```

**Wrong:**
```
recipe Make Crate {
    Plank,
    Nails=5              /* Missing comma! */

    Result:Crate         /* Missing comma! */
    Time:100,
}
```

**What happens if you forget?** The game's parser (the part that reads recipe files) will give up and show cryptic errors like `unexpected symbol near 'Result'`.

### Rule 3: Item IDs Are Case-Sensitive

`TreeBranch` and `Treebranch` are different things. Capitalization matters.

**Correct:**
```
TreeBranch,            /* This exists in the game */
SharpedStick,          /* This exists in the game */
```

**Wrong:**
```
Treebranch,            /* Doesn't exist - wrong capitalization */
SharpedSTick,          /* Doesn't exist - wrong capitalization */
```

**How to avoid mistakes:** Look at vanilla recipe files or item files to see the exact capitalization. Never guess.

### Rule 4: Use Item IDs, Not Display Names

Recipes use **item IDs** (internal code names), not display names (what players see).

**Correct:**
```
TinOpener,             /* Item ID (code name) */
CannedBeans,           /* Item ID (code name) */
```

**Wrong:**
```
Tin Opener,            /* Display name - won't work */
Canned Beans,          /* Display name - won't work */
```

**How to find item IDs:** Look in vanilla item files (`Steam/steamapps/common/ProjectZomboid/media/scripts/items.txt`). The item ID is the name after the `item` keyword.

---

## Common Mistakes

Let's look at the most common errors people make when writing recipes, and how to fix them.

### Mistake 1: Using Equals for Properties

**Doesn't work:**

```
recipe Saw Logs {
    Log,

    Result=Plank=3,          /* Wrong symbol! */
    Time=150,                /* Wrong symbol! */
}
```

**What you'll see:** Recipe won't load, or you'll see parsing errors in `console.txt`.

**Why it breaks:** Properties must use colons `:`, not equals signs `=`. That's the syntax rule.

**Works:**

```
recipe Saw Logs {
    Log,

    Result:Plank=3,          /* Colon for property, equals for quantity */
    Time:150,                /* Colon for property */
}
```

**The pattern:** `Property:Value` for recipe characteristics, but `Item=Quantity` for amounts.

### Mistake 2: Forgetting the Comma

**Doesn't work:**

```
recipe Open Beans {
    CannedBeans,
    TinOpener              /* Missing comma! */

    Result:CannedBeansOpen,
    Time:30,
}
```

**What you'll see:** Parsing error like `unexpected symbol near 'Result'`.

**Why it breaks:** Without commas, the parser doesn't know where one line ends and the next begins.

**Works:**

```
recipe Open Beans {
    CannedBeans,
    TinOpener,             /* Added comma */

    Result:CannedBeansOpen,
    Time:30,
}
```

**Pro tip:** Get in the habit of always adding commas. You literally can't have too many commas in a recipe (within reason).

### Mistake 3: Wrong Item ID Capitalization

**Doesn't work:**

```
recipe Sharpen Stick {
    Treebranch,            /* Wrong! Should be TreeBranch */

    Result:SharpedSTick,   /* Wrong! Should be SharpedStick */
    Time:40,
}
```

**What you'll see:** The recipe appears in the crafting menu, but you can't craft it even when you have the items. The game is looking for items that don't exist.

**Why it breaks:** Item IDs are case-sensitive. `TreeBranch` exists, but `Treebranch` doesn't.

**Works:**

```
recipe Sharpen Stick {
    TreeBranch,            /* Correct capitalization */

    Result:SharpedStick,   /* Correct capitalization */
    Time:40,
}
```

**How to avoid this:** Always reference vanilla files for exact spelling and capitalization.

### Mistake 4: Using Display Names Instead of Item IDs

**Doesn't work:**

```
recipe Open Beans {
    Canned Beans,          /* Display name - won't work */
    Tin Opener,            /* Display name - won't work */

    Result:Canned Beans Open,
    Time:30,
}
```

**What you'll see:** Recipe won't load, or game won't recognize the items.

**Why it breaks:** Recipes need item IDs (code names), not display names (player-facing text).

**Works:**

```
recipe Open Beans {
    CannedBeans,           /* Item ID (no spaces) */
    TinOpener,             /* Item ID (no spaces) */

    Result:CannedBeansOpen,
    Time:30,
}
```

**The rule:** Item IDs are usually one word (CamelCase). Display names can have spaces.

### Mistake 5: Missing Closing Brace

**Doesn't work:**

```
module Base {
    recipe Open Beans {
        CannedBeans,
        TinOpener,

        Result:CannedBeansOpen,
        Time:30,
    }
    /* Missing closing brace for module! */
```

**What you'll see:** Recipe file won't load, parsing errors.

**Why it breaks:** Every `{` needs a matching `}`. Without it, the game doesn't know where the module ends.

**Works:**

```
module Base {
    recipe Open Beans {
        CannedBeans,
        TinOpener,

        Result:CannedBeansOpen,
        Time:30,
    }
}                          /* Closing brace for module */
```

**Counting tip:** Count your braces. Equal numbers of `{` and `}` = good. Unequal = broken recipe.

---

## A More Complex Example

Now that you understand the basics, let's look at a more feature-rich recipe from the vanilla game. This looks intimidating at first, but if we break it down, you'll see it follows the exact same pattern.

```
module Base {
    recipe Saw Logs {                              /* Recipe name */
        Log,                                       /* Requires 1 log (consumed) */
        keep [Recipe.GetItemTypes.Saw],            /* Requires any saw (NOT consumed) */

        Result:Plank=3,                            /* Produces 3 planks */
        Time:230.0,                                /* Takes 230 time units */
        Category:Carpentry,                        /* Shows in Carpentry tab */
        OnGiveXP:Recipe.OnGiveXP.SawLogs,          /* Calls Lua function for XP */
        Sound:Sawing,                              /* Plays sawing sound */
        AnimNode:SawLog,                           /* Character plays sawing animation */
    }
}
```

This looks like a lot. Let's break down the new parts.

### New Element: `keep`

```
keep [Recipe.GetItemTypes.Saw],
```

**What it means:** The player needs a saw, but the saw **doesn't get consumed** (destroyed) when crafting. It stays in their inventory.

**Why:** Tools like saws, hammers, and knives are typically reusable. You use them but don't destroy them. The `keep` keyword tells the game "require this item but don't remove it."

**Without `keep`, items are consumed.** That's the default behavior.

### New Element: `[Recipe.GetItemTypes.Saw]`

```
keep [Recipe.GetItemTypes.Saw],
```

**What it means:** Instead of requiring one specific saw (like `Saw`), this accepts **any type of saw** - hand saw, hacksaw, power saw, etc.

**Why it's useful:** Players might have different types of saws. This makes the recipe flexible by accepting any of them.

**The pattern:** `[Recipe.GetItemTypes.X]` is a special Lua function that returns all items of type X. You'll see this a lot in vanilla recipes for tools.

### New Element: `Result:Plank=3`

```
Result:Plank=3,
```

**What it means:** When crafting completes, the player receives **3 planks**, not just 1.

**The syntax:** `Result:ItemID=Quantity,`

This is how you specify multiple results. It's just like ingredient quantities, but for the result instead.

### New Element: `Category:Carpentry`

```
Category:Carpentry,
```

**What it means:** This recipe appears in the **Carpentry tab** of the crafting menu.

**Why it matters:** Without a category, your recipe shows up in the generic "All" category, which makes it harder for players to find. Categorizing helps organize recipes.

**Common categories:** Cooking, Carpentry, Metalworking, Tailoring, Survivalist, etc.

### New Element: `OnGiveXP:`

```
OnGiveXP:Recipe.OnGiveXP.SawLogs,
```

**What it means:** When crafting completes, call this Lua function to award XP (experience points) to the player.

**Why it's complex:** XP calculations can be complicated (skill level, multipliers, etc.), so PZ uses Lua functions to handle them. `Recipe.OnGiveXP.SawLogs` is a function defined in the game's Lua code.

**Do you need this?** Not always. Simple recipes can work without XP rewards. But if you want players to gain skill from crafting, you'll need this.

### New Element: `Sound:`

```
Sound:Sawing,
```

**What it means:** Play the "Sawing" sound effect while the player crafts.

**Why it matters:** Sounds make crafting feel more real. Players hear sawing when making planks, hammering when building furniture, etc.

**Sound IDs** like `Sawing` reference audio files in the game. You can find valid sound IDs in the vanilla sound files.

### New Element: `AnimNode:`

```
AnimNode:SawLog,
```

**What it means:** The character plays the "SawLog" animation while crafting.

**Why it matters:** Animations make the game world feel alive. When sawing logs, your character actually moves like they're sawing.

**AnimNode IDs** reference animation definitions in the game. These are more advanced and usually you'd copy from vanilla recipes.

> **Key Takeaway**
> Complex recipes are just simple recipes with extra properties added. The core structure - ingredients, Result, Time - never changes. Everything else is optional enhancements.

---

## Common Recipe Properties

Here's a reference table of properties you'll commonly see in recipes. You don't need to memorize this - just refer back when you need it.

### Essential Properties (Required)

Every recipe needs these:

| Property | Example | What It Does |
|----------|---------|--------------|
| `Result:` | `Result:Plank,` | The item created when crafting completes |
| `Time:` | `Time:50.0,` | How long crafting takes (in time units) |

### Tool Handling Properties

Control whether items are consumed:

| Property | Example | What It Does |
|----------|---------|--------------|
| `keep` | `keep Hammer,` | Item is required but NOT consumed (stays in inventory) |
| `destroy` | `destroy Hammer,` | Item is explicitly consumed (this is default behavior anyway) |

**Most common use:** `keep` for tools like hammers, saws, knives, etc.

### Skill Requirements

Gate recipes behind player skills:

| Property | Example | What It Does |
|----------|---------|--------------|
| `SkillRequired:` | `SkillRequired:Carpentry=2,` | Player needs Carpentry level 2 or higher |
| `NeedToBeLearn:` | `NeedToBeLearn:true,` | Player must read a recipe magazine before seeing this recipe |

**Example with skill:**
```
SkillRequired:Carpentry=4,     /* Needs Carpentry 4 */
SkillRequired:Metalworking=2,  /* Also needs Metalworking 2 */
```

### Feedback Properties

Add audio/visual feedback:

| Property | Example | What It Does |
|----------|---------|--------------|
| `Sound:` | `Sound:Sawing,` | Sound effect played while crafting |
| `AnimNode:` | `AnimNode:SawLog,` | Character animation played while crafting |
| `Category:` | `Category:Cooking,` | Which crafting menu tab to show this recipe in |

### XP & Progression

Reward players for crafting:

| Property | Example | What It Does |
|----------|---------|--------------|
| `OnGiveXP:` | `OnGiveXP:Recipe.OnGiveXP.SawLogs,` | Lua function called to award XP when crafting completes |

**Note:** XP functions are defined in Lua code and are more advanced. For simple recipes, you can skip this.

---

## Try It Yourself

Let's practice reading a recipe. I'll show you a vanilla recipe, and you try to figure out what it does before reading the explanation.

### Exercise: What Does This Recipe Do?

```
module Base {
    recipe Disassemble Chair {
        WoodenChair,
        keep Hammer,
        keep Saw,

        Result:Plank=2,
        Time:150.0,
        Category:Carpentry,
    }
}
```

**Before looking at the answer below, try to figure out:**
1. What ingredients does this recipe need?
2. What tools are required, and do they get consumed?
3. What does it produce?
4. How long does it take?
5. Where does this recipe show up in the crafting menu?

---

**Answer:**

1. **Ingredients:** 1 Wooden Chair (consumed)
2. **Tools:** 1 Hammer (NOT consumed, kept) and 1 Saw (NOT consumed, kept)
3. **Produces:** 2 Planks
4. **Time:** 150 time units (medium-slow)
5. **Category:** Carpentry tab

**In plain English:** This recipe lets players disassemble wooden chairs to salvage planks. They need a hammer and saw, but those tools aren't destroyed. The chair is consumed, and they get 2 planks back. Takes about 150 time units, and shows up in the Carpentry crafting tab.

### Exercise 2: Spot the Errors

This recipe has 3 syntax errors. Can you find them?

```
module Base {
    recipe Make Rope
        RippedSheets=4

        Result=Rope,
        Time:80.0,
    }
}
```

---

**Answers:**

1. **Missing opening brace after recipe name**
   - Should be: `recipe Make Rope {`
   - Not: `recipe Make Rope`

2. **Missing comma after ingredient**
   - Should be: `RippedSheets=4,`
   - Not: `RippedSheets=4`

3. **Using equals instead of colon for Result**
   - Should be: `Result:Rope,`
   - Not: `Result=Rope,`

**Corrected version:**

```
module Base {
    recipe Make Rope {         /* Fixed: Added opening brace */
        RippedSheets=4,        /* Fixed: Added comma */

        Result:Rope,           /* Fixed: Changed = to : */
        Time:80.0,
    }
}
```

If you caught all three errors - great job! You're understanding the syntax rules.

---

## Key Takeaways

Let's recap what we learned about recipe anatomy:

1. **Every recipe has the same structure**
   - Module declaration
   - Recipe declaration
   - Ingredients list
   - Properties (Result, Time, etc.)
   - Closing braces

2. **Properties use colons, quantities use equals**
   - Property: `Result:Torch,` or `Time:60,`
   - Quantity: `Plank=3,` or `Nails=5,`
   - Never mix them up!

3. **Every line needs a comma**
   - Inside recipe blocks, every line must end with `,`
   - This includes the last property before the closing brace

4. **`keep` prevents items from being consumed**
   - Use for tools: `keep Hammer,`
   - Without `keep`, items are destroyed when crafting

5. **Result and Time are the only required properties**
   - `Result:` - What gets created
   - `Time:` - How long it takes
   - Everything else (Category, Sound, AnimNode, etc.) is optional

6. **Item IDs must be exact**
   - Case-sensitive: `TreeBranch` ≠ `Treebranch`
   - No spaces: Use `TinOpener`, not `Tin Opener`
   - Check vanilla files for correct names

7. **Complex recipes are just simple recipes with extras**
   - The core pattern never changes
   - Additional properties just add features
   - Start simple, add features later

8. **Vanilla recipes are your reference**
   - Located in: `Steam/steamapps/common/ProjectZomboid/media/scripts/`
   - Files like `recipes.txt`, `recipes_food.txt`, `recipes_furniture.txt`
   - When in doubt, see how vanilla does it

You now know how to read and understand any recipe in Project Zomboid. Whether it's a simple 5-line recipe or a complex 15-line recipe, the structure is always the same. The only difference is how many optional properties are added.

---

## What's Next?

Ready to create your own recipe? Here's where to go:

- [Your First Recipe File](/build-41/modding/recipes/first-recipe-file) - Step-by-step guide to creating a working recipe mod from scratch
- [Recipe Ingredients Deep Dive](/build-41/modding/recipes/recipe-ingredients) - Learn all the ways to specify ingredients: alternatives, quantities, and conditions
- [Testing Your Recipe](/build-41/modding/recipes/testing-recipes) - Efficient testing strategies and debug techniques
