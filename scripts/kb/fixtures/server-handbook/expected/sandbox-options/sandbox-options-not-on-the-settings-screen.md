---
slug: sandbox-options-not-on-the-settings-screen
title: 'Sandbox options not on the settings screen'
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
excerpt: 'These sandbox options exist in the code and in the SandboxVars file but on no page of the settings screen, or only in debug mode. Every option with its default, the presets that change it, and where Build 9.99 reads it.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-zombies
---
# Sandbox options not on the settings screen

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

These sandbox options exist in the code and in the SandboxVars file but on no page of the settings screen, or only in debug mode.

### MultiplierConfig.Axe

- **On the settings screen:** "Axe".
- **In the file:** `MultiplierConfig = { Axe = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Axe`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **Read through a name built elsewhere:** `zombie.fixture.Xp#add` (line 12).

### NightFixture

- **On the settings screen:** "Night".
- **In the file:** `NightFixture = false`, read by Lua as `SandboxVars.NightFixture`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "Longer nights"
- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.

### WaterFixture

- **On the settings screen:** "Water". The sandbox screen shows it only in debug mode.
- **In the file:** `WaterFixture = 14`, read by Lua as `SandboxVars.WaterFixture`. Takes a whole number from -1 to 2147483647.
- **Default:** `14`. Every preset keeps the default.
- **No read found.** We found no read of the value. The name appears as text in: `zombie.fixture.Upgrade#rename` (line 3).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 9.99 (revision 0f0f0f0f0f).
