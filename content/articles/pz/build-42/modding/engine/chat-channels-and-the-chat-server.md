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
  Multiplayer chat is a Java server, a client manager and a Lua window. The nine channels, how far say and shout carry, what the server enforces in 42.22, and why typing is silent to zombies.
last_updated: '2026-11-21'
related_articles:
  - the-events-system
  - lua-global-functions
  - lua-classes-network
  - lua-events
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players](#1-what-it-does-for-the-player) | [server owners](#4-what-the-server-enforces-and-what-only-the-chat-window-does) | [modders](#7-what-lua-can-reach)

:::callout[The 1-minute version]{kind=key}
- Outcast, in multiplayer you get tabs and channels: say, shout, general, whisper, faction, safehouse, admin, radio and server messages. In single player there is no chat window; what you say only shows as a bubble.
- Say reaches players within 30 tiles and shout within 60, measured flat on the map. Everything else goes to all members of that channel.
- The server enforces which channels are on, the bad-word filter, who is allowed to post where, and that a message comes from a player on that connection.
- Slow mode and the character limit are enforced only by the chat window on each player's computer. A role with the `IgnoreChatSlowMode` capability skips slow mode in the window.
- Typing in chat makes no noise for zombies, as the code reads. The shout key does.
- A mod cannot call the chat server from Lua, and no Lua function posts a server message.
:::

:::facts
- **Channel types** 9: `general`, `whisper`, `say`, `shout`, `faction`, `safehouse`, `radio`, `admin`, `server`
- **Say range** 30 tiles; **shout range** 60 tiles
- **Shout key** 30-tile sound (6 when sneaking), or 90 with a megaphone (18 when sneaking)
- **Default `ChatStreams`** `s,r,a,w,y,sh,f,all`
- **Character limit** 64 to 1024, default 200; **slow mode** 1 to 30 seconds, default 3
- **`BadWordPolicy`** 3 values, default 3 (log it)
:::

## 1. What it does for the player

In multiplayer you get tabs and channels, and what you type goes to whichever channel the tab or the command prefix names.

You have local talk (`/say`), shouting (`/yell`), general chat for the whole server (`/all`), private messages (`/whisper`), faction and safehouse chat, admin chat, radio, and server messages. Say and shout also appear as speech bubbles over your head. In single player there is no chat window; what you say only shows as a bubble. Outcast, chat looks like the simplest thing in the game, but some of what the server settings promise is enforced by the chat window on your own computer rather than by the server.

## 2. Where it lives

Chat is three pieces in two languages: a server, a client manager and a Lua window.

| Piece | Where | Side | Code |
|---|---|---|---|
| The chat server | `zombie.network.chat.ChatServer` | Dedicated server: owns the chats, their members, the filter | `zombie/network/chat/ChatServer.java:82-122` |
| The client manager | `zombie.chat.ChatManager` | Each player's game: its own copy of the chats it has joined | `zombie/chat/ChatManager.java:119-131` |
| The channels | `zombie.chat.ChatBase` and `zombie.chat.defaultChats.*` (`GeneralChat`, `SayChat`, `ShoutChat`, `WhisperChat`, `FactionChat`, `SafehouseChat`, `RadioChat`, `AdminChat`, `ServerChat`) | Both | `zombie/chat/ChatBase.java:290-317` |
| The window | `media/lua/client/Chat/ISChat.lua` | Client Lua | `media/lua/client/Chat/ISChat.lua:465-545` |
| The channel list | `zombie.network.chat.ChatType` | Both | `zombie/network/chat/ChatType.java:11-20` |

The nine channel types are `general`, `whisper`, `say`, `shout`, `faction`, `safehouse`, `radio`, `admin` and `server`, plus an internal `notDefined`. :cite[(`zombie/network/chat/ChatType.java:11-20`)]

## 3. A message, from keyboard to screen

A message you type is shown to you at once, then sent to the server, which filters it and sends it to the members in range.

1. You press Enter in the chat window, whose text box is already capped at the character limit. :cite[(`media/lua/client/Chat/ISChat.lua:179`)] `ISChat` checks the slow-mode timer (a role with the `IgnoreChatSlowMode` capability skips it), strips line breaks unless your role has `EmptyLinesInChat`, and works out the channel from the prefix, such as `/s`, `/y` or `/all`. :cite[(`media/lua/client/Chat/ISChat.lua:465-515`)]
2. It then calls a global Lua function: `processSayMessage`, `processShoutMessage`, `processGeneralMessage`, `proceedFactionMessage`, `processSafehouseMessage`, `processAdminChatMessage` or `proceedPM` for a whisper. Any other line starting with `/` goes to the server as a command. :cite[(`media/lua/client/Chat/ISChat.lua:515-542`, `zombie/Lua/LuaManager.java:11292-11400`)]
3. The global calls `ChatManager#sendMessageToChat`. It **shows your message to you straight away**, then sends it to the server. :cite[(`zombie/chat/ChatManager.java:454-470`)] If a two-way radio you carry or stand near is on and unmuted and able to transmit, a say or shout is also sent out on its channel; how it travels from there is in [radio and television](/pz/build-42/modding/engine/radio-and-television). :cite[(`zombie/chat/ChatManager.java:464-472`)]
4. On the server, `ChatServer#processMessageFromPlayerPacket` handles the packet. :cite[(`zombie/network/GameServer.java:1988`, `zombie/network/chat/ChatServer.java:169-214`)] In 42.22 it first drops a message for an unknown chat, from a connection that is not a member of that chat, or addressed to the server chat, and one whose author is not a player on that connection. Then it drops the message if that channel is switched off, runs the bad-word filter (section 4), replaces bad words, and sends it to the chat's members. :cite[(`zombie/network/chat/ChatServer.java:173-209`)]
5. Say and shout go only to members within range: **30 tiles for say, 60 for shout**, measured flat on the map, so floors do not block them. :cite[(`zombie/chat/defaultChats/SayChat.java:53`, `zombie/chat/defaultChats/ShoutChat.java:49`, `zombie/chat/defaultChats/RangeBasedChat.java:78-86`)] Every other channel goes to all its members. :cite[(`zombie/chat/ChatBase.java:290-301`)]
6. Since 42.22 the server sends each message once per network connection (not once per player), and skips the sender's whole connection, because the sender already saw it in step 3. :cite[(`zombie/chat/ChatBase.java:303-317`)]
7. Each receiving client shows it in its tab and fires the Lua event `OnAddMessage`, and for say and shout puts it in a speech bubble over the speaker. :cite[(`zombie/chat/ChatBase.java:279-284`, `zombie/chat/defaultChats/RangeBasedChat.java:88-94`)]

## 4. What the server enforces, and what only the chat window does

Some settings are enforced by the server, and some only by the chat window on each player's computer.

| Setting | Enforced where | Code |
|---|---|---|
| `ChatStreams`, `GlobalChat` (channel on or off) | **Server** (message dropped) and the window | `zombie/network/chat/ChatServer.java:181-183`, `zombie/chat/ChatUtility.java:187-230` |
| Bad-word filter: `BadWordListFile`, `GoodWordListFile`, `BadWordPolicy`, `BadWordReplacement` | **Server** | `zombie/network/chat/ChatServer.java:184-205`, `zombie/network/ServerOptions.java:199-200` |
| Who may post to which chat, and the author check | **Server** | `zombie/network/chat/ChatServer.java:173-179` |
| `ChatMessageSlowModeTime` (seconds between messages) | **Only the chat window** (client Lua) | `media/lua/client/Chat/ISChat.lua:466-469`, `media/lua/client/Chat/ISChat.lua:526` |
| `ChatMessageCharacterLimit` | **Only the chat window** (the text box's maximum length) | `media/lua/client/Chat/ISChat.lua:179` |
| Line breaks stripped (unless the role has `EmptyLinesInChat`) | **Only the chat window** | `media/lua/client/Chat/ISChat.lua:476-481` |

Neither the slow-mode time nor the character limit is read anywhere in the Java code, server or client: they exist only as `getServerOptions():getInteger(...)` calls in `ISChat.lua`. :cite[(`zombie/network/ServerOptions.java:220-221`, `media/lua/client/Chat/ISChat.lua:179`, `media/lua/client/Chat/ISChat.lua:526`, `media/lua/client/Chat/ISChat.lua:1121`)] A player whose chat window has been replaced (by a mod, for example) is not held to them. The options' ranges are 64 to 1024 for the character limit (default 200) and 1 to 30 seconds for slow mode (default 3). :cite[(`zombie/network/ServerOptions.java:220-221`)]

**`BadWordPolicy` has three values, and "mute" cannot be set.** The tooltip offers "1 - ban, 2 - kick, 3 - record the violation in the database, 4 - mute", but the option is declared with three values, so setting it to 4 is rejected with an error in the log and the old value is kept. :cite[(`media/lua/shared/Translate/EN/UI.json:1300`, `zombie/network/ServerOptions.java:201`)] The `case 4` branch in 42.22 now mutes the sender and drops the message when the sender is found (42.21 had it inverted, so it only ran when the sender was missing), but nothing can reach it while the option stops at 3. :cite[(`zombie/network/chat/ChatServer.java:196-201`)] The default, 3, logs the offence; with any policy, the bad words are replaced by `BadWordReplacement` (default `[HIDDEN]`) before anyone else sees the message. :cite[(`zombie/network/chat/ChatServer.java:193-205`, `zombie/network/ServerOptions.java:202`)] The sender still sees their own original text, because their window showed it before it reached the server. :cite[(`zombie/chat/ChatManager.java:462`)]

## 5. Which channels exist, and who is in them

The server creates six chats at start, puts each player in the default ones when they connect, and keeps faction and safehouse chats in step.

At start it creates general, say, shout, radio, admin and server chats, on two tabs (main and admin). :cite[(`zombie/network/chat/ChatServer.java:82-122`)] When a player connects, `ChatServer#initPlayer` puts them in the default chats, in admin chat if their role has the `AdminChat` capability, and in their faction's and safehouse's chats if they have them. :cite[(`zombie/network/chat/ChatServer.java:124-167`)] Faction and safehouse chats are created and their member lists kept in step as factions and safehouses change. :cite[(`zombie/network/chat/ChatServer.java:320-346`, `zombie/network/chat/ChatServer.java:390-456`)] A whisper creates a two-person chat the first time you message someone, and the server checks that the sender is a player on that connection. :cite[(`zombie/network/chat/ChatServer.java:216-249`)]

The server option **`ChatStreams`** (default `s,r,a,w,y,sh,f,all`) switches channels on and off. The letters are `s` for say, `r` radio, `a` admin, `w` whisper, `y` shout, `sh` safehouse, `f` faction, and `all` general, which also needs **`GlobalChat`** on (default true). Server messages are always enabled. :cite[(`zombie/chat/ChatUtility.java:187-225`, `zombie/network/ServerOptions.java:47-48`)]

With **`DiscordEnable`** (default false), general chat is relayed to and from the server's Discord bot. :cite[(`zombie/network/ServerOptions.java:118`, `zombie/network/chat/ChatServer.java:89-90`, `zombie/network/chat/ChatServer.java:508-523`)] With **`AnnounceDeath`** (default false), the server posts "*name* is dead." in server chat. :cite[(`zombie/network/ServerOptions.java:85`, `zombie/characters/IsoGameCharacter.java:2080-2081`)] The server writes every message it handles to its `chat` log file in the `Logs` folder. :cite[(`zombie/network/chat/ChatServer.java:84-85`)]

## 6. Typing makes no noise for zombies

Chat messages carry a "zombie attraction" setting, but nothing reads it, so typing makes no sound that zombies hear.

Each say chat carries a "zombie attraction range" of 15 tiles (shout falls back to its 60-tile range), and each say or shout message is flagged "should attract zombies". :cite[(`zombie/chat/defaultChats/SayChat.java:54`, `zombie/chat/ChatSettings.java:212-214`, `zombie/chat/defaultChats/RangeBasedChat.java:67`)] In 42.22, nothing reads the range, and the flag is read only when a radio message is packed, so no code path from chat adds a world sound. :cite[(`zombie/chat/ChatBase.java:150-151`, `zombie/chat/defaultChats/RadioChat.java:148`)] We searched the `zombie.chat` and `zombie.network.chat` packages and found no reference to `WorldSoundManager`.

What does make noise is the **shout key**, `IsoGameCharacter#Callout`: a 30-tile sound (90 with a megaphone, 6 or 18 when sneaking), scaled by a shout item's multiplier when you wear or hold one and are not sneaking, plus the shouted line over your head. :cite[(`zombie/characters/IsoGameCharacter.java:5140-5153`, `zombie/characters/IsoGameCharacter.java:5170-5192`, `zombie/characters/IsoGameCharacter.java:5205-5222`)] So `/yell HELP` in chat is silent to zombies; pressing the shout key is not.

We have read this, not measured it. The test: a dedicated server, a zombie standing idle 10 tiles away behind a wall, and a player typing `/yell` several times, then pressing the shout key once; by the code only the key turns the zombie.

## 7. What Lua can reach

Lua can send as the player and read what arrives, but it has no handle on the chat server.

- **Sending as the player** (client): the globals `processSayMessage`, `processShoutMessage`, `processGeneralMessage`, `proceedFactionMessage`, `processSafehouseMessage`, `processAdminChatMessage`, `proceedPM`, and `checkPlayerCanUseChat("/say")` to ask whether a channel is open to you ([global functions, P](/pz/build-42/modding/reference/lua-global-functions#p) and [C](/pz/build-42/modding/reference/lua-global-functions#c)). :cite[(`zombie/Lua/LuaManager.java:11292-11420`)]
- **Reading:** the client events `OnAddMessage(message, tabID)`, `OnAlertMessage`, `OnChatWindowInit`, `OnSetDefaultTab`, `OnTabAdded`, `OnTabRemoved` ([events reference](/pz/build-42/modding/reference/lua-events#onaddmessage)). The message is a [ChatMessage](/pz/build-42/modding/reference/lua-classes-network#chatmessage) with `getText`, `getAuthor`, `getChat` and the rest. :cite[(`zombie/chat/ChatBase.java:279-284`, `zombie/chat/ChatManager.java:119-131`)]
- **The window:** `ISChat` is ordinary client Lua, so a mod can wrap `ISChat.addLineInChat` or `ISChat:onCommandEntered` the usual way. :cite[(`media/lua/client/Chat/ISChat.lua:465`, `media/lua/client/Chat/ISChat.lua:707`, `media/lua/client/Chat/ISChat.lua:1176`)]
- **Not exposed:** `ChatServer` and `ChatManager`. Only `ChatBase`, `ChatMessage` and `ServerChatMessage` are on the [network classes page](/pz/build-42/modding/reference/lua-classes-network). :cite[(`zombie/Lua/LuaManager.java:2676-2678`)]

## 8. What a mod can and cannot change, and the traps

A server-side mod cannot write into server chat directly, and a replaced chat window takes over the limits that live only in the window.

- **No Lua function posts a server message.** With `ChatServer` out of reach, a server-side mod cannot write into server chat directly. The admin command `/servermsg` does it (it needs the `DisplayServerMessage` capability); for anything else the usual route is `sendServerCommand` to the clients and client-side Lua that shows the text. :cite[(`zombie/commands/serverCommands/ServerMessageCommand.java:21-44`)]
- **In single player, `OnAddMessage` never fires.** Single-player chats have no tab, and say and shout are marked not to show in chat there, so the event has nothing to report. Test chat mods on a server. :cite[(`zombie/chat/ChatBase.java:279-284`, `zombie/chat/defaultChats/RangeBasedChat.java:59-69`)]
- **Your own message reaches your `OnAddMessage` unfiltered.** The client shows it before the server filters it; other players receive the filtered text. :cite[(`zombie/chat/ChatManager.java:462`, `zombie/chat/ChatBase.java:279-284`, `zombie/network/chat/ChatServer.java:205`)]
- **Limits that live only in the window.** If your mod replaces the chat window, it takes over slow mode, the character limit and the line-break rule, because those live only in `ISChat`. :cite[(`media/lua/client/Chat/ISChat.lua:466-481`)]
- **The admin chat check differs by side.** The server lets a role into admin chat by the `AdminChat` capability, but the client's `checkPlayerCanUseChat("/admin")`, which the window uses when you press Tab to cycle channels, asks whether the role is literally named `admin`. A custom role with the capability can be in admin chat yet be skipped by that cycling. :cite[(`zombie/network/chat/ChatServer.java:140-142`, `zombie/chat/ChatManager.java:370-386`, `zombie/characters/IsoPlayer.java:7586-7588`, `media/lua/client/Chat/ISChat.lua:578`)]
- **The server now checks the author.** A message whose author is not a player on the connection it arrived on is dropped, and so is a client post to the server chat. This is a server-side check; mods cannot loosen it. :cite[(`zombie/network/chat/ChatServer.java:175-179`)]
- **Split-screen.** The welcome message is shown once per join, and the whisper chat now matches any local split-screen player's name when it works out which side is "me". :cite[(`zombie/chat/ChatManager.java:429-433`, `zombie/chat/defaultChats/WhisperChat.java:103-130`)]

:::callout[How we know]{kind=proof}
Everything above was read from the 42.22 decompiled code (capture B42_3d39148846) and the vanilla Lua in the same capture; the delta to 42.21 shows the per-connection sending, the author and membership checks and the corrected mute branch. Not tested in a game or a server log: that chat makes no zombie noise (the test is in section 6), and the split-screen behavior.
:::

## 9. Where to go next

- [The Events system](/pz/build-42/modding/lua-api/the-events-system) for hooking `OnAddMessage`.
- [The chat classes on the network reference page](/pz/build-42/modding/reference/lua-classes-network).
- [Radio and television](/pz/build-42/modding/engine/radio-and-television): where a say or shout goes once a two-way radio picks it up.
