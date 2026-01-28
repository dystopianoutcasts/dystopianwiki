---
id: vanilla-clothing-reference
slug: vanilla-clothing-reference
title: "Vanilla Clothing Reference"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - clothing
  - vanilla
  - items
  - protection
excerpt: "Complete reference for all 776 vanilla clothing items with protection values and body locations."
related_articles:
  - item-anatomy
last_updated: 2026-01-18
---

# Vanilla Clothing Reference

## Introduction

You're creating a leather jacket mod and need to know what bite defense vanilla jackets have. Or you're making riot gear and want to match the protection of existing gear. Or maybe you just want your custom clothing to feel balanced alongside the game's 776 existing clothing items.

If you're feeling overwhelmed by the sheer number of clothing items in Project Zomboid, you're not alone. There are 776 different clothing items spread across 60+ body locations, each with different insulation, protection, and fabric properties. Figuring out what's "normal" for a jacket or what properties a shirt should have can feel impossible.

Here's the good news: this reference organizes all vanilla clothing by body location, so you can quickly find similar items to yours and see what properties they use. I'll show you exactly how to use this reference to make balanced, realistic clothing mods.

## What You're Actually Doing

When you're modding clothing, you're typically:

1. **Finding similar vanilla items** - "I'm making a tactical vest, what do other vests have?"
2. **Checking protection values** - "What bite defense should my leather jacket have?"
3. **Balancing insulation** - "Is 0.8 insulation too warm for a t-shirt?"
4. **Matching fabric types** - "What fabric type do denim jeans use?"

This reference lets you quickly look up any vanilla item and see its exact properties, so you can make informed decisions about your mod's balance.

## How to Use This Reference

### Step 1: Find Similar Items

1. Look at the **Quick Navigation** section below
2. Find the body location that matches your item (e.g., if making a jacket, look for "Jacket")
3. Click the link to jump to that section's table

### Step 2: Compare Properties

4. Scan the table for items similar to yours
5. Note their Insulation, Wind Resistance, Bite Defense, and Scratch Defense values
6. Look for patterns (e.g., "Most leather jackets have 20 bite defense, 40 scratch defense")

### Step 3: Make Informed Decisions

7. Use the vanilla values as a baseline for your mod
8. Adjust up or down based on your item's intended power level
9. Example: "Vanilla leather jackets have 20/40 defense, so my reinforced jacket should be 25/45"

---

## Clothing Properties

| Property | Description | What It Means |
|----------|-------------|---------------|
| `BodyLocation` | Where the item is worn | Determines which clothing slot it occupies (Jacket, Pants, Hat, etc.) |
| `Insulation` | Cold protection (higher = warmer) | Values typically 0.10-1.0. Padded jackets ~1.0, T-shirts ~0.2 |
| `WindResistance` | Wind protection | Values typically 0.05-1.0. Windbreakers ~1.0, thin shirts ~0.05 |
| `BiteDefense` | Protection against zombie bites | Usually 0, 10, 20, 30, 50, or 100. Helmets/boots often 100, leather ~20-40 |
| `ScratchDefense` | Protection against scratches | Usually 0, 5, 10, 15, 20, 30, 40, or 100. Always ≥ bite defense |
| `FabricType` | Material type (Cotton, Denim, Leather, etc.) | Affects stain behavior and item feel. Most common: Cotton, Denim, Leather |
| `BloodLocation` | Where blood splatters appear | Visual detail for how blood shows on clothing |

> **Understanding Defense Values:** `-` in the table means 0 defense (no protection). `100` means full protection (zombies can't damage this body part through this clothing). Most clothing has low or no defense - protection is rare!

## Body Locations

PZ uses a layered clothing system. Common body locations:

| Location | Description |
|----------|-------------|
| `Shirt` | Long-sleeve shirts |
| `ShortSleeveShirt` | T-shirts, tanks |
| `Sweater` | Sweaters, hoodies |
| `Jacket` | Outer jackets, coats |
| `Pants` | Trousers, jeans |
| `Shoes` | Footwear |
| `Hat` | Head covering |
| `FullHat` | Full head coverage |
| `Hands` | Gloves |

## Quick Navigation

- [Hat](#hat) (83 items)
- [ZedDmg](#zeddmg) (77 items)
- [Wound](#wound) (60 items)
- [Pants](#pants) (48 items)
- [Tshirt](#tshirt) (44 items)
- [Unknown](#unknown) (41 items)
- [Bandage](#bandage) (34 items)
- [Shirt](#shirt) (21 items)
- [UnderwearBottom](#underwearbottom) (18 items)
- [Ears](#ears) (17 items)
- [Jacket](#jacket) (17 items)
- [Shoes](#shoes) (17 items)
- [UnderwearTop](#underweartop) (17 items)
- [BellyButton](#bellybutton) (15 items)
- [Dress](#dress) (13 items)
- [ShortSleeveShirt](#shortsleeveshirt) (13 items)
- [LeftWrist](#leftwrist) (12 items)
- [RightWrist](#rightwrist) (12 items)
- [Necklace](#necklace) (11 items)
- [TorsoExtra](#torsoextra) (11 items)
- [Neck](#neck) (10 items)
- [Eyes](#eyes) (9 items)
- [TorsoExtraVest](#torsoextravest) (9 items)
- [Underwear](#underwear) (9 items)
- [FullHat](#fullhat) (8 items)
- [Hands](#hands) (8 items)
- [MakeUp_FullFace](#makeup_fullface) (8 items)
- [UnderwearExtra1](#underwearextra1) (8 items)
- [Jacket_Bulky](#jacket_bulky) (7 items)
- [MakeUp_Eyes](#makeup_eyes) (7 items)
- [MakeUp_EyesShadow](#makeup_eyesshadow) (7 items)
- [Mask](#mask) (7 items)
- [Necklace_Long](#necklace_long) (7 items)
- [Sweater](#sweater) (7 items)
- [Boilersuit](#boilersuit) (6 items)
- [MakeUp_Lips](#makeup_lips) (6 items)
- [Left_MiddleFinger](#left_middlefinger) (5 items)
- [Left_RingFinger](#left_ringfinger) (5 items)
- [Right_MiddleFinger](#right_middlefinger) (5 items)
- [Right_RingFinger](#right_ringfinger) (5 items)
- [Skirt](#skirt) (5 items)
- [JacketSuit](#jacketsuit) (4 items)
- [Nose](#nose) (4 items)
- [Scarf](#scarf) (4 items)
- [AmmoStrap](#ammostrap) (2 items)
- [BeltExtra](#beltextra) (2 items)
- [EarTop](#eartop) (2 items)
- [FullSuit](#fullsuit) (2 items)
- [JacketHat](#jackethat) (2 items)
- [Jacket_Down](#jacket_down) (2 items)
- [MaskEyes](#maskeyes) (2 items)
- [Socks](#socks) (2 items)
- [Tail](#tail) (2 items)
- [TankTop](#tanktop) (2 items)
- [BathRobe](#bathrobe) (1 items)
- [Belt](#belt) (1 items)
- [FannyPackBack](#fannypackback) (1 items)
- [FannyPackFront](#fannypackfront) (1 items)
- [FullSuitHead](#fullsuithead) (1 items)
- [FullTop](#fulltop) (1 items)
- [JacketHat_Bulky](#jackethat_bulky) (1 items)
- [LeftEye](#lefteye) (1 items)
- [Legs1](#legs1) (1 items)
- [MaskFull](#maskfull) (1 items)
- [RightEye](#righteye) (1 items)
- [SweaterHat](#sweaterhat) (1 items)
- [Torso1Legs1](#torso1legs1) (1 items)
- [UnderwearExtra2](#underwearextra2) (1 items)
- [UnderwearInner](#underwearinner) (1 items)

## Hat

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Antlers Boppers | - | - | - | - | - |
| Army Baseball Cap | 0.10 | - | - | - | - |
| Army Baseball Cap | 0.10 | - | - | - | - |
| Army Beret | 0.3 | - | - | - | - |
| Bandana (Head) | 0.10 | - | - | - | - |
| Bandana (Head) | 0.10 | - | - | - | - |
| Bandana (Tied) | 0.10 | - | - | - | - |
| Bandana (Tied) | 0.10 | - | - | - | - |
| Baseball Cap | 0.10 | - | - | - | - |
| Baseball Cap | 0.10 | - | - | - | - |
| Baseball Cap | 0.10 | - | - | - | - |
| Baseball Cap | 0.10 | - | - | - | - |
| Baseball Cap | 0.10 | - | - | - | - |
| Baseball Cap | 0.10 | - | - | - | - |
| Baseball Cap | 0.10 | - | - | - | - |
| Baseball Cap | 0.10 | - | - | - | - |
| Beanie Hat | 0.6 | 0.3 | - | - | - |
| Beret | 0.3 | - | - | - | - |
| Bicycle Helmet | 0.25 | 0.15 | - | - | - |
| Black Band Fedora | 0.15 | 0.1 | - | - | - |
| Bonnie Hat | 0.5 | 0.3 | - | - | - |
| Bonnie Hat | 0.5 | 0.3 | - | - | - |
| Bucket Hat | 0.5 | 0.3 | - | - | - |
| Bunny Ears | - | - | - | - | - |
| Bunny Ears | - | - | - | - | - |
| Chef Hat | - | - | - | - | - |
| Coloured Party Hat | 0.10 | - | - | - | - |
| Cowboy Hat | 0.3 | 0.2 | - | - | - |
| Crash Helmet | 0.8 | 0.8 | 100 | 100 | - |
| Ear Muffs | 0.4 | 0.4 | - | - | - |
| Ear Protectors | 0.35 | 0.35 | - | - | - |
| Fast Food Server Hat | - | - | - | - | - |
| Fedora | 0.15 | 0.1 | - | - | - |
| Firefighter Helmet | 0.65 | 0.55 | 100 | 100 | - |
| Furry Ears | - | - | - | - | - |
| GoldStar Boppers | - | - | - | - | - |
| Golf Cap | - | - | - | - | - |
| Green Santa Hat | 0.80 | 0.25 | - | - | - |
| Hard Hat | 0.15 | 0.25 | 100 | 100 | - |
| Hat Arrow | - | - | - | - | - |
| Hat Knife | - | - | - | - | - |
| Hockey Helmet | - | - | 100 | 100 | - |
| Ice Cream Server Hat | - | - | - | - | - |
| Jay Chicken Hat | - | - | - | - | - |
| Jockey Helmet - 1 | - | - | 100 | 100 | - |
| Jockey Helmet - 2 | - | - | 100 | 100 | - |
| Jockey Helmet - 3 | - | - | 100 | 100 | - |
| Jockey Helmet - 4 | - | - | 100 | 100 | - |
| Jockey Helmet - 5 | - | - | 100 | 100 | - |
| Jockey Helmet - 6 | - | - | 100 | 100 | - |
| *... and 33 more* | | | | | |

## ZedDmg

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| F_Hair_Stubble | - | - | - | - | - |
| M_Beard_Stubble | - | - | - | - | - |
| M_Hair_Stubble | - | - | - | - | - |
| ZedDmg_BACK_Slash | - | - | - | - | - |
| ZedDmg_BACK_Spine | - | - | - | - | - |
| ZedDmg_BELLY_Bullet | - | - | - | - | - |
| ZedDmg_BELLY_Shotgun | - | - | - | - | - |
| ZedDmg_BELLY_Skin | - | - | - | - | - |
| ZedDmg_BELLY_Slash | - | - | - | - | - |
| ZedDmg_BellySlashLeft | - | - | - | - | - |
| ZedDmg_BellySlashRight | - | - | - | - | - |
| ZedDmg_BulletBelly01 | - | - | - | - | - |
| ZedDmg_BulletBelly02 | - | - | - | - | - |
| ZedDmg_BulletBelly03 | - | - | - | - | - |
| ZedDmg_BulletChest01 | - | - | - | - | - |
| ZedDmg_BulletChest02 | - | - | - | - | - |
| ZedDmg_BulletChest03 | - | - | - | - | - |
| ZedDmg_BulletChest04 | - | - | - | - | - |
| ZedDmg_BulletFace01 | - | - | - | - | - |
| ZedDmg_BulletFace02 | - | - | - | - | - |
| ZedDmg_BulletForehead01 | - | - | - | - | - |
| ZedDmg_BulletForehead02 | - | - | - | - | - |
| ZedDmg_BulletForehead03 | - | - | - | - | - |
| ZedDmg_BulletLeftTemple | - | - | - | - | - |
| ZedDmg_BulletRightTemple | - | - | - | - | - |
| ZedDmg_CHEST_Bullet | - | - | - | - | - |
| ZedDmg_CHEST_Shotgun | - | - | - | - | - |
| ZedDmg_CHEST_Slash | - | - | - | - | - |
| ZedDmg_ChestSlashLeft | - | - | - | - | - |
| ZedDmg_FaceSkullLeft | - | - | - | - | - |
| ZedDmg_FaceSkullRight | - | - | - | - | - |
| ZedDmg_HEAD_Bullet | - | - | - | - | - |
| ZedDmg_HEAD_Shotgun | - | - | - | - | - |
| ZedDmg_HEAD_Skin | - | - | - | - | - |
| ZedDmg_HEAD_Slash | - | - | - | - | - |
| ZedDmg_HeadSlashCentre01 | - | - | - | - | - |
| ZedDmg_HeadSlashCentre02 | - | - | - | - | - |
| ZedDmg_HeadSlashCentre03 | - | - | - | - | - |
| ZedDmg_HeadSlashLeft01 | - | - | - | - | - |
| ZedDmg_HeadSlashLeft02 | - | - | - | - | - |
| ZedDmg_HeadSlashLeft03 | - | - | - | - | - |
| ZedDmg_HeadSlashLeftBack01 | - | - | - | - | - |
| ZedDmg_HeadSlashLeftBack02 | - | - | - | - | - |
| ZedDmg_HeadSlashRight01 | - | - | - | - | - |
| ZedDmg_HeadSlashRight02 | - | - | - | - | - |
| ZedDmg_HeadSlashRight03 | - | - | - | - | - |
| ZedDmg_HeadSlashRightBack01 | - | - | - | - | - |
| ZedDmg_HeadSlashRightBack02 | - | - | - | - | - |
| ZedDmg_Mouth01 | - | - | - | - | - |
| ZedDmg_Mouth02 | - | - | - | - | - |
| *... and 27 more* | | | | | |

## Wound

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Wound_Abdomen_Bite_Female | - | - | - | - | - |
| Wound_Abdomen_Bite_Male | - | - | - | - | - |
| Wound_Abdomen_Laceration_Female | - | - | - | - | - |
| Wound_Abdomen_Laceration_Male | - | - | - | - | - |
| Wound_Abdomen_Scratch_Female | - | - | - | - | - |
| Wound_Abdomen_Scratch_Male | - | - | - | - | - |
| Wound_Chest_Bite_Female | - | - | - | - | - |
| Wound_Chest_Bite_Male | - | - | - | - | - |
| Wound_Chest_Laceration_Female | - | - | - | - | - |
| Wound_Chest_Laceration_Male | - | - | - | - | - |
| Wound_Chest_Scratch_Female | - | - | - | - | - |
| Wound_Chest_Scratch_Male | - | - | - | - | - |
| Wound_Groin_Bite_Female | - | - | - | - | - |
| Wound_Groin_Bite_Male | - | - | - | - | - |
| Wound_Groin_Laceration_Female | - | - | - | - | - |
| Wound_Groin_Laceration_Male | - | - | - | - | - |
| Wound_Groin_Scratch_Female | - | - | - | - | - |
| Wound_Groin_Scratch_Male | - | - | - | - | - |
| Wound_LForearm_Bite_Female | - | - | - | - | - |
| Wound_LForearm_Bite_Male | - | - | - | - | - |
| Wound_LForearm_Laceration_Female | - | - | - | - | - |
| Wound_LForearm_Laceration_Male | - | - | - | - | - |
| Wound_LForearm_Scratch_Female | - | - | - | - | - |
| Wound_LForearm_Scratch_Male | - | - | - | - | - |
| Wound_LHand_Bite_Female | - | - | - | - | - |
| Wound_LHand_Bite_Male | - | - | - | - | - |
| Wound_LHand_Laceration_Female | - | - | - | - | - |
| Wound_LHand_Laceration_Male | - | - | - | - | - |
| Wound_LHand_Scratch_Female | - | - | - | - | - |
| Wound_LHand_Scratch_Male | - | - | - | - | - |
| Wound_LUArm_Bite_Female | - | - | - | - | - |
| Wound_LUArm_Bite_Male | - | - | - | - | - |
| Wound_LUArm_Laceration_Female | - | - | - | - | - |
| Wound_LUArm_Laceration_Male | - | - | - | - | - |
| Wound_LUArm_Scratch_Female | - | - | - | - | - |
| Wound_LUArm_Scratch_Male | - | - | - | - | - |
| Wound_Neck_Bite_Female | - | - | - | - | - |
| Wound_Neck_Bite_Male | - | - | - | - | - |
| Wound_Neck_Laceration_Female | - | - | - | - | - |
| Wound_Neck_Laceration_Male | - | - | - | - | - |
| Wound_Neck_Scratch_Female | - | - | - | - | - |
| Wound_Neck_Scratch_Male | - | - | - | - | - |
| Wound_RForearm_Bite_Female | - | - | - | - | - |
| Wound_RForearm_Bite_Male | - | - | - | - | - |
| Wound_RForearm_Laceration_Female | - | - | - | - | - |
| Wound_RForearm_Laceration_Male | - | - | - | - | - |
| Wound_RForearm_Scratch_Female | - | - | - | - | - |
| Wound_RForearm_Scratch_Male | - | - | - | - | - |
| Wound_RHand_Bite_Female | - | - | - | - | - |
| Wound_RHand_Bite_Male | - | - | - | - | - |
| *... and 10 more* | | | | | |

## Pants

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Army Pants | 0.7 | 0.45 | - | 10 | Cotton |
| Baggy Jeans | 0.60 | 0.65 | 10 | 20 | Denim |
| Black Leather Trousers | 0.65 | 0.60 | 20 | 40 | Leather |
| Black Trousers | 0.5 | 0.5 | - | 10 | Cotton |
| Boxing Shorts | 0.10 | 0.1 | - | - | - |
| Boxing Shorts | 0.10 | 0.1 | - | - | - |
| Chef Pants | 0.4 | 0.1 | - | - | Cotton |
| Denim Jeans | 0.65 | 0.60 | 10 | 20 | Denim |
| Denim Shorts | 0.30 | 0.15 | 10 | 20 | Denim |
| Firefighter Pants | 0.85 | 0.85 | 20 | 30 | - |
| Ghillie Suit Pants | 0.70 | 0.65 | 10 | 20 | - |
| Green Santa Suit Pants | 0.9 | 0.6 | - | 10 | Cotton |
| Jeans | 0.7 | 0.55 | 10 | 20 | Denim |
| Long Denim Shorts | 0.45 | 0.45 | 10 | 20 | Denim |
| Long Sport Shorts | 0.25 | 0.1 | - | - | Cotton |
| Long Sport Shorts | 0.25 | 0.1 | - | - | Cotton |
| Medical Pants | 0.2 | 0.1 | - | - | Cotton |
| Military Camo Pants | 0.45 | 0.3 | 10 | 20 | Cotton |
| Military Camo Shorts | 0.5 | 0.3 | - | - | Cotton |
| Military Camo Shorts | 0.5 | 0.3 | - | - | Cotton |
| Military Desert Camo Pants | 0.3 | 0.1 | 10 | 20 | Cotton |
| Military Urban Camo Pants | 0.60 | 0.30 | 10 | 20 | Cotton |
| Navy Blue Trousers | 0.35 | 0.5 | - | 10 | Cotton |
| Overalls | 0.65 | 0.5 | 10 | 20 | Denim |
| Padded Pants | 1.0 | 1.0 | 10 | 20 | - |
| Pants | 0.50 | 0.40 | - | - | Cotton |
| Pants | 0.5 | 0.25 | - | - | Cotton |
| Pants | 0.5 | 0.25 | - | - | Cotton |
| Pants | 0.5 | 0.25 | - | - | Cotton |
| Pants | 0.55 | 0.3 | - | 10 | Cotton |
| Pants | 0.55 | 0.3 | - | 10 | Cotton |
| Police Deputy Pants | 0.55 | 0.4 | - | 10 | Cotton |
| Police Trooper Pants | 0.6 | 0.3 | - | - | Cotton |
| Prison Guard Pants | 0.5 | 0.5 | - | 10 | Cotton |
| Ranger Pants | 0.75 | 0.75 | - | 10 | Cotton |
| Santa Suit Pants | 0.9 | 0.6 | - | 10 | Cotton |
| Shell Suit Trousers | 0.30 | 0.4 | - | 5 | - |
| Shell Suit Trousers | 0.30 | 0.4 | - | 5 | - |
| Shell Suit Trousers | 0.30 | 0.4 | - | 5 | - |
| Shell Suit Trousers | 0.30 | 0.4 | - | 5 | - |
| Shell Suit Trousers | 0.30 | 0.4 | - | 5 | - |
| Shell Suit Trousers | 0.30 | 0.4 | - | 5 | - |
| Shorts | 0.15 | 0.10 | - | - | Cotton |
| Skinny Leather Trousers | 0.65 | 0.60 | 20 | 40 | Leather |
| Sport Shorts | 0.15 | 0.05 | - | - | Cotton |
| Suit Pants | 0.4 | 0.2 | - | 10 | Cotton |
| Suit Pants | 0.4 | 0.3 | - | 10 | Cotton |
| Suit Pants | 0.4 | 0.45 | - | 10 | Cotton |

## Tshirt

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Bandeau | - | - | - | - | Cotton |
| Blue Fireman T-Shirt | 0.5 | 0.30 | - | - | Cotton |
| Blue Police T-Shirt | 0.20 | 0.15 | - | - | Cotton |
| Brown Ranger T-Shirt | 0.30 | 0.20 | - | - | Cotton |
| Crop Top | - | - | - | - | Cotton |
| Crop Top Arms | - | - | - | - | Cotton |
| Dark Red Fireman T-Shirt | 0.5 | 0.30 | - | - | Cotton |
| Fossoil T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| Gas2Go T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| Green Ranger T-Shirt | 0.30 | 0.20 | - | - | Cotton |
| Green Veteran T-Shirt | 0.30 | 0.20 | - | - | Cotton |
| Long Sleeve T-Shirt | 0.3 | 0.15 | - | - | Cotton |
| Long Sleeve T-Shirt | 0.3 | 0.15 | - | - | Cotton |
| McCoys T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| Medical T-Shirt | 0.1 | 0.05 | - | - | Cotton |
| Military Desert Camo T-Shirt | 0.15 | 0.05 | - | - | Cotton |
| Military Green Camo T-Shirt | 0.25 | 0.2 | - | - | Cotton |
| Military T-Shirt | 0.4 | 0.35 | - | - | Cotton |
| Military Urban Camo T-Shirt | 0.3 | 0.25 | - | - | Cotton |
| PileOCrepe T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| Pizza Whirled T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| Police Deputy T-Shirt | 0.2 | 0.25 | - | - | Cotton |
| Police Trooper T-Shirt | 0.2 | 0.15 | - | - | Cotton |
| Ranger T-Shirt | 0.35 | 0.30 | - | - | Cotton |
| Red Fireman T-Shirt | 0.5 | 0.30 | - | - | Cotton |
| Red Veteran T-Shirt | 0.30 | 0.20 | - | - | Cotton |
| Rock T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| Small Bandeau | - | - | - | - | Cotton |
| Spiffo T-Shirt | 0.25 | 0.05 | - | - | Cotton |
| Spiffo T-Shirt | 0.3 | 0.15 | - | - | Cotton |
| Sport T-Shirt | 0.15 | 0.05 | - | - | Cotton |
| Striped T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| T-Shirt | 0.15 | 0.05 | - | - | Cotton |
| T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| TIS T-Shirt | 0.3 | 0.25 | - | - | Cotton |
| ThunderGas T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| Valley Station T-Shirt | 0.2 | 0.05 | - | - | Cotton |
| White Fireman T-Shirt | 0.5 | 0.30 | - | - | Cotton |
| White Police T-Shirt | 0.20 | 0.15 | - | - | Cotton |

## Unknown

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Backpack | - | - | - | - | - |
| Big Hiking Bag | - | - | - | - | - |
| Bowling Ball Bag | - | - | - | - | - |
| Briefcase | - | - | - | - | - |
| Cooler | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| Duffel Bag | - | - | - | - | - |
| First Aid Kit | - | - | - | - | - |
| Flight Case | - | - | - | - | - |
| Garbage Bag | - | - | - | - | - |
| Golf Bag | - | - | - | - | - |
| Guitar Case | - | - | - | - | - |
| Gun Case | - | - | - | - | - |
| Gun Case | - | - | - | - | - |
| Gun Case | - | - | - | - | - |
| Gun Case | - | - | - | - | - |
| Gun Case | - | - | - | - | - |
| Gun Case | - | - | - | - | - |
| Handbag | - | - | - | - | - |
| Hiking Bag | - | - | - | - | - |
| Large Backpack | - | - | - | - | - |
| Lunchbox | - | - | - | - | - |
| Lunchbox | - | - | - | - | - |
| Military Backpack | - | - | - | - | - |
| Plastic Bag | - | - | - | - | - |
| Purse | - | - | - | - | - |
| Sack | - | - | - | - | - |
| Satchel | - | - | - | - | - |
| School Bag | - | - | - | - | - |
| Suitcase | - | - | - | - | - |
| Toolbox | - | - | - | - | - |
| Toolbox | - | - | - | - | - |
| Tote Bag | - | - | - | - | - |

## Bandage

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Bandage_Abdomen | - | - | - | - | - |
| Bandage_Abdomen_Blood | - | - | - | - | - |
| Bandage_Chest | - | - | - | - | - |
| Bandage_Chest_Blood | - | - | - | - | - |
| Bandage_Groin | - | - | - | - | - |
| Bandage_Groin_Blood | - | - | - | - | - |
| Bandage_Head | - | - | - | - | - |
| Bandage_Head_Blood | - | - | - | - | - |
| Bandage_LeftFoot | - | - | - | - | - |
| Bandage_LeftFoot_Blood | - | - | - | - | - |
| Bandage_LeftHand | - | - | - | - | - |
| Bandage_LeftHand_Blood | - | - | - | - | - |
| Bandage_LeftLowerArm | - | - | - | - | - |
| Bandage_LeftLowerArm_Blood | - | - | - | - | - |
| Bandage_LeftLowerLeg | - | - | - | - | - |
| Bandage_LeftLowerLeg_Blood | - | - | - | - | - |
| Bandage_LeftUpperArm | - | - | - | - | - |
| Bandage_LeftUpperArm_Blood | - | - | - | - | - |
| Bandage_LeftUpperLeg | - | - | - | - | - |
| Bandage_LeftUpperLeg_Blood | - | - | - | - | - |
| Bandage_Neck | - | - | - | - | - |
| Bandage_Neck_Blood | - | - | - | - | - |
| Bandage_RightFoot | - | - | - | - | - |
| Bandage_RightFoot_Blood | - | - | - | - | - |
| Bandage_RightHand | - | - | - | - | - |
| Bandage_RightHand_Blood | - | - | - | - | - |
| Bandage_RightLowerArm | - | - | - | - | - |
| Bandage_RightLowerArm_Blood | - | - | - | - | - |
| Bandage_RightLowerLeg | - | - | - | - | - |
| Bandage_RightLowerLeg_Blood | - | - | - | - | - |
| Bandage_RightUpperArm | - | - | - | - | - |
| Bandage_RightUpperArm_Blood | - | - | - | - | - |
| Bandage_RightUpperLeg | - | - | - | - | - |
| Bandage_RightUpperLeg_Blood | - | - | - | - | - |

## Shirt

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Denim Shirt | 0.45 | 0.55 | 7 | 15 | Denim |
| Formal Shirt | 0.25 | 0.15 | - | - | Cotton |
| Formal Shirt | 0.25 | 0.15 | - | - | Cotton |
| Jockey Silks - 1 | 0.1 | 0.05 | - | - | Cotton |
| Jockey Silks - 2 | 0.1 | 0.05 | - | - | Cotton |
| Jockey Silks - 3 | 0.1 | 0.05 | - | - | Cotton |
| Jockey Silks - 4 | 0.1 | 0.05 | - | - | Cotton |
| Jockey Silks - 5 | 0.1 | 0.05 | - | - | Cotton |
| Jockey Silks - 6 | 0.1 | 0.05 | - | - | Cotton |
| Lumberjack Shirt | 0.65 | 0.5 | - | - | Cotton |
| Medical Scrubs | 0.1 | 0.05 | - | - | Cotton |
| Military Camo Shirt | 0.25 | 0.15 | - | - | Cotton |
| Military Desert Camo Shirt | 0.15 | 0.1 | - | - | Cotton |
| Military Urban Camo Shirt | 0.30 | 0.20 | - | - | Cotton |
| Police Deputy Shirt | 0.3 | 0.15 | - | - | Cotton |
| Police Shirt | 0.25 | 0.15 | - | - | Cotton |
| Police Trooper Shirt | 0.2 | 0.2 | - | - | Cotton |
| Priest Shirt | 0.2 | 0.1 | - | - | Cotton |
| Prison Guard Shirt | 0.25 | 0.25 | - | - | Cotton |
| Ranger Shirt | 0.4 | 0.35 | - | - | Cotton |
| Workman Shirt | 0.35 | 0.3 | - | - | Cotton |

## UnderwearBottom

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Animal Print Underpants | - | - | - | - | - |
| Black Frilly Underpants | - | - | - | - | - |
| Black Speedo | - | - | - | - | - |
| Black Underpants | - | - | - | - | - |
| Blue Speedo | - | - | - | - | - |
| Boxers | - | - | - | - | - |
| Briefs | - | - | - | - | - |
| Briefs | - | - | - | - | - |
| Hearts Boxers | - | - | - | - | - |
| Pink Frilly Underpants | - | - | - | - | - |
| Red Frilly Underpants | - | - | - | - | - |
| Red Speedo | - | - | - | - | - |
| Red Spots Underpants | - | - | - | - | - |
| Red Stripes Boxer | - | - | - | - | - |
| Silk Boxers | - | - | - | - | - |
| Silk Boxers | - | - | - | - | - |
| Speedo | - | - | - | - | - |
| Underpants | - | - | - | - | - |

## Ears

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Dangly Diamond Earrings | - | - | - | - | - |
| Dangly Pearl Earrings | - | - | - | - | - |
| Dangly Ruby Earrings | - | - | - | - | - |
| Dangly Sapphire Earrings | - | - | - | - | - |
| Dangly Sapphire Earrings | - | - | - | - | - |
| Emerald Earrings | - | - | - | - | - |
| Gold Stud Earrings | - | - | - | - | - |
| Large Gold Looped Earrings | - | - | - | - | - |
| Large Silver Looped Earrings | - | - | - | - | - |
| Medium Gold Looped Earrings | - | - | - | - | - |
| Medium Silver Looped Earrings | - | - | - | - | - |
| Pearl Earrings | - | - | - | - | - |
| Ruby Earrings | - | - | - | - | - |
| Sapphire Stone Earrings | - | - | - | - | - |
| Silver Stud Earrings | - | - | - | - | - |
| Small Gold Looped Earrings | - | - | - | - | - |
| Small Silver Looped Earrings | - | - | - | - | - |

## Jacket

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Barrel Dogs Leather Jacket | 0.40 | 0.6 | 20 | 40 | Leather |
| Chef Jacket | 0.35 | 0.15 | - | - | Cotton |
| Firefighter Jacket | 0.85 | 0.85 | 50 | 70 | - |
| Green Santa Suit Jacket | 0.9 | 0.6 | 10 | 30 | Cotton |
| Iron Rodent Leather Jacket | 0.40 | 0.6 | 20 | 40 | Leather |
| Jacket | 0.5 | 0.35 | 10 | 25 | Cotton |
| Jacket | 0.5 | 0.60 | 20 | 30 | Cotton |
| Leather Jacket | 0.65 | 0.35 | 20 | 40 | Leather |
| Leather Jacket | 0.40 | 0.6 | 20 | 40 | Leather |
| Medical Coat | 0.35 | 0.25 | - | 20 | Cotton |
| Military Desert Camo Jacket | 0.35 | 0.1 | 30 | 50 | Cotton |
| Military Green Camo Jacket | 0.45 | 0.3 | 30 | 50 | Cotton |
| Police Deputy Jacket | 0.6 | 0.45 | 20 | 30 | Cotton |
| Ranger Jacket | 0.7 | 0.7 | 20 | 30 | Cotton |
| Santa Suit Jacket | 0.9 | 0.6 | 10 | 30 | Cotton |
| Varsity Jacket | 0.60 | 0.5 | 10 | 20 | Cotton |
| Wild Raccoons Leather Jacket | 0.40 | 0.6 | 20 | 40 | Leather |

## Shoes

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Boots | 0.75 | 0.65 | 100 | 100 | - |
| Bowling Shoes | 0.25 | 0.25 | 10 | 20 | - |
| Fancy Shoes | 0.25 | 0.25 | 10 | 20 | - |
| Flip Flops | - | - | - | - | - |
| Military Boots | 1.0 | 1.0 | 100 | 100 | - |
| Military Desert Boots | 0.5 | 0.60 | 100 | 100 | - |
| Rain Boots | 0.5 | 1.0 | 100 | 100 | - |
| Riding Boots | 0.9 | 0.6 | 100 | 100 | - |
| Sandals | 0.25 | 0.25 | 10 | 20 | - |
| Shoes | 0.25 | 0.25 | 10 | 20 | - |
| Shoes | 0.3 | 0.15 | 10 | 20 | - |
| Shoes | 0.4 | 0.25 | 10 | 20 | - |
| Slippers | - | - | - | - | - |
| Sneakers | 0.45 | 0.3 | - | 10 | - |
| Sneakers | 0.55 | 0.35 | - | 10 | - |
| Sneakers | 0.35 | 0.25 | - | 10 | - |
| Strapped Shoes | 0.25 | 0.25 | 10 | 20 | - |

## UnderwearTop

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Animal Print Strapless Bra | - | - | - | - | - |
| Animal Print Straps Bra | - | - | - | - | - |
| Black Corset | - | - | - | - | - |
| Black Frilly Strapless Bra | - | - | - | - | - |
| Black Frilly Straps Bra | - | - | - | - | - |
| Black Strapless Bra | - | - | - | - | - |
| Black Straps Bra | - | - | - | - | - |
| Corset | - | - | - | - | - |
| Medical Corset | - | - | - | - | - |
| Pink Frilly Strapless Bra | - | - | - | - | - |
| Pink Frilly Straps Bra | - | - | - | - | - |
| Red Corset | - | - | - | - | - |
| Red Frilly Strapless Bra | - | - | - | - | - |
| Red Frilly Straps Bra | - | - | - | - | - |
| Red Spots Strapless Bra | - | - | - | - | - |
| Strapless Bra | - | - | - | - | - |
| Straps Bra | - | - | - | - | - |

## BellyButton

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Belly Button Dangle Gold | - | - | - | - | - |
| Belly Button Dangle Gold Ruby | - | - | - | - | - |
| Belly Button Dangle Silver | - | - | - | - | - |
| Belly Button Dangle Silver Diamond | - | - | - | - | - |
| Belly Button Ring Gold | - | - | - | - | - |
| Belly Button Ring Gold Diamond | - | - | - | - | - |
| Belly Button Ring Gold Ruby | - | - | - | - | - |
| Belly Button Ring Silver | - | - | - | - | - |
| Belly Button Ring Silver Amethyst | - | - | - | - | - |
| Belly Button Ring Silver Diamond | - | - | - | - | - |
| Belly Button Ring Silver Ruby | - | - | - | - | - |
| Belly Button Stud Gold | - | - | - | - | - |
| Belly Button Stud Gold Diamond | - | - | - | - | - |
| Belly Button Stud Silver | - | - | - | - | - |
| Belly Button Stud Silver Diamond | - | - | - | - | - |

## Dress

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Dress | 0.20 | 0.15 | - | - | Cotton |
| Hospital Gown | 0.10 | 0.05 | - | - | Cotton |
| Knee-length Dress | 0.15 | 0.1 | - | - | Cotton |
| Little Black Dress | 0.15 | 0.1 | - | - | Cotton |
| Long Dress | 0.3 | 0.2 | - | - | Cotton |
| Long Dress | 0.3 | 0.2 | - | - | Cotton |
| Satin Negligee | 0.15 | 0.1 | - | - | Cotton |
| Short Dress | 0.1 | 0.05 | - | - | Cotton |
| Strapless Black Dress | 0.15 | 0.1 | - | - | Cotton |
| Strapless Small Dress | 0.15 | 0.1 | - | - | Cotton |
| Straps Dress | 0.20 | 0.15 | - | - | Cotton |
| Straps Knee-length Dress | 0.15 | 0.1 | - | - | Cotton |
| Straps Small Dress | 0.15 | 0.1 | - | - | Cotton |

## ShortSleeveShirt

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Bowling Shirt Blue | 0.2 | 0.05 | - | - | Cotton |
| Bowling Shirt Brown | 0.2 | 0.05 | - | - | Cotton |
| Bowling Shirt Green | 0.2 | 0.05 | - | - | Cotton |
| Bowling Shirt Lime Green | 0.2 | 0.05 | - | - | Cotton |
| Bowling Shirt Pink | 0.2 | 0.05 | - | - | Cotton |
| Bowling Shirt White | 0.2 | 0.05 | - | - | Cotton |
| Hawaiian Red Shirt | 0.1 | 0.05 | - | - | Cotton |
| Hawaiian Shirt | 0.1 | 0.05 | - | - | Cotton |
| Kentucky Baseball Shirt | 0.2 | 0.05 | - | - | Cotton |
| Riverside Rangers Baseball Shirt | 0.2 | 0.05 | - | - | Cotton |
| Short Sleeve Shirt | 0.15 | 0.05 | - | - | Cotton |
| Short Sleeve Shirt | 0.15 | 0.05 | - | - | Cotton |
| Z Hurricanes Baseball Shirt | 0.2 | 0.05 | - | - | Cotton |

## LeftWrist

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Black Digital Watch | - | - | - | - | - |
| Classic Wrist Watch with Black Strap | - | - | - | - | - |
| Classic Wrist Watch with Brown Strap | - | - | - | - | - |
| Friendship Bracelet | - | - | - | - | - |
| Gold Bangle | - | - | - | - | - |
| Gold Chain Bracelet | - | - | - | - | - |
| Gold Wrist Watch | - | - | - | - | - |
| Metallic Dress Style Digital Watch | - | - | - | - | - |
| Red Digital Watch | - | - | - | - | - |
| Silver Bangle | - | - | - | - | - |
| Silver Chain Bracelet | - | - | - | - | - |
| Standard Military Issue Wrist Watch | - | - | - | - | - |

## RightWrist

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Black Digital Watch | - | - | - | - | - |
| Classic Wrist Watch with Black Strap | - | - | - | - | - |
| Classic Wrist Watch with Brown Strap | - | - | - | - | - |
| Friendship Bracelet | - | - | - | - | - |
| Gold Bangle | - | - | - | - | - |
| Gold Chain Bracelet | - | - | - | - | - |
| Gold Wrist Watch | - | - | - | - | - |
| Metallic Dress Style Digital Watch | - | - | - | - | - |
| Red Digital Watch | - | - | - | - | - |
| Silver Bangle | - | - | - | - | - |
| Silver Chain Bracelet | - | - | - | - | - |
| Standard Military Issue Wrist Watch | - | - | - | - | - |

## Necklace

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Dog tags | - | - | - | - | - |
| Gold Necklace | - | - | - | - | - |
| Gold Necklace with Diamond | - | - | - | - | - |
| Gold Necklace with Ruby Stone | - | - | - | - | - |
| Necklace with Crucifix | - | - | - | - | - |
| Necklace with Ying and Yang Symbol | - | - | - | - | - |
| Pearl Necklace | - | - | - | - | - |
| Silver Necklace | - | - | - | - | - |
| Silver Necklace with Crucifix | - | - | - | - | - |
| Silver Necklace with Diamond | - | - | - | - | - |
| Silver Necklace with Saphire Stone | - | - | - | - | - |

## TorsoExtra

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Apron | - | - | - | - | Cotton |
| Apron | - | - | - | - | Cotton |
| GigaMart Waistcoat | 0.40 | 0.20 | - | - | Cotton |
| Ice Cream Server Apron | - | - | - | - | Cotton |
| Jay Chicken Server Apron | - | - | - | - | Cotton |
| PileOCrepe Server Apron | - | - | - | - | Cotton |
| PizzaWhirled Server Apron | - | - | - | - | Cotton |
| Spiffo's Server Apron | - | - | - | - | Cotton |
| Tight Fit Apron | - | - | - | - | Cotton |
| Waistcoat | 0.35 | 0.25 | - | - | Cotton |
| Waistcoat | 0.35 | 0.25 | - | - | Cotton |

## Neck

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Black Choker | - | - | - | - | - |
| Bow Tie | - | - | - | - | - |
| Choker with Amber Stone | - | - | - | - | - |
| Choker with Diamond | - | - | - | - | - |
| Choker with Sapphire Stone | - | - | - | - | - |
| Clip-on Bow Tie | - | - | - | - | - |
| Clip-on Spiffo Tie | - | - | - | - | - |
| Clip-on Tie | - | - | - | - | - |
| Spiffo Tie | - | - | - | - | - |
| Tie | - | - | - | - | - |

## Eyes

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Aviator Glasses | - | - | - | - | - |
| Glasses | - | - | - | - | - |
| Reading Glasses | - | - | - | - | - |
| Reflective Ski Sunglasses | - | - | - | - | - |
| Safety Goggles | - | - | - | - | - |
| Shooting Glasses | - | - | - | - | - |
| Ski Goggles | - | - | - | - | - |
| Sunglasses | - | - | - | - | - |
| Swimming Goggles | - | - | - | - | - |

## TorsoExtraVest

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Camo Hunting Vest | 0.8 | 0.65 | - | - | - |
| Civilian Bulletproof Vest | 0.6 | 0.25 | 30 | 55 | - |
| Foreman Vest | 0.70 | 0.55 | - | - | - |
| Green Camo Hunting Vest | 0.70 | 0.80 | - | - | - |
| Grey Hunting Vest | 0.90 | 0.80 | - | - | - |
| High Visibility Vest | 0.1 | 0.05 | - | - | - |
| Military Bulletproof Vest | 0.75 | 0.45 | 30 | 55 | - |
| Orange Hunting Vest | 0.75 | 0.75 | - | - | - |
| Police Bulletproof Vest | 0.65 | 0.30 | 30 | 55 | - |

## Underwear

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Bikini | - | - | - | - | - |
| Bikini | - | - | - | - | - |
| Bunny Suit | - | - | - | - | - |
| Bunny Suit | - | - | - | - | - |
| Swim Trunks | - | - | - | - | - |
| Swim Trunks | - | - | - | - | - |
| Swim Trunks | - | - | - | - | - |
| Swim Trunks | - | - | - | - | - |
| Swimsuit | - | - | - | - | - |

## FullHat

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Airforce Helmet | 0.70 | 0.70 | 100 | 100 | - |
| Boxing Head Gear | 0.30 | 0.1 | 30 | 50 | - |
| Boxing Head Gear | 0.30 | 0.1 | 30 | 50 | - |
| Football Helmet | 0.55 | 0.35 | 100 | 100 | - |
| Motorcycle Helmet | 1.0 | 1.0 | 100 | 100 | - |
| Nuclear Biochemical Mask | 0.50 | 0.65 | 100 | 100 | - |
| Riot Helmet | 0.45 | 0.65 | 100 | 100 | - |
| Spiffo Suit Head | 0.75 | 0.75 | - | - | - |

## Hands

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Boxing Gloves | 0.25 | 0.3 | - | - | - |
| Boxing Gloves | 0.25 | 0.3 | - | - | - |
| Fingerless Gloves | 0.25 | 0.3 | - | - | - |
| Gloves | 1.0 | 1.0 | - | - | Cotton |
| Leather Gloves | 0.75 | 0.75 | 15 | 30 | Leather |
| Leather Gloves | 0.75 | 0.75 | 15 | 30 | Leather |
| Long Gloves | 0.5 | 0.5 | - | - | Cotton |
| Surgical Gloves | 0.25 | 0.3 | - | - | - |

## MakeUp_FullFace

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| MakeUp_BraveHeart | - | - | - | - | - |
| MakeUp_CamoFullFace1 | - | - | - | - | - |
| MakeUp_CamoFullFace2 | - | - | - | - | - |
| MakeUp_ClownFace1 | - | - | - | - | - |
| MakeUp_ClownFace2 | - | - | - | - | - |
| MakeUp_GreenCamo | - | - | - | - | - |
| MakeUp_SkullFace1 | - | - | - | - | - |
| MakeUp_SkullFace2 | - | - | - | - | - |

## UnderwearExtra1

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Fishnets | - | - | - | - | - |
| Stockings | - | - | - | - | - |
| Stockings | - | - | - | - | - |
| Stockings Semi Transparent | - | - | - | - | - |
| Stockings Transparent | - | - | - | - | - |
| Tights | - | - | - | - | - |
| Tights Semi Transparent | - | - | - | - | - |
| Tights Transparent | - | - | - | - | - |

## Jacket_Bulky

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Padded Jacket | 1.0 | 1.0 | 10 | 20 | - |
| Shell Suit Jacket | 0.45 | 0.4 | - | 5 | - |
| Shell Suit Jacket | 0.45 | 0.4 | - | 5 | - |
| Shell Suit Jacket | 0.45 | 0.4 | - | 5 | - |
| Shell Suit Jacket | 0.45 | 0.4 | - | 5 | - |
| Shell Suit Jacket | 0.45 | 0.4 | - | 5 | - |
| Shell Suit Jacket | 0.45 | 0.4 | - | 5 | - |

## MakeUp_Eyes

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| MakeUp_CamoEyes1 | - | - | - | - | - |
| MakeUp_CamoEyes2 | - | - | - | - | - |
| MakeUp_CamoStripes | - | - | - | - | - |
| MakeUp_Crow | - | - | - | - | - |
| MakeUp_Football | - | - | - | - | - |
| MakeUp_RedStripes1 | - | - | - | - | - |
| MakeUp_RedStripes2 | - | - | - | - | - |

## MakeUp_EyesShadow

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| MakeUp_EyesShadowBlue | - | - | - | - | - |
| MakeUp_EyesShadowGreen | - | - | - | - | - |
| MakeUp_EyesShadowLightBlue | - | - | - | - | - |
| MakeUp_EyesShadowPink | - | - | - | - | - |
| MakeUp_EyesShadowRed | - | - | - | - | - |
| MakeUp_EyesShadowWhite | - | - | - | - | - |
| MakeUp_EyesShadowYellow | - | - | - | - | - |

## Mask

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Balaclava | 1.0 | 1.0 | - | - | - |
| Bandana (Face) | 0.10 | - | - | - | - |
| Bandana (Face) | 0.10 | - | - | - | - |
| Dust Mask | 0.6 | 0.5 | - | - | - |
| Medical Mask | - | - | - | - | - |
| Medical Mask | - | - | - | - | - |
| Open Balaclava | 0.8 | 0.8 | - | - | - |

## Necklace_Long

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Long Gold Necklace | - | - | - | - | - |
| Long Gold Necklace with Diamond | - | - | - | - | - |
| Long Necklace with Amber Stone | - | - | - | - | - |
| Long Silver Necklace | - | - | - | - | - |
| Long Silver Necklace with Diamond | - | - | - | - | - |
| Long Silver Necklace with Emerald | - | - | - | - | - |
| Long Silver Necklace with Sapphire Stone | - | - | - | - | - |

## Sweater

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Diamond-pattern Sweater | 0.55 | 0.45 | - | 10 | Cotton |
| Diamond-pattern Sweater Vest | 0.4 | 0.2 | - | 10 | Cotton |
| Hoodie | 0.6 | 0.25 | - | 10 | Cotton |
| Polo Neck Sweater | 0.55 | 0.50 | - | 10 | Cotton |
| Round Neck Sweater | 0.4 | 0.35 | - | 10 | Cotton |
| V-Neck Sweater | 0.4 | 0.20 | - | 10 | Cotton |
| V-Neck Sweater Vest | 0.45 | 0.15 | - | 10 | Cotton |

## Boilersuit

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Airforce Coveralls | 0.75 | 0.55 | - | 10 | Cotton |
| Coveralls | 0.65 | 0.45 | - | 10 | Cotton |
| Coveralls | 0.65 | 0.45 | - | 10 | Cotton |
| Coveralls | 0.65 | 0.45 | - | 10 | Cotton |
| Prisoner Jumpsuit | 0.45 | 0.35 | - | 10 | Cotton |
| Prisoner Jumpsuit | 0.40 | 0.30 | - | 10 | Cotton |

## MakeUp_Lips

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| MakeUp_LipsBlack | - | - | - | - | - |
| MakeUp_LipsBlue | - | - | - | - | - |
| MakeUp_LipsGreen | - | - | - | - | - |
| MakeUp_LipsLightBlue | - | - | - | - | - |
| MakeUp_LipsPink | - | - | - | - | - |
| MakeUp_LipsRed | - | - | - | - | - |

## Left_MiddleFinger

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Diamond on a Gold Ring | - | - | - | - | - |
| Diamond on a Silver Ring | - | - | - | - | - |
| Gold Ring | - | - | - | - | - |
| Ruby on a Gold Ring | - | - | - | - | - |
| Silver Ring | - | - | - | - | - |

## Left_RingFinger

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Diamond on a Gold Ring | - | - | - | - | - |
| Diamond on a Silver Ring | - | - | - | - | - |
| Gold Ring | - | - | - | - | - |
| Ruby on a Gold Ring | - | - | - | - | - |
| Silver Ring | - | - | - | - | - |

## Right_MiddleFinger

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Diamond on a Gold Ring | - | - | - | - | - |
| Diamond on a Silver Ring | - | - | - | - | - |
| Gold Ring | - | - | - | - | - |
| Ruby on a Gold Ring | - | - | - | - | - |
| Silver Ring | - | - | - | - | - |

## Right_RingFinger

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Diamond on a Gold Ring | - | - | - | - | - |
| Diamond on a Silver Ring | - | - | - | - | - |
| Gold Ring | - | - | - | - | - |
| Ruby on a Gold Ring | - | - | - | - | - |
| Silver Ring | - | - | - | - | - |

## Skirt

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Knee-length Skirt | 0.1 | 0.01 | - | - | Cotton |
| Long Skirt | 0.3 | 0.2 | - | - | Cotton |
| Mini Skirt | 0.1 | 0.01 | - | - | Cotton |
| Short Skirt | 0.05 | - | - | - | Cotton |
| Skirt | 0.25 | 0.1 | - | - | Cotton |

## JacketSuit

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Army Coat | 0.70 | 0.45 | 20 | 40 | Cotton |
| Suit Jacket | 0.55 | 0.45 | - | 20 | Cotton |
| Suit Jacket | 0.55 | 0.45 | - | 20 | Cotton |
| Wedding Jacket | 0.40 | 0.2 | - | 20 | Cotton |

## Nose

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Gold Nose Ring | - | - | - | - | - |
| Gold Nose Stud | - | - | - | - | - |
| Silver Nose Ring | - | - | - | - | - |
| Silver Nose Stud | - | - | - | - | - |

## Scarf

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Scarf | 1.0 | 1.0 | - | 10 | Cotton |
| Scarf | 0.5 | 0.55 | - | 10 | Cotton |
| Scarf | 0.4 | 0.3 | - | 10 | Cotton |
| Scarf | 0.75 | 0.75 | - | 10 | Cotton |

## AmmoStrap

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Bullets Ammo Strap | - | - | - | - | - |
| Shells Ammo Strap | - | - | - | - | - |

## BeltExtra

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Double Holster | - | - | - | - | - |
| Holster | - | - | - | - | - |

## EarTop

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Small Gold Looped Earrings (Top) | - | - | - | - | - |
| Small Silver Looped Earrings (Top) | - | - | - | - | - |

## FullSuit

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Spiffo Suit | 0.85 | 0.6 | - | 10 | - |
| Wedding Dress | 0.25 | 0.1 | - | 10 | Cotton |

## JacketHat

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Poncho | 0.1 | 0.75 | - | 10 | - |
| Poncho | 0.1 | 0.75 | - | 10 | - |

## Jacket_Down

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Poncho | 0.15 | 0.8 | - | 10 | - |
| Poncho | 0.15 | 0.8 | - | - | - |

## MaskEyes

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Gas Mask | 0.75 | 0.60 | - | - | - |
| Hockey Goalie Mask | 0.25 | 0.55 | 30 | 50 | - |

## Socks

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Long Socks | 0.55 | 0.65 | - | - | Cotton |
| Socks | 0.15 | 0.1 | - | - | Cotton |

## Tail

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Bunny Tail | - | - | - | - | - |
| Spiffo Suit Tail | - | - | - | - | - |

## TankTop

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Tank Top | 0.40 | 0.30 | - | - | Cotton |
| Tank Top | 0.40 | 0.30 | - | - | Cotton |

## BathRobe

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Bath Robe | 0.5 | 0.35 | - | 10 | Cotton |

## Belt

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Belt | - | - | - | - | - |

## FannyPackBack

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Fanny Pack (Back) | - | - | - | - | - |

## FannyPackFront

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Fanny Pack (Front) | - | - | - | - | - |

## FullSuitHead

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Hazmat Suit | 0.65 | 0.9 | 5 | 15 | - |

## FullTop

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Ghillie Suit Torso | 0.70 | 0.45 | 10 | 30 | - |

## JacketHat_Bulky

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Padded Jacket | 0.95 | 0.95 | 10 | 20 | - |

## LeftEye

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Eyepatch | - | - | - | - | - |

## Legs1

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Long Johns Bottoms | 0.3 | 0.15 | - | - | Cotton |

## MaskFull

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Welder Mask | 0.25 | 0.55 | 30 | 50 | - |

## RightEye

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Eyepatch | - | - | - | - | - |

## SweaterHat

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Hoodie | 0.55 | 0.2 | - | 10 | Cotton |

## Torso1Legs1

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Long Johns | 0.3 | 0.15 | - | - | Cotton |

## UnderwearExtra2

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Garter | - | - | - | - | - |

## UnderwearInner

| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |
|------|------------|----------|----------|-------------|--------|
| Underwear | - | - | - | - | - |

---

## Common Mistakes

### ❌ Wrong: Assuming All Protective Clothing Has High Defense

```
// Someone thinks: "It's a leather jacket, so it must have protection"
item MyLeatherJacket
{
    Type = Clothing,
    BodyLocation = Jacket,
    BiteDefense = 100,              // WRONG! Way too high
    ScratchDefense = 100,
}
```

**Why it's wrong:** Looking at the vanilla reference, most leather jackets have **20 bite defense and 40 scratch defense**, not 100. Only full helmets and boots get 100 defense.

✅ **Right:**

```
item MyLeatherJacket
{
    Type = Clothing,
    BodyLocation = Jacket,
    BiteDefense = 20,               // Matches vanilla leather jackets
    ScratchDefense = 40,
}
```

---

### ❌ Wrong: Not Checking If Defense Values Make Sense Together

```
item MyVest
{
    Type = Clothing,
    BodyLocation = TorsoExtraVest,
    BiteDefense = 40,               // WRONG! Bite defense higher than scratch
    ScratchDefense = 20,
}
```

**Why it's wrong:** In vanilla, scratch defense is **always equal to or higher than bite defense**. This makes sense - if something protects against bites, it definitely protects against scratches (which are less severe).

✅ **Right:**

```
item MyVest
{
    Type = Clothing,
    BodyLocation = TorsoExtraVest,
    BiteDefense = 30,               // Bite defense lower than scratch
    ScratchDefense = 55,            // Scratch defense higher (correct relationship)
}
```

---

### ❌ Wrong: Using Unrealistic Insulation Values

```
item MyTShirt
{
    Type = Clothing,
    BodyLocation = Tshirt,
    Insulation = 0.9,               // WRONG! Way too warm for a T-shirt
    WindResistance = 0.8,
}
```

**Why it's wrong:** Looking at vanilla T-shirts, they have insulation around **0.15-0.3**, not 0.9. A value of 0.9 is for thick winter coats and padded jackets.

✅ **Right:**

```
item MyTShirt
{
    Type = Clothing,
    BodyLocation = Tshirt,
    Insulation = 0.2,               // Matches vanilla T-shirt range
    WindResistance = 0.05,          // T-shirts don't block wind well
}
```

**Insulation Guidelines:**
- T-shirts/Light clothing: 0.10-0.30
- Shirts/Medium clothing: 0.25-0.50
- Jackets/Sweaters: 0.40-0.70
- Winter coats/Padded: 0.80-1.0

---

### ❌ Wrong: Not Using Fabric Type

```
item MyDenimJeans
{
    Type = Clothing,
    BodyLocation = Pants,
    // Missing FabricType!
}
```

**Why it's wrong:** Vanilla denim items always specify `FabricType = Denim`. This affects how the clothing behaves (staining, wear, etc.).

✅ **Right:**

```
item MyDenimJeans
{
    Type = Clothing,
    BodyLocation = Pants,
    FabricType = Denim,             // Now it's properly classified as denim
}
```

**Common Fabric Types:**
- Cotton (most clothing)
- Denim (jeans, denim jackets)
- Leather (leather jackets, boots)

---

## Try It Yourself

Let's use this reference to create a balanced custom hoodie, step by step.

### Step 1: Find Similar Vanilla Items

1. Scroll up to the **Quick Navigation** section
2. Look for `Sweater` (hoodies are in the Sweater category)
3. Click the [Sweater](#sweater) link to jump to that section

### Step 2: Analyze Vanilla Hoodies

4. Look at the "Hoodie" entries in the Sweater table
5. You'll see:
   - Insulation: 0.6
   - Wind Resistance: 0.25
   - Bite Defense: - (meaning 0)
   - Scratch Defense: 10
   - Fabric: Cotton

### Step 3: Create Your Hoodie

6. Create `media/scripts/items.txt` in your mod folder
7. Add this code:

```
module MyMod
{
    item CustomHoodie
    {
        Type = Clothing,
        DisplayName = Custom Hoodie,

        BodyLocation = Sweater,

        Insulation = 0.6,           // Same as vanilla hoodie (warm but not too warm)
        WindResistance = 0.25,      // Light wind protection

        BiteDefense = 0,            // Hoodies don't protect against bites
        ScratchDefense = 10,        // Slight scratch protection (fabric layer)

        FabricType = Cotton,        // Standard hoodie material
    }
}
```

### Step 4: Test In-Game

8. Load your mod and spawn your hoodie using Debug Mode
9. Wear it and check the stats panel (health screen)
10. Compare to a vanilla hoodie:
    - Does your custom hoodie feel similar in warmth?
    - Does it provide similar protection?

### Step 5: Adjust Based on Intent

11. If you want a **heavy winter hoodie**, increase insulation:
    - Change `Insulation = 0.6` to `Insulation = 0.75` (warmer than normal)

12. If you want a **reinforced tactical hoodie**, add protection:
    - Change `ScratchDefense = 10` to `ScratchDefense = 20`
    - This is still balanced (less than leather jackets at 40)

### What You Should See

- **Your hoodie appears in-game** when spawned via debug
- **Warmth feels appropriate** - not too hot, not too cold
- **Protection values match intent** - standard hoodie = low protection
- **Balanced with vanilla** - not overpowered compared to other sweaters

### If Something Feels Wrong

- **Too warm/cold:** Check insulation value against similar vanilla items
- **Too much protection:** Most clothing has 0-20 defense, only specialized gear goes higher
- **Doesn't fit right:** Verify BodyLocation matches the type of clothing (Sweater for hoodies)

---

## Source

Definitions from `media/scripts/clothing/*.txt`
