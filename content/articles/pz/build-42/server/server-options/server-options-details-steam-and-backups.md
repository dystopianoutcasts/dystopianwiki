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
excerpt: 'The options on the first pages of the server settings screen: the server''s name and port, the password, Steam, and the automatic backups. Every option with its default, range and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-players-and-admins
  - server-options-pvp-safehouses-and-factions
---
# Server options: details, Steam and backups

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

The options on the first pages of the server settings screen: the server's name and port, the password, Steam, and the automatic backups.

## Details

### DefaultPort

- **In the file:** `DefaultPort=16261` is the default. Takes a whole number from 0 to 65535.
- **Settings screen:** the "Details" page. **Sent to joining players:** yes.
- **The game's description:** "Default starting port for player data. If UDP, this is this one of two ports used."
- **Read in:** `zombie.network.GameServer#main` (line 632); `zombie.util.PublicServerUtil#insertDatas` (line 191); `zombie.util.PublicServerUtil#updatePlayers` (line 230).
- **Changed in:** `zombie.network.GameServer#main` (line 621).

### PublicName

- **In the file:** `PublicName=My PZ Server` is the default. Takes text, up to 64 characters.
- **Settings screen:** the "Details" page. **Sent to joining players:** yes.
- **The game's description:** "Name of the server displayed in the in-game browser and, if applicable, the Steam browser"
- **Read in:** `zombie.network.GameServer#main` (lines 639, 679); `zombie.network.GameServer#setupSteamGameServer` (line 1194); `zombie.util.PublicServerUtil#init` (line 44); `zombie.util.PublicServerUtil#isPublic` (line 138); `zombie.util.PublicServerUtil#insertDatas` (line 188).
- **Changed in:** `zombie.network.GameServer#main` (line 641); `zombie.util.PublicServerUtil#init` (line 44).

### PublicDescription

- **In the file:** `PublicDescription=` is the default. Takes text, up to 256 characters.
- **Settings screen:** the "Details" page. **Sent to joining players:** yes.
- **The game's description:** "Description displayed in the in-game public server browser. Typing will create a new line in your description"
- **Read in:** `zombie.network.GameServer#setupSteamGameServer` (line 1195); `zombie.util.PublicServerUtil#init` (line 45); `zombie.util.PublicServerUtil#insertDatas` (lines 163, 164).
- **Changed in:** `zombie.util.PublicServerUtil#init` (line 45).

### Public

- **In the file:** `Public=false` is the default. Takes true or false.
- **Settings screen:** the "Details" page. **Sent to joining players:** yes.
- **The game's description:** "Shows the server on the in-game browser. (Note: Steam-enabled servers are always visible in the Steam server browser)"
- **Read in:** `zombie.network.GameServer#setupSteamGameServer` (lines 1198, 1200); `zombie.util.PublicServerUtil#isPublic` (line 139).

### Password

- **In the file:** `Password=` is the default. Takes text.
- **Settings screen:** the "Details" page. **Sent to joining players:** no.
- **The game's description:** "Clients must know this password to join the server. (Ignored when hosting a server via the Host button)"
- **Read in:** `zombie.commands.serverCommands.ChangeOptionCommand#Command` (line 47); `zombie.commands.serverCommands.ReloadOptionsCommand#Command` (line 45); `zombie.network.GameServer#startServer` (line 1512); `zombie.util.PublicServerUtil#insertDatas` (line 201); `media/lua/client/OptionScreens/CoopOptionsScreen.lua` in `CoopOptionsScreen:onStartButtonDown` (line 522).

### PauseEmpty

- **In the file:** `PauseEmpty=true` is the default. Takes true or false.
- **Settings screen:** the "Details" page. **Sent to joining players:** yes.
- **The game's description:** "Game time stops when there are no players online"
- **Read in:** `zombie.gameStates.IngameState#updateInternal` (line 1526); `zombie.GameTime#isGamePaused` (line 193).
- **What the code does with it:** On the server, the game counts as paused while no player is connected and this is true.

### ResetID

- **In the file:** `ResetID=` followed by a value computed when the options are created: `Rand.Next(1000000000)`. Takes a whole number from 0 to 2147483647.
- **Settings screen:** the "Details" page. **Sent to joining players:** yes.
- **The game's description:** "Reset ID determines if the server has undergone a soft-reset. If this number does match the client, the client must create a new character. Used in conjunction with PlayerServerID. It is strongly advised that you backup these IDs somewhere"
- **Read in:** `zombie.network.GameServer#startServer` (line 1528).
- **Changed in:** `zombie.iso.IsoWorld#init` (line 1819); `zombie.iso.WorldConverter#softreset` (line 365); `zombie.network.GameServer#main` (line 805).

## Steam

The settings screen shows this page only on Steam servers.

### UDPPort

- **In the file:** `UDPPort=16262` is the default. Takes a whole number from 0 to 65535.
- **Settings screen:** the "Steam" page. **Sent to joining players:** yes.
- **Read in:** `zombie.gameStates.GameLoadingState#enter` (line 143); `zombie.network.GameServer#main` (lines 633, 760); `zombie.util.PublicServerUtil#insertDatas` (line 193).
- **Changed in:** `zombie.network.GameServer#main` (line 625).

### MaxAccountsPerUser

- **In the file:** `MaxAccountsPerUser=0` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** the "Steam" page. **Sent to joining players:** yes.
- **The game's description:** "Limits the number of different accounts a single Steam user may create on this server. Ignored when using the Hosts button."
- **Read in:** `zombie.network.ServerWorldDatabase#isNewAccountAllowed` (line 1211).
- **What the code does with it:** 0 or less turns it off, and so does a server not running in Steam mode. Otherwise the server counts the other accounts that use the same SteamID before it allows a new one.

### SteamScoreboard

- **In the file:** `SteamScoreboard=false` is the default. Takes true or false.
- **Settings screen:** the "Steam" page. **Sent to joining players:** yes.
- **The game's description:** "Show Steam usernames and avatars in the Players list."
- **Read in:** `zombie.Lua.LuaManager$GlobalObject#getSteamScoreboard` (line 9421); `zombie.network.packets.service.ScoreboardUpdatePacket#processServer` (line 96).

## Backups

### BackupsCount

- **In the file:** `BackupsCount=5` is the default. Takes a whole number from 1 to 300.
- **Settings screen:** the "Backups" page. **Sent to joining players:** yes.
- **Read in:** `zombie.core.backup.ZipBackup#rotateBackupFile` (line 187).

### BackupsOnStart

- **In the file:** `BackupsOnStart=true` is the default. Takes true or false.
- **Settings screen:** the "Backups" page. **Sent to joining players:** yes.
- **Read in:** `zombie.core.backup.ZipBackup#onStartup` (line 56).

### BackupsOnVersionChange

- **In the file:** `BackupsOnVersionChange=true` is the default. Takes true or false.
- **Settings screen:** the "Backups" page. **Sent to joining players:** yes.
- **Read in:** `zombie.core.backup.ZipBackup#onVersion` (line 62).

### BackupsPeriod

- **In the file:** `BackupsPeriod=0` is the default. Takes a whole number from 0 to 1500.
- **Settings screen:** the "Backups" page. **Sent to joining players:** yes.
- **Read in:** `zombie.core.backup.ZipBackup#onPeriod` (line 74).

## Steam Workshop

This page of the settings screen has no options of its own: it is a custom panel (`ServerSettingsScreenWorkshopPanel`). It is shown only on Steam servers.

## Mods

This page of the settings screen has no options of its own: it is a custom panel (`ServerSettingsScreenModsPanel`).

## Map

This page of the settings screen has no options of its own: it is a custom panel (`ServerSettingsScreenMapsPanel`).

## Spawn Regions

This page of the settings screen has no options of its own: it is a custom panel (`SpawnRegionsPanel`).

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
