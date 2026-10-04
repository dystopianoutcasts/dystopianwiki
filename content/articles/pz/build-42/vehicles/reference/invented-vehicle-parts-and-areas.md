---
id: build-42-invented-vehicle-parts-and-areas
slug: invented-vehicle-parts-and-areas
title: 'Adding parts to a vehicle: the traps in order, copies and doors'
game: pz
version: build-42
section: vehicles
category: reference
difficulty: advanced
tags:
  - vehicles
  - scripts
  - parts
  - multiplayer
  - silent-failure
excerpt: >-
  A part you invent has no door, no window and no tables until you give it
  some, and vanilla code that assumes a door can crash a multiplayer client.
  A vehicle script is applied top to bottom, so a template line can wipe the
  part you just wrote. What we learned adding parts to vanilla cars, read
  from the 42.21 code.
last_updated: '2026-10-04'
---
# Adding parts to a vehicle: the traps in order, copies and doors

Outcast, adding a part to a car looks like a few lines of script. We added panels, gates and glass to over a hundred vanilla cars and hit every trap on this page, one of which threw players out of a multiplayer server. If you add, copy or re-declare vehicle parts, read this first. For animating those parts, see [what the engine requires to actually animate](/pz/build-42/vehicles/animation/what-the-engine-requires-to-actually-animate).

## Declaring a part creates it, empty

`part X { ... }` in a vehicle script is get-or-create: if the car already has a part `X`, your block is merged into it field by field; if not, a new part `X` is created with **only** the fields you wrote. A new part has no door element, no window, no container and no install or uninstall tables unless you declare them, or copy them with a template (below).

> **Proof:** Code. `zombie.scripting.objects.VehicleScript#LoadPart` (`getPartById(block.id)`, and a new `VehicleScript.Part` only when that is null). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A part with no door can crash a multiplayer client

Vanilla code does not always check for a missing door element. The one that hurt us: while a car's engine runs and a player is within 50 tiles, the game checks each seat's door to decide whether to sound the "door open" alarm. It checks that the seat's door **part** exists, then calls `getDoor().isOpen()` on it without checking that the part **has** a door element.

```java
VehiclePart doorPart = this.getPassengerDoor(i);
if (doorPart != null && !doorPart.isInventoryItemUninstalled() && doorPart.getDoor().isOpen()) {
   return true;
}
```

So if a seat's `door` names a part you created without a `door` block, this throws every frame while the engine runs. It only happens with the engine on and a listener nearby, which is why it hid from us in testing.

**The safe way:** never point a seat at a part that has no door element, and give any invented part every element vanilla might expect of a part like it.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#isDoorAlarmSounding` (the excerpt above) and `#getPassengerDoor` (`getPartById(pngr.door)`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Server test. A multiplayer client was dropped to the main menu with the exception in its log, and the server logged it once per connection; fixed by giving the part a door element, then confirmed in multiplayer. Build 42.20, engine revision a2947723ca.

## A vehicle script is applied top to bottom

The game reads a vehicle block's lines and child blocks **in order**, and two of them act on what is already there at that moment:

- **`template = X` replaces.** It copies the template's parts into the car, and any part with the same id that already exists is replaced whole, with its models and animations. Write `template` lines **before** your own `part` blocks, or the template wipes them. (`template! = X` instead loads the template's text into the car as if you had written it there, which merges.)
- **A wildcard part block applies to the parts that exist so far.** `part Seat* { ... }` is applied to each part already in the car whose id matches. A part added further down is not touched by it.

> **Proof:** Code. `zombie.scripting.objects.VehicleScript#Load` walks the block's elements in order (`template` calls `LoadTemplate`, `template!` calls `this.Load(name, template.body)`, a `part` id containing `*` loops over the current `this.parts`); `VehicleScript#copyPartsFrom` uses `this.parts.set(index, otherPart.makeCopy())` for an existing id. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A template brings everything with it

Copying a part through a template copies the whole part: its parent, item types, container, area, tables (install, uninstall and the rest), Lua functions, models, door, window, animations and category. That is the quickest way to give an invented part everything vanilla expects of it. It also means `template = TrunkDoor` brings vanilla's install requirements, sounds and door behaviour, whether you wanted them or not.

> **Proof:** Code. `zombie.scripting.objects.VehicleScript.Part#makeCopy` (copies `parent`, `itemType`, `container`, `area`, `mechanicArea`, `wheel`, `tables`, `luaFunctions`, `models`, `door`, `window`, `anims`, `category`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Glass on a moving panel needs `parent`

A part model either shares its parent part's animation player or gets one of its own. With `parent = TrunkDoor`, glass rigged to the trunk lid's bone is posed by the trunk's animation and lifts with it. Without a `parent`, the glass part gets its own animation player, which has no door and no animation to play, so it stays at its rest pose while the lid opens around it. Vanilla does the same for door windows: its window template gives each window its door as parent. We have read this, but not yet watched it in game for a trunk with glass.

> **Proof:** Code. `zombie.vehicles.BaseVehicle.ModelInfo#getAnimationPlayer` (returns the parent part's player when `this.part.getParent() != null`, else allocates its own). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The script name includes the module

`vehicle:getScriptName()` returns the full name, for example `Base.CarNormal`, not `CarNormal`. A comparison against bare ids silently never matches. The game's own picture table for the mechanics window is keyed the same way.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#getScriptName`; `media/lua/client/Vehicles/ISUI/ISCarMechanicsOverlay.lua` keys `CarList` by `"Base.CarNormal"` and the mechanics window looks it up by the script name. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## `IsoPlayer.getInstance()` is nil on a dedicated server

A dedicated server has no local player. Any vehicle hook that calls `IsoPlayer.getInstance()` (or `getPlayer()`) to find "the player" gets nil there. Vehicle hooks run on the server too, so pass the character you were given, or look the player up by the command's sender.

> **Proof:** Server test. A vehicle hook calling `IsoPlayer.getInstance()` raised on the dedicated server; the stack trace was in the server's log even though the call was inside `pcall`. Build 42.20, engine revision a2947723ca.

## Areas mark where the player stands

A vehicle `area` is the patch of ground where a player must stand to use a part, not the place the part is on the model. Measured on vanilla cars, an area's X and the part's mesh X even have opposite signs. When you add a part that players should reach, place its area beside the car where a person would stand, and check it in game with the vehicle debug areas on.

> **Proof:** Code. Compared the `area` blocks in the installed vehicle scripts with the part meshes of the same cars (for example a middle-left seat area at +0.70 against its mesh at -51.69 in model units). Build 42.20, engine revision a2947723ca.

## Where to go next

- [The vanilla mechanics code: what it really checks](/pz/build-42/vehicles/reference/vanilla-mechanics-code-what-it-really-checks)
- [Runtime injection: how to do this to a vanilla car](/pz/build-42/vehicles/animation/runtime-injection-how-to-do-this-to-a-vanilla-car)
