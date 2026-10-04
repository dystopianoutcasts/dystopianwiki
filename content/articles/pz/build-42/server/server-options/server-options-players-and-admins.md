---
slug: server-options-players-and-admins
title: 'Server options: players and admins'
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
excerpt: 'Who can join, how many, what players see of each other, sleeping, respawning, and what admins are shown. Every option with its default, range and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-details-steam-and-backups
  - server-options-pvp-safehouses-and-factions
---
# Server options: players and admins

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Who can join, how many, what players see of each other, sleeping, respawning, and what admins are shown.

## Players

### MaxPlayers

- **In the file:** `MaxPlayers=32` is the default. Takes a whole number from 1 to 254.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Maximum number of players that can be on the server at one time. This excludes admins. WARNING: Server player counts above 32 will potentially result in poor map streaming and desync. Please advance with caution."
- **Read in:** `zombie.characters.SafetySystemManager#storeSafety` (lines 92, 100, 108); `zombie.network.ServerOptions#getMaxPlayers` (line 523).
- **What the code does with it:** `ServerOptions#getMaxPlayers` returns the smaller of this value and 254, a cap written into the code.

### Open

- **In the file:** `Open=true` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Clients may join without already having an account in the whitelist. If set to false, administrators must manually create username/password combos."
- **Read in:** `zombie.network.GameServer#setupSteamGameServer` (lines 1197, 1203); `zombie.network.packets.character.CreatePlayerPacket#processServer` (line 284); `zombie.network.ServerWorldDatabase#changeUsername` (line 213); `zombie.network.ServerWorldDatabase#authClient` (lines 1061, 1068, 1126); `zombie.util.PublicServerUtil#insertDatas` (line 199).

### DropOffWhiteListAfterDeath

- **In the file:** `DropOffWhiteListAfterDeath=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Remove player accounts from the whitelist after death. This prevents players creating a new character after death on Open=false servers"
- **Read in:** `zombie.characters.IsoGameCharacter#DoDeath` (line 2046); `media/lua/client/ISUI/ISPostDeathUI.lua` in `ISPostDeathUI:prerender` (line 81).

### DisplayUserName

- **In the file:** `DisplayUserName=true` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Display usernames above player's heads in-game."
- **Read in:** `zombie.characters.IsoGameCharacter#updateUserName` (line 7264); `zombie.characters.IsoPlayer#getUsername` (lines 6472, 6478); `zombie.worldMap.WorldMapRemotePlayer#getUsername` (line 157).

### ShowFirstAndLastName

- **In the file:** `ShowFirstAndLastName=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Display first & last name above player's heads."
- **Read in:** `zombie.characters.IsoGameCharacter#updateUserName` (line 7264); `zombie.characters.IsoPlayer#getUsername` (lines 6470, 6476); `zombie.characters.IsoPlayer#getDisplayName` (line 7914); `zombie.characters.IsoPlayer#getDisguisedDisplayName` (line 7925); `zombie.worldMap.WorldMapRemotePlayer#getUsername` (line 155).

### SpawnItems

- **In the file:** `SpawnItems=` is the default. Takes text.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Item types new players spawn with. Separate multiple item types with commas. Example: Base.Axe,Base.Bag\_BigHikingBag"
- **Read in:** `media/lua/shared/Items/SpawnItems.lua` in `SpawnItems.OnNewGame` (lines 162, 163).

### PingLimit

- **In the file:** `PingLimit=0` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Ping limit, in milliseconds, before a player is kicked from the server. (Set to 0 to disable)"
- **Read in:** `zombie.network.statistics.PingManager#doKickWhileLoading` (line 32); `zombie.network.statistics.PingManager#update` (line 75).
- **What the code does with it:** 0 turns it off. Above 0, a player whose ping is higher than this value is kicked while loading, unless their role has `CantBeKickedIfTooLaggy`.

### ServerPlayerID

- **In the file:** `ServerPlayerID=` followed by a value computed when the options are created: `Integer.toString(Rand.Next(Integer.MAX_VALUE))`. Takes text.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "ServerPlayerID determines if a character is from another server, or single player. This value may be changed by soft resets. If this number does match the client, the client must create a new character. This is used in conjunction with ResetID. It is strongly advised that you backup these IDs somewhere"
- **Read in:** `zombie.characters.IsoPlayer#isServerPlayerIDValid` (line 926); `zombie.characters.IsoPlayer#save` (lines 1514, 1543).
- **Changed in:** `zombie.network.GameServer#main` (line 635).

### SleepAllowed

- **In the file:** `SleepAllowed=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Players are allowed to sleep when their survivor becomes tired, but they do not NEED to sleep"
- **Read in:** `zombie.characters.IsoGameCharacter#updateBeardAndHair` (line 9357); `zombie.characters.IsoGameCharacter#calculateStats` (line 9962); `zombie.iso.ISWorldObjectContextMenuLogic#doBedMenu` (line 1691); `zombie.network.GameServer#main` (line 1055); `media/lua/client/ISUI/ISWorldObjectContextMenu.lua` in `ISWorldObjectContextMenu.onSleepWalkToComplete` (line 1094); `media/lua/client/OptionScreens/CharacterCreationProfession.lua` in `CharacterCreationProfession:isTraitEnabled` (line 890); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.showRadialMenu` (line 190); `media/lua/shared/NPCs/MainCreationMethods.lua` in `BaseGameCharacterDetails.DoTraits` (line 105).

### SleepNeeded

- **In the file:** `SleepNeeded=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Players get tired and need to sleep. (Ignored if SleepAllowed=false)"
- **Read in:** `zombie.characters.IsoGameCharacter#updateBeardAndHair` (line 9357); `zombie.characters.IsoGameCharacter#calculateStats` (line 9962); `zombie.iso.ISWorldObjectContextMenuLogic#doSleepOption` (line 4036); `media/lua/client/OptionScreens/CharacterCreationProfession.lua` in `CharacterCreationProfession:isTraitEnabled` (line 890); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.showRadialMenu` (line 192); `media/lua/shared/NPCs/MainCreationMethods.lua` in `BaseGameCharacterDetails.DoTraits` (line 105).

### PlayerRespawnWithSelf

- **In the file:** `PlayerRespawnWithSelf=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Players can respawn in-game at the coordinates where they died"
- **Read in:** `zombie.network.packets.character.CreatePlayerPacket#processServer` (line 194); `media/lua/client/OptionScreens/CoopMapSpawnSelect.lua` in `CoopMapSpawnSelect:canRespawnWithSelf` (line 9).

### PlayerRespawnWithOther

- **In the file:** `PlayerRespawnWithOther=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Players can respawn in-game at a split screen / Remote Play player's location"
- **Read in:** `zombie.network.packets.character.CreatePlayerPacket#processServer` (line 195); `media/lua/client/OptionScreens/CoopMapSpawnSelect.lua` in `CoopMapSpawnSelect:canRespawnWithOther` (line 16).

### RemovePlayerCorpsesOnCorpseRemoval

- **In the file:** `RemovePlayerCorpsesOnCorpseRemoval=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "If enabled, when HoursForCorpseRemoval triggers, it will also remove player's corpses from the ground."
- **Read in:** `zombie.iso.objects.IsoDeadBody#updateBodies` (line 1616).

### TrashDeleteAll

- **In the file:** `TrashDeleteAll=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "If true, player can use the "delete all" button on bins."
- **Read in:** `media/lua/client/ISUI/ISInventoryPage.lua` in `ISInventoryPage:isRemoveButtonVisible` (line 420); `media/lua/client/ISUI/LootWindow/Handlers/RemoveAll.lua` in `Handler:shouldBeVisible` (line 9).

### PVPMeleeWhileHitReaction

- **In the file:** `PVPMeleeWhileHitReaction=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "If true, player can hit again when struck by another player."
- **Read in:** `zombie.characters.IsoGameCharacter#CanAttack` (line 6398); `zombie.CombatManager#pressedAttack` (line 3156).

### MouseOverToSeeDisplayName

- **In the file:** `MouseOverToSeeDisplayName=true` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "If true, players will have to mouse over someone to see their display name."
- **Read in:** `zombie.characters.IsoGameCharacter#renderlast` (line 7439).

### UsernameDisguises

- **In the file:** `UsernameDisguises=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.IsoGameCharacter#updateDisguisedState` (line 15457); `zombie.characters.IsoPlayer#getDisplayName` (line 7915); `zombie.characters.IsoPlayer#getDisguisedDisplayName` (line 7926); `zombie.network.GameClient#receiveWorldMapPlayerPosition` (line 1024); `zombie.network.packets.connection.ConnectedPacket#parse` (line 232).

### HideDisguisedUserName

- **In the file:** `HideDisguisedUserName=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.IsoGameCharacter#updateDisguisedState` (line 15457); `zombie.characters.IsoPlayer#getUsername` (line 6469); `zombie.characters.IsoPlayer#getDisplayName` (line 7915); `zombie.characters.IsoPlayer#getDisguisedDisplayName` (lines 7926, 7928); `zombie.network.GameClient#receiveWorldMapPlayerPosition` (line 1024); `zombie.network.packets.connection.ConnectedPacket#parse` (line 232).

### HidePlayersBehindYou

- **In the file:** `HidePlayersBehindYou=true` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "If true, automatically hide the player you can't see (like zombies)."
- **Read in:** `zombie.characters.IsoPlayer#updateLOS` (line 5775); `zombie.characters.IsoPlayer#checkCanSeeClient` (line 5984).

### PlayerBumpPlayer

- **In the file:** `PlayerBumpPlayer=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Governs whether players bump (and knock over) other players when running through them."
- **Read in:** `zombie.iso.IsoMovingObject#separate` (line 1257).

### MapRemotePlayerVisibility

- **In the file:** `MapRemotePlayerVisibility=1` is the default. Takes a whole number from 1 to 4.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Controls display of remote players on the in-game map. 1=Hidden 2=Friends 3=Friends and nearby players 4=Everyone"
- **Read in:** `zombie.network.GameServer#shouldSendWorldMapPlayerPosition` (line 3387); `zombie.worldMap.UIWorldMap#shouldShowRemotePlayer` (line 475).

### AllowCoop

- **In the file:** `AllowCoop=true` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Allow co-op/splitscreen players"
- **Read in:** `zombie.network.packets.connection.ConnectCoopPacket#parse` (line 72); `media/lua/client/JoyPad/ISJoyPadListBox.lua` in `ISJoypadListBox:fill` (line 37).

### ShowCoordinates

- **In the file:** `ShowCoordinates=false` is the default. Takes true or false.
- **Settings screen:** the "Players" page. **Sent to joining players:** yes.
- **The game's description:** "Shows player character coordinates in the lower right corner."
- **Read in:** `media/lua/client/ISUI/ISVersionWaterMark.lua` in `WaterMarkUI:render` (line 26).

## Admin

### ClientCommandFilter

- **In the file:** `ClientCommandFilter=-vehicle.*;+vehicle.damageWindow;+vehicle.fixPart;+vehicle.installPart;+vehicle.uninstallPart` is the default. Takes text.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Semicolon-separated list of commands that will not be written to the cmd.txt server log. For example: -vehicle. Inputting \* means do NOT write any vehicle command. Inputting: +vehicle.installPart means DO write that command"
- **Read in:** `zombie.network.GameServer#initClientCommandFilter` (line 2251).

### ClientActionLogs

- **In the file:** `ClientActionLogs=ISEnterVehicle;ISExitVehicle;ISTakeEngineParts;` is the default. Takes text.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Semicolon-separated list of actions that will be written to the ClientActionLogs.txt server log."
- **Read in:** `media/lua/shared/Logs/ISLogSystem.lua` in `ISLogSystem.logAction` (line 44).

### PerkLogs

- **In the file:** `PerkLogs=true` is the default. Takes true or false.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Track changes in player perk levels in PerkLog.txt server log"
- **Read in:** `media/lua/shared/Logs/ISPerkLog.lua` in `ISPerkLog.logPerkLevelChange` (line 24); `media/lua/shared/Logs/ISPerkLog.lua` in `ISPerkLog.logAllPerks` (line 43); `media/lua/shared/Logs/ISPerkLog.lua` in `ISPerkLog.logCreatePlayer` (line 58); `media/lua/shared/Logs/ISPerkLog.lua` in `ISPerkLog.logLogin` (line 76); `media/lua/shared/Logs/ISPerkLog.lua` in `ISPerkLog.logDeath` (line 91).

### DisableRadioStaff

- **In the file:** `DisableRadioStaff=false` is the default. Takes true or false.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Disables radio transmissions from players with an access level"
- **Read in:** `zombie.radio.ZomboidRadio#update` (line 543).

### DisableRadioAdmin

- **In the file:** `DisableRadioAdmin=true` is the default. Takes true or false.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Disables radio transmissions from players with 'admin' access level"
- **Read in:** `zombie.radio.ZomboidRadio#update` (line 544).

### DisableRadioGM

- **In the file:** `DisableRadioGM=true` is the default. Takes true or false.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Disables radio transmissions from players with 'gm' access level"
- **Read in:** `zombie.radio.ZomboidRadio#update` (line 545).

### DisableRadioOverseer

- **In the file:** `DisableRadioOverseer=false` is the default. Takes true or false.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Disables radio transmissions from players with 'overseer' access level"
- **Read in:** `zombie.radio.ZomboidRadio#update` (line 546).

### DisableRadioModerator

- **In the file:** `DisableRadioModerator=false` is the default. Takes true or false.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Disables radio transmissions from players with 'moderator' access level"
- **Read in:** `zombie.radio.ZomboidRadio#update` (line 547).

### DisableRadioInvisible

- **In the file:** `DisableRadioInvisible=true` is the default. Takes true or false.
- **Settings screen:** the "Admin" page. **Sent to joining players:** yes.
- **The game's description:** "Disables radio transmissions from invisible players"
- **Read in:** `zombie.radio.ZomboidRadio#update` (line 549).

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
