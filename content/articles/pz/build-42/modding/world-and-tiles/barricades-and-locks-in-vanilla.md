---
id: build-42-barricades-and-locks-in-vanilla
slug: barricades-and-locks-in-vanilla
title: 'Barricades and locks in vanilla: what the code really does'
game: pz
version: build-42
section: modding
category: world-and-tiles
difficulty: intermediate
tags:
  - barricades
  - doors
  - locks
  - multiplayer
excerpt: >-
  A barricade is its own object on one face of a door or window, with plank,
  metal and metal-bar health. Any barricade, even one with no planks left
  standing, stops a door opening from either side, and anyone can take any
  barricade down. How barricades take damage, and the lock hardware the game
  already has. Read from the 42.21 code.
last_updated: '2026-10-04'
---
# Barricades and locks in vanilla: what the code really does

Outcast, barricading is how most of us survive the first week, and it is a favourite target for mods: stronger barricades, owned barricades, lockable doors. Before you change it, here is how the base game does it, read from the code.

## A barricade is an object on one face

A barricade is not part of the door. It is a separate object (`IsoBarricade`) placed on one face (north, south, east or west) of something that can be barricaded: a door, a window, a window frame, or a built object marked as barricadable. Each face has its own barricade, so a door can be barricaded from the outside, the inside, or both.

It holds three kinds of health:

| Layer | Health when full |
|---|---|
| Each plank, up to four | 1000, scaled by the plank's condition and the builder's barricade strength |
| A metal sheet | 5000 |
| Metal bars | 3000 |

Double doors and garage doors cannot be barricaded at all.

> **Proof:** Code. `zombie.iso.objects.IsoBarricade` (`PLANK_HEALTH = 1000`, `METAL_HEALTH = 5000`, `METAL_BAR_HEALTH = 3000`, four plank slots; `addPlank` scales by the plank's condition and `getBarricadeStrengthMod()`); `zombie.iso.objects.IsoDoor#isBarricadeAllowed` (refuses `DOUBLE_DOOR` and `GARAGE_DOOR`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Any barricade blocks the door, from both sides, for everyone

A door counts as barricaded when a barricade object exists on **either** face, whatever its health. A barricaded door cannot be opened, from inside or outside, by anyone. There is no owner and no key: in effect a barricade is a lock that nobody holds the key to. Windows and built objects follow the same rule.

> **Proof:** Code. `zombie.iso.objects.IsoDoor#isBarricaded` (true when `getBarricadeOnSameSquare()` or `getBarricadeOnOppositeSquare()` is not null). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How barricades take damage

- **Zombies** thumping a door hit the barricade on their side first, or the one on the far side if theirs is gone, before the door itself. Each thump takes the zombie's strength off the barricade.
- **Players** hitting it with a weapon do five times the weapon's `DoorDamage`. A sledgehammer has 40, an axe 35, a wrench 10, a hammer 9, a crowbar 8, a screwdriver 1.
- Damage comes off the **outermost** layer: the metal sheet first, then the metal bars, then the planks from the last one nailed.
- A barricade with every layer at zero counts as destroyed and stops taking damage.

> **Proof:** Code. `zombie.iso.objects.IsoBarricade#Thump` (`this.Damage(isoZombie.strength * thumpEventCount)` while not destroyed), the weapon hit (`this.Damage(weapon.getDoorDamage() * 5.0F)`), `#Damage` (metal, then metal bars, then planks from slot 3 down), `#isDestroyed`; `DoorDamage` values read in the installed `media/scripts/generated/items/weapon.txt`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Building and removing

- **Planks** need a hammer equipped, a plank and two nails. **Metal** needs a blowtorch with a sheet of metal, or three metal bars.
- The barricade action's `complete()` runs on the server in multiplayer, so the server builds the barricade.
- **Anyone can take any barricade down.** The unbarricade action takes planks or metal off the barricade on the player's own side and never asks who built it. Tools tagged `base:removebarricade` (hammer, axe, crowbar) do it.
- Barricade sprites placed by a map maker are turned into real barricade objects when the map loads.

> **Proof:** Code. `media/lua/shared/TimedActions/ISBarricadeAction.lua` (`isValid`, `complete`); `media/lua/shared/TimedActions/ISUnbarricadeAction.lua`, `ISUnbarricadeAction:complete` (`getBarricadeForCharacter(player)`, no ownership check); `base:removebarricade` on the hammer, axe and crowbar in `weapon.txt`; `media/lua/server/Map/MapObjects/MOBarricade.lua`. Build 42.21, Steam build 25485521.

## Lock hardware the game already has

If your mod adds locks, these items already exist (all `Base.`):

- **Keys:** `Key1` (building key, tag `base:buildingkey`), `Key_Blank`, `KeyPadlock`, `CarKey`, and key rings from `KeyRing` (holds one) and `KeyRing_Large` (two) to about two dozen memento rings.
- **Locks:** `Padlock` and `CombinationPadlock`. Both are in the key family (`ItemType = base:key`) with the tag `base:lock`.
- **Hardware:** `Doorknob`, `Hinge`, `HeavyChain`, `HeavyChainLink`.
- **Breaking in:** `Crowbar`, `BoltCutters`, `Sledgehammer`, `SheetMetalSnips`, the saws, the hand drills and the `BlowTorch`.

There is no lock pick, tension wrench, hairpin, slim jim, handcuffs, power drill, angle grinder, cutting torch, deadbolt, hasp or door chain item. A lock-picking mod brings its own tools.

> **Proof:** Code. Read and searched the installed item scripts `media/scripts/generated/items/key.txt`, `container.txt`, `normal.txt`, `weapon.txt` and `drainable.txt`. Build 42.21, Steam build 25485521.

## Where to go next

- [Tile system](/pz/build-42/modding/world-and-tiles/tile-system)
- [Timed actions](/pz/build-42/modding/lua-api/timed-actions)
