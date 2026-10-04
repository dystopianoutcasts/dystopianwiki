---
slug: server-options-only-in-the-ini-file
title: 'Server options only in the ini file'
game: pz
version: build-42
section: server
category: server-options
difficulty: beginner
tags:
  - server
  - server-options
  - multiplayer
  - generated
excerpt: 'These options are in the server''s ini file but on no page of the settings screen: anti-cheat, the bad-word filter, spawn points, towing and more. You change them by editing the file, or with `/changeoption`. Every option with its default, range and where Build 9.99 reads it.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-details-steam-and-backups
  - server-options-players-and-admins
---
# Server options only in the ini file

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

These options are in the server's ini file but on no page of the settings screen: anti-cheat, the bad-word filter, spawn points, towing and more. You change them by editing the file, or with `/changeoption`.

### AntiCheatFixture

- **In the file:** `AntiCheatFixture=2` is the default. Takes a choice from 1 to 3: 1 ban, 2 kick, 3 log.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Fixture anti-cheat"
- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.

### ResetID

- **In the file:** `ResetID=` followed by a value computed when the options are created: `Rand.Next(1000)`. Takes a whole number from 0 to 2147483647.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Reset marker"
- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.
- **What the code does with it:** Fixture: read nowhere.

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 9.99 (revision 0f0f0f0f0f).
