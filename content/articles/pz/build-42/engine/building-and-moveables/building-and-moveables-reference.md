---
id: build-42-building-and-moveables-reference
slug: building-and-moveables-reference
title: 'Building and moveables: the numbers'
game: pz
version: build-42
section: engine
category: building-and-moveables
difficulty: advanced
tags:
  - engine
  - building
  - moveables
  - reference
  - sandbox
  - health
excerpt: >-
  Every number from the building and moveables pages in tables, each with its capture citation: health, thump damage, timers, moveable tools, scrap chances, events and sandbox options.
last_updated: '2026-11-22'
related_articles:
  - how-building-works
  - built-objects-health-and-zombies
  - moveables-pick-up-place-and-scrap
  - building-recipes-by-skill
  - modding-building-and-moveables
  - built-object-health-table
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#1-building-constants) | [server owners](#7b-what-the-server-checks)

:::callout[The 1-minute version]{kind=key}
- This is the lookup page: each table repeats a number from one of the other pages and gives the line it comes from in its Code column.
- Nothing in it is per game minute or per game update, so the 90-minute day changes none of it. Where a unit's real length is not known it says so.
- A built object's health is `max(health, 0) + bonusHealth x multiplier + skillBaseHealth x skill level`, and the sandbox option `ConstructionBonusPoints` sets the multiplier (0.5 to 1.5, Normal is 1.0).
- The server does not check a build request against the recipe, the builder's skills and materials, distance or safehouse ownership, so servers should add their own server-side checks.
- Not confirmed: per-tile properties for any given moveable, thump events per second, and the real length of a timed-action unit.
:::

:::facts
- **Entity blocks** 219 in `media/scripts/generated/entities/`, 194 of them buildable objects with tiles
- **Health multiplier** 0.5 (Very Low) to 1.5 (Very High), default 1.0
- **Thump noise** world sound radius 20
- **Repair range** 20 percent to 95 percent of health
- **Multiplayer build time** `(200 - 5 x Carpentry level - 50 if Handy) x 20`; 150 instead of 200 for the grave-digging build; 1 if instant actions are on
:::

Citations use short paths: `zombie/...` is under the capture's `src/`, `media/...` under its `game_snapshot/`, `api/...` under the capture's `api/`.

## 1. Building: constants

Build recipes carry fixed constants for skill gates, build time, sound, wear and facing, listed here with where each is read.

| What | Value | Code |
|---|---|---|
| Entity blocks in `media/scripts/generated/entities/` | 219: 194 buildable objects with tiles, 8 wall coverings with a recipe and no tiles, 17 with no recipe (counted from the scripts) | |
| Recipes with a skill gate | 132 of the 194 objects (Carpentry 80, Welding 38, Masonry 14), plus Plaster Wall (Carpentry 6) among the coverings (counted from the scripts) | |
| Recipes that must be learned | 32, all metalwork (from the scripts) | `media/scripts/generated/items/literature.txt:5830`, `:5845`, `:5860` |
| Tag added to every entity recipe | `EntityRecipe` | `zombie/scripting/entity/components/crafting/CraftRecipeComponentScript.java:65` |
| Skill check | Every listed skill at its level; a learned recipe one level short is waived if the magazine is at hand and there is light | `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:367-382`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1491-1525` |
| `time` values in vanilla (202 recipes) | 10 (1, a debug piano), 50 (96), 80 (2), 100 (7), 150 (9), 200 (87) (from the scripts) | |
| Single-player build time | The recipe's `time`; Handy takes 50 off | `media/lua/server/BuildingObjects/ISBuildIsoEntity.lua:927`, `media/lua/client/BuildingObjects/TimedActions/ISBuildAction.lua:269-271` |
| Multiplayer build time | `(200 - 5 x Carpentry level - 50 if Handy) x 20`; 150 instead of 200 for the grave-digging build; 1 if instant actions are on; ignores the recipe `time` | `zombie/core/BuildAction.java:91-106`, grave case `:93-95`, instant `:97-99` |
| Unit length | If the x 20 means milliseconds, 200 is about 4 seconds (not verified) | |
| Skill-scaled recipe time (unused by building) | `time - 5 percent of time per level above the requirement` | `CraftRecipe.java:199-213` |
| Hammer sound radius | `ceil(20 x hammerSoundMod)`; saw 15; recipe crafting sound 15 | `ISBuildAction.lua:73-104` |
| Sound repeat | Every 6 units of `getTimestamp()` (`soundDelay = 6`); the unit is probably seconds, not verified | `ISBuildAction.lua:5-6`, `:76` |
| Body effort | "Heavy work" (client `setMetabolicTarget`) | `ISBuildAction.lua:106`, `BuildAction.java:109-113` |
| Stone hammer wear | Condition drops by one by chance each build | `BuildAction.java:116-121`, `ISBuildAction.lua:222-226` |
| Auto-rotate | A recipe flagged auto-rotate tries all 4 facings | `media/lua/server/BuildingObjects/ISBuildingObject.lua:149-164` |
| Face ids | N 0, W 1, S 2, E 3, `n_open` 4, `w_open` 5; `single` is 0 | `zombie/entity/components/spriteconfig/SpriteConfigManager.java:57-73` |
| Timed action scripts | `BuildWallHammer`: heavy-work metabolics, animation `Build`, completion sound `BuildWoodenStructureLarge`, muscle strain 0.0025 on Strength | `media/scripts/generated/timedactions.txt:829-837` |

### Timed actions used by build recipes

Each build recipe names one timed action, and the table shows how many recipes use each.

| `timedAction` | Recipes |
|---|---|
| BuildWallHammer | 36 |
| BuildWoodenStructureMedium | 31 |
| BuildWallNoTool | 25 |
| BuildWoodenStructureSmall | 16 |
| BuildLowNoTool | 14 |
| BuildWallMetal | 12 |
| BuildMetalStructureMedium | 11 |
| Paint | 8 |
| BuildCairn, Make_With_Brick | 6 each |
| BuildPoleFence, BuildLowHammer | 5 each |
| BuildByTyingHigh, BuildByTyingMedium, Make_With_Brick_Low, EmptyBag, BuildWireFence | 3 each |
| BuildMetalStructureSmall, BuildMetalStructureScrap, BuildPoleFenceSmall | 2 each |
| BuildByTyingLow, BuildCampfire, BuildSandbagWall, BuildLowMetal, BuildBarbedWireFence, none | 1 each |

## 2. Health of built objects

A built object's health comes from one formula in the Lua build file, scaled by a sandbox multiplier.

### The formula

The formula and the defaults it falls back on are listed here.

| Part | Value | Code |
|---|---|---|
| Formula | `max(health, 0) + bonusHealth x multiplier + skillBaseHealth x skill level` | `ISBuildIsoEntity.lua:666-677` |
| Skill level used | Highest level among the recipe's `SkillRequired` and `xpAward` skills; 0 if none (the null-skill call is not verified) | `CraftRecipe.java:1066-1110`, `ISBuildIsoEntity.lua:653-654` |
| `health` default | -1, counts as 0 | `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:35` |
| `skillBaseHealth` default | 20 on a normal load, 0 after a debug script reload | `SpriteConfigScript.java:36`, `:183` |
| Where the values are read | Values are read once per `face` block, so a `SpriteConfig` with no `face` reads none | `SpriteConfigScript.java:218-296` |
| Thumpable defaults | `maxHealth` 500, `health` 500, `thumpDmg` 8 | `zombie/iso/objects/IsoThumpable.java:107-113` |
| Door `thumpDmg` | 5 | `ISBuildIsoEntity.lua:634-636` |
| Builder default `thumpDmg` | 8 | `ISBuildingObject.lua:472` |
| Break sound default | `BreakObject`, else a per-sprite furniture sound | `IsoThumpable.java:101-102`, `:328-332`, `:2648-2699` |
| Health saved | Max health if not 500; health if not max; `thumpDmg` if not 8 | `IsoThumpable.java:623-645` |
| Old Carpentry health (not used by entity builds; still called by older legacy build classes such as `ISCompost.lua:32`, `ISDoubleDoor.lua:112`, `ISEmptyGraves.lua:80`) | `50 x Carpentry level`, +100 for Handy | `media/lua/server/BuildingObjects/ISBuildUtil.lua:39-52` |

### Sandbox multiplier (`ConstructionBonusPoints`)

The sandbox option `ConstructionBonusPoints` picks the multiplier applied to `bonusHealth`, and Normal (3) is the default.

| Value | Label | Multiplier |
|---|---|---|
| 1 | Very Low | 0.5 |
| 2 | Low | 0.7 |
| 3 (default) | Normal | 1.0 |
| 4 | High | 1.3 |
| 5 | Very High | 1.5 |

The multiplier, the option definition and its labels are each read from their own file. :cite[(`ISBuildIsoEntity.lua:670-674`, `api/sandbox_options.jsonl` line 19, `media/lua/shared/Translate/EN/Sandbox.json:667-671`)]

Six scripts set `bonusHealth`, and all of them set 400: the brick, stone and metal window frames and the sandbag wall. :cite[(`walls/entity_brick_windowframelvl1.txt:14`, `entity_brick_windowframelvl2.txt:14`, `entity_stone_windowframe.txt:15`, `entity_metal_windowframelvl1.txt:15`, `entity_metal_windowframelvl2.txt:15`, `outdoors/entity_sandbagwall.txt:14`)]

### Health of every build recipe

The per-recipe table has its own page: [Built object health table](/pz/build-42/engine/building-and-moveables/built-object-health-table).

## 3. Zombie damage to built objects

Zombies damage built objects, windows, doors and barricades by rules that differ per object type.

| What | Value | Code |
|---|---|---|
| Damage Construction option | `ZombieLore.ThumpOnConstruction`, default true; false stops all zombie damage to built objects | `IsoThumpable.java:1016`, `zombie/characters/IsoZombie.java:1328-1330`, `api/sandbox_options.jsonl` line 232 |
| Environmental Attacks option | `ZombieLore.ThumpNoChasing`, default false | `IsoZombie.java:1324-1325`, `api/sandbox_options.jsonl` line 231 |
| Damage per thump, many zombies | `near >= thumpDmg`: 1 x `thumpEventCount` (normally 1) | `IsoThumpable.java:1053-1056`, `:1054` |
| Damage per thump, few zombies | `near / thumpDmg` x `thumpEventCount`, fractions saved up | `IsoThumpable.java:1057-1063`, `:1058` |
| `near` | Every zombie within 1.5 squares of the thumper, counting it | `zombie/iso/IsoMovingObject.java:2363-2370` |
| Thump noise | World sound radius 20 | `IsoThumpable.java:1066-1068` |
| Thump frame | Door "bang" animation: one at 85 percent of the clip; "claw": two, at 23 and 73 percent | `media/AnimSets/zombie/thump/DoorBang.xml:12-16`, `DoorClaw.xml:8-15` |
| Clip length | In binary animation files (not verified) | |
| Zombie strength | Superhuman 5, Normal 3 (default option 2), Weak 1, Random 1-4 | `IsoZombie.java:3847-3861` |
| Glass pane health | single 50, double 100; damage = strength per thump | `zombie/iso/objects/IsoWindow.java:66-67`, `:147-151`, `:445-446` |
| Map door health | weak wooden 500, strong wooden 800, forced-locked 2,000, fence-type 100; damage = strength per thump, only with 2 or more zombies near; +2 x near on Superhuman | `zombie/iso/objects/IsoDoor.java:637-648`, `:1025-1033` |
| Barricade health | plank 1,000 each (4 slots), metal bars 3,000 as the constant (a bar added from an item starts at its condition fraction x 5,000, then scaled by the placer's metal-barricade strength modifier), metal sheet 5,000, damaged sheet 2,500 | `zombie/iso/objects/IsoBarricade.java:61-64`, `:164-170` |
| Barricade damage from a zombie | strength per thump | `IsoBarricade.java:356` |
| Barricade damage from a weapon | `DoorDamage x 5` | `IsoBarricade.java:429` |
| Built object damage from a weapon | `DoorDamage` | `IsoThumpable.java:1184` |
| Animal hit | `1000 x damage rating` | `IsoThumpable.java:2778-2783` |
| Stress sound from thumping | 15 for built objects, 25 for other objects; 7 or 0 for tall fences | `zombie/iso/IsoObject.java:5736-5745` |
| Map fence rule (not built fences) | Zombies to damage: default 50; multiplier default 1.0 | `zombie/iso/BentFences.java:885-889`; `api/sandbox_options.jsonl` lines 137-138 |
| Fire | Swaps the object for a burnt tile; health is ignored | `zombie/iso/IsoGridSquare.java:6297-6309`, `:6460-6481` |

### Damage per round

A pile of zombies within 1.5 squares of an object deals more damage per round the more zombies are packed in.

| Zombies packed within 1.5 squares | Damage per thump (thumpDmg 8) | Whole pile per round (8) | Whole pile per round, doors (thumpDmg 5) |
|---|---|---|---|
| 1 | 0.125 | 0.125 | 0.2 |
| 2 | 0.25 | 0.5 | 0.8 |
| 3 | 0.375 | 1.125 | 1.8 |
| 4 | 0.5 | 2 | 3.2 |
| 5 | 0.625 | 3.125 | 5 |
| 6 | 0.75 | 4.5 | 6 |
| 7 | 0.875 | 6.125 | 7 |
| 8 or more | 1 | N | N |

### Player weapon `DoorDamage`

A player's weapon sets how much damage it does to a door or built object through its `DoorDamage` value. In the Code column the numbers are line numbers in `media/scripts/generated/items/weapon.txt`.

| Weapon | DoorDamage | Code |
|---|---|---|
| Screwdriver | 1 | 18902 |
| Hammer (stone) | 2 | 3059 |
| Baseball bat, Plank | 5 | 6997, 9269 |
| Crowbar, Katana | 8 | 7887, 14290 |
| Hammer | 9 | 2955 |
| Wrench, pipe wrench, machete | 10 | 6042, 4383, 14391 |
| Hand axe | 20 | 6221 |
| Axe | 35 | 10121 |
| Sledgehammer | 40 | 13808 |
| Wood axe | 55 | 14021 |

### Materials back from a destroyed object

Half of each recorded material unit is lost and half is dropped when a built object is destroyed.

| What | Rule | Code |
|---|---|---|
| Each recorded unit | 50 percent lost, 50 percent dropped (to the breaker's inventory if a player, else the floor) | `ISBuildingObject.lua:51-61` |
| Recorded inputs | Every input that is not a tool and not `DontRecordInput` | `zombie/scripting/entity/components/crafting/InputScript.java:1154-1163`; `ISBuildingObject.lua:357-372` |
| Event | `OnDestroyIsoThumpable(thumpable, nil)` | `IsoThumpable.java:1213`, `:1616`; `ISBuildingObject.lua:743` |

## 4. Repair

Repair works on objects between 20 percent and 95 percent health, with a skill-based chance, a timer and parts that depend on the material.

| Rule | Value | Code |
|---|---|---|
| Allowed range | 20 percent to 95 percent of health | `media/lua/shared/Moveables/ISMoveableSpriteProps.lua:4138-4144` |
| Chance | `10 + 10 x skill level + base chance`, clamped 1 to 100; 100 for objects whose tile lacks `CanScrap` | `:4387-4407` |
| Time | `base time x (1 - 0.03 x level)` | `:4509-4523` |
| Result | Full health | `:3556-3565` |
| Required part amount | `floor(max(amount x damage, 1))` x tiles | `:840-873` |
| Parts used | Before the roll | `:3543-3568`, `:3574-3598` |

The repair definitions per material are in the table below. :cite[(`media/lua/shared/Moveables/ISMoveableDefinitions.lua:552-669`)] "Part" lists required parts first (R), then optional parts (any one of).

| Material | Tool 1 | Tool 2 | Skill | Base time | Base chance | Parts |
|---|---|---|---|---|---|---|
| Door | Hammer | Screwdriver | Carpentry | 1000 | 10 | R: plank 3; doorknob 1 and hinge 2 only when the damage is 0.5 or more. Any: nails 4 or screws 4 |
| Fabric | Sewing needle | none | Carpentry | 75 | 0 | R: thread 4. Any: sheet 1, ripped sheets 4 |
| Leather | Hammer | none | Carpentry | 75 | 0 | R: sewing needle 1, thread 4. Any: leather strips 4 |
| Metal bars | Blowtorch | Welding mask | Welding | 1000 | 0 | Any: metal bar 1, steel bar 1, half 2, quarter 4, chunk 4, piece 8 |
| Metal pipe | Blowtorch | Welding mask | Welding | 1000 | 4 | Any: metal pipe 2 |
| Metal plates | Blowtorch | Welding mask | Welding | 1000 | 0 | R: nuts and bolts 1. Any: sheet metal 2, chunk 4, piece 8 |
| Small metal plates | Blowtorch | Welding mask | Welding | 1000 | 2 | R: nuts and bolts 1. Any: sheet metal 1, small sheet 2, chunk 4, piece 8 |
| Metal plates and bars | Blowtorch | Welding mask | Welding | 1000 | 0 | R: nuts and bolts 1. Any: sheet metal 1, metal bar 1, steel bar 1, half 2, quarter 4, chunk 4, piece 8 |
| Metal scrap | Blowtorch | Welding mask | Welding | 1000 | 5 | Any: scrap metal 1, chunk 4, piece 8 |
| Metal wire | Blowtorch | Welding mask | Welding | 1000 | 0 | R: wire 1 |
| Nails | Hammer | none | Carpentry | 700 | 5 | Any: nails 2, screws 2 |
| Pipes | Hammer | none | Carpentry | 75 | 0 | R: metal pipe 2. Any: copper scrap 2 |
| Plumbing | Blowtorch | Welding mask | Welding | 1000 | 1 | R: metal pipe 2, copper scrap 2 |
| Sandbag | none | none | Carpentry | 0 | 0 | R: sandbag 3 |
| Screws | Hammer | none | Carpentry | 75 | 0 | Any: nuts and bolts 2, screws 2 |
| Sink | Hammer | none | Welding | 1000 | 1 | Any: metal pipe 2 |
| Water container | Hammer | none | Carpentry | 75 | 0 | R: plank 2. Any: nails 4, screws 4 |
| Wood | Hammer | Saw | Carpentry | 1000 | 7 | R: plank 2. Any: nails 4, screws 4 |
| Log | Hammer | Saw | Carpentry | 1000 | 7 | R: log 2. Any: nails 4, screws 2, ripped sheets 4, sheet 2, rope 2 |

## 5. Moveables

Moveables are picked up, placed, rotated, broken and scrapped with tool groups, material definitions and fixed formulas.

### Tool groups

Each tool group lists the items it accepts, the skill it uses, a base time and a sound. :cite[(`ISMoveableDefinitions.lua:311-318`)]

| Group | Accepts | Skill | Base time | Sound |
|---|---|---|---|---|
| Hammer | hammer tag | Carpentry | 75 | Hammering |
| Crowbar | crowbar tag, crowbar | Carpentry | 150 | Hammering |
| Electrician | Screwdriver | Electrical | 100 | Dismantle |
| Cutter | sharp-knife and scissors tags, kitchen knife, scissors, hunting knife, sharpened stone | Carpentry | 50 | Hammering |
| Shovel | shovel (dig-and-plow tag) | Agriculture | 100 | bushes |
| Wrench | wrench, pipe wrench | none | 100 | RepairWithWrench |
| Metal | Screwdriver | Welding | 100 | Hammering |
| Screwdriver | Screwdriver | Carpentry | 100 | Dismantle |

### Pick-up, place, rotate

Pick-up and place time scale with the object's weight and the player's skill level.

| What | Value | Code |
|---|---|---|
| Weight | `PickUpWeight / 10` | `ISMoveableSpriteProps.lua:148-149`, `zombie/inventory/types/Moveable.java:131-139` |
| Default weight | Lua 5 (raw 50); Java 1 | `ISMoveableSpriteProps.lua:148`, `Moveable.java:132-136` |
| Pick-up and place time | `(base + 2 x raw weight) x (1 - 0.05 x level)`; windows x3; 100 if no tool | `ISMoveableSpriteProps.lua:407-424` |
| Rotate time | 50 | `media/lua/shared/Moveables/ISMoveablesAction.lua:268` |
| Instant or cheat | 1 | `ISMoveablesAction.lua:257-260` |
| Break chance | `(10 - level) x 7.5`; no-skill tool (Wrench) 25; windows `5 + (10 - level) x 5` | `ISMoveableSpriteProps.lua:327-347` |
| Break roll | `ZombRand(1, 101) <= chance` | `:350-362` |
| Rotate | No tool, no skill, no break | `:2881-2902`, `:1388` |
| Stack height | Table top on a table: at most 64 before; stackable on table: total at most 96 | `:1751-1777` |
| Multi-tile floor radius | 3 squares | `:29`, `:1583`, `:1656` |
| Placed furniture health | `raw weight x material factor` (Wood 1.5, Brick 2.25, Steel 3, else 1) | `ISMoveableSpriteProps.lua:322-325`, `:2381`; `ISMoveableDefinitions.lua:688-690` |
| Placed furniture `thumpDmg` | 1 | `ISMoveableSpriteProps.lua:2383` |
| Info kept through lift and place | health, max health, thump sound, color, light, padlock and code, mod data | `:1306-1374` |

### Break debris

When a moveable breaks, each material can drop the items listed here. :cite[(`ISMoveableDefinitions.lua:322-341`)]

| Material | Item | Max | Chance |
|---|---|---|---|
| Wood | Plank | 3 | 20 |
| Wood | Nails | 1 | 10 |
| Log | Log | 3 | 15 |
| Steel | Screws | 3 | 10 |
| Plumbing | Screws | 3 | 10 |
| Electric | Screws | 3 | 10 |
| Fabric | Thread | 1 | 20 |
| Fabric | Ripped sheets | 3 | 10 |
| Fabric | Sheet | 1 | 1 |
| Leather | Thread | 1 | 20 |
| Leather | Leather strips | 3 | 10 |
| Natural | Twigs | 3 | 10 |
| Brick | Clay brick | 3 | 20 |

### Scrap definitions

Each material has a scrap definition with tools, a skill, a base time, a base chance and the parts it returns. :cite[(`ISMoveableDefinitions.lua:388-544`)]

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

The scrap rules that apply to every definition are in a second table.

| Scrap rule | Value | Code |
|---|---|---|
| Per-attempt chance | `lineChance x skillChance / 100` | `ISMoveableSpriteProps.lua:3354-3355` |
| `skillChance` | `10 + 10 x level + base chance`, clamped 0 to 100; admins 100 | `:3834-3849` |
| Attempts per line | `maxAmount`; Small halves (min 1), Large doubles; sandbags always 3 | `:3356-3371` |
| Unusable item | 1 or 2, when nothing came back | `:3338-3343` |
| Blowtorch fuel needed | at least 0.1 uses | `:3997-4003` |
| Time | `base time x (1 - 0.03 x level)`; 100 if no definition | `:4017-4032` |
| Thumpable-path time | `200 - 10 x Strength level` | `:4307-4309` |
| Thumpable-path return | random 1 to N of each recorded material | `:4337-4341` |
| Moveable-path return from "need:" | line chance 80 per unit | `:3705-3720` |
| Default scrap tool uses | Small 3, Medium 5, Large 10, or `ScrapToolUseOverride` | `:109-120` |
| XP | `5 x (Small 1, Medium 2, Large 3)` when level is below the cutoff, or Electrical | `:3812-3831` |
| XP cutoff | `LevelForDismantleXPCutoff`, default 0, range 0 to 10 | `api/sandbox_options.jsonl` line 41 |

### Tile properties the Lua reads

The moveable Lua reads these tile properties, and the line numbers in the Code column are in `ISMoveableSpriteProps.lua` unless a file is named. :cite[(`ISMoveableSpriteProps.lua:71-209`)]

| Property | Meaning | Code |
|---|---|---|
| `IsMoveAble` | The tile is a moveable | `:130`, `Moveable.java:131` |
| `MoveType` | Object, WallObject, WindowObject, Window, FloorTile, FloorRug, Vegitation, WallOverlay | `:143`, `zombie/inventory/types/Moveable.java:206-221` |
| `PickUpTool`, `PlaceTool` | A tool group name, or `None` | `:144-145` |
| `PickUpLevel` | Minimum level in the tool's skill | `:147` |
| `PickUpWeight` | Raw weight, 10 per weight unit | `:148` |
| `CanBreak` | Lifting may break it; needs a pick-up tool | `:146` |
| `CanScrap`, `ScrapSize`, `ScrapToolUseOverride` | Scrappable, Small/Medium/Large, tool uses | `:104-124` |
| `ScrapUseTool`, `ScrapUseSkill` | Inverted: when the tile has the property the tool or skill check is skipped | `:107-108` |
| `Material`, `Material2`, `Material3` | Scrap, repair and health material names | `:99-101` |
| `IsTable`, `IsTableTop`, `IsStackable`, `Surface`, `IsSurfaceOffset` | Table stacking | `:94-96`, `:126-127` |
| `IsHigh`, `IsLow`, `BlocksPlacement`, `FitsBeneathCountertop` | Placement collisions | `:91-97` |
| `IsWaterCollector` | Cannot be lifted while holding fluid | `:98` |
| `Facing`, `IsoType`, `GroupName`, `CustomName`, `CustomItem` | Face, object class, name parts, bound item | `:132-142` |
| `ForceSingleItem` | One item for a multi-tile object | `:193` |
| `IsClosedState`, `Noffset`, `Soffset`, `Woffset`, `Eoffset`, `LinkedOffset`, `LinkedLocIs` | Door and window offsets | `:150-156` |
| `WallOverlay`, `IgnoreSurfaceSnap`, `IsGridExtensionTile`, `WallObjectAllowDoorframe` | Wall and grid special cases | `:157-160` |
| `ThumpSound` | The sound a thumpable makes when hit | `zombie/iso/objects/IsoThumpable.java:2541-2547` |

## 6. Sandbox options in this area

These sandbox options change how building, zombie damage and fire behave. In the Code column, "line N" is a line in `api/sandbox_options.jsonl`.

| Option | Type | Default | Range | Code |
|---|---|---|---|---|
| `ConstructionBonusPoints` | enum | 3 | 1 to 5 | line 19; `zombie/SandboxOptions.java:157` |
| `LevelForDismantleXPCutoff` | integer | 0 | 0 to 10 | line 41; `SandboxOptions.java:231` |
| `ConstructionPreventsLootRespawn` | boolean | true | | line 85; `SandboxOptions.java:138`; `zombie/LootRespawn.java:110` |
| `ZombieLore.ThumpOnConstruction` | boolean | true | | line 232; `SandboxOptions.java:2113` |
| `ZombieLore.ThumpNoChasing` | boolean | false | | line 231; `SandboxOptions.java:2112` |
| `ZombieLore.Strength` | enum | 2 | 1 to 4 | line 219; `SandboxOptions.java:2099` |
| `ZombieLore.Cognition` | enum | 3 | 1 to 4 | line 224; `SandboxOptions.java:2104` |
| `ZombieLore.FenceThumpersRequired` | integer | 50 | -1 to 100 | line 137; `SandboxOptions.java:2125` |
| `ZombieLore.FenceDamageMultiplier` | double | 1.0 | 0.01 to 100 | line 138; `SandboxOptions.java:2126` |
| `FireSpread` | boolean | true | | line 195; `SandboxOptions.java:169` |

The server options for safehouse fire and loot (`SafehouseAllowFire`, `SafehouseAllowLoot`) are defined in the server options class. :cite[(`zombie/network/ServerOptions.java:93-94`)]

## 7. Events

Building and moveables fire a small set of events, and the table shows where each is fired and which vanilla Lua listens.

| Event | Arguments | Fired from | Vanilla Lua listeners |
|---|---|---|---|
| `OnDestroyIsoThumpable` | thumpable, nil | `IsoThumpable.java:1213`, `:1616` | `ISBuildingObject.lua:743`, `media/lua/server/Map/SGlobalObjectSystem.lua:273` |
| `OnWeaponHitThumpable` | owner, weapon, object | `IsoThumpable.java:1183` and four other classes | none |
| `OnProcessAction` | `"build"`, player, arguments | `zombie/core/BuildAction.java:123` | `media/lua/shared/ActionManager.lua:51` |
| `OnProcessTransaction` | name, player, item, source, destination, arguments | `zombie/core/Transaction.java:145-208` | `media/lua/server/TransactionProcessor.lua:74` |
| `OnObjectAdded` | object | `zombie/network/packets/AddItemToMapPacket.java:101` and several Lua calls | `SGlobalObjectSystem.lua:274` |
| `OnObjectAboutToBeRemoved` | object | `zombie/iso/IsoGridSquare.java:5739`, `RemoveItemFromSquarePacket.java:158`, moveables Lua `:1449`, `:1491`, `:1494`, `:1520` | `SGlobalObjectSystem.lua:275` |
| `OnTileObjectAdded` | square, sprite name | `zombie/network/packets/AddObjectToMapPacket.java:69` | `media/lua/server/BuildingObjects/ISBrushToolTileCursor.lua:48` |
| `OnDoTileBuilding2`, `OnDoTileBuilding3` | cursor, render flag, x, y, z, square | `zombie/iso/IsoCell.java:2619` | `ISBuildingObject.lua:740-741` |
| `OnIsoThumpableLoad`, `OnIsoThumpableSave` | none | never fired | none |

The events are defined in the events list. :cite[(`api/events.jsonl` lines 61, 98-99, 137-138, 172-173, 226, 236, 65-67)]

## 7b. What the server checks

The table lists what the server checks for each kind of request.

| Request | What the server checks | Code |
|---|---|---|
| A build request | Nothing against the recipe, the builder's skills and materials, distance or safehouse ownership before it builds. The vanilla validity check has no callers | `zombie/core/BuildAction.java:79-83`, `:139-156` |
| A change to a built object's lock data | Nothing about who makes the change; nothing is logged | `zombie/network/packets/SyncThumpablePacket.java:78-82` |
| Zombie hits on built objects | That a zombie the sender owns is near the object; no limit on how often | `zombie/network/packets/hit/ZombieHitThumpablePacket.java:34-36`, `:76` |
| Safehouse for builds and moveables | Client side only for entity builds and moveable actions; a server-side test exists only in the older build classes | `ISBuildIsoEntity.lua:457`, `ISMoveablesAction.lua:51`, `ISBuildUtil.lua:15` |

Servers should add their own server-side checks for each row.

## Where to go next

The other building pages go deeper on each area.

- [Built object health table](/pz/build-42/engine/building-and-moveables/built-object-health-table): every buildable object's health.
- [How building works](/pz/build-42/engine/building-and-moveables/how-building-works), [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies), [Moveables](/pz/build-42/engine/building-and-moveables/moveables-pick-up-place-and-scrap), [Recipes by skill](/pz/build-42/engine/building-and-moveables/building-recipes-by-skill) and [Modding building and moveables](/pz/build-42/engine/building-and-moveables/modding-building-and-moveables).

:::callout[How we know]{kind=proof}
Each cell cites the file and line of its source, and the sources are code and scripts. The per-recipe health table was computed by script from the scripts in `media/scripts/generated/entities/`, with the formula in the Lua build file. :cite[(`ISBuildIsoEntity.lua:666-677`)]

Not confirmed: per-tile properties (weight, tool, material, `CanScrap`) for any given moveable, because the tile definitions are not in the capture. Thump events per second and the real length of a timed-action unit are also not known. The behavior of `getPerkLevel` with a null skill is not verified. :cite[(`ISBuildIsoEntity.lua:653-654`)]
:::
