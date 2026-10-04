---
slug: server-roles-and-capabilities
title: 'Roles and capabilities (Build 42.21)'
game: pz
version: build-42
section: server
category: roles-and-access
difficulty: beginner
tags:
  - server
  - admin
  - roles
  - generated
excerpt: 'The 7 built-in roles of Build 42.21, what each may do, and all 98 capabilities with the commands that need them.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - where-each-capability-is-checked
  - admin-commands
---
# Roles and capabilities

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Outcast, in Build 42.21 what a player may do on your server is a list of capabilities, and a role is a named set of them. The game ships 7 built-in roles. You give a player a role with `/setaccesslevel`, and admins can add their own roles in the game's Roles window.

## How roles work

- **The built-in roles cannot be edited.** Each is marked read-only once it is built, and adding or removing a capability on a read-only role does nothing. A role you add yourself starts with one capability, `LoginOnServer`, and you choose the rest.
- **Where they are kept.** The roles live in the server's database. At start-up the server builds the built-in roles, then loads the roles you added.
- **Default roles.** The server keeps a default role for each kind of account. Out of the box: `defaultForBanned` is `banned`, `defaultForNewUser` is `user`, `defaultForUser` is `user`, `defaultForPriorityUser` is `priority`, `defaultForObserver` is `observer`, `defaultForGM` is `gm`, `defaultForOverseer` is `gm`, `defaultForModerator` is `moderator`, `defaultForAdmin` is `admin`.
- **Single player in debug mode** grants every capability; a dedicated server never does that.

> **Proof:** Code. zombie.characters.Roles#addStatic (the built-in roles, their capabilities, descriptions and defaults), #init (built-in roles first, then the database), #addRole (a new role gets LoginOnServer); zombie.characters.Role#addCapability (does nothing on a read-only role), #hasCapability and #isUsingDebugMode. Build 42.21 (revision 4a0e9546ec).

## The built-in roles

| Role | The game's description | Capabilities | Default for |
|---|---|---|---|
| `banned` | "Can't login on server." | 0 | `defaultForBanned` |
| `user` | "Have no capabilities." | 1 | `defaultForNewUser`, `defaultForUser` |
| `priority` | "Have login priority" | 3 | `defaultForPriorityUser` |
| `observer` | "Can use teleport, god mode, go inside safehouse. But he can't add xp, items and make another change." | 22 | `defaultForObserver` |
| `gm` | "Can use teleport, god mode, add xp, items and make another change." | 34 | `defaultForGM`, `defaultForOverseer` |
| `moderator` | "Can make all except edit roles, reload lua files, change server options." | all except `UseMovablesCheat`, `SaveWorld`, `QuitWorld`, `ChangeAndReloadServerOptions`, `ReloadLuaFiles`, `BypassLuaChecksum`, `RolesWrite`, `ConnectWithDebug` | `defaultForModerator` |
| `admin` | "Have all capabilities." | all | `defaultForAdmin` |

The help text of `/setaccesslevel` still names an "Overseer" level, but no built-in role is called that in 42.21: the default for overseers (`defaultForOverseer`) is `gm`.

## Which role has which capability

Every capability in 42.21, the game's description of it, the built-in roles that hold it (Y), and the commands that need it. [Where each capability is checked](/pz/build-42/server/roles-and-access/where-each-capability-is-checked) lists the code that reads each one.

| Capability | banned | user | priority | observer | gm | moderator | admin | Commands | The game's description |
|---|---|---|---|---|---|---|---|---|---|
| `None` |  |  |  |  |  | Y | Y |  |  |
| `LoginOnServer` |  | Y | Y | Y | Y | Y | Y | `/help`, `/clear`, `/list` | "Allows player to login to server." |
| `PriorityLogin` |  |  | Y | Y | Y | Y | Y |  | "Player get preferential treatment when logging into a full server. The player can also create an unlimited number of accounts." |
| `CantBeKickedIfTooLaggy` |  |  | Y | Y | Y | Y | Y |  | "Player won't be kicked for lag issues." |
| `ToggleGodModHimself` |  |  |  | Y | Y | Y | Y | `/godmod` | "Allows player to switch god mode on and off. Use /godmod or /godmode console command." |
| `ToggleInvisibleHimself` |  |  |  | Y | Y | Y | Y | `/invisible` | "Allows player to toggle their visibility to others. Use /invisible console command." |
| `ToggleInvincibleHimself` |  |  |  |  |  | Y | Y |  | "Player can make themselves invulnerable to damage. Use option in Admin Powers window." |
| `ToggleNoclipHimself` |  |  |  | Y | Y | Y | Y | `/noclip` | "Allows player to walk through walls. Option can be enabled by /noclip console command." |
| `SeePlayersConnected` |  |  |  | Y | Y | Y | Y | `/connections`, `/players` | "Allows player to a list of all currently connected players and active connections. Use /players and / connections console commands." |
| `TeleportToPlayer` |  |  |  | Y | Y | Y | Y | `/teleport` | "Allows player to instantly teleport to the location of another player. Use context menu option in MiniScoreboard UI or button in Player List window." |
| `TeleportToCoordinates` |  |  |  | Y | Y | Y | Y | `/teleportto` | "Allows player to teleport to any specific coordinates on the map. Use context menu option in MiniScoreboard UI or button in Player List window." |
| `SeePublicServerOptions` |  |  |  | Y | Y | Y | Y | `/showoptions` | "Player can view the server options in Admin Panel." |
| `CanOpenLockedDoors` |  |  |  | Y | Y | Y | Y |  | "Player can open normally inaccessible doors." |
| `CanGoInsideSafehouses` |  |  |  | Y | Y | Y | Y |  | "Player have access to safehouses that are typically locked." |
| `CanAlwaysJoinServer` |  |  |  | Y | Y | Y | Y |  | "Player can always join a server, even if it's full." |
| `SeesInvisiblePlayers` |  |  |  | Y | Y | Y | Y |  | "Player can see other players who are invisible." |
| `CanSeeMessageForAdmin` |  |  |  | Y | Y | Y | Y |  | "Allows player to receive messages sent by players for administrators." |
| `PVPLogTool` |  |  |  | Y | Y | Y | Y |  | "Allows player to use PVPLogTool in the Admin panel." |
| `CanSeePlayersStats` |  |  |  | Y | Y | Y | Y |  | "Player can see the statistics and information of other players. Use Player Stats button in Admin Panel." |
| `CantBeKickedByAnticheat` |  |  |  | Y | Y | Y | Y |  | "Player will not be kicked by the anti-cheat system." |
| `CantBeKickedByUser` |  |  |  |  |  | Y | Y |  | "Player can't be kicked by other users." |
| `CantBeBannedByAnticheat` |  |  |  | Y | Y | Y | Y |  | "Player will not be banned by the anti-cheat system." |
| `CantBeBannedByUser` |  |  |  |  |  | Y | Y |  | "Player can't be banned by other users." |
| `SeeWorldMap` |  |  |  | Y | Y | Y | Y |  | "Allows player to see other players on the world map." |
| `CanMedicalCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use MedicalCheats, which are enabled in the AdminPowers window." |
| `UIManagerProcessCommands` |  |  |  | Y | Y | Y | Y |  | "Allows player to execute console commands." |
| `UseDebugContextMenu` |  |  |  | Y | Y | Y | Y |  |  |
| `ToggleGodModEveryone` |  |  |  |  | Y | Y | Y | `/godmodplayer` | "Player can toggle god mode for all players on the server." |
| `ToggleInvisibleEveryone` |  |  |  |  | Y | Y | Y | `/invisibleplayer` | "Player can make other players invisible. Use /invisible command or context menu in MiniScoreboard window." |
| `ToggleNoclipEveryone` |  |  |  |  | Y | Y | Y |  | "Player can enable noclip functionality for everyone on the server. Use /noclip console command." |
| `TeleportPlayerToAnotherPlayer` |  |  |  |  | Y | Y | Y | `/teleport`, `/teleportplayer` | "Allows the player to teleport any player to any location. Use context menu option in users list UI or button in players list." |
| `MakeEventsAlarmGunshot` |  |  |  |  | Y | Y | Y | `/alarm`, `/chopper`, `/gunshot`, `/lightning` | "Allows the player to trigger in-game sound events. Use commands /alarm, /gunshot, /thunder, and /chopper." |
| `StartStopRain` |  |  |  |  | Y | Y | Y | `/startrain`, `/stoprain`, `/thunder`, `/stopweather`, `/startstorm` | "Allows the player to start or stop raining events. Use command /startrain, /startstorm, /stoprain, /stopweather, and /thunder." |
| `AddItem` |  |  |  |  | Y | Y | Y | `/additem`, `/addkey` | "Allows the player to add an item to their inventory or other players inventory. Use command /additem and /addkey or items list UI." |
| `AddXP` |  |  |  |  | Y | Y | Y | `/addxp` | "Allows the player to add experience points to themselves or other players. Use command /addxp." |
| `SeeNetworkUsers` |  |  |  |  | Y | Y | Y |  | "Player can see all connected network users information" |
| `UseLootZed` |  |  |  |  | Y | Y | Y |  |  |
| `UseLootLog` |  |  |  |  | Y | Y | Y |  |  |
| `CreateHorde` |  |  |  |  |  | Y | Y | `/createhorde`, `/createhorde2` | "Player can spawn hordes of zombies at a desired location. Use /createhorde and /createhorde2 console commands." |
| `CreateStory` |  |  |  |  | Y | Y | Y |  | "Player can create custom storylines or scenarios within the game. Use Randomized Zone Story and Randomized Road Story context menu options." |
| `KickUser` |  |  |  |  |  | Y | Y | `/kick` | "Player can kick other players from the server. Use /kick or /kickuser console commands." |
| `DisplayServerMessage` |  |  |  |  |  | Y | Y | `/servermsg` | "Player can broadcast messages to all players on the server. Use /servermsg console command." |
| `CanModifyPlayerStatsInThePlayerStatsUI` |  |  |  |  |  | Y | Y |  | "Player can modify player stats. Use Player Stats button in the Admin Panel." |
| `CanModifyBodyStats` |  |  |  |  |  | Y | Y |  | "Player can modify player body stats. Use Body section from General Debuggers in the Debug Menu panel." |
| `AdminChat` |  |  |  |  |  | Y | Y |  | "Player have access to a separate chat channel for administrators." |
| `HideFromSteamUserList` |  |  |  |  |  | Y | Y |  | "Player can make themselves invisible from other players in the Users List window on Steam servers." |
| `ToggleWriteRoleNameAbove` |  |  |  |  |  | Y | Y |  | "Player role will be displaying above him." |
| `BanUnbanUser` |  |  |  |  |  | Y | Y | `/banuser`, `/banid`, `/banip`, `/unbanuser`, `/unbanid`, `/unbanip`, `/voiceban` | "Player have the ability to ban and unban users from the server. Use commands /banuser, /unbanuser, /banid and /unbanid." |
| `EditMapSymbols` |  |  |  |  |  | Y | Y | `/removemapsymbolsforuser` | "Player have the ability to modify shared map symbols. Use commands /removemapsymbolsforuser." |
| `ManipulateWhitelist` |  |  |  |  |  | Y | Y | `/addalltowhitelist`, `/addusertowhitelist`, `/removeuserfromwhitelist` | "Allows player to add or remove players from the whitelist. Use commands /setpassword, /adduser, /addusertowhitelist, /addalltowhitelist and /removeuserfromwhitelist." |
| `ChangeAccessLevel` |  |  |  |  |  | Y | Y | `/grantadmin`, `/removeadmin`, `/setaccesslevel` | "Player can change the access level of other players on the server. Use command /setaccesslevel." |
| `CanSetupSafehouses` |  |  |  |  |  | Y | Y | `/releasesafehouse`, `/addtosafehouse`, `/kickfromsafehouse` | "Player can create and configure safe houses within the game world. Use context menu and commands /addtosafehouse, /kickfromsafehouse and /releasesafehouse." |
| `CanSetupNonPVPZone` |  |  |  |  |  | Y | Y |  | "Player can establish areas on the map where PvP combat is disabled. Use Non PVP Zone button in the Admin Panel." |
| `FactionCheat` |  |  |  |  |  | Y | Y |  | "Allows player to manage factions. Use button in the Admin Panel." |
| `AnswerTickets` |  |  |  |  |  | Y | Y |  | "Allows player to see and manage the list of in-game tickets raised by other players. Use See Tickets button in the Admin panel." |
| `RolesRead` |  |  |  |  |  | Y | Y |  | "Player can view the roles and permissions assigned to other players on the server. Use Roles List button in the Admin Panel." |
| `ToggleUnlimitedEndurance` |  |  |  |  |  | Y | Y |  | "Allows player to use UnlimitedEnduranceCheats, which are enabled in the AdminPowers window." |
| `ToggleKnowAllRecipes` |  |  |  |  |  | Y | Y |  |  |
| `ToggleUnlimitedAmmo` |  |  |  |  |  | Y | Y |  |  |
| `ToggleUnlimitedCarry` |  |  |  |  |  | Y | Y |  | "Allows player to use UnlimitedCarryCheats, which are enabled in the AdminPowers window." |
| `UseMovablesCheat` |  |  |  |  |  |  | Y |  | "Allows player to use MovablesCheats, which are enabled in the AdminPowers window." |
| `UseFastMoveCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use FastMoveCheat, which is enabled in the AdminPowers window." |
| `UseBuildCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use BuildCheats, which are enabled in the AdminPowers window." |
| `UseFarmingCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use FarmingCheats, which are enabled in the AdminPowers window." |
| `UseFishingCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use FishingCheats, which are enabled in the AdminPowers window." |
| `UseHealthCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use HealthCheats, which are enabled in the AdminPowers window." |
| `UseMechanicsCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use MechanicsCheats, which are enabled in the AdminPowers window." |
| `UseTimedActionInstantCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use TimedActionInstantCheats, which are enabled in the AdminPowers window." |
| `UseZombieDontAttackCheat` |  |  |  |  |  | Y | Y |  | "Allows player to use UseZombieDontAttackCheat, which are enabled in the AdminPowers window." |
| `GeneralCheats` |  |  |  |  |  | Y | Y |  | "Allows player to use /roll and /card console commands. Also allows to remove vehicles." |
| `ModifyNetworkUsers` |  |  |  |  |  | Y | Y | `/adduser`, `/addsteamid`, `/removesteamid`, `/setpassword` | "Allows player to add, kick, ban, unban users using console commands." |
| `EditItem` |  |  |  |  |  | Y | Y | `/removeitem` | "Player can change properties or attributes of items in the game world. Use inventory context menu option." |
| `GetSteamScoreboard` |  |  |  |  |  | Y | Y |  | "Allows player to use mini scoreboard in Admin panel." |
| `GetStatistic` |  |  |  |  |  | Y | Y | `/stats` | "Allows player to access detailed server, connections and packets statistics. Use Packet Counts and Show Statistics buttons in Admin panel." |
| `SandboxOptions` |  |  |  |  |  | Y | Y |  | "Allows player to change sandbox options. Use Sandbox Options button in Admin panel." |
| `ReadUserLog` |  |  |  |  |  | Y | Y |  | "Player can view the logs of other players on the server. Use context menu in Users List window." |
| `AddUserlog` |  |  |  |  |  | Y | Y |  | "Player can add their own entries to logs of other players on the server. Use context menu in Users List window." |
| `WorkWithUserlog` |  |  |  |  |  | Y | Y |  | "Player can remove entries from logs of other players on the server. Use context menu in Users List window." |
| `ClimateManager` |  |  |  |  |  | Y | Y |  | "Player can control and alter environmental factors like the weather on the server. Use Climate Control button in Admin Panel." |
| `InspectPlayerInventory` |  |  |  |  |  | Y | Y |  | "Player can view the inventory contents of any other player on the server." |
| `AnimalCheats` |  |  |  |  |  | Y | Y | `/remove` | "Allows player to use AnimalCheats, which are enabled in the AdminPowers window." |
| `DebugConsole` |  |  |  |  |  | Y | Y | `/log` | "Player have access to a console command interface for debugging and testing purposes. Use commands /log and /clear." |
| `PopmanManage` |  |  |  |  |  | Y | Y |  | "Allows player to spawn and remove zombies. Use Zombie Population button in Debug panel." |
| `ManipulateVehicle` |  |  |  |  |  | Y | Y | `/addvehicle` | "Allows player to spawn vehicles in the game world. Use /addvehicle console command." |
| `ManipulateMods` |  |  |  |  |  | Y | Y | `/checkModsNeedUpdate` | "Player can update installed mods within the game. Use /checkModsNeedUpdate command." |
| `ManipulateZombie` |  |  |  |  |  | Y | Y | `/removezombies` | "Allows player to remove zombies by console command or set them don't attack player. Use option in Admin Powers window." |
| `CanSeeAll` |  |  |  |  |  | Y | Y |  | "Allows player to see other players regardless of obstacles. Use option in Admin Powers window." |
| `CanHearAll` |  |  |  |  |  | Y | Y |  | "Player can hear all voice conversations occurring on the server. Use option in Admin Powers window." |
| `UseBrushToolManager` |  |  |  |  |  | Y | Y |  | "Allows player to use BrushToolManager, which is enabled in the AdminPowers window, and can be activated by button in map context menu." |
| `IgnoreChatSlowMode` |  |  |  |  |  | Y | Y |  |  |
| `EmptyLinesInChat` |  |  |  |  |  | Y | Y |  |  |
| `SaveWorld` |  |  |  |  |  |  | Y | `/save`, `/worldgen` | "Player can save the current state of the game world, preserving changes and progress." |
| `QuitWorld` |  |  |  |  |  |  | Y | `/quit` | "Allows player to immediately close server. Use /quit console command." |
| `ChangeAndReloadServerOptions` |  |  |  |  |  |  | Y | `/reloadoptions`, `/changeoption` | "Player can modify and reload server options on-the-fly. Use commands /changeoption and /reloadoptions." |
| `ReloadLuaFiles` |  |  |  |  |  |  | Y | `/reloadlua`, `/reloadalllua` | "Player can reload Lua scripts used by the game server. Use /reloadlua command." |
| `BypassLuaChecksum` |  |  |  |  |  |  | Y |  | "Checksum verification for Lua files is disabled for player, allowing for potentially unauthorized modifications." |
| `RolesWrite` |  |  |  |  |  |  | Y |  | "Allows player to modify and assign roles and permissions to other players on the server. Use Roles List button in the Admin Panel." |
| `ConnectWithDebug` |  |  |  |  |  |  | Y | `/debugplayer`, `/setTimeSpeed` | "Player have access to a debugging connection with specific permissions. Use commands /debugplayer and /setTimeSpeed." |
