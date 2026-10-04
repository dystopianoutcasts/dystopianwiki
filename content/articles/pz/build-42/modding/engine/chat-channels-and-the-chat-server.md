---
id: build-42-chat-channels-and-the-chat-server
slug: chat-channels-and-the-chat-server
title: 'Chat: the channels, the chat server and what Lua can do with it'
game: pz
version: build-42
section: modding
category: engine
difficulty: intermediate
tags:
  - engine
  - chat
  - multiplayer
  - server
  - lua-api
excerpt: >-
  Multiplayer chat is a Java chat server, a Java client manager and a Lua chat
  window. The nine channels, how far say and shout carry, where the bad-word
  filter, slow mode and the character limit really live, why typing makes no
  noise for zombies, and what a mod can and cannot send.
last_updated: '2026-10-04'
related_articles:
  - the-events-system
  - lua-global-functions
  - lua-classes-network
  - lua-events
---
# Chat: the channels, the chat server and what Lua can do with it

Outcast, chat looks like the simplest thing in the game: you type, people read. Underneath are three pieces in two languages, and some of what the server settings promise is enforced by the chat window on each player's own computer rather than by the server. If you are writing a chat mod, or running a server and wondering what your chat settings really do, this page walks through it from the Build 42.21 code.

## What it does for the player

In multiplayer you get tabs and channels: local talk (`/say`), shouting (`/yell`), general chat for the whole server (`/all`), private messages (`/whisper`), faction and safehouse chat, admin chat, radio, and server messages. Say and shout also appear as speech bubbles over your head. In single player there is no chat window; what you say only shows as a bubble.

## Where it lives

| Piece | Where | Side |
|---|---|---|
| The chat server | `zombie.network.chat.ChatServer` | Dedicated server: owns the chats, their members, the filter |
| The client manager | `zombie.chat.ChatManager` | Each player's game: its own copy of the chats it has joined |
| The channels | `zombie.chat.ChatBase` and `zombie.chat.defaultChats.*` (`GeneralChat`, `SayChat`, `ShoutChat`, `WhisperChat`, `FactionChat`, `SafehouseChat`, `RadioChat`, `AdminChat`, `ServerChat`) | Both |
| The window | `media/lua/client/Chat/ISChat.lua` | Client Lua |
| The channel list | `zombie.network.chat.ChatType` | Both |

The nine channel types are `general`, `whisper`, `say`, `shout`, `faction`, `safehouse`, `radio`, `admin` and `server`.

> **Proof:** Code. `zombie.network.chat.ChatServer`, `zombie.chat.ChatManager`, `zombie.chat.ChatBase` and `zombie.chat.defaultChats`, `zombie.network.chat.ChatType` (the nine values plus `notDefined`), `media/lua/client/Chat/ISChat.lua`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A message, from keyboard to screen

1. You press Enter in the chat window (whose text box is already capped at the character limit). `ISChat` checks the slow-mode timer, strips line breaks unless your role allows them, works out the channel from the prefix (`/s`, `/y`, `/all` and so on), and calls a global Lua function: `processSayMessage`, `processShoutMessage`, `processGeneralMessage`, `proceedFactionMessage`, `processSafehouseMessage`, `processAdminChatMessage` or `proceedPM` for a whisper. Any other line starting with `/` goes to the server as a command.
2. The global calls `ChatManager#sendMessageToChat`. It **shows your message to you straight away**, then sends it to the server. If a two-way radio you carry or stand near is on, unmuted and able to transmit, a say or shout is also sent out on its channel; how it travels from there is in [radio and television](/pz/build-42/modding/engine/radio-and-television).
3. On the server, `ChatServer#processMessageFromPlayerPacket` drops the message if that channel is switched off, runs the bad-word filter (below), replaces bad words, and sends it to the chat's members.
4. Say and shout go only to members within range: **30 tiles for say, 60 for shout**, measured flat on the map, so floors do not block them. Every other channel goes to all its members. The sender is always skipped, because they already saw it in step 2.
5. Each receiving client shows it in its tab and fires the Lua event `OnAddMessage`, and for say and shout puts it in a speech bubble over the speaker.

> **Proof:** Code. `media/lua/client/Chat/ISChat.lua`, `ISChat:onCommandEntered` (slow mode, `EmptyLinesInChat` capability, prefixes, the `process...` calls, `SendCommandToServer` for other `/` lines) and `ISChat:createChildren` (`setMaxTextLength(getServerOptions():getInteger("ChatMessageCharacterLimit"))`); `zombie.Lua.LuaManager` globals `processSayMessage`, `processShoutMessage`, `processGeneralMessage`, `proceedFactionMessage`, `processSafehouseMessage`, `processAdminChatMessage`, `proceedPM`; `zombie.chat.ChatManager#sendMessageToChat(ChatBase, ChatMessage)` (`chat.showMessage` first, then `sendToServer`, then the radio copy when `getTransmittingRadio()` is set; `zombie.core.raknet.VoiceManagerData.RadioData#isTransmissionAvailable` and the radios `zombie.core.raknet.VoiceManager` collects from the player and nearby squares); `zombie.network.chat.ChatServer#processMessageFromPlayerPacket`; `zombie.chat.defaultChats.SayChat#getDefaultSettings` (`setRange(30.0F)`), `ShoutChat#getDefaultSettings` (`setRange(60.0F)`), `RangeBasedChat#sendMessageToChatMembers` (skips the author, `ChatUtility.getDistance` uses x and y only); `zombie.chat.ChatBase#sendMessageToChatMembers` (skips the author), `#showMessage` (`OnAddMessage`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Which channels exist, and who is in them

The server creates general, say, shout, radio, admin and server chats at start, on two tabs (main and admin). When a player connects, `ChatServer#initPlayer` puts them in the default chats, in admin chat if their role has the `AdminChat` capability, and in their faction's and safehouse's chats if they have them. Faction and safehouse chats are created and their member lists kept in step as factions and safehouses change. A whisper creates a two-person chat the first time you message someone.

The server option **`ChatStreams`** (default `s,r,a,w,y,sh,f,all`) switches channels on and off: `s` say, `r` radio, `a` admin, `w` whisper, `y` shout, `sh` safehouse, `f` faction, and `all` general, which also needs **`GlobalChat`** on. Server messages are always on. With **`DiscordEnable`**, general chat is relayed to and from the server's Discord bot. With **`AnnounceDeath`**, the server posts "*name* is dead." in server chat. The server writes every message it handles to its `chat` log file in the `Logs` folder.

> **Proof:** Code. `zombie.network.chat.ChatServer#init` (the six chats, tabs `main` and `admin`, `discordEnable`, `LoggerManager.createLogger("chat", ...)`), `#initPlayer` (`Capability.AdminChat`, faction, safehouse), `#syncFactionChatMembers`, `#syncSafehouseChatMembers`, `#processPlayerStartWhisperChatPacket`, `#sendMessageFromDiscordToGeneralChat`; `zombie.chat.ChatUtility#getAllowedChatStreams` (the letters; `server` always added; `all` only with `globalChat`); `zombie.network.ServerOptions` (`ChatStreams` default `s,r,a,w,y,sh,f,all`, `GlobalChat` true, `DiscordEnable` false, `AnnounceDeath` false); `zombie.characters.IsoGameCharacter` (`announceDeath` posts `username + " is dead."`); `zombie.core.logger.ZLogger` (writes `<name>.txt` under the cache `Logs` folder). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What the server enforces, and what only the chat window does

This matters for server owners as much as modders:

| Setting | Enforced where |
|---|---|
| `ChatStreams`, `GlobalChat` (channel on or off) | **Server** (message dropped) and the window |
| Bad-word filter: `BadWordListFile`, `GoodWordListFile`, `BadWordPolicy`, `BadWordReplacement` | **Server** |
| `ChatMessageSlowModeTime` (seconds between messages) | **Only the chat window** (client Lua) |
| `ChatMessageCharacterLimit` | **Only the chat window** (the text box's maximum length) |
| Line breaks stripped (unless the role has `EmptyLinesInChat`) | **Only the chat window** |

Neither the slow-mode time nor the character limit is read anywhere in the Java code, server or client: they exist only as `getServerOptions():getInteger(...)` calls in `ISChat.lua`. A player whose chat window has been replaced (by a mod, for example) is not held to them.

**`BadWordPolicy` has three working values, not four.** The tooltip offers "1 - ban, 2 - kick, 3 - record the violation in the database, 4 - mute", but the option is declared with three values. Setting it to 4 is rejected with an error in the log and the old value is kept. (The code behind "mute" is also inverted: it would only act when the sender cannot be found, and then fail.) The default, 3, logs the offence; with any policy, the bad words are replaced by `BadWordReplacement` (default `[HIDDEN]`) before anyone else sees the message. The sender still sees their own original text, because their window showed it before it reached the server.

> **Proof:** Code. `zombie.network.chat.ChatServer#processMessageFromPlayerPacket` (`chatStreamEnabled`, `WordsFilter#searchText`, the `badWordPolicy` switch, `hideBadWords` with `badWordReplacement`; bytecode confirms case 4 calls `setAllChatMuted` only when `findPlayer` returned null); `zombie.network.ServerOptions` (`chatMessageCharacterLimit` and `chatMessageSlowModeTime` declared and read nowhere else in the Java source; `BadWordPolicy` declared as `EnumServerOption(this, "BadWordPolicy", 3, 3)`; `BadWordReplacement` default `[HIDDEN]`); `zombie.config.EnumConfigOption` (values 1 to the count) and `zombie.config.IntegerConfigOption#setValue` (out of range logs an error and keeps the value); `media/lua/shared/Translate/EN/UI.json` (`UI_ServerOption_BadWordPolicy_tooltip`); `media/lua/client/Chat/ISChat.lua` (the only reads of `ChatMessageSlowModeTime` and `ChatMessageCharacterLimit`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Typing makes no noise for zombies

Each say and shout chat carries a "zombie attraction range" (say sets 15 tiles; shout falls back to its 60-tile range), and each say or shout message is flagged "should attract zombies". In 42.21, nothing reads either: no code path from chat adds a world sound. What does make noise is the **shout key**, `IsoGameCharacter#Callout`: a 30-tile sound (90 with a megaphone, 6 or 18 when sneaking), plus the shouted line over your head. So `/yell HELP` in chat is silent to zombies; pressing the shout key is not.

> **Proof:** Code. `zombie.chat.defaultChats.SayChat#getDefaultSettings` (`setZombieAttractionRange(15.0F)`), `zombie.chat.ChatSettings#getZombieAttractionRange` (falls back to the range); `ChatBase#getZombieAttractionRange` has no caller, and `ChatMessage#isShouldAttractZombies` is read only by `RadioChat#packMessage`; no class in `zombie.chat` or `zombie.network.chat` references `WorldSoundManager`; `zombie.characters.IsoGameCharacter#Callout` (`radius = bMegaphone ? 90 : 30`, sneaking `bMegaphone ? 18 : 6`, then `WorldSoundManager.instance.addSound`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

We have read this, not measured it. The test: a dedicated server, a zombie standing idle 10 tiles away behind a wall, and a player typing `/yell` several times, then pressing the shout key once; by the code only the key turns the zombie.

> **Proof:** Unknown. "Chat makes no zombie noise" is read from the code; no game test or server log yet. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- **Sending as the player** (client): the globals `processSayMessage`, `processShoutMessage`, `processGeneralMessage`, `proceedFactionMessage`, `processSafehouseMessage`, `processAdminChatMessage`, `proceedPM`, and `checkPlayerCanUseChat("/say")` to ask whether a channel is open to you ([global functions, P](/pz/build-42/modding/reference/lua-global-functions#p) and [C](/pz/build-42/modding/reference/lua-global-functions#c)).
- **Reading:** the client events `OnAddMessage(message, tabID)`, `OnAlertMessage`, `OnChatWindowInit`, `OnSetDefaultTab`, `OnTabAdded`, `OnTabRemoved` ([events reference](/pz/build-42/modding/reference/lua-events#onaddmessage)). The message is a [ChatMessage](/pz/build-42/modding/reference/lua-classes-network#chatmessage) with `getText`, `getAuthor`, `getChat` and the rest.
- **The window:** `ISChat` is ordinary client Lua, so a mod can wrap `ISChat.addLineInChat` or `ISChat:onCommandEntered` the usual way.
- **Not exposed:** `ChatServer` and `ChatManager`. Only `ChatBase`, `ChatMessage` and `ServerChatMessage` are on the [network classes page](/pz/build-42/modding/reference/lua-classes-network).

## What a mod can and cannot change, and the traps

- **No Lua function posts a server message.** With `ChatServer` out of reach, a server-side mod cannot write into server chat directly. The admin command `/servermsg` does it (it needs the `DisplayServerMessage` capability); for anything else the usual route is `sendServerCommand` to the clients and client-side Lua that shows the text.
- **In single player, `OnAddMessage` never fires.** Single-player chats have no tab, and say and shout are marked not to show in chat there, so the event has nothing to report. Test chat mods on a server.
- **Your own message reaches your `OnAddMessage` unfiltered.** The client shows it before the server filters it; other players receive the filtered text.
- **Server settings you cannot rely on.** If your mod replaces the chat window, it takes over slow mode, the character limit and the line-break rule, because those live only in `ISChat`.
- **The admin chat check differs by side.** The server lets a role into admin chat by the `AdminChat` capability, but the client's `checkPlayerCanUseChat("/admin")`, which the window uses when you press Tab to cycle channels, asks whether the role is literally named `admin`. A custom role with the capability can be in admin chat yet be skipped by that cycling.

> **Proof:** Code. `zombie.Lua.LuaManager` (the chat globals; no global calls `ChatServer`); `zombie.commands.serverCommands.ServerMessageCommand` (`servermsg`, `Capability.DisplayServerMessage`, `sendServerAlertMessageToServerChat`); `zombie.chat.ChatManager#init` (single-player chats created without tabs; `OnChatWindowInit` only in multiplayer), `zombie.chat.ChatBase#showMessage` (`this.chatTab != null`), `zombie.chat.defaultChats.RangeBasedChat#createMessage` (`setShowInChat(false)` in `ChatMode.SinglePlayer`); `zombie.chat.ChatManager#isPlayerCanUseChat` (`admin` uses `player.isAccessLevel("admin")`), `zombie.characters.IsoPlayer#isAccessLevel` (compares the role's name), `zombie.network.chat.ChatServer#initPlayer` (`hasCapability(Capability.AdminChat)`); `media/lua/client/Chat/ISChat.lua`, `ISChat.onSwitchStream` (the Tab-cycling loop calls `checkPlayerCanUseChat`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [The Events system](/pz/build-42/modding/lua-api/the-events-system) for hooking `OnAddMessage`.
- [The chat classes on the network reference page](/pz/build-42/modding/reference/lua-classes-network).
- [Radio and television](/pz/build-42/modding/engine/radio-and-television): where a say or shout goes once a two-way radio picks it up.
