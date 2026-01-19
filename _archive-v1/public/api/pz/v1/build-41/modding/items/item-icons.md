---
id: item-icons
slug: item-icons
title: Creating Item Icons
excerpt: Every item needs an icon. You can use vanilla icons to start, but custom items deserve custom icons. This guide covers icon requirements, creation, and implementation. | Property | Requirement |...
game: pz
version: build-41
section: modding
category: items
subcategory: null
difficulty: beginner
tags:
  - beginner
  - item
  - icons
  - textures
  - learning-path
  - graphics
last_updated: 2026-01-09
---
# Creating Item Icons

## Overview

Every item needs an icon. You can use vanilla icons to start, but custom items deserve custom icons. This guide covers icon requirements, creation, and implementation.

## Icon Requirements

### Technical Specs

| Property | Requirement |
|----------|------------|
| **Format** | PNG with transparency |
| **Size** | 32x32 pixels (standard) |
| **Color depth** | 32-bit (RGBA) |
| **Background** | Transparent |

### File Location

Icons go in:
```
YourMod/
└── media/
    └── textures/
        └── Item/
            └── YourIcon.png
```

**Important:** The `Item` folder must have capital `I`.

## Using Vanilla Icons

### Quick Start: Borrow Vanilla Icons

Until you create custom icons, use existing ones:

```
item MyWeapon {
    Type = Weapon,
    DisplayName = Custom Sword,
    Icon = Katana,          <- Vanilla icon name
    Weight = 2.0,
}
```

### Common Vanilla Icons

| Icon Name | Item Type |
|-----------|----------|
| `Axe` | Tools |
| `Hammer` | Tools |
| `Apple` | Food |
| `Chocolate` | Snacks |
| `Katana` | Bladed weapons |
| `BaseballBat` | Blunt weapons |
| `WaterBottleFull` | Containers |
| `Pills` | Medicine |
| `Screwdriver` | Tools |
| `DuctTape` | Materials |

### Finding Vanilla Icons

Vanilla icons are at:
```
Steam\steamapps\common\ProjectZomboid\media\textures\Item\
```

Browse to see all available icons.

## Creating Custom Icons

### Method 1: Edit Vanilla Icons

The fastest approach:

1. Find a similar vanilla icon
2. Copy it to your mod's textures folder
3. Rename it
4. Edit colors/details

### Method 2: Create From Scratch

#### Tools (Free Options)

| Tool | Platform | Best For |
|------|----------|----------|
| **GIMP** | All | Full-featured editing |
| **Aseprite** | All | Pixel art (paid but excellent) |
| **Piskel** | Web/All | Simple pixel art |
| **Paint.NET** | Windows | Easy editing |
| **Photoshop** | All | Professional (paid) |

#### Basic Creation Steps

1. **Create 32x32 canvas** with transparent background
2. **Draw your icon** - Keep it simple and recognizable
3. **Match PZ style** - Look at vanilla for reference
4. **Save as PNG** - Ensure transparency is preserved

### Method 3: AI Image Generation

AI can help create icons:

1. Generate a concept image
2. Scale down to 32x32
3. Clean up and add transparency
4. Match PZ's visual style

## Implementing Your Icon

### Step 1: Create Folder Structure

```
MyMod/
└── media/
    └── textures/
        └── Item/
            └── EnergyBar.png    <- Your icon
```

### Step 2: Reference in Script

```
item EnergyBar {
    Type = Food,
    DisplayName = Energy Bar,
    Icon = EnergyBar,      <- Matches filename without .png
    Weight = 0.1,
}
```

### Step 3: Test In-Game

1. Enable mod
2. Start game
3. Spawn item
4. Check inventory icon

## Icon Best Practices

### Do

- **Keep it simple** - 32x32 is tiny
- **Use clear silhouettes** - Recognizable at a glance
- **Match vanilla style** - Consistent with base game
- **Use transparency** - No solid backgrounds
- **Test at actual size** - Looks different zoomed out

### Don't

- **Add too much detail** - Gets lost at small size
- **Use tiny text** - Unreadable
- **Make it too dark** - Hard to see
- **Ignore transparency** - White boxes look bad

## Color Palette Tips

### Match PZ's Style

PZ icons use:
- Muted, slightly desaturated colors
- Soft shadows (not harsh black)
- Consistent lighting (top-left source)
- Simple highlights

### Quick Color Reference

| Item Type | Color Tendency |
|-----------|---------------|
| Weapons | Grays, browns, metallics |
| Food | Warm colors, naturals |
| Medicine | White, red, blue |
| Tools | Gray, yellow, brown |
| Materials | Browns, grays, muted |

## Multiple Icon Variations

Some items need multiple icons:

### Different States

```
media/textures/Item/
├── WaterBottleFull.png    <- Full bottle
├── WaterBottleHalf.png    <- Half full
└── WaterBottleEmpty.png   <- Empty bottle
```

### Icon Rotation (Optional)

For ground items, you might create rotated versions.

## Troubleshooting

### Icon Not Showing

1. **Check folder path** - Must be `media/textures/Item/`
2. **Check capitalization** - `Item` not `item`
3. **Check filename** - Must match `Icon = ` property exactly
4. **Check file format** - Must be `.png`

### Icon Has White Background

- Transparency not saved properly
- Re-export as 32-bit PNG with alpha channel
- In GIMP: Export > PNG > Save background color

### Icon Looks Wrong

- Check image is 32x32 pixels
- Ensure scaling used nearest-neighbor (for pixel art)
- Verify colors aren't too dark or too bright

### Icon Works in Menu But Not Inventory

- Some UI elements use different icon references
- Check `WorldStaticModel` for world representation

## Quick Reference

### Folder Structure

```
MyMod/
└── media/
    └── textures/
        └── Item/             <- Capital I!
            └── MyIcon.png    <- Your icons
```

### Script Reference

```
item MyItem {
    Icon = MyIcon,    <- No .png, no path
}
```

### Icon Specs

- Size: 32x32 pixels
- Format: PNG
- Background: Transparent
- Color: 32-bit RGBA

## Key Takeaways

1. **Start with vanilla icons** - Faster to prototype
2. **Icons go in `media/textures/Item/`** - Capital I
3. **32x32 PNG with transparency** - Standard format
4. **Filename matches Icon property** - No extension in script
5. **Keep it simple** - Detail gets lost at small sizes 