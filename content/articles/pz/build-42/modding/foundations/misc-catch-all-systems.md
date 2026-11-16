---
id: build-42-misc-catch-all-systems
slug: misc-catch-all-systems
title: Misc / Catch-all Systems
game: pz
version: build-42
section: modding
category: foundations
difficulty: intermediate
tags:
  - misc-systems
  - multiplayer
  - fire
  - weather
  - sound
excerpt: >-
  A signpost for modders in 42.22: what changed in multiplayer timed actions, fire, weather, sound and zombies, with a link to the page that explains each.
last_updated: '2026-11-16'
related_articles:
  - orientation
  - combat-and-animation
  - practical-b42-readiness-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who want one list of the systems that changed since Build 41 and a link to the page for each. It keeps to what the 42.22 code shows and does not repeat those pages.

:::callout[The 1-minute version]{kind=key}
- In multiplayer, a timed action takes part in the server's timed-action transaction only when its Lua class defines `complete` directly on its own class, not inherited. Otherwise the client runs it locally, and the mod can still send its own commands.
- Fire spread is capped: the game keeps at most 75 wild fires alive at once.
- The climate updates every ten game minutes, and the server decides the weather in multiplayer.
- Risky actions such as climbing a fence or a window send a music intensity event to the soundtrack.
- Each system below has its own page. Lighting, basements, the crafting window and the zombie spawn map are not covered here; the closing callout lists what was not verified.
:::

:::facts
- **Wild fires alive at once** 75
- **Climate update** every 10 game minutes
- **Timed action sent to the server** only when `complete` is defined on the class itself, not inherited
:::

## 1. Multiplayer and timed actions

**In multiplayer a timed action joins the server's transaction only when its Lua class defines `complete` directly, not by inheriting it.**

When a timed action is built, the engine checks the class table with `rawget`, which does not follow inheritance, and sets a flag when `complete` is not defined on the class itself. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:85-87`)] On a client, a set flag skips the call that creates the server transaction in `start`, and the action runs locally. :cite[(`zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:138-141`)]

A B41 mod whose timed action only inherits `complete` therefore does not go through the server transaction. A mod can still send its own commands from such an action. 

To have the server run it, define `complete` on the class and test in multiplayer. The request, the accept and the result are on [timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network). Which machine owns what is on [who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what).

## 2. Fire

**Fire is a set of small objects on single squares, and the game keeps at most 75 of them alive.**

The limit is a constant in the fire manager. :cite[(`zombie/iso/objects/IsoFireManager.java:55`)] How a fire starts, spreads and ends, and what it destroys, is on [how fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works) and [fighting fire](/pz/build-42/engine/fire-water-and-power/fighting-fire). Generators and the power grid are on [electricity and generators](/pz/build-42/engine/fire-water-and-power/electricity-and-generators).

## 3. Weather and temperature

**The climate has its own ten-minute update, and the weather pages explain what it feeds.**

The game clock calls the climate manager's ten-minute update. :cite[(`zombie/GameTime.java:635-637`)] Where the weather and the outdoor temperature come from is on [how weather works](/pz/build-42/engine/weather-and-climate/how-weather-works) and [temperature outdoors](/pz/build-42/engine/weather-and-climate/temperature-outdoors).

## 4. Sound and music

**Some actions tell the soundtrack how tense the moment is, and noise for zombies is a separate system.**

Climbing a fence or through a window each trigger a music intensity event on the player. :cite[(`zombie/ai/states/ClimbOverFenceState.java:129`, `zombie/ai/states/ClimbThroughWindowState.java:93`)] How the music uses those events is on [music and ambience](/pz/build-42/engine/sound-and-noise/music-and-ambience), and what zombies hear is on [how sound and noise work](/pz/build-42/engine/sound-and-noise/how-sound-and-noise-work).

## 5. Zombies

**How far zombies see and hear you, and how long they remember you, are measured on the player pages.**

Those numbers are on [how zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) and [how long zombies remember you](/pz/build-42/gameplay/the-real-numbers/how-long-zombies-remember-you). Combat, ragdolls and animation are on [combat and animation](/pz/build-42/modding/foundations/combat-and-animation).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java; no game was run. Not verified in 42.22, so this page does not state them: that all timed actions and the whole inventory moved to the server (only classes that define `complete` on themselves take part in the server transaction), that stackable-item transfers were reworked, that anti-cheat was switched back on, that fire spread depends on temperature, material, volume and surface area, that the world remembers a fire after players leave, the Voronoi spawn map, the zombie deletion limit raised from 500 to 5,000, ragdolls from impacts, the adaptive soundtrack beyond the intensity events above, 3D item placement, hanging weapons on walls, the new crafting window and the packing system, the lighting pass, basements, the 32-floor height, and the backslash-prefixed mod ID in server mod lists.
:::
