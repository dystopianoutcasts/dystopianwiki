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
  In 42.22 a barricade is its own object on one face of a door or window. Any barricade object blocks the door from both sides, anyone can remove it, and the plank recipe takes 1 plank and 1 nail.
last_updated: '2026-11-15'
related_articles:
  - the-new-lighting-rendering-engine
  - tile-system
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- A barricade is not part of the door. It is a separate object on one face (north, south, east or west) of a door, window, window frame or a built object that allows it. Double doors and garage doors cannot be barricaded.
- It holds up to four planks, or one metal sheet, or a set of metal bars. A plank starts at 1000 health, a metal sheet at 5000, and a bar barricade the map places at 3000.
- A barricade object on either face stops the door opening, from inside or outside, for everyone. A barricade has no owner and no key, unlike a door lock (section 6).
- A plank barricade takes a hammer, 1 plank and 1 nail. Metal needs Welding 3, a blowtorch and welding rods. Anyone holding a tool tagged `base:removebarricade` (hammer, axe, crowbar and three others) can take planks off, and a blowtorch takes metal off, with no ownership check.
- Zombies and weapons wear the outermost layer first: metal sheet, then bars, then planks from the last one nailed.
- The old page's "the barricade action's `complete()`" is a file the game's own menu no longer uses. The build path today is a craft recipe.
:::

:::facts
- **Planks per barricade** up to 4
- **Starting health** plank 1000, bars 3000 (map-placed), metal sheet 5000
- **Weapon hit** 5 times the weapon's `DoorDamage`
- **Plank barricade** 1 plank and 1 nail
- **Metal barricade** Welding 3
:::

Outcast, barricading is how most of us survive the first week, and it is a favorite target for mods: stronger barricades, owned barricades, lockable doors. Before you change it, here is how the base game does it, read from the 42.22 code.

## 1. A barricade is an object on one face

A barricade is a separate object, `IsoBarricade`, placed on one face of something that can be barricaded, and each face has its own.

The object sits on the square's special objects and records which of the four directions it faces. :cite[(`zombie/iso/objects/IsoBarricade.java:728-741`)] So a door can be barricaded from the outside, the inside, or both. A door allows it unless its sprite has the `DOUBLE_DOOR` or `GARAGE_DOOR` property, which marks a double door or a garage door. :cite[(`zombie/iso/objects/IsoDoor.java:1757-1760`)] Windows, window frames and built objects that allow barricading take one too. :cite[(`media/lua/server/BuildRecipeCode/buildRecipeCode.lua:57`)]

It holds three kinds of health:

| Layer | Health | Code |
|---|---|---|
| Each plank, up to four (`PLANK_HEALTH`) | 1000 per plank, scaled by the plank's condition and the builder's Woodwork level | :cite[(`zombie/iso/objects/IsoBarricade.java:60-63`, `zombie/iso/objects/IsoBarricade.java:88-97`)] |
| A metal sheet (`METAL_HEALTH`) | 5000, scaled by the sheet's condition and the builder's Welding level | :cite[(`zombie/iso/objects/IsoBarricade.java:63`, `zombie/iso/objects/IsoBarricade.java:200-210`)] |
| Metal bars (`METAL_BAR_HEALTH`) | 3000 when the map places them; 5000 scaled by condition and Welding level when a player builds them | :cite[(`zombie/iso/objects/IsoBarricade.java:62`, `zombie/iso/objects/IsoBarricade.java:160-172`)] |

The old table said "metal bars 3000 when full". The 3000 is only the default when no item is given, as when a map places a bar barricade. A bar item at full condition gives 5000. The add rules keep the kinds apart: planks go on only while there is no metal or bars and fewer than four planks, bars only while there are no planks, metal or bars, and a metal sheet only while there are no planks or metal. :cite[(`zombie/iso/objects/IsoBarricade.java:156-158`, `zombie/iso/objects/IsoBarricade.java:160-163`, `zombie/iso/objects/IsoBarricade.java:200-202`)]

The builder's skill scales the plank health from 1.0 at Woodwork 0 and 1, to 1.1 at level 2, and up to 1.5 at level 10. :cite[(`zombie/characters/IsoGameCharacter.java:4415-4435`)] Metal uses the same steps from Welding, and falls back to the Woodwork steps below Welding 2. :cite[(`zombie/characters/IsoGameCharacter.java:4371-4400`)]

## 2. Any barricade blocks the door, from both sides, for everyone

A door counts as barricaded when a barricade object exists on either face, whatever its health, and a barricaded door cannot be opened by anyone.

The test is only whether the object exists on the door's own square or the opposite square. :cite[(`zombie/iso/objects/IsoDoor.java:1747-1754`)] 

A barricaded door answers "could be opened" with no, and an attempt to open it plays the barricaded-door reaction. :cite[(`zombie/iso/objects/IsoDoor.java:1303-1307`, `zombie/iso/objects/IsoDoor.java:1345-1347`)] A barricade has no owner and no key, so in effect it is a lock that nobody holds the key to. A door lock is different and is in section 6. Windows and built objects follow the same test. :cite[(`zombie/iso/objects/IsoWindow.java:1188-1195`, `zombie/iso/objects/IsoThumpable.java:1637-1644`)]

A barricade whose layers have all reached zero counts as destroyed. :cite[(`zombie/iso/objects/IsoBarricade.java:316-318`)] The old page said even a barricade with no planks left still blocks a door. The existence test says so, but the two routes that wear a barricade down remove the object as soon as it is destroyed, so the case is rare. :cite[(`zombie/iso/objects/IsoBarricade.java:368-376`, `zombie/iso/objects/IsoBarricade.java:435-447`)]

A barricade also blocks sight when it has metal or more than two planks. Metal bars never block sight. :cite[(`zombie/iso/objects/IsoBarricade.java:246-248`)] How much light it passes is on the [lighting page](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine).

## 3. How barricades take damage

Damage comes off the outermost layer, and zombies and weapons use the same path.

- **Zombies** thumping a door are handed the barricade on their own side first, or the one on the far side, before the door itself. :cite[(`zombie/iso/objects/IsoDoor.java:1049-1059`, `zombie/iso/objects/IsoDoor.java:996-1004`)] Each thump takes the zombie's strength times the thump count off the barricade. :cite[(`zombie/iso/objects/IsoBarricade.java:350-358`)]
- **Players** hitting it with a weapon do five times the weapon's `DoorDamage`, or 100 with no weapon. :cite[(`zombie/iso/objects/IsoBarricade.java:429-431`)]
- Damage comes off metal first, then metal bars, then the planks from the last slot (the last one nailed). :cite[(`zombie/iso/objects/IsoBarricade.java:458-500`)]
- In the tutorial no damage is taken. :cite[(`zombie/iso/objects/IsoBarricade.java:459`)]

:::chips
- Sledgehammer 40
- Wood Axe 55
- Axe 35
- Hand Axe 20
- Wrench 10
- Hammer 9
- Crowbar 8
- Screwdriver 1
- Tire Iron 1
:::

Those are the `DoorDamage` values, so a sledgehammer hit does 200 to a barricade. :cite[(`media/scripts/generated/items/weapon.txt:13808`, `media/scripts/generated/items/weapon.txt:14021`, `media/scripts/generated/items/weapon.txt:10121`, `media/scripts/generated/items/weapon.txt:6221`, `media/scripts/generated/items/weapon.txt:6042`, `media/scripts/generated/items/weapon.txt:2955`, `media/scripts/generated/items/weapon.txt:7887`, `media/scripts/generated/items/weapon.txt:18902`, `media/scripts/generated/items/weapon.txt:5482`)] The Wood Axe (55) and the Hand Axe (20) were not on the old page's list.

## 4. Building a barricade

The game builds a barricade from a craft recipe, one per kind, and the plank recipe takes 1 plank and 1 nail.

- **Planks:** a hammer that stays, 1 plank and 1 nail. :cite[(`media/scripts/generated/entities/barricades/entity_barricade_planks.txt:46-60`)]
- **Metal sheet:** Welding 3, 1 blowtorch, 1 sheet of metal and 1 welding rods. :cite[(`media/scripts/generated/entities/barricades/entity_barricade_metalsheet.txt:46-61`)]
- **Metal bars:** Welding 3, and the script asks for 3 of the blowtorch, 3 of the bars (iron, metal or steel) and 3 of the welding rods. :cite[(`media/scripts/generated/entities/barricades/entity_barricade_metalbar.txt:46-61`)] Whether "3 blowtorch" means three units of fuel is not verified.

See [Building recipes by skill](/pz/build-42/engine/building-and-moveables/building-recipes-by-skill).

The world menu starts a barricade through the build-entity cursor, not the old action. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:3082-3088`)] The recipe's `OnCreate` function finds the door or window and adds a plank to an existing barricade or makes a new one. :cite[(`media/lua/server/BuildRecipeCode/buildRecipeCode.lua:98-146`)] The code's own comment says the new thumpable was only added on the server, and it sends the barricade to clients only when `isServer()` is true, so in multiplayer it runs on the server. :cite[(`media/lua/server/BuildRecipeCode/buildRecipeCode.lua:155-163`)]

The place check refuses an open door, a face that already has a metal or bar barricade, and a face that already has four planks. :cite[(`media/lua/server/BuildRecipeCode/buildRecipeCode.lua:45-76`)]

The old page cited `ISBarricadeAction` for the building. That file still ships, and it asks for 2 nails. :cite[(`media/lua/shared/TimedActions/ISBarricadeAction.lua:31-38`, `media/lua/shared/TimedActions/ISBarricadeAction.lua:159-160`)] The only code that starts it is a test script. :cite[(`media/lua/client/Tests/TimedActionsTests.lua:498`, `media/lua/client/Tests/TimedActionsTests.lua:511`)] The recipe, and the 1 nail, is what a player meets.

## 5. Taking one down

Anyone can take any barricade down, because the unbarricade action never asks who built it.

The action takes the barricade on the player's own side of the door. :cite[(`media/lua/shared/TimedActions/ISUnbarricadeAction.lua:5-9`, `media/lua/shared/TimedActions/ISUnbarricadeAction.lua:101-103`)] Planks need an equipped item with the `ItemTag.REMOVE_BARRICADE` tag, and metal or bars need a blowtorch equipped. :cite[(`media/lua/shared/TimedActions/ISUnbarricadeAction.lua:10-21`)] The tag is `base:removebarricade`, and six items carry it: the hammer, the forged hammer, the tire iron, the crowbar, the forged crowbar and the axe. :cite[(`media/scripts/generated/items/weapon.txt:2985`, `media/scripts/generated/items/weapon.txt:3037`, `media/scripts/generated/items/weapon.txt:5507`, `media/scripts/generated/items/weapon.txt:7916`, `media/scripts/generated/items/weapon.txt:7963`, `media/scripts/generated/items/weapon.txt:10154`)]

Taking down metal gives back a sheet of metal, and taking down bars gives back 3 metal bars. :cite[(`media/lua/shared/TimedActions/ISUnbarricadeAction.lua:104-132`)] Planks come off one at a time from the last slot. :cite[(`media/lua/shared/TimedActions/ISUnbarricadeAction.lua:133-140`, `zombie/iso/objects/IsoBarricade.java:106-130`)] Barricade sprites a map maker places are turned into real barricade objects when the map loads. :cite[(`media/lua/server/Map/MapObjects/MOBarricade.lua:22-48`)]

## 6. How a door lock works

A door lock is a flag on the door plus a key id, and the door checks the key in your inventory when you try to open it.

A door holds `locked`, `lockedByKey` and a `keyId`. :cite[(`zombie/iso/objects/IsoDoor.java:107-109`, `zombie/iso/objects/IsoDoor.java:1829-1837`)] Setting `lockedByKey` also sets `locked`. :cite[(`zombie/iso/objects/IsoDoor.java:1843-1846`)] A player cannot open a door that is `lockedByKey`, or that has a true `CustomLock` entry in its mod data, unless the inventory holds an item for that `keyId` (`haveThisKeyId`). :cite[(`zombie/iso/objects/IsoDoor.java:1303-1316`)] A door that has `locked` set and a key id other than -1 is turned into a key lock the first time someone tries it. :cite[(`zombie/iso/objects/IsoDoor.java:1346-1350`)]

Using the door checks again. With no matching key the player gets the locked-door reaction and the door stays shut; with the key the door unlocks, plays the unlock and open sounds, and opens. :cite[(`zombie/iso/objects/IsoDoor.java:1363-1389`)] The door's own `isLocked` getter only returns the `locked` flag. :cite[(`zombie/iso/objects/IsoDoor.java:1774-1776`)]

A player inside a room the door joins can open it from the inside without a key, unless the door's sprite has the `forceLocked` property. :cite[(`zombie/iso/objects/IsoDoor.java:1295-1299`, `zombie/iso/objects/IsoDoor.java:1359-1362`)] So a locked door is a key lock the other way round from a barricade: it has a key, and the key holder can pass.

## 7. Lock hardware the game already has

If your mod adds locks, these items already exist (all `Base.`), read from the item scripts.

- **Keys:** `Key1` (building key, tag `base:buildingkey`), `Key_Blank`, `KeyPadlock` and `CarKey`. :cite[(`media/scripts/generated/items/key.txt:3-77`)] The scripts are `key.txt`, `container.txt`, `normal.txt` and `weapon.txt` under `media/scripts/generated/items/`. There are 29 items named `KeyRing...`; `KeyRing` holds 1 item and `KeyRing_Large` holds 2. :cite[(`media/scripts/generated/items/container.txt:4134-4146`, `media/scripts/generated/items/container.txt:4304-4311`)]
- **Locks:** `Padlock` and `CombinationPadlock`. Both are in the key family (`ItemType = base:key`) and carry the tag `base:lock`. :cite[(`media/scripts/generated/items/key.txt:28-63`)]
- **Hardware:** `Doorknob`, `Hinge`, `Latch`, `HeavyChain`, `HeavyChainLink` and `HeavyChain_Hook`. :cite[(`media/scripts/generated/items/normal.txt:3628`, `media/scripts/generated/items/normal.txt:3648`, `media/scripts/generated/items/normal.txt:1810`, `media/scripts/generated/items/normal.txt:1935-1957`)]
- **Forcing entry:** `Crowbar`, `BoltCutters`, `Sledgehammer`, `SheetMetalSnips`, `HandDrill` and the `BlowTorch`. :cite[(`media/scripts/generated/items/weapon.txt:7873`, `media/scripts/generated/items/weapon.txt:7495`, `media/scripts/generated/items/weapon.txt:13793`, `media/scripts/generated/items/weapon.txt:4851`, `media/scripts/generated/items/normal.txt:11109`, `media/scripts/generated/items/drainable.txt:1574`)]

A search of the item scripts finds no item named for a lock pick, hairpin, slim jim, handcuffs, deadbolt, tension wrench or bobby pin. A lock-picking mod brings its own tools. A `Paperclip` exists but is tagged as a fishing hook. :cite[(`media/scripts/generated/items/normal.txt:9150-9158`)]

:::callout[How we know]{kind=proof}
- Every citation above was read in the 42.22 decompile, its scripts and its Lua. Nothing was tested in a running game.
- Changed: bar health. The old table said bars are 3000 when full. A bar barricade built from a full-condition item starts at 5000 (`IsoBarricade.java:164-166`).
- Changed: the build path. The old page cited `ISBarricadeAction` and its `complete()` as the build. That action needs 2 nails and is started only by a test; the menu uses the craft recipe (1 nail).
- Changed: "even a barricade with no planks left blocks a door". The existence test says so, but a barricade destroyed by a thump or a hit is removed.
- Changed: tools that remove planks. The old list was hammer, axe and crowbar. Six items carry the tag (hammer, forged hammer, tire iron, crowbar, forged crowbar, axe), and metal needs a blowtorch.
- Not verified: what "3 blowtorch" means for a drainable item; what the unbarricade action does when it finishes on a server.
:::

## Where to go next

- [Tile system](/pz/build-42/modding/world-and-tiles/tile-system)
- [Timed actions](/pz/build-42/modding/lua-api/timed-actions)
- [The new lighting engine](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine)
