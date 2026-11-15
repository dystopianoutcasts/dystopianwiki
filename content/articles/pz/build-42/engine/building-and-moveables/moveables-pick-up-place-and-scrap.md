---
id: build-42-moveables-pick-up-place-and-scrap
slug: moveables-pick-up-place-and-scrap
title: 'Moveables: pick up, place, rotate, break and scrap'
game: pz
version: build-42
section: engine
category: building-and-moveables
difficulty: intermediate
tags:
  - engine
  - moveables
  - furniture
  - scrapping
  - disassemble
  - multiplayer
excerpt: >-
  Which furniture you can pick up and with what tool, its weight, the chance it breaks when lifted, place and rotate rules, and what scrapping yields and costs, with XP.
last_updated: '2026-11-14'
related_articles:
  - how-building-works
  - built-objects-health-and-zombies
  - building-recipes-by-skill
  - building-and-moveables-reference
  - modding-building-and-moveables
  - built-object-health-table
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [players](#the-moveables-button) | [server owners](#multiplayer-which-side-does-what)

:::callout[The 1-minute version]{kind=key}
- The sidebar's moveables button opens a cursor with five modes: Pick up, Place, Rotate, Scrap and Repair. Per-object values (weight, tool, level, material) are not verified, because the tile definitions are not in the capture.
- To lift an object, among other checks, a container must be empty, the object must fit your inventory, and the tile names a pick-up tool and, if `PickUpLevel` is above 0, a minimum level in that tool's skill.
- If the tile has `CanBreak` and a pick-up tool, lifting rolls a die: with most tools the chance is 75 percent at skill 0 and 0 at skill 10, and windows go from 55 to 5 percent. A break loses the object. Rotating never breaks anything.
- No XP is given for picking up, placing or rotating. With the default settings, scrapping gives XP only for Electrical.
- Furniture you set down becomes an `IsoThumpable` with health of raw weight x a material factor and a `thumpDmg` of 1, so a single zombie does a full point per thump.
- On a server, the moveables actions check safehouse permissions only on the client, and I found no server-side test for them.
:::

:::facts
- **Pick-up and place time** `(base + 2 x raw weight) x (1 - 0.05 x your level in the tool's skill)`, three times that for a window; admins and instant-action mode take 1
- **Weight** `PickUpWeight / 10`; with no `PickUpWeight`, weight 5 in the Lua rules and weight 1 in Java when the item is created from the sprite
- **Break chance** `(10 - skill level) x 7.5` for most tools, 25 for a Wrench, `5 + (10 - skill level) x 5` for windows
- **Scrap time** `base time x (1 - 0.03 x skill level)`
- **Scrap XP** 5 x size (5, 10 or 15) only while your level is below the Maximum Dismantling XP Level (default 0), or the skill is Electrical
:::

Outcast, most of what is in a house can be lifted and carried: couches, shelves, beds, lamps, sinks, even windows. This page covers how that works: which tool you need, what the object weighs, the chance that it breaks when you lift it, how placing and rotating are checked, and how scrapping (the "Disassemble" action) turns a fixture into parts.

Citations use short paths: `zombie/...` is under the capture's `src/`, `media/...` under its `game_snapshot/`. The tile definitions (which hold each tile's weight, tool and material) are not in the capture, so per-object values are not verified; the rules and the numbers behind them are. Bare line numbers such as `:1205` are lines in `ISMoveableSpriteProps.lua` unless a file is named.

## The moveables button

The sidebar has a moveables button, and each mode of the cursor it opens ends in one timed action. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:798-817`)]

The cursor has five modes: **Pick up**, **Place**, **Rotate**, **Scrap** and **Repair**. :cite[(`media/lua/server/BuildingObjects/ISMoveableCursor.lua:6-20`, `:86-90`)] A right-click wheel switches mode. :cite[(`:73-110`)] Hover an object and an info panel lists the tool, skill, weight and chance, in green or red. :cite[(`ISMoveableSpriteProps.lua:577-790`)]

A carried moveable item also has a right-click **Place** entry :cite[(`media/lua/client/ISUI/ISMoveableContextMenu.lua:3-16`)], and objects with a material can also be offered as **Disassemble** from the right-click menu of the world. :cite[(`media/lua/client/ISUI/ISDisassembleMenu.lua:3-81`)]

Each mode ends in the timed action `ISMoveablesAction`, which runs the real work in its `complete()` (on the server in multiplayer). :cite[(`media/lua/shared/Moveables/ISMoveablesAction.lua:236-255`)] That function calls back into the tests below, so the server re-checks tool, skill and weight itself. :cite[(`ISMoveableSpriteProps.lua:1269`, `:3474`, `:3540`)]

## What can be picked up

An object can be lifted only if its tile is a moveable and every rule below passes.

A tile is a moveable when its definition carries the `IsMoveAble` property. :cite[(`ISMoveableSpriteProps.lua:130`, `zombie/inventory/types/Moveable.java:131`)] Then all of this must hold. :cite[(`ISMoveableSpriteProps.lua:1179-1255`)]

| Rule | Detail | Code |
|---|---|---|
| Containers must be empty | A cabinet or fridge with items in it cannot be lifted | `:1205` |
| It must fit | Your inventory must have room for the object's weight | `:1207` |
| Tables | Only the top table of a stack, and not one holding a table-top object | `:1209-1211` |
| Water collectors | Not while they hold fluid | `:1214-1218` |
| Windows | Only when closed or already smashed, and not barricaded | `:1220-1229` |
| Window dressings (type `WindowObject`) | Not while you stand outside | `:1231-1235` |
| Barbecues and fireplaces | Not while lit, smoldering or holding a gas tank | `:1241-1247` |
| Tool and skill | The tile names a pick-up tool and, if `PickUpLevel` is above 0, a minimum level in that tool's skill | `:1249-1253`, `:426-497` |
| Multi-tile objects | Every part must pass, and each part becomes its own item unless the tile says `ForceSingleItem` | `:1185-1197`, `:1270-1296` |

Admins with the moveables cheat skip every check. :cite[(`:1181`)]

### Tools

The tile's `PickUpTool` (and `PlaceTool`) names a tool group, and the groups, their skills and the base action time are fixed in the script. :cite[(`media/lua/shared/Moveables/ISMoveableDefinitions.lua:311-318`)]

| Group | Accepts | Skill | Base time |
|---|---|---|---|
| Hammer | Anything tagged hammer | Carpentry | 75 |
| Crowbar | Anything tagged crowbar | Carpentry | 150 |
| Electrician | Screwdriver | Electrical | 100 |
| Cutter | Sharp knives, scissors, kitchen or hunting knife, sharpened stone | Carpentry | 50 |
| Shovel | Anything tagged dig-and-plow | Agriculture (script name Farming) | 100 |
| Wrench | Wrench, pipe wrench | none | 100 |
| Metal | Screwdriver | Welding | 100 |
| Screwdriver | Screwdriver | Carpentry | 100 |

**Time.** `(base + 2 x the object's raw weight) x (1 - 0.05 x your level in the tool's skill)`, and three times that for a window. :cite[(`ISMoveableSpriteProps.lua:407-424`)] The raw weight is the tile's `PickUpWeight` (the object weighs a tenth of it).

For the default raw weight of 50 and a Hammer that is 175 at skill 0 and 87.5 at skill 10. The unit is the usual timed-action unit; real seconds are not verified. Admins and instant-action mode take 1. :cite[(`ISMoveablesAction.lua:257-260`)]

## Weight

An object weighs a tenth of its raw `PickUpWeight`, and the default differs between the Lua rules and Java.

| Item | Value | Code |
|---|---|---|
| Object weight | `PickUpWeight / 10` | `ISMoveableSpriteProps.lua:148-149`, `Moveable.java:131-139` |
| Default if the tile has no `PickUpWeight` | Lua: raw 50, so weight **5**. Java, when the item is created from the sprite: weight **1** | `ISMoveableSpriteProps.lua:148`, `Moveable.java:133-136` |
| Custom items (radios, TVs) | The item script's own weight replaces it in the Lua rules | `ISMoveableSpriteProps.lua:174-190` |
| Multi-tile pieces | Each piece is a "flat pack" item with its own weight, named `Name (1/3)`, `(2/3)` and so on | `Moveable.java:172-191`, `ISMoveableSpriteProps.lua:1638-1641` |

Because the check is "does it fit in my inventory", a heavy object may be impossible to lift for a weak or loaded character. The inventory's actual capacity formula lives in the inventory code and is not covered here.

## The chance something breaks

Lifting can break an object, and the chance falls as your skill in the tool's skill rises.

If the tile has `CanBreak` **and** a pick-up tool, lifting rolls a die. If it breaks, the object is **lost** (no item), the break sound plays, and some debris lands on the floor. :cite[(`ISMoveableSpriteProps.lua:146`, `:327-386`, `:1388-1398`)] A window that breaks is smashed and leaves nothing.

```
chance (percent) = (10 - skill level) x 7.5        most tools
                 = 25                              Wrench (no skill)
                 = 5 + (10 - skill level) x 5      windows
```

The roll is a whole number from 1 to 100 that must be at or below the chance. :cite[(`:350-362`)] It is 0 for admins and for any other case.

| Skill level | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Most objects | 75 | 67.5 | 60 | 52.5 | 45 | 37.5 | 30 | 22.5 | 15 | 7.5 | 0 |
| Windows | 55 | 50 | 45 | 40 | 35 | 30 | 25 | 20 | 15 | 10 | 5 |

(At a fractional chance the roll treats 7.5 as 7, so it is 7 percent in practice.) The skill is the tool group's skill from the table above: Carpentry for hammer, crowbar, cutter and screwdriver; Electrical for Electrician; Agriculture for Shovel; Welding for Metal.

**Rotating never breaks anything.** Rotating is done as a lift-and-put-down with the checks switched off. :cite[(`ISMoveableSpriteProps.lua:2881-2902`, the `_rotating` flag at `:1388`)]

### What is left when it breaks

For each line, the game picks a count from 0 to the maximum, then each unit has the listed chance. :cite[(`ISMoveableSpriteProps.lua:388-403`, `ISMoveableDefinitions.lua:322-341`)]

| Material | Debris | Max | Chance per unit |
|---|---|---|---|
| Wood | Plank | 3 | 20% |
| Wood | Nails | 1 | 10% |
| Log | Log | 3 | 15% |
| Steel, Plumbing, Electric | Screws | 3 | 10% |
| Fabric | Thread | 1 | 20% |
| Fabric | Ripped sheets | 3 | 10% |
| Fabric | Sheet | 1 | 1% |
| Leather | Thread | 1 | 20% |
| Leather | Leather strips | 3 | 10% |
| Natural | Twigs | 3 | 10% |
| Brick | Clay brick | 3 | 20% |

So a broken wooden object gives about 0.3 planks on average (an average of 1.5 units times 20%).

## Placing

A placed moveable is checked in `canPlaceMoveable`, and every rule in the table must pass. :cite[(`ISMoveableSpriteProps.lua:1616-1964`)]

| Rule | Detail | Code |
|---|---|---|
| Ground | There must be a floor (windows excepted), no water, and no vehicle on the square | `:1617-1619`, `:1738-1745` |
| Free tile | Normal furniture needs a free tile; a tile with a high object accepts only a low one and the reverse | `:1764-1771` |
| Table tops | A table-top object needs a table with no top on it and a stack height of at most 64 | `:1751-1758` |
| Stackable items | Stacked objects must stay within a total height of 96 | `:1772-1777` |
| Top of stairs | Never at the top of a staircase | `:1779-1781` |
| Wall objects | A matching wall must face the right way, and one object per wall per height | `:1782-1858` |
| Floors and rugs | Floor tiles go on the special bare-floor sprites; a rug must not go on another rug | `:1864-1890` |
| Window dressings | Need a window frame; not when you or the square are outside | `:1897-1915` |
| Windows | Only on a free window frame | `:1940-1945` |
| Multi-tile | You must hold or have on the floor within 3 squares (line 29) all the pieces, and no wall may sit between the parts | `:1621-1685`, `:29` |
| Tool and skill | The tile's `PlaceTool` and level, like pick-up | `:1958-1960` |

Placing takes the tool-group time, using the item's weight as above. :cite[(`:407-424`)] **No XP is given for picking up, placing or rotating.** A search for XP calls in the moveables files finds only scrapping. :cite[(`:3830`)]

### A placed piece of furniture becomes a thumpable

Furniture you set down is made as an `IsoThumpable`, so zombies can break it. :cite[(`ISMoveableSpriteProps.lua:2379-2388`)]

- Health = raw weight x a material factor: **Wood 1.5, Brick 2.25, Steel 3**, otherwise 1. :cite[(`ISMoveableSpriteProps.lua:322-325`, `ISMoveableDefinitions.lua:688-690`)] A default 50-raw-weight wooden object has 75.
- `thumpDmg` is set to 1, so a single zombie does a full point per thump (compare 8 for built walls, in [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies)).
- If you lift a built object and put it down again, its health, maximum health, locks, light and mod data come back with it. :cite[(`ISMoveableSpriteProps.lua:1306-1374`)]

## Rotating

Only objects whose tile has several faces and the type Object or Vegetation (and mannequins) can be rotated by hand. :cite[(`:2772-2788`)]

The rotate key cycles faces; Rotate mode does the lift-and-place without tool, skill or break roll. It fails if the object is a container with items in it, a seated chair, has something on the table top, or the new footprint is not free. :cite[(`:2800-2870`)]

## Scrapping: the Disassemble action

Scrapping destroys the object and gives parts.

It needs the tile's `CanScrap` property **and** a `Material` that has a scrap definition with at least one return item. :cite[(`ISMoveableSpriteProps.lua:104-124`, `:3851-3902`, `ISMoveableDefinitions.lua:172-181`)]

### What scrapping needs

Scrapping needs empty containers, the right tools and no blocking door or window, and it has no hard skill gate.

- **Empty containers**, no barricade on a door, no door sitting in a frame you are removing, no window in a frame you are removing, not a staircase top floor. :cite[(`:3905-3938`)]
- **Tools.** One or two tool slots per material (the table below). The blowtorch must have at least 10 percent fuel left. :cite[(`:3986-4014`)] Metal work also asks for a welding mask as the helper tool.
- **Skill.** Only through the chance below; scrapping has no hard skill gate.

### How much you get

Each return line makes a number of attempts, and each attempt succeeds by a chance that rises with your skill.

For each of the object's materials (up to three), every return line makes `maxAmount` attempts. Small objects halve the attempts (minimum 1); large ones double them; sandbags always give 3. :cite[(`:3350-3386`)] Each attempt succeeds with:

```
chance = lineChance x skillChance / 100
skillChance = 10 + 10 x skill level + material base chance     (kept between 0 and 100)
```

The chance and the skill part come from the scrap code. :cite[(`:3834-3849`, `:3354-3355`)]

At skill 0 a plain wood line of 90 percent gives 90 x 17 / 100 = 15.3 percent; at skill 10 it is 90 percent. If nothing comes back and the material has an "unusable" item, you get 1 or 2 of it. :cite[(`:3338-3343`)] Metal gives "unusable metal", wood "unusable wood". Admins always get 100 percent. :cite[(`:3835`)]

Parts land on the floor of the square, or in your inventory where the definition says so. :cite[(`:3779-3783`)]

### The scrap table

Base chance is added to the skill formula, and every line scales with the object's size as described above.

Tool 1 is the main tool and Tool 2 is a helper. Materials marked "no parts" have a definition but no return items, so they only add anything when another material of the same object does. :cite[(`media/lua/shared/Moveables/ISMoveableDefinitions.lua:388-544`)]

| Material | Tool 1 | Tool 2 | Skill | Base time | Base chance | Parts (max x line chance) |
|---|---|---|---|---|---|---|
| Wood | Hammer | Saw | Carpentry | 1000 | 7 | Plank 1x90. Unusable wood if none |
| Log | Hammer | Saw | Carpentry | 1000 | 7 | Log 2x90. Unusable wood if none |
| Nails | Hammer | none | Carpentry | 700 | 5 | Nails 2x80 |
| Screws | Hammer | none | Carpentry | 75 | 0 | Screws 2x50 |
| Steel | Screwdriver | none | Carpentry | 500 | 5 | Screws 2x50 |
| Door | Hammer | Screwdriver | Carpentry | 1000 | 10 | Doorknob 1x80, Hinge 2x80 |
| Brick | Hammer | none | Masonry | 75 | 0 | Clay brick 1x80 |
| Stone | Hammer | none | Strength | 1000 | 30 | Small stones (Stone2) 4x90 |
| Electric | Screwdriver | none | Electrical | 1000 | 10 | Electronics scrap 1x80, Electric wire 1x80 |
| Sandbag | none | none | Carpentry | 0 | 0 | Sandbag 3x100 |
| Sink | Hammer | none | Welding | 1000 | 1 | Metal pipe 2x80 |
| Plumbing | Blowtorch | Welding mask | Welding | 1000 | 1 | Metal pipe 2x80, Copper scrap 2x80 |
| Metal pipe | Blowtorch | Welding mask | Welding | 1000 | 4 | Metal pipe 2x80 |
| Metal bars | Blowtorch | Welding mask | Welding | 1000 | 0 | Metal bar, steel bar, half bar, quarter bar, chunk, piece: 1x70 each |
| Metal plates | Blowtorch | Welding mask | Welding | 1000 | 0 | Sheet metal, chunk, piece, nuts and bolts: 1x70 each. Unusable metal if none |
| Small metal plates | Blowtorch | Welding mask | Welding | 1000 | 2 | Small sheet metal 2x80; chunk, piece, nuts and bolts 1x70. Unusable metal if none |
| Metal plates and bars | Blowtorch | Welding mask | Welding | 1000 | 0 | Sheet metal, bar family, chunk, piece, nuts and bolts: 1x70 each. Unusable metal if none |
| Metal scrap | Blowtorch | Welding mask | Welding | 1000 | 5 | Scrap metal, chunk, piece: 1x70 each |
| Metal wire | Blowtorch | Welding mask | Welding | 1000 | 0 | Wire 1x70 |
| Fridge | Blowtorch | Welding mask | Welding | 1000 | 0 | Sheet metal 2x70; small sheet metal, chunk, piece, nuts and bolts, screws, electric wire, copper scrap 2x80 each. Unusable metal if none |
| Fabric, Foam, Glass, Leather, Mechanical, Mirror, Natural, Paper, Pipes, Plastic, Plastic bag, Plastic hard, Rubber, Transmission, Water container, Aluminum scrap | Hammer | none | Carpentry | 75 | 0 | no parts |

**Time.** `base time x (1 - 0.03 x skill level)`. :cite[(`ISMoveableSpriteProps.lua:4017-4032`)] For the tool-and-skill materials that is 1,000 at level 0 and 700 at level 10.

### XP for scrapping

Scrapping gives XP in the scrap skill only while your level is below a sandbox cap.

| Rule | Value | Code |
|---|---|---|
| XP given | 5 x size (small 1, medium 2, large 3), so 5, 10 or 15, in the scrap skill | `ISMoveableSpriteProps.lua:3812-3831` |
| When it is given | Only while your level in that skill is **below** the sandbox **Maximum Dismantling XP Level** (default **0**), or the skill is Electrical | `:3820-3821`, `api/sandbox_options.jsonl` line 41 |

The default of 0 means "below 0", which no one is. **With the default settings, scrapping gives XP only for Electrical.**

The option's own text says "at this level or above, scrapping does not provide XP; does not apply to Electrical". :cite[(`media/lua/shared/Translate/EN/Sandbox.json:945-946`)] Raise it to 10 for XP up to level 9. A server that wants Carpentry XP from dismantling must raise it.

## Dismantling something you built

Dismantling a built object follows one of two paths, depending on tile properties that this capture does not hold.

A built wall, door or stair is an `IsoThumpable` with a record of the materials that built it (the "need:" data, see [How building works](/pz/build-42/engine/building-and-moveables/how-building-works)). The two paths are in the table.

| Path | Used for | Tools | Time | Result | Code |
|---|---|---|---|---|---|
| Thumpable path | Built objects whose tile has neither `CanScrap` nor `IsMoveAble` (stairs, lamp pillars) | A saw **and** a screwdriver | `200 - 10 x Strength level` | For **each recorded material**, a random 1 to N of the N recorded, every time, with no skill roll | `ISMoveableSpriteProps.lua:33-47`, `:4205-4385` |
| Moveable path | Built objects whose tile has `CanScrap` (which tiles do is not verified) | The material's tools, from the table above | The material's time | The recorded materials replace the tile's parts. Each unit rolls at 80 percent times the skill chance. Door frames with a door in them, barricaded doors and windows in a frame being removed cannot be scrapped. No XP beyond the rule above | `:3705-3720`, `:3905-3938` |

On the thumpable path you get on average (N+1)/2 of each recorded material (1 to N, so all of a single item and 2.5 of 4 nails). On the moveable path each unit comes back at 80 percent x the skill chance: for a wood object that is 13.6 percent at skill 0 and 80 percent at skill 10. Compare destruction by zombies, which hands back about half in total ([Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies)).

## Multiplayer: which side does what

In multiplayer the server runs the real work and re-checks the tests, while the client shows the cursor and walks to the object.

| Step | Client | Server | Code |
|---|---|---|---|
| Cursor, info panel, red or green | Yes | No | |
| Walk to the object, equip the tool | Yes | No | `ISMoveableSpriteProps.lua:3070-3169` |
| The action bar and sound | Yes | Replays the timing | |
| `complete()`: lift, place, rotate, scrap, repair | Not on a remote client | Yes. The tests are run again here | `ISMoveablesAction.lua:236-255` |
| Safehouse check | Yes, on the client | Not found (see the warning) | `ISMoveablesAction.lua:51-65` |
| Removing and creating the world objects | Waits | Sends the changes to everyone | `ISMoveableSpriteProps.lua:1465-1480`, `:3736-3742` |

For scrapping from a world-object transaction there are also server-side handlers `Transactions.scrapMoveable` and `Transactions.placeMoveable`. :cite[(`media/lua/server/TransactionProcessor.lua:28-51`)]

> **Warning for server owners.** The moveables actions (pick up, place, rotate, repair and scrap) check safehouse permissions only on the client. :cite[(`media/lua/shared/Moveables/ISMoveablesAction.lua:51`)] I found no server-side safehouse test for them; the only server-side safehouse test I found is in the older build classes, which these actions do not use. :cite[(`media/lua/server/BuildingObjects/ISBuildUtil.lua:15`)] Add your own server-side safehouse check before you rely on safehouses to protect furniture.

## Where to go next

These pages cover repair, how building works, the numbers and making a tile a moveable.

- [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies) (repair, and what placed furniture is worth).
- [How building works](/pz/build-42/engine/building-and-moveables/how-building-works).
- [The numbers](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference) and [Modding building and moveables](/pz/build-42/engine/building-and-moveables/modding-building-and-moveables) (making a tile a moveable).
- [The tile system](/pz/build-42/modding/world-and-tiles/tile-system).

:::callout[How we know]{kind=proof}
The sources are code and scripts: `media/lua/shared/Moveables/ISMoveableSpriteProps.lua`, `ISMoveableDefinitions.lua`, `ISMoveablesAction.lua`, `ISMoveableTools.lua`, `media/lua/client/ISUI/ISDisassembleMenu.lua`, `media/lua/server/BuildingObjects/ISMoveableCursor.lua`, `zombie/inventory/types/Moveable.java` and `api/sandbox_options.jsonl`. Numbers are read from the scripts; none was measured in the game.

Not confirmed: per-object values (weight, tool, level, material, `CanBreak` and `CanScrap` for any given tile), because the tile definitions are outside the capture. The debug exporter writes a `MoveableTilesCSV.txt` with every moveable tile's name and weight if you need them. :cite[(`zombie/debug/DebugCSVExportMoveableTiles.java:19-62`)] The real-time length of the action units, which of the two dismantling paths a given built object takes, the inventory capacity formula behind "does it fit", and whether the server enforces safehouse rules for these actions are also not confirmed.
:::
