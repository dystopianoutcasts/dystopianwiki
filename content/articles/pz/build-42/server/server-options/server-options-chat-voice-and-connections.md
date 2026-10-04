---
slug: server-options-chat-voice-and-connections
title: 'Server options: chat, voice, RCON, Discord and the rest'
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
excerpt: 'Chat, voice, remote control (RCON), the Discord bridge, UPnP, vehicles and the settings screen''s "Other" page. Every option with its default, range and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - server-options-directory
  - server-options-details-steam-and-backups
  - server-options-players-and-admins
---
# Server options: chat, voice, RCON, Discord and the rest

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Chat, voice, remote control (RCON), the Discord bridge, UPnP, vehicles and the settings screen's "Other" page.

## Chat

### GlobalChat

- **In the file:** `GlobalChat=true` is the default. Takes true or false.
- **Settings screen:** the "Chat" page. **Sent to joining players:** yes.
- **The game's description:** "Toggles global chat on or off."
- **Read in:** `zombie.chat.ChatUtility#getAllowedChatStreams` (line 218).

### AnnounceDeath

- **In the file:** `AnnounceDeath=false` is the default. Takes true or false.
- **Settings screen:** the "Chat" page. **Sent to joining players:** yes.
- **The game's description:** "If checked, every time a player dies a global message will be displayed in the chat"
- **Read in:** `zombie.characters.IsoGameCharacter#DoDeath` (line 2040); `zombie.network.PVPLogTool#logKill` (line 58).

### AnnounceAnimalDeath

- **In the file:** `AnnounceAnimalDeath=false` is the default. Takes true or false.
- **Settings screen:** the "Chat" page. **Sent to joining players:** yes.
- **The game's description:** "If checked, every time an animal dies a global message will be displayed in the chat"
- **Read in:** `zombie.network.PVPLogTool#logKill` (line 53).

### ServerWelcomeMessage

- **In the file:** `ServerWelcomeMessage=Welcome to Project Zomboid Multiplayer! <LINE> <LINE> To interact with the Chat panel: press Tab, T, or Enter. <LINE> <LINE> The Tab key will change the target stream of the message. <LINE> <LINE> Global Streams: /all <LINE> Local Streams: /say, /yell <LINE> Special Steams: /whisper, /safehouse, /faction. <LINE> <LINE> Press the Up arrow to cycle through your message history. Click the Gear icon to customize chat. <LINE> <LINE> Happy surviving!` is the default. Takes text.
- **Settings screen:** the "Chat" page. **Sent to joining players:** yes.
- **The game's description:** "The first welcome message visible in the chat panel. This will be displayed immediately after player login. you can use RGB colours to chance the colour of the welcome message. You can also use , without the space, to create a separate lines within your text. Use: \\\<RGB:1,0,0\> This message will show up red!"
- **Read in:** `zombie.commands.serverCommands.ShowOptionsCommand#Command` (line 51); `zombie.network.packets.connection.ConnectedPacket#parse` (line 238).

### ChatMessageCharacterLimit

- **In the file:** `ChatMessageCharacterLimit=200` is the default. Takes a whole number from 64 to 1024.
- **Settings screen:** the "Chat" page. **Sent to joining players:** yes.
- **Read in:** `media/lua/client/Chat/ISChat.lua` in `ISChat:createChildren` (line 179).

### ChatMessageSlowModeTime

- **In the file:** `ChatMessageSlowModeTime=3` is the default. Takes a whole number from 1 to 30.
- **Settings screen:** the "Chat" page. **Sent to joining players:** yes.
- **Read in:** `media/lua/client/Chat/ISChat.lua` in `ISChat:onCommandEntered` (line 526); `media/lua/client/Chat/ISChat.lua` in `ISChat.ontick` (line 1121).

## RCON

### RCONPort

- **In the file:** `RCONPort=27015` is the default. Takes a whole number from 0 to 65535.
- **Settings screen:** the "RCON" page. **Sent to joining players:** no.
- **The game's description:** "The port for the RCON (Remote Console)"
- **Read in:** `zombie.network.GameServer#main` (line 859).

### RCONPassword

- **In the file:** `RCONPassword=` is the default. Takes text.
- **Settings screen:** the "RCON" page. **Sent to joining players:** no.
- **The game's description:** "RCON password (Pick a strong password)"
- **Read in:** `zombie.network.GameServer#main` (line 860).

## Discord

### DiscordEnable

- **In the file:** `DiscordEnable=false` is the default. Takes true or false.
- **Settings screen:** the "Discord" page. **Sent to joining players:** yes.
- **The game's description:** "Enables global text chat integration with a Discord channel"
- **Read in:** `zombie.network.chat.ChatServer#init` (line 89); `zombie.network.GameServer#startServer` (line 1548).

### DiscordToken

- **In the file:** `DiscordToken=` is the default. Takes text.
- **Settings screen:** the "Discord" page. **Sent to joining players:** no.
- **The game's description:** "Discord bot access token"
- **Read in:** `zombie.network.GameServer#startServer` (line 1549).

### DiscordChatChannel

- **In the file:** `DiscordChatChannel=` is the default. Takes text.
- **Settings screen:** the "Discord" page. **Sent to joining players:** no.
- **The game's description:** "The Discord chat channel name"
- **Read in:** `zombie.network.GameServer#startServer` (line 1550).

### DiscordLogChannel

- **In the file:** `DiscordLogChannel=` is the default. Takes text.
- **Settings screen:** the "Discord" page. **Sent to joining players:** no.
- **The game's description:** "The Discord logs channel name"
- **Read in:** `zombie.network.GameServer#startServer` (line 1551).

### DiscordCommandChannel

- **In the file:** `DiscordCommandChannel=` is the default. Takes text.
- **Settings screen:** the "Discord" page. **Sent to joining players:** no.
- **The game's description:** "The Discord commands channel name"
- **Read in:** `zombie.network.GameServer#startServer` (line 1552).

## UPnP

### UPnP

- **In the file:** `UPnP=true` is the default. Takes true or false.
- **Settings screen:** the "UPnP" page. **Sent to joining players:** yes.
- **The game's description:** "Attempt to configure a UPnP-enabled internet gateway to automatically setup port forwarding rules. The server will fall back to default ports if this fails"
- **Read in:** `zombie.network.GameServer#main` (line 742).

## Other

### DoLuaChecksum

- **In the file:** `DoLuaChecksum=true` is the default. Takes true or false.
- **Settings screen:** the "Other" page. **Sent to joining players:** yes.
- **The game's description:** "Kick clients whose game files don't match the server's."
- **Read in:** `zombie.iso.IsoWorld#init` (line 1915); `zombie.network.packets.connection.LoginPacket#processServer` (lines 102, 173).

### AllowDestructionBySledgehammer

- **In the file:** `AllowDestructionBySledgehammer=true` is the default. Takes true or false.
- **Settings screen:** the "Other" page. **Sent to joining players:** yes.
- **The game's description:** "Allow players to destroy world objects with sledgehammers"
- **Read in:** `zombie.iso.ISWorldObjectContextMenuLogic#doDestroyMenu` (line 1158); `zombie.Lua.LuaManager$GlobalObject#sledgeDestroy` (line 4970); `zombie.network.packets.SledgehammerDestroyPacket#processServer` (line 27).

### SledgehammerOnlyInSafehouse

- **In the file:** `SledgehammerOnlyInSafehouse=false` is the default. Takes true or false.
- **Settings screen:** the "Other" page. **Sent to joining players:** yes.
- **The game's description:** "Allow players to destroy world objects only in their safehouse (require AllowDestructionBySledgehammer to true)."
- **Read in:** `media/lua/server/BuildingObjects/ISDestroyCursor.lua` in `ISDestroyCursor:isValid` (line 147); `media/lua/shared/TimedActions/ISDestroyStuffAction.lua` in `ISDestroyStuffAction:complete` (line 120).

### SaveWorldEveryMinutes

- **In the file:** `SaveWorldEveryMinutes=0` is the default. Takes a whole number from 0 to 2147483647.
- **Settings screen:** the "Other" page. **Sent to joining players:** yes.
- **The game's description:** "Loaded parts of the map are saved after this set number of real-world minutes have passed. (The map is usually saved only after clients leave a loaded area)"
- **Read in:** `zombie.network.ServerMap#preupdate` (line 511).
- **What the code does with it:** 0 turns it off. Above 0, once this many real minutes have passed since the last save the server queues a full save, and runs it when no backup is in progress.

### FastForwardMultiplier

- **In the file:** `FastForwardMultiplier=40.0` is the default. Takes a number from 1.0 to 100.0.
- **Settings screen:** the "Other" page. **Sent to joining players:** yes.
- **The game's description:** "Governs how fast time passes while players sleep. Value multiplies the speed of the time that passes during sleeping."
- **Read in:** `zombie.ai.states.ThumpState#getFastForwardDamageMultiplier` (lines 385, 387); `zombie.GameTime#getMultiplier` (lines 983, 985).
- **What the code does with it:** While the server is fast-forwarding, `GameTime#getMultiplier` uses this value divided by the length of a day in minutes.

### AllowNonAsciiUsername

- **In the file:** `AllowNonAsciiUsername=false` is the default. Takes true or false.
- **Settings screen:** the "Other" page. **Sent to joining players:** yes.
- **The game's description:** "Allow use of non-ASCII (cyrillic etc) characters in usernames"
- **Read in:** `zombie.network.ServerWorldDatabase#authClient` (line 1036).

## Vehicles

### SpeedLimit

- **In the file:** `SpeedLimit=70.0` is the default. Takes a number from 10.0 to 150.0.
- **Settings screen:** the "Vehicles" page. **Sent to joining players:** yes.
- **Read in:** `zombie.core.physics.CarController#update` (line 148); `zombie.core.physics.CarController#control_Forward` (line 682); `zombie.core.physics.CarController#control_ForwardNew` (line 795); `zombie.network.anticheats.AntiCheatSpeed#validate` (line 34); `zombie.vehicles.BaseVehicle#getFakeSpeedModifier` (line 677).
- **What the code does with it:** On a multiplayer client the engine stops pushing a car forward once it reaches this speed in km/h. The speed anti-cheat also uses it as the limit for a player in a vehicle (`AntiCheatSpeed#validate`, 20 for a player on foot).

## Voice

### VoiceEnable

- **In the file:** `VoiceEnable=true` is the default. Takes true or false.
- **Settings screen:** the "Voice" page. **Sent to joining players:** yes.
- **The game's description:** "VOIP is enabled when checked"
- **Read in:** `zombie.core.raknet.VoiceManager#InitVMServer` (line 960).

### VoiceMinDistance

- **In the file:** `VoiceMinDistance=10.0` is the default. Takes a number from 0.0 to 100000.0.
- **Settings screen:** the "Voice" page. **Sent to joining players:** yes.
- **The game's description:** "The minimum tile distance over which VOIP sounds can be heard."
- **Read in:** `zombie.core.raknet.VoiceManager#InitVMServer` (line 965).

### VoiceMaxDistance

- **In the file:** `VoiceMaxDistance=100.0` is the default. Takes a number from 0.0 to 100000.0.
- **Settings screen:** the "Voice" page. **Sent to joining players:** yes.
- **The game's description:** "The maximum tile distance over which VOIP sounds can be heard."
- **Read in:** `zombie.core.raknet.VoiceManager#InitVMServer` (line 966).

### Voice3D

- **In the file:** `Voice3D=true` is the default. Takes true or false.
- **Settings screen:** the "Voice" page. **Sent to joining players:** yes.
- **The game's description:** "Toggle directional audio for VOIP"
- **Read in:** `zombie.core.raknet.VoiceManager#InitVMServer` (line 967).

> **Proof:** Code. zombie.network.ServerOptions (each option's declaration: name, type, default, range), media/lua/shared/Translate/EN/UI.json (the descriptions), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
