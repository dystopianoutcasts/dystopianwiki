---
id: build-42-the-new-lighting-rendering-engine
slug: the-new-lighting-rendering-engine
title: The new lighting + rendering engine
game: pz
version: build-42
section: modding
category: world-and-tiles
difficulty: intermediate
tags:
  - tiles
  - multi-z
  - basements
  - map-modding
  - tiledefs
excerpt: >-
  What the 42.22 Java shows about light: squares go to a native library, tile properties make colored lights, and doors, curtains and barricades pass fixed amounts. The rest is native.
last_updated: '2026-11-15'
related_articles:
  - tile-system
  - barricades-and-locks-in-vanilla
  - basics-what-changed-and-why-it-matters-to-modders
  - map-tile-modder-migration-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- The game does its lighting in a native library (`Lighting64`). The Java code collects each square's walls, doors, windows and lights and hands them over. How the light then spreads is not in the Java, so it is not verified here.
- Colored light is real: a light source holds red, green and blue values from 0 to 1. A tile makes one with the properties `lightR`, `lightG` and `lightB` (each 0 to 255) and sets the size with `LightRadius`.
- A closed door with no curtain lets through 0.15 of the light on its edge, and a closed curtain 0.33 unless its tile says otherwise. A barricade on a window passes 0 (metal sheet), 1 (metal bars) or 1 minus 0.15 per plank.
- Lights on a switch obey the building's power. A street light is off by day and when the grid is off.
- The old page's "windowless rooms are completely dark at midday", the performance gains and the on-indicator cues come from dev blogs. The Java neither shows nor contradicts them.
:::

:::facts
- **Plank barricade light** 1 minus 0.15 per plank, so 0.85, 0.70, 0.55 and 0.40 for 1 to 4 planks
- **Closed door, no curtain** 0.15
- **Closed curtain (default)** 0.33
- **Default light radius** 10 for a tile light, 8 for a light switch made later
:::

Outcast, light is the part of Build 42 you can see before you can read it. This page separates what the Java code states from what happens inside the native library.

## 1. The Java collects, the native library lights

The lighting code is a native library that Java feeds square by square, so the Java shows what goes in and not what comes out.

The class loads `Lighting64` (or `Lighting` on macOS) at startup, and the game exits if it cannot. :cite[(`zombie/iso/LightingJNI.java:94-122`)] Its methods are `native` calls: set a square, add a light, add a room light, set a square's light transmission. :cite[(`zombie/iso/LightingJNI.java:1015-1153`)] For each square the Java passes which of the neighbors do not block sight, whether the square is open to the sky, and the building and room it belongs to. :cite[(`zombie/iso/LightingJNI.java:640-668`)]

A separate "Lighting Thread" runs the native update on a timer when the performance option is set. :cite[(`zombie/iso/LightingThread.java:40-52`, `zombie/iso/LightingThread.java:68-70`)] It is not created on a dedicated server. :cite[(`zombie/iso/LightingThread.java:41`)]

:::flow[Where each part of lighting lives]
- Tile properties and objects (Java)
- Per-square inputs: sight, sky, transmission (Java)
- Light spread and darkness (native, not shown)
- Drawing (rendering code)
:::

## 2. A light source is a color and a radius

A light source holds red, green and blue as separate values and a radius, so colored light is a built-in feature of the source.

The `IsoLightSource` class has `r`, `g` and `b` floats, a `radius`, an `active` flag, a `life` (negative for a permanent light) and a `hydroPowered` flag. :cite[(`zombie/iso/IsoLightSource.java:25-40`)] A timed light is added with a life measured in frames, converted at the lock frame rate. :cite[(`zombie/iso/LightingJNI.java:300-320`)]

Several things in vanilla make lights of other colors.

A television glows blue (0, 0, 1). :cite[(`zombie/iso/objects/IsoTelevision.java:103`)] A burning character carries an orange light (0.61, 0.175, 0) of radius 8. :cite[(`zombie/characters/IsoGameCharacter.java:17219`)] A vehicle's lightbar has four lights of radius 8, two blue and two red. :cite[(`zombie/vehicles/BaseVehicle.java:334-339`)] A building's room lights use radius 7. :cite[(`zombie/iso/areas/IsoBuilding.java:421`, `zombie/iso/areas/IsoBuilding.java:446`)]

## 3. A tile makes a light with three numbers and a radius

A tile becomes a colored light when it has `lightR`, `lightG` and `lightB`, and `LightRadius` sets its radius.

The three color properties are read as text, converted to numbers and divided by 255. :cite[(`zombie/iso/IsoObject.java:6549-6559`)] A plain world object with all three gets a light of radius 10 unless `LightRadius` is above 0. :cite[(`zombie/iso/IsoObject.java:6554-6559`, `zombie/core/properties/IsoPropertyType.java:28`)] This light is not tied to the building's power. :cite[(`zombie/iso/IsoObject.java:6561`)]

A tile of the light switch type works the same way when the map loads, with a default radius of 10 and a link to the switch. :cite[(`zombie/iso/CellLoader.java:114-130`)] A switch rebuilt later in play defaults to radius 8. :cite[(`zombie/iso/objects/IsoLightSwitch.java:51`, `zombie/iso/objects/IsoLightSwitch.java:133-136`)] The property names are in the engine's list of tile properties. :cite[(`zombie/core/properties/IsoPropertyType.java:28-31`)] 

This settles the old page's "colored-light fields are uncertain". The names were never in the wiki cache, but they are in the code.

A light switch whose tile has no color properties lights its room instead. :cite[(`zombie/iso/objects/IsoLightSwitch.java:81-94`)] A room light shines up to 5 squares out of a room's walls and is warm white (0.9, 0.8, 0.7) while its lights are active. :cite[(`zombie/iso/IsoRoomLight.java:17`, `zombie/iso/IsoRoomLight.java:57-61`)]

## 4. Power decides which lights are on

A light on a switch is on only when the building has power and the switch is on, and a street light also needs night.

The check runs for every light and lets a switch-powered light go on or off. A street light is forced off when the night value is below 0.5 or the grid is off. :cite[(`zombie/iso/LightingJNI.java:257-300`)] The grid state is one flag the world holds, `isHydroPowerOn`, and the lighting code reads it. :cite[(`zombie/iso/IsoWorld.java:3333-3339`, `zombie/iso/LightingJNI.java:263`)] What sets that flag is not checked here.

The class declares limits of 4 lights per player and 10 per vehicle, but nothing else in that file uses them, so what they limit is not verified. :cite[(`zombie/iso/LightingJNI.java:81-82`)]

## 5. Doors, curtains and barricades pass fixed amounts of light

Each edge of a square gets a number for how much light passes it, and the Java fills it from the doors, curtains, windows and barricades on that edge.

A closed curtain passes 0.33 of the light by default. Its tile can set the amount with `LightFilterIntensity` or `LightFilterMix` (percent), and a color with `LightFilterR`, `LightFilterG` and `LightFilterB` (0 to 255). :cite[(`zombie/iso/LightingJNI.java:680-715`)] A closed door with no curtain passes 0.15 and one with a closed curtain passes 0.33 with a black filter. :cite[(`zombie/iso/LightingJNI.java:768-785`)] A door counts as see-through when it is open, or when its sprite has `doorTrans` and it has no curtain or an open one, and a barricade that blocks vision takes that away. :cite[(`zombie/iso/LightingJNI.java:744-760`)]

::::cards
:::card[Metal sheet]{accent=orange}
Passes 0. It also blocks vision. :cite[(`zombie/iso/objects/IsoBarricade.java:246-248`, `zombie/iso/objects/IsoBarricade.java:978-984`)]
:::
:::card[Metal bars]{accent=blue}
Passes 1. They do not block vision. :cite[(`zombie/iso/objects/IsoBarricade.java:978-984`)]
:::
:::card[Planks]{accent=purple}
Pass 1 minus 0.15 for each plank. With 3 or 4 planks the barricade blocks vision. :cite[(`zombie/iso/objects/IsoBarricade.java:246-248`, `zombie/iso/objects/IsoBarricade.java:978-984`)]
:::
::::

The barricade numbers are used for windows and built windows and doors on the barricaded edge. :cite[(`zombie/iso/LightingJNI.java:787-838`)] For a door, only whether the barricade blocks vision is used. :cite[(`zombie/iso/LightingJNI.java:753-757`)] The barricade rules are on the [barricades page](/pz/build-42/modding/world-and-tiles/barricades-and-locks-in-vanilla).

## 6. What the Java cannot show

The spread of light, true darkness in windowless rooms and the look of light through gaps happen in the native library, so this page does not state them.

The squares open to the sky take the sky light level from the game's clock. :cite[(`zombie/iso/LightingJNI.java:640-643`)] What a closed room's darkness looks like at noon is the native library's job.

:::callout[How we know]{kind=proof}
- Every number and rule above was read in the 42.22 decompile. Nothing was tested in a running game, so every edge value is an input the Java sends, not a measured brightness.
- Not verified: everything the old page took from dev blogs. That is light bleed and propagation, "windowless rooms completely dark at midday", the era-accurate relight, the on-indicator on wall switches, the open-door glow on the character, the large performance gains and the claim that updated lighting mods exist. The native library's code is not in the capture.
- Changed: colored light. The old page said the field names were uncertain; they are `lightR`, `lightG`, `lightB` and `LightRadius`.
- Dropped: the note that the PZwiki "Rendering" page is about Blender. It says nothing about the engine.
:::

## Where to go next

- [The tile system](/pz/build-42/modding/world-and-tiles/tile-system)
- [Barricades and locks](/pz/build-42/modding/world-and-tiles/barricades-and-locks-in-vanilla)
