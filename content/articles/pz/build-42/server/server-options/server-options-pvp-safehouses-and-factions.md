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
excerpt: 'Everything that decides how players treat each other: PVP and its damage, safehouses, factions, the war system, fire and loot respawn in safehouses. Every option with its default, range and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-details-steam-and-backups
  - server-options-players-and-admins
---
# Server options: PVP, safehouses, factions, fire and loot

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Everything that decides how players treat each other: PVP and its damage, safehouses, factions, the war system, fire and loot respawn in safehouses.

## Fire

### NoFire

- **In the file:** `NoFire=false` is the default. Takes true or false.
- **Settings screen:** the "Fire" page. **Sent to joining players:** yes.
- **The game's description:** "All forms of fire are disabled - except for campfires"
- **Read in:** `zombie.iso.IsoGridSquare#Burn` (lines 6215, 6224); `zombie.iso.IsoGridSquare#BurnWalls` (line 6234); `zombie.iso.objects.IsoFire#CanAddFire` (line 273).

## PVP

### PVP

- **In the file:** `PVP=true` is the default. Takes true or false.
- **Settings screen:** the "PVP" page. **Sent to joining players:** yes.
- **The game's description:** "Players can hurt and kill other players"
- **Read in:** `zombie.characters.Safety#isToggleAllowed` (line 82); `zombie.characters.SafetySystemManager#updateOptions` (line 148); `zombie.characters.SafetySystemManager#getCooldown` (line 194); `zombie.CombatManager#checkPVP` (line 1803); `zombie.iso.objects.IsoTrap#shouldProcess` (line 834); `zombie.network.anticheats.AntiCheatSafety#validate` (line 35); `zombie.network.GameClient#timeoutRemotePlayers` (line 535); `zombie.network.GameServer#setupSteamGameServer` (lines 1199, 1204).

### SafetySystem

- **In the file:** `SafetySystem=true` is the default. Takes true or false.
- **Settings screen:** the "PVP" page. **Sent to joining players:** yes.
- **The game's description:** "Players can enter and leave PVP on an individual basis. A player can only hurt another player when at least one of them is in PVP mode - as shown by the unobscured skull and crossbones on the left of the screen. When SafetySystem=false, players are free to hurt each other at any time if PVP is enabled."
- **Read in:** `zombie.characters.Safety#isToggleAllowed` (line 84); `zombie.characters.SafetySystemManager#updateOptions` (line 149); `zombie.characters.SafetySystemManager#getCooldown` (line 195); `zombie.CombatManager#checkPVP` (line 1807); `zombie.network.anticheats.AntiCheatSafety#validate` (line 43); `zombie.network.GameClient#timeoutRemotePlayers` (line 536); `media/lua/client/ISUI/ISEquippedItem.lua` in `ISEquippedItem:prerender` (line 210); `media/lua/client/ISUI/ISEquippedItem.lua` in `ISEquippedItem.onKeyPressed` (line 1257).

### ShowSafety

- **In the file:** `ShowSafety=true` is the default. Takes true or false.
- **Settings screen:** the "PVP" page. **Sent to joining players:** yes.
- **The game's description:** "Display a skull icon over the head of players who have entered PVP mode"
- **Read in:** `zombie.characters.IsoGameCharacter#checkPVP` (line 7341).

### SafetyToggleTimer

- **In the file:** `SafetyToggleTimer=2` is the default. Takes a whole number from 0 to 1000.
- **Settings screen:** the "PVP" page. **Sent to joining players:** yes.
- **The game's description:** "The time it takes for a player to enter and leave PVP mode"
- **Read in:** `zombie.characters.Safety#toggleSafety` (lines 92, 95); `media/lua/client/ISUI/ISEquippedItem.lua` in `ISEquippedItem:prerender` (line 244).

### SafetyCooldownTimer

- **In the file:** `SafetyCooldownTimer=3` is the default. Takes a whole number from 0 to 1000.
- **Settings screen:** the "PVP" page. **Sent to joining players:** yes.
- **The game's description:** "The delay before a player can enter or leave PVP mode again, having recently done so"
- **Read in:** `zombie.network.fields.hit.Player#attack` (line 157); `zombie.network.fields.hit.WeaponHit#process` (line 128).

### PVPMeleeDamageModifier

- **In the file:** `PVPMeleeDamageModifier=30.0` is the default. Takes a number from 0.0 to 500.0.
- **Settings screen:** the "PVP" page. **Sent to joining players:** yes.
- **The game's description:** "Damage multiplier for PVP melee attacks."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#DamageFromWeapon` (line 1244).
- **What the code does with it:** On the server, the damage of a melee weapon hit on a character's body is multiplied by this value. Before that, the damage is the weapon's random damage times 15 (times 4 more on the head or neck, 2 on the upper torso).

### PVPFirearmDamageModifier

- **In the file:** `PVPFirearmDamageModifier=50.0` is the default. Takes a number from 0.0 to 500.0.
- **Settings screen:** the "PVP" page. **Sent to joining players:** yes.
- **The game's description:** "Damage multiplier for PVP ranged attacks."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#DamageFromWeapon` (line 1242).
- **What the code does with it:** On the server, the damage of a ranged weapon hit on a character's body is multiplied by this value. Before that, the damage is the weapon's random damage times 15 (times 4 more on the head or neck, 2 on the upper torso).

## Loot

### SafehousePreventsLootRespawn

- **In the file:** `SafehousePreventsLootRespawn=true` is the default. Takes true or false.
- **Settings screen:** the "Loot" page. **Sent to joining players:** yes.
- **The game's description:** "Items will not respawn in buildings that players have claimed as a safehouse"
- **Read in:** `zombie.LootRespawn#respawnInChunk` (line 110).

### ItemNumbersLimitPerContainer

- **In the file:** `ItemNumbersLimitPerContainer=0` is the default. Takes a whole number from 0 to 9000.
- **Settings screen:** the "Loot" page. **Sent to joining players:** yes.
- **The game's description:** "Maximum number of items that can be placed in a container. Zero means there is no limit. (PLEASE NOTE: This includes individual small items such as nails. A limit of 50 will mean only 50 nails can be stored.)"
- **Read in:** `media/lua/client/ISUI/ISInventoryPage.lua` in `ISInventoryPage:prerender` (line 641); `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` in `ISInventoryPaneContextMenu.canAddManyItems` (lines 2999, 3002); `media/lua/client/TimedActions/ISInventoryTransferAction.lua` in `ISInventoryTransferAction:isValid` (line 52).
- **What the code does with it:** 0 turns it off. Above 0, a multiplayer client shows the item count against the limit under a container, and the transfer action counts the destination's items against it (`ISInventoryTransferAction:isValid`); containers on a character are left out. All its read sites are client Lua.

## War

### War

- **In the file:** `War=false` is the default. Takes true or false.
- **Settings screen:** the "War" page. **Sent to joining players:** yes.
- **Read in:** `zombie.iso.areas.SafeHouse#isSafehouseAllowClaimWar` (line 274); `zombie.network.packets.WarStateSyncPacket#isConsistent` (line 68); `zombie.network.WarManager#update` (line 129).

### WarStartDelay

- **In the file:** `WarStartDelay=600` is the default. Takes a whole number from 60 to 2147483647.
- **Settings screen:** the "War" page. **Sent to joining players:** yes.
- **The game's description:** "Time in seconds before the war starts."
- **Read in:** `zombie.network.WarManager#getStartDelay` (line 173).

### WarDuration

- **In the file:** `WarDuration=3600` is the default. Takes a whole number from 60 to 2147483647.
- **Settings screen:** the "War" page. **Sent to joining players:** yes.
- **The game's description:** "War duration in seconds."
- **Read in:** `zombie.network.WarManager#getWarDuration` (line 169).

### WarSafehouseHitPoints

- **In the file:** `WarSafehouseHitPoints=3` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** the "War" page. **Sent to joining players:** yes.
- **The game's description:** "Safehouse hit points limit."
- **Read in:** `zombie.iso.areas.SafeHouse#hitPoint` (line 829).

## Faction

### Faction

- **In the file:** `Faction=true` is the default. Takes true or false.
- **Settings screen:** the "Faction" page. **Sent to joining players:** yes.
- **The game's description:** "Players can create factions when true"
- **Read in:** `zombie.characters.Faction#canCreateFaction` (line 45); `media/lua/client/ISUI/UserPanel/ISUserPanelUI.lua` in `ISUserPanelUI:create` (line 56); `media/lua/client/ISUI/UserPanel/ISUserPanelUI.lua` in `ISUserPanelUI:updateButtons` (line 122).

### FactionDaySurvivedToCreate

- **In the file:** `FactionDaySurvivedToCreate=0` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** the "Faction" page. **Sent to joining players:** yes.
- **The game's description:** "Players must survive this number of in-game days before being allowed to create a faction"
- **Read in:** `zombie.characters.Faction#canCreateFaction` (line 50); `media/lua/client/ISUI/UserPanel/ISCreateFactionUI.lua` in `ISCreateFactionUI:updateButtons` (line 67); `media/lua/client/ISUI/UserPanel/ISUserPanelUI.lua` in `ISUserPanelUI:create` (line 61); `media/lua/client/ISUI/UserPanel/ISUserPanelUI.lua` in `ISUserPanelUI:updateButtons` (line 127).
- **What the code does with it:** 0 turns it off. Otherwise a player needs at least this many days survived (hours survived of at least the value times 24) to create a faction.

### FactionPlayersRequiredForTag

- **In the file:** `FactionPlayersRequiredForTag=1` is the default. Takes a whole number from 1 to 2147483647.
- **Settings screen:** the "Faction" page. **Sent to joining players:** yes.
- **The game's description:** "Number of players required as faction members before the faction owner can create a group tag"
- **Read in:** `zombie.characters.Faction#canCreateTag` (line 56); `media/lua/client/ISUI/UserPanel/ISCreateFactionTagUI.lua` in `ISCreateFactionTagUI:updateButtons` (line 67); `media/lua/client/ISUI/UserPanel/ISFactionUI.lua` in `ISFactionUI:updateButtons` (line 264).

## Safehouse

### AdminSafehouse

- **In the file:** `AdminSafehouse=false` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Only admins can claim safehouses"
- **Read in:** `zombie.iso.areas.SafeHouse#canBeSafehouse` (lines 389, 398); `zombie.iso.areas.SafeHouse#allowSafeHouse` (lines 565, 576); `zombie.network.GameServer#handleClientCommand` (line 2121); `zombie.network.packets.safehouse.SafezoneClaimPacket#isConsistent` (line 77).

### PlayerSafehouse

- **In the file:** `PlayerSafehouse=false` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Both admins and players can claim safehouses"
- **Read in:** `zombie.iso.areas.SafeHouse#canBeSafehouse` (lines 389, 393, 398); `zombie.iso.areas.SafeHouse#alreadyHaveSafehouse` (lines 556, 560); `zombie.iso.areas.SafeHouse#allowSafeHouse` (lines 565, 566); `zombie.network.GameServer#handleClientCommand` (lines 2121, 2129); `zombie.network.packets.safehouse.SafezoneClaimPacket#isConsistent` (line 77).

### SafehouseAllowTrepass

- **In the file:** `SafehouseAllowTrepass=true` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Allow non-members to enter a safehouse without being invited"
- **Read in:** `zombie.gameStates.GameLoadingState#exit` (line 442); `zombie.iso.areas.SafeHouse#isSafehouseAllowTrepass` (line 242); `zombie.iso.areas.SafeHouse#isPlayerAllowedOnSquare` (line 781); `zombie.iso.areas.SafeHouse#kickUserFromSafehouse` (line 842); `zombie.iso.objects.IsoWindow#canClimbThroughHelper` (line 1315).

### SafehouseAllowFire

- **In the file:** `SafehouseAllowFire=true` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Allow fire to damage safehouses"
- **Read in:** `zombie.iso.IsoGridSquare#BurnWalls` (line 6238); `zombie.iso.objects.IsoFire#CanAddFire` (line 289).

### SafehouseAllowLoot

- **In the file:** `SafehouseAllowLoot=true` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Allow non-members to take items from safehouses"
- **Read in:** `zombie.iso.areas.SafeHouse#isSafehouseAllowLoot` (line 270).

### SafehouseAllowRespawn

- **In the file:** `SafehouseAllowRespawn=false` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Players will respawn in a safehouse that they were a member of before they died"
- **Read in:** `zombie.iso.IsoWorld#init` (lines 2133, 2313, 2347); `zombie.network.packets.character.CreatePlayerPacket#processServer` (line 275); `media/lua/client/ISUI/AdminPanel/ZoneEditor/MultiplayerZoneEditorMode_Safehouse.lua` in `DetailsPanel:createChildren` (line 310); `media/lua/client/ISUI/UserPanel/ISSafehouseUI.lua` in `ISSafehouseUI:initialise` (line 156); `media/lua/client/OptionScreens/MapSpawnSelect.lua` in `MapSpawnSelect:getSafehouseSpawnRegion` (line 418).

### SafehouseDaySurvivedToClaim

- **In the file:** `SafehouseDaySurvivedToClaim=0` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Players must have survived this number of in-game days before they are allowed to claim a safehouse"
- **Read in:** `zombie.iso.areas.SafeHouse#canBeSafehouse` (line 397); `zombie.iso.areas.SafeHouse#allowSafeHouse` (lines 571, 572); `zombie.iso.areas.SafeHouse#hasNotSurvivedEnoughToClaim` (line 863).
- **What the code does with it:** 0 turns it off. Above 0, a player who has survived fewer than this many days (hours survived below the value times 24) cannot claim a safehouse.

### SafeHouseRemovalTime

- **In the file:** `SafeHouseRemovalTime=144` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Players are automatically removed from a safehouse they have not visited for this many real-world hours"
- **Read in:** `zombie.iso.areas.SafeHouse#update` (line 879).
- **What the code does with it:** A number of hours: the code multiplies it by 3,600,000 milliseconds. 0 turns removal off; otherwise `SafeHouse#update` releases every safehouse that `isSafeHouseExpired` reports as expired and tells every player.

### DisableSafehouseWhenOwnerConnected

- **In the file:** `DisableSafehouseWhenOwnerConnected=false` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Safehouse acts like a normal house if an owner of the safehouse is connected (so secure when the owner is offline)"
- **Read in:** `zombie.iso.areas.SafeHouse#isSafeHouse` (line 222); `zombie.iso.areas.SafeHouse#isSafehouseAllowTrepass` (line 244); `zombie.network.GameClient#update` (line 325); `zombie.network.packets.connection.ConnectedPacket#parse` (line 225).

### SafehouseAllowNonResidential

- **In the file:** `SafehouseAllowNonResidential=false` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **The game's description:** "Governs whether players can claim non-residential buildings."
- **Read in:** `zombie.iso.areas.SafeHouse#canBeSafehouse` (line 524).

### SafehouseDisableDisguises

- **In the file:** `SafehouseDisableDisguises=true` is the default. Takes true or false.
- **Settings screen:** the "Safehouse" page. **Sent to joining players:** yes.
- **Read in:** `zombie.characters.IsoGameCharacter#updateDisguisedState` (line 15467).

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
