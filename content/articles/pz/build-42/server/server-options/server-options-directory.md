---
slug: server-options-directory
title: 'Server options A to Z (Build 42.21)'
game: pz
version: build-42
section: server
category: server-options
difficulty: beginner
tags:
  - server
  - server-options
  - reference
  - generated
excerpt: 'All 144 options of the Build 42.21 server ini file, A to Z, with type, default and settings page, and how the game reads the file.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - server-options-details-steam-and-backups
  - server-options-players-and-admins
  - server-options-pvp-safehouses-and-factions
  - sandbox-options-directory
---
# Server options A to Z

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Outcast, these are all 144 options of the server's ini file in Build 42.21, A to Z. Click a name for its full entry: what the game says about it, where the code reads it, and what we found it does.

## The file and how the game reads it

- **Where it lives.** The server reads and writes `Server/<servername>.ini` in your Zomboid folder (`%UserProfile%\Zomboid\Server` on Windows, `~/Zomboid/Server` on Linux). The first start writes the file with every option at its default.
- **What each line is.** One `Name=value` line per option, with the game's description written above it as a `#` comment.
- **A value out of range is refused.** A number below the minimum or above the maximum is not clamped: the game logs an error and keeps the value it had (the default, on a fresh start). A true/false option accepts `true`, `false`, `1` and `0`, in any case; anything else is logged as an error and ignored.
- **What players can see.** All options except `Password`, `RCONPort`, `RCONPassword`, `DiscordToken`, `DiscordChatChannel`, `DiscordLogChannel`, `DiscordCommandChannel` are on the public list. The server writes the public list, names and values, into the data a player's game downloads when it joins.
- **Not on the settings screen.** 45 options are on no page of the game's server settings screen. They are only in the file (and `/changeoption` can change them).

> **Proof:** Code. zombie.network.ServerOptions#init, #loadServerTextFile, #saveServerTextFile and its constructor (the public list); zombie.config.ConfigFile#write (one line per option, the description as a comment); zombie.config.IntegerConfigOption#setValue and zombie.config.DoubleConfigOption#setValue (out-of-range values refused); zombie.config.BooleanConfigOption#parse; zombie.network.ConnectionDetails#writeServerOptions (the public list sent to a joining player); zombie.network.ServerSettingsManager#getSettingsFolder. Build 42.21 (revision 4a0e9546ec).

## What we found

- **143 of 144 options are read** somewhere in the Java or the vanilla Lua, at 376 read sites.
- **1 option is read nowhere:** [BloodSplatLifespanDays](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#bloodsplatlifespandays).

## How a read site is found

Every "Read in" line on these pages comes from a search of the Build 42.21 Java and the vanilla Lua, by these rules:

1. Java, a server option: the option's field reached through ServerOptions.instance or ServerOptions.getInstance() (or a local variable holding one of them, inside the same method), the field reached with this. inside ServerOptions itself (its constructor, which only builds the public list, is left out), and a call getOption / getBoolean / getInteger / getFloat / getDouble / getOptionByName / putOption / putSaveOption / changeOption with the option's name written as text, on a ServerOptions receiver.
2. Java, a sandbox option: the option's field reached through SandboxOptions.instance or SandboxOptions.getInstance() (for a nested group, through its group field, such as lore or zombieConfig), through a local variable holding SandboxOptions or one of its groups inside the same method, or with this. inside SandboxOptions; and getOptionByName with the option's name written as text. A getOptionByName whose name is built at run time ("MultiplierConfig." + a skill) is kept as a computed read for every option the prefix can reach, and so is an option the world generator's Lua data names as "Sandbox.Name", which ProbaString looks up by that name.
3. A write is kept apart from a read: in Java a call to setValue, parse or setValueFromObject on the option, or putOption / putSaveOption / changeOption with its name; in Lua an assignment to SandboxVars.Name. The debug scenarios and the Last Stand challenges set many sandbox values this way.
4. Lua (vanilla media/lua, all three folders), a server option: getServerOptions():<getter>("Name") or ServerOptions.getInstance():<getter>("Name"). A sandbox option: SandboxVars.Name, SandboxVars.Group.Name, SandboxVars["Name"], and getSandboxOptions():getOptionByName("Name").
5. Not counted as reads: the declaration itself, the settings screens' lists of option names, the preset files, the translation files, and the generic loops that load, save, copy or send every option.
6. An option with no read site is searched once more for its name written as text anywhere else in Java or Lua; a hit there is listed as "named in" (the name appears, but no read of the value was recognised). An option with neither is marked "not read by the 42.21 code".
7. A capability: Capability.Name in Java or Lua, except the enum itself, the built-in role definitions in Roles#addStatic, and the command annotations (listed with each command instead).

A read site says where the code uses the value. When the code there makes the effect plain, the entry adds a line on what it does, written by hand from that site. When it does not, the entry only says where the value is read: we do not guess.

## All options

| Option | Type | Default | Settings page |
|---|---|---|---|
| [AdminSafehouse](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#adminsafehouse) | boolean | `false` | Safehouse |
| [AllowCoop](/pz/build-42/server/server-options/server-options-players-and-admins#allowcoop) | boolean | `true` | Players |
| [AllowDestructionBySledgehammer](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#allowdestructionbysledgehammer) | boolean | `true` | Other |
| [AllowNonAsciiUsername](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#allownonasciiusername) | boolean | `false` | Other |
| [AnnounceAnimalDeath](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#announceanimaldeath) | boolean | `false` | Chat |
| [AnnounceDeath](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#announcedeath) | boolean | `false` | Chat |
| [AntiCheatChecksum](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatchecksum) | enum | `2` | - |
| [AntiCheatHit](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheathit) | enum | `2` | - |
| [AntiCheatNoClip](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatnoclip) | enum | `4` | - |
| [AntiCheatPacketException](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatpacketexception) | enum | `4` | - |
| [AntiCheatPermission](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatpermission) | enum | `2` | - |
| [AntiCheatPlayer](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatplayer) | enum | `2` | - |
| [AntiCheatSafeHouse](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatsafehouse) | enum | `2` | - |
| [AntiCheatSafety](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatsafety) | enum | `2` | - |
| [AntiCheatSpeed](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatspeed) | enum | `2` | - |
| [AntiCheatXP](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#anticheatxp) | enum | `2` | - |
| [BackupsCount](/pz/build-42/server/server-options/server-options-details-steam-and-backups#backupscount) | integer | `5` | Backups |
| [BackupsOnStart](/pz/build-42/server/server-options/server-options-details-steam-and-backups#backupsonstart) | boolean | `true` | Backups |
| [BackupsOnVersionChange](/pz/build-42/server/server-options/server-options-details-steam-and-backups#backupsonversionchange) | boolean | `true` | Backups |
| [BackupsPeriod](/pz/build-42/server/server-options/server-options-details-steam-and-backups#backupsperiod) | integer | `0` | Backups |
| [BadWordListFile](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#badwordlistfile) | string | (empty) | - |
| [BadWordPolicy](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#badwordpolicy) | enum | `3` | - |
| [BadWordReplacement](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#badwordreplacement) | string | `[HIDDEN]` | - |
| [BanKickGlobalSound](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#bankickglobalsound) | boolean | `true` | - |
| [BloodSplatLifespanDays](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#bloodsplatlifespandays) | integer | `0` | - |
| [CarEngineAttractionModifier](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#carengineattractionmodifier) | double | `0.5` | - |
| [ChatMessageCharacterLimit](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#chatmessagecharacterlimit) | integer | `200` | Chat |
| [ChatMessageSlowModeTime](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#chatmessageslowmodetime) | integer | `3` | Chat |
| [ChatStreams](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#chatstreams) | string | `s,r,a,w,y,sh,f,all` | - |
| [ClientActionLogs](/pz/build-42/server/server-options/server-options-players-and-admins#clientactionlogs) | string | `ISEnterVehicle;ISExitVehicle;ISTakeEngineParts;` | Admin |
| [ClientCommandFilter](/pz/build-42/server/server-options/server-options-players-and-admins#clientcommandfilter) | string | `-vehicle.*;+vehicle.damageWindow;+vehicle.fixPart;+vehicle.installPart;+vehicle.uninstallPart` | Admin |
| [DefaultPort](/pz/build-42/server/server-options/server-options-details-steam-and-backups#defaultport) | integer | `16261` | Details |
| [DenyLoginOnOverloadedServer](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#denyloginonoverloadedserver) | boolean | `true` | - |
| [DisableBurntTowing](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#disableburnttowing) | boolean | `false` | - |
| [DisableRadioAdmin](/pz/build-42/server/server-options/server-options-players-and-admins#disableradioadmin) | boolean | `true` | Admin |
| [DisableRadioGM](/pz/build-42/server/server-options/server-options-players-and-admins#disableradiogm) | boolean | `true` | Admin |
| [DisableRadioInvisible](/pz/build-42/server/server-options/server-options-players-and-admins#disableradioinvisible) | boolean | `true` | Admin |
| [DisableRadioModerator](/pz/build-42/server/server-options/server-options-players-and-admins#disableradiomoderator) | boolean | `false` | Admin |
| [DisableRadioOverseer](/pz/build-42/server/server-options/server-options-players-and-admins#disableradiooverseer) | boolean | `false` | Admin |
| [DisableRadioStaff](/pz/build-42/server/server-options/server-options-players-and-admins#disableradiostaff) | boolean | `false` | Admin |
| [DisableSafehouseWhenOwnerConnected](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#disablesafehousewhenownerconnected) | boolean | `false` | Safehouse |
| [DisableScoreboard](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#disablescoreboard) | boolean | `false` | - |
| [DisableTrailerTowing](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#disabletrailertowing) | boolean | `false` | - |
| [DisableVehicleTowing](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#disablevehicletowing) | boolean | `false` | - |
| [DiscordChatChannel](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#discordchatchannel) | string | (empty) | Discord |
| [DiscordCommandChannel](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#discordcommandchannel) | string | (empty) | Discord |
| [DiscordEnable](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#discordenable) | boolean | `false` | Discord |
| [DiscordLogChannel](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#discordlogchannel) | string | (empty) | Discord |
| [DiscordToken](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#discordtoken) | string | (empty) | Discord |
| [DisplayUserName](/pz/build-42/server/server-options/server-options-players-and-admins#displayusername) | boolean | `true` | Players |
| [DoLuaChecksum](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#doluachecksum) | boolean | `true` | Other |
| [DropOffWhiteListAfterDeath](/pz/build-42/server/server-options/server-options-players-and-admins#dropoffwhitelistafterdeath) | boolean | `false` | Players |
| [Faction](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#faction-1) | boolean | `true` | Faction |
| [FactionDaySurvivedToCreate](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#factiondaysurvivedtocreate) | integer | `0` | Faction |
| [FactionPlayersRequiredForTag](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#factionplayersrequiredfortag) | integer | `1` | Faction |
| [FastForwardMultiplier](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#fastforwardmultiplier) | double | `40.0` | Other |
| [GlobalChat](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#globalchat) | boolean | `true` | Chat |
| [GoodWordListFile](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#goodwordlistfile) | string | (empty) | - |
| [HideAdminsInPlayerList](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#hideadminsinplayerlist) | boolean | `false` | - |
| [HideDisguisedUserName](/pz/build-42/server/server-options/server-options-players-and-admins#hidedisguisedusername) | boolean | `false` | Players |
| [HidePlayersBehindYou](/pz/build-42/server/server-options/server-options-players-and-admins#hideplayersbehindyou) | boolean | `true` | Players |
| [ItemNumbersLimitPerContainer](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#itemnumberslimitpercontainer) | integer | `0` | Loot |
| [KnockedDownAllowed](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#knockeddownallowed) | boolean | `false` | - |
| [LoginQueueConnectTimeout](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#loginqueueconnecttimeout) | integer | `60` | - |
| [LoginQueueEnabled](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#loginqueueenabled) | boolean | `false` | - |
| [Map](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#map) | string | `Muldraugh, KY` | - |
| [MapRemotePlayerVisibility](/pz/build-42/server/server-options/server-options-players-and-admins#mapremoteplayervisibility) | integer | `1` | Players |
| [MaxAccountsPerUser](/pz/build-42/server/server-options/server-options-details-steam-and-backups#maxaccountsperuser) | integer | `0` | Steam |
| [MaxPacketsPerSecond](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#maxpacketspersecond) | integer | `300` | - |
| [MaxPlayers](/pz/build-42/server/server-options/server-options-players-and-admins#maxplayers) | integer | `32` | Players |
| [MaxSafezoneSize](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#maxsafezonesize) | integer | `20000` | - |
| [Mods](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#mods) | string | (empty) | - |
| [MouseOverToSeeDisplayName](/pz/build-42/server/server-options/server-options-players-and-admins#mouseovertoseedisplayname) | boolean | `true` | Players |
| [MultiplayerStatisticsPeriod](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#multiplayerstatisticsperiod) | integer | `1` | - |
| [NoFire](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#nofire) | boolean | `false` | Fire |
| [Open](/pz/build-42/server/server-options/server-options-players-and-admins#open) | boolean | `true` | Players |
| [Password](/pz/build-42/server/server-options/server-options-details-steam-and-backups#password) | string | (empty) | Details |
| [PauseEmpty](/pz/build-42/server/server-options/server-options-details-steam-and-backups#pauseempty) | boolean | `true` | Details |
| [PerkLogs](/pz/build-42/server/server-options/server-options-players-and-admins#perklogs) | boolean | `true` | Admin |
| [PingLimit](/pz/build-42/server/server-options/server-options-players-and-admins#pinglimit) | integer | `0` | Players |
| [PlayerBumpPlayer](/pz/build-42/server/server-options/server-options-players-and-admins#playerbumpplayer) | boolean | `false` | Players |
| [PlayerRespawnWithOther](/pz/build-42/server/server-options/server-options-players-and-admins#playerrespawnwithother) | boolean | `false` | Players |
| [PlayerRespawnWithSelf](/pz/build-42/server/server-options/server-options-players-and-admins#playerrespawnwithself) | boolean | `false` | Players |
| [PlayerSafehouse](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#playersafehouse) | boolean | `false` | Safehouse |
| [Public](/pz/build-42/server/server-options/server-options-details-steam-and-backups#public) | boolean | `false` | Details |
| [PublicDescription](/pz/build-42/server/server-options/server-options-details-steam-and-backups#publicdescription) | text | (empty) | Details |
| [PublicName](/pz/build-42/server/server-options/server-options-details-steam-and-backups#publicname) | string | `My PZ Server` | Details |
| [PVP](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#pvp-1) | boolean | `true` | PVP |
| [PVPFirearmDamageModifier](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#pvpfirearmdamagemodifier) | double | `50.0` | PVP |
| [PVPLogToolChat](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#pvplogtoolchat) | boolean | `true` | - |
| [PVPLogToolFile](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#pvplogtoolfile) | boolean | `true` | - |
| [PVPMeleeDamageModifier](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#pvpmeleedamagemodifier) | double | `30.0` | PVP |
| [PVPMeleeWhileHitReaction](/pz/build-42/server/server-options/server-options-players-and-admins#pvpmeleewhilehitreaction) | boolean | `false` | Players |
| [RCONPassword](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#rconpassword) | string | (empty) | RCON |
| [RCONPort](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#rconport) | integer | `27015` | RCON |
| [RemovePlayerCorpsesOnCorpseRemoval](/pz/build-42/server/server-options/server-options-players-and-admins#removeplayercorpsesoncorpseremoval) | boolean | `false` | Players |
| [ResetID](/pz/build-42/server/server-options/server-options-details-steam-and-backups#resetid) | integer | computed | Details |
| [SafehouseAllowFire](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehouseallowfire) | boolean | `true` | Safehouse |
| [SafehouseAllowLoot](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehouseallowloot) | boolean | `true` | Safehouse |
| [SafehouseAllowNonResidential](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehouseallownonresidential) | boolean | `false` | Safehouse |
| [SafehouseAllowRespawn](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehouseallowrespawn) | boolean | `false` | Safehouse |
| [SafehouseAllowTrepass](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehouseallowtrepass) | boolean | `true` | Safehouse |
| [SafehouseDaySurvivedToClaim](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehousedaysurvivedtoclaim) | integer | `0` | Safehouse |
| [SafehouseDisableDisguises](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehousedisabledisguises) | boolean | `true` | Safehouse |
| [SafehousePreventsLootRespawn](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehousepreventslootrespawn) | boolean | `true` | Loot |
| [SafeHouseRemovalTime](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safehouseremovaltime) | integer | `144` | Safehouse |
| [SafetyCooldownTimer](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safetycooldowntimer) | integer | `3` | PVP |
| [SafetyDisconnectDelay](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#safetydisconnectdelay) | integer | `60` | - |
| [SafetySystem](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safetysystem) | boolean | `true` | PVP |
| [SafetyToggleTimer](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#safetytoggletimer) | integer | `2` | PVP |
| [SaveWorldEveryMinutes](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#saveworldeveryminutes) | integer | `0` | Other |
| [Seed](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#seed) | string | computed | - |
| [server_browser_announced_ip](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#server_browser_announced_ip) | string | (empty) | - |
| [ServerPlayerID](/pz/build-42/server/server-options/server-options-players-and-admins#serverplayerid) | string | computed | Players |
| [ServerWelcomeMessage](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#serverwelcomemessage) | text | `Welcome to Project Zomboid Multiplayer! <LINE> <LINE> To interact with the Chat panel: press Tab, T, or Enter. <LINE> <LINE> The Tab key will change the target stream of the message. <LINE> <LINE> Global Streams: /all <LINE> Local Streams: /say, /yell <LINE> Special Steams: /whisper, /safehouse, /faction. <LINE> <LINE> Press the Up arrow to cycle through your message history. Click the Gear icon to customize chat. <LINE> <LINE> Happy surviving!` | Chat |
| [ShowCoordinates](/pz/build-42/server/server-options/server-options-players-and-admins#showcoordinates) | boolean | `false` | Players |
| [ShowFirstAndLastName](/pz/build-42/server/server-options/server-options-players-and-admins#showfirstandlastname) | boolean | `false` | Players |
| [ShowSafety](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#showsafety) | boolean | `true` | PVP |
| [SledgehammerOnlyInSafehouse](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#sledgehammeronlyinsafehouse) | boolean | `false` | Other |
| [SleepAllowed](/pz/build-42/server/server-options/server-options-players-and-admins#sleepallowed) | boolean | `false` | Players |
| [SleepNeeded](/pz/build-42/server/server-options/server-options-players-and-admins#sleepneeded) | boolean | `false` | Players |
| [SneakModeHideFromOtherPlayers](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#sneakmodehidefromotherplayers) | boolean | `true` | - |
| [SpawnItems](/pz/build-42/server/server-options/server-options-players-and-admins#spawnitems) | string | (empty) | Players |
| [SpawnPoint](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#spawnpoint) | string | `0,0,0` | - |
| [SpeedLimit](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#speedlimit) | double | `70.0` | Vehicles |
| [SteamScoreboard](/pz/build-42/server/server-options/server-options-details-steam-and-backups#steamscoreboard) | boolean | `false` | Steam |
| [SteamVAC](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#steamvac) | boolean | `true` | - |
| [SwitchZombiesOwnershipEachUpdate](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#switchzombiesownershipeachupdate) | boolean | `false` | - |
| [TrashDeleteAll](/pz/build-42/server/server-options/server-options-players-and-admins#trashdeleteall) | boolean | `false` | Players |
| [UDPPort](/pz/build-42/server/server-options/server-options-details-steam-and-backups#udpport) | integer | `16262` | Steam |
| [UltraSpeedDoesnotAffectToAnimals](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#ultraspeeddoesnotaffecttoanimals) | boolean | `false` | - |
| [UPnP](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#upnp-1) | boolean | `true` | UPnP |
| [UsePhysicsHitReaction](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#usephysicshitreaction) | boolean | `false` | - |
| [UsernameDisguises](/pz/build-42/server/server-options/server-options-players-and-admins#usernamedisguises) | boolean | `false` | Players |
| [Voice3D](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#voice3d) | boolean | `true` | Voice |
| [VoiceEnable](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#voiceenable) | boolean | `true` | Voice |
| [VoiceMaxDistance](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#voicemaxdistance) | double | `100.0` | Voice |
| [VoiceMinDistance](/pz/build-42/server/server-options/server-options-chat-voice-and-connections#voicemindistance) | double | `10.0` | Voice |
| [War](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#war-1) | boolean | `false` | War |
| [WarDuration](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#warduration) | integer | `3600` | War |
| [WarSafehouseHitPoints](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#warsafehousehitpoints) | integer | `3` | War |
| [WarStartDelay](/pz/build-42/server/server-options/server-options-pvp-safehouses-and-factions#warstartdelay) | integer | `600` | War |
| [WebhookAddress](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#webhookaddress) | string | (empty) | - |
| [WorkshopItems](/pz/build-42/server/server-options/server-options-only-in-the-ini-file#workshopitems) | string | (empty) | - |
