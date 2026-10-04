---
slug: sandbox-options-loot
title: 'Sandbox options: loot'
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
excerpt: 'How much loot there is, of each kind, how it respawns and how already-looted the world looks as time passes. Every option with its default, the presets that change it, and where Build 9.99 reads it.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-zombies
---
# Sandbox options: loot

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

How much loot there is, of each kind, how it respawns and how already-looted the world looks as time passes.

## Loot

### LootRate

- **On the settings screen:** "Loot rate".
- **In the file:** `LootRate = 0.5`, read by Lua as `SandboxVars.LootRate`. Takes a number from 0.0 to 2.0.
- **Default:** `0.5`. Every preset keeps the default.
- **The game's description:** "More \| less"
- **Read in:** `zombie.fixture.Loot#roll` (line 7); `zombie.fixture.Loot$Inner#roll2` (line 70).
- **What the code does with it:** Fixture: loot is multiplied by it.

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 9.99 (revision 0f0f0f0f0f).
