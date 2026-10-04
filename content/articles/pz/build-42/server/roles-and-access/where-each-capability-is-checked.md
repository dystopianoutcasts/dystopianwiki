---
slug: where-each-capability-is-checked
title: 'Where each capability is checked (Build 42.21)'
game: pz
version: build-42
section: server
category: roles-and-access
difficulty: advanced
tags:
  - server
  - admin
  - roles
  - reference
  - generated
excerpt: 'Every Build 42.21 capability with the Java and Lua code that checks it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - server-roles-and-capabilities
  - admin-commands
---
# Where each capability is checked

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

For each of the 98 capabilities, the places in the Java and the vanilla Lua that check it. Commands are listed with the command instead (their capability is part of the command's declaration). A capability with no check here and no command does nothing by itself in 42.21.

### None

- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.PacketTypes$PacketAuthorization#isAuthorized` (line 312); `zombie.network.PacketTypes$PacketType#<field initializer>` (line 441).

### LoginOnServer

- **The game's description:** "Allows player to login to server."
- **Built-in roles:** `user`, `priority`, `observer`, `gm`, `moderator`, `admin`
- **Commands that need it:** `/help`, `/clear`, `/list`
- **Checked in:** `zombie.characters.Roles#addRole` (line 139); `zombie.network.packets.connection.GoogleAuthKeyPacket#processServer` (line 106); `zombie.network.packets.connection.LoginPacket#processServer` (line 225); `zombie.network.PacketTypes$PacketType#<field initializer>` (lines 416, 422, 438, 442, 443, 444, 504, 505, 508, 512, 513, 516, 517, 520, 521, 524, 525, 528, 530, 532, 533, 535, 536, 538, 540, 541, 542, 548, 566, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 615, 616, 617, 618, 619, 622); `zombie.network.PacketTypes$PacketType#PacketType` (line 683); `zombie.network.ServerWorldDatabase#authClient` (line 1086).

### PriorityLogin

- **The game's description:** "Player get preferential treatment when logging into a full server. The player can also create an unlimited number of accounts."
- **Built-in roles:** `priority`, `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.network.LoginQueue#receiveServerLoginQueueRequest` (lines 49, 55, 61, 63, 64); `zombie.network.ServerWorldDatabase#isNewAccountAllowed` (line 1258).

### CantBeKickedIfTooLaggy

- **The game's description:** "Player won't be kicked for lag issues."
- **Built-in roles:** `priority`, `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.network.statistics.PingManager#doKickWhileLoading` (line 33).

### ToggleGodModHimself

- **The game's description:** "Allows player to switch god mode on and off. Use /godmod or /godmode console command."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Commands that need it:** `/godmod`
- **Checked in:** `zombie.characters.IsoGameCharacter#setGodMod` (line 12096); `zombie.characters.IsoPlayer#setRole` (line 8680); `zombie.characters.Role#hasAdminPower` (line 220); `zombie.network.anticheats.AntiCheatPower#validate` (line 20); `zombie.network.GameServer#changeRole` (lines 3675, 3700); `zombie.network.packets.ExtraInfoPacket#processServer` (line 245); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 39); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:doAdminButtons` (line 134).

### ToggleInvisibleHimself

- **The game's description:** "Allows player to toggle their visibility to others. Use /invisible console command."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Commands that need it:** `/invisible`
- **Checked in:** `zombie.characters.IsoGameCharacter#setInvisible` (line 11978); `zombie.characters.IsoPlayer#setRole` (line 8684); `zombie.characters.Role#hasAdminPower` (line 219); `zombie.network.GameServer#changeRole` (lines 3667, 3692); `zombie.network.packets.ExtraInfoPacket#processServer` (line 253); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 31); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:doAdminButtons` (line 133).

### ToggleInvincibleHimself

- **The game's description:** "Player can make themselves invulnerable to damage. Use option in Admin Powers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setInvincible` (line 14107).

### ToggleNoclipHimself

- **The game's description:** "Allows player to walk through walls. Option can be enabled by /noclip console command."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Commands that need it:** `/noclip`
- **Checked in:** `zombie.characters.IsoPlayer#setNoClip` (line 6609); `zombie.characters.IsoPlayer#setRole` (line 8736); `zombie.characters.Role#hasAdminPower` (line 221); `zombie.commands.serverCommands.NoClipCommand#Command` (line 53); `zombie.network.anticheats.AntiCheatNoClip#react` (line 47); `zombie.network.anticheats.AntiCheatNoClip#validate` (line 73); `zombie.network.GameServer#changeRole` (lines 3671, 3696); `zombie.network.packets.ExtraInfoPacket#processServer` (line 306); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 47).

### SeePlayersConnected

- **The game's description:** "Allows player to a list of all currently connected players and active connections. Use /players and / connections console commands."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Commands that need it:** `/connections`, `/players`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 211); `zombie.network.packets.service.ScoreboardUpdatePacket#processServer` (line 94); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 224).

### TeleportToPlayer

- **The game's description:** "Allows player to instantly teleport to the location of another player. Use context menu option in MiniScoreboard UI or button in Player List window."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Commands that need it:** `/teleport`
- **Checked in:** `zombie.network.anticheats.AntiCheatSpeed#validate` (line 30); `media/lua/client/ISUI/AdminPanel/ISMiniScoreboardUI.lua` in `ISMiniScoreboardUI:doPlayerListContextMenu` (line 48); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 490); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:doAdminButtons` (lines 103, 112).

### TeleportToCoordinates

- **The game's description:** "Allows player to teleport to any specific coordinates on the map. Use context menu option in MiniScoreboard UI or button in Player List window."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Commands that need it:** `/teleportto`
- **Checked in:** `zombie.commands.serverCommands.TeleportToCommand#TeleportMeToCoords` (line 84); `zombie.network.anticheats.AntiCheatSpeed#validate` (line 31); `zombie.network.FakeClientManager$Client#receiveExtraInfo` (line 1311); `media/lua/client/ISUI/AdminPanel/ISPVPLogToolUI.lua` in `ISPVPLogToolUI:prerender` (line 117); `media/lua/client/ISUI/AdminPanel/ISPvpZonePanel.lua` in `ISPvpZonePanel:render` (line 116); `media/lua/client/ISUI/AdminPanel/ISSafehousesList.lua` in `ISSafehousesList:drawDatas` (line 74).

### SeePublicServerOptions

- **The game's description:** "Player can view the server options in Admin Panel."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Commands that need it:** `/showoptions`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 204); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 208); `media/lua/client/ISUI/UserPanel/ISUserPanelUI.lua` in `ISUserPanelUI:create` (line 71).

### CanOpenLockedDoors

- **The game's description:** "Player can open normally inaccessible doors."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.iso.objects.IsoDoor#ToggleDoorActual` (line 1514); `zombie.iso.objects.IsoThumpable#isLockedToCharacter` (line 2497).

### CanGoInsideSafehouses

- **The game's description:** "Player have access to safehouses that are typically locked."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#updateDisguisedState` (line 15467); `zombie.iso.areas.SafeHouse#isSafeHouse` (line 214); `zombie.iso.areas.SafeHouse#isSafehouseAllowTrepass` (line 240); `zombie.iso.areas.SafeHouse#isSafehouseAllowInteract` (line 261); `zombie.iso.areas.SafeHouse#playerAllowed` (line 292); `zombie.network.packets.WarStateSyncPacket#isConsistent` (line 105); `zombie.network.WarManager#getWarRelevent` (line 33); `media/lua/client/ISUI/ISWarManagerUI.lua` in `ISWarManagerUI:onSelectWar` (line 188).

### CanAlwaysJoinServer

- **The game's description:** "Player can always join a server, even if it's full."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#DoDeath` (line 2049); `zombie.network.packets.character.CreatePlayerPacket#processServer` (line 287); `zombie.network.packets.connection.LoginPacket#processServer` (lines 106, 177).

### SeesInvisiblePlayers

- **The game's description:** "Player can see other players who are invisible."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoPlayer#updateLOS` (line 5761); `zombie.characters.IsoPlayer#checkCanSeeClient` (line 5957); `zombie.iso.ISWorldObjectContextMenuLogic#doClickedPlayerMenu` (line 1174); `zombie.iso.ISWorldObjectContextMenuLogic#doPlayerMenu` (line 1974); `zombie.iso.LightingJNI#checkLights` (line 453); `zombie.network.packets.character.PlayerDataRequestPacket#processServer` (line 37); `zombie.worldMap.WorldMapRemotePlayer#setPlayer` (line 55).

### CanSeeMessageForAdmin

- **The game's description:** "Allows player to receive messages sent by players for administrators."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.network.packets.AddTicketPacket#processServer` (line 60).

### PVPLogTool

- **The game's description:** "Allows player to use PVPLogTool in the Admin panel."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 215); `zombie.network.packets.PVPEventsPacket#processServer` (line 70); `zombie.network.PVPLogTool#logCombat` (line 75); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 232).

### CanSeePlayersStats

- **The game's description:** "Player can see the statistics and information of other players. Use Player Stats button in Admin Panel."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#updateUserName` (lines 7237, 7262); `zombie.characters.IsoGameCharacter#renderlast` (line 7536); `zombie.characters.IsoPlayer#getUsername` (line 6467); `zombie.characters.Role#hasAdminTool` (line 202); `zombie.network.GameClient#canSeePlayerStats` (line 1435); `zombie.network.PacketTypes$PacketType#<field initializer>` (line 551); `zombie.worldMap.WorldMapRemotePlayer#getUsername` (line 151); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 202); `media/lua/client/ISUI/AdminPanel/ISMiniScoreboardUI.lua` in `ISMiniScoreboardUI:doPlayerListContextMenu` (line 60).

### CantBeKickedByAnticheat

- **The game's description:** "Player will not be kicked by the anti-cheat system."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.network.anticheats.AntiCheat#act` (line 138); `zombie.network.anticheats.AntiCheat#doKickUser` (line 165).

### CantBeKickedByUser

- **The game's description:** "Player can't be kicked by other users."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.commands.serverCommands.KickUserCommand#Command` (line 65).

### CantBeBannedByAnticheat

- **The game's description:** "Player will not be banned by the anti-cheat system."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.network.anticheats.AntiCheat#doBanUser` (line 173).

### CantBeBannedByUser

- **The game's description:** "Player can't be banned by other users."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.BanSystem#BanUser` (line 31); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (lines 515, 535, 563).

### SeeWorldMap

- **The game's description:** "Allows player to see other players on the world map."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.network.GameServer#shouldSendWorldMapPlayerPosition` (line 3384).

### CanMedicalCheat

- **The game's description:** "Allows player to use MedicalCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `media/lua/client/TimedActions/ISMedicalCheckAction.lua` in `ISMedicalCheckAction:isValid` (line 12); `media/lua/client/XpSystem/ISUI/ISHealthPanel.lua` in `ISHealthPanel:update` (line 367); `media/lua/client/XpSystem/ISUI/ISHealthPanel.lua` in `ISHealthPanel.canPerformMedicalCheck` (line 1973); `media/lua/shared/TimedActions/ISCleanBurn.lua` in `ISCleanBurn:new` (line 104); `media/lua/shared/TimedActions/ISComfreyCataplasm.lua` in `ISComfreyCataplasm:new` (line 105); `media/lua/shared/TimedActions/ISGarlicCataplasm.lua` in `ISGarlicCataplasm:new` (line 103); `media/lua/shared/TimedActions/ISPlantainCataplasm.lua` in `ISPlantainCataplasm:new` (line 106); `media/lua/shared/TimedActions/ISRemoveBullet.lua` in `ISRemoveBullet:new` (line 102); `media/lua/shared/TimedActions/ISRemoveGlass.lua` in `ISRemoveGlass:complete` (line 66); `media/lua/shared/TimedActions/ISRemoveGlass.lua` in `ISRemoveGlass:getDuration` (line 83); `media/lua/shared/TimedActions/ISRemoveGlass.lua` in `ISRemoveGlass:new` (line 111); `media/lua/shared/TimedActions/ISSplint.lua` in `ISSplint:new` (line 156); `media/lua/shared/TimedActions/ISStitch.lua` in `ISStitch:complete` (line 114); `media/lua/shared/TimedActions/ISStitch.lua` in `ISStitch:new` (line 168).

### UIManagerProcessCommands

- **The game's description:** "Allows player to execute console commands."
- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.ui.UITextBox2#onKeyEnter` (line 1093).

### UseDebugContextMenu

- **Built-in roles:** `observer`, `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setCanUseDebugContextMenu` (line 12034); `zombie.characters.IsoPlayer#setRole` (line 8760); `zombie.network.packets.ExtraInfoPacket#processServer` (line 354); `media/lua/client/DebugUIs/DebugContextMenu.lua` in `DebugContextMenu.doDebugMenu` (line 27); `media/lua/server/ClientCommands.lua` in `Commands.object.removeWorldItemsInArea` (line 155); `media/lua/server/ClientCommands.lua` in `Commands.debugIsoRegions.editSquare` (line 1280); `media/lua/server/ClientCommands.lua` in `Commands.debugScenario.addEnclosure` (line 1289).

### ToggleGodModEveryone

- **The game's description:** "Player can toggle god mode for all players on the server."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Commands that need it:** `/godmodplayer`
- **Checked in:** `media/lua/client/ISUI/AdminPanel/ISMiniScoreboardUI.lua` in `ISMiniScoreboardUI:doPlayerListContextMenu` (line 57); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:doAdminButtons` (lines 101, 115).

### ToggleInvisibleEveryone

- **The game's description:** "Player can make other players invisible. Use /invisible command or context menu in MiniScoreboard window."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Commands that need it:** `/invisibleplayer`
- **Checked in:** `media/lua/client/ISUI/AdminPanel/ISMiniScoreboardUI.lua` in `ISMiniScoreboardUI:doPlayerListContextMenu` (line 54); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:doAdminButtons` (lines 102, 114).

### ToggleNoclipEveryone

- **The game's description:** "Player can enable noclip functionality for everyone on the server. Use /noclip console command."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Checked in:** `zombie.commands.serverCommands.NoClipCommand#Command` (line 50).

### TeleportPlayerToAnotherPlayer

- **The game's description:** "Allows the player to teleport any player to any location. Use context menu option in users list UI or button in players list."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Commands that need it:** `/teleport`, `/teleportplayer`
- **Checked in:** `zombie.commands.serverCommands.TeleportPlayerCommand#TeleportUser1ToUser2` (line 53); `zombie.commands.serverCommands.TeleportToCommand#TeleportUserToCoords` (line 108); `zombie.network.anticheats.AntiCheatSpeed#validate` (line 32); `media/lua/client/ISUI/AdminPanel/ISMiniScoreboardUI.lua` in `ISMiniScoreboardUI:doPlayerListContextMenu` (line 51); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 487); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:doAdminButtons` (lines 104, 113).

### MakeEventsAlarmGunshot

- **The game's description:** "Allows the player to trigger in-game sound events. Use commands /alarm, /gunshot, /thunder, and /chopper."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Commands that need it:** `/alarm`, `/chopper`, `/gunshot`, `/lightning`
- **Checked in:** no other place.

### StartStopRain

- **The game's description:** "Allows the player to start or stop raining events. Use command /startrain, /startstorm, /stoprain, /stopweather, and /thunder."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Commands that need it:** `/startrain`, `/stoprain`, `/thunder`, `/stopweather`, `/startstorm`
- **Checked in:** no other place.

### AddItem

- **The game's description:** "Allows the player to add an item to their inventory or other players inventory. Use command /additem and /addkey or items list UI."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Commands that need it:** `/additem`, `/addkey`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 203); `zombie.network.FakeClientManager$Client#receiveExtraInfo` (line 1302); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 206); `media/lua/server/ClientCommands.lua` in `Commands.debugAction.getBuildingKey` (line 670); `media/lua/server/ClientCommands.lua` in `Commands.debugAction.getDoorKey` (line 687); `media/lua/server/ClientCommands.lua` in `Commands.debugAction.mannequinCreateItem` (line 734).

### AddXP

- **The game's description:** "Allows the player to add experience points to themselves or other players. Use command /addxp."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Commands that need it:** `/addxp`
- **Checked in:** no other place.

### SeeNetworkUsers

- **The game's description:** "Player can see all connected network users information"
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 208); `zombie.network.packets.BanUnbanUserActionPacket#processServer` (line 108); `zombie.network.packets.NetworkUserActionPacket#processServer` (line 111); `zombie.network.packets.NetworkUsersPacket#processClient` (line 86); `zombie.network.packets.RequestNetworkUsersPacket#processServer` (line 36); `zombie.network.packets.TeleportToHimUserActionPacket#processServer` (line 66); `zombie.network.packets.TeleportUserActionPacket#processServer` (line 66); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 216).

### UseLootZed

- **Built-in roles:** `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setCanUseLootZed` (line 12010); `zombie.characters.IsoPlayer#setRole` (line 8752); `zombie.characters.Role#hasAdminPower` (line 238); `zombie.network.packets.ExtraInfoPacket#processServer` (line 322); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 190).

### UseLootLog

- **Built-in roles:** `gm`, `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setCanUseLootLog` (line 12022); `zombie.characters.IsoPlayer#setRole` (line 8756); `zombie.characters.Role#hasAdminPower` (line 239); `zombie.network.packets.ExtraInfoPacket#processServer` (line 328); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 198).

### CreateHorde

- **The game's description:** "Player can spawn hordes of zombies at a desired location. Use /createhorde and /createhorde2 console commands."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/createhorde`, `/createhorde2`
- **Checked in:** `zombie.network.FakeClientManager$Client#canCreateHorde` (line 1366).

### CreateStory

- **The game's description:** "Player can create custom storylines or scenarios within the game. Use Randomized Zone Story and Randomized Road Story context menu options."
- **Built-in roles:** `gm`, `moderator`, `admin`
- **Checked in:** `media/lua/client/DebugUIs/DebugContextMenu.lua` in `DebugContextMenu.addRVSDebugMenu` (line 1226); `media/lua/client/DebugUIs/DebugContextMenu.lua` in `DebugContextMenu.addRZSDebugMenu` (line 1259).

### KickUser

- **The game's description:** "Player can kick other players from the server. Use /kick or /kickuser console commands."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/kick`
- **Checked in:** `zombie.network.packets.BanUnbanUserActionPacket#processServer` (line 72); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 493); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:doAdminButtons` (lines 98, 110).

### DisplayServerMessage

- **The game's description:** "Player can broadcast messages to all players on the server. Use /servermsg console command."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/servermsg`
- **Checked in:** no other place.

### CanModifyPlayerStatsInThePlayerStatsUI

- **The game's description:** "Player can modify player stats. Use Player Stats button in the Admin Panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.Lua.LuaManager$GlobalObject#canModifyPlayerScoreboard` (line 9056); `zombie.network.GameServer#canModifyPlayerStats` (line 1392); `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua` in `ISPlayerStatsUI:updateButtons` (line 213); `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua` in `ISPlayerStatsUI:create` (line 398).

### CanModifyBodyStats

- **The game's description:** "Player can modify player body stats. Use Body section from General Debuggers in the Debug Menu panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.Lua.LuaManager$GlobalObject#sendPlayerStat` (line 11908); `zombie.Lua.LuaManager$GlobalObject#sendPlayerNutrition` (line 11918).

### AdminChat

- **The game's description:** "Player have access to a separate chat channel for administrators."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.chat.ChatServer#initPlayer` (line 140); `zombie.network.GameServer#changeRole` (lines 3660, 3662).

### HideFromSteamUserList

- **The game's description:** "Player can make themselves invisible from other players in the Users List window on Steam servers."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.GameServer#receivePlayerConnect` (line 2861); `zombie.network.GameServer#getPlayerCount` (line 3607); `zombie.network.GameServer#changeRole` (lines 3684, 3688); `zombie.network.LoginQueue#getCountPlayers` (line 196); `zombie.network.packets.service.ScoreboardUpdatePacket#processServer` (line 101).

### ToggleWriteRoleNameAbove

- **The game's description:** "Player role will be displaying above him."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#updateUserName` (line 7287); `zombie.characters.IsoGameCharacter#updateInternal` (line 9177); `zombie.characters.IsoPlayer#setRole` (line 8672); `zombie.network.packets.ExtraInfoPacket#processServer` (line 237).

### BanUnbanUser

- **The game's description:** "Player have the ability to ban and unban users from the server. Use commands /banuser, /unbanuser, /banid and /unbanid."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/banuser`, `/banid`, `/banip`, `/unbanuser`, `/unbanid`, `/unbanip`, `/voiceban`
- **Checked in:** `zombie.network.BanSystem#BanUser` (line 27); `zombie.network.BanSystem#BanUserBySteamID` (line 85); `zombie.network.BanSystem#BanIP` (line 124); `zombie.network.BanSystem#BanUserByIP` (line 157); `zombie.network.PacketTypes$PacketType#<field initializer>` (lines 583, 584); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:initialise` (line 47); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 509); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:doAdminButtons` (lines 99, 100, 111, 120).

### EditMapSymbols

- **The game's description:** "Player have the ability to modify shared map symbols. Use commands /removemapsymbolsforuser."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/removemapsymbolsforuser`
- **Checked in:** no other place.

### ManipulateWhitelist

- **The game's description:** "Allows player to add or remove players from the whitelist. Use commands /setpassword, /adduser, /addusertowhitelist, /addalltowhitelist and /removeuserfromwhitelist."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/addalltowhitelist`, `/addusertowhitelist`, `/removeuserfromwhitelist`
- **Checked in:** `media/lua/client/ISUI/PlayerStats/ISPlayerStatsChooseAccessLevel.lua` in `ISPlayerStatsChooseAccessLevelUI:create` (line 24); `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua` in `ISPlayerStatsUI:updateButtons` (line 228).

### ChangeAccessLevel

- **The game's description:** "Player can change the access level of other players on the server. Use command /setaccesslevel."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/grantadmin`, `/removeadmin`, `/setaccesslevel`
- **Checked in:** `zombie.network.GameServer#changeRole` (line 3648); `zombie.network.packets.NetworkUserActionPacket#processServer` (line 106); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 475).

### CanSetupSafehouses

- **The game's description:** "Player can create and configure safe houses within the game world. Use context menu and commands /addtosafehouse, /kickfromsafehouse and /releasesafehouse."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/releasesafehouse`, `/addtosafehouse`, `/kickfromsafehouse`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 209); `zombie.iso.areas.SafeHouse#canBeSafehouse` (line 399); `zombie.iso.areas.SafeHouse#allowSafeHouse` (line 577); `zombie.iso.areas.SafeHouse#hasNotSurvivedEnoughToClaim` (line 860); `zombie.network.anticheats.AntiCheatSafeHouseMember#validate` (line 20); `zombie.network.anticheats.AntiCheatSafeHouseNotMember#validate` (line 20); `zombie.network.anticheats.AntiCheatSafeHouseOwner#validate` (line 20); `zombie.network.GameServer#handleClientCommand` (line 2129); `zombie.network.packets.safehouse.SafezoneClaimPacket#isConsistent` (line 76); `media/lua/client/ISUI/AdminPanel/ISAddSafeZoneUI.lua` in `ISAddSafeZoneUI:prerender` (line 117); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (lines 218, 220, 234); `media/lua/client/ISUI/AdminPanel/ZoneEditor/ISMultiplayerZoneEditor.lua` in `ISMultiplayerZoneEditor.OnRolesReceived` (lines 482, 488); `media/lua/client/ISUI/AdminPanel/ZoneEditor/MultiplayerZoneEditorMode_Safehouse.lua` in `DetailsPanel:hasPrivilegedAccessLevel` (line 527); `media/lua/client/ISUI/AdminPanel/ZoneEditor/MultiplayerZoneEditorMode_Safehouse.lua` in `MultiplayerZoneEditorMode_Safehouse:isNewZoneValid` (line 844); `media/lua/client/ISUI/UserPanel/ISSafehouseAddPlayerUI.lua` in `ISSafehouseAddPlayerUI:new` (line 150); `media/lua/client/ISUI/UserPanel/ISSafehouseUI.lua` in `ISSafehouseUI:hasPrivilegedAccessLevel` (line 392).

### CanSetupNonPVPZone

- **The game's description:** "Player can establish areas on the map where PvP combat is disabled. Use Non PVP Zone button in the Admin Panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 205); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (lines 210, 234); `media/lua/client/ISUI/AdminPanel/ISPvpZonePanel.lua` in `ISPvpZonePanel:prerender` (line 101); `media/lua/client/ISUI/AdminPanel/ZoneEditor/ISMultiplayerZoneEditor.lua` in `ISMultiplayerZoneEditor.OnRolesReceived` (lines 478, 486).

### FactionCheat

- **The game's description:** "Allows player to manage factions. Use button in the Admin Panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.Faction#canCreateFaction` (line 47); `zombie.characters.Role#hasAdminTool` (line 206); `zombie.network.packets.faction.FactionAcceptPacket#processServer` (line 63); `zombie.network.packets.faction.FactionChangeOwnerPacket#processServer` (line 65); `zombie.network.packets.faction.FactionChangeTagPacket#processServer` (line 82); `zombie.network.packets.faction.FactionChangeTitlePacket#processServer` (line 74); `zombie.network.packets.faction.FactionCreatePacket#processServer` (line 84); `zombie.network.packets.faction.FactionDisbandPacket#processServer` (line 42); `zombie.network.packets.faction.FactionInvitePacket#processServer` (line 70); `zombie.network.packets.faction.FactionRemoveMemberPacket#processServer` (line 51); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 212); `media/lua/client/ISUI/UserPanel/ISFactionAddPlayerUI.lua` in `ISFactionAddPlayerUI:new` (line 158); `media/lua/client/ISUI/UserPanel/ISFactionUI.lua` in `ISFactionUI:onDisbandFaction` (line 365); `media/lua/client/ISUI/UserPanel/ISFactionUI.lua` in `ISFactionUI:new` (line 389).

### AnswerTickets

- **The game's description:** "Allows player to see and manage the list of in-game tickets raised by other players. Use See Tickets button in the Admin panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 210); `zombie.network.packets.AddTicketPacket#processServer` (line 60); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 222).

### RolesRead

- **The game's description:** "Player can view the roles and permissions assigned to other players on the server. Use Roles List button in the Admin Panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 207); `zombie.network.packets.RequestRolesPacket#processServer` (line 36); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 214).

### ToggleUnlimitedEndurance

- **The game's description:** "Allows player to use UnlimitedEnduranceCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setUnlimitedEndurance` (line 14292); `zombie.characters.IsoPlayer#setRole` (line 8688); `zombie.characters.Role#hasAdminPower` (line 225); `zombie.network.packets.ExtraInfoPacket#processServer` (line 257); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 80).

### ToggleKnowAllRecipes

- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setKnowAllRecipes` (line 14268); `zombie.characters.IsoPlayer#setRole` (line 8696); `zombie.characters.Role#hasAdminPower` (line 227); `zombie.network.packets.ExtraInfoPacket#processServer` (line 265); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 96).

### ToggleUnlimitedAmmo

- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setUnlimitedAmmo` (line 14280); `zombie.characters.IsoPlayer#setRole` (line 8692); `zombie.characters.Role#hasAdminPower` (line 226); `zombie.network.packets.ExtraInfoPacket#processServer` (line 261); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 88).

### ToggleUnlimitedCarry

- **The game's description:** "Allows player to use UnlimitedCarryCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setUnlimitedCarry` (line 12112); `zombie.characters.IsoPlayer#setRole` (line 8700); `zombie.characters.Role#hasAdminPower` (line 224); `zombie.network.packets.ExtraInfoPacket#processServer` (line 269); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 72).

### UseMovablesCheat

- **The game's description:** "Allows player to use MovablesCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setMovablesCheat` (line 12208); `zombie.characters.IsoPlayer#setRole` (line 8704); `zombie.characters.Role#hasAdminPower` (line 233); `zombie.network.packets.ExtraInfoPacket#processServer` (line 273); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 148).

### UseFastMoveCheat

- **The game's description:** "Allows player to use FastMoveCheat, which is enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setFastMoveCheat` (line 12194); `zombie.characters.IsoPlayer#setRole` (line 8708); `zombie.characters.Role#hasAdminPower` (line 222); `zombie.network.anticheats.AntiCheatNoClip#react` (line 48); `zombie.network.anticheats.AntiCheatNoClip#validate` (line 74); `zombie.network.anticheats.AntiCheatSpeed#validate` (line 33); `zombie.network.packets.ExtraInfoPacket#processServer` (line 277); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 55).

### UseBuildCheat

- **The game's description:** "Allows player to use BuildCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setBuildCheat` (line 12126); `zombie.characters.IsoPlayer#setRole` (line 8712); `zombie.characters.Role#hasAdminPower` (line 228); `zombie.network.packets.ExtraInfoPacket#processServer` (line 281); `media/lua/client/Entity/ISUI/BuildRecipe/ISWidgetBuildControl.lua` in `ISWidgetBuildControl:createChildren` (line 57); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 104); `media/lua/shared/TimedActions/ISDestroyStuffAction.lua` in `ISDestroyStuffAction:complete` (line 122).

### UseFarmingCheat

- **The game's description:** "Allows player to use FarmingCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setFarmingCheat` (line 12140); `zombie.characters.IsoPlayer#setRole` (line 8716); `zombie.characters.Role#hasAdminPower` (line 229); `zombie.network.packets.ExtraInfoPacket#processServer` (line 285); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 113).

### UseFishingCheat

- **The game's description:** "Allows player to use FishingCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setFishingCheat` (line 12154); `zombie.characters.IsoPlayer#setRole` (line 8720); `zombie.characters.Role#hasAdminPower` (line 230); `zombie.network.packets.ExtraInfoPacket#processServer` (line 289); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 122).

### UseHealthCheat

- **The game's description:** "Allows player to use HealthCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setHealthCheat` (line 12168); `zombie.characters.IsoPlayer#setRole` (line 8724); `zombie.characters.Role#hasAdminPower` (line 231); `zombie.network.packets.ExtraInfoPacket#processServer` (line 293); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 130); `media/lua/server/ClientCommands.lua` in `Commands.player.onHealthCheat` (line 476).

### UseMechanicsCheat

- **The game's description:** "Allows player to use MechanicsCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setMechanicsCheat` (line 12182); `zombie.characters.IsoPlayer#setRole` (line 8728); `zombie.characters.Role#hasAdminPower` (line 232); `zombie.network.packets.ExtraInfoPacket#processServer` (line 297); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 139); `media/lua/server/Vehicles/VehicleCommands.lua` in `Commands.setPartCondition` (line 62); `media/lua/server/Vehicles/VehicleCommands.lua` in `Commands.getKey` (line 319); `media/lua/server/Vehicles/VehicleCommands.lua` in `Commands.repair` (line 332); `media/lua/server/Vehicles/VehicleCommands.lua` in `Commands.setRust` (line 350); `media/lua/server/Vehicles/VehicleCommands.lua` in `Commands.repairPart` (line 360); `media/lua/server/Vehicles/VehicleCommands.lua` in `Commands.cheatHotwire` (line 433); `media/lua/server/Vehicles/VehicleCommands.lua` in `Commands.setAlarmed` (line 462).

### UseTimedActionInstantCheat

- **The game's description:** "Allows player to use TimedActionInstantCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setTimedActionInstantCheat` (line 12264); `zombie.characters.IsoPlayer#setRole` (line 8732); `zombie.characters.Role#hasAdminPower` (line 223); `zombie.network.packets.ExtraInfoPacket#processServer` (line 301); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 64).

### UseZombieDontAttackCheat

- **The game's description:** "Allows player to use UseZombieDontAttackCheat, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setZombiesDontAttack` (line 12073); `zombie.characters.IsoPlayer#setRole` (line 8676); `zombie.network.packets.ExtraInfoPacket#processServer` (line 241).

### GeneralCheats

- **The game's description:** "Allows player to use /roll and /card console commands. Also allows to remove vehicles."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.GameClient#SendCommandToServer` (lines 931, 939); `zombie.network.GameServer#receiveClientCommand` (line 2319).

### ModifyNetworkUsers

- **The game's description:** "Allows player to add, kick, ban, unban users using console commands."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/adduser`, `/addsteamid`, `/removesteamid`, `/setpassword`
- **Checked in:** `zombie.network.packets.NetworkUserActionPacket#processServer` (lines 74, 80, 88, 94, 100); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:initialise` (line 27); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 601).

### EditItem

- **The game's description:** "Player can change properties or attributes of items in the game world. Use inventory context menu option."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/removeitem`
- **Checked in:** `zombie.network.packets.SyncItemFieldsPacket#processServer` (line 550); `media/lua/client/DebugUIs/ISRemoveItemTool.lua` in `RemoveItemContextOptions` (line 330); `media/lua/client/ISUI/AdminPanel/ISItemEditPanel.lua` in `ISItemEditPanel:onSaveCondition` (line 214); `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` in `ISInventoryPaneContextMenu.doDebugContextMenu` (line 4682); `media/lua/server/ClientCommands.lua` in `Commands.object.removeWorldItem` (line 136); `media/lua/server/ClientCommands.lua` in `Commands.item.changeRecording` (line 1224).

### GetSteamScoreboard

- **The game's description:** "Allows player to use mini scoreboard in Admin panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.packets.service.ScoreboardUpdatePacket#processServer` (line 95); `media/lua/client/OptionScreens/ISScoreboard.lua` in `ISScoreboard:drawMap` (line 187).

### GetStatistic

- **The game's description:** "Allows player to access detailed server, connections and packets statistics. Use Packet Counts and Show Statistics buttons in Admin panel."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/stats`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (lines 212, 214); `zombie.network.statistics.StatisticManager#update` (line 190); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 230).

### SandboxOptions

- **The game's description:** "Allows player to change sandbox options. Use Sandbox Options button in Admin panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.Role#hasAdminTool` (line 213); `zombie.network.PacketTypes$PacketType#<field initializer>` (line 432); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 226).

### ReadUserLog

- **The game's description:** "Player can view the logs of other players on the server. Use context menu in Users List window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.GameClient#requestUserlog` (line 2555); `zombie.network.packets.service.RequestUserLogPacket#processClient` (line 103); `zombie.network.packets.service.RequestUserLogPacket#processServer` (line 120); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 587); `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua` in `ISPlayerStatsUI:create` (line 359).

### AddUserlog

- **The game's description:** "Player can add their own entries to logs of other players on the server. Use context menu in Users List window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.GameClient#addUserlog` (line 2561); `zombie.network.GameClient#addWarningPoint` (line 2573); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 584); `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua` in `ISPlayerStatsUI:create` (line 379).

### WorkWithUserlog

- **The game's description:** "Player can remove entries from logs of other players on the server. Use context menu in Users List window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.GameClient#removeUserlog` (line 2567).

### ClimateManager

- **The game's description:** "Player can control and alter environmental factors like the weather on the server. Use Climate Control button in Admin Panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setAlwaysDayCheat` (line 12250); `zombie.characters.Role#hasAdminPower` (line 241); `zombie.network.packets.ExtraInfoPacket#processServer` (line 347); `zombie.network.PacketTypes$PacketType#<field initializer>` (line 514); `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua` in `ISAdminPanelUI:updateButtons` (line 228); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 224).

### InspectPlayerInventory

- **The game's description:** "Player can view the inventory contents of any other player on the server."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.network.PacketTypes$PacketType#<field initializer>` (lines 547, 549, 550); `media/lua/client/ISUI/AdminPanel/ISItemEditorUI.lua` in `ISItemEditorUI:onOptionMouseDown` (line 90); `media/lua/client/ISUI/AdminPanel/ISUsersList.lua` in `ISUsersList:doContextMenu` (line 593).

### AnimalCheats

- **The game's description:** "Allows player to use AnimalCheats, which are enabled in the AdminPowers window."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/remove`
- **Checked in:** `zombie.characters.animals.AnimalTracks#broadcastAnimalTrackToAdminsDebug` (line 81); `zombie.characters.IsoGameCharacter#setAnimalCheat` (line 12222); `zombie.characters.IsoGameCharacter#setAnimalExtraValuesCheat` (line 12236); `zombie.characters.NetworkPlayerAI#set` (line 212); `zombie.characters.Role#hasAdminPower` (line 240); `zombie.network.packets.ExtraInfoPacket#processServer` (lines 334, 340); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (lines 207, 216); `media/lua/server/ClientCommands.lua` in `Commands.animal.add` (line 754); `media/lua/server/ClientCommands.lua` in `Commands.animal.addBaby` (line 763); `media/lua/server/ClientCommands.lua` in `Commands.animal.addEgg` (line 771); `media/lua/server/ClientCommands.lua` in `Commands.animal.forceEgg` (line 779); `media/lua/server/ClientCommands.lua` in `Commands.animal.remove` (line 787); `media/lua/server/ClientCommands.lua` in `Commands.animal.removeFromHutch` (line 794); `media/lua/server/ClientCommands.lua` in `Commands.animal.removeEggFromNestBox` (line 803); `media/lua/server/ClientCommands.lua` in `Commands.animal.forceHutch` (line 814); `media/lua/server/ClientCommands.lua` in `Commands.animal.forceWander` (line 822); `media/lua/server/ClientCommands.lua` in `Commands.animal.forceSit` (line 830); `media/lua/server/ClientCommands.lua` in `Commands.animal.hutch` (line 838); `media/lua/server/ClientCommands.lua` in `Commands.animal.invincible` (line 856); `media/lua/server/ClientCommands.lua` in `Commands.animal.kill` (line 864); `media/lua/server/ClientCommands.lua` in `Commands.animal.killInTrailer` (line 888); `media/lua/server/ClientCommands.lua` in `Commands.animal.setWool` (line 906); `media/lua/server/ClientCommands.lua` in `Commands.animal.setMilk` (line 914); `media/lua/server/ClientCommands.lua` in `Commands.animal.setStress` (line 923); `media/lua/server/ClientCommands.lua` in `Commands.animal.setAge` (line 931); `media/lua/server/ClientCommands.lua` in `Commands.animal.setHunger` (line 939); `media/lua/server/ClientCommands.lua` in `Commands.animal.setThirst` (line 947); `media/lua/server/ClientCommands.lua` in `Commands.animal.addBucketMilk` (line 955); `media/lua/server/ClientCommands.lua` in `Commands.animal.acceptance` (line 965); `media/lua/server/ClientCommands.lua` in `Commands.animal.updateStatsAway` (line 974); `media/lua/server/ClientCommands.lua` in `Commands.animal.fertilized` (line 984); `media/lua/server/ClientCommands.lua` in `Commands.animal.fertilizedTime` (line 996); `media/lua/server/ClientCommands.lua` in `Commands.animal.pregnant` (line 1004); `media/lua/server/ClientCommands.lua` in `Commands.animal.pregnancyTime` (line 1012); `media/lua/server/ClientCommands.lua` in `Commands.animal.dung` (line 1020); `media/lua/server/ClientCommands.lua` in `Commands.animal.randomIdle` (line 1029); `media/lua/server/ClientCommands.lua` in `Commands.animal.happy` (line 1037); `media/lua/server/ClientCommands.lua` in `Commands.animal.attackPlayer` (line 1045); `media/lua/server/ClientCommands.lua` in `Commands.feedingThrough.addWaterDebug` (line 1112); `media/lua/server/ClientCommands.lua` in `Commands.feedingThrough.removeWaterDebug` (line 1143); `media/lua/server/ClientCommands.lua` in `Commands.feedingThrough.addFoodDebug` (line 1166); `media/lua/server/ClientCommands.lua` in `Commands.feedingThrough.removeFoodDebug` (line 1194).

### DebugConsole

- **The game's description:** "Player have access to a console command interface for debugging and testing purposes. Use commands /log and /clear."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/log`
- **Checked in:** no other place.

### PopmanManage

- **The game's description:** "Allows player to spawn and remove zombies. Use Zombie Population button in Debug panel."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.popman.ZombiePopulationManager#dbgSpawnTimeToZero` (line 852); `zombie.popman.ZombiePopulationManager#dbgClearZombies` (line 864); `zombie.popman.ZombiePopulationManager#dbgSpawnNow` (line 876).

### ManipulateVehicle

- **The game's description:** "Allows player to spawn vehicles in the game world. Use /addvehicle console command."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/addvehicle`
- **Checked in:** no other place.

### ManipulateMods

- **The game's description:** "Player can update installed mods within the game. Use /checkModsNeedUpdate command."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/checkModsNeedUpdate`
- **Checked in:** no other place.

### ManipulateZombie

- **The game's description:** "Allows player to remove zombies by console command or set them don't attack player. Use option in Admin Powers window."
- **Built-in roles:** `moderator`, `admin`
- **Commands that need it:** `/removezombies`
- **Checked in:** `zombie.characters.Role#hasAdminPower` (line 236); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 173).

### CanSeeAll

- **The game's description:** "Allows player to see other players regardless of obstacles. Use option in Admin Powers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoPlayer#setCanSeeAll` (line 8310); `zombie.characters.IsoPlayer#setRole` (line 8740); `zombie.characters.Role#hasAdminPower` (line 234); `zombie.network.packets.ExtraInfoPacket#processServer` (line 310); `zombie.worldMap.UIWorldMap#isAdminSeeRemotePlayers` (line 492); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 157).

### CanHearAll

- **The game's description:** "Player can hear all voice conversations occurring on the server. Use option in Admin Powers window."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoPlayer#setCanHearAll` (line 8332); `zombie.characters.IsoPlayer#setRole` (line 8744); `zombie.characters.Role#hasAdminPower` (line 235); `zombie.network.packets.ExtraInfoPacket#processServer` (line 314); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 165).

### UseBrushToolManager

- **The game's description:** "Allows player to use BrushToolManager, which is enabled in the AdminPowers window, and can be activated by button in map context menu."
- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `zombie.characters.IsoGameCharacter#setCanUseBrushTool` (line 11998); `zombie.characters.IsoPlayer#setRole` (line 8748); `zombie.characters.Role#hasAdminPower` (line 237); `zombie.network.packets.ExtraInfoPacket#processServer` (line 318); `media/lua/client/ISUI/AdminPanel/ISAdminPowerUI.lua` in `<file>` (line 181).

### IgnoreChatSlowMode

- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `media/lua/client/Chat/ISChat.lua` in `ISChat:onCommandEntered` (lines 469, 525).

### EmptyLinesInChat

- **Built-in roles:** `moderator`, `admin`
- **Checked in:** `media/lua/client/Chat/ISChat.lua` in `ISChat:onCommandEntered` (line 476).

### SaveWorld

- **The game's description:** "Player can save the current state of the game world, preserving changes and progress."
- **Built-in roles:** `admin`
- **Commands that need it:** `/save`, `/worldgen`
- **Checked in:** no other place.

### QuitWorld

- **The game's description:** "Allows player to immediately close server. Use /quit console command."
- **Built-in roles:** `admin`
- **Commands that need it:** `/quit`
- **Checked in:** no other place.

### ChangeAndReloadServerOptions

- **The game's description:** "Player can modify and reload server options on-the-fly. Use commands /changeoption and /reloadoptions."
- **Built-in roles:** `admin`
- **Commands that need it:** `/reloadoptions`, `/changeoption`
- **Checked in:** `media/lua/client/ISUI/AdminPanel/ISPVPLogToolUI.lua` in `ISPVPLogToolUI:initialise` (line 38); `media/lua/client/ISUI/AdminPanel/ISPVPLogToolUI.lua` in `ISPVPLogToolUI:onClick` (line 124); `media/lua/client/ISUI/AdminPanel/ISServerOptions.lua` in `ISServerOptions:onMouseMove` (line 32); `media/lua/client/ISUI/AdminPanel/ISServerOptions.lua` in `ISServerOptions:create` (line 119).

### ReloadLuaFiles

- **The game's description:** "Player can reload Lua scripts used by the game server. Use /reloadlua command."
- **Built-in roles:** `admin`
- **Commands that need it:** `/reloadlua`, `/reloadalllua`
- **Checked in:** no other place.

### BypassLuaChecksum

- **The game's description:** "Checksum verification for Lua files is disabled for player, allowing for potentially unauthorized modifications."
- **Built-in roles:** `admin`
- **Checked in:** `zombie.network.packets.connection.LoginPacket#processServer` (line 173); `zombie.network.packets.service.ChecksumPacket#parseServer` (line 242).

### RolesWrite

- **The game's description:** "Allows player to modify and assign roles and permissions to other players on the server. Use Roles List button in the Admin Panel."
- **Built-in roles:** `admin`
- **Checked in:** `media/lua/client/ISUI/AdminPanel/ISRolesList.lua` in `ISRolesList:initialise` (line 20); `media/lua/client/ISUI/AdminPanel/ISRolesList.lua` in `ISRolesList:onSelectRole` (line 110); `media/lua/client/ISUI/AdminPanel/ISRolesList.lua` in `ISRolesList:doContextMenu` (line 287).

### ConnectWithDebug

- **The game's description:** "Player have access to a debugging connection with specific permissions. Use commands /debugplayer and /setTimeSpeed."
- **Built-in roles:** `admin`
- **Commands that need it:** `/debugplayer`, `/setTimeSpeed`
- **Checked in:** `zombie.characters.IsoPlayer#getAnticheatMask` (line 8899); `zombie.gameStates.ConnectToServerState#TestTCP` (line 196).

> **Proof:** Code. zombie.characters.Capability (the list), media/lua/shared/Translate/EN/IG_UI.json (IGUI_CapabilitiesTooltips_<name>), and the Capability.<name> references named under each entry. Build 42.21 (revision 4a0e9546ec).
