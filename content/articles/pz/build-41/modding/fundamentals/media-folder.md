---
id: fundamentals-media-folder
slug: media-folder
title: "The Media Folder"
game: pz
version: build-41
section: modding
category: fundamentals
subcategory: null
difficulty: beginner
tags:
  - beginner
  - media
  - folder
  - structure
  - organization
  - files
  - scripts
  - lua
  - textures
excerpt: "The media folder is the heart of Project Zomboid modding. Learn how vanilla and mod files are organized, what each subfolder contains, and where to put your own files."
table_of_contents:
  - text: "What Is the Media Folder?"
    link: "#what-is-the-media-folder"
  - text: "The Simplest Mod Structure"
    link: "#the-simplest-mod-structure"
  - text: "Where Is the Media Folder?"
    link: "#where-is-the-media-folder"
  - text: "Building Your Mod Step by Step"
    link: "#building-your-mod-step-by-step"
  - text: "The Scripts Folder"
    link: "#the-scripts-folder"
  - text: "The Lua Folder"
    link: "#the-lua-folder"
  - text: "The Textures Folder"
    link: "#the-textures-folder"
  - text: "The UI Folder"
    link: "#the-ui-folder"
  - text: "How the Game Loads Files"
    link: "#how-the-game-loads-files"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "File Types Explained"
    path: /build-41/modding/fundamentals/file-types-explained
  - title: "Recipe Basics"
    path: /build-41/modding/recipes/recipe-basics
  - title: "Item Creation"
    path: /build-41/modding/items/item-creation
last_updated: 2026-01-28
---

# The Media Folder

## What Is the Media Folder?

When you swing a Katana in Project Zomboid, open a can of soup, or craft a wooden spear, the game is reading files that define those items—what they're called, what they look like, how much damage they do. Every single item, recipe, sound, and behavior in the game comes from files stored in a folder called `media`.

When you install a mod, the game looks inside that mod's `media` folder for new content to add to the game. Want to add a custom weapon? It goes in `media`. Want to add a new recipe? Also `media`. Custom icons? You guessed it—`media`.

Think of the `media` folder like a filing cabinet. When you create a new weapon, the game needs to know: What are its stats? (That goes in one drawer.) What does it look like? (That goes in another drawer.) How should it behave when the player swings it? (That goes in a third drawer.) The `media` folder is that filing cabinet, and each subfolder is a drawer that holds a specific type of file.

If you're feeling overwhelmed by folder structures and file organization, you're not alone. When I first opened the game's folders, I saw hundreds of files scattered across dozens of subfolders and wanted to close everything immediately. But here's the thing: **you don't need to understand the entire structure to make your first mod.** Let me show you the absolute minimum you need to get started—and then we'll build up from there, one piece at a time.

---

## The Simplest Mod Structure

Before we explore all the folders and what they do, let's look at the smallest possible mod that actually works. This is a mod with exactly **one item** and nothing else:

```
MyFirstMod/
├── mod.info                     ← Tells the game this is a mod
└── Contents/
    └── mods/
        └── MyFirstMod/
            └── media/           ← The filing cabinet
                └── scripts/     ← The "item definitions" drawer
                    └── items_myfirstmod.txt  ← Your item
```

**That's it.** Five folders deep, two files total. This structure is enough to add a new item to Project Zomboid. The game will:
1. Read `mod.info` and recognize your mod
2. Look inside `media/scripts/`
3. Find your `.txt` file
4. Load your item into the game

Inside `items_myfirstmod.txt`, you'd have something as simple as:

```
module MyFirstMod  // Creates a namespace (named group) for your items
{
    item MyKnife  // Declares an item named MyKnife
    {
        Type = Weapon,  // Tells the game this is a weapon
        DisplayName = My First Knife,  // Name players see in-game
        Weight = 0.5,  // Weight in the player's inventory
        MinDamage = 0.5,  // Minimum damage when hitting zombies
        MaxDamage = 1.0,  // Maximum damage when hitting zombies
    }
}
```

**What do these symbols mean?**

If you're new to code, those curly braces and equals signs might look confusing. Let's demystify them:

| Symbol | What It Means | Example |
|--------|---------------|---------|
| `module` | **Declaration** - tells the game "I'm about to define a module" | `module MyFirstMod` |
| `item` | **Declaration** - tells the game "I'm about to define an item" | `item MyKnife` |
| `{}` | **Content container** - everything between these braces belongs together | `{ Type = Weapon, }` |
| `=` | **Assignment** - this property gets this value | `Weight = 0.5` |
| `,` | **Separator** - separates one property from the next | `Type = Weapon,` |
| `//` | **Comment** - the game ignores this, it's just notes for humans | `// This is a comment` |

**About namespaces:** When you write `module MyFirstMod`, you're creating a **namespace** - programmer-speak for "a named group that prevents naming conflicts." Think of it like this: If you create an item called `Knife` and another modder also creates an item called `Knife`, the game needs to know which one you mean. By putting yours in the `MyFirstMod` namespace, your knife becomes `MyFirstMod.Knife`, and theirs might be `OtherMod.Knife`. They're separate items that can coexist.

**Why is it called a "namespace"?** Because it's a space (container) with a name. Simple as that.

> **Key Takeaway:** The `media` folder is where all your mod content lives. Even the simplest mod needs this structure: `media/scripts/` for item definitions.

---

## Where Is the Media Folder?

Now that you've seen the simplest version, let's understand where the `media` folder actually lives—both in the vanilla game and in your mods.

### Vanilla PZ Location

The game itself has a `media` folder with all the vanilla content:

```
ProjectZomboid/media/
├── scripts/     ← Item and recipe definitions (hundreds of .txt files)
├── lua/         ← Game logic (thousands of .lua files)
├── textures/    ← Item icons and images (.png files)
├── ui/          ← UI textures (.png files)
├── sound/       ← Audio files (.ogg, .wav)
├── models/      ← 3D models
└── ...more folders
```

**Why does this matter?** Because your mod mirrors this exact structure. When you create `YourMod/media/scripts/items.txt`, the game treats it exactly like vanilla's `ProjectZomboid/media/scripts/items.txt`—except your mod's files load **after** vanilla files, so they can add to or override the base game.

### Your Mod Location

Your mod's `media` folder goes here:

```
YourMod/Contents/mods/YourModName/media/
├── scripts/
├── lua/
├── textures/
└── ui/
```

**Important folder path detail:** Notice the structure is `Contents/mods/YourModName/media/`. It's not just `YourMod/media/`—the game specifically looks for `Contents/mods/[ModName]/` before it looks for the `media` folder inside. If you skip the `Contents/mods/` part, the game won't find your files, and your mod will silently fail to load.

---

## Building Your Mod Step by Step

This looks like a lot of folders. If you're feeling like you just got hit with a firehose of information, that's normal. Let's slow down and build this up gradually, starting with the absolute minimum and adding one piece at a time.

### Version 1: Just the Item

**Goal:** Add one item to the game. No custom icon, no special behavior—just the item definition.

```
MyFirstMod/
├── mod.info
└── Contents/
    └── mods/
        └── MyFirstMod/
            └── media/
                └── scripts/
                    └── items_myfirstmod.txt
```

**What happens when you load this mod:**
1. The game sees `mod.info` and recognizes your mod
2. It loads `media/scripts/items_myfirstmod.txt`
3. Your item appears in the game with a placeholder icon (a white box)

**Try it:** Load the game, open the Item Spawner (Sandbox mode or admin commands), search for your item's name. It'll be there—ugly placeholder icon and all—but it works.

---

### Version 2: Adding a Custom Icon

**Goal:** Give your item a real icon instead of the placeholder.

```
MyFirstMod/
├── mod.info
└── Contents/
    └── mods/
        └── MyFirstMod/
            └── media/
                ├── scripts/
                │   └── items_myfirstmod.txt
                └── textures/           ← NEW: Icon folder
                    └── MyKnifeIcon.png  ← NEW: Your 64x64 icon
```

**What changed:**
- We added a `textures/` folder inside `media/`
- We created a 64x64 pixel PNG image called `MyKnifeIcon.png`

**In your item definition, add this line:**
```
item MyKnife
{
    Type = Weapon,
    DisplayName = My First Knife,
    Icon = MyKnifeIcon,        ← NEW: Tells the game which icon to use
    Weight = 0.5,
    MinDamage = 0.5,
    MaxDamage = 1.0,
}
```

**What happens now:**
1. The game loads your item
2. It sees `Icon = MyKnifeIcon,`
3. It looks in `media/textures/` for `MyKnifeIcon.png`
4. Your item now has a real icon

> **Key Takeaway:** The `media` folder uses **type-based organization**. Scripts go in `scripts/`, images go in `textures/`, code goes in `lua/`. The game knows to look in each folder for specific file types.

---

### Version 3: Adding Custom Behavior

**Goal:** Make something happen when the player uses your knife (for example, print a message to the console).

```
MyFirstMod/
├── mod.info
└── Contents/
    └── mods/
        └── MyFirstMod/
            └── media/
                ├── scripts/
                │   └── items_myfirstmod.txt
                ├── textures/
                │   └── MyKnifeIcon.png
                └── lua/                    ← NEW: Code folder
                    └── client/             ← NEW: Client-side code
                        └── MyKnifeMod.lua  ← NEW: Your behavior code
```

**What changed:**
- We added a `lua/` folder inside `media/`
- Inside `lua/`, we created a `client/` folder (for code that runs on the player's machine)
- We created a `.lua` file with custom code

**In `MyKnifeMod.lua`, you might write:**
```lua
-- This function runs when the game starts
-- (Events.OnGameStart is a hook—a moment the game lets us add our code)
Events.OnGameStart.Add(function()
    print("MyKnifeMod loaded!")  -- Prints a message to the console
end)
```

`Events.OnGameStart` is a **hook** - that's programmer-speak for "a moment in the game where you can attach your own code." Think of it like a coat hook: the game provides the hook (OnGameStart), and you hang your code on it. When the game starts, it runs through all the code that's been "hooked" to that moment. You'll see hooks everywhere in PZ modding - `OnGameStart`, `OnKeyPressed`, `OnZombieDead`, and dozens more.

**What happens now:**
1. The game loads your item and icon (like before)
2. The game looks in `media/lua/client/` for Lua scripts
3. It finds `MyKnifeMod.lua` and runs it
4. When you start a game, you'll see "MyKnifeMod loaded!" in the console

**Why does the code go in `lua/client/`?** Because this code only needs to run on the player's screen—it's not affecting the game world that the server tracks. We'll talk more about `client/` vs `server/` vs `shared/` later, but for now, just know that UI-related code goes in `client/`.

> **Key Takeaway:** The `media` folder structure lets you start simple (just scripts) and add complexity gradually (icons, then code, then sounds, then models). You only create the folders you actually need.

---

## The Scripts Folder

Now that you've seen how the `media` folder works in practice, let's look at each subfolder in detail.

### Location
```
media/scripts/
```

### What It Contains

The `scripts/` folder holds **data definition files**—human-readable `.txt` files that tell the game about items, recipes, sounds, farming crops, moveable furniture, and more. These files don't contain code (no programming required)—they're just structured lists of **properties** (characteristics or settings like `Weight` or `DisplayName` that describe how something behaves).

**Common vanilla files you'll see:**
```
media/scripts/
├── items.txt           ← Main item definitions (hundreds of items)
├── items_weapons.txt   ← Weapon items (guns, melee weapons)
├── items_food.txt      ← Food items (canned goods, raw ingredients)
├── items_literature.txt ← Books and magazines
├── recipes.txt         ← Main crafting recipes (~315 recipes)
├── evolvedrecipes.txt  ← Cooking/combination recipes (38 recipes)
├── farming.txt         ← Crop definitions (tomatoes, cabbages, etc.)
├── moveables.txt       ← Furniture placement definitions
├── sounds_ui.txt       ← UI sound definitions
├── sounds_world.txt    ← World sound definitions
└── ...more definition files
```

### Naming Conventions

Vanilla uses consistent patterns. You should follow them in your mods:

| Pattern | Example | Purpose |
|---------|---------|---------|
| `items_[category].txt` | `items_weapons.txt` | Items grouped by type |
| `recipes_[system].txt` | `recipes_radio.txt` | Recipes for specific systems |
| `sounds_[context].txt` | `sounds_world.txt` | Sounds grouped by usage |

**Your mods should use similar names:**
```
media/scripts/
├── items_mymod.txt       ← All your mod's items
├── recipes_mymod.txt     ← All your mod's recipes
└── sounds_mymod.txt      ← All your mod's sounds
```

**Why does this matter?** The filenames don't change how the game loads them (the game reads all `.txt` files in `scripts/` regardless of name), but clear names help **you** stay organized—and help other modders who might read your code later.

> **Permission to organize:** The vanilla game sometimes has inconsistent file naming. Don't stress about matching it perfectly. Name your files in a way that makes sense to you. The game doesn't care—it reads them all anyway.

---

## The Lua Folder

### Location
```
media/lua/
```

### What It Contains

The `lua/` folder holds **code**—programming logic written in the Lua language. This is where you define:
- Custom behaviors (what happens when an item is used)
- UI modifications (new windows, menus, buttons)
- Event responses (what happens when the player does something)
- Recipe **callbacks** (code that runs when crafting)

> **Note:** You'll see the word "callback" a lot in modding. It's programmer-speak for "a function that gets called later when something happens." When you craft a wooden spear in-game, a callback runs to create the item and give you XP. You'll use callbacks to make custom behaviors happen at specific moments.

Unlike `scripts/` (which is just data), `lua/` files contain actual programming.

### The Three Subfolders: client, server, shared

This is where things get a little more complex. If you're feeling overwhelmed, take a breath—but once you see the pattern, it's actually straightforward. Let's break this down step by step.

```
media/lua/
├── client/              ← Runs on player's machine only
│   ├── ISUI/            ← UI panels and windows
│   ├── OptionScreens/   ← Settings menus
│   ├── TimedActions/    ← Crafting/action animations
│   └── ...more client code
│
├── server/              ← Runs with world authority (even in singleplayer)
│   ├── recipecode.lua   ← Recipe callbacks
│   └── ...more server code
│
└── shared/              ← Runs on both client and server
    ├── NPCs/
    └── ...shared code
```

**Why the split?** Project Zomboid is built for multiplayer. Even in singleplayer, the game runs a "server" (the part that knows where zombies are, what the weather is, what items are on the ground) and a "client" (the part that draws graphics on your screen and handles your mouse clicks).

| Folder | Runs On | Use For | Example |
|--------|---------|---------|---------|
| `client/` | Player's screen only | UI, graphics, sounds, animations | Showing a button, playing a sound effect |
| `server/` | World authority | Game logic, item spawning, world changes | Spawning a zombie, changing the weather |
| `shared/` | Both | Utility functions, shared data | Helper functions, constant definitions |

**A concrete example:**

When you click a button that says "Craft Item":
1. The **client** code draws the button and detects your click
2. The **client** tells the **server**: "The player wants to craft this item"
3. The **server** checks: Does the player have the ingredients? If yes, it removes them and adds the result to the player's inventory
4. The **server** tells the **client**: "Update the UI to show the new item"
5. The **client** updates the graphics

**For beginners:** Start with `client/` code. It's easier to test (you can see the results immediately), and most early mods are about UI or visual changes.

> **Key Takeaway:** That's the pattern: `client/` = what you see on your screen, `server/` = what the game world knows, `shared/` = utilities that both need. When in doubt, start with `client/`.

### Important Vanilla Files

These files are worth exploring to learn how PZ works:

| File | Purpose |
|------|---------|
| `lua/server/recipecode.lua` | Recipe callback implementations (what happens when you craft something) |
| `lua/client/ISUI/ISPanel.lua` | Base class for UI panels (windows, menus) |
| `lua/client/ISUI/ISButton.lua` | Base class for buttons |
| `lua/client/TimedActions/ISBaseTimedAction.lua` | Base class for timed actions (crafting animations) |

**Try this:** Navigate to your Project Zomboid installation, find `media/lua/client/ISUI/ISButton.lua`, and open it in a text editor. You'll see the code that powers every button in the game. It's not magic—it's just Lua code like what you'll write.

---

## The Textures Folder

### Location
```
media/textures/
```

### What It Contains

PNG images for items, world objects, and in-game graphics (but NOT UI graphics—those go in `ui/`).

**When you define an item:**
```
item MyKnife
{
    Icon = MyKnifeIcon,
}
```

**The game looks for:** `media/textures/MyKnifeIcon.png`

### File Naming

**The icon filename must match the property value:**
- If you write `Icon = MyKnifeIcon,` the game looks for `MyKnifeIcon.png`
- If you write `Icon = KnifeIcon,` the game looks for `KnifeIcon.png`
- Capitalization matters: `MyKnifeIcon.png` is different from `myknifeicon.png`

### Icon Size

**Standard item icons are 64x64 pixels.** The game will scale other sizes, but 64x64 looks best.

### Common Subfolders

```
media/textures/
├── Item_*.png       ← Vanilla item icons (Item_Hammer.png, Item_Screwdriver.png)
├── clothing/        ← Clothing textures
├── Tiles/           ← World tiles
└── ...more folders
```

**Your mod doesn't need to follow vanilla's subfolder structure.** You can put all your icons directly in `textures/`, or organize them however you like:
```
media/textures/
├── MyKnifeIcon.png
├── MyAxeIcon.png
└── weapons/
    ├── MySwordIcon.png
    └── MySpearIcon.png
```

As long as the icon filenames match what you write in `Icon = ...`, the game will find them.

> **Permission to organize:** Vanilla has a complex subfolder structure in `textures/`. You don't need to match it. Organize your icons in whatever way makes sense to you.

---

## The UI Folder

### Location
```
media/ui/
```

### What It Contains

UI-specific images like:
- Button backgrounds
- Panel borders
- Icons for menus
- Cursor images
- Inventory window decorations

**Important distinction:**
- UI *images* (PNG files) go in `ui/`
- UI *code* (Lua files) goes in `lua/client/ISUI/`

This can be confusing at first. Let me give you a concrete example:

**Scenario:** You want to create a custom button with a fancy background image.

1. You create a PNG image of the button background → Save it in `media/ui/MyButtonBackground.png`
2. You write Lua code that creates the button and loads that image → Save it in `media/lua/client/ISUI/MyButtonMod.lua`

The `ui/` folder only holds the image files. The logic lives in Lua.

---

## How the Game Loads Files

This is important to understand because it explains why your mod can add new items without editing vanilla files.

### Load Order

1. **Vanilla `media/` loads first** - The game loads all files from `ProjectZomboid/media/`
2. **Each enabled mod's `media/` loads in order** - The game loads mods in the order listed in your mod settings
3. **Later files can add to or override earlier ones**

### Merging vs Overriding

**Items and recipes MERGE** - Your new definitions add to the existing ones:
```
// Vanilla defines: item Hammer { ... }
// Your mod defines: item MyHammer { ... }
// Result: Both Hammer and MyHammer exist in the game
```

You're not replacing vanilla items—you're adding new ones.

**Lua functions can OVERRIDE** - If you redefine a vanilla function, yours replaces it:
```lua
-- Vanilla defines: function Recipe.OnGiveXP.SawLogs(...)
-- Your mod defines: function Recipe.OnGiveXP.SawLogs(...)
-- Result: Your function runs instead of vanilla's
```

**Why does this matter?** Because you can create complete mods without ever touching vanilla files. Your mod's `media` folder exists alongside vanilla's `media` folder, and the game merges them automatically.

---

## Common Mistakes

Let's look at the mistakes beginners make when setting up the `media` folder—and how to fix them.

### Mistake 1: Wrong Folder Depth

❌ **Doesn't work:**
```
MyMod/media/scripts/items.txt
```

**What you'll see:** The game doesn't recognize your mod. When you check the mod list in-game, your mod doesn't appear.

✅ **Works:**
```
MyMod/Contents/mods/MyModName/media/scripts/items.txt
```

**Why:** The game specifically looks for `Contents/mods/[ModName]/media/`. If you skip `Contents/mods/`, the game never finds your `media` folder, and your mod is invisible to the engine.

---

### Mistake 2: Icon Filename Doesn't Match Property

❌ **Doesn't work:**
```
// In items.txt:
item MyKnife
{
    Icon = MyKnife,      ← Looking for MyKnife.png
}

// In media/textures/:
MyKnifeIcon.png          ← Filename is MyKnifeIcon, not MyKnife
```

**What you'll see:** Your item appears with a white placeholder box instead of your icon.

✅ **Works (Option 1):**
```
// In items.txt:
item MyKnife
{
    Icon = MyKnifeIcon,   ← Matches the filename exactly
}

// In media/textures/:
MyKnifeIcon.png
```

✅ **Works (Option 2):**
```
// In items.txt:
item MyKnife
{
    Icon = MyKnife,       ← Matches the filename exactly
}

// In media/textures/:
MyKnife.png               ← Renamed to match the property
```

**Why:** The game does a literal filename lookup. If you write `Icon = MyKnife,`, it looks for `MyKnife.png`. If the name doesn't match exactly (including capitalization), the game can't find the file.

---

### Mistake 3: UI Code in the Wrong Folder

❌ **Doesn't work:**
```
media/ui/MyButtonMod.lua  ← Lua code in the ui/ folder
```

**What you'll see:** Your code never runs. The button doesn't appear. No error messages—just silence.

✅ **Works:**
```
media/lua/client/ISUI/MyButtonMod.lua  ← Lua code in the lua/ folder
media/ui/MyButtonBackground.png        ← Image in the ui/ folder
```

**Why:** The game only loads `.lua` files from the `lua/` folder. If you put Lua code in `ui/`, the game ignores it because `ui/` is reserved for PNG image files only.

---

### Mistake 4: Missing mod.info File

❌ **Doesn't work:**
```
MyMod/Contents/mods/MyModName/media/scripts/items.txt
(No mod.info file anywhere)
```

**What you'll see:** The game doesn't recognize your mod. It won't appear in the mod list.

✅ **Works:**
```
MyMod/mod.info                                     ← Required file
MyMod/Contents/mods/MyModName/media/scripts/items.txt
```

**Why:** The `mod.info` file is how the game identifies a folder as a mod. Without it, the game thinks your folder is just random files and ignores it completely.

**Minimum required `mod.info` content:**
```
name=My First Mod
id=MyFirstMod
description=Adds a custom knife to the game.
```

---

### Mistake 5: Using Spaces in Filenames

❌ **Doesn't work:**
```
media/scripts/my items.txt
media/textures/My Knife Icon.png
```

**What you'll see:** The game might fail to load the files, or you'll see errors in the console.

✅ **Works:**
```
media/scripts/my_items.txt
media/textures/MyKnifeIcon.png
```

**Why:** Spaces in filenames can cause issues with file path parsing. Use underscores (`_`) or camelCase (`MyKnifeIcon`) instead.

---

## Try It Yourself

Let's create the absolute minimum mod from scratch and verify it works.

### Step 1: Create the Folder Structure

Navigate to your Project Zomboid mods folder. On Windows, it's typically:
```
C:\Users\[YourName]\Zomboid\mods\
```

Create this structure:
```
TestMod/
├── mod.info
└── Contents/
    └── mods/
        └── TestMod/
            └── media/
                └── scripts/
                    └── items_test.txt
```

**How to create it:**
1. Right-click in the `mods/` folder → New Folder → Name it `TestMod`
2. Inside `TestMod/`, create a new text file named `mod.info`
3. Inside `TestMod/`, create a folder named `Contents`
4. Inside `Contents/`, create a folder named `mods`
5. Inside `mods/`, create a folder named `TestMod`
6. Inside `TestMod/`, create a folder named `media`
7. Inside `media/`, create a folder named `scripts`
8. Inside `scripts/`, create a text file named `items_test.txt`

---

### Step 2: Write the mod.info File

Open `mod.info` in a text editor and write:
```
name=Test Mod
id=TestMod
description=My first mod to test the media folder structure.
```

Save and close the file.

---

### Step 3: Write the Item Definition

Open `items_test.txt` in a text editor and write:
```
module TestMod
{
    item TestKnife
    {
        Type = Weapon,
        DisplayName = Test Knife,
        Weight = 0.5,
        MinDamage = 0.5,
        MaxDamage = 1.0,
    }
}
```

Save and close the file.

---

### Step 4: Enable Your Mod in Game

1. Launch Project Zomboid
2. On the main menu, click "Mods"
3. Find "Test Mod" in the list (it should appear on the left side)
4. Check the box to enable it
5. Click "Done" and restart the game when prompted

---

### Step 5: Verify It Works

1. Start a new sandbox game (or load an existing save)
2. Press the debug key (default is F12 or backslash `\`) to open the debug menu
3. Click "Items" to open the Item Spawner
4. In the search box, type "Test Knife"
5. You should see "TestMod.TestKnife" in the list
6. Click it to spawn the item

**Success!** Your item appears in-game (with a placeholder icon, but it works).

---

### Step 6: Add a Custom Icon (Optional)

1. Create a 64x64 pixel PNG image of a knife (or use any 64x64 PNG as a test)
2. Name it `TestKnifeIcon.png`
3. Save it in `TestMod/Contents/mods/TestMod/media/textures/`
4. Open `items_test.txt` and add this line inside the item definition:
```
item TestKnife
{
    Type = Weapon,
    DisplayName = Test Knife,
    Icon = TestKnifeIcon,        ← Add this line
    Weight = 0.5,
    MinDamage = 0.5,
    MaxDamage = 1.0,
}
```
5. Save the file
6. Restart the game and check again

**Success!** Your item now has a custom icon.

---

## Key Takeaways

1. **The `media` folder is the heart of modding** - All content (items, recipes, icons, code) goes inside `media/`

2. **Mirror vanilla structure** - Your mod's `media/` folder should have the same subfolders as vanilla's `media/` folder

3. **Type-based organization** - Files are grouped by what they *do*, not by which feature they support:
   - `scripts/` = Data definitions (.txt files)
   - `lua/` = Code (.lua files)
   - `textures/` = Item images (.png files)
   - `ui/` = UI images (.png files)

4. **Start with scripts/** - You can create complete mods with just `.txt` files in `scripts/`—no programming required

5. **Build up gradually** - Start with Version 1 (just the item), then add Version 2 (custom icon), then Version 3 (custom behavior)

6. **The folder path must be exact** - `Contents/mods/[ModName]/media/` is required. If you skip parts, the game won't find your files.

7. **Filenames must match properties** - If you write `Icon = MyIcon,`, the game looks for `MyIcon.png`—capitalization matters

---

**What's next?** Now that you understand the `media` folder structure, you're ready to create actual content. Check out [Item Creation](../items/item-creation) to make your first custom item, or [Recipe Basics](../../recipes/recipe-basics) to add crafting recipes.
