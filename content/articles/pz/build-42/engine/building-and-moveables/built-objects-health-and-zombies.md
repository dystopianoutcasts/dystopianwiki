---
id: build-42-built-objects-health-and-zombies
slug: built-objects-health-and-zombies
title: 'Built objects: health, zombies and damage'
game: pz
version: build-42
section: engine
category: building-and-moveables
difficulty: intermediate
tags:
  - engine
  - building
  - thumpable
  - zombies
  - health
  - repair
  - multiplayer
excerpt: >-
  How many hit points built walls, doors and furniture get, how zombies thump them down (one zombie barely scratches a wall), what comes back when one breaks, plus repair, fire and vehicles.
last_updated: '2026-11-22'
related_articles:
  - how-building-works
  - moveables-pick-up-place-and-scrap
  - building-recipes-by-skill
  - building-and-moveables-reference
  - modding-building-and-moveables
  - built-object-health-table
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [players](#how-a-zombie-takes-health-away) | [server owners](#server-owners-two-warnings) | [modders](#how-a-built-object-gets-its-health)

:::callout[The 1-minute version]{kind=key}
- **Doors are strong, walls are modest.** A door gets 300 per skill level and no base. At Carpentry 10 that is 3,000; a Lvl3 wall at Carpentry 10 is 850.
- **One zombie hardly hurts a wall.** A zombie does 1/8 of a point per thump on its own, 1/5 on a door. Damage ramps up as zombies crowd together and stops growing at 8 (5 for doors).
- A built object's health is fixed when you finish building, so later skill gains do not change it.
- The **Player-built Construction Strength** option affects only 6 recipes in vanilla.
- Fire ignores health and swaps the object for a burnt tile where the tile has one, and what happens depends on the tile. Vehicles do no damage that I could find (not verified beyond the Java).
- For modders: a built wall, door, fence or table is an `IsoThumpable` object with a maximum health set the moment you finish it. Health is a base value from the recipe plus a per-skill-level value x your level plus (a few recipes only) a bonus the sandbox option scales. :cite[(`zombie/iso/objects/IsoThumpable.java:107-108`, `media/lua/server/BuildingObjects/ISBuildIsoEntity.lua:666-677`)]
:::

:::facts
- **Door at Carpentry 10** 3,000 health (Normal strength)
- **Lvl3 wall at Carpentry 10** 850 health (Normal strength)
- **One zombie alone** 1/8 of a point per thump on a wall, 1/5 on a door
- **Pile size that stops adding damage** 8 zombies (5 for doors)
- **Thump noise** every thump adds a world sound of radius 20
- **Repair allowed** at 20 percent to 95 percent of health
:::

Outcast, a wall you built has a number on it: its hit points. Zombies take that number down a little with every thump, and when it reaches zero the wall is gone. This page says where the number comes from, how zombies take it away, and what you can do about it. The big surprises are near the top of each section.

Citations use short paths: `zombie/...` is under the capture's `src/`, `media/...` under its `game_snapshot/`. Nothing here is counted per game minute or per game update, so the 90-minute day does not change any number below. The numbers that depend on how fast a zombie swings are marked "not verified".

## How a built object gets its health

A built object's maximum health is worked out once, when you finish building, from the recipe's numbers, your skill and one sandbox option.

When `ISBuildIsoEntity:setInfo` makes the object it computes this. :cite[(`ISBuildIsoEntity.lua:652-677`)]

```
max health = baseHealth + bonusHealth x (sandbox multiplier) + skillLevel x skillBaseHealth
```

| Part | Where it comes from | Value | Code |
|---|---|---|---|
| `baseHealth` | `health =` in the recipe's `SpriteConfig`; `-1` or missing counts as 0 | 50 to 800 in vanilla when set | `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:35`, `:241-242` |
| `skillBaseHealth` | `skillBaseHealth =` in the recipe | 10 to 400 in vanilla. If the script omits it, the field starts at **20**. A script reload in debug resets it to 0 | `SpriteConfigScript.java:36`, `:183` |
| `skillLevel` | Your **highest** level among the recipe's required skills **and** its XP-award skills, read at the moment of building | 0 to 10 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1066-1110` |
| `bonusHealth` | `bonusHealth =` in the recipe | Only 6 recipes set it, all 400 (see below) | |
| Sandbox multiplier | **Player-built Construction Strength** (`ConstructionBonusPoints`) | x0.5, x0.7, x1.0, x1.3, x1.5 | `ISBuildIsoEntity.lua:670-674` |

The health is **fixed when you finish building**. Later skill gains do not change it. A health value is saved with the object. :cite[(`IsoThumpable.java:623-628`)]

Two things from the old system are gone:

- **The Handy trait no longer adds health to entity builds.** The old "+100 health for Handy, +50 per Carpentry level" function `buildUtil.getWoodHealth` still exists :cite[(`media/lua/server/BuildingObjects/ISBuildUtil.lua:39-52`)], and `ISBuildIsoEntity:getHealth` still calls it :cite[(`ISBuildIsoEntity.lua:38-44`)], but the entity build path never calls `getHealth`; it uses the formula above. Older "legacy" build classes still add it :cite[(`ISCompost.lua:32`, `ISDoubleDoor.lua:112`, `ISDoubleTileFurniture.lua:106`, `ISEmptyGraves.lua:80`, `ISLightSource.lua:67`, `ISSimpleFurniture.lua:49`)] (and the wooden container, door, door frame, stairs and wall classes in the same folder). Whether any of them is still reachable in play is not verified. (Handy still takes 50 off the build time, see [How building works](/pz/build-42/engine/building-and-moveables/how-building-works).)
- **The Construction Strength option is almost empty.** It multiplies only `bonusHealth`, and only six vanilla scripts set that: the brick, stone and metal window frames, plus the sandbag wall (400 each) (scripts below). Everything else ignores the option. At "Very High" those six gain +200 over Normal; at "Very Low" they lose 200. Nothing else changes.

| Option value | Multiplier | Bonus on the six recipes |
|---|---|---|
| 1 Very Low | x0.5 | 200 |
| 2 Low | x0.7 | 280 |
| 3 Normal (default) | x1.0 | 400 |
| 4 High | x1.3 | 520 |
| 5 Very High | x1.5 | 600 |

The multipliers, the option labels and the default of 3 each come from their own file. :cite[(`ISBuildIsoEntity.lua:671-674`, `media/lua/shared/Translate/EN/Sandbox.json:667-671`, `api/sandbox_options.jsonl` line 19)]

The six scripts are `entity_brick_windowframelvl1.txt`, `entity_brick_windowframelvl2.txt`, `entity_stone_windowframe.txt`, `entity_metal_windowframelvl1.txt` and `entity_metal_windowframelvl2.txt`, which set the bonus on line 14 or 15 of each, and `entity_sandbagwall.txt`, which sets it on line 14. :cite[(`entity_sandbagwall.txt:14`)]

### What that gives you, by material

At Normal strength, a door gets far more health than a wall of the same tier.

Worked examples: a Lvl3 wooden wall built at Carpentry 6 has 770 health; a Lvl2 wall would have 670. A wooden door built at Carpentry 7 has 2,100, and at Carpentry 10 it has 3,000. A table built at Carpentry 1 has 20.

The full tables, one row for every one of the 194 buildable objects with the health at the needed level and at level 10, are on their own page: [Built object health table](/pz/build-42/engine/building-and-moveables/built-object-health-table).

## Who zombies will attack

A zombie hits a built object when it is walking toward you, or toward a sound, and the object blocks the path.

The rules are in the table.

| Rule | Effect | Code |
|---|---|---|
| **Damage Construction** (`ZombieLore.ThumpOnConstruction`, default on) | If off, a zombie never starts thumping a built object, and `Thump` does nothing to it, so zombies cannot damage built objects at all | `zombie/characters/IsoZombie.java:1328-1330`, `zombie/iso/objects/IsoThumpable.java:1016`, `api/sandbox_options.jsonl` line 232 |
| **Environmental Attacks** (`ZombieLore.ThumpNoChasing`, default off) | Off: a zombie with no target and no sound to chase ignores obstacles. On: wandering zombies thump them too | `IsoZombie.java:1324-1325`, `Sandbox.json:600-603` |
| Door-using zombies | With the **Zombie cognition** setting at "Navigate and Use Doors" (value 1; the default is 3), a zombie opens an unlocked, closed built door instead of hitting it | `IsoThumpable.java:1030-1034` |
| Open doors, built windows | An open built door and a built window object are not thumped directly; a barricade on either side takes the hit first | `IsoThumpable.java:1116-1149` |
| Low fences | A hoppable fence is not thumped by upright zombies; crawlers can break it | `IsoThumpable.java:1129-1148` |
| Barricades | The barricade on the zombie's side (or the far side) is thumped before the object behind it; see [Barricades and locks in vanilla](/pz/build-42/modding/world-and-tiles/barricades-and-locks-in-vanilla) | `IsoThumpable.java:1117-1126` |

## How a zombie takes health away

Each thump takes a fraction of a point off a built object, and the fraction grows when more zombies stand close.

A thumping zombie's animation reaches its "thump frame", and the engine calls `Thump` on the target. :cite[(`zombie/ai/states/ThumpState.java:99-117`)] For a built object the damage is as follows. :cite[(`IsoThumpable.java:1049-1063`)]

```
near = the number of zombies within 1.5 squares of the thumper (counting itself)
if near >= thumpDmg:  damage = 1 x thumpEventCount
else:                 damage = near / thumpDmg x thumpEventCount   (fractions are saved up until they reach 1)
```

`thumpEventCount` is how many thump frames the animation passed since the last call, normally 1. :cite[(`IsoThumpable.java:1054`, `:1058`)] The one-argument `Thump` passes 1. :cite[(`zombie/iso/objects/interfaces/Thumpable.java:18`)]

`thumpDmg` is **8** for almost everything and **5** for doors. :cite[(`IsoThumpable.java:113`, `ISBuildIsoEntity.lua:634-636`, `ISBuildingObject.lua:472`)] The count of "near" zombies is every zombie in the cell, not only those thumping. :cite[(`zombie/iso/IsoMovingObject.java:2363-2370`)]

That makes the damage per **round** (one thump from every zombie in the pile) grow like a square until the pile is big enough:

| Zombies packed together | Damage per zombie per thump (walls and others) | Damage per round, whole pile | Per round, doors |
|---|---|---|---|
| 1 | 0.125 | 0.125 | 0.2 |
| 2 | 0.25 | 0.5 | 0.8 |
| 3 | 0.375 | 1.1 | 1.8 |
| 4 | 0.5 | 2 | 3.2 |
| 5 | 0.625 | 3.1 | 5 |
| 6 | 0.75 | 4.5 | 6 |
| 8 | 1 | 8 | 8 |
| 12 | 1 | 12 | 12 |

(Computed from the rule above; the door column uses `thumpDmg` 5.)

What that means in play, using the health tables:

| Target | Health | One zombie | 4 zombies | 8 or more |
|---|---|---|---|---|
| Lvl2 wall built at Carpentry 6 | 670 | 5,360 thumps | 335 rounds | 84 rounds |
| Lvl3 door built at Carpentry 7 | 2,100 | 10,500 thumps | 657 rounds | 263 rounds |
| Metal wall Lvl2 built at Welding 5 | 900 | 7,200 thumps | 450 rounds | 113 rounds |

**How fast is a round?** It depends on the zombie's thump animation, which has one thump (the "bang" animation) or two (the "claw" animation) per loop. :cite[(`media/AnimSets/zombie/thump/DoorBang.xml:12-16`, `DoorClaw.xml:8-15`)] The clip lengths are inside binary animation files that the capture's text files do not contain, so the time per thump is **not verified**. Count rounds, not seconds.

Noise: every thump adds a world sound of radius 20 to attract more zombies. :cite[(`IsoThumpable.java:1066-1068`)] A siege draws a bigger crowd, which hits harder because of the table above.

### Windows, glass doors and map doors are different

Windows, glass doors and map doors are not `IsoThumpable` and follow their own numbers.

A glass pane made by the Wooden Windows recipe (4 glass panels, Carpentry 5) has 50 health (single) or 100 (double) and takes **the zombie's strength** per thump. Map doors have 500, 800 or 2,000 and take strength per thump, and only once 2 or more zombies are close. :cite[(`zombie/iso/objects/IsoWindow.java:66-67`, `:147-151`, `:445-446`, `IsoDoor.java:637-648`, `:1025-1033`)]

Zombie strength is 5 (Superhuman), **3 (Normal, default)**, 1 (Weak) or random 1 to 4. :cite[(`IsoZombie.java:3847-3861`, `api/sandbox_options.jsonl` line 219)] So a Normal zombie breaks a 50-health pane in 17 thumps, alone. This is why barricading the window matters.

Vanilla map fences use yet another rule, tuned by two sandbox options. **Zombies To Damage Fences** (default 50) and **Fence Damage Multiplier** (default 1.0) apply only to the tall fences that came with the map, not to fences you built. :cite[(`zombie/iso/BentFences.java:885-889`, `zombie/iso/IsoObject.java:5749-5800`)]

## When a built object breaks

When a built object's health reaches 0 it breaks, and a vanilla listener hands back about half of what you spent.

The steps run in this order. :cite[(`IsoThumpable.java:1078-1111`)]

1. The thumper's break sound plays (the recipe's `BreakSound`, for example `ZombieThumpWoodCollapse` on a Lvl2 wall) and a louder world sound goes out.
2. Double doors and garage doors break as a unit; breakable fences fall over; everything else is destroyed. :cite[(`:1087-1110`)]
3. `destroy()` empties any container onto the square, fires the **`OnDestroyIsoThumpable`** event and removes the object. :cite[(`IsoThumpable.java:1595-1625`)]
4. A vanilla Lua listener on that event hands back **about half of what you spent**: for every unit of every recorded material, a coin toss decides whether it is lost or lands on the floor. :cite[(`media/lua/server/BuildingObjects/ISBuildingObject.lua:39-71`)] The listener is registered on that event in the same file. :cite[(`:743`)] Tools you only held, and items flagged `DontRecordInput` such as nails on barricades, are not recorded and so are not returned. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:1154-1163`)]

**Players and animals.** A weapon hit does the weapon's `DoorDamage` straight to the object: hammer 9, crowbar 8, axe 35, sledgehammer 40. The damage is applied on line 1184. :cite[(`IsoThumpable.java:1171-1230`, `:1184`)] The values are in the weapon item script, and the sledgehammer's is on line 13808. :cite[(`media/scripts/generated/items/weapon.txt`, `:13808`)] Against a barricade the number is multiplied by 5. :cite[(`IsoBarricade.java:429`)] An animal that hits a built object does `1000 x` its damage rating in one go, which destroys most of them at once. :cite[(`IsoThumpable.java:2778-2794`)]

## Repair

Repair is not a Build window feature.

It is the **Repair** mode of the moveables cursor: press the "moveables" button in the sidebar, then "Repair". The modes are listed in the cursor file. :cite[(`media/lua/server/BuildingObjects/ISMoveableCursor.lua:6-20`)] Bare line numbers in the Code column below are lines in `ISMoveableSpriteProps.lua`.

| Rule | Value | Code |
|---|---|---|
| When it is allowed | The object has 20 percent to 95 percent of its health. Below 20 it is "too broken"; above 95 it is "not worth repairing" | `media/lua/shared/Moveables/ISMoveableSpriteProps.lua:4138-4144` |
| What it costs | The parts are used up **before** the dice roll, so a failed repair still costs them | `:3543-3568` |
| Parts needed | Each material has a parts list. Required parts scale with how damaged the object is: `max(1, floor(amount x damage))`, times the number of tiles. Optional parts: you need any one of them | `:840-873`, `:3574-3598` |
| Result | **Full health.** A successful repair sets health to the maximum, not "a bit back" | `:3556-3565` |
| Chance | `10 + 10 x skill level + the material's base chance`, kept between 1 and 100. Only objects whose tile has the `CanScrap` property use this; for any other object the chance is 100 | `:4387-4407` |
| Time | `base time x (1 - 0.03 x skill level)` | `:4509-4523` |
| Multi-tile objects | Repaired as one; if any tile is under 20 percent, none can be | `:3601-3673` |

The material numbers (wood, doors, metal, fabric and so on) are in [the numbers page](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference). For example, wood needs a hammer and a saw, 2 planks as the required part (scaled), 4 nails or 4 screws as an optional part, takes 1,000 base time, and has a chance of `17 + 10 x Carpentry`. A door needs a hammer and screwdriver and 3 planks, plus a doorknob and 2 hinges once it is at least half broken, and has `20 + 10 x Carpentry`.

Which repair definition a built object uses comes from its tile's `Material` property, which is part of the tile definitions that the capture does not contain. For objects whose tile has no usable material the code falls back to a lightweight path with no repair material at all. :cite[(`ISMoveableSpriteProps.lua:49-69`, `:99`)] So I could not confirm which of your built walls and doors can be repaired. Not verified.

## Fire and vehicles

Fire ignores health and swaps a built object for a burnt tile where the tile has one, and vehicles do no damage that I could find.

| Source | Effect on a built object | Code |
|---|---|---|
| **Fire** | Health plays no part. When a square burns, a built object whose tile has a burnt version is swapped for it. :cite[(`:6297-6309`)] Doors, windows and curtains are removed :cite[(`:6353-6365`)]; wall-hung things are removed; built furniture and other multi-tile objects with no burnt tile get a burnt floor sprite. :cite[(`:6460-6481`)] Which branch applies depends on the tile. In a server safehouse, the safehouse fire options can stop all of it. :cite[(`:6222-6236`)] See [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works) | `zombie/iso/IsoGridSquare.java` |
| **Vehicles** | I found no code that takes health from a built object when a vehicle hits it. A vehicle hit pushes the vehicle, plays a sound and nudges the driver's music. Native physics (the engine's physics library) may still stop a vehicle on a wall. Not verified beyond the Java | `zombie/vehicles/BaseVehicle.java:5551-5560`, `:2884-2915` |

## Barricades

Barricades are separate objects on a door or window face, with their own health.

Their health is plank 1,000, metal bars 3,000 and metal sheet 5,000, all checked again in 42.22. :cite[(`zombie/iso/objects/IsoBarricade.java:61-64`)] The 3,000 is the bar constant, not what a placed bar starts with: a bar added from an item starts at the item's condition as a fraction of its maximum times 5,000, and that value is then scaled by the player's metal-barricade strength modifier. :cite[(`zombie/iso/objects/IsoBarricade.java:164-170`)] A zombie hit takes the zombie's strength off them. :cite[(`:356`)] They are covered in [Barricades and locks in vanilla](/pz/build-42/modding/world-and-tiles/barricades-and-locks-in-vanilla). Where that page differs from 42.22:

- Planks cost one plank and **one** nail in the build recipe :cite[(`media/scripts/generated/entities/barricades/entity_barricade_planks.txt:57-58`)]; the page says two. The older `ISBarricadeAction` still checks for two nails :cite[(`media/lua/shared/TimedActions/ISBarricadeAction.lua:37`)] but vanilla Lua only calls it from a test file. :cite[(`media/lua/client/Tests/TimedActionsTests.lua:498`)] The right-click barricade code builds through the entity recipe. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:3082-3088`)] Which path a live game takes is not verified.
- The metal-sheet and metal-bar barricades need Welding 3 plus welding rods, which the page does not mention. :cite[(`entity_barricade_metalsheet.txt:52-59`, `entity_barricade_metalbar.txt:52-59`)]
- The barricade is created by `BuildRecipeCode.barricade.OnCreate`, which runs where the build runs (the server in multiplayer). :cite[(`media/lua/server/BuildRecipeCode/buildRecipeCode.lua:98-166`)]
- There is a new constant for damaged metal sheets, 2,500. :cite[(`IsoBarricade.java:64`)]

## Sandbox options that touch this page

These sandbox options change the numbers or the rules on this page.

| Option | Default | What it changes |
|---|---|---|
| Player-built Construction Strength (`ConstructionBonusPoints`) | 3 (Normal) | The multiplier on `bonusHealth`, six recipes |
| Damage Construction (`ZombieLore.ThumpOnConstruction`) | on | Whether zombies can damage built objects at all |
| Environmental Attacks (`ZombieLore.ThumpNoChasing`) | off | Whether idle zombies thump built objects |
| Zombie Strength (`ZombieLore.Strength`) | 2 (Normal = 3) | Damage per thump to windows, map doors and barricades; not to built walls |
| Fire Spread (`FireSpread`) | on | Whether fires spread and burn objects |
| Zombies To Damage Fences / Fence Damage Multiplier | 50 / 1.0 | Map fences only |
| Maximum Dismantling XP Level (`LevelForDismantleXPCutoff`) | 0 | See [Moveables](/pz/build-42/engine/building-and-moveables/moveables-pick-up-place-and-scrap) |

## Server owners: two warnings

The server does not check who changes a built object's lock data, and for zombie hits it checks only that a zombie the sender owns is near the object.

> **Lock data.** The server does not check who changes a built object's lock code or key, and it logs nothing when this happens. :cite[(`zombie/network/packets/SyncThumpablePacket.java:78-82`)] Treat locks on built doors as a deterrent for honest players, not as a guarantee, and add your own server-side check of who may change them if locks matter on your server.

> **Zombie hits.** The server checks only that a zombie the sender owns is near the object, and it does not limit how often. Add your own limit if you need one.

## Where to go next

These pages cover how building works, recipes, moveables, the numbers and modding.

- [How building works](/pz/build-42/engine/building-and-moveables/how-building-works) and [Building recipes by skill](/pz/build-42/engine/building-and-moveables/building-recipes-by-skill).
- [Moveables: pick up, place and scrap](/pz/build-42/engine/building-and-moveables/moveables-pick-up-place-and-scrap), including dismantling what you built.
- [The numbers](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference) and [Modding building and moveables](/pz/build-42/engine/building-and-moveables/modding-building-and-moveables) (how to change health or thump behavior).

:::callout[How we know]{kind=proof}
The sources are code and scripts: `zombie/iso/objects/IsoThumpable.java` (health, `Thump`, `WeaponHit`, `destroy`), `zombie/ai/states/ThumpState.java`, `zombie/iso/IsoMovingObject.java`, `zombie/characters/IsoZombie.java`, `zombie/iso/IsoGridSquare.java`, `media/lua/server/BuildingObjects/ISBuildIsoEntity.lua`, `ISBuildingObject.lua`, `media/lua/shared/Moveables/ISMoveableSpriteProps.lua`, the entity scripts under `media/scripts/generated/entities/`, and `api/sandbox_options.jsonl`. Health numbers are computed from the scripts with the formula in the Lua build file, and they were not played out in the game. :cite[(`ISBuildIsoEntity.lua:666-677`)]

Not confirmed: how many thump events a zombie makes per second, and which built objects can be repaired, because that depends on tile `Material` data the capture does not hold. Also not confirmed: what a vehicle collision does to a built wall beyond the Java above, and whether a recipe with no skill at all (the sandbag wall) builds without error, because `getPerkLevel` is called with a null skill. :cite[(`ISBuildIsoEntity.lua:653-654`)]
:::
