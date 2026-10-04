---
id: ai-assisted-context-library
slug: context-library
title: "Building a Context Library"
game: pz
version: build-41
section: modding
category: ai-assisted
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - ai
  - context
  - reference
  - workflow
  - organization
excerpt: "Build a collection of reference files and vanilla examples that help AI tools generate more accurate, PZ-specific code for your mods."
table_of_contents:
  - text: "What Is a Context Library?"
    link: "#what-is-a-context-library"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Your First Context Library"
    link: "#your-first-context-library"
  - text: "Why Context Libraries Work"
    link: "#why-context-libraries-work"
  - text: "What to Include"
    link: "#what-to-include"
  - text: "Creating Your Full Library"
    link: "#creating-your-full-library"
  - text: "Using Your Context Library"
    link: "#using-your-context-library"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Maintaining Your Library"
    link: "#maintaining-your-library"
  - text: "Advanced: Project-Specific Context"
    link: "#advanced-project-specific-context"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Anatomy of a Recipe"
    path: /build-41/modding/recipes/recipe-anatomy
  - title: "Anatomy of an Item"
    path: /build-41/modding/items/item-anatomy
last_updated: 2026-01-09
---

# Building a Context Library

> Learn how to create a collection of reference files that make AI generate accurate, PZ-specific code every time.

---

## What Is a Context Library?

You've asked AI to create a Project Zomboid item. AI gives you this:

```
item CoolSword {
    displayName = Cool Sword,
    weight = 2.5,
    damage = 50,
}
```

You test it in-game and get: `Error: Unknown property 'displayName'`

You try again. "Use the correct property names for PZ Build 41." AI gives you:

```
item CoolSword {
    Name = Cool Sword,
    Mass = 2.5,
    Strength = 50,
}
```

Still wrong. The properties are `DisplayName`, `Weight`, and `MaxDamage`. AI doesn't know PZ's exact syntax because Project Zomboid is a niche game that wasn't heavily represented in its training data.

If this sounds familiar, a **context library** solves this problem. It's a collection of real vanilla PZ examples that you paste into AI conversations. When AI sees the correct patterns, it can match them exactly instead of guessing.

When I started using AI for modding, I spent so much time fixing AI's "close but not quite" code. Then I started giving AI vanilla examples first, and suddenly it generated correct code on the first try. A context library is just an organized way to do this every time.

Let me show you how to build one, starting with the simplest possible version.

**You would use a context library when:**
- AI generates code with wrong property names
- AI uses generic Lua patterns instead of PZ conventions
- You want AI to match your existing mod's style
- You're creating multiple similar items/recipes and want consistency

---

## Prerequisites

Before this article, you should understand:
- How to use AI tools for modding ([AI Tools for Modding](./ai-for-modding))
- Where vanilla PZ files are located
- Basic file/folder organization

You don't need to be an advanced modder - this is about organizing reference materials, not writing complex code.

---

## Your First Context Library

Let's create the simplest possible context library - just one file with one vanilla item example.

### Step 1: Find a Vanilla Item

Navigate to your PZ installation:
```
<your Steam library>\steamapps\common\ProjectZomboid\media\scripts\items.txt
```

Open `items.txt` and find a simple item. Let's use the **BaseballBat**:

```
item BaseballBat {
    MaxRange = 1.3,
    WeaponSprite = BaseballBat,
    MinAngle = 0.2,
    Type = Weapon,
    MinimumSwingTime = 3,
    KnockBackOnNoDeath = TRUE,
    SwingAmountBeforeImpact = 0.02,
    Categories = Blunt,
    Weight = 2,
    MaxDamage = 1.2,
    MinDamage = 0.8,
    DisplayName = Baseball Bat,
    Icon = BaseballBat,
}
```

### Step 2: Save It as Reference

Create a file in your mod folder:
```
MyMod/
├── mod.info
├── media/
└── _ai_context/           <- New folder (underscore means it won't affect the game)
    └── weapon_example.txt  <- Your first reference file
```

Paste the BaseballBat into `weapon_example.txt`. Add a comment explaining what it is:

```
-- VANILLA WEAPON EXAMPLE
-- Use this as a template for weapon items
item BaseballBat {
    MaxRange = 1.3,              -- How far the weapon reaches
    WeaponSprite = BaseballBat,  -- Which sprite to use
    Type = Weapon,               -- Item type category
    Weight = 2,                  -- Weight in inventory
    MaxDamage = 1.2,             -- Maximum damage per hit
    MinDamage = 0.8,             -- Minimum damage per hit
    DisplayName = Baseball Bat,  -- Name shown to player
    Icon = BaseballBat,          -- Icon filename
}
```

### Step 3: Use It With AI

Now when you ask AI to create a weapon, include your reference:

```
I'm creating a weapon for Project Zomboid Build 41.

Here's a vanilla weapon example showing the correct syntax:

[paste your weapon_example.txt]

Now create a machete item that:
- Has slightly longer range than the baseball bat
- Does more damage
- Weighs 1.5

Follow the exact property names from the example.
```

**AI will now generate:**
```
item Machete {
    MaxRange = 1.5,              -- Slightly longer than bat
    WeaponSprite = Machete,
    Type = Weapon,
    Weight = 1.5,                -- As requested
    MaxDamage = 1.5,             -- More than bat's 1.2
    MinDamage = 1.0,
    DisplayName = Machete,
    Icon = Machete,
}
```

Perfect! AI matched the property names exactly because it saw the pattern.

> **Key Takeaway**
> A context library is just a collection of vanilla examples. Even one example dramatically improves AI's accuracy because it sees the real syntax instead of guessing.

---

## Why Context Libraries Work

Let's understand why giving AI examples is so effective.

### Without Context: AI Guesses

**You ask:** "Create a PZ Build 41 food item"

**AI thinks:** "I know Lua syntax and general game properties. Foods probably have properties like 'nutrition', 'hunger', 'spoilage'..."

**AI generates:**
```
item Apple {
    nutrition = 50,         -- Wrong property name
    hungerReduction = 10,   -- Wrong property name
    spoilTime = 7,          -- Wrong property name
}
```

**Problem:** AI is guessing. It knows the *concepts* but not PZ's *exact property names*.

---

### With Context: AI Matches Patterns

**You ask:** "Create a PZ Build 41 food item"

**You paste:**
```
-- Example vanilla food
item Apple {
    HungerChange = -10,     -- AI sees: use "HungerChange"
    Type = Food,            -- AI sees: use "Type = Food"
    Icon = Apple,           -- AI sees: use "Icon"
    Weight = 0.2,           -- AI sees: use "Weight"
    DaysFresh = 6,          -- AI sees: use "DaysFresh" for spoilage
    DaysTotallyRotten = 12,
}
```

**AI generates:**
```
item Banana {
    HungerChange = -15,     -- Matched the property name!
    Type = Food,            -- Matched!
    Icon = Banana,
    Weight = 0.3,
    DaysFresh = 4,          -- Used the right spoilage properties!
    DaysTotallyRotten = 8,
}
```

**Why this works:** AI is excellent at pattern matching. When it sees `HungerChange = -10`, it understands "this is the property that affects hunger" and uses the same property name for new food items.

> **Note:** This isn't "training" the AI - you're just giving it the correct pattern to follow in this specific conversation.

---

## What to Include

A complete context library has four types of references. Let's look at each one.

### 1. Vanilla Examples

**Purpose:** Show AI the correct PZ syntax

**What to collect:**
- 5-10 item definitions covering different types (weapon, food, tool, clothing)
- 5-10 recipe definitions covering different patterns (simple, multi-ingredient, skill requirements)
- Common Lua patterns from vanilla scripts

**Why these numbers:** More examples = more patterns for AI to recognize. But 5-10 is enough to cover most common cases without overwhelming AI with too much text.

---

### 2. Your Mod's Existing Code

**Purpose:** Maintain consistency across AI sessions

**What to include:**
- Your item naming conventions
- Your folder structure
- Your module naming

**Example:**
```
-- MY MOD USES THESE PATTERNS:
-- Module name: always "Base" unless creating unique items
-- Item IDs: PascalCase (CustomSword, not custom_sword)
-- File names: snake_case (items_weapons.txt, not ItemsWeapons.txt)
```

When AI sees your patterns, it will match them in new code it generates.

---

### 3. Your Conventions Document

**Purpose:** Capture decisions that aren't in the code itself

**What to document:**
- Where certain types of items go (which files)
- Which recipe categories you use for different items
- Any special rules or preferences

**Example:**
```
# My Mod Conventions

## Recipe Categories
- All weapons → Metalworking category
- All tools → Carpentry category
- All food recipes → Cooking category
```

---

### 4. PZ API Function Signatures

**Purpose:** Show AI the correct function names and parameters

**What to collect:**
- Common functions you use (getPlayer, getInventory, AddItem)
- Event signatures (OnGameStart, OnCreatePlayer)
- How vanilla code calls these functions

**Example:**
```
-- HOW TO GET THE PLAYER
local player = getPlayer(0)  -- Note: parameter is 0 for single-player

-- HOW TO ADD ITEMS TO INVENTORY
local inventory = player:getInventory()     -- Step 1: Get inventory
inventory:AddItem("Base.Axe")              -- Step 2: Add item (note the colon)
```

When AI sees these patterns, it uses the correct function names instead of making up `player.getInventory()` or `addItemToPlayer()`.

---

## Creating Your Full Library

Now let's build a complete, organized context library. This looks like a lot, but you build it once and use it for months.

### Folder Structure

```
MyMod/
├── mod.info
├── media/
└── _ai_context/                    <- Your context library root
    ├── vanilla_examples/
    │   ├── items_weapons.txt       <- Vanilla weapon examples
    │   ├── items_food.txt          <- Vanilla food examples
    │   ├── items_tools.txt         <- Vanilla tool examples
    │   ├── recipes_simple.txt      <- Simple recipe patterns
    │   └── recipes_complex.txt     <- Complex recipe patterns
    ├── lua_patterns/
    │   ├── events.lua              <- Common event handlers
    │   └── inventory.lua           <- Inventory manipulation patterns
    └── conventions.md              <- Your mod's rules
```

**Why this structure:** Organized by topic so you can quickly find the right reference. You might only need weapon examples, so you don't paste all your food examples too.

---

### Vanilla Examples: Items

Create `_ai_context/vanilla_examples/items_weapons.txt`:

```
-- VANILLA WEAPON EXAMPLES FOR AI REFERENCE
-- These show the correct property names and value types for PZ Build 41

-- BLUNT WEAPON EXAMPLE
item BaseballBat {
    MaxRange = 1.3,                      -- Reach distance
    WeaponSprite = BaseballBat,          -- Visual sprite reference
    MinAngle = 0.2,                      -- Hit arc angle (smaller = more precise)
    Type = Weapon,                       -- Category
    MinimumSwingTime = 3,                -- Minimum time between swings
    KnockBackOnNoDeath = TRUE,           -- Push zombies back
    SwingAmountBeforeImpact = 0.02,      -- Swing animation timing
    Categories = Blunt,                  -- Weapon subcategory
    ConditionLowerChanceOneIn = 30,      -- Durability loss chance (1 in 30)
    Weight = 2,                          -- Inventory weight
    MaxDamage = 1.2,                     -- Maximum damage value
    SubCategory = Swinging,              -- Animation category
    ConditionMax = 15,                   -- Maximum durability
    MaxHitCount = 2,                     -- Can hit multiple zombies
    DoorDamage = 7,                      -- Damage against doors
    SwingAnim = Bat,                     -- Swing animation name
    DisplayName = Baseball Bat,          -- Player-visible name
    MinDamage = 0.8,                     -- Minimum damage value
    Icon = BaseballBat,                  -- Icon filename
    TwoHandWeapon = TRUE,                -- Requires both hands
    CriticalChance = 25,                 -- Percent chance for critical hit
    CritDmgMultiplier = 3,               -- Critical damage multiplier
}

-- BLADE WEAPON EXAMPLE
item KitchenKnife {
    MaxRange = 0.61,                     -- Short reach (knife is close-range)
    WeaponSprite = KnifeChopping,
    MinAngle = 0.2,
    Type = Weapon,
    MinimumSwingTime = 2,
    KnockBackOnNoDeath = FALSE,          -- Knives don't push zombies
    SwingAmountBeforeImpact = 0.02,
    Categories = Blade,                  -- Different category than blunt
    ConditionLowerChanceOneIn = 10,      -- Blades lose condition faster
    Weight = 0.3,                        -- Light weapon
    MaxDamage = 0.6,
    SubCategory = Stab,                  -- Stabbing, not swinging
    ConditionMax = 10,
    DoorDamage = 1,
    SwingAnim = Stab,
    DisplayName = Kitchen Knife,
    MinDamage = 0.4,
    Icon = KnifeChopping,
    CriticalChance = 10,
}
```

**Why these comments:** Explain *why* properties have certain values. This helps AI understand the purpose, not just the syntax.

---

### Vanilla Examples: Food

Create `_ai_context/vanilla_examples/items_food.txt`:

```
-- VANILLA FOOD EXAMPLES FOR AI REFERENCE

-- FRESH FOOD EXAMPLE (spoils over time)
item Apple {
    HungerChange = -10,                  -- Reduces hunger by 10 (negative = good)
    Type = Food,                         -- Must be "Food" for edible items
    ThirstChange = 5,                    -- Increases thirst by 5 (positive = bad)
    DisplayName = Apple,                 -- Player-visible name
    Icon = Apple,                        -- Icon filename
    Weight = 0.2,                        -- Light item
    Calories = 52,                       -- Real-world accurate calories
    Carbohydrates = 14,                  -- Nutritional value
    Proteins = 0,
    Lipids = 0,
    DaysFresh = 6,                       -- Fresh for 6 days
    DaysTotallyRotten = 12,              -- Completely rotten after 12 days
}

-- PACKAGED FOOD EXAMPLE (doesn't spoil)
item Crisps {
    HungerChange = -5,
    Type = Food,
    UnhappyChange = -5,                  -- Also makes player happier (negative = good)
    DisplayName = Crisps,
    Icon = Crisps,
    Weight = 0.1,
    Calories = 235,
    Carbohydrates = 25,
    Lipids = 12,
    Proteins = 3,
    FatigueChange = -5,                  -- Reduces fatigue slightly
    -- NO DaysFresh/DaysTotallyRotten = doesn't spoil
}

-- DRINK EXAMPLE
item Pop {
    HungerChange = -1,
    Type = Food,                         -- Drinks are still Type = Food
    ThirstChange = -30,                  -- Large thirst reduction (negative = good)
    UnhappyChange = -5,
    DisplayName = Pop,
    Icon = Pop,
    Weight = 0.3,
    Calories = 144,
    Carbohydrates = 38,
}
```

---

### Vanilla Examples: Recipes

Create `_ai_context/vanilla_examples/recipes_simple.txt`:

```
-- VANILLA RECIPE EXAMPLES FOR AI REFERENCE

-- PATTERN 1: SIMPLE TRANSFORMATION
-- Turns one item into another
recipe Open Beans {
    CannedBeans,                         -- Input item (consumed)
    TinOpener,                           -- Tool (consumed unless using "keep")

    Result:CannedBeansOpen,              -- Output item (use colon, not equals)
    Time:30,                             -- Time in game time units
}

-- PATTERN 2: KEEP TOOL (tool not consumed)
recipe Saw Logs {
    Log,                                 -- Input (consumed)
    keep [Recipe.GetItemTypes.Saw],      -- Tool (NOT consumed - that's what "keep" does)

    Result:Plank=3,                      -- Output with quantity (equals sign here)
    Time:230.0,
    Category:Carpentry,                  -- Which crafting menu
    OnGiveXP:Recipe.OnGiveXP.SawLogs,    -- Custom XP calculation
}

-- PATTERN 3: MULTIPLE INGREDIENTS
recipe Make Wooden Crate {
    Plank=4,                             -- Need 4 planks (equals for quantities)
    Nails=8,                             -- Need 8 nails
    keep Hammer,                         -- Need hammer but don't consume it

    Result:Crate,                        -- Output (just one crate)
    Time:150.0,
    Category:Carpentry,
    NeedToBeLearn:true,                  -- Player must learn recipe first
}

-- PATTERN 4: ALTERNATIVE INGREDIENTS (either/or)
recipe Make Spear {
    TreeBranch,
    KitchenKnife/HuntingKnife,           -- Slash means "or" - either knife works

    Result:SpearCrafted,
    Time:80.0,
    SkillRequired:Maintenance=2,         -- Requires skill level 2
}
```

**Key syntax notes:** These comments explain the *syntax differences* (colon vs equals, slash for alternatives) that AI often gets wrong.

---

### Lua Patterns: Events

Create `_ai_context/lua_patterns/events.lua`:

```lua
-- VANILLA EVENT HANDLER PATTERNS FOR AI REFERENCE

-- PATTERN 1: OnGameStart (fires when game loads)
-- WARNING: Player might not exist yet in this event!
local function OnGameStart()
    print("Game started")  -- Safe: just logging
    -- NOT SAFE: getPlayer() might return nil here
end
Events.OnGameStart.Add(OnGameStart)

-- PATTERN 2: OnCreatePlayer (fires after player is created)
-- This is when the player definitely exists
local function OnCreatePlayer(playerNum, player)
    -- player parameter is passed to us automatically
    print("Player " .. playerNum .. " created")

    -- Now it's safe to work with the player
    local inventory = player:getInventory()
    inventory:AddItem("Base.Axe")
end
Events.OnCreatePlayer.Add(OnCreatePlayer)

-- PATTERN 3: OnPlayerUpdate (fires every game tick for each player)
-- Use sparingly - this runs VERY frequently!
local function OnPlayerUpdate(player)
    -- This runs multiple times per second
    -- Only do lightweight checks here
    if player:getMoodles():getMoodleLevel(MoodleType.Hungry) > 2 then
        -- Player is very hungry
    end
end
Events.OnPlayerUpdate.Add(OnPlayerUpdate)

-- PATTERN 4: OnKeyPressed (when player presses a key)
local function OnKeyPressed(key)
    -- key is a number representing the key code
    if key == getCore():getKey("Interact") then
        local player = getPlayer(0)
        print("Player pressed interact key")
    end
end
Events.OnKeyPressed.Add(OnKeyPressed)
```

---

### Conventions Document

Create `_ai_context/conventions.md`:

```markdown
# MyMod Conventions

## Naming Conventions

### Item IDs
- Use PascalCase: `CustomSword`, `AdvancedHelmet`, `MedicalBandage`
- NO snake_case: not `custom_sword`
- NO spaces: not `Custom Sword`

### File Names
- Use snake_case: `items_weapons.txt`, `recipes_food.txt`
- Group related items: all weapons in one file, all food in another
- Prefix with category: `items_`, `recipes_`, `lua_`

### Lua Functions
- Use PascalCase: `OnPlayerDeath`, `HandleItemUse`, `CheckInventory`
- Prefix event handlers with "On": `OnGameStart`, `OnPlayerUpdate`

## Module Naming

### When to use "Base"
- Replacing vanilla items
- Adding items that should feel vanilla
- Items that use vanilla icons/sprites

### When to use "MyMod"
- Custom items that shouldn't conflict with other mods
- Items with unique mechanics
- Items that clearly belong to your mod

## File Organization

```
media/
├── scripts/
│   ├── items_weapons.txt      <- All weapon definitions
│   ├── items_tools.txt        <- All tool definitions
│   ├── items_food.txt         <- All food definitions
│   └── recipes_all.txt        <- All recipes (or split by category)
└── lua/
    ├── client/                <- UI, local player stuff
    └── shared/                <- Logic that works in both client and server
```

## Recipe Categories

Map item types to crafting categories:
- Weapons → `Category:Metalworking`
- Tools → `Category:Carpentry`
- Food → `Category:Cooking`
- Medical → `Category:First Aid`
- Survival gear → `Category:Survivalist`

## Code Style

- Use 4-space indentation (not tabs)
- Add comments before complex logic blocks
- Group related properties together in items
- Add blank lines between item definitions for readability
```

---

## Using Your Context Library

Now that you have a library, let's look at how to use it effectively.

### Strategy 1: Full Context (for complex requests)

When starting a new system or creating something complex, paste comprehensive context:

```
I'm creating a custom weapon for Project Zomboid Build 41.

Here are vanilla weapon examples showing correct syntax:

[paste entire items_weapons.txt]

Here are my mod's conventions:

[paste conventions.md]

Now create a machete with:
- Longer range than kitchen knife but shorter than baseball bat
- High damage for a blade weapon
- Can chop trees (TreeDamage property)
- Uses the Blade category
- Follow my PascalCase naming convention
```

**When to use full context:**
- Starting a new type of item you haven't made before
- You want perfect consistency with your style
- The request is complex with multiple requirements

---

### Strategy 2: Minimal Context (for simple requests)

When making something similar to what you've done before, just paste one relevant example:

```
Using this vanilla recipe as a template:

[paste just the "Make Wooden Crate" recipe example]

Create a recipe for a wooden box that uses 2 planks and 4 nails, needs a hammer (keep), takes 80 time units, and is in the Carpentry category.
```

**When to use minimal context:**
- You're creating a variation of something you already have
- The request is straightforward
- You want a quick answer

---

### Strategy 3: Reference by Mention (when AI remembers)

In the same AI conversation, after you've pasted context once, you can reference it:

```
First request:
Create a weapon using this vanilla template: [paste BaseballBat example]

AI creates a machete.

Second request in SAME conversation:
Now create another weapon similar to the machete you just made, but make it a shortsword with slightly less range.
```

AI remembers the context from earlier in the conversation, so you don't need to paste it again.

**When to use references:**
- Making multiple similar items in one session
- Iterating on something AI just created
- Building a series of related items

---

## Common Mistakes

### Mistake 1: Pasting Too Much Context

**Doesn't work:**
```
[Pastes 500 lines of examples]
[Pastes entire conventions document]
[Pastes all Lua patterns]
[Then asks for one simple item]
```

**What happens:** AI gets overwhelmed. Too much information actually reduces accuracy because AI has to figure out what's relevant.

**Works:**
```
[Pastes ONE relevant weapon example]

Create a similar weapon with these changes: [specific request]
```

**Why:** Give AI just what it needs for the current task. One good example is better than ten examples when you're creating one item.

---

### Mistake 2: Using Outdated Examples

**Doesn't work:**
```
[Pastes examples from Build 40]
[Asks AI to create Build 41 item]
```

**What happens:** AI uses deprecated properties or old syntax that doesn't work in Build 41.

**Works:**
```
[Opens vanilla Build 41 files]
[Copies current examples]
[Always specifies "Build 41" in prompt]
```

**Why:** PZ syntax changes between builds. Your context library must match the version you're modding.

---

### Mistake 3: No Comments in Examples

**Doesn't work:**
```
item Apple {
    HungerChange = -10,
    Type = Food,
    DaysFresh = 6,
}
```

**What happens:** AI sees the syntax but doesn't understand *why* `HungerChange` is negative or what `DaysFresh` means.

**Works:**
```
item Apple {
    HungerChange = -10,      -- Negative values REDUCE hunger (negative = good for player)
    Type = Food,             -- Must be "Food" for edible items
    DaysFresh = 6,           -- Stays fresh for 6 game days before starting to rot
}
```

**Why:** Comments explain the *meaning* behind the syntax. AI can then apply that understanding to new items.

---

### Mistake 4: Mixing Different Conventions

**Doesn't work:**
```
[Shows vanilla example using module Base]
[Shows your mod using module MyMod]
[Shows another example using module SomethingElse]
[AI doesn't know which to use]
```

**What happens:** AI picks randomly, leading to inconsistent module names across your mod.

**Works:**
```
[In conventions.md, clearly state:]
"Always use module MyMod for custom items"

[Then paste examples that all use module MyMod]
```

**Why:** Consistency helps AI make the right choice every time.

---

### Mistake 5: Never Updating the Library

**Doesn't work:**
```
[Creates context library in January]
[PZ updates in March with new properties]
[Still using old context library in June]
[AI generates code with missing properties]
```

**What happens:** Your reference examples become outdated. AI doesn't know about new features.

**Works:**
```
[After PZ updates, check patch notes]
[Update vanilla examples if syntax changed]
[Add new properties to your reference files]
[Note the build version in your conventions document]
```

**Why:** Games evolve. Your context library should evolve with them.

---

## Try It Yourself

Let's practice creating and using a context library from scratch. This exercise takes about 15-20 minutes.

### Your Goal

Create a minimal context library and use it to have AI generate a custom tool item.

### Step 1: Create the Folder

In your mod folder (or create a test folder if you don't have a mod yet):

```
TestMod/
└── _ai_context/
    └── tool_example.txt
```

### Step 2: Find a Vanilla Tool

1. Open `<your Steam library>\steamapps\common\ProjectZomboid\media\scripts\items.txt`
2. Search for "item Hammer" (Ctrl+F)
3. Copy the entire Hammer definition

### Step 3: Add Comments

Paste the Hammer into `tool_example.txt` and add explanatory comments:

```
-- VANILLA TOOL EXAMPLE
-- This shows correct property names for a tool item in PZ Build 41
item Hammer {
    MaxRange = 0.9,              -- [Add your own comment explaining what this is]
    WeaponSprite = Hammer,
    Type = Weapon,               -- [Add comment]
    Weight = 1,
    MaxDamage = 0.5,
    DisplayName = Hammer,
    MinDamage = 0.3,
    Icon = Hammer,
}
```

Fill in the comments based on what you think each property does. Don't worry about being perfect - the exercise is about organizing references.

### Step 4: Use It With AI

Open ChatGPT or Claude and paste this prompt:

```
I'm creating a tool for Project Zomboid Build 41.

Here's a vanilla tool example showing the correct property names:

[paste your commented Hammer example]

Now create a Wrench item that:
- Has the same range as the hammer
- Weighs 0.8 (lighter than hammer)
- Does 0.3 max damage and 0.2 min damage (less than hammer)
- Has DisplayName "Wrench" and Icon "Wrench"

Follow the exact property names and format from my example.
```

### Step 5: Compare Results

AI should generate something like:

```
item Wrench {
    MaxRange = 0.9,
    WeaponSprite = Wrench,
    Type = Weapon,
    Weight = 0.8,
    MaxDamage = 0.3,
    DisplayName = Wrench,
    MinDamage = 0.2,
    Icon = Wrench,
}
```

Notice:
- All property names match the vanilla example exactly
- The format (spacing, order) matches your example
- Values changed according to your specifications

### Step 6: Verify Success

You've successfully created and used a context library if:
- AI used correct property names (not `displayName` or `name` or `weight_value`)
- AI matched the format of your example
- You can reuse this example for future tools

**Optional Step 7: Expand**

Add one recipe example to `_ai_context/recipe_example.txt` following the same process. Now you have two reference types.

---

## Maintaining Your Library

Your context library is a living document. Here's how to keep it useful.

### When to Update

**After PZ game updates:**
- Check patch notes for syntax changes
- Verify your examples still work in the new version
- Add any new properties that were introduced

**When you learn new patterns:**
- Found a vanilla example that's better than yours? Replace it
- Discovered a new recipe pattern? Add it
- Figured out a tricky Lua pattern? Document it

**When your mod evolves:**
- Your naming conventions changed? Update `conventions.md`
- Your file structure changed? Update the organization documentation
- You're using a new module name? Document when and why

---

### How to Organize as It Grows

Start simple, expand as needed:

**Stage 1: Basic (1-5 examples)**
```
_ai_context/
├── item_example.txt
└── recipe_example.txt
```

**Stage 2: Categorized (6-20 examples)**
```
_ai_context/
├── items/
│   ├── weapons.txt
│   ├── food.txt
│   └── tools.txt
├── recipes/
│   └── all_recipes.txt
└── conventions.md
```

**Stage 3: Comprehensive (20+ examples)**
```
_ai_context/
├── items/
│   ├── weapons_blade.txt
│   ├── weapons_blunt.txt
│   ├── food_fresh.txt
│   ├── food_packaged.txt
│   ├── tools.txt
│   └── clothing.txt
├── recipes/
│   ├── cooking.txt
│   ├── carpentry.txt
│   └── metalworking.txt
├── lua/
│   ├── events.lua
│   ├── inventory.lua
│   └── player.lua
├── conventions.md
└── project_context.md
```

**Don't over-organize early.** Start with a few files and split them only when they get too large to navigate.

---

### Reviewing and Refining

Every few months (or after major mod milestones):

1. **Delete unused examples** - If you never paste that clothing example, remove it
2. **Merge duplicate patterns** - Found three similar recipes? Keep the best one
3. **Improve comments** - Update explanations based on what you've learned
4. **Test with AI** - Paste an example into AI and see if it generates correct code

---

## Advanced: Project-Specific Context

For complex mods with multiple systems, create a project overview that you paste at the start of every AI session.

### Project Context Template

Create `_ai_context/project_context.md`:

```markdown
# [Your Mod Name] Project Context

## What This Mod Does
[1-2 sentence description]

Example: "Adds realistic survival mechanics: temperature system, disease system, and advanced hunger/thirst."

## Core Systems

### Temperature System
- Tracked via hidden moodle "TempLevel"
- Ranges from 0 (hypothermia) to 100 (hyperthermia)
- Affected by: weather, clothing, time near fire
- Code location: `lua/client/TemperatureSystem.lua`

### Disease System
- Custom effect "Diseased" applied to player
- Three stages: Sick, Very Sick, Critical
- Cured by: Medicine Kit item or rest
- Code location: `lua/shared/DiseaseManager.lua`

## Custom Items

- **Thermometer** (Base.Thermometer) - Checks player temperature
- **Medicine Kit** (SurvivalPlus.MedicineKit) - Cures diseases
- **Water Purifier** (SurvivalPlus.WaterPurifier) - Makes water safe

## Module Names

- Vanilla-replacement items: `module Base`
- Custom items: `module SurvivalPlus`
- Never use: `module MyMod` (outdated from v1)

## Dependencies

- **Requires:** None
- **Compatible with:** Brita's Weapons, Hydrocraft
- **Incompatible with:** Other temperature mods

## Current Status

- Version: 2.1
- Build: Build 41 only
- Last updated: 2025-01-15

## Common Patterns

### Adding a Temperature Modifier
```lua
local function ModifyTemp(player, amount, reason)
    local current = player:getModData().tempLevel or 50
    player:getModData().tempLevel = math.max(0, math.min(100, current + amount))
    print("Temperature changed: " .. reason)
end
```

### Checking Disease Status
```lua
local function IsDiseased(player)
    return player:getModData().diseaseStage ~= nil
end
```
```

### How to Use Project Context

**Start of AI session:**
```
I'm working on my Project Zomboid Build 41 mod. Here's the context:

[paste project_context.md]

Now, I want to add a new item that reduces temperature by 10 when used. How should I implement this?
```

AI now knows:
- Your mod uses `SurvivalPlus` module for custom items
- Temperature is stored in `player:getModData().tempLevel`
- You have a `ModifyTemp` function pattern to follow

**Result:** AI generates code that fits seamlessly into your existing mod instead of guessing how your systems work.

---

## Key Takeaways

1. **Context libraries improve AI accuracy** - One vanilla example prevents dozens of wrong property names
2. **Start simple, expand as needed** - Begin with 1-2 examples, grow only when you need more
3. **Add explanatory comments** - Comments teach AI the "why" behind syntax, not just the "what"
4. **Organize by topic** - Weapons separate from food, items separate from recipes
5. **Update after game patches** - Syntax changes between PZ builds. Keep examples current
6. **Paste relevant context only** - One good example beats ten irrelevant ones
7. **Document your conventions** - AI can match your style only if you tell it what your style is
8. **Use project context for complex mods** - Large mods benefit from a project overview file

---

## What's Next?

- [Anatomy of a Recipe](../recipes/recipe-anatomy) - Deep dive into recipe syntax with examples for your context library
- [Anatomy of an Item](../items/item-anatomy) - Deep dive into item properties with examples for your context library
