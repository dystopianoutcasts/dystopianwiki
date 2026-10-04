---
slug: lua-events
title: 'Lua Events (Build 42.21)'
game: pz
version: build-42
section: modding
category: reference
difficulty: intermediate
tags:
  - lua-api
  - events
  - reference
  - generated
excerpt: 'Every Lua event in Build 42.21, generated from the code: where each one is fired, on which side, and with which arguments.'
last_updated: '2026-10-04'
related_articles:
  - lua-reference
  - lua-global-functions
  - lua-class-directory
  - lua-classes-characters-1
  - the-events-system
---
# Lua events in Build 42.21

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Outcast, events are how your mod hears about the game: you hand a function to `Events.OnSomething.Add(fn)` and the game calls it when it fires that event. This page lists every event Build 42.21 registers (262) and every other event name that the Java code or the vanilla Lua fires (19 more), with each place that fires it.

For each event you get:

- **Side:** where the call that fires it runs, counted per call site. "client" means wherever a player is playing; "server" means the multiplayer server; "single player only" means both multiplayer flags are off. "unknown" means the call has no multiplayer guard and its class does not settle it, so it may run on either side: we do not guess. The full rules are on [the reference index](/pz/build-42/modding/reference/lua-reference#which-side-fires-an-event).
- **Arguments:** the Java types at the call, and the variable name where the call passes a plain variable. A `?` is an expression whose type the extractor could not read from the declarations around the call.
- **When:** only where we read the call site and it makes the timing clear. Everywhere else the page says only where the event is fired from, and the method name is your best clue.
- **Fired from:** the class and method (Java) or the file and function (vanilla Lua), with the line in that build.

Of the 513 call sites, 307 have an unknown side; 132 events have no call site with a known side.

> **Proof:** Code. zombie.Lua.LuaEventManager#AddEvents, every LuaEventManager.triggerEvent call in the Java code, every triggerEvent call in media/lua. Build 42.21 (revision 4a0e9546ec).

## Game start, loading, saving and time

Events from the game states, the game window and the clock: boot, start, load, save, and the every-minute, every-hour and every-day ticks. (49 events)

### EveryDays

**Side:** unknown (1 call site). **Arguments:** none. **When:** Fired at the end of GameTime#advanceOneDay, after the calendar has moved to the new day.

- `GameTime#advanceOneDay` (Java, `zombie`, line 672): side unknown (no guard at the call, and the class does not decide it).

### EveryHours

**Side:** unknown (1 call site). **Arguments:** none. **When:** Fired by GameTime#update when the in-game hour has changed since the last update.

- `GameTime#update` (Java, `zombie`, line 618): side unknown (no guard at the call, and the class does not decide it).

### EveryOneMinute

**Side:** unknown (1 call site). **Arguments:** none. **When:** Fired by GameTime#update when the in-game minute has changed since the last update.

- `GameTime#update` (Java, `zombie`, line 650): side unknown (no guard at the call, and the class does not decide it).

### EveryTenMinutes

**Side:** unknown (1 call site). **Arguments:** none. **When:** Fired by GameTime#update when the in-game clock crosses a ten-minute mark, right after the erosion and climate ten-minute updates.

- `GameTime#update` (Java, `zombie`, line 644): side unknown (no guard at the call, and the class does not decide it).

### OnAcceptInvite

**Side:** unknown (1 call site). **Arguments (1):** `String connectionString`.

- `CallbackManager#onJoinRequest` (Java, `zombie.core.znet`, line 19): side unknown (no guard at the call, and the class does not decide it).

### OnConnected

**Side:** unknown (1 call site). **Arguments:** none. **When:** Fired on a client while it connects to a server, after the world dictionary has arrived from the server.

- `ConnectToServerState#receiveWorldDictionary` (Java, `zombie.gameStates`, line 172): side unknown (no guard at the call, and the class does not decide it).

### OnConnectFailed

**Side:** unknown at 8 call sites, client at 6 call sites, client (and single player) at 1 call site. **Arguments:** differ between call sites; see each site below.

- `UdpEngine#Connect` (Java, `zombie.core.raknet`, line 391): side unknown (no guard at the call, and the class does not decide it). Arguments: `?`.
- `UdpEngine#Connect` (Java, `zombie.core.raknet`, line 403): side unknown (no guard at the call, and the class does not decide it). Arguments: `?`.
- `ConnectToServerState#TestTCP` (Java, `zombie.gameStates`, line 197): side unknown (no guard at the call, and the class does not decide it). Arguments: `?`.
- `ConnectToServerState#WorkshopInit` (Java, `zombie.gameStates`, line 257): side unknown (no guard at the call, and the class does not decide it). Arguments: `?`.
- `ConnectToServerState#CheckMods` (Java, `zombie.gameStates`, line 403): side unknown (no guard at the call, and the class does not decide it). Arguments: `String errorMessage`.
- `ConnectToServerState#Finish` (Java, `zombie.gameStates`, line 483): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`.
- `ConnectToServerState#FromLua` (Java, `zombie.gameStates`, line 500): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`.
- `GameClient#update` (Java, `zombie.network`, line 344): client, multiplayer only; class: multiplayer client (GameClient). Arguments: `null`.
- `GameClient#update` (Java, `zombie.network`, line 348): client, multiplayer only; class: multiplayer client (GameClient). Arguments: `?`.
- `GameClient#update` (Java, `zombie.network`, line 365): client, multiplayer only; class: multiplayer client (GameClient). Arguments: `?`.
- `GameClient#update` (Java, `zombie.network`, line 368): client, multiplayer only; class: multiplayer client (GameClient). Arguments: `?`.
- `GameClient#update` (Java, `zombie.network`, line 371): client, multiplayer only; class: multiplayer client (GameClient). Arguments: `?`.
- `KickedPacket#processClient` (Java, `zombie.network.packets`, line 78): client, multiplayer only; class: packet method processClient. Arguments: `String message`.
- `AccessDeniedPacket#processClientLoading` (Java, `zombie.network.packets.service`, line 49): side unknown (no guard at the call, and the class does not decide it). Arguments: `String translation`.
- `OnServerWorkshopItems` in `media/lua/client/OptionScreens/ServerWorkshopItemScreen.lua` (Lua, line 236): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only. Arguments: `? error`, `? detail`.

### OnConnectionStateChanged

**Side:** unknown (4 call sites). **Arguments:** differ between call sites; see each site below.

- `RakNetPeerInterface#connectionStateChangedCallback` (Java, `zombie.core.raknet`, line 169): side unknown (no guard at the call, and the class does not decide it). Arguments: `String string`, `String message`.
- `UdpEngine#decode` (Java, `zombie.core.raknet`, line 264): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`, `String version`.
- `ConnectToServerState#receiveStartLocation` (Java, `zombie.gameStates`, line 113): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`.
- `QueuePacket#processClientLoading` (Java, `zombie.network.packets.connection`, line 166): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`, `String`, `?`.

### OnCreatePlayer

**Side:** unknown (3 call sites). **Arguments (2):** `int`, `?`. **When:** Fired when a player is set up: after the game finishes loading (GameLoadingState#exit, for player 0), from the global initUISystem, and when a split-screen player is added (AddCoopPlayer#update). Arguments: the player index, the player.

- `GameLoadingState#exit` (Java, `zombie.gameStates`, line 437): side unknown (no guard at the call, and the class does not decide it).
- `LuaManager.GlobalObject#initUISystem` (Java, `zombie.Lua`, line 3963): side unknown (no guard at the call, and the class does not decide it).
- `AddCoopPlayer#update` (Java, `zombie.util`, line 169): side unknown (no guard at the call, and the class does not decide it).

### OnFETick

**Side:** unknown (1 call site). **Arguments (1):** `Double`.

- `MainScreenState#update` (Java, `zombie.gameStates`, line 673): side unknown (no guard at the call, and the class does not decide it).

### OnGameBoot

**Side:** unknown at 3 call sites, server at 1 call site. **Arguments:** none. **When:** Fired after the Lua files are loaded: while the game starts up (GameWindow#enter), after a Lua reset (Core#ResetLua), when the in-game state is left (IngameState#exit), and on a dedicated server during start-up (GameServer#doMinimumInit).

- `Core#ResetLua` (Java, `zombie.core`, line 3969): side unknown (no guard at the call, and the class does not decide it).
- `IngameState#exit` (Java, `zombie.gameStates`, line 1086): side unknown (no guard at the call, and the class does not decide it).
- `GameWindow#enter` (Java, `zombie`, line 677): side unknown (no guard at the call, and the class does not decide it).
- `GameServer#doMinimumInit` (Java, `zombie.network`, line 1504): server, multiplayer only; class: server-side network class.

### OnGamepadConnect

**Side:** unknown (1 call site). **Arguments (1):** `?`.

- `Input#onControllerConnected` (Java, `zombie.core.input`, line 188): side unknown (no guard at the call, and the class does not decide it).

### OnGamepadDisconnect

**Side:** unknown (1 call site). **Arguments (1):** `?`.

- `Input#onControllerDisconnected` (Java, `zombie.core.input`, line 195): side unknown (no guard at the call, and the class does not decide it).

### OnGameStart

**Side:** unknown (1 call site). **Arguments:** none. **When:** Fired when the in-game state is entered (IngameState#enter), immediately before OnLoad.

- `IngameState#enter` (Java, `zombie.gameStates`, line 775): side unknown (no guard at the call, and the class does not decide it).

### OnGameStateEnter

**Side:** unknown (1 call site). **Arguments (1):** `TermsOfServiceState`.

- `TermsOfServiceState#enter` (Java, `zombie.gameStates`, line 22): side unknown (no guard at the call, and the class does not decide it).

### OnGameTimeLoaded

**Side:** unknown at 2 call sites, server at 1 call site. **Arguments:** none.

- `GameLoadingState#runInner` (Java, `zombie.gameStates`, line 319): side unknown (no guard at the call, and the class does not decide it).
- `GameServer#main` (Java, `zombie.network`, line 814): server, multiplayer only; class: server-side network class.
- `ConnectedPacket#parse` (Java, `zombie.network.packets.connection`, line 93): side unknown (no guard at the call, and the class does not decide it).

### OnInitGlobalModData

**Side:** unknown (1 call site). **Arguments (1):** `?`. **When:** Fired after the global mod data has been reset and loaded. The argument is true for a new game.

- `GlobalModData#init` (Java, `zombie.world.moddata`, line 61): side unknown (no guard at the call, and the class does not decide it).

### OnJoypadActivate

**Side:** unknown (2 call sites). **Arguments (1):** `?`.

- `GameWindow#logic` (Java, `zombie`, line 352): side unknown (no guard at the call, and the class does not decide it).
- `LuaManager.GlobalObject#activateJoypadOnSteamDeck` (Java, `zombie.Lua`, line 6456): side unknown (no guard at the call, and the class does not decide it).

### OnJoypadActivateUI

**Side:** unknown (3 call sites). **Arguments (1):** `?`.

- `GameWindow#logic` (Java, `zombie`, line 354): side unknown (no guard at the call, and the class does not decide it).
- `LuaManager.GlobalObject#activateJoypadOnSteamDeck` (Java, `zombie.Lua`, line 6458): side unknown (no guard at the call, and the class does not decide it).
- `LuaManager.GlobalObject#reactivateJoypadAfterResetLua` (Java, `zombie.Lua`, line 6468): side unknown (no guard at the call, and the class does not decide it).

### OnLoad

**Side:** unknown (1 call site). **Arguments:** none. **When:** Fired immediately after OnGameStart, from the same place.

- `IngameState#enter` (Java, `zombie.gameStates`, line 776): side unknown (no guard at the call, and the class does not decide it).

### OnLoadSoundBanks

**Side:** unknown (1 call site). **Arguments:** none.

- `GameWindow#init` (Java, `zombie`, line 1002): side unknown (no guard at the call, and the class does not decide it).

### OnMainMenuEnter

**Side:** unknown (2 call sites). **Arguments:** none.

- `Core#ResetLua` (Java, `zombie.core`, line 3970): side unknown (no guard at the call, and the class does not decide it).
- `MainScreenState#enter` (Java, `zombie.gameStates`, line 405): side unknown (no guard at the call, and the class does not decide it).

### OnPostRender

**Side:** unknown (1 call site). **Arguments:** none.

- `IngameState#renderFrameInternal` (Java, `zombie.gameStates`, line 1210): side unknown (no guard at the call, and the class does not decide it).

### OnPostSave

**Side:** unknown at 3 call sites, client at 1 call site. **Arguments:** none.

- `IngameState#updateInternal` (Java, `zombie.gameStates`, line 1389): side unknown (no guard at the call, and the class does not decide it).
- `IngameState#updateInternal` (Java, `zombie.gameStates`, line 1614): client, multiplayer only; guard: inside an if on !GameServer.server; guard: inside an if on GameClient.client.
- `GameWindow#exit` (Java, `zombie`, line 804): side unknown (no guard at the call, and the class does not decide it).
- `GameWindow#exit` (Java, `zombie`, line 812): side unknown (no guard at the call, and the class does not decide it).

### OnPreMapLoad

**Side:** unknown (1 call site). **Arguments:** none.

- `GameLoadingState#enter` (Java, `zombie.gameStates`, line 240): side unknown (no guard at the call, and the class does not decide it).

### OnProcessAction

**Side:** unknown (1 call site). **Arguments (3):** `String`, `?`, `KahluaTable this.argTable`.

- `BuildAction#perform` (Java, `zombie.core`, line 123): side unknown (no guard at the call, and the class does not decide it).

### OnProcessTransaction

**Side:** unknown (5 call sites). **Arguments (6):** `String`, `?`, `null`, `?`, `?`, `null`.

- `Transaction#updateItem` (Java, `zombie.core`, line 144): side unknown (no guard at the call, and the class does not decide it).
- `Transaction#updateItem` (Java, `zombie.core`, line 147): side unknown (no guard at the call, and the class does not decide it).
- `Transaction#updateItem` (Java, `zombie.core`, line 152): side unknown (no guard at the call, and the class does not decide it).
- `Transaction#updateItem` (Java, `zombie.core`, line 193): side unknown (no guard at the call, and the class does not decide it).
- `Transaction#updateItem` (Java, `zombie.core`, line 208): side unknown (no guard at the call, and the class does not decide it).

### OnRenderTick

**Side:** unknown (1 call site). **Arguments:** none.

- `GameWindow#onRender` (Java, `zombie`, line 769): side unknown (no guard at the call, and the class does not decide it).

### OnResetLua

**Side:** unknown (1 call site). **Arguments (1):** `String reason`.

- `Core#ResetLua` (Java, `zombie.core`, line 3971): side unknown (no guard at the call, and the class does not decide it).

### OnResolutionChange

**Side:** unknown (1 call site). **Arguments (4):** `int oldWidth`, `int oldHeight`, `int width`, `int height`.

- `Core#setScreenSize` (Java, `zombie.core`, line 2245): side unknown (no guard at the call, and the class does not decide it).

### OnSave

**Side:** unknown (2 call sites). **Arguments:** none.

- `GameWindow#save` (Java, `zombie`, line 1027): side unknown (no guard at the call, and the class does not decide it).
- `GameWindow#save` (Java, `zombie`, line 1054): side unknown (no guard at the call, and the class does not decide it).

### OnServerWorkshopItems

**Side:** unknown (6 call sites). **Arguments:** differ between call sites; see each site below.

- `ConnectToServerState#WorkshopConfirm` (Java, `zombie.gameStates`, line 309): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`, `ArrayList<String> itemIDstr`.
- `ConnectToServerState#WorkshopConfirm` (Java, `zombie.gameStates`, line 316): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`, `ArrayList<SteamUGCDetails> details`.
- `ConnectToServerState#WorkshopQuery` (Java, `zombie.gameStates`, line 330): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`, `String`.
- `ConnectToServerState#WorkshopUpdate` (Java, `zombie.gameStates`, line 363): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`, `?`, `?`.
- `ConnectToServerState#WorkshopUpdate` (Java, `zombie.gameStates`, line 373): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`.
- `ConnectToServerState.WorkshopItem#DownloadPending` (Java, `zombie.gameStates`, line 713): side unknown (no guard at the call, and the class does not decide it). Arguments: `String`, `?`, `?`, `?`.

### OnSleepingTick

**Side:** client (and single player) (1 call site). **Arguments (2):** `Double`, `Double`.

- `IngameState#renderFrameUI` (Java, `zombie.gameStates`, line 1268): client, and in single player; guard: inside an if on !GameServer.server.

### OnSteamFriendStatusChanged

**Side:** unknown (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/OptionScreens/InviteFriends.lua` calls `LuaEventManager.AddEvent`. **Arguments (1):** `?`.

- `SteamFriends#onStatusChangedCallback` (Java, `zombie.core.znet`, line 82): side unknown (no guard at the call, and the class does not decide it).

### OnSteamGameJoin

**Side:** unknown (1 call site). **Arguments:** none.

- `SteamUtils#joinRequestCallback` (Java, `zombie.core.znet`, line 218): side unknown (no guard at the call, and the class does not decide it).

### OnSteamRefreshInternetServers

**Side:** unknown (1 call site). **Arguments:** none.

- `ServerBrowser#onRefreshCompleteCallback` (Java, `zombie.core.znet`, line 203): side unknown (no guard at the call, and the class does not decide it).

### OnSteamRulesRefreshComplete

**Side:** unknown (1 call site). **Arguments (3):** `String host`, `double`, `KahluaTable rulesTable`.

- `ServerBrowser#onRulesRefreshComplete` (Java, `zombie.core.znet`, line 244): side unknown (no guard at the call, and the class does not decide it).

### OnSteamServerFailedToRespond2

**Side:** unknown (1 call site). **Arguments (2):** `String host`, `double`.

- `ServerBrowser#onServerFailedToRespondCallback` (Java, `zombie.core.znet`, line 228): side unknown (no guard at the call, and the class does not decide it).

### OnSteamServerResponded

**Side:** unknown (1 call site). **Arguments (1):** `int serverIndex`.

- `ServerBrowser#onServerRespondedCallback` (Java, `zombie.core.znet`, line 187): side unknown (no guard at the call, and the class does not decide it).

### OnSteamServerResponded2

**Side:** unknown (1 call site). **Arguments (3):** `String host`, `double`, `Server newServer`.

- `ServerBrowser#onServerRespondedCallback` (Java, `zombie.core.znet`, line 217): side unknown (no guard at the call, and the class does not decide it).

### OnSteamWorkshopItemCreated

**Side:** client (and single player) at 1 call site, unknown at 1 call site. **Registered by vanilla Lua,** not at start-up: `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua` calls `LuaEventManager.AddEvent`. **Arguments (2):** `string`, `boolean`.

- `SteamWorkshop#onItemCreated` (Java, `zombie.core.znet`, line 295): side unknown (no guard at the call, and the class does not decide it).
- `Page7:updateWhenVisible` in `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua` (Lua, line 1072): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnSteamWorkshopItemNotCreated

**Side:** unknown (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua` calls `LuaEventManager.AddEvent`. **Arguments (1):** `int result`.

- `SteamWorkshop#onItemNotCreated` (Java, `zombie.core.znet`, line 300): side unknown (no guard at the call, and the class does not decide it).

### OnSteamWorkshopItemNotUpdated

**Side:** unknown (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua` calls `LuaEventManager.AddEvent`. **Arguments (1):** `int result`.

- `SteamWorkshop#onItemNotUpdated` (Java, `zombie.core.znet`, line 310): side unknown (no guard at the call, and the class does not decide it).

### OnSteamWorkshopItemUpdated

**Side:** client (and single player) at 1 call site, unknown at 1 call site. **Registered by vanilla Lua,** not at start-up: `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua` calls `LuaEventManager.AddEvent`. **Arguments (1):** `boolean bUserNeedsToAcceptWorkshopLegalAgreement`.

- `SteamWorkshop#onItemUpdated` (Java, `zombie.core.znet`, line 305): side unknown (no guard at the call, and the class does not decide it).
- `Page7:updateWhenVisible` in `media/lua/client/OptionScreens/WorkshopSubmitScreen.lua` (Lua, line 1098): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnTick

**Side:** unknown (1 call site). **Arguments (1):** `Double`. **When:** Fired from IngameState#onTick, which the in-game update calls. The argument is the tick counter as a number.

- `IngameState#onTick` (Java, `zombie.gameStates`, line 1663): side unknown (no guard at the call, and the class does not decide it).

### OnTickEvenPaused

**Side:** unknown (2 call sites). **Arguments (1):** `Double`.

- `IngameState#updateInternal` (Java, `zombie.gameStates`, line 1356): side unknown (no guard at the call, and the class does not decide it).
- `GameWindow#logic` (Java, `zombie`, line 374): side unknown (no guard at the call, and the class does not decide it).

### OptionControllerButtonStyleChanged

**Side:** unknown (1 call site). **Arguments (1):** `?`.

- `Core#onOptionControllerButtonStyleChanged` (Java, `zombie.core`, line 3730): side unknown (no guard at the call, and the class does not decide it).

### OptionGamepadBindingPresetChanged

**Side:** unknown (1 call site). **Arguments (1):** `?`.

- `Core#onOptionGamepadBindingPresetChanged` (Java, `zombie.core`, line 3745): side unknown (no guard at the call, and the class does not decide it).

### SwitchChatStream

**Side:** unknown (1 call site). **Arguments:** none.

- `Core#updateKeyboardAux` (Java, `zombie.core`, line 2034): side unknown (no guard at the call, and the class does not decide it).

## Characters, players and zombies

Events fired from the character classes: updates, damage, death, skills and XP, clothing and equipment. (33 events)

### AddXP

**Side:** server (and single player) (1 call site). **Arguments (3):** `IsoGameCharacter this.chr`, `Perk type`, `float amount`. **When:** Fired when XP is added to a character, on the multiplayer server and in single player; a multiplayer client never fires it (the call sits inside `if (!GameClient.client)`). Arguments: the character, the perk, the amount.

- `IsoGameCharacter.XP#AddXP` (Java, `zombie.characters`, line 17616): server, and in single player; guard: inside an if on !GameClient.client.

### GrappleGrabCollisionCheck

**Side:** unknown (1 call site). **Not registered at start-up.** The game creates the event the first time something fires it, so a handler added before that is attached by name only once it exists. **Arguments (2):** `IsoGameCharacter owner`, `HandWeapon weapon`.

- `SwipeStatePlayer#GrappleGrabCollisionCheck` (Java, `zombie.ai.states`, line 493): side unknown (no guard at the call, and the class does not decide it).

### GrapplerLetGo

**Side:** unknown (1 call site). **Not registered at start-up.** The game creates the event the first time something fires it, so a handler added before that is attached by name only once it exists. **Arguments (2):** `IsoGameCharacter owner`, `String grappleResult`.

- `IsoGameCharacter#OnAnimEvent_GrapplerLetGo` (Java, `zombie.characters`, line 1147): side unknown (no guard at the call, and the class does not decide it).

### LevelPerk

**Side:** unknown (4 call sites). **Arguments (4):** `IsoGameCharacter`, `Perk perk`, `int`, `boolean`. **When:** Fired when a perk level changes: the last argument is true when the level went up (IsoGameCharacter#LevelPerk) and false when it went down (IsoGameCharacter#LoseLevel). Arguments: the character, the perk, the new level, the up flag.

- `IsoGameCharacter#LoseLevel` (Java, `zombie.characters`, line 4796): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#LoseLevel` (Java, `zombie.characters`, line 4801): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#LevelPerk` (Java, `zombie.characters`, line 4827): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#LevelPerk` (Java, `zombie.characters`, line 4840): side unknown (no guard at the call, and the class does not decide it).

### LogLevelPerk

**Side:** unknown (1 call site). **Arguments (4):** `IsoGameCharacter this.chr`, `Perk p`, `int level`, `boolean`. **When:** New in 42.21. Fired while a character's XP is being loaded, once for each perk whose loaded level differs from the level it had before loading. Arguments: the character, the perk, the level, false.

- `IsoGameCharacter.XP#load` (Java, `zombie.characters`, line 17691): side unknown (no guard at the call, and the class does not decide it).

### OnAIStateChange

**Side:** unknown (1 call site). **Arguments (3):** `?`, `State this.currentState`, `State this.previousState`.

- `StateMachine#changeRootState` (Java, `zombie.ai`, line 73): side unknown (no guard at the call, and the class does not decide it).

### OnCharacterDeath

**Side:** unknown (2 call sites). **Arguments (1):** `IsoAnimal`. **When:** Fired from a character's OnDeath, for characters (IsoGameCharacter#OnDeath) and for animals (IsoAnimal#OnDeath), with the character that died.

- `IsoAnimal#OnDeath` (Java, `zombie.characters.animals`, line 1149): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#OnDeath` (Java, `zombie.characters`, line 4881): side unknown (no guard at the call, and the class does not decide it).

### OnClothingUpdated

**Side:** unknown at 18 call sites, client (and single player) at 14 call sites, client at 9 call sites, server (and single player) at 1 call site. **Arguments (1):** `IsoGameCharacter`.

- `IsoGameCharacter#onTrigger_setClothingToXmlTriggerFile` (Java, `zombie.characters`, line 1827): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#onTrigger_setClothingToXmlTriggerFile` (Java, `zombie.characters`, line 1846): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#setAttachedItem` (Java, `zombie.characters`, line 3581): client, and in single player; guard: inside an if on !GameServer.server.
- `IsoGameCharacter#helmetFall` (Java, `zombie.characters`, line 8244): server, and in single player; guard: after an early return, so !GameClient.client; guard: in the else branch, so !GameClient.client.
- `IsoGameCharacter#updateBeardAndHair` (Java, `zombie.characters`, line 9408): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#addBasicPatch` (Java, `zombie.characters`, line 13016): client, and in single player; guard: inside an if on !GameServer.server.
- `IsoGameCharacter#addHole` (Java, `zombie.characters`, line 13039): client, and in single player; guard: inside an if on !GameServer.server.
- `IsoGameCharacter#addDirt` (Java, `zombie.characters`, line 13070): client, and in single player; guard: inside an if on !GameServer.server.
- `IsoGameCharacter#addLotsOfDirt` (Java, `zombie.characters`, line 13099): client, and in single player; guard: inside an if on !GameServer.server.
- `IsoGameCharacter#addBlood` (Java, `zombie.characters`, line 13150): client, and in single player; guard: inside an if on !GameServer.server.
- `Transaction#updateItem` (Java, `zombie.core`, line 202): side unknown (no guard at the call, and the class does not decide it).
- `Transaction#updateItem` (Java, `zombie.core`, line 282): side unknown (no guard at the call, and the class does not decide it).
- `Clothing#Unwear` (Java, `zombie.inventory.types`, line 127): side unknown (no guard at the call, and the class does not decide it).
- `GameClient#receiveInvMngRemoveItem` (Java, `zombie.network`, line 680): client, multiplayer only; class: multiplayer client (GameClient).
- `GameClient#receiveInvMngRemoveItem` (Java, `zombie.network`, line 685): client, multiplayer only; class: multiplayer client (GameClient).
- `GameClient#receiveInvMngRemoveItem` (Java, `zombie.network`, line 688): client, multiplayer only; class: multiplayer client (GameClient).
- `GameClient#receiveInvMngReqItem` (Java, `zombie.network`, line 738): client, multiplayer only; class: multiplayer client (GameClient).
- `GameClient#receiveInvMngReqItem` (Java, `zombie.network`, line 743): client, multiplayer only; class: multiplayer client (GameClient).
- `GameClient#receiveInvMngReqItem` (Java, `zombie.network`, line 746): client, multiplayer only; class: multiplayer client (GameClient).
- `SyncClothingPacket#processClient` (Java, `zombie.network.packets`, line 233): client, multiplayer only; class: packet method processClient.
- `ZombieHelmetFallingPacket#processClient` (Java, `zombie.network.packets`, line 157): client, multiplayer only; class: packet method processClient.
- `ISDebugBlood:onSliderChange` in `media/lua/client/DebugUIs/DebugMenu/General/ISDebugBlood.lua` (Lua, line 74): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISDebugBlood:onZeroAll` in `media/lua/client/DebugUIs/DebugMenu/General/ISDebugBlood.lua` (Lua, line 81): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISDebugBlood:onRandomBlood` in `media/lua/client/DebugUIs/DebugMenu/General/ISDebugBlood.lua` (Lua, line 88): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISRemoveItemTool.removeItem` in `media/lua/client/DebugUIs/ISRemoveItemTool.lua` (Lua, line 318): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISMakeUpUI:updateAvatar` in `media/lua/client/ISUI/ISMakeUpUI.lua` (Lua, line 308): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISMakeUpUI:close` in `media/lua/client/ISUI/ISMakeUpUI.lua` (Lua, line 369): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISMakeUpUI:close` in `media/lua/client/ISUI/ISMakeUpUI.lua` (Lua, line 374): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISClothingExtraAction:complete` in `media/lua/shared/TimedActions/ISClothingExtraAction.lua` (Lua, line 148): side unknown (no guard at the call, and the class does not decide it).
- `ISCutHair:perform` in `media/lua/shared/TimedActions/ISCutHair.lua` (Lua, line 39): side unknown (no guard at the call, and the class does not decide it).
- `ISDyeHair:complete` in `media/lua/shared/TimedActions/ISDyeHair.lua` (Lua, line 50): side unknown (no guard at the call, and the class does not decide it).
- `ISEquipWeaponAction:complete` in `media/lua/shared/TimedActions/ISEquipWeaponAction.lua` (Lua, line 167): side unknown (no guard at the call, and the class does not decide it).
- `ISEquipWeaponAction:complete` in `media/lua/shared/TimedActions/ISEquipWeaponAction.lua` (Lua, line 172): side unknown (no guard at the call, and the class does not decide it).
- `ISEquipWeaponAction:complete` in `media/lua/shared/TimedActions/ISEquipWeaponAction.lua` (Lua, line 179): side unknown (no guard at the call, and the class does not decide it).
- `ISRemovePatch:perform` in `media/lua/shared/TimedActions/ISRemovePatch.lua` (Lua, line 70): side unknown (no guard at the call, and the class does not decide it).
- `ISTransferAction:removeItemOnCharacter` in `media/lua/shared/TimedActions/ISTransferAction.lua` (Lua, line 91): side unknown (no guard at the call, and the class does not decide it).
- `ISTrimBeard:perform` in `media/lua/shared/TimedActions/ISTrimBeard.lua` (Lua, line 35): client, multiplayer only; guard: inside an if on isClient().
- `ISTrimBeard:complete` in `media/lua/shared/TimedActions/ISTrimBeard.lua` (Lua, line 64): client, and in single player; guard: inside an if on not isServer().
- `ISUnequipAction:perform` in `media/lua/shared/TimedActions/ISUnequipAction.lua` (Lua, line 97): side unknown (no guard at the call, and the class does not decide it).
- `ISUnequipAction:complete` in `media/lua/shared/TimedActions/ISUnequipAction.lua` (Lua, line 132): side unknown (no guard at the call, and the class does not decide it).
- `ISWashClothing:perform` in `media/lua/shared/TimedActions/ISWashClothing.lua` (Lua, line 187): side unknown (no guard at the call, and the class does not decide it).
- `ISWearClothing:perform` in `media/lua/shared/TimedActions/ISWearClothing.lua` (Lua, line 92): side unknown (no guard at the call, and the class does not decide it).

### OnContainerUpdate

**Side:** unknown at 34 call sites, client at 6 call sites, server (and single player) at 5 call sites, client (and single player) at 4 call sites, single player only at 2 call sites. **Arguments:** differ between call sites; see each site below.

- `IsoGameCharacter#dropHandItems` (Java, `zombie.characters`, line 11300): server, and in single player; guard: inside an if on !GameClient.client. Arguments: none.
- `IsoGameCharacter#dropHandItems` (Java, `zombie.characters`, line 11317): server, and in single player; guard: inside an if on !GameClient.client. Arguments: none.
- `IsoGameCharacter#dropHeavyItems` (Java, `zombie.characters`, line 14204): server, and in single player; guard: inside an if on !GameClient.client. Arguments: none.
- `IsoGameCharacter#dropHeavyItems` (Java, `zombie.characters`, line 14221): server, and in single player; guard: inside an if on !GameClient.client. Arguments: none.
- `IsoPlayer#checkVehicleContainers` (Java, `zombie.characters`, line 7407): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoPlayer#checkVehicleContainers` (Java, `zombie.characters`, line 7416): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `InventoryItem#update` (Java, `zombie.inventory`, line 1438): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `Clothing#Unwear` (Java, `zombie.inventory.types`, line 137): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `Food#updateRotting` (Java, `zombie.inventory.types`, line 689): single player only; guard: inside an if on !GameClient.client; guard: inside an if on !GameServer.server. Arguments: none.
- `Food#updateAge` (Java, `zombie.inventory.types`, line 785): client, and in single player; guard: inside an if on !GameServer.server. Arguments: `Food`.
- `Food#destroyThisItem` (Java, `zombie.inventory.types`, line 2355): client, and in single player; guard: inside an if on !GameServer.server. Arguments: none.
- `IsoGridSquare#removeCorpse` (Java, `zombie.iso`, line 3037): client, and in single player; guard: inside an if on !GameServer.server. Arguments: `IsoGridSquare`.
- `IsoObject#loadChange` (Java, `zombie.iso`, line 4837): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoCombinationWasherDryer#setModeWasher` (Java, `zombie.iso.objects`, line 132): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoCombinationWasherDryer#setModeDryer` (Java, `zombie.iso.objects`, line 142): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoCurtain#syncIsoObject` (Java, `zombie.iso.objects`, line 427): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoDeadBody#IsoDeadBody` (Java, `zombie.iso.objects`, line 419): client, and in single player; guard: inside an if on !GameServer.server. Arguments: `IsoDeadBody`.
- `IsoDeadBody#reanimate` (Java, `zombie.iso.objects`, line 2061): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoDoor#WeaponHit` (Java, `zombie.iso.objects`, line 1383): server, and in single player; guard: in the else branch, so !GameClient.client. Arguments: none.
- `IsoDoor#ToggleDoorActual` (Java, `zombie.iso.objects`, line 1631): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoDoor#syncIsoObject` (Java, `zombie.iso.objects`, line 1876): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoDoor#toggleDoubleDoor` (Java, `zombie.iso.objects`, line 2807): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoDoor#destroyDoubleDoor` (Java, `zombie.iso.objects`, line 3214): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoDoor#toggleGarageDoor` (Java, `zombie.iso.objects`, line 3400): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoDoor#destroyGarageDoor` (Java, `zombie.iso.objects`, line 3504): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoFallingClothing#drop` (Java, `zombie.iso.objects`, line 133): side unknown (no guard at the call, and the class does not decide it). Arguments: `IsoGridSquare square`.
- `IsoFeedingTrough#setContainer` (Java, `zombie.iso.objects`, line 211): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoThumpable#ToggleDoorActual` (Java, `zombie.iso.objects`, line 1326): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoThumpable#syncIsoObjectReceive` (Java, `zombie.iso.objects`, line 1911): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoTree#toppleTree` (Java, `zombie.iso.objects`, line 861): single player only; guard: inside an if on !GameClient.client; guard: inside an if on !GameServer.server. Arguments: none.
- `IsoWindow#ToggleWindow` (Java, `zombie.iso.objects`, line 769): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoWindow#syncIsoObjectReceive` (Java, `zombie.iso.objects`, line 815): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `IsoWorldInventoryObject#swapItem` (Java, `zombie.iso.objects`, line 156): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `VehiclePartDoor#parse` (Java, `zombie.network.fields.vehicle`, line 76): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `VehiclePartItem#parse` (Java, `zombie.network.fields.vehicle`, line 47): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `AddItemToMapPacket#processClient` (Java, `zombie.network.packets`, line 98): client, multiplayer only; class: packet method processClient. Arguments: `IsoObject this.obj`.
- `RemoveItemFromSquarePacket#processClient` (Java, `zombie.network.packets`, line 99): client, multiplayer only; class: packet method processClient. Arguments: `IsoObject o`.
- `ReceiveContainerModDataPacket#processClient` (Java, `zombie.network.packets.service`, line 82): client, multiplayer only; class: packet method processClient. Arguments: none.
- `SyncItemFieldsPacket#processClient` (Java, `zombie.network.packets`, line 515): client, multiplayer only; class: packet method processClient. Arguments: none.
- `BaseVehicle#enterRSync` (Java, `zombie.vehicles`, line 2537): client, multiplayer only; guard: inside an if on GameClient.client. Arguments: none.
- `BaseVehicle#exitRSync` (Java, `zombie.vehicles`, line 2594): client, multiplayer only; guard: inside an if on GameClient.client. Arguments: none.
- `forageSystem.addOrDropItems` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 1672): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `OnBreak.HandleHandler` in `media/lua/shared/Items/OnBreak.lua` (Lua, line 47): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `OnBreak.HeadHandler` in `media/lua/shared/Items/OnBreak.lua` (Lua, line 126): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `OnBreak.GroundHandler` in `media/lua/shared/Items/OnBreak.lua` (Lua, line 178): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `ISMoveableSpriteProps:pickUpMoveableInternal` in `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (Lua, line 1528): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `ISMoveableSpriteProps:placeMoveableInternal` in `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (Lua, line 2563): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `ISBBQInsertPropaneTank:complete` in `media/lua/shared/TimedActions/ISBBQInsertPropaneTank.lua` (Lua, line 58): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `ISBBQRemovePropaneTank:complete` in `media/lua/shared/TimedActions/ISBBQRemovePropaneTank.lua` (Lua, line 48): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `ISCloseVehicleDoor:complete` in `media/lua/shared/Vehicles/TimedActions/ISCloseVehicleDoor.lua` (Lua, line 66): side unknown (no guard at the call, and the class does not decide it). Arguments: none.
- `ISOpenVehicleDoor:complete` in `media/lua/shared/Vehicles/TimedActions/ISOpenVehicleDoor.lua` (Lua, line 79): side unknown (no guard at the call, and the class does not decide it). Arguments: none.

### OnContextKey

**Side:** unknown (2 call sites). **Arguments (2):** `IsoPlayer`, `Double`.

- `IsoPlayer#doContext` (Java, `zombie.characters`, line 4760): side unknown (no guard at the call, and the class does not decide it).
- `IsoPlayer#doContext` (Java, `zombie.characters`, line 4857): side unknown (no guard at the call, and the class does not decide it).

### OnCoopJoinFailed

**Side:** unknown (1 call site). **Arguments (1):** `int playerIndex`.

- `AddCoopPlayer#accessDenied` (Java, `zombie.util`, line 208): side unknown (no guard at the call, and the class does not decide it).

### OnCreateLivingCharacter

**Side:** unknown (3 call sites). **Arguments (2):** `IsoPlayer`, `? this.descriptor`.

- `IsoPlayer#IsoPlayer` (Java, `zombie.characters`, line 564): side unknown (no guard at the call, and the class does not decide it).
- `IsoPlayer#IsoPlayer` (Java, `zombie.characters`, line 646): side unknown (no guard at the call, and the class does not decide it).
- `IsoSurvivor#IsoSurvivor` (Java, `zombie.characters`, line 64): side unknown (no guard at the call, and the class does not decide it).

### OnCreateSurvivor

**Side:** unknown (3 call sites). **Arguments (1):** `IsoSurvivor`.

- `IsoSurvivor#IsoSurvivor` (Java, `zombie.characters`, line 47): side unknown (no guard at the call, and the class does not decide it).
- `IsoSurvivor#IsoSurvivor` (Java, `zombie.characters`, line 63): side unknown (no guard at the call, and the class does not decide it).
- `IsoSurvivor#IsoSurvivor` (Java, `zombie.characters`, line 86): side unknown (no guard at the call, and the class does not decide it).

### OnEquipPrimary

**Side:** unknown (1 call site). **Arguments (2):** `IsoGameCharacter`, `InventoryItem leftHandItem`. **When:** Fired when a character's primary hand item is set, with the character and the new item.

- `IsoGameCharacter#setPrimaryHandItem` (Java, `zombie.characters`, line 3380): side unknown (no guard at the call, and the class does not decide it).

### OnEquipSecondary

**Side:** unknown (1 call site). **Arguments (2):** `IsoGameCharacter`, `InventoryItem rightHandItem`.

- `IsoGameCharacter#setSecondaryHandItem` (Java, `zombie.characters`, line 3746): side unknown (no guard at the call, and the class does not decide it).

### OnExitVehicle

**Side:** client at 1 call site, client (and single player) at 1 call site, unknown at 1 call site. **Registered by vanilla Lua,** not at start-up: `media/lua/client/Vehicles/ISUI/ISVehicleDashboard.lua` calls `LuaEventManager.AddEvent`. **Arguments (1):** `IsoGameCharacter`.

- `IsoGameCharacter#ensureNotInVehicle` (Java, `zombie.characters`, line 16736): side unknown (no guard at the call, and the class does not decide it).
- `TeleportPacket#processClient` (Java, `zombie.network.packets`, line 72): client, multiplayer only; class: packet method processClient.
- `ISExitVehicle:perform` in `media/lua/client/Vehicles/TimedActions/ISExitVehicle.lua` (Lua, line 62): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnHitZombie

**Side:** unknown (1 call site). **Arguments (4):** `IsoZombie`, `IsoGameCharacter wielder`, `BodyPartType bodyPart`, `HandWeapon weapon`. **When:** Fired when a zombie is hit. Arguments: the zombie, the attacker, the body part hit, the weapon.

- `IsoZombie#Hit` (Java, `zombie.characters`, line 1362): side unknown (no guard at the call, and the class does not decide it).

### onItemFall

**Side:** unknown (4 call sites). **Arguments (1):** `InventoryItem item1`.

- `IsoGameCharacter#dropHandItems` (Java, `zombie.characters`, line 11303): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#dropHandItems` (Java, `zombie.characters`, line 11320): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#dropHeavyItems` (Java, `zombie.characters`, line 14207): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#dropHeavyItems` (Java, `zombie.characters`, line 14224): side unknown (no guard at the call, and the class does not decide it).

### OnMechanicActionDone

**Side:** unknown (1 call site). **Arguments (2):** `IsoGameCharacter`, `boolean success`.

- `IsoGameCharacter#loadChange` (Java, `zombie.characters`, line 10648): side unknown (no guard at the call, and the class does not decide it).

### OnMiniScoreboardUpdate

**Side:** client at 2 call sites, unknown at 1 call site. **Arguments:** none.

- `IsoPlayer#setPlayerStats` (Java, `zombie.characters`, line 7521): client, multiplayer only; guard: inside an if on GameClient.client.
- `GameClient#receivePlayerTimeout` (Java, `zombie.network`, line 1676): client, multiplayer only; class: multiplayer client (GameClient).
- `ConnectedPacket#parse` (Java, `zombie.network.packets.connection`, line 219): side unknown (no guard at the call, and the class does not decide it).

### OnPlayerAttackFinished

**Side:** unknown (1 call site). **Arguments (2):** `IsoGameCharacter owner`, `HandWeapon weapon`.

- `SwipeStatePlayer#exit` (Java, `zombie.ai.states`, line 475): side unknown (no guard at the call, and the class does not decide it).

### OnPlayerDeath

**Side:** client (and single player) (1 call site). **Arguments (1):** `IsoPlayer`. **When:** Fired when a local player dies (the call sits inside `if (this.isLocalPlayer())` in IsoPlayer#OnDeath), with that player.

- `IsoPlayer#OnDeath` (Java, `zombie.characters`, line 6576): client, and in single player; guard: inside an if on !GameServer.server.

### OnPlayerGetDamage

**Side:** unknown at 16 call sites, server (and single player) at 1 call site. **Arguments (3):** `IsoGameCharacter this.parentChar`, `String`, `float poisonDamage`.

- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2318): side unknown (no guard at the call, and the class does not decide it).
- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2322): side unknown (no guard at the call, and the class does not decide it).
- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2326): side unknown (no guard at the call, and the class does not decide it).
- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2330): side unknown (no guard at the call, and the class does not decide it).
- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2334): side unknown (no guard at the call, and the class does not decide it).
- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2338): side unknown (no guard at the call, and the class does not decide it).
- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2369): side unknown (no guard at the call, and the class does not decide it).
- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2382): side unknown (no guard at the call, and the class does not decide it).
- `BodyDamage#Update` (Java, `zombie.characters.BodyDamage`, line 2390): side unknown (no guard at the call, and the class does not decide it).
- `BodyPart#DamageUpdate` (Java, `zombie.characters.BodyDamage`, line 175): side unknown (no guard at the call, and the class does not decide it).
- `Nutrition#setWeight` (Java, `zombie.characters.BodyDamage`, line 342): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#handleLandingImpact` (Java, `zombie.characters`, line 2485): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#FireCheck` (Java, `zombie.characters`, line 5948): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#Hit` (Java, `zombie.characters`, line 6092): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#ReduceHealthWhenBurning` (Java, `zombie.characters`, line 6450): side unknown (no guard at the call, and the class does not decide it).
- `IsoPlayer#onHitByVehicleApplyDamage` (Java, `zombie.characters`, line 2000): side unknown (no guard at the call, and the class does not decide it).
- `BaseVehicle#damagePlayers` (Java, `zombie.vehicles`, line 9460): server, and in single player; guard: inside an if on !GameClient.client; guard: inside an if on !GameClient.client.

### OnPlayerMove

**Side:** server at 1 call site, single player only at 1 call site. **Arguments (1):** `IsoPlayer`. **When:** Fired from a player's update in single player only (both multiplayer flags false), and on the multiplayer server for a remote player who has just moved.

- `IsoPlayer#updateInternal2` (Java, `zombie.characters`, line 2237): single player only; guard: inside an if on !GameServer.server and !GameClient.client.
- `IsoPlayer#updateRemotePlayer` (Java, `zombie.characters`, line 6776): server, multiplayer only; guard: inside an if on GameServer.server.

### OnPlayerUpdate

**Side:** unknown (1 call site). **Arguments (1):** `IsoPlayer`. **When:** Fired during a player's update, with that player.

- `IsoPlayer#updateInternal2` (Java, `zombie.characters`, line 2293): side unknown (no guard at the call, and the class does not decide it).

### OnPressRackButton

**Side:** unknown (1 call site). **Arguments (3):** `IsoPlayer`, `HandWeapon weapon`, `?`.

- `IsoPlayer#checkReloading` (Java, `zombie.characters`, line 3507): side unknown (no guard at the call, and the class does not decide it).

### OnPressReloadButton

**Side:** unknown (1 call site). **Arguments (2):** `IsoPlayer`, `HandWeapon weapon`.

- `IsoPlayer#checkReloading` (Java, `zombie.characters`, line 3504): side unknown (no guard at the call, and the class does not decide it).

### OnPressWalkTo

**Side:** unknown (1 call site). **Arguments (3):** `int`, `int`, `int`.

- `IsoPlayer#checkWalkTo` (Java, `zombie.characters`, line 6385): side unknown (no guard at the call, and the class does not decide it).

### OnUseVehicle

**Side:** unknown (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/server/Vehicles/Vehicles.lua` calls `LuaEventManager.AddEvent`. **Arguments (2):** `IsoPlayer`, `BaseVehicle vehicle`.

- `IsoPlayer#enterExitVehicle` (Java, `zombie.characters`, line 4202): side unknown (no guard at the call, and the class does not decide it).

### OnWeaponHitCharacter

**Side:** unknown (1 call site). **Arguments (4):** `IsoGameCharacter wielder`, `IsoGameCharacter`, `HandWeapon weapon`, `float damageSplit`. **When:** Fired when a weapon hit lands on a character, just before OnPlayerGetDamage. Arguments: the attacker, the character hit, the weapon, the damage.

- `IsoGameCharacter#Hit` (Java, `zombie.characters`, line 6091): side unknown (no guard at the call, and the class does not decide it).

### OnWeaponSwing

**Side:** unknown (1 call site). **Arguments (2):** `IsoPlayer player`, `HandWeapon weapon`. **When:** Fired when a character's attack starts (SwipeStatePlayer#enter), just before the WeaponSwing hook is asked. Arguments: the character, the weapon.

- `SwipeStatePlayer#enter` (Java, `zombie.ai.states`, line 206): side unknown (no guard at the call, and the class does not decide it).

### OnZombieDead

**Side:** unknown (3 call sites). **Arguments (1):** `IsoGameCharacter`. **When:** Fired when a zombie is killed (IsoZombie#onKilled) and when a burning zombie dies from the fire (IsoGameCharacter#FireCheck, #ReduceHealthWhenBurning), with the zombie.

- `IsoGameCharacter#FireCheck` (Java, `zombie.characters`, line 5956): side unknown (no guard at the call, and the class does not decide it).
- `IsoGameCharacter#ReduceHealthWhenBurning` (Java, `zombie.characters`, line 6468): side unknown (no guard at the call, and the class does not decide it).
- `IsoZombie#onKilled` (Java, `zombie.characters`, line 5416): side unknown (no guard at the call, and the class does not decide it).

### OnZombieUpdate

**Side:** unknown (1 call site). **Arguments (1):** `IsoZombie`. **When:** Fired during a zombie's update, with that zombie.

- `IsoZombie#updateInternal` (Java, `zombie.characters`, line 3314): side unknown (no guard at the call, and the class does not decide it).

## The world, objects and weather

Events fired from the map code: squares, tile objects, containers in the world, buildings, the world map, weather and fire. (49 events)

### DoSpecialTooltip

**Side:** unknown (1 call site). **Arguments (2):** `ObjectTooltip tooltipUI`, `IsoGridSquare square`.

- `IsoObject#DoSpecialTooltip` (Java, `zombie.iso`, line 2424): side unknown (no guard at the call, and the class does not decide it).

### LoadChunk

**Side:** unknown (1 call site). **Arguments (1):** `IsoChunk`.

- `IsoChunk#doLoadGridsquare` (Java, `zombie.iso`, line 3976): side unknown (no guard at the call, and the class does not decide it).

### LoadGridsquare

**Side:** unknown (1 call site). **Arguments (1):** `IsoGridSquare square`.

- `IsoChunk#doLoadGridsquare` (Java, `zombie.iso`, line 3842): side unknown (no guard at the call, and the class does not decide it).

### OnCGlobalObjectSystemInit

**Side:** unknown (1 call site). **Arguments:** none.

- `CGlobalObjects#initSystems` (Java, `zombie.globalObjects`, line 108): side unknown (no guard at the call, and the class does not decide it).

### OnCharacterCollide

**Side:** unknown (1 call site). **Arguments (2):** `IsoMovingObject`, `IsoObject obj`.

- `IsoMovingObject#collideWith` (Java, `zombie.iso`, line 270): side unknown (no guard at the call, and the class does not decide it).

### OnClickedAnimalForContext

**Side:** unknown (1 call site). **Arguments (4):** `double player`, `KahluaTable context`, `KahluaTable clickedAnimals`, `boolean test`.

- `ISWorldObjectContextMenuLogic#createMenuEntries` (Java, `zombie.iso`, line 1058): side unknown (no guard at the call, and the class does not decide it).

### OnClimateManagerInit

**Side:** unknown (1 call site). **Arguments (1):** `ClimateManager`.

- `ClimateManager#ClimateManager` (Java, `zombie.iso.weather`, line 252): side unknown (no guard at the call, and the class does not decide it).

### OnClimateTick

**Side:** client at 1 call site, server (and single player) at 1 call site, unknown at 1 call site. **Arguments (1):** `ClimateManager`.

- `ClimateManager#update` (Java, `zombie.iso.weather`, line 873): side unknown (no guard at the call, and the class does not decide it).
- `ClimateManager#updateOLD` (Java, `zombie.iso.weather`, line 1068): client, multiplayer only; guard: inside an if on GameClient.client.
- `ClimateManager#updateOLD` (Java, `zombie.iso.weather`, line 1093): server, and in single player; guard: in the else branch, so !GameClient.client.

### OnClimateTickDebug

**Side:** client (and single player) (1 call site). **Arguments (1):** `ClimateManager`.

- `ClimateManager#update` (Java, `zombie.iso.weather`, line 903): client, and in single player; guard: inside an if on !GameServer.server.

### OnDeadBodySpawn

**Side:** client (and single player) (1 call site). **Arguments (1):** `IsoDeadBody`.

- `IsoDeadBody#IsoDeadBody` (Java, `zombie.iso.objects`, line 423): client, and in single player; guard: inside an if on !GameServer.server.

### OnDestroyIsoThumpable

**Side:** server (and single player) at 1 call site, unknown at 1 call site. **Arguments (2):** `IsoThumpable`, `null`.

- `IsoThumpable#WeaponHit` (Java, `zombie.iso.objects`, line 1198): server, and in single player; guard: in the else branch, so !GameClient.client.
- `IsoThumpable#destroy` (Java, `zombie.iso.objects`, line 1601): side unknown (no guard at the call, and the class does not decide it).

### OnDistributionMerge

**Side:** unknown (1 call site). **Arguments:** none.

- `IsoWorld#init` (Java, `zombie.iso`, line 1894): side unknown (no guard at the call, and the class does not decide it).

### OnDoTileBuilding2

**Side:** unknown (1 call site). **Arguments (6):** `?`, `boolean bRender`, `int buildX`, `int buildY`, `int buildZ`, `IsoGridSquare square`.

- `IsoCell#doBuildingInternal` (Java, `zombie.iso`, line 2619): side unknown (no guard at the call, and the class does not decide it).

### OnDoTileBuilding3

**Side:** unknown (1 call site). **Arguments (5):** `?`, `boolean bRender`, `?`, `?`, `?`.

- `IsoCell#doBuildingInternal` (Java, `zombie.iso`, line 2623): side unknown (no guard at the call, and the class does not decide it).

### OnEnterVehicle

**Side:** client at 1 call site, client (and single player) at 1 call site, unknown at 1 call site. **Arguments (1):** `IsoGameCharacter chr`.

- `IsoCell#putInVehicle` (Java, `zombie.iso`, line 4532): side unknown (no guard at the call, and the class does not decide it).
- `BaseVehicle#enterRSync` (Java, `zombie.vehicles`, line 2536): client, multiplayer only; guard: inside an if on GameClient.client.
- `ISEnterVehicle:perform` in `media/lua/client/Vehicles/TimedActions/ISEnterVehicle.lua` (Lua, line 79): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnGridBurnt

**Side:** unknown (1 call site). **Arguments (1):** `IsoGridSquare`.

- `IsoGridSquare#Burn` (Java, `zombie.iso`, line 6218): side unknown (no guard at the call, and the class does not decide it).

### OnInitModdedWeatherStage

**Side:** unknown (1 call site). **Arguments (3):** `WeatherPeriod`, `WeatherStage stage`, `?`.

- `WeatherPeriod#createStage` (Java, `zombie.iso.weather`, line 875): side unknown (no guard at the call, and the class does not decide it).

### OnInitSeasons

**Side:** unknown (1 call site). **Arguments (1):** `ErosionSeason this.season`.

- `ErosionMain#start` (Java, `zombie.erosion`, line 413): side unknown (no guard at the call, and the class does not decide it).

### OnInitWorld

**Side:** unknown (1 call site). **Arguments:** none.

- `IsoWorld#init` (Java, `zombie.iso`, line 1900): side unknown (no guard at the call, and the class does not decide it).

### OnLoadedMapZones

**Side:** unknown (1 call site). **Arguments:** none.

- `IsoWorld#init` (Java, `zombie.iso`, line 2075): side unknown (no guard at the call, and the class does not decide it).

### OnLoadedTileDefinitions

**Side:** unknown (1 call site). **Arguments (1):** `IsoSpriteManager spriteManager`.

- `IsoWorld#init` (Java, `zombie.iso`, line 1985): side unknown (no guard at the call, and the class does not decide it).

### OnLoadMapZones

**Side:** unknown (1 call site). **Arguments:** none.

- `IsoWorld#init` (Java, `zombie.iso`, line 2060): side unknown (no guard at the call, and the class does not decide it).

### OnMultiTriggerNPCEvent

**Side:** unknown (1 call site). **Arguments (3):** `?`, `?`, `?`.

- `IsoMetaCell#checkTriggers` (Java, `zombie.iso`, line 80): side unknown (no guard at the call, and the class does not decide it).

### OnNewFire

**Side:** unknown (1 call site). **Arguments (1):** `IsoFire`.

- `IsoFire#IsoFire` (Java, `zombie.iso.objects`, line 257): side unknown (no guard at the call, and the class does not decide it).

### OnNewGame

**Side:** client at 1 call site, server at 1 call site, single player only at 1 call site, unknown at 1 call site. **Arguments (2):** `IsoPlayer playerObj`, `IsoGridSquare sq`. **When:** Fired when a character starts out in the world: from IsoWorld#init, from the global addPlayerToWorld, and on the multiplayer server when a client creates its player (CreatePlayerPacket#processServer, where the square argument is nil). Arguments: the player, the square.

- `IsoWorld#init` (Java, `zombie.iso`, line 2294): client, multiplayer only; guard: inside an if on GameClient.client.
- `IsoWorld#init` (Java, `zombie.iso`, line 2405): single player only; guard: in the else branch, so !GameClient.client; guard: inside an if on !GameServer.server.
- `LuaManager.GlobalObject#addPlayerToWorld` (Java, `zombie.Lua`, line 6525): side unknown (no guard at the call, and the class does not decide it).
- `CreatePlayerPacket#processServer` (Java, `zombie.network.packets.character`, line 308): server, multiplayer only; class: packet method processServer.

### OnObjectAboutToBeRemoved

**Side:** unknown (6 call sites). **Arguments (1):** `IsoObject obj`.

- `IsoGridSquare#RemoveTileObject` (Java, `zombie.iso`, line 5752): side unknown (no guard at the call, and the class does not decide it).
- `RemoveItemFromSquarePacket#removeItemFromMap` (Java, `zombie.network.packets`, line 158): side unknown (no guard at the call, and the class does not decide it).
- `ISMoveableSpriteProps:pickUpMoveableInternal` in `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (Lua, line 1449): side unknown (no guard at the call, and the class does not decide it).
- `ISMoveableSpriteProps:pickUpMoveableInternal` in `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (Lua, line 1491): side unknown (no guard at the call, and the class does not decide it).
- `ISMoveableSpriteProps:pickUpMoveableInternal` in `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (Lua, line 1494): side unknown (no guard at the call, and the class does not decide it).
- `ISMoveableSpriteProps:pickUpMoveableInternal` in `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (Lua, line 1520): side unknown (no guard at the call, and the class does not decide it).

### OnObjectCollide

**Side:** unknown (1 call site). **Arguments (2):** `IsoMovingObject`, `IsoObject obj`.

- `IsoMovingObject#collideWith` (Java, `zombie.iso`, line 272): side unknown (no guard at the call, and the class does not decide it).

### OnPostDistributionMerge

**Side:** unknown (1 call site). **Arguments:** none.

- `IsoWorld#init` (Java, `zombie.iso`, line 1895): side unknown (no guard at the call, and the class does not decide it).

### OnPostFloorLayerDraw

**Side:** server at 1 call site, unknown at 1 call site. **Arguments (1):** `int zza`.

- `IsoCell#performRenderTiles` (Java, `zombie.iso`, line 865): side unknown (no guard at the call, and the class does not decide it).
- `ServerGUI#RenderTiles` (Java, `zombie.network`, line 407): server, multiplayer only; class: server-side network class.

### OnPostMapLoad

**Side:** unknown (1 call site). **Arguments (3):** `IsoCell cell`, `int wx`, `int wy`.

- `CellLoader#LoadCellBinaryChunk` (Java, `zombie.iso`, line 458): side unknown (no guard at the call, and the class does not decide it).

### OnPreDistributionMerge

**Side:** unknown (1 call site). **Arguments:** none.

- `IsoWorld#init` (Java, `zombie.iso`, line 1893): side unknown (no guard at the call, and the class does not decide it).

### OnRainStop

**Side:** unknown (1 call site). **Arguments:** none.

- `RainManager#stopRaining` (Java, `zombie.iso.objects`, line 267): side unknown (no guard at the call, and the class does not decide it).

### OnSafehousesChanged

**Side:** client (3 call sites). **Arguments:** none.

- `SafeHouse#addSafeHouse` (Java, `zombie.iso.areas`, line 88): client, multiplayer only; guard: inside an if on GameClient.client.
- `SafeHouse#removeSafeHouse` (Java, `zombie.iso.areas`, line 325): client, multiplayer only; guard: inside an if on GameClient.client.
- `SafehouseSyncPacket#processClient` (Java, `zombie.network.packets.safehouse`, line 106): client, multiplayer only; class: packet method processClient.

### OnSeeNewRoom

**Side:** unknown (1 call site). **Arguments (1):** `IsoRoom room`.

- `IsoCell#ProcessSpottedRooms` (Java, `zombie.iso`, line 4180): side unknown (no guard at the call, and the class does not decide it).

### OnSGlobalObjectSystemInit

**Side:** server (and single player) at 1 call site, unknown at 1 call site. **Arguments:** none.

- `SGlobalObjects#initSystems` (Java, `zombie.globalObjects`, line 94): server, and in single player; guard: inside an if on !GameClient.client.
- `WorldConverter#softreset` (Java, `zombie.iso`, line 289): side unknown (no guard at the call, and the class does not decide it).

### OnThrowableExplode

**Side:** unknown (1 call site). **Arguments (2):** `IsoTrap`, `? this.square`.

- `IsoTrap#triggerExplosion` (Java, `zombie.iso.objects`, line 425): side unknown (no guard at the call, and the class does not decide it).

### OnThunderEvent

**Side:** unknown (1 call site). **Arguments (5):** `int x`, `int y`, `boolean doStrike`, `boolean doLightning`, `boolean doRumble`.

- `ThunderStorm#enqueueThunderEvent` (Java, `zombie.iso.weather`, line 409): side unknown (no guard at the call, and the class does not decide it).

### OnTileRemoved

**Side:** unknown (1 call site). **Arguments (1):** `IsoObject obj`.

- `IsoGridSquare#RemoveTileObject` (Java, `zombie.iso`, line 5790): side unknown (no guard at the call, and the class does not decide it).

### OnTriggerNPCEvent

**Side:** unknown (1 call site). **Arguments (3):** `?`, `?`, `?`.

- `IsoMetaCell#checkTriggers` (Java, `zombie.iso`, line 77): side unknown (no guard at the call, and the class does not decide it).

### OnUpdateModdedWeatherStage

**Side:** unknown (1 call site). **Arguments (3):** `WeatherPeriod`, `WeatherStage this.currentStage`, `?`.

- `WeatherPeriod#updateCurrentStage` (Java, `zombie.iso.weather`, line 1049): side unknown (no guard at the call, and the class does not decide it).

### OnWaterAmountChange

**Side:** unknown (12 call sites). **Arguments (2):** `IsoObject`, `float old`.

- `IsoObject#emptyFluid` (Java, `zombie.iso`, line 2770): side unknown (no guard at the call, and the class does not decide it).
- `IsoObject#useFluid` (Java, `zombie.iso`, line 2831): side unknown (no guard at the call, and the class does not decide it).
- `IsoObject#addFluid` (Java, `zombie.iso`, line 2865): side unknown (no guard at the call, and the class does not decide it).
- `IsoObject#transferFluidTo` (Java, `zombie.iso`, line 2944): side unknown (no guard at the call, and the class does not decide it).
- `IsoObject#transferFluidTo` (Java, `zombie.iso`, line 2980): side unknown (no guard at the call, and the class does not decide it).
- `IsoObject#transferFluidFrom` (Java, `zombie.iso`, line 3027): side unknown (no guard at the call, and the class does not decide it).
- `IsoWorldInventoryObject#emptyFluid` (Java, `zombie.iso.objects`, line 241): side unknown (no guard at the call, and the class does not decide it).
- `IsoWorldInventoryObject#useFluid` (Java, `zombie.iso.objects`, line 258): side unknown (no guard at the call, and the class does not decide it).
- `IsoWorldInventoryObject#addFluid` (Java, `zombie.iso.objects`, line 277): side unknown (no guard at the call, and the class does not decide it).
- `IsoWorldInventoryObject#transferFluidTo` (Java, `zombie.iso.objects`, line 310): side unknown (no guard at the call, and the class does not decide it).
- `IsoWorldInventoryObject#transferFluidFrom` (Java, `zombie.iso.objects`, line 339): side unknown (no guard at the call, and the class does not decide it).
- `ObjectModDataPacket#parse` (Java, `zombie.network.packets`, line 75): side unknown (no guard at the call, and the class does not decide it).

### OnWeaponHitThumpable

**Side:** server (and single player) (5 call sites). **Arguments (3):** `IsoGameCharacter owner`, `HandWeapon weapon`, `IsoBarricade`.

- `IsoBarricade#WeaponHit` (Java, `zombie.iso.objects`, line 415): server, and in single player; guard: inside an if on !GameClient.client.
- `IsoCompost#WeaponHit` (Java, `zombie.iso.objects`, line 323): server, and in single player; guard: inside an if on !GameClient.client.
- `IsoDoor#WeaponHit` (Java, `zombie.iso.objects`, line 1283): server, and in single player; guard: in the else branch, so !GameClient.client.
- `IsoThumpable#WeaponHit` (Java, `zombie.iso.objects`, line 1168): server, and in single player; guard: in the else branch, so !GameClient.client.
- `IsoWindow#WeaponHit` (Java, `zombie.iso.objects`, line 230): server, and in single player; guard: in the else branch, so !GameClient.client.

### OnWeatherPeriodComplete

**Side:** server (and single player) (1 call site). **Arguments (1):** `WeatherPeriod`.

- `WeatherPeriod#update` (Java, `zombie.iso.weather`, line 1148): server, and in single player; guard: inside an if on !GameClient.client.

### OnWeatherPeriodStage

**Side:** server (and single player) (1 call site). **Arguments (1):** `WeatherPeriod`.

- `WeatherPeriod#update` (Java, `zombie.iso.weather`, line 1067): server, and in single player; guard: inside an if on !GameClient.client.

### OnWeatherPeriodStart

**Side:** unknown (1 call site). **Arguments (1):** `WeatherPeriod`.

- `WeatherPeriod#init` (Java, `zombie.iso.weather`, line 309): side unknown (no guard at the call, and the class does not decide it).

### OnWeatherPeriodStop

**Side:** unknown (1 call site). **Arguments (1):** `WeatherPeriod`.

- `WeatherPeriod#stopWeatherPeriod` (Java, `zombie.iso.weather`, line 439): side unknown (no guard at the call, and the class does not decide it).

### RenderOpaqueObjectsInWorld

**Side:** unknown (1 call site). **Arguments (5):** `int playerIndex`, `int buildX`, `int buildY`, `int buildZ`, `IsoGridSquare square`.

- `FBORenderCell#renderOpaqueObjectsEvent` (Java, `zombie.iso.fboRenderChunk`, line 3661): side unknown (no guard at the call, and the class does not decide it).

### ReuseGridsquare

**Side:** unknown (1 call site). **Arguments (1):** `IsoGridSquare sq`.

- `IsoChunk#doReuseGridsquares` (Java, `zombie.iso`, line 3368): side unknown (no guard at the call, and the class does not decide it).

### SetDragItem

**Side:** unknown (1 call site). **Arguments (2):** `KahluaTable draggingItem`, `int player`.

- `IsoCell#setDrag` (Java, `zombie.iso`, line 2566): side unknown (no guard at the call, and the class does not decide it).

## Items, inventory, crafting and vehicles

Events fired from the inventory, entity, crafting, script and vehicle code. (6 events)

### OnDeviceText

**Side:** unknown at 5 call sites, server at 3 call sites. **Arguments (7):** `String guid`, `String codes`, `int`, `int`, `int`, `String line`, `Radio`.

- `Radio#AddDeviceText` (Java, `zombie.inventory.types`, line 87): side unknown (no guard at the call, and the class does not decide it).
- `Radio#AddDeviceText` (Java, `zombie.inventory.types`, line 101): side unknown (no guard at the call, and the class does not decide it).
- `IsoWaveSignal#AddDeviceText` (Java, `zombie.iso.objects`, line 211): side unknown (no guard at the call, and the class does not decide it).
- `DeviceData#updateMediaPlaying` (Java, `zombie.radio.devices`, line 1479): server, multiplayer only; guard: inside an if on GameServer.server.
- `WaveSignalDevice#AddDeviceText` (Java, `zombie.radio.devices`, line 71): side unknown (no guard at the call, and the class does not decide it).
- `ZomboidRadio#DistributeTransmission` (Java, `zombie.radio`, line 769): server, multiplayer only; guard: inside an if on GameServer.server.
- `ZomboidRadio#DistributeTransmission` (Java, `zombie.radio`, line 776): server, multiplayer only; guard: inside an if on GameServer.server.
- `VehiclePart#AddDeviceText` (Java, `zombie.vehicles`, line 816): side unknown (no guard at the call, and the class does not decide it).

### OnDynamicMovableRecipe

**Side:** unknown (1 call site). **Arguments (4):** `?`, `MovableRecipe recipe`, `InventoryItem item`, `IsoGameCharacter chr`.

- `RecipeManager#getUniqueRecipeItems` (Java, `zombie.inventory`, line 154): side unknown (no guard at the call, and the class does not decide it).

### OnFillContainer

**Side:** unknown at 8 call sites, server (and single player) at 7 call sites. **Arguments (3):** `String`, `String containerType`, `ItemContainer container`.

- `ItemPickerJava#fillContainerInternal` (Java, `zombie.inventory`, line 599): server, and in single player; guard: inside an if on !GameClient.client.
- `ItemPickerJava#fillContainerInternal` (Java, `zombie.inventory`, line 607): server, and in single player; guard: inside an if on !GameClient.client.
- `ItemPickerJava#fillContainerInternal` (Java, `zombie.inventory`, line 619): server, and in single player; guard: inside an if on !GameClient.client.
- `ItemPickerJava#fillContainerInternal` (Java, `zombie.inventory`, line 637): server, and in single player; guard: inside an if on !GameClient.client.
- `ItemPickerJava#fillContainerInternal` (Java, `zombie.inventory`, line 640): server, and in single player; guard: inside an if on !GameClient.client.
- `ItemPickerJava#fillContainerInternal` (Java, `zombie.inventory`, line 660): server, and in single player; guard: inside an if on !GameClient.client.
- `ItemPickerJava#doRollItemInternal` (Java, `zombie.inventory`, line 1158): side unknown (no guard at the call, and the class does not decide it).
- `ItemPickerJava#doRollItemInternal` (Java, `zombie.inventory`, line 1170): side unknown (no guard at the call, and the class does not decide it).
- `ItemPickerJava#rollContainerItemInternal` (Java, `zombie.inventory`, line 1412): side unknown (no guard at the call, and the class does not decide it).
- `ItemPickerJava#rollContainerItemInternal` (Java, `zombie.inventory`, line 1423): side unknown (no guard at the call, and the class does not decide it).
- `ItemSpawner#spawnItem` (Java, `zombie.inventory`, line 49): side unknown (no guard at the call, and the class does not decide it).
- `ItemSpawner#spawnItem` (Java, `zombie.inventory`, line 85): side unknown (no guard at the call, and the class does not decide it).
- `IsoChunk#addItemOnGround` (Java, `zombie.iso`, line 5356): side unknown (no guard at the call, and the class does not decide it).
- `LuaManager.GlobalObject#createRandomDeadBody` (Java, `zombie.Lua`, line 10384): side unknown (no guard at the call, and the class does not decide it).
- `BaseVehicle#randomizeContainer` (Java, `zombie.vehicles`, line 8903): server, and in single player; guard: inside an if on !GameClient.client.

### OnSpawnVehicleEnd

**Side:** unknown (1 call site). **Arguments (1):** `BaseVehicle`.

- `BaseVehicle#createPhysics` (Java, `zombie.vehicles`, line 911): side unknown (no guard at the call, and the class does not decide it).

### OnSpawnVehicleStart

**Side:** unknown (1 call site). **Arguments (1):** `BaseVehicle`.

- `BaseVehicle#createPhysics` (Java, `zombie.vehicles`, line 818): side unknown (no guard at the call, and the class does not decide it).

### OnVehicleDamageTexture

**Side:** unknown (2 call sites). **Arguments (1):** `?`.

- `VehiclePart#setCondition` (Java, `zombie.vehicles`, line 882): side unknown (no guard at the call, and the class does not decide it).
- `VehiclePart#setCondition` (Java, `zombie.vehicles`, line 886): side unknown (no guard at the call, and the class does not decide it).

## Multiplayer and network

Events fired from the network code: packets arriving, commands between client and server, connection, factions, safehouses and trading. (52 events)

### AcceptedFactionInvite

**Side:** client (1 call site). **Arguments (2):** `?`, `?`.

- `FactionAcceptPacket#processClient` (Java, `zombie.network.packets.faction`, line 57): client, multiplayer only; class: packet method processClient.

### AcceptedMedicalCheck

**Side:** client at 1 call site, unknown at 1 call site. **Arguments (2):** `IsoPlayer target`, `IsoPlayer requester`.

- `LuaManager.GlobalObject#acceptMedicalCheck` (Java, `zombie.Lua`, line 9691): side unknown (no guard at the call, and the class does not decide it).
- `RequestMedicalCheckPacket#processClient` (Java, `zombie.network.packets`, line 63): client, multiplayer only; class: packet method processClient.

### AcceptedSafehouseInvite

**Side:** client (1 call site). **Arguments (2):** `?`, `?`.

- `SafehouseAcceptPacket#processClient` (Java, `zombie.network.packets.safehouse`, line 61): client, multiplayer only; class: packet method processClient.

### AcceptedTrade

**Side:** client (1 call site). **Arguments (3):** `?`, `?`, `?`.

- `RequestTradingPacket#processClient` (Java, `zombie.network.packets`, line 72): client, multiplayer only; class: packet method processClient.

### MngInvReceiveItems

**Side:** unknown (1 call site). **Arguments (1):** `KahluaTable result`.

- `PlayerInventoryPacket#receiveSendInventory` (Java, `zombie.network.packets.service`, line 162): side unknown (no guard at the call, and the class does not decide it).

### OnAddMessage

**Side:** unknown (3 call sites). **Arguments (2):** `ChatMessage msg`, `?`.

- `ChatBase#showMessage` (Java, `zombie.chat`, line 278): side unknown (no guard at the call, and the class does not decide it).
- `RadioChat#showMessage` (Java, `zombie.chat.defaultChats`, line 118): side unknown (no guard at the call, and the class does not decide it).
- `ServerChat#showMessage` (Java, `zombie.chat.defaultChats`, line 115): side unknown (no guard at the call, and the class does not decide it).

### OnAdminMessage

**Side:** client (1 call site). **Arguments (4):** `String this.message`, `int this.x`, `int this.y`, `int this.z`.

- `MessageForAdminPacket#processClient` (Java, `zombie.network.packets`, line 62): client, multiplayer only; class: packet method processClient.

### OnAlertMessage

**Side:** unknown (1 call site). **Arguments (2):** `ChatMessage msg`, `?`.

- `ServerChat#showMessage` (Java, `zombie.chat.defaultChats`, line 117): side unknown (no guard at the call, and the class does not decide it).

### OnAnimalTracks

**Side:** client (1 call site). **Arguments (2):** `?`, `AnimalTracks this.tracks`.

- `AnimalTracksPacket#processClient` (Java, `zombie.network.packets.character`, line 133): client, multiplayer only; class: packet method processClient.

### OnChatWindowInit

**Side:** unknown (1 call site). **Arguments:** none.

- `ChatManager#init` (Java, `zombie.chat`, line 127): side unknown (no guard at the call, and the class does not decide it).

### OnClientCommand

**Side:** server at 2 call sites, single player only at 1 call site. **Arguments (4):** `String module`, `String command`, `IsoPlayer player`, `KahluaTable args`. **When:** Fired where client commands are handled: on the multiplayer server when a client's command arrives (GameServer#receiveClientCommand), in single player by the in-process stand-in (SinglePlayerServer#receiveClientCommand), and directly by the global sendClientCommand when it is called on the server. Arguments: module, command, player, arguments table.

- `LuaManager.GlobalObject#sendClientCommand` (Java, `zombie.Lua`, line 8948): server, multiplayer only; guard: inside an if on GameServer.server.
- `GameServer#receiveClientCommand` (Java, `zombie.network`, line 2321): server, multiplayer only; class: server-side network class.
- `SinglePlayerServer#receiveClientCommand` (Java, `zombie.spnetwork`, line 204): single player only; class: single-player network stand-in (zombie.spnetwork).

### OnCoopServerMessage

**Side:** unknown (1 call site). **Arguments (3):** `String tag`, `String cookie`, `String payload`.

- `CoopMaster#update` (Java, `zombie.network`, line 290): side unknown (no guard at the call, and the class does not decide it).

### OnDesignationZoneUpdatedNetwork

**Side:** client (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/ISUI/ISDesignationZonePanel.lua` calls `LuaEventManager.AddEvent`. **Arguments:** none.

- `SyncZonePacket#processClient` (Java, `zombie.network.packets`, line 91): client, multiplayer only; class: packet method processClient.

### OnDisconnect

**Side:** client (1 call site). **Arguments:** none.

- `GameClient#update` (Java, `zombie.network`, line 362): client, multiplayer only; class: multiplayer client (GameClient).

### OnFishingActionMPUpdate

**Side:** client at 1 call site, server at 1 call site. **Arguments (1):** `?`.

- `FishingActionPacket#processClient` (Java, `zombie.network.packets`, line 45): client, multiplayer only; class: packet method processClient.
- `FishingActionPacket#processServer` (Java, `zombie.network.packets`, line 79): server, multiplayer only; class: packet method processServer.

### OnForagePool

**Side:** client (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/Foraging/forageClient.lua` calls `LuaEventManager.AddEvent`. **Arguments (3):** `?`, `String this.zoneId`, `KahluaTable this.icons`.

- `ForagePoolPacket#processClient` (Java, `zombie.network.packets.foraging`, line 76): client, multiplayer only; class: packet method processClient.

### OnForageRequestZone

**Side:** server (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/server/Foraging/forageServer.lua` calls `LuaEventManager.AddEvent`. **Arguments (2):** `?`, `String this.focus`.

- `ForageRequestZonePacket#processServer` (Java, `zombie.network.packets.foraging`, line 56): server, multiplayer only; class: packet method processServer.

### OnForageSpot

**Side:** server (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/server/Foraging/forageServer.lua` calls `LuaEventManager.AddEvent`. **Arguments (2):** `?`, `String this.iconID`.

- `ForageSpotPacket#processServer` (Java, `zombie.network.packets.foraging`, line 56): server, multiplayer only; class: packet method processServer.

### OnGoogleAuthRequest

**Side:** unknown (1 call site). **Arguments:** none.

- `GoogleAuthRequestPacket#processClientLoading` (Java, `zombie.network.packets.connection`, line 29): side unknown (no guard at the call, and the class does not decide it).

### OnItemFound

**Side:** server at 1 call site, server (and single player) at 1 call site. **Arguments (3):** `IsoPlayer player`, `String type`, `float distanceTraveled`.

- `LuaManager.GlobalObject#sendIconFound` (Java, `zombie.Lua`, line 11790): server, and in single player; guard: in the else branch, so !GameClient.client.
- `ForageItemFoundPacket#processServer` (Java, `zombie.network.packets.character`, line 61): server, multiplayer only; class: packet method processServer.

### onLoadModDataFromServer

**Side:** client at 1 call site, server at 1 call site. **Arguments (1):** `IsoGridSquare this.sq`.

- `ReceiveModDataPacket#processClient` (Java, `zombie.network.packets.service`, line 155): client, multiplayer only; class: packet method processClient.
- `ReceiveModDataPacket#processServer` (Java, `zombie.network.packets.service`, line 160): server, multiplayer only; class: packet method processServer.

### OnNetworkUsersReceived

**Side:** client (1 call site). **Arguments:** none.

- `NetworkUsersPacket#processClient` (Java, `zombie.network.packets`, line 99): client, multiplayer only; class: packet method processClient.

### OnObjectAdded

**Side:** unknown at 7 call sites, client at 1 call site. **Arguments (1):** `IsoObject this.obj`.

- `AddItemToMapPacket#processClient` (Java, `zombie.network.packets`, line 101): client, multiplayer only; class: packet method processClient.
- `RainCollectorBarrel:create` in `media/lua/server/RainBarrel/BuildingObjects/RainCollectorBarrel.lua` (Lua, line 29): side unknown (no guard at the call, and the class does not decide it).
- `TrapBO:create` in `media/lua/server/Traps/BuildingObjects/TrapBO.lua` (Lua, line 49): side unknown (no guard at the call, and the class does not decide it).
- `ISMoveableSpriteProps:placeMoveableInternal` in `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (Lua, line 2140): side unknown (no guard at the call, and the class does not decide it).
- `ISMoveableSpriteProps:placeMoveableInternal` in `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` (Lua, line 2541): side unknown (no guard at the call, and the class does not decide it).
- `ISDropVehicleItemAction:complete` in `media/lua/shared/TimedActions/ISDropVehicleItemAction.lua` (Lua, line 73): side unknown (no guard at the call, and the class does not decide it).
- `ISDropWorldItemAction:complete` in `media/lua/shared/TimedActions/ISDropWorldItemAction.lua` (Lua, line 107): side unknown (no guard at the call, and the class does not decide it).
- `ISTransferAction:transferItem` in `media/lua/shared/TimedActions/ISTransferAction.lua` (Lua, line 123): side unknown (no guard at the call, and the class does not decide it).

### OnQRReceived

**Side:** unknown (1 call site). **Arguments (1):** `String this.message`.

- `GoogleAuthKeyPacket#processClientLoading` (Java, `zombie.network.packets.connection`, line 124): side unknown (no guard at the call, and the class does not decide it).

### OnReceiveGlobalModData

**Side:** unknown (2 call sites). **Arguments (2):** `String tag`, `boolean`. **When:** Fired when a global mod data packet arrives. Arguments: the tag, then the table, or false when the packet carries no table.

- `GlobalModDataPacket#parse` (Java, `zombie.network.packets.service`, line 56): side unknown (no guard at the call, and the class does not decide it).
- `GlobalModDataPacket#parse` (Java, `zombie.network.packets.service`, line 62): side unknown (no guard at the call, and the class does not decide it).

### OnReceiveItemListNet

**Side:** client at 1 call site, server at 1 call site. **Arguments (5):** `IsoPlayer sender`, `ArrayList<InventoryItem> items`, `IsoPlayer receiver`, `String sessionID`, `String custom`.

- `GameClient#receiveSendItemListNet` (Java, `zombie.network`, line 2684): client, multiplayer only; class: multiplayer client (GameClient).
- `GameServer#receiveSendItemListNet` (Java, `zombie.network`, line 4066): server, multiplayer only; class: server-side network class.

### OnReceiveUserlog

**Side:** client (2 call sites). **Arguments (3):** `String this.username`, `ArrayList<Userlog> this.userLog`, `null`.

- `RequestUserLogPacket#processClient` (Java, `zombie.network.packets.service`, line 105): client, multiplayer only; class: packet method processClient.
- `RequestUserLogPacket#processClient` (Java, `zombie.network.packets.service`, line 113): client, multiplayer only; class: packet method processClient.

### OnRolesReceived

**Side:** client (1 call site). **Arguments:** none.

- `RolesPacket#processClient` (Java, `zombie.network.packets`, line 124): client, multiplayer only; class: packet method processClient.

### OnScoreboardUpdate

**Side:** client (1 call site). **Arguments (4):** `ArrayList<String> this.usernames`, `ArrayList<String> this.displayNames`, `ArrayList<String> this.steamIdsString`, `List<Short> this.pingValues`.

- `ScoreboardUpdatePacket#processClient` (Java, `zombie.network.packets.service`, line 89): client, multiplayer only; class: packet method processClient.

### OnServerCommand

**Side:** client at 1 call site, single player only at 1 call site. **Arguments (3):** `String module`, `String command`, `KahluaTable tbl`. **When:** Fired on a multiplayer client when a command from the server arrives (GameClient#receiveClientCommand), and in single player by the in-process stand-in (SinglePlayerClient#receiveServerCommand). Arguments: module, command, arguments table.

- `GameClient#receiveClientCommand` (Java, `zombie.network`, line 1078): client, multiplayer only; class: multiplayer client (GameClient).
- `SinglePlayerClient#receiveServerCommand` (Java, `zombie.spnetwork`, line 149): single player only; class: single-player network stand-in (zombie.spnetwork).

### OnServerFinishSaving

**Side:** client (1 call site). **Arguments:** none.

- `StopPausePacket#processClient` (Java, `zombie.network.packets.service`, line 39): client, multiplayer only; class: packet method processClient.

### OnServerStarted

**Side:** server (1 call site). **Arguments:** none. **When:** Fired by the dedicated server in GameServer#startServer.

- `GameServer#startServer` (Java, `zombie.network`, line 1541): server, multiplayer only; class: server-side network class.

### OnServerStartSaving

**Side:** client (1 call site). **Arguments:** none.

- `StartPausePacket#processClient` (Java, `zombie.network.packets.service`, line 39): client, multiplayer only; class: packet method processClient.

### OnSetDefaultTab

**Side:** unknown (1 call site). **Arguments (1):** `?`.

- `ChatManager#processInitPlayerChatPacket` (Java, `zombie.chat`, line 142): side unknown (no guard at the call, and the class does not decide it).

### OnTabAdded

**Side:** unknown (1 call site). **Arguments (2):** `?`, `?`.

- `ChatManager#addTab` (Java, `zombie.chat`, line 486): side unknown (no guard at the call, and the class does not decide it).

### OnTabRemoved

**Side:** unknown (1 call site). **Arguments (2):** `?`, `?`.

- `ChatManager#removeTab` (Java, `zombie.chat`, line 493): side unknown (no guard at the call, and the class does not decide it).

### OnTileObjectAdded

**Side:** client (1 call site). **Arguments (2):** `?`, `String this.spriteName`. **When:** New in 42.21. Fired on a multiplayer client when the server reports a tile object added to the map. Arguments: the square, the sprite name.

- `AddObjectToMapPacket#processClient` (Java, `zombie.network.packets`, line 69): client, multiplayer only; class: packet method processClient.

### OnWarUpdate

**Side:** client (1 call site). **Arguments:** none.

- `WarSyncPacket#processClient` (Java, `zombie.network.packets`, line 63): client, multiplayer only; class: packet method processClient.

### ReceiveFactionInvite

**Side:** client (1 call site). **Arguments (3):** `?`, `?`, `?`.

- `FactionInvitePacket#processClient` (Java, `zombie.network.packets.faction`, line 65): client, multiplayer only; class: packet method processClient.

### ReceiveSafehouseInvite

**Side:** client (1 call site). **Arguments (3):** `?`, `?`, `?`.

- `SafehouseInvitePacket#processClient` (Java, `zombie.network.packets.safehouse`, line 38): client, multiplayer only; class: packet method processClient.

### RefreshCheats

**Side:** client (1 call site). **Arguments:** none.

- `ExtraInfoPacket#processClient` (Java, `zombie.network.packets`, line 231): client, multiplayer only; class: packet method processClient.

### RequestMedicalCheck

**Side:** client at 1 call site, unknown at 1 call site. **Arguments (2):** `IsoPlayer target`, `IsoPlayer requester`.

- `LuaManager.GlobalObject#requestMedicalCheck` (Java, `zombie.Lua`, line 9679): side unknown (no guard at the call, and the class does not decide it).
- `RequestMedicalCheckPacket#processClient` (Java, `zombie.network.packets`, line 60): client, multiplayer only; class: packet method processClient.

### RequestTrade

**Side:** client (1 call site). **Arguments (2):** `?`, `?`.

- `RequestTradingPacket#processClient` (Java, `zombie.network.packets`, line 70): client, multiplayer only; class: packet method processClient.

### SendCustomModData

**Side:** server (1 call site). **Arguments:** none.

- `GetModDataPacket#processServer` (Java, `zombie.network.packets`, line 37): server, multiplayer only; class: packet method processServer.

### ServerPinged

**Side:** client (1 call site). **Arguments (2):** `String ip`, `String users`.

- `GameClient#receivePing` (Java, `zombie.network`, line 881): client, multiplayer only; class: multiplayer client (GameClient).

### SyncFaction

**Side:** client (4 call sites). **Arguments (1):** `String this.title`.

- `FactionChangeTitlePacket#processClient` (Java, `zombie.network.packets.faction`, line 69): client, multiplayer only; class: packet method processClient.
- `FactionDisbandPacket#processClient` (Java, `zombie.network.packets.faction`, line 37): client, multiplayer only; class: packet method processClient.
- `FactionStatsPacket#processClient` (Java, `zombie.network.packets.faction`, line 83): client, multiplayer only; class: packet method processClient.
- `FactionSyncPacket#processClient` (Java, `zombie.network.packets.faction`, line 75): client, multiplayer only; class: packet method processClient.

### TradingUIAddItem

**Side:** client (1 call site). **Arguments (3):** `?`, `?`, `InventoryItem this.item`.

- `TradingUIAddItemPacket#processClient` (Java, `zombie.network.packets`, line 80): client, multiplayer only; class: packet method processClient.

### TradingUIRemoveItem

**Side:** client (1 call site). **Arguments (3):** `?`, `?`, `int this.itemId`.

- `TradingUIRemoveItemPacket#processClient` (Java, `zombie.network.packets`, line 55): client, multiplayer only; class: packet method processClient.

### TradingUIUpdateState

**Side:** client (1 call site). **Arguments (3):** `?`, `?`, `TradingState this.state`.

- `TradingUIUpdateStatePacket#processClient` (Java, `zombie.network.packets`, line 60): client, multiplayer only; class: packet method processClient.

### ViewBannedIPs

**Side:** client (1 call site). **Arguments (1):** `ArrayList<DBBannedIP> result`.

- `GameClient#receiveViewBannedIPs` (Java, `zombie.network`, line 2604): client, multiplayer only; class: multiplayer client (GameClient).

### ViewBannedSteamIDs

**Side:** client (1 call site). **Arguments (1):** `ArrayList<DBBannedSteamID> result`.

- `GameClient#receiveViewBannedSteamIDs` (Java, `zombie.network`, line 2622): client, multiplayer only; class: multiplayer client (GameClient).

### ViewTickets

**Side:** client (1 call site). **Arguments (1):** `ArrayList<DBTicket> result`.

- `ViewTicketsPacket#parse` (Java, `zombie.network.packets`, line 66): client, multiplayer only; guard: inside an if on GameClient.client.

## UI, input, sound and radio

Events fired from the UI manager, the keyboard and controllers, sound, and the radio. (27 events)

### OnCreateUI

**Side:** client (and single player) (1 call site). **Arguments:** none.

- `UIManager#init` (Java, `zombie.ui`, line 271): client, and in single player; guard: inside an if on !GameServer.server.

### OnCustomUIKey

**Side:** client (and single player) (1 call site). **Arguments (1):** `int n`.

- `GameKeyboard#update` (Java, `zombie.input`, line 63): client, and in single player; class: UI or input package (inferred, see the rules).

### OnCustomUIKeyPressed

**Side:** client (and single player) (1 call site). **Arguments (1):** `int n`.

- `GameKeyboard#update` (Java, `zombie.input`, line 90): client, and in single player; class: UI or input package (inferred, see the rules).

### OnCustomUIKeyReleased

**Side:** client (and single player) (1 call site). **Arguments (1):** `int n`.

- `GameKeyboard#update` (Java, `zombie.input`, line 64): client, and in single player; class: UI or input package (inferred, see the rules).

### OnInitRecordedMedia

**Side:** unknown (1 call site). **Arguments (1):** `RecordedMedia`.

- `RecordedMedia#init` (Java, `zombie.radio.media`, line 65): side unknown (no guard at the call, and the class does not decide it).

### OnJoypadBeforeDeactivate

**Side:** client (and single player) (1 call site). **Arguments (1):** `Double`.

- `JoypadManager#onControllerDisconnected` (Java, `zombie.input`, line 588): client, and in single player; class: UI or input package (inferred, see the rules).

### OnJoypadBeforeReactivate

**Side:** client (and single player) (1 call site). **Arguments (1):** `Double`.

- `JoypadManager#onControllerConnected` (Java, `zombie.input`, line 579): client, and in single player; class: UI or input package (inferred, see the rules).

### OnJoypadDeactivate

**Side:** client (and single player) (1 call site). **Arguments (1):** `Double`.

- `JoypadManager#onControllerDisconnected` (Java, `zombie.input`, line 590): client, and in single player; class: UI or input package (inferred, see the rules).

### OnJoypadDebugRenderUIOptionSet

**Side:** client (and single player) (1 call site). **Arguments (2):** `boolean debugDrawUI`, `boolean debugDrawNavigation`.

- `JoypadManager#renderUI` (Java, `zombie.input`, line 628): client, and in single player; class: UI or input package (inferred, see the rules).

### OnJoypadReactivate

**Side:** client (and single player) (1 call site). **Arguments (1):** `Double`.

- `JoypadManager#onControllerConnected` (Java, `zombie.input`, line 581): client, and in single player; class: UI or input package (inferred, see the rules).

### OnJoypadRenderUI

**Side:** client (and single player) (1 call site). **Arguments:** none.

- `JoypadManager#renderUI` (Java, `zombie.input`, line 629): client, and in single player; class: UI or input package (inferred, see the rules).

### OnKeyKeepPressed

**Side:** client (and single player) (4 call sites). **Arguments (1):** `int n`.

- `GameKeyboard#update` (Java, `zombie.input`, line 74): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 719): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 737): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 790): client, and in single player; class: UI or input package (inferred, see the rules).

### OnKeyPressed

**Side:** client (and single player) (4 call sites). **Arguments (1):** `int n`. **When:** Mouse buttons fire it too: left as key code 10000, right as 10001, any other button as 10000 plus its number (UIManager#updateMouseButtons).

- `GameKeyboard#update` (Java, `zombie.input`, line 59): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 717): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 727): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 796): client, and in single player; class: UI or input package (inferred, see the rules).

### OnKeyStartPressed

**Side:** client (and single player) (4 call sites). **Arguments (1):** `int n`.

- `GameKeyboard#update` (Java, `zombie.input`, line 86): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 716): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 726): client, and in single player; class: UI or input package (inferred, see the rules).
- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 795): client, and in single player; class: UI or input package (inferred, see the rules).

### OnLoadRadioScripts

**Side:** unknown (1 call site). **Arguments (2):** `RadioScriptManager this.scriptManager`, `?`.

- `ZomboidRadio#Init` (Java, `zombie.radio`, line 259): side unknown (no guard at the call, and the class does not decide it).

### OnMouseDown

**Side:** client (and single player) (1 call site). **Arguments (2):** `Double`, `Double`.

- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 725): client, and in single player; class: UI or input package (inferred, see the rules).

### OnMouseMove

**Side:** client (and single player) (1 call site). **Arguments (4):** `Double`, `Double`, `Double`, `Double`.

- `UIManager#update` (Java, `zombie.ui`, line 646): client, and in single player; class: UI or input package (inferred, see the rules).

### OnMouseUp

**Side:** client (and single player) (1 call site). **Arguments (2):** `Double`, `Double`.

- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 734): client, and in single player; class: UI or input package (inferred, see the rules).

### OnMouseWheel

**Side:** client (and single player) (1 call site). **Arguments (1):** `Double`.

- `UIManager#update` (Java, `zombie.ui`, line 630): client, and in single player; class: UI or input package (inferred, see the rules).

### OnObjectLeftMouseButtonDown

**Side:** client (and single player) (1 call site). **Arguments (3):** `?`, `Double`, `Double`.

- `UIManager#update` (Java, `zombie.ui`, line 596): client, and in single player; class: UI or input package (inferred, see the rules).

### OnObjectLeftMouseButtonUp

**Side:** client (and single player) (1 call site). **Arguments (3):** `?`, `Double`, `Double`.

- `UIManager#update` (Java, `zombie.ui`, line 613): client, and in single player; class: UI or input package (inferred, see the rules).

### OnObjectRightMouseButtonDown

**Side:** client (and single player) (1 call site). **Arguments (3):** `?`, `Double`, `Double`.

- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 744): client, and in single player; class: UI or input package (inferred, see the rules).

### OnObjectRightMouseButtonUp

**Side:** client (and single player) (1 call site). **Arguments (3):** `?`, `Double`, `Double`.

- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 764): client, and in single player; class: UI or input package (inferred, see the rules).

### OnPostUIDraw

**Side:** client (and single player) (1 call site). **Arguments:** none.

- `UIManager#render` (Java, `zombie.ui`, line 379): client, and in single player; class: UI or input package (inferred, see the rules).

### OnPreUIDraw

**Side:** client (and single player) (1 call site). **Arguments:** none.

- `UIManager#render` (Java, `zombie.ui`, line 303): client, and in single player; class: UI or input package (inferred, see the rules).

### OnRightMouseDown

**Side:** client (and single player) (1 call site). **Arguments (2):** `Double`, `Double`.

- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 742): client, and in single player; class: UI or input package (inferred, see the rules).

### OnRightMouseUp

**Side:** client (and single player) (1 call site). **Arguments (2):** `Double`, `Double`.

- `UIManager#updateMouseButtons` (Java, `zombie.ui`, line 762): client, and in single player; class: UI or input package (inferred, see the rules).

## Other engine code

Events fired from the rest of the engine, including the Lua glue itself (the global functions in LuaManager). (8 events)

### OnAmbientSound

**Side:** unknown (2 call sites). **Arguments (3):** `String name`, `float x`, `float y`.

- `AmbientSoundManager.Ambient#Ambient` (Java, `zombie`, line 291): side unknown (no guard at the call, and the class does not decide it).
- `AmbientStreamManager.Ambient#Ambient` (Java, `zombie`, line 810): side unknown (no guard at the call, and the class does not decide it).

### OnModsModified

**Side:** unknown (1 call site). **Arguments:** none.

- `ZomboidFileSystem#update` (Java, `zombie`, line 1334): side unknown (no guard at the call, and the class does not decide it).

### OnTemplateTextInit

**Side:** unknown (1 call site). **Arguments:** none.

- `TemplateText#Initialize` (Java, `zombie.text.templating`, line 87): side unknown (no guard at the call, and the class does not decide it).

### OnWeaponHitTree

**Side:** server (and single player) (1 call site). **Arguments (2):** `IsoGameCharacter owner`, `HandWeapon weapon`.

- `CombatManager#processMaintenanceCheck` (Java, `zombie`, line 539): server, and in single player; guard: inside an if on !GameClient.client.

### OnWeaponHitXp

**Side:** server at 1 call site, single player only at 1 call site. **Arguments (5):** `IsoGameCharacter owner`, `HandWeapon weapon`, `IsoMovingObject hitObject`, `float damageSplit`, `int`.

- `CombatManager#attackCollisionCheck` (Java, `zombie`, line 1170): single player only; guard: inside an if on !GameServer.server and !GameClient.client.
- `WeaponHit#process` (Java, `zombie.network.fields.hit`, line 133): server, multiplayer only; guard: inside an if on GameServer.server.

### OnWeaponSwingHitPoint

**Side:** server at 1 call site, unknown at 1 call site. **Arguments (2):** `IsoGameCharacter owner`, `HandWeapon weapon`.

- `CombatManager#attackCollisionCheck` (Java, `zombie`, line 677): side unknown (no guard at the call, and the class does not decide it).
- `Player#attack` (Java, `zombie.network.fields.hit`, line 175): server, multiplayer only; guard: inside an if on GameServer.server; guard: in the else branch, so !GameClient.client.

### OnWorldSound

**Side:** unknown (1 call site). **Arguments (6):** `int x`, `int y`, `int z`, `int radius`, `int volume`, `Object source`.

- `WorldSoundManager.WorldSound#init` (Java, `zombie`, line 611): side unknown (no guard at the call, and the class does not decide it).

### OnZombieCreate

**Side:** unknown (1 call site). **Arguments (1):** `IsoZombie zombie`.

- `VirtualZombieManager#createRealZombieAlways` (Java, `zombie`, line 210): side unknown (no guard at the call, and the class does not decide it).

## Fired only from vanilla Lua

Events that no Java code fires: the vanilla Lua scripts fire them with `triggerEvent`, mostly from the UI and timed actions. Mods can fire them the same way. (22 events)

### onAddForageDefs

**Side:** unknown (1 call site). **Arguments (1):** `? forageSystem`.

- `forageSystem.init` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 729): side unknown (no guard at the call, and the class does not decide it).

### OnChallengeQuery

**Side:** client (and single player) (1 call site). **Arguments:** none.

- `MainScreen:instantiate` in `media/lua/client/OptionScreens/MainScreen.lua` (Lua, line 710): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### onDisableSearchMode

**Side:** client (and single player) (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/Foraging/ISSearchManager.lua` calls `LuaEventManager.AddEvent`. **Arguments (2):** `? self.character`, `? self.isSearchMode`.

- `ISSearchManager:toggleSearchMode` in `media/lua/client/Foraging/ISSearchManager.lua` (Lua, line 1441): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### onEnableSearchMode

**Side:** client (and single player) (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/Foraging/ISSearchManager.lua` calls `LuaEventManager.AddEvent`. **Arguments (2):** `? self.character`, `? self.isSearchMode`.

- `ISSearchManager:toggleSearchMode` in `media/lua/client/Foraging/ISSearchManager.lua` (Lua, line 1436): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnFillInventoryContextMenuNoItems

**Side:** client (and single player) (1 call site). **Not registered at start-up.** The game creates the event the first time something fires it, so a handler added before that is attached by name only once it exists. **Arguments (3):** `? playerNum`, `? context`, `? isLoot`.

- `ISInventoryPaneContextMenu.createMenuNoItems` in `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` (Lua, line 959): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnFillInventoryObjectContextMenu

**Side:** client (and single player) (1 call site). **Arguments (3):** `? player`, `? context`, `? items`.

- `ISInventoryPaneContextMenu.createMenu` in `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` (Lua, line 935): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### onFillSearchIconContextMenu

**Side:** client (and single player) (1 call site). **Arguments (2):** `? contextMenu`, `? self`.

- `ISBaseIcon:doContextMenu` in `media/lua/client/Foraging/ISBaseIcon.lua` (Lua, line 151): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnFillWorldObjectContextMenu

**Side:** client (and single player) (1 call site). **Arguments (4):** `? player`, `? context`, `? worldobjects`, `? test`.

- `ISWorldObjectContextMenu.createMenu` in `media/lua/client/ISUI/ISWorldObjectContextMenu.lua` (Lua, line 213): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnPreFillInventoryContextMenuNoItems

**Side:** client (and single player) (1 call site). **Not registered at start-up.** The game creates the event the first time something fires it, so a handler added before that is attached by name only once it exists. **Arguments (3):** `? playerNum`, `? context`, `? isLoot`.

- `ISInventoryPaneContextMenu.createMenuNoItems` in `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` (Lua, line 951): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnPreFillInventoryObjectContextMenu

**Side:** client (and single player) (1 call site). **Arguments (3):** `? player`, `? context`, `? items`.

- `ISInventoryPaneContextMenu.createMenu` in `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` (Lua, line 374): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnPreFillWorldObjectContextMenu

**Side:** client (and single player) (1 call site). **Arguments (4):** `? player`, `? context`, `? worldobjects`, `? test`.

- `ISWorldObjectContextMenu.createMenu` in `media/lua/client/ISUI/ISWorldObjectContextMenu.lua` (Lua, line 190): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnRefreshInventoryWindowContainers

**Side:** client (and single player) (4 call sites). **Arguments (2):** `? self`, `string`.

- `ISInventoryPage:refreshBackpacks` in `media/lua/client/ISUI/ISInventoryPage.lua` (Lua, line 1560): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISInventoryPage:refreshBackpacks` in `media/lua/client/ISUI/ISInventoryPage.lua` (Lua, line 1795): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISInventoryPage:refreshBackpacks` in `media/lua/client/ISUI/ISInventoryPage.lua` (Lua, line 1802): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISInventoryPage:refreshBackpacks` in `media/lua/client/ISUI/ISInventoryPage.lua` (Lua, line 1906): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnSourceWindowFileReload

**Side:** client (and single player) (1 call site). **Arguments:** none.

- `SourceWindow:reloadFile` in `media/lua/client/DebugUIs/SourceWindow.lua` (Lua, line 29): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### OnSpawnRegionsLoaded

**Side:** server (and single player) (1 call site). **Arguments (1):** `? regions`.

- `SpawnRegionMgr.getSpawnRegions` in `media/lua/shared/SpawnRegions.lua` (Lua, line 90): server, and in single player; guard: inside an if on not isClient().

### OnSwitchVehicleSeat

**Side:** client (and single player) (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/Vehicles/ISUI/ISVehicleDashboard.lua` calls `LuaEventManager.AddEvent`. **Arguments (1):** `? self.character`.

- `ISSwitchVehicleSeat:perform` in `media/lua/client/Vehicles/TimedActions/ISSwitchVehicleSeat.lua` (Lua, line 57): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### onToggleSearchMode

**Side:** client (and single player) (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/Foraging/ISSearchManager.lua` calls `LuaEventManager.AddEvent`. **Arguments (2):** `? self.character`, `? self.isSearchMode`.

- `ISSearchManager:toggleSearchMode` in `media/lua/client/Foraging/ISSearchManager.lua` (Lua, line 1445): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

### onUpdateIcon

**Side:** unknown at 3 call sites, client (and single player) at 2 call sites, server (and single player) at 1 call site. **Arguments (3):** `? _zoneData`, `? _iconID`, `? _icon`.

- `forageClient.updateIcon` in `media/lua/client/Foraging/forageClient.lua` (Lua, line 35): client, and in single player; guard: after an early return, so not isServer().
- `ISForageIcon:doSearchFocusCheck` in `media/lua/client/Foraging/ISForageIcon.lua` (Lua, line 99): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.
- `ISSearchManager:doMoveIcon` in `media/lua/client/Foraging/ISSearchManager.lua` (Lua, line 759): server, and in single player; guard: after an early return, so not isClient().
- `forageSystem.recreateIcons` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 1038): side unknown (no guard at the call, and the class does not decide it).
- `forageSystem.debugRefreshZone` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 1071): side unknown (no guard at the call, and the class does not decide it).
- `forageSystem.actionComplete` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 2381): side unknown (no guard at the call, and the class does not decide it).

### preAddCatDefs

**Side:** unknown (1 call site). **Arguments (1):** `? forageSystem`.

- `forageSystem.init` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 718): side unknown (no guard at the call, and the class does not decide it).

### preAddForageDefs

**Side:** unknown (1 call site). **Arguments (1):** `? forageSystem`.

- `forageSystem.init` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 712): side unknown (no guard at the call, and the class does not decide it).

### preAddItemDefs

**Side:** unknown (1 call site). **Arguments (1):** `? forageSystem`.

- `forageSystem.init` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 725): side unknown (no guard at the call, and the class does not decide it).

### preAddSkillDefs

**Side:** unknown (1 call site). **Arguments (1):** `? forageSystem`.

- `forageSystem.init` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 715): side unknown (no guard at the call, and the class does not decide it).

### preAddZoneDefs

**Side:** unknown (1 call site). **Arguments (1):** `? forageSystem`.

- `forageSystem.init` in `media/lua/shared/Foraging/forageSystem.lua` (Lua, line 721): side unknown (no guard at the call, and the class does not decide it).

## Registered but never fired

The game registers these names at start-up, so `Events.Name.Add` works, but in this build neither the Java code nor the vanilla Lua fires them. A handler added to one of them runs only if a mod fires the event itself. (35 events)

### OnAddBuilding

**Side:** not fired in this build.

### OnAIStateEnter

**Side:** not fired in this build.

### OnAIStateExecute

**Side:** not fired in this build.

### OnAIStateExit

**Side:** not fired in this build.

### OnBeingHitByZombie

**Side:** not fired in this build.

### OnChangeWeather

**Side:** not fired in this build.

### OnCharacterCreateStats

**Side:** not fired in this build.

### OnCharacterMeet

**Side:** not fired in this build.

### OnDawn

**Side:** not fired in this build.

### OnDoTileBuilding

**Side:** not fired in this build.

### OnDusk

**Side:** not fired in this build.

### OnIsoThumpableLoad

**Side:** not fired in this build.

### OnIsoThumpableSave

**Side:** not fired in this build.

### OnLoginState

**Side:** not fired in this build.

### OnLoginStateSuccess

**Side:** not fired in this build.

### OnMakeItem

**Side:** not fired in this build.

### OnMapLoadCreateIsoObject

**Side:** not fired in this build.

### OnMovingObjectCrop

**Side:** not fired in this build.

### OnNewSurvivorGroup

**Side:** not fired in this build.

### OnNPCSurvivorUpdate

**Side:** not fired in this build.

### OnOverrideSearchManager

**Side:** not fired in this build.

### OnPlayerSetSafehouse

**Side:** not fired in this build.

### OnPostCharactersSquareDraw

**Side:** not fired in this build.

### OnPostFloorSquareDraw

**Side:** not fired in this build.

### OnPostTileDraw

**Side:** not fired in this build.

### OnPostTilesSquareDraw

**Side:** not fired in this build.

### OnPostWallSquareDraw

**Side:** not fired in this build.

### OnPreGameStart

**Side:** not fired in this build.

### OnRadioInteraction

**Side:** not fired in this build.

### OnRainStart

**Side:** not fired in this build.

### OnRenderUpdate

**Side:** not fired in this build.

### OnServerCustomizationDataReceived

**Side:** not fired in this build.

### OnServerStatisticReceived

**Side:** not fired in this build.

### OnWorldMessage

**Side:** not fired in this build.

### SyncFactionServer

**Side:** not fired in this build.

## Fired with a name chosen at run time

5 call sites fire an event whose name is not written in the code, so they cannot be tied to one event. They are the global `triggerEvent` functions that vanilla Lua and mods call:

- `LuaManager.GlobalObject#triggerEvent` (line 5268)
- `LuaManager.GlobalObject#triggerEvent` (line 5276)
- `LuaManager.GlobalObject#triggerEvent` (line 5284)
- `LuaManager.GlobalObject#triggerEvent` (line 5292)
- `LuaManager.GlobalObject#triggerEvent` (line 5300)

## Hooks are not events

The game also keeps 8 hooks in `LuaHookManager`: `AutoDrink`, `UseItem`, `Attack`, `CalculateStats`, `ContextualAction`, `WeaponHitCharacter`, `WeaponSwing`, `WeaponSwingHitPoint`. A hook gives an answer back: `LuaHookManager.TriggerHook` returns true or false from the Lua handlers, and the Java code that called it branches on that answer. An event returns nothing. They are listed here so you can tell the two apart; they are not in the event list.

> **Proof:** Code. zombie.Lua.LuaHookManager#AddEvents and #TriggerHook. Build 42.21 (revision 4a0e9546ec).
