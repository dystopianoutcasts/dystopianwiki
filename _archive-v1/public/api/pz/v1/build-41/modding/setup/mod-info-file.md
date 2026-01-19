---
id: mod-info-file
slug: mod-info-file
title: The mod.info File
excerpt: "The `mod.info` file is your mod's ID card. It tells Project Zomboid everything it needs to know: the mod's name, what it does, who made it, and what it requires. Without this file, PZ won't recognize..."
game: pz
version: build-41
section: modding
category: setup
subcategory: null
difficulty: beginner
tags:
  - beginner
  - setup
  - mod-info
  - metadata
  - configuration
  - getting-started
last_updated: 2026-01-09
---
# The mod.info File

## Overview

The `mod.info` file is your mod's ID card. It tells Project Zomboid everything it needs to know: the mod's name, what it does, who made it, and what it requires. Without this file, PZ won't recognize your mod.

## File Location

The `mod.info` file goes in your mod's root folder:

```
YourModName/
├── mod.info        <- Here!
└── media/
    └── ...
```

## Basic mod.info

Here's the minimum required content:

```
name=My First Mod
id=MyFirstMod
```

That's it! Two lines and your mod will load. But let's add more useful information.

## Recommended mod.info

```
name=My First Mod
id=MyFirstMod
description=A beginner mod that adds useful recipes and items.
url=https://github.com/yourname/myfirstmod
poster=poster.png
```

## Complete mod.info Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name shown in mod list |
| `id` | Yes | Unique identifier (no spaces, alphanumeric) |
| `description` | No | Short description for mod list |
| `poster` | No | Image filename for thumbnail (256x256 PNG) |
| `url` | No | Link to your mod's page/repository |
| `modversion` | No | Your mod's version number |
| `pzversion` | No | Required PZ version |
| `require` | No | List of required mod IDs |
| `pack` | No | Texture pack name |

## Field Details

### name

The human-readable name displayed in the mod list.

```
name=Better Farming Tools
```

- Can contain spaces and special characters
- Keep it under 50 characters
- Make it descriptive

### id

The unique identifier for your mod. This is critical.

```
id=BetterFarmingTools
```

**Rules:**
- No spaces allowed
- Alphanumeric characters and underscores only
- Must be unique across all mods
- Used by other mods to declare dependencies

**Good IDs:**
- `BetterFarming`
- `ZombieTweaks_Weapons`
- `MyMod2024`

**Bad IDs:**
- `Better Farming` (has space)
- `my-mod` (has hyphen)
- `test` (too generic, likely conflicts)

### description

A short description shown in the mod list.

```
description=Adds 15 new farming tools and improves crop yields.
```

- Keep it under 200 characters
- Describe what the mod does, not how
- Mention key features

### poster

Thumbnail image for the mod list and Steam Workshop.

```
poster=poster.png
```

- Place the image in your mod's root folder (next to mod.info)
- Recommended size: 256x256 pixels
- Format: PNG
- Shows in the mod selection screen

### require

List mods that must be loaded before yours.

```
require=AnotherMod,ThirdMod
```

**Example - Requiring a framework mod:**
```
name=My Weapon Pack
id=MyWeaponPack
require=Arsenal(26)GunFighter
```

- Comma-separated list of mod IDs
- PZ will load required mods first
- If a required mod is missing, yours won't load
- Use this when your mod extends another mod

### modversion

Your mod's version number.

```
modversion=1.0.0
```

- Use semantic versioning: MAJOR.MINOR.PATCH
- Helps users know if they have the latest version
- Update when you release changes

### pzversion

Minimum required Project Zomboid version.

```
pzversion=41.78
```

- Prevents loading on incompatible game versions
- Check your PZ version in the main menu

## Real-World Examples

### Simple Item Mod
```
name=Camping Gear
id=CampingGear
description=Adds tents, sleeping bags, and campfire cooking.
poster=poster.png
modversion=1.2.0
```

### Mod with Dependencies
```
name=Arsenal Extended Ammo
id=ArsenalExtendedAmmo
description=Adds new ammunition types for Arsenal(26) weapons.
require=Arsenal(26)GunFighter
poster=poster.png
modversion=2.0.0
pzversion=41.78
```

### Complex Overhaul Mod
```
name=Survival Rebalanced
id=SurvivalRebalanced
description=Complete overhaul of survival mechanics including hunger, thirst, and fatigue systems.
url=https://github.com/author/survival-rebalanced
poster=poster.png
modversion=3.1.0
pzversion=41.78
```

## Creating Your mod.info

### Step 1: Create the File

1. Open your mod folder
2. Right-click > New > Text Document
3. Name it exactly `mod.info`
   - If you see `mod.info.txt`, you need to show file extensions
   - In File Explorer: View > Show > File name extensions
   - Then rename to remove `.txt`

### Step 2: Add Content

Open in VS Code and add:

```
name=Your Mod Name Here
id=YourModNameHere
description=What your mod does in one sentence.
```

### Step 3: Save

Save the file (Ctrl+S). No need to restart PZ if it's not running.

## Common Mistakes

### Spaces in ID
```
❌ id=My Mod
✓ id=MyMod
```

### Missing Equals Sign
```
❌ name My Mod
✓ name=My Mod
```

### Wrong File Extension
```
❌ mod.info.txt
✓ mod.info
```

### Quotes Around Values
```
❌ name="My Mod"
✓ name=My Mod
```

(mod.info doesn't use quotes)

## Verifying Your mod.info

1. Launch Project Zomboid
2. Go to Mods menu
3. Find your mod in the list
4. Check that name and description appear correctly
5. Enable the mod and start a game

If your mod doesn't appear:
- Check the file is named exactly `mod.info`
- Verify it's in the mod's root folder
- Make sure `name` and `id` fields exist

## Key Takeaways

1. **`name` and `id` are required** - everything else is optional
2. **`id` must be unique** - no spaces, alphanumeric only
3. **No quotes around values** - just `name=Your Name`
4. **File must be named `mod.info`** - not mod.info.txt
5. **Use `require` for dependencies** - loads order matters 
