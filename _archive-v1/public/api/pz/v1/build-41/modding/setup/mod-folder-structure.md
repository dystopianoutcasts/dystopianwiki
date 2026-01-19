---
id: mod-folder-structure
slug: mod-folder-structure
title: Mod Folder Structure
excerpt: Every PZ mod follows a specific folder structure. Get this right, and the game automatically loads your content. Get it wrong, and nothing works. This guide shows you exactly how to set up your mod...
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
last_updated: 2026-01-09
---
# Mod Folder Structure

## Overview

Every PZ mod follows a specific folder structure. Get this right, and the game automatically loads your content. Get it wrong, and nothing works. This guide shows you exactly how to set up your mod folder.

## Where Mods Live

Mods can be placed in two locations:

### Steam Workshop Mods (Downloaded)
```
C:\Program Files (x86)\Steam\steamapps\workshop\content\108600\
```

### Local Development Mods (What You Create)
```
C:\Users\YourName\Zomboid\mods\
```

Always develop in the `Zomboid\mods` folder - it's easier to find and edit.

## The Basic Structure

Every mod needs this minimum structure:

```
YourModName/
├── mod.info                    <- Required: Mod metadata
└── media/                      <- Required: All content goes here
    └── (your files)
```

That's it for the bare minimum. The `mod.info` file tells PZ about your mod, and the `media` folder holds everything else.

## The Complete Structure

Here's a full mod structure with all common folders:

```
YourModName/
├── mod.info
├── poster.png                  <- Optional: Workshop thumbnail (256x256)
└── media/
    ├── scripts/                <- Item and recipe definitions (.txt)
    ├── lua/
    │   ├── client/             <- Client-side Lua (UI, visuals)
    │   ├── server/             <- Server-side Lua (gameplay logic)
    │   └── shared/             <- Both sides (utilities, data)
    ├── textures/
    │   └── Item/               <- Item icons (.png)
    ├── ui/                     <- UI textures
    ├── sound/                  <- Custom sounds (.ogg, .wav)
    ├── models/                 <- 3D models
    ├── clothing/               <- Clothing definitions
    └── maps/                   <- Custom map files
```

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
MyFirstMod/
├── mod.info
└── media/
    └── scripts/
        └── my_recipes.txt
```

**mod.info:**
```
name=My First Mod
id=MyFirstMod
description=Adds a simple recipe
```

**media/scripts/my_recipes.txt:**
```
module Base {
    recipe Open Can of Beans {
        TinOpener,
        CannedBeans,

        Result:CannedBeansOpen,
        Time:50.0,
    }
}
```

That's a complete, working mod!

## Common Mistakes

### Wrong Folder Name
```
❌ media/Scripts/     <- Wrong: capital S
✓ media/scripts/     <- Correct: lowercase
```

### Missing media Folder
```
❌ MyMod/scripts/     <- Wrong: no media folder
✓ MyMod/media/scripts/ <- Correct: inside media
```

### Files in Wrong Location
```
❌ media/my_recipes.txt        <- Wrong: not in scripts
✓ media/scripts/my_recipes.txt <- Correct: in scripts folder
```

### Spaces in Folder Names
```
❌ My Cool Mod/       <- Can cause issues
✓ MyCoolMod/         <- Safe
✓ My_Cool_Mod/       <- Also safe
```

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

## Key Takeaways

1. **Mods go in `Zomboid\mods\`** for local development
2. **Every mod needs `mod.info`** and a `media/` folder
3. **Folder names are case-sensitive** - use lowercase
4. **Scripts define data**, Lua defines behavior
5. **Start simple** - add folders only as you need them 