---
id: build-42-vehicle-mod
slug: vehicle-mod
title: Vehicle
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a mod that adds a drivable small car, the Recipe Demo Car, from the vanilla small-car template, model and texture, and spawn it with the debug menu.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - how-to-animate-a-vehicle-part
  - vehicle-model-and-texture-traps
  - script-file-anatomy
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoVehicle`: one vehicle script, one translation file and the two files every mod has, `mod.info` and `poster.png`.
- The car is the vanilla Chevalier Dart (`SmallCar`) under a new name. It reuses vanilla's `SmallCar` template, its model and its texture, so the mod needs no art.
- It differs from the Dart in a name and two numbers: `engineForce` 4200 instead of 3600, and `maxSpeed` 90 instead of 70.
- You spawn it from the debug menu and see a Dart-shaped car called Recipe Demo Car.
:::

:::facts
- **Mod id** `RecipeDemoVehicle`
- **Vehicle** `RecipeDemoVehicle.RecipeDemoCar`, shown as Recipe Demo Car
- **Files** 4 (`mod.info`, `poster.png`, the script, `IG_UI.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A car that drives like the vanilla small car, with its own name and a little more power.**

A vehicle is mostly data: a `vehicle` block names a model, a texture, the seats, the wheels and the parts. Most of that data sits in a shared template that vanilla's own small car already uses, so this recipe borrows the template and writes only what is new. The 3D model and the texture are vanilla's too, so you finish a working car without opening a 3D tool. Making your own model and texture is a separate job; the closing section links the pages for it.

In the game, the spawn window lists **Recipe Demo Car**, and the car that appears looks like the Dart.

## The files

**One script and one translation file on top of the skeleton's `mod.info` and `poster.png`.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders and the same `poster.png`. This recipe leaves out the skeleton's `Boot.lua`, because a vehicle needs no Lua.

```
Zomboid/mods/RecipeDemoVehicle/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      scripts/
        RecipeDemoVehicle_vehicles.txt
      lua/
        shared/
          Translate/
            EN/
              IG_UI.json
```

The recipe puts no model or texture file in the mod. The script names the vanilla ones, and the game finds them by name. :cite[(`media/scripts/generated/vehicles/vehicle_car_small.txt:7-16`, `media/scripts/generated/vehicles/vehicle_car_small_model.txt:3-9`)] The capture holds the scripts but not the texture images, so this page did not open the picture file.

## Step by step

**Write `mod.info`, copy the poster, then the vehicle script, then the name.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Vehicle
id=RecipeDemoVehicle
description=A small car built on the vanilla Chevalier Dart template, model and texture.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/scripts/RecipeDemoVehicle_vehicles.txt`

This is the whole car. It is the vanilla `SmallCar` block, moved into your own module and renamed, with two lines added after the template line. :cite[(`media/scripts/generated/vehicles/vehicle_car_small.txt:1-95`)]

**File `42/media/scripts/RecipeDemoVehicle_vehicles.txt`**

```
module RecipeDemoVehicle
{
    vehicle RecipeDemoCar
    {
        template! = SmallCar,
        engineForce = 4200,
        maxSpeed = 90.0,
        model
        {
            file = Vehicles_SmallCar,
            scale = 1.82,
            offset = 0.0 0.3022 0.0,
        }
        skin
        {
            texture = Vehicles/vehicle_smallcarshell,
        }
        template = PassengerSeat4,
        template = CarSmallCollision,
        passenger FrontLeft
        {
            position inside
            {
                offset = 0.1593 -0.1044 -0.1099,
                rotate = 0.0 0.0 0.0,
            }
            position outside
            {
                offset = 0.5714 -0.4121 -0.011,
                rotate = 0.0 0.0 0.0,
                area = SeatFrontLeft,
            }
        }
        passenger FrontRight
        {
            position inside
            {
                offset = -0.1538 -0.1044 -0.1099,
                rotate = 0.0 0.0 0.0,
            }
            position outside
            {
                offset = -0.5714 -0.4121 -0.011,
                rotate = 0.0 0.0 0.0,
                area = SeatFrontRight,
            }
        }
        passenger RearLeft
        {
            position inside
            {
                offset = 0.1813 -0.1044 -0.4835,
                rotate = 0.0 0.0 0.0,
            }
            position outside
            {
            }
        }
        passenger RearRight
        {
            position inside
            {
                offset = -0.1813 -0.1044 -0.4835,
                rotate = 0.0 0.0 0.0,
            }
            position outside
            {
            }
        }
        area SeatFrontLeft
        {
            xywh = 0.5989 -0.011 0.4286 0.6593,
        }
        area SeatFrontRight
        {
            xywh = -0.5989 -0.011 0.4286 0.6593,
        }
        extents = 0.7582 0.5934 1.8462,
        physicsChassisShape = 0.7582 0.5934 1.8462,
        centerOfMassOffset = 0.0 0.3077 0.0,
        shadowExtents = 0.7582 1.8462,
        shadowOffset = 0.0 0.0,
        attachment trailer
        {
            offset = 0.0 -0.2747 -0.9341,
            rotate = 0.0 0.0 0.0,
            zoffset = -1.0,
        }
        attachment trailerfront
        {
            offset = 0.0 -0.2747 0.9286,
            rotate = 0.0 0.0 0.0,
            zoffset = 1.0,
        }
    }
}
```

**How the template line works.** The line `template! = SmallCar` copies the whole body of the template named `SmallCar` into your vehicle at that point. :cite[(`zombie/scripting/objects/VehicleScript.java:295-301`)] The template holds the engine settings, the wheels, the sounds and the part list. :cite[(`media/scripts/generated/vehicles/vehicle_car_small_template.txt:3-60`, `media/scripts/generated/vehicles/vehicle_car_small_template.txt:103-122`)] A name with no module in it is looked up in the `Base` module, which is where vanilla defines `SmallCar`, so your module needs no import line for it. :cite[(`zombie/scripting/ScriptBucketCollection.java:79-88`, `media/scripts/generated/vehicles/vehicle_car_small_template.txt:1-4`)] If the name is not found, the log says `ERROR: template "SmallCar" not found in:` and the file name. :cite[(`zombie/scripting/objects/VehicleScript.java:296-298`)]

The game reads the block line by line, so a later line replaces an earlier value. That is why `engineForce = 4200` and `maxSpeed = 90.0` come right after the template line: the template sets 3600 and 70.0, and your values win. :cite[(`zombie/scripting/objects/VehicleScript.java:146-147`, `zombie/scripting/objects/VehicleScript.java:169`, `zombie/scripting/objects/VehicleScript.java:233-234`, `media/scripts/generated/vehicles/vehicle_car_small_template.txt:29-32`)]

**The other blocks** are vanilla's, line for line:

| Block | What it does | Code |
|-------|--------------|------|
| `model` | Names the model script `Vehicles_SmallCar`, scales it and moves it up. The car's own model is the first one in the script's list. | `zombie/scripting/objects/VehicleScript.java:315-316`, `zombie/scripting/objects/VehicleScript.java:700-728`, `zombie/scripting/objects/VehicleScript.java:1512-1514` |
| `skin` | Names the texture the car is painted with. | `zombie/scripting/objects/VehicleScript.java:348-351`, `zombie/scripting/objects/VehicleScript.java:731-758` |
| `template = PassengerSeat4`, `template = CarSmallCollision` | Copy the areas, parts, passengers, sounds, wheels and physics shapes of those two templates into the car. | `zombie/scripting/objects/VehicleScript.java:1233-1247` |
| `passenger` | Gives each of the four seats an inside position and an outside position. | `zombie/scripting/objects/VehicleScript.java:336-341` |
| `area` | A named rectangle (`xywh`). The two front outside seat positions name these areas. | `zombie/scripting/objects/VehicleScript.java:893-905`, `zombie/scripting/objects/VehicleScript.java:1423-1424` |
| `extents`, `physicsChassisShape`, `centerOfMassOffset`, `shadowExtents`, `shadowOffset` | The size of the car, its collision box, its center of mass and its shadow. | `zombie/scripting/objects/VehicleScript.java:151-159`, `zombie/scripting/objects/VehicleScript.java:167` |
| `attachment` | Two points where a trailer can hook on. | `zombie/scripting/objects/VehicleScript.java:313-314`, `zombie/scripting/objects/VehicleScript.java:671-694` |

The vanilla `SmallCar` block also has a `specialKeyRing` line, which lists key rings that can appear with the car. :cite[(`media/scripts/generated/vehicles/vehicle_car_small.txt:6`)] This recipe leaves it out, so the car spawns with the ordinary key behavior only.

The model name has no module either: the script writes `file = Vehicles_SmallCar` with no module, and the model it names is a `model` block in the `Base` module. :cite[(`media/scripts/generated/vehicles/vehicle_car_small_model.txt:1-10`)] The engine looks a model up by name, and a name without a module goes to `Base`. :cite[(`zombie/scripting/ScriptManager.java:840-842`, `zombie/scripting/ScriptBucketCollection.java:84-86`)]

### Step 3. `42/media/lua/shared/Translate/EN/IG_UI.json`

This file gives the car its name. The key is `IGUI_VehicleName` followed by the vehicle's name, without the module. :cite[(`media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:101-109`)] The key's name on the car key uses the script's `carModelName` first when it has one, and this recipe sets none. :cite[(`zombie/vehicles/BaseVehicle.java:10859-10865`)] Vanilla writes its names the same way. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:1335`)]

**File `42/media/lua/shared/Translate/EN/IG_UI.json`**

```
{
    "IGUI_VehicleNameRecipeDemoCar": "Recipe Demo Car"
}
```

The game reads a file called `IG_UI` into the table that serves every key starting with `IGUI_`, and it reads each enabled mod's copy of that file. :cite[(`zombie/core/Translator.java:146`, `zombie/core/Translator.java:444-445`, `zombie/core/Translator.java:384-401`)]

## Turn it on and see it work

**Check the mod, start a game in debug mode and spawn the car from the debug menu.**

1. Put the `RecipeDemoVehicle` folder in `Zomboid/mods/`. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Vehicle**, choose **ACCEPT**, and start a new game.
2. Right-click the ground and choose **Debug**, then **Main**, then **Spawn Vehicle**. :cite[(`media/lua/client/DebugUIs/DebugContextMenu.lua:50-60`, `media/lua/shared/Translate/EN/ContextMenu.json:840`, `media/lua/shared/Translate/EN/IG_UI.json:6515`, `media/lua/shared/Translate/EN/IG_UI.json:6524`)]
3. In the window, check **Real Names** so the list shows names instead of module paths. :cite[(`media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:24`, `media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:100-110`)] Choose **Recipe Demo Car** in the list, or type part of the name in the box, and press **Spawn**. :cite[(`media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:14-16`, `media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:43`, `media/lua/shared/Translate/EN/IG_UI.json:6410`)]

In single player, the car is created at your position. :cite[(`media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:143-146`)] Step away, walk to a door and get in as you would in a vanilla car. You should see the Dart's body, a driver's seat and three more seats. With the engine running it should pull harder than a vanilla Dart and top out at a higher speed; this page did not measure either.

The list holds every normal vehicle script the game has loaded (burnt and smashed ones sit behind two checkboxes), so your car is there only if the script parsed. :cite[(`media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:81-96`)] On a dedicated server, put `Mods=RecipeDemoVehicle` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. A client in multiplayer sends the server the command `/addvehicle` with the full vehicle name. :cite[(`media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:140-142`)] These server steps have not been run in a game.

## If it does not work

**A vehicle script that fails to load usually fails in one place, so read the log for the template line first.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| `ERROR: template "SmallCar" not found in:` and the script's file name | The name after `template!` does not match a `template vehicle` block. Copy the name exactly. A name with no module is searched in `Base` only. | `zombie/scripting/objects/VehicleScript.java:296-298`, `zombie/scripting/ScriptBucketCollection.java:84-86` |
| `ERROR: template "PassengerSeat4" not found B` | The same, for a `template =` line with no `/` in it. | `zombie/scripting/objects/VehicleScript.java:1234-1238` |
| The car is not in the spawn list | The script file is not a `.txt` file under `media/scripts/`, the mod is not checked for this game, or the file failed to parse. Look for errors from the script loader in the log. | `media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:81-96`, `zombie/scripting/ScriptManager.java:1398-1402` |
| The list shows `IGUI_VehicleNameRecipeDemoCar` instead of a name | `IG_UI.json` is missing, in the wrong folder, or spells the key differently. The key is the prefix plus the vehicle name with no module. | `media/lua/client/DebugUIs/ISSpawnVehicleUI.lua:109`, `zombie/core/Translator.java:444-445` |
| `JSON Error in:` and the path of your file | The JSON is not valid, for example a comma after the last entry. | `zombie/core/Translator.java:379` |
| A value you set has no effect, and the log shows no error | The loader skips a key it does not know without any message, so a misspelled key does nothing. The same holds for `frontEndHealth`: the loader reads `frontEndDurability`, and vanilla's own template uses the other spelling. | `zombie/scripting/objects/VehicleScript.java:239-242`, `zombie/scripting/objects/VehicleScript.java:306-309`, `media/scripts/generated/vehicles/vehicle_car_small_template.txt:44-45` |

Script files are parsed when the game loads, so restart the game after every change to the `.txt` file. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) lists more load errors. This page did not check what the game shows when the model name is wrong.

## Going further

**Give the car its own model and texture, or make a part move.**

- [Script file anatomy](/pz/build-42/modding/items-and-scripting/script-file-anatomy) explains modules, blocks and commas.
- [Vehicle model and texture traps](/pz/build-42/vehicles/animation/vehicle-model-and-texture-traps) lists what goes wrong with a custom model and its texture. A custom model is a 3D-tool job, so this recipe does not give one.
- [How to animate a vehicle part](/pz/build-42/vehicles/animation/how-to-animate-a-vehicle-part) shows how to make a hood or a door move.
- [Vehicle engine reference](/pz/build-42/vehicles/reference/vehicle-engine-reference) holds the engine facts for vehicle code.

:::callout[How we know]{kind=proof}
Every line of the script is the vanilla `SmallCar` block, except the module, the name and the two added lines. The loader behavior comes from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker. It has not been run in a game: the spawn window, the car's look and its speed are what you check yourself.

The old page said `frontEndHealth` and `rearEndHealth` are parsed but do nothing; the code does not parse those keys at all, so the claim was corrected. The old claims about wheel ids, mass limits, friction limits and physics in Lua were not verified here and were dropped.
:::
