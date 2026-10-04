---
slug: server-options-pvp-safehouses-and-factions
title: 'Server options: PVP, safehouses, factions, fire and loot'
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
excerpt: 'Everything that decides how players treat each other: PVP and its damage, safehouses, factions, the war system, fire and loot respawn in safehouses. Every option with its default, range and where Build 9.99 reads it.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-details-steam-and-backups
  - server-options-players-and-admins
---
# Server options: PVP, safehouses, factions, fire and loot

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Everything that decides how players treat each other: PVP and its damage, safehouses, factions, the war system, fire and loot respawn in safehouses.

## PVP

The settings screen shows this page only on Steam servers.

### PVP

- **In the file:** `PVP=true` is the default. Takes true or false.
- **Settings screen:** the "PVP" page. **Sent to joining players:** yes.
- **The game's description:** "Players can hurt other players"
- **Read in:** `zombie.fixture.Combat#hit` (lines 5, 9); `media/lua/client/Fixture.lua` in `Fixture.check` (line 3).
- **What the code does with it:** Fixture: players may hurt each other.

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 9.99 (revision 0f0f0f0f0f).
