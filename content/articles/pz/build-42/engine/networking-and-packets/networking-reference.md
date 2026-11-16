---
id: build-42-networking-reference
slug: networking-reference
title: 'Networking reference'
game: pz
version: build-42
section: engine
category: networking-and-packets
difficulty: advanced
tags:
  - engine
  - multiplayer
  - networking
  - packets
  - reference
excerpt: >-
  Counted tables for Build 42.22 multiplayer: the packet types, the network events, the network server options, and the Lua functions that reach the network.
last_updated: '2026-11-15'
related_articles:
  - the-packet-system
  - how-multiplayer-works
  - connecting-and-logging-in
  - who-owns-what
  - client-and-server-commands
  - timed-actions-and-items-over-the-network
  - where-each-capability-is-checked
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#packets-by-folder) | [server owners](#network-server-options) | the explanations are in [The packet system](/pz/build-42/engine/networking-and-packets/the-packet-system) and [Client and server commands](/pz/build-42/engine/networking-and-packets/client-and-server-commands)

:::callout[The 1-minute version]{kind=key}
- The packet list has 303 entries: 250 are written as a class and 53 are written inline with handler methods. A script counted them from the enum and the class annotations.
- The number 261 counts Java files in the packet folder, not packet types. 246 of those files are named by an entry, 15 are not, and 4 more packet classes sit outside the folder.
- 62 entries are handled only by the server, 87 only by the client, and 125 by both. 8 entries have no handler on either side.
- 255 entries need the capability `LoginOnServer`, 6 need none, and 42 need a staff capability.
- 25 entries name an anti-cheat list. Which checks those are is explained in the anti-cheat pages that follow this series.
- `GameClient` and `GameServer` have no members that Lua can call. Lua reaches the network through global functions, which are listed below with the side each one works on.
:::

:::facts
- **Packet types** 303, ids 0 to 302
- **Class files in `network/packets`** 261, of which 246 are named by an entry
- **Anti-cheat lists** on 25 entries, 39 uses of 13 check names
- **Events listed** 66
- **Network server options listed** 41
- **Vanilla server-side command handlers** 81 in `ClientCommands.lua`, 33 in `VehicleCommands.lua`
:::

## How the numbers were counted

Every count on this page comes from a script that read the packet enum and the packet classes, not from an estimate.

The script reads the lines of the `PacketType` enum, which hold one entry each. :cite[(`PacketTypes.java:321-623`)]

For an entry written as `Name(Class.class)` it opens the class and reads the `@PacketSetting` annotation for priority, reliability, ordering channel, capability, handling type and anti-cheat list. For an inline entry it reads the numbers and the handler names in the line itself, and takes the handling type from which handler slots are not `null`. :cite[(`PacketTypes.java:682-724`)] The ids are the positions in the enum, from 0 to 302. :cite[(`PacketTypes.java:747-749`)] The script was run once and deleted.

### Why 303 is not 261

The enum has 303 entries and the packet folder has 261 class files, because the two numbers count different things.

| Number | What it counts | Code |
|---|---|---|
| 303 | Entries of the `PacketType` enum | :cite[(`PacketTypes.java:321-623`)] |
| 250 | Entries written as a class | :cite[(`PacketTypes.java:321-623`)] |
| 53 | Entries written inline, with handler methods and no class | :cite[(`PacketTypes.java:321-623`)] |
| 250 | Distinct classes named by the 250 class entries, so no class is named twice | :cite[(`PacketTypes.java:321-623`)] |
| 246 | Of those classes, the ones in `network/packets` and its folders | :cite[(`PacketTypes.java:321-623`)] |
| 4 | Of those classes, the ones outside it: three in `zombie/vehicleNetworkSound` and one in `zombie/entity` | :cite[(`PacketTypes.java:321-623`)] |
| 261 | Java files in `network/packets` and its folders | :cite[(`PacketTypes.java:321-623`)] |
| 15 | Of those files, the ones that no entry names | :cite[(`PacketTypes.java:321-623`)] |

The 53 inline entries have no class, so they are in the 303 and in no file count. The 15 files that no entry names are of three kinds:

- **Interfaces (3):** `IDescriptor`, `INetworkPacket` and `HitCharacter`.
- **Base classes of registered packets (10):** `PlayerRequestPacket`, `DeadCharacterPacket`, `PlayerPacket`, `ZombieSimulationPacket`, `ZombieSynchronizationPacket`, `AnimalUpdatePacket`, `PlayerHit`, `VehicleHit`, `VehiclePacket` and `VehiclePhysicsPacket`. Each has registered subclasses, such as the reliable and unreliable pairs.
- **Others (2):** `ZombiePacket`, a helper that no registered class extends, and `VehicleImpulsePacket`, which carries a `@PacketSetting` and has no entry. A search of the source finds `VehicleImpulsePacket` named only in its own file.

The folders `fields`, `id`, `statistics` and `anticheats` hold 66, 4, 15 and 25 files, and they are not packet classes.

## Packets by folder

Each table lists the entries whose class sits in one folder, with who handles the packet, what capability a sender needs and which anti-cheat names the entry lists.

The columns are these.

- **Handler** is the class for a class entry, and for an inline entry the handler methods, where S is the server's, C the client's and L the client's while it is loading.
- **Direction** is read from the handling type: "to server" means the server handles it, so a client sends it, and "to client" means a client handles it. 
- **Capability** is the role capability a sender needs, and `LoginOnServer` is held by any logged-in player.
- **Anti-cheat list** is the `anticheats` names of the entry, and "-" means none. :cite[(`PacketSetting.java:26-29`, `PacketSetting.java:35-57`, `PacketTypes.java:304-312`, `PacketTypes.java:682-684`)]

Eight entries have no handler on either side. Six of them, the `PlayerHit...` entries, carry anti-cheat lists but are not passed on by the server's receive path, because that path needs the server bit. How those lists run is not verified. :cite[(`PacketTypes.java:758-764`, `network/packets/hit/PlayerHitPacket.java:78`)]

### Top level of `network/packets` (105)

The packet classes that sit directly in the `network/packets` folder.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 16 | `HumanVisual` | `HumanVisualPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:337`)] |
| 17 | `SyncClothing` | `SyncClothingPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:338`)] |
| 18 | `SyncVisuals` | `SyncVisualsPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:339`)] |
| 19 | `Equip` | `EquipPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:340`)] |
| 20 | `AddXPMultiplier` | `AddXPMultiplierPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:341`)] |
| 21 | `HaloText` | `HaloTextPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:342`)] |
| 23 | `ChangeSafety` | `SafetyPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:344`)] |
| 24 | `BodyDamageUpdate` | `BodyDamageUpdatePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:345`)] |
| 25 | `GameCharacterAttachedItem` | `GameCharacterAttachedItemPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:346`)] |
| 26 | `VariableSync` | `VariableSyncPacket` | both ways, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:347`)] |
| 27 | `SyncPlayerStats` | `SyncPlayerStatsPacket` | both ways | `CanModifyBodyStats` | - | :cite[(`PacketTypes.java:348`)] |
| 28 | `SyncPlayerFields` | `SyncPlayerFieldsPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:349`)] |
| 35 | `RequestMedicalCheck` | `RequestMedicalCheckPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:356`)] |
| 36 | `AcceptMedicalCheck` | `AcceptMedicalCheckPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:357`)] |
| 37 | `RejectMedicalCheck` | `RejectMedicalCheckPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:358`)] |
| 38 | `HiddenAuthors` | `HiddenAuthorsPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:359`)] |
| 39 | `ServerMap` | `ServerMapPacket` | to client, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:360`)] |
| 40 | `SentChunk` | `SentChunkPacket` | none (data only) | `LoginOnServer` | - | :cite[(`PacketTypes.java:361`)] |
| 41 | `RequestZipList` | `RequestZipListPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:362`)] |
| 42 | `NotRequiredInZip` | `NotRequiredInZipPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:363`)] |
| 43 | `RequestData` | `RequestDataPacket` | both ways, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:364`)] |
| 44 | `ChunkNotReady` | `ChunkNotReadyPacket` | none (data only) | `LoginOnServer` | - | :cite[(`PacketTypes.java:365`)] |
| 54 | `SlowFactor` | `SlowFactorPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:375`)] |
| 66 | `AddTrack` | `AddTrackPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:387`)] |
| 67 | `ManageAnimalTrackOnWorldMap` | `ManageAnimalTrackOnWorldMapPacket` | to client | `AnimalCheats` | - | :cite[(`PacketTypes.java:388`)] |
| 98 | `ReadAnnotedMap` | `ReadAnnotedMapPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:419`)] |
| 99 | `ZombieHelmetFalling` | `ZombieHelmetFallingPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:420`)] |
| 109 | `MessageForAdmin` | `MessageForAdminPacket` | to client | `CanSeeMessageForAdmin` | - | :cite[(`PacketTypes.java:430`)] |
| 111 | `MetaGrid` | `MetaGridPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:432`)] |
| 112 | `WorldMessage` | `WorldMessagePacket` | to server | `WorkWithUserlog` | - | :cite[(`PacketTypes.java:433`)] |
| 114 | `ReloadOptions` | `ReloadOptionsPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:435`)] |
| 115 | `Kicked` | `KickedPacket` | to client, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:436`)] |
| 120 | `ItemTransaction` | `ItemTransactionPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:441`)] |
| 121 | `GeneralAction` | `GeneralActionPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:442`)] |
| 122 | `NetTimedAction` | `NetTimedActionPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:443`)] |
| 123 | `BuildAction` | `BuildActionPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:444`)] |
| 124 | `FishingAction` | `FishingActionPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:445`)] |
| 125 | `AddInventoryItemToContainer` | `AddInventoryItemToContainerPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:446`)] |
| 126 | `RemoveInventoryItemFromContainer` | `RemoveInventoryItemFromContainerPacket` | both ways | `EditItem` | - | :cite[(`PacketTypes.java:447`)] |
| 127 | `ReplaceInventoryItemInContainer` | `ReplaceInventoryItemInContainerPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:448`)] |
| 128 | `SyncItemDelete` | `SyncItemDeletePacket` | both ways | `EditItem` | - | :cite[(`PacketTypes.java:449`)] |
| 129 | `AddItemToMap` | `AddItemToMapPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:450`)] |
| 130 | `AddObjectToMap` | `AddObjectToMapPacket` | both ways | `AddItem` | - | :cite[(`PacketTypes.java:451`)] |
| 132 | `RemoveItemFromSquare` | `RemoveItemFromSquarePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:453`)] |
| 134 | `RequestItemsForContainer` | `RequestItemsForContainerPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:455`)] |
| 135 | `RemoveContestedItemsFromInventory` | `RemoveContestedItemsFromInventoryPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:456`)] |
| 136 | `ItemStats` | `ItemStatsPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:457`)] |
| 137 | `AddBrokenGlass` | `AddBrokenGlassPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:458`)] |
| 138 | `AddExplosiveTrap` | `AddExplosiveTrapPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:459`)] |
| 139 | `SledgehammerDestroy` | `SledgehammerDestroyPacket` | both ways | `UseDebugContextMenu` | - | :cite[(`PacketTypes.java:460`)] |
| 140 | `SyncPlayerAlarmClock` | `SyncPlayerAlarmClockPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:461`)] |
| 141 | `SyncWorldAlarmClock` | `SyncWorldAlarmClockPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:462`)] |
| 142 | `SyncExtendedPlacement` | `SyncExtendedPlacementPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:463`)] |
| 143 | `SyncItemActivated` | `SyncItemActivatedPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:464`)] |
| 144 | `GlobalObjects` | `GlobalObjectsPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:465`)] |
| 149 | `SyncItemFields` | `SyncItemFieldsPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:470`)] |
| 150 | `SyncItemModData` | `SyncItemModDataPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:471`)] |
| 151 | `SyncHandWeaponFields` | `SyncHandWeaponFieldsPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:472`)] |
| 172 | `PlayerXp` | `PlayerXpPacket` | both ways | `CanModifyPlayerStatsInThePlayerStatsUI` | - | :cite[(`PacketTypes.java:493`)] |
| 188 | `Weather` | `WeatherPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:509`)] |
| 192 | `SyncPuddles` | `SyncPuddlesPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:513`)] |
| 195 | `SyncNonPvpZone` | `SyncNonPvpZonePacket` | both ways | `CanSetupNonPVPZone` | - | :cite[(`PacketTypes.java:516`)] |
| 196 | `SyncThumpable` | `SyncThumpablePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:517`)] |
| 199 | `ObjectModData` | `ObjectModDataPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:520`)] |
| 200 | `ObjectChange` | `ObjectChangePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:521`)] |
| 203 | `StartFire` | `StartFirePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:524`)] |
| 204 | `StopFire` | `StopFirePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:525`)] |
| 206 | `SendCustomColor` | `CustomColorPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:527`)] |
| 208 | `GetModData` | `GetModDataPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:529`)] |
| 211 | `UpdateOverlaySprite` | `UpdateOverlaySpritePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:532`)] |
| 214 | `SyncCustomLightSettings` | `SyncCustomLightSettingsPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:535`)] |
| 216 | `ChunkObjectStateRequest` | `ChunkObjectStateRequestPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:537`)] |
| 220 | `AddItemInInventory` | `AddItemInInventoryPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:541`)] |
| 222 | `ExtraInfo` | `ExtraInfoPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:543`)] |
| 223 | `Teleport` | `TeleportPacket` | both ways | `TeleportToCoordinates` | - | :cite[(`PacketTypes.java:544`)] |
| 228 | `NetworkUsers` | `NetworkUsersPacket` | to client | `SeeNetworkUsers` | - | :cite[(`PacketTypes.java:549`)] |
| 229 | `PVPEvents` | `PVPEventsPacket` | both ways | `PVPLogTool` | - | :cite[(`PacketTypes.java:550`)] |
| 230 | `RequestNetworkUsers` | `RequestNetworkUsersPacket` | to server | `SeeNetworkUsers` | - | :cite[(`PacketTypes.java:551`)] |
| 231 | `NetworkUserAction` | `NetworkUserActionPacket` | to server | `ModifyNetworkUsers` | - | :cite[(`PacketTypes.java:552`)] |
| 232 | `BanUnbanUserAction` | `BanUnbanUserActionPacket` | to server | `BanUnbanUser` | - | :cite[(`PacketTypes.java:553`)] |
| 233 | `TeleportUserAction` | `TeleportUserActionPacket` | to server | `TeleportPlayerToAnotherPlayer` | - | :cite[(`PacketTypes.java:554`)] |
| 234 | `TeleportToHimUserAction` | `TeleportToHimUserActionPacket` | to server | `TeleportToPlayer` | - | :cite[(`PacketTypes.java:555`)] |
| 235 | `Roles` | `RolesPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:556`)] |
| 236 | `RequestRoles` | `RequestRolesPacket` | to server | `RolesRead` | - | :cite[(`PacketTypes.java:557`)] |
| 237 | `RolesEdit` | `RolesEditPacket` | to server | `RolesWrite` | - | :cite[(`PacketTypes.java:558`)] |
| 239 | `AddUserlog` | `AddUserlogPacket` | to server | `AddUserlog` | - | :cite[(`PacketTypes.java:560`)] |
| 240 | `RemoveUserlog` | `RemoveUserlogPacket` | to server | `WorkWithUserlog` | - | :cite[(`PacketTypes.java:561`)] |
| 241 | `AddWarningPoint` | `AddWarningPointPacket` | to server | `AddUserlog` | - | :cite[(`PacketTypes.java:562`)] |
| 243 | `RegisterZone` | `RegisterZonePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:564`)] |
| 244 | `SyncZone` | `SyncZonePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:565`)] |
| 255 | `AddTicket` | `AddTicketPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:576`)] |
| 256 | `ViewedTicket` | `ViewedTicketPacket` | to server | `AnswerTickets` | - | :cite[(`PacketTypes.java:577`)] |
| 257 | `ViewTickets` | `ViewTicketsPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:578`)] |
| 258 | `RemoveTicket` | `RemoveTicketPacket` | to server | `AnswerTickets` | - | :cite[(`PacketTypes.java:579`)] |
| 261 | `RequestTrading` | `RequestTradingPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:582`)] |
| 262 | `AcceptTrading` | `AcceptTradingPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:583`)] |
| 263 | `RejectTrading` | `RejectTradingPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:584`)] |
| 264 | `TradingUIAddItem` | `TradingUIAddItemPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:585`)] |
| 265 | `TradingUIRemoveItem` | `TradingUIRemoveItemPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:586`)] |
| 266 | `TradingUIUpdateState` | `TradingUIUpdateStatePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:587`)] |
| 267 | `WarStateSync` | `WarStateSyncPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:588`)] |
| 268 | `WarSync` | `WarSyncPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:589`)] |
| 292 | `WaveSignal` | `WaveSignalPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:613`)] |
| 298 | `BodyPartSync` | `BodyPartSyncPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:619`)] |
| 302 | `SyncEntityResource` | `SyncEntityResourcePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:623`)] |

### `network/packets/actions` (11)

One-shot effects such as eating, sneezing or smashing a window.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 63 | `AnimalEvent` | `AnimalEventPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:384`)] |
| 87 | `State` | `StatePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:408`)] |
| 88 | `Helicopter` | `HelicopterPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:409`)] |
| 89 | `SmashWindow` | `SmashWindowPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:410`)] |
| 90 | `EatFood` | `EatFoodPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:411`)] |
| 92 | `BurnCorpse` | `BurnCorpsePacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:413`)] |
| 93 | `SneezeCough` | `SneezeCoughPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:414`)] |
| 94 | `AddBlood` | `AddBloodPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:415`)] |
| 95 | `RemoveBlood` | `RemoveBloodPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:416`)] |
| 96 | `WakeUpPlayer` | `WakeUpPlayerPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:417`)] |
| 131 | `AddCorpseToMap` | `AddCorpseToMapPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:452`)] |

### `network/packets/character` (35)

Players, zombies, animals and their state.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 5 | `CreatePlayer` | `CreatePlayerPacket` | both ways, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:326`)] |
| 13 | `PlayerUpdateReliable` | `PlayerPacketReliable` | both ways | `LoginOnServer` | Power, Speed, NoClip | :cite[(`PacketTypes.java:334`)] |
| 14 | `PlayerUpdateUnreliable` | `PlayerPacketUnreliable` | both ways | `LoginOnServer` | Power, Speed, NoClip | :cite[(`PacketTypes.java:335`)] |
| 15 | `PlayerDataRequest` | `PlayerDataRequestPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:336`)] |
| 22 | `PlayerDeath` | `DeadPlayerPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:343`)] |
| 29 | `ForageItemFound` | `ForageItemFoundPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:350`)] |
| 33 | `PlayerDropHeldItems` | `PlayerDropHeldItemsPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:354`)] |
| 34 | `ClothingWetness` | `ClothingWetnessPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:355`)] |
| 45 | `ZombieList` | `ZombieListPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:366`)] |
| 46 | `ZombieSimulationUnreliable` | `ZombieSimulationUnreliablePacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:367`)] |
| 47 | `ZombieSimulationReliable` | `ZombieSimulationReliablePacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:368`)] |
| 48 | `ZombieSynchronizationUnreliable` | `ZombieSynchronizationUnreliablePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:369`)] |
| 49 | `ZombieSynchronizationReliable` | `ZombieSynchronizationReliablePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:370`)] |
| 50 | `ZombieDeleteOnClient` | `ZombieDeleteOnClientPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:371`)] |
| 51 | `ZombieRequest` | `ZombieRequestPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:372`)] |
| 52 | `ZombieStagger` | `ZombieStaggerPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:373`)] |
| 53 | `ZombieDeath` | `DeadZombiePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:374`)] |
| 55 | `ZombieControl` | `ZombieControlPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:376`)] |
| 56 | `Thump` | `ThumpPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:377`)] |
| 57 | `ZombieFall` | `ZombieFallPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:378`)] |
| 58 | `AnimalCommand` | `AnimalCommandPacket` | both ways | `AnimalCheats` | - | :cite[(`PacketTypes.java:379`)] |
| 59 | `AnimalOwnership` | `AnimalOwnershipPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:380`)] |
| 60 | `AnimalPacket` | `AnimalPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:381`)] |
| 61 | `AnimalUpdateReliable` | `AnimalUpdateReliablePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:382`)] |
| 62 | `AnimalUpdateUnreliable` | `AnimalUpdateUnreliablePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:383`)] |
| 64 | `AnimalDeath` | `DeadAnimalPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:385`)] |
| 65 | `AnimalTracks` | `AnimalTracksPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:386`)] |
| 133 | `RemoveCorpseFromMap` | `RemoveCorpseFromMapPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:454`)] |
| 167 | `PlayerDamage` | `PlayerDamagePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:488`)] |
| 168 | `PlayerStats` | `PlayerStatsPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:489`)] |
| 169 | `PlayerHealth` | `PlayerHealthPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:490`)] |
| 170 | `PlayerInjuries` | `PlayerInjuriesPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:491`)] |
| 171 | `PlayerEffects` | `PlayerEffectsPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:492`)] |
| 174 | `PlayerEmptyShot` | `PlayerEmptyShotPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:495`)] |
| 175 | `PlayerSteppedOnGlass` | `PlayerSteppedOnGlassPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:496`)] |

### `network/packets/connection` (12)

Login, the queue, joining and the second factor.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 1 | `Login` | `LoginPacket` | to server | `None` | - | :cite[(`PacketTypes.java:322`)] |
| 2 | `LoginQueueRequest` | `QueuePacket` | to server; to client (loading only) | `LoginOnServer` | - | :cite[(`PacketTypes.java:323`)] |
| 3 | `LoginQueueDone` | `LoginQueueDonePacket` | to server; to client (loading only) | `LoginOnServer` | - | :cite[(`PacketTypes.java:324`)] |
| 4 | `LoadPlayerProfile` | `LoadPlayerProfilePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:325`)] |
| 6 | `PlayerConnect` | `ConnectPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:327`)] |
| 7 | `ConnectedPlayer` | `ConnectedPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:328`)] |
| 8 | `ConnectCoop` | `ConnectCoopPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:329`)] |
| 9 | `ConnectedCoop` | `ConnectedCoopPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:330`)] |
| 10 | `GoogleAuthKey` | `GoogleAuthKeyPacket` | both ways, also while loading | `None` | - | :cite[(`PacketTypes.java:331`)] |
| 11 | `GoogleAuth` | `GoogleAuthPacket` | to server | `None` | - | :cite[(`PacketTypes.java:332`)] |
| 12 | `GoogleAuthRequest` | `GoogleAuthRequestPacket` | to client (loading only) | `None` | - | :cite[(`PacketTypes.java:333`)] |
| 110 | `MetaData` | `MetaDataPacket` | to client, also while loading | `None` | - | :cite[(`PacketTypes.java:431`)] |

### `network/packets/faction` (10)

Factions.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 245 | `FactionInvite` | `FactionInvitePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:566`)] |
| 246 | `FactionAccept` | `FactionAcceptPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:567`)] |
| 247 | `FactionRemoveMember` | `FactionRemoveMemberPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:568`)] |
| 248 | `FactionChangeOwner` | `FactionChangeOwnerPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:569`)] |
| 249 | `FactionChangeTag` | `FactionChangeTagPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:570`)] |
| 250 | `FactionChangeTitle` | `FactionChangeTitlePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:571`)] |
| 251 | `FactionDisband` | `FactionDisbandPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:572`)] |
| 252 | `FactionCreate` | `FactionCreatePacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:573`)] |
| 253 | `FactionSync` | `FactionSyncPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:574`)] |
| 254 | `FactionStats` | `FactionStatsPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:575`)] |

### `network/packets/foraging` (3)

Foraging.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 30 | `ForageRequestZone` | `ForageRequestZonePacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:351`)] |
| 31 | `ForagePool` | `ForagePoolPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:352`)] |
| 32 | `ForageSpot` | `ForageSpotPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:353`)] |

### `network/packets/hit` (17)

Attacks and their statistics.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 152 | `PlayerHit` | `PlayerHitPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:473`)] |
| 153 | `PlayerHitSquare` | `PlayerHitSquarePacket` | none (data only) | `LoginOnServer` | HitLongDistance | :cite[(`PacketTypes.java:474`)] |
| 154 | `PlayerHitObject` | `PlayerHitObjectPacket` | none (data only) | `LoginOnServer` | HitLongDistance, HitWeapon | :cite[(`PacketTypes.java:475`)] |
| 155 | `PlayerHitVehicle` | `PlayerHitVehiclePacket` | none (data only) | `LoginOnServer` | HitLongDistance | :cite[(`PacketTypes.java:476`)] |
| 156 | `PlayerHitZombie` | `PlayerHitZombiePacket` | none (data only) | `LoginOnServer` | HitLongDistance, HitWeapon | :cite[(`PacketTypes.java:477`)] |
| 157 | `PlayerHitPlayer` | `PlayerHitPlayerPacket` | none (data only) | `LoginOnServer` | HitLongDistance, HitWeapon, Safety | :cite[(`PacketTypes.java:478`)] |
| 158 | `PlayerHitAnimal` | `PlayerHitAnimalPacket` | none (data only) | `LoginOnServer` | HitLongDistance, HitWeapon | :cite[(`PacketTypes.java:479`)] |
| 159 | `ZombieHitPlayer` | `ZombieHitPlayerPacket` | both ways | `LoginOnServer` | HitShortDistance, Target | :cite[(`PacketTypes.java:480`)] |
| 160 | `AnimalHitPlayer` | `AnimalHitPlayerPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:481`)] |
| 161 | `AnimalHitAnimal` | `AnimalHitAnimalPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:482`)] |
| 162 | `AnimalHitThumpable` | `AnimalHitThumpablePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:483`)] |
| 163 | `ZombieHitThumpable` | `ZombieHitThumpablePacket` | both ways | `LoginOnServer` | HitShortDistance | :cite[(`PacketTypes.java:484`)] |
| 164 | `VehicleHitZombie` | `VehicleHitZombiePacket` | both ways | `LoginOnServer` | HitShortDistance, HitVehicle | :cite[(`PacketTypes.java:485`)] |
| 165 | `VehicleHitPlayer` | `VehicleHitPlayerPacket` | both ways | `LoginOnServer` | HitShortDistance, Safety, HitVehicle | :cite[(`PacketTypes.java:486`)] |
| 166 | `VehicleHitAnimal` | `VehicleHitAnimalPacket` | to server | `LoginOnServer` | HitShortDistance, HitVehicle | :cite[(`PacketTypes.java:487`)] |
| 173 | `AttackCollisionCheckPacket` | `AttackCollisionCheckPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:494`)] |
| 176 | `HitStatistic` | `HitStatisticPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:497`)] |

### `network/packets/safehouse` (10)

Safehouses and safezones.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 279 | `SafehouseInvite` | `SafehouseInvitePacket` | both ways | `LoginOnServer` | SafeHouseOwner | :cite[(`PacketTypes.java:600`)] |
| 280 | `SafehouseAccept` | `SafehouseAcceptPacket` | both ways | `LoginOnServer` | SafeHousePlayer | :cite[(`PacketTypes.java:601`)] |
| 281 | `SafehouseChangeMember` | `SafehouseChangeMemberPacket` | to server | `LoginOnServer` | SafeHouseMember | :cite[(`PacketTypes.java:602`)] |
| 282 | `SafehouseChangeOwner` | `SafehouseChangeOwnerPacket` | to server | `LoginOnServer` | SafeHouseOwner | :cite[(`PacketTypes.java:603`)] |
| 283 | `SafehouseChangeRespawn` | `SafehouseChangeRespawnPacket` | to server | `LoginOnServer` | SafeHouseMember | :cite[(`PacketTypes.java:604`)] |
| 284 | `SafehouseChangeTitle` | `SafehouseChangeTitlePacket` | to server | `LoginOnServer` | SafeHouseOwner | :cite[(`PacketTypes.java:605`)] |
| 285 | `SafehouseRelease` | `SafehouseReleasePacket` | both ways | `LoginOnServer` | SafeHouseOwner | :cite[(`PacketTypes.java:606`)] |
| 286 | `SafehouseClaim` | `SafehouseClaimPacket` | to server | `LoginOnServer` | SafeHousePlayer | :cite[(`PacketTypes.java:607`)] |
| 287 | `SafezoneClaim` | `SafezoneClaimPacket` | to server | `CanSetupSafehouses` | SafeHousePlayer | :cite[(`PacketTypes.java:608`)] |
| 288 | `SafehouseSync` | `SafehouseSyncPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:609`)] |

### `network/packets/service` (20)

Server services such as scoreboards, the userlog, pausing and global mod data.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 0 | `Checksum` | `ChecksumPacket` | both ways, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:321`)] |
| 100 | `TimeSync` | `TimeSyncPacket` | both ways, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:421`)] |
| 101 | `SetMultiplier` | `SetMultiplierPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:422`)] |
| 102 | `AccessDenied` | `AccessDeniedPacket` | to client (loading only) | `LoginOnServer` | - | :cite[(`PacketTypes.java:423`)] |
| 103 | `StartPause` | `StartPausePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:424`)] |
| 104 | `StopPause` | `StopPausePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:425`)] |
| 105 | `PlayerTimeout` | `PlayerTimeoutPacket` | to client, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:426`)] |
| 106 | `SyncClock` | `SyncClockPacket` | to client, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:427`)] |
| 108 | `ServerQuit` | `ServerQuitPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:429`)] |
| 145 | `ReceiveModData` | `ReceiveModDataPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:466`)] |
| 146 | `ReceiveContainerModData` | `ReceiveContainerModDataPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:467`)] |
| 147 | `GlobalModData` | `GlobalModDataPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:468`)] |
| 148 | `GlobalModDataRequest` | `GlobalModDataRequestPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:469`)] |
| 186 | `Statistics` | `StatisticsPacket` | both ways | `GetStatistic` | - | :cite[(`PacketTypes.java:507`)] |
| 187 | `ScoreboardUpdate` | `ScoreboardUpdatePacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:508`)] |
| 221 | `PlayerInventory` | `PlayerInventoryPacket` | both ways | `InspectPlayerInventory` | - | :cite[(`PacketTypes.java:542`)] |
| 238 | `RequestUserLog` | `RequestUserLogPacket` | both ways | `ReadUserLog` | - | :cite[(`PacketTypes.java:559`)] |
| 289 | `PopmanDebugCommand` | `PopmanDebugCommandPacket` | both ways | `ConnectWithDebug` | - | :cite[(`PacketTypes.java:610`)] |
| 290 | `ServerDebugInfo` | `ServerDebugInfo` | both ways | `ConnectWithDebug` | - | :cite[(`PacketTypes.java:611`)] |
| 291 | `ServerLOS` | `ServerLOSPacket` | both ways | `ConnectWithDebug` | - | :cite[(`PacketTypes.java:612`)] |

### `network/packets/sound` (6)

World sounds.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 177 | `PlaySound` | `PlaySoundPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:498`)] |
| 178 | `RangedWeaponSound` | `RangedWeaponSoundPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:499`)] |
| 179 | `LoopedRangedWeaponSound` | `LoopedRangedWeaponSoundPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:500`)] |
| 180 | `WorldSoundPacket` | `WorldSoundPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:501`)] |
| 183 | `PlayWorldSound` | `PlayWorldSoundPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:504`)] |
| 184 | `StopSound` | `StopSoundPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:505`)] |

### `network/packets/vehicle` (16)

Vehicles.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 68 | `VehicleRequest` | `VehicleRequestPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:389`)] |
| 69 | `VehicleFullUpdate` | `VehicleFullUpdatePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:390`)] |
| 70 | `VehicleUpdate` | `VehicleUpdatePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:391`)] |
| 71 | `VehiclePhysicsReliable` | `VehiclePhysicsReliablePacket` | both ways | `LoginOnServer` | Speed | :cite[(`PacketTypes.java:392`)] |
| 72 | `VehiclePhysicsUnreliable` | `VehiclePhysicsUnreliablePacket` | both ways | `LoginOnServer` | Speed | :cite[(`PacketTypes.java:393`)] |
| 73 | `VehicleTowingAttach` | `VehicleTowingAttachPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:394`)] |
| 74 | `VehicleTowingDetach` | `VehicleTowingDetachPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:395`)] |
| 75 | `VehicleTowingState` | `VehicleTowingStatePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:396`)] |
| 76 | `VehicleRemove` | `VehicleRemovePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:397`)] |
| 77 | `VehicleCollide` | `VehicleCollidePacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:398`)] |
| 78 | `VehiclePassengerPosition` | `VehiclePassengerPositionPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:399`)] |
| 79 | `VehiclePassengerRequest` | `VehiclePassengerRequestPacket` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:400`)] |
| 80 | `VehiclePassengerResponse` | `VehiclePassengerResponsePacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:401`)] |
| 81 | `VehicleEnter` | `VehicleEnterPacket` | both ways | `LoginOnServer` | VehicleEnter | :cite[(`PacketTypes.java:402`)] |
| 82 | `VehicleExit` | `VehicleExitPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:403`)] |
| 83 | `VehicleSwitchSeat` | `VehicleSwitchSeatPacket` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:404`)] |

### `network/packets/world` (1)

The world.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 299 | `DebugStory` | `DebugStoryPacket` | to server | `CreateStory` | - | :cite[(`PacketTypes.java:620`)] |

### Classes outside `network/packets` (4)

Packet classes in `zombie/vehicleNetworkSound` and `zombie/entity`.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 84 | `VehicleSoundAddVehicle` | `AddVehiclePacket` | to client, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:405`)] |
| 85 | `VehicleSoundRemoveVehicle` | `RemoveVehiclePacket` | to client, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:406`)] |
| 86 | `VehicleSoundUpdateVehicle` | `UpdateVehiclePacket` | to client, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:407`)] |
| 301 | `GameEntity` | `GameEntityNetwork` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:622`)] |

### Inline entries (53)

Entries written with numbers and handler methods instead of a class. Their handlers are methods of `GameServer` and `GameClient`, where S is the server handler, C the client handler and L the client handler while loading.

| Id | Packet | Handler | Direction | Capability | Anti-cheat list | Code |
|---|---|---|---|---|---|---|
| 91 | `Drink` | S `receiveDrink` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:412`)] |
| 97 | `EatBody` | S `receiveEatBody`; C `receiveEatBody` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:418`)] |
| 107 | `SandboxOptions` | S `receiveSandboxOptions`; C `receiveSandboxOptions` | both ways | `SandboxOptions` | - | :cite[(`PacketTypes.java:428`)] |
| 113 | `ReceiveCommand` | S `receiveReceiveCommand` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:434`)] |
| 116 | `Ping` | S `receivePing`; C `receivePing`; L `receivePing` | both ways, also while loading | `None` | - | :cite[(`PacketTypes.java:437`)] |
| 117 | `SpawnRegion` | C `receiveSpawnRegion`; L `receiveSpawnRegion` | to client, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:438`)] |
| 118 | `WorldMapPlayerPosition` | S `receiveWorldMapPlayerPosition`; C `receiveWorldMapPlayerPosition` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:439`)] |
| 119 | `WorldMap` | S `receiveWorldMap`; C `receiveWorldMap`; L `receiveWorldMap` | both ways, also while loading | `LoginOnServer` | - | :cite[(`PacketTypes.java:440`)] |
| 181 | `AddAmbient` | C `receiveAddAmbient` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:502`)] |
| 182 | `ZombieSound` | C `receiveZombieSound` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:503`)] |
| 185 | `PlaySoundEveryPlayer` | C `receivePlaySoundEveryPlayer` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:506`)] |
| 189 | `StartRain` | C `receiveStartRain` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:510`)] |
| 190 | `StopRain` | C `receiveStopRain` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:511`)] |
| 191 | `ClimateManagerPacket` | S `receiveClimateManagerPacket`; C `receiveClimateManagerPacket` | both ways | `ClimateManager` | - | :cite[(`PacketTypes.java:512`)] |
| 193 | `IsoRegionServerPacket` | C `receiveIsoRegionServerPacket` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:514`)] |
| 194 | `IsoRegionClientRequestFullUpdate` | S `receiveIsoRegionClientRequestFullUpdate` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:515`)] |
| 197 | `SyncIsoObject` | S `receiveSyncIsoObject`; C `receiveSyncIsoObject` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:518`)] |
| 198 | `ClientCommand` | S `receiveClientCommand`; C `receiveClientCommand` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:519`)] |
| 201 | `BloodSplatter` | C `receiveBloodSplatter` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:522`)] |
| 202 | `ZombieDescriptors` | C `receiveZombieDescriptors` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:523`)] |
| 205 | `UpdateItemSprite` | S `receiveUpdateItemSprite`; C `receiveUpdateItemSprite` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:526`)] |
| 207 | `SyncCompost` | S `receiveSyncCompost`; C `receiveSyncCompost` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:528`)] |
| 209 | `SyncPerks` | S `receiveSyncPerks`; C `receiveSyncPerks` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:530`)] |
| 210 | `SyncEquippedRadioFreq` | S `receiveSyncEquippedRadioFreq`; C `receiveSyncEquippedRadioFreq` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:531`)] |
| 212 | `AddAlarm` | C `receiveAddAlarm` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:533`)] |
| 213 | `ChangeTextColor` | S `receiveChangeTextColor`; C `receiveChangeTextColor` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:534`)] |
| 215 | `ChunkObjectStateResponse` | C `receiveChunkObjectState` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:536`)] |
| 217 | `StartFishSplash` | S `receiveBigWaterSplash`; C `receiveBigWaterSplash` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:538`)] |
| 218 | `FishingData` | S `receiveFishingDataRequest`; C `receiveFishingData` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:539`)] |
| 219 | `ToxicBuilding` | C `receiveToxicBuilding` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:540`)] |
| 224 | `InvMngReqItem` | S `receiveInvMngReqItem` | to server | `InspectPlayerInventory` | - | :cite[(`PacketTypes.java:545`)] |
| 225 | `InvMngRemoveItem` | S `receiveInvMngRemoveItem`; C `receiveInvMngRemoveItem` | both ways | `InspectPlayerInventory` | - | :cite[(`PacketTypes.java:546`)] |
| 226 | `InvMngUpdateItem` | S `receiveInvMngUpdateItem` | to server | `InspectPlayerInventory` | - | :cite[(`PacketTypes.java:547`)] |
| 227 | `ChangePlayerStats` | S `receiveChangePlayerStats`; C `receiveChangePlayerStats` | both ways | `CanSeePlayersStats` | - | :cite[(`PacketTypes.java:548`)] |
| 242 | `ConstructedZone` | S `receiveConstructedZone`; C `receiveConstructedZone` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:563`)] |
| 259 | `ViewBannedIPs` | S `receiveViewBannedIPs`; C `receiveViewBannedIPs` | both ways | `BanUnbanUser` | - | :cite[(`PacketTypes.java:580`)] |
| 260 | `ViewBannedSteamIDs` | S `receiveViewBannedSteamIDs`; C `receiveViewBannedSteamIDs` | both ways | `BanUnbanUser` | - | :cite[(`PacketTypes.java:581`)] |
| 269 | `InitPlayerChat` | C `receiveInitPlayerChat` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:590`)] |
| 270 | `PlayerJoinChat` | C `receivePlayerJoinChat` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:591`)] |
| 271 | `PlayerLeaveChat` | C `receivePlayerLeaveChat` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:592`)] |
| 272 | `ChatMessageFromPlayer` | S `receiveChatMessageFromPlayer` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:593`)] |
| 273 | `ChatMessageToPlayer` | C `receiveChatMessageToPlayer` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:594`)] |
| 274 | `PlayerStartPMChat` | S `receivePlayerStartPMChat` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:595`)] |
| 275 | `AddChatTab` | C `receiveAddChatTab` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:596`)] |
| 276 | `RemoveChatTab` | C `receiveRemoveChatTab` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:597`)] |
| 277 | `PlayerConnectedToChat` | C `receivePlayerConnectedToChat` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:598`)] |
| 278 | `PlayerNotFound` | C `receivePlayerNotFound` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:599`)] |
| 293 | `PlayerListensChannel` | S `receivePlayerListensChannel` | to server | `LoginOnServer` | - | :cite[(`PacketTypes.java:614`)] |
| 294 | `RadioServerData` | S `receiveRadioServerData`; C `receiveRadioServerData` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:615`)] |
| 295 | `RadioDeviceDataState` | S `receiveRadioDeviceDataState`; C `receiveRadioDeviceDataState` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:616`)] |
| 296 | `RadioPostSilenceEvent` | C `receiveRadioPostSilence` | to client | `LoginOnServer` | - | :cite[(`PacketTypes.java:617`)] |
| 297 | `SyncRadioData` | S `receiveSyncRadioData`; C `receiveSyncRadioData` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:618`)] |
| 300 | `SendItemListNet` | S `receiveSendItemListNet`; C `receiveSendItemListNet` | both ways | `LoginOnServer` | - | :cite[(`PacketTypes.java:621`)] |

## Counts

The tables below add up the entries by folder, direction, capability and anti-cheat name.

| Folder | Entries |
|---|---|
| Top level of `network/packets` | 105 |
| `actions` | 11 |
| `character` | 35 |
| `connection` | 12 |
| `faction` | 10 |
| `foraging` | 3 |
| `hit` | 17 |
| `safehouse` | 10 |
| `service` | 20 |
| `sound` | 6 |
| `vehicle` | 16 |
| `world` | 1 |
| Outside `network/packets` | 4 |
| Inline (no class) | 53 |
| **All** | **303** |

| Direction | Entries |
|---|---|
| none (data only) (handlingType 0) | 8 |
| to server (handlingType 1) | 62 |
| to client (handlingType 2) | 87 |
| both ways (handlingType 3) | 125 |
| to client (loading only) (handlingType 4) | 2 |
| to server; to client (loading only) (handlingType 5) | 2 |
| to client, also while loading (handlingType 6) | 9 |
| both ways, also while loading (handlingType 7) | 8 |
| **All** | **303** |

Entries with handling type 0 are the two chunk helpers `SentChunk` and `ChunkNotReady`, which the client's receive code routes by hand, and the six `PlayerHit...` data classes. :cite[(`GameClient.java:1587-1592`, `network/packets/hit/PlayerHitPacket.java:78`)]

| Capability | Entries |
|---|---|
| `LoginOnServer` | 255 |
| `None` | 6 |
| `InspectPlayerInventory` | 4 |
| `BanUnbanUser` | 3 |
| `ConnectWithDebug` | 3 |
| `AnimalCheats` | 2 |
| `WorkWithUserlog` | 2 |
| `EditItem` | 2 |
| `SeeNetworkUsers` | 2 |
| `AddUserlog` | 2 |
| `AnswerTickets` | 2 |
| `CanModifyBodyStats` | 1 |
| `SandboxOptions` | 1 |
| `CanSeeMessageForAdmin` | 1 |
| `AddItem` | 1 |
| `UseDebugContextMenu` | 1 |
| `CanModifyPlayerStatsInThePlayerStatsUI` | 1 |
| `GetStatistic` | 1 |
| `ClimateManager` | 1 |
| `CanSetupNonPVPZone` | 1 |
| `TeleportToCoordinates` | 1 |
| `CanSeePlayersStats` | 1 |
| `PVPLogTool` | 1 |
| `ModifyNetworkUsers` | 1 |
| `TeleportPlayerToAnotherPlayer` | 1 |
| `TeleportToPlayer` | 1 |
| `RolesRead` | 1 |
| `RolesWrite` | 1 |
| `ReadUserLog` | 1 |
| `CanSetupSafehouses` | 1 |
| `CreateStory` | 1 |
| **All** | **303** |

| Anti-cheat name (uses in lists) | Entries |
|---|---|
| `HitLongDistance` | 6 |
| `HitShortDistance` | 5 |
| `Speed` | 4 |
| `HitWeapon` | 4 |
| `SafeHouseOwner` | 4 |
| `HitVehicle` | 3 |
| `SafeHousePlayer` | 3 |
| `Power` | 2 |
| `NoClip` | 2 |
| `Safety` | 2 |
| `SafeHouseMember` | 2 |
| `VehicleEnter` | 1 |
| `Target` | 1 |

Those names are 13 of the 21 values of the `AntiCheat` enum, and the entries use them 39 times in all. :cite[(`AntiCheat.java:19-39`)] No entry sets `isCached`. :cite[(`PacketSetting.java:29-30`)]

## Network events

Network code fires Lua events, and this section lists the connection events with their arguments and then every event the capture's event index ties to network code.

The first table holds the connection and command events, with what each argument is.

| Event | Arguments | Fires on | When | Code |
|---|---|---|---|---|
| `OnClientCommand` | `module`, `command`, `player`, `args` | Server and single player | A client command arrives, or a server calls `sendClientCommand` with a player | :cite[(`GameServer.java:2343`, `spnetwork/SinglePlayerServer.java:204`, `Lua/LuaManager.java:8884`)] |
| `OnServerCommand` | `module`, `command`, `args` | Client and single player | A server command arrives | :cite[(`GameClient.java:1000`, `spnetwork/SinglePlayerClient.java:149`)] |
| `OnConnected` | none | Client | The join has finished, after the world dictionary | :cite[(`gameStates/ConnectToServerState.java:173`)] |
| `OnConnectFailed` | One text, which is nil in one case | Client | A RakNet failure, a refusal from the server or a kick | :cite[(`GameClient.java:337-364`, `network/packets/service/AccessDeniedPacket.java:49`, `network/packets/KickedPacket.java:78`)] |
| `OnDisconnect` | none | Client | RakNet reports a disconnection notification | :cite[(`GameClient.java:355`)] |
| `OnServerStarted` | none | Server | The server has finished starting | :cite[(`GameServer.java:1581`)] |
| `OnTickEvenPaused` | The tick count as a number | Game client, and the dedicated server's loop | Once per update of the in-game state | :cite[(`gameStates/IngameState.java:1355`, `GameServer.java:860`, `GameServer.java:1068`)] |

The full list follows. It holds every event whose Java trigger is in `zombie/network`, `zombie/spnetwork`, `core/raknet`, `ConnectToServerState` or `ZomboidFileSystem`, plus the events named in the table above and a few others that this series cites, and it leaves out the Steam events. The "Fires on" column is read from the method that holds the trigger, and "not determined" means the method was not one that names a side. Events that Lua code triggers itself are not in it.

| Event | Arguments | Fires on | Code |
|---|---|---|---|
| `AcceptedFactionInvite` | 2 | client | :cite[(`FactionAcceptPacket.java:57`)] |
| `AcceptedMedicalCheck` | 2 | client; also fired from code outside the network classes | :cite[(`AcceptMedicalCheckPacket.java:27`)] |
| `AcceptedSafehouseInvite` | 2 | client | :cite[(`SafehouseAcceptPacket.java:61`)] |
| `AcceptedTrade` | 3 | client | :cite[(`AcceptTradingPacket.java:28`, `RejectTradingPacket.java:27`)] |
| `MngInvReceiveItems` | 1 | client | :cite[(`PlayerInventoryPacket.java:162`)] |
| `OnAdminMessage` | 4 | client | :cite[(`MessageForAdminPacket.java:62`)] |
| `OnAnimalTracks` | 2 | client | :cite[(`AnimalTracksPacket.java:133`)] |
| `OnClientCommand` | 4 | server and single player; also fired from code outside the network classes | :cite[(`GameServer.java:2343`, `SinglePlayerServer.java:204`)] |
| `OnClothingUpdated` | 1 | client; also fired from code outside the network classes | :cite[(`GameClient.java:666`, `GameClient.java:671`, `GameClient.java:674`)] |
| `OnConnected` | 0 | client | :cite[(`ConnectToServerState.java:173`)] |
| `OnConnectFailed` | 1 or 2 | client | :cite[(`UdpEngine.java:391`, `UdpEngine.java:403`, `ConnectToServerState.java:198`)] |
| `OnConnectionStateChanged` | 1 or 2 or 3 | client | :cite[(`RakNetPeerInterface.java:169`, `UdpEngine.java:264`, `ConnectToServerState.java:114`)] |
| `OnContainerUpdate` | 0 or 1 | client, not determined; also fired from code outside the network classes | :cite[(`VehiclePartDoor.java:76`, `VehiclePartItem.java:47`, `AddItemToMapPacket.java:98`)] |
| `OnCoopServerMessage` | 3 | host game | :cite[(`CoopMaster.java:290`)] |
| `OnDesignationZoneUpdatedNetwork` | 0 | client | :cite[(`SyncZonePacket.java:91`)] |
| `OnDisconnect` | 0 | client | :cite[(`GameClient.java:355`)] |
| `OnExitVehicle` | 1 | client; also fired from code outside the network classes | :cite[(`TeleportPacket.java:72`)] |
| `OnFishingActionMPUpdate` | 1 | client, server | :cite[(`FishingActionPacket.java:45`, `FishingActionPacket.java:79`)] |
| `OnForagePool` | 3 | client | :cite[(`ForagePoolPacket.java:76`)] |
| `OnForageRequestZone` | 2 | server | :cite[(`ForageRequestZonePacket.java:56`)] |
| `OnForageSpot` | 2 | server | :cite[(`ForageSpotPacket.java:56`)] |
| `OnGameBoot` | 0 | server; also fired from code outside the network classes | :cite[(`GameServer.java:1544`)] |
| `OnGameTimeLoaded` | 0 | client, server; also fired from code outside the network classes | :cite[(`GameServer.java:825`, `ConnectedPacket.java:93`)] |
| `OnGoogleAuthRequest` | 0 | client | :cite[(`GoogleAuthRequestPacket.java:29`)] |
| `OnItemFound` | 3 | server; also fired from code outside the network classes | :cite[(`ForageItemFoundPacket.java:61`)] |
| `onLoadModDataFromServer` | 1 | client, server | :cite[(`ReceiveModDataPacket.java:155`, `ReceiveModDataPacket.java:160`)] |
| `OnMiniScoreboardUpdate` | 0 | client; also fired from code outside the network classes | :cite[(`GameClient.java:1557`, `ConnectedPacket.java:222`)] |
| `OnModsModified` | 0 | not determined | :cite[(`ZomboidFileSystem.java:1334`)] |
| `OnNetworkUsersReceived` | 0 | client | :cite[(`NetworkUsersPacket.java:99`)] |
| `OnNewGame` | 2 | server; also fired from code outside the network classes | :cite[(`CreatePlayerPacket.java:308`)] |
| `OnObjectAboutToBeRemoved` | 1 | client; also fired from code outside the network classes | :cite[(`RemoveItemFromSquarePacket.java:158`)] |
| `OnObjectAdded` | 1 | client | :cite[(`AddItemToMapPacket.java:101`)] |
| `OnProcessAction` | 3 | server | :cite[(`BuildAction.java:123`)] |
| `OnProcessTransaction` | 6 | server | :cite[(`Transaction.java:145`, `Transaction.java:148`, `Transaction.java:153`)] |
| `OnQRReceived` | 1 | client | :cite[(`GoogleAuthKeyPacket.java:124`)] |
| `OnReceiveGlobalModData` | 2 | client and server | :cite[(`GlobalModDataPacket.java:56`, `GlobalModDataPacket.java:62`)] |
| `OnReceiveItemListNet` | 5 | client, server | :cite[(`GameClient.java:2500`, `GameServer.java:4076`)] |
| `OnReceiveUserlog` | 3 | client | :cite[(`RequestUserLogPacket.java:105`, `RequestUserLogPacket.java:113`)] |
| `OnRolesReceived` | 0 | client | :cite[(`RolesPacket.java:124`)] |
| `OnSafehousesChanged` | 0 | client; also fired from code outside the network classes | :cite[(`SafehouseSyncPacket.java:106`)] |
| `OnScoreboardUpdate` | 4 | client | :cite[(`ScoreboardUpdatePacket.java:89`)] |
| `OnServerCommand` | 3 | client and single player | :cite[(`GameClient.java:1000`, `SinglePlayerClient.java:149`)] |
| `OnServerFinishSaving` | 0 | client | :cite[(`StopPausePacket.java:39`)] |
| `OnServerStarted` | 0 | server | :cite[(`GameServer.java:1581`)] |
| `OnServerStartSaving` | 0 | client | :cite[(`StartPausePacket.java:39`)] |
| `OnServerWorkshopItems` | 1 or 2 or 3 or 4 | client | :cite[(`ConnectToServerState.java:310`, `ConnectToServerState.java:317`, `ConnectToServerState.java:331`)] |
| `OnTick` | 1 | game client; also called by the dedicated server loop | :cite[(`IngameState.java:1662`)] |
| `OnTickEvenPaused` | 1 | game client; also called by the dedicated server loop | :cite[(`IngameState.java:1355`, `GameWindow.java:374`)] |
| `OnTileObjectAdded` | 2 | client | :cite[(`AddObjectToMapPacket.java:69`)] |
| `OnWarUpdate` | 0 | client | :cite[(`WarSyncPacket.java:63`)] |
| `OnWaterAmountChange` | 2 | client and server; also fired from code outside the network classes | :cite[(`ObjectModDataPacket.java:75`)] |
| `OnWeaponHitXp` | 5 | not determined; also fired from code outside the network classes | :cite[(`Hit.java:206`)] |
| `OnWeaponSwingHitPoint` | 2 | server; also fired from code outside the network classes | :cite[(`PlayerHitPacket.java:232`)] |
| `ReceiveFactionInvite` | 3 | client | :cite[(`FactionInvitePacket.java:65`)] |
| `ReceiveSafehouseInvite` | 3 | client | :cite[(`SafehouseInvitePacket.java:38`)] |
| `RefreshCheats` | 0 | client | :cite[(`ExtraInfoPacket.java:231`)] |
| `RequestMedicalCheck` | 2 | client; also fired from code outside the network classes | :cite[(`RequestMedicalCheckPacket.java:27`)] |
| `RequestTrade` | 2 | client | :cite[(`RequestTradingPacket.java:27`)] |
| `SendCustomModData` | 0 | server | :cite[(`GetModDataPacket.java:37`)] |
| `ServerPinged` | 2 | client | :cite[(`GameClient.java:803`)] |
| `SyncFaction` | 1 | client | :cite[(`FactionChangeTitlePacket.java:69`, `FactionDisbandPacket.java:37`, `FactionStatsPacket.java:84`)] |
| `TradingUIAddItem` | 3 | client | :cite[(`TradingUIAddItemPacket.java:94`)] |
| `TradingUIRemoveItem` | 3 | client | :cite[(`TradingUIRemoveItemPacket.java:52`)] |
| `TradingUIUpdateState` | 3 | client | :cite[(`TradingUIUpdateStatePacket.java:54`)] |
| `ViewBannedIPs` | 1 | client | :cite[(`GameClient.java:2420`)] |
| `ViewTickets` | 1 | client and server | :cite[(`ViewTicketsPacket.java:66`)] |

## Network server options

These are the server options that touch connecting, packets, voice, commands and anti-cheat, with the default and range read from the code that declares them.

The defaults here are the ones in `ServerOptions.java`, and a server's own settings file may differ. A 4-valued choice is read as 1 ban, 2 kick, 3 log and 4 disabled. :cite[(`ServerOptions.java:203-212`, `AntiCheat.java:142-149`)]

| Option | Type | Default | Range | What the code uses it for | Code |
|---|---|---|---|---|---|
| `DefaultPort` | Integer | 16261 | 0 to 65535 | The game port | :cite[(`ServerOptions.java:70`, `GameClient.java:150`)] |
| `UDPPort` | Integer | 16262 | 0 to 65535 | The UDP port passed to the Steam server setup along with the game port | :cite[(`ServerOptions.java:71`, `GameServer.java:679-681`)] |
| `Open` | Boolean | true | - | When true, a new name creates an account | :cite[(`ServerOptions.java:49`, `ServerWorldDatabase.java:1033-1150`)] |
| `Password` | Text | (empty) | - | The server password, given to RakNet as the connection password | :cite[(`ServerOptions.java:124`, `core/raknet/UdpEngine.java:72`)] |
| `MaxPlayers` | Integer | 32 | 1 to 254 | The slot limit (the code takes the smaller of this and 254) | :cite[(`ServerOptions.java:80`, `ServerOptions.java:522-523`)] |
| `MaxAccountsPerUser` | Integer | 0 | 0 to 2147483647 | The limit on accounts per Steam user, checked only when Steam mode is on | :cite[(`ServerOptions.java:125`, `ServerWorldDatabase.java:1210-1226`)] |
| `AllowCoop` | Boolean | true | - | Whether a second local player may join from one client | :cite[(`ServerOptions.java:126`, `network/packets/connection/ConnectCoopPacket.java:72`)] |
| `PingLimit` | Integer | 0 | 0 to 2147483647 | The ping above which a connection is kicked (0 is off) | :cite[(`ServerOptions.java:81`, `network/statistics/PingManager.java:31-34`)] |
| `DenyLoginOnOverloadedServer` | Boolean | true | - | Refuses new logins while the server is dropping packets, but only in the hosted Steam game branch of the login code. A dedicated server does not read it, and while overloaded it logs the problem and drops vehicle physics updates | :cite[(`ServerOptions.java:76`, `network/packets/connection/LoginPacket.java:85-117`, `GameServer.java:964-985`)] |
| `LoginQueueEnabled` | Boolean | false | - | Turns the login queue on | :cite[(`ServerOptions.java:143`)] |
| `LoginQueueConnectTimeout` | Integer | 60 | 20 to 1200 | Seconds a queued player has to finish connecting | :cite[(`ServerOptions.java:144`)] |
| `DoLuaChecksum` | Boolean | true | - | Compares the client's Lua, scripts and animations with the server's | :cite[(`ServerOptions.java:75`, `iso/IsoWorld.java:1929-1960`)] |
| `Mods` | Text | (empty) | - | Mod ids separated by semicolons | :cite[(`ServerOptions.java:73`, `GameServer.java:667-676`)] |
| `WorkshopItems` | Text | (empty) | - | Workshop item numbers separated by semicolons | :cite[(`ServerOptions.java:134`, `GameServer.java:693-703`)] |
| `SteamVAC` | Boolean | true | - | Chooses the Steam server mode, 3 when on and 2 when off | :cite[(`ServerOptions.java:136`, `GameServer.java:679-680`)] |
| `UPnP` | Boolean | true | - | When on, the server tries to configure the router at start and logs that it may hang there | :cite[(`ServerOptions.java:137`, `GameServer.java:752-758`)] |
| `VoiceEnable` | Boolean | true | - | Passed to the voice server at start | :cite[(`ServerOptions.java:138`, `core/raknet/VoiceManager.java:958-967`)] |
| `VoiceMinDistance` | Number | 10.0 | 0.0 to 100000.0 | Passed to the voice server at start | :cite[(`ServerOptions.java:139`, `core/raknet/VoiceManager.java:958-967`)] |
| `VoiceMaxDistance` | Number | 100.0 | 0.0 to 100000.0 | Passed to the voice server at start | :cite[(`ServerOptions.java:140`, `core/raknet/VoiceManager.java:958-967`)] |
| `Voice3D` | Boolean | true | - | Passed to the voice server at start | :cite[(`ServerOptions.java:141`, `core/raknet/VoiceManager.java:958-967`)] |
| `SpeedLimit` | Number | 70.0 | 10.0 to 150.0 | Read by the client's vehicle code and by the Speed anti-cheat | :cite[(`ServerOptions.java:142`, `core/physics/CarController.java:681`)] |
| `SwitchZombiesOwnershipEachUpdate` | Boolean | false | - | Rotates zombie owners among connections | :cite[(`ServerOptions.java:60-62`, `popman/NetworkZombieManager.java:69-88`)] |
| `ClientCommandFilter` | Text | `-vehicle.*;+vehicle.damageWindow;+vehicle.fixPart;+vehicle.installPart;+vehicle.uninstallPart` | - | Rules that decide which commands are written to the `cmd` log | :cite[(`ServerOptions.java:165-167`, `GameServer.java:2271-2290`)] |
| `ClientActionLogs` | Text | `ISEnterVehicle;ISExitVehicle;ISTakeEngineParts;` | - | The timed actions that vanilla logs | :cite[(`ServerOptions.java:168`)] |
| `AllowNonAsciiUsername` | Boolean | false | - | Allows user names with characters outside ASCII | :cite[(`ServerOptions.java:176`, `ServerWorldDatabase.java:1036`)] |
| `MaxPacketsPerSecond` | Integer | 300 | 100 to 1000 | The per-connection, per-type packet limit | :cite[(`ServerOptions.java:216`, `network/PacketsCache.java:83-122`)] |
| `RCONPort` | Integer | 27015 | 0 to 65535 | The remote console port, used only when a password is set | :cite[(`ServerOptions.java:116`, `GameServer.java:870-875`)] |
| `RCONPassword` | Text | (empty) | - | The remote console password | :cite[(`ServerOptions.java:117`, `GameServer.java:870-875`)] |
| `MultiplayerStatisticsPeriod` | Integer | 1 | 0 to 10 | Seconds between network statistics samples | :cite[(`ServerOptions.java:213`, `network/statistics/StatisticManager.java:148`)] |
| `SteamScoreboard` | Boolean | false | - | Shows Steam names in the scoreboard | :cite[(`ServerOptions.java:135`, `network/packets/service/ScoreboardUpdatePacket.java:96`)] |
| `server_browser_announced_ip` | Text | (empty) | - | The address announced to the public server browser | :cite[(`ServerOptions.java:145`, `util/PublicServerUtil.java:179-181`)] |
| `AntiCheatSafety` | Choice of 4 | 2 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:203`, `AntiCheat.java:104-153`)] |
| `AntiCheatSpeed` | Choice of 4 | 2 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:204`, `AntiCheat.java:104-153`)] |
| `AntiCheatNoClip` | Choice of 4 | 4 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:205`, `AntiCheat.java:104-153`)] |
| `AntiCheatHit` | Choice of 4 | 2 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:206`, `AntiCheat.java:104-153`)] |
| `AntiCheatPacketException` | Choice of 4 | 4 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:207`, `AntiCheat.java:104-153`)] |
| `AntiCheatPermission` | Choice of 4 | 2 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:208`, `AntiCheat.java:104-153`)] |
| `AntiCheatXP` | Choice of 4 | 2 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:209`, `AntiCheat.java:104-153`)] |
| `AntiCheatSafeHouse` | Choice of 4 | 2 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:210`, `AntiCheat.java:104-153`)] |
| `AntiCheatPlayer` | Choice of 4 | 2 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:211`, `AntiCheat.java:104-153`)] |
| `AntiCheatChecksum` | Choice of 4 | 2 | 1 to 4 | Policy for one anti-cheat group: 1 ban, 2 kick, 3 log, 4 disabled | :cite[(`ServerOptions.java:212`, `AntiCheat.java:104-153`)] |

The `ClientCommandFilter` default is `-vehicle.*;+vehicle.damageWindow;+vehicle.fixPart;+vehicle.installPart;+vehicle.uninstallPart`, and the `ClientActionLogs` default is `ISEnterVehicle;ISExitVehicle;ISTakeEngineParts;`. :cite[(`ServerOptions.java:165-168`)]

## Lua functions that reach the network

`GameClient` and `GameServer` have no members that Lua can call, so a mod reaches the network through global functions.

The capture's API index has no member of either class marked as callable from Lua, and neither class is in its list of exposed classes. :cite[(`api/api.jsonl`, `api/lua_exposed.jsonl`)] A global named `getGameClient` returns the client instance, but the class is not exposed and the vanilla Lua never calls it. :cite[(`Lua/LuaManager.java:9042-9045`)]

The table lists the global functions that send, receive or describe network traffic. "Client" means the function acts only when the game is a multiplayer client, and "server" only when it is a server.

| Function | Works on | What it does | Code |
|---|---|---|---|
| `isClient()` | Any | True on a multiplayer client | :cite[(`Lua/LuaManager.java:4435-4437`)] |
| `isServer()` | Any | True on a server, and false in single player | :cite[(`Lua/LuaManager.java:4419-4421`)] |
| `isMultiplayer()` | Any | True on a client or a server | :cite[(`Lua/LuaManager.java:4443-4445`)] |
| `isServerSoftReset()` | Any | True on a server that is doing a soft reset | :cite[(`Lua/LuaManager.java:4427-4429`)] |
| `isCoopHost()` | Client | True when the client's connection is the host of a hosted game | :cite[(`Lua/LuaManager.java:9099-9101`)] |
| `sendClientCommand(...)` and `sendClientCommandV(...)` | Client | Send a command to the server, in three forms | :cite[(`Lua/LuaManager.java:8866-8897`, `Lua/LuaManager.java:8932-8936`)] |
| `sendServerCommand(...)` and `sendServerCommandV(...)` | Server | Send a command to every client or to one player | :cite[(`Lua/LuaManager.java:8902-8926`)] |
| `getOnlinePlayers()` | Any | The server's players on a server, the client's players on a client, and an empty list otherwise | :cite[(`Lua/LuaManager.java:4483-4491`)] |
| `getPlayerByOnlineID(id)` | Any | Looks the player up in the server's or the client's id map | :cite[(`Lua/LuaManager.java:3966-3972`)] |
| `getConnectedPlayers()` | Client | The client's list of connected players | :cite[(`Lua/LuaManager.java:9083-9085`)] |
| `getOnlineUsername()` | Client | The display name of the local player | :cite[(`Lua/LuaManager.java:8950-8952`)] |
| `getServerName()`, `getServerIP()`, `getServerPort()` | Any | The server's values on a server, the connected server's on a client, and an empty text otherwise | :cite[(`Lua/LuaManager.java:4125-4153`)] |
| `getServerOptions()` | Any | The `ServerOptions` instance, whose class is exposed to Lua | :cite[(`Lua/LuaManager.java:4117-4119`)] |
| `getServerFPS()` | Any | Always 10 | :cite[(`Lua/LuaManager.java:12090-12094`)] |
| `sendPing()` | Client | Sends a ping with the current time | :cite[(`Lua/LuaManager.java:3053-3060`)] |
| `serverConnect(...)` and `serverConnectCoop(...)` | Menu | Start a connection through `ConnectionManager` | :cite[(`Lua/LuaManager.java:3024-3047`)] |
| `canConnect()` and `getReconnectCountdownTimer()` | Client | Ask `GameClient` whether a reconnect is allowed and how long remains | :cite[(`Lua/LuaManager.java:3183-3195`)] |
| `SendCommandToServer(text)` | Client | Passes a command string to `GameClient` | :cite[(`Lua/LuaManager.java:8974-8977`)] |
| `getAccessLevel()` and `haveAccess(name)` | Client | Read the role of the client's connection, and both are marked deprecated | :cite[(`Lua/LuaManager.java:4457-4475`)] |
| `getServerModData()` | Client | Sends the `GetModData` packet | :cite[(`Lua/LuaManager.java:8829-8831`)] |
| `convertToPZNetTable(table)` | Any | Copies a table into the richer table kind that timed actions use | :cite[(`Lua/LuaManager.java:2969-2980`)] |
| `sendItemListNet(...)` | Any | Hands an item list to the mod utility that sends it | :cite[(`Lua/LuaManager.java:2961-2963`)] |
| `addVariableToSyncList(key)` | Any | Adds an animation variable name to the list that the variable sync packet carries | :cite[(`Lua/LuaManager.java:8942-8945`)] |
| `createItemTransaction`, `isItemTransactionDone`, `isItemTransactionRejected`, `removeItemTransaction`, `getItemTransactionDuration` | Client | The item transaction calls | :cite[(`Lua/LuaManager.java:12100-12180`)] |
| `isActionDone`, `isActionRejected`, `getActionDuration`, `removeAction` | Client | Ask about a timed action the server is running | :cite[(`Lua/LuaManager.java:12186-12220`)] |
| `emulateAnimEvent`, `emulateAnimEventOnce` | Server | Fire an animation event for a server-run action on a timer | :cite[(`Lua/LuaManager.java:12222-12240`)] |
| `sendAddItemToContainer`, `sendRemoveItemFromContainer`, `sendReplaceItemInContainer`, `syncItemFields`, `syncItemModData` | See the timed-actions page | Send container and item changes | :cite[(`Lua/LuaManager.java:12326-12435`)] |

The functions that send one kind of game state, such as `sendClothing`, `sendDamage`, `sendEquip`, `sendVisual`, the `sendFaction...` and `sendSafehouse...` families and `syncBodyPart`, are not described here. The API index lists them as globals. :cite[(`api/lua_globals.jsonl`)]

## Vanilla's command modules

Vanilla's own Lua handles client commands in a few files, and the largest is `ClientCommands.lua`, which holds 17 modules and 81 commands.

The table lists the modules of `ClientCommands.lua`, counted by a script that read the `Commands.<module>.<command> = function` lines. The file ends with a dispatcher that runs `Commands[module][command]` for any module and command it holds. :cite[(`media/lua/server/ClientCommands.lua:1346-1357`)]

| Module | Commands | Names | Code |
|---|---|---|---|
| `object` | 20 | `addFireOnSquare`, `addSmokeOnSquare`, `addExplosionOnSquare`, `rotate`, `openCloseCurtain`, `plumbObject`, `removeBush`, `removeWorldItem`, `removeWorldItemsInArea`, `shovelGround`, `OnDestroyIsoThumpable`, `triggerRemote`, `emptyTrash`, `setWaterAmount`, `addFluidDebug`, `clearContainerExplore`, `updateOverlaySprite`, `addWaterContainer`, `removeFluidContainer`, `setBombTimer` | :cite[(`media/lua/server/ClientCommands.lua:8-423`)] |
| `animal` | 32 | The animal commands, from `add` to `rename` | :cite[(`media/lua/server/ClientCommands.lua:802-1102`)] |
| `player` | 5 | `onHealthCheat`, `onHealthCheatCurrentPlayer`, `setWeight`, `onVehicleSleep`, `onDropHeavyItem` | :cite[(`media/lua/server/ClientCommands.lua:490-663`)] |
| `debugAction` | 5 | `getBuildingKey`, `getDoorKey`, `mannequinCreateItem`, `spawnStashMap`, `reinitStashes` | :cite[(`media/lua/server/ClientCommands.lua:690-793`)] |
| `feedingThrough` | 4 | `addWaterDebug`, `removeWaterDebug`, `addFoodDebug`, `removeFoodDebug` | :cite[(`media/lua/server/ClientCommands.lua:1160-1243`)] |
| `hutch` | 2 | `dirt`, `nestBoxDirt` | :cite[(`media/lua/server/ClientCommands.lua:1125-1135`)] |
| `map` | 2 | `setKnownInSquares`, `forget` | :cite[(`media/lua/server/ClientCommands.lua:1287-1293`)] |
| `fishing` | 2 | `brokeRodLine`, `missFish` | :cite[(`media/lua/server/ClientCommands.lua:1297-1319`)] |
| `fireplace`, `bbq`, `deadBody`, `erosion`, `event`, `stove`, `item`, `debugIsoRegions`, `debugScenario` | 1 each | One command each | :cite[(`media/lua/server/ClientCommands.lua:431-445`, `media/lua/server/ClientCommands.lua:454-469`, `media/lua/server/ClientCommands.lua:477-478`, `media/lua/server/ClientCommands.lua:668-677`, `media/lua/server/ClientCommands.lua:1145-1146`, `media/lua/server/ClientCommands.lua:1271-1273`, `media/lua/server/ClientCommands.lua:1328-1338`)] |

Other vanilla handlers listen to the same event on their own.

| Module | Commands | Where | Code |
|---|---|---|---|
| `vehicle` | 33 | `VehicleCommands.lua`, which starts with `if isClient() then return end` | :cite[(`media/lua/server/Vehicles/VehicleCommands.lua:1`, `media/lua/server/Vehicles/VehicleCommands.lua:401-413`)] |
| `forageData` | Any function of the `forageServer` table | `forageServer.lua`, which answers by sending the same command to every client | :cite[(`media/lua/server/Foraging/forageServer.lua:56-68`)] |
| `camping` | 1 (`removeTent`) | `camping_tent.lua` | :cite[(`media/lua/server/Camping/camping_tent.lua:183-199`)] |
| `SFarmingSystem` | Not counted | The global-object system code | :cite[(`media/lua/server/Map/SGlobalObjectSystem.lua:249-257`)] |
| `ISLogSystem` | Any function of the `ISLogSystem` table | `ISLogSystem.lua` in `shared`, added only on a server | :cite[(`media/lua/shared/Logs/ISLogSystem.lua:85-94`)] |

On the client side, `ServerCommands.lua` handles 19 commands in 12 modules (`fishing` 4, `recipe` 4, `hutch` 2, `animalCorpse` 2, and one each for `erosion`, `character`, `literature`, `square`, `animal`, `ui` and `forage`, with `player` empty), and it starts with `if not isClient() then return end`. :cite[(`media/lua/client/ServerCommands.lua:1`, `media/lua/client/ServerCommands.lua:207-218`)]

A text search of the vanilla client Lua finds 74 calls of `sendClientCommand`, and the modules that the calls name as text include `animal`, `debugAction`, `debugIsoRegions`, `debugScenario`, `feedingThrough`, `fishing`, `hutch`, `item`, `map`, `object`, `player` and `vehicle`. Some calls build the module or command from a variable, so the list may be incomplete.

:::callout[How we know]{kind=proof}
The packet tables, counts and option defaults come from a script over `PacketTypes.java`, the `@PacketSetting` annotations and `ServerOptions.java`, run once and deleted, and the event table comes from the capture's `api/events.jsonl` with each trigger's method read from the source. The Lua function table and the vanilla command counts were read from `LuaManager.java` and the vanilla Lua files, with the counts made by a text search. Not verified: how the six `PlayerHit...` anti-cheat lists run, what the Steam-mode connection path does, the use of the entry `SFarmingSystem` commands, and the "not determined" event sides. No game or server was run.
:::
