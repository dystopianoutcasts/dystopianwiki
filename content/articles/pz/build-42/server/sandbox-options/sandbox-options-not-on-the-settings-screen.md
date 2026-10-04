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
excerpt: 'These sandbox options exist in the code and in the SandboxVars file but on no page of the settings screen, or only in debug mode. Every option with its default, the presets that change it, and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-zombies
---
# Sandbox options not on the settings screen

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

These sandbox options exist in the code and in the SandboxVars file but on no page of the settings screen, or only in debug mode.

### AbundantLootFactor

- **On the settings screen:** "Abundant Loot Factor".
- **In the file:** `AbundantLootFactor = 3.0`, read by Lua as `SandboxVars.AbundantLootFactor`. Takes a number from 2.0 to 4.0.
- **Default:** `3.0`. Every preset keeps the default.
- **Read in:** `zombie.inventory.ItemPickerJava#doSandboxSettings` (line 510).

### AlarmDecayModifier

- **On the settings screen:** "Alarm Battery Decay".
- **In the file:** `AlarmDecayModifier = 14`, read by Lua as `SandboxVars.AlarmDecayModifier`. Takes a whole number from -1 to 2147483647.
- **Default:** `14`. Every preset keeps the default.
- **The game's description:** "How long alarm batteries can last for after the power shuts off."
- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalMetaStatsModifier

- **On the settings screen:** "Meta Stats Reduction Speed".
- **In the file:** `AnimalMetaStatsModifier = 4`, read by Lua as `SandboxVars.AnimalMetaStatsModifier`. Takes a choice from 1 to 6.
- **Choices:** 1 "Ultra Fast", 2 "Very Fast", 3 "Fast", 4 "Normal", 5 "Slow", 6 "Very Slow".
- **Default:** `4` ("Normal"). Every preset keeps the default.
- **The game's description:** "Speed at which animals stats (hunger, thirst etc.) reduce while in meta."
- **Read in:** `zombie.characters.animals.datas.AnimalData#getHungerReductionMetaMod` (line 711).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### CommonLootFactor

- **On the settings screen:** "Common Loot Factor".
- **In the file:** `CommonLootFactor = 2.0`, read by Lua as `SandboxVars.CommonLootFactor`. Takes a number from 1.0 to 3.0.
- **Default:** `2.0`. Every preset keeps the default.
- **Read in:** `zombie.inventory.ItemPickerJava#doSandboxSettings` (line 508).

### ExtremeLootFactor

- **On the settings screen:** "Extremely Rare Loot Factor".
- **In the file:** `ExtremeLootFactor = 0.2`, read by Lua as `SandboxVars.ExtremeLootFactor`. Takes a number from 0.05 to 0.6.
- **Default:** `0.2`. Every preset keeps the default.
- **Read in:** `zombie.inventory.ItemPickerJava#doSandboxSettings` (line 502).

### Farming

- **On the settings screen:** "Farming Speed".
- **In the file:** `Farming = 3`, read by Lua as `SandboxVars.Farming`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Fast", 2 "Fast", 3 "Normal", 4 "Slow", 5 "Very Slow".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "The speed of plant growth."
- **No read found.** We found no read of the value. The name appears as text in: `generation.ItemLiteratureScriptGenerator#literature_2` (lines 6682, 6695, 6708, 6721, 6734); `zombie.characters.skills.PerkFactory#init` (line 146); `zombie.characters.skills.PerkFactory$Perks#<field initializer>` (line 352); `zombie.core.Translator#<field initializer>` (line 149); `zombie.debug.debugWindows.ScenePanel#doPlayer` (line 229); `zombie.inventory.ItemPickerJava#<field initializer>` (line 124); `zombie.inventory.ItemPickerJava#getLootModifierFromType` (line 1528); `zombie.inventory.ItemPickerJava#getLootType` (line 1575); `zombie.scripting.objects.CraftRecipeCategory#<field initializer>` (line 20); `zombie.scripting.objects.CraftRecipeTag#<field initializer>` (line 34); `zombie.scripting.objects.EntityCategory#<field initializer>` (line 15); `media/lua/client/OptionScreens/SandboxOptions.lua` in `<file>` (line 53); `media/lua/client/PZAPI/ui/organisms/BuildUI.lua` in `<file>` (line 70); `media/lua/server/XpSystem/XPSystem_SkillBook.lua` in `<file>` (lines 51, 52, 53, 54, 55, 56, 57).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).
- **What the code does with it:** Not read: the only `SandboxVars.Farming` lines, in `media/lua/server/Farming/farming_vegetableconf.lua`, are commented out. Every "Farming" listed above is the skill, a loot type or a crafting category, not this option.

### InsaneLootFactor

- **On the settings screen:** "Insanely Rare Loot Factor".
- **In the file:** `InsaneLootFactor = 0.05`, read by Lua as `SandboxVars.InsaneLootFactor`. Takes a number from 0.0 to 0.2.
- **Default:** `0.05`. Every preset keeps the default.
- **Read in:** `zombie.inventory.ItemPickerJava#doSandboxSettings` (line 500).

### NightLength

- **On the settings screen:** "Length of nights".
- **In the file:** `NightLength = 3`, read by Lua as `SandboxVars.NightLength`. Takes a choice from 1 to 5.
- **Choices:** 1 "Always Night", 2 "Long", 3 "Normal", 4 "Short", 5 "Always Day".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "The time from dusk to dawn."
- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### NormalLootFactor

- **On the settings screen:** "Normal Loot Factor".
- **In the file:** `NormalLootFactor = 1.0`, read by Lua as `SandboxVars.NormalLootFactor`. Takes a number from 0.6 to 2.0.
- **Default:** `1.0`. Every preset keeps the default.
- **Read in:** `zombie.inventory.ItemPickerJava#doSandboxSettings` (line 506).

### PlantAbundance

- **On the settings screen:** "Farming's Abundance".
- **In the file:** `PlantAbundance = 3`, read by Lua as `SandboxVars.PlantAbundance`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Poor", 2 "Poor", 3 "Normal", 4 "Abundant", 5 "Very Abundant".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "The yield of plants when harvested."
- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### RareLootFactor

- **On the settings screen:** "Rare Loot Factor".
- **In the file:** `RareLootFactor = 0.6`, read by Lua as `SandboxVars.RareLootFactor`. Takes a number from 0.2 to 1.0.
- **Default:** `0.6`. Every preset keeps the default.
- **Read in:** `zombie.inventory.ItemPickerJava#doSandboxSettings` (line 504).

### StartYear

- **On the settings screen:** "Start Year".
- **In the file:** `StartYear = 1`, read by Lua as `SandboxVars.StartYear`. Takes a choice from 1 to 100.
- **Choices:** 1 "1993", 2 "1994", 3 "1995", 4 "1996", 5 "1997", 6 "1998", 7 "1999", 8 "2000", 9 "2001", 10 "2002", 11 "2003", 12 "2004", 13 "2005", 14 "2006", 15 "2007", 16 "2008", 17 "2009", 18 "2010", 19 "2011", 20 "2012", 21 "2013", 22 "2014", 23 "2015", 24 "2016", 25 "2017", 26 "2018", 27 "2019", 28 "2020", 29 "2021", 30 "2022", 31 "2023", 32 "2024", 33 "2025", 34 "2026", 35 "2027", 36 "2028", 37 "2029", 38 "2030", 39 "2031", 40 "2032", 41 "2033", 42 "2034", 43 "2035", 44 "2036", 45 "2037", 46 "2038", 47 "2039", 48 "2040", 49 "2041", 50 "2042", 51 "2043", 52 "2044", 53 "2045", 54 "2046", 55 "2047", 56 "2048", 57 "2049", 58 "2050", 59 "2051", 60 "2052", 61 "2053", 62 "2054", 63 "2055", 64 "2056", 65 "2057", 66 "2058", 67 "2059", 68 "2060", 69 "2061", 70 "2062", 71 "2063", 72 "2064", 73 "2065", 74 "2066", 75 "2067", 76 "2068", 77 "2069", 78 "2070", 79 "2071", 80 "2072", 81 "2073", 82 "2074", 83 "2075", 84 "2076", 85 "2077", 86 "2078", 87 "2079", 88 "2080", 89 "2081", 90 "2082", 91 "2083", 92 "2084", 93 "2085", 94 "2086", 95 "2087", 96 "2088", 97 "2089", 98 "2090", 99 "2091", 100 "2092".
- **Default:** `1` ("1993"). Every preset keeps the default.
- **Read in:** `zombie.SandboxOptions#applySettings` (line 456); `zombie.scripting.logic.ItemCodeOnCreate#getDate` (line 182).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
