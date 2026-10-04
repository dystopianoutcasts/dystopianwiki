---
id: vanilla-items-radio
slug: vanilla-items-radio
title: "Vanilla Items: items_radio.txt"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - vanilla
  - items
excerpt: "Reference for 23 items from items_radio.txt."
last_updated: 2026-01-18
---

# Vanilla Items Reference (items_radio.txt)

## Introduction

You're creating a custom walkie talkie mod and need to know what weight vanilla radios have. Or you're adding ham radio components and want them to feel authentic. Or maybe you're creating a military communication system and need to know what radio items exist in the game.

If you're feeling overwhelmed by the different types of radio items in Project Zomboid, you're not alone. There are 23 different radio-related items including walkie talkies (portable two-way radios), ham radios (long-distance communication), televisions, and radio components. Figuring out what's "normal" for a radio's weight or what components are needed can feel confusing.

Here's the good news: this reference organizes all vanilla radio items by type, so you can quickly see patterns for different radio categories. I'll show you exactly how to use this reference to create balanced radio mods.

## How to Use This Reference

When creating custom radio items, follow this pattern:

### Step 1: Find Similar Vanilla Items

Look through the radio tables below and find items similar to what you're creating:

- **Making a walkie talkie?** Look at the 5 walkie talkie variants (Toys-R-Mine, ValuTech, Premium Tech, Tactical, US Army)
- **Making a ham radio?** Look at the 3 ham radio types (Makeshift, Premium Technologies, US ARMY COMM.)
- **Making radio components?** Look at Electric Wire, Radio Receiver, Radio Transmitter, Scanner Module
- **Making radio magazines?** Look at Guerilla Radio Vol. 1-3

### Step 2: Compare Properties

Notice the patterns in vanilla radio items:

| Type | Weight | Examples |
|------|--------|----------|
| **Walkie Talkies (portable)** | 1.0-1.5 | Toys-R-Mine (1.0), ValuTech (1.0), Premium Tech (1.0), Tactical (1.25), US Army (1.5) |
| **Standard Radios** | 1.5 | Makeshift Radio (1.5), ValuTech Radio (1.5), Premium Technologies Radio (1.5) |
| **Ham Radios (heavy)** | 20.0 | All ham radios weigh 20.0 (very heavy for long-distance communication) |
| **Televisions (very heavy)** | 10.0 | All televisions weigh 10.0 (large bulky items) |
| **Radio Components** | 0.1 | Electric Wire (0.1), Receiver (0.1), Transmitter (0.1), Scanner Module (0.1) |
| **Radio Magazines** | 0.1 | Guerilla Radio Vol. 1-3 all weigh 0.1 (same as other magazines) |

### Step 3: Make Your Decision

Choose values that match the vanilla pattern:

- **Portable walkie talkies** → Use weight 1.0-1.5 (military/tactical = heavier)
- **Desktop/home radios** → Use weight 1.5 (standard household radios)
- **Ham radios** → Use weight 20.0 (all ham radios are extremely heavy)
- **Radio components** → Use weight 0.1 (small electronic parts)
- **Radio magazines** → Use weight 0.1 (matches all vanilla magazines)

## Items by Type

### Literature (3 items)

| Item | Weight | Description |
|------|--------|-------------|
| Guerilla Radio Vol. 1 | 0.1 | `Radio.RadioMag1` |
| Guerilla Radio Vol. 2 | 0.1 | `Radio.RadioMag2` |
| Guerilla Radio Vol. 3 | 0.1 | `Radio.RadioMag3` |

### Normal (4 items)

| Item | Weight | Description |
|------|--------|-------------|
| Electric Wire | 0.1 | `Radio.ElectricWire` |
| Radio Receiver | 0.1 | `Radio.RadioReceiver` |
| Radio Transmitter | 0.1 | `Radio.RadioTransmitter` |
| Scanner Module | 0.1 | `Radio.ScannerModule` |

### Radio (16 items)

| Item | Weight | Description |
|------|--------|-------------|
| Antique Television | 10.0 | `Radio.TvAntique` |
| Makeshift Ham Radio | 20.0 | `Radio.HamRadioMakeShift` |
| Makeshift Radio | 1.5 | `Radio.RadioMakeShift` |
| Makeshift Walkie Talkie | 1.0 | `Radio.WalkieTalkieMakeShift` |
| Premium Tech. Walkie Talkie | 1.0 | `Radio.WalkieTalkie3` |
| Premium Technologies Ham Radio | 20.0 | `Radio.HamRadio1` |
| Premium Technologies Radio | 1.5 | `Radio.RadioRed` |
| Premium Technologies Televi... | 10.0 | `Radio.TvWideScreen` |
| Tactical Walkie Talkie | 1.25 | `Radio.WalkieTalkie4` |
| Toys-R-Mine Walkie Talkie | 1.0 | `Radio.WalkieTalkie1` |
| US ARMY COMM. Ham Radio | 20.0 | `Radio.HamRadio2` |
| US Army Walkie Talkie | 1.5 | `Radio.WalkieTalkie5` |
| ValuTech PortaDisc | 0.3 | `Radio.CDplayer` |
| ValuTech Radio | 1.5 | `Radio.RadioBlack` |
| ValuTech Television | 10.0 | `Radio.TvBlack` |
| ValuTech Walkie Talkie | 1.0 | `Radio.WalkieTalkie2` |

---

## Common Mistakes

### Wrong: Walkie Talkie with Ham Radio Weight

```
item MyCustomWalkieTalkie
{
    Type = Radio,
    DisplayName = Custom Walkie Talkie,
    Weight = 20.0,                          // WRONG! Way too heavy for portable radio
    TwoWay = true,
}
```

**Why it's wrong:** Looking at vanilla walkie talkies (Toys-R-Mine, ValuTech, Premium Tech, etc.), they all weigh 1.0-1.5. Your custom walkie talkie at 20.0 weight is as heavy as a ham radio - you couldn't carry it in your pocket!

**Right:**

```
item MyCustomWalkieTalkie
{
    Type = Radio,
    DisplayName = Custom Walkie Talkie,
    Weight = 1.0,                            // Matches vanilla civilian walkie talkies
    TwoWay = true,                           // Two-way communication (can transmit)
    TransmitRange = 500,                     // Range in tiles
    DisplayCategory = Radio,                 // Shows in radio category
}
```

### Wrong: Ham Radio with Walkie Talkie Weight

```
item MyCustomHamRadio
{
    Type = Radio,
    DisplayName = Custom Ham Radio,
    Weight = 1.5,                           // WRONG! Way too light for ham radio
    TwoWay = true,
}
```

**Why it's wrong:** Looking at vanilla ham radios (Makeshift, Premium Technologies, US ARMY COMM.), ALL ham radios weigh 20.0. Ham radios are large, heavy equipment for long-distance communication. Your custom ham radio at 1.5 weight would be as light as a standard radio.

**Right:**

```
item MyCustomHamRadio
{
    Type = Radio,
    DisplayName = Custom Ham Radio,
    Weight = 20.0,                           // Matches all vanilla ham radios
    TwoWay = true,                           // Two-way communication
    TransmitRange = 2000,                    // Ham radios have longer range
    UseDelta = 0.00002,                      // Battery drain rate
    DisplayCategory = Radio,
}
```

### Wrong: Radio Components with Wrong Weight

```
item MyCustomRadioReceiver
{
    Type = Normal,
    DisplayName = Custom Radio Receiver,
    Weight = 1.0,                           // WRONG! Too heavy for a component
}
```

**Why it's wrong:** Looking at vanilla radio components (Electric Wire, Radio Receiver, Radio Transmitter, Scanner Module), ALL components weigh 0.1. These are small electronic parts, not full devices. Your custom receiver at 1.0 weight is 10x heavier than vanilla components.

**Right:**

```
item MyCustomRadioReceiver
{
    Type = Normal,
    DisplayName = Custom Radio Receiver,
    Weight = 0.1,                            // Matches all vanilla radio components
    DisplayCategory = Electronics,           // Shows in electronics category
}
```

## Try It Yourself

Let's create a custom civilian walkie talkie using vanilla radio patterns.

### Step 1: Research Similar Items

Look at the reference above and find civilian walkie talkies:
- Toys-R-Mine Walkie Talkie: Weight 1.0
- ValuTech Walkie Talkie: Weight 1.0
- Premium Tech. Walkie Talkie: Weight 1.0

All civilian walkie talkies weigh 1.0 (military/tactical ones are heavier at 1.25-1.5).

### Step 2: Create the Item File

Create `media/scripts/my_radio.txt`:

```
module MyMod
{
    imports
    {
        Base
    }

    item CivilianWalkieTalkie
    {
        Type = Radio,                            // Identifies this as a radio device
        DisplayName = Civilian Walkie Talkie,
        Icon = WalkieTalkie,                     // Using vanilla walkie talkie icon
        Weight = 1.0,                            // Matches civilian vanilla walkie talkies
        TwoWay = true,                           // Can both receive and transmit
        TransmitRange = 400,                     // Range in tiles (medium range)
        MicRange = 10,                           // How far your voice is heard
        BaseVolumeRange = 400,                   // Base listening range
        UseDelta = 0.0001,                       // Battery drain rate (per game tick)
        DisplayCategory = Radio,                 // Shows in radio inventory category
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to bring up item spawner
3. Type "Civilian Walkie" and spawn it
4. Right-click the walkie talkie in your inventory

**What You Should See:**
- Walkie talkie appears with walkie talkie icon
- Shows "Turn On" in context menu
- After turning on: can hear radio broadcasts within 400 tiles
- If you have 2 walkie talkies: can communicate between them
- Item weighs 1.0 (same as vanilla civilian walkie talkies)
- Battery drains slowly based on UseDelta

### Why This Works

This walkie talkie uses vanilla patterns:
- **Weight (1.0)** matches all civilian vanilla walkie talkies
- **TwoWay (true)** allows both receiving and transmitting (essential for walkie talkies)
- **TransmitRange (400)** is medium range for civilian devices (military ones go up to 500-800)
- **UseDelta (0.0001)** is a reasonable battery drain rate
- **Type = Radio** ensures it works with the radio system

---

## Source

Definitions from `media/scripts/items_radio.txt`
