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
excerpt: 'These options are in the server''s ini file but on no option page of the host''s settings screen (`Map` and `Mods` get panels of their own there): anti-cheat, the bad-word filter, spawn points, towing and more. You change them by editing the file, with `/changeoption`, or, for every option on the public list, in the in-game admin panel''s Server Options list, which sends `/changeoption` for you. Every option with its default, range and where Build 42.22 reads it.'
last_updated: '2026-11-09'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-details-steam-and-backups
  - server-options-players-and-admins
---
# Server options only in the ini file

> **Generated from the code.** This page is generated from Build 42.22 (revision 3d39148846) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

These options are in the server's ini file but on no option page of the host's settings screen (`Map` and `Mods` get panels of their own there): anti-cheat, the bad-word filter, spawn points, towing and more. You change them by editing the file, with `/changeoption`, or, for every option on the public list, in the in-game admin panel's Server Options list, which sends `/changeoption` for you.

### AntiCheatChecksum

- **In the file:** `AntiCheatChecksum=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables checksum anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (line 38).

### AntiCheatHit

- **In the file:** `AntiCheatHit=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables character hit anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 30, 31, 32, 33).

### AntiCheatNoClip

- **In the file:** `AntiCheatNoClip=4` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables character no-clipping anti-cheat protection."
- **Read in:** `zombie.characters.NetworkPlayerAI#set` (line 300); `zombie.network.anticheats.AntiCheat#<field initializer>` (line 48).

### AntiCheatPacketException

- **In the file:** `AntiCheatPacketException=4` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables packet exception checks anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 34, 35, 36).

### AntiCheatPermission

- **In the file:** `AntiCheatPermission=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables player permissions anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 42, 43).

### AntiCheatPlayer

- **In the file:** `AntiCheatPlayer=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables player anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 39, 40, 41).

### AntiCheatSafeHouse

- **In the file:** `AntiCheatSafeHouse=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables safehouse anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 44, 45, 46).

### AntiCheatSafety

- **In the file:** `AntiCheatSafety=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables safety system anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (line 29).

### AntiCheatSpeed

- **In the file:** `AntiCheatSpeed=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables character speed anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (line 47).

### AntiCheatXP

- **In the file:** `AntiCheatXP=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables player XP anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (line 37).

### BadWordListFile

- **In the file:** `BadWordListFile=` is the default. Takes text.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Path to the file with the list of words to be prohibited. Each word must be on a separate line"
- **Read in:** `zombie.network.GameServer#doMinimumInit` (line 1543).

### BadWordPolicy

- **In the file:** `BadWordPolicy=3` is the default. Takes a choice from 1 to 3: 1 ban, 2 kick, 3 log.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "What to do with the sender of a bad word in the chat: 1 - ban, 2 - kick, 3 - record the violation in the database, 4 - mute"
- **Read in:** `zombie.network.chat.ChatServer#processMessageFromPlayerPacket` (lines 186, 188, 191, 194).
- **What the code does with it:** When the word filter flags a chat message, the server bans (1), kicks (2) or logs (3) the sender. The range is 1 to 3, so the "4 - mute" in the description cannot be set: a 4 in the file is refused and the value stays where it was.

### BadWordReplacement

- **In the file:** `BadWordReplacement=[HIDDEN]` is the default. Takes text, up to 16 characters.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "The symbol or piece of text that will replace the bad word"
- **Read in:** `zombie.network.chat.ChatServer#processMessageFromPlayerPacket` (line 205).

### BanKickGlobalSound

- **In the file:** `BanKickGlobalSound=true` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.commands.serverCommands.BanUserCommand#Command` (line 78); `zombie.commands.serverCommands.KickUserCommand#Command` (line 82).

### BloodSplatLifespanDays

- **In the file:** `BloodSplatLifespanDays=0` is the default. Takes a whole number from 0 to 365.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Number of days before old blood splats are removed. Removal happens when map chunks are loaded. Zero means they will never disappear"
- **Not read by the game code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.
- **What the code does with it:** This server option is read nowhere. The sandbox option with the same name, `BloodSplatLifespanDays`, is the one `IsoChunk` and `IsoObject` read.

### CarEngineAttractionModifier

- **In the file:** `CarEngineAttractionModifier=0.5` is the default. Takes a number from 0.0 to 10.0.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Modify the range of zombie attraction to cars. (Lower values can help with lag.)"
- **Read in:** `zombie.vehicles.VehicleEngine#updateWorldSounds` (lines 271, 272).
- **What the code does with it:** On the server, the loudness of the world sound a running engine makes is multiplied by this value. The roll that decides whether a sound is made is also scaled by it (1 in 120 times the value, before the game-speed factor).

### ChatStreams

- **In the file:** `ChatStreams=s,r,a,w,y,sh,f,all` is the default. Takes text.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.chat.ChatUtility#getAllowedChatStreams` (line 188).

### DenyLoginOnOverloadedServer

- **In the file:** `DenyLoginOnOverloadedServer=true` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.network.packets.connection.LoginPacket#processServer` (line 111).

### DisableBurntTowing

- **In the file:** `DisableBurntTowing=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables burnt vehicle towing"
- **Read in:** `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachBurntToOther` (line 480); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachTrailerToOther` (line 506); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachVehicleToOther` (line 542); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.doTowingMenu` (line 578).

### DisableScoreboard

- **In the file:** `DisableScoreboard=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables scoreboard."
- **Read in:** `zombie.network.packets.service.ScoreboardUpdatePacket#processServer` (line 102).

### DisableTrailerTowing

- **In the file:** `DisableTrailerTowing=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables trailer towing"
- **Read in:** `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachBurntToOther` (line 484); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachTrailerToOther` (line 510); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachVehicleToOther` (line 546); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.doTowingMenu` (line 582).

### DisableVehicleTowing

- **In the file:** `DisableVehicleTowing=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Disables vehicle towing"
- **Read in:** `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachBurntToOther` (line 488); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachTrailerToOther` (line 514); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachVehicleToOther` (line 550); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.doTowingMenu` (line 586).

### GoodWordListFile

- **In the file:** `GoodWordListFile=` is the default. Takes text.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Path to the file with the list of words that should be allowed, even if they contain bad word. Each word should be on a separate line."
- **Read in:** `zombie.network.GameServer#doMinimumInit` (line 1543).

### HideAdminsInPlayerList

- **In the file:** `HideAdminsInPlayerList=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Hides admins in the player list."
- **Read in:** `zombie.network.packets.service.ScoreboardUpdatePacket#processServer` (line 101).

### KnockedDownAllowed

- **In the file:** `KnockedDownAllowed=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "WIP: Activating this setting may cause visual desynchronization of player positions."
- **Read in:** `zombie.characters.IsoPlayer#postHitByVehicleUpdateStance` (line 1971); `zombie.characters.IsoPlayer#hitConsequences` (line 4082); `zombie.characters.NetworkPlayerAI#update` (line 635).

### LoginQueueConnectTimeout

- **In the file:** `LoginQueueConnectTimeout=60` is the default. Takes a whole number from 20 to 1200.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.network.LoginQueue#receiveServerLoginQueueRequest` (line 77); `zombie.network.LoginQueue#loadNextPlayer` (lines 175, 184).

### LoginQueueEnabled

- **In the file:** `LoginQueueEnabled=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.network.LoginQueue#receiveServerLoginQueueRequest` (line 53); `zombie.network.LoginQueue#isInTheQueue` (line 139); `zombie.network.LoginQueue#update` (line 149).

### Map

- **In the file:** `Map=Muldraugh, KY` is the default. Takes text.
- **Settings screen:** its own "Map" panel, not an option page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Enter the foldername of the mod found in \\Steam\\steamapps\\workshop\\modID\\mods\\modName\\media\\maps\\"
- **Read in:** `zombie.network.GameServer#main` (lines 656, 691); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenMapsPanel:setSettings` (line 1102); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenMapsPanel:settingsFromUI` (line 1119); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `DefaultServerSettings:setDefaultsFromSingleplayer` (line 2322).

### MaxPacketsPerSecond

- **In the file:** `MaxPacketsPerSecond=300` is the default. Takes a whole number from 100 to 1000.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Sets the limit for processing network packets from each client on the server."
- **Read in:** `zombie.network.PacketsCache#isLimitExceeded` (line 100).

### MaxSafezoneSize

- **In the file:** `MaxSafezoneSize=20000` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.network.packets.safehouse.SafezoneClaimPacket#isConsistent` (line 91).

### Mods

- **In the file:** `Mods=` is the default. Takes text.
- **Settings screen:** its own "Mods" panel, not an option page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Enter the mod loading ID here. It can be found in \\Steam\\steamapps\\workshop\\modID\\mods\\modName\\info.txt"
- **Read in:** `zombie.network.GameServer#main` (line 667); `zombie.network.GameServer#setupSteamGameServer` (lines 1242, 1247); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenModsPanel:setSettings` (line 826); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenModsPanel:settingsFromUI` (line 837); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenMapsPanel:setSettings` (line 1099); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `finalFunc` (line 3075); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `Page3.ChooseModsWindow:aboutToShow` (line 3130).

### MultiplayerStatisticsPeriod

- **In the file:** `MultiplayerStatisticsPeriod=1` is the default. Takes a whole number from 0 to 10.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Sets the multiplayer update period in seconds. Statistics is disabled if value is 0."
- **Read in:** `zombie.network.statistics.data.NetworkStatistic#updateConnection` (line 85); `zombie.network.statistics.StatisticManager#update` (line 148).

### PVPLogToolChat

- **In the file:** `PVPLogToolChat=true` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "PVP is logged to admin chat"
- **Read in:** `zombie.network.PVPLogTool#log` (line 89); `media/lua/client/ISUI/AdminPanel/ISPVPLogToolUI.lua` in `ISPVPLogToolUI:initialise` (line 40).

### PVPLogToolFile

- **In the file:** `PVPLogToolFile=true` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "PVP is logged to file"
- **Read in:** `zombie.network.PVPLogTool#log` (line 93); `media/lua/client/ISUI/AdminPanel/ISPVPLogToolUI.lua` in `ISPVPLogToolUI:initialise` (line 43).

### SafetyDisconnectDelay

- **In the file:** `SafetyDisconnectDelay=60` is the default. Takes a whole number from 0 to 60.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.SafetySystemManager#getCooldown` (lines 196, 213); `zombie.network.GameServer$DelayedConnection#DelayedConnection` (line 4430).

### Seed

- **In the file:** `Seed=` followed by a value computed when the options are created: `GameServer.seed`. Takes text.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "The worldgen seed used to generate the world. If you want to change this, put a new value in and delete map\_worldgen.bin in your save directory."
- **Read in:** `zombie.iso.IsoWorld#init` (line 1889).
- **Changed in:** `zombie.iso.IsoWorld#init` (line 1892); `zombie.network.GameServer#main` (line 577).

### server_browser_announced_ip

- **In the file:** `server_browser_announced_ip=` is the default. Takes text.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Set the IP from which the server is broadcast. This is for network configurations with multiple IP addresses, such as server farms"
- **Read in:** `zombie.util.PublicServerUtil#init` (line 97); `zombie.util.PublicServerUtil#insertDatas` (lines 179, 180); `zombie.util.PublicServerUtil#updatePlayers` (lines 225, 226).

### SneakModeHideFromOtherPlayers

- **In the file:** `SneakModeHideFromOtherPlayers=true` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.IsoPlayer#checkCanSeeClient` (line 6002).

### SpawnPoint

- **In the file:** `SpawnPoint=0,0,0` is the default. Takes text.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Force every new player to spawn at these set x,y,z world coordinates. Find desired coordinates at map.projectzomboid.com. (Ignored when 0,0,0)"
- **Read in:** `zombie.iso.IsoWorld#init` (lines 2121, 2122, 2129, 2135, 2315, 2316, 2318, 2341); `zombie.iso.SpawnPoints#parseServerSpawnPoint` (lines 68, 71, 82, 85); `zombie.network.packets.character.CreatePlayerPacket#processServer` (lines 203, 204, 205, 212, 215); `media/lua/client/OptionScreens/MapSpawnSelect.lua` in `MapSpawnSelect:getFixedSpawnRegion` (line 396); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `SpawnRegionsPanel:setSettings` (line 674); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `SpawnRegionsPanel:settingsFromUI` (line 688).

### SteamVAC

- **In the file:** `SteamVAC=true` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "Enable the Steam VAC system"
- **Read in:** `zombie.network.GameServer#main` (line 679).
- **Changed in:** `zombie.network.GameServer#main` (line 640).

### SwitchZombiesOwnershipEachUpdate

- **In the file:** `SwitchZombiesOwnershipEachUpdate=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.popman.NetworkZombieManager#updateAuth` (line 69).

### UltraSpeedDoesnotAffectToAnimals

- **In the file:** `UltraSpeedDoesnotAffectToAnimals=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.animals.behavior.BaseAnimalBehavior#pickRandomWanderInterval` (line 304); `zombie.characters.animals.datas.AnimalData#updateHungerAndThirst` (line 358); `zombie.characters.animals.datas.AnimalData#getHealthLoss` (line 485).

### UsePhysicsHitReaction

- **In the file:** `UsePhysicsHitReaction=false` is the default. Takes true or false.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.IsoGameCharacter#canRagdoll` (line 16412).

### WebhookAddress

- **In the file:** `WebhookAddress=` is the default. Takes text.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "The Slack incoming webhook URL"
- **Read in:** `zombie.network.GameServer#startServer` (line 1596).
- **What the code does with it:** When it is not empty, the server starts a `StackBot` with this address at start-up. It is not one of the options kept off the public list, so its value is written to every joining player along with the other public options.

### WorkshopItems

- **In the file:** `WorkshopItems=` is the default. Takes text.
- **Settings screen:** not on any page; the in-game admin panel's Server Options list shows it. **Sent to joining players:** yes.
- **The game's description:** "List Workshop Mod IDs for the server to download. Each must be separated by a semicolon. Example: WorkshopItems=514427485;513111049"
- **Read in:** `zombie.network.GameServer#main` (line 693); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenWorkshopPanel:setSettings` (line 1423); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenWorkshopPanel:settingsFromUI` (line 1434).

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.22 (revision 3d39148846).
