---
slug: sandbox-options-zombies
title: 'Sandbox options: zombies'
game: pz
version: build-42
section: server
category: sandbox-options
difficulty: beginner
tags:
  - server
  - sandbox-options
  - sandbox
  - generated
excerpt: 'How many zombies, how they spread and respawn, and the Zombie Lore: speed, strength, infection, senses and behaviour. Every option with its default, the presets that change it, and where Build 9.99 reads it.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-loot
---
# Sandbox options: zombies

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

How many zombies, how they spread and respawn, and the Zombie Lore: speed, strength, infection, senses and behaviour.

## Zombie

### Zombies

- **On the settings screen:** "Zombie Count".
- **In the file:** `Zombies = 4`, read by Lua as `SandboxVars.Zombies`. Takes a choice from 1 to 4.
- **Choices:** 1 "Insane", 2 "High", 3 "Normal", 4 "Low".
- **Default:** `4` ("Low") (the Apocalypse preset's value; the Java declaration says `3` ("Normal")). Other presets: Rising `2` ("High").
- **The game's description:** "How many"
- **Read in:** `zombie.fixture.Population#count` (line 40).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (2 files, 2 places).

### ZombieLore.Speed

- **On the settings screen:** "Speed", in the "Zombie Lore" group.
- **In the file:** `ZombieLore = { Speed = 2 }`, read by Lua as `SandboxVars.ZombieLore.Speed`. Takes a choice from 1 to 3.
- **Choices:** 1 "Fast" = `FAST (2.0F)`, 2 "Medium" = `MEDIUM (1.0F)`, 3 "Slow" = `SLOW`.
- **Default:** `2` ("Medium"). Every preset keeps the default.
- **Read in:** `media/lua/shared/Speed.lua` in `<file>` (line 1).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 9.99 (revision 0f0f0f0f0f).
