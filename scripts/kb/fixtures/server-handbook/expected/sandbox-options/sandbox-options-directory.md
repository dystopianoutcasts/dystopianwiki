---
slug: sandbox-options-directory
title: 'Sandbox options A to Z (Build 9.99)'
game: pz
version: build-42
section: server
category: sandbox-options
difficulty: beginner
tags:
  - server
  - sandbox-options
  - sandbox
  - reference
  - generated
excerpt: 'All 6 Build 9.99 sandbox options A to Z, how the SandboxVars file and the presets work, and which options the code never reads.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - sandbox-options-time-and-world
  - sandbox-options-zombies
  - sandbox-options-loot
  - server-options-directory
---
# Sandbox options A to Z

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Outcast, the sandbox options are the flavour of your world: how many zombies, how fast, how much loot, how long the power stays on. Build 9.99 has 6 of them. Here they are A to Z; click a name for the full entry.

## The file and the presets

- **Where they live.** A dedicated server keeps its sandbox options in `Server/<servername>_SandboxVars.lua` in your Zomboid folder. Each option is a line `Name = value,`; the options of a group (ZombieLore, ZombieConfig, Basement, Map, MultiplierConfig) sit inside a table named after the group. The game writes each option's description above it as a `--` comment, and for a choice it lists every value.
- **The defaults are the Apocalypse preset.** The game builds its sandbox options, then loads `media/lua/shared/Sandbox/Apocalypse.lua` and makes those values the defaults. So for 1 options the default the game uses is not the number written in the Java declaration. Each entry shows both when they differ.
- **The presets.** The sandbox screen offers "Apocalypse", "Rising". Choosing one starts from the Apocalypse values and applies the preset file on top, so an option a preset file does not mention keeps the Apocalypse value. Each entry lists the presets that set a different value.
- **A value out of range is refused,** exactly as for the server options: the game logs an error and keeps the value it had.

> **Proof:** Code. zombie.SandboxOptions constructor (loadGameFile("Apocalypse") then setDefaultsToCurrentValues), #loadServerLuaFile, #saveServerLuaFile and #writeLuaFile (the file, the groups, the comments); media/lua/client/OptionScreens/SandboxOptions.lua SandboxOptionsScreen:loadPresets and addPresetToList (each preset is a fresh SandboxOptions with the preset file loaded on top); zombie.config.IntegerConfigOption#setValue and zombie.config.DoubleConfigOption#setValue. Build 9.99 (revision 0f0f0f0f0f).

## What we found

- **3 options are read directly** by the Java or the vanilla Lua (4 read sites).
- **1 are read through a name built elsewhere:** the XP multipliers (the code builds "MultiplierConfig." plus the skill name) and the options the world generator names in its data.
- **1 have no read we could find, but their name appears as text:** [WaterFixture](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#waterfixture). Each entry says where.
- **1 are read nowhere:** [NightFixture](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#nightfixture).
- **2 places set a sandbox value instead of reading it,** nearly all in the debug scenarios and the Last Stand challenges. Each entry lists them apart from the reads.
- **Names the code uses that are not options in 9.99:** `LootRespawn` (2 places, first `media/lua/client/DebugUIs/Scenarios/A.lua` in `A.setSandbox` (line 9)).
- **The Rising preset sets names that are not options:** `OldName`. The game ignores them.
- **The Rising preset computes some values:** `Zombies = tonumber(Fix.High) = 2` (the tables are set in `media/lua/shared/defines.lua`).

## How a read site is found

Every "Read in" line on these pages comes from a search of the Build 9.99 Java and the vanilla Lua, by these rules:

1. Fixture rule one.
2. Fixture rule two.

A read site says where the code uses the value. When the code there makes the effect plain, the entry adds a line on what it does, written by hand from that site. When it does not, the entry only says where the value is read: we do not guess.

## All options

| Option | Type | Default | Settings page |
|---|---|---|---|
| [LootRate](/pz/build-42/server/sandbox-options/sandbox-options-loot#lootrate) | double | `0.5` | Loot |
| [MultiplierConfig.Axe](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#multiplierconfigaxe) | double | `1.0` | - |
| [NightFixture](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#nightfixture) | boolean | `false` | - |
| [WaterFixture](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#waterfixture) | integer | `14` | - |
| [ZombieLore.Speed](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorespeed) | enum | `2` ("Medium") | Zombie |
| [Zombies](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombies) | enum | `4` ("Low") | Zombie |
