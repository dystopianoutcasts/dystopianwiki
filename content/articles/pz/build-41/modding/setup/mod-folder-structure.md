---
id: setup-mod-folder-structure
slug: mod-folder-structure
title: "Mod Folder Structure"
game: pz
version: build-41
section: modding
category: setup
subcategory: null
difficulty: beginner
tags:
  - beginner
  - setup
  - folder-structure
  - mod-folder
  - media
  - getting-started
excerpt: "Learn the correct folder structure for Project Zomboid mods, including where to place scripts, Lua files, textures, and other content."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Where Mods Live"
    link: "#where-mods-live"
  - text: "The Basic Structure"
    link: "#the-basic-structure"
  - text: "The Complete Structure"
    link: "#the-complete-structure"
  - text: "Folder Reference"
    link: "#folder-reference"
  - text: "Creating Your First Mod Folder"
    link: "#creating-your-first-mod-folder"
  - text: "A Simple Working Example"
    link: "#a-simple-working-example"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Script vs Lua Folders"
    link: "#script-vs-lua-folders"
  - text: "Organizing Multiple Files"
    link: "#organizing-multiple-files"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "The mod.info File"
    path: /build-41/modding/setup/mod-info-file
  - title: "Debug Mode"
    path: /build-41/modding/setup/debug-mode
last_updated: 2026-01-09
---

# Mod Folder Structure

## What Is Mod Folder Structure?

You know that frustrating moment when you spend an hour writing a perfect recipe, place the file somewhere in your mod folder, launch the game... and nothing happens? No error message. No crash. Your recipe just doesn't exist in the game. You check the code - it's perfect. You enable the mod - it's enabled. But it's invisible to Project Zomboid.

**99% of the time, the problem is folder structure.** Project Zomboid looks for your files in very specific places. If your `recipes.txt` file is in `MyMod/recipes.txt` instead of `MyMod/media/scripts/recipes.txt`, the game will never find it. The code doesn't matter. The file name doesn't matter. The file must be in the correct folder, with the correct capitalization, or it doesn't exist to the game engine.

When I created my first mod, I spent 3 hours debugging why my item wouldn't appear. The item script was perfect. The icon was beautiful. The properties were all correct. The problem? I had created `media/Scripts/` with a capital S instead of `media/scripts/` with lowercase s. On Windows, this doesn't matter - both folders work the same. But Project Zomboid's engine is case-sensitive. It was looking for `media/scripts/` and couldn't find it, so my entire mod was invisible.

**This guide will show you the exact folder structure Project Zomboid expects, where each type of file belongs, and how to avoid the common mistakes that make mods invisible.** By the end, you'll be able to create a properly structured mod folder in 2 minutes, and you'll never waste hours debugging invisible files again.

## Overview

Every PZ mod follows a specific folder structure. Get this right, and the game automatically loads your content. Get it wrong, and nothing works. This guide shows you exactly how to set up your mod folder.

## Where Mods Live

Mods can be placed in two locations:

### Steam Workshop Mods (Downloaded)
```
<your Steam library>\steamapps\workshop\content\108600\
```

### Local Development Mods (What You Create)
```
%UserProfile%\Zomboid\mods\
```

Always develop in the `Zomboid\mods` folder - it's easier to find and edit.

## The Basic Structure

Every mod needs this minimum structure:

```
YourModName/                    /* Your mod's root folder (unique name, no spaces) */
├── mod.info                    /* Required: Tells PZ your mod's name, ID, description */
└── media/                      /* Required: ALL content files go inside this folder */
    └── (your files)            /* Scripts, Lua, textures, sounds - everything */
```

**That's it for the bare minimum.** Two items:
1. `mod.info` - A text file with your mod's metadata (name, ID, description)
2. `media/` - A folder that contains literally everything else

**Critical rule:** The `media` folder MUST be spelled exactly `media` (lowercase). Not `Media`, not `MEDIA`, not `assets`. The game engine looks for `media/` specifically.

## The Complete Structure

Here's a full mod structure with all common folders:

```
YourModName/                    /* Mod root folder */
├── mod.info                    /* Required: Mod metadata (name, ID, version, etc.) */
├── poster.png                  /* Optional: Workshop thumbnail image (256x256 pixels) */
└── media/                      /* Required: All game content goes inside this folder */
    ├── scripts/                /* Item/recipe/vehicle definitions - text-based data files (.txt) */
    ├── lua/                    /* Lua programming code for game logic */
    │   ├── client/             /* Client-side only: UI, context menus, visual effects */
    │   ├── server/             /* Server-side only: world changes, spawning, gameplay logic */
    │   └── shared/             /* Both client and server: utilities, shared data, constants */
    ├── textures/               /* Image files for items and UI */
    │   └── Item/               /* Item inventory icons (.png files) - note capital 'I' */
    ├── ui/                     /* UI element textures (buttons, windows, panels) */
    ├── sound/                  /* Custom sound effects and music (.ogg, .wav files) */
    ├── models/                 /* 3D models for items, clothing, vehicles */
    ├── clothing/               /* Clothing texture files and definitions */
    └── maps/                   /* Custom map files (created with WorldEd/TileZed) */
```

**You don't need all of these folders.** Only create the folders you actually need. A simple recipe mod only needs `scripts/`. A Lua-only mod only needs `lua/`.

## Folder Reference

| Folder | Purpose | File Types |
|--------|---------|------------|
| `scripts/` | Items, recipes, vehicles, sounds | `.txt` |
| `lua/client/` | UI, context menus, client effects | `.lua` |
| `lua/server/` | Spawning, world changes, game logic | `.lua` |
| `lua/shared/` | Code needed by both client and server | `.lua` |
| `textures/Item/` | Item inventory icons | `.png` |
| `ui/` | UI elements, buttons, windows | `.png` |
| `sound/` | Sound effects, music | `.ogg`, `.wav` |
| `models/` | 3D models for items, vehicles | various |

## Creating Your First Mod Folder

### Step 1: Navigate to Mods Folder

1. Press `Win + R`
2. Type `%UserProfile%\Zomboid\mods`
3. Press Enter

If the `mods` folder doesn't exist, create it.

### Step 2: Create Your Mod Folder

1. Right-click > New > Folder
2. Name it something unique (no spaces recommended)
   - Good: `MyFirstMod`, `BetterTools`, `ZombieTweaks`
   - Avoid: `My First Mod`, `test`, `mod`

### Step 3: Create the media Folder

1. Open your mod folder
2. Create a new folder named `media` (lowercase)

### Step 4: Create mod.info

1. Right-click > New > Text Document
2. Name it `mod.info` (remove .txt extension)
3. Open with VS Code and add basic info (covered in next article)

## A Simple Working Example

Let's create a mod that adds one new recipe:

```
MyFirstMod/                     /* Mod root folder in Zomboid\mods\ */
├── mod.info                    /* Mod metadata file */
└── media/                      /* Content folder */
    └── scripts/                /* Recipe definitions go here */
        └── my_recipes.txt      /* Your recipe file */
```

**mod.info:**
```
name=My First Mod              # Display name (shown in mod menu)
id=MyFirstMod                  # Unique ID (no spaces, used internally)
description=Adds a simple recipe  # What your mod does
```

**media/scripts/my_recipes.txt:**
```
module Base {                          /* Use Base module for vanilla items */
    recipe Open Can of Beans {         /* Recipe name (shown in crafting menu) */
        TinOpener,                     /* Input item 1: tin opener */
        CannedBeans,                   /* Input item 2: closed can of beans */

        Result:CannedBeansOpen,        /* Output: opened can of beans */
        Time:50.0,                     /* Time in game ticks (50 = ~5 seconds) */
    }
}
```

**That's a complete, working mod!** Three files, properly structured. Enable it in the mod menu, and the recipe appears in-game.

## Common Mistakes

### 1. Wrong Folder Capitalization

**Wrong:**
```
MyMod/
└── media/
    ├── Scripts/        <- Capital 'S' - game won't find this
    └── Lua/            <- Capital 'L' - game won't find this
```

**Right:**
```
MyMod/
└── media/
    ├── scripts/        <- Lowercase 's' - game finds this
    └── lua/            <- Lowercase 'l' - game finds this
```

**Why:** Project Zomboid's file system is case-sensitive. On Windows, `Scripts/` and `scripts/` are the same folder, but PZ only looks for `scripts/` (lowercase). If you create `Scripts/`, your files are invisible to the game.

**How to check:** Look at the folder name carefully. If the first letter is capitalized, rename it to lowercase.

---

### 2. Missing media Folder

**Wrong:**
```
MyMod/
├── mod.info
└── scripts/            <- Scripts directly in mod root - game won't find this
    └── items.txt
```

**Right:**
```
MyMod/
├── mod.info
└── media/              <- Scripts inside media folder - game finds this
    └── scripts/
        └── items.txt
```

**Why:** Project Zomboid ALWAYS looks inside the `media/` folder first. If your `scripts/` folder is directly in the mod root, the game will never see it. Everything except `mod.info` and `poster.png` must be inside `media/`.

---

### 3. Files in Wrong Subfolder

**Wrong:**
```
media/
├── my_recipes.txt      <- Recipe file directly in media/ - game won't find it
└── scripts/
    └── (empty)
```

**Right:**
```
media/
└── scripts/
    └── my_recipes.txt  <- Recipe file in scripts/ - game finds it
```

**Why:** The game looks for recipe/item files specifically in `media/scripts/`, not directly in `media/`. Each file type has a designated subfolder.

**File type locations:**
- `.txt` scripts → `media/scripts/`
- `.lua` code → `media/lua/client/`, `media/lua/server/`, or `media/lua/shared/`
- `.png` item icons → `media/textures/Item/`

---

### 4. Spaces in Folder Names

**Wrong:**
```
My Cool Mod/            <- Spaces can cause loading issues
├── mod.info
└── media/
```

**Right:**
```
MyCoolMod/              <- No spaces - always safe
├── mod.info
└── media/
```

or:

```
My_Cool_Mod/            <- Underscores instead of spaces - also safe
├── mod.info
└── media/
```

**Why:** Spaces in folder names can cause issues with the Steam Workshop, mod loading order, and Lua require() statements. Some systems handle spaces fine, others don't. Avoid the problem entirely by using camelCase or underscores.

---

### 5. Wrong textures/Item Capitalization

**Wrong:**
```
media/
└── textures/
    └── item/           <- Lowercase 'i' - game won't find item icons
        └── axe.png
```

**Right:**
```
media/
└── textures/
    └── Item/           <- Capital 'I' - game finds item icons
        └── axe.png
```

**Why:** The item icon folder is specifically `textures/Item/` with a capital I. This is the ONLY folder in the standard structure that requires a capital letter. Everything else is lowercase.

## Script vs Lua Folders

A common question: when do I use `scripts/` vs `lua/`?

| Use `scripts/` for | Use `lua/` for |
|-------------------|----------------|
| Item definitions | Custom game logic |
| Recipe definitions | UI modifications |
| Vehicle definitions | Event handlers |
| Sound definitions | Complex calculations |
| Fixing definitions | Spawning systems |

**Rule of thumb:** If you're defining *what* something is, use `scripts/`. If you're defining *how* something behaves, use `lua/`.

## Organizing Multiple Files

As your mod grows, organize scripts logically:

```
media/scripts/
├── items_weapons.txt
├── items_food.txt
├── items_tools.txt
├── recipes_weapons.txt
├── recipes_food.txt
└── recipes_tools.txt
```

PZ loads all `.txt` files in `scripts/` - the filenames are for your organization.

## Try It Yourself

### Exercise 1: Create a Minimal Mod Structure

**Goal:** Create the absolute minimum folder structure for a working mod.

**Steps:**
1. Navigate to `%UserProfile%\Zomboid\mods`
2. Create folder: `TestStructureMod`
3. Inside it, create folder: `media`
4. Inside media, create folder: `scripts`
5. Verify the structure matches:
   ```
   TestStructureMod/
   └── media/
       └── scripts/
   ```

<details>
<summary><strong>Solution</strong></summary>

**PowerShell commands:**
```powershell
# Navigate to mods folder
cd "$env:USERPROFILE\Zomboid\mods"

# Create mod with media/scripts structure
New-Item -ItemType Directory -Path "TestStructureMod\media\scripts" -Force
```

**Or manually:**
1. Open File Explorer
2. Paste in address bar: `%UserProfile%\Zomboid\mods`
3. Right-click → New → Folder → Name it "TestStructureMod"
4. Open TestStructureMod
5. Right-click → New → Folder → Name it "media" (lowercase!)
6. Open media
7. Right-click → New → Folder → Name it "scripts" (lowercase!)

**Verify:** Your final path should be: `%UserProfile%\Zomboid\mods\TestStructureMod\media\scripts\`
</details>

---

### Exercise 2: Identify Structure Errors

**Goal:** Find the errors in this mod structure.

```
My First Mod/
├── mod.info
├── Scripts/
│   └── items.txt
└── media/
    └── Lua/
        └── client/
            └── main.lua
```

**Find 3 errors.**

<details>
<summary><strong>Solution</strong></summary>

**Error 1: Spaces in mod folder name**
```
Wrong: My First Mod/
Right: MyFirstMod/
```

**Error 2: Scripts folder outside media**
```
Wrong: Scripts/
    └── items.txt

Right: media/
    └── scripts/
        └── items.txt
```

**Error 3: Capital 'L' in Lua folder**
```
Wrong: media/
    └── Lua/

Right: media/
    └── lua/
```

**Corrected structure:**
```
MyFirstMod/
├── mod.info
└── media/
    ├── scripts/
    │   └── items.txt
    └── lua/
        └── client/
            └── main.lua
```
</details>

---

### Exercise 3: Create a Complete Working Mod

**Goal:** Build a working mod with proper structure that adds one item.

**Requirements:**
- Mod folder: `MyTestItem`
- Add one item: "Test Rock"
- Must load in-game

<details>
<summary><strong>Solution</strong></summary>

**1. Create folder structure:**
```
MyTestItem/
├── mod.info
└── media/
    └── scripts/
        └── items.txt
```

**2. Create mod.info file:**
```
name=My Test Item
id=MyTestItem
description=Adds a test rock item for learning folder structure
poster=poster.png
```

**3. Create media/scripts/items.txt:**
```
module MyTestItem
{
    item TestRock
    {
        DisplayName = Test Rock,
        Type = Normal,
        Weight = 0.5,
        Icon = Stone,
    }
}
```

**4. Test in-game:**
1. Launch Project Zomboid
2. Enable "My Test Item" in mod menu
3. Start a game
4. Press ~ (debug console)
5. Type: `getPlayer():getInventory():AddItem("MyTestItem.TestRock")`
6. Check inventory - you should have a Test Rock

**If it doesn't work:**
- Check folder capitalization (all lowercase except `mod.info`)
- Verify `items.txt` is inside `media/scripts/`
- Verify `media` folder exists
- Check console.txt for errors: `%UserProfile%\Zomboid\console.txt`
</details>

---

## Best Practices

1. **Always use lowercase for folder names** (except `textures/Item/`) - Prevents case-sensitivity issues across different operating systems and the Steam Workshop. Make it a habit.

2. **No spaces in mod folder name** - Use `MyCoolMod` or `My_Cool_Mod` instead of `My Cool Mod`. Spaces can break Steam Workshop uploads and Lua require() statements.

3. **Create folders only when you need them** - Don't create `lua/`, `textures/`, `sound/` unless you're actually using them. Empty folders don't hurt, but they clutter your workspace.

4. **Use descriptive script file names** - `items_weapons.txt` is better than `stuff.txt`. `recipes_food.txt` is better than `recipe1.txt`. You'll thank yourself when the mod has 20 files.

5. **Keep a template mod folder** - Create a `_ModTemplate` folder with the basic structure already set up. Copy it whenever you start a new mod. Saves time and prevents structure mistakes.

6. **Verify structure before coding** - Create all folders first, then add files. It's faster to fix structure issues before writing code than to debug "why isn't my mod loading" after writing 500 lines.

7. **Use a folder structure diagram** - Keep a text file or image showing your mod's structure. Update it as you add folders. Makes it easy to remember where things go, especially for complex mods.

---

## Key Takeaways

1. **Mods go in `%UserProfile%\Zomboid\mods\`** for local development (easier to find and edit than Steam Workshop folder)
2. **Every mod needs two things:** `mod.info` file (metadata) and `media/` folder (all content)
3. **Folder names are case-sensitive** - use lowercase for everything except `textures/Item/` (capital I)
4. **Everything except mod.info goes inside media/** - scripts, lua, textures, sounds, all content
5. **Scripts define WHAT things are** (items, recipes, vehicles) - Lua defines HOW things behave (logic, events, UI)
6. **File locations matter:** `.txt` in `media/scripts/`, `.lua` in `media/lua/client|server|shared/`, `.png` icons in `media/textures/Item/`
7. **Common mistake:** Creating `Scripts/` (capital S) instead of `scripts/` (lowercase s) - game won't find it
8. **Start simple, add folders as needed** - minimum viable mod is just `mod.info` + `media/scripts/` + one `.txt` file
