---
id: build-42-b42-status-versioning-and-the-compatibility-model
slug: b42-status-versioning-and-the-compatibility-model
title: 'Build 42 status and versioning (42.22)'
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - mod-info
  - registries-lua
  - project-structure
  - workshop-upload
  - debug-mode
excerpt: >-
  Which game version this wiki reads, which folder of your mod the game loads, how versionMin and versionMax decide if a mod is used, and what the server options say about multiplayer in 42.22.
last_updated: '2026-11-15'
related_articles:
  - mod-info-fields-and-the-versioning-compatibility-system
  - the-versioned-layout-common-build-folders
  - the-b42-mod-project-structure
  - media-registries-lua-the-new-b42-identifier-file
  - lua-folder-load-order
  - in-game-debug-mode-and-dev-tools
  - tl-dr-what-a-b41-modder-must-change-first
  - packaging-and-workshop-upload-for-b42
  - b41-b42-porting-what-breaks-a-concrete-checklist
  - kahlua-what-project-zomboid-lua-does-not-have
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#which-folder-of-your-mod-the-game-reads) | [server owners](#multiplayer-in-4222) | [anyone whose mod fails at world load](#when-a-mod-stops-a-world-from-loading)

:::callout[The 1-minute version]{kind=key}
- The capture this wiki reads reports itself as game version 42.22 :cite[(`zombie/core/Core.java:163`)].
- The game loads the highest-numbered folder of your mod that is at least `42.0` and not above the game version, plus `common`, and it lists a mod only when a `mod.info` is in `common` or in that folder.
- `versionMin` and `versionMax` in `mod.info` switch a mod off when the game version is outside them, and a mod that needs a switched-off mod is switched off too.
- A script-manager error or a sprite configuration error stops the world from loading with the message "World loading could not proceed, there are script load errors.", and with `-debug` any script error does.
- On a dedicated server, `Mods=` and `WorkshopItems=` are read as lists split on `;`, and `MaxPlayers` defaults to 32.
- No inventory anti-cheat check exists in the check list, and the `NoClip` and `PacketException` options are off by default.
:::

:::facts
- **Game version** 42.22
- **Lowest mod folder** `42.0`, so `42` or `42.1` and up
- **Default `MaxPlayers`** 32 (allowed 1 to 254)
- **Anti-cheat options** 10 options, 8 default to level 2, 2 default to 4 (off)
:::

## Which folder of your mod the game reads

The game picks one version folder of your mod, loads `common` under it, and lists the mod only when a `mod.info` exists in one of the two.

The engine asks for the highest folder name that is at least the minimum required version and not above the game version. A folder named `42` counts as 42000 and `42.22` as 42022, and a name that does not parse counts as 0. :cite[(`zombie/ZomboidFileSystem.java:470-486`, `zombie/ZomboidFileSystem.java:576-587`)] The minimum required version is 42.0. :cite[(`zombie/gameStates/ChooseGameInfo.java:45`, `zombie/gameStates/ChooseGameInfo.java:56-58`)]

A mod folder is listed only when `common/mod.info` or `<version folder>/mod.info` exists, and a folder named `examplemod` is refused. :cite[(`zombie/ZomboidFileSystem.java:493-498`)] When the game reads `mod.info` it tries the version folder first and falls back to `common`. :cite[(`zombie/gameStates/ChooseGameInfo.java:200-208`)]

So a Build 41 mod with its `mod.info` at the mod's top folder and no `common` or `42` folder is not listed by this code at all. The folder layout is explained in [The versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders) and [The Build 42 mod project structure](/pz/build-42/modding/foundations/the-b42-mod-project-structure).

## What versionMin and versionMax do

A mod is available only when the running game version is not below `versionMin` and not above `versionMax`, and it also needs every mod in its `require=` list to be available.

The check is `isAvailableSelf`: a `versionMin` above the game version, or a `versionMax` below it, makes the mod unavailable. :cite[(`zombie/gameStates/ChooseGameInfo.java:654-659`)] `isAvailableRequired` then walks the `require=` list and fails when a required mod is missing, unavailable, or itself needs one that is. :cite[(`zombie/gameStates/ChooseGameInfo.java:661-686`)]

The effect reaches your `registries.lua`. The loader runs a mod's registry file only for mods that `getAvailableModDetails` returns. :cite[(`zombie/scripting/objects/ModRegistries.java:16-19`, `zombie/gameStates/ChooseGameInfo.java:166-169`)] The same call is how several other loaders find a mod's files, among them the custom perks and the model manager. :cite[(`zombie/characters/skills/CustomPerks.java:37`, `zombie/core/skinnedmodel/ModelManager.java:1675`)]

Lua can read the game version with `getGameVersion` and a second version, 42.0, with `getBreakModGameVersion`. What the game uses that second value for was not verified. :cite[(`zombie/Lua/LuaManager.java:7234-7251`, `zombie/core/Core.java:2507-2509`)] The field-by-field list of `mod.info` is in [mod.info fields](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system).

## When a mod stops a world from loading

A script error stops the whole world load in some cases, and the message does not name the mod.

After the world's data loads, the game throws "World loading could not proceed, there are script load errors. (Actual error may be printed earlier in log)" when the script manager or the sprite configuration reports a load error. :cite[(`zombie/iso/IsoWorld.java:2461-2465`)] The check asks only for critical errors unless the game runs in debug mode, and no script type is critical, so without `-debug` an error inside one script type's bucket does not stop the load. :cite[(`zombie/iso/IsoWorld.java:2462`, `zombie/scripting/ScriptType.java:85-87`, `zombie/scripting/ScriptBucketCollection.java:161`)] An error that the script manager itself catches while loading, and a sprite configuration error, still stop it, and with `-debug` any script error does. :cite[(`zombie/scripting/ScriptManager.java:1796-1830`, `zombie/scripting/ScriptManager.java:1839-1851`)]

The message is the same for every mod, so the cause is in the log lines printed before it.

A way to find the mod that causes it is to turn mods off and on in halves until the error goes away, and to read the log the game writes. Starting the game with the `-debug` argument turns on its debug mode. :cite[(`zombie/gameStates/MainScreenState.java:242-243`)] The game writes `console.txt` in its cache directory, and its load-error screen shows that path. :cite[(`zombie/gameStates/GameLoadingState.java:613`)] The log packer also names `server-console.txt` for a dedicated server. :cite[(`zombie/core/logger/ZipLogs.java:67-71`)]

The game keeps a file `reset-mods-<version>.txt` in the `mods` folder of the cache directory. When that file does not exist for the release, the game writes it and empties the default mod list, so no mods are active. :cite[(`zombie/ZomboidFileSystem.java:1403-1422`, `zombie/GameWindow.java:965`)] Deleting that file therefore resets the default list on the next start. A mod that requires a framework mod fails when the framework is missing or unavailable, as described above. :cite[(`zombie/gameStates/ChooseGameInfo.java:661-686`)]

## The Lua runtime

The game runs mod Lua on the Kahlua library, a Java implementation of Lua, and the bridge between Lua and Java is built on it.

The Lua manager imports Kahlua's converter and caller classes, and it calls every Lua function through them. :cite[(`zombie/Lua/LuaManager.java:101-103`)] What this Lua lacks compared with stock Lua is in [What Project Zomboid Lua does not have](/pz/build-42/modding/lua-api/kahlua-what-project-zomboid-lua-does-not-have). Which Lua version Kahlua matches was not verified here.

## Multiplayer in 42.22

A dedicated server reads its mods from two option lines, and the anti-cheat suite has a fixed list of checks, two of which are off by default.

:::chips[The anti-cheat checks, by name]
Safety
HitVehicle
HitLongDistance
HitShortDistance
HitWeapon
PacketRakNet
PacketException
PacketType
XPUpdate
ChecksumUpdate
Target
PlayerUpdate
VehicleEnter
Power
Capability
SafeHouseOwner
SafeHouseMember
SafeHousePlayer
Speed
NoClip
:::

There is no inventory check in that list. :cite[(`zombie/network/anticheats/AntiCheat.java:29-49`)] Each check belongs to one server option, and a check is on unless its option is at level 4. In a hosted game, which the code calls coop, a check also needs the game to be started with the `-anti-cheats` argument. :cite[(`zombie/network/anticheats/AntiCheat.java:78-80`, `zombie/gameStates/MainScreenState.java:240-241`)] `AntiCheatNoClip` and `AntiCheatPacketException` default to 4, and the other eight options default to 2. :cite[(`zombie/network/ServerOptions.java:203-212`)] The checks themselves are described in [The anti-cheat checks](/pz/build-42/engine/anti-cheat/the-anti-cheat-checks), and what they mean for mods in [Anti-cheat and mods](/pz/build-42/engine/anti-cheat/anti-cheat-and-mods).

`MaxPlayers` takes 1 to 254 and defaults to 32. :cite[(`zombie/network/ServerOptions.java:80`)] The server reads `Mods=` after removing every backslash and then splitting on `;`, so a backslash in front of a mod id is tolerated and a comma is not a separator. :cite[(`zombie/network/GameServer.java:667-675`)] It reads `WorkshopItems=` split on `;` and keeps the entries that are valid Steam ids. :cite[(`zombie/network/GameServer.java:693-701`)]

A mod id is the `id=` line of `mod.info`, and a Workshop id is the number Steam gives the item. When an item is submitted, the game appends `Workshop ID:` and one `Mod ID:` line per mod to the description. :cite[(`zombie/core/znet/SteamWorkshopItem.java:170-182`)]

How the server runs a mod's timed actions and inventory moves is in [Timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network), and the whole connection picture is in [How multiplayer works](/pz/build-42/engine/networking-and-packets/how-multiplayer-works). The Lua side of a timed action is in [Timed actions](/pz/build-42/modding/lua-api/timed-actions).

:::callout[How we know]{kind=proof}
Every claim here is read from the 42.22 decompiled Java, and no game or server was run. Not verified: the release dates of the 42.x builds, whether a save from an earlier build loads in 42.22, whether Steam installs a Build 41 mod without a warning, why a mod shows red in the mod manager, whether the order of ids in `Mods=` matters for dependencies (the code read only splits and adds them), the in-game mod manager's presets and clipboard sharing, and what the second version from `getBreakModGameVersion` is used for.
:::
