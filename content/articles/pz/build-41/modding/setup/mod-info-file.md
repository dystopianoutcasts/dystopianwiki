---
id: setup-mod-info-file
slug: mod-info-file
title: "The mod.info File"
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
excerpt: "Learn how to create and configure the mod.info file that tells Project Zomboid about your mod's name, ID, dependencies, and metadata."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "File Location"
    link: "#file-location"
  - text: "Basic mod.info"
    link: "#basic-mod-info"
  - text: "Recommended mod.info"
    link: "#recommended-mod-info"
  - text: "Complete mod.info Reference"
    link: "#complete-mod-info-reference"
  - text: "Field Details"
    link: "#field-details"
  - text: "Real-World Examples"
    link: "#real-world-examples"
  - text: "Creating Your mod.info"
    link: "#creating-your-mod-info"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Verifying Your mod.info"
    link: "#verifying-your-mod-info"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Debug Mode"
    path: /build-41/modding/setup/debug-mode
  - title: "Your First Recipe"
    path: /build-41/modding/recipes/first-recipe-file
last_updated: 2026-01-09
---

# The mod.info File

## What Is the mod.info File?

You know when you create a perfect mod with recipes and items, place it in the mods folder, launch Project Zomboid, and... your mod doesn't appear in the mod list? You check the folder - it's there. You check the files - they're all correct. But the game acts like your mod doesn't exist.

**The problem is almost always a missing or broken mod.info file.** This tiny text file is how Project Zomboid discovers mods. Without it, your mod folder could contain a thousand perfect scripts and the game would never see them. The mod.info file is like a front door - if it's missing or broken, nothing inside the folder matters because the game can't get in.

I remember spending an entire evening writing my first mod. I created the folder structure perfectly. I wrote beautiful item scripts. I even made custom icons. I launched the game excited to test it... and my mod wasn't in the list. I restarted the game five times. I checked the folder path. I verified the scripts. After an hour of confusion, I realized: I had forgotten to create the mod.info file. One missing 3-line text file made my entire mod invisible.

**This guide will show you exactly what the mod.info file is, what fields it needs, how to create it correctly, and how to avoid the common mistakes that make mods disappear.** By the end, you'll be able to create a working mod.info file in 60 seconds, and you'll understand every field and why it matters.

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
name=My First Mod       # Display name shown in the mod menu
id=MyFirstMod           # Unique identifier (no spaces allowed)
```

**That's it! Two lines and your mod will load.** These are the only required fields. If you have these two lines in a file named `mod.info` in your mod's root folder, Project Zomboid will recognize your mod.

But let's add more useful information.

## Recommended mod.info

```
name=My First Mod                                          # Display name (shown in mod list)
id=MyFirstMod                                              # Unique ID (no spaces, used internally)
description=A beginner mod that adds useful recipes and items.  # Short description
url=https://github.com/yourname/myfirstmod                # Optional: link to your mod page
poster=poster.png                                          # Optional: thumbnail image (256x256)
```

**This is what most mods should include.** It gives users all the information they need to understand what your mod does and how to learn more about it.

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
name=Camping Gear                                          # Human-readable name
id=CampingGear                                             # Unique ID (no spaces)
description=Adds tents, sleeping bags, and campfire cooking.  # What the mod adds
poster=poster.png                                          # Custom thumbnail
modversion=1.2.0                                           # Mod version number
```

**What this mod does:** Adds new items (tents, sleeping bags, cooking equipment). Simple standalone mod with no dependencies.

---

### Mod with Dependencies
```
name=Arsenal Extended Ammo                                 # Display name
id=ArsenalExtendedAmmo                                     # Unique ID
description=Adds new ammunition types for Arsenal(26) weapons.  # Clear description
require=Arsenal(26)GunFighter                              # Requires Arsenal mod to work
poster=poster.png                                          # Thumbnail image
modversion=2.0.0                                           # This mod's version
pzversion=41.78                                            # Minimum PZ version required
```

**What this mod does:** Extends another mod (Arsenal) by adding compatible ammunition. Uses `require=` to ensure Arsenal loads first. Won't load if Arsenal isn't installed.

---

### Complex Overhaul Mod
```
name=Survival Rebalanced                                   # Descriptive name
id=SurvivalRebalanced                                      # Unique ID
description=Complete overhaul of survival mechanics including hunger, thirst, and fatigue systems.  # Detailed description
url=https://github.com/author/survival-rebalanced         # Link to documentation/repo
poster=poster.png                                          # Custom thumbnail
modversion=3.1.0                                           # Current version
pzversion=41.78                                            # Requires specific PZ version
```

**What this mod does:** Major gameplay overhaul affecting core systems. Includes URL for documentation and support. Specifies PZ version to prevent compatibility issues.

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

### 1. Spaces in ID Field

❌ **Wrong:**
```
name=My Awesome Mod
id=My Awesome Mod        # SPACES IN ID - MOD WON'T LOAD PROPERLY
description=A cool mod
```

✅ **Right:**
```
name=My Awesome Mod      # Display name can have spaces
id=MyAwesomeMod          # ID must be one word, no spaces
description=A cool mod
```

**Why:** The `id` field is used internally by the game engine and by other mods to reference yours. Spaces break this system. The `name` field can have spaces (it's just for display), but `id` cannot.

**Error symptom:** Mod loads but other mods can't find it as a dependency, or load order issues occur.

---

### 2. Wrong File Extension (mod.info.txt)

❌ **Wrong:**
```
YourMod/
├── mod.info.txt        # File Explorer is hiding the .txt extension!
└── media/
```

✅ **Right:**
```
YourMod/
├── mod.info            # No extension - just "mod.info"
└── media/
```

**Why:** Windows hides file extensions by default. When you create "New Text Document" and rename it to `mod.info`, it's actually named `mod.info.txt`. The game looks for exactly `mod.info`, not `mod.info.txt`.

**How to fix:**
1. File Explorer → View tab → Check "File name extensions"
2. Find your `mod.info.txt` file
3. Right-click → Rename → Remove the `.txt`
4. Confirm you want to change the extension

**Error symptom:** Mod doesn't appear in mod list at all. Game can't see the mod folder.

---

### 3. Missing Equals Signs

❌ **Wrong:**
```
name My First Mod       # Missing = between key and value
id MyFirstMod
description A test mod
```

✅ **Right:**
```
name=My First Mod       # Key=Value format (no spaces around =)
id=MyFirstMod
description=A test mod
```

**Why:** The mod.info file uses `key=value` format. Each line must have the field name, an equals sign (no spaces around it), and the value. Missing the `=` makes the line unreadable to the game.

**Error symptom:** Mod appears in list but shows "(unnamed)" or missing description. The game skips any malformed lines.

---

### 4. Adding Unnecessary Quotes

❌ **Wrong:**
```
name="My Mod Name"      # Quotes aren't needed and will be included in the name!
id="MyModID"
description="This is my mod"
```

✅ **Right:**
```
name=My Mod Name        # No quotes - just the text directly
id=MyModID
description=This is my mod
```

**Why:** The mod.info format doesn't use quotes like JSON or other config formats. If you add quotes, they become part of the value. Your mod will literally appear as `"My Mod Name"` (with quotes) in the mod list.

**Error symptom:** Mod name and description appear with ugly quotation marks in the UI.

---

### 5. Using Hyphens or Special Characters in ID

❌ **Wrong:**
```
name=Better Weapons
id=better-weapons       # Hyphen not allowed
```

or

```
name=Cool Mod
id=my_cool_mod!         # Exclamation mark not allowed
```

✅ **Right:**
```
name=Better Weapons
id=BetterWeapons        # Letters and numbers only (underscores are OK)
```

or

```
name=Cool Mod
id=My_Cool_Mod          # Underscores are fine
```

**Why:** The `id` field should only contain:
- Letters (A-Z, a-z)
- Numbers (0-9)
- Underscores (_)

No hyphens, spaces, or special characters. Some characters can break the mod loading system or cause issues with the Steam Workshop.

**Safe ID examples:**
- `MyMod`
- `BetterFarming2024`
- `Weapon_Pack_Extended`

**Error symptom:** Mod may fail to load, or other mods can't declare it as a dependency.

## Try It Yourself

### Exercise 1: Create a Minimal mod.info

**Goal:** Create the absolute minimum mod.info file that makes a mod appear in the game.

**Steps:**
1. Navigate to `%UserProfile%\Zomboid\mods`
2. Create a folder: `TestModInfo`
3. Create a folder inside: `TestModInfo\media`
4. Create a file: `TestModInfo\mod.info`
5. Add only these two lines:
   ```
   name=Test Mod
   id=TestModInfo
   ```
6. Launch PZ and check the mod menu

<details>
<summary><strong>Solution</strong></summary>

**Complete file structure:**
```
TestModInfo/
├── mod.info            # The file you create
└── media/              # Empty folder (required for valid mod structure)
```

**mod.info contents:**
```
name=Test Mod
id=TestModInfo
```

**Verification:**
1. Launch Project Zomboid
2. Main menu → Mods
3. You should see "Test Mod" in the list
4. The checkmark may be greyed out (no content), but the mod appears

**What this proves:** You only need 2 lines (`name` and `id`) for the game to recognize a mod.
</details>

---

### Exercise 2: Fix a Broken mod.info

**Goal:** Find and fix the 4 errors in this mod.info file.

```
name="My Weapon Mod"
id My Weapon Mod
description=Adds 10 new weapons
poster poster.png
```

**Find 4 errors.**

<details>
<summary><strong>Solution</strong></summary>

**Error 1: Quotes around name**
```
❌ name="My Weapon Mod"
✅ name=My Weapon Mod
```

**Error 2: Missing equals sign for id**
```
❌ id My Weapon Mod
✅ id=MyWeaponMod
```

**Error 3: Spaces in id**
```
❌ id=My Weapon Mod
✅ id=MyWeaponMod
```

**Error 4: Missing equals sign for poster**
```
❌ poster poster.png
✅ poster=poster.png
```

**Corrected file:**
```
name=My Weapon Mod
id=MyWeaponMod
description=Adds 10 new weapons
poster=poster.png
```

**Key lessons:**
- No quotes around values
- Every line needs `=` between key and value
- ID cannot have spaces
</details>

---

### Exercise 3: Create a Complete mod.info with Dependencies

**Goal:** Write a complete mod.info for a mod that extends another mod.

**Scenario:** You're creating "Better Arsenal Scopes" that adds new weapon scopes for the "Arsenal(26)GunFighter" mod.

**Requirements:**
- Mod name: Better Arsenal Scopes
- ID: BetterArsenalScopes
- Version: 1.0.0
- Requires Arsenal(26)GunFighter
- Works on PZ 41.78+
- Include description and poster

<details>
<summary><strong>Solution</strong></summary>

**Complete mod.info:**
```
name=Better Arsenal Scopes
id=BetterArsenalScopes
description=Adds 15 new weapon scopes and sights for Arsenal(26) weapons.
require=Arsenal(26)GunFighter
poster=poster.png
modversion=1.0.0
pzversion=41.78
url=https://github.com/yourname/better-arsenal-scopes
```

**Field explanations:**
- `name` - Display name with spaces allowed
- `id` - CamelCase, no spaces
- `description` - Clear, mentions it's for Arsenal
- `require` - Exact ID of the Arsenal mod (including the (26) part!)
- `poster` - References poster.png in mod root folder
- `modversion` - Your mod's version
- `pzversion` - Minimum PZ version
- `url` - Optional but helpful for users

**Important:** The `require=Arsenal(26)GunFighter` must match the exact ID of the Arsenal mod, including parentheses and numbers. Check the other mod's mod.info to get the exact ID.

**What happens:**
- PZ will load Arsenal(26)GunFighter first
- Then load your mod second
- If Arsenal isn't installed, your mod won't load (and PZ will warn the user)
</details>

---

## Verifying Your mod.info

1. Launch Project Zomboid
2. Go to Mods menu
3. Find your mod in the list
4. Check that name and description appear correctly
5. Enable the mod and start a game

If your mod doesn't appear:
- Check the file is named exactly `mod.info` (not `mod.info.txt`)
- Verify it's in the mod's root folder (next to `media/`)
- Make sure `name` and `id` fields exist with `=` signs
- Check for quotes or special characters in the `id` field

## Best Practices

1. **Always show file extensions in Windows** - Before creating mod.info, enable "File name extensions" in File Explorer. This prevents the `mod.info.txt` mistake that makes mods invisible. (View tab → Show → File name extensions)

2. **Use descriptive, unique IDs** - Don't use generic IDs like `MyMod` or `Test`. Use something specific like `BetterFarmingTools` or `ZombieRebalance2024`. Prevents conflicts with other mods.

3. **Match your ID to your folder name** - If your folder is `BetterWeapons`, make your ID `BetterWeapons`. Makes debugging and organization easier. Not required, but highly recommended.

4. **Include a description even though it's optional** - Users need to know what your mod does before enabling it. A one-sentence description is enough: "Adds 15 new farming tools and improves crop yields."

5. **Use semantic versioning for modversion** - Format: MAJOR.MINOR.PATCH (e.g., `1.0.0`, `2.3.1`). Increment MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes. Helps users track updates.

6. **Specify pzversion for major mods** - If your mod uses features specific to a PZ version, set `pzversion=41.78`. Prevents users on older PZ versions from loading an incompatible mod and encountering errors.

7. **Create a template mod.info** - Keep a `_template_mod.info` file with all common fields filled out. Copy and customize it for new mods. Saves time and prevents syntax errors.

---

## Key Takeaways

1. **`name` and `id` are required, everything else optional** - Minimum: 2 lines make your mod visible to the game
2. **File must be exactly `mod.info` with no extension** - Not `mod.info.txt`. Enable file extensions in Windows to verify
3. **`id` rules: no spaces, no special characters** - Use letters, numbers, and underscores only. `MyMod` or `My_Mod` are good. `My-Mod` or `My Mod` are bad
4. **Never use quotes around values** - Write `name=My Mod`, not `name="My Mod"`. Quotes become part of the value
5. **Format is `key=value` with equals sign** - Each line needs `=` between field name and value, no spaces around the `=`
6. **Use `require=OtherModID` for dependencies** - Forces load order. Your mod won't load if the required mod is missing
7. **`modversion` tracks your mod's version** - Use semantic versioning (1.0.0, 1.1.0, 2.0.0). Update when releasing changes
8. **Place mod.info in mod root folder, next to media/** - Not inside media/. Structure: `YourMod/mod.info` and `YourMod/media/`
