---
slug: server-options-details-steam-and-backups
title: 'Server options: details, Steam and backups'
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
excerpt: 'The options on the first pages of the server settings screen: the server''s name and port, the password, Steam, and the automatic backups. Every option with its default, range and where Build 9.99 reads it.'
last_updated: '2000-01-01'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-players-and-admins
  - server-options-pvp-safehouses-and-factions
---
# Server options: details, Steam and backups

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

The options on the first pages of the server settings screen: the server's name and port, the password, Steam, and the automatic backups.

## Details

### PublicName

- **In the file:** `PublicName=My Server` is the default. Takes text, up to 64 characters.
- **Settings screen:** the "Details" page. **Sent to joining players:** yes.
- **The game's description:** "Name shown in the browser"
- **Read in:** `zombie.fixture.Browser#announce` (line 20).
- **Changed in:** `zombie.fixture.Admin#rename` (line 2).

### Password

- **In the file:** `Password=` is the default. Takes text.
- **Settings screen:** the "Details" page. **Sent to joining players:** no.
- **No read found.** We found no read of the value. The name appears as text in: `media/lua/client/Login.lua` in `Login.draw` (line 7).

## Mods

This page of the settings screen has no options of its own: it is a custom panel (`ServerSettingsScreenModsPanel`).

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 9.99 (revision 0f0f0f0f0f).
