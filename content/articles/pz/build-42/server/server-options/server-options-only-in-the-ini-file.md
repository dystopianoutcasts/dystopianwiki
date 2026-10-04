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
excerpt: 'These options are in the server''s ini file but on no page of the settings screen: anti-cheat, the bad-word filter, spawn points, towing and more. You change them by editing the file, or with `/changeoption`. Every option with its default, range and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-details-steam-and-backups
  - server-options-players-and-admins
---
# Server options only in the ini file

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

These options are in the server's ini file but on no page of the settings screen: anti-cheat, the bad-word filter, spawn points, towing and more. You change them by editing the file, or with `/changeoption`.

### AntiCheatChecksum

- **In the file:** `AntiCheatChecksum=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables checksum anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (line 39).

### AntiCheatHit

- **In the file:** `AntiCheatHit=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables character hit anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 30, 31, 32, 33, 34).

### AntiCheatNoClip

- **In the file:** `AntiCheatNoClip=4` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables character no-clipping anti-cheat protection."
- **Read in:** `zombie.characters.NetworkPlayerAI#set` (line 281); `zombie.network.anticheats.AntiCheat#<field initializer>` (line 49).

### AntiCheatPacketException

- **In the file:** `AntiCheatPacketException=4` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables packet exception checks anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 35, 36, 37).

### AntiCheatPermission

- **In the file:** `AntiCheatPermission=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables player permissions anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 43, 44).

### AntiCheatPlayer

- **In the file:** `AntiCheatPlayer=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables player anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 40, 41, 42).

### AntiCheatSafeHouse

- **In the file:** `AntiCheatSafeHouse=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables safehouse anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (lines 45, 46, 47).

### AntiCheatSafety

- **In the file:** `AntiCheatSafety=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables safety system anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (line 29).

### AntiCheatSpeed

- **In the file:** `AntiCheatSpeed=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables character speed anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (line 48).

### AntiCheatXP

- **In the file:** `AntiCheatXP=2` is the default. Takes a choice from 1 to 4: 1 ban, 2 kick, 3 log, 4 disabled.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables player XP anti-cheat protection."
- **Read in:** `zombie.network.anticheats.AntiCheat#<field initializer>` (line 38).

### BadWordListFile

- **In the file:** `BadWordListFile=` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Path to the file with the list of words to be prohibited. Each word must be on a separate line"
- **Read in:** `zombie.network.GameServer#doMinimumInit` (line 1503).

### BadWordPolicy

- **In the file:** `BadWordPolicy=3` is the default. Takes a choice from 1 to 3: 1 ban, 2 kick, 3 log.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "What to do with the sender of a bad word in the chat: 1 - ban, 2 - kick, 3 - record the violation in the database, 4 - mute"
- **Read in:** `zombie.network.chat.ChatServer#processMessageFromPlayerPacket` (lines 180, 182, 185, 188).
- **What the code does with it:** When the word filter flags a chat message, the server bans (1), kicks (2) or logs (3) the sender. The range is 1 to 3, so the "4 - mute" in the description cannot be set: a 4 in the file is refused and the value stays where it was.

### BadWordReplacement

- **In the file:** `BadWordReplacement=[HIDDEN]` is the default. Takes text, up to 16 characters.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "The symbol or piece of text that will replace the bad word"
- **Read in:** `zombie.network.chat.ChatServer#processMessageFromPlayerPacket` (line 199).

### BanKickGlobalSound

- **In the file:** `BanKickGlobalSound=true` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.commands.serverCommands.BanUserCommand#Command` (line 78); `zombie.commands.serverCommands.KickUserCommand#Command` (line 82).

### BloodSplatLifespanDays

- **In the file:** `BloodSplatLifespanDays=0` is the default. Takes a whole number from 0 to 365.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Number of days before old blood splats are removed. Removal happens when map chunks are loaded. Zero means they will never disappear"
- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.
- **What the code does with it:** This server option is read nowhere. The sandbox option with the same name, `BloodSplatLifespanDays`, is the one `IsoChunk` and `IsoObject` read.

### CarEngineAttractionModifier

- **In the file:** `CarEngineAttractionModifier=0.5` is the default. Takes a number from 0.0 to 10.0.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Modify the range of zombie attraction to cars. (Lower values can help with lag.)"
- **Read in:** `zombie.vehicles.VehicleEngine#updateWorldSounds` (lines 271, 272).
- **What the code does with it:** On the server, the loudness of the world sound a running engine makes is multiplied by this value.

### ChatStreams

- **In the file:** `ChatStreams=s,r,a,w,y,sh,f,all` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.chat.ChatUtility#getAllowedChatStreams` (line 188).

### DenyLoginOnOverloadedServer

- **In the file:** `DenyLoginOnOverloadedServer=true` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.network.packets.connection.LoginPacket#processServer` (line 111).

### DisableBurntTowing

- **In the file:** `DisableBurntTowing=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables burnt vehicle towing"
- **Read in:** `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachBurntToOther` (line 478); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachTrailerToOther` (line 504); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachVehicleToOther` (line 540); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.doTowingMenu` (line 576).

### DisableScoreboard

- **In the file:** `DisableScoreboard=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables scoreboard."
- **Read in:** `zombie.network.packets.service.ScoreboardUpdatePacket#processServer` (line 102).

### DisableTrailerTowing

- **In the file:** `DisableTrailerTowing=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables trailer towing"
- **Read in:** `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachBurntToOther` (line 482); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachTrailerToOther` (line 508); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachVehicleToOther` (line 544); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.doTowingMenu` (line 580).

### DisableVehicleTowing

- **In the file:** `DisableVehicleTowing=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Disables vehicle towing"
- **Read in:** `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachBurntToOther` (line 486); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachTrailerToOther` (line 512); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `TowMenu.attachVehicleToOther` (line 548); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.doTowingMenu` (line 584).

### GoodWordListFile

- **In the file:** `GoodWordListFile=` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Path to the file with the list of words that should be allowed, even if they contain bad word. Each word should be on a separate line."
- **Read in:** `zombie.network.GameServer#doMinimumInit` (line 1503).

### HideAdminsInPlayerList

- **In the file:** `HideAdminsInPlayerList=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Hides admins in the player list."
- **Read in:** `zombie.network.packets.service.ScoreboardUpdatePacket#processServer` (line 101).

### KnockedDownAllowed

- **In the file:** `KnockedDownAllowed=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "WIP: Activating this setting may cause visual desynchronization of player positions."
- **Read in:** `zombie.characters.IsoPlayer#postHitByVehicleUpdateStance` (line 1966); `zombie.characters.IsoPlayer#hitConsequences` (line 4097); `zombie.characters.NetworkPlayerAI#update` (line 600).

### LoginQueueConnectTimeout

- **In the file:** `LoginQueueConnectTimeout=60` is the default. Takes a whole number from 20 to 1200.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.network.LoginQueue#receiveServerLoginQueueRequest` (line 77); `zombie.network.LoginQueue#loadNextPlayer` (lines 175, 184).

### LoginQueueEnabled

- **In the file:** `LoginQueueEnabled=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.network.LoginQueue#receiveServerLoginQueueRequest` (line 53); `zombie.network.LoginQueue#isInTheQueue` (line 139); `zombie.network.LoginQueue#update` (line 149).

### Map

- **In the file:** `Map=Muldraugh, KY` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Enter the foldername of the mod found in \\Steam\\steamapps\\workshop\\modID\\mods\\modName\\media\\maps\\"
- **Read in:** `zombie.network.GameServer#main` (lines 645, 680); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenMapsPanel:setSettings` (line 1102); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenMapsPanel:settingsFromUI` (line 1119); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `DefaultServerSettings:setDefaultsFromSingleplayer` (line 2322).

### MaxPacketsPerSecond

- **In the file:** `MaxPacketsPerSecond=300` is the default. Takes a whole number from 100 to 1000.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Sets the limit for processing network packets from each client on the server."
- **Read in:** `zombie.network.PacketsCache#isLimitExceeded` (line 74).

### MaxSafezoneSize

- **In the file:** `MaxSafezoneSize=20000` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.network.packets.safehouse.SafezoneClaimPacket#isConsistent` (line 86).

### Mods

- **In the file:** `Mods=` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Enter the mod loading ID here. It can be found in \\Steam\\steamapps\\workshop\\modID\\mods\\modName\\info.txt"
- **Read in:** `zombie.network.GameServer#main` (line 656); `zombie.network.GameServer#setupSteamGameServer` (lines 1202, 1207); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenModsPanel:setSettings` (line 826); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenModsPanel:settingsFromUI` (line 837); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenMapsPanel:setSettings` (line 1099); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `finalFunc` (line 3075); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `Page3.ChooseModsWindow:aboutToShow` (line 3130).

### MultiplayerStatisticsPeriod

- **In the file:** `MultiplayerStatisticsPeriod=1` is the default. Takes a whole number from 0 to 10.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Sets the multiplayer update period in seconds. Statistics is disabled if value is 0."
- **Read in:** `zombie.network.statistics.data.NetworkStatistic#updateConnection` (line 85); `zombie.network.statistics.StatisticManager#update` (line 148).

### PVPLogToolChat

- **In the file:** `PVPLogToolChat=true` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "PVP is logged to admin chat"
- **Read in:** `zombie.network.PVPLogTool#log` (line 83); `media/lua/client/ISUI/AdminPanel/ISPVPLogToolUI.lua` in `ISPVPLogToolUI:initialise` (line 40).

### PVPLogToolFile

- **In the file:** `PVPLogToolFile=true` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "PVP is logged to file"
- **Read in:** `zombie.network.PVPLogTool#log` (line 87); `media/lua/client/ISUI/AdminPanel/ISPVPLogToolUI.lua` in `ISPVPLogToolUI:initialise` (line 43).

### SafetyDisconnectDelay

- **In the file:** `SafetyDisconnectDelay=60` is the default. Takes a whole number from 0 to 60.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.SafetySystemManager#getCooldown` (lines 196, 213); `zombie.network.GameClient#timeoutRemotePlayers` (line 537); `zombie.network.GameServer$DelayedConnection#DelayedConnection` (line 4420).

### Seed

- **In the file:** `Seed=` followed by a value computed when the options are created: `GameServer.seed`. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "The worldgen seed used to generate the world. If you want to change this, put a new value in and delete map\_worldgen.bin in your save directory."
- **Read in:** `zombie.iso.IsoWorld#init` (line 1876).
- **Changed in:** `zombie.iso.IsoWorld#init` (line 1879); `zombie.network.GameServer#main` (line 566).

### server_browser_announced_ip

- **In the file:** `server_browser_announced_ip=` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Set the IP from which the server is broadcast. This is for network configurations with multiple IP addresses, such as server farms"
- **Read in:** `zombie.util.PublicServerUtil#init` (line 97); `zombie.util.PublicServerUtil#insertDatas` (lines 179, 180); `zombie.util.PublicServerUtil#updatePlayers` (lines 225, 226).

### SneakModeHideFromOtherPlayers

- **In the file:** `SneakModeHideFromOtherPlayers=true` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.IsoPlayer#checkCanSeeClient` (line 5996).

### SpawnPoint

- **In the file:** `SpawnPoint=0,0,0` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Force every new player to spawn at these set x,y,z world coordinates. Find desired coordinates at map.projectzomboid.com. (Ignored when 0,0,0)"
- **Read in:** `zombie.iso.IsoWorld#init` (lines 2111, 2112, 2119, 2125, 2304, 2305, 2307, 2330); `zombie.iso.SpawnPoints#parseServerSpawnPoint` (lines 68, 71, 82, 85); `zombie.network.packets.character.CreatePlayerPacket#processServer` (lines 203, 204, 205, 212, 215); `media/lua/client/OptionScreens/MapSpawnSelect.lua` in `MapSpawnSelect:getFixedSpawnRegion` (line 396); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `SpawnRegionsPanel:setSettings` (line 674); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `SpawnRegionsPanel:settingsFromUI` (line 688).

### SteamVAC

- **In the file:** `SteamVAC=true` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "Enable the Steam VAC system"
- **Read in:** `zombie.network.GameServer#main` (line 668).
- **Changed in:** `zombie.network.GameServer#main` (line 629).

### SwitchZombiesOwnershipEachUpdate

- **In the file:** `SwitchZombiesOwnershipEachUpdate=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.popman.NetworkZombieManager#updateAuth` (line 69).

### UltraSpeedDoesnotAffectToAnimals

- **In the file:** `UltraSpeedDoesnotAffectToAnimals=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.animals.behavior.BaseAnimalBehavior#pickRandomWanderInterval` (line 304); `zombie.characters.animals.datas.AnimalData#updateHungerAndThirst` (line 358); `zombie.characters.animals.datas.AnimalData#getHealthLoss` (line 485).

### UsePhysicsHitReaction

- **In the file:** `UsePhysicsHitReaction=false` is the default. Takes true or false.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.IsoGameCharacter#canRagdoll` (line 16166).

### WebhookAddress

- **In the file:** `WebhookAddress=` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "The Slack incoming webhook URL"
- **Read in:** `zombie.network.GameServer#startServer` (line 1556).
- **What the code does with it:** When it is not empty, the server starts a `StackBot` with this address at start-up. It is not one of the options kept off the public list, so its value is written to every joining player along with the other public options.

### WorkshopItems

- **In the file:** `WorkshopItems=` is the default. Takes text.
- **Settings screen:** not on any page. **Sent to joining players:** yes.
- **The game's description:** "List Workshop Mod IDs for the server to download. Each must be separated by a semicolon. Example: WorkshopItems=514427485;513111049"
- **Read in:** `zombie.network.GameServer#main` (line 682); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenWorkshopPanel:setSettings` (line 1423); `media/lua/client/OptionScreens/ServerSettingsScreen.lua` in `ServerSettingsScreenWorkshopPanel:settingsFromUI` (line 1434).

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
