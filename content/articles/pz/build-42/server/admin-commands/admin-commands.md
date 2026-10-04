---
slug: admin-commands
title: 'Admin commands (Build 42.21)'
game: pz
version: build-42
section: server
category: admin-commands
difficulty: beginner
tags:
  - server
  - admin
  - commands
  - generated
excerpt: 'All 67 Build 42.21 server commands: their forms, the capability each needs, the roles that have it, and the game''s help text.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - server-roles-and-capabilities
  - server-options-directory
---
# Admin commands

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Outcast, these are the 67 commands the Build 42.21 server knows, in the order the server tries them. You type them in chat with a `/` in front, or in the server console without it. Each form of a command needs one capability; the built-in roles that hold it are listed with it, and [Roles and access](/pz/build-42/server/roles-and-access/server-roles-and-capabilities) says what each role holds.

## How the server reads a command

- **Matching.** The server walks its command list in order and takes the first command whose name starts the line, ignoring case and stopping at a word boundary. A disabled command is skipped.
- **Arguments.** The line is split at spaces; text in double quotes stays one argument (the quotes are removed). Each form of a command lists the arguments it takes; the first form that fits is used. When none fits, the server answers with the command's help text.
- **Who may run it.** After the arguments fit, the server checks the capability that form needs against your role. Without it you get "no right to execute" and nothing happens.
- **3 commands are disabled in 42.21:** `/connections`, `/addalltowhitelist`, `/addusertowhitelist`. They are in the list, but the server skips them.

## Quick list

| Command | Needs | Built-in roles that have it |
|---|---|---|
| [/save](#save) | `SaveWorld` | admin |
| [/servermsg](#servermsg) | `DisplayServerMessage` | moderator, admin |
| [/connections](#connections) (disabled) | `SeePlayersConnected` | observer, gm, moderator, admin |
| [/adduser](#adduser) | `ModifyNetworkUsers` | moderator, admin |
| [/addsteamid](#addsteamid) | `ModifyNetworkUsers` | moderator, admin |
| [/removesteamid](#removesteamid) | `ModifyNetworkUsers` | moderator, admin |
| [/grantadmin](#grantadmin) | `ChangeAccessLevel` | moderator, admin |
| [/removeadmin](#removeadmin) | `ChangeAccessLevel` | moderator, admin |
| [/debugplayer](#debugplayer) | `ConnectWithDebug` | admin |
| [/quit](#quit) | `QuitWorld` | admin |
| [/alarm](#alarm) | `MakeEventsAlarmGunshot` | gm, moderator, admin |
| [/chopper](#chopper) | `MakeEventsAlarmGunshot` | gm, moderator, admin |
| [/addalltowhitelist](#addalltowhitelist) (disabled) | `ManipulateWhitelist` | moderator, admin |
| [/kick](#kick) | `KickUser` | moderator, admin |
| [/teleport](#teleport) | `TeleportToPlayer`, `TeleportPlayerToAnotherPlayer` | observer, gm, moderator, admin |
| [/teleportplayer](#teleportplayer) | `TeleportPlayerToAnotherPlayer` | gm, moderator, admin |
| [/teleportto](#teleportto) | `TeleportToCoordinates` | observer, gm, moderator, admin |
| [/releasesafehouse](#releasesafehouse) | `CanSetupSafehouses` | moderator, admin |
| [/startrain](#startrain) | `StartStopRain` | gm, moderator, admin |
| [/stoprain](#stoprain) | `StartStopRain` | gm, moderator, admin |
| [/thunder](#thunder) | `StartStopRain` | gm, moderator, admin |
| [/gunshot](#gunshot) | `MakeEventsAlarmGunshot` | gm, moderator, admin |
| [/reloadoptions](#reloadoptions) | `ChangeAndReloadServerOptions` | admin |
| [/banuser](#banuser) | `BanUnbanUser` | moderator, admin |
| [/banid](#banid) | `BanUnbanUser` | moderator, admin |
| [/banip](#banip) | `BanUnbanUser` | moderator, admin |
| [/unbanuser](#unbanuser) | `BanUnbanUser` | moderator, admin |
| [/unbanid](#unbanid) | `BanUnbanUser` | moderator, admin |
| [/unbanip](#unbanip) | `BanUnbanUser` | moderator, admin |
| [/addusertowhitelist](#addusertowhitelist) (disabled) | `ManipulateWhitelist` | moderator, admin |
| [/addtosafehouse](#addtosafehouse) | `CanSetupSafehouses` | moderator, admin |
| [/kickfromsafehouse](#kickfromsafehouse) | `CanSetupSafehouses` | moderator, admin |
| [/removeuserfromwhitelist](#removeuserfromwhitelist) | `ManipulateWhitelist` | moderator, admin |
| [/changeoption](#changeoption) | `ChangeAndReloadServerOptions` | admin |
| [/showoptions](#showoptions) | `SeePublicServerOptions` | observer, gm, moderator, admin |
| [/godmod](#godmod) | `ToggleGodModHimself` | observer, gm, moderator, admin |
| [/godmodplayer](#godmodplayer) | `ToggleGodModEveryone` | gm, moderator, admin |
| [/voiceban](#voiceban) | `BanUnbanUser` | moderator, admin |
| [/noclip](#noclip) | `ToggleNoclipHimself` | observer, gm, moderator, admin |
| [/invisible](#invisible) | `ToggleInvisibleHimself` | observer, gm, moderator, admin |
| [/invisibleplayer](#invisibleplayer) | `ToggleInvisibleEveryone` | gm, moderator, admin |
| [/help](#help) | `LoginOnServer` | user, priority, observer, gm, moderator, admin |
| [/clear](#clear) | `LoginOnServer` | user, priority, observer, gm, moderator, admin |
| [/players](#players) | `SeePlayersConnected` | observer, gm, moderator, admin |
| [/additem](#additem) | `AddItem` | gm, moderator, admin |
| [/removeitem](#removeitem) | `EditItem` | moderator, admin |
| [/addxp](#addxp) | `AddXP` | gm, moderator, admin |
| [/addvehicle](#addvehicle) | `ManipulateVehicle` | moderator, admin |
| [/createhorde](#createhorde) | `CreateHorde` | moderator, admin |
| [/createhorde2](#createhorde2) | `CreateHorde` | moderator, admin |
| [/reloadlua](#reloadlua) | `ReloadLuaFiles` | admin |
| [/reloadalllua](#reloadalllua) | `ReloadLuaFiles` | admin |
| [/removezombies](#removezombies) | `ManipulateZombie` | moderator, admin |
| [/remove](#remove) | `AnimalCheats` | moderator, admin |
| [/list](#list) | `LoginOnServer` | user, priority, observer, gm, moderator, admin |
| [/setaccesslevel](#setaccesslevel) | `ChangeAccessLevel` | moderator, admin |
| [/log](#log) | `DebugConsole` | moderator, admin |
| [/lightning](#lightning) | `MakeEventsAlarmGunshot` | gm, moderator, admin |
| [/stopweather](#stopweather) | `StartStopRain` | gm, moderator, admin |
| [/startstorm](#startstorm) | `StartStopRain` | gm, moderator, admin |
| [/checkModsNeedUpdate](#checkmodsneedupdate) | `ManipulateMods` | moderator, admin |
| [/addkey](#addkey) | `AddItem` | gm, moderator, admin |
| [/setTimeSpeed](#settimespeed) | `ConnectWithDebug` | admin |
| [/setpassword](#setpassword) | `ModifyNetworkUsers` | moderator, admin |
| [/stats](#stats) | `GetStatistic` | moderator, admin |
| [/worldgen](#worldgen) | `SaveWorld` | admin |
| [/removemapsymbolsforuser](#removemapsymbolsforuser) | `EditMapSymbols` | moderator, admin |

### /save

- **Forms:** `/save`
- **Needs:** `SaveWorld` (admin)
- **The game's help text:** "Save the current world"
- **Runs in:** `zombie.commands.serverCommands.SaveCommand#Command` (line 34)

### /servermsg

- **Forms:** `/servermsg <"name or text">`
- **Needs:** `DisplayServerMessage` (moderator, admin)
- **The game's help text:** "Broadcast a message to all connected players. Use: /servermsg "My Message""
- **Runs in:** `zombie.commands.serverCommands.ServerMessageCommand#Command` (line 38)

### /connections

- **Also typed as:** `/list`
- **Disabled in this build:** the server skips it.
- **Forms:** `/connections`
- **Needs:** `SeePlayersConnected` (observer, gm, moderator, admin)
- **The game's help text:** "Displays information on all connections"
- **Runs in:** `zombie.commands.serverCommands.ConnectionsCommand#Command` (line 39)

### /adduser

- **Forms:** `/adduser <"name or text"> [<"name or text">]`
- **Needs:** `ModifyNetworkUsers` (moderator, admin)
- **The game's help text:** "Use this command to add a new user to a whitelisted server. Use: /adduser "username" "password" -- password is optional"
- **Runs in:** `zombie.commands.serverCommands.AddUserCommand#Command` (line 43)

### /addsteamid

- **Forms:** `/addsteamid <"name or text">`
- **Needs:** `ModifyNetworkUsers` (moderator, admin)
- **The game's help text:** "Use this command to add a SteamID to a list of allowed SteamIDs on server. Use: /addSteamID "steamid""
- **Runs in:** `zombie.commands.serverCommands.AddSteamIDCommand#Command` (line 41)

### /removesteamid

- **Forms:** `/removesteamid <"name or text">`
- **Needs:** `ModifyNetworkUsers` (moderator, admin)
- **The game's help text:** "Use this command to remove a SteamID from a list of allowed SteamIDs on server. Use: /removeSteamID "steamid""
- **Runs in:** `zombie.commands.serverCommands.RemoveSteamIDCommand#Command` (line 41)

### /grantadmin

- **Forms:** `/grantadmin <"name or text">`
- **Needs:** `ChangeAccessLevel` (moderator, admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.GrantAdminCommand#Command` (line 34)

### /removeadmin

- **Forms:** `/removeadmin <"name or text">`
- **Needs:** `ChangeAccessLevel` (moderator, admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.RemoveAdminCommand#Command` (line 34)

### /debugplayer

- **Forms:** `/debugplayer <"name or text">`
- **Needs:** `ConnectWithDebug` (admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.DebugPlayerCommand#Command` (line 35)

### /quit

- **Forms:** `/quit`
- **Needs:** `QuitWorld` (admin)
- **The game's help text:** "Save and quit the server"
- **Runs in:** `zombie.commands.serverCommands.QuitCommand#Command` (line 36)

### /alarm

- **Forms:** `/alarm`
- **Needs:** `MakeEventsAlarmGunshot` (gm, moderator, admin)
- **The game's help text:** "Sound a building alarm at the Admin's position. (Must be in a room)"
- **Runs in:** `zombie.commands.serverCommands.AlarmCommand#Command` (line 36)

### /chopper

- **Forms:** `/chopper [<Module.Name>]`
- **Needs:** `MakeEventsAlarmGunshot` (gm, moderator, admin)
- **The game's help text:** "Place a helicopter event on a random player"
- **Runs in:** `zombie.commands.serverCommands.ChopperCommand#Command` (line 39)

### /addalltowhitelist

- **Disabled in this build:** the server skips it.
- **Forms:** `/addalltowhitelist`
- **Needs:** `ManipulateWhitelist` (moderator, admin)
- **The game's help text:** "Add all the current users who are connected with a password to the whitelist, so their account is protected."
- **Runs in:** `zombie.commands.serverCommands.AddAllToWhiteListCommand#Command` (line 41)

### /kick

- **Also typed as:** `/kickuser`
- **Forms:** `/kick <"name or text">`; `/kick <"name or text"> -r <"name or text">`
- **Needs:** `KickUser` (moderator, admin)
- **The game's help text:** "Kick a user. Add a -r "reason" to specify a reason for the kick. Use: /kickuser "username" -r "reason""
- **Runs in:** `zombie.commands.serverCommands.KickUserCommand#Command` (line 50)

### /teleport

- **Also typed as:** `/tp`
- **Forms:** `/teleport <"name or text">` (needs `TeleportToPlayer`); `/teleport <"name or text"> <"name or text">` (needs `TeleportPlayerToAnotherPlayer`)
- **Needs:** `TeleportToPlayer` (observer, gm, moderator, admin); `TeleportPlayerToAnotherPlayer` (gm, moderator, admin)
- **The game's help text:** "Teleport to a player. Once teleported, wait for the map to appear. Use /teleport "playername" or /teleport "player1" "player2". Example /teleport "rj" or /teleport "rj" "toUser""
- **Runs in:** `zombie.commands.serverCommands.TeleportCommand#Command` (line 55)

### /teleportplayer

- **Also typed as:** `/tpp`
- **Forms:** `/teleportplayer <"name or text"> <"name or text">`
- **Needs:** `TeleportPlayerToAnotherPlayer` (gm, moderator, admin)
- **The game's help text:** "Teleport a player to another player. Use /teleportplayer "player1" "player2". Example /teleportplayer "rj" "toUser""
- **Runs in:** `zombie.commands.serverCommands.TeleportPlayerCommand#Command` (line 46)

### /teleportto

- **Also typed as:** `/tpto`
- **Forms:** `/teleportto <"name or text"> <x,y,z>`; `/teleportto <x,y,z>`
- **Needs:** `TeleportToCoordinates` (observer, gm, moderator, admin)
- **The game's help text:** "Teleport to coordinates. Use /teleportto x,y,z. Example /teleportto 10000,11000,0"
- **Runs in:** `zombie.commands.serverCommands.TeleportToCommand#Command` (line 54)

### /releasesafehouse

- **Forms:** `/releasesafehouse <"name or text">`
- **Needs:** `CanSetupSafehouses` (moderator, admin)
- **The game's help text:** "Release a safehouse. Use /releasesafehouse "title""
- **Runs in:** `zombie.commands.serverCommands.ReleaseSafehouseCommand#Command` (line 42)

### /startrain

- **Forms:** `/startrain [<number>]`
- **Needs:** `StartStopRain` (gm, moderator, admin)
- **The game's help text:** "Starts raining on the server. Use /startrain "intensity", optional intensity is from 1 to 100"
- **Runs in:** `zombie.commands.serverCommands.StartRainCommand#Command` (line 40)

### /stoprain

- **Forms:** `/stoprain`
- **Needs:** `StartStopRain` (gm, moderator, admin)
- **The game's help text:** "Stop raining on the server"
- **Runs in:** `zombie.commands.serverCommands.StopRainCommand#Command` (line 35)

### /thunder

- **Forms:** `/thunder [<"name or text">]`
- **Needs:** `StartStopRain` (gm, moderator, admin)
- **The game's help text:** "Use /thunder "username", username is optional except from the server console"
- **Runs in:** `zombie.commands.serverCommands.ThunderCommand#Command` (line 42)

### /gunshot

- **Forms:** `/gunshot`
- **Needs:** `MakeEventsAlarmGunshot` (gm, moderator, admin)
- **The game's help text:** "Place a gunshot sound on a random player"
- **Runs in:** `zombie.commands.serverCommands.GunShotCommand#Command` (line 35)

### /reloadoptions

- **Forms:** `/reloadoptions`
- **Needs:** `ChangeAndReloadServerOptions` (admin)
- **The game's help text:** "Reload server options (ServerOptions.ini) and send to clients"
- **Runs in:** `zombie.commands.serverCommands.ReloadOptionsCommand#Command` (line 39)

### /banuser

- **Forms:** `/banuser <"name or text">`; `/banuser <"name or text"> -ip`; `/banuser <"name or text"> -r <"name or text">`; `/banuser <"name or text"> -ip -r <"name or text">`
- **Needs:** `BanUnbanUser` (moderator, admin)
- **The game's help text:** "Ban a user. Add a -ip to also ban the IP. Add a -r "reason" to specify a reason for the ban. Use: /banuser "username" -ip -r "reason". For example: /banuser "rj" -ip -r "spawn kill""
- **Runs in:** `zombie.commands.serverCommands.BanUserCommand#Command` (line 58)

### /banid

- **Forms:** `/banid <"name or text">`
- **Needs:** `BanUnbanUser` (moderator, admin)
- **The game's help text:** "Ban a SteamID. Use /banid SteamID"
- **Runs in:** `zombie.commands.serverCommands.BanSteamIDCommand#Command` (line 40)

### /banip

- **Forms:** `/banip <IP address>`
- **Needs:** `BanUnbanUser` (moderator, admin)
- **The game's help text:** "Ban IP. Use /banip IP"
- **Runs in:** `zombie.commands.serverCommands.BanIPCommand#Command` (line 39)

### /unbanuser

- **Forms:** `/unbanuser <"name or text">`
- **Needs:** `BanUnbanUser` (moderator, admin)
- **The game's help text:** "Unban a player. Use /unbanuser "username""
- **Runs in:** `zombie.commands.serverCommands.UnbanUserCommand#Command` (line 39)

### /unbanid

- **Forms:** `/unbanid <"name or text">`
- **Needs:** `BanUnbanUser` (moderator, admin)
- **The game's help text:** "Unban a SteamID. Use /unbanid SteamID"
- **Runs in:** `zombie.commands.serverCommands.UnbanSteamIDCommand#Command` (line 40)

### /unbanip

- **Forms:** `/unbanip <IP address>`
- **Needs:** `BanUnbanUser` (moderator, admin)
- **The game's help text:** "Unban IP. Use /unbanip IP"
- **Runs in:** `zombie.commands.serverCommands.UnbanIPCommand#Command` (line 39)

### /addusertowhitelist

- **Disabled in this build:** the server skips it.
- **Forms:** `/addusertowhitelist <"name or text">`
- **Needs:** `ManipulateWhitelist` (moderator, admin)
- **The game's help text:** "Add a user connected with a password to the whitelist, so their account is protected. Use: /addusertowhitelist "username""
- **Runs in:** `zombie.commands.serverCommands.AddUserToWhiteListCommand#Command` (line 43)

### /addtosafehouse

- **Forms:** `/addtosafehouse <"name or text"> <"name or text">`
- **Needs:** `CanSetupSafehouses` (moderator, admin)
- **The game's help text:** "Adds player to a safehouse. Use /addtosafehouse "title" "username""
- **Runs in:** `zombie.commands.serverCommands.AddUserToSafehouseCommand#Command` (line 44)

### /kickfromsafehouse

- **Forms:** `/kickfromsafehouse <"name or text"> <"name or text">`
- **Needs:** `CanSetupSafehouses` (moderator, admin)
- **The game's help text:** "Removes player from a safehouse. Use /kickfromsafehouse "title" "username""
- **Runs in:** `zombie.commands.serverCommands.KickUserFromSafehouseCommand#Command` (line 40)

### /removeuserfromwhitelist

- **Forms:** `/removeuserfromwhitelist <"name or text">`
- **Needs:** `ManipulateWhitelist` (moderator, admin)
- **The game's help text:** "Remove a user from the whitelist. Use: /removeuserfromwhitelist "username""
- **Runs in:** `zombie.commands.serverCommands.RemoveUserFromWhiteList#Command` (line 41)

### /changeoption

- **Forms:** `/changeoption <word> <"value">`
- **Needs:** `ChangeAndReloadServerOptions` (admin)
- **The game's help text:** "Change a server option. Use: /changeoption optionName "newValue""
- **Runs in:** `zombie.commands.serverCommands.ChangeOptionCommand#Command` (line 42)
- **What the code does:** Saves the ini file at once. Changing `Password` also sets the server's password, changing `ClientCommandFilter` reloads the filter, and on a Steam server the Steam settings are applied again. Every change is written to the admin log.

### /showoptions

- **Forms:** `/showoptions`
- **Needs:** `SeePublicServerOptions` (observer, gm, moderator, admin)
- **The game's help text:** "Show the list of current server options and values."
- **Runs in:** `zombie.commands.serverCommands.ShowOptionsCommand#Command` (line 35)

### /godmod

- **Also typed as:** `/godmode`
- **Forms:** `/godmod [<-true or -false>]`
- **Needs:** `ToggleGodModHimself` (observer, gm, moderator, admin)
- **The game's help text:** "Make yourself invincible. Use: /godmode -value, ex /godmode -true (could be -false)"
- **Runs in:** `zombie.commands.serverCommands.GodModeCommand#Command` (line 43)

### /godmodplayer

- **Also typed as:** `/godmodeplayer`
- **Forms:** `/godmodplayer <"name or text"> [<-true or -false>]`
- **Needs:** `ToggleGodModEveryone` (gm, moderator, admin)
- **The game's help text:** "Make a player invincible. Use: /godmodeplayer "username" -value, ex /godmodeplayer "rj" -true (could be -false)"
- **Runs in:** `zombie.commands.serverCommands.GodModePlayerCommand#Command` (line 44)

### /voiceban

- **Forms:** `/voiceban <"name or text"> [<-true or -false>]`; `/voiceban [<-true or -false>]`
- **Needs:** `BanUnbanUser` (moderator, admin)
- **The game's help text:** "Block voice from user "username". Use /voiceban "username" -value. Example /voiceban "rj" -true (could be -false)"
- **Runs in:** `zombie.commands.serverCommands.VoiceBanCommand#Command` (line 45)

### /noclip

- **Forms:** `/noclip <"name or text"> [<-true or -false>]`; `/noclip [<-true or -false>]`
- **Needs:** `ToggleNoclipHimself` (observer, gm, moderator, admin)
- **The game's help text:** "Makes a player pass through walls and structures. Toggles with no value. Use: /noclip "username" -value. Example /noclip "rj" -true (could be -false)"
- **Runs in:** `zombie.commands.serverCommands.NoClipCommand#Command` (line 44)

### /invisible

- **Forms:** `/invisible [<-true or -false>]`
- **Needs:** `ToggleInvisibleHimself` (observer, gm, moderator, admin)
- **The game's help text:** "Make yourself invisible to zombies. Use: /invisible -value, ex /invisible -true (could be -false)"
- **Runs in:** `zombie.commands.serverCommands.InvisibleCommand#Command` (line 40)

### /invisibleplayer

- **Forms:** `/invisibleplayer <"name or text"> [<-true or -false>]`
- **Needs:** `ToggleInvisibleEveryone` (gm, moderator, admin)
- **The game's help text:** "Make a player invisible to zombies. Use: /invisibleplayer "username" -value, ex /invisibleplayer "rj" -true (could be -false)"
- **Runs in:** `zombie.commands.serverCommands.InvisiblePlayerCommand#Command` (line 41)

### /help

- **Forms:** `/help [<word>]`
- **Needs:** `LoginOnServer` (user, priority, observer, gm, moderator, admin)
- **The game's help text:** "Help"
- **Runs in:** `zombie.commands.serverCommands.HelpCommand#Command` (line 42)

### /clear

- **Forms:** `/clear`
- **Needs:** `LoginOnServer` (user, priority, observer, gm, moderator, admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.ClearCommand#Command` (line 29)

### /players

- **Forms:** `/players`
- **Needs:** `SeePlayersConnected` (observer, gm, moderator, admin)
- **The game's help text:** "List all connected players"
- **Runs in:** `zombie.commands.serverCommands.PlayersCommand#Command` (line 35)

### /additem

- **Forms:** `/additem <"name or text"> <Module.Name> [<number>]`; `/additem <Module.Name> [<number>]`
- **Needs:** `AddItem` (gm, moderator, admin)
- **The game's help text:** "Give an item to a player. If no username is given then you will receive the item yourself. Count is optional. Use: /additem "username" "module.item" count. Example: /additem "rj" Base.Axe 5"
- **Runs in:** `zombie.commands.serverCommands.AddItemCommand#Command` (line 56)
- **What the code does:** A count above 100 is lowered to 100 (the server prints "Cannot spawn over 100 items at a time").

### /removeitem

- **Forms:** `/removeitem <Module.Name> <number>`
- **Needs:** `EditItem` (moderator, admin)
- **The game's help text:** "Remove items from yourself. Removes all items of type if count set to 0. Use: /removeitem "module.item" count. Example: /removeitem Base.Axe 5"
- **Runs in:** `zombie.commands.serverCommands.RemoveItemCommand#Command` (line 44)

### /addxp

- **Forms:** `/addxp <"name or text"> <word without spaces> [<-true or -false>]`
- **Needs:** `AddXP` (gm, moderator, admin)
- **The game's help text:** "Give XP to a player. Use /addxp "playername" perkname=xp -true. Example /addxp "rj" Woodwork=2 -true. The last argument is optional and is used to take xp multiplier into account"
- **Runs in:** `zombie.commands.serverCommands.AddXPCommand#Command` (line 45)

### /addvehicle

- **Forms:** `/addvehicle <Module.Name>`; `/addvehicle <Module.Name> <x,y,z>`; `/addvehicle <Module.Name> <"name or text">`
- **Needs:** `ManipulateVehicle` (moderator, admin)
- **The game's help text:** "Spawn a vehicle. Use: /addvehicle "script" "user or x,y,z", ex /addvehicle "Base.VanAmbulance" "rj""
- **Runs in:** `zombie.commands.serverCommands.AddVehicleCommand#Command` (line 60)

### /createhorde

- **Forms:** `/createhorde <number> [<"name or text">]`
- **Needs:** `CreateHorde` (moderator, admin)
- **The game's help text:** "Spawn a horde near a player. Use : /createhorde count "username". Example /createhorde 150 "rj" Username is optional except from the server console. With no username the horde will be created around you"
- **Runs in:** `zombie.commands.serverCommands.CreateHordeCommand#Command` (line 48)
- **What the code does:** The count is capped at 500. Each zombie is placed on a random square up to 10 tiles from the player on each axis, on the player's floor, and the horde is written to the admin log.

### /createhorde2

- **Forms:** `/createhorde2 ...` (any arguments; the command reads them itself)
- **Needs:** `CreateHorde` (moderator, admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.CreateHorde2Command#Command` (line 45)

### /reloadlua

- **Forms:** `/reloadlua <word without spaces>`
- **Needs:** `ReloadLuaFiles` (admin)
- **The game's help text:** "Reload a Lua script on the server. Use /reloadlua "filename""
- **Runs in:** `zombie.commands.serverCommands.ReloadLuaCommand#Command` (line 38)

### /reloadalllua

- **Also typed as:** `/reloadluaall`
- **Forms:** `/reloadalllua`
- **Needs:** `ReloadLuaFiles` (admin)
- **The game's help text:** "Reload a Lua script on the server. Use /reloadlua "filename""
- **Runs in:** `zombie.commands.serverCommands.ReloadAllLuaCommand#Command` (line 37)

### /removezombies

- **Forms:** `/removezombies ...` (any arguments; the command reads them itself)
- **Needs:** `ManipulateZombie` (moderator, admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.RemoveZombiesCommand#Command` (line 45)

### /remove

- **Forms:** `/remove <"name or text">`
- **Needs:** `AnimalCheats` (moderator, admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.RemoveCommand#Command` (line 59)

### /list

- **Forms:** `/list <"name or text">`
- **Needs:** `LoginOnServer` (user, priority, observer, gm, moderator, admin)
- **The game's help text:** none (the command has no help text)
- **Runs in:** `zombie.commands.serverCommands.ListCommand#Command` (line 70)

### /setaccesslevel

- **Forms:** `/setaccesslevel <"name or text"> <word>`
- **Needs:** `ChangeAccessLevel` (moderator, admin)
- **The game's help text:** "Set access level of a player. Current levels: Admin, Moderator, Overseer, GM, Observer. Use /setaccesslevel "username" "accesslevel". Example /setaccesslevel "rj" "moderator""
- **Runs in:** `zombie.commands.serverCommands.SetAccessLevelCommand#Command` (line 39)

### /log

- **Forms:** `/log <"name or text"> <"name or text">`
- **Needs:** `DebugConsole` (moderator, admin)
- **The game's help text:** "Set log level. Use /log %1 %2"
- **Runs in:** `zombie.commands.serverCommands.LogCommand#Command` (line 140)

### /lightning

- **Forms:** `/lightning [<"name or text">]`
- **Needs:** `MakeEventsAlarmGunshot` (gm, moderator, admin)
- **The game's help text:** "Use /lightning "username", username is optional except from the server console"
- **Runs in:** `zombie.commands.serverCommands.LightningCommand#Command` (line 42)

### /stopweather

- **Forms:** `/stopweather`
- **Needs:** `StartStopRain` (gm, moderator, admin)
- **The game's help text:** "Stop weather on the server"
- **Runs in:** `zombie.commands.serverCommands.StopWeatherCommand#Command` (line 35)

### /startstorm

- **Forms:** `/startstorm [<number>]`
- **Needs:** `StartStopRain` (gm, moderator, admin)
- **The game's help text:** "Starts a storm on the server. Use /startstorm "duration", optional duration is in game hours"
- **Runs in:** `zombie.commands.serverCommands.StartStormCommand#Command` (line 40)

### /checkModsNeedUpdate

- **Forms:** `/checkModsNeedUpdate`
- **Needs:** `ManipulateMods` (moderator, admin)
- **The game's help text:** "Indicates whether a mod has been updated. Writes answer to log file"
- **Runs in:** `zombie.commands.serverCommands.CheckModsNeedUpdate#Command` (line 34)

### /addkey

- **Forms:** `/addkey <"name or text"> <number> [<"name or text">]`; `/addkey <number> [<"name or text">]`
- **Needs:** `AddItem` (gm, moderator, admin)
- **The game's help text:** "Give a key to a player. If no username is given then you will receive the item yourself. Key name is optional. Use: /addkey "username" "keyId" "name". Example: /addkey "rj" "7295"
- **Runs in:** `zombie.commands.serverCommands.AddKeyCommand#Command` (line 53)

### /setTimeSpeed

- **Also typed as:** `/sts`
- **Forms:** `/setTimeSpeed <number>`
- **Needs:** `ConnectWithDebug` (admin)
- **The game's help text:** "Set the time multiplier on the server. Use /setTimeSpeed period. Example /setTimeSpeed 10"
- **Runs in:** `zombie.commands.serverCommands.SetTimeSpeedCommand#Command` (line 43)

### /setpassword

- **Forms:** `/setpassword <"name or text"> <"name or text">`
- **Needs:** `ModifyNetworkUsers` (moderator, admin)
- **The game's help text:** "Use this command to change password for a user. Use: /setpassword "username" "newpassword""
- **Runs in:** `zombie.commands.serverCommands.SetPasswordCommand#Command` (line 43)

### /stats

- **Forms:** `/stats <"name or text"> [<"name or text">]`
- **Needs:** `GetStatistic` (moderator, admin)
- **The game's help text:** "Get server statistics. Use /stats help to get the details"
- **Runs in:** `zombie.commands.serverCommands.StatisticsCommand#Command` (line 41)
- **What the code does:** `/stats list` lists the statistics, `/stats version` prints the game version, `/stats <statistic> list` lists its counters, `/stats <statistic> all` prints every value and `/stats <statistic> <counter>` one value. Anything else, `/stats help` included, prints the help text again.

### /worldgen

- **Forms:** `/worldgen <"name or text"> [<"name or text">]`
- **Needs:** `SaveWorld` (admin)
- **The game's help text:** "Control full world generator. Use commands '/worldgen start', '/worldgen recheck', '/worldgen stop', and '/worldgen status'. Use"
- **Runs in:** `zombie.commands.serverCommands.WorldGeneratorCommand#Command` (line 40)

### /removemapsymbolsforuser

- **Forms:** `/removemapsymbolsforuser <"name or text">`
- **Needs:** `EditMapSymbols` (moderator, admin)
- **The game's help text:** "Removes all shared in-game map symbols for a specific user. Use /removemapsymbolsforuser "username""
- **Runs in:** `zombie.commands.serverCommands.RemoveMapSymbolsForUserCommand#Command` (line 42)

## Commands every player has

The server also keeps a short help list for players, shown by `/help` to someone without admin capabilities. These are the entries, with the game's own text:

- `/help`: "Help"
- `/changepwd`: "Changes your password. Use /changepwd "previouspassword" "newpassword""
- `/roll`: "If you have dice, you can roll a random number - up to 100. Use: /roll 6"
- `/card`: "If you have a card deck, you can draw a random card. Use: /card"
- `/safehouse`: "Release a safehouse you own. Use /releasesafehouse"

> **Proof:** Code. zombie.commands.CommandBase#findCommandCls (the order, case-insensitive match, disabled commands skipped), the CommandBase constructor (splitting the line), #parseCommand (the forms), #canBeExecuted and #PlayerSatisfyRequiredRights (the capability check), the annotations of each class in zombie.commands.serverCommands, zombie.network.ServerOptions#initClientCommandsHelp (the player help list), and the help strings in media/lua/shared/Translate/EN/UI.json. Build 42.21 (revision 4a0e9546ec).
